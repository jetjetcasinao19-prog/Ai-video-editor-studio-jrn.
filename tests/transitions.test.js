// Tests the clip timeline and video transitions, measured on the exported file.
// Run: node tests/transitions.test.js   (needs ffmpeg and playwright)
const { chromium, devices } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const PAGE = 'file://' + path.resolve(__dirname, '..', 'index.html');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'trans-test-'));
const COLORS = path.join(tmp, 'colors.webm'); // red 0-3 s, blue 3-6 s, green 6-9 s, with tones
const OTHER = path.join(tmp, 'other.webm');

let failures = 0;
function check(name, ok, detail) {
  console.log((ok ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? '  (' + detail + ')' : ''));
  if (!ok) failures++;
}
const ff = args => execFileSync('ffmpeg', ['-loglevel', 'error', '-y', ...args], { maxBuffer: 256 * 1024 * 1024 });
const V = 'size=320x180:rate=30';
const enc = ['-c:v', 'libvpx', '-deadline', 'realtime', '-cpu-used', '8', '-g', '15', '-b:v', '500k', '-c:a', 'libopus'];
ff(['-f', 'lavfi', '-i', `color=c=red:${V}:duration=3`, '-f', 'lavfi', '-i', `color=c=blue:${V}:duration=3`,
  '-f', 'lavfi', '-i', `color=c=lime:${V}:duration=3`,
  '-f', 'lavfi', '-i', 'sine=frequency=300:duration=3', '-f', 'lavfi', '-i', 'sine=frequency=500:duration=3',
  '-f', 'lavfi', '-i', 'sine=frequency=700:duration=3',
  '-filter_complex', '[0][3][1][4][2][5]concat=n=3:v=1:a=1[v][a]', '-map', '[v]', '-map', '[a]', ...enc, COLORS]);
ff(['-f', 'lavfi', '-i', `testsrc=${V}:duration=3`, '-f', 'lavfi', '-i', 'sine=duration=3', ...enc, '-shortest', OTHER]);

