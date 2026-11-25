// "Operation Paperclip" — an INKBLOT case file (psychology, MindTrace).
// After WWII the US brought 1,600+ German scientists, engineers and technicians to
// America (1945–1959). Truman's 1946 directive excluded active Nazis; officials
// rewrote dossiers. Wernher von Braun (Nazi Party 1937, SS 1940, SS officer) — his V-2
// was built by concentration-camp prisoners at Mittelbau-Dora; his Saturn V took
// Apollo 11 to the Moon in 1969. The halo effect (Thorndike, 1920).
// No Nazi symbols or insignia, no likenesses, no agency logos are drawn.
// u = seconds since the scene started; S.at('word') = when that word is said.
import { clamp, lerp, ease, tween, rng, TAU, shake, pop } from '../../lib/core.mjs';
import { plate, caseCover, inkReveal } from '../../styles/inkblot/scenes.mjs';

export const meta = {
  title: 'Operation Paperclip',
  slug: 'operation-paperclip-inkblot',
  style: 'inkblot',
  width: 1080, height: 1920, fps: 30,
  duration: 42.6,
  voice: 'voice.mp3',
  seed: 269,
  captionChars: 24,
  caseLine: 'THE MIND FILES  ·  CASE No. 1945  ·  CONFIDENTIAL',
  brandKit: 'mindtrace', // MindTrace (brand/mindtrace/): logo, handle, tagline, outro text
  outro: { at: 40.4 },
};

const SCI = { hair: 'slick', glasses: true, tie: '#16141a' };

function paperclip(ctx, k, P, x, y, s, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(10, 120); ctx.lineTo(10, -60); ctx.arc(-10, -60, 20, 0, Math.PI, true); ctx.lineTo(-30, 100); ctx.arc(-5, 100, 25, Math.PI, 0, true); ctx.lineTo(20, -40);
  k.stroke(ctx, '#9aa0a8', 9); ctx.restore();
}
function briefcase(c, k, P) { k.rect(c, -26, -6, 52, 38, '#6b4a2b', P.ink, 3, 4); k.rect(c, -10, -14, 20, 10, null, P.ink, 3, 3); }
function v2(ctx, k, P, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(0, -300); ctx.quadraticCurveTo(46, -200, 46, -40); ctx.lineTo(46, 120); ctx.lineTo(-46, 120); ctx.lineTo(-46, -40); ctx.quadraticCurveTo(-46, -200, 0, -300); k.fill(ctx, '#8a8f87'); k.stroke(ctx, P.ink, 4);
  for (const sx of [-1, 1]) k.poly(ctx, [[sx * 46, 40], [sx * 100, 150], [sx * 46, 120]], P.inkSoft, P.ink, 3);
  k.line(ctx, -46, -40, 46, -40, P.ink, 3);
  ctx.restore();
}
function saturn(ctx, k, P, x, y, s, flame = 0, t = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (flame > 0) { for (let i = 0; i < 4; i++) { const f = 120 + 60 * Math.sin(t * 20 + i) ; k.poly(ctx, [[-60 + i * 40, 0], [-40 + i * 40, f * flame], [-20 + i * 40, 0]], i % 2 ? '#ddb14d' : P.red); } }
  k.rect(ctx, -60, -380, 120, 380, P.paperLight, P.ink, 4);
  k.rect(ctx, -60, -120, 120, 26, P.ink); k.rect(ctx, -60, -260, 120, 18, P.ink);
  k.rect(ctx, -44, -500, 88, 120, P.paperLight, P.ink, 4);
  k.poly(ctx, [[-44, -500], [0, -580], [44, -500]], P.paperLight, P.ink, 4); k.line(ctx, 0, -580, 0, -640, P.ink, 4);
  for (const sx of [-1, 1]) k.poly(ctx, [[sx * 60, -60], [sx * 96, 0], [sx * 60, 0]], P.ink);
  k.text(ctx, 'U S A', 0, -320, 26, { font: 'display', color: P.ink });
  ctx.restore();
}
function halo(ctx, k, P, x, y, rx, a, t) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  const g = ctx.createRadialGradient(x, y, 10, x, y, rx * 2.2); g.addColorStop(0, 'rgba(255,236,170,0.55)'); g.addColorStop(1, 'rgba(255,236,170,0)'); ctx.fillStyle = g; ctx.fillRect(x - rx * 2.4, y - rx * 2.4, rx * 4.8, rx * 4.8);
  k.ellipse(ctx, x, y, rx, rx * 0.25, 0, null, P.ochre, 12 + 2 * Math.sin(t * 3));
  ctx.restore();
}

