// "A Boy's Oath Against Rome" — Hannibal, told as a journey on a painted map
// (`voyage` device): the Mediterranean opens at Carthage, the march is drawn as
// a dotted road from Spain over the Alps, and Cannae is the famous crescent
// that closes around a bigger army. The oath is shown as Hannibal himself later
// told it (Polybius); the losses in the Alps are shown as figures fading into
// snow, never as bodies.
import { clamp, lerp, ease, tween, rng, TAU } from '../../lib/core.mjs';
import { interior, bookCover } from '../../styles/ottoman/scenes.mjs';
import { act } from '../../styles/ottoman/acting.mjs';

export const meta = {
  title: 'A Boy’s Oath Against Rome',
  slug: 'hannibal-ottoman',
  style: 'ottoman',
  look: 'ledger',   // ledger (after night, scroll, album)
  ambient: 'dust',
  room: 'arches',
  device: 'voyage',
  width: 1080, height: 1920, fps: 30,
  duration: 56.2,
  voice: 'voice.mp3',
  seed: 218,
  captionChars: 30,
  brand: { handle: '@HOWITSTARTED-YT1', logo: '../../../brand/logo.png' },
  outro: { at: 54.4, text: 'Subscribe for more origin stories' },
};

const SEA = '#3f6f9a', LAND = '#d9c08a';
const PUNIC = (i = 0, o = {}) => ({ robe: ['#5a2a5a', '#2f5f8a', '#9a2a1e'][i % 3], inner: '#d8b878', sash: '#c9a227', hat: 'shorthair', hair: '#2a1c12', beard: true, beardColor: '#2a1c12', skin: ['#b07a52', '#c68a5e', '#a86c45'][i % 3], ...o });
const BOY = { robe: '#efe6cf', inner: '#5a2a5a', sash: '#5a2a5a', hat: 'shorthair', hair: '#2a1c12', skin: '#c68a5e' };
const ROMAN = i => ({ robe: '#9a2a1e', inner: '#c9a24a', sash: '#5a3a1a', hat: 'greekhelm', hatColor: '#c9a24a', crest: '#2a1c12', skin: ['#e2b48a', '#d9a882'][i % 2] });

// ---------- an elephant, as the court painters drew the sultan's ----------
function elephant(ctx, S, x, y, s, f = 1, t = 0, o = {}) {
  const { k, P } = S, g = Math.sin(t * 5);
  ctx.save(); ctx.translate(x, y); ctx.scale(s * f, s);
  const grey = o.color || '#8a8a8a', dark = '#6a6a6a';
  for (const [lx, ph] of [[-60, 0], [-30, 1.6], [34, 0.8], [62, 2.4]]) { ctx.save(); ctx.translate(lx, -70); ctx.rotate(Math.sin(t * 5 + ph) * 0.12 * (o.walk ?? 1)); k.rect(ctx, -14, 0, 28, 72, ph > 1 ? dark : grey, P.ink, 2); ctx.restore(); }
  k.ellipse(ctx, 0, -110, 100, 62, 0, grey, P.ink, 2.5);
  ctx.beginPath(); ctx.moveTo(-96, -120); ctx.quadraticCurveTo(-116, -90, -104, -60); k.stroke(ctx, P.ink, 3); // tail
  k.circle(ctx, 96, -140, 46, grey, P.ink, 2.5);
  ctx.beginPath(); ctx.moveTo(126, -128); ctx.quadraticCurveTo(160 + g * 6, -80, 140, -30 + g * 4); ctx.quadraticCurveTo(136, -20, 128, -28); ctx.quadraticCurveTo(140, -80, 112, -112); ctx.closePath(); k.fillStroke(ctx, grey, P.ink, 2); // trunk
  ctx.beginPath(); ctx.moveTo(112, -116); ctx.quadraticCurveTo(144, -110, 150, -96); k.stroke(ctx, '#f3ead8', 6); // tusk
  k.ellipse(ctx, 70, -138, 30, 40, -0.2, dark, P.ink, 2); // ear
  k.circle(ctx, 110, -152, 4, P.ink, null);
  if (o.rider !== false) { k.rect(ctx, -50, -186, 90, 20, o.cloth || '#9a2a1e', P.ink, 2); ctx.save(); ctx.scale(1 / s * 0.9 * s, 1); k.figure(ctx, 30, -170, { ...PUNIC(1), s: 0.42, face: 1, kneel: true, armF: [1.0, 0.4] }); ctx.restore(); }
  ctx.restore();
}

