// ai-chat.js — AI workflow editor (clipboard mode)
// Send button copies prompt to clipboard. Load Response parses AI reply.
// ─────────────────────────────────────────────────────────────────────────────
// FOR ONLINE MODE: keep the ONLINE INTEGRATION block at the bottom of this file.
// FOR OFFLINE MODE: delete everything from "// === ONLINE INTEGRATION START ==="
//                  to the end of the file. That's all — nothing else to change.
// ─────────────────────────────────────────────────────────────────────────────

// ── In-memory CSV state ───────────────────────────────────────────────────────
let _csvElements    = [];
let _csvConnections = [];

document.addEventListener('DOMContentLoaded', () => {
  const loadBtn = document.getElementById('load-btn');
  if (loadBtn) {
    loadBtn.addEventListener('click', () => {
      const eFile = document.getElementById('elements-file').files[0];
      const cFile = document.getElementById('connections-file').files[0];
      if (!eFile || !cFile) return;
      setTimeout(async () => {
        try {
          const [eText, cText] = await Promise.all([
            new Promise((res, rej) => { const r = new FileReader(); r.onload = e => res(e.target.result); r.onerror = rej; r.readAsText(eFile); }),
            new Promise((res, rej) => { const r = new FileReader(); r.onload = e => res(e.target.result); r.onerror = rej; r.readAsText(cFile); })
          ]);
          _csvElements    = parseCSV(eText);
          _csvConnections = parseCSV(cText);
          logMsg(`CSV captured: ${_csvElements.length} elements, ${_csvConnections.length} connections.`, 'sys');
        } catch (e) {
          console.warn('[ai-chat] Could not capture CSV files:', e);
        }
      }, 200);
    });
  }
});

// ── Default system prompt ─────────────────────────────────────────────────────
const DEFAULT_SYSTEM_PROMPT = `You are a JSON generator. You output ONLY raw JSON. No explanations. No summaries. No markdown. No code fences. No file names. No bullet points. No text before or after. Your entire response must start with { and end with }. Any character outside the JSON object is forbidden.

The JSON must have exactly this structure:
{
  "elements": [
    {
      "element_id": "unique string e.g. START_001",
      "element_name": "display name",
      "element_type": "one of: start, end, user_action_process, system_decision, system_action",
      "lock_keyword": "lock_noterasable or lock_noteditable — only for user_action_process, empty string otherwise",
      "user_assigned": "role name — only for user_action_process, empty string otherwise",
      "comment_text": "system background action description for system_action elements, empty string otherwise",
      "text_below": "",
      "parent": "element_id of parent user_action_process if this is a subprocess element, empty string otherwise"
    }
  ],
  "connections": [
    {
      "connection_id": "unique string e.g. CONN_001",
      "source_element_id": "element_id of source",
      "target_element_id": "element_id of target",
      "condition": "text for system_decision outgoing paths, empty string otherwise",
      "connection_type": "normal or conditional",
      "button": "button label if trigger is button, empty string otherwise",
      "validation": "validation rule or empty string",
      "trigger": "one of: button, time, await",
      "parent": "element_id of parent user_action_process if this connection belongs to a subprocess, empty string otherwise"
    }
  ]
}

Element type rules:
- start: workflow beginning. lock_keyword and user_assigned must be empty.
- end: workflow termination point after the last user_action_process. lock_keyword and user_assigned must be empty.
- user_action_process: a stage where a human actively works on a form. Requires non-empty lock_keyword (lock_noterasable or lock_noteditable) and non-empty user_assigned.
- system_decision: system evaluates a condition and routes to 2+ paths. Must have at least 2 outgoing connections, all connection_type: conditional, each with a different non-empty condition value. lock_keyword and user_assigned must be empty.
- system_action: system performs one background action. Has exactly 1 outgoing connection with connection_type: normal. Description goes in comment_text. lock_keyword and user_assigned must be empty.

Connection rules:
- trigger: "button" when a user clicks a button (button field required); "await" for system/automatic transitions; "time" for time-based triggers.
- condition: only for outgoing connections from system_decision elements.
- connection_type: "conditional" for all outgoing connections from system_decision; "normal" for everything else.

Subprocess rules:
- Actions that happen entirely within one user_action_process stage are modelled as subprocesses.
- Each subprocess has its own start and end element, both with parent = the containing user_action_process element_id.
- The subprocess start and end element_name should describe the subprocess action.
- All elements and connections belonging to a subprocess have parent = the containing user_action_process element_id.
- Connections between the parent user_action_process and its subprocess elements are FORBIDDEN.
- system_decision and system_action elements on the transition path between two user_action_process stages in the main flow have parent = empty string.

General rules:
- Keep all existing element_id and connection_id values unless explicitly told to change them.
- For new elements use the same naming convention as existing ones (e.g. PROC_004, DEC_003, CONN_012).
- If introducing a new element before or after an existing element, modify/delete old connections between surrounding elements accordingly.
- Returning to an existing stage is NEVER a new element — draw a direct arrow back.
- A finalized/closed form state is a user_action_process followed by an end element — never model it as end directly.
- Lock constraints: lock_noteditable = cannot rename, change fields, delete, or add/remove connections. lock_noterasable = cannot delete or orphan, but may edit name and fields.
- All element_id and connection_id values must be unique across the entire JSON.

IMPORTANT: Output ONLY the JSON object. Start your response with { and end with }. Nothing else.`;

