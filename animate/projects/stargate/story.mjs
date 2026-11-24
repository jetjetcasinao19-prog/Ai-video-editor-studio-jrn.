// "Project Stargate" — an INKBLOT case file (psychology, MindTrace).
// The US government's remote-viewing ("psychic spying") programs, 1970s–1995, run
// from Fort Meade, Maryland, under names ending in STAR GATE; about $20 million.
// The 1995 American Institutes for Research evaluation for the CIA found it had never
// been used to guide an intelligence operation. Vague reports feel accurate because
// people fill in the rest (subjective validation / the Barnum–Forer effect).
// u = seconds since the scene started; S.at('word') = when that word is said.
import { clamp, lerp, ease, tween, rng, TAU, shake, pop } from '../../lib/core.mjs';
import { plate, caseCover, inkReveal } from '../../styles/inkblot/scenes.mjs';

export const meta = {
  title: 'Project Stargate',
  slug: 'stargate-inkblot',
  style: 'inkblot',
  width: 1080, height: 1920, fps: 30,
  duration: 36.8,
  voice: 'voice.mp3',
  seed: 257,
  captionChars: 24,
  caseLine: 'THE MIND FILES  ·  CASE No. 1995  ·  CONFIDENTIAL',
  brandKit: 'mindtrace', // MindTrace (brand/mindtrace/): logo, handle, tagline, outro text
  outro: { at: 34.6 },
};

const OLIVE = '#3f4a3a';
const VIEWER = { hat: 'cap', tie: '#16141a', color: OLIVE };

// a glowing "third eye" on a forehead at (x, y)
function thirdEye(ctx, k, P, x, y, r, a, t) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  const g = ctx.createRadialGradient(x, y, 4, x, y, r * 4); g.addColorStop(0, 'rgba(198,31,42,0.45)'); g.addColorStop(1, 'rgba(198,31,42,0)'); ctx.fillStyle = g; ctx.fillRect(x - r * 4, y - r * 4, r * 8, r * 8);
  k.eye(ctx, x, y, r, { open: 0.7 + 0.3 * Math.sin(t * 2), look: [Math.sin(t), 0], lashes: false, white: P.paperLight });
  ctx.restore();
}
// a wobbly, vague "psychic sketch"
function vagueSketch(ctx, k, P, x, y, s, kk, t, seed = 2) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  k.rect(ctx, -200, -150, 400, 300, P.paperLight, P.ink, 3, 2);
  const R = rng(seed);
  const strokes = [
    [[-120, 60], [-60, 40], [0, 60], [80, 30], [140, 60]],
    [[-60, 20], [-50, -60], [10, -80], [30, -10]],
    [[60, -40], [90, -90], [120, -40], [90, 0], [60, -40]],
    [[-150, 100], [-40, 110], [60, 95], [150, 110]],
  ];
  strokes.forEach((st, i) => { const p = clamp(kk * 4 - i); if (p <= 0) return; k.penLine(ctx, st.map(([a, b]) => [a + Math.sin(t * 2 + i) * 2, b]), p, P.inkSoft, 4, seed + i); });
  if (kk > 0.8) { k.text(ctx, '"a structure…', 0, -118, 22, { font: 'hand', color: P.inkSoft }); k.text(ctx, 'near water?"', 0, 132, 22, { font: 'hand', color: P.inkSoft }); }
  ctx.restore();
}
function enemyBase(ctx, k, P, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  k.rect(ctx, -160, -60, 120, 60, P.inkSoft, P.ink, 3); k.rect(ctx, -20, -100, 70, 100, P.inkSoft, P.ink, 3); k.rect(ctx, 70, -50, 100, 50, P.inkSoft, P.ink, 3);
  k.line(ctx, 10, -100, 10, -150, P.ink, 4); ctx.beginPath(); ctx.arc(10, -150, 26, Math.PI * 1.1, Math.PI * 1.9); k.stroke(ctx, P.ink, 4);
  for (let i = -8; i <= 8; i++) k.line(ctx, i * 22, 0, i * 22, -24, P.grey, 2); k.line(ctx, -180, -18, 180, -18, P.grey, 2);
  ctx.restore();
}

