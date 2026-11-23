// "The 300 Weren't Alone" — Thermopylae, told as a Karagöz shadow play: the
// Greeks and Persians are jointed leather puppets on rods behind a backlit
// screen, with pierced set pieces for the mountains and the sea. Both sides are
// drawn with dignity (no villain faces, no gore); the last fight is shown by
// the lamp behind the screen burning down. The forgotten 700 Thespians get
// their moment: they step into the light beside the Spartans.
import { clamp, lerp, ease, tween, rng, TAU, pop } from '../../lib/core.mjs';
import { bookCover } from '../../styles/ottoman/scenes.mjs';

export const meta = {
  title: 'The 300 Weren’t Alone',
  slug: 'thermopylae-ottoman',
  style: 'ottoman',
  look: 'karagoz',  // shadow-theatre booth (the three videos before used tile, scroll, night)
  room: 'tiles',
  device: 'karagoz',
  width: 1080, height: 1920, fps: 30,
  duration: 58.6,
  voice: 'voice.mp3',
  seed: 480,
  captionChars: 30,
  brand: { handle: '@HOWITSTARTED-YT1', logo: '../../../brand/logo.png' },
  outro: { at: 56.8, text: 'Subscribe for more origin stories' },
};

const BRONZE = '#c08a3a';
const SPARTAN = i => ({ robe: ['#a8281c', '#952418', '#b43424'][i % 3], trim: '#ecd57a', hat: 'greekhelm', hatColor: BRONZE, crest: '#2a1c12', skin: '#d9a882' });
const GREEK = i => ({ robe: ['#d6973a', '#3d8458', '#8a7aa8', '#6a8aa8'][i % 4], trim: '#f8f2e2', hat: 'greekhelm', hatColor: '#b89a5a', crest: ['#f8f2e2', '#3a5a8a', '#c4371f'][i % 3], skin: ['#d9a882', '#c99a6e', '#e2b48a'][i % 3] });
const THESPIAN = i => ({ robe: ['#2f6a7a', '#28606e'][i % 2], trim: '#ecd57a', hat: 'greekhelm', hatColor: '#a8a8a0', crest: '#ecd57a', skin: ['#c99a6e', '#d9a882'][i % 2] });
const PERSIAN = i => ({ robe: ['#2f5f8a', '#5a3a7a', '#2f6a5a', '#7a5a2a'][i % 4], trim: '#ecd57a', hat: 'tiara', hatColor: ['#c9a227', '#e8dcc0', '#b0532e'][i % 3], beard: '#2a1c12', skin: ['#c68a5e', '#b07a52', '#d0a070'][i % 3] });
const LEONIDAS = { robe: '#a8281c', trim: '#c9a227', hat: 'greekhelm', hatColor: '#d8a848', crest: '#c4371f', beard: '#3a2a1a', skin: '#d9a882' };

const pup = (ctx, k, x, y, s, o) => k.puppet(ctx, x, y, s * 1.3, o);
// a hoplite's spear and round shield, held in the puppet's hand
const EMBLEM = { L: '#7a1a10', 'Θ': '#1a3a4a' };
const arms = (k, P, mark) => c => { const emblem = EMBLEM[mark] || '#5a4a2a'; c.beginPath(); c.moveTo(0, -150); c.lineTo(0, 70); k.stroke(c, '#5a3a1a', 5); k.poly(c, [[-6, -150], [6, -150], [0, -172]], '#9a9a9a', P.ink, 1); k.aspis(c, 16, 6, 36, BRONZE, emblem); };

