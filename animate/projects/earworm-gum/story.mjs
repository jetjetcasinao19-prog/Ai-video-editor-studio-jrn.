// "The Earworm Gum Trick" — an INKBLOT case file (psychology, MindTrace).
// Beaman, Powell & Rapley (2015), University of Reading, "Want to block earworms
// from conscious awareness? B(u)y gum!": chewing gum → fewer replays of a song
// you're trying not to think about (it occupies the inner voice / subvocal system).
// u = seconds since the scene started; S.at('word') = when that word is said.
import { clamp, lerp, ease, tween, rng, TAU, shake, pop } from '../../lib/core.mjs';
import { plate, study, caseCover, inkReveal } from '../../styles/inkblot/scenes.mjs';

export const meta = {
  title: 'The Earworm Gum Trick',
  slug: 'earworm-gum-inkblot',
  style: 'inkblot',
  width: 1080, height: 1920, fps: 30,
  duration: 33.6,
  voice: 'voice.mp3',
  seed: 173,
  captionChars: 24,
  caseLine: 'THE MIND FILES  ·  CASE No. 2015  ·  CONFIDENTIAL',
  brandKit: 'mindtrace', // MindTrace (brand/mindtrace/): logo, handle, tagline, outro text
  outro: { at: 31.0 },
};

function note(ctx, k, P, x, y, s = 1, col = P.red, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  k.ellipse(ctx, 0, 0, 22, 16, -0.4, col); k.line(ctx, 19, -6, 19, -80, col, 6);
  ctx.beginPath(); ctx.moveTo(19, -80); ctx.quadraticCurveTo(50, -70, 44, -40); k.stroke(ctx, col, 6);
  ctx.restore();
}
// notes circling on repeat around (x, y)
function notesLoop(ctx, k, P, x, y, r, t, n, a = 1, col = P.red) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  for (let i = 0; i < n; i++) { const an = t * 1.6 + i / n * TAU; note(ctx, k, P, x + Math.cos(an) * r, y + Math.sin(an) * r * 0.6, 0.9, col, Math.sin(an) * 0.3); }
  ctx.restore();
}
function gum(ctx, k, P, x, y, s = 1, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  k.rect(ctx, -110, -36, 220, 72, '#e9a3b6', P.ink, 4, 8);
  k.rect(ctx, -110, -36, 70, 72, P.paperLight, P.ink, 3, 8);
  k.text(ctx, 'GUM', 30, 2, 34, { font: 'display', color: P.paperLight });
  ctx.restore();
}
function headphones(ctx, k, P, x, y, s = 1) { // over a standing figure's head at (x, y = feet), scale s
  ctx.save(); ctx.translate(x, y - 368 * s); ctx.scale(s, s);
  ctx.beginPath(); ctx.arc(0, -10, 56, Math.PI * 1.05, Math.PI * 1.95); k.stroke(ctx, P.ink, 10);
  k.rect(ctx, -64, -16, 20, 40, P.red, P.ink, 3, 8); k.rect(ctx, 44, -16, 20, 40, P.red, P.ink, 3, 8);
  ctx.restore();
}

