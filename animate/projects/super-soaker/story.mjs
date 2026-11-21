// "How the Super Soaker Started" — an Ottoman miniature chronicle.
// u = seconds since the scene started; S.at('word') = when that word is said.
import { clamp, lerp, ease, tween, rng, TAU, shake, pop } from '../../lib/core.mjs';
import { land, interior, ogee, lamp, bookCover, bigSign, medallion, heart } from '../../styles/ottoman/scenes.mjs';

export const meta = {
  title: 'How the Super Soaker Started',
  slug: 'super-soaker-ottoman',
  style: 'ottoman',
  width: 1080, height: 1920, fps: 30,
  duration: 54.6,
  voice: 'voice.mp3',
  seed: 37,
  captionChars: 30,
  brand: { handle: '@HOWITSTARTED-YT1', logo: '../../../brand/logo.png' },
  outro: { at: 52.5, text: 'Subscribe for more origin stories' },
};

const LONNIE = { skin: '#8a5a3c', robe: '#2a9c93', robeP: 'cintamani', robePc: '#ecd57a', inner: '#f7eed6', sash: '#c4371f', hat: 'turban', hatColor: '#c4371f', glasses: true, mustache: true, beard: 'short', beardColor: '#2a1c12' };
const KID_SKINS = ['#f1d1a8', '#c68a5e', '#8a5a3c', '#e2b48a', '#a86c45'];
const gunHold = (s = 0.32, body, tank) => c => k_.waterGun(c, 30 * s, -6 * s, s, 0, body, tank);
let k_; // kit handle for the hold callbacks (set in each draw)

// Lonnie's toy-gun blueprint on a scroll; k = how much is drawn.
function blueprint(ctx, S, x, y, k) {
  const { k: K, P } = S;
  K.rect(ctx, x - 300, y - 190, 600, 380, '#dfe9f2', P.ink, 2.5);
  ctx.save(); ctx.globalAlpha = 0.35; ctx.strokeStyle = P.lapisLight; ctx.lineWidth = 1;
  for (let i = 1; i < 12; i++) { ctx.beginPath(); ctx.moveTo(x - 300 + i * 50, y - 190); ctx.lineTo(x - 300 + i * 50, y + 190); ctx.stroke(); }
  for (let i = 1; i < 8; i++) { ctx.beginPath(); ctx.moveTo(x - 300, y - 190 + i * 47); ctx.lineTo(x + 300, y - 190 + i * 47); ctx.stroke(); }
  ctx.restore();
  for (const sx of [-1, 1]) { K.rect(ctx, x + sx * 300 - 14, y - 200, 28, 400, P.brownLight, P.ink, 2); }
  ctx.save(); ctx.beginPath(); ctx.rect(x - 290, y - 180, 580 * clamp(k), 360); ctx.clip();
  K.waterGun(ctx, x - 10, y + 20, 1.45, 0, '#dfe9f2', '#dfe9f2');
  ctx.restore();
}

