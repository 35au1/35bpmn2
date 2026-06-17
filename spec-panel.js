// spec-panel.js — SPEC document view (Polish prose format)

let _specVisible = false;

function toggleSpecPanel() {
  _specVisible = !_specVisible;
  const panel = document.getElementById('spec-panel');
  if (_specVisible) {
    buildSpecPanel();
    panel.style.display = 'flex';
  } else {
    panel.style.display = 'none';
  }
  // Close when clicking the backdrop (outside the popup)
  panel.onclick = (e) => { if (e.target === panel) toggleSpecPanel(); };
}

function buildSpecPanel() {
  const content = document.getElementById('spec-content');
  content.innerHTML = '';

  const elements = editor.elements;
  const arrows   = editor.arrows;
  const registry = window._subprocessRegistry || {};

  // ── Helpers ───────────────────────────────────────────────────────────────
  const nameOf   = (id) => { const el = elements.find(e => e.id === id); return el ? el.title : '(brak)'; };
  const elById   = (id) => elements.find(e => e.id === id);
  const outgoing = (id) => arrows.filter(a => a.start === id);
  const incoming = (id) => arrows.filter(a => a.end === id);

  // Follow chain of system elements (system_action, decision-x) starting from
  // a given element id, collect prose sentences until hitting a user/end/start element.
  // Returns array of HTML sentence strings.
  function collectSystemChainProse(startId, visited = new Set()) {
    const sentences = [];
    let cur = startId;
    while (cur && !visited.has(cur)) {
      visited.add(cur);
      const el = elById(cur);
      if (!el) break;

      if (el.type === 'system_action') {
        sentences.push(`Kolejnym krokiem tego przejścia jest <strong>${el.title}</strong>.`);
        const nexts = outgoing(cur);
        cur = nexts.length ? nexts[0].end : null;

      } else if (el.type === 'decision-x' || el.type === 'decision-plus') {
        const branches = outgoing(cur);
        const conditionNames = branches.map(a => `ścieżką <strong>${a.label || a._button || '(brak warunku)'}</strong>`);
        sentences.push(`Podczas systemowej akcji podejmowania decyzji o wyborze ścieżki - system dokonuje oceny czy warunek <strong>${el.title}</strong> powinien być procesowany ${conditionNames.join(' czy ')}.`);

        branches.forEach(branch => {
          const target = elById(branch.end);
          const targetName = target ? target.title : '(brak)';
          sentences.push(`Wybór ścieżki <strong>${branch.label || branch._button || '(brak warunku)'}</strong> powoduje przejście do <strong>${targetName}</strong>.`);
          if (target && (target.type === 'system_action' || target.type === 'decision-x' || target.type === 'decision-plus')) {
            const sub = collectSystemChainProse(branch.end, new Set(visited));
            sentences.push(...sub);
          }
        });
        break;

      } else {
        break;
      }
    }
    return sentences;
  }

  // Build topological order by Y position
  const sorted = [...elements].sort((a, b) => a.y - b.y);

  // Determine "last" user process elements — those whose outgoing connections
  // lead only to end elements (no further user stages)
  const isLastUserStage = (el) => {
    if (el.type !== 'process') return false;
    const outs = outgoing(el.id);
    const nonEndTargets = outs
      .map(a => elById(a.end))
      .filter(t => t && t.type !== 'end' && t.type !== 'system_action' && t.type !== 'decision-x');
    // Check if following system chains leads only to end
    const reachable = new Set();
    const visit = (id) => {
      if (reachable.has(id)) return;
      reachable.add(id);
      const t = elById(id);
      if (!t) return;
      if (t.type === 'system_action' || t.type === 'decision-x' || t.type === 'decision-plus') {
        outgoing(id).forEach(a => visit(a.end));
      }
    };
    outs.forEach(a => visit(a.end));
    const reachableEls = [...reachable].map(id => elById(id)).filter(Boolean);
    const hasUserSuccessor = reachableEls.some(e => e.type === 'process');
    return !hasUserSuccessor;
  };

  // ── Render each element ───────────────────────────────────────────────────
  sorted.forEach(el => {

    // ── START ─────────────────────────────────────────────────────────────
    if (el.type === 'start') {
      const outs = outgoing(el.id);
      // trigger = button or trigger field from outgoing connection
      const triggerParts = outs.map(a => a._button || a._trigger || 'brak informacji').filter(Boolean);
      const trigger = triggerParts.length ? triggerParts.join(', ') : 'brak informacji';
      // validations
      const validations = outs.map(a => a._validation).filter(v => v && v.trim());
      const validationText = validations.length ? validations.join(', ') : 'brak walidacji';

      const section = document.createElement('div');
      section.className = 'spec-section';
      section.innerHTML = `
        <div class="spec-section-header">
          <span class="spec-section-title">${el.title}</span>
          <span class="spec-type-tag spec-type-start">Start</span>
        </div>
        <div class="spec-story">
          <div class="spec-field">
            <div class="spec-field-value">
              Workflow aplikacji inicjuje utworzenie formularza na skutek akcji wykonanej przez: <strong>${trigger}</strong>.
              Warunki wykonania akcji: <strong>${validationText}</strong>.
            </div>
          </div>
        </div>`;
      content.appendChild(section);
      return;
    }

    // ── END ───────────────────────────────────────────────────────────────
    if (el.type === 'end') {
      // Described inline within the last user stage — skip standalone rendering
      return;
    }

    // ── SYSTEM elements — skip standalone, described within user sections ──
    if (el.type === 'system_action' || el.type === 'decision-x' || el.type === 'decision-plus') {
      return;
    }

    // ── USER ACTION PROCESS ───────────────────────────────────────────────
    if (el.type === 'process') {
      const userName   = el._userAssigned || 'brak definicji';
      const csvId      = el._csvId;
      const reg        = registry[csvId];
      const isLast     = isLastUserStage(el);
      const outs       = outgoing(el.id);

      // Collect buttons from outgoing connections
      const buttons = outs
        .filter(a => a._button && a._button.trim())
        .map(a => a._button.trim());
      const uniqueButtons = [...new Set(buttons)];

      // Build prose lines
      const lines = [];

      lines.push(`Formularz użytkownika znajduje się na etapie <strong>${el.title}</strong>.`);
      lines.push(`Użytkownikiem posiadającym uprawnienia edycji i akcji jest <strong>${userName}</strong>.`);
      lines.push(`Użytkownik posiada możliwość edycji formularza zgodnie z konfiguracją elementów formularza dla wskazanego głównego właściciela etapu (pola i elementy w trybie read only oraz pola i elementy w trybie edycji).`);

      // Subprocesses
      if (reg && reg.elements.length) {
        // Build subprocess chains
        const outMap = {};
        reg.connections.forEach(c => {
          if (!outMap[c.source_csv_id]) outMap[c.source_csv_id] = [];
          outMap[c.source_csv_id].push(c);
        });
        const hasIncomingSp = new Set(reg.connections.map(c => c.target_csv_id));
        const spStarts = reg.elements.filter(e => !hasIncomingSp.has(e.csvId));

        // Collect subprocess action names (from start elements, which are named after the action)
        const spActionNames = spStarts.map(s => s.title).filter(Boolean);
        if (spActionNames.length) {
          lines.push(`Użytkownik ma możliwość wykonania akcji w ramach tego etapu wniosku, przed przesłaniem na kolejny etap. Lista tych akcji to: <strong>${spActionNames.join(', ')}</strong>.`);

          // For each subprocess, describe its steps — only if more than 1 element in chain
          spStarts.forEach(startEl => {
            const steps = [];
            let cur = startEl.csvId;
            const visited = new Set();
            while (cur && !visited.has(cur)) {
              visited.add(cur);
              const spEl = reg.elements.find(e => e.csvId === cur);
              if (spEl) steps.push(spEl.title);
              const nexts = outMap[cur] || [];
              cur = nexts.length ? nexts[0].target_csv_id : null;
            }
            // exclude start/end wrapper — show only middle steps
            const actionSteps = steps.filter((s, i) => i > 0 && i < steps.length - 1);
            // only list if there are actual middle steps (more than just start→end)
            if (actionSteps.length >= 2) {
              lines.push(`Akcja <strong>${startEl.title}</strong> polega na realizacji w kolejności poniższych czynności: <strong>${actionSteps.join(', ')}</strong>.`);
            }
          });
        }
      }

      // Buttons list
      if (uniqueButtons.length) {
        lines.push(`Użytkownik ma możliwość przejść na kolejny etap formularza poprzez dostępne w interface przyciski: <strong>${uniqueButtons.join(', ')}</strong>.`);

        // For each button — validation sentence + follow system chain after it
        uniqueButtons.forEach(btn => {
          const btnArrow = outs.find(a => a._button === btn);
          if (!btnArrow) return;

          // Validation sentence
          const validation = btnArrow._validation && btnArrow._validation.trim();
          if (validation) {
            lines.push(`Kliknięcie przycisku <strong>${btn}</strong> uruchamia systemowe walidacje o nazwie <strong>${validation}</strong>, których celem jest weryfikacja jakości danych przed przesłaniem na kolejny etap. W przypadku braku przejścia przez wymagane sprawdzenia - użytkownik otrzymuje informację o konieczności poprawienia danych formularza.`);
          }

          // System chain prose
          const targetEl = elById(btnArrow.end);
          if (!targetEl) return;
          if (targetEl.type === 'system_action' || targetEl.type === 'decision-x' || targetEl.type === 'decision-plus') {
            const prose = collectSystemChainProse(btnArrow.end);
            if (prose.length) {
              lines.push(`Użycie przycisku <strong>${btn}</strong> powoduje wykonanie następujących akcji systemowych w następującej kolejności:`);
              prose.forEach(s => lines.push(s));
            }
          }
        });
      }

      // Last stage sentence
      if (isLast) {
        lines.push(`Ustawienie etapu formularza na <strong>${el.title}</strong> kończy procesowanie formularza przez użytkownika dla tego przebiegu.`);
      }

      // Build section
      const section = document.createElement('div');
      section.className = 'spec-section';

      // Header — no lock icon displayed
      const hdr = document.createElement('div');
      hdr.className = 'spec-section-header';
      hdr.innerHTML = `<span class="spec-section-title">${el.title}</span><span class="spec-type-tag spec-type-process">User action stage</span>`;
      section.appendChild(hdr);

      // Prose body
      const body = document.createElement('div');
      body.className = 'spec-story';
      const field = document.createElement('div');
      field.className = 'spec-field';
      const val = document.createElement('div');
      val.className = 'spec-field-value';
      val.style.lineHeight = '2';
      val.style.overflowWrap = 'break-word';
      val.style.wordBreak = 'break-word';
      val.style.maxWidth = '100%';
      val.innerHTML = lines.map(l => `<p style="margin:0 0 8px;word-break:break-word;white-space:normal;overflow-wrap:break-word;display:block">${l}</p>`).join('');
      field.appendChild(val);
      body.appendChild(field);
      section.appendChild(body);

      content.appendChild(section);
      return;
    }

    // ── Anything else (comment, external) — simple fallback ───────────────
    const section = document.createElement('div');
    section.className = 'spec-section';
    section.innerHTML = `<div class="spec-section-header"><span class="spec-section-title">${el.title}</span></div>`;
    content.appendChild(section);
  });
}

// kept for backward compat
function makeConnList(label, arrs, getOther, getLabel) {
  const div = document.createElement('div');
  div.className = 'spec-conn-list';
  const lbl = document.createElement('div');
  lbl.className = 'spec-conn-label';
  lbl.textContent = label;
  div.appendChild(lbl);
  const ul = document.createElement('ul');
  arrs.forEach(a => {
    const li = document.createElement('li');
    const ltext = getLabel(a);
    li.innerHTML = `<span class="spec-conn-name">${getOther(a)}</span>` +
      (ltext !== '—' ? ` <span class="spec-conn-tag">${ltext}</span>` : '');
    ul.appendChild(li);
  });
  div.appendChild(ul);
  return div;
}

function makeField(label, value) {
  const div = document.createElement('div');
  div.className = 'spec-field';
  div.innerHTML = `<div class="spec-field-label">${label}</div><div class="spec-field-value">${value}</div>`;
  return div;
}
