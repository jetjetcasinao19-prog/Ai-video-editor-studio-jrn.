// "The Nameless Inventor" — who made the first eyeglasses, told as a Karagöz
// shadow play (`karagoz` device). The unknown maker is a puppet whose face is
// a question mark: he shakes the friar's hand, then fades back into shadow.
// The recurring object is a pair of rivet spectacles — two round lenses on
// handles joined by one rivet, the earliest kind. Florence is drawn as it was
// around 1306 (a crenellated tower and the octagonal baptistery; the great
// dome came more than a century later). Giordano's words are paraphrased.
import { clamp, lerp, ease, tween, rng, TAU } from '../../lib/core.mjs';
import { bookCover } from '../../styles/ottoman/scenes.mjs';

export const meta = {
  title: 'The Nameless Inventor',
  slug: 'eyeglasses-ottoman',
  style: 'ottoman',
  look: 'karagoz',  // shadow-theatre booth (after classic, scroll, night)
  room: 'tent',
  ambient: 'dust',
  device: 'karagoz',
  width: 1080, height: 1920, fps: 30,
  duration: 34.2,
  voice: 'voice.mp3',
  seed: 1306,
  captionChars: 30,
  brand: { handle: '@HOWITSTARTED-YT1', logo: '../../../brand/logo.png' },
  outro: { at: 32.5, text: 'Subscribe for more origin stories' },
};

const FRIAR = { robe: '#efe6cf', trim: '#1a1a1a', hat: 'bald', hair: '#5a3a2a', skin: '#e8c49a' };
const MAKER = { robe: '#3a2a20', trim: '#8a6a3a', hat: 'cap', hatColor: '#2a1a12', skin: '#3a2a20' };
const TOWNS = i => ({ robe: ['#9a2a1e', '#2f5f8a', '#3d6a4a', '#c9a227', '#7a2a5a'][i % 5], trim: '#efe6cf', hat: ['cap', 'bun', 'cap', 'bald', 'cap'][i % 5], hatColor: ['#2f5f8a', '#efe6cf', '#9a2a1e', '#000', '#3d6a4a'][i % 5], hair: '#5a3a2a', skin: '#e8c49a' });
const pup = (ctx, k, x, y, s, o) => k.puppet(ctx, x, y, s * 1.3, o);

function screen(ctx, S, warm = 0) {
  const { W } = S;
  ctx.fillStyle = warm ? '#f6e2b8' : '#f3e8cc'; ctx.fillRect(-300, -300, W + 600, 1800);
  ctx.fillStyle = 'rgba(120,80,40,0.10)'; ctx.fillRect(-300, 1000, W + 600, 500);
}
// the recurring object: rivet spectacles; open = how far the two lenses swing apart
function specs(ctx, S, x, y, s = 1, open = 1, rot = 0) {
  const { k, P } = S;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  const a = lerp(0.05, 0.42, clamp(open));
  for (const sx of [-1, 1]) {
    ctx.save(); ctx.rotate(sx * a);
    k.rect(ctx, -9, -20, 18, 150, '#8a5a2a', P.ink, 2.5); // the handle
    ctx.beginPath(); ctx.arc(0, 180, 62, 0, TAU); k.fillStroke(ctx, '#8a5a2a', P.ink, 3);
    ctx.beginPath(); ctx.arc(0, 180, 46, 0, TAU); k.fillStroke(ctx, 'rgba(225,240,245,0.75)', P.ink, 2);
    ctx.beginPath(); ctx.arc(-14, 166, 16, Math.PI * 1.1, Math.PI * 1.6); k.stroke(ctx, 'rgba(255,255,255,0.9)', 4);
    ctx.restore();
  }
  k.circle(ctx, 0, 0, 12, P.gold, P.ink, 2); k.circle(ctx, 0, 0, 4, P.ink, null); // the rivet
  ctx.restore();
}
// the maker: a puppet whose face is a question mark
function maker(ctx, S, x, y, s, a = 1, o = {}) {
  if (a <= 0) return;
  const { k, P } = S;
  ctx.save(); ctx.globalAlpha *= clamp(a);
  pup(ctx, k, x, y, s, { ...MAKER, t: S.t, face: o.face || 1, arm: o.arm ?? 0.2, walk: o.walk || 0, hold: o.hold });
  ctx.fillStyle = P.goldLight; ctx.strokeStyle = P.ink; ctx.lineWidth = 3; ctx.font = `900 ${Math.round(110 * s)}px Deco`; ctx.textAlign = 'center';
  ctx.strokeText('?', x + 4 * s, y - 300 * s); ctx.fillText('?', x + 4 * s, y - 300 * s);
  ctx.restore();
}
// Florence around 1306: a crenellated civic tower, an octagonal baptistery, red roofs
function florence(ctx, S, base) {
  const { k, P, W } = S;
  for (let i = 0; i < 9; i++) { const x = -40 + i * 140, h = 120 + (i * 53) % 90; k.rect(ctx, x, base - h, 130, h, ['#e8d6b0', '#dcc8a0', '#efe0c0'][i % 3], P.ink, 2); k.poly(ctx, [[x - 6, base - h], [x + 65, base - h - 40], [x + 136, base - h]], '#b8582e', P.ink, 2); }
  // the tall tower with battlements
  k.rect(ctx, 800, base - 560, 90, 560, '#d8c49a', P.ink, 2.5); k.rect(ctx, 780, base - 600, 130, 50, '#d8c49a', P.ink, 2.5);
  for (let i = 0; i < 5; i++) k.rect(ctx, 782 + i * 26, base - 624, 16, 26, '#d8c49a', P.ink, 2);
  // the octagonal baptistery, striped in green and white marble
  k.poly(ctx, [[470, base], [470, base - 220], [540, base - 280], [660, base - 280], [730, base - 220], [730, base]], '#f1ede4', P.ink, 2.5);
  for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(470 + i * 87, base); ctx.lineTo(470 + i * 87, base - 230); k.stroke(ctx, '#3d6a4a', 5); }
  k.poly(ctx, [[520, base - 280], [600, base - 360], [680, base - 280]], '#b8582e', P.ink, 2.5);
}
function pulpit(ctx, S, x, base) {
  const { k, P } = S;
  k.rect(ctx, x - 90, base - 260, 180, 260, '#7a5a3a', P.ink, 3); k.rect(ctx, x - 110, base - 280, 220, 30, '#9a7a4a', P.ink, 2.5);
  for (let i = 0; i < 3; i++) k.rect(ctx, x - 70 + i * 50, base - 220, 40, 160, '#6a4a2a', P.ink, 1.5);
}

