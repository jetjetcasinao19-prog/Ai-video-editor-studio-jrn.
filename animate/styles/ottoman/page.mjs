// The manuscript page around the painting: marbled (ebru) margins, an
// illuminated header (serlevha) with the chapter title, gold-ruled frame
// (cetvel), the caption panel and the footer band with the progress reed.
import { createCanvas } from '@napi-rs/canvas';
import { TAU, clamp, lerp, rng, ease } from '../../lib/core.mjs';
import { P, cartouche, circle, ellipse, stroke, fillStroke, shade, tulip, carnation } from './kit.mjs';

export const LAYOUT = {
  W: 1080, H: 1920,
  header: { x: 70, y: 92, w: 940, h: 150 },
  paint: { x: 70, y: 268, w: 940, h: 1060 },
  caption: { x: 70, y: 1356, w: 940, h: 214 },
  footer: { x: 70, y: 1596, w: 940, h: 236 },
};

// ---------- ebru: mathematical marbling ----------
// Ink drops push earlier ink outward (p' = c + (p-c)·√(1+r²/|p-c|²)); combs
// drag ink along a line (shift parallel to the line, so exactly invertible).
// Every pixel is traced backwards through the operations to find its colour.
export function ebru(w, h, seed = 11, palette = ['#22407f', '#c98a2e', '#b8574e', '#efe2c0', '#2f7f7a', '#18264a']) {
  const R = rng(seed), ops = [];
  // stone ebru: ink dropped in rings (each new drop pushes the old ones out)
  for (let i = 0; i < 70; i++) {
    const x = R() * w, y = R() * h, r = (0.025 + R() * 0.05) * w, c = Math.floor(R() * palette.length);
    for (let ring = 0; ring < 3; ring++) ops.push({ k: 'drop', x, y, r: r * (1 - ring * 0.3), c: (c + ring * 2) % palette.length });
  }
  // gel-git: comb up and down, then across, then a gentle wave → feathered veins
  for (let i = 0; i < 4; i++) ops.push({ k: 'combY', spacing: w / (6 + i * 2), shift: (i % 2 ? -1 : 1) * h * 0.06, phase: R() * 50 });
  for (let i = 0; i < 2; i++) ops.push({ k: 'combX', spacing: h / (10 + i * 4), shift: (i % 2 ? -1 : 1) * w * 0.05, phase: R() * 50 });
  ops.push({ k: 'wave', amp: w * 0.02, period: h / 6 });
  const cols = palette.map(c => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]);
  const img = new Uint8ClampedArray(w * h * 4);
  for (let py = 0; py < h; py++) for (let px = 0; px < w; px++) {
    let x = px, y = py, col = 3;
    for (let i = ops.length - 1; i >= 0; i--) {
      const o = ops[i];
      if (o.k === 'wave') x -= Math.sin(y / o.period * TAU) * o.amp;
      else if (o.k === 'combX') { const d = Math.abs(((y + o.phase) % o.spacing + o.spacing) % o.spacing - o.spacing / 2); x -= o.shift * (1 - d / (o.spacing / 2)) ** 2; }
      else if (o.k === 'combY') { const d = Math.abs(((x + o.phase) % o.spacing + o.spacing) % o.spacing - o.spacing / 2); y -= o.shift * (1 - d / (o.spacing / 2)) ** 2; }
      else { // drop
        const dx = x - o.x, dy = y - o.y, d2 = dx * dx + dy * dy, r2 = o.r * o.r;
        if (d2 < r2) { col = o.c; break; }
        const k = Math.sqrt(1 - r2 / d2); x = o.x + dx * k; y = o.y + dy * k;
      }
    }
    const c = cols[col], j = (py * w + px) * 4;
    img[j] = c[0]; img[j + 1] = c[1]; img[j + 2] = c[2]; img[j + 3] = 255;
  }
  const cv = createCanvas(w, h);
  const id = cv.getContext('2d').createImageData(w, h); id.data.set(img);
  cv.getContext('2d').putImageData(id, 0, 0);
  return cv;
}

