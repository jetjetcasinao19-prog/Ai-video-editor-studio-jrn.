// "Vaccine Comes From a Cow" — told in letters (`letters` device): Jenner's
// notebook and his 1798 pamphlet frame it, and the closing word-build turns
// the Latin VACCA into VACCINATION. A cow named Blossom is the recurring
// character. The procedure is shown gently: a lancet, a small scratch, a boy
// who later plays outside; calm, historical wording only.
import { clamp, lerp, ease, tween, rng, TAU } from '../../lib/core.mjs';
import { interior, bookCover } from '../../styles/ottoman/scenes.mjs';
import { act } from '../../styles/ottoman/acting.mjs';

export const meta = {
  title: 'Vaccine Comes From a Cow',
  slug: 'vaccine-ottoman',
  style: 'ottoman',
  look: 'album',    // album (after karagoz, ledger, scroll)
  ambient: 'dust',
  room: 'library',
  device: 'letters',
  width: 1080, height: 1920, fps: 30,
  duration: 39.6,
  voice: 'voice.mp3',
  seed: 1796,
  captionChars: 30,
  brand: { handle: '@HOWITSTARTED-YT1', logo: '../../../brand/logo.png' },
  outro: { at: 37.9, text: 'Subscribe for more origin stories' },
};

const JENNER = { robe: '#3a4a3a', inner: '#efe6cf', sash: '#3a4a3a', hat: 'shorthair', hair: '#e8e8e8', collar: true, skin: '#f1d1a8' };
const MILKMAID = { robe: '#8a5a7a', robeP: 'dots', robePc: '#a87a9a', inner: '#efe6cf', sash: '#efe6cf', hat: 'bun', hair: '#8a5a2a', skin: '#f1d1a8' };
const JAMES = { robe: '#5a6a8a', inner: '#efe6cf', sash: '#3a2a1a', hat: 'shorthair', hair: '#8a6a3a', skin: '#f1d1a8' };

function cow(ctx, S, x, y, s, f = 1, t = 0) {
  const { k, P } = S;
  ctx.save(); ctx.translate(x, y); ctx.scale(s * f, s);
  for (const lx of [-70, -46, 50, 74]) k.rect(ctx, lx - 8, -70, 16, 70, '#efe6cf', P.ink, 1.8);
  k.ellipse(ctx, 0, -100, 110, 52, 0, '#f6efdc', P.ink, 2.5);
  for (const [dx, dy, r] of [[-40, -110, 26], [30, -90, 20], [60, -120, 14]]) k.blob(ctx, dx, dy, r, dx + 9, 0.3, 10, '#8a5a3a', null);
  ctx.save(); ctx.translate(110, -120 + Math.sin(t * 1.5) * 6); k.ellipse(ctx, 20, 0, 40, 30, 0.3, '#f6efdc', P.ink, 2); k.ellipse(ctx, 50, 14, 20, 14, 0.2, '#e8b0a0', P.ink, 1.5); k.circle(ctx, 18, -8, 4, P.ink, null); ctx.beginPath(); ctx.moveTo(0, -26); ctx.lineTo(-12, -44); ctx.moveTo(26, -28); ctx.lineTo(30, -46); k.stroke(ctx, '#c9b89a', 5); ctx.restore();
  ctx.beginPath(); ctx.moveTo(-106, -110); ctx.quadraticCurveTo(-130, -80 + Math.sin(t * 3) * 10, -122, -40); k.stroke(ctx, P.ink, 3);
  ctx.restore();
}
function lancet(ctx, S, x, y, s, rot = 0) {
  const { k, P } = S;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  k.rect(ctx, -60, -8, 80, 16, '#e8dcc0', P.ink, 1.5); k.poly(ctx, [[20, -7], [80, 0], [20, 7]], '#c8ccd2', P.ink, 1.5);
  ctx.restore();
}
function pamphlet(ctx, S, x, y, w, k1 = 1, rot = -0.04) {
  const { k, P } = S, h = w * 1.35;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(k1, k1);
  k.rect(ctx, -w / 2, -h / 2, w, h, '#efe2c0', P.ink, 2.5);
  ctx.fillStyle = P.ink; ctx.textAlign = 'center'; ctx.font = `700 ${Math.round(w * 0.07)}px Fell`;
  ['AN INQUIRY', 'INTO THE', 'CAUSES AND EFFECTS', 'OF THE', 'VARIOLAE VACCINAE'].forEach((l, i) => ctx.fillText(l, 0, -h / 2 + w * 0.2 + i * w * 0.1));
  ctx.font = `600 ${Math.round(w * 0.06)}px Garamond`; ctx.fillText('BY EDWARD JENNER', 0, h / 2 - w * 0.3); ctx.fillText('1798', 0, h / 2 - w * 0.18);
  ctx.restore();
}

