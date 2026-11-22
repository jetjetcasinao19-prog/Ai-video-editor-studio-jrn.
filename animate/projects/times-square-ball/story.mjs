// "How the Times Square Ball Drop Started" — an Ottoman miniature chronicle.
// u = seconds since the scene started; S.at('word') = when that word is said.
import { clamp, lerp, ease, tween, rng, TAU, shake, pop } from '../../lib/core.mjs';
import { land, interior, lamp, bookCover, bigSign, medallion } from '../../styles/ottoman/scenes.mjs';

export const meta = {
  title: 'How the Times Square Ball Drop Started',
  slug: 'times-square-ball-ottoman',
  style: 'ottoman',
  look: 'night', // navy-and-gold lacquer page with fireflies: a New Year's Eve story
  room: 'library',
  width: 1080, height: 1920, fps: 30,
  duration: 59.0,
  voice: 'voice.mp3',
  seed: 101,
  captionChars: 30,
  brand: { handle: '@HOWITSTARTED-YT1', logo: '../../../brand/logo.png' },
  outro: { at: 57.0, text: 'Subscribe for more origin stories' },
};

const OCHS = { robe: '#2a2f45', robeP: 'stripes', robePc: '#3f4760', inner: '#f7eed6', sash: '#c4371f', hat: 'shorthair', hair: '#6a5a4a', mustache: true };
const CAPTAIN = { robe: '#20408f', robeP: 'dots', robePc: '#ecd57a', inner: '#f7eed6', sash: '#c9a227', hat: 'cap', hatColor: '#20408f', beard: 'short' };
const OFFICIAL = { robe: '#3a3a40', robeP: 'stripes', robePc: '#55556a', hat: 'turban', hatColor: '#3a3a40', beard: 'short', mustache: true };
const SKINS = ['#f1d1a8', '#c68a5e', '#8a5a3c', '#e2b48a', '#a86c45', '#f1d1a8'];
const FW = ['#ecd57a', '#c4371f', '#6cc3b8', '#f8f2e2', '#a99ac6'];

function cityNight(ctx, S, o = {}) {
  const { k, P, W, H, t } = S;
  k.nightSky(ctx, -60, -60, W + 120, H + 120, t);
  // a skyline of towers
  const R = rng(5);
  for (let i = 0; i < 9; i++) { const x = 40 + i * 110, h = 260 + R() * 260; k.rect(ctx, x - 40, 880 - h, 80, h, ['#3a3f5a', '#4a4f6a', '#2f3550'][i % 3], P.ink, 1.5); for (let r = 1; r < h / 40; r++) for (let c = 0; c < 2; c++) if (R() > 0.4) k.rect(ctx, x - 26 + c * 30, 880 - h + r * 40, 16, 18, P.goldLight, null); }
  if (o.tower !== false) k.wedgeTower(ctx, W / 2, 900, 220, o.towerH ?? 520, 1);
  ctx.fillStyle = '#2a2a33'; ctx.fillRect(-60, 880, W + 120, 400);
}
function crowd(ctx, S, n, y0, u, lookUp = true) {
  const { k, P } = S;
  for (let i = 0; i < n; i++) { const x = 60 + (i * 97) % 880, y = y0 + (i % 3) * 30; k.figure(ctx, x, y, { s: 0.42, face: i % 2 ? -1 : 1, skin: SKINS[i % 6], robe: [P.verm, P.lapis, P.green, P.ochre, P.lav, P.turq][i % 6], robeP: 'dots', hat: i % 3 === 1 ? 'hotoz' : i % 3 === 2 ? 'fez' : 'turban', hatColor: [P.verm, P.lapis, P.green][i % 3], veil: P.white, mood: 'happy', look: lookUp ? -0.4 : 0, armF: [2.4 + Math.sin(u * 5 + i) * 0.3, 0.2] }); }
}

