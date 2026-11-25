// "Wash Your Hands" — Ignaz Semmelweis and the handwashing order of 1847,
// told by a meddah (a coffeehouse storyteller) to his listeners (`meddah`
// device). One object keeps coming back: a marble washbasin with a jar of
// chlorine solution beside it. Kept calm on purpose: the mothers are never
// shown ill — the loss is a ledger of bars; the autopsy room is a closed door;
// what the doctors carried is drawn as faint green specks that wash away.
// His death is marked only by dates on a frame. Not medical advice.
import { clamp, lerp, ease, tween, rng, TAU } from '../../lib/core.mjs';
import { interior, bookCover } from '../../styles/ottoman/scenes.mjs';
import { act } from '../../styles/ottoman/acting.mjs';

export const meta = {
  title: 'Wash Your Hands',
  slug: 'semmelweis-ottoman',
  style: 'ottoman',
  look: 'scroll',   // scroll (after night, tile, album)
  ambient: 'dust',
  room: 'tiles',
  device: 'meddah',
  width: 1080, height: 1920, fps: 30,
  duration: 41.4,
  voice: 'voice.mp3',
  seed: 1847,
  captionChars: 30,
  brand: { handle: '@HOWITSTARTED-YT1', logo: '../../../brand/logo.png' },
  outro: { at: 39.7, text: 'Subscribe for more origin stories' },
};

const SKINS = ['#f1d1a8', '#e2b48a', '#d9a882', '#c99a6e'];
const MEDDAH = { robe: '#3d6a4a', robeP: 'dots', inner: '#efe6cf', sash: '#9a2a1e', hat: 'turban', beard: true, beardColor: '#4a3a2a', skin: '#c99a6e' };
const SEMMEL = { robe: '#2a2a3a', inner: '#efe6cf', sash: '#2a2a3a', hat: 'bald', hair: '#5a3a24', mustache: true, mustacheColor: '#5a3a24', skin: '#f1d1a8' };
const DOCTOR = i => ({ robe: ['#3a3a4a', '#4a2a2a', '#2a3a4a', '#3a3a2a'][i % 4], inner: '#efe6cf', sash: '#1a1a1a', hat: ['shorthair', 'bald', 'shorthair', 'bald'][i % 4], hair: ['#3a2a20', '#8a8a8a', '#1a1a1a', '#6a4a2a'][i % 4], mustache: i % 2 === 0, mustacheColor: '#3a2a20', skin: SKINS[i % 4] });
const TOPHAT = i => ({ ...DOCTOR(i), hat: 'stovepipe', hatColor: '#1a1a1a' });
const MIDWIFE = i => ({ robe: ['#efe6cf', '#e8dcc0'][i % 2], inner: '#2f5f8a', sash: '#2f5f8a', hat: 'bun', hair: ['#5a3a2a', '#2a1a12', '#8a5a2a'][i % 3], skin: SKINS[(i + 1) % 4] });

// ---------- the storyteller and his listeners ----------
function meddah(ctx, S, x, u, o = {}) {
  const { k, P } = S;
  k.rect(ctx, x - 70, 760, 140, 250, P.brown, P.ink, 2.5); k.rect(ctx, x - 90, 740, 180, 30, P.brownLight, P.ink, 2);
  k.figure(ctx, x, 760, { ...MEDDAH, s: 1.1, face: 1, kneel: true, mood: o.mood || 'happy', armF: [o.arm ?? (1.6 + Math.sin(u * 3) * 0.3), 0.2], hold: c => { c.rotate(-0.4); k.rect(c, -4, -150, 8, 170, P.brownLight, P.ink, 1.5); } });
  k.poly(ctx, [[x - 30, 550], [x - 58, 610], [x - 12, 620]], P.white, P.ink, 1.5); // his handkerchief
}
function listeners(ctx, S, u, react = 0, mood = 'wow') {
  const { k, P } = S;
  [600, 740, 880].forEach((x, i) => k.figure(ctx, x, 1010, { robe: [P.lapis, P.verm, P.ochre][i], robeP: 'dots', hat: ['fez', 'turban', 'fez'][i], hatColor: [P.verm, P.white, P.vermDark][i], skin: SKINS[i + 1], s: 0.85, face: -1, kneel: true, mood: react > 0.5 ? mood : 'calm', armF: [lerp(0.8, 1.9, react) + Math.sin(u * 4 + i) * 0.1 * react, 0.3] }));
}
function cloudPanel(ctx, S, x, y, w, h, a, draw) {
  if (a <= 0) return;
  const { k, P } = S;
  ctx.save(); ctx.globalAlpha *= clamp(a);
  k.rect(ctx, x - w / 2, y - h / 2, w, h, '#f6eed8', P.ink, 3);
  ctx.save(); ctx.beginPath(); ctx.rect(x - w / 2, y - h / 2, w, h); ctx.clip(); ctx.translate(x, y); draw(ctx); ctx.restore();
  for (let i = 0; i < 3; i++) k.circle(ctx, x - w / 2 + 40 - i * 30, y + h / 2 + 30 + i * 34, 14 - i * 3, '#f6eed8', P.ink, 2);
  ctx.restore();
}

