// "How Nintendo Started" — an Ottoman miniature chronicle of a Kyoto card shop.
// u = seconds since the scene started; S.at('word') = when that word is said.
import { clamp, lerp, ease, tween, rng, TAU, shake, pop } from '../../lib/core.mjs';
import { land, interior, lamp, bookCover, bigSign, medallion } from '../../styles/ottoman/scenes.mjs';

export const meta = {
  title: 'How Nintendo Started',
  slug: 'nintendo-ottoman',
  style: 'ottoman',
  look: 'night',
  room: 'tent',
  width: 1080, height: 1920, fps: 30,
  duration: 55.4,
  voice: 'voice.mp3',
  seed: 43,
  captionChars: 30,
  brand: { handle: '@HOWITSTARTED-YT1', logo: '../../../brand/logo.png' },
  outro: { at: 53.3, text: 'Subscribe for more origin stories' },
};

const FUSAJIRO = { robe: '#7a4a2a', robeP: 'flowers', robePc: '#e9be6e', inner: '#f7eed6', sash: '#20408f', hat: 'turban', hatColor: '#3d8458', beard: 'long', beardColor: '#9a948a', mustache: true };
const HIROSHI = { robe: '#20408f', robeP: 'cintamani', robePc: '#ecd57a', inner: '#e9be6e', sash: '#c4371f', hat: 'turban', hatColor: '#c4371f', glasses: true };
const YOKOI = { robe: '#d6973a', robeP: 'dots', robePc: '#8e2414', inner: '#f7eed6', sash: '#3d8458', hat: 'turban', hatColor: '#2a9c93', mustache: false };
const MOTIFS = ['blossom', 'moon', 'tulip', 'crane', 'carnation'];
let K; // kit handle for hold callbacks

function shopFront(ctx, S, x, base, s = 1, open = 1) {
  const { k, P } = S;
  ctx.save(); ctx.translate(x, base); ctx.scale(s, s);
  k.house(ctx, 0, 0, 220, 170, { wall: P.paperLight, roof: P.ink, pattern: 'dots' });
  // noren curtain over the door with the shop's sign
  const n = clamp(open);
  ctx.save(); ctx.beginPath(); ctx.rect(-90, -150, 180, 80 * n); ctx.clip();
  for (let i = 0; i < 3; i++) k.rect(ctx, -84 + i * 58, -150, 52, 80, P.lapis, P.ink, 1.5);
  ctx.fillStyle = P.white; ctx.font = '900 22px Deco'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('CARDS', 0, -112);
  ctx.restore();
  ctx.restore();
}

