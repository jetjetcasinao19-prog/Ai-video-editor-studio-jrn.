// "The Zeigarnik Effect" — an INKBLOT case file (psychology).
// u = seconds since the scene started; S.at('word') = when that word is said.
import { clamp, lerp, ease, tween, rng, TAU, shake, pop, noise1 } from '../../lib/core.mjs';
import { plate, cafe, study, night, dream, caseCover, inkReveal } from '../../styles/inkblot/scenes.mjs';

export const meta = {
  title: 'The Zeigarnik Effect',
  slug: 'zeigarnik-effect-inkblot',
  style: 'inkblot',
  width: 1080, height: 1920, fps: 30,
  duration: 53.2,
  voice: 'voice.mp3',
  seed: 27,
  captionChars: 24,
  caseLine: 'THE MIND FILES  ·  CASE No. 1927  ·  CONFIDENTIAL',
  brand: { handle: '@MINDTRACEOFFICIAL-YT', logo: '../../../brand/logo.png' },
  outro: { at: 49.5, text: 'Subscribe for more origin stories' },
};

// ---- the cast ----
const LEWIN = { glasses: true, hair: 'slick', tie: '#c61f2a' };
const BLUMA = { hat: 'cloche', hair: 'bob', skirt: true, band: '#c61f2a' };
const STUDENT = { hat: 'cap', tie: '#82a7c8' };
const WAITER = { hair: 'slick', apron: true, bowtie: true, mustache: true };
const ORDER = ['pretzel', 'beer', 'cake', 'sausage', 'coffee', 'bread', 'wine', 'soup'];

// an icon on a small paper disc (readable on ink)
function dish(ctx, k, name, x, y, s = 1, a = 1) {
  if (s <= 0 || a <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp(a); ctx.translate(x, y); ctx.scale(s, s);
  k.circle(ctx, 0, -8, 52, k.P.paperLight, k.P.ink, 4);
  ctx.translate(0, 8); ctx.scale(0.72, 0.72); k.FOOD[name](ctx); ctx.restore();
}
// the order held in mind: a grid of dishes, each inside a red open loop
function heldOrder(ctx, S, u, o) {
  const { k, P } = S;
  ORDER.forEach((name, i) => {
    const cx = -88 + (i % 3) * 84, cy = -262 + Math.floor(i / 3) * 84;
    const lit = o.lit ? tween(u, o.lit + i * 0.14, o.lit + i * 0.14 + 0.25, ease.outBack) : 1;
    const close = o.close != null ? tween(u, o.close + i * 0.03, o.close + i * 0.03 + 0.25) : 0;
    const fall = o.fall != null ? tween(u, o.fall + (i * 0.37) % 0.6, o.fall + (i * 0.37) % 0.6 + 0.7, ease.inCubic) : 0;
    const a = (o.base ?? 1) * (1 - fall);
    if (a <= 0.01) return;
    ctx.save(); ctx.globalAlpha *= a; ctx.translate(0, fall * 260);
    k.loop(ctx, cx, cy, 36, (1 - close) * (0.35 + 0.65 * lit), S.t + i, { lw: 7, pulse: !close });
    dish(ctx, k, name, cx, cy + 6, 0.5 * Math.max(0.15, lit));
    ctx.restore();
  });
}
// Brandenburg Gate silhouette (base centre at x, y)
function gate(ctx, k, P, x, y, s = 1, color = P.ink) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  k.rect(ctx, -330, -40, 660, 40, color);
  for (let i = 0; i < 6; i++) k.rect(ctx, -300 + i * 110, -300, 44, 260, color);
  k.rect(ctx, -330, -360, 660, 64, color);
  k.rect(ctx, -120, -430, 240, 70, color);
  // quadriga: a little chariot + horses as an ink cluster
  ctx.beginPath(); ctx.moveTo(-80, -430); ctx.bezierCurveTo(-90, -480, -40, -500, -20, -470); ctx.lineTo(0, -520); ctx.lineTo(16, -470); ctx.bezierCurveTo(50, -500, 90, -480, 80, -430); ctx.closePath(); k.fill(ctx, color);
  k.line(ctx, 0, -520, 0, -580, color, 6); k.circle(ctx, 0, -588, 12, color);
  ctx.restore();
}
function moth(ctx, k, x, y, s, t, color) { // a living Rorschach moth: the wings flap by squashing the blot
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (0.35 + 0.65 * Math.abs(Math.sin(t * 16))), s);
  k.blot(ctx, 0, 0, 200, 150, { seed: 31, kind: 'moth', color, res: 0.6, splatter: 0 });
  ctx.restore();
}
function bubble(ctx, k, P, x, y, w, h, tx = 0) { // speech bubble with tail toward (x + tx, y + h/2 + 40)
  k.rect(ctx, x - w / 2, y - h / 2, w, h, P.paperLight, P.ink, 5, 30);
  k.poly(ctx, [[x + tx - 20, y + h / 2 - 3], [x + tx + 20, y + h / 2 - 3], [x + tx - 10, y + h / 2 + 44]], P.paperLight);
  ctx.beginPath(); ctx.moveTo(x + tx - 20, y + h / 2); ctx.lineTo(x + tx - 10, y + h / 2 + 44); ctx.lineTo(x + tx + 20, y + h / 2); k.stroke(ctx, P.ink, 5);
}

