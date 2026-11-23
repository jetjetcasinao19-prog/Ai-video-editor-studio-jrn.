// Ottoman miniature painting kit — every brush stroke is code.
//
// Conventions of the style (16th–18th c. nakkaşhane manuscripts) that this
// kit follows: flat colour, no cast shadows, thin dark ink outlines, a high
// tilted ground plane, burnished gold skies with Chinese-style cloud bands,
// "spongy" pastel rocks, cypresses and flowering trees, patterned textiles,
// figures labelled with small inscriptions, and pictures framed by gold rules
// that things are allowed to break out of.
import { createCanvas } from '@napi-rs/canvas';
import { TAU, clamp, lerp, rng, noise1, ease } from '../../lib/core.mjs';

export const P = {
  paper: '#efe2c0', paperLight: '#f7eed6', paperDark: '#d8c495',
  gold: '#c9a227', goldLight: '#ecd57a', goldDark: '#8f6c14', goldDeep: '#6e510c',
  lapis: '#20408f', lapisLight: '#3f68bd', lapisDeep: '#142a63',
  verm: '#c4371f', vermDark: '#8e2414', rose: '#e0a59b', pink: '#e8b7b0',
  green: '#3d8458', greenDark: '#24573a', sage: '#9cb46c', sageLight: '#b9c98a', olive: '#6d7d39',
  lav: '#a99ac6', lavLight: '#c9bede', ochre: '#d6973a', ochreLight: '#e9be6e',
  ink: '#2a1c12', white: '#f8f2e2', turq: '#2a9c93', turqLight: '#6cc3b8',
  water: '#4f6f86', waterLight: '#a9c2cf', brown: '#7a4a2a', brownLight: '#a8703f',
  skin: '#f1d1a8', skinShade: '#ddb184', night: '#17224d', grey: '#8f98a3', steel: '#6f86a6',
};

// ---------- basic strokes ----------
export function stroke(ctx, color = P.ink, lw = 2.2) {
  ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke();
}
export function fillStroke(ctx, fill, color = P.ink, lw = 2.2) {
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (color) stroke(ctx, color, lw);
}
export function shape(ctx, build, fill, color = P.ink, lw = 2.2) {
  ctx.beginPath(); build(ctx); fillStroke(ctx, fill, color, lw);
}
export function circle(ctx, x, y, r, fill, color = P.ink, lw = 2) {
  shape(ctx, c => c.arc(x, y, Math.max(0.1, r), 0, TAU), fill, color, lw);
}
export function ellipse(ctx, x, y, rx, ry, rot, fill, color = P.ink, lw = 2) {
  shape(ctx, c => c.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, TAU), fill, color, lw);
}
export function rect(ctx, x, y, w, h, fill, color = P.ink, lw = 2) {
  shape(ctx, c => c.rect(x, y, w, h), fill, color, lw);
}
export function poly(ctx, pts, fill, color = P.ink, lw = 2, close = true) {
  shape(ctx, c => { c.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) c.lineTo(p[0], p[1]); if (close) c.closePath(); }, fill, color, lw);
}
// Smooth closed curve through points (Catmull-Rom → Bézier).
export function smoothPath(ctx, pts, closed = true) {
  const n = pts.length, g = i => pts[closed ? (i + n) % n : clamp(i, 0, n - 1)];
  ctx.moveTo(pts[0][0], pts[0][1]);
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
    ctx.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]);
  }
  if (closed) ctx.closePath();
}
export function blob(ctx, cx, cy, r, seed, wob = 0.25, n = 14, fill, color = P.ink, lw = 2, sy = 1) {
  const R = rng(seed), pts = [];
  for (let i = 0; i < n; i++) { const a = (i / n) * TAU, rr = r * (1 + (R() * 2 - 1) * wob); pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * sy]); }
  shape(ctx, c => smoothPath(c, pts), fill, color, lw);
}

// ---------- textile patterns ----------
const patCache = new Map();
export function pattern(ctx, kind, bg, fg, size = 22) {
  const key = kind + bg + fg + size;
  if (patCache.has(key)) return patCache.get(key);
  const c = createCanvas(size, size), x = c.getContext('2d');
  x.fillStyle = bg; x.fillRect(0, 0, size, size);
  x.fillStyle = fg; x.strokeStyle = fg;
  const s = size;
  if (kind === 'cintamani') { // three balls + twin waves, the Ottoman imperial motif
    for (const [a, b] of [[0.3, 0.28], [0.52, 0.28], [0.41, 0.46]]) { x.beginPath(); x.arc(a * s, b * s, s * 0.08, 0, TAU); x.fill(); }
    x.lineWidth = s * 0.05; x.beginPath(); x.moveTo(0.2 * s, 0.72 * s); x.quadraticCurveTo(0.35 * s, 0.6 * s, 0.5 * s, 0.72 * s); x.quadraticCurveTo(0.65 * s, 0.84 * s, 0.8 * s, 0.72 * s); x.stroke();
  } else if (kind === 'flowers') {
    for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2; x.beginPath(); x.ellipse(s / 2 + Math.cos(a) * s * 0.13, s / 2 + Math.sin(a) * s * 0.13, s * 0.1, s * 0.06, a, 0, TAU); x.fill(); }
    x.fillStyle = bg; x.beginPath(); x.arc(s / 2, s / 2, s * 0.05, 0, TAU); x.fill();
  } else if (kind === 'dots') {
    x.beginPath(); x.arc(s * 0.25, s * 0.25, s * 0.08, 0, TAU); x.arc(s * 0.75, s * 0.75, s * 0.08, 0, TAU); x.fill();
  } else if (kind === 'stripes') {
    x.fillRect(0, 0, s, s * 0.22); x.fillRect(0, s * 0.5, s, s * 0.08);
  } else if (kind === 'scales') {
    x.lineWidth = s * 0.06; for (const [a, b] of [[0, 0], [s, 0], [s / 2, s / 2], [0, s], [s, s]]) { x.beginPath(); x.arc(a, b, s * 0.48, 0.15 * Math.PI, 0.85 * Math.PI); x.stroke(); }
  } else if (kind === 'tiles') { // İznik-style tile: blue rosette on white
    x.lineWidth = 1.5; x.strokeStyle = fg; x.strokeRect(0.5, 0.5, s - 1, s - 1);
    for (let k = 0; k < 6; k++) { const a = k * TAU / 6; x.beginPath(); x.ellipse(s / 2 + Math.cos(a) * s * 0.18, s / 2 + Math.sin(a) * s * 0.18, s * 0.12, s * 0.06, a, 0, TAU); x.fill(); }
    x.fillStyle = P.verm; x.beginPath(); x.arc(s / 2, s / 2, s * 0.07, 0, TAU); x.fill();
  } else if (kind === 'bubbles') {
    for (const [a, b] of [[0.25, 0.25], [0.75, 0.75]]) {
      x.fillStyle = fg; x.beginPath(); x.arc(a * s, b * s, s * 0.2, 0, TAU); x.fill();
      x.fillStyle = 'rgba(255,255,255,0.8)'; x.beginPath(); x.arc(a * s - s * 0.07, b * s - s * 0.07, s * 0.06, 0, TAU); x.fill();
    }
  }
  const p = ctx.createPattern(c, 'repeat');
  patCache.set(key, p);
  return p;
}

// ---------- sky, clouds, celestial ----------
export function goldSky(ctx, x, y, w, h, t = 0) {
  const g = ctx.createLinearGradient(x, y, x + w * 0.3, y + h);
  g.addColorStop(0, P.goldLight); g.addColorStop(0.55, P.gold); g.addColorStop(1, P.goldDark);
  ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
  // burnishing marks: soft diagonal sheen sweeping slowly
  const sx = x + ((t * 60) % (w * 2)) - w * 0.5;
  const s = ctx.createLinearGradient(sx - 160, y, sx + 160, y + 160);
  s.addColorStop(0, 'rgba(255,250,210,0)'); s.addColorStop(0.5, 'rgba(255,250,210,0.28)'); s.addColorStop(1, 'rgba(255,250,210,0)');
  ctx.fillStyle = s; ctx.fillRect(x, y, w, h);
  // punched-gold dots (zerefşan)
  const R = rng(7); ctx.fillStyle = 'rgba(120,85,10,0.35)';
  for (let i = 0; i < 90; i++) { ctx.beginPath(); ctx.arc(x + R() * w, y + R() * h, 1.2 + R() * 1.4, 0, TAU); ctx.fill(); }
}
export function nightSky(ctx, x, y, w, h, t = 0) {
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, P.lapisDeep); g.addColorStop(1, P.night);
  ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
  const R = rng(3);
  for (let i = 0; i < 70; i++) star(ctx, x + R() * w, y + R() * h, 3 + R() * 5, 0.5 + 0.5 * Math.sin(t * 3 + i));
}
export function star(ctx, x, y, r, a = 1) {
  ctx.save(); ctx.globalAlpha *= clamp(a); ctx.translate(x, y);
  ctx.beginPath();
  for (let i = 0; i < 16; i++) { const rr = i % 2 ? r * 0.35 : r, an = (i / 16) * TAU; ctx.lineTo(Math.cos(an) * rr, Math.sin(an) * rr); }
  ctx.closePath(); ctx.fillStyle = P.goldLight; ctx.fill(); ctx.restore();
}
// Chinese-style "tchi" cloud band: lobed white ribbon with curls and a tail.
export function cloud(ctx, x, y, s = 1, seed = 1, fill = P.white, line = P.lapis) {
  const R = rng(seed), n = 4 + Math.floor(R() * 3), lobes = [];
  for (let i = 0; i < n; i++) lobes.push([x + (i - n / 2) * 26 * s, y + Math.sin(i * 1.7 + seed) * 7 * s, (15 + R() * 9) * s]);
  ctx.save();
  // tail
  ctx.beginPath(); const ex = lobes[n - 1][0], ey = lobes[n - 1][1];
  ctx.moveTo(ex, ey - 8 * s); ctx.bezierCurveTo(ex + 40 * s, ey - 22 * s, ex + 60 * s, ey + 12 * s, ex + 95 * s, ey - 4 * s);
  ctx.bezierCurveTo(ex + 62 * s, ey + 2 * s, ex + 42 * s, ey + 6 * s, ex, ey + 8 * s);
  fillStroke(ctx, fill, line, 2.2);
  ctx.lineWidth = 4.4; ctx.strokeStyle = line;
  for (const [a, b, r] of lobes) { ctx.beginPath(); ctx.arc(a, b, r, 0, TAU); ctx.stroke(); }
  ctx.fillStyle = fill;
  for (const [a, b, r] of lobes) { ctx.beginPath(); ctx.arc(a, b, r, 0, TAU); ctx.fill(); }
  ctx.lineWidth = 1.6;
  for (const [a, b, r] of lobes) { ctx.beginPath(); ctx.arc(a, b + 2, r * 0.5, Math.PI * 0.9, Math.PI * 2.3); ctx.stroke(); }
  ctx.restore();
}
export function sun(ctx, x, y, r, t = 0, face = true) {
  ctx.save(); ctx.translate(x, y);
  for (let i = 0; i < 24; i++) {
    ctx.save(); ctx.rotate(i / 24 * TAU + t * 0.4);
    const L = r * (i % 2 ? 1.45 : 1.75) * (1 + 0.06 * Math.sin(t * 6 + i));
    ctx.beginPath(); ctx.moveTo(-r * 0.16, 0); ctx.quadraticCurveTo(r * 0.3, -r * 0.4, 0, -L); ctx.quadraticCurveTo(r * 0.05, -r * 0.4, r * 0.16, 0);
    fillStroke(ctx, i % 2 ? P.ochre : P.goldLight, P.goldDeep, 1.6); ctx.restore();
  }
  circle(ctx, 0, 0, r, P.goldLight, P.goldDeep, 2.5);
  if (face) {
    ctx.fillStyle = P.ink;
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * r * 0.33, -r * 0.1, r * 0.12, r * 0.05, 0, 0, TAU); ctx.fill(); }
    ctx.beginPath(); ctx.arc(0, r * 0.25, r * 0.28, 0.15 * Math.PI, 0.85 * Math.PI); stroke(ctx, P.vermDark, 2.5);
  }
  ctx.restore();
}
export function moon(ctx, x, y, r) {
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.arc(x + r * 0.45, y - r * 0.15, r * 0.85, 0, TAU, true);
  ctx.fillStyle = P.goldLight; ctx.fill('evenodd'); ctx.restore();
}

// ---------- land ----------
// Rolling horizon of spongy pastel hills.
export function hills(ctx, W, yTop, seed = 1, colors = [P.lav, P.rose, P.sageLight], t = 0) {
  const R = rng(seed), n = 5;
  for (let i = 0; i < n; i++) {
    const cx = (i + 0.2 + R() * 0.6) * W / (n - 1) - W * 0.1, w = W * (0.32 + R() * 0.2), h = 60 + R() * 70;
    spongy(ctx, cx, yTop + 90, w, h + 90, colors[i % colors.length], seed * 10 + i);
  }
}
// A rock/mountain with the bubbly outline that Ottoman painters loved.
export function spongy(ctx, cx, base, w, h, color, seed = 1) {
  const R = rng(seed), pts = [], n = 18;
  for (let i = 0; i <= n; i++) {
    const a = Math.PI + (i / n) * Math.PI;
    pts.push([cx + Math.cos(a) * w / 2, base + Math.sin(a) * h * (0.85 + R() * 0.3)]);
  }
  ctx.beginPath(); ctx.moveTo(pts[0][0], base + 20);
  ctx.lineTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
    const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1;
    ctx.quadraticCurveTo(mx + dy / L * 14, my - dx / L * 14, x1, y1);
  }
  ctx.lineTo(pts[n][0], base + 20); ctx.closePath();
  fillStroke(ctx, color, P.ink, 2);
  // inner contour strokes
  ctx.save(); ctx.globalAlpha = 0.35;
  for (let k = 0; k < 4; k++) {
    const x = cx + (R() - 0.5) * w * 0.6, y = base - h * (0.2 + R() * 0.5);
    ctx.beginPath(); ctx.arc(x, y, 10 + R() * 14, Math.PI * 1.1, Math.PI * 1.9); stroke(ctx, P.ink, 1.5);
  }
  ctx.restore();
}
export function ground(ctx, x, y, w, h, color = P.sage, seed = 2, density = 1) {
  ctx.fillStyle = color; ctx.fillRect(x, y, w, h);
  const R = rng(seed), n = Math.floor(w * h / 9000 * density);
  for (let i = 0; i < n; i++) {
    const px = x + R() * w, py = y + 16 + R() * (h - 20), k = R();
    if (k < 0.55) tuft(ctx, px, py, 0.8 + R() * 0.6, k < 0.3 ? P.greenDark : P.olive);
    else if (k < 0.85) flower(ctx, px, py, 4 + R() * 3, [P.verm, P.white, P.lapisLight, P.ochre][Math.floor(R() * 4)]);
    else circle(ctx, px, py, 2 + R() * 3, P.paperDark, P.ink, 1);
  }
}
export function tuft(ctx, x, y, s = 1, color = P.greenDark) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath();
  for (let i = -2; i <= 2; i++) { ctx.moveTo(i * 2, 0); ctx.quadraticCurveTo(i * 4, -8, i * 6, -14 + Math.abs(i) * 3); }
  stroke(ctx, color, 1.6); ctx.restore();
}
export function flower(ctx, x, y, r, color) {
  ctx.save(); ctx.translate(x, y);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, r * 2.2); stroke(ctx, P.greenDark, 1.3);
  for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; ellipse(ctx, Math.cos(a) * r * 0.6, Math.sin(a) * r * 0.6, r * 0.55, r * 0.35, a, color, P.ink, 0.8); }
  circle(ctx, 0, 0, r * 0.3, P.ochreLight, null);
  ctx.restore();
}
export function cypress(ctx, x, base, h, t = 0, seed = 1) {
  const sway = Math.sin(t * 1.3 + seed) * h * 0.012, w = h * 0.17;
  ctx.save(); ctx.translate(x, base);
  rect(ctx, -4, -14, 8, 16, P.brown, P.ink, 1.5);
  ctx.beginPath(); ctx.moveTo(0 + sway * 3, -h);
  ctx.bezierCurveTo(w * 0.9, -h * 0.75, w * 1.1, -h * 0.25, w * 0.55, -10);
  ctx.lineTo(-w * 0.55, -10);
  ctx.bezierCurveTo(-w * 1.1, -h * 0.25, -w * 0.9, -h * 0.75, 0 + sway * 3, -h);
  fillStroke(ctx, P.greenDark, P.ink, 2);
  ctx.globalAlpha = 0.5;
  for (let i = 1; i < 9; i++) {
    const yy = -h * i / 10, ww = w * (0.35 + 0.5 * Math.sin(Math.PI * i / 10));
    ctx.beginPath(); ctx.moveTo(-ww, yy + 8); ctx.quadraticCurveTo(0, yy - 6, ww, yy + 8); stroke(ctx, P.green, 2);
  }
  ctx.restore();
}
export function blossomTree(ctx, x, base, h, t = 0, seed = 3, bloom = P.pink) {
  const R = rng(seed);
  ctx.save(); ctx.translate(x, base);
  const branch = (x0, y0, a, len, depth) => {
    const sway = Math.sin(t * 1.5 + depth + seed) * 0.03 * (4 - depth);
    const x1 = x0 + Math.cos(a + sway) * len, y1 = y0 + Math.sin(a + sway) * len;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo((x0 + x1) / 2 + 8, (y0 + y1) / 2, x1, y1); stroke(ctx, P.brown, Math.max(1.5, depth * 3.2));
    if (depth > 0) { branch(x1, y1, a - 0.5 - R() * 0.2, len * 0.7, depth - 1); branch(x1, y1, a + 0.45 + R() * 0.2, len * 0.68, depth - 1); }
    else for (let i = 0; i < 5; i++) { const bx = x1 + (R() - 0.5) * 26, by = y1 + (R() - 0.5) * 26; flower(ctx, bx, by, 4.5, i % 3 ? bloom : P.white); }
  };
  branch(0, 0, -Math.PI / 2, h * 0.38, 4);
  ctx.restore();
}
export function tulip(ctx, x, y, s = 1, color = P.verm, wilt = 0, t = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const bend = wilt * 1.9 + Math.sin(t * 2 + x) * 0.04;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(4, -40, Math.sin(bend) * 40, -Math.cos(bend) * 60 - 10 + wilt * 6); stroke(ctx, P.greenDark, 2.5);
  for (const sd of [-1, 1]) { ctx.beginPath(); ctx.moveTo(0, -2); ctx.quadraticCurveTo(sd * 22, -18, sd * 10 * (1 + wilt), -44 + wilt * 30); ctx.quadraticCurveTo(sd * 6, -20, 0, -2); fillStroke(ctx, P.green, P.ink, 1.3); }
  ctx.translate(Math.sin(bend) * 40, -Math.cos(bend) * 60 - 10 + wilt * 6); ctx.rotate(bend);
  // slender almond petals — the Ottoman (lale) tulip
  for (const [dx, sc] of [[-7, 0.9], [7, 0.9], [0, 1]]) {
    ctx.beginPath(); ctx.moveTo(dx * 0.5, 0); ctx.quadraticCurveTo(dx * 1.8, -14 * sc, dx * 0.6, -34 * sc); ctx.quadraticCurveTo(dx * 0.1 - 2, -16, dx * 0.5, 0);
    fillStroke(ctx, sc === 1 ? color : shade(color, -0.15), P.ink, 1.2);
  }
  ctx.restore();
}
export function carnation(ctx, x, y, s = 1, color = P.verm) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -40); stroke(ctx, P.greenDark, 2);
  ctx.translate(0, -40);
  ctx.beginPath(); ctx.moveTo(-14, 0);
  for (let i = 0; i <= 8; i++) { const a = Math.PI + i / 8 * Math.PI; ctx.lineTo(Math.cos(a) * (i % 2 ? 12 : 17), Math.sin(a) * (i % 2 ? 12 : 17)); }
  ctx.closePath(); fillStroke(ctx, color, P.ink, 1.2);
  poly(ctx, [[-6, 0], [6, 0], [3, 10], [-3, 10]], P.green, P.ink, 1.2);
  ctx.restore();
}

// ---------- architecture ----------
export function house(ctx, x, base, w, h, o = {}) {
  const wall = o.wall || P.pink, roof = o.roof || P.vermDark, win = o.window || P.lapis;
  ctx.save(); ctx.translate(x, base);
  rect(ctx, -w / 2, -h, w, h, wall, P.ink, 2);
  if (o.pattern) { ctx.save(); ctx.globalAlpha = 0.5; ctx.fillStyle = pattern(ctx, o.pattern, wall, shade(wall, -0.15), 18); ctx.fillRect(-w / 2 + 2, -h + 2, w - 4, h - 4); ctx.restore(); }
  // gable roof with scalloped tiles
  ctx.beginPath(); ctx.moveTo(-w / 2 - 10, -h); ctx.lineTo(0, -h - w * 0.5); ctx.lineTo(w / 2 + 10, -h); ctx.closePath();
  ctx.save(); ctx.clip(); ctx.fillStyle = roof; ctx.fillRect(-w, -h - w, w * 2, w);
  ctx.strokeStyle = shade(roof, 0.25); ctx.lineWidth = 1.2;
  for (let yy = -h - w * 0.5; yy < -h; yy += 9) for (let xx = -w; xx < w; xx += 12) { ctx.beginPath(); ctx.arc(xx + ((yy / 9) % 2) * 6, yy, 6, 0, Math.PI); ctx.stroke(); }
  ctx.restore();
  ctx.beginPath(); ctx.moveTo(-w / 2 - 10, -h); ctx.lineTo(0, -h - w * 0.5); ctx.lineTo(w / 2 + 10, -h); ctx.closePath(); stroke(ctx, P.ink, 2);
  if (o.chimney) { rect(ctx, w * 0.2, -h - w * 0.42, 12, 26, P.brown, P.ink, 1.5); }
  // arched windows
  const cols = Math.max(1, Math.floor(w / 46));
  for (let i = 0; i < cols; i++) {
    const wx = -w / 2 + (i + 0.5) * (w / cols);
    arch(ctx, wx, -h * 0.42, 14, 26, o.lit ? P.goldLight : win);
  }
  // door
  arch(ctx, 0, -2, 13, 30, P.brown);
  ctx.restore();
}
export function arch(ctx, x, y, w, h, fill) {
  ctx.beginPath(); ctx.moveTo(x - w / 2, y); ctx.lineTo(x - w / 2, y - h * 0.55);
  ctx.quadraticCurveTo(x - w / 2, y - h, x, y - h); ctx.quadraticCurveTo(x + w / 2, y - h, x + w / 2, y - h * 0.55);
  ctx.lineTo(x + w / 2, y); ctx.closePath(); fillStroke(ctx, fill, P.ink, 1.6);
}
export function dome(ctx, x, base, r, color = P.lapisLight) {
  ctx.beginPath(); ctx.moveTo(x - r, base); ctx.bezierCurveTo(x - r, base - r * 1.3, x - r * 0.1, base - r * 1.2, x, base - r * 1.6);
  ctx.bezierCurveTo(x + r * 0.1, base - r * 1.2, x + r, base - r * 1.3, x + r, base); ctx.closePath(); fillStroke(ctx, color, P.ink, 2);
  ctx.beginPath(); ctx.moveTo(x, base - r * 1.6); ctx.lineTo(x, base - r * 2); stroke(ctx, P.goldDark, 2.5);
  circle(ctx, x, base - r * 2.05, 4, P.goldLight, P.goldDeep, 1.2);
}
export function waterTower(ctx, x, base, s = 1, text = 'HAWTHORNE') {
  ctx.save(); ctx.translate(x, base); ctx.scale(s, s);
  for (const lx of [-40, -14, 14, 40]) { ctx.beginPath(); ctx.moveTo(lx, 0); ctx.lineTo(lx * 0.75, -120); stroke(ctx, P.ink, 3); }
  ctx.beginPath(); ctx.moveTo(-40, -40); ctx.lineTo(30, -110); ctx.moveTo(40, -40); ctx.lineTo(-30, -110); stroke(ctx, P.ink, 1.5);
  ctx.beginPath(); ctx.ellipse(0, -120, 52, 12, 0, 0, Math.PI); ctx.lineTo(52, -190); ctx.ellipse(0, -190, 52, 12, 0, 0, Math.PI, true); ctx.closePath(); fillStroke(ctx, P.turqLight, P.ink, 2);
  ctx.beginPath(); ctx.moveTo(-52, -190); ctx.quadraticCurveTo(0, -250, 52, -190); fillStroke(ctx, P.turq, P.ink, 2);
  ctx.fillStyle = P.ink; ctx.font = '700 13px Fell'; ctx.textAlign = 'center'; ctx.fillText(text, 0, -150);
  ctx.restore();
}
export function factory(ctx, x, base, w, h, t = 0, smoke = true) {
  ctx.save(); ctx.translate(x, base);
  rect(ctx, -w / 2, -h, w, h, P.ochreLight, P.ink, 2);
  // saw-tooth roof
  const n = 4; ctx.beginPath(); ctx.moveTo(-w / 2, -h);
  for (let i = 0; i < n; i++) { const x0 = -w / 2 + i * w / n; ctx.lineTo(x0 + w / n * 0.75, -h - 30); ctx.lineTo(x0 + w / n, -h); }
  ctx.closePath(); fillStroke(ctx, P.steel, P.ink, 2);
  for (let i = 0; i < 3; i++) arch(ctx, -w / 2 + (i + 0.5) * w / 3, -h * 0.35, 20, 36, P.lapis);
  rect(ctx, w * 0.3, -h - 110, 22, 110, P.vermDark, P.ink, 2);
  if (smoke) for (let i = 0; i < 4; i++) {
    const k = (t * 0.35 + i / 4) % 1;
    ctx.save(); ctx.globalAlpha = 1 - k; cloud(ctx, w * 0.3 + 11 + k * 60, -h - 120 - k * 120, 0.45 + k * 0.4, i + 3, P.white, P.grey); ctx.restore();
  }
  ctx.restore();
}
export function canopy(ctx, x, y, w, h, color = P.verm, t = 0) {
  ctx.save(); ctx.translate(x, y);
  for (const sx of [-w / 2 + 6, w / 2 - 6]) rect(ctx, sx - 4, 0, 8, h, P.goldDark, P.ink, 1.5);
  ctx.beginPath(); ctx.moveTo(-w / 2 - 20, 0); ctx.lineTo(0, -h * 0.35); ctx.lineTo(w / 2 + 20, 0); ctx.closePath();
  fillStroke(ctx, color, P.ink, 2);
  // scalloped valance
  ctx.beginPath(); ctx.moveTo(-w / 2 - 20, 0);
  const n = 9; for (let i = 0; i < n; i++) { const x0 = -w / 2 - 20 + (i + 0.5) * (w + 40) / n; ctx.quadraticCurveTo(x0, 26 + Math.sin(t * 3 + i) * 2, -w / 2 - 20 + (i + 1) * (w + 40) / n, 0); }
  fillStroke(ctx, P.lapis, P.ink, 2);
  ctx.restore();
}
export function carpet(ctx, x, y, w, h, field = P.verm, border = P.lapis) {
  rect(ctx, x, y, w, h, border, P.ink, 2);
  ctx.fillStyle = pattern(ctx, 'dots', border, P.goldLight, 14); ctx.fillRect(x + 3, y + 3, w - 6, h - 6);
  rect(ctx, x + 12, y + 10, w - 24, h - 20, field, P.ink, 1.5);
  ctx.fillStyle = pattern(ctx, 'flowers', field, shade(field, 0.25), 20); ctx.fillRect(x + 13, y + 11, w - 26, h - 22);
  ellipse(ctx, x + w / 2, y + h / 2, w * 0.18, h * 0.3, 0, P.lapisLight, P.ink, 1.5);
  ellipse(ctx, x + w / 2, y + h / 2, w * 0.08, h * 0.13, 0, P.goldLight, P.ink, 1.2);
}

// ---------- water + ships ----------
export function waves(ctx, x, y, w, h, t = 0, color = P.water, light = P.waterLight, speed = 30, size = 26) {
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.fillStyle = color; ctx.fillRect(x, y, w, h);
  ctx.lineWidth = 2; ctx.lineCap = 'round';
  let row = 0;
  for (let yy = y + size * 0.6; yy < y + h + size; yy += size * 0.55, row++) {
    const off = ((t * speed * (row % 2 ? 1 : -0.7)) % size) + (row % 2) * size / 2;
    for (let xx = x - size * 2 + off; xx < x + w + size; xx += size) {
      ctx.beginPath(); ctx.arc(xx, yy, size * 0.45, Math.PI * 1.05, Math.PI * 1.95); ctx.strokeStyle = light; ctx.stroke();
      ctx.beginPath(); ctx.arc(xx + size * 0.12, yy - size * 0.05, size * 0.18, Math.PI * 1.1, Math.PI * 1.9); ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.stroke();
    }
  }
  ctx.restore();
}
// Ottoman galley (kadırga) with a striped lateen sail. Cargo drawn by `cargo`.
export function galley(ctx, x, y, s = 1, t = 0, cargo = null, rock = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rock); ctx.scale(s, s);
  // oars
  for (let i = 0; i < 9; i++) {
    const ox = -150 + i * 34, ph = Math.sin(t * 4 + i * 0.3) * 10;
    ctx.beginPath(); ctx.moveTo(ox, -8); ctx.lineTo(ox - 28 + ph, 54); stroke(ctx, P.brown, 3);
  }
  // mast + sail
  ctx.beginPath(); ctx.moveTo(10, -10); ctx.lineTo(10, -250); stroke(ctx, P.brown, 6);
  const bil = Math.sin(t * 2) * 8;
  ctx.beginPath(); ctx.moveTo(-120, -60); ctx.quadraticCurveTo(-20 + bil, -150, 120, -260); ctx.quadraticCurveTo(70 + bil, -140, 10, -45); ctx.closePath();
  ctx.save(); ctx.clip(); ctx.fillStyle = P.white; ctx.fillRect(-130, -270, 260, 230);
  ctx.fillStyle = P.verm; for (let k = -260; k < 0; k += 36) ctx.fillRect(-130, k, 260, 14);
  ctx.restore();
  ctx.beginPath(); ctx.moveTo(-120, -60); ctx.quadraticCurveTo(-20 + bil, -150, 120, -260); ctx.quadraticCurveTo(70 + bil, -140, 10, -45); ctx.closePath(); stroke(ctx, P.ink, 2);
  // pennant
  ctx.beginPath(); ctx.moveTo(10, -250); ctx.quadraticCurveTo(40, -258 + Math.sin(t * 8) * 6, 70, -245 + Math.sin(t * 8 + 1) * 8); ctx.lineTo(10, -238); fillStroke(ctx, P.verm, P.ink, 1.5);
  if (cargo) cargo(ctx);
  // hull
  ctx.beginPath(); ctx.moveTo(-200, -30); ctx.quadraticCurveTo(-180, 22, -120, 26); ctx.lineTo(150, 26); ctx.quadraticCurveTo(210, 20, 240, -50);
  ctx.quadraticCurveTo(200, -20, 150, -18); ctx.lineTo(-150, -18); ctx.quadraticCurveTo(-180, -22, -200, -30); ctx.closePath();
  fillStroke(ctx, P.vermDark, P.ink, 2.5);
  ctx.beginPath(); ctx.moveTo(-180, -8); ctx.lineTo(190, -8); stroke(ctx, P.goldLight, 4);
  for (let i = 0; i < 12; i++) circle(ctx, -160 + i * 30, 8, 4, P.goldLight, P.ink, 1);
  // stern lantern
  ctx.beginPath(); ctx.moveTo(-196, -32); ctx.lineTo(-206, -70); stroke(ctx, P.ink, 2.5);
  ellipse(ctx, -207, -78, 7, 11, 0, P.goldLight, P.ink, 1.5);
  ctx.restore();
}

