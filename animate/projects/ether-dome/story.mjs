// "The Day Surgery Went Quiet" — the first public demonstration of ether, told
// as a Karagöz shadow play (`karagoz` device): leather puppets on rods behind a
// lit screen, which keeps the surgery gentle — only silhouettes, a sleeping
// patient, the surgeon's turn to the crowd. The operating theatre itself, the
// Ether Dome, is a tiered set piece that fills with spectators.
import { clamp, lerp, ease, tween, rng, TAU } from '../../lib/core.mjs';
import { bookCover } from '../../styles/ottoman/scenes.mjs';

export const meta = {
  title: 'The Day Surgery Went Quiet',
  slug: 'ether-dome-ottoman',
  style: 'ottoman',
  look: 'karagoz',  // shadow-theatre booth (after ledger, scroll, night)
  room: 'tent',
  device: 'karagoz',
  width: 1080, height: 1920, fps: 30,
  duration: 38.7,
  voice: 'voice.mp3',
  seed: 1846,
  captionChars: 30,
  brand: { handle: '@HOWITSTARTED-YT1', logo: '../../../brand/logo.png' },
  outro: { at: 37.0, text: 'Subscribe for more origin stories' },
};

const MORTON = { robe: '#2a2a3a', trim: '#efe6cf', hat: 'cap', hatColor: '#2a2a3a', beard: '#3a2a1a', skin: '#e8c49a' };
const WARREN = { robe: '#3a2a2a', trim: '#efe6cf', hat: 'bald', hair: '#dddddd', skin: '#e8c49a' };
const ABBOTT = { robe: '#8a7a5a', trim: '#efe6cf', hat: 'cap', hatColor: '#5a4a3a', skin: '#e8c49a' };
const pup = (ctx, k, x, y, s, o) => k.puppet(ctx, x, y, s * 1.3, o);

function screen(ctx, S, warm = 0) {
  const { W } = S;
  ctx.fillStyle = warm ? '#f6e2b8' : '#f3e8cc'; ctx.fillRect(-300, -300, W + 600, 1800);
  ctx.fillStyle = 'rgba(120,80,40,0.10)'; ctx.fillRect(-300, 1000, W + 600, 500);
}
// the operating theatre: steep curved tiers of seats under a skylit dome
function amphitheatre(ctx, S, x, base, w, fill = 0, t = 0) {
  const { k, P } = S;
  for (let i = 0; i < 5; i++) { const y = base - 140 - i * 90, hw = w / 2 - i * 20; ctx.beginPath(); ctx.ellipse(x, y, hw, 40, 0, Math.PI, TAU); k.stroke(ctx, '#7a5a3a', 14); }
  const R = rng(4); for (let i = 0; i < Math.floor(fill * 34); i++) { const tier = i % 5, a = Math.PI * (1.08 + R() * 0.84), hw = w / 2 - tier * 20; const px = x + Math.cos(a) * hw, py = base - 140 - tier * 90 + Math.sin(a) * 40; pup(ctx, k, px, py + 10, 0.32, { robe: ['#2a2a3a', '#3a2a2a', '#2a3a2a'][i % 3], trim: '#efe6cf', hat: i % 3 ? 'cap' : 'bald', hatColor: '#2a2a2a', skin: '#e8c49a', t: t + i, face: px < x ? 1 : -1, rod: false, arm: 0.2 }); }
  ctx.beginPath(); ctx.ellipse(x, base - 620, w * 0.36, 90, 0, Math.PI, TAU); k.fillStroke(ctx, '#d8c9a8', P.ink, 3);
  k.ellipse(ctx, x, base - 660, 70, 24, 0, 'rgba(255,248,220,0.9)', P.ink, 2); // skylight
}
function inhaler(ctx, S, x, y, s) { // a glass globe with a sponge, a mouthpiece tube
  const { k, P } = S;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  k.circle(ctx, 0, 0, 40, 'rgba(210,235,240,0.7)', P.ink, 2.5); k.ellipse(ctx, 0, 10, 22, 12, 0, '#d8c050', null);
  k.rect(ctx, 36, -8, 70, 16, '#c9a227', P.ink, 1.5); k.rect(ctx, -8, -56, 16, 20, '#c9a227', P.ink, 1.5);
  ctx.restore();
}

