// FX reel (OTTOMAN): every new transition, in-scene effect and sound in one
// short. Not a post — a catalogue to look at and copy from.
//   node demo/make-captions.mjs demo/fx-ottoman && node render.mjs demo/fx-ottoman
// Each scene is 2.4 s; its caption names the effect it shows.
import { clamp, lerp, ease, tween, pop } from '../../lib/core.mjs';
import { land, interior, lamp, compassRose } from '../../styles/ottoman/scenes.mjs';

const D = 2.4;
export const LABELS = [
  'Shake and impact.', 'Page turn.', 'Burn.', 'Paper tear.', 'Ink drip.', 'Camera shutter.', 'Whip pan.',
  'Zoom through.', 'Spin.', 'Glitch.', 'Ebru marble.', 'Tile flip.', 'Palace doors.', 'Freeze frame.', 'Light rays.',
];

export const meta = {
  title: 'FX reel — OTTOMAN', slug: 'fx-reel-ottoman', style: 'ottoman',
  width: 1080, height: 1920, fps: 30, duration: LABELS.length * D + 0.4,
  voice: 'voice.mp3', seed: 13, captionChars: 22, brandKit: '',
  hook: { text: 'Every *new effect*', until: 1.2 },
  freezes: [{ t: 13 * D + 1.0, dur: 1.2, label: 'THE SULTAN WAS NOT AMUSED' }],
};

const S0 = i => i * D;
export const scenes = [
  { start: 0, title: 'Shake + Impact', draw(ctx, u, S) {
    const { k, P, W } = S; interior(ctx, S); lamp(ctx, S, W / 2, 200, 1);
    k.seal(ctx, W / 2, 600, 170, '· IMPERIAL DECREE · ', 'FIRMAN', clamp((u - 0.45) / 0.4));
    S.fx.impact(ctx, u, 0.6, W / 2, 600, { r: 260, color: P.verm });
    S.fx.burst(ctx, u, 0.6, W / 2, 640, { kind: 'dust', n: 18 });
  } },
  { start: S0(1), title: 'Page Turn', trans: 'page', draw(ctx, u, S) {
    const { k, P, W } = S; interior(ctx, S);
    k.openBook(ctx, W / 2, 620, 560, 360, {});
    k.figure(ctx, 230, 1000, { s: 1.2, robe: P.green, robeP: 'dots', hat: 'turban', beard: 'short', armF: [1.2, 0.4] });
  } },
  { start: S0(2), title: 'Burn', trans: 'burn', draw(ctx, u, S) {
    const { k, P, W } = S; land(ctx, S, { night: true });
    k.dome(ctx, W / 2, 760, 170);
    S.fx.burst(ctx, u, 0.5, W / 2, 400, { kind: 'sparks', n: 30, colors: ['#ffd36b', '#ff9a3c'] });
  } },
  { start: S0(3), title: 'Paper Tear', trans: 'tear', draw(ctx, u, S) {
    const { k, P, W } = S; land(ctx, S);
    const draw = tween(u, 0.3, 0.9, ease.outBack);
    k.figure(ctx, W / 2, 1000, { s: 1.6, robe: P.verm, robeP: 'cintamani', hat: 'turban', plume: P.lapis, beard: 'long', mood: 'happy', armF: [lerp(0.2, 2.6, draw), 0.2],
      hold: (c, a) => { c.rotate(-a + Math.PI); c.fillStyle = '#dfe6ee'; c.strokeStyle = P.ink; c.lineWidth = 2; c.beginPath(); c.moveTo(-5, 0); c.quadraticCurveTo(-12, -120, 6, -200); c.lineTo(8, 0); c.closePath(); c.fill(); c.stroke(); } });
    S.fx.burst(ctx, u, 0.9, W / 2 + 120, 420, { kind: 'stars', n: 10 });
  } },
  { start: S0(4), title: 'Ink Drip', trans: 'drip', draw(ctx, u, S) {
    const { k, P, W, H } = S; land(ctx, S, { horizon: 420 });
    k.waves(ctx, 0, 560, W, H - 560, S.t);
    k.galley(ctx, W / 2, 650, 1.3, S.t, null, Math.sin(u * 2) * 0.05);
  } },
  { start: S0(5), title: 'Camera Shutter', trans: 'shutter', draw(ctx, u, S) {
    const { k, P, W } = S; land(ctx, S);
    k.sun(ctx, W / 2, 300, 120, S.t);
    k.cypress(ctx, 200, 900, 420, S.t); k.cypress(ctx, 740, 900, 420, S.t, 2);
    S.fx.flash(ctx, u, 1.1, { color: '#fff3c4' });
  } },
  { start: S0(6), title: 'Whip Pan', trans: 'whip', draw(ctx, u, S) {
    const { k, P, W } = S; land(ctx, S);
    S.fx.speedLines(ctx, u, 0.1, 1.8, { color: P.goldDark });
    for (let i = 0; i < 3; i++) k.figure(ctx, 180 + i * 290, 980, { s: 1.0, walk: u * 7 + i, robe: [P.lapis, P.green, P.ochre][i], robeP: 'dots', hat: 'turban', face: 1, armF: [0.9, 0.3] });
  } },
  { start: S0(7), title: 'Zoom Through', trans: 'zoom', draw(ctx, u, S) {
    const { k, P, W } = S; interior(ctx, S);
    S.fx.punch(ctx, u, 1.0, 0.2, 0.5, W / 2, 560);
    k.seal(ctx, W / 2, 560, 230, '· SEAL OF THE SULTAN · ', 'TUĞRA', 1);
  } },
  { start: S0(8), title: 'Spin', trans: 'spin', draw(ctx, u, S) {
    const { k, P, W } = S; ctx.fillStyle = P.paper; ctx.fillRect(0, 0, W, S.H);
    compassRose(ctx, k, P, W / 2, 540, 360, u * 0.8);
    S.fx.burst(ctx, u, 0.7, W / 2, 540, { kind: 'stars', n: 14, speed: 1.3 });
  } },
  { start: S0(9), title: 'Glitch', trans: 'glitch', draw(ctx, u, S) {
    const { k, P, W } = S; interior(ctx, S);
    k.ibm1401(ctx, W / 2, 900, 1.2, S.t, 0);
  } },
  { start: S0(10), title: 'Ebru Marble', trans: 'marble', draw(ctx, u, S) {
    const { k, P, W } = S; land(ctx, S);
    for (let i = 0; i < 7; i++) k.tulip(ctx, 120 + i * 120, 960, 1.6, [P.verm, P.lapis, P.pink][i % 3], 0, S.t);
    S.fx.burst(ctx, u, 0.4, W / 2, 500, { kind: 'petals', n: 30, speed: 1.2 });
  } },
  { start: S0(11), title: 'Tile Flip', trans: 'tiles', draw(ctx, u, S) {
    const { k, P, W } = S; interior(ctx, S);
    k.figure(ctx, W / 2, 1000, { s: 1.5, robe: P.lapis, robeP: 'flowers', hat: 'crown', mood: 'happy', armF: [2.4, 0.3], armB: [-0.4, 0.2] });
    S.fx.burst(ctx, u, 0.9, W / 2, 420, { kind: 'coins', n: 20 });
  } },
  { start: S0(12), title: 'Palace Doors', trans: 'doors', draw(ctx, u, S) {
    const { k, P, W } = S; interior(ctx, S);
    k.figure(ctx, W / 2, 1000, { s: 1.6, robe: P.verm, robeP: 'cintamani', hat: 'crown', mood: 'happy', armF: [2.6, 0.2], armB: [-0.3, 0.3] });
    S.fx.spotlight(ctx, u, 0.3, W / 2, 680, 300, { dark: 0.6 });
    S.fx.impact(ctx, u, 1.2, W / 2, 400, { r: 170, color: P.gold });
  } },
  { start: S0(13), title: 'Freeze Frame', trans: 'cut', draw(ctx, u, S) {
    const { k, P, W } = S; land(ctx, S);
    const j = Math.abs(Math.sin(u * 4)), y = 1000 - j * 200;
    ctx.save(); S.fx.squash(ctx, u, 0.39, W / 2, 1000, 0.3);
    k.figure(ctx, W / 2, y, { s: 1.5, robe: P.ochre, robeP: 'stripes', robePc: P.vermDark, hat: 'fez', mood: 'happy', armF: [2.8, 0.4], armB: [-2.4, 0.3] });
    ctx.restore();
  } },
  { start: S0(14), title: 'Light Rays', trans: 'iris', draw(ctx, u, S) {
    const { k, P, W, H } = S; k.goldSky(ctx, 0, 0, W, H, S.t);
    S.fx.rays(ctx, W / 2, 520, u, { color: '#fff3c4', alpha: 0.3 });
    k.dome(ctx, W / 2, 900, 220, P.lapisLight);
    S.fx.burst(ctx, u, 0.9, W / 2, 500, { kind: 'sparks', n: 30 });
  } },
];