// ---------- people ----------
// A miniature-style figure. Feet at (x, y); about 300·s tall.
// o: { s, skin (colour), face: 1|-1, robe, robeP, inner, sash, hat:'turban'|'fez'|'cap'|'crown', hatColor,
//      beard:'none'|'short'|'long', glasses, armB:[shoulder,elbow], armF:[shoulder,elbow],
//      hold(ctx) drawn in the front hand, walk (phase) , bob, kneel, label, mood:'happy'|'sad'|'calm', look }
let SKIN = P.skin; // skin colour of the figure being drawn (o.skin)
export function figure(ctx, x, y, o = {}) {
  SKIN = o.skin || P.skin;
  const s = o.s || 1, f = o.face || 1;
  const walk = o.walk ?? null, bob = (o.bob || 0) + (walk != null ? Math.abs(Math.sin(walk)) * -4 : 0);
  ctx.save(); ctx.translate(x, y + bob); ctx.scale(s * f, s);
  const robe = o.robe || P.lapis, inner = o.inner || P.ochreLight, kneel = !!o.kneel;
  const top = kneel ? -190 : -250, waist = kneel ? -120 : -170, hem = kneel ? -4 : -10, hw = kneel ? 78 : 56;
  // shoes
  if (!kneel) {
    const st = walk != null ? Math.sin(walk) * 14 : 0;
    for (const [dx, c] of [[-14 + st, P.verm], [14 - st, P.vermDark]]) { ctx.beginPath(); ctx.moveTo(dx - 10, -2); ctx.quadraticCurveTo(dx + 6, -16, dx + 22, -4); ctx.lineTo(dx + 26, 0); ctx.lineTo(dx - 10, 0); fillStroke(ctx, o.shoes || c, P.ink, 1.5); }
  }
  // back arm
  arm(ctx, -12, top + 12, o.armB || [0.15, 0.25], robe, o.robeP, s, null, kneel);
  // robe (bell-shaped kaftan open at the front)
  const robeBody = c => {
    c.moveTo(-24, top + 4); c.lineTo(24, top + 4);
    c.quadraticCurveTo(30, waist, hw, hem); c.quadraticCurveTo(0, hem + (kneel ? 6 : 12), -hw, hem);
    c.quadraticCurveTo(-30, waist, -24, top + 4); c.closePath();
  };
  ctx.beginPath(); robeBody(ctx); ctx.fillStyle = robe; ctx.fill();
  if (o.robeP) { ctx.save(); ctx.clip(); ctx.fillStyle = pattern(ctx, o.robeP, robe, o.robePc || P.goldLight, 22); ctx.fillRect(-120, top, 240, 280); ctx.restore(); }
  ctx.beginPath(); robeBody(ctx); stroke(ctx, P.ink, 2.2);
  // inner robe visible at the front opening
  ctx.beginPath(); ctx.moveTo(6, top + 6); ctx.quadraticCurveTo(14, waist, 24, hem + 4); ctx.lineTo(44, hem + 2); ctx.quadraticCurveTo(26, waist, 16, top + 6); ctx.closePath();
  fillStroke(ctx, inner, P.ink, 1.6);
  // fur/gold trim line
  ctx.beginPath(); ctx.moveTo(6, top + 6); ctx.quadraticCurveTo(14, waist, 24, hem + 4); stroke(ctx, P.goldLight, 3);
  // sash
  ctx.beginPath(); ctx.moveTo(-27, waist - 8); ctx.quadraticCurveTo(0, waist - 2, 29, waist - 8); ctx.lineTo(30, waist + 6); ctx.quadraticCurveTo(0, waist + 12, -28, waist + 6); ctx.closePath();
  fillStroke(ctx, o.sash || P.verm, P.ink, 1.5);
  // head
  head(ctx, 0, top - 30, o);
  // front arm
  arm(ctx, 12, top + 14, o.armF || [-0.1, 0.6], robe, o.robeP, s, o.hold, kneel);
  if (o.badge) { star(ctx, 16, (o.kneel ? -150 : -214), 10, 1); circle(ctx, 16, (o.kneel ? -150 : -214), 4, P.goldLight, P.ink, 1); }
  ctx.restore();
}
function arm(ctx, sx, sy, [a1, a2], robe, robeP, s, hold, kneel) {
  const L1 = 52, L2 = 46;
  const ex = sx + Math.sin(a1) * L1, ey = sy + Math.cos(a1) * L1;
  const hx = ex + Math.sin(a1 + a2) * L2, hy = ey + Math.cos(a1 + a2) * L2;
  ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.lineTo(hx, hy);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = P.ink; ctx.lineWidth = 22; ctx.stroke();
  ctx.strokeStyle = shade(robe, 0.12); ctx.lineWidth = 17.5; ctx.stroke();
  circle(ctx, hx, hy, 7, SKIN, P.ink, 1.5);
  if (hold) { ctx.save(); ctx.translate(hx, hy); hold(ctx, a1 + a2); ctx.restore(); }
}
function head(ctx, x, y, o) {
  ctx.save(); ctx.translate(x, y); ctx.scale(1.35, 1.35);
  const look = o.look || 0; // -1..1 head tilt
  ctx.rotate(look * 0.12);
  // neck
  rect(ctx, -6, 10, 12, 10, SKIN, P.ink, 1.2);
  // face: three-quarter oval
  ellipse(ctx, 2, 0, 15, 19, 0, SKIN, P.ink, 1.8);
  // beard
  if (o.beard === 'chin') { // chin-curtain: a band along the jaw, mouth left clear
    ctx.beginPath(); ctx.moveTo(-14, 7); ctx.quadraticCurveTo(-12, 28, 4, 30); ctx.quadraticCurveTo(19, 28, 17, 7);
    ctx.quadraticCurveTo(14, 19, 4, 20); ctx.quadraticCurveTo(-8, 19, -11, 7); ctx.closePath();
    fillStroke(ctx, o.beardColor || '#3a2a20', P.ink, 1.2);
  } else if (o.beard && o.beard !== 'none') {
    const L = o.beard === 'long' ? 34 : 18;
    ctx.beginPath(); ctx.moveTo(-12, 2); ctx.quadraticCurveTo(-8, L, 6, L + 4); ctx.quadraticCurveTo(18, L - 4, 17, 2); ctx.quadraticCurveTo(6, 12, -12, 2);
    fillStroke(ctx, o.beardColor || '#3a2a20', P.ink, 1.3);
  }
  if (o.collar) { rect(ctx, -5, 18, 10, 5, P.white, P.ink, 1); }
  if (o.stringTie) { ctx.beginPath(); ctx.moveTo(-6, 24); ctx.lineTo(0, 21); ctx.lineTo(6, 24); ctx.lineTo(6, 18); ctx.lineTo(0, 21); ctx.lineTo(-6, 18); ctx.closePath(); fillStroke(ctx, P.ink, P.ink, 1); ctx.beginPath(); ctx.moveTo(-2, 22); ctx.lineTo(-4, 34); ctx.moveTo(2, 22); ctx.lineTo(4, 34); stroke(ctx, P.ink, 1.5); }
  // almond eyes + arched brows
  for (const ex of [-3, 9]) {
    ctx.beginPath(); ctx.moveTo(ex - 4, -3); ctx.quadraticCurveTo(ex, -6, ex + 4, -3); ctx.quadraticCurveTo(ex, -1, ex - 4, -3); fillStroke(ctx, P.ink, P.ink, 0.8);
    ctx.beginPath(); ctx.moveTo(ex - 5, -8); ctx.quadraticCurveTo(ex, -11, ex + 5, -8); stroke(ctx, P.ink, 1.2);
  }
  // nose (towards the facing side) + mouth
  ctx.beginPath(); ctx.moveTo(4, -2); ctx.quadraticCurveTo(10, 6, 5, 7); stroke(ctx, P.ink, 1.1);
  const mood = o.mood || 'calm';
  ctx.beginPath();
  if (mood === 'wow') { ctx.ellipse(4, 12, 2.6, 3.6, 0, 0, TAU); ctx.fillStyle = P.ink; ctx.fill(); } else if (mood === 'happy') ctx.arc(4, 9, 4, 0.1 * Math.PI, 0.9 * Math.PI); else if (mood === 'sad') ctx.arc(4, 15, 4, 1.15 * Math.PI, 1.85 * Math.PI); else { ctx.moveTo(1, 12); ctx.lineTo(7, 12); }
  stroke(ctx, P.vermDark, 1.6);
  if (o.mustache) { ctx.beginPath(); ctx.moveTo(-3, 9); ctx.quadraticCurveTo(4, 6, 11, 9); stroke(ctx, o.mustacheColor || '#3a2a20', 2.5); }
  if (o.glasses) { circle(ctx, -3, -3, 5, 'rgba(220,240,255,0.35)', P.ink, 1.3); circle(ctx, 9, -3, 5, 'rgba(220,240,255,0.35)', P.ink, 1.3); ctx.beginPath(); ctx.moveTo(2, -3); ctx.lineTo(4, -3); stroke(ctx, P.ink, 1.2); }
  // headwear
  const hat = o.hat || 'turban';
  if (hat === 'turban') {
    if (o.hatColor) { ctx.beginPath(); ctx.moveTo(-10, -26); ctx.quadraticCurveTo(2, -72, 14, -26); fillStroke(ctx, o.hatColor, P.ink, 1.5); }
    ctx.beginPath(); ctx.ellipse(1, -22, 25, 17, 0, Math.PI * 0.95, Math.PI * 2.05); ctx.quadraticCurveTo(1, -6, -24, -18); fillStroke(ctx, P.white, P.ink, 1.8);
    ctx.globalAlpha = 0.6; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(-20 + k * 9, -36); ctx.quadraticCurveTo(-12 + k * 9, -24, -18 + k * 12, -10); stroke(ctx, P.grey, 1.2); } ctx.globalAlpha = 1;
    if (o.plume) { ctx.beginPath(); ctx.moveTo(8, -36); ctx.quadraticCurveTo(22, -60, 14, -78); ctx.quadraticCurveTo(10, -58, 4, -38); fillStroke(ctx, o.plume, P.ink, 1.2); circle(ctx, 7, -36, 4, P.goldLight, P.ink, 1); }
  } else if (hat === 'fez') {
    poly(ctx, [[-14, -14], [-11, -40], [13, -40], [16, -14]], o.hatColor || P.verm, P.ink, 1.6);
    ctx.beginPath(); ctx.moveTo(0, -40); ctx.quadraticCurveTo(-10, -36, -16, -22); stroke(ctx, P.ink, 2);
  } else if (hat === 'cap') {
    ctx.beginPath(); ctx.ellipse(2, -12, 18, 14, 0, Math.PI, TAU); fillStroke(ctx, o.hatColor || P.ochre, P.ink, 1.6);
  } else if (hat === 'bandana') { // a 1940s factory head scarf, red with white dots, knotted on top
    const bc = o.hatColor || P.verm;
    ctx.beginPath(); ctx.moveTo(-17, -2); ctx.quadraticCurveTo(-22, -28, 2, -28); ctx.quadraticCurveTo(26, -28, 20, -2); ctx.quadraticCurveTo(4, -14, -17, -2); ctx.closePath(); fillStroke(ctx, bc, P.ink, 1.4);
    for (const [dx, dy] of [[-10, -16], [0, -22], [10, -15], [-2, -10], [14, -24], [-14, -24]]) circle(ctx, dx, dy, 2, P.white, null);
    ellipse(ctx, -4, -30, 7, 5, -0.5, bc, P.ink, 1.2); ellipse(ctx, 8, -31, 7, 5, 0.5, bc, P.ink, 1.2);
    ctx.beginPath(); ctx.moveTo(-17, -2); ctx.quadraticCurveTo(-20, 6, -14, 10); stroke(ctx, o.hair || '#4a2a1a', 4);
  } else if (hat === 'kepi') { // Civil War forage cap, tilted forward
    ctx.beginPath(); ctx.moveTo(-18, -12); ctx.lineTo(-14, -40); ctx.quadraticCurveTo(4, -46, 16, -34); ctx.lineTo(20, -12); ctx.closePath(); fillStroke(ctx, o.hatColor || '#2a3a6a', P.ink, 1.6);
    ctx.beginPath(); ctx.moveTo(4, -12); ctx.quadraticCurveTo(20, -12, 28, -6); stroke(ctx, P.ink, 4);
  } else if (hat === 'campaignhat') { // 1916 broad-brimmed campaign hat with a pinched crown
    ctx.beginPath(); ctx.ellipse(2, -14, 30, 7, 0, 0, TAU); fillStroke(ctx, o.hatColor || '#8a7a4a', P.ink, 1.6);
    ctx.beginPath(); ctx.moveTo(-14, -14); ctx.lineTo(-6, -42); ctx.lineTo(2, -36); ctx.lineTo(10, -42); ctx.lineTo(18, -14); ctx.closePath(); fillStroke(ctx, o.hatColor || '#8a7a4a', P.ink, 1.6);
  } else if (hat === 'helmet') { // WWII M1 helmet with a cloth cover
    ctx.beginPath(); ctx.moveTo(-24, -6); ctx.quadraticCurveTo(-26, -38, 2, -40); ctx.quadraticCurveTo(30, -38, 28, -6); ctx.closePath(); fillStroke(ctx, o.hatColor || '#5e6a44', P.ink, 1.6);
    ctx.beginPath(); ctx.moveTo(-26, -6); ctx.lineTo(30, -6); stroke(ctx, P.ink, 3);
    for (const [dx, dy] of [[-12, -24], [6, -30], [14, -16], [-4, -14]]) circle(ctx, dx, dy, 3, '#4a5434', null);
  } else if (hat === 'servicecap') { // 1914 British peaked service cap
    ctx.beginPath(); ctx.ellipse(2, -16, 20, 9, 0, 0, TAU); fillStroke(ctx, o.hatColor || '#7c6e44', P.ink, 1.6);
    ctx.beginPath(); ctx.moveTo(-18, -16); ctx.quadraticCurveTo(-14, -34, 4, -34); ctx.quadraticCurveTo(24, -34, 22, -16); ctx.closePath(); fillStroke(ctx, o.hatColor || '#7c6e44', P.ink, 1.6);
    ctx.beginPath(); ctx.moveTo(6, -12); ctx.quadraticCurveTo(22, -12, 28, -6); stroke(ctx, '#3a2a14', 4);
    circle(ctx, 4, -26, 3, P.goldLight, P.ink, 0.8);
  } else if (hat === 'pickelhaube') { // 1914 German spiked helmet in its grey cloth field cover
    ctx.beginPath(); ctx.moveTo(-20, -10); ctx.quadraticCurveTo(-22, -40, 2, -42); ctx.quadraticCurveTo(24, -40, 22, -10); ctx.closePath(); fillStroke(ctx, o.hatColor || '#8a8c78', P.ink, 1.6);
    ctx.beginPath(); ctx.moveTo(10, -10); ctx.lineTo(28, -6); stroke(ctx, P.ink, 3);
    poly(ctx, [[-2, -42], [6, -42], [2, -58]], o.hatColor || '#8a8c78', P.ink, 1.4);
  } else if (hat === 'zucchetto') { // a white skullcap
    ctx.beginPath(); ctx.moveTo(-14, -2); ctx.quadraticCurveTo(-20, -24, 0, -22); ctx.quadraticCurveTo(22, -24, 18, -2); ctx.quadraticCurveTo(10, -14, -4, -12); ctx.closePath(); fillStroke(ctx, o.hair || '#cfcfcf', P.ink, 1.2);
    ctx.beginPath(); ctx.ellipse(2, -18, 13, 7, 0, Math.PI, TAU); fillStroke(ctx, P.white, P.ink, 1.4);
  } else if (hat === 'hotoz') { // a lady's tall cap with a flowing veil
    ctx.beginPath(); ctx.moveTo(-14, -16); ctx.quadraticCurveTo(-40, 20, -30, 70); ctx.lineTo(-10, 60); ctx.quadraticCurveTo(-16, 20, -4, -6); ctx.closePath(); fillStroke(ctx, o.veil || P.white, P.ink, 1.3);
    ctx.beginPath(); ctx.ellipse(2, -14, 19, 11, 0, Math.PI, TAU); fillStroke(ctx, o.hair || '#3a2a20', P.ink, 1.2);
    for (const sx of [-15, 17]) { ctx.beginPath(); ctx.moveTo(sx, -8); ctx.quadraticCurveTo(sx + (sx < 0 ? -6 : 6), 4, sx, 14); stroke(ctx, o.hair || '#3a2a20', 4); }
    poly(ctx, [[-12, -20], [-8, -56], [12, -56], [16, -20]], o.hatColor || P.verm, P.ink, 1.5);
    ctx.beginPath(); ctx.moveTo(-8, -46); ctx.lineTo(12, -46); stroke(ctx, P.goldLight, 3);
    circle(ctx, 2, -60, 5, P.goldLight, P.ink, 1);
  } else if (hat === 'santa' || hat === 'furcap') { // Santa's stocking cap / Nast's early fur cap
    const red = hat === 'santa', cc = o.hatColor || (red ? P.verm : '#8a5a3a');
    ctx.beginPath(); ctx.moveTo(-20, -16); ctx.quadraticCurveTo(-6, red ? -70 : -44, red ? 26 : 16, red ? -52 : -34); ctx.quadraticCurveTo(14, -30, 22, -16); ctx.closePath(); fillStroke(ctx, cc, P.ink, 1.6);
    if (red) circle(ctx, 28, -50, 7, P.white, P.ink, 1.2);
    ctx.beginPath(); ctx.ellipse(1, -16, 23, 7, 0, 0, TAU); fillStroke(ctx, red ? P.white : '#c9b89a', P.ink, 1.4);
  } else if (hat === 'wildhair') { // no hat: a big untamed halo of hair
    const hc = o.hair || '#ececec', puffs = [[-18, -14, 11], [-10, -24, 12], [2, -28, 12], [14, -24, 12], [22, -12, 10], [-22, 2, 9], [24, 2, 9], [-20, 14, 7], [24, 14, 7]];
    ctx.lineWidth = 3.2; ctx.strokeStyle = P.ink; for (const [a, b, r] of puffs) { ctx.beginPath(); ctx.arc(a, b, r, 0, TAU); ctx.stroke(); }
    ctx.fillStyle = hc; for (const [a, b, r] of puffs) { ctx.beginPath(); ctx.arc(a, b, r, 0, TAU); ctx.fill(); }
    ellipse(ctx, 2, 0, 15, 19, 0, SKIN, P.ink, 1.8);
    for (const ex of [-3, 9]) { ctx.beginPath(); ctx.moveTo(ex - 4, -3); ctx.quadraticCurveTo(ex, -6, ex + 4, -3); ctx.quadraticCurveTo(ex, -1, ex - 4, -3); fillStroke(ctx, P.ink, P.ink, 0.8); ctx.beginPath(); ctx.moveTo(ex - 5, -8); ctx.quadraticCurveTo(ex, -11, ex + 5, -8); stroke(ctx, hc === '#ececec' ? '#9a9a9a' : P.ink, 1.8); }
    ctx.beginPath(); ctx.moveTo(4, -2); ctx.quadraticCurveTo(10, 6, 5, 7); stroke(ctx, P.ink, 1.1);
    if (o.mustache) { ctx.beginPath(); ctx.moveTo(-4, 9); ctx.quadraticCurveTo(4, 5, 12, 9); stroke(ctx, o.mustacheColor || hc, 4); }
  } else if (hat === 'shorthair') { // no hat: short swept hair
    ctx.beginPath(); ctx.moveTo(-15, -2); ctx.quadraticCurveTo(-20, -24, 0, -22); ctx.quadraticCurveTo(22, -24, 18, -2); ctx.quadraticCurveTo(10, -14, -4, -12); ctx.quadraticCurveTo(-10, -10, -15, -2); ctx.closePath(); fillStroke(ctx, o.hair || '#3a2a20', P.ink, 1.2);
  } else if (hat === 'longhair') { // no hat: long hair down to the shoulders
    const hc = o.hair || '#1a1a1a';
    ctx.beginPath(); ctx.moveTo(-16, -6); ctx.quadraticCurveTo(-26, 30, -20, 58); ctx.lineTo(-6, 52); ctx.quadraticCurveTo(-12, 20, -8, -4); ctx.closePath(); fillStroke(ctx, hc, P.ink, 1.2);
    ctx.beginPath(); ctx.moveTo(18, -4); ctx.quadraticCurveTo(26, 30, 22, 56); ctx.lineTo(12, 50); ctx.quadraticCurveTo(16, 20, 14, -2); ctx.closePath(); fillStroke(ctx, hc, P.ink, 1.2);
    ctx.beginPath(); ctx.ellipse(2, -10, 20, 14, 0, Math.PI, TAU); fillStroke(ctx, hc, P.ink, 1.2);
    if (o.eyePaint) for (const ex of [-3, 9]) { ctx.beginPath(); ctx.moveTo(ex, -12); ctx.lineTo(ex, 4); stroke(ctx, P.ink, 1.6); }
  } else if (hat === 'stovepipe') { // tall black top hat
    rect(ctx, -14, -62, 32, 46, P.ink, P.ink, 1.5); rect(ctx, -22, -18, 48, 6, P.ink, P.ink, 1.5);
    ctx.beginPath(); ctx.moveTo(-14, -26); ctx.lineTo(18, -26); stroke(ctx, '#5a4a3a', 3);
    ctx.beginPath(); ctx.ellipse(2, -10, 17, 8, 0, Math.PI, TAU); fillStroke(ctx, o.hair || '#2a1c12', P.ink, 1);
  } else if (hat === 'greekhelm') { // bronze Corinthian helmet, cheek guard and a horsehair crest
    const hc = o.hatColor || '#c08a3a';
    ctx.beginPath(); ctx.moveTo(-18, 10); ctx.quadraticCurveTo(-24, -30, 2, -32); ctx.quadraticCurveTo(26, -30, 20, -8); ctx.lineTo(16, -6); ctx.lineTo(14, 16); ctx.lineTo(6, 14); ctx.lineTo(8, -2); ctx.lineTo(-4, -6); ctx.lineTo(-8, 10); ctx.closePath(); fillStroke(ctx, hc, P.ink, 1.6);
    ctx.beginPath(); ctx.moveTo(-22, -26); ctx.quadraticCurveTo(-2, -64, 26, -24); ctx.quadraticCurveTo(0, -42, -22, -26); fillStroke(ctx, o.crest || P.verm, P.ink, 1.3);
    ctx.beginPath(); ctx.moveTo(-12, -18); ctx.quadraticCurveTo(4, -24, 16, -16); stroke(ctx, P.goldLight, 1.6);
  } else if (hat === 'tiara') { // Persian soft felt cap with flaps over the ears and chin
    const hc = o.hatColor || '#c9a227';
    ctx.beginPath(); ctx.moveTo(-18, 14); ctx.quadraticCurveTo(-26, -30, 0, -34); ctx.quadraticCurveTo(10, -26, 20, -14); ctx.lineTo(14, -10); ctx.quadraticCurveTo(0, -18, -8, -6); ctx.lineTo(-8, 16); ctx.closePath(); fillStroke(ctx, hc, P.ink, 1.5);
    ctx.beginPath(); ctx.moveTo(-14, -20); ctx.quadraticCurveTo(0, -26, 12, -16); stroke(ctx, P.ink, 0.8);
  } else if (hat === 'wreath') { // short hair with a laurel crown
    ctx.beginPath(); ctx.moveTo(-15, -2); ctx.quadraticCurveTo(-20, -24, 0, -22); ctx.quadraticCurveTo(22, -24, 18, -2); ctx.quadraticCurveTo(10, -14, -4, -12); ctx.quadraticCurveTo(-10, -10, -15, -2); ctx.closePath(); fillStroke(ctx, o.hair || '#3a2a20', P.ink, 1.2);
    for (let i = 0; i < 9; i++) { const a = Math.PI * (1.05 + i * 0.1); ellipse(ctx, 2 + Math.cos(a) * 19, -8 + Math.sin(a) * 15, 6, 3, a + 1.2, P.green, P.ink, 0.9); }
  } else if (hat === 'crown') {
    ctx.beginPath(); ctx.ellipse(1, -22, 25, 17, 0, Math.PI * 0.95, Math.PI * 2.05); ctx.quadraticCurveTo(1, -6, -24, -18); fillStroke(ctx, P.white, P.ink, 1.8);
    poly(ctx, [[-12, -34], [-8, -54], [0, -40], [6, -58], [12, -40], [18, -52], [16, -32]], P.goldLight, P.ink, 1.5);
  }
  ctx.restore();
}

// ---------- the invention ----------
export function bubble(ctx, x, y, r, a = 1, popped = 0) {
  if (popped >= 1) { // flattened ring + burst lines
    ctx.save(); ctx.globalAlpha *= a;
    ellipse(ctx, x, y + r * 0.3, r * 0.9, r * 0.35, 0, 'rgba(200,225,240,0.35)', 'rgba(60,90,120,0.7)', 1.5);
    ctx.restore(); return;
  }
  ctx.save(); ctx.globalAlpha *= a;
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r);
  g.addColorStop(0, 'rgba(255,255,255,0.85)'); g.addColorStop(0.35, 'rgba(210,232,245,0.45)'); g.addColorStop(1, 'rgba(150,190,215,0.55)');
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = g; ctx.fill();
  stroke(ctx, 'rgba(50,80,110,0.85)', Math.max(1, r * 0.08));
  ctx.beginPath(); ctx.arc(x, y, r * 0.72, Math.PI * 1.1, Math.PI * 1.45); stroke(ctx, 'rgba(255,255,255,0.95)', Math.max(1.2, r * 0.13));
  ctx.beginPath(); ctx.arc(x + r * 0.35, y + r * 0.4, r * 0.1, 0, TAU); ctx.fillStyle = P.goldLight; ctx.fill();
  ctx.restore();
}
// A sheet of bubble wrap. appear(i,j) → 0..1 for each bubble; popped(i,j) → bool.
export function bubbleSheet(ctx, x, y, w, h, r, o = {}) {
  ctx.save();
  ctx.beginPath(); ctx.rect(x, y, w, h);
  ctx.fillStyle = o.tint || 'rgba(215,235,245,0.45)'; ctx.fill(); stroke(ctx, 'rgba(50,80,110,0.8)', 2);
  const step = r * 2.3, rows = Math.floor((h - r) / (step * 0.87)), cols = Math.floor((w - r) / step);
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols - (j % 2 ? 1 : 0); i++) {
    const bx = x + r * 1.3 + i * step + (j % 2) * step / 2, by = y + r * 1.3 + j * step * 0.87;
    const a = o.appear ? o.appear(i, j) : 1;
    if (a <= 0) continue;
    bubble(ctx, bx, by, r * Math.min(1, a), 1, o.popped && o.popped(i, j) ? 1 : 0);
  }
  ctx.restore();
  return { rows, cols, step };
}
// Plastic shower curtain with tulip print, hanging from rings.
export function curtain(ctx, x, y, w, h, t = 0, color = 'rgba(120,190,200,0.55)', print = P.verm) {
  ctx.save();
  ctx.beginPath(); ctx.moveTo(x, y);
  const folds = 6;
  for (let i = 0; i <= folds; i++) ctx.lineTo(x + i * w / folds, y);
  ctx.lineTo(x + w + Math.sin(t * 2) * 6, y + h);
  for (let i = folds; i >= 0; i--) ctx.quadraticCurveTo(x + (i + 0.5) * w / folds + Math.sin(t * 2 + i) * 6, y + h + 12, x + i * w / folds + Math.sin(t * 2 + i) * 6, y + h);
  ctx.closePath(); ctx.fillStyle = color; ctx.fill(); stroke(ctx, P.ink, 2);
  ctx.clip();
  for (let i = 0; i < folds; i++) { ctx.beginPath(); ctx.moveTo(x + (i + 0.5) * w / folds, y); ctx.lineTo(x + (i + 0.5) * w / folds + Math.sin(t * 2 + i) * 5, y + h + 10); stroke(ctx, 'rgba(40,70,90,0.35)', 3); }
  for (let j = 0; j < 4; j++) for (let i = 0; i < 3; i++) tulip(ctx, x + (i + 0.5) * w / 3 + (j % 2) * 20, y + 90 + j * h / 4.2, 0.55, print);
  ctx.restore();
  for (let i = 0; i <= folds; i++) circle(ctx, x + i * w / folds, y - 4, 7, null, P.goldDark, 3);
}
// The IBM 1401 data processing system, as a miniaturist might have painted it.
export function ibm1401(ctx, x, y, s = 1, t = 0, crack = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  // tape drive (729)
  rect(ctx, -230, -260, 120, 260, P.steel, P.ink, 2.5);
  rect(ctx, -222, -250, 104, 150, '#cfd8e2', P.ink, 1.5);
  for (const [cx, cy, dir] of [[-196, -205, 1], [-144, -205, -1]]) {
    circle(ctx, cx, cy, 22, P.ink, P.ink, 1); circle(ctx, cx, cy, 19, '#3c4250', P.ink, 1);
    for (let k = 0; k < 3; k++) { const a = t * 3 * dir + k * TAU / 3; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * 17, cy + Math.sin(a) * 17); stroke(ctx, P.grey, 3); }
    circle(ctx, cx, cy, 4, P.goldLight, P.ink, 1);
  }
  rect(ctx, -222, -90, 104, 70, P.lapis, P.ink, 1.5);
  // processing unit (1401) with blinking console
  rect(ctx, -100, -210, 200, 210, P.steel, P.ink, 2.5);
  rect(ctx, -90, -200, 180, 90, '#253046', P.ink, 1.5);
  const R = rng(5);
  for (let j = 0; j < 5; j++) for (let i = 0; i < 10; i++) {
    const on = Math.sin(t * (6 + R() * 8) + i * 1.3 + j) > 0.2;
    circle(ctx, -78 + i * 17, -186 + j * 16, 4.2, on ? [P.goldLight, P.verm, '#7fe07a'][(i + j) % 3] : '#4a5468', null);
  }
  rect(ctx, -90, -95, 180, 80, '#a9b7c8', P.ink, 1.5);
  ctx.fillStyle = P.ink; ctx.font = '700 30px Deco'; ctx.textAlign = 'center'; ctx.fillText('IBM', 0, -42);
  ctx.font = '700 18px Fell'; ctx.fillText('1401', 0, -22);
  // card reader + printer (1402/1403)
  rect(ctx, 110, -150, 130, 150, P.steel, P.ink, 2.5);
  rect(ctx, 122, -140, 106, 40, '#cfd8e2', P.ink, 1.5);
  for (let k = 0; k < 5; k++) rect(ctx, 130 + k * 4, -134 - k * 2, 60, 26, P.paperLight, P.ink, 1);
  // printed paper ribbon
  ctx.beginPath(); ctx.moveTo(160, -100); ctx.quadraticCurveTo(200 + Math.sin(t * 2) * 6, -60, 175, -8); stroke(ctx, P.paperLight, 10);
  // gold trims
  for (const [a, b] of [[-230, 120], [-100, 200], [110, 130]]) { ctx.beginPath(); ctx.moveTo(a, -4); ctx.lineTo(a + b, -4); stroke(ctx, P.goldLight, 4); }
  if (crack > 0) cracks(ctx, crack, 9, 3.2 / s);
  ctx.restore();
}
export function cracks(ctx, k, seed = 9, lw = 3) {
  const R = rng(seed);
  ctx.save(); ctx.strokeStyle = P.ink; ctx.lineWidth = lw; ctx.lineJoin = 'miter';
  const n = Math.ceil(6 * clamp(k));
  for (let c = 0; c < n; c++) {
    let x = -200 + R() * 420, y = -220 + R() * 180; const len = 9 * clamp(k * 1.5 - c * 0.12);
    ctx.beginPath(); ctx.moveTo(x, y);
    for (let i = 0; i < len; i++) { x += (R() - 0.5) * 34; y += 10 + R() * 14; ctx.lineTo(x, y); }
    ctx.stroke();
  }
  ctx.restore();
}
export function parcel(ctx, x, y, w, h, wrapped = 1, color = P.ochre, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  rect(ctx, -w / 2, -h / 2, w, h, color, P.ink, 2);
  ctx.beginPath(); ctx.moveTo(0, -h / 2); ctx.lineTo(0, h / 2); ctx.moveTo(-w / 2, 0); ctx.lineTo(w / 2, 0); stroke(ctx, P.vermDark, 3);
  if (wrapped > 0) {
    ctx.globalAlpha *= clamp(wrapped);
    ctx.beginPath(); ctx.rect(-w / 2 - 5, -h / 2 - 5, w + 10, h + 10); ctx.fillStyle = 'rgba(215,235,245,0.4)'; ctx.fill(); stroke(ctx, 'rgba(50,80,110,0.8)', 1.5);
    ctx.fillStyle = pattern(ctx, 'bubbles', 'rgba(0,0,0,0)', 'rgba(180,215,235,0.65)', 14);
    ctx.fillRect(-w / 2 - 5, -h / 2 - 5, w + 10, h + 10);
  }
  ctx.restore();
}

