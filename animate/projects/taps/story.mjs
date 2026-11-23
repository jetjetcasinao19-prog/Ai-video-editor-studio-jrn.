// "How Taps Started" — a chronicle of one night at Harrison's Landing, 1862.
// The motif is the call's official name, "Extinguish Lights": as the bugle plays,
// the camp's lanterns go out one by one. The real 1862 melody (public domain) is
// played by the `taps1` / `taps2` sound effects. Respectful: no bodies shown.
import { clamp, lerp, ease, tween, rng, TAU, shake, pop } from '../../lib/core.mjs';
import { interior, bookCover, medallion } from '../../styles/ottoman/scenes.mjs';
import { act } from '../../styles/ottoman/acting.mjs';

export const meta = {
  title: 'How Taps Started',
  slug: 'taps-ottoman',
  style: 'ottoman',
  look: 'night',    // lights-out (after ledger, album, karagoz)
  room: 'tent',     // the general's campaign tent
  device: 'chronicle',
  cameos: [{ at: 'real', dur: 1.4, mood: 'smile' }],
  width: 1080, height: 1920, fps: 30,
  duration: 52.5,
  voice: 'voice.mp3',
  seed: 191,
  captionChars: 30,
  brand: { handle: '@HOWITSTARTED-YT1', logo: '../../../brand/logo.png' },
  outro: { at: 50.7, text: 'Subscribe for more origin stories' },
};

const BLUE = '#2a3a6a', SKINS = ['#f1d1a8', '#e2b48a', '#8a5a3c', '#f1d1a8', '#c68a5e', '#e8c49a'];
const UNION = i => ({ robe: BLUE, robeP: 'stripes', robePc: '#33447a', inner: '#6a7aa8', sash: '#2a2a2a', hat: 'kepi', skin: SKINS[i % 6], mustache: i % 2 === 0 });
const BUTTERFIELD = { robe: BLUE, robeP: 'stripes', robePc: P_GOLD(), inner: '#6a7aa8', sash: '#c9a227', hat: 'kepi', mustache: true, mustacheColor: '#4a3020', skin: '#f1d1a8' };
const NORTON = { ...UNION(1), mustache: false, skin: '#f1d1a8' };
const PLAY = { armF: [1.9, 2.4] };
function P_GOLD() { return '#c9a227'; }
const bugleHold = k => c => k.bugle(c, 0, 0, 0.6, -0.2);

// the night camp by the James River: rows of tents, each with a lantern that can go out
function nightCamp(ctx, S, out = 0, o = {}) {
  const { k, P, W, t } = S;
  k.nightSky(ctx, -240, -240, W + 480, 1600, t);
  k.moon(ctx, 820, 150, 44);
  k.waves(ctx, -240, 470, W + 480, 120, t, '#2f4060', '#5f7a9a', 14, 20);
  if (o.boats !== false) { k.steamboat(ctx, 220, 520, 0.32, t, { smoke: false }); k.steamboat(ctx, 800, 530, 0.28, t + 1, { smoke: false }); }
  ctx.fillStyle = '#2f3a2a'; ctx.fillRect(-240, 590, W + 480, 1000);
  ctx.beginPath(); ctx.ellipse(540, 620, 200, 70, 0, Math.PI, TAU); ctx.fillStyle = '#3a4632'; ctx.fill(); k.stroke(ctx, P.ink, 2);
  const R = rng(5), n = 18;
  for (let i = 0; i < n; i++) {
    const r = Math.floor(i / 6), x = 90 + (i % 6) * 170 + (r % 2) * 60, y = 650 + r * 90, s = 0.55 + r * 0.15;
    k.aTent(ctx, x, y, s, '#bdb5a0');
    const order = (i * 7) % n; // the lights go out in a scattered order
    k.lantern(ctx, x + 40 * s, y - 20 * s, 0.6 + r * 0.15, 1 - clamp(out * n - order), t + i);
  }
}

