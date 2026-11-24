// "The Bystander Effect" — an INKBLOT case file (psychology, MindTrace).
// Latané & Darley (1968), Columbia: smoke through a vent — alone 75% reported it;
// with two passive confederates only 10%.
// u = seconds since the scene started; S.at('word') = when that word is said.
import { clamp, lerp, ease, tween, rng, TAU, shake, pop } from '../../lib/core.mjs';
import { plate, study, caseCover, inkReveal } from '../../styles/inkblot/scenes.mjs';

export const meta = {
  title: 'The Bystander Effect',
  slug: 'bystander-effect-inkblot',
  style: 'inkblot',
  width: 1080, height: 1920, fps: 30,
  duration: 45.1,
  voice: 'voice.mp3',
  seed: 118,
  captionChars: 24,
  caseLine: 'THE MIND FILES  ·  CASE No. 1968  ·  CONFIDENTIAL',
  brandKit: 'mindtrace', // MindTrace (brand/mindtrace/): logo, handle, tagline, outro text
  outro: { at: 42.5 },
};

const CROWD = [{ hat: 'cap' }, { hair: 'bob', skirt: true }, { hair: 'slick', glasses: true }, { hat: 'bowler' }, { hair: 'bun', skirt: true }, { hair: 'slick' }];

// grey smoke: drifting blots (k = how thick)
function smoke(ctx, S, x, y, w, h, k = 1) {
  if (k <= 0) return;
  for (let i = 0; i < 5; i++) {
    const dx = Math.sin(S.t * 0.5 + i * 1.3) * w * 0.1, dy = -((S.t * 18 + i * 60) % 120);
    S.k.blot(ctx, x + dx + (i - 2) * w * 0.14, y + dy + (i % 2) * h * 0.1, w * 0.7 * (0.6 + 0.4 * k), h * 0.6 * (0.6 + 0.4 * k), { seed: 500 + i, color: '#7d7f87', alpha: 0.45 * k, live: 1, t: S.t + i, res: 0.25, splatter: 0, rough: 1.5 });
  }
}
// a red shirt drawn over a standing figure at (x, y), scale s
function redShirt(ctx, k, P, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  k.poly(ctx, [[-46, -306], [46, -306], [76, -278], [62, -246], [46, -256], [48, -150], [-48, -150], [-46, -256], [-62, -246], [-76, -278]], P.red, P.ink, 3);
  ctx.restore();
}
function crowd(ctx, S, u, o = {}) {
  const { k, P } = S;
  CROWD.forEach((c, i) => {
    const x = 110 + i * 145, y = 1010 + (i % 2) * 20, s = 0.95;
    const look = o.look ? o.look(i) : [Math.sin(S.t * 1.5 + i * 2) * 0.9, 0];
    k.figure(ctx, x, y, { ...c, s, face: i % 2 ? -1 : 1, look, mood: o.mood ? o.mood(i) : 'calm', shadow: false, armR: o.armR ? o.armR(i) : undefined, holdR: o.holdR ? o.holdR(i) : undefined });
    if (o.red === i) redShirt(ctx, k, P, x, y, s);
  });
}
function lab(ctx, S, u, smokeK, people) {
  const { k, P, W } = S;
  study(ctx, S, { desk: false });
  // the wall vent
  k.rect(ctx, 390, 120, 140, 90, '#cfc8b6', P.ink, 4, 4);
  for (let i = 0; i < 5; i++) k.line(ctx, 400, 134 + i * 15, 520, 134 + i * 15, P.ink, 3);
  people(ctx);
  smoke(ctx, S, 470, 300 + 160 * smokeK, 600 + 400 * smokeK, 400 + 400 * smokeK, smokeK);
}
const seated = (ctx, k, P, x, o = {}) => {
  k.figure(ctx, x, 820, { s: 0.85, sit: true, face: 1, look: o.look || [0.5, 0.8], mood: o.mood || 'calm', armR: o.armR || [1.3, 0.8], armL: o.armL, hair: o.hair || 'slick', hat: o.hat, tie: o.tie, skirt: o.skirt, blink: o.blink ?? 1 });
  k.rect(ctx, x + 10, 640, 170, 20, '#6b4a2b'); k.rect(ctx, x + 85, 660, 16, 160, '#6b4a2b');
  k.rect(ctx, x + 30, 628, 70, 12, P.paperLight, P.ink, 1);
};