export const scenes = [
  { // 0.1 "Before 1846, surgery meant being awake for every second."
    start: 0, title: 'Awake for Every Second',
    draw(ctx, u, S) {
      const { k, P, W } = S, aw = S.at('awake'), se = S.at('second.');
      S.cam(lerp(1.2, 1.0, tween(u, 0, se + 0.4, ease.inOut)), W / 2, 760);
      screen(ctx, S);
      // a patient gripping the chair while a big clock ticks every second
      k.rect(ctx, 400, 860, 220, 40, '#7a5a3a', P.ink, 2.5); k.rect(ctx, 400, 700, 30, 300, '#7a5a3a', P.ink, 2);
      const grip = 0.5 + 0.1 * Math.sin(S.t * 12);
      pup(ctx, k, 500, 1000, 1.2, { ...ABBOTT, t: S.t, face: 1, arm: grip, talk: 0 });
      const tick = Math.floor(S.t); ctx.save(); ctx.translate(800, 420); k.circle(ctx, 0, 0, 120, '#efe6cf', P.ink, 4); for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 96, Math.sin(a) * 96); ctx.lineTo(Math.cos(a) * 110, Math.sin(a) * 110); k.stroke(ctx, P.ink, 3); } ctx.rotate(tick / 60 * TAU); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -96); k.stroke(ctx, P.vermDark, 4); ctx.restore();
      const n = tween(u, aw - 0.3, aw + 0.3, ease.outBack); if (n > 0) { ctx.save(); ctx.translate(260, 420); ctx.scale(n, n); ctx.fillStyle = P.vermDark; ctx.font = '900 70px Deco'; ctx.textAlign = 'center'; ctx.fillText('AWAKE', 0, 0); ctx.restore(); }
    },
  },
  { // 6.9 "October 16th, 1846."
    start: 6.5, title: '16 October 1846', trans: 'curtain',
    draw(ctx, u, S) {
      const { k, P, W } = S, ye = S.at('1846.');
      S.cam(lerp(1.1, 1.0, tween(u, 0, 2.6, ease.inOut)), W / 2, 620);
      screen(ctx, S, 1);
      k.calendarPage(ctx, W / 2, 560, 380, 'OCTOBER', '16', -0.04, tween(u, ye - 0.4, ye + 0.4));
      k.seal(ctx, 820, 900, 70, ' THE YEAR · 1846 ·', '1846', tween(u, ye - 0.1, ye + 0.3, ease.linear));
    },
  },
  { // 9.9 "Boston, Massachusetts General Hospital."
    start: 9.5, title: 'Massachusetts General', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, bo = S.at('Boston,'), ho = S.at('Hospital.');
      S.cam(lerp(1.0, 1.12, tween(u, 0, 3.6, ease.inOut)), W / 2, 680);
      screen(ctx, S);
      // a pierced set piece of the granite hospital: columns, pediment, a low saucer roof
      ctx.save(); ctx.translate(W / 2, 980);
      k.rect(ctx, -380, -360, 760, 360, '#a8a090', P.ink, 3);
      for (let i = 0; i < 8; i++) k.rect(ctx, -170 + i * 48, -330, 22, 300, '#c8c0b0', P.ink, 1.5);
      k.poly(ctx, [[-200, -360], [0, -450], [200, -360]], '#b8b0a0', P.ink, 2.5);
      ctx.beginPath(); ctx.ellipse(0, -450, 110, 40, 0, Math.PI, TAU); k.fillStroke(ctx, '#9a9a8a', P.ink, 2.5);
      for (let i = 0; i < 6; i++) k.circle(ctx, -300 + i * 120, -200, 6, 'rgba(255,248,220,0.85)', null);
      ctx.restore();
      k.label(ctx, 'MASSACHUSETTS GENERAL HOSPITAL', W / 2, 1060, 18, tween(u, ho - 0.4, ho + 0.2));
      k.label(ctx, 'BOSTON', W / 2, 380, 22, tween(u, bo, bo + 0.4));
    },
  },
  { // 13.9 "Dentist William Morton has a patient, Gilbert Abbott, breathe in ether."
    start: 13.3, title: 'Breathe In Ether', trans: 'curtain',
    draw(ctx, u, S) {
      const { k, P, W } = S, wi = S.at('William'), gi = S.at('Gilbert'), br = S.at('breathe'), et = S.at('ether.');
      S.cam(lerp(1.0, 1.2, tween(u, br - 0.4, et + 0.6, ease.inOut)), lerp(W / 2, 600, tween(u, br - 0.4, et + 0.6)), 760);
      screen(ctx, S, 1);
      k.rect(ctx, 540, 860, 260, 40, '#7a5a3a', P.ink, 2.5);
      const sleep = tween(u, et - 0.2, et + 1.0);
      pup(ctx, k, 680, 1000, 1.15, { ...ABBOTT, t: S.t, face: -1, tilt: sleep * 0.25, arm: 0.2 * (1 - sleep) });
      const hold = tween(u, br - 0.4, br + 0.2);
      pup(ctx, k, 300, 1000, 1.25, { ...MORTON, t: S.t, face: 1, arm: 0.3 + 0.45 * hold, hold: c => inhaler(c, S, 0, 0, 0.9) });
      if (hold > 0.5) for (let i = 0; i < 4; i++) { const q = (S.t * 0.8 + i * 0.25) % 1; ctx.save(); ctx.globalAlpha = 0.5 * (1 - q); k.circle(ctx, lerp(470, 640, q), 640 - Math.sin(q * Math.PI) * 30, 10 + q * 14, '#ffffff', null); ctx.restore(); }
      if (sleep > 0.6) { ctx.save(); ctx.globalAlpha = sleep; ctx.fillStyle = P.ink; ctx.font = '900 54px Deco'; ctx.textAlign = 'center'; ctx.fillText('z', 760 + Math.sin(S.t * 2) * 6, 560); ctx.font = '900 38px Deco'; ctx.fillText('z', 800, 510 - (S.t * 10 % 20)); ctx.restore(); }
      k.label(ctx, 'WILLIAM T. G. MORTON · DENTIST', 300, 540, 16, tween(u, wi, wi + 0.4));
      k.label(ctx, 'GILBERT ABBOTT', 700, 460, 18, tween(u, gi, gi + 0.4));
    },
  },
  { // 19.1 "Surgeon John Collins Warren operates on a tumor in his neck while Abbott sleeps."
    start: 18.7, title: 'He Sleeps Through It', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, jo = S.at('John'), op = S.at('operates'), sl = S.at('sleeps.');
      S.cam(lerp(1.15, 1.0, tween(u, 0, sl + 0.4, ease.inOut)), W / 2, 760);
      screen(ctx, S);
      // a draped table, the patient asleep, the old surgeon bent over him — only shadows
      k.rect(ctx, 300, 860, 480, 40, '#7a5a3a', P.ink, 2.5); k.rect(ctx, 320, 900, 24, 100, '#7a5a3a', P.ink, 2); k.rect(ctx, 736, 900, 24, 100, '#7a5a3a', P.ink, 2);
      ctx.save(); ctx.translate(560, 840); ctx.rotate(-Math.PI / 2 + 0.05); pup(ctx, k, 0, 0, 0.9, { ...ABBOTT, t: 0, face: 1, rod: false, arm: 0 }); ctx.restore();
      k.rect(ctx, 380, 780, 360, 70, '#efe6cf', P.ink, 2);
      pup(ctx, k, 840, 1000, 1.2, { ...WARREN, t: S.t, face: -1, tilt: 0.1, arm: 0.45 + Math.sin(S.t * 3) * 0.04 });
      ctx.save(); ctx.fillStyle = P.ink; ctx.font = '900 50px Deco'; ctx.textAlign = 'center'; ctx.globalAlpha = 0.8; ctx.fillText('z', 420 + Math.sin(S.t * 2) * 6, 700); ctx.restore();
      k.label(ctx, 'JOHN COLLINS WARREN · SURGEON', 840, 560, 16, tween(u, jo, jo + 0.4));
    },
  },
  { // 24.7 "Warren turns to the crowd. Gentlemen, this is no humbug."
    start: 24.2, title: 'No Humbug', trans: 'curtain',
    draw(ctx, u, S) {
      const { k, P, W } = S, tu = S.at('turns'), ge = S.at('Gentlemen,'), hu = S.at('humbug.');
      S.cam(lerp(1.0, 1.15, tween(u, ge - 0.3, hu + 0.6, ease.inOut)), W / 2, 760);
      screen(ctx, S, 1);
      amphitheatre(ctx, S, W / 2, 1040, 980, tween(u, 0, tu + 0.6), S.t);
      const turn = tween(u, tu - 0.2, tu + 0.3);
      pup(ctx, k, W / 2, 1040, 1.2, { ...WARREN, t: S.t, face: turn > 0.5 ? -1 : 1, arm: lerp(0.3, 0.9, tween(u, ge - 0.2, ge + 0.3)), talk: tween(u, ge, hu + 0.2) });
      const b = tween(u, ge - 0.2, ge + 0.3, ease.outBack); if (b > 0) { ctx.save(); ctx.translate(W / 2, 380); ctx.scale(b, b); k.ellipse(ctx, 0, 0, 360, 90, 0, '#f6eed8', P.ink, 3); ctx.fillStyle = P.ink; ctx.font = 'italic 700 40px GaramondItalic'; ctx.textAlign = 'center'; const t = '“Gentlemen, this is no humbug.”', q = tween(u, ge, hu + 0.3, ease.linear); ctx.fillText(t.slice(0, Math.ceil(t.length * q)), 0, 14); ctx.restore(); }
      k.label(ctx, 'AS IT WAS LATER REPORTED', W / 2, 490, 16, tween(u, hu, hu + 0.4));
    },
  },
  { // 28.9 "The room becomes known as the Ether Dome, the start of modern anesthesia."
    start: 28.5, title: 'The Ether Dome', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S, ro = S.at('room'), et = S.at('Ether'), mo = S.at('modern');
      S.cam(lerp(1.25, 0.95, tween(u, 0, mo + 0.6, ease.inOut)), W / 2, lerp(560, 700, tween(u, 0, mo + 0.6)));
      screen(ctx, S);
      amphitheatre(ctx, S, W / 2, 1040, 980, 1, S.t);
      // light pours down from the skylight onto the empty floor
      const lt = tween(u, et - 0.3, et + 0.6); if (lt > 0) { ctx.save(); ctx.globalAlpha = 0.45 * lt; ctx.beginPath(); ctx.moveTo(W / 2 - 60, 380); ctx.lineTo(W / 2 + 60, 380); ctx.lineTo(W / 2 + 260, 1040); ctx.lineTo(W / 2 - 260, 1040); ctx.closePath(); ctx.fillStyle = '#fff6d0'; ctx.fill(); ctx.restore(); }
      const n = tween(u, et - 0.2, et + 0.4, ease.outBack); if (n > 0) { ctx.save(); ctx.translate(W / 2, 330); ctx.scale(n, n); ctx.fillStyle = P.ink; ctx.font = '900 90px Deco'; ctx.textAlign = 'center'; ctx.fillText('ETHER DOME', 0, 0); ctx.restore(); }
      k.label(ctx, 'STILL STANDING AT MASS GENERAL TODAY', W / 2, 1090, 16, tween(u, mo, mo + 0.4));
    },
  },
  { // 34.7 "Every legend has a beginning."
    start: 34.4, title: 'Every Legend Has a Beginning', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S, beg = S.at('beginning.');
      ctx.save(); S.cam(lerp(1.0, 1.4, tween(u, 0, beg)), W / 2, 700);
      screen(ctx, S, 1); amphitheatre(ctx, S, W / 2, 1040, 980, 1, S.t);
      ctx.restore();
      const open = tween(u, beg - 0.1, beg + 0.55, ease.inOut);
      if (open > 0) {
        ctx.save(); ctx.beginPath(); ctx.arc(W / 2, 560, open * 900, 0, TAU); ctx.clip(); bookCover(ctx, S, u - beg); ctx.restore();
        if (open < 1) { ctx.beginPath(); ctx.arc(W / 2, 560, open * 900, 0, TAU); k.stroke(ctx, P.goldLight, 8); }
      }
    },
  },
];

