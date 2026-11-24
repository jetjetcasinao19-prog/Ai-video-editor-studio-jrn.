// "COINTELPRO" — an INKBLOT case file (psychology, MindTrace).
// The FBI's COINTELPRO (1956–1971): the 1964 anonymous letter to Dr. King, fake
// letters, rumors and turning activists against each other; exposed after the
// March 8, 1971 break-in at the FBI office in Media, Pennsylvania, during the
// Ali–Frazier "Fight of the Century". Real people are named, never drawn.
// u = seconds since the scene started; S.at('word') = when that word is said.
import { clamp, lerp, ease, tween, rng, TAU, shake, pop } from '../../lib/core.mjs';
import { plate, night, caseCover, inkReveal } from '../../styles/inkblot/scenes.mjs';

export const meta = {
  title: 'COINTELPRO',
  slug: 'cointelpro-inkblot',
  style: 'inkblot',
  width: 1080, height: 1920, fps: 30,
  duration: 40.6,
  voice: 'voice.mp3',
  seed: 223,
  captionChars: 24,
  caseLine: 'THE MIND FILES  ·  CASE No. 1971  ·  CONFIDENTIAL',
  brandKit: 'mindtrace', // MindTrace (brand/mindtrace/): logo, handle, tagline, outro text
  outro: { at: 38.3 },
};

const AGENT = { hat: 'bowler', tie: '#16141a' };

// an envelope; o.to / o.from written on it, o.open 0..1 lifts the flap
function envelope(ctx, k, P, x, y, w, o = {}) {
  const h = w * 0.62;
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0);
  k.rect(ctx, -w / 2, -h / 2, w, h, o.fill || P.paperLight, P.ink, 5, 6);
  k.poly(ctx, [[-w / 2, -h / 2], [0, -h / 2 + h * 0.55 * (1 - 2 * (o.open || 0))], [w / 2, -h / 2]], o.flap || P.card, P.ink, 4);
  if (o.to) k.text(ctx, o.to, 0, h * 0.12, w * 0.055, { font: 'type', max: w * 0.85 });
  if (o.from) k.text(ctx, o.from, -w / 2 + 24, -h / 2 + 30, w * 0.04, { font: 'hand', align: 'left', color: o.fromColor || P.inkSoft, max: w * 0.5 });
  if (o.stamp) { k.rect(ctx, w / 2 - 90, -h / 2 + 18, 64, 76, P.redLight, P.ink, 3, 2); }
  ctx.restore();
}
// a letter page with every line blacked out
function blackedLetter(ctx, k, P, x, y, w, h, t, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0);
  k.rect(ctx, -w / 2, -h / 2, w, h, P.paperLight, P.ink, 4, 4);
  const R = rng(o.seed || 3);
  for (let i = 0; i < 9; i++) {
    const ww = (w - 80) * (0.55 + R() * 0.45), yy = -h / 2 + 60 + i * 50;
    k.rect(ctx, -w / 2 + 40, yy - 12, ww * clamp(t * 1.5 - i * 0.08), 26, P.ink, null, 0, 2);
  }
  ctx.restore();
}
// a TV with two boxer silhouettes trading punches (generic, not likenesses)
function tv(ctx, k, P, x, y, s, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  k.rect(ctx, -170, -130, 340, 250, '#3a3540', P.ink, 6, 18);
  const g = 0.75 + 0.25 * Math.sin(t * 13);
  k.rect(ctx, -140, -105, 240, 200, `rgba(210,225,240,${g})`, P.ink, 3, 14);
  k.line(ctx, -130, 40, 90, 40, P.inkSoft, 3);
  const p = Math.max(0, Math.sin(t * 7));
  for (const [bx, f, ph] of [[-55, 1, 0], [35, -1, 1]]) {
    const jab = ph ? Math.max(0, Math.sin(t * 7 + 2)) : p;
    k.circle(ctx, bx, -40, 16, P.ink); k.rect(ctx, bx - 14, -24, 28, 56, P.ink, null, 0, 8);
    k.line(ctx, bx, -10, bx + f * (22 + jab * 24), -24, P.ink, 9); k.circle(ctx, bx + f * (24 + jab * 24), -26, 10, P.red);
  }
  k.rect(ctx, 112, -60, 22, 22, P.grey, P.ink, 2, 11); k.rect(ctx, 112, -20, 22, 22, P.grey, P.ink, 2, 11);
  k.line(ctx, -60, -130, -110, -200, P.ink, 4); k.line(ctx, 60, -130, 110, -200, P.ink, 4);
  ctx.restore();
}
// a newspaper with a headline
function newspaper(ctx, k, P, x, y, s, head, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  k.rect(ctx, -200, -260, 400, 520, P.card, P.ink, 5, 4);
  k.text(ctx, 'THE DAILY RECORD', 0, -220, 30, { font: 'serif' });
  k.line(ctx, -180, -194, 180, -194, P.ink, 3);
  k.text(ctx, head, 0, -140, 48, { font: 'display', max: 360 });
  k.rect(ctx, -180, -90, 170, 130, P.greyLight, P.ink, 2);
  for (let i = 0; i < 9; i++) k.rect(ctx, i < 4 ? 10 : -180, -86 + i * 30, i < 4 ? 170 : 360, 10, P.greyLight, null, 0, 2);
  ctx.restore();
}

