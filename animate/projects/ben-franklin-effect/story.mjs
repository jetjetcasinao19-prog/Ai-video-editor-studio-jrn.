// "The Ben Franklin Effect" — an INKBLOT case file (psychology, MindTrace).
// Franklin's Autobiography (the rival in the Pennsylvania Assembly, 1730s, the
// borrowed book) + Jecker & Landy (1969): doing someone a favor → liking them more.
// u = seconds since the scene started; S.at('word') = when that word is said.
import { clamp, lerp, ease, tween, rng, TAU, shake, pop } from '../../lib/core.mjs';
import { plate, study, caseCover, inkReveal } from '../../styles/inkblot/scenes.mjs';

export const meta = {
  title: 'The Ben Franklin Effect',
  slug: 'ben-franklin-effect-inkblot',
  style: 'inkblot',
  width: 1080, height: 1920, fps: 30,
  duration: 49.2,
  voice: 'voice.mp3',
  seed: 63,
  captionChars: 24,
  caseLine: 'THE MIND FILES  ·  CASE No. 1969  ·  CONFIDENTIAL',
  brandKit: 'mindtrace', // MindTrace (brand/mindtrace/): logo, handle, tagline, outro text
  outro: { at: 46.6 },
};

const FRANKLIN = { hair: 'long', glasses: true };
const RIVAL = { hat: 'tricorn', tie: '#8d121a' };
const RESEARCHER = { glasses: true, hair: 'slick', tie: '#c61f2a' };

// the Pennsylvania Assembly room: tall arched windows, panelled walls, plank floor
function hall(ctx, S, o = {}) {
  const { k, P, W, H } = S, floor = o.floor ?? 880;
  ctx.fillStyle = '#e6dcc4'; ctx.fillRect(-300, -300, W + 600, H + 600);
  for (const x of [140, W / 2, W - 140]) {
    ctx.beginPath(); ctx.moveTo(x - 90, 560); ctx.lineTo(x - 90, 200); ctx.arc(x, 200, 90, Math.PI, 0); ctx.lineTo(x + 90, 560); ctx.closePath(); k.fill(ctx, '#f6f0de'); k.stroke(ctx, P.ink, 6);
    for (let r = 0; r < 4; r++) k.line(ctx, x - 90, 260 + r * 75, x + 90, 260 + r * 75, P.ink, 3);
    k.line(ctx, x, 110, x, 560, P.ink, 3);
  }
  k.rect(ctx, -300, 600, W + 600, floor - 600, P.redDark);
  for (let x = -40; x < W + 40; x += 120) k.rect(ctx, x + 14, 620, 92, floor - 640, null, P.ink, 3);
  ctx.fillStyle = '#8a6a44'; ctx.fillRect(-300, floor, W + 600, H);
  for (let y = floor + 30; y < H; y += 40) k.line(ctx, -300, y, W + 300, y, '#6b4a2b', 2);
}

