// Ready-made backdrops for INKBLOT storyboards. Each takes (ctx, S, options)
// and paints the whole plate (S.W × S.H = 940 × 1060).
import { clamp, lerp, rng, TAU, ease } from '../../lib/core.mjs';
import { P, rect, line, circle, ellipse, poly, blot, mirror, bistroTable, cafeChair, moon, text, fill, stroke } from './kit.mjs';

// A blank plate with a faint living blot behind everything.
export function plate(ctx, S, o = {}) {
  const { W, H } = S;
  ctx.fillStyle = o.bg || P.card; ctx.fillRect(-200, -200, W + 400, H + 400);
  if (o.blot !== false) blot(ctx, W / 2, o.y ?? H / 2, o.w || 820, o.h || 900, { seed: o.seed || 3, color: o.color || P.ink, alpha: o.alpha ?? 0.1, live: 1, t: S.t, res: 0.25 });
}

// Berlin café, 1920s: arched windows, globe lamps, checkered floor, bentwood chairs.
export function cafe(ctx, S, o = {}) {
  const { W, H } = S, floor = o.floor ?? 760;
  ctx.fillStyle = P.ink; ctx.fillRect(-300, -300, W + 600, floor + 300);
  // windows (paper light coming in) with "CAFÉ" painted mirrored on the glass
  for (const x of [130, W / 2, W - 130]) {
    ctx.beginPath(); ctx.moveTo(x - 110, floor - 140); ctx.lineTo(x - 110, 180); ctx.arc(x, 180, 110, Math.PI, 0); ctx.lineTo(x + 110, floor - 140); ctx.closePath(); fill(ctx, P.paperDark);
    line(ctx, x, 70, x, floor - 140, P.ink, 8); line(ctx, x - 110, 330, x + 110, 330, P.ink, 8);
    if (x === W / 2 && o.sign !== false) { ctx.save(); ctx.translate(x, 250); ctx.scale(-1, 1); text(ctx, 'CAFÉ', 0, 0, 56, { font: 'serif', color: P.red }); ctx.restore(); }
  }
  // street outside: silhouettes of a tram line & buildings in the windows
  ctx.save(); ctx.globalAlpha = 0.35;
  for (let i = 0; i < 9; i++) rect(ctx, -40 + i * 120, 380 - (i * 53) % 120, 90, 300, P.grey);
  ctx.restore();
  // hanging globe lamps
  for (const x of [250, W - 250]) {
    line(ctx, x, -10, x, 110, P.paperDark, 3);
    const g = ctx.createRadialGradient(x, 140, 4, x, 140, 120); g.addColorStop(0, 'rgba(255,240,190,0.55)'); g.addColorStop(1, 'rgba(255,240,190,0)');
    ctx.fillStyle = g; ctx.fillRect(x - 130, 20, 260, 260);
    circle(ctx, x, 140, 30, '#fff3cf', P.paperDark, 3);
  }
  // checkered floor in perspective
  ctx.fillStyle = P.paperLight; ctx.fillRect(-300, floor, W + 600, H - floor + 300);
  const vx = W / 2, rows = 7;
  for (let r = 0; r < rows; r++) {
    const y0 = floor + (H - floor) * Math.pow(r / rows, 1.6), y1 = floor + (H - floor) * Math.pow((r + 1) / rows, 1.6);
    for (let c = -9; c < 9; c++) {
      if ((r + c) % 2 === 0) continue;
      const x = k => vx + (c + k) * 130 * lerp(0.55, 1.6, (y0 - floor) / (H - floor));
      const xb = k => vx + (c + k) * 130 * lerp(0.55, 1.6, (y1 - floor) / (H - floor));
      poly(ctx, [[x(0), y0], [x(1), y0], [xb(1), y1], [xb(0), y1]], P.ink);
    }
  }
  line(ctx, -300, floor, W + 300, floor, P.ink, 10);
  if (o.furniture !== false) {
    cafeChair(ctx, 120, floor + 120, 1.1, 1); cafeChair(ctx, W - 120, floor + 120, 1.1, -1);
    bistroTable(ctx, o.tableX ?? W / 2, floor + 150, 1.3);
  }
}

