// "The Default Effect" — an INKBLOT case file (psychology, MindTrace).
// Johnson & Goldstein (2003), "Do Defaults Save Lives?", Science 302: organ-donor
// consent was 12% in opt-in Germany vs 99.98% in opt-out Austria.
// u = seconds since the scene started; S.at('word') = when that word is said.
import { clamp, lerp, ease, tween, rng, TAU, shake, pop } from '../../lib/core.mjs';
import { plate, caseCover, inkReveal } from '../../styles/inkblot/scenes.mjs';

export const meta = {
  title: 'The Default Effect',
  slug: 'default-effect-inkblot',
  style: 'inkblot',
  width: 1080, height: 1920, fps: 30,
  duration: 40.4,
  voice: 'voice.mp3',
  seed: 203,
  captionChars: 24,
  caseLine: 'THE MIND FILES  ·  CASE No. 2003  ·  CONFIDENTIAL',
  brandKit: 'mindtrace', // MindTrace (brand/mindtrace/): logo, handle, tagline, outro text
  outro: { at: 37.9 },
};

// a checkbox; tick 0..1 draws the check mark, cross 0..1 strikes it out
function box(ctx, k, P, x, y, s, tick = 0, o = {}) {
  k.rect(ctx, x - s / 2, y - s / 2, s, s, P.paperLight, P.ink, Math.max(3, s * 0.08), 4);
  if (tick > 0) {
    const pts = [[x - s * 0.3, y], [x - s * 0.08, y + s * 0.25], [x + s * 0.38, y - s * 0.32]];
    const n = tick < 0.5 ? [pts[0], [lerp(pts[0][0], pts[1][0], tick * 2), lerp(pts[0][1], pts[1][1], tick * 2)]]
      : [pts[0], pts[1], [lerp(pts[1][0], pts[2][0], tick * 2 - 1), lerp(pts[1][1], pts[2][1], tick * 2 - 1)]];
    ctx.beginPath(); ctx.moveTo(n[0][0], n[0][1]); for (const p of n.slice(1)) ctx.lineTo(p[0], p[1]); k.stroke(ctx, o.color || P.ink, s * 0.14);
  }
}
// an official form; rows = [[label, ticked 0..1]]
function form(ctx, k, P, x, y, w, title, rows, o = {}) {
  const h = 160 + rows.length * 100;
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0);
  k.rect(ctx, -w / 2, -h / 2, w, h, P.card, P.ink, 5, 6);
  k.rect(ctx, -w / 2, -h / 2, w, 76, o.head || P.ink, null, 0, 6);
  k.text(ctx, title, 0, -h / 2 + 40, 40, { font: 'display', color: P.paperLight, max: w - 40 });
  rows.forEach(([label, t], i) => {
    const ry = -h / 2 + 150 + i * 100;
    box(ctx, k, P, -w / 2 + 60, ry, 56, t, { color: o.tickColor });
    k.text(ctx, label, -w / 2 + 112, ry + 2, 38, { align: 'left', max: w - 140 });
  });
  if (o.foot) k.text(ctx, o.foot, 0, h / 2 - 34, 28, { color: P.inkSoft, max: w - 40 });
  ctx.restore();
}
function flag(ctx, k, P, x, y, cols, t) {
  k.line(ctx, x, y, x, y - 170, P.inkSoft, 6);
  const w = 110, h = 72;
  cols.forEach((c, i) => {
    ctx.beginPath();
    const y0 = y - 170 + i * h / 3;
    ctx.moveTo(x, y0);
    for (let j = 0; j <= 10; j++) ctx.lineTo(x + j / 10 * w, y0 + Math.sin(t * 4 + j * 0.6) * 4 * (j / 10));
    for (let j = 10; j >= 0; j--) ctx.lineTo(x + j / 10 * w, y0 + h / 3 + Math.sin(t * 4 + j * 0.6) * 4 * (j / 10));
    ctx.closePath(); k.fill(ctx, c);
  });
}
// puppet controller + strings onto a figure's hands and head
function strings(ctx, k, P, x, top, hands, t) {
  const sw = Math.sin(t * 2) * 12;
  k.rect(ctx, x - 130 + sw, top - 12, 260, 24, P.inkSoft, P.ink, 3, 6);
  k.rect(ctx, x - 12 + sw, top - 70, 24, 140, P.inkSoft, P.ink, 3, 6);
  for (const [hx, hy] of hands) k.line(ctx, x + sw + (hx - x) * 0.5, top, hx, hy, P.grey, 2);
}

