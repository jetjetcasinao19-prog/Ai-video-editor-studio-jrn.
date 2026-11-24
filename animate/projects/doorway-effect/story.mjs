// "The Doorway Effect" — an INKBLOT case file (psychology, MindTrace).
// Radvansky, Krawietz & Tamplin (2011), University of Notre Dame, "Walking through
// doorways causes forgetting": carrying objects between rooms, people forgot more
// after passing through a doorway than after walking the same distance in one room
// (event boundaries / the Event Horizon Model). Tip: say it out loud (production effect).
// u = seconds since the scene started; S.at('word') = when that word is said.
import { clamp, lerp, ease, tween, rng, TAU, shake, pop } from '../../lib/core.mjs';
import { plate, caseCover, inkReveal } from '../../styles/inkblot/scenes.mjs';

export const meta = {
  title: 'The Doorway Effect',
  slug: 'doorway-effect-inkblot',
  style: 'inkblot',
  width: 1080, height: 1920, fps: 30,
  duration: 33.2,
  voice: 'voice.mp3',
  seed: 239,
  captionChars: 24,
  caseLine: 'THE MIND FILES  ·  CASE No. 2011  ·  CONFIDENTIAL',
  brandKit: 'mindtrace', // MindTrace (brand/mindtrace/): logo, handle, tagline, outro text
  outro: { at: 30.9 },
};

const YOU = { hair: 'bob', tie: '#c61f2a' };

function scissors(ctx, k, P, x, y, s, open = 0.3, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  for (const sg of [-1, 1]) {
    ctx.save(); ctx.rotate(sg * open * 0.5);
    k.poly(ctx, [[0, 0], [110, sg * -6], [110, sg * 4], [0, sg * 12]], P.greyLight, P.ink, 3);
    k.circle(ctx, -46, sg * 22, 24, null, P.red, 10);
    k.line(ctx, -24, sg * 14, 0, sg * 4, P.red, 10);
    ctx.restore();
  }
  k.circle(ctx, 0, 0, 6, P.ink);
  ctx.restore();
}
// a thought bubble above (x, y); k 0..1 shows it, fade 0..1 pops it away
function thought(ctx, k, P, x, y, r, kk, draw) {
  if (kk <= 0) return;
  ctx.save(); ctx.globalAlpha = clamp(kk);
  k.circle(ctx, x - r * 0.9, y + r * 1.25, r * 0.12, P.paperLight, P.ink, 3);
  k.circle(ctx, x - r * 0.6, y + r * 0.95, r * 0.2, P.paperLight, P.ink, 3);
  k.ellipse(ctx, x, y, r * 1.2, r * 0.85, 0, P.paperLight, P.ink, 4);
  if (draw) draw();
  ctx.restore();
}
// top-down floor plan: rooms as rectangles, an opening for the door
function floorplan(ctx, k, P, rooms) {
  for (const [x, y, w, h] of rooms) k.rect(ctx, x, y, w, h, P.card, P.ink, 6, 2);
}
function box(ctx, k, P, x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); k.rect(ctx, -30, -24, 60, 44, '#c9a86a', P.ink, 3, 3); k.circle(ctx, -8, -30, 9, P.red, P.ink, 2); k.rect(ctx, 4, -40, 14, 18, P.sky, P.ink, 2, 2); ctx.restore(); }

