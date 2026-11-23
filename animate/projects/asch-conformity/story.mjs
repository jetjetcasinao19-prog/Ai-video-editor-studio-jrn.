// "The Asch Conformity Experiment" — an INKBLOT case file (psychology, MindTrace).
// Solomon Asch (1951–56): which line matches? Alone <1% errors; with a unanimous
// group of confederates, ~75% conformed at least once; one ally cut conformity sharply.
// u = seconds since the scene started; S.at('word') = when that word is said.
import { clamp, lerp, ease, tween, rng, TAU, shake, pop } from '../../lib/core.mjs';
import { plate, study, caseCover, inkReveal } from '../../styles/inkblot/scenes.mjs';

export const meta = {
  title: 'The Asch Conformity Experiment',
  slug: 'asch-conformity-inkblot',
  style: 'inkblot',
  width: 1080, height: 1920, fps: 30,
  duration: 49.4,
  voice: 'voice.mp3',
  seed: 140,
  captionChars: 24,
  caseLine: 'THE MIND FILES  ·  CASE No. 1951  ·  CONFIDENTIAL',
  brandKit: 'mindtrace', // MindTrace (brand/mindtrace/): logo, handle, tagline, outro text
  outro: { at: 46.9 },
};

const ASCH = { glasses: true, hair: 'slick', tie: '#c61f2a', mustache: true };
const ROW = [{ hat: 'cap' }, { hair: 'slick', glasses: true }, { hat: 'bowler' }, { hair: 'slick' }, { hat: 'cap', tie: '#82a7c8' }, { hair: 'bob', skirt: true, real: true }, { hair: 'slick', tie: '#8db498' }];

// the two cards: one reference line; three comparison lines A, B (= match), C
function cards(ctx, k, P, x, y, s = 1, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  k.rect(ctx, -330, -150, 220, 300, P.paperLight, P.ink, 5, 8);
  k.line(ctx, -220, -100, -220, 70, P.ink, 12); k.text(ctx, 'X', -220, 110, 36, { font: 'display' });
  k.rect(ctx, -60, -150, 390, 300, P.paperLight, P.ink, 5, 8);
  [['A', 110], ['B', 170], ['C', 210]].forEach(([l, h], i) => { const lx = 20 + i * 115; k.line(ctx, lx, 70 - h, lx, 70, o.hl === l ? P.red : P.ink, 12); k.text(ctx, l, lx, 110, 36, { font: 'display', color: o.hl === l ? P.red : P.ink }); });
  ctx.restore();
}
// the row of seven at the table; the real participant is 6th
function row(ctx, S, u, o = {}) {
  const { k, P } = S;
  k.rect(ctx, 40, 880, 860, 26, '#6b4a2b');
  ROW.forEach((r, i) => {
    const x = 90 + i * 127;
    k.figure(ctx, x, 890, { ...r, s: 0.74, sit: true, face: 1, look: o.look ? o.look(i) : [0.3, -0.6], mood: o.mood ? o.mood(i) : 'calm', shadow: false, armR: o.armR ? o.armR(i) : undefined });
    if (o.after) o.after(ctx, i, x);
  });
}

