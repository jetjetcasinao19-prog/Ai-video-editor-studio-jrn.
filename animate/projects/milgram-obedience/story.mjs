// "Obedience to Authority" — an INKBLOT case file (psychology, MindTrace).
// Stanley Milgram, Yale (from 1961; published 1963): 15–450 V in 15 V steps,
// the learner pounds on the wall at 300 V then goes silent, "Please continue";
// predicted ~1%, actual 65% (26/40); when two peers refused: 10% (4/40).
// u = seconds since the scene started; S.at('word') = when that word is said.
import { clamp, lerp, ease, tween, rng, TAU, shake, pop } from '../../lib/core.mjs';
import { plate, study, caseCover, inkReveal } from '../../styles/inkblot/scenes.mjs';

export const meta = {
  title: 'Obedience to Authority',
  slug: 'milgram-obedience-inkblot',
  style: 'inkblot',
  width: 1080, height: 1920, fps: 30,
  duration: 58.0,
  voice: 'voice.mp3',
  seed: 96,
  captionChars: 24,
  caseLine: 'THE MIND FILES  ·  CASE No. 1961  ·  CONFIDENTIAL',
  brandKit: 'mindtrace', // MindTrace (brand/mindtrace/): logo, handle, tagline, outro text
  outro: { at: 55.4 },
};

const EXPERIMENTER = { labcoat: true, hair: 'slick', glasses: true };
const TEACHER = { hair: 'slick', tie: '#82a7c8' };
const LABELS = ['SLIGHT', 'MODERATE', 'STRONG', 'VERY STRONG', 'INTENSE', 'EXTREME', 'DANGER: SEVERE', 'XXX'];

// the shock generator: 30 switches, 15–450 V; `level` switches are down and lit
function generator(ctx, k, P, x, y, w, level, o = {}) {
  ctx.save(); ctx.translate(x, y);
  k.rect(ctx, -w / 2, -150, w, 300, '#3b3a3f', P.ink, 6, 10);
  k.rect(ctx, -w / 2 + 20, -130, w - 40, 60, P.ink, null, 0, 4);
  k.text(ctx, 'SHOCK GENERATOR', 0, -100, 30, { color: P.ochre });
  const sw = (w - 60) / 30;
  for (let i = 0; i < 30; i++) {
    const sx = -w / 2 + 30 + (i + 0.5) * sw, on = i < level;
    k.circle(ctx, sx, -40, sw * 0.28, on ? P.red : '#6d6c73');
    k.rect(ctx, sx - sw * 0.25, 0, sw * 0.5, 60, on ? P.paperLight : '#b9b6ad', P.ink, 2, 3);
    k.rect(ctx, sx - sw * 0.18, on ? 34 : 6, sw * 0.36, 20, P.ink, null, 0, 2);
    if (o.volts !== false && i % 2 === 0) { ctx.save(); ctx.translate(sx, 92); ctx.rotate(-Math.PI / 2); k.text(ctx, String((i + 1) * 15), 0, 0, sw * 0.55, { color: P.paperLight }); ctx.restore(); }
  }
  if (o.labels !== false) LABELS.forEach((l, j) => { const a = j * 4, b = Math.min(30, a + (j === 7 ? 2 : 4)); const cx = -w / 2 + 30 + ((a + b) / 2) * sw; k.text(ctx, l, cx, 128, sw * 0.42, { color: j >= 6 ? P.redLight : P.paperDark, max: (b - a) * sw - 4 }); });
  ctx.restore();
}
// marionette strings from a control bar held at (hx, hy) down to points on a figure
function strings(ctx, k, P, hx, hy, pts, a = 1, cut = 0) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  k.line(ctx, hx - 90, hy, hx + 90, hy, '#6b4a2b', 10); k.line(ctx, hx, hy - 50, hx, hy + 50, '#6b4a2b', 10);
  pts.forEach(([px, py], i) => { const sx = hx + (i - (pts.length - 1) / 2) * 60; const ey = lerp(py, hy + 40, cut); k.line(ctx, sx, hy, lerp(px, sx, cut * 0.3), ey, P.grey, 2); });
  ctx.restore();
}

