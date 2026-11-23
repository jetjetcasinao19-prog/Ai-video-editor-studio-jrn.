// "Door in the Face" — an INKBLOT case file (psychology, MindTrace).
// Cialdini et al. (1975), "Reciprocal concessions procedure for inducing
// compliance: the door-in-the-face technique": zoo trip alone 16.7% (≈17%);
// after refusing 2 hrs/week for 2 years, 50% said yes to the zoo trip.
// u = seconds since the scene started; S.at('word') = when that word is said.
import { clamp, lerp, ease, tween, rng, TAU, shake, pop } from '../../lib/core.mjs';
import { plate, caseCover, inkReveal } from '../../styles/inkblot/scenes.mjs';

export const meta = {
  title: 'Door in the Face',
  slug: 'door-in-the-face-inkblot',
  style: 'inkblot',
  width: 1080, height: 1920, fps: 30,
  duration: 49.6,
  voice: 'voice.mp3',
  seed: 129,
  captionChars: 24,
  caseLine: 'THE MIND FILES  ·  CASE No. 1975  ·  CONFIDENTIAL',
  brandKit: 'mindtrace', // MindTrace (brand/mindtrace/): logo, handle, tagline, outro text
  outro: { at: 47.1 },
};

const ASKER = { hat: 'bowler', tie: '#c61f2a' };
const RESEARCHER = { glasses: true, hair: 'slick', tie: '#c61f2a' };
const STUDENT = { hair: 'bob', skirt: true };

function card(ctx, k, P, x, y, w, h, lines, col = P.ink, rot = 0, sc = 1) {
  if (sc <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc);
  k.rect(ctx, -w / 2, -h / 2, w, h, P.paperLight, col, 5, 10);
  lines.forEach((l, i) => k.text(ctx, l, 0, -h / 2 + (i + 0.5) * h / lines.length + 4, Math.min(56, h / lines.length * 0.55), { font: 'display', color: col, max: w - 40 }));
  ctx.restore();
}
function grid(ctx, S, u, from, to, at, label, note) {
  const { k, P, W } = S;
  plate(ctx, S, { alpha: 0.06, seed: 60 + to });
  k.text(ctx, label, W / 2, 110, 40, { color: P.inkSoft });
  const v = lerp(from, to, tween(u, at - 0.1, at + 0.8, ease.outCubic));
  k.percentGrid(ctx, 170, 180, 600, v);
  k.text(ctx, Math.round(v) + '%', W / 2, 900, 120, { font: 'display', color: P.red });
  k.text(ctx, 'said yes to the zoo trip', W / 2, 990, 42, {});
  if (note) k.scrawl(ctx, note, 790, 860, 50, tween(u, at + 0.6, at + 1.1), { rot: -0.08 });
}
function zooSign(ctx, k, P, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  k.rect(ctx, -180, -40, 30, 240, '#6b4a2b'); k.rect(ctx, 150, -40, 30, 240, '#6b4a2b');
  ctx.beginPath(); ctx.arc(0, -40, 180, Math.PI, 0); k.stroke(ctx, '#6b4a2b', 26);
  k.rect(ctx, -130, -170, 260, 80, P.ochre, P.ink, 5, 10); k.text(ctx, 'ZOO', 0, -128, 60, { font: 'display' });
  // a giraffe peeking over
  k.rect(ctx, 210, -200, 26, 230, P.ochre, P.ink, 3); k.ellipse(ctx, 232, -210, 44, 22, 0, P.ochre, P.ink, 3); k.circle(ctx, 246, -216, 5, P.ink);
  for (let i = 0; i < 5; i++) k.circle(ctx, 214 + (i % 2) * 12, -170 + i * 40, 6, '#8a5a32');
  ctx.restore();
}