export const scenes = [
  { // 0.0 "A group can make you deny what you see with your own eyes. Here's proof."
    start: 0, title: 'Deny Your Own Eyes?',
    draw(ctx, u, S) {
      const { k, P, W } = S, gr = S.at('group'), dn = S.at('deny'), pr = S.at('proof');
      plate(ctx, S, { alpha: 0.12, seed: 3 });
      S.cam(lerp(1.08, 1.0, tween(u, 0, 4.8)), W / 2, 540);
      const doubt = tween(u, dn, dn + 0.8);
      k.eye(ctx, W / 2, 360, 170, { open: 1 - doubt * 0.45, look: [Math.sin(u * 3) * 0.6 * doubt, 0], iris: P.ink });
      // the group, all pointing at the eye
      for (let i = 0; i < 5; i++) { const p = pop(u, gr + i * 0.12, 0.3); if (!p) continue; const x = 110 + i * 180; k.figure(ctx, x, 1010, { ...ROW[i], s: 0.85 * p, face: x < W / 2 ? 1 : -1, look: [x < W / 2 ? 0.6 : -0.6, -1], mood: 'calm', armR: x < W / 2 ? [2.4, 0.2] : undefined, armL: x >= W / 2 ? [2.4, 0.2] : undefined }); }
      k.stamp(ctx, 'PROOF', 790, 120, 54, tween(u, pr, pr + 0.2), 0.12);
    },
  },
  { // 5.38 "In the 1950s, psychologist Solomon Asch showed people three lines."
    start: 5.1, title: 'Solomon Asch, 1950s', trans: 'bleed',
    draw(ctx, u, S) {
      const { k, P, W } = S, yr = S.at('1950s'), sa = S.at('Solomon'), tl = S.at('three');
      plate(ctx, S, { alpha: 0.08, seed: 5 });
      cards(ctx, k, P, W / 2, 360, 1.15 * ease.outBack(tween(u, tl - 0.4, tl + 0.1)) || 0.001);
      k.figure(ctx, 170, 1010, { ...ASCH, s: 1.0, face: 1, look: [0.8, -0.6], mood: 'calm', armR: [2.4, 0.3] });
      k.stamp(ctx, '1950s', 790, 840, 64, tween(u, yr, yr + 0.25), 0.1);
      k.scrawl(ctx, 'Solomon Asch', 420, 660, 60, tween(u, sa, sa + 0.5), { rot: -0.05 });
    },
  },
  { // 10.42 "Which one matches this one? Easy."
    start: 10.3, title: 'Which One Matches?', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, wh = S.at('Which'), ez = S.at('Easy');
      plate(ctx, S, { alpha: 0.08, seed: 5 });
      cards(ctx, k, P, W / 2, 440, 1.3, { hl: u > ez ? 'B' : null });
      k.arrow(ctx, 200, 130, 200, 250, tween(u, wh, wh + 0.4), P.red, 6, 0);
      k.scrawl(ctx, 'this one?', 200, 100, 54, tween(u, wh, wh + 0.5));
      k.penCircle(ctx, W / 2 + 150, 420, 70, 150, tween(u, ez, ez + 0.4), P.red, 7);
      k.scrawl(ctx, 'easy: B', W / 2 + 150, 720, 66, tween(u, ez + 0.2, ez + 0.6));
    },
  },
  { // 13.42 "Alone, people got it wrong less than 1% of the time."
    start: 13.3, title: 'Alone: Under 1% Wrong', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, n = S.at('1%');
      plate(ctx, S, { alpha: 0.06, seed: 13 });
      k.text(ctx, 'ALONE: WRONG ANSWERS', W / 2, 110, 40, { color: P.inkSoft });
      k.percentGrid(ctx, 170, 180, 600, 0.9 * tween(u, n - 0.1, n + 0.3));
      k.text(ctx, '< 1%', W / 2, 900, 120, { font: 'display', color: P.red });
      k.text(ctx, 'of the time', W / 2, 990, 44, {});
    },
  },
  { // 17.16 "But everyone else in the room was an actor."
    start: 17.05, title: 'Everyone Else: Actors', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, ev = S.at('everyone'), ac = S.at('actor');
      plate(ctx, S, { alpha: 0.06, seed: 17 });
      cards(ctx, k, P, W / 2, 220, 0.75);
      row(ctx, S, u, {
        look: i => ROW[i].real ? [Math.sin(u * 2) * 0.8, 0] : [0.3, -0.6],
        after: (c, i, x) => { if (!ROW[i].real) { const p = pop(u, ac - 0.2 + i * 0.08, 0.2); if (p) { c.save(); c.translate(x, 560); c.scale(p, p); c.rotate(-0.15); k.rect(c, -52, -18, 104, 36, P.paperLight, P.red, 4, 4); k.text(c, 'ACTOR', 0, 2, 22, { color: P.red }); c.restore(); } } },
      });
      k.scrawl(ctx, 'the only real one', 760, 990, 46, tween(u, ac + 0.6, ac + 1.1));
      k.arrow(ctx, 760, 960, 725, 900, tween(u, ac + 0.8, ac + 1.1), P.red, 5, 0.2);
    },
  },
  { // 20.2 "One by one, they all gave the same wrong answer."
    start: 20.1, title: 'The Same Wrong Answer', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, ob = S.at('One'), wr = S.at('wrong');
      plate(ctx, S, { alpha: 0.06, seed: 17 });
      cards(ctx, k, P, W / 2, 220, 0.75, { hl: 'C' });
      row(ctx, S, u, {
        mood: i => ROW[i].real ? (u > wr ? 'worry' : 'calm') : 'calm',
        look: i => ROW[i].real ? [-0.8, 0] : [0.3, -0.6],
        after: (c, i, x) => { if (ROW[i].real) return; const order = i < 5 ? i : 5; const p = pop(u, ob + order * 0.45, 0.2); if (p) { c.save(); c.translate(x, 560); c.scale(p, p); k.rect(c, -34, -30, 68, 60, P.paperLight, P.ink, 4, 20); k.text(c, 'C', 0, 3, 40, { font: 'display', color: P.red }); c.restore(); } },
      });
      for (let i = 0; i < 3; i++) { const f = (u * 1.3 + i / 3) % 1; if (u > wr) k.ellipse(ctx, 700 + i * 22, 640 + f * 60, 6, 9, 0, P.sky, P.ink, 2); }
    },
  },
  { // 24.64 "Three out of four real people went along at least once."
    start: 24.4, title: '3 Out of 4 Went Along', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, th = S.at('Three'), wa = S.at('went');
      plate(ctx, S, { alpha: 0.08, seed: 24 });
      for (let i = 0; i < 4; i++) {
        const x = 170 + i * 200, went = i < 3 && u > wa + i * 0.15;
        k.figure(ctx, x, 900, { s: 1.0, face: 1, look: [0.3, 0], mood: went ? 'worry' : 'calm', hair: ['bob', 'slick', 'bun', 'slick'][i], skirt: i % 2 === 0, color: went ? P.redDark : P.ink });
        if (went) k.text(ctx, '"C"', x, 380, 50, { font: 'display', color: P.red });
      }
      const p = pop(u, th, 0.4); if (p) { ctx.save(); ctx.translate(W / 2, 170); ctx.scale(p, p); k.text(ctx, '3 OUT OF 4', 0, 0, 90, { font: 'display', color: P.red }); ctx.restore(); }
      k.scrawl(ctx, 'at least once', W / 2, 990, 56, tween(u, wa + 0.6, wa + 1.2));
    },
  },
  { // 29.96 "Here's the trick. Your brain hates standing out,"
    start: 28.5, title: 'Standing Out', trans: 'bleed',
    draw(ctx, u, S) {
      const { k, P, W } = S, ht = S.at('hates'), so = S.at('standing');
      plate(ctx, S, { alpha: 0.08, seed: 28 });
      k.stamp(ctx, 'THE TRICK', 220, 110, 42, tween(u, 0.05, 0.25), -0.1);
      // a perfectly mirrored row… and one who doesn't match
      for (let i = 0; i < 7; i++) { const x = 90 + i * 127, odd = i === 3; k.figure(ctx, x, 950, { s: odd ? 1.0 : 0.85, face: i < 3 ? 1 : -1, look: odd ? [Math.sin(u * 5) * 0.9, 0] : [0, 0], mood: odd && u > so ? 'worry' : 'calm', color: odd ? P.red : P.ink, bob: odd ? Math.abs(Math.sin(u * 6)) * 6 * tween(u, so, so + 0.3) : 0, shadow: false }); }
      k.scrawl(ctx, 'standing out = danger (to your brain)', W / 2, 330, 46, tween(u, so, so + 0.8));
    },
  },
  { // 32.64 "but when just one other person gave the right answer, going along dropped sharply."
    start: 32.5, title: 'Just One Ally', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, on = S.at('one'), ra = S.at('right'), dr = S.at('dropped');
      plate(ctx, S, { alpha: 0.06, seed: 17 });
      cards(ctx, k, P, 230, 200, 0.6, { hl: 'B' });
      row(ctx, S, u, {
        mood: i => ROW[i].real ? (u > ra ? 'smile' : 'worry') : 'calm',
        look: i => ROW[i].real ? [-0.6, 0] : [0.3, -0.6],
        after: (c, i, x) => { if (ROW[i].real) return; const ally = i === 2; const p = pop(u, ally ? ra - 0.2 : 0, 0.2); if (p) { c.save(); c.translate(x, 560); c.scale(p, p); k.rect(c, -34, -30, 68, 60, P.paperLight, ally ? P.red : P.ink, ally ? 6 : 4, 20); k.text(c, ally ? 'B' : 'C', 0, 3, 40, { font: 'display', color: ally ? P.red : P.inkSoft }); c.restore(); } },
      });
      k.scrawl(ctx, 'one ally', 344, 470, 52, tween(u, ra, ra + 0.4));
      // going along: a bar that drops
      const d = tween(u, dr - 0.1, dr + 0.6, ease.outBounce);
      k.rect(ctx, 720, 120, 160, 260, null, P.greyLight, 3, 6);
      k.rect(ctx, 720, 120 + 260 * lerp(0.1, 0.85, d), 160, 260 * lerp(0.9, 0.15, d), P.red, P.ink, 3, 6);
      k.text(ctx, 'GOING ALONG', 800, 410, 26, {});
      k.arrow(ctx, 920, 150, 920, 360, tween(u, dr, dr + 0.4), P.red, 6, 0);
    },
  },
  { // 38.3 "So, if you know you're right, say it. And if someone stands alone, stand with them."
    start: 38.3, title: 'Stand With Them', trans: 'blink',
    draw(ctx, u, S) {
      const { k, P, W } = S, sy = S.at('say'), sa = S.at('stands'), sw = S.at(/^stand$/i);
      plate(ctx, S, { alpha: 0.1, seed: 38 });
      const sayk = pop(u, sy - 0.1, 0.3);
      k.figure(ctx, 230, 1010, { s: 1.05, face: 1, look: [0.5, -0.3], mood: u > sy ? 'smile' : 'calm', armR: [lerp(0.3, 2.9, tween(u, sy - 0.3, sy, ease.outBack)), 0.1] });
      if (sayk) { ctx.save(); ctx.translate(250, 330); ctx.scale(sayk, sayk); k.rect(ctx, -90, -60, 180, 120, P.paperLight, P.red, 6, 30); k.text(ctx, '"B."', 0, 4, 66, { font: 'display', color: P.red }); ctx.restore(); }
      // someone alone on the right; you walk over to stand beside them
      const walk = tween(u, sw - 0.6, sw + 0.4);
      k.figure(ctx, 780, 1010, { hair: 'bob', skirt: true, s: 1.0, face: -1, look: [-0.6, 0], mood: walk > 0.8 ? 'smile' : 'worry' });
      if (u > sa - 0.3) k.figure(ctx, lerp(480, 650, walk), 1010, { hat: 'cap', s: 1.0, face: 1, walk: walk > 0 && walk < 1 ? u * 1.6 : 0, look: [1, 0], mood: 'smile', armR: walk >= 1 ? [1.2, 0.1] : undefined });
      k.heart(ctx, 715, 520, 50, P.red, ease.outBack(tween(u, sw + 0.3, sw + 0.7)));
      k.scrawl(ctx, 'stand with them', 700, 240, 58, tween(u, sw, sw + 0.5));
    },
  },
  { // 45.4 "Follow for more mind tricks." → the case-file cover
    start: 45.14, title: 'More Mind Tricks', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      ctx.save(); plate(ctx, S, { alpha: 0.1, seed: 38 }); k.figure(ctx, 650, 1010, { hat: 'cap', s: 1.0, face: 1, mood: 'smile' }); k.figure(ctx, 780, 1010, { hair: 'bob', skirt: true, s: 1.0, face: -1, mood: 'smile' }); ctx.restore();
      inkReveal(ctx, S, tween(u, 0.1, 0.8, ease.linear), c => caseCover(c, S, u - 0.1, { handle: meta.brand.handle, caseNo: '1951', tagline: meta.brand.tagline }));
    },
  },
];

