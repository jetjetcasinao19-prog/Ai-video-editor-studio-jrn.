// Tests the AI assistant: remove silences, highlight reel, title ideas.
// Run: node tests/assistant.test.js   (needs ffmpeg and playwright)
const { chromium, devices } = require('playwright');
const { execFileSync, spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const PAGE = 'file://' + path.resolve(__dirname, '..', 'index.html');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'assist-test-'));
const TALK = path.join(tmp, 'talk.webm');      // sound at 0.5-2.0, 4.0-5.0, 5.5-7.0 s (+ low noise), 9 s
const SCENES = path.join(tmp, 'scenes.webm');  // 6 colour scenes x 3 s; scenes 2 and 5 loud

let failures = 0;
function check(name, ok, detail) {
  console.log((ok ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? '  (' + detail + ')' : ''));
  if (!ok) failures++;
}
const ff = args => execFileSync('ffmpeg', ['-loglevel', 'error', '-y', ...args], { maxBuffer: 256 * 1024 * 1024 });
const enc = ['-c:v', 'libvpx', '-deadline', 'realtime', '-cpu-used', '8', '-b:v', '300k', '-c:a', 'libopus', '-b:a', '96k'];

ff(['-f', 'lavfi', '-i', 'testsrc=size=320x180:rate=30:duration=9',
  '-f', 'lavfi', '-i', "sine=frequency=440:duration=9,volume='0.5*(between(t,0.5,2)+between(t,4,5)+between(t,5.5,7))':eval=frame",
  '-f', 'lavfi', '-i', 'anoisesrc=amplitude=0.012:duration=9:seed=1',
  '-filter_complex', '[1][2]amix=inputs=2:normalize=0[a]', '-map', '0:v', '-map', '[a]', ...enc, TALK]);

