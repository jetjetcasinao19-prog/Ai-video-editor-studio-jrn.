// "The One-Word Reply" — the word "laconic", told in letters (`letters`
// device): Philip's threat is a long scroll that keeps unrolling, Sparta's
// answer is a scrap of parchment with one word on it. Told "as the story
// goes" (Plutarch records it), on a hanging scroll page.
import { clamp, lerp, ease, tween, rng, TAU } from '../../lib/core.mjs';
import { interior, bookCover } from '../../styles/ottoman/scenes.mjs';
import { act } from '../../styles/ottoman/acting.mjs';

export const meta = {
  title: 'The One-Word Reply',
  slug: 'laconic-ottoman',
  style: 'ottoman',
  look: 'scroll',   // hanging scroll (after ledger, night, album)
  ambient: 'dust',
  room: 'lattice',
  device: 'letters',
  width: 1080, height: 1920, fps: 30,
  duration: 37.0,
  voice: 'voice.mp3',
  seed: 338,
  captionChars: 30,
  brand: { handle: '@HOWITSTARTED-YT1', logo: '../../../brand/logo.png' },
  outro: { at: 35.3, text: 'Subscribe for more origin stories' },
};

const SPARTAN = i => ({ robe: ['#a8281c', '#952418', '#b43424'][i % 3], inner: '#c9a227', sash: '#5a3a1a', hat: i % 2 ? 'greekhelm' : 'shorthair', hatColor: '#c08a3a', crest: '#2a1c12', hair: '#3a2a1a', beard: true, beardColor: '#3a2a1a', skin: ['#d9a882', '#c99a6e', '#e2b48a'][i % 3] });
const PHILIP = { robe: '#5a2a6a', robeP: 'dots', inner: '#c9a227', sash: '#c9a227', hat: 'crown', beard: true, beardColor: '#2a1c12', skin: '#d9a882' };

// Philip's long, long scroll and Sparta's scrap of parchment
function longScroll(ctx, S, x, y, w, len, lines) {
  const { k, P } = S;
  k.rect(ctx, x - w / 2, y, w, len, '#f3e6c4', P.ink, 2.5);
  for (let i = 0; i < Math.floor(len / 34); i++) { ctx.beginPath(); ctx.moveTo(x - w / 2 + 24, y + 30 + i * 34); ctx.lineTo(x + w / 2 - 24 - ((i * 37) % 60), y + 30 + i * 34); k.stroke(ctx, 'rgba(60,40,20,0.45)', 3); }
  k.rect(ctx, x - w / 2 - 16, y - 18, w + 32, 22, '#7a5a3a', P.ink, 2); k.rect(ctx, x - w / 2 - 16, y + len - 4, w + 32, 22, '#7a5a3a', P.ink, 2);
  if (lines) { ctx.fillStyle = P.ink; ctx.font = 'italic 600 40px GaramondItalic'; ctx.textAlign = 'center'; lines.forEach((l, i) => ctx.fillText(l, x, y + 70 + i * 52)); }
}
function scrap(ctx, S, x, y, s, word = 'IF.', rot = -0.06) {
  const { k, P } = S;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  k.poly(ctx, [[-90, -60], [84, -66], [92, 54], [-86, 62]], '#efe0b8', P.ink, 2.5);
  ctx.fillStyle = P.ink; ctx.font = '900 80px Deco'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(word, 0, 4); ctx.textBaseline = 'alphabetic';
  ctx.restore();
}

