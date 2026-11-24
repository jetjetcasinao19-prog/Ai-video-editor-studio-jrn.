// "The Spring That Walked" — the Slinky, told as a voyage (`voyage` device):
// the spring itself travels, end over end, from scene to scene — down a
// staircase, off a workshop shelf, across a dictionary page, into a shop
// window — on a ledger page where the 400 are finally counted down to zero.
// The Slinky is a trademark: no logo is drawn, the word is only written plainly.
import { clamp, lerp, ease, tween, rng, TAU } from '../../lib/core.mjs';
import { interior, bookCover } from '../../styles/ottoman/scenes.mjs';
import { act } from '../../styles/ottoman/acting.mjs';

export const meta = {
  title: 'The Spring That Walked',
  slug: 'slinky-ottoman',
  style: 'ottoman',
  look: 'ledger',   // ledger (after tile, karagoz, album)
  ambient: 'dust',
  room: 'tiles',
  device: 'voyage',
  width: 1080, height: 1920, fps: 30,
  duration: 41.4,
  voice: 'voice.mp3',
  seed: 1945,
  captionChars: 30,
  brand: { handle: '@HOWITSTARTED-YT1', logo: '../../../brand/logo.png' },
  outro: { at: 39.7, text: 'Subscribe for more origin stories' },
};

const RICHARD = { robe: '#2f3f5a', inner: '#efe6cf', sash: '#2f3f5a', hat: 'shorthair', hair: '#3a2a20', glasses: true, skin: '#f1d1a8' };
const BETTY = { robe: '#9a2a1e', robeP: 'dots', inner: '#efe6cf', sash: '#2a1c12', hat: 'bun', hair: '#5a3a2a', skin: '#f1d1a8' };

// a metal coil spring bent along an arch from (x0,y0) to (x1,y1); h = arch height
function slinky(ctx, S, x0, y0, x1, y1, h = 120, n = 36, r = 34) {
  const { P } = S;
  for (let i = 0; i < n; i++) {
    const q = i / (n - 1), x = lerp(x0, x1, q), y = lerp(y0, y1, q) - Math.sin(q * Math.PI) * h;
    const dx = (x1 - x0) / n, dy = (y1 - y0) / n - Math.cos(q * Math.PI) * h * Math.PI / n, a = Math.atan2(dy, dx);
    ctx.save(); ctx.translate(x, y); ctx.rotate(a);
    ctx.beginPath(); ctx.ellipse(0, 0, 4, r, 0, 0, TAU); ctx.lineWidth = 5; ctx.strokeStyle = i % 2 ? '#9aa0a8' : '#c8ccd2'; ctx.stroke(); ctx.lineWidth = 1; ctx.strokeStyle = P.ink; ctx.stroke();
    ctx.restore();
  }
}
// a slinky "walking" down steps: rings stack at A, arch over, stack at B
function ring(ctx, x, y, rx, ry, rot, i) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, TAU); ctx.lineWidth = 5; ctx.strokeStyle = i % 2 ? '#9aa0a8' : '#d4d8de'; ctx.stroke(); ctx.lineWidth = 1; ctx.strokeStyle = '#2a1c12'; ctx.stroke(); ctx.restore(); }
function walkingSlinky(ctx, S, x, y, sx, sy, p, r = 34, n = 44) {
  const i = Math.floor(p), f = ease.inOut(p - i), ax = x + i * sx, ay = y + i * sy, bx = ax + sx, by = ay + sy, gap = r * 0.16;
  const arc = Math.round(n * 0.85 * Math.sin(f * Math.PI)), inB = Math.round((n - arc) * f), inA = n - arc - inB;
  for (let j = 0; j < inA; j++) ring(ctx, ax, ay - 6 - j * gap, r, r * 0.3, 0, j);
  for (let j = 0; j < inB; j++) ring(ctx, bx, by - 6 - j * gap, r, r * 0.3, 0, j);
  if (arc > 0) {
    const x0 = ax, y0 = ay - 6 - inA * gap, x1 = bx, y1 = by - 6 - inB * gap, h = Math.sin(f * Math.PI) * (Math.abs(sy) + r * 2.5);
    for (let j = 0; j < arc; j++) { const q = (j + 0.5) / arc, px = lerp(x0, x1, q), py = lerp(y0, y1, q) - Math.sin(q * Math.PI) * h; const tx = x1 - x0, ty = (y1 - y0) - Math.cos(q * Math.PI) * h * Math.PI; ring(ctx, px, py, r * 0.3, r, Math.atan2(ty, tx), j); }
  }
}
function stairs(ctx, S, x, y, sx, sy, n, color = '#c9a878') {
  const { k, P } = S;
  for (let i = 0; i < n; i++) k.rect(ctx, x + i * sx - sx * 0.5, y + i * sy, 1400, sy, i % 2 ? color : '#b89868', P.ink, 1.5);
}

