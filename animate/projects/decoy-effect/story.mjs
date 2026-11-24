// "The Decoy Effect" — an INKBLOT case file (psychology, MindTrace).
// Dan Ariely, Predictably Irrational (2008): The Economist's offer — web $59,
// print $125, print + web $125. 100 MIT students: 16 / 0 / 84; without the
// print-only option: 68 / 32.
// u = seconds since the scene started; S.at('word') = when that word is said.
import { clamp, lerp, ease, tween, rng, TAU, shake, pop } from '../../lib/core.mjs';
import { plate, caseCover, inkReveal } from '../../styles/inkblot/scenes.mjs';

export const meta = {
  title: 'The Decoy Effect',
  slug: 'decoy-effect-inkblot',
  style: 'inkblot',
  width: 1080, height: 1920, fps: 30,
  duration: 54.9,
  voice: 'voice.mp3',
  seed: 74,
  captionChars: 24,
  caseLine: 'THE MIND FILES  ·  CASE No. 125  ·  CONFIDENTIAL',
  brandKit: 'mindtrace', // MindTrace (brand/mindtrace/): logo, handle, tagline, outro text
  outro: { at: 52.4 },
};

const OPTIONS = [['WEB ONLY', '$59', 'web'], ['PRINT ONLY', '$125', 'print'], ['PRINT + WEB', '$125', 'both']];
const CARD_X = [170, 470, 770];

function laptop(ctx, k, P, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  k.rect(ctx, -60, -70, 120, 80, P.ink, null, 0, 6); k.rect(ctx, -50, -62, 100, 64, P.sky);
  k.poly(ctx, [[-76, 14], [76, 14], [86, 30], [-86, 30]], P.inkSoft);
  ctx.restore();
}
function paper(ctx, k, P, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(-0.06);
  k.rect(ctx, -60, -80, 120, 150, P.paperLight, P.ink, 4, 3);
  k.rect(ctx, -50, -70, 100, 18, P.ink);
  for (let i = 0; i < 6; i++) k.line(ctx, -48, -36 + i * 16, i % 3 === 2 ? 10 : 48, -36 + i * 16, P.grey, 4);
  ctx.restore();
}
// one price card. o: { show 0..1, price 0..1, dust 0..1, glow 0..1, gone 0..1, free 0..1 }
function card(ctx, k, P, i, o, t = 0) {
  const [name, price, kind] = OPTIONS[i], x = CARD_X[i], show = ease.outBack(clamp(o.show ?? 1));
  if (show <= 0 || (o.gone ?? 0) >= 1) return;
  const g = o.gone || 0;
  ctx.save(); ctx.translate(x + g * 80, 590 + g * g * 900); ctx.rotate(g * 1.4); ctx.scale(show * 1.08, show * 1.08);
  if (o.glow) { ctx.save(); ctx.globalAlpha = o.glow * 0.5; k.rect(ctx, -150, -230, 300, 460, P.red, null, 0, 24); ctx.restore(); }
  k.rect(ctx, -130, -210, 260, 420, P.paperLight, o.glow ? P.red : P.ink, o.glow ? 7 : 5, 14);
  k.text(ctx, name, 0, -170, 30, { max: 230 });
  if (kind === 'web') laptop(ctx, k, P, 0, -40, 1.0);
  if (kind === 'print') paper(ctx, k, P, 0, -50, 0.95);
  if (kind === 'both') { paper(ctx, k, P, -40, -55, 0.75); laptop(ctx, k, P, 45, -20, 0.75); }
  if ((o.price ?? 1) > 0) { ctx.save(); ctx.globalAlpha = clamp(o.price ?? 1); k.text(ctx, price, 0, 120, 74, { font: 'display', color: kind === 'web' ? P.ink : P.red }); ctx.restore(); }
  if (o.free) { ctx.save(); ctx.translate(70, -110); ctx.rotate(0.3); ctx.scale(o.free, o.free); k.rect(ctx, -80, -26, 160, 52, P.red, null, 0, 6); k.text(ctx, 'FREE!', 0, 2, 36, { font: 'display', color: P.paperLight }); ctx.restore(); }
  if (o.dust) { // cobwebs and dust: nobody touches this one
    ctx.save(); ctx.globalAlpha = o.dust;
    ctx.fillStyle = 'rgba(140,128,110,0.35)'; ctx.fillRect(-130, -210, 260, 420);
    for (const [cx, cy, sx, sy] of [[-130, -210, 1, 1], [130, -210, -1, 1]]) {
      for (let r = 30; r <= 110; r += 26) { ctx.beginPath(); ctx.arc(cx, cy, r, sx > 0 ? 0 : Math.PI / 2, sx > 0 ? Math.PI / 2 : Math.PI); k.stroke(ctx, P.grey, 2); }
      for (let a = 0; a <= 4; a++) { const an = (sx > 0 ? 0 : Math.PI / 2) + a / 4 * Math.PI / 2; k.line(ctx, cx, cy, cx + Math.cos(an) * 120, cy + Math.sin(an) * 120, P.grey, 2); }
    }
    ctx.restore();
  }
  ctx.restore();
}
function menu(ctx, S, o = [{}, {}, {}]) { for (let i = 0; i < 3; i++) card(ctx, S.k, S.P, i, o[i] || {}, S.t); }
function headline(ctx, k, P, W) { k.rect(ctx, 60, 90, W - 120, 120, P.ink, null, 0, 8); k.text(ctx, 'THE ECONOMIST  ·  SUBSCRIBE', W / 2, 152, 40, { color: P.paperLight }); }
// 100 students: red = combo, sky = web only, ink = print only
function students(ctx, S, red, sky, title) {
  const { k, P, W } = S;
  plate(ctx, S, { alpha: 0.05, seed: 50 + Math.round(red) });
  k.text(ctx, title, W / 2, 110, 40, { color: P.inkSoft });
  const size = 600, c = size / 10, x0 = 170, y0 = 170;
  for (let i = 0; i < 100; i++) {
    const gx = x0 + (i % 10 + 0.5) * c, gy = y0 + (Math.floor(i / 10) + 0.5) * c;
    const col = i < red ? P.red : i < red + sky ? P.sky : P.greyLight;
    k.circle(ctx, gx, gy - 8, c * 0.17, col); k.ellipse(ctx, gx, gy + 14, c * 0.24, c * 0.16, 0, col);
  }
}

