// INKBLOT style kit — a psychology case file come to life.
// Black ink on old card stock, one red ink, mirror symmetry everywhere
// (the Rorschach fold), silhouettes with paper-white eyes, red-pen notes.
// Everything is deterministic (seeded) so frames can render in parallel.
import { createCanvas } from '@napi-rs/canvas';
import { TAU, clamp, lerp, rng, noise1, ease } from '../../lib/core.mjs';

export const P = {
  paper: '#efe8d8', paperLight: '#f8f3e7', paperDark: '#d9ceb5', card: '#f4eee0',
  ink: '#16141a', inkSoft: '#2d2a33', grey: '#8b8479', greyLight: '#bdb4a3',
  red: '#c61f2a', redDark: '#8d121a', redLight: '#e4636a',
  // pastel inks of the late colour plates (VIII–X)
  rose: '#e2968a', sky: '#82a7c8', ochre: '#ddb14d', sage: '#8db498', lilac: '#a491c4',
};

// ---------- small drawing helpers ----------
export function fill(ctx, c) { ctx.fillStyle = c; ctx.fill(); }
export function stroke(ctx, c = P.ink, lw = 3) { ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); }
export function circle(ctx, x, y, r, f, s, lw = 3) { ctx.beginPath(); ctx.arc(x, y, Math.max(0, r), 0, TAU); if (f) fill(ctx, f); if (s) stroke(ctx, s, lw); }
export function ellipse(ctx, x, y, rx, ry, rot, f, s, lw = 3) { ctx.beginPath(); ctx.ellipse(x, y, Math.max(0, rx), Math.max(0, ry), rot || 0, 0, TAU); if (f) fill(ctx, f); if (s) stroke(ctx, s, lw); }
export function rect(ctx, x, y, w, h, f, s, lw = 3, r = 0) { ctx.beginPath(); r ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h); if (f) fill(ctx, f); if (s) stroke(ctx, s, lw); }
export function line(ctx, x1, y1, x2, y2, c = P.ink, lw = 3) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); stroke(ctx, c, lw); }
export function poly(ctx, pts, f, s, lw = 3, close = true) {
  ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); if (close) ctx.closePath();
  if (f) fill(ctx, f); if (s) stroke(ctx, s, lw);
}
// Catmull-Rom through points (closed or open).
export function smooth(ctx, pts, closed = true) {
  const n = pts.length, g = i => pts[closed ? (i + n) % n : clamp(i, 0, n - 1)];
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
    ctx.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]);
  }
  if (closed) ctx.closePath();
}
// Draw something, then its mirror image across x = cx (the Rorschach fold).
export function mirror(ctx, cx, draw) {
  ctx.save(); draw(ctx, 1); ctx.restore();
  ctx.save(); ctx.translate(2 * cx, 0); ctx.scale(-1, 1); draw(ctx, -1); ctx.restore();
}
export function font(ctx, size, kind = 'type') {
  const f = { type: `${size}px Typewriter`, display: `900 ${size}px Display`, italic: `italic 900 ${size}px Display`, serif: `700 ${size}px Display`, hand: `700 ${size}px Hand` }[kind];
  ctx.font = f; return ctx;
}
export function text(ctx, s, x, y, size, o = {}) {
  font(ctx, size, o.font || 'type');
  ctx.textAlign = o.align || 'center'; ctx.textBaseline = o.base || 'middle';
  if (o.max) { let sz = size; while (ctx.measureText(s).width > o.max && sz > 10) font(ctx, sz -= 2, o.font || 'type'); }
  if (o.outline) { ctx.lineWidth = o.outline; ctx.strokeStyle = o.outlineColor || P.paper; ctx.lineJoin = 'round'; ctx.strokeText(s, x, y); }
  ctx.fillStyle = o.color || P.ink; ctx.fillText(s, x, y);
}

// ---------- noise ----------
function hash2(i, j, s) {
  let h = (Math.imul(i, 374761393) + Math.imul(j, 668265263) + Math.imul(s, 1442695041)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296;
}
export function noise2(x, y, s = 0) {
  const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j, ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  const a = hash2(i, j, s), b = hash2(i + 1, j, s), c = hash2(i, j + 1, s), d = hash2(i + 1, j + 1, s);
  return (a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy) * 2 - 1;
}
export function fbm(x, y, s = 0, oct = 3) { let v = 0, a = 0.5, f = 1; for (let k = 0; k < oct; k++) { v += a * noise2(x * f, y * f, s + k * 17); f *= 2.03; a *= 0.5; } return v; }

// ---------- THE INK BLOT ----------
// A blot is a set of blobs on one half (x ≥ 0, in half-width units, y in the
// same units) that is mirrored across the fold. The field is a sum of
// Gaussians, warped and roughened with noise; ink density pools darker at the
// rim and is mottled inside, like real ink pressed between folded card.
export function blotShape(seed = 1, o = {}) {
  const R = rng(seed * 7919 + 13), blobs = [];
  const kind = o.kind || ['moth', 'figure', 'mask', 'crab'][Math.floor(R() * 4)];
  const ar = o.aspect || 1; // height / width of the blot box
  const Y = v => v * ar;
  // a body along the fold
  const nb = 3 + Math.floor(R() * 3);
  for (let i = 0; i < nb; i++) blobs.push({ x: R() * 0.08, y: Y(lerp(-0.7, 0.7, i / (nb - 1)) + (R() - 0.5) * 0.15), r: 0.1 + R() * 0.12, w: 1 });
  // wings / lobes
  const nw = kind === 'moth' ? 5 : kind === 'mask' ? 3 : 4;
  for (let i = 0; i < nw; i++) {
    const a = lerp(-1.1, 1.1, i / Math.max(1, nw - 1)) + (R() - 0.5) * 0.4;
    const d = kind === 'moth' ? 0.45 + R() * 0.3 : 0.3 + R() * 0.35;
    blobs.push({ x: Math.cos(a) * d, y: Y(Math.sin(a) * d * (kind === 'mask' ? 0.6 : 1.1)), r: 0.12 + R() * 0.16, w: 0.9 + R() * 0.3 });
  }
  // appendages: chains of shrinking blobs (legs, claws, antennae)
  const na = kind === 'crab' ? 4 : kind === 'figure' ? 3 : 2;
  for (let i = 0; i < na; i++) {
    let x = 0.2 + R() * 0.3, y = Y((R() - 0.5) * 1.4), a = (R() - 0.5) * 2.4, r = 0.07;
    const len = 4 + Math.floor(R() * 4);
    for (let k = 0; k < len; k++) {
      blobs.push({ x, y, r, w: 0.95 });
      a += (R() - 0.5) * 0.7; x += Math.cos(a) * r * 1.1; y += Math.sin(a) * r * 1.1; r *= 0.86;
    }
  }
  // holes (negative blobs) — the white "eyes" people see in blots
  const nh = o.holes ?? (1 + Math.floor(R() * 3));
  for (let i = 0; i < nh; i++) blobs.push({ x: 0.08 + R() * 0.3, y: Y((R() - 0.5) * 0.9), r: 0.04 + R() * 0.05, w: -1.4 });
  // splatter drops
  const ns = o.splatter ?? 10;
  for (let i = 0; i < ns; i++) { const a = R() * TAU, d = 0.55 + R() * 0.45; blobs.push({ x: Math.abs(Math.cos(a)) * d, y: Y(Math.sin(a) * d), r: 0.008 + R() * 0.022, w: 1.6 }); }
  return { seed, blobs, ar };
}
// Morph two shapes (same seed family recommended) by k ∈ [0,1].
export function blendShapes(a, b, k) {
  const n = Math.max(a.blobs.length, b.blobs.length), blobs = [];
  for (let i = 0; i < n; i++) {
    const p = a.blobs[i] || { ...b.blobs[i], w: 0 }, q = b.blobs[i] || { ...a.blobs[i], w: 0 };
    blobs.push({ x: lerp(p.x, q.x, k), y: lerp(p.y, q.y, k), r: lerp(p.r, q.r, k), w: lerp(p.w, q.w, k) });
  }
  return { seed: a.seed, blobs, ar: lerp(a.ar, b.ar, k) };
}

const BLOT_CACHE = new Map();
// Draw a blot centred at (x, y), w × h pixels.
// o: { shape | seed, t (animation time), live (0 = static, 1 = breathing),
//      grow 0..1 (ink spreading), color, res (field resolution), rough }
export function blot(ctx, x, y, w, h, o = {}) {
  const shape = o.shape || blotShape(o.seed || 1, { aspect: h / w, kind: o.kind });
  const live = o.live ?? 0, grow = clamp(o.grow ?? 1), t = live ? Math.round((o.t || 0) * 30) / 30 : 0;
  if (grow <= 0.001) return;
  const res = o.res || 0.42, gw = Math.max(8, Math.round(w * res)), gh = Math.max(8, Math.round(h * res));
  const color = o.color || P.ink;
  const key = !live && !o.shape ? [o.seed, gw, gh, grow.toFixed(3), color, o.rough ?? 1, o.kind].join('|') : null;
  let cv = key && BLOT_CACHE.get(key);
  if (!cv) {
    cv = createCanvas(gw, gh);
    const cx = cv.getContext('2d'), img = cx.createImageData(gw, gh), d = img.data;
    const rgb = [1, 3, 5].map(i => parseInt(color.slice(i, i + 2), 16));
    const half = gw / 2, sc = 1 / half; // pixels → half-width units
    const bl = shape.blobs.map((b, i) => live ? {
      x: Math.abs(b.x + 0.035 * live * noise1(t * 0.7 + i * 1.7, shape.seed)),
      y: b.y + 0.04 * live * noise1(t * 0.6 + i * 2.3, shape.seed + 5),
      r: b.r * (1 + 0.12 * live * noise1(t * 0.9 + i, shape.seed + 9)), w: b.w,
    } : b);
    const th = 0.5, rough = o.rough ?? 1, s = shape.seed;
    for (let j = 0; j < gh; j++) {
      const yy = (j + 0.5 - gh / 2) * sc;
      for (let i = 0; i < Math.ceil(half); i++) {
        let xx = (half - i - 0.5) * sc; // distance from the fold
        // domain warp → organic, wet edges
        const wx = xx + 0.06 * rough * fbm(xx * 2.2 + 3, yy * 2.2 + t * 0.15, s, 2);
        const wy = yy + 0.06 * rough * fbm(xx * 2.2 - 7, yy * 2.2 - t * 0.12, s + 3, 2);
        let f = 0;
        for (const b of bl) { const dx = wx - b.x, dy = wy - b.y; f += b.w * Math.exp(-(dx * dx + dy * dy) / (b.r * b.r)); }
        f += 0.09 * rough * fbm(wx * 9, wy * 9, s + 11, 2);
        f *= lerp(0.35, 1, grow) * (0.4 + 0.6 * grow);
        const cover = clamp((f - th) / 0.045 + 0.5);
        if (cover <= 0) continue;
        const rim = 1 - clamp((f - th) / 0.35);            // darker pooled rim
        const mott = fbm(wx * 3.2, wy * 3.2, s + 23, 3);  // mottled wash inside
        const dens = clamp(0.66 + 0.3 * rim + 0.22 * mott, 0.35, 1);
        const a = Math.round(255 * cover * dens);
        for (const px of [i, gw - 1 - i]) { const k = (j * gw + px) * 4; d[k] = rgb[0]; d[k + 1] = rgb[1]; d[k + 2] = rgb[2]; d[k + 3] = a; }
      }
    }
    cx.putImageData(img, 0, 0);
    if (key) { if (BLOT_CACHE.size > 120) BLOT_CACHE.delete(BLOT_CACHE.keys().next().value); BLOT_CACHE.set(key, cv); }
  }
  ctx.save(); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  if (o.alpha != null) ctx.globalAlpha *= o.alpha;
  ctx.drawImage(cv, x - w / 2, y - h / 2, w, h); ctx.restore();
}

// Red rubber stamp with worn ink.
export function stamp(ctx, s, x, y, size, k = 1, rot = -0.14, color = P.red) {
  if (k <= 0) return;
  const e = k < 1 ? 1 + (1 - ease.outCubic(k)) * 0.6 : 1;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(e, e); ctx.globalAlpha *= clamp(k * 3) * 0.92;
  font(ctx, size, 'type'); const w = ctx.measureText(s).width + size * 0.9, h = size * 1.5;
  rect(ctx, -w / 2, -h / 2, w, h, null, color, size * 0.1, size * 0.12);
  rect(ctx, -w / 2 + size * 0.16, -h / 2 + size * 0.16, w - size * 0.32, h - size * 0.32, null, color, size * 0.035, size * 0.08);
  text(ctx, s, 0, size * 0.06, size, { color });
  // wear: knock paper-coloured specks out of the ink
  const R = rng(s.length * 31 + Math.round(size));
  ctx.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < 60; i++) circle(ctx, (R() - 0.5) * w, (R() - 0.5) * h, R() * size * 0.05, '#000');
  ctx.restore();
}

