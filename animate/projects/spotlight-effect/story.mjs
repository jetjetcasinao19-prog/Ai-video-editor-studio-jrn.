// "The Spotlight Effect" — an INKBLOT case file (psychology, MindTrace).
// Gilovich, Medvec & Savitsky (2000), Cornell: the Barry Manilow T-shirt —
// wearers guessed about half the room noticed; really about a quarter.
// u = seconds since the scene started; S.at('word') = when that word is said.
import { clamp, lerp, ease, tween, rng, TAU, shake, pop } from '../../lib/core.mjs';
import { plate, study, caseCover, inkReveal } from '../../styles/inkblot/scenes.mjs';

export const meta = {
  title: 'The Spotlight Effect',
  slug: 'spotlight-effect-inkblot',
  style: 'inkblot',
  width: 1080, height: 1920, fps: 30,
  duration: 44.1,
  voice: 'voice.mp3',
  seed: 85,
  captionChars: 24,
  caseLine: 'THE MIND FILES  ·  CASE No. 2000  ·  CONFIDENTIAL',
  brandKit: 'mindtrace', // MindTrace (brand/mindtrace/): logo, handle, tagline, outro text
  outro: { at: 41.55 },
};

const STUDENT = { hair: 'slick' };

// the embarrassing T-shirt, drawn over a figure standing at (x, y) with scale s
function tshirt(ctx, k, P, x, y, s, drop = 1) {
  if (drop <= 0) return;
  ctx.save(); ctx.translate(x, y - (1 - ease.outBack(drop)) * 500 * s); ctx.scale(s, s);
  k.poly(ctx, [[-46, -306], [46, -306], [76, -278], [62, -246], [46, -256], [48, -150], [-48, -150], [-46, -256], [-62, -246], [-76, -278]], P.paperLight, P.ink, 3);
  k.text(ctx, 'BARRY', 0, -232, 20, { font: 'serif', color: P.red });
  k.text(ctx, 'MANILOW', 0, -208, 17, { font: 'serif', color: P.red });
  k.circle(ctx, 0, -178, 14, P.ochre);
  ctx.restore();
}
// a little lit stage inside a head (you, in your own spotlight)
const stageIn = k => c => {
  c.fillStyle = '#3a3547'; c.fillRect(-160, -340, 340, 320);
  c.save(); c.globalAlpha = 0.9; c.beginPath(); c.moveTo(70, -330); c.lineTo(-60, -95); c.lineTo(80, -95); c.closePath(); c.fillStyle = 'rgba(255,246,205,0.75)'; c.fill(); c.restore();
  c.beginPath(); c.ellipse(10, -95, 70, 16, 0, 0, Math.PI * 2); c.fillStyle = 'rgba(255,246,205,0.9)'; c.fill();
  k.figure(c, 10, -95, { s: 0.36, mood: 'smile', shadow: false });
};
// a seated audience: rows of people at desks; look = how many look up (fractional)
function audience(ctx, S, u, look = 0, ox = 0) {
  const { k, P } = S;
  const seats = [[300, 760], [500, 760], [700, 760], [400, 960], [600, 960], [800, 960]];
  seats.forEach(([x, y], i) => {
    const up = clamp(look - i);
    k.figure(ctx, x + ox, y, { s: 0.62, sit: true, face: -1, look: [lerp(0, -1, up), lerp(1, 0, up)], hair: ['bob', 'slick', 'bun', 'slick', 'bob', null][i], skirt: i % 2 === 0, shadow: false });
    k.rect(ctx, x + ox - 80, y - 100, 120, 16, '#6b4a2b'); k.rect(ctx, x + ox - 30, y - 100, 12, 100, '#6b4a2b');
    k.rect(ctx, x + ox - 70, y - 108, 50, 10, P.paperLight, P.ink, 1);
  });
}
function grid(ctx, S, u, from, to, at, label, big, note) {
  const { k, P, W } = S;
  plate(ctx, S, { alpha: 0.06, seed: 60 + to });
  k.text(ctx, label, W / 2, 110, 40, { color: P.inkSoft });
  const v = lerp(from, to, tween(u, at - 0.2, at + 0.7, ease.outCubic));
  // the room as eyes: red = noticed the shirt
  for (let i = 0; i < 100; i++) {
    const c = 60, x = 170 + (i % 10 + 0.5) * c, y = 170 + (Math.floor(i / 10) + 0.5) * c;
    if (i < Math.round(v)) k.eye(ctx, x, y, 22, { open: 1, look: [0, 0], lashes: false, iris: P.red });
    else k.eye(ctx, x, y, 22, { open: 0, lashes: false });
  }
  k.text(ctx, big + Math.round(v) + '%', W / 2, 900, 120, { font: 'display', color: P.red });
  k.text(ctx, 'noticed the shirt', W / 2, 990, 44, {});
  if (note) k.scrawl(ctx, note, 790, 860, 50, tween(u, at + 0.6, at + 1.1), { rot: -0.08 });
}

