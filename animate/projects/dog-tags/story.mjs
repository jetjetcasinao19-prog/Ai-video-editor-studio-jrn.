// "Before Dog Tags" — told as a Book of Wonders (`marvels`) on the pages of an
// army register (the ledger look): the soldier's ID traced from a pinned paper
// note to the 1906 disc and the 1916 pair. The soldier "Tom Hale" on the tags is
// fictional; the dates and orders are history. Kept respectful: no bodies shown.
import { clamp, lerp, ease, tween, rng, TAU, shake, pop } from '../../lib/core.mjs';
import { interior, land, bookCover, medallion } from '../../styles/ottoman/scenes.mjs';
import { act } from '../../styles/ottoman/acting.mjs';

export const meta = {
  title: 'Before Dog Tags',
  slug: 'dog-tags-ottoman',
  style: 'ottoman',
  look: 'ledger',   // an army register: "one goes to the records" (after album, karagoz, tile)
  room: 'library',  // the War Department
  device: 'marvels',
  width: 1080, height: 1920, fps: 30,
  duration: 56.6,
  voice: 'voice.mp3',
  seed: 181,
  captionChars: 30,
  brand: { handle: '@HOWITSTARTED-YT1', logo: '../../../brand/logo.png' },
  outro: { at: 54.8, text: 'Subscribe for more origin stories' },
};

const BLUE = '#2a3a6a', SKINS = ['#f1d1a8', '#e2b48a', '#8a5a3c', '#f1d1a8', '#c68a5e', '#e8c49a'];
const UNION = i => ({ robe: BLUE, robeP: 'stripes', robePc: '#33447a', inner: '#6a7aa8', sash: '#2a2a2a', hat: 'kepi', skin: SKINS[i % 6], mustache: i % 2 === 0, beard: i % 3 === 1 ? 'short' : undefined });
const DOUGHBOY = i => ({ robe: '#8a7a4a', robeP: 'stripes', robePc: '#7c6e40', inner: '#b8a878', sash: '#5a4a2a', hat: 'campaignhat', skin: SKINS[(i + 2) % 6] });
const NOTE = ['Pvt. Tom Hale', 'Co. B'];
const DISC = ['T. HALE', 'PVT', 'CO. B'];
const RED = '#b3261a', INK = '#1a1410';

// gold leader line from a point on the object to its label (Book of Wonders)
function callout(ctx, k, P, text, px, py, lx, ly, a) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp(a); ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(lx, ly); k.stroke(ctx, P.ink, 4); k.stroke(ctx, P.gold, 2.5); k.circle(ctx, px, py, 6, RED, P.ink, 1.5); ctx.restore();
  k.label(ctx, text, lx, ly, 20, a);
}
function camp(ctx, S, night = false) {
  const { k, P, W, t } = S;
  if (night) k.nightSky(ctx, -80, -80, W + 160, 1240, t); else k.goldSky(ctx, -80, -80, W + 160, 1240, t);
  ctx.fillStyle = night ? '#3e4a34' : P.sage; ctx.fillRect(-80, 560, W + 160, 700);
  for (let r = 0; r < 3; r++) for (let i = 0; i < 7; i++) k.aTent(ctx, 60 + i * 150 + (r % 2) * 70, 600 + r * 70, 0.7 + r * 0.15, night ? '#cfc6b0' : '#efe6d0');
}