// Typewriter text appearing letter by letter (k = 0..1), with a caret.
export function typeOn(ctx, s, x, y, size, k, o = {}) {
  const n = Math.floor(s.length * clamp(k));
  font(ctx, size, o.font || 'type');
  ctx.textAlign = o.align || 'left'; ctx.textBaseline = 'middle';
  const full = ctx.measureText(s).width, x0 = ctx.textAlign === 'center' ? x - full / 2 : x;
  ctx.textAlign = 'left'; ctx.fillStyle = o.color || P.ink; ctx.fillText(s.slice(0, n), x0, y);
  if (k > 0 && k < 1.02 && o.caret !== false) { const cw = ctx.measureText(s.slice(0, n)).width; rect(ctx, x0 + cw + 3, y - size * 0.45, size * 0.08, size * 0.9, o.color || P.ink); }
}

// Red-pen handwriting, written on with k.
export function scrawl(ctx, s, x, y, size, k = 1, o = {}) {
  if (k <= 0) return;
  font(ctx, size, 'hand'); ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  const w = ctx.measureText(s).width, x0 = (o.align || 'center') === 'center' ? x - w / 2 : x;
  ctx.save(); ctx.translate(x0, y); ctx.rotate(o.rot || -0.04);
  ctx.beginPath(); ctx.rect(-10, -size, (w + 20) * clamp(k), size * 2); ctx.clip();
  ctx.fillStyle = o.color || P.red; ctx.fillText(s, 0, 0); ctx.restore();
}
// Hand-drawn wobbly line from a to b, drawn on with k (red pen by default).
export function penLine(ctx, pts, k = 1, color = P.red, lw = 5, seed = 1) {
  if (k <= 0 || pts.length < 2) return;
  const seg = [], R = rng(seed);
  for (let i = 0; i < pts.length - 1; i++) for (let s = 0; s < 12; s++) {
    const u = s / 12, x = lerp(pts[i][0], pts[i + 1][0], u), y = lerp(pts[i][1], pts[i + 1][1], u);
    seg.push([x + (R() - 0.5) * 2.5, y + (R() - 0.5) * 2.5]);
  }
  seg.push(pts[pts.length - 1]);
  const n = Math.max(2, Math.floor(seg.length * clamp(k)));
  ctx.beginPath(); smooth(ctx, seg.slice(0, n), false); stroke(ctx, color, lw);
}
// Red-pen circle around something (k draws it on; overshoots like a real pen).
export function penCircle(ctx, x, y, rx, ry, k = 1, color = P.red, lw = 6, seed = 3) {
  if (k <= 0) return;
  const R = rng(seed), pts = [], turns = 1.15;
  for (let i = 0; i <= 60 * turns; i++) { const a = -2.2 + i / 60 * TAU, w = 1 + (R() - 0.5) * 0.05 + i * 0.0012; pts.push([x + Math.cos(a) * rx * w, y + Math.sin(a) * ry * w]); }
  const n = Math.max(2, Math.floor(pts.length * clamp(k)));
  ctx.beginPath(); smooth(ctx, pts.slice(0, n), false); stroke(ctx, color, lw);
}
export function arrow(ctx, x1, y1, x2, y2, k = 1, color = P.red, lw = 5, bend = 0.25) {
  if (k <= 0) return;
  const mx = (x1 + x2) / 2 - (y2 - y1) * bend, my = (y1 + y2) / 2 + (x2 - x1) * bend, pts = [];
  for (let i = 0; i <= 24; i++) { const u = i / 24 * clamp(k); pts.push([(1 - u) ** 2 * x1 + 2 * (1 - u) * u * mx + u * u * x2, (1 - u) ** 2 * y1 + 2 * (1 - u) * u * my + u * u * y2]); }
  ctx.beginPath(); smooth(ctx, pts, false); stroke(ctx, color, lw);
  if (k >= 0.98) {
    const [ax, ay] = pts[pts.length - 1], [bx, by] = pts[pts.length - 3], a = Math.atan2(ay - by, ax - bx);
    ctx.beginPath(); ctx.moveTo(ax - Math.cos(a - 0.5) * lw * 4, ay - Math.sin(a - 0.5) * lw * 4); ctx.lineTo(ax, ay); ctx.lineTo(ax - Math.cos(a + 0.5) * lw * 4, ay - Math.sin(a + 0.5) * lw * 4); stroke(ctx, color, lw);
  }
}

// ---------- the open loop (the series' signature symbol) ----------
// open = 0 (closed ring) … 1 (wide gap with a frayed red thread hanging out).
export function loop(ctx, x, y, r, open = 1, t = 0, o = {}) {
  const color = o.color || P.red, lw = o.lw || r * 0.16, gap = open * 1.4, a0 = -Math.PI / 2 + gap / 2, a1 = -Math.PI / 2 + TAU - gap / 2;
  const pulse = o.pulse ? 1 + 0.06 * Math.sin(t * 7) * open : 1;
  ctx.save(); ctx.translate(x, y); ctx.scale(pulse, pulse);
  if (o.glow && open > 0.05) { ctx.save(); ctx.globalAlpha = 0.25 * open; circle(ctx, 0, 0, r * 1.35, color); ctx.restore(); }
  ctx.beginPath(); ctx.arc(0, 0, r, a0, a1); stroke(ctx, color, lw);
  if (open > 0.05) { // the loose thread
    const ex = Math.cos(a1) * r, ey = Math.sin(a1) * r, sw = Math.sin(t * 3) * 0.3;
    ctx.beginPath(); ctx.moveTo(ex, ey);
    ctx.bezierCurveTo(ex + r * 0.3, ey - r * 0.5 * open, ex + r * (0.9 + sw), ey - r * 0.2, ex + r * (0.7 + sw * 1.5), ey - r * 0.9 * open);
    stroke(ctx, color, lw * 0.55);
  }
  ctx.restore();
}

// Hypnotic spiral.
export function spiral(ctx, x, y, r, t = 0, color = P.ink, arms = 2, lw = 14) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(t * 2.2);
  for (let a = 0; a < arms; a++) {
    ctx.beginPath();
    for (let i = 0; i <= 220; i++) { const u = i / 220, ang = u * TAU * 3.2 + a * TAU / arms, rr = u * r; i ? ctx.lineTo(Math.cos(ang) * rr, Math.sin(ang) * rr) : ctx.moveTo(0, 0); }
    stroke(ctx, color, lw);
  }
  ctx.restore();
}

