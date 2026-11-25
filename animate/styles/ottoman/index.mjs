// Ottoman miniature style: puts each scene inside the manuscript page and
// handles chapter titles, transitions, captions and the paper finish.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { GlobalFonts, loadImage, createCanvas } from '@napi-rs/canvas';
import { TAU, clamp, ease, lerp } from '../../lib/core.mjs';
import * as kit from './kit.mjs';
import { LAYOUT, staticPage, paperTexture, headerText, captions, groupLines, progress, outroText } from './page.mjs';
import { hookCard, hookUntil } from '../../lib/retention.mjs';
import { createFinish } from '../../lib/finish.mjs';

// Hook card look: gold-on-lapis like the header plate, vermilion accent word.
export const HOOK_THEME = { font: s => `900 ${s}px Display`, fill: '#f7eed6', accent: '#f2c94c', stroke: '#14213f', band: '#20408f', bandEdge: '#e2b84a', label: '#14213f' };

const require = createRequire(import.meta.url);
export function registerFonts() {
  const f = (pkg, file, name) => GlobalFonts.registerFromPath(path.join(path.dirname(require.resolve(pkg + '/package.json')), 'files', file), name);
  f('@fontsource/cinzel-decorative', 'cinzel-decorative-latin-900-normal.woff2', 'Deco');
  f('@fontsource/cinzel-decorative', 'cinzel-decorative-latin-700-normal.woff2', 'Deco');
  f('@fontsource/cormorant-garamond', 'cormorant-garamond-latin-700-normal.woff2', 'Garamond');
  f('@fontsource/cormorant-garamond', 'cormorant-garamond-latin-600-italic.woff2', 'GaramondItalic');
  f('@fontsource/im-fell-english-sc', 'im-fell-english-sc-latin-400-normal.woff2', 'Fell');
  f('@fontsource/playfair-display', 'playfair-display-latin-900-normal.woff2', 'Display'); // captions + hook card
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
  const page = staticPage({ seed: meta.seed || 11, handle: brand.handle, logo });
  const PA = LAYOUT.paint;
  const grain = paperTexture(PA.w, PA.h, 21);
  const lines = groupLines(words, meta.captionChars || 18);
  const hookEnd = meta.hook ? hookUntil(meta.hook, words) : 0;
  const scenes = story.scenes.map((s, i, a) => ({ ...s, end: i + 1 < a.length ? a[i + 1].start : meta.duration }));
  const findWord = (re, after = 0) => { const w = words.find(x => x.start >= after - 0.05 && re.test(x.w)); return w ? w.start : null; };
  // the hand-made finish (lib/finish.mjs): line boil, gold-leaf sheen, paper, grain, on twos
  const finish = createFinish(meta, PA.w, PA.h, meta.width, meta.height);
  const paintCv = finish ? createCanvas(PA.w, PA.h) : null;

  function drawScene(ctx, sc, t) {
    const u = t - sc.start;
    const S = {
      W: PA.w, H: PA.h, t, u, d: sc.end - sc.start, k: kit, P: kit.P, logo,
      // local time of a spoken word inside this scene (regex or string)
      at: w => { const g = findWord(w instanceof RegExp ? w : new RegExp('^' + w, 'i'), sc.start); return g == null ? 0 : g - sc.start; },
      cam(z = 1, cx = PA.w / 2, cy = PA.h / 2, rot = 0) { ctx.translate(PA.w / 2, PA.h / 2); ctx.rotate(rot); ctx.scale(z, z); ctx.translate(-cx, -cy); },
    };
    ctx.save(); if (finish && !sc.still) finish.breathe(ctx, u, S.d); sc.draw(ctx, u, S); ctx.restore();
  }

  return function frame(main, t) {
    main.drawImage(page, 0, 0);
    const rt = t; t = finish ? finish.time(t) : t; // the painting moves on twos
    const i = Math.max(0, scenes.findLastIndex(s => t >= s.start));
    const sc = scenes[i], prev = scenes[i - 1];
    const kTrans = prev ? (t - sc.start) / TRANS : 1;

    // ---- the painting (on its own sheet when finished, else straight on the page) ----
    let ctx = main;
    if (paintCv) { ctx = paintCv.getContext('2d'); ctx.save(); ctx.clearRect(0, 0, PA.w, PA.h); }
    else { ctx.save(); ctx.translate(PA.x, PA.y); ctx.beginPath(); ctx.rect(0, 0, PA.w, PA.h); ctx.clip(); }
    if (kTrans < 1 && prev && sc.trans !== 'cut') {
      drawScene(ctx, prev, t);
      const e = ease.inOut(clamp(kTrans));
      ctx.save();
      const type = sc.trans || 'iris';
      if (type === 'iris') { lobedCircle(ctx, PA.w / 2, PA.h / 2, e * PA.h * 0.82); ctx.clip(); }
      else if (type === 'wipe') { ctx.beginPath(); ctx.rect(0, 0, PA.w * e, PA.h); ctx.clip(); }
      else if (type === 'unroll') { ctx.beginPath(); ctx.rect(0, 0, PA.w, PA.h * e); ctx.clip(); }
      else if (type === 'flash') { /* drawn below */ }
      drawScene(ctx, sc, t);
      ctx.restore();
      // gilded edge on the moving boundary
      ctx.save();
      if (type === 'iris') { lobedCircle(ctx, PA.w / 2, PA.h / 2, e * PA.h * 0.82); kit.stroke(ctx, kit.P.gold, 8); kit.stroke(ctx, kit.P.ink, 2); }
      else if (type === 'wipe') { ctx.fillStyle = kit.P.gold; ctx.fillRect(PA.w * e - 6, 0, 12, PA.h); }
      else if (type === 'unroll') { // the scroll's rolled edge
        const y = PA.h * e; ctx.fillStyle = kit.P.paperDark; ctx.fillRect(0, y - 14, PA.w, 28); ctx.fillStyle = kit.P.goldDark; ctx.fillRect(0, y - 3, PA.w, 6);
      } else if (type === 'flash') { ctx.globalAlpha = 1 - Math.abs(kTrans * 2 - 1); ctx.fillStyle = kit.P.goldLight; ctx.fillRect(0, 0, PA.w, PA.h); }
      ctx.restore();
    } else drawScene(ctx, sc, t);
    // paper grain + worn pigment
    if (paintCv) { ctx.restore(); finish.painting(paintCv, rt); ctx = main; ctx.drawImage(paintCv, PA.x, PA.y); }
    else { ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.55; ctx.drawImage(grain, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.restore(); }
    // re-draw the frame rules on top so the picture sits inside them
    for (const [o, c, lw] of [[-11, kit.P.gold, 5], [-1, kit.P.verm, 1.5]]) { ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.strokeRect(PA.x + o, PA.y + o, PA.w - 2 * o, PA.h - 2 * o); }
    // things that break out of the frame (a miniature tradition)
    if (sc.over) { ctx.save(); ctx.translate(PA.x, PA.y); sc.over(ctx, t - sc.start, { W: PA.w, H: PA.h, k: kit, P: kit.P }); ctx.restore(); }

    // ---- chapter title, captions, progress ----
    t = rt; // captions and titles stay smooth
    headerText(ctx, sc.title, prev ? (t - sc.start) / 0.35 : 1);
    // hook card over the top of the picture for the first second(s); the
    // spoken captions keep running under it (sound-off viewers read both)
    hookCard(ctx, meta.hook, t, hookEnd, PA, HOOK_THEME);
    const spoke = captions(ctx, lines, t);
    if (!spoke && meta.outro && t >= meta.outro.at) outroText(ctx, meta.outro.text, t - meta.outro.at);
    progress(ctx, t / meta.duration);
    if (finish) finish.frame(ctx, t);
  };
}
