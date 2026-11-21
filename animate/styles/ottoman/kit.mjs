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
  if (o.beard && o.beard !== 'none') {
    const L = o.beard === 'long' ? 34 : 18;
    ctx.beginPath(); ctx.moveTo(-12, 2); ctx.quadraticCurveTo(-8, L, 6, L + 4); ctx.quadraticCurveTo(18, L - 4, 17, 2); ctx.quadraticCurveTo(6, 12, -12, 2);
    fillStroke(ctx, o.beardColor || '#3a2a20', P.ink, 1.3);
  }
  // almond eyes + arched brows
  for (const ex of [-3, 9]) {
    ctx.beginPath(); ctx.moveTo(ex - 4, -3); ctx.quadraticCurveTo(ex, -6, ex + 4, -3); ctx.quadraticCurveTo(ex, -1, ex - 4, -3); fillStroke(ctx, P.ink, P.ink, 0.8);
    ctx.beginPath(); ctx.moveTo(ex - 5, -8); ctx.quadraticCurveTo(ex, -11, ex + 5, -8); stroke(ctx, P.ink, 1.2);
  }
  // nose (towards the facing side) + mouth
  ctx.beginPath(); ctx.moveTo(4, -2); ctx.quadraticCurveTo(10, 6, 5, 7); stroke(ctx, P.ink, 1.1);
  const mood = o.mood || 'calm';
  ctx.beginPath();
  if (mood === 'happy') ctx.arc(4, 9, 4, 0.1 * Math.PI, 0.9 * Math.PI); else if (mood === 'sad') ctx.arc(4, 15, 4, 1.15 * Math.PI, 1.85 * Math.PI); else { ctx.moveTo(1, 12); ctx.lineTo(7, 12); }
  stroke(ctx, P.vermDark, 1.6);
  if (o.mustache) { ctx.beginPath(); ctx.moveTo(-3, 9); ctx.quadraticCurveTo(4, 6, 11, 9); stroke(ctx, '#3a2a20', 2.5); }
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

// ---------- colour util ----------
export function shade(hex, k) {
  if (!hex.startsWith('#')) return hex;
  const n = parseInt(hex.slice(1), 16);
  let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const f = c => Math.round(k >= 0 ? c + (255 - c) * k : c * (1 + k));
  return '#' + [f(r), f(g), f(b)].map(v => clamp(v, 0, 255).toString(16).padStart(2, '0')).join('');
}
export { noise1 };
