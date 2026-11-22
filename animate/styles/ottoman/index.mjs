// Ottoman miniature style: puts each scene inside the manuscript page and
// handles chapter titles, transitions, captions and the paper finish.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { GlobalFonts, loadImage } from '@napi-rs/canvas';
import { TAU, clamp, ease, lerp } from '../../lib/core.mjs';
import * as kit from './kit.mjs';
import { paperTexture, headerText, captions, groupLines, progress, outroText } from './page.mjs';
import { getLook, buildPage, ambient, grade, transClip, transEdge } from './looks.mjs';
import { createBrush, frameGlint, signature } from './brush.mjs';
import { createCanvas } from '@napi-rs/canvas';

const require = createRequire(import.meta.url);
export function registerFonts() {
  const f = (pkg, file, name) => GlobalFonts.registerFromPath(path.join(path.dirname(require.resolve(pkg + '/package.json')), 'files', file), name);
  f('@fontsource/cinzel-decorative', 'cinzel-decorative-latin-900-normal.woff2', 'Deco');
  f('@fontsource/cinzel-decorative', 'cinzel-decorative-latin-700-normal.woff2', 'Deco');
  f('@fontsource/cormorant-garamond', 'cormorant-garamond-latin-700-normal.woff2', 'Garamond');
  f('@fontsource/cormorant-garamond', 'cormorant-garamond-latin-600-italic.woff2', 'GaramondItalic');
  f('@fontsource/im-fell-english-sc', 'im-fell-english-sc-latin-400-normal.woff2', 'Fell');
}

const TRANS = 0.42; // seconds a transition takes

// Lobed (scalloped) circle — the reveal shape for the "iris" transition.
function lobedCircle(ctx, cx, cy, r, lobes = 12) {
  ctx.beginPath();
  for (let i = 0; i <= lobes * 8; i++) {
    const a = i / (lobes * 8) * TAU, rr = r * (1 + 0.06 * Math.abs(Math.sin(a * lobes / 2)));
    i ? ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr) : ctx.moveTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
  }
  ctx.closePath();
}

