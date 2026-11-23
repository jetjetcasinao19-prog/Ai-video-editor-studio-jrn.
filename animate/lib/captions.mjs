// Caption helpers shared by every style.

// Group words into caption lines (sentence ends and pauses break lines).
export function groupLines(words, maxChars = 30, maxGap = 0.55, maxDur = 2.8) {
  const lines = []; let cur = [];
  const flush = () => { if (cur.length) lines.push(cur); cur = []; };
  for (const w of words) {
    const last = cur[cur.length - 1], text = cur.map(x => x.w).join(' ');
    if (cur.length && ((text + ' ' + w.w).length > maxChars || w.start - last.end > maxGap || w.end - cur[0].start > maxDur)) flush();
    cur.push(w);
    if (/[.!?]$/.test(w.w)) flush();
  }
  flush();
  return lines;
}
