// "Foot in the Door" — an INKBLOT case file (psychology, MindTrace).
// Freedman & Fraser (1966), Stanford: the small window sign, then the big lawn sign.
// u = seconds since the scene started; S.at('word') = when that word is said.
import { clamp, lerp, ease, tween, rng, TAU, shake, pop } from '../../lib/core.mjs';
import { plate, caseCover, inkReveal } from '../../styles/inkblot/scenes.mjs';

export const meta = {
  title: 'Foot in the Door',
  slug: 'foot-in-the-door-inkblot',
  style: 'inkblot',
  width: 1080, height: 1920, fps: 30,
  duration: 47.3,
  voice: 'voice.mp3',
  seed: 41,
  captionChars: 24,
  caseLine: 'THE MIND FILES  ·  CASE No. 1966  ·  CONFIDENTIAL',
  brandKit: 'mindtrace', // MindTrace (brand/mindtrace/): logo, handle, tagline, outro text
  outro: { at: 44.7 },
};

const RESEARCHER = { glasses: true, hair: 'slick', tie: '#c61f2a' };
const OWNER = { hair: 'bun', skirt: true };
const SALESMAN = { hat: 'bowler', tie: '#c61f2a' };

function grid(ctx, S, u, from, to, at, label, note) {
  const { k, P, W } = S;
  plate(ctx, S, { alpha: 0.06, seed: 60 + to });
  k.text(ctx, label, W / 2, 110, 42, { color: P.inkSoft });
  const v = lerp(from, to, tween(u, at - 0.1, at + 0.8, ease.outCubic));
  k.percentGrid(ctx, 170, 180, 600, v);
  k.text(ctx, Math.round(v) + '%', W / 2, 900, 120, { font: 'display', color: P.red });
  k.text(ctx, 'said yes', W / 2, 990, 44, {});
  if (note) k.scrawl(ctx, note, 760, 850, 50, tween(u, at + 0.6, at + 1.1), { rot: -0.08 });
}
const bigSign = (ctx, k, x, y, sc, rot = 0) => { if (sc <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); k.sign(ctx, 0, 0, 760, 300, 'DRIVE CAREFULLY', { ugly: true, post: 160, rot, rows: [['DRIVE'], ['CAREFULLY']] }); ctx.restore(); };
const smallSign = (ctx, k, x, y, sc) => { if (sc <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); k.sign(ctx, 0, 0, 120, 90, 'BE A SAFE DRIVER', { rows: [['BE A'], ['SAFE'], ['DRIVER']], color: '#16141a' }); ctx.restore(); };

