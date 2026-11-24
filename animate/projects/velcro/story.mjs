// "Velcro Came From a Dog Walk" — told as a book of marvels (`marvels`
// device): the wonder is what a microscope shows, tiny hooks catching tiny
// loops, and that magnified circle returns until it becomes two strips of
// tape. Velcro is a trademark: no logo is drawn, the name is only spelled out.
import { clamp, lerp, ease, tween, rng, TAU } from '../../lib/core.mjs';
import { interior, bookCover } from '../../styles/ottoman/scenes.mjs';
import { act } from '../../styles/ottoman/acting.mjs';

export const meta = {
  title: 'Velcro Came From a Dog Walk',
  slug: 'velcro-ottoman',
  style: 'ottoman',
  look: 'tile',     // tile (after karagoz, album, scroll)
  ambient: 'dust',
  room: 'arches',
  device: 'marvels',
  width: 1080, height: 1920, fps: 30,
  duration: 36.4,
  voice: 'voice.mp3',
  seed: 1941,
  captionChars: 30,
  brand: { handle: '@HOWITSTARTED-YT1', logo: '../../../brand/logo.png' },
  outro: { at: 34.7, text: 'Subscribe for more origin stories' },
};

const MESTRAL = { robe: '#5a6a4a', inner: '#efe6cf', sash: '#7a5a3a', hat: 'campaignhat', hatColor: '#6a5a3a', mustache: true, mustacheColor: '#4a3a2a', skin: '#f1d1a8' };
const DOG = '#d8c098';

// the magnified view: hooks (top) reach down and catch loops (bottom); k1 = how far they've closed
function magnified(ctx, S, x, y, r, k1, t = 0) {
  const { k, P } = S;
  ctx.save(); k.circle(ctx, x, y, r, '#f6efdc', P.goldDark, 8); ctx.beginPath(); ctx.arc(x, y, r - 6, 0, TAU); ctx.clip();
  const gap = lerp(80, 0, clamp(k1));
  for (let i = 0; i < 9; i++) { // loops from below
    const lx = x - r + 40 + i * (2 * r - 80) / 8; ctx.beginPath(); ctx.ellipse(lx, y + 40 + gap, 20, 34, 0, Math.PI, TAU); k.stroke(ctx, '#c4371f', 9); ctx.beginPath(); ctx.moveTo(lx - 20, y + 40 + gap); ctx.lineTo(lx - 20, y + r); ctx.moveTo(lx + 20, y + 40 + gap); ctx.lineTo(lx + 20, y + r); k.stroke(ctx, '#c4371f', 6);
  }
  for (let i = 0; i < 8; i++) { // hooks from above
    const hx = x - r + 70 + i * (2 * r - 120) / 7, ty = y - r, by = y + 20 - gap + Math.sin(t * 3 + i) * 2;
    ctx.beginPath(); ctx.moveTo(hx, ty); ctx.lineTo(hx, by); ctx.arc(hx + 16, by, 16, Math.PI, 0, true); k.stroke(ctx, '#2f5f8a', 10);
  }
  ctx.restore();
}