// the muslin screen; `dim` darkens it for night, `warm` for the lamp's glow
function screen(ctx, S, dim = 0, warm = 0) {
  const { W } = S;
  ctx.fillStyle = warm ? '#f6e2b8' : '#f3e8cc'; ctx.fillRect(-400, -400, W + 800, 1900);
  ctx.fillStyle = 'rgba(120,80,40,0.10)'; ctx.fillRect(-400, 1000, W + 800, 500);
  if (dim > 0) { ctx.fillStyle = `rgba(20,24,50,${0.55 * dim})`; ctx.fillRect(-400, -400, W + 800, 1900); }
}
// pierced set pieces, as a Karagöz stage has: a mountain and the sea
function mountain(ctx, S, x, base, w, h, seed = 1) {
  const { k, P } = S, R = rng(seed);
  const pts = [[x - w / 2, base]]; for (let i = 1; i < 8; i++) pts.push([x - w / 2 + (w * i) / 8, base - h * (0.55 + 0.45 * Math.sin((i / 8) * Math.PI)) - R() * 40]); pts.push([x + w / 2, base]);
  k.poly(ctx, pts, '#8a6a4a', P.ink, 3);
  for (let i = 0; i < 18; i++) { const px = x - w / 2 + 40 + R() * (w - 80), py = base - 20 - R() * h * 0.6; k.circle(ctx, px, py, 3.2, 'rgba(255,248,220,0.85)', null); }
  for (let i = 0; i < 4; i++) { const px = x - w / 3 + i * w / 5; k.poly(ctx, [[px - 14, base - h * 0.35], [px, base - h * 0.35 - 60], [px + 14, base - h * 0.35]], '#4a6a3a', P.ink, 1.5); }
}
function sea(ctx, S, y) {
  const { k, P, W } = S;
  ctx.save(); ctx.beginPath(); ctx.rect(-80, y, W + 160, 1240 - y); ctx.clip();
  k.waves(ctx, -80, y, W + 160, 1240 - y, S.t, '#3f6f9a', '#6f9cc0', 14, 26); ctx.restore();
  ctx.beginPath(); ctx.moveTo(-80, y); ctx.lineTo(W + 80, y); k.stroke(ctx, P.ink, 3);
}
// the oil lamp behind the screen; its light is the battle's clock
function lampGlow(ctx, S, x, y, k1 = 1) {
  const g = ctx.createRadialGradient(x, y, 10, x, y, 700 * k1 + 60);
  g.addColorStop(0, `rgba(255,214,140,${0.55 * k1})`); g.addColorStop(1, 'rgba(255,214,140,0)');
  ctx.fillStyle = g; ctx.fillRect(-400, -400, S.W + 800, 1900);
}

