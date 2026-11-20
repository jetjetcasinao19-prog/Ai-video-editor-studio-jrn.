// Tests for the "edit this" pipeline (pipeline/edit.mjs).
// Run: cd pipeline && npm test   (needs ffmpeg with flite, internet for the
// local Whisper model the first time; uses Groq instead when a key works)
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { keepSegments, mapTime, limitLength, groupLines, buildSrt, probe } from '../edit.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const EDIT = path.join(HERE, '..', 'edit.mjs');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pipeline-test-'));
let failures = 0;
function check(name, ok, detail) {
  console.log((ok ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? '  (' + detail + ')' : ''));
  if (!ok) failures++;
}
const ff = args => execFileSync('ffmpeg', ['-loglevel', 'error', '-y', ...args], { maxBuffer: 512 * 1024 * 1024 });
const near = (a, b, t) => Math.abs(a - b) <= t;

// ---------- unit checks ----------
const keep = keepSegments([[0, 1.5], [7.2, 10.2], [15.5, 17.6]], 17.6, { minPause: 0.6 });
check('keepSegments: cuts the 3 silences (with 0.12 s padding)', JSON.stringify(keep) === '[[1.38,7.32],[10.08,15.62]]', JSON.stringify(keep));
check('keepSegments: short pauses are kept', keepSegments([[3, 3.4]], 10, { minPause: 0.6 }).length === 1);
check('mapTime: inside first part', mapTime(2, keep) === 2 - 1.38);
check('mapTime: inside second part', near(mapTime(11, keep), (7.32 - 1.38) + (11 - 10.08), 1e-9));
check('mapTime: a cut moment moves to the next part (no lost words)', near(mapTime(8, keep), 7.32 - 1.38, 1e-9));
check('limitLength: trims to the maximum', JSON.stringify(limitLength([[0, 5], [6, 10]], 7)) === '[[0,5],[6,8]]');
const lines = groupLines('one two three four five six seven eight nine ten. eleven'.split(' ').map((w, i) => ({ w, start: i * 0.3, end: i * 0.3 + 0.25 })), 18);
check('groupLines: short lines, break after a full stop', lines.every(l => l.map(x => x.w).join(' ').length <= 18) && lines.some(l => l[l.length - 1].w === 'ten.'), lines.map(l => l.map(x => x.w).join(' ')).join(' | '));
check('buildSrt: valid timestamps', /00:00:00,000 --> 00:00:0\d,\d{3}/.test(buildSrt([{ w: 'Hi', start: 0, end: 0.5 }])));

// ---------- test media ----------
const SPEECH1 = 'Welcome back to my channel. Today I will show you three easy tips for editing videos on your phone.';
const SPEECH2 = 'First, always cut the long pauses. Second, add big captions. Third, keep it short.';
ff(['-f', 'lavfi', '-i', `flite=text='${SPEECH1}':voice=slt`, path.join(tmp, 's1.wav')]);
ff(['-f', 'lavfi', '-i', `flite=text='${SPEECH2}':voice=slt`, path.join(tmp, 's2.wav')]);
const AUDIO = path.join(tmp, 'talk.wav');
ff(['-i', path.join(tmp, 's1.wav'), '-i', path.join(tmp, 's2.wav'), '-filter_complex',
  '[0]aresample=48000,adelay=1500|1500,apad=pad_dur=3[a0];[1]aresample=48000[a1];[a0][a1]concat=n=2:v=0:a=1,apad=pad_dur=2,aformat=channel_layouts=stereo[a]',
  '-map', '[a]', AUDIO]);
const total = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', AUDIO]).toString());
const VIDEO = path.join(tmp, 'talk.mp4');
ff(['-f', 'lavfi', '-i', 'testsrc2=size=1280x720:rate=30', '-i', AUDIO, '-t', String(total), '-c:v', 'libx264', '-preset', 'ultrafast', '-pix_fmt', 'yuv420p', '-c:a', 'aac', VIDEO]);
const SONG = path.join(tmp, 'song.mp3');
ff(['-f', 'lavfi', '-i', "aevalsrc='0.3*sin(2*PI*220*t)':s=44100:d=20", '-c:a', 'libmp3lame', SONG]);

