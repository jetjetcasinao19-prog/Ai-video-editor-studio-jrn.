// "How OK Started" — an Ottoman miniature chronicle of a newspaper joke.
// u = seconds since the scene started; S.at('word') = when that word is said.
import { clamp, lerp, ease, tween, rng, TAU, shake, pop } from '../../lib/core.mjs';
import { land, interior, lamp, bookCover, bigSign, medallion, compassRose } from '../../styles/ottoman/scenes.mjs';

export const meta = {
  title: 'How OK Started',
  slug: 'ok-ottoman',
  style: 'ottoman',
  look: 'album',
  room: 'library',
  width: 1080, height: 1920, fps: 30,
  duration: 59.8,
  voice: 'voice.mp3',
  seed: 79,
  captionChars: 30,
  brand: { handle: '@HOWITSTARTED-YT1', logo: '../../../brand/logo.png' },
  outro: { at: 59.25, text: 'Subscribe for more origin stories' },
};

const VAN = { robe: '#2a2f45', robeP: 'stripes', robePc: '#3f4760', inner: '#f7eed6', sash: '#c4371f', hat: 'shorthair', hair: '#bdb6a8', beard: 'chin', beardColor: '#c9b8a0' };
const RESEARCHER = { robe: '#7a5a3a', robeP: 'dots', robePc: '#5e4630', inner: '#f7eed6', sash: '#20408f', hat: 'shorthair', hair: '#d9d4c8', glasses: true, mustache: true, mustacheColor: '#d9d4c8' };
const EDITOR = { robe: '#20408f', robeP: 'cintamani', robePc: '#ecd57a', hat: 'turban', hatColor: '#c4371f', mustache: true };
const SKINS = ['#f1d1a8', '#c68a5e', '#8a5a3c', '#e2b48a', '#a86c45', '#f1d1a8'];
const FAD = [['O.W.', 'OLL WRIGHT'], ['K.Y.', 'KNOW YUSE'], ['N.S.', 'NUFF SED']];

function okMedal(ctx, S, x, y, r, sc = 1, glow = 0) {
  const { k, P } = S;
  if (sc <= 0) return;
  if (glow > 0) { const g = ctx.createRadialGradient(x, y, r * 0.2, x, y, r * 2.2); g.addColorStop(0, `rgba(255,240,170,${0.7 * glow})`); g.addColorStop(1, 'rgba(255,240,170,0)'); ctx.fillStyle = g; ctx.fillRect(x - r * 2.3, y - r * 2.3, r * 4.6, r * 4.6); }
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  k.circle(ctx, 0, 0, r, P.lapis, P.goldLight, Math.max(4, r * 0.06)); k.circle(ctx, 0, 0, r * 0.86, null, P.goldLight, 2);
  ctx.font = `900 ${Math.round(r * 0.9)}px Deco`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineWidth = r * 0.06; ctx.strokeStyle = P.ink; ctx.strokeText('OK', 0, r * 0.06);
  ctx.fillStyle = P.goldLight; ctx.fillText('OK', 0, r * 0.06);
  ctx.restore();
}
function worldLands(ctx, S) {
  const { k, P, W, H } = S;
  ctx.fillStyle = '#efdcb0'; ctx.fillRect(-100, -100, W + 200, H + 200);
  compassRose(ctx, k, P, W / 2, 540, 90, S.t * 0.05);
  const land1 = [[60, 120], [260, 90], [380, 160], [330, 260], [400, 320], [310, 420], [250, 470], [300, 560], [380, 640], [340, 800], [260, 960], [200, 1000], [180, 820], [120, 640], [150, 520], [90, 400], [40, 260]];
  const land2 = [[620, 60], [900, 50], [920, 220], [860, 300], [900, 360], [940, 520], [880, 760], [760, 900], [700, 760], [620, 560], [600, 440], [660, 380], [600, 300], [640, 200]];
  for (const pts of [land1, land2]) { ctx.beginPath(); k.smoothPath(ctx, pts); k.fillStroke(ctx, '#cdb57a', P.ink, 2.5); }
}

