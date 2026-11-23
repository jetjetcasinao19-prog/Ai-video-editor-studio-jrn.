// "The Man Who Dug Through Troy" — told in letters (`letters` device): Calvert's
// letter sends Schliemann to the hill, Schliemann's telegram announces the
// gold, and the Ottoman government's lawsuit follows the smuggled crates. The
// hill itself returns as a cut-away cake of nine cities (Troy I at the bottom,
// IX on top), so the viewer can see what the great trench went through.
// In 1873 the hill was in the Ottoman Empire: Ottoman officials wear the fez.
import { clamp, lerp, ease, tween, rng, TAU } from '../../lib/core.mjs';
import { interior, bookCover } from '../../styles/ottoman/scenes.mjs';
import { act } from '../../styles/ottoman/acting.mjs';

export const meta = {
  title: 'The Man Who Dug Through Troy',
  slug: 'troy-ottoman',
  style: 'ottoman',
  look: 'tile',     // tile (after ledger, night, scroll)
  ambient: 'dust',
  room: 'library',
  device: 'letters',
  width: 1080, height: 1920, fps: 30,
  duration: 56.4,
  voice: 'voice.mp3',
  seed: 1873,
  captionChars: 30,
  brand: { handle: '@HOWITSTARTED-YT1', logo: '../../../brand/logo.png' },
  outro: { at: 54.6, text: 'Subscribe for more origin stories' },
};

const SCHLIEMANN = { robe: '#2a2a3a', inner: '#efe6cf', sash: '#2a2a3a', hat: 'shorthair', hair: '#6a5a4a', mustache: true, mustacheColor: '#4a3a2a', glasses: true, skin: '#f1d1a8' };
const CALVERT = { robe: '#4a4a3a', inner: '#efe6cf', sash: '#4a4a3a', hat: 'stovepipe', hair: '#8a6a4a', beard: true, beardColor: '#8a6a4a', skin: '#f1d1a8' };
const OTTOMAN = i => ({ robe: ['#2a3a5a', '#3a2a2a'][i % 2], inner: '#efe6cf', sash: '#9a2a1e', hat: 'fez', hatColor: '#b0241a', mustache: true, mustacheColor: '#2a1c12', skin: ['#d9a882', '#c99a6e'][i % 2] });
const WORKER = i => ({ robe: ['#8a7a5a', '#6a5a4a', '#7a6a4a'][i % 3], inner: '#d8c9a8', sash: '#9a2a1e', hat: i % 2 ? 'fez' : 'turban', hatColor: '#9a2a1e', mustache: true, skin: ['#c99a6e', '#d9a882', '#b88a5e'][i % 3] });

