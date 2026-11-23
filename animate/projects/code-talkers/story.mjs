// "The Code That Was Never Broken" — the Navajo Code Talkers, told as a rug being
// woven (`loom` device): a loom opens the story, and the finished rug closes it.
// The real people are shown with respect, in correct WWII Marine uniforms; the rug
// pattern is generic, not a copy of a specific design. Code words are given only by
// their well-documented English meanings, not in Navajo spelling.
import { clamp, lerp, ease, tween, rng, TAU, shake, pop } from '../../lib/core.mjs';
import { bookCover, medallion } from '../../styles/ottoman/scenes.mjs';
import { act } from '../../styles/ottoman/acting.mjs';

export const meta = {
  title: 'The Code That Was Never Broken',
  slug: 'code-talkers-ottoman',
  style: 'ottoman',
  look: 'scroll',   // hanging scroll (after night, ledger, album)
  ambient: 'dust',
  room: 'lattice',
  device: 'loom',
  width: 1080, height: 1920, fps: 30,
  duration: 53.3,
  voice: 'voice.mp3',
  seed: 201,
  captionChars: 30,
  brand: { handle: '@HOWITSTARTED-YT1', logo: '../../../brand/logo.png' },
  outro: { at: 51.5, text: 'Subscribe for more origin stories' },
};

const GREEN = '#5e6a44', SKINS = ['#a86c45', '#8a5a3c', '#b07a52', '#9a6440', '#a86c45', '#8a5a3c'];
const MARINE = i => ({ robe: GREEN, robeP: 'stripes', robePc: '#55603c', inner: '#6e7a52', sash: '#3a3a2a', hat: i % 3 === 2 ? 'shorthair' : 'helmet', hair: '#1a1a1a', skin: SKINS[i % 6] });
const RUG = ['#9a2a1e', '#efe6cf', '#2a2a2a', '#b0532e'];

// the padlock motif: the code that never opens
function lockScene(ctx, S, picks, snap) {
  const { k, P, W } = S;
  k.padlock(ctx, W / 2, 520, 2.6, 0, P.gold);
  for (let i = 0; i < 3; i++) { const a = picks - i * 0.3; if (a <= 0) continue; const br = clamp((snap - i * 0.3) * 2); ctx.save(); ctx.translate(W / 2 + 40, 600); ctx.rotate(-0.4 + i * 0.25 + Math.sin(a * 20) * 0.05 * (1 - br)); k.rect(ctx, 0, -3, lerp(220, 120, br), 6, P.steel, P.ink, 1.5); ctx.restore(); if (br > 0) k.rect(ctx, W / 2 + 200 + i * 30, 640 + br * 200, 90, 6, P.steel, P.ink, 1.5); }
}

