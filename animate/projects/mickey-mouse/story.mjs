// "How Mickey Mouse Started" — an Ottoman miniature chronicle.
// The mouse and the rabbit are generic animals painted in the miniature manner,
// not the studio's character designs. u = seconds since the scene started.
import { lerp, ease, tween, TAU, pop } from '../../lib/core.mjs';
import { land, interior, lamp, bookCover, medallion, bigSign, heart } from '../../styles/ottoman/scenes.mjs';

export const meta = {
  title: 'How Mickey Mouse Started',
  slug: 'mickey-mouse-ottoman',
  style: 'ottoman',
  look: 'album', // gold-sprinkled album page, drifting gold dust (see styles/ottoman/looks.mjs)
  room: 'arches',
  width: 1080, height: 1920, fps: 30,
  duration: 54.5,
  voice: 'voice.mp3',
  seed: 112,
  captionChars: 30,
  brand: { handle: '@HOWITSTARTED-YT1', logo: '../../../brand/logo.png' },
  outro: { at: 52.6, text: 'Subscribe for more origin stories' },
};

const WALT = { robe: '#3a3f55', robeP: 'stripes', robePc: '#4c5270', inner: '#f7eed6', sash: '#c4371f', hat: 'shorthair', hair: '#4a3020', mustache: true, mustacheColor: '#4a3020' };
const UB = { robe: '#6a5a44', robeP: 'dots', robePc: '#8a7a5e', inner: '#f7eed6', sash: '#20408f', hat: 'shorthair', hair: '#a8865a' };
const ANIM = [
  { robe: '#2a9c93', robeP: 'dots', robePc: '#6cc3b8', hat: 'shorthair', hair: '#3a2a1a' },
  { robe: '#d6973a', robeP: 'stripes', robePc: '#e9be6e', hat: 'shorthair', hair: '#6a4a2a' },
  { robe: '#a99ac6', robeP: 'dots', robePc: '#c9bede', hat: 'shorthair', hair: '#2a1c12' },
];

// a gold star with a figure on it (a studio's "star")
function starBadge(ctx, k, P, x, y, r, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, d = i % 2 ? r * 0.45 : r; ctx.lineTo(Math.cos(a) * d, Math.sin(a) * d); } ctx.closePath(); k.fillStroke(ctx, P.goldLight, P.goldDark, 4);
  ctx.restore();
}
// make whatever is on the screen look like a 1928 black-and-white film
function oldFilm(ctx, w, h) {
  ctx.save(); ctx.globalCompositeOperation = 'saturation'; ctx.fillStyle = '#808080'; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.restore();
  ctx.save(); ctx.fillStyle = 'rgba(240,225,190,0.18)'; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.restore();
}
function audience(ctx, S, y, u, cheer = 0) {
  const { k, P, W } = S;
  for (let row = 0; row < 2; row++) for (let i = 0; i < 9; i++) {
    const x = 40 + i * 110 + row * 55, yy = y + row * 70, up = cheer * (0.5 + 0.5 * Math.sin(u * 8 + i));
    const c = ['#3a2a3a', '#2a3a4a', '#4a3a2a', '#2a2f45'][(i + row) % 4];
    if (cheer > 0) for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(x + sx * 26, yy - 30); ctx.lineTo(x + sx * 40, yy - 70 - up * 30); k.stroke(ctx, c, 12); }
    k.ellipse(ctx, x, yy, 46, 40, 0, c, P.ink, 2);
    k.circle(ctx, x, yy - 56, 24, ['#4a3020', '#2a1c12', '#6a4a2a'][i % 3], P.ink, 2);
  }
}

