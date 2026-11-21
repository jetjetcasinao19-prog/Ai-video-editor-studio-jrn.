// "How the Chocolate Chip Cookie Started" — an Ottoman miniature chronicle.
// u = seconds since the scene started; S.at('word') = when that word is said.
import { clamp, lerp, ease, tween, rng, TAU, shake, pop } from '../../lib/core.mjs';
import { land, interior, lamp, bookCover, bigSign, medallion, heart, usMap } from '../../styles/ottoman/scenes.mjs';

export const meta = {
  title: 'How the Chocolate Chip Cookie Started',
  slug: 'chocolate-chip-cookie-ottoman',
  style: 'ottoman',
  width: 1080, height: 1920, fps: 30,
  duration: 55.4,
  voice: 'voice.mp3',
  seed: 59,
  captionChars: 30,
  brand: { handle: '@HOWITSTARTED-YT1', logo: '../../../brand/logo.png' },
  outro: { at: 53.3, text: 'Subscribe for more origin stories' },
};

const RUTH = { robe: '#20408f', robeP: 'flowers', robePc: '#f7eed6', inner: '#f8f2e2', sash: '#c4371f', hat: 'hotoz', hatColor: '#c4371f', veil: '#f8f2e2', hair: '#4a3020' };
const ENVOY = { robe: '#c4371f', robeP: 'cintamani', robePc: '#ecd57a', inner: '#e9be6e', hat: 'turban', hatColor: '#3d8458', plume: '#d6973a', beard: 'short', mustache: true };
const GUEST_SKINS = ['#f1d1a8', '#e2b48a', '#c68a5e', '#f1d1a8', '#a86c45'];

function kitchen(ctx, S, o = {}) {
  const { k, P, W } = S;
  interior(ctx, S, { window: true, carpet: false, carpetColor: P.verm });
  // a long kitchen counter
  k.rect(ctx, 40, 760, W - 80, 30, P.brownLight, P.ink, 2.5);
  k.rect(ctx, 60, 790, W - 120, 220, P.brown, P.ink, 2);
  for (let i = 0; i < 4; i++) k.rect(ctx, 80 + i * 205, 810, 180, 180, '#8a5530', P.ink, 1.5);
  if (o.oven !== false) k.oven(ctx, W - 170, 760, 0.8, S.t, o.tray || 0);
}

