// "The Magic Word: Because" — an INKBLOT case file (psychology).
// Langer, Blank & Chanowitz (1978), the copy-machine study.
// u = seconds since the scene started; S.at('word') = when that word is said.
import { clamp, lerp, ease, tween, rng, TAU, shake, pop } from '../../lib/core.mjs';
import { plate, study, dream, caseCover, inkReveal } from '../../styles/inkblot/scenes.mjs';

export const meta = {
  title: 'The Magic Word: Because',
  slug: 'because-copy-machine-inkblot',
  style: 'inkblot',
  width: 1080, height: 1920, fps: 30,
  duration: 63.8,
  voice: 'voice.mp3',
  seed: 33,
  captionChars: 24,
  caseLine: 'THE MIND FILES  ·  CASE No. 1978  ·  CONFIDENTIAL',
  brandKit: 'mindtrace', // MindTrace (brand/mindtrace/): logo, handle, tagline, outro text
  outro: { at: 61.3 },
};

// ---- the cast ----
const LANGER = { hair: 'bob', skirt: true };
const STRANGER = { hat: 'bowler', tie: '#c61f2a' };
const QUEUE = [{ hair: 'slick', glasses: true }, { hat: 'cloche', hair: 'bob', skirt: true }, { hat: 'cap' }, { hair: 'bun', skirt: true }];

