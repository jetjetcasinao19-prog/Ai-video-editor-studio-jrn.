// Stage effects the styles share: freeze frames, impact shakes and the sound
// effects the engine adds by itself (on transitions and freezes).
//
//   meta.freezes = [{ t: 12.4, dur: 1.2, label: 'YEP, THAT WAS HIM' }]
//       the painting stops dead (record scratch), turns to an old photo and
//       gets a tilted label; the voice keeps going. Good for "wait…" moments.
//   meta.autoShake (default true): every loud impact sfx in `sfx` (stamp,
//       thud, boom, hit, slam, cannon, door, gong, thunder, alarm, knock with
//       gain ≥ 0.5) shakes the painting a little at that moment.
//   meta.autoSfx (default true): every transition gets its matching sound
//       (unless the story already has a sound within 0.25 s of the cut), and
//       every freeze gets a record scratch.
import { clamp, ease } from './core.mjs';
import { shake } from './core.mjs';
import { TRANSITIONS } from './transitions.mjs';

export function freezeAt(meta, t) {
  for (const f of meta.freezes || []) if (t >= f.t && t < f.t + (f.dur || 1)) return f;
  return null;
}

const IMPACT = { stamp: 9, thud: 10, boom: 18, hit: 14, slam: 14, cannon: 20, door: 10, gong: 12, thunder: 16, alarm: 8, knock: 5 };
export function impacts(meta, sfx = []) {
  if (meta.autoShake === false) return [];
  return sfx.filter(s => IMPACT[s.type] && (s.gain ?? 0.5) >= 0.5).map(s => ({ t: s.t, amp: IMPACT[s.type] * clamp(s.gain ?? 0.5, 0.5, 1.2) }));
}
// Shake the painting (call before drawing it). Zooms in a hair so no edge shows.
export function applyShake(ctx, list, t, W, H) {
  let dx = 0, dy = 0;
  for (const s of list) { if (t < s.t || t > s.t + 0.4) continue; dx += shake(t, s.t, s.amp, 0.4, 41); dy += shake(t, s.t + 0.011, s.amp * 0.8, 0.4, 33); }
  if (!dx && !dy) return;
  const z = 1 + (Math.abs(dx) + Math.abs(dy)) * 2.2 / Math.min(W, H);
  ctx.translate(W / 2 + dx, H / 2 + dy); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
}

// The freeze look: an old photo (drawn by the style through `filter`) plus a
// tilted label slapped on the picture.
export const FREEZE_FILTER = 'grayscale(0.85) sepia(0.25) contrast(1.15) brightness(0.97)';
export function freezeLabel(ctx, area, f, t, theme) {
  if (!f.label) return;
  const k = ease.outBack(clamp((t - f.t) / 0.25)), out = clamp((t - (f.t + (f.dur || 1) - 0.15)) / 0.15);
  ctx.save();
  ctx.translate(area.x + area.w / 2, area.y + area.h * (f.y ?? 0.78)); ctx.rotate(-0.06); ctx.scale(k, k); ctx.globalAlpha = 1 - out;
  ctx.font = theme.font(64); const w = Math.min(area.w - 60, ctx.measureText(f.label).width + 70);
  ctx.fillStyle = theme.band; ctx.fillRect(-w / 2, -50, w, 100);
  ctx.strokeStyle = theme.bandEdge; ctx.lineWidth = 6; ctx.strokeRect(-w / 2 + 8, -42, w - 16, 84);
  ctx.fillStyle = theme.fill; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  let size = 64; while (ctx.measureText(f.label).width > w - 50 && size > 30) { size -= 2; ctx.font = theme.font(size); }
  ctx.fillText(f.label, 0, 4);
  ctx.restore();
}

// Sound effects the engine adds by itself. `styleSfx` = the style's own
// transition sounds, `def` = the style's default transition.
export function autoSfx(meta, scenes, sfx = [], styleSfx = {}, def = 'cut') {
  if (meta.autoSfx === false) return [];
  const near = (t, a = 0.25, b = 0.3) => sfx.some(s => s.t >= t - a && s.t <= t + b);
  const out = [];
  scenes.forEach((sc, i) => {
    if (!i) return;
    const type = sc.trans || def, e = styleSfx[type] || TRANSITIONS[type]?.sfx;
    if (!e || type === 'cut' || near(sc.start)) return;
    out.push({ t: Math.max(0, sc.start - (e.lead || 0)), type: e.type, gain: e.gain ?? 0.5, pitch: e.pitch ?? 1, auto: true });
  });
  for (const f of meta.freezes || []) if (!near(f.t, 0.1, 0.1)) out.push({ t: f.t, type: 'scratch', gain: 0.7, auto: true });
  return out;
}