export const scenes = [
  { // 0.0 "You've heard the chocolate chip cookie was an accident."
    start: 0, title: 'The Cookie Story',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const ac = S.at('accident'), ck = S.at('cookie');
      k.goldSky(ctx, -60, -60, W + 120, 1300, S.t);
      for (let i = 0; i < 3; i++) k.cloud(ctx, 150 + i * 320, 160 + (i % 2) * 70, 1.1, i + 140);
      k.carpet(ctx, 120, 780, W - 240, 240, P.verm, P.lapis);
      // a plate with one perfect cookie
      ctx.beginPath(); ctx.ellipse(W / 2, 760, 230, 60, 0, 0, TAU); k.fillStroke(ctx, P.white, P.ink, 2.5);
      ctx.fillStyle = k.pattern(ctx, 'tiles', P.white, P.lapisLight, 34); ctx.beginPath(); ctx.ellipse(W / 2, 760, 225, 56, 0, 0, TAU); ctx.ellipse(W / 2, 755, 170, 40, 0, 0, TAU); ctx.fill('evenodd');
      k.cookie(ctx, W / 2, 610 + Math.sin(u * 2) * 6, 170 * pop(u, ck - 0.4, 0.4), u * 0.1);
      k.label(ctx, 'THE CHOCOLATE CHIP COOKIE', W / 2, 260, 28, tween(u, ck - 0.3, ck));
      k.stamp(ctx, 'AN ACCIDENT?', W / 2, 980, 64, tween(u, ac, ac + 0.25, ease.linear), -0.08);
    },
  },
  { // 3.5 "It wasn't."
    start: 3.45, title: "It Wasn't", trans: 'flash',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const wa = S.at("wasn't");
      ctx.fillStyle = P.lapisDeep; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = k.pattern(ctx, 'cintamani', P.lapisDeep, '#2c4a8f', 60); ctx.fillRect(0, 0, W, H);
      // the "accident" stamp tears in two
      const tear = tween(u, wa - 0.05, wa + 0.4, ease.outCubic);
      for (const sd of [-1, 1]) { ctx.save(); ctx.beginPath(); ctx.rect(sd < 0 ? 0 : W / 2, 0, W / 2, H); ctx.clip(); ctx.translate(sd * tear * 80, tear * 60); ctx.rotate(sd * tear * 0.2); k.stamp(ctx, 'AN ACCIDENT', W / 2, 470, 74, 1, -0.08); ctx.restore(); }
      const no = tween(u, wa, wa + 0.3, ease.outBack);
      if (no > 0) { ctx.save(); ctx.translate(W / 2, 760); ctx.scale(no, no); k.cartouche(ctx, 0, 0, 640, 130, P.paperLight, P.goldLight, 6); ctx.fillStyle = P.verm; ctx.font = '900 70px Deco'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText("IT WASN'T", 0, 6); ctx.restore(); }
    },
  },
  { // 5.0 "1930s, Whitman, Massachusetts."
    start: 4.95, title: 'Whitman, Massachusetts', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const wh = S.at('Whitman');
      S.cam(lerp(1.1, 1.0, tween(u, 0, 3.2)), W / 2, 560);
      land(ctx, S, { horizon: 330, seed: 121, clouds: 3, hillColors: [P.ochreLight, P.rose, P.sageLight, P.lavLight] });
      const R = rng(4);
      for (const [row, y, sc] of [[0, 500, 0.85], [1, 660, 1.0], [2, 820, 1.1]]) for (let i = 0; i < 5; i++) {
        const x = 90 + i * 190 + (row % 2) * 80;
        if (R() < 0.3) { k.blossomTree(ctx, x, y + 10, 170 * sc, S.t, i + row, [P.verm, P.ochre, '#e8844a'][i % 3]); continue; }
        k.house(ctx, x, y, 110 * sc, 86 * sc, { wall: [P.white, P.pink, P.ochreLight][(i + row) % 3], roof: [P.vermDark, P.ink, P.lapis][(i + row) % 3], chimney: R() < 0.5 });
      }
      k.label(ctx, 'WHITMAN · MASSACHUSETTS', W / 2, 280, 28, tween(u, wh, wh + 0.3));
      k.seal(ctx, 820, 980, 64, ' THE 1930s · THE 1930s ·', '1930s', tween(u, 0.1, 0.4, ease.linear));
    },
  },
  { // 8.3 "Ruth Wakefield runs a popular restaurant called the Toll House Inn."
    start: 8.2, title: 'The Toll House Inn', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const ru = S.at('Ruth'), th = S.at('Toll'), po = S.at('popular');
      S.cam(lerp(1.08, 1.0, tween(u, 0, 4.2)), W / 2, 560);
      land(ctx, S, { horizon: 330, seed: 123, clouds: 3, hillColors: [P.ochreLight, P.rose, P.sageLight] });
      k.house(ctx, W / 2, 780, 520, 300, { wall: P.white, roof: P.ink, chimney: true });
      // the inn's sign
      const sg = tween(u, th - 0.2, th + 0.3, ease.outBack);
      ctx.beginPath(); ctx.moveTo(W / 2 - 300, 560); ctx.lineTo(W / 2 - 220, 560); k.stroke(ctx, P.brown, 6);
      if (sg > 0) { ctx.save(); ctx.translate(W / 2 - 260, 600); ctx.scale(sg, sg); k.cartouche(ctx, 0, 0, 260, 70, P.lapis, P.goldLight, 4); ctx.fillStyle = P.goldLight; ctx.font = '900 26px Deco'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('TOLL HOUSE INN', 0, 3); ctx.restore(); }
      // guests arriving
      for (let i = 0; i < 4; i++) { const x = lerp(-100 - i * 140, 260 + i * 110, tween(u, po - 1.2 + i * 0.15, po + 1.2 + i * 0.15)); k.figure(ctx, x, 1000 - (i % 2) * 20, { s: 0.62, face: 1, skin: GUEST_SKINS[i], robe: [P.green, P.lav, P.ochre, P.turq][i], robeP: 'dots', hat: i % 2 ? 'hotoz' : 'turban', hatColor: P.lapis, veil: P.white, walk: u * 8 + i, mood: 'happy' }); }
      k.figure(ctx, 760, 1010, { ...RUTH, s: 1.05, face: -1, mood: 'happy', armF: [2.0, 0.3] });
      k.label(ctx, 'RUTH WAKEFIELD', 760, 600, 26, tween(u, ru, ru + 0.3));
    },
  },
  { // 12.7 "She's a trained dietitian. She knows exactly what she's doing."
    start: 12.5, title: 'A Trained Dietitian', trans: 'wipe',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const di = S.at('dietitian'), ex = S.at('exactly');
      S.cam(lerp(1.0, 1.08, tween(u, 0, 4.7)), W / 2, 560);
      kitchen(ctx, S, { oven: false });
      // the balance settles perfectly level on "exactly"
      const tilt = Math.sin(u * 4) * 0.8 * (1 - tween(u, ex - 0.4, ex + 0.1));
      k.balance(ctx, 620, 760, 1.05, tilt);
      if (u > ex) k.label(ctx, 'EXACTLY', 620, 450, 30, tween(u, ex, ex + 0.3));
      // her diploma
      const dp = tween(u, di - 0.2, di + 0.3, ease.outBack);
      if (dp > 0) { ctx.save(); ctx.translate(250, 330); ctx.scale(dp, dp); k.rect(ctx, -130, -80, 260, 160, P.paperLight, P.goldDark, 5); ctx.fillStyle = P.verm; ctx.font = '900 30px Deco'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('DIETITIAN', 0, -20); ctx.fillStyle = P.ink; ctx.font = '700 18px Fell'; ctx.fillText('TRAINED · CERTIFIED', 0, 20); k.seal(ctx, 90, 50, 26, ' ✓ · ✓ · ✓ ·', '✓', 1, P.verm); ctx.restore(); }
      k.figure(ctx, 280, 1010, { ...RUTH, s: 1.2, face: 1, mood: 'calm', armF: [1.5, 0.2] });
    },
  },
  { // 17.4 "She chops up a bar of Nestlé chocolate and mixes the pieces into her cookie dough."
    start: 17.2, title: 'Chopped Chocolate', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const ch = S.at('chops'), mx = S.at('mixes'), dg = S.at('dough');
      S.cam(lerp(1.15, 1.0, tween(u, 0, 5)), W / 2, 640);
      kitchen(ctx, S, { oven: false });
      // cutting board, bar, knife chopping
      k.rect(ctx, 220, 700, 340, 60, P.ochreLight, P.ink, 2);
      const cut = tween(u, ch, mx, ease.linear);
      k.chocBar(ctx, 390, 690, 300, 0, 'NESTLÉ', cut);
      const chop = Math.abs(Math.sin(u * 9)) * (u < mx ? 1 : 0);
      k.knife(ctx, 420 + cut * 110, 600 + chop * 60, 1, 0.2);
      // pieces pile up, then fly into the bowl
      const fly = tween(u, mx - 0.1, mx + 0.6, ease.inOut);
      const R = rng(8);
      for (let i = 0; i < Math.floor(18 * cut); i++) { const x0 = 500 + R() * 50, y0 = 690 + R() * 20, x1 = 690 + (R() - 0.5) * 120, y1 = 660 + R() * 20; k.chocChunk(ctx, lerp(x0, x1, fly), lerp(y0, y1, fly) - Math.sin(fly * Math.PI) * 140, 1.2, i + fly * 4); }
      // the mixing bowl of dough
      ctx.beginPath(); ctx.ellipse(690, 660, 150, 34, 0, Math.PI, TAU); k.fillStroke(ctx, '#e9c98a', P.ink, 2);
      ctx.beginPath(); ctx.moveTo(540, 660); ctx.quadraticCurveTo(550, 760, 690, 770); ctx.quadraticCurveTo(830, 760, 840, 660); ctx.closePath(); k.fillStroke(ctx, P.white, P.ink, 2.5);
      ctx.save(); ctx.clip(); ctx.fillStyle = k.pattern(ctx, 'tiles', P.white, P.lapisLight, 34); ctx.fillRect(530, 680, 320, 60); ctx.restore();
      const stir = tween(u, dg - 0.6, dg + 1.0);
      if (stir > 0) { ctx.save(); ctx.translate(690 + Math.cos(u * 8) * 50, 640 + Math.sin(u * 8) * 10); ctx.rotate(-0.4); k.rect(ctx, -8, -160, 16, 170, P.brownLight, P.ink, 2); ctx.restore(); }
      k.label(ctx, 'COOKIE DOUGH', 690, 520, 24, tween(u, dg, dg + 0.3));
      k.figure(ctx, 110, 1010, { ...RUTH, s: 0.95, face: 1, mood: 'happy', armF: [1.6 + Math.sin(u * 9) * 0.15 * (u < mx ? 1 : 0), 0.2] });
    },
  },
  { // 22.6 "The cookies are a hit."
    start: 22.4, title: 'A Hit', trans: 'flash',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const hi = S.at('hit');
      kitchen(ctx, S, { tray: tween(u, 0.1, hi - 0.2, ease.outCubic) });
      for (let i = 0; i < 5; i++) { const x = 110 + i * 150, jump = Math.abs(Math.sin(u * 7 + i)) * 16 * tween(u, hi - 0.2, hi); k.figure(ctx, x, 1010 - jump, { s: 0.7, face: 1, skin: GUEST_SKINS[i], robe: [P.green, P.lav, P.ochre, P.turq, P.pink][i], robeP: 'dots', hat: i % 2 ? 'hotoz' : 'turban', hatColor: P.lapis, veil: P.white, mood: 'happy', armF: [2.5, 0.2], hold: c => k.cookie(c, 0, -20, 22, i) }); }
      if (u > hi - 0.1) { for (let i = 0; i < 10; i++) { const q = ((u - hi) * 0.8 + i / 10) % 1; heart(ctx, k, P, 80 + (i * 97) % 760, 620 - q * 420, 1.3, 1 - q); } for (let i = 0; i < 14; i++) { const a = i / 14 * TAU, r = 80 + (u - hi) * 380; k.star(ctx, W - 170 + Math.cos(a) * r, 600 + Math.sin(a) * r * 0.6, 11, 1 - (u - hi) * 0.7); } }
      k.label(ctx, 'A HIT!', W / 2, 300, 40, tween(u, hi, hi + 0.3));
    },
  },
  { // 24.8 "In 1938, she puts the recipe in her cookbook."
    start: 24.6, title: 'The Cookbook · 1938', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const rc = S.at('recipe'), cb = S.at('cookbook');
      ctx.fillStyle = P.paperLight; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = k.pattern(ctx, 'flowers', P.paperLight, '#e6d6ad', 40); ctx.fillRect(0, 0, W, H);
      k.openBook(ctx, W / 2, 560, 800, 600, { cover: P.vermDark });
      // the recipe writes itself onto the right page
      ctx.fillStyle = P.verm; ctx.font = '900 30px Deco'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const wk = tween(u, rc - 0.4, cb + 0.6);
      ctx.save(); ctx.beginPath(); ctx.rect(W / 2 + 20, 270, 380 * wk, 560); ctx.clip();
      ctx.fillText('CHOCOLATE', W / 2 + 200, 320); ctx.fillText('CRUNCH', W / 2 + 200, 360); ctx.fillText('COOKIES', W / 2 + 200, 400);
      ctx.fillStyle = P.ink; ctx.font = '700 22px Fell'; ['1 cup butter', '¾ cup sugar', '2 eggs', 'flour, soda, salt', 'chopped chocolate', 'bake till golden'].forEach((ln, i) => { ctx.textAlign = 'left'; ctx.fillText('· ' + ln, W / 2 + 60, 460 + i * 40); });
      ctx.restore();
      k.cookie(ctx, W / 2 - 200, 520, 110, 0.3);
      k.cookie(ctx, W / 2 - 150, 700, 70, 1.2);
      k.seal(ctx, 820, 950, 70, ' THE COOKBOOK · TOLL HOUSE ·', '1938', tween(u, S.at('1938'), S.at('1938') + 0.3, ease.linear));
    },
  },
  { // 28.5 "Then Nestlé makes her a deal. The recipe and the Toll House name printed on their packaging."
    start: 28.3, title: 'The Deal', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const de = S.at('deal'), pk = S.at('packaging'), na = S.at('name');
      S.cam(lerp(1.06, 1.0, tween(u, 0, 7)), W / 2, 540);
      interior(ctx, S, { window: true, carpetColor: P.verm });
      k.canopy(ctx, 470, 300, 330, 380, P.verm, S.t);
      k.label(ctx, 'NESTLÉ', 470, 270, 28, tween(u, 0.1, 0.4), P.goldLight);
      k.figure(ctx, 470, 700, { ...ENVOY, s: 1.1, face: -1, kneel: true, mood: 'happy', armF: [lerp(0.6, 1.8, tween(u, de - 0.3, de)), 0.1] });
      k.figure(ctx, 170, 1010, { ...RUTH, s: 1.1, face: 1, mood: 'happy', armF: [1.6, 0.1] });
      // the wrapper rolls out with her recipe and the Toll House name
      const wr = tween(u, na - 0.3, pk + 0.3, ease.inOut);
      if (wr > 0) {
        ctx.save(); ctx.beginPath(); ctx.rect(300, 760, 560 * wr, 260); ctx.clip();
        k.rect(ctx, 300, 760, 560, 240, P.verm, P.ink, 3);
        k.rect(ctx, 320, 780, 260, 200, P.paperLight, P.ink, 1.5);
        ctx.fillStyle = P.ink; ctx.font = '900 20px Deco'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('TOLL HOUSE', 450, 808); ctx.fillText('COOKIE RECIPE', 450, 834);
        for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(340, 866 + i * 22); ctx.lineTo(560, 866 + i * 22); k.stroke(ctx, P.grey, 2); }
        k.chocBar(ctx, 720, 880, 200, -0.1, '');
        ctx.restore();
      }
      k.seal(ctx, 820, 600, 60, ' A DEAL · A DEAL · A DEAL ·', 'DEAL', tween(u, de, de + 0.3, ease.linear), P.green);
    },
  },
  { // 35.6 "Her payment? One dollar, which she said she never got."
    start: 35.4, title: 'Her Payment?', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const on = S.at('One'), ng = S.at('never');
      k.goldSky(ctx, -60, -60, W + 120, H + 120, S.t);
      k.carpet(ctx, 120, 820, W - 240, 200, P.lapis, P.verm);
      medallion(ctx, k, P, '?', W / 2, 300, pop(u, 0.1, 0.35) * (1 - tween(u, on - 0.1, on + 0.1)) * 1.2);
      // one dollar coin appears… then rolls away and vanishes
      const away = tween(u, ng - 0.2, ng + 0.8, ease.inCubic);
      const cx = lerp(W / 2, W + 200, away), cy = 560;
      if (u > on - 0.1 && away < 1) k.coin(ctx, cx, cy, 120 * pop(u, on - 0.1, 0.35), u * (u > ng - 0.2 ? 10 : 1.5));
      k.figure(ctx, 260, 1000, { ...RUTH, s: 1.15, face: 1, mood: u > ng ? 'sad' : 'happy', look: u > ng ? 0.3 : 0, armF: u > ng ? [1.4, 1.2] : [1.6, 0.2], armB: u > ng ? [1.4, 1.2] : [0.2, 0.2] });
      k.label(ctx, 'ONE DOLLAR', W / 2, 380, 30, tween(u, on, on + 0.3) * (1 - tween(u, ng, ng + 0.3)));
      k.stamp(ctx, 'NEVER GOT IT', 650, 820, 54, tween(u, S.at('got'), S.at('got') + 0.25, ease.linear), -0.12);
    },
  },
  { // 40.3 "And free chocolate for life."
    start: 40.1, title: 'Free Chocolate for Life', trans: 'flash',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const fr = S.at('free'), li = S.at('life');
      kitchen(ctx, S, { oven: false });
      // an avalanche of chocolate bars pours in
      const R = rng(23);
      for (let i = 0; i < 40; i++) { const d = R(), x = 80 + R() * 780, st = fr - 0.4 + d * 1.2, q = clamp((u - st) / 0.6); if (q <= 0) continue; const yEnd = 740 - Math.floor(i / 8) * 26 - R() * 10; k.chocBar(ctx, x, lerp(-60, yEnd, ease.outBounce(q)), 120, (R() - 0.5) * 0.6, i % 3 ? '' : 'NESTLÉ'); }
      k.figure(ctx, W / 2, 1010, { ...RUTH, s: 1.15, face: 1, mood: 'happy', armF: [2.7, 0.1], armB: [2.4, 0.1] });
      k.label(ctx, 'FOR LIFE', W / 2, 280, 36, tween(u, li, li + 0.3));
    },
  },
  { // 43.2 "Soon, Nestlé starts selling chocolate chips,"
    start: 43.0, title: 'Chocolate Chips', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const se = S.at('selling'), cp = S.at('chips');
      S.cam(lerp(1.1, 1.0, tween(u, 0, 3)), W / 2, 560);
      land(ctx, S, { horizon: 300, seed: 127, clouds: 2 });
      k.rect(ctx, 150, 430, 640, 400, P.brownLight, P.ink, 2.5);
      k.canopy(ctx, 470, 400, 680, 120, P.verm, S.t);
      for (let row = 0; row < 2; row++) { k.rect(ctx, 170, 640 + row * 170, 600, 12, P.brown, P.ink, 1.5); for (let i = 0; i < 5; i++) k.chipBag(ctx, 230 + i * 120, 638 + row * 170, 0.75 * pop(u, se - 0.3 + (row * 5 + i) * 0.06, 0.3)); }
      if (u > cp - 0.1) { const R = rng(31); for (let i = 0; i < 40; i++) { const q = ((u - cp) * (0.6 + R() * 0.6) + R()) % 1; k.chocChunk(ctx, 60 + R() * 820, -20 + q * 1100, 1.4, q * 10 + i); } }
      k.label(ctx, 'CHOCOLATE CHIPS', W / 2, 360, 32, tween(u, cp, cp + 0.3));
      for (let i = 0; i < 3; i++) k.figure(ctx, 170 + i * 300, 1010, { s: 0.62, face: i ? -1 : 1, skin: GUEST_SKINS[i + 1], robe: [P.green, P.lav, P.ochre][i], robeP: 'dots', hat: i % 2 ? 'hotoz' : 'turban', hatColor: P.lapis, veil: P.white, mood: 'happy', armF: [2.2, 0.3], hold: c => k.chipBag(c, 10, 0, 0.3) });
    },
  },
  { // 46.6 "a chef's plan that became an American classic."
    start: 46.3, title: 'An American Classic', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const pl = S.at('plan'), cl = S.at('classic');
      S.cam(lerp(1.12, 1.0, tween(u, 0, 4)), W / 2, 540);
      ctx.fillStyle = '#efdcb0'; ctx.fillRect(-100, -100, W + 200, H + 200);
      usMap(ctx, S);
      const spots = [[200, 300], [320, 450], [450, 330], [560, 500], [680, 300], [760, 420], [620, 620], [260, 560], [420, 600]];
      spots.forEach(([x, y], i) => { const p = pop(u, pl - 0.3 + i * 0.12, 0.3); if (p > 0) k.cookie(ctx, x, y, 34 * p, i); });
      // the chef's plan, a scroll in the corner
      k.rect(ctx, 70, 760, 220, 200, P.paperLight, P.ink, 2); ctx.fillStyle = P.verm; ctx.font = '900 22px Deco'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText("A CHEF'S", 180, 800); ctx.fillText('PLAN', 180, 830);
      for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(100, 870 + i * 22); ctx.lineTo(260, 870 + i * 22); k.stroke(ctx, P.grey, 2); }
      bigSign(ctx, k, P, 'AMERICAN CLASSIC', W / 2 + 60, 860, 680, tween(u, cl - 0.05, cl + 0.35, ease.outBack), 80);
    },
  },
  { // 50.8 "Every legend has a beginning."
    start: 50.6, title: 'Every Legend Has a Beginning', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W, H } = S, beg = S.at('beginning');
      ctx.save();
      S.cam(lerp(1.0, 1.4, tween(u, 0, beg)), lerp(W / 2, 560, tween(u, 0, beg)), lerp(600, 700, tween(u, 0, beg)));
      kitchen(ctx, S, { oven: true });
      const g = ctx.createRadialGradient(540, 700, 10, 540, 700, 220); g.addColorStop(0, 'rgba(255,240,170,0.85)'); g.addColorStop(1, 'rgba(255,240,170,0)');
      ctx.fillStyle = g; ctx.fillRect(320, 480, 440, 440);
      ctx.beginPath(); ctx.ellipse(540, 750, 120, 26, 0, 0, TAU); k.fillStroke(ctx, P.white, P.ink, 2);
      k.cookie(ctx, 540, 720, 80, u * 0.2);
      k.figure(ctx, 230, 1010, { ...RUTH, s: 1.15, face: 1, mood: 'happy', armF: [1.6, 0.3] });
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
const chops = (from, n, gap) => Array.from({ length: n }, (_, i) => ({ t: +(from + i * gap).toFixed(3), type: 'clank', gain: 0.35 }));
export const sfx = [
  ...scenes.slice(1).map(s => ({ t: s.start - 0.05, type: s.trans === 'unroll' ? 'paper' : 'whoosh', gain: 0.35 })),
  { t: 1.0, type: 'pop', gain: 0.6 }, { t: 1.3, type: 'chime', gain: 0.4 }, { t: 2.1, type: 'stamp', gain: 0.8 },
  { t: 3.6, type: 'crack', gain: 0.7 }, { t: 3.65, type: 'paper', gain: 0.5 }, { t: 3.75, type: 'gong', gain: 0.5 },
  { t: 5.1, type: 'stamp', gain: 0.5 }, { t: 6.38, type: 'chime', gain: 0.4 },
  { t: 8.34, type: 'pluck', gain: 0.5 }, { t: 10.96, type: 'chime', gain: 0.4 },
  { t: 13.3, type: 'stamp', gain: 0.5 }, { t: 14.82, type: 'clank', gain: 0.45 }, { t: 14.9, type: 'chime', gain: 0.5, pitch: 1.3 },
  ...chops(17.36, 9, 0.27), { t: 19.72, type: 'slide', gain: 0.35 }, ...pops(19.9, 10, 0.05, 0.3), { t: 21.0, type: 'waves', gain: 0.2 },
  { t: 22.5, type: 'sizzle', gain: 0.3 }, { t: 23.58, type: 'gong', gain: 0.6 }, { t: 23.6, type: 'coins', gain: 0.3 },
  { t: 25.0, type: 'paper', gain: 0.45 }, { t: 26.44, type: 'paper', gain: 0.35 }, { t: 27.16, type: 'stamp', gain: 0.6 },
  { t: 29.94, type: 'stamp', gain: 0.6 }, { t: 30.0, type: 'gong', gain: 0.4 }, { t: 32.2, type: 'paper', gain: 0.5 },
  { t: 36.76, type: 'chime', gain: 0.55 }, { t: 38.5, type: 'slide', gain: 0.4 }, { t: 39.18, type: 'stamp', gain: 0.7 }, { t: 39.2, type: 'flop', gain: 0.35 },
  { t: 40.4, type: 'riser', gain: 0.3 }, ...Array.from({ length: 10 }, (_, i) => ({ t: +(40.6 + i * 0.12).toFixed(3), type: 'thud', gain: 0.3 })), { t: 41.82, type: 'gong', gain: 0.6 },
  { t: 44.2, type: 'pop', gain: 0.4 }, { t: 45.24, type: 'rain', gain: 0.35 }, { t: 45.3, type: 'chime', gain: 0.45 },
  { t: 46.6, type: 'paper', gain: 0.4 }, ...pops(46.4, 9, 0.12, 0.3), { t: 49.2, type: 'gong', gain: 0.7 }, { t: 49.25, type: 'chime', gain: 0.5 },
  { t: 52.1, type: 'pop', gain: 0.8 }, { t: 52.14, type: 'gong', gain: 0.9 },
];

export const music = {
  bpm: 96, root: 'D', maqam: 'rast', gain: 0.32,
  sections: [
    { from: 0, to: 4.95, mood: 'intro' },
    { from: 4.95, to: 17.2, mood: 'groove' },
    { from: 17.2, to: 28.3, mood: 'drive' },
    { from: 28.3, to: 35.4, mood: 'groove' },
    { from: 35.4, to: 40.1, mood: 'sad' },
    { from: 40.1, to: 52.1, mood: 'triumph' },
    { from: 52.1, to: 55.4, mood: 'end' },
  ],
};