export const scenes = [
  { // 0.02 "Walked into a room and forgot why? Blame the door."
    start: 0, title: 'Forgot Why?',
    draw(ctx, u, S) {
      const { k, P, W } = S, ro = S.at('room'), fg = S.at('forgot'), bl = S.at('Blame'), dr = S.at('door.');
      plate(ctx, S, { alpha: 0.12, seed: 3 });
      k.door(ctx, W / 2, 1040, 1.15, 0.85, { color: P.paperDark });
      const w = tween(u, 0, fg, ease.linear);
      const x = lerp(160, 700, w);
      k.figure(ctx, x, 1040, { ...YOU, s: 1.05, face: 1, walk: w < 1 ? u * 1.6 : 0, look: [1, 0], mood: u > fg + 0.3 ? 'worry' : 'calm' });
      // the reason in a thought bubble, popped as they pass the door
      const gone = tween(u, ro + 0.2, fg + 0.2);
      thought(ctx, k, P, x + 70, 460, 90, 1 - gone, () => scissors(ctx, k, P, x + 70, 460, 0.7, 0.3, -0.2));
      if (u > fg) { const q = pop(u, fg, 0.3); ctx.save(); ctx.translate(x + 60, 450); ctx.scale(q, q); k.text(ctx, '?', 0, 0, 160, { font: 'display', color: P.red }); ctx.restore(); }
      k.penCircle(ctx, W / 2, 780, 230, 320, tween(u, bl, dr + 0.4));
      k.scrawl(ctx, 'blame the door', W / 2, 200, 56, tween(u, bl, bl + 0.5), { rot: -0.04 });
    },
  },
  { // 4.24 "In 2011, psychologists at the University of Notre Dame had people move objects from room to room."
    start: 4.1, title: 'Room to Room', trans: 'bleed',
    draw(ctx, u, S) {
      const { k, P, W } = S, yr = S.at('2011'), nd = S.at('Notre'), mv = S.at('move');
      plate(ctx, S, { alpha: 0.08, seed: 5 });
      k.stamp(ctx, '2011', 780, 110, 60, tween(u, yr, yr + 0.25), 0.1);
      k.scrawl(ctx, 'University of Notre Dame', 330, 130, 44, tween(u, nd - 0.3, nd + 0.5), { rot: -0.04 });
      // floor plan seen from above, with a doorway between two rooms
      floorplan(ctx, k, P, [[100, 300, 360, 520], [480, 300, 360, 520]]);
      k.rect(ctx, 452, 500, 36, 120, P.paper, null, 0, 0);
      k.line(ctx, 452, 500, 488, 470, P.redDark, 6);
      for (const [tx, ty] of [[220, 420], [720, 700]]) { k.rect(ctx, tx - 60, ty - 30, 120, 60, P.paperDark, P.ink, 3, 4); }
      // a person (seen from above) carries a box from table to table
      const p = tween(u, mv - 0.2, mv + 1.8, ease.inOut);
      const px = lerp(220, 720, p), py = lerp(480, 640, p) + Math.sin(p * Math.PI) * -60;
      k.circle(ctx, px, py, 34, P.ink); box(ctx, k, P, px + 40, py, 0.9);
      ctx.save(); ctx.setLineDash([4, 14]); ctx.beginPath(); ctx.moveTo(220, 480); ctx.quadraticCurveTo(470, 500, 720, 640); k.stroke(ctx, P.grey, 4); ctx.restore();
      k.scrawl(ctx, 'room to room', W / 2, 920, 50, tween(u, mv + 0.6, mv + 1.1));
    },
  },
  { // 11.2 "Walking through a doorway made them forget more than walking the same distance in one room."
    start: 11.05, title: 'Through a Door', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, dw = S.at('doorway'), fo = S.at('forget'), sa = S.at('same'), on = S.at('one');
      plate(ctx, S, { alpha: 0.08, seed: 11 });
      const lane = (y, door, at, label) => {
        k.rect(ctx, 60, y - 260, 820, 280, P.card, P.ink, 5, 4);
        if (door) { k.rect(ctx, 430, y - 260, 40, 280, P.inkSoft); k.rect(ctx, 434, y - 200, 32, 200, P.paperDark, P.ink, 2); }
        const w = tween(u, at - 0.4, at + 1.4, ease.linear), x = lerp(120, 800, w);
        k.figure(ctx, x, y, { ...YOU, s: 0.55, face: 1, walk: w < 1 ? u * 1.6 : 0, look: [1, 0], mood: 'calm', shadow: false, armR: [1.2, 0.6], holdR: c => box(c, k, P, 10, 0, 0.6) });
        const fade = door ? tween(u, at + 0.4, at + 0.9) : 0;
        thought(ctx, k, P, x + 40, y - 200, 46, 1 - fade * 0.85, () => k.circle(ctx, x + 40, y - 200, 18, P.red, P.ink, 2));
        if (door && fade > 0.5) k.text(ctx, '?', x + 40, y - 200, 54, { font: 'display', color: P.red });
        k.text(ctx, label, 470, y + 50, 32, { font: 'display', color: door ? P.red : P.ink });
      };
      lane(420, true, dw, 'THROUGH A DOORWAY');
      lane(860, false, sa, 'SAME DISTANCE, ONE ROOM');
      k.scrawl(ctx, 'forgot more', 760, 120, 50, tween(u, fo, fo + 0.4));
      k.penCircle(ctx, 470, 470, 220, 40, tween(u, on, on + 0.6));
    },
  },
  { // 16.92 "Here's the trick. Your brain treats a doorway like the end of a scene."
    start: 16.8, title: 'The End of a Scene', trans: 'blink',
    draw(ctx, u, S) {
      const { k, P, W } = S, br = S.at('brain'), en = S.at('end'), sc = S.at('scene');
      plate(ctx, S, { alpha: 0.08, seed: 17 });
      k.stamp(ctx, 'THE TRICK', 220, 110, 44, tween(u, 0.05, 0.25), -0.1);
      // a film strip runs through the door frame; the frame at the door turns into THE END
      const off = (S.t * 120) % 200;
      k.rect(ctx, -40, 470, W + 80, 260, P.ink);
      for (let i = -1; i < 7; i++) {
        const fx = i * 200 - off;
        for (let j = 0; j < 6; j++) { k.rect(ctx, fx + 10 + j * 32, 480, 18, 18, P.paperLight, null, 0, 3); k.rect(ctx, fx + 10 + j * 32, 702, 18, 18, P.paperLight, null, 0, 3); }
        k.rect(ctx, fx + 16, 510, 168, 180, P.paperDark, null, 0, 4);
        k.figure(ctx, fx + 100, 680, { ...YOU, s: 0.4, face: 1, walk: S.t * 1.6, look: [1, 0], mood: 'calm', shadow: false });
      }
      // the door frame
      k.rect(ctx, W / 2 - 130, 380, 30, 440, P.redDark, P.ink, 4); k.rect(ctx, W / 2 + 100, 380, 30, 440, P.redDark, P.ink, 4); k.rect(ctx, W / 2 - 130, 360, 260, 30, P.redDark, P.ink, 4);
      const e = tween(u, en - 0.2, en + 0.3);
      if (e > 0) { ctx.save(); ctx.globalAlpha = e; k.rect(ctx, W / 2 - 96, 510, 192, 180, P.ink, P.paperLight, 3, 4); k.text(ctx, 'THE END', W / 2, 600, 34, { font: 'serif', color: P.paperLight, max: 170 }); ctx.restore(); }
      k.scrawl(ctx, 'scene over', W / 2, 920, 56, tween(u, sc, sc + 0.4));
      k.scrawl(ctx, 'your brain', 760, 260, 46, tween(u, br, br + 0.4), { rot: 0.05 });
    },
  },
  { // 21.78 "It files the old one away."
    start: 21.65, title: 'Filed Away', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, fi = S.at('files'), aw = S.at('away');
      plate(ctx, S, { alpha: 0.08, seed: 21 });
      // the old scene's folder drops into the cabinet
      const dp = tween(u, fi - 0.1, aw + 0.1, ease.inQuad);
      if (dp < 1) { ctx.save(); ctx.translate(W / 2, lerp(240, 820, dp)); ctx.rotate(lerp(-0.1, 0, dp));
        k.rect(ctx, -170, -100, 340, 200, '#dcbd7e', P.ink, 4, 6);
        k.text(ctx, 'OLD SCENE:', 0, -40, 28, { font: 'type' }); k.text(ctx, 'get the scissors', 0, 10, 32, { font: 'hand', color: P.red });
        ctx.restore(); }
      k.rect(ctx, 250, 560, 440, 500, '#7c7f86', P.ink, 6, 8);
      for (let i = 0; i < 3; i++) { k.rect(ctx, 270, 580 + i * 158, 400, 140, '#9aa0a8', P.ink, 4, 6); k.rect(ctx, 430, 640 + i * 158, 80, 22, P.inkSoft, null, 0, 6); }
      k.rect(ctx, 240, 548, 460, 18, P.inkSoft, P.ink, 3, 4);
      k.stamp(ctx, 'FILED', 760, 300, 56, tween(u, aw, aw + 0.2), 0.08);
    },
  },
  { // 24.08 "So, before you go, say it out loud. Scissors. Kitchen."
    start: 23.95, title: 'Say It Out Loud', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, bf = S.at('before'), ld = S.at('loud'), sc = S.at('Scissors'), ki = S.at('Kitchen');
      plate(ctx, S, { alpha: 0.1, seed: 24 });
      k.door(ctx, 700, 1040, 1.0, 0.8, { color: P.paperDark });
      k.figure(ctx, 330, 1040, { ...YOU, s: 1.1, face: 1, look: [1, -0.2], mood: 'smile', armR: [lerp(0.2, 1.3, tween(u, sc - 0.3, sc)), 0.3], holdR: c => scissors(c, k, P, 20, 0, 0.5, 0.2, -0.6) });
      k.scrawl(ctx, 'before you go', 330, 260, 50, tween(u, bf, bf + 0.5), { rot: -0.04 });
      const b1 = pop(u, sc - 0.15, 0.3), b2 = pop(u, ki - 0.15, 0.3);
      if (b1) { ctx.save(); ctx.translate(560, 440); ctx.scale(b1, b1); k.rect(ctx, -160, -60, 320, 120, P.paperLight, P.ink, 4, 40); k.poly(ctx, [[-100, 60], [-150, 110], [-50, 60]], P.paperLight, P.ink, 4); k.text(ctx, '"Scissors."', 0, 4, 46, { font: 'hand', color: P.red }); ctx.restore(); }
      if (b2) { ctx.save(); ctx.translate(640, 600); ctx.scale(b2, b2); k.rect(ctx, -160, -60, 320, 120, P.paperLight, P.ink, 4, 40); k.text(ctx, '"Kitchen."', 0, 4, 46, { font: 'hand', color: P.red }); ctx.restore(); }
      k.stamp(ctx, 'SAY IT OUT LOUD', W / 2, 150, 48, tween(u, ld - 0.1, ld + 0.1), -0.05);
    },
  },
  { // 29.23 "Follow for more mind tricks." → the case-file cover
    start: 29.05, title: 'More Mind Tricks', trans: 'cut',
    draw(ctx, u, S) {
      ctx.save(); plate(ctx, S, { alpha: 0.1, seed: 24 }); ctx.restore();
      inkReveal(ctx, S, tween(u, 0.1, 0.8, ease.linear), c => caseCover(c, S, u - 0.1, { handle: meta.brand.handle, caseNo: '2011', tagline: meta.brand.tagline }));
    },
  },
];

