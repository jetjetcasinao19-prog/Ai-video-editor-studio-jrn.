// "The Poster Almost Nobody Saw" — the "We Can Do It!" poster, told as a voyage:
// the poster travels a gold road across a map of its own life (factory wall 1943,
// a forgotten drawer, rediscovered in the 1980s, everywhere today). The 1943 poster
// is re-painted in this style; the Rockwell painting is NOT reproduced (it is shown
// as a generic magazine cover with his name).
import { clamp, lerp, ease, tween, rng, TAU, shake, pop } from '../../lib/core.mjs';
import { interior, bookCover, medallion, panorama } from '../../styles/ottoman/scenes.mjs';
import { act } from '../../styles/ottoman/acting.mjs';

export const meta = {
  title: 'The Poster Almost Nobody Saw',
  slug: 'we-can-do-it-ottoman',
  style: 'ottoman',
  look: 'album',    // a collected picture on a gold-sprinkled album page (after karagoz, tile, ledger)
  room: 'tiles',
  device: 'voyage',
  cameos: [{ at: 'else:', dur: 1.5, mood: 'wow' }],
  width: 1080, height: 1920, fps: 30,
  duration: 56.2,
  voice: 'voice.mp3',
  seed: 171,
  captionChars: 30,
  brand: { handle: '@HOWITSTARTED-YT1', logo: '../../../brand/logo.png' },
  outro: { at: 54.4, text: 'Subscribe for more origin stories' },
};

const SKINS = ['#f1d1a8', '#8a5a3c', '#c68a5e', '#e2b48a', '#a86c45', '#e8b896'];
const WORKER = i => ({ robe: ['#2f5fa8', '#7a5a3a', '#3d6b4a', '#5a5a7a'][i % 4], robeP: 'stripes', robePc: '#4a6a9a', inner: '#cfd8e8', sash: '#2a2a2a', hat: i % 2 ? 'bandana' : 'cap', hatColor: i % 2 ? '#c4371f' : '#2a3a5a', hair: '#3a2214', skin: SKINS[i % 6] });

