// "Gladiators Began at a Funeral" — told as a Roman floor mosaic (`mosaic`
// device): the story opens on a gladiator mosaic laid tile by tile, its tiles
// flip to a funeral, and at the end the Colosseum turns out to be a mosaic on a
// villa floor. The dead are honoured, the fighters (likely war captives) are
// shown with dignity, and the fights are stylised: no blood, no wounds.
import { createCanvas } from '@napi-rs/canvas';
import { clamp, lerp, ease, tween, rng, TAU, pop } from '../../lib/core.mjs';
import { interior, bookCover } from '../../styles/ottoman/scenes.mjs';
import { act } from '../../styles/ottoman/acting.mjs';

export const meta = {
  title: 'Gladiators Began at a Funeral',
  slug: 'gladiators-ottoman',
  style: 'ottoman',
  look: 'album',    // album page (after karagoz, tile, scroll)
  ambient: 'dust',
  room: 'library',
  device: 'mosaic',
  width: 1080, height: 1920, fps: 30,
  duration: 52.5,
  voice: 'voice.mp3',
  seed: 264,
  captionChars: 30,
  brand: { handle: '@HOWITSTARTED-YT1', logo: '../../../brand/logo.png' },
  outro: { at: 50.7, text: 'Subscribe for more origin stories' },
};

const TOGA = (i = 0, o = {}) => ({ robe: '#efe9dc', inner: '#6a2a5a', sash: '#efe9dc', hat: 'shorthair', hair: ['#3a2a20', '#5a4a3a', '#2a1c12'][i % 3], skin: ['#e2b48a', '#d9a882', '#c99a6e'][i % 3], ...o });
const GLAD = i => ({ robe: ['#9a2a1e', '#2f5f8a', '#b0532e', '#3d6a4a'][i % 4], inner: '#d8b878', sash: '#8a6a2a', hat: 'gladhelm', crest: ['#c4371f', '#2a2a2a', '#ecd57a', '#f8f2e2'][i % 4], skin: ['#c99a6e', '#d9a882', '#a86c45', '#e2b48a'][i % 4] });
const sword = k => c => { k.rect(c, -6, -100, 12, 92, '#d8dde2', '#2a1c12', 1.5); k.rect(c, -16, -10, 32, 8, '#8a6a2a', '#2a1c12', 1.5); };
function scutum(ctx, k, x, y, s, color = '#9a2a1e') { // a curved oblong shield with a boss
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  k.rect(ctx, -38, -70, 76, 140, color, '#2a1c12', 2.5); k.rect(ctx, -30, -62, 60, 124, null, '#d8b878', 2);
  k.circle(ctx, 0, 0, 14, '#d8b878', '#2a1c12', 2); ctx.restore();
}
// a pair of gladiators, sword to sword; `beat` drives the stylised clash
function pair(ctx, S, x, y, s, i, beat = 0) {
  const { k } = S, b = Math.sin(beat), lean = b * 10 * s;
  k.figure(ctx, x - 70 * s + lean, y, { ...GLAD(i * 2), s, face: 1, armF: [1.45 + b * 0.15, -0.3], hold: sword(k) });
  scutum(ctx, k, x - 40 * s + lean, y - 160 * s, s * 0.9, GLAD(i * 2).robe);
  k.figure(ctx, x + 70 * s + lean, y, { ...GLAD(i * 2 + 1), s, face: -1, armF: [1.45 - b * 0.15, -0.3], hold: sword(k) });
  scutum(ctx, k, x + 40 * s + lean, y - 160 * s, s * 0.9, GLAD(i * 2 + 1).robe);
}
function ox(ctx, k, P, x, y, s, f = 1, t = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * f, s);
  k.ellipse(ctx, 0, -70, 90, 46, 0, '#c9b8a0', P.ink, 2.5);
  for (const [lx, ph] of [[-60, 0], [-36, 1], [44, 2], [66, 3]]) k.rect(ctx, lx - 7, -40 + Math.sin(t * 3 + ph) * 2, 14, 48, '#b8a68e', P.ink, 1.8);
  k.ellipse(ctx, 100, -96, 30, 22, 0.3, '#c9b8a0', P.ink, 2.2);
  ctx.beginPath(); ctx.moveTo(88, -114); ctx.quadraticCurveTo(80, -150, 104, -146); ctx.moveTo(112, -112); ctx.quadraticCurveTo(130, -146, 146, -128); k.stroke(ctx, '#efe6cf', 6);
  k.circle(ctx, 112, -100, 3, P.ink, null);
  ctx.beginPath(); ctx.moveTo(-90, -80); ctx.quadraticCurveTo(-110, -40 + Math.sin(t * 4) * 8, -104, -20); k.stroke(ctx, P.ink, 3);
  ctx.restore();
}
function colosseum(ctx, S, x, base, w, rise = 1, crowd = 0) { // the amphitheatre in elevation, tier by tier
  const { k, P } = S, h = w * 0.42, tiers = 4;
  ctx.save(); ctx.translate(x, base);
  for (let tI = 0; tI < tiers; tI++) {
    const q = clamp(rise * tiers - tI); if (q <= 0) continue;
    const y0 = -tI * h / tiers, hh = h / tiers;
    ctx.save(); ctx.beginPath(); ctx.rect(-w / 2 - 4, y0 - hh * q, w + 8, hh * q + 2); ctx.clip();
    k.rect(ctx, -w / 2, y0 - hh, w, hh, '#e2cfa8', P.ink, 2.5);
    const n = tI === 3 ? 0 : 12;
    for (let i = 0; i < n; i++) { const ax = -w / 2 + (i + 0.5) * w / n; k.arch(ctx, ax, y0 - hh * 0.12, w / n * 0.62, hh * 0.72, crowd > 0 && tI < 3 ? '#7a5a3a' : '#5a4a3a'); }
    if (tI === 3) for (let i = 0; i < 14; i++) k.rect(ctx, -w / 2 + 18 + i * (w - 36) / 13 - 8, y0 - hh * 0.7, 16, 26, '#5a4a3a', null);
    ctx.restore();
  }
  ctx.restore();
}

