// "Where Deadline Comes From" — told with one red thread (`loom` device: a
// single line woven through every scene): it starts as the line on a desk
// calendar, becomes the railing inside a Civil War prison stockade, then the
// guide line on a printer's press bed, and ends as a calendar line again.
// The prison camp is shown with respect: no shooting, only the warning line
// and the men keeping away from it.
import { clamp, lerp, ease, tween, rng, TAU } from '../../lib/core.mjs';
import { interior, bookCover } from '../../styles/ottoman/scenes.mjs';
import { act } from '../../styles/ottoman/acting.mjs';

export const meta = {
  title: 'Where Deadline Comes From',
  slug: 'deadline-ottoman',
  style: 'ottoman',
  look: 'album',    // album (after scroll, ledger, night)
  ambient: 'dust',
  room: 'library',
  device: 'loom',
  width: 1080, height: 1920, fps: 30,
  duration: 34.1,
  voice: 'voice.mp3',
  seed: 1864,
  captionChars: 30,
  brand: { handle: '@HOWITSTARTED-YT1', logo: '../../../brand/logo.png' },
  outro: { at: 32.4, text: 'Subscribe for more origin stories' },
};

const RED = '#c4371f';
const PRISONER = i => ({ robe: ['#3a4a6a', '#4a5a7a', '#5a5a5a'][i % 3], robeP: 'stripes', robePc: '#6a6a6a', inner: '#c9b89a', sash: '#3a2a1a', hat: i % 2 ? 'kepi' : 'shorthair', hatColor: '#2a3a6a', hair: '#5a4a3a', beard: i % 3 === 0, beardColor: '#5a4a3a', skin: ['#e2b48a', '#d9a882', '#8a5a3c', '#c99a6e'][i % 4] });
const GUARD = { robe: '#7a7a72', inner: '#c9b89a', sash: '#3a2a1a', hat: 'kepi', hatColor: '#6a6a62', beard: true, beardColor: '#5a4a3a', skin: '#e2b48a' };
const CLERK = { robe: '#2f5f8a', inner: '#efe6cf', sash: '#9a2a1e', hat: 'fez', hatColor: '#b0241a', mustache: true, skin: '#d9a882' };

// the red thread: a wavy line from a to b, drawn up to k
function thread(ctx, S, pts, k1 = 1, w = 7) {
  const { k } = S; if (k1 <= 0) return;
  ctx.save(); ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  let len = 0; for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  ctx.setLineDash([len, len]); ctx.lineDashOffset = len * (1 - clamp(k1)); k.stroke(ctx, RED, w); ctx.restore();
}
function stockade(ctx, S, x0, y0, w, h, o = {}) {
  const { k, P } = S;
  ctx.fillStyle = '#b89a6a'; ctx.fillRect(x0, y0, w, h); // bare red-clay ground
  // the log wall all round, with sentry boxes on top
  const post = (x, y) => k.rect(ctx, x - 7, y - 7, 14, 14, '#7a5a3a', P.ink, 1);
  for (let x = x0; x <= x0 + w; x += 16) { post(x, y0); post(x, y0 + h); }
  for (let y = y0; y <= y0 + h; y += 16) { post(x0, y); post(x0 + w, y); }
  for (let i = 0; i < 5; i++) { const x = x0 + 60 + i * (w - 120) / 4; k.rect(ctx, x - 16, y0 - 34, 32, 26, '#8a6a4a', P.ink, 1.5); k.poly(ctx, [[x - 20, y0 - 34], [x, y0 - 50], [x + 20, y0 - 34]], '#6a4a2a', P.ink, 1.2); }
  // a creek through the middle and rough shelters
  ctx.beginPath(); ctx.moveTo(x0, y0 + h * 0.55); ctx.quadraticCurveTo(x0 + w / 2, y0 + h * 0.5, x0 + w, y0 + h * 0.58); k.stroke(ctx, '#6f8a9a', 10);
  const R = rng(5); for (let i = 0; i < 60; i++) { const x = x0 + 70 + R() * (w - 140), y = y0 + 70 + R() * (h - 140); if (Math.abs(y - (y0 + h * 0.54)) < 18) continue; k.poly(ctx, [[x - 12, y + 8], [x, y - 8], [x + 12, y + 8]], ['#d8cbb0', '#c9b89a', '#a8906a'][i % 3], P.ink, 1); }
  // the dead line: a light railing some way inside the wall
  const m = o.margin || 40, k1 = o.line ?? 0;
  thread(ctx, S, [[x0 + m, y0 + m], [x0 + w - m, y0 + m], [x0 + w - m, y0 + h - m], [x0 + m, y0 + h - m], [x0 + m, y0 + m]], k1, o.lw || 5);
}

