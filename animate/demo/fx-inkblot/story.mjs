// FX reel (INKBLOT): every new transition, in-scene effect and sound in one
// short. Not a post — a catalogue to look at and copy from.
//   node render.mjs demo/fx-inkblot
// Each scene is 2.4 s; its caption names the effect it shows.
import { clamp, lerp, ease, tween, pop } from '../../lib/core.mjs';
import { plate, dream, night } from '../../styles/inkblot/scenes.mjs';
import { P } from '../../styles/inkblot/kit.mjs';

const D = 2.4;
export const LABELS = [
  'Shake and impact.', 'Page turn.', 'Burn.', 'Paper tear.', 'Ink drip.', 'Camera shutter.', 'Whip pan.',
  'Zoom through.', 'Spin.', 'Glitch.', 'Marble.', 'Tile flip.', 'Doors and spotlight.', 'Freeze frame.', 'Light rays.',
];

export const meta = {
  title: 'FX reel — INKBLOT', slug: 'fx-reel-inkblot', style: 'inkblot',
  width: 1080, height: 1920, fps: 30, duration: LABELS.length * D + 0.4,
  voice: 'voice.mp3', seed: 5, captionChars: 22, brandKit: 'mindtrace',
  hook: { text: 'Every *new effect*', until: 1.2 },
  // freeze frame: the painting stops, turns into an old photo, gets a label
  freezes: [{ t: 13 * D + 1.0, dur: 1.2, label: "YEP. THAT'S ME." }],
};

const S0 = i => i * D;
export const scenes = [
  { start: 0, title: 'Shake + Impact', draw(ctx, u, S) {
    const { k } = S; plate(ctx, S);
    k.door(ctx, S.W / 2, 930, 1.35, 0, {});
    k.stamp(ctx, 'CLOSED', S.W / 2, 520, 120, pop(u, 0.6), -0.12);
    S.fx.impact(ctx, u, 0.6, S.W / 2, 520, { r: 220, color: P.red });
    S.fx.burst(ctx, u, 0.6, S.W / 2, 560, { kind: 'dust', n: 18 });
  } },
  { start: S0(1), title: 'Page Turn', trans: 'page', draw(ctx, u, S) {
    const { k } = S; plate(ctx, S, { seed: 7 });
    k.figure(ctx, lerp(200, 700, u / D), 940, { s: 1.6, walk: u * 1.3, hat: 'bowler', armL: [0.3, 0.2], armR: [-0.3, 0.2], mood: 'calm' });
    k.scrawl(ctx, 'off to work', 470, 300, 70, tween(u, 0.6, 1.4));
  } },
  { start: S0(2), title: 'Burn', trans: 'burn', draw(ctx, u, S) {
    const { k } = S; plate(ctx, S, { seed: 9 });
    k.rect(ctx, 170, 220, 600, 640, P.paperLight, P.ink, 6);
    k.figure(ctx, 470, 800, { s: 1.4, mood: 'smile', hair: 'bob', skirt: true, armR: [-2.4, 0.3] });
    k.scrawl(ctx, 'the old me', 470, 930, 64, tween(u, 0.8, 1.5));
  } },
  { start: S0(3), title: 'Paper Tear', trans: 'tear', draw(ctx, u, S) {
    const { k } = S; plate(ctx, S, { seed: 11 });
    k.figure(ctx, 470, 980, { s: 1.9, mood: u > 0.8 ? 'shock' : 'calm', armL: u > 0.8 ? [-2.6, 0.2] : [0.2, 0.1], armR: u > 0.8 ? [-2.6, 0.2] : [0.2, 0.1] });
    S.fx.burst(ctx, u, 0.8, 470, 330, { kind: 'ink', n: 22 });
  } },
  { start: S0(4), title: 'Ink Drip', trans: 'drip', draw(ctx, u, S) {
    const { k } = S; plate(ctx, S, { blot: false });
    k.blot(ctx, 470, 520, 700 * ease.outCubic(clamp(u / 1.2)) + 10, 760 * ease.outCubic(clamp(u / 1.2)) + 10, { seed: 31, live: 1, t: S.t });
    S.fx.rings(ctx, u, 0.9, 470, 520, { color: P.red, r: 420 });
  } },
  { start: S0(5), title: 'Camera Shutter', trans: 'shutter', draw(ctx, u, S) {
    const { k } = S; plate(ctx, S, { seed: 13 });
    k.eye(ctx, 470, 520, 260, { open: 1, look: [Math.sin(u * 3) * 0.6, 0] });
    S.fx.flash(ctx, u, 1.1, { color: '#fffaf0' });
  } },
  { start: S0(6), title: 'Whip Pan', trans: 'whip', draw(ctx, u, S) {
    const { k } = S; dream(ctx, S);
    S.fx.speedLines(ctx, u, 0.1, 1.8, { color: P.ink });
    k.figure(ctx, 470, 980, { s: 1.7, walk: u * 2.4, lean: 0.12, hat: 'cap', mood: 'smile', armL: [0.9, 0.5], armR: [-0.9, 0.5] });
  } },
  { start: S0(7), title: 'Zoom Through', trans: 'zoom', draw(ctx, u, S) {
    const { k } = S; plate(ctx, S, { seed: 15 });
    S.fx.punch(ctx, u, 1.0, 0.18, 0.5, 470, 520);
    k.clock(ctx, 470, 520, 300, S.t * 3, {});
  } },
  { start: S0(8), title: 'Spin', trans: 'spin', draw(ctx, u, S) {
    const { k } = S; plate(ctx, S, { blot: false });
    k.spiral(ctx, 470, 530, 380, u);
    S.fx.burst(ctx, u, 0.7, 470, 530, { kind: 'stars', n: 16, speed: 1.4 });
  } },
  { start: S0(9), title: 'Glitch', trans: 'glitch', draw(ctx, u, S) {
    const { k } = S; night(ctx, S);
    k.phone(ctx, 470, 560, 2.2, S.t, { glow: 1 });
    S.fx.rings(ctx, u, 0.6, 470, 560, { color: P.red, r: 380 });
  } },
  { start: S0(10), title: 'Marble', trans: 'marble', draw(ctx, u, S) {
    const { k } = S; plate(ctx, S, { seed: 17 });
    k.figure(ctx, 470, 980, { s: 1.8, mood: 'smile', armL: [-2.5, 0.2], armR: [-2.5, 0.2], bob: Math.abs(Math.sin(u * 6)) * 20 });
    S.fx.burst(ctx, u, 0.5, 470, 330, { kind: 'confetti', n: 60, speed: 1.3 });
  } },
  { start: S0(11), title: 'Tile Flip', trans: 'tiles', draw(ctx, u, S) {
    const { k } = S; plate(ctx, S, { seed: 19 });
    k.bars(ctx, 170, 860, 600, 600, [0.3, 0.55, 0.95], ['MON', 'TUE', 'WED'], tween(u, 0.1, 1.0));
    S.fx.burst(ctx, u, 1.0, 640, 300, { kind: 'coins', n: 18 });
  } },
  { start: S0(12), title: 'Doors + Spotlight', trans: 'doors', draw(ctx, u, S) {
    const { k } = S; plate(ctx, S, { seed: 21 });
    k.figure(ctx, 470, 960, { s: 1.7, mood: u > 1.2 ? 'shock' : 'worry', look: [0, -0.4] });
    S.fx.spotlight(ctx, u, 0.4, 470, 640, 260);
    S.fx.impact(ctx, u, 1.2, 470, 330, { r: 160 });
  } },
  { start: S0(13), title: 'Freeze Frame', trans: 'cut', draw(ctx, u, S) {
    const { k } = S; dream(ctx, S);
    const j = Math.abs(Math.sin(u * 4)), y = 960 - j * 220;
    ctx.save(); S.fx.squash(ctx, u, 0.39, 470, 960, 0.3);
    k.figure(ctx, 470, y, { s: 1.6, mood: 'shock', armL: [-2.6, 0.3], armR: [-2.2, 0.6], tilt: -0.2 });
    ctx.restore();
  } },
  { start: S0(14), title: 'Light Rays', trans: 'bleed', draw(ctx, u, S) {
    const { k } = S; plate(ctx, S, { blot: false, bg: P.ink });
    S.fx.rays(ctx, 470, 520, u, { color: '#f8e7b0', alpha: 0.25 });
    k.brain(ctx, 470, 520, 1.6, S.t, { glow: 1 });
    S.fx.burst(ctx, u, 0.9, 470, 520, { kind: 'sparks', n: 30 });
  } },
];

