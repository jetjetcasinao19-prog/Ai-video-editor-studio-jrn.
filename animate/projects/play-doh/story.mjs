// "How Play-Doh Started" — an Ottoman miniature chronicle of a wall cleaner.
// u = seconds since the scene started; S.at('word') = when that word is said.
import { clamp, lerp, ease, tween, rng, TAU, shake, pop } from '../../lib/core.mjs';
import { land, interior, lamp, bookCover, bigSign, medallion, heart } from '../../styles/ottoman/scenes.mjs';

export const meta = {
  title: 'How Play-Doh Started',
  slug: 'play-doh-ottoman',
  style: 'ottoman',
  look: 'scroll',
  width: 1080, height: 1920, fps: 30,
  duration: 56.8,
  voice: 'voice.mp3',
  seed: 61,
  captionChars: 30,
  brand: { handle: '@HOWITSTARTED-YT1', logo: '../../../brand/logo.png' },
  outro: { at: 54.7, text: 'Subscribe for more origin stories' },
};

const KAY = { robe: '#3d8458', robeP: 'flowers', robePc: '#f7eed6', inner: '#f8f2e2', sash: '#c4371f', hat: 'hotoz', hatColor: '#d6973a', veil: '#f8f2e2', hair: '#6b4a32' };
const MAID = { robe: '#8f98a3', robeP: 'stripes', robePc: '#7b838d', inner: '#f8f2e2', hat: 'hotoz', hatColor: '#20408f', veil: '#f8f2e2', hair: '#3a2a20' };
const KID_SKINS = ['#f1d1a8', '#c68a5e', '#e2b48a', '#8a5a3c', '#f1d1a8', '#a86c45'];
const PUTTY = '#e9e0c8'; // the original off-white (colours came in 1957)
const COLORS = ['#c4371f', '#ecc53a', '#3f68bd', '#3d8458'];

// A room whose upper wall is sooty; stripes = [[x, y, w, h]] wiped clean.
function sootyRoom(ctx, S, dirt, stripes = []) {
  const { k, W } = S;
  interior(ctx, S, { carpet: false, window: false });
  ctx.save();
  ctx.beginPath(); ctx.rect(0, 74, W, 562);
  for (const [x, y, w, h] of stripes) if (w > 0) ctx.rect(x, y, w, h);
  ctx.clip('evenodd');
  k.soot(ctx, 0, 74, W, 562, dirt);
  ctx.restore();
}
function kidsTable(ctx, S, u, colored, loveAt = 99) {
  const { k, P, W } = S;
  k.rect(ctx, 120, 820, W - 240, 30, P.brownLight, P.ink, 2.5);
  for (const lx of [150, W - 170]) k.rect(ctx, lx, 850, 20, 150, P.brown, P.ink, 1.5);
  // dough creations on the table: a snake, a ball, a little star
  const shapes = colored ? COLORS : [PUTTY, PUTTY, PUTTY, PUTTY];
  k.dough(ctx, 260, 800, 30, shapes[0], 0.3, 1);
  ctx.beginPath(); ctx.moveTo(380, 805); ctx.bezierCurveTo(420, 770, 460, 840, 520, 800); k.stroke(ctx, P.ink, 22); k.stroke(ctx, shapes[1], 17);
  k.star(ctx, 640, 795, 30, 1);
  ctx.save(); ctx.globalCompositeOperation = 'source-atop'; ctx.restore();
  k.dough(ctx, 760, 800, 26, shapes[2], 0.4, 4);
  for (let i = 0; i < 5; i++) {
    const x = 170 + i * 150, hop = u > loveAt ? Math.abs(Math.sin(u * 7 + i)) * 14 : 0;
    k.figure(ctx, x, 1010 - hop, { s: 0.55, face: i < 2 ? 1 : -1, skin: KID_SKINS[i], robe: [P.verm, P.lapisLight, P.ochre, P.green, P.lav][i], robeP: 'dots', hat: i % 2 ? 'hotoz' : 'cap', hatColor: [P.green, P.verm, P.lapis][i % 3], veil: P.white, mood: 'happy', armF: [1.9 + Math.sin(u * 6 + i) * 0.3, 0.4], hold: c => k.dough(c, 6, -6, 13, colored ? COLORS[i % 4] : PUTTY, 0.2, i) });
  }
}

