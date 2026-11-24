// "MKUltra" — an INKBLOT case file (psychology, MindTrace).
// The CIA's MKUltra program (approved 1953): LSD tested on people, often unwitting;
// San Francisco safehouses with one-way mirrors; files ordered destroyed in 1973;
// ~20,000 misfiled documents found and put before the US Senate in 1977.
// u = seconds since the scene started; S.at('word') = when that word is said.
import { clamp, lerp, ease, tween, rng, TAU, shake, pop } from '../../lib/core.mjs';
import { plate, caseCover, inkReveal } from '../../styles/inkblot/scenes.mjs';

export const meta = {
  title: 'MKUltra',
  slug: 'mkultra-inkblot',
  style: 'inkblot',
  width: 1080, height: 1920, fps: 30,
  duration: 42.3,
  voice: 'voice.mp3',
  seed: 211,
  captionChars: 24,
  caseLine: 'THE MIND FILES  ·  CASE No. 1953  ·  CONFIDENTIAL',
  brandKit: 'mindtrace', // MindTrace (brand/mindtrace/): logo, handle, tagline, outro text
  outro: { at: 39.8 },
};

const AGENT = { hat: 'bowler', tie: '#16141a' };

// a manila case folder; o.label typed on the tab, o.redact rows of black bars
function folder(ctx, k, P, x, y, w, h, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0);
  k.poly(ctx, [[-w / 2, -h / 2], [-w / 2 + 40, -h / 2 - 50], [-w / 2 + 260, -h / 2 - 50], [-w / 2 + 300, -h / 2]], '#cfae6e', P.ink, 4);
  k.rect(ctx, -w / 2, -h / 2, w, h, '#dcbd7e', P.ink, 5, 6);
  if (o.label) k.text(ctx, o.label, -w / 2 + 150, -h / 2 - 22, 28, { font: 'type', max: 230 });
  if (o.draw) o.draw(ctx);
  ctx.restore();
}
function redactions(ctx, k, P, x, y, w, n, t, seed = 1) {
  const R = rng(seed);
  for (let i = 0; i < n; i++) {
    const ww = w * (0.4 + R() * 0.6), y0 = y + i * 44;
    k.rect(ctx, x, y0, w, 8, P.greyLight, null, 0, 3);
    k.rect(ctx, x + R() * (w - ww), y0 - 10, ww * clamp(t * 1.6 - i * 0.12), 28, P.ink, null, 0, 2);
  }
}
// a paper shredder: k = how much of the page has gone in
function shredder(ctx, k, P, x, y, s, kk, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const page = clamp(kk);
  // the page sliding in
  ctx.save(); ctx.beginPath(); ctx.rect(-200, -600, 400, 520); ctx.clip();
  k.rect(ctx, -130, -440 + page * 360, 260, 340, P.paperLight, P.ink, 3, 2);
  k.text(ctx, 'MKULTRA', 0, -400 + page * 360, 34, { font: 'type' });
  for (let i = 0; i < 5; i++) k.rect(ctx, -100, -360 + page * 360 + i * 36, 200, 10, P.greyLight, null, 0, 2);
  ctx.restore();
  k.rect(ctx, -180, -90, 360, 130, P.inkSoft, P.ink, 5, 16);
  k.rect(ctx, -150, -100, 300, 14, P.ink, null, 0, 4);
  circle2(ctx, k, P, 120, -30, 14, page > 0 && page < 1 ? P.red : P.grey);
  // strips falling into the bin
  k.rect(ctx, -170, 40, 340, 260, 'rgba(22,20,26,0.15)', P.ink, 5, 10);
  const R = rng(5);
  for (let i = 0; i < 26; i++) {
    const sx = -150 + i * 12, len = 40 + R() * 160 * page, sy = 40;
    k.line(ctx, sx, sy, sx + Math.sin(t * 3 + i) * 6, sy + len, P.paperLight, 7);
  }
  ctx.restore();
}
function circle2(ctx, k, P, x, y, r, c) { k.circle(ctx, x, y, r, c, P.ink, 3); }
// a records box
function recBox(ctx, k, P, x, y, label, o = {}) {
  k.rect(ctx, x - 80, y - 90, 160, 90, o.fill || '#c9a86a', P.ink, 4, 4);
  k.rect(ctx, x - 80, y - 100, 160, 20, '#b8975c', P.ink, 3, 3);
  k.rect(ctx, x - 50, y - 64, 100, 36, P.paperLight, P.ink, 2, 2);
  k.text(ctx, label, x, y - 46, 18, { font: 'type', max: 92 });
}

