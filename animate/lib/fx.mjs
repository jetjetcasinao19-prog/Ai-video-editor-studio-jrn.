// In-scene effects for every style, handed to storyboards as `S.fx`.
// All of them are deterministic (seeded), so frames render the same in every
// worker. `u` = seconds into the scene, `at` = when the effect fires
// (usually S.at('word')). Colours default to the style's palette.
//
//   S.fx.shake(ctx, u, at, amp, dur)          camera shake (call BEFORE drawing the scene)
//   S.fx.punch(ctx, u, at, amt, dur, x, y)    a quick zoom punch-in that settles (call before drawing)
//   S.fx.burst(ctx, u, at, x, y, {kind, n, spread, speed, size, colors, up})
//        kind: dust | sparks | confetti | ink | petals | paper | smoke | stars | coins | hearts
//   S.fx.impact(ctx, u, at, x, y, {r, color, lines})   manga hit: radial lines + a shock ring
//   S.fx.speedLines(ctx, u, from, to, {dir, color, n})  streaks across the picture (motion)
//   S.fx.rays(ctx, x, y, u, {color, n, r, spin, alpha}) turning light rays (a reveal, a holy moment)
//   S.fx.rings(ctx, u, at, x, y, {color, n, r})        ripples spreading out (sound, an idea landing)
//   S.fx.flash(ctx, u, at, {color, dur})               a flash of light over the whole picture
//   S.fx.spotlight(ctx, u, from, x, y, r, {dark})      darken everything but one circle (focus)
//   S.fx.wobble(u, seed, amp, speed)                   idle drift → [dx, dy] for floating things
//   S.fx.squash(ctx, u, at, x, y, amt)                 squash & stretch on landing (call before drawing the thing)
import { clamp, lerp, ease, rng, TAU, shake as shake1 } from './core.mjs';

