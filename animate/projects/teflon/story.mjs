// "The Empty Tank" — how Teflon (PTFE) was found, told as a chronicle on a
// lab-notebook ledger (`chronicle` device): a steel gas cylinder is the
// recurring object — its gauge reads empty, it still weighs full, it is sawn
// open, and the white powder inside becomes the plastic. No trademark logo is
// drawn; the name appears only as a word on the patent page. The 1941 card
// says "patented", the safest fact for that year.
import { clamp, lerp, ease, tween, rng, TAU } from '../../lib/core.mjs';
import { interior, bookCover } from '../../styles/ottoman/scenes.mjs';
import { act } from '../../styles/ottoman/acting.mjs';

export const meta = {
  title: 'The Empty Tank',
  slug: 'teflon-ottoman',
  style: 'ottoman',
  look: 'ledger',   // ledger (after tile, album, karagoz)
  ambient: 'dust',
  room: 'library',
  device: 'chronicle',
  width: 1080, height: 1920, fps: 30,
  duration: 36.0,
  voice: 'voice.mp3',
  seed: 1938,
  captionChars: 30,
  brand: { handle: '@HOWITSTARTED-YT1', logo: '../../../brand/logo.png' },
  outro: { at: 34.3, text: 'Subscribe for more origin stories' },
};

const PLUNKETT = { robe: '#efefef', inner: '#3a4a6a', sash: '#efefef', hat: 'shorthair', hair: '#2a1a12', skin: '#f1d1a8' };
const REBOK = { robe: '#efefef', inner: '#6a3a2a', sash: '#efefef', hat: 'cap', hatColor: '#3a3a4a', hair: '#5a3a2a', skin: '#e2b48a' };