export const scenes = [
  { // 0.0 "Want a big yes? Don't ask for it. Not yet."
    start: 0, title: 'The Big Yes',
    draw(ctx, u, S) {
      const { k, P, W, H } = S, yes = S.at('yes'), ask = S.at('ask'), ny = S.at('Not');
      plate(ctx, S, { alpha: 0.12, seed: 2 });
      S.cam(lerp(1.12, 1.0, tween(u, 0, 4.3)), W / 2, 560);
      const glow = tween(u, yes - 0.4, yes + 0.2);
      k.door(ctx, W / 2, 1010, 1.45, lerp(0.05, 0.22, glow) - 0.17 * tween(u, ny - 0.1, ny + 0.2, ease.outBack), { glow,
        behind: c => k.text(c, 'YES', 30, -260, 150, { font: 'display', color: P.red }) });
      // the question you are about to ask — crossed out
      const b = pop(u, ask - 0.45, 0.3);
      if (b) {
        ctx.save(); ctx.translate(310, 300); ctx.scale(b, b);
        k.rect(ctx, -200, -60, 400, 120, P.paperLight, P.ink, 5, 30);
        k.text(ctx, 'Will you…?', 0, 4, 52, { font: 'serif' });
        k.penLine(ctx, [[-180, -40], [180, 40]], tween(u, ask + 0.2, ask + 0.45), P.red, 12);
        k.penLine(ctx, [[180, -40], [-180, 40]], tween(u, ask + 0.4, ask + 0.65), P.red, 12, 5);
        ctx.restore();
      }
      k.stamp(ctx, 'NOT YET', 690, 300, 66, tween(u, ny, ny + 0.2), 0.12);
    },
  },
  { // 4.64 "In 1966, Stanford researchers asked people to put a huge, ugly sign on their front lawn."
    start: 4.45, title: 'Stanford, 1966', trans: 'bleed',
    draw(ctx, u, S) {
      const { k, P, W, H } = S, yr = S.at('1966'), st = S.at('Stanford'), hg = S.at('huge'), ug = S.at('ugly'), lw = S.at('lawn');
      plate(ctx, S, { blot: false, bg: '#cfdbe4' });
      S.cam(lerp(1.0, 1.08, tween(u, 0, 6)), W / 2, 600);
      k.circle(ctx, 800, 150, 70, P.ochre);
      k.house(ctx, W / 2 + 60, 830, 1.05);
      k.figure(ctx, 130, 1000, { ...RESEARCHER, s: 0.95, face: 1, look: [1, -0.2], mood: 'smile', armR: [1.3, 0.9], holdR: c => k.rect(c, -30, -60, 60, 80, P.paperLight, P.ink, 3) });
      // the giant ugly sign rises in front of the house
      const rise = tween(u, hg - 0.2, hg + 0.5, ease.outBack);
      if (rise > 0) bigSign(ctx, k, W / 2 + 80, lerp(1300, 780, rise), 1.0, -0.03 + shake(u, hg + 0.5, 0.03, 0.4));
      k.stamp(ctx, '1966', 790, 300, 66, tween(u, yr, yr + 0.25), 0.1);
      k.scrawl(ctx, 'Stanford researchers', 330, 160, 56, tween(u, st, st + 0.6), { rot: -0.05 });
      k.scrawl(ctx, 'ugly!', 820, 420, 72, tween(u, ug, ug + 0.3));
      k.arrow(ctx, 790, 450, 700, 520, tween(u, ug + 0.2, ug + 0.5), P.red, 6, 0.3);
      k.penCircle(ctx, W / 2 + 80, 940, 360, 60, tween(u, lw, lw + 0.5), P.red, 6);
    },
  },
  { // 11.54 "Only 17% said yes."
    start: 11.2, title: 'Only 17% Said Yes', trans: 'fold',
    draw(ctx, u, S) { grid(ctx, S, u, 0, 17, S.at('17'), 'BIG ASK, NOTHING BEFORE'); },
  },
  { // 14.06 "But one group got a tiny ask first."
    start: 13.95, title: 'A Tiny Ask First', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, tn = S.at('tiny'), gp = S.at('group');
      plate(ctx, S, { blot: false, bg: '#cfdbe4' });
      S.cam(lerp(1.15, 1.35, tween(u, 0, 2.6)), 520, 720);
      k.house(ctx, W / 2 + 60, 830, 1.05);
      k.figure(ctx, 560, 830, { ...OWNER, s: 0.62, face: -1, look: [-0.8, 0.2], mood: 'calm', shadow: false });
      k.figure(ctx, 380, 900, { ...RESEARCHER, s: 0.72, face: 1, look: [1, -0.2], mood: 'smile', armR: [1.5, 0.5], holdR: c => smallSign(c, k, 10, 0, 0.32) });
      k.penCircle(ctx, 480, 640, 50, 40, tween(u, tn, tn + 0.4), P.red, 5);
      k.scrawl(ctx, 'tiny', 380, 520, 60, tween(u, tn + 0.1, tn + 0.4));
      k.stamp(ctx, 'GROUP B', 700, 470, 34, tween(u, gp, gp + 0.2), 0.1);
    },
  },
  { // 16.66 "A small sign for the window. Easy yes."
    start: 16.55, title: 'A Small Sign', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, wi = S.at('window'), ez = S.at('Easy');
      plate(ctx, S, { blot: false, bg: '#cfdbe4' });
      // close on the front window: the little sign goes up
      const put = tween(u, wi - 0.4, wi + 0.2, ease.outBack);
      k.house(ctx, W / 2 + 480, 1180, 2.7, { lit: true, windowSign: c => { if (put > 0) smallSign(c, k, 0, lerp(160, 60, put), 1.0); } });
      k.figure(ctx, 160, 1060, { ...OWNER, s: 1.05, face: 1, look: [0.8, -0.2], mood: u > ez ? 'smile' : 'calm', armR: [lerp(0.3, 2.2, tween(u, ez, ez + 0.3, ease.outBack)), 0.2], shadow: false });
      k.stamp(ctx, 'YES', 260, 330, 80, tween(u, ez + 0.1, ez + 0.3), -0.12);
      k.scrawl(ctx, 'easy.', 300, 480, 60, tween(u, ez + 0.3, ez + 0.7));
    },
  },
  { // 20.12 "Two weeks later, the giant sign."
    start: 20.0, title: 'Two Weeks Later', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, gi = S.at('giant');
      plate(ctx, S, { alpha: 0.06, seed: 77 });
      // fourteen days tear off the calendar
      const days = clamp(u / 1.1) * 13, end = days >= 13, d = end ? 13 : Math.floor(days) + 1, f = end ? 1 : days % 1;
      k.calendar(ctx, 250, 280, 1.3, d, 'DAY', f);
      k.scrawl(ctx, '2 weeks later…', 600, 260, 58, tween(u, 0.6, 1.2));
      const drop = tween(u, gi - 0.15, gi + 0.3, ease.outBounce);
      if (drop > 0) bigSign(ctx, k, W / 2, lerp(-200, 820, drop), 1.05, 0.02);
    },
  },
  { // 22.88 "76% said yes."
    start: 22.78, title: '76% Said Yes', trans: 'fold',
    draw(ctx, u, S) { grid(ctx, S, u, 17, 76, S.at('76'), 'SMALL ASK FIRST', 'was 17%'); },
  },
  { // 25.62 "Here's the trick. That first yes changes how you see yourself."
    start: 25.52, title: 'How You See Yourself', trans: 'bleed',
    draw(ctx, u, S) {
      const { k, P, W } = S, ch = S.at('changes'), ys = S.at('yourself');
      plate(ctx, S, { alpha: 0.1, seed: 88 });
      S.cam(lerp(1.0, 1.08, tween(u, 0, 4.6)), W / 2, 560);
      k.stamp(ctx, 'THE TRICK', 220, 120, 44, tween(u, 0.05, 0.25), -0.1);
      const halo = tween(u, ch, ch + 0.6);
      k.figure(ctx, 230, 1000, { ...OWNER, s: 1.15, face: 1, look: [0.9, -0.1], mood: u > ys ? 'smile' : 'calm', shadow: false });
      k.mirrorFrame(ctx, 660, 560, 210, 330, c => {
        c.translate(0, 0);
        if (halo > 0) { c.save(); c.globalAlpha = halo; k.circle(c, 0, -60, 150, 'rgba(255,240,190,0.7)'); c.restore(); }
        k.figure(c, 0, 330, { ...OWNER, s: 1.0, face: 1, look: [0.9, -0.1], mood: u > ch ? 'smile' : 'calm', shadow: false,
          armR: [lerp(0.2, 2.5, halo), 0.1], holdR: cc => { if (halo > 0.3) smallSign(cc, k, 0, -10, 0.7); } });
      });
      k.penCircle(ctx, 660, 560, 260, 380, tween(u, ys - 0.1, ys + 0.5), P.red, 7);
    },
  },
  { // 30.36 "I'm someone who cares about this."
    start: 30.25, title: "I'm Someone Who Cares", trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, sm = S.at('someone'), ca = S.at('cares');
      plate(ctx, S, { alpha: 0.1, seed: 91 });
      ctx.save(); ctx.translate(W / 2, 520); ctx.rotate(-0.03);
      k.rect(ctx, -400, -230, 800, 460, P.paperLight, P.ink, 6, 10);
      k.rect(ctx, -400, -230, 800, 70, P.ink, null, 0, 10);
      k.text(ctx, 'SELF-IMAGE FILE', 0, -194, 34, { color: P.paperLight });
      k.rect(ctx, -360, -130, 220, 280, P.paperDark, P.ink, 4);
      k.figure(ctx, -250, 230, { ...OWNER, s: 0.75, face: 1, look: [0.3, 0], mood: u > ca ? 'smile' : 'calm', shadow: false });
      k.text(ctx, 'SUBJECT: YOU', -110, -100, 40, { align: 'left' });
      k.typeOn(ctx, "I'm someone who", -110, -10, 58, tween(u, sm - 0.25, sm + 0.5, ease.linear), { align: 'left', font: 'hand', color: P.red, caret: false });
      k.typeOn(ctx, 'cares about this.', -110, 75, 58, tween(u, ca - 0.2, ca + 0.6, ease.linear), { align: 'left', font: 'hand', color: P.red, caret: false });
      ctx.restore();
      k.stamp(ctx, 'IDENTITY UPDATED', W / 2, 900, 54, tween(u, ca + 0.7, ca + 0.9), -0.08);
    },
  },
  { // 32.96 "And you act like that person."
    start: 32.86, title: 'You Act Like It', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, ac = S.at('act');
      plate(ctx, S, { blot: false, bg: '#cfdbe4' });
      k.house(ctx, W / 2 + 120, 820, 0.95);
      // the big sign goes in — and they hammer it down themselves
      bigSign(ctx, k, W / 2 + 130, 840, 0.85, 0);
      const hit = Math.max(0, Math.sin(Math.max(0, u - ac) * 9));
      k.figure(ctx, 170, 1010, { ...OWNER, s: 1.1, face: 1, look: [0.8, -0.3], mood: 'smile', shadow: false,
        armR: [lerp(2.9, 1.7, hit), 0.4], holdR: c => { k.rect(c, -6, -70, 12, 80, '#6b4a2b'); k.rect(c, -30, -90, 60, 26, P.ink, null, 0, 4); } });
      k.scrawl(ctx, 'proudly.', 780, 200, 64, tween(u, ac + 0.3, ac + 0.8));
    },
  },
  { // 35.24 "So start small. Then make the big ask."
    start: 35.14, title: 'Start Small', trans: 'blink',
    draw(ctx, u, S) {
      const { k, P, W } = S, sm = S.at('small'), bg = S.at('big');
      plate(ctx, S, { alpha: 0.1, seed: 95 });
      S.cam(1.0 + 0.05 * tween(u, bg, bg + 0.6), W / 2, 560);
      const open = lerp(0.12, 1, tween(u, bg - 0.1, bg + 0.6, ease.inOut));
      k.door(ctx, W / 2, 1010, 1.45, open, { foot: tween(u, sm - 0.4, sm + 0.2), glow: tween(u, bg, bg + 0.6),
        behind: c => k.text(c, 'YES', 30, -260, 150, { font: 'display', color: P.red }) });
      k.scrawl(ctx, 'foot-in-the-door', W / 2, 150, 70, tween(u, sm + 0.3, sm + 1.0), { rot: -0.04 });
    },
  },
  { // 38.9 "Someone doing it to you? You can still say no."
    start: 38.8, title: 'You Can Still Say No', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, so = S.at('Someone'), no = S.at('no');
      plate(ctx, S, { alpha: 0.1, seed: 97 });
      S.cam(1.0, W / 2, 560 + shake(u, no + 0.05, 10, 0.4));
      const slam = tween(u, no - 0.05, no + 0.12, ease.inCubic);
      k.door(ctx, W / 2 + 60, 1010, 1.3, lerp(0.3, 0, slam), { foot: 1 - slam * 1.2, color: P.inkSoft });
      // the salesman outside with the tiny card, then the big contract
      const b = pop(u, so - 0.2, 0.3);
      if (b) { ctx.save(); ctx.translate(330, 200); ctx.scale(b, b); k.rect(ctx, -270, -70, 540, 140, P.paperLight, P.ink, 5, 30); k.text(ctx, 'Just one tiny thing…', 0, 4, 44, { font: 'serif' }); ctx.restore(); }
      k.stamp(ctx, 'NO', 720, 420, 120, tween(u, no + 0.05, no + 0.25), 0.12);
    },
  },
  { // 42.52 "Follow for more mind tricks." → the case-file cover
    start: 42.42, title: 'More Mind Tricks', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      ctx.save(); plate(ctx, S, { alpha: 0.1, seed: 97 }); k.door(ctx, W / 2 + 60, 1010, 1.3, 0, { color: P.inkSoft }); ctx.restore();
      inkReveal(ctx, S, tween(u, 0.05, 0.75, ease.linear), c => caseCover(c, S, u - 0.05, { handle: meta.brand.handle, caseNo: '1966', tagline: meta.brand.tagline }));
    },
  },
];

