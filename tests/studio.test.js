// Tests the Prompt Studio: platforms and modes, prompts (typed, .txt, .csv),
// free picture queue, hand-off to Flow/Gemini/ChatGPT/Grok, Stickman, tab bar.
// Run: node tests/studio.test.js   (needs ffmpeg and playwright; no internet:
// the picture service is replaced by a local stand-in)
const { chromium, devices } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const PAGE = 'file://' + path.resolve(__dirname, '..', 'index.html');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-test-'));
const RED = path.join(tmp, 'red.png');
const IMG1 = path.join(tmp, 'one.png'), IMG2 = path.join(tmp, 'two.jpg');
const TXT = path.join(tmp, 'prompts.txt'), CSV = path.join(tmp, 'prompts.csv');

let failures = 0;
function check(name, ok, detail) {
  console.log((ok ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? '  (' + detail + ')' : ''));
  if (!ok) failures++;
}
const ff = args => execFileSync('ffmpeg', ['-loglevel', 'error', '-y', ...args]);
ff(['-f', 'lavfi', '-i', 'color=c=red:size=360x640', '-frames:v', '1', RED]);
ff(['-f', 'lavfi', '-i', 'color=c=blue:size=200x200', '-frames:v', '1', IMG1]);
ff(['-f', 'lavfi', '-i', 'color=c=green:size=200x200', '-frames:v', '1', IMG2]);
fs.writeFileSync(TXT, 'STICK FIGURE SCENE 1\nA man walks in.\n\nSTICK FIGURE SCENE 2\nHe has an idea.\n');
fs.writeFileSync(CSV, 'id,Prompt,notes\n1,"Ford Model T, 1910",a\n2,"A lighthouse ""at night""",b\n3,"Two lines\nin one cell",c\n');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ ...devices['Pixel 7'], acceptDownloads: true });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('dialog', d => d.accept());

  let requests = [], limitOnce = false;
  await page.route('https://image.pollinations.ai/**', route => {
    requests.push(decodeURIComponent(route.request().url()));
    if (limitOnce) {
      limitOnce = false;
      return route.fulfill({ status: 402, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' },
        body: JSON.stringify({ error: { message: 'Free limit reached: 1 image every 45 seconds per IP. Retry after 1s' } }) });
    }
    return route.fulfill({ status: 200, contentType: 'image/png', headers: { 'access-control-allow-origin': '*' }, body: fs.readFileSync(RED) });
  });
  // Record window.open, clipboard and share instead of leaving the page.
  await page.addInitScript(() => {
    window.__opened = []; window.__copied = []; window.__shared = [];
    window.open = (url, name) => { window.__opened.push([String(url), name]); return {}; };
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: async t => { window.__copied.push(t); } }, configurable: true });
    navigator.canShare = d => !!(d && d.files);
    navigator.share = async d => { window.__shared.push({ text: d.text, files: (d.files || []).map(f => f.name + ':' + f.type) }); };
  });

  const items = () => page.evaluate(() => stQueue.map(it => ({ n: it.n, status: it.status, outs: it.outs.map(o => o.name), img: it.img, prompt: it.prompt })));
  const status = () => page.textContent('#stStatus');

  try {
    await page.goto(PAGE);
    await page.evaluate(() => { PIC_GAP_MS = 0; });

    // Look: red theme + tab bar
    const accent = await page.evaluate(() => getComputedStyle(document.getElementById('stRun')).backgroundImage);
    check('red theme on main buttons', /230, 57, 70/.test(accent), accent.slice(0, 60));
    check('tab bar has 9 sections', (await page.$$('#topTabs button')).length === 9);
    await page.click('#topTabs button[data-go="studioBox"]');
    await page.waitForFunction(() => Math.abs(document.getElementById('studioBox').getBoundingClientRect().top - 64) < 30, null, { timeout: 5000 }).catch(() => {});
    const top = await page.evaluate(() => document.getElementById('studioBox').getBoundingClientRect().top);
    check('tab jumps to its section', top > -5 && top < 150, Math.round(top));
    await page.waitForTimeout(300);
    check('tab of the visible section is highlighted', await page.evaluate(() => document.querySelector('#topTabs button.on')?.dataset.go === 'studioBox'),
      await page.evaluate(() => document.querySelector('#topTabs button.on')?.dataset.go));

    // Platforms and modes
    check('Free AI: only Text to Image', await page.evaluate(() =>
      [...document.querySelectorAll('#stModes button')].map(b => b.disabled).join() === 'false,true,true,true'));
    await page.click('#stPlatforms button[data-p="chatgpt"]');
    check('ChatGPT: pictures only', await page.evaluate(() =>
      [...document.querySelectorAll('#stModes button')].map(b => b.disabled).join() === 'false,false,true,true'));
    await page.click('#stPlatforms button[data-p="flow"]');
    await page.click('#stModes button[data-m="f2v"]');
    check('Frame to Video shows the Images box', await page.isVisible('#stImgBox'));
    await page.click('#stPlatforms button[data-p="free"]');
    check('free platform switches back to Text to Image and hides Images', await page.evaluate(() => stMode === 't2i') && !(await page.isVisible('#stImgBox')));

    // Prompts: typed, add-to-every, txt, csv
    await page.fill('#stPrompts', 'Ford Model T in 1910\n\nA lighthouse at night.\nFirst gas station 1905');
    await page.fill('#stAdd', 'vintage photo');
    check('one prompt per line, empty lines ignored', (await page.textContent('#stCount')) === '3 loaded');
    const parsed = await page.evaluate(() => stParse().map(x => x.prompt));
    check('style added to every prompt', parsed[0] === 'Ford Model T in 1910, vintage photo' && parsed[1] === 'A lighthouse at night. vintage photo', JSON.stringify(parsed));
    // Files are read in the background: wait for the "Loaded …" message.
    const loaded = name => page.waitForFunction(n => document.getElementById('stStatus').textContent.includes('“' + n + '”'), name, { timeout: 10000 });
    await page.setInputFiles('#stTxt', TXT);
    await loaded('prompts.txt');
    check('.txt with empty lines → long prompts', (await page.inputValue('#stSplit')) === 'blank' && (await page.textContent('#stCount')) === '2 loaded',
      (await page.inputValue('#stSplit')) + ' / ' + (await page.textContent('#stCount')));
    await page.setInputFiles('#stCsv', CSV);
    await loaded('prompts.csv');
    const csv = await page.evaluate(() => stParse().map(x => x.title));
    check('.csv uses the "Prompt" column (quotes, commas, new lines)', csv.length === 3 && csv[0] === 'Ford Model T, 1910' && csv[1] === 'A lighthouse "at night"' && csv[2] === 'Two lines\nin one cell', JSON.stringify(csv));
    check('csv status says which column', /column “Prompt”/.test(await status()), await status());

    // Free pictures: 2 prompts × 2 outputs, one free-limit answer on the way
    await page.selectOption('#stSplit', 'line');
    await page.fill('#stPrompts', 'Ford Model T in 1910\nA lighthouse at night');
    await page.fill('#stAdd', '');
    await page.selectOption('#stOutputs', '2');
    await page.fill('#stPrefix', 'How It Started');
    check('estimate counts the pictures', /makes 4 pictures/.test(await page.textContent('#stEstimate')), await page.textContent('#stEstimate'));
    limitOnce = true; requests = [];
    await page.click('#stRun');
    await page.waitForFunction(() => !stRunning, null, { timeout: 60000 });
    let q = await items();
    check('4 pictures made', q.every(it => it.status === 'done' && it.outs.length === 2), JSON.stringify(q));
    check('free limit answered by waiting and trying again', requests.length === 5, requests.length + ' requests');
    check('auto file names', JSON.stringify(q[0].outs) === JSON.stringify(['how-it-started_001_ford_model_t_in_1910_1.png', 'how-it-started_001_ford_model_t_in_1910_2.png']), JSON.stringify(q[0].outs));
    check('picture size follows the video format (9:16)', requests.every(u => /width=720&height=1280/.test(u)));
    check('finished message', /Finished: 2 of 2 prompts done/.test(await status()), await status());
    check('queue shows thumbnails', (await page.$$('#stQueue .qouts img')).length === 4);
    const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#stQueue .qbtns a')]);
    check('download one picture', dl.suggestedFilename() === 'how-it-started_001_ford_model_t_in_1910_1.png', dl.suggestedFilename());
    const downloads = [];
    page.on('download', d => downloads.push(d.suggestedFilename()));
    await page.click('#stDownloadAll');
    await page.waitForFunction(() => /sent to your Downloads/.test(document.getElementById('stStatus').textContent), null, { timeout: 15000 });
    await page.waitForTimeout(300);
    check('DOWNLOAD ALL saves 4 pictures', downloads.length === 4, downloads.join(', '));

    // SHOW ON VIDEO uses the picture for the video overlay
    await page.click('#stQueue .qbtns button:has-text("SHOW ON VIDEO")');
    await page.waitForFunction(() => picImg && document.getElementById('pmPicPlace').value === 'full');
    const px = await page.evaluate(() => { updatePreview(); const d = ctx.getImageData(canvas.width / 2, canvas.height / 2, 1, 1).data; return [d[0], d[1]]; });
    check('SHOW ON VIDEO puts the picture on the video', px[0] > 200 && px[1] < 60, JSON.stringify(px));

    // RUN again with the same prompts: nothing new to make
    requests = [];
    await page.click('#stRun');
    await page.waitForFunction(() => !stRunning);
    check('RUN ALL again does not remake finished pictures', requests.length === 0, requests.length);

    // STOP, then continue
    await page.fill('#stPrompts', 'one\ntwo\nthree');
    await page.selectOption('#stOutputs', '1');
    await page.evaluate(() => { PIC_GAP_MS = 1500; lastPicAt = 0; });
    await page.click('#stRun');
    await page.waitForFunction(() => stQueue[0] && stQueue[0].status === 'done', null, { timeout: 10000 });
    await page.click('#stStop');
    await page.waitForFunction(() => !stRunning, null, { timeout: 10000 });
    q = await items();
    check('STOP keeps finished pictures and stops the rest', q[0].status === 'done' && q[2].status === 'waiting' && /Stopped/.test(await status()), JSON.stringify(q.map(x => x.status)));
    await page.evaluate(() => { PIC_GAP_MS = 0; });
    await page.click('#stRun');
    await page.waitForFunction(() => !stRunning, null, { timeout: 20000 });
    q = await items();
    check('RUN ALL continues where it stopped', q.every(x => x.status === 'done') && q[0].outs.length === 1, JSON.stringify(q.map(x => x.status)));

    // Hand-off: Gemini, Frame to Video, 2 start pictures, 3 prompts
    await page.click('#stPlatforms button[data-p="gemini"]');
    await page.click('#stModes button[data-m="f2v"]');
    await page.setInputFiles('#stImgFile', [IMG1, IMG2]);
    check('2 start pictures listed', (await page.textContent('#stImgCount')) === '2 uploaded' && (await page.$$('#stImgList img')).length === 2);
    await page.click('#stImgList .stimg:nth-child(2) button:has-text("←")');
    check('arrows change the order', await page.evaluate(() => stImages.map(i => i.file.name).join() === 'two.jpg,one.png'));
    await page.fill('#stPrompts', 'the man walks\nthe man jumps\nthe man waves');
    await page.click('#stRun');
    await page.waitForFunction(() => window.__shared.length === 1);
    q = await items();
    check('pictures wrap around (1,2,1)', q.map(x => x.img).join() === '0,1,0', q.map(x => x.img).join());
    let shared = await page.evaluate(() => window.__shared[0]);
    check('RUN shares picture 1 + prompt 1 to the app', shared.files[0] === 'two.jpg:image/jpeg' && shared.text === 'Create a video that starts from the attached image: the man walks', JSON.stringify(shared));
    check('prompt 1 marked sent, NEXT points at prompt 2', q[0].status === 'sent' && /NEXT: PROMPT 2 OF 3/.test(await page.textContent('#stRun')), await page.textContent('#stRun'));
    await page.click('#stRun');
    await page.waitForFunction(() => window.__shared.length === 2);
    shared = await page.evaluate(() => window.__shared[1]);
    check('NEXT shares prompt 2 with picture 2', shared.files[0] === 'one.png:image/png' && /the man jumps$/.test(shared.text), JSON.stringify(shared));
    // COPY & OPEN on item 3 (no share)
    await page.click('#stQueue .qi:nth-child(3) button:has-text("COPY & OPEN")');
    await page.waitForFunction(() => window.__copied.length === 1);
    const opened = await page.evaluate(() => window.__opened.slice(-1)[0]);
    check('COPY & OPEN copies the prompt and opens Gemini', opened[0] === 'https://gemini.google.com/app' &&
      (await page.evaluate(() => window.__copied[0])) === 'Create a video that starts from the attached image: the man waves', JSON.stringify(opened));
    check('all sent', /All 3 prompts sent to Gemini/.test(await status()) && (await page.textContent('#stDoneCount')) === '3/3 done', await status());
    check('item message tells which picture to attach', /Attach start picture 1/.test(await page.textContent('#stQueue .qi:nth-child(3) .qmsg')));

    // Flow: plain prompt (no "Create…" prefix), text to video, no pictures needed
    await page.click('#stPlatforms button[data-p="flow"]');
    await page.click('#stModes button[data-m="t2v"]');
    await page.fill('#stPrompts', 'a red car drives\na blue car drives');
    await page.click('#stRun');
    await page.waitForFunction(() => window.__copied.length === 2);
    check('Flow gets the prompt as written and opens Flow', (await page.evaluate(() => window.__copied[1])) === 'a red car drives' &&
      (await page.evaluate(() => window.__opened.slice(-1)[0][0])) === 'https://labs.google/fx/tools/flow');
    check('Flow NEXT button waits for prompt 2', /NEXT: PROMPT 2 OF 2/.test(await page.textContent('#stRun')));
    check('Frame to Video without pictures is refused (new mode = new queue)', await (async () => {
      await page.click('#stModes button[data-m="f2v"]');
      await page.click('#stImgClear');
      await page.click('#stRun');
      return /Add start pictures/.test(await status());
    })(), await status());

    // Stickman: prompts become the story
    await page.click('#stPlatforms button[data-p="stickman"]');
    await page.fill('#stPrompts', 'Long ago people used candles\nThen Edison had an idea!');
    await page.click('#stRun');
    const st = await page.evaluate(() => window.__opened.slice(-1)[0][0]);
    check('Stickman opens with the story', st.startsWith('stickman.html#story=') && decodeURIComponent(st.split('=')[1]) === 'Long ago people used candles. Then Edison had an idea!', st);
    const sp = await context.newPage();
    await sp.goto('file://' + path.resolve(__dirname, '..', st));
    check('Stickman Director fills in the story', (await sp.inputValue('#story')) === 'Long ago people used candles. Then Edison had an idea!' && await sp.isVisible('#storyFromStudio'));
    check('story link removed from the address', !(await sp.evaluate(() => location.hash)));
    await sp.close();

    // Settings remembered
    await page.reload();
    check('platform and prompts remembered after reload', await page.evaluate(() => stPlatform === 'stickman') &&
      (await page.inputValue('#stPrompts')) === 'Long ago people used candles\nThen Edison had an idea!');

    await page.setViewportSize({ width: 360, height: 760 });
    check('no sideways scrolling at 360px', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      await page.evaluate(() => document.documentElement.scrollWidth));
    check('no page errors', errors.length === 0, errors.join(' | '));
  } catch (e) {
    check('test ran to the end', false, e.message);
  } finally {
    await browser.close();
    fs.rmSync(tmp, { recursive: true, force: true });
  }
  console.log(failures ? '\n' + failures + ' check(s) FAILED' : '\nAll studio tests passed');
  process.exit(failures ? 1 : 0);
})();