// ---------- calligraphy, seals, cartouches ----------
// Lobed cartouche (the shape that holds inscriptions in manuscripts).
export function cartouche(ctx, cx, cy, w, h, fill = P.paperLight, line = P.goldDark, lw = 3) {
  const r = h / 2;
  ctx.beginPath();
  ctx.moveTo(cx - w / 2 + r, cy - r);
  ctx.lineTo(cx + w / 2 - r, cy - r);
  ctx.bezierCurveTo(cx + w / 2 - r * 0.3, cy - r, cx + w / 2 - r * 0.6, cy - r * 0.2, cx + w / 2, cy);
  ctx.bezierCurveTo(cx + w / 2 - r * 0.6, cy + r * 0.2, cx + w / 2 - r * 0.3, cy + r, cx + w / 2 - r, cy + r);
  ctx.lineTo(cx - w / 2 + r, cy + r);
  ctx.bezierCurveTo(cx - w / 2 + r * 0.3, cy + r, cx - w / 2 + r * 0.6, cy + r * 0.2, cx - w / 2, cy);
  ctx.bezierCurveTo(cx - w / 2 + r * 0.6, cy - r * 0.2, cx - w / 2 + r * 0.3, cy - r, cx - w / 2 + r, cy - r);
  ctx.closePath();
  fillStroke(ctx, fill, line, lw);
}
// Inscription label above a figure's head.
export function label(ctx, text, cx, cy, size = 22, a = 1, fill = P.paperLight) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp(a); ctx.translate(cx, cy); ctx.scale(lerp(0.6, 1, ease.outBack(clamp(a))), lerp(0.6, 1, ease.outBack(clamp(a))));
  ctx.font = `700 ${size}px Fell`; const w = ctx.measureText(text).width + size * 2.2;
  cartouche(ctx, 0, 0, w, size * 1.7, fill, P.goldDark, 2.5);
  ctx.fillStyle = P.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 0, 2);
  ctx.restore();
}
// Round seal (mühür) with ring text; `k` is the stamp progress 0..1.
export function seal(ctx, x, y, r, text, inner, k = 1, color = P.verm) {
  if (k <= 0) return;
  const sc = lerp(2.4, 1, ease.outCubic(clamp(k * 1.6))), a = clamp(k * 3);
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ctx.globalAlpha *= a; ctx.rotate(-0.12);
  circle(ctx, 0, 0, r, color, shade(color, -0.3), 3);
  circle(ctx, 0, 0, r * 0.78, null, P.paperLight, 2.5);
  circle(ctx, 0, 0, r * 0.92, null, P.paperLight, 1.5);
  ctx.fillStyle = P.paperLight; ctx.font = `700 ${Math.round(r * 0.17)}px Fell`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const chars = text.split(''), step = TAU / chars.length;
  chars.forEach((ch, i) => { ctx.save(); ctx.rotate(i * step); ctx.translate(0, -r * 0.85); ctx.fillText(ch, 0, 0); ctx.restore(); });
  ctx.font = `900 ${Math.round(r * 0.3)}px Deco`;
  const lines = inner.split('\n');
  lines.forEach((ln, i) => ctx.fillText(ln, 0, (i - (lines.length - 1) / 2) * r * 0.36));
  ctx.restore();
}
// Progressive stroke reveal (calligraphy being written). build() makes the path.
export function writeStroke(ctx, build, k, len, color, lw) {
  if (k <= 0) return;
  ctx.save(); ctx.setLineDash([len, len]); ctx.lineDashOffset = len * (1 - clamp(k));
  ctx.beginPath(); build(ctx); stroke(ctx, color, lw); ctx.restore();
}

// Rubber-stamp text (e.g. FRAGILE) slammed onto the picture.
export function stamp(ctx, text, x, y, size, k, rot = -0.18, color = P.verm) {
  if (k <= 0) return;
  const sc = lerp(2.2, 1, ease.outCubic(clamp(k * 1.5)));
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(k * 3);
  ctx.font = `900 ${size}px Deco`; const w = ctx.measureText(text).width + size;
  ctx.strokeStyle = color; ctx.lineWidth = size * 0.09; ctx.strokeRect(-w / 2, -size * 0.75, w, size * 1.5);
  ctx.lineWidth = size * 0.03; ctx.strokeRect(-w / 2 + size * 0.15, -size * 0.6, w - size * 0.3, size * 1.2);
  ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 0, size * 0.05);
  ctx.restore();
}

// ---------- desk & study props ----------
// A square sticky note. curl 0..1 lifts the bottom-right corner; text optional.
export function stickyNote(ctx, x, y, size, rot = 0, curl = 0, color = '#f4d63e', text = null) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  const h = size / 2, c = size * 0.45 * clamp(curl);
  ctx.beginPath(); ctx.moveTo(-h, -h); ctx.lineTo(h, -h); ctx.lineTo(h, h - c); ctx.lineTo(h - c, h); ctx.lineTo(-h, h); ctx.closePath();
  fillStroke(ctx, color, P.ink, Math.max(1.2, size * 0.025));
  ctx.fillStyle = 'rgba(160,120,0,0.25)'; ctx.fillRect(-h + 1, -h + 1, size - 2, size * 0.12); // the gummed strip
  if (c > 1) { ctx.beginPath(); ctx.moveTo(h, h - c); ctx.quadraticCurveTo(h - c * 0.15, h - c * 0.15, h - c, h); ctx.lineTo(h - c * 0.75, h - c * 0.75); ctx.closePath(); fillStroke(ctx, shade(color, -0.15), P.ink, 1.2); }
  if (text) {
    ctx.fillStyle = P.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const lines = text.split('\n'); let fs = size * 0.2; ctx.font = `700 ${fs}px Garamond`;
    lines.forEach((ln, i) => ctx.fillText(ln, 0, (i - (lines.length - 1) / 2) * fs * 1.1 + size * 0.04));
  }
  ctx.restore();
}
// A pad of notes (stack), e.g. for a market stall.
export function notePad(ctx, x, y, size, n = 6, color = '#f4d63e') {
  for (let i = n - 1; i >= 0; i--) rect(ctx, x - size / 2 + i * 1.5, y - size / 2 + i * 3, size, size, i ? shade(color, -0.12) : color, P.ink, 1.3);
}
// Open book seen from above (hymn book / ledger). page: lines drawn on pages.
export function openBook(ctx, x, y, w, h, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0);
  rect(ctx, -w / 2 - 8, -h / 2 - 6, w + 16, h + 14, o.cover || P.vermDark, P.ink, 2);
  for (const sgn of [-1, 1]) {
    ctx.beginPath(); ctx.moveTo(0, -h / 2); ctx.quadraticCurveTo(sgn * w * 0.25, -h / 2 - 10, sgn * w / 2, -h / 2 + 2); ctx.lineTo(sgn * w / 2, h / 2); ctx.quadraticCurveTo(sgn * w * 0.25, h / 2 - 10, 0, h / 2); ctx.closePath();
    fillStroke(ctx, P.paperLight, P.ink, 1.6);
    ctx.save(); ctx.globalAlpha = 0.45;
    for (let k = 1; k < 7; k++) { ctx.beginPath(); ctx.moveTo(sgn * w * 0.08, -h / 2 + k * h / 7.5); ctx.lineTo(sgn * w * 0.44, -h / 2 + k * h / 7.5); stroke(ctx, P.ink, 1.2); }
    ctx.restore();
    if (o.notes) for (let k = 0; k < 2; k++) musicNote(ctx, sgn * w * 0.26, -h * 0.25 + k * h * 0.35, h * 0.12, P.ink);
  }
  ctx.beginPath(); ctx.moveTo(0, -h / 2); ctx.lineTo(0, h / 2); stroke(ctx, P.ink, 2);
  ctx.restore();
}
export function musicNote(ctx, x, y, s, color = P.goldDark) {
  ctx.save(); ctx.translate(x, y);
  ctx.beginPath(); ctx.ellipse(0, 0, s * 0.42, s * 0.3, -0.4, 0, TAU); ctx.fillStyle = color; ctx.fill();
  ctx.beginPath(); ctx.moveTo(s * 0.38, -s * 0.05); ctx.lineTo(s * 0.38, -s * 1.3); ctx.quadraticCurveTo(s * 0.9, -s, s * 0.8, -s * 0.5); stroke(ctx, color, Math.max(1.5, s * 0.12));
  ctx.restore();
}
// Alchemist's alembic (imbik) on a brazier; bubbling 0..1, glow colour.
export function alembic(ctx, x, y, s = 1, t = 0, bubbling = 1, liquid = P.goldLight) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rect(ctx, -60, -30, 120, 30, P.brown, P.ink, 2);
  for (let i = 0; i < 4; i++) { const f = 1 + 0.2 * Math.sin(t * 12 + i * 2); ctx.beginPath(); ctx.moveTo(-40 + i * 26, -30); ctx.quadraticCurveTo(-48 + i * 26, -46 * f, -40 + i * 26, -58 * f); ctx.quadraticCurveTo(-32 + i * 26, -46 * f, -28 + i * 26, -30); fillStroke(ctx, i % 2 ? P.verm : P.ochre, P.ink, 1); }
  circle(ctx, 0, -110, 58, 'rgba(210,235,240,0.55)', P.ink, 2.5);
  ctx.save(); ctx.beginPath(); ctx.arc(0, -110, 56, 0, TAU); ctx.clip(); ctx.fillStyle = liquid; ctx.fillRect(-60, -105, 120, 70);
  for (let i = 0; i < 6; i++) { const k = (t * 1.5 * bubbling + i / 6) % 1; circle(ctx, -30 + i * 12, -60 - k * 50, 4 + (i % 3), 'rgba(255,255,255,0.7)', null); }
  ctx.restore();
  ctx.beginPath(); ctx.moveTo(-14, -164); ctx.lineTo(-14, -200); ctx.quadraticCurveTo(0, -230, 30, -210); ctx.lineTo(120, -150); ctx.lineTo(112, -140); ctx.lineTo(28, -196); ctx.quadraticCurveTo(14, -204, 14, -196); ctx.lineTo(14, -164); ctx.closePath();
  fillStroke(ctx, 'rgba(210,235,240,0.7)', P.ink, 2);
  ctx.restore();
}
// Glazed İznik jar labelled like a pharmacy pot.
export function jar(ctx, x, y, s = 1, labelText = 'GLUE', rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-40, -150); ctx.lineTo(40, -150); ctx.quadraticCurveTo(40, -120, 70, -95); ctx.bezierCurveTo(100, -40, 80, 0, 50, 0); ctx.lineTo(-50, 0); ctx.bezierCurveTo(-80, 0, -100, -40, -70, -95); ctx.quadraticCurveTo(-40, -120, -40, -150); ctx.closePath();
  fillStroke(ctx, P.white, P.ink, 2.5);
  ctx.save(); ctx.clip(); ctx.fillStyle = pattern(ctx, 'tiles', P.white, P.lapisLight, 34); ctx.fillRect(-100, -150, 200, 60); ctx.fillRect(-100, -35, 200, 40); ctx.restore();
  rect(ctx, -46, -162, 92, 14, P.lapis, P.ink, 2);
  if (labelText) { cartouche(ctx, 0, -62, 120, 44, P.paperLight, P.goldDark, 2); ctx.fillStyle = P.verm; ctx.font = '900 22px Deco'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(labelText, 0, -60); }
  ctx.restore();
}
// Low writing desk (rahle) for scribes.
export function rahle(ctx, x, y, w = 160, color = P.brownLight) {
  ctx.save(); ctx.translate(x, y);
  poly(ctx, [[-w / 2, -60], [w / 2, -80], [w / 2, -66], [-w / 2, -46]], color, P.ink, 2);
  for (const sx of [-w * 0.35, w * 0.35]) { ctx.beginPath(); ctx.moveTo(sx, -55); ctx.lineTo(sx - 18, 0); ctx.moveTo(sx, -55); ctx.lineTo(sx + 18, 0); stroke(ctx, P.brown, 5); }
  ctx.restore();
}

// ---------- water, bath & toys ----------
// Hammam (Turkish bath) interior: marble walls, a dome with star-shaped
// skylights, and a marble basin (kurna) with a brass tap. Returns tap position.
export function hammam(ctx, W, H, t = 0) {
  ctx.fillStyle = '#e9e4da'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = pattern(ctx, 'scales', '#e9e4da', '#d6cfc2', 46); ctx.fillRect(0, 0, W, H);
  // the dome, seen from below: dark plaster pierced by glowing star skylights (fil gözü)
  ctx.save(); ctx.beginPath(); ctx.moveTo(-10, 330); ctx.lineTo(-10, 300); ctx.quadraticCurveTo(W / 2, -160, W + 10, 300); ctx.lineTo(W + 10, 330); ctx.closePath();
  const dg = ctx.createRadialGradient(W / 2, 120, 40, W / 2, 200, W * 0.7); dg.addColorStop(0, '#6f7f96'); dg.addColorStop(1, '#3b4a63');
  ctx.fillStyle = dg; ctx.fill(); ctx.clip();
  const R = rng(4);
  for (let j = 0; j < 3; j++) for (let i = 0; i < 9 - j * 2; i++) {
    const x = W / 2 + (i - (8 - j * 2) / 2) * (88 - j * 6), y = 270 - j * 75 - Math.cos((i - (8 - j * 2) / 2) / 5) * 40 + 40;
    star(ctx, x, y, 15 - j * 2, 0.85 + 0.15 * Math.sin(t * 2 + i + j));
  }
  ctx.restore();
  ctx.beginPath(); ctx.moveTo(-10, 300); ctx.quadraticCurveTo(W / 2, -160, W + 10, 300); stroke(ctx, P.goldLight, 6);
  rect(ctx, -10, 318, W + 20, 16, P.goldDark, P.ink, 1.5);
  // light beams falling from the skylights
  ctx.save();
  for (let i = 0; i < 6; i++) { const x = 170 + i * 130; ctx.globalAlpha = 0.1 + 0.05 * Math.sin(t * 1.5 + i); ctx.fillStyle = '#fff8dc'; ctx.beginPath(); ctx.moveTo(x - 10, 330); ctx.lineTo(x + 10, 330); ctx.lineTo(x + 70 + R() * 30, H); ctx.lineTo(x - 10 + R() * 30, H); ctx.closePath(); ctx.fill(); }
  ctx.restore();
  // arcade of niches + marble floor
  for (let i = 0; i < 4; i++) arch(ctx, 120 + i * 235, 640, 150, 280, '#cfc6b6');
  ctx.fillStyle = '#d4ccbc'; ctx.fillRect(0, 760, W, H - 760);
  ctx.strokeStyle = 'rgba(120,110,95,0.5)'; ctx.lineWidth = 2;
  for (let x = -200; x < W + 200; x += 90) { ctx.beginPath(); ctx.moveTo(x, 760); ctx.lineTo(x + 140, H); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x + 140, 760); ctx.lineTo(x, H); ctx.stroke(); }
}
export function kurna(ctx, x, y, s = 1) { // marble basin with a brass tap; returns the tap's mouth
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rect(ctx, -70, -200, 140, 90, '#ece7dd', P.ink, 2);
  ctx.beginPath(); ctx.moveTo(-90, -110); ctx.lineTo(90, -110); ctx.quadraticCurveTo(85, 0, 0, 0); ctx.quadraticCurveTo(-85, 0, -90, -110); ctx.closePath(); fillStroke(ctx, '#f1ede4', P.ink, 2.5);
  ctx.beginPath(); ctx.ellipse(0, -110, 90, 14, 0, 0, TAU); fillStroke(ctx, '#bcd6df', P.ink, 2);
  rect(ctx, -8, -190, 16, 40, P.goldDark, P.ink, 1.5);
  ctx.beginPath(); ctx.moveTo(0, -165); ctx.quadraticCurveTo(36, -170, 40, -140); stroke(ctx, P.ink, 12); stroke(ctx, P.gold, 8);
  ctx.restore();
  return [x + 40 * s, y - 138 * s];
}
// A stream of water from (x0,y0) curving through (cx,cy) to (x1,y1); k = how far it has travelled.
export function waterStream(ctx, x0, y0, cx, cy, x1, y1, k, t = 0, w = 16) {
  if (k <= 0) return;
  const pts = [], n = 40;
  for (let i = 0; i <= n * clamp(k); i++) { const q = i / n; pts.push([(1 - q) * (1 - q) * x0 + 2 * (1 - q) * q * cx + q * q * x1, (1 - q) * (1 - q) * y0 + 2 * (1 - q) * q * cy + q * q * y1]); }
  if (pts.length < 2) return;
  const path = () => { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (const p of pts) ctx.lineTo(p[0], p[1]); };
  path(); stroke(ctx, P.ink, w + 4); path(); stroke(ctx, '#5fb6d8', w); path();
  ctx.save(); ctx.setLineDash([22, 30]); ctx.lineDashOffset = -t * 700; stroke(ctx, 'rgba(255,255,255,0.85)', w * 0.35); ctx.restore();
  const R = rng(13), [ex, ey] = pts[pts.length - 1];
  for (let i = 0; i < 14; i++) { const a = R() * TAU, r = 10 + ((t * 120 + R() * 60) % 60); circle(ctx, ex + Math.cos(a) * r, ey + Math.sin(a) * r * 0.7, 3 + R() * 4, '#9fd3e8', P.ink, 1); }
}
// Pump-action water gun (the toy), facing right. colours: body, tank.
export function waterGun(ctx, x, y, s = 1, rot = 0, body = P.turq, tank = P.ochre) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  // tank on top
  ctx.beginPath(); ctx.ellipse(-20, -58, 70, 30, 0, 0, TAU); fillStroke(ctx, tank, P.ink, 2.5);
  ctx.beginPath(); ctx.ellipse(-40, -66, 22, 8, -0.2, 0, TAU); ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fill();
  rect(ctx, -30, -94, 20, 10, P.verm, P.ink, 1.5);
  // body + barrel + nozzle
  ctx.beginPath(); ctx.moveTo(-110, -30); ctx.lineTo(120, -30); ctx.lineTo(130, -14); ctx.lineTo(120, 4); ctx.lineTo(-90, 4); ctx.lineTo(-120, -10); ctx.closePath(); fillStroke(ctx, body, P.ink, 2.5);
  rect(ctx, 128, -20, 22, 14, P.verm, P.ink, 2);
  // pump handle under the barrel
  rect(ctx, 30, 6, 80, 22, P.verm, P.ink, 2);
  // grip + trigger
  ctx.beginPath(); ctx.moveTo(-90, 4); ctx.lineTo(-60, 4); ctx.lineTo(-74, 70); ctx.lineTo(-108, 66); ctx.closePath(); fillStroke(ctx, body, P.ink, 2.5);
  ctx.beginPath(); ctx.moveTo(-50, 4); ctx.quadraticCurveTo(-38, 26, -54, 34); stroke(ctx, P.ink, 4);
  for (let i = 0; i < 4; i++) circle(ctx, -60 + i * 40, -14, 4, P.goldLight, P.ink, 1);
  ctx.restore();
}
// A rocket of the kind Ottoman chronicles say Lagâri Hasan Çelebi rode in 1633.
export function rocket(ctx, x, y, s = 1, rot = 0, t = 0, fire = 1) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  if (fire > 0) for (let i = 0; i < 3; i++) { const f = (1 + 0.25 * Math.sin(t * 30 + i * 2)) * fire; ctx.beginPath(); ctx.moveTo(-18 + i * 6, 70); ctx.quadraticCurveTo(-10 + i * 10, 70 + 90 * f, 0, 70 + 150 * f - i * 30); ctx.quadraticCurveTo(10 - i * 2, 80 + 60 * f, 18 - i * 6, 70); fillStroke(ctx, [P.verm, P.ochre, P.goldLight][i], P.ink, 1.2); }
  rect(ctx, -24, -60, 48, 130, P.verm, P.ink, 2.5);
  ctx.fillStyle = pattern(ctx, 'cintamani', P.verm, P.goldLight, 22); ctx.fillRect(-22, -58, 44, 126);
  ctx.beginPath(); ctx.moveTo(-24, -60); ctx.quadraticCurveTo(-20, -110, 0, -140); ctx.quadraticCurveTo(20, -110, 24, -60); ctx.closePath(); fillStroke(ctx, P.goldLight, P.ink, 2.5);
  for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sx * 24, 30); ctx.lineTo(sx * 52, 80); ctx.lineTo(sx * 24, 66); ctx.closePath(); fillStroke(ctx, P.lapis, P.ink, 2); }
  ctx.restore();
}

// ---------- cards, toys & far-off places ----------
// Five-storey pagoda (Kyoto), drawn with the miniaturist's flat elevations.
export function pagoda(ctx, x, base, s = 1, t = 0) {
  ctx.save(); ctx.translate(x, base); ctx.scale(s, s);
  let y = 0;
  for (let i = 0; i < 5; i++) {
    const w = 150 - i * 20, h = 46 - i * 2;
    rect(ctx, -w / 2 + 12, y - h, w - 24, h, i % 2 ? P.verm : P.vermDark, P.ink, 2);
    for (let k = 0; k < 3; k++) rect(ctx, -w / 2 + 22 + k * (w - 44) / 3 + 4, y - h + 10, (w - 44) / 3 - 8, h - 18, P.ochreLight, P.ink, 1);
    y -= h;
    ctx.beginPath(); ctx.moveTo(-w / 2 - 22, y + 6); ctx.quadraticCurveTo(-w / 4, y - 4, 0, y - 22); ctx.quadraticCurveTo(w / 4, y - 4, w / 2 + 22, y + 6); ctx.quadraticCurveTo(0, y - 2, -w / 2 - 22, y + 6); fillStroke(ctx, P.ink, P.ink, 1);
    ctx.beginPath(); ctx.moveTo(-w / 2 - 22, y + 6); ctx.quadraticCurveTo(0, y - 2, w / 2 + 22, y + 6); stroke(ctx, P.goldLight, 2.5);
    y -= 10;
  }
  ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(0, y - 70); stroke(ctx, P.goldDark, 5);
  for (let k = 0; k < 5; k++) circle(ctx, 0, y - 14 - k * 11, 6, P.goldLight, P.goldDeep, 1);
  ctx.restore();
}
// An illuminated flower card (hanafuda). motif: 'tulip'|'blossom'|'moon'|'carnation'|'crane'.
export function flowerCard(ctx, x, y, w, rot = 0, motif = 'blossom', back = false) {
  const h = w * 1.6;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  rect(ctx, -w / 2, -h / 2, w, h, back ? P.vermDark : P.paperLight, P.ink, Math.max(1.2, w * 0.03));
  if (back) { ctx.fillStyle = pattern(ctx, 'cintamani', P.vermDark, P.goldLight, Math.max(8, w * 0.3)); ctx.fillRect(-w / 2 + 3, -h / 2 + 3, w - 6, h - 6); ctx.restore(); return; }
  ctx.save(); ctx.beginPath(); ctx.rect(-w / 2 + w * 0.08, -h / 2 + w * 0.08, w * 0.84, h - w * 0.16); ctx.clip();
  const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2); g.addColorStop(0, motif === 'moon' ? P.lapisDeep : P.goldLight); g.addColorStop(1, motif === 'moon' ? P.lapis : P.ochre);
  ctx.fillStyle = g; ctx.fillRect(-w / 2, -h / 2, w, h);
  const s = w / 100;
  if (motif === 'tulip') { tulip(ctx, 0, h * 0.42, 1.5 * s, P.verm); tulip(ctx, -26 * s, h * 0.45, 1.1 * s, P.verm); }
  else if (motif === 'carnation') { carnation(ctx, 0, h * 0.4, 1.7 * s, P.verm); carnation(ctx, 28 * s, h * 0.44, 1.2 * s, P.lapisLight); }
  else if (motif === 'moon') { circle(ctx, 0, -h * 0.12, 30 * s, P.white, P.ink, 1.5); spongy(ctx, 0, h / 2, w * 1.2, h * 0.45, P.verm, 2); }
  else if (motif === 'crane') { ctx.beginPath(); ctx.moveTo(-30 * s, 20 * s); ctx.quadraticCurveTo(0, -40 * s, 34 * s, -10 * s); ctx.quadraticCurveTo(0, 0, -30 * s, 20 * s); fillStroke(ctx, P.white, P.ink, 1.5); circle(ctx, 34 * s, -14 * s, 6 * s, P.verm, P.ink, 1); circle(ctx, -10 * s, -h * 0.3, 26 * s, P.verm, null); }
  else { for (let i = 0; i < 9; i++) flower(ctx, -30 * s + (i % 3) * 30 * s, -h * 0.3 + Math.floor(i / 3) * 40 * s, 9 * s, i % 2 ? P.pink : P.white); ctx.beginPath(); ctx.moveTo(-w / 2, h * 0.2); ctx.quadraticCurveTo(0, 0, w / 2, h * 0.1); stroke(ctx, P.brown, 6 * s); }
  ctx.restore();
  ctx.strokeStyle = P.goldDark; ctx.lineWidth = Math.max(1, w * 0.025); ctx.strokeRect(-w / 2 + w * 0.08, -h / 2 + w * 0.08, w * 0.84, h - w * 0.16);
  ctx.restore();
}
// Little taxi car; wheel turns with t.
export function car(ctx, x, y, s = 1, t = 0, color = P.ochre, text = 'TAXI', wheelOff = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-110, -20); ctx.lineTo(-100, -50); ctx.lineTo(-50, -54); ctx.lineTo(-30, -96); ctx.lineTo(50, -96); ctx.lineTo(74, -54); ctx.lineTo(110, -48); ctx.lineTo(118, -20); ctx.closePath(); fillStroke(ctx, color, P.ink, 2.5);
  for (const [a, b] of [[-24, 4], [10, 44]]) poly(ctx, [[a, -88], [b, -88], [b + (b > 0 ? 16 : 0), -58], [a - 8, -58]], '#bcd6df', P.ink, 1.5);
  if (text) { rect(ctx, -24, -116, 48, 20, P.white, P.ink, 1.5); ctx.fillStyle = P.verm; ctx.font = '900 13px Fell'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 0, -105); }
  for (const [wx, off] of [[-66, 0], [70, wheelOff]]) {
    ctx.save(); ctx.translate(wx + off * 3, -16 + off * 0.5); ctx.rotate(t * 8 + off); circle(ctx, 0, 0, 22, P.ink, P.ink, 1); circle(ctx, 0, 0, 11, P.grey, P.ink, 1);
    ctx.beginPath(); ctx.moveTo(-11, 0); ctx.lineTo(11, 0); ctx.moveTo(0, -11); ctx.lineTo(0, 11); stroke(ctx, P.ink, 1.5); ctx.restore();
  }
  ctx.restore();
}
// İznik bowl, filled (rice) with optional steam.
export function bowl(ctx, x, y, s = 1, t = 0, fill = P.white, steam = true) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.ellipse(0, -60, 110, 26, 0, Math.PI, TAU); fillStroke(ctx, fill, P.ink, 2);
  for (let i = 0; i < 18; i++) ellipse(ctx, -80 + (i % 9) * 20, -70 - Math.floor(i / 9) * 10 + (i % 2) * 4, 7, 4, (i % 3) * 0.5, fill, 'rgba(42,28,18,0.4)', 0.8);
  ctx.beginPath(); ctx.moveTo(-110, -60); ctx.quadraticCurveTo(-100, 10, 0, 14); ctx.quadraticCurveTo(100, 10, 110, -60); ctx.closePath(); fillStroke(ctx, P.white, P.ink, 2.5);
  ctx.save(); ctx.clip(); ctx.fillStyle = pattern(ctx, 'tiles', P.white, P.lapisLight, 34); ctx.fillRect(-120, -40, 240, 60); ctx.restore();
  rect(ctx, -40, 12, 80, 12, P.lapis, P.ink, 1.5);
  if (steam) for (let i = 0; i < 3; i++) { const q = (t * 0.6 + i / 3) % 1; ctx.save(); ctx.globalAlpha = 1 - q; ctx.beginPath(); ctx.moveTo(-40 + i * 40, -90 - q * 60); ctx.bezierCurveTo(-60 + i * 40, -120 - q * 60, -20 + i * 40, -140 - q * 60, -40 + i * 40, -170 - q * 60); stroke(ctx, P.white, 5); ctx.restore(); }
  ctx.restore();
}
// Treasure chest; open 0..1, coins = how full.
export function chest(ctx, x, y, s = 1, open = 1, coins = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rect(ctx, -110, -90, 220, 90, P.brownLight, P.ink, 2.5);
  for (const bx of [-80, 0, 80]) rect(ctx, bx - 8, -90, 16, 90, P.goldDark, P.ink, 1.5);
  if (coins > 0) for (let i = 0; i < Math.floor(24 * coins); i++) ellipse(ctx, -90 + (i * 37) % 180, -90 - (i % 4) * 8 - Math.floor(i / 8) * 6, 12, 6, 0, P.goldLight, P.goldDeep, 1);
  ctx.save(); ctx.translate(0, -90); ctx.scale(1, Math.cos(open * 1.9));
  ctx.beginPath(); ctx.moveTo(-110, 0); ctx.quadraticCurveTo(-110, -60, 0, -60); ctx.quadraticCurveTo(110, -60, 110, 0); ctx.closePath(); fillStroke(ctx, open > 0.5 ? shade(P.brownLight, -0.25) : P.brownLight, P.ink, 2.5);
  ctx.restore();
  rect(ctx, -14, -80, 28, 28, P.goldLight, P.ink, 1.5);
  ctx.restore();
}
// The extending "lazy tongs" arm (Ultra Hand). ext 0..1 stretches it; grip 0..1 closes the claws.
export function ultraHand(ctx, x, y, s = 1, rot = 0, ext = 0.5, grip = 0, color = P.ochre) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  const n = 5, L = 70, th = lerp(1.15, 0.25, clamp(ext)), dx = L * Math.cos(th), dy = L * Math.sin(th) / 2;
  // handles (scissor grips)
  ctx.beginPath(); ctx.moveTo(0, -dy); ctx.lineTo(-60, -dy - 30); ctx.moveTo(0, dy); ctx.lineTo(-60, dy + 30); stroke(ctx, P.ink, 14); stroke(ctx, P.verm, 10);
  circle(ctx, -66, -dy - 34, 14, null, P.verm, 6); circle(ctx, -66, dy + 34, 14, null, P.verm, 6);
  for (let i = 0; i < n; i++) {
    ctx.beginPath(); ctx.moveTo(i * dx, -dy); ctx.lineTo((i + 1) * dx, dy); ctx.moveTo(i * dx, dy); ctx.lineTo((i + 1) * dx, -dy);
    stroke(ctx, P.ink, 10); stroke(ctx, color, 6);
    circle(ctx, i * dx + dx / 2, 0, 4, P.goldLight, P.ink, 1);
  }
  // the claws
  const ex = n * dx, c = lerp(0.6, 0.15, clamp(grip));
  for (const sg of [-1, 1]) { ctx.beginPath(); ctx.moveTo(ex, sg * dy); ctx.quadraticCurveTo(ex + 40, sg * (dy + 30 * c * 2), ex + 56, sg * 16 * c * 2); stroke(ctx, P.ink, 12); stroke(ctx, P.verm, 8); }
  ctx.restore();
  return [x + Math.cos(rot) * (n * dx + 50) * s, y + Math.sin(rot) * (n * dx + 50) * s];
}
// Handheld game console (grey brick with a green screen) — generic, no logos.
export function handheld(ctx, x, y, s = 1, rot = 0, t = 0, on = 1) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-90, -150); ctx.lineTo(90, -150); ctx.lineTo(90, 110); ctx.quadraticCurveTo(90, 150, 40, 150); ctx.lineTo(-90, 150); ctx.closePath(); fillStroke(ctx, '#c9c6bf', P.ink, 3);
  rect(ctx, -74, -132, 148, 120, '#5f6470', P.ink, 2);
  rect(ctx, -54, -116, 108, 88, on > 0 ? '#9bb36a' : '#4b5440', P.ink, 1.5);
  if (on > 0) { ctx.save(); ctx.globalAlpha = on; for (let i = 0; i < 4; i++) { const by = -60 - ((t * 40 + i * 22) % 60); rect(ctx, -44 + i * 24, by, 18, 18, '#3f5a2a', null); } rect(ctx, -50, -36, 100, 6, '#3f5a2a', null); ctx.restore(); }
  circle(ctx, -50, -130 + 125, 0, null, null);
  // d-pad + buttons
  rect(ctx, -66, 34, 54, 16, P.ink, P.ink, 1); rect(ctx, -47, 15, 16, 54, P.ink, P.ink, 1);
  circle(ctx, 40, 50, 14, P.vermDark, P.ink, 1.5); circle(ctx, 70, 30, 14, P.vermDark, P.ink, 1.5);
  for (const bx of [-24, 6]) { ctx.save(); ctx.translate(bx, 100); ctx.rotate(-0.4); rect(ctx, -14, -4, 28, 8, '#8f8c86', P.ink, 1); ctx.restore(); }
  ctx.restore();
}
// Toy box with a window and a label.
export function toyBox(ctx, x, y, w, h, labelText = '', color = P.lapis) {
  rect(ctx, x - w / 2, y - h, w, h, color, P.ink, 2.5);
  ctx.fillStyle = pattern(ctx, 'dots', color, shade(color, 0.3), 18); ctx.fillRect(x - w / 2 + 3, y - h + 3, w - 6, h - 6);
  rect(ctx, x - w / 2 + 18, y - h + 18, w - 36, h * 0.55, '#d7ecf2', P.ink, 1.5);
  if (labelText) { cartouche(ctx, x, y - h * 0.2, w * 0.86, h * 0.2, P.paperLight, P.goldDark, 2); ctx.fillStyle = P.verm; ctx.font = `900 ${Math.round(h * 0.1)}px Deco`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(labelText, x, y - h * 0.2 + 2); }
}

