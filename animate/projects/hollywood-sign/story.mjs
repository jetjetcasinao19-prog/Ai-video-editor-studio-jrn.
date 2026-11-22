// "How the Hollywood Sign Started" — an Ottoman miniature chronicle of a real-estate ad.
// u = seconds since the scene started; S.at('word') = when that word is said.
import { clamp, lerp, ease, tween, rng, TAU, shake, pop } from '../../lib/core.mjs';
import { interior, lamp, bookCover, bigSign, medallion } from '../../styles/ottoman/scenes.mjs';

export const meta = {
  title: 'How the Hollywood Sign Started',
  slug: 'hollywood-sign-ottoman',
  style: 'ottoman',
  look: 'karagoz',
  width: 1080, height: 1920, fps: 30,
  duration: 59.8,
  voice: 'voice.mp3',
  seed: 67,
  captionChars: 30,
  brand: { handle: '@HOWITSTARTED-YT1', logo: '../../../brand/logo.png' },
  outro: { at: 58.1, text: 'Subscribe for more origin stories' },
};

const OLD = 'HOLLYWOODLAND', NEW = 'HOLLYWOOD';
const DEV = { robe: '#7a4a2a', robeP: 'stripes', robePc: '#e9be6e', inner: '#f7eed6', hat: 'turban', hatColor: '#3d8458', mustache: true };
const ALICE = { robe: '#1a1a1a', robeP: 'stripes', robePc: '#c4371f', inner: '#c4371f', sash: '#c9a227', hat: 'longhair', hair: '#111111', eyePaint: true };
const STARS = [
  { robe: '#c4371f', robeP: 'cintamani', robePc: '#ecd57a', hat: 'turban', hatColor: '#ecd57a', plume: '#20408f', mustache: true },
  { robe: '#20408f', robeP: 'flowers', robePc: '#f7eed6', hat: 'hotoz', hatColor: '#c4371f', veil: '#f8f2e2', hair: '#c9a227' },
  { robe: '#3d8458', robeP: 'dots', robePc: '#ecd57a', hat: 'turban', hatColor: '#c4371f', beard: 'short' },
  { robe: '#a99ac6', robeP: 'flowers', robePc: '#f7eed6', hat: 'hotoz', hatColor: '#2a9c93', veil: '#f8f2e2', hair: '#3a2a20', skin: '#8a5a3c' },
];

// The hills above Los Angeles with the sign on the big slope.
function hillside(ctx, S, o = {}) {
  const { k, P, W, H, t } = S;
  if (o.night) k.nightSky(ctx, -60, -60, W + 120, 760, t); else k.goldSky(ctx, -60, -60, W + 120, 760, t);
  if (o.sky) o.sky(ctx);
  if (!o.night) for (let i = 0; i < 3; i++) k.cloud(ctx, ((i * 360 + t * 16) % (W + 400)) - 200, 90 + (i % 2) * 60, 1.0, i + 150);
  k.spongy(ctx, W / 2, 720, 1250, 470, o.night ? '#6a5f7a' : P.ochreLight, 7);
  k.spongy(ctx, 150, 760, 560, 240, o.night ? '#5d6e58' : P.sageLight, 9);
  k.spongy(ctx, 870, 760, 520, 220, o.night ? '#6a5a6a' : P.rose, 11);
  // brush on the big hill
  const R = rng(5); for (let i = 0; i < 30; i++) k.tuft(ctx, 200 + R() * 680, 420 + R() * 280, 0.9, o.night ? '#3f4d3a' : P.olive);
  k.hillLetters(ctx, W / 2, 540, o.size || ((o.text || OLD) === OLD ? 78 : 100), o.text || OLD, o.f || (() => ({})), t);
  ctx.fillStyle = o.night ? '#3f4d3a' : P.sage; ctx.fillRect(-60, 740, W + 120, H);
  k.ground(ctx, -60, 740, W + 120, 400, o.night ? '#3f4d3a' : P.sage, 13, 0.6);
  if (o.palms !== false) for (const [x, h] of [[70, 380], [880, 340], [250, 260], [700, 280]]) k.palm(ctx, x, 1040, h, t, x);
}

