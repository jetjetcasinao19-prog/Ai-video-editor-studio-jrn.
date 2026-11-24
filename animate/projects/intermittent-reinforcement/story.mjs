// "Intermittent Reinforcement" — an INKBLOT case file (psychology, MindTrace).
// B.F. Skinner's pigeons (schedules of reinforcement; Ferster & Skinner, 1957):
// rewards every time → quick extinction; unpredictable rewards → persistence.
// u = seconds since the scene started; S.at('word') = when that word is said.
import { clamp, lerp, ease, tween, rng, TAU, shake, pop } from '../../lib/core.mjs';
import { plate, caseCover, inkReveal } from '../../styles/inkblot/scenes.mjs';

export const meta = {
  title: 'Intermittent Reinforcement',
  slug: 'intermittent-reinforcement-inkblot',
  style: 'inkblot',
  width: 1080, height: 1920, fps: 30,
  duration: 37.6,
  voice: 'voice.mp3',
  seed: 184,
  captionChars: 24,
  caseLine: 'THE MIND FILES  ·  CASE No. 1957  ·  CONFIDENTIAL',
  brandKit: 'mindtrace', // MindTrace (brand/mindtrace/): logo, handle, tagline, outro text
  outro: { at: 35.0 },
};

const SKINNER = { glasses: true, hair: 'slick', tie: '#c61f2a', labcoat: true };

// a pigeon (facing right); peck 0..1 dips the head
function pigeon(ctx, k, P, x, y, s = 1, peck = 0, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (o.flip ? -1 : 1), s);
  k.line(ctx, -10, 0, -16, 40, P.red, 5); k.line(ctx, 12, 0, 18, 40, P.red, 5);
  k.ellipse(ctx, 0, -40, 70, 48, -0.1, '#8d95a3', P.ink, 4);
  ctx.beginPath(); ctx.moveTo(-60, -50); ctx.lineTo(-110, -30); ctx.lineTo(-60, -20); ctx.closePath(); k.fill(ctx, '#6d7582'); k.stroke(ctx, P.ink, 3);
  k.ellipse(ctx, -10, -42, 40, 22, -0.2, '#a9b0bb', P.ink, 2);
  ctx.save(); ctx.translate(50, -70); ctx.rotate(peck * 0.9);
  k.ellipse(ctx, 0, -10, 20, 30, 0.3, '#6e8f86', P.ink, 3);
  k.circle(ctx, 22, -34, 26, '#6d7582', P.ink, 3); k.circle(ctx, 30, -38, 5, P.ink);
  k.poly(ctx, [[44, -34], [64, -28], [44, -24]], P.ochre, P.ink, 2);
  ctx.restore();
  ctx.restore();
}
// the Skinner box: a key to peck and a food tray
function skinnerBox(ctx, k, P, x, y, w, h, o = {}) {
  ctx.save(); ctx.translate(x, y);
  k.rect(ctx, -w / 2, -h, w, h, '#dcd5c3', P.ink, 6, 8);
  k.circle(ctx, w / 2 - 70, -h + 120, 28, o.lit ? P.red : P.redDark, P.ink, 4);
  k.rect(ctx, w / 2 - 110, -110, 80, 50, P.ink, null, 0, 6);
  if (o.label) k.text(ctx, o.label, 0, -h - 34, 40, { font: 'display', color: o.labelColor || P.ink });
  ctx.restore();
}
function grains(ctx, k, P, x, y, n, t) { for (let i = 0; i < n; i++) k.ellipse(ctx, x + (i % 4) * 14 - 20, y - Math.floor(i / 4) * 8, 6, 4, 0, P.ochre); }