export const scenes = [
  { // 0.0 "A falling spring became a classic American toy."
    start: 0, title: 'The Spring That Walked',
    draw(ctx, u, S) {
      const { k, P, W } = S, sp = S.at('spring'), cl = S.at('classic'), to = S.at('toy.');
      S.cam(lerp(1.0, 1.15, tween(u, 0, to + 0.4, ease.inOut)), W / 2, 640);
      ctx.fillStyle = '#efe2c0'; ctx.fillRect(-300, -300, W + 600, 1800);
      stairs(ctx, S, 140, 300, 150, 120, 7);
      walkingSlinky(ctx, S, 140, 300, 150, 120, tween(u, 0.2, to + 0.6, ease.linear) * 5, 50);
      k.label(ctx, 'END OVER END, STEP BY STEP', 700, 200, 18, tween(u, cl, cl + 0.4));
    },
  },
  { // 4.9 "1943, Pennsylvania."
    start: 4.6, title: 'Philadelphia, 1943', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W } = S, pe = S.at('Pennsylvania.');
      S.cam(lerp(1.1, 1.0, tween(u, 0, 2.8, ease.inOut)), W / 2, 600);
      k.goldSky(ctx, -300, -300, W + 600, 800, S.t);
      ctx.save(); ctx.beginPath(); ctx.rect(-300, 700, W + 600, 900); ctx.clip(); k.waves(ctx, -300, 700, W + 600, 900, S.t, '#3a5a7a', '#5a7a9a', 14, 24); ctx.restore();
      // the navy yard: a grey warship at the dock, cranes over it
      ctx.save(); ctx.translate(560, 760); k.poly(ctx, [[-420, 0], [420, 0], [360, 90], [-380, 90]], '#7a8088', P.ink, 3); k.rect(ctx, -120, -110, 220, 110, '#8a9098', P.ink, 2.5); k.rect(ctx, -60, -190, 90, 80, '#8a9098', P.ink, 2); for (const gx of [-300, 220]) { k.rect(ctx, gx, -40, 90, 40, '#6a7078', P.ink, 2); ctx.beginPath(); ctx.moveTo(gx + 80, -20); ctx.lineTo(gx + 190, -40); k.stroke(ctx, '#5a6068', 10); } ctx.restore();
      for (const x of [140, 960]) { ctx.beginPath(); ctx.moveTo(x, 720); ctx.lineTo(x, 300); ctx.lineTo(x + (x < 500 ? 220 : -220), 300); k.stroke(ctx, '#5a4a3a', 12); ctx.beginPath(); ctx.moveTo(x + (x < 500 ? 200 : -200), 300); ctx.lineTo(x + (x < 500 ? 200 : -200), 460); k.stroke(ctx, P.ink, 3); }
      k.seal(ctx, 860, 160, 70, ' THE YEAR · 1943 ·', '1943', tween(u, 0.1, 0.5, ease.linear));
      k.label(ctx, 'PHILADELPHIA NAVY YARD', W / 2, 1040, 20, tween(u, pe, pe + 0.4));
    },
  },
  { // 7.9 "Naval engineer Richard James is working with springs."
    start: 7.6, title: 'Richard James', trans: 'page',
    draw(ctx, u, S) {
      const { k, P, W } = S, ri = S.at('Richard'), wo = S.at('working'), sp = S.at('springs.');
      S.cam(lerp(1.0, 1.2, tween(u, wo - 0.3, sp + 0.6, ease.inOut)), lerp(W / 2, 640, tween(u, wo - 0.3, sp + 0.6)), 700);
      interior(ctx, S, { arches: 2, carpet: false });
      // a bench of gauges and coiled springs
      k.rect(ctx, 420, 820, 560, 30, '#7a5a3a', P.ink, 2); k.rect(ctx, 440, 850, 20, 150, '#7a5a3a', P.ink, 2); k.rect(ctx, 940, 850, 20, 150, '#7a5a3a', P.ink, 2);
      for (let i = 0; i < 3; i++) { k.circle(ctx, 520 + i * 90, 760, 34, '#efe6cf', P.ink, 2); ctx.beginPath(); ctx.moveTo(520 + i * 90, 760); ctx.lineTo(520 + i * 90 + Math.cos(S.t * 2 + i) * 24, 760 + Math.sin(S.t * 2 + i) * 24); k.stroke(ctx, P.vermDark, 3); }
      const n = Math.floor(tween(u, wo - 0.2, sp + 0.4) * 4); for (let i = 0; i < n; i++) slinky(ctx, S, 780 + i * 44, 816, 800 + i * 44, 816, 0, 10, 16);
      k.figure(ctx, 300, 1000, { ...RICHARD, s: 1.1, face: 1, mood: 'calm', ...act('present', u, tween(u, wo, wo + 0.4)) });
      k.label(ctx, 'RICHARD JAMES', 300, 560, 22, tween(u, ri, ri + 0.4));
      k.label(ctx, 'SPRINGS TO STEADY SHIP INSTRUMENTS', 680, 640, 15, tween(u, sp, sp + 0.4));
    },
  },
  { // 11.7 "As the story goes, one falls and keeps walking."
    start: 11.4, title: 'It Keeps Walking', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, st = S.at('story'), fa = S.at('falls'), ke = S.at('keeps'), wa = S.at('walking.');
      S.cam(lerp(1.0, 1.1, tween(u, 0, 4.0)), W / 2, 640);
      interior(ctx, S, { arches: 2, carpet: false });
      // a shelf, a stack of books, the floor: it tumbles and walks down them
      k.rect(ctx, 600, 420, 360, 24, '#7a5a3a', P.ink, 2);
      for (let i = 0; i < 4; i++) k.rect(ctx, 480 - i * 90, 444 + i * 140, 140 + i * 90, 140, ['#9a2a1e', '#2f5f8a', '#3d8458', '#c9a227'][i], P.ink, 2);
      const p = tween(u, fa - 0.2, wa + 1.4, ease.linear) * 4.2;
      if (p <= 0) slinky(ctx, S, 760, 420, 790, 420, 0, 30, 34); else walkingSlinky(ctx, S, 700, 420, -100, 140, p);
      k.figure(ctx, 860, 1000, { ...RICHARD, s: 1.05, face: -1, mood: u > ke ? 'wow' : 'calm', ...act(u > ke ? 'surprise' : 'rest', u, tween(u, ke - 0.2, ke + 0.3)) });
      k.label(ctx, 'AS THE STORY GOES', W / 2, 240, 18, tween(u, st, st + 0.4));
    },
  },
  { // 16.2 "He tells his wife, Betty, this could be a toy."
    start: 15.9, title: 'Betty James', trans: 'ink',
    draw(ctx, u, S) {
      const { k, P, W } = S, te = S.at('tells'), be = S.at('Betty,'), to = S.at('toy.');
      S.cam(lerp(1.15, 1.0, tween(u, 0, to + 0.4, ease.inOut)), W / 2, 680);
      interior(ctx, S, { arches: 3, carpetColor: '#2f5f8a' });
      k.figure(ctx, 330, 1000, { ...RICHARD, s: 1.05, face: 1, mood: 'happy', ...act('present', u, tween(u, te, te + 0.4)), hold: c => slinky(c, S, -20, 0, 20, 0, 6, 20, 22) });
      k.figure(ctx, 720, 1000, { ...BETTY, s: 1.05, face: -1, mood: u > to - 0.2 ? 'happy' : 'calm', ...act(u > to - 0.2 ? 'cheer' : 'think', u, tween(u, be, be + 0.4)) });
      k.label(ctx, 'BETTY JAMES', 720, 560, 22, tween(u, be, be + 0.4));
    },
  },
  { // 20.0 "Betty flips through a dictionary for a name. She picks slinky, sleek, and graceful."
    start: 19.7, title: 'A Name From the Dictionary', trans: 'page',
    draw(ctx, u, S) {
      const { k, P, W } = S, fl = S.at('flips'), na = S.at('name.'), pi = S.at('picks'), sl = S.at('slinky,'), gr = S.at('graceful.');
      S.cam(lerp(1.0, 1.25, tween(u, pi - 0.3, gr + 0.6, ease.inOut)), W / 2, lerp(620, 560, tween(u, pi - 0.3, gr + 0.6)));
      ctx.fillStyle = '#2a2030'; ctx.fillRect(-300, -300, W + 600, 1800);
      k.openBook(ctx, W / 2, 620, 860, 560, { cover: '#3a2a1a' });
      // pages riffle, then stop on the word
      const fp = tween(u, fl - 0.1, na + 0.4); if (fp > 0 && fp < 1) for (let i = 0; i < 3; i++) { const a = ((S.t * 4 + i * 0.3) % 1) * Math.PI; ctx.save(); ctx.translate(W / 2, 620); ctx.scale(Math.cos(a), 1); k.rect(ctx, 0, -270, 420, 540, '#f6efdc', P.ink, 1.5); ctx.restore(); }
      const st = tween(u, pi - 0.2, pi + 0.3);
      if (st > 0) { ctx.save(); ctx.globalAlpha = st; ctx.fillStyle = P.ink; ctx.textAlign = 'left'; ctx.font = '700 54px Fell'; ctx.fillText('slink·y', W / 2 + 40, 520); ctx.font = 'italic 600 34px GaramondItalic'; ctx.fillText('(adj.)', W / 2 + 40, 570); const d = 'sleek and graceful', q = tween(u, sl, gr + 0.2, ease.linear); ctx.font = '600 40px Garamond'; ctx.fillText(d.slice(0, Math.ceil(d.length * q)), W / 2 + 40, 640); ctx.restore(); }
      // the spring walks across the page and stops on the word
      if (u > pi) walkingSlinky(ctx, S, 220, 860, 90, -40, tween(u, pi, gr + 0.4, ease.linear) * 3, 26);
    },
  },
  { // 26.4 "November 1945. Philadelphia's Gimbels department store."
    start: 26.2, title: 'Gimbels, 1945', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W } = S, no = S.at('November'), gi = S.at("Gimbel's"), st = S.at('store.');
      S.cam(lerp(1.0, 1.15, tween(u, gi - 0.3, st + 0.8, ease.inOut)), W / 2, 640);
      k.nightSky(ctx, -300, -300, W + 600, 900, S.t); k.snow(ctx, -300, -300, W + 600, 1800, S.t, 80, 4);
      // a big store front, lit windows, wreaths for the holiday season
      k.rect(ctx, 80, 300, 920, 760, '#c9b08a', P.ink, 3); for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) { const lit = 0.75 + Math.sin(S.t * 3 + r + c) * 0.15; k.rect(ctx, 130 + c * 145, 350 + r * 140, 100, 100, `rgba(255,214,120,${lit})`, P.ink, 2); }
      k.rect(ctx, 380, 820, 320, 240, '#5a3a1a', P.ink, 3); k.rect(ctx, 150, 830, 200, 200, 'rgba(255,214,120,0.85)', P.ink, 2.5); k.rect(ctx, 730, 830, 200, 200, 'rgba(255,214,120,0.85)', P.ink, 2.5);
      for (const x of [250, 830]) { k.circle(ctx, x, 800, 34, null, '#3d8458', 10); k.circle(ctx, x, 770, 6, '#c4371f', null); }
      walkingSlinky(ctx, S, 170, 1030, 30, 0, tween(u, 0, 4.0, ease.linear) * 5, 20);
      k.seal(ctx, 860, 160, 64, ' NOVEMBER · 1945 ·', 'NOV 1945', tween(u, no, no + 0.4, ease.linear));
      k.label(ctx, 'GIMBELS · PHILADELPHIA', W / 2, 260, 20, tween(u, gi, gi + 0.4));
    },
  },
  { // 31.6 "They have 400 Slinkys. In 90 minutes, every one is sold."
    start: 31.2, title: '400 in 90 Minutes', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, fo = S.at('400'), mi = S.at('minutes,'), so = S.at('sold.');
      S.cam(lerp(1.0, 1.12, tween(u, 0, so + 0.6, ease.inOut)), W / 2, 640);
      ctx.fillStyle = '#efe2c0'; ctx.fillRect(-300, -300, W + 600, 1800);
      for (let y = 100; y < 1150; y += 54) { ctx.beginPath(); ctx.moveTo(-300, y); ctx.lineTo(W + 300, y); k.stroke(ctx, 'rgba(60,90,140,0.15)', 1.5); }
      // a counter with a pyramid of boxes that empties as hands reach in
      const left = Math.round(lerp(400, 0, tween(u, mi - 0.8, so + 0.4, ease.inOut)));
      const shown = Math.ceil(left / 400 * 21);
      k.rect(ctx, 140, 820, 800, 40, '#7a5a3a', P.ink, 2.5);
      let b = 0; for (let r = 0; r < 6 && b < shown; r++) for (let c = 0; c < 6 - r && b < shown; c++, b++) { const x = 240 + c * 110 + r * 55, y = 760 - r * 70; k.rect(ctx, x - 50, y - 30, 100, 60, '#e8d6a8', P.ink, 2); ctx.fillStyle = P.ink; ctx.font = '700 18px Fell'; ctx.textAlign = 'center'; ctx.fillText('slinky', x, y + 6); }
      for (let i = 0; i < 6; i++) k.figure(ctx, 120 + i * 170, 1080, { robe: ['#2f5f8a', '#9a2a1e', '#3d8458', '#5a2a6a', '#c9a227', '#3a3a4a'][i], inner: '#efe6cf', hat: ['cap', 'bun', 'shorthair', 'stovepipe', 'bun', 'cap'][i], hatColor: '#3a3a4a', hair: '#5a3a2a', skin: ['#f1d1a8', '#e2b48a', '#8a5a3c', '#d9a882', '#f1d1a8', '#c99a6e'][i], s: 0.6, face: -1, mood: 'happy', ...act('cheer', u + i, tween(u, mi, mi + 0.4)) });
      ctx.fillStyle = P.vermDark; ctx.font = '900 110px Deco'; ctx.textAlign = 'center'; ctx.fillText(String(left), W / 2, 260);
      k.clockFace(ctx, 880, 220, 80, 10 + Math.floor(tween(u, mi - 0.8, so) * 1.5), (tween(u, mi - 0.8, so) * 90) % 60);
      if (u > so) k.label(ctx, 'SOLD OUT', W / 2, 400, 26, tween(u, so, so + 0.3));
    },
  },
  { // 37.7 "Every legend has a beginning."
    start: 37.4, title: 'Every Legend Has a Beginning', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S, beg = S.at('beginning.');
      ctx.save(); S.cam(lerp(1.0, 1.4, tween(u, 0, beg)), W / 2, 640);
      ctx.fillStyle = '#efe2c0'; ctx.fillRect(-300, -300, W + 600, 1800); stairs(ctx, S, 140, 300, 150, 120, 7); walkingSlinky(ctx, S, 140, 300, 150, 120, (S.t * 0.8) % 5, 50);
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
const steps = (t0, n, dt) => Array.from({ length: n }, (_, i) => ({ t: +(t0 + i * dt).toFixed(2), type: 'clank', gain: 0.18, pitch: 1.6 + (i % 2) * 0.2 }));
export const sfx = [
  ...scenes.slice(1).map(s => ({ t: s.start - 0.05, type: s.trans === 'cut' ? 'pop' : 'paper', gain: 0.28 })),
  ...steps(0.6, 6, 0.55),
  { t: 5.0, type: 'stamp', gain: 0.45 }, { t: 6.3, type: 'waves', gain: 0.3 },
  { t: 8.6, type: 'clank', gain: 0.3, pitch: 1.2 }, { t: 10.6, type: 'chime', gain: 0.35, pitch: 1.4 },
  { t: 13.2, type: 'thud', gain: 0.35, pitch: 1.3 }, ...steps(13.8, 5, 0.45), { t: 14.9, type: 'pop', gain: 0.35 },
  { t: 18.9, type: 'chime', gain: 0.45, pitch: 1.3 },
  ...Array.from({ length: 8 }, (_, i) => ({ t: +(20.2 + i * 0.12).toFixed(2), type: 'paper', gain: 0.16 })), { t: 22.9, type: 'pop', gain: 0.4 }, { t: 25.1, type: 'chime', gain: 0.4, pitch: 1.2 },
  { t: 26.7, type: 'stamp', gain: 0.4 }, { t: 29.6, type: 'chime', gain: 0.3, pitch: 1.5 },
  ...Array.from({ length: 10 }, (_, i) => ({ t: +(33.6 + i * 0.25).toFixed(2), type: 'coins', gain: 0.15 })), { t: 36.3, type: 'stamp', gain: 0.55 },
];

export const music = {
  bpm: 112, root: 'C', maqam: 'rast', gain: 0.3,
  sections: [
    { from: 0, to: 4.6, mood: 'intro' },
    { from: 4.6, to: 15.9, mood: 'groove' },
    { from: 15.9, to: 26.2, mood: 'groove' },
    { from: 26.2, to: 39.7, mood: 'triumph' },
    { from: 39.7, to: 41.4, mood: 'end' },
  ],
};
