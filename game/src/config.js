// V7 "Blueprint" — configuration, palette and level data.
// The whole game renders as a living architectural blueprint: deep blue
// paper, white line-art walls, saturated red vision cones, gold loot.
const CFG = {
  W: 1280, H: 720, HUD: 64,
  PLAYER_R: 14, PLAYER_SPEED: 200, VENT_SPEED: 120,
  GUARD_R: 15, GUARD_SPEED: 75, CHASE_SPEED: 165,
  CONE_RANGE: 225, CONE_HALF: 0.60,
  CAM_RANGE: 240, CAM_HALF: 0.48,
  SUS_RISE: 55, SUS_FALL: 30, CHASE_AT: 80,
  ALARM_RISE: 13, ALARM_FALL: 4,
  TOOLS: {
    decoy: { key: '1', cost: 30, name: 'DECOY', desc: 'noise lure' },
    emp: { key: '2', cost: 40, name: 'EMP', desc: 'freeze cameras 5s' },
  },
};

const PAL = {
  paper: '#0d2a6b', paper2: '#0a2158', grid: 'rgba(255,255,255,0.07)',
  wall: '#e9f1ff', wallEdge: '#071a45', cover: '#bcd2ff', coverEdge: '#ffffff',
  vent: '#123a8f', ventEdge: '#ffffff',
  thief: '#ffffff', thiefEdge: '#071a45', mask: '#0a1030',
  guard: '#ff5a3c', guardEdge: '#7a1505',
  cone: 'rgba(255,70,50,0.30)', coneEdge: 'rgba(255,90,60,0.85)',
  camCone: 'rgba(255,70,50,0.22)', camOff: 'rgba(160,170,200,0.25)',
  loot: '#ffd23f', lootEdge: '#8a5b00',
  exit: '#2ee06f', exitOff: '#5a6b8a', route: '#ffffff',
  hud: '#071a45', text: '#ffffff', alarm: '#ff3b30', alarmMid: '#ffb340',
  alarmLow: '#2ee06f',
};

// One room per level. walls/cover block movement and sight; vents hide the
// thief; every level has at least two routes (floor + vent/service lane).
const LEVELS = [
  {
    name: 'LEVEL 1 — THE GALLERY', quota: 3,
    spawn: { x: 90, y: 620 },
    exit: { x: 1130, y: 600, w: 90, h: 60 },
    walls: [
      { x: 300, y: 150, w: 26, h: 300 },
      { x: 620, y: 300, w: 26, h: 320 },
      { x: 860, y: 120, w: 26, h: 260 },
      { x: 430, y: 120, w: 300, h: 26 },
    ],
    cover: [
      { x: 180, y: 220, w: 70, h: 46, label: 'CASE' },
      { x: 470, y: 470, w: 90, h: 50, label: 'DESK' },
      { x: 760, y: 520, w: 80, h: 46, label: 'CASE' },
      { x: 1010, y: 220, w: 70, h: 46, label: 'DESK' },
    ],
    vents: [ { x: 120, y: 120, w: 980, h: 34 } ],
    guards: [
      { path: [[420, 250], [420, 560], [560, 560], [560, 250]], speed: 75 },
      { path: [[980, 180], [980, 480], [1120, 480], [1120, 180]], speed: 75 },
    ],
    cameras: [ { x: 640, y: 96, a0: 0.5, a1: 2.4, speed: 0.55 } ],
    loot: [ { x: 250, y: 150 }, { x: 700, y: 200 }, { x: 1080, y: 420 } ],
  },
  {
    name: 'LEVEL 2 — THE VAULT WING', quota: 4,
    spawn: { x: 90, y: 150 },
    exit: { x: 1130, y: 120, w: 90, h: 60 },
    walls: [
      { x: 260, y: 220, w: 26, h: 340 },
      { x: 560, y: 120, w: 26, h: 300 },
      { x: 900, y: 260, w: 26, h: 360 },
      { x: 700, y: 560, w: 300, h: 26 },
    ],
    cover: [
      { x: 150, y: 420, w: 80, h: 50, label: 'SAFE' },
      { x: 380, y: 180, w: 90, h: 50, label: 'DESK' },
      { x: 700, y: 380, w: 80, h: 46, label: 'CASE' },
      { x: 1030, y: 480, w: 80, h: 50, label: 'SAFE' },
    ],
    vents: [
      { x: 120, y: 620, w: 700, h: 34 },
      { x: 1150, y: 200, w: 34, h: 320 },
    ],
    guards: [
      { path: [[380, 300], [380, 560], [500, 560], [500, 300]], speed: 82 },
      { path: [[760, 180], [760, 480], [860, 480], [860, 180]], speed: 82 },
      { path: [[1060, 300], [1060, 560], [1150, 560], [1150, 300]], speed: 78 },
    ],
    cameras: [
      { x: 300, y: 96, a0: 0.4, a1: 2.5, speed: 0.6 },
      { x: 980, y: 96, a0: 0.6, a1: 2.3, speed: 0.5 },
    ],
    loot: [ { x: 200, y: 560 }, { x: 470, y: 300 }, { x: 820, y: 220 }, { x: 1100, y: 620 } ],
  },
  {
    name: 'LEVEL 3 — THE PENTHOUSE SAFE', quota: 4,
    spawn: { x: 640, y: 640 },
    exit: { x: 90, y: 120, w: 90, h: 60 },
    walls: [
      { x: 220, y: 150, w: 26, h: 280 },
      { x: 520, y: 300, w: 26, h: 320 },
      { x: 820, y: 150, w: 26, h: 280 },
      { x: 950, y: 480, w: 220, h: 26 },
    ],
    cover: [
      { x: 330, y: 200, w: 90, h: 50, label: 'DESK' },
      { x: 640, y: 200, w: 80, h: 46, label: 'CASE' },
      { x: 380, y: 520, w: 80, h: 50, label: 'SAFE' },
      { x: 980, y: 300, w: 80, h: 46, label: 'CASE' },
    ],
    vents: [
      { x: 120, y: 120, w: 500, h: 34 },
      { x: 700, y: 620, w: 460, h: 34 },
    ],
    guards: [
      { path: [[300, 300], [300, 560], [440, 560], [440, 300]], speed: 88 },
      { path: [[640, 260], [640, 560], [760, 560], [760, 260]], speed: 88 },
      { path: [[1000, 200], [1000, 420], [1130, 420], [1130, 200]], speed: 84 },
      { path: [[180, 500], [180, 640], [320, 640], [320, 500]], speed: 84 },
    ],
    cameras: [
      { x: 460, y: 96, a0: 0.4, a1: 2.5, speed: 0.65 },
      { x: 1120, y: 96, a0: 0.7, a1: 2.2, speed: 0.55 },
      { x: 100, y: 380, a0: -0.6, a1: 0.9, speed: 0.5 },
    ],
    loot: [ { x: 280, y: 620 }, { x: 600, y: 150 }, { x: 900, y: 560 }, { x: 1150, y: 300 } ],
  },
];
