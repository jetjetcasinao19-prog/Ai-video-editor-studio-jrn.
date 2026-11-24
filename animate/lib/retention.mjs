// Retention tools shared by every style.
//
// Why: the owner's Shorts were swiped away by 85% of viewers (YouTube Studio,
// Nov 2026). Most people decide in the first second, so every short now opens
// on a HOOK CARD (big words over the picture from frame 0) and the storyboard
// is checked against simple retention rules before it is rendered.
import { clamp, ease } from './core.mjs';

// Default hook length: until the end of the first spoken sentence, between
// 1.2 s and 2.6 s.
export function hookUntil(hook, words) {
  if (hook.until) return hook.until;
  const end = words.find(w => /[.!?]$/.test(w.w));
  return clamp(end ? end.end + 0.15 : 1.8, 1.2, 2.6);
}

// Split "This glue *FAILED*" into tokens; *word* or *several words* = accent colour.
function tokens(line) {
  let on = false;
  return line.split(/\s+/).filter(Boolean).map(w => {
    const opens = w.startsWith('*'), closes = /\*[.,!?]*$/.test(w) && (w.length > 1 || !opens);
    const accent = on || opens;
    if (opens) on = true;
    if (closes) on = false;
    return { w: w.replace(/\*/g, ''), accent };
  });
}

// Wrap the hook into at most 3 lines that fit `maxW`, shrinking the font.
function layout(ctx, text, font, maxW, size) {
  const given = text.split('\n');
  for (; size >= 60; size -= 4) {
    ctx.font = font(size);
    const lines = [];
    for (const g of given) {
      let cur = [];
      for (const tk of tokens(g)) {
        const test = [...cur, tk].map(x => x.w).join(' ');
        if (cur.length && ctx.measureText(test).width > maxW) { lines.push(cur); cur = []; }
        cur.push(tk);
      }
      if (cur.length) lines.push(cur);
    }
    const widest = Math.max(...lines.map(l => ctx.measureText(l.map(x => x.w).join(' ')).width));
    if (lines.length <= 3 && widest <= maxW) return { lines, size };
  }
  ctx.font = font(60);
  return { lines: given.map(tokens), size: 60 };
}

// The hook card: huge words on a solid band over the painting, fully visible
// on frame 0 (that frame is what people see first, and what YouTube can use
// as the thumbnail), a small punch-in, then it slides away at `until`.
//   area  = { x, y, w, h } of the painting on the page
//   theme = { font(size) → css font, fill, accent, stroke, band, bandEdge, label }
export function hookCard(ctx, hook, t, until, area, theme) {
  if (!hook || t >= until) return false;
  const out = clamp((t - (until - 0.28)) / 0.28);       // exit
  const punch = 1 + 0.05 * (1 - ease.outCubic(clamp(t / 0.6)));
  const maxW = area.w - 120;
  const { lines, size } = layout(ctx, hook.text, theme.font, maxW, hook.size || 124);
  const lh = size * 1.08, bandH = lines.length * lh + size * 0.7;
  const cy = Math.max(area.y + (hook.y ?? 0.2) * area.h, area.y + bandH / 2 + (hook.label ? 70 : 24)); // top of the picture (sky), inside the frame
  ctx.save();
  ctx.globalAlpha = 1 - ease.inCubic(out);
  ctx.translate(area.x + area.w / 2, cy - out * 80);
  ctx.scale(punch, punch);
  // band behind the words so they read on any picture
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 8;
  ctx.fillStyle = theme.band;
  const bw = area.w - 40;
  ctx.beginPath(); ctx.roundRect(-bw / 2, -bandH / 2, bw, bandH, 18); ctx.fill();
  ctx.restore();
  ctx.lineWidth = 6; ctx.strokeStyle = theme.bandEdge; ctx.beginPath(); ctx.roundRect(-bw / 2 + 10, -bandH / 2 + 10, bw - 20, bandH - 20, 12); ctx.stroke();
  // small label above the band (the thing the story is about)
  if (hook.label) {
    ctx.font = theme.font(46);
    const lw = ctx.measureText(hook.label).width + 60;
    ctx.fillStyle = theme.bandEdge; ctx.beginPath(); ctx.roundRect(-lw / 2, -bandH / 2 - 44, lw, 64, 32); ctx.fill();
    ctx.fillStyle = theme.label || theme.band; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(hook.label, 0, -bandH / 2 - 10);
  }
  ctx.font = theme.font(size); ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.lineJoin = 'round';
  const space = ctx.measureText(' ').width;
  lines.forEach((line, i) => {
    const y = (i - (lines.length - 1) / 2) * lh + size * 0.04;
    const total = ctx.measureText(line.map(x => x.w).join(' ')).width;
    let x = -total / 2;
    for (const tk of line) {
      const ww = ctx.measureText(tk.w).width;
      if (theme.stroke) { ctx.lineWidth = size * 0.12; ctx.strokeStyle = theme.stroke; ctx.strokeText(tk.w, x, y); }
      ctx.fillStyle = tk.accent ? theme.accent : theme.fill; ctx.fillText(tk.w, x, y);
      x += ww + space;
    }
  });
  ctx.restore();
  return true;
}

