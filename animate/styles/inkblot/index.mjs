// INKBLOT style: a psychology case file. Each scene is a numbered "plate"
// on old card stock; the picture card has a centre fold (the Rorschach
// crease). Transitions: fold (the card folds shut along the crease and opens
// on the next plate), bleed (ink floods the card and drains away), blink
// (eyelids close and open), flash, cut.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { GlobalFonts, loadImage, createCanvas } from '@napi-rs/canvas';
import { clamp, ease, lerp } from '../../lib/core.mjs';
import { groupLines } from '../../lib/captions.mjs';
import * as kit from './kit.mjs';
import { LAYOUT, staticPage, headerText, captions, outroText, makePolygraph } from './page.mjs';
import { hookCard, hookUntil } from '../../lib/retention.mjs';

// Hook card look: a case-file label — ink band, paper text, red accent word.
export const HOOK_THEME = { font: s => `900 ${s}px Display`, fill: '#f8f3e7', accent: '#ff5a5f', stroke: null, band: '#16141a', bandEdge: '#c61f2a', label: '#f8f3e7' };

const require = createRequire(import.meta.url);
export function registerFonts() {
  const f = (pkg, file, name) => GlobalFonts.registerFromPath(path.join(path.dirname(require.resolve(pkg + '/package.json')), 'files', file), name);
  f('@fontsource/special-elite', 'special-elite-latin-400-normal.woff2', 'Typewriter');
  f('@fontsource/playfair-display', 'playfair-display-latin-900-normal.woff2', 'Display');
  f('@fontsource/playfair-display', 'playfair-display-latin-700-normal.woff2', 'Display');
  f('@fontsource/playfair-display', 'playfair-display-latin-900-italic.woff2', 'Display');
  f('@fontsource/caveat', 'caveat-latin-700-normal.woff2', 'Hand');
}

export const TRANS = { fold: 0.5, bleed: 0.6, blink: 0.4, flash: 0.3, wipe: 0.4 };