// the office around the copier (a 1970s copy room)
function office(ctx, S, o = {}) {
  const { k, P, W, H } = S, floor = o.floor ?? 900;
  ctx.fillStyle = P.paperDark; ctx.fillRect(-300, -300, W + 600, H + 600);
  // wall stripes, a notice board, a clock
  for (let x = -40; x < W + 40; x += 70) k.rect(ctx, x, -200, 34, floor + 200, 'rgba(120,100,70,0.08)');
  k.rect(ctx, 60, 120, 260, 190, P.ochre, P.ink, 6, 4);
  for (let i = 0; i < 4; i++) { ctx.save(); ctx.translate(100 + i * 58, 170 + (i % 2) * 60); ctx.rotate((i - 1.5) * 0.1); k.rect(ctx, -24, -30, 48, 60, P.paperLight, P.ink, 2); k.circle(ctx, 0, -26, 5, P.red); ctx.restore(); }
  k.clock(ctx, W - 130, 160, 60, S.t, { hour: 10, minute: 20, speed: 0.4 });
  ctx.fillStyle = P.inkSoft; ctx.fillRect(-300, floor, W + 600, H);
  k.line(ctx, -300, floor, W + 300, floor, P.ink, 8);
}
// speech bubble; `red` is drawn in red on the first line, `rest` in ink under it
function says(ctx, k, P, x, y, w, h, red, rest, kk, tail = -100) {
  const p = ease.outBack(clamp(kk * 3)); if (p <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(p, p);
  k.rect(ctx, -w / 2, -h / 2, w, h, P.paperLight, P.ink, 5, 30);
  k.poly(ctx, [[tail - 22, h / 2 - 3], [tail + 22, h / 2 - 3], [tail - 14, h / 2 + 50]], P.paperLight);
  ctx.beginPath(); ctx.moveTo(tail - 22, h / 2); ctx.lineTo(tail - 14, h / 2 + 50); ctx.lineTo(tail + 22, h / 2); k.stroke(ctx, P.ink, 5);
  if (red) { k.typeOn(ctx, red, 0, rest ? -34 : 0, 50, clamp(kk * 1.6), { align: 'center', color: P.red, caret: false, font: 'serif' }); }
  if (rest) k.typeOn(ctx, rest, 0, red ? 34 : 0, 42, clamp(kk * 1.6 - (red ? 0.4 : 0)), { align: 'center', caret: false });
  ctx.restore();
}
// the copier room with the queue; `asker` walks up to the front
function queueScene(ctx, S, u, o = {}) {
  const { k, P, W } = S;
  office(ctx, S);
  k.copier(ctx, 860, 900, 0.9, S.t, { light: (S.t * 0.7) % 1, out: Math.floor(u * 3) % 6 });
  QUEUE.forEach((q, i) => k.figure(ctx, 650 - i * 105, 900, { ...q, s: 0.68, face: 1, look: [o.lookBack && i === 0 ? -1 : 0.6, 0], mood: o.mood?.[i] || 'calm', blink: ((u + i * 0.7) % 3) < 0.1 ? 0 : 1, shadow: false,
    armL: [0.4, 1.4], holdL: c => k.rect(c, -20, -50, 40, 50, P.paperLight, P.ink, 2) }));
}
// the bar chart of the three requests (small favor: 5 pages)
function threeBars(ctx, S, u, k3, labels = true) {
  const { k, P, W } = S;
  k.bars(ctx, 120, 860, 700, 600, [0.6, 0.94, 0.93], ['NO REASON', 'REAL', 'FAKE'], k3, [P.inkSoft, P.red, P.red]);
  ['60%', '94%', '93%'].forEach((s, i) => { const v = [0.6, 0.94, 0.93][i]; if (k3 * 1.3 - i * 0.25 > 0.6) k.text(ctx, s, 120 + (i + 0.5) * 700 / 3, 860 - 600 * v - 40, 52, { font: 'display' }); });
}

export const scenes = [
  { // 0.0 "One word makes people say yes, and it's not please."
    start: 0, title: 'One Word',
    draw(ctx, u, S) {
      const { k, P, W, H } = S, yes = S.at('yes'), pl = S.at('please');
      plate(ctx, S, { alpha: 0.12, seed: 4 });
      S.cam(lerp(1.1, 1.0, tween(u, 0, 4.6)), W / 2, 520);
      // a redacted word — the case file won't tell you yet
      k.text(ctx, 'THE WORD:', W / 2, 190, 46, {});
      const bar = tween(u, 0.05, 0.4, ease.outCubic);
      k.rect(ctx, W / 2 - 300, 250, 600 * bar, 120, P.ink, null, 0, 4);
      if (bar > 0.95) k.text(ctx, 'CLASSIFIED', W / 2, 312, 40, { color: P.paperLight });
      // the person who says yes
      k.figure(ctx, W / 2, 960, { s: 1.05, face: 1, look: [0, -0.4], mood: u > yes ? 'smile' : 'calm', armR: [lerp(0.2, 2.6, tween(u, yes, yes + 0.3, ease.outBack)), 0.2] });
      k.stamp(ctx, 'YES', 720, 520, 80, tween(u, yes, yes + 0.2), -0.15);
      // "please" is typed… and crossed out
      const pk = tween(u, pl - 0.6, pl);
      if (pk > 0) {
        ctx.save(); ctx.translate(230, 520); ctx.rotate(0.06);
        k.rect(ctx, -150, -60, 300, 120, P.paperLight, P.ink, 4, 6);
        k.typeOn(ctx, 'please', 0, 4, 64, pk, { align: 'center', font: 'serif', caret: false });
        k.penLine(ctx, [[-130, -40], [130, 40]], tween(u, pl + 0.2, pl + 0.45), P.red, 12);
        k.penLine(ctx, [[130, -40], [-130, 40]], tween(u, pl + 0.4, pl + 0.65), P.red, 12, 5);
        ctx.restore();
      }
    },
  },
  { // 5.3 "In 1978, psychologist Ellen Langer tested it at a busy copy machine."
    start: 5.2, title: 'The Copy Machine', trans: 'bleed',
    draw(ctx, u, S) {
      const { k, P, W } = S, yr = S.at('1978'), el = S.at('Ellen'), cm = S.at('copy');
      S.cam(lerp(1.0, 1.1, tween(u, 0, 4.8)), W / 2, 620);
      office(ctx, S);
      k.copier(ctx, 560, 900, 1.15, S.t, { light: (S.t * 0.8) % 1, out: Math.floor(u * 2) % 6 });
      // Langer watches from behind a potted plant, clipboard in hand
      k.figure(ctx, 170, 905, { ...LANGER, s: 0.95, face: 1, look: [0.8, 0], armL: [1.2, 1.2], holdL: c => k.rect(c, -30, -60, 60, 80, P.paperLight, P.ink, 3), blink: (u % 2.6) < 0.1 ? 0 : 1 });
      k.rect(ctx, 260, 760, 80, 140, P.redDark, P.ink, 4, 6);
      for (let i = 0; i < 7; i++) { ctx.save(); ctx.translate(300, 760); ctx.rotate(-1.4 + i * 0.47); k.ellipse(ctx, 0, -80, 22, 80, 0, P.ink); ctx.restore(); }
      k.stamp(ctx, '1978', 760, 330, 70, tween(u, yr, yr + 0.25), 0.1);
      k.scrawl(ctx, 'Ellen Langer', 230, 430, 64, tween(u, el, el + 0.4), { rot: -0.06 });
      k.arrow(ctx, 220, 470, 180, 560, tween(u, el + 0.3, el + 0.6), P.red, 6, -0.3);
      k.penCircle(ctx, 560, 680, 230, 170, tween(u, cm, cm + 0.5), P.red, 6);
    },
  },
  { // 11.0 "Strangers asked to cut in line, three different ways."
    start: 10.92, title: 'Cutting in Line',
    draw(ctx, u, S) {
      const { k, P, W } = S, cut = S.at('cut'), th = S.at('three');
      S.cam(1.04, W / 2, 620);
      queueScene(ctx, S, u, { mood: u > cut ? ['worry', 'worry', 'calm', 'calm'] : null, lookBack: u > cut });
      const walk = tween(u, 0.1, cut + 0.3);
      k.figure(ctx, lerp(-80, 165, walk), 1050, { ...STRANGER, s: 1.05, face: 1, walk: walk < 1 ? u * 1.6 : 0, look: [1, 0], mood: 'smile', armR: [0.6, 1.3], holdR: c => k.pages(c, 0, 10, 4, 0.5) });
      ['I', 'II', 'III'].forEach((r, i) => {
        const p = pop(u, th + i * 0.18, 0.3); if (!p) return;
        ctx.save(); ctx.translate(250 + i * 220, 260); ctx.scale(p, p);
        k.rect(ctx, -80, -90, 160, 180, P.ink, null, 0, 8); k.text(ctx, r, 0, 6, 90, { font: 'display', color: P.paperLight });
        ctx.restore();
      });
    },
  },
  { // 15.4 "First, I have five pages, may I use the copy machine?"
    start: 15.28, title: 'I: No Reason', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, fv = S.at('five'), may = S.at('may');
      S.cam(1.12, 440, 640);
      queueScene(ctx, S, u);
      k.figure(ctx, 165, 1050, { ...STRANGER, s: 1.05, face: 1, look: [1, -0.3], mood: 'smile', armR: [1.4, 0.9], holdR: c => k.pages(c, 0, 10, 5, 0.6, { label: u > fv ? '5 PAGES' : null }) });
      says(ctx, k, P, 470, 300, 620, 170, null, 'May I use the copy machine?', tween(u, may - 0.4, may + 0.6, ease.linear), -230);
    },
  },
  { // 19.6 "60% said yes."
    start: 19.5, title: '60% Said Yes', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, n = S.at('60');
      plate(ctx, S, { alpha: 0.06, seed: 60 });
      k.text(ctx, 'NO REASON', W / 2, 110, 46, { color: P.inkSoft });
      const v = 60 * tween(u, n - 0.1, n + 0.8, ease.outCubic);
      k.percentGrid(ctx, 170, 180, 600, v);
      k.text(ctx, Math.round(v) + '%', W / 2, 900, 120, { font: 'display', color: P.red });
      k.text(ctx, 'said yes', W / 2, 990, 44, {});
    },
  },
  { // 21.9 "Second, because I'm in a rush?"
    start: 21.8, title: 'II: A Real Reason', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, bc = S.at('because'), rs = S.at('rush');
      S.cam(1.12, 440, 640 + shake(u, rs, 4, 0.4));
      queueScene(ctx, S, u);
      // the stranger is in a hurry: sweat drops, a watch
      k.figure(ctx, 165, 1050, { ...STRANGER, s: 1.05, face: 1, look: [1, -0.3], mood: 'worry', armR: [1.6, 0.6], armL: [2.2, 1.5], bob: Math.abs(Math.sin(u * 14)) * 6 });
      for (let i = 0; i < 3; i++) { const f = (u * 1.4 + i / 3) % 1; k.ellipse(ctx, 105 + i * 60, 590 + f * 80, 8, 12, 0, P.sky, P.ink, 2); }
      k.clock(ctx, 330, 520, 50, S.t, { hour: 9, minute: 58, speed: 3 });
      says(ctx, k, P, 470, 290, 600, 190, '…BECAUSE', "I'm in a rush?", tween(u, bc - 0.3, rs + 0.3, ease.linear), -250);
    },
  },
  { // 24.9 "94% said yes."
    start: 24.8, title: '94% Said Yes', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, n = S.at('94');
      plate(ctx, S, { alpha: 0.06, seed: 61 });
      k.text(ctx, 'A REAL REASON', W / 2, 110, 46, { color: P.inkSoft });
      const v = lerp(60, 94, tween(u, n - 0.1, n + 0.8, ease.outCubic));
      k.percentGrid(ctx, 170, 180, 600, v);
      k.text(ctx, Math.round(v) + '%', W / 2, 900, 120, { font: 'display', color: P.red });
      k.text(ctx, 'said yes', W / 2, 990, 44, {});
    },
  },
  { // 27.5 "Third, because I have to make copies?"
    start: 27.42, title: 'III: A Fake Reason', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, bc = S.at('because'), cp = S.at('copies');
      S.cam(1.12, 440, 640);
      queueScene(ctx, S, u);
      k.figure(ctx, 165, 1050, { ...STRANGER, s: 1.05, face: 1, look: [1, -0.3], mood: 'smile', armR: [1.4, 0.9], holdR: c => k.pages(c, 0, 10, 5, 0.6) });
      says(ctx, k, P, 470, 290, 640, 190, '…BECAUSE', 'I have to make copies?', tween(u, bc - 0.3, cp + 0.3, ease.linear), -250);
      k.stamp(ctx, 'FAKE REASON', 680, 500, 50, tween(u, cp + 0.3, cp + 0.5), 0.12);
    },
  },
  { // 30.8 "Of course you do. It's a copy machine."
    start: 30.66, title: 'Of Course You Do', trans: 'blink',
    draw(ctx, u, S) {
      const { k, P, W } = S, oc = S.at('course'), cm = S.at('copy');
      office(ctx, S);
      S.cam(lerp(1.0, 1.25, tween(u, 0, 2.6)), 470, 640);
      // the copy machine has heard it all — it rolls its eyes
      const roll = tween(u, oc, oc + 0.8);
      k.copier(ctx, 470, 900, 1.5, S.t, { eyes: true, lids: 0.6 + 0.4 * Math.sin(roll * Math.PI) * 0, look: [Math.sin(roll * Math.PI * 2) * 0.8, -Math.sin(roll * Math.PI) * 1], out: 3 });
      k.scrawl(ctx, 'obviously.', 470, 260, 76, tween(u, cm, cm + 0.5));
      k.scrawl(ctx, '…', 760, 360, 90, tween(u, oc + 0.2, oc + 0.5));
    },
  },
  { // 34.4 "Still, 93% said yes."
    start: 33.32, title: 'Still, 93% Said Yes', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, st = S.at('Still'), n = S.at('93');
      plate(ctx, S, { alpha: 0.05, seed: 70 });
      k.text(ctx, '5 PAGES — WHO SAID YES', W / 2, 110, 40, { color: P.inkSoft });
      threeBars(ctx, S, u, tween(u, 0.1, n + 0.6));
      k.penCircle(ctx, 120 + 1.5 * 700 / 3 + 116, 560, 270, 340, tween(u, n + 0.3, n + 0.9), P.red, 7);
      k.scrawl(ctx, 'the same!', 640, 170, 70, tween(u, n + 0.6, n + 1.1), { rot: -0.06 });
    },
  },
  { // 37.06 "Here's the trick. Your brain runs on autopilot."
    start: 36.96, title: 'Autopilot', trans: 'bleed',
    draw(ctx, u, S) {
      const { k, P, W } = S, ap = S.at('autopilot');
      plate(ctx, S, { alpha: 0.12, seed: 81, w: 900, h: 760, y: 420 });
      S.cam(lerp(1.06, 1.0, tween(u, 0, 4)), W / 2, 540);
      k.profile(ctx, 420, 1010, 1.55, { blink: 0.45 + 0.1 * Math.sin(S.t * 2), inside: c => k.brain(c, 10, -205, 0.55, S.t, { fill: P.paperDark, ink: P.grey }) });
      // a little plane circles the head, towing AUTOPILOT: ON
      const a = S.t * 0.9, show = tween(u, ap - 0.6, ap);
      if (show > 0) { ctx.save(); ctx.globalAlpha = show; k.plane(ctx, 640 + Math.cos(a) * 50, 190 + Math.sin(a * 2) * 26, 1.35, S.t, 'AUTOPILOT: ON'); ctx.restore(); }
      k.stamp(ctx, 'THE TRICK', 220, 470, 40, tween(u, 0.1, 0.3), -0.1);
    },
  },
  { // 41.2 "It hears because and assumes a good reason is coming, so it stops checking."
    start: 41.1, title: 'It Hears "Because"', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, bc = S.at('because'), as = S.at('assumes'), sc = S.at('stops');
      study(ctx, S, { desk: false });
      S.cam(1.06, W / 2, 600);
      // the brain's guard at the gate: it sees BECAUSE and waves everything through
      const sleepy = tween(u, sc, sc + 0.5);
      k.figure(ctx, 690, 820, { hat: 'cap', s: 1.0, face: -1, look: [-0.8, 0], blink: 1 - sleepy, mood: 'calm', tilt: sleepy * 0.25, shadow: false,
        armL: [lerp(1.4, 0.3, sleepy), lerp(0.9, 0.1, sleepy)], holdL: c => { if (sleepy < 0.5) k.magnifier(c, -10, -60, 0.55, 0.4); } });
      k.rect(ctx, 500, 640, 380, 180, P.ink, null, 0, 6);
      k.text(ctx, 'REASON CHECK', 690, 730, 40, { color: P.paperLight });
      if (sleepy >= 0.5) k.magnifier(ctx, 560, 880, 0.6, 1.6);
      // the BECAUSE card slides in
      const card = tween(u, bc - 0.3, bc + 0.2, ease.outBack);
      ctx.save(); ctx.translate(lerp(-260, 250, card), 470); ctx.rotate(-0.06);
      k.rect(ctx, -170, -60, 340, 120, P.paperLight, P.ink, 5, 6); k.text(ctx, 'BECAUSE…', 0, 4, 58, { font: 'serif', color: P.red });
      ctx.restore();
      k.stamp(ctx, 'APPROVED', 260, 640, 62, tween(u, as + 0.2, as + 0.4), -0.14);
      for (let i = 0; i < 3; i++) { const z = tween(u, sc + 0.3 + i * 0.25, sc + 0.9 + i * 0.25); if (z > 0) k.text(ctx, 'z', 740 + i * 40, 420 - i * 50 - z * 20, 40 + i * 14, { font: 'hand', color: P.red }); }
    },
  },
  { // 46.9 "But there's a catch."
    start: 46.82, title: 'The Catch', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, ct = S.at('catch');
      plate(ctx, S, { alpha: 0.08, seed: 90 });
      S.cam(1 + 0.05 * tween(u, ct, ct + 0.15), W / 2, 540 + shake(u, ct + 0.1, 8, 0.3));
      k.typeOn(ctx, 'BUT…', W / 2, 230, 130, tween(u, 0, 0.4, ease.linear), { align: 'center', font: 'display', caret: false });
      k.mousetrap(ctx, W / 2, 760, 1.6, tween(u, ct, ct + 0.25), c => { c.save(); c.translate(70, -46); c.rotate(-0.08); k.rect(c, -66, -26, 132, 52, P.paperLight, P.ink, 3, 4); k.text(c, 'BECAUSE', 0, 2, 26, { font: 'serif', color: P.red }); c.restore(); });
    },
  },
  { // 48.4 "For 20 pages, the empty because did nothing."
    start: 48.3, title: 'For 20 Pages', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, tw = S.at('20'), nt = S.at('nothing');
      plate(ctx, S, { alpha: 0.06, seed: 92 });
      k.pages(ctx, 180, 900, 20, 1.2, { gap: 18, label: u > tw ? '20 PAGES' : null });
      // big favor: no reason 24% · fake reason 24% (real reason 42%)
      const kb = tween(u, tw + 0.3, nt + 0.2);
      k.bars(ctx, 380, 860, 480, 600, [0.24, 0.42, 0.24], ['NONE', 'REAL', 'FAKE'], kb, [P.inkSoft, P.red, P.red]);
      ['24%', '42%', '24%'].forEach((s, i) => { if (kb * 1.3 - i * 0.25 > 0.6) k.text(ctx, s, 380 + (i + 0.5) * 160, 860 - 600 * [0.24, 0.42, 0.24][i] - 36, 44, { font: 'display' }); });
      k.scrawl(ctx, 'fake = nothing', 600, 260, 66, tween(u, nt, nt + 0.5), { rot: -0.05 });
      k.penLine(ctx, [[380 + 80 - 50, 700], [380 + 400 + 50, 700]], tween(u, nt + 0.2, nt + 0.6), P.red, 6);
    },
  },
  { // 53.0 "Small favor? Say because."
    start: 52.9, title: 'Small Favor?', trans: 'blink',
    draw(ctx, u, S) {
      const { k, P, W } = S, sm = S.at('Small'), bc = S.at('because');
      plate(ctx, S, { alpha: 0.1, seed: 95 });
      S.cam(1.05, W / 2, 560);
      k.figure(ctx, 250, 980, { ...STRANGER, s: 1.1, face: 1, mood: 'smile', armR: [1.5, 0.6], holdR: c => k.pages(c, 0, 10, 1, 0.7) });
      k.figure(ctx, 700, 980, { hair: 'bob', skirt: true, s: 1.1, face: -1, mood: u > bc + 0.3 ? 'smile' : 'calm', look: [-0.6, 0] });
      says(ctx, k, P, 300, 260, 420, 150, 'BECAUSE…', null, tween(u, bc - 0.2, bc + 0.5, ease.linear), -40);
      k.stamp(ctx, 'YES', 720, 330, 80, tween(u, bc + 0.5, bc + 0.7), 0.12);
    },
  },
  { // 56.0 "Big favor? Bring a real reason."
    start: 55.85, title: 'Big Favor?', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, rr = S.at('real'), re = S.at('reason');
      plate(ctx, S, { alpha: 0.1, seed: 97 });
      k.pages(ctx, 170, 980, 30, 1.0, { gap: 16 });
      const kin = tween(u, rr - 0.6, re, ease.outCubic), turn = tween(u, re, re + 0.35, ease.outBack);
      k.padlock(ctx, 620, 720, 1.9, turn);
      k.key(ctx, lerp(1100, 700, kin), 640, 1.1, -turn * Math.PI / 2, kin > 0.9 ? null : 'REAL REASON');
      k.scrawl(ctx, 'real reason', 520, 300, 64, tween(u, re, re + 0.4));
    },
  },
  { // 59.1 "Follow for more mind tricks."  → the case-file cover
    start: 58.95, title: 'More Mind Tricks', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      ctx.save();
      plate(ctx, S, { alpha: 0.1, seed: 97 });
      k.pages(ctx, 170, 980, 30, 1.0, { gap: 16 });
      k.padlock(ctx, 620, 720, 1.9, 1);
      ctx.restore();
      inkReveal(ctx, S, tween(u, 0.05, 0.75, ease.linear), c => caseCover(c, S, u - 0.05, { handle: meta.brand.handle, caseNo: '1978', tagline: meta.brand.tagline }));
    },
  },
];

