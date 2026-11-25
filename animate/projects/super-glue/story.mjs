// "The Glue That Failed First" — super glue (cyanoacrylate), told as a page
// from a Book of Wonders (`marvels` device): gold callouts name each part,
// astonished onlookers gather, and one clear drop of glue keeps coming back —
// it grabs everything in 1942, seals two costly prisms in 1951, and ends up
// in a little bottle in 1958. No company logos are drawn; the 1958 bottle
// shows only the product name it was sold under. "Super Glue" is used here as
// the everyday word for the adhesive.
import { clamp, lerp, ease, tween, rng, TAU } from '../../lib/core.mjs';
import { interior, bookCover } from '../../styles/ottoman/scenes.mjs';
import { act } from '../../styles/ottoman/acting.mjs';

export const meta = {
  title: 'The Glue That Failed First',
  slug: 'super-glue-ottoman',
  style: 'ottoman',
  look: 'tile',     // tiled frame (after album, karagoz, classic)
  ambient: 'dust',
  room: 'arches',
  device: 'marvels',
  width: 1080, height: 1920, fps: 30,
  duration: 38.0,
  voice: 'voice.mp3',
  seed: 1942,
  captionChars: 30,
  brand: { handle: '@HOWITSTARTED-YT1', logo: '../../../brand/logo.png' },
  outro: { at: 36.4, text: 'Subscribe for more origin stories' },
};

const COOVER = { robe: '#efefef', inner: '#3a4a6a', sash: '#efefef', hat: 'shorthair', hair: '#3a2a1a', glasses: true, skin: '#f1d1a8' };
const JOYNER = { robe: '#efefef', inner: '#6a3a2a', sash: '#efefef', hat: 'shorthair', hair: '#8a5a2a', skin: '#f1d1a8' };
const ONLOOK = i => ({ robe: ['#2f5f8a', '#9a2a1e', '#3d6a4a', '#c9a227'][i % 4], inner: '#efe6cf', sash: '#3a2a1a', hat: ['fedora', 'bun', 'shorthair', 'cap'][i % 4], hatColor: '#3a3a4a', hair: '#5a3a2a', skin: ['#f1d1a8', '#c99a6e', '#e2b48a', '#8a5a3c'][i % 4] });

