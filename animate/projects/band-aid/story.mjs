// "Invented Out of Love" — the Band-Aid, told with one long strip of tape
// (`loom` device: a single strip woven through every scene, gauze squares set
// along it). It forms a heart at the start, slips off a finger, is built on the
// kitchen table, and ends cut into boxes on a shop shelf. The brand is a
// trademark: no logo is drawn, the boxes say only "adhesive bandages".
import { clamp, lerp, ease, tween, rng, TAU } from '../../lib/core.mjs';
import { interior, bookCover } from '../../styles/ottoman/scenes.mjs';
import { act } from '../../styles/ottoman/acting.mjs';

export const meta = {
  title: 'Invented Out of Love',
  slug: 'band-aid-ottoman',
  style: 'ottoman',
  look: 'tile',     // tile (after album, karagoz, ledger)
  ambient: 'dust',
  room: 'lattice',
  device: 'loom',
  width: 1080, height: 1920, fps: 30,
  duration: 34.5,
  voice: 'voice.mp3',
  seed: 1920,
  captionChars: 30,
  brand: { handle: '@HOWITSTARTED-YT1', logo: '../../../brand/logo.png' },
  outro: { at: 32.8, text: 'Subscribe for more origin stories' },
};

const EARLE = { robe: '#3a4a5a', inner: '#efe6cf', sash: '#3a4a5a', hat: 'shorthair', hair: '#5a4a3a', collar: true, skin: '#f1d1a8' };
const JOSEPHINE = { robe: '#c4637a', robeP: 'dots', robePc: '#e8a8b8', inner: '#efe6cf', sash: '#efe6cf', hat: 'bun', hair: '#5a3a2a', skin: '#f1d1a8' };
const TAPE = '#e8d4b0', GAUZE = '#ffffff';

