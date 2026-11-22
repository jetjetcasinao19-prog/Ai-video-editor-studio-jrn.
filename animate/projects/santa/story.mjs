// "How Santa Became Red" — an Ottoman miniature chronicle busting a myth.
// u = seconds since the scene started; S.at('word') = when that word is said.
import { clamp, lerp, ease, tween, rng, TAU, shake, pop } from '../../lib/core.mjs';
import { land, interior, lamp, bookCover, bigSign, medallion, heart } from '../../styles/ottoman/scenes.mjs';

export const meta = {
  title: 'How Santa Became Red',
  slug: 'santa-ottoman',
  style: 'ottoman',
  look: 'scroll',
  room: 'lattice',
  width: 1080, height: 1920, fps: 30,
  duration: 56.0,
  voice: 'voice.mp3',
  seed: 83,
  captionChars: 30,
  brand: { handle: '@HOWITSTARTED-YT1', logo: '../../../brand/logo.png' },
  outro: { at: 53.9, text: 'Subscribe for more origin stories' },
};

const SANTA = { robe: '#c4371f', robeP: 'dots', robePc: '#e0a59b', inner: '#f8f2e2', sash: '#1a1a1a', hat: 'santa', beard: 'long', beardColor: '#f4f4f4', mustache: true, mustacheColor: '#f4f4f4', shoes: '#1a1a1a' };
const SANTA_NAST = { robe: '#8a5a3a', robeP: 'dots', robePc: '#c9b89a', inner: '#c9b89a', sash: '#3a2a20', hat: 'furcap', beard: 'long', beardColor: '#f4f4f4', mustache: true, mustacheColor: '#f4f4f4', shoes: '#3a2a20' };
const NAST = { robe: '#2a2f45', robeP: 'stripes', robePc: '#3f4760', inner: '#f7eed6', sash: '#c4371f', hat: 'shorthair', hair: '#3a2a20', beard: 'short', mustache: true };
const SUNDBLOM = { robe: '#7a5a3a', robeP: 'dots', robePc: '#5e4630', inner: '#f7eed6', sash: '#20408f', hat: 'shorthair', hair: '#8a6a4a', mustache: true };
const ENVOY = { robe: '#c4371f', robeP: 'cintamani', robePc: '#ecd57a', inner: '#f8f2e2', hat: 'turban', hatColor: '#3d8458', plume: '#ecd57a', mustache: true };

const miniSanta = (o, s = 0.55, y = 110) => c => { c.fillStyle = '#20408f'; c.fillRect(-300, -300, 600, 600); for (let i = 0; i < 12; i++) S_star(c, -140 + (i * 53) % 280, -120 + (i * 37) % 120); S_fig(c, 0, y, { ...o, s, face: 1, mood: 'happy', armF: [2.2, 0.2] }); };
let S_fig, S_star; // bound to the kit in each scene

function snowNight(ctx, S, moonX = 760) {
  const { k, W, H, t } = S;
  k.nightSky(ctx, -60, -60, W + 120, H + 120, t);
  k.moon(ctx, moonX, 170, 60);
  k.spongy(ctx, W / 2, 900, 1300, 220, '#dfe6ee', 4);
  ctx.fillStyle = '#e8eef0'; ctx.fillRect(-60, 880, W + 120, 400);
  for (let i = 0; i < 5; i++) k.house(ctx, 110 + i * 190, 960, 120, 90, { wall: [P0(S).white, P0(S).pink, P0(S).ochreLight][i % 3], roof: '#f4f4f4', chimney: true, lit: true });
  k.snow(ctx, -60, -60, W + 120, H + 120, t, 90);
}
const P0 = S => S.P;