export const scenes = [
  { // 0.0 "The CIA once ran a real mind control program. This isn't a theory."
    start: 0, title: 'Real Mind Control',
    draw(ctx, u, S) {
      const { k, P, W } = S, mc = S.at('mind'), th = S.at('theory');
      plate(ctx, S, { alpha: 0.12, seed: 3 });
      S.cam(lerp(1.06, 1.0, tween(u, 0, 5)), W / 2, 560);
      const sw = Math.sin(S.t * 1.6) * 14;
      // a puppet controller over a head, strings into the brain
      k.rect(ctx, 520 + sw, 130, 300, 24, P.inkSoft, P.ink, 3, 6); k.rect(ctx, 658 + sw, 70, 24, 140, P.inkSoft, P.ink, 3, 6);
      const st = tween(u, mc - 0.4, mc + 0.4);
      for (const [bx, by] of [[340, 500], [420, 470], [500, 520]]) k.line(ctx, 600 + sw + (bx - 340) * 0.8, 150, lerp(600 + sw, bx, st), lerp(150, by, st), P.red, 3);
      k.profile(ctx, 380, 1040, 1.5, { blink: 0.45, inside: c => k.brain(c, 10, -205, 0.55, S.t, { fill: P.paperDark, ink: P.grey }) });
      k.scrawl(ctx, 'mind control', 760, 380, 54, tween(u, mc, mc + 0.5), { rot: -0.05 });
      k.stamp(ctx, 'NOT A THEORY', 720, 960, 50, tween(u, th - 0.1, th + 0.1), -0.08);
    },
  },
  { // 5.38 "It was called MKUltra."
    start: 5.25, title: 'Project MKUltra', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, mk = S.at('MKUltra');
      plate(ctx, S, { alpha: 0.08, seed: 6 });
      S.cam(lerp(1.0, 1.05, tween(u, 0, 2.5)), W / 2, 560);
      folder(ctx, k, P, W / 2, 600, 760, 760, { rot: -0.03, label: 'SUBPROJECT', draw: c => {
        k.typeOn(c, 'MKULTRA', 0, -240, 96, tween(u, mk - 0.1, mk + 0.6), { font: 'type', align: 'center' });
        redactions(c, k, P, -300, -90, 600, 7, tween(u, 0.2, 1.6), 4);
      } });
      k.stamp(ctx, 'CLASSIFIED', 700, 1000, 54, tween(u, mk + 0.5, mk + 0.7), -0.1);
    },
  },
  { // 7.92 "Starting in 1953, the CIA tested LSD on people, often without telling them."
    start: 7.7, title: 'Without Telling Them', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, yr = S.at('1953'), ls = S.at('LSD'), wo = S.at('without');
      plate(ctx, S, { alpha: 0.08, seed: 8 });
      k.stamp(ctx, '1953', 780, 120, 64, tween(u, yr, yr + 0.25), 0.1);
      // a hand-drawn bottle over a cup on a table
      const drop = tween(u, ls - 0.2, ls + 0.8);
      k.rect(ctx, 140, 860, 400, 24, P.inkSoft, P.ink, 3, 4); k.rect(ctx, 170, 884, 20, 160, P.inkSoft); k.rect(ctx, 490, 884, 20, 160, P.inkSoft);
      k.cup(ctx, 340, 860, 1.1, S.t);
      ctx.save(); ctx.translate(340, lerp(420, 560, drop)); ctx.rotate(0.15);
      k.rect(ctx, -26, -110, 52, 110, P.sky, P.ink, 4, 10); k.rect(ctx, -12, -140, 24, 34, P.ink, null, 0, 4);
      k.text(ctx, 'LSD', 0, -54, 24, { font: 'display', color: P.ink });
      ctx.restore();
      for (let i = 0; i < 3; i++) { const p = ((u * 1.3 + i / 3) % 1); if (drop > 0.4) k.ellipse(ctx, 342, lerp(570, 820, p), 7, 10, 0, P.sky); }
      // the person who isn't told
      const reach = tween(u, S.at('without') - 0.4, S.at('without') + 0.3);
      k.figure(ctx, lerp(760, 650, reach), 1040, { s: 1.0, face: -1, look: [-1, 0.4], mood: 'smile', armL: [lerp(0.2, 1.0, reach), 0.5] });
      k.scrawl(ctx, 'without telling them', 560, 360, 50, tween(u, wo, wo + 0.6));
      k.scrawl(ctx, 'tested on people', 300, 250, 44, tween(u, ls + 0.3, ls + 0.8), { rot: -0.05 });
    },
  },
  { // 14.1 "In one operation, agents secretly dosed men in San Francisco and watched them through one-way mirrors."
    start: 14.0, title: 'Behind the Mirror', trans: 'blink',
    draw(ctx, u, S) {
      const { k, P, W } = S, sf = S.at('San'), wa = S.at('watched'), mi = S.at('one-way');
      plate(ctx, S, { alpha: 0.1, seed: 14 });
      // the room (left) and the dark observation side (right)
      k.rect(ctx, 520, 160, 420, 900, P.ink);
      k.rect(ctx, 500, 160, 26, 900, P.inkSoft);
      // the mirror: from the room it's a mirror, from behind it's a window
      const win = tween(u, mi - 0.3, mi + 0.3);
      k.rect(ctx, 470, 380, 90, 360, P.sky, P.ink, 5, 4);
      ctx.save(); ctx.globalAlpha = 0.5 + 0.3 * Math.sin(S.t * 2); k.line(ctx, 485, 420, 530, 470, P.paperLight, 6); k.line(ctx, 485, 470, 520, 510, P.paperLight, 4); ctx.restore();
      k.figure(ctx, 250, 1040, { s: 1.0, face: 1, look: [1, -0.1], mood: 'smile', blink: 0.5, bob: Math.sin(S.t * 1.5) * 4, armR: [0.6, 0.8], holdR: c => k.cup(c, 0, 10, 0.5, S.t) });
      const ag = tween(u, wa - 0.6, wa);
      for (const [ax, i] of [[680, 0], [840, 1]]) {
        ctx.save(); ctx.globalAlpha = 0.3 + 0.7 * ag;
        k.figure(ctx, ax, 1040, { ...AGENT, s: 0.95, face: -1, look: [-1, 0], mood: 'calm', color: '#2d2a33', armR: i ? [1.0, 1.2] : undefined, holdR: i ? c => k.notepad(c, 0, 0, 0.35) : undefined });
        ctx.restore();
      }
      if (win > 0) { ctx.save(); ctx.globalAlpha = win; k.text(ctx, 'ONE-WAY MIRROR', 515, 340, 32, { font: 'display', color: P.red }); ctx.restore(); }
      k.scrawl(ctx, 'San Francisco', 250, 240, 54, tween(u, sf, sf + 0.5), { rot: -0.05 });
      k.scrawl(ctx, 'watched', 730, 300, 50, tween(u, wa, wa + 0.4), { color: P.redLight });
    },
  },
  { // 20.92 "Here's the trick that almost worked."
    start: 20.8, title: 'The Cover-Up', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, al = S.at('almost');
      plate(ctx, S, { alpha: 0.08, seed: 20 });
      k.stamp(ctx, 'THE TRICK', 220, 110, 44, tween(u, 0.05, 0.25), -0.1);
      // a filing cabinet slammed shut and locked
      const sh = tween(u, 0.3, 0.7, ease.outBack);
      k.rect(ctx, 300, 300, 340, 740, '#7c7f86', P.ink, 6, 8);
      for (let i = 0; i < 3; i++) {
        const out = i === 1 ? lerp(160, 0, sh) : 0;
        k.rect(ctx, 320, 330 + i * 236, 300 + out * 0.2, 210, '#9aa0a8', P.ink, 4, 6);
        k.rect(ctx, 440, 410 + i * 236, 60, 22, P.inkSoft, null, 0, 6);
      }
      k.padlock(ctx, 640, 640, 0.9, 0, P.redDark);
      k.scrawl(ctx, 'almost worked…', 560, 235, 50, tween(u, al, al + 0.5));
    },
  },
  { // 23.48 "In 1973, the CIA ordered the files destroyed."
    start: 23.4, title: 'Destroy the Files', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, yr = S.at('1973'), de = S.at('destroyed');
      plate(ctx, S, { alpha: 0.08, seed: 23 });
      k.stamp(ctx, '1973', 780, 120, 64, tween(u, yr, yr + 0.25), 0.1);
      shredder(ctx, k, P, W / 2, 780, 1.4, tween(u, yr + 0.8, de + 0.4), S.t);
      k.stamp(ctx, 'DESTROY', 230, 260, 56, tween(u, de, de + 0.2), -0.12);
    },
  },
  { // 27.66 "But about 20,000 documents survived. They'd been stored in the wrong place."
    start: 27.6, title: '20,000 Survived', trans: 'bleed',
    draw(ctx, u, S) {
      const { k, P, W } = S, nm = S.at('20,000'), sv = S.at('survived'), wr = S.at('wrong');
      plate(ctx, S, { alpha: 0.08, seed: 27 });
      // warehouse shelves of records boxes
      for (let r = 0; r < 3; r++) {
        k.rect(ctx, 60, 520 + r * 200, 820, 14, P.inkSoft);
        for (let c = 0; c < 4; c++) recBox(ctx, k, P, 160 + c * 205, 520 + r * 200, r === 1 && c === 2 ? 'FINANCE' : 'RECORDS');
      }
      k.rect(ctx, 60, 1000, 820, 14, P.inkSoft);
      const n = Math.floor(lerp(0, 20000, tween(u, nm - 0.2, sv, ease.outCubic)));
      k.text(ctx, '≈ ' + n.toLocaleString('en-US'), W / 2, 200, 96, { font: 'display', color: P.red });
      k.text(ctx, 'DOCUMENTS', W / 2, 290, 40, { font: 'display' });
      k.stamp(ctx, 'SURVIVED', 760, 390, 44, tween(u, sv, sv + 0.2), 0.08);
      k.penCircle(ctx, 570, 670, 120, 80, tween(u, wr - 0.2, wr + 0.4));
      k.scrawl(ctx, 'wrong place', 300, 420, 50, tween(u, wr, wr + 0.5), { rot: -0.06 });
    },
  },
  { // 33.14 "In 1977, they ended up in front of the US Senate."
    start: 33.0, title: 'Before the Senate', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, yr = S.at('1977'), se = S.at('Senate');
      plate(ctx, S, { alpha: 0.1, seed: 33 });
      k.stamp(ctx, '1977', 780, 120, 64, tween(u, yr, yr + 0.25), 0.1);
      // columns and the hearing dais
      for (let i = 0; i < 5; i++) k.rect(ctx, 110 + i * 180, 230, 50, 380, P.card, P.ink, 3);
      k.rect(ctx, 80, 200, 780, 40, P.paperDark, P.ink, 4);
      for (let i = 0; i < 4; i++) k.figure(ctx, 190 + i * 190, 720, { s: 0.6, face: 1, look: [0, 0.6], mood: 'shock', tie: '#c61f2a', shadow: false });
      k.rect(ctx, 60, 640, 820, 160, P.redDark, P.ink, 5, 6);
      k.text(ctx, 'U.S. SENATE HEARING', W / 2, 720, 44, { font: 'display', color: P.paperLight });
      // the stack of documents dropped on the table
      const d = tween(u, yr + 0.6, yr + 1.0, ease.outBounce);
      k.rect(ctx, 280, 960, 380, 22, P.inkSoft, P.ink, 3, 4); k.rect(ctx, 300, 982, 18, 80, P.inkSoft); k.rect(ctx, 622, 982, 18, 80, P.inkSoft);
      k.text(ctx, 'WITNESS', W / 2, 1020, 26, { font: 'display', color: P.inkSoft });
      for (let i = 0; i < 6; i++) k.rect(ctx, W / 2 - 140 + (i % 2) * 8, lerp(300, 938, d) - i * 22, 280, 22, P.paperLight, P.ink, 3, 2);
      k.scrawl(ctx, 'in front of the Senate', 330, 150, 44, tween(u, se - 0.4, se + 0.2));
    },
  },
  { // 37.5 "Follow for more dark psychology." → the case-file cover
    start: 37.35, title: 'More Dark Psychology', trans: 'cut',
    draw(ctx, u, S) {
      ctx.save(); plate(ctx, S, { alpha: 0.1, seed: 33 }); ctx.restore();
      inkReveal(ctx, S, tween(u, 0.1, 0.8, ease.linear), c => caseCover(c, S, u - 0.1, { handle: meta.brand.handle, caseNo: '1953', tagline: meta.brand.tagline }));
    },
  },
];

