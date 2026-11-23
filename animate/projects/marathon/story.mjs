// "The Race That Came From a Legend" — the marathon, told as a journey on a
// painted map (`voyage` device): the map of Greece opens the story, each run is
// drawn on it as a dotted road, and the 1896 race finally fills a marble stadium.
// Greeks and Persians are drawn with respect, in period dress; no Olympic rings
// or other marks. The famous death-run is shown as a legend (a ghostly outline),
// because the oldest source, Herodotus, never tells it.
import { clamp, lerp, ease, tween, rng, TAU } from '../../lib/core.mjs';
import { interior, bookCover } from '../../styles/ottoman/scenes.mjs';
import { act } from '../../styles/ottoman/acting.mjs';

export const meta = {
  title: 'The Race That Came From a Legend',
  slug: 'marathon-ottoman',
  style: 'ottoman',
  look: 'tile',     // tiled frame (after scroll, night, ledger)
  ambient: 'dust',
  room: 'arches',
  device: 'voyage',
  width: 1080, height: 1920, fps: 30,
  duration: 58.6,
  voice: 'voice.mp3',
  seed: 490,
  captionChars: 30,
  brand: { handle: '@HOWITSTARTED-YT1', logo: '../../../brand/logo.png' },
  outro: { at: 56.8, text: 'Subscribe for more origin stories' },
};

const SEA = '#3f6f9a', LAND = '#d9c08a', HILL = '#c4a56c';
const HOPLITE = i => ({ robe: ['#9a2a1e', '#b0532e', '#8a3a2a'][i % 3], inner: '#c08a3a', hat: 'greekhelm', crest: i % 2 ? '#2a2a2a' : '#9a2a1e', skin: ['#d9a882', '#c99a6e', '#b88a5e'][i % 3] });
const PERSIAN = i => ({ robe: ['#2f5f8a', '#5a3a7a', '#2f6a5a'][i % 3], robeP: 'dots', hat: 'tiara', hatColor: ['#c9a227', '#e8dcc0', '#b0532e'][i % 3], skin: ['#c68a5e', '#b07a52', '#d0a070'][i % 3], beard: true, beardColor: '#2a1c12' });
const RUNNER = { robe: '#efe6cf', inner: '#9a2a1e', sash: '#9a2a1e', hat: 'shorthair', hair: '#2a1c12', skin: '#c99a6e' };

// ---- the painted map of Greece (the voyage device) ----
const PLACES = { athens: [560, 600], marathon: [700, 500], sparta: [380, 900] };
const MAINLAND = [[-80, -80], [1160, -80], [1160, 230], [930, 300], [820, 380], [760, 440], [730, 540], [660, 640], [590, 680], [540, 640], [480, 600], [430, 590], [340, 560], [200, 520], [-80, 500]];
const PELOP = [[430, 610], [470, 640], [490, 720], [560, 760], [530, 850], [480, 900], [500, 1010], [440, 960], [410, 1050], [350, 960], [300, 1030], [260, 920], [190, 860], [150, 740], [210, 650], [320, 620], [400, 600]];
const ROUTES = {
  sparta: [PLACES.athens, [500, 610], [445, 618], [430, 690], [410, 790], PLACES.sparta],
  athens: [PLACES.marathon, [670, 530], [620, 570], PLACES.athens],
};
function pathAt(pts, k) { // a point k (0..1) along a polyline
  const seg = []; let tot = 0; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); tot += d; }
  let r = clamp(k) * tot; for (let i = 0; i < seg.length; i++) { if (r <= seg[i]) { const q = r / seg[i]; return [lerp(pts[i][0], pts[i + 1][0], q), lerp(pts[i][1], pts[i + 1][1], q)]; } r -= seg[i]; }
  return pts[pts.length - 1];
}
function greeceMap(ctx, S, o = {}) {
  const { k, P, W } = S;
  ctx.fillStyle = SEA; ctx.fillRect(-80, -80, W + 160, 1260);
  k.waves(ctx, -80, -80, W + 160, 1260, S.t, SEA, '#6f9cc0', 8, 30);
  for (const poly of [MAINLAND, PELOP]) { ctx.beginPath(); k.smoothPath(ctx, poly, true); ctx.fillStyle = LAND; ctx.fill(); k.stroke(ctx, P.ink, 3); }
  const R = rng(5); // little hills, painted as Matrakçı does: rows of rounded humps
  for (let i = 0; i < 26; i++) { const x = 60 + R() * 900, y = R() < 0.5 ? 60 + R() * 380 : 660 + R() * 300; if (y > 640 && (x < 200 || x > 520)) continue; ctx.beginPath(); ctx.arc(x, y, 22 + R() * 14, Math.PI, TAU); ctx.closePath(); k.fillStroke(ctx, HILL, P.ink, 1.5); }
  for (const [name, [x, y]] of Object.entries(PLACES)) {
    if (o.hide && o.hide.includes(name)) continue;
    k.rect(ctx, x - 18, y - 22, 36, 22, P.white, P.ink, 1.5); k.poly(ctx, [[x - 22, y - 22], [x, y - 36], [x + 22, y - 22]], P.verm, P.ink, 1.5);
    ctx.fillStyle = P.ink; ctx.font = '700 30px Fell'; ctx.textAlign = 'center'; ctx.fillText(name.toUpperCase(), x, y + 34);
  }
  for (const [key, kk] of Object.entries(o.routes || {})) {
    const pts = ROUTES[key], n = 60;
    for (let i = 0; i <= n * clamp(kk); i++) { const [x, y] = pathAt(pts, i / n); k.circle(ctx, x, y, 5, key === 'athens' ? P.verm : P.goldDark, null); }
    if (kk > 0 && kk < 1.02 && o.runner !== false) { const [x, y] = pathAt(pts, kk); k.figure(ctx, x, y + 8, { ...RUNNER, s: 0.42, face: key === 'sparta' ? -1 : -1, walk: S.t * 18, armF: [0.9 + Math.sin(S.t * 18) * 0.5, 0.4], armB: [0.9 - Math.sin(S.t * 18) * 0.5, 0.4] }); }
  }
}
// a running man (fast legs, pumping arms, leaning forward)
function runner(ctx, S, x, y, s, f = 1, o = {}) {
  const w = S.t * 16;
  ctx.save(); ctx.translate(x, y); ctx.rotate(0.08 * f);
  S.k.figure(ctx, 0, 0, { ...RUNNER, ...o, s, face: f, walk: w, armF: [0.9 + Math.sin(w) * 0.6, 0.5], armB: [0.9 - Math.sin(w) * 0.6, 0.5] });
  ctx.restore();
}
function road(ctx, S, y0) {
  const { k, P, W } = S;
  k.goldSky(ctx, -80, -80, W + 160, y0 + 120, S.t);
  k.hills(ctx, W, y0 - 120, 4, ['#c4a56c', '#b0905a', '#9a8a5a'], S.t);
  k.ground(ctx, -80, y0, W + 160, 700, '#d8b878', 6, 0.4);
  ctx.fillStyle = '#e8d4a4'; ctx.fillRect(-80, y0 + 200, W + 160, 120);
}