export const scenes = [
  { // 0.02 "Why can't you quit someone who treats you badly? Blame a pigeon."
    start: 0, title: "Why Can't You Quit?",
    draw(ctx, u, S) {
      const { k, P, W } = S, bd = S.at('badly'), pg = S.at('pigeon');
      plate(ctx, S, { alpha: 0.12, seed: 3 });
      S.cam(lerp(1.06, 1.0, tween(u, 0, 4.4)), W / 2, 560);
      // you, tied by a red thread to someone who turns away
      k.figure(ctx, 230, 1010, { s: 1.1, face: 1, look: [1, 0], mood: 'worry', armR: [1.3, 0.4] });
      k.figure(ctx, 720, 1010, { hat: 'bowler', s: 1.1, face: 1, look: [1, 0.2], mood: 'calm' });
      k.penLine(ctx, [[300, 690], [450, 650], [580, 700], [680, 690]], 1, P.red, 5);
      k.scrawl(ctx, 'treats you badly', 475, 800, 44, tween(u, bd - 0.3, bd + 0.3));
      const p = pop(u, pg - 0.2, 0.35);
      if (p) { ctx.save(); ctx.translate(470, 470); ctx.scale(p, p); pigeon(ctx, k, P, 0, 0, 1.3, Math.abs(Math.sin(u * 6)) * 0.3); ctx.restore(); }
      k.scrawl(ctx, 'blame a pigeon', 470, 230, 60, tween(u, pg, pg + 0.5), { rot: -0.05 });
    },
  },
  { // 4.94 "In the 1950s, B.F. Skinner trained pigeons to peck for food."
    start: 4.6, title: "Skinner's Pigeons", trans: 'bleed',
    draw(ctx, u, S) {
      const { k, P, W } = S, yr = S.at('1950s'), bf = S.at('B.F.'), pk = S.at('peck');
      plate(ctx, S, { alpha: 0.08, seed: 5 });
      skinnerBox(ctx, k, P, 590, 880, 560, 520, { lit: u > pk && (u * 3 % 1) < 0.5 });
      const peck = u > pk ? Math.max(0, Math.sin(u * 9)) : 0;
      pigeon(ctx, k, P, 560, 860, 1.4, peck);
      grains(ctx, k, P, 760, 790, Math.floor(clamp((u - pk) * 3) * 6), S.t);
      k.figure(ctx, 130, 1010, { ...SKINNER, s: 0.9, face: 1, look: [0.8, 0], mood: 'calm', armL: [1.2, 0.8], holdL: c => k.rect(c, -30, -60, 60, 80, P.paperLight, P.ink, 3) });
      k.stamp(ctx, '1950s', 790, 150, 60, tween(u, yr, yr + 0.25), 0.1);
      k.scrawl(ctx, 'B.F. Skinner', 190, 360, 50, tween(u, bf, bf + 0.5), { rot: -0.05 });
      k.scrawl(ctx, 'peck = food', 600, 280, 52, tween(u, pk, pk + 0.5));
    },
  },
  { // 9.32 "Food every time? They quit fast when it stopped."
    start: 9.15, title: 'Food Every Time', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, ev = S.at('every'), st = S.at('stopped');
      plate(ctx, S, { alpha: 0.08, seed: 9 });
      skinnerBox(ctx, k, P, W / 2, 900, 700, 560, { label: 'EVERY PECK = FOOD' });
      const stop = tween(u, st - 0.3, st);
      const leave = tween(u, st, st + 0.8);
      const peck = stop < 1 ? Math.max(0, Math.sin(u * 9)) : 0;
      pigeon(ctx, k, P, lerp(W / 2, W / 2 - 230, leave), 880, 1.4, peck, { flip: leave > 0.05 });
      grains(ctx, k, P, W / 2 + 230, 810, stop < 1 ? 6 : 0, S.t);
      k.stamp(ctx, 'FOOD STOPPED', W / 2, 980, 56, tween(u, st - 0.1, st + 0.1), -0.06);
      if (leave > 0.6) k.scrawl(ctx, 'quits fast', 300, 380, 60, tween(u, st + 0.5, st + 0.9));
    },
  },
  { // 12.6 "Food at random? They kept pecking. And pecking."
    start: 12.5, title: 'Food at Random', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, rd = S.at('random'), kp = S.at('kept'), ap = S.at('And');
      plate(ctx, S, { alpha: 0.08, seed: 12 });
      skinnerBox(ctx, k, P, W / 2, 900, 700, 560, { label: 'FOOD AT RANDOM', labelColor: P.red, lit: (u * 5 % 1) < 0.5 });
      const speed = lerp(9, 18, tween(u, kp, ap + 0.5));
      pigeon(ctx, k, P, W / 2, 880, 1.4, Math.max(0, Math.sin(u * speed)));
      // a die rolls above: food comes… sometimes
      const d = Math.floor(u * 4) % 6 + 1;
      ctx.save(); ctx.translate(W / 2 + 250, 450); ctx.rotate(Math.sin(u * 3) * 0.2); k.rect(ctx, -46, -46, 92, 92, P.paperLight, P.ink, 4, 12); k.text(ctx, String(d), 0, 3, 54, { font: 'display', color: P.red }); ctx.restore();
      const n = Math.floor(lerp(0, 999, tween(u, kp, kp + 3, ease.inQuad)));
      k.text(ctx, 'PECKS: ' + n, W / 2, 1000, 54, { font: 'display', color: P.red });
      k.scrawl(ctx, 'and pecking…', 300, 360, 56, tween(u, ap, ap + 0.5));
    },
  },
  { // 17.16 "Here's the trick. Random rewards are the most addictive."
    start: 16.85, title: 'Random = Hardest to Quit', trans: 'bleed',
    draw(ctx, u, S) {
      const { k, P, W } = S, rr = S.at('Random'), ad = S.at('addictive');
      plate(ctx, S, { alpha: 0.06, seed: 17 });
      k.stamp(ctx, 'THE TRICK', 220, 110, 42, tween(u, 0.05, 0.25), -0.1);
      // pecking after the food stops: every-time drops fast, random keeps going
      const x0 = 110, y0 = 820, w = 740, h = 480;
      k.line(ctx, x0, y0, x0 + w, y0, P.ink, 4); k.line(ctx, x0, y0, x0, y0 - h, P.ink, 4);
      k.text(ctx, 'KEEPS PECKING', x0 - 10, y0 - h - 30, 32, { align: 'left', color: P.inkSoft });
      k.text(ctx, 'TIME AFTER FOOD STOPS →', x0 + w - 220, y0 + 40, 28, { color: P.inkSoft });
      const pts = (fast) => Array.from({ length: 31 }, (_, i) => { const t = i / 30; const v = fast ? Math.exp(-t * 6) : 1 - 0.25 * t + 0.06 * Math.sin(t * 30); return [x0 + t * w, y0 - h * 0.9 * v]; });
      const kk = tween(u, rr - 0.3, ad + 0.3);
      const draw = (p, col, lw) => { const n = Math.max(2, Math.floor(p.length * kk)); ctx.beginPath(); k.smooth(ctx, p.slice(0, n), false); k.stroke(ctx, col, lw); };
      draw(pts(true), P.inkSoft, 8); draw(pts(false), P.red, 8);
      if (kk > 0.9) { k.text(ctx, 'every time', x0 + 200, y0 - 60, 36, { font: 'display', color: P.inkSoft }); k.text(ctx, 'random', x0 + w - 120, y0 - h * 0.75 - 40, 40, { font: 'display', color: P.red }); }
      k.scrawl(ctx, 'hardest to quit', W / 2, 960, 60, tween(u, ad, ad + 0.5));
    },
  },
  { // 21.14 "It's how slot machines work."
    start: 21.0, title: 'Slot Machines', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, sm = S.at('slot');
      plate(ctx, S, { alpha: 0.08, seed: 21 });
      ctx.save(); ctx.translate(W / 2, 560);
      k.rect(ctx, -260, -330, 520, 640, P.red, P.ink, 6, 30);
      k.rect(ctx, -210, -180, 420, 220, P.paperLight, P.ink, 5, 10);
      const sym = ['7', '♥', '★', '7', '♦'];
      for (let i = 0; i < 3; i++) { const spin = Math.floor(u * (14 - i * 3) + i * 2) % sym.length; k.text(ctx, sym[spin], -140 + i * 140, -70, 110, { font: 'display', color: sym[spin] === '7' ? P.red : P.ink }); if (i < 2) k.line(ctx, -70 + i * 140, -170, -70 + i * 140, 30, P.ink, 3); }
      k.text(ctx, 'JACKPOT?', 0, -250, 54, { font: 'display', color: P.paperLight });
      k.rect(ctx, -160, 120, 320, 70, P.ink, null, 0, 10);
      ctx.restore();
      // the lever
      const pull = Math.max(0, Math.sin(u * 4));
      k.line(ctx, W / 2 + 260, 500, W / 2 + 330, lerp(320, 480, pull), P.greyLight, 14); k.circle(ctx, W / 2 + 330, lerp(320, 480, pull), 30, P.red, P.ink, 4);
      k.scrawl(ctx, 'random rewards', W / 2, 1000, 60, tween(u, sm, sm + 0.5));
    },
  },
  { // 23.0 "And it's how manipulators hook people. Kind, cold, kind again."
    start: 22.9, title: 'Kind, Cold, Kind Again', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, mp = S.at('manipulators'), kd = S.at('Kind'), cd = S.at('cold'), ka = S.at('again');
      plate(ctx, S, { alpha: 0.1, seed: 23 });
      // the cycle as three cards
      const cards = [[kd, 'KIND', 'heart'], [cd, 'COLD', 'snow'], [ka, 'KIND AGAIN', 'heart']];
      cards.forEach(([at, label, icon], i) => {
        const p = pop(u, at - 0.1, 0.3); if (!p) return;
        ctx.save(); ctx.translate(180 + i * 290, 330); ctx.scale(p, p);
        k.rect(ctx, -130, -150, 260, 300, P.paperLight, icon === 'heart' ? P.red : '#4b6f8f', 6, 12);
        if (icon === 'heart') k.heart(ctx, 0, -30, 60, P.red);
        else { for (let a = 0; a < 6; a++) { const an = a / 6 * Math.PI; k.line(ctx, Math.cos(an) * -60, -30 + Math.sin(an) * -60, Math.cos(an) * 60, -30 + Math.sin(an) * 60, '#4b6f8f', 8); } }
        k.text(ctx, label, 0, 100, 36, { font: 'display', color: icon === 'heart' ? P.red : '#4b6f8f', max: 230 });
        ctx.restore();
      });
      // a big red fishhook drops onto someone reaching for the next "kind"
      const h = tween(u, mp - 0.3, mp + 0.3, ease.outBack), hy = lerp(-40, 560, h);
      k.line(ctx, W / 2, -20, W / 2, hy - 60, P.inkSoft, 5);
      ctx.beginPath(); ctx.moveTo(W / 2, hy - 60); ctx.lineTo(W / 2, hy + 40); ctx.arc(W / 2 - 36, hy + 40, 36, 0, Math.PI * 0.95);
      k.stroke(ctx, P.red, 12);
      k.poly(ctx, [[W / 2 - 72, hy + 44], [W / 2 - 84, hy + 10], [W / 2 - 60, hy + 26]], P.red);
      k.figure(ctx, W / 2, 1060, { s: 0.95, face: 1, look: [0, -1], mood: 'worry', armL: [2.6, 0.3], armR: [2.6, 0.3], shadow: false });
      k.scrawl(ctx, 'the cycle', 820, 620, 52, tween(u, ka + 0.2, ka + 0.6));
    },
  },
  { // 28.5 "Still waiting for the good days to come back? That's the hook."
    start: 28.35, title: "That's the Hook", trans: 'blink',
    draw(ctx, u, S) {
      const { k, P, W } = S, wt = S.at('waiting'), gd = S.at('good'), hk = S.at('hook');
      plate(ctx, S, { alpha: 0.1, seed: 28 });
      // waiting by the phone for the good days
      k.figure(ctx, 330, 1010, { s: 1.1, face: 1, look: [0.6, 0.6], mood: 'worry', armR: [1.1, 0.9], holdR: c => k.phone(c, 0, -20, 0.25, S.t, { typing: true }) });
      const b = pop(u, gd - 0.2, 0.35);
      if (b) { ctx.save(); ctx.translate(690, 360); ctx.scale(b, b); k.rect(ctx, -200, -80, 400, 160, P.paperLight, P.ink, 4, 30); k.heart(ctx, -110, 0, 40, P.red); k.text(ctx, 'the good days…', 40, 4, 40, { font: 'hand', color: P.red }); ctx.restore(); }
      k.stamp(ctx, "THAT'S THE HOOK", W / 2, 140, 54, tween(u, hk, hk + 0.2), -0.06);
      // a gentle safety note
      const n = tween(u, hk + 0.3, hk + 0.8);
      if (n > 0) { ctx.save(); ctx.globalAlpha = n; k.rect(ctx, 520, 800, 380, 120, P.paperLight, P.red, 4, 12); k.text(ctx, 'Treated badly?', 710, 836, 34, { font: 'display', color: P.red }); k.text(ctx, 'Talk to someone you trust.', 710, 884, 28, {}); ctx.restore(); }
    },
  },
  { // 32.64 "Follow for more dark psychology." → the case-file cover
    start: 32.4, title: 'More Dark Psychology', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      ctx.save(); plate(ctx, S, { alpha: 0.1, seed: 28 }); ctx.restore();
      inkReveal(ctx, S, tween(u, 0.1, 0.8, ease.linear), c => caseCover(c, S, u - 0.1, { handle: meta.brand.handle, caseNo: '1957', tagline: meta.brand.tagline }));
    },
  },
];