// ---------- the recurring object: a steel gas cylinder ----------
function cylinder(ctx, S, x, base, s = 1, o = {}) {
  const { k, P } = S;
  ctx.save(); ctx.translate(x, base); ctx.scale(s, s); ctx.rotate(o.rot || 0);
  const half = o.cut || 0; // 0 = whole, 1 = sawn in two and opened
  for (const side of half > 0 ? [-1, 1] : [0]) {
    ctx.save(); ctx.translate(side * half * 120, 0); ctx.rotate(side * half * 0.12);
    ctx.save(); if (side) { ctx.beginPath(); ctx.rect(side < 0 ? -80 : 0, -460, 80, 470); ctx.clip(); }
    ctx.beginPath(); ctx.moveTo(-60, 0); ctx.lineTo(-60, -340); ctx.quadraticCurveTo(-60, -400, 0, -400); ctx.quadraticCurveTo(60, -400, 60, -340); ctx.lineTo(60, 0); ctx.closePath(); k.fillStroke(ctx, '#8a9aa8', P.ink, 3);
    k.rect(ctx, -60, -260, 120, 14, '#6a7a88', P.ink, 1.5); k.rect(ctx, -60, -120, 120, 14, '#6a7a88', P.ink, 1.5);
    if (side) { // the cut face, lined with white wax
      ctx.beginPath(); ctx.moveTo(0, -396); ctx.lineTo(0, 0); k.stroke(ctx, P.ink, 3);
      k.rect(ctx, side < 0 ? -50 : 0, -330, 50, 320, '#fbfaf4', P.ink, 1.5);
    }
    ctx.restore(); ctx.restore();
  }
  if (!half) { k.rect(ctx, -16, -440, 32, 42, '#5a5a5a', P.ink, 2); k.rect(ctx, -40, -452, 80, 14, '#c9a24a', P.ink, 2); } // the valve
  if (o.gauge != null && !half) { k.circle(ctx, 40, -430, 26, '#efe6cf', P.ink, 2); ctx.save(); ctx.translate(40, -430); ctx.rotate(lerp(-2.2, 2.2, o.gauge) * 0.5 - 0.9); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -20); k.stroke(ctx, P.vermDark, 3); ctx.restore(); }
  if (o.see) { ctx.save(); ctx.globalAlpha = o.see; k.rect(ctx, -40, -320, 80, 300, '#fbfaf4', null); ctx.restore(); }
  ctx.restore();
}
function powder(ctx, S, x, y, w, k1, seed = 4) {
  if (k1 <= 0) return;
  const { k, P } = S, R = rng(seed);
  ctx.beginPath(); ctx.moveTo(x - w / 2 * k1, y); ctx.quadraticCurveTo(x, y - 60 * k1, x + w / 2 * k1, y); ctx.closePath(); k.fillStroke(ctx, '#fbfaf4', P.ink, 2);
  for (let i = 0; i < 14 * k1; i++) k.circle(ctx, x + (R() - 0.5) * w * 0.8 * k1, y - R() * 30 * k1, 3 + R() * 3, '#ffffff', 'rgba(60,60,60,0.4)', 1);
}
function fridge(ctx, S, x, base, s = 1) { // a 1930s icebox-style refrigerator with a round coil on top
  const { k, P } = S;
  ctx.save(); ctx.translate(x, base); ctx.scale(s, s);
  k.rect(ctx, -90, -300, 180, 300, '#efeae0', P.ink, 3); k.rect(ctx, -80, -290, 160, 120, '#f6f2ea', P.ink, 2); k.rect(ctx, -80, -160, 160, 150, '#f6f2ea', P.ink, 2);
  k.rect(ctx, 54, -250, 12, 40, '#c9a24a', P.ink, 1.5); k.rect(ctx, 54, -110, 12, 40, '#c9a24a', P.ink, 1.5);
  ctx.beginPath(); ctx.ellipse(0, -330, 70, 30, 0, 0, TAU); k.fillStroke(ctx, '#bfbab0', P.ink, 2.5); for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.ellipse(0, -330, 70 - i * 14, 30 - i * 6, 0, 0, TAU); k.stroke(ctx, P.ink, 1.5); }
  for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-70 + i * 46, 0); ctx.lineTo(-74 + i * 46, 30); k.stroke(ctx, P.ink, 5); }
  ctx.restore();
}
function notebook(ctx, S, x, y, w, h, rot = 0) {
  const { k, P } = S;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  k.rect(ctx, -w / 2 - 10, -h / 2 - 8, w + 20, h + 16, '#5a3a24', P.ink, 2.5); k.rect(ctx, -w / 2, -h / 2, w, h, '#f6efdc', P.ink, 2);
  ctx.strokeStyle = 'rgba(70,90,140,0.3)'; ctx.lineWidth = 2; for (let yy = -h / 2 + 60; yy < h / 2 - 10; yy += 40) { ctx.beginPath(); ctx.moveTo(-w / 2 + 20, yy); ctx.lineTo(w / 2 - 20, yy); ctx.stroke(); }
  ctx.restore();
}

