// "The Army Under the Field" — the Terracotta Army, told as a book of marvels
// (`marvels` device) built on one cut-away of the earth: the farmers' well on
// top, the buried army below, returning until the well's water drop lights the
// army up. The 1974 farmers wear the work jackets and caps of their day; the
// emperor wears the same bead crown as in the Great Wall short; the clay
// soldiers' faces really differ, and the general wears his double-tailed cap.
import { clamp, lerp, ease, tween, rng, TAU } from '../../lib/core.mjs';
import { bookCover } from '../../styles/ottoman/scenes.mjs';
import { act } from '../../styles/ottoman/acting.mjs';

export const meta = {
  title: 'The Army Under the Field',
  slug: 'terracotta-ottoman',
  style: 'ottoman',
  look: 'night',    // night (after scroll, album, karagoz)
  room: 'tent',
  device: 'marvels',
  width: 1080, height: 1920, fps: 30,
  duration: 59.6,
  voice: 'voice.mp3', // sped up 3% (atempo 1.03) to keep the video under 59.8 s
  seed: 1974,
  captionChars: 30,
  brand: { handle: '@HOWITSTARTED-YT1', logo: '../../../brand/logo.png' },
  outro: { at: 57.8, text: 'Subscribe for more origin stories' },
};

const CLAY = '#b08a6a', CLAY_D = '#8a6a50', SOIL = ['#a87a4a', '#8a6038', '#74502e', '#5e4026'];
const FARMER = i => ({ robe: ['#3a4a6a', '#4a5a5a', '#5a4a3a'][i % 3], inner: '#d8d0c0', sash: '#2a2a2a', hat: i % 2 ? 'cap' : 'shorthair', hatColor: '#3a4a6a', hair: '#1a1a1a', skin: ['#d9a882', '#c99a6e', '#e2b48a'][i % 3] });
// a clay soldier; `face` variety comes from beards, moustaches and hair knots
const WARRIOR = (i, o = {}) => ({ robe: CLAY, robeP: 'stripes', robePc: CLAY_D, inner: CLAY_D, sash: CLAY_D, hat: 'topknot', hatColor: CLAY_D, hair: '#6a5040', skin: CLAY, shoes: CLAY_D, beard: i % 3 === 0, beardColor: '#6a5040', mustache: i % 2 === 1, mustacheColor: '#6a5040', ...o });