export const scenes = [
  { // 0.0 "Play-Doh was invented to clean your walls."
    start: 0, title: 'Made to Clean Walls',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const cl = S.at('clean'), wa = S.at('walls');
      S.cam(lerp(1.2, 1.0, tween(u, 0, 3.7)), W / 2, 500);
      const x = lerp(-60, W + 60, tween(u, cl - 0.9, wa + 0.9, ease.inOut));
      sootyRoom(ctx, S, 1, [[0, 270, Math.max(0, x), 140]]);
      k.dough(ctx, x, 340, 72, PUTTY, 0.1 + 0.1 * Math.sin(u * 10), 2);
      k.label(ctx, 'PLAY-DOH', W / 2, 760, 40, tween(u, 0, 0.3));
      k.stamp(ctx, 'A WALL CLEANER', W / 2, 960, 60, tween(u, wa, wa + 0.25, ease.linear), -0.08);
    },
  },
  { // 4.0 "1930s, Cincinnati, Ohio."
    start: 3.85, title: 'Cincinnati, Ohio · 1930s', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const ci = S.at('Cincinnati');
      S.cam(lerp(1.1, 1.0, tween(u, 0, 3.5)), W / 2, 560);
      land(ctx, S, { horizon: 330, seed: 131, clouds: 2 });
      // the Ohio river
      ctx.save(); ctx.beginPath(); ctx.moveTo(-20, 900); ctx.bezierCurveTo(300, 840, 600, 960, 960, 880); ctx.lineTo(960, 980); ctx.bezierCurveTo(600, 1060, 300, 940, -20, 1000); ctx.closePath(); ctx.clip(); k.waves(ctx, -20, 820, 1000, 260, S.t, P.water, P.waterLight, 24, 22); ctx.restore();
      const R = rng(6);
      for (const [row, y, sc] of [[0, 520, 0.85], [1, 680, 1.0], [2, 830, 1.05]]) for (let i = 0; i < 5; i++) {
        const x = 90 + i * 190 + (row % 2) * 80;
        k.house(ctx, x, y, 110 * sc, 90 * sc, { wall: [P.white, P.pink, P.ochreLight, P.lavLight][(i + row) % 4], roof: P.ink, chimney: true });
        // coal smoke from every chimney
        for (let j = 0; j < 2; j++) { const q = (S.t * 0.35 + j / 2 + i * 0.13) % 1; ctx.save(); ctx.globalAlpha = (1 - q) * 0.85; k.cloud(ctx, x + 30 + q * 30, y - 130 * sc - q * 120, 0.35 + q * 0.3, i + j + row, '#6b6560', P.ink); ctx.restore(); }
      }
      k.label(ctx, 'CINCINNATI · OHIO', W / 2, 260, 30, tween(u, ci, ci + 0.3));
      k.seal(ctx, 820, 1000, 62, ' THE 1930s · THE 1930s ·', '1930s', tween(u, 0.1, 0.4, ease.linear));
    },
  },
  { // 7.6 "Homes burn coal for heat, and the soot turns wallpaper black."
    start: 7.45, title: 'Coal Soot', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const co = S.at('coal'), so = S.at('soot'), bl = S.at('black');
      S.cam(lerp(1.0, 1.1, tween(u, 0, 4.8)), W / 2, 560);
      sootyRoom(ctx, S, tween(u, so - 0.4, bl + 0.4));
      ctx.fillStyle = '#d9a866'; ctx.fillRect(0, 760, W, 300);
      k.coalStove(ctx, 640, 1000, 1.05, S.t, 1, 1);
      // a coal scuttle
      k.rect(ctx, 780, 920, 110, 80, '#3a3a3a', P.ink, 2); for (let i = 0; i < 8; i++) k.circle(ctx, 795 + (i % 4) * 26, 915 - Math.floor(i / 4) * 14, 12, '#1a1a1a', P.ink, 1);
      k.label(ctx, 'COAL', 830, 840, 22, tween(u, co, co + 0.3));
      k.figure(ctx, 230, 1010, { ...MAID, s: 1.05, face: 1, mood: u > bl ? 'sad' : 'calm', look: u > bl ? -0.4 : 0, armF: [0.6, 1.4] });
      k.stamp(ctx, 'SOOT!', 420, 300, 70, tween(u, bl, bl + 0.25, ease.linear), -0.12);
    },
  },
  { // 12.4 "A soap company called Kutol sells a soft, doughy putty that rolls the dirt right off."
    start: 12.25, title: "Kutol's Putty", trans: 'wipe',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const ku = S.at('Kutol'), so = S.at('soft'), ro = S.at('rolls');
      S.cam(lerp(1.06, 1.0, tween(u, 0, 6.6)), W / 2, 560);
      // three clean stripes, rolled one after another
      const st = [0, 1, 2].map(i => { const q = tween(u, ro - 0.8 + i * 0.6, ro + 0.2 + i * 0.6, ease.inOut); return [140, 150 + i * 150, (W - 280) * q, 120]; });
      sootyRoom(ctx, S, 1, st);
      ctx.fillStyle = '#d9a866'; ctx.fillRect(0, 760, W, 300);
      const active = st.findLast(s => s[2] > 0) || st[0];
      const bx = 140 + active[2], by = active[1] + 60;
      k.dough(ctx, bx, by, 46, PUTTY, 0.2 + 0.1 * Math.sin(u * 12), 3);
      k.figure(ctx, Math.min(bx - 40, 760), 1010, { ...MAID, s: 1.0, face: 1, mood: 'happy', armF: [lerp(1.2, 2.6, (by - 150) / 400 < 0 ? 0 : 1 - (by - 150) / 400), 0.1] });
      // the can
      const cp = pop(u, ku - 0.2, 0.4);
      if (cp > 0) { ctx.save(); ctx.translate(860, 1000); ctx.scale(cp, cp); k.doughCan(ctx, 0, 0, 1.2, 'KUTOL WALLPAPER CLEANER', '#b5553a', P.lapis, tween(u, so - 0.2, so + 0.3), PUTTY); ctx.restore(); }
      k.label(ctx, 'KUTOL', 860, 780, 26, tween(u, ku, ku + 0.3));
    },
  },
  { // 19.1 "Then, after World War II, homes switch from coal to gas and oil."
    start: 18.95, title: 'After World War II', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const sw = S.at('switch'), ga = S.at('gas');
      S.cam(lerp(1.0, 1.08, tween(u, 0, 5)), W / 2, 580);
      interior(ctx, S, { window: true, carpetColor: P.lapis });
      // the coal stove fades away; a gas heater with a blue flame arrives
      const out = tween(u, sw - 0.2, ga);
      ctx.save(); ctx.globalAlpha = 1 - out; k.coalStove(ctx, 300, 1000, 1.0, S.t, 1 - out, 1 - out); ctx.restore();
      if (out > 0) {
        ctx.save(); ctx.globalAlpha = out; ctx.translate(640, 1000);
        k.rect(ctx, -120, -260, 240, 260, P.white, P.ink, 2.5);
        for (let i = 0; i < 7; i++) k.rect(ctx, -100 + i * 30, -240, 20, 160, '#dfe3e6', P.ink, 1.2);
        k.rect(ctx, -90, -70, 180, 50, '#2a2f45', P.ink, 2);
        for (let i = 0; i < 6; i++) { const f = 1 + 0.2 * Math.sin(S.t * 16 + i); ctx.beginPath(); ctx.moveTo(-70 + i * 28, -30); ctx.quadraticCurveTo(-76 + i * 28, -46 * f, -64 + i * 28, -60 * f); ctx.quadraticCurveTo(-56 + i * 28, -46 * f, -52 + i * 28, -30); k.fillStroke(ctx, '#5fa8e8', '#1f4f8f', 1); }
        ctx.restore();
      }
      k.label(ctx, 'COAL', 300, 360, 26, 1 - out);
      k.label(ctx, 'GAS & OIL', 640, 640, 28, tween(u, ga, ga + 0.3));
      k.seal(ctx, 820, 250, 60, ' AFTER THE WAR · AFTER ·', 'WWII', tween(u, 0.3, 0.6, ease.linear), P.lapis);
    },
  },
  { // 24.4 "Washable wallpaper arrives."
    start: 24.15, title: 'Washable Wallpaper', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const wa = S.at('Washable');
      const sw = tween(u, wa, wa + 1.4, ease.inOut);
      sootyRoom(ctx, S, 0.7, [[0, 74, W * sw, 562]]);
      ctx.fillStyle = '#d9a866'; ctx.fillRect(0, 760, W, 300);
      // a wet cloth wipes the wall in one sweep
      const cx = W * sw;
      k.rect(ctx, cx - 40, 300, 80, 110, '#bcd6df', P.ink, 2);
      for (let i = 0; i < 8; i++) { const q = (u * 2 + i / 8) % 1; k.circle(ctx, cx - 30 + (i % 4) * 20, 420 + q * 200, 5, '#9fd3e8', P.ink, 1); }
      for (let i = 0; i < 8; i++) k.star(ctx, cx - 300 + i * 40, 240 + (i % 3) * 140, 8, sw);
      k.figure(ctx, Math.min(cx, 820), 1010, { ...MAID, s: 1.0, face: 1, mood: 'happy', armF: [2.4, 0.2] });
      k.label(ctx, 'WASHABLE', W / 2, 700, 30, tween(u, wa, wa + 0.3));
    },
  },
  { // 26.6 "Nobody needs the putty anymore."
    start: 26.35, title: 'Nobody Needs It', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const nb = S.at('Nobody'), an = S.at('anymore');
      interior(ctx, S, { window: false, carpet: false });
      ctx.save(); ctx.fillStyle = 'rgba(40,45,60,0.35)'; ctx.fillRect(0, 0, W, H); ctx.restore();
      ctx.fillStyle = '#b08a5a'; ctx.fillRect(0, 760, W, 300);
      for (let r = 0; r < 3; r++) for (let i = 0; i < 6 - r; i++) k.doughCan(ctx, 220 + i * 110 + r * 55, 1000 - r * 140, 0.95, 'KUTOL', '#b5553a', P.lapis);
      k.cobweb(ctx, 0, 74, 160, 0); k.cobweb(ctx, W, 74, 160, 1);
      k.stamp(ctx, 'NOT NEEDED', W / 2, 360, 70, tween(u, an - 0.1, an + 0.15, ease.linear), -0.1);
    },
  },
  { // 29.2 "Then Kay Zufall, a nursery school teacher in the family, reads that kids are modeling with wallpaper cleaner."
    start: 28.9, title: 'Kay Zufall', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const ka = S.at('Kay'), nu = S.at('nursery'), re = S.at('reads');
      S.cam(lerp(1.0, 1.12, tween(u, re - 0.5, re + 1.5, ease.inOut)), lerp(W / 2, 560, tween(u, re - 0.5, re + 1.5)), lerp(560, 600, tween(u, re - 0.5, re + 1.5)));
      interior(ctx, S, { window: true, carpetColor: P.verm });
      lamp(ctx, S, 760, 230, 1);
      k.figure(ctx, 280, 1000, { ...KAY, s: 1.25, face: 1, mood: u > re + 0.8 ? 'happy' : 'calm', armF: [1.6, 0.4], kneel: true });
      k.label(ctx, 'KAY ZUFALL', 280, 560, 28, tween(u, ka, ka + 0.3));
      k.label(ctx, 'NURSERY SCHOOL TEACHER', 280, 620, 20, tween(u, nu, nu + 0.3));
      const np = tween(u, re - 0.2, re + 0.4, ease.outBack);
      if (np > 0) { ctx.save(); ctx.translate(620, 690); ctx.scale(np, np); k.newspaper(ctx, 0, 0, 340, -0.06, 'CHILDREN MODEL WITH\nWALLPAPER CLEANER', 'THE DAILY NEWS'); ctx.restore(); }
      if (u > re + 1.2) medallion(ctx, k, P, '!', 840, 420, pop(u, re + 1.2, 0.3), P.verm);
    },
  },
  { // 36.0 "She tries it with her class. The kids love it."
    start: 35.85, title: 'Her Class', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const lo = S.at('love');
      S.cam(lerp(1.08, 1.0, tween(u, 0, 3.8)), W / 2, 580);
      interior(ctx, S, { window: true, carpet: false });
      ctx.fillStyle = '#d9a866'; ctx.fillRect(0, 760, W, 300);
      k.figure(ctx, 840, 820, { ...KAY, s: 0.85, face: -1, mood: 'happy', armF: [1.4, 0.4] });
      kidsTable(ctx, S, u, false, lo - 0.2);
      if (u > lo - 0.1) for (let i = 0; i < 10; i++) { const q = ((u - lo) * 0.8 + i / 10) % 1; heart(ctx, k, P, 80 + (i * 97) % 760, 620 - q * 420, 1.3, 1 - q); }
      k.label(ctx, 'THE KIDS LOVE IT', W / 2, 260, 30, tween(u, lo, lo + 0.3));
    },
  },
  { // 39.9 "Her idea? Sell it as a toy."
    start: 39.65, title: 'Her Idea', trans: 'flash',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const id = S.at('idea'), to = S.at('toy');
      k.goldSky(ctx, -60, -60, W + 120, H + 120, S.t);
      const lit = tween(u, id - 0.05, id + 0.2);
      if (lit > 0) { ctx.save(); ctx.translate(W / 2, 260); for (let i = 0; i < 24; i++) { ctx.rotate(TAU / 24); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-30, 900); ctx.lineTo(30, 900); ctx.closePath(); ctx.fillStyle = `rgba(255,250,210,${0.25 * lit})`; ctx.fill(); } ctx.restore(); }
      ctx.save(); ctx.translate(W / 2, 260); ctx.scale(2, 2); lamp(ctx, S, 0, 0, lit); ctx.restore();
      k.carpet(ctx, 120, 820, W - 240, 200, P.verm, P.lapis);
      k.figure(ctx, 260, 1000, { ...KAY, s: 1.2, face: 1, mood: 'happy', armF: [lit > 0.5 ? 2.7 : 1.0, 0.1] });
      // the wall-cleaner can becomes a toy, with a bow
      const tk = tween(u, to - 0.2, to + 0.3, ease.outBack);
      ctx.save(); ctx.translate(680, 940); ctx.scale(lerp(0.9, 1.2, tk), lerp(0.9, 1.2, tk));
      k.doughCan(ctx, 0, 0, 1.3, tk > 0.5 ? 'A TOY!' : 'KUTOL', tk > 0.5 ? P.ochre : '#b5553a', tk > 0.5 ? P.verm : P.lapis, 0);
      if (tk > 0.5) { for (const sx of [-1, 1]) { ctx.beginPath(); ctx.ellipse(sx * 24, -176, 26, 14, sx * 0.4, 0, TAU); k.fillStroke(ctx, P.verm, P.ink, 2); } k.circle(ctx, 0, -176, 10, P.verm, P.ink, 2); }
      ctx.restore();
      medallion(ctx, k, P, '?', W / 2, 520, pop(u, id - 0.1, 0.35) * (1 - tween(u, to - 0.2, to)));
    },
  },
  { // 42.8 "In 1956, it's reborn with a new name."
    start: 42.6, title: 'Reborn · 1956', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const yr = S.at('1956'), re = S.at('reborn'), nn = S.at('name');
      interior(ctx, S, { window: true, carpetColor: P.lapis });
      // old label peels away, the new can shines
      const peel = tween(u, re - 0.2, nn, ease.inOut);
      k.doughCan(ctx, W / 2, 960, 2.2, peel > 0.6 ? '' : 'WALLPAPER CLEANER', peel > 0.6 ? P.ochre : '#b5553a', P.verm, tween(u, nn, nn + 0.5), PUTTY);
      if (peel > 0 && peel < 1) { ctx.save(); ctx.translate(W / 2 + peel * 300, 820 - peel * 200); ctx.rotate(peel * 2); k.rect(ctx, -100, -60, 200, 120, P.paperLight, P.ink, 1.5); ctx.restore(); }
      if (u > nn) for (let i = 0; i < 14; i++) { const a = i / 14 * TAU, r = 120 + (u - nn) * 360; k.star(ctx, W / 2 + Math.cos(a) * r, 700 + Math.sin(a) * r * 0.6, 11, 1 - (u - nn) * 0.7); }
      k.seal(ctx, 820, 260, 66, ' REBORN · REBORN · REBORN ·', '1956', tween(u, yr, yr + 0.3, ease.linear));
      k.label(ctx, 'A NEW NAME', W / 2, 330, 30, tween(u, nn, nn + 0.3));
    },
  },
  { // 46.7 "Play-Doh. A wall cleaner that became a childhood classic."
    start: 46.55, title: 'Play-Doh', trans: 'flash',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const pd = S.at('Play-Doh'), cl = S.at('classic');
      S.cam(lerp(1.05, 1.0, tween(u, 0, 5)), W / 2, 560);
      land(ctx, S, { horizon: 330, seed: 137, clouds: 3 });
      bigSign(ctx, k, P, 'PLAY-DOH', W / 2, 330, 640, tween(u, pd - 0.05, pd + 0.35, ease.outBack), 110);
      // over the years: the colours arrive, can by can
      COLORS.forEach((c, i) => { const p = pop(u, pd + 0.6 + i * 0.25, 0.3); if (p <= 0) return; ctx.save(); ctx.translate(230 + i * 160, 720); ctx.scale(p, p); k.doughCan(ctx, 0, 0, 1.0, 'PLAY-DOH', P.ochre, c, 1, c); ctx.restore(); });
      kidsTable(ctx, S, u, true, cl - 0.3);
      k.label(ctx, 'A CHILDHOOD CLASSIC', W / 2, 520, 28, tween(u, cl, cl + 0.3));
    },
  },
  { // 52.6 "Every legend has a beginning."
    start: 51.9, title: 'Every Legend Has a Beginning', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W, H } = S, beg = S.at('beginning');
      ctx.save();
      S.cam(lerp(1.0, 1.4, tween(u, 0, beg)), lerp(W / 2, 520, tween(u, 0, beg)), lerp(580, 520, tween(u, 0, beg)));
      sootyRoom(ctx, S, 1, [[0, 270, W, 140]]);
      ctx.fillStyle = '#d9a866'; ctx.fillRect(0, 760, W, 300);
      const g = ctx.createRadialGradient(520, 340, 10, 520, 340, 200); g.addColorStop(0, 'rgba(255,240,170,0.85)'); g.addColorStop(1, 'rgba(255,240,170,0)');
      ctx.fillStyle = g; ctx.fillRect(320, 140, 400, 400);
      k.dough(ctx, 520, 340, 64, PUTTY, 0.15 + 0.05 * Math.sin(u * 4), 2);
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
export const sfx = [
  ...scenes.slice(1).map(s => ({ t: s.start - 0.05, type: s.trans === 'unroll' ? 'paper' : 'whoosh', gain: 0.35 })),
  { t: 0.9, type: 'slide', gain: 0.45 }, { t: 1.6, type: 'slide', gain: 0.45 }, { t: 2.4, type: 'stamp', gain: 0.8 },
  { t: 4.2, type: 'stamp', gain: 0.5 }, { t: 5.1, type: 'chime', gain: 0.4 }, { t: 5.4, type: 'wind', gain: 0.3 },
  { t: 7.6, type: 'sizzle', gain: 0.3 }, { t: 8.3, type: 'thud', gain: 0.4 }, { t: 9.9, type: 'wind', gain: 0.35 }, { t: 11.12, type: 'stamp', gain: 0.7 },
  { t: 13.32, type: 'pluck', gain: 0.5 }, { t: 14.4, type: 'pop', gain: 0.6, pitch: 0.7 }, { t: 15.8, type: 'slide', gain: 0.4 }, { t: 16.4, type: 'slide', gain: 0.4 }, { t: 17.0, type: 'slide', gain: 0.4 }, { t: 17.82, type: 'chime', gain: 0.5 },
  { t: 20.14, type: 'thunder', gain: 0.25 }, { t: 21.3, type: 'sizzle', gain: 0.25 }, { t: 22.42, type: 'whoosh', gain: 0.4 }, { t: 22.5, type: 'sizzle', gain: 0.3 },
  { t: 24.3, type: 'splash', gain: 0.5 }, { t: 25.2, type: 'chime', gain: 0.45, pitch: 1.3 },
  { t: 26.6, type: 'crickets', gain: 0.3 }, { t: 27.4, type: 'flop', gain: 0.5 }, { t: 27.5, type: 'stamp', gain: 0.7 },
  { t: 29.14, type: 'pluck', gain: 0.5 }, { t: 30.6, type: 'chime', gain: 0.3 }, { t: 32.5, type: 'paper', gain: 0.5 }, { t: 34.1, type: 'chime', gain: 0.5 },
  { t: 36.4, type: 'pop', gain: 0.4 }, { t: 38.3, type: 'coins', gain: 0.3 }, { t: 38.32, type: 'chime', gain: 0.45 },
  { t: 39.88, type: 'gong', gain: 0.6 }, { t: 41.4, type: 'riser', gain: 0.3 }, { t: 41.58, type: 'pop', gain: 0.7 }, { t: 41.6, type: 'chime', gain: 0.5 },
  { t: 42.8, type: 'stamp', gain: 0.6 }, { t: 44.4, type: 'paper', gain: 0.5 }, { t: 45.54, type: 'chime', gain: 0.55 },
  { t: 46.66, type: 'gong', gain: 0.8 }, ...pops(47.2, 4, 0.25, 0.5), { t: 50.7, type: 'chime', gain: 0.5 },
  { t: 53.78, type: 'pop', gain: 0.8 }, { t: 53.82, type: 'gong', gain: 0.9 },
];

export const music = {
  bpm: 100, root: 'E', maqam: 'rast', gain: 0.32,
  sections: [
    { from: 0, to: 7.45, mood: 'intro' },
    { from: 7.45, to: 18.95, mood: 'groove' },
    { from: 18.95, to: 26.35, mood: 'drive' },
    { from: 26.35, to: 28.9, mood: 'sad' },
    { from: 28.9, to: 39.65, mood: 'groove' },
    { from: 39.65, to: 53.8, mood: 'triumph' },
    { from: 53.8, to: 56.8, mood: 'end' },
  ],
};
