// Voice-over → word timings (words.json) for an animated short.
//
//   node transcribe.mjs <voice.mp3> <project-folder> [--fix "Mark=Marc" ...]
//
// Order: OmniRoute (if OMNIROUTE_URL is set) → Groq Whisper (key from
// GROQ_API_KEY or the cloud session's proxy). Writes <project>/words.json:
//   { text, words: [{ w, start, end }] }   (w keeps its punctuation)
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Node's fetch only uses HTTPS_PROXY when this is set: re-run ourselves with it.
if (process.env.HTTPS_PROXY && !process.env.NODE_USE_ENV_PROXY && process.argv[1] === fileURLToPath(import.meta.url)) {
  const r = spawnSync(process.execPath, process.argv.slice(1), { stdio: 'inherit', env: { ...process.env, NODE_USE_ENV_PROXY: '1' } });
  process.exit(r.status ?? 1);
}

function endpoints(env = process.env) {
  const list = [];
  let url = String(env.OMNIROUTE_URL || '').trim().replace(/\/+$/, '');
  if (url) {
    if (!/\/v1$/.test(url)) url += '/v1';
    list.push({ label: 'OmniRoute', endpoint: url + '/audio/transcriptions', key: env.OMNIROUTE_API_KEY || '', model: env.OMNIROUTE_TRANSCRIBE_MODEL || 'groq/whisper-large-v3' });
  }
  list.push({ label: 'Groq', endpoint: 'https://api.groq.com/openai/v1/audio/transcriptions', key: env.GROQ_API_KEY || 'proxy-injected', model: 'whisper-large-v3' });
  return list;
}

// Whisper's word list has no punctuation; its text does. Put the punctuation
// back when the two line up word for word.
export function mergePunctuation(words, text) {
  const toks = String(text || '').trim().split(/\s+/).filter(Boolean);
  const norm = s => s.toLowerCase().replace(/[^\p{L}\p{N}']/gu, '');
  const same = toks.length === words.length && toks.every((t, i) => norm(t) === norm(words[i].w));
  return same ? words.map((w, i) => ({ ...w, w: toks[i] })) : words;
}

// --fix "Mark=Marc": swap a word (punctuation kept).
export function applyFix(words, fixes) {
  return words.map(w => {
    for (const f of fixes) {
      const [from, to] = f.split('=');
      const re = new RegExp('^' + from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?=\\W*$)', 'i');
      if (re.test(w.w)) return { ...w, w: w.w.replace(re, to) };
    }
    return w;
  });
}

export async function transcribe(audio, { language = 'en' } = {}) {
  let lastErr;
  for (const ep of endpoints()) {
    try {
      const form = new FormData();
      form.append('file', new Blob([fs.readFileSync(audio)], { type: 'audio/mpeg' }), path.basename(audio));
      form.append('model', ep.model);
      form.append('response_format', 'verbose_json');
      form.append('timestamp_granularities[]', 'word');
      form.append('timestamp_granularities[]', 'segment');
      if (language) form.append('language', language);
      const res = await fetch(ep.endpoint, { method: 'POST', body: form, headers: ep.key ? { Authorization: 'Bearer ' + ep.key } : {} });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(ep.label + ' ' + res.status + ': ' + (body.error?.message || res.statusText));
      const words = (body.words || []).map(w => ({ w: String(w.word).trim(), start: +w.start.toFixed(2), end: +w.end.toFixed(2) })).filter(w => w.w);
      if (!words.length) throw new Error(ep.label + ' returned no word timings');
      return { engine: ep.label + ' ' + ep.model, text: String(body.text || '').trim(), words: mergePunctuation(words, body.text) };
    } catch (e) { lastErr = e; console.error('  ' + e.message); }
  }
  throw lastErr;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const fixes = [];
  for (let i = args.indexOf('--fix'); i >= 0; i = args.indexOf('--fix')) { fixes.push(args[i + 1]); args.splice(i, 2); }
  const [audio, project] = args;
  if (!audio || !project) { console.error('usage: node transcribe.mjs <voice.mp3> <project-folder> [--fix "Mark=Marc"]'); process.exit(2); }
  const out = await transcribe(audio);
  out.words = applyFix(out.words, fixes);
  fs.mkdirSync(project, { recursive: true });
  fs.writeFileSync(path.join(project, 'words.json'), JSON.stringify(out, null, 1));
  console.log(`${out.words.length} words (${out.engine}) → ${path.join(project, 'words.json')}`);
  console.log(out.words.map(w => w.w).join(' '));
}