// ---------- the eye ----------
// open 0..1, look [-1..1, -1..1], iris colour, lashes.
export function eye(ctx, x, y, r, o = {}) {
  const open = clamp(o.open ?? 1), look = o.look || [0, 0];
  ctx.save(); ctx.translate(x, y);
  const lid = r * 0.62 * open;
  ctx.beginPath(); ctx.moveTo(-r, 0); ctx.quadraticCurveTo(0, -lid * 1.6, r, 0); ctx.quadraticCurveTo(0, lid * 1.6, -r, 0); ctx.closePath();
  fill(ctx, o.white || P.paperLight);
  ctx.save(); ctx.clip();
  circle(ctx, look[0] * r * 0.35, look[1] * r * 0.2, r * 0.48, o.iris || P.ink);
  circle(ctx, look[0] * r * 0.35, look[1] * r * 0.2, r * 0.22 * (o.dilate || 1), o.iris === P.ink || !o.iris ? '#000' : P.ink);
  circle(ctx, look[0] * r * 0.35 + r * 0.14, look[1] * r * 0.2 - r * 0.14, r * 0.08, P.paperLight);
  ctx.restore();
  ctx.beginPath(); ctx.moveTo(-r, 0); ctx.quadraticCurveTo(0, -lid * 1.6, r, 0); stroke(ctx, P.ink, r * 0.1);
  if (open < 0.1) { ctx.beginPath(); ctx.moveTo(-r, 0); ctx.quadraticCurveTo(0, r * 0.25, r, 0); stroke(ctx, P.ink, r * 0.1); }
  if (o.lashes !== false) for (let i = 0; i < 5; i++) {
    const u = (i + 0.5) / 5, ex = lerp(-r, r, u), ey = -lid * 1.6 * 2 * u * (1 - u) - (open < 0.1 ? -r * 0.12 : 0);
    line(ctx, ex, ey, ex + (u - 0.5) * r * 0.5, ey - r * 0.32, P.ink, r * 0.07);
  }
  ctx.restore();
}

// ---------- the brain ----------
// Side view, facing right. o.fill/ink, o.glow (0..1) lights red spots at o.spots.
export function brain(ctx, x, y, s = 1, t = 0, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const outline = () => {
    ctx.beginPath();
    smooth(ctx, [[-150, 10], [-160, -50], [-120, -110], [-50, -140], [30, -138], [100, -110], [150, -55], [155, 5], [125, 45], [60, 55], [30, 85], [-20, 70], [-70, 80], [-120, 60]]);
  };
  outline(); fill(ctx, o.fill || P.rose); stroke(ctx, P.ink, 7);
  ctx.save(); outline(); ctx.clip();
  // gyri: seeded wandering lines
  const R = rng(o.seed || 5);
  for (let g = 0; g < 26; g++) {
    let px = -150 + R() * 300, py = -130 + R() * 190, a = R() * TAU; const pts = [[px, py]];
    for (let k = 0; k < 9; k++) { a += (R() - 0.5) * 2.2; px += Math.cos(a) * 22; py += Math.sin(a) * 22; pts.push([px, py]); }
    ctx.beginPath(); smooth(ctx, pts, false); stroke(ctx, o.ink || P.redDark, 4);
  }
  // central sulcus and the temporal lobe line
  ctx.beginPath(); ctx.moveTo(10, -138); ctx.bezierCurveTo(-10, -80, 30, -40, 0, 0); stroke(ctx, P.ink, 5);
  ctx.beginPath(); ctx.moveTo(-110, 10); ctx.bezierCurveTo(-40, -10, 40, 0, 120, 20); stroke(ctx, P.ink, 5);
  if (o.glow) for (const [sx, sy] of o.spots || [[60, -60]]) {
    const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, 70); g.addColorStop(0, `rgba(255,236,160,${0.95 * o.glow})`); g.addColorStop(1, 'rgba(255,236,160,0)');
    ctx.fillStyle = g; ctx.fillRect(sx - 80, sy - 80, 160, 160);
  }
  ctx.restore();
  // cerebellum + stem
  ellipse(ctx, -100, 72, 52, 30, 0.2, o.fill || P.rose, P.ink, 6);
  for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.ellipse(-100, 72, 46 - i * 10, 24 - i * 5, 0.2, 0.2, Math.PI - 0.2); stroke(ctx, o.ink || P.redDark, 3); }
  poly(ctx, [[-40, 68], [-14, 68], [-8, 150], [-34, 150]], o.fill || P.rose, P.ink, 6);
  ctx.restore();
}

// ---------- the profile head (the classic psychology silhouette) ----------
// Facing right, (x, y) = base of the neck, s = scale (head ≈ 330 px tall at 1).
// o.lid: 0..1 opens the top of the skull (hinged at the back);
// o.inside(ctx): drawn inside the open skull. o.color, o.eye.
export function profile(ctx, x, y, s = 1, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (o.flip ? -1 : 1), s);
  const color = o.color || P.ink;
  const skullCut = -205; // y of the cut line
  const headPath = () => {
    ctx.beginPath();
    ctx.moveTo(-70, 40);
    ctx.bezierCurveTo(-70, -20, -100, -60, -112, -130);
    ctx.bezierCurveTo(-130, -250, -60, -330, 20, -330);
    ctx.bezierCurveTo(95, -330, 128, -270, 120, -215);
    ctx.bezierCurveTo(118, -195, 128, -186, 126, -172);
    ctx.lineTo(150, -128); ctx.bezierCurveTo(156, -118, 146, -112, 134, -112);
    ctx.lineTo(136, -98); ctx.bezierCurveTo(144, -92, 140, -84, 132, -82);
    ctx.bezierCurveTo(140, -76, 138, -66, 128, -62);
    ctx.bezierCurveTo(124, -40, 120, -26, 96, -22);
    ctx.bezierCurveTo(70, -20, 50, -10, 44, 10);
    ctx.lineTo(44, 40);
    if (o.bust !== false) { ctx.bezierCurveTo(90, 60, 150, 80, 170, 140); ctx.lineTo(-190, 140); ctx.bezierCurveTo(-170, 80, -110, 60, -70, 40); }
    ctx.closePath();
  };
  const lid = clamp(o.lid || 0);
  if (lid > 0) {
    // inside of the head (behind the lid)
    ctx.save(); headPath(); ctx.clip();
    ctx.beginPath(); ctx.rect(-200, -340, 400, 340 + skullCut + 30); fill(ctx, color);
    ctx.restore();
    // body below the cut
    ctx.save(); ctx.beginPath(); ctx.rect(-260, skullCut, 520, 600); ctx.clip(); headPath(); fill(ctx, color); ctx.restore();
    // what is inside spills out of the opening
    if (o.inside) { ctx.save(); o.inside(ctx); ctx.restore(); }
    // the lid, hinged at the back of the skull
    ctx.save(); ctx.translate(-118, skullCut); ctx.rotate(-lid * 1.9); ctx.translate(118, -skullCut);
    ctx.beginPath(); ctx.rect(-260, -400, 520, 400 + skullCut); ctx.clip(); headPath(); fill(ctx, color);
    ctx.beginPath(); ctx.moveTo(-118, skullCut); ctx.lineTo(124, skullCut); stroke(ctx, P.paperDark, 3);
    ctx.restore();
    ellipse(ctx, 3, skullCut, 120, 16, 0, P.redDark);
  } else {
    headPath(); fill(ctx, color);
    if (o.inside) { ctx.save(); headPath(); ctx.clip(); o.inside(ctx); ctx.restore(); }
  }
  if (o.eye !== false) eye(ctx, 82, -168, 22, { open: o.blink ?? 1, look: [0.8, 0], lashes: false, white: P.paperLight });
  ctx.restore();
}