// the strip: tape along a path with gauze squares every `gap` px, drawn to k
function strip(ctx, S, pts, k1 = 1, w = 44, gap = 90) {
  const { k, P } = S; if (k1 <= 0) return;
  let tot = 0; const seg = []; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); tot += d; }
  const at = q => { let r = q * tot; for (let i = 0; i < seg.length; i++) { if (r <= seg[i]) { const f = r / seg[i]; return [lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f), Math.atan2(pts[i + 1][1] - pts[i][1], pts[i + 1][0] - pts[i][0])]; } r -= seg[i]; } const n = pts.length - 1; return [pts[n][0], pts[n][1], 0]; };
  const n = Math.floor(tot * clamp(k1) / 8);
  for (let i = 0; i <= n; i++) { const [x, y, a] = at(i * 8 / tot); ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.fillStyle = TAPE; ctx.fillRect(-5, -w / 2, 10, w); ctx.restore(); }
  for (let d = gap / 2; d < tot * clamp(k1); d += gap) { const [x, y, a] = at(d / tot); ctx.save(); ctx.translate(x, y); ctx.rotate(a); k.rect(ctx, -w * 0.35, -w * 0.3, w * 0.7, w * 0.6, GAUZE, '#c9b89a', 1); ctx.restore(); }
  for (let i = 0; i <= n; i += 2) { const [x, y, a] = at(i * 8 / tot); ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.fillStyle = 'rgba(120,90,60,0.25)'; ctx.fillRect(-1, -w / 2, 2, 3); ctx.fillRect(-1, w / 2 - 3, 2, 3); ctx.restore(); }
}
const heartPath = (cx, cy, s) => { const p = []; for (let i = 0; i <= 60; i++) { const t = Math.PI * (i / 60) * 2 - Math.PI; p.push([cx + 16 * Math.pow(Math.sin(t), 3) * s, cy - (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * s]); } return p; };
function box(ctx, S, x, y, s) {
  const { k, P } = S;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  k.rect(ctx, -70, -100, 140, 100, '#c4371f', P.ink, 2); k.rect(ctx, -60, -84, 120, 40, '#efe6cf', P.ink, 1);
  ctx.fillStyle = P.ink; ctx.font = '700 14px Fell'; ctx.textAlign = 'center'; ctx.fillText('ADHESIVE', 0, -66); ctx.fillText('BANDAGES', 0, -50);
  ctx.restore();
}

export const scenes = [
  { // 0.1 "The Band-Aid was invented out of love."
    start: 0, title: 'Out of Love',
    draw(ctx, u, S) {
      const { k, P, W } = S, in_ = S.at('invented'), lo = S.at('love.');
      S.cam(lerp(1.2, 1.0, tween(u, 0, lo + 0.5, ease.inOut)), W / 2, 600);
      ctx.fillStyle = '#f6e8e0'; ctx.fillRect(-300, -300, W + 600, 1800);
      // the strip unrolls and draws a heart
      strip(ctx, S, heartPath(W / 2, 600, 18), tween(u, 0.2, lo + 0.2, ease.inOut), 48, 110);
      const r = tween(u, lo - 0.2, lo + 0.4); if (r > 0) { ctx.save(); ctx.globalAlpha = 0.35 * r; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU + S.t * 0.2; ctx.beginPath(); ctx.moveTo(W / 2 + Math.cos(a) * 360, 560 + Math.sin(a) * 360); ctx.lineTo(W / 2 + Math.cos(a) * 520, 560 + Math.sin(a) * 520); k.stroke(ctx, '#c4637a', 8); } ctx.restore(); }
    },
  },
  { // 4.7 "Around 1920, New Jersey, Earle Dickson works for Johnson & Johnson."
    start: 4.4, title: 'New Jersey, 1920', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W } = S, je = S.at('Jersey,'), ea = S.at('Earle'), wo = S.at('works');
      S.cam(lerp(1.0, 1.15, tween(u, ea - 0.3, wo + 1.2, ease.inOut)), lerp(W / 2, 420, tween(u, ea - 0.3, wo + 1.2)), 680);
      k.goldSky(ctx, -300, -300, W + 600, 800, S.t);
      k.ground(ctx, -300, 760, W + 600, 900, '#8a9a6a', 4, 0.2);
      // a brick factory with a chimney on one side, a small house on the other
      k.rect(ctx, 560, 380, 440, 380, '#9a4a3a', P.ink, 3); k.rect(ctx, 900, 220, 60, 160, '#7a3a2a', P.ink, 2); for (let i = 0; i < 3; i++) { ctx.save(); ctx.globalAlpha = 0.4; k.cloud(ctx, 930 + i * 20, 200 - ((S.t * 30 + i * 40) % 120), 0.3, i); ctx.restore(); }
      for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) k.rect(ctx, 600 + c * 100, 420 + r * 100, 50, 60, '#efe6cf', P.ink, 1.5);
      k.rect(ctx, 120, 560, 260, 200, '#efe6cf', P.ink, 2.5); k.poly(ctx, [[100, 560], [250, 460], [400, 560]], '#5a6a7a', P.ink, 2.5); k.rect(ctx, 220, 660, 50, 100, '#7a5a3a', P.ink, 2);
      k.figure(ctx, 420, 1000, { ...EARLE, s: 1.0, face: 1, walk: S.t * 5, mood: 'calm', armF: [0.5, 0.3] });
      k.seal(ctx, 160, 200, 64, ' AROUND · 1920 ·', '1920', tween(u, 0.1, 0.5, ease.linear));
      k.label(ctx, 'EARLE DICKSON · COTTON BUYER', 420, 560, 16, tween(u, ea, ea + 0.4));
      k.label(ctx, 'NEW BRUNSWICK, NEW JERSEY', 780, 300, 16, tween(u, je, je + 0.4));
    },
  },
  { // 10.4 "His wife, Josephine, keeps cutting and burning her fingers in the kitchen."
    start: 9.9, title: 'Josephine’s Kitchen', trans: 'page',
    draw(ctx, u, S) {
      const { k, P, W } = S, jo = S.at('Josephine,'), cu = S.at('cutting'), bu = S.at('burning'), ki = S.at('kitchen.');
      S.cam(lerp(1.0, 1.15, tween(u, cu - 0.3, ki + 0.6, ease.inOut)), lerp(W / 2, 600, tween(u, cu - 0.3, ki + 0.6)), 700);
      interior(ctx, S, { arches: 2, carpet: false });
      // a kitchen: a counter with a knife and onions, a stove with a steaming pot
      k.rect(ctx, 380, 820, 300, 30, '#7a5a3a', P.ink, 2.5); k.rect(ctx, 700, 760, 220, 240, '#2a2a2a', P.ink, 3); k.ellipse(ctx, 810, 750, 70, 18, 0, '#5a5a62', P.ink, 2); k.rect(ctx, 750, 700, 120, 50, '#8a8a92', P.ink, 2);
      for (let i = 0; i < 3; i++) { ctx.save(); ctx.globalAlpha = 0.4; k.cloud(ctx, 800 + i * 12, 660 - ((S.t * 40 + i * 30) % 100), 0.2, i); ctx.restore(); }
      for (let i = 0; i < 3; i++) k.circle(ctx, 430 + i * 50, 806, 16, '#efe6cf', P.ink, 1.5);
      const ch = Math.sin(S.t * 10);
      k.figure(ctx, 330, 1000, { ...JOSEPHINE, s: 1.05, face: 1, mood: (u > cu && u < cu + 0.8) || (u > bu && u < bu + 0.8) ? 'sad' : 'calm', armF: [1.25 + ch * 0.1, 0.4], hold: c => { k.rect(c, -4, -60, 8, 60, '#c8ccd2', P.ink, 1); } });
      for (const [at, x, y] of [[cu, 470, 760], [bu, 760, 700]]) { const o = tween(u, at, at + 0.3) * (1 - tween(u, at + 0.6, at + 1.0)); if (o > 0) { ctx.save(); ctx.globalAlpha = o; for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; k.star(ctx, x + Math.cos(a) * 30, y + Math.sin(a) * 30, 12, 1); } ctx.restore(); } }
      k.label(ctx, 'JOSEPHINE DICKSON', 330, 560, 20, tween(u, jo, jo + 0.4));
    },
  },
  { // 15.4 "Regular bandages fall right off."
    start: 15.0, title: 'They Fall Right Off', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, re = S.at('Regular'), of = S.at('off.');
      S.cam(lerp(1.0, 1.1, tween(u, 0, 2.0)), W / 2, 600);
      ctx.fillStyle = '#f6e8e0'; ctx.fillRect(-300, -300, W + 600, 1800);
      // a big finger; a loose wad of gauze and tape slides off it
      ctx.save(); ctx.translate(W / 2, 640); ctx.rotate(-0.3); k.rect(ctx, -90, -260, 180, 520, '#f1d1a8', P.ink, 3); ctx.beginPath(); ctx.arc(0, -260, 90, Math.PI, TAU); k.fillStroke(ctx, '#f1d1a8', P.ink, 3); ctx.restore();
      const fall = tween(u, re, of + 0.4, ease.inCubic);
      ctx.save(); ctx.translate(W / 2 - 60 + fall * 100, 480 + fall * 600); ctx.rotate(fall * 2); k.rect(ctx, -110, -70, 220, 140, GAUZE, '#c9b89a', 2); ctx.fillStyle = TAPE; ctx.fillRect(-140, -12, 280, 24); ctx.restore();
    },
  },
  { // 17.5 "So Earle puts small squares of gauze down a long strip of tape so she can cut one off and fix herself, even when he's not home."
    start: 17.1, title: 'A Strip, Ready to Cut', trans: 'page',
    draw(ctx, u, S) {
      const { k, P, W } = S, sq = S.at('squares'), st = S.at('strip'), cu = S.at('cut'), fi = S.at('fix'), ho = S.at('home.');
      S.cam(lerp(1.0, 1.12, tween(u, 0, 7.0)), W / 2, 640);
      ctx.fillStyle = '#c9a878'; ctx.fillRect(-300, -300, W + 600, 1800); ctx.fillStyle = k.pattern(ctx, 'stripes', '#c9a878', '#b8966a', 40); ctx.fillRect(-300, -300, W + 600, 1800);
      // the strip is laid along the table, square by square
      strip(ctx, S, [[80, 520], [1000, 520]], tween(u, sq - 0.6, st + 0.6, ease.linear), 70, 130);
      // scissors snip one piece off
      const sn = tween(u, cu - 0.3, cu + 0.3, ease.inOut);
      if (sn > 0) { ctx.save(); ctx.translate(lerp(700, 615, sn), 520); ctx.rotate(-1.57); k.ellipse(ctx, -30, 50, 16, 26, 0.3, null, P.ink, 5); k.ellipse(ctx, 30, 50, 16, 26, -0.3, null, P.ink, 5); ctx.beginPath(); ctx.moveTo(-10, 20); ctx.lineTo(10, -60); ctx.moveTo(10, 20); ctx.lineTo(-10, -60); k.stroke(ctx, '#c8ccd2', 7); ctx.restore(); }
      const pc = tween(u, cu + 0.2, fi + 0.5, ease.inOut); if (pc > 0) { ctx.save(); ctx.translate(lerp(560, 400, pc), lerp(520, 780, pc)); ctx.rotate(pc * 0.8); ctx.fillStyle = TAPE; ctx.fillRect(-60, -35, 120, 70); k.rect(ctx, -25, -21, 50, 42, GAUZE, '#c9b89a', 1); ctx.restore(); }
      // Josephine fixes her own finger; the chair where Earle sits is empty, his hat gone from the peg
      k.figure(ctx, 260, 1080, { ...JOSEPHINE, s: 0.9, face: 1, mood: u > fi ? 'happy' : 'calm', armF: [1.2, 0.6] });
      const em = tween(u, ho - 0.6, ho); if (em > 0) { ctx.save(); ctx.globalAlpha = em; k.rect(ctx, 760, 820, 140, 20, '#7a5a3a', P.ink, 2); k.rect(ctx, 770, 700, 20, 260, '#7a5a3a', P.ink, 2); k.rect(ctx, 880, 840, 20, 120, '#7a5a3a', P.ink, 2); k.clockFace(ctx, 860, 340, 60, 2, 0); ctx.restore(); }
    },
  },
  { // 25.4 "His boss loves it."
    start: 24.9, title: 'The Boss Loves It', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S, bo = S.at('boss'), lo = S.at('loves');
      S.cam(lerp(1.15, 1.0, tween(u, 0, 1.8, ease.inOut)), W / 2, 680);
      interior(ctx, S, { arches: 3, carpetColor: '#2f5f8a' });
      k.rect(ctx, 380, 820, 340, 30, '#7a5a3a', P.ink, 2.5); strip(ctx, S, [[400, 806], [700, 806]], 1, 36, 70);
      k.figure(ctx, 240, 1000, { ...EARLE, s: 1.0, face: 1, mood: 'happy', ...act('present', u, tween(u, bo - 0.4, bo)) });
      k.figure(ctx, 800, 1000, { robe: '#2a2a3a', inner: '#efe6cf', sash: '#2a2a3a', hat: 'bald', hair: '#cfcfcf', mustache: true, mustacheColor: '#cfcfcf', collar: true, skin: '#f1d1a8', s: 1.0, face: -1, mood: u > lo ? 'happy' : 'calm', ...act(u > lo ? 'cheer' : 'think', u, tween(u, lo - 0.2, lo + 0.2)) });
    },
  },
  { // 27.2 "In 1921, Band-Aids go on sale."
    start: 26.8, title: 'On Sale, 1921', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W } = S, ye = S.at('1921,'), sa = S.at('sale.');
      S.cam(lerp(1.0, 1.15, tween(u, ye, sa + 0.6, ease.inOut)), W / 2, 640);
      interior(ctx, S, { arches: 2, carpet: false });
      // a shop shelf filling with plain boxes
      for (let r = 0; r < 3; r++) k.rect(ctx, 180, 520 + r * 180, 720, 20, '#7a5a3a', P.ink, 2);
      const n = Math.floor(tween(u, ye - 0.3, sa + 0.6) * 15); for (let i = 0; i < n; i++) box(ctx, S, 250 + (i % 5) * 145, 518 + Math.floor(i / 5) * 180, 0.85);
      k.seal(ctx, 880, 220, 64, ' THE YEAR · 1921 ·', '1921', tween(u, ye - 0.1, ye + 0.3, ease.linear));
      k.label(ctx, 'HANDMADE AT FIRST', W / 2, 1060, 18, tween(u, sa, sa + 0.4));
    },
  },
  { // 30.5 "Every legend has a beginning."
    start: 30.0, title: 'Every Legend Has a Beginning', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S, beg = S.at('beginning.');
      ctx.save(); S.cam(lerp(1.0, 1.4, tween(u, 0, beg)), W / 2, 600);
      ctx.fillStyle = '#f6e8e0'; ctx.fillRect(-300, -300, W + 600, 1800); strip(ctx, S, heartPath(W / 2, 600, 18), 1, 48, 110);
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
  { t: 0.4, type: 'slide', gain: 0.35 }, { t: 3.2, type: 'chime', gain: 0.45, pitch: 1.3 },
  { t: 4.8, type: 'stamp', gain: 0.4 }, { t: 8.0, type: 'pluck', gain: 0.3 },
  { t: 12.2, type: 'clank', gain: 0.25, pitch: 1.6 }, { t: 12.9, type: 'sizzle', gain: 0.3 }, { t: 14.1, type: 'pop', gain: 0.25 },
  { t: 15.9, type: 'slide', gain: 0.3 }, { t: 16.6, type: 'flop', gain: 0.4 },
  { t: 18.2, type: 'slide', gain: 0.3 }, ...Array.from({ length: 6 }, (_, i) => ({ t: +(18.5 + i * 0.3).toFixed(2), type: 'pop', gain: 0.15, pitch: 1.4 })), { t: 21.9, type: 'clank', gain: 0.3, pitch: 1.7 }, { t: 23.0, type: 'chime', gain: 0.35, pitch: 1.3 },
  { t: 25.8, type: 'chime', gain: 0.45, pitch: 1.4 },
  { t: 27.2, type: 'stamp', gain: 0.4 }, ...Array.from({ length: 6 }, (_, i) => ({ t: +(27.6 + i * 0.3).toFixed(2), type: 'thud', gain: 0.15, pitch: 1.3 })),
];

export const music = {
  bpm: 100, root: 'A', maqam: 'rast', gain: 0.3,
  sections: [
    { from: 0, to: 4.4, mood: 'intro' },
    { from: 4.4, to: 15.0, mood: 'groove' },
    { from: 15.0, to: 17.1, mood: 'sad' },
    { from: 17.1, to: 32.8, mood: 'triumph' },
    { from: 32.8, to: 34.5, mood: 'end' },
  ],
};
