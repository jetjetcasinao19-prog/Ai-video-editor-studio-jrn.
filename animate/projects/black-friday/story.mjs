// "Where Black Friday Got Its Name" — told by a meddah, a coffeehouse
// storyteller with a handkerchief and a stick, to listeners who react; the
// page is an Ottoman account book (the ledger look), red ink and black.
import { clamp, lerp, ease, tween, rng, TAU, shake, pop } from '../../lib/core.mjs';
import { interior, lamp, bookCover, bigSign, medallion, panorama } from '../../styles/ottoman/scenes.mjs';

export const meta = {
  title: 'Where Black Friday Got Its Name',
  slug: 'black-friday-ottoman',
  style: 'ottoman',
  look: 'ledger',   // account book in red and black ink (posted between scroll/album/tile and karagoz/night)
  room: 'arches',   // the coffeehouse
  device: 'meddah',
  ambient: 'snow',  // late November in Philadelphia
  width: 1080, height: 1920, fps: 30,
  duration: 54.0,
  voice: 'voice.mp3',
  seed: 151,
  captionChars: 30,
  brand: { handle: '@HOWITSTARTED-YT1', logo: '../../../brand/logo.png' },
  outro: { at: 52.2, text: 'Subscribe for more origin stories' },
};

const INK = '#1a1410', RED = '#b3261a';
const SKINS = ['#f1d1a8', '#8a5a3c', '#c68a5e', '#e2b48a', '#a86c45', '#f1d1a8'];
const MEDDAH = { robe: '#c4371f', robeP: 'stripes', robePc: '#d65a3a', inner: '#f7eed6', sash: '#ecd57a', hat: 'turban', hatColor: '#f8f2e2', beard: 'short', skin: '#c68a5e' };
const COP = { badge: true, robe: '#1f2f5a', robeP: 'dots', robePc: '#2c3f72', inner: '#cfd8e8', sash: '#ecd57a', hat: 'cap', hatColor: '#1f2f5a', mustache: true };

