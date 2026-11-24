// "Tested on Dogs, Taught Everywhere" — the Heimlich maneuver, told as a
// chronicle in print (`chronicle` device): a journal page, then a newspaper,
// then a class poster carry the story through 1974–75. The technique is never
// shown as a how-to — only a bottle-and-cork picture of the idea and gentle
// silhouettes; the dogs are shown happy and unharmed. Not medical advice.
import { clamp, lerp, ease, tween, rng, TAU } from '../../lib/core.mjs';
import { interior, bookCover } from '../../styles/ottoman/scenes.mjs';
import { act } from '../../styles/ottoman/acting.mjs';

export const meta = {
  title: 'Tested on Dogs, Taught Everywhere',
  slug: 'heimlich-ottoman',
  style: 'ottoman',
  look: 'night',    // night (after tile, album, karagoz)
  room: 'arches',
  device: 'chronicle',
  width: 1080, height: 1920, fps: 30,
  duration: 35.4,
  voice: 'voice.mp3',
  seed: 1974,
  captionChars: 30,
  brand: { handle: '@HOWITSTARTED-YT1', logo: '../../../brand/logo.png' },
  outro: { at: 33.7, text: 'Subscribe for more origin stories' },
};

const HEIMLICH = { robe: '#efefef', inner: '#3a4a6a', sash: '#efefef', hat: 'shorthair', hair: '#8a8a8a', glasses: true, skin: '#f1d1a8' };
const DINER = i => ({ robe: ['#9a2a1e', '#2f5f8a', '#3d6a4a', '#c9a227'][i % 4], inner: '#efe6cf', sash: '#3a2a1a', hat: ['shorthair', 'bun', 'cap', 'longhair'][i % 4], hatColor: '#3a3a4a', hair: ['#3a2a20', '#8a5a2a', '#1a1a1a', '#c9a46a'][i % 4], skin: ['#f1d1a8', '#c99a6e', '#8a5a3c', '#e2b48a'][i % 4] });

function journal(ctx, S, x, y, w, rot = -0.03, k1 = 1) {
  const { k, P } = S, h = w * 1.3;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(k1, k1);
  k.rect(ctx, -w / 2, -h / 2, w, h, '#efe6cf', P.ink, 2.5); k.rect(ctx, -w / 2, -h / 2, w, h * 0.2, '#c4371f', P.ink, 2);
  ctx.fillStyle = P.paperLight; ctx.font = `900 ${Math.round(w * 0.075)}px Deco`; ctx.textAlign = 'center'; ctx.fillText('EMERGENCY', 0, -h / 2 + h * 0.09); ctx.fillText('MEDICINE', 0, -h / 2 + h * 0.17);
  ctx.fillStyle = P.ink; ctx.font = `italic 700 ${Math.round(w * 0.07)}px GaramondItalic`; ctx.fillText('Pop Goes the', 0, -h / 2 + h * 0.34); ctx.fillText('Café Coronary', 0, -h / 2 + h * 0.42);
  ctx.font = `700 ${Math.round(w * 0.05)}px Fell`; ctx.fillText('JUNE 1974', 0, h / 2 - h * 0.08);
  for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(-w * 0.38, -h / 2 + h * 0.5 + i * h * 0.05); ctx.lineTo(w * 0.38, -h / 2 + h * 0.5 + i * h * 0.05); k.stroke(ctx, 'rgba(60,40,20,0.3)', 2); }
  ctx.restore();
}
// the idea, without a how-to: squeeze a bottle and the cork pops
function bottle(ctx, S, x, y, s, squeeze = 0) {
  const { k, P } = S;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const sq = 1 - squeeze * 0.18;
  ctx.beginPath(); ctx.moveTo(-50 * sq, 120); ctx.quadraticCurveTo(-70 * sq, 0, -50 * sq, -60); ctx.lineTo(-20, -120); ctx.lineTo(-20, -180); ctx.lineTo(20, -180); ctx.lineTo(20, -120); ctx.lineTo(50 * sq, -60); ctx.quadraticCurveTo(70 * sq, 0, 50 * sq, 120); ctx.closePath(); k.fillStroke(ctx, 'rgba(200,230,240,0.55)', P.ink, 3);
  const pop = clamp(squeeze * 1.4 - 0.3); ctx.save(); ctx.translate(0, -190 - pop * 200); ctx.rotate(pop * 3); k.rect(ctx, -18, -20, 36, 40, '#a8784a', P.ink, 2); ctx.restore();
  for (const sx of [-1, 1]) { ctx.save(); ctx.globalAlpha = squeeze; ctx.beginPath(); ctx.moveTo(sx * 120, 20); ctx.lineTo(sx * 80, 20); k.stroke(ctx, '#ffd27a', 6); k.poly(ctx, [[sx * 84, 6], [sx * 64, 20], [sx * 84, 34]], '#ffd27a', null); ctx.restore(); }
  if (pop > 0) for (let i = 0; i < 4; i++) { ctx.save(); ctx.globalAlpha = 0.6 * (1 - pop); k.circle(ctx, (i - 1.5) * 20, -200 - pop * 80, 8 + i * 2, '#ffffff', null); ctx.restore(); }
  ctx.restore();
}

