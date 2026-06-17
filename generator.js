// generator.js — populates the BPMNEditor instance created by app.js
// All rendering, dragging, arrow drawing, undo/redo comes from app.js

// ── CSV parser ────────────────────────────────────────────────────────────────
function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const values = [];
    let cur = '', inQ = false;
    for (const ch of line) {
      if (ch === '"') { inQ = !inQ; }
      else if (ch === ',' && !inQ) { values.push(cur.trim()); cur = ''; }
      else cur += ch;
    }
    values.push(cur.trim());
    const obj = {};
    headers.forEach((h, i) => obj[h] = values[i] ?? '');
    return obj;
  });
}

// ── Layout ────────────────────────────────────────────────────────────────────
// Rules:
// - user_action_process, start, end → col 0 (main lane) unless forced right by conflict
// - decision → always col of predecessor + 1 (shift right)
// - after a branch rejoins main flow → snap back to col 0 if no conflict
// - parallel elements at same depth → bump right to avoid overlap
function computeLayout(elements, connections) {
  const COL_W = 240, ROW_H = 220, ORIGIN_X = 140, ORIGIN_Y = 80;

  const out = {}, inc = {};
  elements.forEach(e => { out[e.element_id] = []; inc[e.element_id] = []; });
  connections.forEach(c => {
    out[c.source_element_id]?.push(c.target_element_id);
    inc[c.target_element_id]?.push(c.source_element_id);
  });

  // Topological order via Kahn
  const inDeg = {};
  elements.forEach(e => inDeg[e.element_id] = inc[e.element_id].length);
  const queue = elements.filter(e => inDeg[e.element_id] === 0).map(e => e.element_id);
  const order = [];
  while (queue.length) {
    const id = queue.shift();
    order.push(id);
    (out[id] || []).forEach(nid => { if (--inDeg[nid] === 0) queue.push(nid); });
  }
  elements.forEach(e => { if (!order.includes(e.element_id)) order.push(e.element_id); });

  // Longest-path depth (row)
  const depth = {};
  order.forEach(id => {
    const preds = inc[id] || [];
    depth[id] = preds.length === 0 ? 0 : Math.max(...preds.map(p => (depth[p] ?? 0) + 1));
  });

  const elMap = Object.fromEntries(elements.map(e => [e.element_id, e]));
  const col = {};

  order.forEach(id => {
    const el = elMap[id];
    const preds = inc[id] || [];
    const predCols = preds.map(p => col[p] ?? 0);
    const maxPredCol = predCols.length ? Math.max(...predCols) : 0;

    if (el.element_type === 'system_decision' || el.element_type === 'process_selection_by_system') {
      col[id] = maxPredCol + 1;
    } else if (el.element_type === 'system_action') {
      col[id] = maxPredCol;
    } else {
      col[id] = 0;
    }
  });

  // ── Y Assignment ──────────────────────────────────────────────────────────
  // Step 1: assign col-0 elements sorted by their longest-path depth
  const col0order = order.filter(id => col[id] === 0)
    .sort((a, b) => (depth[a] ?? 0) - (depth[b] ?? 0));

  // Step 2: for each gap between consecutive col-0 elements, count how many
  // branch elements need to fit in that gap, then expand the gap accordingly
  const MIN_GAP = 160; // minimum pixels between two col-0 elements
  const BRANCH_SLOT = 140; // pixels needed per branch element in a gap

  // Map each branch element to the gap it belongs to (between col0[i] and col0[i+1])
  const branchInGap = {}; // key: i → array of branch element ids
  col0order.forEach((_, i) => { branchInGap[i] = []; });

  order.filter(id => col[id] !== 0).forEach(id => {
    const findCol0Ancestor = (eid, visited = new Set()) => {
      if (visited.has(eid)) return null;
      visited.add(eid);
      if (col[eid] === 0) return eid;
      for (const p of (inc[eid] || [])) {
        const found = findCol0Ancestor(p, visited);
        if (found) return found;
      }
      return null;
    };
    const ancestor = findCol0Ancestor(id);
    const gapIdx = ancestor ? col0order.indexOf(ancestor) : 0;
    if (!branchInGap[gapIdx]) branchInGap[gapIdx] = [];
    branchInGap[gapIdx].push(id);
  });

  // Step 3: assign Y to col-0 elements with dynamic gaps
  const assignedY = {};
  const usedY = new Set();
  let currentY = ORIGIN_Y;

  col0order.forEach((id, i) => {
    assignedY[id] = currentY;
    usedY.add(currentY);
    const branchCount = (branchInGap[i] || []).length;
    const gap = Math.max(MIN_GAP, branchCount * BRANCH_SLOT + MIN_GAP);
    currentY += gap;
  });

  // Step 4: assign Y to branch elements — evenly distributed in their gap
  col0order.forEach((id, i) => {
    const branches = branchInGap[i] || [];
    if (branches.length === 0) return;
    const yA = assignedY[id];
    const yD = i + 1 < col0order.length ? assignedY[col0order[i + 1]] : yA + MIN_GAP;
    const slotH = (yD - yA) / (branches.length + 1);
    branches.forEach((bid, j) => {
      const y = Math.round(yA + slotH * (j + 1));
      assignedY[bid] = y;
      usedY.add(y);
    });
  });

  const pos = {};
  elements.forEach(e => {
    pos[e.element_id] = {
      x: ORIGIN_X + col[e.element_id] * COL_W,
      y: assignedY[e.element_id] ?? ORIGIN_Y
    };
  });

  elements.forEach(e => { e._col = col[e.element_id]; });
  return pos;
}

// ── Map CSV element_type → BPMNEditor type ────────────────────────────────────
function mapType(csvType) {
  switch (csvType) {
    case 'start':           return 'start';
    case 'end':             return 'end';
    case 'user_action_process': return 'process';
    case 'system_decision': return 'decision-x';
    case 'system_action':   return 'system_action';
    // legacy fallback
    case 'process_selection_by_system': return 'decision-x';
    default:                return 'process';
  }
}

// ── Forward port direction helper ─────────────────────────────────────────────
function getForwardDirs(srcEl, tgtEl) {
  const dx = tgtEl.x - srcEl.x;
  const dy = tgtEl.y - srcEl.y;
  if (dx < -30) return { startDir: 'left', endDir: 'right' };
  if (Math.abs(dy) >= Math.abs(dx) * 0.3) {
    return { startDir: dy >= 0 ? 'bottom' : 'top', endDir: dy >= 0 ? 'top' : 'bottom' };
  }
  return { startDir: 'right', endDir: 'left' };
}