export const sfx = [
  { t: 0.1, type: 'slide', gain: 0.35 },
  { t: 0.8, type: 'pop', gain: 0.35 },
  { t: 1.4, type: 'snap', gain: 0.45 },
  { t: 1.7, type: 'pluck', gain: 0.4 },
  { t: 2.7, type: 'pen', gain: 0.45 },
  { t: 3.1, type: 'pen', gain: 0.4 },
  { t: 4.1, type: 'splat', gain: 0.5 },
  { t: 4.45, type: 'stamp', gain: 0.7 },
  { t: 6.8, type: 'pen', gain: 0.4 },
  { t: 8.4, type: 'paper', gain: 0.35 },
  { t: 9.6, type: 'slide', gain: 0.3 },
  { t: 10.6, type: 'pen', gain: 0.4 },
  { t: 11.05, type: 'fold', gain: 0.45 },
  { t: 12.4, type: 'snap', gain: 0.4 },
  { t: 12.9, type: 'pen', gain: 0.4 },
  { t: 15.5, type: 'pen', gain: 0.4 },
  { t: 16.8, type: 'blink', gain: 0.45 },
  { t: 16.95, type: 'stamp', gain: 0.45 },
  { t: 18.4, type: 'pen', gain: 0.35 },
  { t: 19.9, type: 'click', gain: 0.6 },
  { t: 21.0, type: 'pen', gain: 0.4 },
  { t: 21.65, type: 'whoosh', gain: 0.35 },
  { t: 21.85, type: 'slide', gain: 0.4 },
  { t: 22.6, type: 'paper', gain: 0.4 },
  { t: 23.1, type: 'clank', gain: 0.55 },
  { t: 23.15, type: 'stamp', gain: 0.6 },
  { t: 23.95, type: 'fold', gain: 0.45 },
  { t: 24.3, type: 'pen', gain: 0.4 },
  { t: 25.9, type: 'stamp', gain: 0.7 },
  { t: 26.85, type: 'pop', gain: 0.5 },
  { t: 27.85, type: 'pop', gain: 0.5, pitch: 1.2 },
  { t: 29.1, type: 'splat', gain: 0.75 },
  { t: 29.5, type: 'fold', gain: 0.4 },
  { t: 30.3, type: 'stamp', gain: 0.75 },
  { t: 31.2, type: 'moth', gain: 0.3 },
  { t: 32.7, type: 'bell', gain: 0.25 },
];

export const music = {
  kit: 'mind', bpm: 100, root: 'A', scale: 'dorian', gain: 0.3,
  sections: [
    { from: 0, to: 4.1, mood: 'intro' },
    { from: 4.1, to: 16.8, mood: 'groove' },
    { from: 16.8, to: 23.95, mood: 'drive' },
    { from: 23.95, to: 29.05, mood: 'triumph' },
    { from: 29.05, to: 33.2, mood: 'end' },
  ],
};