// ── Panel toggle ──────────────────────────────────────────────────────────────
const _chatPanel  = document.getElementById('ai-chat-panel');
const _chatHeader = document.getElementById('ai-chat-header');
const _chatToggle = document.getElementById('ai-chat-toggle');
const _chatStatus = document.getElementById('ai-chat-status');

_chatHeader.addEventListener('click', () => {
  if (_chatPanel.classList.contains('collapsed')) {
    _chatPanel.classList.remove('collapsed');
    _chatToggle.textContent = '▼';
    document.getElementById('canvas-container').style.paddingBottom = '260px';
  } else {
    _chatPanel.classList.add('collapsed');
    _chatToggle.textContent = '▲';
    document.getElementById('canvas-container').style.paddingBottom = '34px';
  }
});

_chatHeader.addEventListener('dblclick', (e) => {
  e.stopPropagation();
  const isExpanded = _chatPanel.classList.toggle('expanded');
  document.getElementById('canvas-container').style.paddingBottom = isExpanded ? '520px' : '260px';
});

document.getElementById('ai-system-prompt').value = DEFAULT_SYSTEM_PROMPT;

// ── Chat log ──────────────────────────────────────────────────────────────────
const _chatLog = document.getElementById('ai-chat-log');
function logMsg(text, type = 'sys') {
  const div = document.createElement('div');
  div.className = `msg ${type}`;
  div.textContent = text;
  _chatLog.appendChild(div);
  _chatLog.scrollTop = _chatLog.scrollHeight;
}

// ── Build prompt ──────────────────────────────────────────────────────────────
function buildPrompt(instruction) {
  const cleanElements    = _csvElements.map(({ _col, _parent, ...rest }) => rest);
  const cleanConnections = _csvConnections.map(({ _parent, ...rest }) => rest);
  const systemPrompt     = document.getElementById('ai-system-prompt').value.trim();
  return `${systemPrompt}\n\n--- CURRENT DIAGRAM ---\n${JSON.stringify({ elements: cleanElements, connections: cleanConnections }, null, 2)}\n\n--- USER INSTRUCTION ---\n${instruction}`;
}

// ── Copy Prompt ───────────────────────────────────────────────────────────────
async function copyPromptToClipboard(instruction) {
  if (!instruction) { logMsg('Type your instruction first.', 'err'); return; }
  if (_csvElements.length === 0) { logMsg('No diagram loaded. Load CSV files first.', 'err'); return; }
  const fullPrompt = buildPrompt(instruction);
  try {
    await navigator.clipboard.writeText(fullPrompt);
    logMsg('Prompt copied. Paste into AI, copy response, click Load Response.', 'sys');
    logMsg('You: ' + instruction, 'user');
  } catch {
    const ta = document.createElement('textarea');
    ta.value = fullPrompt;
    ta.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:80vw;height:60vh;z-index:9999;background:#111;color:#ccc;font-size:12px;padding:12px;border:1px solid #444;border-radius:6px;';
    document.body.appendChild(ta); ta.select();
    logMsg('Clipboard blocked — copy manually from the popup.', 'err');
    ta.addEventListener('blur', () => ta.remove()); ta.focus();
  }
}