export const scenes = [
  { // 0.04 "Want your enemy to like you? Ask them for a favor."
    start: 0, title: 'Turn an Enemy',
    draw(ctx, u, S) {
      const { k, P, W } = S, en = S.at('enemy'), lk = S.at('like'), fv = S.at('favor');
      plate(ctx, S, { alpha: 0.12, seed: 3 });
      S.cam(lerp(1.08, 1.0, tween(u, 0, 3.8)), W / 2, 560);
      const won = tween(u, fv, fv + 0.4);
      k.figure(ctx, 230, 1000, { s: 1.15, face: 1, look: [1, 0], mood: 'smile', armR: [1.3, 0.6] });
      k.figure(ctx, 710, 1000, { ...RIVAL, s: 1.15, face: -1, look: [-1, 0], mood: won > 0.5 ? 'smile' : 'worry', armL: [0.9, 1.9], armR: [0.9, 1.9] });
      k.grudge(ctx, 710, 360, 120, S.t, tween(u, en - 0.3, en + 0.2) * (1 - won));
      k.heart(ctx, 710, 360, 70, P.red, ease.outBack(won));
      const b = pop(u, fv - 0.6, 0.3);
      if (b) { ctx.save(); ctx.translate(300, 290); ctx.scale(b, b); k.rect(ctx, -230, -70, 460, 140, P.paperLight, P.ink, 5, 30); k.text(ctx, 'Could you do me', 0, -22, 40, { font: 'serif' }); k.text(ctx, 'a favor?', 0, 28, 46, { font: 'serif', color: P.red }); ctx.restore(); }
      k.stamp(ctx, 'ENEMY', 820, 130, 40, tween(u, en, en + 0.2) * (1 - won), 0.12);
    },
  },
  { // 4.28 "In the 1730s, Benjamin Franklin had a rival who spoke out against him."
    start: 3.95, title: 'The 1730s', trans: 'bleed',
    draw(ctx, u, S) {
      const { k, P, W } = S, yr = S.at('1730'), bf = S.at('Benjamin'), rv = S.at('rival'), sp = S.at('spoke');
      S.cam(lerp(1.0, 1.08, tween(u, 0, 5)), W / 2, 620);
      hall(ctx, S);
      // the rival at the lectern, speaking against Franklin
      k.figure(ctx, 700, 880, { ...RIVAL, s: 1.0, face: -1, look: [-1, 0], mood: 'worry', armL: [lerp(0.4, 2.4, Math.abs(Math.sin(u * 4)) * tween(u, sp, sp + 0.2)), 0.4] });
      k.rect(ctx, 600, 700, 200, 180, '#6b4a2b', P.ink, 5, 4);
      k.figure(ctx, 230, 880, { ...FRANKLIN, s: 1.0, face: 1, look: [1, 0], mood: u > sp ? 'worry' : 'calm' });
      if (u > sp) k.grudge(ctx, 700, 340, 110, S.t, tween(u, sp, sp + 0.3));
      k.stamp(ctx, '1730s', W / 2, 200, 60, tween(u, yr, yr + 0.25), -0.08);
      k.scrawl(ctx, 'Benjamin Franklin', 260, 400, 52, tween(u, bf, bf + 0.6), { rot: -0.05 });
      k.arrow(ctx, 240, 430, 232, 500, tween(u, bf + 0.4, bf + 0.7), P.red, 5, 0.2);
      k.scrawl(ctx, 'a rival', 790, 230, 56, tween(u, rv, rv + 0.4));
    },
  },
  { // 9.12 "Franklin didn't flatter him."
    start: 8.98, title: 'No Flattery', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, fl = S.at('flatter');
      plate(ctx, S, { alpha: 0.1, seed: 8 });
      // flowers, a gift box and a sweet-talk speech bubble — all crossed out
      ctx.save(); ctx.translate(250, 520);
      for (let i = 0; i < 5; i++) { k.line(ctx, 0, 120, (i - 2) * 30, -40 - (i % 2) * 30, '#3d6b45', 6); k.heart(ctx, (i - 2) * 30, -60 - (i % 2) * 30, 22, [P.red, P.rose, P.lilac][i % 3]); }
      ctx.restore();
      k.rect(ctx, 520, 470, 200, 160, P.red, P.ink, 5, 4); k.rect(ctx, 610, 470, 20, 160, P.ochre); k.rect(ctx, 520, 540, 200, 20, P.ochre);
      ctx.save(); ctx.translate(470, 260); k.rect(ctx, -260, -60, 520, 120, P.paperLight, P.ink, 5, 30); k.text(ctx, 'You are so wise, sir!', 0, 4, 44, { font: 'serif' }); ctx.restore();
      k.penLine(ctx, [[80, 160], [880, 760]], tween(u, fl - 0.1, fl + 0.3), P.red, 16);
      k.penLine(ctx, [[880, 160], [80, 760]], tween(u, fl + 0.2, fl + 0.5), P.red, 16, 5);
      k.stamp(ctx, 'NO FLATTERY', W / 2, 920, 60, tween(u, fl + 0.4, fl + 0.6), -0.08);
    },
  },
  { // 10.92 "He asked to borrow a rare book."
    start: 10.82, title: 'Can I Borrow a Rare Book?', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, as = S.at('asked'), rb = S.at('rare');
      study(ctx, S, { desk: true, night: true });
      S.cam(1.06, W / 2, 600);
      k.figure(ctx, 400, 820, { ...FRANKLIN, s: 0.95, face: 1, look: [0.6, 0.6], mood: 'smile', armR: [1.1, 0.9], holdR: c => k.quill(c, 0, 0, 0.45, -0.4) });
      k.letter(ctx, 640, 520, 330, 210, ['Sir, may I borrow', 'your rare book?', '— B. Franklin'], tween(u, as - 0.2, rb + 0.5, ease.linear), { size: 34, rot: -0.04 });
      k.book(ctx, 760, 230, 0.6, { glow: tween(u, rb, rb + 0.4), title: 'RARE', rot: 0.1 });
      k.penCircle(ctx, 760, 230, 110, 120, tween(u, rb + 0.1, rb + 0.6), P.red, 6);
    },
  },
  { // 13.42 "The rival sent it."
    start: 13.32, title: 'He Sent It', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, se = S.at('sent');
      plate(ctx, S, { alpha: 0.08, seed: 13 });
      k.figure(ctx, 760, 1000, { ...RIVAL, s: 1.0, face: -1, look: [-1, -0.2], mood: 'calm', armL: [lerp(0.6, 1.7, tween(u, se - 0.4, se)), 0.2] });
      k.figure(ctx, 190, 1000, { ...FRANKLIN, s: 1.0, face: 1, look: [1, -0.2], mood: u > se + 0.5 ? 'smile' : 'calm', armR: [1.6, 0.2] });
      const f = tween(u, se - 0.1, se + 0.7, ease.inOut);
      k.book(ctx, lerp(650, 280, f), 560 - Math.sin(f * Math.PI) * 260, 0.55, { rot: f * TAU, title: 'RARE' });
    },
  },
  { // 15.12 "Franklin returned it with a thank you note."
    start: 14.8, title: 'With a Thank-You Note', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, rt = S.at('returned'), th = S.at('thank');
      plate(ctx, S, { alpha: 0.08, seed: 15 });
      const f = tween(u, rt - 0.2, rt + 0.5, ease.inOut);
      ctx.save(); ctx.translate(lerp(260, 470, f), 460);
      k.book(ctx, 0, 0, 1.2, { title: 'RARE', rot: -0.05 });
      ctx.restore();
      const n = tween(u, th - 0.4, th + 0.2, ease.outBack);
      if (n > 0) k.letter(ctx, lerp(470, 560, n), lerp(800, 640, n), 440 * n, 230 * n, ['Thank you, sir!', 'Your book was a', 'great pleasure. — B.F.'], tween(u, th, th + 0.9, ease.linear), { size: 34, rot: 0.06, seal: tween(u, th + 0.8, th + 1.0) });
    },
  },
  { // 17.66 "Next time they met, the rival spoke to him for the first time. Kindly."
    start: 17.55, title: 'For the First Time', trans: 'bleed',
    draw(ctx, u, S) {
      const { k, P, W } = S, sp = S.at('spoke'), ft = S.at('first'), kd = S.at('Kindly');
      S.cam(lerp(1.0, 1.1, tween(u, 0, 4)), W / 2, 640);
      hall(ctx, S);
      const walk = tween(u, 0.1, sp);
      k.figure(ctx, lerp(820, 600, walk), 880, { ...RIVAL, s: 1.0, face: -1, walk: walk < 1 ? u * 1.5 : 0, look: [-1, 0], mood: u > kd ? 'smile' : 'calm', armL: [u > sp ? 2.6 : 0.2, 0.2] });
      k.figure(ctx, 280, 880, { ...FRANKLIN, s: 1.0, face: 1, look: [1, 0], mood: u > kd ? 'smile' : u > sp ? 'shock' : 'calm' });
      const b = pop(u, sp - 0.1, 0.3);
      if (b) { ctx.save(); ctx.translate(620, 300); ctx.scale(b, b); k.rect(ctx, -230, -60, 460, 120, P.paperLight, P.ink, 5, 30); k.text(ctx, 'Good day, Mr. Franklin.', 0, 4, 38, { font: 'serif' }); ctx.restore(); }
      k.stamp(ctx, 'FIRST TIME', 230, 230, 46, tween(u, ft, ft + 0.2), -0.1);
      k.scrawl(ctx, 'kindly.', 300, 420, 70, tween(u, kd, kd + 0.4));
    },
  },
  { // 22.2 "They became friends for life."
    start: 21.9, title: 'Friends for Life', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, fr = S.at('friends');
      plate(ctx, S, { blot: false });
      // a red heart-shaped blot blooms behind the handshake (the fold makes it symmetric)
      k.blot(ctx, W / 2, 420, 760, 640, { seed: 71, kind: 'moth', color: P.red, grow: tween(u, 0, fr + 0.4), alpha: 0.85, live: 1, t: S.t, res: 0.3 });
      k.heart(ctx, W / 2, 420, 120, P.paperLight, ease.outBack(tween(u, fr, fr + 0.4)));
      k.figure(ctx, 330, 1010, { ...FRANKLIN, s: 1.15, face: 1, look: [1, 0], mood: 'smile', armR: [1.3, 0.3] });
      k.figure(ctx, 610, 1010, { ...RIVAL, s: 1.15, face: -1, look: [-1, 0], mood: 'smile', armL: [1.3, 0.3] });
      k.scrawl(ctx, 'for life', W / 2, 870, 64, tween(u, fr + 0.3, fr + 0.8));
    },
  },
  { // 24.86 "Here's the trick. Your brain hates a contradiction."
    start: 24.75, title: 'A Contradiction', trans: 'bleed',
    draw(ctx, u, S) {
      const { k, P, W } = S, ct = S.at('contradiction'), ht = S.at('hates');
      plate(ctx, S, { alpha: 0.1, seed: 24 });
      S.cam(1.0, W / 2, 560 + shake(u, ct + 0.2, 8, 0.5));
      k.stamp(ctx, 'THE TRICK', 220, 110, 42, tween(u, 0.05, 0.25), -0.1);
      k.profile(ctx, 360, 1040, 1.55, { blink: 1, inside: c => k.brain(c, 10, -205, 0.55, S.t, { fill: P.paperDark, ink: P.grey }) });
      const cards = [['I don’t like him', P.ink, -1], ['I helped him', P.red, 1]];
      cards.forEach(([s, col, side], i) => {
        const p = pop(u, ht - 0.3 + i * 0.3, 0.3); if (!p) return;
        ctx.save(); ctx.translate(680, 330 + i * 170); ctx.rotate(side * 0.05 + Math.sin(u * 20) * 0.02 * tween(u, ct, ct + 0.3)); ctx.scale(p, p);
        k.rect(ctx, -200, -55, 400, 110, P.paperLight, col, 6, 8); k.text(ctx, s, 0, 4, 40, { font: 'serif', color: col }); ctx.restore();
      });
      // a crack between the two thoughts
      k.penLine(ctx, [[480, 415], [560, 395], [620, 430], [700, 400], [780, 425], [880, 405]], tween(u, ct, ct + 0.3), P.ink, 7);
    },
  },
  { // 28.62 "I helped him, so I must like him."
    start: 28.55, title: 'So I Must Like Him', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, hp = S.at('helped'), ml = S.at('must'), lk = S.at('like');
      plate(ctx, S, { alpha: 0.1, seed: 24 });
      k.profile(ctx, 360, 1040, 1.55, { blink: 1, inside: c => k.brain(c, 10, -205, 0.55, S.t, { fill: P.rose, glow: tween(u, lk, lk + 0.4), spots: [[60, -60]] }) });
      ctx.save(); ctx.translate(680, 330); k.rect(ctx, -200, -55, 400, 110, P.paperLight, P.red, 6, 8); k.text(ctx, 'I helped him', 0, 4, 40, { font: 'serif', color: P.red }); ctx.restore();
      ctx.save(); ctx.translate(680, 500);
      k.rect(ctx, -200, -55, 400, 110, P.paperLight, P.ink, 6, 8);
      const sw = tween(u, ml - 0.1, lk + 0.2);
      k.text(ctx, sw < 0.5 ? 'I don’t like him' : 'so I must like him', 0, 4, 38, { font: 'serif', color: sw < 0.5 ? P.ink : P.red });
      if (sw > 0 && sw < 0.5) k.penLine(ctx, [[-170, 0], [170, 0]], sw * 2, P.red, 8);
      ctx.restore();
      k.arrow(ctx, 680, 390, 680, 440, tween(u, hp, hp + 0.3), P.red, 6, 0);
      k.heart(ctx, 900, 500, 40, P.red, ease.outBack(tween(u, lk, lk + 0.4)));
      k.scrawl(ctx, 'crack fixed.', 700, 680, 54, tween(u, lk + 0.4, lk + 0.9));
    },
  },
  { // 32.2 "In 1969, psychologists tested it."
    start: 32.0, title: 'Tested in 1969', trans: 'fold',
    draw(ctx, u, S) {
      const { k, P, W } = S, yr = S.at('1969'), ts = S.at('tested');
      study(ctx, S, { desk: true });
      S.cam(1.04, W / 2, 600);
      k.figure(ctx, 640, 820, { ...RESEARCHER, s: 0.95, face: -1, look: [-0.8, 0], mood: 'calm', armL: [1.2, 0.8], holdL: c => k.rect(c, -30, -60, 60, 80, P.paperLight, P.ink, 3) });
      k.figure(ctx, 380, 820, { hair: 'bob', skirt: true, s: 0.95, face: 1, look: [1, -0.2], mood: 'smile' });
      k.stamp(ctx, '1969', 760, 200, 66, tween(u, yr, yr + 0.25), 0.1);
      k.stamp(ctx, 'TESTED', 330, 220, 50, tween(u, ts, ts + 0.2), -0.1);
    },
  },
  { // 35.64 "People who did the researcher a personal favor liked him more."
    start: 35.55, title: 'A Personal Favor', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, fv = S.at('personal'), lk = S.at('liked');
      plate(ctx, S, { alpha: 0.05, seed: 36 });
      k.text(ctx, 'HOW MUCH THEY LIKED HIM', W / 2, 110, 40, { color: P.inkSoft });
      const kb = tween(u, lk - 0.4, lk + 0.8);
      k.bars(ctx, 170, 860, 600, 600, [0.85, 0.55], ['DID HIM A FAVOR', 'NO FAVOR'], kb, [P.red, P.inkSoft]);
      k.heart(ctx, 320, 860 - 600 * 0.85 * ease.outCubic(clamp(kb * 1.3)) - 60, 46, P.red, ease.outBack(tween(u, lk + 0.4, lk + 0.8)));
      k.scrawl(ctx, 'a personal favor', 690, 250, 52, tween(u, fv, fv + 0.5), { rot: -0.05 });
      k.text(ctx, '(illustration — no exact numbers)', W / 2, 960, 26, { color: P.grey });
    },
  },
  { // 39.74 "So, keep the favor small, and always say thanks."
    start: 39.65, title: 'Small Favor, Big Thanks', trans: 'blink',
    draw(ctx, u, S) {
      const { k, P, W } = S, sm = S.at('small'), th = S.at('thanks');
      plate(ctx, S, { alpha: 0.1, seed: 40 });
      // borrow a pencil — not a car
      ctx.save(); ctx.translate(300, 360); ctx.rotate(-0.5); k.rect(ctx, -110, -14, 220, 28, P.ochre, P.ink, 4); k.poly(ctx, [[110, -14], [150, 0], [110, 14]], P.paperDark, P.ink, 3); k.rect(ctx, -130, -14, 22, 28, P.rose, P.ink, 3); ctx.restore();
      k.penCircle(ctx, 300, 360, 170, 110, tween(u, sm, sm + 0.4), P.red, 7);
      k.scrawl(ctx, 'small', 300, 540, 64, tween(u, sm + 0.1, sm + 0.5));
      ctx.save(); ctx.translate(720, 330); ctx.globalAlpha = tween(u, sm - 0.2, sm + 0.2);
      k.rect(ctx, -160, -60, 320, 120, '#b8c9d6', P.ink, 4, 30); k.circle(ctx, -100, 60, 40, P.ink); k.circle(ctx, 100, 60, 40, P.ink); k.text(ctx, 'CAR', 0, 0, 40, { color: P.inkSoft });
      ctx.restore();
      k.penLine(ctx, [[560, 230], [880, 460]], tween(u, sm + 0.3, sm + 0.6), P.red, 12);
      const n = tween(u, th - 0.4, th + 0.2, ease.outBack);
      if (n > 0) k.letter(ctx, W / 2, 800, 560 * n, 220 * n, ['THANK YOU!'], tween(u, th - 0.1, th + 0.5), { size: 90, color: P.red, rot: -0.04 });
    },
  },
  { // 44.78 "Follow for more mind tricks." → the case-file cover
    start: 44.65, title: 'More Mind Tricks', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      ctx.save(); plate(ctx, S, { alpha: 0.1, seed: 40 }); k.letter(ctx, W / 2, 800, 560, 220, ['THANK YOU!'], 1, { size: 90, color: P.red, rot: -0.04 }); ctx.restore();
      inkReveal(ctx, S, tween(u, 0.05, 0.75, ease.linear), c => caseCover(c, S, u - 0.05, { handle: meta.brand.handle, caseNo: '1969', tagline: meta.brand.tagline }));
    },
  },
];