export const scenes = [
  { // 0.0 "You think everyone noticed. They didn't."
    start: 0, title: 'Everyone Noticed?',
    draw(ctx, u, S) {
      const { k, P, W, H } = S, ev = S.at('everyone'), dn = S.at("didn't");
      ctx.fillStyle = '#141219'; ctx.fillRect(-100, -100, W + 200, H + 200);
      S.cam(lerp(1.1, 1.0, tween(u, 0, 3.2)), W / 2, 560);
      k.spotlight(ctx, W / 2, 0, W / 2, 960, 230, tween(u, 0, 0.4));
      k.figure(ctx, W / 2, 960, { ...STUDENT, s: 1.2, face: 1, look: [0, 0], mood: 'worry', blink: (u % 1.6) < 0.1 ? 0 : 1, shadow: false });
      tshirt(ctx, k, P, W / 2, 960, 1.2, 1);
      k.watchers(ctx, W / 2, 520, 400, 380, 12, 12 * tween(u, dn - 0.1, dn + 0.9), S.t, [0.6, 0]);
      k.scrawl(ctx, "they didn't.", W / 2, 1010, 70, tween(u, dn + 0.2, dn + 0.7), { color: P.redLight });
    },
  },
  { // 3.48 "In 2000, Cornell psychologists made students wear an embarrassing t-shirt with Barry Manilow's face on it."
    start: 3.3, title: 'Cornell, 2000', trans: 'bleed',
    draw(ctx, u, S) {
      const { k, P, W } = S, yr = S.at('2000'), co = S.at('Cornell'), em = S.at('embarrassing'), ba = S.at('Barry');
      plate(ctx, S, { alpha: 0.08, seed: 12 });
      S.cam(lerp(1.0, 1.15, tween(u, em - 0.5, ba + 1.0)), W / 2, 560);
      k.figure(ctx, W / 2, 1000, { ...STUDENT, s: 1.45, face: 1, look: [0, -0.5], mood: u > ba ? 'shock' : 'calm', armL: [0.3, 0.3], armR: [0.3, 0.3] });
      tshirt(ctx, k, P, W / 2, 1000, 1.45, tween(u, em - 0.3, em + 0.3));
      k.stamp(ctx, '2000', 790, 130, 64, tween(u, yr, yr + 0.25), 0.1);
      k.scrawl(ctx, 'Cornell psychologists', 300, 150, 52, tween(u, co, co + 0.6), { rot: -0.05 });
      k.scrawl(ctx, 'embarrassing!', 230, 520, 60, tween(u, em + 0.3, em + 0.8), { rot: -0.1 });
      k.arrow(ctx, 250, 560, 380, 620, tween(u, em + 0.6, em + 0.9), P.red, 6, -0.2);
    },
  },
  { // 11.84 "Then, each student walked late into a room full of people."
    start: 11.58, title: 'Walking In Late', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, wl = S.at('walked'), la = S.at('late'), fl = S.at('full');
      study(ctx, S, { desk: false });
      k.clock(ctx, 820, 150, 60, 0, { hour: 9, minute: 12 });
      k.scrawl(ctx, 'late!', 700, 200, 56, tween(u, la, la + 0.3));
      // the door on the left, the student walking in
      k.rect(ctx, 20, 380, 160, 440, P.ink); k.rect(ctx, 30, 390, 140, 430, P.redDark, P.ink, 3);
      const walk = tween(u, wl - 0.3, wl + 1.6, ease.linear);
      const sx = lerp(60, 190, walk);
      k.figure(ctx, sx, 900, { ...STUDENT, s: 0.95, face: 1, walk: walk < 1 ? u * 1.6 : 0, mood: 'worry', look: [1, 0] });
      tshirt(ctx, k, P, sx, 900, 0.95, 1);
      audience(ctx, S, u, 6 * tween(u, fl, fl + 1.4) * 0.4);
    },
  },
  { // 15.8 "Afterward, they guessed about half the room noticed the shirt."
    start: 15.75, title: 'They Guessed: Half', trans: 'fold',
    draw(ctx, u, S) { grid(ctx, S, u, 0, 50, S.at('half'), 'THE SHIRT-WEARERS GUESSED', '≈'); },
  },
  { // 19.62 "The real number? About a quarter."
    start: 19.6, title: 'Really: About a Quarter', trans: 'fold',
    draw(ctx, u, S) { grid(ctx, S, u, 50, 25, S.at('quarter'), 'WHO REALLY NOTICED', '≈', 'they guessed 50%'); },
  },
  { // 22.56 "Here's the trick. It's called the spotlight effect."
    start: 22.5, title: 'The Spotlight Effect', trans: 'bleed',
    draw(ctx, u, S) {
      const { k, P, W, H } = S, sp = S.at('spotlight');
      ctx.fillStyle = '#141219'; ctx.fillRect(-100, -100, W + 200, H + 200);
      k.stamp(ctx, 'THE TRICK', 220, 110, 42, tween(u, 0.05, 0.25), -0.1, P.redLight);
      const on = tween(u, sp - 0.3, sp);
      k.spotlight(ctx, 760, 140, W / 2, 940, 220, on);
      k.figure(ctx, W / 2, 940, { ...STUDENT, s: 1.1, face: 1, look: [0.6, -0.6], mood: 'worry', shadow: false });
      tshirt(ctx, k, P, W / 2, 940, 1.1, 1);
      const p = pop(u, sp, 0.4);
      if (p) { ctx.save(); ctx.translate(W / 2, 260); ctx.scale(p, p); ctx.rotate(-0.03); k.rect(ctx, -380, -70, 760, 140, P.paperLight, P.ink, 5, 8); k.text(ctx, 'The Spotlight', 0, -14, 56, { font: 'italic' }); k.text(ctx, 'EFFECT', 0, 42, 36, { color: P.red }); ctx.restore(); }
    },
  },
  { // 26.26 "You're the main character in your head, but everyone else is the main character in theirs."
    start: 26.2, title: 'Main Characters', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, yh = S.at('head'), ev = S.at('everyone'), th = S.at('theirs');
      plate(ctx, S, { alpha: 0.1, seed: 26 });
      // inside your head: you, on stage, in a spotlight
      const big = lerp(1.35, 0.95, tween(u, ev - 0.3, ev + 0.5));
      const bx = lerp(380, 250, tween(u, ev - 0.3, ev + 0.5));
      k.profile(ctx, bx, 1010, big, { inside: stageIn(k), blink: 1 });
      k.scrawl(ctx, 'your head', bx + 20, 1010 - 340 * big - 40, 52, tween(u, yh, yh + 0.4));
      // everyone else: each with their own spotlight, on themselves
      for (let i = 0; i < 3; i++) {
        const p = pop(u, ev + 0.2 + i * 0.25, 0.35); if (!p) continue;
        ctx.save(); ctx.translate(560 + i * 150, 560 + (i % 2) * 150); ctx.scale(p, p);
        k.profile(ctx, 0, 0, 0.5, { flip: true, inside: stageIn(k), blink: 1 });
        ctx.restore();
      }
      k.scrawl(ctx, '…and theirs', 700, 860, 60, tween(u, th, th + 0.5));
    },
  },
  { // 32.18 "They're too busy worrying about their own shirt."
    start: 32.15, title: 'Busy With Their Own Shirt', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, wr = S.at('worrying'), sh = S.at('shirt');
      plate(ctx, S, { alpha: 0.08, seed: 32 });
      for (let i = 0; i < 3; i++) {
        const x = 190 + i * 280, y = 1000;
        k.figure(ctx, x, y, { s: 1.0, face: i === 1 ? -1 : 1, look: [0, 1], tilt: 0.25 * (i === 1 ? -1 : 1), mood: 'worry', hair: ['bob', 'slick', 'bun'][i], skirt: i !== 1, armR: [0.9, 1.6], armL: [0.9, 1.6] });
        // their own little worry: a stain on their own shirt
        k.blot(ctx, x + 8, y - 230, 50, 44, { seed: 200 + i, color: P.red, res: 0.8, grow: tween(u, sh - 0.4 + i * 0.12, sh + i * 0.12), splatter: 3 });
        const b = pop(u, wr + i * 0.2, 0.3);
        if (b) { ctx.save(); ctx.translate(x, 420 - (i % 2) * 60); ctx.scale(b, b); k.rect(ctx, -130, -55, 260, 110, P.paperLight, P.ink, 4, 30); k.text(ctx, ['my hair…', 'my shirt!', 'my voice…'][i], 0, 2, 46, { font: 'hand', color: P.red }); ctx.restore(); }
      }
    },
  },
  { // 34.98 "So that awkward thing you said? Fewer people noticed than you think."
    start: 34.95, title: 'That Awkward Thing', trans: 'blink',
    draw(ctx, u, S) {
      const { k, P, W, H } = S, aw = S.at('awkward'), fw = S.at('Fewer'), th = S.at('think');
      ctx.fillStyle = '#141219'; ctx.fillRect(-100, -100, W + 200, H + 200);
      k.spotlight(ctx, W / 2, 0, W / 2, 1000, 200, 1);
      k.figure(ctx, W / 2, 1000, { s: 1.1, face: 1, look: [0.3, 0], mood: 'worry', armR: [0.6, 1.8], shadow: false });
      const b = pop(u, aw - 0.3, 0.3);
      if (b) { ctx.save(); ctx.translate(W / 2 + 120, 430); ctx.scale(b, b); k.rect(ctx, -220, -60, 440, 120, P.paperLight, P.ink, 5, 30); k.text(ctx, '"You too!"', 0, 4, 52, { font: 'serif' }); ctx.restore(); }
      k.scrawl(ctx, '*cringe*', 260, 300, 60, tween(u, aw + 0.4, aw + 0.8), { color: P.redLight });
      k.watchers(ctx, W / 2, 560, 420, 420, 12, 10 * tween(u, fw - 0.1, fw + 0.9), S.t, [0.7, 0]);
      k.scrawl(ctx, 'fewer than you think', W / 2, 1020, 56, tween(u, th - 0.2, th + 0.4), { color: P.redLight });
    },
  },
  { // 39.9 "Follow for more mind tricks." → the case-file cover
    start: 39.4, title: 'More Mind Tricks', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      ctx.save(); ctx.fillStyle = '#141219'; ctx.fillRect(-100, -100, W + 200, H + 200); k.spotlight(ctx, W / 2, 0, W / 2, 1000, 200, 1); k.figure(ctx, W / 2, 1000, { s: 1.1, mood: 'smile', shadow: false }); ctx.restore();
      inkReveal(ctx, S, tween(u, 0.5, 1.2, ease.linear), c => caseCover(c, S, u - 0.5, { handle: meta.brand.handle, caseNo: '2000', tagline: meta.brand.tagline }));
    },
  },
];

