// Is this video different enough from the channel's other videos?
//
//   node check-unique.mjs projects/<name>            exit 1 if it fails
//   node check-unique.mjs projects/<name> --look tile   try it in another look
//
// Fails when the page design matches the latest videos or more than a quarter
// of the pictures are near-copies of other videos. Warnings cover music,
// transitions, particles and the script's opening formula.
import fs from 'node:fs';
import path from 'node:path';
import { checkUnique } from './lib/unique.mjs';

const args = process.argv.slice(2);
const dir = args.find(a => !a.startsWith('--'));
const i = args.indexOf('--look'), look = i >= 0 ? args[i + 1] : null;
// --all: check every project against the rest (the whole channel at once)
if (args.includes('--all')) {
  const root = path.join(path.dirname(new URL(import.meta.url).pathname), 'projects');
  const names = fs.readdirSync(root).filter(n => fs.existsSync(path.join(root, n, 'story.mjs')) && fs.existsSync(path.join(root, n, 'words.json')));
  let bad = 0; const rows = [];
  for (const n of names) {
    const r = await checkUnique(path.join(root, n));
    if (!r.ok) bad++;
    rows.push({ n, r });
  }
  rows.sort((a, b) => (a.r.facts.order ?? 0) - (b.r.facts.order ?? 0));
  for (const { n, r } of rows) {
    console.log(`${r.ok ? 'OK  ' : 'FAIL'}  ${n.padEnd(24)} ${r.facts.look.padEnd(8)} ${r.facts.device.padEnd(10)} ${r.facts.music.padEnd(16)} after: ${r.facts.latest.join(', ') || '—'}`);
    for (const f of r.fails) console.log('        FAIL ' + f);
    for (const w of r.warns) console.log('        warn ' + w);
  }
  console.log(bad ? `${bad} of ${rows.length} videos are TOO SIMILAR ✘` : `all ${rows.length} videos are unique enough ✔`);
  process.exit(bad ? 1 : 0);
}
if (!dir) { console.error('usage: node check-unique.mjs <project> [--look name] | --all'); process.exit(2); }

const r = await checkUnique(dir, { look, log: m => process.stderr.write(m + '\n') });
console.log(`look: ${r.facts.look} · device: ${r.facts.device} · particles: ${r.facts.ambient} · music: ${r.facts.music} · ${r.facts.scenes} scenes · compared with ${r.facts.compared} videos`);
console.log(`latest videos: ${r.facts.latest.join(', ') || 'none'}`);
for (const f of r.fails) console.log('FAIL  ' + f);
for (const w of r.warns) console.log('warn  ' + w);
console.log(r.ok ? 'UNIQUE ENOUGH ✔' : 'TOO SIMILAR ✘');
process.exit(r.ok ? 0 : 1);