const colors = ['red', 'blue', 'lime', 'yellow', 'cyan', 'magenta'];
const vIn = colors.flatMap(c => ['-f', 'lavfi', '-i', `color=c=${c}:size=320x180:rate=30:duration=3`]);
const aIn = colors.flatMap((c, i) => ['-f', 'lavfi', '-i', `sine=frequency=440:duration=3,volume=${i === 1 || i === 4 ? 0.9 : 0.05}`]);
const cat = colors.map((c, i) => `[${i}:v][${i + 6}:a]`).join('') + 'concat=n=6:v=1:a=1[v][a]';
ff([...vIn, ...aIn, '-filter_complex', cat, '-map', '[v]', '-map', '[a]', ...enc, SCENES]);

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
  const run = async (btn, done) => {
    await page.click(btn);
    await page.waitForFunction(re => new RegExp(re).test(document.getElementById('assistStatus').textContent),
      done, { timeout: 120000 });
    return page.textContent('#assistStatus');
  };
  const clips = () => page.evaluate(() => timeline.map(c => [c.start, c.end]));
  const near = (a, b, tol = 0.12) => Math.abs(a - b) <= tol;

  try {
    await page.goto(PAGE);
    check('assistant buttons disabled before a video is loaded',
      await page.isDisabled('#assistSilence') && await page.isDisabled('#assistHighlight'));
    await load(TALK);
    check('no horizontal scroll with the assistant', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));

    // Remove silences (Normal, 0.6 s). Analysis slowed down so the busy state can be seen.
    await page.evaluate(() => { const orig = window.extractAudio; window.extractAudio = async (...a) => { await new Promise(r => setTimeout(r, 400)); return orig(...a); }; });
    await page.click('#assistSilence');
    await page.waitForTimeout(50);
    const during = await page.evaluate(() => ({ exp: document.getElementById('export').disabled, busy }));
    await page.waitForFunction(() => /^(Kept|No |Everything|Could not|Set a)/.test(document.getElementById('assistStatus').textContent), null, { timeout: 60000 });
    const st1 = await page.textContent('#assistStatus');
    const c1 = await clips();
    check('export blocked while the assistant works', during.exp && during.busy, JSON.stringify(during));
    check('silences removed: 2 parts with sound', c1.length === 2, st1);
    check('part boundaries match the sound (0.38–2.12, 3.88–7.12)',
      c1.length === 2 && near(c1[0][0], 0.38) && near(c1[0][1], 2.12) && near(c1[1][0], 3.88) && near(c1[1][1], 7.12), JSON.stringify(c1));
    check('short 0.5 s pause kept (shorter than 0.6 s)', c1.length === 2);
    check('clips use Cut transitions', await page.evaluate(() => timeline.every(c => c.trans === 'cut')));
    check('report says how much was removed', /removed [\d.]+ s of pauses/.test(st1));

    // Export the silence-free timeline: length ≈ 5.0 s, no long silent gap.
    await page.click('#export');
    await page.waitForFunction(() => /Export (completed|error)/.test(document.getElementById('status').textContent), null, { timeout: 60000 });
    const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#result a')]);
    const out = path.join(tmp, 'nosilence.webm'); await dl.saveAs(out);
    const raw = ff(['-i', out, '-vn', '-af', 'pan=mono|c0=c0', '-ar', '8000', '-f', 'f32le', '-']);
    const pcm = new Float32Array(raw.buffer, raw.byteOffset, raw.length / 4);
    const secs = pcm.length / 8000;
    let quietRun = 0, longest = 0;
    for (let i = 0; i + 400 <= pcm.length; i += 400) {
      let s = 0; for (let j = i; j < i + 400; j++) s += pcm[j] * pcm[j];
      if (Math.sqrt(s / 400) < 0.02) /* tone ≈ 0.044 rms, noise ≈ 0.007 */ { quietRun += 0.05; longest = Math.max(longest, quietRun); } else quietRun = 0;
    }
    check('exported video ≈ 5.0 s long (9 s minus pauses)', Math.abs(secs - 5.0) < 0.5, secs.toFixed(2) + ' s');
    // The 0.5 s pause is kept on purpose (shorter than the 0.6 s setting); nothing longer may remain.
    check('no pause longer than the 0.6 s setting left in the export', longest <= 0.6, longest.toFixed(2) + ' s longest quiet stretch');

    // Shortest pause 0.3 s also cuts the 0.5 s pause.
    await page.evaluate(() => { const el = document.getElementById('assistGap'); el.value = 0.3; el.dispatchEvent(new Event('input')); });
    await run('#assistSilence', '^(Kept|No |Everything|Could not)');
    check('shortest pause 0.3 s: 3 parts', (await clips()).length === 3, JSON.stringify(await clips()));
    check('slider label updates', (await page.textContent('#assistGapVal')) === '0.3');

    // Gentle keeps at least as much as Normal.
    await page.evaluate(() => { const el = document.getElementById('assistGap'); el.value = 0.6; el.dispatchEvent(new Event('input')); });
    const keptOf = s => Number((s.match(/: ([\d.]+) s of/) || [])[1] || 9);
    const normalKept = keptOf(st1);
    await page.selectOption('#assistLevel', 'gentle');
    const stG = await run('#assistSilence', '^(Kept|No |Everything|Could not)');
    check('Gentle cuts less than Normal (low background noise counts as sound)', keptOf(stG) >= normalKept, stG.slice(0, 60));
    await page.selectOption('#assistLevel', 'normal');

    // Highlight reel: scenes 2 and 5 are the loud ones.
    await load(SCENES);
    check('new video clears the timeline', (await clips()).length === 0);
    await page.selectOption('#tlType', 'cut');
    await page.evaluate(() => { const el = document.getElementById('assistTarget'); el.value = 6; el.dispatchEvent(new Event('input')); });
    const stH = await run('#assistHighlight', '^(Highlight reel|Could not|Scene detection|The video)');
    const c2 = await clips();
    check('highlight runs scene detection automatically', await page.evaluate(() => scenes.length) === 6, stH);
    check('highlight picks the two loud scenes (2 and 5)',
      c2.length === 2 && near(c2[0][0], 3, 0.06) && near(c2[0][1], 6, 0.06) && near(c2[1][0], 12, 0.06) && near(c2[1][1], 15, 0.06), JSON.stringify(c2));
    check('report names the scenes', /scenes 2, 5/.test(stH), stH);

    await page.selectOption('#tlType', 'fade');
    await page.evaluate(() => { const el = document.getElementById('assistTarget'); el.value = 10; el.dispatchEvent(new Event('input')); });
    await run('#assistHighlight', '^(Highlight reel|Could not)');
    const c3 = await clips();
    const len3 = await page.evaluate(() => timelineLength());
    check('10 s target: includes both loud scenes, in order, ≈ 10 s',
      c3.some(c => near(c[0], 3, 0.06)) && c3.some(c => near(c[0], 12, 0.06)) && c3.every((c, i) => i === 0 || c[0] >= c3[i - 1][0]) && len3 <= 10.6 && len3 >= 8,
      JSON.stringify(c3) + ' = ' + len3.toFixed(1) + ' s');
    check('highlight clips have thumbnails and the chosen transition', await page.evaluate(() => timeline.every(c => c.thumb && c.trans === 'fade')));

    // Title ideas
    await page.evaluate(() => { captions = []; renderCaptionList(); });
    await page.click('#assistTitles');
    check('no captions: asks for captions first', (await page.textContent('#assistStatus')).startsWith('Add captions first'));
    await page.evaluate(() => {
      captions = [
        { start: 0, end: 2, text: 'Welcome to my channel.' },
        { start: 2, end: 5, text: 'Today I will show you how to edit videos on your phone.' },
        { start: 5, end: 8, text: 'Editing videos on your phone is fast and easy.' }];
      renderCaptionList();
    });
    await page.click('#assistTitles');
    const ideas = await page.$$eval('#assistTitleList button', b => b.map(x => x.textContent));
    check('title ideas suggested (up to 3)', ideas.length >= 2 && ideas.length <= 3, JSON.stringify(ideas));
    check('a "How to …" idea from the captions', ideas.some(t => /^How to edit videos on your phone$/i.test(t)), JSON.stringify(ideas));
    check('a keyword idea (videos, phone)', ideas.some(t => /Videos/.test(t) && /Phone/.test(t)), JSON.stringify(ideas));
    await page.locator('#assistTitleList button').first().click();
    check('tapping an idea sets the video title', (await page.inputValue('#overlay')) === ideas[0]);

    await page.evaluate(() => { captions = [{ start: 0, end: 3, text: 'Ang ganda ng video na ito. Ang ganda ng dagat sa probinsya.' }]; renderCaptionList(); });
    await page.click('#assistTitles');
    const tl = await page.$$eval('#assistTitleList button', b => b.map(x => x.textContent));
    check('Tagalog filler words are ignored in keyword ideas', tl.some(t => /Ganda/.test(t)) && !tl.some(t => /\b(Ang|Ng|Na|Ito)\b/.test(t.split(':')[0]) && t.includes('·')), JSON.stringify(tl));

    // Video without sound
    const silent = path.join(tmp, 'silent.webm');
    ff(['-f', 'lavfi', '-i', 'testsrc=size=320x180:rate=30:duration=3', '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=mono', '-t', '3', ...enc, silent]);
    await load(silent);
    const stS = await run('#assistSilence', '^(Kept|No |Everything|Could not)');
    check('silent video: clear message, timeline unchanged', /^No sound found/.test(stS) && (await clips()).length === 0, stS);

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
