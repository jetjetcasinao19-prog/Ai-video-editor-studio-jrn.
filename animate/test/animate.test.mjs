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

test('signature: sound logo, brush paint-in and sign-off are drawn', async () => {
  const r = spawnSync('python3', ['-I', '-c', `import sys; sys.path.insert(0, ${JSON.stringify(path.join(HERE, '..', 'lib'))})
import audio, numpy as np
x = audio.sfx_signal('signature'); assert len(x) > audio.SR and np.abs(x).max() > 0.1; print('ok')`], { encoding: 'utf8' });
  assert.match(r.stdout, /ok/, r.stderr);
  const frameAt = async (env, t) => {
    for (const [k, v] of Object.entries(env)) process.env[k] = v;
    const p = await loadProject(PROJECT);
    for (const k of Object.keys(env)) delete process.env[k];
    return { p, fd: await makeFrameDrawer(p), t };
  };
  // paint-in: early in a scene the album look shows an ink sketch, so it differs from the finished picture
  const { p, fd } = await frameAt({ ANIMATE_LOOK: 'album' }, 0);
  const sc = p.story.scenes[2], PA = p.style.layoutOf(p.meta).paint;
  const early = dhash(fd.frame(sc.start + 0.3), PA.x, PA.y, PA.w, PA.h), early2 = colorSig(fd.frame(sc.start + 0.3), PA.x, PA.y, PA.w, PA.h);
  const p2 = { ...p, meta: { ...p.meta, paintIn: 0 } }, fd2 = await makeFrameDrawer(p2);
  const plain = colorSig(fd2.frame(sc.start + 0.3), PA.x, PA.y, PA.w, PA.h);
  assert.ok(early && early2.some((v, i) => Math.abs(v - plain[i]) > 12), 'the brush sketch shows at the start of a scene');
  // sign-off: the outro frame changes when the signature is on
  const t = p.meta.outro.at + 1.2;
  const withSig = colorSig(fd.frame(t), PA.x, PA.y, 300, 260);
  const fd3 = await makeFrameDrawer({ ...p, meta: { ...p.meta, signature: false } });
  const noSig = colorSig(fd3.frame(t), PA.x, PA.y, 300, 260);
  assert.ok(withSig.some((v, i) => Math.abs(v - noSig[i]) > 8), 'the tughra and seal are drawn at the outro');
});