// ── Best connection ports + waypoints for backward arrows ────────────────────
// Forward arrows: normal top/bottom/left/right routing
// Backward arrows (target depth < source depth): route far right with waypoints
function buildArrow(srcEl, tgtEl, label, isBackward, railX, startPortIndex, startPortTotal, endPortIndex, endPortTotal, leftMidX) {
  const SPREAD = 14;
  const spreadY = (idx, total, baseY) => total <= 1 ? baseY : baseY + (idx - (total - 1) / 2) * SPREAD;

  if (isBackward) {
    const srcPortY = spreadY(startPortIndex, startPortTotal, srcEl.y);
    const tgtPortY = spreadY(endPortIndex,   endPortTotal,   tgtEl.y);
    return {
      startDir: 'right',
      endDir:   'right',
      label,
      waypoints: [
        { x: railX, y: srcPortY },
        { x: railX, y: tgtPortY },
      ]
    };
  }

  const { startDir, endDir } = getForwardDirs(srcEl, tgtEl);

  // Left-going forward arrow with assigned intermediate X — inject waypoint to avoid overlap
  if (startDir === 'left' && leftMidX !== undefined) {
    const srcPortY = spreadY(startPortIndex, startPortTotal, srcEl.y);
    const tgtPortY = spreadY(endPortIndex,   endPortTotal,   tgtEl.y);
    return {
      startDir: 'left',
      endDir:   'right',
      label,
      waypoints: [
        { x: leftMidX, y: srcPortY },
        { x: leftMidX, y: tgtPortY },
      ]
    };
  }

  return { startDir, endDir, label, waypoints: [] };
}

// ── Neon colour palette per user_action_process ───────────────────────────────
const NEON_COLORS = ['#39ff14', '#00cfff', '#bf5fff', '#ff3f3f', '#ff9500'];
const elementColors = {}; // csvId → hex colour

function assignElementColors(csvElements) {
  let idx = 0;
  csvElements.forEach(e => {
    if (e.element_type === 'user_action_process') {
      elementColors[e.element_id] = NEON_COLORS[idx % NEON_COLORS.length];
      idx++;
    }
  });
}

// Returns { color, opacity } for an arrow given its source element
// Backward arrows get the same hue at 40% opacity
function arrowStyle(srcCsvId, isBackward) {
  const color = elementColors[srcCsvId];
  if (!color) return { color: '#888888', opacity: 1 };
  return { color, opacity: isBackward ? 0.4 : 1 };
}


const userStories = {}; // element_id → { user_story, technical_aspects, alternative_paths }

document.getElementById('userstories-file').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const text = await readFile(file);
  const rows = parseCSV(text);
  rows.forEach(r => {
    if (r.element_id) userStories[r.element_id.trim()] = r;
  });
  document.getElementById('status').textContent = `User stories loaded: ${rows.length} entries.`;
  // Re-render icons if diagram already loaded
  if (editor.elements.length) renderStoryIcons();
});

// ── Apply neon colours to rendered arrows and process box borders ─────────────
function applyArrowColors() {
  editor.arrows.forEach(arrow => {
    const isSp = !!arrow._subprocess;
    if (!arrow._srcCsvId && !isSp) return;
    const { color, opacity } = isSp
      ? { color: '#666666', opacity: 1 }
      : arrowStyle(arrow._srcCsvId, arrow._isBackward);
    const dash = !isSp && (arrow._srcType === 'system_decision' ? '6,3'
               : arrow._srcType === 'system_action'   ? '2,3'
               : null);
    document.querySelectorAll(`[data-arrow-id="${arrow.id}"]`).forEach(el => {
      if (el.tagName === 'path') {
        el.setAttribute('stroke', color);
        el.style.opacity = opacity;
        if (dash) el.setAttribute('stroke-dasharray', dash);
        else el.removeAttribute('stroke-dasharray');
      } else if (el.tagName === 'polygon') {
        el.setAttribute('fill', color);
        el.setAttribute('stroke', color);
        el.style.opacity = opacity;
      }
    });
  });

  // Colour process box borders by their origin colour
  editor.elements.forEach(el => {
    if (el.type !== 'process' || !el._csvId) return;
    const color = elementColors[el._csvId];
    if (!color) return;
    const g = document.querySelector(`[data-id="${el.id}"]`);
    const rect = g && g.querySelector('.process-box');
    if (rect) rect.setAttribute('stroke', color);
  });
}

// ── Trigger & validation icons on outbound arrow start points ─────────────────
// One trigger icon + one validation icon per arrow, placed at the arrow's start port.
// Clicking toggles a small popup showing the detail.

const _connPopups = {}; // key → visible bool

function arrowStartPort(arrow) {
  const el = editor.elements.find(e => e.id === arrow.start);
  if (!el) return null;
  const hw = el.type === 'process' ? 90 : el.type === 'decision-x' ? 50 : el.type === 'system_action' ? 65 : 20;
  const hh = el.type === 'process' ? 30 : el.type === 'decision-x' ? 50 : el.type === 'system_action' ? 25 : 20;
  switch (arrow.startDir) {
    case 'right':  return { x: el.x + hw, y: el.y };
    case 'left':   return { x: el.x - hw, y: el.y };
    case 'top':    return { x: el.x, y: el.y - hh };
    case 'bottom': return { x: el.x, y: el.y + hh };
    default:       return { x: el.x, y: el.y };
  }
}