// A 1920s study / lab: bookshelves, a desk lamp's pool of light, a window.
export function study(ctx, S, o = {}) {
  const { W, H } = S, floor = o.floor ?? 820;
  ctx.fillStyle = P.paperDark; ctx.fillRect(-300, -300, W + 600, H + 600);
  // bookshelf silhouettes
  const R = rng(o.seed || 4);
  rect(ctx, -20, 60, 300, floor - 60, P.ink);
  for (let s = 0; s < 5; s++) { let x = 0; const y = 90 + s * 140; while (x < 250) { const w = 14 + R() * 22, h = 70 + R() * 50; rect(ctx, x + 6, y + 120 - h, w, h, [P.inkSoft, P.redDark, P.grey, P.paper][Math.floor(R() * 4)], P.ink, 2); x += w + 2; } line(ctx, -20, y + 122, 280, y + 122, P.paperDark, 6); }
  // window with a night or day sky
  rect(ctx, W - 330, 120, 250, 330, o.night ? P.inkSoft : P.sky, P.ink, 10);
  line(ctx, W - 205, 120, W - 205, 450, P.ink, 8); line(ctx, W - 330, 285, W - 80, 285, P.ink, 8);
  if (o.night) moon(ctx, W - 150, 190, 34);
  // floor + desk
  ctx.fillStyle = P.inkSoft; ctx.fillRect(-300, floor, W + 600, H);
  if (o.desk !== false) {
    rect(ctx, 300, floor - 190, 560, 30, P.ink); rect(ctx, 330, floor - 160, 26, 160, P.ink); rect(ctx, 800, floor - 160, 26, 160, P.ink);
    // lamp + light pool
    const g = ctx.createRadialGradient(700, floor - 200, 10, 700, floor - 200, 300); g.addColorStop(0, 'rgba(255,238,180,0.65)'); g.addColorStop(1, 'rgba(255,238,180,0)');
    ctx.fillStyle = g; ctx.fillRect(380, floor - 500, 640, 520);
    line(ctx, 760, floor - 190, 720, floor - 330, P.ink, 8); poly(ctx, [[680, floor - 360], [770, floor - 330], [740, floor - 290], [650, floor - 320]], P.red, P.ink, 4);
  }
}

// Night: an ink-dark bedroom with moonlight.
export function night(ctx, S, o = {}) {
  const { W, H } = S;
  ctx.fillStyle = '#1d1b26'; ctx.fillRect(-300, -300, W + 600, H + 600);
  rect(ctx, W / 2 - 160, 120, 320, 360, '#2f3450', P.ink, 12);
  moon(ctx, W / 2 + 60, 220, 50, P.paperLight);
  const R = rng(9); for (let i = 0; i < 24; i++) circle(ctx, W / 2 - 150 + R() * 300, 130 + R() * 340, 1 + R() * 2.2, P.paperLight);
  line(ctx, W / 2, 120, W / 2, 480, P.ink, 10); line(ctx, W / 2 - 160, 300, W / 2 + 160, 300, P.ink, 10);
  // moonlight shaft on the floor
  ctx.save(); ctx.globalAlpha = 0.12; poly(ctx, [[W / 2 - 160, 480], [W / 2 + 160, 480], [W / 2 + 330, H], [W / 2 - 250, H]], P.paperLight); ctx.restore();
}

// Dreamscape: a flat endless plain under a sky of drifting mirrored blots.
export function dream(ctx, S, o = {}) {
  const { W, H } = S, hz = o.horizon ?? 640;
  const g = ctx.createLinearGradient(0, 0, 0, hz); g.addColorStop(0, o.sky || '#9fb8cf'); g.addColorStop(1, P.paperLight);
  ctx.fillStyle = g; ctx.fillRect(-300, -300, W + 600, hz + 300);
  for (let i = 0; i < 3; i++) {
    const x = ((i * 380 + S.t * 18) % (W + 500)) - 250;
    blot(ctx, x, 140 + i * 130, 260, 120, { seed: 50 + i, color: P.paperLight, live: 1, t: S.t, res: 0.35, splatter: 0 });
  }
  ctx.fillStyle = o.ground || P.paperDark; ctx.fillRect(-300, hz, W + 600, H - hz + 300);
  ctx.save(); ctx.globalAlpha = 0.25; for (let i = 0; i < 14; i++) { const x = W / 2 + (i - 7) * 160; line(ctx, W / 2 + (x - W / 2) * 0.12, hz, x * 3 - W, H + 200, P.ink, 2); } ctx.restore();
  line(ctx, -300, hz, W + 300, hz, P.ink, 4);
}
