// "The Christmas Truce of 1914" — told through a soldier's letter home (the
// `letters` device): we open on him writing by candlelight, the story plays as
// what he saw, and we come back to him signing it. His letter is fiction; the
// events are history. Uniforms are 1914 (British peaked caps, German spiked
// helmets in grey cloth covers). The voice is sped up 5% to fit under 60 s.
import { clamp, lerp, ease, tween, rng, TAU, shake, pop } from '../../lib/core.mjs';
import { interior, bookCover, medallion } from '../../styles/ottoman/scenes.mjs';
import { act } from '../../styles/ottoman/acting.mjs';

export const meta = {
  title: 'The Christmas Truce of 1914',
  slug: 'christmas-truce-ottoman',
  style: 'ottoman',
  look: 'night',    // Christmas Eve (posted between Mickey (album) and microwave (scroll))
  room: 'library',  // the generals' headquarters
  device: 'letters',
  ambient: 'snow',
  cameos: [{ at: 'soccer', dur: 1.6, mood: 'smile' }],
  width: 1080, height: 1920, fps: 30,
  duration: 59.6,
  voice: 'voice.mp3',
  seed: 161,
  captionChars: 30,
  brand: { handle: '@HOWITSTARTED-YT1', logo: '../../../brand/logo.png' },
  outro: { at: 57.8, text: 'Subscribe for more origin stories' },
};

const KHAKI = '#8a7a4a', GREY = '#7d8070';
const SKINS = ['#f1d1a8', '#e2b48a', '#f1d1a8', '#d9a882', '#f1d1a8', '#e8c49a'];
const TOMMY = i => ({ robe: KHAKI, robeP: 'stripes', robePc: '#7c6e40', inner: '#b8a878', sash: '#5a4a2a', hat: 'servicecap', skin: SKINS[i % 6], mustache: i % 2 === 0, s: 0.9 });
const FRITZ = i => ({ robe: GREY, robeP: 'stripes', robePc: '#6e7062', inner: '#a8aa98', sash: '#3a3a30', hat: 'pickelhaube', skin: SKINS[(i + 3) % 6], beard: i % 3 === 0 ? 'short' : undefined, mustache: i % 2 === 1, s: 0.9 });
const TOM = { ...TOMMY(0), mustache: false, s: 1.15 };

// the night battlefield: two trench lines facing each other across no man's land
function field(ctx, S, o = {}) {
  const { k, P, W, t } = S;
  k.nightSky(ctx, -80, -80, W + 160, 1240, t);
  if (o.moon !== false) k.moon(ctx, 780, 140, 46);
  ctx.fillStyle = '#d9dde3'; ctx.fillRect(-80, 470, W + 160, 700);                      // frozen ground
  ctx.fillStyle = '#bcc3cc'; for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.ellipse(300 + (i % 4) * 110, 600 + Math.floor(i / 4) * 150 + (i % 2) * 30, 50, 13, 0, 0, TAU); ctx.fill(); } // shell holes
  k.barbedWire(ctx, 250, 440, 560, 46); k.barbedWire(ctx, 520, 700, 560, 46);
  k.trench(ctx, 90, 480, 300, 600); k.trench(ctx, 850, 480, 300, 600);
}
const TOPS = { '-1': [40, 100, 160, 210], '1': [900, 840, 780, 730] };
function silhouettes(ctx, S, side, n, rise = 0, gesture = null, u = 0) {
  for (let i = 0; i < n; i++) {
    const x = TOPS[side][i], base = lerp(700, 610, rise);
    S.k.figure(ctx, x, base + (i % 2) * 8, { ...(side < 0 ? TOMMY(i) : FRITZ(i)), s: 0.85, face: side < 0 ? 1 : -1, mood: 'calm', ...(gesture ? act(gesture, u + i, 1) : {}) });
  }
}