export const scenes = [
  { // 0.26 "Your brain is keeping a to-do list... you never wrote."
    start: 0, title: 'The Hidden List',
    draw(ctx, u, S) {
      const { k, P, W, H } = S, kp = S.at('keeping'), nv = S.at('never');
      plate(ctx, S, { alpha: 0.07, seed: 5 });
      S.cam(lerp(1.12, 1.0, tween(u, 0, 3.6)), W / 2, 560);
      // the first thing you see: an ink blot slapped onto the card…
      const splat = tween(u, -0.25, 0.3, ease.outCubic), fade = 1 - tween(u, 0.45, 0.9);
      if (fade > 0) k.blot(ctx, W / 2, 470, 860 * splat, 760 * splat, { seed: 8, kind: 'moth', grow: splat, alpha: fade, live: 1, t: S.t, res: 0.3 });
      // …that turns into a head; the skull opens on "keeping"
      const show = tween(u, 0.4, 0.8);
      if (show > 0) {
        ctx.save(); ctx.globalAlpha = show;
        const lid = tween(u, kp - 0.15, kp + 0.4, ease.outBack);
        k.profile(ctx, 380, 930, 1.6, { lid, blink: 1 - (u > 2.4 && u < 2.55 ? 1 : 0),
          inside: c => { c.save(); c.globalAlpha = 0.9 * lid; k.circle(c, 3, -210, 60, P.red); c.restore(); } });
        ctx.restore();
        // the to-do list unrolls out of the open skull
        const roll = tween(u, kp + 0.2, kp + 1.3, ease.outCubic);
        if (roll > 0) {
          const bx = 385, by = 600, top = lerp(by, 40, roll), w = 330;
          ctx.save(); ctx.translate(bx, 0); ctx.rotate(Math.sin(S.t * 2) * 0.015);
          k.rect(ctx, -w / 2, top, w, by - top, P.paperLight, P.ink, 4);
          k.ellipse(ctx, 0, top, w / 2 + 8, 16, 0, P.paperDark, P.ink, 4);
          const items = ['call mom back', 'reply to that text', 'finish the essay', 'fix the sink', 'gym (again)', 'THAT thing'];
          items.forEach((s, i) => {
            const y = top + 70 + i * 72; if (y > by - 30) return;
            k.rect(ctx, -w / 2 + 26, y - 18, 34, 34, null, P.ink, 4);
            k.scrawl(ctx, s, -w / 2 + 78, y, 38, tween(u, nv - 0.3 + i * 0.22, nv + i * 0.22), { align: 'left', rot: -0.02 });
          });
          ctx.restore();
        }
      }
      k.scrawl(ctx, 'who wrote this?', 760, 860, 54, tween(u, nv + 0.4, nv + 1.0), { rot: -0.08 });
      k.arrow(ctx, 690, 820, 560, 700, tween(u, nv + 0.7, nv + 1.0), P.red, 6, -0.3);
    },
  },
  { // 4.02 "Berlin, the 1920s."
    start: 3.88, title: 'Berlin, the 1920s', trans: 'bleed',
    draw(ctx, u, S) {
      const { k, P, W, H } = S, yr = S.at('1920');
      plate(ctx, S, { blot: false, bg: P.paperLight });
      S.cam(lerp(1.0, 1.08, tween(u, 0, 2)), W / 2, 520);
      k.circle(ctx, W / 2, 230, 150, P.red);
      // birds
      for (let i = 0; i < 5; i++) { const bx = ((u * 90 + i * 170) % (W + 200)) - 100, by = 120 + i * 30 + Math.sin(u * 3 + i) * 10; ctx.beginPath(); ctx.moveTo(bx - 16, by - 6); ctx.quadraticCurveTo(bx - 6, by - 10, bx, by); ctx.quadraticCurveTo(bx + 6, by - 10, bx + 16, by - 6); k.stroke(ctx, P.ink, 4); }
      gate(ctx, k, P, W / 2, 600, 1.05);
      // a 1920s motor car crosses
      const cx = lerp(-200, W + 200, tween(u, 0.1, 1.6, ease.linear));
      ctx.save(); ctx.translate(cx, 600);
      k.rect(ctx, -90, -60, 180, 38, P.ink, null, 0, 10); k.rect(ctx, -60, -100, 90, 44, P.ink, null, 0, 8); k.rect(ctx, -50, -92, 30, 26, P.paperLight); k.rect(ctx, -14, -92, 36, 26, P.paperLight);
      for (const wx of [-56, 56]) { k.circle(ctx, wx, -18, 22, P.ink); k.circle(ctx, wx, -18, 8, P.paperLight); }
      ctx.restore();
      k.rect(ctx, -100, 600, W + 200, 8, P.ink);
      // the Rorschach fold, turned sideways: the city reflected in the Spree
      ctx.save(); ctx.translate(0, 1208); ctx.scale(1, -1); ctx.globalAlpha = 0.28;
      gate(ctx, k, P, W / 2, 600, 1.05); k.circle(ctx, W / 2, 230, 150, P.red);
      ctx.restore();
      for (let i = 0; i < 9; i++) { const y = 640 + i * 42, x = (i * 97 + u * 40) % 300; k.line(ctx, x - 60, y, x + 220 + i * 20, y, P.paperLight, 6); }
      k.typeOn(ctx, 'BERLIN', W / 2, 860, 96, tween(u, 0.1, 0.5, ease.linear), { align: 'center', font: 'display' });
      k.stamp(ctx, '1920s', W / 2, 970, 54, tween(u, yr, yr + 0.25), -0.08);
    },
  },
  { // 5.88 "The story goes, psychologist Kurt Lewin is in a café with his students."
    start: 5.78, title: 'A Café in Berlin',
    draw(ctx, u, S) {
      const { k, P, W } = S, lw = S.at('Kurt'), st = S.at('students'), cf = S.at('café');
      S.cam(lerp(1.0, 1.12, tween(u, 0, 4.3)), W / 2, 620);
      cafe(ctx, S, { furniture: false });
      k.cafeChair(ctx, 250, 930, 1.05, 1); k.cafeChair(ctx, 690, 930, 1.05, -1);
      k.figure(ctx, 270, 925, { ...LEWIN, s: 0.95, sit: true, face: 1, armR: [1.2, 0.9], look: [0.6, 0], mood: u > lw ? 'smile' : 'calm', blink: (u % 3.1) < 0.12 ? 0 : 1 });
      k.figure(ctx, 470, 860, { ...STUDENT, s: 0.82, face: 1, armL: [0.3, 0.4], armR: [0.3, 0.4], look: [-0.4, 0], shadow: false });
      k.figure(ctx, 670, 925, { ...BLUMA, s: 0.95, sit: true, face: -1, armL: [1.1, 0.9], look: [-0.7, 0], blink: (u % 2.7) < 0.12 ? 0 : 1 });
      k.bistroTable(ctx, W / 2, 1000, 1.45);
      k.cup(ctx, 400, 772, 0.75, S.t); k.cup(ctx, 545, 772, 0.75, S.t + 1);
      // red-pen case notes
      k.scrawl(ctx, 'Kurt Lewin', 200, 300, 64, tween(u, lw, lw + 0.4), { rot: -0.06 });
      k.arrow(ctx, 220, 340, 255, 520, tween(u, lw + 0.2, lw + 0.5), P.red, 6, 0.2);
      k.scrawl(ctx, 'his students', 720, 360, 56, tween(u, st - 0.2, st + 0.3), { rot: 0.05 });
      k.arrow(ctx, 700, 400, 660, 540, tween(u, st + 0.1, st + 0.4), P.red, 6, -0.2);
      k.stamp(ctx, 'THE STORY GOES', W / 2, 120, 40, tween(u, 0.1, 0.4), -0.05, P.ink);
    },
  },
  { // 10.26 "A waiter takes a huge order."
    start: 10.15, title: 'A Huge Order', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W, H } = S, hu = S.at('huge'), or = S.at('order');
      plate(ctx, S, { alpha: 0.08, seed: 9 });
      S.cam(1.0 + 0.04 * tween(u, or, or + 0.4), W / 2, 560);
      k.figure(ctx, W / 2, 1050, { ...WAITER, s: 1.45, face: 1, armR: [Math.PI - 0.5, -0.4], armL: [0.5, 1.5], look: [0, -0.6], mood: u > hu ? 'worry' : 'calm',
        holdR: c => { k.ellipse(c, 0, -14, 70, 12, 0, P.ink); } });
      // the order spirals in around his head
      const hx = W / 2, hy = 1050 - 368 * 1.45;
      ORDER.forEach((name, i) => {
        const at = lerp(0.15, or + 0.2, i / (ORDER.length - 1)), p = pop(u, at, 0.3);
        if (!p) return;
        const a = i / ORDER.length * TAU + S.t * 0.8 - Math.PI / 2, r = lerp(520, 290, tween(u, at, at + 0.5, ease.outCubic));
        dish(ctx, k, name, hx + Math.cos(a) * r, hy + Math.sin(a) * r * 0.9, 0.85 * p);
      });
      const n = ORDER.filter((_, i) => u >= lerp(0.15, or + 0.2, i / (ORDER.length - 1))).length;
      k.text(ctx, '× ' + n, W - 110, 90, 70, { font: 'display', color: P.red });
    },
  },
  { // 12.12 "No notepad."
    start: 12.02, title: 'No Notepad', trans: 'flash',
    draw(ctx, u, S) {
      const { k, P, W, H } = S, np = S.at('notepad');
      plate(ctx, S, { alpha: 0.1, seed: 12 });
      S.cam(1 + 0.03 * Math.sin(u * 3), W / 2, H / 2);
      k.notepad(ctx, W / 2, 500, 2.6, tween(u, np - 0.05, np + 0.45));
      k.figure(ctx, 760, 1200, { ...WAITER, s: 1.0, face: -1, armL: [2.4, 0.4], look: [-0.6, -0.5], mood: 'smile', shadow: false });
      k.stamp(ctx, 'NONE', W / 2 - 40, 880, 70, tween(u, np + 0.3, np + 0.5), 0.12);
    },
  },
  { // 13.16 "He remembers every single item."
    start: 13.05, title: 'Every Single Item',
    draw(ctx, u, S) {
      const { k, P, W, H } = S, ev = S.at('every');
      plate(ctx, S, { alpha: 0.08, seed: 21 });
      S.cam(lerp(1.0, 1.06, tween(u, 0, 2.4)), W / 2, 560);
      k.profile(ctx, 400, 960, 1.75, { blink: u > 1.5 && u < 1.62 ? 0 : 1, inside: c => heldOrder(c, S, u, { lit: ev - 0.3 }) });
      k.scrawl(ctx, 'all 8 — in his head', 650, 120, 56, tween(u, ev + 0.6, ev + 1.2), { rot: 0.04 });
    },
  },
  { // 15.54 "Then the bill is paid."
    start: 15.42, title: 'The Bill Is Paid', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W, H } = S, pd = S.at('paid');
      plate(ctx, S, { alpha: 0.08, seed: 30 });
      S.cam(1 + 0.05 * tween(u, pd, pd + 0.2) - 0.05 * tween(u, pd + 0.2, pd + 0.6) + shake(u, pd, 0, 0.3) * 0, W / 2, H / 2 + shake(u, pd, 8, 0.35));
      k.bill(ctx, W / 2, 500, 2.3, { rot: -0.05, items: 8, paid: tween(u, pd, pd + 0.2), title: 'CAFÉ' });
      // coins drop on the bill
      for (let i = 0; i < 4; i++) {
        const at = 0.15 + i * 0.12, f = tween(u, at, at + 0.35, ease.outBounce);
        if (u < at) continue;
        k.ellipse(ctx, 300 + i * 110, lerp(-60, 900 + (i % 2) * 30, f), 46, 18, 0, P.ochre, P.ink, 5);
      }
    },
  },
  { // 16.86 "They ask him again."
    start: 16.8, title: 'Ask Him Again', trans: 'wipe',
    draw(ctx, u, S) {
      const { k, P, W } = S, ag = S.at('again');
      S.cam(1.08, W / 2, 640);
      cafe(ctx, S, { furniture: false, sign: false });
      k.cafeChair(ctx, 220, 930, 1.05, 1);
      k.figure(ctx, 240, 925, { ...LEWIN, s: 0.95, sit: true, face: 1, armR: [lerp(0.6, 2.6, tween(u, 0.2, 0.6, ease.outBack)), 0.3], look: [1, -0.3] });
      k.bistroTable(ctx, 400, 1000, 1.3);
      k.figure(ctx, 720, 1000, { ...WAITER, s: 1.1, face: -1, armL: [0.4, 0.8], look: [-0.8, 0], mood: u > ag ? 'worry' : 'calm' });
      const b = pop(u, ag - 0.3, 0.3);
      if (b) { ctx.save(); ctx.translate(380, 300); ctx.scale(b, b); bubble(ctx, k, P, 0, 0, 460, 150, -120); k.typeOn(ctx, 'What did we order?', 0, 0, 40, tween(u, ag - 0.2, ag + 0.5, ease.linear), { align: 'center', caret: false }); ctx.restore(); }
    },
  },
  { // 18.14 "He can't remember a thing."
    start: 18.05, title: "Can't Remember", trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W, H } = S, ca = S.at("can't"), th = S.at('thing');
      plate(ctx, S, { alpha: 0.08, seed: 21 });
      S.cam(1.06 + 0.04 * tween(u, th, th + 0.5), W / 2, 560);
      k.profile(ctx, 400, 960, 1.75, { blink: 1, inside: c => {
        heldOrder(c, S, u, { close: ca - 0.1, fall: ca + 0.35 });
        const q = pop(u, th - 0.05, 0.4);
        if (q) { c.save(); c.translate(30, -200); c.scale(q, q); k.text(c, '?', 0, 0, 160, { font: 'display', color: P.red }); c.restore(); }
      } });
      // what was in his head drips out as ink
      for (let i = 0; i < 7; i++) { const at = ca + 0.4 + i * 0.12, f = tween(u, at, at + 0.9, ease.inQuad); if (f > 0 && f < 1) k.ellipse(ctx, 380 + (i * 47) % 160, lerp(620, 1100, f), 9, 14, 0, P.ink); }
      k.stamp(ctx, 'FORGOTTEN', 720, 200, 48, tween(u, th, th + 0.25), 0.1);
    },
  },
  { // 20.04 "Lewin's student, Bluma Zeigarnik, can't let it go."
    start: 19.94, title: 'Bluma Zeigarnik',
    draw(ctx, u, S) {
      const { k, P, W, H } = S, bl = S.at('Bluma'), lg = S.at('let');
      plate(ctx, S, { alpha: 0.12, seed: 44, w: 900, h: 700, y: 300 });
      S.cam(lerp(1.08, 1.0, tween(u, 0, 2.8)), W / 2, 560);
      const grab = tween(u, lg - 0.2, lg + 0.25, ease.outBack);
      k.figure(ctx, W / 2, 1230, { ...BLUMA, s: 1.9, face: 1, look: [0.2, -1], mood: 'worry', armR: [lerp(0.2, 2.9, grab), lerp(0.2, -0.2, grab)], shadow: false, blink: (u % 2.2) < 0.1 ? 0 : 1 });
      // the open loop over her head (and the thread she won't let go of)
      const r = lerp(80, 120, tween(u, 0.3, 2.6));
      k.loop(ctx, W / 2 - 10, 200, r, 1, S.t, { lw: 18, pulse: true, glow: true });
      if (grab > 0.5) k.penLine(ctx, [[W / 2 + r * 0.7, 120], [W / 2 + 150, 230], [W / 2 + 128 + 1.9 * Math.sin(2.9) * 140 * 0.6, 1230 - 368 * 1.9 + 120]], tween(u, lg, lg + 0.3), P.red, 7);
      k.scrawl(ctx, 'Bluma Zeigarnik', 220, 560, 58, tween(u, bl, bl + 0.5), { rot: -0.08 });
      k.arrow(ctx, 260, 600, 380, 700, tween(u, bl + 0.4, bl + 0.7), P.red, 6, 0.25);
    },
  },
  { // 22.92 "So she tests it."
    start: 22.84, title: 'She Tests It', trans: 'bleed',
    draw(ctx, u, S) {
      const { k, P, W, H } = S, ts = S.at('tests');
      S.cam(1.06, W / 2, 600);
      study(ctx, S, {});
      k.figure(ctx, 560, 820, { ...BLUMA, s: 0.95, sit: true, face: -1, armL: [1.3, 0.5], armR: [1.2, 0.6], look: [-0.8, 0.3], shadow: false,
        holdL: c => { k.rect(c, -40, -20, 70, 90, P.paperLight, P.ink, 3); } });
      k.clock(ctx, 150, 140, 70, S.t, { hour: 3, minute: 10, speed: 0.6 });
      k.stamp(ctx, 'EXPERIMENT', W / 2, 960, 62, tween(u, ts, ts + 0.2), -0.12);
    },
  },
  { // 24.14 "People do small tasks. Puzzles, beads, clay."
    start: 24.06, title: 'Small Tasks',
    draw(ctx, u, S) {
      const { k, P, W, H } = S, pz = S.at('Puzzles'), bd = S.at('beads'), cl = S.at('clay');
      plate(ctx, S, { alpha: 0.06, seed: 60 });
      k.typeOn(ctx, 'TEST SUBJECTS AT WORK', W / 2, 110, 46, tween(u, 0.05, 0.6, ease.linear), { align: 'center' });
      // three people at work, then the three tasks
      for (let i = 0; i < 3; i++) k.figure(ctx, 200 + i * 270, 520, { s: 0.7, face: 1, armL: [0.9, 0.9], armR: [0.9, 0.9], look: [0, 0.8], hat: ['bowler', 'cloche', null][i], hair: ['slick', 'bob', 'bun'][i], skirt: i === 1, shadow: false });
      k.rect(ctx, 60, 520, W - 120, 26, P.ink);
      const cards = [[170, pz, 'PUZZLES'], [470, bd, 'BEADS'], [770, cl, 'CLAY']];
      cards.forEach(([x, at, label], i) => {
        const p = pop(u, at - 0.1, 0.35); if (!p) return;
        ctx.save(); ctx.translate(x, 790); ctx.scale(p, p);
        k.rect(ctx, -130, -170, 260, 300, P.paperLight, P.ink, 5, 12);
        const prog = tween(u, at, at + 1.6);
        if (i === 0) { k.puzzlePiece(ctx, -40, -60, 0.8, 0, P.sky); k.puzzlePiece(ctx, lerp(150, 42, prog), lerp(-160, -60, prog), 0.8, lerp(1.2, 0, prog), P.rose); }
        if (i === 1) k.beads(ctx, 0, -60, 7, Math.floor(prog * 7.99), S.t, 0.7);
        if (i === 2) k.clay(ctx, 0, 0, 1.1, prog, P.ochre);
        k.text(ctx, label, 0, 92, 38);
        ctx.restore();
      });
    },
  },
  { // 27.14 "Some get stopped halfway."
    start: 27.04, title: 'Stopped Halfway!', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W, H } = S, sp = S.at('stopped');
      plate(ctx, S, { alpha: 0.06, seed: 60 });
      S.cam(1 + 0.05 * tween(u, sp, sp + 0.15), W / 2, H / 2 + shake(u, sp, 10, 0.4));
      for (const [x, i] of [[170, 0], [470, 1], [770, 2]]) {
        ctx.save(); ctx.translate(x, 640);
        k.rect(ctx, -130, -170, 260, 300, P.paperLight, P.ink, 5, 12);
        if (i === 0) { k.puzzlePiece(ctx, -40, -60, 0.8, 0, P.sky); k.puzzlePiece(ctx, 96, -110, 0.8, 0.6, P.rose); }
        if (i === 1) k.beads(ctx, 0, -60, 7, 3, S.t, 0.7);
        if (i === 2) k.clay(ctx, 0, 0, 1.1, 0.5, P.ochre);
        k.text(ctx, ['PUZZLES', 'BEADS', 'CLAY'][i], 0, 92, 38);
        ctx.restore();
      }
      // a STOP sign slams down from above
      const h = tween(u, sp - 0.15, sp + 0.05, ease.outCubic);
      ctx.save(); ctx.translate(W / 2, lerp(-260, 190, h)); ctx.rotate(0.08 * Math.sin(u * 20) * (1 - tween(u, sp, sp + 0.6)));
      k.line(ctx, 0, -400, 0, -110, P.ink, 16);
      k.poly(ctx, Array.from({ length: 8 }, (_, i) => [Math.cos(i / 8 * TAU + TAU / 16) * 130, Math.sin(i / 8 * TAU + TAU / 16) * 130]), P.red, P.ink, 8);
      k.poly(ctx, Array.from({ length: 8 }, (_, i) => [Math.cos(i / 8 * TAU + TAU / 16) * 112, Math.sin(i / 8 * TAU + TAU / 16) * 112]), null, P.paperLight, 5);
      k.text(ctx, 'STOP', 0, 6, 76, { font: 'display', color: P.paperLight });
      ctx.restore();
      k.stamp(ctx, 'INTERRUPTED', W / 2, 940, 72, tween(u, sp + 0.1, sp + 0.3), -0.1);
      k.clock(ctx, 820, 130, 62, 0, { hour: 3, minute: 30 });
    },
  },
  { // 28.9 "Later, they remember the interrupted tasks almost twice as well."
    start: 28.75, title: 'Almost Twice as Well',
    draw(ctx, u, S) {
      const { k, P, W, H } = S, rm = S.at('remember'), tw = S.at('twice');
      plate(ctx, S, { alpha: 0.05, seed: 70 });
      k.typeOn(ctx, 'TASKS REMEMBERED', W / 2, 120, 50, tween(u, 0.1, 0.8, ease.linear), { align: 'center' });
      k.bars(ctx, 190, 850, 560, 600, [0.9, 0.48], ['INTERRUPTED', 'FINISHED'], tween(u, rm, rm + 1.4));
      k.penCircle(ctx, 330, 560, 150, 330, tween(u, tw - 0.1, tw + 0.5), P.red, 7);
      k.scrawl(ctx, 'almost 2x', 690, 330, 80, tween(u, tw + 0.1, tw + 0.6), { rot: -0.08 });
      k.arrow(ctx, 620, 360, 470, 380, tween(u, tw + 0.4, tw + 0.7), P.red, 6, 0.2);
    },
  },
  { // 32.86 "An unfinished task stays open in your mind."
    start: 32.75, title: 'An Open Loop', trans: 'blink',
    draw(ctx, u, S) {
      const { k, P, W, H } = S, op = S.at('open');
      plate(ctx, S, { alpha: 0.14, seed: 81, w: 900, h: 760, y: 420 });
      S.cam(lerp(1.0, 1.1, tween(u, 0, 2.6)), W / 2, 520);
      k.profile(ctx, 400, 1000, 1.6, { blink: (u % 2.4) < 0.1 ? 0 : 1, inside: c => {
        k.brain(c, 10, -205, 0.55, S.t, { fill: P.paperDark, ink: P.grey, glow: tween(u, op, op + 0.4), spots: [[60, -60]] });
      } });
      const g = lerp(0.35, 1, tween(u, op - 0.1, op + 0.4, ease.outBack));
      k.loop(ctx, 410, 210, 130, g, S.t, { lw: 22, pulse: true, glow: true });
      k.typeOn(ctx, 'STATUS: OPEN', 700, 520, 40, tween(u, op, op + 0.5, ease.linear), { align: 'center', color: P.red });
    },
  },
  { // 35.52 "Like a tab you can't close."
    start: 35.42, title: "A Tab You Can't Close", trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W, H } = S, cl = S.at('close');
      plate(ctx, S, { alpha: 0.06, seed: 90 });
      S.cam(1.04, W / 2, 520);
      // a browser window drawn in ink, tabs at phone-readable size
      k.rect(ctx, 50, 200, W - 100, 700, P.paperLight, P.ink, 8, 22);
      k.rect(ctx, 50, 200, W - 100, 150, P.inkSoft, null, 0, 22);
      ctx.save(); ctx.translate(0, 0);
      ['Essay', 'Reply…'].forEach((s, i) => { ctx.save(); ctx.translate(190 + i * 250, 300); ctx.scale(1.45, 1.45); k.tab(ctx, 0, 0, 165, s, { fill: P.paperDark }); ctx.restore(); });
      ctx.save(); ctx.translate(660, 300); ctx.scale(1.45, 1.45); k.tab(ctx, 0, 0, 200, 'That thing', { fill: P.paperLight, hideX: true }); ctx.restore();
      ctx.restore();
      k.typeOn(ctx, 'Unfinished task', W / 2, 520, 64, tween(u, 0.05, 0.7, ease.linear), { align: 'center', font: 'serif' });
      k.typeOn(ctx, 'still running in the background…', W / 2, 620, 36, tween(u, 0.4, 1.3, ease.linear), { align: 'center', color: P.grey });
      // its close button runs away from the cursor
      const run = tween(u, cl - 0.35, cl + 0.35, ease.outBack);
      const tx = 680 + 1.45 * 74 + run * 60, ty = 300 - run * 190 + Math.sin(u * 14) * 10 * run;
      k.circle(ctx, tx, ty, 30, P.red, P.ink, 4); k.line(ctx, tx - 11, ty - 11, tx + 11, ty + 11, P.paperLight, 6); k.line(ctx, tx + 11, ty - 11, tx - 11, ty + 11, P.paperLight, 6);
      const chase = tween(u, 0, cl - 0.05, ease.inOut);
      const mx = lerp(300, 680 + 1.45 * 74 - 6, chase) + run * 30, my = lerp(820, 312, chase) + run * 10;
      ctx.save(); ctx.translate(mx, my); ctx.scale(1.6, 1.6);
      k.poly(ctx, [[0, 0], [0, 70], [18, 54], [32, 84], [44, 78], [30, 48], [52, 46]], P.paperLight, P.ink, 4);
      ctx.restore();
      k.scrawl(ctx, 'nope.', 760, 90, 70, tween(u, cl + 0.1, cl + 0.4));
    },
  },
  { // 37.06 "That's why cliffhangers hook you,"
    start: 36.96, title: 'Cliffhangers',
    draw(ctx, u, S) {
      const { k, P, W, H } = S, hk = S.at('hook');
      dream(ctx, S, { horizon: 760, sky: '#c9d3dc' });
      S.cam(1.04, W / 2, 560);
      k.cliff(ctx, 300, 420, 1.0, S.t, {});
      // a red hook drops on its line and catches your eye
      const drop = tween(u, hk - 0.4, hk, ease.outBack), pull = tween(u, hk + 0.1, hk + 0.6, ease.inOut);
      const ex = 690, ey = 520 - pull * 60, hy = lerp(-80, ey - 120, drop);
      k.line(ctx, ex + 30, -20, ex + 30, hy, P.ink, 3);
      ctx.beginPath(); ctx.moveTo(ex + 30, hy); ctx.lineTo(ex + 30, hy + 60); ctx.arc(ex + 10, hy + 60, 20, 0, Math.PI * 0.95); k.stroke(ctx, P.red, 9);
      k.eye(ctx, ex, ey, 110, { look: [-0.8, 0.3], open: 1 - 0.3 * pull, iris: P.ink });
      ctx.save(); ctx.translate(0, 0);
      k.rect(ctx, 80, 900, W - 160, 100, P.ink, null, 0, 6);
      for (let i = 0; i < 12; i++) { k.rect(ctx, 96 + i * 66, 908, 34, 16, P.paperLight, null, 0, 3); k.rect(ctx, 96 + i * 66, 976, 34, 16, P.paperLight, null, 0, 3); }
      k.typeOn(ctx, 'TO BE CONTINUED…', W / 2, 952, 40, tween(u, 0.15, 1.0, ease.linear), { align: 'center', color: P.paperLight, caret: false });
      ctx.restore();
    },
  },
  { // 38.7 "and why that unanswered text bugs you at night."
    start: 38.62, title: 'Bugs You at Night', trans: 'blink',
    draw(ctx, u, S) {
      const { k, P, W, H } = S, bg = S.at('bugs'), nt = S.at('night');
      night(ctx, S);
      S.cam(1.04, W / 2, 620);
      k.clock(ctx, 150, 150, 60, 0, { hour: 2, minute: 7, face: P.greyLight });
      k.bed(ctx, 430, 1000, 1.35, S.t, { blink: (u % 1.7) < 0.08 ? 0.1 : 1, blanket: P.sky });
      // the nightstand phone: unread, typing…
      k.rect(ctx, 760, 820, 150, 180, P.inkSoft);
      k.phone(ctx, 835, 770, 0.42, S.t, { unread: 1, typing: true, glow: 0.6 + 0.4 * Math.sin(S.t * 3), msg: 'hey… so about', rot: -0.1 });
      // a Rorschach moth circles the sleeper's head on "bugs"
      const m = tween(u, bg - 0.4, bg);
      if (m > 0) { const a = S.t * 3; moth(ctx, k, 220 + Math.cos(a) * 120, 790 + Math.sin(a) * 60, 0.9 * m, S.t, P.paperLight); }
      k.scrawl(ctx, 'unanswered.', 720, 520, 56, tween(u, 0.3, 0.9), { rot: -0.06, color: P.redLight });
    },
  },
  { // 41.78 "It's called the Zeigarnik effect."
    start: 41.62, title: 'The Zeigarnik Effect', trans: 'bleed',
    draw(ctx, u, S) {
      const { k, P, W, H } = S, zg = S.at('Zeigarnik');
      plate(ctx, S, { blot: false });
      S.cam(lerp(1.08, 1.0, tween(u, 0, 1.8)), W / 2, 520);
      // the big plate: black wings, red heart (like Rorschach's plate II)
      k.blot(ctx, W / 2, 440, 900, 780, { seed: 19, kind: 'moth', live: 1, t: S.t, res: 0.32 });
      k.blot(ctx, W / 2, 470, 330, 330, { seed: 23, kind: 'mask', live: 1, t: S.t + 3, color: P.red, res: 0.4, splatter: 4 });
      const p = pop(u, zg - 0.15, 0.4);
      if (p) {
        ctx.save(); ctx.translate(W / 2, 880); ctx.scale(p, p); ctx.rotate(-0.03);
        k.rect(ctx, -420, -90, 840, 180, P.paperLight, P.ink, 6, 6);
        k.text(ctx, 'The Zeigarnik', 0, -28, 72, { font: 'italic' });
        k.text(ctx, 'EFFECT', 0, 48, 50, { color: P.red });
        ctx.restore();
      }
      k.stamp(ctx, 'PUBLISHED 1927', W - 200, 110, 34, tween(u, zg + 0.5, zg + 0.7), 0.1);
    },
  },
  { // 43.56 "So here's the trick."
    start: 43.48, title: "Here's the Trick", trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W, H } = S, tr = S.at('trick');
      plate(ctx, S, { blot: false, bg: P.paperLight });
      k.spiral(ctx, W / 2, 500, 620, S.t * 0.8, P.ink, 2, 34);
      k.spiral(ctx, W / 2, 500, 620, S.t * 0.8 + 0.4, P.red, 2, 12);
      // a pocket watch swings in front
      const sw = Math.sin(S.t * 3.2) * 0.45;
      ctx.save(); ctx.translate(W / 2, -20); ctx.rotate(sw);
      k.line(ctx, 0, 0, 0, 560, P.ochre, 6); k.clock(ctx, 0, 640, 90, S.t, { hour: 10, minute: 10, speed: 2, face: P.paperLight });
      ctx.restore();
      const p = pop(u, tr - 0.1, 0.35);
      if (p) { ctx.save(); ctx.translate(W / 2, 940); ctx.scale(p, p); k.rect(ctx, -300, -60, 600, 120, P.ink, null, 0, 10); k.text(ctx, 'THE TRICK', 0, 4, 66, { font: 'display', color: P.paperLight }); ctx.restore(); }
    },
  },
  { // 44.99 "Can't start something? Just start it."
    start: 44.9, title: 'Just Start It', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W, H } = S, so = S.at('something'), js = S.at('Just');
      plate(ctx, S, { alpha: 0.06, seed: 99 });
      // a tower of paper labelled THAT THING
      const R = rng(4);
      for (let i = 0; i < 16; i++) k.rect(ctx, 520 + (R() - 0.5) * 30, 940 - (i + 1) * 46, 300, 40, P.paperLight, P.ink, 4, 3);
      k.rect(ctx, 590, 380, 160, 60, P.red, null, 0, 6); k.text(ctx, 'THAT THING', 670, 411, 26, { color: P.paperLight });
      const walk = tween(u, js - 0.1, js + 0.5);
      k.figure(ctx, lerp(200, 420, walk), 960, { s: 1.15, face: 1, walk: walk > 0 && walk < 1 ? u * 1.8 : 0, mood: u > js + 0.6 ? 'smile' : u > so - 0.3 ? 'worry' : 'calm', look: [0.6, -0.6],
        armR: walk >= 1 ? [2.0, 0.3] : [0.2, 0.2], hat: 'bowler' });
      // the top sheet flips away → a fresh open loop pops above the head
      const fl = tween(u, js + 0.6, js + 1.2, ease.inOut);
      if (fl > 0) { ctx.save(); ctx.translate(670 + fl * 300, 940 - 16 * 46 - fl * 300); ctx.rotate(fl * 2.5); k.rect(ctx, -150, -20, 300, 40, P.paperLight, P.ink, 4, 3); ctx.restore(); }
      const lp = pop(u, js + 0.8, 0.4);
      if (lp) k.loop(ctx, 420, 960 - 368 * 1.15 - 170, 70 * lp, 1, S.t, { lw: 14, pulse: true, glow: true });
      k.stamp(ctx, 'STARTED', 420, 160, 54, tween(u, js + 1.0, js + 1.2), -0.12);
      k.scrawl(ctx, '?!', 300, 330, 90, tween(u, so - 0.2, so + 0.2));
    },
  },
  { // 47.2 "Your brain will want to finish."
    start: 47.08, title: 'Your Brain Wants to Finish', trans: 'blink',
    draw(ctx, u, S) {
      const { k, P, W, H } = S, fn = S.at('finish');
      ctx.save();
      plate(ctx, S, { alpha: 0.12, seed: 111, w: 900, h: 760, y: 420 });
      S.cam(lerp(1.06, 1.0, tween(u, 0, 4)), W / 2, 540);
      k.profile(ctx, 400, 1000, 1.6, { blink: 1, inside: c => k.brain(c, 10, -205, 0.55, S.t, { fill: P.rose, glow: 0.6 + 0.4 * Math.sin(S.t * 5), spots: [[60, -60], [-50, -40]] }) });
      // the loop pulls itself almost shut… and stops.
      const close = tween(u, 0.2, fn + 0.6, ease.inOut);
      k.loop(ctx, 410, 210, 130, lerp(1, 0.07, close), S.t, { lw: 22, pulse: true, glow: true });
      ctx.restore();
      // outro: the case file closes on the channel's cover (still OPEN)
      const rv = fn + 0.62;
      inkReveal(ctx, S, tween(u, rv, rv + 0.7, ease.linear), c => caseCover(c, S, u - rv, { handle: meta.brand.handle, caseNo: '1927', tagline: meta.brand.tagline }));
    },
  },
];

