// The channel's host: the Nakkaş, a young miniature painter who tells every
// story. He appears in an arched window for the sign-off and says the last line
// on screen — his mouth follows the loudness of the real voice-over, he blinks,
// raises his brows on stressed words, and lifts his reed pen.
// An original character for this channel (not a historical person).
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { clamp, lerp, ease, TAU } from '../../lib/core.mjs';
import { P, circle, ellipse, stroke, fillStroke, rect, poly, shade } from './kit.mjs';

const LOOK = { skin: '#b07a52', robe: '#2a8a84', robeDots: '#ecd57a', inner: '#f7eed6', turban: '#e3a32a', turbanShade: '#c4831a', sash: '#c4371f', brows: '#2a1c12', eyes: '#2a1c12' };

// Loudness of the voice per frame (0..1), cached in build/voice-env.json.
export function voiceEnvelope(dir, voice, fps) {
  const cache = path.join(dir, 'build', 'voice-env.json'), src = path.join(dir, voice);
  try { const c = JSON.parse(fs.readFileSync(cache, 'utf8')); if (c.fps === fps && c.mtime === fs.statSync(src).mtimeMs) return c.env; } catch {}
  const sr = 8000, r = spawnSync('ffmpeg', ['-v', 'error', '-i', src, '-ac', '1', '-ar', String(sr), '-f', 'f32le', '-'], { maxBuffer: 1 << 28 });
  if (r.status !== 0) return [];
  const pcm = new Float32Array(r.stdout.buffer, r.stdout.byteOffset, Math.floor(r.stdout.length / 4)), hop = sr / fps, env = [];
  for (let i = 0; i * hop < pcm.length; i++) { let s = 0, n = 0; for (let j = Math.floor(i * hop); j < Math.min(pcm.length, (i + 1) * hop); j++) { s += pcm[j] * pcm[j]; n++; } env.push(Math.sqrt(s / Math.max(1, n))); }
  const sorted = [...env].sort((a, b) => a - b), top = sorted[Math.floor(sorted.length * 0.97)] || 1;
  const out = env.map(v => +clamp(v / top).toFixed(3));
  try { fs.mkdirSync(path.dirname(cache), { recursive: true }); fs.writeFileSync(cache, JSON.stringify({ fps, mtime: fs.statSync(src).mtimeMs, env: out })); } catch {}
  return out;
}
export const envAt = (env, t, fps) => { const i = Math.floor(t * fps); return env.length ? (env[Math.max(0, Math.min(env.length - 1, i))] * 0.6 + (env[Math.max(0, i - 1)] || 0) * 0.4) : 0; };