// Aged paper grain (multiplied over paintings so they look painted on paper).
export function paperTexture(w, h, seed = 5) {
  const cv = createCanvas(w, h), x = cv.getContext('2d');
  const id = x.createImageData(w, h), d = id.data, R = rng(seed);
  for (let i = 0; i < w * h; i++) {
    const v = 236 + R() * 19 - (R() < 0.004 ? 40 : 0);
    d[i * 4] = v; d[i * 4 + 1] = v - 6; d[i * 4 + 2] = v - 18; d[i * 4 + 3] = 255;
  }
  x.putImageData(id, 0, 0);
  // fibres + foxing spots
  for (let i = 0; i < 260; i++) {
    x.strokeStyle = `rgba(120,90,50,${0.04 + R() * 0.06})`; x.lineWidth = 1;
    const a = R() * w, b = R() * h; x.beginPath(); x.moveTo(a, b); x.quadraticCurveTo(a + R() * 30 - 15, b + R() * 30 - 15, a + R() * 50 - 25, b + R() * 50 - 25); x.stroke();
  }
  for (let i = 0; i < 18; i++) { const g = x.createRadialGradient(0, 0, 0, 0, 0, 30); g.addColorStop(0, 'rgba(160,110,50,0.12)'); g.addColorStop(1, 'rgba(160,110,50,0)'); x.save(); x.translate(R() * w, R() * h); x.fillStyle = g; x.fillRect(-30, -30, 60, 60); x.restore(); }
  // darker, worn edges
  const v = x.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
  v.addColorStop(0, 'rgba(255,255,255,0)'); v.addColorStop(1, 'rgba(140,100,50,0.35)');
  x.fillStyle = v; x.fillRect(0, 0, w, h);
  return cv;
}

// Golden scrolling vine (rumi/hatayi) along a band.
export function vineBand(ctx, x, y, w, h, color = P.goldLight, bg = P.lapis) {
  ctx.fillStyle = bg; ctx.fillRect(x, y, w, h);
  const n = Math.max(2, Math.round(w / h / 1.2)), cy = y + h / 2, step = w / n;
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.beginPath(); ctx.moveTo(x, cy);
  for (let i = 0; i < n; i++) ctx.bezierCurveTo(x + i * step + step * 0.25, cy - h * 0.38 * (i % 2 ? -1 : 1), x + i * step + step * 0.75, cy - h * 0.38 * (i % 2 ? -1 : 1), x + (i + 1) * step, cy);
  stroke(ctx, color, 2);
  for (let i = 0; i < n; i++) {
    const sx = x + i * step + step / 2, sy = cy - h * 0.28 * (i % 2 ? -1 : 1);
    ctx.save(); ctx.translate(sx, sy); ctx.rotate(i % 2 ? Math.PI : 0);
    // palmette leaf
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-h * 0.25, -h * 0.05, -h * 0.08, -h * 0.28); ctx.quadraticCurveTo(0, -h * 0.12, h * 0.08, -h * 0.28); ctx.quadraticCurveTo(h * 0.25, -h * 0.05, 0, 0);
    ctx.fillStyle = color; ctx.fill();
    ctx.restore();
    circle(ctx, x + (i + 1) * step, cy, h * 0.07, P.verm, color, 1.2);
  }
  ctx.restore();
}
export function rules(ctx, x, y, w, h) {
  // cetvel: ink, gold, ink, blue, red hairlines around the painting
  const lines = [[-14, P.ink, 1.5], [-11, P.gold, 5], [-7, P.ink, 1.2], [-4, P.lapis, 2.5], [-1, P.verm, 1.5]];
  for (const [o, c, lw] of lines) { ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.strokeRect(x + o, y + o, w - 2 * o, h - 2 * o); }
}
export function cornerRosette(ctx, x, y, r) {
  for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; ellipse(ctx, x + Math.cos(a) * r * 0.55, y + Math.sin(a) * r * 0.55, r * 0.42, r * 0.2, a, i % 2 ? P.verm : P.goldLight, P.goldDeep, 1); }
  circle(ctx, x, y, r * 0.32, P.lapis, P.goldLight, 2);
}

