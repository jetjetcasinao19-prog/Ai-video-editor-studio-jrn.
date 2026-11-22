// "How the Big Bang Got Its Name" — an Ottoman miniature chronicle, drawn like the
// celestial-sphere diagrams of Ottoman astronomy manuscripts.
// u = seconds since the scene started; S.at('word') = when that word is said.
import { clamp, lerp, ease, tween, rng, TAU, shake, pop } from '../../lib/core.mjs';
import { land, interior, lamp, bookCover, bigSign, medallion } from '../../styles/ottoman/scenes.mjs';

export const meta = {
  title: 'How the Big Bang Got Its Name',
  slug: 'big-bang-ottoman',
  style: 'ottoman',
  look: 'night',
  width: 1080, height: 1920, fps: 30,
  duration: 57.1,
  voice: 'voice.mp3',
  seed: 73,
  captionChars: 30,
  brand: { handle: '@HOWITSTARTED-YT1', logo: '../../../brand/logo.png' },
  outro: { at: 55.0, text: 'Subscribe for more origin stories' },
};

const LEMAITRE = { robe: '#1f1f22', robeP: 'dots', robePc: '#3a3a40', inner: '#1f1f22', sash: '#3a3a40', hat: 'shorthair', hair: '#3a2a20', glasses: true, collar: true, shoes: '#1a1a1a' };
const LEMAITRE_OLD = { ...LEMAITRE, hair: '#dcdcdc' };
const EINSTEIN = { robe: '#7a6a5a', robeP: 'stripes', robePc: '#5e5044', inner: '#f7eed6', sash: '#3a3a40', hat: 'wildhair', hair: '#ececec', mustache: true, mustacheColor: '#dcdcdc' };
const HOYLE = { robe: '#3a4a5a', robeP: 'stripes', robePc: '#55677a', inner: '#f7eed6', sash: '#c4371f', hat: 'shorthair', hair: '#5a3a22', glasses: true };
const SCI = [{ robe: '#f4f1ea', robeP: 'dots', robePc: '#d9d4c8', hat: 'shorthair', hair: '#2a1c12', glasses: true }, { robe: '#f4f1ea', robeP: 'dots', robePc: '#d9d4c8', hat: 'shorthair', hair: '#5a3a22', mustache: true }];

function cosmos(ctx, S, glow = 0) {
  const { k, W, H, t } = S;
  k.nightSky(ctx, -60, -60, W + 120, H + 120, t);
  if (glow > 0) { ctx.save(); ctx.globalAlpha = glow; const g = ctx.createRadialGradient(W / 2, H / 2, 50, W / 2, H / 2, H); g.addColorStop(0, 'rgba(255,170,110,0.55)'); g.addColorStop(1, 'rgba(200,90,60,0.25)'); ctx.fillStyle = g; ctx.fillRect(-60, -60, W + 120, H + 120); ctx.restore(); }
}
function burst(ctx, S, x, y, r, k, text = 'BIG BANG') {
  const { P } = S;
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y);
  for (let i = 0; i < 28; i++) { ctx.save(); ctx.rotate(i / 28 * TAU); const L = r * k * (i % 2 ? 0.75 : 1); ctx.beginPath(); ctx.moveTo(-r * 0.08, 0); ctx.lineTo(0, -L); ctx.lineTo(r * 0.08, 0); ctx.closePath(); ctx.fillStyle = i % 2 ? P.ochre : P.goldLight; ctx.fill(); ctx.restore(); }
  S.k.circle(ctx, 0, 0, r * 0.42 * k, P.goldLight, P.goldDeep, 3);
  if (text) { ctx.scale(k, k); ctx.font = `900 ${Math.round(r * 0.22)}px Deco`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = 8; ctx.strokeStyle = P.ink; ctx.strokeText(text, 0, 4); ctx.fillStyle = P.verm; ctx.fillText(text, 0, 4); }
  ctx.restore();
}