// The bust, origin at the bottom centre, about 430·s tall.
// o: talk 0..1 (mouth), t (time, for blinks and breathing), mood ('calm'|'smile'|'wow'), pen 0..1 (raise the reed pen), look (-1..1 eyes)
export function host(ctx, x, y, s = 1, o = {}) {
  const t = o.t || 0, talk = clamp(o.talk || 0), pen = clamp(o.pen || 0), mood = o.mood || 'calm';
  const blink = ((t + 0.37) % 3.4) < 0.11 ? 1 : 0, breathe = Math.sin(t * 1.7) * 3, brow = (o.brow ?? 0) + talk * 4;
  ctx.save(); ctx.translate(x, y + breathe * 0.3); ctx.scale(s, s);
  // kaftan and shoulders
  ctx.beginPath(); ctx.moveTo(-175, 0); ctx.quadraticCurveTo(-172, -150, -112, -178); ctx.quadraticCurveTo(0, -205, 112, -178); ctx.quadraticCurveTo(172, -150, 175, 0); ctx.closePath(); fillStroke(ctx, LOOK.robe, P.ink, 3);
  ctx.save(); ctx.clip(); for (let i = 0; i < 26; i++) { const dx = -160 + (i * 61) % 320, dy = -20 - ((i * 37) % 160); for (const [ox, oy] of [[0, 0], [7, 5], [-7, 5]]) circle(ctx, dx + ox, dy + oy, 3, LOOK.robeDots, null); } ctx.restore();
  poly(ctx, [[-46, -196], [46, -196], [0, -96]], LOOK.inner, P.ink, 2);
  ctx.beginPath(); ctx.moveTo(-46, -196); ctx.lineTo(0, -96); ctx.lineTo(46, -196); stroke(ctx, P.goldLight, 6);
  ctx.beginPath(); ctx.moveTo(-150, -60); ctx.quadraticCurveTo(0, -40, 150, -60); stroke(ctx, LOOK.sash, 10);
  circle(ctx, 120, -70, 15, P.ink, P.goldDark, 2); // his ink pot on the sash
  // the raised hand with the reed pen
  // neck and head
  rect(ctx, -24, -232, 48, 44, LOOK.skin, P.ink, 2);
  ellipse(ctx, -66, -286, 12, 18, 0, LOOK.skin, P.ink, 2); ellipse(ctx, 66, -286, 12, 18, 0, LOOK.skin, P.ink, 2);
  ellipse(ctx, 0, -292, 66, 78, 0, LOOK.skin, P.ink, 2.5);
  // eyes (they blink), brows (they lift on stressed words)
  const lx = (o.look || 0) * 4;
  for (const sx of [-1, 1]) {
    const ex = sx * 25, ey = -300;
    if (blink) { ctx.beginPath(); ctx.moveTo(ex - 15, ey); ctx.quadraticCurveTo(ex, ey + 7, ex + 15, ey); stroke(ctx, P.ink, 2.5); }
    else {
      const oh = mood === 'wow' ? 12 : 8;
      ctx.beginPath(); ctx.moveTo(ex - 16, ey + 1); ctx.quadraticCurveTo(ex - 2, ey - oh - 2, ex + 16, ey - 1); ctx.quadraticCurveTo(ex + 2, ey + oh, ex - 16, ey + 1); ctx.closePath(); fillStroke(ctx, P.white, P.ink, 2);
      ctx.save(); ctx.clip(); circle(ctx, ex + lx, ey, 7, LOOK.eyes, null); circle(ctx, ex + lx + 2.5, ey - 2, 2, P.white, null); ctx.restore();
    }
    ctx.beginPath(); ctx.moveTo(ex - 16, ey - 18 - brow - (mood === 'wow' ? 6 : 0)); ctx.quadraticCurveTo(ex, ey - 26 - brow - (mood === 'wow' ? 8 : 0), ex + 16, ey - 18 - brow * 0.6); stroke(ctx, LOOK.brows, 5);
  }
  for (const sx of [-1, 1]) { ctx.save(); ctx.globalAlpha *= 0.25; circle(ctx, sx * 40, -262, 13, '#d9735a', null); ctx.restore(); }
  ctx.beginPath(); ctx.moveTo(0, -292); ctx.quadraticCurveTo(-8, -268, 2, -262); stroke(ctx, shade(LOOK.skin, -0.3), 2.5);
  // thin moustache, then the mouth: closed, half open or open with the voice
  ctx.beginPath(); ctx.moveTo(-22, -248); ctx.quadraticCurveTo(0, -256, 22, -248); stroke(ctx, LOOK.brows, 4);
  const open = talk > 0.12 ? talk : 0, mw = 13 + open * 4, mh = 2 + open * 10;
  if (open) { ellipse(ctx, 0, -236 + mh * 0.4, mw, mh, 0, '#5a1e14', P.ink, 2); if (mh > 7) rect(ctx, -mw * 0.55, -238 + mh * 0.4 - mh * 0.75, mw * 1.1, 3.5, P.white, null); }
  else { ctx.beginPath(); if (mood === 'smile') { ctx.moveTo(-16, -238); ctx.quadraticCurveTo(0, -226, 16, -238); } else { ctx.moveTo(-14, -235); ctx.lineTo(14, -235); } stroke(ctx, '#5a1e14', 3); }
  // the saffron turban, wrapped, with a spare reed pen tucked in
  ctx.beginPath(); ctx.ellipse(0, -360, 96, 58, 0, Math.PI * 0.95, Math.PI * 2.05); ctx.quadraticCurveTo(70, -320, 0, -330); ctx.quadraticCurveTo(-70, -320, -96, -356); ctx.closePath(); fillStroke(ctx, LOOK.turban, P.ink, 2.5);
  for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-88 + i * 6, -350 - i * 12); ctx.quadraticCurveTo(0, -380 - i * 14, 88 - i * 6, -350 - i * 12); stroke(ctx, LOOK.turbanShade, 3); }
  ctx.save(); ctx.translate(58, -386); ctx.rotate(0.5); rect(ctx, -2.5, -50, 5, 56, P.verm, P.ink, 1); ctx.beginPath(); ctx.moveTo(-2.5, -50); ctx.lineTo(2.5, -50); ctx.lineTo(0, -61); ctx.closePath(); ctx.fillStyle = P.ink; ctx.fill(); ctx.restore();
  if (pen > 0) {
    const e = ease.outBack(pen);
    ctx.save(); ctx.translate(104, -160); ctx.rotate(lerp(2.6, 0.12, e));
    ctx.beginPath(); ctx.moveTo(-20, 0); ctx.lineTo(20, 0); ctx.lineTo(14, -150); ctx.lineTo(-14, -150); ctx.closePath(); fillStroke(ctx, LOOK.robe, P.ink, 2.5);
    ctx.beginPath(); ctx.moveTo(-15, -128); ctx.lineTo(15, -128); stroke(ctx, P.goldLight, 6);
    circle(ctx, 0, -164, 19, LOOK.skin, P.ink, 2);
    ctx.save(); ctx.translate(4, -170); ctx.rotate(-0.25); rect(ctx, -3, -86, 7, 92, P.brownLight, P.ink, 1.2); ctx.beginPath(); ctx.moveTo(-3, -86); ctx.lineTo(4, -86); ctx.lineTo(0, -100); ctx.closePath(); ctx.fillStyle = P.ink; ctx.fill(); ctx.restore();
    ctx.restore();
  }
  ctx.restore();
}

// The arched window he speaks from (the painting's own frame breaks open for him).
export function hostWindow(ctx, x, base, w, h, k = 1) {
  ctx.save();
  const hh = h * k, arch = () => { ctx.beginPath(); ctx.moveTo(x - w / 2, base); ctx.lineTo(x - w / 2, base - hh * 0.62); ctx.bezierCurveTo(x - w / 2, base - hh * 0.92, x - w * 0.12, base - hh * 0.9, x, base - hh); ctx.bezierCurveTo(x + w * 0.12, base - hh * 0.9, x + w / 2, base - hh * 0.92, x + w / 2, base - hh * 0.62); ctx.lineTo(x + w / 2, base); ctx.closePath(); };
  arch();
  const g = ctx.createLinearGradient(0, base - hh, 0, base); g.addColorStop(0, '#20305e'); g.addColorStop(1, '#141c3a');
  ctx.fillStyle = g; ctx.fill(); ctx.save(); ctx.clip();
  return { close() { ctx.restore(); arch(); ctx.lineWidth = 12; ctx.strokeStyle = P.goldDark; ctx.stroke(); ctx.lineWidth = 6; ctx.strokeStyle = P.goldLight; ctx.stroke(); ctx.restore(); } };
}
