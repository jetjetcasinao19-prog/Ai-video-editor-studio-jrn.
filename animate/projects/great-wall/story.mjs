// "The Great Wall Is Many Walls" — told as a chronicle on a hanging scroll: a
// patchwork map of the rival kingdoms comes back again and again, its border
// walls rising in rammed earth, joined in one gold line by the first emperor,
// and finally redrawn in Ming brick. People are drawn in the dress of their own
// time (Warring States robes, Qin topknots, the emperor's bead crown, Ming
// helmets); the northern nomads are riders of the steppe, not monsters.
import { clamp, lerp, ease, tween, rng, TAU } from '../../lib/core.mjs';
import { bookCover } from '../../styles/ottoman/scenes.mjs';
import { act } from '../../styles/ottoman/acting.mjs';

export const meta = {
  title: 'The Great Wall Is Many Walls',
  slug: 'great-wall-ottoman',
  style: 'ottoman',
  look: 'scroll',   // hanging scroll (after album, karagoz, tile)
  ambient: 'dust',
  room: 'lattice',
  device: 'chronicle',
  width: 1080, height: 1920, fps: 30,
  duration: 51.7,
  voice: 'voice.mp3',
  seed: 221,
  captionChars: 30,
  brand: { handle: '@HOWITSTARTED-YT1', logo: '../../../brand/logo.png' },
  outro: { at: 49.9, text: 'Subscribe for more origin stories' },
};

const EARTH = '#a8784a', BRICK = '#9a9a92';
const ROBE = i => ({ robe: ['#3d6a4a', '#9a2a1e', '#2f5f8a', '#c9a227', '#6a4a7a'][i % 5], inner: '#efe6cf', sash: '#2a1c12', hat: 'topknot', hair: '#1a1a1a', skin: ['#e8c49a', '#ddb48a', '#f0d0a8'][i % 3] });
const QIN_SOLDIER = i => ({ robe: '#3a3a3a', robeP: 'stripes', robePc: '#4a4a4a', inner: '#9a2a1e', sash: '#9a2a1e', hat: 'topknot', hatColor: '#9a2a1e', hair: '#1a1a1a', skin: ['#e8c49a', '#ddb48a'][i % 2] });
const MING = i => ({ robe: '#9a2a1e', inner: '#2f5f8a', sash: '#2a1c12', hat: 'minghelm', skin: ['#e8c49a', '#ddb48a'][i % 2] });