export const sfx = [
  { t: 0.6, type: 'stamp', gain: 0.9 }, { t: 0.6, type: 'cannon', gain: 0.55 },
  { t: S0(1) + 0.4, type: 'strum', gain: 0.5 },
  { t: S0(2) + 0.5, type: 'sparkle', gain: 0.5 },
  { t: S0(3) + 0.3, type: 'sword', gain: 0.7 },
  { t: S0(4) + 0.5, type: 'waves', gain: 0.5 },
  { t: S0(5) + 1.1, type: 'zil', gain: 0.6 },
  { t: S0(6) + 0.3, type: 'hooves', gain: 0.6 },
  { t: S0(7) + 1.0, type: 'gong', gain: 0.6 },
  { t: S0(8) + 0.7, type: 'sparkle', gain: 0.6 },
  { t: S0(9) + 0.5, type: 'static', gain: 0.4 },
  { t: S0(10) + 0.4, type: 'strum', gain: 0.5, pitch: 1.33 },
  { t: S0(11) + 0.9, type: 'coins', gain: 0.6 }, { t: S0(11) + 1.1, type: 'crowd', gain: 0.5 },
  { t: S0(12) + 0.2, type: 'reverse', gain: 0.6 }, { t: S0(12) + 1.2, type: 'hit', gain: 0.8 }, { t: S0(12) + 1.3, type: 'applause', gain: 0.5 },
  { t: S0(14) + 0.9, type: 'sparkle', gain: 0.6 }, { t: S0(14) + 0.9, type: 'riser', gain: 0.4 },
];

export const music = {
  bpm: 100, root: 'D', maqam: 'hicaz', gain: 0.3,
  sections: [{ from: 0, to: 12, mood: 'groove' }, { from: 12, to: 28.8, mood: 'drive' }, { from: 28.8, to: 33.6, mood: 'sad' }, { from: 33.6, to: 36.4, mood: 'triumph' }],
};