export const sfx = [
  { t: 0.2, type: 'pop', gain: 0.4 }, { t: 0.32, type: 'pop', gain: 0.4, pitch: 1.15 }, { t: 0.44, type: 'pop', gain: 0.4, pitch: 1.3 }, { t: 0.56, type: 'pop', gain: 0.4, pitch: 1.45 }, { t: 0.68, type: 'pop', gain: 0.4, pitch: 1.6 },
  { t: 1.0, type: 'heartbeat', gain: 0.45 },
  { t: 4.2, type: 'stamp', gain: 0.7 },
  { t: 5.1, type: 'splat', gain: 0.6 },
  { t: 5.45, type: 'stamp', gain: 0.6 },
  { t: 7.2, type: 'pen', gain: 0.45 },
  { t: 8.7, type: 'paper', gain: 0.45 },
  { t: 10.3, type: 'whoosh', gain: 0.35 },
  { t: 10.5, type: 'pen', gain: 0.45 },
  { t: 12.3, type: 'pen', gain: 0.5 },
  { t: 12.4, type: 'chime', gain: 0.4, pitch: 1.2 },
  { t: 13.3, type: 'fold', gain: 0.45 },
  { t: 15.3, type: 'pop', gain: 0.45 },
  { t: 17.05, type: 'whoosh', gain: 0.35 },
  { t: 18.8, type: 'stamp', gain: 0.4 }, { t: 18.9, type: 'stamp', gain: 0.4 }, { t: 19.0, type: 'stamp', gain: 0.4 }, { t: 19.1, type: 'stamp', gain: 0.4 },
  { t: 20.1, type: 'whoosh', gain: 0.3 },
  { t: 20.2, type: 'pop', gain: 0.45 }, { t: 20.65, type: 'pop', gain: 0.45 }, { t: 21.1, type: 'pop', gain: 0.45 }, { t: 21.55, type: 'pop', gain: 0.45 }, { t: 22.0, type: 'pop', gain: 0.45 }, { t: 22.45, type: 'pop', gain: 0.45 },
  { t: 22.8, type: 'heartbeat', gain: 0.5 },
  { t: 24.4, type: 'fold', gain: 0.45 },
  { t: 24.7, type: 'gong', gain: 0.35 },
  { t: 27.4, type: 'pen', gain: 0.45 },
  { t: 28.5, type: 'splat', gain: 0.6 },
  { t: 28.6, type: 'stamp', gain: 0.4 },
  { t: 31.2, type: 'buzz', gain: 0.35 },
  { t: 32.5, type: 'fold', gain: 0.45 },
  { t: 34.6, type: 'pop', gain: 0.6, pitch: 1.3 },
  { t: 34.8, type: 'chime', gain: 0.45, pitch: 1.2 },
  { t: 36.4, type: 'flop', gain: 0.4 },
  { t: 38.3, type: 'blink', gain: 0.5 },
  { t: 40.5, type: 'pop', gain: 0.55 },
  { t: 43.0, type: 'slide', gain: 0.4 },
  { t: 44.0, type: 'chime', gain: 0.45 },
  { t: 45.2, type: 'splat', gain: 0.8 },
  { t: 45.6, type: 'fold', gain: 0.4 },
  { t: 46.4, type: 'stamp', gain: 0.8 },
  { t: 47.3, type: 'moth', gain: 0.35 },
  { t: 48.6, type: 'bell', gain: 0.3 },
];

export const music = {
  kit: 'mind', bpm: 94, root: 'G', scale: 'minor', gain: 0.3,
  sections: [
    { from: 0, to: 5.1, mood: 'tense' },
    { from: 5.1, to: 17.05, mood: 'groove' },
    { from: 17.05, to: 28.5, mood: 'tense' },
    { from: 28.5, to: 38.3, mood: 'drive' },
    { from: 38.3, to: 45.14, mood: 'triumph' },
    { from: 45.14, to: 49.4, mood: 'end' },
  ],
};