// the coffeehouse storyteller on his high seat, stick in hand, cloth on his shoulder
function meddah(ctx, S, x, u, o = {}) {
  const { k, P } = S;
  k.rect(ctx, x - 70, 760, 140, 250, P.brown, P.ink, 2.5); k.rect(ctx, x - 90, 740, 180, 30, P.brownLight, P.ink, 2);
  k.figure(ctx, x, 760, { ...MEDDAH, s: 1.15, face: o.face || 1, kneel: true, mood: o.mood || 'happy', armF: [o.arm ?? (1.6 + Math.sin(u * 3) * 0.3), 0.2], hold: c => { c.rotate(-0.4); k.rect(c, -4, -150, 8, 170, P.brownLight, P.ink, 1.5); } });
  k.poly(ctx, [[x - 30 * (o.face || 1), 540], [x - 58 * (o.face || 1), 600], [x - 12 * (o.face || 1), 610]], P.white, P.ink, 1.5);
}
function listeners(ctx, S, u, react = 0, laugh = false) {
  const { k, P } = S;
  [560, 690, 820].forEach((x, i) => {
    k.figure(ctx, x, 1010, { robe: [P.lapis, P.green, P.ochre][i], robeP: 'dots', hat: ['fez', 'turban', 'fez'][i], hatColor: [P.verm, P.white, P.vermDark][i], skin: SKINS[i + 1], s: 0.85, face: -1, kneel: true, mood: react > 0.5 ? (laugh ? 'happy' : 'wow') : 'calm', armF: [lerp(0.8, 2.2, react) + Math.sin(u * 5 + i) * 0.1 * react, 0.2], hold: c => { k.rect(c, -10, -14, 20, 18, P.white, P.ink, 1.2); } });
  });
}
function thought(ctx, S, x, y, w, h, a, draw) {
  if (a <= 0) return;
  const { k, P } = S;
  ctx.save(); ctx.globalAlpha *= clamp(a);
  k.cloud(ctx, x, y, w / 260, 9);
  k.rect(ctx, x - w / 2, y - h / 2, w, h, '#f6eed8', INK, 3);
  ctx.save(); ctx.beginPath(); ctx.rect(x - w / 2, y - h / 2, w, h); ctx.clip(); ctx.translate(x, y); draw(ctx); ctx.restore();
  for (let i = 0; i < 3; i++) k.circle(ctx, x - w / 2 + 30 - i * 30, y + h / 2 + 30 + i * 34, 14 - i * 3, '#f6eed8', INK, 2);
  ctx.restore();
}
function ledgerPage(ctx, S, w, h, black) { // a page of accounts; black = 0 red ink … 1 black ink
  ctx.fillStyle = '#f6eed8'; ctx.fillRect(-w / 2, -h / 2, w, h);
  const cols = w > 500 ? 2 : 1, cw = w / cols, fs = Math.max(20, Math.round(h / (cols > 1 ? 13 : 9))), lh = fs * 1.35;
  ctx.strokeStyle = 'rgba(70,90,120,0.3)'; ctx.lineWidth = 1; for (let y = -h / 2 + lh; y < h / 2; y += lh) { ctx.beginPath(); ctx.moveTo(-w / 2, y); ctx.lineTo(w / 2, y); ctx.stroke(); }
  const R = rng(4), rows = Math.floor((h - 20) / lh);
  for (let c = 0; c < cols; c++) {
    const x0 = -w / 2 + c * cw;
    ctx.strokeStyle = RED; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x0 + cw * 0.62, -h / 2); ctx.lineTo(x0 + cw * 0.62, h / 2); ctx.stroke();
    for (let r = 0; r < rows; r++) {
      const v = Math.floor(100 + R() * 900), isBlack = (r + c * rows) / (rows * cols) < black, y = -h / 2 + (r + 0.6) * lh;
      ctx.strokeStyle = 'rgba(26,20,16,0.45)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0 + 16, y); ctx.lineTo(x0 + 16 + cw * (0.25 + R() * 0.25), y); ctx.stroke();
      ctx.font = `700 ${fs}px Garamond`; ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillStyle = isBlack ? INK : RED;
      ctx.fillText((isBlack ? '+' : '−') + v, x0 + cw - 14, y);
    }
  }
}
function cityHall(ctx, k, P, x, base, s) { // Philadelphia's clock tower (civic, not a church)
  ctx.save(); ctx.translate(x, base); ctx.scale(s, s);
  k.rect(ctx, -150, -200, 300, 200, '#e8dcc0', P.ink, 2.5); for (let i = 0; i < 6; i++) k.arch(ctx, -125 + i * 50, -30, 26, 60, '#cfe0ea');
  k.rect(ctx, -50, -520, 100, 320, '#e8dcc0', P.ink, 2.5); k.circle(ctx, 0, -440, 32, P.paperLight, P.ink, 2.5); ctx.beginPath(); ctx.moveTo(0, -440); ctx.lineTo(0, -462); ctx.moveTo(0, -440); ctx.lineTo(14, -440); k.stroke(ctx, P.ink, 3);
  k.rect(ctx, -36, -600, 72, 80, '#d8c9a8', P.ink, 2); ctx.beginPath(); ctx.moveTo(-36, -600); ctx.quadraticCurveTo(0, -680, 36, -600); ctx.closePath(); k.fillStroke(ctx, '#c9b890', P.ink, 2);
  k.rect(ctx, -6, -712, 12, 36, '#7a6a5a', P.ink, 1.5); k.circle(ctx, 0, -718, 7, '#7a6a5a', P.ink, 1.5);
  ctx.restore();
}
function storefront(ctx, k, P, x, base, w, color, sign, lit = 1) {
  k.rect(ctx, x - w / 2, base - 300, w, 300, color, P.ink, 2.5);
  k.canopy(ctx, x, base - 190, w + 20, 50, P.verm, 0);
  k.rect(ctx, x - w / 2 + 20, base - 130, w - 40, 110, lit ? '#ffe8a8' : '#cfe0ea', P.ink, 2);
  k.rect(ctx, x - w / 2 + 10, base - 290, w - 20, 50, INK, P.ink, 1.5);
  ctx.fillStyle = '#f6eed8'; ctx.font = '900 22px Deco'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(sign, x, base - 264);
}
function shopper(ctx, k, P, x, y, i, s, walk) {
  k.figure(ctx, x, y, { robe: [P.verm, P.lapis, P.green, P.ochre, P.lav, P.turq][i % 6], robeP: 'dots', hat: ['shorthair', 'longhair', 'cap', 'shorthair', 'longhair', 'cap'][i % 6], hair: ['#2a1c12', '#6a4a2a', '#2a1c12'][i % 3], hatColor: P.lapis, skin: SKINS[i % 6], s, face: 1, walk, mood: 'happy', armF: [0.4, 0.2], hold: c => { k.rect(c, -16, 0, 32, 40, [P.verm, P.white, P.ochre][i % 3], P.ink, 1.5); } });
}

