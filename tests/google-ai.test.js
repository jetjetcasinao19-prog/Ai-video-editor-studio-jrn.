// Tests the Prompt Studio's "Google AI — your key" platform (Gemini API:
// Gemini Omni Flash videos, Nano Banana pictures). Google is replaced by a
// local stand-in, so no key, internet or money is needed.
// Run: node tests/google-ai.test.js   (needs ffmpeg and playwright)
const { chromium, devices } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const PAGE = 'file://' + path.resolve(__dirname, '..', 'index.html');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'google-ai-test-'));
const RED = path.join(tmp, 'red.png'), START = path.join(tmp, 'start.png'), CLIP = path.join(tmp, 'clip.mp4');
const KEY = 'AIzaTEST_key_1234567890abcdefghijklmn';

let failures = 0;
function check(name, ok, detail) {
  console.log((ok ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? '  (' + detail + ')' : ''));
  if (!ok) failures++;
}
const ff = args => execFileSync('ffmpeg', ['-loglevel', 'error', '-y', ...args]);
ff(['-f', 'lavfi', '-i', 'color=c=red:size=360x640', '-frames:v', '1', RED]);
ff(['-f', 'lavfi', '-i', 'color=c=blue:size=2000x1200', '-frames:v', '1', START]);
ff(['-f', 'lavfi', '-i', 'color=c=green:size=360x640:rate=24:duration=2', '-f', 'lavfi', '-i', 'sine=frequency=440:duration=2',
  '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-shortest', CLIP]);