// ---------- the cut-away: a slice of the field with the soil beneath ----------
function cutaway(ctx, S, ground = 420, o = {}) {
  const { k, P, W } = S;
  k.goldSky(ctx, -80, -80, W + 160, ground + 100, S.t);
  if (o.sun) k.sun(ctx, 860, 160, 70, S.t, false);
  for (let i = 0; i < 4; i++) { ctx.fillStyle = SOIL[i]; ctx.fillRect(-80, ground + i * 200, W + 160, i === 3 ? 900 : 200); }
  const R = rng(3); ctx.fillStyle = 'rgba(40,20,10,0.25)'; for (let i = 0; i < 160; i++) ctx.fillRect(R() * W, ground + 20 + R() * 820, 6 + R() * 10, 3);
  ctx.beginPath(); ctx.moveTo(-80, ground); ctx.lineTo(W + 80, ground); k.stroke(ctx, P.ink, 3);
  if (o.crops) for (let x = 20; x < W; x += 38) { const g = o.crops; ctx.beginPath(); ctx.moveTo(x, ground); ctx.lineTo(x + Math.sin(S.t * 2 + x) * 3, ground - 40 * g); k.stroke(ctx, g > 0.6 ? '#c9a227' : P.green, 3); }
}
// the well shaft down from the surface, dug to depth d (px)
function shaft(ctx, S, x, ground, d, w = 120) {
  const { k, P } = S;
  ctx.fillStyle = '#3a2416'; ctx.fillRect(x - w / 2, ground, w, d);
  ctx.beginPath(); ctx.moveTo(x - w / 2, ground); ctx.lineTo(x - w / 2, ground + d); ctx.lineTo(x + w / 2, ground + d); ctx.lineTo(x + w / 2, ground); k.stroke(ctx, P.ink, 2.5);
}
// a row of buried soldiers, uncovered by k (the soil swept away left to right)
function buriedRow(ctx, S, y, k1 = 1, n = 9, s = 0.62, gx = 112, x0 = 70) {
  const { k } = S;
  for (let i = 0; i < n; i++) { const q = clamp(k1 * (n + 2) - i); if (q <= 0) continue; ctx.save(); ctx.globalAlpha = Math.min(1, q); k.figure(ctx, x0 + i * gx, y, { ...WARRIOR(i), s, face: 1, armF: [0.3, 0.6] }); ctx.restore(); }
}
function clayHorse(ctx, S, x, y, s) {
  const { k, P } = S;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  for (const lx of [-46, -30, 30, 46]) k.rect(ctx, lx - 6, -54, 12, 54, CLAY_D, P.ink, 1.5);
  k.ellipse(ctx, 0, -66, 64, 28, 0, CLAY, P.ink, 2);
  ctx.beginPath(); ctx.moveTo(48, -78); ctx.quadraticCurveTo(70, -118, 86, -112); ctx.lineTo(94, -96); ctx.quadraticCurveTo(76, -90, 62, -60); ctx.closePath(); k.fillStroke(ctx, CLAY, P.ink, 2);
  ctx.beginPath(); ctx.moveTo(-62, -74); ctx.quadraticCurveTo(-80, -60, -76, -30); k.stroke(ctx, CLAY_D, 6);
  ctx.restore();
}
function chariot(ctx, S, x, y, s) {
  const { k, P } = S;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  k.rect(ctx, -60, -110, 120, 70, '#7a5a3a', P.ink, 2); k.circle(ctx, 0, -40, 44, null, P.ink, 5);
  for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; ctx.beginPath(); ctx.moveTo(0, -40); ctx.lineTo(Math.cos(a) * 44, -40 + Math.sin(a) * 44); k.stroke(ctx, P.ink, 2); }
  ctx.beginPath(); ctx.moveTo(60, -70); ctx.lineTo(200, -90); k.stroke(ctx, '#5a3a1a', 6);
  ctx.restore();
}

