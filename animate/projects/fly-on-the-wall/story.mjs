// "The Fly on the Wall" — an INKBLOT case file (psychology, MindTrace).
// Mischkowski, Kross & Bushman (2012), "Flies on the wall are less aggressive":
// after being insulted, people who took a self-distanced ("fly on the wall") view
// felt less angry and were less aggressive than people who relived it through
// their own eyes. Plus distanced self-talk by name (Kross et al., 2014).
// u = seconds since the scene started; S.at('word') = when that word is said.
import { clamp, lerp, ease, tween, rng, TAU, shake, pop } from '../../lib/core.mjs';
import { plate, caseCover, inkReveal } from '../../styles/inkblot/scenes.mjs';

export const meta = {
  title: 'The Fly on the Wall',
  slug: 'fly-on-the-wall-inkblot',
  style: 'inkblot',
  width: 1080, height: 1920, fps: 30,
  duration: 38.5,
  voice: 'voice.mp3',
  seed: 233,
  captionChars: 24,
  caseLine: 'THE MIND FILES  ·  CASE No. 2012  ·  CONFIDENTIAL',
  brandKit: 'mindtrace', // MindTrace (brand/mindtrace/): logo, handle, tagline, outro text
  outro: { at: 36.2 },
};

const YOU = { hair: 'bob', tie: '#c61f2a' };
const TESTER = { labcoat: true, glasses: true, hair: 'slick' };

// a housefly; t animates the wings, s scale, rot heading
function fly(ctx, k, P, x, y, s, t, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  const f = Math.sin(t * 60) * 0.25;
  ctx.save(); ctx.globalAlpha = 0.55;
  for (const sx of [-1, 1]) { ctx.save(); ctx.rotate(sx * (0.5 + f)); k.ellipse(ctx, sx * 26, -18, 26, 13, 0, '#d6e2ea', P.ink, 2); ctx.restore(); }
  ctx.restore();
  k.ellipse(ctx, 0, 6, 16, 24, 0, P.ink);
  k.circle(ctx, 0, -20, 13, P.ink);
  k.circle(ctx, -8, -24, 7, P.redDark); k.circle(ctx, 8, -24, 7, P.redDark);
  for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) k.line(ctx, sx * 10, 0 + i * 10, sx * 26, 6 + i * 14, P.ink, 3);
  ctx.restore();
}
// a thermometer: v 0..1
function thermo(ctx, k, P, x, y, h, v, col) {
  k.rect(ctx, x - 22, y - h, 44, h, P.paperLight, P.ink, 4, 22);
  k.circle(ctx, x, y + 10, 38, col, P.ink, 4);
  k.rect(ctx, x - 12, y - h * v, 24, h * v + 10, col, null, 0, 10);
  for (let i = 1; i < 6; i++) k.line(ctx, x + 22, y - h * i / 6, x + 38, y - h * i / 6, P.ink, 3);
}
// steam puffs over a head at (x, y)
function steam(ctx, k, P, x, y, t, a) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  for (let i = 0; i < 3; i++) { const p = (t * 0.8 + i / 3) % 1; k.circle(ctx, x - 40 + i * 40 + Math.sin(t * 3 + i) * 8, y - p * 120, 16 + p * 20, `rgba(198,31,42,${0.5 * (1 - p)})`); }
  ctx.restore();
}
// a test sheet on a desk
function desk(ctx, k, P, x, y, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  k.rect(ctx, -170, -14, 340, 20, P.inkSoft, P.ink, 3, 4); k.rect(ctx, -150, 6, 16, 120, P.inkSoft); k.rect(ctx, 134, 6, 16, 120, P.inkSoft);
  k.rect(ctx, -60, -26, 120, 14, P.paperLight, P.ink, 2, 2);
  ctx.restore();
}

