// "The King Who Won Too Much" — the Pyrrhic victory, told by a meddah (a
// coffeehouse storyteller) to his listeners (`meddah` device), with one object
// that keeps coming back: a pair of scales. Every victory drops a laurel in
// one pan; every loss drops a helmet in the other, until the cost pan hits the
// floor. Losses are shown as helmets, never bodies. Pyrrhus's line is given as
// Plutarch reports it.
import { clamp, lerp, ease, tween, rng, TAU } from '../../lib/core.mjs';
import { interior, bookCover } from '../../styles/ottoman/scenes.mjs';
import { act } from '../../styles/ottoman/acting.mjs';

export const meta = {
  title: 'The King Who Won Too Much',
  slug: 'pyrrhic-ottoman',
  style: 'ottoman',
  look: 'album',    // album (after tile, ledger, night)
  ambient: 'dust',
  room: 'tiles',
  device: 'meddah',
  width: 1080, height: 1920, fps: 30,
  duration: 51.5,
  voice: 'voice.mp3',
  seed: 279,
  captionChars: 30,
  brand: { handle: '@HOWITSTARTED-YT1', logo: '../../../brand/logo.png' },
  outro: { at: 49.7, text: 'Subscribe for more origin stories' },
};

const SKINS = ['#d9a882', '#c99a6e', '#b88a5e', '#e2b48a'];
const MEDDAH = { robe: '#2f5f8a', robeP: 'dots', inner: '#efe6cf', sash: '#9a2a1e', hat: 'turban', beard: true, beardColor: '#5a4a3a', skin: '#c99a6e' };
const PYRRHUS = { robe: '#7a2a5a', inner: '#c9a227', sash: '#c9a227', hat: 'greekhelm', hatColor: '#d8a848', crest: '#efe6cf', beard: true, beardColor: '#3a2a1a', skin: '#d9a882' };
const EPIROTE = i => ({ robe: ['#7a2a5a', '#5a3a7a', '#8a5a2a'][i % 3], inner: '#c9a227', hat: 'greekhelm', hatColor: '#c08a3a', crest: ['#efe6cf', '#2a1c12'][i % 2], skin: SKINS[i % 4] });
const ROMAN = i => ({ robe: '#9a2a1e', inner: '#c9a24a', sash: '#5a3a1a', hat: 'greekhelm', hatColor: '#9a9a8a', crest: '#2a1c12', skin: SKINS[(i + 1) % 4] });

