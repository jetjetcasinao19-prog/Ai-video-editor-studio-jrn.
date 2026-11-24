// The case-file page around the picture: card stock with mirrored ink
// splatters, a header with the plate number (I, II, III… like the ten
// Rorschach plates) and the chapter title, the picture card with its centre
// fold, typewriter captions and a polygraph strip whose pen ticks with the voice.
import { createCanvas } from '@napi-rs/canvas';
import { TAU, clamp, lerp, rng, ease, noise1 } from '../../lib/core.mjs';
import { fitSize, GAP } from '../../lib/retention.mjs';
import { P, rect, line, circle, text, font, blot, paperTexture, mirror, penLine } from './kit.mjs';

export const LAYOUT = {
  W: 1080, H: 1920,
  header: { x: 70, y: 96, w: 940, h: 148 },
  paint: { x: 70, y: 268, w: 940, h: 1060 },
  caption: { x: 70, y: 1352, w: 940, h: 218 },
  footer: { x: 70, y: 1594, w: 940, h: 238 },
};

export const roman = n => { const m = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']]; let s = ''; for (const [v, r] of m) while (n >= v) { s += r; n -= v; } return s; };

// Everything that never moves, drawn once.
export function staticPage(opts = {}) {
  const L = LAYOUT, cv = createCanvas(L.W, L.H), ctx = cv.getContext('2d');
  ctx.fillStyle = P.paper; ctx.fillRect(0, 0, L.W, L.H);
  ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(paperTexture(L.W, L.H, opts.seed || 9), 0, 0); ctx.restore();
  // vignette (old card darkens at the edges)
  const g = ctx.createRadialGradient(L.W / 2, L.H / 2, L.H * 0.3, L.W / 2, L.H / 2, L.H * 0.72);
  g.addColorStop(0, 'rgba(120,90,50,0)'); g.addColorStop(1, 'rgba(120,90,50,0.22)'); ctx.fillStyle = g; ctx.fillRect(0, 0, L.W, L.H);
  // mirrored ink splatters in the margins — the whole page is folded too
  const R = rng(opts.seed || 9);
  mirror(ctx, L.W / 2, c => {
    for (let i = 0; i < 26; i++) {
      const side = R() < 0.5, x = side ? 8 + R() * 50 : 120 + R() * 380, y = side ? 80 + R() * 1760 : (R() < 0.5 ? 14 + R() * 40 : 1850 + R() * 50);
      c.globalAlpha = 0.5 + R() * 0.4; circle(c, x, y, 1.5 + R() * R() * 9, P.ink);
    }
    c.globalAlpha = 1;
  });
  // top line: case-file typewriter text
  text(ctx, opts.caseLine || 'THE MIND FILES  ·  CONFIDENTIAL', L.W / 2, 74, 24, { color: P.inkSoft });
  // header
  const hd = L.header;
  rect(ctx, hd.x, hd.y, hd.w, hd.h, P.card, P.ink, 4);
  line(ctx, hd.x, hd.y + hd.h + 7, hd.x + hd.w, hd.y + hd.h + 7, P.ink, 1.5);
  rect(ctx, hd.x, hd.y, 170, hd.h, P.ink);
  text(ctx, 'PLATE', hd.x + 85, hd.y + 30, 24, { color: P.paperLight });
  // logo slot (right)
  const lx = hd.x + hd.w - 76, ly = hd.y + hd.h / 2;
  if (opts.logo) {
    ctx.save(); ctx.beginPath(); ctx.arc(lx, ly, 56, 0, TAU); ctx.clip(); ctx.drawImage(opts.logo, lx - 56, ly - 56, 112, 112); ctx.restore();
    circle(ctx, lx, ly, 58, null, P.ink, 4);
  } else blot(ctx, lx, ly, 120, 110, { seed: 77, color: P.red, res: 0.7 });
  // picture card
  const pa = L.paint;
  ctx.save(); ctx.shadowColor = 'rgba(40,25,10,0.35)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 8;
  rect(ctx, pa.x - 14, pa.y - 14, pa.w + 28, pa.h + 28, P.card); ctx.restore();
  // registration / crop marks at the card corners
  for (const [x, y, sx, sy] of [[pa.x - 14, pa.y - 14, -1, -1], [pa.x + pa.w + 14, pa.y - 14, 1, -1], [pa.x - 14, pa.y + pa.h + 14, -1, 1], [pa.x + pa.w + 14, pa.y + pa.h + 14, 1, 1]]) {
    line(ctx, x, y + sy * 8, x, y + sy * 30, P.ink, 2); line(ctx, x + sx * 8, y, x + sx * 30, y, P.ink, 2);
  }
  // caption panel: typed sheet
  const cp = L.caption;
  rect(ctx, cp.x, cp.y, cp.w, cp.h, P.paperLight, P.ink, 3);
  for (let y = cp.y + 44; y < cp.y + cp.h; y += 44) line(ctx, cp.x + 16, y, cp.x + cp.w - 16, y, 'rgba(130,160,200,0.18)', 2);
  line(ctx, cp.x + 64, cp.y + 4, cp.x + 64, cp.y + cp.h - 4, 'rgba(198,31,42,0.35)', 2.5);
  // footer: polygraph paper + handle
  const ft = L.footer, gy = ft.y + 14, gh = 140;
  rect(ctx, ft.x, gy, ft.w, gh, '#f6efe9', P.ink, 3);
  ctx.save(); ctx.globalAlpha = 0.28;
  for (let x = ft.x; x <= ft.x + ft.w; x += 20) line(ctx, x, gy, x, gy + gh, x % 100 === ft.x % 100 ? P.red : P.redLight, x % 100 === ft.x % 100 ? 2 : 1);
  for (let y = gy; y <= gy + gh; y += 20) line(ctx, ft.x, y, ft.x + ft.w, y, P.redLight, 1);
  ctx.restore();
  text(ctx, 'EEG · SUBJECT: YOU', ft.x + 16, gy + 22, 20, { align: 'left', color: P.redDark });
  if (opts.handle) {
    font(ctx, 40, 'serif'); const w = ctx.measureText(opts.handle).width + 70;
    rect(ctx, L.W / 2 - w / 2, ft.y + 172, w, 58, P.ink, null, 0, 29);
    text(ctx, opts.handle, L.W / 2, ft.y + 202, 34, { font: 'serif', color: P.paperLight });
    blot(ctx, L.W / 2 - w / 2 - 50, ft.y + 201, 60, 40, { seed: 12, color: P.red, res: 0.8 });
    blot(ctx, L.W / 2 + w / 2 + 50, ft.y + 201, 60, 40, { seed: 12, color: P.red, res: 0.8 });
  }
  return cv;
}

// Plate numeral + chapter title; the title types on and a red pen underlines it.
export function headerText(ctx, title, plate, k = 1) {
  const hd = LAYOUT.header;
  const e = ease.outBack(clamp(k * 1.4));
  ctx.save(); ctx.translate(hd.x + 85, hd.y + 92); ctx.scale(e, e);
  text(ctx, roman(plate), 0, 0, plate > 8 ? 62 : 78, { font: 'display', color: P.paperLight, max: 150 });
  ctx.restore();
  const x0 = hd.x + 196, maxW = hd.w - 196 - 160;
  ctx.save(); ctx.beginPath(); ctx.rect(x0 - 6, hd.y + 4, maxW + 20, hd.h - 8); ctx.clip();
  let size = 58; font(ctx, size, 'italic');
  while (ctx.measureText(title).width > maxW && size > 26) font(ctx, size -= 2, 'italic');
  const n = Math.ceil(title.length * clamp(k * 1.6));
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = P.ink; ctx.fillText(title.slice(0, n), x0, hd.y + hd.h / 2 - 6);
  const tw = ctx.measureText(title).width;
  penLine(ctx, [[x0, hd.y + hd.h / 2 + size * 0.5], [x0 + tw * 0.5, hd.y + hd.h / 2 + size * 0.56], [x0 + tw + 10, hd.y + hd.h / 2 + size * 0.48]], clamp(k * 1.6 - 0.6), P.red, 6, title.length);
  ctx.restore();
}

// Polygraph: the pen draws the voice's activity up to now.
export function makePolygraph(words, duration) {
  const act = t => { let a = 0; for (const w of words) { if (t >= w.start - 0.05 && t <= w.end + 0.05) a = 1; } return a; };
  const N = 900, ft = LAYOUT.footer, gy = ft.y + 14 + 70;
  const ys = new Float32Array(N + 1);
  let env = 0;
  for (let i = 0; i <= N; i++) {
    const t = i / N * duration, a = act(t);
    env = lerp(env, a, a > env ? 0.6 : 0.12);
    ys[i] = gy + (noise1(t * 14, 3) * 0.75 + noise1(t * 47, 8) * 0.25) * (8 + 46 * env) + Math.sin(t * 9) * 3;
  }
  return function polygraph(ctx, t) {
    const k = clamp(t / duration), n = Math.max(1, Math.floor(N * k)), x = i => ft.x + 10 + i / N * (ft.w - 20);
    ctx.beginPath(); ctx.moveTo(x(0), ys[0]); for (let i = 1; i <= n; i++) ctx.lineTo(x(i), ys[i]);
    ctx.strokeStyle = P.ink; ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.stroke();
    // the pen arm and its red nib
    const px = x(n), py = ys[n];
    line(ctx, px, py, px + 30, ft.y + 14 - 4, P.inkSoft, 4);
    circle(ctx, px, py, 7, P.red, P.ink, 2);
  };
}

// Word-by-word typewriter captions: the spoken word in red with a marker swipe.
// One big bold caption line (Playfair Display 900 — the typewriter face was
// too thin to read at phone size), red marker on the spoken word, kept inside
// x ≈ 150–960 so YouTube's buttons on the right never cover it.
export const CAPTION_SAFE_W = 800;
export function captions(ctx, lines, t) {
  const cp = LAYOUT.caption;
  const line_ = lines.findLast(l => t >= l[0].start - 0.15 && t < l[l.length - 1].end + 0.35) || null;
  if (!line_) return false;
  const fnt = s => `900 ${s}px Display`;
  const size = fitSize(ctx, line_.map(w => w.w), fnt, CAPTION_SAFE_W, 84, 60);
  const space = size * GAP;
  const rows = [[]]; let w = 0;
  for (const word of line_) { const ww = ctx.measureText(word.w).width; if (w + ww > CAPTION_SAFE_W + 0.5 && rows[rows.length - 1].length) { rows.push([]); w = 0; } rows[rows.length - 1].push({ ...word, ww }); w += ww + space; }
  const lh = size * 1.1, y0 = cp.y + cp.h / 2 - (rows.length - 1) * lh / 2 - 2;
  const fadeIn = clamp((t - (line_[0].start - 0.15)) / 0.12);
  const cur = line_.findLast(x => t >= x.start);
  ctx.save(); ctx.textBaseline = 'middle'; ctx.globalAlpha = fadeIn;
  rows.forEach((row, ri) => {
    const total = row.reduce((s, x) => s + x.ww, 0) + space * (row.length - 1);
    let x = cp.x + 32 + (cp.w - 32) / 2 - total / 2;
    for (const word of row) {
      const active = cur && word.start === cur.start && t < word.end + 0.3, said = t >= word.start;
      const k = active ? ease.outBack(clamp((t - word.start) / 0.16)) : 0;
      ctx.save(); ctx.translate(x + word.ww / 2, y0 + ri * lh - k * 6); ctx.scale(1 + k * 0.06, 1 + k * 0.06);
      if (active) { // red marker swipe behind the word
        ctx.save(); ctx.globalAlpha *= 0.22; rect(ctx, -word.ww / 2 - 10, -size * 0.46, (word.ww + 20) * clamp((t - word.start) / 0.14), size * 0.92, P.red, null, 0, 8); ctx.restore();
      }
      ctx.textAlign = 'center';
      ctx.fillStyle = active ? P.red : said ? P.ink : 'rgba(22,20,26,0.5)';
      ctx.fillText(word.w, 0, 0);
      ctx.restore();
      x += word.ww + space;
    }
  });
  ctx.restore();
  return true;
}

// Closing line in the caption panel (the brand's call to action).
export function outroText(ctx, s, q) {
  const cp = LAYOUT.caption, e = ease.outBack(clamp(q / 0.4));
  ctx.save(); ctx.globalAlpha = clamp(q / 0.25); ctx.translate(cp.x + cp.w / 2 + 16, cp.y + cp.h / 2 + 2); ctx.scale(e, e);
  text(ctx, s, 0, 0, 58, { font: 'italic', color: P.red, max: cp.w - 140 });
  ctx.restore();
}
