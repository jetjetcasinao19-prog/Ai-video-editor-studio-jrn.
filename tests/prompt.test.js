// Tests the AI Prompt panel: typed commands / scripts and picture generation.
// Run: node tests/prompt.test.js   (needs ffmpeg and playwright)
// The picture service is replaced by a local stand-in, so no internet is needed.
// PROMPT_LIVE=1 node tests/prompt.test.js  also makes one real picture with
// Pollinations.ai (needs internet; the free limit is 1 picture per 45 s).
const { chromium, devices } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const PAGE = 'file://' + path.resolve(__dirname, '..', 'index.html');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'prompt-test-'));
const VIDEO = path.join(tmp, 'talk.webm'); // grey 8 s, sound at 0.5-2.5 and 4.5-7 s
const RED = path.join(tmp, 'red.png');     // stand-in "AI picture"

let failures = 0;
function check(name, ok, detail) {
  console.log((ok ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? '  (' + detail + ')' : ''));
  if (!ok) failures++;
}
const ff = args => execFileSync('ffmpeg', ['-loglevel', 'error', '-y', ...args], { maxBuffer: 256 * 1024 * 1024 });
ff(['-f', 'lavfi', '-i', 'color=c=gray:size=320x180:rate=30:duration=8',
  '-f', 'lavfi', '-i', "sine=frequency=440:duration=8,volume='0.6*(between(t,0.5,2.5)+between(t,4.5,7))':eval=frame",
  '-c:v', 'libvpx', '-deadline', 'realtime', '-cpu-used', '8', '-b:v', '300k', '-c:a', 'libopus', VIDEO]);
ff(['-f', 'lavfi', '-i', 'color=c=red:size=360x640', '-frames:v', '1', RED]);

