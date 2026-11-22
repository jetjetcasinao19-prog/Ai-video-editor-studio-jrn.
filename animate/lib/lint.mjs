// Craft lint: the habits that make a code-drawn short look like "AI slop" —
// on-screen text that only repeats the narrator, the same rubber stamp again
// and again, scenes that just sit there, a camera that never moves, and the
// same backdrop behind everything. Each rule says why and how to fix it.
import { loadProject, makeFrameDrawer } from './engine.mjs';

const norm = s => s.toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9$' ]+/g, ' ').replace(/\s+/g, ' ').trim();
const literalCalls = (src, fn) => {
  const re = new RegExp(`k\\.${fn}\\(\\s*ctx\\s*,\\s*(['"\`])((?:(?!\\1).)*)\\1`, 'g'), out = [];
  let m; while ((m = re.exec(src))) if (!m[2].includes('${')) out.push(m[2]);
  return out;
};

export async function lintStory(dir) {
  // judge the story itself: classic look, so the look's drift, particles and brush don't count as motion
  const saved = process.env.ANIMATE_LOOK; process.env.ANIMATE_LOOK = 'classic';
  const project = await loadProject(dir);
  if (saved) process.env.ANIMATE_LOOK = saved; else delete process.env.ANIMATE_LOOK;
  const { story, words, meta } = project, scenes = story.scenes;
  const said = ' ' + norm(words.map(w => w.w).join(' ')) + ' ';
  const capitalised = new Set(words.filter(w => /^[A-Z]/.test(w.w.replace(/^[^A-Za-z]+/, ''))).map(w => norm(w.w)));
  const issues = [], notes = [];
  const add = (rule, level, msg, fix) => issues.push({ rule, level, msg, fix });

  // 1. text that only repeats the narration (names, dates and numbers are fine: they help)
  const src = scenes.map(s => s.draw.toString()).join('\n');
  const labels = literalCalls(src, 'label'), stamps = literalCalls(src, 'stamp');
  const echo = labels.filter(l => {
    const n = norm(l).replace(/…/g, ''); if (!n || /\d/.test(n)) return false;
    const ws = n.split(' ');
    if (ws.length <= 3 && ws.every(w => capitalised.has(w))) return false; // a name: keep
    return said.includes(' ' + n + ' ');
  });
  if (echo.length > 3) add('echo-labels', 'fix', `${echo.length} labels just repeat what the narrator says: ${echo.map(e => `"${e}"`).join(', ')}`, 'cut them, or replace each with something the picture cannot say on its own (a name, a number, a place, a joke the voice does not make)');
  else if (echo.length) notes.push(`labels that echo the voice (fine in small doses): ${echo.join(', ')}`);
  const perScene = labels.length / scenes.length;
  if (perScene > 1.6) add('too-much-text', 'warn', `${labels.length} labels in ${scenes.length} scenes (${perScene.toFixed(1)} per scene)`, 'let pictures carry the story; keep labels for names, dates and numbers');

  // 2. the rubber stamp habit
  if (stamps.length > 2) add('stamp-habit', 'fix', `${stamps.length} stamps (${stamps.map(s => `"${s}"`).join(', ')})`, 'keep at most two, for the real turning points; show the other moments with action, faces or a change in the scene');

  // 3. scenes that barely move (compare a frame early and late in each scene)
  const fd = await makeFrameDrawer({ ...project, meta: { ...meta, look: 'classic', paintIn: 0 } });
  const { paint: PA } = project.style.layoutOf ? project.style.layoutOf({ ...meta, look: 'classic' }) : { paint: { x: 70, y: 268, w: 940, h: 1060 } };
  const grab = t => { const d = fd.frame(t).getContext('2d').getImageData(PA.x, PA.y, PA.w, PA.h).data; const out = []; for (let i = 0; i < d.length; i += 4 * 61) out.push(d[i] + d[i + 1] + d[i + 2]); return out; };
  const still = [];
  scenes.forEach((s, i) => {
    const end = i + 1 < scenes.length ? scenes[i + 1].start : meta.duration, d = end - s.start;
    if (d < 1.2) return;
    const a = grab(s.start + Math.min(0.6, d * 0.3)), b = grab(end - 0.15);
    let diff = 0; for (let j = 0; j < a.length; j++) diff += Math.abs(a[j] - b[j]); diff /= a.length;
    if (diff < 4) still.push(`"${s.title}" (${diff.toFixed(1)})`);
  });
  if (still.length > 1) add('static-scenes', 'fix', `${still.length} scenes barely change from start to end: ${still.join(', ')}`, 'give each a change: someone acts, something arrives or transforms, the camera pushes in, the light shifts');
  else if (still.length) notes.push(`one quiet scene: ${still[0]}`);

  // 4. a camera that never moves
  const withCam = scenes.filter(s => /S\.cam\(/.test(s.draw.toString())).length;
  if (withCam / scenes.length < 0.2) add('flat-camera', 'warn', `only ${withCam} of ${scenes.length} scenes use S.cam`, 'push in on the key moment, pull out for the reveal, frame a close-up');

  // 5. the same backdrop behind everything
  const backs = { interior: /interior\(/, land: /\bland\(/, goldSky: /goldSky\(/, nightSky: /nightSky\(/ };
  for (const [name, re] of Object.entries(backs)) {
    const n = scenes.filter(s => re.test(s.draw.toString())).length;
    if (n / scenes.length > 0.5) add('same-backdrop', 'warn', `${n} of ${scenes.length} scenes are painted on ${name}()`, 'vary the setting: a bird\'s-eye panorama, a close-up on an object, a diagram, a different room');
  }

  const fixes = issues.filter(i => i.level === 'fix').length;
  return { ok: fixes === 0, issues, notes, stats: { scenes: scenes.length, labels: labels.length, echo: echo.length, stamps: stamps.length, still: still.length, camera: withCam } };
}
