// Uniqueness check: YouTube does not monetize "inauthentic" (mass-produced,
// template-made) videos — narrated slideshows that differ only on the surface.
// This compares one project with every other project in projects/ and reports
// what looks the same: the page design, repeated pictures, music, transitions
// and the shape of the script's opening line.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createCanvas } from '@napi-rs/canvas';
import { loadProject, makeFrameDrawer, ROOT } from './engine.mjs';

const VERSION = 4; // bump when the fingerprint changes

// 256-bit difference hash of a canvas region (robust to small shifts and colour).
export function dhash(src, x = 0, y = 0, w = src.width, h = src.height) {
  const c = createCanvas(17, 16), g = c.getContext('2d');
  g.drawImage(src, x, y, w, h, 0, 0, 17, 16);
  const d = g.getImageData(0, 0, 17, 16).data, lum = i => d[i * 4] * 0.299 + d[i * 4 + 1] * 0.587 + d[i * 4 + 2] * 0.114;
  let bits = '';
  for (let r = 0; r < 16; r++) for (let q = 0; q < 16; q++) bits += lum(r * 17 + q) > lum(r * 17 + q + 1) ? '1' : '0';
  return bits;
}
// average colour of a 4x4 grid (the hash above ignores colour and brightness)
export function colorSig(src, x = 0, y = 0, w = src.width, h = src.height) {
  const c = createCanvas(4, 4), g = c.getContext('2d');
  g.drawImage(src, x, y, w, h, 0, 0, 4, 4);
  return Array.from(g.getImageData(0, 0, 4, 4).data).filter((_, i) => i % 4 !== 3);
}
export const colorDist = (a, b) => a.reduce((s, v, i) => s + Math.abs(v - b[i]), 0) / a.length;
// two pages are the same design only if both the shapes and the colours match
export const sameDesign = (a, b) => hamming(a.page, b.page) < 26 && colorDist(a.pageColor, b.pageColor) < 25;
export const hamming = (a, b) => { let n = 0; for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) n++; return n; };

// Posting order comes from content/schedule.md (the first row that links the
// project's post file); a project that is not scheduled yet is the newest.
let SCHEDULE = null;
function scheduledAt(slug) {
  if (!SCHEDULE) {
    SCHEDULE = {};
    const f = path.join(ROOT, '..', 'content', 'schedule.md');
    if (fs.existsSync(f)) for (const line of fs.readFileSync(f, 'utf8').split('\n')) {
      const m = /^\|\s*(\d{4})-(\d{2})-(\d{2})[^|]*\|\s*(\d{1,2}):(\d{2})\s*(AM|PM)[^|]*\|.*?content\/posts\/([^\s|]+)\.md/.exec(line);
      if (!m) continue;
      const h = (+m[4] % 12) + (m[6] === 'PM' ? 12 : 0), ts = Date.UTC(+m[1], +m[2] - 1, +m[3], h, +m[5]) / 1000, key = m[7];
      if (!(key in SCHEDULE) || ts < SCHEDULE[key]) SCHEDULE[key] = ts;
    }
  }
  const key = Object.keys(SCHEDULE).find(k => slug && k.endsWith(slug));
  return key ? SCHEDULE[key] : Infinity;
}
function orderOf(dir, slug) { const s = scheduledAt(slug); return Number.isFinite(s) ? s : Infinity; }
function committedAt(dir) {
  const r = spawnSync('git', ['log', '-1', '--format=%ct', '--', path.join(dir, 'story.mjs')], { cwd: ROOT, encoding: 'utf8' });
  const t = parseInt(r.stdout, 10);
  return Number.isFinite(t) ? t : Math.floor(fs.statSync(path.join(dir, 'story.mjs')).mtimeMs / 1000);
}

// What a project looks and sounds like, in numbers (cached in build/).
export async function fingerprint(dir, { cache = true, look = null } = {}) {
  dir = path.resolve(dir);
  const storyFile = path.join(dir, 'story.mjs'), cacheFile = path.join(dir, 'build', 'fingerprint.json');
  const stamp = [VERSION, fs.statSync(storyFile).mtimeMs, fs.statSync(path.join(ROOT, 'styles', 'ottoman', 'looks.mjs')).mtimeMs].join(':');
  if (cache && !look && fs.existsSync(cacheFile)) { const fp = JSON.parse(fs.readFileSync(cacheFile, 'utf8')); if (fp.stamp === stamp) return { ...fp, when: orderOf(dir, fp.slug) }; }
  const saved = process.env.ANIMATE_LOOK;
  if (look) process.env.ANIMATE_LOOK = look; else delete process.env.ANIMATE_LOOK;
  const project = await loadProject(dir), { meta, story, words } = project;
  if (saved) process.env.ANIMATE_LOOK = saved; else delete process.env.ANIMATE_LOOK;
  const fd = await makeFrameDrawer(project);
  const lk = project.style.lookOf ? project.style.lookOf(meta) : { name: 'classic', layout: null };
  const PA = lk.layout?.paint || { x: 70, y: 268, w: 940, h: 1060 };
  const sc = story.scenes;
  const scenes = sc.map((s, i) => {
    const end = i + 1 < sc.length ? sc[i + 1].start : meta.duration, t = s.start + (end - s.start) * 0.6;
    const cv = fd.frame(t);
    return { title: s.title, t: +t.toFixed(2), paint: dhash(cv, PA.x, PA.y, PA.w, PA.h) };
  });
  // the page with the painting blanked out: what the design around it looks like
  const cv = fd.frame(Math.min(1.5, meta.duration / 2)), g = cv.getContext('2d');
  g.fillStyle = '#808080'; g.fillRect(PA.x, PA.y, PA.w, PA.h);
  const text = words.map(w => w.w).join(' ');
  const fp = {
    stamp, slug: meta.slug, look: lk.name, ambient: lk.ambient || 'none', device: meta.device || 'chronicle',
    transitions: sc.slice(1).map((s, j) => (!lk.transitions || s.trans === 'cut' || s.trans === 'flash' || s.transLock) ? (s.trans || 'iris') : lk.transitions[(j + 1 + (meta.seed || 0)) % lk.transitions.length]),
    music: story.music ? `${story.music.maqam}/${story.music.root}/${story.music.bpm}` : 'none',
    duration: meta.duration, sceneCount: sc.length, page: dhash(cv), pageColor: colorSig(cv), scenes,
    opening: text.split(/(?<=[.!?])\s/)[0], closing: text.split(/(?<=[.!?])\s/).slice(-1)[0],
  };
  if (cache && !look) { fs.mkdirSync(path.dirname(cacheFile), { recursive: true }); fs.writeFileSync(cacheFile, JSON.stringify(fp)); }
  return { ...fp, when: orderOf(dir, fp.slug) };
}

