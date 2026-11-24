// "The First Freelancers" — the word "freelancer", told as a Karagöz shadow
// play (`karagoz` device): jointed leather puppets on rods behind a backlit
// screen. A knight with a lance becomes, at the end, a writer whose lance has
// turned into a pen. The word is traced, as dictionaries trace it, to Walter
// Scott's novel Ivanhoe, where the knight Maurice de Bracy boasts of his
// "Free Lances" — a novelist's coinage, not a medieval term.
import { clamp, lerp, ease, tween, rng, TAU, pop } from '../../lib/core.mjs';
import { bookCover } from '../../styles/ottoman/scenes.mjs';

export const meta = {
  title: 'The First Freelancers',
  slug: 'freelancer-ottoman',
  style: 'ottoman',
  look: 'karagoz',  // shadow-theatre booth (after album, scroll, ledger)
  room: 'tent',
  device: 'karagoz',
  width: 1080, height: 1920, fps: 30,
  duration: 35.0,
  voice: 'voice.mp3',
  seed: 1819,
  captionChars: 30,
  brand: { handle: '@HOWITSTARTED-YT1', logo: '../../../brand/logo.png' },
  outro: { at: 33.3, text: 'Subscribe for more origin stories' },
};

const KNIGHT = i => ({ robe: ['#9a2a1e', '#2f5f8a', '#3d8458'][i % 3], trim: '#ecd57a', hat: 'knighthelm', hatColor: '#a8a8b0', crest: ['#ecd57a', '#c4371f', '#f8f2e2'][i % 3], skin: '#e8c49a' });
const LORD = (c = '#5a2a6a') => ({ robe: c, trim: '#ecd57a', hat: 'cap', hatColor: '#c9a227', beard: '#3a2a1a', skin: '#e8c49a' });
const pup = (ctx, k, x, y, s, o) => k.puppet(ctx, x, y, s * 1.3, o);
const lance = (k, P, pennant = '#c4371f') => c => { c.save(); c.rotate(-0.25); k.rect(c, -4, -230, 8, 260, '#7a5a3a', P.ink, 1.5); k.poly(c, [[-8, -230], [8, -230], [0, -262]], '#c8c8d0', P.ink, 1.2); k.poly(c, [[4, -222], [60, -206], [4, -190]], pennant, P.ink, 1.2); c.restore(); };
const pen = (k, P) => c => { c.save(); c.rotate(-0.25); k.rect(c, -4, -120, 8, 130, '#2a2a3a', P.ink, 1.5); k.poly(c, [[-6, -120], [6, -120], [0, -150]], '#c9a227', P.ink, 1.2); c.restore(); };

function screen(ctx, S, warm = 0) {
  const { W } = S;
  ctx.fillStyle = warm ? '#f6e2b8' : '#f3e8cc'; ctx.fillRect(-300, -300, W + 600, 1800);
  ctx.fillStyle = 'rgba(120,80,40,0.10)'; ctx.fillRect(-300, 1000, W + 600, 500);
}
// a pierced cut-out horse, as Karagöz stages have
function horse(ctx, S, x, y, s, t = 0, color = '#8a5a3a') {
  const { k, P } = S;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  for (const [lx, ph] of [[-50, 0], [-30, 1.6], [34, 0.8], [54, 2.4]]) { ctx.save(); ctx.translate(lx, -70); ctx.rotate(Math.sin(t * 6 + ph) * 0.3); k.rect(ctx, -7, 0, 14, 70, color, P.ink, 2); ctx.restore(); }
  k.ellipse(ctx, 0, -90, 80, 34, 0, color, P.ink, 2.5);
  ctx.beginPath(); ctx.moveTo(60, -104); ctx.quadraticCurveTo(90, -160, 112, -150); ctx.lineTo(122, -130); ctx.quadraticCurveTo(100, -122, 80, -82); ctx.closePath(); k.fillStroke(ctx, color, P.ink, 2);
  for (let i = 0; i < 6; i++) k.circle(ctx, -40 + i * 16, -94, 3, 'rgba(255,248,220,0.85)', null);
  ctx.beginPath(); ctx.moveTo(-78, -96); ctx.quadraticCurveTo(-104, -80, -98, -50); k.stroke(ctx, P.ink, 4);
  ctx.restore();
}
function bag(ctx, S, x, y, s, n = 1) {
  const { k, P } = S;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-34, 0); ctx.quadraticCurveTo(-44, -60, -10, -70); ctx.lineTo(10, -70); ctx.quadraticCurveTo(44, -60, 34, 0); ctx.closePath(); k.fillStroke(ctx, '#c9a878', P.ink, 2);
  ctx.fillStyle = P.ink; ctx.font = '700 24px Fell'; ctx.textAlign = 'center'; ctx.fillText('$'.repeat(n), 0, -24);
  ctx.restore();
}

