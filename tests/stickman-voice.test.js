// Tests the REAL AI narration voice in the Stickman Director (Kokoro, in the
// browser). Needs internet: downloads the ~92 MB voice model on first run.
// Run: node tests/stickman-voice.test.js   (needs playwright, ffmpeg)
const { chromium } = require('playwright');
const { spawnSync } = require('child_process');
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
  const ctx = await browser.newContext({ acceptDownloads: true, viewport: { width: 412, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(PAGE);
  await page.fill('#script', '1 wave: Every legend has a beginning.\n1 idea: This is how it started.');
  await page.selectOption('#voiceMode', 'ai');
  await page.selectOption('#voice', 'am_michael');
  const t0 = Date.now();
  await page.click('#voiceBtn');
  await page.waitForFunction(() => /All 2 lines voiced|Voice failed/.test(document.getElementById('voiceMsg').textContent), null, { timeout: 600000 });
  const msg = await page.textContent('#voiceMsg');
  check('AI voice made both lines', /All 2 lines voiced/.test(msg), msg + ', ' + Math.round((Date.now() - t0) / 1000) + ' s');
  const info = await page.evaluate(() => Stickman.plan().shots.map(s => ({ dur: s.dur, voice: s.voice && s.voice.dur })));
  check('voice lengths are sensible (0.8–6 s per line)', info.every(s => s.voice > 0.8 && s.voice < 6), JSON.stringify(info));
  check('shots stretched to fit the voice', info.every(s => s.dur >= s.voice + 0.6), JSON.stringify(info));

  const dl = page.waitForEvent('download');
  await page.click('#wavBtn');
  const wav = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'kokoro-')), 'narration.wav');
  await (await dl).saveAs(wav);
  const vol = spawnSync('ffmpeg', ['-hide_banner', '-i', wav, '-af', 'volumedetect', '-f', 'null', '-']).stderr.toString();
  const m = /mean_volume: (-?[\d.]+) dB/.exec(vol);
  check('narration WAV has speech', m && parseFloat(m[1]) > -40, m ? 'mean ' + m[1] + ' dB' : 'no volume');
  if (process.env.KEEP_WAV) { fs.copyFileSync(wav, process.env.KEEP_WAV); console.log('saved ' + process.env.KEEP_WAV); }

  check('no page errors', errors.length === 0, errors.join(' | '));
  await browser.close();
  console.log(failures ? failures + ' FAILED' : 'ALL PASSED');
  process.exit(failures ? 1 : 0);
})();