export const scenes = [
  { // 0.0 "In World War II, one code was never broken, and it was built by 29 Navajo Marines."
    start: 0, title: 'A Code Never Broken',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const co = S.at('code'), br = S.at('broken,'), bu = S.at('built'), na = S.at('Navajo');
      ctx.fillStyle = '#2a3a2a'; ctx.fillRect(-80, -80, W + 160, 1240);
      ctx.fillStyle = k.pattern(ctx, 'scales', '#2a3a2a', '#34463a', 40); ctx.fillRect(-80, -80, W + 160, 1240);
      S.cam(lerp(1.15, 1.0, tween(u, 0, 3)), W / 2, 560);
      // the lock that no pick opens…
      ctx.save(); ctx.globalAlpha = 1 - tween(u, bu - 0.3, bu + 0.3); lockScene(ctx, S, tween(u, co, br + 0.6) * 2, tween(u, br, br + 0.6)); ctx.restore();
      // …and the 29 who built it, appearing in a long line
      const show = tween(u, bu - 0.2, na + 0.6);
      for (let i = 0; i < 29; i++) { const a = clamp(show * 29 - i); if (a <= 0) continue; const r = Math.floor(i / 10), c = i % 10; k.figure(ctx, 90 + c * 92 + (r % 2) * 46, 640 + r * 170, { ...MARINE(i), s: 0.5 * a, face: 1, mood: 'calm', armF: [0.3, 0.2] }); }
      if (show > 0) { ctx.fillStyle = P.goldLight; ctx.font = '900 64px Deco'; ctx.textAlign = 'center'; ctx.fillText(String(Math.min(29, Math.ceil(show * 29))), W / 2, 330); }
    },
  },
  { // 8.2 "1942."
    start: 7.9, title: 'The Year 1942', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      S.cam(lerp(1.1, 1.0, tween(u, 0, 2)), W / 2, 600);
      k.goldSky(ctx, -80, -80, W + 160, 1240, S.t);
      k.mesas(ctx, W, 640, S.t, 3);
      k.ground(ctx, -80, 640, W + 160, 600, '#d8a86a', 3, 0.3);
      k.hogan(ctx, 300, 900, 1.3); k.hogan(ctx, 760, 820, 0.8);
      k.seal(ctx, 820, 170, 70, ' THE YEAR · 1942 ·', '1942', tween(u, 0.2, 0.6, ease.linear));
      k.label(ctx, 'THE NAVAJO NATION', W / 2, 1000, 22, tween(u, 0.6, 1.0));
    },
  },
  { // 10.1 "Philip Johnston, a missionary's son who grew up speaking Navajo, has an idea."
    start: 9.9, title: 'Philip Johnston', trans: 'ink',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const ph = S.at('Philip'), gr = S.at('grew'), sp = S.at('speaking'), id = S.at('idea.');
      S.cam(lerp(1.0, 1.08, tween(u, gr - 0.4, sp + 0.6, ease.inOut)), lerp(W / 2, 540, tween(u, gr, sp)), 600);
      k.goldSky(ctx, -80, -80, W + 160, 1240, S.t);
      k.ground(ctx, -80, 760, W + 160, 500, '#d8a86a', 3, 0.3);
      k.figure(ctx, 250, 1010, { robe: '#5a4a3a', robeP: 'stripes', robePc: '#6a5a4a', inner: P.white, sash: '#3a2a1a', hat: 'shorthair', hair: '#8a7a6a', skin: '#f1d1a8', s: 1.15, face: 1, mood: u > id ? 'happy' : 'calm', ...act(u > id ? 'think' : 'rest', u, tween(u, id - 0.4, id)) });
      k.label(ctx, 'PHILIP JOHNSTON', 250, 620, 22, tween(u, ph, ph + 0.4));
      // a memory of his boyhood: children talking by a hogan
      const m = tween(u, gr - 0.3, gr + 0.3);
      if (m > 0) { ctx.save(); ctx.globalAlpha = m; k.circle(ctx, 680, 480, 250, '#f2e6c8', P.goldDark, 6); ctx.save(); ctx.beginPath(); ctx.arc(680, 480, 244, 0, TAU); ctx.clip(); k.goldSky(ctx, 430, 230, 500, 500, S.t); k.mesas(ctx, 900, 560, S.t, 7); k.hogan(ctx, 600, 640, 0.8); [[700, '#f1d1a8', 'shorthair'], [790, SKINS[0], 'longhair'], [860, SKINS[1], 'shorthair']].forEach(([x, sk, h], i) => k.figure(ctx, x, 700, { robe: [P.verm, P.turq, P.ochre][i], robeP: 'dots', hat: h, hair: i === 0 ? '#c9a46a' : '#1a1a1a', skin: sk, s: 0.55, face: i ? -1 : 1, mood: 'happy', armF: [1.2 + Math.sin(u * 4 + i) * 0.2, 0.3] })); ctx.restore(); ctx.restore(); }
      if (u > sp) for (let i = 0; i < 3; i++) k.speechBubble(ctx, 650 + i * 70, 360 - i * 40, '…', 24, 1);
      medallion(ctx, k, P, '!', 250, 470, pop(u, id - 0.1, 0.35), P.verm);
    },
  },
  { // 15.3 "Use the Navajo language as a secret code. The Marines say yes."
    start: 15.1, title: 'A Language as a Code', trans: 'page',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const la = S.at('language'), se = S.at('secret'), ye = S.at('yes.');
      S.cam(lerp(1.0, 1.12, tween(u, 0, 4.6)), W / 2, 560);
      ctx.fillStyle = '#efe2c0'; ctx.fillRect(-80, -80, W + 160, 1240);
      // spoken words curl round and close into a padlock
      const close = tween(u, la, se + 0.6, ease.inOut);
      for (let i = 0; i < 12; i++) { const a = i / 12 * TAU * close + 1.6, r = lerp(380, 150, close); ctx.save(); ctx.translate(W / 2 + Math.cos(a) * r, 480 + Math.sin(a) * r); ctx.rotate(a + Math.PI / 2); ctx.fillStyle = P.vermDark; ctx.font = '700 34px GaramondItalic'; ctx.textAlign = 'center'; ctx.fillText(['ah', 'ne', 'tsi', 'do', 'ya', 'shi', 'ko', 'bi', 'na', 'ha', 'ti', 'lo'][i], 0, 0); ctx.restore(); }
      if (close > 0.6) k.padlock(ctx, W / 2, 520, 1.6 * clamp((close - 0.6) / 0.4), 0, P.gold);
      // a Marine officer approves
      const ap = tween(u, ye - 0.4, ye);
      k.figure(ctx, 830, 1010, { ...MARINE(2), hat: 'helmet', skin: '#f1d1a8', s: 1.0, face: -1, mood: ap > 0.5 ? 'happy' : 'calm', ...act('present', u, ap) });
      k.stamp(ctx, 'APPROVED', 330, 860, 56, tween(u, ye, ye + 0.25, ease.linear), -0.14, P.green);
    },
  },
  { // 20.9 "They recruit 29 young Navajo men."
    start: 20.8, title: 'The First Twenty-Nine', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const re = S.at('recruit'), me = S.at('men.');
      S.cam(lerp(1.25, 1.0, tween(u, 0, 2.8, ease.inOut)), W / 2, 640);
      k.goldSky(ctx, -80, -80, W + 160, 1240, S.t);
      k.mesas(ctx, W, 560, S.t, 5);
      k.ground(ctx, -80, 560, W + 160, 700, '#d8a86a', 3, 0.3);
      // they arrive in civilian clothes and stand in the Marines' green
      for (let i = 0; i < 29; i++) { const r = Math.floor(i / 10), c = i % 10, a = clamp(tween(u, re - 0.2, me + 0.4) * 29 - i); if (a <= 0) continue; const civ = { robe: [P.verm, P.turq, P.ochre, P.lapis][i % 4], robeP: 'dots', hat: 'shorthair', hair: '#1a1a1a' }; k.figure(ctx, 80 + c * 96 + (r % 2) * 48, 700 + r * 150, { ...(u > me ? MARINE(i) : civ), hat: u > me ? (i % 2 ? 'helmet' : 'shorthair') : 'shorthair', hair: '#1a1a1a', skin: SKINS[i % 6], s: 0.6, face: 1, mood: 'calm', armF: [0.3, 0.2] }); }
    },
  },
  { // 23.9 "They build a code inside their own language."
    start: 23.7, title: 'Woven Into the Language', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const bu = S.at('build'), la = S.at('language.');
      S.cam(lerp(1.0, 1.15, tween(u, 0, 3.2)), W / 2, 560);
      k.goldSky(ctx, -80, -80, W + 160, 1240, S.t);
      k.ground(ctx, -80, 820, W + 160, 400, '#d8a86a', 3, 0.3);
      // the loom: the code is woven row by row
      k.loomRug(ctx, 620, 500, 420, 560, tween(u, bu - 0.2, la + 0.8), { colors: RUG });
      k.figure(ctx, 230, 1010, { ...MARINE(0), hat: 'shorthair', s: 1.1, face: 1, mood: 'calm', armF: [1.4 + Math.sin(u * 4) * 0.15, 0.4] });
    },
  },
  { // 27.0 "Everyday Navajo words become military terms."
    start: 26.9, title: 'Everyday Words', trans: 'page',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const ev = S.at('Everyday'), mi = S.at('military');
      S.cam(1.04, W / 2, 540);
      ctx.fillStyle = '#efe2c0'; ctx.fillRect(-80, -80, W + 160, 1240);
      // a Book of Wonders table: each everyday thing turns into its military meaning
      const ICON = {
        fish: (c, m) => { k.ellipse(c, 0, 0, 60, 24, 0, m ? '#6f7a86' : '#8aa4b8', P.ink, 2); k.poly(c, [[-56, 0], [-86, -22], [-86, 22]], m ? '#6f7a86' : '#8aa4b8', P.ink, 2); if (m) { k.rect(c, -10, -44, 26, 22, '#6f7a86', P.ink, 2); k.rect(c, 2, -60, 4, 18, P.ink, null); } else k.circle(c, 36, -6, 4, P.ink, null); },
        bird: (c, m) => { if (m) { k.rect(c, -60, -8, 120, 16, '#8a949e', P.ink, 2); k.poly(c, [[-14, -8], [14, -8], [0, -70], [-6, -70]], '#8a949e', P.ink, 2); k.poly(c, [[-14, 8], [14, 8], [0, 70], [-6, 70]], '#8a949e', P.ink, 2); k.poly(c, [[60, -6], [80, 0], [60, 6]], P.ink, null); } else { k.ellipse(c, 0, 0, 30, 16, 0, P.turq, P.ink, 2); k.ellipse(c, -6, -22, 34, 10, -0.5, P.turqLight, P.ink, 1.5); k.poly(c, [[28, -2], [70, 0], [28, 4]], P.ink, null); k.circle(c, 16, -4, 3, P.ink, null); } },
        tortoise: (c, m) => { if (m) { k.rect(c, -70, -20, 140, 40, '#6e7a52', P.ink, 2); k.rect(c, -30, -48, 60, 30, '#6e7a52', P.ink, 2); k.rect(c, 28, -40, 60, 8, '#6e7a52', P.ink, 1.5); for (let i = 0; i < 5; i++) k.circle(c, -56 + i * 28, 26, 11, '#3a3a2a', P.ink, 1.5); } else { c.beginPath(); c.arc(0, 10, 56, Math.PI, 0); k.fillStroke(c, '#8a6a3e', P.ink, 2); k.circle(c, 64, 0, 14, '#a8946a', P.ink, 2); for (const x of [-36, 36]) k.rect(c, x - 8, 8, 16, 18, '#a8946a', P.ink, 1.5); } },
        whale: (c, m) => { if (m) { c.beginPath(); c.moveTo(-90, 0); c.lineTo(90, 0); c.lineTo(76, 26); c.lineTo(-80, 26); c.closePath(); k.fillStroke(c, '#7a848e', P.ink, 2); k.rect(c, -30, -34, 60, 34, '#8a949e', P.ink, 2); k.rect(c, -10, -56, 20, 22, '#8a949e', P.ink, 2); k.rect(c, 34, -12, 50, 8, P.ink, null); } else { k.ellipse(c, 0, 0, 86, 34, 0, '#3f5a78', P.ink, 2); k.poly(c, [[-80, 0], [-116, -26], [-110, 0], [-116, 26]], '#3f5a78', P.ink, 2); k.circle(c, 50, -8, 4, P.ink, null); c.beginPath(); c.moveTo(20, -34); c.quadraticCurveTo(10, -66, 26, -70); k.stroke(c, P.waterLight, 3); } },
      };
      const rows = [['fish', 'IRON FISH', 'SUBMARINE'], ['bird', 'HUMMINGBIRD', 'FIGHTER PLANE'], ['tortoise', 'TORTOISE', 'TANK'], ['whale', 'WHALE', 'BATTLESHIP']];
      rows.forEach(([ic, a, b], i) => {
        const y = 170 + i * 235, p = pop(u, ev - 0.2 + i * 0.35, 0.3), q = tween(u, mi - 0.6 + i * 0.25, mi - 0.2 + i * 0.25);
        if (p <= 0) return;
        ctx.save(); ctx.translate(230, y); ctx.scale(p, p); ICON[ic](ctx, false); ctx.restore();
        k.label(ctx, a, 230, y + 80, 20, p);
        if (q > 0) { ctx.save(); ctx.globalAlpha = q; k.poly(ctx, [[430, y - 18], [510, y], [430, y + 18]], P.verm, P.ink, 2); ctx.translate(760, y); ctx.scale(q, q); ICON[ic](ctx, true); ctx.restore(); k.label(ctx, b, 760, y + 80, 20, q); }
      });
    },
  },
  { // 30.4 "In battles across the Pacific, they send message after message."
    start: 30.2, title: 'Across the Pacific', trans: 'ink',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const pa = S.at('Pacific,'), se = S.at('send'), mm = S.at('message');
      S.cam(lerp(1.0, 1.2, tween(u, se - 0.4, mm + 1.0, ease.inOut)), lerp(W / 2, 380, tween(u, se, mm + 0.6)), 640);
      k.waves(ctx, -80, -80, W + 160, 1240, S.t, P.water, P.waterLight, 18, 22);
      // islands with their names; radio waves pass between them
      const isl = [[200, 260, 'GUADALCANAL'], [640, 200, 'SAIPAN'], [820, 520, 'IWO JIMA'], [380, 560, 'OKINAWA']];
      isl.forEach(([x, y, n], i) => { const p = pop(u, pa - 0.6 + i * 0.25, 0.3); if (p <= 0) return; k.blob(ctx, x, y, 70 * p, i + 4, 0.25, 12, '#d8c088', P.ink, 2, 0.6); k.palm(ctx, x - 10, y + 6, 70 * p, S.t, i); k.label(ctx, n, x, y + 70, 18, p); });
      for (let i = 0; i < 3; i++) { const q = ((u * 0.6 + i / 3) % 1); const [a, b] = [isl[i], isl[i + 1]]; ctx.save(); ctx.globalAlpha = Math.sin(q * Math.PI); k.circle(ctx, lerp(a[0], b[0], q), lerp(a[1], b[1], q), 10, P.goldLight, P.ink, 1); ctx.restore(); }
      // two Marines with the radio in the sand
      k.ground(ctx, -80, 820, W + 160, 400, '#d8c088', 3, 0.2);
      k.fieldRadio(ctx, 520, 960, 1.0, 1, S.t);
      k.figure(ctx, 330, 1010, { ...MARINE(0), s: 1.0, face: 1, mood: 'calm', armF: [1.9, 2.2] });
      k.figure(ctx, 740, 1010, { ...MARINE(1), s: 1.0, face: -1, mood: 'calm', armF: [1.4, 0.8] });
    },
  },
  { // 34.8 "The enemy never breaks the code."
    start: 34.6, title: 'Never Broken', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const ne = S.at('never'), br = S.at('breaks');
      ctx.fillStyle = '#2a3a2a'; ctx.fillRect(-80, -80, W + 160, 1240);
      ctx.fillStyle = k.pattern(ctx, 'scales', '#2a3a2a', '#34463a', 40); ctx.fillRect(-80, -80, W + 160, 1240);
      S.cam(lerp(1.0, 1.2, tween(u, 0, 2.6, ease.inOut)), W / 2, 560);
      // the lock from the first scene: every pick snaps
      lockScene(ctx, S, tween(u, 0, br) * 2, tween(u, br, br + 0.8));
      if (u > br) for (let i = 0; i < 8; i++) { const q = clamp((u - br) / 1.0), a = i / 8 * TAU; ctx.save(); ctx.globalAlpha = 1 - q; k.star(ctx, W / 2 + Math.cos(a) * (120 + q * 200), 520 + Math.sin(a) * (120 + q * 200), 12, 1); ctx.restore(); }
    },
  },
  { // 37.6 "But when they come home, they can't tell anyone."
    start: 37.3, title: 'Silence', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const ho = S.at('home,'), te = S.at('tell');
      S.cam(lerp(1.15, 1.0, tween(u, 0, 3)), W / 2, 640);
      k.goldSky(ctx, -80, -80, W + 160, 1240, S.t);
      ctx.save(); ctx.globalAlpha = 0.3; ctx.fillStyle = '#7a5a8a'; ctx.fillRect(-80, -80, W + 160, 1240); ctx.restore();
      k.mesas(ctx, W, 620, S.t, 9);
      k.ground(ctx, -80, 620, W + 160, 600, '#d8a86a', 3, 0.3);
      k.hogan(ctx, 700, 880, 1.2);
      // home in uniform; family asks; he says nothing
      k.figure(ctx, 330, 1010, { ...MARINE(3), hat: 'shorthair', s: 1.1, face: 1, mood: 'calm', armF: u > te - 0.3 ? [1.15, 2.6] : [0.3, 0.2] });
      [[560, P.verm, 'longhair'], [640, P.turq, 'shorthair']].forEach(([x, c, h], i) => k.figure(ctx, x, 1010, { robe: c, robeP: 'dots', hat: h, hair: '#1a1a1a', skin: SKINS[i + 2], s: 0.9, face: -1, mood: 'happy', ...act('present', u + i, tween(u, ho, ho + 0.4)) }));
      if (u > ho) k.speechBubble(ctx, 600, 560, '?', 40, -1);
      k.stamp(ctx, 'CLASSIFIED', W / 2, 300, 58, tween(u, te, te + 0.25, ease.linear), -0.12);
    },
  },
  { // 40.8 "The code stays secret until 1968."
    start: 40.5, title: 'Secret Until 1968', trans: 'page',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const se = S.at('secret'), yr = S.at('1968.');
      S.cam(lerp(1.0, 1.12, tween(u, yr - 0.4, yr + 1.2, ease.inOut)), W / 2, 540);
      ctx.fillStyle = '#efe2c0'; ctx.fillRect(-80, -80, W + 160, 1240);
      // years tick by on a calendar, then the sealed file opens
      const y = Math.round(lerp(1945, 1968, tween(u, se - 0.4, yr)));
      ctx.fillStyle = P.vermDark; ctx.font = '900 110px Deco'; ctx.textAlign = 'center'; ctx.fillText(String(y), W / 2, 300);
      const op = tween(u, yr + 0.1, yr + 0.9, ease.outBack);
      k.rect(ctx, 280, 440, 520, 380, '#c9b07a', P.ink, 3);
      ctx.save(); ctx.translate(280, 440); ctx.transform(1, 0, 0, 1 - op * 1.6, 0, 0); k.rect(ctx, 0, 0, 520, 140, '#b89a64', P.ink, 2.5); ctx.restore();
      if (op > 0.3) k.letter(ctx, W / 2, 640, 420, 220, ['The Navajo code', 'made public.'], tween(u, yr + 0.3, yr + 1.4), -0.03);
      if (op > 0.3) for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; k.star(ctx, W / 2 + Math.cos(a) * 320, 620 + Math.sin(a) * 240, 10, op); }
    },
  },
  { // 44.6 "Their language became the code that helped win a war."
    start: 44.3, title: 'Their Language', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const be = S.at('became'), wi = S.at('win');
      // plant and pay-off: the rug from the loom, finished; the 29 stand before it
      S.cam(lerp(1.3, 1.0, tween(u, 0, 3.5, ease.inOut)), W / 2, lerp(440, 560, tween(u, 0, 3.5)));
      k.goldSky(ctx, -80, -80, W + 160, 1240, S.t);
      const rays = tween(u, be, wi + 0.5); ctx.save(); ctx.globalAlpha = 0.4 * rays; for (let i = 0; i < 16; i++) { const a = i / 16 * TAU + S.t * 0.08; ctx.beginPath(); ctx.moveTo(W / 2, 440); ctx.lineTo(W / 2 + Math.cos(a) * 900, 440 + Math.sin(a) * 900); k.stroke(ctx, P.goldLight, 16); } ctx.restore();
      k.loomRug(ctx, W / 2, 420, 460, 560, 1, { colors: RUG });
      k.ground(ctx, -80, 860, W + 160, 400, '#d8a86a', 3, 0.3);
      for (let i = 0; i < 10; i++) k.figure(ctx, 70 + i * 104, 1010, { ...MARINE(i), s: 0.7, face: 1, mood: 'calm', armF: [0.3, 0.2] });
    },
  },
  { // 49.8 "Every legend has a beginning."
    start: 49.5, title: 'Every Legend Has a Beginning', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S, beg = S.at('beginning.');
      ctx.save(); S.cam(lerp(1.0, 1.4, tween(u, 0, beg)), W / 2, 420);
      k.goldSky(ctx, -80, -80, W + 160, 1240, S.t);
      k.loomRug(ctx, W / 2, 420, 460, 560, 1, { colors: RUG });
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
  { t: 1.8, type: 'clank', gain: 0.35, pitch: 1.4 }, { t: 2.4, type: 'clank', gain: 0.3, pitch: 1.5 }, { t: 2.9, type: 'crack', gain: 0.4 },
  ...Array.from({ length: 10 }, (_, i) => ({ t: +(4.6 + i * 0.15).toFixed(2), type: 'pluck', gain: 0.2, pitch: 1 + (i % 4) * 0.1 })),
  { t: 8.3, type: 'stamp', gain: 0.45 }, { t: 8.8, type: 'wind', gain: 0.35 },
  { t: 12.3, type: 'chime', gain: 0.35 }, { t: 14.3, type: 'pop', gain: 0.55, pitch: 1.3 },
  { t: 16.4, type: 'whoosh', gain: 0.35 }, { t: 17.7, type: 'clank', gain: 0.45 }, { t: 19.9, type: 'stamp', gain: 0.8 },
  { t: 21.4, type: 'pop', gain: 0.3 }, { t: 22.9, type: 'thud', gain: 0.4 },
  { t: 24.2, type: 'pluck', gain: 0.3 }, { t: 24.8, type: 'pluck', gain: 0.3, pitch: 1.2 }, { t: 25.4, type: 'pluck', gain: 0.3, pitch: 1.4 },
  { t: 27.1, type: 'pop', gain: 0.4 }, { t: 27.5, type: 'pop', gain: 0.4, pitch: 1.2 }, { t: 27.9, type: 'pop', gain: 0.4, pitch: 1.4 }, { t: 28.7, type: 'chime', gain: 0.45 },
  { t: 30.6, type: 'waves', gain: 0.4 }, { t: 32.3, type: 'alarm', gain: 0.12 }, { t: 33.2, type: 'alarm', gain: 0.1 },
  { t: 35.7, type: 'crack', gain: 0.5 }, { t: 36.0, type: 'crack', gain: 0.45 }, { t: 36.3, type: 'chime', gain: 0.5, pitch: 1.4 },
  { t: 39.0, type: 'stamp', gain: 0.8 }, { t: 39.4, type: 'wind', gain: 0.3 },
  { t: 41.0, type: 'paper', gain: 0.3 }, { t: 42.3, type: 'riser', gain: 0.4 }, { t: 42.8, type: 'chime', gain: 0.55, pitch: 1.3 },
  { t: 45.2, type: 'riser', gain: 0.4 }, { t: 47.5, type: 'gong', gain: 0.6 },
];

export const music = {
  bpm: 96, root: 'A', maqam: 'hicaz', gain: 0.3,
  sections: [
    { from: 0, to: 7.9, mood: 'intro' },
    { from: 7.9, to: 20.8, mood: 'groove' },
    { from: 20.8, to: 37.3, mood: 'drive' },
    { from: 37.3, to: 44.3, mood: 'sad' },
    { from: 44.3, to: 50.84, mood: 'triumph' },
    { from: 50.84, to: 53.3, mood: 'end' },
  ],
};