export const sfx = [
  { t: 0.05, type: 'thud', gain: 0.6 },
  { t: 0.1, type: 'heartbeat', gain: 0.5 },
  { t: 2.3, type: 'blink', gain: 0.4 },
  { t: 2.6, type: 'pen', gain: 0.45 },
  { t: 3.3, type: 'splat', gain: 0.65 },
  { t: 3.6, type: 'stamp', gain: 0.7 },
  { t: 4.6, type: 'pen', gain: 0.45 },
  { t: 7.0, type: 'whoosh', gain: 0.5 },
  { t: 7.45, type: 'flop', gain: 0.45 },
  { t: 7.7, type: 'pen', gain: 0.45 },
  { t: 9.2, type: 'riser', gain: 0.3 },
  { t: 11.58, type: 'fold', gain: 0.45 },
  { t: 12.6, type: 'slide', gain: 0.4 },
  { t: 13.0, type: 'tick', gain: 0.4 },
  { t: 14.2, type: 'heartbeat', gain: 0.45 },
  { t: 15.75, type: 'fold', gain: 0.45 },
  { t: 16.5, type: 'riser', gain: 0.3 },
  { t: 17.6, type: 'chime', gain: 0.35 },
  { t: 19.6, type: 'fold', gain: 0.45 },
  { t: 20.4, type: 'flop', gain: 0.45 },
  { t: 21.5, type: 'chime', gain: 0.4, pitch: 1.2 },
  { t: 22.5, type: 'splat', gain: 0.6 },
  { t: 22.6, type: 'stamp', gain: 0.4 },
  { t: 24.3, type: 'clank', gain: 0.6 },
  { t: 24.5, type: 'riser', gain: 0.35 },
  { t: 25.1, type: 'pop', gain: 0.5 },
  { t: 26.2, type: 'fold', gain: 0.45 },
  { t: 27.9, type: 'pen', gain: 0.4 },
  { t: 29.0, type: 'pop', gain: 0.45 }, { t: 29.25, type: 'pop', gain: 0.45, pitch: 1.2 }, { t: 29.5, type: 'pop', gain: 0.45, pitch: 1.4 },
  { t: 31.0, type: 'pen', gain: 0.45 },
  { t: 32.15, type: 'whoosh', gain: 0.4 },
  { t: 32.8, type: 'pop', gain: 0.4 }, { t: 33.0, type: 'pop', gain: 0.4, pitch: 1.2 }, { t: 33.2, type: 'pop', gain: 0.4, pitch: 1.4 },
  { t: 33.7, type: 'splat', gain: 0.4 },
  { t: 34.95, type: 'blink', gain: 0.5 },
  { t: 35.2, type: 'pop', gain: 0.5 },
  { t: 35.8, type: 'flop', gain: 0.4 },
  { t: 37.3, type: 'blink', gain: 0.35 },
  { t: 38.6, type: 'pen', gain: 0.45 },
  { t: 39.9, type: 'splat', gain: 0.8 },
  { t: 40.3, type: 'fold', gain: 0.4 },
  { t: 41.1, type: 'stamp', gain: 0.8 },
  { t: 42.0, type: 'moth', gain: 0.35 },
  { t: 43.4, type: 'bell', gain: 0.3 },
];

export const music = {
  kit: 'mind', bpm: 96, root: 'A', scale: 'minor', gain: 0.3,
  sections: [
    { from: 0, to: 3.3, mood: 'tense' },
    { from: 3.3, to: 15.75, mood: 'groove' },
    { from: 15.75, to: 22.5, mood: 'drive' },
    { from: 22.5, to: 32.15, mood: 'tense' },
    { from: 32.15, to: 39.4, mood: 'triumph' },
    { from: 39.4, to: 44.1, mood: 'end' },
  ],
};