// ---------- feasts, letters & the press ----------
export function lamb(ctx, x, y, s = 1, t = 0, walk = null) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const st = walk != null ? Math.sin(walk) * 6 : 0;
  for (const [lx, d] of [[-30, st], [-14, -st], [18, st], [32, -st]]) { ctx.beginPath(); ctx.moveTo(lx, -26); ctx.lineTo(lx + d, 0); stroke(ctx, P.ink, 6); }
  const lobes = [[-36, -50, 20], [-14, -60, 22], [10, -58, 22], [30, -48, 18], [-24, -34, 18], [4, -34, 20], [26, -32, 16]];
  ctx.lineWidth = 4.4; ctx.strokeStyle = P.ink; for (const [a, b, r] of lobes) { ctx.beginPath(); ctx.arc(a, b, r, 0, TAU); ctx.stroke(); }
  ctx.fillStyle = P.white; for (const [a, b, r] of lobes) { ctx.beginPath(); ctx.arc(a, b, r, 0, TAU); ctx.fill(); }
  ctx.lineWidth = 1.3; for (const [a, b, r] of lobes) { ctx.beginPath(); ctx.arc(a, b, r * 0.45, Math.PI * 0.9, Math.PI * 2.2); stroke(ctx, P.grey, 1.3); }
  ellipse(ctx, 50, -60 + Math.sin(t * 3) * 2, 15, 19, -0.4, P.ink, P.ink, 1);
  ellipse(ctx, 40, -72, 9, 4, -0.8, P.ink, P.ink, 1);
  circle(ctx, 55, -64, 2.5, P.white, null);
  circle(ctx, 42, -82, 10, P.white, P.ink, 1.5);
  ctx.restore();
}
export function turkey(ctx, x, y, s = 1, t = 0) { // roast on a platter
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.ellipse(0, 0, 120, 26, 0, 0, TAU); fillStroke(ctx, P.goldLight, P.goldDeep, 2.5);
  ctx.beginPath(); ctx.ellipse(0, -34, 76, 46, 0, Math.PI * 0.95, Math.PI * 2.05); ctx.quadraticCurveTo(0, -4, -74, -26); fillStroke(ctx, '#b8662e', P.ink, 2.5);
  ctx.beginPath(); ctx.ellipse(-20, -52, 30, 14, -0.3, 0, TAU); ctx.fillStyle = 'rgba(255,220,160,0.5)'; ctx.fill();
  for (const sx of [-1, 1]) { ctx.save(); ctx.translate(sx * 64, -36); ctx.rotate(sx * 0.7); ellipse(ctx, 0, -10, 12, 22, 0, '#a85a26', P.ink, 2); circle(ctx, 0, -34, 7, P.white, P.ink, 1.5); ctx.restore(); }
  for (let i = 0; i < 5; i++) flower(ctx, -100 + i * 50, 4, 5, [P.verm, P.ochre, P.green][i % 3]);
  for (let i = 0; i < 3; i++) { const q = (t * 0.5 + i / 3) % 1; ctx.save(); ctx.globalAlpha = 1 - q; ctx.beginPath(); ctx.moveTo(-30 + i * 30, -84 - q * 50); ctx.bezierCurveTo(-46 + i * 30, -110 - q * 50, -14 + i * 30, -126 - q * 50, -30 + i * 30, -150 - q * 50); stroke(ctx, P.white, 5); ctx.restore(); }
  ctx.restore();
}
export function pie(ctx, x, y, s = 1, color = P.ochre) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.ellipse(0, 0, 44, 14, 0, 0, TAU); fillStroke(ctx, P.white, P.ink, 2);
  ctx.beginPath(); ctx.ellipse(0, -6, 38, 11, 0, 0, TAU); fillStroke(ctx, color, P.ink, 2);
  for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(-30 + i * 12, -12); ctx.lineTo(-24 + i * 12, -2); stroke(ctx, P.ochreLight, 2); }
  ctx.restore();
}
export function pumpkin(ctx, x, y, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  for (const [dx, w] of [[-20, 26], [20, 26], [0, 30]]) ellipse(ctx, dx, -26, w, 26, 0, '#e07a22', P.ink, 2);
  ctx.beginPath(); ctx.moveTo(0, -50); ctx.quadraticCurveTo(4, -64, 12, -66); stroke(ctx, P.greenDark, 5);
  ctx.restore();
}
// A calendar page: month on top, a big day number; circled draws a red ring.
export function calendarPage(ctx, x, y, w, month, day, rot = 0, circled = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  const h = w * 1.15;
  rect(ctx, -w / 2, -h / 2, w, h, P.paperLight, P.ink, 2);
  rect(ctx, -w / 2, -h / 2, w, h * 0.26, P.verm, P.ink, 2);
  for (const sx of [-0.25, 0.25]) circle(ctx, sx * w, -h / 2, w * 0.05, P.goldLight, P.ink, 1);
  ctx.fillStyle = P.paperLight; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = `900 ${Math.round(w * 0.16)}px Deco`; ctx.fillText(month, 0, -h / 2 + h * 0.13);
  ctx.fillStyle = P.ink; ctx.font = `900 ${Math.round(w * 0.42)}px Deco`; ctx.fillText(String(day), 0, h * 0.12);
  if (circled > 0) { ctx.beginPath(); ctx.ellipse(0, h * 0.12, w * 0.36, w * 0.3, -0.1, 0, TAU * clamp(circled)); stroke(ctx, P.verm, w * 0.05); }
  ctx.restore();
}
export function quill(ctx, x, y, s = 1, rot = 0, glow = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  if (glow > 0) { const g = ctx.createRadialGradient(0, -60, 5, 0, -60, 120); g.addColorStop(0, `rgba(255,240,170,${0.8 * glow})`); g.addColorStop(1, 'rgba(255,240,170,0)'); ctx.fillStyle = g; ctx.fillRect(-130, -190, 260, 260); }
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-30, -60, -6, -140); ctx.quadraticCurveTo(14, -80, 0, 0); fillStroke(ctx, glow > 0.5 ? P.goldLight : P.white, P.ink, 2);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-8, -70, -6, -140); stroke(ctx, P.ink, 1.5);
  for (let i = 1; i < 7; i++) { ctx.beginPath(); ctx.moveTo(-4 - i * 0.2, -i * 18); ctx.lineTo(-18, -i * 18 - 10); stroke(ctx, P.grey, 1); }
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-2, 14); stroke(ctx, P.ink, 3);
  ctx.restore();
}
export function envelope(ctx, x, y, s = 1, rot = 0, sealColor = P.verm) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  rect(ctx, -60, -38, 120, 76, P.paperLight, P.ink, 2);
  ctx.beginPath(); ctx.moveTo(-60, -38); ctx.lineTo(0, 6); ctx.lineTo(60, -38); stroke(ctx, P.ink, 1.5);
  circle(ctx, 0, 6, 11, sealColor, shade(sealColor, -0.3), 1.5);
  ctx.restore();
}
// Wooden screw press printing a page; k 0..1 is the press stroke.
export function printingPress(ctx, x, y, s = 1, k = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  for (const sx of [-110, 90]) rect(ctx, sx, -320, 20, 320, P.brown, P.ink, 2);
  rect(ctx, -120, -340, 240, 30, P.brownLight, P.ink, 2);
  rect(ctx, -130, -110, 260, 26, P.brownLight, P.ink, 2);
  const py = lerp(-260, -150, clamp(k));
  rect(ctx, -6, -310, 12, py + 310, P.steel, P.ink, 1.5);
  rect(ctx, -80, py, 160, 30, P.steel, P.ink, 2);
  ctx.save(); ctx.translate(0, -290); ctx.rotate(k * 2); ctx.beginPath(); ctx.moveTo(-70, 0); ctx.lineTo(70, 0); stroke(ctx, P.ink, 8); stroke(ctx, P.goldDark, 5); ctx.restore();
  rect(ctx, -70, -122, 140, 12, P.white, P.ink, 1.5);
  ctx.restore();
}
export function magazine(ctx, x, y, w, rot = 0, title = 'LADY’S BOOK', color = P.lapis) {
  const h = w * 1.35;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  rect(ctx, -w / 2, -h / 2, w, h, P.paperLight, P.ink, 2);
  rect(ctx, -w / 2 + 6, -h / 2 + 6, w - 12, h * 0.22, color, P.ink, 1.2);
  ctx.fillStyle = P.goldLight; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = `900 ${Math.round(w * 0.11)}px Deco`; ctx.fillText(title, 0, -h / 2 + 6 + h * 0.11);
  ellipse(ctx, 0, h * 0.08, w * 0.24, h * 0.24, 0, P.pink, P.ink, 1.2);
  for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-w * 0.35, h * 0.36 + i * h * 0.04); ctx.lineTo(w * 0.35, h * 0.36 + i * h * 0.04); stroke(ctx, P.grey, 1.2); }
  ctx.restore();
}

// ---------- sport & winter ----------
// Woven peach basket (open top). fill 0..1 shows peaches inside; ball draws a ball in it.
export function peachBasket(ctx, x, y, s = 1, peaches = 0, ball = false) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.ellipse(0, -60, 48, 12, 0, 0, TAU); fillStroke(ctx, '#5a3a20', P.ink, 2);
  if (peaches > 0) for (let i = 0; i < Math.ceil(6 * peaches); i++) circle(ctx, -30 + (i % 3) * 30, -66 - Math.floor(i / 3) * 14, 13, i % 2 ? '#f0a060' : '#e8844a', P.ink, 1.2);
  if (ball) leatherBall(ctx, 0, -72, 0.9);
  ctx.beginPath(); ctx.moveTo(-48, -60); ctx.lineTo(-38, 0); ctx.quadraticCurveTo(0, 10, 38, 0); ctx.lineTo(48, -60); ctx.quadraticCurveTo(0, -46, -48, -60); ctx.closePath();
  fillStroke(ctx, '#c9a36a', P.ink, 2.2);
  ctx.save(); ctx.clip();
  for (let j = 0; j < 6; j++) { ctx.beginPath(); ctx.moveTo(-60, -52 + j * 10); ctx.quadraticCurveTo(0, -40 + j * 10, 60, -52 + j * 10); stroke(ctx, '#9a7440', 2); }
  for (let i = -5; i <= 5; i++) { ctx.beginPath(); ctx.moveTo(i * 9, -60); ctx.lineTo(i * 7.5, 6); stroke(ctx, '#8a6430', 1.4); }
  ctx.restore();
  ctx.beginPath(); ctx.ellipse(0, -60, 48, 12, 0, Math.PI * 0.05, Math.PI * 0.95); stroke(ctx, '#8a6430', 4);
  ctx.restore();
}
// The 1891 ball: brown leather panels with a laced seam.
export function leatherBall(ctx, x, y, s = 1, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  circle(ctx, 0, 0, 22, '#a0622e', P.ink, 2);
  ctx.beginPath(); ctx.moveTo(-21, -4); ctx.quadraticCurveTo(0, -12, 21, -4); ctx.moveTo(-18, 10); ctx.quadraticCurveTo(0, 2, 18, 10); ctx.moveTo(-4, -21); ctx.quadraticCurveTo(-10, 0, -4, 21); stroke(ctx, '#6a3a18', 1.5);
  for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(4, -10 + i * 6); ctx.lineTo(12, -8 + i * 6); stroke(ctx, P.paperLight, 1.6); }
  ctx.beginPath(); ctx.arc(-6, -8, 7, Math.PI * 1.1, Math.PI * 1.6); stroke(ctx, 'rgba(255,230,190,0.7)', 2.5);
  ctx.restore();
}
export function ladder(ctx, x, yTop, yBot, w = 70) {
  for (const sx of [-w / 2, w / 2]) { ctx.beginPath(); ctx.moveTo(x + sx, yBot); ctx.lineTo(x + sx * 0.8, yTop); stroke(ctx, P.ink, 9); stroke(ctx, P.brownLight, 6); }
  for (let yy = yBot - 30; yy > yTop + 10; yy -= 44) { const k = (yBot - yy) / (yBot - yTop), hw = w / 2 * (1 - k * 0.2); ctx.beginPath(); ctx.moveTo(x - hw, yy); ctx.lineTo(x + hw, yy); stroke(ctx, P.ink, 7); stroke(ctx, P.brownLight, 4); }
}
export function mapleLeaf(ctx, x, y, s = 1, color = P.verm, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  const pts = [[0, -60], [10, -38], [24, -44], [20, -16], [46, -30], [40, -14], [56, -4], [28, 10], [32, 24], [6, 18], [4, 40], [-4, 40], [-6, 18], [-32, 24], [-28, 10], [-56, -4], [-40, -14], [-46, -30], [-20, -16], [-24, -44], [-10, -38]];
  poly(ctx, pts, color, P.ink, 2);
  ctx.beginPath(); ctx.moveTo(0, 40); ctx.lineTo(0, 60); stroke(ctx, P.ink, 4);
  ctx.restore();
}
// Falling snow over an area.
export function snow(ctx, x, y, w, h, t, n = 80, seed = 5) {
  const R = rng(seed); ctx.save(); ctx.fillStyle = 'rgba(255,255,255,0.95)';
  for (let i = 0; i < n; i++) { const sp = 40 + R() * 60, x0 = R() * w, q = (R() * h + t * sp) % h; ctx.beginPath(); ctx.arc(x + x0 + Math.sin(t * 1.5 + i) * 12, y + q, 2 + R() * 3.5, 0, TAU); ctx.fill(); }
  ctx.restore();
}
// Gallery railing across a hall (gym balcony) at height y.
export function railing(ctx, x0, x1, y, h = 60, color = P.brownLight) {
  rect(ctx, x0, y - 8, x1 - x0, 14, color, P.ink, 2);
  rect(ctx, x0, y + h, x1 - x0, 12, color, P.ink, 2);
  for (let x = x0 + 14; x < x1; x += 28) { ctx.beginPath(); ctx.moveTo(x, y + 6); ctx.lineTo(x, y + h); stroke(ctx, P.ink, 6); stroke(ctx, color, 3.5); }
}

// ---------- kitchen ----------
export function cookie(ctx, x, y, r, rot = 0, bite = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  const R = rng(Math.round(r * 7) + 3);
  ctx.beginPath();
  for (let i = 0; i <= 24; i++) { const a = i / 24 * TAU, rr = r * (0.94 + R() * 0.08); i ? ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); }
  ctx.closePath();
  if (bite > 0) { ctx.save(); ctx.clip(); }
  fillStroke(ctx, '#d9a45c', P.ink, Math.max(1.2, r * 0.04));
  const g = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r); g.addColorStop(0, 'rgba(255,230,170,0.5)'); g.addColorStop(1, 'rgba(160,100,40,0.25)'); ctx.fillStyle = g; ctx.fill();
  for (let i = 0; i < 9; i++) { const a = R() * TAU, rr = R() * r * 0.75; poly(ctx, [[Math.cos(a) * rr - r * 0.08, Math.sin(a) * rr], [Math.cos(a) * rr, Math.sin(a) * rr - r * 0.1], [Math.cos(a) * rr + r * 0.09, Math.sin(a) * rr + r * 0.02], [Math.cos(a) * rr, Math.sin(a) * rr + r * 0.08]], '#4a2a18', P.ink, 0.8); }
  if (bite > 0) { ctx.restore(); ctx.globalCompositeOperation = 'destination-out'; for (const [bx, by] of [[r * 0.9, -r * 0.3], [r * 0.95, r * 0.15]]) { ctx.beginPath(); ctx.arc(bx, by, r * 0.25 * bite, 0, TAU); ctx.fill(); } ctx.globalCompositeOperation = 'source-over'; }
  ctx.restore();
}
// Chocolate bar with a paper label; cut 0..1 removes pieces from the right.
export function chocBar(ctx, x, y, w, rot = 0, labelText = '', cut = 0) {
  const h = w * 0.42, n = 6, keep = Math.ceil(n * (1 - clamp(cut)));
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  for (let i = 0; i < keep; i++) { rect(ctx, -w / 2 + i * w / n, -h / 2, w / n, h, '#5a321c', P.ink, 1.6); rect(ctx, -w / 2 + i * w / n + 5, -h / 2 + 5, w / n - 10, h - 10, '#6e3e22', null); }
  if (labelText) { const lw = Math.min(w * 0.36, keep * w / n); if (lw > 20) { rect(ctx, -w / 2, -h / 2 - 2, lw, h + 4, P.paperLight, P.ink, 1.6); ctx.fillStyle = P.verm; ctx.font = `900 ${Math.round(h * 0.3)}px Deco`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(labelText, -w / 2 + lw / 2, 2); } }
  ctx.restore();
}
export function chocChunk(ctx, x, y, s = 1, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  poly(ctx, [[-10, -8], [8, -10], [12, 6], [-6, 10]], '#5a321c', P.ink, 1.2); ctx.restore();
}
export function knife(ctx, x, y, s = 1, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(150, 0); ctx.quadraticCurveTo(170, 0, 160, 30); ctx.lineTo(0, 30); ctx.closePath(); fillStroke(ctx, '#d9dee4', P.ink, 2);
  rect(ctx, -90, 4, 92, 24, P.brown, P.ink, 2); for (const rx of [-70, -40, -12]) circle(ctx, rx, 16, 3, P.goldLight, P.ink, 0.8);
  ctx.restore();
}
// Brick oven with a fire; open 0..1 (door), tray: draw a tray of cookies coming out.
export function oven(ctx, x, base, s = 1, t = 0, tray = 0) {
  ctx.save(); ctx.translate(x, base); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-150, 0); ctx.lineTo(-150, -150); ctx.quadraticCurveTo(0, -300, 150, -150); ctx.lineTo(150, 0); ctx.closePath(); fillStroke(ctx, '#b5553a', P.ink, 2.5);
  ctx.save(); ctx.clip(); ctx.strokeStyle = 'rgba(80,30,20,0.4)'; ctx.lineWidth = 2; for (let y = -280; y < 0; y += 22) { ctx.beginPath(); ctx.moveTo(-160, y); ctx.lineTo(160, y); ctx.stroke(); for (let xx = -160 + ((y / 22) % 2) * 20; xx < 160; xx += 40) { ctx.beginPath(); ctx.moveTo(xx, y); ctx.lineTo(xx, y + 22); ctx.stroke(); } } ctx.restore();
  ctx.beginPath(); ctx.moveTo(-70, 0); ctx.lineTo(-70, -80); ctx.quadraticCurveTo(0, -150, 70, -80); ctx.lineTo(70, 0); ctx.closePath(); fillStroke(ctx, '#2a1c12', P.ink, 2);
  for (let i = 0; i < 3; i++) { const f = 1 + 0.25 * Math.sin(t * 14 + i * 2); ctx.beginPath(); ctx.moveTo(-40 + i * 30, -10); ctx.quadraticCurveTo(-48 + i * 30, -40 * f, -30 + i * 30, -70 * f); ctx.quadraticCurveTo(-24 + i * 30, -40 * f, -14 + i * 30, -10); fillStroke(ctx, [P.verm, P.ochre, P.goldLight][i], P.ink, 1); }
  if (tray > 0) { ctx.save(); ctx.translate(lerp(0, 150, tray), -20); rect(ctx, -90, -6, 180, 12, P.steel, P.ink, 1.5); for (let i = 0; i < 4; i++) cookie(ctx, -66 + i * 44, -18, 18, i); ctx.restore(); }
  ctx.restore();
}
// Balance scale; tilt -1..1 (0 = perfectly level).
export function balance(ctx, x, base, s = 1, tilt = 0) {
  ctx.save(); ctx.translate(x, base); ctx.scale(s, s);
  rect(ctx, -60, -12, 120, 14, P.goldDark, P.ink, 2); rect(ctx, -6, -200, 12, 190, P.gold, P.ink, 2);
  ctx.save(); ctx.translate(0, -200); ctx.rotate(tilt * 0.3);
  rect(ctx, -130, -6, 260, 12, P.gold, P.ink, 2);
  for (const sx of [-1, 1]) { ctx.save(); ctx.translate(sx * 120, 0); ctx.rotate(-tilt * 0.3); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-40, 90); ctx.moveTo(0, 0); ctx.lineTo(40, 90); stroke(ctx, P.goldDark, 2); ctx.beginPath(); ctx.ellipse(0, 92, 50, 12, 0, 0, Math.PI); fillStroke(ctx, P.goldLight, P.ink, 2); ctx.restore(); }
  ctx.restore();
  circle(ctx, 0, -200, 10, P.goldLight, P.ink, 1.5);
  ctx.restore();
}
export function coin(ctx, x, y, r, spin = 0, text = '$1') {
  ctx.save(); ctx.translate(x, y); ctx.scale(Math.max(0.08, Math.abs(Math.cos(spin))), 1);
  circle(ctx, 0, 0, r, P.goldLight, P.goldDeep, Math.max(1.5, r * 0.06)); circle(ctx, 0, 0, r * 0.8, null, P.goldDark, Math.max(1, r * 0.03));
  if (text && Math.abs(Math.cos(spin)) > 0.35) { ctx.fillStyle = P.goldDeep; ctx.font = `900 ${Math.round(r * 0.7)}px Deco`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 0, r * 0.05); }
  ctx.restore();
}
// Paper bag of chocolate chips.
export function chipBag(ctx, x, y, s = 1, rot = 0, labelText = 'CHOCOLATE CHIPS') {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-60, -110); ctx.lineTo(60, -110); ctx.lineTo(70, 0); ctx.lineTo(-70, 0); ctx.closePath(); fillStroke(ctx, P.verm, P.ink, 2.5);
  for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(-60 + i * 24, -110); ctx.lineTo(-54 + i * 24, -124); ctx.lineTo(-48 + i * 24, -110); fillStroke(ctx, P.verm, P.ink, 1.5); }
  rect(ctx, -52, -80, 104, 54, P.paperLight, P.ink, 1.5);
  ctx.fillStyle = '#4a2a18'; ctx.font = '900 13px Deco'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const words = labelText.split(' '); words.forEach((w, i) => ctx.fillText(w, 0, -64 + i * 18 - (words.length - 2) * 9));
  for (let i = 0; i < 5; i++) chocChunk(ctx, -40 + i * 20, -14, 0.6, i);
  ctx.restore();
}

