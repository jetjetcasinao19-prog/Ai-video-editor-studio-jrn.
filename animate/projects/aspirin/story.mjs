// "From Tree Bark" — how aspirin began, told as a journey across a painted
// map (`voyage` device): one willow leaf travels from Kos to Munich to
// Elberfeld, and at each stop the story steps inside. The leaf ends as a white
// tablet. No company logo is drawn (the 1899 packet shows only the product
// name and "Not affiliated" goes in the post); the credit question is shown
// as an even balance with both chemists. Not medical advice.
import { clamp, lerp, ease, tween, rng, TAU } from '../../lib/core.mjs';
import { interior, bookCover } from '../../styles/ottoman/scenes.mjs';
import { act } from '../../styles/ottoman/acting.mjs';

export const meta = {
  title: 'From Tree Bark',
  slug: 'aspirin-ottoman',
  style: 'ottoman',
  look: 'classic',  // classic (after scroll, night, tile)
  ambient: 'petals',
  room: 'library',
  device: 'voyage',
  width: 1080, height: 1920, fps: 30,
  duration: 40.0,
  voice: 'voice.mp3',
  seed: 1897,
  captionChars: 30,
  brand: { handle: '@HOWITSTARTED-YT1', logo: '../../../brand/logo.png' },
  outro: { at: 38.3, text: 'Subscribe for more origin stories' },
};

const HIPPO = { robe: '#efe6cf', inner: '#c9b48a', sash: '#c9b48a', hat: 'bald', hair: '#e8e8e8', beard: true, beardColor: '#e8e8e8', skin: '#d9a882' };
const BUCHNER = { robe: '#2a2a3a', inner: '#efe6cf', sash: '#2a2a3a', hat: 'shorthair', hair: '#6a4a2a', glasses: true, skin: '#f1d1a8' };
const HOFFMANN = { robe: '#3a3a4a', inner: '#efe6cf', sash: '#3a3a4a', hat: 'shorthair', hair: '#3a2a1a', mustache: true, mustacheColor: '#3a2a1a', skin: '#f1d1a8' };
const EICHEN = { robe: '#4a2a2a', inner: '#efe6cf', sash: '#4a2a2a', hat: 'bald', hair: '#2a1a12', mustache: true, mustacheColor: '#2a1a12', beard: true, beardColor: '#2a1a12', skin: '#e2b48a' };
const SEA = '#4f7fa8', LAND = '#e8d6a8', HILL = '#c9b07a';

// ---------- the recurring object: a willow leaf that becomes a tablet ----------
function leaf(ctx, S, x, y, s = 1, rot = 0, pill = 0) {
  const { k, P } = S;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  if (pill < 1) { ctx.save(); ctx.globalAlpha *= 1 - pill; ctx.beginPath(); ctx.moveTo(-50, 0); ctx.quadraticCurveTo(0, -22, 50, 0); ctx.quadraticCurveTo(0, 22, -50, 0); k.fillStroke(ctx, '#7fa860', P.ink, 2); ctx.beginPath(); ctx.moveTo(-46, 0); ctx.lineTo(46, 0); k.stroke(ctx, '#4a6a3a', 2); ctx.restore(); }
  if (pill > 0) { ctx.save(); ctx.globalAlpha *= pill; ctx.beginPath(); ctx.ellipse(0, 0, 34, 34 * lerp(0.4, 1, pill), 0, 0, TAU); k.fillStroke(ctx, '#ffffff', P.ink, 2.5); ctx.beginPath(); ctx.moveTo(-22, 0); ctx.lineTo(22, 0); k.stroke(ctx, '#b8b0a0', 3); ctx.restore(); }
  ctx.restore();
}
function willow(ctx, S, x, base, s = 1, t = 0) {
  const { k, P } = S;
  ctx.save(); ctx.translate(x, base); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-40, 0); ctx.quadraticCurveTo(-20, -160, -60, -300); ctx.lineTo(60, -300); ctx.quadraticCurveTo(10, -160, 40, 0); ctx.closePath(); k.fillStroke(ctx, '#7a5a3a', P.ink, 2.5);
  for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(-20 + i * 8, -20 - i * 40); ctx.quadraticCurveTo(-5 + i * 6, -40 - i * 40, -18 + i * 8, -60 - i * 40); k.stroke(ctx, '#4a3424', 2); }
  ctx.beginPath(); ctx.ellipse(0, -330, 230, 120, 0, 0, TAU); k.fillStroke(ctx, '#6f9a50', P.ink, 2.5);
  for (let i = 0; i < 22; i++) { // the weeping strands sway
    const sx = -220 + i * 21, sw = Math.sin(t * 1.5 + i * 0.7) * 10;
    ctx.beginPath(); ctx.moveTo(sx, -300); ctx.quadraticCurveTo(sx + sw, -200, sx + sw * 1.6, -100 - (i % 3) * 30);
    k.stroke(ctx, P.ink, 7); k.stroke(ctx, i % 2 ? '#8ab868' : '#6f9a50', 4);
  }
  ctx.restore();
}

