// Shared transitions for every style. Each one gets the old picture (A) and
// the new one (B) as finished canvases of the painting size and draws the
// in-between frame. `e` runs 0 → 1 over the transition's length.
//
//   page    the page turns over from the right corner (shadow on the next page)
//   burn    the picture burns away from the bottom: char, a glowing edge, embers
//   tear    the paper rips down the middle and the two halves fly apart
//   drip    ink runs down from the top and covers it, then slides off
//   shutter a camera shutter: six blades close and open
//   whip    a whip pan with motion blur
//   zoom    zoom through the picture into the next one
//   spin    spins away and the next one spins in
//   glitch  a memory glitch: slices slip, colour splits, scanlines
//   marble  ebru: colour drops bloom over it, then open on the next picture
//   tiles   the picture flips over tile by tile (İznik tiles, a wave across)
//   doors   two carved doors swing shut and open again on the next scene
//
// `o` (from the style): { t, seed, ink, paper, accent, gold, colors[], doorFill(ctx,x,y,w,h,side), tileBack }
// Each entry also names the sound effect the engine adds by itself on the cut
// (meta.autoSfx = false turns that off).
import { createCanvas } from '@napi-rs/canvas';
import { clamp, lerp, ease, rng, TAU } from './core.mjs';

const tmpCache = new Map();
function tmp(key, w, h) { // reusable scratch canvases
  let c = tmpCache.get(key);
  if (!c || c.width !== w || c.height !== h) { c = createCanvas(w, h); tmpCache.set(key, c); }
  const x = c.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'; x.filter = 'none'; x.clearRect(0, 0, w, h);
  return c;
}
// Draw an image with a streak of motion blur along (dx, dy).
function streak(ctx, img, x, y, dx, dy, n = 7) {
  ctx.drawImage(img, x, y);
  if (Math.hypot(dx, dy) < 2) return;
  ctx.save();
  for (let i = 0; i < n; i++) { const f = i / (n - 1) - 0.5; ctx.globalAlpha = 0.16; ctx.drawImage(img, x + dx * f, y + dy * f); }
  ctx.restore();
}
function scaled(ctx, img, W, H, s, rot = 0, cx = W / 2, cy = H / 2) {
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(s, s); ctx.drawImage(img, -cx, -cy); ctx.restore();
}

