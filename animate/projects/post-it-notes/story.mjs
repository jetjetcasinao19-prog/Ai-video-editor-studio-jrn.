// "How Post-it Notes Started" — an Ottoman miniature chronicle.
// u = seconds since the scene started; S.at('word') = when that word is said.
import { clamp, lerp, ease, tween, rng, TAU, shake, pop } from '../../lib/core.mjs';
import { land, interior, lamp, compassRose, bookCover, scroll, heart, bigSign, medallion } from '../../styles/ottoman/scenes.mjs';

export const meta = {
  title: 'How Post-it Notes Started',
  slug: 'post-it-notes-ottoman',
  style: 'ottoman',
  look: 'scroll',
  room: 'lattice',
  width: 1080, height: 1920, fps: 30,
  duration: 54.4,
  voice: 'voice.mp3',
  seed: 31,
  captionChars: 30,
  brand: { handle: '@HOWITSTARTED-YT1', logo: '../../../brand/logo.png' },
  outro: { at: 52.1, text: 'Subscribe for more origin stories' },
};

const YEL = '#f4d63e';
const SILVER = { robe: '#3d8458', robeP: 'cintamani', robePc: '#ecd57a', inner: '#f7eed6', sash: '#c4371f', hat: 'turban', hatColor: '#20408f', glasses: true, mustache: false };
const FRY = { robe: '#3f68bd', robeP: 'flowers', robePc: '#f7eed6', inner: '#e9be6e', sash: '#c4371f', hat: 'turban', hatColor: '#c4371f', mustache: true, beard: 'none' };

// A bazaar stall stacked with note pads; flop = the failed test market.
function stall(ctx, u, S, flop) {
  const { k, P, W, H } = S;
  const fl = flop ? S.at('flops') : 99, dim = flop ? tween(u, fl - 0.1, fl + 0.5) : 0;
  S.cam(flop ? 1.08 : lerp(1.12, 1.0, tween(u, 0, 3.3)), W / 2, 560 + shake(u, fl, 7, 0.4));
  land(ctx, S, { horizon: 300, seed: 41, clouds: 2 });
  if (dim > 0) { ctx.save(); ctx.fillStyle = `rgba(40,50,80,${0.35 * dim})`; ctx.fillRect(-100, -100, W + 200, H + 200); ctx.restore(); ctx.save(); ctx.globalAlpha = dim; k.cloud(ctx, W / 2 - 60, 150, 2.2, 77, '#9aa3b8', P.ink); ctx.strokeStyle = 'rgba(200,220,240,0.8)'; ctx.lineWidth = 2; for (let i = 0; i < 30; i++) { const x = 160 + (i * 37) % 620, y = 220 + ((u * 600 + i * 53) % 520); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 6, y + 22); ctx.stroke(); } ctx.restore(); }
  k.rect(ctx, 220, 470, 500, 330, P.brownLight, P.ink, 2.5);
  k.canopy(ctx, 470, 430, 540, 120, P.verm, S.t);
  // pyramids of pads (they topple in the flop)
  const fall = flop ? tween(u, fl + 0.05, fl + 0.6, ease.inCubic) : 0;
  const R = rng(5);
  for (const [cx, base] of [[340, 690], [600, 690]]) {
    let n = 0;
    for (let row = 0; row < 4; row++) for (let i = 0; i < 4 - row; i++, n++) {
      const x = cx + (i - (3 - row) / 2) * 52, y = base - row * 44, d = R();
      ctx.save(); ctx.translate(x + fall * (d - 0.3) * 160, y + fall * (row * 60 + d * 80)); ctx.rotate(fall * (d - 0.5) * 2);
      k.notePad(ctx, 0, 0, 46, 3, YEL); ctx.restore();
    }
  }
  k.rect(ctx, 200, 700, 540, 44, P.ochre, P.ink, 2);
  const bk = flop ? 1 : tween(u, S.at('Press') - 0.1, S.at('Press') + 0.4, ease.outBack);
  if (bk > 0) { ctx.save(); ctx.translate(470, 390); ctx.scale(bk, bk); ctx.rotate(flop ? fall * 0.25 : 0); k.cartouche(ctx, 0, 0, 470, 84, P.paperLight, P.goldDark, 4); ctx.fillStyle = P.verm; ctx.font = "900 46px Deco"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText("PRESS 'N PEEL", 0, 4); ctx.restore(); }
  k.figure(ctx, 470, 720, { ...SILVER, s: 0.75, face: 1, mood: flop && u > fl ? 'sad' : 'happy', armF: flop ? [0.3, 0.2] : [2.2 + Math.sin(u * 4) * 0.2, 0.3] });
  for (let i = 0; i < 3; i++) {
    const x = lerp(-140 - i * 230, 1120 - i * 230, (flop ? u + 1.5 : u) / 3.6);
    k.figure(ctx, x, 1010 - i * 18, { s: 0.92, face: 1, robe: [P.green, P.lav, P.ochre][i], robeP: ['dots', 'stripes', 'flowers'][i], hat: i === 1 ? 'fez' : 'turban', hatColor: P.lapis, beard: i ? 'short' : 'none', walk: u * 9 + i, armF: [Math.sin(u * 9 + i) * 0.4, 0.3], look: flop ? -0.4 : 0.2 });
  }
  if (flop && u > fl) k.stamp(ctx, 'FLOP', 760, 280, 70, tween(u, fl, fl + 0.25, ease.linear), 0.15);
}

