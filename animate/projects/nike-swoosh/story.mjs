// "How the Nike Swoosh Started" — an Ottoman miniature chronicle of a $35 sketch.
// u = seconds since the scene started; S.at('word') = when that word is said.
import { clamp, lerp, ease, tween, rng, TAU, shake, pop } from '../../lib/core.mjs';
import { land, interior, lamp, bookCover, bigSign, medallion, compassRose } from '../../styles/ottoman/scenes.mjs';

export const meta = {
  title: 'How the Nike Swoosh Started',
  slug: 'nike-swoosh-ottoman',
  style: 'ottoman',
  look: 'tile',
  room: 'tent',
  width: 1080, height: 1920, fps: 30,
  duration: 58.5,
  voice: 'voice.mp3',
  seed: 97,
  captionChars: 30,
  brand: { handle: '@HOWITSTARTED-YT1', logo: '../../../brand/logo.png' },
  outro: { at: 56.7, text: 'Subscribe for more origin stories' },
};

const KNIGHT = { robe: '#20408f', robeP: 'stripes', robePc: '#3f68bd', inner: '#f7eed6', sash: '#c4371f', hat: 'shorthair', hair: '#5a3a22' };
const CAROLYN = { robe: '#3d8458', robeP: 'flowers', robePc: '#f7eed6', inner: '#f8f2e2', sash: '#d6973a', hat: 'hotoz', hatColor: '#c4371f', veil: '#f8f2e2', hair: '#6b4a32' };
const SKINS = ['#f1d1a8', '#c68a5e', '#8a5a3c', '#e2b48a', '#a86c45'];

function dollarCoin(ctx, S, x, y, r, sc = 1, text = '$35') {
  if (sc <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); S.k.coin(ctx, 0, 0, r, 0, text); ctx.restore();
}
function sketchSheet(ctx, S, x, y, w, kind, k = 1, rot = 0, glow = 0) {
  const { k: K, P } = S;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  if (glow > 0) { const g = ctx.createRadialGradient(0, 0, 10, 0, 0, w); g.addColorStop(0, `rgba(255,240,170,${0.8 * glow})`); g.addColorStop(1, 'rgba(255,240,170,0)'); ctx.fillStyle = g; ctx.fillRect(-w, -w, 2 * w, 2 * w); }
  K.rect(ctx, -w / 2, -w * 0.6, w, w * 1.2, P.white, P.ink, 2);
  const s = w / 300;
  if (kind === 'stroke') K.curvedStroke(ctx, 0, 0, s, P.ink, k);
  else if (kind === 'circle') { ctx.beginPath(); ctx.arc(0, 0, 70 * s, 0, TAU * k); K.stroke(ctx, P.ink, 10 * s); }
  else if (kind === 'stripes') { for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-80 * s, (-30 + i * 30) * s); ctx.lineTo((-80 + 160 * k) * s, (-50 + i * 30) * s); K.stroke(ctx, P.ink, 12 * s); } }
  else if (kind === 'star') { K.star(ctx, 0, 0, 80 * s * k, 1); }
  else if (kind === 'wing') { ctx.beginPath(); ctx.moveTo(-90 * s, 30 * s); ctx.quadraticCurveTo(0, -80 * s * k, 90 * s, -20 * s); K.stroke(ctx, P.ink, 12 * s); }
  ctx.restore();
}