export const TRANSITIONS = {
  whip: {
    dur: 0.35, sfx: { type: 'whoosh', gain: 0.5, lead: 0.08 },
    draw(ctx, A, B, e, W, H) {
      const k = ease.inOut(e), blur = Math.sin(Math.PI * e) * 220;
      streak(ctx, A, -k * W, 0, blur, 0);
      streak(ctx, B, W * (1 - k), 0, blur, 0);
    },
  },
  zoom: {
    dur: 0.45, sfx: { type: 'zoom', gain: 0.5, lead: 0.12 },
    draw(ctx, A, B, e, W, H, o) {
      if (e < 0.5) {
        const k = ease.inCubic(e * 2), s = lerp(1, 2.8, k);
        scaled(ctx, A, W, H, s); ctx.save();
        for (let i = 1; i <= 5; i++) { ctx.globalAlpha = 0.14 * k; scaled(ctx, A, W, H, s * (1 + 0.05 * i)); }
        ctx.restore();
      } else {
        const k = ease.outCubic((e - 0.5) * 2), s = lerp(2.2, 1, k);
        scaled(ctx, B, W, H, s); ctx.save();
        for (let i = 1; i <= 5; i++) { ctx.globalAlpha = 0.14 * (1 - k); scaled(ctx, B, W, H, s * (1 + 0.05 * i)); }
        ctx.restore();
      }
      ctx.fillStyle = o.flashColor || 'rgba(255,252,240,1)'; ctx.globalAlpha = Math.max(0, 1 - Math.abs(e - 0.5) * 5) * 0.7; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;
    },
  },
  spin: {
    dur: 0.5, sfx: { type: 'whoosh', gain: 0.45, lead: 0.1, pitch: 0.8 },
    draw(ctx, A, B, e, W, H, o) {
      ctx.fillStyle = o.ink; ctx.fillRect(0, 0, W, H);
      const first = e < 0.5, k = first ? ease.inCubic(e * 2) : 1 - ease.outCubic((e - 0.5) * 2);
      const img = first ? A : B, dir = first ? 1 : -1;
      ctx.save();
      for (let i = 4; i >= 0; i--) { ctx.globalAlpha = i ? 0.12 * k : 1; scaled(ctx, img, W, H, 1 - 0.75 * k, dir * (k * 2.4 - i * 0.05 * k)); }
      ctx.restore();
    },
  },
  glitch: {
    dur: 0.4, sfx: { type: 'glitch', gain: 0.5, lead: 0.02 },
    draw(ctx, A, B, e, W, H, o) {
      const step = Math.floor((o.t || 0) * 15), R = rng(step * 97 + (o.seed || 1)), amp = Math.sin(Math.PI * e);
      const base = e < 0.5 ? A : B, other = e < 0.5 ? B : A;
      ctx.drawImage(base, 0, 0);
      // colour split: a red and a cyan ghost, offset sideways
      const sp = 24 * amp;
      for (const [col, dx] of [['rgba(255,40,60,1)', sp], ['rgba(40,220,255,1)', -sp]]) {
        const g = tmp('glitch', W, H), gx = g.getContext('2d');
        gx.drawImage(base, 0, 0); gx.globalCompositeOperation = 'multiply'; gx.fillStyle = col; gx.fillRect(0, 0, W, H);
        ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = 0.45 * amp; ctx.drawImage(g, dx, 0); ctx.restore();
      }
      // slipped slices, some from the other picture (a data-mosh)
      for (let i = 0; i < 16; i++) {
        const y = R() * H, h = 6 + R() * 60, dx = (R() - 0.5) * 2 * 140 * amp;
        ctx.drawImage(R() < 0.25 * amp ? other : base, 0, y, W, h, dx, y, W, h);
      }
      // scanlines + a few bright noise bars
      ctx.save(); ctx.globalAlpha = 0.18 * amp; ctx.fillStyle = '#000';
      for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 1.5);
      ctx.globalAlpha = 0.6 * amp; ctx.fillStyle = o.accent;
      for (let i = 0; i < 4; i++) ctx.fillRect(R() * W, R() * H, 40 + R() * 260, 3 + R() * 8);
      ctx.restore();
    },
  },
  shutter: {
    dur: 0.5, sfx: { type: 'shutter', gain: 0.6, lead: 0.05 },
    draw(ctx, A, B, e, W, H, o) {
      const first = e < 0.5, close = first ? ease.inCubic(e * 2) : 1 - ease.outCubic((e - 0.5) * 2);
      ctx.drawImage(first ? A : B, 0, 0);
      const cx = W / 2, cy = H / 2, Rm = Math.hypot(W, H) / 2 + 10, r = Rm * (1 - close), L = Rm * 2.2, rot = close * 0.9;
      for (let i = 0; i < 6; i++) {
        const a = i * TAU / 6 + rot, px = cx + Math.cos(a) * r, py = cy + Math.sin(a) * r, dx = -Math.sin(a), dy = Math.cos(a);
        ctx.beginPath();
        ctx.moveTo(px - dx * L * 0.2, py - dy * L * 0.2); ctx.lineTo(px + dx * L, py + dy * L);
        ctx.lineTo(px + dx * L + Math.cos(a) * L, py + dy * L + Math.sin(a) * L); ctx.lineTo(px - dx * L * 0.2 + Math.cos(a) * L, py - dy * L * 0.2 + Math.sin(a) * L); ctx.closePath();
        ctx.fillStyle = o.ink; ctx.fill(); ctx.strokeStyle = o.bladeEdge || 'rgba(255,255,255,0.28)'; ctx.lineWidth = 3; ctx.stroke();
      }
    },
  },
  page: {
    dur: 0.65, sfx: { type: 'page', gain: 0.6, lead: 0.02 },
    draw(ctx, A, B, e, W, H, o) {
      const k = ease.inOut(e), th = 0.14, f = lerp(W * 1.15, -W * 0.45, k); // fold line x (in the tilted frame)
      const cx = W / 2, cy = H / 2;
      const tilted = fn => { ctx.save(); ctx.translate(cx, cy); ctx.rotate(th); ctx.translate(-cx, -cy); fn(); ctx.restore(); };
      const flatDraw = img => { ctx.save(); ctx.translate(cx, cy); ctx.rotate(-th); ctx.translate(-cx, -cy); ctx.drawImage(img, 0, 0); ctx.restore(); };
      const big = H * 2;
      // the old page, left of the fold
      tilted(() => { ctx.beginPath(); ctx.rect(-big, -big, f + big, big * 3); ctx.clip(); flatDraw(A); });
      // the next page, right of the fold, with the shadow of the turning page on it
      tilted(() => {
        ctx.beginPath(); ctx.rect(f, -big, big * 2, big * 3); ctx.clip(); flatDraw(B);
        const g = ctx.createLinearGradient(f, 0, f + 90, 0); g.addColorStop(0, 'rgba(20,12,4,0.45)'); g.addColorStop(1, 'rgba(20,12,4,0)');
        ctx.fillStyle = g; ctx.fillRect(f, -big, 90, big * 3);
      });
      // the back of the turning page, lying over the old page: paper with the
      // old picture's ink showing through (mirrored), curled shading, a cast shadow
      const fw = Math.min(W * 1.2 - f, f + W * 0.5) * 0.92;
      if (fw > 2) tilted(() => {
        const g0 = ctx.createLinearGradient(f - fw - 46, 0, f - fw, 0); g0.addColorStop(0, 'rgba(20,12,4,0)'); g0.addColorStop(1, 'rgba(20,12,4,0.35)');
        ctx.fillStyle = g0; ctx.fillRect(f - fw - 46, -big, 46, big * 3);
        ctx.save(); ctx.beginPath(); ctx.rect(f - fw, -big, fw, big * 3); ctx.clip();
        ctx.fillStyle = o.paper; ctx.fillRect(f - fw, -big, fw, big * 3);
        ctx.save(); ctx.globalAlpha = 0.16; ctx.translate(2 * f, 0); ctx.scale(-1, 1); flatDraw(A); ctx.restore();
        const g = ctx.createLinearGradient(f - fw, 0, f, 0);
        g.addColorStop(0, 'rgba(40,25,10,0.28)'); g.addColorStop(0.25, 'rgba(255,255,255,0.25)'); g.addColorStop(0.75, 'rgba(0,0,0,0.04)'); g.addColorStop(1, 'rgba(40,25,10,0.42)');
        ctx.fillStyle = g; ctx.fillRect(f - fw, -big, fw, big * 3);
        ctx.restore();
        ctx.strokeStyle = 'rgba(40,25,10,0.6)'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(f - fw, -big); ctx.lineTo(f - fw, big * 2); ctx.stroke();
      });
    },
  },
  burn: {
    dur: 0.8, sfx: { type: 'fire', gain: 0.55, lead: 0.05 },
    draw(ctx, A, B, e, W, H, o) {
      const sc = 6, w = Math.ceil(W / sc), h = Math.ceil(H / sc);
      const field = burnField(w, h, o.seed || 3), th = lerp(0.06, 1.12, ease.inOut(e) * 0.4 + e * 0.6);
      const mask = tmp('burnMask', w, h), mx = mask.getContext('2d'), mimg = mx.createImageData(w, h), md = mimg.data;
      const edge = tmp('burnEdge', w, h), ex = edge.getContext('2d'), eimg = ex.createImageData(w, h), ed = eimg.data;
      for (let i = 0; i < w * h; i++) {
        const v = field[i] - th; // < 0 burned through
        md[i * 4 + 3] = v > 0 ? 255 : 0;
        if (v > -0.012 && v < 0.07) { // glowing rim then char
          const glow = v < 0.018;
          ed[i * 4] = glow ? 255 : 40; ed[i * 4 + 1] = glow ? 150 + v * 4000 : 26; ed[i * 4 + 2] = glow ? 40 : 14;
          ed[i * 4 + 3] = glow ? 255 : clamp(255 * (1 - (v - 0.018) / 0.052), 0, 255);
        }
      }
      mx.putImageData(mimg, 0, 0); ex.putImageData(eimg, 0, 0);
      ctx.drawImage(B, 0, 0);
      const a = tmp('burnA', W, H), ax = a.getContext('2d');
      ax.drawImage(A, 0, 0); ax.globalCompositeOperation = 'destination-in'; ax.drawImage(mask, 0, 0, W, H);
      ctx.drawImage(a, 0, 0);
      ctx.drawImage(edge, 0, 0, W, H);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.filter = 'blur(8px)'; ctx.globalAlpha = 0.6; ctx.drawImage(edge, 0, 0, W, H); ctx.restore();
      // embers drifting up from the edge
      const R = rng((o.seed || 3) + 5);
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 40; i++) {
        const x0 = R() * W, life = 0.3 + R() * 0.5, born = R() * 0.8, p = (e - born) / life;
        if (p < 0 || p > 1) continue;
        const y = H * (1 - th * 0.85) - p * 220 - R() * 80, x = x0 + Math.sin(p * 6 + i) * 18;
        ctx.globalAlpha = (1 - p) * 0.9; ctx.fillStyle = '#ffb24a'; ctx.beginPath(); ctx.arc(x, y, 2 + R() * 3, 0, TAU); ctx.fill();
      }
      ctx.restore();
    },
  },
  tear: {
    dur: 0.6, sfx: { type: 'rip', gain: 0.65, lead: 0.02 },
    draw(ctx, A, B, e, W, H, o) {
      const R = rng((o.seed || 7) + 11), pts = [];
      for (let y = -20; y <= H + 20; y += 26) pts.push([W / 2 + (R() - 0.5) * 70 + (y / H - 0.5) * 120, y]);
      const k = ease.inCubic(clamp(e * 1.15));
      ctx.drawImage(B, 0, 0);
      const half = (side) => {
        ctx.save();
        const dx = side * k * W * 0.75, rot = side * k * 0.25;
        ctx.translate(W / 2 + dx, H / 2 + k * 80); ctx.rotate(rot); ctx.translate(-W / 2, -H / 2);
        ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 30 * k;
        ctx.beginPath();
        if (side < 0) { ctx.moveTo(-60, -40); pts.forEach(([x, y]) => ctx.lineTo(x, y)); ctx.lineTo(-60, H + 40); }
        else { ctx.moveTo(W + 60, -40); pts.forEach(([x, y]) => ctx.lineTo(x, y)); ctx.lineTo(W + 60, H + 40); }
        ctx.closePath();
        ctx.fillStyle = o.paper; ctx.fill(); ctx.shadowColor = 'transparent'; ctx.clip(); ctx.drawImage(A, 0, 0);
        // white torn fibres along the rip
        ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x + side * 4, y) : ctx.moveTo(x + side * 4, y)));
        ctx.strokeStyle = o.paper; ctx.lineWidth = 10; ctx.lineJoin = 'round'; ctx.stroke();
        ctx.restore();
      };
      if (k > 0.001) { half(-1); half(1); } else ctx.drawImage(A, 0, 0);
    },
  },
  drip: {
    dur: 0.8, sfx: { type: 'drip', gain: 0.6, lead: 0.0 },
    draw(ctx, A, B, e, W, H, o) {
      const N = 14, R = rng((o.seed || 2) + 19), cols = [];
      for (let i = 0; i < N; i++) cols.push({ x: (i + 0.5) / N * W + (R() - 0.5) * 20, w: W / N * (1.25 + R() * 0.3), sp: 1 + R() * 0.9 });
      const ink = o.dripColor || o.ink;
      const shape = (len, off) => {
        ctx.fillStyle = ink; ctx.fillRect(0, off - 10, W, Math.max(0, len * 0.25) + 10);
        for (const c of cols) {
          const L = Math.min(H * 1.4, len * c.sp);
          ctx.fillRect(c.x - c.w / 2, off - 10, c.w, L + 10);
          ctx.beginPath(); ctx.arc(c.x, off + L, c.w / 2 * 0.92, 0, TAU); ctx.fill();
        }
      };
      if (e < 0.55) { ctx.drawImage(A, 0, 0); shape(ease.inQuad(e / 0.55) * H, 0); }
      else { ctx.drawImage(B, 0, 0); const k = ease.inQuad((e - 0.55) / 0.45); shape(H * 1.2, k * H * 1.3); }
    },
  },
  marble: {
    dur: 0.9, sfx: { type: 'drip', gain: 0.5, lead: 0.0, pitch: 0.8 },
    draw(ctx, A, B, e, W, H, o) {
      const colors = o.colors || ['#20408f', '#c9a227', '#c4371f', '#2a9c93', '#efe2c0'];
      const R = rng((o.seed || 4) + 23), drops = [];
      for (let i = 0; i < 16; i++) drops.push({ x: R() * W, y: R() * H, r: 160 + R() * 260, d: R() * 0.35, c: Math.floor(R() * colors.length) });
      const paint = (c2, k) => { // ebru stone drops: each a ring of three colours
        c2.fillStyle = colors[0]; c2.globalAlpha = clamp((k - 0.75) / 0.25); c2.fillRect(0, 0, W, H); c2.globalAlpha = 1;
        for (const d of drops) {
          const p = clamp((k - d.d) / (1 - d.d)), r = d.r * ease.outCubic(p);
          if (r < 1) continue;
          for (let j = 0; j < 3; j++) { c2.fillStyle = colors[(d.c + j * 2) % colors.length]; c2.beginPath(); c2.arc(d.x, d.y, r * (1 - j * 0.3), 0, TAU); c2.fill(); }
        }
      };
      if (e < 0.5) { ctx.drawImage(A, 0, 0); paint(ctx, e * 2); return; }
      ctx.drawImage(B, 0, 0);
      const m = tmp('marble', W, H), mx = m.getContext('2d');
      paint(mx, 1);
      const r = ease.inOut((e - 0.5) * 2) * Math.hypot(W, H) * 0.6;
      mx.globalCompositeOperation = 'destination-out';
      mx.beginPath(); for (let i = 0; i <= 96; i++) { const a = i / 96 * TAU, rr = r * (1 + 0.05 * Math.sin(a * 6)); i ? mx.lineTo(W / 2 + Math.cos(a) * rr, H / 2 + Math.sin(a) * rr) : mx.moveTo(W / 2 + Math.cos(a) * rr, H / 2 + Math.sin(a) * rr); } mx.closePath(); mx.fill();
      ctx.drawImage(m, 0, 0);
      ctx.beginPath(); for (let i = 0; i <= 96; i++) { const a = i / 96 * TAU, rr = r * (1 + 0.05 * Math.sin(a * 6)); i ? ctx.lineTo(W / 2 + Math.cos(a) * rr, H / 2 + Math.sin(a) * rr) : ctx.moveTo(W / 2 + Math.cos(a) * rr, H / 2 + Math.sin(a) * rr); } ctx.closePath();
      ctx.strokeStyle = o.gold || '#c9a227'; ctx.lineWidth = 9; ctx.stroke(); ctx.strokeStyle = o.ink; ctx.lineWidth = 2; ctx.stroke();
    },
  },
  tiles: {
    dur: 0.8, sfx: { type: 'clack', gain: 0.55, lead: 0.0 },
    draw(ctx, A, B, e, W, H, o) {
      const cols = 6, rows = 7, tw = W / cols, th = H / rows;
      ctx.fillStyle = o.ink; ctx.fillRect(0, 0, W, H);
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
        const d = (i + j) / (cols + rows - 2) * 0.5, p = clamp((e - d) / 0.5), c = Math.cos(Math.PI * ease.inOut(p));
        const img = c >= 0 ? A : B, w = tw * Math.abs(c) - 2, x = i * tw + (tw - w) / 2, y = j * th + 1;
        if (w < 1) continue;
        ctx.drawImage(img, i * tw, j * th, tw, th, x, y, w, th - 2);
        if (Math.abs(c) < 0.6) { // the glazed edge catching light mid-flip
          ctx.fillStyle = o.tileBack || 'rgba(255,255,255,0.5)'; ctx.globalAlpha = (0.6 - Math.abs(c)) * 1.2; ctx.fillRect(x, y, w, th - 2); ctx.globalAlpha = 1;
        }
      }
    },
  },
  doors: {
    dur: 0.9, sfx: { type: 'door', gain: 0.6, lead: 0.05 },
    draw(ctx, A, B, e, W, H, o) {
      const first = e < 0.5, k = first ? ease.outBounce(clamp(e * 2.2)) : 1 - ease.inOut(clamp((e - 0.5) * 2.2 - 0.1));
      ctx.drawImage(first ? A : B, 0, 0);
      const dw = W / 2 * k;
      for (const side of [-1, 1]) {
        const x = side < 0 ? 0 : W - dw;
        ctx.save(); ctx.beginPath(); ctx.rect(x, 0, dw, H); ctx.clip();
        // the door is drawn at full width, slid in from its side
        const ox = side < 0 ? dw - W / 2 : W - dw;
        if (o.doorFill) o.doorFill(ctx, ox, 0, W / 2, H, side);
        else defaultDoor(ctx, ox, 0, W / 2, H, side, o);
        ctx.restore();
        ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(side < 0 ? dw - 8 : W - dw, 0, 8, H);
      }
    },
  },
};

