// "Crossing the Rubicon" — told as a Roman floor mosaic (`mosaic` device, via
// the shared styles/ottoman/mosaic.mjs): the story opens on a mosaic of a
// river being laid, a sandal steps across it at the end, and in between the
// tale runs by night (Caesar crossed at night). "The die is cast" is labelled
// as Suetonius tells it, written long after. The river's location is shown as
// an open question, as historians leave it.
import { clamp, lerp, ease, tween, rng, TAU } from '../../lib/core.mjs';
import { interior, bookCover } from '../../styles/ottoman/scenes.mjs';
import { act } from '../../styles/ottoman/acting.mjs';
import { mosaic, drawMosaic, mosaicBorder } from '../../styles/ottoman/mosaic.mjs';

export const meta = {
  title: 'Crossing the Rubicon',
  slug: 'rubicon-ottoman',
  style: 'ottoman',
  look: 'night',    // night (after album, tile, ledger)
  room: 'tent',
  device: 'mosaic',
  width: 1080, height: 1920, fps: 30,
  duration: 58.9,
  voice: 'voice.mp3',
  seed: 49,
  captionChars: 30,
  brand: { handle: '@HOWITSTARTED-YT1', logo: '../../../brand/logo.png' },
  outro: { at: 57.1, text: 'Subscribe for more origin stories' },
};

const SKINS = ['#e2b48a', '#d9a882', '#c99a6e', '#f1d1a8'];
const CAESAR = { robe: '#9a2a1e', inner: '#c9a24a', sash: '#c9a24a', hat: 'wreath', hair: '#5a4a3a', skin: '#e2b48a' };
const LEGIONARY = i => ({ robe: '#9a2a1e', inner: '#b8a070', sash: '#5a3a1a', hat: 'greekhelm', hatColor: '#9a9a8a', crest: '#c4371f', skin: SKINS[i % 4] });
const SENATOR = i => ({ robe: '#efe9dc', inner: '#6a2a5a', sash: '#efe9dc', hat: i % 3 === 0 ? 'bald' : 'shorthair', hair: ['#cfcfcf', '#5a4a3a', '#3a2a20'][i % 3], skin: SKINS[i % 4] });

// ---------- the opening and closing mosaics ----------
const paintRiver = (g, S) => {
  const { k, P } = S; mosaicBorder(g, S);
  g.fillStyle = '#5a6a4a'; g.fillRect(66, 66, 948, 968);
  g.fillStyle = '#3a5a6a'; g.beginPath(); g.moveTo(66, 420); g.bezierCurveTo(400, 520, 680, 400, 1014, 520); g.lineTo(1014, 660); g.bezierCurveTo(680, 540, 400, 660, 66, 560); g.closePath(); g.fill();
  g.strokeStyle = '#f3ead8'; g.lineWidth = 10; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(140 + i * 220, 520 + (i % 2) * 20); g.quadraticCurveTo(200 + i * 220, 500, 260 + i * 220, 530); g.stroke(); }
  k.figure(g, 280, 400, { ...LEGIONARY(0), s: 0.9, face: 1, armF: [1.0, 0.3] }); k.figure(g, 420, 380, { ...LEGIONARY(1), s: 0.8, face: 1 });
  g.fillStyle = '#9a2a1e'; g.fillRect(560, 180, 70, 200); g.fillStyle = '#d8a848'; g.font = '900 40px serif'; g.fillText('XIII', 562, 250);
};
const paintPhrase = (g, S) => {
  const { k, P } = S; mosaicBorder(g, S);
  g.fillStyle = '#2a1c12'; g.fillRect(66, 66, 948, 968);
  g.fillStyle = '#3a5a6a'; g.fillRect(66, 560, 948, 140);
  g.fillStyle = '#d8a848'; g.font = '900 120px serif'; g.textAlign = 'center'; g.fillText('ALEA', 540, 330); g.fillText('IACTA EST', 540, 460);
  g.fillStyle = '#e8b890'; g.beginPath(); g.ellipse(560, 760, 70, 34, -0.3, 0, TAU); g.fill(); // a sandalled foot on the far bank
  g.fillStyle = '#7a4a2a'; for (let i = 0; i < 3; i++) g.fillRect(500 + i * 40, 735, 12, 50);
};