export const scenes = [
  { // 0.0 "The Hollywood sign was supposed to come down after a year and a half."
    start: 0, title: 'Built to Come Down',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const ye = S.at('year'), cd = S.at('down');
      S.cam(lerp(1.25, 1.0, tween(u, 0, 4.8)), W / 2, lerp(500, 600, tween(u, 0, 4.8)));
      hillside(ctx, S, { text: NEW });
      // an hourglass for "a year and a half"
      const hg = pop(u, ye - 0.4, 0.4);
      if (hg > 0) { ctx.save(); ctx.translate(W / 2, 880); ctx.scale(hg, hg); k.hourglass(ctx, 0, 0, 0.9, tween(u, ye, ye + 1.4)); ctx.restore(); k.label(ctx, '18 MONTHS', W / 2, 760, 26, tween(u, ye, ye + 0.3)); }
      k.stamp(ctx, 'TEMPORARY', W / 2, 300, 60, tween(u, cd, cd + 0.25, ease.linear), -0.1);
    },
  },
  { // 5.4 "1923, Los Angeles."
    start: 5.3, title: 'Los Angeles · 1923', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const la = S.at('Los');
      S.cam(lerp(1.1, 1.0, tween(u, 0, 3.6)), W / 2, 560);
      k.goldSky(ctx, -60, -60, W + 120, 520, S.t);
      k.sun(ctx, 800, 170, 56, S.t);
      k.hills(ctx, W, 250, 17, [P.ochreLight, P.rose, P.lav]);
      k.ground(ctx, -60, 340, W + 120, 760, '#d9c37e', 19, 0.4);
      const R = rng(8);
      for (const [row, y, sc] of [[0, 480, 0.75], [1, 620, 0.9], [2, 770, 1.0]]) for (let i = 0; i < 5; i++) {
        const x = 90 + i * 190 + (row % 2) * 80;
        if (R() < 0.35) { k.palm(ctx, x, y + 10, 200 * sc, S.t, i + row); continue; }
        k.house(ctx, x, y, 110 * sc, 80 * sc, { wall: [P.white, P.pink, P.ochreLight][(i + row) % 3], roof: P.verm });
      }
      k.palm(ctx, 120, 1060, 420, S.t, 3); k.palm(ctx, 860, 1060, 380, S.t, 5);
      k.label(ctx, 'LOS ANGELES', W / 2, 260, 34, tween(u, la, la + 0.3));
      k.seal(ctx, 760, 960, 66, ' LOS ANGELES · CALIFORNIA ·', '1923', tween(u, 0.1, 0.4, ease.linear));
    },
  },
  { // 9.1 "Developers are selling homes in the hills, in a neighborhood called Hollywoodland."
    start: 8.95, title: 'Hollywoodland', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const se = S.at('selling'), hw = S.at('Hollywoodland');
      S.cam(lerp(1.0, 1.08, tween(u, 0, 5.4)), W / 2, 600);
      hillside(ctx, S, { text: OLD, f: () => ({ show: 0 }), palms: false });
      // homes pop up across the hills, each with a little FOR SALE flag
      const spots = [[180, 640], [330, 560], [520, 600], [700, 540], [860, 640], [420, 700], [620, 700]];
      spots.forEach(([x, y], i) => { const p = pop(u, se - 0.3 + i * 0.15, 0.3); if (p <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(p, p); k.house(ctx, 0, 0, 90, 64, { wall: [P.white, P.pink, P.ochreLight][i % 3], roof: P.verm }); k.rect(ctx, 40, -60, 4, 60, P.brown, P.ink, 1); k.rect(ctx, 44, -60, 44, 24, P.paperLight, P.ink, 1.2); ctx.fillStyle = P.verm; ctx.font = '900 9px Fell'; ctx.textAlign = 'center'; ctx.fillText('FOR SALE', 66, -44); ctx.restore(); });
      for (let i = 0; i < 2; i++) k.figure(ctx, 200 + i * 600, 1010, { ...DEV, s: 0.95, face: i ? -1 : 1, mood: 'happy', armF: [2.0 + Math.sin(u * 4 + i) * 0.2, 0.2], robe: i ? '#20408f' : DEV.robe });
      const bn = tween(u, hw - 0.1, hw + 0.4, ease.outBack);
      if (bn > 0) { ctx.save(); ctx.translate(W / 2, 260); ctx.scale(bn, bn); k.cartouche(ctx, 0, 0, 640, 100, P.lapis, P.goldLight, 5); ctx.fillStyle = P.goldLight; ctx.font = '900 50px Deco'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('HOLLYWOODLAND', 0, 4); ctx.restore(); }
    },
  },
  { // 14.5 "To get attention, they put up a giant ad on the hillside."
    start: 14.4, title: 'A Giant Ad', trans: 'wipe',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const pu = S.at('put'), hs = S.at('hillside');
      S.cam(lerp(1.0, 1.12, tween(u, 0, 4)), W / 2, 540);
      hillside(ctx, S, { text: OLD, f: i => ({ show: tween(u, pu - 0.3 + i * 0.14, pu + 0.0 + i * 0.14, ease.outBack) }) });
      for (let i = 0; i < 3; i++) k.figure(ctx, 280 + i * 220, 760, { ...DEV, s: 0.55, face: 1, robe: [P.verm, P.lapis, P.green][i], hat: 'cap', hatColor: P.ochre, mood: 'happy', armF: [2.6 + Math.sin(u * 8 + i) * 0.3, 0.2] });
      k.label(ctx, 'A GIANT AD', W / 2, 260, 32, tween(u, hs, hs + 0.3));
    },
  },
  { // 18.6 "Huge white letters, lit up at night."
    start: 18.5, title: 'Lit Up at Night', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const lt = S.at('lit'), ni = S.at('night');
      const dark = tween(u, lt - 1.2, lt - 0.1);
      S.cam(lerp(1.12, 1.0, tween(u, 0, 3.5)), W / 2, 540);
      hillside(ctx, S, { text: OLD, night: dark > 0.5, f: () => ({ lit: tween(u, lt - 0.05, lt + 0.3) }) });
      if (dark > 0 && dark < 1) { ctx.save(); ctx.fillStyle = `rgba(20,25,60,${dark * 0.6})`; ctx.fillRect(-60, -60, W + 120, 1200); ctx.restore(); }
      if (dark > 0.5) k.moon(ctx, 840, 140, 40);
      k.label(ctx, 'HUGE WHITE LETTERS', W / 2, 260, 28, tween(u, 0.1, 0.4) * (1 - tween(u, lt - 0.2, lt)));
      if (u > ni) k.label(ctx, 'LIT UP AT NIGHT', W / 2, 260, 28, tween(u, ni, ni + 0.3));
    },
  },
  { // 22.2 "But it never comes down."
    start: 22.0, title: 'It Never Comes Down', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const ne = S.at('never');
      hillside(ctx, S, { text: OLD });
      // the hourglass flips again and again: years go by
      const flips = Math.floor(clamp((u - 0.2) / 0.5) * 4), part = ((u - 0.2) / 0.5) % 1;
      ctx.save(); ctx.translate(W / 2, 880); k.hourglass(ctx, 0, 0, 0.9, u < 0.2 ? 1 : clamp(part), flips % 2 ? Math.PI : 0); ctx.restore();
      k.stamp(ctx, 'STILL STANDING', W / 2, 300, 58, tween(u, ne, ne + 0.25, ease.linear), -0.1);
    },
  },
  { // 24.8 "Years later, it's falling apart."
    start: 24.6, title: 'Falling Apart', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const fa = S.at('falling');
      const f = tween(u, fa - 0.3, fa + 0.8, ease.inCubic);
      hillside(ctx, S, { text: OLD, f: i => { const R = rng(i + 1); const d = R(); return { tilt: (d - 0.5) * 0.6 * f, drop: d > 0.7 ? f * 90 : f * 10, color: '#d9d2c4' }; } });
      ctx.save(); ctx.fillStyle = `rgba(90,80,60,${0.25 * f})`; ctx.fillRect(-60, -60, W + 120, 1200); ctx.restore();
      ctx.save(); ctx.translate(lerp(900, 600, u / 2.8), 300 + Math.sin(u * 7) * 10); ctx.beginPath(); ctx.moveTo(-26, 0); ctx.quadraticCurveTo(-10, -18 * Math.sin(u * 14), 0, 0); ctx.quadraticCurveTo(10, -18 * Math.sin(u * 14), 26, 0); k.stroke(ctx, P.ink, 3); ctx.restore();
      k.label(ctx, 'YEARS LATER', W / 2, 260, 28, tween(u, 0.1, 0.4));
    },
  },
  { // 27.7 "In 1949, the Hollywood Chamber of Commerce repairs it and removes the word land."
    start: 27.6, title: 'Hollywood · 1949', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const ch = S.at('Chamber'), rp = S.at('repairs'), rm = S.at('removes'), ld = S.at('land');
      S.cam(lerp(1.0, 1.08, tween(u, 0, 7)), W / 2, 560);
      const fix = tween(u, rp - 0.2, rp + 0.8);
      const away = tween(u, rm - 0.2, ld + 0.6, ease.inCubic);
      hillside(ctx, S, { text: OLD, f: i => { const R = rng(i + 1); const d = R(); const broke = 1 - fix; const isLand = i >= 9; return { tilt: (d - 0.5) * 0.6 * broke, drop: (d > 0.7 ? 90 : 10) * broke - (isLand ? away * 600 : 0), dx: isLand ? away * 200 : 0, show: isLand ? 1 - away * 0.9 : 1, color: fix > 0.5 ? P.white : '#d9d2c4' }; } });
      for (let i = 0; i < 3; i++) k.figure(ctx, 230 + i * 250, 1010, { ...DEV, s: 0.85, face: i < 1 ? 1 : -1, robe: [P.lapis, P.verm, P.green][i], robeP: 'cintamani', hat: 'turban', hatColor: [P.verm, P.ochre, P.lapis][i], mood: 'happy', armF: [2.0, 0.3] });
      k.label(ctx, 'HOLLYWOOD CHAMBER OF COMMERCE', W / 2, 860, 22, tween(u, ch, ch + 0.3));
      k.label(ctx, '− LAND', 820, 230, 30, tween(u, ld, ld + 0.3));
      k.seal(ctx, 150, 220, 60, ' REPAIRED · REPAIRED ·', '1949', tween(u, S.at('1949'), S.at('1949') + 0.3, ease.linear));
    },
  },
  { // 35.1 "By the 1970s, it's a wreck."
    start: 34.9, title: 'A Wreck · 1970s', trans: 'flash',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const wr = S.at('wreck');
      const f = tween(u, wr - 1.2, wr + 0.4, ease.inCubic);
      S.cam(1.0, W / 2 + shake(u, wr, 8, 0.4), 560);
      hillside(ctx, S, { text: NEW, f: i => { const R = rng(i + 7); const d = R(); return { tilt: (d - 0.5) * 1.2 * f, drop: (d > 0.5 ? 140 : 30) * f, show: i === 6 ? 1 - f * 0.9 : 1, color: '#c9bfae' }; } });
      ctx.save(); ctx.fillStyle = `rgba(80,70,60,${0.3 * f})`; ctx.fillRect(-60, -60, W + 120, 1200); ctx.restore();
      k.stamp(ctx, 'A WRECK', W / 2, 300, 80, tween(u, wr, wr + 0.25, ease.linear), -0.12);
    },
  },
  { // 38.1 "So, celebrities step in. Each donor pays for one letter."
    start: 37.9, title: 'Celebrities Step In', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const ce = S.at('celebrities'), ea = S.at('Each'), le = S.at('letter');
      k.nightSky(ctx, -60, -60, W + 120, H + 120, S.t);
      k.searchlights(ctx, W / 2, 900, W, H, S.t, 4, tween(u, ce - 0.2, ce + 0.3));
      k.carpet(ctx, 80, 800, W - 160, 220, P.verm, P.goldDark);
      // each star steps up with a letter of their own
      const letters = ['H', 'L', 'Y', 'W'];
      STARS.forEach((o, i) => {
        const x = 150 + i * 215, p = pop(u, ce - 0.2 + i * 0.2, 0.35);
        if (p <= 0) return;
        k.figure(ctx, x, 1000, { ...o, s: 0.85 * p, face: i < 2 ? 1 : -1, mood: 'happy', armF: [2.6, 0.2] });
        const lp = pop(u, ea + i * 0.3, 0.35);
        if (lp > 0) { ctx.save(); ctx.translate(x, 620); ctx.scale(lp, lp); ctx.font = '900 110px Deco'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = 8; ctx.strokeStyle = P.ink; ctx.strokeText(letters[i], 0, 0); ctx.fillStyle = P.white; ctx.fillText(letters[i], 0, 0); ctx.restore(); }
        if (u > le) k.coin(ctx, x + 60, 700 - ((u - le) * 200 + i * 30) % 80, 22, u * 6 + i, '');
      });
      k.label(ctx, 'ONE DONOR, ONE LETTER', W / 2, 250, 28, tween(u, le, le + 0.3));
    },
  },
  { // 43.4 "Rock star Alice Cooper pays for an O."
    start: 43.2, title: 'Alice Cooper', trans: 'wipe',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const al = S.at('Alice'), o = S.at('O');
      k.nightSky(ctx, -60, -60, W + 120, H + 120, S.t);
      k.searchlights(ctx, W / 2, 900, W, H, S.t, 3);
      k.carpet(ctx, 80, 800, W - 160, 220, P.ink, P.verm);
      k.figure(ctx, 330, 1000, { ...ALICE, s: 1.25, face: 1, mood: 'happy', armF: [1.4 + Math.sin(u * 10) * 0.15, 0.6], hold: c => k.guitar(c, -20, 10, 0.9, -0.5, P.verm) });
      k.label(ctx, 'ALICE COOPER', 330, 520, 30, tween(u, al, al + 0.3));
      // the big O drops in on "O"
      const od = tween(u, o - 0.4, o, ease.outBounce);
      ctx.save(); ctx.translate(720, lerp(-200, 620, od)); ctx.font = '900 300px Deco'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = 14; ctx.strokeStyle = P.ink; ctx.strokeText('O', 0, 0); ctx.fillStyle = P.white; ctx.fillText('O', 0, 0); ctx.restore();
      if (u > o) for (let i = 0; i < 14; i++) { const a = i / 14 * TAU, r = 160 + (u - o) * 300; k.star(ctx, 720 + Math.cos(a) * r, 620 + Math.sin(a) * r, 12, 1 - (u - o)); }
    },
  },
  { // 46.7 "In 1978, a brand new sign goes up."
    start: 46.5, title: 'A New Sign · 1978', trans: 'flash',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const br = S.at('brand'), up = S.at('up');
      S.cam(lerp(1.12, 1.0, tween(u, 0, 3.8)), W / 2, 540);
      hillside(ctx, S, { text: NEW, f: i => ({ show: tween(u, br - 0.4 + i * 0.13, br - 0.1 + i * 0.13, ease.outBack) }) });
      if (u > up) for (let i = 0; i < 18; i++) { const a = i / 18 * TAU, r = 120 + (u - up) * 420; k.star(ctx, W / 2 + Math.cos(a) * r, 460 + Math.sin(a) * r * 0.6, 12, 1 - (u - up) * 0.7); }
      k.seal(ctx, 820, 230, 64, ' BRAND NEW · BRAND NEW ·', '1978', tween(u, S.at('1978'), S.at('1978') + 0.3, ease.linear));
    },
  },
  { // 50.6 "A real estate ad that became the symbol of the movies."
    start: 50.4, title: 'Symbol of the Movies', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const ad = S.at('estate'), sy = S.at('symbol'), mv = S.at('movies');
      hillside(ctx, S, { text: NEW, night: true, sky: c => k.searchlights(c, W / 2, 900, W, H, S.t, 5, tween(u, sy - 0.4, sy + 0.2)), f: () => ({ lit: 1 }) });
      k.label(ctx, 'A REAL ESTATE AD', W / 2, 250, 28, tween(u, ad - 0.2, ad + 0.1) * (1 - tween(u, sy - 0.3, sy)));
      // the movies arrive: reel, clapperboard
      const mp = pop(u, sy - 0.1, 0.4);
      if (mp > 0) { k.filmReel(ctx, 230, 860, 90 * mp, u * 2); k.filmReel(ctx, 400, 820, 60 * mp, -u * 2.5); ctx.save(); ctx.translate(760, 880); ctx.scale(mp, mp); k.clapper(ctx, 0, 0, 1.1, Math.abs(Math.sin(u * 4)) * tween(u, mv - 0.2, mv)); ctx.restore(); }
      bigSign(ctx, k, P, 'THE MOVIES', W / 2, 250, 620, tween(u, mv - 0.05, mv + 0.35, ease.outBack), 84);
    },
  },
  { // 56.0 "Every legend has a beginning."
    start: 55.8, title: 'Every Legend Has a Beginning', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W, H } = S, beg = S.at('beginning');
      ctx.save();
      S.cam(lerp(1.0, 1.4, tween(u, 0, beg)), W / 2, lerp(560, 500, tween(u, 0, beg)));
      hillside(ctx, S, { text: OLD, f: i => ({ color: i >= 9 ? P.goldLight : P.white, lit: 0.6 }) });
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
const pops = (from, n, gap, gain = 0.5) => Array.from({ length: n }, (_, i) => ({ t: +(from + i * gap).toFixed(3), type: 'pop', gain, pitch: 1 + (i % 4) * 0.12 }));
const thuds = (from, n, gap, gain = 0.4) => Array.from({ length: n }, (_, i) => ({ t: +(from + i * gap).toFixed(3), type: 'thud', gain }));
export const sfx = [
  ...scenes.slice(1).map(s => ({ t: s.start - 0.05, type: s.trans === 'unroll' ? 'paper' : 'whoosh', gain: 0.35 })),
  { t: 0.2, type: 'gong', gain: 0.5 }, { t: 2.6, type: 'drip', gain: 0.4 }, { t: 2.94, type: 'chime', gain: 0.35 }, { t: 1.94, type: 'stamp', gain: 0.7 },
  { t: 5.44, type: 'stamp', gain: 0.5 }, { t: 6.9, type: 'chime', gain: 0.4 },
  ...pops(9.4, 7, 0.15, 0.35), { t: 12.66, type: 'gong', gain: 0.5 },
  ...thuds(15.3, 13, 0.14, 0.35), { t: 17.42, type: 'chime', gain: 0.45 },
  { t: 19.3, type: 'wind', gain: 0.25 }, { t: 20.42, type: 'riser', gain: 0.4 }, { t: 20.5, type: 'chime', gain: 0.6, pitch: 1.4 }, { t: 20.98, type: 'pop', gain: 0.4 },
  { t: 22.3, type: 'slide', gain: 0.3 }, { t: 22.88, type: 'stamp', gain: 0.7 }, { t: 23.4, type: 'slide', gain: 0.3 },
  { t: 25.7, type: 'crack', gain: 0.5 }, { t: 26.1, type: 'thud', gain: 0.5 }, { t: 26.3, type: 'thud', gain: 0.4 },
  { t: 27.7, type: 'stamp', gain: 0.5 }, ...Array.from({ length: 4 }, (_, i) => ({ t: 30.6 + i * 0.3, type: 'clank', gain: 0.4 })), { t: 32.1, type: 'whoosh', gain: 0.5 }, { t: 33.26, type: 'whoosh', gain: 0.6 }, { t: 33.3, type: 'pop', gain: 0.5 },
  { t: 35.2, type: 'thunder', gain: 0.35 }, { t: 36.4, type: 'crack', gain: 0.6 }, { t: 36.96, type: 'stamp', gain: 0.8 },
  { t: 38.4, type: 'riser', gain: 0.35 }, { t: 38.5, type: 'chime', gain: 0.4 }, ...pops(40.4, 4, 0.3, 0.45), { t: 41.92, type: 'coins', gain: 0.5 },
  { t: 43.3, type: 'pluck', gain: 0.6, pitch: 0.75 }, { t: 43.6, type: 'pluck', gain: 0.6, pitch: 0.9 }, { t: 43.9, type: 'pluck', gain: 0.6, pitch: 0.75 }, { t: 45.46, type: 'thud', gain: 0.8 }, { t: 45.5, type: 'gong', gain: 0.6 },
  ...thuds(47.7, 9, 0.13, 0.35), { t: 49.66, type: 'gong', gain: 0.7 }, { t: 49.7, type: 'chime', gain: 0.5 },
  { t: 52.9, type: 'riser', gain: 0.35 }, { t: 53.98, type: 'gong', gain: 0.7 }, { t: 54.2, type: 'clank', gain: 0.5 },
  { t: 57.36, type: 'pop', gain: 0.8 }, { t: 57.4, type: 'gong', gain: 0.9 },
];

export const music = {
  bpm: 100, root: 'G', maqam: 'hicaz', gain: 0.32,
  sections: [
    { from: 0, to: 8.95, mood: 'intro' },
    { from: 8.95, to: 22.0, mood: 'groove' },
    { from: 22.0, to: 24.6, mood: 'drive' },
    { from: 24.6, to: 27.6, mood: 'sad' },
    { from: 27.6, to: 34.9, mood: 'groove' },
    { from: 34.9, to: 37.9, mood: 'sad' },
    { from: 37.9, to: 57.36, mood: 'triumph' },
    { from: 57.36, to: 59.8, mood: 'end' },
  ],
};
