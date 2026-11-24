// "The Tuskegee Study" — an INKBLOT case file (psychology, MindTrace).
// US Public Health Service "Study of Untreated Syphilis in the Negro Male",
// Macon County, Alabama, 1932–1972: 399 men with syphilis (and 201 controls) were
// told they had "bad blood" and never treated, even after penicillin (standard by
// 1947). Free meals, rides and burial insurance kept them in. Peter Buxtun took it
// to the press in July 1972; the study ended that year. The men are drawn only as
// dignified silhouettes, never likenesses.
// u = seconds since the scene started; S.at('word') = when that word is said.
import { clamp, lerp, ease, tween, rng, TAU, shake, pop } from '../../lib/core.mjs';
import { plate, caseCover, inkReveal } from '../../styles/inkblot/scenes.mjs';

export const meta = {
  title: 'The Tuskegee Study',
  slug: 'tuskegee-inkblot',
  style: 'inkblot',
  width: 1080, height: 1920, fps: 30,
  duration: 39.6,
  voice: 'voice.mp3',
  seed: 229,
  captionChars: 24,
  caseLine: 'THE MIND FILES  ·  CASE No. 1932  ·  CONFIDENTIAL',
  brandKit: 'mindtrace', // MindTrace (brand/mindtrace/): logo, handle, tagline, outro text
  outro: { at: 37.3 },
};

const DOC = { labcoat: true, glasses: true, hair: 'slick' };
const MEN = [{ hat: 'cap' }, { hat: 'bowler' }, {}, { hat: 'cap' }, { hat: 'bowler' }, {}];

function men(ctx, k, P, x0, y, n, s, t, o = {}) {
  for (let i = 0; i < n; i++) k.figure(ctx, x0 + i * (o.gap || 130), y, { ...MEN[i % MEN.length], s, face: o.face || 1, look: o.look || [0, 0], mood: o.mood || 'calm', blink: 0.7 + 0.3 * Math.sin(t * 0.7 + i), bob: Math.sin(t * 1.2 + i) * 1.5, color: o.color || P.ink, shadow: false });
}
function clipboard(c, k, P) { k.rect(c, -30, -44, 60, 80, '#b8975c', P.ink, 3, 4); k.rect(c, -22, -32, 44, 60, P.paperLight, null, 0, 2); }
// a small vial; label on it
function vial(ctx, k, P, x, y, s, label, glow = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (glow) { const g = ctx.createRadialGradient(0, -60, 10, 0, -60, 220); g.addColorStop(0, `rgba(255,240,190,${0.7 * glow})`); g.addColorStop(1, 'rgba(255,240,190,0)'); ctx.fillStyle = g; ctx.fillRect(-240, -280, 480, 440); }
  k.rect(ctx, -46, -150, 92, 160, P.paperLight, P.ink, 5, 14);
  k.rect(ctx, -46, -80, 92, 90, P.ochre, null, 0, 0);
  k.rect(ctx, -46, -150, 92, 160, null, P.ink, 5, 14);
  k.rect(ctx, -30, -190, 60, 44, P.inkSoft, P.ink, 3, 6);
  k.rect(ctx, -56, -126, 112, 40, P.card, P.ink, 3, 4);
  k.text(ctx, label, 0, -105, 18, { font: 'display', max: 104 });
  ctx.restore();
}
function car(ctx, k, P, x, y, s, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  k.poly(ctx, [[-150, -40], [-120, -100], [60, -100], [100, -40], [160, -36], [160, 10], [-160, 10], [-160, -36]], P.inkSoft, P.ink, 4);
  k.rect(ctx, -100, -90, 70, 46, P.sky, P.ink, 3, 4); k.rect(ctx, -20, -90, 70, 46, P.sky, P.ink, 3, 4);
  for (const wx of [-100, 100]) { k.circle(ctx, wx, 12, 30, P.ink); k.circle(ctx, wx, 12, 12, P.greyLight); k.line(ctx, wx, 12, wx + Math.cos(t * 8) * 12, 12 + Math.sin(t * 8) * 12, P.ink, 3); }
  ctx.restore();
}
function clinic(ctx, k, P, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  k.poly(ctx, [[-180, -220], [0, -320], [180, -220]], P.inkSoft, P.ink, 4);
  k.rect(ctx, -170, -220, 340, 220, P.card, P.ink, 5);
  k.rect(ctx, -40, -140, 80, 140, P.redDark, P.ink, 4, 3);
  k.rect(ctx, -140, -170, 70, 60, P.sky, P.ink, 4); k.rect(ctx, 70, -170, 70, 60, P.sky, P.ink, 4);
  k.text(ctx, 'CLINIC', 0, -190, 30, { font: 'display' });
  ctx.restore();
}

