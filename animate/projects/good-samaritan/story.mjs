// "The Good Samaritan Experiment" — an INKBLOT case file (psychology, MindTrace).
// Darley & Batson (1973), "From Jerusalem to Jericho": Princeton seminary students
// walking to give a talk passed a man slumped in a doorway. Low hurry: 63% helped;
// high hurry: 10%. The talk's topic (incl. the Good Samaritan parable) didn't matter much.
// u = seconds since the scene started; S.at('word') = when that word is said.
import { clamp, lerp, ease, tween, rng, TAU, shake, pop } from '../../lib/core.mjs';
import { plate, caseCover, inkReveal } from '../../styles/inkblot/scenes.mjs';

export const meta = {
  title: 'The Good Samaritan Experiment',
  slug: 'good-samaritan-inkblot',
  style: 'inkblot',
  width: 1080, height: 1920, fps: 30,
  duration: 40.2,
  voice: 'voice.mp3',
  seed: 197,
  captionChars: 24,
  caseLine: 'THE MIND FILES  ·  CASE No. 1973  ·  CONFIDENTIAL',
  brandKit: 'mindtrace', // MindTrace (brand/mindtrace/): logo, handle, tagline, outro text
  outro: { at: 37.6 },
};

const STUDENT = { hair: 'slick', tie: '#c61f2a' };
const MAN = { color: '#4a4550' };

// a scam text on a big phone, with a countdown
function scamPhone(ctx, k, P, x, y, s, u, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  k.rect(ctx, -170, -320, 340, 640, P.ink, null, 0, 44);
  k.rect(ctx, -148, -280, 296, 560, P.paperLight, null, 0, 18);
  k.rect(ctx, -128, -240, 256, 120, P.greyLight, null, 0, 20);
  k.text(ctx, 'Your account is', 0, -200, 26, {}); k.text(ctx, 'LOCKED', 0, -158, 38, { font: 'display', color: P.red });
  const secs = o.frozen != null ? o.frozen : Math.max(0, 59 - Math.floor(u * 4));
  k.text(ctx, '00:' + String(secs).padStart(2, '0'), 0, -20, 92, { font: 'display', color: o.frozen != null ? P.grey : P.red });
  const b = o.frozen != null ? 0 : 0.5 + 0.5 * Math.sin(u * 10);
  k.rect(ctx, -120, 90, 240, 90, `rgba(198,31,42,${0.75 + 0.25 * b})`, P.ink, 4, 20);
  k.text(ctx, 'ACT NOW!', 0, 137, 46, { font: 'display', color: P.paperLight });
  ctx.restore();
}
// a stone campus building with columns; (x, y) = ground centre
function hall(ctx, k, P, x, y, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  k.poly(ctx, [[-170, -240], [0, -320], [170, -240]], P.paperDark, P.ink, 5);
  k.rect(ctx, -160, -240, 320, 240, P.card, P.ink, 5);
  for (let i = 0; i < 4; i++) k.rect(ctx, -130 + i * 80, -220, 24, 220, P.paperLight, P.ink, 3);
  k.rect(ctx, -30, -110, 60, 110, P.inkSoft);
  ctx.restore();
}
// a man slumped in a doorway, groaning
function slumped(ctx, k, P, S, x, y, s = 1, u = 0) {
  k.door(ctx, x, y, s * 0.8, 0, { color: P.paperDark });
  k.figure(ctx, x + 10 * s, y + 4, { ...MAN, s: 0.85 * s, sit: true, face: 1, look: [0.3, 1], mood: 'worry', lean: 0.3, blink: 0.4, bob: Math.sin(u * 2) * 2 });
  const g = 0.5 + 0.5 * Math.sin(u * 3);
  for (let i = 0; i < 3; i++) {
    const r = 30 + i * 22;
    ctx.save(); ctx.globalAlpha = g * (1 - i * 0.25);
    ctx.beginPath(); ctx.arc(x + 70 * s, y - 330 * s, r, -0.9, -0.1); k.stroke(ctx, P.red, 4);
    ctx.restore();
  }
}