export const scenes = [
  { // 0.0 "OK is one of the most used words on earth, and it started as a joke."
    start: 0, title: 'The Most Used Word',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const mu = S.at('most'), jk = S.at('joke');
      k.goldSky(ctx, -60, -60, W + 120, 1300, S.t);
      okMedal(ctx, S, W / 2, 470, 190, pop(u, 0, 0.4), 0.6);
      // people everywhere saying it
      const spots = [[150, 170, 1], [800, 180, -1], [110, 800, 1], [830, 790, -1], [470, 900, 1], [260, 720, 1], [690, 700, -1]];
      spots.forEach(([x, y, f], i) => { const p = pop(u, mu - 0.6 + i * 0.22, 0.3); if (p <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(p, p); k.speechBubble(ctx, 0, 0, 'OK', 30, f); ctx.restore(); });
      for (let i = 0; i < 5; i++) k.figure(ctx, 120 + i * 175, 1030, { s: 0.55, face: i < 2 ? 1 : -1, skin: SKINS[i], robe: [P.green, P.verm, P.lav, P.ochre, P.lapisLight][i], robeP: 'dots', hat: i % 2 ? 'hotoz' : 'turban', hatColor: [P.verm, P.lapis, P.green][i % 3], veil: P.white, mood: 'happy', armF: [2.2, 0.3] });
      k.stamp(ctx, 'A JOKE', W / 2, 720, 64, tween(u, jk, jk + 0.25, ease.linear), -0.12);
    },
  },
  { // 6.9 "1830s, Boston."
    start: 6.8, title: 'Boston · 1830s', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const bo = S.at('Boston');
      S.cam(lerp(1.1, 1.0, tween(u, 0, 2.6)), W / 2, 560);
      land(ctx, S, { horizon: 320, seed: 161, clouds: 3, hillColors: [P.sageLight, P.lavLight, P.rose] });
      for (let i = 0; i < 6; i++) k.house(ctx, 90 + i * 155, 560, 130, 120, { wall: ['#b5553a', P.white, '#a8473a', P.ochreLight][i % 4], roof: P.ink, chimney: true });
      k.dome(ctx, 470, 430, 46, P.goldLight);
      k.waves(ctx, -60, 640, W + 120, 420, S.t, P.water, P.waterLight, 22, 26);
      k.galley(ctx, 300, 860, 0.8, S.t, null, Math.sin(u * 1.5) * 0.03);
      k.galley(ctx, 760, 780, 0.55, S.t + 1, null, Math.sin(u * 1.5 + 1) * 0.03);
      k.label(ctx, 'BOSTON', W / 2, 260, 36, tween(u, bo, bo + 0.3));
      k.seal(ctx, 830, 230, 62, ' BOSTON · MASSACHUSETTS ·', '1830s', tween(u, 0.1, 0.4, ease.linear));
    },
  },
  { // 9.5 "Newspapers have a trend. Joke abbreviations of misspelled words."
    start: 9.4, title: 'A Newspaper Trend', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const tr = S.at('trend'), ab = S.at('abbreviations');
      interior(ctx, S, { window: true, carpetColor: P.green });
      k.printingPress(ctx, 250, 960, 1.1, (Math.sin(u * 5) + 1) / 2);
      // papers fly out, each with a joke abbreviation
      FAD.forEach(([abbr, full], i) => {
        const q = tween(u, tr - 0.4 + i * 0.55, tr + 0.4 + i * 0.55, ease.outCubic);
        if (q <= 0) return;
        const x = lerp(250, 560 + (i % 2) * 220, q), y = lerp(820, 300 + i * 200, q);
        ctx.save(); ctx.translate(x, y); ctx.rotate((i - 1) * 0.08);
        k.rect(ctx, -150, -80, 300, 160, '#f1ead8', P.ink, 2);
        ctx.fillStyle = P.verm; ctx.font = '900 54px Deco'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(abbr, 0, -18);
        ctx.fillStyle = P.ink; ctx.font = 'italic 700 26px GaramondItalic'; ctx.fillText('“' + full.toLowerCase() + '”', 0, 40);
        ctx.restore();
      });
    },
  },
  { // 14.7 "On March 23rd, 1839, the Boston Morning Post prints OK,"
    start: 14.5, title: 'Boston Morning Post · 1839', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const ok = S.at('OK');
      ctx.fillStyle = P.paperLight; ctx.fillRect(-60, -60, W + 120, H + 120);
      ctx.fillStyle = k.pattern(ctx, 'flowers', P.paperLight, '#e6d6ad', 40); ctx.fillRect(-60, -60, W + 120, H + 120);
      S.cam(lerp(1.0, 1.25, tween(u, ok - 0.6, ok + 0.4, ease.inOut)), W / 2, lerp(540, 600, tween(u, ok - 0.6, ok + 0.4)));
      k.rect(ctx, 130, 110, 680, 880, '#f1ead8', P.ink, 3);
      ctx.fillStyle = P.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = '900 40px Fell'; ctx.fillText('BOSTON MORNING POST', W / 2, 170);
      ctx.font = '700 22px Fell'; ctx.fillText('SATURDAY, MARCH 23, 1839', W / 2, 215);
      ctx.beginPath(); ctx.moveTo(160, 240); ctx.lineTo(780, 240); k.stroke(ctx, P.ink, 3);
      for (let c = 0; c < 3; c++) for (let i = 0; i < 18; i++) { if (c === 1 && i > 6 && i < 12) continue; ctx.beginPath(); ctx.moveTo(170 + c * 210, 280 + i * 38); ctx.lineTo(360 + c * 210, 280 + i * 38); k.stroke(ctx, P.grey, 2); }
      // the famous line, printed on "OK"
      const pr = tween(u, ok - 0.1, ok + 0.15, ease.outCubic);
      if (pr > 0) { ctx.save(); ctx.translate(W / 2, 640); ctx.scale(lerp(1.6, 1, pr), lerp(1.6, 1, pr)); ctx.globalAlpha = pr; ctx.fillStyle = P.ink; ctx.font = '900 92px Fell'; ctx.fillText('o.k.', 0, 0); ctx.font = 'italic 700 30px GaramondItalic'; ctx.fillText('— all correct —', 0, 70); ctx.restore(); }
      k.seal(ctx, 820, 980, 64, ' MARCH 23 · MARCH 23 ·', '1839', tween(u, S.at('1839'), S.at('1839') + 0.3, ease.linear));
    },
  },
  { // 20.5 "…short for All Correct, spelled wrong on purpose."
    start: 19.8, title: '“Oll Korrect”', trans: 'flash',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const ac = S.at('All'), wr = S.at('wrong'), pu = S.at('purpose');
      k.goldSky(ctx, -60, -60, W + 120, H + 120, S.t);
      // ALL CORRECT → OLL KORRECT: the joke spelling takes over
      const sw = tween(u, wr - 0.3, wr + 0.3);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '900 96px Deco';
      const line = (txt, y, col, a = 1) => { ctx.save(); ctx.globalAlpha = a; ctx.lineWidth = 10; ctx.strokeStyle = P.ink; ctx.strokeText(txt, W / 2, y); ctx.fillStyle = col; ctx.fillText(txt, W / 2, y); ctx.restore(); };
      line('ALL', 330, P.paperLight, tween(u, ac - 0.2, ac + 0.1) * (1 - sw)); line('CORRECT', 460, P.paperLight, tween(u, ac - 0.2, ac + 0.1) * (1 - sw));
      line('OLL', 330, P.verm, sw); line('KORRECT', 460, P.verm, sw);
      if (sw > 0.5) { for (const [x, y] of [[W / 2 - 115, 330], [W / 2 - 205, 460]]) { ctx.beginPath(); ctx.arc(x, y, 62, 0, TAU); k.stroke(ctx, P.goldLight, 6); } }
      okMedal(ctx, S, W / 2, 760, 120, pop(u, wr + 0.2, 0.4), 0.5);
    },
  },
  { // 25.6 "Most of these jokes died fast."
    start: 25.4, title: 'Most Jokes Died', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const di = S.at('died');
      interior(ctx, S, { window: false, carpetColor: P.vermDark });
      ctx.save(); ctx.fillStyle = 'rgba(30,35,60,0.3)'; ctx.fillRect(-60, -60, W + 120, H + 120); ctx.restore();
      FAD.forEach(([abbr], i) => {
        const f = tween(u, di - 0.3 + i * 0.2, di + 0.6 + i * 0.2, ease.inCubic);
        ctx.save(); ctx.globalAlpha = 1 - f; ctx.translate(200 + i * 270, 480 + f * 380); ctx.rotate(f * (i - 1) * 1.2);
        k.rect(ctx, -110, -70, 220, 140, '#f1ead8', P.ink, 2); ctx.fillStyle = P.grey; ctx.font = '900 54px Deco'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(abbr, 0, 4);
        ctx.restore();
      });
      k.cobweb(ctx, 0, 74, 160, 0); k.cobweb(ctx, W, 74, 160, 1);
      k.label(ctx, 'FORGOTTEN', W / 2, 260, 32, tween(u, di + 0.3, di + 0.6));
    },
  },
  { // 28.1 "OK didn't."
    start: 27.9, title: "OK Didn't", trans: 'flash',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      k.goldSky(ctx, -60, -60, W + 120, H + 120, S.t);
      ctx.save(); ctx.translate(W / 2, 540); for (let i = 0; i < 24; i++) { ctx.rotate(TAU / 24); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-30, 900); ctx.lineTo(30, 900); ctx.closePath(); ctx.fillStyle = 'rgba(255,250,210,0.3)'; ctx.fill(); } ctx.restore();
      okMedal(ctx, S, W / 2, 540, 220, pop(u, 0.0, 0.45), 1);
      for (let i = 0; i < 16; i++) { const a = i / 16 * TAU, r = 260 + u * 220; k.star(ctx, W / 2 + Math.cos(a) * r, 540 + Math.sin(a) * r, 12, 1 - u * 0.4); }
    },
  },
  { // 30.1 "In 1840, President Martin Van Buren runs for re-election."
    start: 29.9, title: 'Van Buren · 1840', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const mv = S.at('Martin'), re = S.at('re-election');
      S.cam(lerp(1.06, 1.0, tween(u, 0, 4)), W / 2, 560);
      land(ctx, S, { horizon: 330, seed: 163, clouds: 3 });
      k.canopy(ctx, W / 2, 400, 520, 300, P.lapis, S.t);
      k.figure(ctx, W / 2, 1000, { ...VAN, s: 1.25, face: 1, mood: 'happy', armF: [2.3, 0.2] });
      k.label(ctx, 'MARTIN VAN BUREN', W / 2, 560, 28, tween(u, mv, mv + 0.3));
      const bn = tween(u, re - 0.2, re + 0.3, ease.outBack);
      if (bn > 0) { ctx.save(); ctx.translate(W / 2, 300); ctx.scale(bn, bn); k.cartouche(ctx, 0, 0, 500, 90, P.verm, P.goldLight, 5); ctx.fillStyle = P.goldLight; ctx.font = '900 44px Deco'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('RE-ELECT', 0, 3); ctx.restore(); }
      k.seal(ctx, 820, 900, 64, ' ELECTION YEAR · 1840 ·', '1840', tween(u, S.at('1840'), S.at('1840') + 0.3, ease.linear));
    },
  },
  { // 34.3 "His nickname? Old Kinderhook, after his hometown in New York."
    start: 34.1, title: 'Old Kinderhook', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const ol = S.at('Old'), ho = S.at('hometown');
      S.cam(lerp(1.08, 1.0, tween(u, 0, 4.8)), W / 2, 560);
      land(ctx, S, { horizon: 380, seed: 165, clouds: 3, hillColors: [P.sageLight, P.green, P.lavLight] });
      for (let i = 0; i < 5; i++) k.house(ctx, 120 + i * 180, 700 + (i % 2) * 40, 120, 90, { wall: [P.white, P.ochreLight, P.pink][i % 3], roof: P.verm });
      k.blossomTree(ctx, 860, 980, 260, S.t, 3, P.green);
      medallion(ctx, k, P, '?', W / 2, 260, pop(u, 0.1, 0.35) * (1 - tween(u, ol - 0.2, ol)));
      // the nickname, with its two initials lit in gold
      const nk = tween(u, ol - 0.1, ol + 0.3, ease.outBack);
      if (nk > 0) {
        ctx.save(); ctx.translate(W / 2, 270); ctx.scale(nk, nk); k.cartouche(ctx, 0, 0, 780, 130, P.paperLight, P.goldDark, 5);
        ctx.font = '900 62px Deco'; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
        const parts = [['O', P.verm], ['LD ', P.ink], ['K', P.verm], ['INDERHOOK', P.ink]];
        let tw = parts.reduce((a, [t]) => a + ctx.measureText(t).width, 0), x = -tw / 2;
        for (const [t, c] of parts) { ctx.fillStyle = c; ctx.fillText(t, x, 4); x += ctx.measureText(t).width; }
        ctx.restore();
      }
      k.label(ctx, 'KINDERHOOK · NEW YORK', W / 2, 1000, 24, tween(u, ho, ho + 0.3));
    },
  },
  { // 39.2 "His fans form OK Clubs."
    start: 39.0, title: 'The OK Clubs', trans: 'wipe',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const cl = S.at('Clubs');
      land(ctx, S, { horizon: 330, seed: 167, clouds: 2 });
      for (let i = 0; i < 6; i++) {
        const x = lerp(-120 - i * 150, 1000 - i * 150, u / 3.2) , y = 960 - (i % 2) * 40;
        k.figure(ctx, x, y, { s: 0.7, face: 1, skin: SKINS[i], robe: [P.verm, P.lapis, P.green, P.ochre, P.lav, P.vermDark][i], robeP: 'dots', hat: 'turban', hatColor: [P.white, P.verm, P.lapis][i % 3], mood: 'happy', walk: u * 8 + i, armF: [2.7, 0.1], hold: i % 2 ? c => { c.rotate(-1.6); k.rect(c, -3, -10, 6, 90, P.brown, P.ink, 1); k.rect(c, -40, -70, 80, 56, P.paperLight, P.ink, 1.5); c.fillStyle = P.verm; c.font = '900 30px Deco'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('O.K.', 0, -42); } : null });
        if (i % 2 === 0) k.drum(ctx, x + 50, y - 120, 0.6, S.t + i);
      }
      const bn = tween(u, cl - 0.3, cl + 0.2, ease.outBack);
      if (bn > 0) { ctx.save(); ctx.translate(W / 2, 300); ctx.scale(bn, bn); k.cartouche(ctx, 0, 0, 560, 110, P.lapis, P.goldLight, 6); ctx.fillStyle = P.goldLight; ctx.font = '900 56px Deco'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('O.K. CLUB', 0, 4); ctx.restore(); }
    },
  },
  { // 42.4 "Van Buren loses, but the word wins."
    start: 42.2, title: 'The Word Wins', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const lo = S.at('loses'), wi = S.at('wins');
      k.goldSky(ctx, -60, -60, W + 120, H + 120, S.t);
      k.carpet(ctx, 100, 860, W - 200, 180, P.vermDark, P.lapis);
      k.figure(ctx, 240, 1010, { ...VAN, s: 1.1, face: 1, mood: u > lo ? 'sad' : 'calm', look: u > lo ? 0.5 : 0, armF: [0.3, 0.3] });
      k.stamp(ctx, 'LOST', 240, 560, 60, tween(u, lo, lo + 0.25, ease.linear), -0.15);
      const rise = tween(u, wi - 0.5, wi + 0.3, ease.outBack);
      okMedal(ctx, S, 680, lerp(900, 480, rise), 150, rise, rise);
    },
  },
  { // 46.3 "In the 1960s, a language researcher traced it back to that one newspaper joke."
    start: 46.1, title: 'Traced Back · 1960s', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const la = S.at('language'), tr = S.at('traced'), jk = S.at('joke');
      S.cam(lerp(1.0, 1.3, tween(u, tr, jk + 0.4, ease.inOut)), lerp(W / 2, 620, tween(u, tr, jk + 0.4)), lerp(560, 640, tween(u, tr, jk + 0.4)));
      interior(ctx, S, { window: true, carpetColor: P.lapis });
      lamp(ctx, S, 760, 230, 1);
      // stacks of old papers, one opened under the glass
      for (let i = 0; i < 4; i++) for (let j = 0; j < 6; j++) k.rect(ctx, 80 + i * 70, 960 - j * 16, 60, 14, j % 2 ? '#e6dcc4' : '#f1ead8', P.ink, 1);
      k.rect(ctx, 480, 560, 300, 360, '#f1ead8', P.ink, 2);
      ctx.fillStyle = P.ink; ctx.font = '900 20px Fell'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('BOSTON MORNING POST', 630, 590); ctx.font = '700 14px Fell'; ctx.fillText('MARCH 23, 1839', 630, 614);
      for (let i = 0; i < 10; i++) { ctx.beginPath(); ctx.moveTo(500, 640 + i * 26); ctx.lineTo(760, 640 + i * 26); k.stroke(ctx, P.grey, 1.5); }
      ctx.fillStyle = P.ink; ctx.font = '900 40px Fell'; ctx.fillText('o.k.', 630, 770);
      const mg = tween(u, tr - 0.3, tr + 0.6, ease.inOut);
      k.magnifier(ctx, lerp(800, 630, mg), lerp(960, 770, mg), 70);
      k.figure(ctx, 330, 1010, { ...RESEARCHER, s: 1.15, face: 1, mood: u > jk ? 'happy' : 'calm', armF: [1.6, 0.2] });
      k.seal(ctx, 160, 240, 60, ' TRACED BACK · TRACED ·', '1960s', tween(u, S.at('1960s'), S.at('1960s') + 0.3, ease.linear));
    },
  },
  { // 51.8 "A silly spelling joke that the whole world now says."
    start: 51.5, title: 'The Whole World Says It', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const wh = S.at('whole');
      S.cam(lerp(1.1, 1.0, tween(u, 0, 4)), W / 2, 540);
      worldLands(ctx, S);
      const spots = [[230, 250], [300, 640], [220, 880], [760, 170], [800, 420], [770, 720], [160, 420], [680, 600], [520, 300], [430, 820]];
      spots.forEach(([x, y], i) => { const p = pop(u, wh - 1.2 + i * 0.14, 0.3); if (p <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(p, p); k.speechBubble(ctx, 0, 0, 'OK', 26, i % 2 ? 1 : -1); ctx.restore(); });
      okMedal(ctx, S, W / 2, 540, 90, pop(u, 0.2, 0.4), 0.6);
    },
  },
  { // 56.9 "Every legend has a beginning."
    start: 56.6, title: 'Every Legend Has a Beginning', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W, H } = S, beg = S.at('beginning');
      ctx.fillStyle = P.paperLight; ctx.fillRect(-60, -60, W + 120, H + 120);
      ctx.save(); S.cam(lerp(1.0, 1.4, tween(u, 0, beg)), W / 2, 600);
      k.rect(ctx, 230, 300, 480, 600, '#f1ead8', P.ink, 3);
      ctx.fillStyle = P.ink; ctx.font = '900 26px Fell'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('BOSTON MORNING POST', W / 2, 340);
      const g = ctx.createRadialGradient(W / 2, 600, 10, W / 2, 600, 200); g.addColorStop(0, 'rgba(255,240,170,0.85)'); g.addColorStop(1, 'rgba(255,240,170,0)'); ctx.fillStyle = g; ctx.fillRect(W / 2 - 220, 380, 440, 440);
      ctx.fillStyle = P.ink; ctx.font = '900 110px Fell'; ctx.fillText('o.k.', W / 2, 600);
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
const drums = (from, n, gap) => Array.from({ length: n }, (_, i) => ({ t: +(from + i * gap).toFixed(3), type: 'thud', gain: 0.35 }));
export const sfx = [
  ...scenes.slice(1).map(s => ({ t: s.start - 0.05, type: s.trans === 'unroll' ? 'paper' : 'whoosh', gain: 0.35 })),
  { t: 0.1, type: 'gong', gain: 0.5 }, ...pops(0.9, 7, 0.22, 0.4), { t: 5.4, type: 'stamp', gain: 0.8 },
  { t: 7.0, type: 'waves', gain: 0.3 }, { t: 7.92, type: 'chime', gain: 0.4 },
  { t: 10.2, type: 'clank', gain: 0.35 }, { t: 10.6, type: 'paper', gain: 0.4 }, { t: 11.2, type: 'paper', gain: 0.4 }, { t: 11.7, type: 'paper', gain: 0.4 },
  { t: 15.86, type: 'stamp', gain: 0.5 }, { t: 18.92, type: 'stamp', gain: 0.9 }, { t: 18.95, type: 'chime', gain: 0.4 },
  { t: 20.94, type: 'chime', gain: 0.4 }, { t: 23.0, type: 'slide', gain: 0.4 }, { t: 23.2, type: 'pop', gain: 0.6 }, { t: 23.94, type: 'pluck', gain: 0.5, pitch: 1.3 },
  { t: 26.42, type: 'flop', gain: 0.55 }, { t: 26.6, type: 'paper', gain: 0.4 }, { t: 27.0, type: 'crickets', gain: 0.25 },
  { t: 27.95, type: 'riser', gain: 0.35 }, { t: 28.1, type: 'gong', gain: 0.8 }, { t: 28.15, type: 'chime', gain: 0.5 },
  { t: 30.12, type: 'stamp', gain: 0.5 }, { t: 31.5, type: 'pluck', gain: 0.5 }, { t: 33.12, type: 'chime', gain: 0.45 },
  { t: 34.36, type: 'pluck', gain: 0.4 }, { t: 35.3, type: 'chime', gain: 0.5 }, { t: 37.12, type: 'paper', gain: 0.3 },
  ...drums(39.1, 10, 0.3), { t: 40.86, type: 'gong', gain: 0.5 },
  { t: 42.78, type: 'stamp', gain: 0.7 }, { t: 42.8, type: 'flop', gain: 0.35 }, { t: 44.3, type: 'riser', gain: 0.35 }, { t: 44.72, type: 'gong', gain: 0.75 },
  { t: 46.46, type: 'stamp', gain: 0.5 }, { t: 48.54, type: 'slide', gain: 0.35 }, { t: 50.66, type: 'chime', gain: 0.55 },
  ...pops(53.0, 10, 0.14, 0.35),
  { t: 58.08, type: 'pop', gain: 0.8 }, { t: 58.12, type: 'gong', gain: 0.9 },
];

export const music = {
  bpm: 104, root: 'C', maqam: 'hicaz', gain: 0.32,
  sections: [
    { from: 0, to: 6.8, mood: 'intro' },
    { from: 6.8, to: 25.4, mood: 'groove' },
    { from: 25.4, to: 27.9, mood: 'sad' },
    { from: 27.9, to: 42.2, mood: 'drive' },
    { from: 42.2, to: 58.08, mood: 'triumph' },
    { from: 58.08, to: 59.8, mood: 'end' },
  ],
};