export const scenes = [
  { // 0.0 "A rocket scientist invented this toy by accident in his bathroom."
    start: 0, title: 'A Rocket Scientist',
    draw(ctx, u, S) {
      const { k, P, W, H } = S; k_ = k;
      const toy = S.at('toy'), acc = S.at('accident');
      land(ctx, S, { horizon: 640, seed: 61, clouds: 3 });
      // the rocket climbs the gold sky
      const r = tween(u, 0.1, 2.6, ease.inQuad);
      k.rocket(ctx, lerp(240, 720, r), lerp(840, 120, r), 1.1, 0.55, S.t, 1);
      for (let i = 0; i < 6; i++) { const q = clamp(r - i * 0.08); if (q <= 0) continue; ctx.save(); ctx.globalAlpha = 0.8 - i * 0.1; k.cloud(ctx, lerp(240, 720, q) - 60, lerp(840, 120, q) + 120, 0.6, 70 + i, P.white, P.grey); ctx.restore(); }
      k.label(ctx, 'ROCKET SCIENTIST', W / 2, 760, 30, tween(u, 0.2, 0.5));
      // …and the toy he made by accident
      const g = pop(u, toy, 0.4);
      if (g > 0) { ctx.save(); ctx.translate(320, 470); ctx.rotate(-0.15 + Math.sin(u * 3) * 0.05); ctx.scale(g, g); k.waterGun(ctx, 0, 0, 1.25); ctx.restore(); }
      k.stamp(ctx, 'BY ACCIDENT', 560, 930, 62, tween(u, acc, acc + 0.25, ease.linear), -0.12);
    },
  },
  { // 3.0 "…in his bathroom."
    start: 2.85, title: 'In His Bathroom', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      S.cam(lerp(1.0, 1.15, tween(u, 0, 1.7)), W / 2, 620);
      k.hammam(ctx, W, H, S.t);
      const [tx, ty] = k.kurna(ctx, W / 2, 1000, 1.6);
      const q = (u * 1.4) % 1; k.circle(ctx, tx + 4, ty + 10 + q * 120, 7 * (1 - q * 0.3), '#9fd3e8', P.ink, 1.5);
      medallion(ctx, k, P, '?', W / 2, 420, pop(u, 0.4, 0.35) * 1.2);
    },
  },
  { // 4.6 "In 1982, Lonnie Johnson, an engineer who worked on NASA missions,"
    start: 4.5, title: 'Lonnie Johnson · 1982', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W } = S; k_ = k;
      const lj = S.at('Lonnie'), na = S.at('NASA'), yr = S.at('1982');
      S.cam(lerp(1.0, 1.08, tween(u, 0, 4.9)), W / 2, 560);
      interior(ctx, S, { carpetColor: P.lapis });
      // the middle arch opens onto space: a planet and a probe
      ctx.save(); ctx.beginPath(); ogee(ctx, W / 2, 120, 210, 520); ctx.clip();
      k.nightSky(ctx, W / 2 - 105, 120, 210, 520, S.t);
      const pk = tween(u, na - 0.2, na + 0.6, ease.outCubic);
      ctx.save(); ctx.translate(W / 2 + 20, 330); k.circle(ctx, 0, 0, 62, P.ochreLight, P.ink, 2); ctx.beginPath(); ctx.rect(-62, -62, 124, 124); ctx.clip();
      for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.ellipse(0, i * 16, 70, 5, 0, 0, TAU); ctx.fillStyle = i % 2 ? P.ochre : P.rose; ctx.fill(); } ctx.restore();
      ctx.save(); ctx.translate(lerp(W / 2 - 160, W / 2 - 40, pk), lerp(560, 480, pk)); ctx.rotate(-0.4);
      k.rect(ctx, -16, -12, 32, 24, P.goldLight, P.ink, 1.5); k.rect(ctx, -60, -6, 40, 12, P.lapisLight, P.ink, 1.2); k.rect(ctx, 20, -6, 40, 12, P.lapisLight, P.ink, 1.2);
      ctx.beginPath(); ctx.arc(0, -16, 16, Math.PI, TAU); k.fillStroke(ctx, P.white, P.ink, 1.5); ctx.restore();
      ctx.restore();
      ctx.beginPath(); ogee(ctx, W / 2, 120, 210, 520); k.stroke(ctx, P.goldDark, 6);
      k.label(ctx, 'NASA', W / 2, 610, 26, tween(u, na, na + 0.3), P.paperLight);
      k.figure(ctx, 260, 1000, { ...LONNIE, s: 1.25, face: 1, mood: 'happy', armF: [2.3, 0.3], hold: c => { c.rotate(-0.6); k.rect(c, -6, -70, 12, 80, P.goldDark, P.ink, 1.5); } });
      k.label(ctx, 'LONNIE JOHNSON', 300, 560, 26, tween(u, lj, lj + 0.3));
      k.seal(ctx, 790, 900, 80, ' ENGINEER · NASA MISSIONS ·', '1982', tween(u, yr, yr + 0.3, ease.linear));
    },
  },
  { // 9.6 "is building a cooling system that runs on water."
    start: 9.45, title: 'Cooling With Water', trans: 'wipe',
    draw(ctx, u, S) {
      const { k, P, W, H } = S; k_ = k;
      const co = S.at('cooling'), wa = S.at('water');
      S.cam(lerp(1.05, 1.0, tween(u, 0, 3.4)), W / 2, 540);
      interior(ctx, S, { carpet: false });
      // the machine: a tank, a coil, gauges and pipes with water running
      k.rect(ctx, 520, 420, 240, 380, P.steel, P.ink, 2.5);
      for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.ellipse(640, 470 + i * 40, 90, 14, 0, 0, Math.PI); k.stroke(ctx, P.goldDark, 6); }
      for (const [gx, gy] of [[570, 760], [710, 760]]) { k.circle(ctx, gx, gy, 26, P.white, P.ink, 2); const a = -2.2 + tween(u, co, co + 1) * 3 + Math.sin(u * 9) * 0.08; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + Math.cos(a) * 20, gy + Math.sin(a) * 20); k.stroke(ctx, P.verm, 3); }
      const pipe = c => { c.moveTo(80, 300); c.lineTo(420, 300); c.lineTo(420, 520); c.lineTo(520, 520); c.moveTo(760, 600); c.lineTo(880, 600); c.lineTo(880, 880); };
      ctx.beginPath(); pipe(ctx); k.stroke(ctx, P.ink, 26); ctx.beginPath(); pipe(ctx); k.stroke(ctx, P.steel, 20);
      ctx.save(); ctx.setLineDash([18, 22]); ctx.lineDashOffset = -u * 160; ctx.beginPath(); pipe(ctx); k.stroke(ctx, '#7cc6e6', 9); ctx.restore();
      // cool air: snowflake stars drifting out
      if (u > wa - 0.5) for (let i = 0; i < 10; i++) { const q = ((u - wa) * 0.4 + i / 10) % 1; k.star(ctx, 790 + q * 140 + Math.sin(i + u) * 20, 440 + i * 30 - q * 60, 8, 1 - q); }
      k.label(ctx, 'COOLING SYSTEM', 640, 370, 26, tween(u, co, co + 0.3));
      k.figure(ctx, 250, 1000, { ...LONNIE, s: 1.15, face: 1, mood: 'calm', armF: [1.4 + Math.sin(u * 5) * 0.15, 0.6], hold: c => { c.rotate(0.3); k.rect(c, -5, -8, 10, 64, P.grey, P.ink, 1.5); k.circle(c, 0, 60, 11, null, P.ink, 4); } });
    },
  },
  { // 13.0 "He tests a homemade nozzle on his bathroom sink."
    start: 12.9, title: 'The Bathroom Test', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const nz = S.at('nozzle');
      S.cam(lerp(1.0, 1.18, tween(u, 0, 3.4)), 520, 640);
      k.hammam(ctx, W, H, S.t);
      const [tx, ty] = k.kurna(ctx, 560, 1000, 1.6);
      // the nozzle is screwed onto the tap
      const on = tween(u, nz - 0.5, nz, ease.outCubic);
      ctx.save(); ctx.translate(lerp(tx + 160, tx + 8, on), lerp(ty - 160, ty + 6, on)); ctx.rotate(lerp(1.2, 0.35, on) + (u > nz ? Math.sin(u * 30) * 0.05 * (1 - tween(u, nz, nz + 0.4)) : 0));
      k.rect(ctx, -10, -6, 52, 16, P.goldLight, P.ink, 2); k.rect(ctx, 38, -2, 18, 8, P.verm, P.ink, 1.5); ctx.restore();
      k.label(ctx, 'HOMEMADE NOZZLE', 560, 600, 26, tween(u, nz, nz + 0.3));
      k.figure(ctx, 230, 1010, { ...LONNIE, s: 1.2, face: 1, mood: 'calm', look: 0.25, armF: [1.7, 0.2] });
    },
  },
  { // 16.4 "Whoosh! A blast of water shoots across the room."
    start: 16.3, title: 'Whoosh!', trans: 'flash',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const wh = S.at('Whoosh'), bl = S.at('blast'), sh = S.at('shoots');
      S.cam(lerp(1.15, 1.0, tween(u, 0, 1.5)), W / 2 + shake(u, wh, 10, 0.5) + shake(u, sh, 8, 0.4), 600);
      k.hammam(ctx, W, H, S.t);
      const [tx, ty] = k.kurna(ctx, 560, 1000, 1.6);
      ctx.save(); ctx.translate(tx + 8, ty + 6); ctx.rotate(0.35); k.rect(ctx, -10, -6, 52, 16, P.goldLight, P.ink, 2); ctx.restore();
      // first jet on "Whoosh", a bigger blast on "shoots"
      k.waterStream(ctx, tx + 40, ty + 20, 300, 260, -40, 380, tween(u, wh, wh + 0.35), S.t, 16);
      k.waterStream(ctx, tx + 40, ty + 20, 520, 80, -60, 160, tween(u, sh - 0.1, sh + 0.35), S.t, 26);
      // the splash on the far wall
      if (u > sh + 0.3) for (let i = 0; i < 16; i++) { const q = ((u - sh) * 1.5 + i / 16) % 1; k.circle(ctx, 20 + i * 6, 160 + q * 700, 5, '#9fd3e8', P.ink, 1); }
      const ww = tween(u, wh - 0.05, wh + 0.3, ease.outBack);
      if (ww > 0) { ctx.save(); ctx.translate(560, 300); ctx.rotate(-0.12); ctx.scale(ww, ww); ctx.font = '900 120px Deco'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = 12; ctx.strokeStyle = P.ink; ctx.strokeText('WHOOSH!', 0, 0); ctx.fillStyle = '#7cc6e6'; ctx.fillText('WHOOSH!', 0, 0); ctx.restore(); }
      k.figure(ctx, 180, 1010, { ...LONNIE, s: 1.2, face: 1, mood: 'happy', look: -0.4, armF: [2.6, 0.2], armB: [2.2, 0.3], bob: -Math.abs(Math.sin(u * 6)) * 8 * tween(u, wh, wh + 0.2) });
    },
  },
  { // 20.3 "This would make an amazing water gun."
    start: 20.15, title: 'An Amazing Water Gun', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const am = S.at('amazing'), gu = S.at('gun');
      interior(ctx, S, { window: true, carpetColor: P.verm });
      lamp(ctx, S, W / 2, 200, tween(u, am - 0.1, am + 0.2));
      blueprint(ctx, S, W / 2, 470, tween(u, 0.1, gu + 0.2, ease.inOut));
      if (u > am) for (let i = 0; i < 14; i++) { const a = i / 14 * TAU, r = 60 + (u - am) * 380; k.star(ctx, W / 2 + Math.cos(a) * r, 200 + Math.sin(a) * r * 0.6, 10, 1 - (u - am) * 0.6); }
      k.figure(ctx, 760, 1010, { ...LONNIE, s: 1.1, face: -1, mood: 'happy', armF: [2.2, 0.2] });
    },
  },
  { // 23.0 "He builds a prototype,"
    start: 22.85, title: 'The Prototype', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const pt = S.at('prototype');
      interior(ctx, S, { window: true, carpetColor: P.green });
      k.rect(ctx, 170, 760, 600, 26, P.brownLight, P.ink, 2); for (const lx of [200, 710]) k.rect(ctx, lx, 786, 20, 200, P.brown, P.ink, 1.5);
      // parts fly in and click together
      const a = tween(u, 0.1, pt + 0.4, ease.outBack);
      ctx.save(); ctx.globalAlpha = 1 - tween(u, pt + 0.4, pt + 0.55);
      k.rect(ctx, lerp(80, 360, a), lerp(300, 650, a), 260, 26, P.white, P.ink, 2); // pipe
      ctx.beginPath(); ctx.ellipse(lerp(850, 450, a), lerp(250, 600, a), 64, 28, 0, 0, TAU); k.fillStroke(ctx, 'rgba(200,235,240,0.7)', P.ink, 2); // bottle
      k.rect(ctx, lerp(820, 540, a), lerp(900, 690, a), 90, 22, P.verm, P.ink, 2); // pump
      ctx.restore();
      const g = tween(u, pt + 0.35, pt + 0.6, ease.outBack);
      if (g > 0) { ctx.save(); ctx.translate(470, 660); ctx.scale(g, g); k.waterGun(ctx, 0, 0, 1.3, -0.05, P.white, 'rgba(200,235,240,0.9)'); ctx.restore(); }
      k.label(ctx, 'PROTOTYPE', 470, 470, 30, tween(u, pt, pt + 0.3));
      k.figure(ctx, 840, 1010, { ...LONNIE, s: 1.0, face: -1, mood: 'happy', armF: [1.6 + Math.sin(u * 8) * 0.2, 0.3] });
    },
  },
  { // 24.8 "but it takes years to get a toy company on board. He keeps pushing."
    start: 24.65, title: 'Years of "No"', trans: 'wipe',
    draw(ctx, u, S) {
      const { k, P, W, H } = S; k_ = k;
      const ye = S.at('years'), tc = S.at('toy'), bd = S.at('board'), pu = S.at('pushing');
      // years fly by: day and night swap across the sky
      const cyc = (u * 0.9) % 1, night = Math.sin(cyc * TAU) < 0;
      land(ctx, S, { horizon: 420, seed: 71, clouds: 2, night });
      const arcX = lerp(-60, W + 60, (u * 1.8) % 1), arcY = 300 - Math.sin(((u * 1.8) % 1) * Math.PI) * 220;
      if (night) k.moon(ctx, arcX, arcY, 40); else k.sun(ctx, arcX, arcY, 44, S.t);
      // three palace gates of toy makers, each says no
      for (const [i, at] of [[0, ye], [1, tc], [2, bd]]) {
        const x = 170 + i * 300;
        k.rect(ctx, x - 100, 420, 200, 360, [P.pink, P.ochreLight, P.lavLight][i], P.ink, 2.5);
        k.dome(ctx, x, 420, 70, [P.lapisLight, P.turq, P.green][i]);
        k.arch(ctx, x, 780, 110, 200, P.brown);
        k.stamp(ctx, 'NO', x, 560, 72, tween(u, at, at + 0.25, ease.linear), [-0.2, 0.15, -0.1][i]);
      }
      // Lonnie keeps walking from gate to gate
      const x = lerp(80, 860, tween(u, 0, 4.6, ease.linear));
      k.figure(ctx, x, 1010, { ...LONNIE, s: 1.0, face: 1, walk: u * 8, mood: u > pu ? 'happy' : 'calm', look: u > pu ? -0.2 : 0.3, armF: [1.3, 0.2], hold: gunHold(0.32) });
      if (u > pu) k.label(ctx, 'KEEPS PUSHING', W / 2, 300, 28, tween(u, pu, pu + 0.3));
    },
  },
  { // 29.5 "Finally, a company called Larami says yes."
    start: 29.35, title: 'Larami Says Yes', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W, H } = S; k_ = k;
      const la = S.at('Larami'), ye = S.at('yes');
      S.cam(lerp(1.06, 1.0, tween(u, 0, 3)), W / 2, 540);
      interior(ctx, S, { window: true, carpetColor: P.verm });
      k.rect(ctx, 330, 700, 280, 60, P.goldDark, P.ink, 2);
      k.canopy(ctx, 470, 330, 330, 370, P.verm, S.t);
      k.label(ctx, 'LARAMI', 470, 300, 30, tween(u, la - 0.1, la + 0.2), P.goldLight);
      k.figure(ctx, 470, 710, { s: 1.1, face: 1, kneel: true, robe: P.lapis, robeP: 'cintamani', robePc: P.goldLight, inner: P.white, hat: 'turban', hatColor: P.verm, plume: P.ochre, beard: 'long', mustache: true, mood: u > ye ? 'happy' : 'calm', armF: [lerp(0.6, 2.0, tween(u, ye - 0.3, ye)), 0.2] });
      k.figure(ctx, 190, 1010, { ...LONNIE, s: 1.1, face: 1, mood: 'happy', armF: [1.6, -0.1], hold: gunHold(0.4) });
      k.seal(ctx, 760, 880, 80, ' LARAMI CORPORATION · YES ·', 'YES', tween(u, ye, ye + 0.3, ease.linear), P.green);
      if (u > ye - 0.1) { const R = rng(7); for (let i = 0; i < 34; i++) { const x = R() * W, d = R(), y = -40 + (u - ye + 0.1) * (500 + d * 500) - d * 300; if (y < -30 || y > H) continue; k.ellipse(ctx, x, y, 13, 13 * Math.abs(Math.cos(u * 8 + i)), 0, P.goldLight, P.goldDeep, 1.5); } }
    },
  },
  { // 33.1 "In 1990, it hits stores as the Power Drencher."
    start: 32.95, title: 'Power Drencher · 1990', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W } = S; k_ = k;
      const st = S.at('stores'), pd = S.at('Power');
      S.cam(lerp(1.1, 1.0, tween(u, 0, 3.8)), W / 2, 560);
      land(ctx, S, { horizon: 300, seed: 74, clouds: 2 });
      // the toy shop
      k.rect(ctx, 150, 430, 640, 400, P.brownLight, P.ink, 2.5);
      k.canopy(ctx, 470, 400, 680, 120, P.turq, S.t);
      for (let row = 0; row < 3; row++) { k.rect(ctx, 170, 540 + row * 100, 600, 12, P.brown, P.ink, 1.5); for (let i = 0; i < 4; i++) k.waterGun(ctx, 240 + i * 150, 520 + row * 100, 0.42 * pop(u, st - 0.3 + (row * 4 + i) * 0.05, 0.3), 0, [P.turq, P.verm, P.green, P.lapisLight][(i + row) % 4], [P.ochre, P.goldLight, P.ochreLight][row]); }
      const bk = tween(u, pd - 0.1, pd + 0.35, ease.outBack);
      if (bk > 0) { ctx.save(); ctx.translate(470, 360); ctx.scale(bk, bk); k.cartouche(ctx, 0, 0, 540, 86, P.paperLight, P.goldDark, 4); ctx.fillStyle = P.verm; ctx.font = '900 46px Deco'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('POWER DRENCHER', 0, 4); ctx.restore(); }
      for (let i = 0; i < 4; i++) k.figure(ctx, 120 + i * 230, 1010 - (i % 2) * 20, { s: 0.62, face: i % 2 ? -1 : 1, skin: KID_SKINS[i], robe: [P.green, P.verm, P.ochre, P.lav][i], robeP: 'dots', hat: i === 2 ? 'fez' : 'turban', hatColor: P.lapis, mood: 'happy', armF: [2.4 + Math.sin(u * 6 + i) * 0.3, 0.2], bob: -Math.abs(Math.sin(u * 7 + i)) * 10 });
      k.seal(ctx, 820, 250, 60, ' IN STORES · IN STORES ·', '1990', tween(u, S.at('1990'), S.at('1990') + 0.3, ease.linear));
    },
  },
  { // 37.1 "Then it gets a new name, the Super Soaker."
    start: 36.95, title: 'A New Name', trans: 'flash',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const nn = S.at('name'), su = S.at('Super');
      k.goldSky(ctx, -50, -50, W + 100, H + 100, S.t);
      for (let i = 0; i < 4; i++) k.cloud(ctx, 120 + i * 240, 140 + (i % 2) * 90, 1.1, i + 80);
      // the old name tips away, the new name arrives with a splash
      const off = tween(u, nn, su - 0.05, ease.inCubic);
      ctx.save(); ctx.translate(lerp(W / 2, -300, off), 420 + off * 300); ctx.rotate(-off * 0.8);
      k.cartouche(ctx, 0, 0, 560, 90, P.paperLight, P.goldDark, 4); ctx.fillStyle = P.verm; ctx.font = '900 46px Deco'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('POWER DRENCHER', 0, 4); ctx.restore();
      k.waterStream(ctx, 900, 900, 600, 200, 60, 540, tween(u, su - 0.3, su + 0.1), S.t, 22);
      ctx.save(); ctx.translate(890, 920); ctx.rotate(Math.PI - 0.5); k.waterGun(ctx, 0, 0, 1.0, 0, P.turq, P.ochre); ctx.restore();
      bigSign(ctx, k, P, 'SUPER SOAKER', W / 2, 520, 820, tween(u, su - 0.05, su + 0.35, ease.outBack), 104);
    },
  },
  { // 40.4 "In three years, Larami sells about 27 million of them."
    start: 40.3, title: 'About 27 Million', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const th = S.at('three'), mi = S.at('million');
      S.cam(lerp(1.0, 1.08, tween(u, 0, 5)), W / 2, 560);
      interior(ctx, S, { window: true, carpetColor: P.lapis });
      // a treasure heap of water guns grows like a sultan's hoard
      const R = rng(19), grow = tween(u, th - 0.2, mi + 0.5);
      for (let i = 0; i < Math.floor(60 * grow); i++) { const row = Math.floor(Math.sqrt(i)), x = W / 2 + (R() - 0.5) * (520 - row * 50), y = 990 - row * 44 - R() * 20; k.waterGun(ctx, x, y, 0.34, (R() - 0.5) * 0.8, [P.turq, P.verm, P.green, P.lapisLight, P.ochre][i % 5], [P.ochre, P.goldLight, P.verm][i % 3]); }
      // the ledger count
      const n = Math.round(27000000 * ease.outCubic(tween(u, th, mi + 0.3, ease.linear)) / 1000) * 1000;
      k.cartouche(ctx, W / 2, 370, 640, 140, P.lapis, P.goldLight, 6);
      ctx.fillStyle = P.goldLight; ctx.font = '900 70px Deco'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText((u > mi + 0.3 ? '≈ ' : '') + n.toLocaleString('en-US'), W / 2, 376);
      k.label(ctx, 'IN THREE YEARS', W / 2, 232, 26, tween(u, th, th + 0.3));
      if (u > mi) for (let i = 0; i < 14; i++) { const a = i / 14 * TAU, r = 120 + (u - mi) * 420; k.star(ctx, W / 2 + Math.cos(a) * r, 370 + Math.sin(a) * r * 0.5, 12, 1 - (u - mi) * 0.7); }
    },
  },
  { // 45.5 "A science experiment that soaked a whole generation."
    start: 45.35, title: 'A Soaked Generation', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W, H } = S; k_ = k;
      const so = S.at('soaked'), ge = S.at('generation');
      S.cam(lerp(1.1, 1.0, tween(u, 0, 5)), W / 2, 560);
      land(ctx, S, { horizon: 330, seed: 83, clouds: 3 });
      // rainbow over the festival
      const rb = tween(u, ge - 0.3, ge + 0.6);
      if (rb > 0) { ctx.save(); ctx.globalAlpha = 0.75; for (const [i, c] of [P.verm, P.ochre, P.goldLight, P.green, P.lapisLight, P.lav].entries()) { ctx.beginPath(); ctx.arc(W / 2, 640, 420 - i * 16, Math.PI, Math.PI + Math.PI * rb); k.stroke(ctx, c, 16); } ctx.restore(); }
      // fountain (şadırvan)
      k.rect(ctx, W / 2 - 110, 560, 220, 60, P.white, P.ink, 2); k.dome(ctx, W / 2, 560, 80, P.lapisLight);
      for (let i = -2; i <= 2; i++) k.waterStream(ctx, W / 2, 470, W / 2 + i * 60, 400, W / 2 + i * 110, 600, 1, S.t, 6);
      // kids everywhere, soaking each other
      const kids = [[110, 880, 1], [300, 960, 1], [520, 1000, -1], [700, 930, -1], [860, 990, -1], [220, 760, 1], [760, 780, -1]];
      kids.forEach(([x, y, f], i) => {
        k.figure(ctx, x, y, { s: 0.6, face: f, skin: KID_SKINS[i % 5], robe: [P.green, P.verm, P.ochre, P.lav, P.lapisLight, P.turq, P.pink][i], robeP: ['dots', 'stripes', 'flowers'][i % 3], hat: i % 3 === 1 ? 'fez' : 'turban', hatColor: [P.verm, P.lapis, P.green][i % 3], mood: 'happy', armF: [1.6, 0.1], hold: gunHold(0.34), bob: -Math.abs(Math.sin(u * 6 + i)) * 10 });
        const st = so - 0.8 + i * 0.25, hx = x + f * 120 * 0.6 * 1.3, hy = y - 175 * 0.6;
        k.waterStream(ctx, hx, hy, hx + f * 140, hy - 120, hx + f * 300, hy + 40, tween(u, st, st + 0.4), S.t + i, 8);
      });
      k.label(ctx, 'A WHOLE GENERATION', W / 2, 220, 28, tween(u, ge, ge + 0.3));
    },
  },
  { // 50.7 "Every legend has a beginning."
    start: 50.5, title: 'Every Legend Has a Beginning', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W, H } = S, beg = S.at('beginning');
      ctx.save();
      S.cam(lerp(1.0, 1.5, tween(u, 0, beg)), 600, lerp(640, 720, tween(u, 0, beg)));
      k.hammam(ctx, W, H, S.t);
      const [tx, ty] = k.kurna(ctx, 560, 1000, 1.6);
      ctx.save(); ctx.translate(tx + 8, ty + 6); ctx.rotate(0.35); k.rect(ctx, -10, -6, 52, 16, P.goldLight, P.ink, 2); ctx.restore();
      // one glowing drop: where it all began
      const dy = lerp(0, 60, tween(u, 0.2, beg)), g = ctx.createRadialGradient(tx + 50, ty + 20 + dy, 4, tx + 50, ty + 20 + dy, 90); g.addColorStop(0, 'rgba(255,245,190,0.9)'); g.addColorStop(1, 'rgba(255,245,190,0)');
      ctx.fillStyle = g; ctx.fillRect(tx - 50, ty - 80 + dy, 200, 200);
      k.circle(ctx, tx + 50, ty + 20 + dy, 14, '#9fd3e8', P.ink, 2);
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
const pops = (from, n, gap, gain = 0.5) => Array.from({ length: n }, (_, i) => ({ t: +(from + i * gap).toFixed(3), type: 'pop', gain, pitch: 1 + (i % 4) * 0.12 }));
export const sfx = [
  ...scenes.slice(1).map(s => ({ t: s.start - 0.05, type: s.trans === 'unroll' ? 'paper' : 'whoosh', gain: 0.35 })),
  { t: 0.1, type: 'riser', gain: 0.5 }, { t: 0.2, type: 'thunder', gain: 0.35 }, { t: 1.9, type: 'pop', gain: 0.7 }, { t: 2.46, type: 'stamp', gain: 0.8 },
  { t: 3.3, type: 'drip', gain: 0.6 }, { t: 4.0, type: 'drip', gain: 0.5, pitch: 1.2 },
  { t: 4.72, type: 'stamp', gain: 0.6 }, { t: 6.0, type: 'pluck', gain: 0.5 }, { t: 8.3, type: 'chime', gain: 0.45 },
  { t: 10.2, type: 'clank', gain: 0.4 }, { t: 10.5, type: 'waves', gain: 0.25 }, { t: 11.8, type: 'chime', gain: 0.3, pitch: 1.4 },
  { t: 13.6, type: 'clank', gain: 0.45 }, { t: 14.06, type: 'clank', gain: 0.5 },
  { t: 16.38, type: 'spray', gain: 0.9 }, { t: 16.4, type: 'whoosh', gain: 0.7 }, { t: 18.4, type: 'spray', gain: 1.0 }, { t: 18.75, type: 'splash', gain: 0.8 },
  { t: 20.84, type: 'chime', gain: 0.55 }, { t: 21.3, type: 'paper', gain: 0.35 },
  { t: 23.3, type: 'clank', gain: 0.4 }, { t: 23.9, type: 'pop', gain: 0.7 },
  { t: 25.16, type: 'stamp', gain: 0.6 }, { t: 26.16, type: 'stamp', gain: 0.6 }, { t: 27.06, type: 'stamp', gain: 0.7 }, { t: 28.5, type: 'riser', gain: 0.35 },
  { t: 30.94, type: 'pluck', gain: 0.45 }, { t: 31.96, type: 'stamp', gain: 0.8 }, { t: 32.0, type: 'coins', gain: 0.5 }, { t: 32.05, type: 'gong', gain: 0.5 },
  ...pops(34.3, 12, 0.05, 0.3), { t: 33.2, type: 'stamp', gain: 0.5 }, { t: 35.54, type: 'chime', gain: 0.45 },
  { t: 38.0, type: 'slide', gain: 0.4 }, { t: 38.6, type: 'spray', gain: 0.8 }, { t: 38.92, type: 'gong', gain: 0.8 }, { t: 39.1, type: 'splash', gain: 0.5 },
  { t: 40.5, type: 'coins', gain: 0.35 }, { t: 41.8, type: 'coins', gain: 0.35 }, { t: 43.44, type: 'chime', gain: 0.6 }, { t: 43.5, type: 'coins', gain: 0.5 },
  { t: 46.4, type: 'spray', gain: 0.55 }, { t: 46.9, type: 'spray', gain: 0.55 }, { t: 47.2, type: 'splash', gain: 0.6 }, { t: 47.7, type: 'spray', gain: 0.5 }, { t: 48.2, type: 'splash', gain: 0.5 }, { t: 48.4, type: 'chime', gain: 0.4 },
  { t: 51.0, type: 'drip', gain: 0.6 }, { t: 51.86, type: 'pop', gain: 0.8 }, { t: 51.9, type: 'gong', gain: 0.9 },
];

export const music = {
  bpm: 104, root: 'D', maqam: 'hicaz', gain: 0.32,
  sections: [
    { from: 0, to: 4.5, mood: 'intro' },
    { from: 4.5, to: 16.3, mood: 'groove' },
    { from: 16.3, to: 24.65, mood: 'drive' },
    { from: 24.65, to: 28.4, mood: 'sad' },
    { from: 28.4, to: 37.0, mood: 'drive' },
    { from: 37.0, to: 51.85, mood: 'triumph' },
    { from: 51.85, to: 54.6, mood: 'end' },
  ],
};