export const scenes = [
  { // 0.14 "Manipulators don't start with what they want. They start with something crazy."
    start: 0, title: 'Start With Something Crazy',
    draw(ctx, u, S) {
      const { k, P, W } = S, wn = S.at('want'), cr = S.at('crazy');
      plate(ctx, S, { alpha: 0.1, seed: 3 });
      S.cam(lerp(1.06, 1.0, tween(u, 0, 5)), W / 2, 560);
      // what they really want: a small card hidden behind their back
      k.figure(ctx, 420, 1010, { ...ASKER, s: 1.2, face: 1, look: [1, 0], mood: 'smile', armL: [-0.4, 0.3], armR: [1.4, 0.6] });
      card(ctx, k, P, 300, 760, 120, 80, ['small'], P.red, -0.2, tween(u, wn - 0.4, wn) * (1 - tween(u, cr - 0.3, cr)) + tween(u, cr, cr + 0.3) * 0.9);
      k.scrawl(ctx, 'what they want', 220, 650, 44, tween(u, wn - 0.2, wn + 0.3), { rot: -0.05 });
      // …and the crazy one they open with
      const big = tween(u, cr - 0.2, cr + 0.3, ease.outBack);
      card(ctx, k, P, 690, 360, 400, 300, ['A HUGE', 'CRAZY', 'ASK!'], P.ink, 0.05, big);
    },
  },
  { // 6.06 "In 1975, psychologist Robert Cialdini asked students to take teens from a detention center to the zoo."
    start: 5.9, title: '1975: A Trip to the Zoo', trans: 'bleed',
    draw(ctx, u, S) {
      const { k, P, W } = S, yr = S.at('1975'), rc = S.at('Robert'), zo = S.at('zoo');
      plate(ctx, S, { alpha: 0.08, seed: 6 });
      k.figure(ctx, 190, 1010, { ...RESEARCHER, s: 1.0, face: 1, look: [1, 0], mood: 'smile', armL: [1.2, 0.8], holdL: c => k.rect(c, -30, -60, 60, 80, P.paperLight, P.ink, 3) });
      k.figure(ctx, 420, 1010, { ...STUDENT, s: 0.95, face: -1, look: [-0.8, 0], mood: u > zo ? 'worry' : 'calm' });
      zooSign(ctx, k, P, 690, 760, tween(u, zo - 0.5, zo + 0.2, ease.outBack));
      k.stamp(ctx, '1975', 800, 130, 64, tween(u, yr, yr + 0.25), 0.1);
      k.scrawl(ctx, 'Robert Cialdini', 260, 560, 54, tween(u, rc, rc + 0.5), { rot: -0.05 });
      k.scrawl(ctx, 'about 2 hours, once', 690, 980, 44, tween(u, zo + 0.3, zo + 0.9));
    },
  },
  { // 13.86 "Only 17% said yes."
    start: 13.62, title: 'Only 17% Said Yes', trans: 'fold',
    draw(ctx, u, S) { grid(ctx, S, u, 0, 17, S.at('17%'), 'JUST THE ZOO TRIP'); },
  },
  { // 17.04 'So he asked others something huge first. "Volunteer two hours a week for two years."'
    start: 16.82, title: 'Something Huge First', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, hg = S.at('huge'), vo = S.at('"Volunteer'), yr = S.at('years');
      plate(ctx, S, { alpha: 0.08, seed: 17 });
      // a tower of weekly calendar pages: 104 weeks
      const n = Math.floor(104 * tween(u, vo, yr + 0.4, ease.inQuad));
      for (let i = 0; i < Math.min(n, 52); i++) k.rect(ctx, 640 + (i % 2) * 6, 1000 - i * 15, 220, 12, P.paperLight, P.ink, 2);
      for (let i = 52; i < n; i++) k.rect(ctx, 400 + (i % 2) * 6, 1000 - (i - 52) * 15, 220, 12, P.paperLight, P.ink, 2);
      k.text(ctx, n + ' weeks', 640, 160, 60, { font: 'display', color: P.red });
      k.figure(ctx, 170, 1010, { ...RESEARCHER, s: 1.0, face: 1, look: [1, -0.3], mood: 'smile', armR: [2.2, 0.4] });
      card(ctx, k, P, 330, 330, 440, 200, ['VOLUNTEER', '2 HRS/WEEK', 'FOR 2 YEARS'], P.ink, -0.04, tween(u, vo - 0.3, vo + 0.1, ease.outBack));
      k.scrawl(ctx, 'huge', 160, 520, 66, tween(u, hg, hg + 0.4));
    },
  },
  { // 23.64 "Everyone said no."
    start: 23.62, title: 'Everyone Said No', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, no = S.at('no.');
      plate(ctx, S, { alpha: 0.08, seed: 23 });
      S.cam(1.0, W / 2, 560 + shake(u, no + 0.05, 12, 0.45));
      const slam = tween(u, no - 0.25, no, ease.inCubic);
      k.door(ctx, W / 2 + 60, 1010, 1.4, lerp(0.8, 0, slam), { color: P.redDark });
      k.figure(ctx, 170, 1010, { ...RESEARCHER, s: 1.0, face: 1, look: [1, 0], mood: u > no ? 'shock' : 'smile' });
      k.stamp(ctx, 'NO', 720, 300, 130, tween(u, no, no + 0.2), 0.12);
      k.scrawl(ctx, 'door. in. the. face.', W / 2, 140, 60, tween(u, no + 0.4, no + 1.0));
    },
  },
  { // 25.44 'Then, "Okay, could you just do the zoo trip?"'
    start: 25.42, title: '"Okay… Just the Zoo?"', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, ok = S.at('"Okay'), jt = S.at('just'), zt = S.at('trip');
      plate(ctx, S, { alpha: 0.08, seed: 25 });
      const open = tween(u, ok - 0.3, ok + 0.3);
      k.door(ctx, W / 2 + 60, 1010, 1.4, lerp(0, 0.45, open), { color: P.redDark });
      k.figure(ctx, 170, 1010, { ...RESEARCHER, s: 1.0, face: 1, look: [1, -0.2], mood: 'smile', armR: [2.0, 0.4] });
      // the huge card shrinks into the small one
      const sh = tween(u, jt - 0.4, zt, ease.inOut);
      card(ctx, k, P, lerp(330, 300, sh), lerp(330, 420, sh), lerp(440, 260, sh), lerp(200, 120, sh), sh < 0.5 ? ['VOLUNTEER', '2 HRS/WEEK', 'FOR 2 YEARS'] : ['JUST THE', 'ZOO TRIP?'], sh < 0.5 ? P.ink : P.red, -0.04, 1);
      k.scrawl(ctx, 'backing down…', 320, 600, 54, tween(u, jt, jt + 0.6));
    },
  },
  { // 30.44 "Now 50% said yes."
    start: 30.12, title: 'Now 50% Said Yes', trans: 'fold',
    draw(ctx, u, S) { grid(ctx, S, u, 17, 50, S.at('50%'), 'AFTER THE HUGE "NO"', 'was 17%'); },
  },
  { // 33.16 "Here's the trick. When they back down, you feel you should meet them halfway."
    start: 32.92, title: 'Meet Them Halfway', trans: 'bleed',
    draw(ctx, u, S) {
      const { k, P, W } = S, bd = S.at('back'), hw = S.at('halfway');
      plate(ctx, S, { alpha: 0.08, seed: 33 });
      k.stamp(ctx, 'THE TRICK', 220, 110, 42, tween(u, 0.05, 0.25), -0.1);
      // a bridge; they step back, you feel pulled forward
      k.rect(ctx, 40, 860, W - 80, 30, '#8a6a44', P.ink, 4);
      for (let x = 60; x < W - 60; x += 60) k.line(ctx, x, 860, x, 890, P.ink, 2);
      const back = tween(u, bd - 0.2, bd + 0.5), fwd = tween(u, hw - 0.6, hw + 0.2);
      k.figure(ctx, lerp(560, 720, back), 860, { ...ASKER, s: 0.9, face: -1, look: [-1, 0], mood: 'smile', walk: back > 0 && back < 1 ? u * 1.5 : 0 });
      k.figure(ctx, lerp(150, 380, fwd), 860, { s: 0.9, face: 1, look: [1, 0], mood: 'worry', walk: fwd > 0 && fwd < 1 ? u * 1.5 : 0 });
      k.arrow(ctx, 600, 400, 760, 400, tween(u, bd, bd + 0.4), P.inkSoft, 6, 0);
      k.arrow(ctx, 180, 400, 380, 400, tween(u, hw - 0.4, hw), P.red, 6, 0);
      k.line(ctx, W / 2, 300, W / 2, 860, P.red, 3);
      k.scrawl(ctx, 'halfway', W / 2, 260, 56, tween(u, hw, hw + 0.4));
      k.scrawl(ctx, 'they gave up something…', 300, 520, 44, tween(u, bd + 0.2, bd + 0.8), { rot: -0.03 });
      k.scrawl(ctx, '…so you feel you owe them', 650, 600, 44, tween(u, hw - 0.2, hw + 0.4), { rot: 0.03 });
    },
  },
  { // 37.88 'So when a big ask suddenly shrinks, ask yourself, "would I say yes to this one alone?"'
    start: 37.88, title: 'Would I Say Yes Alone?', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, sk = S.at('shrinks'), wd = S.at('"would'), al = S.at('alone');
      plate(ctx, S, { alpha: 0.1, seed: 38 });
      const sh = tween(u, sk - 0.5, sk + 0.2, ease.inOut);
      // put the small ask on its own, under the light
      const solo = tween(u, wd, wd + 0.6);
      if (solo <= 0) card(ctx, k, P, 300, 330, lerp(420, 200, sh), lerp(220, 110, sh), sh < 0.5 ? ['BIG ASK'] : ['small ask'], sh < 0.5 ? P.ink : P.red, -0.04, 1);
      if (solo > 0) { k.spotlight(ctx, 760, 120, 720, 620, 140, solo, { lamp: true }); card(ctx, k, P, lerp(300, 720, solo), lerp(330, 560, solo), 200, 110, ['small ask'], P.red, 0, 1); }
      k.profile(ctx, 170, 1040, 1.0, { blink: 1 });
      const q = pop(u, wd - 0.1, 0.35);
      if (q) { ctx.save(); ctx.translate(650, 860); ctx.scale(q, q); k.rect(ctx, -260, -70, 520, 140, P.paperLight, P.ink, 5, 30); k.text(ctx, 'Would I say yes', 0, -20, 44, { font: 'serif' }); k.text(ctx, 'to this one alone?', 0, 32, 44, { font: 'serif', color: u > al ? P.red : P.ink }); ctx.restore(); }
    },
  },
  { // 45.68 "Follow for more mind tricks." → the case-file cover
    start: 45.42, title: 'More Mind Tricks', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      ctx.save(); plate(ctx, S, { alpha: 0.1, seed: 38 }); k.door(ctx, W / 2 + 60, 1010, 1.4, 0, { color: P.redDark }); ctx.restore();
      inkReveal(ctx, S, tween(u, 0.1, 0.8, ease.linear), c => caseCover(c, S, u - 0.1, { handle: meta.brand.handle, caseNo: '1975', tagline: meta.brand.tagline }));
    },
  },
];

