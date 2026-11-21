// "How Basketball Started" — an Ottoman miniature chronicle of two peach baskets.
// u = seconds since the scene started; S.at('word') = when that word is said.
import { clamp, lerp, ease, tween, rng, TAU, shake, pop } from '../../lib/core.mjs';
import { land, interior, lamp, bookCover, compassRose, medallion } from '../../styles/ottoman/scenes.mjs';

export const meta = {
  title: 'How Basketball Started',
  slug: 'basketball-ottoman',
  style: 'ottoman',
  width: 1080, height: 1920, fps: 30,
  duration: 54.8,
  voice: 'voice.mp3',
  seed: 53,
  captionChars: 30,
  brand: { handle: '@HOWITSTARTED-YT1', logo: '../../../brand/logo.png' },
  outro: { at: 52.8, text: 'Subscribe for more origin stories' },
};

const NAISMITH = { robe: '#3d8458', robeP: 'cintamani', robePc: '#ecd57a', inner: '#f7eed6', sash: '#c4371f', hat: 'turban', hatColor: '#20408f', mustache: true };
const BOSS = { robe: '#20408f', robeP: 'dots', robePc: '#ecd57a', inner: '#e9be6e', hat: 'turban', hatColor: '#c4371f', beard: 'short', glasses: true };
const RED = { robe: '#c4371f', robeP: 'dots', robePc: '#f7eed6', hat: 'cap', hatColor: '#d6973a' };
const BLUE = { robe: '#3f68bd', robeP: 'dots', robePc: '#f7eed6', hat: 'cap', hatColor: '#f8f2e2' };
const SKINS = ['#f1d1a8', '#e2b48a', '#f1d1a8', '#d9a878', '#f1d1a8'];
const PEACH = '#f0a060';

// The gymnasium: a palace hall with a balcony railing and a basket at each end.
function gym(ctx, S, o = {}) {
  const { k, P, W, H } = S;
  interior(ctx, S, { carpet: false, window: o.window ?? true });
  ctx.fillStyle = '#d9a866'; ctx.fillRect(0, 770, W, H - 770);
  for (let x = -40; x < W + 40; x += 70) { ctx.beginPath(); ctx.moveTo(x, 770); ctx.lineTo(x - 30, H); k.stroke(ctx, '#b8864a', 2); }
  ctx.beginPath(); ctx.ellipse(W / 2, 900, 120, 40, 0, 0, TAU); k.stroke(ctx, P.verm, 4);
  ctx.beginPath(); ctx.moveTo(W / 2, 780); ctx.lineTo(W / 2, H); k.stroke(ctx, P.verm, 4);
  k.railing(ctx, -10, W + 10, 300, 60);
  if (o.baskets !== false) for (const [x, i] of [[90, 0], [W - 90, 1]]) k.peachBasket(ctx, x, 440, 0.95, 0, o.ballIn === i);
}
function runner(ctx, S, x, y, team, i, u, ball = false) {
  const { k } = S;
  k.figure(ctx, x, y, { ...team, s: 0.55, face: team === RED ? 1 : -1, skin: SKINS[i % 5], walk: u * 10 + i, mood: 'happy', armF: [1.8 + Math.sin(u * 8 + i) * 0.5, 0.3], hold: ball ? c => k.leatherBall(c, 6, -10, 1.0) : null });
}