export const scenes = [
  { // 0.0 "Your next deadline won't kill you, but the first ones could."
    start: 0, title: 'A Line That Could Kill',
    draw(ctx, u, S) {
      const { k, P, W } = S, ne = S.at('next'), ki = S.at('kill'), fi = S.at('first'), co = S.at('could.');
      S.cam(lerp(1.2, 1.0, tween(u, 0, ki + 0.4, ease.inOut)), W / 2, 640);
      interior(ctx, S, { arches: 2, carpetColor: '#2f5f8a' });
      // a clerk at his desk, a calendar with a red line under one day
      k.rect(ctx, 460, 820, 480, 30, '#7a5a3a', P.ink, 2); k.rect(ctx, 480, 850, 20, 150, '#7a5a3a', P.ink, 2); k.rect(ctx, 900, 850, 20, 150, '#7a5a3a', P.ink, 2);
      k.calendarPage(ctx, 700, 560, 260, 'FRIDAY', 'DUE', -0.05, 0);
      k.figure(ctx, 330, 1000, { ...CLERK, s: 1.05, face: 1, mood: u > ki ? 'calm' : 'wow', ...act('worry', u, tween(u, ne, ne + 0.4)) });
      // the line under the date slides out of the page… and turns into a fence rail
      const out = tween(u, fi - 0.3, co + 0.5, ease.inOut);
      thread(ctx, S, [[600, 640], [800, 640]], tween(u, ne, ne + 0.4));
      if (out > 0) { thread(ctx, S, [[lerp(600, 60, out), lerp(640, 1060, out)], [lerp(800, 1020, out), lerp(640, 1060, out)]], 1, 9); for (let i = 0; i < 6; i++) { const x = lerp(lerp(600, 60, out), lerp(800, 1020, out), i / 5); ctx.save(); ctx.globalAlpha = out; k.rect(ctx, x - 5, lerp(640, 1060, out), 10, 60 * out, '#7a5a3a', P.ink, 1); ctx.restore(); } }
    },
  },
  { // 4.9 "1860s, the American Civil War."
    start: 4.6, title: 'The 1860s', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W } = S, ci = S.at('Civil');
      S.cam(lerp(1.1, 1.0, tween(u, 0, 3.6)), W / 2, 620);
      k.goldSky(ctx, -300, -300, W + 600, 800, S.t);
      k.ground(ctx, -300, 560, W + 600, 1100, '#8aa068', 8, 0.2);
      // a blue cap and a grey cap, facing each other across a field
      for (const [x, f, o] of [[300, 1, { robe: '#2a3a6a', hat: 'kepi', hatColor: '#2a3a6a' }], [780, -1, { robe: '#7a7a72', hat: 'kepi', hatColor: '#6a6a62' }]]) k.figure(ctx, x, 1000, { inner: '#c9b89a', sash: '#3a2a1a', beard: true, beardColor: '#5a4a3a', skin: '#e2b48a', ...o, s: 1.0, face: f, mood: 'calm' });
      k.seal(ctx, W / 2, 330, 120, ' THE YEARS · 1861–1865 ·', '1861–65', tween(u, ci - 0.4, ci, ease.linear));
    },
  },
  { // 8.9 "In prison camps like Andersonville, Georgia, guards marked a line near the walls, usually a low fence."
    start: 8.5, title: 'Andersonville', trans: 'ink',
    draw(ctx, u, S) {
      const { k, P, W } = S, an = S.at('Andersonville,'), ma = S.at('marked'), wa = S.at('walls,'), fe = S.at('fence.');
      S.cam(lerp(0.95, 1.2, tween(u, ma - 0.2, fe + 0.4, ease.inOut)), W / 2, lerp(600, 520, tween(u, ma - 0.2, fe + 0.4)));
      ctx.fillStyle = '#8aa068'; ctx.fillRect(-300, -300, W + 600, 1800);
      stockade(ctx, S, 90, 160, 900, 820, { line: tween(u, ma - 0.1, wa + 0.6, ease.linear), margin: 46 });
      k.label(ctx, 'ANDERSONVILLE (CAMP SUMTER) · 1864', W / 2, 1060, 18, tween(u, an, an + 0.4));
    },
  },
  { // 16.1 "Cross it, and you could be shot. They called it the deadline."
    start: 15.9, title: 'The Dead Line', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, cr = S.at('Cross'), ca = S.at('called'), de = S.at('deadline.');
      S.cam(lerp(1.0, 1.2, tween(u, ca - 0.3, de + 0.6, ease.inOut)), W / 2, lerp(700, 620, tween(u, ca, de + 0.6)));
      k.goldSky(ctx, -300, -300, W + 600, 700, S.t);
      // the log wall and a sentry box behind; the low rail in front of it
      for (let x = -300; x < W + 300; x += 44) k.rect(ctx, x, 300, 40, 380, '#7a5a3a', P.ink, 1.5);
      k.rect(ctx, 760, 220, 120, 90, '#8a6a4a', P.ink, 2); k.poly(ctx, [[740, 220], [820, 170], [900, 220]], '#6a4a2a', P.ink, 2);
      k.figure(ctx, 820, 300, { ...GUARD, s: 0.5, face: -1, mood: 'calm', armF: [0.6, 0.3] });
      ctx.fillStyle = '#b89a6a'; ctx.fillRect(-300, 680, W + 600, 900);
      const pulse = 0.7 + 0.3 * Math.sin(S.t * 6);
      for (let x = -300; x < W + 300; x += 120) k.rect(ctx, x, 760, 12, 90, '#7a5a3a', P.ink, 1.5);
      ctx.save(); ctx.globalAlpha = pulse * tween(u, cr - 0.3, cr + 0.3) + 0.3; thread(ctx, S, [[-300, 770], [W + 300, 770]], 1, 9); ctx.restore();
      // the men keep their distance
      for (let i = 0; i < 6; i++) k.figure(ctx, 100 + i * 170, 1080 + (i % 2) * 20, { ...PRISONER(i), s: 0.6, face: i % 2 ? -1 : 1, mood: 'sad', armF: [0.4, 1.0] });
      const d = tween(u, de - 0.3, de + 0.2, ease.outBack); if (d > 0) { ctx.save(); ctx.translate(W / 2, 560); ctx.scale(d, d); k.rect(ctx, -170, -50, 340, 100, '#efe6cf', P.ink, 3); ctx.fillStyle = RED; ctx.font = '900 56px Deco'; ctx.textAlign = 'center'; ctx.fillText('DEAD LINE', 0, 20); ctx.restore(); }
    },
  },
  { // 21.8 "Later, printers and newspapers borrowed the word, until it meant a time limit."
    start: 21.4, title: 'Printers and Newspapers', trans: 'page',
    draw(ctx, u, S) {
      const { k, P, W } = S, pr = S.at('printers'), ne = S.at('newspapers'), ti = S.at('time');
      S.cam(lerp(1.0, 1.15, tween(u, 0, 4.4)), W / 2, 620);
      interior(ctx, S, { arches: 3, carpet: false });
      // the press: a guide line on its bed past which nothing prints
      k.printingPress(ctx, 300, 760, 1.0, (S.t * 0.8) % 1);
      thread(ctx, S, [[190, 702], [410, 702]], tween(u, pr - 0.2, pr + 0.4), 9);
      k.label(ctx, 'A LINE ON THE PRESS BED', 300, 460, 16, tween(u, pr, pr + 0.4));
      // the newsroom: the same word, now a clock
      const n = tween(u, ne - 0.2, ne + 0.4, ease.outBack);
      if (n > 0) { ctx.save(); ctx.translate(720, 580); ctx.scale(n, n); k.newspaper(ctx, 0, 0, 300, 0.05, 'GOES TO PRESS', 'THE EVENING NEWS'); ctx.restore(); }
      const c = tween(u, ti - 0.4, ti + 0.3, ease.outBack);
      if (c > 0) { ctx.save(); ctx.translate(760, 960); ctx.scale(c, c); k.clockFace(ctx, 0, 0, 90, 11, (S.t * 120) % 60); ctx.restore(); thread(ctx, S, [[640, 1070], [880, 1070]], c); }
    },
  },
  { // 27.3 "Now it just means, get it done."
    start: 26.8, title: 'Get It Done', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S, me = S.at('means,'), ge = S.at('get'), do_ = S.at('done.');
      S.cam(lerp(1.15, 1.0, tween(u, 0, do_ + 0.4, ease.inOut)), W / 2, 640);
      interior(ctx, S, { arches: 2, carpetColor: '#2f5f8a' });
      // back at the desk: the clerk races the red line on his calendar, and makes it
      k.rect(ctx, 460, 820, 480, 30, '#7a5a3a', P.ink, 2);
      k.calendarPage(ctx, 700, 560, 260, 'FRIDAY', 'DUE', -0.05, tween(u, do_ - 0.2, do_ + 0.4));
      thread(ctx, S, [[600, 640], [800, 640]], 1);
      const stack = Math.floor(tween(u, me - 0.4, do_) * 6);
      for (let i = 0; i < stack; i++) k.rect(ctx, 520 + (i % 2) * 6, 800 - i * 14, 140, 12, '#f6efdc', P.ink, 1.2);
      k.figure(ctx, 330, 1000, { ...CLERK, s: 1.05, face: 1, mood: u > do_ ? 'happy' : 'calm', ...act(u > do_ ? 'cheer' : 'count', u, tween(u, ge - 0.3, ge + 0.2)) });
    },
  },
  { // 30.5 "Every legend has a beginning."
    start: 30.2, title: 'Every Legend Has a Beginning', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S, beg = S.at('beginning.');
      ctx.save(); S.cam(lerp(1.0, 1.4, tween(u, 0, beg)), W / 2, 560);
      ctx.fillStyle = '#efe2c0'; ctx.fillRect(-300, -300, W + 600, 1800); thread(ctx, S, [[100, 560], [980, 560]], 1, 12);
      ctx.restore();
      const open = tween(u, beg - 0.1, beg + 0.55, ease.inOut);
      if (open > 0) {
        ctx.save(); ctx.beginPath(); ctx.arc(W / 2, 560, open * 900, 0, TAU); ctx.clip(); bookCover(ctx, S, u - beg); ctx.restore();
        if (open < 1) { ctx.beginPath(); ctx.arc(W / 2, 560, open * 900, 0, TAU); k.stroke(ctx, P.goldLight, 8); }
      }
    },
  },
];

