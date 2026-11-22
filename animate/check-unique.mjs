// Is this video different enough from the channel's other videos?
//
//   node check-unique.mjs projects/<name>            exit 1 if it fails
//   node check-unique.mjs projects/<name> --look tile   try it in another look
//
// Fails when the page design matches the latest videos or more than a quarter
// of the pictures are near-copies of other videos. Warnings cover music,
// transitions, particles and the script's opening formula.
import { checkUnique } from './lib/unique.mjs';

const args = process.argv.slice(2);
const dir = args.find(a => !a.startsWith('--'));
const i = args.indexOf('--look'), look = i >= 0 ? args[i + 1] : null;
if (!dir) { console.error('usage: node check-unique.mjs <project> [--look name]'); process.exit(2); }

const r = await checkUnique(dir, { look, log: m => process.stderr.write(m + '\n') });
console.log(`look: ${r.facts.look} · particles: ${r.facts.ambient} · music: ${r.facts.music} · ${r.facts.scenes} scenes · compared with ${r.facts.compared} videos`);
console.log(`latest videos: ${r.facts.latest.join(', ') || 'none'}`);
for (const f of r.fails) console.log('FAIL  ' + f);
for (const w of r.warns) console.log('warn  ' + w);
console.log(r.ok ? 'UNIQUE ENOUGH ✔' : 'TOO SIMILAR ✘');
process.exit(r.ok ? 0 : 1);