// Everything that never moves, drawn once.
export function staticPage(opts = {}) {
  const L = LAYOUT, cv = createCanvas(L.W, L.H), ctx = cv.getContext('2d');
  // marbled margins (computed at quarter area, scaled up = softer veins)
  const eb = ebru(L.W / 2, L.H / 2, opts.seed || 11);
  ctx.drawImage(eb, 0, 0, L.W, L.H);
  // the page
  ctx.fillStyle = P.paper; ctx.fillRect(36, 56, L.W - 72, L.H - 104);
  const tex = paperTexture(L.W - 72, L.H - 104, 9);
  ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(tex, 36, 56); ctx.restore();
  ctx.strokeStyle = P.goldDark; ctx.lineWidth = 3; ctx.strokeRect(44, 64, L.W - 88, L.H - 120);
  ctx.strokeStyle = P.ink; ctx.lineWidth = 1.2; ctx.strokeRect(50, 70, L.W - 100, L.H - 132);
  // header plate
  const hd = L.header;
  vineBand(ctx, hd.x, hd.y, hd.w, hd.h, P.goldLight, P.lapis);
  rules(ctx, hd.x, hd.y, hd.w, hd.h);
  cartouche(ctx, hd.x + hd.w / 2 - 50, hd.y + hd.h / 2, 690, 108, P.paperLight, P.goldDark, 4);
  cornerRosette(ctx, hd.x + 62, hd.y + hd.h / 2, 46);
  // logo medallion slot (right)
  circle(ctx, hd.x + hd.w - 78, hd.y + hd.h / 2, 66, P.goldLight, P.goldDeep, 3);
  // painting frame base
  rules(ctx, L.paint.x, L.paint.y, L.paint.w, L.paint.h);
  // caption panel: gold cloud reserves on cream
  const cp = L.caption;
  ctx.fillStyle = P.paperLight; ctx.fillRect(cp.x, cp.y, cp.w, cp.h);
  rules(ctx, cp.x, cp.y, cp.w, cp.h);
  ctx.save(); ctx.globalAlpha = 0.25;
  for (const [cx, sgn] of [[cp.x + 40, 1], [cp.x + cp.w - 40, -1]]) for (let k = 0; k < 3; k++) {
    ctx.beginPath(); ctx.arc(cx + sgn * k * 14, cp.y + 40 + k * 66, 26, 0, TAU); ctx.fillStyle = P.gold; ctx.fill();
  }
  ctx.restore();
  // footer: illuminated band with tulips and carnations
  const ft = L.footer;
  vineBand(ctx, ft.x, ft.y, ft.w, 46, P.goldLight, P.verm);
  rules(ctx, ft.x, ft.y, ft.w, 46);
  ctx.fillStyle = P.paperLight; ctx.fillRect(ft.x, ft.y + 70, ft.w, ft.h - 70);
  rules(ctx, ft.x, ft.y + 70, ft.w, ft.h - 70);
  for (let i = 0; i < 9; i++) {
    const fx = ft.x + 60 + i * (ft.w - 120) / 8;
    if (i === 4) continue;
    if (i % 2) carnation(ctx, fx, ft.y + ft.h - 20, 1.3, i % 4 === 1 ? P.verm : P.lapisLight);
    else tulip(ctx, fx, ft.y + ft.h - 18, 1.15, i % 4 === 0 ? P.verm : P.ochre);
  }
  if (opts.handle) {
    ctx.font = '700 30px Fell'; const tw = ctx.measureText(opts.handle).width + 80;
    cartouche(ctx, ft.x + ft.w / 2, ft.y + 112, tw, 56, P.lapis, P.goldLight, 3);
    ctx.fillStyle = P.goldLight; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(opts.handle, ft.x + ft.w / 2, ft.y + 114);
  }
  if (opts.logo) {
    ctx.save(); ctx.beginPath(); ctx.arc(hd.x + hd.w - 78, hd.y + hd.h / 2, 60, 0, TAU); ctx.clip();
    ctx.drawImage(opts.logo, hd.x + hd.w - 138, hd.y + hd.h / 2 - 60, 120, 120); ctx.restore();
  }
  return cv;
}

// Chapter title in the header cartouche; animates when it changes.
// L = layout (a look can move the title), C = colours.
export function titleBox(L = LAYOUT) {
  if (L.title) return L.title;
  const hd = L.header; return { cx: hd.x + hd.w / 2 - 50, cy: hd.y + hd.h / 2 + 3, w: 640, h: 100 };
}
export function headerText(ctx, text, k = 1, L = LAYOUT, C = {}) {
  const tb = titleBox(L), cx = tb.cx, cy = tb.cy;
  ctx.save();
  ctx.beginPath(); ctx.rect(cx - tb.w / 2, cy - tb.h / 2, tb.w, tb.h); ctx.clip();
  const e = ease.outCubic(clamp(k));
  ctx.globalAlpha = e; ctx.translate(cx, cy + (1 - e) * 30);
  let size = C.titleSize || 46; ctx.font = `900 ${size}px Deco`;
  while (ctx.measureText(text).width > tb.w - 40 && size > 22) { size -= 2; ctx.font = `900 ${size}px Deco`; }
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = C.title || P.verm; ctx.fillText(text, 0, 0);
  ctx.restore();
}