export const scenes = [
  { // 0.1 "Freelancer sounds modern. It actually means a soldier for hire, with a lance."
    start: 0, title: 'Freelancer',
    draw(ctx, u, S) {
      const { k, P, W } = S, mo = S.at('modern.'), ac = S.at('actually'), hi = S.at('hire,'), la = S.at('lance.');
      S.cam(lerp(1.2, 1.0, tween(u, 0, la + 0.4, ease.inOut)), W / 2, 760);
      screen(ctx, S);
      // a modern freelancer with a laptop… the screen flips, and he's a knight with a lance
      const flip = tween(u, ac - 0.2, ac + 0.4, ease.inOut);
      ctx.save(); ctx.translate(W / 2, 0); ctx.scale(Math.abs(1 - flip * 2) || 0.02, 1); ctx.translate(-W / 2, 0);
      if (flip < 0.5) { pup(ctx, k, W / 2, 1000, 1.5, { robe: '#3a4a6a', trim: '#efe6cf', hat: 'cap', hatColor: '#2a2a3a', skin: '#e8c49a', t: S.t, face: 1, arm: 0.35, hold: c => { k.rect(c, -40, -10, 80, 50, '#4a4a5a', P.ink, 2); k.rect(c, -34, -4, 68, 38, '#8ab0d0', null); } }); }
      else { horse(ctx, S, W / 2 + 40, 1040, 2.0, S.t, '#6a4a2a'); pup(ctx, k, W / 2 - 10, 900, 1.0, { ...KNIGHT(0), t: S.t, face: 1, arm: 0.35, rod: false, hold: lance(k, P) }); }
      ctx.restore();
      const c = tween(u, hi - 0.2, hi + 0.3, ease.outBack); if (c > 0) for (let i = 0; i < 3; i++) { ctx.save(); ctx.translate(820 + i * 50, 420 - i * 20); ctx.scale(c, c); k.coin(ctx, 0, 0, 28, S.t * 3 + i, '$'); ctx.restore(); }
    },
  },
  { // 6.3 "Mercenaries fought for whoever paid them."
    start: 6.1, title: 'For Whoever Paid', trans: 'curtain',
    draw(ctx, u, S) {
      const { k, P, W } = S, wh = S.at('whoever'), pa = S.at('paid');
      S.cam(lerp(1.0, 1.08, tween(u, 0, 2.2)), W / 2, 760);
      screen(ctx, S, 1);
      // two lords hold out bags; the knight walks to the heavier one
      pup(ctx, k, 160, 1000, 1.2, { ...LORD('#5a2a6a'), t: S.t, face: 1, arm: 0.5, hold: c => bag(c, S, 0, 40, 0.7, 1) });
      pup(ctx, k, 920, 1000, 1.3, { ...LORD('#2f6a5a'), t: S.t, face: -1, arm: 0.5, hold: c => bag(c, S, 0, 40, 1.0, 3) });
      const go = tween(u, wh - 0.2, pa + 0.8, ease.inOut);
      pup(ctx, k, lerp(400, 700, go), 1000, 1.2, { ...KNIGHT(1), t: S.t, face: 1, walk: go > 0 && go < 1 ? 1 : 0, arm: 0.35, hold: lance(k, P, '#2f5f8a') });
    },
  },
  { // 8.6 "But the word itself?"
    start: 8.4, title: 'But the Word?', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, it = S.at('itself?');
      S.cam(lerp(1.1, 1.25, tween(u, 0, 1.8, ease.inOut)), W / 2, 600);
      screen(ctx, S);
      // a dictionary on a stand, and a question mark over it
      ctx.save(); ctx.translate(W / 2, 760); k.rect(ctx, -12, 0, 24, 240, '#7a5a3a', P.ink, 2); k.openBook(ctx, 0, -40, 520, 300, { cover: '#5a2a1a' }); ctx.restore();
      ctx.fillStyle = P.ink; ctx.font = '700 46px Fell'; ctx.textAlign = 'center'; ctx.fillText('free·lanc·er', W / 2 - 120, 700);
      const q = tween(u, it - 0.3, it + 0.2, ease.outBack); if (q > 0) { ctx.save(); ctx.translate(W / 2 + 130, 520); ctx.scale(q, q); ctx.fillStyle = P.vermDark; ctx.font = '900 180px Deco'; ctx.fillText('?', 0, 0); ctx.restore(); }
    },
  },
  { // 10.4 "Dictionaries trace it to a novel, Ivanhoe, by Sir Walter Scott, around 1820."
    start: 10.3, title: 'Ivanhoe, 1819', trans: 'curtain',
    draw(ctx, u, S) {
      const { k, P, W } = S, no = S.at('novel,'), iv = S.at('Ivanhoe,'), sc = S.at('Scott,'), ye = S.at('1820.');
      S.cam(lerp(1.0, 1.15, tween(u, iv - 0.3, ye + 0.4, ease.inOut)), lerp(W / 2, 460, tween(u, iv - 0.3, ye + 0.4)), 720);
      screen(ctx, S, 1);
      // the author at his desk; the novel grows out of his pages
      k.rect(ctx, 420, 860, 340, 24, '#7a5a3a', P.ink, 2); k.rect(ctx, 440, 884, 18, 120, '#7a5a3a', P.ink, 2); k.rect(ctx, 720, 884, 18, 120, '#7a5a3a', P.ink, 2);
      pup(ctx, k, 300, 1000, 1.3, { robe: '#2a2a3a', trim: '#efe6cf', hat: 'bald', hair: '#c9a46a', skin: '#e8c49a', t: S.t, face: 1, arm: 0.4 + Math.sin(S.t * 8) * 0.05, hold: c => k.quill(c, 0, 0, 0.8, -0.4) });
      const b = tween(u, no - 0.2, iv + 0.4, ease.outBack);
      if (b > 0) { ctx.save(); ctx.translate(680, 560); ctx.scale(b, b); ctx.rotate(-0.06); k.rect(ctx, -150, -200, 300, 400, '#5a2a1a', P.ink, 3); k.rect(ctx, -130, -180, 260, 360, null, '#c9a227', 2); ctx.fillStyle = '#ecd57a'; ctx.font = '900 54px Deco'; ctx.textAlign = 'center'; ctx.fillText('IVANHOE', 0, -40); ctx.font = '700 24px Fell'; ctx.fillText('A ROMANCE', 0, 0); ctx.fillText('BY THE AUTHOR OF', 0, 60); ctx.fillText('“WAVERLEY”', 0, 92); ctx.restore(); }
      k.label(ctx, 'SIR WALTER SCOTT', 300, 560, 20, tween(u, sc - 0.2, sc + 0.3));
      k.label(ctx, 'PUBLISHED DEC 1819 · DATED 1820', 680, 840, 16, tween(u, ye, ye + 0.4));
    },
  },
  { // 17.0 "A lord brags about his hired knights, his freelances."
    start: 16.6, title: 'His Free Lances', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, br = S.at('brags'), hi = S.at('hired'), fr = S.at('freelances.');
      S.cam(lerp(1.0, 1.15, tween(u, br, fr + 0.6, ease.inOut)), W / 2, 760);
      screen(ctx, S);
      // the boaster, arm thrown wide; behind him a line of lances rises
      pup(ctx, k, 220, 1000, 1.4, { ...KNIGHT(2), hat: 'cap', hatColor: '#9a2a1e', beard: '#3a2a1a', t: S.t, face: 1, arm: lerp(0.3, 0.95, tween(u, br - 0.2, br + 0.3)), talk: tween(u, br, fr + 0.3) });
      const n = Math.floor(tween(u, hi - 0.4, fr + 0.4) * 5);
      for (let i = 0; i < n; i++) pup(ctx, k, 480 + i * 130, 1000, 0.95, { ...KNIGHT(i), t: S.t + i, face: -1, arm: 0.3, rod: i === 0, hold: lance(k, P, ['#c4371f', '#2f5f8a', '#ecd57a'][i % 3]) });
      const sp = tween(u, fr - 0.3, fr + 0.4, ease.outBack); if (sp > 0) { ctx.save(); ctx.translate(380, 420); ctx.scale(sp, sp); k.ellipse(ctx, 0, 0, 230, 80, 0, '#f6eed8', P.ink, 3); ctx.fillStyle = P.ink; ctx.font = 'italic 700 40px GaramondItalic'; ctx.textAlign = 'center'; ctx.fillText('“my Free Lances”', 0, 14); ctx.restore(); }
      k.label(ctx, 'MAURICE DE BRACY, IN THE NOVEL', 380, 260, 16, tween(u, br, br + 0.4));
    },
  },
  { // 21.9 "Free because they weren't loyal to any lord."
    start: 21.5, title: 'Free of Any Lord', trans: 'curtain',
    draw(ctx, u, S) {
      const { k, P, W } = S, fr = S.at('Free'), lo = S.at('loyal'), lr = S.at('lord.');
      S.cam(lerp(1.15, 1.0, tween(u, 0, lr + 0.4, ease.inOut)), W / 2, 700);
      screen(ctx, S, 1);
      // the word splits in two: FREE + LANCE
      const sp = tween(u, fr - 0.2, fr + 0.5, ease.outBack);
      ctx.fillStyle = P.ink; ctx.font = '900 96px Deco'; ctx.textAlign = 'center';
      ctx.fillText('FREE', W / 2 - lerp(130, 250, sp), 360); ctx.fillText('LANCE', W / 2 + lerp(160, 250, sp), 360);
      if (sp > 0.5) { ctx.fillStyle = P.vermDark; ctx.font = '900 80px Deco'; ctx.fillText('+', W / 2 + 10, 350); }
      // banners of lords, each crossed out as the knight rides past
      for (let i = 0; i < 3; i++) { const x = 220 + i * 320, cr = tween(u, lo - 0.4 + i * 0.25, lo + i * 0.25); ctx.beginPath(); ctx.moveTo(x, 1000); ctx.lineTo(x, 560); k.stroke(ctx, '#7a5a3a', 6); k.rect(ctx, x, 560, 120, 90, ['#5a2a6a', '#2f6a5a', '#9a2a1e'][i], P.ink, 2); if (cr > 0) { ctx.beginPath(); ctx.moveTo(x + 6, 566); ctx.lineTo(x + 6 + 108 * cr, 566 + 78 * cr); ctx.moveTo(x + 114, 566); ctx.lineTo(x + 114 - 108 * cr, 566 + 78 * cr); k.stroke(ctx, P.vermDark, 8); } }
      const ride = tween(u, 0, lr + 0.8, ease.linear);
      horse(ctx, S, lerp(-100, 1180, ride), 1050, 1.4, S.t, '#6a4a2a'); pup(ctx, k, lerp(-110, 1170, ride), 950, 0.8, { ...KNIGHT(1), t: S.t, face: 1, rod: false, arm: 0.35, hold: lance(k, P, '#ecd57a') });
    },
  },
  { // 25.1 "Later it meant independent politicians."
    start: 24.8, title: 'Independent Politicians', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, la = S.at('Later'), in_ = S.at('independent'), po = S.at('politicians.');
      S.cam(lerp(1.0, 1.15, tween(u, in_ - 0.3, po + 0.6, ease.inOut)), W / 2, 760);
      screen(ctx, S);
      // two party benches, and one man standing apart from both
      for (const [x0, c, f] of [[60, '#2f5f8a', 1], [740, '#9a2a1e', -1]]) { k.rect(ctx, x0, 900, 280, 40, c, P.ink, 2); for (let i = 0; i < 3; i++) pup(ctx, k, x0 + 50 + i * 90, 1000, 0.75, { robe: c, trim: '#efe6cf', hat: 'bowler', hatColor: '#2a1c12', skin: '#e8c49a', t: S.t + i, face: f, arm: 0.2, rod: i === 1 }); }
      const st = tween(u, in_ - 0.3, in_ + 0.3, ease.outBack);
      pup(ctx, k, W / 2, 1000 - st * 40, 1.2, { robe: '#3d8458', trim: '#ecd57a', hat: 'bowler', hatColor: '#2a1c12', skin: '#e8c49a', t: S.t, face: 1, arm: 0.2 + st * 0.6, talk: tween(u, po - 0.3, po + 0.4) });
      k.label(ctx, 'A “FREE LANCE”: TIED TO NO PARTY', W / 2, 520, 16, tween(u, la, la + 0.4));
    },
  },
  { // 28.6 "Then, anyone who works for themselves."
    start: 27.9, title: 'Anyone on Their Own', trans: 'curtain',
    draw(ctx, u, S) {
      const { k, P, W } = S, an = S.at('anyone'), wo = S.at('works'), th = S.at('themselves.');
      S.cam(lerp(1.2, 1.0, tween(u, 0, th + 0.4, ease.inOut)), W / 2, 760);
      screen(ctx, S, 1);
      // the knight again… and his lance becomes a pen
      const m = tween(u, an - 0.2, wo + 0.4, ease.inOut);
      pup(ctx, k, W / 2 - 100, 1000, 1.4, { ...(m < 0.5 ? KNIGHT(0) : { robe: '#3a4a6a', trim: '#efe6cf', hat: 'cap', hatColor: '#2a2a3a', skin: '#e8c49a' }), t: S.t, face: 1, arm: 0.35, hold: m < 0.5 ? lance(k, P) : pen(k, P) });
      const sg = tween(u, th - 0.4, th + 0.2, ease.outBack); if (sg > 0) { ctx.save(); ctx.translate(700, 560); ctx.scale(sg, sg); k.rect(ctx, -170, -60, 340, 120, '#efe6cf', P.ink, 3); ctx.fillStyle = P.ink; ctx.font = '900 46px Deco'; ctx.textAlign = 'center'; ctx.fillText('FREELANCE', 0, 16); ctx.restore(); }
      for (let i = 0; i < 4; i++) k.rect(ctx, 640 + i * 6, 980 - i * 16, 180, 14, '#f6efdc', P.ink, 1.2);
    },
  },
  { // 31.3 "Every legend has a beginning."
    start: 31.1, title: 'Every Legend Has a Beginning', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S, beg = S.at('beginning.');
      ctx.save(); S.cam(lerp(1.0, 1.4, tween(u, 0, beg)), W / 2, 760);
      screen(ctx, S, 1); horse(ctx, S, W / 2 + 40, 1040, 2.0, S.t, '#6a4a2a'); pup(ctx, k, W / 2 - 10, 900, 1.0, { ...KNIGHT(0), t: S.t, face: 1, rod: false, arm: 0.35, hold: lance(k, P) });
      ctx.restore();
      const open = tween(u, beg - 0.1, beg + 0.55, ease.inOut);
      if (open > 0) {
        ctx.save(); ctx.beginPath(); ctx.arc(W / 2, 560, open * 900, 0, TAU); ctx.clip(); bookCover(ctx, S, u - beg); ctx.restore();
        if (open < 1) { ctx.beginPath(); ctx.arc(W / 2, 560, open * 900, 0, TAU); k.stroke(ctx, P.goldLight, 8); }
      }
    },
  },
];