export const scenes = [
  { // 0.18 "The FBI once sent Martin Luther King Jr. an anonymous letter, urging him to kill himself."
    start: 0, title: 'An Anonymous Letter',
    draw(ctx, u, S) {
      const { k, P, W } = S, ml = S.at('Martin'), an = S.at('anonymous'), ur = S.at('urging');
      plate(ctx, S, { alpha: 0.12, seed: 3 });
      S.cam(lerp(1.06, 1.0, tween(u, 0, 6.8)), W / 2, 560);
      const open = tween(u, an + 0.6, an + 1.2);
      blackedLetter(ctx, k, P, W / 2 + 10, lerp(620, 430, open), 560, 520, tween(u, ur - 0.6, ur + 0.6), { rot: 0.03 });
      envelope(ctx, k, P, W / 2, 700, 700, { to: ml < u + 0.2 ? 'Dr. Martin Luther King Jr.' : '', from: 'no return address', open, stamp: true, rot: -0.02 });
      k.stamp(ctx, 'ANONYMOUS', 740, 140, 52, tween(u, an, an + 0.2), 0.1);
      k.scrawl(ctx, 'from the FBI', 260, 130, 54, tween(u, 0.2, 0.6), { rot: -0.06 });
      // a gentle support note
      const n = tween(u, ur + 0.6, ur + 1.0);
      if (n > 0) { ctx.save(); ctx.globalAlpha = n; k.rect(ctx, 150, 960, 640, 76, P.paperLight, P.red, 3, 12); k.text(ctx, 'Struggling? In the US, call or text 988.', W / 2, 1000, 28, { color: P.redDark }); ctx.restore(); }
    },
  },
  { // 7.5 "It was part of a secret program called COINTELPRO."
    start: 7.35, title: 'A Secret Program', trans: 'bleed',
    draw(ctx, u, S) {
      const { k, P, W } = S, se = S.at('secret'), co = S.at('COINTELPRO');
      plate(ctx, S, { alpha: 0.08, seed: 7 });
      ctx.save(); ctx.translate(W / 2, 600); ctx.rotate(-0.03);
      k.poly(ctx, [[-380, -380], [-340, -430], [-120, -430], [-80, -380]], '#cfae6e', P.ink, 4);
      k.rect(ctx, -380, -380, 760, 760, '#dcbd7e', P.ink, 5, 6);
      k.text(ctx, 'FIELD FILE', -230, -404, 28, { font: 'type' });
      k.typeOn(ctx, 'COINTELPRO', 0, -220, 84, tween(u, co - 0.1, co + 0.9), { font: 'type', align: 'center' });
      k.text(ctx, '1956 – 1971', 0, -100, 46, { font: 'type', color: P.inkSoft });
      for (let i = 0; i < 6; i++) { k.rect(ctx, -300, 0 + i * 50, 600, 8, P.greyLight, null, 0, 3); k.rect(ctx, -300 + (i * 97) % 200, -10 + i * 50, 260 + (i * 53) % 180, 28, P.ink, null, 0, 2); }
      ctx.restore();
      k.stamp(ctx, 'SECRET', 760, 130, 60, tween(u, se, se + 0.2), -0.1);
    },
  },
  { // 11.44 "The FBI wrote fake letters, spread rumors, and turned activists against each other."
    start: 11.3, title: 'Letters, Rumors, Rifts', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, fk = S.at('fake'), ru = S.at('rumors'), tu = S.at('turned');
      plate(ctx, S, { alpha: 0.08, seed: 11 });
      // 1. fake letters flying out
      const R = rng(2);
      for (let i = 0; i < 5; i++) { const p = tween(u, fk - 0.2 + i * 0.12, fk + 0.6 + i * 0.12); if (p > 0) envelope(ctx, k, P, lerp(160, 130 + i * 160, p), lerp(260, 140 + R() * 60, p), 140, { rot: (R() - 0.5) * 0.5, from: '' }); }
      k.scrawl(ctx, 'fake letters', 760, 330, 46, tween(u, fk, fk + 0.4));
      // 2. a rumor whispered down a line of people
      const rp = tween(u, ru - 0.3, ru + 0.9, ease.linear);
      for (let i = 0; i < 4; i++) k.figure(ctx, 170 + i * 200, 700, { s: 0.6, face: 1, look: [1, 0], mood: i < rp * 4 ? 'shock' : 'calm', shadow: false });
      for (let i = 0; i < 3; i++) if (rp * 3 > i) { ctx.save(); ctx.globalAlpha = clamp(rp * 3 - i); for (let j = 0; j < 3; j++) { ctx.beginPath(); ctx.arc(215 + i * 200, 560, 12 + j * 12, -0.6, 0.6); k.stroke(ctx, P.red, 3); } ctx.restore(); }
      k.scrawl(ctx, 'rumors', 760, 420, 46, tween(u, ru, ru + 0.4));
      // 3. two activists turned against each other
      const tt = tween(u, tu - 0.2, tu + 0.5);
      k.figure(ctx, 220, 1050, { s: 0.75, face: tt > 0.5 ? 1 : -1, look: [1, 0], mood: tt > 0.5 ? 'shock' : 'smile', armR: tt > 0.5 ? [1.4, 0.2] : undefined });
      k.figure(ctx, 480, 1050, { s: 0.75, face: tt > 0.5 ? -1 : 1, look: [-1, 0], mood: tt > 0.5 ? 'shock' : 'smile', armR: tt > 0.5 ? [1.4, 0.2] : undefined });
      if (tt > 0.5) k.penLine(ctx, [[350, 760], [330, 800], [370, 830], [335, 870], [365, 905]], tween(u, tu + 0.1, tu + 0.4), P.red, 7);
      k.scrawl(ctx, 'against each other', 740, 900, 40, tween(u, tu + 0.3, tu + 0.8));
    },
  },
  { // 17.32 "Here's the trick. Make the attack look like it came from a friend."
    start: 17.2, title: 'From "a Friend"', trans: 'blink',
    draw(ctx, u, S) {
      const { k, P, W } = S, at = S.at('attack'), fr = S.at('friend');
      plate(ctx, S, { alpha: 0.1, seed: 17 });
      k.stamp(ctx, 'THE TRICK', 220, 110, 44, tween(u, 0.05, 0.25), -0.1);
      // a hatted agent's shadow hidden behind a friendly envelope
      const peek = tween(u, fr + 0.3, fr + 0.8);
      k.figure(ctx, lerp(W / 2, W / 2 + 260, peek), 1040, { ...AGENT, s: 1.15, face: -1, look: [-1, 0], mood: 'calm', color: '#2d2a33' });
      envelope(ctx, k, P, W / 2, 620, 640, { to: 'To: you', from: fr < u + 0.2 ? 'love, a friend ♥' : '', fromColor: P.red, stamp: true, rot: -0.04 });
      k.scrawl(ctx, 'the attack', 300, 290, 50, tween(u, at, at + 0.4));
      if (peek > 0.5) k.scrawl(ctx, 'really from:', 640, 330, 44, tween(u, fr + 0.6, fr + 0.9), { color: P.red });
    },
  },
  { // 22.0 "Fear and doubt do the rest."
    start: 21.85, title: 'Fear and Doubt', trans: 'bleed',
    draw(ctx, u, S) {
      const { k, P, W } = S, fe = S.at('Fear'), db = S.at('doubt');
      plate(ctx, S, { alpha: 0.08, seed: 22 });
      const spread = tween(u, fe - 0.1, db + 1.0);
      k.profile(ctx, 380, 1040, 1.5, { blink: 0.5, inside: c => {
        k.brain(c, 10, -205, 0.55, S.t, { fill: P.paperDark, ink: P.grey });
        k.blot(c, 20, -215, 300, 260, { seed: 5, t: S.t, live: 1, grow: spread, color: P.ink });
      } });
      k.scrawl(ctx, 'fear', 760, 330, 60, tween(u, fe, fe + 0.3));
      k.scrawl(ctx, 'doubt', 800, 520, 60, tween(u, db, db + 0.3), { rot: 0.06 });
      k.scrawl(ctx, '…do the rest', 760, 720, 46, tween(u, db + 0.4, db + 0.8));
    },
  },
  { // 24.74 "It stayed hidden until 1971, when burglars broke into an FBI office, during the biggest boxing match of the year."
    start: 24.6, title: 'The Break-In', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, yr = S.at('1971'), bu = S.at('burglars'), bx = S.at('boxing');
      night(ctx, S);
      k.stamp(ctx, '1971', 180, 130, 64, tween(u, yr, yr + 0.25), 0.1, P.redLight);
      // filing cabinet; flashlight beams sweep it
      k.rect(ctx, 600, 560, 250, 480, '#5d6068', P.ink, 6, 8);
      for (let i = 0; i < 3; i++) k.rect(ctx, 616, 580 + i * 152, 218, 132, '#7c7f86', P.ink, 4, 6);
      const w = tween(u, bu - 0.3, bu + 1.2);
      for (const [fx, ph] of [[lerp(-80, 340, w), 0], [lerp(-200, 220, w), 1]]) {
        const a = Math.sin(S.t * 1.3 + ph * 2) * 0.15;
        ctx.save(); ctx.globalAlpha = 0.22; k.poly(ctx, [[fx + 40, 760], [700 + a * 300, 600], [760 + a * 300, 840]], '#fff3c8'); ctx.restore();
        k.figure(ctx, fx, 1040, { s: 0.95, face: 1, walk: w < 1 ? S.t * 1.2 + ph : 0, look: [1, -0.2], mood: 'worry', color: '#0f0e13', hat: 'cap', armR: [1.3, 0.3], holdR: c => k.rect(c, -10, -10, 40, 18, P.greyLight, P.ink, 2, 4), shadow: false });
      }
      // the big fight on TV, everyone else watching it
      const tvk = tween(u, bx - 0.4, bx);
      if (tvk > 0) { ctx.save(); ctx.globalAlpha = tvk; tv(ctx, k, P, 790, 360, 0.85, S.t); ctx.restore(); }
      k.scrawl(ctx, 'Fight of the Century', 730, 520, 40, tween(u, bx, bx + 0.5), { color: P.redLight, rot: -0.05 });
      k.scrawl(ctx, 'FBI office, Media, PA', 300, 560, 38, tween(u, bu + 0.6, bu + 1.1), { color: P.paperLight });
    },
  },
  { // 33.2 "They mailed the files to newspapers."
    start: 33.05, title: 'Mailed to the Papers', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, ma = S.at('mailed'), nw = S.at('newspapers');
      plate(ctx, S, { alpha: 0.08, seed: 33 });
      // envelopes flying to newspapers, front pages land
      for (let i = 0; i < 3; i++) {
        const p = tween(u, ma - 0.1 + i * 0.25, ma + 0.7 + i * 0.25);
        if (p > 0 && p < 1) envelope(ctx, k, P, lerp(180, 260 + i * 250, p), lerp(1000, 300, p) - Math.sin(p * Math.PI) * 120, 160, { rot: p * 2, stamp: true });
      }
      const n = tween(u, nw - 0.2, nw + 0.3, ease.outBack);
      if (n > 0) { newspaper(ctx, k, P, 300, 640, 0.95 * n, 'FBI FILES', -0.06); newspaper(ctx, k, P, 640, 690, 0.95 * n, 'SECRET PROGRAM', 0.05); }
      k.scrawl(ctx, 'to the newspapers', W / 2, 990, 50, tween(u, nw, nw + 0.5));
    },
  },
  { // 36.06 "Follow for more dark psychology." → the case-file cover
    start: 35.9, title: 'More Dark Psychology', trans: 'cut',
    draw(ctx, u, S) {
      ctx.save(); plate(ctx, S, { alpha: 0.1, seed: 33 }); ctx.restore();
      inkReveal(ctx, S, tween(u, 0.1, 0.8, ease.linear), c => caseCover(c, S, u - 0.1, { handle: meta.brand.handle, caseNo: '1971', tagline: meta.brand.tagline }));
    },
  },
];

