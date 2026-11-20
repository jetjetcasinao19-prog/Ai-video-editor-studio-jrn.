// Automated test for index.html in a phone-sized Chromium.
// Run: node tests/editor.test.js   (needs ffmpeg and playwright)
const { chromium, devices } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const PAGE = path.resolve(__dirname, '..', 'index.html');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'editor-test-'));
const VIDEO = path.join(tmp, 'test.webm');
const SRT = path.join(tmp, 'test.srt');

let failures = 0;
function check(name, ok, detail) {
  console.log((ok ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? '  (' + detail + ')' : ''));
  if (!ok) failures++;
}

execFileSync('ffmpeg', ['-loglevel', 'error', '-y',
  '-f', 'lavfi', '-i', 'testsrc=size=640x360:rate=30:duration=6',
  '-f', 'lavfi', '-i', 'sine=frequency=440:duration=6',
  '-c:v', 'libvpx', '-c:a', 'libopus', '-shortest', VIDEO]);
fs.writeFileSync(SRT,
  '1\n00:00:00,500 --> 00:00:02,500\nHello <i>world</i>\n\n' +
  '2\n00:00:03,000 --> 00:00:05,000\nA long second caption that should wrap onto more than one line\n');

(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const context = await browser.newContext({ ...devices['Pixel 7'], acceptDownloads: true });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('dialog', d => d.accept());

  try {
    await page.goto('file://' + PAGE);
    check('no horizontal scroll at phone width',
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));

    await page.setInputFiles('#file', VIDEO);
    await page.waitForFunction(() => document.getElementById('status').textContent === 'Video ready.');
    check('video loads', true);
    check('export enabled after load', !(await page.isDisabled('#export')));

    // Captions import
    await page.setInputFiles('#capFile', SRT);
    await page.waitForFunction(() => captions.length === 2);
    const caps = await page.evaluate(() => captions);
    check('SRT import parses 2 captions', caps.length === 2);
    check('SRT tags stripped', caps[0].text === 'Hello world', caps[0].text);

    // Caption drawn on canvas
    const whitePixels = () => page.evaluate(() => {
      const c = document.getElementById('canvas');
      const d = c.getContext('2d').getImageData(0, Math.floor(c.height * 0.6), c.width, Math.floor(c.height * 0.35)).data;
      let n = 0; for (let i = 0; i < d.length; i += 4) if (d[i] > 250 && d[i + 1] > 250 && d[i + 2] > 250) n++;
      return n;
    });
    await page.selectOption('#fit', 'contain');
    await page.evaluate(() => { video.currentTime = 4; });
    await page.waitForTimeout(500);
    const on = await whitePixels();
    await page.uncheck('#showCaptions');
    const off = await whitePixels();
    await page.check('#showCaptions');
    check('caption is drawn and can be hidden', on > off + 1000, on + ' vs ' + off);

    // Manual caption
    await page.evaluate(() => { video.currentTime = 5.5; });
    await page.waitForTimeout(300);
    await page.click('#addCap');
    await page.keyboard.type('Manual caption');
    const last = await page.evaluate(() => captions[captions.length - 1]);
    check('manual caption added at current time', last.start === 5.5 && last.text === 'Manual caption', JSON.stringify(last));

    // SRT download
    const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#downloadSrt')]);
    const srt = fs.readFileSync(await dl.path(), 'utf8');
    check('SRT download has 3 entries', (srt.match(/-->/g) || []).length === 3);
    check('SRT timestamps formatted', srt.includes('00:00:05,500 --> 00:00:06,000'));

    // Preview stops at end time
    await page.fill('#end', '1.5');
    await page.evaluate(() => { video.currentTime = 0; });
    await page.click('#play');
    await page.waitForTimeout(2500);
    const [paused, t] = await page.evaluate(() => [video.paused, video.currentTime]);
    check('preview stops at End Time', paused && t < 2, t.toFixed(2));

    // Export
    await page.fill('#overlay', 'My Title');
    await page.fill('#end', '3');
    await page.click('#export');
    await page.waitForFunction(() => /Export (completed|error)/.test(document.getElementById('status').textContent), null, { timeout: 30000 });
    const status = await page.textContent('#status');
    check('export completes', status.startsWith('Export completed'), status);
    const [dl2] = await Promise.all([page.waitForEvent('download'), page.click('#result a')]);
    const out = path.join(tmp, 'out.webm');
    await dl2.saveAs(out);
    const streams = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_type', '-of', 'csv=p=0', out]).toString();
    check('exported file has video', streams.includes('video'));
    check('exported file has audio', streams.includes('audio'));

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
