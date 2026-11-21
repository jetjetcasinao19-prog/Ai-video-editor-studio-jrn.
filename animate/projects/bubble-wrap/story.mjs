// "How Bubble Wrap Started" — told as an Ottoman miniature chronicle.
// Every scene is a function drawn in the 940×1060 painting area.
// u = seconds since the scene started; S.at('word') = when that word is said.
import { clamp, lerp, ease, tween, rng, TAU, shake, pop, noise1 } from '../../lib/core.mjs';

export const meta = {
  title: 'How Bubble Wrap Started',
  slug: 'bubble-wrap-ottoman',
  style: 'ottoman',
  width: 1080, height: 1920, fps: 30,
  duration: 59.0,
  voice: 'voice.mp3',
  seed: 23,
  captionChars: 30,
  brand: { handle: '@HOWITSTARTED-YT1', logo: '../../../brand/logo.png' },
  outro: { at: 56.75, text: 'Subscribe for more origin stories' },
};

// ---------- shared backdrops ----------
function land(ctx, S, o = {}) {
  const { W, H, k, P, t } = S, hz = o.horizon ?? 330;
  if (o.night) k.nightSky(ctx, 0, 0, W, hz + 80, t); else k.goldSky(ctx, 0, 0, W, hz + 80, t);
  if (o.sky) o.sky(ctx);
  for (let i = 0; i < (o.clouds ?? 3); i++) {
    const x = ((i * 380 + t * (14 + i * 5)) % (W + 400)) - 200;
    ctx.save(); if (o.night) ctx.globalAlpha = 0.5; k.cloud(ctx, x, 70 + i * 70 % 160, 0.9 + (i % 2) * 0.3, i + 1); ctx.restore();
  }
  k.hills(ctx, W, hz - 90, o.seed || 3, o.hillColors || [P.lav, P.rose, P.sageLight, P.pink]);
  k.ground(ctx, 0, hz, W, H - hz, o.ground || P.sage, (o.seed || 3) + 7, o.density ?? 1);
}
function ogee(ctx, x, y, w, h) { // pointed arch, top at y, base y+h
  ctx.moveTo(x - w / 2, y + h); ctx.lineTo(x - w / 2, y + w * 0.55);
  ctx.bezierCurveTo(x - w / 2, y + w * 0.1, x - w * 0.1, y + w * 0.12, x, y);
  ctx.bezierCurveTo(x + w * 0.1, y + w * 0.12, x + w / 2, y + w * 0.1, x + w / 2, y + w * 0.55);
  ctx.lineTo(x + w / 2, y + h); ctx.closePath();
}
// Palace room. paper(i) → 0..1 how far bubble wallpaper is unrolled in arch i.
function interior(ctx, S, o = {}) {
  const { W, H, k, P } = S;
  ctx.fillStyle = o.wall || P.paperLight; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = k.pattern(ctx, 'flowers', o.wall || P.paperLight, P.paperDark, 30); ctx.fillRect(0, 0, W, 760);
  // frieze
  ctx.fillStyle = P.lapis; ctx.fillRect(0, 0, W, 70);
  ctx.fillStyle = k.pattern(ctx, 'cintamani', P.lapis, P.goldLight, 34); ctx.fillRect(0, 6, W, 58);
  k.rect(ctx, -2, 64, W + 4, 10, P.goldLight, P.ink, 1.5);
  const n = o.arches || 3, aw = 210;
  for (let i = 0; i < n; i++) {
    const x = W / 2 + (i - (n - 1) / 2) * 290;
    ctx.beginPath(); ogee(ctx, x, 120, aw, 520); k.fillStroke(ctx, P.white, P.ink, 2.5);
    const p = o.paper ? clamp(o.paper(i)) : 0;
    if (p > 0) {
      ctx.save(); ctx.beginPath(); ogee(ctx, x, 120, aw, 520); ctx.clip();
      ctx.fillStyle = k.pattern(ctx, 'bubbles', '#bfe0e4', 'rgba(110,170,190,0.9)', 34);
      ctx.fillRect(x - aw / 2, 120, aw, 520 * p);
      // the rolled edge
      k.rect(ctx, x - aw / 2 - 4, 120 + 520 * p - 10, aw + 8, 20, '#d4ecef', P.ink, 1.5);
      ctx.restore();
    } else if (o.window) { // garden view
      ctx.save(); ctx.beginPath(); ogee(ctx, x, 120, aw, 520); ctx.clip();
      k.goldSky(ctx, x - aw / 2, 120, aw, 520, S.t); k.cypress(ctx, x, 640, 330, S.t, i);
      ctx.restore();
    }
    ctx.beginPath(); ogee(ctx, x, 120, aw, 520); k.stroke(ctx, P.goldDark, 6); k.stroke(ctx, P.ink, 1.5);
  }
  // İznik tile dado
  ctx.fillStyle = k.pattern(ctx, 'tiles', P.white, P.lapisLight, 46); ctx.fillRect(0, 640, W, 120);
  k.rect(ctx, -2, 636, W + 4, 8, P.verm, P.ink, 1.2); k.rect(ctx, -2, 756, W + 4, 8, P.verm, P.ink, 1.2);
  // floor + carpet
  ctx.fillStyle = P.ochreLight; ctx.fillRect(0, 764, W, H - 764);
  ctx.fillStyle = k.pattern(ctx, 'scales', P.ochreLight, P.ochre, 40); ctx.fillRect(0, 764, W, H - 764);
  if (o.carpet !== false) k.carpet(ctx, 120, 820, W - 240, 210, o.carpetColor || P.verm);
}
function lamp(ctx, S, x, y, lit = 1) { // hanging oil lamp (kandil)
  const { k, P, t } = S;
  ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, y - 40); k.stroke(ctx, P.goldDark, 2);
  if (lit > 0) { const g = ctx.createRadialGradient(x, y, 5, x, y, 150 * lit); g.addColorStop(0, `rgba(255,230,140,${0.7 * lit})`); g.addColorStop(1, 'rgba(255,230,140,0)'); ctx.fillStyle = g; ctx.fillRect(x - 160, y - 160, 320, 320); }
  ctx.beginPath(); ctx.moveTo(x - 34, y - 30); ctx.quadraticCurveTo(x - 40, y + 20, x, y + 30); ctx.quadraticCurveTo(x + 40, y + 20, x + 34, y - 30); ctx.closePath();
  k.fillStroke(ctx, lit > 0.5 ? P.goldLight : P.turqLight, P.ink, 2);
  k.rect(ctx, x - 38, y - 40, 76, 12, P.goldDark, P.ink, 1.5);
  if (lit > 0) { const fl = 1 + 0.15 * Math.sin(t * 20); ctx.beginPath(); ctx.ellipse(x, y - 4, 7 * fl, 13 * fl, 0, 0, TAU); ctx.fillStyle = P.verm; ctx.fill(); }
}
const ENG = { // the two engineers, dressed by the court painters
  fielding: { robe: '#20408f', robeP: 'cintamani', robePc: '#ecd57a', inner: '#e9be6e', sash: '#c4371f', hat: 'turban', hatColor: '#c4371f', beard: 'short', glasses: true },
  chavannes: { robe: '#c4371f', robeP: 'flowers', robePc: '#f7eed6', inner: '#6cc3b8', sash: '#20408f', hat: 'turban', hatColor: '#3d8458', beard: 'long', beardColor: '#6b4a32', mustache: true },
};
function dividers(ctx) { ctx.rotate(-0.3); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-14, 70); ctx.moveTo(0, 0); ctx.lineTo(14, 70); ctx.strokeStyle = '#8f6c14'; ctx.lineWidth = 4; ctx.stroke(); }
function scroll(ctx) { ctx.rotate(-0.2); ctx.fillStyle = '#f7eed6'; ctx.strokeStyle = '#2a1c12'; ctx.lineWidth = 2; ctx.beginPath(); ctx.rect(-8, -50, 16, 100); ctx.fill(); ctx.stroke(); }
function spyglass(ctx) { ctx.rotate(-1.75); ctx.fillStyle = '#c9a227'; ctx.strokeStyle = '#2a1c12'; ctx.lineWidth = 2; ctx.beginPath(); ctx.rect(-6, -8, 110, 16); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.rect(96, -11, 26, 22); ctx.fill(); ctx.stroke(); }
function rollHeld(ctx) { ctx.rotate(-1.5); ctx.fillStyle = '#bfe0e4'; ctx.strokeStyle = '#2a1c12'; ctx.lineWidth = 2; ctx.beginPath(); ctx.rect(-14, -60, 28, 120); ctx.fill(); ctx.stroke(); }

