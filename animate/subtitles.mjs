// Write the .srt subtitle file for one project or all of them.
//   node subtitles.mjs projects/<name>   |   node subtitles.mjs --all
import fs from 'node:fs';
import path from 'node:path';
import { loadProject } from './lib/engine.mjs';
import { writeSrt } from './lib/srt.mjs';
const args = process.argv.slice(2), root = path.join(path.dirname(new URL(import.meta.url).pathname), 'projects');
const dirs = args.includes('--all') ? fs.readdirSync(root).filter(n => fs.existsSync(path.join(root, n, 'story.mjs'))).map(n => path.join(root, n)) : args;
for (const d of dirs) { const p = await loadProject(d); console.log(writeSrt(p.dir, p.meta, p.words)); }