document.getElementById('ai-chat-copy').addEventListener('click', async () => {
  await copyPromptToClipboard(document.getElementById('ai-chat-input').value.trim());
});

// ── Send — default: copy prompt (offline behavior) ───────────────────────────
document.getElementById('ai-chat-send').addEventListener('click', async () => {
  await copyPromptToClipboard(document.getElementById('ai-chat-input').value.trim());
});

document.getElementById('ai-chat-input').addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); document.getElementById('ai-chat-send').click(); }
});

// ── Load Response ─────────────────────────────────────────────────────────────
document.getElementById('ai-chat-load').addEventListener('click', async () => {
  let raw = '';
  try { raw = await navigator.clipboard.readText(); }
  catch { raw = prompt('Paste the AI response here:') || ''; }
  if (!raw.trim()) { logMsg('Clipboard is empty.', 'err'); return; }
  parseAndLoad(raw);
});

// ── Parse and reload diagram ──────────────────────────────────────────────────
function parseAndLoad(raw) {
  try {
    const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fence) raw = fence[1].trim();
    const j = raw.indexOf('{'), k = raw.lastIndexOf('}');
    if (j === -1 || k === -1) throw new Error('No JSON object found');
    raw = raw.slice(j, k + 1);
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.elements) || !Array.isArray(parsed.connections))
      throw new Error('Missing elements or connections arrays');
    loadDiagramFromAI(parsed.elements, parsed.connections);
    logMsg(`Loaded: ${parsed.elements.length} elements, ${parsed.connections.length} connections.`, 'ai');
    document.getElementById('ai-chat-input').value = '';
  } catch (err) {
    logMsg('Parse error: ' + err.message, 'err');
  }
}