export const scenes = [
  { // 0.0 "You may have heard, Taps was found in a fallen soldier's pocket. That story is a legend."
    start: 0, title: 'A Story You May Have Heard',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const fo = S.at('found'), po = S.at('pocket.'), le = S.at('legend.');
      // a uniform coat folded on a drum; a sheet of music slides out of its pocket… and turns to smoke
      ctx.fillStyle = '#3a2a2a'; ctx.fillRect(-80, -80, W + 160, 1240);
      const g = ctx.createRadialGradient(W / 2, 560, 30, W / 2, 560, 600); g.addColorStop(0, 'rgba(255,220,160,0.4)'); g.addColorStop(1, 'rgba(255,220,160,0)'); ctx.fillStyle = g; ctx.fillRect(-80, -80, W + 160, 1240);
      S.cam(lerp(1.0, 1.35, tween(u, fo - 0.4, po + 0.6, ease.inOut)), W / 2, 620);
      k.drum(ctx, W / 2, 860, 1.8, 0);
      // a folded uniform coat: body, collar, a sleeve across, brass buttons, a breast pocket
      k.poly(ctx, [[300, 780], [330, 600], [450, 570], [630, 570], [750, 600], [780, 780]], BLUE, P.ink, 2.5);
      k.poly(ctx, [[450, 570], [540, 640], [630, 570], [600, 560], [540, 600], [480, 560]], '#1e2a50', P.ink, 2);
      k.poly(ctx, [[300, 700], [520, 720], [530, 760], [300, 760]], '#25335c', P.ink, 2);
      for (let i = 0; i < 4; i++) k.circle(ctx, 540, 660 + i * 30, 7, P.gold, P.ink, 1);
      k.rect(ctx, 580, 640, 120, 50, '#25335c', P.ink, 2);
      const slide = tween(u, fo - 0.2, po + 0.2, ease.inOut), smoke = tween(u, le - 0.3, le + 0.8);
      ctx.save(); ctx.globalAlpha = 1 - smoke; ctx.translate(640, lerp(640, 470, slide)); ctx.rotate(lerp(0, -0.2, slide));
      k.rect(ctx, -110, -70, 220, 140, '#efe6cf', P.ink, 2); k.staff(ctx, 0, -40, 190, 24, {});
      ctx.restore();
      if (smoke > 0) for (let i = 0; i < 8; i++) { const q = clamp(smoke * 1.3 - i * 0.05); ctx.save(); ctx.globalAlpha = (1 - q) * 0.6; k.cloud(ctx, 600 + Math.sin(i * 2) * 60, 520 - q * 260 - i * 14, 0.4 + q * 0.4, i + 3, '#c9c2b0', '#9a9488'); ctx.restore(); }
      k.stamp(ctx, 'A LEGEND', W / 2, 330, 64, tween(u, le, le + 0.25, ease.linear), -0.12);
    },
  },
  { // 6.2 "Here's the real one."
    start: 6.0, title: 'The Real One', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      S.cam(lerp(1.15, 1.0, tween(u, 0, 1.8)), W / 2, 540);
      ctx.fillStyle = '#4a1e24'; ctx.fillRect(-80, -80, W + 160, 1240);
      // a chronicle opens its pages
      k.openBook(ctx, W / 2, 560, 760, 520, {});
      ctx.fillStyle = P.ink; ctx.font = '700 34px GaramondItalic'; ctx.textAlign = 'center';
      ctx.fillText('Harrison’s Landing', W / 2 - 190, 480); ctx.fillText('July 1862', W / 2 + 190, 480);
      k.staff(ctx, W / 2 + 190, 560, 300, Math.floor(tween(u, 0.3, 1.6) * 9), {});
    },
  },
  { // 8.0 "July 1862, Virginia. The Civil War."
    start: 7.8, title: 'Virginia · July 1862', trans: 'ink',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const yr = S.at('1862,'), va = S.at('Virginia.');
      S.cam(lerp(1.25, 1.0, tween(u, 0, 4.5, ease.inOut)), W / 2, 560);
      k.goldSky(ctx, -80, -80, W + 160, 1240, S.t);
      k.waves(ctx, -80, 440, W + 160, 160, S.t, P.water, P.waterLight, 16, 20);
      k.steamboat(ctx, 260, 500, 0.4, S.t); k.steamboat(ctx, 820, 510, 0.34, S.t + 1);
      k.ground(ctx, -80, 590, W + 160, 600, P.sage, 3, 0.4);
      k.house(ctx, 800, 760, 220, 160, { roof: P.vermDark });
      for (let r = 0; r < 3; r++) for (let i = 0; i < 6; i++) k.aTent(ctx, 70 + i * 130 + (r % 2) * 50, 700 + r * 90, 0.6 + r * 0.15);
      k.usFlag(ctx, 470, 620, 120, S.t); k.rect(ctx, 466, 620, 6, 180, P.brown, P.ink, 1);
      k.seal(ctx, 160, 160, 66, ' JULY · 1862 ·', '1862', tween(u, yr - 0.1, yr + 0.3, ease.linear));
      k.label(ctx, 'THE JAMES RIVER', 640, 410, 20, tween(u, va, va + 0.4));
    },
  },
  { // 13.0 "Union General Daniel Butterfield's brigade is camped at Harrison's Landing. Butterfield wants a new lights-out call."
    start: 12.9, title: 'General Butterfield', trans: 'page',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const da = S.at('Daniel'), wa = S.at('wants'), li = S.at('lights-out');
      S.cam(lerp(1.0, 1.15, tween(u, wa - 0.4, li + 0.8, ease.inOut)), lerp(W / 2, 400, tween(u, wa, li)), 620);
      interior(ctx, S, { carpetColor: P.vermDark });
      k.rect(ctx, 560, 740, 360, 26, P.brown, P.ink, 2); k.rect(ctx, 580, 766, 16, 240, P.brown, P.ink, 1.5); k.rect(ctx, 884, 766, 16, 240, P.brown, P.ink, 1.5);
      // the lantern on his table dims as he asks for a lights-out call
      k.lantern(ctx, 840, 700, 1.4, 1 - 0.7 * tween(u, li - 0.2, li + 0.6), S.t);
      k.figure(ctx, 330, 1010, { ...BUTTERFIELD, s: 1.15, face: 1, mood: 'calm', ...act(u > wa ? 'present' : 'rest', u, tween(u, wa - 0.2, wa + 0.3)) });
      for (const dx of [-12, 12]) k.star(ctx, 330 + dx * 1.15, 1010 - 230 * 1.15, 6, tween(u, da, da + 0.3));
      k.label(ctx, 'GEN. DANIEL BUTTERFIELD', 330, 620, 20, tween(u, da, da + 0.4));
    },
  },
  { // 20.4 "So he reworks an older tune with his brigade bugler, Oliver Norton."
    start: 20.3, title: 'Reworking an Old Call', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const re = S.at('reworks'), ol = S.at('older'), ox = S.at('Oliver');
      S.cam(lerp(1.0, 1.12, tween(u, 0, 4.6)), W / 2, 560);
      interior(ctx, S, { carpet: false });
      // the old call on one sheet; notes crossed out and rewritten into the new one
      k.rect(ctx, 210, 300, 660, 300, '#efe6cf', P.ink, 2.5);
      k.staff(ctx, W / 2, 350, 600, 24, {});
      const fix = tween(u, re, ox + 0.6);
      for (let i = 0; i < 6; i++) { const q = clamp(fix * 6 - i); if (q <= 0) continue; const x = 280 + i * 95; ctx.beginPath(); ctx.moveTo(x - 12, 340); ctx.lineTo(x - 12 + 24 * q, 400); k.stroke(ctx, P.verm, 3); }
      k.staff(ctx, W / 2, 480, 600, Math.floor(fix * 24), { ink: P.lapisDeep });
      k.quill(ctx, 300 + fix * 500, 520, 0.8, -0.5);
      k.figure(ctx, 280, 1010, { ...BUTTERFIELD, s: 1.0, face: 1, mood: 'calm', ...act('point', u, tween(u, re - 0.2, re + 0.3)) });
      k.figure(ctx, 790, 1010, { ...NORTON, s: 1.0, face: -1, mood: 'calm', ...act(u > ox ? 'rest' : 'think', u), hold: bugleHold(k) });
      k.label(ctx, 'BUGLER OLIVER NORTON', 790, 660, 20, tween(u, ox, ox + 0.4));
    },
  },
  { // 25.1 "That night, Norton plays it for the first time."
    start: 25.0, title: 'The First Time', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const pl = S.at('plays');
      S.cam(lerp(1.2, 1.0, tween(u, 0, 3.4, ease.inOut)), W / 2, 600);
      nightCamp(ctx, S, tween(u, pl, pl + 3.2));
      // Norton on the rise, the notes drifting over the tents
      k.figure(ctx, 540, 580, { ...NORTON, s: 0.85, face: 1, mood: 'calm', ...PLAY, hold: bugleHold(k) });
      if (u > pl - 0.2) for (let i = 0; i < 9; i++) { const q = ((u - pl) * 0.3 + i / 9) % 1; ctx.save(); ctx.globalAlpha = Math.sin(q * Math.PI); k.musicNote(ctx, 620 + q * 380, 380 - q * 160 + Math.sin(q * 10 + i) * 14, 1.0, P.goldLight); ctx.restore(); }
    },
  },
  { // 28.5 "Soon, other units copy it."
    start: 28.4, title: 'Other Camps Follow', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const co = S.at('copy');
      S.cam(lerp(1.0, 0.92, tween(u, 0, 2.4, ease.inOut)), W / 2, 560);
      nightCamp(ctx, S, 1, { boats: false });
      // buglers on distant hills answer one after another; rings of sound
      [[180, 520], [500, 470], [860, 540]].forEach(([x, y], i) => {
        const on = tween(u, co - 0.6 + i * 0.35, co - 0.3 + i * 0.35);
        if (on <= 0) return;
        k.figure(ctx, x, y, { ...UNION(i + 2), s: 0.45, face: i % 2 ? -1 : 1, mood: 'calm', ...PLAY, hold: bugleHold(k) });
        for (let j = 0; j < 3; j++) { const q = ((u * 0.9 + j / 3) % 1); ctx.save(); ctx.globalAlpha = (1 - q) * on * 0.7; ctx.beginPath(); ctx.arc(x, y - 100, 20 + q * 120, 0, TAU); k.stroke(ctx, P.goldLight, 3); ctx.restore(); }
      });
    },
  },
  { // 30.9 "Its official name? Extinguish Lights. But soldiers call it Taps."
    start: 30.8, title: 'Its Official Name', trans: 'page',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const of = S.at('official'), ex = S.at('Extinguish'), ca = S.at('call'), ta = S.at('Taps.');
      S.cam(lerp(1.0, 1.15, tween(u, ca - 0.4, ta + 0.6, ease.inOut)), W / 2, 520);
      ctx.fillStyle = '#4a1e24'; ctx.fillRect(-80, -80, W + 160, 1240);
      // the drill manual's page, and a soldier's pencil writing his own name for it
      k.letter(ctx, W / 2, 500, 620, 420, ['BUGLE CALLS', '', 'Extinguish Lights.'], tween(u, of - 0.2, ex + 0.8), 0);
      const wr = tween(u, ca, ta + 0.4);
      if (wr > 0) { ctx.save(); ctx.translate(W / 2 + 120, 600); ctx.rotate(-0.12); ctx.fillStyle = P.verm; ctx.font = '700 64px GaramondItalic'; ctx.textAlign = 'left'; ctx.fillText('“Taps”'.slice(0, Math.ceil(6 * wr)), 0, 0); ctx.restore(); }
      k.figure(ctx, 220, 1010, { ...UNION(3), s: 0.95, face: 1, mood: 'happy', ...act('point', u, wr) });
      k.figure(ctx, 880, 1010, { ...UNION(4), s: 0.95, face: -1, mood: 'happy', armF: [0.4, 0.2] });
    },
  },
  { // 36.8 "Before long, it's played at military funerals."
    start: 36.7, title: 'At the Graveside', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const pl = S.at('played'), fu = S.at('funerals.');
      S.cam(lerp(1.0, 1.15, tween(u, 0, 3.2, ease.inOut)), W / 2, 620);
      k.goldSky(ctx, -80, -80, W + 160, 1240, S.t);
      ctx.save(); ctx.globalAlpha = 0.35; ctx.fillStyle = '#7a5a8a'; ctx.fillRect(-80, -80, W + 160, 1240); ctx.restore();
      k.sun(ctx, 820, 520, 60, S.t, false);
      k.ground(ctx, -80, 600, W + 160, 600, '#6a8a5a', 3, 0.3);
      for (let i = 0; i < 6; i++) k.headstone(ctx, 140 + i * 150, 760 + (i % 2) * 30, 0.9);
      // a folded flag on a drum; the bugler at a distance; heads bowed
      k.drum(ctx, 520, 930, 1.0, 0); ctx.save(); ctx.translate(520, 870); k.poly(ctx, [[-50, 20], [50, 20], [0, -30]], P.lapisDeep, P.ink, 2); for (let i = 0; i < 5; i++) k.star(ctx, -24 + i * 12, 8, 4, 1); ctx.restore();
      k.figure(ctx, 880, 860, { ...UNION(1), s: 0.75, face: -1, mood: 'calm', ...PLAY, hold: bugleHold(k) });
      for (let i = 0; i < 3; i++) k.figure(ctx, 160 + i * 110, 1010, { ...UNION(i + 2), s: 0.9, face: 1, mood: 'sad', look: 0.4, armF: [0.3, 1.4], armB: [0.3, 1.3] });
      if (u > pl) for (let i = 0; i < 6; i++) { const q = ((u - pl) * 0.25 + i / 6) % 1; ctx.save(); ctx.globalAlpha = Math.sin(q * Math.PI) * 0.8; k.musicNote(ctx, 860 - q * 600, 640 - q * 200 + Math.sin(q * 9 + i) * 10, 0.9, P.goldLight); ctx.restore(); }
    },
  },
  { // 39.9 "By 1891, it's a standard part of them."
    start: 39.8, title: 'Regulations · 1891', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const yr = S.at('1891,'), st = S.at('standard');
      S.cam(lerp(1.0, 1.12, tween(u, 0, 3)), W / 2, 540);
      interior(ctx, S, { carpet: false });
      k.seal(ctx, 160, 160, 62, ' THE YEAR · 1891 ·', '1891', tween(u, yr - 0.1, yr + 0.3, ease.linear));
      k.openBook(ctx, W / 2, 600, 720, 480, {});
      ctx.fillStyle = P.ink; ctx.font = '700 30px Deco'; ctx.textAlign = 'center'; ctx.fillText('DRILL REGULATIONS', W / 2 - 180, 460);
      ctx.font = '600 28px GaramondItalic'; ctx.fillText('Military funerals:', W / 2 + 180, 460);
      k.staff(ctx, W / 2 + 180, 520, 300, Math.floor(tween(u, st - 0.3, st + 1.2) * 24), { ink: P.vermDark });
    },
  },
  { // 43.1 "A bedtime bugle call that became America's song of goodbye."
    start: 43.0, title: 'A Song of Goodbye', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const be = S.at('bedtime'), bc = S.at('became'), go = S.at('goodbye.');
      // plant and pay-off: the camp's lanterns, put out by the call, rise again as stars
      const rise = tween(u, bc - 0.3, go + 0.8, ease.inOut);
      S.cam(lerp(1.0, 0.9, rise), W / 2, lerp(620, 500, rise));
      nightCamp(ctx, S, 1, { boats: false });
      const R = rng(12);
      for (let i = 0; i < 18; i++) { const x0 = 90 + (i % 6) * 170 + (Math.floor(i / 6) % 2) * 60, y0 = 640 + Math.floor(i / 6) * 90, x = lerp(x0, 120 + R() * 840, rise), y = lerp(y0, 80 + R() * 300, rise); if (rise > 0) { ctx.save(); ctx.globalAlpha = rise; k.star(ctx, x, y, 10 + R() * 6, 1); ctx.restore(); } }
      k.figure(ctx, 540, 580, { ...NORTON, s: 0.85, face: 1, mood: 'calm', ...PLAY, hold: bugleHold(k) });
      k.usFlag(ctx, 690, 330, 160, S.t); k.rect(ctx, 686, 330, 6, 290, P.brown, P.ink, 1);
    },
  },
  { // 48.4 "Every legend has a beginning."
    start: 48.2, title: 'Every Legend Has a Beginning', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S, beg = S.at('beginning.');
      ctx.save(); S.cam(lerp(1.0, 1.4, tween(u, 0, beg)), 540, 500);
      nightCamp(ctx, S, 1, { boats: false });
      k.figure(ctx, 540, 580, { ...NORTON, s: 0.85, face: 1, mood: 'calm', ...PLAY, hold: bugleHold(k) });
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
  { t: 1.6, type: 'paper', gain: 0.4 }, { t: 5.16, type: 'stamp', gain: 0.8 }, { t: 5.4, type: 'wind', gain: 0.35 },
  { t: 6.3, type: 'paper', gain: 0.5 }, { t: 8.4, type: 'waves', gain: 0.3 }, { t: 8.5, type: 'stamp', gain: 0.4 },
  { t: 13.7, type: 'pluck', gain: 0.35 }, { t: 18.8, type: 'pop', gain: 0.3, pitch: 0.7 },
  { t: 20.8, type: 'paper', gain: 0.35 }, { t: 21.5, type: 'paper', gain: 0.3 }, { t: 23.7, type: 'chime', gain: 0.35 },
  { t: 25.6, type: 'taps1', gain: 0.6 },
  { t: 29.6, type: 'wind', gain: 0.3 },
  { t: 32.4, type: 'paper', gain: 0.35 }, { t: 35.2, type: 'pluck', gain: 0.4 },
  { t: 37.0, type: 'taps2', gain: 0.6 },
  { t: 40.1, type: 'stamp', gain: 0.4 }, { t: 41.6, type: 'paper', gain: 0.35 },
  { t: 45.2, type: 'chime', gain: 0.4, pitch: 1.3 }, { t: 46.4, type: 'chime', gain: 0.35, pitch: 1.6 },
];

export const music = {
  bpm: 80, root: 'D', maqam: 'rast', gain: 0.26,
  sections: [
    { from: 0, to: 6.0, mood: 'intro' },
    { from: 6.0, to: 25.0, mood: 'groove' },
    { from: 25.0, to: 30.8, mood: 'end' },
    { from: 30.8, to: 36.7, mood: 'sad' },
    { from: 36.7, to: 43.0, mood: 'end' },
    { from: 43.0, to: 49.54, mood: 'triumph' },
    { from: 49.54, to: 52.5, mood: 'end' },
  ],
};
