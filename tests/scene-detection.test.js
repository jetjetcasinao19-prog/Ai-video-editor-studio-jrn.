// Tests automatic scene detection on videos with known cut points.
// Run: node tests/scene-detection.test.js   (needs ffmpeg and playwright)
const { chromium, devices } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const PAGE = 'file://' + path.resolve(__dirname, '..', 'index.html');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'scene-test-'));
const SCENES = path.join(tmp, 'scenes.webm');   // cuts at 2.5, 4.5, 7.0, 9.0 s
const ONE = path.join(tmp, 'onescene.webm');    // one moving shot, no cuts
const CUTS = [2.5, 4.5, 7.0, 9.0];

let failures = 0;
function check(name, ok, detail) {
  console.log((ok ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? '  (' + detail + ')' : ''));
  if (!ok) failures++;
}

const V = 'size=640x360:rate=30';
const enc = ['-c:v', 'libvpx', '-deadline', 'realtime', '-cpu-used', '8', '-g', '30', '-b:v', '1M', '-c:a', 'libopus', '-shortest'];
execFileSync('ffmpeg', ['-loglevel', 'error', '-y',
  '-f', 'lavfi', '-i', `testsrc=${V}:duration=2.5`,
  '-f', 'lavfi', '-i', `smptebars=${V}:duration=2`,
  '-f', 'lavfi', '-i', `color=c=0x2a6f3a:${V}:duration=2.5,noise=alls=30:allf=t`,
  '-f', 'lavfi', '-i', `rgbtestsrc=${V}:duration=2`,
  '-f', 'lavfi', '-i', `testsrc2=${V}:duration=3`,
  '-f', 'lavfi', '-i', 'sine=frequency=330:duration=12',
  '-filter_complex', '[0][1][2][3][4]concat=n=5:v=1:a=0,format=yuv420p[v]',
  '-map', '[v]', '-map', '5:a', ...enc, SCENES]);
execFileSync('ffmpeg', ['-loglevel', 'error', '-y',
  '-f', 'lavfi', '-i', `testsrc2=${V}:duration=10`, '-f', 'lavfi', '-i', 'sine=duration=10', ...enc, ONE]);

(async () => {
  const browser = await chromium.launch();
  const errors = [];

  async function openPage(opts = {}) {
    const page = await (await browser.newContext({ ...devices['Pixel 7'] })).newPage();
    page.on('pageerror', e => errors.push(e.message));
    page.on('dialog', d => d.accept());
    if (opts.noPlay) {
      // Simulate a browser that refuses to play the hidden scan video.
      await page.addInitScript(() => {
        const real = HTMLMediaElement.prototype.play;
        HTMLMediaElement.prototype.play = function () {
          if (this.id !== 'video') return Promise.reject(new Error('NotAllowedError'));
          return real.call(this);
        };
      });
    }
    await page.goto(PAGE);
    return page;
  }
  const load = async (page, f) => {
    await page.setInputFiles('#file', f);
    await page.waitForFunction(() => document.getElementById('status').textContent === 'Video ready.');
  };
  const detect = async (page, sens = 'normal') => {
    await page.selectOption('#sceneSens', sens);
    await page.click('#sceneRun');
    await page.waitForFunction(() => /^(Found|No scene|Scene detection failed|Cancelled)/
      .test(document.getElementById('sceneStatus').textContent), null, { timeout: 120000 });
    return { status: await page.textContent('#sceneStatus'), scenes: await page.evaluate(() => scenes.map(s => [s.start, s.end])) };
  };
  const cutsOk = scenes => scenes.length === 5 &&
    CUTS.every((c, i) => Math.abs(scenes[i + 1][0] - c) <= 0.05) &&
    scenes.every((s, i) => i === 0 || Math.abs(s[0] - scenes[i - 1][1]) < 1e-9);

  try {
    const page = await openPage();
    check('Detect button disabled before a video is loaded', await page.isDisabled('#sceneRun'));
    await load(page, SCENES);

    const r = await detect(page);
    check('finds all 4 cuts (5 scenes)', r.scenes.length === 5, r.status);
    check('cut times within 0.05 s of the real cuts', cutsOk(r.scenes), JSON.stringify(r.scenes));
    check('first scene starts at 0, last ends at video end', r.scenes[0][0] === 0 && Math.abs(r.scenes[4][1] - 12) < 0.05);
    check('one thumbnail per scene', await page.evaluate(() => document.querySelectorAll('#sceneList img[src^="data:image/jpeg"]').length) === 5);
    check('scan video removed afterwards (RAM freed)', await page.evaluate(() => document.querySelectorAll('video').length === 1 && !sceneBusy));
    check('no horizontal scroll with scene list', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));

    // GO and TRIM
    await page.locator('#sceneList .scene').nth(2).getByText('GO').click();
    await page.waitForTimeout(400);
    const t = await page.evaluate(() => video.currentTime);
    check('GO jumps the preview to the scene', Math.abs(t - r.scenes[2][0]) < 0.05, t.toFixed(2));
    await page.locator('#sceneList .scene').nth(3).getByText('TRIM').click();
    const se = [Number(await page.inputValue('#start')), Number(await page.inputValue('#end'))];
    check('TRIM sets Start/End to the scene', se[0] === r.scenes[3][0] && se[1] === r.scenes[3][1], se.join(' – '));
    check('trimmed scene is highlighted', await page.evaluate(() => document.querySelectorAll('#sceneList .scene')[3].classList.contains('active')));

    // Export of the trimmed scene
    await page.click('#export');
    await page.waitForFunction(() => /Export (completed|error)/.test(document.getElementById('status').textContent), null, { timeout: 30000 });
    check('export of a trimmed scene works', (await page.textContent('#status')).startsWith('Export completed'));

    // Sensitivity Low still finds these strong cuts
    const low = await detect(page, 'low');
    check('Low sensitivity finds the strong cuts', cutsOk(low.scenes), JSON.stringify(low.scenes));

    // Busy guard: export and AI are blocked while scanning; cancel works.
    await page.selectOption('#sceneSens', 'normal');
    await page.click('#sceneRun');
    await page.waitForTimeout(150);
    const during = await page.evaluate(() => ({ exp: document.getElementById('export').disabled, ai: document.getElementById('aiRun').disabled, busy: sceneBusy }));
    check('export and AI captions disabled while scanning', during.busy && during.exp && during.ai, JSON.stringify(during));
    await page.click('#sceneCancel');
    await page.waitForFunction(() => /^(Cancelled|Found)/.test(document.getElementById('sceneStatus').textContent), null, { timeout: 30000 });
    check('cancel stops the scan and re-enables buttons', await page.evaluate(() =>
      !sceneBusy && !document.getElementById('sceneRun').disabled && !document.getElementById('export').disabled), await page.textContent('#sceneStatus'));

    // Single continuous shot: no false cuts, even on High.
    await load(page, ONE);
    check('importing a new video clears old scenes', await page.evaluate(() => scenes.length === 0 && document.querySelectorAll('#sceneList .scene').length === 0));
    const one = await detect(page, 'high');
    check('moving single shot: no false cuts (High)', one.scenes.length === 1, one.status);
    await page.close();

    // Fallback when the browser refuses to play the hidden scan video.
    const p2 = await openPage({ noPlay: true });
    await load(p2, SCENES);
    const fb = await detect(p2);
    check('fallback (step by seeking) finds the same cuts', cutsOk(fb.scenes), JSON.stringify(fb.scenes));
    await p2.close();

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
