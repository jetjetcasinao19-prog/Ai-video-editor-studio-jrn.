// "The Unfair Origin of Monopoly" — told as a Karagöz shadow play: Lizzie Magie
// and Charles Darrow are jointed leather puppets on rods behind a backlit screen.
// The board is drawn generic (after the 1904 patent's idea), never the brand's design.
import { clamp, lerp, ease, tween, rng, TAU, shake, pop } from '../../lib/core.mjs';
import { interior, bookCover, medallion } from '../../styles/ottoman/scenes.mjs';

export const meta = {
  title: 'The Unfair Origin of Monopoly',
  slug: 'monopoly-ottoman',
  style: 'ottoman',
  look: 'karagoz',  // shadow-theatre booth (the three videos before used tile, scroll, night)
  room: 'tent',
  device: 'karagoz',
  width: 1080, height: 1920, fps: 30,
  duration: 55.0,
  voice: 'voice.mp3',
  seed: 141,
  captionChars: 30,
  brand: { handle: '@HOWITSTARTED-YT1', logo: '../../../brand/logo.png' },
  outro: { at: 53.2, text: 'Subscribe for more origin stories' },
};

const LIZZIE = { robe: '#2f7f7a', trim: '#ecd57a', hat: 'bun', hatColor: '#c4371f', hair: '#5a3a2a', skin: '#f1d1a8' };
const DARROW = { robe: '#3a3f55', trim: '#c9a227', hat: 'fedora', hatColor: '#5a4632', tie: '#c4371f', skin: '#f1d1a8' };
const JUDGE = { robe: '#22222c', trim: '#f8f2e2', hat: 'bald', hair: '#dddddd', skin: '#e2b48a' };
const PLAYERS = [
  { robe: '#c4371f', trim: '#ecd57a', hat: 'cap', hatColor: '#20408f', skin: '#c68a5e' },
  { robe: '#d6973a', trim: '#f8f2e2', hat: 'bowler', hatColor: '#2a1c12', skin: '#f1d1a8' },
  { robe: '#a99ac6', trim: '#ecd57a', hat: 'bun', hatColor: '#3d8458', hair: '#2a1c12', skin: '#8a5a3c' },
  { robe: '#3d8458', trim: '#ecd57a', hat: 'cap', hatColor: '#c4371f', skin: '#e2b48a' },
];

// puppets are drawn 30% larger than the kit default so they read on a phone
const pup = (ctx, k, x, y, s, o) => k.puppet(ctx, x, y, s * 1.3, o);

// the muslin screen with a set piece or two, as a Karagöz stage would have
function screen(ctx, S, warm = 0) {
  const { W, P } = S;
  ctx.fillStyle = warm ? '#f6e2b8' : '#f3e8cc'; ctx.fillRect(-80, -80, W + 160, 1240);
  ctx.fillStyle = 'rgba(120,80,40,0.10)'; ctx.fillRect(-80, 1000, W + 160, 120);
}
// a pierced set-piece house (göstermelik style)
function setHouse(ctx, k, P, x, base, s, color) {
  ctx.save(); ctx.translate(x, base); ctx.scale(s, s);
  k.rect(ctx, -70, -140, 140, 140, color, P.ink, 2.5);
  k.poly(ctx, [[-86, -140], [0, -210], [86, -140]], P.vermDark, P.ink, 2.5);
  for (let i = 0; i < 2; i++) k.arch(ctx, -36 + i * 72, -30, 34, 60, '#fff3c8');
  for (let i = 0; i < 6; i++) k.circle(ctx, -50 + i * 20, -110, 3, 'rgba(255,248,220,0.9)', null);
  ctx.restore();
}