// ---------- sound ----------
export const sfx = [
  ...scenes.slice(1).map(s => ({ t: s.start - 0.05, type: s.trans === 'cut' ? 'pop' : 'paper', gain: 0.28 })),
  ...Array.from({ length: 6 }, (_, i) => ({ t: +(0.4 + i * 1.0).toFixed(2), type: 'clank', gain: 0.18, pitch: 1.8 })),
  { t: 7.2, type: 'stamp', gain: 0.4 }, { t: 8.5, type: 'stamp', gain: 0.45 },
  { t: 10.4, type: 'wind', gain: 0.3 }, { t: 12.3, type: 'chime', gain: 0.3, pitch: 1.1 },
  { t: 17.2, type: 'spray', gain: 0.25 }, { t: 18.0, type: 'whoosh', gain: 0.25 },
  { t: 20.6, type: 'pluck', gain: 0.25, pitch: 0.7 }, { t: 22.8, type: 'pluck', gain: 0.25, pitch: 0.6 },
  { t: 24.6, type: 'rain', gain: 0.2 }, { t: 27.6, type: 'gong', gain: 0.5 },
  { t: 30.6, type: 'riser', gain: 0.35 }, { t: 31.4, type: 'chime', gain: 0.5, pitch: 1.3 }, { t: 33.2, type: 'gong', gain: 0.4, pitch: 0.8 },
];

export const music = {
  bpm: 88, root: 'C', maqam: 'nihavend', gain: 0.28,
  sections: [
    { from: 0, to: 6.5, mood: 'sad' },
    { from: 6.5, to: 18.7, mood: 'groove' },
    { from: 18.7, to: 24.2, mood: 'sad' },
    { from: 24.2, to: 37.0, mood: 'triumph' },
    { from: 37.0, to: 38.7, mood: 'end' },
  ],
};
