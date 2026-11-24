// "The Peak-End Rule" — an INKBLOT case file (psychology, MindTrace).
// Kahneman, Fredrickson, Schreiber & Redelmeier (1993), "When more pain is
// preferred to less: adding a better end": 60 s in 14 °C water vs the same 60 s
// plus 30 s at 15 °C — 69% chose to repeat the longer trial.
// u = seconds since the scene started; S.at('word') = when that word is said.
import { clamp, lerp, ease, tween, rng, TAU, shake, pop } from '../../lib/core.mjs';
import { plate, caseCover, inkReveal } from '../../styles/inkblot/scenes.mjs';

export const meta = {
  title: 'The Peak-End Rule',
  slug: 'peak-end-rule-inkblot',
  style: 'inkblot',
  width: 1080, height: 1920, fps: 30,
  duration: 37.8,
  voice: 'voice.mp3',
  seed: 151,
  captionChars: 24,
  caseLine: 'THE MIND FILES  ·  CASE No. 1993  ·  CONFIDENTIAL',
  brandKit: 'mindtrace', // MindTrace (brand/mindtrace/): logo, handle, tagline, outro text
  outro: { at: 35.2 },
};

const KAHNEMAN = { glasses: true, hair: 'slick', tie: '#c61f2a' };

// a bucket of icy water with a hand in it
function bucket(ctx, k, P, x, y, s, t, shiver = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  // the arm and hand going in
  const sh = Math.sin(t * 40) * 3 * shiver;
  ctx.save(); ctx.translate(sh, 0); k.line(ctx, -220, -330, -40, -150, P.ink, 34); k.circle(ctx, -30, -140, 26, P.ink); ctx.restore();
  ctx.beginPath(); ctx.moveTo(-170, -160); ctx.lineTo(170, -160); ctx.lineTo(130, 120); ctx.lineTo(-130, 120); ctx.closePath(); k.fill(ctx, '#9aa3ad'); k.stroke(ctx, P.ink, 6);
  k.ellipse(ctx, 0, -160, 170, 30, 0, '#b9d4e6', P.ink, 5);
  const R = rng(7);
  for (let i = 0; i < 6; i++) { const ix = -120 + R() * 240, iy = -165 + (R() - 0.5) * 16; k.rect(ctx, ix - 18, iy - 14, 36, 28, '#f4fbff', P.inkSoft, 2, 6); }
  for (let i = 0; i < 3; i++) { const a = -0.9 + i * 0.4; k.line(ctx, -40 + Math.cos(a) * 60, -230 + Math.sin(a) * 30, -40 + Math.cos(a) * 80, -250 + Math.sin(a) * 40, P.sky, 4); }
  ctx.restore();
}
function thermometer(ctx, k, P, x, y, s, temp) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  k.rect(ctx, -18, -200, 36, 200, P.paperLight, P.ink, 4, 18); k.circle(ctx, 0, 20, 34, P.red, P.ink, 4);
  const h = lerp(40, 170, (temp - 10) / 10); k.rect(ctx, -8, -h, 16, h + 10, P.red);
  k.text(ctx, temp.toFixed(0) + '°C', 0, 80, 34, { font: 'display', color: P.ink });
  ctx.restore();
}
// discomfort over time: trial A (60 s) and trial B (60 s + 30 s slightly milder)
function painGraph(ctx, k, P, x, y, w, h, kA, kB, o = {}) {
  k.line(ctx, x, y, x + w, y, P.ink, 4); k.line(ctx, x, y, x, y - h, P.ink, 4);
  k.text(ctx, 'DISCOMFORT', x - 10, y - h - 30, 34, { align: 'left', color: P.inkSoft });
  const X = s => x + s / 90 * w, Y = v => y - v * h;
  const curve = (len, milder) => { const pts = []; for (let s = 0; s <= len; s += 2) { let v = 0.55 + 0.35 * Math.min(1, s / 50); if (milder && s > 60) v = lerp(0.9, 0.62, (s - 60) / 30); pts.push([X(s), Y(v)]); } return pts; };
  const draw = (pts, kk, col, lw) => { const n = Math.max(2, Math.floor(pts.length * clamp(kk))); if (kk <= 0) return; ctx.beginPath(); k.smooth(ctx, pts.slice(0, n), false); k.stroke(ctx, col, lw); };
  draw(curve(60, false), kA, P.ink, 16);
  draw(curve(90, true).map(([a, b]) => [a, b + 14]), kB, P.red, 7);
  [0, 30, 60, 90].forEach(s => k.text(ctx, s + 's', X(s), y + 40, 34, {}));
  if (o.labels) { k.text(ctx, 'A: 60 s', X(60) - 60, Y(0.9) - 50, 44, { font: 'display', color: P.ink }); if (kB > 0.9) k.text(ctx, 'B: 90 s', X(90) - 60, Y(0.62) + 70, 44, { font: 'display', color: P.red }); }
}

