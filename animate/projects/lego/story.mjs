// "How LEGO Started" — an Ottoman miniature chronicle of a carpenter's side project.
// u = seconds since the scene started; S.at('word') = when that word is said.
import { clamp, lerp, ease, tween, rng, TAU, shake, pop } from '../../lib/core.mjs';
import { land, interior, lamp, bookCover, bigSign, medallion, compassRose } from '../../styles/ottoman/scenes.mjs';

export const meta = {
  title: 'How LEGO Started',
  slug: 'lego-ottoman',
  style: 'ottoman',
  look: 'karagoz',
  width: 1080, height: 1920, fps: 30,
  duration: 59.8,
  voice: 'voice.mp3',
  seed: 89,
  captionChars: 30,
  brand: { handle: '@HOWITSTARTED-YT1', logo: '../../../brand/logo.png' },
  outro: { at: 58.45, text: 'Subscribe for more origin stories' },
};

const OLE = { robe: '#7a4a2a', robeP: 'dots', robePc: '#5e3a20', inner: '#e9d6b0', sash: '#3d8458', hat: 'shorthair', hair: '#5a3a22' };
const COLORS = ['#c4371f', '#ecc53a', '#3f68bd', '#3d8458', '#f4f1ea'];

function workshop(ctx, S, o = {}) {
  const { k, P, W } = S;
  interior(ctx, S, { window: o.window ?? true, carpet: false });
  ctx.fillStyle = '#b08a5a'; ctx.fillRect(-60, 760, W + 120, 400);
  for (let x = -40; x < W + 40; x += 80) { ctx.beginPath(); ctx.moveTo(x, 760); ctx.lineTo(x - 30, 1100); k.stroke(ctx, '#9a7444', 2); }
  k.rect(ctx, 120, 760, W - 240, 30, P.brownLight, P.ink, 2.5);
  for (const lx of [150, W - 170]) k.rect(ctx, lx, 790, 20, 220, P.brown, P.ink, 1.5);
  // tools on the wall
  if (o.tools !== false) { k.rect(ctx, 600, 160, 260, 14, P.brown, P.ink, 1.5); for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(630 + i * 60, 174); ctx.lineTo(630 + i * 60, 260 + (i % 2) * 30); k.stroke(ctx, P.steel, 6); } }
}
function brickWall(ctx, S, x, base, cols, rows, k = 1, w = 90) {
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const i = r * cols + c, p = clamp(k * rows * cols - i);
    if (p <= 0) continue;
    const bx = x + (c - (cols - 1) / 2) * w + (r % 2) * w / 2, by = base - r * w * 0.36 - (1 - p) * 120;
    S.k.brick(ctx, bx, by, w, COLORS[(r * 3 + c) % 4]);
  }
}

