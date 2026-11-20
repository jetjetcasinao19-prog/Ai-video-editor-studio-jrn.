// Tests "Send to CapCut": after an export, the video is handed to the
// Android share sheet (Web Share API) so the owner can pick CapCut.
// Run: node tests/capcut.test.js   (needs ffmpeg and playwright)
// The share sheet itself is mocked: a headless browser has no CapCut app.
const { chromium, devices } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const PAGE = 'file://' + path.resolve(__dirname, '..', 'index.html');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'capcut-test-'));
const VIDEO = path.join(tmp, 'clip.webm');
execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'lavfi', '-i', 'color=c=green:size=320x180:rate=30:duration=2',
  '-f', 'lavfi', '-i', 'sine=frequency=440:duration=2', '-c:v', 'libvpx', '-deadline', 'realtime', '-cpu-used', '8',
  '-c:a', 'libopus', '-shortest', VIDEO]);

let failures = 0;
function check(name, ok, detail) {
  console.log((ok ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? '  (' + detail + ')' : ''));
  if (!ok) failures++;
}

// mode: 'ok' (share works), 'cancel' (owner closes the sheet), 'none' (no file sharing)
const mockShare = mode => {
  window.__shared = null;
  if (mode === 'none') { delete Navigator.prototype.share; delete Navigator.prototype.canShare; return; }
  navigator.canShare = d => !!(d && d.files && d.files.length);
  navigator.share = async d => {
    window.__shared = { n: d.files.length, name: d.files[0].name, type: d.files[0].type, size: d.files[0].size };
    if (mode === 'cancel') throw new DOMException('cancelled', 'AbortError');
  };
};

(async () => {
  const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || undefined, args: ['--autoplay-policy=no-user-gesture-required'] });
  const errors = [];
  const run = async mode => {
    const ctx = await browser.newContext({ ...devices['Pixel 7'] });
    const page = await ctx.newPage();
    page.on('pageerror', e => errors.push(e.message));
    page.on('dialog', d => d.accept());
    await page.addInitScript(mockShare, mode);
    await page.goto(PAGE);
    await page.setInputFiles('#file', VIDEO);
    await page.waitForFunction(() => document.getElementById('status').textContent === 'Video ready.');
    check(mode + ': no CapCut button before export', (await page.$('#sendCapcut')) === null);
    await page.click('#export');
    await page.waitForFunction(() => /Export (completed|error)/.test(document.getElementById('status').textContent), null, { timeout: 60000 });
    check(mode + ': export completed', (await page.textContent('#status')).startsWith('Export completed'), await page.textContent('#status'));
    return { ctx, page };
  };

  try {
    // 1. Share works: CapCut gets the exported video file.
    let { ctx, page } = await run('ok');
    check('SEND TO CAPCUT button shown', await page.isVisible('#sendCapcut'));
    check('download link still first in result', /^DOWNLOAD YOUR VIDEO/.test(await page.textContent('#result a')));
    const href = await page.getAttribute('#openCapcut', 'href');
    check('Android gets an intent link to the CapCut app', href.startsWith('intent://') && href.includes('package=com.lemon.lvoverseas') &&
      href.includes('browser_fallback_url=' + encodeURIComponent('https://play.google.com/store/apps/details?id=com.lemon.lvoverseas')), href);
    const blobSize = await page.evaluate(async () => (await fetch(exportURL)).blob().then(b => b.size));
    await page.click('#sendCapcut');
    await page.waitForFunction(() => window.__shared);
    const s = await page.evaluate(() => window.__shared);
    const ext = s.name.split('.').pop();
    check('one file is shared', s.n === 1, s.n);
    check('file named edited-video.<ext>', /^edited-video\.(mp4|webm)$/.test(s.name), s.name);
    check('file type is a plain video type', s.type === 'video/' + ext, s.type);
    check('shared file is the whole export', s.size === blobSize && s.size > 1000, s.size + ' / ' + blobSize);
    await page.waitForFunction(() => /Sent/.test(document.getElementById('capcutNote').textContent));
    check('note confirms it was sent', true);
    await ctx.close();

    // 2. Owner cancels the share sheet.
    ({ ctx, page } = await run('cancel'));
    await page.click('#sendCapcut');
    await page.waitForFunction(() => /cancelled/.test(document.getElementById('capcutNote').textContent));
    check('cancel shows a retry note', true);
    await ctx.close();

    // 3. Browser cannot share files: clear fallback instructions.
    ({ ctx, page } = await run('none'));
    await page.click('#sendCapcut');
    await page.waitForFunction(() => /cannot send files/.test(document.getElementById('capcutNote').textContent));
    check('no-share browser explains download + open CapCut', true);
    await page.setViewportSize({ width: 360, height: 800 });
    const sideways = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    check('no sideways scrolling at 360px', !sideways);
    await ctx.close();

    check('no page errors', errors.length === 0, errors.join(' | '));
  } catch (e) {
    console.log('FAIL test crashed: ' + e.message);
    failures++;
  } finally {
    await browser.close();
    fs.rmSync(tmp, { recursive: true, force: true });
  }
  console.log(failures ? failures + ' test(s) failed' : 'All CapCut tests passed');
  process.exit(failures ? 1 : 0);
})();