export const scenes = [
  { // 0.0 "This glue was a failure."
    start: 0, title: 'A Failed Glue',
    draw(ctx, u, S) {
      const { k, P, W } = S, fail = S.at('failure');
      S.cam(lerp(1.5, 1.05, tween(u, 0, 2.1, ease.inOut)), W / 2, lerp(520, 560, tween(u, 0, 2.1)));
      interior(ctx, S, { window: true, carpetColor: P.lapis });
      // the jar tips and the glue oozes out
      const tip = tween(u, 0.2, 0.8, ease.outBounce);
      const ooze = tween(u, 0.6, 1.8);
      ctx.beginPath(); ctx.ellipse(W / 2 + 120, 905, 40 + 150 * ooze, 10 + 26 * ooze, 0, 0, TAU); k.fillStroke(ctx, '#efe6c8', P.ink, 1.5);
      k.jar(ctx, W / 2 - 10, 900, 1.25, 'GLUE', tip * 1.15);
      k.figure(ctx, 210, 990, { s: 1.12, face: 1, robe: P.ochre, robeP: 'stripes', robePc: P.vermDark, inner: P.white, hat: 'fez', mood: u > fail ? 'sad' : 'calm', armF: [lerp(1.4, 0.3, tween(u, fail, fail + 0.4)), 0.6], look: u > fail ? 0.6 : 0 });
      k.stamp(ctx, 'FAILURE', W / 2 + 60, 470, 80, tween(u, fail, fail + 0.25, ease.linear), -0.16);
    },
  },
  { // 2.3 "Now it's on desks everywhere."
    start: 2.2, title: 'On Every Desk', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S, ev = S.at('everywhere'), dk = S.at('desks');
      S.cam(lerp(1.0, 1.06, tween(u, 0, 2.4)), W / 2, 540);
      interior(ctx, S, { window: true, carpetColor: P.verm });
      // the court painters' workshop: scribes at their desks
      const R = rng(12);
      for (let i = 0; i < 3; i++) {
        const x = 170 + i * 300;
        k.figure(ctx, x, 990, { s: 0.95, face: 1, kneel: true, robe: [P.lapis, P.green, P.vermDark][i], robeP: ['dots', 'cintamani', 'flowers'][i], robePc: P.goldLight, hat: 'turban', hatColor: [P.verm, P.lapis, P.green][i], beard: i === 1 ? 'long' : 'short', armF: [1.4 + Math.sin(u * 6 + i) * 0.1, 0.4] });
        k.rahle(ctx, x + 130, 990, 150);
        k.openBook(ctx, x + 130, 920, 120, 60, { rot: -0.08 });
        k.stickyNote(ctx, x + 160, 905, 46 * pop(u, dk + i * 0.12, 0.3), -0.1, 0, YEL);
      }
      // …and then notes everywhere
      for (let i = 0; i < 26; i++) {
        const x = 50 + R() * 840, y = 110 + R() * 520, at = ev + i * 0.035;
        k.stickyNote(ctx, x, y, 62 * pop(u, at, 0.3), (R() - 0.5) * 0.6, R() * 0.4, [YEL, YEL, '#f7a8c0', '#9fe0e6'][i % 4]);
      }
    },
  },
  { // 4.7 "A 3M scientist, Spencer Silver, tries to make a super strong glue."
    start: 4.55, title: '3M · 1968', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W } = S, sp = S.at('Spencer'), tr = S.at('tries'), su = S.at('super');
      S.cam(lerp(1.0, 1.1, tween(u, 0, 5)), W / 2, 560);
      interior(ctx, S, { window: false, carpet: true, carpetColor: P.green });
      lamp(ctx, S, 150, 230, 1);
      // shelves of flasks
      k.rect(ctx, 610, 200, 290, 16, P.brown, P.ink, 2); k.rect(ctx, 610, 330, 290, 16, P.brown, P.ink, 2);
      for (let i = 0; i < 5; i++) { k.circle(ctx, 640 + i * 56, 176, 20, [P.turqLight, P.rose, P.goldLight, P.lavLight, P.sageLight][i], P.ink, 1.5); k.rect(ctx, 634 + i * 56, 140, 12, 20, 'rgba(210,235,240,0.7)', P.ink, 1.2); }
      for (let i = 0; i < 4; i++) k.jar(ctx, 650 + i * 70, 328, 0.32, null);
      k.alembic(ctx, 560, 900, 1.2, S.t, 1, P.goldLight);
      k.figure(ctx, 270, 1000, { ...SILVER, s: 1.2, face: 1, mood: 'happy', armF: [1.6 + Math.sin(u * 3) * 0.1, 0.2], look: 0.2 });
      k.seal(ctx, 800, 520, 74, ' MINNESOTA MINING · 3M ·', '1968', tween(u, 0.2, 0.5, ease.linear));
      // his dream: a glue strong enough to hold the world together
      const dr = tween(u, tr - 0.1, tr + 0.4, ease.outBack);
      if (dr > 0) {
        ctx.save(); ctx.translate(470, 470); ctx.scale(dr, dr);
        for (const [x, y, r] of [[-120, 10, 70], [-40, -40, 80], [60, -30, 80], [130, 20, 64], [0, 40, 80]]) k.circle(ctx, x, y, r, P.white, null);
        ctx.lineWidth = 3;
        for (const [x, y, r] of [[-120, 10, 70], [-40, -40, 80], [60, -30, 80], [130, 20, 64], [0, 40, 80]]) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); k.stroke(ctx, P.lapis, 2); }
        for (const [x, y, r] of [[-120, 10, 70], [-40, -40, 80], [60, -30, 80], [130, 20, 64], [0, 40, 80]]) k.circle(ctx, x, y, r - 2, P.white, null);
        // two great stones glued as one
        k.spongy(ctx, -45, 70, 120, 110, P.lav, 3); k.spongy(ctx, 55, 70, 120, 120, P.rose, 4);
        ctx.beginPath(); ctx.moveTo(5, -30); ctx.lineTo(5, 70); k.stroke(ctx, P.goldLight, 8);
        ctx.restore();
        k.label(ctx, 'SUPER STRONG', 470, 330, 30, tween(u, su, su + 0.3));
      }
      k.label(ctx, 'SPENCER SILVER', 300, 580, 26, tween(u, sp, sp + 0.3));
    },
  },
  { // 9.7 "He makes the opposite."
    start: 9.6, title: 'The Opposite', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S, op = S.at('opposite');
      S.cam(1.1, W / 2, 560);
      interior(ctx, S, { window: false, carpet: true, carpetColor: P.green });
      lamp(ctx, S, 150, 230, 1);
      k.alembic(ctx, 560, 900, 1.2, S.t, 0.3, '#efe6c8');
      k.figure(ctx, 270, 1000, { ...SILVER, s: 1.2, face: 1, mood: u > op ? 'sad' : 'calm', armF: [lerp(1.6, 2.6, tween(u, op, op + 0.3)), lerp(0.2, 1.4, tween(u, op, op + 0.3))], look: u > op ? -0.5 : 0.2 });
      // the stones come apart, the sign turns upside down
      const apart = tween(u, op - 0.1, op + 0.6, ease.inCubic);
      ctx.save(); ctx.translate(470, 470);
      k.spongy(ctx, -45 - apart * 120, 70 + apart * 260, 120, 110, P.lav, 3);
      k.spongy(ctx, 55 + apart * 120, 70 + apart * 300, 120, 120, P.rose, 4);
      ctx.restore();
      ctx.save(); ctx.translate(470, 330); ctx.rotate(Math.PI * tween(u, op, op + 0.5, ease.outBack));
      k.label(ctx, 'SUPER STRONG', 0, 0, 30, 1); ctx.restore();
    },
  },
  { // 11.2 "A glue so weak it peels off and sticks again."
    start: 11.05, title: 'Weak, But Sticky', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S, pe = S.at('peels'), st = S.at('sticks');
      S.cam(1.45, W / 2, 380);
      interior(ctx, S, { arches: 3, carpet: false });
      // peel: corner lifts, the note flies along an arc and sticks again
      const lift = tween(u, pe - 0.35, pe + 0.15), fly = tween(u, pe + 0.1, st, ease.inOut), land2 = tween(u, st, st + 0.15);
      const x = lerp(330, 620, fly), y = lerp(360, 380, fly) - Math.sin(fly * Math.PI) * 110;
      const sc = 1 + 0.12 * (lift - land2) * (fly < 1 ? 1 : 0) + (fly > 0 && fly < 1 ? 0.1 : 0);
      ctx.save(); ctx.translate(x + shake(u, st, 5, 0.3), y); ctx.scale(sc, sc);
      k.stickyNote(ctx, 0, 0, 230, lerp(-0.05, 0.08, fly) + Math.sin(fly * Math.PI) * 0.25, lift * (1 - land2), YEL, 'Stick\nme\nagain!');
      ctx.restore();
      if (u > st) for (let i = 0; i < 10; i++) { const a = i / 10 * TAU, r = 140 + (u - st) * 300; k.star(ctx, 620 + Math.cos(a) * r, 380 + Math.sin(a) * r, 10, 1 - (u - st)); }
    },
  },
  { // 15.1 "Years later, his co-worker Art Fry is singing in his church choir."
    start: 15.0, title: 'Art Fry · 1974', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W } = S, af = S.at('Art'), sg = S.at('singing');
      S.cam(lerp(1.0, 1.12, tween(u, 0, 4.5)), W / 2, 580);
      interior(ctx, S, { window: true, carpetColor: P.vermDark, wall: P.paperLight });
      // candle stands
      for (const x of [90, 850]) { k.rect(ctx, x - 6, 640, 12, 160, P.goldDark, P.ink, 1.5); k.ellipse(ctx, x, 628, 9, 18 + Math.sin(S.t * 18 + x) * 2, 0, P.goldLight, P.verm, 1.5); }
      // the choir
      for (let i = 0; i < 5; i++) {
        const isArt = i === 2, x = 130 + i * 170, y = isArt ? 1000 : 960 - (i % 2) * 20;
        const o = isArt ? { ...FRY } : { robe: [P.lav, P.green, null, P.ochre, P.lapisLight][i], robeP: 'dots', hat: 'turban', hatColor: [P.green, P.lapis, null, P.verm, P.ochre][i], beard: i % 2 ? 'short' : 'none' };
        k.figure(ctx, x, y + Math.sin(u * 4 + i) * 3, { ...o, s: isArt ? 1.12 : 0.92, face: i < 2 ? 1 : -1, mood: u > sg ? 'happy' : 'calm', armF: isArt ? [1.3, 0.9] : [0.9, 1.2], hold: isArt ? c => { c.rotate(-1.4); k.openBook(c, 0, -20, 70, 44, { cover: P.vermDark }); } : null });
      }
      k.label(ctx, 'ART FRY', 470, 560, 28, tween(u, af, af + 0.3));
      // the hymn rises in gold notes
      if (u > sg - 0.2) for (let i = 0; i < 12; i++) { const q = ((u - sg) * 0.5 + i / 12) % 1; k.musicNote(ctx, 160 + (i * 73) % 640 + Math.sin(q * 6 + i) * 20, 560 - q * 420, 26, P.goldDark); }
    },
  },
  { // 19.7 "His bookmarks keep falling out of his hymn book."
    start: 19.55, title: 'Falling Bookmarks', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W, H } = S, fa = S.at('falling');
      ctx.fillStyle = P.paperLight; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = k.pattern(ctx, 'flowers', P.paperLight, '#e6d6ad', 40); ctx.fillRect(0, 0, W, H);
      k.figure(ctx, W / 2 - 20, 1010, { ...FRY, s: 2.6, face: 1, mood: u > fa + 0.6 ? 'sad' : 'calm', look: 0.35, armF: [0.2, 0.2], armB: [0.2, 0.2] });
      ctx.save(); ctx.translate(0, Math.sin(u * 2) * 6);
      // the slips sit in the book, then slide out and flutter down
      const slips = [[300, 0], [420, 0.25], [560, 0.5], [660, 0.8]];
      for (const [x, d] of slips) {
        const q = u - (fa - 0.25 + d);
        let y = 300, r = 0, a = 1;
        if (q > 0) { y = 300 + q * q * 420 + q * 160; r = Math.sin(q * 7 + x) * 0.6 + q * 0.8; a = clamp(2.2 - q); }
        if (a <= 0) continue;
        ctx.save(); ctx.globalAlpha = a; ctx.translate(x + (q > 0 ? Math.sin(q * 5 + x) * 60 : 0), y); ctx.rotate(r);
        k.rect(ctx, -16, -90, 32, 180, [P.verm, P.lapisLight, P.green, P.ochre][slips.findIndex(s => s[0] === x)], P.ink, 1.5); ctx.restore();
      }
      k.openBook(ctx, W / 2, 520, 680, 400, { notes: true, cover: P.vermDark });
      ctx.restore();
      // Art's hands at the edges, holding the book
      for (const sx of [-1, 1]) { ctx.save(); ctx.translate(W / 2 + sx * 350, 620); ctx.rotate(sx * -0.5); k.rect(ctx, -36, 20, 72, 260, FRY.robe, P.ink, 2); k.rect(ctx, -38, 20, 76, 22, P.goldLight, P.ink, 1.5); k.ellipse(ctx, 0, 0, 32, 42, 0, P.skin, P.ink, 2); ctx.restore(); }
      if (u > fa) medallion(ctx, k, P, '!', 820, 200, pop(u, fa + 0.4, 0.3) * 0.9, P.verm);
    },
  },
  { // 22.5 "Then it clicks."
    start: 22.4, title: 'Then It Clicks', trans: 'flash',
    draw(ctx, u, S) {
      const { k, P, W } = S, cl = S.at('clicks');
      const lit = tween(u, cl - 0.05, cl + 0.15);
      k.goldSky(ctx, -100, -100, W + 200, 1300, S.t);
      if (lit > 0) { ctx.save(); ctx.translate(W / 2, 270); for (let i = 0; i < 24; i++) { ctx.rotate(TAU / 24); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-30, 900); ctx.lineTo(30, 900); ctx.closePath(); ctx.fillStyle = `rgba(255,250,210,${0.25 * lit})`; ctx.fill(); } ctx.restore(); }
      S.cam(lerp(1.0, 1.1, tween(u, cl, cl + 1)), W / 2, 540);
      ctx.save(); ctx.translate(W / 2, 270); ctx.scale(2.2, 2.2); lamp(ctx, S, 0, 0, lit); ctx.restore();
      k.figure(ctx, W / 2 - 30, 1420, { ...FRY, s: 2.5, face: 1, mood: lit > 0.5 ? 'happy' : 'calm', armB: lit > 0.5 ? [-2.7, -0.2] : [0.1, 0.2], armF: [0.7, 1.6], look: lit > 0.5 ? -0.3 : 0.2 });
      if (u > cl) for (let i = 0; i < 16; i++) { const a = i / 16 * TAU, r = 80 + (u - cl) * 420; k.star(ctx, W / 2 + Math.cos(a) * r, 270 + Math.sin(a) * r, 12, 1 - (u - cl) * 0.7); }
    },
  },
  { // 24.3 "What if the bookmark could stick?"
    start: 24.1, title: 'What If?', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W, H } = S, wh = S.at('What'), st = S.at('stick');
      ctx.fillStyle = P.paperLight; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = k.pattern(ctx, 'tiles', P.white, P.lapisLight, 70); ctx.fillRect(0, 0, W, H);
      k.carpet(ctx, 60, 620, W - 120, 380, P.verm, P.lapis);
      // the book on a reading stand, yellow tabs stick out of its edge
      k.openBook(ctx, W / 2, 720, 620, 360, { notes: true, cover: P.lapis });
      for (let i = 0; i < 4; i++) { const at = st + 0.25 + i * 0.12; ctx.save(); ctx.translate(W / 2 - 250 + i * 150, 540 - 50 * pop(u, at, 0.3)); k.rect(ctx, -26, -40, 52, 80, YEL, P.ink, 1.5); ctx.restore(); }
      k.openBook(ctx, W / 2, 720, 620, 360, { notes: true, cover: P.lapis });
      const slap = tween(u, st - 0.25, st, ease.inCubic);
      if (slap > 0) { ctx.save(); ctx.translate(W / 2 + 150 + shake(u, st, 4, 0.3), lerp(240, 700, slap)); ctx.scale(lerp(1.8, 1, slap), lerp(1.8, 1, slap)); k.stickyNote(ctx, 0, 0, 150, 0.06, 0, YEL, 'Hymn\n#47'); ctx.restore(); }
      medallion(ctx, k, P, u > st ? '!' : '?', W / 2, 260, pop(u, wh, 0.35) * 1.4, u > st ? P.verm : P.lapis);
    },
  },
  { // 27.9 "3M tests the sticky pads as Press 'n Peel."
    start: 27.75, title: "Press 'n Peel · 1977", trans: 'wipe',
    draw(ctx, u, S) { stall(ctx, u, S, false); },
  },
  { // 31.5 "It flops."
    start: 31.35, title: 'It Flops', trans: 'cut',
    draw(ctx, u, S) { stall(ctx, u, S, true); },
  },
  { // 32.8 "But 3M doesn't quit."
    start: 32.75, title: "3M Doesn't Quit", trans: 'flash',
    draw(ctx, u, S) {
      const { k, P, W } = S, q = S.at('quit');
      const up = tween(u, 0.2, q, ease.outCubic);
      S.cam(lerp(1.08, 1.0, up), W / 2, lerp(600, 540, up));
      land(ctx, S, { horizon: 380, seed: 44, clouds: 2 });
      k.sun(ctx, W / 2, lerp(470, 200, up), 70, S.t);
      k.hills(ctx, W, 290, 44, [P.lav, P.rose, P.sageLight]);
      k.ground(ctx, 0, 380, W, 700, P.sage, 51);
      // the banner is raised on a pole
      ctx.beginPath(); ctx.moveTo(470, 980); ctx.lineTo(470, 420); k.stroke(ctx, P.brown, 8);
      const fy = lerp(900, 470, up);
      ctx.beginPath(); ctx.moveTo(470, fy); for (let i = 0; i <= 8; i++) ctx.lineTo(470 + i * 26, fy + Math.sin(S.t * 6 + i) * 8); ctx.lineTo(470 + 208, fy + 110 + Math.sin(S.t * 6 + 8) * 8); for (let i = 8; i >= 0; i--) ctx.lineTo(470 + i * 26, fy + 110 + Math.sin(S.t * 6 + i) * 8); ctx.closePath();
      k.fillStroke(ctx, P.verm, P.ink, 2);
      ctx.fillStyle = P.goldLight; ctx.font = '900 62px Deco'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('3M', 570, fy + 58 + Math.sin(S.t * 6 + 4) * 8);
      k.figure(ctx, 250, 1010, { ...SILVER, s: 1.05, face: 1, mood: 'happy', armF: [2.7, 0.1] });
      k.figure(ctx, 760, 1010, { ...FRY, s: 1.05, face: -1, mood: 'happy', armF: [2.7, 0.1] });
    },
  },
  { // 35.1 "In 1978, they flood Boise, Idaho with free samples."
    start: 34.95, title: 'Boise, Idaho · 1978', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W, H } = S, fl = S.at('flood'), bo = S.at('Boise'), fr = S.at('free');
      S.cam(lerp(1.1, 1.0, tween(u, 0, 4)), W / 2, 560);
      land(ctx, S, { horizon: 330, seed: 47, clouds: 4, hillColors: [P.lav, P.lavLight, P.rose, P.white] });
      // the Boise River
      ctx.save(); ctx.beginPath(); ctx.moveTo(-20, 820); ctx.bezierCurveTo(300, 760, 600, 900, 960, 830); ctx.lineTo(960, 900); ctx.bezierCurveTo(600, 980, 300, 840, -20, 900); ctx.closePath(); ctx.clip();
      k.waves(ctx, -20, 740, 1000, 300, S.t, P.water, P.waterLight, 24, 22); ctx.restore();
      const R = rng(9), walls = [P.pink, P.white, P.ochreLight, P.lavLight, P.turqLight];
      for (const [row, y, sc] of [[0, 470, 0.85], [1, 620, 1.0], [2, 760, 1.1]]) for (let i = 0; i < 6; i++) {
        const x = 70 + i * 165 + (row % 2) * 70 + R() * 20;
        if (R() < 0.2) { k.cypress(ctx, x, y, 150 * sc, S.t, i); continue; }
        k.house(ctx, x, y, 92 * sc, 78 * sc, { wall: walls[Math.floor(R() * walls.length)], roof: R() < 0.5 ? P.vermDark : P.lapis, chimney: R() < 0.4 });
      }
      // golden clouds pour free samples over the town
      const rain = tween(u, fl - 0.2, fl + 0.6);
      if (rain > 0) {
        for (let i = 0; i < 3; i++) k.cloud(ctx, 200 + i * 280, 90 + (i % 2) * 40, 1.6, 60 + i, P.goldLight, P.goldDeep);
        const N = Math.floor(70 * rain);
        for (let i = 0; i < N; i++) { const d = R(), x0 = R() * W, sp = 260 + d * 260, q = ((u - fl) * sp + d * 900) % 1100; k.stickyNote(ctx, x0 + Math.sin(u * 3 + i) * 30, 120 + q, 34 + d * 18, Math.sin(u * 4 + i) * 0.8, 0.3, [YEL, YEL, YEL, '#f7a8c0'][i % 4]); }
      }
      k.label(ctx, 'BOISE · IDAHO', W / 2, 360, 32, tween(u, bo, bo + 0.3));
      k.seal(ctx, 800, 980, 72, ' FREE SAMPLES · FREE SAMPLES ·', '1978', tween(u, fr, fr + 0.3, ease.linear));
    },
  },
  { // 39.5 "People love them."
    start: 39.4, title: 'People Love Them', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S, lv = S.at('love');
      S.cam(lerp(1.0, 1.08, tween(u, 0, 1.6)), W / 2, 560);
      land(ctx, S, { horizon: 300, seed: 52, clouds: 2 });
      for (let i = 0; i < 5; i++) k.house(ctx, 110 + i * 180, 420, 120, 90, { wall: [P.white, P.pink, P.ochreLight, P.lavLight, P.turqLight][i], roof: i % 2 ? P.lapis : P.vermDark });
      const R = rng(3);
      for (let i = 0; i < 5; i++) {
        const x = 110 + i * 180, y = 1000 - (i % 2) * 40, jump = Math.abs(Math.sin(u * 7 + i)) * 18 * tween(u, lv - 0.2, lv);
        k.figure(ctx, x, y - jump, { s: 0.95, face: i < 2 ? 1 : -1, robe: [P.green, P.lapis, P.verm, P.ochre, P.lav][i], robeP: ['dots', 'cintamani', 'flowers', 'stripes', 'dots'][i], robePc: P.goldLight, hat: i === 3 ? 'fez' : 'turban', hatColor: [P.verm, P.green, P.lapis, null, P.ochre][i], beard: i % 2 ? 'short' : 'none', mood: 'happy', armF: [2.6 + Math.sin(u * 6 + i) * 0.2, 0.2], hold: c => { c.rotate(-0.3); k.stickyNote(c, 0, -26, 40, 0.1, 0, YEL); } });
        for (let j = 0; j < 3; j++) k.stickyNote(ctx, x + (R() - 0.5) * 60, y - jump - 80 - R() * 160, 26, (R() - 0.5), 0.2, YEL);
      }
      if (u > lv - 0.1) for (let i = 0; i < 10; i++) { const q = ((u - lv) * 0.7 + i / 10) % 1; heart(ctx, k, P, 80 + (i * 97) % 780, 620 - q * 420, 1.3, 1 - q); }
    },
  },
  { // 41.2 "Two years later, they hit stores across America as Post-it Notes."
    start: 41.05, title: 'Post-it Notes · 1980', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W, H } = S, hs = S.at('stores'), pn = S.at('Post-it');
      S.cam(lerp(1.12, 1.0, tween(u, 0, 3.5)), W / 2, 540);
      ctx.fillStyle = '#efdcb0'; ctx.fillRect(-100, -100, W + 200, H + 200);
      compassRose(ctx, k, P, 760, 860, 80, u * 0.05);
      compassRose(ctx, k, P, 150, 860, 46);
      const us = [[110, 260], [300, 190], [500, 210], [650, 170], [830, 230], [860, 330], [800, 420], [780, 520], [700, 600], [720, 700], [660, 700], [600, 640], [480, 660], [400, 720], [330, 650], [240, 620], [150, 540], [100, 420]];
      ctx.beginPath(); k.smoothPath(ctx, us); k.fillStroke(ctx, '#cdb57a', P.ink, 2.5);
      ctx.save(); ctx.clip(); ctx.fillStyle = k.pattern(ctx, 'dots', '#cdb57a', '#b39a5e', 26); ctx.fillRect(0, 0, W, H); ctx.restore();
      for (const [x, y, s] of [[200, 330, 0.5], [260, 470, 0.45], [380, 300, 0.35]]) k.spongy(ctx, x, y, 120 * s * 2, 90 * s * 2, P.rose, x);
      for (const [x, y] of [[560, 480], [700, 380], [420, 560]]) k.cypress(ctx, x, y, 60, S.t, x);
      k.label(ctx, 'AMERICA', 470, 140, 24, 1);
      // stores light up coast to coast, each with its yellow sign
      const stores = [[780, 300], [740, 440], [690, 560], [610, 330], [560, 580], [500, 280], [460, 430], [380, 520], [330, 280], [260, 380], [200, 500], [150, 300]];
      stores.forEach(([x, y], i) => { const p = pop(u, hs - 0.1 + i * 0.1, 0.3); if (p <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(p, p); k.house(ctx, 0, 0, 46, 36, { wall: P.white, roof: P.verm }); k.stickyNote(ctx, 0, -62, 30, 0.1, 0, YEL); ctx.restore(); });
      bigSign(ctx, k, P, 'POST-IT NOTES', W / 2, 840, 820, tween(u, pn - 0.05, pn + 0.35, ease.outBack));
    },
  },
  { // 45.3 "A failed glue turned desk icon."
    start: 45.15, title: 'Desk Icon', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S, fa = S.at('failed'), ic = S.at('icon');
      S.cam(lerp(1.06, 1.0, tween(u, 0, 4)), W / 2, 540);
      interior(ctx, S, { window: true, carpetColor: P.verm });
      k.rect(ctx, 330, 700, 280, 60, P.goldDark, P.ink, 2);
      k.canopy(ctx, 470, 330, 330, 370, P.lapis, S.t);
      // the humble pad, enthroned
      ctx.save(); ctx.translate(470, 560 + Math.sin(u * 2) * 6); k.notePad(ctx, 0, 0, 200, 8, YEL); k.stickyNote(ctx, 0, 0, 200, 0, 0.25, YEL, 'GLUE\nthat\nfailed'); ctx.restore();
      const glow = tween(u, ic, ic + 0.4);
      if (glow > 0) for (let i = 0; i < 16; i++) { const a = i / 16 * TAU + u * 0.4, r = 200 + Math.sin(u * 5 + i) * 10; k.star(ctx, 470 + Math.cos(a) * r, 560 + Math.sin(a) * r * 0.9, 12, glow); }
      for (const [x, f] of [[150, 1], [790, -1]]) k.figure(ctx, x, 1010, { s: 1.0, face: f, kneel: true, robe: f > 0 ? P.green : P.ochre, robeP: 'dots', hat: 'turban', hatColor: P.verm, beard: 'short', mood: 'happy', armF: [1.8, 0.4] });
      k.stamp(ctx, 'FAILED', 470, 430, 70, tween(u, fa, fa + 0.25, ease.linear) * (1 - tween(u, ic, ic + 0.2)), -0.15);
      k.seal(ctx, 470, 880, 86, ' A FAILED GLUE TURNED DESK ICON ·', 'DESK\nICON', tween(u, ic - 0.05, ic + 0.3, ease.linear), P.verm);
    },
  },
  { // 49.9 "Every legend has a beginning."
    start: 49.75, title: 'Every Legend Has a Beginning', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S, beg = S.at('beginning');
      ctx.save();
      S.cam(lerp(1.0, 1.35, tween(u, 0, beg)), W / 2, lerp(600, 640, tween(u, 0, beg)));
      interior(ctx, S, { window: true, carpetColor: P.lapis });
      const g = ctx.createRadialGradient(W / 2, 760, 10, W / 2, 760, 260); g.addColorStop(0, 'rgba(255,240,170,0.8)'); g.addColorStop(1, 'rgba(255,240,170,0)');
      ctx.fillStyle = g; ctx.fillRect(W / 2 - 270, 500, 540, 540);
      k.jar(ctx, W / 2, 900, 1.25, 'GLUE');
      k.stickyNote(ctx, W / 2 + 10, lerp(840, 640, tween(u, 0.2, beg, ease.outCubic)), 90, Math.sin(u * 3) * 0.1, 0, YEL);
      k.figure(ctx, 210, 990, { ...SILVER, s: 1.15, face: 1, mood: 'happy', armF: [1.7, 0.5] });
      k.figure(ctx, 730, 990, { ...FRY, s: 1.15, face: -1, mood: 'happy', armF: [1.7, 0.5] });
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
const pops = (from, n, gap, gain = 0.5) => Array.from({ length: n }, (_, i) => ({ t: +(from + i * gap).toFixed(3), type: 'pop', gain, pitch: 1 + (i % 4) * 0.12 }));
export const sfx = [
  ...scenes.slice(1).map(s => ({ t: s.start - 0.05, type: s.trans === 'unroll' ? 'paper' : 'whoosh', gain: 0.35 })),
  { t: 0.25, type: 'thud', gain: 0.5 }, { t: 0.6, type: 'slide', gain: 0.3 }, { t: 1.16, type: 'stamp', gain: 0.9 },
  ...pops(2.78, 3, 0.12, 0.4), ...pops(3.12, 14, 0.035, 0.4),
  { t: 4.8, type: 'stamp', gain: 0.6 }, { t: 6.02, type: 'pluck', gain: 0.5 }, { t: 7.2, type: 'chime', gain: 0.4 }, { t: 8.0, type: 'gong', gain: 0.45 },
  { t: 10.18, type: 'flop', gain: 0.6 }, { t: 10.3, type: 'thud', gain: 0.5 },
  { t: 12.1, type: 'paper', gain: 0.55 }, { t: 13.32, type: 'pop', gain: 0.8, pitch: 0.8 }, { t: 13.35, type: 'chime', gain: 0.4 },
  { t: 16.64, type: 'pluck', gain: 0.5, pitch: 1.26 }, { t: 17.64, type: 'chime', gain: 0.3, pitch: 0.75 },
  { t: 20.4, type: 'paper', gain: 0.4 }, { t: 20.7, type: 'slide', gain: 0.3 }, { t: 21.1, type: 'slide', gain: 0.3 },
  { t: 22.95, type: 'riser', gain: 0.4 }, { t: 23.0, type: 'gong', gain: 0.8 }, { t: 23.02, type: 'chime', gain: 0.5 },
  { t: 24.24, type: 'pluck', gain: 0.4 }, { t: 26.1, type: 'stamp', gain: 0.6 }, ...pops(26.35, 4, 0.12, 0.4),
  { t: 29.85, type: 'chime', gain: 0.4 }, { t: 30.3, type: 'coins', gain: 0.25 },
  { t: 31.56, type: 'flop', gain: 0.6 }, { t: 31.7, type: 'rain', gain: 0.35 }, { t: 31.62, type: 'stamp', gain: 0.6 }, { t: 32.1, type: 'crickets', gain: 0.3 },
  { t: 33.3, type: 'riser', gain: 0.4 }, { t: 33.92, type: 'gong', gain: 0.75 },
  { t: 35.14, type: 'chime', gain: 0.3 }, { t: 36.6, type: 'wind', gain: 0.35 }, ...pops(36.8, 18, 0.08, 0.3), { t: 38.0, type: 'stamp', gain: 0.6 },
  { t: 39.78, type: 'coins', gain: 0.3 }, ...pops(39.8, 6, 0.15, 0.35),
  ...pops(42.4, 12, 0.1, 0.35), { t: 44.44, type: 'gong', gain: 0.7 },
  { t: 46.32, type: 'stamp', gain: 0.8 }, { t: 48.6, type: 'stamp', gain: 0.9 }, { t: 48.66, type: 'chime', gain: 0.6 }, { t: 48.7, type: 'coins', gain: 0.4 },
  { t: 51.1, type: 'pop', gain: 0.8 }, { t: 51.15, type: 'gong', gain: 0.9 },
];

export const music = {
  bpm: 100, root: 'A', maqam: 'nihavend', gain: 0.32,
  sections: [
    { from: 0, to: 4.55, mood: 'intro' },
    { from: 4.55, to: 9.6, mood: 'groove' },
    { from: 9.6, to: 11.05, mood: 'sad' },
    { from: 11.05, to: 15.0, mood: 'groove' },
    { from: 15.0, to: 22.4, mood: 'intro' },
    { from: 22.4, to: 31.4, mood: 'drive' },
    { from: 31.4, to: 32.8, mood: 'sad' },
    { from: 32.8, to: 39.4, mood: 'drive' },
    { from: 39.4, to: 51.1, mood: 'triumph' },
    { from: 51.1, to: 54.4, mood: 'end' },
  ],
};