export const scenes = [
  { // 0.1 "About to lose your temper? Picture yourself as a fly on the wall."
    start: 0, title: 'Losing Your Temper?',
    draw(ctx, u, S) {
      const { k, P, W } = S, tm = S.at('temper?'), pi = S.at('Picture'), fl = S.at('fly');
      plate(ctx, S, { alpha: 0.12, seed: 3 });
      const heat = tween(u, 0.1, tm + 0.3);
      const sh = shake(u, tm - 0.1, 6, 0.6);
      k.figure(ctx, 330 + sh, 1040, { ...YOU, s: 1.2, face: 1, look: [1, 0], mood: heat > 0.6 ? 'shock' : 'worry', armL: [0.4, 1.6], armR: [0.4, 1.6] });
      steam(ctx, k, P, 330, 560, S.t, heat);
      thermo(ctx, k, P, 800, 900, 420, lerp(0.2, 0.95, heat), P.red);
      k.scrawl(ctx, 'temper', 800, 400, 50, tween(u, tm - 0.2, tm + 0.2));
      // a fly lands on the wall
      const p = tween(u, fl - 0.6, fl + 0.2, ease.outCubic);
      if (p > 0) fly(ctx, k, P, lerp(940, 620, p), lerp(120, 260, p) + Math.sin(S.t * 9) * 6 * (1 - p), 1.2, S.t, -0.4);
      k.scrawl(ctx, 'be the fly on the wall', 420, 150, 48, tween(u, fl, fl + 0.6), { rot: -0.04 });
    },
  },
  { // 5.1 "In a 2012 study, researchers had people insulted on purpose during a test."
    start: 4.95, title: 'Insulted on Purpose', trans: 'bleed',
    draw(ctx, u, S) {
      const { k, P, W } = S, yr = S.at('2012'), ins = S.at('insulted'), ts = S.at('test');
      plate(ctx, S, { alpha: 0.08, seed: 5 });
      k.stamp(ctx, '2012', 780, 110, 60, tween(u, yr, yr + 0.25), 0.1);
      desk(ctx, k, P, 300, 900, 1.1);
      k.figure(ctx, 300, 1040, { ...YOU, s: 0.95, sit: true, face: 1, look: [0.3, 0.6], mood: u > ins + 0.3 ? 'shock' : 'worry' });
      k.figure(ctx, 740, 1040, { ...TESTER, s: 1.05, face: -1, look: [-1, 0.2], mood: 'calm', armR: [1.0, 1.2], holdR: c => k.rect(c, -30, -44, 60, 80, '#b8975c', P.ink, 3, 4) });
      const b = pop(u, ins - 0.2, 0.35);
      if (b) { ctx.save(); ctx.translate(620, 420); ctx.scale(b, b); k.rect(ctx, -210, -80, 420, 160, P.paperLight, P.ink, 4, 40); k.poly(ctx, [[40, 80], [90, 140], [100, 80]], P.paperLight, P.ink, 4); k.text(ctx, '"Is that the best', 0, -22, 36, { font: 'hand', color: P.red }); k.text(ctx, 'you can do?"', 0, 26, 36, { font: 'hand', color: P.red }); ctx.restore(); }
      k.scrawl(ctx, 'on purpose', 260, 260, 50, tween(u, ins + 0.4, ins + 0.8), { rot: -0.05 });
      k.scrawl(ctx, 'during a test', 300, 640, 40, tween(u, ts, ts + 0.4));
    },
  },
  { // 10.7 "Then some replayed the moment through their own eyes."
    start: 10.55, title: 'Through Your Own Eyes', trans: 'blink',
    draw(ctx, u, S) {
      const { k, P, W, H } = S, ey = S.at('eyes');
      plate(ctx, S, { alpha: 0.05, seed: 10 });
      // first person: the tester's face looms close, framed by your eyelids
      S.cam(lerp(1.0, 1.12, tween(u, 0, 3.6)), W / 2, 560);
      ctx.save(); ctx.fillStyle = 'rgba(198,31,42,0.10)'; ctx.fillRect(-50, -50, W + 100, H + 100); ctx.restore();
      k.figure(ctx, W / 2, 1500, { ...TESTER, s: 2.8, face: -1, look: [-0.3, 0.2], mood: 'calm', shadow: false });
      const b = 0.6 + 0.4 * Math.sin(S.t * 2);
      ctx.save(); ctx.globalAlpha = b; k.rect(ctx, 110, 800, 400, 110, P.paperLight, P.ink, 4, 30); k.text(ctx, '"...best you can do?"', 310, 856, 40, { font: 'hand', color: P.red }); ctx.restore();
      // eyelid vignette
      ctx.save(); ctx.beginPath(); ctx.rect(-60, -60, W + 120, H + 120); ctx.ellipse(W / 2, H / 2, W * 0.56, H * 0.42, 0, 0, TAU, true); ctx.fillStyle = P.ink; ctx.fill(); ctx.restore();
      k.scrawl(ctx, 'through your own eyes', W / 2, 120, 44, tween(u, ey - 0.3, ey + 0.3), { color: P.redLight });
      k.text(ctx, '♥ ' + Math.floor(96 + 20 * tween(u, 0, 3)), 150, 980, 40, { font: 'display', color: P.redLight });
    },
  },
  { // 14.28 "Others watched it like a fly on the wall."
    start: 14.15, title: 'Like a Fly on the Wall', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, ot = S.at('Others'), fl = S.at('fly');
      plate(ctx, S, { alpha: 0.08, seed: 14 });
      // the whole room, seen from the corner: small and far away
      k.rect(ctx, 120, 420, 700, 560, P.card, P.ink, 5, 6);
      k.line(ctx, 120, 860, 820, 860, P.ink, 3);
      desk(ctx, k, P, 330, 860, 0.6);
      k.figure(ctx, 330, 940, { ...YOU, s: 0.5, sit: true, face: 1, look: [1, 0], mood: 'calm', shadow: false });
      k.figure(ctx, 600, 940, { ...TESTER, s: 0.55, face: -1, look: [-1, 0], mood: 'calm', shadow: false });
      ctx.save(); ctx.globalAlpha = 0.7; k.rect(ctx, 410, 600, 200, 60, P.paperLight, P.ink, 2, 16); k.text(ctx, '"...best?"', 510, 630, 22, { font: 'hand', color: P.red }); ctx.restore();
      // the fly in the corner, with a dotted view cone
      fly(ctx, k, P, 760, 300, 1.1, S.t, 2.4);
      const v = tween(u, fl - 0.4, fl + 0.4);
      ctx.save(); ctx.setLineDash([6, 14]); ctx.globalAlpha = v;
      ctx.beginPath(); ctx.moveTo(740, 320); ctx.lineTo(160, 980); ctx.moveTo(740, 320); ctx.lineTo(820, 980); k.stroke(ctx, P.red, 4); ctx.restore();
      k.scrawl(ctx, 'from far away', 300, 300, 50, tween(u, ot, ot + 0.5), { rot: -0.05 });
    },
  },
  { // 17.34 "The fly on the wall group felt less angry and acted less aggressive."
    start: 17.25, title: 'Less Angry, Less Aggressive', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, an = S.at('angry'), ag = S.at('aggressive');
      plate(ctx, S, { alpha: 0.08, seed: 17 });
      k.text(ctx, 'ANGER', 260, 160, 42, { font: 'display' });
      k.bars(ctx, 80, 640, 360, 420, [0.85, 0.45], ['own eyes', 'fly'], tween(u, an - 0.6, an + 0.4), [P.red, P.ink]);
      k.text(ctx, 'AGGRESSION', 690, 160, 42, { font: 'display' });
      k.bars(ctx, 510, 640, 360, 420, [0.8, 0.5], ['own eyes', 'fly'], tween(u, ag - 0.6, ag + 0.2), [P.red, P.ink]);
      fly(ctx, k, P, W / 2, 800, 1.2, S.t, 0);
      k.scrawl(ctx, 'calmer', W / 2, 920, 56, tween(u, ag + 0.1, ag + 0.5));
      k.text(ctx, 'illustration, not the study\'s numbers', W / 2, 1020, 22, { color: P.inkSoft });
    },
  },
  { // 23.4 "Here's the trick. Step out of your own head."
    start: 23.3, title: 'Step Out of Your Head', trans: 'bleed',
    draw(ctx, u, S) {
      const { k, P, W } = S, sp = S.at('Step');
      plate(ctx, S, { alpha: 0.08, seed: 23 });
      k.stamp(ctx, 'THE TRICK', 220, 110, 44, tween(u, 0.05, 0.25), -0.1);
      k.figure(ctx, 360, 1040, { ...YOU, s: 1.1, face: 1, look: [0, 0], mood: 'worry' });
      // a pale copy steps out and floats up to the corner
      const o = tween(u, sp - 0.1, sp + 1.6, ease.inOut);
      ctx.save(); ctx.globalAlpha = 0.45;
      k.figure(ctx, lerp(360, 700, o), lerp(1040, 640, o), { ...YOU, s: lerp(1.1, 0.8, o), face: -1, look: [-1, 0.6], mood: 'calm', color: '#6d7582', shadow: false });
      ctx.restore();
      k.arrow(ctx, 430, 560, 640, 360, tween(u, sp + 0.3, sp + 0.8));
      k.scrawl(ctx, 'step outside', 720, 220, 52, tween(u, sp + 0.4, sp + 0.9));
    },
  },
  { // 27.0 "You can even talk to yourself by name. Alex, breathe."
    start: 26.9, title: 'Talk to Yourself by Name', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, nm = S.at('name'), al = S.at('Alex'), br = S.at('breathe');
      plate(ctx, S, { alpha: 0.08, seed: 27 });
      const calm = tween(u, br, br + 1.2);
      k.figure(ctx, 330, 1040, { ...YOU, s: 1.15, face: 1, look: [0.6, -0.2], mood: calm > 0.5 ? 'calm' : 'worry', blink: lerp(1, 0.3, calm) });
      // name tag
      ctx.save(); ctx.translate(330, 790); ctx.rotate(-0.05);
      k.rect(ctx, -80, -40, 160, 84, P.paperLight, P.red, 4, 6); k.rect(ctx, -80, -40, 160, 26, P.red, null, 0, 6);
      k.text(ctx, 'HELLO, I AM', 0, -26, 14, { font: 'display', color: P.paperLight }); k.text(ctx, 'ALEX', 0, 16, 34, { font: 'hand' });
      ctx.restore();
      k.scrawl(ctx, 'use your name', 330, 260, 50, tween(u, nm - 0.2, nm + 0.3), { rot: -0.04 });
      const b = pop(u, al - 0.15, 0.35);
      if (b) { ctx.save(); ctx.translate(680, 480); ctx.scale(b, b); k.rect(ctx, -200, -80, 400, 160, P.paperLight, P.ink, 4, 40); k.poly(ctx, [[-120, 80], [-170, 130], [-70, 80]], P.paperLight, P.ink, 4); k.text(ctx, '"Alex,', 0, -24, 46, { font: 'hand', color: P.red }); k.text(ctx, 'breathe."', 0, 30, 46, { font: 'hand', color: P.red }); ctx.restore(); }
      // breathing ring
      if (calm > 0) { const r = 60 + 40 * Math.sin(S.t * 1.6); ctx.save(); ctx.globalAlpha = calm * 0.6; k.circle(ctx, 330, 560, r + 40, null, P.sky, 6); ctx.restore(); }
    },
  },
  { // 31.73 "Distance cools you down."
    start: 31.6, title: 'Distance Cools You Down', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, ds = S.at('Distance'), cl = S.at('cools');
      plate(ctx, S, { alpha: 0.08, seed: 31 });
      const z = tween(u, ds, cl + 0.8, ease.inOut);
      S.cam(lerp(1.25, 0.95, z), 330, 760);
      k.figure(ctx, 330, 1040, { ...YOU, s: 1.1, face: 1, look: [0.6, 0], mood: 'calm', blink: 0.4 });
      const v = lerp(0.9, 0.25, tween(u, cl - 0.2, cl + 1.0));
      thermo(ctx, k, P, 760, 900, 420, v, v > 0.6 ? P.red : P.sky);
      fly(ctx, k, P, 760, 300, 1.2, S.t, -0.3);
      k.scrawl(ctx, 'cool down', 560, 1000, 50, tween(u, cl, cl + 0.4), { color: '#4b6f8f' });
    },
  },
  { // 34.48 "Follow for more mind tricks." → the case-file cover
    start: 34.3, title: 'More Mind Tricks', trans: 'cut',
    draw(ctx, u, S) {
      ctx.save(); plate(ctx, S, { alpha: 0.1, seed: 31 }); ctx.restore();
      inkReveal(ctx, S, tween(u, 0.1, 0.8, ease.linear), c => caseCover(c, S, u - 0.1, { handle: meta.brand.handle, caseNo: '2012', tagline: meta.brand.tagline }));
    },
  },
];

