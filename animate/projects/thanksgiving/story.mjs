// "How Thanksgiving Became a National Holiday" — an Ottoman miniature chronicle.
// u = seconds since the scene started; S.at('word') = when that word is said.
import { clamp, lerp, ease, tween, rng, TAU, shake, pop } from '../../lib/core.mjs';
import { land, interior, lamp, bookCover, bigSign, medallion } from '../../styles/ottoman/scenes.mjs';

export const meta = {
  title: 'How Thanksgiving Became a National Holiday',
  slug: 'thanksgiving-ottoman',
  style: 'ottoman',
  look: 'album',
  room: 'library',
  width: 1080, height: 1920, fps: 30,
  duration: 57.0,
  voice: 'voice.mp3',
  seed: 47,
  captionChars: 30,
  brand: { handle: '@HOWITSTARTED-YT1', logo: '../../../brand/logo.png' },
  outro: { at: 55.0, text: 'Subscribe for more origin stories' },
};

const SARAH = { robe: '#5a2e4a', robeP: 'flowers', robePc: '#e8b7b0', inner: '#f7eed6', sash: '#c9a227', hat: 'hotoz', hatColor: '#20408f', veil: '#f8f2e2', hair: '#3a2a20' };
const LINCOLN = { robe: '#2a1c12', robeP: 'dots', robePc: '#5a4a3a', inner: '#f8f2e2', sash: '#c4371f', hat: 'stovepipe', beard: 'chin', beardColor: '#2a1c12', hair: '#2a1c12' };
const PRESIDENTS = [
  ['TAYLOR', { robe: '#3d8458', robeP: 'dots', hat: 'turban', hatColor: '#c4371f', beard: 'none' }],
  ['FILLMORE', { robe: '#7a4a2a', robeP: 'stripes', hat: 'turban', hatColor: '#20408f', beard: 'none' }],
  ['PIERCE', { robe: '#3f68bd', robeP: 'cintamani', hat: 'turban', hatColor: '#d6973a', beard: 'none', mustache: true }],
  ['BUCHANAN', { robe: '#8e2414', robeP: 'flowers', hat: 'turban', hatColor: '#3d8458', beard: 'none' }],
];
const US = [[110, 260], [300, 190], [500, 210], [650, 170], [830, 230], [860, 330], [800, 420], [780, 520], [700, 600], [720, 700], [660, 700], [600, 640], [480, 660], [400, 720], [330, 650], [240, 620], [150, 540], [100, 420]];
const FAMILY_SKINS = ['#f1d1a8', '#c68a5e', '#8a5a3c', '#e2b48a', '#a86c45', '#f1d1a8'];

function feastTable(ctx, S, y, w, t, pop0 = 1) {
  const { k, P, W } = S;
  k.rect(ctx, W / 2 - w / 2, y, w, 30, P.brownLight, P.ink, 2.5);
  ctx.fillStyle = P.white; ctx.fillRect(W / 2 - w / 2 - 10, y - 6, w + 20, 18); k.rect(ctx, W / 2 - w / 2 - 10, y - 6, w + 20, 18, null, P.ink, 1.5);
  k.turkey(ctx, W / 2, y - 10, 1.0 * pop0, t);
  k.pie(ctx, W / 2 - w * 0.34, y - 8, 1.0 * pop0, P.ochre); k.pie(ctx, W / 2 + w * 0.34, y - 8, 1.0 * pop0, P.vermDark);
  k.pumpkin(ctx, W / 2 - w * 0.2, y - 6, 0.8 * pop0); k.pumpkin(ctx, W / 2 + w * 0.2, y - 6, 0.7 * pop0);
}
function usMap(ctx, S, color = '#cdb57a') {
  const { k, P, W, H } = S;
  ctx.beginPath(); k.smoothPath(ctx, US); k.fillStroke(ctx, color, P.ink, 2.5);
  ctx.save(); ctx.clip(); ctx.fillStyle = k.pattern(ctx, 'dots', color, '#b39a5e', 26); ctx.fillRect(0, 0, W, H); ctx.restore();
}