function renderConnectionIcons() {
  document.querySelectorAll('.conn-icon-group').forEach(el => el.remove());
  const svg = document.getElementById('canvas');

  editor.arrows.forEach(arrow => {
    if (arrow._subprocess) return;
    const hasTrigger    = arrow._trigger && arrow._trigger !== 'await';
    const hasValidation = !!arrow._validation;
    if (!hasTrigger && !hasValidation) return;

    const port = arrowStartPort(arrow);
    if (!port) return;

    // Offset icons slightly away from the port along the start direction
    const OFFSET = 14;
    let ox = 0, oy = 0;
    switch (arrow.startDir) {
      case 'right':  ox =  OFFSET; oy = -10; break;
      case 'left':   ox = -OFFSET; oy = -10; break;
      case 'bottom': ox = -10; oy =  OFFSET; break;
      case 'top':    ox = -10; oy = -OFFSET; break;
    }

    let slotX = port.x + ox;
    const slotY = port.y + oy;
    const ICON_W = 14, ICON_GAP = 4;

    const mkSvg = (tag, attrs) => {
      const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
      Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
      return el;
    };

    function makeIcon(ix, iy, symbol, fillColor, borderColor, popupLines, key) {
      const g = mkSvg('g', { class: 'conn-icon-group' });
      g.style.cursor = 'pointer';

      g.appendChild(mkSvg('rect', {
        x: ix, y: iy, width: ICON_W, height: ICON_W,
        rx: 3, fill: '#111', stroke: borderColor, 'stroke-width': '1'
      }));

      const sym = mkSvg('text', {
        x: ix + ICON_W / 2, y: iy + ICON_W / 2,
        'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': '8',
        fill: fillColor, 'pointer-events': 'none'
      });
      sym.textContent = symbol;
      g.appendChild(sym);

      // Popup — always grey regardless of icon colour
      const popW = Math.max(...popupLines.map(l => l.length * 5.5 + 16), 60);
      const popH = popupLines.length * 14 + 10;
      const popX = ix - 4, popY = iy + ICON_W + 4;

      const popG = mkSvg('g', {});
      popG.style.display = _connPopups[key] ? 'block' : 'none';

      popG.appendChild(mkSvg('rect', {
        x: popX, y: popY, width: popW, height: popH,
        rx: 4, fill: '#111', stroke: '#444', 'stroke-width': '1'
      }));
      popupLines.forEach((line, li) => {
        const t = mkSvg('text', {
          x: popX + 8, y: popY + 12 + li * 14,
          'font-size': '9', fill: '#aaa'
        });
        t.textContent = line;
        popG.appendChild(t);
      });
      g.appendChild(popG);

      g.addEventListener('click', e => {
        e.stopPropagation();
        _connPopups[key] = !_connPopups[key];
        popG.style.display = _connPopups[key] ? 'block' : 'none';
      });

      svg.appendChild(g);
    }

    // Trigger icon
    if (hasTrigger) {
      const arrowColor = arrowStyle(arrow._srcCsvId, arrow._isBackward).color;
      const symbol = arrow._trigger === 'button' ? 'B' : '⏱';
      const color  = arrow._trigger === 'button' ? arrowColor : '#777';
      const border = arrow._trigger === 'button' ? arrowColor : '#333';
      const lines = [];
      if (arrow._trigger) lines.push(`Trigger: ${arrow._trigger}`);
      if (arrow._button)  lines.push(`Button: "${arrow._button}"`);
      makeIcon(slotX, slotY, symbol, color, border, lines, `${arrow.id}_t`);
      slotX += ICON_W + ICON_GAP;
    }

    // Validation icon
    if (hasValidation) {
      const arrowColor = arrowStyle(arrow._srcCsvId, arrow._isBackward).color;
      makeIcon(slotX, slotY, 'V', '#d94444', arrowColor,
        [`Validation: ${arrow._validation}`], `${arrow.id}_v`);
    }
  });
}

// ── Shared process box icon helper ───────────────────────────────────────────
// All process box icons: small rounded square, letter centered, stacked
// vertically on the LEFT side of the box (outside the box edge).
const PROC_ICON_SIZE = 14;
const PROC_ICON_GAP  = 4;

function makeProcIcon(svg, el, slotIndex, letter, letterColor, borderColor, onClick) {
  const ix = el.x - 90 - PROC_ICON_SIZE - 6; // left of box
  const iy = el.y - 30 + slotIndex * (PROC_ICON_SIZE + PROC_ICON_GAP);

  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.style.cursor = 'pointer';
  g.style.opacity = '0.7';
  g.addEventListener('mouseenter', () => g.style.opacity = '1');
  g.addEventListener('mouseleave', () => g.style.opacity = '0.7');

  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('x', ix); rect.setAttribute('y', iy);
  rect.setAttribute('width', PROC_ICON_SIZE); rect.setAttribute('height', PROC_ICON_SIZE);
  rect.setAttribute('rx', '3');
  rect.setAttribute('fill', '#111');
  rect.setAttribute('stroke', borderColor);
  rect.setAttribute('stroke-width', '1.5');
  g.appendChild(rect);

  const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  t.setAttribute('x', ix + PROC_ICON_SIZE / 2);
  t.setAttribute('y', iy + PROC_ICON_SIZE / 2);
  t.setAttribute('text-anchor', 'middle');
  t.setAttribute('dominant-baseline', 'central');
  t.setAttribute('font-size', '8');
  t.setAttribute('font-weight', 'bold');
  t.setAttribute('fill', letterColor);
  t.setAttribute('pointer-events', 'none');
  t.textContent = letter;
  g.appendChild(t);

  g.addEventListener('click', e => { e.stopPropagation(); onClick(e); });
  svg.appendChild(g);
  return g;
}

function renderStoryIcons() {
  document.querySelectorAll('.story-icon').forEach(el => el.remove());
  const svg = document.getElementById('canvas');

  Object.entries(userStories).forEach(([csvId, story]) => {
    const editorEl = editor.elements.find(e => e._csvId === csvId);
    if (!editorEl || editorEl.type !== 'process') return;

    const g = makeProcIcon(svg, editorEl, 1, 'U', '#888888', '#444444', () => openStoryPanel(csvId));
    g.setAttribute('class', 'story-icon');
    g.dataset.csvId = csvId;
  });
}

function openStoryPanel(csvId) {
  const story = userStories[csvId];
  if (!story) return;
  const panel = document.getElementById('story-panel');
  const content = document.getElementById('story-panel-content');
  content.innerHTML = `
    <div class="story-section">
      <div class="story-section-label">User Story</div>
      <div class="story-section-text">${story.user_story || '—'}</div>
    </div>
    <div class="story-section">
      <div class="story-section-label">Aspekty techniczne</div>
      <div class="story-section-text">${story.technical_aspects || '—'}</div>
    </div>
    <div class="story-section">
      <div class="story-section-label">Ścieżki alternatywne</div>
      <div class="story-section-text">${story.alternative_paths || '—'}</div>
    </div>
  `;
  panel.classList.add('open');
}

document.getElementById('story-panel-close').addEventListener('click', () => {
  document.getElementById('story-panel').classList.remove('open');
});

// ── Subprocess S icon — slot 0 on all process elements ───────────────────────
function renderSubprocessIcon() {
  document.querySelectorAll('.subprocess-icon').forEach(el => el.remove());
  const svg = document.getElementById('canvas');
  editor.elements.forEach(el => {
    if (el.type !== 'process' || el._subprocess) return;
    const csvId = el._csvId;
    // Only show S icon if this element has subprocess children in registry
    const registry = window._subprocessRegistry || {};
    const hasChildren = registry[csvId] && registry[csvId].elements && registry[csvId].elements.length > 0;
    if (!hasChildren) return;
    const g = makeProcIcon(svg, el, 0, 'S', '#7dd3fc', '#2a6a9a', () => toggleSubprocessPanel(csvId));
    g.setAttribute('class', 'subprocess-icon');
  });
}