export const scenes = [
  { // 0.0 'If you ever need help in a crowd, don't yell, "Somebody help!"'
    start: 0, title: 'Need Help in a Crowd?',
    draw(ctx, u, S) {
      const { k, P, W } = S, sb = S.at('"Somebody'), dy = S.at("don't");
      plate(ctx, S, { alpha: 0.1, seed: 2 });
      S.cam(lerp(1.06, 1.0, tween(u, 0, 4.4)), W / 2, 560);
      crowd(ctx, S, u, { look: i => [Math.sin(S.t * 2 + i * 2.3), 0], mood: () => 'calm' });
      const b = pop(u, sb - 0.2, 0.3);
      if (b) { ctx.save(); ctx.translate(W / 2, 300); ctx.scale(b, b); k.rect(ctx, -260, -70, 520, 140, P.paperLight, P.ink, 5, 30); k.text(ctx, '"Somebody help!"', 0, 4, 58, { font: 'serif' }); ctx.restore(); }
      k.penLine(ctx, [[W / 2 - 250, 250], [W / 2 + 250, 350]], tween(u, sb + 0.5, sb + 0.9), P.red, 12);
      k.scrawl(ctx, "don't.", W / 2, 140, 70, tween(u, dy, dy + 0.4));
    },
  },
  { // 4.98 "In 1968, Columbia psychologists filled a room with smoke. It poured in through a vent."
    start: 4.75, title: 'Columbia, 1968', trans: 'bleed',
    draw(ctx, u, S) {
      const { k, P, W } = S, yr = S.at('1968'), co = S.at('Columbia'), sm = S.at('smoke'), vt = S.at('vent');
      const sk = tween(u, sm - 0.6, vt + 1.0);
      lab(ctx, S, u, sk, c => seated(c, k, P, 300, { look: [0.4, 0.8] }));
      k.stamp(ctx, '1968', 460, 300, 58, tween(u, yr, yr + 0.25), -0.08);
      k.scrawl(ctx, 'Columbia psychologists', W / 2 + 60, 520, 50, tween(u, co, co + 0.6), { rot: -0.05 });
      k.penCircle(ctx, 460, 165, 110, 70, tween(u, vt - 0.1, vt + 0.4), P.red, 6);
    },
  },
  { // 13.04 "When people were alone, 75% went to report it."
    start: 11.6, title: 'Alone: 75% Reported It', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, n = S.at('75%');
      plate(ctx, S, { alpha: 0.06, seed: 75 });
      k.text(ctx, 'ALONE IN THE SMOKE', W / 2, 110, 40, { color: P.inkSoft });
      const v = 75 * tween(u, n - 0.1, n + 0.8, ease.outCubic);
      k.percentGrid(ctx, 170, 180, 600, v);
      k.text(ctx, Math.round(v) + '%', W / 2, 900, 120, { font: 'display', color: P.red });
      k.text(ctx, 'went to report it', W / 2, 990, 44, {});
    },
  },
  { // 15.86 "But with two strangers who just kept working, only 10% did."
    start: 15.7, title: 'With Two Calm Strangers', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, st = S.at('strangers'), kw = S.at('kept'), n = S.at('10%');
      lab(ctx, S, u, 0.8, c => {
        seated(c, k, P, 70, { hair: 'bob', skirt: true, look: [0.2, 1] });
        seated(c, k, P, 330, { look: [lerp(0.6, -0.8, Math.abs(Math.sin(u * 1.5))), 0], mood: 'worry' });
        seated(c, k, P, 590, { hat: 'cap', look: [0.2, 1] });
      });
      k.scrawl(ctx, 'calm strangers', 445, 260, 46, tween(u, st, st + 0.5));
      k.scrawl(ctx, '(actors)', 445, 320, 46, tween(u, kw, kw + 0.5));
      const p = pop(u, n - 0.1, 0.4);
      if (p) { ctx.save(); ctx.translate(W / 2, 930); ctx.scale(p, p); k.rect(ctx, -330, -70, 660, 140, P.paperLight, P.red, 6, 10); k.text(ctx, 'ONLY 10% REPORTED', 0, 4, 58, { font: 'display', color: P.red }); ctx.restore(); }
    },
  },
  { // 20.74 "They sat in the smoke, coughing, rubbing their eyes."
    start: 20.6, title: 'Sitting in the Smoke', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, cg = S.at('coughing'), rb = S.at('rubbing');
      const rub = tween(u, rb - 0.2, rb + 0.2);
      lab(ctx, S, u, 1.0, c => {
        seated(c, k, P, 70, { hair: 'bob', skirt: true, look: [0.2, 1] });
        seated(c, k, P, 330, { mood: 'worry', blink: u > rb ? 0.1 : 1, armL: [lerp(0.3, 2.6, rub), lerp(0.3, 0.9, rub)], armR: [lerp(1.3, 2.6, rub), lerp(0.8, 0.9, rub)] });
        seated(c, k, P, 590, { hat: 'cap', look: [0.2, 1] });
      });
      ['cough', 'cough!', 'cough'].forEach((t, i) => { const p = pop(u, cg - 0.1 + i * 0.3, 0.2); if (p) k.scrawl(ctx, t, 470 + i * 70, 380 - i * 50, 40 * p, 1, { color: P.redDark }); });
      k.scrawl(ctx, 'still sitting.', W / 2, 980, 60, tween(u, rb + 0.6, rb + 1.2));
    },
  },
  { // 24.52 "Here's the trick. It's called the bystander effect."
    start: 24.4, title: 'The Bystander Effect', trans: 'bleed',
    draw(ctx, u, S) {
      const { k, P, W } = S, bs = S.at('bystander');
      plate(ctx, S, { alpha: 0.1, seed: 24 });
      k.stamp(ctx, 'THE TRICK', 220, 110, 42, tween(u, 0.05, 0.25), -0.1);
      crowd(ctx, S, u);
      const p = pop(u, bs - 0.15, 0.4);
      if (p) { ctx.save(); ctx.translate(W / 2, 330); ctx.scale(p, p); ctx.rotate(-0.03); k.rect(ctx, -400, -80, 800, 160, P.paperLight, P.ink, 5, 8); k.text(ctx, 'The Bystander', 0, -16, 62, { font: 'italic' }); k.text(ctx, 'EFFECT', 0, 46, 38, { color: P.red }); ctx.restore(); }
    },
  },
  { // 28.5 "In a crowd, everyone waits for someone else."
    start: 28.35, title: 'Everyone Waits', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, wt = S.at('waits'), se = S.at('someone');
      plate(ctx, S, { alpha: 0.08, seed: 28 });
      crowd(ctx, S, u, { look: i => [i % 2 ? -1 : 1, 0], mood: () => 'calm' });
      // each one points the job to the next: a loop of arrows
      for (let i = 0; i < 5; i++) { const x1 = 110 + i * 145, x2 = 110 + (i + 1) * 145; k.arrow(ctx, x1 + 10, 560, x2 - 10, 560, tween(u, wt - 0.2 + i * 0.15, wt + i * 0.15), P.red, 5, -0.4); }
      k.arrow(ctx, 835, 600, 110, 600, tween(u, se, se + 0.6), P.red, 5, 0.25);
      k.scrawl(ctx, '"someone else will…"', W / 2, 230, 60, tween(u, se - 0.2, se + 0.4));
    },
  },
  { // 31.96 "So point at one person."
    start: 31.65, title: 'Point at One Person', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W, H } = S, pt = S.at('point'), on = S.at('one');
      ctx.fillStyle = '#56516a'; ctx.fillRect(-100, -100, W + 200, H + 200);
      k.spotlight(ctx, 120, 0, 545, 1030, 120, tween(u, on - 0.2, on + 0.1));
      crowd(ctx, S, u, { look: i => i === 3 ? [0, -0.5] : [0.3, 0] });
      // a huge pointing hand from the side
      const h = tween(u, pt - 0.2, pt + 0.2, ease.outBack);
      ctx.save(); ctx.translate(lerp(-200, 120, h), 360); ctx.rotate(0.55);
      k.rect(ctx, -260, -40, 260, 80, P.paperLight, P.ink, 4, 30); k.rect(ctx, -10, -36, 190, 34, P.paperLight, P.ink, 4, 17);
      for (let f = 0; f < 3; f++) k.rect(ctx, -20, 4 + f * 18, 60, 22, P.paperLight, P.ink, 3, 11);
      ctx.restore();
    },
  },
  { // 33.74 '"You, in the red shirt. Call 911."'
    start: 33.55, title: 'You, in the Red Shirt', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W, H } = S, yu = S.at('"You'), cl = S.at('Call');
      ctx.fillStyle = '#56516a'; ctx.fillRect(-100, -100, W + 200, H + 200);
      k.spotlight(ctx, 120, 0, 545, 1030, 120, 1);
      crowd(ctx, S, u, { red: 3, look: i => i === 3 ? [-0.4, -0.3] : [0.3, 0], mood: i => i === 3 ? 'shock' : 'calm', armR: i => i === 3 ? [lerp(0.2, 2.2, tween(u, cl, cl + 0.4)), 0.9] : undefined, holdR: i => i === 3 && u > cl ? c => k.phone(c, 0, -30, 0.22, S.t, { msg: '911', screen: P.paperLight }) : undefined });
      const b = pop(u, yu - 0.2, 0.3);
      if (b) { ctx.save(); ctx.translate(W / 2, 260); ctx.scale(b, b); k.rect(ctx, -360, -90, 720, 180, P.paperLight, P.ink, 5, 30); k.text(ctx, '"You, in the red shirt.', 0, -28, 48, { font: 'serif' }); k.text(ctx, 'Call 911."', 0, 34, 56, { font: 'serif', color: u > cl ? P.red : P.ink }); ctx.restore(); }
    },
  },
  { // 37.16 "Now it's not somebody, it's them."
    start: 36.95, title: 'Not Somebody — Them', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, sb = S.at('somebody'), th = S.at('them');
      plate(ctx, S, { alpha: 0.08, seed: 37 });
      crowd(ctx, S, u, { red: 3, look: i => i === 3 ? [0, 0] : [0.5, 0], mood: i => i === 3 ? 'smile' : 'smile', armR: i => i === 3 ? [2.2, 0.9] : undefined, holdR: i => i === 3 ? c => k.phone(c, 0, -30, 0.22, S.t, { msg: '911', screen: P.paperLight }) : undefined });
      ctx.save(); ctx.translate(W / 2, 260);
      k.text(ctx, 'SOMEBODY', 0, 0, 90, { font: 'display', color: P.inkSoft });
      k.penLine(ctx, [[-260, 10], [260, -10]], tween(u, sb + 0.3, sb + 0.6), P.red, 12);
      ctx.restore();
      const p = pop(u, th - 0.1, 0.35);
      if (p) { ctx.save(); ctx.translate(W / 2, 420); ctx.scale(p, p); k.text(ctx, 'THEM', 0, 0, 110, { font: 'display', color: P.red }); ctx.restore(); }
      k.arrow(ctx, W / 2 + 40, 480, 545, 640, tween(u, th + 0.2, th + 0.6), P.red, 7, -0.2);
    },
  },
  { // 40.86 "Follow for more mind tricks." → the case-file cover
    start: 40.6, title: 'More Mind Tricks', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      ctx.save(); plate(ctx, S, { alpha: 0.08, seed: 37 }); crowd(ctx, S, u, { red: 3 }); ctx.restore();
      inkReveal(ctx, S, tween(u, 0.25, 0.95, ease.linear), c => caseCover(c, S, u - 0.25, { handle: meta.brand.handle, caseNo: '1968', tagline: meta.brand.tagline }));
    },
  },
];