// ---------- the storyteller and his listeners ----------
function meddah(ctx, S, x, u, o = {}) {
  const { k, P } = S;
  k.rect(ctx, x - 70, 760, 140, 250, P.brown, P.ink, 2.5); k.rect(ctx, x - 90, 740, 180, 30, P.brownLight, P.ink, 2);
  k.figure(ctx, x, 760, { ...MEDDAH, s: 1.15, face: 1, kneel: true, mood: o.mood || 'happy', armF: [o.arm ?? (1.6 + Math.sin(u * 3) * 0.3), 0.2], hold: c => { c.rotate(-0.4); k.rect(c, -4, -150, 8, 170, P.brownLight, P.ink, 1.5); } });
  k.poly(ctx, [[x - 30, 540], [x - 58, 600], [x - 12, 610]], P.white, P.ink, 1.5); // his handkerchief
}
function listeners(ctx, S, u, react = 0) {
  const { k, P } = S;
  [600, 740, 880].forEach((x, i) => k.figure(ctx, x, 1010, { robe: [P.lapis, P.green, P.ochre][i], robeP: 'dots', hat: ['fez', 'turban', 'fez'][i], hatColor: [P.verm, P.white, P.vermDark][i], skin: SKINS[i + 1], s: 0.85, face: -1, kneel: true, mood: react > 0.5 ? 'wow' : 'calm', armF: [lerp(0.8, 2.0, react) + Math.sin(u * 4 + i) * 0.1 * react, 0.3] }));
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

// ---------- the scales: laurels for wins, helmets for losses ----------
function laurel(ctx, S, x, y, s = 1) {
  const { k, P } = S;
  for (let i = 0; i < 9; i++) for (const sx of [-1, 1]) { const a = Math.PI * (0.55 + i * 0.1); k.ellipse(ctx, x + sx * Math.cos(a) * 34 * s, y - Math.sin(a) * 30 * s + 26 * s, 10 * s, 5 * s, sx * a + 1.2, P.green, P.ink, 0.8); }
}
function helmet(ctx, S, x, y, s = 1) {
  const { k, P } = S;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-20, 10); ctx.quadraticCurveTo(-24, -26, 2, -28); ctx.quadraticCurveTo(26, -26, 22, 6); ctx.lineTo(14, 8); ctx.lineTo(12, -6); ctx.lineTo(-6, -6); ctx.lineTo(-8, 10); ctx.closePath(); k.fillStroke(ctx, '#b08a4a', P.ink, 1.5);
  ctx.beginPath(); ctx.moveTo(-18, -22); ctx.quadraticCurveTo(0, -48, 22, -22); k.stroke(ctx, '#7a2a5a', 5);
  ctx.restore();
}
// wins and losses (counts); returns nothing; the heavier pan sinks
function scales(ctx, S, x, base, s, wins, losses) {
  const { k } = S, tilt = clamp((losses * 0.5 - wins) / 3, -1, 1.6);
  k.balance(ctx, x, base, s, tilt);
  const r = tilt * 0.3, ends = [-1, 1].map(sx => [x + sx * 120 * s * Math.cos(r), base - 200 * s + sx * 120 * s * Math.sin(r) + 92 * s]);
  for (let i = 0; i < wins; i++) laurel(ctx, S, ends[0][0] + (i % 2 ? 14 : -14) * s, ends[0][1] - 8 * s - Math.floor(i / 2) * 14 * s, 0.6 * s);
  for (let i = 0; i < Math.floor(losses); i++) helmet(ctx, S, ends[1][0] + ((i % 4) - 1.5) * 18 * s, ends[1][1] - 6 * s - Math.floor(i / 4) * 16 * s, 0.55 * s);
}
function elephant(ctx, S, x, y, s, f = 1, t = 0) {
  const { k, P } = S, g = Math.sin(t * 5);
  ctx.save(); ctx.translate(x, y); ctx.scale(s * f, s);
  for (const [lx, ph] of [[-60, 0], [-30, 1.6], [34, 0.8], [62, 2.4]]) { ctx.save(); ctx.translate(lx, -70); ctx.rotate(Math.sin(t * 5 + ph) * 0.12); k.rect(ctx, -14, 0, 28, 72, '#8a8a8a', P.ink, 2); ctx.restore(); }
  k.ellipse(ctx, 0, -110, 100, 62, 0, '#8a8a8a', P.ink, 2.5);
  k.rect(ctx, -60, -190, 110, 46, '#7a2a5a', P.ink, 2); for (let i = 0; i < 4; i++) k.rect(ctx, -56 + i * 26, -206, 16, 18, '#c08a3a', P.ink, 1); // a tower on its back
  k.circle(ctx, 96, -140, 46, '#8a8a8a', P.ink, 2.5);
  ctx.beginPath(); ctx.moveTo(126, -128); ctx.quadraticCurveTo(160 + g * 6, -80, 140, -30 + g * 4); ctx.quadraticCurveTo(136, -20, 128, -28); ctx.quadraticCurveTo(140, -80, 112, -112); ctx.closePath(); k.fillStroke(ctx, '#8a8a8a', P.ink, 2);
  ctx.beginPath(); ctx.moveTo(112, -116); ctx.quadraticCurveTo(144, -110, 150, -96); k.stroke(ctx, '#f3ead8', 6);
  k.ellipse(ctx, 70, -138, 30, 40, -0.2, '#6a6a6a', P.ink, 2); k.circle(ctx, 110, -152, 4, P.ink, null);
  ctx.restore();
}
function ship(ctx, S, x, y, s, t, cargo) {
  const { k, P } = S;
  ctx.save(); ctx.translate(x, y + Math.sin(t * 2 + x) * 6); ctx.scale(s, s);
  if (cargo) cargo(ctx);
  k.poly(ctx, [[-200, 0], [200, 0], [160, 70], [-160, 70]], '#5a3a1a', P.ink, 2.5);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -280); k.stroke(ctx, '#5a3a1a', 7); k.poly(ctx, [[6, -270], [150, -120], [6, -110]], '#efe6cf', P.ink, 2);
  ctx.restore();
}
function battle(ctx, S, u, start, win, o = {}) {
  const { k, P, W } = S;
  k.goldSky(ctx, -300, -300, W + 600, 900, S.t);
  k.hills(ctx, W, 380, o.seed || 4, ['#b8a060', '#a89050', '#98904e'], S.t);
  k.ground(ctx, -300, 470, W + 600, 1200, '#c8b07a', o.seed || 4, 0.3);
  const push = tween(u, start, win + 0.6, ease.inOut);
  for (let i = 0; i < 2; i++) elephant(ctx, S, lerp(200, 420, push) + i * 160, 820 + i * 60, 0.75, 1, S.t + i);
  for (let i = 0; i < 6; i++) k.figure(ctx, lerp(40, 260, push) + (i % 3) * 70, 1000 + Math.floor(i / 3) * 40, { ...EPIROTE(i), s: 0.55, face: 1, armF: [1.45, -0.2] });
  for (let i = 0; i < 8; i++) k.figure(ctx, lerp(740, 1180, push) + (i % 4) * 70, 860 + Math.floor(i / 4) * 140, { ...ROMAN(i), s: 0.55, face: push > 0.4 ? 1 : -1, walk: push > 0.4 ? S.t * 7 + i : null, mood: push > 0.4 ? 'wow' : 'calm', armF: [push > 0.4 ? 0.6 : 1.45, 0.2] });
}