// ── User assigned icon — slot 2 on process elements with user_assigned ────────
const _userPopups = {};
function renderUserIcons() {
  document.querySelectorAll('.user-assigned-icon').forEach(el => el.remove());
  const svg = document.getElementById('canvas');
  editor.elements.forEach(el => {
    if (el.type !== 'process' || !el._userAssigned) return;
    const userName = el._userAssigned;
    const key = `user_${el.id}`;
    const g = makeProcIcon(svg, el, 2, 'U', '#f59e0b', '#92400e', () => {
      _userPopups[key] = !_userPopups[key];
      renderUserIcons(); // re-render to toggle popup
    });
    g.setAttribute('class', 'user-assigned-icon');

    // Popup showing user name
    if (_userPopups[key]) {
      const popW = Math.max(userName.length * 6 + 16, 60);
      const popH = 22;
      const ix = el.x - 90 - PROC_ICON_SIZE - 6;
      const iy = el.y - 30 + 2 * (PROC_ICON_SIZE + PROC_ICON_GAP);
      const popX = ix + PROC_ICON_SIZE + 4;
      const popY = iy;

      const popG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      popG.classList.add('user-assigned-icon');

      const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bg.setAttribute('x', popX); bg.setAttribute('y', popY);
      bg.setAttribute('width', popW); bg.setAttribute('height', popH);
      bg.setAttribute('rx', 4); bg.setAttribute('fill', '#111');
      bg.setAttribute('stroke', '#92400e'); bg.setAttribute('stroke-width', '1');
      popG.appendChild(bg);

      const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      t.setAttribute('x', popX + 8); t.setAttribute('y', popY + 14);
      t.setAttribute('font-size', '10'); t.setAttribute('fill', '#f59e0b');
      t.textContent = userName;
      popG.appendChild(t);
      svg.appendChild(popG);
    }
  });
}

// ── Lock icon — appears on selected element only, to the right of the box ─────
// States: '' = unlocked (🔓), 'lock_noterasable' = locked (🔒), 'lock_noteditable' = fully locked (🔐)
const LOCK_STATES = ['', 'lock_noterasable', 'lock_noteditable'];
const LOCK_ICONS  = { '': '🔓', 'lock_noterasable': '🔒', 'lock_noteditable': '🔐' };
const LOCK_TIPS   = { '': 'No lock', 'lock_noterasable': 'Cannot delete', 'lock_noteditable': 'Fully locked' };

function renderLockIcon() {
  document.querySelectorAll('.lock-icon-overlay').forEach(el => el.remove());
  if (!editor.selectedElement) return;

  const id = parseInt(editor.selectedElement.dataset?.id);
  if (!id) return;
  const el = editor.elements.find(e => e.id === id);
  if (!el || el.type === 'start' || el.type === 'end') return; // no lock on start/end

  const svg = document.getElementById('canvas');
  const hw = el.type === 'process' ? 90 : el.type === 'decision-x' ? 50 : el.type === 'decision-x-small' ? 22 : el.type === 'system_action' ? 65 : 20;
  const lockX = el.x + hw + 8;
  const lockY = el.y - 12;
  const lock  = el._lock || '';

  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.classList.add('lock-icon-overlay');
  g.style.cursor = 'pointer';

  // Background pill
  const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  bg.setAttribute('x', lockX - 2); bg.setAttribute('y', lockY - 2);
  bg.setAttribute('width', 26); bg.setAttribute('height', 26);
  bg.setAttribute('rx', 5);
  bg.setAttribute('fill', '#111');
  bg.setAttribute('stroke', lock ? '#f59e0b' : '#444');
  bg.setAttribute('stroke-width', '1.5');
  g.appendChild(bg);

  // Icon
  const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  t.setAttribute('x', lockX + 11); t.setAttribute('y', lockY + 16);
  t.setAttribute('text-anchor', 'middle');
  t.setAttribute('font-size', '14');
  t.setAttribute('pointer-events', 'none');
  t.textContent = LOCK_ICONS[lock];
  g.appendChild(t);

  // Tooltip
  const tip = document.createElementNS('http://www.w3.org/2000/svg', 'title');
  tip.textContent = `Lock: ${LOCK_TIPS[lock]} — click to change`;
  g.appendChild(tip);

  g.addEventListener('click', (e) => {
    e.stopPropagation();
    const cur = LOCK_STATES.indexOf(el._lock || '');
    el._lock = LOCK_STATES[(cur + 1) % LOCK_STATES.length];
    editor.saveState();
    renderLockIcon();
  });

  svg.appendChild(g);
}

function readFile(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = e => resolve(e.target.result);
    r.onerror = () => reject(new Error('Failed to read ' + file.name));
    r.readAsText(file);
  });
}

