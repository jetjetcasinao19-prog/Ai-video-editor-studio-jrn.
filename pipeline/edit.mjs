#!/usr/bin/env node
// "Edit this" pipeline: raw video in, social-ready MP4 + captions + report out.
//
//   node pipeline/edit.mjs <video> [options]
//
// Steps: probe → audio → transcribe (Groq Whisper, or local Whisper as a
// fallback) → find pauses → cut → reframe → styled captions → music + loudness
// → optional HyperFrames intro → thumbnail → report.json / report.md
//
// Options (all optional):
//   --out DIR            output folder (default: output/<video-name>)
//   --format 9:16|16:9|1:1        (default 9:16)
//   --captions creator|box|classic|none   (default creator)
//   --language en|tl|…   spoken language (default: auto-detect)
//   --transcriber auto|groq|local|none     (default auto: Groq, else local)
//   --cut-pauses / --no-cut-pauses          (default on)
//   --min-pause 0.6      shortest pause to cut, seconds
//   --max-length 60      cut the result to at most N seconds
//   --music FILE         background music (ducked under speech)
//   --music-volume 0.25  0..1
//   --music auto         use the first song in brand/music/
//   --brand FILE / --no-brand   brand kit (default: brand/brand.json): colours,
//                        caption style, logo watermark, outro card with @handle
//   --zoom punch|slow|none   punch-in zooms at cuts and sentences, or a slow
//                        push-in (default: brand effects.zoom, else none)
//   --plan FILE.json     B-roll and text pop-ups on the output timeline:
//                        {"broll":[{"at":3,"duration":2.5,"query":"brain"} or
//                         {"at":9,"duration":3,"file":"inbox/broll/x.mp4"}],
//                         "popups":[{"at":12,"text":"2 MINUTES"}]}
//   --sfx / --no-sfx     whoosh on zooms and B-roll, pop on pop-ups
//   --progress-bar / --no-progress-bar   thin bar at the top in the accent colour
//   --fix "wrong=right"  correct caption words before they are burned in
//                        (repeatable; several words allowed on each side)
//   --title "TEXT"       render an animated HyperFrames intro card with this title
//   --subtitle "TEXT"    second line on the intro card
//   --json               print the report as JSON at the end
import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadBrand, assColor, brandLogo, pickMusic } from './brand.mjs';
import { zoomPlan, zoomFilter, zoomMoments, resolveBroll, makeSfx } from './effects.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FONTS = path.join(HERE, 'fonts');
const DEFAULT_BRAND_FILE = path.join(HERE, '..', 'brand', 'brand.json');
const SIZES = { '9:16': [1080, 1920], '16:9': [1920, 1080], '1:1': [1080, 1080] };

// ---------- small helpers ----------
function parseArgs(argv) {
  const o = { format: '9:16', transcriber: 'auto', cutPauses: true, minPause: 0.6, brand: DEFAULT_BRAND_FILE };
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i], next = () => argv[++i];
    if (a === '--out') o.out = next();
    else if (a === '--format') o.format = next();
    else if (a === '--captions') o.captions = next();
    else if (a === '--language') o.language = next();
    else if (a === '--transcriber') o.transcriber = next();
    else if (a === '--cut-pauses') o.cutPauses = true;
    else if (a === '--no-cut-pauses') o.cutPauses = false;
    else if (a === '--min-pause') o.minPause = Number(next());
    else if (a === '--max-length') o.maxLength = Number(next());
    else if (a === '--music') o.music = next();
    else if (a === '--music-volume') o.musicVolume = Number(next());
    else if (a === '--title') o.title = next();
    else if (a === '--brand') o.brand = next();
    else if (a === '--no-brand') o.brand = null;
    else if (a === '--words') o.wordsFile = next(); // ready-made word timings (used by the brand preview)
    else if (a === '--zoom') o.zoom = next();
    else if (a === '--plan') o.plan = next();
    else if (a === '--sfx') o.sfx = true;
    else if (a === '--no-sfx') o.sfx = false;
    else if (a === '--progress-bar') o.progressBar = true;
    else if (a === '--no-progress-bar') o.progressBar = false;
    else if (a === '--fix') {
      const f = next() || '', i = f.indexOf('=');
      if (i < 1) throw new Error('--fix needs the form "wrong words=right words"');
      (o.fixes = o.fixes || []).push([f.slice(0, i).trim(), f.slice(i + 1).trim()]);
    }
    else if (a === '--subtitle') o.subtitle = next();
    else if (a === '--json') o.json = true;
    else if (a.startsWith('--')) throw new Error('Unknown option ' + a);
    else rest.push(a);
  }
  o.input = rest[0];
  if (!o.input) throw new Error('Usage: node pipeline/edit.mjs <video> [options]');
  if (!SIZES[o.format]) throw new Error('--format must be 9:16, 16:9 or 1:1');
  if (o.captions !== undefined && !['creator', 'box', 'classic', 'none'].includes(o.captions)) throw new Error('--captions must be creator, box, classic or none');
  if (o.zoom !== undefined && !['punch', 'slow', 'none'].includes(o.zoom)) throw new Error('--zoom must be punch, slow or none');
  if (!['auto', 'groq', 'local', 'none'].includes(o.transcriber)) throw new Error('--transcriber must be auto, groq, local or none');
  return o;
}