export const scenes = [
  { // 0.1 "Nobody picked this option, and that's exactly why it worked."
    start: 0, title: 'The Option Nobody Picked',
    draw(ctx, u, S) {
      const { k, P, W } = S, nb = S.at('Nobody'), wk = S.at('worked');
      plate(ctx, S, { alpha: 0.1, seed: 2 });
      S.cam(lerp(1.08, 1.0, tween(u, 0, 4.4)), W / 2, 540);
      menu(ctx, S, [{ show: tween(u, 0, 0.3), price: 0 }, { show: tween(u, 0.1, 0.4), price: 0, dust: tween(u, nb + 0.3, nb + 1.0) }, { show: tween(u, 0.2, 0.5), price: 0, glow: tween(u, wk, wk + 0.4) }]);
      k.scrawl(ctx, 'nobody', 470, 920, 70, tween(u, nb + 0.3, nb + 0.8));
      k.arrow(ctx, 470, 880, 470, 835, tween(u, nb + 0.6, nb + 0.9), P.red, 6, 0);
      k.stamp(ctx, 'IT WORKED', 770, 920, 46, tween(u, wk, wk + 0.2), 0.1);
    },
  },
  { // 4.62 "The Economist once offered three subscriptions."
    start: 4.5, title: 'Three Subscriptions', trans: 'bleed',
    draw(ctx, u, S) {
      const { k, P, W } = S, th = S.at('three');
      plate(ctx, S, { alpha: 0.06, seed: 5 });
      headline(ctx, k, P, W);
      menu(ctx, S, [0, 1, 2].map(i => ({ show: tween(u, th - 0.2 + i * 0.15, th + 0.1 + i * 0.15), price: 0 })));
      ['I', 'II', 'III'].forEach((r, i) => { const p = pop(u, th + i * 0.15, 0.3); if (p) k.text(ctx, r, CARD_X[i], 900, 60 * p, { font: 'display' }); });
    },
  },
  { // 7.6 "Web only, $59."
    start: 7.5, title: 'Web Only: $59', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, pr = S.at('only,');
      plate(ctx, S, { alpha: 0.06, seed: 5 }); headline(ctx, k, P, W);
      menu(ctx, S, [{ price: tween(u, pr + 0.3, pr + 0.6), glow: 0.6 }, { price: 0 }, { price: 0 }]);
    },
  },
  { // 9.9 "Print only, $125."
    start: 9.8, title: 'Print Only: $125', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, pr = S.at('only,');
      plate(ctx, S, { alpha: 0.06, seed: 5 }); headline(ctx, k, P, W);
      menu(ctx, S, [{}, { price: tween(u, pr + 0.4, pr + 0.7), glow: 0.6 }, { price: 0 }]);
    },
  },
  { // 12.94 "Print and web, also $125."
    start: 12.85, title: 'Print + Web: $125', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, al = S.at('also');
      plate(ctx, S, { alpha: 0.06, seed: 5 }); headline(ctx, k, P, W);
      menu(ctx, S, [{}, {}, { price: tween(u, al + 0.4, al + 0.7), glow: 0.6 }]);
      k.scrawl(ctx, 'also $125?!', 640, 920, 64, tween(u, al + 0.6, al + 1.2), { rot: -0.06 });
      { const q = pop(u, al + 0.9, 0.3); if (q) { ctx.save(); ctx.translate(620, 722); ctx.scale(q, q); k.circle(ctx, 0, 0, 34, P.paperLight, P.red, 4); k.text(ctx, '=', 0, 2, 64, { font: 'display', color: P.red }); ctx.restore(); } }
    },
  },
  { // 17.04 "Who'd pick print only? Nobody."
    start: 16.9, title: "Who'd Pick Print Only?", trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, nb = S.at('Nobody');
      plate(ctx, S, { alpha: 0.06, seed: 5 }); headline(ctx, k, P, W);
      S.cam(lerp(1.0, 1.25, tween(u, 0, 1.6)), 470, 560);
      menu(ctx, S, [{}, { dust: tween(u, 0.3, 1.4) }, {}]);
      // a tumbleweed rolls past the empty option
      const tx = lerp(-100, 1000, tween(u, nb - 0.6, nb + 1.2, ease.linear));
      ctx.save(); ctx.translate(tx, 880); ctx.rotate(tx / 60); for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.ellipse(0, 0, 50, 22, i * 0.5, 0, TAU); S.k.stroke(ctx, '#8a6a44', 3); } ctx.restore();
      k.stamp(ctx, '0 PICKS', 470, 400, 56, tween(u, nb, nb + 0.2), -0.12);
    },
  },
  { // 20.46 "A behavioral economist tested it on 100 MIT students."
    start: 19.95, title: '100 MIT Students', trans: 'bleed',
    draw(ctx, u, S) {
      const { k, P, W } = S, ec = S.at('economist'), n = S.at('100');
      students(ctx, S, 0, 0, 'THE TEST');
      k.scrawl(ctx, 'Dan Ariely', 760, 880, 60, tween(u, ec, ec + 0.5), { rot: -0.05 });
      k.stamp(ctx, '100 MIT STUDENTS', W / 2 - 80, 900, 44, tween(u, n + 0.2, n + 0.4), -0.06);
    },
  },
  { // 24.74 "Zero chose print only. 84 chose the $125 combo."
    start: 24.65, title: 'Zero vs. 84', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, ze = S.at('Zero'), n84 = S.at('84');
      const red = 84 * tween(u, n84 - 0.1, n84 + 0.9, ease.outCubic), sky = 16 * tween(u, n84 + 0.6, n84 + 1.1);
      students(ctx, S, red, sky, 'WHAT THEY CHOSE');
      k.text(ctx, 'PRINT ONLY: 0', 300, 860, 40, { color: P.ink });
      if (u > ze) k.penLine(ctx, [[160, 880], [440, 840]], tween(u, ze + 0.1, ze + 0.4), P.red, 6);
      k.text(ctx, 'COMBO: ' + Math.round(red), 690, 860, 48, { font: 'display', color: P.red });
      k.text(ctx, 'web only: 16', 690, 930, 32, { color: '#4b6f8f' });
    },
  },
  { // 31.06 "Then he removed the useless option."
    start: 30.6, title: 'Remove the Useless One', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, rm = S.at('removed'), us = S.at('useless');
      plate(ctx, S, { alpha: 0.06, seed: 5 }); headline(ctx, k, P, W);
      k.penLine(ctx, [[360, 390], [580, 790]], tween(u, rm - 0.1, rm + 0.2), P.red, 12);
      menu(ctx, S, [{}, { gone: tween(u, us, us + 0.8, ease.inQuad), dust: 1 }, {}]);
    },
  },
  { // 33.12 "Now only 32 chose the combo. Most took the cheap one."
    start: 33.05, title: 'Now Only 32', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, n = S.at('32'), ch = S.at('cheap');
      const red = lerp(84, 32, tween(u, n - 0.1, n + 0.8, ease.outCubic)), sky = 100 - red;
      students(ctx, S, red, sky, 'WITHOUT THE DECOY');
      k.text(ctx, 'COMBO: ' + Math.round(red), 300, 860, 48, { font: 'display', color: P.red });
      k.text(ctx, 'WEB: ' + Math.round(sky), 690, 860, 48, { font: 'display', color: '#4b6f8f' });
      k.penCircle(ctx, 690, 860, 150, 50, tween(u, ch, ch + 0.5), P.red, 6);
      k.scrawl(ctx, 'the cheap one', 690, 950, 50, tween(u, ch + 0.2, ch + 0.7));
    },
  },
  { // 39.66 "Here's the trick. The middle option was a decoy."
    start: 38.3, title: 'The Decoy', trans: 'blink',
    draw(ctx, u, S) {
      const { k, P, W, H } = S, dc = S.at('decoy');
      plate(ctx, S, { blot: false, bg: '#d6e2ea' });
      k.stamp(ctx, 'THE TRICK', 220, 110, 42, tween(u, 0.05, 0.25), -0.1);
      // a wooden decoy duck bobbing on a pond, wearing the middle price
      ctx.fillStyle = '#9db6c8'; ctx.fillRect(-100, 620, W + 200, H);
      for (let i = 0; i < 6; i++) { const y = 660 + i * 60, x = (u * 25 + i * 150) % 300; k.line(ctx, x - 60, y, x + 140, y, '#c9dbe6', 5); k.line(ctx, x + 330, y + 25, x + 480, y + 25, '#c9dbe6', 5); }
      const bob = Math.sin(u * 2.5) * 8, d = ease.outBack(tween(u, 0.2, 0.8));
      ctx.save(); ctx.translate(W / 2, 600 + bob); ctx.scale(d, d);
      k.ellipse(ctx, 0, 0, 260, 110, 0, '#8a5a32', P.ink, 6);
      k.ellipse(ctx, -40, -10, 150, 60, -0.1, '#6b4325');
      k.circle(ctx, 190, -150, 80, '#3d6b45', P.ink, 6); k.rect(ctx, 150, -90, 70, 60, '#3d6b45');
      k.poly(ctx, [[260, -160], [330, -140], [262, -118]], P.ochre, P.ink, 4);
      k.circle(ctx, 210, -170, 12, P.ink);
      // the price card hung on the duck
      ctx.save(); ctx.translate(-20, 10); ctx.rotate(-0.05); k.rect(ctx, -120, -50, 240, 100, P.paperLight, P.ink, 4, 6); k.text(ctx, 'PRINT $125', 0, 4, 40, { font: 'serif', color: P.red }); ctx.restore();
      ctx.restore();
      k.stamp(ctx, 'DECOY', 760, 300, 80, tween(u, dc, dc + 0.25), 0.12);
    },
  },
  { // 41.88 "It made the combo look like a free upgrade."
    start: 41.85, title: 'A "Free" Upgrade', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, fr = S.at('free');
      plate(ctx, S, { alpha: 0.06, seed: 5 }); headline(ctx, k, P, W);
      S.cam(lerp(1.0, 1.15, tween(u, 0, 2.6)), 620, 560);
      menu(ctx, S, [{}, { dust: 0.8 }, { glow: tween(u, 0.3, 0.8), free: ease.outBack(tween(u, fr - 0.1, fr + 0.3)) }]);
      k.arrow(ctx, 470, 870, 730, 870, tween(u, 0.2, 0.9), P.red, 7, 0.2);
      k.scrawl(ctx, 'same price… + web', 600, 960, 50, tween(u, 0.6, 1.4));
    },
  },
  { // 45.08 "Next time you see three prices, ask which one is there just to push you."
    start: 44.95, title: 'Which One Pushes You?', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, tp = S.at('three'), as = S.at('ask'), ps = S.at('push');
      plate(ctx, S, { alpha: 0.08, seed: 9 });
      // popcorn sizes at the movies (an everyday example)
      const sizes = [['S', '$4.00', 0.7], ['M', '$6.50', 0.85], ['L', '$7.00', 1.0]];
      sizes.forEach(([n, p, s], i) => {
        const q = pop(u, tp - 0.2 + i * 0.12, 0.3); if (!q) return;
        ctx.save(); ctx.translate(180 + i * 290, 640); ctx.scale(q * s, q * s);
        k.poly(ctx, [[-80, -200], [80, -200], [60, 60], [-60, 60]], P.paperLight, P.ink, 5);
        for (let j = -1; j <= 1; j++) k.poly(ctx, [[-80 + (j + 1) * 54, -200], [-54 + (j + 1) * 54, -200], [-46 + (j + 1) * 40, 60], [-60 + (j + 1) * 40, 60]], P.red);
        for (let j = 0; j < 7; j++) k.circle(ctx, -70 + j * 23, -210 - (j % 2) * 14, 22, '#fff6d8', P.ink, 2);
        k.text(ctx, n, 0, -70, 60, { font: 'display' });
        ctx.restore();
        k.text(ctx, p, 180 + i * 290, 760, 48, { font: 'display', color: i === 1 ? P.red : P.ink });
      });
      k.magnifier(ctx, 470 + Math.sin(u * 2) * 10, 420, 1.0, 0.5 * tween(u, as, as + 0.4));
      k.arrow(ctx, 520, 860, 760, 860, tween(u, ps, ps + 0.4), P.red, 8, -0.2);
      k.scrawl(ctx, 'spot the decoy', W / 2, 960, 60, tween(u, ps + 0.2, ps + 0.7));
    },
  },
  { // 50.2 "Follow for more mind tricks." → the case-file cover
    start: 50.1, title: 'More Mind Tricks', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      ctx.save(); plate(ctx, S, { alpha: 0.06, seed: 5 }); headline(ctx, k, P, W); menu(ctx, S, [{}, { dust: 0.8 }, {}]); ctx.restore();
      inkReveal(ctx, S, tween(u, 0.05, 0.75, ease.linear), c => caseCover(c, S, u - 0.05, { handle: meta.brand.handle, caseNo: '125', tagline: meta.brand.tagline }));
    },
  },
];

