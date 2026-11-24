// "The To-Do List Sleep Trick" — an INKBLOT case file (psychology, MindTrace).
// Scullin, Krueger, Ballard, Pruett & Bliwise (2018), Baylor University sleep lab:
// 5 minutes writing a to-do list vs a completed-activities list before bed —
// the to-do group fell asleep about 9 minutes faster; more specific lists, faster sleep.
// u = seconds since the scene started; S.at('word') = when that word is said.
import { clamp, lerp, ease, tween, rng, TAU, shake, pop } from '../../lib/core.mjs';
import { plate, night, caseCover, inkReveal } from '../../styles/inkblot/scenes.mjs';

export const meta = {
  title: 'The To-Do List Sleep Trick',
  slug: 'todo-list-sleep-inkblot',
  style: 'inkblot',
  width: 1080, height: 1920, fps: 30,
  duration: 35.2,
  voice: 'voice.mp3',
  seed: 162,
  captionChars: 24,
  caseLine: 'THE MIND FILES  ·  CASE No. 2018  ·  CONFIDENTIAL',
  brandKit: 'mindtrace', // MindTrace (brand/mindtrace/): logo, handle, tagline, outro text
  outro: { at: 32.6 },
};

const THOUGHTS = ['email!', 'rent', 'call mom', 'that meeting', 'gym?', 'the report'];