export const scenes = [
  { // 0.0 "The closest thing to real mind control? A man in a lab coat."
    start: 0, title: 'Mind Control?',
    draw(ctx, u, S) {
      const { k, P, W } = S, mc = S.at('control'), lc = S.at('lab');
      plate(ctx, S, { alpha: 0.12, seed: 4 });
      S.cam(lerp(1.08, 1.0, tween(u, 0, 4.6)), W / 2, 560);
      const sway = Math.sin(u * 2.4) * 0.12, reveal = tween(u, lc - 0.4, lc + 0.2);
      // the puppet: an ordinary person on strings
      k.figure(ctx, 330, 1010, { s: 1.15, face: 1, look: [0.3, -1], mood: 'worry', armL: [0.9 + sway, 0.3], armR: [0.9 - sway, 0.3], tilt: sway * 0.3 });
      strings(ctx, k, P, 330, 210, [[260, 650], [330, 580], [400, 650]], tween(u, 0, mc));
      // the puppeteer steps out of the dark: a man in a lab coat
      if (reveal > 0) { ctx.save(); ctx.globalAlpha = reveal; k.figure(ctx, lerp(940, 760, reveal), 1010, { ...EXPERIMENTER, s: 1.15, face: -1, look: [-0.8, -0.2], mood: 'calm', armL: [2.4, 0.4] }); ctx.restore(); }
      k.scrawl(ctx, 'mind control?', 650, 280, 64, tween(u, mc - 0.3, mc + 0.3), { rot: -0.06 });
    },
  },
  { // 5.32 "In 1961, Yale psychologist Stanley Milgram told volunteers to shock a stranger for every wrong answer."
    start: 4.95, title: 'Yale, 1961', trans: 'bleed',
    draw(ctx, u, S) {
      const { k, P, W } = S, yr = S.at('1961'), sm = S.at('Stanley'), vo = S.at('volunteers'), st = S.at('stranger'), wr = S.at('wrong');
      study(ctx, S, { desk: false });
      S.cam(1.04, W / 2, 600);
      // the wall between the rooms; the learner behind it, wired up
      k.rect(ctx, 640, 260, 30, 560, P.inkSoft);
      k.figure(ctx, 830, 820, { hair: 'slick', s: 0.85, sit: true, face: -1, look: [-0.6, 0], mood: u > wr ? 'worry' : 'calm' });
      k.line(ctx, 800, 600, 670, 600, P.red, 4);
      k.figure(ctx, 330, 820, { ...TEACHER, s: 0.85, sit: true, face: 1, look: [0.8, 0.3], mood: 'worry', armR: [1.3, 0.8] });
      k.rect(ctx, 380, 640, 240, 120, '#3b3a3f', P.ink, 4, 6);
      for (let i = 0; i < 8; i++) k.rect(ctx, 395 + i * 27, 690, 12, 30, '#b9b6ad', P.ink, 1);
      k.figure(ctx, 130, 820, { ...EXPERIMENTER, s: 0.95, face: 1, look: [0.8, 0], mood: 'calm', armL: [1.2, 0.8], holdL: c => k.rect(c, -30, -60, 60, 80, P.paperLight, P.ink, 3) });
      k.stamp(ctx, 'YALE · 1961', 300, 150, 52, tween(u, yr, yr + 0.25), -0.08);
      k.scrawl(ctx, 'Stanley Milgram', 220, 420, 50, tween(u, sm, sm + 0.5), { rot: -0.05 });
      k.scrawl(ctx, 'volunteer', 390, 520, 44, tween(u, vo, vo + 0.4));
      k.scrawl(ctx, 'stranger', 830, 400, 50, tween(u, st, st + 0.4));
      k.arrow(ctx, 830, 430, 830, 500, tween(u, st + 0.2, st + 0.5), P.red, 5, 0);
    },
  },
  { // 13.1 "15 volts, then 30, all the way to 450."
    start: 12.95, title: '15 to 450 Volts', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, v15 = S.at('15'), v30 = S.at('30,'), v450 = S.at('450');
      plate(ctx, S, { blot: false, bg: '#24222a' });
      const lvl = u < v30 ? (u > v15 ? 1 : 0) : u < v450 - 1.2 ? 2 : lerp(2, 30, tween(u, v450 - 1.2, v450 + 0.2, ease.inQuad));
      generator(ctx, k, P, W / 2, 520, 900, Math.floor(lvl));
      const volts = Math.max(15, Math.floor(lvl) * 15);
      k.text(ctx, volts + ' V', W / 2, 860, 140, { font: 'display', color: volts >= 400 ? P.red : P.paperLight });
      if (lvl >= 30) k.stamp(ctx, 'XXX', 830, 220, 70, tween(u, v450, v450 + 0.2), 0.1);
    },
  },
  { // 18.72 "He banged on the wall, then went silent."
    start: 17.9, title: 'Then… Silence', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W, H } = S, bg = S.at('banged'), sl = S.at('silent');
      plate(ctx, S, { blot: false, bg: '#e2d8c2' });
      const quiet = tween(u, sl - 0.2, sl + 0.2);
      // the wall shakes under the blows, then nothing
      const hit = u > bg && u < sl - 0.2 ? Math.abs(Math.sin(u * 14)) : 0;
      ctx.save(); ctx.translate(shake(u, bg, 10, 0.4) * (1 - quiet) + hit * 4, 0);
      k.rect(ctx, 120, 60, 700, 940, '#cfc3a8', P.ink, 6);
      for (let r = 0; r < 12; r++) for (let c = 0; c < 4; c++) k.rect(ctx, 120 + c * 175 + (r % 2) * 87, 60 + r * 78, 175, 78, null, '#b3a68a', 2);
      ctx.restore();
      ['BANG!', 'BANG!', 'BANG!'].forEach((b, i) => { const p = pop(u, bg + i * 0.35, 0.2) * (1 - quiet); if (p) { ctx.save(); ctx.translate(260 + i * 200, 300 + (i % 2) * 220); ctx.rotate((i - 1) * 0.2); ctx.scale(p, p); k.text(ctx, b, 0, 0, 90, { font: 'display', color: P.red }); ctx.restore(); } });
      if (quiet > 0) { ctx.save(); ctx.globalAlpha = quiet; k.text(ctx, '…', W / 2, 500, 200, { font: 'display', color: P.ink }); k.scrawl(ctx, 'silence.', W / 2, 760, 80, tween(u, sl + 0.2, sl + 0.7)); ctx.restore(); }
    },
  },
  { // 22.24 'The man in the lab coat said, "Please continue."'
    start: 22.05, title: '"Please Continue."', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, pc = S.at('"Please');
      plate(ctx, S, { alpha: 0.1, seed: 22 });
      S.cam(lerp(1.0, 1.12, tween(u, 0, 3.6)), 400, 600);
      k.figure(ctx, 330, 1010, { ...EXPERIMENTER, s: 1.3, face: 1, look: [0.6, 0], mood: 'calm', armL: [1.2, 0.8], holdL: c => k.rect(c, -34, -70, 68, 92, P.paperLight, P.ink, 3) });
      k.figure(ctx, 790, 1010, { ...TEACHER, s: 1.05, face: -1, look: [-0.8, -0.2], mood: 'worry', armR: [0.6, 1.8] });
      for (let i = 0; i < 3; i++) { const f = (u * 1.3 + i / 3) % 1; k.ellipse(ctx, 740 + i * 50, 560 + f * 70, 8, 12, 0, P.sky, P.ink, 2); }
      const b = pop(u, pc - 0.25, 0.3);
      if (b) { ctx.save(); ctx.translate(380, 300); ctx.scale(b, b); k.rect(ctx, -260, -70, 520, 140, P.paperLight, P.ink, 5, 30); k.typeOn(ctx, 'Please continue.', 0, 4, 54, tween(u, pc - 0.1, pc + 0.6, ease.linear), { align: 'center', font: 'serif', caret: false }); ctx.restore(); }
      k.scrawl(ctx, 'calm. polite. firm.', 640, 160, 50, tween(u, pc + 0.8, pc + 1.4));
    },
  },
  { // 26.02 "Students predicted about 1% would go all the way."
    start: 25.8, title: 'Predicted: About 1%', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, n = S.at('1%');
      plate(ctx, S, { alpha: 0.06, seed: 61 });
      k.text(ctx, 'STUDENTS PREDICTED', W / 2, 110, 40, { color: P.inkSoft });
      k.percentGrid(ctx, 170, 180, 600, 1 * tween(u, n - 0.1, n + 0.4));
      k.text(ctx, '≈1%', W / 2, 900, 120, { font: 'display', color: P.red });
      k.text(ctx, 'would go to 450 V', W / 2, 990, 44, {});
    },
  },
  { // 29.8 "65% did."
    start: 29.6, title: 'Actually: 65%', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, n = S.at('65%');
      plate(ctx, S, { alpha: 0.06, seed: 65 });
      k.text(ctx, 'ACTUALLY WENT TO 450 V', W / 2, 110, 40, { color: P.inkSoft });
      const v = lerp(1, 65, tween(u, n - 0.1, n + 0.9, ease.outCubic));
      k.percentGrid(ctx, 170, 180, 600, v);
      k.text(ctx, Math.round(v) + '%', W / 2, 900, 120, { font: 'display', color: P.red });
      k.text(ctx, '26 of 40 people', W / 2, 990, 44, {});
    },
  },
  { // 32.42 "The shocks were fake. The stranger was an actor. They didn't know."
    start: 32.1, title: 'It Was Staged', trans: 'bleed',
    draw(ctx, u, S) {
      const { k, P, W } = S, fk = S.at('fake'), ac = S.at('actor'), dk = S.at("didn't");
      study(ctx, S, { desk: false });
      // the wall slides away: the "victim" is an actor, unplugged, reading his lines
      const slide = tween(u, ac - 0.6, ac, ease.inOut);
      k.figure(ctx, 760, 820, { hair: 'slick', s: 0.95, sit: true, face: -1, look: [-0.2, 0.8], mood: 'smile', armL: [1.2, 0.9], holdL: c => k.rect(c, -40, -70, 80, 100, P.paperLight, P.ink, 3) });
      k.line(ctx, 690, 640, 600, 760, P.red, 4); k.circle(ctx, 600, 762, 8, P.red);
      k.rect(ctx, 560 + slide * 520, 200, 60, 620, P.inkSoft);
      k.figure(ctx, 300, 820, { ...TEACHER, s: 0.95, sit: true, face: 1, look: [0.8, 0], mood: 'worry' });
      k.rect(ctx, 340, 640, 200, 110, '#3b3a3f', P.ink, 4, 6);
      k.stamp(ctx, 'FAKE SHOCKS', 450, 180, 54, tween(u, fk, fk + 0.2), -0.1);
      k.stamp(ctx, 'ACTOR', 780, 430, 56, tween(u, ac + 0.1, ac + 0.3), 0.12);
      k.scrawl(ctx, "they didn't know", 300, 520, 54, tween(u, dk, dk + 0.5), { rot: -0.05 });
    },
  },
  { // 36.84 "Here's the trick. Authority plus tiny steps."
    start: 36.65, title: 'Authority + Tiny Steps', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, au = S.at('Authority'), ts = S.at('tiny');
      plate(ctx, S, { alpha: 0.08, seed: 37 });
      k.stamp(ctx, 'THE TRICK', 220, 110, 42, tween(u, 0.05, 0.25), -0.1);
      const a = pop(u, au - 0.1, 0.35);
      if (a) { ctx.save(); ctx.translate(230, 560); ctx.scale(a, a); k.figure(ctx, 0, 300, { ...EXPERIMENTER, s: 0.9, mood: 'calm', armL: [1.2, 0.8], holdL: c => k.rect(c, -30, -60, 60, 80, P.paperLight, P.ink, 3) }); ctx.restore(); k.text(ctx, 'AUTHORITY', 230, 920, 40, { font: 'display' }); }
      const pl = pop(u, au + 0.5, 0.3); if (pl) k.text(ctx, '+', 470, 600, 120 * pl, { font: 'display', color: P.red });
      const st = tween(u, ts - 0.2, ts + 0.6);
      for (let i = 0; i < 8; i++) { if (st * 8 < i) break; k.rect(ctx, 580 + i * 40, 420 + i * 40, 60, 400 - i * 40, i > 5 ? P.red : P.inkSoft, P.ink, 2); }
      if (st > 0.2) k.text(ctx, 'TINY STEPS', 730, 920, 40, { font: 'display', color: P.red });
    },
  },
  { // 41.36 "Each shock was just a little worse than the last."
    start: 41.2, title: 'A Little Worse Each Time', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      plate(ctx, S, { blot: false, bg: '#24222a' });
      // a staircase of 30 small steps down into the dark; a little figure walks down
      const n = 30, stepW = 28, stepH = 26, x0 = 60, y0 = 200;
      for (let i = 0; i < n; i++) { const x = x0 + i * stepW, y = y0 + i * stepH; k.rect(ctx, x, y, stepW + 1, 1000 - y, i > 25 ? P.red : lerp(0, 1, i / n) > 0.6 ? '#5a3a40' : '#4a4752', null, 0); k.line(ctx, x, y, x + stepW, y, P.paperDark, 2); if (i % 5 === 4) k.text(ctx, (i + 1) * 15 + 'V', x + stepW / 2, y - 22, 20, { color: P.paperLight }); }
      const prog = clamp(u / 3.6) * (n - 1), i = Math.floor(prog);
      k.figure(ctx, x0 + prog * stepW + stepW / 2, y0 + i * stepH, { ...TEACHER, s: 0.42, face: 1, walk: u * 2, mood: 'worry', shadow: false });
      k.scrawl(ctx, 'just a little worse…', 600, 200, 58, tween(u, 0.4, 1.2), { color: P.redLight });
      k.scrawl(ctx, '…each time', 650, 290, 58, tween(u, 1.6, 2.4), { color: P.redLight });
    },
  },
  { // 45.5 "The antidote? When others refused, far fewer obeyed."
    start: 45.1, title: 'The Antidote', trans: 'blink',
    draw(ctx, u, S) {
      const { k, P, W } = S, an = S.at('antidote'), rf = S.at('refused'), ob = S.at('obeyed');
      plate(ctx, S, { alpha: 0.08, seed: 45 });
      k.scrawl(ctx, 'the antidote', W / 2, 110, 66, tween(u, an - 0.2, an + 0.4));
      // two peers stand up and refuse; the third looks at them
      for (const [x, i] of [[180, 0], [400, 1]]) {
        const up = tween(u, rf - 0.3 + i * 0.25, rf + i * 0.25, ease.outBack);
        k.figure(ctx, x, 760, { s: 0.85, sit: up < 0.5, face: 1, mood: 'calm', hair: i ? 'bob' : 'slick', skirt: !!i, armL: [up > 0.5 ? 0.9 : 0.3, up > 0.5 ? 2.0 : 0.3], armR: [up > 0.5 ? 0.9 : 0.3, up > 0.5 ? 2.0 : 0.3] });
        const b = pop(u, rf + 0.2 + i * 0.25, 0.25); if (b) { ctx.save(); ctx.translate(x, 330); ctx.scale(b, b); k.rect(ctx, -70, -44, 140, 88, P.paperLight, P.red, 5, 30); k.text(ctx, 'NO.', 0, 2, 46, { font: 'display', color: P.red }); ctx.restore(); }
      }
      k.figure(ctx, 620, 760, { ...TEACHER, s: 0.85, sit: true, face: -1, look: [-1, -0.3], mood: 'worry' });
      // went to 450 V: alone 65% vs with two refusing peers 10%
      const kb = tween(u, ob - 0.2, ob + 0.8);
      k.bars(ctx, 120, 960, 700, 300, [0.65, 0.1], ['ALONE: 65%', 'PEERS SAID NO: 10%'], kb, [P.inkSoft, P.red]);
    },
  },
  { // 50.5 "So be the first to say no."
    start: 50.35, title: 'Be the First to Say No', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, fi = S.at('first'), no = S.at('no.');
      plate(ctx, S, { alpha: 0.12, seed: 50 });
      S.cam(1.0, W / 2, 560 + shake(u, no + 0.05, 10, 0.4));
      const snap = tween(u, no, no + 0.3);
      k.figure(ctx, W / 2, 1010, { s: 1.25, face: 1, look: [0, -0.3], mood: u > no ? 'smile' : 'calm', armR: [lerp(0.3, 2.8, tween(u, fi, fi + 0.4, ease.outBack)), 0.1] });
      strings(ctx, k, P, W / 2, 200, [[W / 2 - 70, 620], [W / 2, 560], [W / 2 + 70, 620]], 1 - snap * 0.6, snap);
      k.stamp(ctx, 'NO', 760, 380, 130, tween(u, no, no + 0.2), 0.12);
      k.scrawl(ctx, 'be the first', 260, 330, 60, tween(u, fi, fi + 0.5), { rot: -0.06 });
    },
  },
  { // 53.58 "Follow for more mind tricks." → the case-file cover
    start: 53.4, title: 'More Mind Tricks', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      ctx.save(); plate(ctx, S, { alpha: 0.12, seed: 50 }); k.figure(ctx, W / 2, 1010, { s: 1.25, face: 1, mood: 'smile', armR: [2.8, 0.1] }); ctx.restore();
      inkReveal(ctx, S, tween(u, 0.1, 0.8, ease.linear), c => caseCover(c, S, u - 0.1, { handle: meta.brand.handle, caseNo: '1961', tagline: meta.brand.tagline }));
    },
  },
];