export const scenes = [
  { // 0.02 "For 40 years, U.S. government doctors watched hundreds of Black men with syphilis and didn't treat them."
    start: 0, title: '40 Years Untreated',
    draw(ctx, u, S) {
      const { k, P, W } = S, yr = S.at('years'), wa = S.at('watched'), tr = S.at('treat');
      plate(ctx, S, { alpha: 0.12, seed: 3 });
      S.cam(lerp(1.05, 1.0, tween(u, 0, 7)), W / 2, 560);
      const y = Math.floor(lerp(1932, 1972, tween(u, 0.1, yr + 1.2, ease.linear)));
      k.text(ctx, String(y), W / 2, 150, 110, { font: 'display', color: P.red });
      k.scrawl(ctx, '40 years', W / 2, 270, 54, tween(u, yr, yr + 0.4));
      men(ctx, k, P, 140, 1040, 6, 0.72, S.t, { gap: 132, look: [0, 0.2] });
      const d = tween(u, wa - 0.5, wa + 0.2);
      for (const [dx, i] of [[260, 0], [700, 1]]) { ctx.save(); ctx.globalAlpha = d; k.figure(ctx, dx, 720, { ...DOC, s: 0.75, face: i ? -1 : 1, look: [i ? -0.4 : 0.4, 0.8], mood: 'calm', armR: [1.0, 1.2], holdR: c => clipboard(c, k, P), shadow: false }); ctx.restore(); }
      k.scrawl(ctx, 'watched', W / 2, 400, 52, tween(u, wa, wa + 0.4), { rot: -0.04 });
      k.stamp(ctx, 'UNTREATED', W / 2, 860, 58, tween(u, tr, tr + 0.2), -0.06);
    },
  },
  { // 7.48 "It was the Tuskegee study, starting in 1932 in Alabama."
    start: 7.35, title: 'Tuskegee, Alabama', trans: 'bleed',
    draw(ctx, u, S) {
      const { k, P, W } = S, tu = S.at('Tuskegee'), yr = S.at('1932'), al = S.at('Alabama');
      plate(ctx, S, { alpha: 0.08, seed: 7 });
      ctx.save(); ctx.translate(W / 2, 330);
      k.rect(ctx, -400, -150, 800, 300, '#dcbd7e', P.ink, 5, 6);
      k.text(ctx, 'U.S. PUBLIC HEALTH SERVICE', 0, -100, 28, { font: 'type', color: P.inkSoft });
      k.typeOn(ctx, 'THE TUSKEGEE STUDY', 0, -10, 60, tween(u, tu - 0.1, tu + 0.8), { font: 'type', align: 'center' });
      k.text(ctx, '"untreated syphilis"', 0, 80, 32, { font: 'type', color: P.inkSoft });
      ctx.restore();
      k.stamp(ctx, '1932', 800, 110, 60, tween(u, yr, yr + 0.25), 0.1);
      clinic(ctx, k, P, 300, 1020, 1.0);
      const sp = pop(u, al - 0.2, 0.35);
      if (sp) { ctx.save(); ctx.translate(720, 1040); ctx.scale(sp, sp); k.sign(ctx, 0, -120, 300, 110, 'ALABAMA', { post: 120 }); ctx.restore(); }
      k.scrawl(ctx, 'Macon County', 720, 700, 44, tween(u, al + 0.2, al + 0.7), { rot: -0.05 });
    },
  },
  { // 12.1 "The men were told they had bad blood."
    start: 12.0, title: '"Bad Blood"', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, tl = S.at('told'), bb = S.at('bad');
      plate(ctx, S, { alpha: 0.08, seed: 12 });
      k.figure(ctx, 280, 1040, { ...DOC, s: 1.05, face: 1, look: [1, 0], mood: 'calm', armR: [1.1, 1.3], holdR: c => clipboard(c, k, P) });
      k.figure(ctx, 700, 1040, { hat: 'cap', s: 1.05, face: -1, look: [-1, 0], mood: u > bb + 0.4 ? 'worry' : 'calm' });
      const b = pop(u, bb - 0.2, 0.35);
      if (b) { ctx.save(); ctx.translate(420, 470); ctx.scale(b, b); k.rect(ctx, -170, -70, 340, 140, P.paperLight, P.ink, 4, 40); k.poly(ctx, [[-40, 70], [-80, 120], [0, 70]], P.paperLight, P.ink, 4); k.text(ctx, '"bad blood"', 0, 4, 52, { font: 'hand', color: P.red }); ctx.restore(); }
      k.scrawl(ctx, 'the truth: syphilis', 640, 250, 46, tween(u, bb + 0.5, bb + 1.0), { rot: -0.05 });
      k.penLine(ctx, [[420, 300], [500, 280], [560, 300]], tween(u, bb + 0.8, bb + 1.1), P.red, 4);
      k.scrawl(ctx, 'never told', 720, 640, 44, tween(u, bb + 1.0, bb + 1.4));
    },
  },
  { // 15.12 "By the 1940s, penicillin was the cure. They still didn't get it."
    start: 15.0, title: 'The Cure, Withheld', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, yr = S.at('1940s'), pe = S.at('penicillin'), st = S.at('still');
      plate(ctx, S, { alpha: 0.08, seed: 15 });
      k.stamp(ctx, '1940s', 200, 120, 60, tween(u, yr, yr + 0.25), -0.1);
      // a glass cabinet with the cure inside, locked
      k.rect(ctx, 290, 260, 360, 560, 'rgba(200,220,240,0.35)', P.ink, 8, 10);
      k.line(ctx, 470, 260, 470, 820, P.ink, 5);
      vial(ctx, k, P, 470, 640, 1.2, 'PENICILLIN', tween(u, pe, pe + 0.6));
      k.scrawl(ctx, 'the cure', 800, 330, 52, tween(u, pe + 0.3, pe + 0.7));
      const lk = tween(u, st - 0.3, st + 0.1, ease.outBack);
      if (lk > 0) k.padlock(ctx, 470, lerp(400, 560, lk), 0.8, 0, P.redDark);
      k.stamp(ctx, 'WITHHELD', W / 2, 930, 64, tween(u, st + 0.4, st + 0.6), -0.06);
      men(ctx, k, P, 120, 1050, 2, 0.45, S.t, { gap: 90, look: [1, -0.4] });
      men(ctx, k, P, 730, 1050, 2, 0.45, S.t, { gap: 90, face: -1, look: [-1, -0.4] });
    },
  },
  { // 20.44 "Here's the trick. Free meals, free rides, free burial insurance."
    start: 20.35, title: 'Free, Free, Free', trans: 'bleed',
    draw(ctx, u, S) {
      const { k, P, W } = S, ml = S.at('meals'), rd = S.at('rides'), bu = S.at('burial');
      plate(ctx, S, { alpha: 0.08, seed: 20 });
      k.stamp(ctx, 'THE TRICK', 220, 110, 44, tween(u, 0.05, 0.25), -0.1);
      const card = (at, y, draw, label) => { const p = pop(u, at - 0.25, 0.35); if (!p) return; ctx.save(); ctx.translate(W / 2, y); ctx.scale(p, p); k.rect(ctx, -380, -130, 760, 260, P.paperLight, P.ink, 5, 16); draw(); k.text(ctx, label, 120, 0, 54, { font: 'display', color: P.red }); ctx.restore(); };
      card(ml, 310, () => { k.plate(ctx, -220, 30, 2.0, FOODC); }, 'FREE MEALS');
      card(rd, 600, () => { car(ctx, k, P, -220, 40, 0.75, S.t); }, 'FREE RIDES');
      card(bu, 890, () => { k.rect(ctx, -290, -90, 140, 180, P.card, P.ink, 4, 4); for (let i = 0; i < 5; i++) k.rect(ctx, -270, -60 + i * 28, 100, 8, P.greyLight, null, 0, 2); k.circle(ctx, -180, 60, 18, P.red, P.ink, 2); }, 'FREE BURIAL\nINSURANCE'.split('\n')[0]);
      if (u > bu) k.text(ctx, 'INSURANCE', W / 2 + 120, 950, 40, { font: 'display', color: P.red });
    },
  },
  { // 26.18 "Kindness kept them coming back."
    start: 26.05, title: '"Kindness"', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, ki = S.at('Kindness'), cb = S.at('coming');
      plate(ctx, S, { alpha: 0.1, seed: 26 });
      clinic(ctx, k, P, 680, 1020, 1.0);
      // men keep walking back toward the clinic, year after year
      for (let i = 0; i < 3; i++) {
        const ph = (u * 0.35 + i / 3) % 1;
        k.figure(ctx, lerp(40, 560, ph), 1040, { ...MEN[i], s: 0.8, face: 1, walk: u * 1.6 + i, look: [1, 0], mood: 'calm', color: P.ink });
      }
      k.text(ctx, String(Math.floor(lerp(1933, 1971, tween(u, 0, 2.3, ease.linear)))), 760, 600, 64, { font: 'display', color: P.red });
      k.text(ctx, 'year after year', 760, 660, 28, { color: P.inkSoft });
      k.scrawl(ctx, '"kindness"', 330, 300, 64, tween(u, ki, ki + 0.5), { rot: -0.05 });
      k.scrawl(ctx, 'kept them coming back', W / 2, 440, 46, tween(u, cb, cb + 0.6));
    },
  },
  { // 28.82 "In 1972, a whistleblower went to the press. The study ended that year."
    start: 28.7, title: 'Exposed, 1972', trans: 'blink',
    draw(ctx, u, S) {
      const { k, P, W } = S, yr = S.at('1972'), wb = S.at('whistleblower'), pr = S.at('press'), en = S.at('ended');
      plate(ctx, S, { alpha: 0.08, seed: 28 });
      k.stamp(ctx, '1972', 800, 110, 60, tween(u, yr, yr + 0.25), 0.1);
      // the whistleblower hands papers over
      k.figure(ctx, 200, 1040, { s: 0.95, face: 1, look: [1, 0], mood: 'worry', tie: '#c61f2a', armR: [lerp(0.3, 1.5, tween(u, wb, wb + 0.5)), 0.2], holdR: c => k.rect(c, -10, -24, 60, 44, P.paperLight, P.ink, 3, 2) });
      k.scrawl(ctx, 'whistleblower', 230, 560, 46, tween(u, wb, wb + 0.5), { rot: -0.05 });
      // the front page
      const n = tween(u, pr - 0.2, pr + 0.3, ease.outBack);
      if (n > 0) {
        ctx.save(); ctx.translate(620, 520); ctx.rotate(0.04); ctx.scale(n, n);
        k.rect(ctx, -240, -300, 480, 600, P.card, P.ink, 5, 4);
        k.text(ctx, 'THE DAILY RECORD', 0, -262, 30, { font: 'serif' }); k.line(ctx, -220, -236, 220, -236, P.ink, 3);
        ['SYPHILIS VICTIMS', 'IN U.S. STUDY', 'WENT UNTREATED', 'FOR 40 YEARS'].forEach((l, i) => k.text(ctx, l, 0, -190 + i * 52, 40, { font: 'display', max: 440 }));
        for (let i = 0; i < 7; i++) k.rect(ctx, -210, 40 + i * 30, 420, 10, P.greyLight, null, 0, 2);
        ctx.restore();
      }
      k.stamp(ctx, 'STUDY ENDED', 620, 900, 56, tween(u, en, en + 0.2), -0.06);
      const f = tween(u, en + 0.7, en + 1.1);
      if (f > 0) { ctx.save(); ctx.globalAlpha = f; k.text(ctx, 'It led to US research-consent rules (1974).', 640, 1000, 26, { color: P.inkSoft, max: 540 }); ctx.restore(); }
    },
  },
  { // 35.02 "Follow for more dark psychology." → the case-file cover
    start: 34.85, title: 'More Dark Psychology', trans: 'cut',
    draw(ctx, u, S) {
      ctx.save(); plate(ctx, S, { alpha: 0.1, seed: 28 }); ctx.restore();
      inkReveal(ctx, S, tween(u, 0.1, 0.8, ease.linear), c => caseCover(c, S, u - 0.1, { handle: meta.brand.handle, caseNo: '1932', tagline: meta.brand.tagline }));
    },
  },
];