// ---------- people: ink silhouettes with paper-white eyes ----------
// (x, y) = between the feet on the ground. o: s (scale), face (-1|1 look dir),
// coat, hat ('bowler'|'cloche'|'cap'|null), hair ('bob'|'slick'|'bun'|'bald'),
// glasses, apron, bowtie, skirt, armL/armR [shoulder, elbow] in radians
// (0 = hanging), walk (phase, 0 = standing), sit, lean, blink, look [x,y],
// mood ('calm'|'shock'|'smile'|'worry'), holdR/holdL(ctx) drawn at the hand,
// color, bob (bounce), think (draw at the head).
export function figure(ctx, x, y, o = {}) {
  const s = o.s || 1, c = o.color || P.ink, face = o.face || 1;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (o.shadow !== false) { ctx.save(); ctx.globalAlpha = 0.18; ellipse(ctx, 0, 2, 60, 9, 0, P.ink); ctx.restore(); }
  const wph = o.walk || 0, step = Math.sin(wph * TAU), bob = Math.abs(Math.cos(wph * TAU)) * (o.walk ? 6 : 0) + (o.bob || 0);
  const sit = o.sit ? 1 : 0, hip = sit ? -95 : -170;
  ctx.translate(0, -bob);
  ctx.rotate((o.lean || 0));
  // legs
  const leg = (sgn) => {
    if (sit) { ctx.beginPath(); ctx.moveTo(sgn * 12, hip); ctx.lineTo(sgn * 12 + face * 70, hip + 4); ctx.lineTo(sgn * 12 + face * 72, 0); stroke(ctx, c, 22); ellipse(ctx, sgn * 12 + face * 84, -4, 20, 8, 0, c); return; }
    const a = step * 0.38 * sgn;
    const kx = Math.sin(a) * 85, ky = hip + Math.cos(a) * 85, fx = kx + Math.sin(a - Math.max(0, -step * sgn) * 0.5) * 85, fy = Math.min(0, ky + 85);
    ctx.beginPath(); ctx.moveTo(sgn * 12, hip); ctx.lineTo(kx + sgn * 8, ky); ctx.lineTo(fx + sgn * 8, fy); stroke(ctx, c, 22);
    ellipse(ctx, fx + sgn * 8 + face * 12, fy - 5, 22, 9, 0, c);
  };
  leg(-1); leg(1);
  // torso: a long coat or a dress
  const top = hip - 140;
  if (o.skirt) poly(ctx, [[-38, top], [38, top], [62, hip + (sit ? 10 : 70)], [-62, hip + (sit ? 10 : 70)]], c);
  else poly(ctx, [[-42, top], [42, top], [48, hip + (sit ? 0 : 40)], [-48, hip + (sit ? 0 : 40)]], c);
  ctx.beginPath(); ctx.ellipse(0, top + 6, 44, 18, 0, Math.PI, TAU); fill(ctx, c);
  if (o.apron) { poly(ctx, [[-30, top + 60], [30, top + 60], [36, hip + 60], [-36, hip + 60]], P.paperLight); line(ctx, -30, top + 62, 30, top + 62, P.paperLight, 5); }
  if (o.shirt !== false && !o.skirt) poly(ctx, [[-10, top + 2], [10, top + 2], [0, top + 40]], P.paperLight);
  if (o.bowtie) { poly(ctx, [[0, top + 8], [-16, top], [-16, top + 16]], P.paperLight); poly(ctx, [[0, top + 8], [16, top], [16, top + 16]], P.paperLight); }
  if (o.tie) poly(ctx, [[0, top + 6], [-5, top + 12], [0, top + 46], [5, top + 12]], o.tie);
  // arms (shoulder angle, elbow angle), hands drawn as small discs
  const arm = (sgn, ang, hold) => {
    const [sh, el] = ang || [0.15, 0.1];
    const ax = sgn * 40, ay = top + 14, a1 = sh * sgn, ex = ax + Math.sin(a1) * 70, ey = ay + Math.cos(a1) * 70, a2 = a1 + el * sgn;
    const hx = ex + Math.sin(a2) * 66, hy = ey + Math.cos(a2) * 66;
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ex, ey); ctx.lineTo(hx, hy); stroke(ctx, c, 18);
    circle(ctx, hx, hy, 11, c);
    if (hold) { ctx.save(); ctx.translate(hx, hy); hold(ctx); ctx.restore(); }
  };
  arm(-1, o.armL, o.holdL); arm(1, o.armR, o.holdR);
  // head
  const hy = top - 58;
  ctx.save(); ctx.translate(0, hy); ctx.rotate(o.tilt || 0);
  poly(ctx, [[-10, 30], [10, 30], [12, 52], [-12, 52]], c);
  ellipse(ctx, 0, 0, 44, 50, 0, c);
  const hair = o.hair;
  if (hair === 'bob') { ctx.beginPath(); ctx.moveTo(-50, 22); ctx.bezierCurveTo(-62, -60, 62, -60, 50, 22); ctx.lineTo(36, 22); ctx.bezierCurveTo(34, -20, -34, -20, -36, 22); ctx.closePath(); fill(ctx, c); }
  if (hair === 'bun') circle(ctx, -face * 30, -44, 18, c);
  if (hair === 'long') { for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sx * 40, -20); ctx.quadraticCurveTo(sx * 62, 20, sx * 54, 62); ctx.lineTo(sx * 36, 58); ctx.quadraticCurveTo(sx * 44, 20, sx * 30, -6); ctx.closePath(); fill(ctx, c); } }
  if (hair === 'slick') { ctx.beginPath(); ctx.ellipse(0, -18, 46, 34, 0, Math.PI, TAU); fill(ctx, c); line(ctx, -20, -44, 18, -40, P.inkSoft, 3); }
  // eyes (paper-white), brows by mood
  const look = o.look || [face * 0.4, 0], mood = o.mood || 'calm', bl = o.blink ?? 1;
  const ey0 = -4, er = mood === 'shock' ? 13 : 10;
  for (const ex of [-17, 17]) {
    ellipse(ctx, ex + look[0] * 5, ey0, er, er * (mood === 'worry' ? 0.8 : 1) * clamp(bl, 0.08, 1), 0, P.paperLight);
    if (bl > 0.3) circle(ctx, ex + look[0] * 9, ey0 + look[1] * 5, er * 0.45, c);
  }
  const brow = { calm: 0, shock: -8, smile: -2, worry: 4 }[mood] ?? 0;
  if (mood === 'worry') { line(ctx, -28, -20, -8, -24 + brow, P.paperLight, 4); line(ctx, 28, -20, 8, -24 + brow, P.paperLight, 4); }
  if (mood === 'shock') { line(ctx, -27, -24 + brow, -8, -26 + brow, P.paperLight, 4); line(ctx, 27, -24 + brow, 8, -26 + brow, P.paperLight, 4); ellipse(ctx, look[0] * 4, 24, 7, 10, 0, P.paperLight); }
  if (mood === 'smile') { ctx.beginPath(); ctx.arc(look[0] * 4, 16, 12, 0.2, Math.PI - 0.2); stroke(ctx, P.paperLight, 4); }
  if (o.glasses) { for (const ex of [-17, 17]) circle(ctx, ex + look[0] * 4, ey0, 16, null, P.paperLight, 3.5); line(ctx, -2, ey0, 2, ey0, P.paperLight, 3); }
  if (o.mustache) { ctx.beginPath(); ctx.ellipse(look[0] * 4, 20, 16, 5, 0, 0, TAU); fill(ctx, P.inkSoft); }
  // hats
  if (o.hat === 'bowler') { ctx.beginPath(); ctx.ellipse(0, -30, 62, 10, 0, 0, TAU); fill(ctx, c); ctx.beginPath(); ctx.ellipse(0, -38, 40, 40, 0, Math.PI, TAU); fill(ctx, c); line(ctx, -40, -40, 40, -40, o.band || P.inkSoft, 6); }
  if (o.hat === 'cloche') { ctx.beginPath(); ctx.ellipse(0, -18, 50, 44, 0, Math.PI * 0.95, TAU + 0.05); fill(ctx, c); ctx.beginPath(); ctx.ellipse(-face * 12, -16, 56, 10, -face * 0.1, 0, TAU); fill(ctx, c); line(ctx, -46, -28, 46, -28, o.band || P.red, 6); }
  if (o.hat === 'tricorn') { poly(ctx, [[-66, -26], [66, -26], [0, -84]], c); poly(ctx, [[-70, -22], [-40, -60], [-24, -24]], c); poly(ctx, [[70, -22], [40, -60], [24, -24]], c); line(ctx, -58, -28, 58, -28, o.band || P.paperDark, 4); }
  if (o.hat === 'cap') { ctx.beginPath(); ctx.ellipse(0, -32, 44, 22, 0, Math.PI, TAU); fill(ctx, c); ctx.beginPath(); ctx.ellipse(face * 30, -32, 34, 8, 0, 0, TAU); fill(ctx, c); }
  if (o.think) { ctx.save(); o.think(ctx); ctx.restore(); }
  ctx.restore();
  ctx.restore();
}