export const sfx = [
  { t: 0.1, type: 'heartbeat', gain: 0.5 },
  { t: 0.8, type: 'sizzle', gain: 0.4 },
  { t: 1.0, type: 'pen', gain: 0.4 },
  { t: 2.6, type: 'buzz', gain: 0.55 },
  { t: 3.4, type: 'pop', gain: 0.35 },
  { t: 3.8, type: 'pen', gain: 0.4 },
  { t: 4.95, type: 'splat', gain: 0.5 },
  { t: 5.3, type: 'stamp', gain: 0.7 },
  { t: 7.5, type: 'pop', gain: 0.5 },
  { t: 8.6, type: 'pen', gain: 0.4 },
  { t: 9.7, type: 'pen', gain: 0.35 },
  { t: 10.55, type: 'blink', gain: 0.45 },
  { t: 10.8, type: 'heartbeat', gain: 0.55 },
  { t: 12.8, type: 'heartbeat', gain: 0.5 },
  { t: 14.15, type: 'fold', gain: 0.45 },
  { t: 15.3, type: 'buzz', gain: 0.45 },
  { t: 14.5, type: 'pen', gain: 0.4 },
  { t: 17.25, type: 'whoosh', gain: 0.35 },
  { t: 19.0, type: 'pluck', gain: 0.4 },
  { t: 21.4, type: 'pluck', gain: 0.4 },
  { t: 22.0, type: 'pen', gain: 0.4 },
  { t: 23.3, type: 'splat', gain: 0.5 },
  { t: 23.4, type: 'stamp', gain: 0.45 },
  { t: 24.6, type: 'riser', gain: 0.3 },
  { t: 25.4, type: 'pen', gain: 0.4 },
  { t: 26.9, type: 'fold', gain: 0.45 },
  { t: 28.2, type: 'pen', gain: 0.4 },
  { t: 29.3, type: 'pop', gain: 0.5 },
  { t: 30.3, type: 'wind', gain: 0.35 },
  { t: 31.6, type: 'whoosh', gain: 0.35 },
  { t: 32.3, type: 'chime', gain: 0.4 },
  { t: 32.8, type: 'pen', gain: 0.4 },
  { t: 34.35, type: 'splat', gain: 0.75 },
  { t: 34.75, type: 'fold', gain: 0.4 },
  { t: 35.5, type: 'stamp', gain: 0.75 },
  { t: 36.5, type: 'moth', gain: 0.35 },
  { t: 38.0, type: 'bell', gain: 0.25 },
];

export const music = {
  kit: 'mind', bpm: 92, root: 'F', scale: 'dorian', gain: 0.3,
  sections: [
    { from: 0, to: 4.95, mood: 'tense' },
    { from: 4.95, to: 14.15, mood: 'tense' },
    { from: 14.15, to: 23.3, mood: 'groove' },
    { from: 23.3, to: 34.3, mood: 'triumph' },
    { from: 34.3, to: 38.5, mood: 'end' },
  ],
};