export async function createRenderer(project) {
  registerFonts();
  const { story, words, meta, dir } = project;
  const brand = meta.brand || {};
  let logo = null;
  if (brand.logo && fs.existsSync(path.resolve(dir, brand.logo))) logo = await loadImage(fs.readFileSync(path.resolve(dir, brand.logo)));
  const look = getLook(meta), L = look.layout, C = look.colors;
  // the sign-off seal reads the channel's name from brand/brand.json (next to the logo)
  let brandName = brand.name || '';
  if (!brandName && brand.logo) { const bj = path.join(path.dirname(path.resolve(dir, brand.logo)), 'brand.json'); if (fs.existsSync(bj)) brandName = JSON.parse(fs.readFileSync(bj, 'utf8')).name || ''; }
  const initials = brandName.split(/\s+/).map(w => w[0] || '').join('').toUpperCase().slice(0, 3);
  const signOff = (meta.signature ?? look.name !== 'classic') && meta.outro;
  const page = buildPage(look, { seed: meta.seed || 11, handle: brand.handle, logo });
  const PA = L.paint;
  const grain = paperTexture(PA.w, PA.h, 21);
  const lines = groupLines(words, meta.captionChars || 30);
  // a look brings its own transitions; 'cut' and 'flash' are story beats and stay
  const pick = (s, i) => {
    if (!look.transitions || s.trans === 'cut' || s.trans === 'flash' || s.transLock) return s.trans || 'iris';
    return look.transitions[(i + (meta.seed || 0)) % look.transitions.length];
  };
  const scenes = story.scenes.map((s, i, a) => ({ ...s, i, trans: i ? pick(s, i) : s.trans, end: i + 1 < a.length ? a[i + 1].start : meta.duration }));
  const findWord = (re, after = 0) => { const w = words.find(x => x.start >= after - 0.05 && re.test(x.w)); return w ? w.start : null; };

  const brush = createBrush(PA.w, PA.h);
  const fx = look.sceneFilter ? createCanvas(PA.w, PA.h) : null;
  function drawScene(ctx, sc, t) {
    const u = t - sc.start, d = sc.end - sc.start;
    const inner = c => {
      const S = {
        W: PA.w, H: PA.h, t, u, d, k: kit, P: kit.P, logo,
        // local time of a spoken word inside this scene (regex or string)
        at: w => { const g = findWord(w instanceof RegExp ? w : new RegExp('^' + w, 'i'), sc.start); return g == null ? 0 : g - sc.start; },
        cam(z = 1, cx = PA.w / 2, cy = PA.h / 2, rot = 0) { c.translate(PA.w / 2, PA.h / 2); c.rotate(rot); c.scale(z, z); c.translate(-cx, -cy); },
      };
      c.save();
      if (look.drift) { // a slow push-in (and a little drift sideways) inside every scene
        const q = ease.inOut(clamp(u / Math.max(1, d))), z = 1 + look.drift * q, dx = (sc.i % 2 ? 1 : -1) * 10 * q;
        c.translate(PA.w / 2 + dx, PA.h / 2); c.scale(z, z); c.translate(-PA.w / 2, -PA.h / 2);
      }
      sc.draw(c, u, S); c.restore();
    };
    // the painter's brush washes colour over an ink drawing at the start of each scene
    const D = look.paintIn ? Math.min(look.paintIn, d * 0.45) : 0;
    if (D && u < D && sc.paint !== false) brush.paint(ctx, inner, clamp(u / D), (meta.seed || 1) * 13 + sc.i);
    else if (fx) { const g = fx.getContext('2d'); g.save(); g.clearRect(0, 0, PA.w, PA.h); inner(g); g.restore(); ctx.save(); ctx.filter = look.sceneFilter; ctx.drawImage(fx, 0, 0); ctx.restore(); }
    else inner(ctx);
  }

  return function frame(ctx, t) {
    ctx.drawImage(page, 0, 0);
    const i = Math.max(0, scenes.findLastIndex(s => t >= s.start));
    const sc = scenes[i], prev = scenes[i - 1];
    const kTrans = prev ? (t - sc.start) / TRANS : 1;

    // ---- the painting ----
    ctx.save(); ctx.translate(PA.x, PA.y);
    ctx.beginPath(); ctx.rect(0, 0, PA.w, PA.h); ctx.clip();
    if (kTrans < 1 && prev && sc.trans !== 'cut') {
      drawScene(ctx, prev, t);
      const e = ease.inOut(clamp(kTrans));
      ctx.save();
      const type = sc.trans || 'iris';
      if (transClip(ctx, type, e, PA.w, PA.h, (meta.seed || 1) + sc.i)) { /* look transition */ }
      else if (type === 'iris') { lobedCircle(ctx, PA.w / 2, PA.h / 2, e * PA.h * 0.82); ctx.clip(); }
      else if (type === 'wipe') { ctx.beginPath(); ctx.rect(0, 0, PA.w * e, PA.h); ctx.clip(); }
      else if (type === 'unroll') { ctx.beginPath(); ctx.rect(0, 0, PA.w, PA.h * e); ctx.clip(); }
      else if (type === 'flash') { /* drawn below */ }
      drawScene(ctx, sc, t);
      ctx.restore();
      // gilded edge on the moving boundary
      ctx.save();
      transEdge(ctx, type, e, PA.w, PA.h, (meta.seed || 1) + sc.i);
      if (type === 'iris') { lobedCircle(ctx, PA.w / 2, PA.h / 2, e * PA.h * 0.82); kit.stroke(ctx, kit.P.gold, 8); kit.stroke(ctx, kit.P.ink, 2); }
      else if (type === 'wipe') { ctx.fillStyle = kit.P.gold; ctx.fillRect(PA.w * e - 6, 0, 12, PA.h); }
      else if (type === 'unroll') { // the scroll's rolled edge
        const y = PA.h * e; ctx.fillStyle = kit.P.paperDark; ctx.fillRect(0, y - 14, PA.w, 28); ctx.fillStyle = kit.P.goldDark; ctx.fillRect(0, y - 3, PA.w, 6);
      } else if (type === 'flash') { ctx.globalAlpha = 1 - Math.abs(kTrans * 2 - 1); ctx.fillStyle = kit.P.goldLight; ctx.fillRect(0, 0, PA.w, PA.h); }
      ctx.restore();
    } else drawScene(ctx, sc, t);
    ambient(ctx, look.ambient, t, PA.w, PA.h, meta.seed || 1);
    grade(ctx, look, PA.w, PA.h, t);
    // paper grain + worn pigment
    ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.55; ctx.drawImage(grain, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    ctx.restore();
    // re-draw the frame rules on top so the picture sits inside them
    for (const [o, c, lw] of [[-11, look.frameColor || kit.P.gold, 5], [-1, kit.P.verm, 1.5]]) { ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.strokeRect(PA.x + o, PA.y + o, PA.w - 2 * o, PA.h - 2 * o); }
    if (signOff && t >= meta.outro.at) signature(ctx, PA.x + 44, PA.y + 190, 0.66, (t - meta.outro.at) / 1.3, { initials, ring: ` PAINTED IN CODE · ${brandName.toUpperCase()} ·` }, (x, y, r, ring, inner, k) => kit.seal(ctx, x, y, r, ring, inner, k));
    if (look.glint && prev) frameGlint(ctx, PA.x - 11, PA.y - 11, PA.w + 22, PA.h + 22, (t - sc.start) / 0.9);
    // things that break out of the frame (a miniature tradition)
    if (sc.over) { ctx.save(); ctx.translate(PA.x, PA.y); sc.over(ctx, t - sc.start, { W: PA.w, H: PA.h, k: kit, P: kit.P }); ctx.restore(); }

    // ---- chapter title, captions, progress ----
    headerText(ctx, sc.title, prev ? (t - sc.start) / 0.35 : 1, L, C);
    const spoke = captions(ctx, lines, t, L, C);
    if (!spoke && meta.outro && t >= meta.outro.at) outroText(ctx, meta.outro.text, t - meta.outro.at, L, C);
    progress(ctx, t / meta.duration, L, C);
  };
}

// Where the painting sits on the page in this project's look (used by check-unique.mjs).
export function layoutOf(meta) { return getLook(meta).layout; }
export function lookOf(meta) { return getLook(meta); }