test('craft lint: flags narrator-echo labels and stamp habits, passes a clean story', async () => {
  const { lintStory } = await import('../lib/lint.mjs');
  const clean = await lintStory(path.join(HERE, '..', 'projects', 'black-friday'));
  assert.ok(clean.ok, 'black-friday passes: ' + clean.issues.map(i => i.msg).join('; '));
  // a deliberately sloppy copy: every spoken sentence pasted on screen and stamped
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'slop-'));
  for (const f of ['voice.mp3', 'words.json']) fs.copyFileSync(path.join(HERE, '..', 'projects', 'microwave', f), path.join(tmp, f));
  const words = JSON.parse(fs.readFileSync(path.join(tmp, 'words.json'), 'utf8')).words.map(w => w.w.replace(/[^A-Za-z']/g, '').toUpperCase());
  const echoes = [2, 12, 22, 32, 42, 52, 62].map(i => words.slice(i, i + 3).join(' ').toLowerCase()).filter(e => !/\d/.test(e));
  const story = fs.readFileSync(path.join(HERE, '..', 'projects', 'microwave', 'story.mjs'), 'utf8')
    .replace(/from '\.\.\/\.\.\//g, `from '${path.join(HERE, '..')}/`)
    .replace("const { k, P, W } = S;", "const { k, P, W } = S;\n" + echoes.map(e => `      k.label(ctx, '${e}', 100, 100, 20, 1);`).join('\n') + "\n      k.stamp(ctx, 'ONE', 9, 9, 9, 1); k.stamp(ctx, 'TWO', 9, 9, 9, 1); k.stamp(ctx, 'THREE', 9, 9, 9, 1);");
  fs.writeFileSync(path.join(tmp, 'story.mjs'), story);
  const sloppy = await lintStory(tmp);
  assert.ok(sloppy.issues.some(i => i.rule === 'echo-labels'), 'microwave has labels that echo the voice');
  assert.ok(sloppy.issues.some(i => i.rule === 'stamp-habit'), 'microwave stamps too often');
});

test('hand-made motion: drawings are held two frames on twos', async () => {
  process.env.ANIMATE_LOOK = 'album';
  const p = await loadProject(PROJECT);
  delete process.env.ANIMATE_LOOK;
  const fd = await makeFrameDrawer(p), PA = p.style.layoutOf(p.meta).paint, t0 = 20 / 30;
  const a = colorSig(fd.frame(t0 + 3 * 2 / 30), PA.x + 100, PA.y + 100, 600, 600);
  const b = colorSig(fd.frame(t0 + 3 * 2 / 30 + 0.5 / 30), PA.x + 100, PA.y + 100, 600, 600);
  assert.deepEqual(a, b, 'a held drawing does not change within its two frames');
});

test('panorama: a Matrakçı-style city plan draws with rivers, squares and a landmark', async () => {
  const { panorama } = await import('../styles/ottoman/scenes.mjs');
  const kitmod = await import('../styles/ottoman/kit.mjs');
  const { createCanvas } = await import('@napi-rs/canvas');
  const cv = createCanvas(940, 1060), ctx = cv.getContext('2d');
  let drew = false;
  panorama(ctx, { W: 940, H: 1060, k: kitmod, P: kitmod.P, t: 0 }, { grid: { cols: 5, rows: 6 }, squares: [[1, 1]], rivers: ['left', 'right'], landmarkCell: [2, 2], landmark: () => { drew = true; } });
  assert.ok(drew, 'landmark callback ran');
  const sig = colorSig(cv); assert.ok(new Set(sig.map(v => Math.round(v / 20))).size > 3, 'the plan is not blank');
});

test('host: lip-sync follows the voice and the Nakkaş appears for the sign-off', async () => {
  const H = await import('../styles/ottoman/host.mjs');
  const p0 = await loadProject(PROJECT);
  const env = H.voiceEnvelope(p0.dir, p0.meta.voice, 30);
  assert.ok(env.length > 30 * 50, 'one value per frame');
  const loud = env.filter(v => v > 0.4).length, quiet = env.filter(v => v < 0.05).length;
  assert.ok(loud > 100 && quiet > 30, 'speech and pauses are both present');
  process.env.ANIMATE_LOOK = 'album';
  const p = await loadProject(PROJECT);
  delete process.env.ANIMATE_LOOK;
  const PA = p.style.layoutOf(p.meta).paint, w = p.words, i = w.findIndex(x => /^every$/i.test(x.w.replace(/[^A-Za-z]/g, '')));
  assert.ok(i > 0, 'the story has the closing line');
  const t = w[i].start + 0.5, region = [PA.x + PA.w / 2 - 150, PA.y + PA.h - 480, 300, 460];
  const withHost = colorSig((await makeFrameDrawer(p)).frame(t), ...region);
  const noHost = colorSig((await makeFrameDrawer({ ...p, meta: { ...p.meta, host: false } })).frame(t), ...region);
  assert.ok(withHost.some((v, j) => Math.abs(v - noHost[j]) > 15), 'the host is drawn at the sign-off');
});

test('acting: every gesture gives arm angles and blends from rest', async () => {
  const { act, GESTURES } = await import('../styles/ottoman/acting.mjs');
  for (const n of Object.keys(GESTURES)) { const a = act(n, 0.5, 1); assert.ok(Array.isArray(a.armF) && a.armF.every(Number.isFinite), n); }
  assert.deepEqual(act('cheer', 0, 0).armF, act('rest', 0, 1).armF, 'k = 0 is the resting pose');
});
