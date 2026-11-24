// "Insulin for a Dollar" — told as a chronicle on a ledger page (`chronicle`
// device): one silver dollar keeps returning — on the patent at the start, in
// the account of the years, and three times over on the deed at the end.
// The medicine is shown calmly: no suffering on screen; the boy is shown only
// as he recovers, colour coming back into his face.
import { clamp, lerp, ease, tween, rng, TAU } from '../../lib/core.mjs';
import { interior, bookCover } from '../../styles/ottoman/scenes.mjs';
import { act } from '../../styles/ottoman/acting.mjs';

export const meta = {
  title: 'Insulin for a Dollar',
  slug: 'insulin-ottoman',
  style: 'ottoman',
  look: 'ledger',   // ledger (after scroll, night, album)
  ambient: 'dust',
  room: 'tiles',
  device: 'chronicle',
  width: 1080, height: 1920, fps: 30,
  duration: 42.0,
  voice: 'voice.mp3',
  seed: 1922,
  captionChars: 30,
  brand: { handle: '@HOWITSTARTED-YT1', logo: '../../../brand/logo.png' },
  outro: { at: 40.3, text: 'Subscribe for more origin stories' },
};

const BANTING = { robe: '#efefef', inner: '#3a3a4a', sash: '#efefef', hat: 'shorthair', hair: '#5a4a3a', skin: '#f1d1a8' };
const BEST = { robe: '#efefef', inner: '#2f5f8a', sash: '#efefef', hat: 'shorthair', hair: '#c9a46a', skin: '#f1d1a8' };
const COLLIP = { robe: '#efefef', inner: '#5a3a2a', sash: '#efefef', hat: 'shorthair', hair: '#3a2a20', glasses: true, skin: '#f1d1a8' };
const MACLEOD = { robe: '#3a3a4a', inner: '#efe6cf', sash: '#3a3a4a', hat: 'bald', hair: '#cfcfcf', mustache: true, mustacheColor: '#cfcfcf', skin: '#f1d1a8' };

function page(ctx, S) {
  const { k, W } = S;
  ctx.fillStyle = '#f3ead2'; ctx.fillRect(-300, -300, W + 600, 1800);
  for (let y = 80; y < 1150; y += 54) { ctx.beginPath(); ctx.moveTo(-300, y); ctx.lineTo(W + 300, y); k.stroke(ctx, 'rgba(60,90,140,0.16)', 1.5); }
}
function dollar(ctx, S, x, y, r, spin = 0) { const { k } = S; k.coin(ctx, x, y, r, spin, '$1'); }
function patentDoc(ctx, S, x, y, w, o = {}) {
  const { k, P } = S, h = w * 1.25;
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || -0.03);
  k.rect(ctx, -w / 2, -h / 2, w, h, '#f6efdc', P.ink, 2.5); k.rect(ctx, -w / 2 + 14, -h / 2 + 14, w - 28, h - 28, null, P.goldDark, 1.5);
  ctx.fillStyle = P.ink; ctx.font = `900 ${Math.round(w * 0.09)}px Deco`; ctx.textAlign = 'center'; ctx.fillText('PATENT', 0, -h / 2 + w * 0.16);
  ctx.font = `600 ${Math.round(w * 0.045)}px Garamond`; ctx.fillText(o.title || 'INSULIN AND METHOD', 0, -h / 2 + w * 0.26);
  for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.moveTo(-w * 0.38, -h / 2 + w * 0.36 + i * w * 0.07); ctx.lineTo(w * 0.38 - (i % 3) * 20, -h / 2 + w * 0.36 + i * w * 0.07); k.stroke(ctx, 'rgba(60,40,20,0.35)', 2); }
  k.circle(ctx, w * 0.26, h / 2 - w * 0.2, w * 0.1, P.vermDark, P.ink, 2);
  ctx.restore();
}
function flask(ctx, S, x, y, s, clear = 0) {
  const { k, P } = S;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-20, -160); ctx.lineTo(-20, -100); ctx.lineTo(-80, 0); ctx.lineTo(80, 0); ctx.lineTo(20, -100); ctx.lineTo(20, -160); ctx.closePath(); k.fillStroke(ctx, 'rgba(200,230,240,0.5)', P.ink, 2.5);
  ctx.beginPath(); ctx.moveTo(-56, -40); ctx.lineTo(56, -40); ctx.lineTo(80, 0); ctx.lineTo(-80, 0); ctx.closePath();
  const r = Math.round(lerp(120, 220, clear)), g = Math.round(lerp(90, 230, clear)), b = Math.round(lerp(50, 240, clear)); ctx.fillStyle = `rgba(${r},${g},${b},0.9)`; ctx.fill();
  ctx.restore();
}