function italyMap(ctx, S, o = {}) {
  const { k, P, W } = S;
  ctx.fillStyle = '#2a4a6a'; ctx.fillRect(-300, -300, W + 600, 1800); k.waves(ctx, -300, -300, W + 600, 1800, S.t, '#2a4a6a', '#4a6a8a', 8, 30);
  // north Italy and Gaul above, the boot running down to the south-east
  const land = [[-300, -300], [W + 300, -300], [W + 300, 260], [820, 300], [700, 380], [760, 560], [900, 760], [940, 900], [880, 980], [820, 900], [700, 760], [560, 600], [440, 470], [300, 420], [120, 440], [-300, 420]];
  ctx.beginPath(); k.smoothPath(ctx, land, true); ctx.fillStyle = '#b8b080'; ctx.fill(); k.stroke(ctx, P.ink, 3);
  ctx.fillStyle = 'rgba(120,140,90,0.45)'; ctx.fillRect(-300, -300, W + 600, 380 + 300); // Gaul and the north: Caesar's province
  // the river at the line between province and Italy
  const rv = o.river ?? 1; if (rv > 0) { ctx.save(); ctx.globalAlpha = rv; ctx.beginPath(); ctx.moveTo(560, 120); ctx.quadraticCurveTo(620, 240, 700, 370); k.stroke(ctx, '#6fb0e0', 6 + 6 * (o.glow || 0)); ctx.restore(); }
  for (const [name, x, y] of [['GAUL', 300, 160], ['ITALY', 640, 620], ['ROME', 690, 700], ['ARIMINUM', 780, 420]]) { ctx.fillStyle = P.ink; ctx.font = '700 28px Fell'; ctx.textAlign = 'center'; ctx.fillText(name, x, y); }
  k.circle(ctx, 690, 670, 10, P.vermDark, P.ink, 2); k.circle(ctx, 750, 390, 7, P.ink, null);
}

