// "Imagine Eating It" — an INKBLOT case file (psychology, MindTrace).
// Morewedge, Huh & Vosgerau (2010), Carnegie Mellon, "Thought for food: Imagined
// consumption reduces actual consumption" (Science): imagining eating 30 candies
// (not 3) led people to eat fewer real ones — habituation by imagination.
// Candies are drawn as generic coloured sweets, never the brand's logo.
// u = seconds since the scene started; S.at('word') = when that word is said.
import { clamp, lerp, ease, tween, rng, TAU, shake, pop } from '../../lib/core.mjs';
import { plate, caseCover, inkReveal } from '../../styles/inkblot/scenes.mjs';

export const meta = {
  title: 'Imagine Eating It',
  slug: 'imagined-eating-inkblot',
  style: 'inkblot',
  width: 1080, height: 1920, fps: 30,
  duration: 33.0,
  voice: 'voice.mp3',
  seed: 241,
  captionChars: 24,
  caseLine: 'THE MIND FILES  ·  CASE No. 2010  ·  CONFIDENTIAL',
  brandKit: 'mindtrace', // MindTrace (brand/mindtrace/): logo, handle, tagline, outro text
  outro: { at: 30.7 },
};

const YOU = { hair: 'bob', tie: '#c61f2a' };
const CANDY = ['#c61f2a', '#ddb14d', '#82a7c8', '#8db498', '#e2968a', '#6b4a2b'];

function candy(ctx, k, P, x, y, r, i, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  k.ellipse(ctx, 0, 0, r, r * 0.72, 0, CANDY[i % CANDY.length], P.ink, Math.max(2, r * 0.12));
  k.ellipse(ctx, -r * 0.3, -r * 0.22, r * 0.3, r * 0.16, -0.4, 'rgba(255,255,255,0.55)');
  ctx.restore();
}
// a bowl of candies; n = how many are left
function bowl(ctx, k, P, x, y, s, n, seed = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const R = rng(seed);
  for (let i = 0; i < n; i++) { const a = R() * Math.PI, rr = 40 + R() * 120; candy(ctx, k, P, Math.cos(a) * rr * 1.1 - 0, -10 - Math.abs(Math.sin(a)) * 30 - R() * 50 * (i / Math.max(1, n)), 22, i, R() * 3); }
  ctx.beginPath(); ctx.moveTo(-200, -20); ctx.quadraticCurveTo(-190, 120, 0, 130); ctx.quadraticCurveTo(190, 120, 200, -20); ctx.closePath(); k.fill(ctx, P.paperLight); k.stroke(ctx, P.ink, 6);
  k.ellipse(ctx, 0, -20, 200, 26, 0, null, P.ink, 5);
  ctx.restore();
}
function thought(ctx, k, P, x, y, rx, ry, a) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = clamp(a);
  k.circle(ctx, x - rx * 0.75, y + ry * 1.45, 12, P.paperLight, P.ink, 3);
  k.circle(ctx, x - rx * 0.55, y + ry * 1.15, 20, P.paperLight, P.ink, 3);
  k.ellipse(ctx, x, y, rx, ry, 0, P.paperLight, P.ink, 4);
  ctx.restore();
}
// a "want" meter: v 0..1
function meter(ctx, k, P, x, y, w, v, label) {
  k.rect(ctx, x, y, w, 50, P.paperLight, P.ink, 4, 25);
  k.rect(ctx, x + 6, y + 6, Math.max(0, (w - 12) * v), 38, v > 0.5 ? P.red : P.sky, null, 0, 19);
  k.text(ctx, label, x + w / 2, y - 30, 32, { font: 'display' });
}