export const sfx = [
  { t: 0.3, type: 'tick', gain: 0.4 },
  { t: 1.8, type: 'slide', gain: 0.4 },
  { t: 4.2, type: 'whoosh', gain: 0.5 },
  { t: 4.4, type: 'thud', gain: 0.6 },
  { t: 5.9, type: 'splat', gain: 0.6 },
  { t: 6.2, type: 'stamp', gain: 0.7 },
  { t: 8.1, type: 'pen', gain: 0.45 },
  { t: 12.3, type: 'pop', gain: 0.5 },
  { t: 12.8, type: 'pen', gain: 0.4 },
  { t: 13.62, type: 'fold', gain: 0.45 },
  { t: 14.6, type: 'flop', gain: 0.45 },
  { t: 16.82, type: 'whoosh', gain: 0.4 },
  { t: 18.4, type: 'pen', gain: 0.5 },
  { t: 20.2, type: 'pop', gain: 0.5 },
  { t: 20.6, type: 'paper', gain: 0.4 }, { t: 21.4, type: 'paper', gain: 0.45 }, { t: 22.2, type: 'paper', gain: 0.5 },
  { t: 23.62, type: 'whoosh', gain: 0.3 },
  { t: 24.1, type: 'thud', gain: 1.0 },
  { t: 24.35, type: 'stamp', gain: 0.9 },
  { t: 25.42, type: 'slide', gain: 0.35 },
  { t: 26.2, type: 'fold', gain: 0.35 },
  { t: 28.4, type: 'pop', gain: 0.45 },
  { t: 30.12, type: 'fold', gain: 0.45 },
  { t: 30.5, type: 'riser', gain: 0.35 },
  { t: 31.3, type: 'chime', gain: 0.45, pitch: 1.2 },
  { t: 32.92, type: 'splat', gain: 0.6 },
  { t: 33.0, type: 'stamp', gain: 0.4 },
  { t: 34.5, type: 'slide', gain: 0.4 },
  { t: 36.2, type: 'slide', gain: 0.4 },
  { t: 36.9, type: 'pen', gain: 0.45 },
  { t: 37.88, type: 'fold', gain: 0.45 },
  { t: 39.5, type: 'whoosh', gain: 0.35 },
  { t: 41.2, type: 'clank', gain: 0.55 },
  { t: 42.3, type: 'pop', gain: 0.5 },
  { t: 43.8, type: 'chime', gain: 0.4 },
  { t: 45.5, type: 'splat', gain: 0.8 },
  { t: 45.9, type: 'fold', gain: 0.4 },
  { t: 46.7, type: 'stamp', gain: 0.8 },
  { t: 47.5, type: 'moth', gain: 0.35 },
  { t: 48.8, type: 'bell', gain: 0.3 },
];

export const music = {
  kit: 'mind', bpm: 98, root: 'B', scale: 'minor', gain: 0.3,
  sections: [
    { from: 0, to: 5.9, mood: 'tense' },
    { from: 5.9, to: 16.82, mood: 'groove' },
    { from: 16.82, to: 25.42, mood: 'drive' },
    { from: 25.42, to: 32.92, mood: 'triumph' },
    { from: 32.92, to: 45.42, mood: 'tense' },
    { from: 45.42, to: 49.6, mood: 'end' },
  ],
};
