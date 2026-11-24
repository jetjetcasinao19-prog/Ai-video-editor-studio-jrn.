// "What Decimate Really Meant" — the word's origin, told as a chronicle on a
// ledger page (`chronicle` device): the dictionary entry opens it, a tally of
// ten runs through it, and a pie that swings from "most" back to "one in ten"
// closes it. The punishment is never shown as violence: lots are drawn from a
// helmet, one figure of ten becomes an empty outline, and the nine turn away.
import { clamp, lerp, ease, tween, rng, TAU } from '../../lib/core.mjs';
import { interior, bookCover } from '../../styles/ottoman/scenes.mjs';
import { act } from '../../styles/ottoman/acting.mjs';

export const meta = {
  title: 'What Decimate Really Meant',
  slug: 'decimate-ottoman',
  style: 'ottoman',
  look: 'ledger',   // ledger (after night, album, tile)
  ambient: 'dust',
  room: 'arches',
  device: 'chronicle',
  width: 1080, height: 1920, fps: 30,
  duration: 38.0,
  voice: 'voice.mp3',
  seed: 10,
  captionChars: 30,
  brand: { handle: '@HOWITSTARTED-YT1', logo: '../../../brand/logo.png' },
  outro: { at: 36.3, text: 'Subscribe for more origin stories' },
};

const SKINS = ['#e2b48a', '#d9a882', '#c99a6e', '#f1d1a8', '#b88a5e'];
const LEGIONARY = (i, o = {}) => ({ robe: '#9a2a1e', inner: '#b8a070', sash: '#5a3a1a', hat: 'greekhelm', hatColor: '#9a9a8a', crest: '#c4371f', skin: SKINS[i % 5], ...o });
const OFFICER = { robe: '#6a2a5a', inner: '#c9a227', sash: '#c9a227', hat: 'greekhelm', hatColor: '#d8a848', crest: '#efe6cf', beard: true, beardColor: '#3a2a1a', skin: '#d9a882' };

function page(ctx, S, tint = 0) {
  const { k, W } = S;
  ctx.fillStyle = '#f3ead2'; ctx.fillRect(-300, -300, W + 600, 1800);
  for (let y = 80; y < 1150; y += 54) { ctx.beginPath(); ctx.moveTo(-300, y); ctx.lineTo(W + 300, y); k.stroke(ctx, 'rgba(60,90,140,0.18)', 1.5); }
  ctx.beginPath(); ctx.moveTo(120, -300); ctx.lineTo(120, 1500); k.stroke(ctx, 'rgba(160,40,30,0.35)', 2);
  if (tint > 0) { ctx.fillStyle = `rgba(30,20,30,${0.75 * tint})`; ctx.fillRect(-300, -300, W + 600, 1800); }
}
// ten figures in a row; `gone` is which one (0..9) becomes an outline, by k
function tenRow(ctx, S, x0, y, s, gap, k1 = 0, o = {}) {
  const { k, P } = S, gone = o.gone ?? 6;
  for (let i = 0; i < 10; i++) {
    const x = x0 + i * gap;
    if (i === gone && k1 > 0) {
      ctx.save(); ctx.globalAlpha = 1 - k1; k.figure(ctx, x, y, { ...LEGIONARY(i), s, face: 1 }); ctx.restore();
      ctx.save(); ctx.globalAlpha = k1; ctx.setLineDash([8, 8]); ctx.beginPath(); ctx.ellipse(x + 2, y - 150 * s, 40 * s, 150 * s, 0, 0, TAU); k.stroke(ctx, P.vermDark, 3); ctx.restore();
    } else k.figure(ctx, x, y, { ...LEGIONARY(i), s, face: o.turn && k1 > 0.5 ? -1 : 1, mood: k1 > 0.5 ? 'sad' : 'calm', armF: o.turn && k1 > 0.5 ? [0.8, 1.6] : [0.35, 0.2] });
  }
}
function pie(ctx, S, x, y, r, frac, color) {
  const { k, P } = S;
  k.circle(ctx, x, y, r, '#efe6cf', P.ink, 3);
  ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + TAU * frac); ctx.closePath(); k.fillStroke(ctx, color, P.ink, 3);
}

