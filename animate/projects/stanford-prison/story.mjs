// "The Stanford Prison Experiment" — an INKBLOT case file (psychology, MindTrace).
// Zimbardo's 1971 study in a Stanford basement (funded by the US Office of Naval
// Research), stopped after six days. Later critiques: recordings show staff coaching
// guards to be "tough" (Le Texier, 2019, American Psychologist), and a prisoner whose
// breakdown became famous later said he faked it. Demand characteristics (Orne, 1962).
// No real people are drawn as likenesses; no university logos.
// u = seconds since the scene started; S.at('word') = when that word is said.
import { clamp, lerp, ease, tween, rng, TAU, shake, pop } from '../../lib/core.mjs';
import { plate, caseCover, inkReveal } from '../../styles/inkblot/scenes.mjs';

export const meta = {
  title: 'The Stanford Prison Experiment',
  slug: 'stanford-prison-inkblot',
  style: 'inkblot',
  width: 1080, height: 1920, fps: 30,
  duration: 39.4,
  voice: 'voice.mp3',
  seed: 263,
  captionChars: 24,
  caseLine: 'THE MIND FILES  ·  CASE No. 1971  ·  CONFIDENTIAL',
  brandKit: 'mindtrace', // MindTrace (brand/mindtrace/): logo, handle, tagline, outro text
  outro: { at: 37.2 },
};

const GUARD = { hat: 'cap', glasses: true, tie: '#16141a', color: '#3e4a5c' };
const PRISONER = { color: '#8b8479' };
const STAFF = { hair: 'slick', tie: '#c61f2a' };

function guard(ctx, k, P, x, y, s, o = {}) {
  k.figure(ctx, x, y, { ...GUARD, s, face: o.face || 1, look: o.look || [0, 0], mood: o.mood || 'calm', armR: o.baton ? [1.0, 1.4] : undefined, holdR: o.baton ? c => k.rect(c, -6, -70, 12, 110, P.ink, null, 0, 4) : undefined, shadow: false, walk: o.walk || 0 });
}
function prisoner(ctx, k, P, x, y, s, n, o = {}) {
  k.figure(ctx, x, y, { ...PRISONER, s, face: o.face || 1, look: o.look || [0, 0], mood: o.mood || 'worry', sit: o.sit, shadow: false, bob: o.bob || 0 });
  k.text(ctx, String(n), x, y - (o.sit ? 200 : 230) * s, 22 * s, { font: 'display', color: P.paperLight });
}
function bars(ctx, k, P, x, y, w, h, n = 7) {
  k.rect(ctx, x, y, w, 14, P.inkSoft); k.rect(ctx, x, y + h - 14, w, 14, P.inkSoft);
  for (let i = 0; i <= n; i++) k.rect(ctx, x + i * (w - 12) / n, y, 12, h, P.ink, null, 0, 4);
}
function curtains(ctx, k, P, W, open) {
  const w = lerp(W / 2 + 20, 120, open);
  for (const side of [0, 1]) {
    ctx.save(); if (side) { ctx.translate(W, 0); ctx.scale(-1, 1); }
    ctx.beginPath(); ctx.moveTo(-40, -40); ctx.lineTo(w, -40); ctx.quadraticCurveTo(w - 60, 500, w + 10, 1100); ctx.lineTo(-40, 1100); ctx.closePath(); k.fill(ctx, P.redDark); k.stroke(ctx, P.ink, 4);
    for (let i = 1; i < 4; i++) k.line(ctx, w * i / 4, -40, w * i / 4 - 20, 1100, 'rgba(0,0,0,0.25)', 6);
    ctx.restore();
  }
  k.rect(ctx, -40, -40, W + 80, 80, P.redDark, P.ink, 4);
}
function tape(ctx, k, P, x, y, s, t, playing) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  k.rect(ctx, -220, -120, 440, 240, P.inkSoft, P.ink, 5, 14);
  for (const rx of [-110, 110]) { k.circle(ctx, rx, -20, 70, P.greyLight, P.ink, 4); ctx.save(); ctx.translate(rx, -20); ctx.rotate(playing ? t * 3 : 0); for (let i = 0; i < 3; i++) { ctx.rotate(TAU / 3); k.rect(ctx, -6, -60, 12, 40, P.inkSoft); } ctx.restore(); k.circle(ctx, rx, -20, 12, P.ink); }
  k.line(ctx, -110, 50, 110, 50, P.ink, 4);
  k.rect(ctx, -60, 70, 120, 30, P.ink, null, 0, 6);
  if (playing) k.circle(ctx, 180, 90, 10, (t * 2 % 1) < 0.5 ? P.red : P.redDark);
  ctx.restore();
}
// a tragedy mask
function mask(ctx, k, P, x, y, s, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-70, -80); ctx.quadraticCurveTo(0, -110, 70, -80); ctx.quadraticCurveTo(80, 40, 0, 100); ctx.quadraticCurveTo(-80, 40, -70, -80); k.fill(ctx, P.paperLight); k.stroke(ctx, P.ink, 4);
  for (const sx of [-1, 1]) { ctx.beginPath(); ctx.ellipse(sx * 30, -20, 18, 10, sx * 0.3, 0, TAU); k.fill(ctx, P.ink); }
  ctx.beginPath(); ctx.arc(0, 60, 30, Math.PI * 1.15, Math.PI * 1.85); k.stroke(ctx, P.ink, 6);
  k.line(ctx, 100, -10, 160, -40, P.inkSoft, 4);
  ctx.restore();
}
function megaphone(c, k, P) { k.poly(c, [[0, -10], [70, -34], [70, 34], [0, 10]], P.red, P.ink, 3); k.rect(c, -14, -10, 16, 20, P.ink, null, 0, 3); }