// ---------- dough, soot & stoves ----------
// A soft dough blob; squash 0..1 flattens it.
export function dough(ctx, x, y, r, color = P.ochreLight, squash = 0, seed = 1) {
  const R = rng(seed), pts = [];
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU, rr = r * (0.9 + R() * 0.2); pts.push([x + Math.cos(a) * rr * (1 + squash * 0.4), y + Math.sin(a) * rr * (1 - squash * 0.45)]); }
  ctx.beginPath(); smoothPath(ctx, pts); fillStroke(ctx, color, P.ink, Math.max(1.2, r * 0.05));
  ctx.beginPath(); ctx.ellipse(x - r * 0.3, y - r * 0.35 * (1 - squash * 0.4), r * 0.3, r * 0.15, -0.4, 0, TAU); ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.fill();
}
// Dark soot smudges over a wall area; k 0..1 how dirty.
export function soot(ctx, x, y, w, h, k, seed = 3) {
  if (k <= 0) return;
  const R = rng(seed); ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.fillStyle = `rgba(40,32,28,${0.45 * k})`; ctx.fillRect(x, y, w, h);
  for (let i = 0; i < 26; i++) { const cx = x + R() * w, cy = y + R() * h, r = 30 + R() * 90, g = ctx.createRadialGradient(cx, cy, 2, cx, cy, r); g.addColorStop(0, `rgba(30,24,20,${0.5 * k})`); g.addColorStop(1, 'rgba(30,24,20,0)'); ctx.fillStyle = g; ctx.fillRect(cx - r, cy - r, 2 * r, 2 * r); }
  ctx.restore();
}
// Cylindrical can of putty/dough with a paper label.
export function doughCan(ctx, x, y, s = 1, labelText = '', color = P.ochre, lid = P.verm, open = 0, doughColor = null) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-50, -120); ctx.lineTo(-50, 0); ctx.ellipse(0, 0, 50, 14, 0, Math.PI, 0, true); ctx.lineTo(50, -120); ctx.closePath(); fillStroke(ctx, color, P.ink, 2.5);
  rect(ctx, -50, -96, 100, 60, P.paperLight, P.ink, 1.5);
  if (labelText) { ctx.fillStyle = P.verm; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; const words = labelText.split(' '); let fs = 18; ctx.font = `900 ${fs}px Deco`; while (words.some(w => ctx.measureText(w).width > 92) && fs > 9) { fs -= 1; ctx.font = `900 ${fs}px Deco`; } words.forEach((w, i) => ctx.fillText(w, 0, -66 + (i - (words.length - 1) / 2) * (fs + 2))); }
  if (open > 0) { if (doughColor) dough(ctx, 0, -128, 40, doughColor, 0.4, 3); ctx.save(); ctx.translate(lerp(0, 70, open), lerp(-120, -170, open)); ctx.rotate(open * 0.6); ctx.beginPath(); ctx.ellipse(0, 0, 54, 14, 0, 0, TAU); fillStroke(ctx, lid, P.ink, 2); ctx.restore(); }
  else { ctx.beginPath(); ctx.ellipse(0, -120, 54, 14, 0, 0, TAU); fillStroke(ctx, lid, P.ink, 2); }
  ctx.restore();
}
// Cast-iron potbelly stove burning coal, with a pipe and sooty smoke.
export function coalStove(ctx, x, base, s = 1, t = 0, fire = 1, smoke = 1) {
  ctx.save(); ctx.translate(x, base); ctx.scale(s, s);
  rect(ctx, -16, -560, 32, 360, '#3a3a3a', P.ink, 2);
  ctx.beginPath(); ctx.moveTo(-60, -200); ctx.lineTo(60, -200); ctx.quadraticCurveTo(110, -110, 70, -30); ctx.lineTo(-70, -30); ctx.quadraticCurveTo(-110, -110, -60, -200); ctx.closePath(); fillStroke(ctx, '#2f2f33', P.ink, 2.5);
  for (const lx of [-50, 50]) { ctx.beginPath(); ctx.moveTo(lx, -30); ctx.lineTo(lx * 1.2, 0); stroke(ctx, P.ink, 8); }
  rect(ctx, -34, -140, 68, 60, '#1a1a1a', P.ink, 2);
  if (fire > 0) for (let i = 0; i < 3; i++) { const f = (1 + 0.25 * Math.sin(t * 14 + i * 2)) * fire; ctx.beginPath(); ctx.moveTo(-24 + i * 20, -82); ctx.quadraticCurveTo(-30 + i * 20, -100 * f, -16 + i * 20, -130 * f + 50 * (1 - f)); ctx.quadraticCurveTo(-8 + i * 20, -100 * f, -4 + i * 20, -82); fillStroke(ctx, [P.verm, P.ochre, P.goldLight][i], P.ink, 1); }
  if (smoke > 0) for (let i = 0; i < 4; i++) { const k = (t * 0.4 + i / 4) % 1; ctx.save(); ctx.globalAlpha = (1 - k) * smoke; cloud(ctx, 10 + k * 40, -580 - k * 160, 0.5 + k * 0.5, i + 50, '#55504c', P.ink); ctx.restore(); }
  ctx.restore();
}
// Folded newspaper with a headline.
export function newspaper(ctx, x, y, w, rot = 0, headline = 'NEWS', title = 'THE DAILY NEWS') {
  const h = w * 1.25;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  rect(ctx, -w / 2, -h / 2, w, h, '#f1ead8', P.ink, 2);
  ctx.fillStyle = P.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `900 ${Math.round(w * 0.075)}px Fell`; ctx.fillText(title, 0, -h / 2 + w * 0.08);
  ctx.beginPath(); ctx.moveTo(-w * 0.45, -h / 2 + w * 0.14); ctx.lineTo(w * 0.45, -h / 2 + w * 0.14); stroke(ctx, P.ink, 2);
  const words = headline.split('\n'); ctx.font = `900 ${Math.round(w * 0.075)}px Deco`; ctx.fillStyle = P.verm;
  words.forEach((ln, i) => ctx.fillText(ln, 0, -h / 2 + w * 0.24 + i * w * 0.09));
  for (let c = 0; c < 2; c++) for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.moveTo(-w * 0.44 + c * w * 0.46, -h / 2 + w * (0.26 + words.length * 0.09) + i * w * 0.06); ctx.lineTo(-w * 0.02 + c * w * 0.46, -h / 2 + w * (0.26 + words.length * 0.09) + i * w * 0.06); stroke(ctx, P.grey, 1.5); }
  ctx.restore();
}
export function cobweb(ctx, x, y, r, corner = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(corner * Math.PI / 2); ctx.strokeStyle = 'rgba(240,240,240,0.85)'; ctx.lineWidth = 1.5;
  for (let i = 0; i <= 5; i++) { const a = i / 5 * Math.PI / 2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); ctx.stroke(); }
  for (let j = 1; j <= 4; j++) { ctx.beginPath(); for (let i = 0; i <= 5; i++) { const a = i / 5 * Math.PI / 2, rr = r * j / 4.3; i ? ctx.quadraticCurveTo(Math.cos(a - 0.15) * rr * 0.85, Math.sin(a - 0.15) * rr * 0.85, Math.cos(a) * rr, Math.sin(a) * rr) : ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.stroke(); }
  ctx.restore();
}

// ---------- hills, signs & the movies ----------
// Big block letters standing on a hillside on poles. f(i) → { show 0..1, tilt, drop, dx, lit, color }.
export function hillLetters(ctx, x, y, size, text, f = () => ({}), t = 0) {
  ctx.save(); ctx.font = `900 ${size}px Deco`; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'center';
  const gap = size * 0.08, widths = [...text].map(ch => ctx.measureText(ch).width), total = widths.reduce((a, b) => a + b, 0) + gap * (text.length - 1);
  let cx = x - total / 2;
  [...text].forEach((ch, i) => {
    const o = { show: 1, tilt: 0, drop: 0, dx: 0, lit: 0, color: P.white, ...f(i) }, w = widths[i];
    const lx = cx + w / 2 + o.dx, ly = y + o.drop; cx += w + gap;
    if (o.show <= 0) return;
    // poles behind each letter
    ctx.save(); ctx.globalAlpha *= clamp(o.show);
    for (const px of [-w * 0.3, w * 0.3]) { ctx.beginPath(); ctx.moveTo(lx + px, ly - size * 0.3); ctx.lineTo(lx + px, ly + size * 0.25); stroke(ctx, P.brown, Math.max(2, size * 0.04)); }
    if (o.lit > 0) { const g = ctx.createRadialGradient(lx, ly - size * 0.35, 2, lx, ly - size * 0.35, size * 0.9); g.addColorStop(0, `rgba(255,240,170,${0.55 * o.lit})`); g.addColorStop(1, 'rgba(255,240,170,0)'); ctx.fillStyle = g; ctx.fillRect(lx - size, ly - size * 1.3, size * 2, size * 2); }
    ctx.translate(lx, ly); ctx.rotate(o.tilt); ctx.scale(1, clamp(o.show));
    ctx.lineWidth = Math.max(3, size * 0.08); ctx.strokeStyle = P.ink; ctx.lineJoin = 'round'; ctx.strokeText(ch, 0, 0);
    ctx.fillStyle = o.lit > 0.5 ? '#fff8dc' : o.color; ctx.fillText(ch, 0, 0);
    if (o.lit > 0) { ctx.globalAlpha *= o.lit; const R = rng(i + 3); for (let k = 0; k < 7; k++) { const bx = (R() - 0.5) * w * 0.8, by = -R() * size * 0.7; circle(ctx, bx, by, Math.max(3, size * 0.06), 0.5 + 0.5 * Math.sin(t * 9 + k + i) > 0.3 ? '#fff3a8' : P.ochre, P.goldDeep, 1); } }
    ctx.restore();
  });
  ctx.restore();
}
export function palm(ctx, x, base, h, t = 0, seed = 1) {
  ctx.save(); ctx.translate(x, base);
  const lean = Math.sin(seed) * 0.12, sway = Math.sin(t * 1.2 + seed) * 0.04;
  ctx.beginPath(); ctx.moveTo(-8, 0); ctx.quadraticCurveTo(h * lean, -h * 0.5, h * (lean + sway) - 4, -h); ctx.lineTo(h * (lean + sway) + 4, -h); ctx.quadraticCurveTo(h * lean + 10, -h * 0.5, 8, 0); ctx.closePath(); fillStroke(ctx, P.brownLight, P.ink, 1.8);
  for (let i = 1; i < 10; i++) { const yy = -h * i / 10, xx = h * lean * Math.sin(i / 10 * Math.PI / 2); ctx.beginPath(); ctx.moveTo(xx - 7, yy); ctx.lineTo(xx + 7, yy + 4); stroke(ctx, P.brown, 1.3); }
  const tx = h * (lean + sway), ty = -h;
  for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * 0.55 + sway * 3, L = h * 0.32; ctx.beginPath(); ctx.moveTo(tx, ty); ctx.quadraticCurveTo(tx + Math.cos(a) * L * 0.6, ty + Math.sin(a) * L * 0.6 - 16, tx + Math.cos(a) * L, ty + Math.sin(a) * L + L * 0.35); ctx.quadraticCurveTo(tx + Math.cos(a) * L * 0.5, ty + Math.sin(a) * L * 0.4, tx, ty); fillStroke(ctx, i % 2 ? P.green : P.greenDark, P.ink, 1.4); }
  ctx.restore();
}
export function hourglass(ctx, x, y, s = 1, k = 0.5, rot = 0) { // k = share of sand already fallen
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  rect(ctx, -60, -110, 120, 14, P.brownLight, P.ink, 2); rect(ctx, -60, 96, 120, 14, P.brownLight, P.ink, 2);
  ctx.beginPath(); ctx.moveTo(-46, -96); ctx.quadraticCurveTo(-46, -20, -6, 0); ctx.quadraticCurveTo(-46, 20, -46, 96); ctx.lineTo(46, 96); ctx.quadraticCurveTo(46, 20, 6, 0); ctx.quadraticCurveTo(46, -20, 46, -96); ctx.closePath();
  ctx.save(); ctx.clip(); ctx.fillStyle = 'rgba(210,235,240,0.6)'; ctx.fillRect(-50, -100, 100, 200);
  ctx.fillStyle = P.ochre; ctx.fillRect(-50, -96 + 90 * clamp(k), 100, 92 * (1 - clamp(k))); ctx.fillRect(-50, 96 - 92 * clamp(k), 100, 92 * clamp(k));
  if (k > 0 && k < 1) ctx.fillRect(-2, 0, 4, 96);
  ctx.restore(); stroke(ctx, P.ink, 2.5);
  for (const sx of [-54, 54]) { ctx.beginPath(); ctx.moveTo(sx, -96); ctx.lineTo(sx, 96); stroke(ctx, P.brown, 6); }
  ctx.restore();
}
export function searchlights(ctx, x, y, W, H, t = 0, n = 4, a = 1) {
  ctx.save(); ctx.globalAlpha *= a;
  for (let i = 0; i < n; i++) { const ang = -Math.PI / 2 + Math.sin(t * 0.8 + i * 1.7) * 0.6, L = H * 1.3; ctx.beginPath(); ctx.moveTo(x + (i - (n - 1) / 2) * 60, y); ctx.lineTo(x + Math.cos(ang - 0.06) * L, y + Math.sin(ang - 0.06) * L); ctx.lineTo(x + Math.cos(ang + 0.06) * L, y + Math.sin(ang + 0.06) * L); ctx.closePath(); const g = ctx.createLinearGradient(x, y, x + Math.cos(ang) * L, y + Math.sin(ang) * L); g.addColorStop(0, 'rgba(255,248,200,0.55)'); g.addColorStop(1, 'rgba(255,248,200,0)'); ctx.fillStyle = g; ctx.fill(); }
  ctx.restore();
}
export function filmReel(ctx, x, y, r, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  circle(ctx, 0, 0, r, P.steel, P.ink, 2.5); circle(ctx, 0, 0, r * 0.2, P.goldLight, P.ink, 1.5);
  for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; circle(ctx, Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.55, r * 0.2, '#2a2f45', P.ink, 1.5); }
  ctx.restore();
}
export function clapper(ctx, x, y, s = 1, open = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rect(ctx, -90, -40, 180, 120, '#1a1a1a', P.ink, 2);
  ctx.fillStyle = P.white; ctx.font = '700 18px Fell'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('SCENE  1', -76, -10); ctx.fillText('TAKE   1', -76, 20); ctx.fillText('ROLL   1', -76, 50);
  ctx.save(); ctx.translate(-90, -40); ctx.rotate(-open * 0.5);
  rect(ctx, 0, -28, 180, 28, '#1a1a1a', P.ink, 2); for (let i = 0; i < 6; i++) poly(ctx, [[i * 30 + 4, -28], [i * 30 + 18, -28], [i * 30 + 8, 0], [i * 30 - 6, 0]], P.white, null);
  ctx.restore();
  ctx.restore();
}
export function guitar(ctx, x, y, s = 1, rot = 0, color = P.verm) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-40, -30); ctx.bezierCurveTo(-70, -40, -80, 30, -40, 34); ctx.bezierCurveTo(-20, 40, -10, 20, 10, 24); ctx.bezierCurveTo(40, 30, 40, -20, 10, -18); ctx.bezierCurveTo(-10, -16, -20, -26, -40, -30); ctx.closePath(); fillStroke(ctx, color, P.ink, 2);
  rect(ctx, 10, -6, 130, 12, P.brown, P.ink, 1.5); rect(ctx, 136, -12, 24, 24, P.ink, P.ink, 1);
  for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-30, -6 + i * 4); ctx.lineTo(140, -6 + i * 4); stroke(ctx, P.goldLight, 0.8); }
  ctx.restore();
}

// ---------- roadside & kitchen (fried chicken) ----------
export function gasPump(ctx, x, base, s = 1, color = P.verm, glow = 0) {
  ctx.save(); ctx.translate(x, base); ctx.scale(s, s);
  rect(ctx, -34, -180, 68, 180, color, P.ink, 2.5);
  rect(ctx, -24, -160, 48, 40, P.paperLight, P.ink, 1.5);
  ctx.fillStyle = P.ink; ctx.font = '700 12px Fell'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('GAS', 0, -140);
  rect(ctx, -10, -210, 20, 30, P.steel, P.ink, 1.5);
  if (glow > 0) { const g = ctx.createRadialGradient(0, -236, 4, 0, -236, 60); g.addColorStop(0, `rgba(255,240,170,${0.7 * glow})`); g.addColorStop(1, 'rgba(255,240,170,0)'); ctx.fillStyle = g; ctx.fillRect(-60, -296, 120, 120); }
  circle(ctx, 0, -236, 26, P.white, P.ink, 2); circle(ctx, 0, -236, 16, color, null);
  ctx.beginPath(); ctx.moveTo(34, -100); ctx.quadraticCurveTo(70, -80, 56, -30); stroke(ctx, P.ink, 5);
  ctx.restore();
}
export function drumstick(ctx, x, y, s = 1, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-6, 10); ctx.lineTo(-4, 34); ctx.lineTo(4, 34); ctx.lineTo(6, 10); stroke(ctx, P.ink, 9); stroke(ctx, P.white, 6);
  circle(ctx, -5, 36, 5, P.white, P.ink, 1.2); circle(ctx, 5, 36, 5, P.white, P.ink, 1.2);
  const R = rng(3); ctx.beginPath();
  for (let i = 0; i <= 14; i++) { const a = Math.PI * 0.75 + i / 14 * TAU * 0.75, rr = 22 * (0.9 + R() * 0.2); i ? ctx.lineTo(Math.cos(a) * rr * 0.8, -6 + Math.sin(a) * rr) : ctx.moveTo(Math.cos(a) * rr * 0.8, -6 + Math.sin(a) * rr); }
  ctx.lineTo(8, 12); ctx.lineTo(-8, 12); ctx.closePath(); fillStroke(ctx, '#c47a32', P.ink, 1.8);
  for (let i = 0; i < 6; i++) circle(ctx, -10 + (i % 3) * 9, -16 + Math.floor(i / 3) * 14, 2.5, '#9a5a20', null);
  ctx.restore();
}
// Striped paper bucket heaped with chicken (no logo).
export function bucket(ctx, x, y, s = 1, full = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (full > 0) for (let i = 0; i < Math.ceil(5 * full); i++) drumstick(ctx, -44 + i * 22, -150 - (i % 2) * 14, 1.1, -0.6 + i * 0.3);
  ctx.beginPath(); ctx.moveTo(-80, -140); ctx.lineTo(80, -140); ctx.lineTo(60, 0); ctx.lineTo(-60, 0); ctx.closePath();
  ctx.save(); ctx.clip(); ctx.fillStyle = P.white; ctx.fillRect(-90, -150, 180, 160); ctx.fillStyle = P.verm; for (let i = -4; i < 5; i += 2) { ctx.beginPath(); ctx.moveTo(i * 18 - 9, -140); ctx.lineTo(i * 18 + 9, -140); ctx.lineTo(i * 14 + 7, 0); ctx.lineTo(i * 14 - 7, 0); ctx.closePath(); ctx.fill(); } ctx.restore();
  ctx.beginPath(); ctx.moveTo(-80, -140); ctx.lineTo(80, -140); ctx.lineTo(60, 0); ctx.lineTo(-60, 0); ctx.closePath(); stroke(ctx, P.ink, 2.5);
  rect(ctx, -82, -146, 164, 12, P.white, P.ink, 2);
  ctx.restore();
}
// A bank check with an amount.
export function bankCheck(ctx, x, y, w, rot = 0, amount = '$105.00', payee = '') {
  const h = w * 0.42;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  rect(ctx, -w / 2, -h / 2, w, h, '#dfeee0', P.ink, 2);
  ctx.fillStyle = pattern(ctx, 'scales', '#dfeee0', '#c9e0cb', 16); ctx.fillRect(-w / 2 + 2, -h / 2 + 2, w - 4, h - 4);
  ctx.fillStyle = P.ink; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.font = `700 ${Math.round(h * 0.12)}px Fell`;
  ctx.fillText('PAY TO THE ORDER OF', -w * 0.45, -h * 0.18);
  if (payee) { ctx.font = `700 ${Math.round(h * 0.14)}px GaramondItalic`; ctx.fillText(payee, -w * 0.1, -h * 0.18); }
  rect(ctx, w * 0.12, -h * 0.4, w * 0.33, h * 0.24, P.white, P.ink, 1.5);
  ctx.textAlign = 'center'; ctx.fillStyle = P.verm; ctx.font = `900 ${Math.round(h * 0.17)}px Deco`; ctx.fillText(amount, w * 0.285, -h * 0.28);
  for (let i = 0; i < 2; i++) { ctx.beginPath(); ctx.moveTo(-w * 0.45, h * 0.08 + i * h * 0.18); ctx.lineTo(w * 0.42, h * 0.08 + i * h * 0.18); stroke(ctx, P.grey, 1.3); }
  ctx.restore();
}
export function pressureCooker(ctx, x, base, s = 1, t = 0, steam = 1) {
  ctx.save(); ctx.translate(x, base); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-70, -100); ctx.lineTo(70, -100); ctx.quadraticCurveTo(76, -10, 60, 0); ctx.lineTo(-60, 0); ctx.quadraticCurveTo(-76, -10, -70, -100); ctx.closePath(); fillStroke(ctx, P.steel, P.ink, 2.5);
  ctx.beginPath(); ctx.ellipse(0, -100, 74, 18, 0, Math.PI, TAU); fillStroke(ctx, '#9aa7b6', P.ink, 2);
  rect(ctx, -8, -136, 16, 20, P.ink, P.ink, 1); circle(ctx, 0, -140, 8, P.verm, P.ink, 1.5);
  for (const sx of [-1, 1]) rect(ctx, sx * 70 - (sx < 0 ? 40 : 0), -84, 40, 14, P.ink, P.ink, 1);
  if (steam > 0) for (let i = 0; i < 3; i++) { const q = (t * 0.8 + i / 3) % 1; ctx.save(); ctx.globalAlpha = (1 - q) * steam; cloud(ctx, 10 + q * 30, -170 - q * 100, 0.35 + q * 0.3, i + 60, P.white, P.grey); ctx.restore(); }
  ctx.restore();
}

// ---------- the cosmos ----------
// Celestial spheres in the manner of Ottoman astronomical manuscripts. k = expansion 0..1+.
export function celestialSpheres(ctx, x, y, r, k = 1, t = 0) {
  ctx.save(); ctx.translate(x, y);
  const n = 6;
  for (let i = n; i >= 1; i--) {
    const rr = r * (i / n) * k;
    if (rr < 1) continue;
    ctx.beginPath(); ctx.arc(0, 0, rr, 0, TAU); ctx.fillStyle = i % 2 ? P.lapisDeep : P.lapis; ctx.fill(); stroke(ctx, P.goldLight, 3);
    // zodiac-like ticks
    ctx.save(); ctx.rotate(t * 0.05 * (i % 2 ? 1 : -1));
    for (let j = 0; j < 24; j++) { const a = j / 24 * TAU; ctx.beginPath(); ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); ctx.lineTo(Math.cos(a) * (rr - 8), Math.sin(a) * (rr - 8)); stroke(ctx, P.goldLight, 1.2); }
    const R = rng(i); for (let j = 0; j < 4 + i * 2; j++) { const a = R() * TAU, d = rr - r / n * (0.3 + R() * 0.4); if (d > 4) star(ctx, Math.cos(a) * d, Math.sin(a) * d, 4 + R() * 4, 1); }
    ctx.restore();
  }
  ctx.restore();
}
export function galaxy(ctx, x, y, r, rot = 0, color = '#f6e7b4') {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  const g = ctx.createRadialGradient(0, 0, 1, 0, 0, r); g.addColorStop(0, 'rgba(255,248,220,0.95)'); g.addColorStop(0.35, 'rgba(240,210,150,0.5)'); g.addColorStop(1, 'rgba(240,210,150,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, r, r * 0.55, 0, 0, TAU); ctx.fill();
  for (let arm = 0; arm < 2; arm++) { ctx.beginPath(); for (let i = 0; i < 40; i++) { const a = i / 40 * Math.PI * 2.2 + arm * Math.PI, d = r * i / 40; const px = Math.cos(a) * d, py = Math.sin(a) * d * 0.55; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } stroke(ctx, color, Math.max(1.5, r * 0.08)); }
  ctx.restore();
}
// A vintage broadcast microphone on a stand; waves 0..1 draws radio waves.
export function microphone(ctx, x, base, s = 1, waves = 0, t = 0, text = 'BBC') {
  ctx.save(); ctx.translate(x, base); ctx.scale(s, s);
  rect(ctx, -40, -10, 80, 10, P.ink, P.ink, 1); rect(ctx, -4, -260, 8, 250, P.steel, P.ink, 1.5);
  ctx.beginPath(); ctx.ellipse(0, -300, 34, 46, 0, 0, TAU); fillStroke(ctx, '#3a3f4a', P.ink, 2.5);
  for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(-28, -300 + i * 10); ctx.lineTo(28, -300 + i * 10); stroke(ctx, '#6a7080', 1.5); }
  if (text) { rect(ctx, -40, -310, 80, 20, P.verm, P.ink, 1.5); ctx.fillStyle = P.white; ctx.font = '900 14px Deco'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 0, -299); }
  if (waves > 0) for (let i = 0; i < 4; i++) { const q = (t * 0.8 + i / 4) % 1; ctx.save(); ctx.globalAlpha = (1 - q) * waves; ctx.beginPath(); ctx.arc(0, -300, 60 + q * 260, -0.7, 0.7); stroke(ctx, P.goldLight, 4); ctx.beginPath(); ctx.arc(0, -300, 60 + q * 260, Math.PI - 0.7, Math.PI + 0.7); stroke(ctx, P.goldLight, 4); ctx.restore(); }
  ctx.restore();
}
// The horn antenna on its turntable.
export function hornAntenna(ctx, x, base, s = 1) {
  ctx.save(); ctx.translate(x, base); ctx.scale(s, s);
  rect(ctx, -160, -20, 320, 20, P.steel, P.ink, 2);
  for (const sx of [-120, 120]) { ctx.beginPath(); ctx.moveTo(sx, -20); ctx.lineTo(sx * 0.6, -120); stroke(ctx, P.ink, 6); }
  ctx.beginPath(); ctx.moveTo(-170, -260); ctx.lineTo(120, -200); ctx.lineTo(120, -110); ctx.lineTo(-170, -60); ctx.closePath(); fillStroke(ctx, '#c9c6bf', P.ink, 2.5);
  ctx.beginPath(); ctx.moveTo(-170, -260); ctx.lineTo(-240, -300); ctx.lineTo(-240, -10); ctx.lineTo(-170, -60); ctx.closePath(); fillStroke(ctx, '#e2dfd8', P.ink, 2.5);
  for (let i = 1; i < 6; i++) { ctx.beginPath(); ctx.moveTo(-170 + i * 50, -260 + i * 10); ctx.lineTo(-170 + i * 50, -60 - i * 9); stroke(ctx, '#9a978f', 1.5); }
  rect(ctx, 120, -175, 60, 40, P.steel, P.ink, 2);
  ctx.restore();
}
export function chalkboard(ctx, x, y, w, h, k = 1) {
  rect(ctx, x, y, w, h, '#2f3b33', P.brown, 8);
  ctx.save(); ctx.beginPath(); ctx.rect(x + 10, y + 10, (w - 20) * clamp(k), h - 20); ctx.clip();
  ctx.fillStyle = 'rgba(255,255,255,0.88)'; ctx.font = `700 ${Math.round(h * 0.11)}px GaramondItalic`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ['v = H₀ · d', 'R(t) → 0', 'ä/a = −4πG(ρ+3p)/3', 'λ ∝ a(t)'].forEach((ln, i) => ctx.fillText(ln, x + 24, y + h * (0.2 + i * 0.2)));
  ctx.restore();
}
// Belgian stepped-gable house front.
export function gableHouse(ctx, x, base, w, h, wall = P.ochreLight) {
  ctx.save(); ctx.translate(x, base);
  const steps = 4, sw = w / 2 / steps, sh = h * 0.12;
  ctx.beginPath(); ctx.moveTo(-w / 2, 0); ctx.lineTo(-w / 2, -h);
  for (let i = 0; i < steps; i++) { ctx.lineTo(-w / 2 + i * sw, -h - (i + 1) * sh); ctx.lineTo(-w / 2 + (i + 1) * sw, -h - (i + 1) * sh); }
  for (let i = steps - 1; i >= 0; i--) { ctx.lineTo(w / 2 - i * sw, -h - (i + 1) * sh); ctx.lineTo(w / 2 - i * sw, -h - i * sh); }
  ctx.lineTo(w / 2, 0); ctx.closePath(); fillStroke(ctx, wall, P.ink, 2);
  for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) rect(ctx, -w * 0.3 + c * w * 0.38, -h * 0.85 + r * h * 0.38, w * 0.2, h * 0.24, P.lapis, P.ink, 1.3);
  arch(ctx, 0, 0, w * 0.22, h * 0.32, P.brown);
  ctx.restore();
}

// ---------- words & parades ----------
export function speechBubble(ctx, x, y, text, size = 34, tail = 1, fill = P.paperLight) {
  ctx.save(); ctx.font = `900 ${size}px Deco`;
  const w = ctx.measureText(text).width + size * 1.2, h = size * 1.6;
  ctx.beginPath(); ctx.moveTo(x - w / 2 + h / 2, y - h / 2); ctx.lineTo(x + w / 2 - h / 2, y - h / 2); ctx.arc(x + w / 2 - h / 2, y, h / 2, -Math.PI / 2, Math.PI / 2); ctx.lineTo(x + tail * w * 0.15 + 10, y + h / 2); ctx.lineTo(x + tail * w * 0.05, y + h / 2 + size * 0.6); ctx.lineTo(x + tail * w * 0.1 - 10, y + h / 2); ctx.lineTo(x - w / 2 + h / 2, y + h / 2); ctx.arc(x - w / 2 + h / 2, y, h / 2, Math.PI / 2, Math.PI * 1.5); ctx.closePath();
  fillStroke(ctx, fill, P.ink, 2.5);
  ctx.fillStyle = P.verm; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, x, y + size * 0.05);
  ctx.restore();
}
export function magnifier(ctx, x, y, r, rot = 0.7) {
  ctx.save(); ctx.translate(x, y);
  ctx.save(); ctx.rotate(rot); rect(ctx, r * 0.95, -r * 0.12, r * 1.2, r * 0.24, P.brown, P.ink, 2); ctx.restore();
  circle(ctx, 0, 0, r, 'rgba(210,235,240,0.25)', P.goldDark, Math.max(4, r * 0.12));
  ctx.beginPath(); ctx.arc(0, 0, r * 0.75, Math.PI * 1.1, Math.PI * 1.45); stroke(ctx, 'rgba(255,255,255,0.8)', Math.max(2, r * 0.06));
  ctx.restore();
}
export function drum(ctx, x, y, s = 1, t = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.ellipse(0, -30, 40, 12, 0, 0, TAU); fillStroke(ctx, P.paperLight, P.ink, 2);
  ctx.beginPath(); ctx.moveTo(-40, -30); ctx.lineTo(-40, 20); ctx.ellipse(0, 20, 40, 12, 0, Math.PI, 0, true); ctx.lineTo(40, -30); fillStroke(ctx, P.verm, P.ink, 2);
  for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-40 + i * 20, -26); ctx.lineTo(-30 + i * 20, 24); stroke(ctx, P.goldLight, 1.5); }
  for (const sd of [-1, 1]) { ctx.save(); ctx.translate(sd * 20, -40); ctx.rotate(sd * (0.4 + 0.3 * Math.sin(t * 12 + sd))); rect(ctx, -2, -40, 4, 40, P.brown, P.ink, 1); ctx.restore(); }
  ctx.restore();
}

