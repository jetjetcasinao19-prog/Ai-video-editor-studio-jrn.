// Tests for code-animated shorts:  cd animate && npm test
// (add --quick-only: NODE_TEST_QUICK=1 skips the 1-second MP4 render)
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { loadProject, makeFrameDrawer, checkStory, render } from '../lib/engine.mjs';
import { mergePunctuation, applyFix, fixTimings } from '../transcribe.mjs';
import { chunkScript } from '../voice.mjs';
import { createCanvas } from '@napi-rs/canvas';
import { blot } from '../styles/inkblot/kit.mjs';
import { roman } from '../styles/inkblot/page.mjs';
import { ebru, groupLines, LAYOUT } from '../styles/ottoman/page.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PROJECT = path.join(HERE, '..', 'projects', 'bubble-wrap');
const INKBLOT = path.join(HERE, '..', 'projects', 'zeigarnik-effect');
// every finished short is checked, so a change to the style can't break an older video
const PROJECTS = fs.readdirSync(path.join(HERE, '..', 'projects')).filter(d => fs.existsSync(path.join(HERE, '..', 'projects', d, 'story.mjs'))).map(d => path.join(HERE, '..', 'projects', d));

test('transcript: punctuation comes back and names can be fixed', () => {
  const words = [{ w: 'Mark', start: 0, end: 0.3 }, { w: 'Chavannes', start: 0.3, end: 0.8 }];
  const merged = mergePunctuation(words, 'Mark Chavannes,');
  assert.equal(merged[1].w, 'Chavannes,');
  assert.equal(applyFix(merged, ['Mark=Marc'])[0].w, 'Marc');
  // different word counts → leave the words alone
  assert.equal(mergePunctuation(words, 'Mark C. Chavannes')[1].w, 'Chavannes');
});

test('transcript: out-of-order word times are repaired', () => {
  const w = fixTimings([{ w: 'halfway.', start: 27.74, end: 28.58 }, { w: 'Later,', start: 28.1, end: 29.3 }, { w: 'they', start: 29.3, end: 29.48 }, { w: 'and', start: 29.0, end: 29.6 }]);
  assert.equal(w[1].start, 28.9, 'a long word overlapping the previous one starts near its end');
  for (let i = 1; i < w.length; i++) assert.ok(w[i].start >= w[i - 1].start, 'starts are in order');
});

test('voice: script is split into speakable chunks with pauses', () => {
  const c = chunkScript('Your brain keeps a list... you never wrote.\n\nBerlin, the 1920s. ' + 'A very long sentence, '.repeat(12) + 'the end.');
  assert.equal(c[0].text, 'Your brain keeps a list...');
  assert.ok(c[0].pause > 0.4, '"..." is a longer pause');
  assert.ok(c[1].pause >= 0.6, 'a blank line is a paragraph pause');
  assert.ok(c.every(x => x.text.length <= 190), 'every chunk fits the TTS limit');
  assert.equal(c.map(x => x.text).join(' ').replace(/\s+/g, ' '), ('Your brain keeps a list... you never wrote. Berlin, the 1920s. ' + 'A very long sentence, '.repeat(12) + 'the end.').replace(/\s+/g, ' '));
});

test('inkblot: blots are deterministic and mirror-symmetric (the Rorschach fold)', () => {
  const draw = () => { const c = createCanvas(200, 160); blot(c.getContext('2d'), 100, 80, 200, 160, { seed: 7, res: 1 }); return c.getContext('2d').getImageData(0, 0, 200, 160).data; };
  const a = draw(), b = draw();
  assert.deepEqual(Buffer.from(a), Buffer.from(b));
  let ink = 0, diff = 0;
  for (let y = 0; y < 160; y++) for (let x = 0; x < 100; x++) {
    const l = a[(y * 200 + x) * 4 + 3], r = a[(y * 200 + 199 - x) * 4 + 3];
    if (l > 0) ink++; diff = Math.max(diff, Math.abs(l - r));
  }
  assert.ok(ink > 800, 'there is ink');
  assert.ok(diff <= 2, 'left and right halves match');
  assert.deepEqual([1, 4, 9, 14, 22].map(roman), ['I', 'IV', 'IX', 'XIV', 'XXII']);
});

test('ebru marbling is deterministic', () => {
  const a = ebru(60, 40, 3).getContext('2d').getImageData(0, 0, 60, 40).data;
  const b = ebru(60, 40, 3).getContext('2d').getImageData(0, 0, 60, 40).data;
  assert.deepEqual(Buffer.from(a), Buffer.from(b));
  assert.ok(new Set(Array.from(a.filter((_, i) => i % 4 === 0))).size > 2, 'uses several ink colours');
});