export const scenes = [
  { // 0.0 "The U.S. government once paid psychics to spy for it, for over 20 years."
    start: 0, title: 'Psychic Spies',
    draw(ctx, u, S) {
      const { k, P, W } = S, pa = S.at('paid'), ps = S.at('psychics'), sp = S.at('spy'), yr = S.at('years');
      plate(ctx, S, { alpha: 0.12, seed: 3 });
      S.cam(lerp(1.06, 1.0, tween(u, 0, 5)), W / 2, 560);
      k.figure(ctx, 330, 1040, { ...VIEWER, s: 1.3, face: 1, look: [0, 0], mood: 'calm', blink: 0.05, armL: [0.6, 1.8], armR: [0.6, 1.8] });
      thirdEye(ctx, k, P, 345, 494, 22, tween(u, ps, ps + 0.5), S.t);
      // money for the psychic
      const m = tween(u, pa - 0.2, pa + 0.6);
      for (let i = 0; i < 6; i++) if (m * 6 > i) { k.rect(ctx, 640, 960 - i * 26, 220, 24, P.sage, P.ink, 3, 4); k.circle(ctx, 750, 972 - i * 26, 8, P.paperLight); }
      k.scrawl(ctx, 'psychics', 330, 250, 60, tween(u, ps, ps + 0.4), { rot: -0.05 });
      k.stamp(ctx, 'SPIES', 760, 300, 60, tween(u, sp, sp + 0.2), 0.1);
      k.text(ctx, '20+ YEARS', 750, 560, 56, { font: 'display', color: u > yr - 0.4 ? P.red : 'rgba(0,0,0,0)' });
    },
  },
  { // 5.48 "It was called Project Stargate."
    start: 5.35, title: 'Project Stargate', trans: 'bleed',
    draw(ctx, u, S) {
      const { k, P, W } = S, pr = S.at('Project');
      plate(ctx, S, { alpha: 0.08, seed: 5 });
      ctx.save(); ctx.translate(W / 2, 560); ctx.rotate(-0.02);
      k.poly(ctx, [[-380, -340], [-340, -390], [-120, -390], [-80, -340]], '#cfae6e', P.ink, 4);
      k.rect(ctx, -380, -340, 760, 680, '#dcbd7e', P.ink, 5, 6);
      k.text(ctx, 'U.S. ARMY / DIA', -230, -364, 24, { font: 'type' });
      k.typeOn(ctx, 'PROJECT', 0, -200, 72, tween(u, pr - 0.1, pr + 0.4), { font: 'type', align: 'center' });
      k.typeOn(ctx, 'STARGATE', 0, -110, 88, tween(u, pr + 0.4, pr + 1.1), { font: 'type', align: 'center', color: P.red });
      k.text(ctx, '"remote viewing"', 0, -10, 40, { font: 'hand', color: P.inkSoft });
      for (let i = 0; i < 5; i++) k.rect(ctx, -300, 70 + i * 48, 600 - (i * 83) % 220, 24, P.ink, null, 0, 2);
      ctx.restore();
      k.stamp(ctx, 'SECRET', 760, 1000, 50, tween(u, pr + 1.0, pr + 1.2), -0.08);
    },
  },
  { // 7.91 "Soldiers at Fort Meade tried to see enemy bases with their minds."
    start: 7.8, title: 'Seeing With the Mind', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, fm = S.at('Fort'), se = S.at('see'), en = S.at('enemy'), mi = S.at('minds');
      plate(ctx, S, { alpha: 0.08, seed: 8 });
      // the viewer at a desk, eyes closed, sketching
      k.rect(ctx, 90, 860, 400, 22, P.inkSoft, P.ink, 3, 4); k.rect(ctx, 110, 882, 18, 160, P.inkSoft); k.rect(ctx, 452, 882, 18, 160, P.inkSoft);
      k.figure(ctx, 230, 1040, { ...VIEWER, s: 0.95, sit: true, face: 1, look: [0.3, 0.6], mood: 'calm', blink: 0.05, armR: [0.9, 1.3] });
      k.rect(ctx, 300, 836, 150, 20, P.paperLight, P.ink, 2, 2);
      thirdEye(ctx, k, P, 245, 730, 16, 1, S.t);
      // a beam out to a far-off base
      const b = tween(u, se - 0.3, en + 0.4);
      if (b > 0) { ctx.save(); ctx.setLineDash([8, 14]); ctx.lineDashOffset = -S.t * 40; ctx.beginPath(); ctx.moveTo(260, 700); ctx.quadraticCurveTo(520, 300, lerp(260, 720, b), lerp(700, 380, b)); k.stroke(ctx, P.red, 5); ctx.restore(); }
      const eb = tween(u, en - 0.2, en + 0.3);
      if (eb > 0) { ctx.save(); ctx.globalAlpha = eb; enemyBase(ctx, k, P, 720, 460, 1.0); k.text(ctx, 'ENEMY BASE', 720, 510, 30, { font: 'display', color: P.red }); ctx.restore(); }
      k.scrawl(ctx, 'Fort Meade, Maryland', 300, 150, 46, tween(u, fm, fm + 0.5), { rot: -0.04 });
      k.scrawl(ctx, 'with their minds', 700, 720, 46, tween(u, mi - 0.3, mi + 0.3));
    },
  },
  { // 13.55 "Cost? About $20 million."
    start: 13.45, title: '$20 Million', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, ab = S.at('About'), mi = S.at('million');
      plate(ctx, S, { alpha: 0.08, seed: 13 });
      const v = Math.floor(lerp(0, 20, tween(u, ab - 0.2, mi + 0.3, ease.outCubic)));
      k.text(ctx, v ? '$' + v + ',000,000' : '$ ?', W / 2, 330, 104, { font: 'display', color: P.red, max: 880 });
      k.scrawl(ctx, 'cost?', 260, 160, 56, tween(u, 0, 0.4), { rot: -0.06 });
      const R = rng(7);
      for (let i = 0; i < Math.floor(v * 1.4); i++) { const x = 160 + (i % 7) * 105, y = 980 - Math.floor(i / 7) * 34; k.rect(ctx, x - 48, y - 14, 96, 30, P.sage, P.ink, 3, 4); k.circle(ctx, x, y + 1, 8, P.paperLight); }
    },
  },
  { // 16.34 "In 1995, an independent review found it never once guided an intelligence operation."
    start: 16.25, title: 'The 1995 Review', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, yr = S.at('1995'), rv = S.at('review'), nv = S.at('never'), op = S.at('operation');
      plate(ctx, S, { alpha: 0.08, seed: 16 });
      k.stamp(ctx, '1995', 790, 110, 64, tween(u, yr, yr + 0.25), 0.1);
      ctx.save(); ctx.translate(W / 2, 560); ctx.rotate(0.02);
      k.rect(ctx, -330, -380, 660, 760, P.paperLight, P.ink, 4, 4);
      k.text(ctx, 'INDEPENDENT EVALUATION', 0, -320, 34, { font: 'type' });
      k.line(ctx, -280, -290, 280, -290, P.ink, 3);
      k.text(ctx, 'Times it guided an', 0, -180, 38, { font: 'type' });
      k.text(ctx, 'intelligence operation:', 0, -130, 38, { font: 'type' });
      const z = pop(u, nv - 0.1, 0.35);
      if (z) { ctx.save(); ctx.translate(0, 70); ctx.scale(z, z); k.text(ctx, '0', 0, 0, 260, { font: 'display', color: P.red }); ctx.restore(); }
      ctx.restore();
      k.stamp(ctx, 'NEVER ONCE', W / 2, 900, 60, tween(u, op, op + 0.2), -0.06);
      k.scrawl(ctx, 'independent', 760, 1010, 40, tween(u, rv - 0.6, rv), { rot: -0.05 });
    },
  },
  { // 22.61 "Here's the trick. Their reports were vague."
    start: 22.5, title: 'Vague Reports', trans: 'blink',
    draw(ctx, u, S) {
      const { k, P, W } = S, rp = S.at('reports'), vg = S.at('vague.');
      plate(ctx, S, { alpha: 0.08, seed: 22 });
      k.stamp(ctx, 'THE TRICK', 220, 110, 44, tween(u, 0.05, 0.25), -0.1);
      vagueSketch(ctx, k, P, W / 2, 520, 1.6, tween(u, rp - 0.4, vg + 0.4), S.t);
      k.stamp(ctx, 'VAGUE', W / 2, 920, 72, tween(u, vg, vg + 0.2), -0.08);
    },
  },
  { // 25.87 "And vague feels accurate, because your brain fills in the rest."
    start: 25.8, title: 'Your Brain Fills In the Rest', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, ac = S.at('accurate'), fi = S.at('fills'), re = S.at('rest');
      plate(ctx, S, { alpha: 0.08, seed: 25 });
      vagueSketch(ctx, k, P, W / 2, 420, 1.3, 1, S.t);
      // red pen "fills in" a building, a harbour and a crane
      const f = tween(u, fi - 0.3, re + 0.4);
      ctx.save(); ctx.translate(W / 2, 420); ctx.scale(1.3, 1.3);
      k.penLine(ctx, [[-60, 20], [-60, -70], [30, -70], [30, 20]], clamp(f * 3), P.red, 5, 3);
      k.penLine(ctx, [[-150, 80], [-100, 70], [-50, 80], [0, 70], [50, 80], [100, 70], [150, 80]], clamp(f * 3 - 1), P.red, 5, 4);
      k.penLine(ctx, [[90, 0], [90, -110], [150, -110], [150, -80]], clamp(f * 3 - 2), P.red, 5, 5);
      ctx.restore();
      k.profile(ctx, 260, 1040, 0.85, { blink: 0.6 });
      k.scrawl(ctx, '"so accurate!"', 680, 820, 52, tween(u, ac, ac + 0.5), { rot: -0.05 });
      k.scrawl(ctx, 'your brain fills it in', 640, 960, 40, tween(u, fi, fi + 0.6));
    },
  },
  { // 29.9 "That's how horoscopes work too."
    start: 29.8, title: 'Horoscopes Too', trans: 'bleed',
    draw(ctx, u, S) {
      const { k, P, W } = S, ho = S.at('horoscopes');
      plate(ctx, S, { alpha: 0.08, seed: 29 });
      // a zodiac wheel and a vague horoscope
      ctx.save(); ctx.translate(W / 2, 360); ctx.rotate(S.t * 0.2);
      k.circle(ctx, 0, 0, 210, P.paperLight, P.ink, 5); k.circle(ctx, 0, 0, 140, null, P.ink, 3);
      for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; k.line(ctx, Math.cos(a) * 140, Math.sin(a) * 140, Math.cos(a) * 210, Math.sin(a) * 210, P.ink, 3); k.circle(ctx, Math.cos(a + 0.26) * 175, Math.sin(a + 0.26) * 175, 9, i % 2 ? P.red : P.ink); }
      k.circle(ctx, 0, 0, 40, P.red, P.ink, 3);
      ctx.restore();
      const p = pop(u, ho - 0.2, 0.35);
      if (p) { ctx.save(); ctx.translate(W / 2, 800); ctx.scale(p, p); k.rect(ctx, -360, -130, 720, 260, P.card, P.ink, 4, 8); k.text(ctx, 'YOUR HOROSCOPE', 0, -86, 32, { font: 'display' }); k.text(ctx, '"Something important', 0, -20, 40, { font: 'hand', color: P.red }); k.text(ctx, 'may change soon."', 0, 34, 40, { font: 'hand', color: P.red }); ctx.restore(); }
      k.scrawl(ctx, 'fits everyone', 760, 1010, 40, tween(u, ho + 0.5, ho + 1.0));
    },
  },
  { // 32.19 "Follow for more dark psychology." → the case-file cover
    start: 32.05, title: 'More Dark Psychology', trans: 'cut',
    draw(ctx, u, S) {
      ctx.save(); plate(ctx, S, { alpha: 0.1, seed: 29 }); ctx.restore();
      inkReveal(ctx, S, tween(u, 0.1, 0.8, ease.linear), c => caseCover(c, S, u - 0.1, { handle: meta.brand.handle, caseNo: '1995', tagline: meta.brand.tagline }));
    },
  },
];