// ---------- the voyage map ----------
const PLACES = { kos: [860, 870, 'KOS, GREECE'], munich: [560, 520, 'MUNICH'], elberfeld: [330, 300, 'ELBERFELD'] };
const LANDS = [
  [[-80, -80], [1160, -80], [1160, 640], [980, 700], [900, 800], [820, 760], [700, 820], [650, 940], [560, 1000], [480, 900], [360, 860], [200, 900], [80, 820], [-80, 860]],
];
const ISLE = [[800, 850], [900, 835], [930, 880], [860, 905], [790, 885]];
function pathAt(pts, k) {
  const seg = []; let tot = 0; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); tot += d; }
  let r = clamp(k) * tot; for (let i = 0; i < seg.length; i++) { if (r <= seg[i]) { const q = r / seg[i]; return [lerp(pts[i][0], pts[i + 1][0], q), lerp(pts[i][1], pts[i + 1][1], q)]; } r -= seg[i]; }
  return pts[pts.length - 1];
}
const ROUTE1 = [[860, 870], [780, 790], [700, 700], [620, 600], [560, 520]];
const ROUTE2 = [[560, 520], [500, 450], [420, 380], [330, 300]];
function europeMap(ctx, S, o = {}) {
  const { k, P, W } = S;
  ctx.fillStyle = SEA; ctx.fillRect(-300, -300, W + 600, 1800);
  k.waves(ctx, -300, -300, W + 600, 1800, S.t, SEA, '#6f9cc0', 8, 30);
  for (const poly of [...LANDS, ISLE]) { ctx.beginPath(); k.smoothPath(ctx, poly, true); ctx.fillStyle = LAND; ctx.fill(); k.stroke(ctx, P.ink, 3); }
  const R = rng(9);
  for (let i = 0; i < 24; i++) { const x = 60 + R() * 960, y = 60 + R() * 640; if (Object.values(PLACES).some(([px, py]) => Math.hypot(px - x, py - y) < 90)) continue; ctx.beginPath(); ctx.arc(x, y, 20 + R() * 14, Math.PI, TAU); ctx.closePath(); k.fillStroke(ctx, HILL, P.ink, 1.5); }
  for (const [key, kk] of [['r1', o.r1 || 0], ['r2', o.r2 || 0]]) {
    const pts = key === 'r1' ? ROUTE1 : ROUTE2, n = 40;
    for (let i = 0; i <= n * clamp(kk); i++) { const [x, y] = pathAt(pts, i / n); k.circle(ctx, x, y, 5, P.verm, null); }
  }
  for (const [name, [x, y, lbl]] of Object.entries(PLACES)) {
    if (o.hide && o.hide.includes(name)) continue;
    k.rect(ctx, x - 18, y - 22, 36, 22, P.white, P.ink, 1.5); k.poly(ctx, [[x - 22, y - 22], [x, y - 36], [x + 22, y - 22]], P.verm, P.ink, 1.5);
    ctx.fillStyle = P.ink; ctx.font = '700 30px Fell'; ctx.textAlign = 'center'; ctx.fillText(lbl, x, y + 36);
  }
}
// a small 1899-style powder packet; only the product name, no company mark
function packet(ctx, S, x, y, s, name, k1 = 1) {
  const { k, P } = S;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  k.rect(ctx, -150, -200, 300, 400, '#f1e8d0', P.ink, 3); k.rect(ctx, -130, -180, 260, 360, null, P.goldDark, 2);
  ctx.fillStyle = P.ink; ctx.font = '700 26px Fell'; ctx.textAlign = 'center'; ctx.fillText('TABLETS · 1899', 0, -120);
  ctx.fillStyle = P.vermDark; ctx.font = '900 54px Deco'; ctx.fillText(name.slice(0, Math.ceil(name.length * clamp(k1))), 0, 10);
  for (let i = 0; i < 3; i++) leaf(ctx, S, -70 + i * 70, 110, 0.6, 0, 1);
  ctx.restore();
}