export const scenes = [
  { // 0.1 "Governments don't need to force you. They just choose your default."
    start: 0, title: 'Choose Your Default',
    draw(ctx, u, S) {
      const { k, P, W } = S, fo = S.at('force'), ch = S.at('choose'), df = S.at('default');
      plate(ctx, S, { alpha: 0.12, seed: 4 });
      S.cam(lerp(1.06, 1.0, tween(u, 0, 4.6)), W / 2, 560);
      k.scrawl(ctx, 'force', 300, 170, 70, tween(u, fo - 0.2, fo + 0.2));
      if (u > fo + 0.4) k.penLine(ctx, [[200, 180], [300, 165], [410, 175]], tween(u, fo + 0.4, fo + 0.7), P.red, 9);
      form(ctx, k, P, W / 2, 620, 620, 'OFFICIAL FORM', [['Option A', tween(u, ch, ch + 0.4)], ['Option B', 0], ['Option C', 0]], { rot: -0.03, foot: 'already filled in for you' });
      k.stamp(ctx, 'DEFAULT', 730, 300, 60, tween(u, df, df + 0.2), 0.1);
    },
  },
  { // 5.1 "Germany and Austria are next-door neighbors. Same language, similar culture."
    start: 4.9, title: 'Next-Door Neighbors', trans: 'bleed',
    draw(ctx, u, S) {
      const { k, P, W } = S, au = S.at('Austria'), la = S.at('language'), cu = S.at('culture');
      plate(ctx, S, { alpha: 0.08, seed: 7 });
      k.house(ctx, 240, 900, 0.6, {});
      k.house(ctx, 700, 900, 0.6, { roof: P.redDark });
      flag(ctx, k, P, 80, 660, ['#16141a', '#c61f2a', '#ddb14d'], S.t);
      if (u > au - 0.2) flag(ctx, k, P, 860, 660, ['#c61f2a', '#f8f3e7', '#c61f2a'], S.t);
      k.text(ctx, 'GERMANY', 240, 990, 40, { font: 'display' });
      k.text(ctx, 'AUSTRIA', 700, 990, 40, { font: 'display', color: u > au ? P.ink : 'rgba(0,0,0,0)' });
      const b = pop(u, la - 0.2, 0.3);
      if (b) for (const bx of [240, 700]) { ctx.save(); ctx.translate(bx, 330); ctx.scale(b, b); k.rect(ctx, -110, -50, 220, 100, P.paperLight, P.ink, 4, 30); k.text(ctx, 'Hallo!', 0, 4, 42, { font: 'hand', color: P.red }); ctx.restore(); }
      k.scrawl(ctx, 'same language', W / 2, 160, 50, tween(u, la, la + 0.4));
      k.scrawl(ctx, 'similar culture', W / 2, 470, 46, tween(u, cu, cu + 0.4), { rot: -0.04 });
    },
  },
  { // 10.18 "In the early 2000s, in Germany, you had to check a box to become an organ donor."
    start: 10.05, title: 'Germany: Opt In', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, ea = S.at('early'), ch = S.at('check'), dn = S.at('donor');
      plate(ctx, S, { alpha: 0.08, seed: 10 });
      k.stamp(ctx, 'EARLY 2000s', 230, 110, 46, tween(u, ea, ea + 0.25), -0.1);
      flag(ctx, k, P, 780, 300, ['#16141a', '#c61f2a', '#ddb14d'], S.t);
      form(ctx, k, P, W / 2, 600, 700, 'ORGAN DONOR?', [['Yes, I want to donate', 0]], { foot: 'Germany: check the box to opt IN' });
      k.penCircle(ctx, W / 2 - 290, 620, 62, 62, tween(u, ch, ch + 0.5));
      k.heart(ctx, W / 2, 870, 60, P.red, tween(u, dn - 0.2, dn + 0.3));
      k.scrawl(ctx, 'empty by default', W / 2, 990, 48, tween(u, ch + 0.4, ch + 0.9));
    },
  },
  { // 15.16 "Only 12% were."
    start: 15.05, title: 'Only 12%', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, pc = S.at('12%');
      plate(ctx, S, { alpha: 0.08, seed: 15 });
      k.text(ctx, 'GERMANY', W / 2, 120, 50, { font: 'display' });
      k.percentGrid(ctx, W / 2 - 300, 190, 600, lerp(0, 12, tween(u, pc - 0.1, pc + 0.8)));
      k.text(ctx, '12%', W / 2, 900, 110, { font: 'display', color: P.red });
      k.scrawl(ctx, 'organ donors', W / 2, 1000, 44, tween(u, pc + 0.4, pc + 0.9));
    },
  },
  { // 17.7 "In Austria, you were a donor unless you checked a box to opt out."
    start: 17.6, title: 'Austria: Opt Out', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, dn = S.at('donor'), un = S.at('unless'), oo = S.at('opt');
      plate(ctx, S, { alpha: 0.08, seed: 18 });
      flag(ctx, k, P, 780, 300, ['#c61f2a', '#f8f3e7', '#c61f2a'], S.t);
      form(ctx, k, P, W / 2, 600, 700, 'ORGAN DONOR', [['Yes, I am a donor', tween(u, dn - 0.2, dn + 0.2)], ['No, opt me out', 0]], { foot: 'Austria: a donor unless you opt OUT', tickColor: P.red });
      k.scrawl(ctx, 'already yes', 300, 250, 52, tween(u, dn, dn + 0.4), { rot: -0.06 });
      k.penCircle(ctx, W / 2 - 290, 670, 62, 62, tween(u, oo - 0.2, oo + 0.4));
      k.scrawl(ctx, 'unless you act', W / 2, 960, 48, tween(u, un, un + 0.5));
    },
  },
  { // 22.28 "Almost 100% were."
    start: 22.2, title: 'Almost 100%', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, pc = S.at('100%');
      plate(ctx, S, { alpha: 0.08, seed: 22 });
      k.text(ctx, 'AUSTRIA', W / 2, 120, 50, { font: 'display' });
      k.percentGrid(ctx, W / 2 - 300, 190, 600, lerp(0, 99.98, tween(u, pc - 0.4, pc + 0.8)));
      k.text(ctx, '99.98%', W / 2, 900, 100, { font: 'display', color: P.red });
      // the two side by side
      const sb = tween(u, pc + 0.6, pc + 1.0);
      if (sb > 0) { ctx.save(); ctx.globalAlpha = sb; k.rect(ctx, 600, 940, 300, 90, P.paperLight, P.ink, 3, 10); k.text(ctx, 'Germany: 12%', 750, 985, 30, {}); ctx.restore(); }
    },
  },
  { // 25.16 "Here's the trick. Most people never change the default."
    start: 25.0, title: 'Nobody Changes It', trans: 'bleed',
    draw(ctx, u, S) {
      const { k, P, W } = S, ne = S.at('never'), ch = S.at('change');
      plate(ctx, S, { alpha: 0.08, seed: 25 });
      k.stamp(ctx, 'THE TRICK', 220, 110, 44, tween(u, 0.05, 0.25), -0.1);
      // the wide default road and a thin side path
      k.poly(ctx, [[300, 1060], [640, 1060], [560, 380], [480, 380]], P.paperDark, P.ink, 4);
      ctx.save(); ctx.setLineDash([6, 16]); ctx.beginPath(); ctx.moveTo(560, 820); ctx.quadraticCurveTo(760, 760, 880, 620); k.stroke(ctx, P.grey, 5); ctx.restore();
      k.sign(ctx, 360, 470, 230, 90, 'DEFAULT', { post: 90 });
      k.sign(ctx, 830, 560, 170, 64, 'change', { post: 60, ugly: true });
      // a stream of people all on the default road
      for (let i = 0; i < 6; i++) {
        const ph = ((u * 0.22 + i / 6) % 1), y = lerp(1060, 420, ph), x = lerp(470, 520, ph) + (i % 2 ? -20 : 20) * (1 - ph);
        k.figure(ctx, x, y, { s: lerp(0.7, 0.25, ph), face: 1, walk: u * 1.6 + i * 0.3, look: [0, -1], shadow: false, color: i === 3 ? P.inkSoft : P.ink });
      }
      k.scrawl(ctx, 'never change it', 300, 300, 50, tween(u, ne, ne + 0.5));
      k.penCircle(ctx, 830, 530, 110, 60, tween(u, ch, ch + 0.5));
    },
  },
  { // 29.48 "Whoever picks it, picks for you."
    start: 29.35, title: 'Whoever Picks It', trans: 'blink',
    draw(ctx, u, S) {
      const { k, P, W } = S, pk = S.at('picks'), fy = S.at('for');
      plate(ctx, S, { alpha: 0.1, seed: 29 });
      const fx = W / 2, sw = Math.sin(S.t * 2) * 0.15;
      strings(ctx, k, P, fx, 160, [[fx - 120, 640], [fx + 130, 640], [fx, 520]], S.t);
      k.figure(ctx, fx, 1030, { s: 1.05, face: 1, look: [0.4, 0.6], mood: 'calm', blink: 0.6, armL: [1.4 + sw, 0.2], armR: [1.4 - sw, 0.2], holdR: c => k.rect(c, -30, -20, 60, 40, P.card, P.ink, 3) });
      // the box ticks itself on the form at the figure's hand
      ctx.save(); ctx.translate(fx + 190, 720); box(ctx, k, P, 0, 0, 70, tween(u, fy - 0.3, fy + 0.2), { color: P.red }); ctx.restore();
      k.scrawl(ctx, 'picks for you', 760, 900, 52, tween(u, fy, fy + 0.5));
      k.scrawl(ctx, 'whoever picks it', 250, 300, 44, tween(u, pk - 0.1, pk + 0.4), { rot: -0.06 });
    },
  },
  { // 32.34 "So read every pre-checked box."
    start: 32.2, title: 'Read Every Box', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, rd = S.at('read'), pc = S.at('pre-checked');
      plate(ctx, S, { alpha: 0.08, seed: 32 });
      const un = tween(u, pc + 0.2, pc + 0.7);
      form(ctx, k, P, W / 2, 520, 760, 'SIGN UP', [['Send me offers', 1], ['Share my data with partners', 1 - un], ['Auto-renew my plan', 1], ['I agree to the terms', 1]], { foot: 'boxes come pre-checked' });
      const mg = tween(u, rd - 0.2, pc + 0.4);
      const mx = mg < 0.7 ? lerp(220, 700, mg / 0.7) : lerp(700, 300, (mg - 0.7) / 0.3), my = mg < 0.7 ? 420 + 40 * Math.sin(mg * 9) : lerp(420, 900, (mg - 0.7) / 0.3);
      k.magnifier(ctx, mx, my, 1.2, 0.6);
      k.penCircle(ctx, W / 2 - 320, 490, 62, 62, tween(u, pc, pc + 0.4));
      k.stamp(ctx, 'READ IT', 760, 930, 54, tween(u, pc + 0.3, pc + 0.5), -0.08);
    },
  },
  { // 35.56 "Follow for more dark psychology." → the case-file cover
    start: 35.4, title: 'More Dark Psychology', trans: 'cut',
    draw(ctx, u, S) {
      ctx.save(); plate(ctx, S, { alpha: 0.1, seed: 32 }); ctx.restore();
      inkReveal(ctx, S, tween(u, 0.1, 0.8, ease.linear), c => caseCover(c, S, u - 0.1, { handle: meta.brand.handle, caseNo: '2003', tagline: meta.brand.tagline }));
    },
  },
];