export const scenes = [
  { // 0.1 "Decimate didn't always mean destroy almost everything."
    start: 0, title: 'Decimate',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const al = S.at('always'), de = S.at('destroy'), ev = S.at('everything.');
      S.cam(lerp(1.3, 1.0, tween(u, 0, ev + 0.4, ease.inOut)), W / 2, lerp(420, 560, tween(u, 0, ev + 0.4)));
      page(ctx, S);
      ctx.fillStyle = P.ink; ctx.textAlign = 'left'; ctx.font = '700 84px Fell'; ctx.fillText('dec·i·mate', 160, 360);
      ctx.font = 'italic 600 40px GaramondItalic'; ctx.fillStyle = '#5a4a3a'; ctx.fillText('verb', 160, 420);
      const d = 'to destroy almost everything', q = tween(u, de - 0.4, ev + 0.2, ease.linear);
      ctx.fillStyle = P.ink; ctx.font = '600 50px Garamond'; ctx.fillText('1. ' + d.slice(0, Math.ceil(d.length * q)), 160, 520);
      // the word "always" gets a question
      const x = tween(u, al - 0.1, al + 0.3); if (x > 0) { ctx.save(); ctx.globalAlpha = x; ctx.fillStyle = P.vermDark; ctx.font = '900 120px Deco'; ctx.textAlign = 'center'; ctx.fillText('?', 820, 380); ctx.restore(); }
      // a field half flattened, in the margin
      for (let i = 0; i < 20; i++) { const down = i % 10 !== 3 && q > 0.6; ctx.save(); ctx.translate(180 + i * 40, 900); ctx.rotate(down ? 1.3 * tween(u, ev - 0.2, ev + 0.6) : Math.sin(S.t * 2 + i) * 0.05); k.rect(ctx, -4, -140, 8, 140, down ? '#c9a227' : P.green, P.ink, 1); ctx.restore(); }
    },
  },
  { // 4.7 "It meant something much darker."
    start: 4.4, title: 'Something Darker', trans: 'ink',
    draw(ctx, u, S) {
      const { k, P, W } = S, da = S.at('darker.');
      const dk = tween(u, da - 0.6, da + 0.4, ease.inOut);
      S.cam(lerp(1.0, 1.2, tween(u, 0, 2.8, ease.inOut)), W / 2, 560);
      page(ctx, S, dk);
      // the Latin root under the English word: DECEM, ten
      ctx.textAlign = 'center'; ctx.fillStyle = dk > 0.5 ? P.goldLight : P.ink; ctx.font = '900 120px Deco'; ctx.fillText('DECIMARE', W / 2, 420);
      ctx.font = '700 60px Fell'; ctx.fillStyle = dk > 0.5 ? P.paperLight : P.vermDark; ctx.fillText('DECEM = TEN', W / 2, 540);
      for (let i = 0; i < 10; i++) { ctx.beginPath(); ctx.moveTo(240 + i * 66, 680); ctx.lineTo(250 + i * 66, 820); k.stroke(ctx, i === 9 ? P.vermDark : (dk > 0.5 ? P.paperLight : P.ink), 9); }
      k.label(ctx, 'FROM LATIN · “TO TAKE ONE TENTH”', W / 2, 960, 18, tween(u, 0.3, 0.8));
    },
  },
  { // 7.4 "In ancient Rome, if an army unit disgraced itself, it could face decimatio."
    start: 7.2, title: 'A Unit in Disgrace', trans: 'page',
    draw(ctx, u, S) {
      const { k, P, W } = S, ro = S.at('Rome,'), di = S.at('disgraced'), fa = S.at('face');
      S.cam(lerp(1.15, 1.0, tween(u, 0, fa + 0.4, ease.inOut)), lerp(380, W / 2, tween(u, 0, fa + 0.4)), 680);
      interior(ctx, S, { arches: 3, carpet: false });
      // the cohort's standard is lowered: the sign of a unit that fled or mutinied
      const low = tween(u, di - 0.2, di + 0.6, ease.inOut);
      ctx.save(); ctx.translate(820, 1000); ctx.rotate(lerp(0, 1.1, low)); k.rect(ctx, -6, -460, 12, 460, '#7a5a3a', P.ink, 2); k.rect(ctx, -60, -460, 120, 90, '#9a2a1e', P.ink, 2); ctx.fillStyle = P.goldLight; ctx.font = '700 30px Fell'; ctx.textAlign = 'center'; ctx.fillText('SPQR', 0, -404); ctx.restore();
      for (let i = 0; i < 6; i++) k.figure(ctx, 440 + (i % 3) * 120, 1000 - Math.floor(i / 3) * 60, { ...LEGIONARY(i), s: 0.6, face: -1, mood: low > 0.5 ? 'sad' : 'calm', armF: [0.3, 1.5] });
      k.figure(ctx, 200, 1000, { ...OFFICER, s: 1.1, face: 1, mood: 'sad', ...act(u > fa - 0.3 ? 'point' : 'rest', u, tween(u, fa - 0.3, fa)) });
      k.label(ctx, 'FOR COWARDICE OR MUTINY', W / 2, 260, 20, tween(u, di, di + 0.4));
    },
  },
  { // 13.1 "The soldiers were split into groups of ten."
    start: 12.9, title: 'Groups of Ten', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, sp = S.at('split'), te = S.at('ten.');
      S.cam(lerp(1.0, 1.1, tween(u, 0, 3.0)), W / 2, 620);
      page(ctx, S);
      // rows of ten, bracketed one by one
      const br = tween(u, sp - 0.2, te + 0.6);
      for (let r = 0; r < 4; r++) { tenRow(ctx, S, 180, 380 + r * 210, 0.42, 82, 0); if (br * 4 > r) { ctx.beginPath(); ctx.moveTo(150, 400 + r * 210); ctx.lineTo(150, 400 + r * 210 + 10); ctx.lineTo(950, 400 + r * 210 + 10); ctx.lineTo(950, 400 + r * 210); k.stroke(ctx, P.vermDark, 4); ctx.fillStyle = P.vermDark; ctx.font = '900 34px Deco'; ctx.textAlign = 'left'; ctx.fillText('X', 970, 400 + r * 210); } }
    },
  },
  { // 16.1 "They drew lots."
    start: 15.9, title: 'They Drew Lots', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S, dr = S.at('drew'), lo = S.at('lots.');
      S.cam(lerp(1.3, 1.1, tween(u, 0, 1.6, ease.inOut)), W / 2, 640);
      page(ctx, S, 0.4);
      // a helmet full of tokens; nine pale, one dark
      ctx.save(); ctx.translate(W / 2, 760); k.ellipse(ctx, 0, 0, 220, 60, 0, '#7a7a6a', P.ink, 3); ctx.beginPath(); ctx.ellipse(0, 0, 220, 200, 0, Math.PI, TAU); k.fillStroke(ctx, '#9a9a8a', P.ink, 3); ctx.restore();
      const out = tween(u, dr - 0.2, lo + 0.8);
      for (let i = 0; i < 10; i++) { const q = clamp(out * 10 - i), x = lerp(W / 2 + (i - 4.5) * 20, 150 + i * 86, q), y = lerp(720, 420, q) - Math.sin(q * Math.PI) * 80; k.circle(ctx, x, y, 30, i === 6 ? '#2a1c12' : '#efe6cf', P.ink, 2.5); }
      for (let i = 0; i < 3; i++) k.figure(ctx, 200 + i * 340, 1080, { ...LEGIONARY(i), s: 0.55, face: i === 2 ? -1 : 1, mood: 'sad', armF: [1.3, 0.4] });
    },
  },
  { // 17.9 "One in every ten was killed by the other nine."
    start: 17.5, title: 'One in Ten', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, on = S.at('One'), ki = S.at('killed'), ni = S.at('nine.');
      S.cam(lerp(1.0, 1.25, tween(u, ki - 0.3, ni + 0.6, ease.inOut)), lerp(W / 2, 620, tween(u, ki - 0.3, ni + 0.6)), 720);
      page(ctx, S, 0.55);
      // one of ten becomes an empty outline; the nine turn away, heads down
      tenRow(ctx, S, 120, 1000, 0.72, 96, tween(u, ki - 0.2, ni + 0.4), { gone: 6, turn: true });
      const m = tween(u, on - 0.1, on + 0.4); if (m > 0) { ctx.save(); ctx.globalAlpha = m; ctx.beginPath(); ctx.moveTo(696, 540); ctx.lineTo(696, 600); k.stroke(ctx, P.vermDark, 5); k.poly(ctx, [[682, 596], [696, 620], [710, 596]], P.vermDark, null); ctx.restore(); }
      k.label(ctx, 'HIS OWN COMRADES HAD TO CARRY IT OUT', W / 2, 300, 18, tween(u, ni, ni + 0.4));
    },
  },
  { // 22.4 "It was so harsh, Rome rarely used it."
    start: 22.0, title: 'Rarely Used', trans: 'page',
    draw(ctx, u, S) {
      const { k, P, W } = S, ha = S.at('harsh,'), ra = S.at('rarely');
      S.cam(lerp(1.0, 1.15, tween(u, ra - 0.4, ra + 1.2, ease.inOut)), W / 2, 620);
      page(ctx, S);
      // a ledger of centuries with almost nothing written in it
      ctx.fillStyle = P.ink; ctx.font = '700 40px Fell'; ctx.textAlign = 'left';
      const yrs = ['500 BC', '400 BC', '300 BC', '200 BC', '100 BC', '1 BC'];
      yrs.forEach((y, i) => { ctx.fillText(y, 160, 300 + i * 120); ctx.beginPath(); ctx.moveTo(380, 290 + i * 120); ctx.lineTo(980, 290 + i * 120); k.stroke(ctx, 'rgba(60,40,20,0.3)', 2); });
      const w = tween(u, ra - 0.2, ra + 0.8, ease.linear);
      if (w > 0) { ctx.fillStyle = P.vermDark; ctx.font = 'italic 600 34px GaramondItalic'; const t = 'Crassus, 71 BC, as Plutarch tells it'; ctx.fillText(t.slice(0, Math.ceil(t.length * w)), 400, 300 + 4.3 * 120); }
      k.label(ctx, 'ONLY A HANDFUL OF CASES ARE RECORDED', W / 2, 1060, 18, tween(u, ha, ha + 0.4));
    },
  },
  { // 25.9 "Today, decimate means wiping out most of something."
    start: 25.3, title: 'Today: Most of It', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, to = S.at('Today,'), wi = S.at('wiping'), mo = S.at('most');
      S.cam(lerp(1.2, 1.0, tween(u, 0, mo + 0.4, ease.inOut)), W / 2, 620);
      page(ctx, S);
      k.newspaper(ctx, W / 2, 380, 640, -0.04, 'STORM DECIMATES CROPS', 'THE DAILY NEWS');
      pie(ctx, S, W / 2, 860, 190, tween(u, wi - 0.2, mo + 0.6, ease.inOut) * 0.9, P.vermDark);
      ctx.fillStyle = P.vermDark; ctx.font = '900 64px Deco'; ctx.textAlign = 'center'; ctx.globalAlpha = tween(u, mo, mo + 0.4); ctx.fillText('MOST OF IT', W / 2, 1120); ctx.globalAlpha = 1;
    },
  },
  { // 29.9 "Originally, it meant just one in ten."
    start: 29.5, title: 'Just One in Ten', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S, or = S.at('Originally,'), te = S.at('ten.');
      S.cam(lerp(1.0, 1.15, tween(u, or, te + 0.8, ease.inOut)), W / 2, 640);
      page(ctx, S);
      // the slice swings back from nine-tenths to one-tenth
      const back = tween(u, or, te + 0.2, ease.inOut);
      pie(ctx, S, W / 2, 520, 190, lerp(0.9, 0.1, back), P.vermDark);
      ctx.fillStyle = P.ink; ctx.font = '900 70px Deco'; ctx.textAlign = 'center'; ctx.fillText(back > 0.8 ? '1 IN 10' : '', W / 2, 820);
      for (let i = 0; i < 10; i++) { ctx.beginPath(); ctx.moveTo(240 + i * 66, 900); ctx.lineTo(250 + i * 66, 1040); k.stroke(ctx, i === 9 && back > 0.8 ? P.vermDark : P.ink, 9); }
    },
  },
  { // 34.2 "Every legend has a beginning."
    start: 33.9, title: 'Every Legend Has a Beginning', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S, beg = S.at('beginning.');
      ctx.save(); S.cam(lerp(1.0, 1.4, tween(u, 0, beg)), W / 2, 560);
      page(ctx, S); ctx.fillStyle = P.ink; ctx.font = '900 120px Deco'; ctx.textAlign = 'center'; ctx.fillText('DECEM', W / 2, 560);
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
  { t: 0.3, type: 'stamp', gain: 0.4 }, { t: 2.2, type: 'pluck', gain: 0.25 }, { t: 3.6, type: 'thud', gain: 0.35, pitch: 0.7 },
  { t: 5.6, type: 'gong', gain: 0.4, pitch: 0.6 },
  { t: 9.6, type: 'thud', gain: 0.45, pitch: 0.6 }, { t: 11.6, type: 'clank', gain: 0.35, pitch: 0.7 },
  ...Array.from({ length: 4 }, (_, i) => ({ t: +(14.0 + i * 0.35).toFixed(2), type: 'pop', gain: 0.25, pitch: 1 + i * 0.1 })),
  ...Array.from({ length: 10 }, (_, i) => ({ t: +(16.2 + i * 0.12).toFixed(2), type: 'clank', gain: 0.12, pitch: 1.6 })),
  { t: 19.2, type: 'thud', gain: 0.5, pitch: 0.5 }, { t: 20.8, type: 'wind', gain: 0.3 },
  { t: 23.8, type: 'paper', gain: 0.3 }, { t: 26.0, type: 'stamp', gain: 0.4 }, { t: 27.8, type: 'whoosh', gain: 0.3 },
  { t: 30.2, type: 'whoosh', gain: 0.3 }, { t: 32.0, type: 'chime', gain: 0.45, pitch: 1.3 },
];

export const music = {
  bpm: 84, root: 'A', maqam: 'hicaz', gain: 0.28,
  sections: [
    { from: 0, to: 4.4, mood: 'intro' },
    { from: 4.4, to: 15.9, mood: 'sad' },
    { from: 15.9, to: 25.3, mood: 'sad' },
    { from: 25.3, to: 36.3, mood: 'groove' },
    { from: 36.3, to: 38.0, mood: 'end' },
  ],
};