// ---------- the recurring object: the basin and the chlorine jar ----------
function basin(ctx, S, x, y, s, flow, t) {
  const { k } = S;
  const [mx, my] = k.kurna(ctx, x, y, s);
  k.waterStream(ctx, mx, my, mx + 14 * s, my + 20 * s, mx + 10 * s, my + 90 * s, flow, t, 12 * s);
  k.jar(ctx, x + 150 * s, y, 0.55 * s, 'CHLORINE');
}
// what the doctors carried, drawn gently: faint green specks
function specks(ctx, S, x, y, r, a, seed = 3) {
  if (a <= 0) return;
  const { k } = S, R = rng(seed);
  ctx.save(); ctx.globalAlpha *= clamp(a);
  for (let i = 0; i < 9; i++) { const q = R() * TAU, d = R() * r; k.circle(ctx, x + Math.cos(q) * d + Math.sin(S.t * 3 + i) * 3, y + Math.sin(q) * d * 0.7, 3 + R() * 3, 'rgba(120,200,90,0.85)', 'rgba(40,90,30,0.8)', 1); }
  ctx.restore();
}
function door(ctx, S, x, y, w, h, sign, color, fs = 24) {
  const { k, P } = S;
  k.rect(ctx, x - w / 2 - 14, y - h - 14, w + 28, h + 14, P.stone || '#cfc6b4', P.ink, 2.5);
  ctx.beginPath(); ctx.moveTo(x - w / 2, y); ctx.lineTo(x - w / 2, y - h + w / 2); ctx.arc(x, y - h + w / 2, w / 2, Math.PI, 0); ctx.lineTo(x + w / 2, y); ctx.closePath(); k.fillStroke(ctx, color, P.ink, 2.5);
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - h + 10); k.stroke(ctx, P.ink, 2); k.circle(ctx, x + 18, y - h * 0.45, 6, P.gold, P.ink, 1.5); k.circle(ctx, x - 18, y - h * 0.45, 6, P.gold, P.ink, 1.5);
  k.cartouche(ctx, x, y - h - 50, Math.max(w + 60, sign.length * fs * 0.7 + 40), 50, P.paperLight, P.goldDark, 2);
  ctx.fillStyle = P.ink; ctx.font = `900 ${fs}px Deco`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(sign, x, y - h - 48); ctx.textBaseline = 'alphabetic';
}
// a ledger page with bars; vals in percent, k = how far the bars have grown
function ledger(ctx, S, x, y, w, h, rows, k1, title) {
  const { k, P } = S;
  k.rect(ctx, x - w / 2, y - h / 2, w, h, '#efe6cf', P.ink, 3);
  for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.moveTo(x - w / 2 + 20, y - h / 2 + 90 + i * (h - 120) / 8); ctx.lineTo(x + w / 2 - 20, y - h / 2 + 90 + i * (h - 120) / 8); k.stroke(ctx, 'rgba(90,60,30,0.18)', 2); }
  ctx.fillStyle = P.ink; ctx.font = '900 30px Deco'; ctx.textAlign = 'center'; ctx.fillText(title, x, y - h / 2 + 56);
  const bw = (w - 80) / rows.length, base = y + h / 2 - 70, max = h - 220;
  rows.forEach((r, i) => {
    const bx = x - w / 2 + 40 + i * bw + bw * 0.18, v = r.v * clamp(r.k ?? k1);
    k.rect(ctx, bx, base - v * max / 12, bw * 0.64, v * max / 12, r.c, P.ink, 2);
    ctx.fillStyle = P.ink; ctx.font = '700 28px Fell'; ctx.fillText(r.l, bx + bw * 0.32, base + 40);
    if ((r.k ?? k1) > 0.6) { ctx.font = '900 34px Deco'; ctx.fillStyle = r.c === P.verm ? P.vermDark : P.ink; ctx.fillText(r.t, bx + bw * 0.32, base - v * max / 12 - 16); }
  });
}
function hospital(ctx, S, x, base, w, h) {
  const { k, P } = S;
  k.rect(ctx, x - w / 2, base - h, w, h, '#e9dcc0', P.ink, 3);
  k.rect(ctx, x - w / 2 - 10, base - h - 26, w + 20, 30, '#b8a88a', P.ink, 2.5);
  for (let r = 0; r < 3; r++) for (let c = 0; c < 7; c++) { const wx = x - w / 2 + 40 + c * (w - 80) / 6.2, wy = base - h + 40 + r * 90; k.rect(ctx, wx, wy, 44, 60, '#5a6a8a', P.ink, 2); }
  ctx.beginPath(); ctx.moveTo(x - 60, base); ctx.lineTo(x - 60, base - 110); ctx.arc(x, base - 110, 60, Math.PI, 0); ctx.lineTo(x + 60, base); ctx.closePath(); k.fillStroke(ctx, '#6a4a2a', P.ink, 2.5);
}
function spire(ctx, S, x, base, h) {
  const { k, P } = S;
  k.rect(ctx, x - 40, base - h * 0.45, 80, h * 0.45, '#cfc0a0', P.ink, 2.5);
  k.poly(ctx, [[x - 40, base - h * 0.45], [x, base - h], [x + 40, base - h * 0.45]], '#bfae8a', P.ink, 2.5);
  for (let i = 1; i < 6; i++) { const yy = base - h * 0.45 - i * h * 0.09, ww = 40 * (1 - i * 0.16); ctx.beginPath(); ctx.moveTo(x - ww, yy); ctx.lineTo(x + ww, yy); k.stroke(ctx, P.ink, 1.5); }
}