export const sfx = [
  { t: 0.2, type: 'paper', gain: 0.4 },
  { t: 1.5, type: 'pen', gain: 0.45 },
  { t: 2.2, type: 'pen', gain: 0.5 },
  { t: 2.9, type: 'click', gain: 0.6 },
  { t: 3.6, type: 'stamp', gain: 0.75 },
  { t: 4.9, type: 'splat', gain: 0.6 },
  { t: 5.7, type: 'wind', gain: 0.3 },
  { t: 7.6, type: 'pop', gain: 0.5 },
  { t: 7.8, type: 'pen', gain: 0.4 },
  { t: 8.9, type: 'pen', gain: 0.4 },
  { t: 10.05, type: 'fold', gain: 0.45 },
  { t: 10.4, type: 'stamp', gain: 0.7 },
  { t: 12.7, type: 'pen', gain: 0.45 },
  { t: 14.1, type: 'heartbeat', gain: 0.4 },
  { t: 15.05, type: 'whoosh', gain: 0.35 },
  { t: 15.4, type: 'pluck', gain: 0.4 },
  { t: 17.6, type: 'fold', gain: 0.45 },
  { t: 19.0, type: 'click', gain: 0.6 },
  { t: 20.8, type: 'pen', gain: 0.45 },
  { t: 22.2, type: 'whoosh', gain: 0.35 },
  { t: 22.4, type: 'riser', gain: 0.3 },
  { t: 23.5, type: 'chime', gain: 0.4 },
  { t: 25.0, type: 'splat', gain: 0.55 },
  { t: 25.1, type: 'stamp', gain: 0.5 },
  { t: 27.1, type: 'pen', gain: 0.45 },
  { t: 27.6, type: 'pen', gain: 0.4 },
  { t: 29.35, type: 'blink', gain: 0.45 },
  { t: 29.7, type: 'pen', gain: 0.4 },
  { t: 30.8, type: 'click', gain: 0.6 },
  { t: 31.0, type: 'pen', gain: 0.45 },
  { t: 32.2, type: 'fold', gain: 0.45 },
  { t: 32.5, type: 'slide', gain: 0.35 },
  { t: 33.4, type: 'pen', gain: 0.45 },
  { t: 33.7, type: 'click', gain: 0.6 },
  { t: 33.9, type: 'stamp', gain: 0.8 },
  { t: 35.45, type: 'splat', gain: 0.8 },
  { t: 35.85, type: 'fold', gain: 0.4 },
  { t: 36.6, type: 'stamp', gain: 0.8 },
  { t: 37.6, type: 'moth', gain: 0.35 },
  { t: 39.7, type: 'bell', gain: 0.3 },
];

export const music = {
  kit: 'mind', bpm: 96, root: 'E', scale: 'dorian', gain: 0.3,
  sections: [
    { from: 0, to: 4.9, mood: 'tense' },
    { from: 4.9, to: 15.05, mood: 'groove' },
    { from: 15.05, to: 25.0, mood: 'drive' },
    { from: 25.0, to: 35.4, mood: 'tense' },
    { from: 35.4, to: 40.4, mood: 'end' },
  ],
};
