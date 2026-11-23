// "Fogging" — an INKBLOT case file (psychology, MindTrace).
// The assertiveness technique from Manuel J. Smith's 1975 book "When I Say No,
// I Feel Guilty": calmly agree with whatever part of a jab is true.
// u = seconds since the scene started; S.at('word') = when that word is said.
import { clamp, lerp, ease, tween, rng, TAU, shake, pop } from '../../lib/core.mjs';
import { plate, study, caseCover, inkReveal } from '../../styles/inkblot/scenes.mjs';

export const meta = {
  title: 'Fogging',
  slug: 'fogging-inkblot',
  style: 'inkblot',
  width: 1080, height: 1920, fps: 30,
  duration: 49.7,
  voice: 'voice.mp3',
  seed: 107,
  captionChars: 24,
  caseLine: 'THE MIND FILES  ·  CASE No. 1975  ·  CONFIDENTIAL',
  brandKit: 'mindtrace', // MindTrace (brand/mindtrace/): logo, handle, tagline, outro text
  outro: { at: 47.1 },
};

const YOU = { hair: 'slick', tie: '#82a7c8' };
const TEASER = { hat: 'cap', tie: '#c61f2a' };

// soft fog: drifting paper-white blots
function fog(ctx, S, x, y, w, h, a = 1, color = '#bcc3cc') {
  if (a <= 0) return;
  for (let i = 0; i < 4; i++) {
    const dx = Math.sin(S.t * 0.6 + i * 1.7) * w * 0.08, dy = Math.cos(S.t * 0.5 + i) * h * 0.05;
    S.k.blot(ctx, x + dx + (i - 1.5) * w * 0.12, y + dy + (i % 2 ? -1 : 1) * h * 0.06, w * (0.8 + 0.1 * i), h * (0.8 + 0.08 * i), { seed: 300 + i, color, alpha: 0.55 * a, live: 1, t: S.t + i, res: 0.25, splatter: 0, rough: 1.4 });
  }
}
function bubble(ctx, k, P, x, y, w, h, txt, size, col = P.ink, tail = 0, font = 'serif', k2 = 1) {
  const p = ease.outBack(clamp(k2)); if (p <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(p, p);
  k.rect(ctx, -w / 2, -h / 2, w, h, P.paperLight, col === P.ink ? P.ink : col, 5, 30);
  k.poly(ctx, [[tail - 20, h / 2 - 3], [tail + 20, h / 2 - 3], [tail - 10, h / 2 + 44]], P.paperLight);
  ctx.beginPath(); ctx.moveTo(tail - 20, h / 2); ctx.lineTo(tail - 10, h / 2 + 44); ctx.lineTo(tail + 20, h / 2); k.stroke(ctx, col === P.ink ? P.ink : col, 5);
  k.text(ctx, txt, 0, 4, size, { font, color: col, max: w - 40 });
  ctx.restore();
}
function shoes(ctx, k, P, x, y, s) { // big comfy old shoes
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  for (const sx of [-1, 1]) { ctx.save(); ctx.translate(sx * 34, 0); k.ellipse(ctx, sx * 12, -10, 48, 22, 0, '#8a6a44', P.ink, 4); k.rect(ctx, -30, -40, 50, 28, '#8a6a44', P.ink, 4, 8); k.line(ctx, -20, -30, 10, -30, P.paperLight, 3); ctx.restore(); }
  ctx.restore();
}

export const scenes = [
  { // 0.08 "Someone's making fun of you? Don't fight back. Do this."
    start: 0, title: 'Being Teased?',
    draw(ctx, u, S) {
      const { k, P, W } = S, fn = S.at('fun'), fb = S.at('fight'), dt = S.at('this');
      plate(ctx, S, { alpha: 0.1, seed: 2 });
      S.cam(lerp(1.06, 1.0, tween(u, 0, 4)), W / 2, 560);
      k.figure(ctx, 250, 1010, { ...YOU, s: 1.15, face: 1, look: [1, 0], mood: u > dt ? 'smile' : 'worry' });
      k.figure(ctx, 730, 1010, { ...TEASER, s: 1.15, face: -1, look: [-1, 0], mood: 'smile', armL: [1.6, 0.1] });
      ['HA!', 'HA HA!', 'LOL'].forEach((h, i) => { const p = pop(u, fn - 0.2 + i * 0.25, 0.25); if (p) { ctx.save(); ctx.translate(640 + i * 90, 300 - i * 70); ctx.rotate((i - 1) * 0.2); ctx.scale(p, p); k.text(ctx, h, 0, 0, 54, { font: 'display', color: P.red }); ctx.restore(); } });
      // fists up… crossed out
      const fu = pop(u, fb - 0.3, 0.25);
      if (fu) { ctx.save(); ctx.translate(250, 360); ctx.scale(fu, fu); for (const sx of [-1, 1]) { k.circle(ctx, sx * 50, 0, 44, P.red, P.ink, 4); k.rect(ctx, sx * 50 - 24, 30, 48, 40, P.redDark, P.ink, 3); } ctx.restore(); }
      k.penLine(ctx, [[160, 270], [340, 460]], tween(u, fb + 0.3, fb + 0.6), P.ink, 12);
      k.penLine(ctx, [[340, 270], [160, 460]], tween(u, fb + 0.5, fb + 0.8), P.ink, 12, 5);
      fog(ctx, S, 250, 760, 420, 520, tween(u, dt, dt + 0.8));
    },
  },
  { // 4.42 "Therapists call it fogging."
    start: 4.3, title: 'Fogging', trans: 'bleed',
    draw(ctx, u, S) {
      const { k, P, W, H } = S, fg = S.at('fogging');
      plate(ctx, S, { blot: false, bg: '#b9bcc3' });
      fog(ctx, S, W / 2, 520, 900, 900, 1, '#f4f1ea');
      const p = pop(u, fg - 0.1, 0.5);
      if (p) { ctx.save(); ctx.translate(W / 2, 520); ctx.scale(p, p); k.text(ctx, 'FOGGING', 0, 0, 150, { font: 'display', color: P.ink }); ctx.restore(); }
      k.scrawl(ctx, 'what therapists call it', W / 2, 760, 52, tween(u, 0.2, 0.9));
    },
  },
  { // 6.82 'It comes from a 1975 book, "When I Say No, I Feel Guilty."'
    start: 6.75, title: 'A 1975 Book', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, yr = S.at('1975'), wn = S.at('"When');
      plate(ctx, S, { alpha: 0.08, seed: 7 });
      const r = ease.outBack(tween(u, 0, 0.5));
      ctx.save(); ctx.translate(W / 2, 520); ctx.rotate(-0.05); ctx.scale(r, r);
      k.rect(ctx, -230, -310, 460, 620, '#2f5d7c', P.ink, 6, 8); k.rect(ctx, -250, -310, 30, 620, '#244a63', P.ink, 4);
      k.rect(ctx, -190, -250, 380, 300, P.paperLight, null, 0, 4);
      ['WHEN I', 'SAY NO,', 'I FEEL', 'GUILTY'].forEach((l, i) => k.typeOn(ctx, l, 0, -200 + i * 66, 58, tween(u, wn - 0.2 + i * 0.3, wn + 0.2 + i * 0.3, ease.linear), { align: 'center', font: 'display', caret: false }));
      k.text(ctx, 'an assertiveness classic', 0, 160, 30, { color: P.paperLight });
      ctx.restore();
      k.stamp(ctx, '1975', 800, 160, 70, tween(u, yr, yr + 0.25), 0.12);
      k.scrawl(ctx, 'by Manuel J. Smith', W / 2, 920, 56, tween(u, wn + 1.0, wn + 1.6));
    },
  },
  { // 12.16 "Here's the trick. Calmly agree with any part that's true."
    start: 11.85, title: 'Agree With the True Part', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, ag = S.at('agree'), tr = S.at('true');
      plate(ctx, S, { alpha: 0.08, seed: 12 });
      k.stamp(ctx, 'THE TRICK', 220, 110, 42, tween(u, 0.05, 0.25), -0.1);
      // the jab, with only the true part highlighted
      ctx.save(); ctx.translate(W / 2, 420);
      k.rect(ctx, -400, -110, 800, 220, P.paperLight, P.ink, 5, 30);
      const words = ['Your', 'shoes', 'are', 'old', 'and', 'ugly.'], sz = 50;
      k.font(ctx, sz, 'serif'); const sp = 22, widths = words.map(w => ctx.measureText(w).width), tot = widths.reduce((a, b) => a + b, 0) + sp * (words.length - 1);
      let x = -tot / 2;
      words.forEach((w, i) => { if (w === 'old') { const hk = tween(u, tr - 0.2, tr + 0.3); k.rect(ctx, x - 8, -38, (widths[i] + 16) * hk, 76, 'rgba(198,31,42,0.25)', null, 0, 8); } k.text(ctx, w, x + widths[i] / 2, 0, sz, { font: 'serif', color: w === 'old' && u > tr ? P.red : P.ink }); x += widths[i] + sp; });
      ctx.restore();
      k.scrawl(ctx, 'true part', 380, 590, 56, tween(u, tr + 0.2, tr + 0.6));
      k.arrow(ctx, 390, 560, 400, 480, tween(u, tr + 0.4, tr + 0.7), P.red, 6, 0.2);
      k.figure(ctx, W / 2, 1010, { ...YOU, s: 0.95, face: 1, look: [0, -0.6], mood: u > ag ? 'smile' : 'calm' });
      k.scrawl(ctx, 'calmly.', 760, 820, 60, tween(u, ag - 0.4, ag));
    },
  },
  { // 16.48 '"Nice shoes, Grandpa." "Yeah, they're comfy."'
    start: 16.3, title: 'Example: The Shoes', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, ns = S.at('"Nice'), ye = S.at('"Yeah');
      plate(ctx, S, { alpha: 0.08, seed: 16 });
      k.figure(ctx, 250, 1000, { ...YOU, s: 1.15, face: 1, look: [1, 0], mood: u > ye ? 'smile' : 'calm', shadow: false });
      shoes(ctx, k, P, 250, 1005, 1.3);
      const dud = tween(u, ye + 0.6, ye + 1.2);
      k.figure(ctx, 760, 1000, { ...TEASER, s: 1.15, face: -1, look: [-1, lerp(0.7, 0, dud)], mood: dud > 0.5 ? 'worry' : 'smile', armL: [lerp(1.3, 0.2, dud), 0.2] });
      bubble(ctx, k, P, 680, 250, 480, 120, '"Nice shoes, Grandpa."', 44, P.ink, 60, 'serif', tween(u, ns - 0.3, ns));
      bubble(ctx, k, P, 330, 430, 470, 120, '"Yeah, they’re comfy."', 44, P.red, -60, 'serif', tween(u, ye - 0.3, ye));
      if (dud > 0.3) k.text(ctx, '?', 830, 560, 90 * dud, { font: 'display', color: P.inkSoft });
    },
  },
  { // 19.9 '"You're always late." "True, I was late today."'
    start: 19.8, title: 'Example: Always Late', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, yl = S.at('"You'), tr = S.at('"True'), td = S.at('today');
      plate(ctx, S, { alpha: 0.08, seed: 20 });
      k.clock(ctx, 120, 120, 60, 0, { hour: 9, minute: 20 });
      k.figure(ctx, 250, 1000, { ...YOU, s: 1.15, face: 1, look: [1, 0], mood: u > tr ? 'smile' : 'calm' });
      const dud = tween(u, td + 0.2, td + 0.8);
      k.figure(ctx, 760, 1000, { ...TEASER, s: 1.15, face: -1, look: [-1, 0], mood: dud > 0.5 ? 'worry' : 'smile', armL: [lerp(1.3, 0.2, dud), 0.2] });
      bubble(ctx, k, P, 680, 280, 460, 120, '"You’re always late."', 44, P.ink, 60, 'serif', tween(u, yl - 0.3, yl));
      bubble(ctx, k, P, 330, 440, 500, 120, '"True, I was late today."', 42, P.red, -60, 'serif', tween(u, tr - 0.3, tr));
      k.penLine(ctx, [[420, 474], [550, 474]], tween(u, td, td + 0.3), P.red, 6);
      k.scrawl(ctx, 'not "always", just today', 560, 620, 46, tween(u, td + 0.3, td + 0.9));
    },
  },
  { // 24.08 "No anger, no defending."
    start: 23.9, title: 'No Anger, No Defending', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, an = S.at('anger'), df = S.at('defending');
      plate(ctx, S, { alpha: 0.08, seed: 24 });
      // anger (a red scribble face) and defending (a shield) — both crossed out
      const a1 = pop(u, an - 0.3, 0.3);
      if (a1) { ctx.save(); ctx.translate(260, 420); ctx.scale(a1, a1); k.circle(ctx, 0, 0, 130, P.red, P.ink, 6); k.line(ctx, -70, -50, -20, -30, P.ink, 10); k.line(ctx, 70, -50, 20, -30, P.ink, 10); ctx.beginPath(); ctx.arc(0, 70, 50, Math.PI + 0.3, -0.3); k.stroke(ctx, P.ink, 10); ctx.restore(); k.text(ctx, 'ANGER', 260, 600, 44, { font: 'display' }); }
      const a2 = pop(u, df - 0.4, 0.3);
      if (a2) { ctx.save(); ctx.translate(680, 420); ctx.scale(a2, a2); ctx.beginPath(); ctx.moveTo(-110, -120); ctx.lineTo(110, -120); ctx.lineTo(110, 10); ctx.quadraticCurveTo(100, 110, 0, 150); ctx.quadraticCurveTo(-100, 110, -110, 10); ctx.closePath(); k.fill(ctx, '#6d7d8c'); k.stroke(ctx, P.ink, 6); k.line(ctx, 0, -100, 0, 120, P.paperLight, 8); ctx.restore(); k.text(ctx, 'DEFENDING', 680, 600, 44, { font: 'display' }); }
      k.penLine(ctx, [[110, 270], [410, 570]], tween(u, an + 0.2, an + 0.5), P.ink, 14);
      k.penLine(ctx, [[530, 270], [830, 570]], tween(u, df + 0.3, df + 0.6), P.ink, 14, 7);
      k.figure(ctx, W / 2, 1010, { ...YOU, s: 0.9, face: 1, look: [0, 0], mood: 'smile' });
      fog(ctx, S, W / 2, 830, 380, 360, tween(u, df + 0.5, df + 1.2));
    },
  },
  { // 26.38 "Like fog, they throw punches and nothing lands."
    start: 26.3, title: 'Nothing Lands', trans: 'blink',
    draw(ctx, u, S) {
      const { k, P, W, H } = S, th = S.at('throw'), nl = S.at('nothing');
      plate(ctx, S, { blot: false, bg: '#b9bcc3' });
      k.figure(ctx, 260, 1010, { ...YOU, s: 1.1, face: 1, look: [1, 0], mood: 'smile' });
      fog(ctx, S, 300, 720, 620, 760, 1, '#f4f1ea');
      k.figure(ctx, 820, 1010, { ...TEASER, s: 1.1, face: -1, look: [-1, 0], mood: u > nl + 0.5 ? 'worry' : 'smile', armL: [1.5 + Math.sin(u * 10) * 0.3 * tween(u, th - 0.3, th), 0.1] });
      // jabs fly in… and vanish in the fog
      ['LOSER!', 'WEIRDO!', 'NERD!', 'LOL'].forEach((j, i) => {
        const at = th - 0.6 + i * 0.45, f = tween(u, at, at + 0.9, ease.linear); if (f <= 0 || f >= 1) return;
        ctx.save(); ctx.globalAlpha = 1 - tween(f, 0.55, 1); ctx.translate(lerp(760, 340, f), 380 + i * 90 + Math.sin(f * 6) * 10);
        k.text(ctx, j, 0, 0, 52, { font: 'display', color: P.red }); ctx.restore();
      });
      k.scrawl(ctx, 'nothing lands', W / 2, 160, 70, tween(u, nl, nl + 0.5));
    },
  },
  { // 30.9 "Why it works? A tease wants a reaction."
    start: 30.6, title: 'A Tease Wants a Reaction', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, rx = S.at('reaction');
      plate(ctx, S, { alpha: 0.1, seed: 30 });
      // the teaser goes fishing with bait labelled REACTION
      k.figure(ctx, 760, 1010, { ...TEASER, s: 1.1, face: -1, look: [-1, 0.4], mood: 'smile', armL: [2.2, 0.4] });
      k.line(ctx, 700, 500, 300, 160, '#6b4a2b', 10);
      const dip = Math.sin(u * 2.5) * 20;
      k.line(ctx, 300, 160, 300, 560 + dip, P.grey, 2);
      ctx.beginPath(); ctx.moveTo(300, 560 + dip); ctx.lineTo(300, 600 + dip); ctx.arc(282, 600 + dip, 18, 0, Math.PI * 0.95); k.stroke(ctx, P.red, 7);
      const b = pop(u, rx - 0.3, 0.3);
      if (b) { ctx.save(); ctx.translate(300, 670 + dip); ctx.scale(b, b); k.rect(ctx, -130, -36, 260, 72, P.red, P.ink, 4, 10); k.text(ctx, 'REACTION?', 0, 2, 40, { font: 'display', color: P.paperLight }); ctx.restore(); }
      k.scrawl(ctx, 'the bait', 160, 820, 56, tween(u, rx + 0.3, rx + 0.8));
    },
  },
  { // 34.86 "Give it nothing and it has nothing to grab."
    start: 34.85, title: 'Nothing to Grab', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, gr = S.at('grab');
      plate(ctx, S, { blot: false, bg: '#24222a' });
      // an arcade claw closes on a smooth fog ball… and slips off
      const down = tween(u, 0.2, gr - 0.3), close = tween(u, gr - 0.3, gr), up = tween(u, gr + 0.1, gr + 0.9);
      const cy = lerp(140, 560, down) - up * 380;
      k.line(ctx, W / 2, -20, W / 2, cy - 60, P.greyLight, 6);
      k.rect(ctx, W / 2 - 50, cy - 70, 100, 50, '#9aa3ad', P.ink, 4, 8);
      for (const sx of [-1, 0, 1]) { const a = (sx || 0.01) * lerp(0.7, 0.15, close) * (1 - up * 0.6); ctx.save(); ctx.translate(W / 2 + sx * 30, cy - 20); ctx.rotate(a); k.line(ctx, 0, 0, 0, 120, '#9aa3ad', 14); k.line(ctx, 0, 120, -sx * 26, 150, '#9aa3ad', 12); ctx.restore(); }
      const slip = up > 0.1 ? 0 : 0;
      k.circle(ctx, W / 2, 760 + slip, 130, '#e9e6df');
      fog(ctx, S, W / 2, 760, 360, 300, 0.8, '#f4f1ea');
      k.scrawl(ctx, 'nothing to grab', W / 2, 980, 64, tween(u, gr + 0.4, gr + 0.9), { color: P.redLight });
    },
  },
  { // 38.1 "One thing. This is for teasing. If it's bullying or it keeps happening, tell someone you trust."
    start: 38.0, title: 'One Important Thing', trans: 'bleed',
    draw(ctx, u, S) {
      const { k, P, W } = S, ts = S.at('teasing'), bl = S.at('bullying'), tl = S.at('tell');
      plate(ctx, S, { alpha: 0.06, seed: 38 });
      k.stamp(ctx, 'IMPORTANT', W / 2, 110, 54, tween(u, 0.1, 0.3), -0.05);
      // two columns: teasing → fog it; bullying → tell someone
      const c1 = pop(u, ts - 0.3, 0.35), c2 = pop(u, bl - 0.2, 0.35);
      if (c1) { ctx.save(); ctx.translate(250, 360); ctx.scale(c1, c1); k.rect(ctx, -190, -110, 380, 220, P.paperLight, P.ink, 5, 12); k.text(ctx, 'TEASING', 0, -50, 44, { font: 'display' }); k.text(ctx, '→ fog it', 0, 30, 46, { font: 'hand', color: P.inkSoft }); ctx.restore(); }
      if (c2) { ctx.save(); ctx.translate(690, 360); ctx.scale(c2, c2); k.rect(ctx, -200, -110, 400, 220, P.paperLight, P.red, 7, 12); k.text(ctx, 'BULLYING', 0, -60, 44, { font: 'display', color: P.red }); k.text(ctx, 'or it keeps happening', 0, -12, 28, { color: P.red }); k.text(ctx, '→ tell someone', 0, 46, 46, { font: 'hand', color: P.red }); ctx.restore(); }
      // talking to a trusted adult
      const tk = tween(u, tl - 0.3, tl + 0.3);
      k.figure(ctx, 360, 1010, { ...YOU, s: 1.0, face: 1, look: [1, -0.2], mood: tk > 0.5 ? 'smile' : 'worry' });
      k.figure(ctx, 600, 1010, { hair: 'bun', skirt: true, s: 1.15, face: -1, look: [-1, 0.2], mood: 'smile', armL: [lerp(0.2, 1.4, tk), lerp(0.2, 0.9, tk)] });
      k.heart(ctx, 480, 600, 50, P.red, ease.outBack(tween(u, tl + 0.2, tl + 0.6)));
      k.scrawl(ctx, 'someone you trust', W / 2, 700, 56, tween(u, tl + 0.3, tl + 0.8));
    },
  },
  { // 45.24 "Follow for more mind tricks." → the case-file cover
    start: 44.9, title: 'More Mind Tricks', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      ctx.save(); plate(ctx, S, { blot: false, bg: '#b9bcc3' }); fog(ctx, S, W / 2, 560, 900, 900, 1, '#f4f1ea'); k.figure(ctx, W / 2, 1010, { ...YOU, s: 1.1, mood: 'smile' }); ctx.restore();
      inkReveal(ctx, S, tween(u, 0.15, 0.85, ease.linear), c => caseCover(c, S, u - 0.15, { handle: meta.brand.handle, caseNo: '1975', tagline: meta.brand.tagline }));
    },
  },
];