export const scenes = [
  { // 0.0 "Want people to remember you well? Fix the ending."
    start: 0, title: 'Fix the Ending',
    draw(ctx, u, S) {
      const { k, P, W } = S, rm = S.at('remember'), fx = S.at('Fix');
      plate(ctx, S, { alpha: 0.1, seed: 2 });
      S.cam(lerp(1.06, 1.0, tween(u, 0, 3.8)), W / 2, 540);
      // a memory as a film strip; the last frame gets rewritten
      const n = 5, fw = 160;
      k.rect(ctx, 50, 280, W - 100, 340, P.ink, null, 0, 8);
      for (let i = 0; i < 12; i++) { k.rect(ctx, 70 + i * 70, 294, 36, 20, P.paperLight, null, 0, 4); k.rect(ctx, 70 + i * 70, 586, 36, 20, P.paperLight, null, 0, 4); }
      for (let i = 0; i < n; i++) {
        const x = 80 + i * 168, last = i === n - 1, fixk = last ? tween(u, fx, fx + 0.6) : 0;
        k.rect(ctx, x, 330, fw - 8, 240, last ? (fixk > 0.5 ? '#f6e3b4' : P.greyLight) : P.paperDark, null, 0, 6);
        k.figure(ctx, x + 76, 560, { s: 0.6, mood: last ? (fixk > 0.5 ? 'smile' : 'worry') : ['calm', 'smile', 'calm', 'worry'][i], shadow: false });
      }
      k.penCircle(ctx, 80 + 4 * 168 + 76, 450, 110, 150, tween(u, fx, fx + 0.5), P.red, 7);
      k.scrawl(ctx, 'the ending', 80 + 4 * 168 + 30, 690, 64, tween(u, fx + 0.2, fx + 0.6));
      k.scrawl(ctx, 'how they remember you', W / 2, 180, 54, tween(u, rm, rm + 0.6));
    },
  },
  { // 4.08 "In 1993, Daniel Kahneman had people hold a hand in painfully cold water for 60 seconds,"
    start: 3.9, title: 'Kahneman, 1993', trans: 'bleed',
    draw(ctx, u, S) {
      const { k, P, W } = S, yr = S.at('1993'), dk = S.at('Daniel'), cw = S.at('cold'), s60 = S.at('60');
      plate(ctx, S, { alpha: 0.08, seed: 4 });
      bucket(ctx, k, P, 470, 820, 1.3, S.t, tween(u, cw - 0.3, cw));
      thermometer(ctx, k, P, 860, 760, 1.1, 14);
      k.figure(ctx, 130, 1010, { ...KAHNEMAN, s: 0.85, face: 1, look: [0.8, 0.2], mood: 'calm', armL: [1.2, 0.8], holdL: c => k.rect(c, -30, -60, 60, 80, P.paperLight, P.ink, 3) });
      const secs = Math.floor(60 * tween(u, s60 - 0.6, s60 + 0.8, ease.linear));
      k.clock(ctx, 770, 230, 80, 0, { hour: 0, minute: secs });
      k.text(ctx, secs + ' s', 770, 350, 54, { font: 'display', color: P.red });
      k.stamp(ctx, '1993', 280, 140, 60, tween(u, yr, yr + 0.25), -0.08);
      k.scrawl(ctx, 'Daniel Kahneman', 300, 260, 54, tween(u, dk, dk + 0.5), { rot: -0.05 });
      k.scrawl(ctx, 'painfully cold', 560, 480, 52, tween(u, cw, cw + 0.5));
    },
  },
  { // 11.18 "then for 90 seconds. The extra 30 were just slightly less cold."
    start: 11.0, title: '60 Seconds vs 90', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, s90 = S.at('90'), ex = S.at('extra'), sl = S.at('slightly');
      plate(ctx, S, { alpha: 0.06, seed: 11 });
      painGraph(ctx, k, P, 110, 760, 720, 520, tween(u, 0, 0.8), tween(u, s90 - 0.2, sl + 0.6), { labels: true });
      const t = lerp(14, 15, tween(u, sl, sl + 0.6));
      thermometer(ctx, k, P, 870, 330, 0.8, t);
      k.scrawl(ctx, '+30 s, slightly less cold', 600, 930, 50, tween(u, ex, ex + 0.6));
    },
  },
  { // 17.48 "Which would they repeat?"
    start: 17.3, title: 'Which One Again?', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, rp = S.at('repeat');
      plate(ctx, S, { alpha: 0.08, seed: 17 });
      [['A', '60 s', P.inkSoft], ['B', '90 s', P.red]].forEach(([l, d, c], i) => {
        const p = pop(u, 0.05 + i * 0.15, 0.3); if (!p) return;
        ctx.save(); ctx.translate(260 + i * 420, 460); ctx.scale(p, p);
        k.rect(ctx, -160, -200, 320, 400, P.paperLight, c, 6, 14);
        k.text(ctx, l, 0, -80, 140, { font: 'display', color: c }); k.text(ctx, d, 0, 80, 64, { font: 'display' });
        ctx.restore();
      });
      const q = pop(u, rp - 0.2, 0.35); if (q) k.text(ctx, '?', W / 2, 860, 200 * q, { font: 'display', color: P.red });
    },
  },
  { // 19.32 "69% chose the longer one. More pain!"
    start: 19.2, title: '69% Chose More Pain', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, n = S.at('69%'), mp = S.at('More');
      plate(ctx, S, { alpha: 0.06, seed: 69 });
      k.text(ctx, 'CHOSE TO REPEAT THE 90 s TRIAL', W / 2, 110, 36, { color: P.inkSoft });
      const v = 69 * tween(u, n - 0.1, n + 0.8, ease.outCubic);
      k.percentGrid(ctx, 170, 180, 600, v);
      k.text(ctx, Math.round(v) + '%', W / 2, 900, 120, { font: 'display', color: P.red });
      k.stamp(ctx, 'MORE PAIN!', W / 2, 1000, 50, tween(u, mp, mp + 0.2), -0.06);
    },
  },
  { // 24.14 "Here's the trick. We judge an experience by its peak and its end."
    start: 24.0, title: 'The Peak-End Rule', trans: 'bleed',
    draw(ctx, u, S) {
      const { k, P, W } = S, pk = S.at('peak'), en = S.at('end.');
      plate(ctx, S, { alpha: 0.06, seed: 24 });
      k.stamp(ctx, 'THE TRICK', 220, 110, 42, tween(u, 0.05, 0.25), -0.1);
      // an experience over time; memory keeps only the peak and the end
      const pts = [[100, 700], [200, 620], [300, 660], [400, 450], [470, 330], [540, 520], [640, 600], [740, 560], [840, 430]];
      const fade = tween(u, en + 0.3, en + 1.0);
      ctx.save(); ctx.globalAlpha = 1 - 0.75 * fade; ctx.beginPath(); k.smooth(ctx, pts, false); k.stroke(ctx, P.ink, 8); ctx.restore();
      k.line(ctx, 80, 780, 880, 780, P.ink, 4);
      k.text(ctx, 'TIME →', 820, 820, 28, { color: P.inkSoft });
      const p1 = pop(u, pk - 0.1, 0.3), p2 = pop(u, en - 0.1, 0.3);
      if (p1) { k.circle(ctx, 470, 330, 26 * p1, P.red, P.ink, 4); k.scrawl(ctx, 'the peak', 470, 260, 58, 1); }
      if (p2) { k.circle(ctx, 840, 430, 26 * p2, P.red, P.ink, 4); k.scrawl(ctx, 'the end', 820, 360, 58, 1); }
      k.scrawl(ctx, '…the rest fades', 330, 900, 50, tween(u, en + 0.5, en + 1.0));
    },
  },
  { // 29.32 "So end every date, talk and apology strong."
    start: 29.2, title: 'End Strong', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, dt = S.at('date'), tk = S.at('talk'), ap = S.at('apology'), st = S.at('strong');
      plate(ctx, S, { alpha: 0.08, seed: 29 });
      const items = [['DATE', dt], ['TALK', tk], ['APOLOGY', ap]];
      items.forEach(([l, at], i) => {
        const p = pop(u, at - 0.1, 0.3); if (!p) return;
        const x = 170 + i * 300;
        ctx.save(); ctx.translate(x, 470); ctx.scale(p * 1.1, p * 1.1);
        k.rect(ctx, -130, -200, 260, 360, P.paperLight, P.ink, 5, 12);
        if (i === 0) { k.figure(ctx, -40, 70, { s: 0.42, face: 1, mood: 'smile', shadow: false }); k.figure(ctx, 40, 70, { s: 0.42, face: -1, hair: 'bob', skirt: true, mood: 'smile', shadow: false }); k.heart(ctx, 0, -120, 30, P.red); }
        if (i === 1) { k.figure(ctx, 0, 70, { s: 0.45, face: 1, mood: 'smile', armR: [2.2, 0.4], shadow: false }); k.rect(ctx, -115, -170, 230, 76, P.paperLight, P.ink, 3, 24); k.text(ctx, '…and finally!', 0, -132, 34, { font: 'hand', color: P.red }); }
        if (i === 2) { k.letter(ctx, 0, -40, 200, 150, ['I’m sorry.', 'Here’s how', 'I’ll fix it.'], 1, { size: 32 }); }
        k.text(ctx, l, 0, 130, 40, { font: 'display' });
        // the ending arrow goes up
        k.arrow(ctx, -80, 210, 90, 180, tween(u, st - 0.2 + i * 0.12, st + 0.2 + i * 0.12), P.red, 6, -0.3);
        ctx.restore();
      });
      k.stamp(ctx, 'END STRONG', W / 2, 900, 70, tween(u, st, st + 0.25), -0.06);
    },
  },
  { // 33.84 "Follow for more mind tricks." → the case-file cover
    start: 33.62, title: 'More Mind Tricks', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      ctx.save(); plate(ctx, S, { alpha: 0.08, seed: 29 }); ctx.restore();
      inkReveal(ctx, S, tween(u, 0.05, 0.75, ease.linear), c => caseCover(c, S, u - 0.05, { handle: meta.brand.handle, caseNo: '1993', tagline: meta.brand.tagline }));
    },
  },
];

