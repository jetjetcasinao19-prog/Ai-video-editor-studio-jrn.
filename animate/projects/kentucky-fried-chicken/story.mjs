// "How Kentucky Fried Chicken Started" — an Ottoman miniature chronicle of a man who started over at 65.
// u = seconds since the scene started; S.at('word') = when that word is said.
import { clamp, lerp, ease, tween, rng, TAU, shake, pop } from '../../lib/core.mjs';
import { land, interior, lamp, bookCover, bigSign, medallion, usMap } from '../../styles/ottoman/scenes.mjs';

export const meta = {
  title: 'How Kentucky Fried Chicken Started',
  slug: 'kentucky-fried-chicken-ottoman',
  style: 'ottoman',
  look: 'tile',
  room: 'tent',
  width: 1080, height: 1920, fps: 30,
  duration: 59.6,
  voice: 'voice.mp3',
  seed: 71,
  captionChars: 30,
  brand: { handle: '@HOWITSTARTED-YT1', logo: '../../../brand/logo.png' },
  outro: { at: 57.4, text: 'Subscribe for more origin stories' },
};

// Harland Sanders: white suit, white hair and goatee, glasses, black string tie.
const COLONEL = { robe: '#f4f1ea', robeP: 'dots', robePc: '#d9d4c8', inner: '#ffffff', sash: '#1a1a1a', hat: 'shorthair', hair: '#ececec', beard: 'short', beardColor: '#f2f2f2', mustache: true, mustacheColor: '#e6e6e6', glasses: true, stringTie: true, shoes: '#1a1a1a' };
const OWNER = { robe: '#20408f', robeP: 'stripes', robePc: '#ecd57a', hat: 'turban', hatColor: '#c4371f', mustache: true };
const TRAVEL_SKINS = ['#f1d1a8', '#c68a5e', '#e2b48a', '#8a5a3c'];

function road(ctx, S, y, h = 150) {
  const { k, P, W } = S;
  ctx.fillStyle = '#9a9488'; ctx.fillRect(-60, y, W + 120, h); k.rect(ctx, -60, y, W + 120, h, null, P.ink, 2);
  ctx.save(); ctx.setLineDash([40, 30]); ctx.beginPath(); ctx.moveTo(-60, y + h / 2); ctx.lineTo(W + 60, y + h / 2); k.stroke(ctx, P.goldLight, 5); ctx.restore();
}
function cafe(ctx, S, x, base, s = 1, sold = 0, emptyK = 0) {
  const { k, P } = S;
  ctx.save(); ctx.translate(x, base); ctx.scale(s, s);
  k.house(ctx, 0, 0, 340, 200, { wall: P.white, roof: P.verm, chimney: true, lit: emptyK < 0.5 });
  k.cartouche(ctx, 0, -270, 300, 70, P.lapis, P.goldLight, 4);
  ctx.fillStyle = P.goldLight; ctx.font = '900 30px Deco'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('CAFÉ · GAS', 0, -267);
  ctx.restore();
  k.gasPump(ctx, x + 230 * s, base, 0.9 * s, P.verm, 1 - emptyK);
  if (sold > 0) k.stamp(ctx, 'SOLD', x, base - 270 * s, 70 * s, sold, -0.15);
}

