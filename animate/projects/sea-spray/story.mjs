// "Operation Sea-Spray" — an INKBLOT case file (psychology, MindTrace).
// September 1950: a US Navy ship sprayed Serratia marcescens and Bacillus globigii off
// San Francisco to study how a biological attack would spread. The Army estimated
// nearly everyone in the city (~800,000) inhaled it. Soon after, Stanford's hospital saw
// a cluster of rare Serratia infections; patient Edward Nevin died. The government
// denied a link (Nevin v. United States, 1981). Public in 1976.
// Serratia grows bright red colonies — the red dots on screen. No likenesses, no logos.
// u = seconds since the scene started; S.at('word') = when that word is said.
import { clamp, lerp, ease, tween, rng, TAU, shake, pop } from '../../lib/core.mjs';
import { plate, caseCover, inkReveal } from '../../styles/inkblot/scenes.mjs';

export const meta = {
  title: 'Operation Sea-Spray',
  slug: 'sea-spray-inkblot',
  style: 'inkblot',
  width: 1080, height: 1920, fps: 30,
  duration: 37.6,
  voice: 'voice.mp3',
  seed: 277,
  captionChars: 24,
  caseLine: 'THE MIND FILES  ·  CASE No. 1950  ·  CONFIDENTIAL',
  brandKit: 'mindtrace', // MindTrace (brand/mindtrace/): logo, handle, tagline, outro text
  outro: { at: 35.5 },
};

function bridge(ctx, k, P, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const col = '#c0533a';
  for (const tx of [-150, 150]) { k.rect(ctx, tx - 12, -260, 24, 280, col, P.ink, 2); k.rect(ctx, tx - 18, -200, 36, 10, col); k.rect(ctx, tx - 18, -120, 36, 10, col); }
  ctx.beginPath(); ctx.moveTo(-320, -40); ctx.quadraticCurveTo(-240, -40, -150, -255); ctx.quadraticCurveTo(0, -40, 150, -255); ctx.quadraticCurveTo(240, -40, 320, -40); k.stroke(ctx, col, 5);
  for (let i = -14; i <= 14; i++) { const xx = i * 20; const top = Math.abs(xx) < 150 ? -255 + 215 * (1 - Math.pow(xx / 150, 2)) : -40 - 215 * Math.max(0, 1 - Math.pow((Math.abs(xx) - 150) / 170, 2)) * 0; k.line(ctx, xx, top, xx, -30, col, 1.5); }
  k.rect(ctx, -330, -36, 660, 14, col, P.ink, 2);
  ctx.restore();
}
function skyline(ctx, k, P, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const R = rng(6);
  for (let i = 0; i < 9; i++) { const h = 60 + R() * 140; k.rect(ctx, -270 + i * 60, -h, 52, h, P.inkSoft, P.ink, 2); for (let j = 0; j < 3; j++) k.rect(ctx, -260 + i * 60, -h + 12 + j * 24, 10, 10, P.ochre); }
  ctx.restore();
}
function navyShip(ctx, k, P, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  k.poly(ctx, [[-170, -30], [170, -30], [130, 30], [-140, 30]], '#5b6270', P.ink, 4);
  k.rect(ctx, -60, -90, 120, 60, '#8a8f87', P.ink, 3, 4); k.rect(ctx, -20, -140, 30, 50, '#5b6270', P.ink, 3);
  k.line(ctx, 80, -30, 120, -110, P.ink, 5); k.circle(ctx, 120, -110, 10, P.greyLight, P.ink, 2);
  ctx.restore();
}
// a drifting cloud of bacteria (red specks)
function mist(ctx, k, P, x0, y0, x1, y1, t, a, n = 80, seed = 3) {
  if (a <= 0) return;
  const R = rng(seed);
  ctx.save();
  for (let i = 0; i < n; i++) {
    const p = (R() + t * 0.08) % 1, sp = R() * 140 * (0.3 + p);
    const x = lerp(x0, x1, p) + Math.sin(i * 1.7 + t) * sp * 0.6, y = lerp(y0, y1, p) + Math.cos(i * 2.3 + t * 0.7) * sp * 0.4;
    ctx.globalAlpha = a * (0.25 + 0.5 * (1 - p)); k.circle(ctx, x, y, 2 + R() * 3, P.red);
  }
  ctx.restore();
}
function sea(ctx, k, P, W, y, t) {
  k.rect(ctx, -60, y, W + 120, 1200, '#b9cfe0');
  for (let i = 0; i < 4; i++) { ctx.beginPath(); for (let j = 0; j <= 24; j++) ctx.lineTo(j * W / 24, y + 30 + i * 50 + Math.sin(t * 2 + j + i) * 5); k.stroke(ctx, '#82a7c8', 3); }
}
function petri(ctx, k, P, x, y, r, n, t) {
  k.circle(ctx, x, y, r, 'rgba(240,232,210,0.9)', P.ink, 5); k.circle(ctx, x, y, r - 14, null, P.greyLight, 3);
  const R = rng(9);
  for (let i = 0; i < n; i++) { const a = R() * TAU, d = Math.sqrt(R()) * (r - 30); k.circle(ctx, x + Math.cos(a) * d, y + Math.sin(a) * d, 4 + R() * 12, i % 3 ? P.red : P.redDark); }
}