export const scenes = [
  { // 0.1 "Aspirin started as tree bark."
    start: 0, title: 'From Tree Bark',
    draw(ctx, u, S) {
      const { k, P, W } = S, tr = S.at('tree'), ba = S.at('bark.');
      S.cam(lerp(1.25, 1.0, tween(u, 0.2, ba + 0.5, ease.inOut)), W / 2, lerp(500, 640, tween(u, 0.2, ba + 0.5)));
      ctx.fillStyle = '#dfe9e0'; ctx.fillRect(-300, -300, W + 600, 1800);
      k.sun(ctx, 860, 260, 70, S.t, false);
      k.ground(ctx, -300, 980, W + 600, 900, '#9ab870', 4);
      k.waves(ctx, -300, 1060, W + 600, 140, S.t, '#6f9cc0', '#9fc3dc', 20, 22);
      willow(ctx, S, 420, 1000, 1.3, S.t);
      // a white tablet on a leaf falls back into the tree: the story runs backwards
      const fall = tween(u, tr - 0.1, ba + 0.4, ease.inOut);
      leaf(ctx, S, lerp(W / 2 + 60, 600, fall), lerp(340, 700, fall), lerp(1.8, 1.2, fall), Math.sin(S.t * 3) * 0.3, 1 - fall);
      k.label(ctx, 'WILLOW', 420, 1110, 18, tween(u, ba - 0.2, ba + 0.3));
    },
  },
  { // 3.8 "Around 400 BC, the Greek doctor Hippocrates described willow bark as a medicine for pain and fever."
    start: 3.6, title: 'Greece, c. 400 BC', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W } = S, ar = S.at('Around'), hi = S.at('Hippocrates'), wi = S.at('willow'), me = S.at('medicine'), fe = S.at('fever.');
      S.cam(lerp(1.0, 1.1, tween(u, wi - 0.4, fe + 0.4, ease.inOut)), lerp(W / 2, 520, tween(u, wi - 0.4, fe + 0.4)), lerp(620, 720, tween(u, wi - 0.4, fe + 0.4)));
      ctx.fillStyle = '#f2e3c0'; ctx.fillRect(-300, -300, W + 600, 1800);
      ctx.fillStyle = '#d8c090'; ctx.fillRect(-300, 900, W + 600, 900);
      // a Greek colonnade, white and calm
      k.rect(ctx, 60, 300, 960, 50, '#efe6cf', P.ink, 2.5); k.poly(ctx, [[40, 300], [540, 170], [1040, 300]], '#efe6cf', P.ink, 2.5);
      for (let i = 0; i < 6; i++) { const x = 120 + i * 170; k.rect(ctx, x - 26, 350, 52, 550, '#f6f0e2', P.ink, 2); for (let j = 1; j < 4; j++) { ctx.beginPath(); ctx.moveTo(x - 26 + j * 13, 360); ctx.lineTo(x - 26 + j * 13, 890); k.stroke(ctx, 'rgba(60,40,20,0.2)', 2); } }
      k.figure(ctx, 330, 1010, { ...HIPPO, s: 1.1, face: 1, mood: 'calm', ...act(u > me ? 'present' : 'think', u, tween(u, hi - 0.2, hi + 0.4)) });
      k.label(ctx, 'HIPPOCRATES · AS TRADITION TELLS IT', 400, 1080, 16, tween(u, hi, hi + 0.4));
      // a bowl of willow bark tea, steaming
      k.bowl(ctx, 600, 980, 0.9, S.t, '#c9a46a', true);
      for (let i = 0; i < 4; i++) { const q = tween(u, wi - 0.3 + i * 0.12, wi + 0.2 + i * 0.12, ease.outBack); if (q > 0) { ctx.save(); ctx.translate(560 + i * 26, 930 - i * 4); ctx.scale(q, q); k.rect(ctx, -10, -26, 20, 52, '#7a5a3a', P.ink, 1.5); ctx.restore(); } }
      const ce = tween(u, fe - 0.2, fe + 0.4);
      if (ce > 0) { ctx.save(); ctx.globalAlpha = ce; k.rect(ctx, 600, 560, 280, 150, '#fbf4e2', P.ink, 2.5); ctx.fillStyle = P.ink; ctx.font = '900 34px Deco'; ctx.textAlign = 'center'; ctx.fillText('PAIN', 740, 620); ctx.fillText('& FEVER', 740, 670); ctx.restore(); }
      k.seal(ctx, 780, 420, 64, ' AROUND 400 BC ·', '400 BC', tween(u, ar - 0.1, ar + 0.5, ease.linear));
    },
  },
  { // 11.8 "In 1828, a German professor..." — the leaf sets off across the map
    start: 11.6, title: 'The Leaf Travels North', trans: 'page',
    draw(ctx, u, S) {
      const { k, P, W } = S, ge = S.at('German'), pr = S.at('professor');
      const go = tween(u, 0.1, pr + 0.2, ease.inOut);
      S.cam(lerp(1.0, 1.3, tween(u, pr - 0.3, pr + 0.4, ease.inOut)), lerp(W / 2, 560, go), lerp(640, 520, go));
      europeMap(ctx, S, { r1: go });
      const [x, y] = pathAt(ROUTE1, go); leaf(ctx, S, x, y - 30, 0.8, Math.sin(S.t * 4) * 0.3, 0);
      k.label(ctx, '1828', 560, 400, 20, tween(u, 0, 0.4));
    },
  },
  { // 13.9 "...pulls the key ingredient out of willow. He calls it salicin."
    start: 13.6, title: 'Munich, 1828', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S, pu = S.at('pulls'), ke = S.at('key'), wl = S.at('willow.'), sa = S.at('salicin.');
      S.cam(lerp(1.15, 1.0, tween(u, 0, 1.6, ease.inOut)), lerp(380, W / 2, tween(u, 0, 1.6)), 680);
      interior(ctx, S, { arches: 3, carpetColor: '#6a3a2a' });
      k.rect(ctx, 80, 860, 920, 40, P.brownLight, P.ink, 2.5); k.rect(ctx, 100, 900, 30, 120, P.brown, P.ink, 2); k.rect(ctx, 950, 900, 30, 120, P.brown, P.ink, 2);
      k.alembic(ctx, 620, 860, 0.9, S.t, tween(u, pu - 0.3, pu + 0.3), '#c9a46a');
      // strips of bark go in; yellow crystals come out
      for (let i = 0; i < 3; i++) { const q = tween(u, 0.1 + i * 0.25, 0.9 + i * 0.25, ease.inOut); if (q < 1) { ctx.save(); ctx.translate(lerp(380, 560, q), lerp(820, 760, q) - Math.sin(q * Math.PI) * 80); ctx.rotate(q * 3); k.rect(ctx, -10, -24, 20, 48, '#7a5a3a', P.ink, 1.5); ctx.restore(); } }
      const cr = tween(u, ke - 0.1, wl + 0.3);
      k.rect(ctx, 790, 830, 170, 26, '#efe6cf', P.ink, 2);
      const R = rng(4); for (let i = 0; i < Math.floor(cr * 14); i++) { const x = 805 + R() * 140, y = 828 - R() * 18; k.poly(ctx, [[x, y - 14], [x + 7, y], [x, y + 4], [x - 7, y]], '#f2d24a', P.ink, 1); }
      k.figure(ctx, 280, 1010, { ...BUCHNER, s: 0.85, face: 1, mood: cr > 0.6 ? 'happy' : 'calm', ...act(u > sa ? 'present' : 'rest', u, tween(u, sa - 0.2, sa + 0.3)) });
      k.label(ctx, 'JOHANN BUCHNER, PROFESSOR', 280, 1080, 16, tween(u, 0.4, 0.9));
      const jl = tween(u, sa - 0.2, sa + 0.4, ease.outBack);
      if (jl > 0) { ctx.save(); ctx.translate(870, 700); ctx.scale(jl, jl); k.cartouche(ctx, 0, 0, 220, 64, P.paperLight, P.goldDark, 3); ctx.fillStyle = P.vermDark; ctx.font = '900 38px Deco'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('SALICIN', 0, 2); ctx.restore(); ctx.textBaseline = 'alphabetic'; }
    },
  },
  { // 18.6 "1897." — the leaf travels on
    start: 18.3, title: 'On to 1897', trans: 'page',
    draw(ctx, u, S) {
      const { k, P, W } = S, ye = S.at('1897.');
      const go = tween(u, 0.1, 1.6, ease.inOut);
      S.cam(lerp(1.3, 1.45, go), lerp(560, 330, go), lerp(520, 330, go));
      europeMap(ctx, S, { r1: 1, r2: go });
      const [x, y] = pathAt(ROUTE2, go); leaf(ctx, S, x, y - 30, 0.8, Math.sin(S.t * 4) * 0.3, 0);
      k.seal(ctx, 520, 200, 56, ' ELBERFELD · 1897 ·', '1897', tween(u, ye, ye + 0.6, ease.linear));
    },
  },
  { // 20.2 "At the Bayer Company in Germany, chemists, including Felix Hoffmann and his boss Arthur Eichengrün make a gentler version."
    start: 20.0, title: 'Elberfeld, 1897', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, co = S.at('Company'), ch = S.at('chemists,'), fx = S.at('Felix'), ar = S.at('Arthur'), ge = S.at('gentler'), ve = S.at('version.');
      const inside = tween(u, ch - 0.3, ch + 0.4, ease.inOut);
      if (inside < 1) {
        ctx.save(); ctx.globalAlpha = 1 - inside;
        S.cam(lerp(1.0, 1.25, tween(u, 0, ch)), W / 2, 700);
        ctx.fillStyle = '#d8dde0'; ctx.fillRect(-300, -300, W + 600, 1800);
        ctx.fillStyle = '#b8b0a0'; ctx.fillRect(-300, 980, W + 600, 900);
        k.factory(ctx, W / 2, 1000, 780, 420, S.t, true);
        k.label(ctx, 'A DYE & CHEMICAL WORKS', W / 2, 1060, 18, tween(u, co - 0.1, co + 0.3));
        ctx.restore();
      }
      if (inside > 0) {
        ctx.save(); ctx.globalAlpha = inside;
        S.cam(lerp(1.0, 1.12, tween(u, ge - 0.3, ve + 0.4, ease.inOut)), lerp(W / 2, 560, tween(u, ge - 0.3, ve + 0.4)), 700);
        interior(ctx, S, { arches: 3, carpetColor: '#2f5f8a' });
        k.rect(ctx, 300, 860, 480, 36, P.brownLight, P.ink, 2.5);
        k.figure(ctx, 190, 1010, { ...HOFFMANN, s: 0.82, face: 1, mood: 'calm', ...act('present', u, tween(u, fx - 0.2, fx + 0.3)) });
        k.figure(ctx, 830, 1010, { ...EICHEN, s: 0.86, face: -1, mood: 'calm', ...act('point', u, tween(u, ar - 0.2, ar + 0.3)) });
        k.label(ctx, 'FELIX HOFFMANN', 190, 1080, 16, tween(u, fx, fx + 0.4));
        k.label(ctx, 'ARTHUR EICHENGRÜN', 800, 1080, 16, tween(u, ar, ar + 0.4));
        // the harsh spiky crystal smooths into a round white tablet: the leaf's last change
        const g = tween(u, ge - 0.4, ve + 0.2, ease.inOut);
        ctx.save(); ctx.translate(540, 800);
        ctx.globalAlpha = inside * (1 - g); const R = rng(8); ctx.beginPath(); for (let i = 0; i < 16; i++) { const a = i / 16 * TAU, r = i % 2 ? 30 : 60 + R() * 10; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r * 0.8); } ctx.closePath(); k.fillStroke(ctx, '#f2d24a', P.ink, 2);
        ctx.restore();
        leaf(ctx, S, 540, 800, 1.6, 0, g);
        k.label(ctx, 'GENTLER ON THE STOMACH', 540, 680, 18, tween(u, ve - 0.2, ve + 0.3));
        ctx.restore();
      }
    },
  },
  { // 28.2 "In 1899, it's sold under a new name, Aspirin."
    start: 27.9, title: 'A New Name, 1899', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S, yr = S.at('1899,'), so = S.at('sold'), nm = S.at('name,'), as = S.at('Aspirin.');
      S.cam(lerp(1.1, 1.0, tween(u, 0, 2.0, ease.inOut)), W / 2, 640);
      ctx.fillStyle = '#e9dcc0'; ctx.fillRect(-300, -300, W + 600, 1800);
      k.rect(ctx, -300, 920, W + 600, 900, '#7a5a3a', P.ink, 3);
      packet(ctx, S, 330, 700, 1.0, 'ASPIRIN', tween(u, as - 0.3, as + 0.5));
      // the name, taken apart
      const parts = [['A', 'ACETYL'], ['SPIR', 'SPIRAEA · MEADOWSWEET'], ['IN', 'A COMMON ENDING']];
      parts.forEach(([a, b], i) => {
        const q = tween(u, as + 0.4 + i * 0.25, as + 0.8 + i * 0.25, ease.outBack); if (q <= 0) return;
        ctx.save(); ctx.translate(730, 480 + i * 170); ctx.scale(q, q);
        k.rect(ctx, -150, -60, 300, 120, '#fbf4e2', P.ink, 2.5);
        ctx.fillStyle = P.vermDark; ctx.font = '900 46px Deco'; ctx.textAlign = 'center'; ctx.fillText(a, 0, -6);
        ctx.fillStyle = P.ink; ctx.font = '700 24px Fell'; ctx.fillText(b, 0, 34); ctx.restore();
      });
      k.seal(ctx, 860, 260, 56, ' MARCH 1899 ·', '1899', tween(u, yr - 0.1, yr + 0.5, ease.linear));
      k.label(ctx, 'NAME REGISTERED IN GERMANY', 330, 1000, 16, tween(u, so, so + 0.4));
    },
  },
  { // 32.4 "Who really deserves credit? Historians still argue."
    start: 32.2, title: 'Who Deserves the Credit?', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, cr = S.at('credit?'), hi = S.at('Historians'), ar = S.at('argue.');
      S.cam(lerp(1.0, 1.15, tween(u, 0, 3.4)), W / 2, lerp(620, 680, tween(u, 0, 3.4)));
      interior(ctx, S, { arches: 3, carpetColor: '#9a2a1e' });
      const tilt = Math.sin(S.t * 1.6) * 0.6 * tween(u, hi - 0.3, hi + 0.4);
      k.balance(ctx, W / 2, 1000, 1.6, tilt);
      for (const [sx, who, nm] of [[-1, HOFFMANN, 'HOFFMANN'], [1, EICHEN, 'EICHENGRÜN']]) {
        const y = 680 + sx * tilt * 0.3 * 210 * 1.6 * 0.5;
        k.frame(ctx, W / 2 + sx * 210, y - 170, 150, 170, c => { c.fillStyle = '#d8c8a8'; c.fillRect(-75, -85, 150, 170); k.figure(c, 0, 160, { ...who, s: 0.8, face: -sx, mood: 'calm', armF: [0.2, 0.2] }); });
        k.label(ctx, nm, W / 2 + sx * 210, y - 50, 15, tween(u, 0.3, 0.8));
      }
      const q = tween(u, cr - 0.2, cr + 0.3, ease.outBack);
      if (q > 0) { ctx.save(); ctx.translate(W / 2, 330); ctx.scale(q, q); ctx.fillStyle = P.vermDark; ctx.font = '900 140px Deco'; ctx.textAlign = 'center'; ctx.fillText('?', 0, 50); ctx.restore(); }
      k.label(ctx, 'EICHENGRÜN CLAIMED THE LEAD ROLE IN 1949', W / 2, 1080, 15, tween(u, ar - 0.2, ar + 0.3));
    },
  },
  { // 35.8 "Every legend has a beginning."
    start: 35.6, title: 'Every Legend Has a Beginning', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S, beg = S.at('beginning.');
      ctx.save(); S.cam(lerp(1.0, 1.35, tween(u, 0, beg)), W / 2, 700);
      ctx.fillStyle = '#f0c89a'; ctx.fillRect(-300, -300, W + 600, 1800);
      k.sun(ctx, 760, 520, 110, S.t, false);
      k.ground(ctx, -300, 980, W + 600, 900, '#8aa860', 4);
      willow(ctx, S, W / 2, 1000, 1.3, S.t); leaf(ctx, S, W / 2 + 160, 960, 1.0, 0, 1);
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
  { t: 1.2, type: 'whoosh', gain: 0.25 }, { t: 2.6, type: 'pop', gain: 0.3, pitch: 1.3 },
  { t: 3.8, type: 'gong', gain: 0.3 }, { t: 7.7, type: 'pluck', gain: 0.3 }, { t: 10.6, type: 'chime', gain: 0.35 },
  { t: 12.2, type: 'slide', gain: 0.25 }, { t: 14.0, type: 'sizzle', gain: 0.2 }, { t: 17.3, type: 'chime', gain: 0.4, pitch: 1.3 },
  { t: 18.6, type: 'slide', gain: 0.25 }, { t: 20.6, type: 'clank', gain: 0.25 }, { t: 22.4, type: 'pop', gain: 0.3 },
  { t: 26.6, type: 'chime', gain: 0.4, pitch: 1.2 }, { t: 28.3, type: 'stamp', gain: 0.35 }, { t: 31.4, type: 'pop', gain: 0.4, pitch: 1.4 },
  { t: 32.7, type: 'pluck', gain: 0.3, pitch: 0.8 }, { t: 33.5, type: 'thud', gain: 0.3 },
];

export const music = {
  bpm: 100, root: 'C', maqam: 'rast', gain: 0.26,
  sections: [
    { from: 0, to: 3.6, mood: 'intro' },
    { from: 3.6, to: 11.6, mood: 'groove' },
    { from: 11.6, to: 20.0, mood: 'drive' },
    { from: 20.0, to: 32.2, mood: 'triumph' },
    { from: 32.2, to: 35.6, mood: 'groove' },
    { from: 35.6, to: 38.3, mood: 'triumph' },
    { from: 38.3, to: 40.0, mood: 'end' },
  ],
};
