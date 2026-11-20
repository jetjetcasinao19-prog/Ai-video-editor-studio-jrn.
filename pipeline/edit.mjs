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
//   --title "TEXT"       render an animated HyperFrames intro card with this title
//   --subtitle "TEXT"    second line on the intro card
//   --json               print the report as JSON at the end
import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FONTS = path.join(HERE, 'fonts');
const SIZES = { '9:16': [1080, 1920], '16:9': [1920, 1080], '1:1': [1080, 1080] };

// ---------- small helpers ----------
function parseArgs(argv) {
  const o = { format: '9:16', captions: 'creator', transcriber: 'auto', cutPauses: true, minPause: 0.6, musicVolume: 0.25 };
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
    else if (a === '--subtitle') o.subtitle = next();
    else if (a === '--json') o.json = true;
    else if (a.startsWith('--')) throw new Error('Unknown option ' + a);
    else rest.push(a);
  }
  o.input = rest[0];
  if (!o.input) throw new Error('Usage: node pipeline/edit.mjs <video> [options]');
  if (!SIZES[o.format]) throw new Error('--format must be 9:16, 16:9 or 1:1');
  if (!['creator', 'box', 'classic', 'none'].includes(o.captions)) throw new Error('--captions must be creator, box, classic or none');
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

export function buildAss(words, style, [W, H]) {
  const st = STYLES[style];
  const size = Math.round(W * st.size * (W > H ? 0.75 : 1));
  const marginV = Math.round(H * (1 - st.pos));
  const head = `[Script Info]\nScriptType: v4.00+\nPlayResX: ${W}\nPlayResY: ${H}\nWrapStyle: 0\nScaledBorderAndShadow: yes\n\n` +
    `[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\n` +
    `Style: Cap,${st.font},${size},${st.color},${st.color},&H00000000,&H99000000,0,0,0,0,100,100,0,0,${st.box ? 3 : 1},${st.box ? Math.round(size * 0.25) : st.outline},0,2,${Math.round(W * 0.08)},${Math.round(W * 0.08)},${marginV},1\n\n` +
    `[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n`;
  const ev = [];
  for (const line of groupLines(words, W > H ? st.chars + 10 : st.chars)) {
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

// ---------- 5. HyperFrames intro card ----------
async function renderIntro(out, [W, H], title, subtitle) {
  const dir = path.join(out, 'intro-project');
  fs.rmSync(dir, { recursive: true, force: true });
  fs.cpSync(path.join(HERE, 'hyperframes', 'intro'), dir, { recursive: true });
  fs.cpSync(FONTS, path.join(dir, 'fonts'), { recursive: true });
  const html = path.join(dir, 'index.html');
  fs.writeFileSync(html, fs.readFileSync(html, 'utf8').replaceAll('__W__', W).replaceAll('__H__', H));
  const browser = process.env.HYPERFRAMES_BROWSER_PATH || findHeadlessChrome();
  const env = { ...process.env, HYPERFRAMES_NO_TELEMETRY: '1', HYPERFRAMES_NO_UPDATE_CHECK: '1', HYPERFRAMES_SKIP_SKILLS: '1' };
  if (browser) env.HYPERFRAMES_BROWSER_PATH = browser;
  const bin = path.join(HERE, 'node_modules', '.bin', 'hyperframes');
  const file = path.join(out, 'intro.mp4');
  await new Promise((resolve, reject) => {
    const p = spawn(bin, ['render', dir, '-o', file, '-q', 'delivery', '--quiet', '--no-wait', '--strict',
      '--variables', JSON.stringify({ title, subtitle: subtitle || '' })], { env, stdio: ['ignore', 'pipe', 'pipe'] });
    let err = ''; p.stderr.on('data', d => { err += d; }); p.stdout.on('data', d => { err += d; });
    p.on('close', c => c === 0 && fs.existsSync(file) ? resolve() : reject(new Error('HyperFrames render failed: ' + err.slice(-1200))));
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

  // 1. probe
  const src = probe(input);
  step('probe', src);

  // 2. audio (16 kHz mono WAV for analysis, small MP3 for Groq)
  const wav = path.join(out, 'audio16k.wav'), mp3 = path.join(out, 'audio.mp3');
  let words = [], transcript = { engine: 'none', text: '', words: [] };
  if (src.hasAudio) {
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
  const useCaptions = opts.captions !== 'none' && mapped.length > 0;
  if (useCaptions) fs.writeFileSync(ass, buildAss(mapped, opts.captions, [W, H]));

  // 5. one FFmpeg pass: cut + reframe + captions + music + loudness
  const sel = keep.map(([a, b]) => `between(t,${a},${b})`).join('+');
  const vf = [`[0:v]select='${sel}',setpts=N/FRAME_RATE/TB,fps=30,split[a][b]`,
    `[a]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},boxblur=30:3,eq=brightness=-0.08[bg]`,
    `[b]scale=${W}:${H}:force_original_aspect_ratio=decrease[fg]`,
    `[bg][fg]overlay=(W-w)/2:(H-h)/2,format=yuv420p` + (useCaptions ? `,subtitles=filename='${ass.replace(/'/g, "\\'")}':fontsdir='${FONTS}'` : '') + '[v]'];
  const args = ['-y', '-i', input];
  const af = [];
  if (src.hasAudio) af.push(`[0:a]aselect='${sel}',asetpts=N/SR/TB,aresample=48000,aformat=channel_layouts=stereo[voice]`);
  if (opts.music) {
    args.push('-stream_loop', '-1', '-i', path.resolve(opts.music));
    const fadeOut = Math.max(0, kept - 2);
    af.push(`[1:a]atrim=0:${kept},asetpts=N/SR/TB,aresample=48000,aformat=channel_layouts=stereo,volume=${opts.musicVolume},afade=t=in:d=1,afade=t=out:st=${fadeOut}:d=2[mus]`);
    if (src.hasAudio) {
      af.push('[voice]asplit[v1][v2]', '[mus][v2]sidechaincompress=threshold=0.03:ratio=8:attack=20:release=400[duck]',
        '[v1][duck]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[aout]');
    } else af.push('[mus]loudnorm=I=-14:TP=-1.5:LRA=11[aout]');
  } else if (src.hasAudio) af.push('[voice]loudnorm=I=-14:TP=-1.5:LRA=11[aout]');
  const main = path.join(out, opts.title ? 'main.mp4' : 'final.mp4');
  args.push('-filter_complex', [...vf, ...af].join(';'), '-map', '[v]');
  if (af.length) args.push('-map', '[aout]', '-c:a', 'aac', '-b:a', '160k', '-ar', '48000');
  args.push('-t', String(kept), '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-movflags', '+faststart', main);
  await run('ffmpeg', args);
  step('render', { file: path.basename(main), size: W + 'x' + H, captions: useCaptions ? opts.captions : 'none', music: !!opts.music });

  // 6. HyperFrames intro card, joined in front
  let final = main;
  if (opts.title) {
    const intro = await renderIntro(out, [W, H], opts.title, opts.subtitle);
    final = path.join(out, 'final.mp4');
    const hasA = af.length > 0;
    const fc = hasA
      ? '[0:v]fps=30,format=yuv420p,setsar=1[iv];anullsrc=r=48000:cl=stereo,atrim=0:2.5[ia];[1:v]setsar=1[mv];[iv][ia][mv][1:a]concat=n=2:v=1:a=1[v][a]'
      : '[0:v]fps=30,format=yuv420p,setsar=1[iv];[1:v]setsar=1[mv];[iv][mv]concat=n=2:v=1:a=0[v]';
    const cargs = ['-y', '-i', intro, '-i', main, '-filter_complex', fc, '-map', '[v]'];
    if (hasA) cargs.push('-map', '[a]', '-c:a', 'aac', '-b:a', '160k');
    cargs.push('-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-movflags', '+faststart', final);
    await run('ffmpeg', cargs);
    fs.rmSync(main); fs.rmSync(intro);
    step('intro', { engine: 'hyperframes', title: opts.title });
  }

  // 7. thumbnail
  const finalInfo = probe(final);
  const thumbAt = opts.title ? 1.2 : Math.min(1, finalInfo.duration / 3);
  await run('ffmpeg', ['-y', '-ss', String(thumbAt), '-i', final, '-frames:v', '1', '-q:v', '3', path.join(out, 'thumbnail.jpg')]);

  // 8. report
  for (const f of [wav, mp3]) fs.rmSync(f, { force: true });
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