export const scenes = [
  { // 0.24 "In 1950, the U.S. Navy sprayed bacteria over San Francisco. On purpose."
    start: 0, title: 'Sprayed on Purpose',
    draw(ctx, u, S) {
      const { k, P, W } = S, yr = S.at('1950'), sp = S.at('sprayed'), sf = S.at('San'), op = S.at('purpose');
      plate(ctx, S, { alpha: 0.12, seed: 3 });
      k.stamp(ctx, '1950', 790, 110, 64, tween(u, yr, yr + 0.25), 0.1);
      sea(ctx, k, P, W, 700, S.t);
      skyline(ctx, k, P, 680, 700, 0.85);
      bridge(ctx, k, P, 260, 700, 0.7);
      navyShip(ctx, k, P, 300, 900, 0.8);
      mist(ctx, k, P, 300, 820, 720, 560, S.t, tween(u, sp - 0.2, sp + 0.8), 120);
      k.scrawl(ctx, 'San Francisco', 680, 380, 50, tween(u, sf, sf + 0.5), { rot: -0.04 });
      k.scrawl(ctx, 'bacteria', 300, 280, 50, tween(u, sp + 0.3, sp + 0.7));
      k.stamp(ctx, 'ON PURPOSE', W / 2, 1010, 58, tween(u, op, op + 0.2), -0.06);
    },
  },
  { // 6.49 "It was called Operation Sea Spray."
    start: 6.35, title: 'Operation Sea-Spray', trans: 'bleed',
    draw(ctx, u, S) {
      const { k, P, W } = S, op = S.at('Operation'), se = S.at('Sea');
      plate(ctx, S, { alpha: 0.08, seed: 6 });
      ctx.save(); ctx.translate(W / 2, 520); ctx.rotate(-0.02);
      k.poly(ctx, [[-380, -340], [-340, -390], [-120, -390], [-80, -340]], '#cfae6e', P.ink, 4);
      k.rect(ctx, -380, -340, 760, 680, '#dcbd7e', P.ink, 5, 6);
      k.text(ctx, 'US NAVY / ARMY', -230, -364, 24, { font: 'type' });
      k.typeOn(ctx, 'OPERATION', 0, -200, 76, tween(u, op - 0.1, op + 0.5), { font: 'type', align: 'center' });
      k.typeOn(ctx, 'SEA-SPRAY', 0, -110, 92, tween(u, se - 0.1, se + 0.6), { font: 'type', align: 'center', color: P.red });
      k.text(ctx, 'SEPTEMBER 1950', 0, -10, 36, { font: 'type', color: P.inkSoft });
      for (let i = 0; i < 4; i++) k.rect(ctx, -300, 70 + i * 50, 600 - (i * 83) % 220, 24, P.ink, null, 0, 2);
      ctx.restore();
      k.stamp(ctx, 'SECRET', 760, 970, 52, tween(u, se + 0.5, se + 0.7), -0.08);
    },
  },
  { // 9.34 "The test? How would a germ attack spread?"
    start: 9.2, title: 'How Would It Spread?', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, te = S.at('test?'), gm = S.at('germ'), sp = S.at('spread');
      plate(ctx, S, { alpha: 0.08, seed: 9 });
      // a simple map: the bay, the city on its peninsula, and red dots spreading
      k.rect(ctx, 90, 260, 760, 760, '#b9cfe0', P.ink, 5, 8);
      ctx.beginPath(); ctx.moveTo(300, 260); ctx.lineTo(560, 260); ctx.quadraticCurveTo(600, 400, 520, 520); ctx.quadraticCurveTo(470, 640, 560, 1020); ctx.lineTo(260, 1020); ctx.quadraticCurveTo(230, 700, 280, 520); ctx.quadraticCurveTo(310, 380, 300, 260); ctx.closePath(); k.fill(ctx, P.paperDark); k.stroke(ctx, P.ink, 4);
      ctx.beginPath(); ctx.moveTo(850, 380); ctx.quadraticCurveTo(700, 500, 760, 700); ctx.quadraticCurveTo(820, 860, 850, 1020); ctx.lineTo(850, 1020); ctx.closePath(); k.fill(ctx, P.paperDark); k.stroke(ctx, P.ink, 4);
      k.text(ctx, 'SAN', 400, 620, 30, { font: 'display' }); k.text(ctx, 'FRANCISCO', 400, 656, 30, { font: 'display' });
      k.text(ctx, 'PACIFIC', 170, 900, 26, { font: 'display', color: '#4b6f8f' }); k.text(ctx, 'BAY', 650, 820, 26, { font: 'display', color: '#4b6f8f' });
      const R = rng(5), g = tween(u, gm - 0.3, sp + 0.6);
      for (let i = 0; i < 160; i++) { const x = 120 + R() * 600, y = 300 + R() * 700, d = Math.hypot(x - 100, y - 470) / 700; if (d < g) k.circle(ctx, x, y, 4, P.red); }
      k.arrow(ctx, 40, 470, 200, 470, tween(u, gm - 0.4, gm));
      k.scrawl(ctx, 'the test?', 300, 180, 54, tween(u, te, te + 0.4), { rot: -0.05 });
      k.scrawl(ctx, 'a germ attack', 700, 180, 46, tween(u, gm, gm + 0.4));
    },
  },
  { // 12.97 "The Army later estimated almost everyone in the city breathed it in."
    start: 12.85, title: 'Almost Everyone', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, es = S.at('estimated'), al = S.at('almost'), br = S.at('breathed');
      plate(ctx, S, { alpha: 0.08, seed: 13 });
      const v = Math.floor(lerp(0, 800000, tween(u, es - 0.2, br, ease.outCubic)));
      k.text(ctx, v ? '≈ ' + v.toLocaleString('en-US') : '≈ ?', W / 2, 200, 110, { font: 'display', color: P.red, max: 880 });
      k.text(ctx, 'PEOPLE', W / 2, 300, 40, { font: 'display' });
      const hats = ['bowler', 'cloche', 'cap', null];
      for (let i = 0; i < 5; i++) k.figure(ctx, 130 + i * 170, 1040, { hat: hats[i % 4], s: 0.85, face: 1, look: [0.2, 0], mood: 'calm', shadow: false, skirt: i % 2 === 1 });
      mist(ctx, k, P, 40, 640, 940, 700, S.t, tween(u, al - 0.2, br + 0.4), 140, 7);
      k.scrawl(ctx, 'breathed it in', W / 2, 460, 50, tween(u, br, br + 0.5));
    },
  },
  { // 16.95 "Soon after, a rare infection showed up at a local hospital."
    start: 16.85, title: 'A Rare Infection', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, ra = S.at('rare'), ho = S.at('hospital');
      plate(ctx, S, { alpha: 0.08, seed: 17 });
      petri(ctx, k, P, 300, 480, 210, Math.floor(lerp(0, 40, tween(u, ra - 0.3, ra + 1.2))), S.t);
      k.scrawl(ctx, 'rare infection', 300, 200, 52, tween(u, ra, ra + 0.5), { rot: -0.04 });
      const h = pop(u, ho - 0.3, 0.4);
      if (h) { ctx.save(); ctx.translate(700, 1040); ctx.scale(h, h);
        k.rect(ctx, -170, -330, 340, 330, P.card, P.ink, 5);
        k.rect(ctx, -140, -390, 280, 64, P.paperLight, P.ink, 4, 6); k.text(ctx, 'HOSPITAL', 0, -357, 36, { font: 'display' });
        for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) k.rect(ctx, -130 + c * 95, -300 + r * 80, 60, 50, P.sky, P.ink, 3);
        k.rect(ctx, -40, -100, 80, 100, P.inkSoft, P.ink, 3);
        ctx.restore(); }
      k.text(ctx, 'Serratia grows red', 300, 740, 30, { font: 'hand', color: P.redDark });
      k.scrawl(ctx, 'soon after', 300, 880, 44, tween(u, 0.1, 0.5));
    },
  },
  { // 20.98 "One patient, Edward Nevin, died."
    start: 20.85, title: 'One Patient', trans: 'blink',
    draw(ctx, u, S) {
      const { k, P, W } = S, ed = S.at('Edward'), di = S.at('died');
      plate(ctx, S, { alpha: 0.12, seed: 21 });
      // an empty hospital bed, a name card and a single flower
      k.rect(ctx, 200, 760, 540, 40, P.paperLight, P.ink, 4, 8); k.rect(ctx, 200, 720, 120, 50, P.paperLight, P.ink, 3, 14);
      k.rect(ctx, 190, 640, 20, 340, P.greyLight, P.ink, 3); k.rect(ctx, 730, 700, 20, 280, P.greyLight, P.ink, 3);
      k.rect(ctx, 210, 800, 530, 20, P.greyLight, P.ink, 3);
      const n = tween(u, ed - 0.2, ed + 0.4);
      if (n > 0) { ctx.save(); ctx.globalAlpha = n; ctx.translate(W / 2, 400); ctx.rotate(-0.02);
        k.rect(ctx, -230, -110, 460, 220, P.card, P.ink, 4, 6);
        k.text(ctx, 'Edward Nevin', 0, -30, 56, { font: 'hand' });
        k.text(ctx, 'patient · 1950', 0, 40, 30, { font: 'type', color: P.inkSoft });
        ctx.restore(); }
      const f = tween(u, di - 0.2, di + 0.6);
      if (f > 0) { ctx.save(); ctx.globalAlpha = f; k.line(ctx, 470, 760, 470, 660, P.sage, 5); k.circle(ctx, 470, 650, 18, P.paperLight, P.ink, 3); for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; k.circle(ctx, 470 + Math.cos(a) * 20, 650 + Math.sin(a) * 20, 12, P.paperLight, P.ink, 2); } k.circle(ctx, 470, 650, 9, P.ochre); ctx.restore(); }
      k.text(ctx, 'died', 470, 960, 44, { font: 'display', color: u > di ? P.inkSoft : 'rgba(0,0,0,0)' });
    },
  },
  { // 24.06 "The Army denied any link."
    start: 23.95, title: 'Denied', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, de = S.at('denied'), li = S.at('link');
      plate(ctx, S, { alpha: 0.08, seed: 24 });
      navyShip(ctx, k, P, 220, 420, 0.7);
      ctx.save(); ctx.translate(720, 820); k.rect(ctx, -150, -180, 300, 180, P.card, P.ink, 4); k.text(ctx, 'HOSPITAL', 0, -150, 28, { font: 'display' }); ctx.restore();
      // red string between them, cut
      const c = tween(u, li, li + 0.3);
      ctx.beginPath(); ctx.moveTo(300, 450); ctx.lineTo(lerp(660, 470, c), lerp(640, 545, c)); k.stroke(ctx, P.red, 5);
      ctx.beginPath(); ctx.moveTo(660, 640); ctx.lineTo(lerp(300, 500, c), lerp(450, 560, c)); if (c > 0) k.stroke(ctx, P.red, 5);
      if (c > 0.3) { k.line(ctx, 440, 520, 520, 580, P.ink, 6); k.line(ctx, 440, 580, 520, 520, P.ink, 6); }
      k.stamp(ctx, 'DENIED', W / 2, 220, 80, tween(u, de, de + 0.2), -0.1);
      k.scrawl(ctx, 'any link', 300, 1000, 50, tween(u, li - 0.1, li + 0.3));
    },
  },
  { // 26.0 "Here's the trick. Nobody complains about a test they don't know exists."
    start: 25.9, title: 'A Test Nobody Knew About', trans: 'bleed',
    draw(ctx, u, S) {
      const { k, P, W } = S, nb = S.at('Nobody'), co = S.at('complains'), kn = S.at('know');
      plate(ctx, S, { alpha: 0.08, seed: 26 });
      k.stamp(ctx, 'THE TRICK', 220, 110, 44, tween(u, 0.05, 0.25), -0.1);
      // people go about their day, smiling, inside a red haze
      for (let i = 0; i < 4; i++) k.figure(ctx, 150 + i * 210, 1040, { hat: ['bowler', 'cloche', null, 'cap'][i], s: 0.85, face: i % 2 ? -1 : 1, walk: S.t * 1.2 + i, look: [i % 2 ? -1 : 1, 0], mood: 'smile', shadow: false });
      mist(ctx, k, P, 40, 700, 940, 640, S.t, 0.8, 120, 11);
      const b = pop(u, co - 0.2, 0.35);
      if (b) { ctx.save(); ctx.translate(W / 2, 400); ctx.scale(b, b); k.rect(ctx, -280, -90, 560, 180, P.paperLight, P.ink, 4, 30); k.text(ctx, 'COMPLAINTS: 0', 0, 0, 54, { font: 'display', color: P.red }); ctx.restore(); }
      k.scrawl(ctx, "they don't know", W / 2, 620, 50, tween(u, kn - 0.4, kn + 0.3));
    },
  },
  { // 30.45 "It stayed secret until 1976."
    start: 30.35, title: 'Secret Until 1976', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, sc = S.at('secret'), yr = S.at('1976');
      plate(ctx, S, { alpha: 0.08, seed: 30 });
      const y = Math.floor(lerp(1950, 1976, tween(u, 0.1, yr + 0.2, ease.linear)));
      k.text(ctx, String(y), W / 2, 200, 130, { font: 'display', color: P.red });
      const n = tween(u, yr + 0.1, yr + 0.6, ease.outBack);
      if (n > 0) { ctx.save(); ctx.translate(W / 2, 640); ctx.rotate(0.03); ctx.scale(n, n);
        k.rect(ctx, -300, -300, 600, 600, P.card, P.ink, 5, 4);
        k.text(ctx, 'THE DAILY RECORD', 0, -260, 30, { font: 'serif' }); k.line(ctx, -270, -234, 270, -234, P.ink, 3);
        ['ARMY SPRAYED', 'GERMS OVER', 'SAN FRANCISCO'].forEach((l, i) => k.text(ctx, l, 0, -180 + i * 56, 46, { font: 'display', max: 540 }));
        for (let i = 0; i < 6; i++) k.rect(ctx, -260, 30 + i * 36, 520, 12, P.greyLight, null, 0, 2);
        ctx.restore(); }
      k.scrawl(ctx, 'secret', 800, 380, 50, tween(u, sc, sc + 0.4), { rot: 0.05 });
    },
  },
  { // 33.46 "Follow for more dark psychology." → the case-file cover
    start: 33.3, title: 'More Dark Psychology', trans: 'cut',
    draw(ctx, u, S) {
      ctx.save(); plate(ctx, S, { alpha: 0.1, seed: 30 }); ctx.restore();
      inkReveal(ctx, S, tween(u, 0.1, 0.8, ease.linear), c => caseCover(c, S, u - 0.1, { handle: meta.brand.handle, caseNo: '1950', tagline: meta.brand.tagline }));
    },
  },
];

