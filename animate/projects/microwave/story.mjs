// "How the Microwave Oven Started" — told as a Book of Wonders (acaib):
// labelled cutaways, gold measurements and astonished onlookers.
// u = seconds since the scene started; S.at('word') = when that word is said.
import { clamp, lerp, ease, tween, rng, TAU, shake, pop } from '../../lib/core.mjs';
import { land, interior, bookCover, medallion } from '../../styles/ottoman/scenes.mjs';

export const meta = {
  title: 'How the Microwave Oven Started',
  slug: 'microwave-ottoman',
  style: 'ottoman',
  look: 'scroll',   // hanging scroll, petals (the three videos before used night, album, tile)
  room: 'tiles',    // İznik-tiled laboratory
  device: 'marvels',
  cameos: [{ at: 'bonus', dur: 1.7, mood: 'wow' }],
  width: 1080, height: 1920, fps: 30,
  duration: 55.9,
  voice: 'voice.mp3',
  seed: 123,
  captionChars: 30,
  brand: { handle: '@HOWITSTARTED-YT1', logo: '../../../brand/logo.png' },
  outro: { at: 54.0, text: 'Subscribe for more origin stories' },
};

const SPENCER = { robe: '#ece6d6', robeP: 'stripes', robePc: '#d8d0bc', inner: '#f7eed6', sash: '#20408f', hat: 'shorthair', hair: '#7a6a5a' };
const ONLOOK = [
  { robe: '#2a9c93', robeP: 'dots', robePc: '#6cc3b8', hat: 'turban', hatColor: '#f8f2e2' },
  { robe: '#d6973a', robeP: 'stripes', robePc: '#e9be6e', hat: 'fez', hatColor: '#c4371f' },
  { robe: '#a99ac6', robeP: 'dots', robePc: '#c9bede', hat: 'hotoz', hatColor: '#c4371f', veil: '#f8f2e2' },
];
const SKINS = ['#e2b48a', '#a86c45', '#f1d1a8'];

// a "Book of Wonders" annotation: a gold leader line from the thing to its label
function callout(ctx, k, P, text, px, py, lx, ly, a, size = 22) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp(a);
  ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(lx, ly); k.stroke(ctx, P.ink, 4); k.stroke(ctx, P.gold, 2.5);
  k.circle(ctx, px, py, 7, P.verm, P.ink, 1.5);
  ctx.restore();
  k.label(ctx, text, lx, ly, size, a);
}
function onlookers(ctx, S, xs, y, s, u, wow = 1) {
  xs.forEach((x, i) => S.k.figure(ctx, x, y, { ...ONLOOK[i % 3], skin: SKINS[i % 3], s, face: x < S.W / 2 ? 1 : -1, mood: wow > 0.5 ? 'wow' : 'calm', armF: [lerp(0.7, 2.0, wow) + Math.sin(u * 4 + i) * 0.08, 0.1] }));
}