// ---------- the scenes ----------
export const scenes = [
  { // 0.0 "This was supposed to go on your walls."
    start: 0, title: 'A Curious Wallpaper',
    draw(ctx, u, S) {
      const { k, P, W } = S, z = lerp(1.65, 1.0, tween(u, 0, 2.4, ease.inOut));
      S.cam(z, W / 2, lerp(380, 530, tween(u, 0, 2.4)));
      interior(ctx, S, { paper: () => 1 });
      lamp(ctx, S, W / 2, 250, 1);
      // a courtier presses the strange wall… and it pops
      const pressAt = S.at('walls');
      const reach = tween(u, pressAt - 0.5, pressAt, ease.outCubic);
      k.figure(ctx, 590, 960, { s: 1.12, face: -1, robe: P.green, robeP: 'dots', robePc: P.goldLight, inner: P.pink, hat: 'turban', hatColor: P.verm, beard: 'short', mood: u > pressAt ? 'happy' : 'calm', armF: [lerp(0.3, 1.9, reach), lerp(0.4, 0.1, reach)] });
      k.figure(ctx, 300, 980, { s: 1.05, face: 1, robe: P.ochre, robeP: 'stripes', robePc: P.vermDark, inner: P.white, hat: 'fez', armF: [0.9 + Math.sin(u * 4) * 0.1, 1.2], mood: 'happy' });
      // floating bubbles
      for (let i = 0; i < 9; i++) { const y = 900 - ((u * 90 + i * 110) % 800); k.bubble(ctx, 120 + i * 90 + Math.sin(u * 2 + i) * 20, y, 10 + (i % 3) * 6, 0.9); }
    },
  },
  { // 2.6 "Hawthorne, New Jersey."
    start: 2.5, title: 'Hawthorne, New Jersey', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      S.cam(lerp(1.12, 1.0, tween(u, 0, 2)), W / 2, lerp(480, 560, tween(u, 0, 2)));
      land(ctx, S, { horizon: 300, seed: 5 });
      // the Passaic river winding across the tilted plain
      ctx.save(); ctx.beginPath(); ctx.moveTo(-20, 760); ctx.bezierCurveTo(250, 680, 420, 900, 960, 800); ctx.lineTo(960, 900); ctx.bezierCurveTo(420, 1000, 250, 780, -20, 860); ctx.closePath(); ctx.clip();
      k.waves(ctx, -20, 650, 1000, 380, S.t, P.water, P.waterLight, 24, 22); ctx.restore();
      ctx.beginPath(); ctx.moveTo(-20, 760); ctx.bezierCurveTo(250, 680, 420, 900, 960, 800); k.stroke(ctx, P.ink, 2);
      ctx.beginPath(); ctx.moveTo(-20, 860); ctx.bezierCurveTo(250, 780, 420, 1000, 960, 900); k.stroke(ctx, P.ink, 2);
      // the town, row behind row (higher = farther)
      const R = rng(4), walls = [P.pink, P.white, P.ochreLight, P.lavLight, P.turqLight];
      for (const [row, y, sc] of [[0, 420, 0.8], [1, 560, 0.95], [2, 690, 1.05]]) for (let i = 0; i < 6; i++) {
        const x = 70 + i * 165 + (row % 2) * 70 + R() * 20;
        if (row === 0 && i === 4) { k.waterTower(ctx, x, y, 0.9); continue; }
        if (row === 1 && i === 1) { k.factory(ctx, x, y, 190, 110, S.t); continue; }
        if (R() < 0.25) { k.cypress(ctx, x, y, 150 * sc, S.t, i); continue; }
        k.house(ctx, x, y, 92 * sc, 78 * sc, { wall: walls[Math.floor(R() * walls.length)], roof: R() < 0.5 ? P.vermDark : P.lapis, pattern: R() < 0.4 ? 'dots' : null, chimney: R() < 0.5 });
      }
      k.blossomTree(ctx, 120, 1040, 300, S.t, 2);
      k.blossomTree(ctx, 840, 1050, 260, S.t, 6, P.white);
      const at = S.at('Hawthorne');
      k.label(ctx, 'HAWTHORNE', W / 2, 360, 34, tween(u, at, at + 0.3));
      k.seal(ctx, 790, 930, 78, ' NEW JERSEY · U.S.A. ·', '1957', tween(u, S.at('Jersey'), S.at('Jersey') + 0.35, ease.linear));
    },
  },
  { // 4.6 "Two engineers, Alfred Fielding and Marc Chavannes,"
    start: 4.55, title: 'Two Engineers', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      S.cam(lerp(1.0, 1.1, tween(u, 0, 3.3)), W / 2, 560);
      interior(ctx, S, { window: true, carpetColor: P.lapis });
      // workbench with instruments (after the 1581 Istanbul observatory painting)
      k.rect(ctx, 300, 700, 340, 22, P.brownLight, P.ink, 2);
      for (const lx of [320, 600]) k.rect(ctx, lx, 720, 18, 110, P.brown, P.ink, 1.5);
      k.circle(ctx, 360, 670, 30, P.turqLight, P.ink, 2); ctx.beginPath(); ctx.moveTo(330, 670); ctx.lineTo(390, 670); ctx.moveTo(360, 640); ctx.lineTo(360, 700); k.stroke(ctx, P.ink, 1.2);
      k.rect(ctx, 420, 676, 150, 24, P.paperLight, P.ink, 1.5);
      for (let i = 0; i < 3; i++) k.bubble(ctx, 450 + i * 40, 650 - Math.abs(Math.sin(u * 3 + i)) * 20, 12);
      const aA = S.at('Alfred'), aM = S.at('Marc');
      k.figure(ctx, 230, 980, { ...ENG.fielding, s: 1.25, face: 1, mood: 'happy', hold: dividers, armF: [1.0 + Math.sin(u * 2) * 0.1, 0.9], look: tween(u, aA, aA + 0.3) * 0.5 });
      k.figure(ctx, 720, 990, { ...ENG.chavannes, s: 1.25, face: -1, mood: 'happy', hold: scroll, armF: [0.7, 1.2 + Math.sin(u * 2.5) * 0.15] });
      k.label(ctx, 'ALFRED FIELDING', 230, 560, 26, tween(u, aA, aA + 0.3));
      k.label(ctx, 'MARC CHAVANNES', 720, 560, 26, tween(u, aM, aM + 0.3));
    },
  },
  { // 7.9 "heat-sealed two plastic shower curtains together."
    start: 7.8, title: 'The Sealing', trans: 'wipe',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      interior(ctx, S, { arches: 3, carpet: false });
      const meet = tween(u, 0.3, S.at('curtains') + 0.3, ease.inOut);
      const gap = lerp(330, 0, meet);
      k.curtain(ctx, W / 2 - 300 - gap, 170, 300, 560, S.t, 'rgba(110,190,205,0.6)', P.verm);
      k.curtain(ctx, W / 2 + gap, 170, 300, 560, S.t + 1, 'rgba(235,170,160,0.55)', P.lapis);
      ctx.beginPath(); ctx.moveTo(W / 2 - 640, 160); ctx.lineTo(W / 2 + 640, 160); k.stroke(ctx, P.goldDark, 6);
      // the heated press comes down at "together"
      const tg = S.at('together'), drop = tween(u, tg - 0.35, tg, ease.inCubic) - tween(u, tg + 0.6, tg + 1.0) * 0.6;
      const py = lerp(-180, 330, drop);
      const hot = tween(u, tg, tg + 0.15) * (1 - tween(u, tg + 0.9, tg + 1.6));
      ctx.save(); ctx.translate(W / 2, py + shake(u, tg, 6, 0.4));
      k.rect(ctx, -12, -400, 24, 360, P.steel, P.ink, 2);
      k.rect(ctx, -60, -60, 120, 70, P.steel, P.ink, 2.5);
      k.rect(ctx, -26, 10, 52, 400, hot > 0 ? `rgb(${200 + 55 * hot},${90 - 40 * hot},40)` : P.grey, P.ink, 2.5);
      if (hot > 0) { const g = ctx.createRadialGradient(0, 200, 10, 0, 200, 220); g.addColorStop(0, `rgba(255,120,40,${0.5 * hot})`); g.addColorStop(1, 'rgba(255,120,40,0)'); ctx.fillStyle = g; ctx.fillRect(-220, 0, 440, 420); }
      ctx.restore();
      // steam
      if (u > tg) for (let i = 0; i < 5; i++) { const kk = (u - tg) * 0.8 + i * 0.2; if (kk > 1.2) continue; ctx.save(); ctx.globalAlpha = clamp(1.2 - kk); k.cloud(ctx, W / 2 + (i - 2) * 70, 300 - kk * 220, 0.5 + kk * 0.4, i + 9, P.white, P.grey); ctx.restore(); }
      // the seam: a gold stitched line once sealed
      if (u > tg + 0.1) { ctx.save(); ctx.setLineDash([12, 8]); ctx.beginPath(); ctx.moveTo(W / 2, 180); ctx.lineTo(W / 2, 730); k.stroke(ctx, P.gold, 5); ctx.restore(); }
      const engPose = Math.sin(u * 3) * 0.1;
      k.figure(ctx, 110, 1010, { ...ENG.fielding, s: 1.0, face: 1, armF: [1.6 + engPose, 0.2], mood: u > tg ? 'happy' : 'calm' });
      k.figure(ctx, 830, 1010, { ...ENG.chavannes, s: 1.0, face: -1, armF: [1.6 - engPose, 0.2], mood: u > tg ? 'happy' : 'calm' });
    },
  },
  { // 11.1 "Air gets trapped inside. Tiny bubbles."
    start: 11.0, title: 'Air, Trapped', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const tiny = S.at('Tiny');
      S.cam(lerp(1, 1.55, tween(u, tiny - 0.1, tiny + 0.7, ease.inOut)), lerp(W / 2, 560, tween(u, tiny - 0.1, tiny + 0.7)), lerp(H / 2, 640, tween(u, tiny - 0.1, tiny + 0.7)));
      land(ctx, S, { horizon: 380, seed: 8, clouds: 1 });
      // the wind spirit
      const wx = 170, wy = 250 + Math.sin(u * 2) * 10;
      k.cloud(ctx, wx + 40, wy, 1.6, 4);
      k.circle(ctx, wx - 30, wy + 5, 46, P.white, P.lapis, 2.5);
      ctx.beginPath(); ctx.arc(wx - 46, wy - 6, 7, Math.PI * 1.1, Math.PI * 1.9); ctx.moveTo(wx - 18, wy - 6); ctx.arc(wx - 25, wy - 6, 7, Math.PI * 1.1, Math.PI * 1.9); k.stroke(ctx, P.ink, 2);
      k.circle(ctx, wx - 50, wy + 18, 9, P.pink, null); k.circle(ctx, wx - 6, wy + 18, 9, P.pink, null);
      k.circle(ctx, wx - 28, wy + 26, 7 + Math.sin(u * 8) * 2, P.vermDark, P.ink, 1.5);
      // streams of air into the sheet
      ctx.save(); ctx.setLineDash([40, 26]); ctx.lineDashOffset = -u * 260;
      for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(wx - 10, wy + 30); ctx.bezierCurveTo(300, wy + 60 + i * 60, 260, 520 + i * 40, 360 + i * 30, 560 + i * 50); k.stroke(ctx, 'rgba(255,255,255,0.9)', 5); }
      ctx.restore();
      // the sealed sheet — billowing, then bubbles appear
      const x0 = 300, y0 = 470, w = 560, h = 380;
      ctx.save(); ctx.translate(0, Math.sin(u * 3) * 6);
      ctx.beginPath(); ctx.moveTo(x0, y0);
      for (let i = 0; i <= 10; i++) ctx.lineTo(x0 + i * w / 10, y0 + Math.sin(u * 4 + i) * 10 * (1 - tween(u, tiny, tiny + 0.4)));
      ctx.lineTo(x0 + w, y0 + h); ctx.lineTo(x0, y0 + h); ctx.closePath();
      ctx.fillStyle = 'rgba(200,232,240,0.6)'; ctx.fill(); k.stroke(ctx, P.ink, 2);
      k.bubbleSheet(ctx, x0, y0, w, h, 20, { tint: 'rgba(0,0,0,0)', appear: (i, j) => tween(u, tiny + i * 0.035 + j * 0.02, tiny + 0.18 + i * 0.035 + j * 0.02, ease.outBack) });
      ctx.restore();
      k.figure(ctx, 790, 1040, { ...ENG.fielding, s: 0.9, face: -1, armF: [2.6, 0.3 * Math.sin(u * 5)], mood: u > tiny ? 'happy' : 'calm' });
    },
  },
  { // 14.8 "Their big idea? Textured wallpaper."
    start: 14.6, title: 'Idea I · Wallpaper', trans: 'wipe',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const idea = S.at('idea'), tex = S.at('Textured');
      S.cam(lerp(1.08, 1.0, tween(u, 0, 3)), W / 2, 540);
      interior(ctx, S, { paper: i => tween(u, tex - 0.2 + i * 0.25, tex + 0.6 + i * 0.25) });
      lamp(ctx, S, W / 2, 270, tween(u, idea, idea + 0.3));
      if (u > idea) { const sc = pop(u, idea, 0.4); ctx.save(); ctx.translate(W / 2, 410); ctx.scale(sc, sc); k.circle(ctx, 0, 0, 54, P.lapis, P.goldLight, 5); ctx.fillStyle = P.goldLight; ctx.font = '900 70px Deco'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', 0, 6); ctx.restore(); }
      k.figure(ctx, 200, 1000, { ...ENG.fielding, s: 1.15, face: 1, mood: 'happy', armF: [2.2, 0.4], hold: rollHeld });
      k.figure(ctx, 760, 1000, { ...ENG.chavannes, s: 1.15, face: -1, mood: 'happy', armF: [1.3 + Math.sin(u * 3) * 0.15, 0.5] });
    },
  },
  { // 17.9 "Nobody bought it."
    start: 17.8, title: 'Nobody Bought It', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      land(ctx, S, { horizon: 300, seed: 12, clouds: 2 });
      // bazaar stall
      k.rect(ctx, 250, 470, 440, 330, P.brownLight, P.ink, 2.5);
      k.canopy(ctx, 470, 430, 480, 120, P.verm, S.t);
      for (let i = 0; i < 6; i++) { ctx.save(); ctx.translate(300 + i * 68, 640); k.rect(ctx, -26, -110, 52, 150, '#bfe0e4', P.ink, 1.8); ctx.fillStyle = k.pattern(ctx, 'bubbles', '#bfe0e4', 'rgba(110,170,190,0.9)', 26); ctx.fillRect(-24, -108, 48, 146); ctx.restore(); }
      k.rect(ctx, 230, 690, 480, 40, P.ochre, P.ink, 2);
      k.label(ctx, 'WALLPAPER', 470, 715, 22, 1, P.paperLight);
      k.figure(ctx, 470, 700, { ...ENG.chavannes, s: 0.85, face: 1, mood: 'sad', armF: [0.5, 0.5] });
      // passers-by walk past without a glance
      for (let i = 0; i < 3; i++) {
        const x = lerp(-120 - i * 220, 1100 - i * 220, u / 2.2);
        k.figure(ctx, x, 1010 - i * 20, { s: 0.95, face: 1, robe: [P.green, P.lav, P.ochre][i], robeP: ['dots', 'stripes', 'flowers'][i], hat: i === 1 ? 'fez' : 'turban', hatColor: P.lapis, beard: i ? 'short' : 'none', walk: u * 9 + i, armF: [Math.sin(u * 9 + i) * 0.4, 0.3], look: -0.4 });
      }
      // dust + a lone crow
      ctx.save(); ctx.translate(lerp(860, 600, u / 1.5), 200 + Math.sin(u * 7) * 10); ctx.beginPath(); ctx.moveTo(-26, 0); ctx.quadraticCurveTo(-10, -18 * Math.sin(u * 14), 0, 0); ctx.quadraticCurveTo(10, -18 * Math.sin(u * 14), 26, 0); k.stroke(ctx, P.ink, 3); ctx.restore();
    },
  },
  { // 19.2 "So they tried again. Greenhouse insulation."
    start: 19.1, title: 'Idea II · Greenhouses', trans: 'iris',
    draw(ctx, u, S) { greenhouse(ctx, u, S, false); },
  },
  { // 22.7 "That flopped too."
    start: 22.55, title: 'It Flopped', trans: 'cut',
    draw(ctx, u, S) { greenhouse(ctx, u, S, true); },
  },
  { // 24.4 "Most people would quit here. They didn't."
    start: 24.25, title: 'The Crossroads', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const didnt = S.at('They'), dawn = tween(u, didnt - 0.15, didnt + 0.5, ease.outCubic);
      S.cam(lerp(1.0, 1.12, tween(u, 0, didnt)) - dawn * 0.1, W / 2, lerp(560, 600, dawn));
      land(ctx, S, { horizon: 380, seed: 15, night: true, clouds: 2, hillColors: ['#5a5f8a', '#6a5a7a', '#4e6a5a'], ground: '#5d6e48' });
      // dawn: gold sky washes over the night
      if (dawn > 0) {
        ctx.save(); ctx.globalAlpha = dawn; k.goldSky(ctx, 0, 0, W, 460, S.t); ctx.restore();
        k.sun(ctx, W / 2, lerp(520, 210, dawn), 70, S.t, true);
        k.hills(ctx, W, 290, 15, [P.lav, P.rose, P.sageLight]);
        ctx.save(); ctx.globalAlpha = dawn; ctx.fillStyle = P.sage; ctx.fillRect(0, 380, W, H); ctx.restore();
      } else k.moon(ctx, 760, 150, 46);
      // the road that splits
      ctx.beginPath(); ctx.moveTo(380, H); ctx.quadraticCurveTo(470, 620, 460, 420); ctx.lineTo(500, 420); ctx.quadraticCurveTo(520, 620, 620, H); ctx.closePath(); k.fillStroke(ctx, dawn > 0.5 ? P.ochreLight : '#8a7a5a', P.ink, 2);
      // quitters wandering off
      for (let i = 0; i < 4; i++) {
        const x = lerp(400 - i * 30, -150 - i * 60, clamp(u / 2.4)), y = 600 + i * 70;
        if (x > -100) k.figure(ctx, x, y, { s: 0.55 + i * 0.07, face: -1, robe: ['#5d5a7a', '#6b5b4a', '#4e5d6a', '#7a5a5a'][i], hat: 'turban', mood: 'sad', walk: u * 8 + i, look: 0.6, armF: [0.1, 0.2] });
      }
      k.cypress(ctx, 760, 1000, 380, S.t, 4);
      // our two engineers: slumped, then standing at "They didn't."
      const up = dawn;
      k.figure(ctx, 640, 1010, { ...ENG.fielding, s: 0.95, face: -1, kneel: up < 0.5, mood: up > 0.3 ? 'happy' : 'sad', look: up > 0.5 ? -0.2 : 0.8, armF: up > 0.5 ? [2.8, 0.1] : [0.2, 0.9] });
      k.figure(ctx, 850, 1020, { ...ENG.chavannes, s: 0.95, face: -1, kneel: up < 0.5, mood: up > 0.3 ? 'happy' : 'sad', look: up > 0.5 ? -0.2 : 0.8, armF: up > 0.5 ? [2.6, 0.2] : [0.3, 1.0] });
      if (up > 0) for (let i = 0; i < 14; i++) { const a = i / 14 * TAU, r = 60 + up * 380; k.star(ctx, W / 2 + Math.cos(a) * r, 210 + Math.sin(a) * r * 0.7, 10, 1 - up * 0.6); }
    },
  },
  { // 27.5 "They started a company."
    start: 27.35, title: 'A Company', trans: 'flash',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      S.cam(lerp(1.0, 1.08, tween(u, 0, 1.6)), W / 2, 560);
      land(ctx, S, { horizon: 300, seed: 18, clouds: 2 });
      k.factory(ctx, 470, 640, 520, 260, S.t);
      // banner unfurls
      const bk = tween(u, 0.05, 0.6, ease.outCubic);
      ctx.save(); ctx.beginPath(); ctx.rect(190, 300, 560 * bk, 90); ctx.clip();
      k.cartouche(ctx, 470, 345, 540, 80, P.lapis, P.goldLight, 4);
      ctx.fillStyle = P.goldLight; ctx.font = '900 40px Deco'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('EST. 1960', 470, 348);
      ctx.restore();
      // the bubble machine rolling out a ribbon
      const R = 40, rot = u * 6;
      for (const rx of [300, 400]) { k.circle(ctx, rx, 760, R, P.steel, P.ink, 2.5); for (let s = 0; s < 4; s++) { const a = rot + s * Math.PI / 2; ctx.beginPath(); ctx.moveTo(rx, 760); ctx.lineTo(rx + Math.cos(a) * R, 760 + Math.sin(a) * R); k.stroke(ctx, P.ink, 2); } }
      ctx.save(); ctx.beginPath(); ctx.rect(400, 720, 600, 80); ctx.clip();
      k.bubbleSheet(ctx, 400 - ((u * 120) % 46), 722, 640, 76, 14); ctx.restore();
      for (let i = 0; i < 3; i++) k.figure(ctx, 200 + i * 260 + Math.sin(u * 3 + i) * 10, 1020, { s: 0.85, face: i % 2 ? -1 : 1, robe: [P.green, P.lapis, P.verm][i], robeP: 'dots', hat: 'cap', hatColor: P.ochre, armF: [2.0 + Math.sin(u * 6 + i) * 0.4, 0.4], hold: i === 1 ? rollHeld : null, mood: 'happy', walk: u * 6 + i });
    },
  },
  { // 29.1 "Sealed Air."
    start: 28.95, title: 'Sealed Air', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      ctx.fillStyle = P.paperLight; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = k.pattern(ctx, 'flowers', P.paperLight, '#e6d6ad', 40); ctx.fillRect(0, 0, W, H);
      // a tughra (imperial monogram) written stroke by stroke
      const wk = s => tween(u, s, s + 0.45, ease.inOut);
      ctx.save(); ctx.translate(W / 2 - 40, 520 + shake(u, S.at('Air'), 8, 0.4));
      const strokes = [
        [c => { c.moveTo(-40, 120); c.lineTo(-40, -330); }, 460, 0.0],
        [c => { c.moveTo(10, 120); c.lineTo(10, -350); }, 480, 0.08],
        [c => { c.moveTo(60, 120); c.lineTo(60, -320); }, 450, 0.16],
        [c => { c.moveTo(-40, -250); c.bezierCurveTo(30, -280, 60, -230, 150, -260); }, 220, 0.25],
        [c => { c.moveTo(10, -270); c.bezierCurveTo(80, -300, 110, -250, 200, -280); }, 220, 0.3],
        [c => { c.moveTo(60, 60); c.bezierCurveTo(-120, -60, -330, 40, -280, 150); c.bezierCurveTo(-230, 260, -40, 200, 60, 120); }, 820, 0.35],
        [c => { c.moveTo(40, 80); c.bezierCurveTo(-90, 0, -230, 60, -200, 130); c.bezierCurveTo(-170, 200, -40, 170, 40, 110); }, 560, 0.45],
        [c => { c.moveTo(70, 120); c.bezierCurveTo(200, 140, 300, 60, 380, 120); }, 340, 0.55],
        [c => { c.moveTo(70, 160); c.bezierCurveTo(200, 180, 320, 100, 400, 170); }, 360, 0.6],
      ];
      for (const [b, len, s] of strokes) { k.writeStroke(ctx, b, wk(s), len, P.ink, 26); k.writeStroke(ctx, b, wk(s), len, P.lapis, 18); k.writeStroke(ctx, b, wk(s), len, P.goldLight, 4); }
      // the "sere" base with the name
      const nk = tween(u, 0.5, 0.9);
      ctx.globalAlpha = nk; ctx.fillStyle = P.verm; ctx.font = '900 70px Deco'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('SEALED AIR', 40, 285);
      ctx.restore();
      k.seal(ctx, 790, 965, 82, ' SEALED AIR CORPORATION · 1960 ·', 'SEALED\nAIR', tween(u, S.at('Air') - 0.05, S.at('Air') + 0.3, ease.linear));
      for (let i = 0; i < 12; i++) { const y = 1000 - ((u * 120 + i * 80) % 1000); k.bubble(ctx, 60 + (i * 79) % 820, y, 8 + (i % 3) * 5, 0.8); }
    },
  },
  { // 30.7 "Then a marketer on their team spotted a problem."
    start: 30.55, title: 'A Problem Spotted', trans: 'wipe',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      land(ctx, S, { horizon: 520, seed: 21, clouds: 3 });
      k.waves(ctx, 0, 620, W, 180, S.t, P.water, P.waterLight, 20, 24);
      // a Galata-like tower
      ctx.save(); ctx.translate(250, 1060);
      k.rect(ctx, -90, -620, 180, 620, P.paperDark, P.ink, 2.5);
      ctx.fillStyle = k.pattern(ctx, 'scales', P.paperDark, '#bda675', 30); ctx.fillRect(-88, -618, 176, 616);
      for (let j = 0; j < 4; j++) k.arch(ctx, 0, -110 - j * 130, 30, 60, P.lapis);
      k.rect(ctx, -120, -640, 240, 26, P.ochre, P.ink, 2);
      ctx.beginPath(); ctx.moveTo(-100, -640); ctx.lineTo(0, -820); ctx.lineTo(100, -640); ctx.closePath(); k.fillStroke(ctx, P.lapis, P.ink, 2.5);
      ctx.restore();
      const sp = S.at('spotted'), prob = S.at('problem');
      k.figure(ctx, 270, 420, { s: 0.85, face: 1, robe: P.ochre, robeP: 'cintamani', robePc: P.vermDark, inner: P.white, hat: 'fez', mustache: true, armF: [2.1, -0.2], hold: spyglass, mood: u > prob ? 'sad' : 'calm' });
      k.label(ctx, 'THE MARKETER', 250, 160, 22, tween(u, 0.2, 0.5));
      // the spyglass view
      const v = tween(u, sp - 0.15, sp + 0.25, ease.outBack);
      if (v > 0) {
        ctx.save(); ctx.translate(680, 330); ctx.scale(v, v);
        ctx.beginPath(); ctx.arc(0, 0, 200, 0, TAU); ctx.save(); ctx.clip();
        ctx.fillStyle = P.paperLight; ctx.fillRect(-200, -200, 400, 400);
        k.ibm1401(ctx, 0, 110, 0.75, S.t, tween(u, prob, prob + 0.4) * 0.6);
        ctx.restore();
        ctx.beginPath(); ctx.arc(0, 0, 200, 0, TAU); k.stroke(ctx, P.goldDark, 14); k.stroke(ctx, P.ink, 2);
        ctx.restore();
      }
      if (u > prob) { const s = pop(u, prob, 0.3); ctx.save(); ctx.translate(840, 560); ctx.scale(s, s); k.circle(ctx, 0, 0, 52, P.verm, P.goldLight, 5); ctx.fillStyle = P.paperLight; ctx.font = '900 76px Deco'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('!', 0, 6); ctx.restore(); }
    },
  },
  { // 33.7 "IBM was about to ship its new 1401 computer."
    start: 33.6, title: 'IBM 1401 · 1959', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const sx = lerp(-260, W / 2 + 20, tween(u, 0, 2.2, ease.outCubic));
      S.cam(lerp(1.0, 1.1, tween(u, 2, 4)), W / 2, 560);
      land(ctx, S, { horizon: 330, seed: 26, clouds: 3 });
      // harbour town with domes on the far shore
      for (let i = 0; i < 5; i++) { k.house(ctx, 80 + i * 200, 420, 110, 80, { wall: [P.white, P.pink, P.ochreLight][i % 3], roof: P.lapis }); if (i % 2) k.dome(ctx, 180 + i * 200, 420, 34); }
      k.waves(ctx, 0, 470, W, H - 470, S.t, P.water, P.waterLight, 26, 30);
      const rock = Math.sin(u * 1.6) * 0.03;
      k.galley(ctx, sx, 800, 1.35, S.t, c => { k.ibm1401(c, 10, -20, 0.42, S.t); }, rock);
      const n = S.at('1401');
      k.label(ctx, 'IBM 1401', W / 2, 330, 34, tween(u, n - 0.1, n + 0.25));
      k.seal(ctx, 160, 200, 64, ' INTERNATIONAL BUSINESS MACHINES ·', '1959', tween(u, n + 0.2, n + 0.5, ease.linear), P.lapis);
    },
  },
  { // 37.9 "And computers were fragile, very fragile."
    start: 37.75, title: 'Fragile', trans: 'flash',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const f1 = S.at('fragile'), f2 = S.at('very');
      const crack = tween(u, f1, f1 + 0.4) * 0.5 + tween(u, f2, f2 + 0.6) * 0.5;
      const sh = shake(u, f1, 12, 0.45) + shake(u, f2, 16, 0.6) + shake(u, f2 + 0.6, 12, 0.5);
      S.cam(lerp(1.0, 1.45, tween(u, 0.3, f2 + 0.3, ease.inOut)), W / 2 + sh, lerp(560, 640, tween(u, 0.3, f2)));
      // storm sky
      ctx.fillStyle = P.lapisDeep; ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 4; i++) { ctx.save(); ctx.globalAlpha = 0.7; k.cloud(ctx, ((i * 300 + S.t * 70) % (W + 300)) - 150, 90 + i * 45, 1.4, i + 30, '#9aa3b8', P.ink); ctx.restore(); }
      for (const lt of [0.15, f1 - 0.05, f2 - 0.05]) { const a = 1 - clamp((u - lt) / 0.25); if (u > lt && a > 0) { ctx.save(); ctx.globalAlpha = a; ctx.beginPath(); let x = 200 + lt * 300 % 500, y = 0; ctx.moveTo(x, y); while (y < 420) { x += (noise1(y * 0.05 + lt * 9) * 60); y += 40; ctx.lineTo(x, y); } k.stroke(ctx, P.goldLight, 7); ctx.fillStyle = 'rgba(255,240,180,0.25)'; ctx.fillRect(0, 0, W, H); ctx.restore(); } }
      k.waves(ctx, 0, 560, W, H - 560, S.t, '#3f5468', P.waterLight, 70, 44);
      const rock = Math.sin(u * 3.2) * 0.09;
      k.galley(ctx, W / 2 + 20, 820 + Math.sin(u * 3.2) * 18, 1.35, S.t, c => { k.ibm1401(c, 10, -20, 0.42, S.t, crack); }, rock);
      // shards flying at each crack
      for (const [ft, sd] of [[f1, 1], [f2, 2], [f2 + 0.55, 3]]) {
        const q = u - ft; if (q < 0 || q > 0.8) continue;
        const R = rng(sd);
        for (let i = 0; i < 8; i++) { const a = R() * TAU, v = 200 + R() * 300; ctx.save(); ctx.globalAlpha = 1 - q / 0.8; ctx.translate(W / 2 + Math.cos(a) * v * q, 700 + Math.sin(a) * v * q + 300 * q * q); ctx.rotate(q * 9 + i); k.poly(ctx, [[0, -9], [8, 5], [-7, 6]], P.steel, P.ink, 1.2); ctx.restore(); }
      }
      ctx.restore(); ctx.save();
      k.stamp(ctx, 'FRAGILE', 300, 300, 64, tween(u, f1, f1 + 0.25, ease.linear), -0.2);
      k.stamp(ctx, 'VERY FRAGILE', 560, 470, 58, tween(u, f2 + 0.55, f2 + 0.8, ease.linear), 0.12);
    },
  },
  { // 41.6 "The bubbles were perfect."
    start: 41.45, title: 'The Perfect Fit', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const perf = S.at('perfect');
      k.goldSky(ctx, 0, 0, W, H, S.t);
      for (let i = 0; i < 4; i++) k.cloud(ctx, 120 + i * 240, 120 + (i % 2) * 70, 1.1, i + 40);
      k.carpet(ctx, 130, 760, 680, 200, P.lapis, P.verm);
      k.ibm1401(ctx, W / 2 + 10, 770, 1.05, S.t, 0);
      // bubble wrap swaddles the machine
      const wrap = tween(u, 0.15, perf - 0.1, ease.inOut);
      ctx.save(); ctx.beginPath(); ctx.rect(150, 470, 640 * wrap, 320); ctx.clip();
      k.bubbleSheet(ctx, 150, 470, 640, 310, 17, { tint: 'rgba(205,232,242,0.5)' });
      ctx.restore();
      if (wrap > 0 && wrap < 1) k.rect(ctx, 150 + 640 * wrap - 9, 460, 18, 340, '#d4ecef', P.ink, 1.5);
      // "perfect": burst of gold stars
      if (u > perf) for (let i = 0; i < 16; i++) { const a = i / 16 * TAU, r = 120 + (u - perf) * 500; k.star(ctx, W / 2 + Math.cos(a) * r, 620 + Math.sin(a) * r * 0.8, 14, 1 - (u - perf) * 0.8); }
      if (u > perf) k.label(ctx, 'A PERFECT FIT', W / 2, 360, 34, tween(u, perf, perf + 0.3));
    },
  },
  { // 44.1 "IBM became their first big customer."
    start: 43.95, title: 'The First Big Customer', trans: 'wipe',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const cust = S.at('customer');
      S.cam(lerp(1.06, 1.0, tween(u, 0, 2.5)), W / 2, 540);
      interior(ctx, S, { window: true, carpetColor: P.verm });
      // the IBM envoy enthroned beneath a canopy
      k.rect(ctx, 330, 700, 280, 60, P.goldDark, P.ink, 2);
      k.canopy(ctx, 470, 330, 330, 370, P.lapis, S.t);
      k.label(ctx, 'IBM', 470, 300, 32, 1, P.goldLight);
      k.figure(ctx, 470, 710, { s: 1.15, face: 1, kneel: true, robe: P.lapisLight, robeP: 'cintamani', robePc: P.goldLight, inner: P.white, hat: 'turban', hatColor: P.lapis, plume: P.verm, beard: 'long', mustache: true, mood: u > cust ? 'happy' : 'calm', armF: [lerp(0.6, 1.7, tween(u, cust - 0.5, cust)), 0.3] });
      // the engineers present a roll on a golden tray
      const step = tween(u, 0, 1.2);
      k.figure(ctx, lerp(80, 200, step), 1010, { ...ENG.fielding, s: 1.1, face: 1, mood: 'happy', armF: [1.6, -0.1], hold: c => { c.rotate(-1.6); k.ellipse(c, 0, -30, 60, 14, 0, P.goldLight, P.ink, 2); k.rect(c, -40, -80, 80, 44, '#bfe0e4', P.ink, 2); c.fillStyle = k.pattern(c, 'bubbles', '#bfe0e4', 'rgba(110,170,190,0.9)', 20); c.fillRect(-38, -78, 76, 40); }, walk: step < 1 ? u * 8 : null });
      k.figure(ctx, lerp(820, 740, step), 1010, { ...ENG.chavannes, s: 1.1, face: -1, mood: 'happy', armF: [2.2, 0.3], walk: step < 1 ? u * 8 : null });
      // a rain of gold coins
      if (u > cust - 0.2) { const R = rng(7); for (let i = 0; i < 40; i++) { const x = R() * W, d = R(), y = -40 + (u - cust + 0.2) * (500 + d * 500) - d * 300; if (y < -30 || y > H) continue; k.ellipse(ctx, x, y, 14, 14 * Math.abs(Math.cos(u * 8 + i)), 0, P.goldLight, P.goldDeep, 1.5); } }
    },
  },
  { // 46.8 "Today you know it as bubble wrap, a failed wallpaper"
    start: 46.7, title: 'Today', trans: 'flash',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const bw = S.at('bubble'), fw = S.at('failed');
      ctx.fillStyle = P.paperLight; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = k.pattern(ctx, 'tiles', P.white, P.lapisLight, 70); ctx.fillRect(0, 0, W, H);
      // big sheet, popped one by one by a finger
      const r = 40, step = r * 2.3;
      const pops = []; const R = rng(31);
      for (let i = 0; i < 12; i++) pops.push([1 + Math.floor(R() * 7), 1 + Math.floor(R() * 9), 0.15 + i * 0.34]);
      const popped = (i, j) => pops.some(([a, b, tt]) => a === i && b === j && u > tt);
      k.bubbleSheet(ctx, 30, 30, W - 60, H - 60, r, { popped, tint: 'rgba(205,232,242,0.55)' });
      // the hand moves to the next bubble
      const ni = pops.findIndex(p => p[2] > u), cur = pops[Math.max(0, ni < 0 ? pops.length - 1 : ni)];
      const prev = pops[Math.max(0, (ni < 0 ? pops.length : ni) - 1)];
      const pos = p => [30 + r * 1.3 + p[0] * step + (p[1] % 2) * step / 2, 30 + r * 1.3 + p[1] * step * 0.87];
      const segK = ni <= 0 ? 1 : tween(u, prev[2], cur[2] - 0.08, ease.inOut);
      const [ax, ay] = pos(prev), [bx, by] = pos(cur);
      const press = ni < 0 ? 0 : Math.max(0, 1 - Math.abs(u - cur[2]) / 0.08);
      const hx = lerp(ax, bx, segK), hy = lerp(ay, by, segK) - 30 * (1 - press) - Math.sin(segK * Math.PI) * 50;
      ctx.save(); ctx.translate(hx, hy); ctx.rotate(-0.5);
      k.rect(ctx, -11, -10, 22, 70, P.skin, P.ink, 2); k.ellipse(ctx, 0, 100, 46, 56, 0, P.skin, P.ink, 2);
      k.rect(ctx, -50, 140, 100, 300, P.lapis, P.ink, 2.5); k.rect(ctx, -52, 140, 104, 24, P.goldLight, P.ink, 2);
      ctx.restore();
      // the title
      const tk = tween(u, bw - 0.05, bw + 0.35, ease.outBack);
      if (tk > 0) {
        ctx.save(); ctx.translate(W / 2, 470); ctx.scale(tk, tk);
        k.cartouche(ctx, 0, 0, 780, 190, P.lapis, P.goldLight, 6);
        ctx.font = '900 104px Deco'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.lineWidth = 10; ctx.strokeStyle = P.ink; ctx.strokeText('BUBBLE WRAP', 0, 8);
        const g = ctx.createLinearGradient(0, -50, 0, 60); g.addColorStop(0, P.goldLight); g.addColorStop(1, P.ochre);
        ctx.fillStyle = g; ctx.fillText('BUBBLE WRAP', 0, 8);
        ctx.restore();
      }
      const fk = tween(u, fw - 0.05, fw + 0.3);
      if (fk > 0) {
        k.label(ctx, 'ONCE A FAILED WALLPAPER', W / 2, 640, 30, fk);
      }
    },
  },
  { // 51.1 "that now protects packages all over the world."
    start: 50.95, title: 'All Over the World', trans: 'unroll',
    draw(ctx, u, S) { worldMap(ctx, u, S); },
  },
  { // 54.5 "Every legend has a beginning."
    start: 54.4, title: 'Every Legend Has a Beginning', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const beg = S.at('beginning');
      // the first bubble, between the two inventors
      ctx.save();
      S.cam(lerp(1.0, 1.35, tween(u, 0, beg)), W / 2, lerp(560, 520, tween(u, 0, beg)));
      interior(ctx, S, { window: true, carpetColor: P.lapis });
      k.figure(ctx, 250, 990, { ...ENG.fielding, s: 1.2, face: 1, mood: 'happy', armF: [1.9, 0.5] });
      k.figure(ctx, 690, 990, { ...ENG.chavannes, s: 1.2, face: -1, mood: 'happy', armF: [1.9, 0.5] });
      const by = lerp(640, 520, tween(u, 0, beg));
      const glow = ctx.createRadialGradient(W / 2, by, 10, W / 2, by, 160); glow.addColorStop(0, 'rgba(255,240,170,0.8)'); glow.addColorStop(1, 'rgba(255,240,170,0)');
      ctx.fillStyle = glow; ctx.fillRect(W / 2 - 170, by - 170, 340, 340);
      k.bubble(ctx, W / 2, by, 46 + Math.sin(u * 4) * 3);
      ctx.restore();
      // …the bubble grows into the cover of the book: the chronicle closes
      const open = tween(u, beg - 0.1, beg + 0.55, ease.inOut);
      if (open > 0) {
        ctx.save(); ctx.beginPath(); ctx.arc(W / 2, 520, open * 900, 0, TAU); ctx.clip();
        bookCover(ctx, S, u - beg);
        ctx.restore();
        if (open < 1) { ctx.beginPath(); ctx.arc(W / 2, 520, open * 900, 0, TAU); k.stroke(ctx, P.goldLight, 8); }
      }
    },
  },
];