export const scenes = [
  { // 0.0 "Before dog tags, soldiers had to make their own."
    start: 0, title: 'Before Dog Tags',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const sol = S.at('soldiers'), own = S.at('own.');
      ctx.fillStyle = '#efe3c6'; ctx.fillRect(-80, -80, W + 160, 1240);
      S.cam(lerp(1.25, 1.0, tween(u, 0, 3.5, ease.inOut)), W / 2, 520);
      // a modern tag swings… then fades back in time into a pinned paper slip
      const back = tween(u, sol - 0.2, own + 0.6, ease.inOut), sw = Math.sin(u * 2.4) * 0.25 * (1 - back);
      ctx.save(); ctx.globalAlpha = 1 - back; k.idTag(ctx, W / 2, 500, 2.4, { shape: 'modern', lines: ['HALE', 'THOMAS', 'O POS'], rot: sw }); ctx.restore();
      ctx.save(); ctx.globalAlpha = back; ctx.translate(W / 2, 520); ctx.scale(lerp(0.6, 1, back), lerp(0.6, 1, back)); k.idTag(ctx, 0, 0, 2.6, { shape: 'note', lines: NOTE, k: tween(u, own - 0.2, own + 1.0), rot: -0.05 }); ctx.restore();
      // the ledger's years run backwards in the margin
      ctx.fillStyle = RED; ctx.font = '700 40px Garamond'; ctx.textAlign = 'center';
      ctx.fillText(String(Math.round(lerp(2026, 1861, back))), W / 2, 900);
    },
  },
  { // 3.9 "1860s, the American Civil War."
    start: 3.8, title: 'The Civil War · 1860s', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const yr = S.at('1860s,');
      S.cam(lerp(1.15, 1.0, tween(u, 0, 4)), W / 2, 600);
      camp(ctx, S, false);
      for (let i = 0; i < 6; i++) k.figure(ctx, ((u * 90 + i * 170) % (W + 200)) - 100, 1000 + (i % 2) * 14, { ...UNION(i), s: 0.8, face: 1, mood: 'calm', ...act('walk', u + i) });
      k.seal(ctx, 160, 160, 66, ' THE 1860s · THE 1860s ·', '1860s', tween(u, yr - 0.1, yr + 0.3, ease.linear));
    },
  },
  { // 8.0 "Before big battles, many soldiers pin paper notes with their names to their coats,"
    start: 7.8, title: 'Names on Paper', trans: 'ink',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const pi = S.at('pin'), no = S.at('names'), co = S.at('coats,');
      S.cam(lerp(1.0, 1.35, tween(u, pi - 0.4, co + 0.6, ease.inOut)), lerp(W / 2, 560, tween(u, pi, co)), lerp(620, 700, tween(u, pi, co)));
      camp(ctx, S, true);
      // the campfire lights their faces
      const f = 0.85 + 0.15 * Math.sin(S.t * 9); const g = ctx.createRadialGradient(W / 2, 960, 10, W / 2, 900, 420); g.addColorStop(0, `rgba(255,190,90,${0.45 * f})`); g.addColorStop(1, 'rgba(255,190,90,0)'); ctx.fillStyle = g; ctx.fillRect(-80, 400, W + 160, 800);
      k.flames(ctx, W / 2, 1000, 130, 1, S.t);
      [[260, 1], [820, -1], [420, 1]].forEach(([x, face], i) => k.figure(ctx, x, 1010, { ...UNION(i), s: 1.0, face, mood: 'calm', armF: [1.2 + Math.sin(u * 2 + i) * 0.1, 1.9], look: 0.3 }));
      // a note is written and pinned to the coat
      const pin = tween(u, pi - 0.2, co, ease.inOut);
      ctx.save(); ctx.translate(lerp(640, 438, pin), lerp(560, 840, pin)); ctx.scale(lerp(1.5, 0.45, pin), lerp(1.5, 0.45, pin)); k.idTag(ctx, 0, 0, 1, { shape: 'note', lines: NOTE, k: tween(u, no - 0.6, no + 0.6), rot: lerp(0, -0.1, pin) }); ctx.restore();
    },
  },
  { // 13.2 "so they can be identified if they don't come home."
    start: 13.0, title: 'If They Fall', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const ho = S.at('home.');
      // dawn over an empty field: the note alone in the wind on a fence post
      S.cam(lerp(1.0, 1.25, tween(u, 0, 3.2, ease.inOut)), 640, 640);
      k.goldSky(ctx, -80, -80, W + 160, 1240, S.t);
      ctx.save(); ctx.globalAlpha = 0.35; ctx.fillStyle = '#7a7a9a'; ctx.fillRect(-80, -80, W + 160, 1240); ctx.restore();
      ctx.fillStyle = '#7a8a5a'; ctx.fillRect(-80, 640, W + 160, 600);
      for (let i = 0; i < 7; i++) { k.rect(ctx, 80 + i * 150, 560, 14, 120, P.brown, P.ink, 1.5); }
      ctx.beginPath(); ctx.moveTo(60, 590); ctx.lineTo(1040, 590); k.stroke(ctx, P.brown, 6);
      k.idTag(ctx, 690, 640, 1.4, { shape: 'note', lines: NOTE, rot: Math.sin(S.t * 3) * 0.12 });
      for (let i = 0; i < 12; i++) { const x = ((S.t * 120 + i * 97) % (W + 200)) - 100; ctx.beginPath(); ctx.moveTo(x, 300 + i * 40); ctx.lineTo(x + 40, 296 + i * 40); k.stroke(ctx, 'rgba(255,255,255,0.4)', 2); }
      if (u > ho - 0.4) k.sun(ctx, 860, lerp(700, 560, tween(u, ho - 0.4, ho + 1.5)), 50, S.t, false);
    },
  },
  { // 16.4 "Some buy metal ID badges from camp merchants with their own money."
    start: 16.2, title: 'The Sutler’s Wagon', trans: 'page',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const bu = S.at('buy'), me = S.at('metal'), mo = S.at('money.');
      S.cam(lerp(1.0, 1.2, tween(u, me - 0.4, mo, ease.inOut)), lerp(W / 2, 640, tween(u, me, mo)), 640);
      camp(ctx, S, false);
      k.canopy(ctx, 640, 560, 420, 80, RED, S.t);
      k.rect(ctx, 440, 700, 400, 40, P.brownLight, P.ink, 2); k.rect(ctx, 450, 740, 20, 260, P.brown, P.ink, 1.5); k.rect(ctx, 810, 740, 20, 260, P.brown, P.ink, 1.5);
      for (let i = 0; i < 5; i++) { k.circle(ctx, 480 + i * 75, 690, 18, i % 2 ? P.gold : '#c9cdd2', P.ink, 1.5); k.star(ctx, 480 + i * 75, 690, 8, 1); }
      k.figure(ctx, 720, 1010, { robe: P.brown, robeP: 'dots', robePc: P.ochre, hat: 'stovepipe', beard: 'short', skin: '#e2b48a', s: 1.05, face: -1, mood: 'happy', ...act('present', u) });
      const pay = tween(u, mo - 0.6, mo);
      k.figure(ctx, 300, 1010, { ...UNION(1), s: 1.05, face: 1, mood: 'calm', armF: [lerp(0.6, 1.5, pay), 0.2] });
      for (let i = 0; i < 3; i++) { const q = clamp((u - mo + 0.6 - i * 0.12) / 0.6); if (q > 0 && q < 1) k.coin(ctx, lerp(380, 620, q), 760 - Math.sin(q * Math.PI) * 120, 16, S.t * 5, '¢'); }
      k.label(ctx, 'SUTLER · CAMP MERCHANT', 640, 470, 20, tween(u, bu, bu + 0.4));
    },
  },
  { // 21.5 "In 1862, a New Yorker offers to make ID discs for every soldier."
    start: 21.3, title: 'An Offer · 1862', trans: 'ink',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const yr = S.at('1862,'), of = S.at('offers'), di = S.at('discs'), ev = S.at('every');
      S.cam(lerp(1.0, 1.1, tween(u, 0, 5)), W / 2, 600);
      interior(ctx, S, { carpetColor: P.lapis });
      k.seal(ctx, 160, 160, 62, ' THE YEAR · 1862 ·', '1862', tween(u, yr - 0.1, yr + 0.3, ease.linear));
      k.figure(ctx, 300, 1010, { robe: P.ink, robeP: 'stripes', robePc: '#3a3a3a', hat: 'stovepipe', mustache: true, skin: '#f1d1a8', s: 1.1, face: 1, mood: 'happy', ...act('present', u, tween(u, of - 0.2, of + 0.3)) });
      // his sample case of discs, then rows of discs, one per soldier
      const c = pop(u, di - 0.3, 0.4);
      if (c > 0) { ctx.save(); ctx.translate(600, 620); ctx.scale(c, c); k.rect(ctx, -150, -60, 300, 120, '#5a1e1e', P.ink, 2.5); for (let i = 0; i < 4; i++) k.idTag(ctx, -105 + i * 70, 0, 0.6, { shape: 'disc', chain: false }); ctx.restore(); }
      if (u > ev - 0.2) for (let i = 0; i < 18; i++) { const p = pop(u, ev - 0.2 + i * 0.05, 0.25); if (p > 0) k.idTag(ctx, 470 + (i % 6) * 60, 380 + Math.floor(i / 6) * 70, 0.4 * p, { shape: 'disc', chain: false }); }
    },
  },
  { // 27.0 "The War Department says no."
    start: 26.9, title: 'The War Department', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const no = S.at('no.');
      S.cam(lerp(1.0, 1.15, tween(u, no - 0.3, no + 0.8, ease.inOut)), W / 2, 700);
      k.goldSky(ctx, -80, -80, W + 160, 1240, S.t);
      // a columned government building; its great door swings shut
      k.rect(ctx, 140, 320, 800, 560, '#e8e0cc', P.ink, 3); k.poly(ctx, [[120, 320], [540, 200], [960, 320]], '#d8d0bc', P.ink, 3);
      for (let i = 0; i < 6; i++) k.rect(ctx, 180 + i * 132, 360, 40, 480, '#f3efe6', P.ink, 1.5);
      ctx.fillStyle = INK; ctx.font = '900 30px Deco'; ctx.textAlign = 'center'; ctx.fillText('WAR DEPARTMENT', 540, 300);
      const shut = tween(u, no - 0.4, no, ease.inCubic);
      k.rect(ctx, 470, 640, 140, 240, '#2a1c12', P.ink, 2); k.rect(ctx, 470, 640, 140 * shut, 240, P.brown, P.ink, 2);
      ctx.fillStyle = '#9a9488'; ctx.fillRect(-80, 880, W + 160, 400);
      for (let i = 0; i < 4; i++) k.rect(ctx, 380 - i * 30, 880 + i * 30, 320 + i * 60, 30, '#c9c2b0', P.ink, 1.5);
      // the sample disc rolls back down the steps
      const roll = tween(u, no, no + 1.4, ease.inOut);
      k.idTag(ctx, lerp(560, 860, roll), 860 + roll * 140 - Math.abs(Math.sin(roll * 9)) * 18, 0.6, { shape: 'disc', chain: false, rot: roll * 9 });
      k.figure(ctx, 240, 1100, { robe: P.ink, robeP: 'stripes', robePc: '#3a3a3a', hat: 'stovepipe', mustache: true, skin: '#f1d1a8', s: 0.9, face: 1, mood: 'sad', ...act('shrug', u, tween(u, no, no + 0.4)) });
    },
  },
  { // 29.7 "Finally, in 1906, the U.S. Army orders an aluminum disc"
    start: 29.6, title: 'General Orders No. 204', trans: 'page',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const yr = S.at('1906,'), or = S.at('orders'), al = S.at('aluminum');
      S.cam(lerp(1.0, 1.15, tween(u, al - 0.4, al + 0.6, ease.inOut)), W / 2, 560);
      interior(ctx, S, { carpet: false });
      k.rect(ctx, 80, 760, 900, 40, P.brown, P.ink, 2.5); k.rect(ctx, 110, 800, 30, 260, P.brown, P.ink, 2); k.rect(ctx, 920, 800, 30, 260, P.brown, P.ink, 2);
      k.candle(ctx, 140, 760, 1.0, S.t); k.quill(ctx, 600, 740, 0.9, -0.5);
      k.seal(ctx, 160, 150, 62, ' THE YEAR · 1906 ·', '1906', tween(u, yr - 0.1, yr + 0.3, ease.linear));
      k.letter(ctx, 400, 600, 420, 290, ['GENERAL ORDERS', 'No. 204 · Dec. 1906', 'An identification tag', 'for every soldier.'], tween(u, or - 0.2, or + 1.6), -0.04);
      const d = pop(u, al - 0.2, 0.45);
      if (d > 0) k.idTag(ctx, 780, 600, 2.2 * d, { shape: 'disc', lines: [], metal: '#d6dadf' });
    },
  },
  { // 34.3 "about the size of a half dollar stamped with each soldier's details."
    start: 34.2, title: 'Half a Dollar Wide', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const ha = S.at('half'), st = S.at('stamped'), de = S.at('details.');
      S.cam(lerp(1.2, 1.0, tween(u, 0, 2.5, ease.inOut)), W / 2, 560);
      ctx.fillStyle = '#4a1e24'; ctx.fillRect(-80, -80, W + 160, 1240); ctx.fillStyle = k.pattern(ctx, 'cintamani', '#4a1e24', '#6a2e34', 44); ctx.fillRect(-80, -80, W + 160, 1240); { const g = ctx.createRadialGradient(W / 2, 520, 40, W / 2, 520, 620); g.addColorStop(0, 'rgba(255,230,170,0.35)'); g.addColorStop(1, 'rgba(255,230,170,0)'); ctx.fillStyle = g; ctx.fillRect(-80, -80, W + 160, 1240); }
      // the disc beside a half dollar, a gold rule showing they match
      k.idTag(ctx, 320, 560, 4.0, { shape: 'disc', lines: DISC, k: tween(u, st - 0.1, de + 0.4), chain: false });
      const c = pop(u, ha - 0.3, 0.4);
      if (c > 0) { k.coin(ctx, 780, 560, 184 * c, 0, '½ $'); }
      const r = tween(u, ha + 0.2, st);
      if (r > 0) { for (const y of [376, 744]) { ctx.save(); ctx.setLineDash([10, 8]); ctx.beginPath(); ctx.moveTo(320, y); ctx.lineTo(lerp(320, 780, r), y); k.stroke(ctx, P.gold, 4); ctx.restore(); } }
      // the stamp: a die strikes the letters in
      if (u > st - 0.2 && u < de + 0.6) { const hit = ((u - st) * 6) % 1; k.rect(ctx, 270, 190 - Math.abs(Math.sin(hit * Math.PI)) * 50, 100, 120, P.steel, P.ink, 2.5); k.rect(ctx, 300, 120 - Math.abs(Math.sin(hit * Math.PI)) * 50, 40, 80, P.brown, P.ink, 2); }
      callout(ctx, k, P, 'NAME · RANK · COMPANY', 320, 520, 320, 900, tween(u, de - 0.3, de + 0.2));
      callout(ctx, k, P, 'ALUMINUM', 430, 660, 760, 900, tween(u, de, de + 0.4));
    },
  },
  { // 39.4 "In 1916, they add a second tag."
    start: 39.2, title: 'A Second Tag · 1916', trans: 'ink',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const yr = S.at('1916,'), se = S.at('second'), tg = S.at('tag.');
      S.cam(lerp(1.0, 1.3, tween(u, se - 0.4, tg + 0.6, ease.inOut)), 560, lerp(600, 520, tween(u, se, tg)));
      camp(ctx, S, false);
      for (let i = 0; i < 5; i++) k.figure(ctx, 560 + i * 110, 900 + (i % 2) * 10, { ...DOUGHBOY(i + 2), s: 0.55, face: -1, mood: 'calm', ...act('rest', u) });
      k.seal(ctx, 160, 150, 62, ' THE YEAR · 1916 ·', '1916', tween(u, yr - 0.1, yr + 0.3, ease.linear));
      k.figure(ctx, 330, 1010, { ...DOUGHBOY(0), s: 1.3, face: 1, mood: 'calm', armF: [0.4, 0.2] });
      k.circle(ctx, 660, 600, 150, 'rgba(247,238,214,0.92)', P.goldDark, 4); k.idTag(ctx, 640, 600, 1.8, { shape: 'disc', lines: DISC, chain: true });
      const t2 = pop(u, se - 0.2, 0.45);
      if (t2 > 0) { ctx.save(); ctx.translate(700, 700); ctx.scale(t2, t2); k.idTag(ctx, 0, 0, 1.8, { shape: 'disc', lines: DISC, chain: false, rot: 0.15 }); ctx.restore(); ctx.beginPath(); ctx.moveTo(640, 520); ctx.quadraticCurveTo(720, 560, 700, 620); k.stroke(ctx, '#8a8a8a', 3); }
    },
  },
  { // 42.6 "One stays with the soldier, one goes to the records."
    start: 42.5, title: 'One Stays, One Goes', trans: 'page',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const st = S.at('stays'), go = S.at('goes'), re = S.at('records.');
      S.cam(1.05, lerp(380, 640, tween(u, go - 0.3, re + 0.4, ease.inOut)), 600);
      ctx.fillStyle = '#efe3c6'; ctx.fillRect(-80, -80, W + 160, 1240);
      // left page: the soldier keeps one; right page: the register files the other
      ctx.beginPath(); ctx.moveTo(W / 2, 80); ctx.lineTo(W / 2, 1040); k.stroke(ctx, RED, 3);
      k.figure(ctx, 230, 1010, { ...DOUGHBOY(1), s: 1.2, face: 1, mood: 'calm', armF: [1.2, 1.6] });
      k.idTag(ctx, 270, 690, 0.9, { shape: 'disc', lines: DISC, chain: false });
      const fly = tween(u, go - 0.2, re + 0.3, ease.inOut);
      k.archiveDrawer(ctx, 800, 760, 220, tween(u, go, re + 0.4));
      if (fly < 1) k.idTag(ctx, lerp(330, 800, fly), lerp(690, 700, fly) - Math.sin(fly * Math.PI) * 260, 0.9, { shape: 'disc', lines: DISC, chain: false, rot: fly * 6 });
      // the register's line for him is written in red and black
      ctx.fillStyle = INK; ctx.font = '600 26px GaramondItalic'; ctx.textAlign = 'left';
      const line = 'Hale, Thomas · Pvt · Co. B';
      ctx.fillText(line.slice(0, Math.ceil(line.length * tween(u, re - 0.2, re + 0.8))), 600, 420);
      ctx.strokeStyle = 'rgba(70,90,120,0.3)'; for (let y = 360; y < 560; y += 40) { ctx.beginPath(); ctx.moveTo(580, y); ctx.lineTo(1020, y); ctx.stroke(); }
    },
  },
  { // 46.5 "A homemade paper note became a tradition every soldier wears."
    start: 46.3, title: 'A Tradition', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const ho = S.at('homemade'), be = S.at('became'), tr = S.at('tradition'), ev = S.at('every');
      S.cam(lerp(1.3, 1.0, tween(u, be - 0.3, tr + 0.8, ease.inOut)), W / 2, lerp(460, 620, tween(u, be, tr + 0.8)));
      k.goldSky(ctx, -80, -80, W + 160, 1240, S.t);
      ctx.save(); ctx.globalAlpha = 0.4 * tween(u, be, tr); for (let i = 0; i < 16; i++) { const a = i / 16 * TAU + S.t * 0.08; ctx.beginPath(); ctx.moveTo(W / 2, 440); ctx.lineTo(W / 2 + Math.cos(a) * 900, 440 + Math.sin(a) * 900); k.stroke(ctx, P.goldLight, 16); } ctx.restore();
      ctx.fillStyle = P.sage; ctx.fillRect(-80, 880, W + 160, 400);
      // plant and pay-off: the paper note folds into a modern tag
      const m = tween(u, be - 0.2, tr, ease.inOut);
      ctx.save(); ctx.globalAlpha = 1 - m; k.idTag(ctx, W / 2, 420, 2.2, { shape: 'note', lines: NOTE, rot: -0.05 }); ctx.restore();
      ctx.save(); ctx.globalAlpha = m; k.idTag(ctx, W / 2, 440, 2.0, { shape: 'modern', lines: ['HALE', 'THOMAS', 'O POS'] }); ctx.restore();
      // soldiers of three centuries, each with their tags
      const ROW = [UNION(0), DOUGHBOY(1), { robe: '#5a6a4a', robeP: 'dots', robePc: '#4a5a3a', inner: '#6a7a5a', sash: '#3a3a2a', hat: 'cap', hatColor: '#5a6a4a', skin: SKINS[2] }, { robe: '#7a7a5a', robeP: 'dots', robePc: '#6a6a4a', inner: '#8a8a6a', sash: '#3a3a2a', hat: 'cap', hatColor: '#6a6a4a', skin: SKINS[4] }];
      ROW.forEach((L, i) => { const a = tween(u, ev - 0.6 + i * 0.2, ev - 0.2 + i * 0.2); if (a > 0) { k.figure(ctx, 170 + i * 250, 1010, { ...L, s: 1.0 * a, face: 1, mood: 'calm', armF: [0.3, 0.2] }); k.idTag(ctx, 182 + i * 250, 1010 - 190 * a, 0.25 * a, { shape: i ? 'modern' : 'disc', chain: false }); } });
    },
  },
  { // 52.3 "Every legend has a beginning."
    start: 52.1, title: 'Every Legend Has a Beginning', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S, beg = S.at('beginning.');
      ctx.save(); S.cam(lerp(1.0, 1.5, tween(u, 0, beg)), W / 2, 420);
      ctx.fillStyle = '#4a1e24'; ctx.fillRect(-80, -80, W + 160, 1240); ctx.fillStyle = k.pattern(ctx, 'cintamani', '#4a1e24', '#6a2e34', 44); ctx.fillRect(-80, -80, W + 160, 1240); { const g = ctx.createRadialGradient(W / 2, 520, 40, W / 2, 520, 620); g.addColorStop(0, 'rgba(255,230,170,0.35)'); g.addColorStop(1, 'rgba(255,230,170,0)'); ctx.fillStyle = g; ctx.fillRect(-80, -80, W + 160, 1240); }

      k.idTag(ctx, W / 2, 440, 2.0, { shape: 'modern', lines: ['HALE', 'THOMAS', 'O POS'], rot: Math.sin(u * 2) * 0.08 });
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
  ...scenes.slice(1).map(s => ({ t: s.start - 0.05, type: s.trans === 'cut' ? 'pop' : 'paper', gain: 0.3 })),
  { t: 0.5, type: 'clank', gain: 0.3, pitch: 1.6 }, { t: 1.9, type: 'whoosh', gain: 0.35 }, { t: 2.8, type: 'paper', gain: 0.45 },
  { t: 4.0, type: 'stamp', gain: 0.45 },
  { t: 9.9, type: 'paper', gain: 0.4 }, { t: 11.4, type: 'pluck', gain: 0.35 }, { t: 12.2, type: 'pop', gain: 0.35 },
  { t: 13.3, type: 'wind', gain: 0.5 },
  { t: 17.3, type: 'clank', gain: 0.3, pitch: 1.4 }, { t: 19.6, type: 'coins', gain: 0.45 },
  { t: 21.6, type: 'stamp', gain: 0.4 }, { t: 24.3, type: 'pop', gain: 0.4 }, { t: 25.4, type: 'coins', gain: 0.25 },
  { t: 27.9, type: 'thud', gain: 0.8 }, { t: 28.4, type: 'clank', gain: 0.3, pitch: 1.5 }, { t: 28.8, type: 'clank', gain: 0.25, pitch: 1.5 },
  { t: 30.5, type: 'stamp', gain: 0.5 }, { t: 31.2, type: 'paper', gain: 0.4 }, { t: 33.4, type: 'chime', gain: 0.5, pitch: 1.3 },
  { t: 35.5, type: 'coins', gain: 0.3 }, ...Array.from({ length: 7 }, (_, i) => ({ t: +(35.9 + i * 0.17).toFixed(2), type: 'clank', gain: 0.35, pitch: 1.2 })),
  { t: 39.5, type: 'stamp', gain: 0.45 }, { t: 41.2, type: 'clank', gain: 0.4, pitch: 1.6 },
  { t: 44.4, type: 'whoosh', gain: 0.4 }, { t: 45.2, type: 'thud', gain: 0.45 },
  { t: 48.1, type: 'chime', gain: 0.45 }, { t: 49.4, type: 'riser', gain: 0.35 },
  { t: 53.66, type: 'pop', gain: 0.8 }, { t: 53.7, type: 'gong', gain: 0.9 },
];

export const music = {
  bpm: 90, root: 'C', maqam: 'nihavend', gain: 0.3,
  sections: [
    { from: 0, to: 3.8, mood: 'intro' },
    { from: 3.8, to: 16.2, mood: 'sad' },
    { from: 16.2, to: 29.6, mood: 'groove' },
    { from: 29.6, to: 46.3, mood: 'drive' },
    { from: 46.3, to: 53.66, mood: 'triumph' },
    { from: 53.66, to: 56.6, mood: 'end' },
  ],
};