export const scenes = [
  { // 0.22 "The most famous psychology experiment was partly staged."
    start: 0, title: 'Partly Staged',
    draw(ctx, u, S) {
      const { k, P, W } = S, fa = S.at('famous'), st = S.at('staged');
      plate(ctx, S, { alpha: 0.1, seed: 3 });
      // a prison set on a stage, lit by a spotlight
      k.rect(ctx, 60, 1010, 820, 50, '#6b4a2b', P.ink, 4);
      k.spotlight(ctx, W / 2, -20, W / 2, 900, 380, tween(u, 0.2, 1.2));
      prisoner(ctx, k, P, 470, 1000, 0.85, 8612, { mood: 'shock', look: [0, 0.3] });
      bars(ctx, k, P, 220, 520, 500, 480);
      curtains(ctx, k, P, W, tween(u, 0.1, 1.6, ease.inOut));
      k.scrawl(ctx, 'most famous', W / 2, 170, 54, tween(u, fa, fa + 0.4));
      k.stamp(ctx, 'PARTLY STAGED', W / 2, 330, 64, tween(u, st, st + 0.2), -0.08, P.ochre);
    },
  },
  { // 4.87 "1971, Stanford, funded by the U.S. Navy."
    start: 4.8, title: 'Stanford, 1971', trans: 'bleed',
    draw(ctx, u, S) {
      const { k, P, W } = S, yr = S.at('1971'), sf = S.at('Stanford'), nv = S.at('Navy');
      plate(ctx, S, { alpha: 0.08, seed: 5 });
      k.stamp(ctx, '1971', 790, 110, 64, tween(u, yr, yr + 0.25), 0.1);
      // a basement corridor turned into a prison
      k.rect(ctx, 90, 300, 760, 640, P.card, P.ink, 5, 4);
      k.text(ctx, 'BASEMENT', 470, 340, 30, { font: 'type', color: P.inkSoft });
      bars(ctx, k, P, 130, 400, 220, 420, 4); bars(ctx, k, P, 590, 400, 220, 420, 4);
      k.rect(ctx, 400, 560, 140, 380, P.paperDark, P.ink, 3);
      k.text(ctx, '"THE YARD"', 470, 760, 26, { font: 'type' });
      k.scrawl(ctx, 'Stanford', 300, 160, 64, tween(u, sf, sf + 0.4), { rot: -0.05 });
      const a = pop(u, nv - 0.4, 0.35);
      if (a) { ctx.save(); ctx.translate(780, 1010); ctx.scale(a, a); k.anchor(ctx, 0, -80, 0.8, 0, P.inkSoft); ctx.restore(); k.text(ctx, 'funded by the U.S. Navy', 470, 1020, 34, { font: 'display', color: P.red, max: 560 }); }
    },
  },
  { // 9.67 "College students played guards and prisoners in a fake prison."
    start: 9.65, title: 'Guards and Prisoners', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, cs = S.at('College'), gd = S.at('guards'), pr = S.at('prisoners'), fk = S.at('fake');
      plate(ctx, S, { alpha: 0.08, seed: 9 });
      // students split by coin flip into two groups
      const c = tween(u, cs, cs + 0.8);
      ctx.save(); ctx.translate(W / 2, 220); ctx.scale(Math.cos(S.t * 10) * (1 - c) + c, 1); k.circle(ctx, 0, 0, 60, P.ochre, P.ink, 4); k.circle(ctx, 0, 0, 40, null, '#b08a2e', 4); ctx.restore();
      k.scrawl(ctx, 'coin flip', W / 2, 340, 40, tween(u, cs + 0.3, cs + 0.8));
      const g = tween(u, gd - 0.3, gd + 0.3), p = tween(u, pr - 0.3, pr + 0.3);
      for (let i = 0; i < 3; i++) { ctx.save(); ctx.globalAlpha = g; guard(ctx, k, P, 120 + i * 110, 900, 0.7, { look: [1, 0] }); ctx.restore(); }
      for (let i = 0; i < 3; i++) { ctx.save(); ctx.globalAlpha = p; prisoner(ctx, k, P, 600 + i * 110, 900, 0.7, [5704, 1037, 8612][i], { look: [-1, 0] }); ctx.restore(); }
      k.text(ctx, 'GUARDS', 230, 960, 40, { font: 'display', color: g > 0.5 ? '#3e4a5c' : 'rgba(0,0,0,0)' });
      k.text(ctx, 'PRISONERS', 710, 960, 40, { font: 'display', color: p > 0.5 ? P.inkSoft : 'rgba(0,0,0,0)' });
      k.stamp(ctx, 'FAKE PRISON', W / 2, 1030, 44, tween(u, fk, fk + 0.2), -0.04);
    },
  },
  { // 13.66 "The guards turned cruel, stopped after six days."
    start: 13.65, title: 'Six Days', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, cr = S.at('cruel'), stp = S.at('stopped'), sx = S.at('six');
      plate(ctx, S, { alpha: 0.1, seed: 13 });
      prisoner(ctx, k, P, 640, 1010, 0.8, 5704, { sit: true, mood: 'shock', look: [-1, -0.3] });
      prisoner(ctx, k, P, 780, 1010, 0.8, 1037, { sit: true, mood: 'worry', look: [-1, -0.3] });
      bars(ctx, k, P, 480, 420, 420, 600, 5);
      guard(ctx, k, P, 280, 1040, 1.15, { baton: true, mood: u > cr ? 'shock' : 'calm', look: [1, 0.2] });
      k.scrawl(ctx, 'cruel', 260, 330, 64, tween(u, cr, cr + 0.4), { rot: -0.06 });
      // six days crossed off of a planned fourteen
      for (let d = 0; d < 14; d++) { const x = 500 + (d % 7) * 56, y = 160 + Math.floor(d / 7) * 60; k.rect(ctx, x - 22, y - 22, 44, 44, P.paperLight, P.ink, 2, 4); k.text(ctx, String(d + 1), x, y, 20, { font: 'type' }); if (d < 6 && u > 0.3 + d * 0.25) k.penLine(ctx, [[x - 18, y - 18], [x + 18, y + 18]], 1, P.red, 4, d); }
      k.text(ctx, 'planned: 14 days', 696, 270, 24, { color: P.inkSoft });
      k.stamp(ctx, 'STOPPED: DAY 6', 690, 350, 44, tween(u, sx, sx + 0.2), -0.05);
    },
  },
  { // 17.63 "The lesson? Put good people in a bad role and they turn evil."
    start: 17.45, title: 'The Famous Lesson', trans: 'bleed',
    draw(ctx, u, S) {
      const { k, P, W } = S, ls = S.at('lesson'), gp = S.at('good'), bd = S.at('bad'), ev = S.at('evil');
      plate(ctx, S, { alpha: 0.08, seed: 17 });
      ctx.save(); ctx.translate(240, 300); ctx.rotate(-0.06); k.rect(ctx, -110, -140, 220, 280, P.redDark, P.ink, 5, 6); k.rect(ctx, -110, -140, 26, 280, P.red, P.ink, 3, 6); k.text(ctx, 'PSYCH', 12, -50, 40, { font: 'display', color: P.paperLight }); k.text(ctx, '101', 12, 6, 52, { font: 'display', color: P.paperLight }); ctx.restore();
      k.scrawl(ctx, 'the lesson:', 640, 190, 54, tween(u, ls, ls + 0.4));
      // a good person in a role darkens
      const dk = tween(u, bd, ev + 0.4);
      const col = `rgb(${Math.round(lerp(230, 22, dk))},${Math.round(lerp(220, 20, dk))},${Math.round(lerp(205, 26, dk))})`;
      k.figure(ctx, W / 2, 1040, { s: 1.2, face: 1, look: [0, 0], mood: dk > 0.6 ? 'shock' : 'smile', color: dk < 0.05 ? '#d9ceb5' : col });
      if (u > gp && dk < 0.6) { ctx.save(); ctx.globalAlpha = 1 - dk; k.ellipse(ctx, W / 2, 560, 70, 16, 0, null, P.ochre, 6); ctx.restore(); }
      if (dk > 0.4) { ctx.save(); ctx.globalAlpha = dk; for (const sx of [-1, 1]) k.poly(ctx, [[W / 2 + sx * 30, 610], [W / 2 + sx * 60, 540], [W / 2 + sx * 56, 620]], P.red); ctx.restore(); }
      k.scrawl(ctx, 'good people', 240, 640, 46, tween(u, gp, gp + 0.4));
      k.scrawl(ctx, 'bad role', 760, 640, 46, tween(u, bd, bd + 0.4));
      k.stamp(ctx, 'TURN EVIL?', 760, 860, 48, tween(u, ev, ev + 0.2), 0.08);
    },
  },
  { // 22.7 "But later recordings showed staff coaching the guards to be tough."
    start: 22.0, title: 'On Tape', trans: 'blink',
    draw(ctx, u, S) {
      const { k, P, W } = S, rc = S.at('recordings'), co = S.at('coaching'), tg = S.at('tough');
      plate(ctx, S, { alpha: 0.08, seed: 22 });
      tape(ctx, k, P, W / 2, 260, 1.0, S.t, u > rc - 0.2);
      k.scrawl(ctx, 'later recordings', W / 2, 440, 46, tween(u, rc, rc + 0.5));
      k.figure(ctx, 280, 1040, { ...STAFF, s: 1.0, face: 1, look: [1, 0], mood: 'calm', armR: [1.3, 0.4] });
      guard(ctx, k, P, 680, 1040, 1.0, { face: -1, look: [-1, 0], mood: 'worry' });
      const b = pop(u, co - 0.1, 0.35);
      if (b) { ctx.save(); ctx.translate(420, 620); ctx.scale(b, b); k.rect(ctx, -170, -70, 340, 140, P.paperLight, P.ink, 4, 40); k.poly(ctx, [[-100, 70], [-140, 120], [-50, 70]], P.paperLight, P.ink, 4); k.text(ctx, '"Be tough."', 0, 4, 46, { font: 'hand', color: P.red }); ctx.restore(); }
      k.stamp(ctx, 'COACHED', 760, 560, 48, tween(u, tg, tg + 0.2), 0.08);
    },
  },
  { // 26.75 "And one famous breakdown, the prisoner said he faked it."
    start: 25.95, title: 'The Breakdown', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, br = S.at('breakdown'), sd = S.at('said'), fk = S.at('faked');
      plate(ctx, S, { alpha: 0.1, seed: 26 });
      k.spotlight(ctx, W / 2, -20, W / 2, 900, 300, 1);
      prisoner(ctx, k, P, 470, 1000, 1.0, 8612, { mood: u < fk ? 'shock' : 'smile', look: [0, -0.2], bob: u < fk ? Math.sin(S.t * 20) * 4 : 0 });
      bars(ctx, k, P, 260, 520, 420, 480, 5);
      k.scrawl(ctx, 'famous breakdown', W / 2, 160, 50, tween(u, br, br + 0.5), { rot: -0.04 });
      const m = tween(u, fk - 0.2, fk + 0.4);
      if (m > 0) { mask(ctx, k, P, lerp(470, 760, m), lerp(640, 400, m), 0.9, lerp(0, 0.4, m)); }
      const b = pop(u, sd - 0.1, 0.35);
      if (b) { ctx.save(); ctx.translate(250, 400); ctx.scale(b, b); k.rect(ctx, -170, -60, 340, 120, P.paperLight, P.ink, 4, 40); k.text(ctx, '"I faked it."', 0, 4, 44, { font: 'hand', color: P.red }); ctx.restore(); }
      k.stamp(ctx, 'FAKED', 760, 900, 60, tween(u, fk + 0.3, fk + 0.5), -0.08);
    },
  },
  { // 30.95 "Here's the trick. Tell people what you expect and they'll give it to you."
    start: 30.05, title: 'Tell Them What You Expect', trans: 'bleed',
    draw(ctx, u, S) {
      const { k, P, W } = S, ex = S.at('expect'), gv = S.at('give');
      plate(ctx, S, { alpha: 0.08, seed: 31 });
      k.stamp(ctx, 'THE TRICK', 220, 110, 44, tween(u, 0.05, 0.25), -0.1);
      k.figure(ctx, 220, 1040, { ...STAFF, s: 1.05, face: 1, look: [1, 0], mood: 'calm', armR: [1.5, 0.1], holdR: c => megaphone(c, k, P) });
      // a script handed over, and the actors play it out
      const sc = tween(u, ex - 0.4, ex + 0.3);
      if (sc > 0) { ctx.save(); ctx.translate(lerp(330, 560, sc), lerp(640, 420, sc)); ctx.rotate(-0.1); k.rect(ctx, -90, -110, 180, 220, P.paperLight, P.ink, 3, 3); k.text(ctx, 'SCRIPT', 0, -76, 26, { font: 'display', color: P.red }); for (let i = 0; i < 5; i++) k.rect(ctx, -70, -40 + i * 28, 140, 8, P.greyLight, null, 0, 2); ctx.restore(); }
      const pl = tween(u, gv - 0.3, gv + 0.3);
      guard(ctx, k, P, 620, 1040, 0.9, { baton: pl > 0.5, mood: pl > 0.5 ? 'shock' : 'calm', look: [-1, 0], face: -1 });
      prisoner(ctx, k, P, 800, 1040, 0.9, 1037, { mood: pl > 0.5 ? 'shock' : 'calm', look: [-1, 0], face: -1 });
      k.scrawl(ctx, 'what you expect', 640, 260, 46, tween(u, ex, ex + 0.5));
      k.scrawl(ctx, "…they'll give it to you", 600, 660, 42, tween(u, gv, gv + 0.6));
    },
  },
  { // 35.73 "Follow for more dark psychology." → the case-file cover
    start: 34.85, title: 'More Dark Psychology', trans: 'cut',
    draw(ctx, u, S) {
      ctx.save(); plate(ctx, S, { alpha: 0.1, seed: 31 }); ctx.restore();
      inkReveal(ctx, S, tween(u, 0.1, 0.8, ease.linear), c => caseCover(c, S, u - 0.1, { handle: meta.brand.handle, caseNo: '1971', tagline: meta.brand.tagline }));
    },
  },
];