export async function createRenderer(project) {
  registerFonts();
  const { story, words, meta, dir } = project;
  const brand = meta.brand || {};
  let logo = null;
  if (brand.logo && fs.existsSync(path.resolve(dir, brand.logo))) logo = await loadImage(fs.readFileSync(path.resolve(dir, brand.logo)));
  const page = staticPage({ seed: meta.seed || 9, handle: brand.handle, logo, caseLine: meta.caseLine });
  const PA = LAYOUT.paint;
  const grain = kit.paperTexture(PA.w, PA.h, (meta.seed || 9) + 4);
  const lines = groupLines(words, meta.captionChars || 18);
  const hookEnd = meta.hook ? hookUntil(meta.hook, words) : 0;
  const polygraph = makePolygraph(words, meta.duration);
  const scenes = story.scenes.map((s, i, a) => ({ ...s, i, end: i + 1 < a.length ? a[i + 1].start : meta.duration }));
  const findWord = (re, after = 0) => { const w = words.find(x => x.start >= after - 0.05 && re.test(x.w)); return w ? w.start : null; };
  const bufA = createCanvas(PA.w, PA.h), bufB = createCanvas(PA.w, PA.h);

  function drawScene(ctx, sc, t) {
    const u = t - sc.start;
    const S = {
      W: PA.w, H: PA.h, t, u, d: sc.end - sc.start, k: kit, P: kit.P, logo, i: sc.i,
      at: w => { const g = findWord(w instanceof RegExp ? w : new RegExp('^' + w, 'i'), sc.start); return g == null ? 0 : g - sc.start; },
      cam(z = 1, cx = PA.w / 2, cy = PA.h / 2, rot = 0) { ctx.translate(PA.w / 2, PA.h / 2); ctx.rotate(rot); ctx.scale(z, z); ctx.translate(-cx, -cy); },
    };
    ctx.save();
    ctx.fillStyle = kit.P.card; ctx.fillRect(0, 0, PA.w, PA.h);
    sc.draw(ctx, u, S);
    ctx.restore();
  }
  const into = (buf, sc, t) => { const c = buf.getContext('2d'); c.save(); c.clearRect(0, 0, PA.w, PA.h); drawScene(c, sc, t); c.restore(); return buf; };

  function transition(ctx, prev, sc, t, type, e) {
    const W = PA.w, H = PA.h, half = W / 2;
    if (type === 'fold') {
      const A = into(bufA, prev, t), B = into(bufB, sc, t);
      if (e < 0.5) { // right half of the old plate folds over onto the left
        const f = ease.inQuad(e / 0.5), fw = half * Math.cos(f * Math.PI / 2);
        ctx.drawImage(A, 0, 0, half, H, 0, 0, half, H);
        ctx.drawImage(B, half, 0, half, H, half, 0, half, H);
        ctx.drawImage(A, half, 0, half, H, half, 0, Math.max(1, fw), H);
        ctx.fillStyle = `rgba(20,16,12,${0.45 * f})`; ctx.fillRect(half, 0, fw, H);
        ctx.fillStyle = `rgba(20,16,12,${0.35 * (1 - f)})`; ctx.fillRect(half + fw, 0, 26 * (1 - f), H);
      } else { // the new plate's left half unfolds from the crease
        const f = ease.outQuad((e - 0.5) / 0.5), fw = half * Math.sin(f * Math.PI / 2);
        ctx.drawImage(A, 0, 0, half, H, 0, 0, half, H);
        ctx.drawImage(B, half, 0, half, H, half, 0, half, H);
        ctx.drawImage(B, 0, 0, half, H, half - fw, 0, Math.max(1, fw), H);
        ctx.fillStyle = `rgba(20,16,12,${0.4 * (1 - f)})`; ctx.fillRect(half - fw, 0, fw, H);
      }
      return;
    }
    if (type === 'bleed') { // ink floods in (old plate), then drains (new plate)
      const first = e < 0.5, f = first ? e / 0.5 : 1 - (e - 0.5) / 0.5;
      drawScene(ctx, first ? prev : sc, t);
      kit.blot(ctx, W / 2, H / 2, W * lerp(0.4, 2.3, ease.inOut(f)), H * lerp(0.4, 2.1, ease.inOut(f)), { seed: 900 + sc.i, grow: clamp(f * 1.5), res: 0.26, rough: 1.4, live: 1, t });
      return;
    }
    if (type === 'blink') { // eyelids close on the old plate, open on the new
      const first = e < 0.5, f = first ? ease.inQuad(e / 0.5) : 1 - ease.outQuad((e - 0.5) / 0.5);
      drawScene(ctx, first ? prev : sc, t);
      const lid = f * (H / 2 + 80);
      ctx.fillStyle = kit.P.ink;
      ctx.beginPath(); ctx.moveTo(-10, -10); ctx.lineTo(W + 10, -10); ctx.lineTo(W + 10, lid - 60); ctx.quadraticCurveTo(W / 2, lid + 60, -10, lid - 60); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-10, H + 10); ctx.lineTo(W + 10, H + 10); ctx.lineTo(W + 10, H - lid + 60); ctx.quadraticCurveTo(W / 2, H - lid - 60, -10, H - lid + 60); ctx.closePath(); ctx.fill();
      for (let i = 1; i < 12; i++) { const x = i / 12 * W, y = lid - 60 + 120 * 4 * (i / 12) * (1 - i / 12) * 0.5; kit.line(ctx, x, y, x + (i / 12 - 0.5) * 40, y + 34, kit.P.ink, 7); }
      return;
    }
    if (type === 'wipe') { // red-pen wipe
      drawScene(ctx, prev, t);
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W * ease.inOut(e), H); ctx.clip(); drawScene(ctx, sc, t); ctx.restore();
      ctx.fillStyle = kit.P.red; ctx.fillRect(W * ease.inOut(e) - 6, 0, 12, H);
      return;
    }
    // flash: a camera-flash of white paper
    drawScene(ctx, e < 0.5 ? prev : sc, t);
    ctx.fillStyle = `rgba(255,252,240,${1 - Math.abs(e * 2 - 1)})`; ctx.fillRect(0, 0, W, H);
  }

  return function frame(ctx, t) {
    ctx.drawImage(page, 0, 0);
    const i = Math.max(0, scenes.findLastIndex(s => t >= s.start));
    const sc = scenes[i], prev = scenes[i - 1];
    const type = sc.trans || 'fold', dur = TRANS[type] || 0.45;
    const kTrans = prev ? (t - sc.start) / dur : 1;

    ctx.save(); ctx.translate(PA.x, PA.y);
    ctx.beginPath(); ctx.rect(0, 0, PA.w, PA.h); ctx.clip();
    if (kTrans < 1 && prev && type !== 'cut') transition(ctx, prev, sc, t, type, clamp(kTrans));
    else drawScene(ctx, sc, t);
    // card grain + the centre fold crease on every plate
    ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.5; ctx.drawImage(grain, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    const cg = ctx.createLinearGradient(PA.w / 2 - 14, 0, PA.w / 2 + 14, 0);
    cg.addColorStop(0, 'rgba(60,40,20,0)'); cg.addColorStop(0.5, 'rgba(60,40,20,0.13)'); cg.addColorStop(0.52, 'rgba(255,255,255,0.18)'); cg.addColorStop(1, 'rgba(60,40,20,0)');
    ctx.fillStyle = cg; ctx.fillRect(PA.w / 2 - 14, 0, 28, PA.h);
    ctx.restore();
    kit.rect(ctx, PA.x, PA.y, PA.w, PA.h, null, kit.P.ink, 5);
    // things that break out of the card
    if (sc.over) { ctx.save(); ctx.translate(PA.x, PA.y); sc.over(ctx, t - sc.start, { W: PA.w, H: PA.h, k: kit, P: kit.P, t }); ctx.restore(); }

    headerText(ctx, sc.title, i + 1, prev ? (t - sc.start) / 0.5 : 1);
    hookCard(ctx, meta.hook, t, hookEnd, PA, HOOK_THEME); // big words on frame 0
    const spoke = captions(ctx, lines, t);
    if (!spoke && meta.outro && t >= meta.outro.at) outroText(ctx, meta.outro.text, t - meta.outro.at);
    polygraph(ctx, t);
  };
}
