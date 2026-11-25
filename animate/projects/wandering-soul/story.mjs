// "Operation Wandering Soul" — an INKBLOT case file (psychology, MindTrace).
// US Army psychological operation in the Vietnam War (c. 1970, "Ghost Tape No. 10"):
// eerie recordings of "dead soldiers" urging their comrades to go home, played from
// loudspeakers at night, aimed at the belief that people who die far from home without
// proper burial become wandering souls. Results were mixed; troops sometimes fired at
// the speakers. Drawn respectfully: no flags, no likenesses.
// u = seconds since the scene started; S.at('word') = when that word is said.
import { clamp, lerp, ease, tween, rng, TAU, shake, pop } from '../../lib/core.mjs';
import { plate, caseCover, inkReveal } from '../../styles/inkblot/scenes.mjs';

export const meta = {
  title: 'Operation Wandering Soul',
  slug: 'wandering-soul-inkblot',
  style: 'inkblot',
  width: 1080, height: 1920, fps: 30,
  duration: 38.2,
  voice: 'voice.mp3',
  seed: 271,
  captionChars: 24,
  caseLine: 'THE MIND FILES  ·  CASE No. 1970  ·  CONFIDENTIAL',
  brandKit: 'mindtrace', // MindTrace (brand/mindtrace/): logo, handle, tagline, outro text
  outro: { at: 36.0 },
};

const NIGHT = '#1d1b26';
function nightJungle(ctx, k, P, S, o = {}) {
  const { W, H } = S;
  ctx.fillStyle = NIGHT; ctx.fillRect(-300, -300, W + 600, H + 600);
  k.circle(ctx, o.moonX ?? 760, o.moonY ?? 200, 70, '#e9e2cc');
  const R = rng(o.seed || 4);
  for (let i = 0; i < 30; i++) k.circle(ctx, R() * W, R() * 420, 1 + R() * 2, '#e9e2cc');
  // layered jungle silhouettes
  for (const [base, col, n] of [[860, '#2b2933', 9], [980, '#121118', 7]]) {
    for (let i = 0; i < n; i++) {
      const x = -40 + i * (W + 80) / (n - 1) + (R() - 0.5) * 60, h = 200 + R() * 160;
      k.line(ctx, x, base, x + (R() - 0.5) * 30, base - h, col, 12);
      for (let j = 0; j < 6; j++) { const a = -Math.PI / 2 + (j - 2.5) * 0.45 + Math.sin(S.t * 0.8 + i) * 0.05; ctx.beginPath(); ctx.moveTo(x, base - h); ctx.quadraticCurveTo(x + Math.cos(a) * 80, base - h + Math.sin(a) * 80 - 30, x + Math.cos(a) * 150, base - h + Math.sin(a) * 60 + 40); k.stroke(ctx, col, 16); }
    }
    k.rect(ctx, -60, base, W + 120, H, col);
  }
}
// a wispy ghost; a = alpha
function ghost(ctx, k, P, x, y, s, t, a = 0.7) {
  if (a <= 0) return;
  ctx.save(); ctx.translate(x, y + Math.sin(t * 1.6) * 10); ctx.scale(s, s); ctx.globalAlpha = a;
  ctx.beginPath(); ctx.moveTo(-70, 60); ctx.quadraticCurveTo(-80, -120, 0, -130); ctx.quadraticCurveTo(80, -120, 70, 60);
  for (let i = 0; i <= 6; i++) ctx.lineTo(70 - i * 140 / 6, 60 + (i % 2 ? 30 : 0) + Math.sin(t * 4 + i) * 8);
  ctx.closePath(); k.fill(ctx, 'rgba(232,236,240,0.85)');
  k.ellipse(ctx, -24, -60, 12, 18, 0, NIGHT); k.ellipse(ctx, 24, -60, 12, 18, 0, NIGHT); k.ellipse(ctx, 0, -14, 10, 14, 0, NIGHT);
  ctx.restore();
}
function speaker(ctx, k, P, x, y, s, rot = 0, holes = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  k.poly(ctx, [[-30, -30], [80, -90], [80, 90], [-30, 30]], '#9aa0a8', P.ink, 4);
  k.rect(ctx, -70, -34, 44, 68, P.inkSoft, P.ink, 3, 6);
  const R = rng(3);
  for (let i = 0; i < holes; i++) { const hx = 10 + R() * 60, hy = (R() - 0.5) * 100 * (hx + 30) / 110; k.circle(ctx, hx, hy, 7, NIGHT, P.ink, 2); }
  ctx.restore();
}
function waves(ctx, k, P, x, y, t, a, dir = 1, col = '#e9e2cc') {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  for (let i = 0; i < 4; i++) { const r = 40 + ((t * 80 + i * 50) % 200); ctx.globalAlpha = a * (1 - r / 240); ctx.beginPath(); ctx.arc(x, y, r, dir > 0 ? -0.6 : Math.PI - 0.6, dir > 0 ? 0.6 : Math.PI + 0.6); k.stroke(ctx, col, 4); }
  ctx.restore();
}
function reel(ctx, k, P, x, y, s, t, label) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  k.rect(ctx, -220, -120, 440, 240, P.inkSoft, P.ink, 5, 14);
  for (const rx of [-110, 110]) { k.circle(ctx, rx, -20, 70, P.greyLight, P.ink, 4); ctx.save(); ctx.translate(rx, -20); ctx.rotate(t * 3); for (let i = 0; i < 3; i++) { ctx.rotate(TAU / 3); k.rect(ctx, -6, -60, 12, 40, P.inkSoft); } ctx.restore(); k.circle(ctx, rx, -20, 12, P.ink); }
  k.rect(ctx, -120, 60, 240, 40, P.paperLight, P.ink, 2, 3); k.text(ctx, label, 0, 80, 22, { font: 'type', max: 220 });
  ctx.restore();
}