export const sfx = [
  { t: 0.15, type: 'slide', gain: 0.4 },
  { t: 0.5, type: 'clank', gain: 0.4 },
  { t: 3.7, type: 'stamp', gain: 0.8 },
  { t: 4.8, type: 'splat', gain: 0.5 },
  { t: 4.95, type: 'stamp', gain: 0.7 },
  { t: 6.65, type: 'pen', gain: 0.4 },
  { t: 8.35, type: 'pop', gain: 0.45 },
  { t: 8.75, type: 'bell', gain: 0.3 },
  { t: 9.65, type: 'fold', gain: 0.45 },
  { t: 9.9, type: 'coins', gain: 0.4 },
  { t: 10.8, type: 'pop', gain: 0.4 }, { t: 11.5, type: 'pop', gain: 0.4, pitch: 0.9 },
  { t: 12.4, type: 'stamp', gain: 0.6 },
  { t: 13.65, type: 'clank', gain: 0.55 },
  { t: 14.7, type: 'thud', gain: 0.5 },
  { t: 15.1, type: 'pen', gain: 0.4 },
  { t: 16.4, type: 'stamp', gain: 0.75 },
  { t: 17.45, type: 'splat', gain: 0.5 },
  { t: 17.7, type: 'paper', gain: 0.4 },
  { t: 19.9, type: 'pen', gain: 0.4 },
  { t: 21.4, type: 'stamp', gain: 0.7 },
  { t: 22.0, type: 'blink', gain: 0.45 },
  { t: 22.45, type: 'click', gain: 0.6 },
  { t: 23.75, type: 'pop', gain: 0.5 },
  { t: 24.95, type: 'stamp', gain: 0.75 },
  { t: 25.95, type: 'fold', gain: 0.45 },
  { t: 26.65, type: 'heartbeat', gain: 0.45 },
  { t: 28.75, type: 'pop', gain: 0.5 },
  { t: 29.15, type: 'whoosh', gain: 0.4 },
  { t: 29.45, type: 'stamp', gain: 0.75 },
  { t: 30.05, type: 'splat', gain: 0.5 },
  { t: 30.15, type: 'stamp', gain: 0.45 },
  { t: 31.95, type: 'paper', gain: 0.45 },
  { t: 33.45, type: 'thud', gain: 0.4 },
  { t: 33.75, type: 'pen', gain: 0.4 },
  { t: 34.9, type: 'splat', gain: 0.75 },
  { t: 35.3, type: 'fold', gain: 0.4 },
  { t: 36.1, type: 'stamp', gain: 0.75 },
  { t: 37.1, type: 'moth', gain: 0.3 },
  { t: 38.7, type: 'bell', gain: 0.25 },
];

export const music = {
  kit: 'mind', bpm: 88, root: 'D', scale: 'harmonic', gain: 0.3,
  sections: [
    { from: 0.0, to: 9.65, mood: 'intro' },
    { from: 9.65, to: 17.45, mood: 'tense' },
    { from: 17.45, to: 22.0, mood: 'groove' },
    { from: 22.0, to: 34.85, mood: 'drive' },
    { from: 34.85, to: 39.4, mood: 'end' },
  ],
};