// ---------- sound ----------
export const sfx = [
  ...scenes.slice(1).map(s => ({ t: s.start - 0.05, type: s.trans === 'cut' ? 'pop' : 'paper', gain: 0.28 })),
  { t: 0.5, type: 'clank', gain: 0.25, pitch: 1.6 }, { t: 1.4, type: 'thud', gain: 0.4, pitch: 0.6 }, { t: 3.0, type: 'whoosh', gain: 0.35 },
  { t: 5.0, type: 'stamp', gain: 0.45 }, { t: 7.0, type: 'wind', gain: 0.3 },
  { t: 12.1, type: 'pluck', gain: 0.3, pitch: 0.8 }, { t: 15.1, type: 'thud', gain: 0.35, pitch: 0.7 },
  { t: 16.3, type: 'alarm', gain: 0.1 }, { t: 20.1, type: 'stamp', gain: 0.55 },
  ...Array.from({ length: 6 }, (_, i) => ({ t: +(22.3 + i * 0.3).toFixed(2), type: 'clank', gain: 0.2, pitch: 1.2 })), { t: 25.7, type: 'chime', gain: 0.4, pitch: 1.2 },
  ...Array.from({ length: 5 }, (_, i) => ({ t: +(27.4 + i * 0.25).toFixed(2), type: 'paper', gain: 0.2 })), { t: 28.9, type: 'chime', gain: 0.5, pitch: 1.4 },
];

export const music = {
  bpm: 92, root: 'D', maqam: 'hicaz', gain: 0.28,
  sections: [
    { from: 0, to: 4.6, mood: 'intro' },
    { from: 4.6, to: 21.4, mood: 'sad' },
    { from: 21.4, to: 32.4, mood: 'groove' },
    { from: 32.4, to: 34.1, mood: 'end' },
  ],
};