export const scenes = [
  { // 0.14 "During the Vietnam War, the US Army tried to scare enemy soldiers with ghosts."
    start: 0, title: 'Scared With Ghosts',
    draw(ctx, u, S) {
      const { k, P, W } = S, vw = S.at('Vietnam'), sc = S.at('scare'), gh = S.at('ghosts');
      nightJungle(ctx, k, P, S);
      S.cam(lerp(1.05, 1.0, tween(u, 0, 6)), W / 2, 560);
      ghost(ctx, k, P, 470, lerp(760, 520, tween(u, gh - 0.6, gh + 0.6, ease.outCubic)), 1.4, S.t, tween(u, gh - 0.6, gh + 0.3) * 0.85);
      k.scrawl(ctx, 'Vietnam War', 260, 140, 52, tween(u, vw, vw + 0.5), { color: P.redLight, rot: -0.05 });
      k.scrawl(ctx, 'scare them', 260, 360, 46, tween(u, sc, sc + 0.4), { color: P.redLight });
      k.stamp(ctx, 'WITH GHOSTS', 470, 960, 58, tween(u, gh + 0.2, gh + 0.4), -0.06, P.redLight);
    },
  },
  { // 6.55 "It was called Operation Wandering Soul."
    start: 6.4, title: 'Operation Wandering Soul', trans: 'bleed',
    draw(ctx, u, S) {
      const { k, P, W } = S, op = S.at('Operation'), wa = S.at('Wandering');
      plate(ctx, S, { alpha: 0.08, seed: 6 });
      ctx.save(); ctx.translate(W / 2, 400); ctx.rotate(-0.02);
      k.poly(ctx, [[-380, -240], [-340, -290], [-120, -290], [-80, -240]], '#cfae6e', P.ink, 4);
      k.rect(ctx, -380, -240, 760, 480, '#dcbd7e', P.ink, 5, 6);
      k.text(ctx, 'PSYOP', -230, -264, 24, { font: 'type' });
      k.typeOn(ctx, 'OPERATION', 0, -110, 70, tween(u, op - 0.1, op + 0.5), { font: 'type', align: 'center' });
      k.typeOn(ctx, 'WANDERING SOUL', 0, -10, 70, tween(u, wa - 0.1, wa + 0.8), { font: 'type', align: 'center', color: P.red });
      k.text(ctx, 'c. 1970', 0, 90, 34, { font: 'type', color: P.inkSoft });
      ctx.restore();
      reel(ctx, k, P, W / 2, 860, 0.9, S.t, 'GHOST TAPE No. 10');
    },
  },
  { // 9.92 "In Vietnamese tradition, if you die far from home without proper burial, your soul can wander forever."
    start: 9.8, title: 'A Soul That Wanders', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, tr = S.at('tradition'), fh = S.at('far'), bu = S.at('burial'), wd = S.at('wander'), fe = S.at('forever');
      plate(ctx, S, { alpha: 0.08, seed: 10 });
      // home: a small house with an incense altar
      k.rect(ctx, 640, 360, 220, 160, P.card, P.ink, 4); k.poly(ctx, [[620, 360], [750, 270], [880, 360]], P.redDark, P.ink, 4);
      k.rect(ctx, 720, 430, 60, 90, P.inkSoft, P.ink, 3);
      for (let i = 0; i < 3; i++) { k.line(ctx, 690 + i * 12, 340 - 0, 690 + i * 12, 300, P.ochre, 3); ctx.save(); ctx.globalAlpha = 0.4; ctx.beginPath(); ctx.moveTo(690 + i * 12, 300); ctx.bezierCurveTo(680 + i * 12 + Math.sin(S.t * 2 + i) * 10, 260, 700 + i * 12, 230, 690 + i * 12 + Math.sin(S.t + i) * 14, 190); k.stroke(ctx, P.grey, 3); ctx.restore(); }
      k.text(ctx, 'HOME', 750, 560, 32, { font: 'display' });
      // a winding path that loops away and never arrives
      const path = [[700, 600], [560, 680], [300, 640], [180, 780], [320, 900], [620, 880], [760, 980], [500, 1030], [200, 1000]];
      ctx.save(); ctx.setLineDash([6, 14]); ctx.beginPath(); k.smooth(ctx, path, false); k.stroke(ctx, P.grey, 5); ctx.restore();
      const ph = (S.t * 0.06) % 1, idx = ph * (path.length - 1), i0 = Math.floor(idx), f = idx - i0;
      const [x0, y0] = path[i0], [x1, y1] = path[Math.min(i0 + 1, path.length - 1)];
      ctx.save(); ctx.globalAlpha = tween(u, fh - 0.3, fh + 0.3) * 0.7; k.figure(ctx, lerp(x0, x1, f), lerp(y0, y1, f), { s: 0.55, face: x1 > x0 ? 1 : -1, walk: S.t * 1.2, look: [x1 > x0 ? 1 : -1, 0], mood: 'worry', color: '#8d95a3', shadow: false }); ctx.restore();
      k.scrawl(ctx, 'Vietnamese tradition', 300, 150, 44, tween(u, tr, tr + 0.6), { rot: -0.04 });
      k.scrawl(ctx, 'far from home', 300, 260, 44, tween(u, fh, fh + 0.5));
      k.scrawl(ctx, 'no proper burial', 300, 360, 40, tween(u, bu - 0.2, bu + 0.4));
      k.stamp(ctx, 'FOREVER', 760, 760, 52, tween(u, fe, fe + 0.2), 0.08);
      if (u > wd) k.text(ctx, '"wandering soul"', 470, 1080, 30, { font: 'hand', color: P.inkSoft });
    },
  },
  { // 16.91 "So the Army recorded eerie voices, dead soldiers begging their friends to go home,"
    start: 16.8, title: 'The Ghost Tape', trans: 'blink',
    draw(ctx, u, S) {
      const { k, P, W } = S, rc = S.at('recorded'), ee = S.at('eerie'), bg = S.at('begging'), gh = S.at('go');
      plate(ctx, S, { alpha: 0.08, seed: 17 });
      reel(ctx, k, P, W / 2, 260, 1.0, u > rc ? S.t : 0, 'GHOST TAPE No. 10');
      if (u > rc) k.circle(ctx, W / 2 + 190, 350, 12, (S.t * 2 % 1) < 0.5 ? P.red : P.redDark);
      // a studio microphone and an eerie waveform
      k.line(ctx, 220, 1040, 220, 640, P.ink, 8); k.rect(ctx, 180, 560, 80, 110, P.inkSoft, P.ink, 4, 40);
      const a = tween(u, ee - 0.2, ee + 0.4);
      ctx.save(); ctx.globalAlpha = a; ctx.beginPath();
      for (let i = 0; i <= 60; i++) { const x = 300 + i * 9, amp = 60 * Math.sin(i * 0.7 + S.t * 6) * Math.sin(i / 60 * Math.PI) * (0.5 + 0.5 * Math.sin(S.t * 2 + i * 0.2)); ctx.lineTo(x, 620 + amp); }
      k.stroke(ctx, P.red, 4); ctx.restore();
      ghost(ctx, k, P, 780, 820, 0.9, S.t, tween(u, bg - 0.4, bg + 0.3) * 0.8);
      const b = pop(u, gh - 0.3, 0.35);
      if (b) { ctx.save(); ctx.translate(560, 900); ctx.scale(b, b); ctx.globalAlpha = 0.85; k.rect(ctx, -200, -70, 400, 140, P.paperLight, P.grey, 3, 40); k.text(ctx, '"...go home..."', 0, -8, 42, { font: 'hand', color: P.inkSoft }); k.text(ctx, '(in Vietnamese)', 0, 42, 22, { color: P.grey }); ctx.restore(); }
      k.scrawl(ctx, 'eerie voices', 760, 500, 46, tween(u, ee, ee + 0.4));
    },
  },
  { // 23.66 "then played them from speakers at night."
    start: 23.55, title: 'Speakers in the Night', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, sp = S.at('speakers'), ni = S.at('night');
      nightJungle(ctx, k, P, S, { moonX: 200, seed: 8 });
      // a helicopter with a loudspeaker
      ctx.save(); ctx.translate(lerp(W + 100, 620, tween(u, 0, 1.2, ease.outCubic)), 330 + Math.sin(S.t * 2) * 8);
      k.ellipse(ctx, 0, 0, 120, 50, 0, '#5b6270', '#9aa0a8', 4); k.ellipse(ctx, -60, -6, 40, 24, 0, '#82a7c8', '#9aa0a8', 3); k.rect(ctx, 100, -12, 160, 24, '#5b6270', '#9aa0a8', 3); k.line(ctx, -150, -60, 150, -60, '#bdb4a3', 5); k.line(ctx, 0, -50, 0, -60, '#bdb4a3', 6);
      speaker(ctx, k, P, -60, 70, 0.8, 2.6);
      ctx.restore();
      waves(ctx, k, P, 540, 420, S.t, tween(u, sp - 0.3, sp + 0.2), -1);
      ghost(ctx, k, P, 300, 640, 0.9, S.t, tween(u, ni - 0.2, ni + 0.6) * 0.6);
      k.scrawl(ctx, 'at night', 760, 620, 50, tween(u, ni, ni + 0.4), { color: P.redLight });
    },
  },
  { // 26.12 "Here's the trick. Use what people already fear."
    start: 26.0, title: 'Use Their Own Fear', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, al = S.at('already'), fe = S.at('fear');
      plate(ctx, S, { alpha: 0.08, seed: 26 });
      k.stamp(ctx, 'THE TRICK', 220, 110, 44, tween(u, 0.05, 0.25), -0.1);
      k.profile(ctx, 360, 1040, 1.5, { blink: 0.55, inside: c => {
        k.brain(c, 10, -205, 0.55, S.t, { fill: P.paperDark, ink: P.grey });
        ctx.save(); ctx.globalAlpha = 0.75 * tween(u, al - 0.3, fe + 0.4);
        k.blot(c, 10, -210, 240, 220, { seed: 21, t: S.t, live: 1, grow: tween(u, al - 0.3, fe + 0.6), color: '#8d121a' });
        ctx.restore();
      } });
      k.scrawl(ctx, 'already there', 780, 360, 48, tween(u, al, al + 0.5));
      k.arrow(ctx, 760, 560, 620, 560, tween(u, fe - 0.2, fe + 0.3));
      speaker(ctx, k, P, 840, 560, 0.7, Math.PI);
      k.stamp(ctx, 'FEAR', 760, 860, 72, tween(u, fe, fe + 0.2), -0.08);
    },
  },
  { // 29.94 "It didn't always work. Sometimes they just shot at the speakers."
    start: 29.85, title: "It Didn't Always Work", trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, dw = S.at("didn't"), sh = S.at('shot'), sp = S.at('speakers');
      nightJungle(ctx, k, P, S, { moonX: 820, seed: 11 });
      const holes = Math.floor(clamp((u - sh) * 6, 0, 9));
      speaker(ctx, k, P, 620, 400, 2.0, 2.9 + shake(u, sh, 0.06, 1.2), holes);
      // muzzle flashes from the treeline
      if (u > sh - 0.1 && u < sp + 1.2) for (let i = 0; i < 4; i++) { if (((S.t * 9 + i * 1.7) % 1) < 0.25) { const x = 140 + i * 120, y = 860 - (i % 2) * 40; k.splat(ctx, x, y, 22, i + 2, '#ddb14d'); } }
      k.stamp(ctx, "DIDN'T ALWAYS WORK", W / 2, 140, 46, tween(u, dw, dw + 0.2), -0.05, P.redLight);
      k.scrawl(ctx, 'they shot back', 300, 640, 48, tween(u, sh, sh + 0.4), { color: P.redLight });
    },
  },
  { // 33.91 "Follow for more dark psychology." → the case-file cover
    start: 33.75, title: 'More Dark Psychology', trans: 'cut',
    draw(ctx, u, S) {
      ctx.save(); plate(ctx, S, { alpha: 0.1, seed: 26 }); ctx.restore();
      inkReveal(ctx, S, tween(u, 0.1, 0.8, ease.linear), c => caseCover(c, S, u - 0.1, { handle: meta.brand.handle, caseNo: '1970', tagline: meta.brand.tagline }));
    },
  },
];