// ---------- multi-use scenes ----------
function greenhouse(ctx, u, S, flop) {
  const { k, P, W, H } = S;
  const fl = flop ? S.at('flopped') : 99, gh = flop ? -9 : S.at('Greenhouse');
  const dim = flop ? tween(u, fl - 0.1, fl + 0.6) : 0;
  S.cam(flop ? lerp(1.0, 1.08, tween(u, 0, 1.6)) : lerp(1.12, 1.0, tween(u, 0, 3)), W / 2, 560 + shake(u, fl + 0.2, 6, 0.4));
  land(ctx, S, { horizon: 330, seed: 9, clouds: 2 });
  // a raincloud for the flop
  if (dim > 0) { ctx.save(); ctx.fillStyle = `rgba(40,50,80,${0.35 * dim})`; ctx.fillRect(0, 0, W, H); ctx.restore(); ctx.save(); ctx.globalAlpha = dim; k.cloud(ctx, W / 2 - 60, 140, 2.2, 77, '#9aa3b8', P.ink); ctx.strokeStyle = 'rgba(200,220,240,0.8)'; ctx.lineWidth = 2; for (let i = 0; i < 30; i++) { const x = 220 + (i * 37) % 520, y = 200 + ((u * 600 + i * 53) % 500); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 6, y + 22); ctx.stroke(); } ctx.restore(); }
  // the glass pavilion
  ctx.save(); ctx.translate(W / 2, 760);
  k.rect(ctx, -230, -260, 460, 260, 'rgba(200,235,240,0.55)', P.ink, 3);
  for (let i = 1; i < 6; i++) { ctx.beginPath(); ctx.moveTo(-230 + i * 460 / 6, -260); ctx.lineTo(-230 + i * 460 / 6, 0); k.stroke(ctx, P.goldDark, 3); }
  ctx.beginPath(); ctx.moveTo(-230, -130); ctx.lineTo(230, -130); k.stroke(ctx, P.goldDark, 3);
  ctx.beginPath(); ctx.moveTo(-250, -260); ctx.quadraticCurveTo(0, -470, 250, -260); ctx.closePath(); k.fillStroke(ctx, 'rgba(200,235,240,0.6)', P.ink, 3);
  ctx.beginPath(); ctx.moveTo(0, -365); ctx.lineTo(0, -420); k.stroke(ctx, P.goldDark, 4); k.circle(ctx, 0, -426, 8, P.goldLight, P.ink, 1.5);
  // the bubble insulation, draped on at "Greenhouse" and sliding off at "flopped"
  const on = flop ? 1 : tween(u, gh - 0.2, gh + 0.5, ease.outBounce);
  const slide = flop ? tween(u, fl, fl + 0.9, ease.inCubic) : 0;
  if (on > 0) {
    ctx.save(); ctx.translate(slide * 80, lerp(-500, 0, on) + slide * 340); ctx.rotate(slide * 0.35);
    ctx.globalAlpha = 1 - slide * 0.3;
    k.bubbleSheet(ctx, -245, -300, 490, 300 * (1 - slide * 0.4), 15, { tint: 'rgba(205,232,242,0.55)' });
    ctx.restore();
  }
  ctx.restore();
  // tulip beds
  const wilt = flop ? tween(u, fl + 0.1, fl + 0.9) : 0;
  for (let i = 0; i < 9; i++) k.tulip(ctx, 90 + i * 95, 900 + (i % 2) * 40, 1.1, [P.verm, P.ochre, P.pink][i % 3], wilt, S.t);
  k.figure(ctx, 110, 1040, { ...ENG.fielding, s: 0.95, face: 1, mood: flop ? (u > fl ? 'sad' : 'calm') : 'happy', armF: flop ? [0.2, 0.2] : [2.4 + Math.sin(u * 4) * 0.2, 0.2], look: flop && u > fl ? 0.7 : 0 });
  k.figure(ctx, 840, 1040, { ...ENG.chavannes, s: 0.95, face: -1, mood: flop ? (u > fl ? 'sad' : 'calm') : 'happy', armF: flop ? [0.1, 0.3] : [1.4, 0.5], look: flop && u > fl ? 0.7 : 0 });
  if (!flop) k.sun(ctx, 820, 150, 50, S.t);
}