// ── Load & inject into BPMNEditor ─────────────────────────────────────────────
document.getElementById('load-btn').addEventListener('click', async () => {
  const status = document.getElementById('status');
  const eFile = document.getElementById('elements-file').files[0];
  const cFile = document.getElementById('connections-file').files[0];

  if (!eFile || !cFile) { status.textContent = 'Please select both CSV files.'; return; }
  status.textContent = 'Loading…';

  try {
    const [eText, cText] = await Promise.all([readFile(eFile), readFile(cFile)]);
    const csvElements    = parseCSV(eText);
    const csvConnections = parseCSV(cText);

    const positions = computeLayout(
      csvElements.filter(e => !e.parent),
      csvConnections.filter(c => {
        const src = csvElements.find(e => e.element_id === c.source_element_id);
        const tgt = csvElements.find(e => e.element_id === c.target_element_id);
        return !src?.parent && !tgt?.parent;
      })
    );
    assignElementColors(csvElements);

    // Reset editor state completely
    editor.elements      = [];
    editor.arrows        = [];
    editor.history       = [];
    editor.historyIndex  = -1;
    editor.selectedElement = null;
    editor.selectedArrow   = null;

    const maxCol = Math.max(...csvElements.map(e => e._col ?? 0), 0);

    // Calculate farX: rightmost element edge + large margin for backward arrow rail
    const elementRightEdge = (e) => {
      const pos = positions[e.element_id];
      if (!pos) return 0;
      if (e.element_type === 'user_action_process') return pos.x + 90;
      if (e.element_type === 'process_selection_by_system') return pos.x + 50;
      return pos.x + 20;
    };
    const farX = Math.max(...csvElements.map(elementRightEdge), 400) + 120;
    window._diagramFarX = farX; // expose for subprocess panel positioning

    let _uid = Date.now();
    const uid = () => ++_uid;
    const idMap = {};
    // Store subprocess elements separately — not in main diagram
    window._subprocessRegistry = {}; // parentCsvId → { elements: [], connections: [] }

    csvElements.forEach(e => {
      const numId = Date.now() + Math.floor(Math.random() * 1e6);
      idMap[e.element_id] = numId;

      // Elements with a parent go to subprocess registry, not main diagram
      if (e.parent) {
        if (!window._subprocessRegistry[e.parent]) {
          window._subprocessRegistry[e.parent] = { elements: [], connections: [] };
        }
        window._subprocessRegistry[e.parent].elements.push({
          id:          numId,
          csvId:       e.element_id,
          type:        mapType(e.element_type),
          title:       e.element_name || e.element_id,
          _userAssigned: e.user_assigned || '',
          _lock:       e.lock_keyword || ''
        });
        return; // skip adding to main diagram
      }

      const pos = positions[e.element_id];
      editor.elements.push({
        id:          numId,
        type:        mapType(e.element_type),
        x:           pos.x,
        y:           pos.y,
        title:       e.element_name || e.element_id,
        expanded:    false,
        subElements: [],
        minimized:   false,
        _csvId:      e.element_id,
        _userAssigned: e.user_assigned || '',
        _lock:       e.lock_keyword || '',
        _parent:     ''
      });
    });

    // Store connections where both endpoints are subprocess elements
    csvConnections.forEach(c => {
      const srcEl = csvElements.find(e => e.element_id === c.source_element_id);
      const tgtEl = csvElements.find(e => e.element_id === c.target_element_id);
      if (srcEl?.parent && srcEl.parent === tgtEl?.parent) {
        const reg = window._subprocessRegistry[srcEl.parent];
        if (reg) {
          reg.connections.push({
            source_csv_id: c.source_element_id,
            target_csv_id: c.target_element_id,
            label: c.button || c.condition || '',
            trigger: c.trigger || ''
          });
        }
      }
    });

    // Separate backward and forward connections
    const backwardConns = [];
    const forwardConns  = [];
    csvConnections.forEach(c => {
      const srcPos = positions[c.source_element_id];
      const tgtPos = positions[c.target_element_id];
      if (!srcPos || !tgtPos) return;
      // Backward = target has lower or equal topological depth than source
      if (tgtPos.y < srcPos.y) backwardConns.push(c);
      else forwardConns.push(c);
    });

    // Sort backward arrows by vertical span ASCENDING: smallest span = rightmost rail
    // This creates { ( ) } - largest span uses leftmost (innermost) rail, smallest uses outermost
    // Wait - { ( ) } means largest span is OUTERMOST = rightmost
    // So sort descending by span, index 0 = largest span = rightmost rail
    backwardConns.sort((a, b) => {
      const spanA = (positions[a.source_element_id]?.y ?? 0) - (positions[a.target_element_id]?.y ?? 0);
      const spanB = (positions[b.source_element_id]?.y ?? 0) - (positions[b.target_element_id]?.y ?? 0);
      return spanB - spanA; // largest span first = gets highest railX index
    });

    const BACK_RAIL_SPACING = 30;
    const backwardRailX = {};
    const backwardByTarget = {};
    backwardConns.forEach(c => {
      const tgt = c.target_element_id;
      if (!backwardByTarget[tgt]) backwardByTarget[tgt] = [];
      backwardByTarget[tgt].push(c);
    });

    // Within each target group, assign rails: largest span = rightmost (highest X)
    Object.values(backwardByTarget).forEach(group => {
      const n = group.length;
      group.forEach((c, i) => {
        backwardRailX[`${c.source_element_id}→${c.target_element_id}`] = farX + (n - 1 - i) * BACK_RAIL_SPACING;
      });
    });

    // Pre-compute intermediate X for left-going forward arrows sharing same target
    // Lower source = more right intermediate vertical segment (bracket ordering)
    const leftArrowsByTarget = {};
    [...forwardConns, ...backwardConns].forEach(c => {
      const srcEl = editor.elements.find(e => e.id === idMap[c.source_element_id]);
      const tgtEl = editor.elements.find(e => e.id === idMap[c.target_element_id]);
      if (!srcEl || !tgtEl) return;
      // Left-going = target is to the left of source (regardless of Y)
      if (tgtEl.x < srcEl.x - 30) {
        const key = c.target_element_id;
        if (!leftArrowsByTarget[key]) leftArrowsByTarget[key] = [];
        leftArrowsByTarget[key].push(c);
      }
    });
    const leftArrowMidX = {};
    const LEFT_RAIL_SPACING = 24;
    Object.entries(leftArrowsByTarget).forEach(([tgtId, group]) => {
      // Sort by source Y descending (bottommost = outermost/rightmost), tiebreak by element_id
      group.sort((a, b) => {
        const dy = (positions[b.source_element_id]?.y ?? 0) - (positions[a.source_element_id]?.y ?? 0);
        return dy !== 0 ? dy : a.source_element_id.localeCompare(b.source_element_id);
      });
      const tgtEl = editor.elements.find(e => e.id === idMap[tgtId]);
      const tgtX = tgtEl ? tgtEl.x + 60 : 200;
      group.forEach((c, i) => {
        leftArrowMidX[`${c.source_element_id}→${c.target_element_id}`] = tgtX + 20 + i * LEFT_RAIL_SPACING;
      });
    });
    const portTotals = {};
    [...forwardConns, ...backwardConns].forEach(c => {
      const srcId = idMap[c.source_element_id];
      const tgtId = idMap[c.target_element_id];
      if (!srcId || !tgtId) return;
      const srcEl = editor.elements.find(e => e.id === srcId);
      const tgtEl = editor.elements.find(e => e.id === tgtId);
      if (!srcEl || !tgtEl) return;
      const srcPos = positions[c.source_element_id];
      const tgtPos = positions[c.target_element_id];
      const isBackwardConn = tgtPos.y < srcPos.y;
      const isLeftGoingConn = !isBackwardConn && tgtEl.x < srcEl.x - 30;
      const startDir = isBackwardConn ? 'right' : (isLeftGoingConn ? 'left' : getForwardDirs(srcEl, tgtEl).startDir);
      const endDir   = isBackwardConn ? 'right' : (isLeftGoingConn ? 'right' : getForwardDirs(srcEl, tgtEl).endDir);
      const sk = `${srcId}:${startDir}`;
      const ek = `${tgtId}:${endDir}`;
      portTotals[sk] = (portTotals[sk] || 0) + 1;
      portTotals[ek] = (portTotals[ek] || 0) + 1;
    });

    // Build arrows — pre-assign portIndex so each arrow mounts to a specific point
    const portCounter = {};
    [...forwardConns, ...backwardConns].forEach(c => {
      const srcId = idMap[c.source_element_id];
      const tgtId = idMap[c.target_element_id];
      if (!srcId || !tgtId) return;

      const srcEl = editor.elements.find(e => e.id === srcId);
      const tgtEl = editor.elements.find(e => e.id === tgtId);
      if (!srcEl || !tgtEl) return;

      const srcPos = positions[c.source_element_id];
      const tgtPos = positions[c.target_element_id];
      const label = c.button || c.condition || '';
      const isBackward = tgtPos.y < srcPos.y;
      const railX = isBackward ? (backwardRailX[`${c.source_element_id}→${c.target_element_id}`] ?? farX) : farX;

      const isLeftGoing = !isBackward && tgtEl.x < srcEl.x - 30;
      const startDir = isBackward ? 'right' : (isLeftGoing ? 'left' : getForwardDirs(srcEl, tgtEl).startDir);
      const endDir   = isBackward ? 'right' : (isLeftGoing ? 'right' : getForwardDirs(srcEl, tgtEl).endDir);
      const sk = `${srcId}:${startDir}`;
      const ek = `${tgtId}:${endDir}`;
      const startPortIndex = portCounter[sk] || 0;
      portCounter[sk] = startPortIndex + 1;
      const endPortIndex = portCounter[ek] || 0;
      portCounter[ek] = endPortIndex + 1;

      const arrow = buildArrow(srcEl, tgtEl, label, isBackward, railX,
        startPortIndex, portTotals[sk] || 1,
        endPortIndex,   portTotals[ek] || 1,
        leftArrowMidX[`${c.source_element_id}→${c.target_element_id}`]);

      editor.arrows.push({
        id:             Date.now() + Math.floor(Math.random() * 1e6),
        start:          srcId,
        end:            tgtId,
        startDir:       arrow.startDir,
        endDir:         arrow.endDir,
        label:          arrow.label,
        waypoints:      arrow.waypoints,
        startPortIndex,
        endPortIndex,
        _srcCsvId:      c.source_element_id,
        _isBackward:    isBackward,
        _srcType:       (csvElements.find(e => e.element_id === c.source_element_id) || {}).element_type,
        _trigger:       c.trigger    || '',
        _button:        c.button     || '',
        _validation:    c.validation || ''
      });
    });

    // ── Post-process: detect overlapping vertical segments, reassign port indices ──
    // Compute paths in memory only. For arrows sharing the same intermediate X,
    // reassign their endPortIndex so they land on different spread connection points.
    {
      const OFF = 30;

      const port = (el, dir) => {
        const hw = el.type === 'process' ? 60 : el.type === 'decision-x' ? 50 : el.type === 'system_action' ? 65 : 20;
        const hh = el.type === 'process' ? 30 : el.type === 'decision-x' ? 50 : el.type === 'system_action' ? 25 : 20;
        return dir === 'right' ? {x:el.x+hw,y:el.y} : dir === 'left' ? {x:el.x-hw,y:el.y}
             : dir === 'top'   ? {x:el.x,y:el.y-hh} : {x:el.x,y:el.y+hh};
      };

      const midX = (arrow) => {
        const se = editor.elements.find(e => e.id === arrow.start);
        const ee = editor.elements.find(e => e.id === arrow.end);
        if (!se || !ee) return null;
        if (arrow.waypoints && arrow.waypoints.length > 0) return arrow.waypoints[0].x;
        const sp = port(se, arrow.startDir);
        const ep = port(ee, arrow.endDir);
        const o1 = arrow.startDir==='right'?{x:sp.x+OFF,y:sp.y}:arrow.startDir==='left'?{x:sp.x-OFF,y:sp.y}:arrow.startDir==='top'?{x:sp.x,y:sp.y-OFF}:{x:sp.x,y:sp.y+OFF};
        const o2 = arrow.endDir==='right'?{x:ep.x+OFF,y:ep.y}:arrow.endDir==='left'?{x:ep.x-OFF,y:ep.y}:arrow.endDir==='top'?{x:ep.x,y:ep.y-OFF}:{x:ep.x,y:ep.y+OFF};
        const h1 = arrow.startDir==='left'||arrow.startDir==='right';
        const h2 = arrow.endDir==='left'||arrow.endDir==='right';
        if (h1&&h2) return (o1.x+o2.x)/2;
        if (!h1&&!h2) return o1.x;
        if (h1) return o2.x;
        return o1.x;
      };

      // Find the X of the vertical segment closest to the target (approach segment)
      const approachX = (arrow) => {
        const ee = editor.elements.find(e => e.id === arrow.end);
        if (!ee) return null;
        if (arrow.waypoints && arrow.waypoints.length > 0) {
          // Last waypoint before endpoint
          return arrow.waypoints[arrow.waypoints.length - 1].x;
        }
        // For right/left endDir, the approach offset point is at ep.x ± OFF
        const ep = port(ee, arrow.endDir);
        return arrow.endDir === 'right' ? ep.x + OFF
             : arrow.endDir === 'left'  ? ep.x - OFF
             : ep.x;
      };

      // Group arrows by approach X and target element+direction
      const groups = {};
      editor.arrows.forEach(arrow => {
        const x = approachX(arrow);
        if (x === null) return;
        const key = `${Math.round(x)}:${arrow.end}:${arrow.endDir}`;
        if (!groups[key]) groups[key] = [];
        groups[key].push(arrow);
      });

      // For groups with multiple arrows, reassign endPortIndex sequentially
      Object.values(groups).forEach(grp => {
        if (grp.length < 2) return;
        // Sort by source Y so topmost source gets lowest port index
        grp.sort((a,b) => {
          const sa = editor.elements.find(e=>e.id===a.start);
          const sb = editor.elements.find(e=>e.id===b.start);
          return (sa?.y??0) - (sb?.y??0);
        });
        grp.forEach((arrow, i) => { arrow.endPortIndex = i; });
      });
    }

    // Save initial state for undo, then render using app.js pipeline
    resetBpmnState();
    editor.saveState();
    editor.render();
    if (Object.keys(userStories).length) renderStoryIcons();

    status.textContent = `Loaded ${csvElements.length} elements, ${csvConnections.length} connections.`;
  } catch (err) {
    status.textContent = 'Error: ' + err.message;
    console.error(err);
  }
});