export const scenes = [
  { // 0.0 "Why do scammers always say, "act now"?"
    start: 0, title: 'Act Now!',
    draw(ctx, u, S) {
      const { k, P, W } = S, sc = S.at('scammers'), an = S.at('“act');
      plate(ctx, S, { alpha: 0.12, seed: 3 });
      S.cam(lerp(1.08, 1.0, tween(u, 0, 3.7)), W / 2, 520);
      const sh = shake(u, an + 0.1, 12, 0.5);
      scamPhone(ctx, k, P, W / 2 + sh, 560, 1.15, u);
      k.scrawl(ctx, 'scammers', 210, 150, 54, tween(u, sc, sc + 0.4), { rot: -0.08 });
      k.stamp(ctx, 'ACT NOW', 780, 960, 58, tween(u, an, an + 0.2), 0.1);
    },
  },
  { // 3.88 "A rush switches off your brain."
    start: 3.75, title: 'A Rush Switches It Off', trans: 'bleed',
    draw(ctx, u, S) {
      const { k, P, W } = S, of = S.at('off');
      plate(ctx, S, { alpha: 0.08, seed: 6 });
      const dim = tween(u, of, of + 0.3);
      k.profile(ctx, 380, 1040, 1.5, { blink: lerp(1, 0.35, dim), inside: c => k.brain(c, 10, -205, 0.55, S.t, { fill: P.paperDark, ink: P.grey, glow: 1 - dim, spots: [[40, -40], [-30, -60]] }) });
      // the light switch
      ctx.save(); ctx.translate(800, 380);
      k.rect(ctx, -70, -110, 140, 220, P.paperLight, P.ink, 5, 14);
      k.rect(ctx, -26, -70, 52, 140, P.inkSoft, null, 0, 10);
      const up = 1 - tween(u, of - 0.1, of + 0.05);
      k.rect(ctx, -22, lerp(-4, -66, up), 44, 70, P.red, P.ink, 3, 8);
      k.text(ctx, 'ON', 0, -140, 30, { font: 'display', color: up > 0.5 ? P.red : P.grey });
      k.text(ctx, 'OFF', 0, 142, 30, { font: 'display', color: up > 0.5 ? P.grey : P.ink });
      ctx.restore();
      k.clock(ctx, 800, 780, 90, u, { speed: 3, hour: 9 });
      k.scrawl(ctx, 'rush', 800, 920, 52, tween(u, 0.2, 0.6));
    },
  },
  { // 6.46 "In 1973, Princeton researchers sent seminary students across campus to give a talk."
    start: 6.3, title: 'Princeton, 1973', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, yr = S.at('1973'), pr = S.at('Princeton'), se = S.at('seminary'), ac = S.at('across'), tk = S.at('talk');
      plate(ctx, S, { alpha: 0.08, seed: 9 });
      k.stamp(ctx, '1973', 770, 120, 62, tween(u, yr, yr + 0.25), 0.1);
      k.scrawl(ctx, 'Princeton', 230, 140, 58, tween(u, pr, pr + 0.5), { rot: -0.06 });
      hall(ctx, k, P, 180, 760, 0.7);
      hall(ctx, k, P, 760, 1020, 0.8);
      // a dotted path across campus
      const path = [[230, 790], [380, 850], [520, 900], [640, 960]];
      ctx.save(); ctx.setLineDash([4, 18]); ctx.beginPath(); k.smooth(ctx, path, false); k.stroke(ctx, P.grey, 6); ctx.restore();
      const w = tween(u, ac - 0.4, ac + 1.6, ease.linear);
      const px = lerp(260, 600, w), py = lerp(800, 945, w);
      k.figure(ctx, px, py, { ...STUDENT, s: 0.75, face: 1, walk: w > 0 && w < 1 ? u * 1.6 : 0, look: [1, 0.2], mood: 'calm', armR: [0.5, 1.2], holdR: c => k.rect(c, -24, -16, 48, 34, P.paperLight, P.ink, 3) });
      k.scrawl(ctx, 'seminary students', 300, 440, 48, tween(u, se, se + 0.5));
      if (u > tk - 0.2) { const p = pop(u, tk - 0.2, 0.3); ctx.save(); ctx.translate(780, 420); ctx.scale(p, p); k.rect(ctx, -140, -60, 280, 120, P.paperLight, P.ink, 4, 12); k.text(ctx, 'GIVE A TALK', 0, -14, 34, { font: 'display', color: P.red }); k.text(ctx, '→ other building', 0, 28, 24, {}); ctx.restore(); }
    },
  },
  { // 12.38 "On the way, a man slumped in a doorway, groaning."
    start: 12.25, title: 'The Man in the Doorway', trans: 'blink',
    draw(ctx, u, S) {
      const { k, P, W } = S, sl = S.at('slumped'), gr = S.at('groaning');
      plate(ctx, S, { alpha: 0.1, seed: 12 });
      S.cam(lerp(1.0, 1.08, tween(u, 0, 4)), 620, 760);
      slumped(ctx, k, P, S, 640, 1020, 1.1, u);
      k.scrawl(ctx, 'slumped', 640, 330, 54, tween(u, sl, sl + 0.4));
      k.scrawl(ctx, 'groaning…', 300, 560, 50, tween(u, gr - 0.2, gr + 0.3), { rot: -0.1 });
      const w = tween(u, 0.2, 2.8, ease.linear);
      k.figure(ctx, lerp(40, 230, w), 1030, { ...STUDENT, s: 0.95, face: 1, walk: w < 1 ? u * 1.6 : 0, look: [1, 0.3], mood: u > gr ? 'worry' : 'calm', armR: [0.5, 1.2], holdR: c => k.rect(c, -24, -16, 48, 34, P.paperLight, P.ink, 3) });
    },
  },
  { // 16.58 "Not rushed? 63% stopped to help."
    start: 16.45, title: 'Not Rushed', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, pc = S.at('63%'), hp = S.at('help');
      plate(ctx, S, { alpha: 0.08, seed: 16 });
      k.clock(ctx, 150, 150, 70, u, { speed: 0.2, hour: 10 });
      k.scrawl(ctx, 'plenty of time', 330, 280, 40, tween(u, 0.1, 0.6));
      k.percentGrid(ctx, 560, 110, 360, lerp(0, 63, tween(u, pc - 0.2, pc + 0.9)));
      k.text(ctx, '63%', 740, 530, 84, { font: 'display', color: P.red });
      // the student kneels to help
      slumped(ctx, k, P, S, 300, 1040, 0.85, u);
      const reach = tween(u, hp - 0.6, hp);
      k.figure(ctx, 560, 1040, { ...STUDENT, s: 0.95, face: -1, look: [-1, 0.4], mood: 'worry', lean: 0.25 * reach, armR: [lerp(0.3, 1.4, reach), 0.3], armL: [lerp(0.2, 1.1, reach), 0.4] });
      k.stamp(ctx, 'STOPPED TO HELP', 650, 650, 44, tween(u, hp, hp + 0.2), -0.06);
    },
  },
  { // 20.72 "Rushed? Only 10%."
    start: 20.6, title: 'Rushed', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, on = S.at('Only');
      plate(ctx, S, { alpha: 0.08, seed: 20 });
      k.clock(ctx, 150, 150, 70, u, { speed: 4, hour: 10 });
      k.scrawl(ctx, "you're late!", 330, 280, 44, tween(u, 0.05, 0.4));
      k.percentGrid(ctx, 560, 110, 360, lerp(0, 10, tween(u, on, on + 0.6)));
      k.text(ctx, '10%', 740, 530, 84, { font: 'display', color: P.red });
      slumped(ctx, k, P, S, 300, 1040, 0.85, u);
      const w = tween(u, 0, 2.6, ease.linear);
      const x = lerp(-60, 1000, w);
      k.figure(ctx, x, 1040, { ...STUDENT, s: 0.95, face: 1, walk: u * 3.2, look: [1, -0.2], mood: 'worry', lean: 0.2, armR: [0.5, 1.2], holdR: c => k.rect(c, -24, -16, 48, 34, P.paperLight, P.ink, 3) });
      for (let i = 0; i < 3; i++) k.line(ctx, x - 90 - i * 18, 820 + i * 50, x - 150 - i * 18, 820 + i * 50, P.grey, 4);
    },
  },
  { // 23.38 "Some were on their way to talk about the Good Samaritan."
    start: 23.25, title: 'Their Talk? The Good Samaritan', trans: 'bleed',
    draw(ctx, u, S) {
      const { k, P, W } = S, gs = S.at('Good');
      plate(ctx, S, { alpha: 0.1, seed: 23 });
      // the talk notes
      const p = pop(u, 0.15, 0.35);
      if (p) { ctx.save(); ctx.translate(W / 2, 300); ctx.rotate(-0.04); ctx.scale(p, p);
        k.rect(ctx, -300, -150, 600, 300, P.paperLight, P.ink, 5, 10);
        for (let i = 0; i < 4; i++) k.line(ctx, -260, -40 + i * 40, 260, -40 + i * 40, P.redLight, 2);
        k.text(ctx, 'MY TALK:', -150, -100, 34, { font: 'type', color: P.inkSoft });
        k.typeOn(ctx, 'The Good Samaritan', 0, 10, 50, tween(u, gs - 0.3, gs + 0.5), { font: 'hand', color: P.red });
        k.text(ctx, '(a parable about stopping to help)', 0, 90, 24, { color: P.inkSoft });
        ctx.restore(); }
      slumped(ctx, k, P, S, 260, 1040, 0.8, u);
      const w = tween(u, 0.6, 3.2, ease.linear), x = lerp(120, 900, w);
      k.figure(ctx, x, 1040, { ...STUDENT, s: 0.9, face: 1, walk: u * 3.2, look: [1, -0.2], mood: 'worry', lean: 0.2, armR: [0.5, 1.2], holdR: c => k.rect(c, -24, -16, 48, 34, P.paperLight, P.ink, 3) });
      k.arrow(ctx, 520, 600, 340, 760, tween(u, gs + 0.3, gs + 0.7));
      k.scrawl(ctx, 'walked right past', 640, 560, 46, tween(u, gs + 0.4, gs + 0.9));
    },
  },
  { // 26.66 "Here's the trick. Hurry shrinks your attention."
    start: 26.5, title: 'Hurry Shrinks Attention', trans: 'blink',
    draw(ctx, u, S) {
      const { k, P, W, H } = S, hu = S.at('Hurry'), sh = S.at('shrinks');
      plate(ctx, S, { alpha: 0.08, seed: 26 });
      // the scene the eye could see: the slumped man on the left, the clock ahead
      slumped(ctx, k, P, S, 230, 1000, 0.7, u);
      k.clock(ctx, 680, 560, 120, u, { speed: 4, hour: 10 });
      // tunnel vision closes in on the clock
      const r = lerp(900, 190, tween(u, sh - 0.4, sh + 0.8));
      ctx.save(); ctx.beginPath(); ctx.rect(-50, -50, W + 100, H + 100); ctx.arc(680, 560, r, 0, TAU, true);
      ctx.fillStyle = 'rgba(22,20,26,0.88)'; ctx.fill(); ctx.restore();
      k.eye(ctx, 680, 880, 60, { open: 1, look: [0, -1] });
      k.stamp(ctx, 'THE TRICK', 220, 110, 44, tween(u, 0.05, 0.25), -0.1, P.redLight);
      k.scrawl(ctx, 'tunnel vision', 680, 1010, 52, tween(u, sh + 0.4, sh + 0.9), { color: P.redLight });
    },
  },
  { // 30.4 "Scammers count on it. Someone rushing you? Slow down."
    start: 30.25, title: 'Slow Down', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, ct = S.at('count'), sl = S.at('Slow');
      plate(ctx, S, { alpha: 0.1, seed: 30 });
      const frozen = u > sl ? Math.max(0, 59 - Math.floor(sl * 4)) : null;
      scamPhone(ctx, k, P, 330, 560, 0.95, u, { frozen });
      k.scrawl(ctx, 'counting on it', 330, 110, 48, tween(u, ct, ct + 0.4));
      // a hand-drawn pause sign
      const p = pop(u, sl - 0.1, 0.35);
      if (p) { ctx.save(); ctx.translate(760, 430); ctx.scale(p, p); k.circle(ctx, 0, 0, 120, P.paperLight, P.red, 10); k.rect(ctx, -44, -56, 30, 112, P.red, null, 0, 6); k.rect(ctx, 14, -56, 30, 112, P.red, null, 0, 6); ctx.restore(); }
      k.stamp(ctx, 'SLOW DOWN', 760, 660, 54, tween(u, sl + 0.1, sl + 0.3), -0.08);
      const n = tween(u, sl + 0.5, sl + 1.0);
      if (n > 0) { ctx.save(); ctx.globalAlpha = n; k.rect(ctx, 560, 800, 360, 140, P.paperLight, P.red, 4, 12); k.text(ctx, 'Hang up. Call back', 740, 846, 30, { font: 'display', color: P.red }); k.text(ctx, 'on a number you trust.', 740, 894, 28, {}); ctx.restore(); }
    },
  },
  { // 35.29 "Follow for more dark psychology." → the case-file cover
    start: 35.1, title: 'More Dark Psychology', trans: 'cut',
    draw(ctx, u, S) {
      ctx.save(); plate(ctx, S, { alpha: 0.1, seed: 30 }); ctx.restore();
      inkReveal(ctx, S, tween(u, 0.1, 0.8, ease.linear), c => caseCover(c, S, u - 0.1, { handle: meta.brand.handle, caseNo: '1973', tagline: meta.brand.tagline }));
    },
  },
];