// ---------- the painted Mediterranean (the voyage device) ----------
const EUROPE = [[-80, -80], [1160, -80], [1160, 300], [900, 330], [760, 300], [720, 320], [820, 460], [900, 560], [880, 610], [840, 600], [830, 700], [790, 760], [740, 700], [660, 560], [580, 420], [540, 330], [440, 350], [360, 360], [340, 420], [300, 540], [200, 560], [100, 520], [40, 460], [-80, 440]];
const AFRICA = [[-80, 1220], [1160, 1220], [1160, 900], [900, 880], [700, 830], [630, 770], [580, 820], [400, 860], [200, 820], [-80, 800]];
const PLACES = { carthage: [610, 800], 'new carthage': [210, 520], rome: [628, 490], cannae: [850, 600] };
const ROUTE = [[210, 520], [250, 420], [330, 350], [440, 330], [530, 290], [600, 300], [650, 360], [700, 420], [780, 520], [850, 600]];
function along(pts, k1) {
  const seg = []; let tot = 0; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); tot += d; }
  let r = clamp(k1) * tot; for (let i = 0; i < seg.length; i++) { if (r <= seg[i]) { const q = r / seg[i]; return [lerp(pts[i][0], pts[i + 1][0], q), lerp(pts[i][1], pts[i + 1][1], q)]; } r -= seg[i]; }
  return pts[pts.length - 1];
}
function seaMap(ctx, S, o = {}) {
  const { k, P, W } = S;
  ctx.fillStyle = SEA; ctx.fillRect(-300, -300, W + 600, 1800);
  k.waves(ctx, -300, -300, W + 600, 1800, S.t, SEA, '#6f9cc0', 8, 30);
  for (const poly of [EUROPE, AFRICA]) { ctx.beginPath(); k.smoothPath(ctx, poly, true); ctx.fillStyle = LAND; ctx.fill(); k.stroke(ctx, P.ink, 3); }
  k.blob(ctx, 770, 800, 44, 5, 0.3, 12, LAND, P.ink, 2.5); k.blob(ctx, 560, 580, 30, 8, 0.3, 10, LAND, P.ink, 2);
  // the Alps and the Pyrenees, white-capped
  for (const [x, y, s] of [[480, 300, 1], [530, 280, 1.2], [580, 290, 1], [620, 310, 0.8], [300, 350, 0.6], [340, 345, 0.7]]) { k.poly(ctx, [[x - 30 * s, y + 10], [x, y - 40 * s], [x + 30 * s, y + 10]], '#9a8a6a', P.ink, 1.5); k.poly(ctx, [[x - 12 * s, y - 22 * s], [x, y - 40 * s], [x + 12 * s, y - 22 * s]], P.white, null); }
  for (const [name, [x, y]] of Object.entries(PLACES)) {
    if (o.hide && o.hide.includes(name)) continue;
    k.circle(ctx, x, y, 10, name === 'rome' ? P.vermDark : name === 'carthage' ? '#5a2a5a' : P.goldDark, P.ink, 2);
    ctx.fillStyle = P.ink; ctx.font = '700 26px Fell'; ctx.textAlign = 'center'; ctx.fillText(name.toUpperCase(), x, y + (name === 'carthage' ? 42 : -18));
  }
  const kk = o.route || 0;
  if (kk > 0) { for (let i = 0; i <= 70 * clamp(kk); i++) { const [x, y] = along(ROUTE, i / 70); k.circle(ctx, x, y, 5, P.vermDark, null); } }
  if (o.marchers && kk > 0 && kk < 1.01) { const [x, y] = along(ROUTE, kk); elephant(ctx, S, x - 10, y + 10, 0.22, 1, S.t, { rider: false }); }
}