export const scenes = [
  { // 0.0 "Mickey Mouse was born because Walt Disney lost his biggest star."
    start: 0, title: 'Born From a Loss',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const bo = S.at('born'), lo = S.at('lost'), st = S.at('star.');
      land(ctx, S, { horizon: 700, clouds: 3 });
      // the rabbit on its star slides away; the mouse is born
      const gone = tween(u, lo, st + 0.6, ease.inCubic);
      starBadge(ctx, k, P, lerp(700, 1150, gone), lerp(380, 200, gone), 150, gone * 1.5);
      k.rabbit(ctx, lerp(680, 1130, gone), lerp(450, 270, gone), 0.9, { t: S.t, face: -1 });
      const b = pop(u, bo - 0.2, 0.4);
      if (b > 0) { ctx.save(); ctx.translate(300, 830); ctx.scale(b, b); k.circle(ctx, 0, -60, 150, P.paperLight, P.goldLight, 6); k.mouse(ctx, 0, 30, 1.3, { t: S.t }); ctx.restore(); }
      k.figure(ctx, 560, 1000, { ...WALT, s: 0.9, face: 1, mood: u > lo ? 'sad' : 'calm', armF: [u > lo ? 2.3 : 0.8, -0.1] });
    },
  },
  { // 5.8 "1928."
    start: 5.6, title: 'The Year 1928', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      land(ctx, S, { horizon: 760, clouds: 2 });
      for (const [x, h] of [[120, 520], [880, 560]]) k.palm(ctx, x, 800, h, S.t, x);
      // a small studio building with a painted sign
      k.rect(ctx, 260, 560, 420, 240, P.white, P.ink, 2.5); k.rect(ctx, 240, 540, 460, 26, P.verm, P.ink, 2);
      for (let i = 0; i < 4; i++) k.arch(ctx, 320 + i * 100, 790, 60, 120, P.lapis);
      bigSign(ctx, k, P, 'STUDIO', 470, 500, 300, 1, 44);
      k.seal(ctx, W / 2, 260, 110, ' THE YEAR · THE YEAR ·', '1928', tween(u, 0.15, 0.55, ease.linear));
    },
  },
  { // 7.5 "Walt Disney has a hit cartoon, Oswald the Lucky Rabbit."
    start: 7.3, title: 'A Hit Cartoon', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const hc = S.at('hit'), os = S.at('Oswald'), lr = S.at('Rabbit.');
      interior(ctx, S, { window: false, carpetColor: P.verm });
      k.cinema(ctx, 560, 420, 600, 400, tween(u, hc - 0.4, hc + 0.3), (c, w, h) => {
        c.fillStyle = '#e8e2d0'; c.fillRect(-w / 2, -h / 2, w, h);
        c.fillStyle = '#9a9a8a'; c.fillRect(-w / 2, 110, w, 100);
        const hop = Math.abs(Math.sin(u * 5)) * 60;
        k.rabbit(c, -180 + ((u * 120) % 420), 120 - hop, 0.9, { t: u });
        oldFilm(c, w, h);
      });
      k.figure(ctx, 170, 1010, { ...WALT, s: 1.1, face: 1, mood: 'happy', armF: [2.2, -0.2] });
      for (let i = 0; i < 4; i++) { const p = pop(u, lr + i * 0.15, 0.3); if (p > 0) starBadge(ctx, k, P, 330 + i * 160, 120, 26 * p, u); }
    },
  },
  { // 12.0 "In New York, he learns Universal owns Oswald,"
    start: 11.8, title: 'Bad News in New York', trans: 'wipe',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const ny = S.at('New'), un = S.at('Universal'), ow = S.at('owns');
      k.goldSky(ctx, -60, -60, W + 120, 900, S.t);
      for (let i = 0; i < 9; i++) { const x = 40 + i * 110, h = 260 + ((i * 97) % 220); k.rect(ctx, x - 40, 640 - h, 80, h, [P.ochreLight, P.pink, P.white, '#b5553a'][i % 4], P.ink, 1.5); for (let r = 1; r < h / 44; r++) for (let c = 0; c < 2; c++) k.rect(ctx, x - 26 + c * 30, 640 - h + r * 44, 16, 20, P.lapis, null); }
      ctx.fillStyle = P.paperDark; ctx.fillRect(-60, 640, W + 120, 600);
      k.label(ctx, 'NEW YORK', W / 2, 120, 30, tween(u, ny, ny + 0.3));
      const cp = pop(u, un - 0.3, 0.4);
      if (cp > 0) { ctx.save(); ctx.translate(620, 760); ctx.scale(cp, cp); k.certificate(ctx, 0, 0, 420, -0.05, 'CONTRACT', 'UNIVERSAL OWNS OSWALD'); ctx.restore(); }
      k.stamp(ctx, 'OWNED', 640, 820, 60, tween(u, ow, ow + 0.25, ease.linear), -0.2);
      k.figure(ctx, 190, 1010, { ...WALT, s: 1.1, face: 1, mood: u > ow ? 'sad' : 'calm', armF: [1.2, 0.2] });
    },
  },
  { // 15.5 "and most of his animators are leaving him."
    start: 15.3, title: 'Animators Leaving', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const lv = S.at('leaving');
      interior(ctx, S, { window: true, carpetColor: P.lapis });
      // empty desks
      for (let i = 0; i < 3; i++) { k.rect(ctx, 520 + i * 140, 840, 110, 18, P.brownLight, P.ink, 2); k.rect(ctx, 530 + i * 140, 858, 10, 130, P.brown, P.ink, 1.5); k.rect(ctx, 610 + i * 140, 858, 10, 130, P.brown, P.ink, 1.5); }
      ANIM.forEach((a, i) => { const go = tween(u, lv - 0.8 + i * 0.25, lv + 1.6 + i * 0.25, ease.inOut); k.figure(ctx, lerp(560 + i * 140, 1200 + i * 120, go), 1010, { ...a, s: 0.95, face: go > 0 ? 1 : -1, walk: go > 0 && go < 1 ? u * 9 + i : null, mood: 'calm', armF: [1.6, 0.2], hold: c => { c.rotate(-1.4); k.rect(c, -40, -30, 80, 60, P.paperLight, P.ink, 2); } }); });
      k.figure(ctx, 180, 1010, { ...WALT, s: 1.1, face: 1, mood: 'sad', armF: [0.4, 0.1] });
    },
  },
  { // 18.3 "On the train home, he needs a new star."
    start: 18.2, title: 'The Train Home', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const ne = S.at('needs'), st = S.at('star.');
      land(ctx, S, { night: true, horizon: 640, clouds: 2, hillColors: ['#3a3f5a', '#4a4f6a', '#2f3550', '#3a3f5a'], ground: '#4a5a3a' });
      k.moon(ctx, 820, 160, 60);
      ctx.beginPath(); ctx.moveTo(-60, 940); ctx.lineTo(W + 60, 940); k.stroke(ctx, P.steel, 8);
      for (let i = 0; i < 14; i++) k.rect(ctx, -40 + i * 80 - ((S.t * 200) % 80), 944, 40, 12, P.brown, null);
      k.train(ctx, lerp(560, 760, tween(u, 0, 3.3)), 940, 0.95, S.t, { lit: true });
      // the thought in the window
      const q = pop(u, ne - 0.2, 0.35), sp = pop(u, st - 0.2, 0.4);
      if (q > 0 && sp <= 0) medallion(ctx, k, P, '?', 330, 380, q, P.lapis);
      if (sp > 0) { starBadge(ctx, k, P, 330, 380, 120 * sp, 0);  }
      for (let i = 0; i < 3; i++) k.circle(ctx, 300 + i * 30, 560 + i * 50, 8 + i * 3, P.paperLight, P.ink, 1.5);
    },
  },
  { // 21.7 "With his loyal animator Ub Iwerks, he creates a mouse."
    start: 21.5, title: 'A Mouse Is Drawn', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const ub = S.at('Ub'), cr = S.at('creates'), mo = S.at('mouse.');
      interior(ctx, S, { window: true, carpetColor: P.verm });
      lamp(ctx, S, W / 2, 200, 1);
      const draw = tween(u, cr - 0.3, mo, ease.inOut), color = tween(u, mo - 0.1, mo + 0.5);
      k.easel(ctx, W / 2, 960, 380, 330, c => {
        c.save(); c.beginPath(); c.rect(-190, -200, 380 * draw, 400); c.clip(); k.mouse(c, 0, 90, 1.05, { sketch: 1, t: 0 }); c.restore();
        if (color > 0) { c.save(); c.globalAlpha = color; k.mouse(c, 0, 90, 1.05, { t: u }); c.restore(); }
      });
      k.figure(ctx, 190, 1010, { ...UB, s: 1.05, face: 1, mood: 'calm', armF: [lerp(1.2, 2.0, draw), -0.3], hold: c => { c.rotate(-0.4); k.quill(c, 0, 0, 0.6, 0); } });
      k.figure(ctx, 860, 1010, { ...WALT, s: 1.05, face: -1, mood: u > mo ? 'happy' : 'calm', armF: [u > mo ? 2.6 : 1.0, 0.1] });
      k.label(ctx, 'UB IWERKS', 190, 640, 24, tween(u, ub, ub + 0.3));
      k.label(ctx, 'A MOUSE', W / 2, 1040, 26, color);
    },
  },
  { // 26.6 "Then Walt tries something new, a cartoon with sound."
    start: 26.2, title: 'A Cartoon With Sound', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const nw = S.at('new,'), ca = S.at('cartoon'), so = S.at('sound.');
      interior(ctx, S, { window: false, carpetColor: P.lapis });
      k.filmReel(ctx, 300, 330, 120, S.t * 2); k.filmReel(ctx, 620, 330, 120, S.t * 2);
      ctx.beginPath(); ctx.moveTo(300, 450); ctx.lineTo(460, 560); ctx.lineTo(620, 450); k.stroke(ctx, '#2a2f45', 14);
      const fr = pop(u, ca - 0.3, 0.35);
      if (fr > 0) { ctx.save(); ctx.translate(460, 640); ctx.scale(fr, fr); for (let i = 0; i < 3; i++) { k.rect(ctx, -170 + i * 115, -60, 105, 120, '#2a2f45', P.ink, 2); k.rect(ctx, -160 + i * 115, -45, 85, 90, '#e8e2d0', null); k.mouse(ctx, -118 + i * 115, 30, 0.3, { run: i * 1.5 }); } ctx.restore(); }
      k.microphone(ctx, 820, 1000, 1.3, tween(u, so - 0.4, so + 0.2), S.t, '');
      k.drum(ctx, 600, 960, 0.8, S.t);
      if (u > so - 0.3) for (let i = 0; i < 7; i++) { const q = ((u - so + 0.3) * 0.6 + i / 7) % 1; ctx.save(); ctx.globalAlpha = 1 - q; k.musicNote(ctx, 300 + i * 90, 900 - q * 300, 1.1, [P.verm, P.lapis, P.goldDark][i % 3]); ctx.restore(); }
    },
  },
  { // 31.8 "November 1928. Steamboat Willie opens in New York."
    start: 31.6, title: 'Steamboat Willie', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const no = S.at('November'), sb = S.at('Steamboat'), ny = S.at('New');
      ctx.fillStyle = P.vermDark; ctx.fillRect(-60, -60, W + 120, 1200);
      ctx.fillStyle = k.pattern(ctx, 'cintamani', P.vermDark, P.verm, 40); ctx.fillRect(-60, -60, W + 120, 1200);
      k.cinema(ctx, W / 2, 430, 720, 480, tween(u, sb - 0.3, sb + 0.6), (c, w, h) => {
        c.fillStyle = '#e8e2d0'; c.fillRect(-w / 2, -h / 2, w, h);
        k.waves(c, -w / 2, 90, w, 160, S.t, '#7a7a7a', '#c9c9c0', 20, 22);
        k.steamboat(c, 0, 110, 0.75, S.t);
        oldFilm(c, w, h);
      });
      audience(ctx, S, 900, u, 0);
      const cp = pop(u, no - 0.2, 0.35);
      if (cp > 0 && u < sb + 0.2) { ctx.save(); ctx.translate(W / 2, 430); ctx.scale(cp, cp); k.calendarPage(ctx, 0, 0, 200, 'NOV', 18, 0.05); ctx.restore(); }
      k.seal(ctx, 860, 140, 70, ' NOVEMBER · 1928 ·', '1928', tween(u, S.at('1928'), S.at('1928') + 0.3, ease.linear));
      k.label(ctx, 'STEAMBOAT WILLIE', W / 2, 740, 28, tween(u, sb + 0.4, sb + 0.7));
      k.label(ctx, 'NEW YORK', 190, 140, 24, tween(u, ny, ny + 0.3));
    },
  },
  { // 36.9 "Mickey whistles. The crowd loves it."
    start: 36.7, title: 'The Crowd Loves It', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const wh = S.at('whistles.'), cr = S.at('crowd'), lv = S.at('loves');
      ctx.fillStyle = P.vermDark; ctx.fillRect(-60, -60, W + 120, 1200);
      ctx.fillStyle = k.pattern(ctx, 'cintamani', P.vermDark, P.verm, 40); ctx.fillRect(-60, -60, W + 120, 1200);
      k.cinema(ctx, W / 2, 430, 720, 480, 1, (c, w, h) => {
        c.fillStyle = '#e8e2d0'; c.fillRect(-w / 2, -h / 2, w, h);
        k.waves(c, -w / 2, 120, w, 140, S.t, '#7a7a7a', '#c9c9c0', 20, 22);
        // the mouse at the wheel, whistling
        k.rect(c, -40, -40, 220, 160, '#f0f0e8', P.ink, 2.5);
        c.save(); c.translate(120, 20); c.rotate(u * 1.5); k.circle(c, 0, 0, 46, null, P.ink, 6); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a) * 60, Math.sin(a) * 60); k.stroke(c, P.ink, 4); } c.restore();
        k.mouse(c, 10, 110, 0.9, { t: u, up: 0.5 + Math.sin(u * 4) * 0.08 });
        if (u > wh - 0.2) for (let i = 0; i < 5; i++) { const q = ((u - wh) * 0.8 + i / 5) % 1; c.save(); c.globalAlpha = 1 - q; k.musicNote(c, 60 + q * 220, 20 - q * 160 + Math.sin(q * 9) * 14, 0.9, P.ink); c.restore(); }
        oldFilm(c, w, h);
      });
      audience(ctx, S, 900, u, tween(u, lv - 0.3, lv + 0.2));
      if (u > lv) for (let i = 0; i < 8; i++) { const q = ((u - lv) * 0.7 + i / 8) % 1; ctx.save(); ctx.globalAlpha = 1 - q; heart(ctx, k, P, 100 + i * 115, 820 - q * 200, 1.5); ctx.restore(); }
      k.label(ctx, 'IT WHISTLES', W / 2, 740, 26, tween(u, wh, wh + 0.3) * (1 - tween(u, cr, cr + 0.3)));
    },
  },
  { // 40.4 "And in 2024, that very first Mickey entered the public domain."
    start: 40.2, title: 'Public Domain · 2024', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const yr = S.at('2024,'), fi = S.at('first'), en = S.at('entered'), pd = S.at('public');
      ctx.fillStyle = P.paperLight; ctx.fillRect(-60, -60, W + 120, 1200);
      ctx.fillStyle = k.pattern(ctx, 'flowers', P.paperLight, P.paperDark, 30); ctx.fillRect(-60, -60, W + 120, 1200);
      k.seal(ctx, 160, 140, 80, ' THE YEAR · 2024 ·', '2024', tween(u, yr - 0.1, yr + 0.3, ease.linear));
      // the 1928 film in a frame, locked; the lock opens
      k.frame(ctx, W / 2, 470, 520, 400, c => { c.fillStyle = '#e8e2d0'; c.fillRect(-260, -200, 520, 400); k.waves(c, -260, 80, 520, 120, S.t, '#7a7a7a', '#c9c9c0', 20, 22); k.mouse(c, 0, 90, 1.1, { t: u }); oldFilm(c, 520, 400); });
      k.label(ctx, 'THE 1928 VERSION', W / 2, 705, 24, tween(u, fi, fi + 0.3));
      const op = tween(u, en - 0.1, en + 0.4, ease.outBack);
      k.padlock(ctx, W / 2, 900, 1.2, op);
      if (u > en) for (let i = 0; i < 12; i++) { const a = i / 12 * TAU, r = 80 + (u - en) * 260; k.star(ctx, W / 2 + Math.cos(a) * r, 920 + Math.sin(a) * r * 0.6, 10, 1 - (u - en) * 0.8); }
    },
  },
  { // 45.4 "A lost rabbit gave the world its most famous mouse."
    start: 45.2, title: 'The Most Famous Mouse', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const lo = S.at('lost'), wo = S.at('world'), fa = S.at('famous');
      land(ctx, S, { horizon: 760, clouds: 3 });
      // the rabbit hops away small; the mouse rises on a star
      const away = tween(u, lo, lo + 2.5, ease.inOut);
      ctx.save(); ctx.globalAlpha = 1 - away * 0.7; k.rabbit(ctx, lerp(200, -40, away), 900 - Math.abs(Math.sin(u * 4)) * 30, 0.7, { t: S.t, face: -1, droop: 0.7 }); ctx.restore();
      const rise = tween(u, wo - 0.6, fa, ease.outCubic);
      starBadge(ctx, k, P, 620, lerp(820, 470, rise), lerp(80, 260, rise), Math.sin(S.t) * 0.05);
      k.mouse(ctx, 620, lerp(860, 560, rise), lerp(0.5, 1.4, rise), { t: S.t });
      k.label(ctx, 'THE MOST FAMOUS MOUSE', W / 2, 1020, 28, tween(u, fa, fa + 0.3));
      if (u > fa) for (let i = 0; i < 14; i++) { const a = i / 14 * TAU, r = 280 + (u - fa) * 200; k.star(ctx, 620 + Math.cos(a) * r, 470 + Math.sin(a) * r * 0.8, 12, 1 - (u - fa) * 0.5); }
    },
  },
  { // 50.3 "Every legend has a beginning."
    start: 50.0, title: 'Every Legend Has a Beginning', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S, beg = S.at('beginning.');
      ctx.save(); S.cam(lerp(1.0, 1.4, tween(u, 0, beg)), 620, lerp(600, 470, tween(u, 0, beg)));
      land(ctx, S, { horizon: 760, clouds: 3 });
      starBadge(ctx, k, P, 620, 470, 260, Math.sin(S.t) * 0.05);
      k.mouse(ctx, 620, 560, 1.4, { t: S.t });
      ctx.restore();
      const open = tween(u, beg - 0.1, beg + 0.55, ease.inOut);
      if (open > 0) {
        ctx.save(); ctx.beginPath(); ctx.arc(W / 2, 560, open * 900, 0, TAU); ctx.clip(); bookCover(ctx, S, u - beg); ctx.restore();
        if (open < 1) { ctx.beginPath(); ctx.arc(W / 2, 560, open * 900, 0, TAU); k.stroke(ctx, P.goldLight, 8); }
      }
    },
  },
];