export const scenes = [
  { // 0.0 "In the middle of World War I, enemies stopped fighting for Christmas."
    start: 0, title: 'Christmas, 1914',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const st = S.at('stopped'), ch = S.at('Christmas.');
      S.cam(lerp(1.0, 1.3, tween(u, st, ch + 1.2, ease.inOut)), W / 2, lerp(560, 520, tween(u, st, ch + 1)));
      field(ctx, S);
      // flashes and tracers until "stopped", then dark and quiet
      if (u < st + 0.2) { const R = rng(Math.floor(u * 8)); for (let i = 0; i < 4; i++) { const x = 120 + R() * 700, y = 300 + R() * 260; ctx.save(); ctx.globalAlpha = 0.8 * (1 - u / (st + 0.2)); k.circle(ctx, x, y, 18 + R() * 30, '#ffe0a0', null); ctx.restore(); } }
      // one small candle tree lights up in the middle of no man's land
      const lit = tween(u, ch - 0.4, ch + 0.4);
      k.candleTree(ctx, W / 2, 640, 1.6, S.t, lit);
    },
  },
  { // 6.0 "December 1914."
    start: 5.8, title: 'A Letter Home', trans: 'ink',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const yr = S.at('1914.');
      S.cam(lerp(1.08, 1.0, tween(u, 0, 1.2)), W / 2, 560);
      ctx.fillStyle = '#3e2f20'; ctx.fillRect(-80, -80, W + 160, 1240);                  // a dugout wall of earth and planks
      for (let i = 0; i < 8; i++) k.rect(ctx, -20 + i * 140, -40, 18, 1100, '#5a4630', P.ink, 1.5);
      k.rect(ctx, -80, 720, W + 160, 30, P.brownLight, P.ink, 2);                         // the plank table
      k.candle(ctx, 760, 720, 1.4, S.t);
      k.figure(ctx, 330, 1010, { ...TOM, face: 1, mood: 'calm', armF: [1.25, 0.6] });
      k.letter(ctx, 600, 640, 300, 160, ['Dear Mother,', 'December 1914'], tween(u, 0.2, 1.1), -0.08);
      k.seal(ctx, 150, 160, 62, ' DECEMBER · 1914 ·', '1914', tween(u, yr - 0.1, yr + 0.3, ease.linear));
    },
  },
  { // 7.1 "The Western Front."
    start: 7.0, title: 'The Western Front', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const fr = S.at('Front.');
      ctx.fillStyle = '#efe2c0'; ctx.fillRect(-80, -80, W + 160, 1240);
      S.cam(lerp(1.0, 1.12, tween(u, 0, 2.8)), 470, 520);
      k.waves(ctx, -80, -80, 360, 420, S.t, P.water, P.waterLight, 14, 20);                // the North Sea and Channel
      ctx.beginPath(); k.smoothPath(ctx, [[280, -80], [300, 120], [240, 260], [120, 340], [-80, 360], [-80, 1200], [W + 80, 1200], [W + 80, -80]]); k.fillStroke(ctx, '#e4d4a0', P.ink, 2.5);
      ctx.save(); ctx.setLineDash([10, 8]); ctx.beginPath(); ctx.moveTo(420, -80); ctx.quadraticCurveTo(520, 300, 600, 520); ctx.quadraticCurveTo(700, 760, 960, 900); k.stroke(ctx, P.ink, 2); ctx.restore(); // borders
      // the front line is inked in red from the sea to the Swiss border
      const L = tween(u, 0.2, fr + 0.9, ease.inOut), pts = [[300, 130], [330, 240], [360, 330], [420, 430], [470, 560], [520, 680], [600, 790], [700, 880], [820, 980]];
      ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); const n = L * (pts.length - 1);
      for (let i = 1; i <= Math.floor(n); i++) ctx.lineTo(pts[i][0] + ((i % 2) ? 10 : -10), pts[i][1]);
      if (n % 1 > 0 && Math.floor(n) + 1 < pts.length) { const a = pts[Math.floor(n)], b = pts[Math.floor(n) + 1], q = n % 1; ctx.lineTo(lerp(a[0], b[0], q), lerp(a[1], b[1], q)); }
      k.stroke(ctx, P.vermDark, 9); k.stroke(ctx, P.verm, 5);
      k.label(ctx, 'NORTH SEA', 130, 140, 20, tween(u, 0.2, 0.6));
      k.label(ctx, 'BELGIUM', 560, 250, 22, tween(u, 0.5, 0.9));
      k.label(ctx, 'FRANCE', 230, 720, 24, tween(u, 0.7, 1.1));
      k.label(ctx, 'GERMANY', 800, 520, 24, tween(u, 0.9, 1.3));
      k.label(ctx, 'YPRES', 300, 300, 18, tween(u, 1.2, 1.6));
    },
  },
  { // 10.1 "British and German soldiers face each other from muddy, freezing trenches."
    start: 9.9, title: 'Fifty Yards Apart', trans: 'ink',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const br = S.at('British'), ge = S.at('German'), fz = S.at('freezing');
      S.cam(lerp(1.25, 1.0, tween(u, 0, 2.6, ease.inOut)), lerp(200, 470, tween(u, 0, 2.6)), 620);
      field(ctx, S);
      const sh = tween(u, fz - 0.2, fz + 0.6);
      silhouettes(ctx, S, -1, 4, 0, sh > 0.5 ? 'worry' : null, u);
      silhouettes(ctx, S, 1, 4, 0, sh > 0.5 ? 'worry' : null, u);
      // their breath freezes in the air
      if (sh > 0) for (let i = 0; i < 8; i++) { const side = i < 4 ? -1 : 1, x = TOPS[side][i % 4] + side * 14, q = ((u * 0.7 + i * 0.13) % 1); ctx.save(); ctx.globalAlpha = (1 - q) * 0.7 * sh; k.circle(ctx, x + side * (10 + q * 30), 470 - q * 40, 6 + q * 10, '#f8f8f8', null); ctx.restore(); }
      k.label(ctx, '≈ 50 YARDS', W / 2, 430, 22, tween(u, ge, ge + 0.4));
    },
  },
  { // 15.0 "Earlier that month, the Pope asked for a Christmas truce. Leaders said no."
    start: 14.8, title: 'A Plea From Rome', trans: 'page',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const po = S.at('Pope'), as = S.at('asked'), le = S.at('Leaders'), no = S.at('no.');
      S.cam(lerp(1.0, 1.1, tween(u, le - 0.5, no + 0.5, ease.inOut)), lerp(330, 660, tween(u, as, le)), 560);
      interior(ctx, S, { carpetColor: P.vermDark, room: 'arches' });
      k.figure(ctx, 200, 1010, { robe: P.white, robeP: 'stripes', robePc: '#e6e2d8', inner: P.white, sash: P.white, hat: 'zucchetto', glasses: true, skin: '#f1d1a8', s: 1.05, face: 1, mood: 'calm', ...act('present', u, tween(u, as - 0.2, as + 0.3)) });
      k.label(ctx, 'BENEDICT XV', 200, 640, 22, tween(u, po, po + 0.3));
      // his appeal flies across the room…
      const fly = tween(u, as, le - 0.2, ease.inOut), tear = tween(u, no - 0.15, no + 0.35, ease.outCubic);
      const lx = lerp(320, 640, fly), ly = 520 - Math.sin(fly * Math.PI) * 140;
      if (tear <= 0) k.letter(ctx, lx, ly, 200, 130, ['A truce,', 'for Christmas?'], 1, Math.sin(fly * 6) * 0.1);
      else for (const sd of [-1, 1]) { ctx.save(); ctx.beginPath(); ctx.rect(sd < 0 ? lx - 120 : lx, ly - 90, 120, 180); ctx.clip(); ctx.translate(sd * tear * 50, tear * 120); ctx.rotate(sd * tear * 0.4); k.letter(ctx, lx, ly, 200, 130, ['A truce,', 'for Christmas?'], 1, 0); ctx.restore(); }
      // …and the leaders of the warring nations each shake their heads
      [[600, 'crown'], [740, 'stovepipe'], [880, 'crown']].forEach(([x, hat], i) => k.figure(ctx, x, 1010, { robe: [P.lapis, P.ink, '#3a3f55'][i], robeP: 'stripes', robePc: P.gold, hat, beard: i === 2 ? 'short' : undefined, mustache: true, skin: '#f1d1a8', s: 0.95, face: -1, mood: 'calm', look: u > le ? Math.sin(u * 9 + i) * 0.6 : 0, ...act(u > no ? 'angry' : 'rest', u, tween(u, no - 0.2, no + 0.2)) }));
    },
  },
  { // 20.8 "But on Christmas Eve, the British hear something from the German side."
    start: 20.6, title: 'Christmas Eve', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const ev = S.at('Eve,'), he = S.at('hear'), si = S.at('side.');
      S.cam(lerp(1.0, 1.35, tween(u, he - 0.4, si + 0.6, ease.inOut)), lerp(W / 2, 760, tween(u, he - 0.4, si + 0.6)), 580);
      field(ctx, S);
      // the German parapet fills with little trees, their candles lit one by one
      for (let i = 0; i < 6; i++) k.candleTree(ctx, 700 + i * 46, 470, 0.62, S.t + i, tween(u, ev - 0.5 + i * 0.3, ev + i * 0.3));
      silhouettes(ctx, S, 1, 4, 0.1, null, u);
      for (let i = 0; i < 4; i++) { const f = TOMMY(i); k.figure(ctx, TOPS[-1][i], lerp(700, 650, tween(u, he - 0.2, he + 0.6)), { ...f, s: 0.85, face: 1, look: -0.3, mood: 'wow', ...act('rest', u) }); }
    },
  },
  { // 25.0 "Singing. Silent night."
    start: 24.8, title: 'Stille Nacht', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const sg = S.at('Singing.'), sn = S.at('Silent');
      S.cam(lerp(1.15, 1.0, tween(u, 0, 3.3, ease.inOut)), W / 2, 560);
      field(ctx, S);
      for (let i = 0; i < 6; i++) k.candleTree(ctx, 700 + i * 46, 470, 0.62, S.t + i, 1);
      silhouettes(ctx, S, 1, 4, 0.2, null, u);
      silhouettes(ctx, S, -1, 4, 0.3, null, u);
      // the carol drifts across no man's land as notes
      if (u > sg - 0.2) for (let i = 0; i < 10; i++) { const q = ((u - sg) * 0.35 + i / 10) % 1, x = lerp(880, 120, q), y = 420 - Math.sin(q * Math.PI) * 140 + Math.sin(q * 12 + i) * 18; ctx.save(); ctx.globalAlpha = Math.sin(q * Math.PI); k.musicNote(ctx, x, y, 1.1, P.goldLight); ctx.restore(); }
      k.label(ctx, '„STILLE NACHT, HEILIGE NACHT“', W / 2, 220, 22, tween(u, sn - 0.2, sn + 0.4));
    },
  },
  { // 28.3 "Soon soldiers climb out and meet in no man's land, the deadly ground between the trenches."
    start: 28.1, title: "No Man's Land", trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const cl = S.at('climb'), me = S.at('meet'), de = S.at('deadly');
      S.cam(lerp(1.2, 0.95, tween(u, cl - 0.3, de + 0.6, ease.inOut)), W / 2, lerp(640, 560, tween(u, cl, de)));
      field(ctx, S);
      for (let i = 0; i < 6; i++) k.candleTree(ctx, 700 + i * 46, 470, 0.62, S.t + i, 1);
      // they climb out and walk towards each other; the wire between them is the danger
      for (let i = 0; i < 4; i++) {
        const go = tween(u, cl - 0.2 + i * 0.25, me + 1.6 + i * 0.25, ease.inOut);
        k.figure(ctx, lerp(TOPS[-1][i], 250 + i * 44, go), lerp(700, 800 + i * 22, Math.min(1, go * 2)), { ...TOMMY(i), s: 0.85, face: 1, mood: 'calm', ...act(go > 0 && go < 1 ? 'walk' : 'rest', u + i) });
        k.figure(ctx, lerp(TOPS[1][i], 700 - i * 44, go), lerp(700, 800 + i * 22, Math.min(1, go * 2)), { ...FRITZ(i), s: 0.85, face: -1, mood: 'calm', ...act(go > 0 && go < 1 ? 'walk' : 'rest', u + i) });
      }
    },
  },
  { // 34.5 "They shake hands, share food, swap gifts,"
    start: 34.3, title: 'Gifts in the Snow', trans: 'ink',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const sh = S.at('shake'), fo = S.at('food,'), gi = S.at('gifts,');
      S.cam(lerp(1.0, 1.08, tween(u, 0, 3.9)), W / 2, 720);
      k.nightSky(ctx, -80, -80, W + 160, 1240, S.t);
      ctx.fillStyle = '#d9dde3'; ctx.fillRect(-80, 600, W + 160, 600);
      // continuous narration: three pairs, three moments of the same night
      const pairs = [[180, sh, 'hands'], [W / 2, fo, 'food'], [W - 180, gi, 'gifts']];
      pairs.forEach(([x, at, what], i) => {
        const k1 = tween(u, at - 0.3, at + 0.3);
        k.figure(ctx, x - 60, 1000, { ...TOMMY(i), s: 0.95, face: 1, mood: k1 > 0.5 ? 'happy' : 'calm', armF: [lerp(0.4, 1.45, k1), 0.2], hold: what === 'food' && k1 > 0.5 ? c => k.rect(c, -18, -10, 36, 24, '#c9a06a', P.ink, 1.5) : null });
        k.figure(ctx, x + 60, 1000, { ...FRITZ(i), s: 0.95, face: -1, mood: k1 > 0.5 ? 'happy' : 'calm', armF: [lerp(0.4, 1.45, k1), 0.2], hold: what === 'gifts' && k1 > 0.5 ? c => { k.rect(c, -14, -12, 28, 22, P.verm, P.ink, 1.5); k.rect(c, -2, -12, 4, 22, P.goldLight, null); } : null });
      });
      k.label(ctx, 'PLUM PUDDING · SAUSAGE · BUTTONS', W / 2, 520, 20, tween(u, gi, gi + 0.4));
    },
  },
  { // 38.3 "bury their dead together."
    start: 38.2, title: 'Side by Side', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const bu = S.at('bury'), to = S.at('together.');
      S.cam(lerp(1.0, 1.15, tween(u, 0, 2.2, ease.inOut)), W / 2, 760);
      k.nightSky(ctx, -80, -80, W + 160, 1240, S.t);
      ctx.fillStyle = '#d9dde3'; ctx.fillRect(-80, 640, W + 160, 600);
      for (const x of [380, 560]) { ctx.beginPath(); ctx.ellipse(x, 860, 70, 18, 0, 0, TAU); k.fillStroke(ctx, '#a89366', P.ink, 2); k.rect(ctx, x - 5, 720, 10, 140, P.brown, P.ink, 1.5); k.rect(ctx, x - 34, 756, 68, 10, P.brown, P.ink, 1.5); }
      const bow = tween(u, bu, to + 0.4);
      for (let i = 0; i < 3; i++) { k.figure(ctx, 140 + i * 70, 1000, { ...TOMMY(i), s: 0.8, face: 1, mood: 'sad', look: 0.4 * bow, armF: [0.3, 1.4], armB: [0.3, 1.3] }); k.figure(ctx, W - 140 - i * 70, 1000, { ...FRITZ(i), s: 0.8, face: -1, mood: 'sad', look: 0.4 * bow, armF: [0.3, 1.4], armB: [0.3, 1.3] }); }
    },
  },
  { // 40.6 "In some places, they even play soccer."
    start: 40.4, title: 'A Game of Football', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const so = S.at('soccer.');
      k.nightSky(ctx, -80, -80, W + 160, 1240, S.t);
      ctx.fillStyle = '#e2e6ea'; ctx.fillRect(-80, 600, W + 160, 600);
      // caps for goalposts
      for (const x of [90, 220, W - 220, W - 90]) { if (x < W / 2) { ctx.beginPath(); ctx.ellipse(x, 900, 22, 10, 0, 0, TAU); k.fillStroke(ctx, KHAKI, P.ink, 1.5); ctx.beginPath(); ctx.ellipse(x, 892, 18, 12, 0, Math.PI, TAU); k.fillStroke(ctx, KHAKI, P.ink, 1.5); } else { ctx.beginPath(); ctx.ellipse(x, 896, 20, 16, 0, Math.PI, TAU); k.fillStroke(ctx, GREY, P.ink, 1.5); k.poly(ctx, [[x - 3, 880], [x + 3, 880], [x, 866]], GREY, P.ink, 1.2); } }
      const bx = W / 2 + Math.sin(u * 2.2) * 300, by = 880 - Math.abs(Math.sin(u * 4.4)) * 160;
      S.cam(1.05, lerp(W / 2, bx, 0.3), 760);
      for (let i = 0; i < 3; i++) { const chase = Math.sin(u * 2.2 - 0.3 - i * 0.2) * 300; k.figure(ctx, W / 2 + chase - 70 + i * 40, 1000 + i * 10, { ...TOMMY(i), s: 0.75, face: chase < 0 ? 1 : -1, mood: 'happy', ...act('walk', u * 1.6 + i) }); k.figure(ctx, W / 2 + chase + 70 - i * 40, 1000 + i * 10, { ...FRITZ(i), s: 0.75, face: chase > 0 ? -1 : 1, mood: 'happy', ...act('walk', u * 1.6 + i + 1) }); }
      k.leatherBall(ctx, bx, by, 0.6, u * 6);
      if (u > so) for (let i = 0; i < 4; i++) k.figure(ctx, 60 + i * 50, 640, { ...(i % 2 ? FRITZ(i) : TOMMY(i)), s: 0.45, face: 1, ...act('cheer', u + i) });
    },
  },
  { // 43.3 "The generals are furious. They order it never to happen again."
    start: 43.2, title: 'Orders From Headquarters', trans: 'page',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const fu = S.at('furious.'), or = S.at('order'), ne = S.at('never');
      const sh = shake(u, fu, 6, 0.5); ctx.translate(sh[0], sh[1]);
      S.cam(lerp(1.0, 1.2, tween(u, or - 0.3, ne + 0.6, ease.inOut)), lerp(W / 2, 620, tween(u, or, ne)), 560);
      interior(ctx, S, { carpetColor: P.lapis });
      k.rect(ctx, 380, 720, 520, 26, P.brown, P.ink, 2);
      [[200, KHAKI, 'servicecap'], [W - 160, GREY, 'pickelhaube']].forEach(([x, robe, hat], i) => k.figure(ctx, x, 1010, { robe, robeP: 'stripes', robePc: P.gold, sash: P.verm, hat, mustache: true, beard: i ? 'short' : undefined, skin: '#f1d1a8', s: 1.05, face: i ? -1 : 1, ...act(u > fu - 0.2 ? 'angry' : 'rest', u, tween(u, fu - 0.3, fu)) }));
      k.letter(ctx, 600, 420, 300, 170, ['ORDERS:', 'No fraternising', 'with the enemy.'], tween(u, or, ne + 0.8), -0.04);
      if (u > ne + 0.6) { k.circle(ctx, 720, 480, 24, P.vermDark, P.ink, 2); k.star(ctx, 720, 480, 11, 1); }
    },
  },
  { // 47.9 "It never happens on that scale again."
    start: 47.7, title: 'Never Again', trans: 'ink',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const ne = S.at('never'), sc = S.at('scale');
      S.cam(lerp(1.0, 0.92, tween(u, 0, 3)), W / 2, 600);
      field(ctx, S);
      // the candles go out one by one; the ball lies alone in the snow
      for (let i = 0; i < 6; i++) k.candleTree(ctx, 700 + i * 46, 470, 0.62, S.t + i, 1 - tween(u, ne - 0.3 + i * 0.3, ne + i * 0.3));
      k.leatherBall(ctx, 470, 780, 0.7, 0.3);
      ctx.save(); ctx.globalAlpha = tween(u, sc, sc + 1.4) * 0.5; ctx.fillStyle = '#eef1f4'; ctx.beginPath(); ctx.ellipse(470, 796, 70, 14, 0, 0, TAU); ctx.fill(); ctx.restore();
      silhouettes(ctx, S, -1, 4, 0, null, u); silhouettes(ctx, S, 1, 4, 0, null, u);
    },
  },
  { // 51.0 "One silent night, when enemies chose peace."
    start: 50.8, title: 'One Silent Night', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const si = S.at('silent'), en = S.at('enemies'), pe = S.at('peace.');
      S.cam(lerp(1.3, 1.0, tween(u, 0, 2.5, ease.inOut)), 300, 640);
      ctx.fillStyle = '#3e2f20'; ctx.fillRect(-80, -80, W + 160, 1240);
      for (let i = 0; i < 8; i++) k.rect(ctx, -20 + i * 140, -40, 18, 1100, '#5a4630', P.ink, 1.5);
      k.rect(ctx, -80, 720, W + 160, 30, P.brownLight, P.ink, 2);
      k.candle(ctx, 760, 720, 1.4, S.t);
      k.figure(ctx, 330, 1010, { ...TOM, face: 1, mood: 'happy', armF: [1.25, 0.6] });
      // plant and pay-off: the letter he began now ends; a German button on the table
      k.letter(ctx, 600, 600, 320, 260, ['Dear Mother,', 'December 1914', 'We sang with them,', 'Christmas night.', '— Tom'], tween(u, si, pe + 0.6), -0.08);
      k.circle(ctx, 520, 708, 9, '#b9b9a8', P.ink, 1.5); k.circle(ctx, 520, 708, 3, P.ink, null);
      if (u > pe) k.candleTree(ctx, 860, 712, 0.6, S.t, 1);
    },
  },
  { // 55.9 "Every legend has a beginning."
    start: 55.7, title: 'Every Legend Has a Beginning', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S, beg = S.at('beginning.');
      ctx.save(); S.cam(lerp(1.0, 1.5, tween(u, 0, beg)), W / 2, 600);
      field(ctx, S);
      k.candleTree(ctx, W / 2, 640, 1.6, S.t, 1);
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
  ...scenes.slice(1).map(s => ({ t: s.start - 0.05, type: s.trans === 'cut' ? 'pop' : 'wind', gain: 0.25 })),
  { t: 0.2, type: 'thud', gain: 0.6 }, { t: 0.7, type: 'crack', gain: 0.4 }, { t: 1.3, type: 'thud', gain: 0.5 }, { t: 1.9, type: 'crack', gain: 0.35 }, { t: 2.4, type: 'thud', gain: 0.4 },
  { t: 4.0, type: 'chime', gain: 0.35, pitch: 1.4 }, { t: 5.9, type: 'paper', gain: 0.4 }, { t: 6.4, type: 'stamp', gain: 0.4 },
  { t: 7.3, type: 'paper', gain: 0.35 }, { t: 10.0, type: 'wind', gain: 0.5 }, { t: 12.4, type: 'drip', gain: 0.3 }, { t: 13.2, type: 'wind', gain: 0.4 },
  { t: 16.6, type: 'whoosh', gain: 0.3 }, { t: 19.5, type: 'paper', gain: 0.6 }, { t: 19.6, type: 'thud', gain: 0.4 },
  { t: 21.1, type: 'chime', gain: 0.3, pitch: 1.6 }, { t: 21.6, type: 'chime', gain: 0.3, pitch: 1.8 }, { t: 22.1, type: 'chime', gain: 0.3, pitch: 2.0 },
  { t: 24.9, type: 'silentnight', gain: 0.55, pitch: 1.335 },
  { t: 29.2, type: 'slide', gain: 0.3 }, { t: 31.0, type: 'wind', gain: 0.4 },
  { t: 34.6, type: 'pluck', gain: 0.35 }, { t: 35.9, type: 'pluck', gain: 0.35, pitch: 1.2 }, { t: 37.1, type: 'chime', gain: 0.4 },
  { t: 38.4, type: 'gong', gain: 0.35, pitch: 0.7 },
  { t: 41.0, type: 'thud', gain: 0.35 }, { t: 41.6, type: 'thud', gain: 0.3 }, { t: 42.2, type: 'pop', gain: 0.5 },
  { t: 44.16, type: 'thud', gain: 0.8 }, { t: 45.4, type: 'paper', gain: 0.4 }, { t: 46.8, type: 'stamp', gain: 0.5 },
  { t: 48.1, type: 'wind', gain: 0.5 },
  { t: 51.3, type: 'chime', gain: 0.35, pitch: 1.2 }, { t: 54.0, type: 'chime', gain: 0.45, pitch: 1.5 },
];

export const music = {
  bpm: 84, root: 'F', maqam: 'rast', gain: 0.28,
  sections: [
    { from: 0, to: 5.8, mood: 'intro' },
    { from: 5.8, to: 20.6, mood: 'sad' },
    { from: 20.6, to: 24.8, mood: 'intro' },
    { from: 24.8, to: 28.1, mood: 'end' },
    { from: 28.1, to: 43.2, mood: 'groove' },
    { from: 43.2, to: 50.8, mood: 'sad' },
    { from: 50.8, to: 57.04, mood: 'triumph' },
    { from: 57.04, to: 59.6, mood: 'end' },
  ],
};