export const sfx = [
  { t: 0.1, type: 'waves', gain: 0.35 },
  { t: 0.3, type: 'stamp', gain: 0.65 },
  { t: 2.3, type: 'wind', gain: 0.45 },
  { t: 3.8, type: 'pen', gain: 0.4 },
  { t: 5.4, type: 'stamp', gain: 0.85 },
  { t: 6.35, type: 'splat', gain: 0.5 },
  { t: 7.4, type: 'typewriter', gain: 0.5 },
  { t: 8.9, type: 'stamp', gain: 0.6 },
  { t: 9.2, type: 'fold', gain: 0.45 },
  { t: 9.5, type: 'pen', gain: 0.4 },
  { t: 10.9, type: 'wind', gain: 0.4 },
  { t: 12.85, type: 'whoosh', gain: 0.35 },
  { t: 13.6, type: 'tick', gain: 0.35 },
  { t: 15.5, type: 'wind', gain: 0.35 },
  { t: 16.0, type: 'pen', gain: 0.4 },
  { t: 16.85, type: 'fold', gain: 0.45 },
  { t: 17.9, type: 'splat', gain: 0.4 },
  { t: 19.7, type: 'pop', gain: 0.5 },
  { t: 20.85, type: 'blink', gain: 0.45 },
  { t: 21.9, type: 'pen', gain: 0.35 },
  { t: 23.0, type: 'bell', gain: 0.3 },
  { t: 23.95, type: 'whoosh', gain: 0.35 },
  { t: 24.4, type: 'stamp', gain: 0.9 },
  { t: 25.15, type: 'snap', gain: 0.55 },
  { t: 25.9, type: 'splat', gain: 0.5 },
  { t: 26.0, type: 'stamp', gain: 0.45 },
  { t: 27.4, type: 'pop', gain: 0.5 },
  { t: 29.0, type: 'pen', gain: 0.4 },
  { t: 30.35, type: 'fold', gain: 0.45 },
  { t: 30.6, type: 'tick', gain: 0.35 },
  { t: 32.0, type: 'paper', gain: 0.5 },
  { t: 33.35, type: 'splat', gain: 0.75 },
  { t: 33.75, type: 'fold', gain: 0.4 },
  { t: 34.5, type: 'stamp', gain: 0.75 },
  { t: 35.5, type: 'moth', gain: 0.3 },
  { t: 37.0, type: 'bell', gain: 0.25 },
];

export const music = {
  kit: 'mind', bpm: 84, root: 'A', scale: 'harmonic', gain: 0.3,
  sections: [
    { from: 0, to: 9.2, mood: 'tense' },
    { from: 9.2, to: 16.85, mood: 'drive' },
    { from: 16.85, to: 25.9, mood: 'sad' },
    { from: 25.9, to: 33.3, mood: 'tense' },
    { from: 33.3, to: 37.6, mood: 'end' },
  ],
};
