// "Operation Mincemeat" — an INKBLOT case file (psychology, MindTrace).
// 1943: British intelligence dressed the body of Glyndwr Michael as "Major William
// Martin, Royal Marines", with a briefcase of fake letters pointing to Greece (and
// Sardinia), not Sicily, plus "pocket litter" (love letters from "Pam", her photo,
// theatre ticket stubs). Released by submarine off Huelva, Spain; the Germans copied
// the letters and Hitler reinforced Greece. No likenesses, swastikas, flags or insignia.
// u = seconds since the scene started; S.at('word') = when that word is said.
import { clamp, lerp, ease, tween, rng, TAU, shake, pop } from '../../lib/core.mjs';
import { plate, caseCover, inkReveal } from '../../styles/inkblot/scenes.mjs';

export const meta = {
  title: 'Operation Mincemeat',
  slug: 'mincemeat-inkblot',
  style: 'inkblot',
  width: 1080, height: 1920, fps: 30,
  duration: 39.6,
  voice: 'voice.mp3',
  seed: 283,
  captionChars: 24,
  caseLine: 'THE MIND FILES  ·  CASE No. 1943  ·  CONFIDENTIAL',
  brandKit: 'mindtrace', // MindTrace (brand/mindtrace/): logo, handle, tagline, outro text
  outro: { at: 37.4 },
};

const MARTIN = { hat: 'cap', tie: '#16141a', color: '#3b4250' };

function briefcase(ctx, k, P, x, y, s, chain = true) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  k.rect(ctx, -120, -70, 240, 150, '#6b4a2b', P.ink, 4, 10); k.rect(ctx, -30, -96, 60, 30, null, P.ink, 5, 8);
  k.rect(ctx, -126, -10, 252, 10, '#5a3e24'); k.circle(ctx, 0, -6, 10, P.ochre, P.ink, 2);
  if (chain) for (let i = 0; i < 7; i++) k.ellipse(ctx, 120 + i * 18, -40 - i * 10, 10, 6, -0.5, null, P.grey, 4);
  ctx.restore();
}
// a simple Mediterranean map: Sicily and Greece as labelled blobs
function medMap(ctx, k, P, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  k.rect(ctx, -400, -300, 800, 600, '#b9cfe0', P.ink, 5, 8);
  // Italy's boot and Sicily
  ctx.beginPath(); ctx.moveTo(-300, -300); ctx.lineTo(-200, -300); ctx.quadraticCurveTo(-120, -160, -60, -60); ctx.quadraticCurveTo(-30, 0, -70, 20); ctx.quadraticCurveTo(-120, -60, -200, -140); ctx.quadraticCurveTo(-260, -220, -300, -300); k.fill(ctx, P.paperDark); k.stroke(ctx, P.ink, 3);
  ctx.beginPath(); ctx.moveTo(-150, 60); ctx.lineTo(-60, 50); ctx.lineTo(-100, 120); ctx.closePath(); k.fill(ctx, o.sicily || P.paperDark); k.stroke(ctx, P.ink, 3);
  k.text(ctx, 'SICILY', -110, 160, 28, { font: 'display' });
  // Greece
  ctx.beginPath(); ctx.moveTo(140, -200); ctx.quadraticCurveTo(260, -180, 280, -60); ctx.quadraticCurveTo(250, 40, 200, 80); ctx.quadraticCurveTo(160, 20, 180, -20); ctx.quadraticCurveTo(110, -80, 140, -200); k.fill(ctx, o.greece || P.paperDark); k.stroke(ctx, P.ink, 3);
  k.text(ctx, 'GREECE', 220, 130, 28, { font: 'display' });
  // North Africa
  k.rect(ctx, -400, 220, 800, 80, P.paperDark, P.ink, 3);
  ctx.restore();
}
function ticket(ctx, k, P, x, y, s, rot) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  k.rect(ctx, -90, -40, 180, 80, '#e2968a', P.ink, 3, 4); k.line(ctx, 40, -40, 40, 40, P.ink, 2);
  k.text(ctx, 'THEATRE', -20, -10, 22, { font: 'display' }); k.text(ctx, 'STALLS · 1943', -20, 18, 14, { font: 'type' });
  ctx.restore();
}
function photo(ctx, k, P, x, y, s, rot) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  k.rect(ctx, -80, -100, 160, 200, P.paperLight, P.ink, 3, 2); k.rect(ctx, -66, -86, 132, 150, '#a9b0bb', null, 0, 2);
  k.circle(ctx, 0, -30, 30, P.grey); k.rect(ctx, -44, 0, 88, 64, P.grey, null, 0, 26);
  k.text(ctx, '"Pam"', 0, 84, 22, { font: 'hand' });
  ctx.restore();
}
function canister(ctx, k, P, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  k.rect(ctx, -110, -320, 220, 640, '#7c7f86', P.ink, 5, 40);
  for (const yy of [-280, 280]) k.rect(ctx, -120, yy - 14, 240, 28, '#5b6270', P.ink, 3, 8);
  k.rect(ctx, -90, -80, 180, 160, P.paperLight, P.ink, 3, 4);
  k.text(ctx, 'HANDLE', 0, -46, 22, { font: 'display' }); k.text(ctx, 'WITH CARE', 0, -18, 22, { font: 'display' });
  k.text(ctx, 'OPTICAL', 0, 22, 20, { font: 'type' }); k.text(ctx, 'INSTRUMENTS', 0, 48, 20, { font: 'type' });
  ctx.restore();
}