export const scenes = [
  { // 0.1 "Teflon was discovered inside a tank that seemed empty."
    start: 0, title: 'A Tank That Seemed Empty',
    draw(ctx, u, S) {
      const { k, P, W } = S, ta = S.at('tank'), se = S.at('seemed'), em = S.at('empty.');
      S.cam(lerp(1.3, 1.0, tween(u, 0, em + 0.5, ease.inOut)), W / 2, lerp(520, 640, tween(u, 0, em + 0.5)));
      ctx.fillStyle = '#23262e'; ctx.fillRect(-300, -300, W + 600, 1800);
      { const g = ctx.createRadialGradient(W / 2, 640, 40, W / 2, 640, 560); g.addColorStop(0, 'rgba(255,240,200,0.55)'); g.addColorStop(1, 'rgba(255,240,200,0)'); ctx.fillStyle = g; ctx.fillRect(-300, -300, W + 600, 1800); }
      k.rect(ctx, -300, 1000, W + 600, 600, '#3a3530', P.ink, 2);
      cylinder(ctx, S, W / 2, 1000, 1.1, { gauge: lerp(1, 0, tween(u, se - 0.3, em)), see: tween(u, em + 0.2, em + 0.9) * 0.9 });
      const q = tween(u, em - 0.2, em + 0.3, ease.outBack); if (q > 0) { ctx.save(); ctx.translate(800, 380); ctx.scale(q, q); ctx.fillStyle = P.vermDark; ctx.font = '900 140px Deco'; ctx.textAlign = 'center'; ctx.fillText('?', 0, 40); ctx.restore(); }
      k.label(ctx, 'THE GAUGE READS EMPTY', W / 2, 1080, 16, tween(u, se, se + 0.4));
    },
  },
  { // 5.5 "April 6th, 1938, New Jersey."
    start: 5.1, title: '6 April 1938', trans: 'page',
    draw(ctx, u, S) {
      const { k, P, W } = S, ap = S.at('April'), ye = S.at('1938,'), nj = S.at('Jersey.');
      S.cam(lerp(1.1, 1.0, tween(u, 0, 3.0, ease.inOut)), lerp(W / 2, 500, tween(u, 0, 3.0)), 640);
      ctx.fillStyle = '#5a3a24'; ctx.fillRect(-300, -300, W + 600, 1800);
      notebook(ctx, S, W / 2, 640, 760, 820, -0.02);
      k.calendarPage(ctx, 380, 560, 320, 'APRIL', '6', -0.05, tween(u, ap - 0.2, ap + 0.6));
      k.seal(ctx, 760, 420, 76, ' THE YEAR · 1938 ·', '1938', tween(u, ye - 0.1, ye + 0.5, ease.linear));
      k.label(ctx, 'JACKSON LABORATORY · DEEPWATER, NEW JERSEY', W / 2, 960, 15, tween(u, nj - 0.2, nj + 0.3));
    },
  },
  { // 9.4 "DuPont chemist Roy Plunkett is working on a new gas for refrigerators."
    start: 9.1, title: 'A Gas for Refrigerators', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, ro = S.at('Roy'), ga = S.at('gas'), re = S.at('refrigerators.');
      S.cam(lerp(1.0, 1.14, tween(u, ga - 0.3, re + 0.4, ease.inOut)), lerp(W / 2, 640, tween(u, ga - 0.3, re + 0.4)), 680);
      interior(ctx, S, { arches: 3, carpetColor: '#6a3a2a' });
      for (let i = 0; i < 4; i++) cylinder(ctx, S, 520 + i * 70, 1000, 0.5, {});
      const fq = tween(u, re - 0.4, re + 0.2, ease.outBack); if (fq > 0) fridge(ctx, S, 850, 1000, 1.05 * fq);
      k.figure(ctx, 250, 1010, { ...PLUNKETT, s: 0.95, face: 1, mood: 'calm', ...act('present', u, tween(u, ro - 0.2, ro + 0.4)) });
      k.label(ctx, 'ROY PLUNKETT, CHEMIST · AGE 27', 250, 1080, 15, tween(u, ro + 0.2, ro + 0.6));
      k.label(ctx, 'HE WANTED A SAFER COOLANT', 640, 340, 15, tween(u, re, re + 0.4));
    },
  },
  { // 13.9 "He opens a tank of it. Nothing comes out. But the tank still weighs as much as a full one,"
    start: 13.6, title: 'Empty, But Heavy', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, op = S.at('opens'), no = S.at('Nothing'), we = S.at('weighs'), fu = S.at('full');
      const onScale = tween(u, we - 0.5, we + 0.2, ease.inOut);
      S.cam(lerp(1.15, 1.0, tween(u, 0, 1.6, ease.inOut)), lerp(560, W / 2, tween(u, 0, 1.6)), 660);
      interior(ctx, S, { arches: 3, carpetColor: '#3d6a4a' });
      // a big brass balance: the "empty" tank on one pan, a full one on the other — level
      k.balance(ctx, W / 2, 1010, 2.2, lerp(0.8, 0, tween(u, fu - 0.4, fu + 0.3, ease.inOut)) * onScale);
      const lift = 1 - onScale;
      const tl = lerp(0.8, 0, tween(u, fu - 0.4, fu + 0.3, ease.inOut)) * onScale * 0.3 * 120 * 2.2;
      cylinder(ctx, S, lerp(560, W / 2 - 264, onScale), lerp(1000, 768 + tl, onScale), lerp(0.9, 0.5, onScale), { gauge: 0 });
      if (onScale > 0.3) { ctx.save(); ctx.globalAlpha = tween(u, we - 0.2, we + 0.3); cylinder(ctx, S, W / 2 + 264, 768 - tl, 0.5, { gauge: 1 }); ctx.restore(); }
      // the valve opens, and nothing comes out — just a lone puff
      const ov = tween(u, op - 0.1, op + 0.4); if (ov > 0 && lift > 0.5) { ctx.save(); ctx.globalAlpha = (1 - tween(u, no, no + 0.8)) * ov; k.circle(ctx, 560, 580, 10 + 20 * ov, 'rgba(255,255,255,0.8)', 'rgba(60,60,60,0.3)', 1.5); ctx.restore(); }
      k.figure(ctx, 190, 1010, { ...PLUNKETT, s: 0.9, face: 1, mood: u > no ? 'worry' : 'calm', ...act(u > no ? 'shrug' : 'present', u, tween(u, no - 0.2, no + 0.3)) });
      k.label(ctx, 'NOTHING', 560, 520, 16, tween(u, no, no + 0.4) * lift);
      k.label(ctx, 'STILL AS HEAVY AS A FULL ONE', W / 2, 1080, 15, tween(u, fu, fu + 0.4));
    },
  },
  { // 19.6 "so they cut it open. Inside, a slippery white waxy powder."
    start: 19.3, title: 'Cut It Open', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S, cu = S.at('cut'), op = S.at('open.'), in_ = S.at('Inside,'), po = S.at('powder.');
      S.cam(lerp(1.0, 1.2, tween(u, in_ - 0.3, po + 0.4, ease.inOut)), W / 2, lerp(680, 760, tween(u, in_ - 0.3, po + 0.4)));
      interior(ctx, S, { arches: 3, carpetColor: '#9a2a1e' });
      const saw = tween(u, cu - 0.3, op + 0.6), split = tween(u, op + 0.3, in_ + 0.3, ease.inOut);
      k.rect(ctx, W / 2 - 300, 990, 600, 40, '#3a3a3a', P.ink, 2.5);
      cylinder(ctx, S, W / 2, 1000, 1.0, { cut: split, rot: 0 });
      if (saw > 0 && split < 0.2) { const y = lerp(560, 960, (S.t * 2) % 1); ctx.save(); ctx.translate(W / 2 + 90, y); k.rect(ctx, 0, -14, 160, 28, '#9a9a9a', P.ink, 2); for (let i = 0; i < 10; i++) k.poly(ctx, [[i * 16, 14], [i * 16 + 8, 24], [i * 16 + 16, 14]], '#9a9a9a', P.ink, 1); k.rect(ctx, 160, -24, 60, 48, '#7a5a3a', P.ink, 2); ctx.restore(); for (let i = 0; i < 6; i++) { const a = -0.5 + i * 0.25; k.circle(ctx, W / 2 + 80 + Math.cos(a) * (20 + (S.t * 300 + i * 17) % 60), y + Math.sin(a) * 40, 3, '#ffd27a', null); } }
      powder(ctx, S, W / 2, 995, 200, tween(u, in_, po + 0.4));
      k.figure(ctx, 170, 1010, { ...REBOK, s: 0.8, face: 1, mood: split > 0.5 ? 'wow' : 'calm', armF: [lerp(0.6, 1.9, split), 0.2] });
      k.label(ctx, 'JACK REBOK, HIS ASSISTANT', 170, 1080, 15, tween(u, cu, cu + 0.4));
    },
  },
  { // 25.4 "The gas had turned into a brand new plastic."
    start: 25.1, title: 'A Brand-New Plastic', trans: 'page',
    draw(ctx, u, S) {
      const { k, P, W } = S, tu = S.at('turned'), pl = S.at('plastic.');
      S.cam(lerp(1.0, 1.1, tween(u, 0, 2.8)), W / 2, 640);
      ctx.fillStyle = '#5a3a24'; ctx.fillRect(-300, -300, W + 600, 1800);
      notebook(ctx, S, W / 2, 640, 800, 860, 0.01);
      // loose gas molecules (C with two F) drift, then link into one long chain
      const link = tween(u, tu - 0.3, pl + 0.3, ease.inOut), R = rng(12);
      for (let i = 0; i < 9; i++) {
        const fx = 220 + R() * 640, fy = 330 + R() * 500, tx = 260 + i * 70, ty = 620 + Math.sin(i * 1.1) * 30;
        const x = lerp(fx + Math.sin(S.t * 2 + i) * 14, tx, link), y = lerp(fy + Math.cos(S.t * 2 + i) * 14, ty, link);
        if (i > 0 && link > 0.9) { ctx.beginPath(); ctx.moveTo(260 + (i - 1) * 70 + 20, 620 + Math.sin((i - 1) * 1.1) * 30); ctx.lineTo(x - 20, y); k.stroke(ctx, P.ink, 4); }
        k.circle(ctx, x, y, 22, '#3a3a3a', P.ink, 2); ctx.fillStyle = '#fff'; ctx.font = '900 20px Deco'; ctx.textAlign = 'center'; ctx.fillText('C', x, y + 7);
        for (const sy of [-1, 1]) { k.circle(ctx, x, y + sy * 40, 14, '#9ad08a', P.ink, 1.5); ctx.fillStyle = P.ink; ctx.font = '900 16px Deco'; ctx.fillText('F', x, y + sy * 40 + 6); }
      }
      k.label(ctx, 'THE GAS MOLECULES LINKED INTO LONG CHAINS', W / 2, 960, 15, tween(u, pl - 0.2, pl + 0.3));
    },
  },
  { // 28.3 "By 1941, it has a name. Teflon."
    start: 27.9, title: 'It Has a Name', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, ye = S.at('1941,'), na = S.at('name.'), te = S.at('Teflon.');
      S.cam(lerp(1.12, 1.0, tween(u, 0, 2.4, ease.inOut)), W / 2, 640);
      ctx.fillStyle = '#4a2e1c'; ctx.fillRect(-300, -300, W + 600, 1800);
      for (let i = 0; i < 12; i++) { ctx.beginPath(); ctx.moveTo(-300, 120 + i * 110); ctx.bezierCurveTo(200, 100 + i * 110, 700, 150 + i * 110, W + 300, 120 + i * 110); k.stroke(ctx, 'rgba(30,18,10,0.35)', 3); }
      k.candle(ctx, 880, 930, 1.0, S.t);
      // the patent page with a ribbon and seal
      k.rect(ctx, 260, 300, 560, 640, '#fbf4e2', P.ink, 3); ctx.fillStyle = P.ink; ctx.font = '900 30px Deco'; ctx.textAlign = 'center'; ctx.fillText('PATENT', W / 2 - 0, 370);
      for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(310, 430 + i * 34); ctx.lineTo(770 - (i % 3) * 50, 430 + i * 34); k.stroke(ctx, 'rgba(60,40,20,0.3)', 3); }
      k.seal(ctx, 700, 840, 66, ' PATENTED · 1941 ·', '1941', tween(u, ye - 0.1, ye + 0.5, ease.linear));
      const tq = tween(u, te - 0.3, te + 0.4);
      if (tq > 0) { k.cartouche(ctx, W / 2, 700, 440, 110, P.paperLight, P.goldDark, 3); ctx.fillStyle = P.vermDark; ctx.font = '900 66px Deco'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('TEFLON'.slice(0, Math.ceil(6 * tq)), W / 2, 704); ctx.textBaseline = 'alphabetic'; }
      powder(ctx, S, 360, 900, 180, tween(u, na - 0.4, na), 7);
      k.label(ctx, 'THE CHEMICAL NAME: PTFE', W / 2, 1060, 15, tween(u, te + 0.4, te + 0.8));
    },
  },
  { // 32.3 "Every legend has a beginning."
    start: 32.0, title: 'Every Legend Has a Beginning', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S, beg = S.at('beginning.');
      ctx.save(); S.cam(lerp(1.0, 1.35, tween(u, 0, beg)), W / 2, 700);
      interior(ctx, S, { arches: 3, carpetColor: '#9a2a1e' }); k.rect(ctx, W / 2 - 300, 990, 600, 40, '#3a3a3a', P.ink, 2.5); cylinder(ctx, S, W / 2, 1000, 1.0, { cut: 1 }); powder(ctx, S, W / 2, 995, 200, 1);
      ctx.restore();
      const open = tween(u, beg - 0.1, beg + 0.55, ease.inOut);
      if (open > 0) {
        ctx.save(); ctx.beginPath(); ctx.arc(W / 2, 600, open * 900, 0, TAU); ctx.clip(); bookCover(ctx, S, u - beg); ctx.restore();
        if (open < 1) { ctx.beginPath(); ctx.arc(W / 2, 600, open * 900, 0, TAU); k.stroke(ctx, P.goldLight, 8); }
      }
    },
  },
];