// sound effects: inkblot kit (tick, heartbeat, splat, fold, blink, typewriter, bell, snap, buzz, pen, moth) + the classics
export const sfx = [
  { t: 0.02, type: 'splat', gain: 0.9 },
  { t: 0.9, type: 'heartbeat', gain: 0.5 },
  { t: 1.0, type: 'fold', gain: 0.5 },            // the skull opens
  { t: 1.5, type: 'paper', gain: 0.5 },           // the list unrolls
  { t: 2.4, type: 'pen', gain: 0.45 },
  { t: 3.9, type: 'splat', gain: 0.7 },           // bleed → Berlin
  { t: 4.1, type: 'typewriter', gain: 0.5 },
  { t: 4.7, type: 'stamp', gain: 0.7 },
  { t: 5.8, type: 'fold', gain: 0.55 },
  { t: 6.0, type: 'stamp', gain: 0.4 },
  { t: 7.6, type: 'pen', gain: 0.45 },
  { t: 9.3, type: 'pen', gain: 0.4 },
  { t: 10.2, type: 'whoosh', gain: 0.5 },
  { t: 10.5, type: 'pop', gain: 0.4, pitch: 0.9 },
  { t: 10.9, type: 'pop', gain: 0.4, pitch: 1.1 },
  { t: 11.3, type: 'pop', gain: 0.4, pitch: 1.3 },
  { t: 11.6, type: 'pop', gain: 0.45, pitch: 1.5 },
  { t: 12.02, type: 'blink', gain: 0.5 },
  { t: 12.35, type: 'pen', gain: 0.55 },
  { t: 12.7, type: 'stamp', gain: 0.6 },
  { t: 13.05, type: 'fold', gain: 0.5 },
  { t: 13.4, type: 'chime', gain: 0.35, pitch: 1.2 },
  { t: 15.45, type: 'whoosh', gain: 0.4 },
  { t: 15.6, type: 'coins', gain: 0.5 },
  { t: 16.12, type: 'stamp', gain: 0.9 },
  { t: 16.8, type: 'slide', gain: 0.4 },
  { t: 17.5, type: 'typewriter', gain: 0.4 },
  { t: 18.3, type: 'snap', gain: 0.6 },
  { t: 18.7, type: 'flop', gain: 0.5 },
  { t: 19.1, type: 'stamp', gain: 0.6 },
  { t: 19.94, type: 'fold', gain: 0.5 },
  { t: 20.2, type: 'heartbeat', gain: 0.45 },
  { t: 21.0, type: 'pen', gain: 0.45 },
  { t: 22.1, type: 'riser', gain: 0.35 },
  { t: 22.84, type: 'splat', gain: 0.6 },
  { t: 23.2, type: 'stamp', gain: 0.8 },
  { t: 24.06, type: 'fold', gain: 0.45 },
  { t: 24.2, type: 'typewriter', gain: 0.4 },
  { t: 25.6, type: 'pop', gain: 0.45, pitch: 1.0 },
  { t: 26.0, type: 'pop', gain: 0.45, pitch: 1.25 },
  { t: 26.4, type: 'pop', gain: 0.45, pitch: 1.5 },
  { t: 27.4, type: 'thud', gain: 0.8 },
  { t: 27.55, type: 'alarm', gain: 0.4 },
  { t: 27.65, type: 'stamp', gain: 0.8 },
  { t: 28.75, type: 'fold', gain: 0.45 },
  { t: 28.9, type: 'typewriter', gain: 0.4 },
  { t: 29.5, type: 'riser', gain: 0.4 },
  { t: 31.4, type: 'pen', gain: 0.55 },
  { t: 31.8, type: 'bell', gain: 0.5 },
  { t: 32.75, type: 'blink', gain: 0.5 },
  { t: 34.2, type: 'heartbeat', gain: 0.55 },
  { t: 35.42, type: 'click', gain: 0.6 },
  { t: 36.1, type: 'click', gain: 0.6 },
  { t: 36.4, type: 'whoosh', gain: 0.45 },
  { t: 36.96, type: 'fold', gain: 0.45 },
  { t: 38.0, type: 'wind', gain: 0.3 },
  { t: 38.3, type: 'whoosh', gain: 0.5 },
  { t: 38.62, type: 'blink', gain: 0.5 },
  { t: 39.3, type: 'buzz', gain: 0.6 },
  { t: 40.3, type: 'moth', gain: 0.6 },
  { t: 41.62, type: 'splat', gain: 0.7 },
  { t: 42.5, type: 'gong', gain: 0.45 },
  { t: 43.2, type: 'stamp', gain: 0.5 },
  { t: 43.48, type: 'tick', gain: 0.6 },
  { t: 44.2, type: 'chime', gain: 0.35, pitch: 0.9 },
  { t: 44.9, type: 'fold', gain: 0.45 },
  { t: 45.6, type: 'pen', gain: 0.45 },
  { t: 46.6, type: 'paper', gain: 0.5 },
  { t: 47.0, type: 'pop', gain: 0.5, pitch: 1.2 },
  { t: 47.1, type: 'blink', gain: 0.45 },
  { t: 47.3, type: 'stamp', gain: 0.6 },
  { t: 49.1, type: 'splat', gain: 0.8 },
  { t: 49.4, type: 'fold', gain: 0.4 },
  { t: 50.4, type: 'stamp', gain: 0.8 },
  { t: 51.2, type: 'moth', gain: 0.35 },
  { t: 52.2, type: 'bell', gain: 0.3 },
];

// music: the 'mind' kit — music box, felt piano, low strings, ticking clock, heartbeat
export const music = {
  kit: 'mind', bpm: 92, root: 'D', scale: 'minor', gain: 0.32,
  sections: [
    { from: 0, to: 3.9, mood: 'intro' },
    { from: 3.9, to: 15.4, mood: 'groove' },
    { from: 15.4, to: 20.0, mood: 'sad' },
    { from: 20.0, to: 32.7, mood: 'drive' },
    { from: 32.7, to: 41.6, mood: 'tense' },
    { from: 41.6, to: 47.1, mood: 'triumph' },
    { from: 47.1, to: 53.2, mood: 'end' },
  ],
};