// ---------- the patchwork map of the rival kingdoms ----------
const KINGDOMS = {
  qin: { c: '#2a2a2a', p: [[60, 240], [400, 220], [430, 600], [440, 700], [330, 860], [330, 1000], [60, 1000]], at: [220, 560] },
  zhao: { c: '#b0532e', p: [[400, 220], [700, 200], [690, 430], [420, 450]], at: [550, 330] },
  yan: { c: '#2f5f8a', p: [[700, 200], [1020, 180], [1020, 420], [690, 430]], at: [860, 310] },
  wei: { c: '#c9a227', p: [[420, 450], [690, 430], [700, 560], [430, 600]], at: [560, 515] },
  qi: { c: '#3d6a4a', p: [[690, 430], [1020, 420], [1020, 700], [700, 700], [700, 560]], at: [860, 570] },
  han: { c: '#8a5a8a', p: [[430, 600], [700, 560], [700, 700], [600, 720], [440, 700]], at: [565, 650] },
  chu: { c: '#9a2a1e', p: [[330, 860], [440, 700], [600, 720], [700, 700], [1020, 700], [1020, 1000], [330, 1000]], at: [680, 860] },
};
// border walls, as polylines: the northern ones face the steppe; Wei's faces Qin
const WALLS = {
  qinN: [[60, 236], [230, 226], [400, 218]],
  zhaoN: [[404, 216], [560, 206], [700, 198]],
  yanN: [[704, 196], [860, 186], [1020, 176]],
  wei: [[424, 452], [428, 530], [432, 600]],
  qi: [[700, 702], [860, 704], [1020, 700]],
  chu: [[340, 858], [440, 704], [600, 724]],
};
function along(pts, k) {
  const seg = []; let tot = 0; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); tot += d; }
  let r = clamp(k) * tot; for (let i = 0; i < seg.length; i++) { if (r <= seg[i]) { const q = r / seg[i]; return [lerp(pts[i][0], pts[i + 1][0], q), lerp(pts[i][1], pts[i + 1][1], q)]; } r -= seg[i]; }
  return pts[pts.length - 1];
}
// a wall along a path: rammed earth (striped, no crenels) or Ming brick (crenels, towers)
function wall(ctx, S, pts, k1 = 1, o = {}) {
  const { k, P } = S, h = o.h || 22, step = o.step || 10, brick = o.style === 'brick';
  let tot = 0; for (let i = 1; i < pts.length; i++) tot += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  const n = Math.floor(tot / step * clamp(k1));
  for (let i = 0; i <= n; i++) {
    const [x, y] = along(pts, i * step / tot);
    const isTower = brick && i % (o.towerEvery || 14) === 7;
    const hh = isTower ? h * 1.7 : h, w = isTower ? step * 2.2 : step + 1;
    ctx.fillStyle = o.color || (brick ? BRICK : EARTH); ctx.fillRect(x - w / 2, y - hh, w, hh);
    if (!brick) { ctx.fillStyle = 'rgba(60,30,10,0.25)'; for (let l = 1; l < 4; l++) ctx.fillRect(x - w / 2, y - hh + l * hh / 4, w, 1.5); }
    if (brick && !isTower && i % 2 === 0) { ctx.fillStyle = o.color || BRICK; ctx.fillRect(x - step / 2, y - hh - h * 0.3, step * 0.6, h * 0.3); }
    if (isTower) { k.poly(ctx, [[x - w / 2 - 3, y - hh], [x, y - hh - h * 0.6], [x + w / 2 + 3, y - hh]], P.vermDark, P.ink, 1); }
  }
  if (o.outline !== false && n > 0) { ctx.save(); ctx.globalAlpha *= 0.6; ctx.beginPath(); for (let i = 0; i <= n; i++) { const [x, y] = along(pts, i * step / tot); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } k.stroke(ctx, P.ink, 1.5); ctx.restore(); }
}
function kingdomMap(ctx, S, o = {}) {
  const { k, P, W } = S;
  ctx.fillStyle = '#c9d8a0'; ctx.fillRect(-80, -80, W + 160, 1260); // the steppe to the north
  ctx.fillStyle = k.pattern(ctx, 'dots', '#c9d8a0', '#b8c890', 40); ctx.fillRect(-80, -80, W + 160, 300);
  ctx.fillStyle = '#3f6f9a'; ctx.fillRect(1020, 160, 160, 1100); k.waves(ctx, 1020, 160, 160, 1100, S.t, '#3f6f9a', '#6f9cc0', 8, 20);
  for (const [name, K] of Object.entries(KINGDOMS)) {
    const c = o.color ? o.color(name, K) : K.c;
    ctx.beginPath(); K.p.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath();
    ctx.save(); ctx.globalAlpha *= 0.55; ctx.fillStyle = c; ctx.fill(); ctx.restore(); k.stroke(ctx, P.ink, 2.5);
    if (o.names !== false) { ctx.fillStyle = name === 'qin' || c === '#2a2a2a' ? P.paperLight : P.ink; ctx.font = '700 30px Fell'; ctx.textAlign = 'center'; ctx.fillText(name.toUpperCase(), K.at[0], K.at[1]); }
  }
  for (const [name, pts] of Object.entries(WALLS)) { const kk = o.walls ? o.walls(name) : 0; if (kk > 0) wall(ctx, S, pts, kk, { h: o.wallH || 22, step: 9 }); }
}
// a rider of the steppe: horse first-plane, rider behind its back
function rider(ctx, S, x, y, s, f = 1, t = 0, i = 0) {
  const { k, P } = S, g = Math.sin(t * 10 + i);
  ctx.save(); ctx.translate(x, y); ctx.scale(s * f, s);
  k.figure(ctx, -4, -50, { robe: ['#7a5a3a', '#5a6a4a', '#8a6a4a'][i % 3], inner: '#d8c9a8', sash: '#3a2a1a', hat: 'furcap', hatColor: '#8a5a3a', skin: '#d0a070', s: 0.62, face: 1, kneel: true, armF: [1.2, 0.4] });
  for (const [lx, ph] of [[-46, 0], [-30, 1.5], [30, 0.8], [46, 2.3]]) { ctx.save(); ctx.translate(lx, -50); ctx.rotate(Math.sin(t * 12 + ph + i) * 0.4); k.rect(ctx, -5, 0, 10, 50, '#6a4a2a', P.ink, 1.5); ctx.restore(); }
  k.ellipse(ctx, 0, -62, 62, 26, 0, '#8a5a3a', P.ink, 2);
  ctx.beginPath(); ctx.moveTo(48, -74); ctx.quadraticCurveTo(70, -110 + g * 3, 84, -106); ctx.lineTo(92, -92); ctx.quadraticCurveTo(76, -86, 62, -58); ctx.closePath(); k.fillStroke(ctx, '#8a5a3a', P.ink, 2);
  ctx.beginPath(); ctx.moveTo(-60, -70); ctx.quadraticCurveTo(-84, -60 + g * 6, -80, -30); k.stroke(ctx, '#3a2a1a', 6);
  ctx.restore();
}
function hillsBack(ctx, S, y0, seed = 3) {
  const { k, W } = S;
  k.goldSky(ctx, -80, -80, W + 160, y0 + 280, S.t);
  k.hills(ctx, W, y0, seed, ['#a8b878', '#8aa068', '#6a8a58'], S.t);
  k.ground(ctx, -80, y0 + 110, W + 160, 1200 - y0, '#8aa068', seed, 0.4);
}