export const scenes = [
  { // 0.0 "Everyone remembers the 300 Spartans, but they weren't alone."
    start: 0, title: 'They Weren’t Alone',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const th = S.at('300'), we = S.at("weren't"), al = S.at('alone.');
      const wide = tween(u, we - 0.2, al + 0.8, ease.inOut);
      S.cam(lerp(1.45, 0.95, wide), W / 2, lerp(820, 620, wide));
      screen(ctx, S);
      // a spotlight on the famous few…
      const spot = lerp(260, 900, wide);
      ctx.save(); ctx.fillStyle = 'rgba(20,24,50,0.45)'; ctx.beginPath(); ctx.rect(-80, -80, W + 160, 1240); ctx.arc(W / 2, 820, spot, 0, TAU, true); ctx.fill(); ctx.restore();
      for (let i = 0; i < 5; i++) pup(ctx, k, W / 2 - 200 + i * 100, 1000, 0.85, { ...SPARTAN(i), t: S.t + i, face: 1, arm: 0.25, hold: arms(k, P, 'L') });
      ctx.fillStyle = P.vermDark; ctx.font = '900 110px Deco'; ctx.textAlign = 'center'; ctx.globalAlpha = tween(u, th, th + 0.3) * (1 - wide); ctx.fillText('300', W / 2, 560); ctx.globalAlpha = 1;
      // …and, as the light opens, everyone who stood beside them
      for (let i = 0; i < 12; i++) { const a = clamp(wide * 1.4 - (i % 6) * 0.08); if (a <= 0) continue; const sx = i < 6 ? -1 : 1, x = W / 2 + sx * (300 + (i % 6) * 70), y = 1000 - (i % 2) * 60; ctx.save(); ctx.globalAlpha = a; pup(ctx, k, x, y, 0.7, { ...(i % 3 === 0 ? THESPIAN(i) : GREEK(i)), t: S.t + i, face: sx > 0 ? -1 : 1, arm: 0.25, hold: arms(k, P, null) }); ctx.restore(); }
    },
  },
  { // 5.6 "480 BC."
    start: 5.4, title: 'Greece, 480 BC', trans: 'curtain',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      S.cam(lerp(1.0, 1.1, tween(u, 0, 1.7)), W / 2, 640);
      screen(ctx, S, 0, 1);
      mountain(ctx, S, 300, 1000, 700, 520, 3); mountain(ctx, S, 820, 1000, 560, 380, 4);
      sea(ctx, S, 1000);
      k.seal(ctx, W / 2, 330, 140, ' THE YEAR · 480 BC ·', '480 BC', tween(u, 0.1, 0.5, ease.linear));
    },
  },
  { // 7.4 "Persian King Xerxes invades Greece with a massive army."
    start: 7.1, title: 'Xerxes Invades', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const xe = S.at('Xerxes'), in_ = S.at('invades'), ma = S.at('massive');
      S.cam(lerp(1.2, 0.95, tween(u, ma - 0.4, ma + 0.8, ease.inOut)), lerp(320, W / 2, tween(u, ma - 0.4, ma + 0.8)), 760);
      screen(ctx, S);
      // the king rides on a canopied throne, carried forward
      const fwd = tween(u, in_ - 0.3, in_ + 2.2, ease.inOut);
      ctx.save(); ctx.translate(lerp(160, 320, fwd), 0);
      k.canopy(ctx, 0, 560, 260, 140, '#c9a227', S.t);
      k.rect(ctx, -120, 830, 240, 30, '#7a5a2a', P.ink, 2.5);
      pup(ctx, k, 0, 830, 0.85, { robe: '#5a3a7a', trim: '#ecd57a', hat: 'tiara', hatColor: '#d8b848', beard: '#1a1208', skin: '#c68a5e', t: S.t, face: 1, arm: 0.45 + Math.sin(S.t * 2) * 0.05 });
      for (let i = 0; i < 2; i++) pup(ctx, k, -90 + i * 180, 1000, 0.7, { ...PERSIAN(i), t: S.t + i, face: 1, walk: 1, arm: 0.6 });
      ctx.restore();
      k.label(ctx, 'XERXES', lerp(160, 320, fwd), 470, 26, tween(u, xe, xe + 0.3));
      // the army: rank after rank, too many to count
      const n = Math.floor(lerp(4, 40, tween(u, in_, ma + 0.8)));
      for (let i = 0; i < n; i++) { const r = Math.floor(i / 8), c = i % 8; pup(ctx, k, lerp(1200, 520, tween(u, 0.2 + r * 0.25, 2.5 + r * 0.25, ease.outCubic)) + c * 80 + (r % 2) * 40, 700 + r * 90, 0.38, { ...PERSIAN(i), t: S.t * 1.3 + i, face: -1, walk: 1, rod: false, arm: 0.2 }); }
    },
  },
  { // 11.4 "About 7,000 Greeks block a narrow mountain pass called Thermopylae."
    start: 11.2, title: 'The Hot Gates', trans: 'curtain',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const gr = S.at('Greeks'), bl = S.at('block'), na = S.at('narrow'), th = S.at('Thermopylae.');
      S.cam(lerp(0.95, 1.25, tween(u, na - 0.3, th + 0.4, ease.inOut)), lerp(W / 2, 500, tween(u, na - 0.3, th + 0.4)), lerp(620, 760, tween(u, na - 0.3, th + 0.4)));
      screen(ctx, S);
      // the pass: a cliff on one side, the sea on the other, a gap no wider than a road
      mountain(ctx, S, 180, 1000, 620, 860, 6);
      ctx.save(); ctx.beginPath(); ctx.moveTo(660, 1000); ctx.lineTo(1160, 1000); ctx.lineTo(1160, 1240); ctx.lineTo(560, 1240); ctx.closePath(); ctx.clip(); sea(ctx, S, 900); ctx.restore();
      ctx.beginPath(); ctx.moveTo(620, 1000); ctx.quadraticCurveTo(820, 960, 1160, 1000); k.stroke(ctx, P.ink, 3);
      // steam from the hot springs that give the pass its name
      for (let i = 0; i < 4; i++) { ctx.save(); ctx.globalAlpha = 0.35; ctx.beginPath(); const x = 560 + i * 30; ctx.moveTo(x, 990); for (let j = 1; j < 8; j++) ctx.lineTo(x + Math.sin(S.t * 2 + j + i) * 12, 990 - j * 24); k.stroke(ctx, P.white, 6); ctx.restore(); }
      // the Greeks fill the gap
      const fill = tween(u, gr - 0.4, bl + 0.6);
      for (let i = 0; i < Math.floor(fill * 12); i++) pup(ctx, k, 420 + (i % 4) * 58, 1000 - Math.floor(i / 4) * 40, 0.55, { ...GREEK(i), t: S.t + i, face: 1, arm: 0.2, hold: arms(k, P, null), rod: i < 4 });
      ctx.fillStyle = P.vermDark; ctx.font = '900 92px Deco'; ctx.textAlign = 'center'; ctx.fillText(Math.round(lerp(0, 7000, tween(u, 0.1, bl, ease.outCubic))).toLocaleString('en-US'), 760, 330);
      k.label(ctx, 'THERMOPYLAE · “THE HOT GATES”', 520, 470, 22, tween(u, th, th + 0.4));
    },
  },
  { // 16.7 "Only 300 of them are Spartans, led by King Leonidas."
    start: 16.5, title: 'King Leonidas', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const on = S.at('Only'), sp = S.at('Spartans,'), le = S.at('Leonidas.');
      S.cam(lerp(1.0, 1.25, tween(u, le - 0.3, le + 0.8, ease.inOut)), lerp(W / 2, 380, tween(u, le - 0.3, le + 0.8)), lerp(700, 800, tween(u, le - 0.3, le + 0.8)));
      screen(ctx, S);
      // of the crowd, only a slice turns red
      const red = tween(u, on, sp + 0.3);
      for (let i = 0; i < 24; i++) { const r = Math.floor(i / 8), c = i % 8, isS = c < 2 || (c === 2 && r < 1); const o = isS && red > (c * 3 + r) / 9 ? SPARTAN(i) : GREEK(i); ctx.save(); ctx.globalAlpha = isS || red < 0.5 ? 1 : lerp(1, 0.45, (red - 0.5) * 2); pup(ctx, k, 420 + c * 80 + r * 30, 800 + r * 100, 0.45, { ...o, t: S.t + i, face: 1, arm: 0.2, rod: false, hold: arms(k, P, isS ? 'L' : null) }); ctx.restore(); }
      // the king steps forward
      const st = tween(u, le - 0.8, le + 0.3, ease.outBack);
      pup(ctx, k, lerp(-120, 220, st), 1000, 1.05, { ...LEONIDAS, t: S.t, face: 1, arm: 0.35 + 0.45 * tween(u, le, le + 0.4), talk: tween(u, le, le + 0.3) * 0.5, hold: arms(k, P, 'L') });
      k.label(ctx, 'KING LEONIDAS', 230, 520, 24, tween(u, le, le + 0.4));
    },
  },
  { // 21.4 "For three days, the pass holds."
    start: 21.1, title: 'Three Days', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const ho = S.at('holds.');
      const day = tween(u, 0, 2.7, ease.linear) * 3; // three suns cross the sky
      const d = day % 1, night = Math.max(0, Math.sin(d * Math.PI * 2 - Math.PI / 2)) * 0;
      S.cam(lerp(1.0, 1.12, tween(u, 0, 2.8)), W / 2, 640);
      screen(ctx, S, Math.abs(Math.cos(d * Math.PI)) * 0.6 + night);
      const sx = lerp(120, 960, d), sy = 400 - Math.sin(d * Math.PI) * 220;
      if (Math.floor(day) < 3) k.sun(ctx, sx, sy, 60, S.t, false);
      mountain(ctx, S, 160, 1000, 520, 700, 6);
      // wave after wave breaks on the shield wall, which does not move
      for (let i = 0; i < 5; i++) pup(ctx, k, 330 + i * 64, 1000, 0.6, { ...(i < 3 ? SPARTAN(i) : GREEK(i)), t: S.t + i, face: 1, arm: 0.2, hold: arms(k, P, i < 3 ? 'L' : null), rod: i === 0 });
      const wave = (S.t * 1.2) % 1;
      for (let i = 0; i < 6; i++) pup(ctx, k, lerp(1150, 720, Math.sin(wave * Math.PI)) + (i % 3) * 70, 1000 - Math.floor(i / 3) * 50, 0.55, { ...PERSIAN(i), t: S.t + i, face: -1, walk: 1, arm: 0.5, rod: false });
      // tally marks scratched on the cliff, one per day
      for (let i = 0; i < Math.min(3, Math.floor(day) + 1); i++) { ctx.beginPath(); ctx.moveTo(140 + i * 36, 560); ctx.lineTo(150 + i * 36, 680); k.stroke(ctx, P.paperLight, 9); }
      k.label(ctx, 'DAY ' + Math.min(3, Math.floor(day) + 1), 180, 500, 24, tween(u, 0.1, 0.4) * (1 - tween(u, ho + 0.3, ho + 0.6)));
    },
  },
  { // 24.2 "Then a local man named Ephialtes shows the Persians a secret path around the mountains,"
    start: 24.0, title: 'The Secret Path', trans: 'curtain',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const lo = S.at('local'), ep = S.at('Ephialtes'), sh = S.at('shows'), se = S.at('secret'), pa = S.at('path'), ar = S.at('around');
      const path = [[880, 1000], [760, 860], [820, 700], [640, 560], [520, 460], [360, 520], [240, 680], [120, 860], [60, 1000]];
      const walk = tween(u, pa - 0.2, 6.1, ease.linear);
      S.cam(lerp(1.3, 0.95, tween(u, se - 0.3, ar + 0.6, ease.inOut)), lerp(780, W / 2, tween(u, se - 0.3, ar + 0.6)), lerp(860, 640, tween(u, se - 0.3, ar + 0.6)));
      screen(ctx, S, 0.85);
      k.moon(ctx, 900, 220, 50);
      mountain(ctx, S, W / 2, 1000, 1000, 640, 9);
      // the goat path, picked out in dots, and the torches climbing it
      const dots = 70; for (let i = 0; i < dots * walk; i++) { const q = i / dots, seg = q * (path.length - 1), j = Math.floor(seg), f = seg - j, a = path[j], b = path[Math.min(j + 1, path.length - 1)]; k.circle(ctx, lerp(a[0], b[0], f), lerp(a[1], b[1], f), 4, '#ffd27a', null); }
      for (let i = 0; i < 8; i++) { const q = clamp(walk - i * 0.05); if (q <= 0) continue; const seg = q * (path.length - 1), j = Math.min(Math.floor(seg), path.length - 2), f = seg - j; const x = lerp(path[j][0], path[j + 1][0], f), y = lerp(path[j][1], path[j + 1][1], f); k.circle(ctx, x, y - 14, 8 + Math.sin(S.t * 12 + i) * 2, '#ffb347', null); }
      // Ephialtes, a shepherd with a crook, points the way
      const eIn = tween(u, lo - 0.3, ep + 0.3, ease.outBack);
      pup(ctx, k, lerp(1220, 900, eIn), 1000, 0.9, { robe: '#8a7a5a', trim: '#c9b89a', hat: 'cap', hatColor: '#6a5a3a', beard: '#4a3a2a', skin: '#c99a6e', t: S.t, face: -1, arm: tween(u, sh - 0.2, sh + 0.3) * 0.8, talk: tween(u, sh, se + 0.6) });
      for (let i = 0; i < 2; i++) pup(ctx, k, 700 - i * 110, 1000, 0.7, { ...PERSIAN(i + 1), t: S.t + i, face: 1, arm: 0.3 });
      k.label(ctx, 'EPHIALTES', 900, 560, 22, tween(u, ep, ep + 0.4));
    },
  },
  { // 30.4 "the Greeks are about to be surrounded."
    start: 30.2, title: 'Surrounded', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const gr = S.at('Greeks'), su = S.at('surrounded.');
      S.cam(lerp(1.0, 1.25, tween(u, su - 0.4, su + 0.8, ease.inOut)), W / 2, 820);
      screen(ctx, S, 0.3 * (1 - tween(u, 0, 2.5)));
      mountain(ctx, S, W / 2, 760, 1100, 400, 11);
      // the Greeks in the middle look one way, then the other
      const look = Math.sin(u * 3) > 0 ? 1 : -1;
      for (let i = 0; i < 5; i++) pup(ctx, k, W / 2 - 160 + i * 80, 1000, 0.62, { ...(i % 2 ? GREEK(i) : SPARTAN(i)), t: S.t + i, face: u > gr ? look * (i % 2 ? -1 : 1) : 1, arm: 0.25, hold: arms(k, P, null), rod: i === 2 });
      // Persians close in from both sides at once
      const cl = tween(u, gr - 0.2, su + 0.6, ease.inOut);
      for (let i = 0; i < 8; i++) { const sx = i < 4 ? -1 : 1, x = W / 2 + sx * (lerp(720, 330, cl) + (i % 4) * 60); pup(ctx, k, x, 1000 - (i % 2) * 40, 0.55, { ...PERSIAN(i), t: S.t + i, face: -sx, walk: 1, arm: 0.5, rod: false }); }
      for (let i = 0; i < 3; i++) { const y = 840 + i * 60; ctx.save(); ctx.globalAlpha = cl; for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(W / 2 + sx * lerp(700, 420, cl), y); ctx.lineTo(W / 2 + sx * lerp(620, 300, cl), y); k.stroke(ctx, P.vermDark, 6); k.poly(ctx, [[W / 2 + sx * lerp(620, 300, cl), y - 12], [W / 2 + sx * (lerp(620, 300, cl) - 26), y], [W / 2 + sx * lerp(620, 300, cl), y + 12]], P.vermDark, null); } ctx.restore(); }
    },
  },
  { // 33.3 "Leonidas sends most of the army away,"
    start: 33.0, title: 'He Sends Them Home', trans: 'curtain',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const se = S.at('sends'), aw = S.at('away,');
      S.cam(lerp(1.15, 1.0, tween(u, 0, 2.5, ease.inOut)), lerp(380, W / 2, tween(u, 0, 2.5)), 760);
      screen(ctx, S, 0, 1);
      mountain(ctx, S, 900, 1000, 500, 420, 13);
      pup(ctx, k, 260, 1000, 1.0, { ...LEONIDAS, t: S.t, face: 1, arm: 0.3 + 0.5 * tween(u, se - 0.2, se + 0.3), talk: tween(u, se, aw) });
      // the allies turn and walk off over the hill, one by one
      for (let i = 0; i < 10; i++) { const q = tween(u, se + i * 0.12, aw + 0.6 + i * 0.12, ease.inOut); const x = lerp(440 + (i % 5) * 80, 1200 + i * 40, q); pup(ctx, k, x, 1000 - Math.floor(i / 5) * 50 - q * 60, 0.55, { ...GREEK(i), t: S.t + i, face: q > 0.02 ? 1 : -1, walk: q > 0 && q < 1 ? 1 : 0, arm: 0.2, rod: false, hold: arms(k, P, null) }); }
    },
  },
  { // 36.0 "but the Spartans stay, and so do about 700 soldiers from a small city called Thespiae."
    start: 35.8, title: 'The 700 of Thespiae', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const st = S.at('stay,'), so = S.at('so'), sv = S.at('700'), ci = S.at('city'), th = S.at('Thespiae.');
      S.cam(lerp(1.25, 0.95, tween(u, so - 0.3, sv + 0.8, ease.inOut)), lerp(300, W / 2, tween(u, so - 0.3, sv + 0.8)), lerp(820, 680, tween(u, so - 0.3, sv + 0.8)));
      screen(ctx, S);
      lampGlow(ctx, S, W / 2, 700, 1);
      // the red line plants its spears
      for (let i = 0; i < 5; i++) pup(ctx, k, 120 + i * 80, 1000, 0.62, { ...SPARTAN(i), t: S.t + i, face: 1, arm: lerp(0.2, 0.05, tween(u, st - 0.2, st + 0.2)), hold: arms(k, P, 'L'), rod: i === 0 });
      // and from the other side, the Thespians step up beside them
      const join = tween(u, sv - 0.4, th + 0.4, ease.outCubic);
      for (let i = 0; i < 6; i++) { const q = clamp(join * 1.4 - i * 0.07); pup(ctx, k, lerp(1220, 540 + i * 80, q), 1000, 0.62, { ...THESPIAN(i), t: S.t + i, face: q < 1 ? -1 : 1, walk: q < 1 ? 1 : 0, arm: 0.2, hold: arms(k, P, 'Θ'), rod: i === 5 }); }
      ctx.fillStyle = '#28606e'; ctx.font = '900 100px Deco'; ctx.textAlign = 'center'; ctx.globalAlpha = tween(u, sv, sv + 0.3); ctx.fillText('700', 800, 380); ctx.globalAlpha = 1;
      k.label(ctx, 'THESPIAE', 800, 480, 24, tween(u, th, th + 0.4));
      // a little map: Thespiae, a small city in Boeotia, a long way from the pass
      const m = tween(u, ci - 0.2, ci + 0.3) * (1 - tween(u, th + 0.8, th + 1.1));
      if (m > 0) { ctx.save(); ctx.globalAlpha = m; k.circle(ctx, 260, 300, 120, '#f2e6c8', P.goldDark, 5); k.house(ctx, 260, 330, 60, 60, {}); ctx.restore(); }
    },
  },
  { // 43.0 "They fight to the very end."
    start: 42.7, title: 'To the Very End', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const fi = S.at('fight'), en = S.at('end.');
      // the lamp behind the screen burns down: the battle told by its light
      const burn = tween(u, fi, en + 0.9, ease.inOut);
      S.cam(lerp(1.0, 1.3, burn), W / 2, lerp(720, 860, burn));
      screen(ctx, S, burn * 0.9);
      lampGlow(ctx, S, W / 2, 900, 1 - burn * 0.8);
      ctx.save(); ctx.fillStyle = '#c0582a'; ctx.globalAlpha = 0.35 * burn; ctx.fillRect(-80, -80, W + 160, 1240); ctx.restore();
      for (let i = 0; i < 9; i++) pup(ctx, k, 160 + i * 95, 1000, 0.66, { ...(i % 3 === 2 ? THESPIAN(i) : SPARTAN(i)), t: S.t * (1 + burn) + i, face: 1, arm: 0.3 + Math.sin(S.t * 6 + i) * 0.15 * (1 - burn), tilt: burn * 0.05 * Math.sin(i), hold: arms(k, P, i % 3 === 2 ? 'Θ' : 'L'), rod: i === 4 });
      // arrows fill the sky
      const R = rng(9); ctx.save(); ctx.globalAlpha = tween(u, fi, fi + 0.4) * (1 - burn * 0.5); for (let i = 0; i < 40; i++) { const x = (R() * 1300 - 100 + S.t * 400) % 1300 - 100, y = 120 + R() * 400; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 50, y - 18); k.stroke(ctx, P.ink, 2.5); } ctx.restore();
      k.candle(ctx, 960, 340, 0.8 * (1 - burn * 0.6), S.t);
    },
  },
  { // 45.7 "History mostly remembers the Spartans,"
    start: 45.4, title: 'Who History Remembers', trans: 'curtain',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const hi = S.at('History'), re = S.at('remembers'), sp = S.at('Spartans,');
      S.cam(lerp(1.3, 1.0, tween(u, 0, sp + 0.6, ease.inOut)), lerp(420, W / 2, tween(u, 0, sp + 0.6)), lerp(560, 640, tween(u, 0, sp + 0.6)));
      screen(ctx, S, 0.5);
      // a bronze warrior on a tall plinth, in the spotlight…
      lampGlow(ctx, S, 420, 520, 0.9);
      k.rect(ctx, 300, 760, 240, 240, '#cfc6b4', P.ink, 3); k.rect(ctx, 280, 740, 280, 30, '#dcd4c4', P.ink, 2.5);
      pup(ctx, k, 420, 740, 1.0, { ...LEONIDAS, robe: '#8a6a2a', trim: '#c9a227', hatColor: '#9a7a3a', skin: '#a8803a', crest: '#8a6a2a', beard: '#7a5a2a', t: 0, face: 1, arm: 0.6, rod: false, hold: arms(k, P, 'L') });
      // …and, at the edge of the light, the others who stood there too
      const fade = tween(u, re, sp + 0.8);
      for (let i = 0; i < 5; i++) { ctx.save(); ctx.globalAlpha = lerp(0.15, 0.6, fade); pup(ctx, k, 700 + i * 80, 1000, 0.55, { ...(i < 3 ? THESPIAN(i) : GREEK(i)), t: S.t + i, face: -1, arm: 0.2, rod: false, hold: arms(k, P, null) }); ctx.restore(); }
    },
  },
  { // 48.7 "a defeat that became the most famous last stand in history."
    start: 48.5, title: 'The Most Famous Last Stand', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const de = S.at('defeat'), be = S.at('became'), la = S.at('last'), hi = S.at('history.');
      S.cam(lerp(1.0, 1.2, tween(u, la - 0.3, hi + 0.8, ease.inOut)), W / 2, lerp(640, 560, tween(u, la - 0.3, hi + 0.8)));
      screen(ctx, S, 0, 1);
      mountain(ctx, S, W / 2, 1000, 1100, 300, 17);
      // a stone set up at the pass, with the famous lines cut into it
      const rise = tween(u, de - 0.2, be + 0.4, ease.outBack);
      ctx.save(); ctx.translate(W / 2, 1000); ctx.scale(1, rise);
      ctx.beginPath(); ctx.moveTo(-260, 0); ctx.lineTo(-260, -620); ctx.quadraticCurveTo(0, -720, 260, -620); ctx.lineTo(260, 0); ctx.closePath(); k.fillStroke(ctx, '#d8d0c0', P.ink, 3);
      ctx.restore();
      const lines = ['Go tell the Spartans,', 'passer-by,', 'that here, obedient', 'to their laws,', 'we lie.'];
      const cut = tween(u, be, hi + 0.4, ease.linear) * lines.length;
      ctx.fillStyle = '#4a3a2a'; ctx.font = 'italic 700 46px GaramondItalic'; ctx.textAlign = 'center';
      lines.forEach((l, i) => { const q = clamp(cut - i); if (q > 0 && rise > 0.9) ctx.fillText(l.slice(0, Math.ceil(l.length * q)), W / 2, 520 + i * 70); });
      k.label(ctx, 'SIMONIDES’ EPITAPH', W / 2, 920, 20, tween(u, hi, hi + 0.5));
      // a single shield leans at its foot, with laurel
      k.aspis(ctx, W / 2 + 300, 940, 60, BRONZE, EMBLEM.L);
      for (let i = 0; i < 7; i++) k.ellipse(ctx, W / 2 + 250 + i * 16, 990 - Math.sin(i) * 10, 10, 5, i, P.green, P.ink, 1);
    },
  },
  { // 54.0 "Every legend has a beginning."
    start: 53.7, title: 'Every Legend Has a Beginning', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S, beg = S.at('beginning.');
      ctx.save(); S.cam(lerp(1.0, 1.4, tween(u, 0, beg)), W / 2, 800);
      screen(ctx, S, 0, 1); lampGlow(ctx, S, W / 2, 700, 0.8);
      for (let i = 0; i < 9; i++) pup(ctx, k, 160 + i * 95, 1000, 0.66, { ...(i % 3 === 2 ? THESPIAN(i) : SPARTAN(i)), t: S.t + i, face: 1, arm: 0.25, hold: arms(k, P, i % 3 === 2 ? 'Θ' : 'L') });
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
  { t: 1.3, type: 'stamp', gain: 0.4 }, { t: 3.8, type: 'riser', gain: 0.35 }, { t: 4.4, type: 'gong', gain: 0.45 },
  { t: 5.6, type: 'stamp', gain: 0.5 }, { t: 6.2, type: 'wind', gain: 0.3 },
  ...Array.from({ length: 8 }, (_, i) => ({ t: +(8.4 + i * 0.35).toFixed(2), type: 'thud', gain: 0.3, pitch: 0.8 })),
  { t: 11.5, type: 'pluck', gain: 0.3 }, { t: 12.9, type: 'clank', gain: 0.4 }, { t: 15.0, type: 'waves', gain: 0.35 },
  { t: 17.0, type: 'pluck', gain: 0.3, pitch: 1.2 }, { t: 20.1, type: 'gong', gain: 0.5 },
  { t: 21.4, type: 'clank', gain: 0.4 }, { t: 22.2, type: 'clank', gain: 0.4, pitch: 1.2 }, { t: 23.0, type: 'clank', gain: 0.45, pitch: 1.4 },
  { t: 24.3, type: 'wind', gain: 0.4 }, { t: 26.3, type: 'pop', gain: 0.35 }, { t: 28.1, type: 'riser', gain: 0.35 },
  { t: 30.6, type: 'thud', gain: 0.5 }, { t: 31.2, type: 'thud', gain: 0.5 }, { t: 31.9, type: 'alarm', gain: 0.12 },
  { t: 33.7, type: 'chime', gain: 0.35, pitch: 0.8 }, { t: 34.9, type: 'wind', gain: 0.3 },
  { t: 36.9, type: 'clank', gain: 0.5 }, { t: 38.9, type: 'thud', gain: 0.35 }, { t: 39.4, type: 'thud', gain: 0.35 }, { t: 41.6, type: 'chime', gain: 0.5, pitch: 1.3 },
  { t: 43.1, type: 'clank', gain: 0.45 }, { t: 43.5, type: 'clank', gain: 0.4, pitch: 1.2 }, { t: 44.3, type: 'gong', gain: 0.55, pitch: 0.8 },
  { t: 45.8, type: 'paper', gain: 0.3 }, { t: 49.7, type: 'crack', gain: 0.3 }, { t: 51.6, type: 'riser', gain: 0.4 }, { t: 52.4, type: 'gong', gain: 0.6 },
];

export const music = {
  bpm: 92, root: 'G', maqam: 'hicaz', gain: 0.3,
  sections: [
    { from: 0, to: 5.4, mood: 'intro' },
    { from: 5.4, to: 21.1, mood: 'drive' },
    { from: 21.1, to: 33.0, mood: 'groove' },
    { from: 33.0, to: 45.4, mood: 'sad' },
    { from: 45.4, to: 56.8, mood: 'triumph' },
    { from: 56.8, to: 58.6, mood: 'end' },
  ],
};