export const scenes = [
  { // 0.0 "Coca-Cola made Santa red? That's a myth."
    start: 0, title: 'The Red Santa Myth',
    draw(ctx, u, S) {
      const { k, P, W } = S; S_fig = k.figure; S_star = (c, x, y) => k.star(c, x, y, 5, 1);
      const my = S.at('myth');
      k.goldSky(ctx, -60, -60, W + 120, 1300, S.t);
      for (let i = 0; i < 3; i++) k.cloud(ctx, 150 + i * 320, 150 + (i % 2) * 60, 1.1, i + 170);
      k.carpet(ctx, 100, 860, W - 200, 180, P.verm, P.lapis);
      k.figure(ctx, 380, 1010, { ...SANTA, s: 1.4, face: 1, mood: 'happy', armF: [1.7, 0.2], hold: c => k.sodaBottle(c, 10, -40, 1.1, -0.2) });
      medallion(ctx, k, P, '?', 740, 380, pop(u, 0.6, 0.35) * 1.3);
      k.stamp(ctx, 'MYTH', 700, 620, 90, tween(u, my, my + 0.25, ease.linear), -0.15);
    },
  },
  { // 4.0 "1823. A poem called A Visit from St. Nicholas describes him as jolly and plump,"
    start: 3.85, title: 'A Visit from St. Nicholas · 1823', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W, H } = S; S_fig = k.figure; S_star = (c, x, y) => k.star(c, x, y, 5, 1);
      const po = S.at('poem'), jo = S.at('jolly'), pl = S.at('plump');
      ctx.fillStyle = P.paperLight; ctx.fillRect(-60, -60, W + 120, H + 120);
      ctx.fillStyle = k.pattern(ctx, 'flowers', P.paperLight, '#e6d6ad', 40); ctx.fillRect(-60, -60, W + 120, H + 120);
      k.openBook(ctx, W / 2, 380, 760, 420, { cover: P.vermDark });
      ctx.fillStyle = P.verm; ctx.font = '900 30px Deco'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const tk = tween(u, po - 0.2, po + 1.2);
      ctx.save(); ctx.beginPath(); ctx.rect(W / 2 - 370, 180, 740 * tk, 400); ctx.clip();
      ctx.fillText('A VISIT FROM', W / 2 - 190, 260); ctx.fillText('ST. NICHOLAS', W / 2 - 190, 300);
      ctx.fillStyle = P.ink; ctx.font = 'italic 700 24px GaramondItalic'; ['’Twas the night before', 'Christmas, when all', 'through the house…'].forEach((ln, i) => ctx.fillText(ln, W / 2 + 180, 260 + i * 40));
      ctx.restore();
      // St. Nick grows jolly and plump
      const jk = tween(u, jo - 0.3, pl + 0.3, ease.outBack);
      k.figure(ctx, W / 2, 1010, { ...SANTA_NAST, robe: '#3d8458', inner: '#f8f2e2', s: lerp(0.9, 1.25, jk), face: 1, mood: jk > 0.3 ? 'happy' : 'calm', armF: [1.3, 0.8], bob: -Math.abs(Math.sin(u * 6)) * 8 * jk });
      k.label(ctx, 'JOLLY & PLUMP', W / 2, 640, 26, tween(u, pl, pl + 0.3));
      k.seal(ctx, 840, 680, 60, ' A POEM · A POEM ·', '1823', tween(u, 0.1, 0.4, ease.linear));
    },
  },
  { // 10.8 "flying a sleigh with eight reindeer."
    start: 10.6, title: 'Eight Reindeer', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const ei = S.at('eight');
      snowNight(ctx, S);
      const fx = lerp(-200, 260, tween(u, 0, 2.6, ease.inOut)), fy = lerp(560, 360, tween(u, 0, 2.6));
      for (let i = 0; i < 8; i++) { const p = pop(u, ei - 0.6 + i * 0.08, 0.25); if (p <= 0) continue; const col = i % 2, row = Math.floor(i / 2); k.reindeer(ctx, fx + 230 + row * 95, fy - 20 + col * 40 - row * 18, 0.75 * p, S.t, i); }
      k.sleigh(ctx, fx, fy + 40, 0.9);
      k.figure(ctx, fx - 10, fy + 10, { ...SANTA_NAST, robe: '#3d8458', inner: '#f8f2e2', s: 0.45, face: 1, mood: 'happy', armF: [2.2, 0.2] });
    },
  },
  { // 13.7 "In the 1860s, cartoonist Thomas Nast starts drawing Santa for Harper's Weekly."
    start: 13.5, title: 'Thomas Nast · 1860s', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W } = S; S_fig = k.figure; S_star = (c, x, y) => k.star(c, x, y, 5, 1);
      const tn = S.at('Thomas'), dr = S.at('drawing'), hw = S.at("Harper's");
      S.cam(lerp(1.0, 1.08, tween(u, 0, 5.8)), W / 2, 560);
      interior(ctx, S, { window: true, carpetColor: P.lapis });
      lamp(ctx, S, 760, 230, 1);
      k.rahle(ctx, 560, 990, 260);
      // his ink drawing of Santa, in black and white
      const dk = tween(u, dr - 0.3, dr + 1.2);
      ctx.save(); ctx.translate(590, 760); ctx.rotate(-0.06); k.rect(ctx, -150, -190, 300, 380, P.white, P.ink, 2);
      ctx.beginPath(); ctx.rect(-140, -180, 280 * dk, 360); ctx.clip();
      k.figure(ctx, 0, 170, { ...SANTA_NAST, robe: '#e8e4da', robePc: '#9a948a', inner: '#ffffff', hatColor: '#cfcac0', s: 0.95, face: 1, mood: 'happy', armF: [2.0, 0.3] });
      ctx.restore();
      k.figure(ctx, 230, 1010, { ...NAST, s: 1.15, face: 1, mood: 'calm', armF: [1.5 + Math.sin(u * 7) * 0.1, 0.4], hold: c => { c.rotate(-0.4); k.rect(c, -3, -46, 6, 50, P.ink, P.ink, 1); } });
      k.label(ctx, 'THOMAS NAST', 230, 560, 26, tween(u, tn, tn + 0.3));
      const mg = pop(u, hw - 0.2, 0.35);
      if (mg > 0) { ctx.save(); ctx.translate(820, 400); ctx.scale(mg, mg); k.magazine(ctx, 0, 0, 150, 0.08, "HARPER'S", P.lapis); ctx.restore(); }
      k.seal(ctx, 150, 230, 60, " CARTOONIST · HARPER'S ·", '1860s', tween(u, S.at('1860s'), S.at('1860s') + 0.3, ease.linear));
    },
  },
  { // 19.6 "Over the years, his Santa's coat turns red."
    start: 19.4, title: 'The Coat Turns Red', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S; S_fig = k.figure; S_star = (c, x, y) => k.star(c, x, y, 5, 1);
      const rd = S.at('red');
      interior(ctx, S, { window: false, carpetColor: P.verm });
      // three pictures across the years: ink → tan → red
      const looks = [{ robe: '#e8e4da', inner: '#ffffff', hatColor: '#cfcac0' }, { robe: '#8a5a3a', inner: '#c9b89a' }, { robe: '#c4371f', inner: '#f8f2e2', hatColor: '#c4371f', hat: 'santa' }];
      looks.forEach((lk, i) => { const p = pop(u, 0.2 + i * 0.6 + (i === 2 ? rd - 1.6 : 0), 0.35); if (p <= 0) return; ctx.save(); ctx.translate(180 + i * 290, 420); ctx.scale(p, p); k.frame(ctx, 0, 0, 200, 270, miniSanta({ ...SANTA_NAST, ...lk }, 0.55, 120)); ctx.restore(); if (i < 2 && p > 0.5) { ctx.beginPath(); ctx.moveTo(300 + i * 290, 420); ctx.lineTo(340 + i * 290, 420); k.stroke(ctx, P.goldDark, 6); } });
      if (u > rd) for (let i = 0; i < 12; i++) { const a = i / 12 * TAU, r = 170 + (u - rd) * 300; k.star(ctx, 760 + Math.cos(a) * r, 420 + Math.sin(a) * r, 10, 1 - (u - rd)); }
    },
  },
  { // 22.9 "Long before Coke, other artists were painting Santa in red too."
    start: 22.65, title: 'Red Before Coke', trans: 'wipe',
    draw(ctx, u, S) {
      const { k, P, W } = S; S_fig = k.figure; S_star = (c, x, y) => k.star(c, x, y, 5, 1);
      const oa = S.at('other'), rd = S.at('red');
      interior(ctx, S, { window: false, carpet: false });
      // a gallery wall of red Santas by many hands
      const R = rng(3);
      for (let i = 0; i < 6; i++) { const p = pop(u, oa - 0.4 + i * 0.25, 0.3); if (p <= 0) continue; const x = 170 + (i % 3) * 300, y = 260 + Math.floor(i / 3) * 360; ctx.save(); ctx.translate(x, y); ctx.scale(p, p); k.frame(ctx, 0, 0, 180 + (i % 2) * 30, 240, miniSanta({ ...SANTA, robe: ['#c4371f', '#a8301c', '#d4452a'][i % 3] }, 0.5, 110), (R() - 0.5) * 0.08); ctx.restore(); }
      k.stamp(ctx, 'BEFORE COKE', W / 2, 960, 64, tween(u, S.at('Coke'), S.at('Coke') + 0.25, ease.linear), -0.1);
    },
  },
  { // 27.0 "Then, in 1931, Coca-Cola hires artist Haddon Sundblom to paint Santa for its ads."
    start: 26.8, title: 'Coca-Cola · 1931', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S; S_fig = k.figure; S_star = (c, x, y) => k.star(c, x, y, 5, 1);
      const cc = S.at('Coca-Cola'), hs = S.at('Haddon'), pa = S.at('paint');
      S.cam(lerp(1.06, 1.0, tween(u, 0, 7)), W / 2, 560);
      interior(ctx, S, { window: true, carpetColor: P.verm });
      const pk = tween(u, pa - 0.3, pa + 1.6);
      k.easel(ctx, 560, 1000, 300, 380, c => { c.save(); c.beginPath(); c.rect(-150, -190, 300 * pk, 380); c.clip(); c.fillStyle = '#f2e6cc'; c.fillRect(-150, -190, 300, 380); k.figure(c, 0, 180, { ...SANTA, s: 1.0, face: 1, mood: 'happy', armF: [2.0, 0.3] }); c.restore(); });
      k.figure(ctx, 280, 1010, { ...SUNDBLOM, s: 1.05, face: 1, mood: 'happy', armF: [2.0 + Math.sin(u * 6) * 0.15, 0.2], hold: c => { c.rotate(-0.6); k.rect(c, -3, -50, 6, 56, P.brown, P.ink, 1); k.ellipse(c, 0, -54, 5, 8, 0, P.verm, P.ink, 1); } });
      const ep = pop(u, cc - 0.2, 0.35);
      if (ep > 0) k.figure(ctx, 840, 1010, { ...ENVOY, s: 0.95 * ep, face: -1, mood: 'happy', armF: [1.7, 0.1], hold: c => k.sodaBottle(c, 10, -30, 0.8, -0.2) });
      k.label(ctx, 'HADDON SUNDBLOM', 280, 560, 24, tween(u, hs, hs + 0.3));
      k.seal(ctx, 150, 230, 60, ' FOR ITS ADS · FOR ITS ADS ·', '1931', tween(u, S.at('1931'), S.at('1931') + 0.3, ease.linear));
    },
  },
  { // 34.2 "His warm, smiling Santa runs for over 30 years, and the world falls in love."
    start: 33.95, title: 'Over 30 Years', trans: 'flash',
    draw(ctx, u, S) {
      const { k, P, W } = S; S_fig = k.figure; S_star = (c, x, y) => k.star(c, x, y, 5, 1);
      const ye = S.at('years'), lo = S.at('love');
      snowNight(ctx, S, 180);
      // ads everywhere: framed Santas pop up across town
      for (let i = 0; i < 5; i++) { const p = pop(u, 0.3 + i * 0.4, 0.3); if (p <= 0) continue; ctx.save(); ctx.translate(150 + i * 170, 380 + (i % 2) * 180); ctx.scale(p, p); k.frame(ctx, 0, 0, 130, 170, miniSanta(SANTA, 0.38, 80)); ctx.restore(); }
      const n = Math.round(30 * tween(u, 0.5, ye + 0.2, ease.linear));
      k.cartouche(ctx, W / 2, 760, 420, 100, P.lapis, P.goldLight, 5);
      ctx.fillStyle = P.goldLight; ctx.font = '900 46px Deco'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(n + (u > ye ? '+' : '') + ' YEARS', W / 2, 764);
      if (u > lo - 0.2) for (let i = 0; i < 12; i++) { const q = ((u - lo) * 0.7 + i / 12) % 1; heart(ctx, k, P, 80 + (i * 87) % 780, 700 - q * 520, 1.4, 1 - q); }
    },
  },
  { // 41.4 "Even Coca-Cola says it didn't invent him."
    start: 41.1, title: "Coke Says So", trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const di = S.at("didn't");
      interior(ctx, S, { window: true, carpetColor: P.verm });
      k.figure(ctx, 330, 1010, { ...ENVOY, s: 1.2, face: 1, mood: 'happy', armF: [1.6, 0.1], hold: c => { c.rotate(-1.5); k.rect(c, -40, -110, 80, 150, P.paperLight, P.ink, 2); } });
      const sc = tween(u, di - 0.3, di + 0.2, ease.outBack);
      if (sc > 0) { ctx.save(); ctx.translate(620, 380); ctx.scale(sc, sc); k.speechBubble(ctx, 0, 0, "WE DIDN'T INVENT HIM", 30, -1); ctx.restore(); }
    },
  },
  { // 44.0 "The red? That's just luck."
    start: 43.8, title: 'Just Luck', trans: 'flash',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const lu = S.at('luck');
      k.goldSky(ctx, -60, -60, W + 120, H + 120, S.t);
      // two reds side by side: the coat and the label
      ctx.save(); ctx.translate(320, 520); k.rect(ctx, -110, -150, 220, 300, P.verm, P.ink, 3); ctx.fillStyle = P.white; ctx.fillRect(-110, 100, 220, 40); ctx.restore();
      k.sodaBottle(ctx, 680, 600, 2.6, 0);
      ctx.beginPath(); ctx.moveTo(450, 520); ctx.lineTo(600, 520); k.stroke(ctx, P.goldDark, 6);
      const lp = pop(u, lu - 0.1, 0.35);
      if (lp > 0) { ctx.save(); ctx.translate(W / 2, 220); ctx.scale(lp, lp); k.circle(ctx, 0, 0, 70, P.green, P.goldLight, 6); for (let i = 0; i < 4; i++) { ctx.save(); ctx.rotate(i * Math.PI / 2 + 0.785); k.ellipse(ctx, 0, -24, 18, 26, 0, '#5fb36a', P.ink, 1.5); ctx.restore(); } ctx.restore(); }
    },
  },
  { // 46.4 "A poem, a cartoonist, and a soda ad built the Santa we know."
    start: 46.2, title: 'The Santa We Know', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S; S_fig = k.figure; S_star = (c, x, y) => k.star(c, x, y, 5, 1);
      const po = S.at('poem'), ca = S.at('cartoonist'), so = S.at('soda'), bu = S.at('built');
      snowNight(ctx, S, 840);
      const items = [[po, c => k.openBook(c, 0, 0, 130, 80, { cover: P.vermDark }), 'POEM'], [ca, c => { k.rect(c, -50, -64, 100, 128, P.white, P.ink, 2); c.rotate(-0.6); k.rect(c, -4, -60, 8, 70, P.ink, P.ink, 1); }, 'CARTOONIST'], [so, c => k.sodaBottle(c, 0, 20, 1.0), 'SODA AD']];
      const merge = tween(u, bu - 0.2, bu + 0.6, ease.inOut);
      items.forEach(([at, draw, txt], i) => { const p = pop(u, at - 0.2, 0.35); if (p <= 0) return; const x = lerp(180 + i * 290, W / 2, merge), y = lerp(330, 560, merge); ctx.save(); ctx.globalAlpha = 1 - merge * 0.9; ctx.translate(x, y); ctx.scale(p, p); k.circle(ctx, 0, 0, 100, P.paperLight, P.goldLight, 6); draw(ctx); ctx.restore(); if (merge < 0.2) k.label(ctx, txt, 180 + i * 290, 470, 20, p); });
      if (merge > 0) k.figure(ctx, W / 2, 1000, { ...SANTA, s: 1.4 * merge, face: 1, mood: 'happy', armF: [2.6, 0.1] });
      if (merge > 0.7) for (let i = 0; i < 14; i++) { const a = i / 14 * TAU, r = 200 + (u - bu - 0.4) * 300; k.star(ctx, W / 2 + Math.cos(a) * r, 620 + Math.sin(a) * r * 0.8, 11, clamp(1.6 - (u - bu))); }
    },
  },
  { // 52.1 "Every legend has a beginning."
    start: 51.9, title: 'Every Legend Has a Beginning', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W, H } = S, beg = S.at('beginning');
      snowNight(ctx, S, 760);
      const fx = lerp(-260, W + 260, u / 2.2);
      for (let i = 0; i < 8; i++) { const col = i % 2, row = Math.floor(i / 2); k.reindeer(ctx, fx + 230 + row * 95, 360 + col * 40 - row * 18, 0.7, S.t, i); }
      k.sleigh(ctx, fx, 400, 0.85); k.figure(ctx, fx - 10, 370, { ...SANTA, s: 0.42, face: 1, mood: 'happy', armF: [2.2, 0.2] });
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
const bells = (from, n, gap) => Array.from({ length: n }, (_, i) => ({ t: +(from + i * gap).toFixed(3), type: 'chime', gain: 0.25, pitch: 1.4 + (i % 3) * 0.12 }));
export const sfx = [
  ...scenes.slice(1).map(s => ({ t: s.start - 0.05, type: s.trans === 'unroll' ? 'paper' : 'whoosh', gain: 0.35 })),
  { t: 0.3, type: 'chime', gain: 0.4 }, { t: 1.52, type: 'pluck', gain: 0.5 }, { t: 2.96, type: 'stamp', gain: 0.9 },
  { t: 3.96, type: 'stamp', gain: 0.5 }, { t: 5.9, type: 'paper', gain: 0.45 }, { t: 9.2, type: 'pop', gain: 0.5 }, { t: 9.9, type: 'pop', gain: 0.5, pitch: 0.8 },
  ...bells(10.7, 12, 0.22), { t: 11.1, type: 'wind', gain: 0.3 }, ...pops(11.1, 8, 0.08, 0.3),
  { t: 14.0, type: 'stamp', gain: 0.45 }, { t: 15.56, type: 'pluck', gain: 0.5 }, { t: 16.94, type: 'paper', gain: 0.35 }, { t: 17.9, type: 'pop', gain: 0.5 },
  { t: 19.6, type: 'pop', gain: 0.4 }, { t: 20.2, type: 'pop', gain: 0.4 }, { t: 21.68, type: 'chime', gain: 0.6 },
  ...pops(23.0, 6, 0.25, 0.35), { t: 23.3, type: 'stamp', gain: 0.7 },
  { t: 27.48, type: 'stamp', gain: 0.5 }, { t: 29.0, type: 'pop', gain: 0.5 }, { t: 30.46, type: 'pluck', gain: 0.5 }, { t: 31.76, type: 'paper', gain: 0.35 },
  ...pops(34.3, 5, 0.4, 0.35), { t: 37.12, type: 'chime', gain: 0.5 }, ...bells(38.5, 10, 0.2), { t: 39.82, type: 'gong', gain: 0.5 },
  { t: 42.4, type: 'pop', gain: 0.6 }, { t: 42.5, type: 'chime', gain: 0.4 },
  { t: 44.12, type: 'pluck', gain: 0.5 }, { t: 45.26, type: 'chime', gain: 0.6, pitch: 1.3 },
  { t: 46.42, type: 'pop', gain: 0.5 }, { t: 47.18, type: 'pop', gain: 0.5 }, { t: 48.48, type: 'pop', gain: 0.5 }, { t: 49.1, type: 'riser', gain: 0.4 }, { t: 49.6, type: 'gong', gain: 0.8 }, ...bells(49.7, 8, 0.2),
  ...bells(51.9, 6, 0.2), { t: 53.24, type: 'pop', gain: 0.8 }, { t: 53.28, type: 'gong', gain: 0.9 },
];

export const music = {
  bpm: 100, root: 'A', maqam: 'rast', gain: 0.32,
  sections: [
    { from: 0, to: 3.85, mood: 'intro' },
    { from: 3.85, to: 13.5, mood: 'groove' },
    { from: 13.5, to: 26.8, mood: 'drive' },
    { from: 26.8, to: 41.1, mood: 'triumph' },
    { from: 41.1, to: 46.2, mood: 'groove' },
    { from: 46.2, to: 53.24, mood: 'triumph' },
    { from: 53.24, to: 56.0, mood: 'end' },
  ],
};