export const scenes = [
  { // 0.0 "The Nike swoosh cost $35."
    start: 0, title: 'A $35 Logo',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const sw = S.at('swoosh'), co = S.at('cost');
      k.goldSky(ctx, -60, -60, W + 120, 1300, S.t);
      for (let i = 0; i < 3; i++) k.cloud(ctx, 150 + i * 320, 150 + (i % 2) * 60, 1.0, i + 200);
      sketchSheet(ctx, S, W / 2, 470, 420, 'stroke', tween(u, sw - 0.3, sw + 0.4), -0.04, 0.4);
      dollarCoin(ctx, S, 760, 830, 110, pop(u, co + 0.3, 0.4));
      k.stamp(ctx, 'ONLY $35', 330, 860, 64, tween(u, co + 0.5, co + 0.75, ease.linear), -0.12);
    },
  },
  { // 4.1 "1971, Portland, Oregon."
    start: 4.0, title: 'Portland, Oregon · 1971', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const po = S.at('Portland');
      S.cam(lerp(1.1, 1.0, tween(u, 0, 3.4)), W / 2, 560);
      k.goldSky(ctx, -60, -60, W + 120, 500, S.t);
      // a mountain over the city
      k.spongy(ctx, 680, 460, 520, 340, P.lavLight, 5);
      k.ground(ctx, -60, 440, W + 120, 700, P.sage, 21, 0.4);
      ctx.save(); ctx.beginPath(); ctx.moveTo(-20, 860); ctx.bezierCurveTo(300, 800, 600, 920, 960, 840); ctx.lineTo(960, 930); ctx.bezierCurveTo(600, 1010, 300, 890, -20, 950); ctx.closePath(); ctx.clip(); k.waves(ctx, -20, 780, 1000, 260, S.t, P.water, P.waterLight, 24, 22); ctx.restore();
      for (let i = 0; i < 5; i++) k.house(ctx, 110 + i * 180, 760, 130, 100, { wall: [P.white, P.ochreLight, '#b5553a'][i % 3], roof: P.ink, chimney: i % 2 === 0 });
      for (const x of [60, 880, 300, 620]) k.cypress(ctx, x, x === 300 || x === 620 ? 620 : 1000, 220, S.t, x);
      k.label(ctx, 'PORTLAND · OREGON', W / 2, 220, 30, tween(u, po, po + 0.3));
      k.seal(ctx, 160, 1000, 62, ' PORTLAND · OREGON ·', '1971', tween(u, 0.1, 0.4, ease.linear));
    },
  },
  { // 7.6 "Phil Knight is teaching accounting at Portland State University."
    start: 7.45, title: 'Phil Knight', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const pk = S.at('Phil'), ac = S.at('accounting'), ps = S.at('State');
      interior(ctx, S, { window: true, carpetColor: P.lapis });
      k.rect(ctx, 520, 250, 360, 250, '#2f3b33', P.brown, 8);
      ctx.save(); ctx.beginPath(); ctx.rect(530, 260, 340 * tween(u, ac - 0.4, ac + 0.8), 230); ctx.clip();
      ctx.fillStyle = 'rgba(255,255,255,0.88)'; ctx.font = '700 30px Fell'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ['ASSETS     $ 1,200', 'LIABIL.      $   800', 'EQUITY      $   400'].forEach((ln, i) => ctx.fillText(ln, 550, 300 + i * 56));
      ctx.beginPath(); ctx.moveTo(550, 440); ctx.lineTo(840, 440); ctx.strokeStyle = 'rgba(255,255,255,0.88)'; ctx.lineWidth = 3; ctx.stroke();
      ctx.restore();
      k.figure(ctx, 330, 1010, { ...KNIGHT, s: 1.2, face: 1, mood: 'calm', armF: [2.2, 0.2] });
      for (let i = 0; i < 3; i++) k.figure(ctx, 620 + i * 110, 1010, { s: 0.6, face: -1, kneel: true, skin: SKINS[i], robe: [P.lav, P.ochre, P.turq][i], robeP: 'dots', hat: i % 2 ? 'hotoz' : 'cap', hatColor: P.lapis, veil: P.white, armF: [1.0, 0.8] });
      k.label(ctx, 'PHIL KNIGHT', 330, 560, 28, tween(u, pk, pk + 0.3));
      k.label(ctx, 'PORTLAND STATE UNIVERSITY', W / 2, 160, 22, tween(u, ps, ps + 0.3));
    },
  },
  { // 11.3 "His shoe company needs a logo, fast."
    start: 11.1, title: 'A Logo, Fast', trans: 'wipe',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const lo = S.at('logo'), fa = S.at('fast');
      k.goldSky(ctx, -60, -60, W + 120, H + 120, S.t);
      k.carpet(ctx, 100, 820, W - 200, 200, P.verm, P.lapis);
      k.sneaker(ctx, W / 2, 700, 2.0, P.white, null);
      medallion(ctx, k, P, '?', W / 2 + 10, 600, pop(u, lo - 0.2, 0.35));
      const hg = tween(u, 0.2, fa + 0.6);
      k.hourglass(ctx, 830, 330, 0.8, hg, Math.sin(u * 8) * 0.06 * tween(u, fa - 0.2, fa));
      k.label(ctx, 'NEEDS A LOGO', W / 2, 240, 30, tween(u, lo, lo + 0.3));
    },
  },
  { // 14.6 "He hires a graphic design student, Carolyn Davidson."
    start: 14.35, title: 'Carolyn Davidson', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const gd = S.at('graphic'), cd = S.at('Carolyn');
      interior(ctx, S, { window: true, carpetColor: P.green });
      lamp(ctx, S, 760, 220, 1);
      k.easel(ctx, 640, 1000, 320, 300, c => { c.fillStyle = P.white; c.fillRect(-160, -160, 320, 320); });
      k.figure(ctx, 320, 1010, { ...CAROLYN, s: 1.2, face: 1, mood: 'happy', armF: [1.7, 0.3], hold: c => { c.rotate(-0.5); k.rect(c, -3, -46, 6, 50, P.ink, P.ink, 1); } });
      k.label(ctx, 'CAROLYN DAVIDSON', 330, 560, 26, tween(u, cd, cd + 0.3));
      k.label(ctx, 'GRAPHIC DESIGN STUDENT', 330, 620, 20, tween(u, gd, gd + 0.3));
    },
  },
  { // 18.4 "She sketches idea after idea. One looks like motion, a simple curved stroke."
    start: 18.1, title: 'Idea After Idea', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const sk = S.at('sketches'), mo = S.at('motion'), cs = S.at('curved');
      ctx.fillStyle = P.paperLight; ctx.fillRect(-60, -60, W + 120, H + 120);
      ctx.fillStyle = k.pattern(ctx, 'flowers', P.paperLight, '#e6d6ad', 40); ctx.fillRect(-60, -60, W + 120, H + 120);
      const kinds = ['circle', 'stripes', 'star', 'wing', 'circle', 'stripes'];
      kinds.forEach((kd, i) => { const p = pop(u, sk - 0.2 + i * 0.3, 0.3); if (p <= 0) return; ctx.save(); ctx.globalAlpha = 1 - tween(u, mo - 0.3, mo) * 0.6; sketchSheet(ctx, S, 170 + (i % 3) * 300, 250 + Math.floor(i / 3) * 330, 220 * p, kd, 1, (i % 2 ? 0.08 : -0.06)); ctx.restore(); });
      // the one that looks like motion
      const ms = tween(u, mo - 0.3, mo + 0.2, ease.outBack);
      if (ms > 0) sketchSheet(ctx, S, W / 2, 620, 420 * ms, 'stroke', tween(u, mo, cs + 0.6), -0.03, 0.6);
      k.label(ctx, 'MOTION', W / 2, 980, 32, tween(u, mo + 0.2, mo + 0.5));
    },
  },
  { // 24.9 "Knight's reaction? I don't love it, but maybe it will grow on me."
    start: 24.7, title: "Knight's Reaction", trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const dl = S.at("don't"), gr = S.at('grow');
      interior(ctx, S, { window: true, carpetColor: P.lapis });
      sketchSheet(ctx, S, 640, 600, 300, 'stroke', 1, -0.04);
      k.figure(ctx, 290, 1010, { ...KNIGHT, s: 1.2, face: 1, mood: u > gr ? 'happy' : 'calm', look: Math.sin(u * 2) * 0.2, armF: [0.9, 1.9], armB: [0.2, 0.2] });
      const b1 = tween(u, dl - 0.2, dl + 0.2, ease.outBack), b2 = tween(u, gr - 0.6, gr - 0.2, ease.outBack);
      if (b1 > 0) { ctx.save(); ctx.translate(500, 250); ctx.scale(b1, b1); k.speechBubble(ctx, 0, 0, '“I DON’T LOVE IT…”', 30, -1); ctx.restore(); }
      if (b2 > 0) { ctx.save(); ctx.translate(560, 380); ctx.scale(b2, b2); k.speechBubble(ctx, 0, 0, '“…MAYBE IT WILL GROW ON ME”', 24, -1); ctx.restore(); }
    },
  },
  { // 30.4 "She sends him a bill for $35."
    start: 30.1, title: 'The Bill: $35', trans: 'flash',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const bi = S.at('bill');
      k.goldSky(ctx, -60, -60, W + 120, H + 120, S.t);
      const fly = tween(u, bi - 0.5, bi + 0.4, ease.inOut);
      ctx.save(); ctx.translate(lerp(250, W / 2, fly), lerp(900, 500, fly)); ctx.rotate(lerp(-0.4, -0.04, fly)); ctx.scale(lerp(0.5, 1, fly), lerp(0.5, 1, fly));
      k.rect(ctx, -200, -260, 400, 520, P.white, P.ink, 3);
      ctx.fillStyle = P.ink; ctx.font = '900 40px Deco'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('INVOICE', 0, -200);
      ctx.font = '700 24px Fell'; ctx.fillText('Logo design', 0, -110);
      for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-150, -50 + i * 40); ctx.lineTo(150, -50 + i * 40); k.stroke(ctx, P.grey, 2); }
      ctx.fillStyle = P.verm; ctx.font = '900 64px Deco'; ctx.fillText('$35', 0, 170);
      ctx.restore();
      k.label(ctx, 'THE BILL', W / 2, 140, 30, tween(u, bi, bi + 0.3));
    },
  },
  { // 33.1 "The swoosh goes on the shoes. The company becomes Nike, one of the biggest sports brands on Earth."
    start: 32.9, title: 'On the Shoes', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const sh = S.at('shoes'), nk = S.at('Nike'), ea = S.at('Earth');
      const world = tween(u, nk + 0.3, nk + 1.2, ease.inOut);
      if (world < 1) {
        ctx.save(); ctx.globalAlpha = 1 - world;
        k.goldSky(ctx, -60, -60, W + 120, H + 120, S.t);
        k.carpet(ctx, 100, 820, W - 200, 200, P.verm, P.lapis);
        k.sneaker(ctx, W / 2, 700, 2.0, P.white, c => k.curvedStroke(c, 0, 0, 0.45, P.verm, tween(u, sh - 0.4, sh + 0.2)));
        ctx.restore();
      }
      if (world > 0) {
        ctx.save(); ctx.globalAlpha = world;
        ctx.fillStyle = '#efdcb0'; ctx.fillRect(-60, -60, W + 120, H + 120);
        compassRose(ctx, k, P, W / 2, 540, 90, S.t * 0.05);
        const land1 = [[60, 120], [260, 90], [380, 160], [330, 260], [400, 320], [310, 420], [250, 470], [300, 560], [380, 640], [340, 800], [260, 960], [200, 1000], [180, 820], [120, 640], [150, 520], [90, 400], [40, 260]];
        const land2 = [[620, 60], [900, 50], [920, 220], [860, 300], [900, 360], [940, 520], [880, 760], [760, 900], [700, 760], [620, 560], [600, 440], [660, 380], [600, 300], [640, 200]];
        for (const pts of [land1, land2]) { ctx.beginPath(); k.smoothPath(ctx, pts); k.fillStroke(ctx, '#cdb57a', P.ink, 2.5); }
        [[230, 250], [300, 640], [220, 880], [760, 170], [800, 420], [770, 720], [160, 420], [680, 600]].forEach(([x, y], i) => { const p = pop(u, nk + 0.6 + i * 0.15, 0.3); if (p > 0) k.sneaker(ctx, x, y, 0.35 * p, P.white, c => k.curvedStroke(c, 0, 0, 0.45, P.verm, 1)); });
        ctx.restore();
      }
      k.label(ctx, 'NIKE', W / 2, 220, 36, tween(u, nk, nk + 0.3));
      k.label(ctx, 'ONE OF THE BIGGEST', W / 2, 1000, 24, tween(u, ea - 0.6, ea - 0.3));
    },
  },
  { // 40.9 "In 1983, Knight surprises her with a gold swoosh ring with a diamond and shares of Nike stock."
    start: 40.6, title: 'A Gift · 1983', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const su = S.at('surprises'), di = S.at('diamond'), sh = S.at('shares');
      interior(ctx, S, { window: true, carpetColor: P.verm });
      k.figure(ctx, 240, 1010, { ...KNIGHT, hair: '#7a6a5a', s: 1.1, face: 1, mood: 'happy', armF: [1.6, 0.1] });
      k.figure(ctx, 760, 1010, { ...CAROLYN, s: 1.1, face: -1, mood: u > su ? 'happy' : 'calm', armF: [u > di ? 2.4 : 1.2, 0.3] });
      // a ring box opens
      const op = tween(u, su - 0.2, su + 0.5);
      ctx.save(); ctx.translate(W / 2, 640);
      k.rect(ctx, -70, -10, 140, 70, P.vermDark, P.ink, 2);
      ctx.save(); ctx.translate(0, -10); ctx.scale(1, Math.cos(op * 1.9)); k.rect(ctx, -70, -60, 140, 60, P.verm, P.ink, 2); ctx.restore();
      ctx.restore();
      if (op > 0.5) { k.ring(ctx, W / 2, 600, 50, S.t, tween(u, di - 0.2, di + 0.2)); k.curvedStroke(ctx, W / 2, 520, 0.22, P.goldLight, 1); }
      const cp = tween(u, sh - 0.3, sh + 0.3, ease.outBack);
      if (cp > 0) { ctx.save(); ctx.translate(W / 2, 330); ctx.scale(cp, cp); k.certificate(ctx, 0, 0, 340, 0.04, 'SHARES', 'of stock'); ctx.restore(); }
      k.seal(ctx, 150, 230, 60, ' A SURPRISE · A SURPRISE ·', '1983', tween(u, S.at('1983'), S.at('1983') + 0.3, ease.linear));
    },
  },
  { // 47.6 "A $35 sketch, now one of the most famous logos ever."
    start: 47.5, title: 'A $35 Sketch', trans: 'flash',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const sk = S.at('sketch'), fm = S.at('famous');
      k.goldSky(ctx, -60, -60, W + 120, H + 120, S.t);
      ctx.save(); ctx.translate(W / 2, 520); for (let i = 0; i < 24; i++) { ctx.rotate(TAU / 24); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-30, 900); ctx.lineTo(30, 900); ctx.closePath(); ctx.fillStyle = `rgba(255,250,210,${0.3 * tween(u, fm - 0.4, fm)})`; ctx.fill(); } ctx.restore();
      k.frame(ctx, W / 2, 520, 460, 380, c => { c.fillStyle = P.white; c.fillRect(-240, -200, 480, 400); k.curvedStroke(c, 0, 0, 1.5, P.ink, 1); });
      dollarCoin(ctx, S, 820, 850, 90, pop(u, sk - 0.3, 0.35));
      k.label(ctx, 'ONE OF THE MOST FAMOUS LOGOS', W / 2, 900, 22, tween(u, fm, fm + 0.3));
    },
  },
  { // 54.3 "Every legend has a beginning."
    start: 53.9, title: 'Every Legend Has a Beginning', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W, H } = S, beg = S.at('beginning');
      ctx.fillStyle = P.paperLight; ctx.fillRect(-60, -60, W + 120, H + 120);
      ctx.save(); S.cam(lerp(1.0, 1.4, tween(u, 0, beg)), W / 2, 560);
      sketchSheet(ctx, S, W / 2, 560, 420, 'stroke', 1, -0.03, 0.7);
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
  { t: 0.3, type: 'whoosh', gain: 0.5 }, { t: 1.2, type: 'coins', gain: 0.4 }, { t: 1.5, type: 'stamp', gain: 0.8 },
  { t: 4.12, type: 'stamp', gain: 0.5 }, { t: 5.7, type: 'chime', gain: 0.4 },
  { t: 7.6, type: 'pluck', gain: 0.5 }, { t: 8.6, type: 'paper', gain: 0.3 }, { t: 9.9, type: 'chime', gain: 0.35, pitch: 0.8 },
  { t: 12.46, type: 'pop', gain: 0.5 }, { t: 13.38, type: 'riser', gain: 0.4 }, { t: 13.5, type: 'clank', gain: 0.4 },
  { t: 16.62, type: 'pluck', gain: 0.5 }, { t: 15.5, type: 'chime', gain: 0.3 },
  ...pops(18.3, 6, 0.3, 0.35), { t: 21.7, type: 'whoosh', gain: 0.6 }, { t: 21.75, type: 'chime', gain: 0.5 },
  { t: 26.4, type: 'pluck', gain: 0.4, pitch: 0.75 }, { t: 28.3, type: 'pop', gain: 0.5 }, { t: 29.14, type: 'chime', gain: 0.4 },
  { t: 30.66, type: 'paper', gain: 0.5 }, { t: 31.5, type: 'coins', gain: 0.4 }, { t: 31.6, type: 'stamp', gain: 0.6 },
  { t: 33.6, type: 'whoosh', gain: 0.5 }, { t: 34.36, type: 'pop', gain: 0.6 }, { t: 36.4, type: 'gong', gain: 0.7 }, ...pops(37.0, 8, 0.15, 0.3), { t: 39.64, type: 'chime', gain: 0.5 },
  { t: 41.0, type: 'stamp', gain: 0.5 }, { t: 42.6, type: 'paper', gain: 0.35 }, { t: 44.9, type: 'chime', gain: 0.6, pitch: 1.5 }, { t: 46.2, type: 'paper', gain: 0.4 }, { t: 46.5, type: 'coins', gain: 0.35 },
  { t: 49.3, type: 'coins', gain: 0.35 }, { t: 51.56, type: 'gong', gain: 0.7 }, { t: 51.6, type: 'chime', gain: 0.5 },
  { t: 55.52, type: 'whoosh', gain: 0.6 }, { t: 55.56, type: 'gong', gain: 0.9 },
];

export const music = {
  bpm: 104, root: 'F', maqam: 'hicaz', gain: 0.32,
  sections: [
    { from: 0, to: 7.45, mood: 'intro' },
    { from: 7.45, to: 18.1, mood: 'groove' },
    { from: 18.1, to: 30.1, mood: 'drive' },
    { from: 30.1, to: 32.9, mood: 'groove' },
    { from: 32.9, to: 55.52, mood: 'triumph' },
    { from: 55.52, to: 58.5, mood: 'end' },
  ],
};