export const scenes = [
  { // 0.0 "The woman who wrote Mary Had a Little Lamb"
    start: 0, title: '“Mary Had a Little Lamb”',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const mh = S.at('Mary');
      S.cam(lerp(1.15, 1.0, tween(u, 0, 2.8)), W / 2, 560);
      land(ctx, S, { horizon: 380, seed: 101, clouds: 3 });
      k.blossomTree(ctx, 820, 760, 300, S.t, 4, P.white);
      k.house(ctx, 160, 560, 160, 110, { wall: P.white, roof: P.verm, chimney: true });
      // Mary walks to school, and the lamb follows
      const x = lerp(200, 560, tween(u, 0, 2.9, ease.linear));
      k.figure(ctx, x, 960, { s: 0.8, face: 1, robe: P.verm, robeP: 'flowers', robePc: P.white, inner: P.white, hat: 'hotoz', hatColor: P.lapis, veil: P.white, mood: 'happy', walk: u * 8, armF: [0.6, 0.6], hold: c => { c.rotate(-0.4); S.k.rect(c, -18, -6, 36, 26, P.brownLight, P.ink, 1.5); } });
      k.lamb(ctx, x - 160, 980, 1.0, S.t, u * 9);
      // the poem in an open book
      const bk = tween(u, mh - 0.1, mh + 0.4, ease.outBack);
      if (bk > 0) { ctx.save(); ctx.translate(W / 2, 250); ctx.scale(bk, bk); k.cartouche(ctx, 0, 0, 760, 120, P.paperLight, P.goldDark, 5); ctx.fillStyle = P.verm; ctx.font = 'italic 700 52px GaramondItalic'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('“Mary Had a Little Lamb”', 0, 4); ctx.restore(); }
      k.seal(ctx, 830, 420, 60, ' A POEM · A POEM ·', '1830', tween(u, S.at('Lamb'), S.at('Lamb') + 0.3, ease.linear));
    },
  },
  { // 3.1 "…is the reason you get Thanksgiving."
    start: 2.95, title: 'The Reason for Thanksgiving', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const tg = S.at('Thanksgiving');
      S.cam(lerp(1.08, 1.0, tween(u, 0, 2.4)), W / 2, 560);
      interior(ctx, S, { window: true, carpetColor: P.vermDark });
      for (let i = 0; i < 6; i++) { const x = 130 + i * 136, f = i < 3 ? 1 : -1; k.figure(ctx, x, 940 + (i % 2) * 10, { s: 0.7, face: f, kneel: true, skin: FAMILY_SKINS[i], robe: [P.green, P.lapis, P.ochre, P.verm, P.lav, P.turq][i], robeP: 'dots', hat: i % 2 ? 'hotoz' : 'turban', hatColor: [P.verm, P.lapis, P.green][i % 3], veil: P.white, mood: 'happy', armF: [1.2 + Math.sin(u * 4 + i) * 0.2, 0.6] }); }
      feastTable(ctx, S, 800, 640, S.t, pop(u, tg - 0.3, 0.4));
      if (u > tg) for (let i = 0; i < 14; i++) { const a = i / 14 * TAU, r = 80 + (u - tg) * 380; k.star(ctx, W / 2 + Math.cos(a) * r, 700 + Math.sin(a) * r * 0.6, 11, 1 - (u - tg) * 0.7); }
      k.label(ctx, 'THANKSGIVING', W / 2, 260, 36, tween(u, tg, tg + 0.3));
    },
  },
  { // 5.5 "Her name? Sarah Josepha Hale."
    start: 5.4, title: 'Sarah Josepha Hale', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const nm = S.at('name'), sa = S.at('Sarah');
      S.cam(lerp(1.0, 1.1, tween(u, 0, 3.4)), W / 2, 580);
      interior(ctx, S, { window: true, carpetColor: P.lapis });
      lamp(ctx, S, 760, 240, 1);
      k.rahle(ctx, 600, 990, 220);
      k.openBook(ctx, 610, 910, 170, 80, { rot: -0.08 });
      k.quill(ctx, 640, 900, 0.6, 0.4);
      k.figure(ctx, 330, 1000, { ...SARAH, s: 1.3, face: 1, kneel: true, mood: 'calm', armF: [1.5 + Math.sin(u * 6) * 0.06, 0.5] });
      medallion(ctx, k, P, '?', W / 2, 330, pop(u, nm, 0.35) * (1 - tween(u, sa - 0.1, sa + 0.1)) * 1.2);
      k.label(ctx, 'SARAH JOSEPHA HALE', W / 2, 330, 30, tween(u, sa, sa + 0.3));
    },
  },
  { // 9.0 "In the 1800s, Thanksgiving was a mess."
    start: 8.85, title: 'The 1800s: A Mess', trans: 'wipe',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const ms = S.at('mess');
      ctx.fillStyle = '#efdcb0'; ctx.fillRect(0, 0, W, H);
      S.cam(1.0, W / 2 + shake(u, ms, 8, 0.5), 520);
      usMap(ctx, S);
      // calendar pages with a different day everywhere
      const R = rng(11), months = ['OCT', 'NOV', 'NOV', 'DEC', 'NOV', 'SEP', 'NOV', 'DEC'];
      for (let i = 0; i < 14; i++) {
        const x = 150 + R() * 640, y = 230 + R() * 420, at = 0.2 + i * 0.12, p = pop(u, at, 0.3);
        if (p <= 0) continue;
        const scat = tween(u, ms, ms + 0.6, ease.inCubic) * (R() - 0.5) * 300;
        ctx.save(); ctx.translate(x + scat, y + Math.abs(scat) * 0.6); ctx.scale(p, p); k.calendarPage(ctx, 0, 0, 74, months[i % 8], 1 + Math.floor(R() * 30), (R() - 0.5) * 0.5 + tween(u, ms, ms + 0.6) * (R() - 0.5) * 3); ctx.restore();
      }
      k.label(ctx, 'THE 1800s', W / 2, 140, 32, tween(u, 0.2, 0.5));
      k.stamp(ctx, 'A MESS', W / 2, 860, 80, tween(u, ms, ms + 0.25, ease.linear), -0.1);
    },
  },
  { // 12.4 "Every state picked its own day. Many didn't celebrate it at all."
    start: 12.2, title: 'Every State, Its Own Day', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const ma = S.at('Many');
      S.cam(lerp(1.06, 1.0, tween(u, 0, 4.6)), W / 2, 560);
      land(ctx, S, { horizon: 330, seed: 103, clouds: 2 });
      const days = [['NOV', 26], ['DEC', 3], ['NOV', 19], ['OCT', 29], ['NOV', 30], ['DEC', 10]];
      for (let i = 0; i < 6; i++) {
        const x = 120 + (i % 3) * 350, y = 600 + Math.floor(i / 3) * 300, none = i === 1 || i === 5;
        const dark = none ? tween(u, ma - 0.1, ma + 0.4) : 0;
        k.house(ctx, x, y, 170, 120, { wall: [P.white, P.pink, P.ochreLight, P.lavLight, P.turqLight, P.sageLight][i], roof: P.verm, lit: !none });
        if (dark > 0) { ctx.save(); ctx.globalAlpha = 0.55 * dark; k.rect(ctx, x - 90, y - 210, 180, 212, '#2a2f45', null); ctx.restore(); }
        ctx.save(); ctx.translate(x + 90, y - 180); ctx.scale(pop(u, 0.15 + i * 0.12, 0.3), pop(u, 0.15 + i * 0.12, 0.3)); k.calendarPage(ctx, 0, 0, 62, days[i][0], days[i][1], (i % 2 ? 0.12 : -0.1)); ctx.restore();
      }
    },
  },
  { // 17.1 "Sarah ran one of America's most popular magazines."
    start: 16.9, title: "Godey's Lady's Book", trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const pr = S.at('popular'), mg = S.at('magazines');
      S.cam(lerp(1.1, 1.0, tween(u, 0, 3.6)), W / 2, 560);
      interior(ctx, S, { window: true, carpetColor: P.green });
      const strokeK = (Math.sin(u * 5) + 1) / 2;
      k.printingPress(ctx, 330, 900, 1.25, strokeK);
      // magazines fly off the press and stack up
      for (let i = 0; i < 9; i++) { const q = clamp((u - 0.3 - i * 0.28) / 0.8); if (q <= 0) continue; const x = lerp(330, 640 + (i % 3) * 90, ease.outCubic(q)), y = lerp(760, 880 - Math.floor(i / 3) * 14, ease.outCubic(q)) - Math.sin(q * Math.PI) * 220; k.magazine(ctx, x, y, 80, (1 - q) * 3 + (i % 3 - 1) * 0.08, 'LADY’S BOOK', [P.lapis, P.verm, P.green][i % 3]); }
      k.figure(ctx, 820, 1010, { ...SARAH, s: 1.0, face: -1, mood: 'happy', armF: [1.6, 0.4], hold: c => { S.k.magazine(c, 20, -20, 60, -0.3, 'LADY’S BOOK'); } });
      k.label(ctx, "GODEY'S LADY'S BOOK", W / 2, 250, 30, tween(u, 0.3, 0.6));
      if (u > pr) for (let i = 0; i < 12; i++) { const a = i / 12 * TAU, r = 90 + (u - pr) * 300; k.star(ctx, 690 + Math.cos(a) * r, 820 + Math.sin(a) * r * 0.6, 10, 1 - (u - pr) * 0.7); }
      k.label(ctx, 'ONE OF THE MOST POPULAR', W / 2, 330, 24, tween(u, mg, mg + 0.3));
    },
  },
  { // 20.8 "She used it to push for one national day of thanks."
    start: 20.6, title: 'One National Day', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const pu = S.at('push'), na = S.at('national');
      ctx.fillStyle = P.paperLight; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = k.pattern(ctx, 'flowers', P.paperLight, '#e6d6ad', 40); ctx.fillRect(0, 0, W, H);
      // the editorial page, headline written out
      k.rect(ctx, 120, 180, 700, 760, P.white, P.ink, 3);
      k.rect(ctx, 140, 200, 660, 110, P.lapis, P.ink, 2);
      ctx.fillStyle = P.goldLight; ctx.font = '900 44px Deco'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('LADY’S BOOK', W / 2 - 0, 255);
      const hk = tween(u, pu - 0.2, na + 0.6);
      ctx.save(); ctx.beginPath(); ctx.rect(140, 330, 660 * hk, 200); ctx.clip();
      ctx.fillStyle = P.verm; ctx.font = '900 54px Deco'; ctx.fillText('ONE NATIONAL', W / 2, 390); ctx.fillText('DAY OF THANKS', W / 2, 460); ctx.restore();
      for (let i = 0; i < 9; i++) { const lk = tween(u, 0.2 + i * 0.25, 0.6 + i * 0.25); ctx.beginPath(); ctx.moveTo(170, 560 + i * 40); ctx.lineTo(170 + 600 * lk, 560 + i * 40); k.stroke(ctx, P.grey, 3); }
      k.quill(ctx, lerp(200, 760, (u * 0.6) % 1), 540 + Math.floor((u * 0.6) % 9) * 40 - 10, 1.1, 0.5);
      k.seal(ctx, 760, 880, 70, ' ONE DAY · ONE DAY · ONE DAY ·', 'ONE\nDAY', tween(u, na + 0.3, na + 0.6, ease.linear));
    },
  },
  { // 25.1 "She wrote to presidents, Taylor, Fillmore, Pierce, Buchanan. None of them acted."
    start: 24.85, title: 'Four Presidents', trans: 'wipe',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const no = S.at('None');
      interior(ctx, S, { arches: 3, carpet: false });
      ctx.fillStyle = P.verm; ctx.fillRect(0, 760, W, 300); ctx.fillStyle = k.pattern(ctx, 'flowers', P.verm, P.vermDark, 30); ctx.fillRect(0, 760, W, 300);
      PRESIDENTS.forEach(([name, o], i) => {
        const x = 130 + i * 228, at = S.at(name.charAt(0) + name.slice(1).toLowerCase());
        k.figure(ctx, x, 1000, { ...o, s: 0.9, face: 1, kneel: true, mood: u > no ? 'calm' : 'calm', look: u > no + i * 0.1 ? -0.5 : 0, armF: [lerp(0.5, 1.2, tween(u, at, at + 0.3)), 0.5] });
        k.label(ctx, name, x, 700, 22, tween(u, at - 0.1, at + 0.2));
        // a letter flies in on the name…
        const q = tween(u, at - 0.6, at, ease.inOut);
        if (q > 0 && u < no + 0.3) k.envelope(ctx, lerp(W / 2, x + 50, q), lerp(1200, 860, q) - Math.sin(q * Math.PI) * 300, 0.55, q * 4);
        // …and is tossed aside
        const toss = tween(u, no + i * 0.1, no + 0.6 + i * 0.1, ease.inCubic);
        if (toss > 0) { ctx.save(); ctx.globalAlpha = 1 - toss; k.envelope(ctx, x + 50 + toss * 60, 860 + toss * 200, 0.55, toss * 5); ctx.restore(); }
      });
      k.stamp(ctx, 'NONE OF THEM ACTED', W / 2, 400, 52, tween(u, S.at('acted'), S.at('acted') + 0.25, ease.linear), -0.08);
    },
  },
  { // 31.9 "She didn't quit."
    start: 31.7, title: "She Didn't Quit", trans: 'flash',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      k.goldSky(ctx, -60, -60, W + 120, H + 120, S.t);
      ctx.save(); ctx.translate(W / 2, 360); for (let i = 0; i < 24; i++) { ctx.rotate(TAU / 24); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-30, 900); ctx.lineTo(30, 900); ctx.closePath(); ctx.fillStyle = 'rgba(255,250,210,0.28)'; ctx.fill(); } ctx.restore();
      k.sun(ctx, W / 2, lerp(520, 360, tween(u, 0, 1)), 60, S.t);
      k.carpet(ctx, 120, 820, W - 240, 200, P.verm, P.lapis);
      k.figure(ctx, W / 2, 1000, { ...SARAH, s: 1.3, face: 1, mood: 'happy', armF: [2.7, 0.1], hold: c => S.k.quill(c, 0, 0, 0.9, 0.2, 1) });
    },
  },
  { // 32.8 "The country is torn apart by the Civil War."
    start: 32.7, title: 'The Civil War', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const to = S.at('torn'), cw = S.at('Civil');
      ctx.fillStyle = P.lapisDeep; ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 4; i++) { ctx.save(); ctx.globalAlpha = 0.7; k.cloud(ctx, ((i * 300 + S.t * 50) % (W + 300)) - 150, 120 + i * 40, 1.3, i + 110, '#9aa3b8', P.ink); ctx.restore(); }
      // the map tears in two
      const tear = tween(u, to - 0.1, to + 0.6, ease.outCubic);
      for (const side of [-1, 1]) {
        ctx.save(); ctx.translate(side * tear * 70, tear * 20); ctx.rotate(side * tear * 0.05);
        ctx.beginPath(); ctx.rect(side < 0 ? -100 : W / 2 + 10, -100, W / 2 + 90, H + 200);
        ctx.clip(); ctx.translate(0, 160); usMap(ctx, S, side < 0 ? '#c7b07a' : '#bfb38c'); ctx.restore();
      }
      if (tear > 0) { ctx.beginPath(); let y = 300; ctx.moveTo(W / 2, y); while (y < 900) { y += 40; ctx.lineTo(W / 2 + (y % 80 ? 18 : -18), y); } k.stroke(ctx, P.verm, 4); }
      // smoke of battle
      if (u > cw - 0.3) for (let i = 0; i < 5; i++) { const q = ((u - cw) * 0.5 + i / 5) % 1; ctx.save(); ctx.globalAlpha = (1 - q) * 0.8; k.cloud(ctx, 200 + i * 150, 900 - q * 200, 0.7 + q, i + 120, '#c9ccd4', P.grey); ctx.restore(); }
      k.label(ctx, 'THE CIVIL WAR', W / 2, 1000, 30, tween(u, cw, cw + 0.3));
    },
  },
  { // 35.8 "She writes one more letter to Abraham Lincoln."
    start: 35.6, title: 'One More Letter · 1863', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const wr = S.at('writes'), ab = S.at('Abraham');
      S.cam(lerp(1.0, 1.08, tween(u, 0, 3.8)), W / 2, 560);
      interior(ctx, S, { window: true, carpetColor: P.lapis });
      lamp(ctx, S, 300, 220, 1);
      k.rahle(ctx, 520, 990, 220);
      k.figure(ctx, 280, 1000, { ...SARAH, s: 1.2, face: 1, kneel: true, mood: 'calm', armF: [1.5 + Math.sin(u * 7) * 0.08, 0.4], hold: c => S.k.quill(c, 0, 0, 0.6, 0.5) });
      // the letter is sealed, then flies off through the window
      const fly = tween(u, ab - 0.4, ab + 0.6, ease.inOut);
      const seal = tween(u, wr + 0.8, wr + 1.1);
      k.envelope(ctx, lerp(540, 900, fly), lerp(900, 230, fly) - Math.sin(fly * Math.PI) * 120, lerp(1.0, 0.5, fly), fly * 0.6, seal > 0.5 ? P.verm : P.paperLight);
      k.seal(ctx, 820, 600, 60, ' SEPTEMBER · SEPTEMBER ·', '1863', tween(u, wr, wr + 0.3, ease.linear));
    },
  },
  { // 39.5 "Days later, Lincoln declares a national Thanksgiving,"
    start: 39.4, title: 'Lincoln Declares', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const de = S.at('declares'), na = S.at('national');
      S.cam(lerp(1.06, 1.0, tween(u, 0, 4)), W / 2, 540);
      interior(ctx, S, { window: true, carpetColor: P.verm });
      k.canopy(ctx, 470, 300, 380, 380, P.lapis, S.t);
      k.figure(ctx, 470, 760, { ...LINCOLN, s: 1.25, face: 1, mood: u > de ? 'happy' : 'calm', armF: [lerp(0.6, 1.7, tween(u, de - 0.4, de)), 0.1] });
      k.label(ctx, 'ABRAHAM LINCOLN', 470, 260, 26, tween(u, S.at('Lincoln') - 0.2, S.at('Lincoln') + 0.1), P.goldLight);
      // the proclamation unrolls
      const un = tween(u, de - 0.1, na + 0.6, ease.inOut);
      if (un > 0) {
        k.rect(ctx, 160, 790, 620, 26, P.brownLight, P.ink, 2);
        ctx.save(); ctx.beginPath(); ctx.rect(170, 816, 600, 220 * un); ctx.clip();
        k.rect(ctx, 170, 816, 600, 220, P.paperLight, P.ink, 2);
        ctx.fillStyle = P.verm; ctx.font = '900 40px Deco'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('A NATIONAL', W / 2, 880); ctx.fillText('THANKSGIVING', W / 2, 935);
        ctx.fillStyle = P.ink; ctx.font = '700 26px Fell'; ctx.fillText('PROCLAMATION · OCTOBER 3, 1863', W / 2, 990);
        ctx.restore();
        k.rect(ctx, 160, 816 + 220 * un - 6, 620, 22, P.brownLight, P.ink, 2);
      }
    },
  },
  { // 43.6 "the last Thursday in November."
    start: 43.5, title: 'The Last Thursday', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const th = S.at('Thursday');
      ctx.fillStyle = P.paperLight; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = k.pattern(ctx, 'tiles', P.white, P.lapisLight, 70); ctx.fillRect(0, 0, W, H);
      // a month grid: the last Thursday is circled
      const x0 = 110, y0 = 330, cw = 103, ch = 96;
      k.rect(ctx, x0 - 10, y0 - 130, cw * 7 + 20, ch * 5 + 150, P.paperLight, P.ink, 3);
      k.rect(ctx, x0 - 10, y0 - 130, cw * 7 + 20, 80, P.verm, P.ink, 2.5);
      ctx.fillStyle = P.paperLight; ctx.font = '900 50px Deco'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('NOVEMBER', W / 2, y0 - 88);
      const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
      ctx.fillStyle = P.ink; ctx.font = '700 24px Fell'; days.forEach((d, i) => ctx.fillText(d, x0 + cw * i + cw / 2, y0 - 28));
      ctx.font = '700 34px Garamond';
      for (let d = 1; d <= 30; d++) { const c = (d - 1) % 7, r = Math.floor((d - 1) / 7); ctx.fillStyle = c === 4 ? P.lapis : P.ink; ctx.fillText(String(d), x0 + cw * c + cw / 2, y0 + 20 + r * ch); }
      // last Thursday in this grid = the 26th
      const cx = x0 + cw * 4 + cw / 2, cy = y0 + 20 + 3 * ch, ck = tween(u, th - 0.1, th + 0.5);
      if (ck > 0) { ctx.beginPath(); ctx.ellipse(cx, cy, 44, 36, -0.1, -Math.PI / 2, -Math.PI / 2 + TAU * ck); k.stroke(ctx, P.verm, 6); }
      if (u > th + 0.4) { k.turkey(ctx, cx + 4, cy - 30, 0.32 * pop(u, th + 0.4, 0.3), S.t); }
    },
  },
  { // 46.5 "One woman, one pen,"
    start: 46.3, title: 'One Woman, One Pen', trans: 'flash',
    draw(ctx, u, S) {
      const { k, P, W, H } = S;
      const wo = S.at('woman'), pe = S.at('pen');
      ctx.fillStyle = P.lapisDeep; ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 50; i++) k.star(ctx, (i * 197) % W, (i * 89) % 700, 4 + (i % 3) * 2, 0.6 + 0.4 * Math.sin(S.t * 3 + i));
      k.carpet(ctx, 120, 820, W - 240, 200, P.vermDark, P.lapis);
      const g = ctx.createRadialGradient(W / 2, 700, 20, W / 2, 700, 420); g.addColorStop(0, 'rgba(255,240,170,0.45)'); g.addColorStop(1, 'rgba(255,240,170,0)'); ctx.fillStyle = g; ctx.fillRect(0, 300, W, 800);
      k.figure(ctx, 360, 1000, { ...SARAH, s: 1.35, face: 1, mood: 'happy', armF: [1.6, 0.2] });
      k.quill(ctx, 660, 820, 2.2 * pop(u, pe - 0.1, 0.4), 0.3, tween(u, pe, pe + 0.4));
    },
  },
  { // 49.3 "and a holiday the whole country shares."
    start: 49.2, title: 'A Holiday We Share', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const sh = S.at('shares'), wh = S.at('whole');
      S.cam(lerp(1.25, 0.95, tween(u, 0, 2.5, ease.inOut)), W / 2, 640);
      land(ctx, S, { horizon: 330, seed: 107, clouds: 3 });
      k.canopy(ctx, W / 2, 470, 760, 260, P.verm, S.t);
      for (let i = 0; i < 8; i++) { const x = 100 + i * 105, f = i < 4 ? 1 : -1; k.figure(ctx, x, 900 + (i % 2) * 12, { s: 0.62, face: f, kneel: true, skin: FAMILY_SKINS[i % 6], robe: [P.green, P.lapis, P.ochre, P.verm, P.lav, P.turq, P.pink, P.brownLight][i], robeP: 'dots', hat: i % 2 ? 'hotoz' : 'turban', hatColor: [P.verm, P.lapis, P.green][i % 3], veil: P.white, mood: 'happy', armF: [1.1 + Math.sin(u * 4 + i) * 0.2, 0.6] }); }
      feastTable(ctx, S, 760, 820, S.t, 1);
      if (u > wh) for (let i = 0; i < 10; i++) { const q = ((u - wh) * 0.6 + i / 10) % 1; k.star(ctx, 80 + (i * 97) % 780, 640 - q * 400, 10, 1 - q); }
    },
  },
  { // 51.9 "Every legend has a beginning."
    start: 51.7, title: 'Every Legend Has a Beginning', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W, H } = S, beg = S.at('beginning');
      ctx.save();
      S.cam(lerp(1.0, 1.45, tween(u, 0, beg)), lerp(W / 2, 620, tween(u, 0, beg)), lerp(600, 820, tween(u, 0, beg)));
      interior(ctx, S, { window: true, carpetColor: P.lapis });
      lamp(ctx, S, 760, 240, 1);
      k.rahle(ctx, 600, 990, 220);
      k.openBook(ctx, 610, 910, 170, 80, { rot: -0.08 });
      k.quill(ctx, 640, 880, 0.9, 0.4, tween(u, 0.3, beg));
      k.figure(ctx, 330, 1000, { ...SARAH, s: 1.3, face: 1, kneel: true, mood: 'happy', armF: [1.5, 0.5] });
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
  { t: 0.94, type: 'chime', gain: 0.45 }, { t: 2.04, type: 'stamp', gain: 0.5 },
  { t: 3.9, type: 'riser', gain: 0.3 }, { t: 4.1, type: 'gong', gain: 0.6 }, { t: 4.15, type: 'chime', gain: 0.4 },
  { t: 5.66, type: 'pluck', gain: 0.45 }, { t: 6.56, type: 'chime', gain: 0.45 },
  ...pops(9.05, 14, 0.12, 0.3), { t: 11.22, type: 'thud', gain: 0.6 }, { t: 11.25, type: 'paper', gain: 0.5 }, { t: 11.3, type: 'stamp', gain: 0.6 },
  ...pops(12.35, 6, 0.12, 0.3), { t: 14.7, type: 'flop', gain: 0.35 }, { t: 14.9, type: 'stamp', gain: 0.4 }, { t: 15.0, type: 'crickets', gain: 0.25 },
  { t: 17.2, type: 'clank', gain: 0.4 }, { t: 17.9, type: 'clank', gain: 0.4 }, { t: 18.6, type: 'clank', gain: 0.4 }, { t: 18.74, type: 'chime', gain: 0.5 },
  { t: 21.4, type: 'paper', gain: 0.4 }, { t: 22.44, type: 'gong', gain: 0.5 }, { t: 23.2, type: 'stamp', gain: 0.6 },
  { t: 26.2, type: 'paper', gain: 0.35 }, { t: 27.0, type: 'paper', gain: 0.35 }, { t: 27.8, type: 'paper', gain: 0.35 }, { t: 28.6, type: 'paper', gain: 0.35 },
  { t: 30.2, type: 'flop', gain: 0.55 }, { t: 30.62, type: 'stamp', gain: 0.8 },
  { t: 31.75, type: 'riser', gain: 0.4 }, { t: 32.1, type: 'gong', gain: 0.6 },
  { t: 32.8, type: 'thunder', gain: 0.5 }, { t: 34.02, type: 'crack', gain: 0.8 }, { t: 34.1, type: 'paper', gain: 0.6 }, { t: 35.2, type: 'thud', gain: 0.5 },
  { t: 36.6, type: 'paper', gain: 0.35 }, { t: 37.5, type: 'stamp', gain: 0.5 }, { t: 38.2, type: 'whoosh', gain: 0.5 },
  { t: 41.5, type: 'paper', gain: 0.55 }, { t: 42.44, type: 'gong', gain: 0.75 }, { t: 42.5, type: 'chime', gain: 0.5 },
  { t: 44.8, type: 'slide', gain: 0.3 }, { t: 45.3, type: 'pop', gain: 0.6 },
  { t: 47.34, type: 'pluck', gain: 0.5 }, { t: 48.38, type: 'chime', gain: 0.6 },
  { t: 50.42, type: 'coins', gain: 0.3 }, { t: 50.9, type: 'chime', gain: 0.45 },
  { t: 53.92, type: 'pop', gain: 0.8 }, { t: 53.96, type: 'gong', gain: 0.9 },
];

export const music = {
  bpm: 92, root: 'F', maqam: 'rast', gain: 0.32,
  sections: [
    { from: 0, to: 8.85, mood: 'intro' },
    { from: 8.85, to: 16.9, mood: 'groove' },
    { from: 16.9, to: 24.85, mood: 'drive' },
    { from: 24.85, to: 31.7, mood: 'sad' },
    { from: 31.7, to: 39.4, mood: 'drive' },
    { from: 39.4, to: 53.95, mood: 'triumph' },
    { from: 53.95, to: 57.0, mood: 'end' },
  ],
};
