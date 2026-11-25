// "The CIA's Psychological Warfare Manual" — an INKBLOT case file (psychology, MindTrace).
// "Psychological Operations in Guerrilla Warfare" (Operaciones sicológicas en guerra de
// guerrillas), written by the CIA in 1983 for the Nicaraguan Contras, leaked in October
// 1984. It advised "neutralizing" carefully selected officials (judges, police, state
// security) and provoking demonstrators into clashes with authorities to create a
// "martyr". It became a national scandal (congressional inquiries; Reagan ordered a
// review). Violence is kept abstract; no flags, seals or likenesses.
// u = seconds since the scene started; S.at('word') = when that word is said.
import { clamp, lerp, ease, tween, rng, TAU, shake, pop } from '../../lib/core.mjs';
import { plate, caseCover, inkReveal } from '../../styles/inkblot/scenes.mjs';

export const meta = {
  title: "The CIA's Warfare Manual",
  slug: 'cia-manual-inkblot',
  style: 'inkblot',
  width: 1080, height: 1920, fps: 30,
  duration: 35.6,
  voice: 'voice.mp3',
  seed: 281,
  captionChars: 24,
  caseLine: 'THE MIND FILES  ·  CASE No. 1984  ·  CONFIDENTIAL',
  brandKit: 'mindtrace', // MindTrace (brand/mindtrace/): logo, handle, tagline, outro text
  outro: { at: 33.4 },
};

const REBEL = { hat: 'cap', color: '#3f4a3a' };

// the manual: a slim booklet with a typed cover
function manual(ctx, k, P, x, y, s, rot = 0, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  k.rect(ctx, -200, -270, 400, 540, '#e8dcbc', P.ink, 5, 4);
  k.rect(ctx, -200, -270, 22, 540, '#cbbd99', P.ink, 3, 4);
  k.text(ctx, 'OPERACIONES', 10, -170, 34, { font: 'type' });
  k.text(ctx, 'SICOLÓGICAS', 10, -126, 34, { font: 'type' });
  k.text(ctx, 'EN GUERRA DE', 10, -82, 30, { font: 'type' });
  k.text(ctx, 'GUERRILLAS', 10, -42, 34, { font: 'type' });
  k.line(ctx, -150, 10, 170, 10, P.ink, 2);
  if (o.en) k.text(ctx, '"Psychological Operations', 10, 60, 22, { font: 'hand', color: P.inkSoft }), k.text(ctx, 'in Guerrilla Warfare"', 10, 92, 22, { font: 'hand', color: P.inkSoft });
  ctx.restore();
}
function envelope(ctx, k, P, x, y, w, open = 0, rot = 0) {
  const h = w * 0.62;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  k.rect(ctx, -w / 2, -h / 2, w, h, P.paperLight, P.ink, 5, 6);
  k.poly(ctx, [[-w / 2, -h / 2], [0, -h / 2 + h * 0.55 * (1 - 2 * open)], [w / 2, -h / 2]], P.card, P.ink, 4);
  ctx.restore();
}
function candle(ctx, k, P, x, y, s, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const g = ctx.createRadialGradient(0, -150, 4, 0, -150, 160); g.addColorStop(0, 'rgba(255,220,140,0.6)'); g.addColorStop(1, 'rgba(255,220,140,0)'); ctx.fillStyle = g; ctx.fillRect(-170, -320, 340, 340);
  k.rect(ctx, -26, -120, 52, 120, P.paperLight, P.ink, 4, 6);
  k.line(ctx, 0, -120, 0, -136, P.ink, 3);
  ctx.beginPath(); ctx.moveTo(0, -200 + Math.sin(t * 9) * 4); ctx.quadraticCurveTo(22, -150, 0, -134); ctx.quadraticCurveTo(-22, -150, 0, -200 + Math.sin(t * 9) * 4); k.fill(ctx, '#ddb14d'); k.stroke(ctx, P.red, 2);
  ctx.restore();
}
function shield(ctx, k, P, x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); k.rect(ctx, -40, -140, 80, 170, 'rgba(180,200,220,0.75)', P.ink, 4, 10); k.line(ctx, -30, -70, 30, -70, P.ink, 2); ctx.restore(); }