export const scenes = [
  { // 0.0 "The Times Square ball drop exists because fireworks got banned."
    start: 0, title: 'Born From a Ban',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const fw = S.at('fireworks'), bn = S.at('banned');
      cityNight(ctx, S);
      k.timeBall(ctx, W / 2, lerp(180, 300, tween(u, 0.2, 2.5, ease.inOut)), 60, S.t, 1);
      for (let i = 0; i < 4; i++) k.fireworks(ctx, 180 + i * 240, 220 + (i % 2) * 120, 120, (u - fw + 0.4 - i * 0.2) / 1.0, FW[i], i + 3);
      k.stamp(ctx, 'BANNED', W / 2, 620, 80, tween(u, bn, bn + 0.25, ease.linear), -0.12);
    },
  },
  { // 5.9 "1904, New York."
    start: 5.8, title: 'New York · 1904', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const ny = S.at('New');
      S.cam(lerp(1.1, 1.0, tween(u, 0, 2.3)), W / 2, 560);
      k.goldSky(ctx, -60, -60, W + 120, 900, S.t);
      for (let i = 0; i < 3; i++) k.cloud(ctx, 150 + i * 320, 150 + (i % 2) * 60, 1.0, i + 210);
      const R = rng(9);
      for (let i = 0; i < 9; i++) { const x = 40 + i * 110, h = 220 + R() * 240; k.rect(ctx, x - 40, 860 - h, 80, h, [P.ochreLight, P.pink, P.white, '#b5553a'][i % 4], P.ink, 1.5); for (let r = 1; r < h / 44; r++) for (let c = 0; c < 2; c++) k.rect(ctx, x - 26 + c * 30, 860 - h + r * 44, 16, 20, P.lapis, null); }
      k.waves(ctx, -60, 860, W + 120, 240, S.t, P.water, P.waterLight, 20, 22);
      k.galley(ctx, 300, 980, 0.5, S.t, null, Math.sin(u * 1.5) * 0.03);
      k.label(ctx, 'NEW YORK', W / 2, 220, 36, tween(u, ny, ny + 0.3));
      k.seal(ctx, 830, 230, 62, ' NEW YORK · NEW YORK ·', '1904', tween(u, 0.1, 0.4, ease.linear));
    },
  },
  { // 8.3 "The New York Times moves into a brand new tower."
    start: 8.15, title: 'The Times Tower', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const nt = S.at('Times'), tw = S.at('tower');
      k.goldSky(ctx, -60, -60, W + 120, 1100, S.t);
      k.ground(ctx, -60, 880, W + 120, 300, P.sage, 3, 0.3);
      const rise = tween(u, 0.2, tw + 0.2, ease.outCubic);
      ctx.save(); ctx.beginPath(); ctx.rect(-60, -60, W + 120, 940); ctx.clip(); k.wedgeTower(ctx, W / 2, 900, 240, 600 * rise, 0); ctx.restore();
      const np = pop(u, nt - 0.2, 0.35);
      if (np > 0) { ctx.save(); ctx.translate(200, 760); ctx.scale(np, np); k.newspaper(ctx, 0, 0, 220, -0.1, 'A NEW HOME', 'THE NEW YORK TIMES'); ctx.restore(); }
    },
  },
  { // 11.8 "The area gets renamed Times Square."
    start: 11.75, title: 'Times Square', trans: 'wipe',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const rn = S.at('renamed'), ts = S.at('Times');
      k.goldSky(ctx, -60, -60, W + 120, 1100, S.t);
      k.ground(ctx, -60, 880, W + 120, 300, P.sage, 3, 0.3);
      k.wedgeTower(ctx, 760, 900, 200, 520, 0);
      // the old street sign comes down, the new one goes up
      ctx.beginPath(); ctx.moveTo(300, 900); ctx.lineTo(300, 420); k.stroke(ctx, P.ink, 10); k.stroke(ctx, '#3a5a3a', 6);
      const off = tween(u, rn - 0.2, rn + 0.4, ease.inCubic);
      ctx.save(); ctx.globalAlpha = 1 - off; k.streetSign(ctx, 300 - off * 200, 470 + off * 400, 380, 'LONGACRE SQ', P.green, -off * 1.2); ctx.restore();
      const on = tween(u, ts - 0.3, ts + 0.2, ease.outBack);
      if (on > 0) { ctx.save(); ctx.translate(300, 470); ctx.scale(on, on); k.streetSign(ctx, 0, 0, 400, 'TIMES SQ', P.verm); ctx.restore(); }
    },
  },
  { // 15.3 "To celebrate New Year's Eve, the newspaper's owner, Adolph Ochs, sets off fireworks from the roof."
    start: 15.1, title: "New Year's Eve Fireworks", trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const ny = S.at('New'), ad = S.at('Adolph'), so = S.at('sets'), rf = S.at('roof');
      cityNight(ctx, S);
      k.figure(ctx, W / 2, 380 - 0, { ...OCHS, s: 0.5, face: 1, mood: 'happy', armF: [2.6, 0.1] });
      for (let i = 0; i < 7; i++) k.fireworks(ctx, 160 + (i * 137) % 760, 150 + (i % 3) * 90, 110, (u - so + 0.2 - i * 0.25) / 0.9, FW[i % 5], i + 11);
      k.label(ctx, "NEW YEAR'S EVE", W / 2, 960, 28, tween(u, ny, ny + 0.3));
      k.label(ctx, 'ADOLPH OCHS', W / 2, 260, 24, tween(u, ad, ad + 0.3) * (1 - tween(u, so, so + 0.3)));
    },
  },
  { // 21.9 "Huge crowds show up."
    start: 21.8, title: 'Huge Crowds', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      cityNight(ctx, S);
      for (let i = 0; i < 4; i++) k.fireworks(ctx, 200 + i * 220, 160 + (i % 2) * 100, 110, ((u + i * 0.4) % 1.3) / 0.9, FW[i], i + 21);
      crowd(ctx, S, 18, 960, u);
    },
  },
  { // 24.5 "Then the city bans the fireworks."
    start: 24.2, title: 'Fireworks Banned', trans: 'flash',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const bn = S.at('bans');
      cityNight(ctx, S);
      // the last fireworks fizzle out
      for (let i = 0; i < 3; i++) k.fireworks(ctx, 220 + i * 260, 200, 90 * (1 - tween(u, bn, bn + 0.5)), (u + i * 0.3) / 0.9, FW[i], i + 31);
      k.figure(ctx, 760, 1010, { ...OFFICIAL, s: 1.0, face: -1, mood: 'calm', armF: [lerp(0.6, 2.2, tween(u, bn - 0.4, bn)), 0.1], hold: c => { c.rotate(-1.5); k.rect(c, -30, -90, 60, 100, P.paperLight, P.ink, 2); } });
      k.stamp(ctx, 'NO FIREWORKS', W / 2 - 80, 470, 64, tween(u, bn, bn + 0.25, ease.linear), -0.12);
    },
  },
  { // 27.3 "So Ochs needs a new idea. He borrows one from sailors."
    start: 27.1, title: 'A New Idea', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const id = S.at('idea'), sa = S.at('sailors');
      interior(ctx, S, { window: true, carpetColor: P.lapis });
      lamp(ctx, S, W / 2, 230, tween(u, id - 0.1, id + 0.2));
      if (u > id) for (let i = 0; i < 12; i++) { const a = i / 12 * TAU, r = 60 + (u - id) * 300; k.star(ctx, W / 2 + Math.cos(a) * r, 230 + Math.sin(a) * r * 0.6, 10, 1 - (u - id) * 0.7); }
      k.figure(ctx, 280, 1010, { ...OCHS, s: 1.2, face: 1, mood: u > id ? 'happy' : 'calm', armF: [u > id ? 2.5 : 1.2, 0.3] });
      const sp = pop(u, sa - 0.2, 0.35);
      if (sp > 0) { ctx.save(); ctx.translate(680, 740); ctx.scale(sp, sp); k.circle(ctx, 0, -40, 150, P.paperLight, P.goldLight, 6); ctx.save(); ctx.beginPath(); ctx.arc(0, -40, 144, 0, TAU); ctx.clip(); k.waves(ctx, -150, 0, 300, 120, S.t, P.water, P.waterLight, 16, 18); k.galley(ctx, 0, 20, 0.45, S.t); ctx.restore(); ctx.restore();  }
    },
  },
  { // 32.0 "For decades, ships set their clocks by watching time balls drop from towers at an exact time."
    start: 31.9, title: 'Time Balls', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const sh = S.at('ships'), cl = S.at('clocks'), dr = S.at('drop'), ex = S.at('exact');
      k.goldSky(ctx, -60, -60, W + 120, H + 120, S.t);
      k.waves(ctx, -60, 640, W + 120, 480, S.t, P.water, P.waterLight, 22, 26);
      // a harbor tower with a mast and its ball
      k.rect(ctx, 120, 300, 120, 360, P.paperDark, P.ink, 2.5); k.dome(ctx, 180, 300, 56, P.lapisLight);
      ctx.beginPath(); ctx.moveTo(180, 200); ctx.lineTo(180, 40); k.stroke(ctx, P.ink, 6);
      const bd = tween(u, dr - 0.1, dr + 0.4, ease.inCubic);
      k.circle(ctx, 180, lerp(60, 180, bd), 30, P.verm, P.ink, 2.5);
      k.galley(ctx, 640, 820, 1.0, S.t, null, Math.sin(u * 1.4) * 0.03);
      k.figure(ctx, 620, 790, { ...CAPTAIN, s: 0.55, face: -1, mood: 'calm', armF: [2.2, -0.2], hold: c => { c.rotate(-1.9); k.rect(c, -4, -6, 60, 12, P.gold, P.ink, 1.5); } });
      // the captain's clock, set at the exact moment
      const cp = pop(u, cl - 0.2, 0.35);
      if (cp > 0) { ctx.save(); ctx.translate(820, 330); ctx.scale(cp, cp); k.clockFace(ctx, 0, 0, 90, 1, u > dr ? 0 : 58 + tween(u, cl, dr) * 2); ctx.restore(); }
    },
  },
  { // 39.1 "On December 31st, 1907, a 700-pound ball of iron and wood, covered in 100 light bulbs, drops at midnight."
    start: 38.9, title: 'Dec 31, 1907', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const de = S.at('December'), lb = S.at('700-pound'), iw = S.at('iron'), lt = S.at('light'), dp = S.at('drops'), mn = S.at('midnight');
      cityNight(ctx, S, { towerH: 520 });
      const top = 900 - 520 - 200, drop = tween(u, dp - 0.2, mn + 0.4, ease.inOut);
      const by = lerp(top, top + 180, drop);
      const lit = tween(u, lt - 0.2, lt + 0.3);
      k.timeBall(ctx, W / 2, by, 62, S.t, 0.25 + 0.75 * lit, Math.floor(100 * lit));
      // the facts, one by one
      k.label(ctx, '700 POUNDS', 230, 300, 22, tween(u, lb, lb + 0.3));
      k.label(ctx, 'IRON & WOOD', 850, 300, 22, tween(u, iw, iw + 0.3));
      k.label(ctx, '100 LIGHT BULBS', 230, 420, 22, tween(u, lt, lt + 0.3));
      const cp = pop(u, de - 0.2, 0.35);
      if (cp > 0) { ctx.save(); ctx.translate(850, 470); ctx.scale(cp, cp); k.calendarPage(ctx, 0, 0, 120, 'DEC', 31, 0.06); ctx.restore(); }
      if (u > mn) { for (let i = 0; i < 16; i++) { const a = i / 16 * TAU, r = 90 + (u - mn) * 400; k.star(ctx, W / 2 + Math.cos(a) * r, by + Math.sin(a) * r, 12, 1 - (u - mn) * 0.7); }  }
      crowd(ctx, S, 12, 1040, u);
      k.seal(ctx, 150, 600, 56, ' THE FIRST DROP · 1907 ·', '1907', tween(u, S.at('1907'), S.at('1907') + 0.3, ease.linear));
    },
  },
  { // 49.2 "A party trick now watched by millions every year."
    start: 48.9, title: 'Watched by Millions', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const pt = S.at('party'), mi = S.at('millions');
      S.cam(lerp(1.08, 1.0, tween(u, 0, 5)), W / 2, 540);
      k.nightSky(ctx, -60, -60, W + 120, H + 120, S.t);
      k.timeBall(ctx, W / 2, 200, 70, S.t, 1, 100);
      // homes everywhere light up: every window is watching the drop
      const rows = [[660, 0.95], [990, 1.1]];
      let n = 0;
      rows.forEach(([base, sc], r) => {
        for (let i = 0; i < 4; i++) {
          const x = 150 + i * 260 + (r % 2) * 50 - 25, w = 170 * sc, h = 170 * sc, on = tween(u, pt + 0.2 + n * 0.25, pt + 0.45 + n * 0.25); n++;
          k.gableHouse(ctx, x, base, w, h, [P.ochreLight, P.pink, P.paperLight, '#d9a88a', P.sage][(i + r) % 5]);
          for (let rr = 0; rr < 2; rr++) for (let c = 0; c < 2; c++) {
            const wx = x - w * 0.3 + c * w * 0.38, wy = base - h * 0.85 + rr * h * 0.38;
            if (on > 0) { ctx.save(); ctx.globalAlpha = on; k.rect(ctx, wx, wy, w * 0.2, h * 0.24, P.goldLight, P.ink, 1.3); ctx.restore(); }
          }
          if (on > 0) k.timeBall(ctx, x - w * 0.2, base - h * 0.85 + h * 0.12, 10 * sc * on, S.t, 0.8, 20);
        }
      });
      ctx.fillStyle = '#2a2a33'; ctx.fillRect(-60, 1000, W + 120, 200);
    },
  },
  { // 54.4 "Every legend has a beginning."
    start: 54.2, title: 'Every Legend Has a Beginning', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W, H } = S, beg = S.at('beginning');
      ctx.save(); S.cam(lerp(1.0, 1.4, tween(u, 0, beg)), W / 2, lerp(600, 420, tween(u, 0, beg)));
      cityNight(ctx, S);
      k.timeBall(ctx, W / 2, 400, 62, S.t, 1, 100);
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
const bangs = (from, n, gap, gain = 0.5) => Array.from({ length: n }, (_, i) => ({ t: +(from + i * gap).toFixed(3), type: 'thud', gain }));
export const sfx = [
  ...scenes.slice(1).map(s => ({ t: s.start - 0.05, type: s.trans === 'unroll' ? 'paper' : 'whoosh', gain: 0.35 })),
  { t: 0.4, type: 'chime', gain: 0.4 }, ...bangs(2.8, 4, 0.2, 0.45), ...pops(2.9, 6, 0.12, 0.3), { t: 4.18, type: 'stamp', gain: 0.9 },
  { t: 6.0, type: 'stamp', gain: 0.5 }, { t: 7.06, type: 'waves', gain: 0.3 },
  { t: 8.8, type: 'riser', gain: 0.35 }, { t: 10.74, type: 'gong', gain: 0.5 },
  { t: 12.62, type: 'slide', gain: 0.4 }, { t: 12.9, type: 'thud', gain: 0.4 }, { t: 13.24, type: 'stamp', gain: 0.6 },
  { t: 15.72, type: 'chime', gain: 0.5 }, { t: 18.12, type: 'pluck', gain: 0.5 }, ...bangs(19.4, 7, 0.25, 0.4), ...pops(19.5, 10, 0.15, 0.25),
  ...bangs(21.9, 5, 0.45, 0.3), { t: 22.3, type: 'coins', gain: 0.2 },
  { t: 25.08, type: 'stamp', gain: 0.9 }, { t: 25.2, type: 'flop', gain: 0.4 },
  { t: 28.4, type: 'gong', gain: 0.5 }, { t: 28.45, type: 'chime', gain: 0.5 }, { t: 30.62, type: 'waves', gain: 0.35 },
  { t: 32.5, type: 'waves', gain: 0.3 }, { t: 33.6, type: 'clank', gain: 0.4 }, { t: 35.5, type: 'slide', gain: 0.45 }, { t: 35.9, type: 'thud', gain: 0.6 }, { t: 37.74, type: 'chime', gain: 0.5, pitch: 1.4 },
  { t: 39.62, type: 'pop', gain: 0.5 }, { t: 41.9, type: 'thud', gain: 0.5 }, { t: 43.62, type: 'clank', gain: 0.4 }, { t: 46.1, type: 'chime', gain: 0.5, pitch: 1.5 }, ...pops(46.2, 8, 0.06, 0.25),
  { t: 47.3, type: 'riser', gain: 0.5 }, { t: 47.94, type: 'gong', gain: 0.9 }, ...bangs(48.0, 6, 0.18, 0.35),
  ...pops(49.6, 8, 0.2, 0.3), { t: 51.28, type: 'chime', gain: 0.5 },
  { t: 55.82, type: 'pop', gain: 0.8 }, { t: 55.86, type: 'gong', gain: 0.9 },
];

export const music = {
  bpm: 100, root: 'G', maqam: 'hicaz', gain: 0.32,
  sections: [
    { from: 0, to: 5.8, mood: 'intro' },
    { from: 5.8, to: 24.2, mood: 'groove' },
    { from: 24.2, to: 27.1, mood: 'sad' },
    { from: 27.1, to: 38.9, mood: 'drive' },
    { from: 38.9, to: 55.82, mood: 'triumph' },
    { from: 55.82, to: 59.0, mood: 'end' },
  ],
};