// ── Save diagram ──────────────────────────────────────────────────────────────
document.getElementById('save-btn').addEventListener('click', () => {
  const state = {
    elements:           editor.elements,
    arrows:             editor.arrows,
    userStories:        userStories,
    elementColors:      elementColors,
    normalSavedState:   _normalSavedState,
    bpmnSavedState:     _bpmnSavedState,
    bpmnOriginalState:  _bpmnOriginalState,
    subprocessRegistry: window._subprocessRegistry || {}
  };
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'diagram.json';
  a.click();
  URL.revokeObjectURL(url);
});

// ── Load diagram from JSON ────────────────────────────────────────────────────
document.getElementById('diagram-file').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const text = await readFile(file);
  const state = JSON.parse(text);

  // Strip subprocess elements from the loaded state — they belong in the panel,
  // not the main diagram. The panel will re-inject them when opened.
  editor.elements = (state.elements || []).filter(el => !el._subprocess);
  editor.arrows   = (state.arrows   || []).filter(a  => !a._subprocess);

  // Reset subprocess panel state
  if (typeof removeSubprocessElements === 'function') removeSubprocessElements();
  subprocessVisible  = false;
  subprocessInjected = false;

  editor.history      = [];
  editor.historyIndex = -1;
  resetBpmnState();
  if (state.userStories)    Object.assign(userStories, state.userStories);
  if (state.elementColors)  Object.assign(elementColors, state.elementColors);
  if (state.normalSavedState)  _normalSavedState  = state.normalSavedState;
  if (state.bpmnSavedState)    _bpmnSavedState    = state.bpmnSavedState;
  if (state.bpmnOriginalState) _bpmnOriginalState = state.bpmnOriginalState;
  if (state.subprocessRegistry) window._subprocessRegistry = state.subprocessRegistry;
  editor.saveState();
  editor.render();
  if (Object.keys(userStories).length) renderStoryIcons();
  document.getElementById('status').textContent = `Loaded diagram: ${editor.elements.length} elements, ${editor.arrows.length} arrows.`;
});