export const scenes = [
  { // 0.2 "In 1984, a secret CIA manual leaked."
    start: 0, title: 'A Secret Manual',
    draw(ctx, u, S) {
      const { k, P, W } = S, yr = S.at('1984'), se = S.at('secret'), lk = S.at('leaked');
      plate(ctx, S, { alpha: 0.12, seed: 3 });
      k.stamp(ctx, '1984', 790, 110, 64, tween(u, yr, yr + 0.25), 0.1);
      const out = tween(u, lk - 0.5, lk + 0.4, ease.outBack);
      envelope(ctx, k, P, W / 2, 820, 600, tween(u, lk - 0.8, lk - 0.4), -0.03);
      manual(ctx, k, P, W / 2, lerp(800, 500, out), 0.8, lerp(0, -0.08, out));
      envelope(ctx, k, P, W / 2, 900, 600, 0, -0.03);
      k.scrawl(ctx, 'secret', 250, 220, 56, tween(u, se, se + 0.4), { rot: -0.06 });
      k.stamp(ctx, 'LEAKED', 740, 330, 60, tween(u, lk, lk + 0.2), 0.08);
      k.scrawl(ctx, 'CIA', 230, 340, 50, tween(u, se + 0.4, se + 0.8));
    },
  },
  { // 4.64 "It was a guide to psychological warfare."
    start: 4.5, title: 'Psychological Warfare', trans: 'bleed',
    draw(ctx, u, S) {
      const { k, P, W } = S, gd = S.at('guide'), ps = S.at('psychological');
      plate(ctx, S, { alpha: 0.08, seed: 5 });
      manual(ctx, k, P, 330, 560, 1.0, -0.04, { en: true });
      // the contents page
      ctx.save(); ctx.translate(760, 560); ctx.rotate(0.05);
      k.rect(ctx, -160, -230, 320, 460, P.paperLight, P.ink, 4, 4);
      k.text(ctx, 'CONTENTS', 0, -190, 28, { font: 'type' });
      const items = ['Armed propaganda', 'Propaganda teams', 'Mass meetings', 'Selective use', 'of violence'];
      items.forEach((l, i) => { if (u > gd + i * 0.25) k.text(ctx, (i < 4 ? (i + 1) + '. ' : '   ') + l, -140, -120 + i * 60, 24, { font: 'type', align: 'left', max: 280 }); });
      ctx.restore();
      k.scrawl(ctx, 'psychological warfare', W / 2, 1010, 48, tween(u, ps, ps + 0.7));
    },
  },
  { // 7.5 "It was written for the Contras, rebels fighting Nicaragua's government."
    start: 7.35, title: 'Written for the Contras', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, co = S.at('Contras'), rb = S.at('rebels'), ni = S.at("Nicaragua's");
      plate(ctx, S, { alpha: 0.08, seed: 7 });
      // hills and a column of rebels, the manual handed down the line
      ctx.beginPath(); ctx.moveTo(-40, 780); ctx.quadraticCurveTo(200, 600, 420, 760); ctx.quadraticCurveTo(640, 560, 980, 740); ctx.lineTo(980, 1100); ctx.lineTo(-40, 1100); ctx.closePath(); k.fill(ctx, P.sage); k.stroke(ctx, P.ink, 4);
      const m = tween(u, rb - 0.3, rb + 1.6, ease.inOut);
      for (let i = 0; i < 5; i++) k.figure(ctx, lerp(-60, 260, m) + i * 120, 1040, { ...REBEL, s: 0.8, face: 1, walk: m > 0 && m < 1 ? S.t * 1.6 + i : 0, look: [1, 0], mood: 'calm', shadow: false, armR: i === 4 ? [1.2, 0.4] : undefined, holdR: i === 4 ? c => manual(c, k, P, 20, -10, 0.12) : undefined });
      k.scrawl(ctx, 'the Contras', 300, 200, 60, tween(u, co, co + 0.5), { rot: -0.05 });
      k.text(ctx, 'NICARAGUA', 720, 420, 52, { font: 'display', color: u > ni - 0.2 ? P.red : 'rgba(0,0,0,0)' });
      k.scrawl(ctx, 'rebels vs. the government', 640, 500, 38, tween(u, ni, ni + 0.6));
    },
  },
  { // 12.25 "It talked about neutralizing officials, like judges and police."
    start: 12.15, title: '"Neutralize"', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, ne = S.at('neutralizing'), ju = S.at('judges'), po = S.at('police');
      plate(ctx, S, { alpha: 0.08, seed: 12 });
      // a page of the manual with one word circled
      ctx.save(); ctx.translate(W / 2, 440); ctx.rotate(-0.02);
      k.rect(ctx, -360, -300, 720, 600, P.paperLight, P.ink, 4, 4);
      for (let i = 0; i < 9; i++) k.rect(ctx, -320, -250 + i * 56, 640 - (i * 71) % 180, 12, P.greyLight, null, 0, 2);
      k.rect(ctx, -330, -40, 380, 60, P.paperLight, null, 0, 0);
      k.text(ctx, '"neutralize"', -140, -10, 50, { font: 'type' });
      ctx.restore();
      k.penCircle(ctx, W / 2 - 140, 430, 220, 60, tween(u, ne, ne + 0.6));
      // targets: a judge's gavel and a police cap
      const g = pop(u, ju - 0.2, 0.35), c = pop(u, po - 0.2, 0.35);
      if (g) { ctx.save(); ctx.translate(290, 900); ctx.scale(g, g); ctx.rotate(-0.4); k.rect(ctx, -70, -30, 140, 60, '#6b4a2b', P.ink, 4, 10); k.rect(ctx, -10, 30, 20, 120, '#6b4a2b', P.ink, 3, 4); ctx.restore(); k.text(ctx, 'JUDGES', 290, 1030, 34, { font: 'display' }); }
      if (c) { ctx.save(); ctx.translate(650, 900); ctx.scale(c, c); k.ellipse(ctx, 0, 10, 110, 22, 0, P.ink); ctx.beginPath(); ctx.moveTo(-80, 10); ctx.quadraticCurveTo(-90, -80, 0, -90); ctx.quadraticCurveTo(90, -80, 80, 10); ctx.closePath(); k.fill(ctx, '#3e4a5c'); k.stroke(ctx, P.ink, 4); k.circle(ctx, 0, -40, 16, P.ochre, P.ink, 2); ctx.restore(); k.text(ctx, 'POLICE', 650, 1030, 34, { font: 'display' }); }
      k.scrawl(ctx, 'officials', 780, 120, 48, tween(u, ne + 0.8, ne + 1.2));
    },
  },
  { // 17.33 "The darkest part? Push protesters into clashes with police, so someone dies and becomes a martyr."
    start: 17.2, title: 'The Darkest Part', trans: 'blink',
    draw(ctx, u, S) {
      const { k, P, W } = S, da = S.at('darkest'), pu = S.at('Push'), cl = S.at('clashes'), so = S.at('someone'), ma = S.at('martyr');
      plate(ctx, S, { alpha: 0.1, seed: 17 });
      k.stamp(ctx, 'THE DARKEST PART', W / 2, 110, 48, tween(u, da, da + 0.2), -0.05);
      const fade = tween(u, so - 0.2, so + 0.6);
      // protesters (left) pushed toward a line of shields (right)
      ctx.save(); ctx.globalAlpha = 1 - fade * 0.8;
      const push = tween(u, pu, cl + 0.6);
      for (let i = 0; i < 4; i++) { const x = 120 + i * 90 + push * 80; k.figure(ctx, x, 1000, { s: 0.7, face: 1, look: [1, 0], mood: push > 0.6 ? 'shock' : 'calm', shadow: false, armL: [2.6, 0.2], holdL: c => { k.line(c, 0, 0, 0, -90, P.ink, 4); k.rect(c, -40, -150, 80, 60, P.paperLight, P.ink, 3, 2); } }); }
      for (let i = 0; i < 3; i++) { k.figure(ctx, 700 + i * 90, 1000, { hat: 'cap', s: 0.7, face: -1, look: [-1, 0], mood: 'calm', color: '#3e4a5c', shadow: false }); shield(ctx, k, P, 660 + i * 90, 960, 0.7); }
      // a hidden hand behind the crowd
      const h = tween(u, pu - 0.3, pu + 0.4);
      if (h > 0) { ctx.save(); ctx.translate(lerp(-120, 40, h), 840); ctx.rotate(-Math.PI / 2); k.rect(ctx, -34, 0, 68, 120, P.paperLight, P.ink, 4, 8); k.ellipse(ctx, 0, 0, 46, 40, 0, P.paperLight, P.ink, 4); for (let f = 0; f < 4; f++) k.rect(ctx, -40 + f * 22, -110 + Math.abs(f - 1.5) * 10, 16, 80, P.paperLight, P.ink, 3, 8); k.rect(ctx, 40, -40, 16, 60, P.paperLight, P.ink, 3, 8); ctx.restore(); }
      ctx.restore();
      ctx.save(); ctx.globalAlpha = 1 - fade;
      k.scrawl(ctx, 'push', 260, 470, 56, tween(u, pu, pu + 0.3));
      k.scrawl(ctx, 'clashes', 740, 470, 56, tween(u, cl, cl + 0.4));
      ctx.restore();
      // what they wanted: a martyr
      if (fade > 0) { ctx.save(); ctx.globalAlpha = fade;
        ctx.translate(W / 2, 520); ctx.rotate(-0.03);
        k.rect(ctx, -200, -250, 400, 500, P.paperLight, P.ink, 5, 4);
        k.circle(ctx, 0, -90, 80, P.grey); k.rect(ctx, -100, -10, 200, 130, P.grey, null, 0, 40);
        k.text(ctx, 'MARTYR', 0, 190, 64, { font: 'display', color: P.red });
        ctx.restore();
        candle(ctx, k, P, W / 2, 1000, 0.9, S.t); }
      k.scrawl(ctx, 'someone dies', 780, 860, 42, tween(u, so, so + 0.4));
    },
  },
  { // 24.55 "Here's the trick. A death sparks more anger than any speech."
    start: 24.45, title: 'More Than Any Speech', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, de = S.at('death'), an = S.at('anger'), sp = S.at('speech');
      plate(ctx, S, { alpha: 0.08, seed: 24 });
      k.stamp(ctx, 'THE TRICK', 220, 110, 44, tween(u, 0.05, 0.25), -0.1);
      // left: a speech, small reaction; right: a candle, a big one
      k.rect(ctx, 130, 760, 180, 280, '#6b4a2b', P.ink, 4, 4); k.line(ctx, 220, 760, 220, 640, P.ink, 4); k.circle(ctx, 220, 630, 16, P.inkSoft);
      k.text(ctx, 'SPEECH', 220, 900, 30, { font: 'display', color: P.paperLight });
      const sv = tween(u, sp - 0.4, sp + 0.3);
      k.rect(ctx, 150, 580 - 60 * sv, 140, 60 * sv, P.sky, P.ink, 3);
      candle(ctx, k, P, 700, 1040, 1.0, S.t);
      k.text(ctx, 'A DEATH', 700, 800, 30, { font: 'display', color: P.red });
      const av = tween(u, de - 0.2, an + 0.5);
      k.rect(ctx, 610, 760 - 460 * av, 180, 460 * av, P.red, P.ink, 3);
      k.scrawl(ctx, 'anger', 700, 230, 60, tween(u, an, an + 0.4));
    },
  },
  { // 29.22 "It became a national scandal."
    start: 29.1, title: 'A National Scandal', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, na = S.at('national'), sc = S.at('scandal');
      plate(ctx, S, { alpha: 0.08, seed: 29 });
      const heads = [['CIA MANUAL', 'FOR REBELS'], ['"MURDER', 'MANUAL"'], ['CONGRESS', 'DEMANDS ANSWERS']];
      heads.forEach(([a, b], i) => { const p = pop(u, i * 0.35, 0.35); if (!p) return; ctx.save(); ctx.translate(250 + i * 220, 420 + i * 160); ctx.rotate((i - 1) * 0.1); ctx.scale(p, p);
        k.rect(ctx, -210, -260, 420, 520, P.card, P.ink, 4, 4); k.text(ctx, 'THE DAILY RECORD', 0, -222, 24, { font: 'serif' }); k.line(ctx, -190, -200, 190, -200, P.ink, 2);
        k.text(ctx, a, 0, -150, 40, { font: 'display', max: 380 }); k.text(ctx, b, 0, -100, 40, { font: 'display', max: 380 });
        for (let j = 0; j < 6; j++) k.rect(ctx, -180, -40 + j * 34, 360, 10, P.greyLight, null, 0, 2);
        ctx.restore(); });
      k.stamp(ctx, 'NATIONAL SCANDAL', W / 2, 1000, 52, tween(u, sc, sc + 0.2), -0.05);
    },
  },
  { // 31.36 "Follow for more dark psychology." → the case-file cover
    start: 31.2, title: 'More Dark Psychology', trans: 'cut',
    draw(ctx, u, S) {
      ctx.save(); plate(ctx, S, { alpha: 0.1, seed: 29 }); ctx.restore();
      inkReveal(ctx, S, tween(u, 0.1, 0.8, ease.linear), c => caseCover(c, S, u - 0.1, { handle: meta.brand.handle, caseNo: '1984', tagline: meta.brand.tagline }));
    },
  },
];

