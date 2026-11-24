// "Operation Northwoods" — an INKBLOT case file (psychology, MindTrace).
// Joint Chiefs of Staff memo to the Secretary of Defense, 13 March 1962,
// "Justification for US Military Intervention in Cuba": proposed pretexts incl. a
// "Communist Cuban terror campaign in the Miami area", blowing up a US ship and
// blaming Cuba, and faking the shoot-down of a civil airliner (an empty drone swapped
// in). Rejected by the Kennedy administration; never carried out; declassified 1997.
// No real people are drawn; no seals are used.
// u = seconds since the scene started; S.at('word') = when that word is said.
import { clamp, lerp, ease, tween, rng, TAU, shake, pop } from '../../lib/core.mjs';
import { plate, caseCover, inkReveal } from '../../styles/inkblot/scenes.mjs';

export const meta = {
  title: 'Operation Northwoods',
  slug: 'northwoods-inkblot',
  style: 'inkblot',
  width: 1080, height: 1920, fps: 30,
  duration: 34.8,
  voice: 'voice.mp3',
  seed: 251,
  captionChars: 24,
  caseLine: 'THE MIND FILES  ·  CASE No. 1962  ·  CONFIDENTIAL',
  brandKit: 'mindtrace', // MindTrace (brand/mindtrace/): logo, handle, tagline, outro text
  outro: { at: 32.5 },
};

const OLIVE = '#3f4a3a';
function officer(ctx, k, P, x, y, s, o = {}) {
  k.figure(ctx, x, y, { hat: 'cap', tie: '#16141a', s, face: o.face || 1, look: o.look || [0, 0.2], mood: o.mood || 'calm', color: OLIVE, shadow: false, armR: o.armR, holdR: o.holdR });
  for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) k.circle(ctx, x + sx * 34 * s - sx * i * 9 * s, y - 250 * s, 3.5 * s, P.ochre);
}
// a typed memo page
function memo(ctx, k, P, x, y, w, h, lines, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  k.rect(ctx, -w / 2, -h / 2, w, h, P.paperLight, P.ink, 4, 4);
  k.text(ctx, 'TOP SECRET', 0, -h / 2 + 40, 34, { font: 'type', color: P.red });
  lines.forEach((l, i) => k.text(ctx, l, -w / 2 + 40, -h / 2 + 110 + i * 40, 24, { font: 'type', align: 'left', max: w - 80 }));
  for (let i = lines.length; i < 9; i++) k.rect(ctx, -w / 2 + 40, -h / 2 + 100 + i * 40, (w - 80) * (0.6 + 0.4 * ((i * 37) % 10) / 10), 10, P.greyLight, null, 0, 2);
  ctx.restore();
}
function ship(ctx, k, P, x, y, s, boom = 0, t = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  k.poly(ctx, [[-170, -30], [170, -30], [130, 30], [-140, 30]], P.inkSoft, P.ink, 4);
  k.rect(ctx, -60, -90, 120, 60, P.greyLight, P.ink, 3, 4); k.rect(ctx, -20, -130, 30, 40, P.inkSoft, P.ink, 3);
  for (let i = 0; i < 4; i++) k.circle(ctx, -110 + i * 70, -6, 8, P.paperLight, P.ink, 2);
  ctx.beginPath(); ctx.moveTo(-220, 34); for (let i = 0; i <= 22; i++) ctx.lineTo(-220 + i * 20, 34 + Math.sin(t * 3 + i) * 6); k.stroke(ctx, P.sky, 5);
  if (boom > 0) { k.splat(ctx, 30, -60, 110 * boom, 7, P.red); k.splat(ctx, 30, -60, 60 * boom, 9, '#ddb14d'); }
  ctx.restore();
}
function airliner(ctx, k, P, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(o.rot || 0);
  ctx.globalAlpha = o.alpha ?? 1;
  k.ellipse(ctx, 0, 0, 170, 30, 0, o.fill || P.paperLight, P.ink, 4);
  k.poly(ctx, [[-30, 0], [40, 0], [-20, 110], [-60, 110]], o.fill || P.paperLight, P.ink, 4);
  k.poly(ctx, [[-30, 0], [40, 0], [-20, -110], [-60, -110]], o.fill || P.paperLight, P.ink, 4);
  k.poly(ctx, [[-150, 0], [-120, 0], [-170, -60], [-190, -60]], o.fill || P.paperLight, P.ink, 3);
  if (!o.empty) for (let i = 0; i < 6; i++) k.circle(ctx, -80 + i * 30, -6, 7, P.sky, P.ink, 2);
  if (o.label) k.text(ctx, o.label, 0, 56, 30, { font: 'display', color: o.labelColor || P.ink });
  ctx.restore();
}
function skyline(ctx, k, P, x, y, s, t, alarm = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const R = rng(4);
  for (let i = 0; i < 8; i++) { const h = 80 + R() * 160; k.rect(ctx, -240 + i * 60, -h, 52, h, P.inkSoft, P.ink, 2); for (let j = 0; j < 4; j++) k.rect(ctx, -230 + i * 60, -h + 14 + j * 24, 10, 10, alarm > 0 && (Math.floor(t * 4) + i + j) % 3 === 0 ? P.red : P.ochre); }
  k.line(ctx, 160, 0, 160, -200, P.sage, 6); for (let i = 0; i < 5; i++) k.line(ctx, 160, -200, 160 + Math.cos(i * 1.2) * 50, -200 + Math.sin(i * 1.2) * 30 + 10, P.sage, 5);
  ctx.restore();
}