export const scenes = [
  { // 0.12 "After World War II, the US secretly hired Nazi scientists."
    start: 0, title: 'Secretly Hired',
    draw(ctx, u, S) {
      const { k, P, W } = S, ww = S.at('World'), sc = S.at('secretly'), hi = S.at('hired'), nz = S.at('Nazi');
      plate(ctx, S, { alpha: 0.12, seed: 3 });
      k.stamp(ctx, '1945', 790, 110, 64, tween(u, ww, ww + 0.25), 0.1);
      // two shores and an ocean between
      k.rect(ctx, 60, 560, 200, 500, P.paperDark, P.ink, 4, 6); k.text(ctx, 'GERMANY', 160, 600, 30, { font: 'display' });
      k.rect(ctx, 680, 560, 200, 500, P.paperDark, P.ink, 4, 6); k.text(ctx, 'USA', 780, 600, 34, { font: 'display' });
      for (let i = 0; i < 6; i++) { ctx.beginPath(); for (let j = 0; j <= 20; j++) ctx.lineTo(270 + j * 20, 700 + i * 60 + Math.sin(S.t * 2 + j + i) * 6); k.stroke(ctx, P.sky, 4); }
      const w = tween(u, sc - 0.2, nz + 1.0, ease.inOut);
      ctx.save(); ctx.setLineDash([8, 14]); ctx.beginPath(); ctx.moveTo(220, 640); ctx.quadraticCurveTo(470, 440, lerp(220, 720, w), lerp(640, 640, w)); k.stroke(ctx, P.red, 5); ctx.restore();
      // a ship carries three scientists across
      const sx = lerp(260, 600, w), sy = 760 + Math.sin(S.t * 2) * 6;
      k.rect(ctx, sx + 92, sy - 150, 12, 120, P.ink); k.poly(ctx, [[sx + 92, sy - 150], [sx + 30, sy - 90], [sx + 92, sy - 60]], P.paperLight, P.ink, 3);
      for (let i = 0; i < 3; i++) k.figure(ctx, sx - 70 + i * 46, sy - 20, { ...SCI, s: 0.4, face: 1, look: [1, 0], mood: 'calm', shadow: false });
      k.poly(ctx, [[sx - 120, sy - 30], [sx + 130, sy - 30], [sx + 90, sy + 30], [sx - 100, sy + 30]], P.inkSoft, P.ink, 4);
      k.scrawl(ctx, 'secretly', 300, 260, 56, tween(u, sc, sc + 0.4), { rot: -0.05 });
      k.stamp(ctx, 'HIRED', 470, 400, 60, tween(u, hi, hi + 0.2), -0.08);
    },
  },
  { // 4.88 "It was called Operation Paperclip."
    start: 4.8, title: 'Operation Paperclip', trans: 'bleed',
    draw(ctx, u, S) {
      const { k, P, W } = S, op = S.at('Operation'), pc = S.at('Paperclip');
      plate(ctx, S, { alpha: 0.08, seed: 5 });
      ctx.save(); ctx.translate(W / 2, 580); ctx.rotate(-0.02);
      k.poly(ctx, [[-380, -360], [-340, -410], [-120, -410], [-80, -360]], '#cfae6e', P.ink, 4);
      k.rect(ctx, -380, -360, 760, 720, '#dcbd7e', P.ink, 5, 6);
      k.typeOn(ctx, 'OPERATION', 0, -200, 76, tween(u, op - 0.1, op + 0.5), { font: 'type', align: 'center' });
      k.typeOn(ctx, 'PAPERCLIP', 0, -110, 88, tween(u, pc - 0.1, pc + 0.6), { font: 'type', align: 'center', color: P.red });
      for (let i = 0; i < 5; i++) k.rect(ctx, -300, 0 + i * 50, 600 - (i * 83) % 220, 24, P.greyLight, null, 0, 2);
      ctx.restore();
      const cl = tween(u, pc + 0.3, pc + 0.7, ease.outBack);
      if (cl > 0) paperclip(ctx, k, P, 760, lerp(80, 250, cl), 1.0, 0.1);
      k.scrawl(ctx, 'a clip on the chosen files', 470, 1010, 40, tween(u, pc + 0.6, pc + 1.2));
    },
  },
  { // 7.86 "More than 1,600 German scientists and engineers came to America."
    start: 7.75, title: '1,600+', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, n0 = S.at('1,600'), am = S.at('America');
      plate(ctx, S, { alpha: 0.08, seed: 7 });
      const v = Math.floor(lerp(0, 1600, tween(u, n0 - 0.2, am, ease.outCubic)));
      k.text(ctx, (v >= 1600 ? '1,600+' : v.toLocaleString('en-US')), W / 2, 220, 140, { font: 'display', color: P.red });
      k.text(ctx, 'SCIENTISTS · ENGINEERS · TECHNICIANS', W / 2, 330, 30, { font: 'display', max: 860 });
      const n = Math.floor(v / 40);
      for (let i = 0; i < n; i++) { const x = 120 + (i % 10) * 78, y = 560 + Math.floor(i / 10) * 110; k.figure(ctx, x, y, { ...SCI, s: 0.3, face: 1, look: [0, 0.2], mood: 'calm', shadow: false }); }
      k.scrawl(ctx, 'came to America', W / 2, 1030, 46, tween(u, am, am + 0.5));
    },
  },
  { // 13.15 "President Truman banned active Nazis. So officials cleaned up their files."
    start: 13.05, title: 'Cleaned-Up Files', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, tr = S.at('Truman'), ba = S.at('banned'), of = S.at('officials'), cl = S.at('cleaned');
      plate(ctx, S, { alpha: 0.08, seed: 13 });
      // the directive
      ctx.save(); ctx.translate(270, 330); ctx.rotate(-0.04);
      k.rect(ctx, -200, -220, 400, 440, P.paperLight, P.ink, 4, 4);
      k.text(ctx, 'PRESIDENTIAL', 0, -170, 28, { font: 'type' }); k.text(ctx, 'DIRECTIVE, 1946', 0, -134, 28, { font: 'type' });
      k.line(ctx, -160, -106, 160, -106, P.ink, 2);
      k.text(ctx, 'NO ACTIVE', 0, -40, 44, { font: 'display', color: tween(u, ba, ba + 0.3) > 0.5 ? P.red : P.ink });
      k.text(ctx, 'NAZIS', 0, 14, 44, { font: 'display', color: tween(u, ba, ba + 0.3) > 0.5 ? P.red : P.ink });
      k.penLine(ctx, [[-120, 150], [-60, 130], [0, 160], [80, 135], [130, 150]], tween(u, tr, tr + 0.6), P.ink, 3, 2);
      ctx.restore();
      // a dossier with its worst lines painted over
      ctx.save(); ctx.translate(680, 720); ctx.rotate(0.04);
      k.rect(ctx, -220, -260, 440, 520, P.card, P.ink, 4, 4);
      k.text(ctx, 'DOSSIER', 0, -210, 34, { font: 'type' });
      const lines = ['Party member', 'Active supporter', 'SS member', 'Engineer', 'Rocket expert'];
      const wo = tween(u, cl - 0.2, cl + 0.9);
      lines.forEach((l, i) => { const y = -130 + i * 70; k.text(ctx, l, -180, y, 30, { font: 'type', align: 'left' }); if (i < 3) k.rect(ctx, -190, y - 22, 360 * clamp(wo * 3 - i), 44, P.paperLight, null, 0, 6); });
      ctx.restore();
      k.stamp(ctx, 'CLEARED', 680, 960, 52, tween(u, cl + 0.9, cl + 1.1), -0.08);
      k.scrawl(ctx, 'cleaned up', 760, 330, 50, tween(u, of, of + 0.5), { rot: 0.05 });
    },
  },
  { // 18.56 "One of them, Wernher von Braun, SS officer."
    start: 18.45, title: 'One of Them', trans: 'blink',
    draw(ctx, u, S) {
      const { k, P, W } = S, wb = S.at('Wernher'), ss = S.at('SS');
      plate(ctx, S, { alpha: 0.1, seed: 18 });
      ctx.save(); ctx.translate(W / 2, 540); ctx.rotate(-0.02);
      k.rect(ctx, -380, -360, 760, 720, P.card, P.ink, 5, 6);
      k.rect(ctx, -340, -310, 220, 280, P.paperDark, P.ink, 3, 4);
      k.circle(ctx, -230, -200, 60, P.grey); k.rect(ctx, -300, -140, 140, 110, P.grey, null, 0, 30);
      k.text(ctx, '?', -230, -200, 70, { font: 'display', color: P.paperLight });
      k.typeOn(ctx, 'VON BRAUN, Wernher', -80, -260, 38, tween(u, wb - 0.1, wb + 0.8), { font: 'type' });
      k.text(ctx, 'Rocket engineer', -80, -200, 30, { font: 'type', align: 'left', color: P.inkSoft });
      const f = tween(u, ss - 0.3, ss + 0.4);
      ctx.save(); ctx.globalAlpha = f;
      k.text(ctx, 'Nazi Party: 1937', -320, 60, 36, { font: 'type', align: 'left' });
      k.text(ctx, 'SS: 1940', -320, 130, 36, { font: 'type', align: 'left' });
      k.text(ctx, 'Rank: SS officer', -320, 200, 36, { font: 'type', align: 'left' });
      ctx.restore();
      ctx.restore();
      k.stamp(ctx, 'SS OFFICER', 700, 930, 56, tween(u, ss + 0.5, ss + 0.7), -0.08);
    },
  },
  { // 22.49 "His V-2 rockets were built by concentration camp prisoners."
    start: 22.4, title: 'Who Built the V-2', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W, H } = S, v = S.at('V-2'), bu = S.at('built'), pr = S.at('prisoners');
      // a dark tunnel factory
      ctx.fillStyle = '#1d1b26'; ctx.fillRect(-300, -300, W + 600, H + 600);
      ctx.save(); ctx.beginPath(); ctx.moveTo(40, 1060); ctx.lineTo(40, 380); ctx.quadraticCurveTo(470, 80, 900, 380); ctx.lineTo(900, 1060); ctx.closePath(); ctx.fillStyle = '#2b2933'; ctx.fill(); ctx.restore();
      for (let i = 0; i < 4; i++) { ctx.save(); ctx.globalAlpha = 0.25 + 0.1 * Math.sin(S.t * 2 + i); k.circle(ctx, 180 + i * 190, 300, 14, '#fff3c8'); ctx.restore(); }
      const r = tween(u, v - 0.3, v + 0.4);
      if (r > 0) { ctx.save(); ctx.globalAlpha = r; v2(ctx, k, P, W / 2, 760, 1.05); ctx.restore(); }
      const p = tween(u, bu - 0.2, pr + 0.4);
      for (let i = 0; i < 6; i++) { if (p * 6 <= i) continue; const x = i < 3 ? 120 + i * 90 : 600 + (i - 3) * 90; k.figure(ctx, x, 1040, { s: 0.6, face: i < 3 ? 1 : -1, look: [i < 3 ? 1 : -1, -0.3], mood: 'worry', color: '#5b5862', shadow: false, bob: Math.sin(S.t * 1.5 + i) * 2 }); }
      k.scrawl(ctx, 'V-2', 640, 470, 60, tween(u, v, v + 0.3), { color: P.redLight });
      k.scrawl(ctx, 'built by prisoners', W / 2, 140, 48, tween(u, pr - 0.3, pr + 0.4), { color: P.redLight });
      const n = tween(u, pr + 0.5, pr + 1.0);
      if (n > 0) { ctx.save(); ctx.globalAlpha = n; k.text(ctx, 'Thousands died building them.', W / 2, 230, 32, { color: P.paperLight }); ctx.restore(); }
    },
  },
  { // 26.44 "In 1969, his Saturn V rocket took Apollo 11 to the Moon."
    start: 26.35, title: 'To the Moon', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, yr = S.at('1969'), sa = S.at('Saturn'), mo = S.at('Moon');
      plate(ctx, S, { alpha: 0.08, seed: 26 });
      k.stamp(ctx, '1969', 200, 120, 64, tween(u, yr, yr + 0.25), -0.1);
      k.circle(ctx, 780, 220, 110, P.paperLight, P.ink, 4); for (const [cx, cy, r] of [[750, 190, 20], [810, 250, 14], [770, 260, 10]]) k.circle(ctx, cx, cy, r, P.greyLight);
      const lift = tween(u, sa + 0.4, mo + 0.6, ease.inQuad);
      saturn(ctx, k, P, 420, lerp(1040, 700, lift), 1.0, tween(u, sa, sa + 0.3), S.t);
      k.text(ctx, 'SATURN V', 260, 520, 34, { font: 'display', color: u > sa ? P.red : 'rgba(0,0,0,0)' });
      k.scrawl(ctx, 'Apollo 11', 760, 420, 52, tween(u, mo - 1.0, mo - 0.5));
      k.arrow(ctx, 560, 380, 690, 290, tween(u, mo - 0.3, mo + 0.2));
    },
  },
  { // 31.69 "Here's the trick. One big success makes people forget the past. It's called the Halo Effect."
    start: 31.6, title: 'The Halo Effect', trans: 'bleed',
    draw(ctx, u, S) {
      const { k, P, W } = S, su = S.at('success'), fo = S.at('forget'), ha = S.at('Halo');
      plate(ctx, S, { alpha: 0.08, seed: 31 });
      k.stamp(ctx, 'THE TRICK', 220, 110, 44, tween(u, 0.05, 0.25), -0.1);
      // the success shines; the dark file behind it fades
      const fade = tween(u, fo - 0.2, fo + 1.0);
      ctx.save(); ctx.globalAlpha = 1 - fade * 0.85; ctx.translate(700, 640); ctx.rotate(0.06);
      k.rect(ctx, -170, -220, 340, 440, P.card, P.ink, 4, 4); k.text(ctx, 'THE PAST', 0, -170, 34, { font: 'type' });
      for (let i = 0; i < 5; i++) k.rect(ctx, -130, -100 + i * 60, 260, 28, P.ink, null, 0, 2);
      ctx.restore();
      saturn(ctx, k, P, 300, 1040, 0.85, 0, S.t);
      halo(ctx, k, P, 300, 420, 120, tween(u, su - 0.2, su + 0.4), S.t);
      k.scrawl(ctx, 'one big success', 300, 260, 48, tween(u, su, su + 0.5), { rot: -0.05 });
      k.scrawl(ctx, 'forgotten', 700, 920, 50, tween(u, fo, fo + 0.4));
      k.stamp(ctx, 'HALO EFFECT', W / 2, 1010, 60, tween(u, ha, ha + 0.2), -0.05);
    },
  },
  { // 38.33 "Follow for more dark psychology." → the case-file cover
    start: 38.15, title: 'More Dark Psychology', trans: 'cut',
    draw(ctx, u, S) {
      ctx.save(); plate(ctx, S, { alpha: 0.1, seed: 31 }); ctx.restore();
      inkReveal(ctx, S, tween(u, 0.1, 0.8, ease.linear), c => caseCover(c, S, u - 0.1, { handle: meta.brand.handle, caseNo: '1945', tagline: meta.brand.tagline }));
    },
  },
];