// ---------- the voyage: a gold road across the poster's life ----------
const STOPS = [[220, 190, '1943'], [720, 330, '1945'], [260, 560, '…'], [720, 760, '1982'], [470, 960, 'TODAY']];
function roadPoint(pos) { const i = Math.min(STOPS.length - 2, Math.floor(pos)), q = clamp(pos - i), a = STOPS[i], b = STOPS[i + 1]; return [lerp(a[0], b[0], q), lerp(a[1], b[1], q) - Math.sin(q * Math.PI) * 50]; }
function voyageMap(ctx, S, pos, o = {}) {
  const { k, P, W } = S;
  ctx.fillStyle = '#efe2c0'; ctx.fillRect(-80, -80, W + 160, 1240);
  ctx.save(); ctx.globalAlpha = 0.35; ctx.fillStyle = k.pattern(ctx, 'flowers', '#efe2c0', '#d8c495', 34); ctx.fillRect(-80, -80, W + 160, 1240); ctx.restore();
  // the road, drawn as far as the poster has travelled (plus the next stretch, faint)
  for (let i = 0; i < STOPS.length - 1; i++) {
    const done = clamp((o.reveal ?? pos) - i), [ax, ay] = STOPS[i], [bx, by] = STOPS[i + 1];
    ctx.save(); ctx.setLineDash([18, 12]); ctx.globalAlpha = done > 0 ? 1 : 0.25;
    ctx.beginPath(); ctx.moveTo(ax, ay); for (let j = 1; j <= 30; j++) { const q = j / 30 * (done > 0 ? done : 1); const [x, y] = roadPoint(i + q); ctx.lineTo(x, y); } k.stroke(ctx, P.goldDark, 10); k.stroke(ctx, P.goldLight, 5);
    ctx.restore();
  }
  // milestones: what happened at each stop
  STOPS.forEach(([x, y, t], i) => {
    const on = pos >= i - 0.05;
    k.circle(ctx, x, y, 46, on ? P.paperLight : '#e4d7b4', P.goldDark, 4);
    ctx.fillStyle = on ? P.vermDark : '#a8987a'; ctx.font = '900 26px Deco'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(t, x, y + 2);
  });
  if (o.icons !== false) {
    k.factory(ctx, STOPS[0][0] + 150, STOPS[0][1] + 50, 170, 90, S.t, true);
    k.archiveDrawer(ctx, STOPS[2][0] + 200, STOPS[2][1] + 30, 120, o.drawer ?? 0);
    k.magnifier(ctx, STOPS[3][0] - 170, STOPS[3][1] - 20, 50, 0.7);
    for (let i = 0; i < 7; i++) k.wcdiPoster(ctx, STOPS[4][0] - 250 + i * 80 + (i % 2) * 10, STOPS[4][1] + 10 - (i % 2) * 30, 52, { rot: (i - 3) * 0.06 });
  }
  if (o.poster !== false) { const [x, y] = roadPoint(pos); k.wcdiPoster(ctx, x, y - 120, 130, { age: o.age || 0, rot: Math.sin(S.t * 2) * 0.05 }); }
}
function brickWall(ctx, S, light = 1) {
  const { W, P, k } = S;
  ctx.fillStyle = light > 0.5 ? '#b7765a' : '#6e4636'; ctx.fillRect(-80, -80, W + 160, 1240);
  ctx.strokeStyle = 'rgba(40,20,10,0.35)'; ctx.lineWidth = 3;
  for (let r = 0; r < 34; r++) { const y = -80 + r * 40; ctx.beginPath(); ctx.moveTo(-80, y); ctx.lineTo(W + 80, y); ctx.stroke(); for (let c = 0; c < 14; c++) { const x = -80 + c * 90 + (r % 2) * 45; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 40); ctx.stroke(); } }
  ctx.fillStyle = '#5a5a5a'; ctx.fillRect(-80, 900, W + 160, 300);
}

