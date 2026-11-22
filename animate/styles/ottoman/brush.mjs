// The painter's hand (nakkaş): each scene first appears as an ink drawing on
// paper, then a brush sweeps colour across it in dry-brush strokes — you watch
// the miniature being painted. Also: the gold glint that runs around the frame
// when a new scene begins.
import { createCanvas } from '@napi-rs/canvas';
import { clamp, lerp, rng, ease, TAU } from '../../lib/core.mjs';
import { P, circle, stroke } from './kit.mjs';

export function createBrush(W, H) {
  const off = createCanvas(W, H), ox = off.getContext('2d');
  const sk = createCanvas(W, H), sx = sk.getContext('2d');
  const mask = createCanvas(W, H), mx = mask.getContext('2d');

  // strokes: K overlapping horizontal sweeps, alternating direction, each with bristles
  function strokes(seed, k) {
    const R = rng(seed), K = 6, w = H / K * 1.9, out = [];
    for (let i = 0; i < K; i++) {
      const y = (i + 0.5) * H / K + (R() - 0.5) * 30, dir = i % 2 ? -1 : 1, start = i / K * 0.72, p = clamp((k - start) / 0.34);
      const wob = R() * 10, amp = 18 + R() * 22;
      const pts = []; for (let j = 0; j <= 24; j++) { const q = j / 24, x = dir > 0 ? lerp(-80, W + 80, q) : lerp(W + 80, -80, q); pts.push([x, y + Math.sin(q * 5 + wob) * amp]); }
      out.push({ pts, p, w, R: rng(seed * 31 + i) });
    }
    return out;
  }
  function trace(ctx, pts, p) {
    const n = Math.max(1, Math.round(p * (pts.length - 1)));
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let j = 1; j <= n; j++) ctx.lineTo(pts[j][0], pts[j][1]);
    return pts[n];
  }

  // drawInto(ctx) paints the scene; k = 0..1 progress of the wash
  function paint(ctx, drawInto, k, seed) {
    ox.save(); ox.clearRect(0, 0, W, H); drawInto(ox); ox.restore();
    if (k >= 1) { ctx.drawImage(off, 0, 0); return; }
    // ink sketch on paper
    sx.save(); sx.globalCompositeOperation = 'source-over'; sx.filter = 'none'; sx.fillStyle = '#efe2c0'; sx.fillRect(0, 0, W, H);
    sx.globalCompositeOperation = 'multiply'; sx.filter = 'grayscale(1) sepia(0.35) contrast(2.3) brightness(1.18)'; sx.drawImage(off, 0, 0);
    sx.restore();
    // the coloured wash, masked by the brush strokes
    mx.save(); mx.clearRect(0, 0, W, H); mx.lineCap = 'round'; mx.lineJoin = 'round'; mx.strokeStyle = '#fff';
    let tip = null;
    for (const s of strokes(seed, k)) {
      if (s.p <= 0) continue;
      const end = trace(mx, s.pts, s.p); mx.lineWidth = s.w * 0.78; mx.stroke();
      for (let b = 0; b < 9; b++) { // bristles feather the edges
        const off_ = (b / 8 - 0.5) * s.w * 1.05, lag = 0.04 + s.R() * 0.1;
        mx.save(); mx.translate(0, off_); trace(mx, s.pts, clamp(s.p - lag)); mx.lineWidth = s.w * (0.06 + s.R() * 0.1); mx.stroke(); mx.restore();
      }
      if (s.p < 1) tip = end;
    }
    mx.globalCompositeOperation = 'source-in'; mx.drawImage(off, 0, 0);
    mx.restore();
    ctx.drawImage(sk, 0, 0); ctx.drawImage(mask, 0, 0);
    if (tip) brushTip(ctx, tip[0], tip[1], k);
  }
  return { paint };
}

// a miniature painter's brush: reed handle, gold ferrule, a wet pointed tip
export function brushTip(ctx, x, y, k) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.75 + Math.sin(k * 20) * 0.08);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-10, -30, 0, -60); ctx.quadraticCurveTo(10, -30, 0, 0); ctx.fillStyle = P.verm; ctx.fill(); stroke(ctx, P.ink, 1.5);
  ctx.fillStyle = P.gold; ctx.fillRect(-7, -78, 14, 20); stroke(ctx, P.ink, 1);
  ctx.beginPath(); ctx.moveTo(0, -78); ctx.lineTo(0, -260); stroke(ctx, P.ink, 12); stroke(ctx, P.brownLight, 8);
  circle(ctx, 0, -262, 7, P.verm, P.ink, 1.5);
  ctx.restore();
}

// a bright glint that runs once around the gold frame rule (k = 0..1)
export function frameGlint(ctx, x, y, w, h, k) {
  if (k <= 0 || k >= 1) return;
  const per = 2 * (w + h), at = s => { s = ((s % per) + per) % per; return s < w ? [x + s, y] : s < w + h ? [x + w, y + s - w] : s < 2 * w + h ? [x + w - (s - w - h), y + h] : [x, y + h - (s - 2 * w - h)]; };
  const e = ease.inOut(k), head = e * per * 0.5;
  ctx.save(); ctx.globalCompositeOperation = 'screen';
  for (const base of [0, per / 2]) for (let j = 0; j < 14; j++) {
    const [px, py] = at(base + head - j * 12), a = (1 - j / 14) * Math.sin(Math.PI * k);
    const g = ctx.createRadialGradient(px, py, 0, px, py, 26 - j); g.addColorStop(0, `rgba(255,248,210,${0.9 * a})`); g.addColorStop(1, 'rgba(255,248,210,0)');
    ctx.fillStyle = g; ctx.fillRect(px - 26, py - 26, 52, 52);
  }
  ctx.restore();
}

// The painter's sign-off: a gold tughra-style monogram written stroke by stroke
// (three tall shafts with pennants, two nested loops sweeping out to the right,
// a curving base), then the channel's seal stamped beside it.
const TUGHRA = (() => {
  const S = [], arc = (cx, cy, rx, ry, a0, a1, n = 40) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * i / n; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
  S.push([[10, -12], [60, -24], [110, -6], [170, -22], [215, -10]]);               // base (sere)
  for (const x of [118, 146, 174]) S.push([[x, -18], [x - 2, -110], [x, -200], ...arc(x + 18, -196, 18, 12, Math.PI, Math.PI * 2.2, 10)]); // shafts + pennants
  S.push([...arc(72, -70, 76, 50, -0.2, Math.PI * 1.9), [150, -96], [215, -120], [262, -134]]); // outer loop → arm
  S.push([...arc(82, -70, 46, 28, -0.2, Math.PI * 1.9), [140, -86], [200, -100], [240, -108]]); // inner loop → arm
  return S;
})();
const segLen = pts => pts.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);
export function signature(ctx, x, y, s, k, { initials = '', ring = '' } = {}, seal = null) {
  if (k <= 0) return;
  const total = TUGHRA.reduce((a, p) => a + segLen(p), 0);
  let left = clamp(k / 0.75) * total;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const pts of TUGHRA) {
    const L = segLen(pts), show = Math.min(L, left); left -= show;
    if (show <= 0) break;
    for (const [w, c] of [[11, P.ink], [6, P.goldLight]]) { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) ctx.lineTo(p[0], p[1]); ctx.setLineDash([show, L + 10]); ctx.lineWidth = w; ctx.strokeStyle = c; ctx.stroke(); }
  }
  ctx.setLineDash([]); ctx.restore();
  if (seal) seal(x + 300 * s, y - 80 * s, 50 * s, ring, initials, clamp((k - 0.62) / 0.3));
}