const FORMULA = s => s.toLowerCase().replace(/^.*?\b(exists|was born|started|began|got (its|their|his|her) name)\b/, '… $1').replace(/[^a-z… ]/g, '').split(' ').slice(0, 4).join(' ');

// Compare one project with the others. Returns { ok, fails[], warns[], facts }.
export async function checkUnique(dir, { projectsDir = path.join(ROOT, 'projects'), recent = 3, look = null, log = () => {} } = {}) {
  dir = path.resolve(dir);
  const me = await fingerprint(dir, { look });
  const others = [];
  for (const name of fs.readdirSync(projectsDir).sort()) {
    const d = path.join(projectsDir, name);
    if (d === dir || !fs.existsSync(path.join(d, 'story.mjs')) || !fs.existsSync(path.join(d, 'words.json'))) continue;
    log(`  fingerprinting ${name}…`);
    others.push({ name, ...(await fingerprint(d)) });
  }
  // the videos posted just before this one (unscheduled = after everything scheduled)
  const before = others.filter(o => o.when < me.when || (o.when === me.when && o.name < path.basename(dir))).sort((a, b) => b.when - a.when);
  const latest = (before.length ? before : [...others].sort((a, b) => b.when - a.when)).slice(0, recent);
  const fails = [], warns = [];

  // 1. page design: the same page around the picture as the latest videos?
  const pageTwins = latest.filter(o => o.pageColor && sameDesign(o, me));
  if (pageTwins.length) fails.push(`same page design ("${me.look}" look) as the latest video(s): ${pageTwins.map(o => o.name).join(', ')} — pick another look (meta.look)`);
  const sameLookCount = others.filter(o => o.look === me.look).length;
  if (sameLookCount / Math.max(1, others.length) > 0.5) warns.push(`${sameLookCount} of ${others.length} other videos use the "${me.look}" look`);

  // 2. pictures: scenes that are near-copies of another video's scenes
  const dupes = me.scenes.map(s => {
    let best = null;
    for (const o of others) for (const q of o.scenes) { const h = hamming(s.paint, q.paint); if (!best || h < best.h) best = { h, o: o.name, title: q.title }; }
    return best && best.h < 30 ? `"${s.title}" ≈ ${best.o} "${best.title}"` : null;
  }).filter(Boolean);
  const dupeShare = dupes.length / me.scenes.length;
  if (dupeShare > 0.25) fails.push(`${dupes.length} of ${me.scenes.length} scenes look like scenes from other videos: ${dupes.join('; ')}`);
  else if (dupes.length) warns.push(`scenes close to other videos: ${dupes.join('; ')}`);

  // 3. sound and motion
  const key = m => m.split('/').slice(0, 2).join('/');
  if (latest[0] && key(latest[0].music) === key(me.music)) warns.push(`same maqam and key (${key(me.music)}) as ${latest[0].name} — change maqam or root`);
  if (latest[0] && latest[0].transitions.join() === me.transitions.join()) warns.push(`same transition order as ${latest[0].name}`);
  if (latest[0] && latest[0].device === me.device && me.device !== 'chronicle') warns.push(`same storytelling device (${me.device}) as ${latest[0].name}`);
  if (latest.length >= 3 && latest.every(o => (o.device || 'chronicle') === me.device)) warns.push(`the last ${latest.length} videos and this one all use the "${me.device}" device — try meddah, voyage, loom, marvels, mosaic or karagoz`);
  if (me.ambient === 'none' && me.look !== 'classic') warns.push('no ambient light/particles in this look');

  // 4. script shape (the owner writes these; it is advice only)
  const f = FORMULA(me.opening), sameOpen = others.filter(o => FORMULA(o.opening) === f && f.startsWith('…'));
  if (sameOpen.length >= 3) warns.push(`opening line uses the same formula ("${f}") as ${sameOpen.length} other videos — vary the hook`);

  return { ok: fails.length === 0, fails, warns, facts: { order: me.when, look: me.look, device: me.device, ambient: me.ambient, music: me.music, scenes: me.sceneCount, compared: others.length, latest: latest.map(o => `${o.name} (${o.look})`) } };
}