// ---------- the hill of nine cities, cut open ----------
const LAYERS = ['#7a5a3a', '#c9a227', '#8a6a4a', '#a8784a', '#6a5a4a', '#b0905a', '#9a7a5a', '#c4a070', '#d8c08a']; // I (bottom) … IX (top)
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];
// the hill: a mound whose 9 bands are drawn bottom-up; trench(k) cuts a wedge down its middle
function hillCake(ctx, S, x, base, w, h, o = {}) {
  const { k, P } = S, bh = h / 9;
  ctx.save(); ctx.translate(x, base);
  ctx.beginPath(); ctx.moveTo(-w / 2, 0); ctx.lineTo(-w / 2, -h * 0.75); ctx.quadraticCurveTo(-w * 0.35, -h, 0, -h); ctx.quadraticCurveTo(w * 0.35, -h, w / 2, -h * 0.75); ctx.lineTo(w / 2, 0); ctx.closePath();
  ctx.save(); ctx.clip();
  for (let i = 0; i < 9; i++) { const y = -(i + 1) * bh; ctx.fillStyle = LAYERS[i]; ctx.fillRect(-w / 2, y, w, bh + 1); ctx.fillStyle = 'rgba(40,20,10,0.25)'; for (let j = 0; j < 14; j++) ctx.fillRect(-w / 2 + ((j * 97 + i * 31) % w), y + bh * 0.4, 18, 6); ctx.beginPath(); ctx.moveTo(-w / 2, y); ctx.lineTo(w / 2, y); k.stroke(ctx, 'rgba(40,20,10,0.5)', 1.5); }
  if (o.glow != null) { const i = o.glow, y = -(i + 0.5) * bh; ctx.save(); ctx.globalAlpha = o.glowA ?? 1; const g = ctx.createRadialGradient(0, y, 4, 0, y, w * 0.4); g.addColorStop(0, 'rgba(255,220,120,0.9)'); g.addColorStop(1, 'rgba(255,220,120,0)'); ctx.fillStyle = g; ctx.fillRect(-w / 2, y - bh * 2, w, bh * 4); ctx.restore(); }
  const tr = o.trench || 0;
  if (tr > 0) { const d = h * 0.92 * tr, tw = w * 0.22; ctx.beginPath(); ctx.moveTo(-tw, -h - 10); ctx.lineTo(-tw * 0.55, -h + d); ctx.lineTo(tw * 0.55, -h + d); ctx.lineTo(tw, -h - 10); ctx.closePath(); ctx.fillStyle = '#e8d6a8'; ctx.fill(); k.stroke(ctx, P.ink, 2.5); }
  ctx.restore();
  ctx.beginPath(); ctx.moveTo(-w / 2, 0); ctx.lineTo(-w / 2, -h * 0.75); ctx.quadraticCurveTo(-w * 0.35, -h, 0, -h); ctx.quadraticCurveTo(w * 0.35, -h, w / 2, -h * 0.75); ctx.lineTo(w / 2, 0); k.stroke(ctx, P.ink, 3);
  if (o.numerals) { ctx.fillStyle = P.ink; ctx.font = '700 24px Fell'; ctx.textAlign = 'left'; for (let i = 0; i < 9; i++) ctx.fillText(ROMAN[i], -w / 2 + 14, -(i + 0.5) * bh + 8); }
  ctx.restore();
}
function telegram(ctx, S, x, y, w, lines, k1, rot = 0) {
  const { k, P } = S;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  k.rect(ctx, -w / 2, -w * 0.32, w, w * 0.64, '#f3e6c4', P.ink, 2.5);
  ctx.fillStyle = P.ink; ctx.font = '700 22px Fell'; ctx.textAlign = 'center'; ctx.fillText('TELEGRAM', 0, -w * 0.32 + 34);
  k.rect(ctx, -w / 2 + 24, -w * 0.32 + 46, w - 48, 3, P.ink, null);
  ctx.font = '700 30px Fell'; lines.forEach((l, i) => { const q = clamp(k1 * lines.length - i); if (q > 0) ctx.fillText(l.slice(0, Math.ceil(l.length * q)), 0, -w * 0.32 + 100 + i * 44); });
  ctx.restore();
}
function treasure(ctx, S, x, y, s, t = 0) {
  const { k, P } = S;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  k.ellipse(ctx, 0, 0, 120, 30, 0, '#c9a227', P.ink, 2);
  ctx.beginPath(); ctx.moveTo(-60, -10); ctx.quadraticCurveTo(-70, -90, -30, -100); ctx.lineTo(30, -100); ctx.quadraticCurveTo(70, -90, 60, -10); k.fillStroke(ctx, '#e8c050', P.ink, 2); // a gold sauceboat-cup
  for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.moveTo(-90 + i * 30, -40); ctx.lineTo(-90 + i * 30, 10); k.stroke(ctx, '#e8c050', 4); for (let j = 0; j < 5; j++) k.circle(ctx, -90 + i * 30, -36 + j * 10, 3, '#f0d060', null); } // a diadem's chains
  for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + t; k.star(ctx, Math.cos(a) * 140, -50 + Math.sin(a) * 60, 10, (Math.sin(t * 4 + i) + 1) / 2); }
  ctx.restore();
}