export const sfx = [
  { t: 0.7, type: 'pop', gain: 0.45 }, { t: 0.95, type: 'pop', gain: 0.45, pitch: 1.2 }, { t: 1.2, type: 'pop', gain: 0.45, pitch: 1.4 },
  { t: 1.7, type: 'thud', gain: 0.5 },
  { t: 2.5, type: 'pen', gain: 0.55 },
  { t: 3.1, type: 'wind', gain: 0.45 },
  { t: 4.3, type: 'splat', gain: 0.6 },
  { t: 4.5, type: 'wind', gain: 0.4 },
  { t: 5.4, type: 'gong', gain: 0.4 },
  { t: 6.75, type: 'fold', gain: 0.45 },
  { t: 7.4, type: 'stamp', gain: 0.75 },
  { t: 9.1, type: 'typewriter', gain: 0.45 },
  { t: 10.3, type: 'pen', gain: 0.45 },
  { t: 11.85, type: 'fold', gain: 0.45 },
  { t: 11.95, type: 'stamp', gain: 0.4 },
  { t: 14.0, type: 'chime', gain: 0.35 },
  { t: 15.1, type: 'pen', gain: 0.5 },
  { t: 16.3, type: 'whoosh', gain: 0.4 },
  { t: 16.3, type: 'pop', gain: 0.5 },
  { t: 17.8, type: 'pop', gain: 0.5, pitch: 1.2 },
  { t: 19.7, type: 'flop', gain: 0.4 },
  { t: 19.8, type: 'whoosh', gain: 0.4 },
  { t: 19.9, type: 'tick', gain: 0.35 },
  { t: 19.95, type: 'pop', gain: 0.5 },
  { t: 21.5, type: 'pop', gain: 0.5, pitch: 1.2 },
  { t: 22.9, type: 'pen', gain: 0.5 },
  { t: 23.9, type: 'fold', gain: 0.45 },
  { t: 24.3, type: 'pen', gain: 0.55 },
  { t: 25.5, type: 'pen', gain: 0.55 },
  { t: 26.3, type: 'blink', gain: 0.45 },
  { t: 26.5, type: 'wind', gain: 0.45 },
  { t: 27.2, type: 'whoosh', gain: 0.4 }, { t: 27.65, type: 'whoosh', gain: 0.4 }, { t: 28.1, type: 'whoosh', gain: 0.4 }, { t: 28.55, type: 'whoosh', gain: 0.4 },
  { t: 29.0, type: 'chime', gain: 0.4, pitch: 1.2 },
  { t: 30.6, type: 'whoosh', gain: 0.35 },
  { t: 31.0, type: 'waves', gain: 0.35 },
  { t: 33.4, type: 'pop', gain: 0.5 },
  { t: 34.85, type: 'fold', gain: 0.45 },
  { t: 35.0, type: 'slide', gain: 0.45 },
  { t: 36.6, type: 'clank', gain: 0.6 },
  { t: 37.2, type: 'flop', gain: 0.5 },
  { t: 38.0, type: 'splat', gain: 0.55 },
  { t: 38.1, type: 'stamp', gain: 0.6 },
  { t: 39.5, type: 'pop', gain: 0.5 },
  { t: 41.0, type: 'pop', gain: 0.5, pitch: 1.2 },
  { t: 43.4, type: 'chime', gain: 0.45 },
  { t: 45.0, type: 'splat', gain: 0.8 },
  { t: 45.4, type: 'fold', gain: 0.4 },
  { t: 46.2, type: 'stamp', gain: 0.8 },
  { t: 47.2, type: 'moth', gain: 0.35 },
  { t: 48.8, type: 'bell', gain: 0.3 },
];

export const music = {
  kit: 'mind', bpm: 96, root: 'F', scale: 'major', gain: 0.3,
  sections: [
    { from: 0, to: 4.3, mood: 'tense' },
    { from: 4.3, to: 11.85, mood: 'intro' },
    { from: 11.85, to: 30.6, mood: 'groove' },
    { from: 30.6, to: 38.0, mood: 'drive' },
    { from: 38.0, to: 44.9, mood: 'sad' },
    { from: 44.9, to: 49.7, mood: 'end' },
  ],
};