// ── Reload diagram from AI JSON ───────────────────────────────────────────────
function loadDiagramFromAI(elements, connections) {
  _csvElements    = elements.map(e => Object.assign({}, e));
  _csvConnections = connections.map(c => Object.assign({}, c));

  const topElements    = elements.filter(e => !e.parent || e.parent === '');
  const topConnections = connections.filter(c => !c.parent || c.parent === '');

  const positions = computeLayout(topElements, topConnections);
  assignElementColors(elements);

  editor.elements = []; editor.arrows = [];
  editor.history = []; editor.historyIndex = -1;
  editor.selectedElement = null; editor.selectedArrow = null;

  window._subprocessRegistry = {};
  elements.filter(e => e.parent && e.parent !== '').forEach(e => {
    if (!window._subprocessRegistry[e.parent])
      window._subprocessRegistry[e.parent] = { elements: [], connections: [] };
    window._subprocessRegistry[e.parent].elements.push({
      id: Date.now() + Math.floor(Math.random() * 1e6),
      csvId: e.element_id, type: mapType(e.element_type),
      title: e.element_name || e.element_id,
      _userAssigned: e.user_assigned || '', _lock: e.lock_keyword || ''
    });
  });
  connections.filter(c => c.parent && c.parent !== '').forEach(c => {
    const reg = window._subprocessRegistry[c.parent];
    if (reg) reg.connections.push({
      source_csv_id: c.source_element_id, target_csv_id: c.target_element_id,
      label: c.button || c.condition || '', trigger: c.trigger || ''
    });
  });

  const elementRightEdge = e => {
    const pos = positions[e.element_id]; if (!pos) return 0;
    if (e.element_type === 'user_action_process') return pos.x + 90;
    if (e.element_type === 'process_selection_by_system') return pos.x + 50;
    return pos.x + 20;
  };
  const farX = Math.max(...topElements.map(elementRightEdge), 400) + 120;
  window._diagramFarX = farX;

  const idMap = {};
  topElements.forEach(e => {
    const numId = Date.now() + Math.floor(Math.random() * 1e6);
    idMap[e.element_id] = numId;
    const pos = positions[e.element_id];
    editor.elements.push({
      id: numId, type: mapType(e.element_type), x: pos.x, y: pos.y,
      title: e.element_name || e.element_id,
      expanded: false, subElements: [], minimized: false,
      _csvId: e.element_id, _userAssigned: e.user_assigned || '',
      _lock: e.lock_keyword || '', _parent: ''
    });
  });

  const backwardConns = [], forwardConns = [];
  topConnections.forEach(c => {
    const sp = positions[c.source_element_id], tp = positions[c.target_element_id];
    if (!sp || !tp) return;
    (tp.y < sp.y ? backwardConns : forwardConns).push(c);
  });
  backwardConns.sort((a, b) => {
    const sa = (positions[a.source_element_id]?.y ?? 0) - (positions[a.target_element_id]?.y ?? 0);
    const sb = (positions[b.source_element_id]?.y ?? 0) - (positions[b.target_element_id]?.y ?? 0);
    return sb - sa;
  });
  const backwardRailX = {}, backwardByTarget = {};
  backwardConns.forEach(c => {
    if (!backwardByTarget[c.target_element_id]) backwardByTarget[c.target_element_id] = [];
    backwardByTarget[c.target_element_id].push(c);
  });
  Object.values(backwardByTarget).forEach(group => {
    const n = group.length;
    group.forEach((c, i) => { backwardRailX[`${c.source_element_id}→${c.target_element_id}`] = farX + (n - 1 - i) * 30; });
  });

  const portTotals = {}, portCounter = {};
  [...forwardConns, ...backwardConns].forEach(c => {
    const srcId = idMap[c.source_element_id], tgtId = idMap[c.target_element_id];
    if (!srcId || !tgtId) return;
    const srcEl = editor.elements.find(e => e.id === srcId);
    const tgtEl = editor.elements.find(e => e.id === tgtId);
    if (!srcEl || !tgtEl) return;
    const sp = positions[c.source_element_id], tp = positions[c.target_element_id];
    const isBack = tp.y < sp.y, isLeft = !isBack && tgtEl.x < srcEl.x - 30;
    const sd = isBack ? 'right' : isLeft ? 'left' : getForwardDirs(srcEl, tgtEl).startDir;
    const ed = isBack ? 'right' : isLeft ? 'right' : getForwardDirs(srcEl, tgtEl).endDir;
    portTotals[`${srcId}:${sd}`] = (portTotals[`${srcId}:${sd}`] || 0) + 1;
    portTotals[`${tgtId}:${ed}`] = (portTotals[`${tgtId}:${ed}`] || 0) + 1;
  });
  [...forwardConns, ...backwardConns].forEach(c => {
    const srcId = idMap[c.source_element_id], tgtId = idMap[c.target_element_id];
    if (!srcId || !tgtId) return;
    const srcEl = editor.elements.find(e => e.id === srcId);
    const tgtEl = editor.elements.find(e => e.id === tgtId);
    if (!srcEl || !tgtEl) return;
    const sp = positions[c.source_element_id], tp = positions[c.target_element_id];
    const isBack = tp.y < sp.y;
    const railX  = isBack ? (backwardRailX[`${c.source_element_id}→${c.target_element_id}`] ?? farX) : farX;
    const isLeft = !isBack && tgtEl.x < srcEl.x - 30;
    const sd = isBack ? 'right' : isLeft ? 'left' : getForwardDirs(srcEl, tgtEl).startDir;
    const ed = isBack ? 'right' : isLeft ? 'right' : getForwardDirs(srcEl, tgtEl).endDir;
    const sk = `${srcId}:${sd}`, ek = `${tgtId}:${ed}`;
    const spi = portCounter[sk] || 0; portCounter[sk] = spi + 1;
    const epi = portCounter[ek] || 0; portCounter[ek] = epi + 1;
    const arrow = buildArrow(srcEl, tgtEl, c.button || c.condition || '', isBack, railX,
      spi, portTotals[sk] || 1, epi, portTotals[ek] || 1, undefined);
    editor.arrows.push({
      id: Date.now() + Math.floor(Math.random() * 1e6),
      start: srcId, end: tgtId,
      startDir: arrow.startDir, endDir: arrow.endDir,
      label: arrow.label, waypoints: arrow.waypoints,
      startPortIndex: spi, endPortIndex: epi,
      _srcCsvId: c.source_element_id, _isBackward: isBack,
      _srcType: (elements.find(e => e.element_id === c.source_element_id) || {}).element_type,
      _trigger: c.trigger || '', _button: c.button || '', _validation: c.validation || ''
    });
  });

  editor.saveState();
  editor.render();
  document.getElementById('status').textContent =
    `AI loaded: ${topElements.length} elements, ${topConnections.length} connections.`;
}

logMsg('Load CSVs, type instruction, click Send (copies prompt) or Copy Prompt.', 'sys');