export const scenes = [
  { // 0.0 "The marathon is named after a battle, and its famous story probably never happened."
    start: 0, title: 'A Story That Never Happened',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const ba = S.at('battle,'), fa = S.at('famous'), ne = S.at('never');
      S.cam(lerp(1.2, 1.0, tween(u, 0, 2.5)), lerp(380, W / 2, tween(u, 0, 2.5)), 640);
      road(ctx, S, 760);
      // the clash behind him, far off: two lines of shields and spears
      const cl = tween(u, ba - 0.3, ba + 0.4);
      if (cl > 0) { ctx.save(); ctx.globalAlpha = cl; for (let i = 0; i < 5; i++) { k.figure(ctx, 140 + i * 50, 760, { ...HOPLITE(i), s: 0.42, face: 1, armF: [1.5, 0.1], hold: c => k.aspis(c, 0, 0, 40) }); k.figure(ctx, 520 + i * 50, 760, { ...PERSIAN(i), s: 0.42, face: -1, armF: [1.4, 0.2] }); } ctx.restore(); }
      // the runner of the story; at "never" he fades into a dotted outline: a legend
      const ghost = tween(u, ne - 0.2, ne + 0.6);
      const x = lerp(-60, 680, tween(u, 0, ne + 0.4, ease.linear));
      ctx.save(); ctx.globalAlpha = 1 - ghost * 0.75; runner(ctx, S, x, 1000, 1.25, 1); ctx.restore();
      if (ghost > 0) { ctx.save(); ctx.setLineDash([10, 10]); ctx.globalAlpha = ghost; ctx.beginPath(); ctx.ellipse(x + 6, 820, 110, 230, 0.08, 0, TAU); k.stroke(ctx, P.vermDark, 5); ctx.restore(); ctx.fillStyle = P.vermDark; ctx.globalAlpha = ghost; ctx.font = '900 150px Deco'; ctx.textAlign = 'center'; ctx.fillText('?', x + 170, 700); ctx.globalAlpha = 1; }
      k.label(ctx, '42.195 KM · 26.2 MILES', W / 2, 260, 26, tween(u, fa - 0.2, fa + 0.3));
    },
  },
  { // 6.5 "490 BC, Greece."
    start: 6.2, title: 'Greece, 490 BC', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, W } = S, gr = S.at('Greece.');
      S.cam(lerp(0.95, 1.12, tween(u, 0, 3.2, ease.inOut)), W / 2, lerp(560, 640, tween(u, 0, 3.2)));
      greeceMap(ctx, S, {});
      k.seal(ctx, 860, 180, 80, ' THE YEAR · 490 BC ·', '490 BC', tween(u, 0.1, 0.5, ease.linear));
      k.label(ctx, 'THE AEGEAN SEA', 880, 980, 22, tween(u, gr, gr + 0.4));
    },
  },
  { // 9.7 "A huge Persian army lands at Marathon near Athens."
    start: 9.4, title: 'The Persians Land', trans: 'tiles',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const hu = S.at('huge'), la = S.at('lands'), at = S.at('Athens.');
      S.cam(lerp(1.0, 1.15, tween(u, la - 0.2, at + 0.6, ease.inOut)), lerp(W / 2, 640, tween(u, la, at)), 620);
      k.goldSky(ctx, -80, -80, W + 160, 520, S.t);
      k.hills(ctx, W, 400, 9, ['#c4a56c', '#b0905a', '#9a8a5a'], S.t);
      k.ground(ctx, 300, 470, W, 800, '#e3cc94', 8, 0.2);
      ctx.save(); ctx.beginPath(); ctx.moveTo(-80, 470); ctx.lineTo(380, 470); ctx.quadraticCurveTo(250, 800, 420, 1260); ctx.lineTo(-80, 1260); ctx.closePath(); ctx.clip(); k.waves(ctx, -80, 460, 600, 820, S.t, SEA, '#6f9cc0', 20, 26); ctx.restore();
      // the fleet rows in, then the army pours onto the beach
      const sail = tween(u, 0, la + 0.3, ease.outCubic);
      for (let i = 0; i < 4; i++) k.galley(ctx, lerp(-260, 120 + (i % 2) * 90, sail), 560 + i * 150, 0.5, S.t + i, null, Math.sin(S.t * 2 + i) * 0.03);
      const land = tween(u, la, at + 0.8);
      const n = Math.floor(lerp(4, 30, tween(u, hu - 0.3, at + 0.8)));
      for (let i = 0; i < n; i++) { const r = Math.floor(i / 6), c = i % 6; k.figure(ctx, lerp(360, 470, land) + c * 92 + (r % 2) * 46, 640 + r * 120, { ...PERSIAN(i), s: 0.5, face: 1, walk: land < 1 ? S.t * 8 + i : null, armF: [0.4, 0.2] }); }
      // a tiny inset map: Marathon is a day's march from Athens
      const m = tween(u, at - 0.4, at + 0.2);
      if (m > 0) { ctx.save(); ctx.globalAlpha = m; k.circle(ctx, 880, 200, 140, '#f2e6c8', P.goldDark, 6); ctx.beginPath(); ctx.arc(880, 200, 134, 0, TAU); ctx.clip(); ctx.translate(880, 200); ctx.scale(0.55, 0.55); ctx.translate(-630, -560); greeceMap(ctx, S, { hide: ['sparta'] }); ctx.restore(); }
    },
  },
  { // 13.7 "Athens sends a runner, Pheidippides, to Sparta to ask for help."
    start: 13.4, title: 'The Run to Sparta', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const ru = S.at('runner,'), ph = S.at('Pheidippides,'), sp = S.at('Sparta'), he = S.at('help.');
      const go = tween(u, ru, he + 0.6, ease.inOut);
      const [rx, ry] = pathAt(ROUTES.sparta, go);
      S.cam(lerp(1.0, 1.5, tween(u, ru - 0.4, ru + 0.8, ease.inOut)), lerp(W / 2, rx, tween(u, ru - 0.4, ru + 0.8)), lerp(600, ry, tween(u, ru - 0.4, ru + 0.8)));
      greeceMap(ctx, S, { routes: { sparta: go } });
      k.label(ctx, 'PHEIDIPPIDES', rx, ry - 110, 22, tween(u, ph, ph + 0.4));
      k.label(ctx, 'ABOUT 150 MILES IN 2 DAYS', 400, 1020, 20, tween(u, sp + 0.2, sp + 0.6));
    },
  },
  { // 18.2 "The Athenians win the battle."
    start: 17.9, title: 'Athens Wins', trans: 'wipe',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const wi = S.at('win'), ba = S.at('battle.');
      S.cam(lerp(1.15, 1.0, tween(u, 0, wi + 0.4, ease.inOut)), W / 2, 700);
      k.goldSky(ctx, -80, -80, W + 160, 560, S.t);
      k.hills(ctx, W, 440, 12, ['#c4a56c', '#b0905a', '#9a8a5a'], S.t);
      k.ground(ctx, -80, 520, W + 160, 760, '#d8b878', 12, 0.4);
      // the shield wall pushes forward; the Persians fall back to their ships
      const push = tween(u, 0.2, ba + 0.4, ease.inOut);
      for (let r = 0; r < 3; r++) for (let i = 0; i < 5; i++) {
        const x = lerp(120, 330, push) + i * 70 - r * 40, y = 760 + r * 150;
        k.figure(ctx, x, y, { ...HOPLITE(i + r), s: 0.62, face: 1, mood: u > wi ? 'happy' : 'calm', ...(u > wi + 0.3 && r === 2 ? act('cheer', u, tween(u, wi + 0.3, wi + 0.6)) : { armF: [1.45, 0.05] }), hold: r < 2 || u < wi + 0.3 ? c => k.aspis(c, 0, 0, 44, '#c08a3a', i % 2 ? P.ink : P.verm) : null });
      }
      for (let i = 0; i < 8; i++) { const x = lerp(640, 1100, tween(u, 0.4 + i * 0.05, ba + 0.6, ease.inCubic)) + (i % 4) * 80, y = 740 + Math.floor(i / 4) * 200; k.figure(ctx, x, y, { ...PERSIAN(i), s: 0.58, face: push > 0.3 ? 1 : -1, walk: S.t * 10 + i, mood: 'sad', armF: [0.6, 0.4] }); }
    },
  },
  { // 20.3 "Centuries later, writers add a dramatic twist."
    start: 20.0, title: 'Writers Add a Twist', trans: 'page',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const ce = S.at('Centuries'), wr = S.at('writers'), tw = S.at('twist.');
      S.cam(lerp(1.0, 1.25, tween(u, tw - 0.6, tw + 0.6, ease.inOut)), lerp(W / 2, 560, tween(u, tw - 0.6, tw + 0.6)), lerp(600, 520, tween(u, tw - 0.6, tw + 0.6)));
      ctx.fillStyle = k.pattern(ctx, 'tiles', '#efe2c0', '#e2d0a4', 60); ctx.fillRect(-80, -80, W + 160, 1260);
      // the hourglass turns over and over: the centuries pass
      const flips = tween(u, ce - 0.2, wr, ease.linear) * 3;
      k.hourglass(ctx, 180, 300, 0.9, flips % 1, Math.floor(flips) * Math.PI + (flips % 1 < 0.15 ? (flips % 1) / 0.15 * Math.PI : 0) * 0);
      const yv = Math.round(lerp(-490, 170, tween(u, ce - 0.2, tw, ease.inOut)));
      ctx.fillStyle = P.vermDark; ctx.font = '900 64px Deco'; ctx.textAlign = 'center'; ctx.fillText(yv < 0 ? `${-yv} BC` : `AD ${Math.max(1, yv)}`, 640, 330);
      // two writers at their desks, quills moving
      const ws = tween(u, wr - 0.3, wr + 0.3);
      for (let i = 0; i < 2; i++) {
        const x = 300 + i * 440;
        ctx.save(); ctx.globalAlpha = ws;
        k.figure(ctx, x, 900, { robe: i ? '#6a4a8a' : '#2f6a5a', inner: P.white, hat: i ? 'shorthair' : 'wreath', hair: '#5a4a3a', beard: true, beardColor: i ? '#8a7a6a' : '#3a2a20', skin: '#d9a882', s: 0.95, face: i ? -1 : 1, kneel: true, armF: [1.1 + Math.sin(S.t * 9 + i) * 0.08, 0.5] });
        k.openBook(ctx, x + (i ? -150 : 150), 860, 200, 110, { rot: 0 });
        ctx.restore();
      }
      // the twist: a line of their writing curls up into a spiral
      const t2 = tween(u, tw - 0.3, tw + 0.7, ease.outCubic);
      if (t2 > 0) { ctx.beginPath(); for (let a = 0; a < t2 * 5 * Math.PI; a += 0.1) { const r = 10 + a * 9; ctx.lineTo(540 + Math.cos(a) * r, 560 + Math.sin(a) * r); } k.stroke(ctx, P.verm, 7); }
    },
  },
  { // 24.1 "A runner races from Marathon to Athens,"
    start: 23.9, title: 'The Run to Athens', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, W } = S;
      const ra = S.at('races'), at = S.at('Athens,');
      const go = tween(u, ra - 0.1, at + 0.6, ease.inOut);
      S.cam(lerp(1.1, 1.9, tween(u, 0, ra + 0.4, ease.inOut)), lerp(W / 2, 630, tween(u, 0, ra + 0.4)), lerp(600, 560, tween(u, 0, ra + 0.4)));
      greeceMap(ctx, S, { routes: { sparta: 1, athens: go }, runner: true });
      k.label(ctx, 'ABOUT 25 MILES', 760, 640, 18, tween(u, at - 0.2, at + 0.3));
    },
  },
  { // 26.6 "announces the victory, and drops dead."
    start: 26.4, title: 'Victory, Then Silence', trans: 'cut',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const an = S.at('announces'), vi = S.at('victory,'), dr = S.at('drops'), de = S.at('dead.');
      S.cam(lerp(1.0, 1.2, tween(u, dr - 0.2, de + 0.8, ease.inOut)), W / 2, lerp(620, 760, tween(u, dr - 0.2, de + 0.8)));
      // the agora of Athens: columns and a crowd waiting for news
      k.goldSky(ctx, -80, -80, W + 160, 520, S.t);
      for (let i = 0; i < 7; i++) { k.rect(ctx, 80 + i * 150, 230, 44, 330, '#efe8da', P.ink, 2); k.rect(ctx, 66 + i * 150, 214, 72, 18, '#efe8da', P.ink, 2); }
      k.poly(ctx, [[40, 214], [W / 2, 100], [W - 40, 214]], '#efe8da', P.ink, 2.5);
      k.ground(ctx, -80, 560, W + 160, 720, '#e3cc94', 3, 0.15);
      const cheer = tween(u, vi, vi + 0.5);
      for (let i = 0; i < 8; i++) k.figure(ctx, 80 + i * 130 + (i % 2) * 20, 780 + (i % 2) * 40, { robe: [P.white, '#e8b7b0', P.ochre, '#cfe0ea'][i % 4], inner: P.verm, hat: i % 3 ? 'shorthair' : 'longhair', hair: '#2a1c12', skin: ['#d9a882', '#c99a6e', '#e2b48a'][i % 3], s: 0.6, face: i < 4 ? 1 : -1, ...(cheer > 0 && u < dr ? act('cheer', u + i, cheer) : act(u > dr + 0.2 ? 'worry' : 'rest', u, tween(u, dr + 0.2, dr + 0.6))) });
      // the runner: arms up for the news… then he sinks to the ground
      const fall = tween(u, dr, de + 0.4, ease.inOut);
      ctx.save(); ctx.translate(W / 2, 1060); ctx.rotate(-fall * 1.45); ctx.translate(0, fall * 10);
      k.figure(ctx, 0, 0, { ...RUNNER, s: 1.0, face: 1, mood: fall > 0.2 ? 'sad' : 'happy', ...(u > an - 0.2 && fall < 0.3 ? act('cheer', u, tween(u, an - 0.2, an + 0.2)) : act('rest', u)) });
      ctx.restore();
      if (fall > 0.6) { ctx.save(); ctx.globalAlpha = tween(u, de, de + 0.6); k.label(ctx, 'THE LEGEND, AS LATER WRITERS TOLD IT', W / 2, 330, 20, 1); ctx.restore(); }
    },
  },
  { // 30.0 "The oldest account, by Herodotus, never mentions that run."
    start: 29.8, title: 'What Herodotus Wrote', trans: 'ink',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const ol = S.at('oldest'), he = S.at('Herodotus,'), ne = S.at('never'), ru = S.at('run.');
      S.cam(lerp(1.0, 1.35, tween(u, ne - 0.3, ru + 0.4, ease.inOut)), lerp(W / 2, 640, tween(u, ne - 0.3, ru + 0.4)), lerp(600, 640, tween(u, ne - 0.3, ru + 0.4)));
      interior(ctx, S, { arches: 3, carpetColor: '#2f5f8a' });
      k.figure(ctx, 260, 1000, { robe: '#efe6cf', inner: '#2f5f8a', sash: '#2f5f8a', hat: 'bald', hair: '#cfcfcf', beard: true, beardColor: '#dddddd', skin: '#e2b48a', s: 1.15, face: 1, mood: 'calm', ...act(u > ne ? 'shrug' : 'present', u, tween(u, ol - 0.2, ol + 0.3)) });
      k.label(ctx, 'HERODOTUS · c. 430 BC', 260, 560, 20, tween(u, he, he + 0.4));
      // his book: the run to Sparta is there; the run to Athens is missing
      const op = tween(u, ol, ol + 0.6, ease.outBack);
      ctx.save(); ctx.translate(680, 720); ctx.scale(op, op);
      k.openBook(ctx, 0, 0, 460, 320, {});
      ctx.save(); ctx.translate(-115, 0); ctx.scale(0.22, 0.22); ctx.translate(-470, -720); ctx.beginPath(); ctx.rect(150, 450, 700, 600); ctx.clip(); greeceMap(ctx, S, { routes: { sparta: 1 }, runner: false, hide: [] }); ctx.restore();
      ctx.save(); ctx.translate(115, 0); ctx.scale(0.22, 0.22); ctx.translate(-560, -720); ctx.beginPath(); ctx.rect(250, 450, 700, 600); ctx.clip(); greeceMap(ctx, S, { routes: { athens: lerp(1, 0, tween(u, ne, ru + 0.3)) }, runner: false }); ctx.restore();
      const q = tween(u, ru - 0.1, ru + 0.4);
      if (q > 0) { ctx.globalAlpha = q; ctx.fillStyle = P.vermDark; ctx.font = '900 120px Deco'; ctx.textAlign = 'center'; ctx.fillText('?', 115, 40); ctx.globalAlpha = 1; }
      ctx.restore();
    },
  },
  { // 34.3 "In 1879, a poem makes the legend famous."
    start: 34.1, title: 'A Poem, 1879', trans: 'page',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const po = S.at('poem'), fa = S.at('famous.');
      S.cam(lerp(1.3, 1.0, tween(u, 0, fa, ease.inOut)), W / 2, lerp(520, 640, tween(u, 0, fa)));
      ctx.fillStyle = k.pattern(ctx, 'flowers', '#5a2a2a', '#7a3a32', 70); ctx.fillRect(-80, -80, W + 160, 1260);
      k.rect(ctx, -80, 760, W + 160, 520, '#6a4a32', P.ink, 2);
      // a Victorian printing press turns out copies; readers multiply around it
      const pr = tween(u, po - 0.2, fa, ease.linear);
      k.printingPress(ctx, 300, 560, 1.0, (pr * 4) % 1);
      for (let i = 0; i < Math.floor(pr * 12); i++) k.openBook(ctx, 300 + ((i * 53) % 160) - 80, 900 - i * 10, 120, 70, { cover: P.lapis, rot: (i % 3 - 1) * 0.1 });
      ctx.fillStyle = P.goldLight; ctx.font = '900 80px Deco'; ctx.textAlign = 'center'; ctx.fillText('1879', 700, 220);
      const n = Math.floor(lerp(0, 6, tween(u, po, fa + 0.4)));
      for (let i = 0; i < n; i++) { const x = 600 + (i % 3) * 150, y = 640 + Math.floor(i / 3) * 300; k.figure(ctx, x, y, { robe: ['#2a2a3a', '#2a4a3a', '#3a3a5a'][i % 3], inner: P.white, hat: ['stovepipe', 'shorthair', 'bun'][i % 3], hair: '#3a2a20', skin: '#f1d1a8', s: 0.7, face: -1, mood: 'happy', armF: [1.3, 1.2] }); k.openBook(ctx, x - 44, y - 118, 66, 42, { cover: P.lapis }); }
    },
  },
  { // 37.9 "Rejoice, we conquer!"
    start: 37.7, title: 'Rejoice, We Conquer', trans: 'flash',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const re = S.at('Rejoice,'), co = S.at('conquer!');
      S.cam(lerp(1.0, 1.15, tween(u, re, co + 0.6, ease.inOut)), W / 2, 560);
      k.goldSky(ctx, -80, -80, W + 160, 1260, S.t);
      const rays = tween(u, re, co); ctx.save(); ctx.globalAlpha = 0.35 * rays; for (let i = 0; i < 18; i++) { const a = i / 18 * TAU + S.t * 0.1; ctx.beginPath(); ctx.moveTo(W / 2, 760); ctx.lineTo(W / 2 + Math.cos(a) * 1000, 760 + Math.sin(a) * 1000); k.stroke(ctx, P.white, 18); } ctx.restore();
      k.figure(ctx, W / 2, 1080, { ...RUNNER, hat: 'wreath', s: 1.25, face: 1, mood: 'happy', ...act('cheer', u, tween(u, re - 0.2, re + 0.2)) });
      // the poem's line, written out in gold as he says it
      const w1 = tween(u, re - 0.1, re + 0.6, ease.linear), w2 = tween(u, co - 0.6, co + 0.4, ease.linear);
      ctx.textAlign = 'center'; ctx.font = 'italic 700 92px GaramondItalic';
      ctx.fillStyle = P.vermDark; ctx.fillText('“Rejoice,'.slice(0, Math.ceil(9 * w1)), W / 2, 300);
      ctx.fillText('we conquer!”'.slice(0, Math.ceil(12 * w2)), W / 2, 420);
    },
  },
  { // 41.3 "Then a French scholar, Michel Bréal, suggests a race from Marathon to Athens"
    start: 41.1, title: 'Michel Bréal’s Idea', trans: 'ink',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const fr = S.at('French'), mi = S.at('Michel'), su = S.at('suggests'), ra = S.at('race'), at = S.at('Athens');
      S.cam(lerp(1.0, 1.2, tween(u, su - 0.3, at + 0.5, ease.inOut)), lerp(W / 2, 680, tween(u, su - 0.3, at + 0.5)), 640);
      interior(ctx, S, { arches: 2, carpet: false });
      k.figure(ctx, 260, 1000, { robe: '#2a2a3a', inner: P.white, sash: '#2a2a3a', hat: 'bald', hair: '#9a8a7a', beard: true, beardColor: '#9a8a7a', mustache: true, skin: '#f1d1a8', s: 1.15, face: 1, mood: u > su ? 'happy' : 'calm', ...act(u > su ? 'point' : 'think', u, tween(u, fr, fr + 0.4)) });
      k.label(ctx, 'MICHEL BRÉAL', 260, 560, 22, tween(u, mi, mi + 0.4));
      // his letter, and the silver cup he offered to the winner
      k.letter(ctx, 700, 560, 440, 260, ['To the Games:', 'a race from', 'Marathon to Athens.'], tween(u, su - 0.2, at + 0.3), -0.04);
      const cup = tween(u, ra, ra + 0.6, ease.outBack);
      if (cup > 0) { ctx.save(); ctx.translate(720, 900); ctx.scale(cup, cup); ctx.beginPath(); ctx.moveTo(-70, -120); ctx.quadraticCurveTo(-70, 0, 0, 10); ctx.quadraticCurveTo(70, 0, 70, -120); ctx.closePath(); k.fillStroke(ctx, '#d8dde2', P.ink, 2.5); for (const sx of [-1, 1]) { ctx.beginPath(); ctx.arc(sx * 82, -80, 26, 0, TAU); k.stroke(ctx, P.ink, 9); ctx.beginPath(); ctx.arc(sx * 82, -80, 26, 0, TAU); k.stroke(ctx, '#d8dde2', 5); } k.rect(ctx, -10, 10, 20, 50, '#d8dde2', P.ink, 2); k.rect(ctx, -50, 60, 100, 20, '#d8dde2', P.ink, 2); ctx.restore(); k.star(ctx, 760, 790, 14, (Math.sin(S.t * 6) + 1) / 2); }
      k.label(ctx, 'A SILVER CUP FOR THE WINNER', 720, 1050, 18, tween(u, ra + 0.3, ra + 0.8));
    },
  },
  { // 46.8 "for the first modern Olympics in 1896."
    start: 46.6, title: 'Athens, 1896', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const ol = S.at('Olympics'), yr = S.at('1896.');
      S.cam(lerp(1.35, 1.0, tween(u, 0, yr + 1.0, ease.inOut)), W / 2, lerp(760, 600, tween(u, 0, yr + 1.0)));
      ctx.fillStyle = '#e6d6a6'; ctx.fillRect(-80, -80, W + 160, 1260);
      k.goldSky(ctx, -80, -80, W + 160, 420, S.t);
      k.hills(ctx, W, 300, 3, ['#c4a56c', '#b0905a', '#9a8a5a'], S.t);
      k.stadium(ctx, W / 2, 1160, 900, 820, S.t, tween(u, 0, ol + 0.3));
      // the runners come in through the open end of the U
      const inn = tween(u, 0.2, yr + 1.2, ease.inOut);
      for (let i = 0; i < 4; i++) runner(ctx, S, W / 2 - 60 + i * 40, lerp(1260, 760, clamp(inn * 1.2 - i * 0.12)) + i * 24, 0.5, 1, { robe: [P.white, '#cfe0ea', '#e8b7b0', P.ochreLight][i] });
      k.seal(ctx, 860, 160, 70, ' ATHENS · 1896 ·', '1896', tween(u, yr - 0.1, yr + 0.3, ease.linear));
    },
  },
  { // 49.6 "A battle legend that became the most famous race on earth."
    start: 49.4, title: 'The Most Famous Race on Earth', trans: 'unroll',
    draw(ctx, u, S) {
      const { k, P, W } = S;
      const le = S.at('legend'), fa = S.at('famous'), ea = S.at('earth.');
      S.cam(lerp(1.6, 0.95, tween(u, 0, ea + 0.4, ease.inOut)), W / 2, lerp(900, 600, tween(u, 0, ea + 0.4)));
      k.goldSky(ctx, -80, -80, W + 160, 700, S.t);
      // a road winding to the horizon, through cities of today and yesterday
      k.ground(ctx, -80, 380, W + 160, 900, '#d8b878', 14, 0.3);
      ctx.beginPath(); ctx.moveTo(W / 2 - 20, 380); ctx.bezierCurveTo(200, 560, 900, 760, 300, 1260); ctx.lineTo(760, 1260); ctx.bezierCurveTo(1100, 760, 300, 560, W / 2 + 20, 380); ctx.closePath(); k.fillStroke(ctx, '#ecdcb4', P.ink, 2);
      for (const [x, y, s] of [[160, 420, 0.5], [900, 460, 0.6], [120, 720, 0.8]]) k.house(ctx, x, y, 110 * s, 140 * s, {});
      k.cypress(ctx, 960, 760, 260, S.t, 2); k.cypress(ctx, 70, 1000, 240, S.t, 3);
      const n = Math.floor(lerp(3, 26, tween(u, le - 0.4, fa + 0.6)));
      for (let i = 0; i < n; i++) {
        const q = ((i * 0.137 + S.t * 0.05) % 1), y = lerp(400, 1220, q);
        const x = q < 0.35 ? lerp(W / 2, 470, q / 0.35) : q < 0.7 ? lerp(470, 640, (q - 0.35) / 0.35) : lerp(640, 520, (q - 0.7) / 0.3);
        runner(ctx, S, x + ((i * 37) % 120) - 60, y, lerp(0.12, 0.7, q), 1, { robe: [P.white, P.verm, P.lapis, P.ochre, P.turq, '#e8b7b0'][i % 6], skin: ['#c99a6e', '#8a5a3c', '#f1d1a8', '#b07a52', '#e2b48a'][i % 5], hat: ['shorthair', 'longhair', 'bandana', 'cap'][i % 4] });
      }
    },
  },
  { // 54.9 "Every legend has a beginning."
    start: 54.7, title: 'Every Legend Has a Beginning', trans: 'iris',
    draw(ctx, u, S) {
      const { k, P, W } = S, beg = S.at('beginning.');
      ctx.save(); S.cam(lerp(1.0, 1.5, tween(u, 0, beg)), 700, 500);
      greeceMap(ctx, S, { routes: { sparta: 1, athens: 1 }, runner: false });
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
  ...Array.from({ length: 8 }, (_, i) => ({ t: +(0.3 + i * 0.4).toFixed(2), type: 'thud', gain: 0.16, pitch: 1.6 })),
  { t: 1.8, type: 'clank', gain: 0.35, pitch: 1.3 }, { t: 2.1, type: 'clank', gain: 0.3, pitch: 1.5 },
  { t: 4.7, type: 'wind', gain: 0.4 }, { t: 5.1, type: 'chime', gain: 0.35, pitch: 0.8 },
  { t: 6.6, type: 'stamp', gain: 0.5 }, { t: 7.2, type: 'waves', gain: 0.3 },
  { t: 10.0, type: 'waves', gain: 0.45 }, { t: 10.7, type: 'thud', gain: 0.4 }, { t: 11.3, type: 'thud', gain: 0.35 }, { t: 12.2, type: 'pop', gain: 0.4 },
  { t: 14.2, type: 'whoosh', gain: 0.35 }, ...Array.from({ length: 6 }, (_, i) => ({ t: +(14.6 + i * 0.4).toFixed(2), type: 'pluck', gain: 0.18, pitch: 1 + i * 0.08 })),
  { t: 18.3, type: 'clank', gain: 0.5 }, { t: 18.6, type: 'clank', gain: 0.45, pitch: 1.2 }, { t: 19.0, type: 'gong', gain: 0.45 },
  { t: 20.4, type: 'paper', gain: 0.3 }, { t: 21.5, type: 'pluck', gain: 0.25 }, { t: 22.7, type: 'riser', gain: 0.35 },
  { t: 24.2, type: 'whoosh', gain: 0.35 }, { t: 27.2, type: 'chime', gain: 0.45, pitch: 1.3 }, { t: 28.5, type: 'thud', gain: 0.5 },
  { t: 30.1, type: 'paper', gain: 0.35 }, { t: 32.3, type: 'pop', gain: 0.35 }, { t: 33.2, type: 'pluck', gain: 0.3, pitch: 0.8 },
  { t: 34.4, type: 'clank', gain: 0.3 }, { t: 35.0, type: 'clank', gain: 0.3 }, { t: 35.6, type: 'clank', gain: 0.3 }, { t: 36.2, type: 'clank', gain: 0.3 },
  { t: 37.9, type: 'gong', gain: 0.5 }, { t: 39.5, type: 'chime', gain: 0.5, pitch: 1.4 },
  { t: 41.4, type: 'paper', gain: 0.3 }, { t: 43.5, type: 'pluck', gain: 0.3 }, { t: 44.2, type: 'chime', gain: 0.45, pitch: 1.5 },
  { t: 46.9, type: 'riser', gain: 0.4 }, { t: 47.6, type: 'stamp', gain: 0.5 }, { t: 48.0, type: 'wind', gain: 0.3 },
  { t: 49.7, type: 'whoosh', gain: 0.3 }, { t: 52.5, type: 'riser', gain: 0.4 }, { t: 53.4, type: 'gong', gain: 0.6 },
];

export const music = {
  bpm: 108, root: 'E', maqam: 'nihavend', gain: 0.3,
  sections: [
    { from: 0, to: 6.2, mood: 'intro' },
    { from: 6.2, to: 17.9, mood: 'drive' },
    { from: 17.9, to: 26.4, mood: 'groove' },
    { from: 26.4, to: 34.1, mood: 'sad' },
    { from: 34.1, to: 49.4, mood: 'groove' },
    { from: 49.4, to: 56.8, mood: 'triumph' },
    { from: 56.8, to: 58.6, mood: 'end' },
  ],
};