// ---------- Christmas & the studio ----------
export function reindeer(ctx, x, y, s = 1, t = 0, phase = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const gal = Math.sin(t * 10 + phase);
  for (const [lx, d] of [[-24, gal], [-12, -gal], [18, gal], [30, -gal]]) { ctx.beginPath(); ctx.moveTo(lx, -10); ctx.lineTo(lx + d * 12, 22); stroke(ctx, '#5a3a22', 5); }
  ctx.beginPath(); ctx.ellipse(0, -16, 40, 18, 0, 0, TAU); fillStroke(ctx, '#a0703f', P.ink, 2);
  ctx.beginPath(); ctx.moveTo(30, -24); ctx.lineTo(46, -48); ctx.lineTo(56, -44); ctx.lineTo(42, -18); ctx.closePath(); fillStroke(ctx, '#a0703f', P.ink, 1.6);
  ellipse(ctx, 56, -50, 12, 8, 0.3, '#a0703f', P.ink, 1.6); circle(ctx, 66, -48, 3.5, P.ink, null);
  for (const dx of [-4, 6]) { ctx.beginPath(); ctx.moveTo(52 + dx, -56); ctx.lineTo(46 + dx, -74); ctx.moveTo(48 + dx, -66); ctx.lineTo(40 + dx, -70); ctx.moveTo(48 + dx, -66); ctx.lineTo(54 + dx, -76); stroke(ctx, '#5a3a22', 2.5); }
  ellipse(ctx, -40, -22, 6, 4, -0.5, P.white, P.ink, 1);
  ctx.restore();
}
export function sleigh(ctx, x, y, s = 1, color = P.verm) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-90, 30); ctx.quadraticCurveTo(-120, 30, -110, 10); ctx.moveTo(-110, 30); ctx.lineTo(90, 30); ctx.quadraticCurveTo(120, 30, 120, 0); stroke(ctx, P.goldDark, 6);
  for (const lx of [-60, 50]) { ctx.beginPath(); ctx.moveTo(lx, 30); ctx.lineTo(lx, 10); stroke(ctx, P.goldDark, 5); }
  ctx.beginPath(); ctx.moveTo(-100, 10); ctx.quadraticCurveTo(-110, -50, -70, -60); ctx.lineTo(-60, -20); ctx.lineTo(70, -20); ctx.quadraticCurveTo(100, -20, 100, 10); ctx.closePath(); fillStroke(ctx, color, P.ink, 2.5);
  ctx.beginPath(); ctx.moveTo(-96, 0); ctx.lineTo(96, 0); stroke(ctx, P.goldLight, 4);
  ctx.restore();
}
// A plain glass soda bottle with a red label (generic, no brand shape).
export function sodaBottle(ctx, x, y, s = 1, rot = 0, labelText = '') {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-10, -120); ctx.lineTo(10, -120); ctx.lineTo(10, -90); ctx.quadraticCurveTo(28, -70, 28, -40); ctx.lineTo(28, 40); ctx.quadraticCurveTo(28, 50, 18, 50); ctx.lineTo(-18, 50); ctx.quadraticCurveTo(-28, 50, -28, 40); ctx.lineTo(-28, -40); ctx.quadraticCurveTo(-28, -70, -10, -90); ctx.closePath();
  fillStroke(ctx, '#4a2a1a', P.ink, 2);
  rect(ctx, -12, -128, 24, 10, P.goldDark, P.ink, 1.2);
  rect(ctx, -28, -20, 56, 40, P.verm, P.ink, 1.5);
  if (labelText) { ctx.fillStyle = P.white; ctx.font = '900 10px Deco'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(labelText, 0, 0); }
  ctx.beginPath(); ctx.moveTo(-18, -60); ctx.lineTo(-18, 30); stroke(ctx, 'rgba(255,255,255,0.35)', 4);
  ctx.restore();
}
export function easel(ctx, x, base, w, h, paint = null) {
  ctx.save(); ctx.translate(x, base);
  for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sx * w * 0.45, 0); ctx.lineTo(sx * w * 0.2, -h - 60); stroke(ctx, P.brown, 8); }
  ctx.beginPath(); ctx.moveTo(0, -h - 60); ctx.lineTo(0, 20); stroke(ctx, P.brown, 6);
  rect(ctx, -w / 2, -h - 40, w, h, P.paperLight, P.ink, 2.5);
  rect(ctx, -w / 2 - 8, -40, w + 16, 14, P.brownLight, P.ink, 1.5);
  if (paint) { ctx.save(); ctx.beginPath(); ctx.rect(-w / 2 + 6, -h - 34, w - 12, h - 12); ctx.clip(); ctx.translate(0, -h / 2 - 40); paint(ctx); ctx.restore(); }
  ctx.restore();
}
// Gilded picture frame with something painted inside.
export function frame(ctx, x, y, w, h, paint = null, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  rect(ctx, -w / 2 - 12, -h / 2 - 12, w + 24, h + 24, P.gold, P.goldDeep, 2);
  ctx.fillStyle = pattern(ctx, 'dots', P.gold, P.goldLight, 12); ctx.fillRect(-w / 2 - 10, -h / 2 - 10, w + 20, h + 20);
  rect(ctx, -w / 2, -h / 2, w, h, P.paperLight, P.goldDeep, 2);
  if (paint) { ctx.save(); ctx.beginPath(); ctx.rect(-w / 2, -h / 2, w, h); ctx.clip(); paint(ctx); ctx.restore(); }
  ctx.restore();
}

// ---------- toys, fire & windmills ----------
// A toy building brick seen from the side: n studs on top; tubes draws the cut-away underside.
export function brick(ctx, x, y, w, color = P.verm, n = 4, tubes = false) {
  const h = w * 0.36, sw = w / n;
  ctx.save(); ctx.translate(x, y);
  for (let i = 0; i < n; i++) { rect(ctx, -w / 2 + i * sw + sw * 0.2, -h / 2 - sw * 0.22, sw * 0.6, sw * 0.24, shade(color, 0.1), P.ink, 1.5); }
  rect(ctx, -w / 2, -h / 2, w, h, color, P.ink, 2);
  ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(-w / 2 + 3, -h / 2 + 3, w - 6, h * 0.18);
  if (tubes) { rect(ctx, -w / 2 + 6, -h / 2 + h * 0.3, w - 12, h * 0.62, shade(color, -0.35), P.ink, 1); for (let i = 1; i < n; i++) circle(ctx, -w / 2 + i * sw, h * 0.12, sw * 0.28, color, P.ink, 1.5); }
  ctx.restore();
}
export function woodenDuck(ctx, x, y, s = 1, t = 0, roll = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  for (const wx of [-26, 26]) { ctx.save(); ctx.translate(wx, 8); ctx.rotate(roll); circle(ctx, 0, 0, 14, P.brown, P.ink, 2); ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(12, 0); ctx.moveTo(0, -12); ctx.lineTo(0, 12); stroke(ctx, P.ink, 1.5); ctx.restore(); }
  rect(ctx, -44, -8, 88, 12, P.brownLight, P.ink, 1.5);
  ctx.beginPath(); ctx.moveTo(-40, -8); ctx.quadraticCurveTo(-50, -50, -10, -48); ctx.quadraticCurveTo(10, -46, 20, -30); ctx.quadraticCurveTo(40, -30, 36, -8); ctx.closePath(); fillStroke(ctx, P.ochreLight, P.ink, 2);
  ctx.beginPath(); ctx.moveTo(-10, -40); ctx.quadraticCurveTo(10, -36, 18, -24); stroke(ctx, '#c9a36a', 3);
  circle(ctx, 22, -54, 18, P.ochreLight, P.ink, 2); circle(ctx, 28, -58, 3, P.ink, null);
  poly(ctx, [[38, -54], [56, -50], [38, -46]], P.ochre, P.ink, 1.5);
  ctx.beginPath(); ctx.moveTo(44, -4); ctx.quadraticCurveTo(90, -10 + Math.sin(t * 4) * 6, 130, -30); stroke(ctx, P.verm, 2);
  ctx.restore();
}
export function yoyo(ctx, x, y, r, t = 0, drop = 0) {
  ctx.save(); ctx.translate(x, y);
  ctx.beginPath(); ctx.moveTo(0, -drop - 40); ctx.lineTo(0, 0); stroke(ctx, P.ink, 1.5);
  ctx.rotate(t * 8);
  circle(ctx, 0, 0, r, P.verm, P.ink, 2); circle(ctx, 0, 0, r * 0.65, P.ochreLight, P.ink, 1.2);
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; ctx.beginPath(); ctx.moveTo(Math.cos(a) * r * 0.3, Math.sin(a) * r * 0.3); ctx.lineTo(Math.cos(a) * r * 0.62, Math.sin(a) * r * 0.62); stroke(ctx, P.brown, 2); }
  circle(ctx, 0, 0, r * 0.18, P.brown, P.ink, 1);
  ctx.restore();
}
// A row of flames across a width; k 0..1 height.
export function flames(ctx, x, base, w, k = 1, t = 0) {
  if (k <= 0) return;
  const n = Math.max(3, Math.round(w / 40));
  for (let i = 0; i < n; i++) {
    const fx = x - w / 2 + (i + 0.5) * w / n, f = k * (1 + 0.25 * Math.sin(t * 13 + i * 2.1)), hh = (90 + (i % 3) * 40) * f;
    for (const [c, sc] of [[P.verm, 1], [P.ochre, 0.7], [P.goldLight, 0.4]]) { ctx.beginPath(); ctx.moveTo(fx - 24 * sc, base); ctx.quadraticCurveTo(fx - 30 * sc, base - hh * 0.5 * sc, fx + Math.sin(t * 9 + i) * 8, base - hh * sc); ctx.quadraticCurveTo(fx + 30 * sc, base - hh * 0.5 * sc, fx + 24 * sc, base); ctx.closePath(); fillStroke(ctx, c, sc === 1 ? P.ink : null, 1); }
  }
}
export function windmill(ctx, x, base, s = 1, t = 0) {
  ctx.save(); ctx.translate(x, base); ctx.scale(s, s);
  poly(ctx, [[-50, 0], [-34, -200], [34, -200], [50, 0]], P.white, P.ink, 2);
  ctx.beginPath(); ctx.moveTo(-40, -200); ctx.quadraticCurveTo(0, -260, 40, -200); ctx.closePath(); fillStroke(ctx, P.vermDark, P.ink, 2);
  arch(ctx, 0, 0, 30, 60, P.brown);
  ctx.translate(0, -210); ctx.rotate(t * 0.8);
  for (let i = 0; i < 4; i++) { ctx.save(); ctx.rotate(i * Math.PI / 2); rect(ctx, -4, -150, 8, 150, P.brown, P.ink, 1.5); rect(ctx, 4, -140, 30, 110, P.paperLight, P.ink, 1.5); ctx.restore(); }
  circle(ctx, 0, 0, 10, P.goldDark, P.ink, 1.5);
  ctx.restore();
}

// ---------- marks, shoes & gifts ----------
// A curved "motion" stroke, filled as a tapered brush mark; k 0..1 draws it in.
export function curvedStroke(ctx, x, y, s = 1, color = P.ink, k = 1, rot = 0) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.beginPath(); ctx.rect(-120, -80, 250 * clamp(k), 160); ctx.clip();
  ctx.beginPath(); ctx.moveTo(-110, -10); ctx.quadraticCurveTo(-90, 40, -40, 34); ctx.quadraticCurveTo(40, 26, 120, -50); ctx.quadraticCurveTo(30, 0, -40, 14); ctx.quadraticCurveTo(-88, 18, -110, -10); ctx.closePath();
  ctx.fillStyle = color; ctx.fill();
  ctx.restore();
}
// Plain running shoe, side view; mark(ctx) draws on its side panel.
export function sneaker(ctx, x, y, s = 1, color = P.white, mark = null) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-120, 20); ctx.lineTo(130, 20); ctx.quadraticCurveTo(150, 20, 140, 0); ctx.lineTo(-120, 0); ctx.closePath(); fillStroke(ctx, P.white, P.ink, 2);
  ctx.beginPath(); ctx.moveTo(-120, 0); ctx.quadraticCurveTo(-126, -60, -90, -80); ctx.lineTo(-30, -84); ctx.quadraticCurveTo(10, -40, 70, -30); ctx.quadraticCurveTo(140, -24, 140, 0); ctx.closePath(); fillStroke(ctx, color, P.ink, 2.5);
  for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-40 + i * 16, -78 + i * 10); ctx.lineTo(-24 + i * 16, -70 + i * 10); stroke(ctx, P.ink, 2); }
  rect(ctx, -126, 20, 270, 8, P.ink, P.ink, 1);
  if (mark) { ctx.save(); ctx.translate(10, -28); mark(ctx); ctx.restore(); }
  ctx.restore();
}
export function ring(ctx, x, y, r, t = 0, sparkle = 1) {
  ctx.save(); ctx.translate(x, y);
  ctx.beginPath(); ctx.ellipse(0, 0, r, r * 0.45, 0, 0, TAU); ctx.lineWidth = r * 0.18; ctx.strokeStyle = P.ink; ctx.stroke(); ctx.lineWidth = r * 0.12; ctx.strokeStyle = P.goldLight; ctx.stroke();
  poly(ctx, [[0, -r * 0.75], [r * 0.25, -r * 0.45], [0, -r * 0.2], [-r * 0.25, -r * 0.45]], '#dff4ff', P.ink, 1.5);
  if (sparkle > 0) for (let i = 0; i < 4; i++) { const a = t * 2 + i * Math.PI / 2; star(ctx, Math.cos(a) * r * 0.6, -r * 0.5 + Math.sin(a) * r * 0.4, r * 0.12, sparkle * (0.5 + 0.5 * Math.sin(t * 6 + i))); }
  ctx.restore();
}
export function certificate(ctx, x, y, w, rot = 0, title = 'SHARES', line = '') {
  const h = w * 0.7;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  rect(ctx, -w / 2, -h / 2, w, h, '#f3ecd6', P.ink, 2);
  ctx.strokeStyle = P.green; ctx.lineWidth = 6; ctx.strokeRect(-w / 2 + 10, -h / 2 + 10, w - 20, h - 20);
  ctx.fillStyle = P.green; ctx.font = `900 ${Math.round(w * 0.09)}px Deco`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(title, 0, -h * 0.25);
  if (line) { ctx.fillStyle = P.ink; ctx.font = `700 ${Math.round(w * 0.05)}px Fell`; ctx.fillText(line, 0, -h * 0.05); }
  for (let i = 0; i < 2; i++) { ctx.beginPath(); ctx.moveTo(-w * 0.35, h * 0.12 + i * h * 0.12); ctx.lineTo(w * 0.35, h * 0.12 + i * h * 0.12); stroke(ctx, P.grey, 1.5); }
  ctx.restore();
}

// ---------- city nights & time ----------
export function fireworks(ctx, x, y, r, k, color = P.goldLight, seed = 1) {
  if (k <= 0 || k >= 1.2) return;
  const R = rng(seed), n = 18, a = clamp(1.2 - k);
  ctx.save(); ctx.translate(x, y); ctx.globalAlpha *= a;
  for (let i = 0; i < n; i++) { const ang = i / n * TAU + R() * 0.2, d = r * ease.outCubic(clamp(k)); ctx.beginPath(); ctx.moveTo(Math.cos(ang) * d * 0.55, Math.sin(ang) * d * 0.55 + k * 10); ctx.lineTo(Math.cos(ang) * d, Math.sin(ang) * d + k * 20); stroke(ctx, i % 2 ? color : P.white, 3); star(ctx, Math.cos(ang) * d, Math.sin(ang) * d + k * 20, 5, 1); }
  ctx.restore();
}
// The narrow wedge-shaped Times Tower; h = height (rise animates it).
export function wedgeTower(ctx, x, base, w, h, lit = 0) {
  ctx.save(); ctx.translate(x, base);
  poly(ctx, [[-w / 2, 0], [-w * 0.42, -h], [w * 0.42, -h], [w / 2, 0]], '#d8c9a8', P.ink, 2.5);
  for (let r = 1; r < Math.floor(h / 44); r++) for (let c = 0; c < 3; c++) rect(ctx, -w * 0.32 + c * w * 0.24, -r * 44 - 8, w * 0.14, 22, lit > 0 ? (((r + c) % 3) ? P.goldLight : '#5a5f7a') : P.lapis, P.ink, 1);
  rect(ctx, -w * 0.46, -h - 20, w * 0.92, 20, '#c9b890', P.ink, 2);
  rect(ctx, -w * 0.3, -h - 60, w * 0.6, 40, '#d8c9a8', P.ink, 2);
  ctx.beginPath(); ctx.moveTo(0, -h - 60); ctx.lineTo(0, -h - 220); stroke(ctx, P.ink, 6);
  ctx.restore();
}
// The ball: a lattice sphere of iron and wood studded with bulbs; glow 0..1.
export function timeBall(ctx, x, y, r, t = 0, glow = 1, bulbs = 100) {
  ctx.save(); ctx.translate(x, y);
  if (glow > 0) { const g = ctx.createRadialGradient(0, 0, r * 0.3, 0, 0, r * 2.6); g.addColorStop(0, `rgba(255,240,170,${0.75 * glow})`); g.addColorStop(1, 'rgba(255,240,170,0)'); ctx.fillStyle = g; ctx.fillRect(-r * 2.7, -r * 2.7, r * 5.4, r * 5.4); }
  circle(ctx, 0, 0, r, '#6a4a2a', P.ink, 3);
  ctx.strokeStyle = '#3a3a3a'; ctx.lineWidth = Math.max(2, r * 0.05);
  for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.ellipse(0, 0, r * Math.abs(Math.cos(i * 0.6)) || 1, r, 0, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.ellipse(0, 0, r, r * Math.abs(Math.cos(i * 0.6)) || 1, 0, 0, TAU); ctx.stroke(); }
  const R = rng(7), n = Math.min(bulbs, 100);
  for (let i = 0; i < n; i++) { const a = R() * TAU, d = Math.sqrt(R()) * r * 0.92; circle(ctx, Math.cos(a) * d, Math.sin(a) * d, Math.max(1.5, r * 0.045), (0.5 + 0.5 * Math.sin(t * 7 + i)) * glow > 0.25 ? '#fff6c8' : '#8a7a5a', null); }
  ctx.restore();
}
export function clockFace(ctx, x, y, r, hour = 12, minute = 0, color = P.paperLight) {
  ctx.save(); ctx.translate(x, y);
  circle(ctx, 0, 0, r, color, P.goldDark, Math.max(3, r * 0.08));
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; ctx.beginPath(); ctx.moveTo(Math.sin(a) * r * 0.78, -Math.cos(a) * r * 0.78); ctx.lineTo(Math.sin(a) * r * 0.9, -Math.cos(a) * r * 0.9); stroke(ctx, P.ink, Math.max(1.5, r * 0.04)); }
  const ha = (hour % 12 + minute / 60) / 12 * TAU, ma = minute / 60 * TAU;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(ha) * r * 0.5, -Math.cos(ha) * r * 0.5); stroke(ctx, P.ink, Math.max(3, r * 0.08));
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(ma) * r * 0.75, -Math.cos(ma) * r * 0.75); stroke(ctx, P.ink, Math.max(2, r * 0.05));
  circle(ctx, 0, 0, r * 0.06, P.ink, null);
  ctx.restore();
}
export function streetSign(ctx, x, y, w, text, color = P.green, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  rect(ctx, -w / 2, -w * 0.11, w, w * 0.22, color, P.ink, 2.5);
  ctx.strokeStyle = P.white; ctx.lineWidth = 2; ctx.strokeRect(-w / 2 + 6, -w * 0.11 + 6, w - 12, w * 0.22 - 12);
  ctx.fillStyle = P.white; ctx.font = `900 ${Math.round(w * 0.085)}px Deco`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 0, 2);
  ctx.restore();
}

// ---------- Mickey Mouse story: generic animals, train, steamboat, cinema ----------
// A field mouse in profile, the way miniatures paint animals (not any studio's character).
// sketch = 1 draws it as ink lines on paper; run = phase for the legs; t sways the tail.
export function mouse(ctx, x, y, s = 1, o = {}) {
  const t = o.t || 0, sk = o.sketch || 0, body = sk ? 'rgba(0,0,0,0)' : (o.color || '#8a7a6a'), belly = sk ? 'rgba(0,0,0,0)' : '#d9c8a8', line = sk ? P.ink : P.ink;
  const run = o.run ?? null, up = o.up || 0;
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (o.face || 1), s);
  // tail
  ctx.beginPath(); ctx.moveTo(-70, -30); ctx.bezierCurveTo(-130, -20 + Math.sin(t * 3) * 10, -150, -90 + Math.sin(t * 3 + 1) * 15, -110, -110); stroke(ctx, line, 3); ctx.beginPath(); ctx.moveTo(-70, -30); ctx.bezierCurveTo(-130, -20 + Math.sin(t * 3) * 10, -150, -90 + Math.sin(t * 3 + 1) * 15, -110, -110); stroke(ctx, sk ? P.ink : '#d8a9a0', 1.5);
  // legs
  const lp = run != null ? Math.sin(run) * 12 : 0;
  for (const [dx, d] of [[-40, lp], [30, -lp]]) { ctx.beginPath(); ctx.moveTo(dx, -20); ctx.lineTo(dx + d, 0); ctx.lineTo(dx + d + 12, 0); stroke(ctx, line, 3); }
  ctx.save(); ctx.rotate(-up);
  // body
  ellipse(ctx, 0, -42, 78, 42, -0.08, body, line, 2.5);
  ellipse(ctx, 8, -26, 50, 18, -0.05, belly, null);
  // head
  ctx.beginPath(); ctx.moveTo(48, -78); ctx.quadraticCurveTo(110, -70, 118, -50); ctx.quadraticCurveTo(100, -34, 52, -30); ctx.closePath(); fillStroke(ctx, body, line, 2.5);
  circle(ctx, 118, -50, 6, sk ? null : '#c9786c', line, 1.5);
  // ear: a small rounded leaf-shaped ear, set back on the head
  ellipse(ctx, 58, -88, 16, 22, -0.4, sk ? null : '#b8a090', line, 2);
  ellipse(ctx, 58, -86, 9, 13, -0.4, sk ? null : '#d8a9a0', null);
  // eye + whiskers
  circle(ctx, 88, -60, 4.5, P.ink, null); circle(ctx, 89.5, -61.5, 1.4, P.white, null);
  for (const a of [-0.25, 0, 0.25]) { ctx.beginPath(); ctx.moveTo(112, -48); ctx.lineTo(112 + Math.cos(a) * 34, -48 + Math.sin(a) * 26); stroke(ctx, line, 1); }
  // front paw
  ctx.beginPath(); ctx.moveTo(60, -34); ctx.lineTo(70 - lp * 0.5, -4); stroke(ctx, line, 3);
  ctx.restore();
  ctx.restore();
}
// A hare sitting in profile with long ears; droop 0..1 lowers the ears (sad).
export function rabbit(ctx, x, y, s = 1, o = {}) {
  const t = o.t || 0, droop = o.droop || 0, c = o.color || '#b89a74';
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (o.face || 1), s);
  ellipse(ctx, -10, -60, 70, 60, 0, c, P.ink, 2.5);
  circle(ctx, -78, -50, 16, P.white, P.ink, 2);
  ellipse(ctx, 30, -10, 40, 12, 0, shade(c, -0.15), P.ink, 2);
  // head
  ellipse(ctx, 50, -125, 38, 32, 0.2, c, P.ink, 2.5);
  // ears
  for (const [dx, k] of [[30, 1], [44, 0.85]]) { ctx.save(); ctx.translate(dx, -150); ctx.rotate(lerp(-0.15, -1.9, droop) * k + Math.sin(t * 2 + dx) * 0.04); ellipse(ctx, 0, -48, 13, 50, 0, c, P.ink, 2); ellipse(ctx, 0, -48, 6, 38, 0, '#e3b2a6', null); ctx.restore(); }
  circle(ctx, 62, -132, 4.5, P.ink, null); circle(ctx, 63.5, -133.5, 1.4, P.white, null);
  circle(ctx, 86, -118, 4, '#c9786c', null);
  ctx.restore();
}
// A steam locomotive pulling one carriage; t turns the wheels, smoke puffs from the stack.
export function train(ctx, x, y, s = 1, t = 0, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const roll = t * 6;
  // carriage
  if (o.carriage !== false) {
    rect(ctx, -560, -190, 300, 150, o.coach || P.greenDark, P.ink, 2.5);
    rect(ctx, -570, -205, 320, 18, P.brown, P.ink, 2);
    for (let i = 0; i < 4; i++) rect(ctx, -540 + i * 70, -165, 48, 56, o.lit ? P.goldLight : P.paperLight, P.ink, 1.8);
    for (const wx of [-520, -300]) wheel(wx);
    rect(ctx, -262, -70, 50, 10, P.ink, null);
  }
  // locomotive: cab, boiler, stack, cow-catcher
  rect(ctx, -210, -210, 110, 170, P.verm, P.ink, 2.5); rect(ctx, -220, -225, 130, 18, P.ink, P.ink, 1);
  rect(ctx, -190, -185, 70, 55, P.goldLight, P.ink, 1.8);
  rect(ctx, -100, -150, 220, 100, '#2a2f45', P.ink, 2.5);
  for (const bx of [-60, 0, 60]) { ctx.beginPath(); ctx.moveTo(bx, -150); ctx.lineTo(bx, -50); stroke(ctx, P.gold, 3); }
  rect(ctx, 60, -215, 36, 65, '#2a2f45', P.ink, 2.5); rect(ctx, 50, -228, 56, 16, P.gold, P.ink, 2);
  circle(ctx, -20, -162, 16, P.gold, P.ink, 2);
  poly(ctx, [[120, -50], [175, -10], [120, -10]], P.verm, P.ink, 2);
  circle(ctx, 120, -120, 12, P.goldLight, P.ink, 2);
  for (const wx of [-170, -60, 50]) wheel(wx, wx === -170 ? 44 : 34);
  ctx.beginPath(); ctx.moveTo(-170, -40); ctx.lineTo(50, -40); stroke(ctx, P.steel, 6);
  // smoke
  if (o.smoke !== false) for (let i = 0; i < 5; i++) { const k = (t * 0.8 + i / 5) % 1; ctx.save(); ctx.globalAlpha *= 1 - k; cloud(ctx, 78 - k * 320, -250 - k * 160, 0.35 + k * 0.6, i + 40); ctx.restore(); }
  ctx.restore();
  function wheel(wx, r = 36) { ctx.save(); ctx.translate(wx, -36 + (36 - r) * 0 ); circle(ctx, 0, 0, r, P.verm, P.ink, 2.5); for (let i = 0; i < 6; i++) { const a = roll + i / 6 * TAU; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); stroke(ctx, P.ink, 2); } circle(ctx, 0, 0, r * 0.2, P.gold, P.ink, 1.5); ctx.restore(); }
}
// A generic river steamboat: two stacks, a white deck house and a turning paddle wheel.
export function steamboat(ctx, x, y, s = 1, t = 0, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(Math.sin(t * 1.3) * 0.02);
  // paddle wheel at the stern
  ctx.save(); ctx.translate(-250, -40); circle(ctx, 0, 0, 70, P.verm, P.ink, 2.5); for (let i = 0; i < 8; i++) { const a = t * 2 + i / 8 * TAU; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * 70, Math.sin(a) * 70); stroke(ctx, P.ink, 4); } ctx.restore();
  // hull
  ctx.beginPath(); ctx.moveTo(-260, -40); ctx.lineTo(250, -40); ctx.quadraticCurveTo(250, 20, 180, 30); ctx.lineTo(-230, 30); ctx.closePath(); fillStroke(ctx, o.hull || P.ink, P.ink, 2.5);
  ctx.beginPath(); ctx.moveTo(-250, -28); ctx.lineTo(245, -28); stroke(ctx, P.verm, 5);
  // decks
  rect(ctx, -200, -130, 330, 90, P.white, P.ink, 2.5); rect(ctx, -150, -200, 220, 70, P.white, P.ink, 2.5);
  for (let i = 0; i < 7; i++) arch(ctx, -175 + i * 46, -55, 26, 52, P.lapis);
  for (let i = 0; i < 4; i++) rect(ctx, -130 + i * 52, -185, 30, 34, P.goldLight, P.ink, 1.5);
  rect(ctx, -60, -250, 90, 50, P.white, P.ink, 2.5);
  // stacks
  for (const sx of [70, 120]) { rect(ctx, sx, -330, 30, 200, '#2a2f45', P.ink, 2.5); rect(ctx, sx - 8, -345, 46, 16, P.gold, P.ink, 2); }
  if (o.smoke !== false) for (let i = 0; i < 6; i++) { const k = (t * 0.5 + i / 6) % 1; ctx.save(); ctx.globalAlpha *= 1 - k; cloud(ctx, 100 - k * 260, -380 - k * 120, 0.3 + k * 0.5, i + 60); ctx.restore(); }
  ctx.restore();
}
// A picture-house stage: an arch, red curtains drawn open by k, the screen painted by paint(ctx, w, h).
export function cinema(ctx, x, y, w, h, k = 1, paint = null) {
  ctx.save(); ctx.translate(x, y);
  rect(ctx, -w / 2 - 40, -h / 2 - 70, w + 80, h + 110, P.vermDark, P.ink, 3);
  ctx.beginPath(); ctx.moveTo(-w / 2 - 20, h / 2 + 20); ctx.lineTo(-w / 2 - 20, -h / 2 - 10); ctx.quadraticCurveTo(0, -h / 2 - 90, w / 2 + 20, -h / 2 - 10); ctx.lineTo(w / 2 + 20, h / 2 + 20); fillStroke(ctx, P.goldLight, P.goldDark, 4);
  rect(ctx, -w / 2, -h / 2, w, h, '#f3f0e6', P.ink, 2.5);
  if (paint) { ctx.save(); ctx.beginPath(); ctx.rect(-w / 2, -h / 2, w, h); ctx.clip(); paint(ctx, w, h); ctx.restore(); }
  const cw = (w / 2 + 10) * (1 - k * 0.82);
  for (const sx of [-1, 1]) { ctx.save(); ctx.scale(sx, 1); ctx.beginPath(); ctx.moveTo(-w / 2 - 20, -h / 2 - 20); ctx.lineTo(-w / 2 - 20 + cw, -h / 2 - 20); ctx.quadraticCurveTo(-w / 2 - 20 + cw * 0.8, 0, -w / 2 - 20 + cw, h / 2 + 20); ctx.lineTo(-w / 2 - 20, h / 2 + 20); ctx.closePath(); fillStroke(ctx, P.verm, P.ink, 2.5); for (let i = 1; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-w / 2 - 20 + cw * i / 5, -h / 2 - 20); ctx.lineTo(-w / 2 - 20 + cw * i / 5 * 0.95, h / 2 + 20); stroke(ctx, P.vermDark, 2); } ctx.restore(); }
  ctx.restore();
}
// A padlock; open 0..1 lifts the shackle.
export function padlock(ctx, x, y, s = 1, open = 0, color = P.gold) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.save(); ctx.translate(0, -open * 40); ctx.rotate(open * 0.5);
  ctx.beginPath(); ctx.moveTo(-34, 0); ctx.lineTo(-34, -40); ctx.arc(0, -40, 34, Math.PI, 0); ctx.lineTo(34, 0); stroke(ctx, P.ink, 18); stroke(ctx, P.steel, 12);
  ctx.restore();
  rect(ctx, -55, -10, 110, 90, color, P.ink, 3);
  circle(ctx, 0, 25, 11, P.ink, null); poly(ctx, [[-6, 28], [6, 28], [4, 55], [-4, 55]], P.ink, null);
  ctx.restore();
}