export const sfx = [
  { t: 0.3, type: 'heartbeat', gain: 0.45 },
  { t: 0.7, type: 'riser', gain: 0.35 },
  { t: 1.6, type: 'pop', gain: 0.5 },
  { t: 2.5, type: 'pen', gain: 0.55 },
  { t: 2.65, type: 'thud', gain: 0.6 },
  { t: 2.65, type: 'stamp', gain: 0.8 },
  { t: 4.45, type: 'splat', gain: 0.7 },
  { t: 4.75, type: 'stamp', gain: 0.7 },
  { t: 6.1, type: 'pen', gain: 0.45 },
  { t: 7.9, type: 'whoosh', gain: 0.45 },
  { t: 8.6, type: 'thud', gain: 0.5 },
  { t: 9.1, type: 'pen', gain: 0.45 },
  { t: 10.3, type: 'pen', gain: 0.4 },
  { t: 11.2, type: 'fold', gain: 0.45 },
  { t: 11.4, type: 'riser', gain: 0.3 },
  { t: 12.2, type: 'flop', gain: 0.5 },
  { t: 13.95, type: 'whoosh', gain: 0.4 },
  { t: 15.0, type: 'pen', gain: 0.45 },
  { t: 14.4, type: 'stamp', gain: 0.4 },
  { t: 16.55, type: 'fold', gain: 0.45 },
  { t: 17.4, type: 'paper', gain: 0.45 },
  { t: 18.8, type: 'stamp', gain: 0.8 },
  { t: 19.1, type: 'chime', gain: 0.35, pitch: 1.2 },
  { t: 20.0, type: 'paper', gain: 0.45 },
  { t: 20.5, type: 'paper', gain: 0.35 },
  { t: 21.25, type: 'whoosh', gain: 0.45 },
  { t: 21.55, type: 'thud', gain: 0.8 },
  { t: 22.78, type: 'fold', gain: 0.45 },
  { t: 23.0, type: 'riser', gain: 0.35 },
  { t: 23.7, type: 'chime', gain: 0.45, pitch: 1.2 },
  { t: 25.52, type: 'splat', gain: 0.65 },
  { t: 25.6, type: 'stamp', gain: 0.4 },
  { t: 27.9, type: 'chime', gain: 0.35 },
  { t: 29.1, type: 'pen', gain: 0.5 },
  { t: 30.25, type: 'typewriter', gain: 0.4 },
  { t: 31.2, type: 'typewriter', gain: 0.35 },
  { t: 31.9, type: 'stamp', gain: 0.8 },
  { t: 32.86, type: 'fold', gain: 0.45 },
  { t: 33.4, type: 'clank', gain: 0.5 },
  { t: 33.72, type: 'clank', gain: 0.45 },
  { t: 34.05, type: 'clank', gain: 0.4 },
  { t: 35.14, type: 'blink', gain: 0.5 },
  { t: 35.4, type: 'slide', gain: 0.5 },
  { t: 37.4, type: 'riser', gain: 0.4 },
  { t: 37.8, type: 'gong', gain: 0.4 },
  { t: 38.8, type: 'whoosh', gain: 0.4 },
  { t: 41.3, type: 'thud', gain: 1.0 },
  { t: 41.35, type: 'stamp', gain: 0.9 },
  { t: 42.45, type: 'splat', gain: 0.8 },
  { t: 42.8, type: 'fold', gain: 0.4 },
  { t: 43.6, type: 'stamp', gain: 0.8 },
  { t: 44.6, type: 'moth', gain: 0.35 },
  { t: 46.2, type: 'bell', gain: 0.3 },
];

export const music = {
  kit: 'mind', bpm: 96, root: 'E', scale: 'dorian', gain: 0.3,
  sections: [
    { from: 0, to: 4.45, mood: 'intro' },
    { from: 4.45, to: 13.95, mood: 'groove' },
    { from: 13.95, to: 25.5, mood: 'drive' },
    { from: 25.5, to: 35.1, mood: 'tense' },
    { from: 35.1, to: 38.8, mood: 'triumph' },
    { from: 38.8, to: 42.4, mood: 'sad' },
    { from: 42.4, to: 47.3, mood: 'end' },
  ],
};