export const sfx = [
  { t: 0.2, type: 'heartbeat', gain: 0.4 },
  { t: 0.4, type: 'pen', gain: 0.4 },
  { t: 3.3, type: 'stamp', gain: 0.75 },
  { t: 4.4, type: 'paper', gain: 0.45 },
  { t: 7.35, type: 'splat', gain: 0.55 },
  { t: 8.2, type: 'stamp', gain: 0.75 },
  { t: 9.5, type: 'typewriter', gain: 0.45 },
  { t: 11.3, type: 'fold', gain: 0.45 },
  { t: 12.2, type: 'paper', gain: 0.4 }, { t: 12.5, type: 'paper', gain: 0.35 },
  { t: 13.7, type: 'wind', gain: 0.3 },
  { t: 14.8, type: 'snap', gain: 0.5 },
  { t: 15.1, type: 'splat', gain: 0.4 },
  { t: 17.2, type: 'blink', gain: 0.45 },
  { t: 17.35, type: 'stamp', gain: 0.5 },
  { t: 19.1, type: 'pen', gain: 0.4 },
  { t: 21.1, type: 'slide', gain: 0.4 },
  { t: 21.85, type: 'splat', gain: 0.55 },
  { t: 22.1, type: 'heartbeat', gain: 0.45 },
  { t: 22.7, type: 'pen', gain: 0.4 },
  { t: 24.6, type: 'fold', gain: 0.45 },
  { t: 24.9, type: 'crickets', gain: 0.25 },
  { t: 25.9, type: 'stamp', gain: 0.6 },
  { t: 27.6, type: 'click', gain: 0.5 },
  { t: 28.5, type: 'slide', gain: 0.35 },
  { t: 30.7, type: 'bell', gain: 0.4 },
  { t: 31.1, type: 'thud', gain: 0.3 }, { t: 31.5, type: 'thud', gain: 0.3 },
  { t: 33.05, type: 'whoosh', gain: 0.4 },
  { t: 33.4, type: 'paper', gain: 0.4 },
  { t: 34.5, type: 'stamp', gain: 0.6 },
  { t: 35.95, type: 'splat', gain: 0.8 },
  { t: 36.35, type: 'fold', gain: 0.4 },
  { t: 37.1, type: 'stamp', gain: 0.8 },
  { t: 38.1, type: 'moth', gain: 0.35 },
  { t: 40.0, type: 'bell', gain: 0.25 },
];

export const music = {
  kit: 'mind', bpm: 86, root: 'G', scale: 'minor', gain: 0.3,
  sections: [
    { from: 0, to: 7.35, mood: 'sad' },
    { from: 7.35, to: 17.2, mood: 'tense' },
    { from: 17.2, to: 24.6, mood: 'tense' },
    { from: 24.6, to: 35.9, mood: 'drive' },
    { from: 35.9, to: 40.6, mood: 'end' },
  ],
};