export const scenes = [
  { // 0.0 "In 1962, America's top generals approved a plan to fake attacks on Americans and blame Cuba."
    start: 0, title: 'A Plan, Approved',
    draw(ctx, u, S) {
      const { k, P, W } = S, yr = S.at('1962'), ap = S.at('approved'), fk = S.at('fake'), bl = S.at('blame'), cu = S.at('Cuba');
      plate(ctx, S, { alpha: 0.12, seed: 3 });
      k.stamp(ctx, '1962', 790, 110, 64, tween(u, yr, yr + 0.25), 0.1);
      memo(ctx, k, P, W / 2, 400, 560, 460, ['MEMORANDUM FOR THE', 'SECRETARY OF DEFENSE'], -0.03);
      k.stamp(ctx, 'APPROVED', W / 2 + 120, 560, 54, tween(u, ap, ap + 0.2), -0.12);
      for (let i = 0; i < 5; i++) officer(ctx, k, P, 130 + i * 170, 1040, 0.62, { mood: 'calm', look: [0, -0.3] });
      k.scrawl(ctx, 'fake attacks', 250, 700, 48, tween(u, fk, fk + 0.4), { rot: -0.05 });
      const a = tween(u, bl - 0.1, cu + 0.2);
      k.arrow(ctx, 470, 690, 740, 690, a);
      if (a > 0.8) k.text(ctx, 'CUBA', 830, 692, 50, { font: 'display', color: P.red });
    },
  },
  { // 8.54 "It was called Operation Northwoods."
    start: 8.4, title: 'Operation Northwoods', trans: 'bleed',
    draw(ctx, u, S) {
      const { k, P, W } = S, op = S.at('Operation');
      plate(ctx, S, { alpha: 0.08, seed: 8 });
      ctx.save(); ctx.translate(W / 2, 560); ctx.rotate(-0.02);
      k.poly(ctx, [[-380, -380], [-340, -430], [-120, -430], [-80, -380]], '#cfae6e', P.ink, 4);
      k.rect(ctx, -380, -380, 760, 760, '#dcbd7e', P.ink, 5, 6);
      k.text(ctx, 'JOINT CHIEFS', -230, -404, 26, { font: 'type' });
      k.typeOn(ctx, 'OPERATION', 0, -230, 76, tween(u, op - 0.1, op + 0.5), { font: 'type', align: 'center' });
      k.typeOn(ctx, 'NORTHWOODS', 0, -140, 76, tween(u, op + 0.5, op + 1.3), { font: 'type', align: 'center' });
      k.text(ctx, '13 MARCH 1962', 0, -40, 36, { font: 'type', color: P.inkSoft });
      k.text(ctx, '"Justification for US Military', 0, 60, 30, { font: 'type', color: P.inkSoft });
      k.text(ctx, 'Intervention in Cuba"', 0, 102, 30, { font: 'type', color: P.inkSoft });
      for (let i = 0; i < 4; i++) k.rect(ctx, -300, 170 + i * 50, 600 - (i * 77) % 200, 26, P.ink, null, 0, 2);
      ctx.restore();
      k.stamp(ctx, 'TOP SECRET', 760, 980, 50, tween(u, op + 1.2, op + 1.4), -0.08);
    },
  },
  { // 11.32 "The ideas? A terror campaign in Miami, blow up a U.S. ship, fake the shoot-down of a passenger plane."
    start: 11.15, title: 'The Ideas', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, mi = S.at('Miami'), bu = S.at('blow'), fk = S.at('fake'), pl = S.at('plane');
      plate(ctx, S, { alpha: 0.08, seed: 11 });
      const card = (at, y, draw, label) => { const p = pop(u, at - 0.3, 0.35); if (!p) return; ctx.save(); ctx.translate(W / 2, y); ctx.scale(p, p); k.rect(ctx, -420, -150, 840, 300, P.paperLight, P.ink, 5, 14); draw(); k.text(ctx, label, 230, 0, 40, { font: 'display', color: P.red, max: 340 }); ctx.restore(); };
      card(mi, 185, () => skyline(ctx, k, P, -190, 120, 0.85, S.t, 1), 'TERROR IN MIAMI');
      card(bu, 515, () => ship(ctx, k, P, -190, 60, 0.85, tween(u, bu + 0.1, bu + 0.4), S.t), 'BLOW UP A U.S. SHIP');
      card(fk, 845, () => {
        const sw = tween(u, pl - 0.2, pl + 0.6);
        airliner(ctx, k, P, lerp(-200, -290, sw), lerp(20, -60, sw), 0.6, { label: '' });
        airliner(ctx, k, P, lerp(-200, -60, sw), lerp(20, 60, sw), 0.6, { empty: true, fill: P.greyLight, alpha: sw, label: sw > 0.6 ? 'DRONE' : '' });
      }, 'FAKE A SHOT-DOWN PLANE');
      k.scrawl(ctx, 'never carried out', W / 2, 1035, 40, tween(u, pl + 0.4, pl + 0.9));
    },
  },
  { // 18.8 "Here's the trick. Fear makes people want war. Give them an enemy and they'll follow."
    start: 18.75, title: 'Give Them an Enemy', trans: 'blink',
    draw(ctx, u, S) {
      const { k, P, W } = S, fe = S.at('Fear'), wr = S.at('war'), en = S.at('enemy'), fo = S.at('follow');
      plate(ctx, S, { alpha: 0.06, seed: 19 });
      k.stamp(ctx, 'THE TRICK', 220, 110, 44, tween(u, 0.05, 0.25), -0.1);
      // a looming ink-blot "enemy"
      k.blot(ctx, W / 2, 380, 640, 400, { seed: 13, t: S.t, live: 1, grow: tween(u, fe - 0.2, en + 0.4), color: P.ink });
      const ey = tween(u, en - 0.2, en + 0.2);
      if (ey > 0) for (const ex of [-90, 90]) { ctx.save(); ctx.globalAlpha = ey; k.ellipse(ctx, W / 2 + ex, 380, 34, 20, 0, P.red); ctx.restore(); }
      // the crowd turns to face it, then marches after the flag
      const m = tween(u, fo - 0.3, fo + 1.0, ease.inOut);
      for (let i = 0; i < 7; i++) {
        const x = 100 + i * 125 + lerp(0, 60, m), sh = shake(u, fe + i * 0.05, 4, 0.5);
        k.figure(ctx, x + sh, 1040, { s: 0.7, face: 1, walk: m > 0 && m < 1 ? S.t * 1.6 + i * 0.3 : 0, look: [0.2, -1], mood: u > fe ? 'shock' : 'calm', shadow: false });
      }
      k.scrawl(ctx, 'fear', 160, 690, 58, tween(u, fe, fe + 0.3), { rot: -0.08 });
      k.scrawl(ctx, '→ war', 760, 690, 58, tween(u, wr, wr + 0.3), { rot: 0.05 });
      k.scrawl(ctx, 'an enemy', W / 2, 640, 50, tween(u, en, en + 0.4), { color: P.redLight });
    },
  },
  { // 24.81 "Kennedy's administration rejected it."
    start: 24.75, title: 'Rejected', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, ke = S.at("Kennedy's"), rj = S.at('rejected');
      plate(ctx, S, { alpha: 0.08, seed: 24 });
      memo(ctx, k, P, W / 2, 520, 620, 640, ['OPERATION NORTHWOODS', 'PROPOSED PRETEXTS', '1. Miami ...', '2. Ship ...', '3. Airliner ...'], 0.02);
      const r = tween(u, rj, rj + 0.25);
      k.stamp(ctx, 'REJECTED', W / 2, 560, 96, r, -0.18);
      k.scrawl(ctx, "Kennedy's administration", W / 2, 960, 44, tween(u, ke, ke + 0.6));
    },
  },
  { // 27.11 "The plan stayed secret until 1997."
    start: 27.0, title: 'Secret Until 1997', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, sc = S.at('secret'), yr = S.at('1997.');
      plate(ctx, S, { alpha: 0.08, seed: 27 });
      const y = Math.floor(lerp(1962, 1997, tween(u, 0.2, yr + 0.1, ease.linear)));
      k.text(ctx, String(y), W / 2, 200, 130, { font: 'display', color: P.red });
      // a locked box of files, then the lid opens
      const open = tween(u, yr + 0.1, yr + 0.6, ease.outBack);
      k.rect(ctx, 250, 620, 440, 340, '#7c7f86', P.ink, 6, 8);
      ctx.save(); ctx.translate(250, 620); ctx.rotate(-open * 0.9); k.rect(ctx, 0, -50, 440, 60, '#9aa0a8', P.ink, 5, 6); ctx.restore();
      if (open < 0.3) k.padlock(ctx, 470, 720, 0.7, 0, P.redDark);
      if (open > 0.3) { memo(ctx, k, P, 470, lerp(700, 470, open), 300, 360, ['NORTHWOODS'], 0.05); }
      k.stamp(ctx, 'DECLASSIFIED', W / 2, 1010, 56, tween(u, yr + 0.3, yr + 0.5), -0.06);
      k.scrawl(ctx, 'secret', 800, 380, 50, tween(u, sc, sc + 0.4));
    },
  },
  { // 30.34 "Follow for more dark psychology." → the case-file cover
    start: 30.2, title: 'More Dark Psychology', trans: 'cut',
    draw(ctx, u, S) {
      ctx.save(); plate(ctx, S, { alpha: 0.1, seed: 27 }); ctx.restore();
      inkReveal(ctx, S, tween(u, 0.1, 0.8, ease.linear), c => caseCover(c, S, u - 0.1, { handle: meta.brand.handle, caseNo: '1962', tagline: meta.brand.tagline }));
    },
  },
];