export const scenes = [
  { // 0.0 "In 1974, farmers digging a well in China hit something strange."
    start: 0, title: 'Something Strange',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const di = S.at('digging'), we = S.at('well'), hi = S.at('hit'), st = S.at('strange.');
      S.cam(lerp(1.0, 1.35, tween(u, hi - 0.3, st + 0.6, ease.inOut)), W / 2, lerp(560, 760, tween(u, hi - 0.3, st + 0.6)));
      cutaway(ctx, S, 420);
      const d = lerp(20, 360, tween(u, di - 0.4, hi, ease.inOut));
      shaft(ctx, S, W / 2, 420, d);
      // a farmer at the bottom of the shaft, spade going down; another hauls the basket up
      const dig = Math.sin(S.t * 9);
      k.figure(ctx, W / 2, 420 + d, { ...FARMER(0), s: 0.38, face: 1, armF: [1.6 + dig * 0.4, 0.2], hold: c => { c.beginPath(); c.moveTo(0, -20); c.lineTo(0, 50); k.stroke(c, '#5a3a1a', 4); k.rect(c, -10, 46, 20, 18, '#9a9a9a', P.ink, 1); } });
      k.figure(ctx, W / 2 + 120, 420, { ...FARMER(1), s: 0.5, face: -1, armF: [2.4, 0.2] });
      k.rect(ctx, W / 2 - 8, 300, 16, 120, '#7a5a3a', P.ink, 2); k.rect(ctx, W / 2 - 50, 290, 100, 14, '#7a5a3a', P.ink, 2);
      // the spade rings on something hard: a clay face looks back up at them
      const face = tween(u, hi, st + 0.4, ease.outBack);
      if (face > 0) { ctx.save(); ctx.translate(W / 2 + 10, 420 + d + 54); ctx.scale(face, face); k.ellipse(ctx, 0, 0, 34, 42, 0, CLAY, P.ink, 2.5); k.circle(ctx, -10, -6, 3, P.ink, null); k.circle(ctx, 12, -6, 3, P.ink, null); ctx.beginPath(); ctx.moveTo(-8, 16); ctx.lineTo(10, 16); k.stroke(ctx, P.ink, 2); ctx.restore(); }
      if (face > 0.5) { ctx.save(); ctx.globalAlpha = tween(u, st - 0.1, st + 0.3); ctx.fillStyle = P.goldLight; ctx.font = '900 120px Deco'; ctx.textAlign = 'center'; ctx.fillText('?', W / 2 + 240, 660); ctx.restore(); }
    },
  },
  { // 6.5 "March, 1974."
    start: 6.2, title: 'March 1974', trans: 'page',
    draw(ctx, u, S) {
      const { k, P, W } = S, ye = S.at('1974.');
      S.cam(lerp(1.15, 1.0, tween(u, 0, 2.2, ease.inOut)), W / 2, 600);
      ctx.fillStyle = '#e8d6a8'; ctx.fillRect(-80, -80, W + 160, 1260);
      k.cracks(ctx, 1, 11, 3);
      k.calendarPage(ctx, W / 2, 540, 420, 'MARCH', '1974', lerp(-0.2, -0.05, tween(u, 0, 0.6, ease.outBack)), tween(u, ye, ye + 0.6));
    },
  },
  { // 8.7 "A village near Xi'an. A drought."
    start: 8.5, title: 'A Village, a Drought', trans: 'ink',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const xi = S.at("Xi'an."), dr = S.at('drought.');
      const dry = tween(u, dr - 0.3, dr + 1.0);
      S.cam(lerp(1.0, 1.15, tween(u, 0, 3.2, ease.inOut)), W / 2, lerp(560, 680, tween(u, 0, 3.2)));
      k.goldSky(ctx, -80, -80, W + 160, 600, S.t);
      k.sun(ctx, 820, lerp(260, 180, dry), lerp(60, 110, dry), S.t, false);
      k.hills(ctx, W, 360, 6, ['#c4a56c', '#b0905a', '#9a8a5a'], S.t);
      k.ground(ctx, -80, 450, W + 160, 800, lerp(0, 1, dry) > 0.5 ? '#d8b878' : '#b8b070', 6, 0.15);
      for (let i = 0; i < 5; i++) { const x = 90 + i * 200; k.rect(ctx, x, 560, 150, 110, '#d8c0a0', P.ink, 2); k.poly(ctx, [[x - 12, 560], [x + 75, 510], [x + 162, 560]], '#6a6a6a', P.ink, 2); k.rect(ctx, x + 60, 610, 30, 60, '#5a3a1a', P.ink, 1.5); }
      // the field cracks open as the rain fails
      if (dry > 0) { ctx.save(); ctx.beginPath(); ctx.rect(-80, 720, W + 160, 560); ctx.clip(); ctx.translate(0, 720); ctx.scale(1, 0.5); k.cracks(ctx, dry, 7, 3); ctx.restore(); }
      k.label(ctx, 'LINTONG · NEAR XI’AN · SHAANXI', W / 2, 300, 20, tween(u, xi, xi + 0.4));
    },
  },
  { // 12.0 "Yang Zhifa and his brothers are digging for water."
    start: 11.7, title: 'Digging for Water', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const ya = S.at('Yang'), br = S.at('brothers'), wa = S.at('water.');
      S.cam(lerp(1.2, 1.0, tween(u, 0, br + 0.4, ease.inOut)), lerp(380, W / 2, tween(u, 0, br + 0.4)), 560);
      cutaway(ctx, S, 520, { sun: true });
      shaft(ctx, S, 760, 520, lerp(60, 260, tween(u, 0, wa + 0.6)));
      // the brothers in a line, each with a spade, a basket of earth passing between them
      for (let i = 0; i < 4; i++) { const sw = Math.sin(S.t * 6 + i * 1.3); k.figure(ctx, 200 + i * 130, 520, { ...FARMER(i), s: i ? 0.62 : 0.72, face: 1, mood: 'calm', armF: [1.4 + sw * 0.4, 0.2], hold: c => { c.beginPath(); c.moveTo(0, -20); c.lineTo(0, 60); k.stroke(c, '#5a3a1a', 4); k.rect(c, -10, 56, 20, 20, '#9a9a9a', P.ink, 1); } }); }
      k.label(ctx, 'YANG ZHIFA', 200, 280, 24, tween(u, ya, ya + 0.4));
      // a dry bucket comes up empty
      const b = (S.t * 0.6) % 1; k.rect(ctx, 744, lerp(740, 470, b), 32, 30, '#7a5a3a', P.ink, 1.5);
    },
  },
  { // 15.8 "Instead, they find pieces of a life-size clay soldier."
    start: 15.3, title: 'Pieces of a Soldier', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const fi = S.at('find'), pi = S.at('pieces'), li = S.at('life-size'), so = S.at('soldier.');
      S.cam(lerp(1.0, 1.15, tween(u, li - 0.3, so + 0.8, ease.inOut)), W / 2, 640);
      ctx.fillStyle = '#e8d6a8'; ctx.fillRect(-80, -80, W + 160, 1260);
      k.ground(ctx, -80, 900, W + 160, 400, '#c4a070', 9, 0.1);
      // the shards fly together into one standing figure, next to a farmer for scale
      const build = tween(u, pi - 0.2, so + 0.2, ease.inOut);
      const parts = [[-200, 100, 1.2], [180, 60, -0.8], [-120, -300, 2.0], [220, -200, -1.5]];
      ctx.save(); ctx.globalAlpha = tween(u, fi - 0.3, fi);
      if (build < 1) parts.forEach(([dx, dy, r], i) => { const q = 1 - build; ctx.save(); ctx.translate(600 + dx * q, 760 + i * 60 + dy * q); ctx.rotate(r * q); k.rect(ctx, -40, -40, 80, 70, CLAY, P.ink, 2); ctx.restore(); });
      if (build > 0.6) { ctx.save(); ctx.globalAlpha = (build - 0.6) / 0.4; k.figure(ctx, 600, 1000, { ...WARRIOR(1), s: 1.35, face: -1, armF: [0.3, 0.6] }); for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(560 + i * 20, 700 + i * 70); ctx.lineTo(620 + i * 10, 720 + i * 70); k.stroke(ctx, CLAY_D, 2); } ctx.restore(); }
      ctx.restore();
      k.figure(ctx, 300, 1000, { ...FARMER(0), s: 1.25, face: 1, mood: build > 0.8 ? 'wow' : 'calm', ...act(build > 0.8 ? 'surprise' : 'rest', u, tween(u, so - 0.2, so + 0.2)) });
      // a height mark: the same size as the man who found it
      const hm = tween(u, li - 0.2, li + 0.4);
      if (hm > 0) { ctx.save(); ctx.globalAlpha = hm; ctx.setLineDash([10, 8]); ctx.beginPath(); ctx.moveTo(200, 630); ctx.lineTo(760, 630); k.stroke(ctx, P.vermDark, 3); ctx.restore(); k.label(ctx, 'ABOUT 1.8 M · 6 FT', 480, 580, 18, hm); }
    },
  },
  { // 20.5 "Archaeologists arrive, and they realize what it is."
    start: 20.0, title: 'The Archaeologists', trans: 'curtain',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const ar = S.at('arrive,'), re = S.at('realize'), is = S.at('is.');
      S.cam(lerp(1.0, 1.25, tween(u, re - 0.4, is + 0.5, ease.inOut)), lerp(W / 2, 360, tween(u, re - 0.4, is + 0.5)), lerp(600, 560, tween(u, re - 0.4, is + 0.5)));
      cutaway(ctx, S, 600);
      // string grid over the ground, brushes at work
      for (let i = 0; i <= 8; i++) { ctx.beginPath(); ctx.moveTo(60 + i * 120, 600); ctx.lineTo(60 + i * 120, 900); k.stroke(ctx, 'rgba(255,248,220,0.6)', 2); }
      ctx.beginPath(); ctx.moveTo(60, 750); ctx.lineTo(1020, 750); k.stroke(ctx, 'rgba(255,248,220,0.6)', 2);
      const sweep = tween(u, 0.2, is + 0.8);
      ctx.save(); ctx.beginPath(); ctx.rect(-80, 600, 160 + sweep * W, 600); ctx.clip(); buriedRow(ctx, S, 1000, 1, 9, 0.5, 112, 80); ctx.restore();
      for (let i = 0; i < 3; i++) k.figure(ctx, lerp(-200, 260 + i * 200, tween(u, ar - 0.6 + i * 0.2, ar + 0.2 + i * 0.2, ease.outCubic)), 600, { robe: ['#5a6a4a', '#7a6a4a', '#4a4a5a'][i], inner: P.white, hat: i === 1 ? 'cap' : 'shorthair', hatColor: '#d8c9a8', hair: '#1a1a1a', skin: '#d9a882', glasses: i === 0, s: 0.62, face: 1, mood: u > re ? 'wow' : 'calm', ...act(u > re ? (i ? 'surprise' : 'think') : 'walk', u, 1) });
    },
  },
  { // 24.6 "Buried for over 2,000 years is an army."
    start: 24.2, title: 'Buried 2,000 Years', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const bu = S.at('Buried'), ye = S.at('years'), ar = S.at('army.');
      S.cam(lerp(1.4, 0.95, tween(u, ye - 0.4, ar + 0.8, ease.inOut)), W / 2, lerp(520, 640, tween(u, ye - 0.4, ar + 0.8)));
      cutaway(ctx, S, 300, { crops: 0.8 });
      // the soil peels back, row after row
      const rev = tween(u, bu, ar + 0.6, ease.linear);
      for (let r = 0; r < 3; r++) { ctx.fillStyle = '#4a3020'; ctx.fillRect(-80, 560 + r * 220, W + 160, 30); buriedRow(ctx, S, 580 + r * 220, clamp(rev * 3 - r), 10, 0.5, 104, 50); }
      ctx.fillStyle = P.goldLight; ctx.font = '900 80px Deco'; ctx.textAlign = 'center'; ctx.fillText(`${Math.round(lerp(0, 2200, tween(u, bu, ye + 0.4, ease.outCubic))).toLocaleString('en-US')} YEARS`, W / 2, 200);
    },
  },
  { // 29.4 "An estimated 8,000 clay soldiers plus horses and war chariots"
    start: 29.0, title: '8,000 Soldiers', trans: 'tiles',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const ei = S.at('8,000'), ho = S.at('horses'), ch = S.at('chariots');
      S.cam(lerp(0.95, 1.2, tween(u, ho - 0.3, ch + 0.6, ease.inOut)), lerp(W / 2, 700, tween(u, ho - 0.3, ch + 0.6)), lerp(600, 820, tween(u, ho - 0.3, ch + 0.6)));
      // pit one from above: long corridors between earth walls, packed with heads
      ctx.fillStyle = '#8a6038'; ctx.fillRect(-80, -80, W + 160, 1260);
      const fill = tween(u, ei - 0.6, ei + 1.2);
      for (let c = 0; c < 9; c++) { const x = 60 + c * 110; k.rect(ctx, x, 220, 80, 700, '#c4a070', P.ink, 2); for (let r = 0; r < 16; r++) for (let j = 0; j < 2; j++) { if ((c * 32 + r * 2 + j) / 288 > fill) continue; k.circle(ctx, x + 22 + j * 36, 250 + r * 41, 13, CLAY, P.ink, 1); k.circle(ctx, x + 22 + j * 36, 244 + r * 41, 6, '#6a5040', null); } }
      const n = Math.round(lerp(0, 8000, fill)); ctx.fillStyle = P.goldLight; ctx.font = '900 90px Deco'; ctx.textAlign = 'center'; ctx.fillText(n.toLocaleString('en-US'), W / 2, 180);
      // the horses and a chariot come forward in the front corridor
      const hc = tween(u, ho - 0.3, ch + 0.4, ease.outBack);
      if (hc > 0) { ctx.save(); ctx.globalAlpha = Math.min(1, hc); for (let i = 0; i < 4; i++) clayHorse(ctx, S, 500 + i * 70, 1040 - (i % 2) * 20, 0.8); if (u > ch - 0.4) chariot(ctx, S, 320, 1060, 1.0); ctx.restore(); }
    },
  },
  { // 34.6 "made for China's first emperor, Qin Shi Huang, to guard him after death."
    start: 34.2, title: 'For the First Emperor', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const fi = S.at('first'), qi = S.at('Qin'), gu = S.at('guard'), de = S.at('death.');
      S.cam(lerp(1.3, 0.95, tween(u, 0, gu + 0.4, ease.inOut)), lerp(320, W / 2, tween(u, 0, gu + 0.4)), lerp(520, 620, tween(u, 0, gu + 0.4)));
      k.nightSky(ctx, -80, -80, W + 160, 700, S.t);
      // his tomb mound, and the army facing east to guard it
      ctx.beginPath(); ctx.moveTo(-80, 700); ctx.quadraticCurveTo(240, 320, 560, 700); k.fillStroke(ctx, '#6a8a58', P.ink, 3);
      k.ground(ctx, -80, 700, W + 160, 600, '#5a7a48', 4, 0.2);
      const glow = tween(u, qi - 0.3, qi + 0.6);
      ctx.save(); ctx.globalAlpha = glow; k.figure(ctx, 240, 560, { robe: '#1a1a1a', robeP: 'cintamani', robePc: '#c9a227', inner: '#9a2a1e', sash: '#c9a227', hat: 'mianguan', hair: '#1a1a1a', beard: true, beardColor: '#1a1a1a', skin: '#e8c49a', s: 0.9, face: 1, mood: 'calm' }); ctx.restore();
      for (let r = 0; r < 3; r++) buriedRow(ctx, S, 860 + r * 120, tween(u, gu - 0.6, gu + 0.6), 6, 0.42, 90, 560 + r * 20);
      k.label(ctx, 'QIN SHI HUANG · DIED 210 BC', 260, 280, 20, tween(u, qi, qi + 0.4));
      if (u > de - 0.2) { ctx.save(); ctx.globalAlpha = tween(u, de - 0.2, de + 0.3); ctx.beginPath(); ctx.moveTo(1000, 800); ctx.lineTo(1060, 800); k.stroke(ctx, P.goldLight, 5); k.poly(ctx, [[1060, 784], [1090, 800], [1060, 816]], P.goldLight, null); ctx.fillStyle = P.goldLight; ctx.font = '700 26px Fell'; ctx.textAlign = 'center'; ctx.fillText('EAST', 1040, 770); ctx.restore(); }
    },
  },
  { // 40.1 "Each soldier has its own face."
    start: 39.9, title: 'Each Has a Face', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const ea = S.at('Each'), fa = S.at('face.');
      S.cam(lerp(1.0, 1.1, tween(u, 0, 2.4)), lerp(W / 2 + 120, W / 2 - 60, tween(u, 0, 2.4, ease.inOut)), 640);
      ctx.fillStyle = '#4a3020'; ctx.fillRect(-80, -80, W + 160, 1260);
      // busts, close up: every beard, knot and moustache different
      const looks = [{ beard: true, mustache: false }, { beard: false, mustache: true }, { beard: 'chin', mustache: true }, { beard: false, mustache: false, hat: 'shorthair' }, { beard: true, mustache: true }, { beard: false, mustache: true, hat: 'shorthair' }];
      for (let i = 0; i < 6; i++) { const a = tween(u, ea - 0.4 + i * 0.18, ea - 0.1 + i * 0.18, ease.outBack); if (a <= 0) continue; const x = 150 + (i % 3) * 390 - Math.floor(i / 3) * 40, y = 640 + Math.floor(i / 3) * 520; ctx.save(); ctx.beginPath(); ctx.rect(x - 180, y - 520, 360, 470); ctx.clip(); ctx.translate(x, y); ctx.scale(a, a); k.figure(ctx, 0, 540, { ...WARRIOR(i, looks[i]), s: 3.0, face: i % 2 ? -1 : 1, mood: ['calm', 'happy', 'calm', 'calm', 'happy', 'calm'][i] }); ctx.restore(); }
      k.label(ctx, 'SHAPED FROM MOLDS, THEN FINISHED BY HAND', W / 2, 1100, 18, tween(u, fa, fa + 0.4));
    },
  },
  { // 42.9 "Generals stand tallest."
    start: 42.5, title: 'Generals Stand Tallest', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const ge = S.at('Generals'), ta = S.at('tallest.');
      S.cam(lerp(1.0, 1.2, tween(u, ta - 0.3, ta + 0.6, ease.inOut)), lerp(W / 2, 760, tween(u, ta - 0.3, ta + 0.6)), lerp(640, 520, tween(u, ta - 0.3, ta + 0.6)));
      ctx.fillStyle = '#e8d6a8'; ctx.fillRect(-300, -300, W + 600, 1700);
      for (let y = 300; y <= 900; y += 100) { ctx.beginPath(); ctx.moveTo(60, y); ctx.lineTo(1020, y); k.stroke(ctx, 'rgba(60,40,20,0.2)', 2); }
      // a line-up by rank: soldier, archer, officer… and the general, a head above
      const rise = tween(u, ge - 0.2, ta + 0.4, ease.outBack);
      [[180, 1.0, {}], [400, 1.03, { kneel: true }], [620, 1.08, { hat: 'heguan' }], [860, lerp(1.08, 1.22, rise), { hat: 'heguan', hatColor: '#5a3a2a', robePc: '#c9a227', beard: true, mustache: true }]].forEach(([x, s, o], i) => k.figure(ctx, x, 1000, { ...WARRIOR(i, o), s: s * 1.05, face: -1, armF: i === 3 ? [0.6, 1.4] : [0.3, 0.6] }));
      ctx.save(); ctx.globalAlpha = rise; ctx.setLineDash([12, 8]); ctx.beginPath(); ctx.moveTo(760, 1000 - 300 * lerp(1.08, 1.22, rise) * 1.05); ctx.lineTo(980, 1000 - 300 * lerp(1.08, 1.22, rise) * 1.05); k.stroke(ctx, P.vermDark, 3); ctx.restore();
    },
  },
  { // 45.3 "All this time, the army was guarding him right under the farmer's fields."
    start: 44.8, title: 'Under the Fields', trans: 'page',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const al = S.at('All'), un = S.at('under'), fi = S.at('fields.');
      S.cam(lerp(1.3, 1.0, tween(u, 0, un, ease.inOut)), W / 2, lerp(380, 600, tween(u, 0, un, ease.inOut)));
      // above: the seasons turn and the wheat grows and is cut, again and again
      const season = (S.t * 0.8) % 1;
      cutaway(ctx, S, 460, { crops: season < 0.75 ? season / 0.75 : 0 });
      for (let i = 0; i < 3; i++) k.figure(ctx, 200 + i * 300 + Math.sin(S.t + i) * 30, 460, { ...FARMER(i), s: 0.48, face: i % 2 ? -1 : 1, walk: S.t * 4 + i, armF: [1.0, 0.4] });
      // below: the army stands, unmoving, in the dark
      ctx.save(); ctx.globalAlpha = tween(u, al, un, ease.inOut);
      for (let r = 0; r < 2; r++) { ctx.fillStyle = '#3a2416'; ctx.fillRect(-80, 720 + r * 240, W + 160, 230); buriedRow(ctx, S, 930 + r * 240, 1, 10, 0.55, 104, 50); }
      ctx.restore();
      const yr = Math.round(lerp(-210, 1974, tween(u, al, fi + 0.4, ease.linear)));
      ctx.fillStyle = P.vermDark; ctx.font = '900 56px Deco'; ctx.textAlign = 'center'; ctx.fillText(yr < 0 ? `${-yr} BC` : `AD ${Math.max(1, yr)}`, W / 2, 140);
    },
  },
  { // 51.0 "A search for water that uncovered an emperor's army."
    start: 50.6, title: 'A Search for Water', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const wa = S.at('water'), un = S.at('uncovered'), ar = S.at('army.');
      S.cam(lerp(1.4, 0.95, tween(u, wa, ar + 0.8, ease.inOut)), W / 2, lerp(520, 640, tween(u, wa, ar + 0.8)));
      cutaway(ctx, S, 360);
      shaft(ctx, S, W / 2, 360, 420, 90);
      // one drop falls down the well… and where it lands, the army lights up in gold
      const fall = tween(u, wa - 0.2, un, ease.inCubic);
      if (fall < 1) k.ellipse(ctx, W / 2, lerp(380, 770, fall), 12, 18, 0, '#6fb0e0', P.ink, 1.5);
      const lit = tween(u, un - 0.1, ar + 0.6);
      if (lit > 0) { ctx.save(); const g = ctx.createRadialGradient(W / 2, 900, 20, W / 2, 900, 700 * lit); g.addColorStop(0, 'rgba(255,214,120,0.75)'); g.addColorStop(1, 'rgba(255,214,120,0)'); ctx.fillStyle = g; ctx.fillRect(-80, 600, W + 160, 700); ctx.restore(); }
      for (let r = 0; r < 2; r++) buriedRow(ctx, S, 960 + r * 160, clamp(lit * 1.5 - r * 0.3), 10, 0.5, 104, 50);
      for (let i = 0; i < 2; i++) k.figure(ctx, W / 2 - 160 + i * 320, 360, { ...FARMER(i), s: 0.5, face: i ? -1 : 1, mood: lit > 0.5 ? 'wow' : 'calm', ...act(lit > 0.5 ? 'surprise' : 'rest', u, lit) });
    },
  },
  { // 55.6 "Every legend has a beginning."
    start: 55.4, title: 'Every Legend Has a Beginning', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S, beg = S.at('beginning.');
      ctx.save(); S.cam(lerp(1.0, 1.4, tween(u, 0, beg)), W / 2, 900);
      cutaway(ctx, S, 400); for (let r = 0; r < 2; r++) buriedRow(ctx, S, 860 + r * 200, 1, 10, 0.55, 104, 50);
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
  ...scenes.slice(1).map(s => ({ t: s.start - 0.05, type: s.trans === 'cut' ? 'pop' : 'paper', gain: 0.28 })),
  ...Array.from({ length: 5 }, (_, i) => ({ t: +(1.9 + i * 0.35).toFixed(2), type: 'thud', gain: 0.25, pitch: 0.9 })), { t: 3.6, type: 'clank', gain: 0.55, pitch: 0.8 }, { t: 4.6, type: 'chime', gain: 0.4, pitch: 0.7 },
  { t: 6.6, type: 'paper', gain: 0.3 }, { t: 7.1, type: 'stamp', gain: 0.45 },
  { t: 10.7, type: 'wind', gain: 0.4 }, { t: 11.0, type: 'crack', gain: 0.4 },
  ...Array.from({ length: 6 }, (_, i) => ({ t: +(12.2 + i * 0.4).toFixed(2), type: 'thud', gain: 0.2 })),
  { t: 16.3, type: 'clank', gain: 0.4 }, { t: 17.2, type: 'clank', gain: 0.35, pitch: 1.2 }, { t: 18.4, type: 'pop', gain: 0.4 },
  { t: 20.6, type: 'whoosh', gain: 0.3 }, { t: 22.2, type: 'riser', gain: 0.35 }, { t: 23.0, type: 'gong', gain: 0.5 },
  { t: 24.5, type: 'slide', gain: 0.35 }, { t: 26.1, type: 'slide', gain: 0.35 }, { t: 27.8, type: 'gong', gain: 0.55, pitch: 0.8 },
  { t: 29.8, type: 'riser', gain: 0.35 }, { t: 32.2, type: 'thud', gain: 0.3 }, { t: 32.5, type: 'thud', gain: 0.3 }, { t: 33.3, type: 'clank', gain: 0.35 },
  { t: 36.6, type: 'chime', gain: 0.45, pitch: 1.2 }, { t: 38.7, type: 'whoosh', gain: 0.3 },
  ...Array.from({ length: 6 }, (_, i) => ({ t: +(40.0 + i * 0.18).toFixed(2), type: 'pop', gain: 0.25, pitch: 1 + i * 0.08 })),
  { t: 43.5, type: 'stamp', gain: 0.4 },
  { t: 45.0, type: 'wind', gain: 0.3 }, { t: 48.2, type: 'thud', gain: 0.3, pitch: 0.7 },
  { t: 51.5, type: 'drip', gain: 0.5 }, { t: 52.6, type: 'splash', gain: 0.45 }, { t: 52.9, type: 'riser', gain: 0.35 }, { t: 54.1, type: 'gong', gain: 0.6 },
];

export const music = {
  bpm: 92, root: 'B', maqam: 'nihavend', gain: 0.3,
  sections: [
    { from: 0, to: 6.2, mood: 'intro' },
    { from: 6.2, to: 20.0, mood: 'sad' },
    { from: 20.0, to: 29.0, mood: 'drive' },
    { from: 29.0, to: 44.8, mood: 'groove' },
    { from: 44.8, to: 50.6, mood: 'sad' },
    { from: 50.6, to: 57.8, mood: 'triumph' },
    { from: 57.8, to: 59.6, mood: 'end' },
  ],
};