// Decode an exported file: duration, and average colour of the left/right
// thirds of the frame at given times.
function analyse(file, times) {
  const dur = Number(execFileSync('ffprobe', ['-v', 'error', '-count_frames', '-select_streams', 'v', '-show_entries',
    'stream=nb_read_frames', '-of', 'csv=p=0', file]).toString().trim()) / 30;
  const W = 36, H = 64;
  const raw = ff(['-i', file, '-vf', `fps=30,scale=${W}:${H}`, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-']);
  const n = raw.length / (W * H * 3);
  const at = (t, x0, x1) => {
    const f = Math.min(n - 1, Math.max(0, Math.round(t * 30)));
    let r = 0, g = 0, b = 0, c = 0;
    for (let y = 0; y < H; y++) for (let x = Math.floor(x0 * W); x < Math.floor(x1 * W); x++) {
      const i = (f * W * H + y * W + x) * 3; r += raw[i]; g += raw[i + 1]; b += raw[i + 2]; c++;
    }
    return [r / c, g / c, b / c].map(Math.round);
  };
  return { dur, frames: n, at, sample: times.map(t => ({ t, left: at(t, 0, 0.3), mid: at(t, 0.35, 0.65), right: at(t, 0.7, 1) })) };
}
const isRed = c => c[0] > 180 && c[1] < 70 && c[2] < 70;
const isBlue = c => c[2] > 180 && c[0] < 70 && c[1] < 70;
const isGreen = c => c[1] > 180 && c[0] < 70 && c[2] < 70;
const isDark = c => c[0] < 40 && c[1] < 40 && c[2] < 40;
const isMixRB = c => c[0] > 50 && c[2] > 50 && c[1] < 60; // red + blue blend

(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const context = await browser.newContext({ ...devices['Pixel 7'], acceptDownloads: true });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('dialog', d => d.accept());

  const load = async f => {
    await page.setInputFiles('#file', f);
    await page.waitForFunction(() => document.getElementById('status').textContent === 'Video ready.');
  };
  const addRange = async (a, b) => {
    await page.fill('#start', String(a)); await page.fill('#end', String(b)); await page.click('#tlAddRange');
  };
  const setDur = v => page.evaluate(v => { const el = document.getElementById('tlDur'); el.value = v; el.dispatchEvent(new Event('input')); }, v);
  const exportAndAnalyse = async (name, times) => {
    await page.click('#export');
    await page.waitForFunction(() => /Export (completed|error)/.test(document.getElementById('status').textContent), null, { timeout: 60000 });
    const st = await page.textContent('#status');
    if (!st.startsWith('Export completed')) return { st };
    const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#result a')]);
    const out = path.join(tmp, name + '.webm');
    await dl.saveAs(out);
    if (process.env.SHOT_DIR) fs.copyFileSync(out, path.join(process.env.SHOT_DIR, name + '.webm'));
    return { st, out, ...analyse(out, times) };
  };

  try {
    await page.goto(PAGE);
    check('timeline buttons disabled before a video is loaded',
      await page.evaluate(() => ['tlAddRange', 'tlPlay', 'tlClear'].every(id => document.getElementById(id).disabled)));
    await load(COLORS);
    await page.selectOption('#fit', 'cover');

    // Build: red, blue, green with crossfade then slide, 1.0 s each.
    await setDur(1);
    await page.selectOption('#tlType', 'fade');
    await addRange(0.5, 2.5);
    await page.selectOption('#tlType', 'slideleft');
    await addRange(3.5, 5.5);
    await addRange(6.5, 8.5);
    check('three clips added', await page.evaluate(() => timeline.length) === 3);
    check('total length accounts for overlaps (4.0 s)', (await page.textContent('#tlInfo')).includes('total 4.0 s'), await page.textContent('#tlInfo'));
    check('Export says it will use the timeline', (await page.textContent('#exportMode')).includes('timeline (3 clips, 4.0 s)'));
    check('no horizontal scroll with timeline', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));

    const r = await exportAndAnalyse('fade-slide', [0.4, 1.5, 2.5, 3.6]);
    check('timeline export completes', r.st.startsWith('Export completed'), r.st);
    check('exported length ≈ 4.0 s', Math.abs(r.dur - 4.0) < 0.4, r.dur.toFixed(2) + ' s');
    const [s0, s1, s2, s3] = r.sample;
    check('0.4 s: first clip (red)', isRed(s0.mid), JSON.stringify(s0.mid));
    check('1.5 s: crossfade red→blue is a blend', isMixRB(s1.mid), JSON.stringify(s1.mid));
    check('2.5 s: slide shows blue on the left, green on the right', isBlue(s2.left) && isGreen(s2.right), JSON.stringify([s2.left, s2.right]));
    check('3.6 s: last clip (green)', isGreen(s3.mid), JSON.stringify(s3.mid));
    const volOut = require('child_process').spawnSync('ffmpeg', ['-i', r.out, '-af', 'volumedetect', '-f', 'null', '-']).stderr.toString();
    const mean = Number((volOut.match(/mean_volume: (-?[\d.]+)/) || [])[1]);
    check('exported timeline has sound', mean > -40, mean + ' dB');

    // Cuts + fade in/out from black.
    await page.evaluate(() => { timeline.forEach(c => c.trans = 'cut'); renderTimeline(); });
    await page.check('#tlFadeIn'); await page.check('#tlFadeOut');
    await setDur(0.5);
    check('cuts: total is the sum of clips (6.0 s)', (await page.textContent('#tlInfo')).includes('total 6.0 s'));
    const c = await exportAndAnalyse('cuts-fades', [0.03, 1.0, 3.0, 5.0, 5.97]);
    check('cut export length ≈ 6.0 s', Math.abs(c.dur - 6.0) < 0.4, c.dur && c.dur.toFixed(2) + ' s');
    check('fade in: starts black', isDark(c.sample[0].mid), JSON.stringify(c.sample[0].mid));
    check('cuts: red, blue, green in order', isRed(c.sample[1].mid) && isBlue(c.sample[2].mid) && isGreen(c.sample[3].mid),
      JSON.stringify(c.sample.slice(1, 4).map(s => s.mid)));
    check('fade out: ends black', isDark(c.sample[4].mid), JSON.stringify(c.sample[4].mid));
    await page.uncheck('#tlFadeIn'); await page.uncheck('#tlFadeOut');

    // Every transition type draws correctly at its midpoint (direct check).
    const kinds = await page.evaluate(async () => {
      const mk = async t => { const v = document.createElement('video'); v.muted = true; v.src = videoURL; await new Promise(r => v.addEventListener('loadeddata', r, { once: true })); await seekScan(v, t); return v; };
      const a = await mk(1), b = await mk(4);
      const out = {};
      for (const type of Object.keys(TRANSITION_NAMES)) {
        ctx.fillStyle = '#000'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawTransition(type, a, b, type === 'cut' ? 0.6 : 0.5);
        const px = (fx, fy) => Array.from(ctx.getImageData(Math.floor(canvas.width * fx), Math.floor(canvas.height * fy), 1, 1).data.slice(0, 3));
        out[type] = { left: px(0.15, 0.5), mid: px(0.5, 0.5), right: px(0.85, 0.5), top: px(0.5, 0.15), bottom: px(0.5, 0.85) };
      }
      return out;
    });
    const R = isRed, B = isBlue;
    check('transition Cut', B(kinds.cut.mid), JSON.stringify(kinds.cut.mid));
    check('transition Crossfade', isMixRB(kinds.fade.mid), JSON.stringify(kinds.fade.mid));
    check('transition Fade through black', isDark(kinds.black.mid), JSON.stringify(kinds.black.mid));
    check('transition Fade through white', kinds.white.mid.every(v => v > 230), JSON.stringify(kinds.white.mid));
    check('transition Slide left', R(kinds.slideleft.left) && B(kinds.slideleft.right), JSON.stringify(kinds.slideleft));
    check('transition Slide up', R(kinds.slideup.top) && B(kinds.slideup.bottom), JSON.stringify([kinds.slideup.top, kinds.slideup.bottom]));
    check('transition Wipe', B(kinds.wipe.left) && R(kinds.wipe.right), JSON.stringify([kinds.wipe.left, kinds.wipe.right]));
    check('transition Zoom', isMixRB(kinds.zoom.mid), JSON.stringify(kinds.zoom.mid));

    // Preview plays to the end, Stop works.
    await page.click('#tlPlay');
    await page.waitForFunction(() => /^(Preview finished|Stopped|Preview failed)/.test(document.getElementById('tlStatus').textContent), null, { timeout: 30000 });
    check('preview plays the whole timeline', (await page.textContent('#tlStatus')) === 'Preview finished.', await page.textContent('#tlStatus'));
    await page.click('#tlPlay'); await page.waitForTimeout(600);
    const during = await page.evaluate(() => ({ exp: document.getElementById('export').disabled, scene: document.getElementById('sceneRun').disabled }));
    await page.click('#tlStop');
    await page.waitForFunction(() => /^(Stopped|Preview)/.test(document.getElementById('tlStatus').textContent), null, { timeout: 10000 });
    check('export/scene blocked during preview; Stop works', during.exp && during.scene && (await page.textContent('#tlStatus')) === 'Stopped.');
    check('players and audio cleaned up', await page.evaluate(() => document.querySelectorAll('video').length === 1 && !busy && !tlRunning && !document.getElementById('export').disabled));

    // Editing: move, delete, transition length capped by short clips.
    await page.locator('#tlList .clip').nth(2).getByText('↑').click();
    check('move clip up', JSON.stringify(await page.evaluate(() => timeline.map(c => c.start))) === '[0.5,6.5,3.5]');
    await page.locator('#tlList .clip').nth(0).getByText('✕').click();
    check('remove clip', JSON.stringify(await page.evaluate(() => timeline.map(c => c.start))) === '[6.5,3.5]');
    await addRange(1, 1.6);
    await setDur(2);
    await page.evaluate(() => { timeline.forEach(c => c.trans = 'fade'); renderTimeline(); });
    check('transition length capped at half the shorter clip', Math.abs(await page.evaluate(() => transLen(1)) - 0.3) < 1e-9, await page.evaluate(() => transLen(1)));

    // Scenes: +ADD and ALL SCENES
    await page.click('#tlClear');
    await page.click('#sceneRun');
    await page.waitForFunction(() => /^Found/.test(document.getElementById('sceneStatus').textContent), null, { timeout: 60000 });
    await page.locator('#sceneList .scene').nth(1).getByText('+ADD').click();
    check('+ADD on a scene adds it with its thumbnail', await page.evaluate(() => timeline.length === 1 && Math.abs(timeline[0].start - 3) < 0.05 && !!timeline[0].thumb));
    await page.click('#tlAddScenes');
    check('ALL SCENES adds every scene', await page.evaluate(() => timeline.length) === 4);

    // New video clears the timeline; Start–End export still works.
    await load(OTHER);
    check('importing a new video clears the timeline', await page.evaluate(() => timeline.length === 0) &&
      (await page.textContent('#exportMode')).includes('Start–End'));
    await page.fill('#start', '0'); await page.fill('#end', '1.5');
    const o = await exportAndAnalyse('range', [0.5]);
    check('normal Start–End export still works', o.st.startsWith('Export completed') && Math.abs(o.dur - 1.5) < 0.4, o.st + ' ' + (o.dur || 0).toFixed(2));

    check('no JavaScript errors', errors.length === 0, errors.join(' | '));
  } catch (e) {
    check('test run', false, e.message);
  } finally {
    await browser.close();
    fs.rmSync(tmp, { recursive: true, force: true });
  }
  console.log(failures ? '\n' + failures + ' check(s) FAILED' : '\nAll checks passed');
  process.exit(failures ? 1 : 0);
})();