export const sfx = [
  { t: 0.3, type: 'heartbeat', gain: 0.45 },
  { t: 2.2, type: 'pen', gain: 0.4 },
  { t: 3.6, type: 'pop', gain: 0.55 },
  { t: 3.9, type: 'moth', gain: 0.4 },
  { t: 4.6, type: 'splat', gain: 0.6 },
  { t: 4.95, type: 'stamp', gain: 0.7 },
  { t: 6.1, type: 'pen', gain: 0.45 },
  { t: 7.8, type: 'click', gain: 0.5 }, { t: 8.15, type: 'click', gain: 0.5 }, { t: 8.5, type: 'click', gain: 0.5 },
  { t: 8.3, type: 'coins', gain: 0.25 },
  { t: 9.15, type: 'fold', gain: 0.45 },
  { t: 9.6, type: 'click', gain: 0.45 }, { t: 10.0, type: 'click', gain: 0.45 }, { t: 10.4, type: 'click', gain: 0.45 },
  { t: 11.5, type: 'stamp', gain: 0.75 },
  { t: 12.0, type: 'flop', gain: 0.4 },
  { t: 12.5, type: 'whoosh', gain: 0.35 },
  { t: 13.0, type: 'click', gain: 0.4 }, { t: 13.3, type: 'click', gain: 0.4 }, { t: 13.6, type: 'click', gain: 0.4 }, { t: 13.85, type: 'click', gain: 0.4 }, { t: 14.1, type: 'click', gain: 0.4 }, { t: 14.3, type: 'click', gain: 0.4 }, { t: 14.5, type: 'click', gain: 0.4 }, { t: 14.7, type: 'click', gain: 0.4 }, { t: 14.9, type: 'click', gain: 0.4 }, { t: 15.1, type: 'click', gain: 0.4 }, { t: 15.3, type: 'click', gain: 0.4 }, { t: 15.5, type: 'click', gain: 0.4 },
  { t: 16.85, type: 'splat', gain: 0.6 },
  { t: 16.95, type: 'stamp', gain: 0.4 },
  { t: 18.3, type: 'riser', gain: 0.3 },
  { t: 20.0, type: 'pen', gain: 0.45 },
  { t: 21.0, type: 'whoosh', gain: 0.35 },
  { t: 21.2, type: 'slide', gain: 0.45 },
  { t: 21.6, type: 'coins', gain: 0.45 },
  { t: 22.9, type: 'fold', gain: 0.45 },
  { t: 23.6, type: 'whoosh', gain: 0.4 },
  { t: 25.5, type: 'pop', gain: 0.5, pitch: 1.2 },
  { t: 26.3, type: 'wind', gain: 0.35 },
  { t: 27.1, type: 'pop', gain: 0.5, pitch: 1.2 },
  { t: 28.35, type: 'blink', gain: 0.45 },
  { t: 29.0, type: 'buzz', gain: 0.3 },
  { t: 29.3, type: 'pop', gain: 0.45 },
  { t: 31.5, type: 'stamp', gain: 0.8 },
  { t: 32.45, type: 'splat', gain: 0.8 },
  { t: 32.85, type: 'fold', gain: 0.4 },
  { t: 33.6, type: 'stamp', gain: 0.8 },
  { t: 34.6, type: 'moth', gain: 0.35 },
  { t: 36.9, type: 'bell', gain: 0.3 },
];

export const music = {
  kit: 'mind', bpm: 90, root: 'A', scale: 'harmonic', gain: 0.3,
  sections: [
    { from: 0, to: 4.6, mood: 'tense' },
    { from: 4.6, to: 16.85, mood: 'groove' },
    { from: 16.85, to: 22.9, mood: 'drive' },
    { from: 22.9, to: 32.4, mood: 'tense' },
    { from: 32.4, to: 37.6, mood: 'end' },
  ],
};