export const scenes = [
  { // 0.0 "The man who named the Big Bang didn't even believe in it."
    start: 0, title: 'The Man Who Named It',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const bb = S.at('Big'), di = S.at("didn't");
      cosmos(ctx, S);
      burst(ctx, S, W / 2, 400, 320, tween(u, bb - 0.3, bb + 0.4, ease.outBack));
      k.carpet(ctx, 100, 860, W - 200, 180, P.lapis, P.verm);
      k.microphone(ctx, 700, 1010, 0.9, 0, S.t);
      k.figure(ctx, 330, 1010, { ...HOYLE, s: 1.2, face: 1, mood: u > di ? 'sad' : 'calm', look: u > di ? Math.sin(u * 6) * 0.4 : 0, armF: u > di ? [0.9, 1.9] : [1.4, 0.4], armB: u > di ? [0.9, 1.9] : [0.2, 0.2] });
      k.stamp(ctx, 'NOT A BELIEVER', W / 2, 720, 56, tween(u, S.at('believe'), S.at('believe') + 0.25, ease.linear), -0.1);
    },
  },
  { // 5.2 "1927, Belgium."
    start: 5.1, title: 'Belgium · 1927', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const be = S.at('Belgium');
      S.cam(lerp(1.1, 1.0, tween(u, 0, 2.9)), W / 2, 560);
      land(ctx, S, { horizon: 330, seed: 151, clouds: 3, hillColors: [P.sageLight, P.lavLight, P.sage] });
      ctx.save(); ctx.beginPath(); ctx.rect(-60, 820, W + 120, 130); ctx.clip(); k.waves(ctx, -60, 820, W + 120, 130, S.t, P.water, P.waterLight, 18, 20); ctx.restore();
      const walls = [P.ochreLight, P.pink, P.white, P.vermDark, P.lavLight, P.ochre];
      for (let i = 0; i < 6; i++) k.gableHouse(ctx, 90 + i * 155, 800, 140, 200 + (i % 3) * 30, walls[i]);
      for (let i = 0; i < 4; i++) k.gableHouse(ctx, 160 + i * 220, 540, 110, 140, walls[(i + 2) % 6]);
      k.label(ctx, 'BELGIUM', W / 2, 260, 36, tween(u, be, be + 0.3));
      k.seal(ctx, 830, 1010, 60, ' BELGIUM · BELGIUM ·', '1927', tween(u, 0.1, 0.4, ease.linear));
    },
  },
  { // 8.2 "Georges Lemaître, a Catholic priest and physicist, has a wild idea."
    start: 8.05, title: 'Georges Lemaître', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const gl = S.at('Georges'), pr = S.at('priest'), id = S.at('idea');
      S.cam(lerp(1.0, 1.08, tween(u, 0, 5)), W / 2, 560);
      interior(ctx, S, { window: false, carpetColor: P.lapis });
      // night sky in the middle arch, a telescope pointing out
      lamp(ctx, S, 150, 230, tween(u, id - 0.2, id + 0.2) * 0.6 + 0.4);
      k.chalkboard(ctx, 560, 260, 330, 230, tween(u, 0.3, id));
      ctx.save(); ctx.translate(760, 840); ctx.rotate(-0.7); k.rect(ctx, -10, -150, 22, 170, P.gold, P.ink, 2); k.rect(ctx, -14, -170, 30, 30, P.goldDark, P.ink, 2); ctx.restore();
      for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(760, 860); ctx.lineTo(760 + sx * 60, 1000); k.stroke(ctx, P.brown, 6); }
      k.figure(ctx, 300, 1010, { ...LEMAITRE, s: 1.25, face: 1, mood: u > id ? 'happy' : 'calm', armF: [u > id ? 2.5 : 1.4, 0.3] });
      k.label(ctx, 'GEORGES LEMAÎTRE', 300, 560, 26, tween(u, gl, gl + 0.3));
      k.label(ctx, 'PRIEST & PHYSICIST', 300, 620, 20, tween(u, pr, pr + 0.3));
      if (u > id) for (let i = 0; i < 12; i++) { const a = i / 12 * TAU, r = 60 + (u - id) * 300; k.star(ctx, 150 + Math.cos(a) * r, 230 + Math.sin(a) * r * 0.7, 9, 1 - (u - id) * 0.8); }
    },
  },
  { // 13.4 "The universe is expanding, and it all began from one tiny point."
    start: 13.25, title: 'An Expanding Universe', trans: 'flash',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const ex = S.at('expanding'), tp = S.at('tiny'), pt = S.at('point');
      cosmos(ctx, S);
      // the spheres grow…then the film runs backwards to one point
      const grow = tween(u, 0, ex + 0.8, ease.inOut), back = tween(u, tp - 1.0, pt, ease.inOut);
      const kk = lerp(0.4, 1.15, grow) * (1 - back) + 0.001;
      k.celestialSpheres(ctx, W / 2, 540, 430, kk, S.t);
      const R = rng(4);
      for (let i = 0; i < 10; i++) { const a = R() * TAU, d = (120 + R() * 320) * kk; k.galaxy(ctx, W / 2 + Math.cos(a) * d * 1.05, 540 + Math.sin(a) * d * 1.05, 28 + R() * 20, a); }
      if (back > 0.8) { const g = ctx.createRadialGradient(W / 2, 540, 2, W / 2, 540, 160); g.addColorStop(0, 'rgba(255,250,220,1)'); g.addColorStop(1, 'rgba(255,240,170,0)'); ctx.fillStyle = g; ctx.fillRect(W / 2 - 170, 370, 340, 340); k.circle(ctx, W / 2, 540, 10, P.white, P.goldDeep, 2); }
      k.label(ctx, 'EXPANDING', W / 2, 1000, 30, tween(u, ex, ex + 0.3) * (1 - tween(u, tp - 0.4, tp - 0.1)));
      k.label(ctx, 'ONE TINY POINT', W / 2, 1000, 30, tween(u, pt - 0.1, pt + 0.2));
    },
  },
  { // 19.6 "Einstein reportedly told him, 'Your math is correct, but your physics is abominable.'"
    start: 19.4, title: "Einstein's Verdict", trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const ei = S.at('Einstein'), ma = S.at('math'), ab = S.at('abominable');
      interior(ctx, S, { window: true, carpetColor: P.verm });
      k.figure(ctx, 250, 1010, { ...LEMAITRE, s: 1.1, face: 1, mood: u > ab ? 'sad' : 'calm', look: u > ab ? 0.4 : 0, armF: [1.3, 0.4] });
      k.figure(ctx, 700, 1010, { ...EINSTEIN, s: 1.15, face: -1, mood: 'calm', armF: [lerp(0.5, 1.7, tween(u, ma - 0.3, ma)), 0.2] });
      k.label(ctx, 'ALBERT EINSTEIN', 700, 560, 24, tween(u, ei, ei + 0.3));
      k.label(ctx, '(REPORTEDLY)', 700, 610, 16, tween(u, ei + 0.4, ei + 0.7));
      const sc = tween(u, ma - 0.2, ma + 0.3, ease.outBack);
      if (sc > 0) { ctx.save(); ctx.translate(W / 2, 270); ctx.scale(sc, sc); k.cartouche(ctx, 0, 0, 700, 100, P.paperLight, P.goldDark, 4); ctx.fillStyle = P.green; ctx.font = 'italic 700 42px GaramondItalic'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('“Your math is correct…”', 0, 2); ctx.restore(); }
      k.stamp(ctx, '…YOUR PHYSICS IS ABOMINABLE', W / 2, 420, 38, tween(u, ab, ab + 0.25, ease.linear), -0.06);
    },
  },
  { // 26.1 "In 1949, astronomer Fred Hoyle, who thinks the universe has no beginning,"
    start: 25.9, title: 'Fred Hoyle · 1949', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const fh = S.at('Fred'), nb = S.at('beginning');
      cosmos(ctx, S);
      // a steady, eternal universe: spheres turning but never growing
      k.celestialSpheres(ctx, W / 2, 470, 330, 1, S.t * 4);
      k.carpet(ctx, 100, 860, W - 200, 180, P.lapis, P.verm);
      k.figure(ctx, W / 2, 1010, { ...HOYLE, s: 1.2, face: 1, mood: 'calm', armF: [1.4, 0.5] });
      k.label(ctx, 'FRED HOYLE', W / 2, 560, 28, tween(u, fh, fh + 0.3));
      const nbk = pop(u, nb - 0.1, 0.35);
      if (nbk > 0) { ctx.save(); ctx.translate(W / 2, 470); ctx.scale(nbk, nbk); k.circle(ctx, 0, 0, 70, P.paperLight, P.goldLight, 6); ctx.fillStyle = P.lapis; ctx.font = '900 80px Garamond'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('∞', 0, 6); ctx.restore(); k.label(ctx, 'NO BEGINNING', W / 2, 610, 24, tween(u, nb, nb + 0.3)); }
      k.seal(ctx, 830, 200, 60, ' ASTRONOMER · ASTRONOMER ·', '1949', tween(u, 0.2, 0.5, ease.linear));
    },
  },
  { // 31.5 "calls it on BBC Radio, this Big Bang idea."
    start: 31.3, title: 'On BBC Radio', trans: 'wipe',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const bbc = S.at('BBC'), bb = S.at('Big');
      interior(ctx, S, { window: true, carpetColor: P.lapis });
      k.microphone(ctx, 600, 1000, 1.2, tween(u, bbc - 0.3, bbc + 0.2), S.t);
      k.figure(ctx, 330, 1010, { ...HOYLE, s: 1.15, face: 1, mood: 'happy', armF: [1.5 + Math.sin(u * 7) * 0.2, 0.3] });
      burst(ctx, S, W / 2, 330, 260, tween(u, bb - 0.2, bb + 0.4, ease.outBack));
    },
  },
  { // 36.1 "The name sticks."
    start: 35.9, title: 'The Name Sticks', trans: 'flash',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const st = S.at('sticks');
      ctx.fillStyle = P.paperLight; ctx.fillRect(-60, -60, W + 120, H + 120);
      ctx.fillStyle = k.pattern(ctx, 'flowers', P.paperLight, '#e6d6ad', 40); ctx.fillRect(-60, -60, W + 120, H + 120);
      // the name appears on book after book
      for (let i = 0; i < 6; i++) { const p = pop(u, 0.05 + i * 0.16, 0.3); if (p <= 0) continue; ctx.save(); ctx.translate(170 + (i % 3) * 300, 300 + Math.floor(i / 3) * 420); ctx.scale(p, p); ctx.rotate((i % 2 ? 0.06 : -0.05)); k.rect(ctx, -110, -150, 220, 300, [P.lapis, P.vermDark, P.green][i % 3], P.ink, 3); k.rect(ctx, -90, -60, 180, 70, P.paperLight, P.goldDark, 2); ctx.fillStyle = P.verm; ctx.font = '900 30px Deco'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('BIG BANG', 0, -24); ctx.restore(); }
      k.stamp(ctx, 'THE NAME STICKS', W / 2, 980, 60, tween(u, st, st + 0.25, ease.linear), -0.08);
    },
  },
  { // 38.0 "In 1965, two American scientists detect faint leftover heat from the early universe."
    start: 37.75, title: 'Leftover Heat · 1965', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const sc = S.at('scientists'), fa = S.at('faint'), eu = S.at('early');
      const glow = tween(u, fa - 0.2, eu + 0.6);
      cosmos(ctx, S, glow);
      // the hiss of the early universe: faint speckle everywhere
      if (glow > 0) { const R = rng(Math.floor(S.t * 12)); ctx.save(); ctx.globalAlpha = 0.5 * glow; for (let i = 0; i < 160; i++) { ctx.fillStyle = R() > 0.5 ? '#ffd8a0' : '#ff9a70'; ctx.fillRect(R() * W, R() * 800, 3, 3); } ctx.restore(); }
      k.spongy(ctx, W / 2, 900, 1300, 260, '#4e5d4a', 3);
      ctx.fillStyle = '#4e5d4a'; ctx.fillRect(-60, 880, W + 120, 300);
      k.hornAntenna(ctx, 560, 820, 1.2);
      for (let i = 0; i < 2; i++) { const p = pop(u, sc - 0.2 + i * 0.15, 0.3); if (p > 0) k.figure(ctx, 160 + i * 150, 1010, { ...SCI[i], s: 0.85 * p, face: 1, mood: u > fa ? 'happy' : 'calm', armF: [1.8, 0.3] }); }
      k.label(ctx, 'TWO AMERICAN SCIENTISTS', W / 2, 1000, 22, tween(u, sc, sc + 0.3));
      k.label(ctx, 'LEFTOVER HEAT', W / 2, 220, 32, tween(u, fa + 0.6, fa + 0.9));
      k.seal(ctx, 840, 300, 60, ' FAINT · LEFTOVER · HEAT ·', '1965', tween(u, S.at('1965'), S.at('1965') + 0.3, ease.linear));
    },
  },
  { // 44.7 "Lemaître hears the news shortly before he dies."
    start: 44.55, title: 'Lemaître Hears the News', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const nw = S.at('news'), di = S.at('dies');
      interior(ctx, S, { window: true, carpetColor: P.vermDark });
      ctx.save(); ctx.fillStyle = 'rgba(30,35,60,0.25)'; ctx.fillRect(-60, -60, W + 120, H + 120); ctx.restore();
      // a candle on a stand; it burns down quietly
      k.rect(ctx, 690, 820, 60, 180, P.goldDark, P.ink, 2);
      const h = lerp(120, 70, tween(u, 0, di + 1));
      k.rect(ctx, 700, 820 - h, 40, h, P.white, P.ink, 1.5);
      const fl = 1 - tween(u, di + 0.3, di + 1.2);
      if (fl > 0) { const g = ctx.createRadialGradient(720, 800 - h, 5, 720, 800 - h, 160); g.addColorStop(0, `rgba(255,230,150,${0.6 * fl})`); g.addColorStop(1, 'rgba(255,230,150,0)'); ctx.fillStyle = g; ctx.fillRect(560, 640 - h, 320, 320); k.ellipse(ctx, 720, 800 - h, 10 * fl, 22 * fl, 0, P.goldLight, P.verm, 1.5); }
      k.figure(ctx, 330, 1010, { ...LEMAITRE_OLD, s: 1.2, face: 1, kneel: true, mood: 'happy', armF: [1.5, 0.5], hold: c => k.newspaper(c, 30, -40, 120, -0.2, 'HEAT FROM\nTHE BEGINNING', 'NEWS') });
      k.label(ctx, 'THE NEWS ARRIVES', W / 2, 260, 28, tween(u, nw, nw + 0.3));
      if (u > di) for (let i = 0; i < 10; i++) { const q = ((u - di) * 0.3 + i / 10) % 1; k.star(ctx, 120 + (i * 83) % 700, 560 - q * 360, 6, (1 - q) * 0.8); }
    },
  },
  { // 48.4 "A priest's idea, named by its biggest doubter."
    start: 48.2, title: 'Idea and Name', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const id = S.at('idea'), na = S.at('named'), dt = S.at('doubter');
      cosmos(ctx, S);
      ctx.beginPath(); ctx.moveTo(W / 2, 60); ctx.lineTo(W / 2, 1040); k.stroke(ctx, P.goldLight, 4);
      // left: the priest and his tiny point; right: the doubter and his name
      const g = ctx.createRadialGradient(240, 420, 2, 240, 420, 140); g.addColorStop(0, 'rgba(255,250,220,1)'); g.addColorStop(1, 'rgba(255,240,170,0)'); ctx.fillStyle = g; ctx.fillRect(100, 280, 280, 280);
      k.circle(ctx, 240, 420, 9, P.white, P.goldDeep, 2);
      k.figure(ctx, 240, 1000, { ...LEMAITRE, s: 1.0, face: 1, mood: 'happy', armF: [2.4, 0.2] });
      burst(ctx, S, 710, 420, 190, tween(u, na - 0.2, na + 0.4, ease.outBack));
      k.figure(ctx, 710, 1000, { ...HOYLE, s: 1.0, face: -1, mood: 'happy', armF: [2.0, 0.3] });
      k.label(ctx, "A PRIEST'S IDEA", 240, 640, 22, tween(u, id - 0.3, id));
      k.label(ctx, 'ITS BIGGEST DOUBTER', 710, 640, 22, tween(u, dt - 0.2, dt + 0.1));
    },
  },
  { // 53.2 "Every legend has a beginning."
    start: 52.9, title: 'Every Legend Has a Beginning', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W, H } = S, beg = S.at('beginning');
      cosmos(ctx, S);
      // one tiny point, growing into the book
      const g = ctx.createRadialGradient(W / 2, 560, 2, W / 2, 560, 220); g.addColorStop(0, 'rgba(255,250,220,1)'); g.addColorStop(1, 'rgba(255,240,170,0)'); ctx.fillStyle = g; ctx.fillRect(W / 2 - 230, 330, 460, 460);
      k.circle(ctx, W / 2, 560, 10 + Math.sin(u * 4) * 2, P.white, P.goldDeep, 2);
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
  { t: 1.2, type: 'riser', gain: 0.35 }, { t: 1.42, type: 'gong', gain: 0.8 }, { t: 1.45, type: 'thunder', gain: 0.35 }, { t: 3.4, type: 'stamp', gain: 0.6 },
  { t: 5.24, type: 'stamp', gain: 0.5 }, { t: 6.58, type: 'chime', gain: 0.4 },
  { t: 8.18, type: 'pluck', gain: 0.5 }, { t: 9.9, type: 'chime', gain: 0.35, pitch: 0.8 }, { t: 11.7, type: 'chime', gain: 0.55 },
  { t: 13.6, type: 'riser', gain: 0.35 }, { t: 14.42, type: 'wind', gain: 0.3 }, { t: 16.6, type: 'slide', gain: 0.4 }, { t: 18.06, type: 'pop', gain: 0.6, pitch: 1.4 }, { t: 18.1, type: 'chime', gain: 0.5, pitch: 1.5 },
  { t: 19.6, type: 'pluck', gain: 0.5 }, { t: 21.7, type: 'chime', gain: 0.45 }, { t: 24.42, type: 'stamp', gain: 0.8 }, { t: 24.5, type: 'flop', gain: 0.35 },
  { t: 26.1, type: 'stamp', gain: 0.5 }, { t: 27.86, type: 'pluck', gain: 0.5 }, { t: 30.42, type: 'chime', gain: 0.4, pitch: 0.75 },
  { t: 31.9, type: 'riser', gain: 0.35 }, { t: 32.0, type: 'whoosh', gain: 0.4 }, { t: 33.6, type: 'riser', gain: 0.4 }, { t: 34.3, type: 'gong', gain: 0.9 }, { t: 34.32, type: 'thunder', gain: 0.4 },
  { t: 36.0, type: 'pop', gain: 0.4 }, { t: 36.2, type: 'pop', gain: 0.4 }, { t: 36.42, type: 'stamp', gain: 0.8 },
  { t: 38.0, type: 'stamp', gain: 0.5 }, { t: 41.2, type: 'sizzle', gain: 0.35 }, { t: 41.3, type: 'wind', gain: 0.3 }, { t: 42.5, type: 'chime', gain: 0.45 },
  { t: 45.54, type: 'paper', gain: 0.4 }, { t: 47.0, type: 'chime', gain: 0.3, pitch: 0.7 },
  { t: 48.98, type: 'chime', gain: 0.45 }, { t: 50.18, type: 'gong', gain: 0.6 }, { t: 51.6, type: 'pluck', gain: 0.45 },
  { t: 54.4, type: 'pop', gain: 0.8 }, { t: 54.44, type: 'gong', gain: 0.9 },
];

export const music = {
  bpm: 88, root: 'F', maqam: 'nihavend', gain: 0.32,
  sections: [
    { from: 0, to: 8.05, mood: 'intro' },
    { from: 8.05, to: 19.4, mood: 'groove' },
    { from: 19.4, to: 25.9, mood: 'sad' },
    { from: 25.9, to: 37.75, mood: 'drive' },
    { from: 37.75, to: 44.55, mood: 'triumph' },
    { from: 44.55, to: 48.2, mood: 'sad' },
    { from: 48.2, to: 54.4, mood: 'triumph' },
    { from: 54.4, to: 57.1, mood: 'end' },
  ],
};