// ---------- props ----------
export function bistroTable(ctx, x, y, s = 1, c = P.ink) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ellipse(ctx, 0, -150, 120, 20, 0, c); rect(ctx, -6, -150, 12, 130, c); poly(ctx, [[0, -24], [-55, 0], [55, 0]], null, c, 10);
  ctx.restore();
}
export function cafeChair(ctx, x, y, s = 1, face = 1, c = P.ink) { // bentwood chair
  ctx.save(); ctx.translate(x, y); ctx.scale(s * face, s);
  ctx.beginPath(); ctx.moveTo(-40, 0); ctx.lineTo(-34, -100); ctx.moveTo(36, 0); ctx.lineTo(30, -100); stroke(ctx, c, 9);
  ellipse(ctx, 0, -104, 46, 12, 0, c);
  ctx.beginPath(); ctx.moveTo(-40, -104); ctx.bezierCurveTo(-50, -190, -42, -230, -20, -232); ctx.bezierCurveTo(-4, -232, -10, -170, -26, -110); stroke(ctx, c, 9);
  ctx.beginPath(); ctx.arc(0, -60, 30, 0, Math.PI); stroke(ctx, c, 5);
  ctx.restore();
}
export function cup(ctx, x, y, s = 1, t = 0, steam = true, c = P.ink) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ellipse(ctx, 0, 6, 44, 9, 0, c);
  poly(ctx, [[-30, -40], [30, -40], [22, 2], [-22, 2]], c);
  ctx.beginPath(); ctx.arc(34, -22, 12, -1.4, 1.4); stroke(ctx, c, 6);
  if (steam) for (let i = 0; i < 3; i++) {
    ctx.beginPath(); const sx = -14 + i * 14;
    for (let k = 0; k <= 12; k++) { const yy = -48 - k * 6, xx = sx + Math.sin(k * 0.6 + t * 4 + i) * 6; k ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); }
    ctx.globalAlpha = 0.5; stroke(ctx, c, 3); ctx.globalAlpha = 1;
  }
  ctx.restore();
}
export function plate(ctx, x, y, s = 1, food = null) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ellipse(ctx, 0, 0, 56, 16, 0, P.paperLight, P.ink, 4);
  if (food) food(ctx);
  ctx.restore();
}
// Food & drink icons for the waiter's order (ink silhouettes, 1 = ~80 px).
export const FOOD = {
  pretzel(ctx) { ctx.beginPath(); ctx.moveTo(-36, 10); ctx.bezierCurveTo(-60, -40, -10, -50, 0, -10); ctx.bezierCurveTo(10, -50, 60, -40, 36, 10); ctx.bezierCurveTo(20, 30, -20, 30, -36, 10); ctx.moveTo(-14, 20); ctx.lineTo(14, -12); ctx.moveTo(14, 20); ctx.lineTo(-14, -12); stroke(ctx, P.ink, 11); },
  beer(ctx) { rect(ctx, -24, -50, 48, 64, P.ochre, P.ink, 5, 4); ellipse(ctx, 0, -52, 28, 12, 0, P.paperLight, P.ink, 4); ctx.beginPath(); ctx.arc(26, -18, 14, -1.2, 1.2); stroke(ctx, P.ink, 6); },
  cake(ctx) { poly(ctx, [[-36, 10], [36, 10], [36, -16], [-36, -36]], P.rose, P.ink, 5); line(ctx, -36, -10, 36, -2, P.paperLight, 5); circle(ctx, -24, -42, 8, P.red); },
  sausage(ctx) { ctx.beginPath(); ctx.moveTo(-40, 0); ctx.bezierCurveTo(-30, -24, 30, -24, 40, 0); stroke(ctx, P.redDark, 18); },
  coffee(ctx) { cup(ctx, 0, 6, 0.7, 0, false); },
  bread(ctx) { ellipse(ctx, 0, -10, 40, 22, 0, P.ochre, P.ink, 5); for (const dx of [-14, 0, 14]) line(ctx, dx - 6, -24, dx + 6, 2, P.ink, 3); },
  wine(ctx) { ctx.beginPath(); ctx.moveTo(-18, -50); ctx.lineTo(18, -50); ctx.bezierCurveTo(18, -16, 4, -16, 2, -14); ctx.lineTo(2, 8); ctx.lineTo(-2, 8); ctx.lineTo(-2, -14); ctx.bezierCurveTo(-4, -16, -18, -16, -18, -50); fill(ctx, P.redDark); stroke(ctx, P.ink, 4); line(ctx, -14, 10, 14, 10, P.ink, 5); },
  soup(ctx) { ctx.beginPath(); ctx.arc(0, -10, 34, 0, Math.PI); fill(ctx, P.ink); ellipse(ctx, 0, -10, 34, 8, 0, P.ochre, P.ink, 4); },
};
// A bill / receipt with items; paid → a red PAID stamp.
export function bill(ctx, x, y, s = 1, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(o.rot || 0);
  const h = o.h || 300, w = 190;
  ctx.beginPath(); ctx.moveTo(-w / 2, -h / 2);
  for (let i = 0; i <= 10; i++) ctx.lineTo(-w / 2 + i * w / 10, -h / 2 + (i % 2 ? 10 : 0));
  ctx.lineTo(w / 2, h / 2);
  for (let i = 10; i >= 0; i--) ctx.lineTo(-w / 2 + i * w / 10, h / 2 - (i % 2 ? 10 : 0));
  ctx.closePath(); fill(ctx, P.paperLight); stroke(ctx, P.ink, 4);
  text(ctx, o.title || 'CAFÉ', 0, -h / 2 + 38, 30, { font: 'serif' });
  const items = o.items ?? 6;
  for (let i = 0; i < items; i++) { const yy = -h / 2 + 80 + i * 30; line(ctx, -70, yy, 20 - (i * 37) % 40, yy, P.grey, 5); line(ctx, 44, yy, 72, yy, P.grey, 5); }
  if (o.paid) stamp(ctx, 'PAID', 0, h / 2 - 70, 40, o.paid, -0.25);
  ctx.restore();
}
export function notepad(ctx, x, y, s = 1, crossed = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rect(ctx, -70, -90, 140, 180, P.paperLight, P.ink, 5, 6);
  for (let i = 0; i < 5; i++) line(ctx, -50, -50 + i * 28, 50, -50 + i * 28, P.greyLight, 3);
  for (let i = 0; i < 6; i++) circle(ctx, -50 + i * 20, -90, 6, P.ink);
  if (crossed > 0) { penLine(ctx, [[-90, -110], [90, 110]], crossed, P.red, 12); penLine(ctx, [[90, -110], [-90, 110]], clamp(crossed * 2 - 1), P.red, 12, 4); }
  ctx.restore();
}
export function puzzlePiece(ctx, x, y, s = 1, rot = 0, color = P.sky) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-40, -40); ctx.lineTo(-12, -40); ctx.arc(0, -46, 14, Math.PI * 0.8, Math.PI * 2.2); ctx.lineTo(40, -40); ctx.lineTo(40, -12); ctx.arc(46, 0, 14, -Math.PI * 0.7, Math.PI * 0.7); ctx.lineTo(40, 40); ctx.lineTo(-40, 40); ctx.lineTo(-40, 12); ctx.arc(-34, 0, 14, Math.PI * 0.6, -Math.PI * 0.6, true); ctx.closePath();
  fill(ctx, color); stroke(ctx, P.ink, 5); ctx.restore();
}
export function beads(ctx, x, y, n, done, t = 0, s = 1) { // a string of beads, `done` of n threaded
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-160, 0); ctx.bezierCurveTo(-60, 40, 60, 40, 160, 0); stroke(ctx, P.ink, 3);
  const cols = [P.red, P.ochre, P.sky, P.sage, P.lilac];
  for (let i = 0; i < n; i++) {
    const u = i / (n - 1), on = i < done;
    const bx = on ? lerp(-150, 150, u) : -150 + u * 300, by = on ? 30 * 4 * u * (1 - u) * 0.75 : 80 + Math.sin(i * 2.1) * 16 + (i % 3) * 22;
    circle(ctx, bx, by, 15, cols[i % 5], P.ink, 3);
  }
  ctx.restore();
}
export function clay(ctx, x, y, s = 1, shaped = 0, color = P.ochre) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); smooth(ctx, [[-60, 0], [-56, -lerp(40, 80, shaped)], [-20, -lerp(60, 120, shaped)], [lerp(10, 0, shaped), -lerp(56, 150, shaped)], [40, -lerp(60, 110, shaped)], [60, -lerp(36, 50, shaped)], [62, 0]]);
  fill(ctx, color); stroke(ctx, P.ink, 5);
  if (shaped > 0.6) { circle(ctx, -14, -100, 6, P.ink); circle(ctx, 16, -100, 6, P.ink); }
  ctx.restore();
}
// A browser tab with a close button; o.dodge moves the X away from the cursor.
export function tab(ctx, x, y, w, label, o = {}) {
  ctx.save(); ctx.translate(x, y);
  ctx.beginPath(); ctx.moveTo(-w / 2 - 20, 30); ctx.bezierCurveTo(-w / 2, 30, -w / 2, -30, -w / 2 + 20, -30); ctx.lineTo(w / 2 - 20, -30); ctx.bezierCurveTo(w / 2, -30, w / 2, 30, w / 2 + 20, 30); ctx.closePath();
  fill(ctx, o.fill || P.paperLight); stroke(ctx, P.ink, 4);
  circle(ctx, -w / 2 + 30, 0, 9, o.dot || P.red);
  text(ctx, label, -w / 2 + 50, 2, 26, { align: 'left', max: o.hideX ? w - 60 : w - 95 });
  if (!o.hideX) { const xx = w / 2 - 26 + (o.dodge || 0); line(ctx, xx - 9, -9, xx + 9, 9, P.ink, 4); line(ctx, xx + 9, -9, xx - 9, 9, P.ink, 4); }
  ctx.restore();
}
// A phone with chat bubbles; o.unread badge, o.typing dots.
export function phone(ctx, x, y, s = 1, t = 0, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(o.rot || 0);
  if (o.glow) { const g = ctx.createRadialGradient(0, 0, 40, 0, 0, 330); g.addColorStop(0, `rgba(200,220,255,${0.35 * o.glow})`); g.addColorStop(1, 'rgba(200,220,255,0)'); ctx.fillStyle = g; ctx.fillRect(-340, -340, 680, 680); }
  rect(ctx, -110, -200, 220, 400, P.ink, null, 0, 30);
  rect(ctx, -96, -170, 192, 340, o.screen || P.paperLight, null, 0, 12);
  rect(ctx, -70, -130, 120, 44, P.greyLight, null, 0, 18);
  if (o.msg) { rect(ctx, -60, -60, 150, 54, P.sky, null, 0, 18); text(ctx, o.msg, 15, -32, 24, { max: 130 }); }
  if (o.typing) for (let i = 0; i < 3; i++) circle(ctx, -50 + i * 22, 40, 8 + 3 * Math.max(0, Math.sin(t * 8 - i)), P.grey);
  if (o.unread) { circle(ctx, 100, -190, 34, P.red, P.paperLight, 5); text(ctx, String(o.unread), 100, -188, 34, { font: 'serif', color: P.paperLight }); }
  ctx.restore();
}
export function clock(ctx, x, y, r, t = 0, o = {}) {
  ctx.save(); ctx.translate(x, y);
  circle(ctx, 0, 0, r, o.face || P.paperLight, P.ink, r * 0.08);
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; line(ctx, Math.cos(a) * r * 0.78, Math.sin(a) * r * 0.78, Math.cos(a) * r * 0.9, Math.sin(a) * r * 0.9, P.ink, r * 0.05); }
  const hr = (o.hour ?? 2) + t * (o.speed || 0) / 12, mn = ((o.minute ?? 0) / 60 + t * (o.speed || 0)) % 1;
  line(ctx, 0, 0, Math.sin(hr / 12 * TAU) * r * 0.5, -Math.cos(hr / 12 * TAU) * r * 0.5, P.ink, r * 0.08);
  line(ctx, 0, 0, Math.sin(mn * TAU) * r * 0.75, -Math.cos(mn * TAU) * r * 0.75, P.red, r * 0.05);
  circle(ctx, 0, 0, r * 0.07, P.ink);
  ctx.restore();
}
export function moon(ctx, x, y, r, c = P.paperLight) {
  ctx.save(); circle(ctx, x, y, r, c); ctx.globalCompositeOperation = 'destination-out'; circle(ctx, x + r * 0.45, y - r * 0.2, r * 0.85, '#000'); ctx.restore();
}
// A bed seen from the side, with someone lying awake (eyes open).
export function bed(ctx, x, y, s = 1, t = 0, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rect(ctx, -230, -70, 460, 70, P.inkSoft);
  rect(ctx, -250, -170, 26, 190, P.inkSoft); rect(ctx, 224, -110, 26, 130, P.inkSoft);
  ellipse(ctx, -170, -86, 50, 22, 0, P.paperDark);
  // the sleeper: head on the pillow, blanket
  ctx.beginPath(); ctx.moveTo(-130, -70); ctx.bezierCurveTo(-110, -130, 160, -120, 220, -70); ctx.closePath(); fill(ctx, o.blanket || P.sky); stroke(ctx, P.ink, 4);
  circle(ctx, -160, -112, 34, P.ink);
  const bl = o.blink ?? 1;
  for (const ex of [-170, -146]) { ellipse(ctx, ex, -116, 9, 9 * clamp(bl, 0.1, 1), 0, P.paperLight); if (bl > 0.3) circle(ctx, ex + 3, -118, 4, P.ink); }
  ctx.restore();
}
// A cliff edge with a figure hanging on by the fingertips.
export function cliff(ctx, x, y, s = 1, t = 0, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-400, -10); ctx.lineTo(96, -10); ctx.lineTo(100, 8); ctx.lineTo(60, 30); ctx.lineTo(30, 120); ctx.lineTo(70, 260); ctx.lineTo(20, 420); ctx.lineTo(60, 700); ctx.lineTo(-400, 700); ctx.closePath(); fill(ctx, o.rock || P.ink);
  const sw = Math.sin(t * 2.2) * 0.08;
  ctx.save(); ctx.translate(112, -4); ctx.rotate(sw);
  figure(ctx, 0, 372, { s: 0.85, armL: [Math.PI - 0.25, 0], armR: [Math.PI - 0.15, 0], mood: 'shock', look: [0, -1], shadow: false, hat: o.hat, color: o.color });
  ctx.restore();
  ctx.restore();
}
// Bar chart drawn with ink (vals 0..1), labels underneath.
export function bars(ctx, x, y, w, h, vals, labels, k = 1, colors = [P.red, P.ink]) {
  const n = vals.length, bw = w / n * 0.56;
  vals.forEach((v, i) => {
    const bx = x + (i + 0.5) * w / n, bh = h * v * ease.outCubic(clamp(k * 1.3 - i * 0.25));
    rect(ctx, bx - bw / 2, y - bh, bw, bh, colors[i % colors.length], P.ink, 5);
    text(ctx, labels[i], bx, y + 40, 34, { max: w / n - 10 });
  });
  line(ctx, x - 20, y, x + w + 20, y, P.ink, 6);
}
// Rubin's vase: two faces in profile that make a vase between them.
export function rubin(ctx, cx, cy, s = 1, o = {}) {
  const faces = o.faces || P.ink, vase = o.vase || P.paperLight;
  ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
  rect(ctx, -300, -340, 600, 680, vase);
  mirror(ctx, 0, c => {
    c.beginPath(); c.moveTo(-300, -340); c.lineTo(-58, -340); c.bezierCurveTo(-60, -260, -40, -220, -36, -180);
    c.bezierCurveTo(-20, -160, -18, -140, -36, -128); c.bezierCurveTo(-30, -110, -24, -96, -40, -86); c.bezierCurveTo(-30, -70, -36, -50, -54, -46);
    c.bezierCurveTo(-60, -10, -100, 40, -110, 120); c.bezierCurveTo(-60, 200, -40, 280, -90, 340); c.lineTo(-300, 340); c.closePath(); fill(c, faces);
  });
  ctx.restore();
}
// A tiny ink splat (for hits/emphasis), mirrored.
export function splat(ctx, x, y, r, seed = 1, color = P.ink, k = 1) {
  if (k <= 0) return;
  const R = rng(seed);
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  mirror(ctx, 0, c => {
    c.beginPath(); smooth(c, Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + i / 9 * Math.PI, rr = r * (0.6 + R() * 0.5); return [Math.cos(a) * rr * -1 + 0.01, Math.sin(a) * rr]; }).concat([[0, r * 0.5], [0, -r * 0.5]]));
    fill(c, color);
    for (let i = 0; i < 6; i++) { const a = R() * TAU; circle(c, -Math.abs(Math.cos(a)) * r * (1.2 + R() * 0.6), Math.sin(a) * r * (1.2 + R() * 0.6), r * (0.05 + R() * 0.1), color); }
  });
  ctx.restore();
}