// Progress reed: a gold line that grows under the caption panel, with a tulip tip.
export function progress(ctx, k, L = LAYOUT, C = {}) {
  const cp = L.caption, y = cp.y + cp.h + (L.reedGap ?? 13), x0 = cp.x, x1 = cp.x + cp.w * clamp(k);
  ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); stroke(ctx, C.reed || P.gold, 5);
  circle(ctx, x1, y, 7, C.reedTip || P.verm, P.goldDeep, 1.5);
}

// Word-by-word caption with the spoken word in vermilion.
export function captions(ctx, lines, t, L = LAYOUT, C = {}) {
  const cp = L.caption;
  const line = lines.findLast(l => t >= l[0].start - 0.15 && t < l[l.length - 1].end + 0.35) || null;
  if (!line) return false;
  const size = 70; ctx.font = `700 ${size}px Garamond`;
  const space = size * 0.36;
  // wrap into rows that fit the panel
  const rows = [[]]; let w = 0;
  for (const word of line) { const ww = ctx.measureText(word.w).width; if (w + ww > cp.w - 90 && rows[rows.length - 1].length) { rows.push([]); w = 0; } rows[rows.length - 1].push({ ...word, ww }); w += ww + space; }
  // never leave one short word alone on the last row: move a word down
  if (rows.length > 1) { const last = rows[rows.length - 1], prev = rows[rows.length - 2]; if (last.length === 1 && prev.length >= 3) last.unshift(prev.pop()); }
  const lh = size * 1.12, y0 = cp.y + cp.h / 2 - (rows.length - 1) * lh / 2 + 4;
  const fadeIn = 0.35 + 0.65 * clamp((t - (line[0].start - 0.15)) / 0.15);
  // only the newest word that has started is highlighted
  const cur = line.findLast(w => t >= w.start);
  ctx.save(); ctx.textBaseline = 'middle'; ctx.globalAlpha = fadeIn;
  rows.forEach((row, ri) => {
    const total = row.reduce((s, x) => s + x.ww, 0) + space * (row.length - 1);
    let x = cp.x + cp.w / 2 - total / 2;
    for (const word of row) {
      const active = cur && word.start === cur.start && t < word.end + 0.3, said = t >= word.start;
      const k = active ? ease.outBack(clamp((t - word.start) / 0.18)) : 0;
      ctx.save(); ctx.translate(x + word.ww / 2, y0 + ri * lh - k * 6); ctx.scale(1 + k * 0.06, 1 + k * 0.06);
      ctx.textAlign = 'center';
      if (active) { ctx.beginPath(); ctx.moveTo(-word.ww / 2, size * 0.42); ctx.quadraticCurveTo(0, size * 0.58, word.ww / 2, size * 0.42); stroke(ctx, C.under || P.gold, 4); }
      ctx.fillStyle = active ? (C.active || P.verm) : said ? (C.ink || P.ink) : (C.dim || 'rgba(42,28,18,0.38)');
      ctx.fillText(word.w, 0, 0);
      ctx.restore();
      x += word.ww + space;
    }
  });
  ctx.restore();
  return true;
}

// Closing line in the caption panel (e.g. the brand's call to action).
export function outroText(ctx, text, q, L = LAYOUT, C = {}) {
  const cp = L.caption, e = ease.outBack(clamp(q / 0.4));
  ctx.save(); ctx.globalAlpha = clamp(q / 0.25); ctx.translate(cp.x + cp.w / 2, cp.y + cp.h / 2 + 4); ctx.scale(e, e);
  let size = 54; ctx.font = `700 ${size}px GaramondItalic`;
  while (ctx.measureText(text).width > cp.w - 100 && size > 30) { size -= 2; ctx.font = `700 ${size}px GaramondItalic`; }
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = C.outro || P.lapis; ctx.fillText(text, 0, 0);
  ctx.restore();
}

// Group words into caption lines (sentence ends and pauses break lines).
export function groupLines(words, maxChars = 30, maxGap = 0.55, maxDur = 2.8) {
  const lines = []; let cur = [];
  const flush = () => { if (cur.length) lines.push(cur); cur = []; };
  for (const w of words) {
    const last = cur[cur.length - 1], text = cur.map(x => x.w).join(' ');
    const len = (text + ' ' + w.w).length;
    // a sentence's last word may run a little long rather than sit alone on a line
    const tooLong = len > maxChars && !(/[.!?]$/.test(w.w) && len <= maxChars + 10);
    if (cur.length && (tooLong || w.start - last.end > maxGap || w.end - cur[0].start > maxDur + (/[.!?]$/.test(w.w) ? 0.8 : 0))) flush();
    cur.push(w);
    if (/[.!?]$/.test(w.w)) flush();
  }
  flush();
  return lines;
}
