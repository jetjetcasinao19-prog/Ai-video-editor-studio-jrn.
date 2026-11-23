// Script → voice-over (voice.mp3) for an animated short, when the owner sends
// a script instead of a recording.
//
//   node voice.mjs <script.txt> <project-folder> [--voice af_heart] [--speed 1] [--engine auto|groq|kokoro]
//
// Engines, in order (auto):
//   groq   — Groq Orpheus TTS (canopylabs/orpheus-v1-english; voices: autumn, diana,
//            hannah, austin, daniel, troy). Needs the model's terms accepted once at
//            console.groq.com; key from GROQ_API_KEY or the cloud session's proxy.
//   kokoro — Kokoro-82M on this machine (free, offline after the first ~90 MB
//            download; voices: af_heart, af_bella, am_michael, am_fenrir, bm_george…).
//            Installed into animate/.voice/ on first use (bash setup.sh --voice).
// Blank lines and "..." become longer pauses. Writes <project>/voice.mp3 and
// <project>/script.txt; then run transcribe.mjs for the word timings.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const VOICE_DIR = path.join(HERE, '.voice');

// Node's fetch only uses HTTPS_PROXY when this is set: re-run ourselves with it.
if (process.env.HTTPS_PROXY && !process.env.NODE_USE_ENV_PROXY && process.argv[1] === fileURLToPath(import.meta.url)) {
  const r = spawnSync(process.execPath, ['--no-warnings', ...process.argv.slice(1)], { stdio: 'inherit', env: { ...process.env, NODE_USE_ENV_PROXY: '1' } });
  process.exit(r.status ?? 1);
}

// Split a script into speakable chunks (≤ maxChars) with the pause after each.
export function chunkScript(text, maxChars = 190) {
  const out = [];
  const paras = String(text).replace(/\r/g, '').split(/\n\s*\n/).map(p => p.replace(/\s+/g, ' ').trim()).filter(Boolean);
  paras.forEach((p, pi) => {
    const sentences = p.match(/[^.!?…]+(?:\.\.\.|[.!?…]+)["')\]]*|[^.!?…]+$/g) || [p];
    for (let s of sentences) {
      s = s.trim(); if (!s) continue;
      // long sentence → break at commas / semicolons
      const parts = [];
      while (s.length > maxChars) {
        let cut = Math.max(s.lastIndexOf(', ', maxChars), s.lastIndexOf('; ', maxChars), s.lastIndexOf(': ', maxChars));
        if (cut < 40) cut = s.lastIndexOf(' ', maxChars);
        parts.push(s.slice(0, cut + 1).trim()); s = s.slice(cut + 1).trim();
      }
      parts.push(s);
      parts.forEach((c, ci) => out.push({ text: c, pause: ci < parts.length - 1 ? 0.12 : /\.\.\.$|…$/.test(c) ? 0.55 : 0.28 }));
    }
    if (out.length && pi < paras.length - 1) out[out.length - 1].pause = 0.6;
  });
  if (out.length) out[out.length - 1].pause = 0.4;
  return out;
}

function wav(samples, sr) {
  const b = Buffer.alloc(44 + samples.length * 2);
  b.write('RIFF', 0); b.writeUInt32LE(36 + samples.length * 2, 4); b.write('WAVEfmt ', 8);
  b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(sr, 24);
  b.writeUInt32LE(sr * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(samples.length * 2, 40);
  for (let i = 0; i < samples.length; i++) b.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(samples[i] * 32767))), 44 + i * 2);
  return b;
}
function decode(file, sr) { // any audio file → Float32 mono at sr
  const r = spawnSync('ffmpeg', ['-v', 'error', '-i', file, '-ac', '1', '-ar', String(sr), '-f', 'f32le', '-'], { maxBuffer: 1 << 30 });
  if (r.status !== 0) throw new Error('ffmpeg could not decode ' + file);
  return new Float32Array(r.stdout.buffer, r.stdout.byteOffset, r.stdout.length / 4);
}

