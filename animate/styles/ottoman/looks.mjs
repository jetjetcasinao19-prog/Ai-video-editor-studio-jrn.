// Looks ("folios"): each video gets its own page design, so a channel of these
// shorts never reads as one template with new words. A look sets the page
// layout around the painting, the marbling colours, caption colours, the
// moving light and particles over the painting, a colour grade, a slow camera
// drift and its own set of transitions. The painting is always 940x1060, so
// every scene works in every look.
//
//   meta.look = 'classic' | 'album' | 'tile' | 'night' | 'scroll'
//   (render.mjs --look <name> previews another look without editing the story)
import { createCanvas } from '@napi-rs/canvas';
import { TAU, clamp, lerp, rng, ease } from '../../lib/core.mjs';
import * as kit from './kit.mjs';
import { LAYOUT, ebru, paperTexture, vineBand, rules, cornerRosette, staticPage } from './page.mjs';

const { P, cartouche, circle, ellipse, stroke, fillStroke, tulip, carnation } = kit;
const PAINT = { w: 940, h: 1060 };

export const LOOKS = {
  // the original page: lapis header plate, cream captions, tulip footer
  classic: {
    label: 'Classic manuscript page', layout: LAYOUT, colors: {},
    ambient: 'none', grade: null, vignette: 0, drift: 0, transitions: null,
  },
  // a murakka (album) page: big painting near the top, gold-sprinkled paper,
  // the chapter title under the picture, the logo in a roundel at the bottom
  album: {
    label: 'Album page (murakka) with gold-sprinkled paper',
    layout: {
      W: 1080, H: 1920, header: null,
      paint: { x: 70, y: 126, ...PAINT },
      title: { cx: 540, cy: 1248, w: 780, h: 96 },
      caption: { x: 70, y: 1318, w: 940, h: 220 },
      footer: { x: 70, y: 1590, w: 940, h: 250 },
      logo: { cx: 540, cy: 1690, r: 62 }, handle: { cx: 540, cy: 1796 },
    },
    ebru: [['#7a2e3a', '#e8b7b0', '#2f5f7a', '#efe2c0', '#c98a2e', '#3d8458'], ['#5a2a5a', '#c9bede', '#c98a2e', '#efe2c0', '#2f7f7a', '#b8574e']],
    colors: { title: P.vermDark, active: P.verm, under: P.gold, reed: P.goldDark },
    ambient: 'dust', grade: { mode: 'soft-light', color: '#ffd9a0', a: 0.16 }, vignette: 0.28, drift: 0.035, paintIn: 1.0, glint: true,
    transitions: ['unroll', 'ink', 'page', 'iris'],
  },
  // İznik tiles: tiled page, white caption panel with cobalt rules
  tile: {
    label: 'Iznik tile panel',
    layout: { ...LAYOUT, logo: null },
    colors: { title: P.lapisDeep, active: '#1f5fae', under: P.verm, reed: P.turq, reedTip: P.verm, outro: P.vermDark },
    ambient: 'none', grade: { mode: 'soft-light', color: '#cfe6ff', a: 0.1 }, vignette: 0.15, drift: 0.025, paintIn: 0.9, glint: true,
    transitions: ['tiles', 'lattice', 'wipe', 'tiles'],
  },
  // a lacquer night page: navy and gold, cream captions, fireflies
  night: {
    label: 'Night lacquer page in navy and gold',
    layout: { ...LAYOUT, logo: null },
    ebru: [['#0e1630', '#1d2b5c', '#c9a227', '#2a1c12', '#3a6f7a', '#6e510c'], ['#141b38', '#3a2a5a', '#ecd57a', '#0e1630', '#2a5f6a', '#8e2414']],
    colors: { title: P.goldLight, ink: '#f3e6c0', active: P.goldLight, under: P.verm, dim: 'rgba(243,230,192,0.33)', outro: P.goldLight, reed: P.goldLight },
    ambient: 'fireflies', grade: { mode: 'multiply', color: '#b4c0e8', a: 0.16 }, vignette: 0.45, drift: 0.04, paintIn: 1.0, glint: true,
    transitions: ['ink', 'iris', 'lattice', 'ink'],
  },
  // a hanging scroll: wooden rollers, a title tag, captions on a ribbon
  scroll: {
    label: 'Hanging scroll with a ribbon banner',
    layout: {
      W: 1080, H: 1920, header: null,
      paint: { x: 70, y: 268, ...PAINT },
      title: { cx: 540, cy: 150, w: 660, h: 96 },
      caption: { x: 60, y: 1430, w: 960, h: 200 }, reedGap: 22,
      footer: { x: 70, y: 1690, w: 940, h: 150 },
      logo: { cx: 900, cy: 1760, r: 62 }, handle: { cx: 470, cy: 1760 },
    },
    ebru: [['#3d8458', '#b9c98a', '#efe2c0', '#a99ac6', '#c4371f', '#24573a'], ['#2f7f7a', '#e9be6e', '#efe2c0', '#e8b7b0', '#7a4a2a', '#20408f']],
    colors: { title: P.ink, active: P.vermDark, under: P.goldDark, reed: P.brownLight },
    ambient: 'petals', grade: { mode: 'soft-light', color: '#f0c8a0', a: 0.12 }, vignette: 0.3, drift: 0.03, paintIn: 1.0, glint: true,
    transitions: ['unroll', 'page', 'wipe', 'ink'],
  },
  // Karagöz shadow theatre: the story plays on a backlit muslin screen in a
  // wooden booth, colours glowing like translucent leather puppets, lamp flicker
  karagoz: {
    label: 'Karagöz shadow-theatre booth',
    layout: { ...LAYOUT, logo: null },
    colors: { title: '#ffd98a', ink: '#f3e6c0', active: '#ffcf6a', under: P.verm, dim: 'rgba(243,230,192,0.33)', outro: '#ffd98a', reed: '#ffcf6a', reedTip: P.verm },
    ambient: 'none', grade: { mode: 'multiply', color: '#ffe0a8', a: 0.28 }, vignette: 0.55, drift: 0.02,
    sceneFilter: 'saturate(1.55) contrast(1.12) brightness(1.04)', cloth: true, flicker: true,
    transitions: ['curtain', 'iris', 'curtain', 'cut'],
  },
};
export const LOOK_NAMES = Object.keys(LOOKS);

