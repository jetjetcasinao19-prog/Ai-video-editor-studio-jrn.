// Reusable scene pieces for Ottoman-miniature storyboards: landscapes,
// palace rooms, lamps, props held by figures, compass roses, the closing
// book cover. Import what a story needs: import { land, interior } from
// '../../styles/ottoman/scenes.mjs';
import { clamp, lerp, TAU, rng } from '../../lib/core.mjs';

export function land(ctx, S, o = {}) {
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
export function ogee(ctx, x, y, w, h) { // pointed arch, top at y, base y+h
  ctx.moveTo(x - w / 2, y + h); ctx.lineTo(x - w / 2, y + w * 0.55);
  ctx.bezierCurveTo(x - w / 2, y + w * 0.1, x - w * 0.1, y + w * 0.12, x, y);
  ctx.bezierCurveTo(x + w * 0.1, y + w * 0.12, x + w / 2, y + w * 0.1, x + w / 2, y + w * 0.55);
  ctx.lineTo(x + w / 2, y + h); ctx.closePath();
}
// Palace room. paper(i) → 0..1 how far bubble wallpaper is unrolled in arch i.
// Rooms: each video gets its own interior (meta.room, or picked from its slug),
// so indoor scenes never look like another video's. Wall 0–640, tile dado
// 640–760 and floor below stay the same, so figures fit every room.
export const ROOMS = ['arches', 'library', 'lattice', 'tiles', 'tent'];
export function interior(ctx, S, o = {}) {
  const { W, H, k, P } = S;
  const room = o.paper || (o.arches && o.arches !== 3) ? 'arches' : (o.room || S.room || 'arches');
  const wall = o.wall || ({ arches: P.paperLight, library: '#e9dcc0', lattice: '#f1e3c6', tiles: '#f6f3ea', tent: '#f3e3d0' })[room];
  ctx.fillStyle = wall; ctx.fillRect(0, 0, W, H);
  if (room === 'arches') {
    ctx.fillStyle = k.pattern(ctx, 'flowers', wall, P.paperDark, 30); ctx.fillRect(0, 0, W, 760);
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
        k.rect(ctx, x - aw / 2 - 4, 120 + 520 * p - 10, aw + 8, 20, '#d4ecef', P.ink, 1.5);
        ctx.restore();
      } else if (o.window) {
        ctx.save(); ctx.beginPath(); ogee(ctx, x, 120, aw, 520); ctx.clip();
        k.goldSky(ctx, x - aw / 2, 120, aw, 520, S.t); k.cypress(ctx, x, 640, 330, S.t, i);
        ctx.restore();
      }
      ctx.beginPath(); ogee(ctx, x, 120, aw, 520); k.stroke(ctx, P.goldDark, 6); k.stroke(ctx, P.ink, 1.5);
    }
  } else if (room === 'library') { // a scholar's room: niches full of bound books, a calligraphy frieze
    ctx.fillStyle = P.greenDark; ctx.fillRect(0, 0, W, 70); k.rect(ctx, -2, 64, W + 4, 10, P.goldLight, P.ink, 1.5);
    ctx.fillStyle = P.goldLight; ctx.font = '700 34px GaramondItalic'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('~ ilim · kalem · kitap ~', W / 2, 36);
    const R = rng(4);
    for (const nx of [40, W - 300]) {
      k.rect(ctx, nx, 110, 260, 520, P.brown, P.ink, 2.5);
      for (let sh = 0; sh < 4; sh++) { const y = 130 + sh * 125; k.rect(ctx, nx + 10, y + 100, 240, 10, P.brownLight, P.ink, 1.2); let bx = nx + 16; while (bx < nx + 236) { const bw = 14 + R() * 18, bh = 60 + R() * 36; k.rect(ctx, bx, y + 100 - bh, bw, bh, [P.verm, P.lapis, P.green, P.ochre, P.vermDark, P.lav][Math.floor(R() * 6)], P.ink, 1); bx += bw + 2; } }
    }
    ctx.beginPath(); ogee(ctx, W / 2, 140, 220, 480); k.fillStroke(ctx, P.white, P.ink, 2.5);
    if (o.window) { ctx.save(); ctx.beginPath(); ogee(ctx, W / 2, 140, 220, 480); ctx.clip(); k.goldSky(ctx, W / 2 - 110, 140, 220, 480, S.t); k.cypress(ctx, W / 2, 620, 300, S.t, 1); ctx.restore(); }
    else { ctx.fillStyle = k.pattern(ctx, 'scales', P.white, P.paperDark, 26); ctx.save(); ctx.beginPath(); ogee(ctx, W / 2, 140, 220, 480); ctx.clip(); ctx.fillRect(W / 2 - 110, 140, 220, 480); ctx.restore(); }
    ctx.beginPath(); ogee(ctx, W / 2, 140, 220, 480); k.stroke(ctx, P.goldDark, 6); k.stroke(ctx, P.ink, 1.5);
  } else if (room === 'lattice') { // a wooden kafes screen with light coming through
    ctx.fillStyle = P.brown; ctx.fillRect(0, 0, W, 80); k.rect(ctx, -2, 74, W + 4, 10, P.goldLight, P.ink, 1.5);
    const g = ctx.createRadialGradient(W / 2, 360, 40, W / 2, 360, 520); g.addColorStop(0, '#fff3c8'); g.addColorStop(1, '#e8c98a');
    ctx.fillStyle = g; ctx.fillRect(40, 110, W - 80, 520);
    if (o.window) { ctx.save(); ctx.beginPath(); ctx.rect(40, 110, W - 80, 520); ctx.clip(); k.goldSky(ctx, 40, 110, W - 80, 520, S.t); for (let i = 0; i < 4; i++) k.cypress(ctx, 150 + i * 220, 630, 300, S.t, i); ctx.restore(); }
    ctx.save(); ctx.beginPath(); ctx.rect(40, 110, W - 80, 520); ctx.clip(); ctx.strokeStyle = P.brown; ctx.lineWidth = 9;
    for (let d = -600; d < W + 600; d += 52) { ctx.beginPath(); ctx.moveTo(d, 110); ctx.lineTo(d + 520, 630); ctx.stroke(); ctx.beginPath(); ctx.moveTo(d + 520, 110); ctx.lineTo(d, 630); ctx.stroke(); }
    ctx.restore(); k.rect(ctx, 40, 110, W - 80, 520, null, P.ink, 3); ctx.strokeStyle = P.brownLight; ctx.lineWidth = 14; ctx.strokeRect(33, 103, W - 66, 534);
  } else if (room === 'tiles') { // a wall of İznik tiles around a great tulip vase panel
    ctx.fillStyle = k.pattern(ctx, 'tiles', '#f6f3ea', '#1f5fae', 58); ctx.fillRect(0, 0, W, 640);
    ctx.fillStyle = P.turq; ctx.fillRect(0, 0, W, 60); k.rect(ctx, -2, 56, W + 4, 8, P.verm, P.ink, 1.2);
    ctx.beginPath(); ogee(ctx, W / 2, 110, 320, 510); k.fillStroke(ctx, '#f6f3ea', P.ink, 3);
    if (o.window) { ctx.save(); ctx.beginPath(); ogee(ctx, W / 2, 110, 320, 510); ctx.clip(); k.goldSky(ctx, W / 2 - 160, 110, 320, 510, S.t); k.cypress(ctx, W / 2, 620, 320, S.t, 2); ctx.restore(); }
    else { ctx.beginPath(); ctx.ellipse(W / 2, 540, 70, 60, 0, 0, Math.PI * 2); k.fillStroke(ctx, '#1f5fae', P.ink, 2); for (let i = -2; i <= 2; i++) k.tulip(ctx, W / 2 + i * 44, 470 - Math.abs(i) * -10, 1.6, i % 2 ? P.verm : '#1f5fae'); }
    ctx.beginPath(); ogee(ctx, W / 2, 110, 320, 510); k.stroke(ctx, P.verm, 6); k.stroke(ctx, P.ink, 1.5);
  } else if (room === 'tent') { // a campaign tent (otağ): striped walls and appliqué arches
    for (let i = 0; i < 12; i++) { ctx.beginPath(); ctx.moveTo(W / 2, -40); ctx.lineTo(i * W / 11 - 40, 640); ctx.lineTo((i + 1) * W / 11 - 40, 640); ctx.closePath(); ctx.fillStyle = i % 2 ? P.verm : '#f3e3d0'; ctx.fill(); }
    ctx.fillStyle = P.vermDark; ctx.fillRect(0, 0, W, 50);
    for (let i = 0; i < 3; i++) { const x = W / 2 + (i - 1) * 300; ctx.beginPath(); ogee(ctx, x, 200, 190, 420); k.fillStroke(ctx, i === 1 && o.window ? P.goldLight : P.lapis, P.goldLight, 5); if (i === 1 && o.window) { ctx.save(); ctx.beginPath(); ogee(ctx, x, 200, 190, 420); ctx.clip(); k.goldSky(ctx, x - 95, 200, 190, 420, S.t); k.cypress(ctx, x, 620, 280, S.t, 3); ctx.restore(); } else k.tulip(ctx, x, 470, 2.0, P.goldLight); }
  }
  // İznik tile dado
  ctx.fillStyle = k.pattern(ctx, 'tiles', P.white, room === 'tiles' ? P.verm : P.lapisLight, 46); ctx.fillRect(0, 640, W, 120);
  k.rect(ctx, -2, 636, W + 4, 8, P.verm, P.ink, 1.2); k.rect(ctx, -2, 756, W + 4, 8, P.verm, P.ink, 1.2);
  // floor + carpet
  const floor = ({ arches: [P.ochreLight, P.ochre], library: ['#c9a06a', '#a8703f'], lattice: ['#d9b27a', '#b8894a'], tiles: [P.white, P.lapisLight], tent: [P.greenDark, P.green] })[room];
  ctx.fillStyle = floor[0]; ctx.fillRect(0, 764, W, H - 764);
  ctx.fillStyle = k.pattern(ctx, 'scales', floor[0], floor[1], 40); ctx.fillRect(0, 764, W, H - 764);
  if (o.carpet !== false) k.carpet(ctx, 120, 820, W - 240, 210, o.carpetColor || P.verm);
}
export function lamp(ctx, S, x, y, lit = 1) { // hanging oil lamp (kandil)
  const { k, P, t } = S;
  ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, y - 40); k.stroke(ctx, P.goldDark, 2);
  if (lit > 0) { const g = ctx.createRadialGradient(x, y, 5, x, y, 150 * lit); g.addColorStop(0, `rgba(255,230,140,${0.7 * lit})`); g.addColorStop(1, 'rgba(255,230,140,0)'); ctx.fillStyle = g; ctx.fillRect(x - 160, y - 160, 320, 320); }
  ctx.beginPath(); ctx.moveTo(x - 34, y - 30); ctx.quadraticCurveTo(x - 40, y + 20, x, y + 30); ctx.quadraticCurveTo(x + 40, y + 20, x + 34, y - 30); ctx.closePath();
  k.fillStroke(ctx, lit > 0.5 ? P.goldLight : P.turqLight, P.ink, 2);
  k.rect(ctx, x - 38, y - 40, 76, 12, P.goldDark, P.ink, 1.5);
  if (lit > 0) { const fl = 1 + 0.15 * Math.sin(t * 20); ctx.beginPath(); ctx.ellipse(x, y - 4, 7 * fl, 13 * fl, 0, 0, TAU); ctx.fillStyle = P.verm; ctx.fill(); }
}
export const ENG = { // the two engineers, dressed by the court painters
  fielding: { robe: '#20408f', robeP: 'cintamani', robePc: '#ecd57a', inner: '#e9be6e', sash: '#c4371f', hat: 'turban', hatColor: '#c4371f', beard: 'short', glasses: true },
  chavannes: { robe: '#c4371f', robeP: 'flowers', robePc: '#f7eed6', inner: '#6cc3b8', sash: '#20408f', hat: 'turban', hatColor: '#3d8458', beard: 'long', beardColor: '#6b4a32', mustache: true },
};
export function dividers(ctx) { ctx.rotate(-0.3); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-14, 70); ctx.moveTo(0, 0); ctx.lineTo(14, 70); ctx.strokeStyle = '#8f6c14'; ctx.lineWidth = 4; ctx.stroke(); }
export function scroll(ctx) { ctx.rotate(-0.2); ctx.fillStyle = '#f7eed6'; ctx.strokeStyle = '#2a1c12'; ctx.lineWidth = 2; ctx.beginPath(); ctx.rect(-8, -50, 16, 100); ctx.fill(); ctx.stroke(); }
export function spyglass(ctx) { ctx.rotate(-1.75); ctx.fillStyle = '#c9a227'; ctx.strokeStyle = '#2a1c12'; ctx.lineWidth = 2; ctx.beginPath(); ctx.rect(-6, -8, 110, 16); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.rect(96, -11, 26, 22); ctx.fill(); ctx.stroke(); }
export function rollHeld(ctx) { ctx.rotate(-1.5); ctx.fillStyle = '#bfe0e4'; ctx.strokeStyle = '#2a1c12'; ctx.lineWidth = 2; ctx.beginPath(); ctx.rect(-14, -60, 28, 120); ctx.fill(); ctx.stroke(); }