export const scenes = [
  { // 0.02 "Song stuck in your head? Grab a piece of gum."
    start: 0, title: 'Song Stuck in Your Head?',
    draw(ctx, u, S) {
      const { k, P, W } = S, st = S.at('stuck'), gm = S.at('gum');
      plate(ctx, S, { alpha: 0.12, seed: 2 });
      S.cam(lerp(1.06, 1.0, tween(u, 0, 3)), W / 2, 560);
      k.profile(ctx, 380, 1010, 1.55, { blink: 1, inside: c => notesLoop(c, k, P, 0, -230, 90, S.t, 4, tween(u, 0, st + 0.2), P.redLight) });
      k.scrawl(ctx, 'on repeat…', 380, 230, 60, tween(u, st, st + 0.5));
      const g = pop(u, gm - 0.15, 0.35);
      if (g) { ctx.save(); ctx.translate(760, 520); ctx.scale(g, g); gum(ctx, k, P, 0, 0, 1.3, -0.15); ctx.restore(); }
    },
  },
  { // 3.3 "In 2015, psychologists at the University of Reading played people catchy pop songs."
    start: 3.15, title: 'Reading, 2015', trans: 'bleed',
    draw(ctx, u, S) {
      const { k, P, W } = S, yr = S.at('2015'), ur = S.at('University'), pl = S.at('played');
      plate(ctx, S, { alpha: 0.08, seed: 5 });
      for (let i = 0; i < 3; i++) {
        const x = 200 + i * 270;
        k.figure(ctx, x, 1010, { s: 0.95, face: 1, look: [0, -0.2], mood: u > pl + 0.4 ? 'smile' : 'calm', hair: ['bob', 'slick', 'bun'][i], skirt: i !== 1, shadow: false, bob: u > pl ? Math.abs(Math.sin(u * 5 + i)) * 6 : 0 });
        headphones(ctx, k, P, x, 1010 - (u > pl ? Math.abs(Math.sin(u * 5 + i)) * 6 : 0), 0.95);
        if (u > pl) notesLoop(ctx, k, P, x, 420, 70, S.t + i, 2, tween(u, pl, pl + 0.4));
      }
      k.stamp(ctx, '2015', 790, 120, 64, tween(u, yr, yr + 0.25), 0.1);
      k.scrawl(ctx, 'University of Reading', 380, 180, 58, tween(u, ur, ur + 0.6), { rot: -0.05 });
      k.scrawl(ctx, '(that’s in England)', 380, 250, 40, tween(u, ur + 0.6, ur + 1.1), { color: P.inkSoft });
    },
  },
  { // 9.12 "Then they asked them not to think about them."
    start: 8.95, title: "Don't Think About It", trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, nt = S.at('not'), th = S.at('think');
      plate(ctx, S, { alpha: 0.08, seed: 9 });
      ctx.save(); ctx.translate(W / 2, 220); ctx.rotate(-0.03);
      k.rect(ctx, -380, -80, 760, 160, P.paperLight, P.red, 6, 10);
      k.text(ctx, "DON'T THINK", 0, -24, 60, { font: 'display', color: P.red }); k.text(ctx, 'ABOUT THE SONG', 0, 40, 46, { font: 'display' });
      ctx.restore();
      // trying hard… and the notes leak out anyway
      k.figure(ctx, W / 2, 1010, { s: 1.15, face: 1, look: [0, -0.4], mood: 'worry', armL: [2.6, 1.6], armR: [2.6, 1.6], shadow: false });
      for (let i = 0; i < 4; i++) { const f = ((u - th) * 0.6 + i / 4) % 1; if (u > th) note(ctx, k, P, W / 2 + (i - 1.5) * 90 + Math.sin(f * 6) * 20, 560 - f * 220, 0.8, P.red, (i - 1.5) * 0.2); }
      for (let i = 0; i < 3; i++) { const f = (u * 1.3 + i / 3) % 1; k.ellipse(ctx, W / 2 + 70 + i * 24, 600 + f * 50, 6, 9, 0, P.sky, P.ink, 2); }
    },
  },
  { // 12.28 "People chewing gum heard the song in their heads less often."
    start: 12.1, title: 'Gum = Fewer Replays', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, cg = S.at('chewing'), lo = S.at('less');
      plate(ctx, S, { alpha: 0.08, seed: 12 });
      // left: no gum (lots of notes); right: chewing (fewer)
      k.profile(ctx, 230, 800, 0.95, { blink: 1, inside: c => notesLoop(c, k, P, 0, -230, 80, S.t, 5, 1, P.redLight) });
      const chew = Math.abs(Math.sin(u * 9));
      k.profile(ctx, 680, 800, 0.95, { blink: 1, inside: c => notesLoop(c, k, P, 0, -230, 80, S.t, 2, 1, P.redLight) });
      k.ellipse(ctx, 680 + 118, 800 - 80, 10, 4 + 6 * chew, 0, '#e9a3b6');
      gum(ctx, k, P, 860, 860, 0.6, -0.2);
      k.text(ctx, 'NO GUM', 230, 1000, 44, { font: 'display' }); k.text(ctx, 'CHEWING GUM', 680, 1000, 44, { font: 'display', color: P.red });
      // tally marks of how often the song came back (illustration)
      const kk = tween(u, lo - 0.6, lo + 0.4);
      for (let i = 0; i < Math.floor(9 * kk); i++) k.line(ctx, 110 + i * 26, 160, 110 + i * 26 + (i % 5 === 4 ? -110 : 0), 230, P.ink, 6);
      for (let i = 0; i < Math.floor(6 * kk); i++) k.line(ctx, 570 + i * 26, 160, 570 + i * 26 + (i % 5 === 4 ? -110 : 0), 230, P.red, 6);
      k.scrawl(ctx, 'less often', 680, 330, 60, tween(u, lo, lo + 0.5));
      k.text(ctx, '(illustration)', W / 2, 270, 24, { color: P.grey });
    },
  },
  { // 16.6 "Here's the trick. Replaying a song uses your inner voice, like silently singing."
    start: 16.25, title: 'Your Inner Voice', trans: 'bleed',
    draw(ctx, u, S) {
      const { k, P, W } = S, iv = S.at('inner'), sl = S.at('silently');
      plate(ctx, S, { alpha: 0.1, seed: 16 });
      k.stamp(ctx, 'THE TRICK', 220, 110, 42, tween(u, 0.05, 0.25), -0.1);
      // a tiny singing mouth inside the head
      k.profile(ctx, 380, 1010, 1.55, { blink: 1, inside: c => {
        const op = Math.abs(Math.sin(u * 7)) * tween(u, iv - 0.3, iv + 0.2);
        c.save(); c.translate(20, -230);
        k.ellipse(c, 0, 0, 70, 50, 0, P.paperDark);
        k.ellipse(c, 0, 6, 44, 6 + 26 * op, 0, P.redDark); k.ellipse(c, 0, -12, 50, 8, 0, P.rose);
        c.restore();
        notesLoop(c, k, P, 20, -230, 95, S.t, 3, tween(u, iv, iv + 0.4), P.redLight);
      } });
      k.scrawl(ctx, 'inner voice', 760, 280, 60, tween(u, iv, iv + 0.5));
      k.scrawl(ctx, '(silently singing)', 760, 360, 44, tween(u, sl, sl + 0.5), { color: P.inkSoft });
    },
  },
  { // 22.24 "Chewing jams that system. Less room for the chorus."
    start: 22.1, title: 'Jammed', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, jm = S.at('jams'), lr = S.at('room');
      plate(ctx, S, { alpha: 0.1, seed: 22 });
      const jam = tween(u, jm - 0.2, jm + 0.4, ease.outBack);
      k.profile(ctx, 380, 1010, 1.55, { blink: 1, inside: c => {
        c.save(); c.translate(20, -230);
        k.ellipse(c, 0, 0, 70, 50, 0, P.paperDark);
        // the gum fills the inner mouth
        k.blot(c, 0, 4, 120 * jam + 1, 80 * jam + 1, { seed: 77, color: '#e9a3b6', res: 0.8, splatter: 0 });
        c.restore();
      } });
      // the chorus bounces off and falls away
      for (let i = 0; i < 4; i++) { const f = clamp((u - lr + 0.4 - i * 0.15) / 1.2); if (f > 0 && f < 1) note(ctx, k, P, 420 + f * 300 + i * 40, 520 + f * f * 500, 0.9, P.red, f * 3); }
      k.stamp(ctx, 'JAMMED', 740, 300, 60, tween(u, jm, jm + 0.2), 0.12);
      k.scrawl(ctx, 'no room for the chorus', 600, 920, 48, tween(u, lr, lr + 0.6));
    },
  },
  { // 26.0 "So, next time it's on repeat. Chew."
    start: 25.85, title: 'On Repeat? Chew.', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, rp = S.at('repeat'), ch = S.at('Chew');
      plate(ctx, S, { alpha: 0.1, seed: 26 });
      // a repeat symbol spinning with notes — until the gum lands on it
      const brk = tween(u, ch, ch + 0.4);
      ctx.save(); ctx.translate(W / 2, 400); ctx.rotate(S.t * 2 * (1 - brk));
      for (const sgn of [0, 1]) { ctx.beginPath(); ctx.arc(0, 0, 200, sgn * Math.PI + 0.3, sgn * Math.PI + Math.PI - 0.3); k.stroke(ctx, P.ink, 18); const a = sgn * Math.PI + Math.PI - 0.3; k.poly(ctx, [[Math.cos(a) * 200 - 30, Math.sin(a) * 200], [Math.cos(a) * 200 + 30, Math.sin(a) * 200], [Math.cos(a + 0.25) * 200, Math.sin(a + 0.25) * 200 + 30 * (sgn ? -1 : 1)]], P.ink); }
      ctx.restore();
      if (brk < 1) notesLoop(ctx, k, P, W / 2, 400, 110, S.t, 3, (1 - brk) * tween(u, rp - 0.4, rp));
      const g = tween(u, ch - 0.2, ch + 0.05, ease.outBack);
      if (g > 0) { ctx.save(); ctx.translate(W / 2, lerp(-100, 400, g)); gum(ctx, k, P, 0, 0, 2.0, -0.1); ctx.restore(); }
      k.stamp(ctx, 'CHEW.', W / 2, 820, 90, tween(u, ch + 0.1, ch + 0.3), -0.06);
    },
  },
  { // 29.68 "Follow for more mind tricks." → the case-file cover
    start: 29.4, title: 'More Mind Tricks', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      ctx.save(); plate(ctx, S, { alpha: 0.1, seed: 26 }); gum(ctx, k, P, W / 2, 400, 2.0, -0.1); ctx.restore();
      inkReveal(ctx, S, tween(u, 0.1, 0.8, ease.linear), c => caseCover(c, S, u - 0.1, { handle: meta.brand.handle, caseNo: '2015', tagline: meta.brand.tagline }));
    },
  },
];