export function getLook(meta) {
  const name = meta.look || 'classic';
  const look = LOOKS[name];
  if (!look) throw new Error(`unknown look "${name}" (choose from ${LOOK_NAMES.join(', ')})`);
  return { name, ...look, ambient: meta.ambient ?? look.ambient, paintIn: meta.paintIn ?? look.paintIn ?? 0 };
}

// ---------- the static page for each look ----------
function goldFlecks(ctx, x, y, w, h, seed, n = 900) {
  const R = rng(seed);
  for (let i = 0; i < n; i++) {
    const px = x + R() * w, py = y + R() * h, r = 1 + R() * 3.2;
    ctx.beginPath(); for (let j = 0; j < 5; j++) { const a = j / 5 * TAU + R(); ctx.lineTo(px + Math.cos(a) * r * (0.6 + R() * 0.6), py + Math.sin(a) * r * (0.6 + R() * 0.6)); }
    ctx.closePath(); ctx.fillStyle = R() > 0.3 ? 'rgba(201,162,39,0.75)' : 'rgba(236,213,122,0.85)'; ctx.fill();
  }
}
function paperPanel(ctx, x, y, w, h, seed, color = P.paper) {
  ctx.fillStyle = color; ctx.fillRect(x, y, w, h);
  const tex = paperTexture(Math.round(w), Math.round(h), seed);
  ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(tex, x, y); ctx.restore();
}
function handlePlate(ctx, handle, cx, cy, fill = P.lapis, ink = P.goldLight) {
  if (!handle) return;
  ctx.font = '700 30px Fell'; const tw = ctx.measureText(handle).width + 80;
  cartouche(ctx, cx, cy, tw, 56, fill, ink, 3);
  ctx.fillStyle = ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(handle, cx, cy + 2);
}
function logoRoundel(ctx, logo, cx, cy, r) {
  circle(ctx, cx, cy, r + 6, P.goldLight, P.goldDeep, 3);
  if (!logo) return;
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.clip(); ctx.drawImage(logo, cx - r, cy - r, r * 2, r * 2); ctx.restore();
}
function ribbon(ctx, x, y, w, h, fill, line) {
  const n = 34;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w - n, y + h / 2); ctx.lineTo(x + w, y + h); ctx.lineTo(x, y + h); ctx.lineTo(x + n, y + h / 2); ctx.closePath();
  fillStroke(ctx, fill, line, 3);
  ctx.strokeStyle = line; ctx.lineWidth = 1.2; ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.moveTo(x + n, y + 10); ctx.lineTo(x + w - n, y + 10); ctx.moveTo(x + n, y + h - 10); ctx.lineTo(x + w - n, y + h - 10); ctx.stroke(); ctx.setLineDash([]);
}

