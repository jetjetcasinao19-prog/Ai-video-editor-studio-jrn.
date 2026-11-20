// Tests subtitle styling: presets, colours, box, position, size, ALL CAPS,
// web fonts (Google Fonts, with offline fallback), saved style, export.
// Run: node tests/caption-style.test.js   (needs ffmpeg, playwright, internet)
const { chromium, devices } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const PAGE = 'file://' + path.resolve(__dirname, '..', 'index.html');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'style-test-'));
const VIDEO = path.join(tmp, 'black.webm');
const SHOTS = process.env.SHOT_DIR || null; // set to save screenshots

let failures = 0;
function check(name, ok, detail) {
  console.log((ok ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? '  (' + detail + ')' : ''));
  if (!ok) failures++;
}

// Plain black video so caption pixels are easy to count.
execFileSync('ffmpeg', ['-loglevel', 'error', '-y',
  '-f', 'lavfi', '-i', 'color=c=black:size=640x360:rate=30:duration=4',
  '-f', 'lavfi', '-i', 'sine=frequency=440:duration=4',
  '-c:v', 'libvpx', '-c:a', 'libopus', '-shortest', VIDEO]);

(async () => {
  const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY, bypass: 'localhost,127.0.0.1' } : undefined;
  const browser = await chromium.launch({ proxy });
  const context = await browser.newContext({ ...devices['Pixel 7'], acceptDownloads: true });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('dialog', d => d.accept());

  // Count pixels matching a colour test in a band of the canvas (fractions of height).
  const count = (kind, y0 = 0, y1 = 1) => page.evaluate(([kind, y0, y1]) => {
    const c = document.getElementById('canvas'), x = c.getContext('2d');
    const top = Math.floor(c.height * y0), hh = Math.max(1, Math.floor(c.height * (y1 - y0)));
    const d = x.getImageData(0, top, c.width, hh).data;
    let n = 0;
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i], g = d[i + 1], b = d[i + 2];
      if (kind === 'white' && r > 230 && g > 230 && b > 230) n++;
      if (kind === 'red' && r > 200 && g < 60 && b < 60) n++;
      if (kind === 'blue' && b > 200 && r < 60 && g < 60) n++;
      if (kind === 'yellow' && r > 220 && g > 200 && b < 80) n++;
      if (kind === 'lit' && (r > 40 || g > 40 || b > 40)) n++;
    }
    return n;
  }, [kind, y0, y1]);
  const setPreset = async v => { await page.selectOption('#capPreset', v); await page.waitForTimeout(150); };
  const setInput = (id, v) => page.evaluate(([id, v]) => {
    const el = document.getElementById(id);
    if (el.type === 'checkbox') el.checked = v; else el.value = v;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, [id, v]);
  const waitFont = () => page.waitForFunction(() => document.getElementById('fontStatus').textContent !== 'Loading font…', null, { timeout: 15000 });

  try {
    await page.goto(PAGE);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.setInputFiles('#file', VIDEO);
    await page.waitForFunction(() => document.getElementById('status').textContent === 'Video ready.');
    await page.evaluate(() => {
      captions = [{ start: 0, end: 4, text: 'Subtitle styling test line' }];
      renderCaptionList(); video.currentTime = 1;
    });
    await page.waitForTimeout(400);
    await page.click('#styleBox summary');
    check('no horizontal scroll with style box open', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));

    // Default = Classic, at the bottom.
    check('default style is Classic', (await page.inputValue('#capPreset')) === 'classic');
    const bottomWhite = await count('white', 0.8, 1);
    check('Classic draws white text at the bottom', bottomWhite > 1000, bottomWhite);

    // Text colour
    await setInput('capColor', '#ff0000');
    const red = await count('red', 0.8, 1);
    check('text colour changes (red)', red > 1000 && (await count('white', 0.8, 1)) < 50, red);
    check('changing a control switches preset to Custom', (await page.inputValue('#capPreset')) === 'custom');

    // Background box
    await setInput('capBox', true); await setInput('capBoxColor', '#0000ff'); await setInput('capBoxOpacity', 100);
    const blue = await count('blue', 0.8, 1);
    check('background box is drawn (blue)', blue > 5000, blue);
    await setInput('capBox', false);
    check('background box can be turned off', (await count('blue', 0.8, 1)) === 0);

    // Position top
    await setPreset('classic');
    await setInput('capPos', 'top');
    const topW = await count('white', 0, 0.25), botW = await count('white', 0.75, 1);
    check('position Top moves caption to the top', topW > 1000 && botW === 0, topW + ' top / ' + botW + ' bottom');
    await setInput('capPos', 'middle');
    check('position Middle', (await count('white', 0.4, 0.6)) > 1000);

    // Offset stays inside the frame
    await setInput('capPos', 'bottom'); await setInput('capOffset', -25);
    check('large downward offset stays inside the frame', (await count('white', 0.9, 1)) > 500);
    await setInput('capOffset', 0);

    // Size
    await setInput('capSize', 50); const small = await count('white');
    await setInput('capSize', 200); const big = await count('white');
    check('size slider changes text size', big > small * 2.5, small + ' -> ' + big);
    await setInput('capSize', 100);

    // ALL CAPS: uppercase text is wider in this font
    const widthOf = () => page.evaluate(() => {
      const c = document.getElementById('canvas'), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
      let minX = c.width, maxX = 0;
      for (let y = 0; y < c.height; y += 2) for (let x = 0; x < c.width; x++) {
        const i = (y * c.width + x) * 4; if (d[i] > 230) { if (x < minX) minX = x; if (x > maxX) maxX = x; }
      }
      return maxX - minX;
    });
    const wLower = await widthOf(); await setInput('capUpper', true); const wUpper = await widthOf();
    check('ALL CAPS makes text uppercase (wider)', wUpper > wLower + 20, wLower + ' -> ' + wUpper);
    await setInput('capUpper', false);

    // Outline 0 removes outline: fewer non-black pixels around text
    await setInput('capColor', '#ffffff');
    await setInput('capOutline', '#ff0000'); await setInput('capOutlineW', 20);
    const outlineRed = await count('red', 0.8, 1);
    await setInput('capOutlineW', 0);
    check('outline colour and thickness work', outlineRed > 1000 && (await count('red', 0.8, 1)) === 0, outlineRed);

    // Every preset draws something; web-font presets load their font.
    for (const p of ['classic', 'box', 'yellow', 'bold', 'creator', 'comic', 'minimal']) {
      await setPreset(p); await waitFont(); await page.waitForTimeout(200);
      const lit = await count('lit');
      const status = await page.textContent('#fontStatus');
      check('preset ' + p + ' draws caption', lit > 1000 && status === '', lit + (status ? ' / ' + status : ''));
      if (SHOTS) await page.locator('#canvas').screenshot({ path: path.join(SHOTS, 'preset-' + p + '.png') });
    }
    check('web fonts loaded (Anton, Montserrat, Bangers)', await page.evaluate(() =>
      document.fonts.check('normal 40px "Anton"') && document.fonts.check('800 40px "Montserrat"') && document.fonts.check('normal 40px "Bangers"')));

    // Saved style survives reload
    await setPreset('comic');
    await page.reload();
    check('style is remembered after reload', (await page.inputValue('#capPreset')) === 'comic' &&
      (await page.evaluate(() => capStyle.font)) === 'bangers');

    // Export with a web-font preset
    await page.setInputFiles('#file', VIDEO);
    await page.waitForFunction(() => document.getElementById('status').textContent === 'Video ready.');
    await page.evaluate(() => { captions = [{ start: 0, end: 4, text: 'Export style test' }]; renderCaptionList(); });
    await page.fill('#end', '2');
    await page.click('#export');
    await page.waitForFunction(() => /Export (completed|error)/.test(document.getElementById('status').textContent), null, { timeout: 30000 });
    const st = await page.textContent('#status');
    check('export with styled captions completes', st.startsWith('Export completed'), st);
    const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#result a')]);
    const out = path.join(tmp, 'out.webm'); await dl.saveAs(out);
    const frame = path.join(tmp, 'frame.png');
    execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-ss', '1', '-i', out, '-frames:v', '1', frame]);
    if (SHOTS) fs.copyFileSync(frame, path.join(SHOTS, 'export-frame.png'));
    // Yellow comic text should be in the exported video.
    const raw = execFileSync('ffmpeg', ['-loglevel', 'error', '-i', frame, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: 64 * 1024 * 1024 });
    let yellow = 0;
    for (let i = 0; i < raw.length; i += 3) if (raw[i] > 200 && raw[i + 1] > 180 && raw[i + 2] < 90) yellow++;
    check('exported video contains the styled (yellow) caption', yellow > 1000, yellow);

    // Offline: web font cannot load -> clear message, standard font used, still draws.
    const ctx2 = await browser.newContext({ ...devices['Pixel 7'] });
    const p2 = await ctx2.newPage();
    await ctx2.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await p2.goto(PAGE);
    await p2.click('#styleBox summary');
    await p2.selectOption('#capPreset', 'bold');
    await p2.waitForFunction(() => document.getElementById('fontStatus').textContent !== 'Loading font…', null, { timeout: 15000 });
    const offline = await p2.textContent('#fontStatus');
    check('offline: clear message and standard font fallback', /could not load/.test(offline), offline);
    await ctx2.close();

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