export const sfx = [
  { t: 0.2, type: 'riser', gain: 0.3 },
  { t: 1.4, type: 'coins', gain: 0.45 },
  { t: 1.8, type: 'chime', gain: 0.4 },
  { t: 2.4, type: 'stamp', gain: 0.7 },
  { t: 4.0, type: 'pen', gain: 0.35 },
  { t: 5.35, type: 'splat', gain: 0.5 },
  { t: 6.1, type: 'typewriter', gain: 0.5 },
  { t: 7.0, type: 'stamp', gain: 0.6 },
  { t: 7.8, type: 'fold', gain: 0.45 },
  { t: 8.7, type: 'pen', gain: 0.4 },
  { t: 9.7, type: 'buzz', gain: 0.35 },
  { t: 10.3, type: 'pop', gain: 0.4 },
  { t: 12.4, type: 'pen', gain: 0.4 },
  { t: 13.45, type: 'whoosh', gain: 0.35 },
  { t: 14.5, type: 'coins', gain: 0.6 },
  { t: 15.2, type: 'coins', gain: 0.5 },
  { t: 16.25, type: 'fold', gain: 0.45 },
  { t: 16.5, type: 'stamp', gain: 0.7 },
  { t: 19.5, type: 'thud', gain: 0.6 },
  { t: 21.4, type: 'stamp', gain: 0.85 },
  { t: 22.5, type: 'blink', gain: 0.45 },
  { t: 22.65, type: 'stamp', gain: 0.45 },
  { t: 23.6, type: 'pen', gain: 0.45 },
  { t: 24.8, type: 'stamp', gain: 0.8 },
  { t: 25.8, type: 'whoosh', gain: 0.35 },
  { t: 26.8, type: 'pen', gain: 0.45 },
  { t: 28.2, type: 'pen', gain: 0.45 },
  { t: 29.8, type: 'splat', gain: 0.5 },
  { t: 30.2, type: 'chime', gain: 0.4 },
  { t: 31.0, type: 'pen', gain: 0.4 },
  { t: 32.1, type: 'splat', gain: 0.75 },
  { t: 32.5, type: 'fold', gain: 0.4 },
  { t: 33.3, type: 'stamp', gain: 0.75 },
  { t: 34.3, type: 'moth', gain: 0.3 },
  { t: 36.2, type: 'bell', gain: 0.25 },
];

export const music = {
  kit: 'mind', bpm: 84, root: 'B', scale: 'lydian', gain: 0.3,
  sections: [
    { from: 0, to: 7.8, mood: 'intro' },
    { from: 7.8, to: 16.25, mood: 'groove' },
    { from: 16.25, to: 22.5, mood: 'tense' },
    { from: 22.5, to: 32.05, mood: 'drive' },
    { from: 32.05, to: 36.8, mood: 'end' },
  ],
};