// ---------- microwave story: melting sweets, the magnetron, radar, an egg, the first oven ----------
// A wrapped chocolate bar; melt 0..1 slumps it and lets drips fall (generic wrapper, no brand).
export function candyBar(ctx, x, y, s = 1, melt = 0, rot = 0, t = 0, labelText = 'CHOCOLATE') {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  const sag = melt * 26;
  // the bar (bends in the middle as it melts)
  ctx.beginPath(); ctx.moveTo(-110, -22); ctx.quadraticCurveTo(0, -22 + sag * 1.4, 110, -22); ctx.lineTo(110, 22); ctx.quadraticCurveTo(0, 22 + sag * 1.8, -110, 22); ctx.closePath(); fillStroke(ctx, '#5a3218', P.ink, 2.5);
  if (melt < 0.6) for (let i = 0; i < 6; i++) { const bx = -100 + i * 36; ctx.save(); ctx.globalAlpha *= 1 - melt / 0.6; rect(ctx, bx, -16 + sag * 0.6 * Math.sin(Math.PI * (i + 0.5) / 6), 30, 30, '#6e3c1c', '#3a1e0c', 1.2); ctx.restore(); }
  // wrapper over the left half
  ctx.beginPath(); ctx.moveTo(-118, -26); ctx.lineTo(-10, -26 + sag * 0.9); ctx.lineTo(-10, 26 + sag * 1.2); ctx.lineTo(-118, 26); ctx.closePath(); fillStroke(ctx, P.verm, P.ink, 2.5);
  for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-118, -26 + i * 13); ctx.lineTo(-128, -22 + i * 13); stroke(ctx, P.ink, 1.5); }
  ctx.fillStyle = P.goldLight; ctx.font = '900 15px Deco'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(labelText, -64, sag * 0.4);
  // drips
  for (let i = 0; i < 5; i++) { const dx = -4 + i * 26, len = melt * (30 + (i % 3) * 22) * (0.6 + 0.4 * Math.sin(t * 2 + i)); if (len > 2) { ctx.beginPath(); ctx.moveTo(dx - 6, 18 + sag * 1.6); ctx.quadraticCurveTo(dx - 7, 18 + sag * 1.6 + len, dx, 18 + sag * 1.6 + len + 6); ctx.quadraticCurveTo(dx + 7, 18 + sag * 1.6 + len, dx + 6, 18 + sag * 1.6); fillStroke(ctx, '#5a3218', P.ink, 1.2); } }
  ctx.restore();
}
// A cutaway of a cavity magnetron: copper block, ring of cavities, cathode, electrons spiralling.
export function magnetron(ctx, x, y, r, t = 0, on = 1) {
  ctx.save(); ctx.translate(x, y);
  circle(ctx, 0, 0, r, '#c47a3a', P.ink, 3);
  circle(ctx, 0, 0, r * 0.82, '#d9935a', P.ink, 1.5);
  circle(ctx, 0, 0, r * 0.46, '#2a1c12', P.ink, 2);
  for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; circle(ctx, Math.cos(a) * r * 0.64, Math.sin(a) * r * 0.64, r * 0.11, '#2a1c12', P.ink, 1.5); ctx.beginPath(); ctx.moveTo(Math.cos(a) * r * 0.46, Math.sin(a) * r * 0.46); ctx.lineTo(Math.cos(a) * r * 0.54, Math.sin(a) * r * 0.54); stroke(ctx, '#2a1c12', r * 0.06); }
  circle(ctx, 0, 0, r * 0.12, P.steel, P.ink, 1.5);
  if (on > 0) for (let i = 0; i < 12; i++) { const ph = t * 3 + i / 12 * TAU; ctx.beginPath(); for (let j = 0; j <= 20; j++) { const q = j / 20, a = ph + q * 2.4, rr = r * (0.14 + q * 0.3); j ? ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.save(); ctx.globalAlpha *= on * 0.8; stroke(ctx, P.goldLight, 2); ctx.restore(); }
  // the output antenna
  rect(ctx, -r * 0.08, -r - 60, r * 0.16, 60, P.steel, P.ink, 2);
  ctx.restore();
}
// Wavy gold rays from (x0,y0) to (x1,y1); k = how far they have travelled.
export function waveRays(ctx, x0, y0, x1, y1, k = 1, t = 0, n = 3, color = P.goldLight) {
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), a = Math.atan2(dy, dx);
  ctx.save(); ctx.translate(x0, y0); ctx.rotate(a); ctx.lineCap = 'round';
  for (let j = 0; j < n; j++) { const off = (j - (n - 1) / 2) * 26; ctx.beginPath(); for (let i = 0; i <= 60; i++) { const q = i / 60 * k; ctx[i ? 'lineTo' : 'moveTo'](q * L, off + Math.sin(q * L / 18 - t * 10 + j) * 9); } stroke(ctx, P.ink, 6); stroke(ctx, color, 3.5); }
  ctx.restore();
}
// A rotating radar dish on a mast, with an optional sweep scope beside it.
export function radarDish(ctx, x, base, s = 1, t = 0) {
  ctx.save(); ctx.translate(x, base); ctx.scale(s, s);
  poly(ctx, [[-60, 0], [60, 0], [14, -150], [-14, -150]], P.steel, P.ink, 2.5);
  const sq = Math.cos(t * 1.6);
  ctx.save(); ctx.translate(0, -180); ctx.scale(Math.max(0.15, Math.abs(sq)), 1);
  ctx.beginPath(); ctx.ellipse(0, 0, 110, 60, 0, Math.PI * 1.02, Math.PI * 1.98, true); ctx.closePath(); fillStroke(ctx, sq > 0 ? '#c9cfd6' : '#9aa4b0', P.ink, 2.5);
  for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(i * 40, 0); ctx.lineTo(i * 30, 50); stroke(ctx, P.ink, 1.2); }
  ctx.restore();
  ctx.beginPath(); ctx.moveTo(0, -180); ctx.lineTo(0, -240); stroke(ctx, P.ink, 4); circle(ctx, 0, -244, 8, P.verm, P.ink, 2);
  ctx.restore();
}
export function radarScope(ctx, x, y, r, t = 0, blips = []) {
  ctx.save(); ctx.translate(x, y);
  circle(ctx, 0, 0, r + 14, P.steel, P.ink, 3); circle(ctx, 0, 0, r, '#0e2a1c', P.ink, 2);
  for (const k of [0.33, 0.66]) circle(ctx, 0, 0, r * k, null, 'rgba(120,230,150,0.35)', 1.5);
  const a = t * 2.2;
  ctx.save(); ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r, a - 0.7, a); ctx.closePath(); const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r); g.addColorStop(0, 'rgba(120,255,160,0.05)'); g.addColorStop(1, 'rgba(120,255,160,0.45)'); ctx.fillStyle = g; ctx.fill(); ctx.restore();
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); stroke(ctx, '#9cffb8', 2.5);
  for (const [bx, by] of blips) circle(ctx, bx * r, by * r, 5, '#c8ffd8', null);
  ctx.restore();
}
// An egg in a cup; crack 0..1, burst 0..1 throws shell and yolk outwards.
export function egg(ctx, x, y, s = 1, crack = 0, burst = 0, seed = 5) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  // cup
  ctx.beginPath(); ctx.moveTo(-40, 0); ctx.quadraticCurveTo(-40, 40, 0, 44); ctx.quadraticCurveTo(40, 40, 40, 0); ctx.closePath(); fillStroke(ctx, P.lapisLight, P.ink, 2.5);
  rect(ctx, -24, 44, 48, 12, P.lapisLight, P.ink, 2);
  if (burst <= 0) {
    ctx.beginPath(); ctx.ellipse(0, -34, 32, 44, 0, 0, TAU); fillStroke(ctx, '#f6ecd8', P.ink, 2.5);
    if (crack > 0) { ctx.beginPath(); ctx.moveTo(-30, -40); const n = Math.ceil(crack * 6); for (let i = 1; i <= n; i++) ctx.lineTo(-30 + i * 10, -40 + (i % 2 ? -8 : 6)); stroke(ctx, P.ink, 2); }
  } else {
    const R = rng(seed);
    for (let i = 0; i < 14; i++) { const a = R() * TAU, d = burst * (80 + R() * 160); ctx.save(); ctx.translate(Math.cos(a) * d, -40 + Math.sin(a) * d * 0.8 + burst * burst * 60); ctx.rotate(a * 3 + burst * 4); poly(ctx, [[-10, -6], [12, -4], [4, 10]], '#f6ecd8', P.ink, 1.5); ctx.restore(); }
    for (let i = 0; i < 10; i++) { const a = R() * TAU, d = burst * (60 + R() * 120); circle(ctx, Math.cos(a) * d, -40 + Math.sin(a) * d * 0.8, 6 + R() * 10, i % 3 ? '#f2b62a' : '#fff8e6', P.ink, 1); }
  }
  ctx.restore();
}
// The first microwave oven: a tall steel cabinet (no brand), door window glowing when on.
export function bigOven(ctx, x, base, s = 1, on = 0, t = 0) {
  ctx.save(); ctx.translate(x, base); ctx.scale(s, s);
  rect(ctx, -110, -560, 220, 560, '#b9c2cc', P.ink, 3);
  rect(ctx, -110, -560, 220, 40, '#9aa4b0', P.ink, 2);
  rect(ctx, -80, -470, 160, 150, '#2a2f45', P.ink, 2.5);
  if (on > 0) { ctx.save(); ctx.globalAlpha *= on; rect(ctx, -74, -464, 148, 138, '#ffd98a', null); bowl(ctx, 0, -360, 0.5, t, P.white, true); ctx.restore(); }
  rect(ctx, 86, -470, 10, 150, P.steel, P.ink, 1.5);
  for (let i = 0; i < 3; i++) circle(ctx, -50 + i * 50, -280, 16, P.ochreLight, P.ink, 2);
  for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(-90, -220 + i * 30); ctx.lineTo(90, -220 + i * 30); stroke(ctx, '#8a949e', 3); }
  rect(ctx, -110, -14, 220, 14, '#6f7a86', P.ink, 2);
  ctx.restore();
}
// A small modern countertop microwave (generic) for the ending.
export function smallOven(ctx, x, y, s = 1, on = 1, t = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rect(ctx, -90, -55, 180, 110, '#e8e2d6', P.ink, 2.5);
  rect(ctx, -76, -42, 110, 84, on ? '#ffd98a' : '#2a2f45', P.ink, 2);
  if (on) circle(ctx, -21, 14 + Math.sin(t * 3) * 2, 14, P.verm, P.ink, 1.5);
  for (let i = 0; i < 4; i++) rect(ctx, 46, -36 + i * 18, 30, 10, '#b9c2cc', P.ink, 1);
  ctx.restore();
}
// A measuring rod in gold with tick marks (for "Book of Wonders" measurements).
export function measureRod(ctx, x, yTop, yBot, k = 1, text = '') {
  const y = lerp(yBot, yTop, clamp(k));
  ctx.save(); ctx.beginPath(); ctx.moveTo(x, yBot); ctx.lineTo(x, y); stroke(ctx, P.ink, 8); stroke(ctx, P.gold, 5);
  for (let yy = yBot; yy > y; yy -= 30) { ctx.beginPath(); ctx.moveTo(x - 12, yy); ctx.lineTo(x + 12, yy); stroke(ctx, P.ink, 2); }
  poly(ctx, [[x - 14, y], [x + 14, y], [x, y - 18]], P.gold, P.ink, 2);
  ctx.restore();
}

// ---------- Statue of Liberty story ----------
// mix two #rrggbb colours (k = 0 → a, 1 → b)
export function mixColor(a, b, k) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16), q = clamp(k);
  const c = [16, 8, 0].map(sh => Math.round(((pa >> sh) & 255) * (1 - q) + ((pb >> sh) & 255) * q));
  return '#' + c.map(v => v.toString(16).padStart(2, '0')).join('');
}
export const COPPER = { new: '#d77a3e', brown: '#6e4024', green: '#79b8a0' };
// the statue as a miniature painter would draw her: robe, rayed crown, raised torch,
// tablet; metal = her colour, shine 0..1 adds a polished glint. Base at (x, base); about 800·s tall.
export function liberty(ctx, x, base, s = 1, o = {}) {
  const metal = o.metal || COPPER.green, dark = shade(metal, -0.28), light = shade(metal, 0.25), t = o.t || 0;
  ctx.save(); ctx.translate(x, base); ctx.scale(s, s);
  // raised right arm and torch
  ctx.beginPath(); ctx.moveTo(30, -500); ctx.quadraticCurveTo(70, -600, 60, -700); ctx.lineTo(90, -700); ctx.quadraticCurveTo(100, -600, 60, -495); ctx.closePath(); fillStroke(ctx, metal, P.ink, 2.5);
  rect(ctx, 56, -760, 38, 64, metal, P.ink, 2.5); rect(ctx, 48, -772, 54, 14, dark, P.ink, 2);
  ctx.beginPath(); ctx.moveTo(52, -772); ctx.quadraticCurveTo(48, -830, 75, -860); ctx.quadraticCurveTo(102, -830, 98, -772); ctx.closePath(); fillStroke(ctx, o.flame || P.goldLight, P.ink, 2);
  if (o.glow) { const g = ctx.createRadialGradient(75, -815, 5, 75, -815, 90); g.addColorStop(0, `rgba(255,230,150,${0.6 * o.glow})`); g.addColorStop(1, 'rgba(255,230,150,0)'); ctx.fillStyle = g; ctx.fillRect(-15, -905, 180, 180); }
  // gown with folds
  ctx.beginPath(); ctx.moveTo(-62, -515); ctx.quadraticCurveTo(-80, -300, -118, 0); ctx.lineTo(118, 0); ctx.quadraticCurveTo(84, -300, 62, -515); ctx.closePath(); fillStroke(ctx, metal, P.ink, 2.5);
  for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(i * 14, -470); ctx.quadraticCurveTo(i * 22 + Math.sin(i) * 8, -240, i * 32, -4); stroke(ctx, dark, 2); }
  // toga draped over the left shoulder
  ctx.beginPath(); ctx.moveTo(-64, -510); ctx.quadraticCurveTo(10, -430, 64, -300); ctx.lineTo(70, -250); ctx.quadraticCurveTo(0, -380, -70, -440); ctx.closePath(); fillStroke(ctx, light, P.ink, 2);
  // left arm and the tablet
  ctx.save(); ctx.translate(-70, -400); ctx.rotate(-0.18);
  rect(ctx, -42, -70, 70, 130, metal, P.ink, 2.5); ctx.fillStyle = dark; ctx.font = '700 11px Garamond'; ctx.textAlign = 'center'; ctx.fillText('JULY IV', -7, -10); ctx.fillText('MDCCLXXVI', -7, 6);
  ctx.restore();
  // head, face, crown with seven rays
  circle(ctx, 0, -556, 36, metal, P.ink, 2.5);
  ctx.beginPath(); ctx.moveTo(-10, -560); ctx.lineTo(-4, -560); ctx.moveTo(4, -560); ctx.lineTo(10, -560); ctx.moveTo(0, -556); ctx.lineTo(0, -546); stroke(ctx, P.ink, 1.6);
  rect(ctx, -38, -592, 76, 16, dark, P.ink, 2);
  for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * 0.32; poly(ctx, [[Math.cos(a - 0.08) * 36, -584 + Math.sin(a - 0.08) * 36], [Math.cos(a) * 92, -584 + Math.sin(a) * 92], [Math.cos(a + 0.08) * 36, -584 + Math.sin(a + 0.08) * 36]], metal, P.ink, 1.8); }
  if (o.shine) { ctx.save(); ctx.globalAlpha *= o.shine; ctx.globalCompositeOperation = 'screen'; const sx = -120 + ((t * 120) % 360); const g = ctx.createLinearGradient(sx - 40, 0, sx + 40, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,240,210,0.7)'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fillRect(-130, -870, 260, 870); ctx.restore(); }
  ctx.restore();
}
// The star-shaped fort and stone pedestal she stands on.
export function libertyPedestal(ctx, x, top, s = 1) {
  ctx.save(); ctx.translate(x, top); ctx.scale(s, s);
  poly(ctx, [[-90, 0], [90, 0], [110, 260], [-110, 260]], '#d8c9a8', P.ink, 2.5);
  for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-90 - i * 5, i * 65); ctx.lineTo(90 + i * 5, i * 65); stroke(ctx, '#b9a888', 2); }
  rect(ctx, -60, 60, 120, 70, '#c9b890', P.ink, 2);
  poly(ctx, [[-200, 260], [200, 260], [240, 330], [0, 370], [-240, 330]], '#bcae8e', P.ink, 2.5);
  ctx.restore();
}
// a copper penny (one cent), with a moving glint
export function penny(ctx, x, y, r, t = 0, color = COPPER.new) {
  ctx.save(); ctx.translate(x, y);
  circle(ctx, 0, 0, r, color, P.ink, 2.5); circle(ctx, 0, 0, r * 0.84, null, shade(color, -0.25), 2);
  ctx.fillStyle = shade(color, -0.35); ctx.font = `900 ${Math.round(r * 0.34)}px Deco`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('ONE', 0, -r * 0.18); ctx.fillText('CENT', 0, r * 0.22);
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.clip(); ctx.globalCompositeOperation = 'screen'; const sx = -r * 2 + ((t * r * 2) % (r * 4)); const g = ctx.createLinearGradient(sx - r * 0.3, -r, sx + r * 0.3, r); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,240,210,0.8)'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fillRect(-r, -r, r * 2, r * 2); ctx.restore();
  ctx.restore();
}
// a paint bucket with a brush
export function paintBucket(ctx, x, y, s = 1, color = COPPER.new, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  poly(ctx, [[-40, -50], [40, -50], [32, 30], [-32, 30]], '#9aa4b0', P.ink, 2.5);
  ctx.beginPath(); ctx.ellipse(0, -50, 40, 10, 0, 0, TAU); fillStroke(ctx, color, P.ink, 2);
  ctx.beginPath(); ctx.arc(0, -50, 44, Math.PI * 1.05, Math.PI * 1.95); stroke(ctx, P.ink, 3);
  ctx.beginPath(); ctx.moveTo(10, -50); ctx.lineTo(40, -120); stroke(ctx, P.brownLight, 6); rect(ctx, 34, -134, 14, 18, P.ink, P.ink, 1);
  ctx.restore();
}

// ---------- Karagöz shadow puppets (the "karagoz" storytelling device) ----------
// A flat, jointed leather puppet in profile, pierced with light holes and held on a rod
// from below, the way Karagöz figures are. o: face (1 right, -1 left), robe, trim, skin,
// hat ('bun' | 'fedora' | 'bowler' | 'cap' | 'bald'), beard, t (time), walk (leg swing),
// arm (0 down … 1 raised), talk (0..1 jaw), tilt (whole-body sway), rod (false hides it).
export function puppet(ctx, x, y, s = 1, o = {}) {
  const f = o.face || 1, t = o.t || 0, robe = o.robe || P.verm, trim = o.trim || P.goldLight, skin = o.skin || '#e8c49a';
  const walk = o.walk ?? 0, sway = Math.sin(t * 2.2) * 0.03 + (o.tilt || 0), talk = clamp(o.talk || 0) * (0.5 + 0.5 * Math.sin(t * 18));
  ctx.save(); ctx.translate(x, y); ctx.rotate(sway); ctx.scale(s * f, s);
  const holes = (cx, cy, w, h, n = 6) => { for (let i = 0; i < n; i++) circle(ctx, cx + ((i * 37) % w) - w / 2, cy + ((i * 53) % h) - h / 2, 3.2, 'rgba(255,248,220,0.85)', null); };
  // the rod (held from below, behind the screen)
  if (o.rod !== false) { ctx.beginPath(); ctx.moveTo(-8, -120); ctx.lineTo(-60, 220); stroke(ctx, 'rgba(40,24,12,0.75)', 6); }
  // legs: two hinged pieces
  for (const [k, c] of [[-1, shade(robe, -0.25)], [1, robe]]) {
    ctx.save(); ctx.translate(k * 8, -62); ctx.rotate(Math.sin(t * 6 + (k > 0 ? 0 : Math.PI)) * 0.28 * walk);
    poly(ctx, [[-14, 0], [14, 0], [12, 58], [24, 62], [-12, 62]], c, P.ink, 2.2); holes(0, 26, 18, 30, 3);
    ctx.restore();
  }
  // body
  ctx.beginPath(); ctx.moveTo(-26, -150); ctx.quadraticCurveTo(-36, -100, -30, -58); ctx.lineTo(34, -58); ctx.quadraticCurveTo(38, -110, 24, -150); ctx.closePath(); fillStroke(ctx, robe, P.ink, 2.5);
  ctx.beginPath(); ctx.moveTo(-30, -66); ctx.lineTo(34, -66); stroke(ctx, trim, 6); holes(0, -110, 40, 60, 7);
  if (o.tie) { poly(ctx, [[14, -148], [22, -148], [24, -104], [18, -98], [12, -104]], o.tie, P.ink, 1.5); }
  // head on its neck pivot
  ctx.save(); ctx.translate(2, -150); ctx.rotate(Math.sin(t * 3) * 0.05 + talk * -0.08);
  rect(ctx, -6, -14, 14, 16, skin, P.ink, 1.8);
  ctx.beginPath(); ctx.moveTo(-22, -20); ctx.quadraticCurveTo(-26, -62, 4, -66); ctx.quadraticCurveTo(28, -64, 30, -40); ctx.lineTo(40, -32); ctx.lineTo(30, -26); ctx.lineTo(32, -18 + talk * 6); ctx.quadraticCurveTo(10, -6, -22, -20); ctx.closePath(); fillStroke(ctx, skin, P.ink, 2.2);
  circle(ctx, 16, -44, 3.6, P.ink, null); circle(ctx, 17, -45, 1.2, 'rgba(255,248,220,0.9)', null);
  if (o.beard) { ctx.beginPath(); ctx.moveTo(-4, -14); ctx.quadraticCurveTo(20, 10, 30, -18); ctx.quadraticCurveTo(14, -4, -4, -14); fillStroke(ctx, o.beard, P.ink, 1.5); }
  const hat = o.hat || 'cap', hc = o.hatColor || P.lapis;
  if (hat === 'greekhelm') { // bronze hoplite helmet with a horsehair crest
    ctx.beginPath(); ctx.moveTo(-26, -20); ctx.quadraticCurveTo(-30, -70, 4, -72); ctx.quadraticCurveTo(34, -70, 32, -40); ctx.lineTo(26, -36); ctx.lineTo(22, -10); ctx.lineTo(10, -14); ctx.lineTo(12, -40); ctx.lineTo(-10, -40); ctx.lineTo(-14, -20); ctx.closePath(); fillStroke(ctx, hc === P.lapis ? '#c08a3a' : hc, P.ink, 2);
    ctx.beginPath(); ctx.moveTo(-30, -66); ctx.quadraticCurveTo(0, -110, 34, -66); ctx.quadraticCurveTo(0, -88, -30, -66); fillStroke(ctx, o.crest || P.verm, P.ink, 1.5);
  } else if (hat === 'tiara') { // a soft Persian cap with side flaps
    ctx.beginPath(); ctx.moveTo(-26, -24); ctx.quadraticCurveTo(-24, -78, 6, -80); ctx.quadraticCurveTo(14, -62, 30, -46); ctx.lineTo(24, -30); ctx.closePath(); fillStroke(ctx, hc, P.ink, 2);
    ctx.beginPath(); ctx.moveTo(-26, -24); ctx.lineTo(-30, 4); ctx.lineTo(-16, 4); ctx.lineTo(-16, -22); ctx.closePath(); fillStroke(ctx, hc, P.ink, 1.5);
  } else if (hat === 'bun') { circle(ctx, -18, -54, 16, o.hair || '#5a3a2a', P.ink, 2); ctx.beginPath(); ctx.moveTo(-24, -40); ctx.quadraticCurveTo(-6, -78, 26, -56); ctx.lineTo(20, -48); ctx.quadraticCurveTo(0, -60, -24, -40); fillStroke(ctx, o.hair || '#5a3a2a', P.ink, 1.8); ctx.beginPath(); ctx.ellipse(0, -70, 30, 9, -0.1, 0, TAU); fillStroke(ctx, hc, P.ink, 2); flower(ctx, -14, -76, 7, P.pink); }
  else if (hat === 'fedora') { ctx.beginPath(); ctx.ellipse(4, -62, 38, 8, 0, 0, TAU); fillStroke(ctx, hc, P.ink, 2); ctx.beginPath(); ctx.moveTo(-18, -62); ctx.quadraticCurveTo(-16, -94, 6, -92); ctx.quadraticCurveTo(26, -94, 24, -62); ctx.closePath(); fillStroke(ctx, hc, P.ink, 2); rect(ctx, -18, -70, 42, 6, P.ink, null); }
  else if (hat === 'bowler') { ctx.beginPath(); ctx.ellipse(4, -62, 34, 7, 0, 0, TAU); fillStroke(ctx, hc, P.ink, 2); ctx.beginPath(); ctx.arc(4, -64, 22, Math.PI, 0); fillStroke(ctx, hc, P.ink, 2); }
  else if (hat === 'cap') { ctx.beginPath(); ctx.arc(2, -60, 26, Math.PI * 1.05, Math.PI * 1.95); ctx.lineTo(36, -58); ctx.closePath(); fillStroke(ctx, hc, P.ink, 2); }
  else if (hat === 'bald') { ctx.beginPath(); ctx.arc(-8, -52, 14, Math.PI, Math.PI * 1.8); stroke(ctx, o.hair || '#cfcfcf', 6); }
  ctx.restore();
  // the arm, hinged at the shoulder; o.hold(ctx) draws something in the hand
  ctx.save(); ctx.translate(12, -140); ctx.rotate(lerp(0.15, -2.3, clamp(o.arm || 0)) + Math.sin(t * 4) * 0.05);
  rect(ctx, -7, 0, 14, 66, robe, P.ink, 2); circle(ctx, 0, 72, 9, skin, P.ink, 1.8);
  if (o.hold) { ctx.save(); ctx.translate(0, 78); o.hold(ctx); ctx.restore(); }
  ctx.restore();
  ctx.restore();
}
// A square race-around-the-board game seen from above (generic, after the 1904 patent's idea):
// o.title, o.houses (0..1 how many houses are up), o.tokens [{ pos 0..36, color }], o.names (street labels)
export function gameBoard(ctx, x, y, size, o = {}) {
  const n = 9, c = size / (n + 1.5), cs = c * 1.25, colors = [P.verm, P.lapis, P.green, P.ochre, P.lav, P.turq, P.pink, P.brownLight];
  ctx.save(); ctx.translate(x - size / 2, y - size / 2);
  rect(ctx, 0, 0, size, size, '#efe6cf', P.ink, 3);
  const cell = i => { // 36 squares around the edge
    const side = Math.floor(i / 9), k = i % 9;
    if (side === 0) return [size - cs - k * c - (k ? 0 : 0), size - cs, k ? c : cs, cs, 0];
    if (side === 1) return [0, size - cs - k * c, cs, k ? c : cs, 1];
    if (side === 2) return [cs + (k - 1) * c, 0, k ? c : cs, cs, 2];
    return [size - cs, cs + (k - 1) * c, cs, k ? c : cs, 3];
  };
  for (let i = 0; i < 36; i++) {
    let [cx, cy, w, h, side] = cell(i);
    if (i % 9 === 0) { [cx, cy] = [[size - cs, size - cs], [0, size - cs], [0, 0], [size - cs, 0]][side]; w = h = cs; rect(ctx, cx, cy, w, h, P.paperLight, P.ink, 1.5); star(ctx, cx + w / 2, cy + h / 2, cs * 0.22, 1); continue; }
    if (side === 0) cx = size - cs - (i % 9) * c; if (side === 1) cy = size - cs - (i % 9) * c; if (side === 2) cx = cs + (i % 9 - 1) * c; if (side === 3) cy = cs + (i % 9 - 1) * c;
    rect(ctx, cx, cy, side % 2 ? cs : c, side % 2 ? c : cs, P.paperLight, P.ink, 1.2);
    const band = colors[Math.floor(i / 2) % colors.length], bw = cs * 0.26;
    if (side === 0) rect(ctx, cx, cy, c, bw, band, P.ink, 1); else if (side === 1) rect(ctx, cx + cs - bw, cy, bw, c, band, P.ink, 1); else if (side === 2) rect(ctx, cx, cy + cs - bw, c, bw, band, P.ink, 1); else rect(ctx, cx, cy, bw, c, band, P.ink, 1);
    if (o.houses && (i * 7) % 10 < 10 * o.houses && i % 3) { const hx = side % 2 ? cx + cs / 2 : cx + c / 2, hy = side % 2 ? cy + c / 2 : cy + cs / 2; poly(ctx, [[hx - 7, hy + 6], [hx + 7, hy + 6], [hx + 7, hy - 2], [hx, hy - 9], [hx - 7, hy - 2]], i % 2 ? P.green : P.verm, P.ink, 1); }
  }
  rect(ctx, cs, cs, size - 2 * cs, size - 2 * cs, '#f6efdc', P.ink, 2);
  if (o.title) { ctx.save(); ctx.translate(size / 2, size / 2); ctx.rotate(-0.6); let fs = size * 0.075; ctx.font = `900 ${fs}px Deco`; while (ctx.measureText(o.title).width > size * 0.8 && fs > 10) { fs -= 1; ctx.font = `900 ${fs}px Deco`; } ctx.fillStyle = P.vermDark; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(o.title, 0, 0); ctx.restore(); }
  for (const tk of o.tokens || []) { const p = ((tk.pos % 36) + 36) % 36, i = Math.floor(p), q = p - i; const a = cell(i), b = cell((i + 1) % 36); const px = lerp(a[0] + a[2] / 2, b[0] + b[2] / 2, q), py = lerp(a[1] + a[3] / 2, b[1] + b[3] / 2, q); circle(ctx, px, py - Math.sin(q * Math.PI) * 10, cs * 0.18, tk.color, P.ink, 1.5); }
  ctx.restore();
}
// a judge's gavel (swing 0 up … 1 struck) and its block
export function gavel(ctx, x, y, s = 1, swing = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rect(ctx, -40, 10, 80, 18, P.brown, P.ink, 2);
  ctx.save(); ctx.translate(60, 0); ctx.rotate(lerp(-1.1, 0, swing));
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-70, -10); stroke(ctx, P.ink, 9); stroke(ctx, P.brownLight, 6);
  rect(ctx, -96, -30, 30, 44, P.brown, P.ink, 2);
  ctx.restore(); ctx.restore();
}
// a stack of coins (n coins), for rewards and royalties
export function coinStack(ctx, x, base, r, n, color = P.goldLight) {
  for (let i = 0; i < n; i++) { ctx.beginPath(); ctx.ellipse(x, base - i * r * 0.3, r, r * 0.32, 0, 0, TAU); fillStroke(ctx, i % 2 ? color : shade(color, -0.12), P.ink, 1.4); }
}

// A face hidden in a rock, as Persian and Ottoman painters liked to do: two
// half-closed eyes and a mouth in a darker shade of the stone. Easy to miss.
export function rockFace(ctx, x, y, s = 1, color = '#8a7a6a', mood = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= 0.55;
  const c = shade(color, -0.35);
  ctx.beginPath(); ctx.arc(-14, 0, 7, Math.PI * 0.1, Math.PI * 0.9); stroke(ctx, c, 2.5);
  ctx.beginPath(); ctx.arc(14, 0, 7, Math.PI * 0.1, Math.PI * 0.9); stroke(ctx, c, 2.5);
  ctx.beginPath(); ctx.moveTo(-6, 10); ctx.lineTo(-2, 18); ctx.lineTo(2, 12); stroke(ctx, c, 2);
  ctx.beginPath(); ctx.arc(0, 30 - mood * 8, 12, Math.PI * (0.15 + mood * 1.0), Math.PI * (0.85 + mood * 1.0)); stroke(ctx, c, 2.5);
  ctx.restore();
}