// ---------- sound ----------
export const sfx = [
  ...scenes.slice(1).map(s => ({ t: s.start - 0.05, type: s.trans === 'unroll' ? 'paper' : 'whoosh', gain: 0.35 })),
  { t: 0.8, type: 'pop', gain: 0.6 }, { t: 2.82, type: 'slide', gain: 0.4 }, { t: 3.9, type: 'flop', gain: 0.4 },
  { t: 5.9, type: 'stamp', gain: 0.5 },
  { t: 8.1, type: 'slide', gain: 0.35 }, { t: 9.8, type: 'chime', gain: 0.5 }, { t: 10.84, type: 'pluck', gain: 0.4 },
  { t: 13.0, type: 'paper', gain: 0.4 }, { t: 13.82, type: 'stamp', gain: 0.9 },
  { t: 16.0, type: 'thud', gain: 0.3 }, { t: 16.4, type: 'thud', gain: 0.3 }, { t: 16.8, type: 'thud', gain: 0.3 },
  { t: 18.4, type: 'clank', gain: 0.4 }, { t: 19.6, type: 'pluck', gain: 0.4 }, { t: 20.4, type: 'chime', gain: 0.6, pitch: 1.3 },
  { t: 22.82, type: 'pluck', gain: 0.4 }, { t: 24.08, type: 'paper', gain: 0.35 }, { t: 25.24, type: 'pop', gain: 0.7 }, { t: 25.3, type: 'chime', gain: 0.5 },
  { t: 27.9, type: 'riser', gain: 0.35 }, { t: 30.0, type: 'gong', gain: 0.6 },
  { t: 31.82, type: 'pop', gain: 0.5 }, { t: 32.18, type: 'stamp', gain: 0.5 }, { t: 34.0, type: 'slide', gain: 0.45 }, { t: 34.6, type: 'waves', gain: 0.3 },
  { t: 37.0, type: 'chime', gain: 0.45, pitch: 1.6 }, { t: 37.4, type: 'chime', gain: 0.35, pitch: 1.8 },
  { t: 38.8, type: 'coins', gain: 0.25 }, { t: 38.85, type: 'riser', gain: 0.3 },
  { t: 40.66, type: 'stamp', gain: 0.6 }, { t: 43.04, type: 'clank', gain: 0.6 }, { t: 43.2, type: 'chime', gain: 0.6, pitch: 1.4 },
  { t: 45.64, type: 'flop', gain: 0.35 }, { t: 47.2, type: 'riser', gain: 0.45 }, { t: 48.16, type: 'gong', gain: 0.7 },
  { t: 51.62, type: 'pop', gain: 0.8 }, { t: 51.66, type: 'gong', gain: 0.9 },
];

export const music = {
  bpm: 112, root: 'E', maqam: 'nihavend', gain: 0.32,
  sections: [
    { from: 0, to: 5.6, mood: 'intro' },
    { from: 5.6, to: 11.8, mood: 'groove' },
    { from: 11.8, to: 21.5, mood: 'sad' },
    { from: 21.5, to: 31.6, mood: 'drive' },
    { from: 31.6, to: 51.62, mood: 'triumph' },
    { from: 51.62, to: 54.5, mood: 'end' },
  ],
};