// ---------- more props (office, requests, locks) ----------
// A 1970s photocopier; o.light (0..1) runs the scan light, o.eyes draws a face
// on the lid (o.lids 0..1 = half-shut, o.look), o.out = sheets in the tray.
export function copier(ctx, x, y, s = 1, t = 0, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rect(ctx, -170, -230, 340, 230, P.paperDark, P.ink, 6, 10);           // body
  rect(ctx, -150, -200, 300, 70, P.greyLight, P.ink, 4, 6);             // front panel
  for (let i = 0; i < 3; i++) rect(ctx, -130 + i * 90, -180, 70, 30, P.paperLight, P.ink, 3, 4); // paper drawers
  rect(ctx, -170, -300, 340, 70, P.ink, null, 0, 8);                     // top + glass
  rect(ctx, -150, -290, 300, 40, P.inkSoft, null, 0, 4);
  if (o.light != null && o.light > 0 && o.light < 1) { const lx = lerp(-145, 145, o.light); ctx.save(); ctx.globalAlpha = 0.9; rect(ctx, lx - 8, -292, 16, 44, '#e9ffe9'); ctx.restore(); }
  rect(ctx, -176, -312, 352, 18, P.ink, null, 0, 6);                     // lid
  rect(ctx, 120, -120, 40, 22, P.red, P.ink, 3, 4);                      // big button
  rect(ctx, 170, -130, 70, 14, P.paperLight, P.ink, 3);                  // output tray
  for (let i = 0; i < (o.out || 0); i++) rect(ctx, 176 + i * 2, -144 - i * 4, 58, 10, P.paperLight, P.ink, 2);
  if (o.eyes) for (const ex of [-60, 60]) { ctx.save(); eye(ctx, ex, -268, 34, { open: 1 - (o.lids || 0) * 0.55, look: o.look || [0, 0], lashes: false }); ctx.restore(); }
  rect(ctx, -160, 0, 30, 14, P.ink); rect(ctx, 130, 0, 30, 14, P.ink);
  ctx.restore();
}
// A stack of n pages (fanned a little), labelled.
export function pages(ctx, x, y, n, s = 1, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const R = rng(n * 13 + 1);
  for (let i = 0; i < n; i++) { ctx.save(); ctx.translate((R() - 0.5) * 8, -i * (o.gap || 7)); ctx.rotate((R() - 0.5) * 0.05); rect(ctx, -60, -76, 120, 76, P.paperLight, P.ink, 3, 2); ctx.restore(); }
  if (o.label) text(ctx, o.label, 0, -n * (o.gap || 7) - 40, 30, { font: 'serif', color: o.labelColor || P.red });
  ctx.restore();
}
// 10 × 10 grid of ink drops; the first `n` turn red (n may be fractional while animating).
export function percentGrid(ctx, x, y, size, n, o = {}) {
  const c = size / 10;
  for (let i = 0; i < 100; i++) {
    const gx = x + (i % 10 + 0.5) * c, gy = y + (Math.floor(i / 10) + 0.5) * c, on = i < Math.floor(n);
    const k = on ? 1 : clamp(n - i);
    circle(ctx, gx, gy, c * 0.36, on || k > 0.5 ? (o.on || P.red) : (o.off || P.greyLight));
  }
}
export function padlock(ctx, x, y, s = 1, open = 0, color = P.ink) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.save(); ctx.translate(46, -110); ctx.rotate(-open * 0.9); ctx.translate(-46, 110 - open * 50);
  ctx.beginPath(); ctx.moveTo(-46, -100); ctx.lineTo(-46, -150); ctx.arc(0, -150, 46, Math.PI, 0); ctx.lineTo(46, -100); stroke(ctx, color, 22);
  ctx.restore();
  rect(ctx, -90, -110, 180, 150, color, null, 0, 18);
  circle(ctx, 0, -50, 18, P.paperLight); poly(ctx, [[-8, -46], [8, -46], [12, 4], [-12, 4]], P.paperLight);
  ctx.restore();
}
export function key(ctx, x, y, s = 1, rot = 0, label = null, color = P.red) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  circle(ctx, -110, 0, 44, color); circle(ctx, -110, 0, 18, P.paperLight);
  rect(ctx, -70, -10, 150, 20, color); rect(ctx, 50, 10, 14, 26, color); rect(ctx, 22, 10, 14, 18, color);
  if (label) { ctx.save(); ctx.rotate(-rot); text(ctx, label, -110, 80, 30, { font: 'serif', color }); ctx.restore(); }
  ctx.restore();
}
// A mousetrap; snap 0 (set) … 1 (shut).
export function mousetrap(ctx, x, y, s = 1, snap = 0, bait = null) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rect(ctx, -170, -30, 340, 40, P.ochre, P.ink, 5, 4);
  for (let i = 0; i < 6; i++) line(ctx, -150 + i * 60, -20, -130 + i * 60, 0, '#b88a2c', 3);
  if (bait) bait(ctx);
  const a = lerp(-Math.PI * 0.95, 0, ease.outBounce(clamp(snap)));
  ctx.save(); ctx.translate(-60, -32); ctx.rotate(a); ctx.beginPath(); ctx.rect(0, -4, 210, 8); fill(ctx, P.greyLight); stroke(ctx, P.ink, 3); ctx.restore();
  circle(ctx, -60, -32, 14, P.grey, P.ink, 3);
  ctx.restore();
}
// A little plane towing a banner (facing right).
export function plane(ctx, x, y, s = 1, t = 0, banner = null, color = P.ink) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(Math.sin(t * 2) * 0.05);
  if (banner) {
    font(ctx, 34, 'type'); const w = ctx.measureText(banner).width + 40;
    line(ctx, -80, 0, -120, 0, color, 3);
    ctx.beginPath(); for (let i = 0; i <= 20; i++) { const xx = -120 - i / 20 * w, yy = Math.sin(t * 6 + i * 0.6) * 6; i ? ctx.lineTo(xx, yy - 26) : ctx.moveTo(xx, yy - 26); }
    for (let i = 20; i >= 0; i--) { const xx = -120 - i / 20 * w, yy = Math.sin(t * 6 + i * 0.6) * 6; ctx.lineTo(xx, yy + 26); }
    ctx.closePath(); fill(ctx, P.paperLight); stroke(ctx, color, 3);
    text(ctx, banner, -120 - w / 2, Math.sin(t * 6 + 10 * 0.6) * 6, 30, { color: P.red });
  }
  ellipse(ctx, 0, 0, 90, 22, 0, color);
  poly(ctx, [[-20, -6], [30, -6], [-30, -80], [-50, -80]], color);
  poly(ctx, [[-20, 6], [30, 6], [-40, 60], [-58, 60]], color);
  poly(ctx, [[-70, -4], [-92, -4], [-100, -44], [-84, -44]], color);
  ellipse(ctx, 40, -8, 18, 9, 0, P.sky);
  const pr = Math.abs(Math.sin(t * 40));
  ellipse(ctx, 94, 0, 6, 34 * pr + 4, 0, P.grey);
  ctx.restore();
}
export function magnifier(ctx, x, y, s = 1, rot = 0.6) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  rect(ctx, -12, 60, 24, 110, P.ink, null, 0, 8);
  circle(ctx, 0, 0, 64, 'rgba(200,220,240,0.35)', P.ink, 12);
  ctx.beginPath(); ctx.arc(0, 0, 44, -2.6, -1.8); stroke(ctx, P.paperLight, 6);
  ctx.restore();
}

