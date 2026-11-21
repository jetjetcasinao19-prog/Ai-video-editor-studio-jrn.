// Tests "⚡ Edit this" in index.html: the owner's edit-this skill in the
// browser (brand, captions, cut pauses, hook, zoom, B-roll, pop-ups, sound
// effects, progress bar, watermark, intro/outro, export, thumbnail, post
// text, schedule).
// Run: node tests/edit-this.test.js   (needs ffmpeg with flite, and playwright)
// No internet needed: Wikimedia Commons is replaced by a local stand-in and
// the captions are given (AI captions have their own test).
const { chromium, devices } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const PAGE = 'file://' + path.resolve(__dirname, '..', 'index.html');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'edit-this-test-'));
const VIDEO = path.join(tmp, 'talk.webm'); // VP8/Opus: GitHub's open-source Chromium has no H.264
const RED = path.join(tmp, 'red.png');

let failures = 0;
function check(name, ok, detail) {
  console.log((ok ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? '  (' + detail + ')' : ''));
  if (!ok) failures++;
}
const ff = args => execFileSync('ffmpeg', ['-loglevel', 'error', '-y', ...args], { maxBuffer: 256 * 1024 * 1024 });

// Speech: 0.8–~4.8 s, pause, ~7.3–~12 s, then quiet (grey test picture).
ff(['-f', 'lavfi', '-i', "flite=text='In 1908 Henry Ford started selling the Model T. It cost 850 dollars.':voice=slt", path.join(tmp, 's1.wav')]);
ff(['-f', 'lavfi', '-i', "flite=text='Workers in Detroit built one car every 93 minutes. Soon it was everywhere.':voice=slt", path.join(tmp, 's2.wav')]);
ff(['-i', path.join(tmp, 's1.wav'), '-i', path.join(tmp, 's2.wav'), '-filter_complex',
  '[0]aresample=48000,adelay=800|800,apad=pad_dur=2.5[a0];[1]aresample=48000,apad=pad_dur=1.5[a1];[a0][a1]concat=n=2:v=0:a=1,aformat=channel_layouts=stereo[a]',
  '-map', '[a]', path.join(tmp, 'talk.wav')]);
const T = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path.join(tmp, 'talk.wav')]).toString());
ff(['-f', 'lavfi', '-i', 'color=c=gray:size=640x360:rate=30', '-i', path.join(tmp, 'talk.wav'), '-t', String(T),
  '-c:v', 'libvpx', '-deadline', 'realtime', '-cpu-used', '8', '-b:v', '300k', '-c:a', 'libopus', VIDEO]);
ff(['-f', 'lavfi', '-i', 'color=c=red:size=1200x800', '-frames:v', '1', RED]);

// Captions like Whisper makes them, at the speech times.
const words1 = 'In 1908 Henry Ford started selling the Model T. It cost $850.';
const words2 = 'Workers in Detroit built one car every 93 minutes. Soon it was everywhere.';