// ---------- the mosaic: any picture, re-laid as square tesserae ----------
const TESS = ['#f3ead8', '#e3d3b4', '#c9a878', '#a8784a', '#7a4a2a', '#2a1c12', '#9a2a1e', '#c4632e', '#d8a848', '#5a6a4a', '#3a5a6a', '#8a8a8a', '#e8b890', '#2f5f8a'];
const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const TESS_RGB = TESS.map(hex);
const MOS = {}, T = 22, MW = 1080, MH = 1100;
function mosaic(key, S, paint) {
  if (MOS[key]) return MOS[key];
  const c = createCanvas(MW, MH), g = c.getContext('2d');
  g.fillStyle = '#f3ead8'; g.fillRect(0, 0, MW, MH); paint(g, S);
  const d = g.getImageData(0, 0, MW, MH).data, cols = Math.ceil(MW / T), rows = Math.ceil(MH / T), R = rng(key.length * 31), tiles = [];
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const px = Math.min(MW - 1, i * T + T / 2), py = Math.min(MH - 1, j * T + T / 2), o = (py * MW + px) * 4;
    const r = d[o], gg = d[o + 1], b = d[o + 2];
    let best = 0, bd = 1e9; TESS_RGB.forEach(([a, bb, cc], n) => { const dd = (a - r) ** 2 + (bb - gg) ** 2 + (cc - b) ** 2; if (dd < bd) { bd = dd; best = n; } });
    tiles.push({ i, j, c: TESS[best], jx: (R() - 0.5) * 3, jy: (R() - 0.5) * 3, r: (R() - 0.5) * 0.12, n: R() });
  }
  return (MOS[key] = tiles);
}
// lay the tiles; appear(tile) 0..1
function drawMosaic(ctx, tiles, appear, grout = '#cfc4ae') {
  ctx.fillStyle = grout; ctx.fillRect(-80, -80, MW + 160, MH + 160);
  for (const tl of tiles) {
    const a = clamp(appear(tl)); if (a <= 0) continue;
    const x = tl.i * T + T / 2 + tl.jx, y = tl.j * T + T / 2 + tl.jy, sz = (T - 3) * ease.outBack(a);
    ctx.save(); ctx.translate(x, y); ctx.rotate(tl.r); ctx.fillStyle = tl.c; ctx.fillRect(-sz / 2, -sz / 2, sz, sz); ctx.restore();
  }
}
function border(g, S) { // a black-and-white meander frame, as on Roman floors
  const { k, P } = S;
  g.fillStyle = '#2a1c12'; g.fillRect(0, 0, MW, 66); g.fillRect(0, MH - 66, MW, 66); g.fillRect(0, 0, 66, MH); g.fillRect(MW - 66, 0, 66, MH);
  g.fillStyle = '#f3ead8'; for (let x = 22; x < MW; x += 88) { g.fillRect(x, 22, 44, 22); g.fillRect(x, MH - 44, 44, 22); } for (let y = 110; y < MH - 66; y += 88) { g.fillRect(22, y, 22, 44); g.fillRect(MW - 44, y, 22, 44); }
}
const paintFighters = (g, S) => { border(g, S); g.fillStyle = '#e3d3b4'; g.fillRect(66, 860, MW - 132, 174); pair(g, S, MW / 2, 900, 2.0, 0, 0.6); };
const paintFuneral = (g, S) => {
  const { k, P } = S; border(g, S);
  g.fillStyle = '#3a5a6a'; g.fillRect(66, 66, MW - 132, MH - 132);
  k.rect(g, 220, 640, 640, 70, '#7a4a2a', P.ink, 3); for (const lx of [260, 800]) k.rect(g, lx, 710, 30, 160, '#7a4a2a', P.ink, 2);
  k.ellipse(g, 540, 620, 300, 50, 0, '#f3ead8', P.ink, 3); k.circle(g, 290, 590, 40, '#e8b890', P.ink, 2);
  for (let i = 0; i < 10; i++) k.ellipse(g, 262 + i * 10, 560 - Math.sin(i / 3) * 10, 12, 6, i, '#5a6a4a', null);
  for (const lx of [160, 920]) { k.rect(g, lx - 10, 380, 20, 260, '#d8a848', P.ink, 2); k.ellipse(g, lx, 360, 26, 40, 0, '#c4632e', null); k.ellipse(g, lx, 370, 12, 22, 0, '#d8a848', null); }
};
const paintArena = (g, S) => {
  border(g, S); g.fillStyle = '#d8a848'; g.fillRect(66, 66, MW - 132, 420);
  colosseum(g, S, MW / 2, 860, 860, 1, 1); g.fillStyle = '#c9a878'; g.fillRect(66, 860, MW - 132, 174);
  pair(g, S, MW / 2, 1000, 0.6, 1, 0.4);
};