export const scenes = [
  { // 0.22 "In 1943, British spies fooled Hitler with a dead man."
    start: 0, title: 'Fooled With a Dead Man',
    draw(ctx, u, S) {
      const { k, P, W } = S, yr = S.at('1943'), sp = S.at('spies'), fo = S.at('fooled'), dm = S.at('dead');
      plate(ctx, S, { alpha: 0.12, seed: 3 });
      k.stamp(ctx, '1943', 790, 110, 64, tween(u, yr, yr + 0.25), 0.1);
      canister(ctx, k, P, 330, 640, 0.9);
      k.scrawl(ctx, 'British spies', 720, 330, 50, tween(u, sp - 0.2, sp + 0.4), { rot: -0.04 });
      k.scrawl(ctx, 'fooled Hitler', 720, 460, 54, tween(u, fo, fo + 0.6));
      k.stamp(ctx, 'A DEAD MAN', 720, 640, 52, tween(u, dm, dm + 0.2), -0.06);
      k.text(ctx, '(the canister really said this)', 330, 990, 24, { color: P.inkSoft });
    },
  },
  { // 6.25 "They dressed a body as a Royal Marines officer, Major William Martin."
    start: 6.1, title: 'Major William Martin', trans: 'bleed',
    draw(ctx, u, S) {
      const { k, P, W } = S, dr = S.at('dressed'), rm = S.at('Royal'), mj = S.at('Major');
      plate(ctx, S, { alpha: 0.08, seed: 6 });
      const d = tween(u, dr - 0.2, rm + 0.4);
      k.figure(ctx, 260, 1040, { ...MARTIN, s: 1.2, face: 1, look: [0, 0], mood: 'calm', blink: 0.05, color: d < 0.5 ? '#9aa0a8' : MARTIN.color, shadow: false });
      // the ID card
      const c = pop(u, mj - 0.2, 0.4);
      if (c) { ctx.save(); ctx.translate(680, 520); ctx.rotate(0.04); ctx.scale(c, c);
        k.rect(ctx, -230, -160, 460, 320, P.card, P.ink, 4, 8);
        k.text(ctx, 'NAVAL IDENTITY CARD', 0, -120, 24, { font: 'type' });
        k.rect(ctx, -200, -90, 130, 160, P.paperDark, P.ink, 3, 3); k.text(ctx, '?', -135, -10, 70, { font: 'display', color: P.grey });
        k.text(ctx, 'MAJOR', -50, -60, 26, { font: 'type', align: 'left' }); k.text(ctx, 'WILLIAM MARTIN', -50, -20, 26, { font: 'type', align: 'left', max: 260 }); k.text(ctx, 'ROYAL MARINES', -50, 20, 24, { font: 'type', align: 'left', color: P.inkSoft });
        k.text(ctx, '(a man who never existed)', 0, 120, 22, { font: 'hand', color: P.red });
        ctx.restore(); }
      k.scrawl(ctx, 'dressed up', 300, 300, 52, tween(u, dr, dr + 0.4), { rot: -0.05 });
    },
  },
  { // 11.2 "In his briefcase, fake secret letters saying the Allies would invade Greece, not Sicily."
    start: 11.05, title: 'The Briefcase', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, bc = S.at('briefcase'), fk = S.at('fake'), gr = S.at('Greece'), si = S.at('Sicily');
      plate(ctx, S, { alpha: 0.08, seed: 11 });
      briefcase(ctx, k, P, 260, 260, 0.9);
      const l = tween(u, fk - 0.2, fk + 0.5, ease.outBack);
      if (l > 0) { ctx.save(); ctx.translate(lerp(260, 700, l), lerp(260, 240, l)); ctx.rotate(0.05);
        k.rect(ctx, -170, -120, 340, 240, P.paperLight, P.ink, 3, 2);
        k.text(ctx, 'MOST SECRET', 0, -84, 28, { font: 'type', color: P.red });
        for (let i = 0; i < 5; i++) k.rect(ctx, -140, -40 + i * 32, 280 - (i * 47) % 100, 10, P.greyLight, null, 0, 2);
        ctx.restore(); }
      medMap(ctx, k, P, W / 2, 740, 1.0, { greece: u > gr ? '#e2968a' : P.paperDark });
      k.arrow(ctx, 470, 560, 690, 650, tween(u, gr - 0.3, gr + 0.2), P.red, 7);
      const ns = tween(u, si - 0.2, si + 0.3);
      if (ns > 0) { k.line(ctx, 280, 760, 380, 860, P.ink, 7 * ns); k.line(ctx, 380, 760, 280, 860, P.ink, 7 * ns); }
      k.scrawl(ctx, 'fake', 700, 100, 50, tween(u, fk, fk + 0.3));
    },
  },
  { // 17.54 "In his pockets, love letters, a photo of his fiancée, theatre tickets."
    start: 17.45, title: 'Pocket Litter', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, ll = S.at('love'), ph = S.at('photo'), th = S.at('theatre');
      plate(ctx, S, { alpha: 0.08, seed: 17 });
      k.stamp(ctx, 'POCKET LITTER', W / 2, 110, 54, tween(u, 0.1, 0.3), -0.05);
      const a = pop(u, ll - 0.2, 0.4), b = pop(u, ph - 0.2, 0.4), c = pop(u, th - 0.2, 0.4);
      if (a) { ctx.save(); ctx.translate(290, 420); ctx.scale(a, a); k.letter(ctx, 0, 0, 380, 300, ['My darling,', 'come back', 'soon…'], tween(u, ll, ll + 1.0), { rot: -0.06, color: P.redDark }); k.heart(ctx, 140, 110, 26, P.red); ctx.restore(); }
      if (b) photo(ctx, k, P, 710, 470, 1.3 * b, 0.08);
      if (c) { ticket(ctx, k, P, 330, 850, 1.3 * c, -0.12); ticket(ctx, k, P, 600, 900, 1.2 * c, 0.1); }
      k.scrawl(ctx, 'his fiancée', 710, 760, 44, tween(u, ph + 0.4, ph + 0.9));
    },
  },
  { // 23.07 "They let him wash up in Spain."
    start: 23.0, title: 'Washed Up in Spain', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, wa = S.at('wash'), sp = S.at('Spain');
      plate(ctx, S, { alpha: 0.08, seed: 23 });
      // sea and a beach
      k.rect(ctx, -60, 400, W + 120, 700, '#b9cfe0');
      ctx.beginPath(); ctx.moveTo(560, 1100); ctx.quadraticCurveTo(700, 700, W + 60, 600); ctx.lineTo(W + 60, 1100); ctx.closePath(); k.fill(ctx, '#e8d9a8'); k.stroke(ctx, P.ink, 3);
      for (let i = 0; i < 5; i++) { ctx.beginPath(); for (let j = 0; j <= 20; j++) ctx.lineTo(j * 32, 460 + i * 80 + Math.sin(S.t * 2 + j + i) * 6); k.stroke(ctx, '#82a7c8', 3); }
      // a submarine far out, then a life vest and the briefcase drifting ashore
      ctx.save(); ctx.globalAlpha = 0.7; k.ellipse(ctx, 160, 470, 120, 20, 0, P.inkSoft); k.rect(ctx, 140, 430, 40, 30, P.inkSoft); ctx.restore();
      const d = tween(u, 0.1, sp + 0.4, ease.inOut);
      const x = lerp(220, 640, d), y = lerp(520, 840, d) + Math.sin(S.t * 2) * 6;
      k.ellipse(ctx, x, y, 70, 30, 0.1, '#ddb14d', P.ink, 3);
      briefcase(ctx, k, P, x + 70, y + 10, 0.35, false);
      k.text(ctx, 'SPAIN', 860, 760, 40, { font: 'display', color: u > sp - 0.2 ? P.red : 'rgba(0,0,0,0)' });
      k.text(ctx, '(Huelva)', 860, 806, 24, { color: u > sp ? P.inkSoft : 'rgba(0,0,0,0)' });
      k.scrawl(ctx, 'washed up', 300, 300, 54, tween(u, wa, wa + 0.4), { rot: -0.05 });
    },
  },
  { // 24.93 "The Germans got copies."
    start: 24.85, title: 'Copied', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, co = S.at('copies');
      plate(ctx, S, { alpha: 0.08, seed: 25 });
      // the letter, and its copies peeling off toward a waiting folder
      for (let i = 0; i < 4; i++) { const p = tween(u, 0.2 + i * 0.25, 0.8 + i * 0.25, ease.inOut); ctx.save(); ctx.translate(lerp(280, 700, p), lerp(480, 600 - i * 20, p)); ctx.rotate(lerp(-0.05, 0.1 * (i - 1.5), p)); k.rect(ctx, -140, -100, 280, 200, i ? 'rgba(248,243,231,0.95)' : P.paperLight, P.ink, 3, 2); k.text(ctx, 'MOST SECRET', 0, -66, 24, { font: 'type', color: P.red }); for (let j = 0; j < 4; j++) k.rect(ctx, -110, -24 + j * 28, 220, 8, P.greyLight, null, 0, 2); ctx.restore(); }
      ctx.save(); ctx.translate(700, 860); k.poly(ctx, [[-200, -120], [-170, -150], [-60, -150], [-30, -120]], '#cfae6e', P.ink, 4); k.rect(ctx, -200, -120, 400, 260, '#dcbd7e', P.ink, 4, 6); k.text(ctx, 'GERMAN INTELLIGENCE', 0, 0, 26, { font: 'type', max: 360 }); ctx.restore();
      k.stamp(ctx, 'COPIED', 260, 860, 60, tween(u, co, co + 0.2), -0.08);
    },
  },
  { // 26.59 "Hitler sent troops to Greece."
    start: 26.5, title: 'Troops to Greece', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, se = S.at('sent'), gr = S.at('Greece.');
      plate(ctx, S, { alpha: 0.08, seed: 26 });
      medMap(ctx, k, P, W / 2, 560, 1.0, { greece: '#e2968a' });
      const m = tween(u, se - 0.2, gr + 0.6, ease.inOut);
      for (let i = 0; i < 5; i++) { const x = lerp(240 + i * 40, 690 + (i % 3) * 30, m), y = lerp(300, 520 + Math.floor(i / 3) * 40, m); k.rect(ctx, x - 22, y - 14, 44, 28, P.ink, P.paperLight, 2, 4); }
      k.stamp(ctx, 'FOOLED', W / 2, 1000, 72, tween(u, gr + 0.2, gr + 0.4), -0.06);
      k.scrawl(ctx, 'troops → Greece', W / 2, 160, 50, tween(u, se, se + 0.6));
    },
  },
  { // 28.96 "Here's the trick. The small details made the big lie believable."
    start: 28.85, title: 'Small Details, Big Lie', trans: 'blink',
    draw(ctx, u, S) {
      const { k, P, W } = S, sm = S.at('small'), bl = S.at('big'), be = S.at('believable');
      plate(ctx, S, { alpha: 0.08, seed: 29 });
      k.stamp(ctx, 'THE TRICK', 220, 110, 44, tween(u, 0.05, 0.25), -0.1);
      // the big lie held up by three small details
      const up = tween(u, bl - 0.2, be + 0.4, ease.outBack);
      const ly = lerp(820, 470, up);
      ctx.save(); ctx.translate(W / 2, ly); ctx.rotate(-0.02); k.rect(ctx, -360, -110, 720, 220, P.paperLight, P.ink, 5, 4); k.text(ctx, 'THE BIG LIE', 0, -56, 32, { font: 'type', color: P.inkSoft }); k.text(ctx, '"INVADE GREECE"', 0, 14, 60, { font: 'display', color: P.red }); ctx.restore();
      const s = tween(u, sm - 0.2, sm + 0.6);
      if (s > 0) { ctx.save(); ctx.globalAlpha = s;
        for (const [x, i] of [[230, 0], [470, 1], [710, 2]]) { k.line(ctx, x, ly + 110, x, 900, P.inkSoft, 6); }
        ticket(ctx, k, P, 230, 960, 0.9, -0.08); photo(ctx, k, P, 470, 950, 0.6, 0.05); k.letter(ctx, 710, 960, 200, 140, ['love,', 'Pam'], 1, { rot: 0.06, color: P.redDark });
        ctx.restore(); }
      k.scrawl(ctx, 'small details', 760, 250, 46, tween(u, sm, sm + 0.5));
      k.scrawl(ctx, 'believable', 280, 260, 46, tween(u, be, be + 0.5), { rot: -0.05 });
    },
  },
  { // 32.79 "It was called Operation Mincemeat."
    start: 32.7, title: 'Operation Mincemeat', trans: 'bleed',
    draw(ctx, u, S) {
      const { k, P, W } = S, op = S.at('Operation'), mi = S.at('Mincemeat');
      plate(ctx, S, { alpha: 0.08, seed: 33 });
      ctx.save(); ctx.translate(W / 2, 520); ctx.rotate(-0.02);
      k.poly(ctx, [[-380, -300], [-340, -350], [-120, -350], [-80, -300]], '#cfae6e', P.ink, 4);
      k.rect(ctx, -380, -300, 760, 600, '#dcbd7e', P.ink, 5, 6);
      k.text(ctx, 'MOST SECRET', -230, -324, 24, { font: 'type' });
      k.typeOn(ctx, 'OPERATION', 0, -150, 76, tween(u, op - 0.1, op + 0.5), { font: 'type', align: 'center' });
      k.typeOn(ctx, 'MINCEMEAT', 0, -50, 92, tween(u, mi - 0.1, mi + 0.6), { font: 'type', align: 'center', color: P.red });
      k.text(ctx, '1943', 0, 60, 40, { font: 'type', color: P.inkSoft });
      ctx.restore();
      briefcase(ctx, k, P, 760, 960, 0.6);
    },
  },
  { // 35.4 "Follow for more dark psychology." → the case-file cover
    start: 35.25, title: 'More Dark Psychology', trans: 'cut',
    draw(ctx, u, S) {
      ctx.save(); plate(ctx, S, { alpha: 0.1, seed: 33 }); ctx.restore();
      inkReveal(ctx, S, tween(u, 0.1, 0.8, ease.linear), c => caseCover(c, S, u - 0.1, { handle: meta.brand.handle, caseNo: '1943', tagline: meta.brand.tagline }));
    },
  },
];