export const scenes = [
  { // 0.0 "The Great Wall of China isn't one wall, and it wasn't built at once."
    start: 0, title: 'Not One Wall',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const on = S.at('one'), bu = S.at('built'), nc = S.at('once.');
      S.cam(lerp(1.2, 1.0, tween(u, 0, on + 0.4, ease.inOut)), W / 2, 600);
      hillsBack(ctx, S, 420, 5);
      // the famous wall rides the ridges… then breaks into pieces of different ages
      const path = [[-60, 900], [120, 760], [260, 830], [420, 660], [600, 750], [760, 610], [920, 690], [1140, 580]];
      const split = tween(u, on - 0.2, on + 0.5, ease.inOut);
      const parts = [[0, 0.3, EARTH, 'earth'], [0.34, 0.6, '#5a5a5a', 'earth'], [0.64, 1, BRICK, 'brick']];
      if (split <= 0) wall(ctx, S, path, tween(u, 0, 1.0, ease.inOut) + 0.001, { style: 'brick', h: 72, step: 18 });
      else parts.forEach(([a, b, c, st], i) => { const pts = []; for (let q = a; q <= b + 0.001; q += 0.02) { const [x, y] = along(path, q); pts.push([x, y + (i - 1) * 50 * split]); } const show = i === 0 ? 1 : tween(u, bu - 0.2 + i * 0.35, bu + 0.2 + i * 0.35); ctx.save(); ctx.globalAlpha = lerp(1, show, split); wall(ctx, S, pts, 1, { style: st, color: c, h: 72, step: 18 }); ctx.restore(); });
      // a strip of dates underneath: built over two thousand years
      const tl = tween(u, bu - 0.4, nc + 0.6);
      if (tl > 0) { ctx.save(); ctx.globalAlpha = tl; ctx.beginPath(); ctx.moveTo(120, 980); ctx.lineTo(960, 980); k.stroke(ctx, P.ink, 4); [['600s BC', 160, EARTH], ['221 BC', 420, '#5a5a5a'], ['1368–1644', 840, BRICK]].forEach(([t, x, c]) => { k.circle(ctx, x, 980, 16, c, P.ink, 2); ctx.fillStyle = P.ink; ctx.font = '700 30px Fell'; ctx.textAlign = 'center'; ctx.fillText(t, x, 1040); }); ctx.restore(); }
    },
  },
  { // 5.5 "Around the 600s BC, China is split into rival kingdoms at war."
    start: 5.2, title: 'Rival Kingdoms', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const sp = S.at('split'), ri = S.at('rival'), wa = S.at('war.');
      S.cam(lerp(1.0, 1.12, tween(u, sp - 0.3, wa + 0.6, ease.inOut)), W / 2, 600);
      // the land breaks into its patchwork, one kingdom at a time
      const names = Object.keys(KINGDOMS), br = tween(u, sp - 0.2, ri + 0.6, ease.linear);
      kingdomMap(ctx, S, { color: (n, K) => (br * names.length > names.indexOf(n) ? K.c : '#d8c08a'), names: br > 0.9 });
      // little armies face off along the borders
      const fight = tween(u, wa - 0.6, wa);
      if (fight > 0) [[520, 450, 0, 1], [700, 560, 2, -1], [430, 650, 3, 1], [600, 820, 1, -1]].forEach(([x, y, i, f]) => { ctx.save(); ctx.globalAlpha = fight; k.figure(ctx, x - 22 * f, y + 30, { ...ROBE(i), s: 0.3, face: f, armF: [1.5 + Math.sin(S.t * 8 + i) * 0.2, -0.2] }); k.figure(ctx, x + 22 * f, y + 30, { ...ROBE(i + 2), s: 0.3, face: -f, armF: [1.5 - Math.sin(S.t * 8 + i) * 0.2, -0.2] }); ctx.restore(); });
      k.seal(ctx, 880, 1080, 70, ' AROUND · 600s BC ·', '600s BC', tween(u, 0.1, 0.5, ease.linear));
    },
  },
  { // 10.9 "They build walls against each other."
    start: 10.6, title: 'Walls of Earth', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const bu = S.at('build'), ag = S.at('against'), ea = S.at('each');
      S.cam(lerp(1.15, 1.0, tween(u, 0, 2.4, ease.inOut)), W / 2, lerp(700, 600, tween(u, 0, 2.4)));
      hillsBack(ctx, S, 380, 8);
      // rammed earth: soil tamped layer by layer between wooden boards
      const rise = tween(u, bu - 0.2, ea + 0.6, ease.linear), layers = Math.floor(rise * 9);
      for (let l = 0; l < layers; l++) k.rect(ctx, 250, 960 - (l + 1) * 44, 580, 44, l % 2 ? '#b0845a' : EARTH, 'rgba(60,30,10,0.5)', 1.5);
      const by = 960 - (layers + 1) * 44;
      k.rect(ctx, 240, by - 6, 600, 14, '#7a5a3a', P.ink, 2); k.rect(ctx, 240, by + 40, 600, 14, '#7a5a3a', P.ink, 2);
      for (let i = 0; i < 4; i++) { const ph = Math.sin(S.t * 10 + i * 1.7); k.figure(ctx, 320 + i * 140, by + 40, { ...ROBE(i), robe: '#8a7a5a', s: 0.55, face: i % 2 ? -1 : 1, armF: [2.4 + ph * 0.3, 0.1], hold: c => { c.beginPath(); c.moveTo(0, -40); c.lineTo(0, 30 + ph * 8); S.k.stroke(c, '#5a3a1a', 4); S.k.rect(c, -12, 28 + ph * 8, 24, 12, '#5a3a1a', P.ink, 1); } }); }
      // a banner on each side of the wall: the two kingdoms it divides
      const bn = tween(u, ag - 0.2, ag + 0.3);
      for (const [x, c, f] of [[120, KINGDOMS.zhao.c, 1], [960, KINGDOMS.wei.c, -1]]) { ctx.save(); ctx.globalAlpha = bn; ctx.beginPath(); ctx.moveTo(x, 1000); ctx.lineTo(x, 640); k.stroke(ctx, '#5a3a1a', 6); ctx.beginPath(); ctx.moveTo(x, 650); ctx.quadraticCurveTo(x + f * 70, 640 + Math.sin(S.t * 3) * 10, x + f * 110, 670); ctx.lineTo(x + f * 100, 760); ctx.quadraticCurveTo(x + f * 50, 740, x, 750); ctx.closePath(); k.fillStroke(ctx, c, P.ink, 2); k.figure(ctx, x + f * 60, 1060, { ...ROBE(f > 0 ? 1 : 3), robe: c, s: 0.7, face: f, mood: 'sad', ...act('angry', u, bn) }); ctx.restore(); }
      k.label(ctx, 'RAMMED EARTH, LAYER BY LAYER', W / 2, 260, 20, tween(u, bu + 0.3, bu + 0.7));
    },
  },
  { // 13.4 "In 221 BC, one kingdom, Qin, conquers them all."
    start: 13.1, title: 'Qin Conquers All', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const qi = S.at('Qin,'), co = S.at('conquers'), al = S.at('all.');
      S.cam(lerp(1.0, 1.15, tween(u, qi - 0.3, al + 0.6, ease.inOut)), lerp(W / 2, 420, tween(u, qi - 0.3, qi + 0.6)), 600);
      // black, the colour Qin favoured, floods across the map from the west
      const fl = tween(u, co - 0.2, al + 0.5, ease.inOut);
      kingdomMap(ctx, S, { color: (n, K) => (n === 'qin' || K.at[0] < 160 + fl * 1000 ? '#2a2a2a' : K.c), walls: () => 1 });
      if (fl > 0) for (let i = 0; i < 10; i++) { const x = 200 + fl * 760 - i * 60, y = 360 + (i % 5) * 120; if (x < 120) continue; k.figure(ctx, x, y, { ...QIN_SOLDIER(i), s: 0.28, face: 1, walk: S.t * 6 + i, armF: [0.6, 0.2] }); }
      k.seal(ctx, 880, 1080, 70, ' THE YEAR · 221 BC ·', '221 BC', tween(u, 0.1, 0.5, ease.linear));
    },
  },
  { // 18.4 "Its ruler becomes China's first emperor."
    start: 18.2, title: 'The First Emperor', trans: 'ink',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const ru = S.at('ruler'), fi = S.at('first'), em = S.at('emperor.');
      S.cam(lerp(1.0, 1.3, tween(u, fi - 0.4, em + 0.8, ease.inOut)), W / 2, lerp(640, 560, tween(u, fi - 0.4, em + 0.8)));
      // a palace hall: red columns, a black-lacquered dais
      ctx.fillStyle = '#efe2c0'; ctx.fillRect(-80, -80, W + 160, 1240);
      ctx.save(); ctx.globalAlpha = 0.3; ctx.fillStyle = S.k.pattern(ctx, 'cintamani', '#efe2c0', '#9a2a1e', 70); ctx.fillRect(-80, -80, W + 160, 1240); ctx.restore();
      for (const x of [120, 960]) k.rect(ctx, x - 30, 160, 60, 840, '#9a2a1e', P.ink, 3);
      k.poly(ctx, [[60, 170], [W / 2, 60], [W - 60, 170]], '#2a2a2a', P.ink, 3);
      k.rect(ctx, 260, 860, 560, 140, '#2a2a2a', P.ink, 3); for (let i = 0; i < 3; i++) k.rect(ctx, 220 - i * 30, 1000 + i * 30, 640 + i * 60, 30, '#3a3a3a', P.ink, 2);
      // he rises from king to emperor: the bead crown settles on his head
      const crown = tween(u, fi - 0.3, em + 0.2, ease.outBack);
      k.figure(ctx, W / 2, 860, { robe: '#1a1a1a', robeP: 'cintamani', robePc: '#c9a227', inner: '#9a2a1e', sash: '#c9a227', hat: crown > 0.5 ? 'mianguan' : 'topknot', hair: '#1a1a1a', beard: true, beardColor: '#1a1a1a', skin: '#e8c49a', s: 1.3, face: 1, mood: 'calm', ...act(crown > 0.5 ? 'present' : 'rest', u, crown) });
      for (let i = 0; i < 4; i++) k.figure(ctx, 170 + i * 70 + (i > 1 ? 560 : 0), 1090, { ...ROBE(i), robe: '#3a3a3a', s: 0.5, face: i > 1 ? -1 : 1, kneel: crown > 0.6 });
      k.label(ctx, 'QIN SHI HUANG', W / 2, 330, 26, tween(u, ru, ru + 0.4));
    },
  },
  { // 21.7 "He connects many old walls into one system to keep out raiders from the north."
    start: 21.4, title: 'One Long Wall', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const cn = S.at('connects'), sy = S.at('system'), ke = S.at('keep'), ra = S.at('raiders'), no = S.at('north.');
      S.cam(lerp(1.0, 1.3, tween(u, ke - 0.4, no + 0.6, ease.inOut)), W / 2, lerp(600, 360, tween(u, ke - 0.4, no + 0.6)));
      kingdomMap(ctx, S, { color: (n, K) => (n === 'qin' ? '#2a2a2a' : '#8a8a7a'), names: false, wallH: 30, walls: n => (n === 'wei' || n === 'qi' || n === 'chu' ? 1 - tween(u, cn, sy) : 1) });
      // a gold line threads the northern walls into one
      const j = tween(u, cn - 0.1, sy + 0.4, ease.inOut);
      const north = [...WALLS.qinN, ...WALLS.zhaoN, ...WALLS.yanN];
      if (j > 0) { ctx.beginPath(); for (let i = 0; i <= 60 * j; i++) { const [x, y] = along(north, i / 60); i ? ctx.lineTo(x, y - 30) : ctx.moveTo(x, y - 30); } k.stroke(ctx, P.goldLight, 8); }
      // riders come down from the steppe and turn back at it
      const rd = tween(u, ra - 0.4, no + 0.8, ease.inOut);
      for (let i = 0; i < 5; i++) { const x = 160 + i * 190, back = rd > 0.6, y = lerp(70, 190, rd < 0.6 ? rd / 0.6 : 1 - (rd - 0.6) / 0.4 * 0.6); rider(ctx, S, x, y, 0.55, back ? -1 : 1, S.t, i); }
      k.label(ctx, 'THE XIONGNU: HORSEMEN OF THE STEPPE', W / 2, 330, 18, tween(u, ra, ra + 0.4));
    },
  },
  { // 27.5 "The twist? Some of those walls were built to keep the Qin out."
    start: 27.1, title: 'Built to Keep Qin Out', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const tw = S.at('twist?'), so = S.at('Some'), ke = S.at('keep'), qi = S.at('Qin');
      S.cam(lerp(1.0, 1.8, tween(u, so - 0.3, ke + 0.4, ease.inOut)), lerp(W / 2, 440, tween(u, so - 0.3, ke + 0.4)), lerp(600, 530, tween(u, so - 0.3, ke + 0.4)));
      kingdomMap(ctx, S, { walls: n => (n === 'wei' ? 1 : 0.5) });
      // Wei's wall faces west, at Qin; Qin's black banners gather against it
      const gl = 0.5 + 0.5 * Math.sin(S.t * 6);
      ctx.save(); ctx.globalAlpha = tween(u, so - 0.2, so + 0.3) * gl; ctx.beginPath(); WALLS.wei.forEach(([x, y], i) => (i ? ctx.lineTo(x, y - 10) : ctx.moveTo(x, y - 10))); k.stroke(ctx, P.goldLight, 14); ctx.restore();
      const qa = tween(u, ke - 0.3, qi + 0.4, ease.outCubic);
      for (let i = 0; i < 5; i++) k.figure(ctx, lerp(200, 380, qa), 470 + i * 28, { ...QIN_SOLDIER(i), s: 0.2, face: 1, walk: qa < 1 ? S.t * 6 : null, armF: [0.6, 0.2] });
      for (let i = 0; i < 3; i++) k.figure(ctx, 470, 490 + i * 36, { ...ROBE(3), robe: KINGDOMS.wei.c, s: 0.2, face: -1, mood: 'sad', armF: [1.4, 0.2] });
      k.label(ctx, 'THE WALL OF WEI · BUILT AGAINST QIN', 440, 400, 12, tween(u, ke, ke + 0.4));
      ctx.save(); ctx.globalAlpha = tween(u, tw, tw + 0.3) * (1 - tween(u, so, so + 0.3)); ctx.fillStyle = P.vermDark; ctx.font = '900 140px Deco'; ctx.textAlign = 'center'; ctx.fillText('?', W / 2, 600); ctx.restore();
    },
  },
  { // 32.3 "Most of the wall you see in photos today was built much later by the Ming dynasty."
    start: 32.0, title: 'The Ming Wall', trans: 'page',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const ph = S.at('photos'), la = S.at('later'), mi = S.at('Ming');
      S.cam(lerp(1.0, 1.1, tween(u, 0, 4.6)), W / 2, 600);
      hillsBack(ctx, S, 360, 12);
      // the postcard view, as a framed photograph…
      const path = [[-60, 900], [160, 740], [340, 800], [540, 620], [760, 700], [920, 570], [1140, 610]];
      const photo = tween(u, ph - 0.2, ph + 0.3, ease.outBack) * (1 - tween(u, la - 0.2, la + 0.3));
      // …then the Ming masons, laying grey brick on the old earth
      const mason = tween(u, la - 0.2, mi + 0.6, ease.linear);
      wall(ctx, S, path, 1, { style: 'earth', h: 64, step: 18 });
      wall(ctx, S, path, mason, { style: 'brick', h: 74, step: 18, towerEvery: 10 });
      if (mason > 0 && mason < 1) { const [x, y] = along(path, mason); k.figure(ctx, x + 20, y + 4, { ...MING(0), s: 0.55, face: -1, armF: [1.3 + Math.sin(S.t * 8) * 0.2, 0.4] }); k.figure(ctx, x + 80, y + 18, { ...MING(1), s: 0.5, face: -1, armF: [0.9, 0.6] }); }
      if (photo > 0) { ctx.save(); ctx.translate(W / 2, 520); ctx.rotate(-0.04); ctx.scale(photo, photo); k.rect(ctx, -330, -230, 660, 460, '#f8f6f0', P.ink, 3); ctx.beginPath(); ctx.rect(-300, -200, 600, 360); ctx.clip(); ctx.fillStyle = '#9ac0e0'; ctx.fillRect(-300, -200, 600, 360); k.hills(ctx, 600, 0, 3, ['#7a9a68', '#6a8a58', '#5a7a48'], 0); ctx.translate(-300, -200); wall(ctx, S, [[0, 300], [150, 200], [300, 260], [450, 150], [600, 190]], 1, { style: 'brick', h: 30, step: 10 }); ctx.restore(); }
      k.label(ctx, 'MING DYNASTY · 1368–1644', W / 2, 1040, 22, tween(u, mi, mi + 0.4));
    },
  },
  { // 38.0 "And no, you can't see it from space with just your eyes."
    start: 37.7, title: 'Not From Space', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const no = S.at('no,'), sp = S.at('space'), ey = S.at('eyes.');
      // pull back from the wall to orbit: it thins to a hair, then vanishes
      const out = tween(u, no - 0.2, sp + 0.6, ease.inOut);
      S.cam(1, W / 2, 600);
      k.nightSky(ctx, -80, -80, W + 160, 1260, S.t);
      const R = lerp(2600, 360, out), cy = lerp(2900, 640, out);
      ctx.save(); ctx.beginPath(); ctx.arc(W / 2, cy, R, 0, TAU); k.fillStroke(ctx, '#3f6f9a', P.ink, 3); ctx.clip();
      for (const [dx, dy, rr] of [[-0.25, -0.2, 0.3], [0.2, -0.35, 0.25], [0.15, 0.15, 0.22], [-0.3, 0.3, 0.18]]) k.blob(ctx, W / 2 + dx * R, cy + dy * R, rr * R, 3 + dx * 10, 0.25, 14, '#8aa068', P.ink, 2);
      ctx.restore();
      const wa = 1 - tween(u, sp - 0.6, sp + 0.4);
      if (wa > 0) { ctx.save(); ctx.globalAlpha = wa; ctx.beginPath(); ctx.moveTo(W / 2 - R * 0.45, cy - R * 0.32); ctx.quadraticCurveTo(W / 2 - R * 0.2, cy - R * 0.45, W / 2 + R * 0.05, cy - R * 0.3); k.stroke(ctx, BRICK, Math.max(1, 24 * (1 - out))); ctx.restore(); }
      // an eye looking down from orbit, crossed out
      const e = tween(u, ey - 0.6, ey);
      if (e > 0) { ctx.save(); ctx.globalAlpha = e; ctx.translate(W / 2, 220); ctx.beginPath(); ctx.moveTo(-120, 0); ctx.quadraticCurveTo(0, -80, 120, 0); ctx.quadraticCurveTo(0, 80, -120, 0); k.fillStroke(ctx, P.white, P.ink, 4); k.circle(ctx, 0, 0, 34, '#5a3a1a', P.ink, 2); k.circle(ctx, 0, 0, 14, P.ink, null); ctx.beginPath(); ctx.moveTo(-140, -70); ctx.lineTo(140, 70); k.stroke(ctx, P.verm, 14); ctx.restore(); }
      k.label(ctx, 'ASTRONAUTS IN LOW ORBIT AGREE', W / 2, 1040, 20, tween(u, ey, ey + 0.4));
    },
  },
  { // 42.3 "A patchwork of enemy walls that became a symbol of a nation."
    start: 41.9, title: 'A Patchwork Wall', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const pa = S.at('patchwork'), en = S.at('enemy'), sy = S.at('symbol'), na = S.at('nation.');
      S.cam(lerp(1.3, 1.0, tween(u, 0, sy, ease.inOut)), W / 2, lerp(700, 600, tween(u, 0, sy)));
      hillsBack(ctx, S, 400, 16);
      // pieces of every age and kingdom, stitched end to end with gold thread
      const path = [[-60, 880], [140, 760], [320, 820], [500, 660], [700, 720], [880, 590], [1140, 620]];
      const cols = [EARTH, KINGDOMS.zhao.c, '#5a5a5a', KINGDOMS.wei.c, KINGDOMS.yan.c, BRICK, EARTH, BRICK];
      const st = tween(u, pa - 0.2, sy, ease.linear);
      for (let i = 0; i < 8; i++) { const a = i / 8, b = (i + 1) / 8 - 0.01, pts = []; for (let q = a; q <= b; q += 0.01) pts.push(along(path, q)); const show = clamp(st * 9 - i); if (show <= 0) continue; ctx.save(); ctx.translate(0, (1 - show) * -80); ctx.globalAlpha = show; wall(ctx, S, pts, 1, { style: i % 3 === 2 ? 'brick' : 'earth', color: cols[i], h: 70, step: 18 }); ctx.restore(); if (show >= 1 && i < 7) { const [x, y] = along(path, b + 0.005); for (let s = 0; s < 3; s++) { ctx.beginPath(); ctx.moveTo(x - 6, y - 12 - s * 14); ctx.lineTo(x + 6, y - 6 - s * 14); k.stroke(ctx, P.goldLight, 3); } } }
      const glow = tween(u, sy, na + 0.6);
      if (glow > 0) { ctx.save(); ctx.globalAlpha = 0.4 * glow; for (let i = 0; i < 16; i++) { const a = i / 16 * TAU + S.t * 0.1; ctx.beginPath(); ctx.moveTo(W / 2, 640); ctx.lineTo(W / 2 + Math.cos(a) * 900, 640 + Math.sin(a) * 900); k.stroke(ctx, P.goldLight, 14); } ctx.restore(); }
      for (let i = 0; i < 5; i++) k.figure(ctx, 200 + i * 170, 1080, { ...(i % 2 ? MING(i) : ROBE(i)), s: 0.6, face: 1, mood: glow > 0.5 ? 'happy' : 'calm', ...act(glow > 0.3 ? 'cheer' : 'rest', u + i, glow) });
    },
  },
  { // 47.6 "Every legend has a beginning."
    start: 47.3, title: 'Every Legend Has a Beginning', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S, beg = S.at('beginning.');
      ctx.save(); S.cam(lerp(1.0, 1.4, tween(u, 0, beg)), W / 2, 300);
      kingdomMap(ctx, S, { walls: () => 1 });
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
  { t: 0.3, type: 'wind', gain: 0.3 }, { t: 1.8, type: 'crack', gain: 0.45 }, { t: 3.8, type: 'pop', gain: 0.3 }, { t: 4.2, type: 'pop', gain: 0.3, pitch: 1.2 },
  { t: 5.6, type: 'stamp', gain: 0.5 }, ...Array.from({ length: 7 }, (_, i) => ({ t: +(8.0 + i * 0.25).toFixed(2), type: 'pluck', gain: 0.2, pitch: 1 + i * 0.07 })), { t: 9.9, type: 'clank', gain: 0.4 },
  ...Array.from({ length: 8 }, (_, i) => ({ t: +(10.9 + i * 0.28).toFixed(2), type: 'thud', gain: 0.3, pitch: 0.9 })),
  { t: 13.5, type: 'stamp', gain: 0.5 }, { t: 16.7, type: 'riser', gain: 0.35 }, { t: 17.5, type: 'gong', gain: 0.5 },
  { t: 19.9, type: 'chime', gain: 0.4, pitch: 1.2 }, { t: 20.5, type: 'gong', gain: 0.45, pitch: 0.8 },
  { t: 21.8, type: 'whoosh', gain: 0.3 }, { t: 24.0, type: 'chime', gain: 0.4, pitch: 1.4 }, { t: 25.5, type: 'thud', gain: 0.35 }, { t: 25.8, type: 'thud', gain: 0.35 }, { t: 26.1, type: 'thud', gain: 0.35 },
  { t: 27.4, type: 'pop', gain: 0.4 }, { t: 30.1, type: 'clank', gain: 0.45 }, { t: 30.6, type: 'crack', gain: 0.4 },
  { t: 33.4, type: 'pop', gain: 0.35, pitch: 1.4 }, ...Array.from({ length: 6 }, (_, i) => ({ t: +(35.2 + i * 0.25).toFixed(2), type: 'clank', gain: 0.15, pitch: 1.6 })),
  { t: 38.1, type: 'whoosh', gain: 0.4 }, { t: 39.6, type: 'riser', gain: 0.3 }, { t: 40.8, type: 'pop', gain: 0.4 },
  { t: 42.3, type: 'pluck', gain: 0.3 }, { t: 43.4, type: 'pluck', gain: 0.3, pitch: 1.2 }, { t: 45.3, type: 'chime', gain: 0.5, pitch: 1.3 }, { t: 46.1, type: 'gong', gain: 0.55 },
];

export const music = {
  bpm: 96, root: 'A', maqam: 'rast', gain: 0.3,
  sections: [
    { from: 0, to: 5.2, mood: 'intro' },
    { from: 5.2, to: 21.4, mood: 'drive' },
    { from: 21.4, to: 32.0, mood: 'groove' },
    { from: 32.0, to: 41.9, mood: 'groove' },
    { from: 41.9, to: 49.9, mood: 'triumph' },
    { from: 49.9, to: 51.7, mood: 'end' },
  ],
};