export const scenes = [
  { // 0.1 "Nobody knows who invented eyeglasses, but we know roughly when."
    start: 0, title: 'Nobody Knows Who',
    draw(ctx, u, S) {
      const { k, P, W } = S, wh = S.at('who'), ey = S.at('eyeglasses,'), kn = S.at('know'), wn = S.at('when.');
      S.cam(lerp(1.2, 1.0, tween(u, 0, wn + 0.4, ease.inOut)), W / 2, 700);
      ctx.fillStyle = '#2a3550'; ctx.fillRect(-300, -300, W + 600, 1800);
      { const g = ctx.createRadialGradient(720, 560, 20, 720, 560, 520); g.addColorStop(0, 'rgba(255,236,190,0.95)'); g.addColorStop(1, 'rgba(255,236,190,0)'); ctx.fillStyle = g; ctx.fillRect(-300, -300, W + 600, 1800); }
      ctx.fillStyle = 'rgba(20,14,10,0.35)'; ctx.fillRect(-300, 1000, W + 600, 500);
      maker(ctx, S, 330, 1000, 1.15, tween(u, 0.1, wh + 0.2), { arm: 0.6 + 0.1 * Math.sin(S.t * 2), hold: c => specs(c, S, 0, 0, 0.35, 0.8) });
      specs(ctx, S, 720, 380, 1.0, tween(u, ey - 0.4, ey + 0.4, ease.outBack), Math.sin(S.t * 1.4) * 0.08);
      // "roughly when": a sand-glass turns
      const hg = tween(u, kn - 0.3, wn + 0.3); if (hg > 0) k.hourglass(ctx, 760, 900, 0.8, (S.t * 0.2) % 1, (1 - hg) * Math.PI);
    },
  },
  { // 5.1 "Around 1306, an Italian friar named Giordano gives a sermon in Florence."
    start: 4.9, title: 'Florence, 1306', trans: 'curtain',
    draw(ctx, u, S) {
      const { k, P, W } = S, ye = S.at('1306,'), fr = S.at('friar'), gi = S.at('Giordano'), se = S.at('sermon'), fl = S.at('Florence.');
      S.cam(lerp(0.95, 1.08, tween(u, fr - 0.4, se + 0.4, ease.inOut)), lerp(W / 2, 500, tween(u, fr - 0.4, se + 0.4)), lerp(600, 700, tween(u, fr - 0.4, se + 0.4)));
      screen(ctx, S, 1);
      florence(ctx, S, 760);
      pulpit(ctx, S, 240, 1000);
      const ff = tween(u, fr - 0.3, fr + 0.3, ease.outBack);
      if (ff > 0) pup(ctx, k, 240, 740, 1.0 * ff, { ...FRIAR, t: S.t, face: 1, arm: u > se ? 0.8 + 0.2 * Math.sin(S.t * 3) : 0.3, talk: u > se ? 1 : 0 });
      for (let i = 0; i < 4; i++) { const q = tween(u, se - 0.4 + i * 0.12, se + 0.1 + i * 0.12); if (q > 0) { ctx.save(); ctx.globalAlpha = q; pup(ctx, k, 470 + i * 130, 1010, 0.8, { ...TOWNS(i), t: S.t + i, face: -1, arm: 0.1 }); ctx.restore(); } }
      k.label(ctx, 'GIORDANO DA PISA, FRIAR', 280, 1080, 16, tween(u, gi, gi + 0.4));
      k.seal(ctx, 690, 250, 64, ' FLORENCE · 1306 ·', '1306', tween(u, ye - 0.1, ye + 0.5, ease.linear));
      k.label(ctx, 'FLORENCE · FEBRUARY 1306', 640, 1080, 16, tween(u, fl, fl + 0.4));
    },
  },
  { // 11.3 "He says glasses were invented less than 20 years ago, and that he met the man who made them."
    start: 11.0, title: 'Not Yet Twenty Years', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, gl = S.at('glasses'), le = S.at('less'), ag = S.at('ago,'), me = S.at('met'), ma = S.at('made');
      S.cam(lerp(1.05, 1.0, tween(u, 0, 2.0, ease.inOut)), lerp(W / 2, 560, tween(u, me - 0.4, ma + 0.4)), 700);
      screen(ctx, S);
      // a scroll unrolls with the gist of his words
      const sc = tween(u, gl - 0.3, ag + 0.2, ease.inOut);
      if (sc > 0) { const w = 640 * sc; k.rect(ctx, W / 2 - w / 2, 230, w, 220, '#fbf4e2', P.ink, 3); k.rect(ctx, W / 2 - w / 2 - 20, 220, 22, 240, '#8a5a2a', P.ink, 2); k.rect(ctx, W / 2 + w / 2 - 2, 220, 22, 240, '#8a5a2a', P.ink, 2);
        ctx.save(); ctx.beginPath(); ctx.rect(W / 2 - w / 2, 230, w, 220); ctx.clip(); ctx.fillStyle = P.ink; ctx.font = '900 46px Deco'; ctx.textAlign = 'center'; ctx.fillText('“NOT YET', W / 2, 315); ctx.fillText('TWENTY YEARS…”', W / 2, 380); ctx.restore(); }
      k.label(ctx, 'HIS SERMON, AS WRITTEN DOWN', W / 2, 500, 15, tween(u, ag - 0.2, ag + 0.3));
      // the friar meets the maker; they clasp hands over the spectacles
      const meet = tween(u, me - 0.6, me + 0.3, ease.inOut);
      pup(ctx, k, lerp(160, 380, meet), 1000, 1.0, { ...FRIAR, t: S.t, face: 1, arm: lerp(0.2, 0.55, meet), walk: meet > 0 && meet < 1 ? 1 : 0 });
      maker(ctx, S, lerp(920, 700, meet), 1000, 1.0, 1, { face: -1, arm: lerp(0.2, 0.55, meet), walk: meet > 0 && meet < 1 ? 1 : 0 });
      const sp = tween(u, ma - 0.3, ma + 0.3, ease.outBack); if (sp > 0) specs(ctx, S, 540, 560, 0.7 * sp, 1, Math.sin(S.t * 2) * 0.1);
    },
  },
  { // 17.2 "He never tells us his name."
    start: 17.0, title: 'No Name', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, ne = S.at('never'), na = S.at('name.');
      S.cam(lerp(1.0, 1.18, tween(u, 0, 2.0, ease.inOut)), W / 2, lerp(700, 620, tween(u, 0, 2.0)));
      screen(ctx, S, 1);
      // a page of notes: a blank where the name should be
      k.rect(ctx, 220, 280, 640, 420, '#fbf4e2', P.ink, 3);
      ctx.fillStyle = P.ink; ctx.font = '700 34px Fell'; ctx.textAlign = 'left'; ctx.fillText('The man who made them:', 260, 350);
      ctx.beginPath(); ctx.moveTo(260, 500); ctx.lineTo(800, 500); k.stroke(ctx, P.ink, 3);
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(260, 560 + i * 44); ctx.lineTo(820 - i * 90, 560 + i * 44); k.stroke(ctx, 'rgba(60,40,20,0.3)', 3); }
      const q = tween(u, na - 0.3, na + 0.3, ease.outBack); if (q > 0) { ctx.save(); ctx.translate(530, 485); ctx.scale(q, q); ctx.fillStyle = P.vermDark; ctx.font = '900 100px Deco'; ctx.textAlign = 'center'; ctx.fillText('?', 0, 0); ctx.restore(); }
      maker(ctx, S, lerp(540, 900, tween(u, ne, na + 0.6)), 1000, 0.95, 1 - tween(u, na, na + 0.9), { face: 1, walk: 1 });
    },
  },
  { // 19.3 "So the first glasses came from Italy, around the 1280s, probably in Pisa or Florence."
    start: 19.0, title: 'Pisa or Florence?', trans: 'curtain',
    draw(ctx, u, S) {
      const { k, P, W } = S, it = S.at('Italy,'), yr = S.at('1280s,'), pi = S.at('Pisa'), fl = S.at('Florence.');
      S.cam(lerp(1.0, 1.06, tween(u, 0, 5.0)), W / 2, 640);
      ctx.fillStyle = '#b07a40'; ctx.fillRect(-300, -300, W + 600, 1800);
      k.rect(ctx, 70, 170, 940, 900, '#d9a868', P.ink, 4); ctx.save(); ctx.setLineDash([14, 12]); k.rect(ctx, 90, 190, 900, 860, null, '#6a4320', 3); ctx.restore();
      { const R = rng(31); for (let i = 0; i < 18; i++) { const x = 130 + R() * 820, y = 230 + R() * 780; if (Math.abs(y - 640) < 120) continue; ctx.beginPath(); ctx.arc(x, y, 18 + R() * 12, Math.PI, TAU); ctx.closePath(); k.fillStroke(ctx, '#a8743a', P.ink, 1.5); } }
      // a leather map of Tuscany: the Arno runs from Florence down to Pisa and the sea
      ctx.fillStyle = 'rgba(80,130,180,0.7)'; ctx.fillRect(70, 170, 120, 900);
      ctx.beginPath(); ctx.moveTo(30, 640); ctx.bezierCurveTo(260, 600, 420, 760, 600, 640); ctx.bezierCurveTo(720, 560, 820, 620, 1000, 560); k.stroke(ctx, P.ink, 22); k.stroke(ctx, '#7fb0d8', 16);
      k.label(ctx, 'THE ARNO', 520, 760, 15, tween(u, it - 0.2, it + 0.3));
      // Pisa: an unfinished tower that already leans; Florence: the civic tower
      const pa = tween(u, pi - 0.3, pi + 0.3, ease.outBack), fa = tween(u, fl - 0.3, fl + 0.3, ease.outBack);
      if (pa > 0) { ctx.save(); ctx.translate(290, 560); ctx.scale(pa, pa); ctx.rotate(0.08); k.rect(ctx, -40, -260, 80, 260, '#f1ede4', P.ink, 2.5); for (let i = 1; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-40, -i * 52); ctx.lineTo(40, -i * 52); k.stroke(ctx, P.ink, 2); } ctx.restore(); ctx.fillStyle = P.ink; ctx.font = '900 40px Deco'; ctx.textAlign = 'center'; ctx.fillText('PISA', 290, 620); }
      if (fa > 0) { ctx.save(); ctx.translate(760, 520); ctx.scale(fa, fa); k.rect(ctx, -36, -280, 72, 280, '#d8c49a', P.ink, 2.5); k.rect(ctx, -52, -310, 104, 40, '#d8c49a', P.ink, 2.5); ctx.restore(); ctx.fillStyle = P.ink; ctx.font = '900 40px Deco'; ctx.textAlign = 'center'; ctx.fillText('FLORENCE', 760, 580); }
      // the spectacles hop back and forth between the two
      const hop = (Math.sin(S.t * 2.2) + 1) / 2; specs(ctx, S, lerp(330, 730, hop), 400 - Math.sin(hop * Math.PI) * 120, 0.45, 1, (hop - 0.5) * 0.6);
      k.seal(ctx, 540, 960, 78, ' AROUND THE 1280s ·', '1280s', tween(u, yr - 0.1, yr + 0.5, ease.linear));
    },
  },
  { // 25.4 "The person who helped millions see clearly is still a mystery."
    start: 25.2, title: 'Millions See Clearly', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, he = S.at('helped'), se = S.at('see'), cl = S.at('clearly'), my = S.at('mystery.');
      S.cam(lerp(1.0, 1.12, tween(u, my - 1.2, my + 0.4, ease.inOut)), W / 2, lerp(700, 620, tween(u, my - 1.2, my + 0.4)));
      screen(ctx, S, 1);
      // a book: blurry letters come into focus as the glasses arrive
      const sharp = tween(u, se - 0.3, cl + 0.3);
      k.rect(ctx, 260, 260, 560, 340, '#fbf4e2', P.ink, 3); ctx.beginPath(); ctx.moveTo(540, 260); ctx.lineTo(540, 600); k.stroke(ctx, P.ink, 2);
      for (let r = 0; r < 6; r++) for (const side of [0, 1]) {
        const x0 = 290 + side * 280, y = 310 + r * 46, off = (1 - sharp) * 7;
        for (const d of off > 0.5 ? [-off, off] : [0]) { ctx.save(); ctx.globalAlpha = off > 0.5 ? 0.45 : 1; ctx.beginPath(); ctx.moveTo(x0 + d, y + d * 0.4); ctx.lineTo(x0 + 220 - (r % 3) * 30 + d, y + d * 0.4); k.stroke(ctx, P.ink, 6); ctx.restore(); }
      }
      specs(ctx, S, 540, lerp(140, 300, sharp), 0.85, 1, 0);
      // readers along the bottom, each holding a pair
      for (let i = 0; i < 5; i++) { const q = tween(u, he - 0.3 + i * 0.12, he + 0.1 + i * 0.12); if (q > 0) { ctx.save(); ctx.globalAlpha = q; pup(ctx, k, 140 + i * 200, 1010, 0.72, { ...TOWNS(i), t: S.t + i, face: i < 2 ? 1 : -1, arm: 0.55, hold: c => specs(c, S, 0, 0, 0.22, 0.9) }); ctx.restore(); } }
      maker(ctx, S, 540, 820, 0.6, tween(u, my - 0.4, my + 0.2) * 0.85, { face: 1 });
    },
  },
  { // 30.1 "Every legend has a beginning."
    start: 29.8, title: 'Every Legend Has a Beginning', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S, beg = S.at('beginning.');
      ctx.save(); S.cam(lerp(1.0, 1.35, tween(u, 0, beg)), W / 2, 640);
      screen(ctx, S, 1); specs(ctx, S, W / 2, 380, 1.1, 1, Math.sin(S.t * 1.2) * 0.06); maker(ctx, S, 820, 1000, 0.9, 0.7, { face: -1 });
      ctx.restore();
      const open = tween(u, beg - 0.1, beg + 0.55, ease.inOut);
      if (open > 0) {
        ctx.save(); ctx.beginPath(); ctx.arc(W / 2, 600, open * 900, 0, TAU); ctx.clip(); bookCover(ctx, S, u - beg); ctx.restore();
        if (open < 1) { ctx.beginPath(); ctx.arc(W / 2, 600, open * 900, 0, TAU); k.stroke(ctx, P.goldLight, 8); }
      }
    },
  },
];

