// "Penicillin Began on a Messy Bench" — told as a mosaic (`mosaic` device, via
// styles/ottoman/mosaic.mjs): Fleming's culture plate is laid tile by tile —
// gold colonies of bacteria, a green-blue patch of mold — and the tiles around
// the mold wink out, leaving the clear ring he noticed. The same plate returns
// at the end with the Oxford team's flask beside it.
import { clamp, lerp, ease, tween, rng, TAU } from '../../lib/core.mjs';
import { interior, bookCover } from '../../styles/ottoman/scenes.mjs';
import { act } from '../../styles/ottoman/acting.mjs';
import { mosaic, drawMosaic, mosaicBorder } from '../../styles/ottoman/mosaic.mjs';

export const meta = {
  title: 'Penicillin Began on a Messy Bench',
  slug: 'penicillin-ottoman',
  style: 'ottoman',
  look: 'scroll',   // hanging scroll (after night, album, ledger)
  ambient: 'dust',
  room: 'arches',
  device: 'mosaic',
  width: 1080, height: 1920, fps: 30,
  duration: 40.4,
  voice: 'voice.mp3',
  seed: 1928,
  captionChars: 30,
  brand: { handle: '@HOWITSTARTED-YT1', logo: '../../../brand/logo.png' },
  outro: { at: 38.7, text: 'Subscribe for more origin stories' },
};

const FLEMING = { robe: '#efefef', inner: '#5a5a62', sash: '#efefef', hat: 'shorthair', hair: '#8a8a8a', skin: '#f1d1a8' };
const FLOREY = { robe: '#efefef', inner: '#3a4a6a', sash: '#efefef', hat: 'shorthair', hair: '#5a4a3a', skin: '#f1d1a8' };
const CHAIN = { robe: '#efefef', inner: '#5a3a2a', sash: '#efefef', hat: 'shorthair', hair: '#2a1c12', mustache: true, mustacheColor: '#2a1c12', skin: '#e8c49a' };
const MX = 540, MY = 560, MR = 360; // where the plate sits in the mosaic

// the culture plate, painted once and laid as tiles; colonies carry their distance to the mold
const paintPlate = (g, S) => {
  const { k, P } = S; mosaicBorder(g, S);
  g.fillStyle = '#e8d8a8'; g.fillRect(66, 66, 948, 968);
  g.fillStyle = '#c9a878'; g.beginPath(); g.arc(MX, MY, MR + 14, 0, TAU); g.fill();
  g.fillStyle = '#f3ead8'; g.beginPath(); g.arc(MX, MY, MR, 0, TAU); g.fill();
  const R = rng(9); for (let i = 0; i < 160; i++) { const a = R() * TAU, r = Math.sqrt(R()) * (MR - 30); g.fillStyle = R() > 0.5 ? '#d8a848' : '#c9a227'; g.beginPath(); g.arc(MX + Math.cos(a) * r, MY + Math.sin(a) * r, 10 + R() * 12, 0, TAU); g.fill(); }
  g.fillStyle = '#5a8a6a'; g.beginPath(); g.arc(MX - 110, MY - 90, 90, 0, TAU); g.fill(); g.fillStyle = '#3a6a8a'; g.beginPath(); g.arc(MX - 120, MY - 100, 50, 0, TAU); g.fill();
};
const MOLD = [MX - 110, MY - 90];
// appear(tile) for the plate: laid outward from the center, then the ring around the mold clears by `clear`
function plateTiles(S, lay, clear) {
  const tiles = mosaic('plate', S, paintPlate);
  return [tiles, tl => {
    const x = tl.i * 22 + 11, y = tl.j * 22 + 11, dc = Math.hypot(x - MX, y - MY), dm = Math.hypot(x - MOLD[0], y - MOLD[1]);
    const a = (lay * 1.6 - dc / 700 - tl.n * 0.2) * 5;
    const inRing = dc < MR && dm > 95 && dm < 95 + 150 * clear && tl.c !== '#5a6a4a';
    return inRing ? Math.min(a, 1 - clear * 1.2) : a;
  }];
}