export const scenes = [
  { // 0.1 "Craving a snack? Eat it in your head. 30 times."
    start: 0, title: 'Craving a Snack?',
    draw(ctx, u, S) {
      const { k, P, W } = S, ea = S.at('Eat'), hd = S.at('head'), th = S.at('times');
      plate(ctx, S, { alpha: 0.12, seed: 3 });
      bowl(ctx, k, P, 700, 900, 0.9, 18, 2);
      k.figure(ctx, 290, 1040, { ...YOU, s: 1.15, face: 1, look: [1, 0.4], mood: u > ea ? 'smile' : 'worry', blink: 1 });
      if (u < ea) for (let i = 0; i < 3; i++) k.heart(ctx, 420 + i * 40, 560 - i * 50 - (S.t * 30 % 30), 18, P.red);
      thought(ctx, k, P, 520, 300, 230, 150, tween(u, ea - 0.2, ea + 0.3));
      if (u > ea) { const n = Math.min(30, Math.floor(lerp(0, 30, tween(u, hd, th + 0.6, ease.linear)))); for (let i = 0; i < Math.min(n, 12); i++) candy(ctx, k, P, 345 + (i % 6) * 48, 270 + Math.floor(i / 6) * 48, 18, i, i); k.text(ctx, n + '×', 690, 300, 72, { font: 'display', color: P.red }); }
      k.scrawl(ctx, 'in your head', 520, 520, 48, tween(u, hd, hd + 0.4), { rot: -0.04 });
    },
  },
  { // 5.04 "In 2010, Carnegie Mellon researchers had people imagine eating M&M's, one by one."
    start: 4.8, title: 'Imagined, One by One', trans: 'bleed',
    draw(ctx, u, S) {
      const { k, P, W } = S, yr = S.at('2010'), cm = S.at('Carnegie'), im = S.at('imagine'), ob = S.at('one');
      plate(ctx, S, { alpha: 0.08, seed: 5 });
      k.stamp(ctx, '2010', 780, 110, 60, tween(u, yr, yr + 0.25), 0.1);
      k.scrawl(ctx, 'Carnegie Mellon', 300, 130, 50, tween(u, cm, cm + 0.5), { rot: -0.04 });
      k.profile(ctx, 330, 1040, 1.45, { blink: 0.5 });
      // candies float one by one into the imagined mouth
      const run = tween(u, im - 0.2, ob + 1.0, ease.linear) * 8;
      for (let i = 0; i < 8; i++) { const p = clamp(run - i); if (p > 0 && p < 1) candy(ctx, k, P, lerp(860, 480, p), lerp(380, 680, p) - Math.sin(p * Math.PI) * 90, 26, i, p * 4); }
      k.text(ctx, String(Math.floor(clamp(run / 8) * 30)), 780, 870, 96, { font: 'display', color: P.red });
      k.text(ctx, 'imagined', 780, 950, 30, { color: P.inkSoft });
      k.scrawl(ctx, 'one by one', 700, 300, 48, tween(u, ob, ob + 0.4));
    },
  },
  { // 11.1 "Then they got a real bowl."
    start: 11.0, title: 'A Real Bowl', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, rl = S.at('real');
      plate(ctx, S, { alpha: 0.08, seed: 11 });
      const p = tween(u, 0.1, 0.6, ease.outBack);
      k.rect(ctx, 120, 995, 700, 26, P.inkSoft, P.ink, 3, 6);
      bowl(ctx, k, P, W / 2, lerp(600, 830, p), 1.3, 26, 4);
      k.stamp(ctx, 'REAL', 760, 300, 64, tween(u, rl, rl + 0.2), 0.1);
    },
  },
  { // 12.94 "People who pictured eating 30 ate fewer real ones. Picturing just three? Didn't help."
    start: 12.85, title: '30 vs 3', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, fw = S.at('fewer'), th = S.at('three?'), dh = S.at("Didn't");
      plate(ctx, S, { alpha: 0.08, seed: 13 });
      k.text(ctx, 'REAL CANDIES EATEN', W / 2, 140, 40, { font: 'display' });
      k.bars(ctx, 140, 780, 660, 520, [0.45, 0.85], ['imagined 30', 'imagined 3'], tween(u, fw - 0.6, th + 0.3), [P.ink, P.red]);
      k.scrawl(ctx, 'fewer', 300, 260, 56, tween(u, fw, fw + 0.4));
      k.stamp(ctx, "DIDN'T HELP", 640, 280, 48, tween(u, dh, dh + 0.2), 0.08);
      k.text(ctx, "illustration, not the study's numbers", W / 2, 920, 24, { color: P.inkSoft });
    },
  },
  { // 18.9 "Here's the trick. Your brain gets tired of a food just by imagining it, bite after bite."
    start: 18.85, title: 'Bored by Bite 30', trans: 'blink',
    draw(ctx, u, S) {
      const { k, P, W } = S, ti = S.at('tired'), bi = S.at('bite');
      plate(ctx, S, { alpha: 0.08, seed: 19 });
      k.stamp(ctx, 'THE TRICK', 220, 110, 44, tween(u, 0.05, 0.25), -0.1);
      k.profile(ctx, 300, 1040, 1.4, { blink: lerp(1, 0.35, tween(u, ti, bi + 0.8)), inside: c => k.brain(c, 10, -205, 0.55, S.t, { fill: P.paperDark, ink: P.grey }) });
      // imagined bites tick up, the craving meter drains
      const n = Math.floor(lerp(1, 30, tween(u, 0.6, bi + 0.8, ease.linear)));
      meter(ctx, k, P, 560, 300, 330, lerp(0.95, 0.15, n / 30), 'CRAVING');
      for (let i = 0; i < Math.min(n, 15); i++) candy(ctx, k, P, 600 + (i % 5) * 60, 470 + Math.floor(i / 5) * 56, 22, i, i);
      k.text(ctx, 'bite ' + n, 725, 680, 48, { font: 'display', color: P.red });
      k.scrawl(ctx, 'tired of it', 725, 780, 52, tween(u, ti, ti + 0.4));
      k.scrawl(ctx, 'bite after bite', 725, 880, 44, tween(u, bi, bi + 0.6));
    },
  },
  { // 24.68 "So next craving, picture every bite, slowly."
    start: 24.55, title: 'Picture Every Bite', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, ne = S.at('next'), pi = S.at('picture'), sl = S.at('slowly');
      plate(ctx, S, { alpha: 0.1, seed: 24 });
      k.figure(ctx, 290, 1040, { ...YOU, s: 1.15, face: 1, look: [0.4, -0.4], mood: 'calm', blink: 0.08 });
      thought(ctx, k, P, 600, 380, 260, 170, tween(u, pi - 0.3, pi + 0.2));
      if (u > pi) { const n = Math.floor(lerp(1, 7, tween(u, pi, pi + 3.2, ease.linear))); for (let i = 0; i < n; i++) candy(ctx, k, P, 470 + (i % 4) * 80, 340 + Math.floor(i / 4) * 80, 30, i, i * 0.6); k.text(ctx, 'bite ' + n + '…', 640, 510, 40, { font: 'hand', color: P.red }); }
      k.scrawl(ctx, 'next craving', 300, 140, 50, tween(u, ne, ne + 0.4), { rot: -0.04 });
      k.stamp(ctx, 'SLOWLY', 720, 760, 60, tween(u, sl, sl + 0.2), -0.08);
    },
  },
  { // 29.0 "Follow for more mind tricks." → the case-file cover
    start: 28.85, title: 'More Mind Tricks', trans: 'cut',
    draw(ctx, u, S) {
      ctx.save(); plate(ctx, S, { alpha: 0.1, seed: 24 }); ctx.restore();
      inkReveal(ctx, S, tween(u, 0.1, 0.8, ease.linear), c => caseCover(c, S, u - 0.1, { handle: meta.brand.handle, caseNo: '2010', tagline: meta.brand.tagline }));
    },
  },
];

