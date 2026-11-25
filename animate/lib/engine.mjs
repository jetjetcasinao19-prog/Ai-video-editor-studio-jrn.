// Frame engine: loads a project (story.mjs + words.json), draws frames with
// its style, renders them in parallel worker threads straight into FFmpeg,
// then mixes the soundtrack (lib/audio.py) and muxes the final MP4.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { Worker } from 'node:worker_threads';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createCanvas } from '@napi-rs/canvas';
import { retentionCheck } from './retention.mjs';
export { retentionCheck };

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(HERE, '..');

export async function loadProject(dir) {
  dir = path.resolve(dir);
  const story = await import(pathToFileURL(path.join(dir, 'story.mjs')).href);
  const words = JSON.parse(fs.readFileSync(path.join(dir, 'words.json'), 'utf8')).words;
  const style = await import(pathToFileURL(path.join(ROOT, 'styles', story.meta.style, 'index.mjs')).href);
  applyBrandKit(story.meta);
  return { dir, story, words, style, meta: story.meta };
}

// The owner runs two channels, each with a brand kit in the repo:
//   brandKit: ''          → brand/            (How it Started — origins, Ottoman)
//   brandKit: 'mindtrace' → brand/mindtrace/  (MindTrace — psychology, INKBLOT)
// The kit fills meta.brand (handle, logo, tagline, name) and the outro text,
// unless the story sets them itself.
export const BRAND_ROOT = path.resolve(ROOT, '..', 'brand');
export function applyBrandKit(meta) {
  if (meta.brandKit === undefined || meta.brandKit === null) return meta;
  const dir = path.join(BRAND_ROOT, meta.brandKit), file = path.join(dir, 'brand.json');
  if (!fs.existsSync(file)) throw new Error(`brand kit "${meta.brandKit}" not found (${file})`);
  const kit = JSON.parse(fs.readFileSync(file, 'utf8'));
  const logo = path.join(dir, kit.logo || 'logo.png');
  meta.brand = { name: kit.name, handle: kit.handle, tagline: kit.tagline, hashtags: kit.hashtags || [], ...(fs.existsSync(logo) ? { logo } : {}), ...(meta.brand || {}) };
  if (meta.outro && !meta.outro.text && kit.outro?.text) meta.outro.text = kit.outro.text;
  return meta;
}

export async function makeFrameDrawer(project) {
  const draw = await project.style.createRenderer(project);
  const { width, height } = project.meta;
  const canvas = createCanvas(width, height), ctx = canvas.getContext('2d');
  return { canvas, ctx, frame: t => { ctx.save(); draw(ctx, t); ctx.restore(); return canvas; } };
}

export function checkStory(meta, scenes, words) {
  const problems = [];
  for (let i = 1; i < scenes.length; i++) if (!(scenes[i].start > scenes[i - 1].start)) problems.push(`scene ${i} starts before scene ${i - 1}`);
  if (scenes[0].start !== 0) problems.push('first scene must start at 0');
  const lastWord = words[words.length - 1];
  if (lastWord && meta.duration < lastWord.end) problems.push(`duration ${meta.duration}s ends before the voice (${lastWord.end}s)`);
  for (const s of scenes) if (typeof s.draw !== 'function') problems.push(`scene "${s.title}" has no draw()`);
  return problems;
}

// Retention warnings (lib/retention.mjs): printed before a sheet or a render.
export function logRetention(project, log = console.log) {
  const warn = retentionCheck(project.meta, project.story.scenes, project.words);
  if (warn.length) log('retention check — fix these or have a reason:\n  ⚠ ' + warn.join('\n  ⚠ '));
  else log('retention check: ok');
  return warn;
}

// ---------- stills / contact sheet ----------
export async function stills(dir, times, outDir) {
  const project = await loadProject(dir);
  const fd = await makeFrameDrawer(project);
  fs.mkdirSync(outDir, { recursive: true });
  const files = [];
  for (const t of times) {
    const f = path.join(outDir, `still-${t.toFixed(2).padStart(6, '0')}.png`);
    fs.writeFileSync(f, await fd.frame(t).encode('png'));
    files.push(f);
  }
  return files;
}
export async function contactSheet(dir, out, { cols = 5, scale = 0.25, times } = {}) {
  const project = await loadProject(dir);
  logRetention(project);
  const fd = await makeFrameDrawer(project);
  const sc = project.story.scenes;
  times = times || sc.map((s, i) => { const end = i + 1 < sc.length ? sc[i + 1].start : project.meta.duration; return +(s.start + (end - s.start) * 0.6).toFixed(2); });
  const { width: W, height: H } = project.meta, w = Math.round(W * scale), h = Math.round(H * scale);
  const rows = Math.ceil(times.length / cols), sheet = createCanvas(cols * w, rows * h), sx = sheet.getContext('2d');
  sx.fillStyle = '#111'; sx.fillRect(0, 0, sheet.width, sheet.height);
  times.forEach((t, i) => {
    sx.drawImage(fd.frame(t), (i % cols) * w, Math.floor(i / cols) * h, w, h);
    sx.fillStyle = '#ff0'; sx.font = '20px sans-serif'; sx.fillText(t.toFixed(1) + 's', (i % cols) * w + 6, Math.floor(i / cols) * h + 22);
  });
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, await sheet.encode('png'));
  return out;
}