export const scenes = [
  { // 0.0 "The man famous for finding Troy may have destroyed the real Troy."
    start: 0, title: 'Finding Troy, Destroying Troy',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const fi = S.at('finding'), de = S.at('destroyed'), re = S.at('real');
      S.cam(lerp(0.95, 1.35, tween(u, de - 0.3, re + 0.8, ease.inOut)), W / 2, lerp(620, 600, tween(u, de, re + 0.8)));
      k.goldSky(ctx, -300, -300, W + 600, 900, S.t);
      k.ground(ctx, -300, 1000, W + 600, 600, '#8aa068', 3, 0.2);
      hillCake(ctx, S, W / 2, 1000, 900, 640, { trench: tween(u, fi, re + 0.4, ease.inOut), numerals: true });
      // the layer Homer's Troy may be in: it crumbles as the trench passes
      const cr = tween(u, de - 0.2, re + 0.6);
      if (cr > 0) { const R = rng(4); for (let i = 0; i < 24; i++) { const q = clamp(cr * 1.4 - R() * 0.4); k.rect(ctx, W / 2 + (R() - 0.5) * 180 + (R() - 0.5) * 300 * q, 1000 - 640 * 6 / 9 + q * 300 + R() * 30, 14, 10, LAYERS[5], P.ink, 1); } }
      k.label(ctx, 'HOMER’S TROY: LAYER VI OR VII?', W / 2, 260, 20, tween(u, re, re + 0.4));
    },
  },
  { // 6.3 "For centuries, people think the Trojan War is just a myth from Homer."
    start: 6.0, title: 'Just a Myth?', trans: 'page',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const tr = S.at('Trojan'), my = S.at('myth'), ho = S.at('Homer.');
      S.cam(lerp(1.0, 1.15, tween(u, tr - 0.3, ho + 0.6, ease.inOut)), lerp(W / 2, 640, tween(u, tr, ho + 0.6)), 620);
      interior(ctx, S, { arches: 2, carpet: false });
      // the blind poet with his lyre; above him, the war he sings rises as pictures
      k.figure(ctx, 280, 1000, { robe: '#efe6cf', inner: '#2f5f8a', sash: '#2f5f8a', hat: 'wreath', hair: '#cfcfcf', beard: true, beardColor: '#dddddd', skin: '#e2b48a', s: 1.1, face: 1, mood: 'calm', armF: [1.0 + Math.sin(S.t * 3) * 0.1, 0.8] });
      ctx.save(); ctx.translate(380, 760); ctx.rotate(-0.2); ctx.beginPath(); ctx.moveTo(-30, 60); ctx.quadraticCurveTo(-50, -20, -20, -70); ctx.moveTo(30, 60); ctx.quadraticCurveTo(50, -20, 20, -70); k.stroke(ctx, '#7a5a3a', 6); k.rect(ctx, -26, -76, 52, 10, '#7a5a3a', P.ink, 1); for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-16 + i * 8, -66); ctx.lineTo(-16 + i * 8, 50); k.stroke(ctx, '#e8d8a8', 1.5); } ctx.restore();
      const sing = tween(u, tr - 0.3, my + 0.4);
      if (sing > 0) { ctx.save(); ctx.globalAlpha = sing; k.cartouche(ctx, 720, 520, 520, 420, '#f6efdc', P.goldDark, 4);
        // the wooden horse inside the city walls, as a picture in the air
        k.rect(ctx, 520, 600, 400, 120, '#d8c9a8', P.ink, 2); for (let i = 0; i < 10; i++) k.rect(ctx, 520 + i * 40, 586, 22, 16, '#d8c9a8', P.ink, 1);
        ctx.save(); ctx.translate(720, 560); k.ellipse(ctx, 0, 0, 90, 40, 0, '#a8784a', P.ink, 2); k.rect(ctx, 50, -110, 40, 90, '#a8784a', P.ink, 2); k.ellipse(ctx, 96, -110, 40, 22, 0.2, '#a8784a', P.ink, 2); for (const lx of [-60, -30, 30, 60]) k.rect(ctx, lx - 6, 30, 12, 50, '#8a6038', P.ink, 1.5); k.circle(ctx, -50, 90, 12, '#5a3a1a', P.ink, 1.5); k.circle(ctx, 50, 90, 12, '#5a3a1a', P.ink, 1.5); ctx.restore();
        ctx.restore(); }
      const q = tween(u, my - 0.1, my + 0.4); if (q > 0) { ctx.save(); ctx.globalAlpha = q; ctx.fillStyle = P.vermDark; ctx.font = '900 110px Deco'; ctx.textAlign = 'center'; ctx.fillText('?', 980, 400); ctx.restore(); }
      k.label(ctx, 'THE ILIAD', 720, 330, 22, tween(u, ho, ho + 0.4));
    },
  },
  { // 11.0 "Then a British official, Frank Calvert, becomes convinced Troy lies under a hill in Turkey called Hisarlik."
    start: 10.7, title: 'Frank Calvert’s Hill', trans: 'ink',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const fr = S.at('Frank'), co = S.at('convinced'), un = S.at('under'), hi = S.at('hill'), hs = S.at('Hisarlik.');
      S.cam(lerp(1.2, 0.95, tween(u, co - 0.3, hs + 0.6, ease.inOut)), lerp(320, W / 2, tween(u, co - 0.3, hs + 0.6)), lerp(760, 620, tween(u, co - 0.3, hs + 0.6)));
      k.goldSky(ctx, -300, -300, W + 600, 900, S.t);
      k.hills(ctx, W, 420, 8, ['#a8b878', '#8aa068', '#6a8a58'], S.t);
      k.ground(ctx, -300, 510, W + 600, 1100, '#8aa068', 8, 0.3);
      // the plain of Troy, the sea beyond, and the low hill he walked every day
      ctx.save(); ctx.beginPath(); ctx.rect(800, 470, 600, 60); ctx.clip(); k.waves(ctx, 800, 470, 600, 60, S.t, '#3f6f9a', '#6f9cc0', 12, 16); ctx.restore();
      const xr = tween(u, un - 0.2, hi + 0.6);
      ctx.beginPath(); ctx.moveTo(480, 820); ctx.quadraticCurveTo(720, 600, 960, 820); ctx.closePath(); k.fillStroke(ctx, '#b0a070', P.ink, 2.5);
      if (xr > 0) { ctx.save(); ctx.beginPath(); ctx.moveTo(480, 820); ctx.quadraticCurveTo(720, 600, 960, 820); ctx.closePath(); ctx.clip(); ctx.globalAlpha = xr; hillCake(ctx, S, 720, 820, 480, 220, {}); ctx.restore(); }
      k.figure(ctx, 280, 1000, { ...CALVERT, s: 1.1, face: 1, mood: 'calm', ...act(u > co ? 'point' : 'think', u, tween(u, co - 0.2, co + 0.3)) });
      k.label(ctx, 'FRANK CALVERT', 280, 560, 22, tween(u, fr, fr + 0.4));
      k.label(ctx, 'HISARLIK · OTTOMAN EMPIRE, TODAY TURKEY', 720, 900, 16, tween(u, hs, hs + 0.4));
    },
  },
  { // 19.0 "In 1870, a rich German businessman, Heinrich Schliemann, arrives, on Calvert's advice."
    start: 18.6, title: 'Schliemann Arrives', trans: 'page',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const ri = S.at('rich'), he = S.at('Heinrich'), ar = S.at('arrives,'), ad = S.at('advice.');
      S.cam(lerp(1.0, 1.2, tween(u, ar - 0.2, ad + 0.6, ease.inOut)), lerp(W / 2, 640, tween(u, ar - 0.2, ad + 0.6)), 680);
      interior(ctx, S, { arches: 3, carpetColor: '#2f5f8a' });
      k.seal(ctx, 160, 200, 64, ' THE YEAR · 1870 ·', '1870', tween(u, 0.1, 0.5, ease.linear));
      // money bags from his trading fortune, and the letter that sent him here
      const bags = tween(u, ri - 0.2, ri + 0.6, ease.outBack);
      for (let i = 0; i < 3; i++) { ctx.save(); ctx.translate(170 + i * 80, 1000); ctx.scale(bags, bags); ctx.beginPath(); ctx.moveTo(-34, 0); ctx.quadraticCurveTo(-44, -60, -10, -70); ctx.lineTo(10, -70); ctx.quadraticCurveTo(44, -60, 34, 0); ctx.closePath(); k.fillStroke(ctx, '#c9a878', P.ink, 2); ctx.fillStyle = P.ink; ctx.font = '700 24px Fell'; ctx.textAlign = 'center'; ctx.fillText('$', 0, -24); ctx.restore(); }
      const walk = tween(u, he - 0.6, ar + 0.4, ease.outCubic);
      k.figure(ctx, lerp(1220, 560, walk), 1000, { ...SCHLIEMANN, s: 1.1, face: -1, walk: walk < 1 ? S.t * 6 : null, mood: 'happy', ...act(walk >= 1 ? 'present' : 'rest', u, tween(u, ar, ar + 0.3)) });
      k.figure(ctx, 880, 1000, { ...CALVERT, s: 1.05, face: -1, mood: 'calm' });
      k.letter(ctx, 720, 440, 380, 200, ['Dear Sir — dig', 'at Hisarlik.', '— F. Calvert'], tween(u, ad - 0.6, ad + 0.4), 0.04);
      k.label(ctx, 'HEINRICH SCHLIEMANN', 560, 600, 20, tween(u, he, he + 0.4));
    },
  },
  { // 25.5 "He cuts a giant trench straight through the hill, tossing away layers he thinks are too young."
    start: 25.1, title: 'The Great Trench', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const cu = S.at('cuts'), tr = S.at('trench'), hi = S.at('hill,'), to = S.at('tossing'), yo = S.at('young.');
      S.cam(lerp(1.0, 1.3, tween(u, to - 0.3, yo + 0.6, ease.inOut)), W / 2, lerp(640, 520, tween(u, to - 0.3, yo + 0.6)));
      k.goldSky(ctx, -300, -300, W + 600, 700, S.t);
      k.ground(ctx, -300, 1000, W + 600, 600, '#8aa068', 3, 0.2);
      const cut = tween(u, cu - 0.2, hi + 0.8, ease.inOut);
      hillCake(ctx, S, W / 2, 1000, 900, 640, { trench: cut, numerals: true });
      // the workers, lines of them, and baskets of layers flung onto the spoil heap
      for (let i = 0; i < 6; i++) { const sw = Math.sin(S.t * 8 + i); k.figure(ctx, 120 + i * 170, 360 - (i % 2) * 6, { ...WORKER(i), s: 0.38, face: i < 3 ? 1 : -1, armF: [1.7 + sw * 0.4, 0.2] }); }
      const toss = tween(u, to - 0.2, yo + 0.6);
      if (toss > 0) for (let i = 0; i < 14; i++) { const q = ((S.t * 0.9 + i * 0.13) % 1); const lay = 8 - (i % 4); const x = lerp(W / 2, i % 2 ? 1020 : 60, q), y = lerp(500, 980, q) - Math.sin(q * Math.PI) * 260; ctx.save(); ctx.globalAlpha = toss; k.rect(ctx, x - 12, y - 8, 24, 16, LAYERS[lay], P.ink, 1); ctx.restore(); }
      if (toss > 0) { ctx.save(); ctx.globalAlpha = toss; for (const x of [60, 1020]) { ctx.beginPath(); ctx.moveTo(x - 110, 1000); ctx.quadraticCurveTo(x, 900 - toss * 60, x + 110, 1000); ctx.closePath(); k.fillStroke(ctx, '#a8906a', P.ink, 2); } ctx.restore(); }
      k.label(ctx, 'ABOUT 40 M WIDE · 17 M DEEP', W / 2, 200, 18, tween(u, tr, tr + 0.4));
    },
  },
  { // 32.4 "In 1873, he announces Priam's Treasure, gold of Troy's legendary king."
    start: 31.9, title: 'Priam’s Treasure', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const an = S.at('announces'), pr = S.at("Priam's"), go = S.at('gold'), ki = S.at('king.');
      S.cam(lerp(1.0, 1.2, tween(u, go - 0.3, ki + 0.6, ease.inOut)), W / 2, lerp(600, 720, tween(u, go - 0.3, ki + 0.6)));
      ctx.fillStyle = '#2a1e2e'; ctx.fillRect(-300, -300, W + 600, 1800);
      const g = ctx.createRadialGradient(W / 2, 860, 20, W / 2, 860, 700); g.addColorStop(0, 'rgba(255,214,120,0.6)'); g.addColorStop(1, 'rgba(255,214,120,0)'); ctx.fillStyle = g; ctx.fillRect(-300, -300, W + 600, 1800);
      k.seal(ctx, 900, 160, 60, ' THE YEAR · 1873 ·', '1873', tween(u, 0.1, 0.5, ease.linear));
      telegram(ctx, S, W / 2, 380, 640, ['TREASURE OF PRIAM', 'FOUND AT TROY', '— SCHLIEMANN'], tween(u, an - 0.3, pr + 1.0, ease.linear), -0.03);
      treasure(ctx, S, W / 2, 900, tween(u, go - 0.4, go + 0.3, ease.outBack) * 1.5, S.t);
    },
  },
  { // 39.4 "But it's from a layer about 1,000 years older than Homer's Troy,"
    start: 39.0, title: 'The Wrong Layer', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const la = S.at('layer'), th = S.at('1,000'), ho = S.at("Homer's");
      S.cam(lerp(1.0, 1.2, tween(u, la - 0.2, ho + 0.6, ease.inOut)), lerp(W / 2, 460, tween(u, la - 0.2, ho + 0.6)), 640);
      ctx.fillStyle = '#efe6cf'; ctx.fillRect(-300, -300, W + 600, 1800); for (let y = 100; y < 1100; y += 60) { ctx.beginPath(); ctx.moveTo(-300, y); ctx.lineTo(W + 300, y); k.stroke(ctx, 'rgba(60,90,140,0.15)', 1.5); }
      hillCake(ctx, S, W / 2, 1000, 900, 640, { trench: 1, numerals: true, glow: 1, glowA: tween(u, la - 0.3, la + 0.3) });
      // arrows: the gold sits in layer II; Homer's Troy is up in VI or VII
      const bh = 640 / 9, yII = 1000 - 1.5 * bh, yVI = 1000 - 6.5 * bh, ar = tween(u, th - 0.3, ho + 0.4);
      ctx.save(); ctx.globalAlpha = ar; ctx.beginPath(); ctx.moveTo(640, yII); ctx.lineTo(640, yVI); k.stroke(ctx, P.vermDark, 6); k.poly(ctx, [[624, yVI + 20], [640, yVI - 4], [656, yVI + 20]], P.vermDark, null); ctx.fillStyle = P.vermDark; ctx.font = '900 30px Deco'; ctx.textAlign = 'right'; ctx.fillText('~1,000+', 625, (yII + yVI) / 2 - 16); ctx.fillText('YEARS', 625, (yII + yVI) / 2 + 20); ctx.restore();
      k.label(ctx, 'GOLD · TROY II · c. 2400 BC', 360, yII, 16, tween(u, la, la + 0.4));
      k.label(ctx, 'HOMER’S TROY · c. 1200 BC', 360, yVI - 20, 16, tween(u, ho - 0.2, ho + 0.3));
    },
  },
  { // 44.4 "and he smuggles it out of the country."
    start: 44.0, title: 'Smuggled Out', trans: 'ink',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const sm = S.at('smuggles'), co = S.at('country.');
      S.cam(lerp(1.15, 0.95, tween(u, 0, co + 0.8, ease.inOut)), lerp(380, W / 2, tween(u, 0, co + 0.8)), 640);
      k.nightSky(ctx, -300, -300, W + 600, 900, S.t); k.moon(ctx, 880, 200, 50);
      ctx.save(); ctx.beginPath(); ctx.rect(-300, 760, W + 600, 900); ctx.clip(); k.waves(ctx, -300, 760, W + 600, 900, S.t, '#2a4a6a', '#4a6a8a', 14, 26); ctx.restore();
      // crates slip onto a boat by night…
      const go = tween(u, sm - 0.4, co + 0.8, ease.inOut);
      ctx.save(); ctx.translate(lerp(380, 860, go), 820 + Math.sin(S.t * 2) * 6); k.poly(ctx, [[-180, 0], [180, 0], [140, 60], [-140, 60]], '#5a3a1a', P.ink, 2.5); for (let i = 0; i < 3; i++) k.rect(ctx, -120 + i * 80, -60, 70, 60, '#a8784a', P.ink, 2); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -260); k.stroke(ctx, '#5a3a1a', 6); k.poly(ctx, [[6, -250], [140, -110], [6, -100]], '#efe6cf', P.ink, 2); ctx.restore();
      // …and the Ottoman officials arrive on the shore, too late, papers in hand
      const of = tween(u, co - 0.6, co + 0.4, ease.outCubic);
      for (let i = 0; i < 2; i++) k.figure(ctx, lerp(-200, 120 + i * 120, of), 760, { ...OTTOMAN(i), s: 0.75, face: 1, mood: 'sad', ...act(i ? 'angry' : 'point', u, of) });
      k.label(ctx, 'THE OTTOMAN GOVERNMENT TOOK HIM TO COURT', W / 2, 1060, 16, tween(u, co, co + 0.4));
    },
  },
  { // 47.4 "A legend found, and nearly ruined, by its hunter."
    start: 46.9, title: 'Found and Nearly Ruined', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const fo = S.at('found,'), ru = S.at('ruined,'), hu = S.at('hunter.');
      S.cam(lerp(1.3, 0.95, tween(u, fo - 0.2, hu + 0.6, ease.inOut)), W / 2, lerp(520, 640, tween(u, fo - 0.2, hu + 0.6)));
      k.goldSky(ctx, -300, -300, W + 600, 700, S.t);
      k.ground(ctx, -300, 1000, W + 600, 600, '#8aa068', 3, 0.2);
      hillCake(ctx, S, W / 2, 1000, 900, 640, { trench: 1 });
      // the scar today: a gap through the cities, and the hunter at its lip
      const scar = tween(u, ru - 0.3, ru + 0.5);
      ctx.save(); ctx.globalAlpha = scar; ctx.setLineDash([12, 10]); ctx.beginPath(); ctx.moveTo(W / 2 - 200, 340); ctx.lineTo(W / 2 - 110, 900); ctx.lineTo(W / 2 + 110, 900); ctx.lineTo(W / 2 + 200, 340); k.stroke(ctx, P.vermDark, 5); ctx.restore();
      k.figure(ctx, W / 2 + 300, 360, { ...SCHLIEMANN, s: 0.7, face: -1, mood: u > ru ? 'sad' : 'happy', ...act(u > ru ? 'shrug' : 'cheer', u, tween(u, fo, fo + 0.3)) });
      k.label(ctx, '“SCHLIEMANN’S TRENCH” IS STILL THERE', W / 2, 200, 18, tween(u, hu, hu + 0.4));
    },
  },
  { // 52.0 "Every legend has a beginning."
    start: 51.8, title: 'Every Legend Has a Beginning', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S, beg = S.at('beginning.');
      ctx.save(); S.cam(lerp(1.0, 1.4, tween(u, 0, beg)), W / 2, 700);
      k.nightSky(ctx, -300, -300, W + 600, 1000, S.t); k.ground(ctx, -300, 1000, W + 600, 600, '#5a7a48', 3, 0.2);
      hillCake(ctx, S, W / 2, 1000, 900, 640, { trench: 1, numerals: true });
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
  ...Array.from({ length: 8 }, (_, i) => ({ t: +(1.3 + i * 0.3).toFixed(2), type: 'thud', gain: 0.25, pitch: 0.9 })), { t: 3.6, type: 'crack', gain: 0.5 }, { t: 4.4, type: 'crack', gain: 0.45 },
  { t: 7.9, type: 'pluck', gain: 0.3 }, { t: 8.4, type: 'pluck', gain: 0.3, pitch: 1.2 }, { t: 9.3, type: 'pop', gain: 0.35 },
  { t: 13.6, type: 'chime', gain: 0.35, pitch: 1.2 }, { t: 15.6, type: 'whoosh', gain: 0.3 },
  { t: 19.1, type: 'stamp', gain: 0.45 }, { t: 20.4, type: 'coins', gain: 0.4 }, { t: 23.2, type: 'thud', gain: 0.3 }, { t: 24.4, type: 'paper', gain: 0.35 },
  ...Array.from({ length: 10 }, (_, i) => ({ t: +(26.1 + i * 0.3).toFixed(2), type: 'thud', gain: 0.22, pitch: 0.8 })), { t: 29.3, type: 'whoosh', gain: 0.3 }, { t: 30.4, type: 'crack', gain: 0.4 },
  { t: 32.3, type: 'stamp', gain: 0.45 }, ...Array.from({ length: 6 }, (_, i) => ({ t: +(33.7 + i * 0.12).toFixed(2), type: 'pluck', gain: 0.18, pitch: 1.6 })), { t: 36.3, type: 'chime', gain: 0.55, pitch: 1.4 }, { t: 37.6, type: 'gong', gain: 0.45 },
  { t: 39.9, type: 'riser', gain: 0.35 }, { t: 42.7, type: 'thud', gain: 0.5, pitch: 0.6 },
  { t: 44.3, type: 'waves', gain: 0.45 }, { t: 45.9, type: 'alarm', gain: 0.12 },
  { t: 47.3, type: 'pop', gain: 0.3 }, { t: 49.3, type: 'crack', gain: 0.45 }, { t: 50.6, type: 'gong', gain: 0.55 },
];

export const music = {
  bpm: 98, root: 'D', maqam: 'nihavend', gain: 0.3,
  sections: [
    { from: 0, to: 6.0, mood: 'intro' },
    { from: 6.0, to: 18.6, mood: 'groove' },
    { from: 18.6, to: 31.9, mood: 'drive' },
    { from: 31.9, to: 39.0, mood: 'triumph' },
    { from: 39.0, to: 46.9, mood: 'sad' },
    { from: 46.9, to: 54.6, mood: 'groove' },
    { from: 54.6, to: 56.4, mood: 'end' },
  ],
};