export function buildPage(look, opts = {}) {
  if (look.name === 'classic') return staticPage(opts);
  const L = look.layout, cv = createCanvas(L.W, L.H), ctx = cv.getContext('2d');
  const R = rng(opts.seed || 11), pal = look.ebru ? look.ebru[(opts.seed || 0) % look.ebru.length] : null;
  if (pal) ctx.drawImage(ebru(L.W / 2, L.H / 2, (opts.seed || 11) + 3, pal), 0, 0, L.W, L.H);
  const PA = L.paint;

  if (look.name === 'album') {
    paperPanel(ctx, 40, 48, L.W - 80, L.H - 96, 9, '#f1e4c4');
    goldFlecks(ctx, 40, 48, L.W - 80, L.H - 96, (opts.seed || 11) + 5);
    ctx.strokeStyle = P.goldDark; ctx.lineWidth = 4; ctx.strokeRect(48, 56, L.W - 96, L.H - 112);
    rules(ctx, PA.x, PA.y, PA.w, PA.h);
    // title cartouche under the painting
    const tb = L.title; cartouche(ctx, tb.cx, tb.cy, tb.w, tb.h, P.paperLight, P.goldDark, 4);
    for (const sx of [-1, 1]) cornerRosette(ctx, tb.cx + sx * (tb.w / 2 + 42), tb.cy, 34);
    const cp = L.caption; ctx.fillStyle = 'rgba(247,238,214,0.92)'; ctx.fillRect(cp.x, cp.y, cp.w, cp.h); rules(ctx, cp.x, cp.y, cp.w, cp.h);
    const ft = L.footer;
    vineBand(ctx, ft.x, ft.y, ft.w, 40, P.goldLight, P.greenDark); rules(ctx, ft.x, ft.y, ft.w, 40);
    for (let i = 0; i < 8; i++) { const fx = ft.x + 70 + i * (ft.w - 140) / 7; if (i === 3 || i === 4) continue; (i % 2 ? carnation : tulip)(ctx, fx, ft.y + ft.h - 26, 1.1, i % 3 ? P.verm : P.lapisLight); }
    logoRoundel(ctx, opts.logo, L.logo.cx, L.logo.cy, L.logo.r);
    handlePlate(ctx, opts.handle, L.handle.cx, L.handle.cy, P.greenDark, P.goldLight);
  } else if (look.name === 'tile') {
    ctx.fillStyle = kit.pattern(ctx, 'tiles', '#f6f3ea', '#1f5fae', 64); ctx.fillRect(0, 0, L.W, L.H);
    ctx.fillStyle = 'rgba(20,42,99,0.08)'; ctx.fillRect(0, 0, L.W, L.H);
    // turquoise border tiles
    for (let i = 0; i < 30; i++) for (const [x, y] of [[i * 37, 0], [i * 37, L.H - 26]]) { ctx.fillStyle = i % 2 ? P.turq : '#1f5fae'; ctx.fillRect(x, y, 36, 26); }
    const hd = L.header;
    ctx.fillStyle = '#1f5fae'; ctx.fillRect(hd.x, hd.y, hd.w, hd.h);
    ctx.fillStyle = kit.pattern(ctx, 'cintamani', '#1f5fae', '#f6f3ea', 34); ctx.fillRect(hd.x, hd.y, hd.w, hd.h);
    rules(ctx, hd.x, hd.y, hd.w, hd.h);
    cartouche(ctx, hd.x + hd.w / 2 - 50, hd.y + hd.h / 2, 690, 108, '#f6f3ea', P.turq, 5);
    circle(ctx, hd.x + 62, hd.y + hd.h / 2, 44, P.verm, '#f6f3ea', 4); kit.star(ctx, hd.x + 62, hd.y + hd.h / 2, 26, 1);
    logoRoundel(ctx, opts.logo, hd.x + hd.w - 78, hd.y + hd.h / 2, 60);
    ctx.fillStyle = '#f6f3ea'; ctx.fillRect(PA.x - 16, PA.y - 16, PA.w + 32, PA.h + 32);
    rules(ctx, PA.x, PA.y, PA.w, PA.h);
    const cp = L.caption; ctx.fillStyle = '#fbf9f3'; ctx.fillRect(cp.x, cp.y, cp.w, cp.h);
    for (const [o, c, lw] of [[-12, '#1f5fae', 8], [-4, P.turq, 3], [-1, P.verm, 1.5]]) { ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.strokeRect(cp.x + o, cp.y + o, cp.w - 2 * o, cp.h - 2 * o); }
    const ft = L.footer;
    ctx.fillStyle = '#f6f3ea'; ctx.fillRect(ft.x, ft.y + 60, ft.w, ft.h - 60);
    for (let i = 0; i < 9; i++) { const fx = ft.x + 60 + i * (ft.w - 120) / 8; if (i === 4) continue; (i % 2 ? carnation : tulip)(ctx, fx, ft.y + ft.h - 20, 1.2, i % 4 < 2 ? P.verm : '#1f5fae'); }
    for (const [o, c, lw] of [[-8, '#1f5fae', 6], [-2, P.turq, 2]]) { ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.strokeRect(ft.x + o, ft.y + 60 + o, ft.w - 2 * o, ft.h - 60 - 2 * o); }
    handlePlate(ctx, opts.handle, ft.x + ft.w / 2, ft.y + 112, '#1f5fae', '#f6f3ea');
  } else if (look.name === 'night') {
    ctx.fillStyle = 'rgba(10,14,32,0.55)'; ctx.fillRect(0, 0, L.W, L.H);
    ctx.fillStyle = '#121a36'; ctx.fillRect(36, 56, L.W - 72, L.H - 104);
    goldFlecks(ctx, 36, 56, L.W - 72, L.H - 104, (opts.seed || 11) + 9, 260);
    ctx.strokeStyle = P.gold; ctx.lineWidth = 3; ctx.strokeRect(44, 64, L.W - 88, L.H - 120);
    ctx.strokeStyle = P.goldDark; ctx.lineWidth = 1.2; ctx.strokeRect(52, 72, L.W - 104, L.H - 136);
    const hd = L.header;
    vineBand(ctx, hd.x, hd.y, hd.w, hd.h, P.gold, '#0b1128');
    rules(ctx, hd.x, hd.y, hd.w, hd.h);
    cartouche(ctx, hd.x + hd.w / 2 - 50, hd.y + hd.h / 2, 690, 108, '#1b2450', P.goldLight, 4);
    cornerRosette(ctx, hd.x + 62, hd.y + hd.h / 2, 46);
    logoRoundel(ctx, opts.logo, hd.x + hd.w - 78, hd.y + hd.h / 2, 60);
    rules(ctx, PA.x, PA.y, PA.w, PA.h);
    const cp = L.caption; ctx.fillStyle = '#1b2450'; ctx.fillRect(cp.x, cp.y, cp.w, cp.h);
    for (const [o, c, lw] of [[-11, P.gold, 4], [-4, P.goldDark, 1.5], [-1, P.verm, 1.5]]) { ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.strokeRect(cp.x + o, cp.y + o, cp.w - 2 * o, cp.h - 2 * o); }
    ctx.save(); ctx.globalAlpha = 0.5; for (let i = 0; i < 26; i++) kit.star(ctx, cp.x + 30 + R() * (cp.w - 60), cp.y + 20 + R() * (cp.h - 40), 3 + R() * 4, 0.6); ctx.restore();
    const ft = L.footer;
    vineBand(ctx, ft.x, ft.y, ft.w, 46, P.gold, '#0b1128'); rules(ctx, ft.x, ft.y, ft.w, 46);
    ctx.fillStyle = '#0f1530'; ctx.fillRect(ft.x, ft.y + 70, ft.w, ft.h - 70);
    ctx.strokeStyle = P.gold; ctx.lineWidth = 3; ctx.strokeRect(ft.x, ft.y + 70, ft.w, ft.h - 70);
    kit.moon(ctx, ft.x + 90, ft.y + 160, 34);
    for (let i = 0; i < 14; i++) kit.star(ctx, ft.x + 160 + R() * (ft.w - 220), ft.y + 100 + R() * 110, 4 + R() * 6, 0.9);
    handlePlate(ctx, opts.handle, ft.x + ft.w / 2, ft.y + 112, '#0b1128', P.goldLight);
  } else if (look.name === 'scroll') {
    // the scroll's paper with a silk border
    ctx.fillStyle = '#5a3a2a'; ctx.fillRect(PA.x - 44, PA.y - 44, PA.w + 88, PA.h + 88);
    ctx.fillStyle = kit.pattern(ctx, 'cintamani', '#7a2e3a', '#e9be6e', 30); ctx.fillRect(PA.x - 40, PA.y - 40, PA.w + 80, PA.h + 80);
    rules(ctx, PA.x, PA.y, PA.w, PA.h);
    for (const y of [PA.y - 58, PA.y + PA.h + 58]) {
      ctx.fillStyle = P.brown; ctx.fillRect(PA.x - 80, y - 16, PA.w + 160, 32); ctx.strokeStyle = P.ink; ctx.lineWidth = 2.5; ctx.strokeRect(PA.x - 80, y - 16, PA.w + 160, 32);
      ctx.fillStyle = 'rgba(255,230,180,0.35)'; ctx.fillRect(PA.x - 80, y - 12, PA.w + 160, 7);
      for (const ex of [PA.x - 94, PA.x + PA.w + 94]) circle(ctx, ex, y, 24, P.gold, P.ink, 2.5);
    }
    // the cords and the title tag
    const tb = L.title;
    for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(tb.cx + sx * 260, PA.y - 74); ctx.lineTo(tb.cx + sx * 200, tb.cy + 40); stroke(ctx, P.verm, 4); }
    cartouche(ctx, tb.cx, tb.cy, tb.w, tb.h, P.paperLight, P.goldDark, 4);
    // tassels
    for (const ex of [PA.x - 94, PA.x + PA.w + 94]) { ctx.beginPath(); ctx.moveTo(ex, PA.y + PA.h + 82); ctx.lineTo(ex, PA.y + PA.h + 120); stroke(ctx, P.verm, 4); for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(ex, PA.y + PA.h + 120); ctx.lineTo(ex + i * 4, PA.y + PA.h + 165); stroke(ctx, P.verm, 2.5); } circle(ctx, ex, PA.y + PA.h + 120, 9, P.gold, P.ink, 2); }
    const cp = L.caption; ribbon(ctx, cp.x, cp.y, cp.w, cp.h, P.paperLight, P.goldDark);
    logoRoundel(ctx, opts.logo, L.logo.cx, L.logo.cy, L.logo.r);
    handlePlate(ctx, opts.handle, L.handle.cx, L.handle.cy, P.vermDark, P.goldLight);
  }
  else if (look.name === 'karagoz') {
    woodGrain(ctx, 0, 0, L.W, L.H, (opts.seed || 11) + 4);
    // valance: scalloped red drape with gold fringe
    ctx.fillStyle = P.vermDark; ctx.fillRect(0, 0, L.W, 76);
    ctx.beginPath(); ctx.moveTo(0, 76); for (let i = 0; i <= 12; i++) ctx.quadraticCurveTo(i * 90 + 45, 116, i * 90 + 90, 76); ctx.lineTo(L.W, 0); ctx.lineTo(0, 0); ctx.closePath(); fillStroke(ctx, P.verm, P.ink, 2);
    for (let x = 6; x < L.W; x += 12) { ctx.beginPath(); ctx.moveTo(x, 84 + Math.abs(Math.sin(x / 90 * Math.PI)) * 30); ctx.lineTo(x, 100 + Math.abs(Math.sin(x / 90 * Math.PI)) * 30); stroke(ctx, P.goldLight, 3); }
    // the carved sign with the chapter title
    const hd = L.header;
    ctx.fillStyle = '#5a3418'; ctx.fillRect(hd.x + 40, hd.y + 20, hd.w - 80, hd.h - 30);
    for (const [o, c, lw] of [[0, P.goldDark, 5], [8, P.gold, 2]]) { ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.strokeRect(hd.x + 40 + o, hd.y + 20 + o, hd.w - 80 - 2 * o, hd.h - 30 - 2 * o); }
    cartouche(ctx, hd.x + hd.w / 2 - 50, hd.y + hd.h / 2 + 5, 690, 100, '#3a2010', P.goldLight, 3);
    circle(ctx, hd.x + 92, hd.y + hd.h / 2 + 5, 40, '#3a2010', P.gold, 3); kit.star(ctx, hd.x + 92, hd.y + hd.h / 2 + 5, 24, 1);
    logoRoundel(ctx, opts.logo, hd.x + hd.w - 98, hd.y + hd.h / 2 + 5, 52);
    // the screen: muslin edge inside a wooden frame, red drapes tied back at the sides
    ctx.fillStyle = '#2a160c'; ctx.fillRect(PA.x - 40, PA.y - 40, PA.w + 80, PA.h + 80);
    ctx.fillStyle = '#efe6cf'; ctx.fillRect(PA.x - 16, PA.y - 16, PA.w + 32, PA.h + 32);
    for (const side of [-1, 1]) {
      const x0 = side < 0 ? 0 : L.W, x1 = side < 0 ? PA.x - 18 : PA.x + PA.w + 18;
      ctx.beginPath(); ctx.moveTo(x0, 100); ctx.lineTo(x1 + side * -10, 100); ctx.quadraticCurveTo(x1, PA.y + PA.h * 0.45, x1 - side * 20, PA.y + PA.h * 0.55); ctx.quadraticCurveTo(x1, PA.y + PA.h, x0 + side * -0, PA.y + PA.h + 50); ctx.closePath(); fillStroke(ctx, P.verm, P.ink, 2);
      for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(lerp(x0, x1, i / 4), 100); ctx.quadraticCurveTo(lerp(x0, x1, i / 4) + side * 6, PA.y + PA.h * 0.5, lerp(x0, x1, i / 4 * 0.6), PA.y + PA.h + 40); stroke(ctx, P.vermDark, 2); }
      circle(ctx, lerp(x0, x1, 0.6), PA.y + PA.h * 0.55, 12, P.gold, P.ink, 2);
    }
    // caption plank
    const cp = L.caption;
    ctx.fillStyle = '#3a2010'; ctx.fillRect(cp.x, cp.y, cp.w, cp.h);
    woodGrain(ctx, cp.x, cp.y, cp.w, cp.h, 77, 0.25);
    for (const [o, c, lw] of [[-10, P.goldDark, 5], [-3, P.gold, 2]]) { ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.strokeRect(cp.x + o, cp.y + o, cp.w - 2 * o, cp.h - 2 * o); }
    // footer: oil lamps lighting the screen, and the handle
    const ft = L.footer;
    ctx.fillStyle = '#24130a'; ctx.fillRect(ft.x, ft.y + 60, ft.w, ft.h - 60);
    ctx.strokeStyle = P.goldDark; ctx.lineWidth = 3; ctx.strokeRect(ft.x, ft.y + 60, ft.w, ft.h - 60);
    for (const lx of [ft.x + 80, ft.x + 190, ft.x + ft.w - 190, ft.x + ft.w - 80]) {
      const ly = ft.y + ft.h - 40;
      const g = ctx.createRadialGradient(lx, ly - 46, 0, lx, ly - 46, 70); g.addColorStop(0, 'rgba(255,200,90,0.55)'); g.addColorStop(1, 'rgba(255,200,90,0)'); ctx.fillStyle = g; ctx.fillRect(lx - 70, ly - 116, 140, 140);
      ctx.beginPath(); ctx.ellipse(lx, ly - 10, 34, 14, 0, 0, Math.PI); fillStroke(ctx, P.brownLight, P.ink, 2);
      ctx.beginPath(); ctx.moveTo(lx + 30, ly - 12); ctx.quadraticCurveTo(lx + 50, ly - 20, lx + 44, ly - 30); stroke(ctx, P.ink, 3);
      ctx.beginPath(); ctx.moveTo(lx - 30, ly - 12); ctx.quadraticCurveTo(lx - 40, ly - 50, lx - 34, ly - 66); ctx.quadraticCurveTo(lx - 24, ly - 46, lx - 22, ly - 12); fillStroke(ctx, '#ffcf6a', P.verm, 1.5);
    }
    handlePlate(ctx, opts.handle, ft.x + ft.w / 2, ft.y + 130, '#3a2010', P.goldLight);
  }
  return cv;
}

