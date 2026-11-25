// "The Cloth Merchant Who Saw Bacteria" — Antonie van Leeuwenhoek, told
// through his letters (`letters` device): the story opens and closes on his
// pages to the Royal Society, and the envelopes stack up across the sea for
// fifty years. The recurring object is his own microscope — a small brass
// plate with one bead of a lens — and the round view through it, where the
// "little animals" swim. The teeth-scraping is kept small and tidy: a pin
// and a dab of plaque on a slide, never a mouth close-up.
import { clamp, lerp, ease, tween, rng, TAU } from '../../lib/core.mjs';
import { interior, bookCover } from '../../styles/ottoman/scenes.mjs';
import { act } from '../../styles/ottoman/acting.mjs';

export const meta = {
  title: 'The Cloth Merchant Who Saw Bacteria',
  slug: 'leeuwenhoek-ottoman',
  style: 'ottoman',
  look: 'album',    // album (after karagoz, classic, scroll)
  ambient: 'bubbles',
  room: 'lattice',
  device: 'letters',
  width: 1080, height: 1920, fps: 30,
  duration: 40.0,
  voice: 'voice.mp3',
  seed: 1683,
  captionChars: 30,
  brand: { handle: '@HOWITSTARTED-YT1', logo: '../../../brand/logo.png' },
  outro: { at: 38.4, text: 'Subscribe for more origin stories' },
};

const LEEUW = { robe: '#2a2a2a', inner: '#efefef', sash: '#2a2a2a', hat: 'longhair', hair: '#6a5038', mustache: true, mustacheColor: '#5a4030', skin: '#f1d1a8' };
const DUTCH = i => ({ robe: ['#3a3a4a', '#6a3a2a', '#2f4f6a', '#4a3a2a'][i % 4], inner: '#efefef', sash: '#1a1a1a', hat: ['cap', 'bun', 'shorthair', 'cap'][i % 4], hatColor: '#1a1a1a', hair: '#5a3a2a', skin: ['#f1d1a8', '#e8c49a', '#f1d1a8', '#e2b48a'][i % 4] });

// ---------- the recurring object: his microscope and the round view through it ----------
function scope(ctx, S, x, y, s = 1, rot = 0) {
  const { k, P } = S;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-50, -110); ctx.quadraticCurveTo(0, -130, 50, -110); ctx.lineTo(50, 110); ctx.quadraticCurveTo(0, 124, -50, 110); ctx.closePath(); k.fillStroke(ctx, '#c9a24a', P.ink, 3);
  for (const [cx, cy] of [[-34, -96], [34, -96], [-34, 96], [34, 96], [0, 40]]) k.circle(ctx, cx, cy, 5, '#8a6a24', P.ink, 1);
  k.circle(ctx, 0, -50, 16, '#8a6a24', P.ink, 2); k.circle(ctx, 0, -50, 6, '#e8f6ff', P.ink, 1.5); // the bead lens
  k.rect(ctx, 46, -64, 34, 12, '#9a9a9a', P.ink, 1.5); k.circle(ctx, 86, -58, 8, '#9a9a9a', P.ink, 1.5); // the specimen pin
  k.rect(ctx, -6, 110, 12, 90, '#9a9a9a', P.ink, 1.5); k.circle(ctx, 0, 206, 14, '#c9a24a', P.ink, 2); // the focusing screw
  ctx.restore();
}
function critter(ctx, S, x, y, s, t, kind, hue) {
  const { k, P } = S;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (kind === 'rod') { ctx.rotate(t * 0.3); k.rect(ctx, -18, -6, 36, 12, hue, P.ink, 1.5); }
  else if (kind === 'spiral') { ctx.beginPath(); for (let i = 0; i <= 20; i++) { const q = i / 20; ctx.lineTo(-30 + q * 60, Math.sin(q * TAU * 2 + t * 6) * 8); } k.stroke(ctx, P.ink, 6); k.stroke(ctx, hue, 3); }
  else { // an animalcule: a little oval with a beating tail
    ctx.rotate(Math.sin(t * 0.7) * 0.6);
    ctx.beginPath(); ctx.moveTo(-22, 0); for (let i = 0; i <= 8; i++) ctx.lineTo(-22 - i * 6, Math.sin(t * 10 + i) * 6 * (i / 8)); k.stroke(ctx, P.ink, 3);
    k.ellipse(ctx, 0, 0, 24, 14, 0, hue, P.ink, 2); k.circle(ctx, 6, -2, 4, 'rgba(255,255,255,0.8)', null);
  }
  ctx.restore();
}
function view(ctx, S, x, y, r, a, kind, n = 12, t = 0, seed = 2) {
  if (a <= 0) return;
  const { k, P } = S, R = rng(seed);
  ctx.save(); ctx.globalAlpha *= clamp(a);
  ctx.beginPath(); ctx.arc(x, y, r + 16, 0, TAU); k.fillStroke(ctx, '#c9a24a', P.ink, 4);
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.clip();
  const g = ctx.createRadialGradient(x, y, 10, x, y, r); g.addColorStop(0, '#f2fbff'); g.addColorStop(1, '#b8d8e6'); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
  for (let i = 0; i < n; i++) {
    const ph = i * 2.39996 + seed, sp = 0.15 + R() * 0.3, rr = r * 0.82 * Math.sqrt((i + 0.5) / n);
    const kd = kind === 'mix' ? ['rod', 'spiral', 'rod', 'blob'][i % 4] : kind;
    critter(ctx, S, x + Math.cos(ph + t * sp) * rr, y + Math.sin(ph + t * sp) * rr, 0.6 + R() * 0.7 * (r / 300), t + i, kd, ['#9ad08a', '#e0b860', '#c88ac0', '#8ac0e0'][i % 4]);
  }
  ctx.restore(); ctx.restore();
}
function letterStack(ctx, S, x, y, n) {
  const { k } = S;
  for (let i = 0; i < n; i++) k.envelope(ctx, x + Math.sin(i * 1.7) * 8, y - i * 10, 1.1, Math.sin(i * 2.3) * 0.06, i % 2 ? '#9a2a1e' : '#c4371f');
}

