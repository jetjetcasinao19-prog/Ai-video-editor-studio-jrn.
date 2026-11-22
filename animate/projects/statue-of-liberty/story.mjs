// "Why the Statue of Liberty Is Green" — told as a mosaic: the statue is an
// İznik tile mural of about 300 copper sheets, assembled tile by tile, and her
// patina spreads tile by tile. u = seconds since the scene started.
import { createCanvas } from '@napi-rs/canvas';
import { clamp, lerp, ease, tween, rng, TAU, shake, pop } from '../../lib/core.mjs';
import { land, interior, bookCover, medallion } from '../../styles/ottoman/scenes.mjs';

export const meta = {
  title: 'Why the Statue of Liberty Is Green',
  slug: 'statue-of-liberty-ottoman',
  style: 'ottoman',
  look: 'tile',     // İznik tile panel (the three videos before used scroll, night, album)
  room: 'lattice',
  device: 'mosaic',
  ambient: 'dust',
  width: 1080, height: 1920, fps: 30,
  duration: 53.3,
  voice: 'voice.mp3',
  seed: 131,
  captionChars: 30,
  brand: { handle: '@HOWITSTARTED-YT1', logo: '../../../brand/logo.png' },
  outro: { at: 51.3, text: 'Subscribe for more origin stories' },
};

const SKINS = ['#e2b48a', '#a86c45', '#f1d1a8', '#8a5a3c', '#c68a5e', '#f1d1a8'];

// ---------- the mosaic: the statue cut into ~300 tiles ----------
const MX = 470, MBASE = 1000, MS = 1.05;            // where the mural statue stands
const GX = 330, GY = 80, COLS = 14, ROWS = 22, TW = 20, TH = 42; // 14 x 22 grid over her
let CACHE = null;
function statueLayers(k) {
  if (CACHE) return CACHE;
  const make = metal => { const c = createCanvas(940, 1060); k.liberty(c.getContext('2d'), MX, MBASE, MS, { metal }); return c; };
  const layers = [make(k.COPPER.new), make(k.COPPER.brown), make(k.COPPER.green)];
  // which tiles actually hold part of her
  const g = layers[0].getContext('2d'), d = g.getImageData(GX, GY, COLS * TW, ROWS * TH).data, tiles = [];
  for (let j = 0; j < ROWS; j++) for (let i = 0; i < COLS; i++) {
    let hit = false;
    for (let yy = 4; yy < TH && !hit; yy += 8) for (let xx = 2; xx < TW && !hit; xx += 6) if (d[((j * TH + yy) * COLS * TW + i * TW + xx) * 4 + 3] > 40) hit = true;
    if (hit) tiles.push([i, j]);
  }
  CACHE = { layers, tiles };
  return CACHE;
}
// appear(i,j) 0..1 pops a tile in; age(i,j) 0 = new copper, 1 = brown, 2 = green
function mosaicStatue(ctx, S, appear, age, seams = 1) {
  const { layers, tiles } = statueLayers(S.k);
  for (const [i, j] of tiles) {
    const a = appear(i, j); if (a <= 0) continue;
    const x = GX + i * TW, y = GY + j * TH, g = clamp(age(i, j), 0, 2);
    ctx.save(); ctx.translate(x + TW / 2, y + TH / 2); ctx.scale(a, a); ctx.translate(-x - TW / 2, -y - TH / 2);
    const lo = g <= 1 ? 0 : 1, f = g <= 1 ? g : g - 1;
    ctx.drawImage(layers[lo], x, y, TW, TH, x, y, TW, TH);
    if (f > 0) { ctx.globalAlpha *= f; ctx.drawImage(layers[lo + 1], x, y, TW, TH, x, y, TW, TH); }
    ctx.restore();
  }
  if (seams > 0) { // the seams between the copper sheets
    ctx.save(); ctx.globalAlpha *= 0.3 * seams; ctx.strokeStyle = '#2a1c12'; ctx.lineWidth = 1;
    for (const [i, j] of tiles) if (appear(i, j) >= 1) ctx.strokeRect(GX + i * TW + 0.5, GY + j * TH + 0.5, TW - 1, TH - 1);
    ctx.restore();
  }
}
const R = rng(77), NOISE = Array.from({ length: COLS * ROWS }, () => R());
const nz = (i, j) => NOISE[j * COLS + i];
function muralWall(ctx, S) {
  const { k, P, W } = S;
  ctx.fillStyle = '#f6f3ea'; ctx.fillRect(-80, -80, W + 160, 1240);
  ctx.save(); ctx.globalAlpha = 0.35; ctx.fillStyle = k.pattern(ctx, 'tiles', '#f6f3ea', '#1f5fae', 58); ctx.fillRect(-80, -80, W + 160, 1240); ctx.restore();
  k.rect(ctx, -80, 1000, W + 160, 80, '#d8c9a8', P.ink, 2);
}