function listCard(ctx, k, P, x, y, s, title, items, done, kk, col) {
  if (kk <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(s * ease.outBack(clamp(kk)), s * ease.outBack(clamp(kk)));
  k.rect(ctx, -170, -220, 340, 440, P.paperLight, col, 6, 10);
  k.text(ctx, title, 0, -170, 44, { font: 'display', color: col });
  items.forEach((it, i) => {
    const yy = -90 + i * 80;
    k.rect(ctx, -140, yy - 22, 44, 44, null, P.ink, 4, 4);
    if (done) k.penLine(ctx, [[-134, yy], [-120, yy + 16], [-96, yy - 20]], 1, P.red, 6, i + 1);
    k.scrawl(ctx, it, -80, yy, 40, 1, { align: 'left', color: P.ink, rot: 0 });
  });
  ctx.restore();
}

export const scenes = [
  { // 0.0 "Can't fall asleep because your brain won't stop? Do this."
    start: 0, title: "Brain Won't Stop?",
    draw(ctx, u, S) {
      const { k, P, W } = S, bs = S.at('brain'), dt = S.at('this');
      night(ctx, S);
      S.cam(lerp(1.06, 1.0, tween(u, 0, 4)), W / 2, 600);
      k.bed(ctx, 430, 1000, 1.35, S.t, { blink: 1, blanket: P.sky });
      // racing thoughts circle the sleeper's head
      THOUGHTS.forEach((t, i) => {
        const p = pop(u, 0.2 + i * 0.25, 0.3); if (!p) return;
        const a = S.t * 0.7 + i / THOUGHTS.length * TAU;
        ctx.save(); ctx.globalAlpha = p * (1 - 0.6 * tween(u, dt, dt + 0.4));
        k.scrawl(ctx, t, 430 + Math.cos(a) * 270, 600 + Math.sin(a) * 170, 46, 1, { color: P.redLight });
        ctx.restore();
      });
      const n = pop(u, dt - 0.1, 0.35);
      if (n) { ctx.save(); ctx.translate(780, 400); ctx.scale(n, n); ctx.rotate(0.08); k.notepad(ctx, 0, 0, 1.2); k.quill(ctx, 70, 60, 0.6, -0.5); ctx.restore(); }
    },
  },
  { // 4.38 "In 2018, Baylor University researchers brought people into a sleep lab."
    start: 4.1, title: 'Baylor, 2018', trans: 'bleed',
    draw(ctx, u, S) {
      const { k, P, W } = S, yr = S.at('2018'), bu = S.at('Baylor'), sl = S.at('sleep');
      plate(ctx, S, { blot: false, bg: '#d9d3c4' });
      // a sleep-lab bed wired to a monitor
      k.bed(ctx, 400, 960, 1.3, S.t, { blink: 1, blanket: '#cfd8e0' });
      k.line(ctx, 200, 800, 700, 560, P.red, 3); k.line(ctx, 210, 810, 700, 580, P.sky, 3);
      k.rect(ctx, 660, 440, 240, 200, P.ink, P.ink, 4, 10); k.rect(ctx, 676, 456, 208, 140, '#1f3d2e', null, 0, 6);
      ctx.beginPath(); for (let i = 0; i <= 60; i++) { const x = 680 + i * 3.4, y = 526 + Math.sin(i * 0.7 + S.t * 8) * 18 * (0.4 + 0.6 * Math.abs(Math.sin(i * 0.13))); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } k.stroke(ctx, '#8fe0a0', 3);
      k.rect(ctx, 760, 640, 40, 120, P.ink);
      k.stamp(ctx, '2018', 240, 150, 64, tween(u, yr, yr + 0.25), -0.08);
      k.scrawl(ctx, 'Baylor University', 330, 270, 60, tween(u, bu, bu + 0.5), { rot: -0.05 });
      k.scrawl(ctx, 'sleep lab', 780, 380, 54, tween(u, sl, sl + 0.4));
    },
  },
  { // 9.34 "Before bed, half wrote a to-do list for tomorrow. Half wrote what they'd already done."
    start: 9.2, title: 'Two Lists Before Bed', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, td = S.at('to-do'), dn = S.at('already');
      plate(ctx, S, { alpha: 0.06, seed: 9 });
      listCard(ctx, k, P, 240, 470, 1.0, 'TO DO', ['email Sam', 'buy milk', 'call mom'], false, tween(u, td - 0.3, td + 0.2), P.red);
      listCard(ctx, k, P, 700, 470, 1.0, 'DONE', ['gym', 'laundry', 'reports'], true, tween(u, dn - 0.3, dn + 0.2), P.ink);
      k.text(ctx, 'HALF', 240, 900, 54, { font: 'display', color: P.red });
      k.text(ctx, 'HALF', 700, 900, 54, { font: 'display' });
      k.scrawl(ctx, 'for tomorrow', 240, 980, 44, tween(u, td + 0.4, td + 0.9));
      k.scrawl(ctx, 'already done', 700, 980, 44, tween(u, dn + 0.2, dn + 0.7), { color: P.ink });
    },
  },
  { // 14.74 "The to-do list group fell asleep about nine minutes faster."
    start: 14.6, title: '9 Minutes Faster', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, fa = S.at('fell'), nm = S.at('nine');
      plate(ctx, S, { alpha: 0.06, seed: 14 });
      k.text(ctx, 'TIME TO FALL ASLEEP', W / 2, 110, 40, { color: P.inkSoft });
      // two horizontal bars (illustrative lengths): done-list longer, to-do list ~9 min shorter
      const kb = tween(u, fa - 0.4, nm + 0.3, ease.outCubic);
      k.text(ctx, 'DONE LIST', 120, 330, 40, { align: 'left', font: 'display' });
      k.rect(ctx, 120, 360, 700 * kb, 90, P.inkSoft, P.ink, 4, 8);
      k.text(ctx, 'TO-DO LIST', 120, 560, 40, { align: 'left', font: 'display', color: P.red });
      k.rect(ctx, 120, 590, 450 * kb, 90, P.red, P.ink, 4, 8);
      if (kb > 0.95) { k.line(ctx, 570, 630, 820, 630, P.ink, 3); k.arrow(ctx, 820, 720, 580, 720, 1, P.red, 6, 0); }
      const p = pop(u, nm, 0.4);
      if (p) { ctx.save(); ctx.translate(W / 2, 860); ctx.scale(p, p); k.text(ctx, '≈ 9 min faster', 0, 0, 90, { font: 'display', color: P.red }); ctx.restore(); }
      for (let i = 0; i < 3; i++) { const q = pop(u, nm + 0.4 + i * 0.2, 0.3); if (q) k.text(ctx, 'z', 640 + i * 50, 540 - i * 40, 50 + i * 16, { font: 'hand', color: P.red }); }
    },
  },
  { // 18.86 "Here's the trick. Your brain keeps replaying unfinished tasks."
    start: 18.7, title: 'Unfinished Tasks on Replay', trans: 'bleed',
    draw(ctx, u, S) {
      const { k, P, W } = S, rp = S.at('replaying'), uf = S.at('unfinished');
      plate(ctx, S, { alpha: 0.1, seed: 18 });
      k.stamp(ctx, 'THE TRICK', 220, 110, 42, tween(u, 0.05, 0.25), -0.1);
      k.profile(ctx, 380, 1010, 1.55, { blink: 1, inside: c => {
        // open loops spinning inside the head
        for (let i = 0; i < 4; i++) { const p = pop(u, uf - 0.3 + i * 0.15, 0.3); if (p) k.loop(c, -60 + (i % 2) * 110, -260 + Math.floor(i / 2) * 100, 38 * p, 1, S.t + i, { lw: 7, pulse: true }); }
      } });
      // a replay arrow around the head
      const r = tween(u, rp - 0.3, rp + 0.5);
      if (r > 0) { ctx.save(); ctx.translate(400, 500); ctx.rotate(S.t * 1.5); ctx.beginPath(); ctx.arc(0, 0, 330, 0, TAU * 0.8 * r); k.stroke(ctx, P.red, 8); ctx.restore(); }
      k.scrawl(ctx, 'on replay', 760, 200, 60, tween(u, rp, rp + 0.5));
      k.scrawl(ctx, '(remember the open loops?)', 640, 990, 40, tween(u, uf + 0.5, uf + 1.1), { color: P.inkSoft });
    },
  },
  { // 23.76 "Writing them down tells it it's handled."
    start: 23.6, title: 'Handled', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, wr = S.at('Writing'), hd = S.at('handled');
      plate(ctx, S, { alpha: 0.1, seed: 23 });
      const out = tween(u, wr - 0.1, hd - 0.2, ease.inOut), calm = tween(u, hd, hd + 0.4);
      k.profile(ctx, 300, 1010, 1.3, { blink: 1 - calm * 0.9, inside: c => { for (let i = 0; i < 4; i++) if (out < 0.2 + i * 0.2) k.loop(c, -60 + (i % 2) * 110, -260 + Math.floor(i / 2) * 100, 34, 1, S.t + i, { lw: 7 }); } });
      // the loops fly out onto the notepad
      for (let i = 0; i < 4; i++) { const f = clamp((out - i * 0.2) / 0.4); if (f <= 0 || f >= 1) continue; k.loop(ctx, lerp(300, 720, f), lerp(640, 420, f) - Math.sin(f * Math.PI) * 120, 30, 1, S.t, { lw: 6 }); }
      ctx.save(); ctx.translate(720, 420); ctx.rotate(0.06); k.notepad(ctx, 0, 0, 1.6); ctx.restore();
      k.stamp(ctx, 'HANDLED', 720, 430, 54, tween(u, hd, hd + 0.2), -0.12);
      if (calm > 0.5) for (let i = 0; i < 3; i++) k.text(ctx, 'z', 380 + i * 40, 420 - i * 40, 40 + i * 14, { font: 'hand', color: P.red });
    },
  },
  { // 26.7 "Five minutes. Pen and paper. Be specific."
    start: 26.55, title: 'How To Do It', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, fm = S.at('Five'), pp = S.at('Pen'), sp = S.at('specific');
      plate(ctx, S, { alpha: 0.08, seed: 26 });
      const tips = [[fm, '5 MINUTES'], [pp, 'PEN + PAPER'], [sp - 0.2, 'BE SPECIFIC']];
      tips.forEach(([at, label], i) => {
        const p = pop(u, at - 0.1, 0.3); if (!p) return;
        ctx.save(); ctx.translate(W / 2, 180 + i * 280); ctx.scale(p, p);
        k.rect(ctx, -400, -110, 800, 220, P.paperLight, i === 2 ? P.red : P.ink, 5, 14);
        if (i === 0) k.clock(ctx, -290, 0, 70, 0, { hour: 11, minute: 5 });
        if (i === 1) { k.quill(ctx, -300, 60, 0.55, -0.6); k.rect(ctx, -250, -60, 90, 120, '#f3e6c4', P.ink, 3, 3); }
        if (i === 2) { k.scrawl(ctx, '"work"', -250, 50, 46, 1, { color: P.grey }); k.penLine(ctx, [[-320, 50], [-180, 50]], 1, P.red, 5); k.arrow(ctx, -150, 50, -70, 50, 1, P.red, 4, 0); k.scrawl(ctx, '"email Sam the report"', 140, 50, 44, 1, { color: P.red }); }
        k.text(ctx, label, i === 2 ? 0 : 80, i === 2 ? -50 : 4, 66, { font: 'display', color: i === 2 ? P.red : P.ink });
        ctx.restore();
      });
    },
  },
  { // 31.04 "Follow for more mind tricks." → the case-file cover
    start: 30.85, title: 'More Mind Tricks', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      ctx.save(); night(ctx, S); k.bed(ctx, 430, 1000, 1.35, S.t, { blink: 0, blanket: P.sky }); ctx.restore();
      inkReveal(ctx, S, tween(u, 0.1, 0.8, ease.linear), c => caseCover(c, S, u - 0.1, { handle: meta.brand.handle, caseNo: '2018', tagline: meta.brand.tagline }));
    },
  },
];

