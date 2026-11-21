// Tests OmniRoute transcription in the pipeline (pipeline/edit.mjs).
// Run: cd pipeline && node test/omniroute.test.mjs   (needs ffmpeg with flite)
// A small stand-in gateway answers like OmniRoute's /v1/audio/transcriptions,
// so no API key or real OmniRoute install is needed.
import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { omnirouteConfig } from '../edit.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const EDIT = path.join(HERE, '..', 'edit.mjs');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'omniroute-test-'));
let failures = 0;
function check(name, ok, detail) {
  console.log((ok ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? '  (' + detail + ')' : ''));
  if (!ok) failures++;
}
const ff = args => execFileSync('ffmpeg', ['-loglevel', 'error', '-y', ...args]);

// ---------- config ----------
check('no OMNIROUTE_URL: OmniRoute is off', omnirouteConfig({}) === null);
const c1 = omnirouteConfig({ OMNIROUTE_URL: 'http://localhost:20128' });
check('adds /v1 and the transcription path', c1.endpoint === 'http://localhost:20128/v1/audio/transcriptions', c1.endpoint);
check('default model is Groq Whisper turbo', c1.model === 'groq/whisper-large-v3-turbo', c1.model);
const c2 = omnirouteConfig({ OMNIROUTE_URL: 'https://my.vps/v1/', OMNIROUTE_API_KEY: 'k1', OMNIROUTE_TRANSCRIBE_MODEL: 'openai/whisper-1' });
check('keeps /v1, uses key and model', c2.endpoint === 'https://my.vps/v1/audio/transcriptions' && c2.key === 'k1' && c2.model === 'openai/whisper-1', JSON.stringify(c2));

// ---------- test video: "hello world this is omniroute" ----------
const WAV = path.join(tmp, 's.wav'), VIDEO = path.join(tmp, 'talk.mp4');
ff(['-f', 'lavfi', '-i', "flite=text='hello world this is omniroute':voice=slt", WAV]);
const dur = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', WAV]).toString());
ff(['-f', 'lavfi', '-i', 'testsrc2=size=640x360:rate=30', '-i', WAV, '-t', String(dur), '-c:v', 'libx264', '-preset', 'ultrafast', '-pix_fmt', 'yuv420p', '-c:a', 'aac', VIDEO]);
const WORDS = ['Hello', 'world,', 'this', 'is', 'OmniRoute.'];

// ---------- stand-in gateway ----------
let mode = 'ok', seen = null;
const server = http.createServer(async (req, res) => {
  const chunks = []; for await (const c of req) chunks.push(c);
  const body = Buffer.concat(chunks);
  const form = await new Response(body, { headers: { 'content-type': req.headers['content-type'] || '' } }).formData().catch(() => null);
  const file = form && form.get('file');
  seen = { path: req.url, auth: req.headers.authorization || '', model: form && form.get('model'), format: form && form.get('response_format'),
    granularities: form ? form.getAll('timestamp_granularities[]') : [], fileSize: file ? file.size : 0 };
  res.setHeader('content-type', 'application/json');
  if (mode === 'fail') { res.statusCode = 503; return res.end(JSON.stringify({ error: { message: '[groq] All accounts rate limited' } })); }
  const step = dur / WORDS.length;
  res.end(JSON.stringify({ text: WORDS.join(' '), language: 'english',
    words: WORDS.map((w, i) => ({ word: w, start: +(i * step).toFixed(2), end: +((i + 0.9) * step).toFixed(2) })) }));
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const URL_ = 'http://127.0.0.1:' + server.address().port + '/v1';

// Async spawn: the stand-in gateway runs in this same process.
function edit(args, env) {
  return new Promise(resolve => {
    const p = spawn(process.execPath, [EDIT, VIDEO, '--no-brand', '--no-cut-pauses', '--json', ...args],
      { env: { ...process.env, NO_PROXY: '127.0.0.1,localhost', ...env } });
    let out = '', err = '';
    p.stdout.on('data', d => { out += d; }); p.stderr.on('data', d => { err += d; });
    p.on('close', status => resolve({ status, out, err }));
  });
}

try {
  // 1. auto: OmniRoute is used when OMNIROUTE_URL is set
  const out1 = path.join(tmp, 'a');
  const r1 = await edit(['--out', out1], { OMNIROUTE_URL: URL_, OMNIROUTE_API_KEY: 'omni-test-key' });
  check('pipeline finishes', r1.status === 0, r1.status ? r1.err.slice(-300) : 'ok');
  const rep = JSON.parse(r1.out || '{}');
  const tr = (rep.steps || []).find(s => s.step === 'transcribe') || {};
  check('transcribed by OmniRoute', tr.engine === 'omniroute groq/whisper-large-v3-turbo', tr.engine);
  check('5 words with timings', tr.words === 5, tr.words);
  check('request went to /v1/audio/transcriptions', seen && seen.path === '/v1/audio/transcriptions', seen && seen.path);
  check('OmniRoute key sent as Bearer', seen && seen.auth === 'Bearer omni-test-key', seen && seen.auth);
  check('asks for verbose JSON with word timings first', seen && seen.format === 'verbose_json' && seen.granularities[0] === 'word', seen && JSON.stringify(seen.granularities));
  check('audio file uploaded', seen && seen.fileSize > 1000, seen && seen.fileSize);
  const srt = fs.readFileSync(path.join(out1, 'captions.srt'), 'utf8');
  check('captions use the OmniRoute words', /Hello/.test(srt) && /OmniRoute/.test(srt), srt.replace(/\s+/g, ' ').slice(0, 90));

  // 2. --transcriber omniroute + gateway down: clear error, no silent fallback
  mode = 'fail';
  const r2 = await edit(['--out', path.join(tmp, 'b'), '--transcriber', 'omniroute'], { OMNIROUTE_URL: URL_ });
  check('forced OmniRoute + gateway error: exit 1 with its message', r2.status === 1 && /OmniRoute 503: \[groq\] All accounts rate limited/.test(r2.err), r2.err.trim().slice(-120));

  // 3. --transcriber omniroute without OMNIROUTE_URL: clear error
  const r3 = await edit(['--out', path.join(tmp, 'c'), '--transcriber', 'omniroute'], { OMNIROUTE_URL: '' });
  check('forced OmniRoute without OMNIROUTE_URL: clear error', r3.status === 1 && /needs OMNIROUTE_URL/.test(r3.err), r3.err.trim().slice(-100));

  // 4. auto + gateway down: falls back (Groq, then local Whisper) and records why
  const r4 = await edit(['--out', path.join(tmp, 'd')], { OMNIROUTE_URL: URL_ });
  const rep4 = JSON.parse(r4.out || '{}');
  const why = (rep4.steps || []).find(s => s.step === 'omniroute-unavailable');
  const tr4 = (rep4.steps || []).find(s => s.step === 'transcribe') || {};
  check('auto + gateway down: still finishes', r4.status === 0, r4.status ? r4.err.slice(-300) : 'ok');
  check('fallback reason in the report', why && /503/.test(why.reason), why && why.reason);
  check('fallback engine used instead', tr4.engine && !/^omniroute/.test(tr4.engine) && tr4.words > 0, tr4.engine + ', ' + tr4.words + ' words');
} catch (e) {
  check('test crashed', false, e.message);
} finally {
  server.close();
  fs.rmSync(tmp, { recursive: true, force: true });
}
console.log(failures ? '\n' + failures + ' check(s) FAILED' : '\nAll checks passed');
process.exit(failures ? 1 : 0);