export function makeFx(pal = {}, W = 940, H = 1060) {
  const P = { ink: '#16141a', paper: '#f8f3e7', accent: '#c61f2a', gold: '#c9a227', light: '#fff6d8', colors: ['#c61f2a', '#16141a', '#ddb14d', '#82a7c8', '#8db498'], ...pal };
  const fx = {
    shake(ctx, u, at, amp = 14, dur = 0.45) {
      const dx = shake1(u, at, amp, dur, 41), dy = shake1(u, at + 0.013, amp * 0.8, dur, 33);
      if (dx || dy) { ctx.translate(dx, dy); const z = 1 + (Math.abs(dx) + Math.abs(dy)) * 2.2 / Math.min(W, H); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2); }
    },
    punch(ctx, u, at, amt = 0.08, dur = 0.4, x, y) {
      if (u < at) return;
      const p = clamp((u - at) / dur), z = 1 + amt * (p < 0.25 ? ease.outCubic(p / 0.25) : 1 - ease.inOut((p - 0.25) / 0.75) * 0.6);
      x ??= W / 2; y ??= H / 2;
      ctx.translate(x, y); ctx.scale(z, z); ctx.translate(-x, -y);
    },
    burst(ctx, u, at, x, y, o = {}) {
      const kind = o.kind || 'dust', life = o.life || ({ smoke: 1.6, confetti: 1.8, petals: 2.2, paper: 1.8, hearts: 1.6 }[kind] || 1.0);
      const p0 = u - at;
      if (p0 < 0 || p0 > life + 0.6) return;
      const R = rng((o.seed || 1) * 7919 + Math.round(at * 100));
      const n = o.n || ({ sparks: 26, confetti: 40, ink: 18, dust: 14, smoke: 10, stars: 12, coins: 14, petals: 18, paper: 14, hearts: 10 }[kind] || 16);
      const colors = o.colors || (kind === 'confetti' ? P.colors : kind === 'sparks' || kind === 'stars' ? [P.light, P.gold] : kind === 'coins' ? [P.gold] : kind === 'ink' ? [P.ink] : kind === 'hearts' ? [P.accent] : kind === 'petals' ? ['#e8b7b0', '#e0a59b', '#f7eed6'] : kind === 'paper' ? [P.paper] : ['rgba(120,100,80,0.5)']);
      const grav = { sparks: 600, confetti: 260, ink: 900, dust: -20, smoke: -60, stars: 0, coins: 1400, petals: 60, paper: 120, hearts: -90 }[kind] ?? 300;
      const spd = (o.speed || 1) * ({ sparks: 700, confetti: 650, ink: 520, dust: 160, smoke: 60, stars: 300, coins: 650, petals: 220, paper: 380, hearts: 180 }[kind] || 300);
      const spread = o.spread ?? (kind === 'coins' || kind === 'confetti' ? 1.3 : TAU);
      const up = o.up ?? (kind === 'coins' || kind === 'confetti' ? -Math.PI / 2 : 0);
      ctx.save();
      for (let i = 0; i < n; i++) {
        const delay = R() * 0.08, t = p0 - delay, a = up + (R() - 0.5) * spread, v = spd * (0.4 + R() * 0.8);
        const sz = (o.size || 1) * (0.6 + R() * 0.8), col = colors[Math.floor(R() * colors.length)], spin = (R() - 0.5) * 14, ph = R() * TAU;
        if (t < 0 || t > life) continue;
        const drag = kind === 'smoke' || kind === 'dust' ? 2.2 : kind === 'petals' || kind === 'paper' || kind === 'confetti' ? 1.4 : 0.6;
        const k = (1 - Math.exp(-drag * t)) / drag;
        let px = x + Math.cos(a) * v * k, py = y + Math.sin(a) * v * k + 0.5 * grav * t * t;
        if (kind === 'petals' || kind === 'paper' || kind === 'confetti') px += Math.sin(t * 5 + ph) * 26;
        const fade = 1 - clamp((t - life * 0.6) / (life * 0.4));
        ctx.globalAlpha = fade; ctx.fillStyle = col; ctx.strokeStyle = col;
        ctx.save(); ctx.translate(px, py); ctx.rotate(ph + spin * t);
        if (kind === 'sparks') { ctx.lineWidth = 3 * sz; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-Math.cos(a) * 0, -16 * sz * fade); ctx.stroke(); }
        else if (kind === 'confetti' || kind === 'paper') { ctx.scale(1, Math.cos(t * 9 + ph)); ctx.fillRect(-7 * sz, -4 * sz, 14 * sz, (kind === 'paper' ? 16 : 8) * sz); }
        else if (kind === 'ink') { ctx.beginPath(); ctx.ellipse(0, 0, 9 * sz, 9 * sz * (1 + Math.min(1.5, t * 3)), 0, 0, TAU); ctx.fill(); }
        else if (kind === 'smoke' || kind === 'dust') { const r = (kind === 'smoke' ? 30 : 16) * sz * (1 + t * 1.6); ctx.globalAlpha = fade * (kind === 'smoke' ? 0.35 : 0.5); ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill(); }
        else if (kind === 'stars') { star(ctx, 0, 0, 12 * sz * (0.5 + 0.5 * Math.sin(t * 12 + ph)) + 3); }
        else if (kind === 'coins') { ctx.scale(Math.cos(t * 10 + ph), 1); ctx.beginPath(); ctx.arc(0, 0, 11 * sz, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 2; ctx.stroke(); }
        else if (kind === 'petals') { ctx.beginPath(); ctx.ellipse(0, 0, 10 * sz, 5 * sz, 0, 0, TAU); ctx.fill(); }
        else if (kind === 'hearts') { heart(ctx, 0, 0, 14 * sz); }
        ctx.restore();
      }
      ctx.restore();
    },
    impact(ctx, u, at, x, y, o = {}) {
      const p = (u - at) / 0.35;
      if (p < 0 || p > 1) return;
      const R = rng(Math.round(at * 1000) + 3), r = o.r || 120, n = o.lines || 14, col = o.color || P.ink;
      ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineCap = 'round';
      ctx.globalAlpha = 1 - p;
      for (let i = 0; i < n; i++) {
        const a = i / n * TAU + R() * 0.3, r0 = r * (0.55 + p * 0.9), r1 = r0 + r * (0.35 + R() * 0.5) * (1 - p * 0.5);
        ctx.lineWidth = 7 * (1 - p) + 1.5;
        ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); ctx.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1); ctx.stroke();
      }
      ctx.lineWidth = 10 * (1 - p); ctx.beginPath(); ctx.arc(x, y, r * (0.3 + p * 1.1), 0, TAU); ctx.stroke();
      ctx.restore();
    },
    speedLines(ctx, u, from, to, o = {}) {
      if (u < from || u > to) return;
      const k = Math.sin(Math.PI * clamp((u - from) / (to - from)));
      const step = Math.floor(u * 15), R = rng(step * 31 + 5), n = o.n || 18, dir = o.dir ?? 0;
      ctx.save(); ctx.translate(W / 2, H / 2); ctx.rotate(dir); ctx.strokeStyle = o.color || P.ink; ctx.lineCap = 'round';
      for (let i = 0; i < n; i++) {
        const y = (R() - 0.5) * H * 1.2, x = (R() - 0.5) * W * 1.2, L = 80 + R() * 260;
        ctx.globalAlpha = k * (0.25 + R() * 0.5); ctx.lineWidth = 2 + R() * 5;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + L, y); ctx.stroke();
      }
      ctx.restore();
    },
    rays(ctx, x, y, u, o = {}) {
      const n = o.n || 16, r = o.r || 1400, spin = o.spin ?? 0.12;
      ctx.save(); ctx.translate(x, y); ctx.rotate(u * spin); ctx.globalAlpha = o.alpha ?? 0.35; ctx.fillStyle = o.color || P.light;
      for (let i = 0; i < n; i++) { const a = i / n * TAU; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r, a, a + TAU / n * 0.45); ctx.closePath(); ctx.fill(); }
      ctx.restore();
    },
    rings(ctx, u, at, x, y, o = {}) {
      const n = o.n || 3, r = o.r || 220;
      ctx.save(); ctx.strokeStyle = o.color || P.accent;
      for (let i = 0; i < n; i++) {
        const p = (u - at - i * 0.15) / 0.9;
        if (p < 0 || p > 1) continue;
        ctx.globalAlpha = 1 - p; ctx.lineWidth = 8 * (1 - p) + 1; ctx.beginPath(); ctx.arc(x, y, r * ease.outCubic(p), 0, TAU); ctx.stroke();
      }
      ctx.restore();
    },
    flash(ctx, u, at, o = {}) {
      const d = o.dur || 0.35, p = (u - at) / d;
      if (p < 0 || p > 1) return;
      ctx.save(); ctx.globalAlpha = (1 - p) * (o.alpha ?? 0.85); ctx.fillStyle = o.color || P.light; ctx.fillRect(-2000, -2000, 6000, 6000); ctx.restore();
    },
    spotlight(ctx, u, from, x, y, r, o = {}) {
      const k = clamp((u - from) / 0.35);
      if (k <= 0) return;
      ctx.save();
      const g = ctx.createRadialGradient(x, y, r * 0.8, x, y, r * 1.35);
      g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(10,8,12,${(o.dark ?? 0.72) * k})`);
      ctx.fillStyle = g; ctx.fillRect(-3000, -3000, 7000, 7000); ctx.restore();
    },
    wobble(u, seed = 1, amp = 6, speed = 1) {
      return [Math.sin(u * 1.7 * speed + seed) * amp + Math.sin(u * 2.9 * speed + seed * 3) * amp * 0.4, Math.cos(u * 1.3 * speed + seed * 2) * amp * 0.8];
    },
    squash(ctx, u, at, x, y, amt = 0.25) {
      const p = (u - at) / 0.4;
      if (p < 0 || p > 1) return;
      const s = Math.sin(p * Math.PI * 2.5) * Math.pow(1 - p, 2) * amt;
      ctx.translate(x, y); ctx.scale(1 + s, 1 - s); ctx.translate(-x, -y);
    },
  };
  return fx;
}

function star(ctx, x, y, r) {
  ctx.beginPath();
  for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, rr = i % 2 ? r * 0.28 : r; i ? ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) : ctx.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  ctx.closePath(); ctx.fill();
}
function heart(ctx, x, y, s) {
  ctx.beginPath(); ctx.moveTo(x, y + s * 0.35);
  ctx.bezierCurveTo(x - s * 1.1, y - s * 0.3, x - s * 0.45, y - s * 1.05, x, y - s * 0.45);
  ctx.bezierCurveTo(x + s * 0.45, y - s * 1.05, x + s * 1.1, y - s * 0.3, x, y + s * 0.35); ctx.fill();
}