export const scenes = [
  { // 0.0 "Rome's greatest enemy made his promise when he was nine years old."
    start: 0, title: 'A Promise at Nine',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const en = S.at('enemy'), pr = S.at('promise'), ni = S.at('nine'), ol = S.at('old.');
      // a giant shadow of a general with elephants… which belongs to a small boy
      const down = tween(u, ni - 0.6, ol + 0.4, ease.inOut);
      S.cam(lerp(1.0, 1.15, down), W / 2, lerp(420, 820, down));
      ctx.fillStyle = '#e8d8b4'; ctx.fillRect(-300, -300, W + 600, 1800);
      ctx.save(); ctx.globalAlpha = 0.85 * (1 - down * 0.5); ctx.fillStyle = '#2a1c12';
      ctx.translate(W / 2, 1000); ctx.scale(2.2, 2.2); k.figure(ctx, 0, 0, { robe: '#2a1c12', inner: '#2a1c12', sash: '#2a1c12', hat: 'greekhelm', hatColor: '#2a1c12', crest: '#2a1c12', skin: '#2a1c12', beard: true, beardColor: '#2a1c12', s: 1, face: 1, armF: [2.2, 0.2] });
      ctx.restore();
      ctx.save(); ctx.globalAlpha = 0.6 * tween(u, en - 0.3, en + 0.3) * (1 - down); elephant(ctx, S, 160, 1000, 1.0, 1, S.t, { color: '#3a2a1a', rider: false }); elephant(ctx, S, 900, 980, 0.9, -1, S.t + 1, { color: '#3a2a1a', rider: false }); ctx.restore();
      k.figure(ctx, W / 2, 1000, { ...BOY, s: 0.75, face: 1, mood: 'calm', ...act(u > pr ? 'present' : 'rest', u, tween(u, pr, pr + 0.4)) });
      const n = tween(u, ni, ni + 0.3, ease.outBack);
      if (n > 0) { ctx.save(); ctx.translate(W / 2 + 200, 760); ctx.scale(n, n); k.circle(ctx, 0, 0, 70, P.vermDark, P.ink, 3); ctx.fillStyle = P.paperLight; ctx.font = '900 90px Deco'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('9', 0, 6); ctx.restore(); ctx.textBaseline = 'alphabetic'; }
    },
  },
  { // 6.3 "Carthage, North Africa."
    start: 6.1, title: 'Carthage', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W } = S, ca = S.at('Carthage,'), af = S.at('Africa.');
      S.cam(lerp(0.95, 1.6, tween(u, ca, af + 1.0, ease.inOut)), lerp(W / 2, 610, tween(u, ca, af + 1.0)), lerp(560, 760, tween(u, ca, af + 1.0)));
      seaMap(ctx, S, { hide: ['new carthage', 'cannae'] });
      // the round war harbour of Carthage, ships at rest around its island
      const h = tween(u, ca - 0.2, ca + 0.6, ease.outBack);
      if (h > 0) { ctx.save(); ctx.translate(640, 760); ctx.scale(h * 0.7, h * 0.7); k.circle(ctx, 0, 0, 60, SEA, P.ink, 3); k.circle(ctx, 0, 0, 22, LAND, P.ink, 2); for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 30, Math.sin(a) * 30); ctx.lineTo(Math.cos(a) * 52, Math.sin(a) * 52); k.stroke(ctx, '#7a5a3a', 5); } ctx.restore(); }
      k.label(ctx, 'IN TODAY’S TUNISIA', 610, 880, 14, tween(u, af, af + 0.4));
    },
  },
  { // 8.9 "Hannibal begs his father, the general Hamilcar, to take him to war."
    start: 8.6, title: 'Take Me With You', trans: 'ink',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const be = S.at('begs'), ha = S.at('Hamilcar,'), wa = S.at('war.');
      S.cam(lerp(1.0, 1.2, tween(u, be - 0.2, wa + 0.6, ease.inOut)), lerp(W / 2, 460, tween(u, be - 0.2, wa + 0.6)), 680);
      interior(ctx, S, { arches: 3, carpetColor: '#5a2a5a' });
      // the general at his war table; the boy tugs his sleeve and won't let go
      k.rect(ctx, 600, 820, 380, 30, '#7a5a3a', P.ink, 2); k.rect(ctx, 620, 850, 20, 150, '#7a5a3a', P.ink, 2); k.rect(ctx, 940, 850, 20, 150, '#7a5a3a', P.ink, 2);
      ctx.save(); ctx.beginPath(); ctx.rect(620, 760, 340, 60); ctx.clip(); ctx.translate(790, 790); ctx.scale(0.3, 0.06); ctx.translate(-540, -560); seaMap(ctx, S, {}); ctx.restore();
      k.figure(ctx, 560, 1000, { ...PUNIC(0, { robe: '#5a2a5a', inner: '#c9a227' }), s: 1.15, face: -1, mood: u > wa ? 'calm' : 'sad', ...act(u > ha ? 'think' : 'present', u, tween(u, be, be + 0.4)) });
      const tug = Math.sin(S.t * 8) * 0.15;
      k.figure(ctx, 360, 1000, { ...BOY, s: 0.7, face: 1, mood: 'sad', armF: [1.3 + tug, 0.3], armB: [1.1 - tug, 0.3], tilt: tug * 0.1 });
      k.label(ctx, 'HAMILCAR BARCA', 560, 520, 22, tween(u, ha, ha + 0.4));
      k.label(ctx, 'HANNIBAL, AGE 9', 360, 700, 18, tween(u, be - 0.2, be + 0.2));
    },
  },
  { // 13.7 "As Hannibal later told it, his father agreed on one condition, swear never to be a friend of Rome."
    start: 13.4, title: 'The Oath', trans: 'page',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const to = S.at('told'), ag = S.at('agreed'), co = S.at('condition,'), sw = S.at('swear'), ro = S.at('Rome.');
      S.cam(lerp(1.0, 1.25, tween(u, sw - 0.3, ro + 0.6, ease.inOut)), lerp(W / 2, 440, tween(u, sw - 0.3, ro + 0.6)), lerp(640, 720, tween(u, sw - 0.3, ro + 0.6)));
      ctx.fillStyle = '#2a1e2e'; ctx.fillRect(-300, -300, W + 600, 1800);
      // the altar fire lights them from below
      const fire = 0.8 + Math.sin(S.t * 11) * 0.1;
      const g = ctx.createRadialGradient(440, 760, 20, 440, 760, 600); g.addColorStop(0, `rgba(255,190,90,${0.7 * fire})`); g.addColorStop(1, 'rgba(255,190,90,0)'); ctx.fillStyle = g; ctx.fillRect(-300, -300, W + 600, 1800);
      k.rect(ctx, 360, 780, 160, 220, '#d8d0c0', P.ink, 3); k.rect(ctx, 340, 760, 200, 30, '#e8e2d6', P.ink, 2.5);
      k.flames && k.flames(ctx, 440, 760, 120, fire, S.t);
      k.figure(ctx, 680, 1000, { ...PUNIC(0, { robe: '#5a2a5a', inner: '#c9a227' }), s: 1.15, face: -1, mood: 'calm', ...act(u > ag ? 'present' : 'rest', u, tween(u, ag - 0.2, ag + 0.3)) });
      const oath = tween(u, sw - 0.3, sw + 0.2);
      k.figure(ctx, 250, 1000, { ...BOY, s: 0.72, face: 1, mood: 'calm', armF: [lerp(0.4, 1.5, oath), lerp(0.3, -0.1, oath)] });
      // the words of the oath, written as he says them
      const wr = tween(u, sw - 0.1, ro + 0.4, ease.linear);
      k.letter(ctx, W / 2, 300, 700, 220, ['I swear never to be', 'a friend of Rome.'], wr, -0.02);
      k.label(ctx, 'AS HANNIBAL TOLD IT · RECORDED BY POLYBIUS', W / 2, 1080, 16, tween(u, to, to + 0.4));
    },
  },
  { // 21.4 "He keeps that promise."
    start: 20.9, title: 'He Keeps It', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, ke = S.at('keeps'), pr = S.at('promise.');
      S.cam(lerp(1.15, 1.0, tween(u, 0, 2.0, ease.inOut)), W / 2, 680);
      interior(ctx, S, { arches: 2, carpet: false });
      // the boy grows into the general, year by year
      const grow = tween(u, ke - 0.3, pr + 0.6, ease.inOut);
      k.figure(ctx, W / 2, 1000, { ...BOY, ...(grow > 0.5 ? PUNIC(2, { robe: '#9a2a1e', inner: '#c9a227', hat: 'greekhelm', hatColor: '#c9a24a', crest: '#5a2a5a', skin: '#c68a5e' }) : {}), beard: grow > 0.5, s: lerp(0.72, 1.2, grow), face: 1, mood: 'calm', ...act(grow > 0.7 ? 'point' : 'rest', u, tween(u, pr, pr + 0.3)) });
      ctx.fillStyle = P.vermDark; ctx.font = '900 64px Deco'; ctx.textAlign = 'center'; ctx.fillText(`AGE ${Math.round(lerp(9, 29, grow))}`, W / 2, 280);
    },
  },
  { // 23.3 "218 BC. Now a general, Hannibal marches an army from Spain"
    start: 23.0, title: 'From Spain, 218 BC', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W } = S, ma = S.at('marches'), sp = S.at('Spain');
      const go = tween(u, ma - 0.2, 6.6, ease.linear) * 0.55;
      const [rx, ry] = along(ROUTE, go);
      S.cam(lerp(1.0, 1.5, tween(u, 0, 3.0, ease.inOut)), lerp(W / 2, rx, tween(u, 0, 3.0)), lerp(560, ry, tween(u, 0, 3.0)));
      seaMap(ctx, S, { route: go, marchers: true });
      k.seal(ctx, 160, 180, 70, ' THE YEAR · 218 BC ·', '218 BC', tween(u, 0.1, 0.5, ease.linear));
      k.label(ctx, 'ABOUT 1,000 MILES ON FOOT', 330, 640, 16, tween(u, sp, sp + 0.4));
    },
  },
  { // 29.5 "over the snowy Alps into Italy, with dozens of war elephants."
    start: 29.2, title: 'Over the Alps', trans: 'wipe',
    draw(ctx, u, S) {
      const { k, P, W } = S, al = S.at('Alps'), it = S.at('Italy,'), el = S.at('elephants.');
      S.cam(lerp(1.2, 0.95, tween(u, 0, el + 0.6, ease.inOut)), W / 2, lerp(700, 600, tween(u, 0, el + 0.6)));
      k.goldSky(ctx, -300, -300, W + 600, 700, S.t);
      // white peaks, a narrow path climbing across them
      for (const [x, h, c] of [[100, 700, '#8a8aa0'], [420, 820, '#9a9ab0'], [760, 760, '#8a8aa0'], [1040, 680, '#9a9ab0']]) { k.poly(ctx, [[x - 360, 1200], [x, 1100 - h], [x + 360, 1200]], c, P.ink, 2.5); k.poly(ctx, [[x - 110, 1100 - h + 160], [x, 1100 - h], [x + 110, 1100 - h + 160], [x + 40, 1100 - h + 130], [x - 30, 1100 - h + 170]], P.white, P.ink, 1.5); }
      ctx.beginPath(); ctx.moveTo(-100, 1100); ctx.quadraticCurveTo(300, 760, 560, 860); ctx.quadraticCurveTo(820, 960, 1200, 700); k.stroke(ctx, '#efe6cf', 30);
      k.snow(ctx, -300, -300, W + 600, 1800, S.t, 120, 7);
      // the column: soldiers, then the elephants
      const m = (S.t * 0.04) % 1;
      for (let i = 0; i < 10; i++) { const q = (m + i * 0.09) % 1, x = lerp(-100, 1200, q), y = q < 0.5 ? lerp(1100, 860, q * 2) - Math.sin(q * 2 * Math.PI) * 60 : lerp(860, 700, (q - 0.5) * 2); const isE = i % 3 === 0 && u > el - 1.4; if (isE) elephant(ctx, S, x, y + 10, 0.42, 1, S.t + i); else k.figure(ctx, x, y + 4, { ...PUNIC(i), s: 0.38, face: 1, walk: S.t * 6 + i, armF: [0.4, 0.3] }); }
      k.label(ctx, 'ABOUT 37 ELEPHANTS SET OUT', W / 2, 260, 18, tween(u, el, el + 0.4));
    },
  },
  { // 34.2 "Many soldiers and elephants don't survive the crossing."
    start: 33.8, title: 'The Cost of the Crossing', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, ma = S.at('Many'), su = S.at('survive'), cr = S.at('crossing.');
      S.cam(lerp(1.0, 1.15, tween(u, 0, 3.4)), W / 2, 640);
      ctx.fillStyle = '#c8ccd8'; ctx.fillRect(-300, -300, W + 600, 1800);
      for (const [x, h] of [[200, 600], [700, 700]]) k.poly(ctx, [[x - 420, 1200], [x, 1100 - h], [x + 420, 1200]], '#e8ecf2', P.ink, 2);
      k.snow(ctx, -300, -300, W + 600, 1800, S.t * 2, 260, 9);
      // the line thins: one by one, figures fade into the storm
      const lost = tween(u, ma - 0.2, cr + 0.4);
      for (let i = 0; i < 12; i++) { const fade = clamp(lost * 2 - (i % 5) * 0.25); const a = i % 4 === 1 ? 1 - fade : 1; /* only soldiers fade: most elephants got over the Alps */ if (a <= 0.02) continue; ctx.save(); ctx.globalAlpha = a; const x = 80 + i * 86, y = 1000 - (i % 2) * 30; if (i % 4 === 3) elephant(ctx, S, x, y, 0.36, 1, S.t + i, { rider: false }); else k.figure(ctx, x, y, { ...PUNIC(i), s: 0.48, face: 1, mood: 'sad', walk: S.t * 3 + i, armF: [0.6, 1.4] }); ctx.restore(); }
      k.label(ctx, 'MOST ELEPHANTS MADE IT OVER · THE WINTER AFTER TOOK THEM', W / 2, 300, 15, tween(u, cr, cr + 0.4));
    },
  },
  { // 38.0 "Two years later, at Cannae, he crushes a Roman army about twice the size of his own,"
    start: 37.5, title: 'Cannae, 216 BC', trans: 'tiles',
    draw(ctx, u, S) {
      const { k, P, W } = S, ca = S.at('Cannae,'), cr = S.at('crushes'), tw = S.at('twice'), ow = S.at('own,');
      S.cam(lerp(1.1, 0.95, tween(u, 0, ow, ease.inOut)), W / 2, 600);
      ctx.fillStyle = '#d8c08a'; ctx.fillRect(-300, -300, W + 600, 1800);
      k.ground(ctx, -300, -300, W + 600, 1800, '#d8c08a', 12, 0.08);
      // the battle seen from above: the Roman block marches into a crescent that closes around it
      const adv = tween(u, ca, cr + 1.2, ease.inOut), wrap = tween(u, cr + 0.4, ow + 0.4, ease.inOut);
      const top = lerp(180, 300, adv), cx = 541, cy = top + 170;
      for (let r = 0; r < 10; r++) for (let c = 0; c < 12; c++) k.rect(ctx, 330 + c * 36 - (c - 5.5) * 4 * wrap, top + r * 34 - r * 3 * wrap, 26, 22, '#9a2a1e', P.ink, 1);
      // Hannibal's thinner line: a flat front at first, then a U that closes round the sides
      const n = 27, a0 = lerp(0, -0.45, wrap), a1 = lerp(Math.PI, Math.PI + 0.45, wrap);
      for (let i = 0; i < n; i++) { const a = lerp(a0, a1, i / (n - 1)); const ux = cx + Math.cos(a) * 280, uy = cy + Math.sin(a) * 250; const fx = cx + Math.cos(a) * 380, fy = cy + 270; k.rect(ctx, lerp(fx, ux, wrap) - 13, lerp(fy, uy, wrap) - 11, 26, 22, '#5a2a5a', P.ink, 1); }
      // and the cavalry rides round to close the back
      for (const sx of [-1, 1]) { const x = cx + sx * lerp(460, 90, wrap) - 22, y = lerp(cy + 270, top - 70, wrap); for (let i = 0; i < 6; i++) k.circle(ctx, x + (i % 3) * 22, y + Math.floor(i / 3) * 26, 10, '#c9a227', P.ink, 1.2); }
      ctx.save(); ctx.globalAlpha = tween(u, tw - 0.2, tw + 0.3); k.rect(ctx, 60, 980, 430, 40, '#9a2a1e', P.ink, 2); k.rect(ctx, 60, 1040, 250, 40, '#5a2a5a', P.ink, 2); ctx.fillStyle = P.ink; ctx.font = '700 26px Fell'; ctx.textAlign = 'left'; ctx.fillText('ROME ~86,000', 506, 1010); ctx.fillText('HANNIBAL ~50,000', 326, 1070); ctx.restore();
      k.seal(ctx, 900, 1020, 70, ' CANNAE · 216 BC ·', '216 BC', tween(u, ca, ca + 0.4, ease.linear));
    },
  },
  { // 43.8 "but he never takes the city of Rome itself."
    start: 43.4, title: 'Rome Holds', trans: 'ink',
    draw(ctx, u, S) {
      const { k, P, W } = S, ne = S.at('never'), ro = S.at('Rome'), it = S.at('itself.');
      S.cam(lerp(1.2, 1.0, tween(u, 0, it + 0.6, ease.inOut)), lerp(380, W / 2, tween(u, 0, it + 0.6)), 640);
      k.goldSky(ctx, -300, -300, W + 600, 900, S.t);
      k.hills(ctx, W, 380, 9, ['#a8b878', '#8aa068', '#6a8a58'], S.t);
      k.ground(ctx, -300, 460, W + 600, 1200, '#8aa068', 9, 0.3);
      // the city on its hills behind high walls; the gates stay shut
      ctx.save(); ctx.translate(680, 820);
      k.rect(ctx, -300, -220, 600, 220, '#d8c9a8', P.ink, 3); for (let i = 0; i < 15; i++) k.rect(ctx, -300 + i * 40, -244, 22, 26, '#d8c9a8', P.ink, 1.5);
      for (let i = 0; i < 5; i++) { const x = -240 + i * 120; k.rect(ctx, x, -360, 90, 140, '#efe6cf', P.ink, 2); k.poly(ctx, [[x - 8, -360], [x + 45, -400], [x + 98, -360]], '#b0532e', P.ink, 2); }
      const shut = tween(u, ne - 0.2, ne + 0.4, ease.outBack); k.rect(ctx, -60, -150, 60 * shut, 150, '#5a3a1a', P.ink, 2.5); k.rect(ctx, 60 - 60 * shut, -150, 60 * shut, 150, '#5a3a1a', P.ink, 2.5);
      ctx.restore();
      k.figure(ctx, 200, 1000, { ...PUNIC(2, { robe: '#9a2a1e', inner: '#c9a227', hat: 'greekhelm', hatColor: '#c9a24a', crest: '#5a2a5a', skin: '#c68a5e' }), s: 1.0, face: 1, mood: 'calm', ...act(u > it ? 'shrug' : 'think', u, tween(u, ro - 0.2, ro + 0.3)) });
      elephant(ctx, S, 60, 1060, 0.55, 1, S.t, { rider: false });
    },
  },
  { // 47.4 "A child's promise that nearly brought Rome to its knees."
    start: 46.9, title: 'A Child’s Promise', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S, ch = S.at("child's"), ne = S.at('nearly'), kn = S.at('knees.');
      S.cam(lerp(1.4, 0.95, tween(u, ch, kn + 0.6, ease.inOut)), lerp(260, W / 2, tween(u, ch, kn + 0.6)), lerp(820, 600, tween(u, ch, kn + 0.6)));
      seaMap(ctx, S, { route: 1 });
      // the boy at the altar, small in the corner of the map that his march crossed
      k.rect(ctx, 120, 920, 80, 100, '#d8d0c0', P.ink, 2); k.flames && k.flames(ctx, 160, 920, 60, 0.8, S.t);
      k.figure(ctx, 260, 1020, { ...BOY, s: 0.5, face: 1, armF: [1.5, -0.1] });
      const sh = tween(u, ne - 0.2, kn + 0.2); const [x, y] = PLACES.rome;
      if (sh > 0) { ctx.save(); ctx.translate(x + Math.sin(S.t * 30) * 4 * sh, y); for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(0, 0, 20 + i * 14 + ((S.t * 40) % 14), 0, TAU); k.stroke(ctx, P.vermDark, 3); } ctx.restore(); }
    },
  },
  { // 52.3 "Every legend has a beginning."
    start: 52.1, title: 'Every Legend Has a Beginning', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S, beg = S.at('beginning.');
      ctx.save(); S.cam(lerp(1.0, 1.4, tween(u, 0, beg)), 500, 400);
      seaMap(ctx, S, { route: 1 });
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
  { t: 0.5, type: 'thud', gain: 0.45, pitch: 0.6 }, { t: 1.0, type: 'thud', gain: 0.45, pitch: 0.6 }, { t: 3.9, type: 'chime', gain: 0.4, pitch: 1.4 },
  { t: 6.4, type: 'waves', gain: 0.4 }, { t: 7.2, type: 'pop', gain: 0.3 },
  { t: 9.1, type: 'pluck', gain: 0.25 }, { t: 9.5, type: 'pluck', gain: 0.25, pitch: 1.2 }, { t: 11.0, type: 'pluck', gain: 0.3, pitch: 0.8 },
  { t: 13.6, type: 'sizzle', gain: 0.3 }, { t: 18.0, type: 'gong', gain: 0.5, pitch: 0.7 }, { t: 19.9, type: 'stamp', gain: 0.45 },
  { t: 21.4, type: 'riser', gain: 0.35 }, { t: 22.0, type: 'chime', gain: 0.4 },
  { t: 23.4, type: 'stamp', gain: 0.5 }, ...Array.from({ length: 8 }, (_, i) => ({ t: +(27.2 + i * 0.25).toFixed(2), type: 'thud', gain: 0.2, pitch: 0.8 })),
  { t: 29.4, type: 'wind', gain: 0.45 }, { t: 31.4, type: 'wind', gain: 0.4 }, { t: 32.7, type: 'thud', gain: 0.5, pitch: 0.5 },
  { t: 34.0, type: 'wind', gain: 0.5 }, { t: 35.8, type: 'wind', gain: 0.45 },
  { t: 38.9, type: 'thud', gain: 0.4 }, { t: 39.7, type: 'clank', gain: 0.45 }, { t: 40.2, type: 'clank', gain: 0.45, pitch: 1.2 }, { t: 41.3, type: 'whoosh', gain: 0.35 }, { t: 42.6, type: 'gong', gain: 0.55 },
  { t: 43.9, type: 'thud', gain: 0.55, pitch: 0.7 }, { t: 45.5, type: 'pluck', gain: 0.3, pitch: 0.8 },
  { t: 47.3, type: 'sizzle', gain: 0.25 }, { t: 49.1, type: 'riser', gain: 0.4 }, { t: 50.8, type: 'gong', gain: 0.6 },
];

export const music = {
  bpm: 100, root: 'C', maqam: 'hicaz', gain: 0.3,
  sections: [
    { from: 0, to: 6.1, mood: 'intro' },
    { from: 6.1, to: 20.9, mood: 'groove' },
    { from: 20.9, to: 33.8, mood: 'drive' },
    { from: 33.8, to: 37.5, mood: 'sad' },
    { from: 37.5, to: 46.9, mood: 'drive' },
    { from: 46.9, to: 54.4, mood: 'triumph' },
    { from: 54.4, to: 56.2, mood: 'end' },
  ],
};