function defaultDoor(ctx, x, y, w, h, side, o) {
  ctx.fillStyle = o.ink; ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = o.paper; ctx.lineWidth = 4;
  for (const [py, ph] of [[0.05, 0.4], [0.52, 0.43]]) ctx.strokeRect(x + w * 0.12, y + h * py, w * 0.76, h * ph);
  ctx.fillStyle = o.accent; ctx.beginPath(); ctx.arc(side < 0 ? x + w - 30 : x + 30, y + h / 2, 12, 0, TAU); ctx.fill();
}

const fieldCache = new Map();
function burnField(w, h, seed) {
  const key = `${w}x${h}:${seed}`;
  if (fieldCache.has(key)) return fieldCache.get(key);
  const R = rng(seed * 7 + 1), g = 18, gw = Math.ceil(w / g) + 2, gh = Math.ceil(h / g) + 2, grid = new Float32Array(gw * gh).map(() => R());
  const f = new Float32Array(w * h);
  const ox = w * (0.3 + R() * 0.4), oy = h * 1.05;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const gx = x / g, gy = y / g, i = Math.floor(gx), j = Math.floor(gy), fx = gx - i, fy = gy - j;
    const s = t => t * t * (3 - 2 * t), a = grid[j * gw + i], b = grid[j * gw + i + 1], c = grid[(j + 1) * gw + i], d = grid[(j + 1) * gw + i + 1];
    const n = lerp(lerp(a, b, s(fx)), lerp(c, d, s(fx)), s(fy)) + (R() - 0.5) * 0.04;
    const dist = Math.hypot((x - ox) / w, (y - oy) / h) / 1.1;
    f[y * w + x] = dist * 0.72 + n * 0.3;
  }
  fieldCache.set(key, f);
  return f;
}

export const transitionNames = Object.keys(TRANSITIONS);