function compassRose(ctx, k, P, x, y, r, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  // rhumb lines
  ctx.globalAlpha = 0.45;
  for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * 1400, Math.sin(a) * 1400); k.stroke(ctx, [P.verm, P.green, P.ink, P.lapis][i % 4], 1.2); }
  ctx.globalAlpha = 1;
  for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, L = i % 2 ? r * 0.6 : r; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a - 0.2) * L * 0.3, Math.sin(a - 0.2) * L * 0.3); ctx.lineTo(Math.cos(a) * L, Math.sin(a) * L); ctx.closePath(); k.fillStroke(ctx, i % 2 ? P.lapis : P.verm, P.ink, 1.2); }
  k.circle(ctx, 0, 0, r * 0.18, P.goldLight, P.ink, 1.5);
  ctx.restore();
}
function worldMap(ctx, u, S) {
  const { k, P, W, H } = S;
  const pk = S.at('packages'), wd = S.at('world');
  S.cam(lerp(1.15, 1.0, tween(u, 0, 3.2)), W / 2, 540);
  ctx.fillStyle = '#efdcb0'; ctx.fillRect(-100, -100, W + 200, H + 200);
  compassRose(ctx, k, P, W / 2, 540, 90, u * 0.05);
  compassRose(ctx, k, P, 170, 900, 50);
  compassRose(ctx, k, P, 800, 170, 50);
  // stylised coasts, after Piri Reis's 1513 chart
  const land1 = [[60, 120], [260, 90], [380, 160], [330, 260], [400, 320], [310, 420], [250, 470], [300, 560], [380, 640], [340, 800], [260, 960], [200, 1000], [180, 820], [120, 640], [150, 520], [90, 400], [40, 260]];
  const land2 = [[620, 60], [900, 50], [920, 220], [860, 300], [900, 360], [940, 520], [880, 760], [760, 900], [700, 760], [620, 560], [600, 440], [660, 380], [600, 300], [640, 200]];
  for (const pts of [land1, land2]) { ctx.beginPath(); k.smoothPath(ctx, pts); k.fillStroke(ctx, '#cdb57a', P.ink, 2.5); ctx.save(); ctx.clip(); ctx.fillStyle = k.pattern(ctx, 'dots', '#cdb57a', '#b39a5e', 26); ctx.fillRect(0, 0, W, H); ctx.restore(); }
  for (const [x, y, s] of [[180, 230, 0.4], [230, 700, 0.45], [780, 140, 0.4], [770, 600, 0.45], [120, 380, 0.35]]) k.spongy(ctx, x, y, 120 * s * 2, 90 * s * 2, P.rose, x);
  for (const [x, y] of [[300, 300], [720, 280], [800, 450]]) { k.house(ctx, x, y, 40, 34, { wall: P.white, roof: P.verm }); }
  for (const [x, y] of [[200, 560], [700, 680], [840, 240]]) k.cypress(ctx, x, y, 70, S.t, x);
  k.label(ctx, 'NEW JERSEY', 300, 250, 18, 1);
  // routes from New Jersey to everywhere
  const home = [320, 300];
  const dests = [[760, 220], [820, 520], [740, 820], [250, 900], [160, 160], [880, 700], [520, 980], [560, 120]];
  dests.forEach(([dx, dy], i) => {
    const st = 0.2 + i * 0.18, rk = tween(u, st, st + 0.8, ease.inOut);
    const cx = (home[0] + dx) / 2 + (i % 2 ? 120 : -120), cy = (home[1] + dy) / 2 - 80;
    ctx.save(); ctx.setLineDash([10, 9]);
    const len = 900; ctx.setLineDash([10, 9]);
    ctx.beginPath(); ctx.moveTo(home[0], home[1]); ctx.quadraticCurveTo(cx, cy, dx, dy);
    ctx.save(); ctx.setLineDash([len * rk, len]); k.stroke(ctx, P.verm, 3.5); ctx.restore();
    ctx.restore();
    // tiny galley riding the route
    const q = rk; const bx = (1 - q) * (1 - q) * home[0] + 2 * (1 - q) * q * cx + q * q * dx, by = (1 - q) * (1 - q) * home[1] + 2 * (1 - q) * q * cy + q * q * dy;
    if (rk > 0 && rk < 1) k.galley(ctx, bx, by, 0.16, S.t);
    const arrive = Math.max(pk, st + 0.8) + i * 0.06;
    const pp = pop(u, arrive, 0.35);
    if (pp > 0) k.parcel(ctx, dx, dy, 56 * pp, 44 * pp, 1, [P.ochre, P.verm, P.lapisLight][i % 3], Math.sin(i) * 0.2);
  });
  // a sea creature, as every good old chart has
  const fx = lerp(980, -120, (u / 3.6) % 1);
  ctx.save(); ctx.translate(fx, 640 + Math.sin(u * 3) * 14);
  k.ellipse(ctx, 0, 0, 60, 26, 0, P.turq, P.ink, 2); ctx.beginPath(); ctx.moveTo(52, 0); ctx.lineTo(90, -22 + Math.sin(u * 10) * 6); ctx.lineTo(90, 22 + Math.sin(u * 10) * 6); ctx.closePath(); k.fillStroke(ctx, P.turqLight, P.ink, 2);
  k.circle(ctx, -36, -6, 5, P.white, P.ink, 1.2); ctx.fillStyle = k.pattern(ctx, 'scales', P.turq, P.turqLight, 14); ctx.beginPath(); ctx.ellipse(10, 0, 36, 20, 0, 0, TAU); ctx.fill();
  ctx.restore();
  // "all over the world": every parcel bounces once more
  if (u > wd) { const R = rng(4); for (let i = 0; i < 18; i++) { const a = R() * TAU, r = (u - wd) * 600; k.bubble(ctx, W / 2 + Math.cos(a) * r, 540 + Math.sin(a) * r, 12, 1 - (u - wd) / 1.4); } }
  k.circle(ctx, home[0], home[1], 12 + Math.sin(u * 6) * 2, P.verm, P.goldLight, 3);
}
function bookCover(ctx, S, q) {
  const { k, P, W, H } = S;
  // leather binding
  ctx.fillStyle = P.vermDark; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = k.pattern(ctx, 'dots', P.vermDark, '#7a1e10', 18); ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = P.goldLight; ctx.lineWidth = 8; ctx.strokeRect(40, 40, W - 80, H - 80);
  ctx.lineWidth = 2; ctx.strokeRect(58, 58, W - 116, H - 116);
  // corner pieces (köşebent)
  for (const [x, y, a] of [[58, 58, 0], [W - 58, 58, Math.PI / 2], [W - 58, H - 58, Math.PI], [58, H - 58, -Math.PI / 2]]) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(170, 0); ctx.quadraticCurveTo(120, 40, 110, 110); ctx.quadraticCurveTo(40, 120, 0, 170); ctx.closePath(); k.fillStroke(ctx, P.gold, P.goldDeep, 2); ctx.fillStyle = k.pattern(ctx, 'cintamani', P.gold, P.goldDeep, 26); ctx.fill(); ctx.restore();
  }
  // central şemse (sun medallion) with the channel logo
  const pulse = 1 + 0.02 * Math.sin(q * 3);
  ctx.save(); ctx.translate(W / 2, 500); ctx.scale(pulse, pulse);
  ctx.beginPath();
  for (let i = 0; i <= 96; i++) { const a = i / 96 * TAU, r = 1 + 0.07 * Math.abs(Math.sin(a * 8)); const x = Math.cos(a) * 250 * r, y = Math.sin(a) * 360 * r; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
  ctx.closePath(); k.fillStroke(ctx, P.gold, P.goldDeep, 3);
  ctx.save(); ctx.clip(); ctx.fillStyle = k.pattern(ctx, 'flowers', P.gold, P.goldLight, 30); ctx.fillRect(-300, -400, 600, 800); ctx.restore();
  // pendants above and below
  for (const sgn of [-1, 1]) { ctx.beginPath(); ctx.moveTo(-40, sgn * 370); ctx.quadraticCurveTo(0, sgn * 450, 40, sgn * 370); ctx.closePath(); k.fillStroke(ctx, P.gold, P.goldDeep, 2); }
  k.circle(ctx, 0, -40, 170, P.ink, P.goldLight, 6);
  if (S.logo) { ctx.save(); ctx.beginPath(); ctx.arc(0, -40, 164, 0, TAU); ctx.clip(); ctx.drawImage(S.logo, -164, -204, 328, 328); ctx.restore(); }
  else { ctx.fillStyle = P.goldLight; ctx.font = '900 46px Deco'; ctx.textAlign = 'center'; ctx.fillText('HOW IT', 0, -50); ctx.fillText('STARTED', 0, 10); }
  ctx.restore();
  k.cartouche(ctx, W / 2, 940, 760, 120, P.lapis, P.goldLight, 5);
  ctx.fillStyle = P.goldLight; ctx.font = '900 38px Deco'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('EVERY LEGEND HAS', W / 2, 920); ctx.font = '900 34px Deco'; ctx.fillText('A BEGINNING', W / 2, 962);
  // bubbles rising around the book
  for (let i = 0; i < 10; i++) { const y = H - ((q * 140 + i * 110) % (H + 100)); k.bubble(ctx, 80 + (i * 97) % 780, y, 9 + (i % 3) * 5, 0.85); }
}