export const sfx = [
  { t: 0.1, type: 'crickets', gain: 0.35 },
  { t: 0.8, type: 'wind', gain: 0.4 },
  { t: 3.0, type: 'pen', gain: 0.35 },
  { t: 4.9, type: 'riser', gain: 0.35 },
  { t: 5.6, type: 'stamp', gain: 0.6 },
  { t: 6.4, type: 'splat', gain: 0.5 },
  { t: 7.2, type: 'typewriter', gain: 0.5 },
  { t: 8.1, type: 'typewriter', gain: 0.4 },
  { t: 9.8, type: 'fold', gain: 0.45 },
  { t: 10.2, type: 'pen', gain: 0.4 },
  { t: 11.9, type: 'wind', gain: 0.35 },
  { t: 14.0, type: 'pen', gain: 0.4 },
  { t: 15.8, type: 'stamp', gain: 0.75 },
  { t: 16.8, type: 'blink', gain: 0.45 },
  { t: 17.5, type: 'click', gain: 0.6 },
  { t: 18.2, type: 'wind', gain: 0.4 },
  { t: 21.0, type: 'moth', gain: 0.4 },
  { t: 22.5, type: 'pop', gain: 0.35 },
  { t: 23.55, type: 'whoosh', gain: 0.35 },
  { t: 23.7, type: 'crickets', gain: 0.35 },
  { t: 24.0, type: 'buzz', gain: 0.35 },
  { t: 25.3, type: 'wind', gain: 0.45 },
  { t: 26.0, type: 'fold', gain: 0.45 },
  { t: 26.15, type: 'stamp', gain: 0.45 },
  { t: 27.8, type: 'heartbeat', gain: 0.5 },
  { t: 29.0, type: 'stamp', gain: 0.8 },
  { t: 30.0, type: 'stamp', gain: 0.6 },
  { t: 32.35, type: 'crack', gain: 0.55 }, { t: 32.55, type: 'crack', gain: 0.5 }, { t: 32.8, type: 'crack', gain: 0.5 }, { t: 33.0, type: 'clank', gain: 0.4 },
  { t: 33.8, type: 'splat', gain: 0.75 },
  { t: 34.2, type: 'fold', gain: 0.4 },
  { t: 35.0, type: 'stamp', gain: 0.75 },
  { t: 36.0, type: 'moth', gain: 0.3 },
  { t: 37.6, type: 'bell', gain: 0.25 },
];

export const music = {
  kit: 'mind', bpm: 72, root: 'E', scale: 'minor', gain: 0.28,
  sections: [
    { from: 0, to: 9.8, mood: 'tense' },
    { from: 9.8, to: 16.8, mood: 'sad' },
    { from: 16.8, to: 26.0, mood: 'tense' },
    { from: 26.0, to: 33.75, mood: 'drive' },
    { from: 33.75, to: 38.2, mood: 'end' },
  ],
};