// a plate of food for the "free meals" card
function FOODC(ctx) {
  ellipse_(ctx, -18, -12, 22, 14, '#a06a3c'); ellipse_(ctx, 16, -10, 18, 12, '#8db498'); ellipse_(ctx, 0, -22, 14, 10, '#ddb14d');
}
function ellipse_(ctx, x, y, rx, ry, c) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, TAU); ctx.fillStyle = c; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#16141a'; ctx.stroke(); }

export const sfx = [
  { t: 0.2, type: 'tick', gain: 0.35 },
  { t: 1.5, type: 'pen', gain: 0.4 },
  { t: 2.6, type: 'paper', gain: 0.35 },
  { t: 3.2, type: 'pen', gain: 0.4 },
  { t: 6.2, type: 'stamp', gain: 0.75 },
  { t: 7.35, type: 'splat', gain: 0.5 },
  { t: 7.9, type: 'typewriter', gain: 0.45 },
  { t: 9.55, type: 'stamp', gain: 0.7 },
  { t: 10.6, type: 'pop', gain: 0.45 },
  { t: 12.0, type: 'fold', gain: 0.45 },
  { t: 13.0, type: 'pop', gain: 0.45 },
  { t: 13.7, type: 'pen', gain: 0.4 },
  { t: 15.0, type: 'whoosh', gain: 0.35 },
  { t: 15.4, type: 'stamp', gain: 0.65 },
  { t: 16.5, type: 'chime', gain: 0.35 },
  { t: 18.3, type: 'clank', gain: 0.55 },
  { t: 19.0, type: 'stamp', gain: 0.8 },
  { t: 20.35, type: 'splat', gain: 0.5 },
  { t: 20.45, type: 'stamp', gain: 0.45 },
  { t: 21.65, type: 'pop', gain: 0.45 },
  { t: 22.7, type: 'pop', gain: 0.45 },
  { t: 23.95, type: 'pop', gain: 0.45 },
  { t: 26.05, type: 'fold', gain: 0.45 },
  { t: 26.2, type: 'pen', gain: 0.45 },
  { t: 27.4, type: 'pen', gain: 0.4 },
  { t: 28.7, type: 'blink', gain: 0.45 },
  { t: 28.95, type: 'stamp', gain: 0.7 },
  { t: 30.5, type: 'paper', gain: 0.4 },
  { t: 31.45, type: 'typewriter', gain: 0.4 },
  { t: 32.95, type: 'stamp', gain: 0.8 },
  { t: 34.9, type: 'splat', gain: 0.75 },
  { t: 35.3, type: 'fold', gain: 0.4 },
  { t: 36.0, type: 'stamp', gain: 0.75 },
  { t: 37.0, type: 'moth', gain: 0.3 },
  { t: 39.0, type: 'bell', gain: 0.25 },
];

export const music = {
  kit: 'mind', bpm: 72, root: 'D', scale: 'minor', gain: 0.28,
  sections: [
    { from: 0, to: 12.0, mood: 'sad' },
    { from: 12.0, to: 20.35, mood: 'tense' },
    { from: 20.35, to: 28.7, mood: 'sad' },
    { from: 28.7, to: 34.85, mood: 'drive' },
    { from: 34.85, to: 39.6, mood: 'end' },
  ],
};
