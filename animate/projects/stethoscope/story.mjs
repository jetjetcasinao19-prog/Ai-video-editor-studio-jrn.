// "Why the Stethoscope Exists" — told through a doctor's notebook (`letters`
// device): Laennec's case notes open the story, the heartbeat he hears is
// written into them as a rhythm line, and his book of 1819 closes it. The
// patient is shown with full respect: always clothed, always at a modest
// distance; the "ear on the chest" custom is shown as a small diagram.
import { clamp, lerp, ease, tween, rng, TAU } from '../../lib/core.mjs';
import { interior, bookCover } from '../../styles/ottoman/scenes.mjs';
import { act } from '../../styles/ottoman/acting.mjs';

export const meta = {
  title: 'Why the Stethoscope Exists',
  slug: 'stethoscope-ottoman',
  style: 'ottoman',
  look: 'album',    // album (after ledger, tile, karagoz)
  ambient: 'dust',
  room: 'library',
  device: 'letters',
  width: 1080, height: 1920, fps: 30,
  duration: 36.7,
  voice: 'voice.mp3',
  seed: 1816,
  captionChars: 30,
  brand: { handle: '@HOWITSTARTED-YT1', logo: '../../../brand/logo.png' },
  outro: { at: 35.0, text: 'Subscribe for more origin stories' },
};

const LAENNEC = { robe: '#2a2a3a', inner: '#efe6cf', sash: '#2a2a3a', hat: 'shorthair', hair: '#5a4a3a', collar: true, skin: '#f1d1a8' };
const PATIENT = { robe: '#c9a8b8', robeP: 'dots', robePc: '#e8d0d8', inner: '#efe6cf', sash: '#8a5a7a', hat: 'bun', hair: '#4a2a1a', skin: '#f1d1a8' };

function heart(ctx, S, x, y, s, beat = 0) {
  const { k, P } = S, b = 1 + 0.12 * Math.max(0, Math.sin(beat));
  ctx.save(); ctx.translate(x, y); ctx.scale(s * b, s * b);
  ctx.beginPath(); ctx.moveTo(0, 30); ctx.bezierCurveTo(-60, -10, -40, -60, 0, -30); ctx.bezierCurveTo(40, -60, 60, -10, 0, 30); k.fillStroke(ctx, '#c4371f', P.ink, 2.5);
  ctx.restore();
}
// the heartbeat as a written rhythm: lub-dub spikes along a line, drawn up to k
function rhythm(ctx, S, x, y, w, k1, t = 0) {
  const { k } = S; if (k1 <= 0) return;
  ctx.save(); ctx.beginPath(); ctx.moveTo(x, y);
  const n = 80; for (let i = 1; i <= n * clamp(k1); i++) { const q = i / n, px = x + q * w, ph = (q * 4) % 1; let dy = 0; if (ph > 0.1 && ph < 0.16) dy = -70 * Math.sin((ph - 0.1) / 0.06 * Math.PI); else if (ph > 0.24 && ph < 0.29) dy = -40 * Math.sin((ph - 0.24) / 0.05 * Math.PI); ctx.lineTo(px, y + dy); }
  k.stroke(ctx, '#c4371f', 5); ctx.restore();
}
function tube(ctx, S, x, y, len, rot, wood = false) {
  const { k, P } = S;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  k.rect(ctx, 0, -16, len, 32, wood ? '#a8784a' : '#f6efdc', P.ink, 2);
  if (!wood) for (let i = 1; i < 6; i++) { ctx.beginPath(); ctx.moveTo(i * len / 6, -16); ctx.lineTo(i * len / 6 + 10, 16); k.stroke(ctx, 'rgba(60,40,20,0.3)', 1.5); }
  else { k.ellipse(ctx, 0, 0, 8, 22, 0, '#8a5a2a', P.ink, 2); k.ellipse(ctx, len, 0, 8, 16, 0, '#8a5a2a', P.ink, 2); for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(i * len / 4, -16); ctx.lineTo(i * len / 4, 16); k.stroke(ctx, 'rgba(60,30,10,0.4)', 2); } }
  ctx.restore();
}
function notebook(ctx, S, x, y, w, h, lines, k1, rot = -0.03) {
  const { k, P } = S;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  k.rect(ctx, -w / 2, -h / 2, w, h, '#f6efdc', P.ink, 2.5);
  for (let yy = -h / 2 + 50; yy < h / 2; yy += 36) { ctx.beginPath(); ctx.moveTo(-w / 2 + 16, yy); ctx.lineTo(w / 2 - 16, yy); k.stroke(ctx, 'rgba(60,90,140,0.2)', 1.2); }
  ctx.fillStyle = '#2a2a50'; ctx.font = 'italic 600 30px GaramondItalic'; ctx.textAlign = 'left';
  lines.forEach((l, i) => { const q = clamp(k1 * lines.length - i); if (q > 0) ctx.fillText(l.slice(0, Math.ceil(l.length * q)), -w / 2 + 24, -h / 2 + 44 + i * 36); });
  ctx.restore();
}