// ---------- full render ----------
export async function render(dir, { out, build, workers = Math.max(1, os.cpus().length), from = 0, to = null, crf = 18, log = console.log } = {}) {
  const project = await loadProject(dir);
  const { meta, story, words } = project;
  const problems = checkStory(meta, story.scenes, words);
  if (problems.length) throw new Error('story problems:\n - ' + problems.join('\n - '));
  logRetention(project, log);
  build = build || path.join(project.dir, 'build');
  fs.mkdirSync(build, { recursive: true });
  out = out || path.join(project.dir, 'out', (meta.slug || 'short') + '.mp4');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const fps = meta.fps, total = Math.round((to ?? meta.duration) * fps), first = Math.round(from * fps);
  const n = total - first, per = Math.ceil(n / workers);
  const t0 = Date.now();
  log(`rendering ${n} frames (${(n / fps).toFixed(1)} s at ${fps} fps, ${meta.width}x${meta.height}) on ${workers} workers…`);
  const done = new Array(workers).fill(0);
  const parts = await Promise.all(Array.from({ length: workers }, (_, i) => new Promise((resolve, reject) => {
    const a = first + i * per, b = Math.min(total, a + per);
    if (a >= b) return resolve(null);
    const file = path.join(build, `part-${String(i).padStart(2, '0')}.mp4`);
    const w = new Worker(path.join(HERE, 'worker.mjs'), { workerData: { dir: project.dir, a, b, file, crf } });
    w.on('message', m => {
      if (m.progress != null) { done[i] = m.progress; const sum = done.reduce((x, y) => x + y, 0); if (sum % 60 === 0) log(`  ${sum}/${n} frames, ${((Date.now() - t0) / 1000).toFixed(0)} s`); }
      if (m.done) resolve(file);
    });
    w.on('error', reject);
    w.on('exit', code => code && reject(new Error('worker exited ' + code)));
  })));
  const list = path.join(build, 'parts.txt');
  fs.writeFileSync(list, parts.filter(Boolean).map(f => `file '${f}'`).join('\n'));
  const video = path.join(build, 'video.mp4');
  run('ffmpeg', ['-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', video]);
  log(`frames done in ${((Date.now() - t0) / 1000).toFixed(0)} s`);

  // soundtrack: voice + generated score + sound effects
  const cues = {
    voice: path.join(project.dir, meta.voice), duration: meta.duration,
    start: from, end: to ?? meta.duration,
    music: story.music || null, sfx: story.sfx || [], space: story.space || meta.space || null, out: path.join(build, 'mix.wav'),
  };
  fs.writeFileSync(path.join(build, 'cues.json'), JSON.stringify(cues, null, 1));
  run('python3', ['-I', path.join(HERE, 'audio.py'), path.join(build, 'cues.json')]);
  run('ffmpeg', ['-y', '-v', 'error', '-i', video, '-i', cues.out, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out]);
  log(`done in ${((Date.now() - t0) / 1000).toFixed(0)} s → ${out}`);
  return out;
}

export function run(cmd, args) {
  const r = spawnSync(cmd, args, { stdio: ['ignore', 'inherit', 'inherit'] });
  if (r.status !== 0) throw new Error(`${cmd} failed (${r.status})`);
}

// Pipe raw RGBA frames into an x264 encoder.
export function encoder(file, { width, height, fps }, crf = 18) {
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${width}x${height}`, '-r', String(fps), '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', String(crf), '-pix_fmt', 'yuv420p', '-tune', 'animation', file], { stdio: ['pipe', 'inherit', 'inherit'] });
  return {
    write: buf => new Promise(res => (ff.stdin.write(buf) ? res() : ff.stdin.once('drain', res))),
    close: () => new Promise((res, rej) => { ff.on('close', c => (c === 0 ? res() : rej(new Error('ffmpeg ' + c)))); ff.stdin.end(); }),
  };
}