export const scenes = [
  { // 0.0 "Lego started with a carpenter who was running out of work."
    start: 0, title: 'A Carpenter Out of Work',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const ca = S.at('carpenter'), ro = S.at('running');
      S.cam(lerp(1.15, 1.0, tween(u, 0, 5)), W / 2, 580);
      workshop(ctx, S);
      // a ledger with empty pages
      k.openBook(ctx, 620, 720, 260, 110, { cover: P.brown });
      k.figure(ctx, 300, 1010, { ...OLE, s: 1.2, face: 1, mood: u > ro ? 'sad' : 'calm', look: u > ro ? 0.4 : 0, armF: [1.4, 0.3], hold: c => { c.rotate(-0.2); k.rect(c, -40, -10, 80, 26, P.brownLight, P.ink, 1.5); k.rect(c, -10, -24, 20, 16, P.ink, P.ink, 1); } });
      k.label(ctx, 'A CARPENTER', 300, 560, 26, tween(u, ca, ca + 0.3));
      k.stamp(ctx, 'NO WORK', 620, 440, 70, tween(u, S.at('work'), S.at('work') + 0.25, ease.linear), -0.12);
    },
  },
  { // 5.5 "1932, Billund, Denmark."
    start: 5.3, title: 'Billund, Denmark · 1932', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const bi = S.at('Billund');
      S.cam(lerp(1.1, 1.0, tween(u, 0, 3.4)), W / 2, 560);
      land(ctx, S, { horizon: 330, seed: 171, clouds: 3, hillColors: [P.sageLight, P.green, P.lavLight] });
      k.windmill(ctx, 780, 700, 1.1, S.t);
      for (let i = 0; i < 5; i++) k.house(ctx, 110 + i * 150, 760 + (i % 2) * 60, 130, 90, { wall: P.white, roof: P.vermDark, chimney: i % 2 === 0 });
      k.cypress(ctx, 60, 1000, 220, S.t, 2);
      k.label(ctx, 'BILLUND · DENMARK', W / 2, 260, 30, tween(u, bi, bi + 0.3));
      k.seal(ctx, 160, 1000, 62, ' BILLUND · DENMARK ·', '1932', tween(u, 0.1, 0.4, ease.linear));
    },
  },
  { // 9.0 "The Great Depression hits. Work dries up for Ole Kirk Kristiansen."
    start: 8.8, title: 'The Great Depression', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const gd = S.at('Great'), ok = S.at('Ole');
      workshop(ctx, S, { window: false });
      ctx.save(); ctx.fillStyle = `rgba(40,45,70,${0.35 * tween(u, gd - 0.3, gd + 0.6)})`; ctx.fillRect(-60, -60, W + 120, H + 120); ctx.restore();
      k.chest(ctx, 640, 900, 1.2, 1, 1 - tween(u, gd, ok + 0.6));
      k.figure(ctx, 290, 1010, { ...OLE, s: 1.2, face: 1, mood: 'sad', look: 0.5, armF: [0.3, 0.3] });
      k.label(ctx, 'OLE KIRK KRISTIANSEN', 300, 560, 24, tween(u, ok, ok + 0.3));
      k.stamp(ctx, 'THE GREAT DEPRESSION', W / 2, 300, 46, tween(u, gd, gd + 0.25, ease.linear), -0.08);
    },
  },
  { // 14.3 "So he starts carving wooden toys instead. Wooden ducks, yo-yos."
    start: 14.1, title: 'Wooden Toys', trans: 'flash',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const cv = S.at('carving'), du = S.at('ducks'), yo = S.at('yo-yos');
      workshop(ctx, S);
      // wood shavings fly while he carves
      if (u > cv - 0.2 && u < du + 0.4) for (let i = 0; i < 10; i++) { const q = ((u - cv) * 1.4 + i / 10) % 1; ctx.beginPath(); ctx.arc(420 + q * 120 * Math.cos(i), 700 - q * 150, 8, 0, Math.PI); k.stroke(ctx, '#d9b27a', 3); }
      const dp = pop(u, du - 0.2, 0.35);
      if (dp > 0) { ctx.save(); ctx.translate(lerp(480, 600, tween(u, du, du + 2)), 740); ctx.scale(dp, dp); k.woodenDuck(ctx, 0, 0, 1.4, S.t, u * 4); ctx.restore(); }
      const yp = pop(u, yo - 0.2, 0.35);
      if (yp > 0) k.yoyo(ctx, 820, 420 + Math.sin(u * 5) * 90, 36 * yp, S.t, 220 + Math.sin(u * 5) * 90);
      k.figure(ctx, 280, 1010, { ...OLE, s: 1.15, face: 1, mood: 'happy', armF: [1.4 + Math.sin(u * 10) * 0.12, 0.5], hold: c => { c.rotate(-0.6); k.rect(c, -3, -40, 6, 46, P.steel, P.ink, 1); } });
      k.label(ctx, 'WOODEN TOYS', W / 2, 250, 32, tween(u, cv + 0.6, cv + 0.9));
    },
  },
  { // 20.4 "In 1934, he names his company Lego, from the Danish words leg godt, meaning play well."
    start: 20.1, title: '“Play Well” · 1934', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const lg = S.at('Lego'), lgw = S.at(/^leg$/i), pw = S.at('play');
      k.goldSky(ctx, -60, -60, W + 120, H + 120, S.t);
      for (let i = 0; i < 3; i++) k.cloud(ctx, 150 + i * 320, 140 + (i % 2) * 60, 1.0, i + 180);
      // LEG GODT → LE + GO → LEGO
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '900 110px Deco';
      const show = tween(u, lgw - 0.2, lgw + 0.3), join = tween(u, lgw + 0.9, pw - 0.1, ease.inOut);
      const txt = (t, x, y, col, a) => { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.lineWidth = 10; ctx.strokeStyle = P.ink; ctx.strokeText(t, x, y); ctx.fillStyle = col; ctx.fillText(t, x, y); ctx.restore(); };
      const wd = t => ctx.measureText(t).width, gap = 60;
      const w1 = wd('LE'), w2 = wd('G'), w3 = wd('GO'), w4 = wd('DT');
      const sx = W / 2 - (w1 + w2 + gap + w3 + w4) / 2, ex = W / 2 - (w1 + w3) / 2;
      const pos = { LE: [sx, ex], G: [sx + w1, ex + w1], GO: [sx + w1 + w2 + gap, ex + w1], DT: [sx + w1 + w2 + gap + w3, ex + w1 + w3] };
      ctx.textAlign = 'left';
      for (const [t, col, fade] of [['LE', P.verm, 0], ['G', P.paperLight, 1], ['GO', P.verm, 0], ['DT', P.paperLight, 1]]) txt(t, lerp(pos[t][0], pos[t][1], join), 360, col, show * (fade ? 1 - join : 1));
      ctx.textAlign = 'center';
      ctx.font = 'italic 700 40px GaramondItalic'; ctx.fillStyle = P.ink; ctx.globalAlpha = show * (1 - join); ctx.fillText('leg godt', W / 2, 470); ctx.globalAlpha = 1;
      k.label(ctx, '“PLAY WELL”', W / 2, 560, 36, tween(u, pw, pw + 0.3));
      brickWall(ctx, S, W / 2, 980, 5, 4, tween(u, lg - 0.6, pw + 1.2), 110);
      k.seal(ctx, 840, 200, 60, ' THE COMPANY IS NAMED ·', '1934', tween(u, S.at('1934'), S.at('1934') + 0.3, ease.linear));
    },
  },
  { // 29.0 "Then, in 1942, his factory burns to the ground."
    start: 28.6, title: 'The Fire · 1942', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const bu = S.at('burns'), gr = S.at('ground');
      k.nightSky(ctx, -60, -60, W + 120, H + 120, S.t);
      const glow = tween(u, bu - 0.6, bu + 0.4);
      ctx.save(); ctx.globalAlpha = 0.6 * glow; const g = ctx.createRadialGradient(W / 2, 700, 40, W / 2, 700, 700); g.addColorStop(0, 'rgba(255,140,60,0.9)'); g.addColorStop(1, 'rgba(200,60,30,0)'); ctx.fillStyle = g; ctx.fillRect(-60, -60, W + 120, H + 120); ctx.restore();
      ctx.fillStyle = '#3a3a30'; ctx.fillRect(-60, 860, W + 120, 300);
      const fall = tween(u, gr - 0.2, gr + 0.6, ease.inCubic);
      ctx.save(); ctx.translate(0, fall * 160); ctx.globalAlpha = 1 - fall * 0.85; k.factory(ctx, W / 2, 860, 520, 260, S.t, false); ctx.restore();
      k.flames(ctx, W / 2, 870, 600, tween(u, bu - 0.8, bu) * (1 - tween(u, gr + 0.8, gr + 1.6) * 0.6), S.t);
      for (let i = 0; i < 4; i++) { const q = (S.t * 0.4 + i / 4) % 1; ctx.save(); ctx.globalAlpha = (1 - q) * glow; k.cloud(ctx, W / 2 - 200 + i * 130 + q * 60, 560 - q * 360, 0.8 + q * 0.6, i + 190, '#55504c', P.ink); ctx.restore(); }
      k.seal(ctx, 840, 200, 60, ' THE FACTORY FIRE ·', '1942', tween(u, S.at('1942'), S.at('1942') + 0.3, ease.linear), P.vermDark);
    },
  },
  { // 33.4 "He rebuilds."
    start: 33.15, title: 'He Rebuilds', trans: 'flash',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const up = tween(u, 0.1, 1.4, ease.outCubic);
      land(ctx, S, { horizon: 380, seed: 173, clouds: 2 });
      k.sun(ctx, W / 2, lerp(460, 220, up), 60, S.t);
      ctx.save(); ctx.beginPath(); ctx.rect(-60, 860 - 420 * up, W + 120, 1000); ctx.clip(); k.factory(ctx, W / 2, 860, 520, 260, S.t, true); ctx.restore();
      k.figure(ctx, 200, 1010, { ...OLE, s: 1.0, face: 1, mood: 'happy', armF: [2.6, 0.1] });
      k.label(ctx, 'HE REBUILDS', W / 2, 1000, 30, tween(u, 0.2, 0.5));
    },
  },
  { // 34.9 "In 1949, the company starts making a new kind of toy. Plastic bricks that stack together, inspired by a British toy."
    start: 34.7, title: 'Plastic Bricks · 1949', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const pl = S.at('Plastic'), st = S.at('stack'), br = S.at('British');
      S.cam(lerp(1.0, 1.08, tween(u, 0, 8.9)), W / 2, 580);
      workshop(ctx, S, { tools: false });
      // bricks rain down and stack into a little tower
      const R = rng(9);
      for (let i = 0; i < 12; i++) { const p = tween(u, pl - 0.3 + i * 0.18, pl + 0.1 + i * 0.18, ease.outBounce); if (p <= 0) continue; const col = i % 3, row = Math.floor(i / 3); k.brick(ctx, 380 + col * 110 + (row % 2) * 55, lerp(200, 740 - row * 40, p), 110, COLORS[(i + 1) % 4]); }
      const bp = pop(u, br - 0.2, 0.35);
      if (bp > 0) { ctx.save(); ctx.translate(820, 380); ctx.scale(bp, bp); k.rect(ctx, -90, -70, 180, 140, P.paperLight, P.ink, 2); ctx.fillStyle = P.lapis; ctx.font = '900 18px Deco'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('A BRITISH TOY', 0, -40); k.brick(ctx, 0, 20, 90, '#8a98a8', 4); ctx.restore(); }
      k.figure(ctx, 200, 1010, { ...OLE, s: 1.0, face: 1, mood: 'happy', armF: [1.8, 0.3] });
      k.label(ctx, 'PLASTIC BRICKS', W / 2 - 60, 250, 28, tween(u, pl, pl + 0.3));
      k.seal(ctx, 840, 620, 56, ' A NEW KIND OF TOY ·', '1949', tween(u, S.at('1949'), S.at('1949') + 0.3, ease.linear));
    },
  },
  { // 43.9 "In 1958, they patent the brick we know today, with tubes inside that make it click and hold."
    start: 43.65, title: 'The Patent · 1958', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const pa = S.at('patent'), tu = S.at('tubes'), cl = S.at('click');
      // a patent sheet with the cut-away drawing
      ctx.fillStyle = '#dfe9f2'; ctx.fillRect(-60, -60, W + 120, 1200);
      ctx.save(); ctx.globalAlpha = 0.35; ctx.strokeStyle = P.lapisLight; ctx.lineWidth = 1; for (let i = 0; i < 24; i++) { ctx.beginPath(); ctx.moveTo(i * 44, 0); ctx.lineTo(i * 44, 1060); ctx.stroke(); } for (let i = 0; i < 26; i++) { ctx.beginPath(); ctx.moveTo(0, i * 44); ctx.lineTo(W, i * 44); ctx.stroke(); } ctx.restore();
      ctx.fillStyle = P.lapis; ctx.font = '900 40px Deco'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('PATENT', W / 2, 120);
      k.brick(ctx, W / 2, 380, 380, '#c9d6e4', 4, tween(u, tu - 0.3, tu + 0.2) > 0.5);
      k.label(ctx, 'TUBES INSIDE', W / 2, 520, 24, tween(u, tu, tu + 0.3));
      // two bricks click together
      const cp = tween(u, cl - 0.5, cl, ease.inCubic);
      k.brick(ctx, W / 2, 860, 300, P.verm, 4);
      k.brick(ctx, W / 2 + 37, lerp(600, 860 - 300 * 0.36, cp), 300, P.ochre, 4);
      if (u > cl) { k.label(ctx, 'CLICK!', W / 2 + 260, 700, 30, tween(u, cl, cl + 0.2)); for (let i = 0; i < 10; i++) { const a = i / 10 * TAU, r = 60 + (u - cl) * 260; k.star(ctx, W / 2 + Math.cos(a) * r, 780 + Math.sin(a) * r * 0.5, 9, 1 - (u - cl)); } }
      k.seal(ctx, 840, 220, 60, ' PATENTED · PATENTED ·', '1958', tween(u, S.at('1958'), S.at('1958') + 0.3, ease.linear));
    },
  },
  { // 50.7 "A carpenter's side project."
    start: 50.5, title: "A Carpenter's Side Project", trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      workshop(ctx, S);
      k.woodenDuck(ctx, 520, 740, 1.2, S.t, 0);
      k.brick(ctx, 720, 735, 130, P.verm);
      k.figure(ctx, 280, 1010, { ...OLE, s: 1.15, face: 1, mood: 'happy', armF: [1.6, 0.3] });
      k.label(ctx, 'A SIDE PROJECT', W / 2, 260, 30, tween(u, 0.2, 0.5));
    },
  },
  { // 52.8 "Now found in homes around the world."
    start: 52.6, title: 'Homes Around the World', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const ho = S.at('homes'), wo = S.at('world');
      S.cam(lerp(1.1, 1.0, tween(u, 0, 3.6)), W / 2, 540);
      ctx.fillStyle = '#efdcb0'; ctx.fillRect(-100, -100, W + 200, H + 200);
      compassRose(ctx, k, P, W / 2, 540, 90, S.t * 0.05);
      const land1 = [[60, 120], [260, 90], [380, 160], [330, 260], [400, 320], [310, 420], [250, 470], [300, 560], [380, 640], [340, 800], [260, 960], [200, 1000], [180, 820], [120, 640], [150, 520], [90, 400], [40, 260]];
      const land2 = [[620, 60], [900, 50], [920, 220], [860, 300], [900, 360], [940, 520], [880, 760], [760, 900], [700, 760], [620, 560], [600, 440], [660, 380], [600, 300], [640, 200]];
      for (const pts of [land1, land2]) { ctx.beginPath(); k.smoothPath(ctx, pts); k.fillStroke(ctx, '#cdb57a', P.ink, 2.5); }
      const spots = [[230, 250], [300, 640], [220, 880], [760, 170], [800, 420], [770, 720], [160, 420], [680, 600], [720, 300]];
      spots.forEach(([x, y], i) => { const p = pop(u, ho - 0.6 + i * 0.15, 0.3); if (p <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(p, p); k.house(ctx, 0, 0, 50, 38, { wall: P.white, roof: P.verm }); k.brick(ctx, 0, -70, 50, COLORS[i % 4]); ctx.restore(); });
      k.label(ctx, 'AROUND THE WORLD', W / 2, 1000, 28, tween(u, wo, wo + 0.3));
    },
  },
  { // 56.6 "Every legend has a beginning."
    start: 56.3, title: 'Every Legend Has a Beginning', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W, H } = S, beg = S.at('beginning');
      ctx.save(); S.cam(lerp(1.0, 1.4, tween(u, 0, beg)), W / 2, 640);
      workshop(ctx, S);
      const g = ctx.createRadialGradient(W / 2, 720, 10, W / 2, 720, 220); g.addColorStop(0, 'rgba(255,240,170,0.85)'); g.addColorStop(1, 'rgba(255,240,170,0)'); ctx.fillStyle = g; ctx.fillRect(W / 2 - 230, 500, 460, 460);
      k.brick(ctx, W / 2, 730, 180, P.verm);
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
const pops = (from, n, gap, gain = 0.5) => Array.from({ length: n }, (_, i) => ({ t: +(from + i * gap).toFixed(3), type: 'pop', gain, pitch: 1 + (i % 4) * 0.12 }));
const clicks = (from, n, gap) => Array.from({ length: n }, (_, i) => ({ t: +(from + i * gap).toFixed(3), type: 'clank', gain: 0.3 }));
export const sfx = [
  ...scenes.slice(1).map(s => ({ t: s.start - 0.05, type: s.trans === 'unroll' ? 'paper' : 'whoosh', gain: 0.35 })),
  { t: 0.3, type: 'clank', gain: 0.4 }, { t: 2.0, type: 'pluck', gain: 0.45 }, { t: 3.9, type: 'stamp', gain: 0.8 },
  { t: 5.44, type: 'stamp', gain: 0.5 }, { t: 6.0, type: 'wind', gain: 0.3 }, { t: 7.08, type: 'chime', gain: 0.4 },
  { t: 9.06, type: 'thunder', gain: 0.35 }, { t: 9.4, type: 'stamp', gain: 0.6 }, { t: 10.2, type: 'coins', gain: 0.25 }, { t: 12.24, type: 'pluck', gain: 0.45, pitch: 0.8 },
  { t: 15.0, type: 'paper', gain: 0.4 }, { t: 15.6, type: 'paper', gain: 0.35 }, { t: 18.04, type: 'pop', gain: 0.6 }, { t: 19.02, type: 'slide', gain: 0.4 }, { t: 19.3, type: 'pop', gain: 0.5 },
  { t: 22.7, type: 'chime', gain: 0.5 }, ...clicks(23.0, 20, 0.2), { t: 25.24, type: 'pluck', gain: 0.4 }, { t: 26.68, type: 'gong', gain: 0.6 },
  { t: 29.28, type: 'stamp', gain: 0.5 }, { t: 30.4, type: 'sizzle', gain: 0.6 }, { t: 31.2, type: 'thunder', gain: 0.4 }, { t: 32.12, type: 'crack', gain: 0.8 }, { t: 32.3, type: 'thud', gain: 0.7 },
  { t: 33.3, type: 'riser', gain: 0.4 }, { t: 33.6, type: 'gong', gain: 0.6 },
  { t: 34.9, type: 'stamp', gain: 0.5 }, ...clicks(39.0, 12, 0.18), { t: 42.4, type: 'pop', gain: 0.5 },
  { t: 45.14, type: 'stamp', gain: 0.6 }, { t: 47.42, type: 'chime', gain: 0.4 }, { t: 48.88, type: 'clank', gain: 0.9 }, { t: 48.9, type: 'pop', gain: 0.7 },
  { t: 50.84, type: 'pluck', gain: 0.45 },
  ...pops(52.1, 9, 0.15, 0.35), { t: 54.86, type: 'chime', gain: 0.5 },
  { t: 57.8, type: 'clank', gain: 0.6 }, { t: 57.84, type: 'gong', gain: 0.9 },
];

export const music = {
  bpm: 100, root: 'G', maqam: 'nihavend', gain: 0.32,
  sections: [
    { from: 0, to: 8.8, mood: 'intro' },
    { from: 8.8, to: 14.1, mood: 'sad' },
    { from: 14.1, to: 28.6, mood: 'groove' },
    { from: 28.6, to: 33.15, mood: 'sad' },
    { from: 33.15, to: 43.65, mood: 'drive' },
    { from: 43.65, to: 57.8, mood: 'triumph' },
    { from: 57.8, to: 59.8, mood: 'end' },
  ],
};