function callout(ctx, S, text, px, py, lx, ly, a, size = 18) {
  if (a <= 0) return;
  const { k, P } = S;
  ctx.save(); ctx.globalAlpha *= clamp(a);
  ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(lx, ly); k.stroke(ctx, P.ink, 4); k.stroke(ctx, P.gold, 2.5);
  k.circle(ctx, px, py, 7, P.verm, P.ink, 1.5);
  ctx.restore();
  k.label(ctx, text, lx, ly, size, a);
}
// the recurring object: one clear, glossy drop of glue
function drop(ctx, S, x, y, r, t = 0) {
  const { k, P } = S;
  ctx.beginPath(); ctx.moveTo(x, y - r * 1.4); ctx.bezierCurveTo(x + r * 1.1, y - r * 0.4, x + r, y + r, x, y + r); ctx.bezierCurveTo(x - r, y + r, x - r * 1.1, y - r * 0.4, x, y - r * 1.4); k.fillStroke(ctx, 'rgba(215,235,245,0.85)', P.ink, 2.5);
  ctx.beginPath(); ctx.ellipse(x - r * 0.35, y - r * 0.1, r * 0.18, r * 0.35, -0.3, 0, TAU); ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fill();
  ctx.save(); ctx.globalAlpha = 0.4 + 0.3 * Math.sin(t * 3); k.circle(ctx, x + r * 0.3, y + r * 0.4, r * 0.08, '#ffffff', null); ctx.restore();
}
function bottle(ctx, S, x, y, s, name) {
  const { k, P } = S;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  k.rect(ctx, -50, -150, 100, 150, 'rgba(220,235,240,0.8)', P.ink, 3); k.rect(ctx, -22, -196, 44, 48, '#9a2a1e', P.ink, 2.5); k.poly(ctx, [[-10, -196], [0, -240], [10, -196]], '#9a2a1e', P.ink, 2);
  k.rect(ctx, -46, -110, 92, 70, '#efe6cf', P.ink, 2);
  if (name) { ctx.fillStyle = P.ink; ctx.textAlign = 'center'; ctx.font = '900 20px Deco'; ctx.fillText(name[0], 0, -82); ctx.font = '900 28px Deco'; ctx.fillText(name[1], 0, -52); }
  ctx.restore();
}
function gunsight(ctx, S, x, y, r, a = 1) {
  if (a <= 0) return;
  const { k, P } = S;
  ctx.save(); ctx.globalAlpha *= clamp(a);
  k.circle(ctx, x, y, r + 22, '#5a5a5a', P.ink, 3); k.circle(ctx, x, y, r, 'rgba(225,240,248,0.9)', P.ink, 2.5);
  ctx.beginPath(); ctx.moveTo(x - r, y); ctx.lineTo(x + r, y); ctx.moveTo(x, y - r); ctx.lineTo(x, y + r); k.stroke(ctx, P.ink, 3);
  k.circle(ctx, x, y, r * 0.3, null, P.ink, 2);
  ctx.restore();
}
// a refractometer: a dark body with two hinged glass prisms on top; stuck = glue line glows
function refractometer(ctx, S, x, y, s, gap, stuck, t) {
  const { k, P } = S;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  k.rect(ctx, -60, 0, 120, 220, '#3a3a3a', P.ink, 3); k.rect(ctx, -24, 220, 48, 40, '#5a5a5a', P.ink, 2); k.rect(ctx, -90, 260, 180, 26, '#2a2a2a', P.ink, 2);
  k.rect(ctx, 54, 60, 70, 24, '#5a5a5a', P.ink, 2); k.circle(ctx, 130, 72, 18, '#c9a24a', P.ink, 2); // eyepiece
  k.poly(ctx, [[-70, -6], [70, -6], [50, -60], [-50, -60]], 'rgba(200,230,245,0.9)', P.ink, 2.5); // lower prism
  ctx.save(); ctx.translate(-70, -60 - gap); ctx.rotate(-gap * 0.012);
  k.poly(ctx, [[0, 0], [140, 0], [120, -54], [20, -54]], 'rgba(200,230,245,0.9)', P.ink, 2.5); ctx.restore(); // upper prism
  if (stuck > 0) { ctx.save(); ctx.globalAlpha = stuck * (0.6 + 0.4 * Math.sin(t * 5)); ctx.beginPath(); ctx.moveTo(-52, -60); ctx.lineTo(52, -60); k.stroke(ctx, '#ffe08a', 8); ctx.restore(); }
  ctx.restore();
}