export const scenes = [
  { // 0.0 "You've heard Black Friday mean stores finally make a profit."
    start: 0, title: 'The Story You Heard',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const bf = S.at('Black'), pr = S.at('profit.');
      S.cam(lerp(1.0, 1.08, tween(u, 0, 4)), 400, 560);
      interior(ctx, S, { carpetColor: P.vermDark });
      lamp(ctx, S, 470, 150, 1);
      meddah(ctx, S, 230, u);
      listeners(ctx, S, u, tween(u, pr, pr + 0.3) * 0.6);
      thought(ctx, S, 650, 330, 380, 240, tween(u, bf - 0.2, bf + 0.3), c => { ledgerPage(c, S, 380, 240, tween(u, 1.5, pr)); c.fillStyle = INK; c.font = '900 34px Deco'; c.textAlign = 'center'; c.fillText('PROFIT?', -40, 0); });
    },
  },
  { // 4.3 "That's not where the name came from."
    start: 4.1, title: 'Not the Real Story', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const no = S.at('not'), fr = S.at('from.');
      interior(ctx, S, { carpetColor: P.vermDark });
      lamp(ctx, S, 470, 150, 1);
      meddah(ctx, S, 230, u, { arm: lerp(1.6, 2.6, tween(u, no - 0.2, no + 0.1)), mood: 'calm' });
      listeners(ctx, S, u, tween(u, no, no + 0.3));
      thought(ctx, S, 650, 330, 380, 240, 1, c => { ledgerPage(c, S, 380, 240, 1); c.fillStyle = INK; c.font = '900 34px Deco'; c.textAlign = 'center'; c.fillText('PROFIT?', -40, 0); });
      k.stamp(ctx, 'NOT TRUE', 650, 330, 56, tween(u, no, no + 0.25, ease.linear), -0.15, RED);
    },
  },
  { // 6.7 "Back in the early 1960s in Philadelphia, the day after Thanksgiving is total chaos."
    start: 6.5, title: 'Philadelphia · 1960s', trans: 'ink',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const yr = S.at('1960s'), ph = S.at('Philadelphia,'), th = S.at('Thanksgiving'), ch = S.at('chaos.');
      const sh = shake(u, ch, 10, 0.8); ctx.translate(sh[0], sh[1]);
      // Penn's grid seen the way Matrakçı painted cities: from above, buildings standing up,
      // City Hall in the centre square, four green squares, a river on each side
      S.cam(lerp(1.45, 1.0, tween(u, 0.2, 2.6, ease.inOut)), W / 2, lerp(470, 540, tween(u, 0.2, 2.6)));
      panorama(ctx, S, { grid: { cols: 5, rows: 6 }, squares: [[1, 1], [3, 1], [1, 4], [3, 4]], landmarkCell: [2, 2], rivers: ['left', 'right'], snow: true, seed: 19,
        // important buildings are painted much larger than the houses around them, as Matrakçı did
        landmark: (c, x, y, sz) => { k.rect(c, x - sz * 0.62, y - sz * 0.95, sz * 1.24, sz * 0.95, '#efe3c6', P.ink, 1.5); cityHall(c, k, P, x, y, sz / 230); } });
      // on "chaos" the streets fill: carts, cars and people swarm every block
      const sw = tween(u, ch - 0.6, ch + 0.4);
      if (sw > 0) { const R = rng(11); for (let i = 0; i < 160 * sw; i++) { const horiz = R() > 0.5, lane = Math.floor(R() * (horiz ? 7 : 6)), q = (R() + u * (0.15 + R() * 0.2)) % 1; const x = horiz ? 120 + q * 700 : 120 + lane * 140, y = horiz ? 30 + lane * 167 : 30 + q * 1000; k.circle(ctx, x, y, 5 + R() * 3, [RED, P.lapis, P.green, P.ochre, INK][i % 5], P.ink, 1); } }
      k.seal(ctx, 140, 150, 60, ' THE EARLY 1960s ·', '1960s', tween(u, yr - 0.1, yr + 0.3, ease.linear));
      const cp = pop(u, th - 0.2, 0.35);
      if (cp > 0) { ctx.save(); ctx.translate(800, 150); ctx.scale(cp, cp); k.calendarPage(ctx, 0, 0, 130, 'NOV', 'FRI', 0.06); ctx.restore(); }
    },
  },
  { // 13.1 "Shoppers flood downtown."
    start: 12.9, title: 'Shoppers Flood Downtown', trans: 'wipe',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const fl = S.at('flood'), dt = S.at('downtown.');
      S.cam(lerp(1.0, 1.06, tween(u, 0, 2)), W / 2, 700);
      k.goldSky(ctx, -60, -60, W + 120, 1200, S.t);
      ['DEPT. STORE', 'TOYS', 'COATS'].forEach((n, i) => storefront(ctx, k, P, 160 + i * 310, 860, 280, ['#e8b7b0', '#d8c9a8', '#b9c98a'][i], n));
      ctx.fillStyle = '#6a6a6a'; ctx.fillRect(-60, 860, W + 120, 300);
      k.streetSign(ctx, 860, 120, 240, 'MARKET ST', P.green, 0.04);
      // the crowd keeps coming
      for (let i = 0; i < 10; i++) { const x = ((u - fl + 1) * 240 + i * 110) % (W + 200) - 100, y = 1000 + (i % 3) * 20; if (u > fl - 1) shopper(ctx, k, P, x, y, i + 3, 0.5, S.t * 8 + i); }
      // continuous narration, as miniaturists told a story in one picture: the same
      // shopper (red coat) goes in, buys, and comes out loaded with parcels
      const one = { robe: RED, robeP: 'dots', hat: 'longhair', hair: '#6a4a2a', skin: SKINS[2], s: 0.7, mood: 'happy' };
      k.figure(ctx, 140, 980, { ...one, face: 1, walk: S.t * 7, armF: [0.5, 0.2] });
      k.figure(ctx, 470, 860, { ...one, face: 1, armF: [1.6, 0.2], hold: c => k.coin(c, 0, 0, 12, S.t * 4, '$') });
      if (u > dt - 0.4) k.figure(ctx, 800, 980, { ...one, face: -1, walk: S.t * 7, armF: [0.9, 0.3], hold: c => { for (let j = 0; j < 3; j++) k.rect(c, -24 + j * 8, -10 - j * 22, 40, 26, [P.white, P.lapis, P.ochre][j], P.ink, 1.5); } });
    },
  },
  { // 15.0 "The Army-Navy football game is that weekend too."
    start: 14.9, title: 'The Army–Navy Game', trans: 'page',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const an = S.at('Army-Navy'), fb = S.at('football'), we = S.at('weekend');
      k.goldSky(ctx, -60, -60, W + 120, 1200, S.t);
      k.ground(ctx, -60, 760, W + 120, 400, P.green, 3, 0.2);
      for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(-60, 800 + i * 40); ctx.lineTo(W + 60, 800 + i * 40); k.stroke(ctx, 'rgba(255,255,255,0.6)', 3); }
      // two pennants
      [['ARMY', INK, '#ecd57a', 230], ['NAVY', '#1f2f5a', '#ecd57a', 710]].forEach(([n, c, t, x], i) => { const p = pop(u, an - 0.2 + i * 0.25, 0.35); if (p <= 0) return; ctx.save(); ctx.translate(x, 300); ctx.scale(p, p); ctx.rotate(Math.sin(S.t * 3 + i) * 0.05); k.poly(ctx, [[-130, -50], [150, 0], [-130, 50]], c, P.ink, 2.5); ctx.fillStyle = t; ctx.font = '900 34px Deco'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(n, -40, 2); ctx.restore(); k.rect(ctx, x - 136, 240, 8, 260, P.brown, P.ink, 1.5); });
      // the ball's arc
      const q = tween(u, fb - 0.2, we + 0.4, ease.inOut);
      ctx.save(); ctx.translate(lerp(120, 860, q), 700 - Math.sin(q * Math.PI) * 420); ctx.rotate(q * 9); ctx.scale(1.7, 1.7);
      ctx.beginPath(); ctx.ellipse(0, 0, 44, 26, 0, 0, TAU); k.fillStroke(ctx, '#7a4a2a', P.ink, 2.5);
      ctx.beginPath(); ctx.moveTo(-16, 0); ctx.lineTo(16, 0); k.stroke(ctx, P.white, 3); for (let j = -2; j <= 2; j++) { ctx.beginPath(); ctx.moveTo(j * 6, -5); ctx.lineTo(j * 6, 5); k.stroke(ctx, P.white, 2); }
      ctx.restore();
      k.label(ctx, 'THE SAME WEEKEND', W / 2, 1010, 26, tween(u, we, we + 0.3));
    },
  },
  { // 18.0 "Traffic jams everywhere."
    start: 17.9, title: 'Traffic Jams', trans: 'ink',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const tr = S.at('Traffic'), ev = S.at('everywhere.');
      S.cam(lerp(1.2, 1.0, tween(u, 0, 1.8, ease.inOut)), lerp(300, 470, tween(u, 0, 1.8)), 640);
      k.goldSky(ctx, -60, -60, W + 120, 1200, S.t);
      ctx.fillStyle = '#6a6a6a'; ctx.fillRect(-60, 420, W + 120, 700);
      for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) { const p = pop(u, tr - 0.4 + (r * 5 + c) * 0.06, 0.3); if (p <= 0) continue; const x = 110 + c * 190 + (r % 2) * 60, y = 520 + r * 150; ctx.save(); ctx.translate(x, y); ctx.scale(p * 0.75, p * 0.75); k.car(ctx, 0, 0, 1, 0, [P.verm, P.lapis, P.ochre, P.green, P.lav][(r + c) % 5], '', 0); ctx.restore(); if ((r + c) % 3 === 0 && Math.sin(S.t * 6 + r + c) > 0.5) k.speechBubble(ctx, x + 40, y - 70, 'HONK!', 20, 1); }
    },
  },
  { // 20.0 "Police officers have to work long shifts."
    start: 19.9, title: 'Long Shifts', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const po = S.at('Police'), lo = S.at('long');
      S.cam(lerp(1.0, 1.25, tween(u, lo - 0.4, lo + 1.0, ease.inOut)), lerp(470, 640, tween(u, lo - 0.4, lo + 1.0)), 520);
      k.nightSky(ctx, -60, -60, W + 120, 1200, S.t);
      ctx.fillStyle = '#4a4a4a'; ctx.fillRect(-60, 760, W + 120, 400);
      k.figure(ctx, 330, 1010, { ...COP, skin: SKINS[1], s: 1.25, face: 1, mood: u > lo ? 'sad' : 'calm', armF: [2.4 + Math.sin(u * 5) * 0.2, 0.1] });
      // the clock runs on and on
      const spin = tween(u, lo - 0.3, lo + 1.6) * 10;
      k.clockFace(ctx, 730, 400, 150, (8 + spin) % 12, (spin * 60) % 60);
    },
  },
  { // 22.7 "They give the day a grumpy nickname, Black Friday."
    start: 22.6, title: 'A Grumpy Nickname', trans: 'page',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const gr = S.at('grumpy'), bf = S.at('Black');
      S.cam(lerp(1.0, 1.18, tween(u, bf - 0.6, bf + 0.6, ease.inOut)), 560, 600);
      k.nightSky(ctx, -60, -60, W + 120, 1200, S.t);
      ctx.fillStyle = '#4a4a4a'; ctx.fillRect(-60, 760, W + 120, 400);
      for (let i = 0; i < 3; i++) k.cloud(ctx, 220 + i * 280, 160, 1.1, i + 50, '#5a5a6a', INK);
      [200, 470].forEach((x, i) => k.figure(ctx, x, 1010, { ...COP, skin: SKINS[i * 2 + 1], s: 1.05, face: 1, mood: 'sad', armF: [lerp(0.6, 1.6, tween(u, gr - 0.3, gr)), -0.4] }));
      const b = pop(u, bf - 0.2, 0.45);
      if (b > 0) { ctx.save(); ctx.translate(560, 560); ctx.scale(b * 1.25, b * 1.25); k.speechBubble(ctx, 0, 0, 'BLACK FRIDAY!', 52, -1, INK); ctx.fillStyle = '#f6eed8'; ctx.font = '900 52px Deco'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('BLACK FRIDAY!', 0, 2); ctx.restore(); }
    },
  },
  { // 26.9 "Store owners hate it. They try to rebrand it Big Friday. It doesn't stick."
    start: 26.6, title: 'Big Friday?', trans: 'ink',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const ha = S.at('hate'), bi = S.at('Big'), st = S.at("doesn't");
      S.cam(1 + 0.06 * tween(u, st, st + 0.8), W / 2, 600, -0.03 * tween(u, st, st + 0.8));
      k.goldSky(ctx, -60, -60, W + 120, 1200, S.t);
      storefront(ctx, k, P, W / 2, 900, 640, '#e8b7b0', 'DEPARTMENT STORE');
      ctx.fillStyle = '#6a6a6a'; ctx.fillRect(-60, 900, W + 120, 300);
      [190, 770].forEach((x, i) => k.figure(ctx, x, 1010, { robe: i ? P.green : P.lapis, robeP: 'stripes', robePc: P.white, hat: 'shorthair', hair: '#3a2a1a', skin: SKINS[i * 3], s: 0.95, face: i ? -1 : 1, mood: u < bi ? 'sad' : u < st ? 'happy' : 'sad', armF: [u > bi - 0.3 && u < st ? 2.6 : 0.8, 0.1] }));
      // the new banner goes up… and one corner gives way
      const up = tween(u, bi - 0.4, bi + 0.2, ease.outBack), fall = tween(u, st, st + 0.8, ease.inCubic);
      if (up > 0) { ctx.save(); ctx.translate(W / 2, 300 + fall * 420); ctx.rotate(fall * 0.5); ctx.scale(up, up); k.rect(ctx, -280, -60, 560, 120, '#f6eed8', INK, 3); ctx.fillStyle = RED; ctx.font = '900 64px Deco'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('BIG FRIDAY', 0, 4); ctx.restore(); }
    },
  },
  { // 33.0 "By the 1980s, a happier story appears. Black Friday is when stores go from red ink to black."
    start: 32.8, title: 'A Happier Story · 1980s', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const yr = S.at('1980s,'), ha = S.at('happier'), re = S.at('red'), bl = S.at('black.');
      S.cam(lerp(1.0, 1.15, tween(u, re - 0.5, bl + 0.5, ease.inOut)), W / 2, 600);
      ctx.fillStyle = '#efe3c6'; ctx.fillRect(-60, -60, W + 120, 1200);
      k.seal(ctx, 140, 150, 64, ' THE 1980s · THE 1980s ·', '1980s', tween(u, yr - 0.1, yr + 0.3, ease.linear));
      // the account book: red ink turns to black, line by line
      const bk = pop(u, ha - 0.4, 0.45);
      if (bk > 0) { ctx.save(); ctx.translate(W / 2, 560); ctx.scale(bk, bk); k.rect(ctx, -330, -300, 660, 600, P.brown, P.ink, 3); ctx.save(); ctx.beginPath(); ctx.rect(-310, -280, 620, 560); ctx.clip(); ledgerPage(ctx, S, 620, 560, tween(u, re + 0.3, bl + 0.5)); ctx.restore(); ctx.beginPath(); ctx.moveTo(0, -280); ctx.lineTo(0, 280); k.stroke(ctx, P.ink, 3); ctx.restore(); }
      const q = tween(u, re + 0.3, bl + 0.5);
      if (q > 0 && q < 1) k.quill(ctx, W / 2 + 200, 300 + q * 520, 0.9, -0.5);
    },
  },
  { // 40.6 "A nice story, just not the original one."
    start: 40.4, title: 'Nice, but Not True', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const ni = S.at('nice'), or = S.at('original');
      interior(ctx, S, { carpetColor: P.vermDark });
      lamp(ctx, S, 470, 150, 1);
      meddah(ctx, S, 230, u, { arm: lerp(1.4, 2.5, tween(u, or - 0.3, or)), mood: 'happy' });
      listeners(ctx, S, u, tween(u, or, or + 0.3), true);
      thought(ctx, S, 650, 330, 380, 240, 1, c => ledgerPage(c, S, 380, 240, 1));
      const strike = tween(u, or - 0.2, or + 0.4, ease.inOut);
      if (strike > 0) { ctx.beginPath(); ctx.moveTo(470, 230); ctx.lineTo(470 + 360 * strike, 230 + 200 * strike); k.stroke(ctx, RED, 10); if (strike > 0.5) { ctx.beginPath(); ctx.moveTo(830, 230); ctx.lineTo(830 - 360 * (strike - 0.5) * 2, 230 + 200 * (strike - 0.5) * 2); k.stroke(ctx, RED, 10); } }
    },
  },
  { // 44.2 "A cop's complaint that became one of America's biggest shopping days."
    start: 44.0, title: "A Cop's Complaint", trans: 'ink',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const cc = S.at("cop's"), be = S.at('became'), bg = S.at('biggest');
      S.cam(lerp(1.25, 1.0, tween(u, be - 0.4, be + 1.2, ease.inOut)), lerp(260, W / 2, tween(u, be - 0.4, be + 1.2)), 640);
      k.goldSky(ctx, -60, -60, W + 120, 1200, S.t);
      ['SALE', 'SALE', 'SALE'].forEach((n, i) => storefront(ctx, k, P, 160 + i * 310, 900, 280, ['#e8b7b0', '#d8c9a8', '#b9c98a'][i], n));
      ctx.fillStyle = '#6a6a6a'; ctx.fillRect(-60, 900, W + 120, 300);
      // the officer's grumble grows into the sign over the street
      const g = tween(u, be - 0.4, be + 0.8, ease.inOut);
      k.figure(ctx, 140, 1010, { ...COP, skin: SKINS[1], s: 0.95, face: 1, mood: 'sad', armF: [0.8, 0.2] });
      ctx.save(); ctx.translate(lerp(330, W / 2, g), lerp(620, 260, g)); ctx.scale(lerp(0.5, 1.2, g), lerp(0.5, 1.2, g));
      k.rect(ctx, -280, -60, 560, 120, INK, P.goldLight, 4); ctx.fillStyle = '#f6eed8'; ctx.font = '900 56px Deco'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('BLACK FRIDAY', 0, 4); ctx.restore();
      for (let i = 0; i < 10; i++) { const x = ((u * 200 + i * 105) % (W + 200)) - 100; if (u > bg - 0.6) shopper(ctx, k, P, x, 1000 + (i % 3) * 20, i, 0.5, S.t * 8 + i); }
      for (let i = 0; i < 5; i++) { const p = pop(u, bg - 0.2 + i * 0.12, 0.3); if (p > 0) { ctx.save(); ctx.translate(120 + i * 180, 520); ctx.rotate(-0.2 + i * 0.1); ctx.scale(p, p); k.rect(ctx, -40, -24, 80, 48, RED, P.ink, 2); ctx.fillStyle = P.white; ctx.font = '900 22px Deco'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('SALE', 0, 2); ctx.restore(); } }
    },
  },
  { // 49.4 "Every legend has a beginning."
    start: 49.2, title: 'Every Legend Has a Beginning', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S, beg = S.at('beginning.');
      ctx.save(); S.cam(lerp(1.0, 1.5, tween(u, 0, beg)), 230, 560);
      interior(ctx, S, { carpetColor: P.vermDark });
      lamp(ctx, S, 470, 150, 1);
      meddah(ctx, S, 230, u, { arm: 2.2 });
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
  ...scenes.slice(1).map(s => ({ t: s.start - 0.05, type: s.trans === 'cut' ? 'pop' : 'paper', gain: 0.35 })),
  { t: 0.7, type: 'pluck', gain: 0.4 }, { t: 3.2, type: 'coins', gain: 0.35 },
  { t: 4.55, type: 'stamp', gain: 0.85 },
  { t: 7.3, type: 'stamp', gain: 0.5 }, { t: 8.6, type: 'chime', gain: 0.4 }, { t: 10.2, type: 'pop', gain: 0.4 }, { t: 11.7, type: 'thud', gain: 0.6 }, { t: 11.75, type: 'stamp', gain: 0.8 },
  { t: 13.4, type: 'whoosh', gain: 0.4 },
  { t: 15.2, type: 'pop', gain: 0.4 }, { t: 15.5, type: 'pop', gain: 0.4, pitch: 1.2 }, { t: 15.7, type: 'whoosh', gain: 0.45 }, { t: 16.9, type: 'thud', gain: 0.5 },
  { t: 18.1, type: 'alarm', gain: 0.25 }, { t: 18.6, type: 'alarm', gain: 0.2 },
  { t: 20.1, type: 'chime', gain: 0.35, pitch: 1.6 }, { t: 21.2, type: 'clank', gain: 0.3 }, { t: 21.6, type: 'clank', gain: 0.3 },
  { t: 23.6, type: 'flop', gain: 0.4 }, { t: 25.3, type: 'thunder', gain: 0.5 }, { t: 25.35, type: 'stamp', gain: 0.6 },
  { t: 27.4, type: 'flop', gain: 0.35 }, { t: 29.5, type: 'riser', gain: 0.35 }, { t: 30.0, type: 'chime', gain: 0.5 }, { t: 31.4, type: 'slide', gain: 0.5 }, { t: 32.0, type: 'thud', gain: 0.6 },
  { t: 33.2, type: 'stamp', gain: 0.5 }, { t: 34.4, type: 'chime', gain: 0.4 }, { t: 38.5, type: 'paper', gain: 0.4 }, { t: 39.4, type: 'chime', gain: 0.55, pitch: 1.3 },
  { t: 40.8, type: 'pluck', gain: 0.4 }, { t: 42.75, type: 'stamp', gain: 0.85 },
  { t: 45.7, type: 'riser', gain: 0.45 }, { t: 46.6, type: 'gong', gain: 0.6 }, { t: 47.0, type: 'coins', gain: 0.4 }, { t: 47.5, type: 'pop', gain: 0.4 },
  { t: 50.68, type: 'pop', gain: 0.8 }, { t: 50.72, type: 'gong', gain: 0.9 },
];

export const music = {
  bpm: 104, root: 'D', maqam: 'rast', gain: 0.32,
  sections: [
    { from: 0, to: 6.5, mood: 'intro' },
    { from: 6.5, to: 22.6, mood: 'drive' },
    { from: 22.6, to: 32.8, mood: 'sad' },
    { from: 32.8, to: 44.0, mood: 'groove' },
    { from: 44.0, to: 50.68, mood: 'triumph' },
    { from: 50.68, to: 54.0, mood: 'end' },
  ],
};