function run(cmd, args, { quiet = true } = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '', err = '';
    p.stdout.on('data', d => { out += d; });
    p.stderr.on('data', d => { err += d; if (!quiet) process.stderr.write(d); });
    p.on('error', reject);
    p.on('close', code => code === 0 ? resolve({ out, err }) : reject(new Error(cmd + ' failed (' + code + '): ' + err.slice(-1500))));
  });
}
const log = (...a) => console.error('[edit]', ...a);
const r2 = n => Math.round(n * 100) / 100;

// ---------- 1. probe ----------
export function probe(file) {
  const j = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_format', '-show_streams', '-of', 'json', file]).toString());
  const v = j.streams.find(s => s.codec_type === 'video');
  const a = j.streams.find(s => s.codec_type === 'audio');
  if (!v) throw new Error('No video stream in ' + file);
  let w = v.width, h = v.height;
  const rot = Number((v.side_data_list || []).find(s => s.rotation !== undefined)?.rotation || v.tags?.rotate || 0);
  if (Math.abs(rot) === 90 || Math.abs(rot) === 270) [w, h] = [h, w]; // phone videos are often stored rotated
  return { duration: Number(j.format.duration), width: w, height: h, hasAudio: !!a, size: Number(j.format.size) };
}

// ---------- 2. transcribe ----------
async function transcribeGroq(audioMp3, language) {
  const size = fs.statSync(audioMp3).size;
  if (size > 24 * 1024 * 1024) throw new Error('Audio is too long for one Groq request (' + (size / 1048576).toFixed(1) + ' MB).');
  const form = new FormData();
  form.append('file', new Blob([fs.readFileSync(audioMp3)], { type: 'audio/mpeg' }), 'audio.mp3');
  form.append('model', 'whisper-large-v3-turbo');
  form.append('response_format', 'verbose_json');
  form.append('timestamp_granularities[]', 'word');
  form.append('timestamp_granularities[]', 'segment');
  if (language) form.append('language', language);
  // The key is added by the session's network proxy (or GROQ_API_KEY locally).
  const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST', body: form, headers: { Authorization: 'Bearer ' + (process.env.GROQ_API_KEY || 'proxy-injected') }
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error('Groq ' + res.status + ': ' + (body.error?.message || res.statusText));
  const words = (body.words || []).map(w => ({ w: String(w.word).trim(), start: w.start, end: w.end })).filter(w => w.w);
  return { engine: 'groq whisper-large-v3-turbo', language: body.language, text: body.text || '', words };
}

async function transcribeLocal(audioWav, language) {
  const { pipeline, env } = await import('@huggingface/transformers');
  env.allowLocalModels = false;
  const asr = await pipeline('automatic-speech-recognition', 'onnx-community/whisper-base', { dtype: 'q8' });
  const raw = fs.readFileSync(audioWav);
  const pcm = new Int16Array(raw.buffer, raw.byteOffset + 44, (raw.length - 44) >> 1);
  const audio = Float32Array.from(pcm, x => x / 32768);
  const opts = { return_timestamps: true, chunk_length_s: 30, stride_length_s: 5, task: 'transcribe' };
  if (language) opts.language = language;
  const out = await asr(audio, opts);
  // Chunk timestamps → word times spread by length inside each chunk.
  const words = [];
  for (const ch of out.chunks || []) {
    const [s, e0] = ch.timestamp || [];
    if (!Number.isFinite(s)) continue;
    const e = Number.isFinite(e0) && e0 > s ? e0 : s + 2;
    const ws = String(ch.text).trim().split(/\s+/).filter(Boolean);
    const total = ws.reduce((n, w) => n + w.length + 1, 0);
    let t = s;
    for (const w of ws) { const d = (e - s) * (w.length + 1) / total; words.push({ w, start: r2(t), end: r2(t + d) }); t += d; }
  }
  await asr.dispose?.();
  return { engine: 'local whisper-base', language: language || 'auto', text: out.text || '', words };
}

