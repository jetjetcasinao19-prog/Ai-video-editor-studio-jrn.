// Demo reels have no voice-over: this writes a silent voice.mp3 and a
// words.json whose "words" are each scene's LABELS, so the caption panel
// names the effect on screen.   node demo/make-captions.mjs demo/fx-inkblot
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const dir = path.resolve(process.argv[2]);
const story = await import(pathToFileURL(path.join(dir, 'story.mjs')).href);
const words = [];
story.LABELS.forEach((label, i) => {
  const t0 = story.scenes[i].start + (i ? 0.25 : 0.05);
  const ws = label.split(/\s+/), step = 0.3;
  // the label stays up for most of the scene: the last word is held
  ws.forEach((w, j) => words.push({ w, start: +(t0 + j * step).toFixed(2), end: +(j === ws.length - 1 ? t0 + 1.9 : t0 + j * step + 0.28).toFixed(2) }));
});
fs.writeFileSync(path.join(dir, 'words.json'), JSON.stringify({ words }, null, 1));
spawnSync('ffmpeg', ['-y', '-v', 'error', '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=mono', '-t', String(story.meta.duration), '-c:a', 'libmp3lame', '-b:a', '32k', path.join(dir, 'voice.mp3')], { stdio: 'inherit' });
console.log('wrote', words.length, 'caption words + silent voice.mp3 →', dir);