// ---------- sound ----------
export const sfx = [
  ...scenes.slice(1).map(s => ({ t: s.start - 0.05, type: s.trans === 'cut' ? 'pop' : 'paper', gain: 0.28 })),
  { t: 2.8, type: 'clank', gain: 0.3 }, { t: 3.9, type: 'pluck', gain: 0.3, pitch: 0.8 },
  { t: 5.6, type: 'paper', gain: 0.3 }, { t: 6.5, type: 'stamp', gain: 0.35 },
  { t: 10.3, type: 'chime', gain: 0.3 }, { t: 12.4, type: 'pop', gain: 0.3 },
  { t: 14.0, type: 'spray', gain: 0.15 }, { t: 15.4, type: 'flop', gain: 0.3 }, { t: 17.6, type: 'clank', gain: 0.3 }, { t: 18.6, type: 'thud', gain: 0.35 },
  ...Array.from({ length: 5 }, (_, i) => ({ t: +(19.9 + i * 0.25).toFixed(2), type: 'crack', gain: 0.12, pitch: 1.5 })),
  { t: 21.2, type: 'thud', gain: 0.4 }, { t: 22.4, type: 'chime', gain: 0.4, pitch: 1.3 },
  { t: 26.0, type: 'riser', gain: 0.3 }, { t: 26.8, type: 'chime', gain: 0.4, pitch: 1.2 },
  { t: 28.2, type: 'stamp', gain: 0.35 }, { t: 30.9, type: 'gong', gain: 0.35 },
];

export const music = {
  bpm: 90, root: 'D', maqam: 'nihavend', gain: 0.26,
  sections: [
    { from: 0, to: 5.1, mood: 'intro' },
    { from: 5.1, to: 13.6, mood: 'groove' },
    { from: 13.6, to: 19.3, mood: 'drive' },
    { from: 19.3, to: 25.1, mood: 'drive' },
    { from: 25.1, to: 34.3, mood: 'triumph' },
    { from: 34.3, to: 36.0, mood: 'end' },
  ],
};