export const scenes = [
  { // 0.0 "The We Can Do It poster wasn't famous during World War II. Almost nobody saw it."
    start: 0, title: 'Almost Nobody Saw It',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const wa = S.at("wasn't"), al = S.at('Almost'), sa = S.at('saw');
      // today: copies everywhere… then they peel away, leaving one poster on a bare wall in 1943
      const gone = tween(u, al - 0.2, sa + 0.4, ease.inOut);
      brickWall(ctx, S, 1 - gone);
      S.cam(lerp(1.0, 1.35, tween(u, sa - 0.2, sa + 1.2, ease.inOut)), W / 2, 470);
      const R = rng(3);
      for (let i = 0; i < 20; i++) { const x = 80 + (i % 5) * 195 + R() * 20, y = 120 + Math.floor(i / 5) * 210 + R() * 20, rot = (R() - 0.5) * 0.3, q = clamp(gone * 1.6 - R() * 0.6); if (i === 7) continue; ctx.save(); ctx.globalAlpha = 1 - q; k.wcdiPoster(ctx, x, y + q * 300, 150, { rot: rot + q * 1.2 }); ctx.restore(); }
      k.wcdiPoster(ctx, 80 + 2 * 195, 120 + 210 + 10, 150, { age: gone * 0.3 });
      k.figure(ctx, lerp(-60, 1000, tween(u, al, sa + 1.4)), 1000, { ...WORKER(1), s: 0.9, face: 1, mood: 'calm', ...act('walk', u) });
      medallion(ctx, k, P, '?', 820, 160, pop(u, wa, 0.35) * (1 - gone), P.verm);
    },
  },
  { // 7.2 "1943."
    start: 7.0, title: 'The Year 1943', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      S.cam(lerp(1.3, 1.1, tween(u, 0, 1.4)), 300, 280);
      voyageMap(ctx, S, 0, { reveal: tween(u, 0.2, 1.3) * 0.4 });
    },
  },
  { // 8.6 "Artist J. Howard Miller makes it for Westinghouse,"
    start: 8.4, title: 'J. Howard Miller', trans: 'ink',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const ar = S.at('Artist'), mk = S.at('makes'), we = S.at('Westinghouse,');
      S.cam(lerp(1.0, 1.15, tween(u, mk - 0.3, we + 0.6, ease.inOut)), 600, 560);
      interior(ctx, S, { carpetColor: P.lapis });
      ctx.save(); ctx.globalAlpha = tween(u, we - 0.3, we + 0.2); k.streetSign(ctx, 470, 150, 380, 'WESTINGHOUSE', P.lapis, 0); ctx.restore();
      k.easel(ctx, 640, 1000, 300, 380, c => { c.save(); c.translate(0, -10); k.wcdiPoster(c, 0, 0, 260, { k: tween(u, mk - 0.3, we + 0.8) }); c.restore(); });
      k.figure(ctx, 280, 1010, { robe: '#6a5a44', robeP: 'dots', robePc: '#8a7a5e', inner: P.white, sash: P.verm, hat: 'shorthair', hair: '#3a2a1a', skin: '#f1d1a8', s: 1.1, face: 1, mood: 'calm', armF: [lerp(1.2, 1.7, Math.sin(u * 3) * 0.5 + 0.5), 0.3], hold: c => { c.rotate(-0.6); k.rect(c, -3, -60, 6, 66, P.brownLight, P.ink, 1); } });
      k.label(ctx, 'J. HOWARD MILLER', 280, 600, 22, tween(u, ar, ar + 0.4));
    },
  },
  { // 12.1 "a company with factories supplying the war."
    start: 11.9, title: 'The War Factories', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const fa = S.at('factories'), su = S.at('supplying');
      S.cam(1.05, lerp(380, 600, tween(u, 0, 2.8, ease.inOut)), 600);
      ctx.fillStyle = '#5a5a62'; ctx.fillRect(-80, -80, W + 160, 1240);
      for (let i = 0; i < 6; i++) { k.rect(ctx, -40 + i * 190, 120, 150, 240, '#8a9aa8', P.ink, 2); for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) k.rect(ctx, -30 + i * 190 + c * 48, 130 + r * 76, 40, 66, '#cfe0ea', null); }
      ctx.fillStyle = '#4a4a50'; ctx.fillRect(-80, 820, W + 160, 400);
      // a belt of metal parts and the workers at their machines, sparks flying
      k.rect(ctx, -80, 740, W + 160, 40, '#2a2a2a', P.ink, 2);
      for (let i = 0; i < 12; i++) { const x = ((u * 160 + i * 110) % (W + 160)) - 80; k.circle(ctx, x, 724, 18, P.steel, P.ink, 1.5); k.circle(ctx, x, 724, 6, '#3a3a3a', null); }
      for (let i = 0; i < 4; i++) {
        const x = 130 + i * 230; k.rect(ctx, x - 50, 820, 100, 120, '#6a7a86', P.ink, 2);
        k.figure(ctx, x, 1010, { ...WORKER(i), s: 0.85, face: i % 2 ? -1 : 1, mood: 'calm', armF: [1.3 + Math.sin(u * 6 + i) * 0.15, 0.6] });
        if (u > fa - 0.3) for (let j = 0; j < 6; j++) { const q = ((u * 3 + j / 6 + i * 0.3) % 1), a = -1.2 - j * 0.3; ctx.beginPath(); ctx.moveTo(x + 40, 820); ctx.lineTo(x + 40 + Math.cos(a) * 60 * q, 820 + Math.sin(a) * 60 * q); k.stroke(ctx, '#ffd86a', 3); }
      }
      k.label(ctx, 'U.S. WAR PRODUCTION', W / 2, 430, 22, tween(u, su, su + 0.4));
    },
  },
  { // 14.8 "The goal? Keep workers motivated."
    start: 14.7, title: 'Keep Them Going', trans: 'page',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const go = S.at('goal?'), mo = S.at('motivated.');
      brickWall(ctx, S, 1);
      S.cam(lerp(1.1, 1.0, tween(u, 0, 1.2)), W / 2, 600);
      const pin = pop(u, go - 0.2, 0.4);
      if (pin > 0) { ctx.save(); ctx.translate(W / 2, 400); ctx.scale(pin, pin); k.wcdiPoster(ctx, 0, 0, 280, {}); ctx.restore(); k.circle(ctx, W / 2, 400 - 182 * pin, 8, P.verm, P.ink, 1.5); }
      // a worker stops in front of it… and copies the pose
      const stop = tween(u, go + 0.2, mo - 0.4);
      k.figure(ctx, lerp(-40, 330, stop), 1010, { ...WORKER(1), s: 1.0, face: 1, mood: u > mo ? 'happy' : 'calm', ...(u > mo - 0.2 ? act('flex', u) : act('walk', u)) });
      k.figure(ctx, lerp(1100, 760, stop), 1010, { ...WORKER(2), s: 1.0, face: -1, mood: u > mo ? 'happy' : 'calm', ...(u > mo ? act('cheer', u, tween(u, mo, mo + 0.3)) : act('walk', u)) });
    },
  },
  { // 17.9 "It hangs in a few of their factories. For just two weeks."
    start: 17.7, title: 'Two Weeks', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const tw = S.at('two'), wk = S.at('weeks.');
      brickWall(ctx, S, 1);
      S.cam(lerp(1.0, 1.12, tween(u, tw - 0.6, wk + 0.8, ease.inOut)), 640, 420);
      k.wcdiPoster(ctx, 330, 400, 240, {});
      // fourteen days, crossed out one by one
      k.rect(ctx, 560, 230, 380, 340, P.paperLight, P.ink, 2.5); k.rect(ctx, 560, 230, 380, 60, P.verm, P.ink, 2);
      for (let d = 0; d < 14; d++) { const x = 600 + (d % 7) * 50, y = 330 + Math.floor(d / 7) * 90; ctx.fillStyle = P.ink; ctx.font = '700 26px Garamond'; ctx.textAlign = 'center'; ctx.fillText(String(d + 1), x, y); const c = tween(u, lerp(tw - 0.6, wk + 0.4, d / 14), lerp(tw - 0.6, wk + 0.4, d / 14) + 0.1); if (c > 0) { ctx.beginPath(); ctx.moveTo(x - 16, y - 24); ctx.lineTo(x - 16 + 32 * c, y - 24 + 32 * c); ctx.moveTo(x + 16, y - 24); ctx.lineTo(x + 16 - 32 * c, y - 24 + 32 * c); k.stroke(ctx, P.verm, 4); } }
      for (let i = 0; i < 3; i++) k.figure(ctx, 160 + i * 300, 1010, { ...WORKER(i + 1), s: 0.85, face: i % 2 ? -1 : 1, mood: 'calm', ...act('walk', u + i) });
    },
  },
  { // 22.3 "Then it disappears."
    start: 22.2, title: 'Into a Drawer', trans: 'ink',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const di = S.at('disappears.');
      const go = tween(u, di - 0.6, di + 1.2, ease.inOut);
      S.cam(1.05, lerp(450, 420, go), lerp(320, 560, go));
      voyageMap(ctx, S, lerp(0, 2, go), { drawer: 1 - tween(u, di + 1.0, di + 1.6), age: go * 0.4 });
    },
  },
  { // 24.7 "At the time, America's Rosie the Riveter was someone else: a hit song, and a famous Norman Rockwell painting."
    start: 24.6, title: 'The Other Rosie', trans: 'page',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const ro = S.at('Rosie'), hi = S.at('hit'), no = S.at('Norman');
      S.cam(1.08, lerp(260, 700, tween(u, hi + 0.4, no, ease.inOut)), 600);
      interior(ctx, S, { carpetColor: P.vermDark });
      const g = pop(u, hi - 0.3, 0.4);
      if (g > 0) { ctx.save(); ctx.translate(260, 900); ctx.scale(g, g); k.gramophone(ctx, 0, 0, 1.3, S.t, 1); ctx.restore(); k.label(ctx, '“ROSIE THE RIVETER” · A SONG', 260, 520, 20, g); }
      const m = pop(u, no - 0.4, 0.4);
      if (m > 0) { ctx.save(); ctx.translate(720, 640); ctx.scale(m, m); k.magazine(ctx, 0, 0, 300, 0.05, 'COVER · 1943', P.verm); ctx.restore(); k.label(ctx, 'NORMAN ROCKWELL', 720, 400, 22, m); }
      medallion(ctx, k, P, '?', W / 2, 180, pop(u, ro, 0.35) * (1 - g), P.lapis);
    },
  },
  { // 32.7 "Then, in the 1980s, the old poster is rediscovered."
    start: 32.5, title: 'Found Again · 1980s', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const yr = S.at('1980s,'), re = S.at('rediscovered.');
      const go = tween(u, re - 0.6, re + 1.0, ease.inOut);
      S.cam(lerp(1.15, 1.05, go), lerp(420, 560, go), lerp(560, 760, go));
      voyageMap(ctx, S, lerp(2, 3, go), { drawer: tween(u, yr - 0.2, re - 0.4), age: lerp(0.4, 0.15, go) });
      if (u > re - 0.2) for (let i = 0; i < 10; i++) { const q = clamp((u - re + 0.2) / 1.3), a = i / 10 * TAU; ctx.save(); ctx.globalAlpha = 1 - q; k.circle(ctx, 460 + Math.cos(a) * 160 * q, 560 + Math.sin(a) * 100 * q, 6, '#c9b48a', null); ctx.restore(); }
    },
  },
  { // 36.9 "Copies spread everywhere."
    start: 36.8, title: 'Copies Everywhere', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const sp = S.at('spread');
      S.cam(lerp(1.5, 1.0, tween(u, 0, 1.9, ease.inOut)), W / 2, 530);
      panorama(ctx, S, { grid: { cols: 5, rows: 6 }, squares: [[1, 1], [3, 4]], rivers: ['left'], seed: 41 });
      const R = rng(8);
      for (let i = 0; i < 26; i++) { const x = 160 + R() * 760, y = 60 + R() * 960, d = Math.hypot(x - W / 2, y - 530) / 600, p = pop(u, sp - 0.6 + d * 1.2, 0.25); if (p > 0) k.wcdiPoster(ctx, x, y, 60 * p, { rot: (R() - 0.5) * 0.3 }); }
    },
  },
  { // 39.0 "People start calling her Rosie the Riveter."
    start: 38.8, title: 'They Call Her Rosie', trans: 'ink',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const ca = S.at('calling'), ro = S.at('Rosie');
      S.cam(lerp(1.0, 1.1, tween(u, 0, 3)), W / 2, 560);
      brickWall(ctx, S, 1);
      k.wcdiPoster(ctx, W / 2, 380, 340, {});
      for (let i = 0; i < 5; i++) k.figure(ctx, 110 + i * 180, 1010, { robe: [P.lav, P.turq, P.ochre, P.verm, P.green][i], robeP: 'dots', hat: ['longhair', 'shorthair', 'longhair', 'hotoz', 'shorthair'][i], hair: ['#2a1c12', '#6a4a2a', '#1a1a1a', '#3a2a20', '#8a5a2a'][i], hatColor: P.lapis, veil: P.white, skin: SKINS[i], s: 0.85, face: i < 2 ? 1 : -1, mood: 'happy', ...(i === 1 ? act('point', u, tween(u, ca - 0.3, ca)) : act('rest', u)) });
      const b = pop(u, ro - 0.2, 0.35);
      if (b > 0) { ctx.save(); ctx.translate(290, 700); ctx.scale(b, b); k.speechBubble(ctx, 0, 0, "That's Rosie!", 34, 1); ctx.restore(); }
    },
  },
  { // 42.0 "She becomes a symbol of women's strength."
    start: 41.8, title: 'A Symbol of Strength', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const sy = S.at('symbol'), st = S.at('strength.');
      S.cam(lerp(1.0, 1.12, tween(u, sy - 0.4, st + 0.6, ease.inOut)), W / 2, 700);
      k.goldSky(ctx, -80, -80, W + 160, 1240, S.t);
      const rays = tween(u, sy - 0.3, st);
      ctx.save(); ctx.globalAlpha = 0.5 * rays; for (let i = 0; i < 18; i++) { const a = i / 18 * TAU + S.t * 0.1; ctx.beginPath(); ctx.moveTo(W / 2, 560); ctx.lineTo(W / 2 + Math.cos(a) * 900, 560 + Math.sin(a) * 900); k.stroke(ctx, P.goldLight, 18); } ctx.restore();
      // women of three generations, one flex after another
      const LOOKS = [{ ...WORKER(1) }, { robe: P.verm, robeP: 'stripes', robePc: P.ochre, hat: 'longhair', hair: '#3a2a20' }, { robe: P.turq, robeP: 'dots', robePc: P.white, hat: 'shorthair', hair: '#1a1a1a' }, { robe: P.lav, robeP: 'dots', robePc: P.white, hat: 'hotoz', hatColor: P.lapis, veil: P.white }, { robe: P.green, robeP: 'stripes', robePc: P.goldLight, hat: 'longhair', hair: '#6a4a2a' }];
      LOOKS.forEach((L, i) => k.figure(ctx, 120 + i * 175, 1010 - (i % 2) * 20, { ...L, skin: SKINS[(i + 2) % 6], s: 1.0, face: 1, mood: 'happy', ...act('flex', u, tween(u, sy - 0.6 + i * 0.22, sy - 0.3 + i * 0.22)) }));
    },
  },
  { // 45.1 "A poster almost nobody saw became one of the most famous images in American history."
    start: 44.9, title: 'In the History Books', trans: 'page',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const no = S.at('nobody'), be = S.at('became'), fa = S.at('famous');
      // plant and pay-off: the lone poster on the dim wall — then the museum lights come up
      const lit = tween(u, be - 0.3, be + 0.8, ease.inOut);
      ctx.fillStyle = lit > 0.5 ? '#7a2e3a' : '#3a2a2a'; ctx.fillRect(-80, -80, W + 160, 1240);
      ctx.fillStyle = k.pattern(ctx, 'cintamani', lit > 0.5 ? '#7a2e3a' : '#3a2a2a', lit > 0.5 ? '#a8505a' : '#4a3a3a', 40); ctx.fillRect(-80, -80, W + 160, 1240);
      ctx.fillStyle = '#5a3a2a'; ctx.fillRect(-80, 880, W + 160, 320);
      S.cam(lerp(1.45, 1.0, tween(u, be, fa + 1.0, ease.inOut)), W / 2, lerp(420, 560, tween(u, be, fa + 1)));
      if (lit > 0) { const g = ctx.createRadialGradient(W / 2, 200, 20, W / 2, 420, 600); g.addColorStop(0, `rgba(255,236,180,${0.45 * lit})`); g.addColorStop(1, 'rgba(255,236,180,0)'); ctx.fillStyle = g; ctx.fillRect(-80, -80, W + 160, 1240); }
      k.frame(ctx, W / 2, 420, lerp(200, 360, lit), lerp(260, 470, lit), c => k.wcdiPoster(c, 0, 0, lerp(190, 340, lit), {}));
      // velvet rope and visitors arrive
      if (lit > 0.4) { for (const x of [300, 780]) { k.rect(ctx, x - 6, 760, 12, 140, P.goldDark, P.ink, 1.5); k.circle(ctx, x, 756, 14, P.gold, P.ink, 1.5); } ctx.beginPath(); ctx.moveTo(300, 770); ctx.quadraticCurveTo(540, 830, 780, 770); k.stroke(ctx, P.vermDark, 10); }
      for (let i = 0; i < 6; i++) { const a = tween(u, fa - 0.4 + i * 0.15, fa + i * 0.15); if (a > 0) k.figure(ctx, lerp(i < 3 ? -80 : 1160, 120 + i * 170, a), 1010, { robe: [P.lapis, P.verm, P.green, P.ochre, P.lav, P.turq][i], robeP: 'dots', hat: ['shorthair', 'longhair', 'cap', 'longhair', 'shorthair', 'hotoz'][i], hair: '#3a2a20', hatColor: P.lapis, veil: P.white, skin: SKINS[i], s: 0.85, face: i < 3 ? 1 : -1, mood: 'happy', ...act(a < 1 ? 'walk' : 'rest', u + i) }); }
    },
  },
  { // 52.0 "Every legend has a beginning."
    start: 51.8, title: 'Every Legend Has a Beginning', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S, beg = S.at('beginning.');
      ctx.save(); S.cam(lerp(1.0, 1.5, tween(u, 0, beg)), W / 2, 400);
      voyageMap(ctx, S, 4, { icons: true });
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
  ...scenes.slice(1).map(s => ({ t: s.start - 0.05, type: s.trans === 'cut' ? 'pop' : 'paper', gain: 0.3 })),
  { t: 4.4, type: 'paper', gain: 0.5 }, { t: 4.7, type: 'paper', gain: 0.45 }, { t: 5.0, type: 'whoosh', gain: 0.4 },
  { t: 7.2, type: 'stamp', gain: 0.45 }, { t: 7.6, type: 'slide', gain: 0.3 },
  { t: 10.1, type: 'paper', gain: 0.3 }, { t: 10.9, type: 'chime', gain: 0.4 },
  { t: 12.2, type: 'clank', gain: 0.35 }, { t: 12.7, type: 'clank', gain: 0.3 }, { t: 13.2, type: 'sizzle', gain: 0.3 },
  { t: 15.0, type: 'pop', gain: 0.5 }, { t: 16.5, type: 'chime', gain: 0.5, pitch: 1.4 },
  { t: 20.4, type: 'pluck', gain: 0.35 }, { t: 20.8, type: 'pluck', gain: 0.35, pitch: 1.1 }, { t: 21.2, type: 'pluck', gain: 0.35, pitch: 1.2 },
  { t: 22.4, type: 'whoosh', gain: 0.45 }, { t: 23.6, type: 'thud', gain: 0.5 },
  { t: 28.8, type: 'pop', gain: 0.4 }, { t: 30.4, type: 'pop', gain: 0.4, pitch: 1.2 },
  { t: 33.4, type: 'stamp', gain: 0.4 }, { t: 34.6, type: 'slide', gain: 0.45 }, { t: 35.5, type: 'chime', gain: 0.5, pitch: 1.3 },
  ...Array.from({ length: 10 }, (_, i) => ({ t: +(36.9 + i * 0.12).toFixed(2), type: 'pop', gain: 0.25, pitch: 1 + (i % 4) * 0.12 })),
  { t: 40.2, type: 'chime', gain: 0.4 },
  { t: 42.1, type: 'riser', gain: 0.4 }, { t: 43.8, type: 'gong', gain: 0.6 },
  { t: 46.8, type: 'riser', gain: 0.35 }, { t: 47.0, type: 'chime', gain: 0.45 }, { t: 48.5, type: 'coins', gain: 0.25 },
  { t: 53.32, type: 'pop', gain: 0.8 }, { t: 53.36, type: 'gong', gain: 0.9 },
];

export const music = {
  bpm: 106, root: 'G', maqam: 'rast', gain: 0.3,
  sections: [
    { from: 0, to: 7.0, mood: 'intro' },
    { from: 7.0, to: 17.7, mood: 'drive' },
    { from: 17.7, to: 32.5, mood: 'sad' },
    { from: 32.5, to: 41.8, mood: 'groove' },
    { from: 41.8, to: 53.32, mood: 'triumph' },
    { from: 53.32, to: 56.2, mood: 'end' },
  ],
};