// ---------- Christmas truce (1914) ----------
// a small fir tree with lit candles, as the Germans set them on their parapets
export function candleTree(ctx, x, base, s = 1, t = 0, lit = 1) {
  ctx.save(); ctx.translate(x, base); ctx.scale(s, s);
  rect(ctx, -5, -14, 10, 14, P.brown, P.ink, 1.2);
  for (let i = 0; i < 3; i++) poly(ctx, [[-38 + i * 8, -14 - i * 26], [38 - i * 8, -14 - i * 26], [0, -58 - i * 26]], i % 2 ? P.green : P.greenDark, P.ink, 1.5);
  if (lit > 0) for (const [cx, cy, j] of [[-22, -20, 0], [20, -22, 1], [-12, -46, 2], [14, -48, 3], [0, -72, 4], [-6, -96, 5]]) {
    rect(ctx, cx - 2, cy - 9, 4, 9, P.white, null);
    const f = lit * (0.75 + 0.25 * Math.sin(t * 13 + j * 2.1)), g = ctx.createRadialGradient(cx, cy - 13, 0, cx, cy - 13, 16);
    g.addColorStop(0, `rgba(255,225,140,${0.7 * f})`); g.addColorStop(1, 'rgba(255,225,140,0)'); ctx.fillStyle = g; ctx.fillRect(cx - 16, cy - 29, 32, 32);
    ctx.beginPath(); ctx.ellipse(cx, cy - 13, 2.6 * f, 5 * f, 0, 0, TAU); ctx.fillStyle = '#ffd86a'; ctx.fill();
  }
  ctx.restore();
}
// barbed wire on crossed stakes from x0 to x1
export function barbedWire(ctx, x0, x1, y, h = 50) {
  for (let x = x0; x <= x1; x += 120) for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(x - 18 * d, y); ctx.lineTo(x + 18 * d, y - h); stroke(ctx, P.brown, 4); }
  for (const yy of [y - h * 0.35, y - h * 0.75]) {
    ctx.beginPath(); for (let x = x0; x <= x1; x += 10) ctx[x === x0 ? 'moveTo' : 'lineTo'](x, yy + Math.sin(x * 0.2) * 3); stroke(ctx, '#4a4a4a', 1.6);
    for (let x = x0 + 8; x <= x1; x += 22) { ctx.beginPath(); ctx.moveTo(x - 4, yy - 4); ctx.lineTo(x + 4, yy + 4); ctx.moveTo(x + 4, yy - 4); ctx.lineTo(x - 4, yy + 4); stroke(ctx, '#4a4a4a', 1.4); }
  }
}
// a trench in cross-section: a dug channel with sandbag parapet, duckboards and mud
export function trench(ctx, x, top, w, depth, side = 1) {
  ctx.save(); ctx.translate(x, top);
  ctx.fillStyle = '#5a4630'; ctx.fillRect(-w / 2, 0, w, depth);
  ctx.fillStyle = '#3e2f20'; ctx.beginPath(); ctx.moveTo(-w / 2 + 20, 0); ctx.lineTo(-w / 2 + 40, depth - 20); ctx.lineTo(w / 2 - 40, depth - 20); ctx.lineTo(w / 2 - 20, 0); ctx.closePath(); ctx.fill();
  for (let i = 0; i < Math.floor(w / 46); i++) ellipse(ctx, -w / 2 + 23 + i * 46, -10 - (i % 2) * 14, 24, 12, 0, '#a89366', P.ink, 1.3);
  for (let i = 0; i < 6; i++) rect(ctx, -w / 2 + 50 + i * (w - 100) / 6, depth - 30, (w - 100) / 6 - 6, 8, P.brownLight, P.ink, 1);
  ctx.globalAlpha = 0.5; for (let i = 0; i < 10; i++) ellipse(ctx, -w / 2 + 40 + ((i * 97) % (w - 80)), depth - 14, 26, 5, 0, '#6e5a3e', null); ctx.globalAlpha = 1;
  ctx.restore();
}
// a letter on lined paper; lines = [text…] written so far (k 0..1 of the last line)
export function letter(ctx, x, y, w, h, lines = [], k = 1, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  rect(ctx, -w / 2, -h / 2, w, h, '#f6efdc', P.ink, 2);
  ctx.strokeStyle = 'rgba(70,90,140,0.3)'; ctx.lineWidth = 1; for (let yy = -h / 2 + 50; yy < h / 2 - 10; yy += 34) { ctx.beginPath(); ctx.moveTo(-w / 2 + 16, yy); ctx.lineTo(w / 2 - 16, yy); ctx.stroke(); }
  ctx.font = '600 28px GaramondItalic'; ctx.fillStyle = '#2a2a50'; ctx.textBaseline = 'alphabetic';
  lines.forEach((l, i) => { const txt = i === lines.length - 1 ? l.slice(0, Math.ceil(l.length * clamp(k))) : l; ctx.fillText(txt, -w / 2 + 24, -h / 2 + 46 + i * 34); });
  ctx.restore();
}
export function candle(ctx, x, y, s = 1, t = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const g = ctx.createRadialGradient(0, -46, 2, 0, -46, 140); g.addColorStop(0, 'rgba(255,220,140,0.55)'); g.addColorStop(1, 'rgba(255,220,140,0)'); ctx.fillStyle = g; ctx.fillRect(-140, -186, 280, 280);
  rect(ctx, -10, -36, 20, 36, P.white, P.ink, 1.5); rect(ctx, -24, -4, 48, 8, P.steel, P.ink, 1.5);
  const f = 1 + 0.12 * Math.sin(t * 15); ctx.beginPath(); ctx.ellipse(0, -48, 5 * f, 11 * f, 0, 0, TAU); ctx.fillStyle = '#ffcf5a'; ctx.fill();
  ctx.restore();
}

// ---------- "We Can Do It!" story ----------
// The 1943 factory poster re-painted in this style: yellow ground, a woman in a blue
// work shirt and red dotted bandana flexing her arm, a blue speech balloon. k 0..1 paints it in.
export function wcdiPoster(ctx, x, y, w, o = {}) {
  const h = w * 1.3, k = o.k ?? 1, age = o.age || 0;
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0);
  rect(ctx, -w / 2 - 6, -h / 2 - 6, w + 12, h + 12, '#efe6cf', P.ink, 2);
  ctx.save(); ctx.beginPath(); ctx.rect(-w / 2, -h / 2, w, h * clamp(k)); ctx.clip();
  ctx.fillStyle = shade('#f2c230', -age * 0.3); ctx.fillRect(-w / 2, -h / 2, w, h);
  const s = w / 260, skin = o.skin || '#e8b896', shirt = '#2f5fa8';
  ctx.save(); ctx.scale(s, s); ctx.translate(56, 14); // a waist-up portrait, 260 × 338 units, origin at the centre
  // shoulders and shirt
  ctx.beginPath(); ctx.moveTo(-130, 169); ctx.lineTo(-120, 70); ctx.quadraticCurveTo(-100, 30, -40, 22); ctx.lineTo(40, 22); ctx.quadraticCurveTo(110, 30, 125, 70); ctx.lineTo(130, 169); ctx.closePath(); fillStroke(ctx, shirt, P.ink, 3);
  poly(ctx, [[-28, 22], [0, 60], [28, 22], [14, 18], [0, 34], [-14, 18]], shirt, P.ink, 2); // collar
  circle(ctx, 0, 80, 4, P.white, P.ink, 1); circle(ctx, 0, 120, 4, P.white, P.ink, 1);
  // the flexed arm: upper arm out to the left, forearm up, fist by the head
  ctx.beginPath(); ctx.moveTo(-100, 60); ctx.lineTo(-150, 40); ctx.lineTo(-150, 0); ctx.lineTo(-96, 18); ctx.closePath(); fillStroke(ctx, shirt, P.ink, 2.5);   // rolled sleeve
  ctx.beginPath(); ctx.moveTo(-150, 36); ctx.quadraticCurveTo(-178, 20, -168, -40); ctx.lineTo(-136, -40); ctx.quadraticCurveTo(-140, 0, -150, 4); ctx.closePath(); fillStroke(ctx, skin, P.ink, 2.5); // forearm
  ellipse(ctx, -150, -54, 22, 20, 0, skin, P.ink, 2.5); // fist
  // the other hand rolling the sleeve
  ctx.beginPath(); ctx.moveTo(30, 90); ctx.quadraticCurveTo(-30, 70, -88, 44); stroke(ctx, P.ink, 22); ctx.beginPath(); ctx.moveTo(30, 90); ctx.quadraticCurveTo(-30, 70, -88, 44); stroke(ctx, skin, 17); ellipse(ctx, -94, 38, 16, 13, -0.4, skin, P.ink, 2);
  // neck, head, face
  rect(ctx, -16, -10, 32, 34, skin, P.ink, 2);
  ellipse(ctx, 6, -48, 40, 48, 0, skin, P.ink, 2.5);
  for (const ex of [-6, 22]) { ellipse(ctx, ex, -52, 6, 4, 0, P.white, P.ink, 1.3); circle(ctx, ex - 1, -52, 2.6, P.ink, null); ctx.beginPath(); ctx.moveTo(ex - 8, -62); ctx.quadraticCurveTo(ex, -66, ex + 8, -62); stroke(ctx, P.ink, 2.5); }
  ctx.beginPath(); ctx.moveTo(8, -48); ctx.quadraticCurveTo(4, -34, 10, -32); stroke(ctx, shade(skin, -0.3), 2);
  ctx.beginPath(); ctx.moveTo(-2, -20); ctx.quadraticCurveTo(10, -16, 20, -20); stroke(ctx, P.vermDark, 4);
  // dark hair and the red dotted bandana knotted on top
  ctx.beginPath(); ctx.moveTo(-32, -40); ctx.quadraticCurveTo(-40, -70, -20, -84); ctx.lineTo(-20, -40); ctx.closePath(); fillStroke(ctx, '#4a2814', P.ink, 1.5);
  ctx.beginPath(); ctx.moveTo(-34, -66); ctx.quadraticCurveTo(-30, -104, 8, -104); ctx.quadraticCurveTo(48, -104, 46, -64); ctx.quadraticCurveTo(8, -78, -34, -66); ctx.closePath(); fillStroke(ctx, P.verm, P.ink, 2);
  for (const [dx, dy] of [[-18, -84], [0, -94], [18, -90], [34, -78], [8, -80], [-26, -72]]) circle(ctx, dx, dy, 3.2, P.white, null);
  ellipse(ctx, 0, -110, 12, 8, -0.5, P.verm, P.ink, 1.5); ellipse(ctx, 18, -111, 12, 8, 0.5, P.verm, P.ink, 1.5);
  ctx.restore();
  ctx.beginPath(); ctx.ellipse(w * 0.02, -h * 0.39, w * 0.42, h * 0.08, 0, 0, TAU); fillStroke(ctx, '#2b3f8f', P.white, 3);
  ctx.beginPath(); ctx.moveTo(w * 0.12, -h * 0.33); ctx.lineTo(w * 0.2, -h * 0.26); ctx.lineTo(w * 0.22, -h * 0.33); ctx.fillStyle = '#2b3f8f'; ctx.fill();
  ctx.fillStyle = P.white; ctx.font = `900 ${Math.round(w * 0.085)}px Deco`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('We Can Do It!', w * 0.02, -h * 0.385);
  ctx.restore();
  if (age > 0) { ctx.save(); ctx.globalAlpha = age * 0.5; ctx.fillStyle = '#8a6a3a'; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.restore(); }
  ctx.restore();
}
// a wind-up gramophone (for a hit song)
export function gramophone(ctx, x, base, s = 1, t = 0, playing = 1) {
  ctx.save(); ctx.translate(x, base); ctx.scale(s, s);
  rect(ctx, -70, -60, 140, 60, P.brown, P.ink, 2.5);
  ctx.beginPath(); ctx.ellipse(0, -62, 62, 12, 0, 0, TAU); fillStroke(ctx, P.ink, P.ink, 1);
  ctx.beginPath(); ctx.moveTo(40, -66); ctx.lineTo(20, -130); stroke(ctx, P.goldDark, 5);
  ctx.beginPath(); ctx.moveTo(20, -130); ctx.quadraticCurveTo(10, -200, -70, -220); ctx.lineTo(-40, -170); ctx.quadraticCurveTo(0, -150, 20, -130); ctx.closePath(); fillStroke(ctx, P.gold, P.ink, 2.5);
  if (playing) for (let i = 0; i < 4; i++) { const q = (t * 0.6 + i / 4) % 1; ctx.save(); ctx.globalAlpha = (1 - q) * playing; musicNote(ctx, -80 - q * 120, -200 - q * 90 + Math.sin(q * 8 + i) * 12, 0.9, P.goldDark); ctx.restore(); }
  ctx.restore();
}
// a wooden archive drawer; open 0..1
export function archiveDrawer(ctx, x, y, w, open = 0) {
  rect(ctx, x - w / 2, y - 140, w, 280, P.brown, P.ink, 3);
  for (let i = 0; i < 3; i++) { const oy = y - 130 + i * 90, out = i === 1 ? open * 60 : 0; rect(ctx, x - w / 2 + 12 - out * 0.3, oy + out * 0.4, w - 24 + out * 0.6, 80, P.brownLight, P.ink, 2); rect(ctx, x - 24, oy + 34 + out * 0.4, 48, 12, P.goldDark, P.ink, 1.5); }
}

// ---------- dog tags story ----------
// shape: 'note' (a handwritten paper slip pinned on), 'disc' (the 1906 round tag), 'modern' (rounded rectangle)
export function idTag(ctx, x, y, s = 1, o = {}) {
  const shape = o.shape || 'modern', lines = o.lines || [], rot = o.rot || 0, k = o.k ?? 1;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  if (shape === 'note') {
    rect(ctx, -70, -40, 140, 80, '#f2ead2', P.ink, 1.8);
    ctx.beginPath(); ctx.moveTo(-60, -42); ctx.lineTo(-40, -30); stroke(ctx, '#9aa4b0', 3); circle(ctx, -60, -42, 4, '#9aa4b0', P.ink, 1);
    ctx.fillStyle = '#2a2a50'; ctx.font = '600 20px GaramondItalic'; ctx.textAlign = 'left';
    lines.forEach((l, i) => ctx.fillText(l.slice(0, Math.ceil(l.length * clamp(k * lines.length - i))), -58, -10 + i * 24));
  } else {
    if (o.chain !== false) { ctx.beginPath(); ctx.moveTo(0, shape === 'disc' ? -48 : -58); ctx.quadraticCurveTo(-60, -160, 0, -220); stroke(ctx, '#8a8a8a', 3); }
    if (shape === 'disc') { circle(ctx, 0, 0, 46, o.metal || '#c9cdd2', P.ink, 2.5); circle(ctx, 0, 0, 40, null, '#9aa4b0', 1.5); circle(ctx, 0, -38, 4, '#ffffff', P.ink, 1); }
    else { ctx.beginPath(); ctx.moveTo(-40, -55); ctx.lineTo(40, -55); ctx.quadraticCurveTo(52, -55, 52, -40); ctx.lineTo(52, 40); ctx.quadraticCurveTo(52, 55, 40, 55); ctx.lineTo(-40, 55); ctx.quadraticCurveTo(-52, 55, -52, 40); ctx.lineTo(-52, -40); ctx.quadraticCurveTo(-52, -55, -40, -55); ctx.closePath(); fillStroke(ctx, o.metal || '#c9cdd2', P.ink, 2.5); circle(ctx, 0, -44, 4, '#ffffff', P.ink, 1); }
    ctx.fillStyle = '#4a4f58'; ctx.font = `700 ${shape === 'disc' ? 11 : 12}px Deco`; ctx.textAlign = 'center';
    lines.forEach((l, i) => ctx.fillText(l.slice(0, Math.ceil(l.length * clamp(k * lines.length - i))), 0, -14 + i * 15));
  }
  ctx.restore();
}
// a canvas A-tent of an army camp
export function aTent(ctx, x, base, s = 1, color = '#efe6d0') {
  ctx.save(); ctx.translate(x, base); ctx.scale(s, s);
  poly(ctx, [[-60, 0], [0, -90], [60, 0]], color, P.ink, 2); poly(ctx, [[-14, 0], [0, -60], [14, 0]], '#3a2a20', P.ink, 1.5);
  ctx.beginPath(); ctx.moveTo(0, -90); ctx.lineTo(0, -104); stroke(ctx, P.brown, 3);
  ctx.restore();
}

// ---------- Taps story ----------
// a brass bugle (no valves), mouthpiece at the origin, bell pointing +x
export function bugle(ctx, x, y, s = 1, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(70, 0); ctx.quadraticCurveTo(100, 0, 100, -18); ctx.quadraticCurveTo(100, -36, 70, -36); ctx.lineTo(30, -36); ctx.quadraticCurveTo(10, -36, 10, -22); ctx.quadraticCurveTo(10, -10, 40, -10); ctx.lineTo(80, -10);
  stroke(ctx, P.ink, 8); stroke(ctx, P.goldLight, 5);
  ctx.beginPath(); ctx.moveTo(80, -14); ctx.lineTo(118, -26); ctx.lineTo(118, 6); ctx.lineTo(80, -6); ctx.closePath(); fillStroke(ctx, P.gold, P.ink, 2);
  rect(ctx, -10, -3, 12, 6, P.goldDark, P.ink, 1);
  ctx.beginPath(); ctx.moveTo(40, 0); ctx.quadraticCurveTo(50, 30, 60, -10); stroke(ctx, P.verm, 3);
  ctx.restore();
}
// a camp lantern; lit 0..1
export function lantern(ctx, x, y, s = 1, lit = 1, t = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (lit > 0) { const f = lit * (0.85 + 0.15 * Math.sin(t * 11 + x)); const g = ctx.createRadialGradient(0, 0, 2, 0, 0, 70); g.addColorStop(0, `rgba(255,210,120,${0.55 * f})`); g.addColorStop(1, 'rgba(255,210,120,0)'); ctx.fillStyle = g; ctx.fillRect(-70, -70, 140, 140); }
  ctx.beginPath(); ctx.arc(0, -22, 8, Math.PI, 0); stroke(ctx, P.ink, 2);
  rect(ctx, -12, -18, 24, 32, lit > 0 ? `rgba(255,220,140,${0.4 + 0.6 * lit})` : '#4a4a4a', P.ink, 2);
  rect(ctx, -15, -20, 30, 5, P.ink, P.ink, 1); rect(ctx, -15, 13, 30, 5, P.ink, P.ink, 1);
  ctx.restore();
}
// a five-line music staff with the Taps notes; n = how many notes are written; lit = notes glowing
export const TAPS_NOTES = [[0, 0, 4], [0, 0, 4], [0, 4, 8], [0, 4, 8], [0, 4, 8], [4, 8, 12], [8, 4, 0], [0, 0, 4]];
export function staff(ctx, x, y, w, n = 24, o = {}) {
  ctx.save(); ctx.translate(x, y);
  for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-w / 2, i * 16); ctx.lineTo(w / 2, i * 16); stroke(ctx, o.ink || P.ink, 1.5); }
  const notes = TAPS_NOTES.flat(), step = (w - 40) / notes.length;
  notes.forEach((p, i) => { if (i >= n) return; const nx = -w / 2 + 24 + i * step, ny = 56 - p * 4; ellipse(ctx, nx, ny, 7, 5, -0.4, o.glow && i < o.glow ? P.goldLight : (o.ink || P.ink), o.ink || P.ink, 1); ctx.beginPath(); ctx.moveTo(nx + 6, ny); ctx.lineTo(nx + 6, ny - 34); stroke(ctx, o.ink || P.ink, 1.5); });
  ctx.restore();
}
export function headstone(ctx, x, base, s = 1) {
  ctx.save(); ctx.translate(x, base); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-30, 0); ctx.lineTo(-30, -70); ctx.quadraticCurveTo(0, -96, 30, -70); ctx.lineTo(30, 0); ctx.closePath(); fillStroke(ctx, '#e6e2d6', P.ink, 2);
  ctx.beginPath(); ctx.moveTo(-14, -56); ctx.lineTo(14, -56); ctx.moveTo(-12, -44); ctx.lineTo(12, -44); stroke(ctx, '#9a968a', 2);
  ctx.restore();
}
// a US flag of 1862 (34 stars shown as a field of dots); wave = time
export function usFlag(ctx, x, y, w, t = 0) {
  const h = w * 0.55;
  ctx.save(); ctx.translate(x, y);
  for (let i = 0; i < 13; i++) { ctx.beginPath(); for (let j = 0; j <= 20; j++) { const q = j / 20, wy = Math.sin(t * 3 + q * 5) * 6 * q; ctx[j ? 'lineTo' : 'moveTo'](q * w, i * h / 13 + wy); } for (let j = 20; j >= 0; j--) { const q = j / 20, wy = Math.sin(t * 3 + q * 5) * 6 * q; ctx.lineTo(q * w, (i + 1) * h / 13 + wy); } ctx.closePath(); ctx.fillStyle = i % 2 ? P.white : P.verm; ctx.fill(); }
  ctx.fillStyle = P.lapisDeep; ctx.fillRect(0, 0, w * 0.4, h * 7 / 13);
  for (let r = 0; r < 5; r++) for (let c = 0; c < 7; c++) circle(ctx, w * 0.04 + c * w * 0.052, h * 0.06 + r * h * 0.1, 1.6, P.white, null);
  ctx.strokeStyle = P.ink; ctx.lineWidth = 1.5; ctx.strokeRect(0, 0, w, h);
  ctx.restore();
}

// ---------- Navajo Code Talkers story ----------
// mesas and buttes of the Navajo Nation, in miniature style (spongy rock layers)
export function mesas(ctx, W, base, t = 0, seed = 2) {
  const R = rng(seed);
  for (let i = 0; i < 5; i++) {
    const x = R() * W, w = 120 + R() * 200, h = 140 + R() * 220, c = ['#c4633a', '#b0532e', '#d07a48', '#a8492a'][i % 4];
    ctx.beginPath(); ctx.moveTo(x - w / 2 - 40, base); ctx.lineTo(x - w / 2, base - h); ctx.lineTo(x + w / 2, base - h); ctx.lineTo(x + w / 2 + 40, base); ctx.closePath(); fillStroke(ctx, c, P.ink, 2);
    for (let j = 1; j < 4; j++) { ctx.beginPath(); ctx.moveTo(x - w / 2 - j * 6, base - h + j * h / 4); ctx.lineTo(x + w / 2 + j * 6, base - h + j * h / 4); stroke(ctx, shade(c, -0.2), 2); }
    rockFace(ctx, x, base - h * 0.5, 0.9, c, 0);
  }
}
// a traditional hogan: round log house with an earthen dome and an east-facing door
export function hogan(ctx, x, base, s = 1) {
  ctx.save(); ctx.translate(x, base); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-90, 0); ctx.lineTo(-80, -60); ctx.quadraticCurveTo(0, -130, 80, -60); ctx.lineTo(90, 0); ctx.closePath(); fillStroke(ctx, '#b08a5a', P.ink, 2.5);
  for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-86 + i * 2, -i * 16); ctx.lineTo(86 - i * 2, -i * 16); stroke(ctx, '#8a6a3e', 2); }
  rect(ctx, -18, -46, 36, 46, '#3a2a1a', P.ink, 2);
  ctx.beginPath(); ctx.moveTo(0, -110); ctx.lineTo(0, -126); stroke(ctx, '#5a4a3a', 4);
  ctx.restore();
}
// a WWII field radio with handset; on 0..1 makes the dial glow
export function fieldRadio(ctx, x, y, s = 1, on = 1, t = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rect(ctx, -70, -60, 140, 110, '#5e6a44', P.ink, 2.5); rect(ctx, -56, -46, 70, 40, '#2a2a2a', P.ink, 1.5);
  if (on > 0) { ctx.save(); ctx.globalAlpha = on; rect(ctx, -52, -42, 62, 32, '#c9e08a', null); ctx.beginPath(); for (let i = 0; i <= 30; i++) ctx[i ? 'lineTo' : 'moveTo'](-50 + i * 2, -26 + Math.sin(t * 9 + i * 0.7) * 10 * on); stroke(ctx, '#2a4a1a', 2); ctx.restore(); }
  for (let i = 0; i < 2; i++) circle(ctx, 40, -34 + i * 34, 12, '#3a3a3a', P.ink, 1.5);
  ctx.beginPath(); ctx.moveTo(60, -60); ctx.lineTo(80, -170); stroke(ctx, P.ink, 3);
  ctx.beginPath(); ctx.moveTo(-70, 0); ctx.bezierCurveTo(-120, 10, -110, 70, -80, 70); stroke(ctx, P.ink, 3);
  ctx.restore();
}
// a rug on an upright loom; rows 0..1 = how much is woven from the bottom; bands = colours of the story's bands
export function loomRug(ctx, x, y, w, h, rows = 1, o = {}) {
  ctx.save(); ctx.translate(x, y);
  rect(ctx, -w / 2 - 30, -h / 2 - 50, 22, h + 100, P.brown, P.ink, 2); rect(ctx, w / 2 + 8, -h / 2 - 50, 22, h + 100, P.brown, P.ink, 2);
  rect(ctx, -w / 2 - 40, -h / 2 - 50, w + 80, 18, P.brownLight, P.ink, 2); rect(ctx, -w / 2 - 40, h / 2 + 32, w + 80, 18, P.brownLight, P.ink, 2);
  ctx.strokeStyle = 'rgba(240,230,200,0.8)'; ctx.lineWidth = 1; for (let i = 0; i <= 40; i++) { ctx.beginPath(); ctx.moveTo(-w / 2 + i * w / 40, -h / 2 - 32); ctx.lineTo(-w / 2 + i * w / 40, h / 2 + 32); ctx.stroke(); }
  const done = h * clamp(rows), cols = o.colors || ['#9a2a1e', '#efe6cf', '#2a2a2a', '#b0532e'];
  ctx.save(); ctx.beginPath(); ctx.rect(-w / 2, h / 2 - done, w, done); ctx.clip();
  ctx.fillStyle = cols[0]; ctx.fillRect(-w / 2, -h / 2, w, h);
  const bands = 6;
  for (let b = 0; b < bands; b++) {
    const by = h / 2 - (b + 0.5) * h / bands, c = cols[(b % (cols.length - 1)) + 1];
    for (let i = 0; i < 5; i++) { const cx = -w / 2 + (i + 0.5) * w / 5, r = h / bands * 0.38; ctx.beginPath(); ctx.moveTo(cx, by - r); ctx.lineTo(cx + r, by); ctx.lineTo(cx, by + r); ctx.lineTo(cx - r, by); ctx.closePath(); ctx.fillStyle = c; ctx.fill(); }
    ctx.fillStyle = cols[2]; ctx.fillRect(-w / 2, h / 2 - (b + 1) * h / bands, w, 4);
  }
  ctx.restore();
  ctx.strokeStyle = P.ink; ctx.lineWidth = 2; ctx.strokeRect(-w / 2, -h / 2, w, h);
  if (rows > 0 && rows < 1) { ctx.beginPath(); ctx.moveTo(-w / 2 - 10, h / 2 - done); ctx.lineTo(w / 2 + 10, h / 2 - done); stroke(ctx, P.goldDark, 6); }
  ctx.restore();
}

// ---------- marathon story ----------
// a round hoplite shield (aspis) and a spear, for puppets to hold
export function aspis(ctx, x, y, r, color = '#c08a3a', emblem = P.verm) {
  circle(ctx, x, y, r, color, P.ink, 2.5); circle(ctx, x, y, r * 0.86, null, P.ink, 1.5);
  ctx.beginPath(); ctx.moveTo(x - r * 0.35, y + r * 0.3); ctx.lineTo(x, y - r * 0.4); ctx.lineTo(x + r * 0.35, y + r * 0.3); stroke(ctx, emblem, r * 0.12);
}
// a marble horseshoe stadium (the 1896 Panathenaic Stadium, simplified)
export function stadium(ctx, x, base, w, h, t = 0, crowd = 1) {
  // seen from above, as Matrakçı paints a city: a long U of marble seats open at the near end
  ctx.save(); ctx.translate(x, base);
  const R = rng(7), uPath = (inset) => { const hw = w / 2 - inset, top = -h + inset; ctx.beginPath(); ctx.moveTo(-hw, 0); ctx.lineTo(-hw, top + hw); ctx.arc(0, top + hw, hw, Math.PI, TAU); ctx.lineTo(hw, 0); };
  uPath(0); ctx.lineTo(-w / 2, 0); fillStroke(ctx, '#ece6da', P.ink, 2.5);
  for (let i = 1; i < 6; i++) { uPath(i * w * 0.045); stroke(ctx, i % 2 ? '#cfc6b4' : '#dcd4c4', 2); }
  if (crowd > 0) for (let i = 0; i < 90 * crowd; i++) { const side = R(), d = w * (0.03 + R() * 0.2), hw = w / 2 - d; let px, py; if (side < 0.4) { px = -hw; py = -R() * (h - w / 2); } else if (side < 0.8) { px = hw; py = -R() * (h - w / 2); } else { const a = Math.PI + R() * Math.PI; px = Math.cos(a) * hw; py = -h + w / 2 + Math.sin(a) * hw; } circle(ctx, px, py + Math.sin(t * 8 + i) * 1.5, 4, [P.verm, P.lapis, P.ochre, P.white, P.green][i % 5], null); }
  const tw = w / 2 - w * 0.27; ctx.beginPath(); ctx.moveTo(-tw, 0); ctx.lineTo(-tw, -h + w / 2); ctx.arc(0, -h + w / 2, tw, Math.PI, TAU); ctx.lineTo(tw, 0); ctx.closePath(); fillStroke(ctx, '#d2a868', P.ink, 2);
  ctx.beginPath(); ctx.moveTo(-tw + 14, -10); ctx.lineTo(-tw + 14, -h + w / 2); ctx.arc(0, -h + w / 2, tw - 14, Math.PI, TAU); ctx.lineTo(tw - 14, -10); stroke(ctx, P.white, 2);
  ctx.restore();
}

// ---------- colour util ----------
export function shade(hex, k) {
  if (!hex.startsWith('#')) return hex;
  const n = parseInt(hex.slice(1), 16);
  let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const f = c => Math.round(k >= 0 ? c + (255 - c) * k : c * (1 + k));
  return '#' + [f(r), f(g), f(b)].map(v => clamp(v, 0, 255).toString(16).padStart(2, '0')).join('');
}
export { noise1 };