export const scenes = [
  { // 0.0 "Nintendo is 137 years old,"
    start: 0, title: 'Nintendo · 137 Years',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const n = S.at('137'), yr = S.at('years');
      k.goldSky(ctx, -50, -50, W + 100, H + 100, S.t);
      // years racing by: sun and moon wheel across the sky
      for (let i = 0; i < 3; i++) { const q = (u * 0.9 + i / 3) % 1, ax = lerp(-80, W + 80, q), ay = 360 - Math.sin(q * Math.PI) * 260; i % 2 ? k.moon(ctx, ax, ay, 34) : k.sun(ctx, ax, ay, 36, S.t, false); }
      for (let i = 0; i < 3; i++) k.cloud(ctx, 150 + i * 320, 560 + (i % 2) * 40, 1.1, i + 90);
      k.carpet(ctx, 90, 720, W - 180, 300, P.verm, P.lapis);
      const count = Math.round(137 * ease.outCubic(tween(u, n, yr + 0.2, ease.linear)));
      const sc = pop(u, 0.05, 0.4);
      ctx.save(); ctx.translate(W / 2, 520); ctx.scale(sc, sc);
      k.circle(ctx, 0, 0, 170, P.lapis, P.goldLight, 8); k.circle(ctx, 0, 0, 148, null, P.goldLight, 2);
      ctx.fillStyle = P.goldLight; ctx.font = '900 130px Deco'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(count), 0, -6);
      ctx.font = '900 30px Deco'; ctx.fillText('YEARS', 0, 92);
      ctx.restore();
      k.label(ctx, 'NINTENDO', W / 2, 260, 40, tween(u, 0.0, 0.3));
      for (let i = 0; i < 5; i++) k.flowerCard(ctx, 220 + i * 125, 880, 90, (i - 2) * 0.12, MOTIFS[i], i % 2 === 1);
    },
  },
  { // 3.3 "and it started with playing cards."
    start: 3.2, title: 'It Started With Cards', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const st = S.at('started'), cd = S.at('cards');
      ctx.fillStyle = P.lapisDeep; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = k.pattern(ctx, 'cintamani', P.lapisDeep, '#2c4a8f', 60); ctx.fillRect(0, 0, W, H);
      // a fan of illuminated flower cards opens…
      const fan = tween(u, st - 0.4, st + 0.5, ease.outBack);
      for (let i = 0; i < 7; i++) { const a = (i - 3) * 0.22 * fan; ctx.save(); ctx.translate(W / 2, 820); ctx.rotate(a); k.flowerCard(ctx, 0, -230, 170, 0, MOTIFS[i % 5]); ctx.restore(); }
      // …then the deck flies up into the air on "cards"
      if (u > cd - 0.2) { const R = rng(3); for (let i = 0; i < 16; i++) { const q = clamp((u - cd + 0.2 - i * 0.03) / 1.2); if (q <= 0) continue; const a = -Math.PI / 2 + (R() - 0.5) * 2.2, v = 500 + R() * 300; k.flowerCard(ctx, W / 2 + Math.cos(a) * v * q, 600 + Math.sin(a) * v * q + 600 * q * q, 70, q * 8 + i, MOTIFS[i % 5], i % 3 === 0); } }
      k.label(ctx, 'PLAYING CARDS', W / 2, 180, 34, tween(u, cd - 0.1, cd + 0.2));
    },
  },
  { // 7.3 "Kyoto, Japan. Fusajiro Yamauchi opens a small shop"
    start: 7.2, title: 'Kyoto, Japan · 1889', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const ky = S.at('Kyoto'), fu = S.at('Fusajiro'), op = S.at('opens');
      S.cam(lerp(1.12, 1.0, tween(u, 0, 3.2)), W / 2, 560);
      land(ctx, S, { horizon: 330, seed: 91, clouds: 3, hillColors: [P.lav, P.pink, P.sageLight, P.lavLight] });
      // the Kamo river
      ctx.save(); ctx.beginPath(); ctx.moveTo(-20, 900); ctx.bezierCurveTo(300, 840, 600, 960, 960, 880); ctx.lineTo(960, 960); ctx.bezierCurveTo(600, 1040, 300, 920, -20, 980); ctx.closePath(); ctx.clip(); k.waves(ctx, -20, 820, 1000, 260, S.t, P.water, P.waterLight, 24, 22); ctx.restore();
      k.pagoda(ctx, 230, 640, 1.25, S.t);
      for (const [x, y, sc] of [[470, 520, 0.8], [600, 500, 0.75], [420, 700, 0.9]]) k.house(ctx, x, y, 110 * sc, 80 * sc, { wall: P.white, roof: P.ink });
      k.blossomTree(ctx, 90, 860, 300, S.t, 5, P.pink); k.blossomTree(ctx, 860, 640, 260, S.t, 8, P.pink);
      shopFront(ctx, S, 720, 800, 1.0, tween(u, op - 0.1, op + 0.4, ease.outCubic));
      const wx = lerp(420, 560, tween(u, 0.3, op));
      k.figure(ctx, wx, 860, { ...FUSAJIRO, s: 0.85, face: 1, mood: 'happy', walk: u < op ? u * 7 : null, armF: u > op ? [2.0, 0.3] : [0.4, 0.4] });
      k.label(ctx, 'KYOTO · JAPAN', W / 2, 320, 32, tween(u, ky, ky + 0.3));
      k.label(ctx, 'FUSAJIRO YAMAUCHI', wx, 540, 24, tween(u, fu, fu + 0.3));
      k.seal(ctx, 820, 230, 66, ' KYOTO · FOUNDED ·', '1889', tween(u, 0.3, 0.6, ease.linear));
    },
  },
  { // 10.6 "…making Japanese playing cards."
    start: 10.45, title: 'Hand-Painted Cards', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const mk = S.at('making');
      S.cam(lerp(1.0, 1.08, tween(u, 0, 3.4)), W / 2, 560);
      interior(ctx, S, { window: true, carpetColor: P.lapis });
      // finished cards pinned to the wall, one by one
      for (let i = 0; i < 12; i++) { const at = mk - 0.3 + i * 0.16; const p = pop(u, at, 0.3); if (p <= 0) continue; ctx.save(); ctx.translate(140 + (i % 6) * 132, 250 + Math.floor(i / 6) * 190); ctx.scale(p, p); k.flowerCard(ctx, 0, 0, 92, (i % 3 - 1) * 0.06, MOTIFS[i % 5]); ctx.restore(); }
      k.figure(ctx, 330, 990, { ...FUSAJIRO, s: 1.15, face: 1, kneel: true, mood: 'calm', armF: [1.4 + Math.sin(u * 7) * 0.12, 0.6], hold: c => { c.rotate(-0.5); K.rect(c, -3, -50, 6, 56, P.brown, P.ink, 1); } });
      k.rahle(ctx, 520, 990, 200);
      k.flowerCard(ctx, 530, 900, 80, -0.15, 'crane');
      k.label(ctx, 'FUSAJIRO YAMAUCHI', 330, 640, 24, 1);
    },
  },
  { // 14.0 "Decades later, a new boss, Hiroshi Yamauchi, wants more than cards."
    start: 13.9, title: 'A New Boss · 1949', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const hi = S.at('Hiroshi'), mo = S.at('more');
      S.cam(lerp(1.06, 1.0, tween(u, 0, 5)), W / 2, 540);
      interior(ctx, S, { window: true, carpetColor: P.verm });
      k.rect(ctx, 330, 700, 280, 60, P.goldDark, P.ink, 2);
      k.canopy(ctx, 470, 330, 330, 370, P.lapis, S.t);
      k.figure(ctx, 470, 710, { ...HIROSHI, s: 1.15, face: 1, kneel: true, mood: u > mo ? 'happy' : 'calm', look: u > mo ? -0.3 : 0, armF: [lerp(0.6, 2.2, tween(u, mo - 0.3, mo)), 0.2] });
      k.label(ctx, 'HIROSHI YAMAUCHI', 470, 290, 26, tween(u, hi, hi + 0.3), P.goldLight);
      // the old cards pushed aside, new dreams in a cloud
      for (let i = 0; i < 4; i++) k.flowerCard(ctx, lerp(200 + i * 40, 90 + i * 30, tween(u, mo, mo + 0.5)), 900 + i * 6, 70, -0.3 + i * 0.2, MOTIFS[i]);
      const dr = tween(u, mo - 0.1, mo + 0.4, ease.outBack);
      if (dr > 0) { ctx.save(); ctx.translate(760, 470); ctx.scale(dr, dr); for (const [x, y, r] of [[-80, 0, 60], [0, -40, 70], [80, 0, 60], [0, 40, 66]]) k.circle(ctx, x, y, r, P.white, P.lapis, 2.5); for (const [x, y, r] of [[-80, 0, 58], [0, -40, 68], [80, 0, 58], [0, 40, 64]]) k.circle(ctx, x, y, r, P.white, null); k.car(ctx, -40, 20, 0.45, S.t, P.ochre); k.bowl(ctx, 70, 30, 0.4, S.t); ctx.fillStyle = P.verm; ctx.font = '900 54px Deco'; ctx.textAlign = 'center'; ctx.fillText('?', 10, -40); ctx.restore(); }
      k.seal(ctx, 150, 260, 60, ' NEW PRESIDENT · NEW PRESIDENT ·', '1949', tween(u, S.at('boss'), S.at('boss') + 0.3, ease.linear), P.lapis);
    },
  },
  { // 19.2 "Nintendo tries a taxi company."
    start: 19.1, title: 'A Taxi Company', trans: 'wipe',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const tx = S.at('taxi');
      land(ctx, S, { horizon: 330, seed: 93, clouds: 3 });
      k.pagoda(ctx, 820, 560, 0.85, S.t);
      for (let i = 0; i < 4; i++) k.house(ctx, 120 + i * 170, 560, 120, 90, { wall: [P.white, P.pink, P.ochreLight, P.lavLight][i], roof: P.ink });
      // the road
      ctx.fillStyle = P.ochreLight; ctx.fillRect(-10, 700, W + 20, 170); k.rect(ctx, -10, 700, W + 20, 170, null, P.ink, 2);
      ctx.save(); ctx.setLineDash([40, 30]); ctx.beginPath(); ctx.moveTo(0, 785); ctx.lineTo(W, 785); k.stroke(ctx, P.white, 5); ctx.restore();
      const cx = lerp(-200, 620, tween(u, tx - 0.8, tx + 0.6, ease.outCubic));
      k.car(ctx, cx, 860, 1.4, S.t, P.ochre);
      k.label(ctx, 'NINTENDO TAXI', W / 2, 300, 30, tween(u, tx, tx + 0.3));
      k.figure(ctx, 130, 1040, { ...HIROSHI, s: 0.8, face: 1, mood: 'happy', armF: [2.3, 0.2] });
    },
  },
  { // 21.7 "Instant rice."
    start: 21.6, title: 'Instant Rice', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      interior(ctx, S, { window: true, carpetColor: P.green });
      const b = pop(u, 0.05, 0.4);
      ctx.save(); ctx.translate(W / 2, 830); ctx.scale(b, b); k.bowl(ctx, 0, 0, 2.0, S.t); ctx.restore();
      for (const sx of [-1, 1]) { ctx.save(); ctx.translate(W / 2 + 60 + sx * 14, 560); ctx.rotate(0.5 + sx * 0.05); k.rect(ctx, -5, -120, 10, 220, P.brown, P.ink, 1.5); ctx.restore(); }
      k.label(ctx, 'INSTANT RICE', W / 2, 400, 34, tween(u, 0.1, 0.4));
    },
  },
  { // 23.0 "None of it lasts."
    start: 22.85, title: 'None of It Lasts', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const la = S.at('lasts');
      const dim = tween(u, la - 0.1, la + 0.4);
      land(ctx, S, { horizon: 330, seed: 95, clouds: 2 });
      ctx.save(); ctx.fillStyle = `rgba(40,50,80,${0.35 * dim})`; ctx.fillRect(0, 0, W, H); ctx.restore();
      ctx.save(); ctx.globalAlpha = dim; k.cloud(ctx, W / 2 - 40, 150, 2.2, 77, '#9aa3b8', P.ink); ctx.restore();
      // the taxi loses a wheel, the rice bowl tips over
      const f = tween(u, la - 0.3, la + 0.5, ease.inCubic);
      k.car(ctx, 330, 760 + f * 30, 1.2, 0, P.ochre, 'TAXI', f * 60);
      ctx.save(); ctx.translate(700, 860); ctx.rotate(f * 1.6); k.bowl(ctx, 0, 0, 1.1, S.t, P.white, false); ctx.restore();
      if (f > 0.3) for (let i = 0; i < 20; i++) k.ellipse(ctx, 640 + (i * 37) % 260, 900 + (i * 13) % 60, 7, 4, i, P.white, 'rgba(42,28,18,0.4)', 0.8);
      k.stamp(ctx, 'FAILED', W / 2, 420, 84, tween(u, la, la + 0.25, ease.linear), -0.14);
    },
  },
  { // 24.5 "By the mid-1960s, Nintendo is close to going broke."
    start: 24.4, title: 'Close to Broke · 1960s', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const br = S.at('broke');
      S.cam(lerp(1.0, 1.15, tween(u, 0, br + 0.3)), W / 2, 700 + shake(u, br, 8, 0.4));
      interior(ctx, S, { window: false, carpetColor: P.vermDark });
      ctx.save(); ctx.fillStyle = 'rgba(30,35,60,0.35)'; ctx.fillRect(0, 0, W, H); ctx.restore();
      lamp(ctx, S, W / 2, 230, 1 - tween(u, br - 0.2, br + 0.3) * 0.8);
      // the treasury drains, coin by coin
      const coins = 1 - tween(u, 0.3, br - 0.3);
      k.chest(ctx, W / 2, 900, 1.7, 1 - tween(u, br - 0.15, br, ease.inCubic), coins);
      for (let i = 0; i < 8; i++) { const q = ((u * 0.8 + i / 8) % 1); if (u > br) break; k.ellipse(ctx, W / 2 + 200 + q * 160, 760 + q * 260, 12, 6, q * 6, P.goldLight, P.goldDeep, 1); }
      k.figure(ctx, 200, 1010, { ...HIROSHI, s: 1.1, face: 1, mood: 'sad', look: 0.6, armF: [0.3, 0.3] });
      k.stamp(ctx, 'NEARLY BROKE', W / 2, 520, 64, tween(u, br, br + 0.25, ease.linear), 0.1);
    },
  },
  { // 28.8 "Then the boss visits a card factory and spots a young engineer,"
    start: 28.7, title: 'The Card Factory', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const sp = S.at('spots'), en = S.at('engineer');
      S.cam(lerp(1.0, 1.3, tween(u, sp - 0.2, en + 0.3, ease.inOut)), lerp(W / 2, 700, tween(u, sp - 0.2, en + 0.3)), lerp(560, 760, tween(u, sp - 0.2, en + 0.3)));
      interior(ctx, S, { window: true, carpet: false });
      // stacks of cards and workers at long tables
      for (let r = 0; r < 2; r++) { k.rect(ctx, 80, 720 + r * 170, 780, 20, P.brownLight, P.ink, 2); for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) k.flowerCard(ctx, 140 + i * 130, 700 + r * 170 - j * 6, 46, 0, MOTIFS[(i + j) % 5], j < 3); }
      for (let i = 0; i < 2; i++) k.figure(ctx, 250 + i * 260, 880, { s: 0.7, face: 1, robe: [P.green, P.lav][i], robeP: 'dots', hat: 'cap', hatColor: P.ochre, armF: [1.4 + Math.sin(u * 8 + i) * 0.2, 0.5] });
      // the young engineer, off to the side, tinkering
      k.figure(ctx, 760, 1000, { ...YOKOI, s: 0.95, face: -1, mood: 'happy', armF: [1.5, 0.2] });
      k.ultraHand(ctx, 700, 830, 0.6, Math.PI, 0.5 + 0.4 * Math.sin(u * 3), 0);
      const boss = lerp(-120, 220, tween(u, 0, 1.8));
      k.figure(ctx, boss, 1010, { ...HIROSHI, s: 1.0, face: 1, walk: u < 1.8 ? u * 7 : null, mood: 'calm', look: u > sp ? -0.2 : 0 });
      const ring = tween(u, sp, sp + 0.4, ease.outBack);
      if (ring > 0) { ctx.beginPath(); ctx.arc(740, 810, 190 * ring, 0, TAU); k.stroke(ctx, P.goldLight, 8); k.stroke(ctx, P.ink, 2); medallion(ctx, k, P, '!', 880, 600, ring * 0.8, P.verm); }
    },
  },
  { // 32.9 "Gunpei Yokoi, playing with an arm he built for fun."
    start: 32.8, title: 'Gunpei Yokoi', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const gy = S.at('Gunpei'), ar = S.at('arm'), fn = S.at('fun');
      S.cam(lerp(1.05, 1.0, tween(u, 0, 3.4)), W / 2, 560);
      interior(ctx, S, { window: true, carpetColor: P.green });
      // the arm stretches across the room and snatches a ball
      const ext = 0.35 + 0.6 * tween(u, ar - 0.6, ar + 0.2, ease.inOut) - 0.6 * tween(u, fn - 0.2, fn + 0.5, ease.inOut);
      const grip = tween(u, ar + 0.1, ar + 0.3);
      const [ex, ey] = k.ultraHand(ctx, 330, 760, 1.15, -0.08, ext, grip, P.ochre);
      const held = u > ar + 0.25;
      k.circle(ctx, held ? ex - 8 : 760, held ? ey : 880, 26, P.verm, P.ink, 2.5);
      k.figure(ctx, 230, 1010, { ...YOKOI, s: 1.2, face: 1, mood: 'happy', armF: [1.5, 0.3] });
      k.label(ctx, 'GUNPEI YOKOI', 250, 560, 28, tween(u, gy, gy + 0.3));
      if (u > fn - 0.1) for (let i = 0; i < 10; i++) { const a = i / 10 * TAU, r = 60 + (u - fn) * 300; k.star(ctx, 760 + Math.cos(a) * r, 760 + Math.sin(a) * r * 0.7, 10, 1 - (u - fn)); }
    },
  },
  { // 36.5 "He tells him, turn it into a toy."
    start: 36.35, title: 'Turn It Into a Toy', trans: 'wipe',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const tn = S.at('turn'), ty = S.at('toy');
      interior(ctx, S, { window: true, carpetColor: P.lapis });
      k.figure(ctx, 230, 1010, { ...HIROSHI, s: 1.15, face: 1, mood: 'happy', armF: [lerp(0.6, 1.7, tween(u, tn - 0.4, tn)), 0] });
      k.figure(ctx, 740, 1010, { ...YOKOI, s: 1.1, face: -1, mood: 'happy', armF: [1.3, 0.4] });
      // the arm folds itself into a box
      const bx = tween(u, ty - 0.1, ty + 0.4, ease.outBack);
      if (bx < 1) k.ultraHand(ctx, 600, 780, lerp(0.8, 0.3, bx), Math.PI, lerp(0.6, 0, bx), 0);
      if (bx > 0) { ctx.save(); ctx.translate(500, 860); ctx.scale(bx, bx); k.toyBox(ctx, 0, 0, 260, 340, 'ULTRA HAND', P.verm); k.ultraHand(ctx, -90, -230, 0.32, 0, 0.6, 0); ctx.restore(); }
      const qk = tween(u, tn - 0.1, tn + 0.3, ease.outBack);
      if (qk > 0) { ctx.save(); ctx.translate(W / 2, 330); ctx.scale(qk, qk); k.cartouche(ctx, 0, 0, 760, 120, P.paperLight, P.goldDark, 5); ctx.fillStyle = P.verm; ctx.font = 'italic 700 58px GaramondItalic'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('“Turn it into a toy!”', 0, 4); ctx.restore(); }
    },
  },
  { // 39.5 "The Ultra Hand sells over a million."
    start: 39.35, title: 'Ultra Hand · 1966', trans: 'flash',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const ml = S.at('million'), se = S.at('sells');
      S.cam(lerp(1.1, 1.0, tween(u, 0, 3)), W / 2, 560);
      land(ctx, S, { horizon: 300, seed: 97, clouds: 2 });
      // kids everywhere grabbing things with their Ultra Hands
      const kids = [[150, 960, 1], [390, 1010, 1], [620, 980, -1], [840, 1000, -1]];
      kids.forEach(([x, y, f], i) => {
        k.figure(ctx, x, y, { s: 0.62, face: f, robe: [P.green, P.verm, P.lav, P.turq][i], robeP: 'dots', hat: i % 2 ? 'fez' : 'turban', hatColor: P.lapis, mood: 'happy', armF: [1.5, 0.1], bob: -Math.abs(Math.sin(u * 6 + i)) * 8 });
        k.ultraHand(ctx, x + f * 40, y - 160, 0.45, f > 0 ? -0.3 : Math.PI + 0.3, 0.5 + 0.45 * Math.sin(u * 4 + i), 0.5 + 0.5 * Math.sin(u * 4 + i));
      });
      // the count
      const n = Math.round(1000000 * ease.outCubic(tween(u, se - 0.2, ml + 0.2, ease.linear)) / 1000) * 1000;
      k.cartouche(ctx, W / 2, 430, 640, 140, P.lapis, P.goldLight, 6);
      ctx.fillStyle = P.goldLight; ctx.font = '900 70px Deco'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(n.toLocaleString('en-US') + (u > ml + 0.2 ? '+' : ''), W / 2, 436);
      k.seal(ctx, 820, 230, 62, ' ULTRA HAND · ULTRA HAND ·', '1966', tween(u, 0.2, 0.5, ease.linear));
    },
  },
  { // 42.5 "And that engineer? He later led the team behind the Game Boy,"
    start: 42.35, title: 'That Engineer?', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const en = S.at('engineer'), ld = S.at('led');
      S.cam(lerp(1.15, 1.0, tween(u, ld - 0.4, ld + 0.6, ease.inOut)), W / 2, lerp(640, 560, tween(u, ld - 0.4, ld + 0.6)));
      k.goldSky(ctx, -60, -60, W + 120, H + 120, S.t);
      k.carpet(ctx, 90, 760, W - 180, 260, P.verm, P.lapis);
      // his team gathers behind him
      for (let i = 0; i < 4; i++) { const p = tween(u, ld + i * 0.12, ld + 0.3 + i * 0.12, ease.outBack); if (p <= 0) continue; k.figure(ctx, 170 + i * 200 + (i > 1 ? 120 : 0), 860, { s: 0.85 * p, face: i < 2 ? 1 : -1, robe: [P.green, P.lav, P.lapisLight, P.pink][i], robeP: 'dots', hat: 'turban', hatColor: [P.verm, P.green, P.ochre, P.lapis][i], beard: i % 2 ? 'short' : 'none', mood: 'happy', armF: [1.0, 0.6] }); }
      k.figure(ctx, W / 2, 1000, { ...YOKOI, s: 1.25, face: 1, mood: 'happy', armF: [u > ld ? 2.6 : 0.6, 0.2] });
      medallion(ctx, k, P, '?', W / 2, 300, pop(u, en, 0.35) * (1 - tween(u, ld, ld + 0.3)) * 1.2);
      k.label(ctx, "YOKOI'S TEAM", W / 2, 300, 32, tween(u, ld + 0.3, ld + 0.6));
    },
  },
  { // 45.7 "…the Game Boy,"
    start: 45.55, title: 'The Game Boy · 1989', trans: 'flash',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const gb = S.at('Game');
      k.goldSky(ctx, -60, -60, W + 120, H + 120, S.t);
      ctx.save(); ctx.translate(W / 2, 520); for (let i = 0; i < 24; i++) { ctx.rotate(TAU / 24); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-34, 900); ctx.lineTo(34, 900); ctx.closePath(); ctx.fillStyle = 'rgba(255,250,210,0.3)'; ctx.fill(); } ctx.restore();
      k.rect(ctx, W / 2 - 170, 820, 340, 70, P.goldDark, P.ink, 2.5); k.carpet(ctx, W / 2 - 220, 890, 440, 120, P.verm, P.lapis);
      const p = tween(u, gb - 0.15, gb + 0.3, ease.outBack);
      ctx.save(); ctx.translate(W / 2, lerp(900, 560, p)); ctx.rotate(Math.sin(u * 2) * 0.04); k.handheld(ctx, 0, 0, 1.45 * Math.max(0.01, p), 0, S.t, p); ctx.restore();
      k.seal(ctx, 800, 220, 64, ' HANDHELD · HANDHELD ·', '1989', tween(u, gb, gb + 0.3, ease.linear));
    },
  },
  { // 47.1 "a card shop that became a gaming giant."
    start: 46.95, title: 'A Gaming Giant', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const bc = S.at('became'), gi = S.at('giant');
      const g = tween(u, bc - 0.2, gi + 0.2, ease.inOut);
      S.cam(lerp(1.4, 0.95, g), W / 2, lerp(820, 600, g));
      land(ctx, S, { horizon: 360, seed: 99, clouds: 3 });
      // the palace grows behind the little card shop
      ctx.save(); ctx.translate(W / 2, 860); ctx.scale(Math.max(0.01, g), Math.max(0.01, g));
      k.rect(ctx, -360, -380, 720, 380, P.paperLight, P.ink, 3);
      ctx.fillStyle = k.pattern(ctx, 'tiles', P.white, P.lapisLight, 44); ctx.fillRect(-356, -200, 712, 196);
      k.dome(ctx, 0, -380, 130, P.lapisLight);
      for (const x of [-260, 260]) { ctx.beginPath(); ctx.moveTo(x - 110, -380); ctx.quadraticCurveTo(x - 40, -400, x, -460); ctx.quadraticCurveTo(x + 40, -400, x + 110, -380); ctx.closePath(); k.fillStroke(ctx, P.ink, P.ink, 2); ctx.beginPath(); ctx.moveTo(x - 110, -380); ctx.quadraticCurveTo(x, -392, x + 110, -380); k.stroke(ctx, P.goldLight, 3); }
      for (const x of [-430, 430]) k.pagoda(ctx, x, 0, 1.5, S.t);
      for (let i = 0; i < 5; i++) k.arch(ctx, -280 + i * 140, -20, 70, 130, P.lapis);
      // banners: a flower card and a handheld
      for (const [x, kind] of [[-180, 0], [180, 1]]) { k.rect(ctx, x - 50, -340, 100, 140, P.verm, P.ink, 2); if (kind) k.handheld(ctx, x, -270, 0.3, 0, S.t, 1); else k.flowerCard(ctx, x, -270, 60, 0, 'crane'); }
      ctx.restore();
      shopFront(ctx, S, W / 2, 1000, 0.8, 1);
      k.label(ctx, 'A GAMING GIANT', W / 2, 260, 34, tween(u, gi, gi + 0.3));
      if (u > gi) for (let i = 0; i < 16; i++) { const a = i / 16 * TAU, r = 150 + (u - gi) * 420; k.star(ctx, W / 2 + Math.cos(a) * r, 560 + Math.sin(a) * r * 0.7, 12, 1 - (u - gi) * 0.7); }
    },
  },
  { // 51.4 "Every legend has a beginning."
    start: 51.2, title: 'Every Legend Has a Beginning', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W, H } = S, beg = S.at('beginning');
      ctx.save();
      S.cam(lerp(1.0, 1.4, tween(u, 0, beg)), W / 2, lerp(620, 760, tween(u, 0, beg)));
      interior(ctx, S, { window: true, carpetColor: P.lapis });
      const g = ctx.createRadialGradient(W / 2, 800, 10, W / 2, 800, 240); g.addColorStop(0, 'rgba(255,240,170,0.85)'); g.addColorStop(1, 'rgba(255,240,170,0)');
      ctx.fillStyle = g; ctx.fillRect(W / 2 - 250, 560, 500, 500);
      k.flowerCard(ctx, W / 2, 800, 130, Math.sin(u * 2) * 0.05, 'blossom');
      k.figure(ctx, 190, 1000, { ...FUSAJIRO, s: 1.1, face: 1, kneel: true, mood: 'happy', armF: [1.6, 0.4] });
      k.figure(ctx, 760, 1000, { ...YOKOI, s: 1.1, face: -1, mood: 'happy', armF: [1.6, 0.4] });
      ctx.restore();
      const open = tween(u, beg - 0.1, beg + 0.55, ease.inOut);
      if (open > 0) {
        ctx.save(); ctx.beginPath(); ctx.arc(W / 2, 560, open * 900, 0, TAU); ctx.clip(); bookCover(ctx, S, u - beg); ctx.restore();
        if (open < 1) { ctx.beginPath(); ctx.arc(W / 2, 560, open * 900, 0, TAU); k.stroke(ctx, P.goldLight, 8); }
      }
    },
  },
];
// hold callbacks need the kit; scenes get it as S.k, this keeps it handy
import * as kit from '../../styles/ottoman/kit.mjs';
K = kit;

