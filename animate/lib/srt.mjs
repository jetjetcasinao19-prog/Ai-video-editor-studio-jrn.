// Subtitles: an .srt file from the word timings, cut into the same lines the
// video shows. Upload it to YouTube (Subtitles → Upload file → With timing) so
// the captions are searchable and can be auto-translated.
import fs from 'node:fs';
import path from 'node:path';
import { groupLines } from '../styles/ottoman/page.mjs';

const ts = s => { const ms = Math.max(0, Math.round(s * 1000)), h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, sec = Math.floor(ms / 1000) % 60; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
export function toSrt(words, maxChars = 30) {
  const lines = groupLines(words, maxChars);
  return lines.map((l, i) => {
    const start = l[0].start, next = lines[i + 1] ? lines[i + 1][0].start : Infinity, end = Math.min(l[l.length - 1].end + 0.35, next - 0.02);
    return `${i + 1}\n${ts(start)} --> ${ts(end)}\n${l.map(w => w.w).join(' ')}\n`;
  }).join('\n');
}
export function writeSrt(dir, meta, words, out) {
  out = out || path.join(dir, 'out', (meta.slug || 'short') + '.srt');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, toSrt(words, meta.captionChars || 30));
  return out;
}