export const sfx = [
  { t: 0.2, type: 'heartbeat', gain: 0.45 },
  { t: 1.9, type: 'riser', gain: 0.3 },
  { t: 2.4, type: 'pen', gain: 0.4 },
  { t: 4.45, type: 'stamp', gain: 0.8 },
  { t: 5.25, type: 'paper', gain: 0.45 },
  { t: 5.9, type: 'typewriter', gain: 0.45 },
  { t: 6.6, type: 'stamp', gain: 0.75 },
  { t: 7.7, type: 'fold', gain: 0.45 },
  { t: 8.3, type: 'stamp', gain: 0.7 },
  { t: 10.6, type: 'slide', gain: 0.35 },
  { t: 11.2, type: 'pluck', gain: 0.35 }, { t: 11.6, type: 'pluck', gain: 0.3 },
  { t: 12.5, type: 'pen', gain: 0.4 },
  { t: 14.0, type: 'blink', gain: 0.45 },
  { t: 14.6, type: 'heartbeat', gain: 0.35 },
  { t: 17.2, type: 'pen', gain: 0.45 },
  { t: 18.0, type: 'pen', gain: 0.4 },
  { t: 18.9, type: 'pop', gain: 0.4 },
  { t: 20.8, type: 'fold', gain: 0.45 },
  { t: 20.95, type: 'stamp', gain: 0.5 },
  { t: 21.3, type: 'clank', gain: 0.6 },
  { t: 22.0, type: 'click', gain: 0.5 },
  { t: 23.4, type: 'whoosh', gain: 0.35 },
  { t: 23.55, type: 'stamp', gain: 0.7 },
  { t: 24.4, type: 'buzz', gain: 0.4 },
  { t: 25.2, type: 'buzz', gain: 0.4 },
  { t: 26.45, type: 'stamp', gain: 0.8 },
  { t: 27.6, type: 'splat', gain: 0.55 },
  { t: 28.1, type: 'tick', gain: 0.35 },
  { t: 29.6, type: 'stamp', gain: 0.6 },
  { t: 31.7, type: 'pen', gain: 0.45 },
  { t: 31.9, type: 'pen', gain: 0.4 },
  { t: 33.0, type: 'fold', gain: 0.45 },
  { t: 33.3, type: 'stamp', gain: 0.7 },
  { t: 33.95, type: 'thud', gain: 0.8 },
  { t: 36.0, type: 'gong', gain: 0.35 },
  { t: 37.4, type: 'splat', gain: 0.8 },
  { t: 37.8, type: 'fold', gain: 0.4 },
  { t: 38.6, type: 'stamp', gain: 0.8 },
  { t: 39.5, type: 'moth', gain: 0.35 },
  { t: 41.6, type: 'bell', gain: 0.3 },
];

export const music = {
  kit: 'mind', bpm: 84, root: 'C', scale: 'harmonic', gain: 0.3,
  sections: [
    { from: 0, to: 7.7, mood: 'tense' },
    { from: 7.7, to: 20.8, mood: 'groove' },
    { from: 20.8, to: 27.6, mood: 'tense' },
    { from: 27.6, to: 37.35, mood: 'drive' },
    { from: 37.35, to: 42.3, mood: 'end' },
  ],
};
