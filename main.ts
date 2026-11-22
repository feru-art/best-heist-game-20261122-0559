// V7 "Blueprint" — a planning-heavy heist game for best-heist-game-20261122-0559.
//
// The game is the static game/ folder beside this file: game/index.html plus
// plain script files, no libraries and no network requests, so it opens and
// plays offline in a desktop browser. This program hands it in: it copies
// game/ and screenshots/ into the output directory and writes
// dossier.json, the summary the judge reads, using the vendored make.fun
// library (vendor/makefun-game.ts, the kit's copy, unchanged).
//
// The player first draws a route on the architectural blueprint (PLAN phase),
// then executes it: guards with vision cones, CCTV cameras, a loot quota,
// an alarm meter, costed tools (Decoy, EMP), service vents, and a getaway
// exit that unlocks once the quota is met. Three levels, synthesized
// WebAudio sound, no assets beyond the code itself.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Fail loudly (instead of handing in an empty entry) if the game folder
// is missing from beside this file.
if (!existsSync(join(here, 'game'))) {
  throw new Error('game/ not found beside main.ts: ' + join(here, 'game'));
}

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes
// the bytes; the rest refuse an entry the scorer would refuse — more than
// 4 screenshots or one over 256 KiB; more than 993 files in game/ or 48 MiB
// of game files in all; or a path under game/ over 1000 bytes.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