export const scenes = [
  { // 0.0 "In 1974, a doctor published a trick for saving choking people that had only been tested on dogs."
    start: 0, title: 'Only Tested on Dogs',
    draw(ctx, u, S) {
      const { k, P, W } = S, pu = S.at('published'), on = S.at('only'), dg = S.at('dogs.');
      S.cam(lerp(1.15, 1.0, tween(u, 0, dg + 0.4, ease.inOut)), W / 2, 640);
      k.nightSky(ctx, -300, -300, W + 600, 1800, S.t);
      journal(ctx, S, 340, 520, 380, -0.06, tween(u, pu - 0.4, pu + 0.3, ease.outBack));
      // three beagles, tails wagging, look up at it
      const d = tween(u, on - 0.3, dg + 0.3);
      for (let i = 0; i < 3; i++) { const q = clamp(d * 3 - i); if (q > 0) { ctx.save(); ctx.globalAlpha = q; k.dog(ctx, 600 + i * 150, 1040 - (i % 2) * 20, 0.9, -1, S.t + i, { color: ['#c9a878', '#e8d8b8', '#a8784a'][i] }); ctx.restore(); } }
      k.seal(ctx, 840, 240, 64, ' THE YEAR · 1974 ·', '1974', tween(u, 0.1, 0.5, ease.linear));
    },
  },
  { // 8.0 "Dr. Henry Heimlich wrote about pushing air up from the lungs to pop the food out."
    start: 7.6, title: 'Push the Air Up', trans: 'ink',
    draw(ctx, u, S) {
      const { k, P, W } = S, he = S.at('Henry'), pu = S.at('pushing'), lu = S.at('lungs'), po = S.at('pop');
      S.cam(lerp(1.0, 1.15, tween(u, pu - 0.3, po + 0.6, ease.inOut)), lerp(W / 2, 620, tween(u, pu - 0.3, po + 0.6)), 680);
      interior(ctx, S, { arches: 2, carpet: false });
      k.figure(ctx, 260, 1000, { ...HEIMLICH, s: 1.1, face: 1, mood: 'calm', ...act('present', u, tween(u, he, he + 0.4)) });
      // the idea as a picture: squeeze the bottle, the cork flies
      bottle(ctx, S, 680, 760, 1.4, tween(u, pu - 0.2, po + 0.2, ease.inOut));
      k.label(ctx, 'HENRY HEIMLICH, SURGEON', 340, 560, 18, tween(u, he, he + 0.4));
      k.label(ctx, 'THE IDEA, NOT A HOW-TO', 680, 1040, 16, tween(u, lu, lu + 0.4));
    },
  },
  { // 13.5 "His article came out in June 1974."
    start: 13.2, title: 'June 1974', trans: 'page',
    draw(ctx, u, S) {
      const { k, P, W } = S, ju = S.at('June');
      S.cam(lerp(1.1, 1.0, tween(u, 0, 3.0, ease.inOut)), W / 2, 600);
      ctx.fillStyle = '#2a2030'; ctx.fillRect(-300, -300, W + 600, 1800);
      // the printing press runs off copies of the journal
      for (let i = 0; i < 5; i++) { const q = ((S.t * 0.6 + i * 0.2) % 1); journal(ctx, S, lerp(-200, 1280, q), 560 + Math.sin(q * Math.PI) * -80, 260, (q - 0.5) * 0.4, 1); }
      journal(ctx, S, W / 2, 600, 440, 0.02, tween(u, ju - 0.3, ju + 0.3, ease.outBack));
    },
  },
  { // 16.8 "Within weeks, a newspaper in the Seattle area reported someone had already used it to save a choking person."
    start: 16.5, title: 'Within Weeks', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, we = S.at('weeks,'), ne = S.at('newspaper'), se = S.at('Seattle'), sa = S.at('save');
      S.cam(lerp(1.0, 1.15, tween(u, sa - 0.4, sa + 1.2, ease.inOut)), W / 2, 680);
      k.nightSky(ctx, -300, -300, W + 600, 900, S.t);
      // a diner at night, lit windows; inside, one person helps another from behind — silhouettes only
      k.rect(ctx, 100, 420, 880, 560, '#3a2a2a', P.ink, 3); k.rect(ctx, 140, 470, 800, 320, 'rgba(255,214,120,0.85)', P.ink, 2);
      ctx.fillStyle = '#c4371f'; ctx.font = '900 54px Deco'; ctx.textAlign = 'center'; ctx.fillText('DINER', W / 2, 400);
      const help = tween(u, sa - 0.8, sa + 0.4), ok = tween(u, sa + 0.2, sa + 1.0);
      ctx.save(); ctx.beginPath(); ctx.rect(140, 470, 800, 320); ctx.clip();
      k.figure(ctx, 480, 800, { robe: '#2a2a2a', inner: '#2a2a2a', sash: '#2a2a2a', hat: 'shorthair', hair: '#2a2a2a', skin: '#2a2a2a', s: 0.85, face: 1, mood: ok > 0.5 ? 'happy' : 'calm', ...act(ok > 0.5 ? 'cheer' : 'worry', u, ok > 0.5 ? ok : help) });
      if (help > 0 && ok < 1) { ctx.save(); ctx.globalAlpha = 1 - ok; k.figure(ctx, 420, 800, { robe: '#1a1a1a', inner: '#1a1a1a', sash: '#1a1a1a', hat: 'cap', hatColor: '#1a1a1a', skin: '#1a1a1a', s: 0.9, face: 1, armF: [1.5, 0.3] }); ctx.restore(); }
      ctx.restore();
      const np = tween(u, ne - 0.3, se + 0.4, ease.outBack); if (np > 0) { ctx.save(); ctx.translate(800, 960); ctx.scale(np, np); k.newspaper(ctx, 0, 0, 300, 0.08, 'SAVED!', 'THE EVENING PAPER'); ctx.restore(); }
      k.label(ctx, 'WASHINGTON STATE · SUMMER 1974', W / 2, 1080, 16, tween(u, se, se + 0.4));
    },
  },
  { // 23.6 "Soon, people called it the Heimlich maneuver, a trick tested on dogs, now taught around the world."
    start: 23.2, title: 'Taught Around the World', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S, ca = S.at('called'), ma = S.at('maneuver,'), dg = S.at('dogs,'), wo = S.at('world.');
      S.cam(lerp(1.0, 1.12, tween(u, 0, 7.0)), W / 2, 640);
      interior(ctx, S, { arches: 3, carpetColor: '#2f5f8a' });
      // a class: people paired up on a mat, a poster of the bottle idea; a beagle in the corner
      const n = tween(u, ma - 0.3, wo + 0.4);
      for (let i = 0; i < Math.floor(n * 6); i++) k.figure(ctx, 180 + i * 150, 1000, { ...DINER(i), s: 0.6, face: i % 2 ? -1 : 1, mood: 'happy', armF: [1.0, 0.4] });
      ctx.save(); ctx.translate(W / 2, 420); k.rect(ctx, -170, -150, 340, 300, '#efe6cf', P.ink, 3); bottle(ctx, S, 0, 60, 0.6, 0.5 + 0.5 * Math.sin(S.t * 2)); ctx.restore();
      const nm = tween(u, ca - 0.2, ma + 0.2, ease.linear); if (nm > 0) { ctx.save(); ctx.globalAlpha = Math.min(1, nm * 4); k.rect(ctx, W / 2 - 370, 588, 740, 84, P.navy || '#1c2a52', P.gold, 3); ctx.restore(); } ctx.fillStyle = P.goldLight; ctx.font = '900 50px Deco'; ctx.textAlign = 'center'; ctx.fillText('HEIMLICH MANEUVER'.slice(0, Math.ceil(17 * nm)), W / 2, 646);
      k.dog(ctx, 830, 1060, 0.7, -1, S.t, { color: '#c9a878' });
      k.label(ctx, 'THE NAME STUCK BY 1975', W / 2, 1080, 16, tween(u, dg, dg + 0.4));
    },
  },
  { // 31.2 "Every legend has a beginning."
    start: 31.0, title: 'Every Legend Has a Beginning', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S, beg = S.at('beginning.');
      ctx.save(); S.cam(lerp(1.0, 1.4, tween(u, 0, beg)), W / 2, 640);
      k.nightSky(ctx, -300, -300, W + 600, 1800, S.t); journal(ctx, S, W / 2, 560, 420, 0.02); k.dog(ctx, 760, 1040, 0.9, -1, S.t, { color: '#c9a878' });
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
  { t: 0.3, type: 'stamp', gain: 0.4 }, { t: 2.4, type: 'paper', gain: 0.35 }, { t: 6.0, type: 'pop', gain: 0.3, pitch: 1.4 }, { t: 6.5, type: 'pop', gain: 0.3, pitch: 1.6 },
  { t: 9.8, type: 'whoosh', gain: 0.3 }, { t: 11.7, type: 'pop', gain: 0.55, pitch: 0.9 },
  ...Array.from({ length: 6 }, (_, i) => ({ t: +(13.4 + i * 0.4).toFixed(2), type: 'clank', gain: 0.15, pitch: 1.3 })), { t: 15.0, type: 'stamp', gain: 0.4 },
  { t: 17.0, type: 'paper', gain: 0.3 }, { t: 19.0, type: 'pop', gain: 0.3 }, { t: 21.8, type: 'pop', gain: 0.45, pitch: 0.9 }, { t: 22.4, type: 'chime', gain: 0.45, pitch: 1.3 },
  { t: 25.2, type: 'riser', gain: 0.35 }, { t: 25.8, type: 'chime', gain: 0.4, pitch: 1.2 }, { t: 30.0, type: 'gong', gain: 0.5 },
];

export const music = {
  bpm: 96, root: 'F', maqam: 'nihavend', gain: 0.28,
  sections: [
    { from: 0, to: 7.6, mood: 'intro' },
    { from: 7.6, to: 16.5, mood: 'groove' },
    { from: 16.5, to: 23.2, mood: 'drive' },
    { from: 23.2, to: 33.7, mood: 'triumph' },
    { from: 33.7, to: 35.4, mood: 'end' },
  ],
};