// ---------- sound ----------
export const sfx = [
  ...scenes.slice(1).map(s => ({ t: s.start - 0.05, type: s.trans === 'cut' ? 'pop' : 'paper', gain: 0.28 })),
  { t: 1.7, type: 'pluck', gain: 0.3 }, { t: 3.4, type: 'slide', gain: 0.25 },
  { t: 5.4, type: 'gong', gain: 0.3 }, { t: 7.6, type: 'pop', gain: 0.3 }, { t: 9.6, type: 'chime', gain: 0.3, pitch: 0.9 },
  { t: 11.6, type: 'paper', gain: 0.35 }, { t: 15.2, type: 'pluck', gain: 0.3, pitch: 1.2 }, { t: 16.0, type: 'chime', gain: 0.4, pitch: 1.3 },
  { t: 18.0, type: 'thud', gain: 0.3 }, { t: 21.7, type: 'stamp', gain: 0.35 }, { t: 23.5, type: 'pop', gain: 0.3, pitch: 1.4 }, { t: 24.1, type: 'pop', gain: 0.3, pitch: 1.6 },
  { t: 27.0, type: 'riser', gain: 0.3 }, { t: 27.4, type: 'chime', gain: 0.45, pitch: 1.4 }, { t: 28.9, type: 'pluck', gain: 0.3, pitch: 0.8 },
];

export const music = {
  bpm: 88, root: 'A', maqam: 'nihavend', gain: 0.26,
  sections: [
    { from: 0, to: 4.9, mood: 'intro' },
    { from: 4.9, to: 17.0, mood: 'groove' },
    { from: 17.0, to: 19.0, mood: 'sad' },
    { from: 19.0, to: 25.2, mood: 'drive' },
    { from: 25.2, to: 32.5, mood: 'triumph' },
    { from: 32.5, to: 34.2, mood: 'end' },
  ],
};
