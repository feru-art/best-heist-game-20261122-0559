// Vaultlight — main.ts: hands the heist game in.
// Copies game/ and screenshots/ from this repository into the output
// directory, then writes the dossier the judge reads with buildDossier
// from vendor/makefun-game.ts. No clock, no network, no randomness:
// two runs write the same bytes.
import { copyFileSync, lstatSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)));
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output;
// the grader itself always writes to /output.
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function copyTreeInto(srcDir: string, destDir: string): void {
  mkdirSync(destDir, { recursive: true });
  for (const name of readdirSync(srcDir)) {
    const src = join(srcDir, name);
    const dest = join(destDir, name);
    if (lstatSync(src).isDirectory()) {
      copyTreeInto(src, dest);
    } else {
      copyFileSync(src, dest);
    }
  }
}

copyTreeInto(join(repoRoot, 'game'), join(outDir, 'game'));
copyTreeInto(join(repoRoot, 'screenshots'), join(outDir, 'screenshots'));

const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);
