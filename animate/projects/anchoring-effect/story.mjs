// "The Anchoring Effect" — an INKBLOT case file (psychology, MindTrace).
// Tversky & Kahneman (1974, Science): a rigged wheel stops at 10 or 65, then
// "what percent of UN countries are African?" → median guesses 25 vs 45.
// u = seconds since the scene started; S.at('word') = when that word is said.
import { clamp, lerp, ease, tween, rng, TAU, shake, pop } from '../../lib/core.mjs';
import { plate, caseCover, inkReveal } from '../../styles/inkblot/scenes.mjs';

export const meta = {
  title: 'The Anchoring Effect',
  slug: 'anchoring-effect-inkblot',
  style: 'inkblot',
  width: 1080, height: 1920, fps: 30,
  duration: 54.4,
  voice: 'voice.mp3',
  seed: 52,
  captionChars: 24,
  caseLine: 'THE MIND FILES  ·  CASE No. 1974  ·  CONFIDENTIAL',
  brandKit: 'mindtrace', // MindTrace (brand/mindtrace/): logo, handle, tagline, outro text
  outro: { at: 51.85 },
};

const KAHNEMAN = { glasses: true, hair: 'slick', tie: '#c61f2a' };
const TVERSKY = { hair: 'slick', tie: '#82a7c8' };

// a rough ink map of Africa (it reads like a blot — fitting)
const AFRICA = [[-0.42, -0.42], [-0.2, -0.5], [0.05, -0.44], [0.25, -0.45], [0.32, -0.3], [0.4, -0.16], [0.48, -0.08], [0.36, 0.0], [0.3, 0.2], [0.24, 0.4], [0.08, 0.55], [-0.05, 0.58], [-0.14, 0.38], [-0.12, 0.15], [-0.1, 0.0], [-0.2, -0.05], [-0.4, -0.04], [-0.52, -0.15], [-0.5, -0.3]];
function africa(ctx, k, P, x, y, s, a = 1) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); k.smooth(ctx, AFRICA); k.fill(ctx, P.ink);
  k.ellipse(ctx, 0.43, 0.33, 0.04, 0.1, 0.3, P.ink);
  ctx.restore();
}

function guessScene(ctx, S, u, saw, to, from) {
  const { k, P, W } = S, n = S.at(String(to));
  plate(ctx, S, { alpha: 0.06, seed: 60 + to });
  k.wheel(ctx, 170, 220, 110, k.wheelAngleFor(saw));
  k.text(ctx, 'SAW ' + saw, 170, 400, 44, { font: 'display' });
  k.text(ctx, 'GUESSED:', 620, 140, 40, { color: P.inkSoft });
  const v = lerp(from, to, tween(u, n - 0.2, n + 0.7, ease.outCubic));
  k.percentGrid(ctx, 420, 190, 420, v);
  k.text(ctx, '≈' + Math.round(v) + '%', 630, 720, 130, { font: 'display', color: P.red });
  k.text(ctx, 'of UN countries are African', 470, 830, 38, {});
  africa(ctx, k, P, 210, 640, 260, 0.9);
}