// ---------- sound ----------
const pops = (from, n, gap, gain = 0.5) => Array.from({ length: n }, (_, i) => ({ t: +(from + i * gap).toFixed(3), type: 'pop', gain, pitch: 1 + (i % 4) * 0.12 }));
export const sfx = [
  ...scenes.slice(1).map(s => ({ t: s.start - 0.05, type: s.trans === 'unroll' ? 'paper' : 'whoosh', gain: 0.35 })),
  { t: 0.1, type: 'gong', gain: 0.6 }, { t: 0.9, type: 'riser', gain: 0.3 }, { t: 2.5, type: 'chime', gain: 0.5 },
  { t: 3.7, type: 'paper', gain: 0.5 }, { t: 5.6, type: 'paper', gain: 0.5 }, ...pops(5.8, 8, 0.06, 0.3),
  { t: 7.32, type: 'chime', gain: 0.35 }, { t: 7.6, type: 'stamp', gain: 0.5 }, { t: 8.94, type: 'pluck', gain: 0.5 }, { t: 10.0, type: 'paper', gain: 0.45 },
  ...pops(11.5, 12, 0.16, 0.3),
  { t: 15.88, type: 'pluck', gain: 0.5, pitch: 1.26 }, { t: 15.3, type: 'stamp', gain: 0.5 }, { t: 17.42, type: 'chime', gain: 0.45 },
  { t: 19.8, type: 'riser', gain: 0.3 }, { t: 20.3, type: 'clank', gain: 0.4 },
  { t: 21.65, type: 'pop', gain: 0.6 }, { t: 21.7, type: 'sizzle', gain: 0.25 },
  { t: 23.1, type: 'clank', gain: 0.5 }, { t: 23.36, type: 'flop', gain: 0.6 }, { t: 23.4, type: 'stamp', gain: 0.8 }, { t: 23.8, type: 'crack', gain: 0.4 },
  { t: 24.6, type: 'coins', gain: 0.3 }, { t: 25.6, type: 'coins', gain: 0.25 }, { t: 26.2, type: 'thunder', gain: 0.35 }, { t: 27.54, type: 'thud', gain: 0.8 }, { t: 27.56, type: 'stamp', gain: 0.6 },
  { t: 29.3, type: 'clank', gain: 0.3 }, { t: 31.14, type: 'chime', gain: 0.55 }, { t: 31.2, type: 'riser', gain: 0.3 },
  { t: 32.9, type: 'pluck', gain: 0.5 }, { t: 34.5, type: 'slide', gain: 0.45 }, { t: 35.2, type: 'clank', gain: 0.5 }, { t: 35.8, type: 'pop', gain: 0.6 },
  { t: 37.72, type: 'gong', gain: 0.5 }, { t: 38.3, type: 'pop', gain: 0.7 }, { t: 38.4, type: 'paper', gain: 0.4 },
  { t: 39.6, type: 'chime', gain: 0.4 }, { t: 40.2, type: 'coins', gain: 0.35 }, { t: 41.28, type: 'coins', gain: 0.55 }, { t: 41.3, type: 'chime', gain: 0.5 },
  { t: 42.76, type: 'pluck', gain: 0.5 }, ...pops(44.3, 4, 0.12, 0.45),
  { t: 45.5, type: 'riser', gain: 0.4 }, { t: 45.7, type: 'gong', gain: 0.8 }, { t: 45.75, type: 'chime', gain: 0.5 },
  { t: 48.3, type: 'riser', gain: 0.35 }, { t: 49.68, type: 'gong', gain: 0.6 }, { t: 49.7, type: 'coins', gain: 0.4 },
  { t: 52.44, type: 'pop', gain: 0.8 }, { t: 52.48, type: 'gong', gain: 0.9 },
];

export const music = {
  bpm: 98, root: 'G', maqam: 'rast', gain: 0.32,
  sections: [
    { from: 0, to: 7.2, mood: 'intro' },
    { from: 7.2, to: 19.1, mood: 'groove' },
    { from: 19.1, to: 22.85, mood: 'drive' },
    { from: 22.85, to: 28.7, mood: 'sad' },
    { from: 28.7, to: 39.35, mood: 'drive' },
    { from: 39.35, to: 52.45, mood: 'triumph' },
    { from: 52.45, to: 55.4, mood: 'end' },
  ],
};