(async () => {
  // The test clip is H.264 MP4: on CI this runs in Google Chrome (PW_CHANNEL=chrome),
  // because Playwright's own Chromium on Linux cannot play H.264.
  const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || undefined });
  const context = await browser.newContext({ ...devices['Pixel 7'], acceptDownloads: true });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  let dialogs = [], answer = true;
  page.on('dialog', d => { dialogs.push(d.message()); answer ? d.accept() : d.dismiss(); });

  // Google stand-in
  const calls = [];
  let mode = 'ok';
  const cors = { 'access-control-allow-origin': '*' };
  await page.route('https://generativelanguage.googleapis.com/**', async route => {
    const req = route.request(), url = req.url(), h = req.headers();
    const body = req.postData() ? JSON.parse(req.postData()) : null;
    calls.push({ url, method: req.method(), key: h['x-goog-api-key'], revision: h['api-revision'], body });
    const json = (status, obj) => route.fulfill({ status, contentType: 'application/json', headers: cors, body: JSON.stringify(obj) });
    if (/\/models\?/.test(url)) return json(200, { models: [{ name: 'models/gemini-omni-1.2-flash' }, { name: 'models/gemini-nano-banana-2.1' }] });
    if (/\/files\/vid1$/.test(url)) return json(200, { name: 'files/vid1', state: 'ACTIVE' });
    if (/\/files\/vid1:download/.test(url)) return route.fulfill({ status: 200, contentType: 'video/mp4', headers: cors, body: fs.readFileSync(CLIP) });
    if (/\/interactions$/.test(url)) {
      if (mode === 'badkey') return json(400, { error: { code: 400, message: 'API key not valid. Please pass a valid API key.', status: 'INVALID_ARGUMENT' } });
      if (mode === 'limit') return json(429, { error: { code: 429, message: 'Quota exceeded', status: 'RESOURCE_EXHAUSTED' } });
      if (mode === 'blocked') return json(200, { status: 'completed', steps: [{ type: 'model_output', content: [{ type: 'text', text: 'I cannot make that.' }] }] });
      const video = body.response_format && body.response_format.type === 'video';
      if (video && body.response_format.delivery === 'uri')
        return json(200, { status: 'completed', steps: [{ type: 'model_output', content: [{ type: 'video', mime_type: 'video/mp4', uri: 'https://generativelanguage.googleapis.com/v1beta/files/vid1:download?alt=media' }] }] });
      const data = fs.readFileSync(video ? CLIP : RED).toString('base64');
      return json(200, { id: 'v1_x', status: 'completed', object: 'interaction', steps: [
        { type: 'user_input', content: [{ type: 'text', text: '…' }] },
        { type: 'model_output', content: [{ type: video ? 'video' : 'image', mime_type: video ? 'video/mp4' : 'image/png', data }] }] });
    }
    return json(404, { error: { message: 'not found' } });
  });
  const interactions = () => calls.filter(c => /\/interactions$/.test(c.url));
  const q = () => page.evaluate(() => stQueue.map(it => ({ status: it.status, outs: it.outs.map(o => o.name + (o.video ? ':video' : '')), msg: it.msg })));
  const done = () => page.waitForFunction(() => !stRunning, null, { timeout: 60000 });

  try {
    await page.goto(PAGE);
    await page.click('#stPlatforms button[data-p="google"]');
    check('Google AI card shows its key box', await page.isVisible('#stGoogleBox'));
    check('all four modes available', await page.evaluate(() => [...document.querySelectorAll('#stModes button')].every(b => !b.disabled)));
    check('outputs per prompt can be chosen', !(await page.isDisabled('#stOutputs')));
    await page.fill('#stPrompts', 'A vintage gas station in 1905\nHenry Ford beside a Model T');
    check('estimate asks for the key first', /Save your API key/.test(await page.textContent('#stEstimate')));
    await page.click('#stRun');
    check('RUN without a key is refused', /Save your Google AI Studio API key/.test(await page.textContent('#stStatus')) && interactions().length === 0);

    await page.fill('#stKey', 'not a key');
    await page.click('#stKeySave');
    check('a wrong-looking key is not saved', /doesn't look like an API key/.test(await page.textContent('#stKeyStatus')));
    await page.fill('#stKey', KEY);
    await page.click('#stKeySave');
    check('key saved on the phone, field cleared, only ends shown', await page.evaluate(k => localStorage.getItem('aves.gkey') === k, KEY) &&
      (await page.inputValue('#stKey')) === '' && /Saved: AIzaTE…klmn/.test(await page.getAttribute('#stKey', 'placeholder')));
    await page.click('#stKeyTest');
    await page.waitForFunction(() => /Key works|refused|not valid/.test(document.getElementById('stKeyStatus').textContent));
    check('TEST KEY checks the models (free call)', /✓ Key works\. Video \(Gemini Omni Flash\) available\. Pictures \(Nano Banana\) available/.test(await page.textContent('#stKeyStatus')));

    // Text to Image, 2 prompts → 2 pictures for about $0.07
    check('estimate shows the cost', /2 pictures with Google AI — about \$0\.07/.test(await page.textContent('#stEstimate')), await page.textContent('#stEstimate'));
    answer = false;
    await page.click('#stRun');
    check('cost is confirmed before spending; No = nothing made', /About \$0\.07 will be charged/.test(dialogs.pop() || '') && interactions().length === 0 &&
      /nothing was made or charged/.test(await page.textContent('#stStatus')));
    answer = true;
    await page.click('#stRun');
    await done();
    let items = await q();
    check('2 pictures made', items.every(i => i.status === 'done' && i.outs.length === 1 && /\.png$/.test(i.outs[0])), JSON.stringify(items));
    const c1 = interactions()[0];
    check('key sent only in the x-goog-api-key header', c1.key === KEY && calls.every(c => !c.url.includes(KEY)));
    check('no Api-Revision header (Google blocks it from web pages)', calls.every(c => !c.revision));
    check('picture request: Nano Banana 2.1, 9:16, 1K', c1.body.model === 'gemini-nano-banana-2.1' && c1.body.response_format.type === 'image' &&
      c1.body.response_format.aspect_ratio === '9:16' && c1.body.response_format.image_size === '1K' && c1.body.input[0].text === 'A vintage gas station in 1905', JSON.stringify(c1.body));
    await page.click('#stQueue .qbtns button:has-text("SHOW ON VIDEO")');
    await page.waitForFunction(() => picImg && document.getElementById('pmPicPlace').value === 'full');
    check('SHOW ON VIDEO works for Google pictures', true);

    // Frame to Video with a start picture (scaled down), 8 s 720p
    await page.click('#stModes button[data-m="f2v"]');
    await page.setInputFiles('#stImgFile', START);
    await page.fill('#stPrompts', 'the car drives away');
    check('video estimate: 1 × 8 s × $0.07 = $0.56', /1 video \(8 s, 720p\) with Google AI — about \$0\.56/.test(await page.textContent('#stEstimate')), await page.textContent('#stEstimate'));
    await page.click('#stRun');
    await done();
    items = await q();
    check('video made', items.length === 1 && items[0].status === 'done' && /\.mp4:video$/.test(items[0].outs[0]), JSON.stringify(items));
    const c2 = interactions().slice(-1)[0];
    const img = c2.body.input[0];
    check('video request: Omni Flash, 9:16, 720p, 8s', c2.body.model === 'gemini-omni-1.2-flash' && c2.body.response_format.type === 'video' &&
      c2.body.response_format.aspect_ratio === '9:16' && c2.body.response_format.resolution === '720p' && c2.body.response_format.duration === '8s', JSON.stringify(c2.body.response_format));
    check('start picture sent as JPEG, first frame asked', img.type === 'image' && img.mime_type === 'image/jpeg' && img.data.length > 100 &&
      /^Use the attached image as the first frame\. the car drives away$/.test(c2.body.input[1].text));
    const dims = await page.evaluate(async d => { const i = new Image(); i.src = 'data:image/jpeg;base64,' + d; await i.decode(); return [i.naturalWidth, i.naturalHeight]; }, img.data);
    check('big start picture scaled to 1536 px', dims[0] === 1536 && dims[1] === 922, dims.join('x'));
    check('queue shows a video preview', (await page.$$('#stQueue .qouts video')).length === 1);
    await page.click('#stQueue .qbtns button:has-text("USE IN EDITOR")');
    await page.waitForFunction(() => document.getElementById('status').textContent === 'Video ready.', null, { timeout: 15000 });
    const vd = await page.evaluate(() => video.duration);
    check('USE IN EDITOR loads the Google video into the editor', Math.abs(vd - 2) < 0.3, vd);
    const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#stQueue .qbtns a')]);
    check('video downloads as .mp4', /^001_the_car_drives_away\.mp4$/.test(dl.suggestedFilename()), dl.suggestedFilename());

    // 1080p uses "uri" delivery: wait for the file, then download it with the key
    await page.selectOption('#stGRes', '1080p');
    await page.selectOption('#stGDur', '4');
    await page.fill('#stPrompts', 'a lighthouse at night');
    await page.click('#stRun');
    await done();
    items = await q();
    const c3 = interactions().slice(-1)[0];
    check('1080p asks for a download link', c3.body.response_format.delivery === 'uri' && c3.body.response_format.duration === '4s');
    check('1080p video fetched from the link with the key', items[0].status === 'done' && calls.some(c => /files\/vid1:download/.test(c.url) && c.key === KEY), JSON.stringify(items));

    // Square project → 16:9 video
    await page.selectOption('#ratio', '1:1');
    await page.fill('#stPrompts', 'square test');
    await page.click('#stRun');
    await done();
    check('square projects get 16:9 video', interactions().slice(-1)[0].body.response_format.aspect_ratio === '16:9');
    await page.selectOption('#ratio', '9:16');

    // Problems are explained, and a bad key stops the run
    await page.click('#stModes button[data-m="t2i"]');
    await page.fill('#stPrompts', 'one\ntwo\nthree');
    mode = 'badkey';
    const before = interactions().length;
    await page.click('#stRun');
    await done();
    items = await q();
    check('bad key: clear message', /API key is not valid/.test(items[0].msg), items[0].msg);
    check('bad key: run stops after the first try', interactions().length === before + 1 && items[1].status === 'waiting', JSON.stringify(items.map(i => i.status)));
    mode = 'limit';
    await page.click('#stQueue .qbtns button:has-text("TRY AGAIN")');
    await done();
    check('limit reached: clear message', /limit for your key was reached/.test((await q())[0].msg));
    mode = 'blocked';
    await page.fill('#stPrompts', 'blocked prompt');
    await page.click('#stRun');
    await done();
    check('no picture back: safety hint', /safety rules/.test((await q())[0].msg));
    mode = 'ok';

    // Settings remembered, key removable
    await page.reload();
    check('Google settings remembered', (await page.inputValue('#stGRes')) === '1080p' && (await page.inputValue('#stGDur')) === '4' && await page.evaluate(() => stPlatform === 'google'));
    await page.click('#stKeyDel');
    check('REMOVE deletes the key from the phone', await page.evaluate(() => localStorage.getItem('aves.gkey') === null) && /Key removed/.test(await page.textContent('#stKeyStatus')));

    await page.setViewportSize({ width: 360, height: 760 });
    check('no sideways scrolling at 360px', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    check('no page errors', errors.length === 0, errors.join(' | '));
  } catch (e) {
    check('test ran to the end', false, e.message);
  } finally {
    await browser.close();
    fs.rmSync(tmp, { recursive: true, force: true });
  }
  console.log(failures ? '\n' + failures + ' check(s) FAILED' : '\nAll Google AI tests passed');
  process.exit(failures ? 1 : 0);
})();