export const scenes = [
  { // 0.0 "Monopoly was invented to show how unfair monopolies are."
    start: 0, title: 'A Game With a Lesson',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const sh = S.at('show'), un = S.at('unfair'), mo = S.at('monopolies');
      screen(ctx, S);
      k.gameBoard(ctx, W / 2, 360, 520, { title: 'MONOPOLY', houses: tween(u, 0.3, 2.5) });
      // one puppet sweeps up every coin, the other turns out empty pockets
      const grab = tween(u, sh - 0.2, mo);
      pup(ctx, k, 260, 980, 1.35, { ...PLAYERS[1], t: S.t, face: 1, arm: 0.3 + grab * 0.5, talk: tween(u, un, un + 0.2) * 0.6 });
      k.coinStack(ctx, 420, 1000, 34, Math.round(3 + grab * 9));
      pup(ctx, k, 790, 980, 1.25, { ...PLAYERS[0], t: S.t, face: -1, arm: 0.1, tilt: -0.05 * grab });
      if (grab > 0.6) for (const sx of [-1, 1]) { ctx.save(); ctx.globalAlpha *= tween(u, mo - 0.2, mo + 0.2); k.rect(ctx, 790 + sx * 26 - 10, 870, 20, 26, '#f8f2e2', P.ink, 1.5); ctx.restore(); }
      k.stamp(ctx, 'UNFAIR', W / 2, 380, 64, tween(u, un, un + 0.25, ease.linear), -0.14);
    },
  },
  { // 5.5 "1904."
    start: 4.6, title: 'The Year 1904', trans: 'curtain',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      screen(ctx, S, 1);
      setHouse(ctx, k, P, 220, 1000, 1.3, '#e9be6e'); setHouse(ctx, k, P, 760, 1000, 1.1, '#e8b7b0');
      k.seal(ctx, W / 2, 380, 150, ' THE YEAR · THE YEAR ·', '1904', tween(u, 0.8, 1.2, ease.linear));
    },
  },
  { // 6.6 "Lizzie Magie patents a board game called The Landlord's Game."
    start: 6.4, title: "The Landlord's Game", trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const li = S.at('Lizzie'), pa = S.at('patents'), bo = S.at('board'), la = S.at("Landlord's");
      screen(ctx, S);
      pup(ctx, k, 230, 1000, 1.6, { ...LIZZIE, t: S.t, face: 1, arm: tween(u, pa - 0.2, pa + 0.3) * 0.75, talk: tween(u, la - 0.3, la + 0.8) });
      const b = pop(u, bo - 0.3, 0.45);
      if (b > 0) k.gameBoard(ctx, 640, 520, 440 * b, { title: u > la ? "THE LANDLORD'S GAME" : '' });
      const c = pop(u, pa - 0.1, 0.35) * (1 - tween(u, bo - 0.3, bo));
      if (c > 0) { ctx.save(); ctx.translate(640, 460); ctx.scale(c, c); k.certificate(ctx, 0, 0, 420, -0.05, 'PATENT', 'A GAME BOARD'); ctx.restore(); }
      k.label(ctx, 'LIZZIE MAGIE', 230, 380, 28, tween(u, li, li + 0.3));
      k.stamp(ctx, 'PATENTED', 640, 860, 50, tween(u, bo, bo + 0.25, ease.linear), -0.14);
    },
  },
  { // 10.9 "Players buy property, charge rent, and watch others go broke."
    start: 10.6, title: 'Buy, Charge Rent, Go Broke', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const bu = S.at('buy'), re = S.at('rent,'), wa = S.at('watch'), br = S.at('broke.');
      screen(ctx, S);
      const move = u * 3.2;
      k.gameBoard(ctx, W / 2, 380, 560, { title: "THE LANDLORD'S GAME", houses: tween(u, bu, re), tokens: [{ pos: move, color: P.verm }, { pos: move * 0.8 + 9, color: P.lapis }, { pos: move * 0.6 + 20, color: P.green }] });
      // the landlord collects; the other player goes broke
      pup(ctx, k, 230, 1000, 1.3, { ...PLAYERS[1], t: S.t, face: 1, arm: 0.4 + 0.3 * tween(u, re, re + 0.3), talk: tween(u, re - 0.2, re + 0.4) });
      const broke = tween(u, br - 0.3, br + 0.2);
      pup(ctx, k, 780, 1000, 1.3, { ...PLAYERS[0], t: S.t, face: -1, arm: 0.6 * (1 - broke), tilt: -0.12 * broke });
      for (let i = 0; i < 5; i++) { const q = clamp((u - re - i * 0.18) / 0.6); if (q <= 0 || q >= 1) continue; k.coin(ctx, lerp(720, 300, q), 760 - Math.sin(q * Math.PI) * 140, 20, S.t * 4, '$'); }
      k.coinStack(ctx, 380, 1000, 30, Math.round(2 + tween(u, re, br) * 8));
      k.stamp(ctx, 'BROKE', 780, 700, 54, tween(u, br, br + 0.25, ease.linear), -0.15);
    },
  },
  { // 15.2 "She wanted people to see how unfair that is."
    start: 15.0, title: 'The Lesson', trans: 'curtain',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const se = S.at('see'), un = S.at('unfair');
      screen(ctx, S, 1);
      pup(ctx, k, 220, 1000, 1.5, { ...LIZZIE, t: S.t, face: 1, arm: 0.85, talk: tween(u, 0.2, 2.4) });
      const tilt = tween(u, se - 0.3, un + 0.4, ease.outBack);
      k.balance(ctx, 640, 960, 1.6, 0.38 * tilt);
      k.coinStack(ctx, 520, 700 + tilt * 60, 34, 10);
      k.label(ctx, 'THE FEW', 520, 520 + tilt * 60, 22, tween(u, se, se + 0.3));
      k.label(ctx, 'EVERYONE ELSE', 770, 560 - tilt * 60, 22, tween(u, se, se + 0.3));
      k.stamp(ctx, 'UNFAIR', 640, 280, 58, tween(u, un, un + 0.25, ease.linear), -0.12);
    },
  },
  { // 18.3 "For years, people make their own homemade copies."
    start: 18.1, title: 'Homemade Copies', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const ye = S.at('years,'), ho = S.at('homemade'), co = S.at('copies.');
      screen(ctx, S);
      // boards drawn by hand on cloth and card, one after another
      [[220, 300], [700, 300], [220, 700], [700, 700]].forEach(([x, y], i) => {
        const d = tween(u, ye - 0.2 + i * 0.45, ye + 0.6 + i * 0.45);
        if (d <= 0) return;
        ctx.save(); ctx.beginPath(); ctx.rect(x - 160, y - 160, 320 * d, 320); ctx.clip();
        k.gameBoard(ctx, x, y, 300, { title: ['HOME MADE', 'OUR GAME', 'LANDLORD', 'COPY'][i] }); ctx.restore();
        if (d < 1) k.quill(ctx, x - 160 + 320 * d, y + 60, 0.7, -0.4);
      });
      pup(ctx, k, 470, 1010, 0.95, { ...PLAYERS[2], t: S.t, face: 1, arm: 0.6 + Math.sin(u * 6) * 0.15 });
      k.label(ctx, 'HOMEMADE COPIES', W / 2, 960, 26, tween(u, co, co + 0.3));
      k.label(ctx, 'FOR YEARS', W / 2, 130, 24, tween(u, ho - 0.3, ho));
    },
  },
  { // 21.5 "Players in Atlantic City add their own street names."
    start: 21.4, title: 'Atlantic City', trans: 'curtain',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const at = S.at('Atlantic'), st = S.at('street');
      screen(ctx, S, 1);
      k.waves(ctx, -60, 640, W + 120, 200, S.t, P.water, P.waterLight, 22, 24);
      // the boardwalk
      for (let i = 0; i < 14; i++) k.rect(ctx, -40 + i * 80, 840, 78, 60, i % 2 ? '#c9a06a' : '#b8894a', P.ink, 1.5);
      for (let i = 0; i < 8; i++) k.rect(ctx, -20 + i * 140, 900, 14, 120, P.brown, P.ink, 1.5);
      setHouse(ctx, k, P, 180, 840, 0.8, '#e8b7b0'); setHouse(ctx, k, P, 880, 840, 0.8, '#e9be6e');
      ['BOARDWALK', 'PARK PLACE', 'ATLANTIC AVE'].forEach((n, i) => { const p = pop(u, st - 0.3 + i * 0.3, 0.35); if (p <= 0) return; ctx.save(); ctx.translate(250 + i * 280, 330 + (i % 2) * 120); ctx.scale(p, p); k.streetSign(ctx, 0, 0, 280, n, P.green, (i - 1) * 0.06); ctx.restore(); });
      pup(ctx, k, 520, 830, 1.0, { ...PLAYERS[3], t: S.t, face: -1, arm: 0.8, talk: tween(u, st - 0.3, st + 0.6), walk: 0.5 });
      k.label(ctx, 'ATLANTIC CITY', W / 2, 130, 30, tween(u, at, at + 0.3));
    },
  },
  { // 24.9 "Then, in the 1930s, a man named Charles Darrow sells a version to Parker Brothers."
    start: 24.7, title: 'Charles Darrow · 1930s', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const yr = S.at('1930s,'), ch = S.at('Charles'), se = S.at('sells'), pb = S.at('Parker');
      screen(ctx, S);
      k.seal(ctx, 150, 180, 72, ' THE 1930s · THE 1930s ·', '1930s', tween(u, yr - 0.1, yr + 0.3, ease.linear));
      // a big company house on the right
      k.rect(ctx, 600, 380, 330, 620, '#d8c9a8', P.ink, 3);
      for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) k.arch(ctx, 650 + c * 100, 520 + r * 120, 44, 80, '#fff3c8');
      k.rect(ctx, 580, 330, 370, 60, P.lapis, P.ink, 2.5);
      ctx.fillStyle = P.goldLight; ctx.font = '900 30px Deco'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('PARKER BROTHERS', 765, 362);
      const walk = tween(u, ch, se + 0.4);
      pup(ctx, k, lerp(150, 430, walk), 1000, 1.45, { ...DARROW, t: S.t, face: 1, walk: walk > 0 && walk < 1 ? 1 : 0, arm: 0.55, hold: c => k.gameBoard(c, 0, 0, 120, {}) });
      k.label(ctx, 'CHARLES DARROW', 300, 420, 26, tween(u, ch, ch + 0.3));
      const hand = tween(u, se, pb + 0.3);
      if (hand > 0) { ctx.save(); ctx.globalAlpha *= hand; k.label(ctx, 'SOLD', 520, 700, 26, 1); ctx.restore(); }
    },
  },
  { // 30.4 "He's credited as the inventor. Royalties make him a millionaire."
    start: 30.3, title: 'The Credited Inventor', trans: 'curtain',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const cr = S.at('credited'), inv = S.at('inventor.'), ro = S.at('Royalties'), mi = S.at('millionaire.');
      screen(ctx, S, 1);
      // a podium, a banner and a rain of coins
      k.rect(ctx, 330, 820, 300, 180, P.goldLight, P.ink, 3); k.rect(ctx, 310, 800, 340, 30, P.gold, P.ink, 2);
      pup(ctx, k, 480, 800, 1.35, { ...DARROW, t: S.t, face: 1, arm: 0.95, talk: tween(u, cr, inv + 0.5) * 0.6 });
      const bn = tween(u, inv - 0.2, inv + 0.3, ease.outBack);
      if (bn > 0) { ctx.save(); ctx.translate(480, 230); ctx.scale(bn, bn); k.rect(ctx, -220, -40, 440, 80, P.verm, P.ink, 3); ctx.fillStyle = P.goldLight; ctx.font = '900 40px Deco'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('THE INVENTOR', 0, 2); ctx.restore(); }
      if (u > ro - 0.2) for (let i = 0; i < 18; i++) { const q = ((u - ro) * 0.9 + i / 18) % 1, x = 140 + ((i * 131) % 700); k.coin(ctx, x, -40 + q * 1000, 18, S.t * 4 + i, '$'); }
      k.coinStack(ctx, 760, 1000, 40, Math.round(tween(u, ro, mi + 0.5) * 14));
      k.label(ctx, 'MILLIONAIRE', 760, 520, 28, tween(u, mi, mi + 0.3));
      // Lizzie, small and in the dark corner
      ctx.save(); ctx.globalAlpha *= 0.55; pup(ctx, k, 110, 1010, 0.8, { ...LIZZIE, t: S.t, face: 1, arm: 0 }); ctx.restore();
    },
  },
  { // 35.4 "Lizzie? Parker Brothers buys her patent for $500."
    start: 35.2, title: 'And Lizzie?', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const li = S.at('Lizzie?'), bu = S.at('buys'), fi = S.at(/^\$500/);
      ctx.fillStyle = '#2a1c12'; ctx.fillRect(-80, -80, W + 160, 1240);
      // a spotlight finds her
      const sp = tween(u, li - 0.2, li + 0.3);
      const g = ctx.createRadialGradient(330, 700, 20, 330, 700, 520 * sp + 1); g.addColorStop(0, '#f6e2b8'); g.addColorStop(1, 'rgba(246,226,184,0)'); ctx.fillStyle = g; ctx.fillRect(-80, -80, W + 160, 1240);
      pup(ctx, k, 330, 1000, 1.5, { ...LIZZIE, t: S.t, face: 1, arm: 0.6 * tween(u, bu - 0.3, bu), hold: c => { if (u < bu + 0.6) k.certificate(c, 0, 0, 150, 0.1, 'PATENT', ''); } });
      medallion(ctx, k, P, '?', 330, 330, pop(u, li, 0.35), P.verm);
      // her patent goes; $500 comes back (next to his pile)
      const pass = tween(u, bu, bu + 0.9, ease.inOut);
      if (pass > 0 && pass < 1) { ctx.save(); ctx.translate(lerp(420, 900, pass), 640 - Math.sin(pass * Math.PI) * 120); k.certificate(ctx, 0, 0, 160, pass * 2, 'PATENT', ''); ctx.restore(); }
      const pay = pop(u, fi - 0.1, 0.4);
      if (pay > 0) { k.coinStack(ctx, 600, 1000, 30, 2); k.label(ctx, '$500', 600, 900, 30, pay); }
      ctx.save(); ctx.globalAlpha *= tween(u, fi + 0.3, fi + 0.8); k.coinStack(ctx, 830, 1000, 30, 22); k.label(ctx, 'HIS MILLIONS', 800, 260, 22, 1); ctx.restore();
    },
  },
  { // 40.1 "The truth only comes out in the 1970s during a court fight over another board game."
    start: 39.9, title: 'The Truth · 1970s', trans: 'curtain',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const tr = S.at('truth'), yr = S.at('1970s'), co = S.at('court'), fi = S.at('fight'), an = S.at('another');
      screen(ctx, S);
      k.seal(ctx, 150, 170, 70, ' THE 1970s · THE 1970s ·', '1970s', tween(u, yr - 0.1, yr + 0.3, ease.linear));
      // the bench, the judge, the gavel
      k.rect(ctx, 520, 560, 420, 200, P.brown, P.ink, 3); k.rect(ctx, 500, 540, 460, 30, P.brownLight, P.ink, 2);
      pup(ctx, k, 730, 560, 1.15, { ...JUDGE, t: S.t, face: -1, arm: 0.5 + 0.4 * tween(u, fi - 0.3, fi) });
      const sw = tween(u, fi - 0.2, fi, ease.inCubic) * (1 - tween(u, fi + 0.15, fi + 0.5));
      k.gavel(ctx, 600, 520, 1.1, sw);
      if (u > fi && u < fi + 0.4) { ctx.save(); ctx.globalAlpha *= 1 - (u - fi) / 0.4; for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; ctx.beginPath(); ctx.moveTo(560 + Math.cos(a) * 30, 530 + Math.sin(a) * 30); ctx.lineTo(560 + Math.cos(a) * 70, 530 + Math.sin(a) * 70); k.stroke(ctx, P.verm, 4); } ctx.restore(); }
      // two boards before the court
      k.gameBoard(ctx, 330, 870, 210, { title: 'MONOPOLY' });
      const b2 = pop(u, an - 0.2, 0.35); if (b2 > 0) k.gameBoard(ctx, 620, 880, 190 * b2, { title: 'ANOTHER GAME' });
      // the truth unrolls with her name
      const ro = tween(u, tr - 0.1, tr + 0.8, ease.outCubic);
      if (ro > 0) { k.rect(ctx, 80, 300, 400 * ro, 160, P.paperLight, P.goldDark, 4); if (ro > 0.8) { ctx.fillStyle = P.vermDark; ctx.font = '900 34px Deco'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('THE TRUTH:', 280, 350); ctx.font = '700 30px GaramondItalic'; ctx.fillStyle = P.ink; ctx.fillText('Lizzie Magie, 1904', 280, 410); } }
      k.label(ctx, 'A COURT FIGHT', 730, 230, 24, tween(u, co, co + 0.3));
    },
  },
  { // 45.7 "A game about unfairness with an unfair origin story."
    start: 45.5, title: 'An Unfair Origin', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const un = S.at('unfairness'), uf = S.at('unfair'), or = S.at('origin');
      screen(ctx, S, 1);
      // the two puppets face each other across the board; the credit swings back to her
      k.gameBoard(ctx, W / 2, 420, 400, { title: u > or ? 'LIZZIE MAGIE · 1904' : 'MONOPOLY' });
      const back = tween(u, uf - 0.2, or + 0.5);
      pup(ctx, k, 200, 1000, 1.45, { ...LIZZIE, t: S.t, face: 1, arm: 0.3 + 0.6 * back, talk: tween(u, uf, or + 0.6) });
      pup(ctx, k, 770, 1000, 1.4, { ...DARROW, t: S.t, face: -1, arm: 0.5 * (1 - back), tilt: -0.08 * back });
      if (back > 0.5) for (let i = 0; i < 10; i++) { const a = i / 10 * TAU + S.t, r = 120 + Math.sin(S.t * 3 + i) * 10; k.star(ctx, 200 + Math.cos(a) * r, 700 + Math.sin(a) * r * 0.6, 10, 0.9); }
      k.label(ctx, 'A GAME ABOUT UNFAIRNESS', W / 2, 720, 24, tween(u, un, un + 0.3) * (1 - tween(u, uf - 0.3, uf)));
      k.label(ctx, 'AN UNFAIR ORIGIN', W / 2, 720, 28, tween(u, or, or + 0.3));
    },
  },
  { // 51.0 "Every legend has a beginning."
    start: 50.8, title: 'Every Legend Has a Beginning', trans: 'curtain', transLock: true,
    draw(ctx, u, S) {
      const { k, P, W } = S, beg = S.at('beginning.');
      ctx.save(); S.cam(lerp(1.0, 1.5, tween(u, 0, beg)), 300, 700);
      screen(ctx, S, 1);
      pup(ctx, k, 300, 1000, 1.6, { ...LIZZIE, t: S.t, face: 1, arm: 0.9, hold: c => k.gameBoard(c, 0, -40, 140, { title: '1904' }) });
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
  ...scenes.slice(1).map(s => ({ t: s.start - 0.05, type: s.trans === 'cut' ? 'pop' : 'paper', gain: 0.35 })),
  { t: 1.9, type: 'coins', gain: 0.4 }, { t: 2.5, type: 'stamp', gain: 0.85 }, { t: 3.3, type: 'coins', gain: 0.3 },
  { t: 5.5, type: 'gong', gain: 0.6 }, { t: 5.8, type: 'stamp', gain: 0.5 },
  { t: 7.1, type: 'paper', gain: 0.4 }, { t: 7.9, type: 'pop', gain: 0.5 }, { t: 8.1, type: 'stamp', gain: 0.6 }, { t: 9.1, type: 'chime', gain: 0.45 },
  { t: 11.2, type: 'pluck', gain: 0.35 }, { t: 11.5, type: 'pluck', gain: 0.35, pitch: 1.2 }, { t: 12.6, type: 'coins', gain: 0.45 }, { t: 13.0, type: 'coins', gain: 0.35 }, { t: 14.05, type: 'flop', gain: 0.5 }, { t: 14.1, type: 'stamp', gain: 0.8 },
  { t: 16.1, type: 'clank', gain: 0.4 }, { t: 16.5, type: 'stamp', gain: 0.8 },
  { t: 18.5, type: 'paper', gain: 0.3 }, { t: 19.0, type: 'paper', gain: 0.3 }, { t: 19.5, type: 'paper', gain: 0.3 }, { t: 20.4, type: 'chime', gain: 0.35 },
  { t: 21.6, type: 'waves', gain: 0.4 }, { t: 23.2, type: 'pop', gain: 0.4 }, { t: 23.5, type: 'pop', gain: 0.4, pitch: 1.2 }, { t: 23.8, type: 'pop', gain: 0.4, pitch: 1.4 },
  { t: 25.4, type: 'stamp', gain: 0.5 }, { t: 27.1, type: 'pluck', gain: 0.4 }, { t: 28.1, type: 'slide', gain: 0.4 }, { t: 29.2, type: 'coins', gain: 0.4 },
  { t: 30.7, type: 'riser', gain: 0.4 }, { t: 31.5, type: 'gong', gain: 0.6 }, { t: 32.9, type: 'coins', gain: 0.5 }, { t: 33.4, type: 'coins', gain: 0.45 }, { t: 34.0, type: 'chime', gain: 0.5, pitch: 1.3 },
  { t: 35.4, type: 'pluck', gain: 0.5, pitch: 0.8 }, { t: 37.0, type: 'whoosh', gain: 0.4 }, { t: 38.4, type: 'pop', gain: 0.4, pitch: 0.7 }, { t: 38.6, type: 'flop', gain: 0.45 },
  { t: 40.3, type: 'paper', gain: 0.5 }, { t: 41.6, type: 'stamp', gain: 0.5 }, { t: 43.46, type: 'thud', gain: 0.9 }, { t: 43.5, type: 'stamp', gain: 0.6 }, { t: 44.1, type: 'pop', gain: 0.4 },
  { t: 46.5, type: 'pluck', gain: 0.4 }, { t: 48.3, type: 'riser', gain: 0.45 }, { t: 49.0, type: 'chime', gain: 0.55, pitch: 1.4 },
  { t: 52.24, type: 'pop', gain: 0.8 }, { t: 52.28, type: 'gong', gain: 0.9 },
];

export const music = {
  bpm: 102, root: 'A', maqam: 'nihavend', gain: 0.32,
  sections: [
    { from: 0, to: 4.6, mood: 'intro' },
    { from: 4.6, to: 18.1, mood: 'groove' },
    { from: 18.1, to: 30.3, mood: 'drive' },
    { from: 30.3, to: 35.2, mood: 'triumph' },
    { from: 35.2, to: 45.5, mood: 'sad' },
    { from: 45.5, to: 52.24, mood: 'triumph' },
    { from: 52.24, to: 55.0, mood: 'end' },
  ],
};