// ---------- sound ----------
// Sound effects (generated in lib/audio.py). Times are seconds in the video.
const pops = (from, n, gap, gain = 0.5) => Array.from({ length: n }, (_, i) => ({ t: +(from + i * gap).toFixed(3), type: 'pop', gain, pitch: 1 + (i % 4) * 0.12 }));
export const sfx = [
  ...scenes.slice(1).map(s => ({ t: s.start - 0.05, type: s.trans === 'unroll' ? 'paper' : 'whoosh', gain: 0.35 })),
  { t: 1.3, type: 'pop', gain: 0.7 },
  { t: 2.64, type: 'chime', gain: 0.4 }, { t: 3.55, type: 'stamp', gain: 0.7 },
  { t: 5.68, type: 'pluck', gain: 0.5 }, { t: 6.7, type: 'pluck', gain: 0.5, pitch: 1.26 },
  { t: 9.6, type: 'slide', gain: 0.3 }, { t: 9.92, type: 'stamp', gain: 0.9 }, { t: 9.95, type: 'sizzle', gain: 0.45 },
  { t: 11.05, type: 'wind', gain: 0.45 },
  ...pops(13.2, 10, 0.06, 0.45),
  { t: 15.1, type: 'chime', gain: 0.5 }, { t: 16.1, type: 'paper', gain: 0.45 },
  { t: 18.0, type: 'crickets', gain: 0.35 },
  { t: 20.85, type: 'whoosh', gain: 0.4 }, { t: 21.0, type: 'thud', gain: 0.5 },
  { t: 22.92, type: 'flop', gain: 0.55 }, { t: 23.2, type: 'rain', gain: 0.3 },
  { t: 24.4, type: 'wind', gain: 0.25 },
  { t: 25.9, type: 'riser', gain: 0.45 }, { t: 26.5, type: 'gong', gain: 0.8 },
  { t: 27.6, type: 'clank', gain: 0.45 }, { t: 28.1, type: 'clank', gain: 0.4 },
  { t: 29.48, type: 'stamp', gain: 1.0 }, { t: 29.5, type: 'gong', gain: 0.4 },
  { t: 32.1, type: 'chime', gain: 0.45 }, { t: 32.68, type: 'alarm', gain: 0.6 },
  { t: 34.0, type: 'waves', gain: 0.35 }, { t: 35.6, type: 'stamp', gain: 0.6 }, { t: 36.0, type: 'stamp', gain: 0.5 },
  { t: 37.8, type: 'thunder', gain: 0.6 }, { t: 39.08, type: 'crack', gain: 0.8 }, { t: 39.96, type: 'crack', gain: 0.85 }, { t: 40.55, type: 'crack', gain: 0.9 },
  { t: 42.74, type: 'chime', gain: 0.6 }, { t: 41.7, type: 'slide', gain: 0.3 },
  { t: 45.7, type: 'coins', gain: 0.55 },
  ...Array.from({ length: 12 }, (_, i) => ({ t: +(46.7 + 0.15 + i * 0.34).toFixed(3), type: 'pop', gain: 0.6, pitch: 0.9 + (i % 5) * 0.08 })),
  { t: 48.2, type: 'gong', gain: 0.6 },
  ...pops(51.85, 8, 0.12, 0.45),
  { t: 53.24, type: 'riser', gain: 0.3 }, ...pops(53.3, 10, 0.05, 0.35),
  { t: 55.95, type: 'pop', gain: 0.8 }, { t: 56.0, type: 'gong', gain: 0.9 },
];

// The score: a generated Ottoman-flavoured soundtrack (maqam Hicaz on D:
// ney drone, plucked oud/kanun and def/darbuka), mood per section.
export const music = {
  bpm: 96, root: 'D', maqam: 'hicaz', gain: 0.32,
  sections: [
    { from: 0, to: 4.6, mood: 'intro' },
    { from: 4.6, to: 17.8, mood: 'groove' },
    { from: 17.8, to: 26.4, mood: 'sad' },
    { from: 26.4, to: 41.5, mood: 'drive' },
    { from: 41.5, to: 56.0, mood: 'triumph' },
    { from: 56.0, to: 59.0, mood: 'end' },
  ],
};