function framesOf(file) {
  const out = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v', '-show_entries', 'frame=pts_time', '-of', 'csv=p=0', file]).toString().trim().split('\n').map(Number);
  return out[out.length - 1] - out[0];
}
function rgbAt(file, t, x, y, w = 4, h = 4) { // average colour of a small box (fractions of the frame)
  const raw = ff(['-ss', String(t), '-i', file, '-frames:v', '1', '-vf', `scale=180:320,crop=${w}:${h}:${Math.round(x * 180)}:${Math.round(y * 320)}`, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-']);
  let r = 0, g = 0, b = 0; for (let i = 0; i < raw.length; i += 3) { r += raw[i]; g += raw[i + 1]; b += raw[i + 2]; }
  const n = raw.length / 3; return [r / n, g / n, b / n].map(Math.round);
}
function yellowCount(file, t, x, y, w, h) { // yellow pixels in a box (fractions of a 180x320 frame)
  const raw = ff(['-ss', String(t), '-i', file, '-frames:v', '1', '-vf', `scale=180:320,crop=${Math.round(w * 180)}:${Math.round(h * 320)}:${Math.round(x * 180)}:${Math.round(y * 320)}`, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-']);
  let n = 0; for (let i = 0; i < raw.length; i += 3) if (yellow([raw[i], raw[i + 1], raw[i + 2]])) n++; return n;
}
const yellow = c => c[0] > 170 && c[1] > 140 && c[2] < 110;
const red = c => c[0] > 150 && c[1] < 90 && c[2] < 90;
const dark = c => c[0] < 60 && c[1] < 60 && c[2] < 60;

(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const context = await browser.newContext({ ...devices['Pixel 7'], acceptDownloads: true });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('dialog', d => d.accept());
  await page.addInitScript(() => {
    window.__sfx = 0;
    const start = AudioBufferSourceNode.prototype.start;
    AudioBufferSourceNode.prototype.start = function (...a) { window.__sfx++; return start.apply(this, a); };
  });

  // Wikimedia Commons stand-in: a non-free picture first (must be skipped), then a CC BY-SA one.
  const queries = [];
  await page.route('https://commons.wikimedia.org/**', route => {
    const u = new URL(route.request().url());
    queries.push(u.searchParams.get('gsrsearch'));
    const page1 = { pageid: 1, index: 1, title: 'File:Unfree.jpg', imageinfo: [{ mime: 'image/jpeg', width: 1200, height: 800,
      thumburl: 'https://upload.wikimedia.org/unfree.jpg', extmetadata: { LicenseShortName: { value: 'CC BY-NC 2.0' }, Artist: { value: 'X' } } }] };
    const page2 = { pageid: 2, index: 2, title: 'File:Ford.png', imageinfo: [{ mime: 'image/png', width: 1200, height: 800,
      thumburl: 'https://upload.wikimedia.org/ford.png', descriptionurl: 'https://commons.wikimedia.org/wiki/File:Ford.png',
      extmetadata: { LicenseShortName: { value: 'CC BY-SA 4.0' }, Artist: { value: '<a href="x">Jane Photo</a>' } } }] };
    route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' },
      body: JSON.stringify({ query: { pages: { 1: page1, 2: page2 } } }) });
  });
  const images = [];
  await page.route('https://upload.wikimedia.org/**', route => {
    images.push(route.request().url());
    route.fulfill({ status: 200, contentType: 'image/png', headers: { 'access-control-allow-origin': '*' }, body: fs.readFileSync(RED) });
  });

  try {
    await page.goto(PAGE);
    check('Edit this panel and tab shown', await page.isVisible('#editThisBox') && !!(await page.$('#topTabs button[data-go="editThisBox"]')));
    check('brand kit filled with How it Started', (await page.inputValue('#etBrandHandle')) === '@HOWITSTARTED-YT1' &&
      (await page.inputValue('#etBrandOutro')) === 'Subscribe for more origin stories');
    await page.click('#etRun');
    check('asks for a video first', /Import a video first/.test(await page.textContent('#etLog')));

    await page.setInputFiles('#file', VIDEO);
    await page.waitForFunction(() => document.getElementById('status').textContent === 'Video ready.');
    await page.evaluate(([a, b]) => {
      captions = [{ start: 0.85, end: 4.6, text: a.replace('Model T.', 'Model T8.') }, { start: 7.4, end: 11.9, text: b }];
      renderCaptionList();
    }, [words1, words2]);
    await page.click('#etMore summary');
    await page.uncheck('#etNewCaps');
    await page.fill('#etFix', 'Model T8=Model T');
    await page.selectOption('#exportFormat', 'webm');

    await page.click('#etRun');
    await page.waitForFunction(() => !fxRunning, null, { timeout: 180000 });
    const log = (await page.$$eval('#etLog div', ds => ds.map(d => d.className + ': ' + d.textContent))).join('\n');
    const plan = await page.evaluate(() => editFx && ({ zoom: editFx.zoom.length, popups: editFx.popups, broll: editFx.broll.map(b => ({ at: b.at, dur: b.dur, q: b.query, credit: b.credit })),
      sfx: editFx.sfx.length, total: editFx.total, intro: !!editFx.intro, outro: !!editFx.outro }));
    check('no step failed', !/^err/m.test(log), log.split('\n').filter(l => /^err/.test(l)).join(' | '));
    check('format 9:16, fill, creator captions', await page.evaluate(() => $('ratio').value === '9:16' && $('fit').value === 'cover' && $('capPreset').value !== 'classic' && capStyle.font === 'montserrat'));
    check('fix applied to captions', await page.evaluate(() => captions[0].text.includes('Model T.') && !captions[0].text.includes('T8')));
    const tl = await page.evaluate(() => timeline.map(c => [c.start, c.end, c.trans]));
    check('pause cut: 2 parts with plain cuts', tl.length === 2 && tl.every(c => c[2] === 'cut'), JSON.stringify(tl));
    check('pauses removed in the log', /Pauses cut: [\d.]+ s removed/.test(log));
    check('hook title from the opening sentence', /Hook title \(from what you say\): “In 1908 Henry Ford started selling/.test(log), log.match(/Hook title[^\n]*/)?.[0]);
    check('punch zoom planned', plan.zoom >= 3, plan.zoom);
    const popTexts = plan.popups.map(p => p.text);
    check('pop-ups pick money and numbers first', popTexts.includes('$850') && popTexts.includes('93 minutes'), popTexts.join(', '));
    check('one B-roll photo, free licence only', plan.broll.length === 1 && plan.broll[0].credit === 'Jane Photo, CC BY-SA 4.0, via Wikimedia Commons', JSON.stringify(plan.broll));
    check('B-roll search is a name + year', /^Henry Ford 1908$/.test(plan.broll[0] && plan.broll[0].q) && queries[0] === 'Henry Ford 1908 filetype:bitmap', queries.join(' | '));
    check('non-free picture skipped (only the free one downloaded)', images.length === 1 && /ford\.png$/.test(images[0]), images.join(', '));
    check('B-roll not in the first 2 s', plan.broll[0].at >= 2);
    check('sound effects planned (whoosh + pop)', plan.sfx >= 3, plan.sfx);
    check('sound effects really played', await page.evaluate(() => window.__sfx) >= plan.sfx, await page.evaluate(() => window.__sfx));
    check('export finished', /Export completed/.test(log));

    // The exported video
    const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#result a')]);
    const out = path.join(tmp, 'out.webm'); await dl.saveAs(out);
    const len = framesOf(out);
    const want = 2.5 + plan.total + 2.5;
    check('length = intro + edited video + outro', Math.abs(len - want) < 0.8, len.toFixed(2) + ' s vs ' + want.toFixed(2) + ' s');
    const intro = rgbAt(out, 1.2, 0.05, 0.05), introBar = yellowCount(out, 1.2, 0.3, 0.2, 0.4, 0.3);
    check('intro card: dark with the accent bar', dark(intro) && introBar >= 10, JSON.stringify(intro) + ' / ' + introBar + ' yellow pixels');
    const b = plan.broll[0];
    const brollFrame = rgbAt(out, 2.5 + b.at + 1.5, 0.45, 0.5);
    check('B-roll photo shown in the video', red(brollFrame), JSON.stringify(brollFrame));
    const before = rgbAt(out, 2.5 + 0.8, 0.45, 0.5);
    check('normal picture before the B-roll (not red)', !red(before), JSON.stringify(before));
    const bar = rgbAt(out, 2.5 + plan.total * 0.6, 0.1, 0, 6, 1);
    const barEnd = rgbAt(out, 2.5 + plan.total * 0.2, 0.8, 0, 6, 1);
    check('progress bar grows along the top', yellow(bar) && !yellow(barEnd), JSON.stringify([bar, barEnd]));
    const wm = yellowCount(out, 2.5 + 0.8, 0.8, 0.02, 0.18, 0.1), wmLeft = yellowCount(out, 2.5 + 0.8, 0.02, 0.02, 0.18, 0.1);
    check('logo watermark top-right', wm > 200 && wmLeft < 20, wm + ' vs ' + wmLeft + ' yellow pixels');
    const pop = plan.popups.find(p => p.text === '$850');
    const popPx = await (async () => { // yellow text near the top during the pop-up
      const raw = ff(['-ss', String(2.5 + pop.at + 0.6), '-i', out, '-frames:v', '1', '-vf', 'scale=180:320,crop=180:30:0:40', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-']);
      let n = 0; for (let i = 0; i < raw.length; i += 3) if (yellow([raw[i], raw[i + 1], raw[i + 2]])) n++; return n;
    })();
    check('pop-up text shown at the top', popPx > 40, popPx + ' yellow pixels');
    const outro = rgbAt(out, len - 0.6, 0.05, 0.9), outroLogo = yellowCount(out, len - 0.6, 0.3, 0.28, 0.4, 0.22);
    check('outro card with the logo', dark(outro) && outroLogo > 800, JSON.stringify(outro) + ' / ' + outroLogo + ' yellow pixels');

    // Post text, thumbnail, schedule
    const post = await page.inputValue('#etPost');
    check('post text: hook title, CTA and brand hashtags', /^# In 1908 Henry Ford started selling/.test(post) && /Subscribe for more origin stories\./.test(post) && /#HowItStarted/.test(post));
    check('post text: B-roll credit', /B-roll: Jane Photo, CC BY-SA 4\.0, via Wikimedia Commons/.test(post));
    check('post text: ET time with PHT next to it', /7:00 PM ET \([A-Z][a-z]{2}, [A-Z][a-z]{2} \d+, 8:00 AM PHT\)/.test(post), post.match(/.*PHT.*/)?.[0]);
    check('post text says posting is the owner\'s decision', /Posting is your decision/.test(post));
    const [th] = await Promise.all([page.waitForEvent('download'), page.click('#etThumbDl')]);
    const thumbFile = path.join(tmp, 'thumb.jpg'); await th.saveAs(thumbFile);
    const tinfo = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_name,width,height', '-of', 'csv=p=0', thumbFile]).toString().trim();
    check('thumbnail is a 720x1280 JPEG', tinfo === 'mjpeg,720,1280', tinfo);
    const [pd] = await Promise.all([page.waitForEvent('download'), page.click('#etPostDl')]);
    check('post file named <date>-<slug>.md', /^\d{4}-\d{2}-\d{2}-in-1908-henry-ford-started-selling\.md$/.test(pd.suggestedFilename()), pd.suggestedFilename());
    check('added to My posting schedule as planned', (await page.textContent('#etSchedCount')) === '1' &&
      await page.evaluate(() => JSON.parse(localStorage.getItem('aves.schedule'))[0].status === 'planned'));

    // Effects off → plain timeline again; brand changes are kept
    await page.click('#etOff');
    check('EFFECTS OFF clears the effects', await page.evaluate(() => editFx === null));
    await page.click('#etBrandBox summary');
    await page.fill('#etBrandHandle', '@MyNewHandle');
    await page.dispatchEvent('#etBrandHandle', 'change');
    await page.reload();
    check('brand kit saved on the phone', (await page.inputValue('#etBrandHandle')) === '@MyNewHandle');
    check('options remembered (AI captions off)', !(await page.isChecked('#etNewCaps')));

    // Max length: a 6-second limit trims the edit (plan only, no export)
    await page.setInputFiles('#file', VIDEO);
    await page.waitForFunction(() => document.getElementById('status').textContent === 'Video ready.');
    await page.evaluate(([a, b]) => { captions = [{ start: 0.85, end: 4.6, text: a }, { start: 7.4, end: 11.9, text: b }]; renderCaptionList(); ET_PLATFORMS.shorts.max = 6; }, [words1, words2]);
    await page.click('#etMore summary');
    await page.uncheck('#etExport');
    await page.uncheck('#etBroll');
    await page.click('#etRun');
    await page.waitForFunction(() => !fxRunning, null, { timeout: 60000 });
    const len2 = await page.evaluate(() => timeline.reduce((n, c) => n + c.end - c.start, 0));
    check('max length trims the edit', len2 <= 6.01 && len2 > 5, len2.toFixed(2));
    check('warning about the cut end', /Longer than 6 s/.test(await page.textContent('#etLog')));
    check('without export: PREVIEW EDIT offered', !(await page.isDisabled('#etPreview')));

    await page.setViewportSize({ width: 360, height: 760 });
    check('no sideways scrolling at 360px', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    check('no page errors', errors.length === 0, errors.join(' | '));
  } catch (e) {
    check('test ran to the end', false, e.message);
  } finally {
    await browser.close();
    fs.rmSync(tmp, { recursive: true, force: true });
  }
  console.log(failures ? '\n' + failures + ' check(s) FAILED' : '\nAll Edit this tests passed');
  process.exit(failures ? 1 : 0);
})();