export const scenes = [
  { // 0.0 "At 65, he lost his business and was living on a $105 Social Security check."
    start: 0, title: 'Starting Over at 65',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const ls = S.at('lost'), ck = S.at('Social');
      S.cam(lerp(1.15, 1.0, tween(u, 0, 7)), W / 2, 560);
      interior(ctx, S, { window: true, carpetColor: P.vermDark });
      ctx.save(); ctx.fillStyle = 'rgba(30,35,60,0.2)'; ctx.fillRect(-60, -60, W + 120, 1200); ctx.restore();
      k.figure(ctx, 300, 1000, { ...COLONEL, s: 1.25, face: 1, kneel: true, mood: u > ls ? 'sad' : 'calm', look: u > ls ? 0.5 : 0, armF: [0.5, 0.9] });
      medallion(ctx, k, P, '', 300, 330, pop(u, 0, 0.35) * 1.4, P.lapis);
      if (u < 99) { const sc = pop(u, 0, 0.35); ctx.save(); ctx.translate(300, 334); ctx.scale(sc * 1.4, sc * 1.4); ctx.fillStyle = P.goldLight; ctx.font = '900 54px Deco'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('65', 0, 2); ctx.restore(); }
      // the check
      const cp = tween(u, S.at('$105') - 0.2, S.at('$105') + 0.4, ease.outBack);
      if (cp > 0) { ctx.save(); ctx.translate(680, 640); ctx.scale(cp, cp); k.bankCheck(ctx, 0, 0, 420, -0.06, '$105', 'Harland Sanders'); ctx.restore(); }
      k.label(ctx, 'SOCIAL SECURITY', 680, 480, 26, tween(u, ck, ck + 0.3));
      k.stamp(ctx, 'BUSINESS LOST', 680, 300, 50, tween(u, ls, ls + 0.25, ease.linear), -0.12);
    },
  },
  { // 7.8 "1930s, Corbin, Kentucky."
    start: 7.6, title: 'Corbin, Kentucky · 1930s', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const co = S.at('Corbin');
      S.cam(lerp(1.1, 1.0, tween(u, 0, 3)), W / 2, 560);
      land(ctx, S, { horizon: 330, seed: 141, clouds: 3, hillColors: [P.sageLight, P.green, P.lav, P.sage] });
      const R = rng(9);
      for (const [row, y, sc] of [[0, 520, 0.85], [1, 680, 1.0], [2, 840, 1.05]]) for (let i = 0; i < 5; i++) {
        const x = 90 + i * 190 + (row % 2) * 80;
        if (R() < 0.3) { k.blossomTree(ctx, x, y + 10, 170 * sc, S.t, i + row, P.green); continue; }
        k.house(ctx, x, y, 110 * sc, 86 * sc, { wall: [P.white, P.ochreLight, P.pink][(i + row) % 3], roof: [P.vermDark, P.lapis, P.ink][(i + row) % 3], chimney: R() < 0.5 });
      }
      k.label(ctx, 'CORBIN · KENTUCKY', W / 2, 270, 30, tween(u, co, co + 0.3));
      k.seal(ctx, 820, 1000, 62, ' THE 1930s · THE 1930s ·', '1930s', tween(u, 0.1, 0.4, ease.linear));
    },
  },
  { // 10.9 "Harland Sanders serves fried chicken to travelers at his roadside service station."
    start: 10.75, title: 'The Roadside Station', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const hs = S.at('Harland'), fc = S.at('fried'), tr = S.at('travelers');
      S.cam(lerp(1.06, 1.0, tween(u, 0, 5.4)), W / 2, 580);
      land(ctx, S, { horizon: 330, seed: 143, clouds: 2, hillColors: [P.sageLight, P.green, P.lav] });
      cafe(ctx, S, 380, 680, 1.0);
      road(ctx, S, 760, 140);
      const cx = lerp(-260, 720, tween(u, tr - 1.2, tr + 0.4, ease.outCubic));
      k.car(ctx, cx, 860, 1.1, S.t, P.lapisLight, '');
      k.figure(ctx, 210, 1040, { ...COLONEL, s: 0.95, face: 1, mood: 'happy', armF: [1.6, 0.1], hold: c => { c.rotate(-1.6); k.ellipse(c, 0, -30, 50, 12, 0, P.white, P.ink, 2); for (let i = 0; i < 3; i++) k.drumstick(c, -24 + i * 24, -40, 0.8, -0.4 + i * 0.4); } });
      for (let i = 0; i < 2; i++) k.figure(ctx, 520 + i * 150, 1040, { s: 0.75, face: -1, skin: TRAVEL_SKINS[i], robe: [P.ochre, P.green][i], robeP: 'dots', hat: i ? 'hotoz' : 'fez', hatColor: P.lapis, veil: P.white, mood: 'happy', armF: [1.3, 0.6], hold: c => k.drumstick(c, 0, -10, 0.9, -0.5) });
      k.label(ctx, 'HARLAND SANDERS', 210, 640, 24, tween(u, hs, hs + 0.3));
      k.label(ctx, 'FRIED CHICKEN', W / 2, 250, 30, tween(u, fc, fc + 0.3));
    },
  },
  { // 16.4 "Then, in 1956, plans are announced for a new highway that will skip his town."
    start: 16.2, title: 'A New Highway · 1956', trans: 'wipe',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const hw = S.at('highway'), sk = S.at('skip');
      ctx.fillStyle = '#efdcb0'; ctx.fillRect(-60, -60, W + 120, H + 120);
      // a surveyor's chart: the old road through town, the new highway curving around it
      ctx.fillStyle = '#cdb57a'; ctx.beginPath(); ctx.ellipse(W / 2, 560, 380, 420, 0, 0, TAU); ctx.fill(); k.stroke(ctx, P.ink, 2.5);
      ctx.beginPath(); ctx.moveTo(W / 2, 80); ctx.lineTo(W / 2, 1040); k.stroke(ctx, '#8a8478', 26); ctx.setLineDash([24, 18]); k.stroke(ctx, P.goldLight, 4); ctx.setLineDash([]);
      for (let i = 0; i < 5; i++) k.house(ctx, W / 2 + (i % 2 ? 90 : -90), 420 + i * 70, 70, 50, { wall: P.white, roof: P.verm });
      k.label(ctx, 'CORBIN', W / 2 - 200, 560, 22, 1);
      const nk = tween(u, hw - 0.4, sk + 0.4, ease.inOut);
      if (nk > 0) {
        const L = 1500;
        ctx.save(); ctx.setLineDash([L * nk, L]);
        ctx.beginPath(); ctx.moveTo(W / 2 + 40, 80); ctx.bezierCurveTo(W + 260, 300, W + 260, 820, W / 2 + 40, 1040);
        k.stroke(ctx, P.ink, 34); k.stroke(ctx, P.verm, 26); ctx.restore();
      }
      k.stamp(ctx, 'BYPASSED', W / 2, 220, 60, tween(u, sk + 0.3, sk + 0.55, ease.linear), -0.1);
      k.seal(ctx, 160, 960, 62, ' PLANS ANNOUNCED · NEW ROAD ·', '1956', tween(u, S.at('1956'), S.at('1956') + 0.3, ease.linear));
    },
  },
  { // 22.8 "Customers disappear."
    start: 22.6, title: 'Customers Disappear', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const di = S.at('disappear');
      const empty = tween(u, di - 0.4, di + 0.5);
      land(ctx, S, { horizon: 330, seed: 143, clouds: 2, hillColors: [P.sageLight, P.green, P.lav] });
      ctx.save(); ctx.fillStyle = `rgba(60,60,80,${0.3 * empty})`; ctx.fillRect(-60, -60, W + 120, 1200); ctx.restore();
      cafe(ctx, S, 380, 680, 1.0, 0, empty);
      road(ctx, S, 760, 140);
      for (let i = 0; i < 3; i++) { ctx.save(); ctx.globalAlpha = 1 - empty; k.car(ctx, 160 + i * 300 + empty * 600, 860, 0.9, S.t, [P.lapisLight, P.ochre, P.green][i], ''); ctx.restore(); }
      ctx.save(); ctx.translate(lerp(900, 300, u / 1.7), 330 + Math.sin(u * 7) * 10); ctx.beginPath(); ctx.moveTo(-26, 0); ctx.quadraticCurveTo(-10, -18 * Math.sin(u * 14), 0, 0); ctx.quadraticCurveTo(10, -18 * Math.sin(u * 14), 26, 0); k.stroke(ctx, P.ink, 3); ctx.restore();
      k.label(ctx, 'NO CUSTOMERS', W / 2, 250, 30, tween(u, di, di + 0.3));
    },
  },
  { // 24.4 "He sells the café."
    start: 24.3, title: 'He Sells the Café', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const ca = S.at('café');
      land(ctx, S, { horizon: 330, seed: 143, clouds: 2, hillColors: [P.sageLight, P.green, P.lav] });
      ctx.save(); ctx.fillStyle = 'rgba(60,60,80,0.3)'; ctx.fillRect(-60, -60, W + 120, 1200); ctx.restore();
      cafe(ctx, S, 380, 680, 1.0, tween(u, ca, ca + 0.25, ease.linear), 1);
      road(ctx, S, 760, 140);
      k.figure(ctx, 760, 1040, { ...COLONEL, s: 0.95, face: -1, mood: 'sad', look: 0.4, armF: [0.3, 0.3] });
    },
  },
  { // 26.3 "Most people would retire."
    start: 26.1, title: 'Most Would Retire', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      interior(ctx, S, { window: true, carpetColor: P.lapis });
      // a rocking chair, slowly rocking
      const rk = Math.sin(u * 2) * 0.08;
      ctx.save(); ctx.translate(W / 2, 1000); ctx.rotate(rk);
      ctx.beginPath(); ctx.moveTo(-160, 0); ctx.quadraticCurveTo(0, 40, 160, 0); k.stroke(ctx, P.brown, 10);
      k.rect(ctx, -110, -160, 220, 20, P.brownLight, P.ink, 2); k.rect(ctx, -110, -420, 30, 280, P.brownLight, P.ink, 2);
      for (let i = 0; i < 4; i++) k.rect(ctx, -110, -400 + i * 60, 30, 10, P.brown, P.ink, 1);
      for (const lx of [-100, 80]) k.rect(ctx, lx, -140, 16, 140, P.brown, P.ink, 1.5);
      ctx.restore();
    },
  },
  { // 27.9 "Instead, he takes his recipe on the road."
    start: 27.75, title: 'On the Road', trans: 'flash',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const re = S.at('recipe'), rd = S.at('road');
      land(ctx, S, { horizon: 330, seed: 147, clouds: 3 });
      road(ctx, S, 780, 150);
      const cx = lerp(-260, 600, tween(u, 0.2, rd + 0.4, ease.inOut));
      // the pressure cooker rides along on the roof
      k.pressureCooker(ctx, cx + 10, 760, 0.6, S.t, 1);
      k.car(ctx, cx, 900, 1.3, S.t, P.white, '');
      k.figure(ctx, cx - 10, 820, { ...COLONEL, s: 0.4, face: 1, mood: 'happy', armF: [1.5, 0.2] });
      const sc = tween(u, re - 0.2, re + 0.3, ease.outBack);
      if (sc > 0) { ctx.save(); ctx.translate(W / 2, 330); ctx.scale(sc, sc); k.rect(ctx, -180, -110, 360, 220, P.paperLight, P.ink, 2.5); ctx.fillStyle = P.verm; ctx.font = '900 34px Deco'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('THE RECIPE', 0, -60); for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-140, -10 + i * 30); ctx.lineTo(140, -10 + i * 30); k.stroke(ctx, P.grey, 3); } k.seal(ctx, 130, 70, 34, ' SECRET · SECRET ·', '✦', 1, P.verm); ctx.restore(); }
    },
  },
  { // 31.4 "He drives from restaurant to restaurant, cooking for the owners."
    start: 31.3, title: 'Restaurant to Restaurant', trans: 'wipe',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const ck = S.at('cooking'), ow = S.at('owners');
      S.cam(lerp(1.0, 1.08, tween(u, 0, 4)), W / 2, 580);
      interior(ctx, S, { window: true, carpet: false });
      ctx.fillStyle = '#d9a866'; ctx.fillRect(-60, 760, W + 120, 400);
      k.rect(ctx, 80, 760, W - 160, 30, P.brownLight, P.ink, 2.5);
      k.pressureCooker(ctx, 500, 760, 1.1, S.t, tween(u, ck - 0.4, ck));
      k.figure(ctx, 280, 1010, { ...COLONEL, s: 1.05, face: 1, mood: 'happy', armF: [1.7 + Math.sin(u * 6) * 0.15, 0.3] });
      for (let i = 0; i < 2; i++) { const p = pop(u, ow - 0.3 + i * 0.2, 0.35); if (p > 0) k.figure(ctx, 700 + i * 140, 1010, { ...OWNER, s: 0.9 * p, face: -1, robe: [P.lapis, P.green][i], mood: 'happy', armF: [1.6, 0.2], hold: c => k.drumstick(c, 0, -10, 1.0, -0.4) }); }
      k.label(ctx, 'RESTAURANT OWNERS', 770, 560, 22, tween(u, ow, ow + 0.3));
      // a little road map with stops
      for (let i = 0; i < 4; i++) { const p = pop(u, 0.2 + i * 0.35, 0.3); if (p <= 0) continue; ctx.save(); ctx.translate(180 + i * 190, 230); ctx.scale(p, p); k.house(ctx, 0, 0, 80, 56, { wall: P.white, roof: P.verm }); ctx.restore(); if (i) { ctx.save(); ctx.setLineDash([10, 8]); ctx.beginPath(); ctx.moveTo(180 + (i - 1) * 190 + 44, 210); ctx.lineTo(180 + i * 190 - 44, 210); k.stroke(ctx, P.verm, 3); ctx.restore(); } }
    },
  },
  { // 35.6 "They pay him a few cents for every chicken they sell."
    start: 35.4, title: 'A Few Cents a Chicken', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const ce = S.at('cents'), se = S.at('sell');
      k.goldSky(ctx, -60, -60, W + 120, H + 120, S.t);
      k.carpet(ctx, 100, 860, W - 200, 180, P.verm, P.lapis);
      // for every chicken sold, a coin drops into his jar
      const jx = W / 2, jy = 900;
      for (let i = 0; i < 8; i++) {
        const st = ce - 0.6 + i * 0.32, x = 150 + (i % 4) * 213, y = 330 + Math.floor(i / 4) * 200, p = pop(u, st - 0.2, 0.3);
        if (p > 0) { ctx.save(); ctx.translate(x, y); ctx.scale(p, p); ctx.beginPath(); ctx.ellipse(0, 40, 70, 16, 0, 0, TAU); k.fillStroke(ctx, P.white, P.ink, 2); k.drumstick(ctx, 0, 0, 2.2, -0.4 + (i % 3) * 0.3); ctx.restore(); }
        const q = tween(u, st, st + 0.45, ease.inQuad);
        if (q > 0 && q < 1) k.coin(ctx, lerp(x, jx, q), lerp(y + 40, jy - 120, q) - Math.sin(q * Math.PI) * 120, 34, u * 8, '¢');
      }
      ctx.beginPath(); ctx.moveTo(jx - 150, jy - 180); ctx.lineTo(jx + 150, jy - 180); ctx.lineTo(jx + 130, jy + 80); ctx.lineTo(jx - 130, jy + 80); ctx.closePath(); k.fillStroke(ctx, 'rgba(210,235,240,0.6)', P.ink, 3);
      const n = Math.floor(8 * tween(u, ce - 0.15, se + 0.75, ease.linear));
      for (let i = 0; i < n * 3; i++) k.ellipse(ctx, jx - 90 + (i % 5) * 45, jy + 60 - Math.floor(i / 5) * 14, 22, 8, 0, P.goldLight, P.goldDeep, 1.2);
      k.label(ctx, 'A FEW CENTS PER CHICKEN', W / 2, 180, 28, tween(u, ce, ce + 0.3));
    },
  },
  { // 38.9 "It works. Restaurant after restaurant signs up."
    start: 38.7, title: 'It Works', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const wk = S.at('works'), sg = S.at('signs');
      S.cam(lerp(1.12, 1.0, tween(u, 0, 3.8)), W / 2, 540);
      ctx.fillStyle = '#efdcb0'; ctx.fillRect(-100, -100, W + 200, H + 200);
      usMap(ctx, S);
      const spots = [[620, 420], [560, 500], [700, 360], [480, 330], [760, 520], [400, 470], [300, 360], [660, 580], [220, 300], [520, 620], [800, 300], [350, 580]];
      spots.forEach(([x, y], i) => { const p = pop(u, wk + i * 0.16, 0.3); if (p <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(p, p); k.house(ctx, 0, 0, 46, 36, { wall: P.white, roof: P.verm }); k.drumstick(ctx, 0, -60, 0.7, -0.3); ctx.restore(); });
      k.label(ctx, 'KENTUCKY', 600, 470, 18, 1);
      k.label(ctx, 'SIGNING UP', W / 2, 960, 24, tween(u, sg, sg + 0.3));
    },
  },
  { // 42.7 "In 1964, he sells the company for $2 million."
    start: 42.5, title: 'Sold · 1964', trans: 'flash',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const yr = S.at('1964'), mi = S.at('million');
      interior(ctx, S, { window: true, carpetColor: P.verm });
      k.chest(ctx, W / 2, 960, 1.9, 1, tween(u, 0.3, mi));
      k.figure(ctx, 190, 1010, { ...COLONEL, s: 1.05, face: 1, mood: 'happy', armF: [2.4, 0.1] });
      bigSign(ctx, k, P, '$2 MILLION', W / 2, 420, 640, tween(u, mi - 0.6, mi - 0.2, ease.outBack), 96);
      if (u > mi - 0.3) { const R = rng(7); for (let i = 0; i < 30; i++) { const x = R() * W, d = R(), y = -40 + (u - mi + 0.3) * (500 + d * 500) - d * 300; if (y < -30 || y > H) continue; k.ellipse(ctx, x, y, 13, 13 * Math.abs(Math.cos(u * 8 + i)), 0, P.goldLight, P.goldDeep, 1.5); } }
      k.seal(ctx, 840, 250, 62, ' THE COMPANY IS SOLD ·', '1964', tween(u, yr, yr + 0.3, ease.linear));
    },
  },
  { // 46.0 "A man who started over at 65"
    start: 45.95, title: 'Started Over at 65', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const so = S.at('started'), sf = S.at('65');
      k.goldSky(ctx, -60, -60, W + 120, H + 120, S.t);
      ctx.save(); ctx.translate(W / 2, 520); for (let i = 0; i < 24; i++) { ctx.rotate(TAU / 24); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-30, 900); ctx.lineTo(30, 900); ctx.closePath(); ctx.fillStyle = 'rgba(255,250,210,0.25)'; ctx.fill(); } ctx.restore();
      k.carpet(ctx, 120, 820, W - 240, 200, P.verm, P.lapis);
      k.figure(ctx, W / 2, 1000, { ...COLONEL, s: 1.5, face: 1, mood: 'happy', armF: [2.6, 0.1] });
      const p = pop(u, sf - 0.1, 0.35);
      if (p > 0) { ctx.save(); ctx.translate(W / 2, 280); ctx.scale(p * 1.4, p * 1.4); k.circle(ctx, 0, 0, 56, P.lapis, P.goldLight, 5); ctx.fillStyle = P.goldLight; ctx.font = '900 54px Deco'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('65', 0, 2); ctx.restore(); }
    },
  },
  { // 51.1 "became the face of Kentucky Fried Chicken."
    start: 50.95, title: 'The Face of the Brand', trans: 'wipe',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const fa = S.at('face'), kf = S.at('Kentucky');
      S.cam(lerp(1.1, 1.0, tween(u, 0, 3.6)), W / 2, 560);
      land(ctx, S, { horizon: 330, seed: 149, clouds: 3 });
      // his portrait in a gilded medallion over a restaurant
      k.house(ctx, W / 2, 900, 520, 260, { wall: P.white, roof: P.verm });
      const mp = pop(u, fa - 0.2, 0.4);
      if (mp > 0) {
        ctx.save(); ctx.translate(W / 2, 430); ctx.scale(mp, mp);
        k.circle(ctx, 0, 0, 170, P.lapis, P.goldLight, 10);
        ctx.save(); ctx.beginPath(); ctx.arc(0, 0, 160, 0, TAU); ctx.clip();
        k.figure(ctx, 0, 520, { ...COLONEL, s: 1.9, face: 1, mood: 'happy', armF: [0.3, 0.3] });
        ctx.restore(); ctx.restore();
      }
      k.bucket(ctx, 840, 1010, 0.9, 1);
      k.label(ctx, 'KENTUCKY FRIED CHICKEN', W / 2, 660, 26, tween(u, kf, kf + 0.3));
    },
  },
  { // 55.0 "Every legend has a beginning."
    start: 54.75, title: 'Every Legend Has a Beginning', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W, H } = S, beg = S.at('beginning');
      ctx.save();
      S.cam(lerp(1.0, 1.35, tween(u, 0, beg)), lerp(W / 2, 420, tween(u, 0, beg)), lerp(600, 640, tween(u, 0, beg)));
      land(ctx, S, { horizon: 330, seed: 143, clouds: 2, hillColors: [P.sageLight, P.green, P.lav] });
      cafe(ctx, S, 380, 680, 1.0);
      road(ctx, S, 760, 140);
      const g = ctx.createRadialGradient(380, 520, 10, 380, 520, 260); g.addColorStop(0, 'rgba(255,240,170,0.7)'); g.addColorStop(1, 'rgba(255,240,170,0)'); ctx.fillStyle = g; ctx.fillRect(100, 260, 560, 560);
      k.figure(ctx, 210, 1040, { ...COLONEL, s: 0.95, face: 1, mood: 'happy', armF: [1.6, 0.1], hold: c => k.drumstick(c, 0, -10, 1.0, -0.4) });
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
  { t: 0.1, type: 'gong', gain: 0.5 }, { t: 1.5, type: 'stamp', gain: 0.7 }, { t: 3.8, type: 'paper', gain: 0.45 }, { t: 4.0, type: 'coins', gain: 0.25 },
  { t: 7.8, type: 'stamp', gain: 0.5 }, { t: 9.3, type: 'chime', gain: 0.4 },
  { t: 10.9, type: 'pluck', gain: 0.5 }, { t: 12.4, type: 'sizzle', gain: 0.4 }, { t: 13.0, type: 'riser', gain: 0.25 }, { t: 14.0, type: 'thud', gain: 0.4 },
  { t: 20.0, type: 'paper', gain: 0.45 }, { t: 20.94, type: 'slide', gain: 0.4 }, { t: 21.5, type: 'stamp', gain: 0.6 }, { t: 17.0, type: 'stamp', gain: 0.5 },
  { t: 22.8, type: 'wind', gain: 0.35 }, { t: 23.1, type: 'crickets', gain: 0.3 },
  { t: 24.96, type: 'stamp', gain: 0.8 }, { t: 25.0, type: 'flop', gain: 0.4 },
  { t: 26.4, type: 'slide', gain: 0.2 },
  { t: 27.86, type: 'gong', gain: 0.6 }, { t: 28.4, type: 'riser', gain: 0.3 }, { t: 29.2, type: 'paper', gain: 0.45 }, { t: 29.6, type: 'stamp', gain: 0.4 },
  { t: 32.0, type: 'whoosh', gain: 0.3 }, { t: 32.9, type: 'whoosh', gain: 0.3 }, { t: 33.82, type: 'sizzle', gain: 0.45 }, { t: 34.36, type: 'chime', gain: 0.4 },
  ...Array.from({ length: 8 }, (_, i) => ({ t: +(36.34 - 0.6 + 0.3 + i * 0.32).toFixed(3), type: 'coins', gain: 0.2 })),
  { t: 38.92, type: 'gong', gain: 0.6 }, ...pops(39.0, 12, 0.16, 0.35),
  { t: 42.7, type: 'stamp', gain: 0.6 }, { t: 45.3, type: 'riser', gain: 0.35 }, { t: 45.86, type: 'gong', gain: 0.8 }, { t: 45.9, type: 'coins', gain: 0.55 },
  { t: 48.3, type: 'chime', gain: 0.45 }, { t: 49.38, type: 'pop', gain: 0.6 },
  { t: 51.3, type: 'chime', gain: 0.5 }, { t: 52.2, type: 'pop', gain: 0.5 },
  { t: 56.12, type: 'pop', gain: 0.8 }, { t: 56.16, type: 'gong', gain: 0.9 },
];

export const music = {
  bpm: 98, root: 'C', maqam: 'rast', gain: 0.32,
  sections: [
    { from: 0, to: 7.6, mood: 'sad' },
    { from: 7.6, to: 16.2, mood: 'groove' },
    { from: 16.2, to: 27.75, mood: 'sad' },
    { from: 27.75, to: 38.7, mood: 'drive' },
    { from: 38.7, to: 56.12, mood: 'triumph' },
    { from: 56.12, to: 59.6, mood: 'end' },
  ],
};