// ---------- more props (home, signs, door, calendar, mirror) ----------
// A 1960s suburban house on a lawn with a picket fence. (x, y) = ground centre.
// o.windowSign(ctx) draws into the front window; o.lit lights the window.
export function house(ctx, x, y, s = 1, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ellipse(ctx, 0, 6, 420, 40, 0, o.lawn || P.sage);
  rect(ctx, -260, -260, 520, 260, o.wall || P.paperLight, P.ink, 6);
  poly(ctx, [[-300, -250], [0, -420], [300, -250]], o.roof || P.ink);
  rect(ctx, 150, -400, 50, 110, P.inkSoft);                                 // chimney
  rect(ctx, -40, -170, 90, 170, P.redDark, P.ink, 5, 4); circle(ctx, 30, -84, 6, P.ochre); // door
  rect(ctx, -220, -200, 140, 110, o.lit ? '#fff3c8' : P.sky, P.ink, 6);   // front window
  ctx.save(); ctx.beginPath(); ctx.rect(-220, -200, 140, 110); ctx.clip(); if (o.windowSign) { ctx.translate(-150, -145); o.windowSign(ctx); } ctx.restore();
  line(ctx, -150, -200, -150, -90, P.ink, 4); line(ctx, -220, -145, -80, -145, P.ink, 4);
  rect(ctx, 100, -200, 120, 110, P.sky, P.ink, 6); line(ctx, 160, -200, 160, -90, P.ink, 4);
  for (let i = -9; i <= 9; i++) { if (Math.abs(i) < 2) continue; const fx = i * 42; poly(ctx, [[fx - 12, 30], [fx - 12, -30], [fx, -44], [fx + 12, -30], [fx + 12, 30]], P.paperLight, P.ink, 3); }
  line(ctx, -400, -10, -80, -10, P.ink, 4); line(ctx, 80, -10, 400, -10, P.ink, 4);
  ctx.restore();
}
// A lawn / window sign. o.ugly = crooked hand-painted letters; o.post = on a stake.
export function sign(ctx, x, y, w, h, label, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0);
  if (o.post) { rect(ctx, -w * 0.3 - 10, 0, 20, o.post, P.brown || '#6b4a2b', P.ink, 3); rect(ctx, w * 0.3 - 10, 0, 20, o.post, '#6b4a2b', P.ink, 3); }
  rect(ctx, -w / 2, -h, w, h, o.fill || P.paperLight, P.ink, Math.max(3, w * 0.012), 4);
  const words = String(label).split(' ');
  font(ctx, 10, o.ugly ? 'hand' : 'serif');
  const rows = o.rows || (words.length > 1 && w / h < 3 ? words.map(x => [x]) : [words]);
  const size = Math.min(h / rows.length * 0.72, w / Math.max(...rows.map(r => r.join(' ').length)) * 1.5);
  rows.forEach((r, i) => {
    const yy = -h + (i + 0.5) * h / rows.length;
    if (o.ugly) { ctx.save(); ctx.translate(0, yy); ctx.rotate(Math.sin(i * 3.1) * 0.06); text(ctx, r.join(' '), 0, 0, size * 1.1, { font: 'hand', color: o.color || P.redDark, max: w * 0.9 }); ctx.restore(); }
    else text(ctx, r.join(' '), 0, yy, size, { font: 'serif', color: o.color || P.ink, max: w * 0.9 });
  });
  ctx.restore();
}
// A door seen from the front, hinged on the left; open 0..1 (perspective squash),
// o.foot (0..1) slides a shoe into the gap.
export function door(ctx, x, y, s = 1, open = 0, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rect(ctx, -170, -520, 340, 520, o.inside || P.ink);                     // the dark room behind
  if (o.glow) { const g = ctx.createRadialGradient(0, -260, 10, 0, -260, 300); g.addColorStop(0, `rgba(255,235,170,${0.9 * o.glow})`); g.addColorStop(1, 'rgba(255,235,170,0)'); ctx.fillStyle = g; ctx.fillRect(-170, -520, 340, 520); }
  if (o.behind) { ctx.save(); ctx.beginPath(); ctx.rect(-170, -520, 340, 520); ctx.clip(); o.behind(ctx); ctx.restore(); }
  const w = 340 * Math.cos(clamp(open) * 1.35);
  poly(ctx, [[-170, -520], [-170 + w, -520 + 30 * open], [-170 + w, -30 * open], [-170, 0]], o.color || P.redDark, P.ink, 5);
  if (w > 60) { circle(ctx, -170 + w - 30, -250, 12, P.ochre, P.ink, 3); rect(ctx, -170 + w * 0.15, -470, w * 0.7, 180, null, P.ink, 3); rect(ctx, -170 + w * 0.15, -250, w * 0.7, 200, null, P.ink, 3); }
  rect(ctx, -190, -540, 380, 24, P.inkSoft); rect(ctx, -190, -540, 22, 540, P.inkSoft); rect(ctx, 168, -540, 22, 540, P.inkSoft);
  if (o.foot) { // a shoe wedged in the gap
    const fx = lerp(420, -170 + w + 30, ease.outCubic(clamp(o.foot)));
    ctx.save(); ctx.translate(fx, -18);
    rect(ctx, 30, -120, 60, 110, P.inkSoft); // trouser leg
    ctx.beginPath(); ctx.moveTo(110, -10); ctx.lineTo(110, -50); ctx.quadraticCurveTo(40, -60, -20, -36); ctx.quadraticCurveTo(-50, -26, -40, -8); ctx.closePath(); fill(ctx, P.ink);
    line(ctx, -30, -4, 110, -4, P.inkSoft, 6);
    ctx.restore();
  }
  ctx.restore();
}
// A tear-off wall calendar showing `day` (number) of `month`; flip 0..1 tears the top page.
export function calendar(ctx, x, y, s = 1, day = 1, month = 'MAY', flip = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const pageAt = d => { rect(ctx, -110, -60, 220, 230, P.paperLight, P.ink, 5, 6); rect(ctx, -110, -60, 220, 56, P.red, P.ink, 5, 6); text(ctx, month, 0, -31, 34, { color: P.paperLight }); text(ctx, String(d), 0, 80, 120, { font: 'display' }); };
  pageAt(day + 1);
  if (flip < 1) { ctx.save(); ctx.translate(0, -60); ctx.rotate(-flip * 1.2); ctx.translate(flip * 200, flip * 120); ctx.globalAlpha = 1 - flip; ctx.translate(0, 60); pageAt(day); ctx.restore(); }
  for (const rx of [-60, 0, 60]) circle(ctx, rx, -60, 9, P.ink);
  ctx.restore();
}
// An oval mirror; draw(ctx) paints the reflection (already flipped left-right).
export function mirrorFrame(ctx, x, y, rx, ry, draw) {
  ctx.save(); ctx.translate(x, y);
  ellipse(ctx, 0, 0, rx + 22, ry + 22, 0, P.ochre, P.ink, 5);
  ellipse(ctx, 0, 0, rx, ry, 0, '#c9d6de');
  ctx.save(); ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, TAU); ctx.clip(); ctx.scale(-1, 1); if (draw) draw(ctx);
  ctx.restore();
  ctx.save(); ctx.globalAlpha = 0.35; ctx.beginPath(); ctx.ellipse(-rx * 0.35, -ry * 0.4, rx * 0.18, ry * 0.35, -0.5, 0, TAU); fill(ctx, '#fff'); ctx.restore();
  ctx.restore();
}