export const scenes = [
  { // 0.0 "Gladiator fights didn't start as entertainment. They started at a funeral."
    start: 0, title: 'It Began at a Funeral',
    draw(ctx, u, S) {
      const { k, W } = S;
      const en = S.at('entertainment.'), fu = S.at('funeral.');
      S.cam(lerp(1.35, 1.0, tween(u, 0, en + 0.6, ease.inOut)), W / 2, lerp(820, 560, tween(u, 0, en + 0.6)));
      const A = mosaic('fighters', S, paintFighters), B = mosaic('funeral', S, paintFuneral);
      const lay = tween(u, 0, en + 0.4, ease.linear), flip = tween(u, fu - 1.0, fu + 0.4, ease.linear);
      // tiles go down from the bottom up, as a mosaicist works; then flip, one by one, to the funeral
      drawMosaic(ctx, A, tl => (lay * 1.5 - (1 - tl.j / 50) - tl.n * 0.2) * 5);
      if (flip > 0) drawMosaic(ctx, B, tl => (flip * 1.6 - tl.n * 0.6 - Math.abs(tl.i - 24) / 60) * 4, 'rgba(0,0,0,0)');
    },
  },
  { // 6.3 "264 BC, Rome."
    start: 5.9, title: 'Rome, 264 BC', trans: 'ink',
    draw(ctx, u, S) {
      const { k, P, W } = S, ro = S.at('Rome.');
      S.cam(lerp(1.0, 1.15, tween(u, 0, 3.4, ease.inOut)), W / 2, 640);
      k.goldSky(ctx, -80, -80, W + 160, 700, S.t);
      k.hills(ctx, W, 520, 7, ['#b8a060', '#a89050', '#98904e'], S.t);
      // the river and the city of brick and tile: temples with pediments, no domes
      ctx.save(); ctx.beginPath(); ctx.moveTo(-80, 1000); ctx.quadraticCurveTo(400, 900, 700, 1060); ctx.quadraticCurveTo(900, 1160, 1160, 1080); ctx.lineTo(1160, 1260); ctx.lineTo(-80, 1260); ctx.closePath(); ctx.clip(); k.waves(ctx, -80, 880, W + 160, 380, S.t, '#3f6f9a', '#6f9cc0', 20, 24); ctx.restore();
      k.ground(ctx, -80, 640, W + 160, 300, '#d8c08a', 7, 0.2);
      const city = tween(u, 0.1, ro + 0.8);
      const R = rng(4);
      for (let i = 0; i < 16; i++) { const q = clamp(city * 1.5 - i / 16); if (q <= 0) continue; const x = 60 + (i % 8) * 128 + R() * 30, y = 760 + Math.floor(i / 8) * 120 + R() * 20, w = 90 + R() * 30, h = (60 + R() * 60) * q; k.rect(ctx, x, y - h, w, h, ['#e8c9a0', '#d8a878', '#efe6cf'][i % 3], P.ink, 1.8); k.poly(ctx, [[x - 6, y - h], [x + w / 2, y - h - 26 * q], [x + w + 6, y - h]], '#b0532e', P.ink, 1.5); }
      // one temple on the hill, columns and a pediment
      ctx.save(); ctx.translate(780, 620); const tq = tween(u, ro - 0.3, ro + 0.4, ease.outBack); ctx.scale(tq, tq); for (let i = 0; i < 6; i++) k.rect(ctx, -110 + i * 40, -120, 18, 120, '#efe8da', P.ink, 1.5); k.rect(ctx, -126, -136, 252, 18, '#efe8da', P.ink, 1.8); k.poly(ctx, [[-130, -136], [0, -190], [130, -136]], '#efe8da', P.ink, 1.8); ctx.restore();
      k.seal(ctx, 200, 200, 80, ' THE YEAR · 264 BC ·', '264 BC', tween(u, 0.2, 0.6, ease.linear));
    },
  },
  { // 9.6 "A powerful man, Brutus Pera, has died."
    start: 9.4, title: 'Brutus Pera Dies', trans: 'page',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const po = S.at('powerful'), br = S.at('Brutus'), di = S.at('died.');
      S.cam(lerp(1.0, 1.2, tween(u, br - 0.4, di + 0.8, ease.inOut)), W / 2, lerp(600, 700, tween(u, br - 0.4, di + 0.8)));
      interior(ctx, S, { arches: 3, carpet: false });
      // the wax masks of his ancestors on the wall: a Roman noble house
      for (let i = 0; i < 5; i++) { const x = 220 + i * 160, y = 380; k.rect(ctx, x - 50, y - 70, 100, 130, '#7a4a2a', P.ink, 2); k.ellipse(ctx, x, y, 30, 40, 0, '#e8d6b8', P.ink, 1.5); k.circle(ctx, x - 10, y - 6, 3, P.ink, null); k.circle(ctx, x + 10, y - 6, 3, P.ink, null); }
      // the bier, in state: the toga with its purple border, the laurel
      const dim = tween(u, di - 0.2, di + 0.8);
      k.rect(ctx, 260, 820, 560, 60, '#7a4a2a', P.ink, 3); for (const lx of [290, 770]) k.rect(ctx, lx, 880, 24, 120, '#7a4a2a', P.ink, 2);
      ctx.save(); ctx.translate(540, 800); k.ellipse(ctx, 0, 0, 260, 44, 0, '#efe9dc', P.ink, 2.5); ctx.beginPath(); ctx.moveTo(-240, 14); ctx.quadraticCurveTo(0, 40, 240, 14); k.stroke(ctx, '#6a2a5a', 6); k.circle(ctx, -250, -20, 34, '#e2b48a', P.ink, 2); for (let i = 0; i < 9; i++) k.ellipse(ctx, -276 + i * 7, -46 - Math.sin(i / 3) * 8, 10, 5, i, P.green, P.ink, 0.8); ctx.restore();
      for (const lx of [180, 900]) { k.rect(ctx, lx - 8, 640, 16, 360, '#c9a227', P.ink, 2); k.ellipse(ctx, lx, 620, 16 * (1 + Math.sin(S.t * 9 + lx) * 0.1), 28, 0, '#f0a040', null); }
      // two mourners in dark cloaks
      for (let i = 0; i < 2; i++) k.figure(ctx, 330 + i * 420, 1060, { ...TOGA(i), robe: '#3a3a4a', inner: '#2a2a3a', sash: '#3a3a4a', s: 0.85, face: i ? -1 : 1, mood: 'sad', ...act('worry', u, dim) });
      k.label(ctx, 'D. JUNIUS BRUTUS PERA', W / 2, 220, 22, tween(u, br, br + 0.4));
      ctx.save(); ctx.fillStyle = `rgba(20,20,40,${0.2 * dim})`; ctx.fillRect(-80, -80, W + 160, 1240); ctx.restore();
    },
  },
  { // 13.3 "To honor him, his sons hold something new in the city's cattle market,"
    start: 13.1, title: 'In the Cattle Market', trans: 'wipe',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const so = S.at('sons'), ne = S.at('new'), ca = S.at('cattle'), ma = S.at('market,');
      S.cam(lerp(1.25, 0.95, tween(u, ca - 0.6, ma + 0.6, ease.inOut)), lerp(320, W / 2, tween(u, ca - 0.6, ma + 0.6)), lerp(820, 640, tween(u, ca - 0.6, ma + 0.6)));
      k.goldSky(ctx, -80, -80, W + 160, 520, S.t);
      // the river port behind, stalls and pens in front
      for (let i = 0; i < 4; i++) { const x = 80 + i * 250; k.rect(ctx, x, 500, 170, 160, '#e8c9a0', P.ink, 2); for (let a = 0; a < 3; a++) { k.ellipse(ctx, x + 40 + a * 45, 610, 16, 30, 0, ['#b0532e', '#c9a878', '#8a5a3a'][(a + i) % 3], P.ink, 1.5); k.rect(ctx, x + 34 + a * 45, 572, 12, 12, ['#b0532e', '#c9a878', '#8a5a3a'][(a + i) % 3], P.ink, 1); } k.canopy(ctx, x + 85, 480, 200, 40, ['#9a2a1e', '#2f5f8a', '#d8a848', '#3d6a4a'][i], S.t); }
      k.ground(ctx, -80, 660, W + 160, 620, '#d8c08a', 3, 0.3);
      // the cattle are led aside and a ring of sand is cleared
      const clear = tween(u, ma - 0.2, ma + 1.0, ease.inOut);
      for (let i = 0; i < 4; i++) ox(ctx, k, P, lerp(380 + i * 150, 1150 + i * 140, clear), 820 + (i % 2) * 70, 0.95, 1, S.t + i);
      if (clear > 0.1) { ctx.save(); ctx.globalAlpha = clear; ctx.beginPath(); ctx.ellipse(540, 900, 380 * clear, 110 * clear, 0, 0, TAU); ctx.fillStyle = '#ecdcb4'; ctx.fill(); ctx.setLineDash([12, 10]); k.stroke(ctx, P.ink, 3); ctx.restore(); }
      // the two sons, in togas, at the head of it
      for (let i = 0; i < 2; i++) k.figure(ctx, 150 + i * 130, 1080, { ...TOGA(i + 1), s: 0.9, face: 1, mood: 'calm', ...act(i ? 'present' : 'point', u, tween(u, so - 0.2, so + 0.3)) });
      k.label(ctx, 'FORUM BOARIUM', 760, 260, 22, tween(u, ca, ca + 0.4));
    },
  },
  { // 18.0 "armed men fighting in pairs."
    start: 17.7, title: 'Three Pairs', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const ar = S.at('armed'), fi = S.at('fighting'), pa = S.at('pairs.');
      S.cam(lerp(1.4, 1.0, tween(u, 0, pa + 0.5, ease.inOut)), W / 2, lerp(860, 700, tween(u, 0, pa + 0.5)));
      k.goldSky(ctx, -80, -80, W + 160, 520, S.t);
      k.ground(ctx, -80, 500, W + 160, 760, '#ecdcb4', 5, 0.15);
      // the onlookers, the family in front
      for (let i = 0; i < 9; i++) k.figure(ctx, 60 + i * 120, 560, { ...TOGA(i), robe: i < 3 ? '#3a3a4a' : ['#efe9dc', '#c9b89a', '#d8c9a8'][i % 3], s: 0.5, face: 1, mood: 'wow', armF: [0.4, 0.3] });
      // Livy counts three pairs
      for (let p = 0; p < 3; p++) { const a = tween(u, ar - 0.3 + p * 0.3, ar + 0.2 + p * 0.3, ease.outBack); if (a <= 0) continue; ctx.save(); ctx.translate(200 + p * 340, 980 - (p % 2) * 160); ctx.scale(a, a); pair(ctx, S, 0, 0, 0.7, p, u > fi ? S.t * 7 + p : 0); ctx.restore(); }
      k.label(ctx, 'THREE PAIRS · AS LIVY TELLS IT', W / 2, 260, 20, tween(u, pa, pa + 0.4));
    },
  },
  { // 21.0 "The Romans called it a munus, a duty owed to the dead."
    start: 20.6, title: 'A Munus', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const mu = S.at('munus,'), du = S.at('duty'), de = S.at('dead.');
      S.cam(lerp(1.0, 1.2, tween(u, du - 0.3, de + 0.6, ease.inOut)), W / 2, lerp(520, 720, tween(u, du - 0.3, de + 0.6)));
      ctx.fillStyle = '#efe6cf'; ctx.fillRect(-80, -80, W + 160, 1240);
      // the word, cut in Roman capitals into a marble slab
      k.rect(ctx, 140, 220, 800, 260, '#e8e2d6', P.ink, 3);
      const cut = tween(u, mu - 0.3, mu + 0.6, ease.linear);
      ctx.fillStyle = '#9a2a1e'; ctx.font = '900 170px Deco'; ctx.textAlign = 'center'; ctx.fillText('MVNVS'.slice(0, Math.ceil(5 * cut)), W / 2, 420);
      // a son pours an offering at the tomb: what the living owe the dead
      k.rect(ctx, 600, 680, 300, 340, '#d8d0c0', P.ink, 3); k.poly(ctx, [[580, 680], [750, 600], [920, 680]], '#d8d0c0', P.ink, 3);
      ctx.fillStyle = P.ink; ctx.font = '700 30px Fell'; ctx.fillText('D · M', 750, 760);
      const pour = tween(u, du - 0.3, du + 0.5);
      k.figure(ctx, 380, 1060, { ...TOGA(1), s: 1.0, face: 1, mood: 'calm', armF: [lerp(0.4, 1.3, pour), -0.2] });
      if (pour > 0.6) { ctx.beginPath(); ctx.moveTo(500, 760); ctx.quadraticCurveTo(540, 860, 560, 1000); k.stroke(ctx, '#7a2a3a', 6); }
      const sm = tween(u, de - 0.4, de + 0.8);
      for (let i = 0; i < 4; i++) { ctx.save(); ctx.globalAlpha = 0.5 * sm; ctx.beginPath(); ctx.moveTo(560 + i * 8, 980); for (let j = 1; j < 10; j++) ctx.lineTo(560 + i * 8 + Math.sin(S.t * 2 + j + i) * 14, 980 - j * 34 * sm); k.stroke(ctx, P.white, 6); ctx.restore(); }
    },
  },
  { // 25.4 "The fighters were likely prisoners of war."
    start: 25.2, title: 'Prisoners of War', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const li = S.at('likely'), pr = S.at('prisoners'), wa = S.at('war.');
      S.cam(lerp(1.0, 1.15, tween(u, 0, wa + 0.8, ease.inOut)), lerp(W / 2, 600, tween(u, 0, wa + 0.8)), 680);
      k.goldSky(ctx, -80, -80, W + 160, 600, S.t);
      k.hills(ctx, W, 480, 22, ['#b8a060', '#a89050', '#98904e'], S.t);
      k.ground(ctx, -80, 600, W + 160, 660, '#d8c08a', 22, 0.4);
      // captured soldiers, in the armour of their own peoples, walk under guard: heads down
      const walk = tween(u, 0, wa + 1.2, ease.linear);
      for (let i = 0; i < 6; i++) k.figure(ctx, lerp(-120, 520, walk) + i * 120, 1000 + (i % 2) * 20, { robe: ['#5a6a4a', '#7a5a3a', '#6a6a7a'][i % 3], inner: '#c9b89a', sash: '#3a2a1a', hat: i % 2 ? 'greekhelm' : 'shorthair', hatColor: '#9a9a8a', crest: '#5a4a3a', hair: '#3a2a20', skin: ['#c99a6e', '#d9a882', '#b88a5e'][i % 3], beard: true, s: 0.75, face: 1, walk: S.t * 5 + i, mood: 'sad', armF: [0.2, 0.2], armB: [0.2, 0.2] });
      k.figure(ctx, lerp(-260, 380, walk), 1020, { ...TOGA(0), robe: '#9a2a1e', inner: '#c9a227', hat: 'helmet', hatColor: '#c9a24a', s: 0.8, face: 1, walk: S.t * 5, armF: [1.2, 0.2] });
      // the historian's hedge: a question, quietly
      const q = tween(u, li, li + 0.4);
      ctx.save(); ctx.globalAlpha = q; ctx.fillStyle = P.vermDark; ctx.font = '900 130px Deco'; ctx.textAlign = 'center'; ctx.fillText('?', 900, 330); ctx.restore();
      k.label(ctx, 'THE SOURCES DON’T SAY FOR SURE', 520, 230, 18, tween(u, pr, pr + 0.4));
    },
  },
  { // 28.6 "Soon, rich families compete with bigger funeral games."
    start: 28.2, title: 'Bigger and Bigger', trans: 'ink',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const ri = S.at('rich'), co = S.at('compete'), bi = S.at('bigger');
      S.cam(lerp(1.0, 1.1, tween(u, co, bi + 1.0, ease.inOut)), W / 2, 640);
      interior(ctx, S, { arches: 2, carpet: false });
      // two noble houses, each raising the stakes: their rows of fighters grow like a contest
      const g = tween(u, co - 0.2, bi + 1.0, ease.linear);
      for (let side = 0; side < 2; side++) {
        const x0 = side ? 640 : 120, n = Math.floor(lerp(1, side ? 7 : 6, clamp(g * 1.2 - side * 0.1)));
        k.figure(ctx, x0 + 120, 640, { ...TOGA(side, { robe: side ? '#efe9dc' : '#e8dcc0' }), s: 0.85, face: side ? -1 : 1, mood: 'happy', ...act('present', u, tween(u, ri - 0.2 + side * 0.3, ri + 0.2 + side * 0.3)) });
        for (let i = 0; i < n; i++) k.figure(ctx, x0 + 40 + (i % 4) * 80, 860 + Math.floor(i / 4) * 150, { ...GLAD(i + side), s: 0.42, face: side ? -1 : 1, armF: [1.45, -0.3], hold: sword(k) });
        ctx.fillStyle = side ? P.lapis : P.vermDark; ctx.font = '900 70px Deco'; ctx.textAlign = 'center'; ctx.fillText(String(n), x0 + 160, 300);
      }
    },
  },
  { // 32.4 "One funeral has 22 pairs."
    start: 32.1, title: '22 Pairs, 216 BC', trans: 'tiles',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const tw = S.at('22'), pa = S.at('pairs.');
      S.cam(lerp(1.3, 0.95, tween(u, tw - 0.4, pa + 0.8, ease.inOut)), W / 2, lerp(760, 640, tween(u, tw - 0.4, pa + 0.8)));
      ctx.fillStyle = '#ecdcb4'; ctx.fillRect(-80, -80, W + 160, 1240);
      ctx.save(); ctx.globalAlpha = 0.25; ctx.fillStyle = k.pattern(ctx, 'tiles', '#ecdcb4', '#c9a878', 60); ctx.fillRect(-80, -80, W + 160, 1240); ctx.restore();
      const n = Math.round(lerp(1, 22, tween(u, 0.1, pa + 0.2, ease.outCubic)));
      for (let i = 0; i < n; i++) { const c = i % 4, r = Math.floor(i / 4); ctx.save(); ctx.translate(150 + c * 260, 420 + r * 130); ctx.scale(0.36, 0.36); pair(ctx, S, 0, 0, 1, i, S.t * 6 + i); ctx.restore(); }
      ctx.fillStyle = P.vermDark; ctx.font = '900 120px Deco'; ctx.textAlign = 'center'; ctx.fillText(String(n), W / 2, 200);
      k.seal(ctx, 900, 160, 64, ' LEPIDUS · 216 BC ·', '216 BC', tween(u, pa, pa + 0.4, ease.linear));
    },
  },
  { // 35.3 "The games become a way to win the crowd."
    start: 35.0, title: 'Winning the Crowd', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const ga = S.at('games'), wi = S.at('win'), cr = S.at('crowd.');
      S.cam(lerp(1.2, 1.0, tween(u, 0, cr + 0.6, ease.inOut)), lerp(380, W / 2, tween(u, 0, cr + 0.6)), 640);
      k.goldSky(ctx, -80, -80, W + 160, 600, S.t);
      k.ground(ctx, -80, 600, W + 160, 660, '#d8c08a', 30, 0.2);
      // the sponsor on a platform; the crowd cheers, and their votes fly to him
      k.rect(ctx, 200, 760, 300, 60, '#d8d0c0', P.ink, 2.5);
      k.figure(ctx, 350, 760, { ...TOGA(2, { robe: '#f8f4ea' }), s: 1.0, face: 1, mood: 'happy', ...act('wave', u, tween(u, ga - 0.2, ga + 0.3)) });
      const ch = tween(u, wi - 0.3, wi + 0.3);
      for (let i = 0; i < 12; i++) k.figure(ctx, 560 + (i % 6) * 90, 940 + Math.floor(i / 6) * 120, { ...TOGA(i, { robe: ['#efe9dc', '#c9b89a', '#d8c9a8', '#b0532e'][i % 4] }), s: 0.5, face: -1, mood: ch > 0.5 ? 'happy' : 'calm', ...act(ch > 0.3 ? 'cheer' : 'rest', u + i, ch) });
      for (let i = 0; i < 8; i++) { const q = clamp((u - cr + 0.4 - i * 0.12) / 0.8); if (q <= 0 || q >= 1) continue; const x = lerp(700 + (i % 4) * 80, 380, q), y = lerp(880, 620, q) - Math.sin(q * Math.PI) * 140; k.rect(ctx, x - 18, y - 12, 36, 24, '#c9a878', P.ink, 1.5); ctx.fillStyle = P.ink; ctx.font = '700 16px Fell'; ctx.textAlign = 'center'; ctx.fillText('V', x, y + 6); }
      k.label(ctx, 'VOTES FOR OFFICE', 350, 380, 20, tween(u, cr, cr + 0.4));
    },
  },
  { // 38.6 "Centuries later, emperors fill giant arenas like the Colosseum,"
    start: 38.2, title: 'The Colosseum', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const em = S.at('emperors'), fi = S.at('fill'), gi = S.at('giant'), co = S.at('Colosseum,');
      S.cam(lerp(1.3, 0.95, tween(u, gi - 0.4, co + 0.4, ease.inOut)), W / 2, lerp(820, 640, tween(u, gi - 0.4, co + 0.4)));
      k.goldSky(ctx, -80, -80, W + 160, 1240, S.t);
      k.ground(ctx, -80, 900, W + 160, 360, '#d8c08a', 40, 0.2);
      colosseum(ctx, S, W / 2, 900, 940, tween(u, 0.1, co + 0.2, ease.inOut), tween(u, fi, fi + 0.6));
      // the crowd as a sea of dots on the open top tier
      const cr = tween(u, fi, co + 0.6); const R = rng(8); for (let i = 0; i < 140 * cr; i++) k.circle(ctx, 90 + R() * 900, 500 + R() * 40 + Math.sin(S.t * 8 + i) * 2, 5, ['#9a2a1e', '#efe9dc', '#2f5f8a', '#d8a848'][i % 4], null);
      k.figure(ctx, 540, 1080, { ...TOGA(0, { robe: '#6a2a5a', inner: '#c9a227', hat: 'wreath' }), s: 0.8, face: 1, mood: 'calm', ...act('present', u, tween(u, em - 0.2, em + 0.3)) });
      k.seal(ctx, 880, 180, 64, ' OPENED · AD 80 ·', 'AD 80', tween(u, co, co + 0.4, ease.linear));
    },
  },
  { // 42.5 "a funeral ritual that became Rome's most famous show."
    start: 42.1, title: 'From Funeral to Show', trans: 'tiles',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const ri = S.at('ritual'), be = S.at('became'), sh = S.at('show.');
      // pull back: the arena is a mosaic on a villa floor, laid over the old funeral
      S.cam(lerp(1.5, 0.9, tween(u, ri - 0.4, sh + 0.8, ease.inOut)), W / 2, lerp(640, 560, tween(u, ri - 0.4, sh + 0.8)));
      const A = mosaic('arena', S, paintArena), B = mosaic('funeral', S, paintFuneral);
      const turn = tween(u, ri - 0.2, be + 0.8, ease.linear);
      drawMosaic(ctx, B, tl => 1 - (turn * 1.6 - tl.n * 0.6) * 4);
      drawMosaic(ctx, A, tl => (turn * 1.6 - tl.n * 0.6) * 4, 'rgba(0,0,0,0)');
      const lamp = tween(u, sh - 0.3, sh + 0.6);
      if (lamp > 0) { ctx.save(); ctx.globalAlpha = lamp; k.ellipse(ctx, 980, 1040, 60, 26, 0, '#b0532e', P.ink, 2); k.ellipse(ctx, 1030, 1024, 14, 24, 0, '#f0a040', null); ctx.restore(); }
    },
  },
  { // 48.2 "Every legend has a beginning."
    start: 47.9, title: 'Every Legend Has a Beginning', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S, beg = S.at('beginning.');
      ctx.save(); S.cam(lerp(1.0, 1.4, tween(u, 0, beg)), W / 2, 880);
      drawMosaic(ctx, mosaic('fighters', S, paintFighters), () => 1);
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
  ...Array.from({ length: 12 }, (_, i) => ({ t: +(0.2 + i * 0.22).toFixed(2), type: 'pop', gain: 0.12, pitch: 1.4 + (i % 3) * 0.1 })),
  { t: 1.3, type: 'clank', gain: 0.4 }, { t: 3.7, type: 'gong', gain: 0.45, pitch: 0.7 }, { t: 4.8, type: 'chime', gain: 0.3, pitch: 0.8 },
  { t: 6.4, type: 'stamp', gain: 0.5 }, { t: 8.3, type: 'pluck', gain: 0.3 },
  { t: 11.0, type: 'pluck', gain: 0.25, pitch: 0.8 }, { t: 12.2, type: 'gong', gain: 0.35, pitch: 0.6 },
  { t: 15.3, type: 'pop', gain: 0.3 }, { t: 16.6, type: 'thud', gain: 0.3 }, { t: 17.0, type: 'thud', gain: 0.3 },
  { t: 18.0, type: 'clank', gain: 0.5 }, { t: 18.8, type: 'clank', gain: 0.5, pitch: 1.2 }, { t: 19.4, type: 'clank', gain: 0.5, pitch: 1.4 }, { t: 19.8, type: 'rain', gain: 0.22 },
  { t: 21.0, type: 'crack', gain: 0.35 }, { t: 21.6, type: 'crack', gain: 0.35 }, { t: 23.2, type: 'waves', gain: 0.2 }, { t: 24.6, type: 'wind', gain: 0.3 },
  ...Array.from({ length: 6 }, (_, i) => ({ t: +(25.6 + i * 0.5).toFixed(2), type: 'thud', gain: 0.2, pitch: 0.8 })),
  { t: 29.6, type: 'pop', gain: 0.3 }, { t: 30.3, type: 'pop', gain: 0.35, pitch: 1.2 }, { t: 30.8, type: 'pop', gain: 0.4, pitch: 1.4 },
  { t: 33.2, type: 'riser', gain: 0.35 }, { t: 34.0, type: 'stamp', gain: 0.55 },
  { t: 36.5, type: 'rain', gain: 0.28 }, { t: 37.0, type: 'chime', gain: 0.4, pitch: 1.3 },
  { t: 38.6, type: 'riser', gain: 0.4 }, { t: 40.0, type: 'rain', gain: 0.3 }, { t: 41.8, type: 'gong', gain: 0.55 },
  { t: 42.6, type: 'paper', gain: 0.3 }, { t: 45.0, type: 'pop', gain: 0.2 }, { t: 46.8, type: 'chime', gain: 0.5, pitch: 1.4 },
];

export const music = {
  bpm: 100, root: 'D', maqam: 'rast', gain: 0.3,
  sections: [
    { from: 0, to: 5.9, mood: 'intro' },
    { from: 5.9, to: 17.7, mood: 'sad' },
    { from: 17.7, to: 28.2, mood: 'drive' },
    { from: 28.2, to: 38.2, mood: 'groove' },
    { from: 38.2, to: 50.7, mood: 'triumph' },
    { from: 50.7, to: 52.5, mood: 'end' },
  ],
};