export const scenes = [
  { // 0.0 "The stethoscope was invented because a doctor felt awkward."
    start: 0, title: 'An Awkward Doctor',
    draw(ctx, u, S) {
      const { k, P, W } = S, in_ = S.at('invented'), aw = S.at('awkward.');
      S.cam(lerp(1.2, 1.0, tween(u, 0, aw + 0.4, ease.inOut)), W / 2, 680);
      interior(ctx, S, { arches: 2, carpetColor: '#2f5f8a' });
      // a wooden stethoscope spins in… then the doctor beside a patient, blushing
      const st = tween(u, 0.1, in_ + 0.3, ease.outBack); if (st > 0) tube(ctx, S, lerp(1200, 380, st), 420, 320, lerp(3, -0.1, st), true);
      k.figure(ctx, 300, 1000, { ...LAENNEC, s: 1.1, face: 1, mood: u > aw - 0.3 ? 'sad' : 'calm', ...act('worry', u, tween(u, aw - 0.6, aw)) });
      const bl = tween(u, aw - 0.4, aw + 0.2); if (bl > 0) { ctx.save(); ctx.globalAlpha = 0.6 * bl; k.circle(ctx, 316, 685, 10, '#e88a8a', null); ctx.restore(); }
      k.figure(ctx, 760, 1000, { ...PATIENT, s: 1.0, face: -1, mood: 'calm', kneel: true });
    },
  },
  { // 5.6 "1816, Paris."
    start: 4.9, title: 'Paris, 1816', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W } = S, pa = S.at('Paris.');
      S.cam(lerp(1.1, 1.0, tween(u, 0, 2.6, ease.inOut)), W / 2, 600);
      k.goldSky(ctx, -300, -300, W + 600, 800, S.t);
      ctx.save(); ctx.beginPath(); ctx.rect(-300, 820, W + 600, 900); ctx.clip(); k.waves(ctx, -300, 820, W + 600, 900, S.t, '#4a6a8a', '#6a8aaa', 14, 22); ctx.restore();
      // rows of tall houses with mansard roofs along the river, and a hospital block
      for (let i = 0; i < 8; i++) { const x = 40 + i * 130, h = 260 + (i % 3) * 40; k.rect(ctx, x, 820 - h, 120, h, ['#efe6cf', '#e8d6b8', '#d8c9a8'][i % 3], P.ink, 2); k.poly(ctx, [[x - 6, 820 - h], [x + 10, 820 - h - 50], [x + 110, 820 - h - 50], [x + 126, 820 - h]], '#6a7a8a', P.ink, 2); for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) k.rect(ctx, x + 22 + c * 50, 820 - h + 30 + r * 70, 26, 40, '#5a6a8a', P.ink, 1); }
      k.seal(ctx, 860, 180, 70, ' THE YEAR · 1816 ·', '1816', tween(u, 0.1, 0.5, ease.linear));
      k.label(ctx, 'NECKER HOSPITAL, PARIS', W / 2, 1060, 20, tween(u, pa, pa + 0.4));
    },
  },
  { // 7.9 "Dr. René Laennec has a young female patient with heart trouble."
    start: 7.6, title: 'Dr. Laennec', trans: 'page',
    draw(ctx, u, S) {
      const { k, P, W } = S, re = S.at('René'), pa = S.at('patient'), he = S.at('heart');
      S.cam(lerp(1.0, 1.2, tween(u, he - 0.4, he + 1.0, ease.inOut)), lerp(W / 2, 640, tween(u, he - 0.4, he + 1.0)), 680);
      interior(ctx, S, { arches: 3, carpetColor: '#9a2a1e' });
      k.figure(ctx, 280, 1000, { ...LAENNEC, s: 1.1, face: 1, mood: 'calm', ...act('think', u, tween(u, re, re + 0.4)) });
      k.figure(ctx, 760, 1000, { ...PATIENT, s: 1.0, face: -1, mood: 'sad', kneel: true, ...act('worry', u, tween(u, pa, pa + 0.4)) });
      const h = tween(u, he - 0.3, he + 0.2, ease.outBack); if (h > 0) { ctx.save(); ctx.translate(760, 420); ctx.scale(h, h); k.circle(ctx, 0, 0, 110, '#f6efdc', P.goldDark, 5); heart(ctx, S, 0, 10, 1.4, S.t * 6); ctx.beginPath(); ctx.moveTo(-10, -20); ctx.lineTo(6, 4); ctx.lineTo(-6, 20); k.stroke(ctx, P.ink, 3); ctx.restore(); }
      k.label(ctx, 'RENÉ LAENNEC', 280, 560, 22, tween(u, re, re + 0.4));
    },
  },
  { // 12.3 "Back then, doctors listened by pressing an ear right against the chest."
    start: 11.8, title: 'Ear to the Chest', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, li = S.at('listened'), pr = S.at('pressing'), ch = S.at('chest.');
      S.cam(lerp(1.0, 1.12, tween(u, 0, 3.6)), W / 2, 600);
      ctx.fillStyle = '#efe2c0'; ctx.fillRect(-300, -300, W + 600, 1800);
      // a plain diagram: ear → chest, with an arrow closing the gap
      const g = tween(u, pr - 0.2, ch + 0.2, ease.inOut);
      ctx.save(); ctx.translate(lerp(240, 430, g), 560); k.ellipse(ctx, 0, 0, 60, 90, 0, '#f1d1a8', P.ink, 3); ctx.beginPath(); ctx.arc(10, -10, 34, -1.2, 1.6); k.stroke(ctx, P.ink, 4); ctx.restore();
      ctx.save(); ctx.translate(760, 560); k.rect(ctx, -140, -170, 280, 340, '#c9a8b8', P.ink, 3); heart(ctx, S, -20, -10, 0.9, S.t * 6); ctx.restore();
      ctx.beginPath(); ctx.moveTo(lerp(320, 500, g), 700); ctx.lineTo(600, 700); k.stroke(ctx, P.vermDark, 5); k.poly(ctx, [[600, 686], [624, 700], [600, 714]], P.vermDark, null);
      ctx.fillStyle = P.ink; ctx.font = '900 56px Deco'; ctx.textAlign = 'center'; ctx.globalAlpha = tween(u, li, li + 0.4); ctx.fillText('EAR', lerp(240, 430, g), 400); ctx.fillText('CHEST', 760, 340); ctx.globalAlpha = 1;
      k.label(ctx, 'CALLED “IMMEDIATE AUSCULTATION”', W / 2, 920, 18, tween(u, ch, ch + 0.4));
    },
  },
  { // 17.0 "Laennec thinks that's improper, so he rolls a sheet of paper into a tube and listens through it."
    start: 16.5, title: 'A Roll of Paper', trans: 'page',
    draw(ctx, u, S) {
      const { k, P, W } = S, im = S.at('improper,'), ro = S.at('rolls'), tu = S.at('tube'), li = S.at('listens');
      S.cam(lerp(1.0, 1.2, tween(u, li - 0.4, li + 1.0, ease.inOut)), lerp(W / 2, 560, tween(u, li - 0.4, li + 1.0)), 680);
      interior(ctx, S, { arches: 2, carpetColor: '#2f5f8a' });
      // a flat sheet curls up into a tube
      const r = tween(u, ro - 0.2, tu + 0.3, ease.inOut);
      if (r < 1) { ctx.save(); ctx.translate(540, 460); k.rect(ctx, -160 * (1 - r) - 8, -110, 320 * (1 - r) + 16, 220, '#f6efdc', P.ink, 2); if (r > 0) k.ellipse(ctx, -160 * (1 - r), 0, 18 * r + 4, 110, 0, '#efe6cf', P.ink, 2); ctx.restore(); }
      const lis = tween(u, li - 0.3, li + 0.4, ease.inOut);
      k.figure(ctx, lerp(300, 420, lis), 1000, { ...LAENNEC, s: 1.1, face: 1, mood: u < im + 0.4 ? 'sad' : 'calm', armF: [lerp(0.4, 1.35, lis), 0.1] });
      k.figure(ctx, 800, 1000, { ...PATIENT, s: 1.0, face: -1, mood: 'calm', kneel: true });
      if (r >= 1) tube(ctx, S, lerp(540, 480, lis), lerp(460, 760, lis), lerp(240, 250, lis), lerp(1.57, 0, lis));
    },
  },
  { // 23.6 "He can hear her heart better than ever."
    start: 23.2, title: 'Better Than Ever', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S, he = S.at('heart'), be = S.at('better'), ev = S.at('ever.');
      S.cam(lerp(1.1, 1.0, tween(u, 0, 2.8, ease.inOut)), W / 2, 620);
      ctx.fillStyle = '#2a2030'; ctx.fillRect(-300, -300, W + 600, 1800);
      // sound travels up the tube; the beat is written into his notebook
      tube(ctx, S, 200, 760, 520, 0);
      for (let i = 0; i < 4; i++) { const q = ((S.t * 0.9 + i * 0.25) % 1); ctx.save(); ctx.globalAlpha = 1 - q; ctx.beginPath(); ctx.arc(lerp(720, 200, q), 760, 20 + q * 30, -0.8, 0.8); k.stroke(ctx, '#ffd27a', 5); ctx.restore(); }
      heart(ctx, S, 820, 760, 1.6, S.t * 6);
      notebook(ctx, S, W / 2, 360, 760, 300, ['Case notes, 1816 —', 'the heartbeat, clear', 'as never before:'], tween(u, he - 0.4, be + 0.6, ease.linear));
      rhythm(ctx, S, 180, 600, 720, tween(u, be, ev + 0.6), S.t);
    },
  },
  { // 26.6 "He builds a wooden version and calls it the stethoscope, Greek for chest and examine."
    start: 26.0, title: 'Stethos + Skopein', trans: 'page',
    draw(ctx, u, S) {
      const { k, P, W } = S, bu = S.at('builds'), wo = S.at('wooden'), ca = S.at('calls'), ch = S.at('chest'), ex = S.at('examine.');
      S.cam(lerp(1.0, 1.12, tween(u, 0, 5.0)), W / 2, 620);
      ctx.fillStyle = '#efe2c0'; ctx.fillRect(-300, -300, W + 600, 1800);
      // the wooden tube turns on a lathe, shavings flying
      const lw = tween(u, bu - 0.2, wo + 0.8, ease.outCubic);
      tube(ctx, S, lerp(1200, 280, lw), 820, 520, 0, true);
      if (lw > 0.3 && lw < 1) { const R = rng(Math.floor(S.t * 12)); for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.arc(540 + R() * 300 - 150, 780 - R() * 80, 8, 0, Math.PI); k.stroke(ctx, '#c9a878', 3); } }
      // the name assembles from two Greek words
      const a = tween(u, ch - 0.3, ch + 0.2, ease.outBack), b = tween(u, ex - 0.4, ex + 0.2, ease.outBack);
      ctx.textAlign = 'center';
      if (a > 0) { ctx.save(); ctx.translate(310, 360); ctx.scale(a, a); ctx.fillStyle = '#9a2a1e'; ctx.font = '900 70px Deco'; ctx.fillText('STETHOS', 0, 0); ctx.fillStyle = P.ink; ctx.font = 'italic 600 34px GaramondItalic'; ctx.fillText('chest', 0, 50); ctx.restore(); }
      if (b > 0) { ctx.save(); ctx.translate(780, 360); ctx.scale(b, b); ctx.fillStyle = '#2f5f8a'; ctx.font = '900 70px Deco'; ctx.fillText('SKOPEIN', 0, 0); ctx.fillStyle = P.ink; ctx.font = 'italic 600 34px GaramondItalic'; ctx.fillText('to examine', 0, 50); ctx.restore(); }
      const nm = tween(u, ca - 0.2, ca + 0.4); if (nm > 0) { ctx.save(); ctx.globalAlpha = nm; ctx.fillStyle = P.ink; ctx.font = '900 84px Deco'; ctx.fillText('STETHOSCOPE', W / 2, 600); ctx.restore(); }
      k.label(ctx, 'HIS BOOK ON IT: 1819', W / 2, 1040, 18, tween(u, ex, ex + 0.4));
    },
  },
  { // 33.3 "Every legend has a beginning."
    start: 32.9, title: 'Every Legend Has a Beginning', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S, beg = S.at('beginning.');
      ctx.save(); S.cam(lerp(1.0, 1.4, tween(u, 0, beg)), W / 2, 600);
      ctx.fillStyle = '#2a2030'; ctx.fillRect(-300, -300, W + 600, 1800); tube(ctx, S, 280, 600, 520, 0, true); rhythm(ctx, S, 180, 820, 720, 1, S.t);
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
const beats = (t0, n) => Array.from({ length: n }, (_, i) => [{ t: +(t0 + i * 0.9).toFixed(2), type: 'thud', gain: 0.35, pitch: 0.6 }, { t: +(t0 + i * 0.9 + 0.22).toFixed(2), type: 'thud', gain: 0.25, pitch: 0.7 }]).flat();
export const sfx = [
  ...scenes.slice(1).map(s => ({ t: s.start - 0.05, type: s.trans === 'cut' ? 'pop' : 'paper', gain: 0.28 })),
  { t: 0.6, type: 'whoosh', gain: 0.3 }, { t: 3.4, type: 'pluck', gain: 0.25, pitch: 0.8 },
  { t: 5.4, type: 'stamp', gain: 0.4 }, { t: 6.0, type: 'waves', gain: 0.25 },
  ...beats(10.6, 2),
  { t: 14.4, type: 'pop', gain: 0.3 }, { t: 17.6, type: 'pluck', gain: 0.25, pitch: 0.7 },
  { t: 19.0, type: 'paper', gain: 0.4 }, { t: 20.5, type: 'paper', gain: 0.3 }, { t: 22.0, type: 'chime', gain: 0.4, pitch: 1.2 },
  ...beats(23.5, 3), { t: 25.2, type: 'chime', gain: 0.45, pitch: 1.4 },
  { t: 26.6, type: 'slide', gain: 0.35 }, { t: 27.2, type: 'slide', gain: 0.3 }, { t: 30.4, type: 'pop', gain: 0.35 }, { t: 31.6, type: 'pop', gain: 0.35, pitch: 1.2 }, { t: 32.0, type: 'stamp', gain: 0.4 },
];

export const music = {
  bpm: 90, root: 'E', maqam: 'nihavend', gain: 0.28,
  sections: [
    { from: 0, to: 4.9, mood: 'intro' },
    { from: 4.9, to: 16.5, mood: 'groove' },
    { from: 16.5, to: 26.0, mood: 'drive' },
    { from: 26.0, to: 35.0, mood: 'triumph' },
    { from: 35.0, to: 36.7, mood: 'end' },
  ],
};