export const scenes = [
  { // 0.0 "Crossing the Rubicon means a point of no return. It started with a small river and a big crime."
    start: 0, title: 'A Point of No Return',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const po = S.at('point'), re = S.at('return.'), sm = S.at('small'), cr = S.at('crime.');
      S.cam(lerp(1.35, 1.0, tween(u, 0, re + 0.6, ease.inOut)), W / 2, lerp(520, 560, tween(u, 0, re)));
      const A = mosaic('river', S, paintRiver);
      // laid from the river outwards, as a mosaicist would set the most important part first
      drawMosaic(ctx, A, tl => (tween(u, 0, sm, ease.linear) * 1.6 - Math.abs(tl.j - 24) / 30 - tl.n * 0.2) * 5);
      // the crime: a red seal stamps the far bank
      const c = tween(u, cr - 0.2, cr + 0.2, ease.outBack);
      if (c > 0) { ctx.save(); ctx.translate(780, 820); ctx.scale(c, c); k.circle(ctx, 0, 0, 80, '#9a2a1e', P.ink, 3); ctx.fillStyle = P.paperLight; ctx.font = '900 30px Deco'; ctx.textAlign = 'center'; ctx.fillText('LEX', 0, -4); ctx.font = '700 18px Fell'; ctx.fillText('THE LAW', 0, 26); ctx.restore(); }
    },
  },
  { // 8.6 "49 BC."
    start: 7.9, title: '49 BC', trans: 'tiles',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      S.cam(lerp(1.0, 1.1, tween(u, 0, 2.6)), W / 2, 560);
      italyMap(ctx, S, { river: 0.5 });
      k.seal(ctx, 260, 760, 110, ' THE YEAR · 49 BC ·', '49 BC', tween(u, 0.4, 0.9, ease.linear));
    },
  },
  { // 10.9 "Julius Caesar has conquered Gaul."
    start: 10.6, title: 'Caesar in Gaul', trans: 'ink',
    draw(ctx, u, S) {
      const { k, P, W } = S, ju = S.at('Julius'), co = S.at('conquered'), ga = S.at('Gaul.');
      S.cam(lerp(1.2, 1.0, tween(u, 0, ga + 0.4, ease.inOut)), lerp(380, W / 2, tween(u, 0, ga + 0.4)), 680);
      k.nightSky(ctx, -300, -300, W + 600, 900, S.t);
      k.ground(ctx, -300, 600, W + 600, 1100, '#4a5a3a', 5, 0.2);
      // a trophy of captured Gallic arms on a post, and the general beside it
      const tr = tween(u, co - 0.2, co + 0.5, ease.outBack);
      ctx.save(); ctx.translate(720, 1000); ctx.scale(tr, tr);
      k.rect(ctx, -8, -460, 16, 460, '#7a5a3a', P.ink, 2); k.rect(ctx, -160, -380, 320, 14, '#7a5a3a', P.ink, 2);
      k.ellipse(ctx, 0, -300, 70, 110, 0, '#3d6a4a', P.ink, 2.5); for (let i = 0; i < 3; i++) k.circle(ctx, 0, -360 + i * 60, 8, '#c9a227', P.ink, 1);
      k.circle(ctx, 0, -470, 46, '#9a9a8a', P.ink, 2.5); for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sx * 30, -500); ctx.quadraticCurveTo(sx * 70, -540, sx * 60, -580); k.stroke(ctx, '#9a9a8a', 8); }
      for (const sx of [-1, 1]) k.ellipse(ctx, sx * 150, -330, 40, 60, 0, '#8a5a3a', P.ink, 2);
      ctx.restore();
      k.figure(ctx, 330, 1000, { ...CAESAR, s: 1.15, face: 1, mood: 'calm', ...act('present', u, tween(u, ju, ju + 0.4)) });
      for (let i = 0; i < 4; i++) k.figure(ctx, 60 + i * 60, 1060, { ...LEGIONARY(i), s: 0.5, face: 1 });
      k.label(ctx, 'JULIUS CAESAR · 8 YEARS OF WAR IN GAUL', W / 2, 300, 18, tween(u, ga, ga + 0.4));
    },
  },
  { // 13.6 "Now the Senate orders him to give up his army."
    start: 13.3, title: 'The Senate’s Order', trans: 'page',
    draw(ctx, u, S) {
      const { k, P, W } = S, se = S.at('Senate'), or = S.at('orders'), ar = S.at('army.');
      S.cam(lerp(1.0, 1.15, tween(u, or - 0.2, ar + 0.6, ease.inOut)), W / 2, 640);
      interior(ctx, S, { arches: 3, carpet: false });
      // tiers of senators in purple-edged togas, a decree held up
      for (let r = 0; r < 2; r++) for (let i = 0; i < 6; i++) k.figure(ctx, 110 + i * 172 + r * 40, 820 + r * 180, { ...SENATOR(i + r), s: 0.6, face: i < 3 ? 1 : -1, mood: 'calm', ...act(i === 2 && r === 1 ? 'point' : 'rest', u, tween(u, or, or + 0.3)) });
      const d = tween(u, or - 0.1, ar + 0.3, ease.linear);
      k.letter(ctx, W / 2, 440, 560, 220, ['Caesar: give up', 'your army.', '— the Senate'], d, 0.02);
      k.label(ctx, 'ROME · JANUARY 49 BC', W / 2, 220, 20, tween(u, se, se + 0.4));
    },
  },
  { // 16.9 "Bringing an army into Italy is against the law."
    start: 16.6, title: 'Against the Law', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, br = S.at('Bringing'), it = S.at('Italy'), la = S.at('law.');
      S.cam(lerp(1.0, 1.25, tween(u, it - 0.3, la + 0.5, ease.inOut)), lerp(W / 2, 620, tween(u, it, la + 0.5)), lerp(560, 360, tween(u, it, la + 0.5)));
      italyMap(ctx, S, { river: 1 });
      // a little army marches south… and a barrier drops at the line
      const m = tween(u, br - 0.2, it + 0.4, ease.inOut);
      for (let i = 0; i < 5; i++) k.figure(ctx, lerp(380, 560, m) + (i % 3) * 36, lerp(120, 260, m) + Math.floor(i / 3) * 34, { ...LEGIONARY(i), s: 0.26, face: 1, walk: S.t * 7 + i, armF: [0.4, 0.2] });
      const bar = tween(u, la - 0.4, la, ease.outBack);
      if (bar > 0) { ctx.save(); ctx.translate(640, 270); ctx.rotate(-0.9); ctx.scale(bar, 1); k.rect(ctx, -110, -10, 220, 20, P.vermDark, P.ink, 2); for (let i = 0; i < 5; i++) k.rect(ctx, -100 + i * 44, -10, 20, 20, P.white, null); ctx.restore(); }
    },
  },
  { // 20.1 "The border? A small river called the Rubicon."
    start: 19.8, title: 'A Small River', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S, bo = S.at('border?'), sm = S.at('small'), ru = S.at('Rubicon.');
      S.cam(lerp(1.0, 2.0, tween(u, bo, sm + 0.4, ease.inOut)), lerp(W / 2, 640, tween(u, bo, sm + 0.4)), lerp(560, 260, tween(u, bo, sm + 0.4)));
      italyMap(ctx, S, { river: 1, glow: tween(u, ru - 0.3, ru + 0.4) });
      k.label(ctx, 'RUBICON · NEAR ARIMINUM (RIMINI)', 640, 180, 12, tween(u, ru, ru + 0.4));
    },
  },
  { // 24.3 "In January, Caesar leads a single legion to its banks and crosses."
    start: 24.0, title: 'One Legion, at Night', trans: 'ink',
    draw(ctx, u, S) {
      const { k, P, W } = S, ja = S.at('January,'), le = S.at('legion'), ba = S.at('banks'), cr = S.at('crosses.');
      S.cam(lerp(1.0, 1.2, tween(u, ba - 0.4, cr + 0.6, ease.inOut)), lerp(W / 2, 620, tween(u, ba - 0.4, cr + 0.6)), 680);
      k.nightSky(ctx, -300, -300, W + 600, 900, S.t); k.moon(ctx, 860, 200, 44);
      k.ground(ctx, -300, 640, W + 600, 1100, '#3a4a2a', 9, 0.1);
      ctx.save(); ctx.beginPath(); ctx.moveTo(-300, 860); ctx.quadraticCurveTo(540, 800, W + 300, 880); ctx.lineTo(W + 300, 1000); ctx.quadraticCurveTo(540, 940, -300, 1000); ctx.closePath(); ctx.clip(); k.waves(ctx, -300, 780, W + 600, 260, S.t, '#2a4a6a', '#4a6a8a', 18, 20); ctx.restore();
      // the column comes down to the water by torchlight and wades across
      const go = tween(u, le - 0.6, cr + 1.0, ease.inOut);
      for (let i = 0; i < 9; i++) { const q = clamp(go * 1.6 - i * 0.07), x = lerp(-80 + i * 40, 900 + (i % 3) * 50, q), y = q < 0.45 ? 820 : q < 0.7 ? 940 : 1060; k.figure(ctx, x, y, { ...LEGIONARY(i), s: 0.55, face: 1, walk: q > 0 && q < 1 ? S.t * 6 + i : null, armF: i % 3 === 0 ? [2.2, 0.2] : [0.5, 0.2], hold: i % 3 === 0 ? c => { k.rect(c, -3, -60, 6, 60, '#5a3a1a', P.ink, 1); k.ellipse(c, 0, -70, 10, 18, 0, '#ffb347', null); } : null }); }
      ctx.save(); const cq = clamp(go * 1.4); k.figure(ctx, lerp(100, 820, cq), cq < 0.55 ? 820 : cq < 0.75 ? 940 : 1060, { ...CAESAR, s: 0.75, face: 1, mood: 'calm', walk: cq > 0 && cq < 1 ? S.t * 6 : null }); ctx.restore();
      k.label(ctx, 'LEGIO XIII · THE THIRTEENTH LEGION', W / 2, 300, 18, tween(u, le, le + 0.4));
    },
  },
  { // 30.4 "According to the writer Suetonius, he says, The die is cast."
    start: 29.8, title: 'The Die Is Cast', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, su = S.at('Suetonius,'), di = S.at('die'), ca = S.at('cast.');
      S.cam(lerp(1.0, 1.3, tween(u, di - 0.4, ca + 0.6, ease.inOut)), W / 2, lerp(620, 700, tween(u, di - 0.4, ca + 0.6)));
      ctx.fillStyle = '#2a1e2e'; ctx.fillRect(-300, -300, W + 600, 1800);
      const g = ctx.createRadialGradient(W / 2, 760, 20, W / 2, 760, 600); g.addColorStop(0, 'rgba(255,214,140,0.45)'); g.addColorStop(1, 'rgba(255,214,140,0)'); ctx.fillStyle = g; ctx.fillRect(-300, -300, W + 600, 1800);
      // a gaming board; the die tumbles and stops
      k.rect(ctx, 200, 800, 680, 220, '#7a5a3a', P.ink, 3); for (let i = 0; i < 6; i++) k.rect(ctx, 230 + i * 106, 830, 90, 160, '#a8784a', P.ink, 1.5);
      const roll = tween(u, di - 0.6, ca, ease.outCubic);
      ctx.save(); ctx.translate(lerp(240, 600, roll), 760 - Math.abs(Math.sin(roll * Math.PI * 3)) * 160 * (1 - roll)); ctx.rotate((1 - roll) * 9);
      k.rect(ctx, -44, -44, 88, 88, '#efe6cf', P.ink, 3); for (const [dx, dy] of [[-22, -22], [22, -22], [0, 0], [-22, 22], [22, 22]]) k.circle(ctx, dx, dy, 7, P.ink, null);
      ctx.restore();
      const wr = tween(u, di - 0.2, ca + 0.6, ease.linear);
      ctx.fillStyle = P.goldLight; ctx.font = '900 96px Deco'; ctx.textAlign = 'center'; ctx.fillText('ALEA IACTA EST'.slice(0, Math.ceil(14 * wr)), W / 2, 360);
      ctx.fillStyle = P.paperLight; ctx.font = 'italic 600 40px GaramondItalic'; ctx.globalAlpha = tween(u, ca, ca + 0.4); ctx.fillText('“The die is cast.”', W / 2, 440); ctx.globalAlpha = 1;
      k.label(ctx, 'SUETONIUS · WRITING ABOUT 170 YEARS LATER', W / 2, 560, 16, tween(u, su, su + 0.4));
    },
  },
  { // 35.1 "It's treason. Rome's civil war begins."
    start: 34.9, title: 'Civil War', trans: 'flash',
    draw(ctx, u, S) {
      const { k, P, W } = S, tr = S.at('treason.'), ci = S.at('civil'), be = S.at('begins.');
      S.cam(lerp(1.3, 1.0, tween(u, 0, be + 0.4, ease.inOut)), W / 2, 640);
      ctx.fillStyle = '#3a1a1a'; ctx.fillRect(-300, -300, W + 600, 1800);
      // two eagle standards, two Roman armies, facing each other
      const face = tween(u, ci - 0.4, be + 0.4, ease.inOut);
      for (const sx of [-1, 1]) {
        const x = W / 2 + sx * lerp(420, 240, face);
        ctx.beginPath(); ctx.moveTo(x, 1000); ctx.lineTo(x, 420); k.stroke(ctx, '#c9a227', 8);
        ctx.save(); ctx.translate(x, 400); ctx.scale(-sx, 1); k.poly(ctx, [[-60, 0], [0, -40], [60, 0], [20, 10], [0, 40], [-20, 10]], '#d8a848', P.ink, 2); ctx.restore();
        for (let i = 0; i < 5; i++) k.figure(ctx, x - sx * (60 + i * 60), 1060 - (i % 2) * 30, { ...LEGIONARY(i), crest: sx < 0 ? '#c4371f' : '#efe6cf', s: 0.6, face: -sx, mood: 'calm', armF: [1.45, -0.2] });
      }
      ctx.fillStyle = P.vermDark; ctx.font = '900 90px Deco'; ctx.textAlign = 'center'; ctx.globalAlpha = tween(u, tr - 0.1, tr + 0.3); ctx.fillText('TREASON', W / 2, 260); ctx.globalAlpha = 1;
      k.label(ctx, 'CAESAR AGAINST POMPEY AND THE SENATE', W / 2, 340, 16, tween(u, ci, ci + 0.4));
    },
  },
  { // 39.4 "Caesar wins and becomes dictator. Rome changes forever."
    start: 38.9, title: 'Dictator', trans: 'ink',
    draw(ctx, u, S) {
      const { k, P, W } = S, wi = S.at('wins'), di = S.at('dictator.'), fo = S.at('forever.');
      S.cam(lerp(1.0, 1.2, tween(u, di - 0.3, fo + 0.4, ease.inOut)), W / 2, lerp(620, 560, tween(u, di, fo)));
      interior(ctx, S, { arches: 3, carpetColor: '#9a2a1e' });
      k.rect(ctx, 380, 860, 320, 40, '#c9a227', P.ink, 2.5); k.rect(ctx, 420, 900, 20, 100, '#c9a227', P.ink, 2); k.rect(ctx, 640, 900, 20, 100, '#c9a227', P.ink, 2);
      k.figure(ctx, W / 2, 900, { ...CAESAR, robe: '#6a2a5a', inner: '#c9a227', s: 1.1, face: 1, kneel: true, mood: 'calm', ...act(u > di ? 'present' : 'rest', u, tween(u, di - 0.2, di + 0.3)) });
      for (let i = 0; i < 4; i++) k.figure(ctx, 120 + i * 90 + (i > 1 ? 560 : 0), 1060, { ...SENATOR(i), s: 0.55, face: i > 1 ? -1 : 1, mood: 'sad' });
      k.label(ctx, 'THE REPUBLIC GIVES WAY TO EMPERORS', W / 2, 260, 18, tween(u, fo - 0.2, fo + 0.4));
    },
  },
  { // 44.8 "Today, historians still aren't sure exactly which river was the Rubicon."
    start: 44.2, title: 'Which River?', trans: 'tiles',
    draw(ctx, u, S) {
      const { k, P, W } = S, hi = S.at('historians'), wh = S.at('which'), ru = S.at('Rubicon.');
      S.cam(lerp(1.0, 1.6, tween(u, hi - 0.3, wh + 0.6, ease.inOut)), lerp(W / 2, 640, tween(u, hi - 0.3, wh + 0.6)), lerp(560, 300, tween(u, hi - 0.3, wh + 0.6)));
      italyMap(ctx, S, { river: 0 });
      // several small streams run to the sea there; each could be the one
      const q = tween(u, wh - 0.4, ru + 0.4);
      [[540, 600], [620, 680], [700, 760]].forEach(([x0, x1], i) => { ctx.beginPath(); ctx.moveTo(x0, 120); ctx.quadraticCurveTo((x0 + x1) / 2 + 30, 240, x1 - 40 + i * 10, 360 + i * 8); k.stroke(ctx, '#6fb0e0', 5); ctx.save(); ctx.globalAlpha = clamp(q * 3 - i); ctx.fillStyle = P.vermDark; ctx.font = '900 50px Deco'; ctx.textAlign = 'center'; ctx.fillText('?', x0 + 10, 110); ctx.restore(); });
      k.label(ctx, 'SEVERAL STREAMS ARE STILL CANDIDATES', 640, 420, 12, tween(u, ru, ru + 0.4));
    },
  },
  { // 50.0 "one small stream that became a phrase for no turning back."
    start: 49.6, title: 'No Turning Back', trans: 'tiles',
    draw(ctx, u, S) {
      const { k, P, W } = S, ph = S.at('phrase'), tu = S.at('turning'), ba = S.at('back.');
      S.cam(lerp(1.3, 1.0, tween(u, 0, ba + 0.6, ease.inOut)), W / 2, lerp(700, 560, tween(u, 0, ba + 0.6)));
      const A = mosaic('river', S, paintRiver), B = mosaic('phrase', S, paintPhrase);
      const flip = tween(u, ph - 1.0, ba + 0.4, ease.linear);
      drawMosaic(ctx, A, tl => 1 - (flip * 1.6 - tl.n * 0.6) * 4);
      drawMosaic(ctx, B, tl => (flip * 1.6 - tl.n * 0.6) * 4, 'rgba(0,0,0,0)');
    },
  },
  { // 55.6 "Every legend has a beginning."
    start: 55.0, title: 'Every Legend Has a Beginning', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S, beg = S.at('beginning.');
      ctx.save(); S.cam(lerp(1.0, 1.4, tween(u, 0, beg)), W / 2, 420);
      drawMosaic(ctx, mosaic('phrase', S, paintPhrase), () => 1);
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
  ...Array.from({ length: 12 }, (_, i) => ({ t: +(0.2 + i * 0.3).toFixed(2), type: 'pop', gain: 0.1, pitch: 1.4 + (i % 3) * 0.1 })), { t: 2.8, type: 'waves', gain: 0.35 }, { t: 6.9, type: 'stamp', gain: 0.6 },
  { t: 8.7, type: 'stamp', gain: 0.45 }, { t: 12.0, type: 'clank', gain: 0.4 }, { t: 12.5, type: 'gong', gain: 0.35, pitch: 0.8 },
  { t: 14.3, type: 'paper', gain: 0.35 }, { t: 15.7, type: 'pluck', gain: 0.3, pitch: 0.8 },
  ...Array.from({ length: 5 }, (_, i) => ({ t: +(17.0 + i * 0.35).toFixed(2), type: 'thud', gain: 0.2 })), { t: 19.0, type: 'clank', gain: 0.5, pitch: 0.7 },
  { t: 20.2, type: 'pop', gain: 0.3 }, { t: 22.9, type: 'chime', gain: 0.4, pitch: 1.2 },
  { t: 25.0, type: 'wind', gain: 0.35 }, { t: 27.4, type: 'waves', gain: 0.5 }, { t: 28.6, type: 'splash', gain: 0.45 },
  { t: 32.0, type: 'clank', gain: 0.3, pitch: 1.6 }, { t: 32.4, type: 'clank', gain: 0.3, pitch: 1.5 }, { t: 32.8, type: 'clank', gain: 0.3, pitch: 1.4 }, { t: 33.7, type: 'thud', gain: 0.6, pitch: 0.7 },
  { t: 35.2, type: 'thunder', gain: 0.5 }, { t: 37.0, type: 'clank', gain: 0.45 }, { t: 37.7, type: 'gong', gain: 0.5 },
  { t: 40.6, type: 'stamp', gain: 0.5 }, { t: 42.9, type: 'gong', gain: 0.45, pitch: 0.8 },
  { t: 45.2, type: 'pluck', gain: 0.3 }, { t: 47.1, type: 'pop', gain: 0.3 }, { t: 47.6, type: 'pop', gain: 0.3, pitch: 1.2 }, { t: 48.7, type: 'pop', gain: 0.3, pitch: 1.4 },
  ...Array.from({ length: 10 }, (_, i) => ({ t: +(51.0 + i * 0.22).toFixed(2), type: 'pop', gain: 0.1, pitch: 1.3 + (i % 3) * 0.1 })), { t: 53.8, type: 'chime', gain: 0.5, pitch: 1.3 },
];

export const music = {
  bpm: 96, root: 'G', maqam: 'nihavend', gain: 0.3,
  sections: [
    { from: 0, to: 7.9, mood: 'intro' },
    { from: 7.9, to: 24.0, mood: 'groove' },
    { from: 24.0, to: 34.9, mood: 'drive' },
    { from: 34.9, to: 44.2, mood: 'drive' },
    { from: 44.2, to: 49.6, mood: 'sad' },
    { from: 49.6, to: 57.1, mood: 'triumph' },
    { from: 57.1, to: 58.9, mood: 'end' },
  ],
};