export const sfx = [
  { t: 0.5, type: 'buzz', gain: 0.3 },
  { t: 0.7, type: 'thud', gain: 0.4 },
  { t: 2.2, type: 'pop', gain: 0.5 },
  { t: 2.8, type: 'chime', gain: 0.45, pitch: 1.2 },
  { t: 3.95, type: 'splat', gain: 0.7 },
  { t: 4.4, type: 'stamp', gain: 0.7 },
  { t: 5.6, type: 'pen', gain: 0.45 },
  { t: 6.7, type: 'pen', gain: 0.4 },
  { t: 7.3, type: 'heartbeat', gain: 0.4 },
  { t: 8.98, type: 'whoosh', gain: 0.4 },
  { t: 9.8, type: 'pen', gain: 0.6 },
  { t: 10.3, type: 'stamp', gain: 0.8 },
  { t: 10.82, type: 'fold', gain: 0.45 },
  { t: 11.1, type: 'pen', gain: 0.5 },
  { t: 12.1, type: 'chime', gain: 0.4 },
  { t: 13.32, type: 'whoosh', gain: 0.45 },
  { t: 14.3, type: 'thud', gain: 0.4 },
  { t: 14.8, type: 'fold', gain: 0.45 },
  { t: 15.2, type: 'slide', gain: 0.4 },
  { t: 16.2, type: 'pen', gain: 0.45 },
  { t: 17.1, type: 'stamp', gain: 0.6 },
  { t: 17.55, type: 'splat', gain: 0.6 },
  { t: 19.2, type: 'pop', gain: 0.5 },
  { t: 20.0, type: 'stamp', gain: 0.6 },
  { t: 21.4, type: 'chime', gain: 0.4, pitch: 1.2 },
  { t: 21.9, type: 'fold', gain: 0.45 },
  { t: 22.9, type: 'riser', gain: 0.3 },
  { t: 23.2, type: 'gong', gain: 0.35 },
  { t: 24.75, type: 'splat', gain: 0.6 },
  { t: 24.85, type: 'stamp', gain: 0.4 },
  { t: 26.6, type: 'pop', gain: 0.45 },
  { t: 26.9, type: 'pop', gain: 0.45, pitch: 1.2 },
  { t: 27.6, type: 'crack', gain: 0.7 },
  { t: 27.7, type: 'heartbeat', gain: 0.5 },
  { t: 28.55, type: 'whoosh', gain: 0.35 },
  { t: 30.4, type: 'pen', gain: 0.5 },
  { t: 30.9, type: 'chime', gain: 0.45, pitch: 1.2 },
  { t: 32.0, type: 'fold', gain: 0.45 },
  { t: 32.3, type: 'stamp', gain: 0.7 },
  { t: 34.1, type: 'stamp', gain: 0.6 },
  { t: 35.55, type: 'whoosh', gain: 0.4 },
  { t: 37.0, type: 'pen', gain: 0.45 },
  { t: 37.6, type: 'riser', gain: 0.35 },
  { t: 38.4, type: 'pop', gain: 0.5 },
  { t: 39.65, type: 'blink', gain: 0.5 },
  { t: 41.1, type: 'pen', gain: 0.5 },
  { t: 41.5, type: 'pen', gain: 0.55 },
  { t: 43.0, type: 'pop', gain: 0.5 },
  { t: 43.3, type: 'chime', gain: 0.4 },
  { t: 44.7, type: 'splat', gain: 0.8 },
  { t: 45.1, type: 'fold', gain: 0.4 },
  { t: 45.9, type: 'stamp', gain: 0.8 },
  { t: 46.8, type: 'moth', gain: 0.35 },
  { t: 48.2, type: 'bell', gain: 0.3 },
];

export const music = {
  kit: 'mind', bpm: 94, root: 'F', scale: 'major', gain: 0.3,
  sections: [
    { from: 0, to: 3.95, mood: 'intro' },
    { from: 3.95, to: 9.0, mood: 'tense' },
    { from: 9.0, to: 21.9, mood: 'groove' },
    { from: 21.9, to: 24.75, mood: 'triumph' },
    { from: 24.75, to: 32.0, mood: 'tense' },
    { from: 32.0, to: 44.65, mood: 'drive' },
    { from: 44.65, to: 49.2, mood: 'end' },
  ],
};