// Caption word gap (as a share of the font size) — the same value for fitting
// and drawing, so a line that fits is never wrapped.
export const GAP = 0.34;
// Fit one caption row: shrink the font (down to `min`) instead of wrapping,
// so a caption is one short, big line. `words` = array of strings (or one
// string). Leaves ctx.font set; returns the font size to use.
export function fitSize(ctx, words, font, maxW, size, min = 60) {
  if (typeof words === 'string') words = words.split(/\s+/);
  const width = s => { ctx.font = font(s); return words.reduce((a, w) => a + ctx.measureText(w).width, 0) + s * GAP * (words.length - 1); };
  while (width(size) > maxW && size > min) size -= 2;
  ctx.font = font(size);
  return size;
}

// Retention check: things that make people swipe away. Warnings, not errors —
// the render still runs, but every warning should have a reason to stay.
export function retentionCheck(meta, scenes, words) {
  const warn = [];
  const first = words[0];
  if (!meta.hook || !meta.hook.text) warn.push('no hook card: add meta.hook = { text: "This glue *FAILED*", label: "POST-IT NOTES" } (3–7 big words, frame 0)');
  else {
    const n = meta.hook.text.replace(/\*/g, '').split(/\s+/).filter(Boolean).length;
    if (n > 7) warn.push(`hook has ${n} words — keep it to 3–7 so it reads in one glance`);
  }
  if (first && first.start > 0.4) warn.push(`the voice starts at ${first.start.toFixed(2)} s — trim the silence so the first word lands in the first 0.4 s`);
  const voiceEnd = words.length ? words[words.length - 1].end : meta.duration;
  if (voiceEnd > 45) warn.push(`the voice runs ${voiceEnd.toFixed(1)} s — aim for 25–40 s (cut setup lines, keep the twist and payoff)`);
  const all = scenes.map((s, i) => ({ ...s, end: i + 1 < scenes.length ? scenes[i + 1].start : meta.duration }));
  if (all[0] && all[0].end - all[0].start > 2.6) warn.push(`the first shot holds ${(all[0].end - all[0].start).toFixed(1)} s — cut to something new within 2.5 s`);
  all.slice(0, -1).forEach((s, i) => { const d = s.end - s.start; if (d > 4.5) warn.push(`scene ${i} "${s.title}" holds ${d.toFixed(1)} s — split it or add a new move every 2–3 s`); });
  const t0 = all[0]?.title || '';
  if (/\d{3,4}|·/.test(t0)) warn.push(`first header "${t0}" is a date/name — open on the thing itself (e.g. "POST-IT NOTES")`);
  if ((meta.captionChars || 18) > 22) warn.push(`captionChars ${meta.captionChars} — use 14–20 so each caption is one big line`);
  return warn;
}
