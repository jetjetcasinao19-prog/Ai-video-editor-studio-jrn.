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
import { mergePunctuation, applyFix } from '../transcribe.mjs';
import { ebru, groupLines, LAYOUT } from '../styles/ottoman/page.mjs';
import { LOOKS, LOOK_NAMES, getLook, buildPage, TRANSITIONS } from '../styles/ottoman/looks.mjs';
import { dhash, hamming, colorSig, sameDesign } from '../lib/unique.mjs';
import { chapterList, stamp, slugify } from '../compile.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PROJECT = path.join(HERE, '..', 'projects', 'bubble-wrap');
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
  const sc = p.story.scenes, PA = p.style.layoutOf ? p.style.layoutOf(p.meta).paint : LAYOUT.paint;
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

test('skill trigger "edit this in 2D(OTTOMAN)" points at an existing style', () => {
  const root = path.join(HERE, '..', '..');
  const skill = fs.readFileSync(path.join(root, '.claude', 'skills', 'animated-short', 'SKILL.md'), 'utf8');
  const desc = skill.split('\n').find(l => l.startsWith('description:'));
  assert.ok(desc.includes('edit this in 2D(OTTOMAN)'), 'phrase is in the skill description');
  const style = /edit this in 2D\((\w+)\)/.exec(desc)[1].toLowerCase();
  assert.ok(fs.existsSync(path.join(HERE, '..', 'styles', style, 'index.mjs')), 'styles/' + style + ' exists');
  const editThis = fs.readFileSync(path.join(root, '.claude', 'skills', 'edit-this', 'SKILL.md'), 'utf8');
  assert.match(editThis.split('\n').find(l => l.startsWith('description:')), /NOT for "edit this in 2D/);
});

test('looks: every look builds its own page and draws a real painting', async () => {
  assert.ok(LOOK_NAMES.length >= 5, 'at least five looks');
  const pages = {};
  for (const name of LOOK_NAMES) {
    const look = getLook({ look: name });
    const L = look.layout;
    assert.equal(L.paint.w, 940); assert.equal(L.paint.h, 1060); // scenes fit every look
    const pg = buildPage(look, { seed: 11, handle: '@TEST' });
    assert.equal(pg.width, 1080); assert.equal(pg.height, 1920);
    pages[name] = { page: dhash(pg), pageColor: colorSig(pg) };
    for (const tr of look.transitions || []) assert.ok(TRANSITIONS.includes(tr), `${name}: transition ${tr} exists`);
  }
  for (const a of LOOK_NAMES) for (const b of LOOK_NAMES) if (a < b) assert.ok(!sameDesign(pages[a], pages[b]), `${a} and ${b} pages look too alike`);
  assert.ok(sameDesign(pages.night, pages.night));
  assert.throws(() => getLook({ look: 'nope' }), /unknown look/);
});

test('looks: a project renders in every look, including mid-transition frames', async () => {
  for (const name of LOOK_NAMES) {
    process.env.ANIMATE_LOOK = name;
    const p = await loadProject(PROJECT);
    delete process.env.ANIMATE_LOOK;
    assert.equal(p.meta.look, name);
    const fd = await makeFrameDrawer(p), PA = p.style.layoutOf(p.meta).paint, sc = p.story.scenes;
    for (let i = 1; i < Math.min(sc.length, 6); i++) for (const dt of [0.1, 0.25, 0.6]) {
      fd.frame(sc[i].start + dt);
      const d = fd.ctx.getImageData(PA.x, PA.y, PA.w, PA.h).data;
      let sum = 0, sum2 = 0, n = 0;
      for (let j = 0; j < d.length; j += 4 * 97) { const v = d[j] + d[j + 1] + d[j + 2]; sum += v; sum2 += v * v; n++; }
      assert.ok(Math.sqrt(sum2 / n - (sum / n) ** 2) > 15, `${name}: scene ${i} at +${dt}s looks blank`);
    }
  }
});

test('uniqueness: the difference hash tells pictures apart', async () => {
  const { createCanvas } = await import('@napi-rs/canvas');
  const a = createCanvas(200, 200), b = createCanvas(200, 200);
  const ga = a.getContext('2d'), gb = b.getContext('2d');
  const gr = ga.createLinearGradient(0, 0, 200, 0); gr.addColorStop(0, '#000'); gr.addColorStop(1, '#fff'); ga.fillStyle = gr; ga.fillRect(0, 0, 200, 200);
  const gr2 = gb.createLinearGradient(0, 0, 200, 0); gr2.addColorStop(0, '#fff'); gr2.addColorStop(1, '#000'); gb.fillStyle = gr2; gb.fillRect(0, 0, 200, 200);
  assert.equal(hamming(dhash(a), dhash(a)), 0);
  assert.ok(hamming(dhash(a), dhash(b)) > 200);
});

test('compilation: YouTube chapter rules and timestamps', () => {
  assert.equal(stamp(0), '0:00'); assert.equal(stamp(64.4), '1:04'); assert.equal(stamp(3725), '1:02:05');
  assert.equal(slugify('Origins of the Holidays!'), 'origins-of-the-holidays');
  const good = chapterList([{ at: 0, title: 'A' }, { at: 60, title: 'B' }, { at: 120, title: 'C' }], 180);
  assert.ok(good.ok); assert.equal(good.text, '0:00 A\n1:00 B\n2:00 C');
  assert.ok(!chapterList([{ at: 0, title: 'A' }, { at: 60, title: 'B' }], 180).ok, 'needs three chapters');
  assert.ok(!chapterList([{ at: 0, title: 'A' }, { at: 5, title: 'B' }, { at: 60, title: 'C' }], 180).ok, 'chapters must be 10 s');
});