// ---------- corrections ----------
// Replace a run of words (matched without case or punctuation) by new words;
// the new words share the time span of the words they replace.
export function applyFixes(words, fixes = []) {
  const norm = w => w.toLowerCase().replace(/[^\p{L}\p{N}']/gu, '');
  let out = words.slice(), count = 0;
  for (const [from, to] of fixes) {
    const pat = from.split(/\s+/).map(norm).filter(Boolean), repl = to.split(/\s+/).filter(Boolean);
    if (!pat.length) continue;
    const next = [];
    for (let i = 0; i < out.length; i++) {
      if (pat.every((p, k) => out[i + k] && norm(out[i + k].w) === p)) {
        const a = out[i].start, b = out[i + pat.length - 1].end, d = (b - a) / Math.max(1, repl.length);
        repl.forEach((w, k) => next.push({ w, start: r2(a + k * d), end: r2(a + (k + 1) * d) }));
        i += pat.length - 1; count++;
      } else next.push(out[i]);
    }
    out = next;
  }
  return { words: out, count };
}

// ---------- 3. pauses → parts to keep ----------
export function keepSegments(silences, duration, { minPause, pad = 0.12 }) {
  const keep = [];
  let t = 0;
  for (const [s, e] of silences) {
    if (e - s < minPause) continue;
    const a = s + pad, b = e - pad;
    if (a > t) keep.push([t, a]);
    t = Math.max(t, b);
  }
  if (t < duration) keep.push([t, duration]);
  return keep.map(([a, b]) => [r2(Math.max(0, a)), r2(Math.min(duration, b))]).filter(([a, b]) => b - a >= 0.2);
}

async function findSilences(audioWav, minPause) {
  const { err } = await run('ffmpeg', ['-hide_banner', '-i', audioWav, '-af', `silencedetect=noise=-32dB:d=${Math.max(0.2, minPause)}`, '-f', 'null', '-']);
  const out = [];
  let start = null;
  for (const line of err.split('\n')) {
    const s = line.match(/silence_start: ([\d.]+)/), e = line.match(/silence_end: ([\d.]+)/);
    if (s) start = Number(s[1]);
    if (e && start !== null) { out.push([start, Number(e[1])]); start = null; }
  }
  return out;
}

export function limitLength(keep, max) {
  if (!max) return keep;
  const out = []; let total = 0;
  for (const [a, b] of keep) {
    if (total >= max) break;
    const len = Math.min(b - a, max - total);
    out.push([a, r2(a + len)]); total += len;
  }
  return out;
}

// Source time → output time (after cutting). A moment inside a cut-out
// stretch moves to the start of the next kept part (or the end of the last),
// so rough word timings never make words disappear from the captions.
export function mapTime(t, keep) {
  let acc = 0;
  for (const [a, b] of keep) {
    if (t < a) return acc;
    if (t <= b) return acc + (t - a);
    acc += b - a;
  }
  return acc;
}

// ---------- 4. captions (ASS, styled, word highlight) ----------
const STYLES = {
  creator: { font: 'Montserrat ExtraBold', size: 0.078, color: '&H00FFFFFF', hi: '&H0000E6FF', outline: 7, box: false, upper: false, pos: 0.68, chars: 18 },
  box: { font: 'Montserrat ExtraBold', size: 0.06, color: '&H00FFFFFF', hi: '&H0000E6FF', outline: 0, box: true, upper: false, pos: 0.80, chars: 24 },
  classic: { font: 'Anton', size: 0.075, color: '&H00FFFFFF', hi: '&H00FFFFFF', outline: 6, box: false, upper: true, pos: 0.80, chars: 20 }
};

export function groupLines(words, maxChars = 28, maxGap = 0.6, maxDur = 2.6) {
  const lines = [];
  let cur = [];
  const flush = () => { if (cur.length) lines.push(cur); cur = []; };
  for (const w of words) {
    const text = cur.map(x => x.w).join(' ');
    const last = cur[cur.length - 1];
    if (cur.length && ((text + ' ' + w.w).length > maxChars || w.start - last.end > maxGap || w.end - cur[0].start > maxDur)) flush();
    cur.push(w);
    if (/[.!?]$/.test(w.w)) flush();
  }
  flush();
  return lines;
}

function assTime(t) {
  const cs = Math.max(0, Math.round(t * 100));
  const h = Math.floor(cs / 360000), m = Math.floor(cs / 6000) % 60, s = Math.floor(cs / 100) % 60, c = cs % 100;
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(c).padStart(2, '0')}`;
}
const assEsc = s => s.replace(/[{}\\]/g, '').replace(/\n/g, ' ');

export function buildAss(words, style, [W, H], colors, popups = []) {
  const st = { ...STYLES[style === 'none' ? 'creator' : style] };
  if (colors) { st.color = assColor(colors.captionText); if (style !== 'classic') st.hi = assColor(colors.captionHighlight); }
  const size = Math.round(W * st.size * (W > H ? 0.75 : 1));
  const marginV = Math.round(H * (1 - st.pos));
  const head = `[Script Info]\nScriptType: v4.00+\nPlayResX: ${W}\nPlayResY: ${H}\nWrapStyle: 0\nScaledBorderAndShadow: yes\n\n` +
    `[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\n` +
    `Style: Cap,${st.font},${size},${st.color},${st.color},&H00000000,&H99000000,0,0,0,0,100,100,0,0,${st.box ? 3 : 1},${st.box ? Math.round(size * 0.25) : st.outline},0,2,${Math.round(W * 0.08)},${Math.round(W * 0.08)},${marginV},1\n` +
    `Style: Pop,Anton,${Math.round(Math.min(W, H) * 0.13)},${colors ? assColor(colors.captionHighlight) : '&H0000E6FF'},&H00FFFFFF,&H00000000,&H99000000,0,0,0,0,100,100,1,0,1,${Math.round(Math.min(W, H) * 0.011)},0,8,${Math.round(W * 0.06)},${Math.round(W * 0.06)},${Math.round(H * 0.12)},1\n\n` +
    `[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n`;
  const ev = [];
  // Text pop-ups: big word, pops in (scale 60% → 112% → 100%) and fades out.
  for (const p of popups) {
    const a = p.at, b = p.at + (p.duration || 1.4);
    ev.push(`Dialogue: 1,${assTime(a)},${assTime(b)},Pop,,0,0,0,,{\\fad(60,180)\\fscx60\\fscy60\\t(0,140,\\fscx112\\fscy112)\\t(140,240,\\fscx100\\fscy100)}${assEsc(String(p.text)).toUpperCase()}`);
  }
  for (const line of (style === 'none' ? [] : groupLines(words, W > H ? st.chars + 10 : st.chars))) {
    const t0 = line[0].start, t1 = line[line.length - 1].end;
    if (style === 'creator') {
      // One event per word: the line with the spoken word highlighted.
      line.forEach((w, i) => {
        const a = i === 0 ? t0 : w.start, b = i === line.length - 1 ? t1 : line[i + 1].start;
        const txt = line.map((x, j) => j === i ? `{\\c${st.hi}}${assEsc(x.w)}{\\c${st.color}}` : assEsc(x.w)).join(' ');
        if (b > a) ev.push(`Dialogue: 0,${assTime(a)},${assTime(b)},Cap,,0,0,0,,${txt}`);
      });
    } else {
      const txt = assEsc(line.map(x => x.w).join(' '));
      ev.push(`Dialogue: 0,${assTime(t0)},${assTime(t1)},Cap,,0,0,0,,${st.upper ? txt.toUpperCase() : txt}`);
    }
  }
  return head + ev.join('\n') + '\n';
}

export function buildSrt(words) {
  const t = s => { const ms = Math.round(s * 1000); return new Date(ms).toISOString().slice(11, 23).replace('.', ','); };
  return groupLines(words, 42, 0.8, 4).map((l, i) => `${i + 1}\n${t(l[0].start)} --> ${t(l[l.length - 1].end)}\n${l.map(w => w.w).join(' ')}\n`).join('\n');
}

// ---------- 5. HyperFrames cards (intro / outro) ----------
async function renderCard(kind, out, [W, H], vars, seconds, logoFile) {
  const dir = path.join(out, kind + '-project');
  fs.rmSync(dir, { recursive: true, force: true });
  fs.cpSync(path.join(HERE, 'hyperframes', kind), dir, { recursive: true });
  fs.cpSync(FONTS, path.join(dir, 'fonts'), { recursive: true });
  const html = path.join(dir, 'index.html');
  fs.writeFileSync(html, fs.readFileSync(html, 'utf8').replaceAll('__W__', W).replaceAll('__H__', H).replaceAll('__D__', seconds));
  if (logoFile) { fs.copyFileSync(logoFile, path.join(dir, 'logo' + path.extname(logoFile).toLowerCase())); vars = { ...vars, logo: 'logo' + path.extname(logoFile).toLowerCase() }; }
  const browser = process.env.HYPERFRAMES_BROWSER_PATH || findHeadlessChrome();
  const env = { ...process.env, HYPERFRAMES_NO_TELEMETRY: '1', HYPERFRAMES_NO_UPDATE_CHECK: '1', HYPERFRAMES_SKIP_SKILLS: '1' };
  if (browser) env.HYPERFRAMES_BROWSER_PATH = browser;
  const bin = path.join(HERE, 'node_modules', '.bin', 'hyperframes');
  const file = path.join(out, kind + '.mp4');
  await new Promise((resolve, reject) => {
    const p = spawn(bin, ['render', dir, '-o', file, '-q', 'delivery', '--quiet', '--no-wait', '--strict',
      '--variables', JSON.stringify(vars)], { env, stdio: ['ignore', 'pipe', 'pipe'] });
    let err = ''; p.stderr.on('data', d => { err += d; }); p.stdout.on('data', d => { err += d; });
    p.on('close', c => c === 0 && fs.existsSync(file) ? resolve() : reject(new Error('HyperFrames ' + kind + ' render failed: ' + err.slice(-1200))));
  });
  fs.rmSync(dir, { recursive: true, force: true });
  return file;
}

function findHeadlessChrome() {
  const roots = ['/opt/pw-browsers'];
  for (const r of roots) {
    if (!fs.existsSync(r)) continue;
    for (const d of fs.readdirSync(r).filter(x => x.startsWith('chromium_headless_shell-'))) {
      const p = path.join(r, d, 'chrome-headless-shell-linux64', 'chrome-headless-shell');
      if (fs.existsSync(p)) return p;
    }
  }
  return null; // HyperFrames then uses its own browser
}

// ---------- main ----------
export async function editVideo(opts) {
  const t0 = Date.now();
  const input = path.resolve(opts.input);
  if (!fs.existsSync(input)) throw new Error('Video not found: ' + input);
  const name = path.basename(input).replace(/\.[^.]+$/, '').replace(/[^\p{L}\p{N}_-]+/gu, '-').slice(0, 60) || 'video';
  const out = path.resolve(opts.out || path.join(process.cwd(), 'output', name));
  fs.mkdirSync(out, { recursive: true });
  const [W, H] = SIZES[opts.format];
  const report = { input: path.basename(input), output: out, options: { ...opts, input: undefined }, steps: [] };
  const step = (s, info) => { report.steps.push({ step: s, ...info }); log(s, info ? JSON.stringify(info) : ''); };

  // Brand kit (colours, caption style, watermark, outro, music volume).
  const brand = loadBrand(opts.brand && fs.existsSync(opts.brand) ? opts.brand : null);
  const useBrand = !!(opts.brand && fs.existsSync(opts.brand));
  opts.captions = opts.captions || (useBrand ? brand.captions.style : 'creator');
  if (opts.zoom === undefined) opts.zoom = useBrand ? brand.effects.zoom : 'none';
  if (opts.sfx === undefined) opts.sfx = useBrand ? brand.effects.sfx : false;
  if (opts.progressBar === undefined) opts.progressBar = useBrand ? brand.effects.progressBar : false;
  let plan = { broll: [], popups: [] };
  if (opts.plan) {
    try { plan = { broll: [], popups: [], ...JSON.parse(fs.readFileSync(opts.plan, 'utf8')) }; }
    catch (e) { throw new Error('The plan file could not be read (' + e.message + ').'); }
  }
  if (opts.musicVolume === undefined) opts.musicVolume = useBrand ? brand.music.volume : 0.25;
  if (opts.music === 'auto') {
    opts.music = useBrand ? pickMusic(brand) : null;
    if (!opts.music) step('music', { note: 'no song found in brand/music/, continuing without music' });
  }
  const logo = useBrand && brand.watermark.enabled ? brandLogo(brand, path.join(out, '.brand-cache'), FONTS) : null;
  const outroOn = useBrand && brand.outro.enabled && !!(brand.handle || brand.name);
  step('brand', useBrand ? { file: path.relative(process.cwd(), opts.brand), name: brand.name || '(not set)', handle: brand.handle || '(not set)',
    captions: opts.captions, watermark: logo ? (logo.generated ? 'initials logo' : path.basename(logo.file)) : 'off', outro: outroOn ? 'on' : 'off (needs a name or handle)' } : { file: 'none' });

  // 1. probe
  const src = probe(input);
  step('probe', src);

  // 2. audio (16 kHz mono WAV for analysis, small MP3 for Groq)
  const wav = path.join(out, 'audio16k.wav'), mp3 = path.join(out, 'audio.mp3');
  let words = [], transcript = { engine: 'none', text: '', words: [] };
  if (opts.wordsFile) {
    transcript = { engine: 'given words', language: '', ...JSON.parse(fs.readFileSync(opts.wordsFile, 'utf8')) };
    transcript.text = transcript.text || transcript.words.map(w => w.w).join(' ');
    words = transcript.words;
    step('transcribe', { engine: transcript.engine, words: words.length });
    if (src.hasAudio) await run('ffmpeg', ['-y', '-i', input, '-vn', '-ac', '1', '-ar', '16000', '-c:a', 'pcm_s16le', wav]);
  } else if (src.hasAudio) {
    await run('ffmpeg', ['-y', '-i', input, '-vn', '-ac', '1', '-ar', '16000', '-c:a', 'pcm_s16le', wav]);
    // 3. transcribe
    const want = opts.captions === 'none' && opts.transcriber === 'auto' ? 'none' : opts.transcriber;
    if (want === 'groq' || want === 'auto') {
      try {
        await run('ffmpeg', ['-y', '-i', wav, '-c:a', 'libmp3lame', '-b:a', '32k', mp3]);
        transcript = await transcribeGroq(mp3, opts.language);
      } catch (e) {
        if (want === 'groq') throw e;
        step('groq-unavailable', { reason: e.message });
      }
    }
    if (transcript.engine === 'none' && (want === 'local' || (want === 'auto' && !transcript.words.length))) {
      transcript = await transcribeLocal(wav, opts.language);
    }
    words = transcript.words;
    step('transcribe', { engine: transcript.engine, language: transcript.language, words: words.length });
  } else {
    step('transcribe', { engine: 'none', reason: 'video has no sound' });
  }

  if (opts.fixes && opts.fixes.length) {
    const r = applyFixes(words, opts.fixes);
    words = r.words;
    transcript.text = words.map(w => w.w).join(' ');
    step('fix', { corrections: r.count, rules: opts.fixes.map(f => f.join(' → ')) });
  }

  // 4. pauses → parts to keep
  let keep = [[0, r2(src.duration)]];
  if (opts.cutPauses && src.hasAudio) {
    const sil = await findSilences(wav, opts.minPause);
    keep = keepSegments(sil, src.duration, { minPause: opts.minPause });
    if (!keep.length) keep = [[0, r2(src.duration)]];
  }
  keep = limitLength(keep, opts.maxLength);
  const kept = keep.reduce((n, [a, b]) => n + b - a, 0);
  step('cut', { parts: keep.length, keptSeconds: r2(kept), removedSeconds: r2(src.duration - kept) });

  // Words moved onto the new (cut) timeline.
  const total = keep.reduce((n, [a, b]) => n + b - a, 0);
  const mapped = words.map(w => {
    const s = mapTime(w.start, keep), e = mapTime(w.end, keep);
    return { w: w.w, start: r2(s), end: r2(Math.max(e, s + 0.08)) };
  }).filter(w => w.start < total - 0.05); // words beyond --max-length are dropped
  fs.writeFileSync(path.join(out, 'transcript.json'), JSON.stringify({ ...transcript, words: mapped }, null, 1));
  if (mapped.length) fs.writeFileSync(path.join(out, 'captions.srt'), buildSrt(mapped));
  const ass = path.join(out, 'captions.ass');
  const popups = (plan.popups || []).filter(p => p && p.text && Number(p.at) >= 0 && Number(p.at) < total - 0.3)
    .map(p => ({ at: Number(p.at), duration: Math.min(Number(p.duration) || 1.4, 3), text: String(p.text).slice(0, 24) }));
  const useCaptions = opts.captions !== 'none' && mapped.length > 0;
  const useAss = useCaptions || popups.length > 0;
  if (useAss) fs.writeFileSync(ass, buildAss(useCaptions ? mapped : [], useCaptions ? opts.captions : 'none', [W, H], useBrand ? brand.colors : null, popups));

  // Zoom plan and B-roll (all on the output timeline).
  const cutsOut = []; { let acc = 0; for (let i = 0; i < keep.length - 1; i++) { acc += keep[i][1] - keep[i][0]; cutsOut.push(r2(acc)); } }
  const zkeys = zoomPlan(opts.zoom, cutsOut, kept, mapped);
  const broll = await resolveBroll(plan.broll, { total: kept, orientation: W < H ? 'portrait' : W > H ? 'landscape' : 'square',
    cacheDir: path.join(out, '.broll-cache'), baseDir: process.cwd(), log: step });
  if (zkeys.length) step('zoom', { style: opts.zoom, changes: zoomMoments(zkeys).length });
  if (broll.length) step('broll', { clips: broll.map(b => ({ at: b.at, duration: r2(b.duration), source: b.source, credit: b.credit })) });
  if (popups.length) step('popups', { count: popups.length, words: popups.map(p => p.text) });

  // 5. one FFmpeg pass: cut + reframe + captions + music + loudness
  const sel = keep.map(([a, b]) => `between(t,${a},${b})`).join('+');
  const subs = `subtitles=filename='${ass.replace(/'/g, "\\'")}':fontsdir='${FONTS}'`;
  const vf = [`[0:v]select='${sel}',setpts=N/FRAME_RATE/TB,fps=30,split[a][b]`,
    `[a]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},boxblur=30:3,eq=brightness=-0.08[bg]`,
    `[b]scale=${W}:${H}:force_original_aspect_ratio=decrease[fg]`,
    `[bg][fg]overlay=(W-w)/2:(H-h)/2` + zoomFilter(zkeys, W, H) + '[c0]'];
  const args = ['-y', '-i', input];
  let nextInput = 1, cur = 'c0', n = 0;
  const label = () => 'c' + (++n);
  // B-roll on top of the (zoomed) video, under watermark and captions.
  for (const b of broll) {
    if (b.image) args.push('-loop', '1', '-t', String(b.duration), '-i', b.file);
    else args.push('-stream_loop', '-1', '-t', String(b.duration), '-i', b.file);
    const fo = Math.max(0, b.duration - 0.2).toFixed(2);
    const kb = b.image ? `,scale=w='trunc(${W}*(1+0.08*t/${b.duration.toFixed(2)})/2)*2':h='trunc(${H}*(1+0.08*t/${b.duration.toFixed(2)})/2)*2':eval=frame,crop=${W}:${H}` : '';
    const o = label();
    vf.push(`[${nextInput}:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},fps=30,setsar=1${kb},format=yuva420p,` +
      `fade=t=in:st=0:d=0.2:alpha=1,fade=t=out:st=${fo}:d=0.2:alpha=1,setpts=PTS-STARTPTS+${b.at.toFixed(3)}/TB[br${nextInput}]`,
      `[${cur}][br${nextInput}]overlay=0:0:eof_action=pass:enable='between(t,${b.at.toFixed(3)},${(b.at + b.duration).toFixed(3)})'[${o}]`);
    cur = o; nextInput++;
  }
  if (logo) {
    // Logo watermark in a corner, under the captions.
    const lw = Math.round(Math.min(W, H) * brand.watermark.size), m = Math.round(Math.min(W, H) * 0.04);
    const pos = { 'top-right': [`W-w-${m}`, `${m}`], 'top-left': [`${m}`, `${m}`], 'bottom-right': [`W-w-${m}`, `H-h-${m}`], 'bottom-left': [`${m}`, `H-h-${m}`] }[brand.watermark.position];
    args.push('-loop', '1', '-i', logo.file);
    const o = label();
    vf.push(`[${nextInput}:v]scale=${lw}:-1,format=rgba,colorchannelmixer=aa=${brand.watermark.opacity}[wm]`,
      `[${cur}][wm]overlay=${pos[0]}:${pos[1]}:shortest=1[${o}]`);
    cur = o; nextInput++;
  }
  if (opts.progressBar) {
    // Thin bar at the top that fills up as the video plays.
    const accent = (useBrand ? brand.colors.accent : '#ffe600').slice(1);
    const bh = Math.max(6, Math.round(H * 0.006));
    args.push('-f', 'lavfi', '-i', `color=c=0x${accent}:s=${W}x${bh}:r=30`);
    const o = label();
    vf.push(`[${cur}][${nextInput}:v]overlay=x='-W+W*t/${kept.toFixed(3)}':y=0:shortest=1[${o}]`);
    cur = o; nextInput++;
  }
  vf.push(`[${cur}]format=yuv420p` + (useAss ? ',' + subs : '') + '[v]');
  const af = [];
  // Sound effects: whoosh on zoom moves and B-roll starts, pop on pop-ups.
  const sfxAt = { whoosh: [], pop: [] };
  if (opts.sfx) {
    sfxAt.whoosh = [...zoomMoments(zkeys).filter(t => t > 0.4), ...broll.map(b => b.at)].map(t => Math.max(0, t - 0.15)).sort((a, b) => a - b)
      .filter((t, i, a) => i === 0 || t - a[i - 1] > 0.6).slice(0, 40);
    sfxAt.pop = popups.map(p => p.at).slice(0, 30);
  }
  const sfxN = sfxAt.whoosh.length + sfxAt.pop.length;
  if (src.hasAudio) af.push(`[0:a]aselect='${sel}',asetpts=N/SR/TB,aresample=48000,aformat=channel_layouts=stereo[voice]`);
  if (opts.music) {
    args.push('-stream_loop', '-1', '-i', path.resolve(opts.music));
    const fadeOut = Math.max(0, kept - 2);
    af.push(`[${nextInput}:a]atrim=0:${kept},asetpts=N/SR/TB,aresample=48000,aformat=channel_layouts=stereo,volume=${opts.musicVolume},afade=t=in:d=1,afade=t=out:st=${fadeOut}:d=2[mus]`);
    if (src.hasAudio) {
      af.push('[voice]asplit[v1][v2]', '[mus][v2]sidechaincompress=threshold=0.03:ratio=8:attack=20:release=400[duck]',
        '[v1][duck]amix=inputs=2:duration=first:normalize=0[mix]');
    } else af.push('[mus]anull[mix]');
  } else if (src.hasAudio) af.push('[voice]anull[mix]');
  else if (sfxN) af.push(`anullsrc=r=48000:cl=stereo,atrim=0:${kept.toFixed(3)}[mix]`);
  if (af.length) {
    if (sfxN) {
      const fx = makeSfx(path.join(out, '.fx-cache')), labels = [];
      for (const kind of ['whoosh', 'pop']) {
        const times = sfxAt[kind];
        if (!times.length) continue;
        args.push('-i', fx[kind]);
        const ins = times.map((_, i) => `[${kind}${i}]`).join('');
        af.push(`[${nextInput}:a]volume=${kind === 'whoosh' ? 0.6 : 0.6},asplit=${times.length}${ins}`);
        times.forEach((t, i) => { const ms = Math.round(t * 1000); af.push(`[${kind}${i}]adelay=${ms}|${ms}[${kind}d${i}]`); labels.push(`[${kind}d${i}]`); });
        nextInput++;
      }
      af.push(`[mix]${labels.join('')}amix=inputs=${labels.length + 1}:duration=first:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[aout]`);
      step('sfx', { whoosh: sfxAt.whoosh.length, pop: sfxAt.pop.length });
    } else af.push('[mix]loudnorm=I=-14:TP=-1.5:LRA=11[aout]');
  }
  const withCards = !!(opts.title && (!useBrand || brand.intro.enabled)) || outroOn;
  const main = path.join(out, withCards ? 'main.mp4' : 'final.mp4');
  args.push('-filter_complex', [...vf, ...af].join(';'), '-map', '[v]');
  if (af.length) args.push('-map', '[aout]', '-c:a', 'aac', '-b:a', '160k', '-ar', '48000');
  args.push('-t', String(kept), '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-movflags', '+faststart', main);
  await run('ffmpeg', args);
  step('render', { file: path.basename(main), size: W + 'x' + H, captions: useCaptions ? opts.captions : 'none',
    music: opts.music ? path.basename(opts.music) : false, watermark: !!logo, zoom: zkeys.length ? opts.zoom : 'none',
    broll: broll.length, popups: popups.length, sfx: sfxN, progressBar: !!opts.progressBar });
  report.credits = broll.filter(b => b.credit).map(b => ({ credit: b.credit, url: b.url }));

  // 6. HyperFrames cards: intro (with --title) in front, outro (brand) at the end
  let final = main;
  const colors = useBrand ? brand.colors : { background: '#0b0e14', text: '#ffffff', accent: '#ffe600' };
  const parts = [];
  if (opts.title && (!useBrand || brand.intro.enabled)) {
    parts.push({ file: await renderCard('intro', out, [W, H], { title: opts.title, subtitle: opts.subtitle || brand.tagline || '',
      bg: colors.background, ink: colors.text, accent: colors.accent }, 2.5), seconds: 2.5 });
    step('intro', { engine: 'hyperframes', title: opts.title });
  }
  parts.push({ file: main, seconds: null });
  if (outroOn) {
    const sec = brand.outro.seconds;
    parts.push({ file: await renderCard('outro', out, [W, H], { text: brand.outro.text, handle: brand.handle, name: brand.name,
      bg: colors.background, ink: colors.text, accent: colors.accent }, sec, logo && logo.file), seconds: sec });
    step('outro', { engine: 'hyperframes', text: brand.outro.text, handle: brand.handle || brand.name });
  }
  if (parts.length > 1) {
    final = path.join(out, 'final.mp4');
    const hasA = af.length > 0;
    const cargs = ['-y'];
    parts.forEach(p => cargs.push('-i', p.file));
    const fc = [], seq = [];
    parts.forEach((p, i) => {
      fc.push(`[${i}:v]fps=30,format=yuv420p,setsar=1[v${i}]`);
      if (hasA) fc.push(p.seconds ? `anullsrc=r=48000:cl=stereo,atrim=0:${p.seconds}[a${i}]` : `[${i}:a]anull[a${i}]`);
      seq.push(`[v${i}]` + (hasA ? `[a${i}]` : ''));
    });
    fc.push(seq.join('') + `concat=n=${parts.length}:v=1:a=${hasA ? 1 : 0}[v]` + (hasA ? '[a]' : ''));
    cargs.push('-filter_complex', fc.join(';'), '-map', '[v]');
    if (hasA) cargs.push('-map', '[a]', '-c:a', 'aac', '-b:a', '160k');
    cargs.push('-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-movflags', '+faststart', final);
    await run('ffmpeg', cargs);
    parts.forEach(p => fs.rmSync(p.file, { force: true }));
  }

  // 7. thumbnail
  const finalInfo = probe(final);
  const thumbAt = parts[0].seconds && opts.title ? 1.2 : Math.min(1, finalInfo.duration / 3);
  await run('ffmpeg', ['-y', '-ss', String(thumbAt), '-i', final, '-frames:v', '1', '-q:v', '3', path.join(out, 'thumbnail.jpg')]);

  // 8. report
  for (const f of [wav, mp3]) fs.rmSync(f, { force: true });
  for (const d of ['.brand-cache', '.fx-cache', '.broll-cache']) fs.rmSync(path.join(out, d), { recursive: true, force: true });
  report.final = { file: 'final.mp4', duration: r2(finalInfo.duration), width: finalInfo.width, height: finalInfo.height, sizeMB: r2(finalInfo.size / 1048576) };
  report.transcript = (transcript.text || '').trim();
  report.seconds = r2((Date.now() - t0) / 1000);
  fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 1));
  fs.writeFileSync(path.join(out, 'report.md'), [
    `# Edit report: ${report.input}`, '',
    `- Final video: final.mp4 (${report.final.width}x${report.final.height}, ${report.final.duration} s, ${report.final.sizeMB} MB)`,
    `- Original: ${r2(src.duration)} s, ${src.width}x${src.height}`,
    ...report.steps.map(s => `- ${s.step}: ${Object.entries(s).filter(([k]) => k !== 'step').map(([k, v]) => k + '=' + v).join(', ')}`),
    '', '## Transcript', '', report.transcript || '(none)', ''].join('\n'));
  return report;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  // Behind an HTTPS proxy (cloud sessions), Node's fetch only uses it with
  // NODE_USE_ENV_PROXY=1, which must be set when Node starts: restart once.
  if ((process.env.HTTPS_PROXY || process.env.https_proxy) && !process.env.NODE_USE_ENV_PROXY) {
    const { spawnSync } = await import('node:child_process');
    const r = spawnSync(process.execPath, process.argv.slice(1), { stdio: 'inherit', env: { ...process.env, NODE_USE_ENV_PROXY: '1' } });
    process.exit(r.status ?? 1);
  }
  try {
    const opts = parseArgs(process.argv.slice(2));
    const rep = await editVideo(opts);
    if (opts.json) console.log(JSON.stringify(rep, null, 1));
    else console.log('Done: ' + path.join(rep.output, 'final.mp4') + ' (' + rep.final.duration + ' s) in ' + rep.seconds + ' s');
  } catch (e) {
    console.error('Error: ' + e.message);
    process.exit(1);
  }
}
