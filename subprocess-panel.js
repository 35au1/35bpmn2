// subprocess-panel.js — v4
// Subprocess elements are loaded from CSV via _parent field.
// The S icon on a process element opens its subprocess panel.
// Subprocesses are displayed as a mini read-only diagram in an overlay.

// ── Constants ─────────────────────────────────────────────────────────────────
const FLOW_ROW_H  = 260;
const SP_MARGIN   = 120;
const PAD         = 44;
const TITLE_H     = 28;
const ROW_LABEL_W = 28;
const TOOLBAR_H   = 36;

// ── Live state ────────────────────────────────────────────────────────────────
let subprocessVisible  = false;
let subprocessInjected = false;
let spDragState        = null;
let _activeParentId    = null; // csvId of the process whose subprocesses are shown

let spFlows = [];
let _spFlowSeq = 0;
function newFlowId() { return 'spf_' + (++_spFlowSeq); }

// ── Get subprocess elements for a given parent csvId ─────────────────────────
function getSubprocessChildren(parentCsvId) {
  const reg = (window._subprocessRegistry || {})[parentCsvId];
  return reg ? reg.elements : [];
}

function getSubprocessConnections(parentCsvId) {
  const reg = (window._subprocessRegistry || {})[parentCsvId];
  return reg ? reg.connections : [];
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function spMapType(t) {
  return { start: 'start', end: 'end', 'decision-x': 'decision-x', process: 'process' }[t] || 'process';
}

function spOriginX() {
  if (window._diagramFarX) {
    return window._diagramFarX + 3 * 30 + SP_MARGIN + ROW_LABEL_W + PAD;
  }
  let maxX = 300;
  editor.elements.forEach(el => {
    if (!el._subprocess) {
      const hw = el.type === 'process' ? 90 : el.type === 'decision-x' ? 50 : 20;
      if (el.x + hw > maxX) maxX = el.x + hw;
    }
  });
  return maxX + SP_MARGIN + ROW_LABEL_W + PAD;
}

function spBounds() {
  const spEls = editor.elements.filter(el => el._subprocess);
  if (!spEls.length) return null;
  const allX = spEls.map(el => el.x);
  const allY = spEls.map(el => el.y);
  return {
    minX: Math.min(...allX) - 100 - PAD - ROW_LABEL_W,
    minY: Math.min(...allY) - 60  - PAD - TITLE_H,
    maxX: Math.max(...allX) + 100 + PAD,
    maxY: Math.max(...allY) + 80  + PAD + TOOLBAR_H
  };
}

function pointInSpBounds(x, y) {
  const b = spBounds();
  if (!b) return false;
  return x >= b.minX && x <= b.maxX && y >= b.minY && y <= b.maxY;
}

// ── Inject subprocess elements from CSV data ──────────────────────────────────
function injectSubprocessElements(parentCsvId) {
  if (subprocessInjected) return;
  subprocessInjected = true;
  _activeParentId = parentCsvId;
  spFlows = [];

  const children = getSubprocessChildren(parentCsvId);
  const connections = getSubprocessConnections(parentCsvId);
  if (!children.length) return;

  // Build adjacency for chain detection
  const outMap = {}; // csvId → [csvId]
  connections.forEach(c => {
    if (!outMap[c.source_csv_id]) outMap[c.source_csv_id] = [];
    outMap[c.source_csv_id].push(c.target_csv_id);
  });

  // Find chain starts (elements with no incoming connections within this subprocess)
  const hasIncoming = new Set(connections.map(c => c.target_csv_id));
  const chainStarts = children.filter(el => !hasIncoming.has(el.csvId));

  // Build chains by following outMap
  const chains = [];
  const visited = new Set();
  chainStarts.forEach(startEl => {
    const chain = [];
    let cur = startEl.csvId;
    while (cur && !visited.has(cur)) {
      visited.add(cur);
      const el = children.find(e => e.csvId === cur);
      if (el) chain.push(el);
      const nexts = outMap[cur] || [];
      cur = nexts[0]; // follow first outgoing
    }
    if (chain.length) chains.push(chain);
  });

  // Add any unvisited elements as single-element chains
  children.forEach(el => {
    if (!visited.has(el.csvId)) chains.push([el]);
  });

  // Layout: place chains as horizontal rows
  const ox = spOriginX();
  const CHAIN_ROW_H = 120;
  const ELEM_SPACING = 200;
  const oy = 80 + TITLE_H + PAD;

  // Map csvId → new editor element id
  const spIdMap = {};

  chains.forEach((chain, chainIdx) => {
    const fid = newFlowId();
    // Use start element title as flow name, or first element
    const startEl = chain.find(e => e.type === 'start') || chain[0];
    spFlows.push({ id: fid, title: startEl.title || `Chain ${chainIdx + 1}` });

    const rowY = oy + chainIdx * CHAIN_ROW_H;

    chain.forEach((child, elemIdx) => {
      const newId = Date.now() + Math.floor(Math.random() * 1e6);
      spIdMap[child.csvId] = newId;

      editor.elements.push({
        id:          newId,
        type:        child.type,
        x:           ox + elemIdx * ELEM_SPACING,
        y:           rowY,
        title:       child.title,
        expanded:    false,
        subElements: [],
        minimized:   false,
        _subprocess: true,
        _spFlowId:   fid,
        _csvId:      child.csvId,
        _parent:     parentCsvId
      });
    });
  });

  // Inject connections
  connections.forEach(c => {
    const srcId = spIdMap[c.source_csv_id];
    const tgtId = spIdMap[c.target_csv_id];
    if (!srcId || !tgtId) return;
    editor.arrows.push({
      id:             Date.now() + Math.floor(Math.random() * 1e6),
      start:          srcId,
      end:            tgtId,
      startDir:       'right',
      endDir:         'left',
      label:          c.label || '',
      waypoints:      [],
      startPortIndex: 0,
      endPortIndex:   0,
      _subprocess:    true,
      _spFlowId:      spFlows.find(f => {
        const srcEl = editor.elements.find(e => e.id === srcId);
        return srcEl?._spFlowId === f.id;
      })?.id || ''
    });
  });
}

function removeSubprocessElements() {
  editor.elements = editor.elements.filter(el => !el._subprocess);
  editor.arrows   = editor.arrows.filter(a  => !a._subprocess);
  subprocessInjected = false;
  _activeParentId = null;
  spFlows = [];
}

// ── Toggle ────────────────────────────────────────────────────────────────────
function toggleSubprocessPanel(parentCsvId) {
  // If clicking same parent, toggle off
  if (subprocessVisible && _activeParentId === parentCsvId) {
    subprocessVisible = false;
    removeSubprocessElements();
    editor.render();
    return;
  }
  // Switch to new parent or open fresh
  if (subprocessVisible) removeSubprocessElements();
  subprocessVisible = true;
  injectSubprocessElements(parentCsvId);
  editor.render();
}

// ── Auto-assign dropped elements ──────────────────────────────────────────────
function spCheckDroppedElements() {
  if (!subprocessVisible) return;
  let changed = false;
  editor.elements.forEach(el => {
    if (el._subprocess) return;
    if (pointInSpBounds(el.x, el.y)) {
      el._subprocess = true;
      if (!el._spFlowId) {
        let unassigned = spFlows.find(f => f.title === '—');
        if (!unassigned) {
          unassigned = { id: newFlowId(), title: '—' };
          spFlows.push(unassigned);
        }
        el._spFlowId = unassigned.id;
      }
      changed = true;
    }
  });
  if (changed) editor.render();
}

// ── Add / delete flows ────────────────────────────────────────────────────────
function spAddFlow() {
  const title = prompt('Nazwa podprocesu:', 'Nowy podproces');
  if (!title) return;
  const fid = newFlowId();
  spFlows.push({ id: fid, title });

  const ox = spOriginX();
  const rowIdx = spFlows.length - 1;
  const oy = 80 + TITLE_H + PAD + rowIdx * FLOW_ROW_H;

  [
    { type: 'start', x: ox,       y: oy, title: '' },
    { type: 'end',   x: ox + 220, y: oy, title: '' },
  ].forEach(n => {
    editor.elements.push({
      id: Date.now() + Math.floor(Math.random() * 1e6),
      type: n.type, x: n.x, y: n.y,
      title: n.title, expanded: false, subElements: [], minimized: false,
      _subprocess: true, _spFlowId: fid
    });
  });

  editor.saveState();
  editor.render();
}

function spDeleteFlow(fid) {
  if (!confirm('Usunąć ten podproces i wszystkie jego elementy?')) return;
  editor.elements = editor.elements.filter(el => el._spFlowId !== fid);
  editor.arrows   = editor.arrows.filter(a  => a._spFlowId !== fid);
  spFlows = spFlows.filter(f => f.id !== fid);
  editor.saveState();
  editor.render();
}

function spRenameFlow(fid) {
  const flow = spFlows.find(f => f.id === fid);
  if (!flow) return;
  const title = prompt('Nowa nazwa:', flow.title);
  if (!title) return;
  flow.title = title;
  editor.render();
}

// ── Overlay ───────────────────────────────────────────────────────────────────
function renderSubprocessOnCanvas() {
  document.querySelector('[data-subprocess-overlay]')?.remove();
  if (!subprocessVisible) return;

  const spEls = editor.elements.filter(el => el._subprocess);
  if (!spEls.length) {
    // No children — show empty state message
    const svg = document.getElementById('canvas');
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('data-subprocess-overlay', '1');
    const ox = spOriginX();
    const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    t.setAttribute('x', ox + 100); t.setAttribute('y', 120);
    t.setAttribute('font-size', '12'); t.setAttribute('fill', '#444');
    t.textContent = 'Brak podprocesów dla tego elementu.';
    g.appendChild(t);
    svg.appendChild(g);
    return;
  }

  const allX = spEls.map(el => el.x);
  const allY = spEls.map(el => el.y);
  const minX = Math.min(...allX) - 100 - PAD - ROW_LABEL_W;
  const minY = Math.min(...allY) - 60  - PAD - TITLE_H;
  const maxX = Math.max(...allX) + 100 + PAD;
  const maxY = Math.max(...allY) + 80  + PAD + TOOLBAR_H;
  const W = maxX - minX;
  const H = maxY - minY;

  const svg = document.getElementById('canvas');
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('data-subprocess-overlay', '1');

  const mk = (tag, attrs) => {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    return el;
  };

  // Background
  g.appendChild(mk('rect', {
    x: minX, y: minY, width: W, height: H, rx: 8,
    fill: 'rgba(8,8,8,0.75)', stroke: '#2a2a2a',
    'stroke-width': '1.5', 'stroke-dasharray': '6,4'
  }));

  // Title bar
  g.appendChild(mk('rect', { x: minX, y: minY, width: W, height: TITLE_H, rx: 8, fill: '#141414' }));
  const parentEl = editor.elements.find(el => el._csvId === _activeParentId);
  const titleTxt = mk('text', { x: minX + 12, y: minY + TITLE_H - 9, 'font-size': '11', fill: '#555' });
  titleTxt.textContent = `Podprocesy: ${parentEl?.title || _activeParentId || ''}`;
  g.appendChild(titleTxt);

  // Drag handle
  const handle = mk('rect', {
    x: minX, y: minY, width: W, height: TITLE_H,
    fill: 'transparent', cursor: 'move', 'data-sp-drag-handle': '1'
  });
  g.appendChild(handle);

  // Per-flow rows
  spFlows.forEach((flow, fi) => {
    const flowEls = spEls.filter(el => el._spFlowId === flow.id);
    if (!flowEls.length) return;

    const rowYs  = flowEls.map(el => el.y);
    const rowCY  = (Math.min(...rowYs) + Math.max(...rowYs)) / 2;
    const rowTop = Math.min(...rowYs) - 60;
    const rowHeight = Math.max(...rowYs) - Math.min(...rowYs) + 120; // approx row height

    if (fi > 0) {
      g.appendChild(mk('line', {
        x1: minX + 8, y1: rowTop - 16, x2: maxX - 8, y2: rowTop - 16,
        stroke: '#1e1e1e', 'stroke-width': '1'
      }));
    }

    const labelX = minX + ROW_LABEL_W - 6;
    // Break label into lines that fit the row height
    const maxCharsPerLine = Math.max(4, Math.floor((rowHeight || CHAIN_ROW_H) / 9));
    const words = flow.title.toUpperCase().split(' ');
    const labelLines = [];
    let cur = '';
    words.forEach(w => {
      if ((cur + (cur ? ' ' : '') + w).length > maxCharsPerLine && cur) {
        labelLines.push(cur); cur = w;
      } else cur = cur ? cur + ' ' + w : w;
    });
    if (cur) labelLines.push(cur);

    const lbl = mk('text', {
      x: labelX, y: rowCY,
      'font-size': '8', fill: '#444',
      'text-anchor': 'middle',
      transform: `rotate(-90, ${labelX}, ${rowCY})`
    });
    const lineH = 10;
    const startDy = -((labelLines.length - 1) * lineH) / 2;
    labelLines.forEach((line, li) => {
      const ts = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
      ts.setAttribute('x', labelX);
      ts.setAttribute('dy', li === 0 ? startDy : lineH);
      ts.textContent = line;
      lbl.appendChild(ts);
    });
    g.appendChild(lbl);

    const delBtnX = maxX - 18, delBtnY = rowCY - 8;
    const delBtn = mk('text', {
      x: delBtnX, y: delBtnY + 12, 'font-size': '11', fill: '#333',
      'text-anchor': 'middle', cursor: 'pointer'
    });
    delBtn.textContent = '✕';
    delBtn.addEventListener('click', e => { e.stopPropagation(); spDeleteFlow(flow.id); });
    delBtn.addEventListener('mouseenter', () => delBtn.setAttribute('fill', '#888'));
    delBtn.addEventListener('mouseleave', () => delBtn.setAttribute('fill', '#333'));
    g.appendChild(delBtn);

    lbl.style.cursor = 'pointer';
    lbl.addEventListener('click', e => { e.stopPropagation(); spRenameFlow(flow.id); });
  });

  // Bottom toolbar
  const tbY = maxY - TOOLBAR_H;
  g.appendChild(mk('rect', { x: minX, y: tbY, width: W, height: TOOLBAR_H, rx: 4, fill: '#0e0e0e' }));

  const addBtn = mk('text', {
    x: minX + 16, y: tbY + 22, 'font-size': '11', fill: '#555', cursor: 'pointer'
  });
  addBtn.textContent = '＋  Dodaj podproces';
  addBtn.addEventListener('click', e => { e.stopPropagation(); spAddFlow(); });
  addBtn.addEventListener('mouseenter', () => addBtn.setAttribute('fill', '#aaa'));
  addBtn.addEventListener('mouseleave', () => addBtn.setAttribute('fill', '#555'));
  g.appendChild(addBtn);

  const firstEl = svg.querySelector('.bpmn-element');
  if (firstEl) svg.insertBefore(g, firstEl);
  else svg.appendChild(g);

  handle.addEventListener('mousedown', spDragStart);
}

// ── Group drag ────────────────────────────────────────────────────────────────
function spDragStart(e) {
  e.stopPropagation(); e.preventDefault();
  const rect = document.getElementById('canvas').getBoundingClientRect();
  const cont = document.getElementById('canvas').parentElement;
  spDragState = {
    startX: e.clientX - rect.left + cont.scrollLeft,
    startY: e.clientY - rect.top  + cont.scrollTop,
    origPositions: editor.elements.filter(el => el._subprocess).map(el => ({ id: el.id, x: el.x, y: el.y }))
  };
  window.addEventListener('mousemove', spDragMove);
  window.addEventListener('mouseup',   spDragEnd);
}

function spDragMove(e) {
  if (!spDragState) return;
  const rect = document.getElementById('canvas').getBoundingClientRect();
  const cont = document.getElementById('canvas').parentElement;
  const dx = (e.clientX - rect.left + cont.scrollLeft) - spDragState.startX;
  const dy = (e.clientY - rect.top  + cont.scrollTop)  - spDragState.startY;
  spDragState.origPositions.forEach(({ id, x, y }) => {
    const el = editor.elements.find(e => e.id === id);
    if (el) { el.x = x + dx; el.y = y + dy; }
  });
  editor.render();
}

function spDragEnd() {
  if (spDragState) { editor.saveState(); spDragState = null; }
  window.removeEventListener('mousemove', spDragMove);
  window.removeEventListener('mouseup',   spDragEnd);
}

// ── Patch saveState ───────────────────────────────────────────────────────────
const _origSaveState = BPMNEditor.prototype.saveState;
BPMNEditor.prototype.saveState = function() {
  spCheckDroppedElements();
  return _origSaveState.call(this);
};

// ── Block cross-connections ───────────────────────────────────────────────────
const _origAddArrow = BPMNEditor.prototype.addArrow;
BPMNEditor.prototype.addArrow = function(startId, endId, startDir, endDir) {
  const s = this.elements.find(el => el.id === startId);
  const t = this.elements.find(el => el.id === endId);
  if (s && t && !!s._subprocess !== !!t._subprocess) return;
  return _origAddArrow.call(this, startId, endId, startDir, endDir);
};
