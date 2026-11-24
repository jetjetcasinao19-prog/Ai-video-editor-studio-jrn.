// "The Wrong Part That Saved Hearts" — the Greatbatch–Chardack pacemaker,
// told with one pulse line (`loom` device): a single green trace runs through
// every scene — on the oscilloscope, through the wrong resistor, around a
// weak heart, into the tiny device and onto the operating-room monitor.
// The operation is shown with respect: a draped patient, surgeons, a monitor.
import { clamp, lerp, ease, tween, rng, TAU } from '../../lib/core.mjs';
import { interior, bookCover } from '../../styles/ottoman/scenes.mjs';
import { act } from '../../styles/ottoman/acting.mjs';

export const meta = {
  title: 'The Wrong Part That Saved Hearts',
  slug: 'pacemaker-ottoman',
  style: 'ottoman',
  look: 'night',    // night (after album, ledger, tile)
  room: 'lattice',
  device: 'loom',
  width: 1080, height: 1920, fps: 30,
  duration: 41.0,
  voice: 'voice.mp3',
  seed: 1960,
  captionChars: 30,
  brand: { handle: '@HOWITSTARTED-YT1', logo: '../../../brand/logo.png' },
  outro: { at: 39.3, text: 'Subscribe for more origin stories' },
};

const GREEN = '#7af0a0';
const GREATBATCH = { robe: '#5a5a62', inner: '#efe6cf', sash: '#3a3a42', hat: 'shorthair', hair: '#3a2a20', glasses: true, skin: '#f1d1a8' };
const CHARDACK = { robe: '#efefef', inner: '#cfe0ea', sash: '#cfe0ea', hat: 'shorthair', hair: '#2a2a2a', skin: '#e2b48a' };

// the pulse trace: flat line with a spike every `period` px, drawn from x0 to x0+w*k
function pulse(ctx, S, x0, y, w, k1 = 1, period = 160, amp = 80, phase = 0, color = GREEN, lw = 5) {
  if (k1 <= 0) return;
  ctx.save(); ctx.beginPath(); ctx.moveTo(x0, y);
  for (let x = 0; x <= w * clamp(k1); x += 4) { const p = ((x + phase) % period) / period; let dy = 0; if (p > 0.45 && p < 0.5) dy = -amp * (p - 0.45) / 0.05; else if (p >= 0.5 && p < 0.56) dy = -amp + amp * 1.4 * (p - 0.5) / 0.06; else if (p >= 0.56 && p < 0.6) dy = amp * 0.4 * (1 - (p - 0.56) / 0.04); ctx.lineTo(x0 + x, y + dy); }
  ctx.shadowColor = color; ctx.shadowBlur = 10; ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.stroke(); ctx.restore();
}
function scope(ctx, S, x, y, w, h, draw) {
  const { k, P } = S;
  k.rect(ctx, x - 20, y - 20, w + 40, h + 80, '#5a5a62', P.ink, 3); k.rect(ctx, x, y, w, h, '#0e2a1e', P.ink, 2);
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.strokeStyle = 'rgba(122,240,160,0.15)'; ctx.lineWidth = 1; for (let gx = x; gx < x + w; gx += 40) { ctx.beginPath(); ctx.moveTo(gx, y); ctx.lineTo(gx, y + h); ctx.stroke(); } for (let gy = y; gy < y + h; gy += 40) { ctx.beginPath(); ctx.moveTo(x, gy); ctx.lineTo(x + w, gy); ctx.stroke(); } draw(); ctx.restore();
  for (let i = 0; i < 3; i++) k.circle(ctx, x + 40 + i * 60, y + h + 40, 14, '#2a2a2a', P.ink, 1.5);
}
function resistor(ctx, S, x, y, s, bands, rot = 0, glow = 0) {
  const { k, P } = S;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-90, 0); ctx.lineTo(90, 0); k.stroke(ctx, '#b8b8c0', 4);
  if (glow > 0) { ctx.save(); ctx.globalAlpha = glow; ctx.shadowColor = '#ff5a3a'; ctx.shadowBlur = 30; k.ellipse(ctx, 0, 0, 56, 22, 0, '#ff5a3a', null); ctx.restore(); }
  k.ellipse(ctx, 0, 0, 50, 18, 0, '#d8c09a', P.ink, 2);
  bands.forEach((c, i) => k.rect(ctx, -30 + i * 16, -17, 8, 34, c, null));
  ctx.restore();
}
function heart(ctx, S, x, y, s, beat = 0, color = '#c4371f') {
  const { k, P } = S, b = 1 + 0.14 * Math.max(0, Math.sin(beat));
  ctx.save(); ctx.translate(x, y); ctx.scale(s * b, s * b);
  ctx.beginPath(); ctx.moveTo(0, 30); ctx.bezierCurveTo(-60, -10, -40, -60, 0, -30); ctx.bezierCurveTo(40, -60, 60, -10, 0, 30); k.fillStroke(ctx, color, P.ink, 2.5);
  ctx.restore();
}
function device(ctx, S, x, y, s) { // the early implant: a small round epoxy disc with batteries and leads
  const { k, P } = S;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  k.circle(ctx, 0, 0, 60, 'rgba(220,210,170,0.85)', P.ink, 2.5);
  for (let i = 0; i < 4; i++) k.circle(ctx, -26 + (i % 2) * 52, -22 + Math.floor(i / 2) * 44, 16, '#9a9aa2', P.ink, 1.5);
  ctx.beginPath(); ctx.moveTo(50, 30); ctx.quadraticCurveTo(110, 80, 90, 150); ctx.moveTo(40, 40); ctx.quadraticCurveTo(90, 100, 60, 160); k.stroke(ctx, '#c4371f', 4);
  ctx.restore();
}