export function compassRose(ctx, k, P, x, y, r, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  // rhumb lines
  ctx.globalAlpha = 0.45;
  for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * 1400, Math.sin(a) * 1400); k.stroke(ctx, [P.verm, P.green, P.ink, P.lapis][i % 4], 1.2); }
  ctx.globalAlpha = 1;
  for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, L = i % 2 ? r * 0.6 : r; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a - 0.2) * L * 0.3, Math.sin(a - 0.2) * L * 0.3); ctx.lineTo(Math.cos(a) * L, Math.sin(a) * L); ctx.closePath(); k.fillStroke(ctx, i % 2 ? P.lapis : P.verm, P.ink, 1.2); }
  k.circle(ctx, 0, 0, r * 0.18, P.goldLight, P.ink, 1.5);
  ctx.restore();
}
export function bookCover(ctx, S, q) {
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

// Title sign, round medallion (? / !) and a heart.
export function heart(ctx, k, P, x, y, s, a = 1) {
  if (s <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp(a); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(0, 12); ctx.bezierCurveTo(-26, -6, -14, -28, 0, -14); ctx.bezierCurveTo(14, -28, 26, -6, 0, 12);
  k.fillStroke(ctx, P.verm, P.ink, 1.5); ctx.restore();
}
export function bigSign(ctx, k, P, text, x, y, w, sc, size = 96) {
  if (sc <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  k.cartouche(ctx, 0, 0, w, size * 1.8, P.lapis, P.goldLight, 6);
  ctx.font = `900 ${size}px Deco`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  while (ctx.measureText(text).width > w - 120) { size -= 4; ctx.font = `900 ${size}px Deco`; }
  ctx.lineWidth = 10; ctx.strokeStyle = P.ink; ctx.strokeText(text, 0, 8);
  const g = ctx.createLinearGradient(0, -50, 0, 60); g.addColorStop(0, P.goldLight); g.addColorStop(1, P.ochre);
  ctx.fillStyle = g; ctx.fillText(text, 0, 8);
  ctx.restore();
}
export function medallion(ctx, k, P, ch, x, y, sc, bg = P.lapis) {
  if (sc <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  k.circle(ctx, 0, 0, 56, bg, P.goldLight, 5);
  ctx.fillStyle = P.goldLight; ctx.font = '900 74px Deco'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(ch, 0, 6);
  ctx.restore();
}

// A stylised map of the United States on parchment-coloured land.
export const US_SHAPE = [[110, 260], [300, 190], [500, 210], [650, 170], [830, 230], [860, 330], [800, 420], [780, 520], [700, 600], [720, 700], [660, 700], [600, 640], [480, 660], [400, 720], [330, 650], [240, 620], [150, 540], [100, 420]];
export function usMap(ctx, S, color = '#cdb57a') {
  const { k, P, W, H } = S;
  ctx.beginPath(); k.smoothPath(ctx, US_SHAPE); k.fillStroke(ctx, color, P.ink, 2.5);
  ctx.save(); ctx.clip(); ctx.fillStyle = k.pattern(ctx, 'dots', color, '#b39a5e', 26); ctx.fillRect(0, 0, W, H); ctx.restore();
}