export const sfx = [
  { t: 0.2, type: 'stamp', gain: 0.7 },
  { t: 0.8, type: 'paper', gain: 0.4 },
  { t: 3.6, type: 'stamp', gain: 0.8 },
  { t: 4.8, type: 'pen', gain: 0.45 },
  { t: 6.9, type: 'slide', gain: 0.4 },
  { t: 8.4, type: 'splat', gain: 0.5 },
  { t: 9.2, type: 'typewriter', gain: 0.5 },
  { t: 10.8, type: 'stamp', gain: 0.7 },
  { t: 11.15, type: 'fold', gain: 0.45 },
  { t: 12.2, type: 'alarm', gain: 0.3 },
  { t: 14.4, type: 'thunder', gain: 0.35 },
  { t: 14.7, type: 'thud', gain: 0.5 },
  { t: 16.0, type: 'whoosh', gain: 0.4 },
  { t: 17.6, type: 'slide', gain: 0.35 },
  { t: 18.3, type: 'pen', gain: 0.35 },
  { t: 18.75, type: 'blink', gain: 0.45 },
  { t: 18.9, type: 'stamp', gain: 0.45 },
  { t: 20.1, type: 'heartbeat', gain: 0.5 },
  { t: 21.2, type: 'riser', gain: 0.35 },
  { t: 22.9, type: 'gong', gain: 0.35 },
  { t: 23.6, type: 'thud', gain: 0.3 }, { t: 24.0, type: 'thud', gain: 0.3 },
  { t: 24.75, type: 'whoosh', gain: 0.35 },
  { t: 25.85, type: 'stamp', gain: 0.9 },
  { t: 27.0, type: 'fold', gain: 0.45 },
  { t: 27.3, type: 'tick', gain: 0.35 },
  { t: 29.0, type: 'clank', gain: 0.5 },
  { t: 29.2, type: 'stamp', gain: 0.75 },
  { t: 30.25, type: 'splat', gain: 0.75 },
  { t: 30.65, type: 'fold', gain: 0.4 },
  { t: 31.4, type: 'stamp', gain: 0.75 },
  { t: 32.3, type: 'moth', gain: 0.3 },
  { t: 34.2, type: 'bell', gain: 0.25 },
];

export const music = {
  kit: 'mind', bpm: 88, root: 'E', scale: 'harmonic', gain: 0.3,
  sections: [
    { from: 0, to: 11.15, mood: 'tense' },
    { from: 11.15, to: 18.75, mood: 'drive' },
    { from: 18.75, to: 24.75, mood: 'tense' },
    { from: 24.75, to: 30.2, mood: 'triumph' },
    { from: 30.2, to: 34.8, mood: 'end' },
  ],
};