export const sfx = [
  { t: 0.1, type: 'pop', gain: 0.4 }, { t: 0.2, type: 'pop', gain: 0.4, pitch: 1.2 }, { t: 0.3, type: 'pop', gain: 0.4, pitch: 1.4 },
  { t: 0.8, type: 'wind', gain: 0.3 },
  { t: 1.1, type: 'pen', gain: 0.45 },
  { t: 3.3, type: 'stamp', gain: 0.8 },
  { t: 3.4, type: 'chime', gain: 0.35, pitch: 1.2 },
  { t: 4.5, type: 'splat', gain: 0.65 },
  { t: 5.8, type: 'pop', gain: 0.45 }, { t: 5.95, type: 'pop', gain: 0.45, pitch: 1.2 }, { t: 6.1, type: 'pop', gain: 0.45, pitch: 1.4 },
  { t: 7.5, type: 'click', gain: 0.6 },
  { t: 8.5, type: 'coins', gain: 0.3 },
  { t: 9.8, type: 'click', gain: 0.6 },
  { t: 10.9, type: 'coins', gain: 0.3 },
  { t: 12.85, type: 'click', gain: 0.6 },
  { t: 14.7, type: 'coins', gain: 0.3 },
  { t: 15.0, type: 'pen', gain: 0.5 },
  { t: 16.9, type: 'fold', gain: 0.45 },
  { t: 17.3, type: 'wind', gain: 0.4 },
  { t: 19.25, type: 'stamp', gain: 0.8 },
  { t: 19.95, type: 'splat', gain: 0.6 },
  { t: 20.5, type: 'pen', gain: 0.45 },
  { t: 22.5, type: 'stamp', gain: 0.6 },
  { t: 24.65, type: 'fold', gain: 0.45 },
  { t: 24.9, type: 'pen', gain: 0.5 },
  { t: 26.9, type: 'riser', gain: 0.35 },
  { t: 27.7, type: 'chime', gain: 0.45, pitch: 1.2 },
  { t: 30.6, type: 'whoosh', gain: 0.4 },
  { t: 31.0, type: 'pen', gain: 0.6 },
  { t: 31.8, type: 'paper', gain: 0.55 },
  { t: 32.3, type: 'flop', gain: 0.5 },
  { t: 33.05, type: 'fold', gain: 0.45 },
  { t: 34.0, type: 'riser', gain: 0.35 },
  { t: 34.7, type: 'flop', gain: 0.4 },
  { t: 37.3, type: 'pen', gain: 0.45 },
  { t: 38.3, type: 'blink', gain: 0.5 },
  { t: 38.4, type: 'stamp', gain: 0.4 },
  { t: 38.8, type: 'waves', gain: 0.4 },
  { t: 41.05, type: 'stamp', gain: 0.9 },
  { t: 41.85, type: 'whoosh', gain: 0.4 },
  { t: 43.5, type: 'pop', gain: 0.6, pitch: 1.3 },
  { t: 43.6, type: 'chime', gain: 0.4, pitch: 1.2 },
  { t: 44.95, type: 'fold', gain: 0.45 },
  { t: 45.9, type: 'pop', gain: 0.45 }, { t: 46.02, type: 'pop', gain: 0.45, pitch: 1.2 }, { t: 46.14, type: 'pop', gain: 0.45, pitch: 1.4 },
  { t: 47.7, type: 'slide', gain: 0.4 },
  { t: 49.0, type: 'whoosh', gain: 0.4 },
  { t: 49.3, type: 'pen', gain: 0.45 },
  { t: 50.15, type: 'splat', gain: 0.8 },
  { t: 50.5, type: 'fold', gain: 0.4 },
  { t: 51.3, type: 'stamp', gain: 0.8 },
  { t: 52.3, type: 'moth', gain: 0.35 },
  { t: 53.8, type: 'bell', gain: 0.3 },
];

export const music = {
  kit: 'mind', bpm: 100, root: 'G', scale: 'dorian', gain: 0.3,
  sections: [
    { from: 0, to: 4.5, mood: 'intro' },
    { from: 4.5, to: 19.95, mood: 'groove' },
    { from: 19.95, to: 30.6, mood: 'drive' },
    { from: 30.6, to: 38.3, mood: 'sad' },
    { from: 38.3, to: 44.95, mood: 'tense' },
    { from: 44.95, to: 50.1, mood: 'triumph' },
    { from: 50.1, to: 54.9, mood: 'end' },
  ],
};