export const scenes = [
  { // 0.1 "Velcro was invented because of a dog walk."
    start: 0, title: 'From a Dog Walk',
    draw(ctx, u, S) {
      const { k, P, W } = S, in_ = S.at('invented'), do_ = S.at('dog'), wa = S.at('walk.');
      S.cam(lerp(1.3, 1.0, tween(u, 0, wa + 0.4, ease.inOut)), W / 2, lerp(520, 640, tween(u, 0, wa + 0.4)));
      k.goldSky(ctx, -300, -300, W + 600, 800, S.t);
      k.ground(ctx, -300, 600, W + 600, 1100, '#8aa068', 3, 0.3);
      // two strips of fastener tear apart… and a dog bounds out between them
      const rip = tween(u, 0.2, in_ + 0.3, ease.outCubic);
      for (const sx of [-1, 1]) { ctx.save(); ctx.translate(W / 2 + sx * lerp(60, 380, rip), 380); ctx.rotate(sx * rip * 0.3); k.rect(ctx, -60, -170, 120, 340, sx < 0 ? '#2f5f8a' : '#c4371f', P.ink, 3); for (let i = 0; i < 10; i++) { ctx.beginPath(); ctx.moveTo(-40, -150 + i * 32); ctx.lineTo(40, -150 + i * 32); k.stroke(ctx, 'rgba(255,248,220,0.5)', 3); } ctx.restore(); }
      if (rip > 0.3 && rip < 0.9) { ctx.save(); ctx.globalAlpha = 1 - Math.abs(rip - 0.6) * 3; ctx.fillStyle = P.vermDark; ctx.font = '900 80px Deco'; ctx.textAlign = 'center'; ctx.fillText('RRRIP!', W / 2, 260); ctx.restore(); }
      const d = tween(u, do_ - 0.4, wa + 0.4, ease.outCubic);
      k.dog(ctx, lerp(-160, W / 2 - 40, d), 900, 1.6, 1, S.t, { color: DOG, walk: d < 1 ? S.t * 14 : null });
    },
  },
  { // 4.1 "In the 1940s, Swiss engineer Georges de Mestral goes on a walk in the mountains with his dog."
    start: 3.8, title: 'A Walk in the Mountains', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W } = S, sw = S.at('Swiss'), ge = S.at('Georges'), mo = S.at('mountains'), dg = S.at('dog.');
      S.cam(lerp(1.0, 1.15, tween(u, mo - 0.6, dg + 0.6, ease.inOut)), lerp(W / 2, 460, tween(u, mo - 0.6, dg + 0.6)), 640);
      k.goldSky(ctx, -300, -300, W + 600, 800, S.t);
      for (const [x, h] of [[160, 520], [520, 640], [900, 560]]) { k.poly(ctx, [[x - 340, 760], [x, 760 - h], [x + 340, 760]], '#8a8aa0', P.ink, 2.5); k.poly(ctx, [[x - 90, 760 - h + 140], [x, 760 - h], [x + 90, 760 - h + 140]], P.white, P.ink, 1.5); }
      k.ground(ctx, -300, 740, W + 600, 900, '#7a9a58', 6, 0.4);
      for (let i = 0; i < 8; i++) k.tuft(ctx, 80 + i * 130, 920 + (i % 2) * 60, 1.4, P.greenDark);
      const go = tween(u, 0.2, dg + 1.2, ease.linear);
      k.figure(ctx, lerp(200, 640, go), 1000, { ...MESTRAL, s: 0.95, face: 1, walk: S.t * 5, armF: [0.6, 0.3], hold: c => k.rect(c, -3, -10, 6, 140, '#7a5a3a', P.ink, 1) });
      k.dog(ctx, lerp(340, 800, go), 1010, 0.9, 1, S.t, { color: DOG, walk: S.t * 10 });
      k.label(ctx, 'GEORGE DE MESTRAL · SWITZERLAND', W / 2, 260, 20, tween(u, ge, ge + 0.4));
      k.seal(ctx, 900, 200, 60, ' THE YEAR · 1941 ·', '1941', tween(u, 0.1, 0.5, ease.linear));
    },
  },
  { // 10.4 "They come home covered in burrs, sticky seed pods."
    start: 10.1, title: 'Covered in Burrs', trans: 'ink',
    draw(ctx, u, S) {
      const { k, P, W } = S, co = S.at('covered'), bu = S.at('burrs,'), se = S.at('seed');
      S.cam(lerp(1.0, 1.2, tween(u, bu - 0.3, se + 0.6, ease.inOut)), lerp(W / 2, 640, tween(u, bu - 0.3, se + 0.6)), 720);
      interior(ctx, S, { arches: 2, carpetColor: '#2f5f8a' });
      const st = tween(u, co - 0.3, bu + 0.6);
      k.figure(ctx, 300, 1000, { ...MESTRAL, hat: 'shorthair', hair: '#4a3a2a', s: 1.05, face: 1, mood: 'wow', ...act('surprise', u, tween(u, co, co + 0.4)) });
      const R = rng(4); for (let i = 0; i < Math.floor(st * 12); i++) k.burr(ctx, 270 + R() * 70, 820 + R() * 170, 9);
      k.dog(ctx, 720, 1010, 1.3, -1, S.t, { color: DOG, burrs: st });
      // a burdock plant with its seed heads
      const pl = tween(u, se - 0.4, se + 0.3, ease.outBack); if (pl > 0) { ctx.save(); ctx.translate(880, 600); ctx.scale(pl, pl); k.circle(ctx, 0, 0, 120, '#f6efdc', P.goldDark, 5); ctx.beginPath(); ctx.moveTo(0, 110); ctx.lineTo(0, -10); k.stroke(ctx, P.greenDark, 6); for (const [dx, dy] of [[-30, -30], [20, -50], [0, 10], [40, -10]]) k.burr(ctx, dx, dy, 16, '#8a5a8a'); ctx.restore(); }
    },
  },
  { // 14.7 "He looks at one under a microscope."
    start: 14.5, title: 'Under the Microscope', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, lo = S.at('looks'), mi = S.at('microscope.');
      S.cam(lerp(1.0, 1.4, tween(u, lo, mi + 0.6, ease.inOut)), lerp(W / 2, 600, tween(u, lo, mi + 0.6)), lerp(700, 640, tween(u, lo, mi + 0.6)));
      interior(ctx, S, { arches: 3, carpet: false });
      k.rect(ctx, 420, 880, 420, 26, '#7a5a3a', P.ink, 2); k.rect(ctx, 440, 906, 20, 100, '#7a5a3a', P.ink, 2); k.rect(ctx, 800, 906, 20, 100, '#7a5a3a', P.ink, 2);
      k.microscope(ctx, 640, 880, 1.2);
      k.burr(ctx, 610, 760, 10);
      k.figure(ctx, 420, 1000, { ...MESTRAL, hat: 'shorthair', hair: '#4a3a2a', s: 1.05, face: 1, mood: 'calm', ...act('think', u, tween(u, lo, lo + 0.4)) });
    },
  },
  { // 17.4 "Tiny hooks, grabbing tiny loops in fabric and fur."
    start: 17.0, title: 'Hooks and Loops', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S, ho = S.at('hooks,'), gr = S.at('grabbing'), lo = S.at('loops'), fu = S.at('fur.');
      S.cam(lerp(1.15, 1.0, tween(u, 0, fu + 0.4, ease.inOut)), W / 2, 600);
      ctx.fillStyle = '#2a2030'; ctx.fillRect(-300, -300, W + 600, 1800);
      magnified(ctx, S, W / 2, 600, 400, tween(u, gr - 0.3, lo + 0.8, ease.inOut), S.t);
      k.label(ctx, 'HOOKS', W / 2, 140, 22, tween(u, ho - 0.2, ho + 0.3));
      k.label(ctx, 'LOOPS', W / 2, 1060, 22, tween(u, lo - 0.2, lo + 0.3));
    },
  },
  { // 22.3 "So he copies nature. One strip of hooks, one strip of loops."
    start: 21.9, title: 'Copying Nature', trans: 'page',
    draw(ctx, u, S) {
      const { k, P, W } = S, co = S.at('copies'), h1 = S.at('hooks,'), l1 = S.at('loops.');
      S.cam(lerp(1.0, 1.15, tween(u, h1 - 0.3, l1 + 0.6, ease.inOut)), W / 2, 640);
      interior(ctx, S, { arches: 2, carpetColor: '#c4371f' });
      // the burr on one side, the strips coming off his bench on the other
      const b = tween(u, co - 0.3, co + 0.3, ease.outBack); if (b > 0) { ctx.save(); ctx.translate(200, 420); ctx.scale(b, b); k.circle(ctx, 0, 0, 110, '#f6efdc', P.goldDark, 5); k.burr(ctx, 0, 0, 40); ctx.restore(); }
      const s1 = tween(u, h1 - 0.4, h1 + 0.3, ease.outCubic), s2 = tween(u, l1 - 0.6, l1 + 0.2, ease.outCubic), press = tween(u, l1 + 0.1, l1 + 0.6, ease.inOut);
      if (s1 > 0) { k.rect(ctx, lerp(1100, 400, s1), 560 + press * 50, 560, 70, '#2f5f8a', P.ink, 3); for (let i = 0; i < 18; i++) { const x = lerp(1100, 400, s1) + 20 + i * 30; ctx.beginPath(); ctx.moveTo(x, 630 + press * 50); ctx.lineTo(x, 650 + press * 50); ctx.arc(x + 6, 650 + press * 50, 6, Math.PI, 0, true); k.stroke(ctx, '#f6efdc', 3); } }
      if (s2 > 0) { k.rect(ctx, lerp(1100, 400, s2), 760 - press * 50, 560, 70, '#c4371f', P.ink, 3); for (let i = 0; i < 18; i++) { const x = lerp(1100, 400, s2) + 22 + i * 30; ctx.beginPath(); ctx.ellipse(x, 760 - press * 50, 10, 14, 0, Math.PI, TAU); k.stroke(ctx, '#f6efdc', 3); } }
      k.figure(ctx, 200, 1000, { ...MESTRAL, hat: 'shorthair', hair: '#4a3a2a', s: 0.95, face: 1, mood: press > 0.5 ? 'happy' : 'calm', ...act(press > 0.5 ? 'cheer' : 'present', u, tween(u, h1 - 0.3, h1)) });
    },
  },
  { // 27.6 "He names it Velcro, from the French words for velvet and hook."
    start: 27.1, title: 'Velours + Crochet', trans: 'tiles',
    draw(ctx, u, S) {
      const { k, P, W } = S, na = S.at('names'), fr = S.at('French'), ve = S.at('velvet'), ho = S.at('hook.');
      S.cam(lerp(1.0, 1.1, tween(u, 0, 4.2)), W / 2, 600);
      ctx.fillStyle = '#efe2c0'; ctx.fillRect(-300, -300, W + 600, 1800);
      // two French words, each giving up three letters
      const v = tween(u, ve - 0.3, ve + 0.3, ease.outBack), c = tween(u, ho - 0.3, ho + 0.3, ease.outBack), j = tween(u, ho + 0.3, ho + 0.9, ease.inOut);
      ctx.textAlign = 'center';
      if (v > 0) { ctx.save(); ctx.translate(lerp(300, 420, j), 360); ctx.scale(v, v); ctx.font = '900 84px Deco'; ctx.fillStyle = '#2f5f8a'; ctx.fillText('VEL', -70, 0); ctx.fillStyle = 'rgba(42,28,18,' + (1 - j) + ')'; ctx.fillText('OURS', 140, 0); ctx.font = 'italic 600 36px GaramondItalic'; ctx.fillStyle = P.ink; ctx.globalAlpha = 1 - j; ctx.fillText('velvet', 30, 60); ctx.restore(); }
      if (c > 0) { ctx.save(); ctx.translate(lerp(300, 660, j), lerp(560, 360, j)); ctx.scale(c, c); ctx.font = '900 84px Deco'; ctx.fillStyle = '#c4371f'; ctx.fillText('CRO', -70, 0); ctx.fillStyle = 'rgba(42,28,18,' + (1 - j) + ')'; ctx.fillText('CHET', 150, 0); ctx.font = 'italic 600 36px GaramondItalic'; ctx.fillStyle = P.ink; ctx.globalAlpha = 1 - j; ctx.fillText('hook', 30, 60); ctx.restore(); }
      magnified(ctx, S, W / 2, 820, 220, tween(u, na, ho + 0.6), S.t);
      k.label(ctx, 'PATENTED IN THE 1950s', W / 2, 1080, 18, tween(u, ho, ho + 0.4));
    },
  },
  { // 32.9 "Every legend has a beginning."
    start: 32.5, title: 'Every Legend Has a Beginning', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S, beg = S.at('beginning.');
      ctx.save(); S.cam(lerp(1.0, 1.4, tween(u, 0, beg)), W / 2, 760);
      k.goldSky(ctx, -300, -300, W + 600, 800, S.t); k.ground(ctx, -300, 600, W + 600, 1100, '#8aa068', 3, 0.3); k.dog(ctx, W / 2 - 40, 900, 1.6, 1, S.t, { color: DOG, burrs: 1 });
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
  { t: 0.4, type: 'spray', gain: 0.5 }, { t: 2.4, type: 'pop', gain: 0.35 }, { t: 2.8, type: 'pop', gain: 0.35, pitch: 1.3 },
  { t: 4.2, type: 'stamp', gain: 0.4 }, { t: 5.5, type: 'wind', gain: 0.35 }, { t: 9.2, type: 'pop', gain: 0.3, pitch: 1.4 },
  ...Array.from({ length: 8 }, (_, i) => ({ t: +(11.0 + i * 0.18).toFixed(2), type: 'pop', gain: 0.18, pitch: 1.3 + (i % 3) * 0.1 })),
  { t: 15.2, type: 'clank', gain: 0.3, pitch: 1.6 }, { t: 15.8, type: 'chime', gain: 0.4, pitch: 1.3 },
  { t: 17.3, type: 'riser', gain: 0.35 }, { t: 18.9, type: 'pop', gain: 0.4, pitch: 0.8 }, { t: 19.4, type: 'pop', gain: 0.4, pitch: 0.9 },
  { t: 22.8, type: 'chime', gain: 0.4, pitch: 1.2 }, { t: 24.6, type: 'slide', gain: 0.35 }, { t: 26.3, type: 'slide', gain: 0.35 }, { t: 26.7, type: 'thud', gain: 0.45 },
  { t: 30.3, type: 'pop', gain: 0.35 }, { t: 31.4, type: 'pop', gain: 0.35, pitch: 1.2 }, { t: 31.9, type: 'stamp', gain: 0.45 },
];

export const music = {
  bpm: 108, root: 'G', maqam: 'rast', gain: 0.3,
  sections: [
    { from: 0, to: 3.8, mood: 'intro' },
    { from: 3.8, to: 14.5, mood: 'groove' },
    { from: 14.5, to: 21.9, mood: 'drive' },
    { from: 21.9, to: 34.7, mood: 'triumph' },
    { from: 34.7, to: 36.4, mood: 'end' },
  ],
};