// ---------- sound ----------
export const sfx = [
  ...scenes.slice(1).map(s => ({ t: s.start - 0.05, type: s.trans === 'cut' ? 'pop' : 'paper', gain: 0.28 })),
  { t: 1.3, type: 'pop', gain: 0.3 }, { t: 2.5, type: 'whoosh', gain: 0.4 }, { t: 3.9, type: 'coins', gain: 0.4 }, { t: 5.2, type: 'clank', gain: 0.4, pitch: 1.3 },
  { t: 7.5, type: 'coins', gain: 0.35 }, { t: 7.8, type: 'coins', gain: 0.4, pitch: 1.2 },
  { t: 9.3, type: 'pluck', gain: 0.3, pitch: 0.8 },
  { t: 11.0, type: 'paper', gain: 0.3 }, { t: 12.9, type: 'stamp', gain: 0.45 }, { t: 15.2, type: 'chime', gain: 0.35, pitch: 1.2 },
  ...Array.from({ length: 5 }, (_, i) => ({ t: +(18.3 + i * 0.25).toFixed(2), type: 'clank', gain: 0.2, pitch: 1.1 + i * 0.05 })), { t: 19.6, type: 'pop', gain: 0.4 },
  { t: 21.9, type: 'pop', gain: 0.4 }, ...Array.from({ length: 6 }, (_, i) => ({ t: +(22.4 + i * 0.35).toFixed(2), type: 'thud', gain: 0.18, pitch: 1.1 })),
  { t: 26.0, type: 'pluck', gain: 0.3 }, { t: 26.5, type: 'chime', gain: 0.35, pitch: 1.2 },
  { t: 28.7, type: 'whoosh', gain: 0.35 }, { t: 29.9, type: 'stamp', gain: 0.45 },
];

export const music = {
  bpm: 108, root: 'B', maqam: 'rast', gain: 0.3,
  sections: [
    { from: 0, to: 6.1, mood: 'intro' },
    { from: 6.1, to: 16.6, mood: 'groove' },
    { from: 16.6, to: 24.8, mood: 'drive' },
    { from: 24.8, to: 33.3, mood: 'triumph' },
    { from: 33.3, to: 35.0, mood: 'end' },
  ],
};
