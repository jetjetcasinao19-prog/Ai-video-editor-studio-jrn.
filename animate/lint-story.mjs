// Craft check for a storyboard — catches the habits that read as "AI slop".
//
//   node lint-story.mjs projects/<name>     exit 1 if a must-fix rule fails
//   node lint-story.mjs --all               every project, one line each
import fs from 'node:fs';
import path from 'node:path';
import { lintStory } from './lib/lint.mjs';

const args = process.argv.slice(2);
const root = path.join(path.dirname(new URL(import.meta.url).pathname), 'projects');
const dirs = args.includes('--all')
  ? fs.readdirSync(root).filter(n => fs.existsSync(path.join(root, n, 'story.mjs'))).map(n => path.join(root, n))
  : args.filter(a => !a.startsWith('--'));
if (!dirs.length) { console.error('usage: node lint-story.mjs <project> | --all'); process.exit(2); }

let bad = 0;
for (const d of dirs) {
  const r = await lintStory(d);
  if (!r.ok) bad++;
  const s = r.stats;
  console.log(`${r.ok ? 'OK  ' : 'FIX '} ${path.basename(d).padEnd(24)} labels ${s.labels} (echo ${s.echo}) · stamps ${s.stamps} · still scenes ${s.still} · camera ${s.camera}/${s.scenes}`);
  for (const i of r.issues) console.log(`      ${i.level === 'fix' ? 'FIX ' : 'warn'} ${i.rule}: ${i.msg}\n           → ${i.fix}`);
  if (dirs.length === 1) for (const n of r.notes) console.log(`      note ${n}`);
}
if (dirs.length > 1) console.log(bad ? `${bad} of ${dirs.length} stories need fixes` : `all ${dirs.length} stories pass`);
process.exit(bad ? 1 : 0);