export const sfx = [
  { t: 0.3, type: 'wind', gain: 0.3 },
  { t: 3.0, type: 'pop', gain: 0.5 },
  { t: 3.6, type: 'pen', gain: 0.55 },
  { t: 4.75, type: 'splat', gain: 0.6 },
  { t: 5.1, type: 'stamp', gain: 0.7 },
  { t: 6.4, type: 'pen', gain: 0.45 },
  { t: 8.3, type: 'sizzle', gain: 0.4 },
  { t: 9.6, type: 'wind', gain: 0.45 },
  { t: 10.6, type: 'pen', gain: 0.45 },
  { t: 11.6, type: 'fold', gain: 0.45 },
  { t: 13.1, type: 'riser', gain: 0.3 },
  { t: 14.0, type: 'chime', gain: 0.4, pitch: 1.2 },
  { t: 15.7, type: 'whoosh', gain: 0.35 },
  { t: 16.4, type: 'pen', gain: 0.45 },
  { t: 17.8, type: 'pen', gain: 0.4 },
  { t: 18.9, type: 'flop', gain: 0.45 },
  { t: 19.0, type: 'stamp', gain: 0.7 },
  { t: 20.6, type: 'fold', gain: 0.45 },
  { t: 20.9, type: 'wind', gain: 0.4 },
  { t: 22.1, type: 'thud', gain: 0.3 }, { t: 22.4, type: 'thud', gain: 0.3 }, { t: 22.7, type: 'thud', gain: 0.3 },
  { t: 23.6, type: 'pen', gain: 0.45 },
  { t: 24.4, type: 'splat', gain: 0.6 },
  { t: 24.5, type: 'stamp', gain: 0.4 },
  { t: 26.4, type: 'pop', gain: 0.5 },
  { t: 26.6, type: 'gong', gain: 0.35 },
  { t: 28.35, type: 'fold', gain: 0.45 },
  { t: 29.6, type: 'slide', gain: 0.4 },
  { t: 30.4, type: 'pen', gain: 0.45 },
  { t: 31.65, type: 'whoosh', gain: 0.45 },
  { t: 32.3, type: 'clank', gain: 0.6 },
  { t: 33.55, type: 'pop', gain: 0.5 },
  { t: 35.3, type: 'click', gain: 0.5 }, { t: 35.5, type: 'click', gain: 0.5 }, { t: 35.7, type: 'click', gain: 0.5 },
  { t: 36.2, type: 'chime', gain: 0.45, pitch: 1.2 },
  { t: 36.95, type: 'fold', gain: 0.45 },
  { t: 38.3, type: 'pen', gain: 0.55 },
  { t: 39.45, type: 'stamp', gain: 0.8 },
  { t: 40.9, type: 'splat', gain: 0.8 },
  { t: 41.3, type: 'fold', gain: 0.4 },
  { t: 42.1, type: 'stamp', gain: 0.8 },
  { t: 43.0, type: 'moth', gain: 0.35 },
  { t: 44.3, type: 'bell', gain: 0.3 },
];

export const music = {
  kit: 'mind', bpm: 92, root: 'E', scale: 'minor', gain: 0.3,
  sections: [
    { from: 0, to: 4.75, mood: 'intro' },
    { from: 4.75, to: 15.7, mood: 'tense' },
    { from: 15.7, to: 24.4, mood: 'sad' },
    { from: 24.4, to: 31.65, mood: 'tense' },
    { from: 31.65, to: 40.6, mood: 'triumph' },
    { from: 40.6, to: 45.1, mood: 'end' },
  ],
};
