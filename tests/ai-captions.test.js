// End-to-end test of AI automatic captions (real Whisper model, real speech).
// Needs: ffmpeg built with flite (speech synthesis), playwright, internet.
// Run: node tests/ai-captions.test.js
const { chromium, devices } = require('playwright');
const { execFileSync } = require('child_process');
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-test-'));
const SPEECH = path.join(tmp, 'speech.wav');
const VIDEO = path.join(tmp, 'speech.mp4');
const SILENT = path.join(tmp, 'nosound.mp4');
const SENTENCE = 'Welcome to my video studio. Today I will show you how to edit videos on your phone. It is fast and easy. Thank you for watching.';

let failures = 0;
function check(name, ok, detail) {
  console.log((ok ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? '  (' + detail + ')' : ''));
  if (!ok) failures++;
}

// Speech starts at 1.5 s, stereo AAC in MP4 like a phone recording.
execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'lavfi', '-i', `flite=text='${SENTENCE}':voice=slt`, SPEECH]);
execFileSync('ffmpeg', ['-loglevel', 'error', '-y',
  '-f', 'lavfi', '-i', 'testsrc=size=640x360:rate=30:duration=10', '-i', SPEECH,
  '-filter_complex', '[1]aresample=44100,aformat=channel_layouts=stereo,adelay=1500|1500,apad[a]',
  '-map', '0:v', '-map', '[a]', '-t', '10', '-c:v', 'libx264', '-preset', 'ultrafast', '-pix_fmt', 'yuv420p', '-c:a', 'aac', VIDEO]);
execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'lavfi', '-i', 'testsrc=size=320x240:rate=30:duration=3',
  '-c:v', 'libx264', '-preset', 'ultrafast', '-pix_fmt', 'yuv420p', SILENT]);

// Small static server so the page also runs like on GitHub Pages (http).
const server = http.createServer((req, res) => {
  const file = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': file.endsWith('.html') ? 'text/html' : 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});

const words = s => s.toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(Boolean);
function wordAccuracy(text) {
  const want = words(SENTENCE), got = new Set(words(text));
  return want.filter(w => got.has(w)).length / want.length;
}

(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;
  const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY, bypass: 'localhost,127.0.0.1' } : undefined;
  // MP4/H.264 needs real Google Chrome (like Android Chrome); open-source
  // Chromium cannot play it. CI sets PW_CHANNEL=chrome.
  const browser = await chromium.launch({ proxy, channel: process.env.PW_CHANNEL || undefined });

  async function run(label, url) {
    const page = await (await browser.newContext({ ...devices['Pixel 7'] })).newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('dialog', d => d.accept());
    const status = () => page.textContent('#aiStatus');
    const waitAI = () => page.waitForFunction(
      () => /^(Done|AI captions failed|No speech|Cancelled)/.test(document.getElementById('aiStatus').textContent),
      null, { timeout: 240000 });
    const load = async f => {
      await page.setInputFiles('#file', f);
      await page.waitForFunction(() => document.getElementById('status').textContent === 'Video ready.');
    };

    await page.goto(url);
    check(label + ': AI button disabled before a video is loaded', await page.isDisabled('#aiRun'));

    await load(VIDEO);
    await page.click('#aiRun');
    await waitAI();
    const st = await status();
    check(label + ': transcription finishes', st.startsWith('Done'), st);
    const caps = await page.evaluate(() => captions);
    const text = caps.map(c => c.text).join(' ');
    const acc = wordAccuracy(text);
    check(label + ': at least 80% of spoken words recognised', acc >= 0.8, Math.round(acc * 100) + '% "' + text + '"');
    check(label + ': first caption starts near the speech (1.5 s)', caps.length && Math.abs(caps[0].start - 1.5) < 0.6, caps[0] && caps[0].start);
    check(label + ': captions in order and inside the video', caps.every((c, i) => c.end > c.start && c.end <= 10.01 && (i === 0 || c.start >= caps[i - 1].start)));
    check(label + ': caption lines are short enough for a phone', caps.every(c => c.text.length <= 48), Math.max(...caps.map(c => c.text.length)));
    check(label + ': worker closed afterwards (RAM freed)', await page.evaluate(() => aiWorker === null && !aiBusy));

    if (label === 'website') {
      await page.fill('#start', '0'); await page.fill('#end', '9.5');
      await page.click('#aiRun'); await page.waitForTimeout(300); await page.click('#aiCancel'); await waitAI();
      check(label + ': cancel works', (await status()) === 'Cancelled.' && await page.evaluate(() => aiWorker === null && !aiBusy && !aiRun.disabled));

      await load(SILENT);
      await page.click('#aiRun'); await waitAI();
      check(label + ': video without sound shows a clear error', /no sound track/.test(await status()), await status());
    }
    check(label + ': no JavaScript errors', errors.length === 0, errors.join(' | '));
    await page.close();
  }

  try {
    await run('website', `http://127.0.0.1:${port}/index.html`);
    await run('phone file', 'file://' + path.join(ROOT, 'index.html'));
  } catch (e) {
    check('test run', false, e.message);
  } finally {
    await browser.close();
    server.close();
    fs.rmSync(tmp, { recursive: true, force: true });
  }
  console.log(failures ? '\n' + failures + ' check(s) FAILED' : '\nAll checks passed');
  process.exit(failures ? 1 : 0);
})();