export const sfx = [
  { t: 0.05, type: 'typewriter', gain: 0.4 },
  { t: 0.3, type: 'stamp', gain: 0.4 },
  { t: 1.9, type: 'stamp', gain: 0.9 },
  { t: 3.3, type: 'typewriter', gain: 0.4 },
  { t: 3.9, type: 'pen', gain: 0.55 },
  { t: 5.2, type: 'splat', gain: 0.7 },
  { t: 5.5, type: 'tick', gain: 0.3 },
  { t: 5.45, type: 'stamp', gain: 0.75 },
  { t: 7.4, type: 'pen', gain: 0.45 },
  { t: 9.5, type: 'pen', gain: 0.45 },
  { t: 10.92, type: 'fold', gain: 0.45 },
  { t: 12.2, type: 'slide', gain: 0.4 },
  { t: 12.9, type: 'pop', gain: 0.5, pitch: 1.0 },
  { t: 13.1, type: 'pop', gain: 0.5, pitch: 1.2 },
  { t: 13.25, type: 'pop', gain: 0.5, pitch: 1.4 },
  { t: 15.28, type: 'whoosh', gain: 0.4 },
  { t: 17.8, type: 'typewriter', gain: 0.4 },
  { t: 19.5, type: 'fold', gain: 0.45 },
  { t: 19.7, type: 'riser', gain: 0.35 },
  { t: 20.4, type: 'chime', gain: 0.4 },
  { t: 21.8, type: 'whoosh', gain: 0.45 },
  { t: 22.0, type: 'heartbeat', gain: 0.4 },
  { t: 22.9, type: 'typewriter', gain: 0.4 },
  { t: 24.8, type: 'fold', gain: 0.45 },
  { t: 25.0, type: 'riser', gain: 0.35 },
  { t: 25.7, type: 'chime', gain: 0.45, pitch: 1.2 },
  { t: 27.42, type: 'whoosh', gain: 0.4 },
  { t: 28.3, type: 'typewriter', gain: 0.4 },
  { t: 30.2, type: 'stamp', gain: 0.6 },
  { t: 30.66, type: 'blink', gain: 0.5 },
  { t: 31.0, type: 'slide', gain: 0.35 },
  { t: 32.2, type: 'pen', gain: 0.4 },
  { t: 33.32, type: 'fold', gain: 0.45 },
  { t: 34.4, type: 'riser', gain: 0.35 },
  { t: 35.0, type: 'gong', gain: 0.4 },
  { t: 35.4, type: 'pen', gain: 0.5 },
  { t: 36.96, type: 'splat', gain: 0.65 },
  { t: 37.1, type: 'stamp', gain: 0.4 },
  { t: 39.3, type: 'wind', gain: 0.35 },
  { t: 41.1, type: 'fold', gain: 0.45 },
  { t: 41.5, type: 'slide', gain: 0.45 },
  { t: 43.3, type: 'stamp', gain: 0.75 },
  { t: 45.6, type: 'flop', gain: 0.4 },
  { t: 46.82, type: 'typewriter', gain: 0.45 },
  { t: 47.35, type: 'snap', gain: 0.9 },
  { t: 48.3, type: 'fold', gain: 0.45 },
  { t: 48.6, type: 'paper', gain: 0.45 },
  { t: 51.5, type: 'pen', gain: 0.5 },
  { t: 51.7, type: 'flop', gain: 0.45 },
  { t: 52.9, type: 'blink', gain: 0.45 },
  { t: 54.7, type: 'typewriter', gain: 0.35 },
  { t: 55.15, type: 'stamp', gain: 0.8 },
  { t: 55.85, type: 'whoosh', gain: 0.4 },
  { t: 57.4, type: 'slide', gain: 0.4 },
  { t: 57.8, type: 'clank', gain: 0.7 },
  { t: 58.0, type: 'bell', gain: 0.35 },
  { t: 59.0, type: 'splat', gain: 0.8 },
  { t: 59.4, type: 'fold', gain: 0.4 },
  { t: 60.3, type: 'stamp', gain: 0.8 },
  { t: 61.2, type: 'moth', gain: 0.35 },
  { t: 62.6, type: 'bell', gain: 0.3 },
];

export const music = {
  kit: 'mind', bpm: 100, root: 'D', scale: 'dorian', gain: 0.3,
  sections: [
    { from: 0, to: 5.2, mood: 'intro' },
    { from: 5.2, to: 15.3, mood: 'groove' },
    { from: 15.3, to: 36.9, mood: 'drive' },
    { from: 36.9, to: 48.3, mood: 'tense' },
    { from: 48.3, to: 52.9, mood: 'sad' },
    { from: 52.9, to: 58.95, mood: 'triumph' },
    { from: 58.95, to: 63.8, mood: 'end' },
  ],
};
