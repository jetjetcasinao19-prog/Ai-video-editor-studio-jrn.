// Tests the Stickman Director page (stickman.html): script parsing, the
// offline "Direct my story" rules, animation frames and video export.
// Run: node tests/stickman.test.js   (needs playwright; ffprobe optional)
const { chromium, devices } = require('playwright');
const { execFileSync, spawnSync } = require('child_process');
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

  // 9. both characters draw
  const styles = await page.evaluate(() => {
    const c = document.createElement('canvas'); c.width = 360; c.height = 640; const x = c.getContext('2d');
    const plan = Stickman.parseScript('3 wave: Hi'); Stickman.planPositions(plan.shots);
    const res = {};
    for (const style of ['signature', 'classic']) {
      Stickman.renderFrame(x, plan, 1, { scene: 'brand', stickColor: '#ffffff', accent: '#f5c400', handle: '', capSize: 1, style });
      const d = x.getImageData(0, 0, 360, 520).data; let gold = 0, white = 0;
      for (let i = 0; i < d.length; i += 4) { if (d[i] > 200 && d[i + 1] > 150 && d[i + 2] < 60) gold++; if (d[i] > 220 && d[i + 1] > 220 && d[i + 2] > 220) white++; }
      res[style] = { gold, white };
    }
    return res;
  });
  check('signature character has a gold scarf', styles.signature.gold > 150, styles.signature.gold);
  check('classic character still available', styles.classic.white > 300 && styles.classic.gold < 20, JSON.stringify(styles.classic));

  // 10. narration timing, WAV and audio in the export (fake voice clip, no download)
  await page.selectOption('#voiceMode', 'ai');
  await page.fill('#script', '1 wave: Hello world\n1 jump');
  const missing = await page.textContent('#voiceMsg');
  check('voice: says lines are missing', /0 of 1 lines voiced/.test(missing), missing);
  const timing = await page.evaluate(() => {
    const rate = 24000, n = rate * 2, a = new Float32Array(n + rate / 2);
    for (let i = 0; i < n; i++) a[i + rate / 4] = 0.4 * Math.sin(2 * Math.PI * 220 * i / rate);
    Stickman.addVoiceClip('Hello world', a, rate); Stickman.rebuild();
    const p = Stickman.plan(); return { d0: p.shots[0].dur, s1: p.shots[1].start, voiced: !!p.shots[0].voice, msg: document.getElementById('voiceMsg').textContent };
  });
  check('voice: silence trimmed, shot stretched to fit', timing.voiced && timing.d0 > 2.5 && timing.d0 < 2.9, JSON.stringify(timing));
  check('voice: next shot starts after the voice', Math.abs(timing.s1 - timing.d0) < 1e-9);
  check('voice: all lines voiced message', /All 1 lines voiced/.test(timing.msg), timing.msg);
  const wav = await page.evaluate(async () => { const b = Stickman.narrationWav(); const v = new DataView(await b.arrayBuffer()); return { size: b.size, rate: v.getUint32(24, true) }; });
  check('voice: WAV voice-over', wav.rate === 24000 && wav.size > 24000 * 2 * 3, JSON.stringify(wav));
  await page.evaluate(() => { window.__lastExport = null; });
  await page.click('#exportBtn');
  await page.waitForFunction(() => window.__lastExport, null, { timeout: 30000 });
  const ex2 = await page.evaluate(() => window.__lastExport);
  check('voice: export with narration', !ex2.error && ex2.size > 5000, JSON.stringify(ex2));
  if (!ex2.error) {
    const dl = page.waitForEvent('download');
    await page.click('#dlLink button');
    const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'stickv-')), 'out.' + ex2.ext);
    await (await dl).saveAs(file);
    try {
      const streams = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_type', '-of', 'csv=p=0', file]).toString();
      check('voice: exported video has a sound track', /audio/.test(streams), streams.replace(/\n/g, ' '));
      const vol = spawnSync('ffmpeg', ['-hide_banner', '-i', file, '-vn', '-af', 'volumedetect', '-f', 'null', '-']).stderr.toString();
      const m = /max_volume: (-?[\d.]+) dB/.exec(vol);
      check('voice: sound track is not silent', m && parseFloat(m[1]) > -30, m ? m[1] + ' dB' : 'no volume');
    } catch (e) { console.log('SKIP ffprobe/ffmpeg check (' + String(e.message).split('\n')[0] + ')'); }
  }

  check('no page errors', errors.length === 0, errors.join(' | '));
  await browser.close();
  console.log(failures ? failures + ' FAILED' : 'ALL PASSED');
  process.exit(failures ? 1 : 0);
})();