for (const PROJ of PROJECTS) test(`story ${path.basename(PROJ)}: scenes are ordered, voice fits, every word is captioned`, async () => {
  const p = await loadProject(PROJ);
  assert.deepEqual(checkStory(p.meta, p.story.scenes, p.words), []);
  const lines = groupLines(p.words);
  assert.equal(lines.flat().length, p.words.length);
  for (const s of p.story.sfx) assert.ok(s.t >= 0 && s.t < p.meta.duration, 'sfx inside the video: ' + s.type);
});

for (const PROJ of PROJECTS) test(`${path.basename(PROJ)}: every scene draws (start, middle, during its transition) and is not blank`, async () => {
  const p = await loadProject(PROJ);
  const fd = await makeFrameDrawer(p);
  const sc = p.story.scenes, PA = LAYOUT.paint;
  const sig = [];
  for (let i = 0; i < sc.length; i++) {
    const end = i + 1 < sc.length ? sc[i + 1].start : p.meta.duration;
    fd.frame(sc[i].start + 0.2); // mid-transition: must draw (a gold flash may be blank on purpose)
    for (const t of [sc[i].start + 0.45, (sc[i].start + end) / 2, end - 0.05]) {
      fd.frame(t);
      const d = fd.ctx.getImageData(PA.x, PA.y, PA.w, PA.h).data;
      let sum = 0, sum2 = 0, n = 0;
      for (let j = 0; j < d.length; j += 4 * 97) { const v = d[j] + d[j + 1] + d[j + 2]; sum += v; sum2 += v * v; n++; }
      const sd = Math.sqrt(sum2 / n - (sum / n) ** 2);
      assert.ok(sd > 20, `scene "${sc[i].title}" at ${t.toFixed(2)}s looks blank (sd ${sd.toFixed(1)})`);
      if (t === (sc[i].start + end) / 2) sig.push(Math.round(sum / n));
    }
  }
  assert.ok(new Set(sig).size > sc.length * 0.7, 'scenes look different from each other');
});

test('soundtrack generator makes every sound effect', () => {
  const r = spawnSync('python3', ['-I', '-c', `
import sys; sys.path.insert(0, ${JSON.stringify(path.join(HERE, '..', 'lib'))})
import audio
kinds = sys.argv[1].split(',')
for k in kinds:
    s = audio.sfx_signal(k)
    assert len(s) > 100 and abs(s).max() > 0, k
print('ok', len(kinds))
`, [...new Set((await_sfx()).map(s => s.type))].join(',')], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /^ok/);
});
function await_sfx() { // the sfx lists without importing the stories twice
  const src = PROJECTS.map(d => fs.readFileSync(path.join(d, 'story.mjs'), 'utf8')).join('\n');
  return [...src.matchAll(/type: '([a-z]+)'/g)].map(m => ({ type: m[1] }));
}

test('renders a 1-second MP4 with picture and sound', { skip: process.env.NODE_TEST_QUICK === '1' }, async () => {
  const out = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'animate-')), 'slice.mp4');
  await render(PROJECT, { out, build: path.join(path.dirname(out), 'build'), workers: 2, from: 9.5, to: 10.5, log: () => {} });
  const probe = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_type,width,height', '-of', 'csv=p=0', out], { encoding: 'utf8' }).stdout;
  assert.match(probe, /video,1080,1920/);
  assert.match(probe, /audio/);
});

test('renders a 1-second INKBLOT MP4 through a fold transition', { skip: process.env.NODE_TEST_QUICK === '1' }, async () => {
  const out = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'animate-')), 'slice.mp4');
  await render(INKBLOT, { out, build: path.join(path.dirname(out), 'build'), workers: 2, from: 5.6, to: 6.6, log: () => {} });
  const probe = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_type,width,height', '-of', 'csv=p=0', out], { encoding: 'utf8' }).stdout;
  assert.match(probe, /video,1080,1920/);
  assert.match(probe, /audio/);
});

test('skill trigger "edit this in 2D(OTTOMAN)" points at an existing style', () => {
  const root = path.join(HERE, '..', '..');
  const skill = fs.readFileSync(path.join(root, '.claude', 'skills', 'animated-short', 'SKILL.md'), 'utf8');
  const desc = skill.split('\n').find(l => l.startsWith('description:'));
  assert.ok(desc.includes('edit this in 2D(OTTOMAN)'), 'phrase is in the skill description');
  const styles = [...desc.matchAll(/edit this in 2D\((\w+)\)/g)].map(m => m[1].toLowerCase());
  assert.ok(styles.includes('inkblot'), 'INKBLOT is a trigger too');
  for (const style of styles) assert.ok(fs.existsSync(path.join(HERE, '..', 'styles', style, 'index.mjs')), 'styles/' + style + ' exists');
  const editThis = fs.readFileSync(path.join(root, '.claude', 'skills', 'edit-this', 'SKILL.md'), 'utf8');
  assert.match(editThis.split('\n').find(l => l.startsWith('description:')), /NOT for "edit this in 2D/);
});