export const scenes = [
  { // 0.0 "A random number just changed your answer. You didn't even notice."
    start: 0, title: 'A Random Number',
    draw(ctx, u, S) {
      const { k, P, W, H } = S, nb = S.at('number'), ch = S.at('changed'), nt = S.at('notice');
      plate(ctx, S, { alpha: 0.12, seed: 6 });
      S.cam(lerp(1.08, 1.0, tween(u, 0, 4.6)), W / 2, 560);
      const lid = tween(u, 0.1, nb, ease.outBack) * (1 - tween(u, nb + 0.5, nb + 0.9));
      const drop = tween(u, nb - 0.4, nb + 0.45, ease.inQuad);
      k.profile(ctx, 360, 1010, 1.5, { lid, blink: u > nt && u < nt + 0.15 ? 0 : 1 });
      if (drop < 1) { ctx.save(); ctx.translate(365, lerp(-80, 690, drop)); ctx.rotate(u * 3); k.rect(ctx, -80, -60, 160, 120, P.red, P.ink, 5, 10); k.text(ctx, '65', 0, 4, 80, { font: 'display', color: P.paperLight }); ctx.restore(); }
      // your answer card flips from 25 to 45
      const flip = tween(u, ch - 0.1, ch + 0.4, ease.inOut), sx = Math.abs(Math.cos(flip * Math.PI));
      ctx.save(); ctx.translate(730, 420); ctx.scale(Math.max(0.02, sx), 1);
      k.rect(ctx, -150, -120, 300, 240, P.paperLight, P.ink, 5, 10);
      k.text(ctx, 'YOUR ANSWER', 0, -76, 28, { color: P.inkSoft });
      k.text(ctx, flip < 0.5 ? '25%' : '45%', 0, 24, 100, { font: 'display', color: flip < 0.5 ? P.ink : P.red });
      ctx.restore();
      k.scrawl(ctx, "didn't notice.", 720, 700, 60, tween(u, nt - 0.2, nt + 0.3), { rot: -0.06 });
    },
  },
  { // 5.04 "In 1974, psychologists Daniel Kahneman and Amos Tversky spun a wheel in front of people."
    start: 4.84, title: 'Kahneman & Tversky, 1974', trans: 'bleed',
    draw(ctx, u, S) {
      const { k, P, W } = S, yr = S.at('1974'), dk = S.at('Daniel'), at = S.at('Amos'), sp = S.at('spun');
      plate(ctx, S, { alpha: 0.08, seed: 11 });
      const spin = u < sp ? 0 : (u - sp) * 7 + Math.min(1, u - sp) * 0;
      k.wheel(ctx, W / 2, 430, 280, spin * tween(u, sp, sp + 0.3) + 0.2);
      k.figure(ctx, 110, 1040, { ...KAHNEMAN, s: 0.9, face: 1, look: [0.7, -0.6], mood: 'calm', armR: [lerp(0.3, 2.0, tween(u, sp - 0.3, sp)), 0.3] });
      k.figure(ctx, 830, 1040, { ...TVERSKY, s: 0.9, face: -1, look: [-0.7, -0.6], mood: 'smile' });
      k.scrawl(ctx, 'Daniel Kahneman', 340, 810, 50, tween(u, dk, dk + 0.5), { rot: -0.05 });
      k.scrawl(ctx, 'Amos Tversky', 640, 900, 50, tween(u, at, at + 0.5), { rot: 0.04 });
      k.stamp(ctx, '1974', 790, 120, 64, tween(u, yr, yr + 0.25), 0.1);
    },
  },
  { // 11.64 "It landed on 10, or 65."
    start: 11.54, title: '10… or 65', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, t10 = S.at('10'), t65 = S.at('65');
      plate(ctx, S, { blot: false });
      // the fold splits the plate: one wheel stops on 10, its twin on 65
      for (const [side, n, at] of [[0, 10, t10], [1, 65, t65]]) {
        ctx.save(); ctx.beginPath(); ctx.rect(side * W / 2, 0, W / 2, 1060); ctx.clip();
        if (side) { ctx.fillStyle = P.paperDark; ctx.fillRect(W / 2, 0, W / 2, 1060); }
        const e = ease.outCubic(tween(u, -0.2, at, ease.linear));
        k.wheel(ctx, W / 4 + side * W / 2, 430, 190, k.wheelAngleFor(n) + (1 - e) * TAU * 2.5);
        const p = pop(u, at, 0.35);
        if (p) { ctx.save(); ctx.translate(W / 4 + side * W / 2, 800); ctx.scale(p, p); k.text(ctx, String(n), 0, 0, 170, { font: 'display', color: side ? P.red : P.ink }); ctx.restore(); }
        ctx.restore();
      }
      k.scrawl(ctx, 'or', W / 2, 960, 70, tween(u, S.at('or'), S.at('or') + 0.3));
    },
  },
  { // 14.64 "Then they asked, what percent of UN countries are in Africa?"
    start: 14.54, title: 'The Question', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, wh = S.at('what'), af = S.at('Africa');
      plate(ctx, S, { alpha: 0.06, seed: 14 });
      africa(ctx, k, P, W / 2, 330, 520, tween(u, 0.1, af));
      k.penCircle(ctx, W / 2, 330, 230, 250, tween(u, af, af + 0.5), P.red, 7);
      ctx.save(); ctx.translate(W / 2, 800); ctx.rotate(-0.02);
      k.rect(ctx, -410, -150, 820, 300, P.paperLight, P.ink, 5, 8);
      k.typeOn(ctx, 'What % of UN countries', 0, -70, 50, tween(u, wh - 0.2, wh + 1.2, ease.linear), { align: 'center', caret: false });
      k.typeOn(ctx, 'are in Africa?', 0, -10, 50, tween(u, wh + 1.0, af + 0.3, ease.linear), { align: 'center', caret: false });
      k.text(ctx, '____ %', 0, 80, 60, { font: 'serif', color: (u * 2 % 1) < 0.5 ? P.red : P.ink });
      ctx.restore();
    },
  },
  { // 19.62 "People who saw 10 guessed about 25%."
    start: 19.52, title: 'Saw 10 → About 25%', trans: 'fold',
    draw(ctx, u, S) { guessScene(ctx, S, u, 10, 25, 0); },
  },
  { // 23.16 "People who saw 65 guessed about 45."
    start: 23.06, title: 'Saw 65 → About 45%', trans: 'fold',
    draw(ctx, u, S) { guessScene(ctx, S, u, 65, 45, 25); },
  },
  { // 26.8 "A random wheel, almost double the answer."
    start: 26.3, title: 'Almost Double', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, db = S.at('double');
      plate(ctx, S, { alpha: 0.05, seed: 70 });
      k.text(ctx, 'MEDIAN GUESS', W / 2, 110, 42, { color: P.inkSoft });
      const kb = tween(u, 0.1, db + 0.3);
      k.bars(ctx, 170, 880, 600, 1300, [0.25, 0.45], ['SAW 10', 'SAW 65'], kb, [P.inkSoft, P.red]);
      ['25%', '45%'].forEach((s, i) => { if (kb * 1.3 - i * 0.25 > 0.6) k.text(ctx, s, 170 + (i + 0.5) * 300, 880 - 1300 * [0.25, 0.45][i] - 40, 64, { font: 'display' }); });
      k.scrawl(ctx, 'almost 2x', 700, 230, 76, tween(u, db, db + 0.5), { rot: -0.08 });
      k.arrow(ctx, 330, 520, 560, 320, tween(u, db + 0.2, db + 0.6), P.red, 7, -0.3);
      k.scrawl(ctx, 'from a random wheel', W / 2, 990, 46, tween(u, 0.3, 0.9));
    },
  },
  { // 31.16 "Here's the trick. The first number you hear becomes an anchor."
    start: 31.06, title: 'The Anchor', trans: 'bleed',
    draw(ctx, u, S) {
      const { k, P, W, H } = S, fn = S.at('first'), an = S.at('anchor');
      plate(ctx, S, { blot: false, bg: P.paperLight });
      k.stamp(ctx, 'THE TRICK', 220, 110, 42, tween(u, 0.05, 0.25), -0.1);
      // the sea of ink
      const sea = 430;
      ctx.fillStyle = P.ink; ctx.fillRect(-100, sea, W + 200, H);
      for (let i = 0; i < 6; i++) { const y = sea + 60 + i * 95, x = (u * 30 + i * 140) % 260; k.line(ctx, x - 80, y, x + 120, y, P.inkSoft, 6); k.line(ctx, x + 300, y + 30, x + 460, y + 30, P.inkSoft, 6); }
      // a little boat (that's you) on the surface
      const bob = Math.sin(u * 2.4) * 6;
      ctx.save(); ctx.translate(380, sea + bob);
      k.poly(ctx, [[-130, -30], [130, -30], [90, 30], [-90, 30]], P.redDark, P.ink, 5);
      k.line(ctx, 0, -30, 0, -230, P.ink, 8); k.poly(ctx, [[6, -220], [120, -60], [6, -60]], P.paperDark, P.ink, 4);
      ctx.restore();
      // the first number drops in… and becomes the anchor
      const d = tween(u, fn - 0.2, fn + 0.4, ease.inQuad), morph = tween(u, an - 0.3, an + 0.2);
      if (morph < 1) { ctx.save(); ctx.globalAlpha = 1 - morph; ctx.translate(560, lerp(-60, sea + 120, d)); k.rect(ctx, -90, -66, 180, 132, P.red, P.ink, 5, 10); k.text(ctx, '65', 0, 4, 90, { font: 'display', color: P.paperLight }); ctx.restore(); }
      if (morph > 0) { ctx.save(); ctx.globalAlpha = morph; k.anchor(ctx, 470, sea + 20 + bob, 1.35, lerp(150, 380, tween(u, an, an + 1.2, ease.outCubic)), P.red); ctx.restore(); }
      k.scrawl(ctx, '= the anchor', 760, 300, 60, tween(u, an + 0.1, an + 0.5));
    },
  },
  { // 35.7 "Your brain starts there and doesn't move far enough."
    start: 35.6, title: "Doesn't Move Far Enough", trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, st = S.at('starts'), mv = S.at('move'), en = S.at('enough');
      plate(ctx, S, { alpha: 0.06, seed: 77 });
      const X = k.numberLine(ctx, 80, 760, 780, 0, 100, 10);
      // the anchor sits at 65
      k.anchor(ctx, X(65), 790, 0.55, 30, P.red);
      // your guess starts at the anchor and drifts left… on a chain that runs out
      const g = lerp(65, 45, tween(u, mv - 0.2, en + 0.1, ease.outCubic)) + shake(u, en + 0.1, 1.2, 0.4);
      const gx = X(g), gy = 560;
      for (let i = 0; i <= 10; i++) { const cx = lerp(X(65), gx, i / 10), cy = lerp(800, gy + 40, i / 10) + Math.sin(i / 10 * Math.PI) * 30; k.ellipse(ctx, cx, cy, 10, 6, Math.atan2(gy - 800, gx - X(65)), null, P.inkSoft, 4); }
      k.profile(ctx, gx - 40, gy + 120, 0.5, { blink: 1 });
      k.text(ctx, 'START: 65', X(65), 1010, 36, { color: P.red });
      k.scrawl(ctx, 'stuck near it', 300, 300, 66, tween(u, en, en + 0.5), { rot: -0.05 });
      k.penLine(ctx, [[X(45) - 30, 640], [X(25), 640]], tween(u, en + 0.2, en + 0.6), P.red, 6);
      k.scrawl(ctx, '?', X(22), 640, 90, tween(u, en + 0.5, en + 0.7));
    },
  },
  { // 39.32 "So in a negotiation, say your number first."
    start: 39.22, title: 'Say Your Number First', trans: 'blink',
    draw(ctx, u, S) {
      const { k, P, W } = S, sy = S.at('say'), fr = S.at('first');
      plate(ctx, S, { alpha: 0.08, seed: 81 });
      S.cam(1.0 + 0.04 * tween(u, sy, sy + 0.2), W / 2, 560 + shake(u, sy + 0.15, 6, 0.3));
      k.figure(ctx, 190, 900, { hat: 'bowler', tie: '#c61f2a', s: 1.05, sit: true, face: 1, look: [1, 0], mood: u > sy ? 'smile' : 'calm', armR: [lerp(0.8, 1.6, tween(u, sy - 0.3, sy)), 0.4] });
      k.figure(ctx, 750, 900, { hair: 'bob', skirt: true, s: 1.05, sit: true, face: -1, look: [-1, 0.3], mood: u > sy + 0.3 ? 'worry' : 'calm' });
      k.rect(ctx, 220, 760, 500, 30, P.ink, null, 0, 6); k.rect(ctx, 440, 790, 60, 220, P.ink);
      const p = tween(u, sy - 0.05, sy + 0.15, ease.outBack);
      if (p > 0) { ctx.save(); ctx.translate(470, lerp(560, 730, p)); ctx.rotate(-0.05); k.rect(ctx, -150, -46, 300, 92, P.paperLight, P.ink, 5, 6); k.text(ctx, '$5,000', 0, 4, 58, { font: 'display', color: P.red }); ctx.restore(); }
      k.stamp(ctx, 'ANCHOR SET', W / 2, 260, 64, tween(u, fr, fr + 0.2), -0.08);
    },
  },
  { // 43.38 'And that "was $200, now $99" tag? That's an anchor too.'
    start: 43.28, title: 'The Price Tag', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, ws = S.at('"was'), nw = S.at('now'), an = S.at('anchor');
      plate(ctx, S, { alpha: 0.08, seed: 85 });
      S.cam(lerp(1.0, 1.08, tween(u, 0, 5)), W / 2, 520);
      const sway = Math.sin(u * 2) * 0.05;
      k.priceTag(ctx, W / 2 - 40, 400, 1.7, '$200', '$99', tween(u, nw, nw + 0.35), -0.1 + sway);
      const hang = tween(u, an - 0.3, an + 0.5, ease.outBack);
      if (hang > 0) { ctx.save(); ctx.globalAlpha = clamp(hang * 2); k.anchor(ctx, W / 2 - 120, 560, 0.9, 120 * hang, P.red); ctx.restore(); }
      k.penCircle(ctx, W / 2 - 80, 340, 190, 80, tween(u, ws, ws + 0.5), P.red, 6);
      k.scrawl(ctx, 'anchor too!', 720, 900, 70, tween(u, an, an + 0.5), { rot: -0.06 });
    },
  },
  { // 49.66 "Follow for more mind tricks." → the case-file cover
    start: 49.56, title: 'More Mind Tricks', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      ctx.save(); plate(ctx, S, { alpha: 0.08, seed: 85 }); k.priceTag(ctx, W / 2 - 40, 400, 1.7, '$200', '$99', 1, -0.1); ctx.restore();
      inkReveal(ctx, S, tween(u, 0.05, 0.75, ease.linear), c => caseCover(c, S, u - 0.05, { handle: meta.brand.handle, caseNo: '1974', tagline: meta.brand.tagline }));
    },
  },
];

