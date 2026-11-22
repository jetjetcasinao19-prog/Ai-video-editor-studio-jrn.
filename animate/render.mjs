// CLI for the code-animated shorts.
//
//   node render.mjs <project>                    full MP4 → <project>/out/<slug>.mp4
//   node render.mjs <project> --sheet            contact sheet of every scene → <project>/build/sheet.png
//   node render.mjs <project> --stills 3.2,14,41 PNG stills → <project>/build/stills/
//   node render.mjs <project> --from 10 --to 20  render only part of the timeline
//   node render.mjs <project> --look night --sheet  preview another look (classic, album, tile, night, scroll)
//   options: --workers N  --out file.mp4  --crf 18
import path from 'node:path';
import { render, stills, contactSheet } from './lib/engine.mjs';

const args = process.argv.slice(2);
const dir = args.find(a => !a.startsWith('--') && !/^[\d.,]+$/.test(a));
const opt = k => { const i = args.indexOf('--' + k); return i >= 0 ? (args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true) : undefined; };
if (typeof opt('look') === 'string') process.env.ANIMATE_LOOK = opt('look');
if (!dir) { console.error('usage: node render.mjs <project> [--sheet | --stills t1,t2 | --from s --to s] [--workers N] [--out file]'); process.exit(2); }

if (opt('sheet')) {
  const times = typeof opt('sheet') === 'string' ? opt('sheet').split(',').map(Number) : undefined;
  console.log(await contactSheet(dir, path.join(dir, 'build', 'sheet.png'), { times }));
} else if (opt('stills')) {
  for (const f of await stills(dir, String(opt('stills')).split(',').map(Number), path.join(dir, 'build', 'stills'))) console.log(f);
} else {
  await render(dir, {
    out: opt('out'), workers: opt('workers') ? +opt('workers') : undefined,
    from: opt('from') ? +opt('from') : 0, to: opt('to') ? +opt('to') : null, crf: opt('crf') ? +opt('crf') : 18,
  });
}