export const sfx = [
  { t: 0.3, type: 'wind', gain: 0.3 },
  { t: 0.5, type: 'stamp', gain: 0.65 },
  { t: 2.3, type: 'waves', gain: 0.3 },
  { t: 2.9, type: 'stamp', gain: 0.75 },
  { t: 2.4, type: 'pen', gain: 0.4 },
  { t: 4.8, type: 'splat', gain: 0.5 },
  { t: 5.9, type: 'typewriter', gain: 0.5 },
  { t: 6.9, type: 'snap', gain: 0.6 },
  { t: 7.75, type: 'fold', gain: 0.45 },
  { t: 8.3, type: 'tick', gain: 0.35 },
  { t: 10.0, type: 'pop', gain: 0.35 }, { t: 10.6, type: 'pop', gain: 0.35, pitch: 1.1 }, { t: 11.2, type: 'pop', gain: 0.35, pitch: 1.2 },
  { t: 12.0, type: 'pen', gain: 0.4 },
  { t: 13.05, type: 'whoosh', gain: 0.35 },
  { t: 13.5, type: 'pen', gain: 0.4 },
  { t: 14.0, type: 'stamp', gain: 0.5 },
  { t: 16.7, type: 'slide', gain: 0.4 }, { t: 17.1, type: 'slide', gain: 0.4 }, { t: 17.5, type: 'slide', gain: 0.4 },
  { t: 17.9, type: 'stamp', gain: 0.75 },
  { t: 18.45, type: 'blink', gain: 0.45 },
  { t: 19.4, type: 'typewriter', gain: 0.45 },
  { t: 21.3, type: 'heartbeat', gain: 0.45 },
  { t: 21.8, type: 'stamp', gain: 0.85 },
  { t: 22.4, type: 'fold', gain: 0.45 },
  { t: 22.9, type: 'clank', gain: 0.4 },
  { t: 24.0, type: 'clank', gain: 0.3 },
  { t: 25.3, type: 'heartbeat', gain: 0.4 },
  { t: 26.35, type: 'fold', gain: 0.45 },
  { t: 26.6, type: 'stamp', gain: 0.7 },
  { t: 28.1, type: 'riser', gain: 0.4 },
  { t: 28.6, type: 'thunder', gain: 0.35 },
  { t: 30.8, type: 'chime', gain: 0.45 },
  { t: 31.6, type: 'splat', gain: 0.5 },
  { t: 31.7, type: 'stamp', gain: 0.45 },
  { t: 33.4, type: 'chime', gain: 0.45 },
  { t: 34.7, type: 'pen', gain: 0.4 },
  { t: 37.0, type: 'stamp', gain: 0.8 },
  { t: 38.2, type: 'splat', gain: 0.75 },
  { t: 38.6, type: 'fold', gain: 0.4 },
  { t: 39.4, type: 'stamp', gain: 0.75 },
  { t: 40.4, type: 'moth', gain: 0.3 },
  { t: 42.0, type: 'bell', gain: 0.25 },
];

export const music = {
  kit: 'mind', bpm: 80, root: 'C', scale: 'minor', gain: 0.3,
  sections: [
    { from: 0, to: 13.05, mood: 'tense' },
    { from: 13.05, to: 22.4, mood: 'drive' },
    { from: 22.4, to: 26.35, mood: 'sad' },
    { from: 26.35, to: 31.6, mood: 'triumph' },
    { from: 31.6, to: 38.15, mood: 'tense' },
    { from: 38.15, to: 42.6, mood: 'end' },
  ],
};