(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const context = await browser.newContext({ ...devices['Pixel 7'], acceptDownloads: true });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('dialog', d => d.accept());

  // Stand-in for Pollinations: a red picture, or the free-limit answer.
  let mode = 'ok', lastUrl = '';
  await page.route('https://image.pollinations.ai/**', route => {
    lastUrl = route.request().url();
    if (mode === 'limit') return route.fulfill({ status: 402, contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*' },
      body: JSON.stringify({ status: 402, error: { code: 'FREE_LIMIT', message: 'Free limit reached: 1 image every 45 seconds per IP. Retry after 36s' } }) });
    if (mode === 'down') return route.fulfill({ status: 500, body: 'oops', headers: { 'access-control-allow-origin': '*' } });
    return route.fulfill({ status: 200, contentType: 'image/png', headers: { 'access-control-allow-origin': '*' }, body: fs.readFileSync(RED) });
  });

  // Run a script in the command box; returns the log lines.
  const run = async (script, timeout = 120000) => {
    await page.fill('#pmCmd', script);
    await page.click('#pmRun');
    await page.waitForFunction(() => !pmRunning, null, { timeout });
    return page.$$eval('#pmLog div', ds => ds.map(d => ({ cls: d.className, text: d.textContent })));
  };
  const val = id => page.inputValue('#' + id);

  try {
    await page.goto(PAGE);
    check('prompt panel is shown', await page.isVisible('#promptBox'));
    check('example buttons shown', (await page.$$('#pmExamples button')).length >= 5);

    let log = await run('help');
    check('help lists the commands', log.length === 1 && log[0].cls === 'ok' && /remove silences/.test(log[0].text) && /picture/.test(log[0].text));

    log = await run('fly me to the moon');
    check('unknown command explained', log[0].cls === 'err' && /didn't understand/.test(log[0].text), log[0].text);

    log = await run('remove silences');
    check('video command without a video asks for one', log[0].cls === 'err' && /Import a video first/.test(log[0].text), log[0].text);

    log = await run('make it horizontal');
    check('"make it horizontal" sets 16:9', (await val('ratio')) === '16:9' && log[0].cls === 'ok', log[0].text);

    // Load the video
    await page.setInputFiles('#file', VIDEO);
    await page.waitForFunction(() => document.getElementById('status').textContent === 'Video ready.');

    log = await run([
      'vertical',
      'trim 0:00.5 to 7.5s',
      'Title How It Started',
      'title yellow',
      'title top',
      'captions style bold',
      'captions bottom',
      'transition slide up 1s',
      'fade in and out',
      'music 30%',
      'video sound 80%',
      'fit'
    ].join('\n'));
    const allOk = log.filter(l => l.cls === 'err');
    check('12-line script runs without errors', allOk.length === 0 && /Done: 12 worked/.test(log[log.length - 1].text), allOk.map(l => l.text).join(' | '));
    check('format vertical', (await val('ratio')) === '9:16');
    check('trim sets Start and End', (await val('start')) === '0.5' && (await val('end')) === '7.5', (await val('start')) + '–' + (await val('end')));
    check('title keeps its capital letters', (await val('overlay')) === 'How It Started', await val('overlay'));
    check('title colour and position', (await val('color')) === '#ffff00' && (await val('position')) === 'top');
    check('caption style and position (bold look kept, moved = Custom like a manual change)',
      (await page.evaluate(() => capStyle.font === 'anton' && capStyle.upper && capStyle.pos === 'bottom')) && (await val('capPos')) === 'bottom',
      await page.evaluate(() => JSON.stringify({ font: capStyle.font, pos: capStyle.pos, preset: document.getElementById('capPreset').value })));
    check('transition and length', (await val('tlType')) === 'slideup' && (await val('tlDur')) === '1', (await val('tlType')) + ' ' + (await val('tlDur')));
    check('fade in and out ticked', await page.isChecked('#tlFadeIn') && await page.isChecked('#tlFadeOut'));
    check('music and video volume', (await val('musicVol')) === '30' && (await val('videoVol')) === '80');
    check('labels updated too', (await page.textContent('#musicVolVal')) === '30' && (await page.textContent('#tlDurVal')) === '1.0');
    check('fit whole picture', (await val('fit')) === 'contain');

    log = await run('trim 2 to 99');
    check('trim past the end is refused', log[0].cls === 'err' && /only 8\.0 s long/.test(log[0].text), log[0].text);
    log = await run('transition sideways');
    check('unknown transition explained', log[0].cls === 'err' && /Unknown transition/.test(log[0].text));

    // Remove silences waits for the assistant and reports its result
    log = await run('remove silences');
    const clips = await page.evaluate(() => timeline.map(c => [c.start, c.end, c.trans]));
    check('remove silences builds the timeline', log[0].cls === 'ok' && clips.length === 2, JSON.stringify(clips) + ' ' + log[0].text);
    check('result message comes from the assistant', /Kept 2 parts/.test(log[0].text), log[0].text);
    log = await run('transition crossfade');
    check('transition command updates existing clips', await page.evaluate(() => timeline.every(c => c.trans === 'fade')), log[0].text);
    log = await run('clear timeline');
    check('clear timeline', await page.evaluate(() => timeline.length === 0), log[0].text);

    // Pictures
    log = await run('picture a red vintage car');
    check('picture command makes a picture', log[0].cls === 'ok' && /Picture ready/.test(log[0].text), log[0].text);
    check('prompt and style sent to the service', /a%20red%20vintage%20car%2C%20realistic%20photo/.test(lastUrl), lastUrl.slice(0, 120));
    check('picture size matches 9:16', /width=720&height=1280/.test(lastUrl));
    await page.click('#pmTabPic');
    check('picture shown with a download link', await page.isVisible('#pmPicImg') && /^blob:/.test(await page.getAttribute('#pmPicDownload', 'href')));
    const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#pmPicDownload')]);
    check('download saves the picture', /^ai-picture-\d+\.png$/.test(dl.suggestedFilename()), dl.suggestedFilename());
    await page.click('#pmTabCmd');

    const firstURL = await page.evaluate(() => picURL);
    log = await run('make a picture of a lighthouse');
    check('"make a picture of …" works', log[0].cls === 'ok');
    check('old picture memory freed', await page.evaluate(u => fetch(u).then(() => false, () => true), firstURL));

    log = await run('picture full');
    const px = await page.evaluate(() => { updatePreview(); const d = ctx.getImageData(canvas.width / 2, canvas.height / 2, 1, 1).data; return [d[0], d[1], d[2]]; });
    check('picture full is drawn on the video', log[0].cls === 'ok' && px[0] > 200 && px[1] < 60, JSON.stringify(px));
    await run('picture corner');
    const px2 = await page.evaluate(() => { updatePreview(); const a = ctx.getImageData(canvas.width * 0.85, canvas.height * 0.15, 1, 1).data; const b = ctx.getImageData(canvas.width / 2, canvas.height / 2, 1, 1).data; return [[a[0], a[1]], [b[0], b[1]]]; });
    check('picture corner: red in the corner, video in the middle', px2[0][0] > 200 && px2[0][1] < 60 && px2[1][0] < 180, JSON.stringify(px2));

    // Export with the picture full screen: the file must show it
    await run('picture full\ntrim 1 to 3\nexport webm');
    log = await page.$$eval('#pmLog div', ds => ds.map(d => d.textContent));
    check('export command finishes and reports', /Export completed/.test(log.join(' ')), log.join(' | ').slice(-200));
    const [vd] = await Promise.all([page.waitForEvent('download'), page.click('#result a')]);
    const out = path.join(tmp, 'out.webm'); await vd.saveAs(out);
    const raw = ff(['-ss', '1', '-i', out, '-frames:v', '1', '-vf', 'scale=8:8', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-']);
    let r = 0, g = 0; for (let i = 0; i < raw.length; i += 3) { r += raw[i]; g += raw[i + 1]; }
    check('exported video shows the picture', r / 64 > 180 && g / 64 < 80, [Math.round(r / 64), Math.round(g / 64)].join(','));

    // Picture service problems are explained
    mode = 'limit';
    log = await run('picture a castle');
    check('free limit: says how long to wait', log[0].cls === 'err' && /Wait 36 seconds/.test(log[0].text), log[0].text);
    mode = 'down';
    log = await run('picture a castle');
    check('service error explained', log[0].cls === 'err' && /error 500/.test(log[0].text), log[0].text);
    check('generate button usable again', !(await page.isDisabled('#pmPicGen')));
    mode = 'ok';
    await page.click('#pmTabPic');
    await page.fill('#pmPicPrompt', '');
    await page.click('#pmPicGen');
    check('empty description explained', /Describe the picture/.test(await page.textContent('#pmPicStatus')));
    await page.fill('#pmPicPrompt', 'a golden crown');
    await page.selectOption('#pmPicStyle', 'cartoon');
    await page.selectOption('#pmPicShape', 'square');
    await page.click('#pmPicGen');
    await page.waitForFunction(() => /Picture ready/.test(document.getElementById('pmPicStatus').textContent));
    check('PICTURE tab: style and shape used', /cartoon/.test(lastUrl) && /width=1024&height=1024/.test(lastUrl), lastUrl.slice(0, 140));
    await page.selectOption('#pmPicPlace', 'off');
    await page.click('#pmPicUse');
    check('SHOW ON VIDEO turns the picture on', (await val('pmPicPlace')) === 'full');
    await page.click('#pmTabCmd');

    // STOP ends a script after the current command
    await page.fill('#pmCmd', 'wait 5\nsquare');
    await page.click('#pmRun');
    await page.waitForTimeout(400);
    await page.click('#pmStop');
    await page.waitForFunction(() => !pmRunning, null, { timeout: 10000 });
    log = await page.$$eval('#pmLog div', ds => ds.map(d => d.textContent));
    check('STOP stops the script', /Stopped\. 1 command/.test(log.join(' ')) && (await val('ratio')) !== '1:1', log.join(' | '));

    check('last script remembered', await page.evaluate(() => localStorage.getItem('aves.prompt')) === 'wait 5\nsquare');

    await page.setViewportSize({ width: 360, height: 760 });
    for (const tab of ['#pmTabCmd', '#pmTabPic']) {
      await page.click(tab);
      check('no sideways scrolling at 360px (' + tab + ')', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    }

    if (process.env.PROMPT_LIVE) {
      await page.unroute('https://image.pollinations.ai/**');
      await page.selectOption('#pmPicShape', 'video');
      await page.fill('#pmPicPrompt', 'vintage photo of an old wooden sailing ship ' + Date.now());
      await page.click('#pmPicGen');
      await page.waitForFunction(() => !picBusy, null, { timeout: 130000 });
      const st = await page.textContent('#pmPicStatus');
      const size = await page.evaluate(() => picImg && [picImg.naturalWidth, picImg.naturalHeight]);
      check('LIVE: real Pollinations picture made', /Picture ready/.test(st), st + ' ' + JSON.stringify(size));
    }

    check('no page errors', errors.length === 0, errors.join(' | '));
  } catch (e) {
    check('test ran to the end', false, e.message);
  } finally {
    await browser.close();
    fs.rmSync(tmp, { recursive: true, force: true });
  }
  console.log(failures ? '\n' + failures + ' check(s) FAILED' : '\nAll prompt tests passed');
  process.exit(failures ? 1 : 0);
})();
