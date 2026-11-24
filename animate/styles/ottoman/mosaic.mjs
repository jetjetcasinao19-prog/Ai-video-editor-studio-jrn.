// Roman-floor mosaics for any story: paint a picture offscreen, then re-lay it
// as square tesserae (nearest colour from a tile palette, jittered, on grout).
//   const tiles = mosaic('key', S, (g, S) => { ...paint into g... });
//   drawMosaic(ctx, tiles, tl => appear0to1, grout)
// Tiles are cached per key, so paint functions should not depend on S.t.
import { createCanvas } from '@napi-rs/canvas';
import { clamp, ease, rng } from '../../lib/core.mjs';

// ---------- the mosaic: any picture, re-laid as square tesserae ----------
const TESS = ['#f3ead8', '#e3d3b4', '#c9a878', '#a8784a', '#7a4a2a', '#2a1c12', '#9a2a1e', '#c4632e', '#d8a848', '#5a6a4a', '#3a5a6a', '#8a8a8a', '#e8b890', '#2f5f8a'];
const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const TESS_RGB = TESS.map(hex);
const MOS = {}, T = 22, MW = 1080, MH = 1100;
export function mosaic(key, S, paint) {
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
export function drawMosaic(ctx, tiles, appear, grout = '#cfc4ae') {
  ctx.fillStyle = grout; ctx.fillRect(-80, -80, MW + 160, MH + 160);
  for (const tl of tiles) {
    const a = clamp(appear(tl)); if (a <= 0) continue;
    const x = tl.i * T + T / 2 + tl.jx, y = tl.j * T + T / 2 + tl.jy, sz = (T - 3) * ease.outBack(a);
    ctx.save(); ctx.translate(x, y); ctx.rotate(tl.r); ctx.fillStyle = tl.c; ctx.fillRect(-sz / 2, -sz / 2, sz, sz); ctx.restore();
  }
}
export function mosaicBorder(g, S) { // a black-and-white meander frame, as on Roman floors
  const { k, P } = S;
  g.fillStyle = '#2a1c12'; g.fillRect(0, 0, MW, 66); g.fillRect(0, MH - 66, MW, 66); g.fillRect(0, 0, 66, MH); g.fillRect(MW - 66, 0, 66, MH);
  g.fillStyle = '#f3ead8'; for (let x = 22; x < MW; x += 88) { g.fillRect(x, 22, 44, 22); g.fillRect(x, MH - 44, 44, 22); } for (let y = 110; y < MH - 66; y += 88) { g.fillRect(22, y, 22, 44); g.fillRect(MW - 44, y, 22, 44); }
}