export const scenes = [
  { // 0.1 "Penicillin started with a messy lab bench."
    start: 0, title: 'A Messy Lab Bench',
    draw(ctx, u, S) {
      const { k, P, W } = S, me = S.at('messy'), be = S.at('bench.');
      S.cam(lerp(1.0, 1.2, tween(u, me - 0.3, be + 0.6, ease.inOut)), lerp(W / 2, 620, tween(u, me - 0.3, be + 0.6)), 680);
      interior(ctx, S, { arches: 2, carpet: false });
      // a cluttered bench: stacks of glass dishes, tubes, a burner
      k.rect(ctx, 200, 820, 760, 30, '#7a5a3a', P.ink, 2.5); k.rect(ctx, 220, 850, 20, 150, '#7a5a3a', P.ink, 2); k.rect(ctx, 920, 850, 20, 150, '#7a5a3a', P.ink, 2);
      const R = rng(2); const n = Math.floor(tween(u, 0.2, be, ease.linear) * 14);
      for (let i = 0; i < n; i++) { const x = 260 + R() * 600, h = Math.floor(R() * 4) + 1; for (let j = 0; j < h; j++) k.ellipse(ctx, x, 812 - j * 16, 46, 12, 0, 'rgba(220,235,240,0.7)', P.ink, 1.5); }
      for (let i = 0; i < 4; i++) k.rect(ctx, 820 + i * 22, 700, 14, 110, 'rgba(200,230,240,0.6)', P.ink, 1.2);
      const t = tween(u, be - 0.3, be + 0.3, ease.outBack); if (t > 0) { ctx.save(); ctx.translate(W / 2, 360); ctx.scale(t, t); ctx.fillStyle = P.vermDark; ctx.font = '900 96px Deco'; ctx.textAlign = 'center'; ctx.fillText('MESSY?', 0, 0); ctx.restore(); }
    },
  },
  { // 5.0 "September 1928, London."
    start: 4.7, title: 'London, 1928', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W } = S, lo = S.at('London.');
      S.cam(lerp(1.1, 1.0, tween(u, 0, 3.4, ease.inOut)), W / 2, 600);
      k.goldSky(ctx, -300, -300, W + 600, 800, S.t);
      for (let i = 0; i < 4; i++) { ctx.save(); ctx.globalAlpha = 0.35; k.cloud(ctx, 120 + i * 260, 200 + (i % 2) * 60, 1.2, i); ctx.restore(); }
      // a red-brick hospital block among chimney pots
      k.rect(ctx, 140, 380, 800, 460, '#9a4a3a', P.ink, 3); for (let r = 0; r < 4; r++) for (let c = 0; c < 7; c++) k.rect(ctx, 190 + c * 105, 420 + r * 100, 50, 64, '#efe6cf', P.ink, 1.5);
      for (let i = 0; i < 6; i++) { k.rect(ctx, 180 + i * 130, 330, 30, 50, '#7a3a2a', P.ink, 1.5); ctx.save(); ctx.globalAlpha = 0.4; k.cloud(ctx, 195 + i * 130 + Math.sin(S.t + i) * 8, 300 - ((S.t * 20 + i * 30) % 80), 0.25, i); ctx.restore(); }
      k.ground(ctx, -300, 840, W + 600, 900, '#8a8a7a', 3, 0.05);
      k.seal(ctx, 860, 170, 70, ' SEPTEMBER · 1928 ·', '1928', tween(u, 0.1, 0.5, ease.linear));
      k.label(ctx, 'ST MARY’S HOSPITAL, LONDON', W / 2, 1040, 20, tween(u, lo, lo + 0.4));
    },
  },
  { // 8.6 "Scientist Alexander Fleming comes back from vacation."
    start: 8.3, title: 'Back From Vacation', trans: 'page',
    draw(ctx, u, S) {
      const { k, P, W } = S, al = S.at('Alexander'), co = S.at('comes'), va = S.at('vacation.');
      S.cam(lerp(1.15, 1.0, tween(u, 0, va + 0.4, ease.inOut)), W / 2, 680);
      interior(ctx, S, { arches: 3, carpet: false });
      k.rect(ctx, 520, 820, 440, 30, '#7a5a3a', P.ink, 2.5);
      for (let i = 0; i < 8; i++) k.ellipse(ctx, 600 + (i % 4) * 90, 812 - Math.floor(i / 4) * 16, 40, 10, 0, 'rgba(220,235,240,0.7)', P.ink, 1.5);
      const walk = tween(u, co - 0.4, va + 0.3, ease.outCubic);
      k.figure(ctx, lerp(-100, 380, walk), 1000, { ...FLEMING, robe: walk < 0.6 ? '#4a4a52' : '#efefef', s: 1.1, face: 1, walk: walk < 1 ? S.t * 6 : null, mood: 'happy', armF: [0.5, 0.3], hold: walk < 0.6 ? c => k.rect(c, -30, -10, 60, 44, '#7a5a3a', P.ink, 2) : null });
      k.label(ctx, 'ALEXANDER FLEMING', 380, 560, 22, tween(u, al, al + 0.4));
    },
  },
  { // 12.2 "A dish of bacteria he left out is covered in mold."
    start: 11.8, title: 'Covered in Mold', trans: 'tiles',
    draw(ctx, u, S) {
      const { k, P, W } = S, di = S.at('dish'), le = S.at('left'), mo = S.at('mold.');
      S.cam(lerp(1.0, 1.2, tween(u, di, mo + 0.6, ease.inOut)), lerp(W / 2, MOLD[0] + 60, tween(u, mo - 0.6, mo + 0.6)), lerp(MY, MOLD[1] + 40, tween(u, mo - 0.6, mo + 0.6)));
      const [tiles, ap] = plateTiles(S, tween(u, 0, le + 0.4, ease.linear), 0);
      drawMosaic(ctx, tiles, ap);
    },
  },
  { // 15.6 "But around the mold, the bacteria are dead."
    start: 15.3, title: 'A Clear Ring', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, ar = S.at('around'), de = S.at('dead.');
      S.cam(lerp(1.2, 1.0, tween(u, 0, de + 0.6, ease.inOut)), lerp(MOLD[0] + 60, W / 2, tween(u, 0, de + 0.6)), lerp(MOLD[1] + 40, MY, tween(u, 0, de + 0.6)));
      const [tiles, ap] = plateTiles(S, 1, tween(u, ar - 0.2, de + 0.4, ease.inOut));
      drawMosaic(ctx, tiles, ap);
      const ring = tween(u, de - 0.2, de + 0.4); if (ring > 0) { ctx.save(); ctx.globalAlpha = ring; ctx.setLineDash([14, 10]); ctx.beginPath(); ctx.arc(MOLD[0], MOLD[1], 245, 0, TAU); k.stroke(ctx, P.vermDark, 5); ctx.restore(); }
    },
  },
  { // 19.0 "The mold is making something that kills germs. He calls it penicillin."
    start: 18.8, title: 'He Calls It Penicillin', trans: 'ink',
    draw(ctx, u, S) {
      const { k, P, W } = S, ma = S.at('making'), ki = S.at('kills'), ca = S.at('calls'), pe = S.at('penicillin.');
      S.cam(lerp(1.0, 1.15, tween(u, ca - 0.3, pe + 0.6, ease.inOut)), W / 2, 620);
      interior(ctx, S, { arches: 2, carpet: false });
      // the plate held up to the light; drops spread out from the mold
      ctx.save(); ctx.translate(680, 520); k.circle(ctx, 0, 0, 170, '#f3ead8', P.ink, 3); const R = rng(9); for (let i = 0; i < 40; i++) { const a = R() * TAU, r = 80 + R() * 80; k.circle(ctx, Math.cos(a) * r, Math.sin(a) * r, 6 + R() * 6, '#d8a848', null); } k.circle(ctx, -40, -30, 46, '#5a8a6a', P.ink, 1.5);
      const sp = tween(u, ma - 0.2, ki + 0.6); for (let i = 0; i < 10; i++) { const a = i / 10 * TAU + S.t * 0.4, r = 46 + sp * 70; ctx.save(); ctx.globalAlpha = sp * (1 - sp * 0.4); k.circle(ctx, -40 + Math.cos(a) * r, -30 + Math.sin(a) * r, 7, '#6fb0e0', null); ctx.restore(); }
      ctx.restore();
      k.figure(ctx, 300, 1000, { ...FLEMING, s: 1.1, face: 1, mood: u > ki ? 'wow' : 'calm', ...act(u > ki ? 'surprise' : 'think', u, tween(u, ma, ma + 0.4)) });
      const n = tween(u, ca - 0.1, pe + 0.4, ease.linear); ctx.fillStyle = P.vermDark; ctx.font = '900 84px Deco'; ctx.textAlign = 'center'; ctx.fillText('PENICILLIN'.slice(0, Math.ceil(10 * n)), W / 2, 880);
      k.label(ctx, 'AFTER THE MOLD: PENICILLIUM', W / 2, 960, 16, tween(u, pe, pe + 0.4));
    },
  },
  { // 25.4 "But for years it stays in the lab."
    start: 24.9, title: 'Years on the Shelf', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, ye = S.at('years'), la = S.at('lab.');
      S.cam(lerp(1.0, 1.12, tween(u, 0, 2.8)), W / 2, 620);
      ctx.fillStyle = '#2a2030'; ctx.fillRect(-300, -300, W + 600, 1800); const gl = ctx.createRadialGradient(540, 460, 10, 540, 460, 420); gl.addColorStop(0, 'rgba(255,230,160,0.35)'); gl.addColorStop(1, 'rgba(255,230,160,0)'); ctx.fillStyle = gl; ctx.fillRect(-300, -300, W + 600, 1800);
      // a flask on a shelf gathers dust while the calendar pages fly
      k.rect(ctx, 260, 560, 560, 20, '#7a5a3a', P.ink, 2);
      ctx.save(); ctx.translate(540, 560); ctx.beginPath(); ctx.moveTo(-20, -160); ctx.lineTo(-20, -100); ctx.lineTo(-80, 0); ctx.lineTo(80, 0); ctx.lineTo(20, -100); ctx.lineTo(20, -160); ctx.closePath(); k.fillStroke(ctx, 'rgba(200,230,240,0.6)', P.ink, 2.5); ctx.beginPath(); ctx.moveTo(-60, -30); ctx.lineTo(60, -30); ctx.lineTo(80, 0); ctx.lineTo(-80, 0); ctx.closePath(); k.fillStroke(ctx, '#d8c050', null, 0); ctx.restore();
      const dust = tween(u, ye - 0.3, la + 0.8); for (let i = 0; i < Math.floor(dust * 30); i++) { const R = rng(i); k.circle(ctx, 470 + R() * 140, 395 + R() * 160, 2, 'rgba(120,100,80,0.6)', null); }
      const yr = Math.round(lerp(1929, 1939, tween(u, ye - 0.3, la + 0.6, ease.linear)));
      ctx.fillStyle = P.goldLight; ctx.font = '900 110px Deco'; ctx.textAlign = 'center'; ctx.fillText(String(yr), W / 2, 860);
      k.cobweb(ctx, 260, 560, 90, 0);
    },
  },
  { // 28.2 "Around 1940, a team at Oxford, led by Howard Florey and Ernst Chain, finally turns it into a real drug."
    start: 27.6, title: 'The Oxford Team', trans: 'page',
    draw(ctx, u, S) {
      const { k, P, W } = S, ox = S.at('Oxford,'), fl = S.at('Florey'), ch = S.at('Chain,'), dr = S.at('drug.');
      S.cam(lerp(1.0, 1.15, tween(u, ch, dr + 0.6, ease.inOut)), W / 2, 640);
      interior(ctx, S, { arches: 3, carpetColor: '#2f5f8a' });
      k.seal(ctx, 160, 180, 64, ' AROUND · 1940 ·', '1940', tween(u, 0.1, 0.5, ease.linear));
      k.figure(ctx, 250, 1000, { ...FLOREY, s: 1.0, face: 1, mood: 'calm', ...act('present', u, tween(u, fl, fl + 0.4)) });
      k.figure(ctx, 830, 1000, { ...CHAIN, s: 1.0, face: -1, mood: 'calm', ...act('think', u, tween(u, ch, ch + 0.4)) });
      // their makeshift apparatus: a row of vessels, then a little bottle with a label
      const ap = tween(u, ox - 0.2, ch + 0.4); for (let i = 0; i < Math.floor(ap * 6); i++) { k.rect(ctx, 380 + i * 54, 720, 40, 100, 'rgba(200,230,240,0.6)', P.ink, 1.5); k.rect(ctx, 380 + i * 54, 780, 40, 40, '#d8c050', null); }
      const bt = tween(u, dr - 0.4, dr + 0.3, ease.outBack); if (bt > 0) { ctx.save(); ctx.translate(540, 520); ctx.scale(bt, bt); k.rect(ctx, -50, -90, 100, 160, 'rgba(160,120,60,0.85)', P.ink, 2.5); k.rect(ctx, -22, -120, 44, 32, '#efefef', P.ink, 2); k.rect(ctx, -40, -40, 80, 60, '#efe6cf', P.ink, 1.5); ctx.fillStyle = P.ink; ctx.font = '700 18px Fell'; ctx.textAlign = 'center'; ctx.fillText('PENICILLIN', 0, -4); ctx.restore(); }
      k.label(ctx, 'HOWARD FLOREY', 250, 560, 18, tween(u, fl, fl + 0.4));
      k.label(ctx, 'ERNST CHAIN', 830, 560, 18, tween(u, ch, ch + 0.4));
    },
  },
  { // 36.8 "Every legend has a beginning."
    start: 36.5, title: 'Every Legend Has a Beginning', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S, beg = S.at('beginning.');
      ctx.save(); S.cam(lerp(1.0, 1.4, tween(u, 0, beg)), MX, MY);
      const [tiles, ap] = plateTiles(S, 1, 1); drawMosaic(ctx, tiles, ap);
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
  ...Array.from({ length: 6 }, (_, i) => ({ t: +(0.6 + i * 0.4).toFixed(2), type: 'clank', gain: 0.15, pitch: 1.7 })), { t: 3.4, type: 'pop', gain: 0.4 },
  { t: 5.1, type: 'stamp', gain: 0.4 }, { t: 6.0, type: 'rain', gain: 0.2 },
  { t: 9.6, type: 'thud', gain: 0.2 }, { t: 10.6, type: 'pluck', gain: 0.3 },
  ...Array.from({ length: 10 }, (_, i) => ({ t: +(12.0 + i * 0.22).toFixed(2), type: 'pop', gain: 0.1, pitch: 1.3 + (i % 3) * 0.1 })), { t: 14.4, type: 'chime', gain: 0.35, pitch: 0.8 },
  { t: 16.2, type: 'whoosh', gain: 0.3 }, { t: 17.9, type: 'chime', gain: 0.45, pitch: 1.3 },
  { t: 21.0, type: 'drip', gain: 0.4 }, { t: 23.7, type: 'stamp', gain: 0.45 },
  ...Array.from({ length: 6 }, (_, i) => ({ t: +(25.3 + i * 0.3).toFixed(2), type: 'paper', gain: 0.15 })),
  { t: 28.1, type: 'stamp', gain: 0.4 }, { t: 30.0, type: 'clank', gain: 0.25, pitch: 1.4 }, { t: 31.5, type: 'clank', gain: 0.25, pitch: 1.5 }, { t: 35.3, type: 'chime', gain: 0.5, pitch: 1.3 },
];

export const music = {
  bpm: 96, root: 'F', maqam: 'rast', gain: 0.3,
  sections: [
    { from: 0, to: 4.7, mood: 'intro' },
    { from: 4.7, to: 15.3, mood: 'groove' },
    { from: 15.3, to: 24.9, mood: 'drive' },
    { from: 24.9, to: 27.6, mood: 'sad' },
    { from: 27.6, to: 38.7, mood: 'triumph' },
    { from: 38.7, to: 40.4, mood: 'end' },
  ],
};