function edit(args) {
  const r = spawnSync(process.execPath, [EDIT, ...args, '--json'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) throw new Error('edit.mjs failed: ' + (r.stderr || '').slice(-1500));
  return JSON.parse(r.stdout);
}
function audioOf(file) {
  const raw = ff(['-i', file, '-vn', '-af', 'pan=mono|c0=c0', '-ar', '16000', '-f', 'f32le', '-']);
  return new Float32Array(raw.buffer, raw.byteOffset, raw.length / 4);
}
function tone(pcm, f, t0, t1) {
  const a = Math.floor(t0 * 16000), b = Math.min(pcm.length, Math.floor(t1 * 16000)), k = 2 * Math.cos(2 * Math.PI * f / 16000);
  let s1 = 0, s2 = 0; for (let i = a; i < b; i++) { const s0 = pcm[i] + k * s1 - s2; s2 = s1; s1 = s0; }
  return 2 * Math.sqrt(Math.max(0, s1 * s1 + s2 * s2 - k * s1 * s2)) / Math.max(1, b - a);
}
function longestQuiet(pcm, from, to, thr = 0.003) {
  let run = 0, longest = 0;
  for (let i = Math.floor(from * 16000); i + 800 <= Math.min(pcm.length, to * 16000); i += 800) {
    let s = 0; for (let j = i; j < i + 800; j++) s += pcm[j] * pcm[j];
    if (Math.sqrt(s / 800) < thr) { run += 0.05; longest = Math.max(longest, run); } else run = 0;
  }
  return longest;
}
const norm = s => s.toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(Boolean);

// ---------- full edit: 9:16, creator captions, music, HyperFrames intro ----------
try {
  const rep = edit([VIDEO, '--out', path.join(tmp, 'out'), '--music', SONG, '--title', 'Three Easy Tips', '--subtitle', 'Phone editing']);
  const out = path.join(tmp, 'out');
  const fin = path.join(out, 'final.mp4');
  const info = probe(fin);
  const cut = rep.steps.find(s => s.step === 'cut');
  const tr = rep.steps.find(s => s.step === 'transcribe');
  console.log('     transcriber: ' + tr.engine);
  check('final.mp4 is 1080x1920 with sound', info.width === 1080 && info.height === 1920 && info.hasAudio, info.width + 'x' + info.height);
  check('pauses removed (about 6 s cut from 17.6 s)', cut.removedSeconds > 5 && cut.removedSeconds < 8, JSON.stringify(cut));
  check('length = 2.5 s intro + kept part', near(info.duration, 2.5 + cut.keptSeconds, 0.25), info.duration + ' vs ' + (2.5 + cut.keptSeconds));
  const pcm = audioOf(fin);
  check('no pause longer than 0.8 s left after the intro', longestQuiet(pcm, 2.6, info.duration - 0.3, 0.01) <= 0.8, longestQuiet(pcm, 2.6, info.duration - 0.3, 0.01).toFixed(2) + ' s');
  check('music is in the video', tone(pcm, 220, 3, info.duration - 2.5) > 0.005, tone(pcm, 220, 3, info.duration - 2.5).toFixed(4));
  const lufs = Number((spawnSync('ffmpeg', ['-i', fin, '-ss', '2.5', '-af', 'loudnorm=print_format=summary', '-f', 'null', '-']).stderr.toString().match(/Input Integrated:\s+(-?[\d.]+)/) || [])[1]);
  check('loudness ≈ -14 LUFS (social media standard)', lufs > -17 && lufs < -11, lufs + ' LUFS');
  const srt = fs.readFileSync(path.join(out, 'captions.srt'), 'utf8');
  const said = norm(SPEECH1 + ' ' + SPEECH2), heard = new Set(norm(srt));
  const hit = said.filter(w => heard.has(w)).length / said.length;
  check('captions contain at least 80% of the spoken words', hit >= 0.8, Math.round(hit * 100) + '%');
  check('first word kept in the captions', norm(srt)[0] === 'welcome', norm(srt).slice(0, 3).join(' '));
  check('captions fit inside the video length', [...srt.matchAll(/--> (\d\d):(\d\d):(\d\d),(\d\d\d)/g)].every(m => (+m[1]) * 3600 + (+m[2]) * 60 + (+m[3]) + m[4] / 1000 <= info.duration - 2.5 + 0.05));
  const ass = fs.readFileSync(path.join(out, 'captions.ass'), 'utf8');
  check('creator captions highlight the spoken word', /\{\\c&H0000E6FF\}/.test(ass));
  const raw = ff(['-ss', '1.2', '-i', fin, '-frames:v', '1', '-vf', 'scale=108:192', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-']);
  let bright = 0, yellow = 0; for (let i = 0; i < raw.length; i += 3) { if (raw[i] > 220 && raw[i + 1] > 220 && raw[i + 2] > 220) bright++; if (raw[i] > 200 && raw[i + 1] > 180 && raw[i + 2] < 80) yellow++; }
  check('HyperFrames intro card at the start (title text and yellow bar)', bright > 40 && yellow > 5, bright + ' white / ' + yellow + ' yellow px');
  check('thumbnail and report written', fs.existsSync(path.join(out, 'thumbnail.jpg')) && /Final video: final\.mp4/.test(fs.readFileSync(path.join(out, 'report.md'), 'utf8')));
  check('temporary audio files cleaned up', !fs.existsSync(path.join(out, 'audio16k.wav')) && !fs.existsSync(path.join(out, 'intro.mp4')) && !fs.existsSync(path.join(out, 'intro-project')));
} catch (e) { check('full edit run', false, e.message); }

// ---------- brand kit ----------
function pixels(file, t, crop) {
  const raw = ff(['-ss', String(t), '-i', file, '-frames:v', '1', '-vf', (crop ? 'crop=' + crop + ',' : '') + 'scale=64:64', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-']);
  const px = []; for (let i = 0; i < raw.length; i += 3) px.push([raw[i], raw[i + 1], raw[i + 2]]); return px;
}
const isPink = ([r, g, b]) => r > 200 && g < 120 && b > 100 && b < 190;   // brand accent #ff4d8d
try {
  const bdir = path.join(tmp, 'brandkit');
  fs.mkdirSync(path.join(bdir, 'music'), { recursive: true });
  fs.copyFileSync(SONG, path.join(bdir, 'music', 'theme.mp3'));
  fs.writeFileSync(path.join(bdir, 'brand.json'), JSON.stringify({ name: 'Sample Studio', handle: 'samplestudio', tagline: 'Phone tips',
    colors: { background: '#1a0b2e', accent: '#ff4d8d', captionHighlight: '#ff4d8d' }, outro: { text: 'Follow for daily tips' } }));
  const wordsFile = path.join(tmp, 'words.json');
  fs.writeFileSync(wordsFile, JSON.stringify({ words: 'Welcome back to my channel today I will show you three easy tips'.split(' ').map((w, k) => ({ w, start: 1.6 + k * 0.4, end: 1.9 + k * 0.4 })) }));
  const rep = edit([VIDEO, '--out', path.join(tmp, 'branded'), '--brand', path.join(bdir, 'brand.json'), '--words', wordsFile, '--music', 'auto', '--title', 'Brand test']);
  const fin = path.join(tmp, 'branded', 'final.mp4');
  const info = probe(fin);
  const b = rep.steps.find(s => s.step === 'brand'), cut = rep.steps.find(s => s.step === 'cut');
  check('brand loaded: name, @handle added, initials logo, outro on', b.name === 'Sample Studio' && b.handle === '@samplestudio' && b.watermark === 'initials logo' && b.outro === 'on', JSON.stringify(b));
  check('branded length = intro 2.5 s + video + outro 2.5 s', near(info.duration, 5 + cut.keptSeconds, 0.3), info.duration + ' vs ' + (5 + cut.keptSeconds));
  const introBg = pixels(fin, 0.5, 'iw:ih*0.2:0:0').reduce((a, p) => [a[0] + p[0], a[1] + p[1], a[2] + p[2]], [0, 0, 0]).map(v => v / 4096);
  check('intro uses the brand background (purple)', introBg[2] > introBg[1] + 8 && introBg[0] > introBg[1], introBg.map(Math.round).join(','));
  const wm = pixels(fin, 4.5, 'iw*0.25:iw*0.25:iw*0.75:0').filter(isPink).length;
  check('logo watermark in the top-right corner (brand pink)', wm > 300, wm + ' pink px');
  const wmLeft = pixels(fin, 4.5, 'iw*0.25:iw*0.25:0:0').filter(isPink).length;
  check('no watermark in the top-left corner', wmLeft < 20, wmLeft);
  const ass = fs.readFileSync(path.join(tmp, 'branded', 'captions.ass'), 'utf8');
  check('captions highlight the spoken word in the brand colour', ass.includes('{\\c&H008D4DFF}'), (ass.match(/\{\\c&H[0-9A-F]+\}/) || [''])[0]);
  const outro = pixels(fin, info.duration - 1.0).filter(isPink).length;
  check('outro card at the end (logo and handle in brand pink)', outro > 80, outro + ' pink px');
  check('music picked from brand/music', rep.steps.find(s => s.step === 'render').music === 'theme.mp3');
  const tone = (() => { const pcm = audioOf(fin); const a = Math.floor(3 * 16000), e = Math.floor((info.duration - 3) * 16000), k = 2 * Math.cos(2 * Math.PI * 220 / 16000);
    let s1 = 0, s2 = 0; for (let i = a; i < e; i++) { const s0 = pcm[i] + k * s1 - s2; s2 = s1; s1 = s0; } return 2 * Math.sqrt(Math.max(0, s1 * s1 + s2 * s2 - k * s1 * s2)) / (e - a); })();
  check('brand music is in the video', tone > 0.005, tone.toFixed(4));

  const plain = edit([VIDEO, '--out', path.join(tmp, 'nobrand'), '--no-brand', '--words', wordsFile]);
  const pinfo = probe(path.join(tmp, 'nobrand', 'final.mp4'));
  check('--no-brand: no watermark, no outro', !plain.steps.find(s => s.step === 'outro') && pixels(path.join(tmp, 'nobrand', 'final.mp4'), 2, 'iw*0.25:iw*0.25:iw*0.75:0').filter(isPink).length < 20 &&
    near(pinfo.duration, plain.steps.find(s => s.step === 'cut').keptSeconds, 0.2));

  const blank = edit([VIDEO, '--out', path.join(tmp, 'blank'), '--words', wordsFile]); // the repo's brand.json (no name yet)
  const bb = blank.steps.find(s => s.step === 'brand');
  check('empty brand name: no watermark and no outro yet', bb.watermark === 'off' && bb.outro.startsWith('off'), JSON.stringify(bb));

  fs.writeFileSync(path.join(bdir, 'bad.json'), JSON.stringify({ colors: { accent: 'yellow' } }));
  const bad = spawnSync(process.execPath, [EDIT, VIDEO, '--brand', path.join(bdir, 'bad.json')], { encoding: 'utf8' });
  check('a wrong brand colour gives a clear message', bad.status === 1 && /colors\.accent must look like "#ffe600"/.test(bad.stderr), bad.stderr.trim().slice(0, 90));
  fs.writeFileSync(path.join(bdir, 'broken.json'), '{ "name": "x", }');
  const broken = spawnSync(process.execPath, [EDIT, VIDEO, '--brand', path.join(bdir, 'broken.json')], { encoding: 'utf8' });
  check('a broken brand.json gives a clear message', broken.status === 1 && /not valid JSON/.test(broken.stderr), broken.stderr.trim().slice(0, 90));
} catch (e) { check('brand kit run', false, e.message); }

// ---------- other options ----------
try {
  const rep = edit([VIDEO, '--out', path.join(tmp, 'wide'), '--format', '16:9', '--captions', 'box', '--max-length', '6']);
  const info = probe(path.join(tmp, 'wide', 'final.mp4'));
  check('16:9 + box captions + max length 6 s', info.width === 1920 && info.height === 1080 && near(info.duration, 6, 0.2), info.width + 'x' + info.height + ', ' + info.duration + ' s');
  check('max length: captions stop at 6 s', !/00:00:0[7-9]|00:00:1\d/.test(fs.readFileSync(path.join(tmp, 'wide', 'captions.srt'), 'utf8')));
  void rep;
} catch (e) { check('16:9 run', false, e.message); }

try {
  const silent = path.join(tmp, 'silent.mp4');
  ff(['-f', 'lavfi', '-i', 'testsrc2=size=720x1280:rate=30:duration=3', '-c:v', 'libx264', '-preset', 'ultrafast', '-pix_fmt', 'yuv420p', silent]);
  const rep = edit([silent, '--out', path.join(tmp, 'silent'), '--format', '1:1']);
  const info = probe(path.join(tmp, 'silent', 'final.mp4'));
  check('video without sound: 1:1 output, no captions, no crash', info.width === 1080 && info.height === 1080 && near(info.duration, 3, 0.2) &&
    rep.steps.find(s => s.step === 'transcribe').engine === 'none', info.width + 'x' + info.height + ' ' + info.duration);
} catch (e) { check('silent video run', false, e.message); }

try {
  const r = spawnSync(process.execPath, [EDIT, path.join(tmp, 'missing.mp4')], { encoding: 'utf8' });
  check('missing file: clear error, exit code 1', r.status === 1 && /Video not found/.test(r.stderr), r.stderr.trim().slice(0, 80));
  const r2 = spawnSync(process.execPath, [EDIT, VIDEO, '--format', '4:3'], { encoding: 'utf8' });
  check('bad option: clear error', r2.status === 1 && /--format must be/.test(r2.stderr));
} catch (e) { check('error handling', false, e.message); }

fs.rmSync(tmp, { recursive: true, force: true });
console.log(failures ? '\n' + failures + ' check(s) FAILED' : '\nAll checks passed');
process.exit(failures ? 1 : 0);