export const scenes = [
  { // 0.0 "The microwave oven was invented because of a melted candy bar."
    start: 0, title: 'A Melted Candy Bar',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const mw = S.at('microwave'), inv = S.at('invented'), me = S.at('melted'), bar = S.at('bar.');
      ctx.fillStyle = '#efe2c0'; ctx.fillRect(-60, -60, W + 120, 1200);
      ctx.fillStyle = k.pattern(ctx, 'cintamani', '#efe2c0', '#e2cf9e', 46); ctx.fillRect(-60, -60, W + 120, 1200);
      S.cam(lerp(1.0, 1.12, tween(u, me - 0.6, bar + 0.4)), W / 2, 600);
      // invisible waves (drawn in gold) reach the bar from the left
      k.waveRays(ctx, -40, 560, 330, 600, tween(u, 0.3, 1.6), S.t, 3);
      k.cartouche(ctx, W / 2, 700, 520, 90, P.paperLight, P.goldDark, 4);
      const melt = tween(u, me - 0.4, bar + 0.5, ease.inOut);
      k.candyBar(ctx, W / 2, 610 + melt * 20, 1.7, melt, 0, S.t);
      // a ghost of what it will become
      const gh = tween(u, inv - 0.2, inv + 0.4) * (1 - tween(u, me - 0.3, me));
      if (gh > 0) { ctx.save(); ctx.globalAlpha *= gh * 0.7; k.smallOven(ctx, W / 2, 300, 1.4, 1, S.t); ctx.restore(); }
      k.label(ctx, 'BORN FROM THIS', W / 2, 150, 28, tween(u, me, me + 0.3));
      onlookers(ctx, S, [150, 790], 1010, 0.95, u, tween(u, me, me + 0.3));
    },
  },
  { // 4.9 "1940s, Massachusetts."
    start: 4.8, title: 'Massachusetts · 1940s', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const ma = S.at('Massachusetts.');
      land(ctx, S, { horizon: 640, clouds: 3, hillColors: [P.lav, P.sageLight, P.rose, P.pink] });
      k.snow(ctx, -40, -40, W + 80, 1120, S.t, 60, 4);
      k.waves(ctx, -60, 880, W + 120, 220, S.t, P.water, P.waterLight, 20, 22);
      k.factory(ctx, 600, 860, 520, 260, S.t, true);
      k.house(ctx, 190, 860, 150, 150, { roof: P.verm });
      k.seal(ctx, 170, 220, 90, ' THE 1940s · THE 1940s ·', '1940s', tween(u, 0.1, 0.5, ease.linear));
      k.label(ctx, 'MASSACHUSETTS', W / 2, 120, 32, tween(u, ma, ma + 0.3));
    },
  },
  { // 8.0 "Percy Spencer, an engineer who never went past grammar school,"
    start: 7.9, title: 'Percy Spencer', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const pe = S.at('Percy'), en = S.at('engineer'), nv = S.at('never'), gr = S.at('grammar');
      interior(ctx, S, { carpetColor: P.lapis });
      // the school stairs: he stopped on the first step
      const steps = [['GRAMMAR SCHOOL', P.gold], ['HIGH SCHOOL', P.paperDark], ['COLLEGE', P.paperDark]];
      steps.forEach(([t, c], i) => {
        const a = tween(u, 0.25 + i * 0.25, 0.55 + i * 0.25, ease.outBack); if (a <= 0) return;
        const x = 300 + i * 200, h = (i + 1) * 110;
        ctx.save(); ctx.globalAlpha *= i && u > nv ? 0.4 : 1;
        k.rect(ctx, x, 1000 - h * a, 200, h * a, c, P.ink, 2.5); ctx.restore();
        k.label(ctx, t, x + 100, 1000 - h * a + 30, 16, a);
      });
      k.stamp(ctx, 'NEVER', 700, 760, 54, tween(u, nv, nv + 0.25, ease.linear), -0.2);
      k.figure(ctx, 400, 890, { ...SPENCER, s: 1.0, face: 1, mood: u > nv ? 'calm' : 'happy', armF: [1.4, 0.2] });
      k.label(ctx, 'PERCY SPENCER', 400, 520, 26, tween(u, pe, pe + 0.3));
      if (u > gr) k.star(ctx, 300, 860, 18, 1);
    },
  },
  { // 11.96 "is working on radar at Raytheon."
    start: 11.8, title: 'Radar at Raytheon', trans: 'ink',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const ra = S.at('radar'), ry = S.at('Raytheon.');
      k.nightSky(ctx, -60, -60, W + 120, 1200, S.t);
      k.ground(ctx, -60, 820, W + 120, 400, '#4a5a3a', 3, 0.4);
      k.factory(ctx, 280, 830, 460, 220, S.t, false);
      k.radarDish(ctx, 280, 610, 0.9, S.t);
      k.radarScope(ctx, 720, 460, 170, S.t, [[0.4, -0.3], [-0.5, 0.2], [0.1, 0.6]]);
      k.label(ctx, 'RAYTHEON', 280, 900, 26, tween(u, ry, ry + 0.3));
      k.figure(ctx, 560, 1010, { ...SPENCER, s: 0.9, face: 1, mood: 'calm', armF: [1.9, 0.2] });
    },
  },
  { // 14.5 "He's standing next to a magnetron, the tube that powers radar."
    start: 14.4, title: 'The Magnetron', trans: 'tiles',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const mg = S.at('magnetron,'), tb = S.at('tube'), pw = S.at('powers');
      ctx.fillStyle = P.paperLight; ctx.fillRect(-60, -60, W + 120, 1200);
      ctx.fillStyle = k.pattern(ctx, 'scales', P.paperLight, P.paperDark, 30); ctx.fillRect(-60, -60, W + 120, 1200);
      const on = tween(u, pw - 0.3, pw + 0.2);
      const r = 230 * pop(u, mg - 0.4, 0.45);
      if (r > 0) k.magnetron(ctx, 420, 520, r, S.t, 0.3 + on * 0.7);
      callout(ctx, k, P, 'CATHODE', 420, 520, 160, 840, tween(u, tb - 0.2, tb + 0.2));
      callout(ctx, k, P, 'CAVITIES', 420 + 147 * Math.cos(-0.4), 520 + 147 * Math.sin(-0.4), 790, 330, tween(u, tb, tb + 0.4));
      callout(ctx, k, P, 'ELECTRONS', 470, 560, 720, 600, tween(u, tb + 0.2, tb + 0.6));
      if (on > 0) k.waveRays(ctx, 420, 230, 420, -20, on, S.t, 3);
      k.label(ctx, 'THE MAGNETRON', 420, 940, 30, tween(u, mg, mg + 0.3));
      k.figure(ctx, 860, 1010, { ...SPENCER, s: 0.75, face: -1, mood: 'calm', armF: [1.8, 0.1] });
    },
  },
  { // 18.8 "Then he notices the candy bar in his pocket has melted."
    start: 18.6, title: 'A Melted Pocket', trans: 'page',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const no = S.at('notices'), cb = S.at('candy'), me = S.at('melted.');
      // a close-up of his white coat and its pocket
      ctx.fillStyle = '#ece6d6'; ctx.fillRect(-60, -60, W + 120, 1200);
      ctx.fillStyle = k.pattern(ctx, 'stripes', '#ece6d6', '#d8d0bc', 40); ctx.fillRect(-60, -60, W + 120, 1200);
      ctx.beginPath(); ctx.moveTo(-60, 120); ctx.lineTo(420, 560); k.stroke(ctx, '#cfc6b0', 14);
      const melt = tween(u, cb, me + 0.4, ease.inOut);
      k.candyBar(ctx, 470, 470 + melt * 30, 1.6, melt, -0.15, S.t);
      k.rect(ctx, 220, 520, 520, 330, '#e4dcc8', P.ink, 3);
      ctx.beginPath(); ctx.moveTo(220, 560); ctx.lineTo(740, 560); k.stroke(ctx, P.ink, 2);
      for (let i = 0; i < 4; i++) { const q = clamp(melt * 1.4 - i * 0.15); if (q > 0) k.blob(ctx, 360 + i * 80, 560 + q * 160, 26 + q * 24, i + 3, 0.3, 10, '#5a3218', P.ink, 1.5, 1.3); }
      k.waveRays(ctx, W + 60, 200, 620, 420, tween(u, 0, 1.2), S.t, 3);
      if (u > no - 0.2) k.magnifier(ctx, 300 + Math.sin(u * 2) * 20, 320, 90, 0.7);
    },
  },
  { // 23.2 "Most people would shrug. He gets curious."
    start: 23.1, title: 'He Gets Curious', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const sh = S.at('shrug.'), cu = S.at('curious.');
      interior(ctx, S, { carpet: false });
      // left: most people (faded, shrugging)
      ctx.save(); ctx.globalAlpha *= lerp(1, 0.45, tween(u, cu - 0.3, cu));
      [90, 220, 350].forEach((x, i) => k.figure(ctx, x, 1010, { ...ONLOOK[i], skin: SKINS[i], s: 0.85, face: 1, mood: 'calm', armF: [lerp(0.3, 1.5, tween(u, sh - 0.3, sh)), lerp(0.2, -1.8, tween(u, sh - 0.3, sh))], armB: [lerp(0.15, 1.2, tween(u, sh - 0.3, sh)), -1.4] }));
      ctx.restore();
      ctx.beginPath(); ctx.moveTo(W / 2 + 30, 120); ctx.lineTo(W / 2 + 30, 1060); k.stroke(ctx, P.goldDark, 4);
      // right: Spencer leans in with a glass
      const c = tween(u, cu - 0.4, cu + 0.2);
      k.figure(ctx, 720, 1010, { ...SPENCER, s: 1.05, face: -1, mood: c > 0.5 ? 'wow' : 'calm', armF: [lerp(1.0, 2.2, c), 0.2] });
      if (c > 0) k.magnifier(ctx, 600, 560, 70 * c, 0.7);
      medallion(ctx, k, P, '?', 720, 360, pop(u, cu - 0.3, 0.4), P.verm);
    },
  },
  { // 26.9 "He aims the tube at an egg. It explodes."
    start: 26.7, title: 'The Egg Test', trans: 'lattice',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const ai = S.at('aims'), eg = S.at('egg.'), ex = S.at('explodes.');
      const sh = shake(u, ex, 18, 0.5);
      ctx.translate(sh[0], sh[1]);
      S.cam(lerp(1.0, 1.25, tween(u, eg - 0.6, ex)) - 0.25 * tween(u, ex + 0.1, ex + 0.9), 520, 600);
      interior(ctx, S, { carpet: false });
      k.rect(ctx, 260, 700, 560, 24, P.brownLight, P.ink, 2.5); k.rect(ctx, 290, 724, 18, 280, P.brown, P.ink, 2); k.rect(ctx, 772, 724, 18, 280, P.brown, P.ink, 2);
      ctx.save(); ctx.translate(320, 620); ctx.rotate(0.12); k.magnetron(ctx, 0, 0, 70, S.t, tween(u, ai - 0.2, ai + 0.2)); ctx.restore();
      k.waveRays(ctx, 400, 610, 640, 600, tween(u, ai, eg + 0.3), S.t, 3);
      const crack = tween(u, eg, ex), burst = tween(u, ex, ex + 0.7, ease.outCubic);
      k.egg(ctx, 680, 640 + Math.sin(u * 40) * 3 * crack, 1.2, crack, burst, 9);
      if (burst > 0 && burst < 1) { ctx.save(); ctx.globalAlpha *= 1 - burst; k.circle(ctx, 680, 590, 60 + burst * 260, null, P.goldLight, 10); ctx.restore(); }
      onlookers(ctx, S, [120, 900], 1010, 0.9, u, tween(u, ex, ex + 0.2));
      k.stamp(ctx, 'IT EXPLODES', W / 2, 280, 60, tween(u, ex + 0.1, ex + 0.35, ease.linear), -0.12);
    },
  },
  { // 30.6 "He realizes these waves can cook food."
    start: 30.5, title: 'Waves That Cook', trans: 'ink',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const wa = S.at('waves'), co = S.at('cook'), fo = S.at('food.');
      ctx.fillStyle = P.paperLight; ctx.fillRect(-60, -60, W + 120, 1200);
      ctx.fillStyle = k.pattern(ctx, 'flowers', P.paperLight, P.paperDark, 30); ctx.fillRect(-60, -60, W + 120, 1200);
      // the wonder, written as a diagram: waves → heat → cooked food
      const a = pop(u, wa - 0.2, 0.35), b = pop(u, co - 0.2, 0.35), c = pop(u, fo - 0.2, 0.35);
      if (a > 0) { k.circle(ctx, 190, 420, 130 * a, P.paperLight, P.goldDark, 5); ctx.save(); ctx.beginPath(); ctx.arc(190, 420, 124 * a, 0, TAU); ctx.clip(); k.waveRays(ctx, 70, 420, 320, 420, 1, S.t, 3); ctx.restore();  }
      if (b > 0) { k.circle(ctx, 470, 420, 130 * b, P.paperLight, P.goldDark, 5); k.flames(ctx, 470, 480, 140 * b, 1, S.t); k.label(ctx, 'HEAT', 470, 590, 24, b); }
      if (c > 0) { k.circle(ctx, 750, 420, 130 * c, P.paperLight, P.goldDark, 5); k.bowl(ctx, 750, 450, 1.0 * c, S.t, P.white, true);  }
      for (const [x, q] of [[330, b], [610, c]]) if (q > 0) { ctx.save(); ctx.globalAlpha *= q; k.poly(ctx, [[x - 18, 400], [x + 18, 420], [x - 18, 440]], P.verm, P.ink, 2); ctx.restore(); }
      k.figure(ctx, 470, 1010, { ...SPENCER, s: 1.05, face: 1, mood: c > 0 ? 'happy' : 'calm', armF: [2.4, 0.1] });
    },
  },
  { // 34.1 "Raytheon patents it and the first microwave oven goes on sale."
    start: 33.9, title: 'Patented, Then Sold', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const pa = S.at('patents'), fi = S.at('first'), sa = S.at('sale.');
      interior(ctx, S, { carpetColor: P.verm });
      const cp = pop(u, pa - 0.3, 0.35) * (1 - tween(u, fi - 0.3, fi));
      if (cp > 0) { ctx.save(); ctx.translate(W / 2, 460); ctx.scale(cp, cp); k.certificate(ctx, 0, 0, 520, -0.04, 'PATENT', 'A WAY TO COOK WITH WAVES'); ctx.restore(); }
      const ov = tween(u, fi - 0.2, fi + 0.5, ease.outBack);
      if (ov > 0) k.bigOven(ctx, lerp(W + 200, W / 2, ov), 1000, 1.25, tween(u, sa - 0.4, sa), S.t);
      const tag = pop(u, sa - 0.1, 0.35);
      if (tag > 0) { ctx.save(); ctx.translate(780, 360); ctx.rotate(0.2 + Math.sin(u * 3) * 0.05); ctx.scale(tag, tag); ctx.beginPath(); ctx.moveTo(-40, -110); ctx.lineTo(0, -40); k.stroke(ctx, P.ink, 2); k.rect(ctx, -70, -40, 140, 80, P.goldLight, P.ink, 2.5); ctx.fillStyle = P.vermDark; ctx.font = '900 26px Deco'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('ON SALE', 0, 2); ctx.restore(); }
    },
  },
  { // 38.1 "Almost six feet tall, about 750 pounds."
    start: 37.9, title: 'Six Feet, 750 Pounds', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const si = S.at('six'), po = S.at('750'), lb = S.at('pounds.');
      interior(ctx, S, { carpet: false });
      k.bigOven(ctx, 330, 1010, 1.45, 0.6, S.t);
      k.measureRod(ctx, 120, 1010 - 560 * 1.45, 1010, tween(u, si - 0.3, si + 0.6));
      k.label(ctx, 'ALMOST 6 FEET', 190, 160, 24, tween(u, si + 0.4, si + 0.7));
      const tilt = tween(u, po - 0.2, lb, ease.outBack);
      k.balance(ctx, 750, 1000, 1.25, -0.35 * tilt);
      if (tilt > 0) { ctx.save(); ctx.translate(670, 650 + 40 * tilt); k.rect(ctx, -50, -60, 100, 60, P.steel, P.ink, 2); ctx.fillStyle = P.white; ctx.font = '900 22px Deco'; ctx.textAlign = 'center'; ctx.fillText('750', 0, -24); ctx.restore(); }
      k.label(ctx, 'ABOUT 750 POUNDS', 750, 460, 24, tween(u, lb - 0.3, lb));
      onlookers(ctx, S, [600, 900], 1040, 0.7, u, tween(u, si, si + 0.3));
    },
  },
  { // 42.2 "His reward for the patent? The same $2 bonus Raytheon gave every inventor on staff."
    start: 41.9, title: 'The Reward', trans: 'page',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const re = S.at('reward'), tw = S.at(/^\$2$/), ev = S.at('every'), inv = S.at('inventor');
      interior(ctx, S, { carpetColor: P.lapis });
      // a treasure chest opens… on one small coin
      const op = tween(u, re, re + 0.6, ease.outBack), dn = tween(u, ev - 0.5, ev);
      const csc = lerp(1, 0.6, dn); ctx.save(); ctx.translate(lerp(W / 2, 200, dn), lerp(0, 1000 - 820 * 0.6 - 40, dn)); ctx.scale(csc, csc);
      k.chest(ctx, 0, 820, 1.4, op, 0);
      if (op > 0.5) { ctx.save(); ctx.globalAlpha *= 0.7; const g = ctx.createRadialGradient(0, 700, 10, 0, 700, 200); g.addColorStop(0, 'rgba(255,240,170,0.8)'); g.addColorStop(1, 'rgba(255,240,170,0)'); ctx.fillStyle = g; ctx.fillRect(-200, 500, 400, 400); ctx.restore(); }
      const cn = pop(u, tw - 0.1, 0.35); if (cn > 0) k.coin(ctx, 0, 620 - cn * 40, 46 * cn, S.t * 2, '$2');
      ctx.restore();
      k.label(ctx, 'THE SAME $2', W / 2, 150, 28, tween(u, tw + 0.2, tw + 0.5));
      // every inventor on staff gets one too
      for (let i = 0; i < 4; i++) { const a = pop(u, inv - 0.3 + i * 0.2, 0.3); if (a <= 0) continue; const x = 470 + i * 140; k.figure(ctx, x, 1010, { ...ONLOOK[i % 3], skin: SKINS[(i + 1) % 3], s: 0.75 * a, face: -1, mood: 'calm', armF: [1.8, 0.2] }); k.coin(ctx, x - 40, 640, 24 * a, S.t * 2 + i, '$2'); }
    },
  },
  { // 48.2 "A melted snack, now in kitchens everywhere."
    start: 48.0, title: 'In Kitchens Everywhere', trans: 'ink',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const me = S.at('melted'), no = S.at('now'), ki = S.at('kitchens');
      ctx.fillStyle = '#efe2c0'; ctx.fillRect(-60, -60, W + 120, 1200);
      ctx.fillStyle = k.pattern(ctx, 'cintamani', '#efe2c0', '#e2cf9e', 46); ctx.fillRect(-60, -60, W + 120, 1200);
      // a wheel of kitchens around the little bar that started it
      const cx = W / 2, cy = 540, spin = S.t * 0.15;
      k.circle(ctx, cx, cy, 390, null, P.goldDark, 4); k.circle(ctx, cx, cy, 250, null, P.goldDark, 2);
      for (let i = 0; i < 8; i++) {
        const a = spin + i / 8 * TAU, x = cx + Math.cos(a) * 320, y = cy + Math.sin(a) * 320, p = pop(u, ki - 0.4 + i * 0.12, 0.3);
        if (p <= 0) continue;
        k.circle(ctx, x, y, 72 * p, [P.paperLight, P.pink, P.sageLight, P.ochreLight][i % 4], P.goldDark, 4);
        k.rect(ctx, x - 56 * p, y + 18 * p, 112 * p, 14 * p, P.brownLight, P.ink, 1.5);
        k.smallOven(ctx, x, y - 8 * p, 0.42 * p, 1, S.t + i);
      }
      const mo = tween(u, no - 0.3, no + 0.3);
      if (mo < 1) { ctx.save(); ctx.globalAlpha *= 1 - mo; k.candyBar(ctx, cx, cy, 1.1, 1, 0, S.t); ctx.restore(); }
      if (mo > 0) { ctx.save(); ctx.globalAlpha *= mo; k.smallOven(ctx, cx, cy, 1.25, 1, S.t); ctx.restore(); }
    },
  },
  { // 52.0 "Every legend has a beginning."
    start: 51.8, title: 'Every Legend Has a Beginning', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S, beg = S.at('beginning.');
      ctx.save(); S.cam(lerp(1.0, 1.6, tween(u, 0, beg)), W / 2, 540);
      ctx.fillStyle = '#efe2c0'; ctx.fillRect(-60, -60, W + 120, 1200);
      k.smallOven(ctx, W / 2, 540, 1.6, 1, S.t);
      k.candyBar(ctx, W / 2, 760, 0.8, 0.3, 0, S.t);
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
  ...scenes.slice(1).map(s => ({ t: s.start - 0.05, type: 'whoosh', gain: 0.3 })),
  { t: 0.4, type: 'riser', gain: 0.25 }, { t: 3.0, type: 'sizzle', gain: 0.45 }, { t: 4.0, type: 'drip', gain: 0.4 },
  { t: 5.0, type: 'stamp', gain: 0.5 }, { t: 6.2, type: 'wind', gain: 0.25 },
  { t: 8.0, type: 'pluck', gain: 0.45 }, { t: 9.86, type: 'stamp', gain: 0.8 },
  { t: 12.0, type: 'alarm', gain: 0.15 }, { t: 13.36, type: 'chime', gain: 0.4 },
  { t: 15.6, type: 'riser', gain: 0.35 }, { t: 17.2, type: 'chime', gain: 0.45, pitch: 1.3 },
  { t: 19.2, type: 'pluck', gain: 0.4 }, { t: 20.6, type: 'sizzle', gain: 0.5 }, { t: 22.0, type: 'stamp', gain: 0.85 }, { t: 22.3, type: 'drip', gain: 0.5 },
  { t: 24.0, type: 'flop', gain: 0.4 }, { t: 25.5, type: 'chime', gain: 0.5, pitch: 1.5 },
  { t: 27.0, type: 'riser', gain: 0.5 }, { t: 28.2, type: 'crack', gain: 0.5 }, { t: 29.16, type: 'thud', gain: 0.9 }, { t: 29.18, type: 'splash', gain: 0.6 }, { t: 29.3, type: 'stamp', gain: 0.6 },
  { t: 31.7, type: 'pop', gain: 0.4 }, { t: 32.4, type: 'sizzle', gain: 0.35 }, { t: 32.8, type: 'pop', gain: 0.45, pitch: 1.3 },
  { t: 34.4, type: 'paper', gain: 0.4 }, { t: 34.7, type: 'stamp', gain: 0.8 }, { t: 35.6, type: 'slide', gain: 0.5 }, { t: 37.2, type: 'coins', gain: 0.35 },
  { t: 38.4, type: 'riser', gain: 0.3 }, { t: 40.0, type: 'clank', gain: 0.6 }, { t: 40.9, type: 'thud', gain: 0.7 },
  { t: 42.3, type: 'riser', gain: 0.35 }, { t: 42.9, type: 'chime', gain: 0.4 }, { t: 44.25, type: 'pluck', gain: 0.6 }, { t: 44.4, type: 'flop', gain: 0.4 },
  { t: 46.5, type: 'coins', gain: 0.3 }, { t: 46.9, type: 'coins', gain: 0.3 },
  { t: 49.6, type: 'pop', gain: 0.5 }, { t: 50.2, type: 'chime', gain: 0.5 }, { t: 50.6, type: 'riser', gain: 0.35 },
  { t: 53.12, type: 'pop', gain: 0.8 }, { t: 53.16, type: 'gong', gain: 0.9 },
];

export const music = {
  bpm: 100, root: 'C', maqam: 'rast', gain: 0.32,
  sections: [
    { from: 0, to: 4.8, mood: 'intro' },
    { from: 4.8, to: 14.4, mood: 'groove' },
    { from: 14.4, to: 26.7, mood: 'drive' },
    { from: 26.7, to: 37.9, mood: 'triumph' },
    { from: 37.9, to: 41.9, mood: 'groove' },
    { from: 41.9, to: 48.0, mood: 'sad' },
    { from: 48.0, to: 53.12, mood: 'triumph' },
    { from: 53.12, to: 55.9, mood: 'end' },
  ],
};