export const scenes = [
  { // 0.0 "The Statue of Liberty wasn't always green."
    start: 0, title: 'Not Always Green',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const wa = S.at("wasn't"), gr = S.at('green.');
      k.goldSky(ctx, -60, -60, W + 120, 1200, S.t);
      k.waves(ctx, -60, 900, W + 120, 240, S.t, P.water, P.waterLight, 20, 22);
      k.libertyPedestal(ctx, W / 2, 640, 0.9);
      const split = tween(u, wa - 0.1, gr + 0.4, ease.inOut);
      k.liberty(ctx, W / 2, 640, 0.72, { metal: k.COPPER.green, glow: 0.6 });
      if (split > 0) { const sx = -60 + (W / 2 + 60) * split; ctx.save(); ctx.beginPath(); ctx.rect(-60, -60, sx + 60, 1200); ctx.clip(); k.liberty(ctx, W / 2, 640, 0.72, { metal: k.COPPER.new, shine: 1, t: S.t, glow: 0.6 }); ctx.restore(); ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx, 1060); k.stroke(ctx, P.goldLight, 6); }
      medallion(ctx, k, P, '?', 800, 200, pop(u, wa, 0.35), P.verm);
      k.label(ctx, 'NOT ALWAYS GREEN', W / 2, 1010, 28, tween(u, gr - 0.2, gr + 0.2));
    },
  },
  { // 3.2 "She used to look like a shiny new penny."
    start: 3.1, title: 'A Shiny New Penny', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const sh = S.at('shiny'), pe = S.at('penny.');
      k.goldSky(ctx, -60, -60, W + 120, 1200, S.t);
      ctx.save(); ctx.globalAlpha = 0.5; ctx.fillStyle = k.pattern(ctx, 'scales', '#f3d28a', '#e3b866', 40); ctx.fillRect(-60, -60, W + 120, 1200); ctx.restore();
      S.cam(lerp(1.0, 1.08, tween(u, 0, 3.3)), 400, 520);
      k.libertyPedestal(ctx, 360, 700, 0.9);
      k.liberty(ctx, 360, 700, 0.8, { metal: k.COPPER.new, shine: tween(u, sh - 0.3, sh + 0.2), t: S.t * 1.5, glow: 0.5 });
      const p = pop(u, pe - 0.25, 0.4);
      if (p > 0) k.penny(ctx, 740, 620, 120 * p, S.t * 1.2);
      for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + S.t, tw = 0.5 + 0.5 * Math.sin(S.t * 6 + i); if (u > sh) k.star(ctx, 360 + Math.cos(a) * 200, 420 + Math.sin(a) * 300, 10 * tw, tw); }
      k.label(ctx, 'SHINY AS A NEW PENNY', W / 2, 1000, 26, tween(u, pe, pe + 0.3));
    },
  },
  { // 6.6 "October 1886, New York Harbor."
    start: 6.4, title: 'New York Harbor · 1886', trans: 'tiles',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const oc = S.at('October'), ny = S.at('New');
      k.goldSky(ctx, -60, -60, W + 120, 760, S.t);
      for (let i = 0; i < 3; i++) k.cloud(ctx, 120 + i * 330, 130 + (i % 2) * 50, 1, i + 30);
      k.waves(ctx, -60, 640, W + 120, 480, S.t, P.water, P.waterLight, 22, 24);
      k.blob(ctx, 300, 690, 150, 5, 0.15, 14, P.sage, P.ink, 2, 0.35);
      k.libertyPedestal(ctx, 300, 520, 0.45);
      k.liberty(ctx, 300, 520, 0.42, { metal: k.COPPER.new, glow: 0.5 });
      k.steamboat(ctx, lerp(1100, 680, tween(u, 0, 4)), 860, 0.6, S.t);
      const cp = pop(u, oc - 0.2, 0.35);
      if (cp > 0) { ctx.save(); ctx.translate(760, 260); ctx.scale(cp, cp); k.calendarPage(ctx, 0, 0, 150, 'OCT', 28, 0.06); ctx.restore(); }
      k.seal(ctx, 560, 230, 64, ' OCTOBER · 1886 ·', '1886', tween(u, S.at('1886'), S.at('1886') + 0.3, ease.linear));
      k.label(ctx, 'NEW YORK HARBOR', W / 2, 1010, 28, tween(u, ny, ny + 0.3));
    },
  },
  { // 10.6 "Lady Liberty is unveiled,"
    start: 10.4, title: 'Unveiled', trans: 'lattice',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const un = S.at('unveiled,');
      k.goldSky(ctx, -60, -60, W + 120, 1200, S.t);
      k.liberty(ctx, W / 2 - 20, 1520, 1.55, { metal: k.COPPER.new, shine: tween(u, un, un + 0.6), t: S.t });
      // a striped flag veils her face, then slides away
      const off = tween(u, un - 0.1, un + 0.6, ease.inCubic);
      ctx.save(); ctx.translate(W / 2 - 20, 640 + off * 700); ctx.rotate(off * 0.3);
      const fw = 300;
      [P.lapis, P.white, P.verm].forEach((c, i) => { ctx.beginPath(); ctx.moveTo(-fw / 2 + i * fw / 3, -170); ctx.lineTo(-fw / 2 + (i + 1) * fw / 3, -170); ctx.quadraticCurveTo(-fw / 2 + (i + 1) * fw / 3 + 12, 0, -fw / 2 + (i + 1) * fw / 3 - 6, 190); ctx.lineTo(-fw / 2 + i * fw / 3 - 6, 190); ctx.quadraticCurveTo(-fw / 2 + i * fw / 3 + 12, 0, -fw / 2 + i * fw / 3, -170); ctx.closePath(); k.fillStroke(ctx, c, P.ink, 2); });
      ctx.restore();
      if (u > un) for (let i = 0; i < 14; i++) { const a = i / 14 * TAU, r = 120 + (u - un) * 320; k.star(ctx, W / 2 - 20 + Math.cos(a) * r, 620 + Math.sin(a) * r, 12, 1 - (u - un) * 0.6); }
      k.label(ctx, 'LADY LIBERTY', W / 2, 160, 28, tween(u, 0.2, 0.5));
      k.label(ctx, 'UNVEILED', W / 2, 1000, 28, tween(u, un, un + 0.3));
    },
  },
  { // 12.8 "covered in about 300 thin copper sheets, roughly as thick as two pennies."
    start: 12.6, title: '300 Copper Sheets', trans: 'tiles',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const cv = S.at('covered'), th = S.at('300'), sh = S.at('sheets,'), tw = S.at('two'), pn = S.at('pennies.');
      muralWall(ctx, S);
      // the sheets go on tile by tile, bottom to top
      const build = tween(u, cv - 0.3, sh + 0.3);
      mosaicStatue(ctx, S, (i, j) => clamp((build * 1.25 - (1 - j / ROWS) - nz(i, j) * 0.15) * 6), () => 0, 1);
      const n = Math.round(300 * tween(u, th - 0.2, sh + 0.2));
      if (u > th - 0.2) k.label(ctx, `${n} COPPER SHEETS`, 220, 140, 26, 1);
      // as thick as two pennies
      const p = pop(u, tw - 0.3, 0.4);
      if (p > 0) {
        ctx.save(); ctx.translate(790, 640); ctx.scale(p, p);
        k.rect(ctx, -90, -14, 180, 14, k.COPPER.new, P.ink, 2);
        for (let q = 0; q < 2; q++) { ctx.beginPath(); ctx.ellipse(0, 40 + q * 12, 60, 14, 0, 0, TAU); k.fillStroke(ctx, k.COPPER.new, P.ink, 2); }
        ctx.beginPath(); ctx.moveTo(100, -14); ctx.lineTo(100, 0); ctx.moveTo(70, 40); ctx.lineTo(70, 64); k.stroke(ctx, P.verm, 3);
        ctx.restore();
        k.label(ctx, 'AS THICK AS TWO PENNIES', 790, 800, 20, tween(u, pn - 0.2, pn + 0.2));
      }
    },
  },
  { // 18.3 "But copper changes in the sea air."
    start: 18.1, title: 'The Sea Air', trans: 'ink',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const ch = S.at('changes'), sa = S.at('sea');
      k.goldSky(ctx, -60, -60, W + 120, 1200, S.t);
      ctx.save(); ctx.globalAlpha = 0.45; ctx.fillStyle = '#8fa3b8'; ctx.fillRect(-60, -60, W + 120, 1200); ctx.restore();
      k.waves(ctx, -60, 900, W + 120, 240, S.t * 1.6, P.water, P.waterLight, 30, 26);
      k.libertyPedestal(ctx, W / 2, 640, 0.9);
      k.liberty(ctx, W / 2, 640, 0.72, { metal: k.mixColor(k.COPPER.new, k.COPPER.brown, tween(u, ch, 3.1) * 0.55), glow: 0.3 });
      // salt wind and spray blow across her
      for (let i = 0; i < 6; i++) { const x = ((S.t * 260 + i * 210) % (W + 300)) - 150, y = 160 + i * 120; ctx.beginPath(); ctx.moveTo(x, y); ctx.bezierCurveTo(x + 60, y - 30, x + 120, y + 30, x + 180, y); ctx.arc(x + 180, y - 14, 14, Math.PI / 2, Math.PI * 2.2); k.stroke(ctx, 'rgba(248,242,226,0.85)', 4); }
      for (let i = 0; i < 40; i++) { const x = ((S.t * 300 + i * 53) % (W + 100)) - 50, y = ((i * 97 + S.t * 500) % 1000); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 12, y + 20); k.stroke(ctx, 'rgba(220,235,245,0.7)', 2); }
      k.label(ctx, 'SEA AIR', 170, 140, 28, tween(u, sa, sa + 0.3));
      k.label(ctx, 'COPPER CHANGES', W / 2, 1010, 26, tween(u, ch, ch + 0.3));
    },
  },
  { // 21.4 "Year by year, she turns from brown to green."
    start: 21.2, title: 'Brown, Then Green', trans: 'tiles',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const ye = S.at('Year'), br = S.at('brown'), gr = S.at('green.');
      muralWall(ctx, S);
      S.cam(lerp(1.0, 1.06, tween(u, 0, 4.5)), MX, 520);
      // time runs: brown first, then the green creeps over her tile by tile
      const toBrown = tween(u, ye, br + 0.2), toGreen = tween(u, br + 0.4, gr + 0.9, ease.inOut);
      mosaicStatue(ctx, S, () => 1, (i, j) => 0.55 + toBrown * 0.45 + clamp((toGreen * 1.6 - nz(i, j) * 0.6 - (j / ROWS) * 0.3) * 2.2), 1);
      // pages of years flying off a calendar
      for (let q = 0; q < 6; q++) { const f = ((u * 2.2 + q / 6) % 1); if (u < ye) break; ctx.save(); ctx.globalAlpha *= 1 - f; ctx.translate(800 + f * 120, 230 - f * 160); ctx.rotate(f * 2); k.rect(ctx, -40, -46, 80, 92, P.paperLight, P.ink, 2); k.rect(ctx, -40, -46, 80, 22, P.verm, P.ink, 1.5); ctx.restore(); }
      k.label(ctx, 'YEAR BY YEAR', 800, 360, 24, tween(u, ye, ye + 0.3));
      k.label(ctx, 'BROWN…', 170, 360, 26, tween(u, br - 0.1, br + 0.2) * (1 - tween(u, gr - 0.2, gr)));
      k.label(ctx, '…TO GREEN', 170, 360, 26, tween(u, gr - 0.1, gr + 0.2));
    },
  },
  { // 25.9 "In 1906, Congress sets aside money to paint her and make her look new again."
    start: 25.7, title: 'Congress · 1906', trans: 'wipe',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const yr = S.at('1906,'), co = S.at('Congress'), mo = S.at('money'), pa = S.at('paint'), nw = S.at('new');
      k.goldSky(ctx, -60, -60, W + 120, 1200, S.t);
      k.ground(ctx, -60, 860, W + 120, 300, P.sage, 3, 0.3);
      // a domed hall of government (drawn generic)
      k.rect(ctx, 50, 600, 360, 260, P.white, P.ink, 2.5); for (let i = 0; i < 6; i++) k.rect(ctx, 70 + i * 56, 640, 22, 200, '#efe6d0', P.ink, 1.5);
      // a ribbed government dome on a drum of columns, a lantern and a flag on top
      k.rect(ctx, 130, 500, 200, 100, P.white, P.ink, 2.5); for (let i = 0; i < 8; i++) k.rect(ctx, 140 + i * 24, 510, 10, 80, '#efe6d0', P.ink, 1);
      ctx.beginPath(); ctx.moveTo(140, 500); ctx.quadraticCurveTo(140, 400, 230, 392); ctx.quadraticCurveTo(320, 400, 320, 500); ctx.closePath(); k.fillStroke(ctx, '#f3efe6', P.ink, 2.5);
      for (let i = 1; i < 6; i++) { ctx.beginPath(); ctx.moveTo(140 + i * 30, 500); ctx.quadraticCurveTo(160 + i * 23, 420, 230, 394); k.stroke(ctx, '#c9c0ae', 1.5); }
      k.rect(ctx, 215, 360, 30, 34, P.white, P.ink, 2); ctx.beginPath(); ctx.moveTo(230, 360); ctx.lineTo(230, 300); k.stroke(ctx, P.ink, 3);
      k.rect(ctx, 230, 300, 44, 26, P.verm, P.ink, 1.5); k.rect(ctx, 230, 300, 18, 13, P.lapis, null); for (let i = 0; i < 3; i++) k.rect(ctx, 230, 304 + i * 8, 44, 3, P.white, null);
      k.seal(ctx, 110, 200, 66, ' THE YEAR · 1906 ·', '1906', tween(u, yr - 0.1, yr + 0.3, ease.linear));
      k.label(ctx, 'CONGRESS', 230, 920, 24, tween(u, co, co + 0.3));
      for (let i = 0; i < 4; i++) { const p = pop(u, mo - 0.2 + i * 0.12, 0.3); if (p > 0) k.coin(ctx, 450 + i * 40, 820 - i * 18, 26 * p, S.t * 2 + i, '$'); }
      // the green statue and a painter heading up the ladder with copper paint
      k.libertyPedestal(ctx, 720, 640, 0.75);
      const painted = tween(u, pa + 0.2, nw + 0.4);
      k.liberty(ctx, 720, 640, 0.56, { metal: k.COPPER.green });
      if (painted > 0) { ctx.save(); ctx.beginPath(); ctx.rect(500, 640 - 480 * painted, 440, 480 * painted); ctx.clip(); k.liberty(ctx, 720, 640, 0.56, { metal: k.COPPER.new, shine: 0.6, t: S.t }); ctx.restore(); }
      k.ladder(ctx, 860, 300, 900, 60);
      const up = tween(u, pa - 0.4, pa + 0.6);
      k.figure(ctx, 880, lerp(1000, 760, up), { robe: P.ochre, robeP: 'stripes', robePc: P.ochreLight, hat: 'cap', hatColor: P.white, skin: SKINS[4], s: 0.6, face: -1, mood: 'happy', armF: [2.2, 0.3], hold: c => k.paintBucket(c, 0, 0, 0.5) });
      k.label(ctx, 'PAINT HER NEW AGAIN', 700, 160, 24, tween(u, nw, nw + 0.3));
    },
  },
  { // 31.6 "People are furious. One newspaper calls it sacrilege."
    start: 31.3, title: 'Sacrilege!', trans: 'tiles',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const fu = S.at('furious.'), np = S.at('newspaper'), sa = S.at('sacrilege.');
      const sh = shake(u, fu, 8, 0.6); ctx.translate(sh[0], sh[1]);
      interior(ctx, S, { carpet: false });
      for (let i = 0; i < 6; i++) { const x = 90 + i * 150, anger = tween(u, fu - 0.3, fu); k.figure(ctx, x, 1010, { robe: [P.verm, P.lapis, P.green, P.ochre, P.lav, P.turq][i], robeP: 'dots', hat: ['fez', 'turban', 'hotoz', 'cap', 'turban', 'fez'][i], hatColor: [P.verm, P.white, P.vermDark, P.lapis, P.green, P.verm][i], veil: P.white, skin: SKINS[i], s: 0.8, face: i < 3 ? 1 : -1, mood: 'sad', armF: [lerp(0.6, 2.7, anger) + Math.sin(u * 14 + i) * 0.15 * anger, -0.6 * anger] }); }
      [[200, 520, 'NO!'], [520, 470, 'LEAVE HER!'], [800, 540, 'NO!']].forEach(([x, y, t], i) => { const p = pop(u, fu - 0.1 + i * 0.15, 0.3); if (p > 0) { ctx.save(); ctx.translate(x, y); ctx.scale(p, p); k.speechBubble(ctx, 0, 0, t, 30, i % 2 ? -1 : 1); ctx.restore(); } });
      const nwp = pop(u, np - 0.3, 0.4);
      if (nwp > 0) { ctx.save(); ctx.translate(W / 2, 250); ctx.scale(nwp, nwp); k.newspaper(ctx, 0, 0, 380, -0.05, u > sa - 0.1 ? 'SACRILEGE!' : '…', 'THE MORNING PAPER'); ctx.restore(); }
      k.stamp(ctx, 'SACRILEGE', W / 2, 330, 58, tween(u, sa + 0.1, sa + 0.35, ease.linear), -0.14);
    },
  },
  { // 36.0 "The plan is dropped."
    start: 35.9, title: 'The Plan Is Dropped', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const dr = S.at('dropped.');
      k.goldSky(ctx, -60, -60, W + 120, 1200, S.t);
      k.ground(ctx, -60, 860, W + 120, 300, P.sage, 3, 0.3);
      k.libertyPedestal(ctx, 360, 640, 0.75);
      k.liberty(ctx, 360, 640, 0.56, { metal: k.COPPER.green, glow: 0.5 });
      const fall = tween(u, dr - 0.4, dr, ease.inCubic);
      const splash = tween(u, dr, dr + 0.4, ease.outCubic);
      if (splash <= 0) k.paintBucket(ctx, 720, lerp(200, 900, fall), 1.4, k.COPPER.new, fall * 2.4);
      else { k.paintBucket(ctx, 760, 930, 1.4, k.COPPER.new, 1.8); k.blob(ctx, 680, 960, 60 + splash * 70, 9, 0.35, 16, k.COPPER.new, P.ink, 2, 0.35); }
      k.stamp(ctx, 'PLAN DROPPED', 640, 420, 56, tween(u, dr + 0.05, dr + 0.3, ease.linear), -0.15);
    },
  },
  { // 37.8 "And it's a good thing. That green layer, called a patina, actually protects the copper underneath."
    start: 37.6, title: 'The Patina', trans: 'ink',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const gt = S.at('good'), la = S.at('layer,'), pt = S.at('patina,'), pr = S.at('protects'), cu = S.at('copper');
      muralWall(ctx, S);
      // a magnifier over her robe, then the cutaway of one sheet
      mosaicStatue(ctx, S, () => 1, () => 2, 0.6);
      const cut = tween(u, la - 0.3, la + 0.4, ease.outCubic);
      ctx.save(); ctx.globalAlpha *= cut;
      k.rect(ctx, 560, 560, 360, 380, P.paperLight, P.goldDark, 4);
      const pat = tween(u, pt - 0.3, pt + 0.4);
      k.rect(ctx, 590, 760, 300, 120, k.COPPER.new, P.ink, 2.5);
      k.rect(ctx, 590, 760 - 36 * pat, 300, 36 * pat, k.COPPER.green, P.ink, 2.5);
      // salt and rain bounce off the green skin
      if (u > pr - 0.3) for (let i = 0; i < 7; i++) { const q = ((u - pr) * 1.6 + i / 7) % 1, x = 610 + i * 42, y = q < 0.6 ? lerp(590, 720, q / 0.6) : lerp(720, 640, (q - 0.6) / 0.4); k.circle(ctx, x, y, 6, '#cfe6f2', P.ink, 1); }
      ctx.restore();
      ctx.beginPath(); ctx.moveTo(500, 700); ctx.lineTo(560, 700); k.stroke(ctx, P.goldDark, 3);
      k.magnifier(ctx, 470, 700, 60 * cut, 0.7);
      k.label(ctx, 'PATINA', 740, 690, 24, tween(u, pt, pt + 0.3));
      k.label(ctx, 'COPPER', 740, 900, 24, tween(u, cu, cu + 0.3));
      medallion(ctx, k, P, '!', 740, 470, pop(u, pr - 0.2, 0.35), P.green);
      k.label(ctx, 'IT PROTECTS HER', 740, 380, 22, tween(u, pr, pr + 0.3));
      k.label(ctx, 'A GOOD THING', 200, 140, 24, tween(u, gt, gt + 0.3) * (1 - tween(u, la - 0.2, la)));
    },
  },
  { // 44.5 "A flaw that became her famous color."
    start: 44.3, title: 'Her Famous Color', trans: 'tiles',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const fl = S.at('flaw'), fa = S.at('famous');
      muralWall(ctx, S);
      S.cam(lerp(1.15, 0.92, tween(u, 0, 4, ease.inOut)), MX, 560);
      // the finished mural: her tiles glint one by one; a tile border grows round her
      mosaicStatue(ctx, S, () => 1, () => 2, 1);
      const { tiles } = statueLayers(k);
      tiles.forEach(([i, j], n) => { const g = Math.sin(S.t * 3 - n * 0.35); if (g > 0.93) k.star(ctx, GX + i * TW + TW / 2, GY + j * TH + TH / 2, 8, (g - 0.93) * 14); });
      const fr = tween(u, fa - 0.4, fa + 0.6);
      if (fr > 0) { ctx.save(); ctx.strokeStyle = '#1f5fae'; ctx.lineWidth = 26; ctx.setLineDash([1400 * fr, 3000]); ctx.strokeRect(GX - 60, GY - 40, COLS * TW + 120, ROWS * TH + 70); ctx.strokeStyle = P.turq; ctx.lineWidth = 8; ctx.strokeRect(GX - 60, GY - 40, COLS * TW + 120, ROWS * TH + 70); ctx.restore(); }
      k.label(ctx, 'A FLAW…', 170, 220, 26, tween(u, fl, fl + 0.3) * (1 - tween(u, fa - 0.2, fa)));
      k.label(ctx, 'HER FAMOUS COLOR', W / 2, 1030, 28, tween(u, fa, fa + 0.3));
    },
  },
  { // 48.7 "Every legend has a beginning."
    start: 48.5, title: 'Every Legend Has a Beginning', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S, beg = S.at('beginning.');
      ctx.save(); S.cam(lerp(1.0, 1.6, tween(u, 0, beg)), W / 2 + 70, lerp(560, 300, tween(u, 0, beg)));
      k.nightSky(ctx, -60, -60, W + 120, 1200, S.t);
      k.waves(ctx, -60, 900, W + 120, 240, S.t, P.water, P.waterLight, 20, 22);
      k.libertyPedestal(ctx, W / 2, 640, 0.9);
      k.liberty(ctx, W / 2, 640, 0.72, { metal: k.COPPER.green, glow: 1 });
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
  ...scenes.slice(1).map(s => ({ t: s.start - 0.05, type: s.trans === 'cut' ? 'pop' : 'whoosh', gain: 0.3 })),
  { t: 1.0, type: 'slide', gain: 0.4 }, { t: 2.0, type: 'chime', gain: 0.45 },
  { t: 4.2, type: 'chime', gain: 0.5, pitch: 1.5 }, { t: 5.0, type: 'coins', gain: 0.35 },
  { t: 6.6, type: 'pop', gain: 0.4 }, { t: 7.0, type: 'stamp', gain: 0.5 }, { t: 9.0, type: 'waves', gain: 0.3 },
  { t: 11.6, type: 'whoosh', gain: 0.5 }, { t: 11.7, type: 'riser', gain: 0.3 }, { t: 12.0, type: 'chime', gain: 0.5 },
  ...Array.from({ length: 10 }, (_, i) => ({ t: +(12.9 + i * 0.22).toFixed(2), type: 'clank', gain: 0.18, pitch: 1 + (i % 3) * 0.15 })),
  { t: 16.9, type: 'coins', gain: 0.3 },
  { t: 18.5, type: 'wind', gain: 0.45 }, { t: 19.9, type: 'waves', gain: 0.4 }, { t: 20.2, type: 'rain', gain: 0.3 },
  { t: 21.4, type: 'paper', gain: 0.35 }, { t: 22.0, type: 'paper', gain: 0.3 }, { t: 23.2, type: 'drip', gain: 0.35 }, { t: 24.0, type: 'riser', gain: 0.4 }, { t: 24.5, type: 'gong', gain: 0.7 },
  { t: 26.0, type: 'stamp', gain: 0.5 }, { t: 28.2, type: 'coins', gain: 0.35 }, { t: 28.8, type: 'pluck', gain: 0.4 }, { t: 30.2, type: 'slide', gain: 0.35 },
  { t: 31.9, type: 'thud', gain: 0.6 }, { t: 32.1, type: 'thud', gain: 0.4 }, { t: 33.3, type: 'paper', gain: 0.45 }, { t: 34.45, type: 'stamp', gain: 0.9 },
  { t: 36.2, type: 'whoosh', gain: 0.4 }, { t: 36.62, type: 'clank', gain: 0.7 }, { t: 36.65, type: 'splash', gain: 0.6 }, { t: 36.7, type: 'stamp', gain: 0.6 },
  { t: 38.1, type: 'chime', gain: 0.4 }, { t: 39.8, type: 'pop', gain: 0.4 }, { t: 40.8, type: 'chime', gain: 0.5, pitch: 1.3 }, { t: 42.0, type: 'drip', gain: 0.35 }, { t: 42.3, type: 'drip', gain: 0.3 },
  { t: 44.8, type: 'pluck', gain: 0.4 }, { t: 46.2, type: 'riser', gain: 0.4 }, { t: 46.6, type: 'gong', gain: 0.7 },
  { t: 50.0, type: 'pop', gain: 0.8 }, { t: 50.04, type: 'gong', gain: 0.9 },
];

export const music = {
  bpm: 96, root: 'B', maqam: 'hicaz', gain: 0.32,
  sections: [
    { from: 0, to: 6.4, mood: 'intro' },
    { from: 6.4, to: 18.1, mood: 'groove' },
    { from: 18.1, to: 25.7, mood: 'drive' },
    { from: 25.7, to: 31.3, mood: 'groove' },
    { from: 31.3, to: 37.6, mood: 'sad' },
    { from: 37.6, to: 50.0, mood: 'triumph' },
    { from: 50.0, to: 53.3, mood: 'end' },
  ],
};