export const scenes = [
  { // 0.0 "One of the first implantable pacemakers started with the wrong part."
    start: 0, title: 'The Wrong Part',
    draw(ctx, u, S) {
      const { k, P, W } = S, fi = S.at('first'), pa = S.at('pacemakers'), wr = S.at('wrong'), pt = S.at('part.');
      S.cam(lerp(1.3, 1.0, tween(u, 0, pt + 0.4, ease.inOut)), W / 2, 600);
      ctx.fillStyle = '#10161e'; ctx.fillRect(-300, -300, W + 600, 1800);
      pulse(ctx, S, 0, 600, W, tween(u, 0, pa + 0.6, ease.linear), 220, 140, S.t * 220);
      const d = tween(u, pa - 0.2, pa + 0.4, ease.outBack); if (d > 0) device(ctx, S, 760, 360, 1.4 * d);
      const r = tween(u, wr - 0.3, wr + 0.2, ease.outBack); if (r > 0) resistor(ctx, S, W / 2, 900, 1.6 * r, ['#8a5a2a', '#2a2a2a', '#3d8458'], -0.1, 0.5 + 0.5 * Math.sin(S.t * 8));
    },
  },
  { // 5.6 "1950s, Buffalo, New York."
    start: 5.3, title: 'Buffalo, 1950s', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W } = S, bu = S.at('Buffalo,');
      S.cam(lerp(1.1, 1.0, tween(u, 0, 3.0, ease.inOut)), W / 2, 620);
      k.nightSky(ctx, -300, -300, W + 600, 900, S.t); k.snow(ctx, -300, -300, W + 600, 1800, S.t, 70, 2);
      k.ground(ctx, -300, 760, W + 600, 900, '#e8ecf2', 3, 0.05);
      // a brick university building with lit windows
      k.rect(ctx, 160, 420, 760, 360, '#8a4a3a', P.ink, 3); k.poly(ctx, [[140, 420], [540, 300], [940, 420]], '#5a3a2a', P.ink, 3);
      for (let r = 0; r < 3; r++) for (let c = 0; c < 7; c++) k.rect(ctx, 200 + c * 100, 450 + r * 100, 50, 60, (r + c) % 4 === 0 ? 'rgba(255,214,120,0.95)' : '#2a3a5a', P.ink, 1.5);
      k.seal(ctx, 860, 180, 64, ' THE 1950s · THE 1950s ·', '1950s', tween(u, 0.1, 0.5, ease.linear));
      k.label(ctx, 'BUFFALO, NEW YORK', W / 2, 1040, 20, tween(u, bu, bu + 0.4));
    },
  },
  { // 8.8 "Engineer Wilson Greatbatch is building a device to record heartbeats."
    start: 8.5, title: 'Wilson Greatbatch', trans: 'page',
    draw(ctx, u, S) {
      const { k, P, W } = S, wi = S.at('Wilson'), bu = S.at('building'), re = S.at('record');
      S.cam(lerp(1.0, 1.2, tween(u, bu - 0.2, re + 1.0, ease.inOut)), lerp(W / 2, 640, tween(u, bu - 0.2, re + 1.0)), 640);
      interior(ctx, S, { arches: 2, carpet: false });
      k.rect(ctx, 400, 840, 600, 30, '#7a5a3a', P.ink, 2);
      scope(ctx, S, 500, 500, 400, 260, () => pulse(ctx, S, 500, 660, 400, tween(u, re - 0.3, re + 0.6), 130, 70, S.t * 120, GREEN, 3));
      for (let i = 0; i < 4; i++) resistor(ctx, S, 460 + i * 70, 830, 0.5, ['#c4371f', '#2a2a2a', '#c9a227']);
      k.figure(ctx, 280, 1000, { ...GREATBATCH, s: 1.1, face: 1, mood: 'calm', ...act('present', u, tween(u, bu, bu + 0.4)) });
      k.label(ctx, 'WILSON GREATBATCH', 280, 560, 22, tween(u, wi, wi + 0.4));
    },
  },
  { // 13.4 "He installs the wrong part by mistake."
    start: 13.0, title: 'By Mistake', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, in_ = S.at('installs'), wr = S.at('wrong'), mi = S.at('mistake.');
      S.cam(lerp(1.0, 1.3, tween(u, wr - 0.3, mi + 0.4, ease.inOut)), W / 2, 560);
      ctx.fillStyle = '#2a2a32'; ctx.fillRect(-300, -300, W + 600, 1800);
      // a parts drawer, two look-alike resistors; the hand takes the wrong one
      k.rect(ctx, 180, 260, 720, 260, '#7a5a3a', P.ink, 3); k.rect(ctx, 200, 280, 330, 220, '#5a3a1a', P.ink, 2); k.rect(ctx, 550, 280, 330, 220, '#5a3a1a', P.ink, 2);
      resistor(ctx, S, 365, 390, 1.2, ['#8a5a2a', '#2a2a2a', '#d07a2a']);
      const pick = tween(u, in_ - 0.2, wr + 0.6, ease.inOut);
      resistor(ctx, S, lerp(715, W / 2, pick), lerp(390, 800, pick), 1.2 + pick * 0.6, ['#8a5a2a', '#2a2a2a', '#3d8458'], pick * 0.2, tween(u, wr, mi));
      ctx.fillStyle = '#efe6cf'; ctx.font = '700 30px Fell'; ctx.textAlign = 'center'; ctx.fillText('NEEDED', 365, 250); ctx.fillText('GRABBED', 715, 250);
      k.label(ctx, 'THE WRONG RESISTOR', W / 2, 1000, 20, tween(u, mi, mi + 0.4));
    },
  },
  { // 16.6 "Instead of recording, the circuit starts to pulse, steady, like a heartbeat."
    start: 16.3, title: 'It Starts to Pulse', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S, ci = S.at('circuit'), pu = S.at('pulse,'), st = S.at('steady,'), he = S.at('heartbeat.');
      S.cam(lerp(1.0, 1.15, tween(u, pu - 0.3, he + 0.6, ease.inOut)), W / 2, 600);
      ctx.fillStyle = '#10161e'; ctx.fillRect(-300, -300, W + 600, 1800);
      scope(ctx, S, 140, 260, 800, 440, () => { if (u < pu - 0.2) pulse(ctx, S, 140, 480, 800, 1, 9999, 0); else pulse(ctx, S, 140, 520, 800, tween(u, pu - 0.2, st, ease.linear) + 0.001, 200, 150, S.t * 200); });
      const beat = (S.t * 200 % 200) / 200;
      heart(ctx, S, W / 2, 940, 1.3, u > st ? beat * TAU : 0);
      if (u > st) { ctx.save(); ctx.globalAlpha = 0.6 * (1 - beat); k.circle(ctx, W / 2, 940, 80 + beat * 80, null, GREEN, 4); ctx.restore(); }
      k.label(ctx, 'A BLIP, A PAUSE, A BLIP', W / 2, 1080, 18, tween(u, he, he + 0.4));
    },
  },
  { // 22.7 "He realizes this could keep a weak heart beating."
    start: 22.2, title: 'A Weak Heart', trans: 'ink',
    draw(ctx, u, S) {
      const { k, P, W } = S, re = S.at('realizes'), we = S.at('weak'), be = S.at('beating.');
      S.cam(lerp(1.15, 1.0, tween(u, 0, be + 0.4, ease.inOut)), W / 2, 640);
      interior(ctx, S, { arches: 2, carpet: false });
      // a heart that falters… then each green spark sets it going again
      const help = tween(u, we, be + 0.2);
      const t2 = S.t * 5, missed = help < 0.5 && Math.floor(t2 / TAU) % 2 === 1;
      heart(ctx, S, 700, 560, 1.8, missed ? 0 : t2, help > 0.5 ? '#c4371f' : '#a05a5a');
      if (help > 0) for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + S.t * 3; ctx.save(); ctx.globalAlpha = help * (0.5 + 0.5 * Math.sin(S.t * 6 + i)); ctx.beginPath(); ctx.moveTo(700 + Math.cos(a) * 120, 560 + Math.sin(a) * 120); ctx.lineTo(700 + Math.cos(a) * 160, 560 + Math.sin(a) * 160); k.stroke(ctx, GREEN, 5); ctx.restore(); }
      pulse(ctx, S, 120, 860, 840, 1, 210, lerp(30, 90, help), S.t * 200, help > 0.5 ? GREEN : '#a05a5a', 4);
      k.figure(ctx, 280, 1000, { ...GREATBATCH, s: 1.05, face: 1, mood: help > 0.5 ? 'wow' : 'calm', ...act(help > 0.5 ? 'surprise' : 'think', u, tween(u, re - 0.2, re + 0.3)) });
    },
  },
  { // 27.2 "With surgeon William Chardack, he builds a tiny pacemaker that fits inside the body."
    start: 26.8, title: 'Small Enough to Fit Inside', trans: 'page',
    draw(ctx, u, S) {
      const { k, P, W } = S, ch = S.at('Chardack,'), ti = S.at('tiny'), fi = S.at('fits'), bo = S.at('body.');
      S.cam(lerp(1.0, 1.15, tween(u, ti - 0.3, bo + 0.6, ease.inOut)), W / 2, 620);
      interior(ctx, S, { arches: 3, carpet: false });
      k.figure(ctx, 200, 1000, { ...GREATBATCH, s: 1.0, face: 1, mood: 'happy', ...act('present', u, tween(u, ti - 0.3, ti)) });
      k.figure(ctx, 880, 1000, { ...CHARDACK, s: 1.05, face: -1, mood: 'calm', ...act('think', u, tween(u, ch, ch + 0.4)) });
      // a bulky box shrinks to a small round device
      const sh = tween(u, ti - 0.4, fi + 0.4, ease.inOut);
      if (sh < 1) { ctx.save(); ctx.globalAlpha = 1 - sh; k.rect(ctx, 400, 400 + sh * 200, 280 * (1 - sh * 0.7), 200 * (1 - sh * 0.7), '#5a5a62', P.ink, 3); ctx.restore(); }
      if (sh > 0.3) device(ctx, S, 540, 560, lerp(0.3, 1.0, (sh - 0.3) / 0.7));
      // a plain outline of a body, the device inside it
      const bdy = tween(u, fi - 0.2, bo + 0.4);
      if (bdy > 0) { ctx.save(); ctx.globalAlpha = bdy; ctx.beginPath(); ctx.ellipse(540, 420, 50, 60, 0, 0, TAU); ctx.moveTo(470, 490); ctx.lineTo(610, 490); ctx.lineTo(640, 820); ctx.lineTo(440, 820); ctx.closePath(); k.stroke(ctx, GREEN, 4); device(ctx, S, 560, 640, 0.35); ctx.restore(); }
      k.label(ctx, 'DR. WILLIAM CHARDACK', 880, 560, 18, tween(u, ch, ch + 0.4));
    },
  },
  { // 33.0 "In 1960, their pacemaker is implanted in a patient."
    start: 32.6, title: '1960', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S, yr = S.at('1960,'), im = S.at('implanted'), pa = S.at('patient.');
      S.cam(lerp(1.0, 1.15, tween(u, im - 0.3, pa + 0.8, ease.inOut)), W / 2, 640);
      ctx.fillStyle = '#cfe0ea'; ctx.fillRect(-300, -300, W + 600, 1800);
      // the operating room: a lamp, a draped table, two surgeons, a monitor with a steady beat
      k.ellipse(ctx, W / 2, 200, 220, 50, 0, '#efefef', P.ink, 3); const g = ctx.createRadialGradient(W / 2, 260, 10, W / 2, 260, 500); g.addColorStop(0, 'rgba(255,255,230,0.6)'); g.addColorStop(1, 'rgba(255,255,230,0)'); ctx.fillStyle = g; ctx.fillRect(-300, -300, W + 600, 1800);
      k.rect(ctx, 240, 760, 600, 60, '#5a8aa8', P.ink, 2.5); k.rect(ctx, 300, 820, 40, 180, '#8a8a92', P.ink, 2); k.rect(ctx, 740, 820, 40, 180, '#8a8a92', P.ink, 2);
      ctx.beginPath(); ctx.ellipse(540, 740, 280, 40, 0, Math.PI, TAU); k.fillStroke(ctx, '#8ab0c8', P.ink, 2);
      for (const [x, f] of [[200, 1], [880, -1]]) k.figure(ctx, x, 1000, { robe: '#6a9ab8', inner: '#8ab0c8', sash: '#6a9ab8', hat: 'cap', hatColor: '#6a9ab8', skin: '#e2b48a', s: 1.0, face: f, mood: 'calm', armF: [1.3, 0.3] });
      scope(ctx, S, 760, 380, 260, 160, () => pulse(ctx, S, 760, 470, 260, 1, 90, 50, S.t * 90, GREEN, 3));
      k.seal(ctx, 200, 200, 64, ' THE YEAR · 1960 ·', '1960', tween(u, yr - 0.1, yr + 0.3, ease.linear));
    },
  },
  { // 37.2 "Every legend has a beginning."
    start: 37.0, title: 'Every Legend Has a Beginning', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S, beg = S.at('beginning.');
      ctx.save(); S.cam(lerp(1.0, 1.4, tween(u, 0, beg)), W / 2, 600);
      ctx.fillStyle = '#10161e'; ctx.fillRect(-300, -300, W + 600, 1800); pulse(ctx, S, 0, 600, W, 1, 220, 140, S.t * 220); heart(ctx, S, W / 2, 360, 1.2, S.t * 6);
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
const beeps = (t0, n, dt = 1.0) => Array.from({ length: n }, (_, i) => ({ t: +(t0 + i * dt).toFixed(2), type: 'chime', gain: 0.22, pitch: 1.8 }));
export const sfx = [
  ...scenes.slice(1).map(s => ({ t: s.start - 0.05, type: s.trans === 'cut' ? 'pop' : 'paper', gain: 0.28 })),
  ...beeps(0.6, 4), { t: 3.7, type: 'alarm', gain: 0.1 },
  { t: 5.7, type: 'stamp', gain: 0.4 }, { t: 6.5, type: 'wind', gain: 0.3 },
  { t: 11.6, type: 'pluck', gain: 0.3, pitch: 1.2 },
  { t: 13.4, type: 'clank', gain: 0.3, pitch: 1.6 }, { t: 14.1, type: 'pop', gain: 0.35 }, { t: 15.2, type: 'alarm', gain: 0.1 },
  ...beeps(18.8, 4), { t: 21.1, type: 'chime', gain: 0.4, pitch: 1.2 },
  { t: 24.9, type: 'riser', gain: 0.3 }, ...beeps(25.6, 2),
  { t: 29.4, type: 'slide', gain: 0.3 }, { t: 31.0, type: 'pop', gain: 0.35 },
  { t: 33.0, type: 'stamp', gain: 0.45 }, ...beeps(34.0, 3),
];

export const music = {
  bpm: 96, root: 'A', maqam: 'nihavend', gain: 0.28,
  sections: [
    { from: 0, to: 5.3, mood: 'intro' },
    { from: 5.3, to: 16.3, mood: 'groove' },
    { from: 16.3, to: 26.8, mood: 'drive' },
    { from: 26.8, to: 39.3, mood: 'triumph' },
    { from: 39.3, to: 41.0, mood: 'end' },
  ],
};