function woodGrain(ctx, x, y, w, h, seed, a = 1) {
  const R = rng(seed);
  ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = '#3a2212'; ctx.fillRect(x, y, w, h);
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  for (let i = 0; i < h / 3; i++) { const yy = y + i * 3 + R() * 2; ctx.strokeStyle = `rgba(${90 + R() * 40},${50 + R() * 25},${20 + R() * 10},${0.25 + R() * 0.4})`; ctx.lineWidth = 1 + R() * 2; ctx.beginPath(); ctx.moveTo(x, yy); for (let xx = 0; xx <= w; xx += 60) ctx.lineTo(x + xx, yy + Math.sin(xx / 140 + i * 0.3) * 3); ctx.stroke(); }
  ctx.restore();
}

// ---------- light and particles over the painting ----------
export function ambient(ctx, type, t, W, H, seed = 1) {
  if (!type || type === 'none') return;
  const R = rng(seed * 7 + 3);
  ctx.save();
  if (type === 'dust') {
    for (let i = 0; i < 46; i++) { const x0 = R() * W, sp = 12 + R() * 22, y = H - ((R() * H + t * sp) % (H + 40)), x = x0 + Math.sin(t * 0.6 + i) * 18, tw = 0.5 + 0.5 * Math.sin(t * 2.5 + i * 1.7); ctx.globalAlpha = 0.25 + 0.55 * tw; kit.circle(ctx, x, y, 1.6 + R() * 2.2, '#f6e3a0', null); }
  } else if (type === 'fireflies') {
    for (let i = 0; i < 22; i++) { const bx = R() * W, by = R() * H, x = bx + Math.sin(t * 0.7 + i * 2.1) * 40, y = by + Math.cos(t * 0.5 + i) * 30, g = 0.5 + 0.5 * Math.sin(t * 3 + i * 1.3); const gr = ctx.createRadialGradient(x, y, 0, x, y, 16); gr.addColorStop(0, `rgba(240,240,150,${0.55 * g})`); gr.addColorStop(1, 'rgba(240,240,150,0)'); ctx.fillStyle = gr; ctx.fillRect(x - 16, y - 16, 32, 32); kit.circle(ctx, x, y, 2.4, `rgba(255,255,200,${0.6 + 0.4 * g})`, null); }
  } else if (type === 'petals') {
    for (let i = 0; i < 18; i++) { const x0 = R() * W, sp = 40 + R() * 40, y = ((R() * H + t * sp) % (H + 60)) - 30, x = x0 + Math.sin(t * 1.1 + i) * 40, rot = t * (1 + R()) + i; ctx.globalAlpha = 0.85; kit.ellipse(ctx, x, y, 9, 5, rot, i % 3 ? P.pink : P.rose, P.vermDark, 0.8); }
  } else if (type === 'embers') {
    for (let i = 0; i < 30; i++) { const x0 = R() * W, sp = 50 + R() * 60, y = H - ((R() * H + t * sp) % (H + 40)), x = x0 + Math.sin(t * 2 + i) * 12; ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t * 6 + i); kit.circle(ctx, x, y, 2 + R() * 2, i % 2 ? '#ffb347' : '#ff6a2a', null); }
  } else if (type === 'snow') kit.snow(ctx, 0, 0, W, H, t, 70, seed);
  ctx.restore();
}