export const scenes = [
  { // 0.0 "The best comeback in history was one word."
    start: 0, title: 'One Word',
    draw(ctx, u, S) {
      const { k, P, W } = S, co = S.at('comeback'), on = S.at('one'), wo = S.at('word.');
      S.cam(lerp(1.0, 1.25, tween(u, on - 0.3, wo + 0.6, ease.inOut)), W / 2, lerp(560, 760, tween(u, on - 0.3, wo + 0.6)));
      ctx.fillStyle = '#efe2c0'; ctx.fillRect(-300, -300, W + 600, 1800);
      // a threat that will not stop unrolling…
      longScroll(ctx, S, 320, 140, 360, lerp(80, 920, tween(u, 0, on, ease.inOut)));
      // …against a scrap with one word
      const r = tween(u, on - 0.1, wo + 0.2, ease.outBack); if (r > 0) scrap(ctx, S, 780, 760, 1.6 * r);
    },
  },
  { // 4.6 "Sparta was in a region of Greece called Laconia."
    start: 4.3, title: 'Laconia', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W } = S, sp = S.at('Sparta'), la = S.at('Laconia.');
      S.cam(lerp(1.0, 1.4, tween(u, sp, la + 0.6, ease.inOut)), lerp(W / 2, 560, tween(u, sp, la + 0.6)), lerp(560, 700, tween(u, sp, la + 0.6)));
      ctx.fillStyle = '#3f6f9a'; ctx.fillRect(-300, -300, W + 600, 1800); k.waves(ctx, -300, -300, W + 600, 1800, S.t, '#3f6f9a', '#6f9cc0', 8, 30);
      // the Peloponnese, with its southern region lit
      const pelop = [[300, 300], [520, 260], [640, 360], [700, 520], [640, 640], [700, 820], [620, 980], [560, 860], [520, 1000], [440, 880], [380, 960], [320, 820], [250, 700], [240, 480]];
      ctx.beginPath(); k.smoothPath(ctx, pelop, true); ctx.fillStyle = '#d9c08a'; ctx.fill(); k.stroke(ctx, P.ink, 3);
      const lit = tween(u, la - 0.4, la + 0.2);
      ctx.save(); ctx.beginPath(); k.smoothPath(ctx, pelop, true); ctx.clip(); ctx.globalAlpha = 0.7 * lit; const gl = ctx.createRadialGradient(560, 800, 20, 560, 800, 260); gl.addColorStop(0, 'rgba(168,40,28,0.9)'); gl.addColorStop(1, 'rgba(168,40,28,0)'); ctx.fillStyle = gl; ctx.fillRect(200, 500, 700, 600); ctx.restore();
      k.circle(ctx, 540, 740, 12, P.vermDark, P.ink, 2); ctx.fillStyle = P.ink; ctx.font = '700 32px Fell'; ctx.textAlign = 'center'; ctx.fillText('SPARTA', 540, 710);
      k.label(ctx, 'LACONIA', 560, 860, 22, lit);
      k.figure(ctx, 880, 1000, { ...SPARTAN(1), s: 0.8, face: -1, mood: 'calm', ...act('point', u, tween(u, sp, sp + 0.4)) });
    },
  },
  { // 8.3 "Spartans were famous for saying a lot with very few words."
    start: 7.8, title: 'Few Words', trans: 'page',
    draw(ctx, u, S) {
      const { k, P, W } = S, fa = S.at('famous'), lo = S.at('lot'), fe = S.at('few');
      S.cam(lerp(1.15, 1.0, tween(u, 0, 3.0, ease.inOut)), W / 2, 640);
      interior(ctx, S, { arches: 3, carpetColor: '#a8281c' });
      // a talker from elsewhere fills the air with words; the Spartan answers with three
      const talk = tween(u, fa - 0.4, lo + 0.6);
      k.figure(ctx, 280, 1000, { robe: '#2f5f8a', robeP: 'dots', inner: '#efe6cf', hat: 'wreath', hair: '#5a4a3a', beard: true, beardColor: '#5a4a3a', skin: '#e2b48a', s: 1.0, face: 1, mood: 'happy', ...act('count', u, talk) });
      const R = rng(3); for (let i = 0; i < Math.floor(talk * 26); i++) { ctx.fillStyle = 'rgba(42,28,18,0.75)'; ctx.font = `600 ${18 + Math.floor(R() * 14)}px Garamond`; ctx.textAlign = 'left'; ctx.fillText(['and', 'moreover', 'therefore', 'whereas', 'indeed', 'furthermore', 'notwithstanding', 'however'][i % 8], 140 + R() * 420, 340 + R() * 300); }
      k.figure(ctx, 820, 1000, { ...SPARTAN(0), s: 1.05, face: -1, mood: 'calm', armF: [0.4, 0.3] });
      const f = tween(u, fe - 0.2, fe + 0.4, ease.outBack); if (f > 0) { ctx.save(); ctx.translate(820, 520); ctx.scale(f, f); k.ellipse(ctx, 0, 0, 120, 60, 0, '#f6eed8', P.ink, 3); for (let j = 0; j < 3; j++) { ctx.beginPath(); ctx.moveTo(-50 + j * 40, 0); ctx.lineTo(-30 + j * 40, 0); k.stroke(ctx, P.ink, 8); } ctx.restore(); }
    },
  },
  { // 12.9 "As the story goes, King Philip II, father of Alexander the Great, sends them a threat."
    start: 12.5, title: 'Philip’s Threat', trans: 'ink',
    draw(ctx, u, S) {
      const { k, P, W } = S, st = S.at('story'), ph = S.at('Philip'), al = S.at('Alexander'), se = S.at('sends'), th = S.at('threat.');
      S.cam(lerp(1.2, 1.0, tween(u, se - 0.4, th + 0.6, ease.inOut)), lerp(380, W / 2, tween(u, se - 0.4, th + 0.6)), 680);
      interior(ctx, S, { arches: 2, carpetColor: '#5a2a6a' });
      k.figure(ctx, 330, 1000, { ...PHILIP, s: 1.15, face: 1, mood: 'calm', ...act(u > se ? 'present' : 'think', u, tween(u, ph, ph + 0.4)) });
      const a = tween(u, al - 0.2, al + 0.3); if (a > 0) { ctx.save(); ctx.globalAlpha = a; k.figure(ctx, 140, 1000, { robe: '#efe6cf', inner: '#5a2a6a', hat: 'longhair', hair: '#c9a46a', skin: '#e2b48a', s: 0.7, face: 1, mood: 'calm' }); ctx.restore(); }
      // the letter is sealed and a rider takes it south
      const ride = tween(u, se, th + 1.0, ease.inOut);
      ctx.save(); ctx.translate(lerp(560, 1000, ride), 820); k.rect(ctx, -40, -26, 80, 52, '#f3e6c4', P.ink, 2); k.circle(ctx, 0, 0, 12, P.vermDark, P.ink, 1.5); ctx.restore();
      k.label(ctx, 'PHILIP II OF MACEDON', 330, 540, 20, tween(u, ph, ph + 0.4));
      k.label(ctx, 'AS PLUTARCH TELLS IT', W / 2, 220, 18, tween(u, st, st + 0.4));
      if (a > 0.5) k.label(ctx, 'YOUNG ALEXANDER', 140, 690, 14, a);
    },
  },
  { // 19.2 "If I invade your land, I will destroy your city."
    start: 18.9, title: 'The Threat', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, in_ = S.at('invade'), de = S.at('destroy'), ci = S.at('city.');
      S.cam(lerp(1.0, 1.15, tween(u, 0, 3.6, ease.inOut)), W / 2, 600);
      ctx.fillStyle = '#2a2030'; ctx.fillRect(-300, -300, W + 600, 1800);
      // a long phalanx of long spears behind the words
      const ad = tween(u, 0, ci + 0.6);
      for (let i = 0; i < 22; i++) { const x = lerp(-200, 120, ad) + i * 50; ctx.beginPath(); ctx.moveTo(x, 1080); ctx.lineTo(x + 120, 700); k.stroke(ctx, '#8a7a6a', 4); k.figure(ctx, x, 1080, { robe: '#5a2a6a', inner: '#c9a227', hat: 'greekhelm', hatColor: '#8a8a7a', crest: '#5a2a6a', skin: '#d9a882', s: 0.42, face: 1 }); }
      const w = tween(u, in_ - 0.4, ci + 0.2, ease.linear);
      longScroll(ctx, S, W / 2, 140, 760, 420);
      ctx.fillStyle = P.ink; ctx.font = 'italic 700 46px GaramondItalic'; ctx.textAlign = 'center';
      const lines = ['“If I invade your land,', 'I will destroy', 'your city.”'];
      lines.forEach((l, i) => { const q = clamp(w * 3 - i); if (q > 0) ctx.fillText(l.slice(0, Math.ceil(l.length * q)), W / 2, 260 + i * 90); });
    },
  },
  { // 23.3 "The Spartans reply with one word, if."
    start: 22.9, title: 'The Reply', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S, re = S.at('reply'), wo = S.at('word,'), iff = S.at('if.');
      S.cam(lerp(1.0, 1.6, tween(u, iff - 0.5, iff + 0.6, ease.inOut)), lerp(W / 2, 540, tween(u, iff - 0.5, iff + 0.6)), lerp(640, 600, tween(u, iff - 0.5, iff + 0.6)));
      interior(ctx, S, { arches: 3, carpetColor: '#a8281c' });
      // the council reads the long letter… one of them writes back
      for (let i = 0; i < 5; i++) k.figure(ctx, 120 + i * 200, 1000, { ...SPARTAN(i), s: 0.75, face: i < 2 ? 1 : -1, mood: u > iff ? 'happy' : 'calm', ...act(u > re && i === 2 ? 'present' : 'rest', u, tween(u, re, re + 0.3)) });
      const s = tween(u, wo - 0.4, iff + 0.2, ease.outBack); if (s > 0) scrap(ctx, S, 540, 600, 2.2 * s, u > iff - 0.1 ? 'IF.' : '');
    },
  },
  { // 27.7 "That's where we get the word laconic. Short, sharp, and to the point."
    start: 27.3, title: 'Laconic', trans: 'page',
    draw(ctx, u, S) {
      const { k, P, W } = S, la = S.at('laconic.'), sh = S.at('Short,'), sa = S.at('sharp,'), po = S.at('point.');
      S.cam(lerp(1.0, 1.1, tween(u, 0, 4.0)), W / 2, 600);
      ctx.fillStyle = '#efe2c0'; ctx.fillRect(-300, -300, W + 600, 1800);
      // the place name turns into the word
      const m = tween(u, la - 0.4, la + 0.6, ease.inOut);
      ctx.fillStyle = P.ink; ctx.font = '900 96px Deco'; ctx.textAlign = 'center';
      ctx.fillText(m < 0.5 ? 'LACONIA' : 'LACONIC', W / 2, 330);
      ctx.font = 'italic 600 38px GaramondItalic'; ctx.globalAlpha = tween(u, la, la + 0.5); ctx.fillText('la·con·ic (adj.) — from Lakōnikos, “of Laconia”', W / 2, 410); ctx.globalAlpha = 1;
      // three words land like spear points
      [['SHORT', sh], ['SHARP', sa], ['TO THE POINT', po]].forEach(([t, at], i) => { const q = tween(u, at - 0.2, at + 0.2, ease.outBack); if (q <= 0) return; ctx.save(); ctx.translate(W / 2, 600 + i * 150); ctx.scale(q, q); k.poly(ctx, [[-260, -50], [220, -50], [300, 0], [220, 50], [-260, 50]], ['#a8281c', '#c9a227', '#2f5f8a'][i], P.ink, 3); ctx.fillStyle = P.paperLight; ctx.font = '900 54px Deco'; ctx.textAlign = 'center'; ctx.fillText(t, -10, 18); ctx.restore(); });
    },
  },
  { // 33.2 "Every legend has a beginning."
    start: 32.9, title: 'Every Legend Has a Beginning', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S, beg = S.at('beginning.');
      ctx.save(); S.cam(lerp(1.0, 1.4, tween(u, 0, beg)), W / 2, 600);
      ctx.fillStyle = '#efe2c0'; ctx.fillRect(-300, -300, W + 600, 1800); scrap(ctx, S, W / 2, 600, 2.4);
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
  { t: 0.2, type: 'slide', gain: 0.4 }, { t: 2.7, type: 'stamp', gain: 0.5 },
  { t: 4.6, type: 'waves', gain: 0.35 }, { t: 6.6, type: 'chime', gain: 0.4, pitch: 1.2 },
  ...Array.from({ length: 10 }, (_, i) => ({ t: +(8.4 + i * 0.18).toFixed(2), type: 'pluck', gain: 0.12, pitch: 1.2 + (i % 4) * 0.1 })), { t: 10.9, type: 'pop', gain: 0.45, pitch: 0.8 },
  { t: 14.2, type: 'stamp', gain: 0.35 }, { t: 17.4, type: 'whoosh', gain: 0.35 },
  ...Array.from({ length: 8 }, (_, i) => ({ t: +(19.1 + i * 0.3).toFixed(2), type: 'thud', gain: 0.22, pitch: 0.8 })), { t: 21.9, type: 'gong', gain: 0.45, pitch: 0.7 },
  { t: 23.8, type: 'paper', gain: 0.35 }, { t: 26.2, type: 'stamp', gain: 0.7 },
  { t: 28.5, type: 'chime', gain: 0.4, pitch: 1.3 }, { t: 29.9, type: 'whoosh', gain: 0.3 }, { t: 30.5, type: 'whoosh', gain: 0.3, pitch: 1.2 }, { t: 31.6, type: 'stamp', gain: 0.45 },
];

export const music = {
  bpm: 104, root: 'E', maqam: 'rast', gain: 0.3,
  sections: [
    { from: 0, to: 4.3, mood: 'intro' },
    { from: 4.3, to: 12.5, mood: 'groove' },
    { from: 12.5, to: 22.9, mood: 'drive' },
    { from: 22.9, to: 35.3, mood: 'triumph' },
    { from: 35.3, to: 37.0, mood: 'end' },
  ],
};