export const scenes = [
  { // 0.0 "The first person to see bacteria wasn't a scientist."
    start: 0, title: 'Not a Scientist',
    draw(ctx, u, S) {
      const { k, P, W } = S, se = S.at('see'), ba = S.at('bacteria'), sc = S.at('scientist.');
      const pull = tween(u, sc - 0.8, sc + 0.4, ease.inOut);
      S.cam(lerp(1.12, 1.0, pull), W / 2, lerp(560, 660, pull));
      interior(ctx, S, { arches: 3, carpetColor: '#2f4f6a' });
      // a bolt of cloth on the counter: he is a draper, not a professor
      k.rect(ctx, 520, 820, 460, 60, '#7a5a3a', P.ink, 2.5); for (let i = 0; i < 3; i++) k.rect(ctx, 560 + i * 130, 720, 110, 100, ['#9a2a1e', '#2f5f8a', '#c9a227'][i], P.ink, 2);
      k.figure(ctx, 330, 1010, { ...LEEUW, s: 0.95, face: 1, mood: 'happy', ...act('present', u, tween(u, sc - 0.4, sc + 0.2)) });
      // the round view opens big first, then shrinks back to his little microscope
      const vr = lerp(330, 0, pull); view(ctx, S, lerp(W / 2, 420, pull), lerp(520, 600, pull), vr, tween(u, se - 0.4, se) * (1 - pull * 0.8), 'mix', 16, S.t, 3);
      if (pull > 0.4) scope(ctx, S, 440, 640, 0.55, -0.2);
      k.label(ctx, 'A CLOTH MERCHANT', 330, 1080, 18, tween(u, sc, sc + 0.4));
    },
  },
  { // 4.6 "1670s, Delft, Netherlands."
    start: 4.3, title: 'Delft, 1670s', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W } = S, de = S.at('Delft,'), ne = S.at('Netherlands.');
      S.cam(lerp(1.15, 1.0, tween(u, 0, ne + 0.5, ease.inOut)), lerp(380, W / 2, tween(u, 0, ne + 0.5)), 620);
      ctx.fillStyle = '#dfe6ec'; ctx.fillRect(-300, -300, W + 600, 1800);
      k.cloud(ctx, 260 + S.t * 8, 240, 1.1); k.cloud(ctx, 780 + S.t * 5, 320, 0.8, 3);
      k.windmill(ctx, 900, 720, 0.8, S.t);
      for (let i = 0; i < 6; i++) k.gableHouse(ctx, 90 + i * 150, 820, 140, 240 + (i * 37) % 80, ['#c4683a', '#9a4a2a', '#d8b48a', '#b85a3a', '#e0c49a', '#a8522e'][i]);
      k.rect(ctx, -300, 820, W + 600, 30, '#8a8a8a', P.ink, 2);
      k.waves(ctx, -300, 850, W + 600, 400, S.t, '#4f7fa8', '#6f9cc0', 14, 26);
      k.label(ctx, 'DELFT, THE NETHERLANDS', W / 2, 1080, 18, tween(u, de, de + 0.4));
      k.seal(ctx, 160, 260, 66, ' DELFT · 1670s ·', '1670s', tween(u, 0, 0.6, ease.linear));
    },
  },
  { // 8.4 "Antonie van Leeuwenhoek works in the cloth trade."
    start: 8.1, title: 'A Draper in Delft', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, an = S.at('Antonie'), cl = S.at('cloth');
      S.cam(lerp(1.0, 1.15, tween(u, 0, 3.2)), lerp(W / 2, 460, tween(u, 0, 3.2)), 680);
      interior(ctx, S, { arches: 3, carpetColor: '#6a3a2a' });
      // shelves of cloth bolts
      for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) k.rect(ctx, 560 + c * 110, 300 + r * 130, 96, 110, ['#9a2a1e', '#2f5f8a', '#c9a227', '#3d6a4a', '#7a2a5a', '#efe6cf'][(r * 4 + c) % 6], P.ink, 2);
      k.figure(ctx, 330, 1010, { ...LEEUW, s: 0.95, face: 1, mood: 'calm', armF: [1.1, 0.4], hold: c => { c.rotate(0.6); k.magnifier(c, 0, -40, 26, 0.2); } });
      for (let i = 0; i < 2; i++) { const q = tween(u, cl - 0.4 + i * 0.2, cl + i * 0.2); if (q > 0) { ctx.save(); ctx.globalAlpha = q; k.figure(ctx, 700 + i * 170, 1010, { ...DUTCH(i), s: 0.8, face: -1, mood: 'happy', armF: [0.6, 0.3] }); ctx.restore(); } }
      k.label(ctx, 'ANTONIE VAN LEEUWENHOEK', 330, 1080, 16, tween(u, an + 0.3, an + 0.8));
      k.label(ctx, 'HE CHECKED THREAD WITH A LENS', 700, 260, 15, tween(u, cl + 0.2, cl + 0.6));
    },
  },
  { // 11.6 "He grinds his own tiny glass lenses and builds simple microscopes."
    start: 11.4, title: 'One Tiny Lens', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S, gr = S.at('grinds'), le = S.at('lenses'), bu = S.at('builds'), mi = S.at('microscopes.');
      S.cam(lerp(1.0, 1.3, tween(u, bu - 0.3, mi + 0.4, ease.inOut)), lerp(W / 2, 620, tween(u, bu - 0.3, mi + 0.4)), lerp(640, 600, tween(u, bu - 0.3, mi + 0.4)));
      ctx.fillStyle = '#5a3a24'; ctx.fillRect(-300, -300, W + 600, 1800);
      k.rect(ctx, -300, 760, W + 600, 900, '#8a6a44', P.ink, 3);
      k.candle(ctx, 150, 760, 1.2, S.t);
      // a glass bead is ground smooth, sparkling, then set into the brass plate
      const g = tween(u, gr - 0.2, le + 0.4);
      ctx.save(); ctx.translate(420, 700); ctx.rotate(S.t * 4 * (g < 1 ? 1 : 0)); k.circle(ctx, 0, 0, 44, '#9a9a9a', P.ink, 2.5); ctx.restore();
      const bx = lerp(420, 620, tween(u, bu - 0.3, bu + 0.4, ease.inOut)), by = lerp(650, 520, tween(u, bu - 0.3, bu + 0.4, ease.inOut));
      if (u < bu + 0.4) { k.circle(ctx, bx, by, 12, '#e8f6ff', P.ink, 2); ctx.save(); ctx.globalAlpha = 0.5 + 0.5 * Math.sin(S.t * 8); ctx.beginPath(); ctx.moveTo(bx - 20, by); ctx.lineTo(bx + 20, by); ctx.moveTo(bx, by - 20); ctx.lineTo(bx, by + 20); k.stroke(ctx, '#ffffff', 3); ctx.restore(); }
      const sp = tween(u, bu - 0.2, bu + 0.4, ease.outBack); if (sp > 0) scope(ctx, S, 620, 570, 1.1 * sp, -0.08);
      k.label(ctx, 'ONE TINY LENS · ABOUT 2 INCHES TALL', 620, 870, 15, tween(u, mi, mi + 0.4));
    },
  },
  { // 16.3 "In water, he sees tiny moving creatures. He calls them animalcules, little animals."
    start: 16.1, title: 'Little Animals', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, wa = S.at('water,'), mo = S.at('moving'), an = S.at('animalcules,'), li = S.at('little');
      const dive = tween(u, wa - 0.3, mo + 0.3, ease.inOut);
      S.cam(lerp(1.0, 1.08, tween(u, an - 0.5, li + 0.8)), W / 2, 620);
      ctx.fillStyle = '#2a3a4a'; ctx.fillRect(-300, -300, W + 600, 1800);
      // a drop of water on the pin, then the view through the lens
      if (dive < 1) { ctx.save(); ctx.globalAlpha = 1 - dive; scope(ctx, S, 400, 620, 1.3, 0); ctx.beginPath(); ctx.ellipse(520, 545, 22, 26, 0, 0, TAU); k.fillStroke(ctx, 'rgba(160,210,240,0.9)', P.ink, 2); ctx.restore(); }
      view(ctx, S, W / 2, 600, 400, dive, 'blob', 14, S.t, 5);
      const nm = tween(u, an - 0.2, an + 0.3, ease.outBack);
      if (nm > 0) { ctx.save(); ctx.translate(W / 2, 1000); ctx.scale(nm, nm); k.cartouche(ctx, 0, 0, 520, 80, P.paperLight, P.goldDark, 3); ctx.fillStyle = P.vermDark; ctx.font = '900 46px Deco'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('ANIMALCULES', 0, 2); ctx.restore(); ctx.textBaseline = 'alphabetic'; }
      k.label(ctx, '= “LITTLE ANIMALS”', W / 2, 1075, 16, tween(u, li, li + 0.4));
    },
  },
  { // 23.6 "In 1683, he scrapes the plaque from his own teeth and finds it full of them."
    start: 23.3, title: 'His Own Teeth, 1683', trans: 'page',
    draw(ctx, u, S) {
      const { k, P, W } = S, yr = S.at('1683,'), sc = S.at('scrapes'), te = S.at('teeth'), fu = S.at('full');
      S.cam(lerp(1.0, 1.12, tween(u, fu - 0.6, fu + 0.6, ease.inOut)), lerp(W / 2, 640, tween(u, fu - 0.6, fu + 0.6)), 640);
      interior(ctx, S, { arches: 3, carpetColor: '#3d6a4a' });
      k.figure(ctx, 280, 1010, { ...LEEUW, s: 0.95, face: 1, mood: u > fu ? 'wow' : 'calm', armF: [lerp(0.6, 1.9, tween(u, sc - 0.3, sc + 0.2)) - tween(u, te, te + 0.6) * 1.0, 0.5] });
      // the slide with a little dab of white, under the lens
      const sl = tween(u, te, te + 0.6, ease.inOut);
      if (sl > 0) { k.rect(ctx, 430, 840, 160, 40, 'rgba(220,240,250,0.9)', P.ink, 2); k.circle(ctx, 510, 860, 10 * sl, '#f6f0e0', P.ink, 1.5); }
      view(ctx, S, 720, 520, 260, tween(u, fu - 0.5, fu + 0.1), 'mix', 26, S.t, 9);
      k.seal(ctx, 860, 880, 66, ' THE YEAR · 1683 ·', '1683', tween(u, yr - 0.1, yr + 0.5, ease.linear));
      k.label(ctx, 'PLAQUE, SEEN UP CLOSE', 720, 820, 15, tween(u, fu, fu + 0.4));
    },
  },
  { // 29.4 "He mails his discoveries to London's Royal Society, letter after letter, for 50 years."
    start: 29.1, title: 'Letter After Letter', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, ma = S.at('mails'), lo = S.at("London's"), le = S.at('letter'), fi = S.at('50');
      S.cam(lerp(1.0, 1.05, tween(u, 0, 5.0)), W / 2, 640);
      ctx.fillStyle = '#dfe6ec'; ctx.fillRect(-300, -300, W + 600, 1800);
      k.waves(ctx, -300, 300, W + 600, 1200, S.t, '#4f7fa8', '#6f9cc0', 14, 26);
      // London on the upper-left shore, Delft on the lower-right; envelopes fly across the sea
      k.rect(ctx, -300, 180, 760, 300, '#c9b07a', P.ink, 2.5); k.rect(ctx, 620, 800, 700, 500, '#c9b07a', P.ink, 2.5);
      for (let i = 0; i < 3; i++) k.gableHouse(ctx, 700 + i * 110, 840, 100, 150, ['#c4683a', '#d8b48a', '#9a4a2a'][i]);
      k.rect(ctx, 120, 230, 220, 150, '#e9dcc0', P.ink, 2.5); k.poly(ctx, [[110, 230], [230, 170], [350, 230]], '#b8a88a', P.ink, 2.5);
      ctx.fillStyle = P.ink; ctx.font = '900 34px Deco'; ctx.textAlign = 'center'; ctx.fillText('DELFT', 830, 900); ctx.fillText('LONDON', 230, 430);
      const flow = tween(u, ma - 0.2, 5.4, ease.linear);
      for (let i = 0; i < 8; i++) { const q = ((S.t * 0.5 + i / 8) % 1); if (flow > i / 8) k.envelope(ctx, lerp(800, 430, q), lerp(760, 300, q) - Math.sin(q * Math.PI) * 120, 0.7, Math.sin(q * 6) * 0.2); }
      letterStack(ctx, S, 430, 340, Math.floor(tween(u, le - 0.3, fi + 0.4) * 14));
      k.label(ctx, 'THE ROYAL SOCIETY', 230, 470, 15, tween(u, lo, lo + 0.4));
      const yr = Math.round(lerp(1673, 1723, tween(u, le - 0.3, fi + 0.6, ease.linear)));
      if (u > le - 0.3) { k.cartouche(ctx, 300, 1000, 300, 80, P.paperLight, P.goldDark, 3); ctx.fillStyle = P.vermDark; ctx.font = '900 44px Deco'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(yr), 300, 1002); ctx.textBaseline = 'alphabetic'; }
    },
  },
  { // 36.3 "Every legend has a beginning."
    start: 36.0, title: 'Every Legend Has a Beginning', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S, beg = S.at('beginning.');
      ctx.save(); S.cam(lerp(1.0, 1.35, tween(u, 0, beg)), W / 2, 640);
      ctx.fillStyle = '#5a3a24'; ctx.fillRect(-300, -300, W + 600, 1800);
      k.letter(ctx, 420, 640, 420, 540, ['Honoured Sirs,', 'In water I saw', 'little animals…'], 1, -0.05);
      scope(ctx, S, 760, 600, 1.0, 0.1); k.quill(ctx, 300, 820, 1.0, -0.4);
      ctx.restore();
      const open = tween(u, beg - 0.1, beg + 0.55, ease.inOut);
      if (open > 0) {
        ctx.save(); ctx.beginPath(); ctx.arc(W / 2, 600, open * 900, 0, TAU); ctx.clip(); bookCover(ctx, S, u - beg); ctx.restore();
        if (open < 1) { ctx.beginPath(); ctx.arc(W / 2, 600, open * 900, 0, TAU); k.stroke(ctx, P.goldLight, 8); }
      }
    },
  },
];