export const sfx = [
  { t: 0.2, type: 'stamp', gain: 0.65 },
  { t: 2.0, type: 'pen', gain: 0.4 },
  { t: 3.0, type: 'paper', gain: 0.5 },
  { t: 3.45, type: 'stamp', gain: 0.8 },
  { t: 4.5, type: 'splat', gain: 0.5 },
  { t: 5.0, type: 'typewriter', gain: 0.45 },
  { t: 6.2, type: 'pen', gain: 0.4 },
  { t: 7.35, type: 'fold', gain: 0.45 },
  { t: 8.5, type: 'pen', gain: 0.45 },
  { t: 9.4, type: 'wind', gain: 0.3 },
  { t: 10.4, type: 'pen', gain: 0.4 },
  { t: 12.15, type: 'whoosh', gain: 0.35 },
  { t: 13.3, type: 'pen', gain: 0.5 },
  { t: 15.2, type: 'pop', gain: 0.5 },
  { t: 15.9, type: 'pop', gain: 0.5, pitch: 1.1 },
  { t: 17.2, type: 'blink', gain: 0.45 },
  { t: 17.45, type: 'stamp', gain: 0.75 },
  { t: 18.9, type: 'thud', gain: 0.45 },
  { t: 20.1, type: 'thud', gain: 0.5 }, { t: 20.4, type: 'thud', gain: 0.45 },
  { t: 21.9, type: 'heartbeat', gain: 0.5 },
  { t: 22.6, type: 'bell', gain: 0.35 },
  { t: 24.45, type: 'fold', gain: 0.45 },
  { t: 24.6, type: 'stamp', gain: 0.45 },
  { t: 26.1, type: 'sizzle', gain: 0.35 },
  { t: 27.2, type: 'riser', gain: 0.35 },
  { t: 28.2, type: 'pluck', gain: 0.35 },
  { t: 29.1, type: 'whoosh', gain: 0.35 },
  { t: 29.2, type: 'paper', gain: 0.4 }, { t: 29.55, type: 'paper', gain: 0.4 }, { t: 29.9, type: 'paper', gain: 0.4 },
  { t: 30.2, type: 'stamp', gain: 0.85 },
  { t: 31.25, type: 'splat', gain: 0.75 },
  { t: 31.65, type: 'fold', gain: 0.4 },
  { t: 32.4, type: 'stamp', gain: 0.75 },
  { t: 33.4, type: 'moth', gain: 0.3 },
  { t: 35.0, type: 'bell', gain: 0.25 },
];

export const music = {
  kit: 'mind', bpm: 84, root: 'F', scale: 'harmonic', gain: 0.3,
  sections: [
    { from: 0, to: 7.35, mood: 'tense' },
    { from: 7.35, to: 17.2, mood: 'drive' },
    { from: 17.2, to: 24.45, mood: 'sad' },
    { from: 24.45, to: 31.2, mood: 'tense' },
    { from: 31.2, to: 35.6, mood: 'end' },
  ],
};