export const sfx = [
  { t: 0.2, type: 'heartbeat', gain: 0.35 },
  { t: 1.5, type: 'pop', gain: 0.45 },
  { t: 2.5, type: 'pen', gain: 0.4 },
  { t: 3.3, type: 'click', gain: 0.4 }, { t: 3.5, type: 'click', gain: 0.4 }, { t: 3.7, type: 'click', gain: 0.4 },
  { t: 4.8, type: 'splat', gain: 0.5 },
  { t: 5.1, type: 'stamp', gain: 0.7 },
  { t: 6.1, type: 'pen', gain: 0.4 },
  { t: 8.0, type: 'pop', gain: 0.35 }, { t: 8.6, type: 'pop', gain: 0.35, pitch: 1.1 }, { t: 9.2, type: 'pop', gain: 0.35, pitch: 1.2 }, { t: 9.8, type: 'pop', gain: 0.35 }, { t: 10.4, type: 'pop', gain: 0.35, pitch: 1.1 },
  { t: 11.0, type: 'whoosh', gain: 0.35 },
  { t: 11.4, type: 'clank', gain: 0.35 },
  { t: 11.75, type: 'stamp', gain: 0.75 },
  { t: 12.85, type: 'fold', gain: 0.45 },
  { t: 14.8, type: 'pen', gain: 0.45 },
  { t: 17.85, type: 'stamp', gain: 0.75 },
  { t: 18.85, type: 'blink', gain: 0.45 },
  { t: 18.95, type: 'stamp', gain: 0.45 },
  { t: 20.7, type: 'pen', gain: 0.4 },
  { t: 23.0, type: 'pen', gain: 0.4 },
  { t: 24.55, type: 'fold', gain: 0.45 },
  { t: 24.9, type: 'pen', gain: 0.4 },
  { t: 26.2, type: 'pop', gain: 0.35 },
  { t: 28.05, type: 'stamp', gain: 0.75 },
  { t: 28.9, type: 'splat', gain: 0.75 },
  { t: 29.3, type: 'fold', gain: 0.4 },
  { t: 30.1, type: 'stamp', gain: 0.75 },
  { t: 31.0, type: 'moth', gain: 0.3 },
  { t: 32.5, type: 'bell', gain: 0.25 },
];

export const music = {
  kit: 'mind', bpm: 100, root: 'G', scale: 'major', gain: 0.3,
  sections: [
    { from: 0, to: 4.8, mood: 'intro' },
    { from: 4.8, to: 18.85, mood: 'groove' },
    { from: 18.85, to: 24.55, mood: 'drive' },
    { from: 24.55, to: 28.85, mood: 'triumph' },
    { from: 28.85, to: 33.0, mood: 'end' },
  ],
};