export const scenes = [
  { // 0.0 "The word vaccine comes from a cow."
    start: 0, title: 'From a Cow',
    draw(ctx, u, S) {
      const { k, P, W } = S, wo = S.at('word'), va = S.at('vaccine'), co = S.at('cow.');
      S.cam(lerp(1.2, 1.0, tween(u, 0, co + 0.5, ease.inOut)), W / 2, 660);
      k.goldSky(ctx, -300, -300, W + 600, 800, S.t);
      k.hills(ctx, W, 440, 3, ['#a8b878', '#8aa068', '#6a8a58'], S.t);
      k.ground(ctx, -300, 530, W + 600, 1200, '#8aa068', 3, 0.4);
      cow(ctx, S, 440, 980, 1.6, 1, S.t);
      // the word floats above her
      const v = tween(u, va - 0.3, va + 0.3, ease.outBack); if (v > 0) { ctx.save(); ctx.translate(W / 2, 330); ctx.scale(v, v); ctx.fillStyle = P.ink; ctx.font = '900 100px Deco'; ctx.textAlign = 'center'; ctx.fillText('VACCINE', 0, 0); ctx.restore(); }
      const ar = tween(u, co - 0.4, co + 0.3); if (ar > 0) { ctx.save(); ctx.globalAlpha = ar; ctx.beginPath(); ctx.moveTo(W / 2, 370); ctx.quadraticCurveTo(W / 2 + 60, 500, 560, 640); k.stroke(ctx, P.vermDark, 5); k.poly(ctx, [[548, 630], [574, 656], [552, 664]], P.vermDark, null); ctx.restore(); }
    },
  },
  { // 5.0 "1700s England."
    start: 4.6, title: 'England, 1700s', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W } = S, en = S.at('England.');
      S.cam(lerp(1.1, 1.0, tween(u, 0, 2.2, ease.inOut)), W / 2, 620);
      k.goldSky(ctx, -300, -300, W + 600, 800, S.t);
      k.hills(ctx, W, 420, 6, ['#a8b878', '#8aa068', '#6a8a58'], S.t);
      k.ground(ctx, -300, 510, W + 600, 1200, '#8aa068', 6, 0.3);
      // a country village: stone cottages, hedges, a church tower kept small and distant
      for (let i = 0; i < 5; i++) { const x = 120 + i * 190, y = 820 + (i % 2) * 40; k.rect(ctx, x, y - 120, 150, 120, '#d8c9a8', P.ink, 2); k.poly(ctx, [[x - 10, y - 120], [x + 75, y - 190], [x + 160, y - 120]], '#6a5a4a', P.ink, 2); k.rect(ctx, x + 60, y - 60, 30, 60, '#5a3a1a', P.ink, 1.5); }
      for (let i = 0; i < 8; i++) k.tuft(ctx, 60 + i * 130, 990, 1.4, P.greenDark);
      k.seal(ctx, 860, 180, 70, ' THE 1700s · ENGLAND ·', '1700s', tween(u, 0.1, 0.5, ease.linear));
      k.label(ctx, 'BERKELEY, GLOUCESTERSHIRE', W / 2, 1060, 18, tween(u, en, en + 0.4));
    },
  },
  { // 7.1 "Dr. Edward Jenner hears that milkmaids who catch cowpox, a mild disease from cows, don't seem to get deadly smallpox."
    start: 6.9, title: 'What the Milkmaids Knew', trans: 'page',
    draw(ctx, u, S) {
      const { k, P, W } = S, ed = S.at('Edward'), he = S.at('hears'), mi = S.at('milkmaids'), cp = S.at('cowpox,'), sm = S.at('smallpox.');
      S.cam(lerp(1.0, 1.15, tween(u, mi - 0.3, sm + 0.6, ease.inOut)), lerp(W / 2, 620, tween(u, mi - 0.3, sm + 0.6)), 680);
      interior(ctx, S, { arches: 2, carpetColor: '#3a4a3a' });
      k.figure(ctx, 260, 1000, { ...JENNER, s: 1.1, face: 1, mood: 'calm', ...act('think', u, tween(u, he, he + 0.4)) });
      // what he hears, in a picture frame: a milkmaid with a few spots on her hand, a shield against a darker pox
      const pic = tween(u, mi - 0.3, mi + 0.3, ease.outBack); if (pic > 0) { ctx.save(); ctx.translate(680, 560); ctx.scale(pic, pic); k.rect(ctx, -260, -250, 520, 500, '#f6efdc', P.goldDark, 6); ctx.save(); ctx.beginPath(); ctx.rect(-254, -244, 508, 488); ctx.clip(); k.ground(ctx, -260, 80, 520, 200, '#8aa068', 2, 0.2); cow(ctx, S, 60, 200, 0.7, 1, S.t); k.figure(ctx, -150, 220, { ...MILKMAID, s: 0.8, face: 1, mood: 'happy', armF: [1.2, 0.4], hold: c => { k.rect(c, -20, 0, 40, 46, '#a8a8a8', P.ink, 1.5); } }); ctx.restore();
        const sh = tween(u, sm - 0.6, sm + 0.2, ease.outBack); if (sh > 0) { ctx.save(); ctx.translate(150, -140); ctx.scale(sh, sh); ctx.beginPath(); ctx.moveTo(0, -60); ctx.lineTo(50, -40); ctx.lineTo(44, 20); ctx.quadraticCurveTo(20, 60, 0, 70); ctx.quadraticCurveTo(-20, 60, -44, 20); ctx.lineTo(-50, -40); ctx.closePath(); k.fillStroke(ctx, '#2f5f8a', P.ink, 3); ctx.restore(); }
        ctx.restore(); }
      k.label(ctx, 'EDWARD JENNER', 260, 560, 22, tween(u, ed, ed + 0.4));
      k.label(ctx, 'COWPOX: MILD · SMALLPOX: DEADLY', 680, 900, 15, tween(u, cp, cp + 0.4));
    },
  },
  { // 15.6 "May 1796."
    start: 15.2, title: 'May 1796', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, ye = S.at('1796.');
      S.cam(lerp(1.1, 1.0, tween(u, 0, 2.0, ease.inOut)), W / 2, 600);
      ctx.fillStyle = '#efe2c0'; ctx.fillRect(-300, -300, W + 600, 1800);
      k.calendarPage(ctx, W / 2, 560, 380, 'MAY', '14', -0.04, tween(u, ye, ye + 0.5));
      k.seal(ctx, 820, 900, 70, ' THE YEAR · 1796 ·', '1796', tween(u, ye - 0.1, ye + 0.3, ease.linear));
    },
  },
  { // 17.7 "He takes material from a milkmaid's cowpox sore and puts it into a small cut on an eight-year-old boy, James Phipps."
    start: 17.5, title: 'James Phipps', trans: 'page',
    draw(ctx, u, S) {
      const { k, P, W } = S, ta = S.at('takes'), mm = S.at("milkmaid's"), pu = S.at('puts'), cu = S.at('cut'), ja = S.at('James');
      S.cam(lerp(1.0, 1.12, tween(u, pu - 0.3, ja + 0.6, ease.inOut)), W / 2, 680);
      interior(ctx, S, { arches: 3, carpetColor: '#2f5f8a' });
      // the milkmaid on the left, the boy on the right, Jenner between them with the lancet
      k.figure(ctx, 170, 1000, { ...MILKMAID, s: 0.95, face: 1, mood: 'calm', armF: [1.3, 0.2] });
      const mv = tween(u, ta, pu + 0.4, ease.inOut);
      k.figure(ctx, lerp(380, 600, mv), 1000, { ...JENNER, s: 1.05, face: mv > 0.5 ? 1 : -1, mood: 'calm', armF: [1.3, 0.2], hold: c => lancet(c, S, 0, 0, 0.7, -0.5) });
      k.figure(ctx, 860, 1000, { ...JAMES, s: 0.78, face: -1, mood: 'calm', armF: [1.4, 0.0] });
      const sc = tween(u, cu - 0.2, cu + 0.3); if (sc > 0) { ctx.save(); ctx.translate(740, 380); ctx.scale(sc, sc); k.circle(ctx, 0, 0, 100, '#f6efdc', P.goldDark, 5); k.rect(ctx, -80, -24, 160, 48, '#f1d1a8', P.ink, 2); ctx.beginPath(); ctx.moveTo(-14, -2); ctx.lineTo(14, 4); k.stroke(ctx, '#c4371f', 3); ctx.restore(); }
      k.label(ctx, 'JAMES PHIPPS, 8', 860, 560, 18, tween(u, ja, ja + 0.4));
      k.label(ctx, 'THE MILKMAID: SARAH NELMES', 170, 560, 14, tween(u, mm, mm + 0.4));
    },
  },
  { // 25.8 "Weeks later, he exposes the boy to smallpox. James doesn't get sick."
    start: 25.4, title: 'He Doesn’t Get Sick', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S, we = S.at('Weeks'), ex = S.at('exposes'), si = S.at('sick.');
      S.cam(lerp(1.15, 1.0, tween(u, 0, si + 0.4, ease.inOut)), W / 2, 660);
      k.goldSky(ctx, -300, -300, W + 600, 800, S.t);
      k.ground(ctx, -300, 560, W + 600, 1200, '#8aa068', 9, 0.3);
      // calendar pages flip by; then the boy runs with a hoop, well
      const fl = tween(u, we - 0.2, ex + 0.6);
      if (fl < 1) for (let i = 0; i < 3; i++) { const q = clamp(fl * 3 - i); ctx.save(); ctx.globalAlpha = 1 - q; ctx.translate(800, 300 - q * 200); ctx.rotate(q * 0.6); k.calendarPage(ctx, 0, 0, 160, ['MAY', 'JUNE', 'JULY'][i], '1796', 0, 0); ctx.restore(); }
      const run = tween(u, si - 1.2, si + 1.0, ease.linear);
      k.figure(ctx, lerp(200, 780, run), 1000, { ...JAMES, s: 0.85, face: 1, walk: S.t * 9, mood: 'happy', armF: [1.0, 0.3] });
      k.circle(ctx, lerp(300, 880, run), 950, 60, null, '#7a5a3a', 6);
      k.label(ctx, 'ABOUT SIX WEEKS LATER', W / 2, 280, 18, tween(u, we, we + 0.4));
    },
  },
  { // 30.5 "The Latin for cow is vacca. So we call it vaccination."
    start: 30.1, title: 'Vacca → Vaccination', trans: 'page',
    draw(ctx, u, S) {
      const { k, P, W } = S, la = S.at('Latin'), va = S.at('vacca.'), vn = S.at('vaccination.');
      S.cam(lerp(1.0, 1.1, tween(u, 0, 4.0)), W / 2, 620);
      ctx.fillStyle = '#efe2c0'; ctx.fillRect(-300, -300, W + 600, 1800);
      pamphlet(ctx, S, 300, 620, 340, tween(u, la - 0.3, la + 0.3, ease.outBack));
      const a = tween(u, va - 0.3, va + 0.2, ease.outBack), g = tween(u, vn - 0.6, vn + 0.4, ease.inOut);
      ctx.textAlign = 'center';
      if (a > 0) { ctx.save(); ctx.translate(720, 420); ctx.scale(a, a); ctx.fillStyle = '#8a5a3a'; ctx.font = '900 78px Deco'; ctx.fillText('VACCA', 0, 0); ctx.fillStyle = P.ink; ctx.font = 'italic 600 34px GaramondItalic'; ctx.fillText('cow (Latin)', 0, 50); ctx.restore(); }
      if (g > 0) { ctx.save(); ctx.globalAlpha = g; ctx.fillStyle = P.vermDark; ctx.font = '900 80px Deco'; ctx.fillText('VACCINATION', W / 2, 1000); ctx.restore(); ctx.beginPath(); ctx.moveTo(720, 500); ctx.lineTo(lerp(720, W / 2, g), lerp(500, 920, g)); k.stroke(ctx, P.vermDark, 4); }
      cow(ctx, S, 720, 800, 0.6, -1, S.t);
    },
  },
  { // 36.0 "Every legend has a beginning."
    start: 35.6, title: 'Every Legend Has a Beginning', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S, beg = S.at('beginning.');
      ctx.save(); S.cam(lerp(1.0, 1.4, tween(u, 0, beg)), W / 2, 760);
      k.goldSky(ctx, -300, -300, W + 600, 800, S.t); k.ground(ctx, -300, 530, W + 600, 1200, '#8aa068', 3, 0.4); cow(ctx, S, 440, 980, 1.6, 1, S.t);
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
  { t: 0.7, type: 'pop', gain: 0.35 }, { t: 3.4, type: 'pluck', gain: 0.3, pitch: 0.8 },
  { t: 5.0, type: 'stamp', gain: 0.4 }, { t: 5.6, type: 'wind', gain: 0.25 },
  { t: 9.0, type: 'pop', gain: 0.3 }, { t: 14.2, type: 'chime', gain: 0.45, pitch: 1.3 },
  { t: 15.8, type: 'stamp', gain: 0.4 },
  { t: 18.0, type: 'clank', gain: 0.2, pitch: 1.8 }, { t: 22.2, type: 'pop', gain: 0.2, pitch: 1.6 },
  ...Array.from({ length: 3 }, (_, i) => ({ t: +(25.8 + i * 0.45).toFixed(2), type: 'paper', gain: 0.2 })), { t: 29.5, type: 'chime', gain: 0.5, pitch: 1.4 },
  { t: 31.9, type: 'pop', gain: 0.35 }, { t: 33.9, type: 'chime', gain: 0.45, pitch: 1.2 }, { t: 34.4, type: 'stamp', gain: 0.4 },
];

export const music = {
  bpm: 94, root: 'E', maqam: 'rast', gain: 0.28,
  sections: [
    { from: 0, to: 4.6, mood: 'intro' },
    { from: 4.6, to: 17.5, mood: 'groove' },
    { from: 17.5, to: 25.4, mood: 'sad' },
    { from: 25.4, to: 37.9, mood: 'triumph' },
    { from: 37.9, to: 39.6, mood: 'end' },
  ],
};