// colour grade + vignette (a candle-lit, hand-painted finish)
let WEAVE = null;
export function grade(ctx, look, W, H, t) {
  if (look.cloth) { // the muslin weave and the lamp behind the screen
    if (!WEAVE) { WEAVE = createCanvas(8, 8); const g = WEAVE.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, 8, 8); g.fillStyle = 'rgba(120,90,50,0.5)'; g.fillRect(0, 0, 8, 1); g.fillRect(0, 0, 1, 8); }
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.35; ctx.fillStyle = ctx.createPattern(WEAVE, 'repeat'); ctx.fillRect(0, 0, W, H); ctx.restore();
    const f = 0.85 + 0.15 * Math.sin(t * 9) * Math.sin(t * 3.1 + 1), g = ctx.createRadialGradient(W / 2, H * 0.55, 40, W / 2, H * 0.55, H * 0.7);
    g.addColorStop(0, `rgba(255,236,190,${0.35 * f})`); g.addColorStop(1, 'rgba(255,236,190,0)');
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
  }
  if (look.grade) { ctx.save(); ctx.globalCompositeOperation = look.grade.mode; ctx.globalAlpha = look.grade.a; ctx.fillStyle = look.grade.color; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  if (look.vignette > 0) {
    const flick = look.name === 'night' || look.flicker ? 0.04 * Math.sin(t * 7) * Math.sin(t * 2.3) : 0;
    const g = ctx.createRadialGradient(W / 2, H * 0.45, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.72);
    g.addColorStop(0, 'rgba(30,18,8,0)'); g.addColorStop(1, `rgba(30,18,8,${clamp(look.vignette + flick)})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }
}

// ---------- transitions ----------
// clip(ctx, type, e, W, H, seed) sets the reveal region for the new scene;
// edge(...) draws the moving boundary. e runs 0 → 1.
const blobs = (seed, W, H) => { const R = rng(seed); return Array.from({ length: 7 }, (_, i) => ({ x: i === 0 ? W / 2 : R() * W, y: i === 0 ? H / 2 : R() * H, r: (0.45 + R() * 0.5) * H * (i === 0 ? 0.9 : 0.55), d: i === 0 ? 0 : R() * 0.35, w: R() * 10 })); };
function blobPath(ctx, b, r) {
  for (let j = 0; j <= 40; j++) { const a = j / 40 * TAU, rr = r * (1 + 0.07 * Math.sin(a * 5 + b.w) + 0.04 * Math.sin(a * 11 + b.w * 2)); const x = b.x + Math.cos(a) * rr, y = b.y + Math.sin(a) * rr; j ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
  ctx.closePath();
}
export function transClip(ctx, type, e, W, H, seed = 1) {
  ctx.beginPath();
  if (type === 'ink') { for (const b of blobs(seed, W, H)) { const r = b.r * clamp((e - b.d) / (1 - b.d)); if (r > 1) blobPath(ctx, b, r); } }
  else if (type === 'lattice') { const n = 8, sw = W / n; for (let i = 0; i < n; i++) { const p = clamp(e * 1.4 - (i % 2) * 0.25 - Math.abs(i - n / 2 + 0.5) * 0.02); ctx.rect(i * sw + sw / 2 * (1 - p), 0, sw * p, H); } }
  else if (type === 'tiles') { const c = 6, r = 7, tw = W / c, th = H / r; for (let y = 0; y < r; y++) for (let x = 0; x < c; x++) { const p = clamp(e * 1.8 - (x + y) / (c + r - 2) * 0.8); if (p > 0) ctx.rect(x * tw + tw / 2 * (1 - p), y * th + th / 2 * (1 - p), tw * p, th * p); } }
  else if (type === 'page') ctx.rect(W * (1 - e), 0, W * e + 1, H);
  else if (type === 'curtain') { if (e >= 0.5) ctx.rect(0, 0, W, H); }
  else return false;
  ctx.clip();
  return true;
}
export function transEdge(ctx, type, e, W, H, seed = 1) {
  ctx.save();
  if (type === 'ink') { for (const b of blobs(seed, W, H)) { const r = b.r * clamp((e - b.d) / (1 - b.d)); if (r > 1) { ctx.beginPath(); blobPath(ctx, b, r); stroke(ctx, P.ink, 3); } } }
  else if (type === 'lattice') { const n = 8, sw = W / n; for (let i = 0; i < n; i++) { const p = clamp(e * 1.4 - (i % 2) * 0.25 - Math.abs(i - n / 2 + 0.5) * 0.02); if (p > 0 && p < 1) for (const x of [i * sw + sw / 2 * (1 - p), i * sw + sw / 2 * (1 + p)]) { ctx.fillStyle = P.gold; ctx.fillRect(x - 3, 0, 6, H); } } }
  else if (type === 'tiles') { const c = 6, r = 7, tw = W / c, th = H / r; for (let y = 0; y < r; y++) for (let x = 0; x < c; x++) { const p = clamp(e * 1.8 - (x + y) / (c + r - 2) * 0.8); if (p > 0 && p < 1) { ctx.strokeStyle = P.turq; ctx.lineWidth = 4; ctx.strokeRect(x * tw + tw / 2 * (1 - p), y * th + th / 2 * (1 - p), tw * p, th * p); } } }
  else if (type === 'page') { // the turning leaf: its paper back, then a soft shadow
    const x = W * (1 - e), fw = 140 * Math.sin(Math.PI * clamp(e));
    const g = ctx.createLinearGradient(x - fw, 0, x, 0); g.addColorStop(0, P.paperDark); g.addColorStop(0.7, P.paperLight); g.addColorStop(1, '#c9b48a');
    ctx.fillStyle = g; ctx.fillRect(x - fw, 0, fw, H); ctx.strokeStyle = P.ink; ctx.lineWidth = 2; ctx.strokeRect(x - fw, -2, fw, H + 4);
    const s = ctx.createLinearGradient(x, 0, x + 60, 0); s.addColorStop(0, 'rgba(0,0,0,0.3)'); s.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = s; ctx.fillRect(x, 0, 60, H);
  } else if (type === 'curtain') { // the booth's curtains close on one scene and open on the next
    const c = ease.inOut(e < 0.5 ? e * 2 : (1 - e) * 2), cw = (W / 2 + 20) * c;
    for (const sx of [-1, 1]) {
      ctx.save(); if (sx > 0) { ctx.translate(W, 0); ctx.scale(-1, 1); }
      ctx.beginPath(); ctx.moveTo(-10, -10); ctx.lineTo(cw, -10); ctx.quadraticCurveTo(cw - 30, H / 2, cw, H + 10); ctx.lineTo(-10, H + 10); ctx.closePath(); fillStroke(ctx, P.verm, P.ink, 3);
      for (let i = 1; i < 6; i++) { ctx.beginPath(); ctx.moveTo(cw * i / 6, -10); ctx.lineTo(cw * i / 6 - 10, H + 10); stroke(ctx, P.vermDark, 3); }
      ctx.restore();
    }
  }
  ctx.restore();
}
export const TRANSITIONS = ['iris', 'wipe', 'unroll', 'flash', 'cut', 'ink', 'lattice', 'tiles', 'page', 'curtain'];