function corridor(ctx, S) {
  const { k, P, W } = S;
  ctx.fillStyle = '#d9cfbb'; ctx.fillRect(-300, -300, W + 600, 1200);
  // vaulted ceiling ribs and a long floor running away to a far window
  for (let i = 0; i < 6; i++) { const y = 140 + i * 26, w = 1400 - i * 180; ctx.beginPath(); ctx.ellipse(W / 2, y + 220, w / 2, 220 - i * 22, 0, Math.PI, 0); k.stroke(ctx, 'rgba(90,70,40,0.35)', 3); }
  k.rect(ctx, W / 2 - 70, 470, 140, 190, '#bcd6df', P.ink, 2.5); ctx.beginPath(); ctx.moveTo(W / 2, 470); ctx.lineTo(W / 2, 660); ctx.moveTo(W / 2 - 70, 560); ctx.lineTo(W / 2 + 70, 560); k.stroke(ctx, P.ink, 2);
  ctx.beginPath(); ctx.moveTo(-300, 1300); ctx.lineTo(W / 2 - 90, 680); ctx.lineTo(W / 2 + 90, 680); ctx.lineTo(W + 300, 1300); ctx.closePath(); k.fillStroke(ctx, '#a8946e', P.ink, 2);
  for (let i = 0; i < 8; i++) { const q = i / 8, y = lerp(680, 1300, q * q); ctx.beginPath(); ctx.moveTo(lerp(W / 2 - 90, -300, q * q), y); ctx.lineTo(lerp(W / 2 + 90, W + 300, q * q), y); k.stroke(ctx, 'rgba(60,40,20,0.35)', 2); }
  ctx.fillStyle = '#c4b494'; ctx.fillRect(-300, 860, W + 600, 4);
}
function marble(ctx, S) {
  const { k, P, W } = S, R = rng(61);
  ctx.fillStyle = '#ece7dd'; ctx.fillRect(-300, -300, W + 600, 1800);
  for (let i = 0; i < 14; i++) { ctx.beginPath(); let x = R() * W, y = R() * 1300; ctx.moveTo(x, y); for (let j = 0; j < 5; j++) { x += 60 + R() * 80; y += (R() - 0.5) * 120; ctx.lineTo(x, y); } k.stroke(ctx, 'rgba(120,120,130,0.25)', 2 + R() * 2); }
  k.rect(ctx, -300, 1000, W + 600, 800, '#5a3a24', P.ink, 3);
}