// Sound: some placed by hand, the rest (one per transition, the freeze's
// record scratch) added by the engine itself.
export const sfx = [
  { t: 0.6, type: 'stamp', gain: 0.9 }, { t: 0.6, type: 'boom', gain: 0.7 },
  { t: S0(1) + 0.6, type: 'footsteps', gain: 0.5 },
  { t: S0(3) + 0.8, type: 'splat', gain: 0.6 },
  { t: S0(4) + 0.9, type: 'bubble', gain: 0.5 },
  { t: S0(5) + 1.1, type: 'shutter', gain: 0.6 },
  { t: S0(7) + 1.0, type: 'tick', gain: 0.5 },
  { t: S0(8) + 0.7, type: 'sparkle', gain: 0.6 },
  { t: S0(9) + 0.6, type: 'static', gain: 0.4 }, { t: S0(9) + 0.6, type: 'buzz', gain: 0.5 },
  { t: S0(10) + 0.5, type: 'ding', gain: 0.6 }, { t: S0(10) + 0.6, type: 'applause', gain: 0.5 },
  { t: S0(11) + 1.0, type: 'coins', gain: 0.6 },
  { t: S0(12) + 0.2, type: 'reverse', gain: 0.6 }, { t: S0(12) + 1.2, type: 'hit', gain: 0.8 },
  { t: S0(14) + 0.9, type: 'sparkle', gain: 0.6 }, { t: S0(14) + 0.9, type: 'riser', gain: 0.4 },
];

export const music = {
  kit: 'mind', bpm: 96, root: 'D', scale: 'dorian', gain: 0.28,
  sections: [{ from: 0, to: 12, mood: 'groove' }, { from: 12, to: 28.8, mood: 'drive' }, { from: 28.8, to: 33.6, mood: 'tense' }, { from: 33.6, to: 36.4, mood: 'triumph' }],
};
