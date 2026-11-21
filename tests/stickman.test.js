// Tests the Stickman Director page (stickman.html): script parsing, the
// offline "Direct my story" rules, animation frames and video export.
// Run: node tests/stickman.test.js   (needs playwright; ffprobe optional)
const { chromium, devices } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const PAGE = 'file://' + path.resolve(__dirname, '..', 'stickman.html');
let failures = 0;
function check(name, ok, detail) {
  console.log((ok ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? '  (' + detail + ')' : ''));
  if (!ok) failures++;
}

(async () => {
  const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || undefined });
  const ctx = await browser.newContext({ ...devices['Pixel 7'], acceptDownloads: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(PAGE);

  // 1. parsing
  const parsed = await page.evaluate(() => Stickman.parseScript(
    '// note\n3 wave: Hi there\n2.5s walk - Going home\nidea: Bright!\nJust a sentence.\njump\nflyy: oops\n'));
  check('parses 6 shots (comment skipped)', parsed.shots.length === 6, parsed.shots.length);
  check('explicit seconds', parsed.shots[0].dur === 3 && parsed.shots[1].dur === 2.5);
  check('action + text', parsed.shots[1].action === 'walk' && parsed.shots[1].text === 'Going home');
  check('plain sentence becomes talk', parsed.shots[3].action === 'talk' && parsed.shots[3].text === 'Just a sentence.');
  check('action without text', parsed.shots[4].action === 'jump' && parsed.shots[4].text === '');
  check('unknown action warns', parsed.warnings.length === 1 && parsed.shots[5].action === 'talk', parsed.warnings[0]);
  check('start times add up', Math.abs(parsed.shots[2].start - 5.5) < 1e-9 && parsed.total > 5.5);

  // 2. director
  const directed = await page.evaluate(() => Stickman.directStory(
    'Long ago, a young inventor walked into his workshop. He wondered how to make light without fire. Then he had an idea! His first ten tries failed. But in 1879 the light bulb finally worked.'));
  const acts = directed.split('\n').map(l => l.split(':')[0]);
  check('director: one line per sentence (+ outro)', acts.length === 6, acts.join(','));
  check('director picks fitting actions', acts.slice(0, 5).join(',') === 'walk,think,idea,fall,celebrate', acts.join(','));
  check('director output parses cleanly', await page.evaluate(s => Stickman.parseScript(s).warnings.length === 0, directed));

  // 3. UI: director button fills script
  await page.fill('#story', 'She ran to the station. Nobody knows why.');
  await page.click('#directBtn');
  const scriptVal = await page.inputValue('#script');
  check('Direct my story fills the script', /^run: She ran/.test(scriptVal) && /shrug: Nobody knows/.test(scriptVal), scriptVal);

  // 4. every action renders and animates
  const anim = await page.evaluate(() => {
    const c = document.createElement('canvas'); c.width = 360; c.height = 640;
    const x = c.getContext('2d');
    const out = {};
    for (const a of Object.keys(Stickman.ACTIONS)) {
      const plan = Stickman.parseScript('4 ' + a + ': Hello world');
      Stickman.planPositions(plan.shots);
      const o = { scene: 'brand', stickColor: '#ffffff', accent: '#f5c400', handle: '', capSize: 1 };
      Stickman.renderFrame(x, plan, 0.3, o); const d1 = x.getImageData(0, 0, 360, 640).data;
      Stickman.renderFrame(x, plan, 1.7, o); const d2 = x.getImageData(0, 0, 360, 640).data;
      let lit = 0, diff = 0;
      for (let i = 0; i < d2.length; i += 4) { if (d2[i] > 128) lit++; if (Math.abs(d1[i] - d2[i]) > 40) diff++; }
      out[a] = { lit, diff };
    }
    return out;
  });
  for (const [a, r] of Object.entries(anim)) {
    check('renders "' + a + '"', r.lit > 300, r.lit + ' bright px');
    if (a !== 'title' && a !== 'sad' && a !== 'think' && a !== 'sit') check('animates "' + a + '"', r.diff > 50, r.diff + ' changed px');
  }

  // 5. formats change canvas size
  await page.selectOption('#format', '16:9');
  check('16:9 canvas', await page.evaluate(() => document.getElementById('cv').width === 1280 && document.getElementById('cv').height === 720));
  await page.selectOption('#format', '9:16');

  // 6. playback
  await page.click('#restartBtn');
  await page.click('#playBtn');
  await page.waitForTimeout(800);
  const pos = await page.evaluate(() => parseFloat(document.getElementById('seek').value));
  check('preview plays', pos > 0.3, pos);
  await page.click('#playBtn');

  // 7. no sideways scroll at 360px
  await page.setViewportSize({ width: 360, height: 740 });
  const sw = await page.evaluate(() => document.documentElement.scrollWidth);
  check('no sideways scrolling at 360px', sw <= 360, sw);

  // 8. export a short video
  await page.fill('#script', '1.2 wave: Hi\n1.2 walk: Bye');
  await page.click('#exportBtn');
  await page.waitForFunction(() => window.__lastExport, null, { timeout: 20000 });
  const ex = await page.evaluate(() => window.__lastExport);
  check('export produced a video', !ex.error && ex.size > 5000, JSON.stringify(ex));
  if (!ex.error) {
    const dl = page.waitForEvent('download');
    await page.click('#dlLink button');
    const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'stick-')), 'out.' + ex.ext);
    await (await dl).saveAs(file);
    try {
      const info = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-count_frames',
        '-show_entries', 'stream=width,height,nb_read_frames', '-of', 'csv=p=0', file]).toString().trim();
      const [w, h, n] = info.split(',').map(Number);
      check('exported video is 720x1280 with frames', w === 720 && h === 1280 && n > 20, info);
    } catch (e) { console.log('SKIP ffprobe check (' + e.message.split('\n')[0] + ')'); }
  }

  check('no page errors', errors.length === 0, errors.join(' | '));
  await browser.close();
  console.log(failures ? failures + ' FAILED' : 'ALL PASSED');
  process.exit(failures ? 1 : 0);
})();