// ── Fix Overlaps post-processor ───────────────────────────────────────────────
document.getElementById('fix-btn').addEventListener('click', () => {
  const fixed = fixOverlaps(editor);
  if (fixed) {
    editor.saveState();
    editor.render();
    document.getElementById('status').textContent = 'Overlaps fixed.';
  } else {
    document.getElementById('status').textContent = 'No overlapping segments found.';
  }
});

document.getElementById('visio-btn').addEventListener('click', async () => {
  await exportToDrawio();
  document.getElementById('status').textContent = 'Exported diagram.vsdx — open directly in Microsoft Visio.';
});

// ── BPMN mode: decision diamond below multi-output user process boxes ─────────
// Strategy: full re-layout. Save original state, inject synthetic diamond
// elements with proper Y spacing, re-render. Restore on toggle off.

let _bpmnOriginalState = null; // original elements/arrows before first BPMN toggle
let _normalSavedState  = null; // full elements+arrows snapshot of normal mode
let _bpmnSavedState    = null; // full elements+arrows snapshot of BPMN mode

function applyBpmnDecisionLayout() {
  if (!document.getElementById('bpmn-mode').checked) return;
  if (!editor.elements.length) return;

  // First time: snapshot the original state
  if (!_bpmnOriginalState) {
    _bpmnOriginalState = {
      elements: JSON.parse(JSON.stringify(editor.elements)),
      arrows:   JSON.parse(JSON.stringify(editor.arrows))
    };
  }

  // Save current normal-mode state (positions, waypoints, everything)
  _normalSavedState = {
    elements: JSON.parse(JSON.stringify(editor.elements)),
    arrows:   JSON.parse(JSON.stringify(editor.arrows))
  };

  // If we have a previously saved BPMN state, restore it directly
  if (_bpmnSavedState) {
    editor.elements = JSON.parse(JSON.stringify(_bpmnSavedState.elements));
    editor.arrows   = JSON.parse(JSON.stringify(_bpmnSavedState.arrows));
    editor.render();
    return;
  }

  // Otherwise build BPMN layout from scratch
  const elements = JSON.parse(JSON.stringify(_bpmnOriginalState.elements));
  const arrows   = JSON.parse(JSON.stringify(_bpmnOriginalState.arrows));

  const S         = 22;   // decision-x-small half-size
  const GAP_ABOVE = 35;   // box bottom port → diamond top tip (needs room for arrow routing)
  const GAP_BELOW = 10;   // diamond bottom tip → next element
  const INSERTED  = GAP_ABOVE + S * 2 + GAP_BELOW;

  const nameById = {};
  elements.forEach(el => { if (el._csvId) nameById[el._csvId] = el.title; });

  // ── 1. Inject decision diamonds + shift layout ───────────────────────────
  // Must happen FIRST so we know final Y positions before placing end elements.
  const procIds = new Set(
    elements
      .filter(el => el.type === 'process')
      .filter(el => arrows.filter(a => a.start === el.id).length > 1)
      .map(el => el.id)
  );

  const affected = elements
    .filter(el => procIds.has(el.id))
    .sort((a, b) => a.y - b.y);

  let totalShift = 0;
  // diamondId → diamondY map, built as we go
  const diamondYByProcId = {};

  affected.forEach(procEl => {
    procEl.y += totalShift;

    const halfH      = 30;
    const boxBottomY = procEl.y + halfH;
    const diamondY   = boxBottomY + GAP_ABOVE + S;

    const origProcY = procEl.y - totalShift;
    elements.forEach(el => {
      if (el.id === procEl.id) return;
      const origY = el.y - totalShift;
      if (origY > origProcY) el.y += INSERTED;
    });
    totalShift += INSERTED;

    const diamondId = -(procEl.id);
    diamondYByProcId[procEl.id] = { diamondId, diamondY, procX: procEl.x };

    elements.push({
      id:          diamondId,
      type:        'decision-x-small',
      x:           procEl.x,
      y:           diamondY,
      title:       'User path selection',
      expanded:    false,
      subElements: [],
      minimized:   false,
      _csvId:      null,
      _isBpmnDecision: true,
      _procId:     procEl.id
    });

    // Re-route outgoing arrows from process → diamond
    arrows.forEach(a => {
      if (a.start === procEl.id) {
        a.start = diamondId;
        a._fromDiamond = true;
      }
    });

    // Connector: process bottom → diamond top
    arrows.push({
      id:          -(Date.now() + Math.floor(Math.random() * 1e6)),
      start:       procEl.id,
      end:         diamondId,
      startDir:    'bottom',
      endDir:      'top',
      label:       '',
      waypoints:   [],
      startPortIndex: 0,
      endPortIndex:   0,
      _srcCsvId:   procEl._csvId,
      _isBackward: false,
      _srcType:    'user_action_process',
      _trigger: '', _button: '', _validation: '',
      _isBpmnConnector: true
    });
  });

  // ── 2. Inject "Return to stage" end elements for backward arrows ─────────
  // Now that Y positions are final, place end elements at the correct Y.
  const backwardArrows = arrows.filter(a => a._isBackward);

  backwardArrows.forEach(arrow => {
    // The arrow's start may have been re-routed to a diamond — find the actual source element
    const srcEl = elements.find(e => e.id === arrow.start);
    if (!srcEl) return;

    // Find original target name
    const origTgtId = _bpmnOriginalState.arrows.find(oa => oa.id === arrow.id)?.end;
    const origTgt   = _bpmnOriginalState.elements.find(e => e.id === origTgtId);
    const targetName = nameById[origTgt?._csvId] || origTgt?.title || '?';

    // End element goes to the RIGHT of the source, at the same Y
    const hw  = srcEl.type === 'process' ? 90 : srcEl.type === 'decision-x-small' ? 22 : srcEl.type === 'decision-x' ? 50 : 22;
    const endX = srcEl.x + hw + 180;
    const endY = srcEl.y;   // same row as source — guaranteed straight right arrow
    const endId = -(arrow.id);

    elements.push({
      id:          endId,
      type:        'end',
      x:           endX,
      y:           endY,
      title:       `Return to stage: ${targetName}`,
      expanded:    false,
      subElements: [],
      minimized:   false,
      _csvId:      null,
      _isBpmnEnd:  true
    });

    // Replace backward arrow: now goes right from source → end element
    arrow.end         = endId;
    arrow.startDir    = 'right';
    arrow.endDir      = 'left';
    arrow.waypoints   = [];
    arrow._isBackward = false;
  });

  // ── 3. Recalculate startDir for arrows from diamonds ────────────────────
  arrows.forEach(a => {
    if (!a._fromDiamond) return;
    const srcEl = elements.find(e => e.id === a.start);
    const tgtEl = elements.find(e => e.id === a.end);
    if (!srcEl || !tgtEl) return;
    const dx = tgtEl.x - srcEl.x;
    const dy = tgtEl.y - srcEl.y;
    if (Math.abs(dx) > Math.abs(dy) * 0.6) {
      const preferredEnd = dx > 0 ? 'left' : 'right';
      // If preferred entry port is taken by an inbound arrow, use bottom instead
      const endDir = (preferredEnd === 'left' && tgtEl._inboundLeft) ? 'bottom'
                   : (preferredEnd === 'right' && tgtEl._inboundRight) ? 'bottom'
                   : preferredEnd;
      a.startDir = dx > 0 ? 'right' : 'left';
      a.endDir   = endDir;
    } else {
      a.startDir = dy >= 0 ? 'bottom' : 'top';
      a.endDir   = dy >= 0 ? 'top'    : 'bottom';
    }
    a.waypoints = [];
  });

  // ── 4. Fix the process→diamond connector: straight down, clear waypoints ─
  arrows.forEach(a => {
    if (!a._isBpmnConnector) return;
    a.waypoints = [];
  });

  // ── 5. Non-return arrows from diamond that change direction ─────────────
  // Exit bottom with DROP offset; shift target element to same Y so arrow
  // goes straight right without backtracking.
  const DROP = 80;
  arrows.forEach(a => {
    if (!a._fromDiamond) return;
    const tgtEl = elements.find(e => e.id === a.end);
    if (!tgtEl || tgtEl._isBpmnEnd) return;
    const srcEl = elements.find(e => e.id === a.start);
    if (!srcEl) return;
    const isDirectlyBelow = Math.abs(tgtEl.x - srcEl.x) < 30;
    if (isDirectlyBelow) return;
    const S = 22;
    const diamondBottomY = srcEl.y + S;
    const wpY = diamondBottomY + DROP;
    a.startDir = 'bottom';
    a.endDir   = 'left';
    a.waypoints = [{ x: srcEl.x, y: wpY }];
    // Shift target element to align with the turn point
    tgtEl.y = wpY;
    tgtEl._inboundLeft = true;  // left port taken by this inbound arrow
  });


  // ── Post-pass: fix port collisions — if inbound and outbound share same side,
  // offset the outbound startPortIndex so port spreading separates them visually
  elements.forEach(el => {
    const inbound  = arrows.filter(a => a.end   === el.id);
    const outbound = arrows.filter(a => a.start === el.id);
    ['left','right','top','bottom'].forEach(side => {
      const inSide  = inbound.filter(a  => a.endDir   === side);
      const outSide = outbound.filter(a => a.startDir === side);
      if (inSide.length > 0 && outSide.length > 0) {
        // Offset outbound port indices past the inbound ones
        outSide.forEach((a, i) => { a.startPortIndex = inSide.length + i; });
      }
    });
  });

  editor.elements = elements;
  editor.arrows   = arrows;
  editor.render();
}