export const scenes = [
  { // 0.0 "Ever heard of a Pyrrhic victory? It's named after a king who kept winning and still lost."
    start: 0, title: 'A Pyrrhic Victory',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const vi = S.at('victory?'), ke = S.at('kept'), lo = S.at('lost.');
      S.cam(lerp(1.15, 1.0, tween(u, 0, 2.0, ease.inOut)), lerp(380, W / 2, tween(u, 0, 2.0)), 680);
      interior(ctx, S, { arches: 3, carpetColor: '#9a2a1e' });
      meddah(ctx, S, 230, u, { arm: lerp(1.6, 2.5, tween(u, vi - 0.3, vi)) });
      listeners(ctx, S, u, tween(u, lo - 0.3, lo + 0.3));
      // in the air between them: the scales, laurels going in on one side… and the other side sinking
      const w = Math.min(2, Math.floor(tween(u, ke - 0.2, ke + 0.8) * 3)), l = tween(u, ke + 0.3, lo + 0.4) * 12;
      cloudPanel(ctx, S, 690, 430, 520, 400, tween(u, vi - 0.6, vi), c => scales(c, S, 0, 160, 1.1, w, l));
    },
  },
  { // 7.3 "280 BC."
    start: 6.9, title: '280 BC', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      S.cam(lerp(1.1, 1.0, tween(u, 0, 2.0, ease.inOut)), W / 2, 600);
      k.goldSky(ctx, -300, -300, W + 600, 700, S.t);
      ctx.save(); ctx.beginPath(); ctx.rect(-300, 560, W + 600, 1100); ctx.clip(); k.waves(ctx, -300, 560, W + 600, 1100, S.t, '#3f6f9a', '#6f9cc0', 14, 26); ctx.restore();
      // Greece on one shore, Italy on the other, the Adriatic between
      ctx.beginPath(); ctx.moveTo(-300, 560); ctx.lineTo(180, 560); ctx.quadraticCurveTo(140, 760, 40, 1200); ctx.lineTo(-300, 1200); ctx.closePath(); k.fillStroke(ctx, '#d9c08a', P.ink, 2.5);
      ctx.beginPath(); ctx.moveTo(W + 300, 560); ctx.lineTo(900, 560); ctx.quadraticCurveTo(960, 780, 1040, 1200); ctx.lineTo(W + 300, 1200); ctx.closePath(); k.fillStroke(ctx, '#c8b880', P.ink, 2.5);
      ctx.fillStyle = P.ink; ctx.font = '700 30px Fell'; ctx.textAlign = 'center'; ctx.fillText('EPIRUS', 60, 640); ctx.fillText('ITALY', 1000, 640);
      k.seal(ctx, W / 2, 330, 120, ' THE YEAR · 280 BC ·', '280 BC', tween(u, 0.1, 0.5, ease.linear));
    },
  },
  { // 9.4 "King Pyrrhus of Epirus in Greece sails to Italy to fight Rome, bringing war elephants."
    start: 8.9, title: 'Pyrrhus Sails', trans: 'wipe',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const py = S.at('Pyrrhus'), sa = S.at('sails'), br = S.at('bringing'), el = S.at('elephants.');
      S.cam(lerp(1.3, 0.95, tween(u, br - 0.4, el + 0.6, ease.inOut)), lerp(320, W / 2, tween(u, br - 0.4, el + 0.6)), lerp(700, 620, tween(u, br - 0.4, el + 0.6)));
      k.goldSky(ctx, -300, -300, W + 600, 700, S.t);
      ctx.save(); ctx.beginPath(); ctx.rect(-300, 600, W + 600, 1100); ctx.clip(); k.waves(ctx, -300, 600, W + 600, 1100, S.t, '#3f6f9a', '#6f9cc0', 14, 26); ctx.restore();
      const go = tween(u, sa - 0.4, el + 1.0, ease.linear);
      ship(ctx, S, lerp(200, 600, go), 900, 0.9, S.t, c => { if (u > br - 0.3) { c.save(); c.scale(0.7, 0.7); elephant(c, S, -60, 0, 0.9, 1, S.t); c.restore(); } });
      ship(ctx, S, lerp(-200, 220, go), 1060, 0.6, S.t + 1);
      ctx.save(); ctx.translate(lerp(200, 600, go) - 130, 900); k.figure(ctx, 0, 0, { ...PYRRHUS, s: 0.75, face: 1, mood: 'happy', ...act('point', u, tween(u, sa, sa + 0.3)) }); ctx.restore();
      k.label(ctx, 'PYRRHUS OF EPIRUS', 400, 380, 22, tween(u, py, py + 0.4));
      k.label(ctx, 'ABOUT 20 ELEPHANTS', 700, 480, 18, tween(u, el, el + 0.4));
    },
  },
  { // 16.1 "At Heraclea, he beats the Romans."
    start: 15.7, title: 'Heraclea, 280 BC', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, he = S.at('Heraclea,'), be = S.at('beats');
      S.cam(lerp(1.0, 1.12, tween(u, 0, 2.6)), W / 2, 700);
      battle(ctx, S, u, he - 0.2, be, { seed: 4 });
      k.label(ctx, 'HERACLEA · ROMAN HORSES HAD NEVER SEEN ELEPHANTS', W / 2, 280, 15, tween(u, he, he + 0.4));
      scales(ctx, S, 800, 640, 0.45, tween(u, be, be + 0.3) > 0.5 ? 1 : 0, tween(u, be, be + 1.5) * 4);
    },
  },
  { // 18.8 "A year later, at Asculum, he beats them again."
    start: 18.4, title: 'Asculum, 279 BC', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, as = S.at('Asculum,'), ag = S.at('again.');
      S.cam(lerp(1.12, 1.0, tween(u, 0, 2.6)), W / 2, 700);
      battle(ctx, S, u, as - 0.3, ag, { seed: 11 });
      k.label(ctx, 'ASCULUM · 279 BC', W / 2, 280, 22, tween(u, as, as + 0.4));
      scales(ctx, S, 800, 640, 0.45, tween(u, ag - 0.2, ag + 0.1) > 0.5 ? 2 : 1, 4 + tween(u, ag - 0.2, ag + 1.0) * 4);
    },
  },
  { // 22.0 "But each win costs him thousands of his best soldiers and officers, men he can't replace."
    start: 21.7, title: 'The Cost of Winning', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const co = S.at('costs'), th = S.at('thousands'), of = S.at('officers,'), re = S.at('replace.');
      S.cam(lerp(1.25, 1.0, tween(u, co - 0.2, re + 0.6, ease.inOut)), W / 2, lerp(520, 620, tween(u, co - 0.2, re + 0.6)));
      ctx.fillStyle = '#efe2c0'; ctx.fillRect(-300, -300, W + 600, 1800);
      ctx.save(); ctx.globalAlpha = 0.3; ctx.fillStyle = k.pattern(ctx, 'tiles', '#efe2c0', '#c9a878', 70); ctx.fillRect(-300, -300, W + 600, 1800); ctx.restore();
      // the great scales: two laurels against a growing heap of helmets
      const l = lerp(8, 26, tween(u, co - 0.2, of + 0.6));
      scales(ctx, S, W / 2, 1000, 2.2, 2, l);
      ctx.fillStyle = P.vermDark; ctx.font = '900 64px Deco'; ctx.textAlign = 'center'; ctx.globalAlpha = tween(u, th, th + 0.3); ctx.fillText('THOUSANDS', W / 2, 220); ctx.globalAlpha = 1;
      // the ships home are few: no new men can come from Epirus in time
      const rp = tween(u, re - 0.4, re + 0.3);
      if (rp > 0) { ctx.save(); ctx.globalAlpha = rp; k.label(ctx, 'EPIRUS WAS SMALL · ROME HAD MEN TO SPARE', W / 2, 320, 18, 1); ctx.restore(); }
    },
  },
  { // 28.9 "When someone congratulates him, Pyrrhus reportedly says, one more victory like this and we're ruined."
    start: 28.4, title: 'One More Victory', trans: 'page',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const cg = S.at('congratulates'), rp = S.at('reportedly'), on = S.at('one'), ru = S.at('ruined.');
      S.cam(lerp(1.0, 1.25, tween(u, on - 0.3, ru + 0.4, ease.inOut)), lerp(W / 2, 360, tween(u, on - 0.3, ru + 0.4)), lerp(640, 700, tween(u, on - 0.3, ru + 0.4)));
      // his tent at dusk; an officer holds out a laurel; the king won't take it
      ctx.fillStyle = '#5a3a2a'; ctx.fillRect(-300, -300, W + 600, 1800);
      k.poly(ctx, [[-60, 1100], [W / 2, 120], [W + 60, 1100]], '#c9a878', P.ink, 3);
      for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(W / 2, 120); ctx.lineTo(80 + i * 184, 1100); k.stroke(ctx, 'rgba(90,60,30,0.3)', 3); }
      const lamp = 0.8 + Math.sin(S.t * 9) * 0.08; const g = ctx.createRadialGradient(W / 2, 700, 10, W / 2, 700, 560); g.addColorStop(0, `rgba(255,200,110,${0.5 * lamp})`); g.addColorStop(1, 'rgba(255,200,110,0)'); ctx.fillStyle = g; ctx.fillRect(-300, -300, W + 600, 1800);
      k.figure(ctx, 760, 1000, { ...EPIROTE(1), s: 1.0, face: -1, mood: 'happy', armF: [lerp(0.4, 1.4, tween(u, cg - 0.2, cg + 0.3)), 0.1], hold: c => laurel(c, S, 0, -30, 0.8) });
      k.figure(ctx, 360, 1000, { ...PYRRHUS, hat: 'shorthair', hair: '#3a2a1a', s: 1.1, face: 1, mood: 'sad', ...act(u > on - 0.2 ? 'shrug' : 'worry', u, tween(u, cg + 0.2, cg + 0.6)), hold: c => helmet(c, S, 0, 0, 1.4) });
      k.letter(ctx, W / 2, 300, 720, 200, ['“One more victory like', 'this, and we’re ruined.”'], tween(u, on - 0.1, ru + 0.4), -0.02);
      k.label(ctx, 'AS PLUTARCH REPORTS IT', W / 2, 460, 16, tween(u, rp, rp + 0.4));
    },
  },
  { // 35.7 "Rome just keeps sending more armies."
    start: 35.2, title: 'More Armies', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, se = S.at('sending'), ar = S.at('armies.');
      S.cam(lerp(1.0, 0.92, tween(u, 0, 3.0, ease.inOut)), W / 2, 620);
      k.goldSky(ctx, -300, -300, W + 600, 700, S.t);
      k.ground(ctx, -300, 460, W + 600, 1200, '#c8b07a', 19, 0.2);
      // column after column out of the horizon, each one bigger
      const n = Math.floor(lerp(6, 60, tween(u, 0.1, ar + 0.6)));
      for (let i = 0; i < n; i++) { const row = Math.floor(i / 10), q = row / 6, x = 120 + (i % 10) * 96 * (0.6 + q * 0.6) + (W / 2 - 120) * (1 - (0.6 + q * 0.6)), y = 480 + row * 110; k.figure(ctx, x, y, { ...ROMAN(i), s: 0.22 + q * 0.4, face: -1, walk: S.t * 6 + i, armF: [0.4, 0.2] }); }
      k.figure(ctx, 120, 1080, { ...PYRRHUS, s: 0.8, face: 1, mood: 'sad', ...act('worry', u, tween(u, se, se + 0.4)) });
    },
  },
  { // 38.9 "A few years later, Pyrrhus gives up and leaves Italy."
    start: 38.4, title: 'He Leaves Italy', trans: 'ink',
    draw(ctx, u, S) {
      const { k, P, W } = S, gi = S.at('gives'), le = S.at('leaves');
      S.cam(lerp(1.2, 1.0, tween(u, 0, 3.6, ease.inOut)), lerp(380, W / 2, tween(u, 0, 3.6)), 640);
      // sunset over the water: the ships go home, fewer than came
      const sky = ctx.createLinearGradient(0, -300, 0, 700); sky.addColorStop(0, '#5a3a6a'); sky.addColorStop(1, '#f0a050'); ctx.fillStyle = sky; ctx.fillRect(-300, -300, W + 600, 1000);
      k.sun(ctx, 760, 600, 90, S.t, false);
      ctx.save(); ctx.beginPath(); ctx.rect(-300, 620, W + 600, 1100); ctx.clip(); k.waves(ctx, -300, 620, W + 600, 1100, S.t, '#3a4a7a', '#6a6a9a', 14, 26); ctx.restore();
      const go = tween(u, gi - 0.3, le + 1.6, ease.inOut);
      ship(ctx, S, lerp(300, 820, go), 860, 0.7, S.t, c => k.figure(c, -80, 0, { ...PYRRHUS, s: 1.1, face: 1, mood: 'sad' }));
      ship(ctx, S, lerp(60, 600, go), 1020, 0.5, S.t + 2);
      k.seal(ctx, 180, 200, 64, ' THE YEAR · 275 BC ·', '275 BC', tween(u, le - 0.2, le + 0.2, ease.linear));
    },
  },
  { // 42.9 "His name became a word for winning that costs too much."
    start: 42.4, title: 'A Word in Every Language', trans: 'page',
    draw(ctx, u, S) {
      const { k, P, W } = S, na = S.at('name'), wo = S.at('word'), co = S.at('costs'), mu = S.at('much.');
      S.cam(lerp(1.0, 1.1, tween(u, 0, 4.0)), W / 2, 660);
      interior(ctx, S, { arches: 2, carpetColor: '#9a2a1e' });
      meddah(ctx, S, 230, u, { arm: 2.2, mood: 'calm' });
      listeners(ctx, S, u, tween(u, mu - 0.3, mu + 0.3));
      // the dictionary entry, and the scales one last time
      cloudPanel(ctx, S, 690, 400, 560, 380, tween(u, na - 0.4, na), c => {
        c.fillStyle = P.ink; c.textAlign = 'left'; c.font = '700 40px Fell'; c.fillText('Pyr·rhic vic·to·ry', -250, -120);
        c.font = 'italic 600 28px GaramondItalic'; const d = 'a win that costs the winner so much it is close to defeat'; const q = tween(u, wo - 0.2, mu + 0.3, ease.linear), shown = d.slice(0, Math.ceil(d.length * q)); const ws = shown.split(' '); let line = '', y = -60; for (const w2 of ws) { if ((line + w2).length > 30) { c.fillText(line, -250, y); line = ''; y += 40; } line += w2 + ' '; } c.fillText(line, -250, y);
        scales(c, S, 120, 170, 0.5, 2, 20);
      });
    },
  },
  { // 47.8 "Every legend has a beginning."
    start: 47.5, title: 'Every Legend Has a Beginning', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S, beg = S.at('beginning.');
      ctx.save(); S.cam(lerp(1.0, 1.4, tween(u, 0, beg)), W / 2, 700);
      ctx.fillStyle = '#efe2c0'; ctx.fillRect(-300, -300, W + 600, 1800); scales(ctx, S, W / 2, 1000, 2.2, 2, 26);
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
  { t: 1.4, type: 'chime', gain: 0.35, pitch: 1.2 }, { t: 4.3, type: 'pop', gain: 0.3 }, { t: 4.7, type: 'pop', gain: 0.3, pitch: 1.2 }, { t: 5.8, type: 'thud', gain: 0.5, pitch: 0.6 },
  { t: 7.4, type: 'stamp', gain: 0.5 }, { t: 7.9, type: 'waves', gain: 0.3 },
  { t: 11.5, type: 'waves', gain: 0.45 }, { t: 14.6, type: 'thud', gain: 0.4, pitch: 0.6 }, { t: 14.9, type: 'thud', gain: 0.4, pitch: 0.6 },
  { t: 16.2, type: 'clank', gain: 0.45 }, { t: 17.0, type: 'chime', gain: 0.45, pitch: 1.3 }, { t: 17.5, type: 'clank', gain: 0.3, pitch: 0.8 },
  { t: 19.6, type: 'clank', gain: 0.45, pitch: 1.1 }, { t: 20.8, type: 'chime', gain: 0.45, pitch: 1.4 }, { t: 21.2, type: 'clank', gain: 0.3, pitch: 0.7 },
  ...Array.from({ length: 10 }, (_, i) => ({ t: +(22.7 + i * 0.3).toFixed(2), type: 'clank', gain: 0.18, pitch: 0.7 + (i % 3) * 0.1 })), { t: 26.0, type: 'thud', gain: 0.55, pitch: 0.5 }, { t: 27.3, type: 'gong', gain: 0.4, pitch: 0.6 },
  { t: 29.1, type: 'pluck', gain: 0.3 }, { t: 32.1, type: 'paper', gain: 0.3 }, { t: 34.1, type: 'thud', gain: 0.45, pitch: 0.6 },
  ...Array.from({ length: 8 }, (_, i) => ({ t: +(35.5 + i * 0.3).toFixed(2), type: 'thud', gain: 0.25, pitch: 0.9 })),
  { t: 39.0, type: 'waves', gain: 0.4 }, { t: 41.5, type: 'stamp', gain: 0.4 },
  { t: 42.7, type: 'paper', gain: 0.3 }, { t: 43.8, type: 'pluck', gain: 0.3 }, { t: 46.3, type: 'chime', gain: 0.5, pitch: 1.3 }, { t: 46.6, type: 'gong', gain: 0.5 },
];

export const music = {
  bpm: 100, root: 'F', maqam: 'hicaz', gain: 0.3,
  sections: [
    { from: 0, to: 6.9, mood: 'intro' },
    { from: 6.9, to: 15.7, mood: 'groove' },
    { from: 15.7, to: 21.7, mood: 'drive' },
    { from: 21.7, to: 35.2, mood: 'sad' },
    { from: 35.2, to: 42.4, mood: 'drive' },
    { from: 42.4, to: 49.7, mood: 'triumph' },
    { from: 49.7, to: 51.5, mood: 'end' },
  ],
};