export const sfx = [
  { t: 0.2, type: 'stamp', gain: 0.65 },
  { t: 0.6, type: 'clank', gain: 0.4 },
  { t: 2.0, type: 'pen', gain: 0.4 },
  { t: 3.0, type: 'pen', gain: 0.45 },
  { t: 5.0, type: 'stamp', gain: 0.8 },
  { t: 6.1, type: 'splat', gain: 0.5 },
  { t: 6.5, type: 'slide', gain: 0.35 },
  { t: 9.0, type: 'pop', gain: 0.5 },
  { t: 9.8, type: 'typewriter', gain: 0.35 },
  { t: 11.05, type: 'fold', gain: 0.45 },
  { t: 11.5, type: 'click', gain: 0.55 },
  { t: 12.4, type: 'paper', gain: 0.45 },
  { t: 15.4, type: 'whoosh', gain: 0.35 },
  { t: 16.5, type: 'snap', gain: 0.5 },
  { t: 17.45, type: 'whoosh', gain: 0.35 },
  { t: 17.6, type: 'stamp', gain: 0.6 },
  { t: 18.6, type: 'pop', gain: 0.45 },
  { t: 19.7, type: 'pop', gain: 0.45, pitch: 1.1 },
  { t: 21.4, type: 'pop', gain: 0.45, pitch: 1.2 },
  { t: 23.0, type: 'fold', gain: 0.45 },
  { t: 23.2, type: 'waves', gain: 0.45 },
  { t: 24.85, type: 'whoosh', gain: 0.35 },
  { t: 25.1, type: 'paper', gain: 0.4 }, { t: 25.4, type: 'paper', gain: 0.4 }, { t: 25.7, type: 'stamp', gain: 0.8 },
  { t: 26.5, type: 'fold', gain: 0.45 },
  { t: 26.9, type: 'thud', gain: 0.4 }, { t: 27.3, type: 'thud', gain: 0.4 }, { t: 27.7, type: 'thud', gain: 0.4 },
  { t: 28.1, type: 'stamp', gain: 0.85 },
  { t: 28.85, type: 'blink', gain: 0.45 },
  { t: 28.95, type: 'stamp', gain: 0.45 },
  { t: 30.0, type: 'pop', gain: 0.4 },
  { t: 31.3, type: 'riser', gain: 0.3 },
  { t: 32.0, type: 'chime', gain: 0.4 },
  { t: 32.7, type: 'splat', gain: 0.5 },
  { t: 33.3, type: 'typewriter', gain: 0.5 },
  { t: 34.3, type: 'typewriter', gain: 0.45 },
  { t: 35.3, type: 'splat', gain: 0.75 },
  { t: 35.7, type: 'fold', gain: 0.4 },
  { t: 36.5, type: 'stamp', gain: 0.75 },
  { t: 37.4, type: 'moth', gain: 0.3 },
  { t: 39.0, type: 'bell', gain: 0.25 },
];

export const music = {
  kit: 'mind', bpm: 92, root: 'G', scale: 'dorian', gain: 0.3,
  sections: [
    { from: 0, to: 11.05, mood: 'tense' },
    { from: 11.05, to: 23.0, mood: 'groove' },
    { from: 23.0, to: 28.85, mood: 'drive' },
    { from: 28.85, to: 35.25, mood: 'triumph' },
    { from: 35.25, to: 39.6, mood: 'end' },
  ],
};