export const sfx = [
  { t: 0.2, type: 'fold', gain: 0.45 },
  { t: 0.9, type: 'whoosh', gain: 0.45 },
  { t: 1.0, type: 'thud', gain: 0.6 },
  { t: 1.45, type: 'paper', gain: 0.5 },
  { t: 1.6, type: 'chime', gain: 0.35, pitch: 1.2 },
  { t: 3.6, type: 'blink', gain: 0.4 },
  { t: 3.7, type: 'pen', gain: 0.45 },
  { t: 4.84, type: 'splat', gain: 0.7 },
  { t: 5.1, type: 'stamp', gain: 0.7 },
  { t: 7.0, type: 'pen', gain: 0.45 },
  { t: 8.3, type: 'pen', gain: 0.45 },
  { t: 9.5, type: 'tick', gain: 0.6 },
  { t: 10.5, type: 'tick', gain: 0.5 },
  { t: 11.54, type: 'fold', gain: 0.45 },
  { t: 11.7, type: 'tick', gain: 0.5 },
  { t: 12.3, type: 'bell', gain: 0.4 },
  { t: 13.2, type: 'bell', gain: 0.4, pitch: 1.2 },
  { t: 14.54, type: 'whoosh', gain: 0.4 },
  { t: 15.9, type: 'typewriter', gain: 0.45 },
  { t: 17.0, type: 'typewriter', gain: 0.4 },
  { t: 18.3, type: 'pen', gain: 0.45 },
  { t: 19.52, type: 'fold', gain: 0.45 },
  { t: 20.4, type: 'riser', gain: 0.3 },
  { t: 21.5, type: 'chime', gain: 0.35 },
  { t: 23.06, type: 'fold', gain: 0.45 },
  { t: 24.2, type: 'riser', gain: 0.3 },
  { t: 25.6, type: 'chime', gain: 0.4, pitch: 1.2 },
  { t: 26.3, type: 'whoosh', gain: 0.4 },
  { t: 28.6, type: 'gong', gain: 0.4 },
  { t: 29.1, type: 'pen', gain: 0.5 },
  { t: 31.06, type: 'splat', gain: 0.65 },
  { t: 31.2, type: 'stamp', gain: 0.4 },
  { t: 32.6, type: 'whoosh', gain: 0.4 },
  { t: 33.0, type: 'waves', gain: 0.5 },
  { t: 34.4, type: 'clank', gain: 0.6 },
  { t: 34.6, type: 'thud', gain: 0.7 },
  { t: 35.6, type: 'fold', gain: 0.45 },
  { t: 37.4, type: 'slide', gain: 0.4 },
  { t: 38.3, type: 'clank', gain: 0.6 },
  { t: 38.6, type: 'pen', gain: 0.45 },
  { t: 39.22, type: 'blink', gain: 0.5 },
  { t: 41.2, type: 'thud', gain: 0.9 },
  { t: 42.1, type: 'stamp', gain: 0.8 },
  { t: 43.28, type: 'whoosh', gain: 0.4 },
  { t: 43.8, type: 'pen', gain: 0.45 },
  { t: 45.3, type: 'pen', gain: 0.6 },
  { t: 46.0, type: 'coins', gain: 0.35 },
  { t: 48.0, type: 'clank', gain: 0.6 },
  { t: 48.2, type: 'pen', gain: 0.45 },
  { t: 49.6, type: 'splat', gain: 0.8 },
  { t: 50.0, type: 'fold', gain: 0.4 },
  { t: 50.8, type: 'stamp', gain: 0.8 },
  { t: 51.8, type: 'moth', gain: 0.35 },
  { t: 53.3, type: 'bell', gain: 0.3 },
];

export const music = {
  kit: 'mind', bpm: 98, root: 'C', scale: 'minor', gain: 0.3,
  sections: [
    { from: 0, to: 4.84, mood: 'intro' },
    { from: 4.84, to: 19.5, mood: 'groove' },
    { from: 19.5, to: 31.0, mood: 'drive' },
    { from: 31.0, to: 39.2, mood: 'tense' },
    { from: 39.2, to: 49.5, mood: 'triumph' },
    { from: 49.5, to: 54.4, mood: 'end' },
  ],
};