export const sfx = [
  { t: 0.2, type: 'click', gain: 0.4 },
  { t: 1.0, type: 'slide', gain: 0.35 },
  { t: 2.3, type: 'pen', gain: 0.55 },
  { t: 2.8, type: 'chime', gain: 0.4, pitch: 1.2 },
  { t: 3.9, type: 'splat', gain: 0.6 },
  { t: 4.15, type: 'stamp', gain: 0.7 },
  { t: 5.4, type: 'pen', gain: 0.45 },
  { t: 7.4, type: 'waves', gain: 0.4 },
  { t: 8.2, type: 'crack', gain: 0.5 },
  { t: 9.0, type: 'tick', gain: 0.5 }, { t: 10.0, type: 'tick', gain: 0.4 },
  { t: 11.0, type: 'fold', gain: 0.45 },
  { t: 12.0, type: 'pen', gain: 0.4 },
  { t: 13.5, type: 'pen', gain: 0.45 },
  { t: 15.0, type: 'riser', gain: 0.3 },
  { t: 17.3, type: 'whoosh', gain: 0.35 },
  { t: 17.4, type: 'pop', gain: 0.45 }, { t: 17.55, type: 'pop', gain: 0.45, pitch: 1.2 },
  { t: 17.9, type: 'heartbeat', gain: 0.45 },
  { t: 19.2, type: 'fold', gain: 0.45 },
  { t: 19.5, type: 'riser', gain: 0.35 },
  { t: 20.3, type: 'gong', gain: 0.4 },
  { t: 22.4, type: 'stamp', gain: 0.85 },
  { t: 24.0, type: 'splat', gain: 0.6 },
  { t: 24.1, type: 'stamp', gain: 0.4 },
  { t: 26.9, type: 'pop', gain: 0.55, pitch: 1.2 },
  { t: 28.2, type: 'pop', gain: 0.55, pitch: 1.4 },
  { t: 28.8, type: 'wind', gain: 0.3 },
  { t: 29.2, type: 'fold', gain: 0.45 },
  { t: 30.3, type: 'pop', gain: 0.45 }, { t: 31.1, type: 'pop', gain: 0.45, pitch: 1.2 }, { t: 31.7, type: 'pop', gain: 0.45, pitch: 1.4 },
  { t: 32.2, type: 'chime', gain: 0.45, pitch: 1.2 },
  { t: 32.3, type: 'stamp', gain: 0.8 },
  { t: 33.7, type: 'splat', gain: 0.8 },
  { t: 34.1, type: 'fold', gain: 0.4 },
  { t: 34.9, type: 'stamp', gain: 0.8 },
  { t: 35.8, type: 'moth', gain: 0.35 },
  { t: 37.1, type: 'bell', gain: 0.3 },
];

export const music = {
  kit: 'mind', bpm: 96, root: 'D', scale: 'dorian', gain: 0.3,
  sections: [
    { from: 0, to: 3.9, mood: 'intro' },
    { from: 3.9, to: 17.3, mood: 'tense' },
    { from: 17.3, to: 24.0, mood: 'drive' },
    { from: 24.0, to: 33.62, mood: 'triumph' },
    { from: 33.62, to: 37.8, mood: 'end' },
  ],
};