export const scenes = [
  { // 0.2 "Superglue was a failure at first."
    start: 0, title: 'A Failure at First',
    draw(ctx, u, S) {
      const { k, P, W } = S, su = S.at('Superglue'), fa = S.at('failure');
      S.cam(lerp(1.25, 1.0, tween(u, 0, fa + 0.6, ease.inOut)), W / 2, lerp(560, 640, tween(u, 0, fa + 0.6)));
      interior(ctx, S, { arches: 3, carpetColor: '#2f5f8a' });
      k.rect(ctx, 120, 820, 840, 40, '#8a6a44', P.ink, 2.5);
      bottle(ctx, S, 360, 820, 1.0, null);
      const d = tween(u, su, su + 0.8, ease.inOut); drop(ctx, S, 360, lerp(560, 790, d), 22, S.t);
      // a lab report, stamped
      k.rect(ctx, 560, 470, 320, 360, '#fbf4e2', P.ink, 2.5); for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.moveTo(590, 540 + i * 38); ctx.lineTo(850 - (i % 3) * 40, 540 + i * 38); k.stroke(ctx, 'rgba(60,40,20,0.3)', 3); }
      ctx.fillStyle = P.ink; ctx.font = '900 24px Deco'; ctx.textAlign = 'center'; ctx.fillText('LAB REPORT', 720, 510);
      k.stamp(ctx, 'FAILED', 720, 680, 54, tween(u, fa - 0.1, fa + 0.3), -0.2);
    },
  },
  { // 3.5 "1942. World War II."
    start: 3.3, title: '1942', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W } = S, ye = S.at('1942.'), wo = S.at('World');
      S.cam(lerp(1.0, 1.12, tween(u, 0, 3.4)), W / 2, lerp(600, 680, tween(u, 0, 3.4)));
      k.nightSky(ctx, -300, -300, W + 600, 1800, S.t);
      k.searchlights(ctx, 0, 900, W, 900, S.t, 4, tween(u, wo - 0.4, wo + 0.2));
      for (let i = 0; i < 4; i++) k.factory(ctx, 140 + i * 260, 1000, 220, 200 + (i % 2) * 80, S.t, i % 2 === 0);
      ctx.fillStyle = '#1a1a24'; ctx.fillRect(-300, 1000, W + 600, 600);
      k.seal(ctx, W / 2, 420, 90, ' WARTIME · 1942 ·', '1942', tween(u, ye - 0.1, ye + 0.6, ease.linear));
      k.label(ctx, 'LABS ACROSS AMERICA WORK FOR THE WAR', W / 2, 1060, 15, tween(u, wo + 0.2, wo + 0.6));
    },
  },
  { // 7.0 "Chemist Harry Coover at Kodak is trying to make clear plastic for gun sights."
    start: 6.7, title: 'Clear Plastic for Gun Sights', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, ha = S.at('Harry'), ko = S.at('Kodak'), cl = S.at('clear'), gu = S.at('gun');
      S.cam(lerp(1.0, 1.15, tween(u, cl - 0.3, gu + 0.6, ease.inOut)), lerp(W / 2, 620, tween(u, cl - 0.3, gu + 0.6)), lerp(660, 560, tween(u, cl - 0.3, gu + 0.6)));
      interior(ctx, S, { arches: 3, carpetColor: '#6a3a2a' });
      k.rect(ctx, 120, 820, 840, 40, '#8a6a44', P.ink, 2.5);
      k.alembic(ctx, 520, 820, 0.8, S.t, 1, '#d8eef6');
      k.figure(ctx, 260, 1010, { ...COOVER, s: 0.95, face: 1, mood: 'calm', ...act('think', u, tween(u, ha - 0.2, ha + 0.4)) });
      k.label(ctx, 'HARRY COOVER, CHEMIST', 260, 1080, 16, tween(u, ha + 0.2, ha + 0.6));
      k.label(ctx, 'EASTMAN KODAK LABS', 520, 880, 14, tween(u, ko, ko + 0.4));
      const gs = tween(u, gu - 0.4, gu + 0.2, ease.outBack); gunsight(ctx, S, 760, 450, 130 * gs, gs);
      callout(ctx, S, 'MUST BE CRYSTAL CLEAR', 700, 400, 760, 250, tween(u, gu + 0.2, gu + 0.6), 15);
    },
  },
  { // 11.8 "One material sticks to everything it touches. Too sticky. It gets tossed aside."
    start: 11.5, title: 'Sticks to Everything', trans: 'wipe',
    draw(ctx, u, S) {
      const { k, P, W } = S, st = S.at('sticks'), ev = S.at('everything'), to = S.at('Too'), ts = S.at('tossed');
      S.cam(lerp(1.1, 1.0, tween(u, 0, 2.0, ease.inOut)), W / 2, 640);
      // a page of wonders: a clear drop at the centre, everything flies to it and sticks
      ctx.fillStyle = '#efe2c0'; ctx.fillRect(-300, -300, W + 600, 1800);
      k.rect(ctx, 80, 200, 920, 880, null, P.goldDark, 4); k.rect(ctx, 96, 216, 888, 848, null, P.gold, 2);
      const throwK = tween(u, ts - 0.2, ts + 0.8, ease.inOut);
      ctx.save(); ctx.translate(W / 2 + 290 * throwK, 620 + 370 * throwK - Math.sin(throwK * Math.PI) * 300); ctx.rotate(throwK * 2.4); ctx.scale(1 - 0.75 * throwK, 1 - 0.75 * throwK); ctx.translate(-W / 2, -620);
      drop(ctx, S, W / 2, 620, 60, S.t);
      const items = [['TWEEZERS', -220, -200], ['A BEAKER', 230, -170], ['A GLOVE', -230, 200], ['A PENCIL', 220, 210]];
      items.forEach(([nm, dx, dy], i) => {
        const q = tween(u, st - 0.3 + i * 0.35, st + 0.1 + i * 0.35, ease.inOut), x = W / 2 + dx * (1 - q * 0.62), y = 620 + dy * (1 - q * 0.62);
        const wob = q >= 1 ? Math.sin(S.t * 14 + i) * 0.08 : 0;
        ctx.save(); ctx.translate(x, y); ctx.rotate(wob + i);
        if (i === 0) { k.rect(ctx, -6, -70, 12, 70, '#9a9a9a', P.ink, 1.5); k.rect(ctx, 6, -70, 12, 70, '#9a9a9a', P.ink, 1.5); }
        else if (i === 1) { k.rect(ctx, -40, -60, 80, 90, 'rgba(210,235,245,0.8)', P.ink, 2.5); }
        else if (i === 2) { k.ellipse(ctx, 0, 0, 40, 30, 0, '#e8c84a', P.ink, 2); for (let f = 0; f < 4; f++) k.rect(ctx, -30 + f * 18, -60, 14, 34, '#e8c84a', P.ink, 1.5); }
        else { k.rect(ctx, -8, -80, 16, 110, '#e8a83a', P.ink, 1.5); k.poly(ctx, [[-8, 30], [8, 30], [0, 48]], '#2a2a2a', P.ink, 1); }
        ctx.restore();
        if (throwK <= 0) callout(ctx, S, nm, x, y, W / 2 + dx * 1.2, 620 + dy * 1.35, tween(u, ev + i * 0.2, ev + 0.4 + i * 0.2), 15);
      });
      ctx.restore();
      // the reject crate
      k.rect(ctx, 740, 950, 180, 120, '#8a6a44', P.ink, 3); ctx.fillStyle = P.ink; ctx.font = '900 24px Deco'; ctx.textAlign = 'center'; ctx.fillText('SHELVED', 830, 1020);
      const tooK = tween(u, to - 0.2, to + 0.3, ease.outBack);
      if (tooK > 0 && throwK < 0.3) { ctx.save(); ctx.translate(W / 2, 330); ctx.scale(tooK, tooK); ctx.fillStyle = P.vermDark; ctx.font = '900 64px Deco'; ctx.textAlign = 'center'; ctx.fillText('TOO STICKY!', 0, 0); ctx.restore(); }
    },
  },
  { // 17.2 "Years later, his team tests it again, and it glues expensive lab equipment together."
    start: 17.0, title: '1951: The Stuck Prisms', trans: 'page',
    draw(ctx, u, S) {
      const { k, P, W } = S, te = S.at('team'), ag = S.at('again,'), gl = S.at('glues'), eq = S.at('equipment');
      S.cam(lerp(1.0, 1.12, tween(u, gl - 0.3, eq + 0.6, ease.inOut)), lerp(W / 2, 580, tween(u, gl - 0.3, eq + 0.6)), lerp(660, 580, tween(u, gl - 0.3, eq + 0.6)));
      interior(ctx, S, { arches: 3, carpetColor: '#3d6a4a' });
      k.rect(ctx, 380, 820, 520, 40, '#8a6a44', P.ink, 2.5);
      const close = tween(u, ag - 0.3, ag + 0.4), stuck = tween(u, gl - 0.1, gl + 0.4), tug = stuck >= 1 ? Math.abs(Math.sin(S.t * 6)) * 6 : 0;
      refractometer(ctx, S, 640, 540, 1.0, lerp(60, 0, close) + tug, stuck, S.t);
      k.figure(ctx, 250, 1010, { ...JOYNER, s: 0.95, face: 1, mood: stuck > 0.5 ? 'wow' : 'calm', ...act(stuck > 0.5 ? 'surprise' : 'present', u, tween(u, te - 0.2, te + 0.3)) });
      k.figure(ctx, 850, 1010, { ...COOVER, s: 0.9, face: -1, mood: 'calm', armF: [0.4, 0.3] });
      k.seal(ctx, 860, 260, 66, ' YEARS LATER · 1951 ·', '1951', tween(u, 0, 0.6, ease.linear));
      callout(ctx, S, 'COSTLY LAB GLASS, GLUED SHUT', 640, 480, 560, 330, tween(u, eq - 0.1, eq + 0.4), 15);
      k.label(ctx, 'FRED JOYNER, HIS TEAMMATE', 250, 1080, 15, tween(u, te + 0.2, te + 0.6));
    },
  },
  { // 23.0 "That's when Coover realizes this isn't a failure. It's a superglue."
    start: 22.8, title: 'Not a Failure', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S, re = S.at('realizes'), fa = S.at('failure.'), su = S.at('superglue.');
      S.cam(lerp(1.0, 1.12, tween(u, 0, 4.6)), W / 2, lerp(620, 680, tween(u, 0, 4.6)));
      ctx.fillStyle = '#efe2c0'; ctx.fillRect(-300, -300, W + 600, 1800);
      k.rect(ctx, 80, 200, 920, 880, null, P.goldDark, 4);
      // the stamped report spins over: FAILED becomes the name of a wonder
      const flip = tween(u, fa - 0.1, su + 0.2, ease.inOut), sx = Math.cos(flip * Math.PI);
      ctx.save(); ctx.translate(W / 2, 440); ctx.scale(Math.abs(sx) * 1 + 0.001, 1);
      k.rect(ctx, -240, -150, 480, 300, '#fbf4e2', P.ink, 3);
      if (sx > 0) k.stamp(ctx, 'FAILED', 0, 10, 64, 1, -0.2);
      else { ctx.fillStyle = P.vermDark; ctx.font = '900 66px Deco'; ctx.textAlign = 'center'; ctx.fillText('SUPER', 0, -10); ctx.fillText('GLUE', 0, 70); }
      ctx.restore();
      // a small wonder-diagram: a thin film of water makes the glue link up and set
      const ch = tween(u, su - 0.2, su + 1.4);
      for (let i = 0; i < 8; i++) { const x = 380 + i * 56, y = 800 + Math.sin(i * 0.9) * 14; k.circle(ctx, x, y, 22, i < ch * 8 ? '#9ad0e8' : 'rgba(215,235,245,0.6)', P.ink, 2); if (i > 0 && i < ch * 8) { ctx.beginPath(); ctx.moveTo(x - 40, y); ctx.lineTo(x - 22, y); k.stroke(ctx, P.ink, 4); } }
      ctx.fillStyle = 'rgba(120,180,220,0.45)'; ctx.fillRect(350, 840, 450, 20);
      callout(ctx, S, 'A TRACE OF WATER MAKES IT SET', 580, 850, 580, 950, tween(u, su + 0.3, su + 0.7), 15);
      k.figure(ctx, 170, 1060, { ...COOVER, s: 1.0, face: 1, mood: u > re ? 'wow' : 'calm', ...act('cheer', u, tween(u, re - 0.2, re + 0.4)) });
    },
  },
  { // 28.1 "In 1958, it goes on sale as Eastman 910."
    start: 27.9, title: 'On Sale, 1958', trans: 'page',
    draw(ctx, u, S) {
      const { k, P, W } = S, ye = S.at('1958,'), sa = S.at('sale'), ea = S.at('Eastman');
      S.cam(lerp(1.15, 1.0, tween(u, 0, 2.4, ease.inOut)), W / 2, 640);
      interior(ctx, S, { arches: 3, carpetColor: '#9a2a1e' });
      // a shop counter with a row of little bottles
      k.rect(ctx, 100, 760, 880, 60, '#7a5a3a', P.ink, 3); k.rect(ctx, 120, 820, 840, 200, '#8a6a44', P.ink, 2.5);
      const n = tween(u, sa - 0.4, ea + 0.4);
      for (let i = 0; i < 5; i++) { const q = clamp(n * 5 - i); if (q > 0) bottle(ctx, S, 220 + i * 160, 760, 0.8 * ease.outBack(q), ['EASTMAN', '910']); }
      for (let i = 0; i < 3; i++) k.figure(ctx, 250 + i * 290, 1060, { ...ONLOOK(i), s: 0.7, face: i === 2 ? -1 : 1, mood: n > 0.6 ? 'wow' : 'calm', armF: [lerp(0.4, 1.8, n), 0.2] });
      k.seal(ctx, 860, 290, 70, ' ON SALE · 1958 ·', '1958', tween(u, ye - 0.1, ye + 0.5, ease.linear));
    },
  },
  { // 34.0 "Every legend has a beginning."
    start: 33.7, title: 'Every Legend Has a Beginning', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S, beg = S.at('beginning.');
      ctx.save(); S.cam(lerp(1.0, 1.35, tween(u, 0, beg)), W / 2, 640);
      ctx.fillStyle = '#efe2c0'; ctx.fillRect(-300, -300, W + 600, 1800); k.rect(ctx, 80, 200, 920, 880, null, P.goldDark, 4);
      bottle(ctx, S, 420, 820, 1.4, ['EASTMAN', '910']); drop(ctx, S, 680, 760, 44, S.t);
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
  { t: 1.0, type: 'drip', gain: 0.35 }, { t: 1.2, type: 'stamp', gain: 0.45 },
  { t: 4.2, type: 'gong', gain: 0.3 }, { t: 5.6, type: 'whoosh', gain: 0.2 },
  { t: 10.5, type: 'chime', gain: 0.35, pitch: 1.2 },
  { t: 12.2, type: 'pop', gain: 0.3, pitch: 1.2 }, { t: 12.6, type: 'pop', gain: 0.3, pitch: 1.4 }, { t: 12.9, type: 'pop', gain: 0.3, pitch: 1.6 }, { t: 13.3, type: 'pop', gain: 0.3, pitch: 1.8 },
  { t: 14.6, type: 'flop', gain: 0.3 }, { t: 15.9, type: 'whoosh', gain: 0.3 }, { t: 16.6, type: 'thud', gain: 0.35 },
  { t: 19.3, type: 'clank', gain: 0.3 }, { t: 20.3, type: 'thud', gain: 0.3 }, { t: 21.0, type: 'slide', gain: 0.25 },
  { t: 25.6, type: 'whoosh', gain: 0.25 }, { t: 27.0, type: 'chime', gain: 0.45, pitch: 1.3 },
  { t: 28.2, type: 'stamp', gain: 0.3 }, { t: 30.9, type: 'coins', gain: 0.3 }, { t: 31.9, type: 'chime', gain: 0.4, pitch: 1.4 },
];

export const music = {
  bpm: 104, root: 'G', maqam: 'rast', gain: 0.26,
  sections: [
    { from: 0, to: 3.3, mood: 'intro' },
    { from: 3.3, to: 11.5, mood: 'drive' },
    { from: 11.5, to: 17.0, mood: 'groove' },
    { from: 17.0, to: 22.8, mood: 'drive' },
    { from: 22.8, to: 36.4, mood: 'triumph' },
    { from: 36.4, to: 38.0, mood: 'end' },
  ],
};