export const scenes = [
  { // 0.0 "The people who made insulin sold the patent for one dollar."
    start: 0, title: 'Sold for a Dollar',
    draw(ctx, u, S) {
      const { k, P, W } = S, ma = S.at('made'), so = S.at('sold'), do_ = S.at('dollar.');
      S.cam(lerp(1.15, 1.0, tween(u, 0, do_ + 0.4, ease.inOut)), W / 2, 620);
      page(ctx, S);
      patentDoc(ctx, S, W / 2, 560, lerp(300, 520, tween(u, 0, ma + 0.5, ease.outBack)));
      const c = tween(u, so - 0.2, do_ + 0.2, ease.outBounce || ease.outCubic);
      dollar(ctx, S, lerp(1200, 700, c), lerp(200, 820, c), 70, (1 - c) * 12 + S.t * 0.5);
    },
  },
  { // 5.0 "Before the 1920s, type 1 diabetes was basically a death sentence."
    start: 4.6, title: 'Before the 1920s', trans: 'ink',
    draw(ctx, u, S) {
      const { k, P, W } = S, ty = S.at('type'), de = S.at('death');
      S.cam(lerp(1.0, 1.12, tween(u, 0, 4.6)), W / 2, 600);
      ctx.fillStyle = '#2a2030'; ctx.fillRect(-300, -300, W + 600, 1800);
      // the sand runs out; the only treatment was a near-starvation diet
      k.hourglass(ctx, W / 2, 560, 1.6, tween(u, 0, de + 0.6, ease.linear), 0);
      ctx.fillStyle = P.paperLight; ctx.font = '900 70px Deco'; ctx.textAlign = 'center'; ctx.fillText('BEFORE INSULIN', W / 2, 220);
      const pl = tween(u, de - 0.4, de + 0.3); if (pl > 0) { ctx.save(); ctx.globalAlpha = pl; k.ellipse(ctx, W / 2, 930, 120, 30, 0, '#efe6cf', P.ink, 2); k.circle(ctx, W / 2 - 20, 920, 10, P.green, null); ctx.restore(); }
      k.label(ctx, 'THE ONLY TREATMENT: A NEAR-STARVATION DIET', W / 2, 1050, 16, tween(u, de, de + 0.4));
    },
  },
  { // 11.0 "1921, Toronto."
    start: 10.4, title: 'Toronto, 1921', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W } = S, to = S.at('Toronto.');
      S.cam(lerp(1.1, 1.0, tween(u, 0, 2.8, ease.inOut)), W / 2, 620);
      k.nightSky(ctx, -300, -300, W + 600, 900, S.t); k.snow(ctx, -300, -300, W + 600, 1800, S.t, 70, 4);
      k.ground(ctx, -300, 800, W + 600, 900, '#e8ecf2', 3, 0.05);
      // a stone university building with a tower, windows lit
      k.rect(ctx, 140, 420, 800, 380, '#b8a888', P.ink, 3); k.rect(ctx, 470, 260, 140, 160, '#b8a888', P.ink, 3); k.poly(ctx, [[460, 260], [540, 180], [620, 260]], '#6a6a6a', P.ink, 2.5);
      for (let r = 0; r < 3; r++) for (let c = 0; c < 7; c++) k.arch(ctx, 200 + c * 110, 520 + r * 100, 50, 70, (r + c) % 3 === 0 ? 'rgba(255,214,120,0.95)' : '#3a4a6a');
      k.seal(ctx, 860, 160, 64, ' THE YEAR · 1921 ·', '1921', tween(u, 0.1, 0.5, ease.linear));
      k.label(ctx, 'UNIVERSITY OF TORONTO', W / 2, 1040, 20, tween(u, to, to + 0.4));
    },
  },
  { // 13.6 "Frederick Banting and student Charles Best start testing an extract from the pancreas."
    start: 13.3, title: 'Banting and Best', trans: 'page',
    draw(ctx, u, S) {
      const { k, P, W } = S, fr = S.at('Frederick'), ch = S.at('Charles'), te = S.at('testing'), pa = S.at('pancreas.');
      S.cam(lerp(1.0, 1.15, tween(u, te - 0.3, pa + 0.6, ease.inOut)), W / 2, 680);
      interior(ctx, S, { arches: 2, carpet: false });
      k.rect(ctx, 340, 820, 400, 30, '#7a5a3a', P.ink, 2.5);
      for (let i = 0; i < 3; i++) flask(ctx, S, 420 + i * 120, 816, 0.5, 0);
      k.figure(ctx, 220, 1000, { ...BANTING, s: 1.05, face: 1, mood: 'calm', ...act('think', u, tween(u, fr, fr + 0.4)) });
      k.figure(ctx, 860, 1000, { ...BEST, s: 0.98, face: -1, mood: 'calm', ...act('present', u, tween(u, ch, ch + 0.4)) });
      // a small diagram: the pancreas and the cell clusters it holds
      const d = tween(u, pa - 0.5, pa + 0.2, ease.outBack); if (d > 0) { ctx.save(); ctx.translate(W / 2, 400); ctx.scale(d, d); k.circle(ctx, 0, 0, 140, '#f6efdc', P.goldDark, 5); ctx.beginPath(); ctx.moveTo(-100, 20); ctx.bezierCurveTo(-60, -40, 40, -20, 100, -30); ctx.bezierCurveTo(90, 10, 0, 40, -100, 40); ctx.closePath(); k.fillStroke(ctx, '#e8a890', P.ink, 2); for (let i = 0; i < 5; i++) k.circle(ctx, -60 + i * 34, 6 - (i % 2) * 10, 7, '#c9a227', P.ink, 1); ctx.restore(); }
      k.label(ctx, 'FREDERICK BANTING', 220, 560, 18, tween(u, fr, fr + 0.4));
      k.label(ctx, 'CHARLES BEST', 860, 600, 18, tween(u, ch, ch + 0.4));
    },
  },
  { // 19.2 "With help from James Collip and John Macleod, they purify it."
    start: 18.9, title: 'Collip and Macleod', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, ja = S.at('James'), jo = S.at('John'), pu = S.at('purify');
      S.cam(lerp(1.0, 1.2, tween(u, pu - 0.3, pu + 1.2, ease.inOut)), W / 2, 640);
      interior(ctx, S, { arches: 3, carpet: false });
      // the murky extract clears, flask by flask
      const cl = tween(u, pu - 0.6, pu + 1.0, ease.inOut);
      for (let i = 0; i < 4; i++) flask(ctx, S, 330 + i * 140, 820, 0.7, clamp(cl * 4 - i));
      k.figure(ctx, 180, 1000, { ...COLLIP, s: 1.0, face: 1, mood: 'calm', ...act('present', u, tween(u, ja, ja + 0.4)) });
      k.figure(ctx, 900, 1000, { ...MACLEOD, s: 1.0, face: -1, mood: 'calm', ...act('think', u, tween(u, jo, jo + 0.4)) });
      k.label(ctx, 'JAMES COLLIP', 180, 560, 18, tween(u, ja, ja + 0.4));
      k.label(ctx, 'J.J.R. MACLEOD · LAB HEAD', 900, 560, 16, tween(u, jo, jo + 0.4));
    },
  },
  { // 23.9 "January 1922. A teenage boy, Leonard Thompson, gets the first injections and starts to recover."
    start: 23.4, title: 'January 1922', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S, ja = S.at('January'), le = S.at('Leonard'), in_ = S.at('injections'), re = S.at('recover.');
      S.cam(lerp(1.0, 1.15, tween(u, in_ - 0.3, re + 0.6, ease.inOut)), W / 2, 700);
      interior(ctx, S, { arches: 2, carpetColor: '#2f5f8a' });
      k.calendarPage(ctx, 800, 360, 200, 'JANUARY', '1922', 0.05, tween(u, ja, ja + 0.6));
      // a hospital bed; the boy sits up as his colour comes back
      const rec = tween(u, in_, re + 0.8, ease.inOut);
      k.rect(ctx, 260, 820, 520, 60, '#efefef', P.ink, 2.5); k.rect(ctx, 240, 700, 30, 300, '#9a9aa2', P.ink, 2); k.rect(ctx, 770, 760, 30, 240, '#9a9aa2', P.ink, 2); k.rect(ctx, 280, 780, 140, 40, '#f6efdc', P.ink, 2);
      ctx.save(); ctx.translate(380, 820); ctx.rotate(lerp(-1.2, -0.2, rec)); k.figure(ctx, 0, 0, { robe: '#cfe0ea', inner: '#efefef', sash: '#cfe0ea', hat: 'shorthair', hair: '#5a4a3a', skin: rec > 0.5 ? '#f1d1a8' : '#d8d0c8', s: 0.8, face: 1, kneel: true, mood: rec > 0.6 ? 'happy' : 'calm' }); ctx.restore();
      k.rect(ctx, 400, 780, 380, 50, '#f6efdc', P.ink, 2);
      k.label(ctx, 'LEONARD THOMPSON, AGE 14', W / 2, 560, 18, tween(u, le, le + 0.4));
    },
  },
  { // 32.0 "Then the inventors sell their patents to the University of Toronto for one dollar each."
    start: 31.6, title: 'One Dollar Each', trans: 'page',
    draw(ctx, u, S) {
      const { k, P, W } = S, se = S.at('sell'), un = S.at('University'), on = S.at('one'), ea = S.at('each.');
      S.cam(lerp(1.0, 1.12, tween(u, 0, 5.0)), W / 2, 620);
      page(ctx, S);
      patentDoc(ctx, S, W / 2, 520, 460, { rot: 0.02 });
      // three coins, one for each name on the deed
      for (let i = 0; i < 3; i++) { const c = tween(u, on - 0.5 + i * 0.25, on + 0.1 + i * 0.25, ease.outCubic); if (c > 0) dollar(ctx, S, lerp(1200, 360 + i * 180, c), lerp(-100, 900, c), 60, (1 - c) * 10); }
      k.label(ctx, 'TO THE UNIVERSITY OF TORONTO · 1923', W / 2, 1060, 18, tween(u, un, un + 0.4));
      k.label(ctx, 'BANTING, BEST & COLLIP · $1 EACH', W / 2, 220, 18, tween(u, ea, ea + 0.4));
    },
  },
  { // 38.6 "Every legend has a beginning."
    start: 38.0, title: 'Every Legend Has a Beginning', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S, beg = S.at('beginning.');
      ctx.save(); S.cam(lerp(1.0, 1.4, tween(u, 0, beg)), W / 2, 700);
      page(ctx, S); patentDoc(ctx, S, W / 2, 520, 460, { rot: 0.02 }); for (let i = 0; i < 3; i++) dollar(ctx, S, 360 + i * 180, 900, 60, S.t * 0.4 + i);
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
  { t: 0.6, type: 'paper', gain: 0.35 }, { t: 2.6, type: 'coins', gain: 0.45 }, { t: 3.5, type: 'chime', gain: 0.4, pitch: 1.3 },
  { t: 6.0, type: 'pluck', gain: 0.25, pitch: 0.7 }, { t: 9.0, type: 'gong', gain: 0.35, pitch: 0.6 },
  { t: 10.9, type: 'stamp', gain: 0.4 }, { t: 11.5, type: 'wind', gain: 0.3 },
  { t: 16.5, type: 'clank', gain: 0.25, pitch: 1.5 }, { t: 17.9, type: 'pop', gain: 0.35 },
  ...Array.from({ length: 4 }, (_, i) => ({ t: +(21.6 + i * 0.3).toFixed(2), type: 'drip', gain: 0.25 })), { t: 22.8, type: 'chime', gain: 0.4, pitch: 1.3 },
  { t: 24.0, type: 'stamp', gain: 0.35 }, { t: 28.7, type: 'pop', gain: 0.25, pitch: 1.4 }, { t: 30.6, type: 'chime', gain: 0.45, pitch: 1.2 },
  { t: 33.0, type: 'paper', gain: 0.3 }, { t: 35.8, type: 'coins', gain: 0.35 }, { t: 36.1, type: 'coins', gain: 0.35 }, { t: 36.4, type: 'coins', gain: 0.35 }, { t: 37.0, type: 'stamp', gain: 0.45 },
];

export const music = {
  bpm: 92, root: 'G', maqam: 'nihavend', gain: 0.28,
  sections: [
    { from: 0, to: 4.6, mood: 'intro' },
    { from: 4.6, to: 10.4, mood: 'sad' },
    { from: 10.4, to: 23.4, mood: 'groove' },
    { from: 23.4, to: 31.6, mood: 'triumph' },
    { from: 31.6, to: 40.3, mood: 'triumph' },
    { from: 40.3, to: 42.0, mood: 'end' },
  ],
};