export const sfx = [
  { t: 0.2, type: 'heartbeat', gain: 0.45 },
  { t: 1.5, type: 'riser', gain: 0.3 },
  { t: 3.3, type: 'slide', gain: 0.4 },
  { t: 4.0, type: 'stamp', gain: 0.4 },
  { t: 4.95, type: 'splat', gain: 0.65 },
  { t: 5.4, type: 'stamp', gain: 0.7 },
  { t: 7.6, type: 'pen', gain: 0.45 },
  { t: 9.2, type: 'pen', gain: 0.4 },
  { t: 10.4, type: 'pen', gain: 0.4 },
  { t: 12.95, type: 'fold', gain: 0.45 },
  { t: 13.15, type: 'click', gain: 0.7 },
  { t: 13.25, type: 'buzz', gain: 0.3 },
  { t: 14.65, type: 'click', gain: 0.7 },
  { t: 14.75, type: 'buzz', gain: 0.35 },
  { t: 15.3, type: 'click', gain: 0.5 }, { t: 15.5, type: 'click', gain: 0.5 }, { t: 15.7, type: 'click', gain: 0.5 }, { t: 15.9, type: 'click', gain: 0.5 }, { t: 16.1, type: 'click', gain: 0.5 }, { t: 16.3, type: 'click', gain: 0.5 },
  { t: 16.5, type: 'alarm', gain: 0.5 },
  { t: 16.6, type: 'stamp', gain: 0.7 },
  { t: 17.9, type: 'whoosh', gain: 0.3 },
  { t: 18.8, type: 'thud', gain: 1.0 }, { t: 19.15, type: 'thud', gain: 0.95 }, { t: 19.5, type: 'thud', gain: 0.9 },
  { t: 21.0, type: 'tick', gain: 0.35 },
  { t: 22.05, type: 'fold', gain: 0.45 },
  { t: 24.2, type: 'typewriter', gain: 0.35 },
  { t: 25.2, type: 'pen', gain: 0.4 },
  { t: 25.8, type: 'fold', gain: 0.45 },
  { t: 27.1, type: 'pop', gain: 0.5 },
  { t: 29.6, type: 'whoosh', gain: 0.4 },
  { t: 29.9, type: 'riser', gain: 0.4 },
  { t: 30.9, type: 'gong', gain: 0.5 },
  { t: 32.1, type: 'splat', gain: 0.6 },
  { t: 32.9, type: 'stamp', gain: 0.8 },
  { t: 33.7, type: 'slide', gain: 0.45 },
  { t: 34.4, type: 'stamp', gain: 0.8 },
  { t: 35.5, type: 'pen', gain: 0.45 },
  { t: 36.65, type: 'fold', gain: 0.45 },
  { t: 36.8, type: 'stamp', gain: 0.4 },
  { t: 38.2, type: 'pop', gain: 0.5 },
  { t: 38.7, type: 'pop', gain: 0.45, pitch: 1.2 },
  { t: 39.7, type: 'click', gain: 0.5 }, { t: 39.9, type: 'click', gain: 0.5 }, { t: 40.1, type: 'click', gain: 0.5 },
  { t: 41.2, type: 'whoosh', gain: 0.35 },
  { t: 41.8, type: 'pen', gain: 0.45 },
  { t: 43.0, type: 'pen', gain: 0.45 },
  { t: 45.1, type: 'blink', gain: 0.5 },
  { t: 45.6, type: 'pen', gain: 0.45 },
  { t: 47.3, type: 'stamp', gain: 0.6 },
  { t: 47.6, type: 'stamp', gain: 0.6 },
  { t: 49.2, type: 'chime', gain: 0.45, pitch: 1.2 },
  { t: 50.35, type: 'whoosh', gain: 0.4 },
  { t: 51.2, type: 'pen', gain: 0.45 },
  { t: 52.35, type: 'snap', gain: 0.9 },
  { t: 52.4, type: 'stamp', gain: 0.9 },
  { t: 53.5, type: 'splat', gain: 0.8 },
  { t: 53.9, type: 'fold', gain: 0.4 },
  { t: 54.7, type: 'stamp', gain: 0.8 },
  { t: 55.6, type: 'moth', gain: 0.35 },
  { t: 57.2, type: 'bell', gain: 0.3 },
];

export const music = {
  kit: 'mind', bpm: 88, root: 'D', scale: 'harmonic', gain: 0.3,
  sections: [
    { from: 0, to: 4.95, mood: 'tense' },
    { from: 4.95, to: 12.95, mood: 'intro' },
    { from: 12.95, to: 25.8, mood: 'tense' },
    { from: 25.8, to: 32.1, mood: 'drive' },
    { from: 32.1, to: 45.1, mood: 'sad' },
    { from: 45.1, to: 53.4, mood: 'triumph' },
    { from: 53.4, to: 58.0, mood: 'end' },
  ],
};