function restoreBpmnDecisionLayout() {
  if (!_bpmnOriginalState) return;

  // Save full BPMN state before leaving
  _bpmnSavedState = {
    elements: JSON.parse(JSON.stringify(editor.elements)),
    arrows:   JSON.parse(JSON.stringify(editor.arrows))
  };

  // Restore normal-mode state
  if (_normalSavedState) {
    editor.elements = JSON.parse(JSON.stringify(_normalSavedState.elements));
    editor.arrows   = JSON.parse(JSON.stringify(_normalSavedState.arrows));
  } else {
    editor.elements = JSON.parse(JSON.stringify(_bpmnOriginalState.elements));
    editor.arrows   = JSON.parse(JSON.stringify(_bpmnOriginalState.arrows));
  }
  editor.render();
}

// Reset saved state whenever a new diagram is loaded
function resetBpmnState() {
  _bpmnOriginalState = null;
  _normalSavedState  = null;
  _bpmnSavedState    = null;
}

// ── Register post-render hook ─────────────────────────────────────────────────
// Fires after every editor.render() call
editor.onAfterRender = () => {
  // Keep normal-mode snapshot current so drag/edit changes survive BPMN toggle
  if (!document.getElementById('bpmn-mode').checked && _bpmnOriginalState) {
    _normalSavedState = {
      elements: JSON.parse(JSON.stringify(editor.elements)),
      arrows:   JSON.parse(JSON.stringify(editor.arrows))
    };
  }
  // Keep BPMN snapshot current while in BPMN mode
  if (document.getElementById('bpmn-mode').checked && _bpmnOriginalState) {
    _bpmnSavedState = {
      elements: JSON.parse(JSON.stringify(editor.elements)),
      arrows:   JSON.parse(JSON.stringify(editor.arrows))
    };
  }
  applyArrowColors();
  if (Object.keys(userStories).length) renderStoryIcons();
  renderSubprocessIcon();
  renderUserIcons();
  renderLockIcon();
  renderSubprocessOnCanvas();
  renderConnectionIcons();
  renderBpmnPretitles();
};

// Pretitle overlay — just the "Data review stage for:" text on process boxes
// that have a synthetic diamond below them (identified by _isBpmnDecision arrows)
function renderBpmnPretitles() {
  document.querySelectorAll('.bpmn-pretitle').forEach(el => el.remove());
  if (!document.getElementById('bpmn-mode').checked) return;
  const svg = document.getElementById('canvas');
  const GREY = '#888888';
  editor.elements.forEach(el => {
    if (el.type !== 'process') return;
    // Has a connector arrow going to a synthetic diamond?
    const hasConnector = editor.arrows.some(a => a.start === el.id && a._isBpmnConnector);
    if (!hasConnector) return;
    const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    t.setAttribute('x', el.x);
    t.setAttribute('y', el.y - 18);
    t.setAttribute('text-anchor', 'middle');
    t.setAttribute('font-size', '9');
    t.setAttribute('fill', GREY);
    t.setAttribute('pointer-events', 'none');
    t.classList.add('bpmn-pretitle');
    t.textContent = 'Data review stage for:';
    svg.appendChild(t);
  });
}

document.getElementById('bpmn-mode').addEventListener('change', () => {
  const bpmnOn = document.getElementById('bpmn-mode').checked;
  const status = document.getElementById('status');
  if (bpmnOn) {
    status.textContent = 'ℹ️ Tryb BPMN włączony — pozycje obu widoków są zapamiętywane.';
    applyBpmnDecisionLayout();
  } else {
    status.textContent = 'ℹ️ Tryb normalny — pozycje BPMN zostały zapamiętane.';
    restoreBpmnDecisionLayout();
  }
});
