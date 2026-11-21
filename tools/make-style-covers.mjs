// Makes the cover pictures for the story styles (img/styles/<id>.webp) with the
// free Pollinations picture service. Run once after adding a style:
//   node tools/make-style-covers.mjs          (only missing covers)
//   node tools/make-style-covers.mjs --all    (remake every cover)
// Look at every new cover: the free model is weak at cartoons, so re-run with
// --all after changing a style's `cover` prompt, or draw it with code instead.
// Needs internet and ffmpeg. The free service stamps a small mark at the bottom,
// so a slightly taller picture is made and the bottom 7% is cut off.
// Behind a proxy: NODE_USE_ENV_PROXY=1 node tools/make-style-covers.mjs
import { createRequire } from 'module';
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const { STYLES } = require(path.join(root, 'story-styles.js'));
const out = path.join(root, 'img', 'styles');
fs.mkdirSync(out, { recursive: true });
const all = process.argv.includes('--all');
// These covers are drawn with code (tools/draw-style-covers.mjs), not by the AI service.
const DRAWN = ['claude-cartoon', 'stickman-horror', 'silhouette-explainer', 'stick', 'paper', 'before-after'];
const sleep = ms => new Promise(r => setTimeout(r, ms));
let made = 0, failed = [];
for (const s of STYLES) {
  const file = path.join(out, s.id + '.webp');
  if (DRAWN.includes(s.id) || (!all && fs.existsSync(file))) continue;
  const prompt = s.cover + ', no text'; // short, concrete prompts work best with the free model
  const seed = [...s.id].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7) % 1e6;
  const url = 'https://image.pollinations.ai/prompt/' + encodeURIComponent(prompt) + '?width=640&height=516&seed=' + seed + '&nologo=true&safe=true';
  let ok = false;
  for (let attempt = 1; attempt <= 4 && !ok; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(180000) });
      // free service: 1 picture every 45 seconds per connection
      if (res.status === 429 || res.status === 402) { await sleep(47000); continue; }
      if (!res.ok) throw new Error('HTTP ' + res.status);
      if (!/^image\//.test(res.headers.get('content-type') || '')) { await sleep(47000); continue; }
      const buf = Buffer.from(await res.arrayBuffer());
      const tmp = file + '.src';
      fs.writeFileSync(tmp, buf);
      execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', tmp, '-vf', 'crop=iw:trunc(ih*0.93/2)*2:0:0,scale=600:-2', '-quality', '82', file]);
      fs.unlinkSync(tmp);
      ok = true; made++; await sleep(46000);
      console.log('made', s.id, Math.round(fs.statSync(file).size / 1024) + ' KB');
    } catch (e) { console.log('retry', s.id, e.message); await sleep(5000 * attempt); }
  }
  if (!ok) failed.push(s.id);
}
console.log('done:', made, 'made', failed.length ? '| failed: ' + failed.join(', ') : '');
process.exit(failed.length ? 1 : 0);