export const scenes = [
  { // 0.0 "The doctor who told other doctors to wash their hands was rejected."
    start: 0, title: 'Wash Your Hands',
    draw(ctx, u, S) {
      const { k, P, W } = S, wa = S.at('wash'), re = S.at('rejected.');
      S.cam(lerp(1.15, 1.0, tween(u, 0, re + 0.6, ease.inOut)), lerp(420, W / 2, tween(u, 0, re + 0.6)), 660);
      interior(ctx, S, { arches: 3, carpetColor: '#9a2a1e' });
      meddah(ctx, S, 260, u, { arm: re < u ? 2.2 : undefined, mood: u > re ? 'worry' : 'happy' });
      listeners(ctx, S, u, tween(u, re - 0.2, re + 0.4), 'wow');
      cloudPanel(ctx, S, 640, 380, 560, 380, tween(u, 0.3, 1.0), c => {
        c.fillStyle = '#e9dcc0'; c.fillRect(-300, -200, 600, 400);
        const flow = tween(u, wa - 0.4, wa + 0.4);
        c.save(); c.translate(-120, 170); basin(c, S, 0, 0, 0.9, flow, S.t); c.restore();
        // a doctor offers the basin; the others wave it away
        const no = tween(u, re - 0.4, re + 0.3);
        k.figure(c, 110, 180, { ...DOCTOR(1), s: 0.55, face: -1, mood: 'happy', ...act('present', u, 1 - no * 0.5) });
        for (let i = 0; i < 2; i++) { c.save(); c.globalAlpha = no; k.figure(c, 190 + i * 70, 180, { ...TOPHAT(i * 2), s: 0.55, face: 1, mood: 'angry', ...act('shrug', u + i, no) }); c.restore(); }
      });
    },
  },
  { // 5.6 "1847, Vienna. Dr. Ignaz Semmelweis notices something terrible."
    start: 5.4, title: 'Vienna, 1847', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W } = S, vi = S.at('Vienna.'), dr = S.at('Dr.'), te = S.at('terrible.');
      S.cam(lerp(0.95, 1.2, tween(u, dr - 0.6, te + 0.4, ease.inOut)), lerp(W / 2, 640, tween(u, dr - 0.6, te + 0.4)), lerp(560, 720, tween(u, dr - 0.6, te + 0.4)));
      ctx.fillStyle = '#dfe6e8'; ctx.fillRect(-300, -300, W + 600, 1100);
      k.cloud?.(ctx, 220 + S.t * 8, 260, 1); k.cloud?.(ctx, 760 + S.t * 6, 200, 0.8);
      spire(ctx, S, 200, 760, 560);
      for (let i = 0; i < 4; i++) k.dome(ctx, 400 + i * 190, 760, 46 + (i % 2) * 14, i % 2 ? '#6a8a7a' : P.lapisLight);
      ctx.fillStyle = '#cdbb8e'; ctx.fillRect(-300, 760, W + 600, 900);
      hospital(ctx, S, 620, 1040, 760, 320);
      k.label(ctx, 'VIENNA GENERAL HOSPITAL', 620, 680, 20, tween(u, vi - 0.1, vi + 0.4));
      k.seal(ctx, 860, 300, 70, ' VIENNA · 1847 ·', '1847', tween(u, 0, 0.6, ease.linear));
      const w = tween(u, dr - 0.3, dr + 1.4);
      if (w > 0) k.figure(ctx, lerp(-60, 520, w), 1060, { ...SEMMEL, s: 0.8, face: 1, walk: w < 1 ? S.t * 9 : null, mood: u > te ? 'worry' : 'calm', ...(u > te ? act('worry', u, tween(u, te - 0.2, te + 0.3)) : {}) });
      k.label(ctx, 'IGNAZ SEMMELWEIS', 520, 1100, 18, tween(u, dr + 0.6, dr + 1.0));
    },
  },
  { // 12.5 "New mothers treated by doctors die of a fever, far more often than those treated by midwives."
    start: 12.3, title: 'Two Clinics', trans: 'wipe',
    draw(ctx, u, S) {
      const { k, P, W } = S, dc = S.at('doctors'), fe = S.at('fever,'), mi = S.at('midwives.');
      S.cam(lerp(0.96, 1.03, tween(u, 0, 6.0)), W / 2, lerp(620, 660, tween(u, fe - 0.3, mi + 0.3)));
      interior(ctx, S, { arches: 3, carpetColor: '#2f5f8a' });
      door(ctx, S, 300, 760, 170, 300, 'FIRST CLINIC', '#6a3a2a');
      door(ctx, S, 780, 760, 170, 300, 'SECOND CLINIC', '#3a5a6a');
      for (let i = 0; i < 2; i++) k.figure(ctx, 180 + i * 230, 1010, { ...DOCTOR(i), s: 0.78, face: i ? -1 : 1, mood: 'calm', armF: [0.3, 0.2] });
      for (let i = 0; i < 2; i++) { ctx.save(); ctx.globalAlpha = tween(u, mi - 0.5, mi); k.figure(ctx, 660 + i * 230, 1010, { ...MIDWIFE(i), s: 0.78, face: i ? -1 : 1, mood: 'calm', armF: [0.3, 0.2] }); ctx.restore(); }
      k.label(ctx, 'RUN BY DOCTORS', 290, 1060, 16, tween(u, dc, dc + 0.4));
      k.label(ctx, 'RUN BY MIDWIVES', 790, 1060, 16, tween(u, mi, mi + 0.4));
      // two candles under each door: the left one burns far shorter — a quiet stand-in for the toll
      const g = tween(u, fe - 0.2, mi + 0.6);
      ctx.save(); ctx.globalAlpha = g; k.rect(ctx, 180, 270, 220, 64, '#efe6cf', P.ink, 2.5); k.rect(ctx, 680, 270, 220, 64, '#efe6cf', P.ink, 2.5);
      ctx.fillStyle = P.vermDark; ctx.font = '900 30px Deco'; ctx.textAlign = 'center'; ctx.fillText('≈ 1 IN 10', 290, 313); ctx.fillStyle = P.ink; ctx.fillText('≈ 1 IN 25', 790, 313); ctx.restore();
      k.label(ctx, 'MOTHERS LOST TO CHILDBED FEVER · 1841–46', W / 2, 225, 16, tween(u, mi + 0.3, mi + 0.8));
    },
  },
  { // 18.8 "The doctors often come straight from doing autopsies,"
    start: 18.7, title: 'Straight From the Autopsy Room', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, st = S.at('straight'), au = S.at('autopsies,');
      S.cam(lerp(1.12, 1.0, tween(u, 0, 1.6, ease.inOut)), lerp(420, W / 2, tween(u, 0, 1.6)), 700);
      corridor(ctx, S);
      door(ctx, S, 250, 860, 150, 280, 'AUTOPSY ROOM', '#4a4a4a', 20);
      door(ctx, S, 800, 860, 150, 280, 'MATERNITY WARD', '#3a5a6a', 19);
      const w = tween(u, st - 0.6, au + 1.0, ease.linear);
      for (let i = 0; i < 3; i++) {
        const x = lerp(250, 660, clamp(w * 1.2 - i * 0.18));
        k.figure(ctx, x, 1010, { ...DOCTOR(i), s: 0.78, face: 1, walk: w > 0 && w < 1 ? S.t * 9 + i : null, mood: 'calm', armF: [0.9, 0.3] });
        specks(ctx, S, x + 58, 830, 34, tween(u, au - 0.6, au), 7 + i);
      }
      k.label(ctx, 'NO ONE KNEW ABOUT GERMS YET', W / 2, 1100, 16, tween(u, au + 0.1, au + 0.5));
    },
  },
  { // 21.9 "so he orders them to wash their hands in a chlorine solution."
    start: 21.7, title: 'Chlorine at the Door', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S, or = S.at('orders'), wa = S.at('wash'), ch = S.at('chlorine');
      S.cam(lerp(1.0, 1.15, tween(u, wa - 0.3, ch + 0.8, ease.inOut)), lerp(W / 2, 500, tween(u, wa - 0.3, ch + 0.8)), lerp(660, 740, tween(u, wa - 0.3, ch + 0.8)));
      interior(ctx, S, { arches: 3, carpetColor: '#2f5f8a' });
      k.figure(ctx, 760, 1010, { ...SEMMEL, s: 0.82, face: -1, mood: 'calm', ...act('point', u, tween(u, or - 0.3, or + 0.2)) });
      basin(ctx, S, 470, 1010, 1.05, tween(u, wa - 0.5, wa + 0.2), S.t);
      const clean = tween(u, ch - 0.1, ch + 1.0);
      k.figure(ctx, 300, 1010, { ...DOCTOR(0), s: 0.78, face: 1, mood: clean > 0.5 ? 'happy' : 'calm', armF: [1.25, 0.5] });
      specks(ctx, S, 420, 850, 30, 1 - clean, 11);
      for (let i = 0; i < 2; i++) k.figure(ctx, 140 - i * 120, 1010, { ...DOCTOR(i + 1), s: 0.74, face: 1, mood: 'calm', armF: [0.4, 0.2] });
      k.label(ctx, 'MAY 1847 · WASH BEFORE THE WARD', 500, 1100, 16, tween(u, ch, ch + 0.4));
    },
  },
  { // 25.8 "Deaths drop sharply."
    start: 25.5, title: 'Deaths Drop Sharply', trans: 'page',
    draw(ctx, u, S) {
      const { k, P, W } = S, de = S.at('Deaths'), dr = S.at('drop'), sh = S.at('sharply.');
      S.cam(lerp(1.08, 1.0, tween(u, 0, 2.0, ease.inOut)), W / 2, 640);
      ctx.fillStyle = '#5a3a24'; ctx.fillRect(-300, -300, W + 600, 1800);
      ledger(ctx, S, W / 2, 660, 760, 720, [
        { l: '1846', v: 11.4, t: '11.4%', c: P.verm, k: tween(u, 0, de) },
        { l: '1847', v: 5.0, t: '5.0%', c: P.ochre, k: tween(u, de, dr + 0.2) },
        { l: '1848', v: 1.3, t: '1.3%', c: P.green, k: tween(u, dr + 0.1, sh + 0.2) },
      ], 0, 'FIRST CLINIC · MOTHERS LOST');
      basin(ctx, S, 880, 1120, 0.45, 1, S.t);
    },
  },
  { // 27.7 "But many doctors refuse to believe they're the problem."
    start: 27.4, title: 'Not Us', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, re = S.at('refuse'), pr = S.at('problem.');
      S.cam(lerp(1.0, 1.15, tween(u, 0, 3.5)), lerp(W / 2, 600, tween(u, 0, 3.5)), 620);
      interior(ctx, S, { arches: 3, carpetColor: '#9a2a1e' });
      meddah(ctx, S, 260, u, { mood: 'worry', arm: 1.2 });
      listeners(ctx, S, u, tween(u, pr - 0.4, pr + 0.2), 'worry');
      cloudPanel(ctx, S, 620, 370, 600, 380, tween(u, 0, 0.5), c => {
        c.fillStyle = '#e9dcc0'; c.fillRect(-320, -200, 640, 400);
        k.figure(c, -210, 180, { ...SEMMEL, s: 0.55, face: 1, mood: 'worry', ...act('present', u, 1) });
        const turn = tween(u, re - 0.2, re + 0.6);
        for (let i = 0; i < 4; i++) k.figure(c, -40 + i * 95, 180, { ...TOPHAT(i), s: 0.52, face: turn > (i + 1) / 5 ? 1 : -1, mood: 'angry', ...act(i % 2 ? 'shrug' : 'angry', u + i, turn) });
      });
    },
  },
  { // 31.2 "Semmelweis dies in 1865, years before germs are widely accepted."
    start: 31.0, title: '1818–1865', trans: 'page',
    draw(ctx, u, S) {
      const { k, P, W } = S, di = S.at('dies'), ye = S.at('years'), ge = S.at('germs'), ac = S.at('accepted.');
      S.cam(lerp(1.15, 1.0, tween(u, 0, ye, ease.inOut)), lerp(380, W / 2, tween(u, ye - 0.3, ge + 0.4)), 640);
      ctx.fillStyle = '#2a2030'; ctx.fillRect(-300, -300, W + 600, 1800);
      k.rect(ctx, -300, 900, W + 600, 900, '#5a3a24', P.ink, 3);
      k.frame(ctx, 300, 480, 260, 320, c => { c.fillStyle = '#d8c8a8'; c.fillRect(-130, -160, 260, 320); k.figure(c, 0, 230, { ...SEMMEL, s: 0.95, face: 1, mood: 'calm', armF: [0.2, 0.2] }); });
      k.label(ctx, 'IGNAZ SEMMELWEIS · 1818–1865', 300, 700, 16, tween(u, di, di + 0.4));
      k.openBook(ctx, 330, 860, 300, 120, { cover: P.vermDark });
      k.label(ctx, 'HIS BOOK ON CHILDBED FEVER · 1861', 330, 960, 14, tween(u, 0.6, 1.2));
      k.candle(ctx, 120, 900, 1.0, S.t);
      // the years pass, and the microscope finally shows what he could not
      const hg = tween(u, ye - 0.3, ge, ease.linear);
      k.hourglass(ctx, 620, 830, 0.6, hg, 0);
      const ms = tween(u, ge - 0.4, ge + 0.3, ease.outBack);
      if (ms > 0) { ctx.save(); ctx.translate(840, 900); ctx.scale(ms, ms); k.microscope(ctx, 0, 0, 1.2); ctx.restore();
        k.circle(ctx, 800, 470, 150 * ms, '#eef6e8', P.goldDark, 5); specks(ctx, S, 800, 470, 100 * ms, ms, 21); specks(ctx, S, 780, 450, 80 * ms, ms, 22); }
      k.label(ctx, 'GERM THEORY WINS OUT IN THE DECADES AFTER', W / 2, 1100, 15, tween(u, ac - 0.2, ac + 0.3));
    },
  },
  { // 37.6 "Every legend has a beginning."
    start: 37.3, title: 'Every Legend Has a Beginning', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S, beg = S.at('beginning.');
      ctx.save(); S.cam(lerp(1.0, 1.4, tween(u, 0, beg)), W / 2, 760);
      marble(ctx, S); basin(ctx, S, W / 2 - 60, 1000, 1.3, 1, S.t);
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
  { t: 2.0, type: 'splash', gain: 0.25 }, { t: 3.9, type: 'thud', gain: 0.35 },
  { t: 5.6, type: 'gong', gain: 0.35 }, { t: 8.9, type: 'pluck', gain: 0.3 }, { t: 11.1, type: 'chime', gain: 0.3, pitch: 0.8 },
  { t: 14.8, type: 'pluck', gain: 0.25, pitch: 0.8 }, { t: 17.5, type: 'pluck', gain: 0.25, pitch: 1.2 },
  { t: 20.6, type: 'drip', gain: 0.3 },
  { t: 22.1, type: 'pop', gain: 0.35 }, { t: 22.8, type: 'splash', gain: 0.35 }, { t: 24.2, type: 'drip', gain: 0.3 },
  { t: 26.3, type: 'slide', gain: 0.3 }, { t: 26.7, type: 'chime', gain: 0.45, pitch: 1.2 },
  { t: 28.6, type: 'thud', gain: 0.3 }, { t: 30.0, type: 'thud', gain: 0.3 },
  { t: 34.3, type: 'riser', gain: 0.3 }, { t: 35.1, type: 'chime', gain: 0.4, pitch: 1.4 },
];

export const music = {
  bpm: 84, root: 'D', maqam: 'hicaz', gain: 0.26,
  sections: [
    { from: 0, to: 5.4, mood: 'intro' },
    { from: 5.4, to: 18.7, mood: 'groove' },
    { from: 18.7, to: 25.5, mood: 'drive' },
    { from: 25.5, to: 27.4, mood: 'triumph' },
    { from: 27.4, to: 37.3, mood: 'sad' },
    { from: 37.3, to: 39.7, mood: 'triumph' },
    { from: 39.7, to: 41.4, mood: 'end' },
  ],
};
