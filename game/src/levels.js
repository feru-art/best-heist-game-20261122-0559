// Vaultlight — levels.js: the three rooms of the heist.
// Each level is data only: walls and cases block movement and sight,
// loot has a value, guards walk waypoints, cameras sweep, vents hide,
// and the exit only opens once the loot quota is met.

function outerWallsHeist() {
  return [
    { x: 0, y: 64, w: 1280, h: 24 },
    { x: 0, y: 696, w: 1280, h: 24 },
    { x: 0, y: 64, w: 24, h: 656 },
    { x: 1256, y: 64, w: 24, h: 656 }
  ];
}

const LEVELS = [
  {
    name: 'The Gilded Gallery',
    objective: 'Steal 3 treasures, then reach the EXIT.',
    quota: 3,
    walls: outerWallsHeist().concat([
      { x: 560, y: 200, w: 24, h: 220 },
      { x: 980, y: 88, w: 24, h: 212 },
      { x: 980, y: 300, w: 140, h: 24 },
      { x: 700, y: 420, w: 300, h: 24 }
    ]),
    cases: [
      { x: 300, y: 220, w: 90, h: 60 },
      { x: 300, y: 480, w: 90, h: 60 },
      { x: 700, y: 180, w: 90, h: 60 },
      { x: 850, y: 500, w: 110, h: 60 }
    ],
    shadows: [
      { x: 40, y: 520, w: 260, h: 160 },
      { x: 1000, y: 330, w: 240, h: 120 }
    ],
    rugs: [{ x: 420, y: 300, w: 440, h: 120 }],
    loot: [
      { x: 170, y: 150, kind: 'painting', name: 'Sunset Heist', value: 400 },
      { x: 760, y: 130, kind: 'painting', name: 'The Duchess', value: 400 },
      { x: 1140, y: 180, kind: 'gold', name: 'Gold Bars', value: 900 },
      { x: 905, y: 530, kind: 'statue', name: 'Jade Falcon', value: 700 },
      { x: 640, y: 620, kind: 'documents', name: 'Vault Codes', value: 500 }
    ],
    guards: [
      { waypoints: [[640, 300], [920, 300], [920, 540], [640, 540]] },
      { waypoints: [[1080, 420], [1080, 620], [940, 620]] }
    ],
    cameras: [
      { x: 1216, y: 112, base: 2.35, sweep: 0.7 },
      { x: 60, y: 110, base: 0.5, sweep: 0.6 }
    ],
    vents: [
      { path: [[120, 660], [1160, 660]] },
      { path: [[80, 160], [80, 620]] }
    ],
    exit: { x: 1216, y: 360, w: 40, h: 80, label: 'EXIT' },
    playerStart: { x: 110, y: 580 }
  },
  {
    name: 'The Vault Floor',
    objective: 'Crack the vault. Steal 4, then leave.',
    quota: 4,
    walls: outerWallsHeist().concat([
      { x: 520, y: 200, w: 140, h: 24 },
      { x: 760, y: 200, w: 120, h: 24 },
      { x: 520, y: 520, w: 140, h: 24 },
      { x: 760, y: 520, w: 120, h: 24 },
      { x: 520, y: 200, w: 24, h: 320 },
      { x: 856, y: 200, w: 24, h: 320 }
    ]),
    cases: [
      { x: 200, y: 200, w: 90, h: 60 },
      { x: 200, y: 500, w: 90, h: 60 },
      { x: 1050, y: 200, w: 90, h: 60 },
      { x: 1050, y: 500, w: 90, h: 60 }
    ],
    shadows: [
      { x: 40, y: 100, w: 220, h: 140 },
      { x: 1020, y: 560, w: 220, h: 120 }
    ],
    rugs: [{ x: 560, y: 330, w: 280, h: 140 }],
    loot: [
      { x: 700, y: 360, kind: 'gold', name: 'Bullion Stack', value: 1200 },
      { x: 640, y: 460, kind: 'diamond', name: 'The Marisol', value: 1500 },
      { x: 780, y: 460, kind: 'gold', name: 'Gold Bars', value: 900 },
      { x: 150, y: 600, kind: 'documents', name: 'Ledger Pages', value: 500 },
      { x: 1150, y: 150, kind: 'painting', name: 'Night Watch', value: 600 },
      { x: 1150, y: 600, kind: 'gold', name: 'Coin Sacks', value: 800 }
    ],
    guards: [
      { waypoints: [[300, 360], [470, 360]] },
      { waypoints: [[1000, 360], [1150, 360]] },
      { waypoints: [[620, 130], [820, 130]] }
    ],
    cameras: [
      { x: 60, y: 110, base: 0.6, sweep: 0.6 },
      { x: 1220, y: 640, base: -2.4, sweep: 0.6 }
    ],
    vents: [{ path: [[80, 160], [80, 620]] }],
    exit: { x: 1216, y: 360, w: 40, h: 80, label: 'EXIT' },
    playerStart: { x: 80, y: 640 }
  },
  {
    name: 'Rooftop Getaway',
    objective: 'Last score. Steal 3, reach the VAN.',
    quota: 3,
    walls: outerWallsHeist().concat([
      { x: 500, y: 300, w: 24, h: 200 },
      { x: 900, y: 400, w: 200, h: 24 }
    ]),
    cases: [
      { x: 300, y: 200, w: 120, h: 80 },
      { x: 700, y: 450, w: 120, h: 80 },
      { x: 950, y: 180, w: 100, h: 70 }
    ],
    shadows: [
      { x: 40, y: 520, w: 260, h: 160 },
      { x: 560, y: 100, w: 240, h: 120 }
    ],
    rugs: [],
    loot: [
      { x: 760, y: 200, kind: 'gold', name: 'Safe Deposit', value: 1000 },
      { x: 1100, y: 300, kind: 'diamond', name: 'Star of the City', value: 1800 },
      { x: 200, y: 150, kind: 'documents', name: 'Escape Routes', value: 500 },
      { x: 1000, y: 600, kind: 'gold', name: 'Cash Bundles', value: 900 },
      { x: 420, y: 620, kind: 'statue', name: 'Bronze Owl', value: 700 }
    ],
    guards: [
      { waypoints: [[400, 300], [400, 600]] },
      { waypoints: [[800, 300], [1100, 300]] },
      { waypoints: [[640, 150], [640, 500]] }
    ],
    cameras: [
      { x: 60, y: 110, base: 0.5, sweep: 0.7 },
      { x: 1220, y: 110, base: 2.6, sweep: 0.7 }
    ],
    vents: [{ path: [[120, 660], [640, 660]] }],
    exit: { x: 1200, y: 330, w: 56, h: 90, label: 'VAN' },
    playerStart: { x: 90, y: 620 }
  }
];