export const sfx = [
  { t: 0.1, type: 'pluck', gain: 0.4 }, { t: 0.5, type: 'pluck', gain: 0.4, pitch: 1.26 }, { t: 0.9, type: 'pluck', gain: 0.4, pitch: 1.5 },
  { t: 2.2, type: 'pop', gain: 0.6, pitch: 1.2 },
  { t: 3.15, type: 'splat', gain: 0.6 },
  { t: 3.45, type: 'stamp', gain: 0.7 },
  { t: 5.3, type: 'pen', gain: 0.45 },
  { t: 6.4, type: 'pluck', gain: 0.35 }, { t: 6.7, type: 'pluck', gain: 0.35, pitch: 1.26 }, { t: 7.0, type: 'pluck', gain: 0.35, pitch: 1.5 }, { t: 7.3, type: 'pluck', gain: 0.35, pitch: 1.26 },
  { t: 8.95, type: 'fold', gain: 0.45 },
  { t: 9.6, type: 'stamp', gain: 0.4 },
  { t: 10.9, type: 'pluck', gain: 0.35, pitch: 1.5 },
  { t: 11.3, type: 'heartbeat', gain: 0.35 },
  { t: 12.1, type: 'whoosh', gain: 0.35 },
  { t: 13.0, type: 'pop', gain: 0.4 }, { t: 13.5, type: 'pop', gain: 0.4 },
  { t: 14.8, type: 'pen', gain: 0.45 },
  { t: 16.25, type: 'splat', gain: 0.6 },
  { t: 16.35, type: 'stamp', gain: 0.4 },
  { t: 19.2, type: 'pluck', gain: 0.3, pitch: 1.26 }, { t: 19.6, type: 'pluck', gain: 0.3, pitch: 1.5 },
  { t: 20.6, type: 'pen', gain: 0.4 },
  { t: 22.1, type: 'fold', gain: 0.45 },
  { t: 22.5, type: 'splat', gain: 0.5 },
  { t: 22.7, type: 'stamp', gain: 0.75 },
  { t: 24.3, type: 'flop', gain: 0.45 },
  { t: 25.85, type: 'whoosh', gain: 0.35 },
  { t: 27.3, type: 'slide', gain: 0.4 },
  { t: 28.3, type: 'thud', gain: 0.8 },
  { t: 28.45, type: 'stamp', gain: 0.8 },
  { t: 29.5, type: 'splat', gain: 0.8 },
  { t: 29.9, type: 'fold', gain: 0.4 },
  { t: 30.7, type: 'stamp', gain: 0.8 },
  { t: 31.5, type: 'moth', gain: 0.35 },
  { t: 32.9, type: 'bell', gain: 0.3 },
];

export const music = {
  kit: 'mind', bpm: 104, root: 'C', scale: 'major', gain: 0.28,
  sections: [
    { from: 0, to: 3.15, mood: 'intro' },
    { from: 3.15, to: 12.1, mood: 'groove' },
    { from: 12.1, to: 22.1, mood: 'drive' },
    { from: 22.1, to: 29.4, mood: 'triumph' },
    { from: 29.4, to: 33.6, mood: 'end' },
  ],
};
