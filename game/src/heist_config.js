// Vaultlight — heist_config.js: constants, palette and small geometry helpers.
// Every number the game balances on lives here, so tuning never touches logic.

function clampHeist(value, low, high) {
  return value < low ? low : value > high ? high : value;
}

function distanceHeist(ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay;
  return Math.sqrt(dx * dx + dy * dy);
}

function angleToHeist(ax, ay, bx, by) {
  return Math.atan2(by - ay, bx - ax);
}

function angleDiffHeist(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

function mulberrySeed(seed) {
  let s = seed >>> 0;
  return function seededRandom() {
    s |= 0; s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Circle (px,py,r) against a solid rectangle: true when they overlap.
function circleHitsRect(px, py, r, rect) {
  const nx = clampHeist(px, rect.x, rect.x + rect.w);
  const ny = clampHeist(py, rect.y, rect.y + rect.h);
  const dx = px - nx, dy = py - ny;
  return dx * dx + dy * dy < r * r;
}

// Push a circle out of a solid rectangle along the smallest overlap axis.
function resolveCircleRect(px, py, r, rect) {
  const nx = clampHeist(px, rect.x, rect.x + rect.w);
  const ny = clampHeist(py, rect.y, rect.y + rect.h);
  let dx = px - nx, dy = py - ny;
  let d2 = dx * dx + dy * dy;
  if (d2 >= r * r) return { x: px, y: py };
  if (d2 === 0) {
    const left = px - rect.x, right = rect.x + rect.w - px;
    const top = py - rect.y, bottom = rect.y + rect.h - py;
    const m = Math.min(left, right, top, bottom);
    if (m === left) return { x: rect.x - r, y: py };
    if (m === right) return { x: rect.x + rect.w + r, y: py };
    if (m === top) return { x: px, y: rect.y - r };
    return { x: px, y: rect.y + rect.h + r };
  }
  const d = Math.sqrt(d2);
  const push = (r - d) / d;
  return { x: px + dx * push, y: py + dy * push };
}

const HEIST = {
  viewW: 1280,
  viewH: 720,
  hudH: 64,
  wallT: 24,
  thiefRadius: 14,
  guardRadius: 15,
  walkSpeed: 175,
  runSpeed: 285,
  ventSpeed: 95,
  guardPatrolSpeed: 72,
  guardChaseSpeed: 232,
  guardSuspicionRate: 95,
  cameraSuspicionRate: 70,
  alarmChaseRate: 30,
  alarmCameraRate: 42,
  alarmDecayRate: 8,
  suspicionDecayRate: 26,
  coneRange: 250,
  coneHalfAngle: 0.56,
  cameraRange: 225,
  cameraHalfAngle: 0.5,
  noiseHearRadius: 285,
  smokeCost: 20,
  smokeRadius: 95,
  smokeSeconds: 4,
  empSeconds: 5,
  startCoins: 40,
  startEmp: 2,
  // V5 look, kept in the merge — "gilded noir": warm brown-gold floors,
  // deep-blue shadow, brighter gold trim.
  palette: {
    floor: '#4a3f30',
    floorAlt: '#413829',
    wall: '#171310',
    wallTrim: '#d8b45a',
    shadow: '#12233d',
    carpet: '#6e1f2a',
    guardBody: '#e9e4d6',
    guardOutline: '#d43d2a',
    cone: 'rgba(255,178,58,0.42)',
    coneEdge: 'rgba(255,205,90,0.95)',
    coneAlert: 'rgba(255,64,48,0.5)',
    cameraCone: 'rgba(110,195,255,0.32)',
    cameraEdge: 'rgba(140,210,255,0.9)',
    lootGold: '#ffd24a',
    lootGlow: 'rgba(255,210,74,0.55)',
    exitGreen: '#3dff88',
    exitDark: '#0d5c2e',
    ventSteel: '#8d97a8',
    text: '#f2ead8',
    textDim: '#b9b2a0',
    alarmRed: '#ff4530',
    smokeFill: 'rgba(210,210,210,0.55)'
  }
};
