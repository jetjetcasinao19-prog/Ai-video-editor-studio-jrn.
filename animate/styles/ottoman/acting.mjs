// Acting: named gestures for kit.figure(), so characters perform instead of
// standing with an arm out. Use: k.figure(ctx, x, y, { ...LOOK, ...act('shrug', u) })
// Each returns the figure's arm angles (and mood) for that gesture at time u;
// `k` (0..1) blends from a resting pose into the gesture.
import { clamp, lerp } from '../../lib/core.mjs';

const REST = { armF: [0.35, 0.2], armB: [0.15, 0.25] };
const mix = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];

export const GESTURES = {
  rest:     () => ({ ...REST }),
  point:    u => ({ armF: [1.62 + Math.sin(u * 2) * 0.03, 0.02] }),
  present:  u => ({ armF: [1.25, -0.5], armB: [0.9, -0.4] }),
  wave:     u => ({ armF: [2.55 + Math.sin(u * 9) * 0.28, 0.35], mood: 'happy' }),
  cheer:    u => ({ armF: [2.85 + Math.sin(u * 7) * 0.12, 0.15], armB: [2.85 + Math.cos(u * 7) * 0.12, 0.15], mood: 'happy' }),
  shrug:    u => ({ armF: [0.55, 1.95], armB: [0.5, 1.8], mood: 'calm' }),
  think:    u => ({ armF: [1.3, 2.35], mood: 'calm', look: -0.25 }),
  worry:    u => ({ armF: [0.8, 1.6], armB: [0.75, 1.6], mood: 'sad' }),
  angry:    u => ({ armF: [2.5 + Math.sin(u * 14) * 0.18, -0.5], mood: 'sad' }),
  surprise: u => ({ armF: [2.2, 0.9], armB: [2.1, 0.9], mood: 'happy' }),
  count:    u => ({ armF: [1.5 + Math.sin(u * 5) * 0.15, 0.6] }),
  walk:     u => ({ walk: u * 8, armF: [0.35 + Math.sin(u * 8) * 0.3, 0.2], armB: [0.35 - Math.sin(u * 8) * 0.3, 0.2] }),
};

// act('shrug', u, k) → figure options; k blends in from rest (use tween(u, at, at + 0.3))
export function act(name, u = 0, k = 1) {
  const g = (GESTURES[name] || GESTURES.rest)(u), q = clamp(k);
  const out = { ...g };
  out.armF = mix(REST.armF, g.armF || REST.armF, q);
  out.armB = mix(REST.armB, g.armB || REST.armB, q);
  if (q < 0.5) delete out.mood;
  return out;
}