export const sfx = [
  { t: 0.2, type: 'heartbeat', gain: 0.45 },
  { t: 0.4, type: 'pop', gain: 0.35 }, { t: 0.65, type: 'pop', gain: 0.35, pitch: 1.15 }, { t: 0.9, type: 'pop', gain: 0.35, pitch: 1.3 }, { t: 1.15, type: 'pop', gain: 0.35, pitch: 1.45 },
  { t: 1.6, type: 'tick', gain: 0.4 },
  { t: 2.85, type: 'paper', gain: 0.5 },
  { t: 3.0, type: 'chime', gain: 0.4, pitch: 1.2 },
  { t: 4.1, type: 'splat', gain: 0.6 },
  { t: 4.45, type: 'stamp', gain: 0.7 },
  { t: 5.7, type: 'pen', gain: 0.45 },
  { t: 7.0, type: 'buzz', gain: 0.25 },
  { t: 8.2, type: 'pen', gain: 0.4 },
  { t: 9.2, type: 'fold', gain: 0.45 },
  { t: 10.6, type: 'pen', gain: 0.5 },
  { t: 13.2, type: 'pen', gain: 0.5 },
  { t: 14.6, type: 'whoosh', gain: 0.35 },
  { t: 15.5, type: 'riser', gain: 0.35 },
  { t: 16.8, type: 'chime', gain: 0.45, pitch: 1.2 },
  { t: 17.3, type: 'moth', gain: 0.25 },
  { t: 18.7, type: 'splat', gain: 0.6 },
  { t: 18.8, type: 'stamp', gain: 0.4 },
  { t: 21.0, type: 'tick', gain: 0.45 },
  { t: 21.8, type: 'heartbeat', gain: 0.4 },
  { t: 23.6, type: 'fold', gain: 0.45 },
  { t: 24.2, type: 'whoosh', gain: 0.4 }, { t: 24.6, type: 'whoosh', gain: 0.35 },
  { t: 25.55, type: 'stamp', gain: 0.8 },
  { t: 25.9, type: 'chime', gain: 0.4 },
  { t: 26.55, type: 'whoosh', gain: 0.3 },
  { t: 26.7, type: 'pop', gain: 0.5 },
  { t: 27.8, type: 'pop', gain: 0.5, pitch: 1.2 },
  { t: 29.2, type: 'pop', gain: 0.5, pitch: 1.4 },
  { t: 29.6, type: 'pen', gain: 0.5 },
  { t: 30.95, type: 'splat', gain: 0.8 },
  { t: 31.3, type: 'fold', gain: 0.4 },
  { t: 32.1, type: 'stamp', gain: 0.8 },
  { t: 33.0, type: 'moth', gain: 0.35 },
  { t: 34.4, type: 'bell', gain: 0.3 },
];

export const music = {
  kit: 'mind', bpm: 84, root: 'F', scale: 'lydian', gain: 0.28,
  sections: [
    { from: 0, to: 4.1, mood: 'tense' },
    { from: 4.1, to: 18.7, mood: 'groove' },
    { from: 18.7, to: 23.6, mood: 'tense' },
    { from: 23.6, to: 30.85, mood: 'triumph' },
    { from: 30.85, to: 35.2, mood: 'end' },
  ],
};