export const scenes = [
  { // 0.0 "Basketball started with two peach baskets."
    start: 0, title: 'Two Peach Baskets',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const two = S.at('two'), pb = S.at('baskets');
      S.cam(lerp(1.15, 1.0, tween(u, 0, 4)), W / 2, 560);
      land(ctx, S, { horizon: 380, seed: 111, clouds: 3 });
      k.blossomTree(ctx, 170, 880, 380, S.t, 3, PEACH);
      k.blossomTree(ctx, 800, 860, 360, S.t, 7, PEACH);
      // ripe peaches hang in both crowns
      const pr = rng(17);
      for (const [tx, ty] of [[170, 600], [800, 590]]) for (let i = 0; i < 14; i++) { const a = pr() * TAU, r = 30 + pr() * 120; k.circle(ctx, tx + Math.cos(a) * r, ty + Math.sin(a) * r * 0.6, 13 * pop(u, 0.1 + i * 0.05, 0.3), i % 2 ? PEACH : '#e8844a', P.ink, 1.2); }
      // two baskets fill with peaches, then a ball drops into one
      for (const [x, i] of [[340, 0], [610, 1]]) { const p = pop(u, two - 0.1 + i * 0.15, 0.35); if (p <= 0) continue; k.peachBasket(ctx, x, 960, 1.6 * p, tween(u, two + 0.2, pb + 0.3), i === 1 && u > pb + 0.4); }
      const bq = tween(u, pb - 0.2, pb + 0.4, ease.inQuad);
      if (bq > 0 && bq < 1) k.leatherBall(ctx, 610, lerp(120, 830, bq), 1.4, u * 6);
      k.label(ctx, 'BASKETBALL', W / 2, 260, 40, tween(u, 0.0, 0.3));
      k.label(ctx, 'TWO PEACH BASKETS', W / 2, 1010, 26, tween(u, pb, pb + 0.3));
    },
  },
  { // 4.4 "Springfield, Massachusetts."
    start: 4.3, title: 'Springfield, Massachusetts', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const sp = S.at('Springfield');
      S.cam(lerp(1.1, 1.0, tween(u, 0, 1.9)), W / 2, 560);
      land(ctx, S, { horizon: 330, seed: 113, clouds: 2, ground: '#e8eef0', hillColors: ['#dfe6ee', P.lavLight, '#eef2f4'], density: 0.3 });
      // the training school: a brick hall with a bell tower
      k.house(ctx, W / 2, 760, 420, 260, { wall: '#b5553a', roof: P.white, pattern: 'dots', chimney: true });
      k.rect(ctx, W / 2 - 40, 380, 80, 150, '#b5553a', P.ink, 2); ctx.beginPath(); ctx.moveTo(W / 2 - 50, 380); ctx.lineTo(W / 2, 300); ctx.lineTo(W / 2 + 50, 380); ctx.closePath(); k.fillStroke(ctx, P.white, P.ink, 2);
      for (const [x, y] of [[150, 620], [790, 640], [130, 880], [830, 900]]) k.house(ctx, x, y, 140, 100, { wall: [P.white, P.ochreLight, P.pink][(x + y) % 3], roof: P.white });
      k.cypress(ctx, 300, 900, 200, S.t, 1); k.cypress(ctx, 660, 910, 190, S.t, 2);
      k.snow(ctx, 0, 0, W, H, S.t, 90);
      k.label(ctx, 'SPRINGFIELD · MASSACHUSETTS', W / 2, 220, 28, tween(u, sp, sp + 0.3));
      k.seal(ctx, 820, 1000, 62, ' SPRINGFIELD · SPRINGFIELD ·', '1891', tween(u, 0.3, 0.6, ease.linear));
    },
  },
  { // 6.4 "It's winter. Too cold to play outside."
    start: 6.2, title: "It's Winter", trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const tc = S.at('cold');
      land(ctx, S, { horizon: 330, seed: 115, clouds: 3, ground: '#e8eef0', hillColors: ['#dfe6ee', P.lavLight, '#eef2f4'], density: 0.2 });
      ctx.save(); ctx.fillStyle = 'rgba(160,190,220,0.25)'; ctx.fillRect(0, 0, W, H); ctx.restore();
      // students shivering in the snow
      for (let i = 0; i < 5; i++) { const x = 130 + i * 170 + Math.sin(u * 40 + i) * 3 * tween(u, tc - 0.3, tc); k.figure(ctx, x, 980 - (i % 2) * 30, { ...(i % 2 ? RED : BLUE), s: 0.75, face: i < 2 ? 1 : -1, skin: SKINS[i], mood: u > tc ? 'sad' : 'calm', armF: [0.9, 1.9], armB: [0.9, 1.9] }); }
      // icicles grow on the label
      k.snow(ctx, 0, 0, W, H, S.t * 1.8, 160, 9);
      const bk = tween(u, tc - 0.1, tc + 0.3, ease.outBack);
      if (bk > 0) { ctx.save(); ctx.translate(W / 2, 330); ctx.scale(bk, bk); k.cartouche(ctx, 0, 0, 560, 110, '#dfeef6', P.lapis, 5); ctx.fillStyle = P.lapis; ctx.font = '900 52px Deco'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('TOO COLD!', 0, 4); for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.moveTo(-200 + i * 50, 52); ctx.lineTo(-192 + i * 50, 52 + 20 + (i % 3) * 10 * tween(u, tc, tc + 1)); ctx.lineTo(-184 + i * 50, 52); ctx.closePath(); k.fillStroke(ctx, '#e8f4fa', P.lapis, 1.2); } ctx.restore(); }
    },
  },
  { // 9.6 "A young gym teacher, James Naismith, gets a challenge from his boss."
    start: 9.4, title: 'James Naismith', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const jn = S.at('James'), bo = S.at('boss'), ch = S.at('challenge');
      S.cam(lerp(1.0, 1.08, tween(u, 0, 4.5)), W / 2, 580);
      gym(ctx, S, { baskets: false });
      k.figure(ctx, 280, 1010, { ...NAISMITH, s: 1.2, face: 1, mood: 'calm', armF: [0.6, 0.6], look: u > bo ? 0.1 : 0 });
      k.label(ctx, 'JAMES NAISMITH', 280, 560, 28, tween(u, jn, jn + 0.3));
      const bx = lerp(1100, 700, tween(u, ch - 0.6, ch + 0.2, ease.outCubic));
      k.figure(ctx, bx, 1010, { ...BOSS, s: 1.15, face: -1, mood: 'calm', armF: [1.6, 0.1], hold: c => { c.rotate(-0.2); k.rect(c, -10, -60, 20, 110, P.paperLight, P.ink, 2); }, walk: u < ch + 0.2 ? u * 7 : null });
      k.label(ctx, 'HIS BOSS', bx, 580, 24, tween(u, bo, bo + 0.3));
      if (u > ch) medallion(ctx, k, P, '!', W / 2, 400, pop(u, ch, 0.35), P.verm);
    },
  },
  { // 14.1 "Invent an indoor game to keep his students active."
    start: 13.95, title: 'The Challenge', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const ig = S.at('indoor'), ac = S.at('active');
      gym(ctx, S, { baskets: false });
      // restless students bouncing around the hall
      for (let i = 0; i < 6; i++) { const x = 120 + i * 140 + Math.sin(u * 3 + i) * 30, hop = Math.abs(Math.sin(u * 7 + i)) * 24 * tween(u, ac - 0.5, ac); k.figure(ctx, x, 1010 - (i % 2) * 40 - hop, { ...(i % 2 ? RED : BLUE), s: 0.6, face: i % 2 ? -1 : 1, skin: SKINS[i % 5], mood: 'happy', armF: [2.4 + Math.sin(u * 6 + i) * 0.4, 0.3] }); }
      // the order, on a scroll
      const un = tween(u, 0.1, ig + 0.4, ease.inOut);
      k.rect(ctx, 150, 340, 640, 22, P.brownLight, P.ink, 2);
      ctx.save(); ctx.beginPath(); ctx.rect(160, 362, 620, 260 * un); ctx.clip();
      k.rect(ctx, 160, 362, 620, 260, P.paperLight, P.ink, 2);
      ctx.fillStyle = P.verm; ctx.font = '900 50px Deco'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('INVENT AN', W / 2, 430); ctx.fillText('INDOOR GAME', W / 2, 500);
      ctx.fillStyle = P.ink; ctx.font = '700 28px Fell'; ctx.fillText('to keep the students active', W / 2, 570);
      ctx.restore(); k.rect(ctx, 150, 362 + 260 * un - 6, 640, 20, P.brownLight, P.ink, 2);
    },
  },
  { // 17.6 "Fun fact, Naismith wasn't even American. He was Canadian."
    start: 17.45, title: 'Fun Fact', trans: 'flash',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const ff = S.at('Fun'), ca = S.at('Canadian'), am = S.at('American');
      k.goldSky(ctx, -60, -60, W + 120, H + 120, S.t);
      for (let i = 0; i < 3; i++) k.cloud(ctx, 150 + i * 320, 150 + (i % 2) * 60, 1.1, i + 130);
      k.carpet(ctx, 120, 800, W - 240, 220, P.verm, P.lapis);
      k.figure(ctx, 300, 1000, { ...NAISMITH, s: 1.25, face: 1, mood: 'happy', armF: [u > ca ? 2.6 : 1.2, 0.2] });
      medallion(ctx, k, P, '!', 300, 330, pop(u, ff, 0.35) * (1 - tween(u, am - 0.1, am + 0.2)), P.lapis);
      k.label(ctx, 'NOT AMERICAN…', 300, 330, 28, tween(u, am, am + 0.3) * (1 - tween(u, ca - 0.1, ca + 0.1)));
      // the maple leaf falls into place on "Canadian"
      const ml = tween(u, ca - 0.3, ca + 0.3, ease.outBack);
      if (ml > 0) { ctx.save(); ctx.translate(680, lerp(200, 520, ml)); ctx.rotate((1 - ml) * 2); k.circle(ctx, 0, 0, 150, P.white, P.goldLight, 8); k.mapleLeaf(ctx, 0, -6, 2.0, P.verm); ctx.restore(); k.label(ctx, 'CANADIAN', 680, 720, 34, tween(u, ca, ca + 0.3)); }
    },
  },
  { // 21.9 "He grabs a soccer ball."
    start: 21.65, title: 'A Soccer Ball', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const gr = S.at('grabs');
      S.cam(lerp(1.0, 1.2, tween(u, 0, 1.5)), 420, 640);
      gym(ctx, S, { baskets: false });
      const has = u > gr + 0.1;
      k.figure(ctx, 330, 1010, { ...NAISMITH, s: 1.2, face: 1, mood: 'happy', armF: has ? [2.2, -0.2] : [1.0, 0.6], hold: has ? c => k.leatherBall(c, 14, -14, 1.4) : null });
      if (!has) k.leatherBall(ctx, 560, 960 - Math.abs(Math.sin(u * 8)) * 60, 1.4, u * 5);
      k.label(ctx, 'A SOCCER BALL', 470, 420, 30, tween(u, gr, gr + 0.3));
    },
  },
  { // 23.5 "He nails two peach baskets ten feet up."
    start: 23.2, title: 'Ten Feet Up', trans: 'wipe',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const na = S.at('nails'), te = S.at('ten');
      S.cam(lerp(1.0, 1.06, tween(u, 0, 2.7)), W / 2, 560);
      gym(ctx, S, { baskets: false });
      // the baskets go up one after the other
      for (const [x, i] of [[W - 90, 0], [90, 1]]) { const p = tween(u, na - 0.3 + i * 0.6, na + 0.1 + i * 0.6, ease.outBack); if (p > 0) k.peachBasket(ctx, x, lerp(800, 440, Math.min(1, p)), 0.95, 0, false); }
      k.ladder(ctx, W - 190, 320, 1010, 80);
      const hamm = Math.sin(u * 16) * 0.5;
      k.figure(ctx, W - 230, 640, { ...NAISMITH, s: 0.85, face: 1, armF: [2.4 + hamm, 0.3], hold: c => { c.rotate(0.6 + hamm); k.rect(c, -4, -40, 8, 46, P.brown, P.ink, 1.2); k.rect(c, -14, -50, 28, 14, P.steel, P.ink, 1.2); } });
      // the 10-foot measuring line
      const m = tween(u, te - 0.2, te + 0.4);
      if (m > 0) { ctx.beginPath(); ctx.moveTo(200, 1010); ctx.lineTo(200, lerp(1010, 440, m)); k.stroke(ctx, P.verm, 5); for (let i = 0; i <= 10 * m; i++) { ctx.beginPath(); ctx.moveTo(190, 1010 - i * 57); ctx.lineTo(210, 1010 - i * 57); k.stroke(ctx, P.verm, 3); } }
      k.label(ctx, '10 FEET', 330, 700, 34, tween(u, te, te + 0.3));
    },
  },
  { // 26.2 "He writes 13 rules."
    start: 26.0, title: 'Thirteen Rules', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const ru = S.at('rules');
      ctx.fillStyle = P.paperLight; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = k.pattern(ctx, 'flowers', P.paperLight, '#e6d6ad', 40); ctx.fillRect(0, 0, W, H);
      k.rect(ctx, 150, 120, 640, 860, P.white, P.ink, 3);
      ctx.fillStyle = P.verm; ctx.font = '900 46px Deco'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('XIII RULES', W / 2, 180);
      const N = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII'];
      for (let i = 0; i < 13; i++) {
        const k2 = tween(u, 0.1 + i * 0.12, 0.3 + i * 0.12); if (k2 <= 0) continue;
        ctx.fillStyle = P.lapis; ctx.font = '900 26px Deco'; ctx.textAlign = 'right'; ctx.fillText(N[i], 250, 245 + i * 54);
        ctx.beginPath(); ctx.moveTo(270, 245 + i * 54); ctx.lineTo(270 + 470 * k2 * (0.7 + (i % 3) * 0.1), 245 + i * 54); k.stroke(ctx, P.grey, 4);
      }
      k.quill(ctx, lerp(300, 720, (u * 1.4) % 1), 240 + Math.min(12, Math.floor(u / 0.12)) * 54, 1.0, 0.5);
      k.seal(ctx, 780, 930, 70, ' THIRTEEN RULES · 13 ·', '13', tween(u, ru, ru + 0.3, ease.linear));
    },
  },
  { // 28.5 "Then the class plays the very first game. December 21st."
    start: 28.35, title: 'The First Game', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const de = S.at('December');
      S.cam(lerp(1.08, 1.0, tween(u, 0, 4.8)), W / 2, 580);
      gym(ctx, S);
      const R = rng(21);
      const bx = W / 2 + Math.sin(u * 2.2) * 300, by = 760 - Math.abs(Math.sin(u * 5)) * 120;
      for (let i = 0; i < 8; i++) { const team = i % 2 ? RED : BLUE, x = W / 2 + Math.sin(u * 1.6 + i * 0.8) * 340 + (R() - 0.5) * 60, y = 900 + (i % 3) * 50; runner(ctx, S, x, y, team, i, u); }
      k.leatherBall(ctx, bx, by, 1.2, u * 6);
      const cp = pop(u, de - 0.1, 0.4);
      if (cp > 0) { ctx.save(); ctx.translate(W / 2, 470); ctx.scale(cp, cp); k.calendarPage(ctx, 0, 0, 170, 'DEC', 21, -0.05); ctx.restore(); }
      k.seal(ctx, 820, 600, 60, ' THE FIRST GAME · FIRST ·', '1891', tween(u, de + 0.3, de + 0.6, ease.linear));
    },
  },
  { // 33.4 "Nine players a side."
    start: 33.2, title: 'Nine a Side', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const ni = S.at('Nine');
      gym(ctx, S);
      // two lines of nine face each other
      for (let i = 0; i < 9; i++) {
        const p = pop(u, ni - 0.2 + i * 0.07, 0.3);
        if (p <= 0) continue;
        const row = Math.floor(i / 3), col = i % 3;
        k.figure(ctx, 110 + col * 95 + row * 30, 860 + row * 70, { ...BLUE, s: 0.5 * p, face: 1, skin: SKINS[i % 5], mood: 'happy', armF: [0.5, 0.5] });
        k.figure(ctx, W - 110 - col * 95 - row * 30, 860 + row * 70, { ...RED, s: 0.5 * p, face: -1, skin: SKINS[(i + 2) % 5], mood: 'happy', armF: [0.5, 0.5] });
      }
      k.leatherBall(ctx, W / 2, 900, 1.3);
      for (const [x, c] of [[260, P.lapis], [680, P.verm]]) medallion(ctx, k, P, '9', x, 600, pop(u, ni + 0.3, 0.3), c);
      k.label(ctx, 'NINE A SIDE', W / 2, 600, 30, tween(u, ni + 0.2, ni + 0.5));
    },
  },
  { // 35.1 "And the final score? One to nothing."
    start: 34.95, title: 'The Final Score', trans: 'flash',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const on = S.at('One');
      gym(ctx, S, { ballIn: u > on - 0.1 ? 1 : null });
      // a shot arcs in just before "One"
      const sh = tween(u, on - 0.9, on - 0.1, ease.inOut);
      if (sh > 0 && sh < 1) k.leatherBall(ctx, lerp(500, W - 90, sh), lerp(850, 370, sh) - Math.sin(sh * Math.PI) * 220, 1.1, u * 8);
      // the scoreboard
      k.rect(ctx, 190, 480, 560, 250, '#2f3b33', P.ink, 4); k.rect(ctx, 176, 466, 588, 278, null, P.brown, 10);
      ctx.fillStyle = P.white; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '700 30px Fell'; ctx.fillText('FINAL SCORE', W / 2, 520);
      ctx.font = '900 120px Deco'; ctx.fillStyle = 'rgba(255,255,255,0.92)';
      ctx.fillText(u > on ? '1' : '0', W / 2 - 130, 640); ctx.fillText('–', W / 2, 630); ctx.fillText('0', W / 2 + 130, 640);
      if (u > on) for (let i = 0; i < 12; i++) { const a = i / 12 * TAU, r = 60 + (u - on) * 320; k.star(ctx, W - 90 + Math.cos(a) * r, 380 + Math.sin(a) * r * 0.7, 10, 1 - (u - on)); }
      medallion(ctx, k, P, '?', W / 2, 860, pop(u, 0.2, 0.3) * (1 - tween(u, on - 0.1, on + 0.1)));
      for (let i = 0; i < 4; i++) runner(ctx, S, 160 + i * 220, 1010, i % 2 ? RED : BLUE, i, u * 0.4);
    },
  },
  { // 38.2 "Plus, in those early games, every time someone scored, a janitor had to climb a ladder to get the ball back."
    start: 37.95, title: "The Janitor's Ladder", trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const sc = S.at('scored'), cl = S.at('climb'), bk = S.at('back');
      S.cam(lerp(1.0, 1.35, tween(u, cl - 0.8, cl, ease.inOut)), lerp(W / 2, W - 220, tween(u, cl - 0.8, cl)), lerp(580, 520, tween(u, cl - 0.8, cl)));
      const inBasket = u > sc - 0.1 && u < bk - 0.1;
      gym(ctx, S, { ballIn: inBasket ? 1 : null });
      const sh = tween(u, sc - 0.8, sc - 0.1, ease.inOut);
      if (sh > 0 && sh < 1) k.leatherBall(ctx, lerp(500, W - 90, sh), lerp(850, 370, sh) - Math.sin(sh * Math.PI) * 220, 1.1, u * 8);
      // everyone waits while the janitor climbs
      k.ladder(ctx, W - 150, 360, 1010, 80);
      const up = tween(u, cl - 0.6, cl + 1.0, ease.inOut);
      k.figure(ctx, W - 150, lerp(1010, 640, up), { s: 0.8, face: -1, robe: P.grey, robeP: 'stripes', robePc: '#7b838d', inner: P.white, hat: 'cap', hatColor: P.brown, mustache: true, mood: 'calm', armF: [2.6 + Math.sin(u * 8) * 0.2 * (1 - tween(u, cl + 1, cl + 1.2)), 0.2], armB: [2.4 - Math.sin(u * 8) * 0.2, 0.2] });
      k.label(ctx, 'THE JANITOR', W - 160, 270, 24, tween(u, S.at('janitor'), S.at('janitor') + 0.3));
      // the ball comes back down
      const dn = tween(u, bk - 0.1, bk + 0.6, ease.inQuad);
      if (dn > 0 && dn < 1) k.leatherBall(ctx, lerp(W - 90, 500, dn), lerp(380, 950, dn), 1.1, u * 8);
      for (let i = 0; i < 3; i++) k.figure(ctx, 160 + i * 170, 1010, { ...(i % 2 ? RED : BLUE), s: 0.6, face: 1, skin: SKINS[i], mood: 'calm', look: -0.3, armF: [0.4, 1.6] });
    },
  },
  { // 45.0 "Those 13 rules became one of the most popular sports on Earth."
    start: 44.85, title: 'A Game for the World', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const be = S.at('became'), ea = S.at('Earth');
      S.cam(lerp(1.15, 1.0, tween(u, 0, 5)), W / 2, 540);
      ctx.fillStyle = '#efdcb0'; ctx.fillRect(-100, -100, W + 200, H + 200);
      compassRose(ctx, k, P, W / 2, 540, 90, u * 0.05);
      const land1 = [[60, 120], [260, 90], [380, 160], [330, 260], [400, 320], [310, 420], [250, 470], [300, 560], [380, 640], [340, 800], [260, 960], [200, 1000], [180, 820], [120, 640], [150, 520], [90, 400], [40, 260]];
      const land2 = [[620, 60], [900, 50], [920, 220], [860, 300], [900, 360], [940, 520], [880, 760], [760, 900], [700, 760], [620, 560], [600, 440], [660, 380], [600, 300], [640, 200]];
      for (const pts of [land1, land2]) { ctx.beginPath(); k.smoothPath(ctx, pts); k.fillStroke(ctx, '#cdb57a', P.ink, 2.5); }
      // a ball bouncing in every land
      const spots = [[230, 250], [300, 640], [220, 880], [760, 170], [800, 420], [770, 720], [160, 420], [680, 600]];
      spots.forEach(([x, y], i) => { const p = pop(u, be - 0.3 + i * 0.15, 0.3); if (p <= 0) return; k.peachBasket(ctx, x + 30, y - 20, 0.4 * p); k.leatherBall(ctx, x - 10, y - Math.abs(Math.sin(u * 5 + i)) * 40 * p, 0.9 * p, u * 4); });
      // the rule scroll at the centre
      k.rect(ctx, W / 2 - 70, 470, 140, 150, P.paperLight, P.ink, 2.5); ctx.fillStyle = P.verm; ctx.font = '900 34px Deco'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('XIII', W / 2, 545);
      k.label(ctx, 'ON EARTH', W / 2, 1010, 30, tween(u, ea, ea + 0.3));
      if (u > ea) for (let i = 0; i < 16; i++) { const a = i / 16 * TAU, r = 120 + (u - ea) * 420; k.star(ctx, W / 2 + Math.cos(a) * r, 540 + Math.sin(a) * r, 12, 1 - (u - ea) * 0.7); }
    },
  },
  { // 50.6 "Every legend has a beginning."
    start: 50.45, title: 'Every Legend Has a Beginning', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W, H } = S, beg = S.at('beginning');
      ctx.save();
      S.cam(lerp(1.0, 1.6, tween(u, 0, beg)), lerp(W / 2, W - 120, tween(u, 0, beg)), lerp(600, 420, tween(u, 0, beg)));
      gym(ctx, S, { ballIn: 1 });
      const g = ctx.createRadialGradient(W - 90, 390, 10, W - 90, 390, 200); g.addColorStop(0, 'rgba(255,240,170,0.8)'); g.addColorStop(1, 'rgba(255,240,170,0)');
      ctx.fillStyle = g; ctx.fillRect(W - 300, 190, 400, 400);
      k.figure(ctx, W / 2, 1010, { ...NAISMITH, s: 1.15, face: 1, mood: 'happy', armF: [2.5, 0.2] });
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
const bounces = (from, n, gap, gain = 0.45) => Array.from({ length: n }, (_, i) => ({ t: +(from + i * gap).toFixed(3), type: 'thud', gain }));
export const sfx = [
  ...scenes.slice(1).map(s => ({ t: s.start - 0.05, type: s.trans === 'unroll' ? 'paper' : 'whoosh', gain: 0.35 })),
  { t: 0.1, type: 'gong', gain: 0.5 }, ...pops(1.5, 6, 0.15, 0.35), { t: 3.0, type: 'thud', gain: 0.6 },
  { t: 4.42, type: 'chime', gain: 0.4 }, { t: 4.8, type: 'stamp', gain: 0.5 }, { t: 5.0, type: 'wind', gain: 0.35 },
  { t: 6.3, type: 'wind', gain: 0.55 }, { t: 7.5, type: 'crack', gain: 0.35 }, { t: 7.6, type: 'chime', gain: 0.35, pitch: 1.5 },
  { t: 10.7, type: 'pluck', gain: 0.5 }, { t: 12.2, type: 'stamp', gain: 0.5 }, { t: 12.96, type: 'pluck', gain: 0.45, pitch: 0.8 },
  { t: 14.1, type: 'paper', gain: 0.5 }, ...bounces(15.8, 6, 0.28, 0.35),
  { t: 17.58, type: 'chime', gain: 0.5 }, { t: 19.4, type: 'slide', gain: 0.3 }, { t: 20.58, type: 'gong', gain: 0.6 }, { t: 20.6, type: 'chime', gain: 0.5 },
  ...bounces(21.75, 3, 0.25, 0.45), { t: 22.3, type: 'pop', gain: 0.5 },
  { t: 23.5, type: 'clank', gain: 0.5 }, { t: 23.75, type: 'clank', gain: 0.5 }, { t: 24.1, type: 'clank', gain: 0.5 }, { t: 24.86, type: 'riser', gain: 0.35 }, { t: 25.36, type: 'chime', gain: 0.45 },
  { t: 26.2, type: 'paper', gain: 0.45 }, { t: 27.22, type: 'stamp', gain: 0.6 },
  ...bounces(28.6, 9, 0.3, 0.35), { t: 31.7, type: 'pop', gain: 0.6 }, { t: 32.1, type: 'stamp', gain: 0.5 },
  ...pops(33.1, 9, 0.07, 0.3),
  { t: 35.6, type: 'slide', gain: 0.35 }, { t: 36.5, type: 'thud', gain: 0.6 }, { t: 36.58, type: 'gong', gain: 0.6 }, { t: 37.0, type: 'coins', gain: 0.3 },
  { t: 40.7, type: 'thud', gain: 0.5 }, { t: 41.8, type: 'clank', gain: 0.35 }, { t: 42.1, type: 'clank', gain: 0.35 }, { t: 42.4, type: 'clank', gain: 0.35 }, { t: 42.7, type: 'clank', gain: 0.35 }, { t: 43.9, type: 'slide', gain: 0.35 }, { t: 44.4, type: 'thud', gain: 0.5 },
  ...bounces(45.3, 8, 0.25, 0.3), { t: 49.06, type: 'gong', gain: 0.7 }, { t: 49.1, type: 'chime', gain: 0.5 },
  { t: 51.7, type: 'pop', gain: 0.8 }, { t: 51.74, type: 'gong', gain: 0.9 },
];

export const music = {
  bpm: 108, root: 'D', maqam: 'rast', gain: 0.32,
  sections: [
    { from: 0, to: 6.2, mood: 'intro' },
    { from: 6.2, to: 9.4, mood: 'sad' },
    { from: 9.4, to: 21.65, mood: 'groove' },
    { from: 21.65, to: 37.95, mood: 'drive' },
    { from: 37.95, to: 44.85, mood: 'groove' },
    { from: 44.85, to: 51.7, mood: 'triumph' },
    { from: 51.7, to: 54.8, mood: 'end' },
  ],
};