// ---------- sound ----------
export const sfx = [
  ...scenes.slice(1).map(s => ({ t: s.start - 0.05, type: s.trans === 'cut' ? 'pop' : 'paper', gain: 0.28 })),
  { t: 1.3, type: 'drip', gain: 0.3 }, { t: 3.2, type: 'pluck', gain: 0.3 },
  { t: 4.6, type: 'gong', gain: 0.3 }, { t: 7.0, type: 'splash', gain: 0.2 },
  { t: 10.3, type: 'paper', gain: 0.3 },
  { t: 12.0, type: 'sizzle', gain: 0.2 }, { t: 14.2, type: 'chime', gain: 0.4, pitch: 1.3 },
  { t: 16.5, type: 'drip', gain: 0.35 }, { t: 18.3, type: 'pop', gain: 0.25, pitch: 1.6 }, { t: 18.8, type: 'pop', gain: 0.25, pitch: 1.8 }, { t: 20.7, type: 'chime', gain: 0.45, pitch: 1.2 },
  { t: 23.6, type: 'stamp', gain: 0.35 }, { t: 28.0, type: 'riser', gain: 0.3 },
  ...Array.from({ length: 6 }, (_, i) => ({ t: +(30.0 + i * 0.8).toFixed(2), type: 'paper', gain: 0.18 })),
  { t: 34.9, type: 'chime', gain: 0.4, pitch: 1.4 },
];

export const music = {
  bpm: 92, root: 'E', maqam: 'hicaz', gain: 0.26,
  sections: [
    { from: 0, to: 4.3, mood: 'intro' },
    { from: 4.3, to: 16.1, mood: 'groove' },
    { from: 16.1, to: 23.3, mood: 'drive' },
    { from: 23.3, to: 29.1, mood: 'groove' },
    { from: 29.1, to: 38.4, mood: 'triumph' },
    { from: 38.4, to: 40.0, mood: 'end' },
  ],
};