const engines = {
  async groq(chunks, voice) {
    const v = ['autumn', 'diana', 'hannah', 'austin', 'daniel', 'troy'].includes(voice) ? voice : 'daniel';
    const tmp = fs.mkdtempSync(path.join(HERE, '.voice-tmp-'));
    try {
      const pieces = [];
      for (const [i, c] of chunks.entries()) {
        const res = await fetch('https://api.groq.com/openai/v1/audio/speech', {
          method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + (process.env.GROQ_API_KEY || 'proxy-injected') },
          body: JSON.stringify({ model: 'canopylabs/orpheus-v1-english', voice: v, input: c.text, response_format: 'wav' }),
        });
        if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error('Groq TTS ' + res.status + ': ' + (e.error?.message || res.statusText)); }
        const f = path.join(tmp, i + '.wav'); fs.writeFileSync(f, Buffer.from(await res.arrayBuffer()));
        pieces.push(decode(f, 24000));
      }
      return { sr: 24000, pieces, label: 'Groq Orpheus (' + v + ')' };
    } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
  },
  async kokoro(chunks, voice, speed) {
    ensureKokoro();
    const req = createRequire(path.join(VOICE_DIR, 'package.json'));
    const { KokoroTTS } = await import(pathToFileURL(req.resolve('kokoro-js')).href);
    const tts = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', { dtype: 'q8', device: 'cpu' });
    const v = tts.voices[voice] ? voice : 'af_heart';
    const pieces = [];
    for (const c of chunks) {
      const a = await tts.generate(c.text, { voice: v, speed });
      pieces.push(a.audio);
      process.stdout.write('.');
    }
    process.stdout.write('\n');
    return { sr: 24000, pieces, label: 'Kokoro (' + v + ')' };
  },
};

export function ensureKokoro() {
  if (fs.existsSync(path.join(VOICE_DIR, 'node_modules', 'kokoro-js'))) return;
  console.log('installing Kokoro TTS into animate/.voice (one time)…');
  fs.mkdirSync(VOICE_DIR, { recursive: true });
  fs.writeFileSync(path.join(VOICE_DIR, 'package.json'), JSON.stringify({ name: 'animate-voice', private: true, type: 'module' }, null, 1));
  // onnxruntime-node tries to fetch a CUDA build that does not exist for Linux x64 CPU boxes → skip it
  const r = spawnSync('npm', ['install', '--no-audit', '--no-fund', '--onnxruntime-node-install-cuda=skip', 'kokoro-js@1.2.1'], { cwd: VOICE_DIR, stdio: 'inherit' });
  if (r.status !== 0) throw new Error('could not install kokoro-js');
}

// Trim leading/trailing near-silence of a TTS piece (keeps 40 ms).
export function trim(a, sr, th = 0.01) {
  let s = 0, e = a.length - 1;
  while (s < e && Math.abs(a[s]) < th) s++;
  while (e > s && Math.abs(a[e]) < th) e--;
  const pad = Math.round(sr * 0.04);
  return a.subarray(Math.max(0, s - pad), Math.min(a.length, e + pad));
}

export async function speak(text, { voice = 'af_heart', speed = 1, engine = 'auto' } = {}) {
  const chunks = chunkScript(text);
  const order = engine === 'auto' ? ['groq', 'kokoro'] : [engine];
  let lastErr;
  for (const name of order) {
    try {
      const r = await engines[name](chunks, name === 'groq' && engine === 'auto' ? (voice.includes('_') ? 'daniel' : voice) : voice, speed);
      const parts = [new Float32Array(Math.round(r.sr * 0.25))];
      r.pieces.forEach((p, i) => { parts.push(trim(p, r.sr)); parts.push(new Float32Array(Math.round(r.sr * chunks[i].pause))); });
      const n = parts.reduce((s, p) => s + p.length, 0), all = new Float32Array(n);
      let o = 0; for (const p of parts) { all.set(p, o); o += p.length; }
      return { ...r, samples: all };
    } catch (e) { lastErr = e; console.error('  ' + e.message.split('\n')[0]); }
  }
  throw lastErr;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const opt = (k, d) => { const i = args.indexOf('--' + k); if (i < 0) return d; const v = args[i + 1]; args.splice(i, 2); return v; };
  const voice = opt('voice', 'af_heart'), speed = +opt('speed', 1), engine = opt('engine', 'auto');
  const [script, project] = args;
  if (!script || !project) { console.error('usage: node voice.mjs <script.txt> <project-folder> [--voice af_heart] [--speed 1] [--engine auto|groq|kokoro]'); process.exit(2); }
  const text = fs.readFileSync(script, 'utf8');
  const r = await speak(text, { voice, speed, engine });
  fs.mkdirSync(project, { recursive: true });
  const tmp = path.join(project, 'voice.tmp.wav');
  fs.writeFileSync(tmp, wav(r.samples, r.sr));
  const out = path.join(project, 'voice.mp3');
  const f = spawnSync('ffmpeg', ['-y', '-v', 'error', '-i', tmp, '-ar', '44100', '-ac', '1', '-b:a', '160k', out], { stdio: 'inherit' });
  fs.rmSync(tmp);
  if (f.status !== 0) process.exit(1);
  if (path.resolve(script) !== path.resolve(project, 'script.txt')) fs.copyFileSync(script, path.join(project, 'script.txt'));
  console.log(`${(r.samples.length / r.sr).toFixed(1)} s voice-over (${r.label}) → ${out}`);
  console.log(`next: node transcribe.mjs ${out} ${project}`);
}
