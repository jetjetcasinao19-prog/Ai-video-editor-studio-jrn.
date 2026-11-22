// Long-form compilation: several finished shorts → one 16:9 video with an
// intro card, a painted chapter card before every story and an outro.
// YouTube counts watch hours only on long-form videos (Shorts views don't add
// to the 4,000-hour path), so a themed compilation helps the channel qualify.
//
//   node compile.mjs --title "Origins of the Holidays" projects/thanksgiving projects/santa projects/times-square-ball
//   options: --subtitle "…"   --intro-voice intro.mp3 (a new spoken intro — adds original value)
//            --out compilations/<slug>   --look-seed 7
//
// Writes <out>/<slug>.mp4 (1920x1080, 30 fps), chapters.txt (paste into the
// YouTube description) and cards/*.png. Missing short MP4s are rendered first.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { loadProject, render, run, ROOT } from './lib/engine.mjs';
import { registerFonts } from './styles/ottoman/index.mjs';
import { ebru, paperTexture, vineBand, rules, cornerRosette } from './styles/ottoman/page.mjs';
import * as kit from './styles/ottoman/kit.mjs';

const { P, cartouche, circle } = kit;
const W = 1920, H = 1080, FPS = 30, VW = 608, VX = (W - VW) / 2;
const ROMAN = n => [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']].reduce((s, [v, r]) => { while (n >= v) { s += r; n -= v; } return s; }, '');
const PALETTES = [
  ['#22407f', '#c98a2e', '#b8574e', '#efe2c0', '#2f7f7a', '#18264a'],
  ['#7a2e3a', '#e8b7b0', '#2f5f7a', '#efe2c0', '#c98a2e', '#3d8458'],
  ['#3d8458', '#b9c98a', '#efe2c0', '#a99ac6', '#c4371f', '#24573a'],
  ['#0e1630', '#1d2b5c', '#c9a227', '#2a1c12', '#3a6f7a', '#6e510c'],
];

export function slugify(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
export function stamp(sec) { const s = Math.round(sec), h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, r = String(s % 60).padStart(2, '0'); return h ? `${h}:${String(m).padStart(2, '0')}:${r}` : `${m}:${r}`; }

// YouTube chapters: first at 0:00, at least three, each at least 10 s long.
export function chapterList(chapters, total) {
  const ok = chapters.length >= 3 && chapters[0].at === 0 && chapters.every((c, i) => ((chapters[i + 1]?.at ?? total) - c.at) >= 10);
  return { ok, text: chapters.map(c => `${stamp(c.at)} ${c.title}`).join('\n') };
}

function fitText(ctx, text, maxW, size, font) {
  ctx.font = `${font.replace('$', size)}`;
  while (ctx.measureText(text).width > maxW && size > 18) { size -= 2; ctx.font = font.replace('$', size); }
  return size;
}
function wrap(ctx, text, maxW) {
  const rows = [[]]; for (const w of text.split(' ')) { const t = [...rows[rows.length - 1], w].join(' '); if (ctx.measureText(t).width > maxW && rows[rows.length - 1].length) rows.push([w]); else rows[rows.length - 1].push(w); }
  return rows.map(r => r.join(' '));
}
function spread(seed) {
  const cv = createCanvas(W, H), ctx = cv.getContext('2d');
  ctx.drawImage(ebru(W / 2, H / 2, seed, PALETTES[seed % PALETTES.length]), 0, 0, W, H);
  return { cv, ctx };
}
function paperBox(ctx, x, y, w, h, seed) {
  ctx.fillStyle = P.paper; ctx.fillRect(x, y, w, h);
  ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(paperTexture(w, h, seed), x, y); ctx.restore();
  rules(ctx, x + 14, y + 14, w - 28, h - 28);
}

// a title card (intro, chapter or outro)
async function card({ seed, kicker, title, sub, logo, handle }) {
  const { cv, ctx } = spread(seed);
  paperBox(ctx, 260, 150, W - 520, H - 300, seed + 1);
  vineBand(ctx, 300, 190, W - 600, 54, P.goldLight, P.lapis); rules(ctx, 300, 190, W - 600, 54);
  vineBand(ctx, 300, H - 244, W - 600, 54, P.goldLight, P.verm); rules(ctx, 300, H - 244, W - 600, 54);
  for (const x of [330, W - 330]) cornerRosette(ctx, x, H / 2, 46);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  if (kicker) { ctx.font = '700 40px Fell'; ctx.fillStyle = P.goldDark; ctx.fillText(kicker, W / 2, 330); }
  cartouche(ctx, W / 2, H / 2 - 10, 1060, 190, P.paperLight, P.goldDark, 5);
  const size = fitText(ctx, title, 960, 82, '900 $px Deco');
  ctx.fillStyle = P.verm; ctx.fillText(title, W / 2, H / 2 - 6 + (size < 60 ? 0 : 0));
  if (sub) { ctx.font = '600 44px GaramondItalic'; ctx.fillStyle = P.lapis; ctx.fillText(sub, W / 2, H / 2 + 150); }
  if (logo) { circle(ctx, W - 400, 300, 66, P.goldLight, P.goldDeep, 3); ctx.save(); ctx.beginPath(); ctx.arc(W - 400, 300, 60, 0, Math.PI * 2); ctx.clip(); ctx.drawImage(logo, W - 460, 240, 120, 120); ctx.restore(); }
  if (handle) { ctx.font = '700 30px Fell'; ctx.fillStyle = P.lapis; ctx.fillText(handle, W / 2, H - 290); }
  return cv;
}

// the wide album spread a vertical short plays inside
async function backdrop({ seed, n, of, title, logo, handle }) {
  const { cv, ctx } = spread(seed);
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(VX - 18, 0, VW + 36, H);
  for (const [x, w] of [[70, VX - 140], [VX + VW + 70, VX - 140]]) paperBox(ctx, x, 120, w, H - 240, seed + x);
  // left: chapter and title
  const lx = 70 + (VX - 140) / 2;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = '700 36px Fell'; ctx.fillStyle = P.goldDark; ctx.fillText(`CHAPTER ${ROMAN(n)}`, lx, 230);
  ctx.font = '900 44px Deco'; ctx.fillStyle = P.verm;
  const rows = wrap(ctx, title, VX - 220); rows.forEach((r, i) => ctx.fillText(r, lx, 420 + (i - (rows.length - 1) / 2) * 62));
  vineBand(ctx, 110, 640, VX - 220, 40, P.goldLight, P.lapis);
  for (let i = 0; i < 5; i++) kit.tulip(ctx, 140 + i * (VX - 280) / 4, 880, 1.3, i % 2 ? P.verm : P.lapisLight);
  // right: the channel
  const rx = VX + VW + 70 + (VX - 140) / 2;
  if (logo) { circle(ctx, rx, 380, 96, P.goldLight, P.goldDeep, 3); ctx.save(); ctx.beginPath(); ctx.arc(rx, 380, 88, 0, Math.PI * 2); ctx.clip(); ctx.drawImage(logo, rx - 88, 292, 176, 176); ctx.restore(); }
  if (handle) { ctx.font = '700 30px Fell'; ctx.fillStyle = P.lapis; ctx.fillText(handle, rx, 540); }
  ctx.font = '600 34px GaramondItalic'; ctx.fillStyle = P.ink; ctx.fillText(`${n} of ${of}`, rx, 620);
  for (let i = 0; i < 4; i++) kit.carnation(ctx, rx - 180 + i * 120, 880, 1.3, i % 2 ? P.verm : P.ochre);
  return cv;
}

function probe(file) {
  const r = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nk=1:nw=1', file], { encoding: 'utf8' });
  return parseFloat(r.stdout);
}
// a short musical sting for a card (generated by lib/audio.py, like the shorts' scores)
function sting(dir, name, dur, music, voice = null) {
  const silent = path.join(dir, 'silence.wav');
  if (!fs.existsSync(silent)) run('ffmpeg', ['-y', '-v', 'error', '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=mono', '-t', '1', silent]);
  const cue = { voice: voice || silent, duration: dur, start: 0, end: dur, out: path.join(dir, name + '.wav'),
    music: { bpm: music?.bpm || 100, root: music?.root || 'D', maqam: music?.maqam || 'hicaz', gain: 0.5, sections: [{ from: 0, to: dur, mood: voice ? 'intro' : 'end' }] },
    sfx: voice ? [{ t: 0.05, type: 'paper', gain: 0.4 }] : [{ t: 0.05, type: 'paper', gain: 0.45 }, { t: 0.25, type: 'gong', gain: 0.6 }] };
  fs.writeFileSync(path.join(dir, name + '.json'), JSON.stringify(cue));
  run('python3', ['-I', path.join(ROOT, 'lib', 'audio.py'), path.join(dir, name + '.json')]);
  return cue.out;
}
const ENC = ['-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', '-r', String(FPS), '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-ac', '2'];
function stillSegment(png, wav, dur, out) {
  const frames = Math.round(dur * FPS);
  run('ffmpeg', ['-y', '-v', 'error', '-loop', '1', '-framerate', String(FPS), '-i', png, '-i', wav, '-filter_complex',
    `[0:v]scale=${W * 2}:${H * 2},zoompan=z='1+0.04*on/${frames}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${frames}:s=${W}x${H}:fps=${FPS},fade=t=in:d=0.4,fade=t=out:st=${(dur - 0.35).toFixed(2)}:d=0.35[v]`,
    '-map', '[v]', '-map', '1:a', '-t', dur.toFixed(3), ...ENC, out]);
}
function storySegment(png, mp4, out) {
  run('ffmpeg', ['-y', '-v', 'error', '-loop', '1', '-framerate', String(FPS), '-i', png, '-i', mp4, '-filter_complex',
    `[1:v]scale=${VW}:${H}[s];[0:v][s]overlay=${VX}:0:shortest=1,format=yuv420p[v]`, '-map', '[v]', '-map', '1:a', ...ENC, out]);
}

export async function compile(projects, { title, subtitle, introVoice = null, out, seed = 7, log = console.log } = {}) {
  registerFonts();
  const slug = slugify(title);
  out = path.resolve(out || path.join(ROOT, 'compilations', slug));
  const cards = path.join(out, 'cards'), segs = path.join(out, 'segments');
  fs.mkdirSync(cards, { recursive: true }); fs.mkdirSync(segs, { recursive: true });
  const items = [];
  for (const dir of projects) {
    const p = await loadProject(dir), mp4 = path.join(p.dir, 'out', (p.meta.slug || 'short') + '.mp4');
    if (!fs.existsSync(mp4)) { log(`rendering ${p.meta.slug} first…`); await render(p.dir, { log: () => {} }); }
    items.push({ dir: p.dir, meta: p.meta, music: p.story.music, mp4, logoFile: p.meta.brand?.logo ? path.resolve(p.dir, p.meta.brand.logo) : null });
  }
  if (items.length < 3) throw new Error('a compilation needs at least three shorts (YouTube chapters need three)');
  const logo = items[0].logoFile && fs.existsSync(items[0].logoFile) ? await loadImage(fs.readFileSync(items[0].logoFile)) : null;
  const handle = items[0].meta.brand?.handle;
  const list = [], chapters = [];
  let at = 0;
  const add = (file, dur) => { list.push(file); at += dur; };

  // intro
  const introDur = introVoice ? Math.max(4, probe(introVoice) + 0.8) : 4;
  fs.writeFileSync(path.join(cards, 'intro.png'), await (await card({ seed, kicker: `${items.length} ORIGIN STORIES`, title, sub: subtitle || 'Painted in code in the style of Ottoman miniatures', logo, handle })).encode('png'));
  stillSegment(path.join(cards, 'intro.png'), sting(segs, 'intro', introDur, items[0].music, introVoice), introDur, path.join(segs, '00-intro.mp4'));
  add(path.join(segs, '00-intro.mp4'), introDur);
  // chapters
  for (const [i, it] of items.entries()) {
    const n = i + 1, name = String(n).padStart(2, '0'), title_ = it.meta.title.replace(/^How (the )?/i, '').replace(/ Started$/, '');
    chapters.push({ at: i === 0 ? 0 : at, title: it.meta.title });
    log(`chapter ${n}/${items.length}: ${it.meta.title}`);
    fs.writeFileSync(path.join(cards, `${name}-card.png`), await (await card({ seed: seed + n * 3, kicker: `CHAPTER ${ROMAN(n)}`, title: title_, logo: null, handle: null })).encode('png'));
    fs.writeFileSync(path.join(cards, `${name}-spread.png`), await (await backdrop({ seed: seed + n * 3 + 1, n, of: items.length, title: it.meta.title, logo, handle })).encode('png'));
    stillSegment(path.join(cards, `${name}-card.png`), sting(segs, `${name}-sting`, 3, it.music), 3, path.join(segs, `${name}-a-card.mp4`));
    add(path.join(segs, `${name}-a-card.mp4`), 3);
    storySegment(path.join(cards, `${name}-spread.png`), it.mp4, path.join(segs, `${name}-b-story.mp4`));
    add(path.join(segs, `${name}-b-story.mp4`), probe(path.join(segs, `${name}-b-story.mp4`)));
  }
  // outro
  fs.writeFileSync(path.join(cards, 'outro.png'), await (await card({ seed: seed + 99, kicker: 'THANK YOU FOR WATCHING', title: 'Every Legend Has a Beginning', sub: 'Subscribe for more origin stories', logo, handle })).encode('png'));
  stillSegment(path.join(cards, 'outro.png'), sting(segs, 'outro', 5, items[items.length - 1].music), 5, path.join(segs, '99-outro.mp4'));
  add(path.join(segs, '99-outro.mp4'), 5);

  fs.writeFileSync(path.join(segs, 'list.txt'), list.map(f => `file '${f}'`).join('\n'));
  const file = path.join(out, slug + '.mp4');
  run('ffmpeg', ['-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', path.join(segs, 'list.txt'), '-c', 'copy', '-movflags', '+faststart', file]);
  const total = probe(file), ch = chapterList(chapters, total);
  fs.writeFileSync(path.join(out, 'chapters.txt'), ch.text + '\n');
  log(`done → ${file} (${stamp(total)})${ch.ok ? '' : '  ⚠ chapters do not meet YouTube rules'}`);
  return { file, total, chapters: ch };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2), opt = k => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : undefined; };
  const skip = new Set(); ['title', 'subtitle', 'intro-voice', 'out', 'look-seed'].forEach(k => { const i = args.indexOf('--' + k); if (i >= 0) { skip.add(i); skip.add(i + 1); } });
  const projects = args.filter((a, i) => !skip.has(i) && !a.startsWith('--'));
  if (!opt('title') || projects.length < 3) { console.error('usage: node compile.mjs --title "…" <project> <project> <project> [...] [--subtitle "…"] [--intro-voice file] [--out dir]'); process.exit(2); }
  const r = await compile(projects, { title: opt('title'), subtitle: opt('subtitle'), introVoice: opt('intro-voice'), out: opt('out'), seed: opt('look-seed') ? +opt('look-seed') : 7 });
  console.log('\nYouTube chapters (paste into the description):\n' + r.chapters.text);
}