export const sfx = [
  { t: 0.1, type: 'buzz', gain: 0.4 },
  { t: 0.6, type: 'tick', gain: 0.35 },
  { t: 0.5, type: 'pen', gain: 0.35 },
  { t: 1.9, type: 'alarm', gain: 0.35 },
  { t: 1.95, type: 'stamp', gain: 0.7 },
  { t: 3.75, type: 'splat', gain: 0.6 },
  { t: 4.0, type: 'tick', gain: 0.4 },
  { t: 4.85, type: 'click', gain: 0.8 },
  { t: 5.0, type: 'thud', gain: 0.4 },
  { t: 6.3, type: 'fold', gain: 0.45 },
  { t: 6.6, type: 'stamp', gain: 0.75 },
  { t: 7.85, type: 'pen', gain: 0.45 },
  { t: 9.1, type: 'pen', gain: 0.4 },
  { t: 9.6, type: 'paper', gain: 0.35 },
  { t: 11.1, type: 'pop', gain: 0.5 },
  { t: 12.25, type: 'blink', gain: 0.45 },
  { t: 12.6, type: 'wind', gain: 0.3 },
  { t: 13.9, type: 'pen', gain: 0.4 },
  { t: 15.3, type: 'heartbeat', gain: 0.4 },
  { t: 16.45, type: 'fold', gain: 0.45 },
  { t: 17.9, type: 'chime', gain: 0.35 },
  { t: 19.6, type: 'stamp', gain: 0.7 },
  { t: 20.6, type: 'whoosh', gain: 0.45 },
  { t: 20.7, type: 'tick', gain: 0.45 },
  { t: 21.6, type: 'pluck', gain: 0.4 },
  { t: 23.25, type: 'splat', gain: 0.55 },
  { t: 23.45, type: 'paper', gain: 0.4 },
  { t: 24.9, type: 'typewriter', gain: 0.35 },
  { t: 25.6, type: 'whoosh', gain: 0.4 },
  { t: 25.9, type: 'pen', gain: 0.4 },
  { t: 26.5, type: 'blink', gain: 0.45 },
  { t: 26.6, type: 'stamp', gain: 0.5 },
  { t: 28.0, type: 'riser', gain: 0.3 },
  { t: 29.2, type: 'tick', gain: 0.4 },
  { t: 30.25, type: 'fold', gain: 0.45 },
  { t: 30.5, type: 'buzz', gain: 0.3 },
  { t: 30.8, type: 'pen', gain: 0.4 },
  { t: 33.6, type: 'snap', gain: 0.6 },
  { t: 33.85, type: 'stamp', gain: 0.8 },
  { t: 35.15, type: 'splat', gain: 0.8 },
  { t: 35.55, type: 'fold', gain: 0.4 },
  { t: 36.3, type: 'stamp', gain: 0.8 },
  { t: 37.3, type: 'moth', gain: 0.35 },
  { t: 39.5, type: 'bell', gain: 0.3 },
];

export const music = {
  kit: 'mind', bpm: 104, root: 'D', scale: 'minor', gain: 0.3,
  sections: [
    { from: 0, to: 3.75, mood: 'tense' },
    { from: 3.75, to: 12.25, mood: 'groove' },
    { from: 12.25, to: 16.45, mood: 'sad' },
    { from: 16.45, to: 26.5, mood: 'drive' },
    { from: 26.5, to: 35.1, mood: 'tense' },
    { from: 35.1, to: 40.2, mood: 'end' },
  ],
};