// ---------- more props (numbers & money) ----------
// A wheel of fortune numbered 0–95 in steps of 5; `rot` in radians.
// wheelAngleFor(n) gives the rotation that brings number n under the pointer.
export const wheelAngleFor = n => -(n / 5) / 20 * TAU;
export function wheel(ctx, x, y, r, rot = 0, o = {}) {
  ctx.save(); ctx.translate(x, y);
  circle(ctx, 0, 0, r + 18, P.ink);
  ctx.save(); ctx.rotate(rot);
  for (let i = 0; i < 20; i++) {
    const a0 = -Math.PI / 2 + (i - 0.5) / 20 * TAU, a1 = a0 + TAU / 20;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r, a0, a1); ctx.closePath();
    fill(ctx, [P.paperLight, P.red, P.paperDark, P.inkSoft][i % 4]); stroke(ctx, P.ink, 2);
    ctx.save(); ctx.rotate(i / 20 * TAU); text(ctx, String(i * 5), 0, -r * 0.8, r * 0.11, { font: 'serif', color: i % 4 === 1 || i % 4 === 3 ? P.paperLight : P.ink }); ctx.restore();
  }
  ctx.restore();
  circle(ctx, 0, 0, r * 0.14, P.ochre, P.ink, 4);
  poly(ctx, [[-r * 0.09, -r - 40], [r * 0.09, -r - 40], [0, -r + 18]], o.pointer || P.red, P.ink, 4);  // pointer
  ctx.restore();
}
// A ship's anchor hanging from (x, y) by a chain of `chain` px.
export function anchor(ctx, x, y, s = 1, chain = 0, color = P.ink) {
  ctx.save(); ctx.translate(x, y);
  for (let i = 0; i < chain; i += 26) ellipse(ctx, 0, i + 13, 8, 14, 0, null, color, 5);
  ctx.translate(0, chain); ctx.scale(s, s);
  circle(ctx, 0, 14, 16, null, color, 8);
  rect(ctx, -8, 28, 16, 170, color);
  rect(ctx, -60, 60, 120, 16, color, null, 0, 8);
  ctx.beginPath(); ctx.arc(0, 140, 90, 0.15, Math.PI - 0.15); stroke(ctx, color, 16);
  for (const sx of [-1, 1]) poly(ctx, [[sx * 88, 152], [sx * 112, 118], [sx * 70, 128]], color);
  ctx.restore();
}
// A shop price tag (hole + string). old = crossed-out price, price = new price; k strikes it.
export function priceTag(ctx, x, y, s = 1, old = '$200', price = '$99', k = 1, rot = -0.1) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  poly(ctx, [[-160, -100], [150, -100], [220, 0], [150, 100], [-160, 100]], P.paperLight, P.ink, 6);
  circle(ctx, 165, 0, 18, P.paperDark, P.ink, 4);
  ctx.beginPath(); ctx.moveTo(183, 0); ctx.bezierCurveTo(260, -40, 280, -120, 240, -170); stroke(ctx, P.ink, 4);
  text(ctx, old, -20, -40, 64, { font: 'display', color: P.grey });
  penLine(ctx, [[-120, -30], [80, -50]], k, P.red, 10);
  if (k > 0.6) text(ctx, price, -20, 45, 86, { font: 'display', color: P.red });
  ctx.restore();
}
// A horizontal number line from a to b (values) over w px.
export function numberLine(ctx, x, y, w, a = 0, b = 100, step = 10) {
  line(ctx, x, y, x + w, y, P.ink, 6);
  for (let v = a; v <= b; v += step) { const px = x + (v - a) / (b - a) * w; line(ctx, px, y - 16, px, y + 16, P.ink, 4); text(ctx, String(v), px, y + 44, 30, {}); }
  return v => x + (v - a) / (b - a) * w;
}

// ---------- more props (letters & feelings) ----------
// A closed book (o.open 0..1 opens the cover), o.glow lights it.
export function book(ctx, x, y, s = 1, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(s, s);
  if (o.glow) { const g = ctx.createRadialGradient(0, 0, 10, 0, 0, 200); g.addColorStop(0, `rgba(255,236,170,${0.8 * o.glow})`); g.addColorStop(1, 'rgba(255,236,170,0)'); ctx.fillStyle = g; ctx.fillRect(-210, -210, 420, 420); }
  rect(ctx, -90, -120, 180, 240, P.paperLight, P.ink, 4, 4);
  for (let i = 0; i < 6; i++) line(ctx, 80, -110 + i * 44, 88, -110 + i * 44, P.greyLight, 2);
  const w = 190 * Math.cos(clamp(o.open || 0) * Math.PI * 0.85);
  poly(ctx, [[-96, -126], [-96 + w, -126], [-96 + w, 126], [-96, 126]], o.color || P.redDark, P.ink, 5);
  if (w > 80) { rect(ctx, -96 + w * 0.2, -60, w * 0.6, 50, null, P.ochre, 3); if (o.title) text(ctx, o.title, -96 + w / 2, -35, 22, { font: 'serif', color: P.ochre, max: w * 0.55 }); }
  rect(ctx, -104, -126, 16, 252, P.ink, null, 0, 4);
  ctx.restore();
}
// A folded letter / note with handwriting; k writes it on.
export function letter(ctx, x, y, w, h, lines = [], k = 1, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0);
  rect(ctx, -w / 2, -h / 2, w, h, o.fill || '#f3e6c4', P.ink, 4, 4);
  line(ctx, -w / 2, -h / 6, w / 2, -h / 6, 'rgba(0,0,0,0.08)', 3); line(ctx, -w / 2, h / 6, w / 2, h / 6, 'rgba(0,0,0,0.08)', 3);
  const size = o.size || h / (lines.length + 1.5) * 0.8;
  lines.forEach((t, i) => scrawl(ctx, t, -w / 2 + 30, -h / 2 + (i + 1) * h / (lines.length + 1), size, clamp(k * lines.length - i), { align: 'left', color: o.color || P.ink, rot: 0 }));
  if (o.seal) { circle(ctx, w / 2 - 50, h / 2 - 46, 30 * o.seal, P.red, P.redDark, 3); text(ctx, o.sealText || 'BF', w / 2 - 50, h / 2 - 44, 22 * o.seal, { font: 'serif', color: P.paperLight }); }
  ctx.restore();
}
export function quill(ctx, x, y, s = 1, rot = -0.6) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-30, -120, 10, -240); ctx.quadraticCurveTo(40, -120, 0, 0); fill(ctx, P.paperLight); stroke(ctx, P.ink, 3);
  line(ctx, 0, 0, 8, -230, P.ink, 3);
  for (let i = 0; i < 9; i++) line(ctx, 3 + i, -40 - i * 22, -18 + i * 1.5, -60 - i * 22, P.greyLight, 2);
  ctx.restore();
}
// A heart (k pops it in).
export function heart(ctx, x, y, r, color = P.red, k = 1) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(k * r / 30, k * r / 30);
  ctx.beginPath(); ctx.moveTo(0, 26); ctx.bezierCurveTo(-46, -4, -26, -42, 0, -18); ctx.bezierCurveTo(26, -42, 46, -4, 0, 26); fill(ctx, color);
  ctx.restore();
}
// An angry scribble cloud (a grudge) above a head; k 0..1 grows it.
export function grudge(ctx, x, y, r, t = 0, k = 1, color = P.ink) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  ctx.beginPath();
  for (let i = 0; i <= 90; i++) { const a = i / 90 * TAU * 4, rr = r * (0.55 + 0.45 * Math.abs(Math.sin(i * 1.7 + t * 9))); i ? ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr * 0.6) : ctx.moveTo(rr, 0); }
  stroke(ctx, color, 4);
  ctx.restore();
}

// Card-stock texture (fibres, mottling, foxing spots) — multiply it on top.
export function paperTexture(w, h, seed = 5) {
  const cv = createCanvas(w, h), ctx = cv.getContext('2d'), R = rng(seed);
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h);
  const img = ctx.getImageData(0, 0, w, h), d = img.data;
  for (let y = 0; y < h; y += 2) for (let x = 0; x < w; x += 2) {
    const n = fbm(x / 140, y / 140, seed, 3) * 10 + (R() - 0.5) * 12;
    const v = clamp(246 + n, 0, 255) | 0;
    for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) { const k = ((y + dy) * w + x + dx) * 4; if (k < d.length) { d[k] = v; d[k + 1] = v - 2; d[k + 2] = v - 7; } }
  }
  ctx.putImageData(img, 0, 0);
  ctx.globalAlpha = 0.07; ctx.strokeStyle = '#6b5a40'; ctx.lineWidth = 1;
  for (let i = 0; i < 380; i++) { const x = R() * w, y = R() * h, a = R() * TAU, l = 6 + R() * 22; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + Math.cos(a + 1) * l / 2, y + Math.sin(a + 1) * l / 2, x + Math.cos(a) * l, y + Math.sin(a) * l); ctx.stroke(); }
  ctx.globalAlpha = 0.06; for (let i = 0; i < 18; i++) circle(ctx, R() * w, R() * h, 3 + R() * 16, '#9a6a3a');
  ctx.globalAlpha = 1;
  return cv;
}

export { noise1, rng, clamp, lerp, ease, TAU };
