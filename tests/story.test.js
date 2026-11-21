// Tests the AI Story Studio (story.html): reading an AI answer, splitting
// narration, prompt writing, copy/open links, downloads, uploads, the
// Stickman hand-off and joining clips into one video.
// Run: node tests/story.test.js   (needs playwright and ffmpeg)
const { chromium, devices } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const PAGE = 'file://' + path.resolve(__dirname, '..', 'story.html');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'story-test-'));
const clip = (name, color, freq) => {
  const f = path.join(tmp, name);
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'lavfi', '-i', `color=c=${color}:size=360x640:rate=30:duration=1.5`,
    '-f', 'lavfi', '-i', `sine=frequency=${freq}:duration=1.5`, '-c:v', 'libvpx', '-deadline', 'realtime', '-cpu-used', '8',
    '-c:a', 'libopus', '-shortest', f]);
  return f;
};
const CLIP1 = clip('c1.webm', 'red', 440), CLIP2 = clip('c2.webm', 'blue', 660);
const IMG = path.join(tmp, 'frame.png');
execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'lavfi', '-i', 'color=c=green:size=360x640', '-frames:v', '1', IMG]);

let failures = 0;
function check(name, ok, detail) {
  console.log((ok ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? '  (' + detail + ')' : ''));
  if (!ok) failures++;
}

(async () => {
  const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || undefined, args: ['--autoplay-policy=no-user-gesture-required'] });
  const ctx = await browser.newContext({ ...devices['Pixel 7'], acceptDownloads: true });
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write']);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.addInitScript(() => { window.__opened = []; window.open = (u) => { window.__opened.push(u); return null; }; });
  await page.goto(PAGE);

  // 1. reading AI answers
  const parsed = await page.evaluate(() => {
    const a = Story.parseAnswer('Sure! Here it is:\n```json\n{"title":"How Pizza Started","scenes":[{"narration":"It began in Naples.","visual":"walks into a bakery","onScreenText":"Naples, 1700s"},{"narration":"Poor workers needed cheap food.","visual":"counts coins"},]}\n```\nEnjoy!');
    let err = ''; try { Story.parseAnswer('no json here'); } catch (e) { err = e.message; }
    const b = Story.parseAnswer('[{"narration":"One."},{"narration":"Two."}]');
    return { a, err, b: b.scenes.length };
  });
  check('reads JSON inside code fences with chatter and a trailing comma', parsed.a.title === 'How Pizza Started' && parsed.a.scenes.length === 2 && parsed.a.scenes[0].onScreenText === 'Naples, 1700s', JSON.stringify(parsed.a.scenes[1]));
  check('clear error when there is no JSON', /No JSON/.test(parsed.err), parsed.err);
  check('reads a bare list of scenes', parsed.b === 2);
  const qd = await page.evaluate(() => Story.quickDraft({ topic: 'How the light bulb started', count: 6 }));
  check('quick draft reads naturally', qd.title === 'How the light bulb started' && qd.scenes.length === 6 && /how did the light bulb really start\?/.test(qd.scenes[0].narration), qd.scenes[0].narration);

  // 2. splitting own narration
  const split = await page.evaluate(() => Story.splitNarration('One. Two is longer here. Three! Four? Five. Six is the end.', 3));
  check('splits narration into 3 scenes without cutting sentences', split.length === 3 && split.join(' ') === 'One. Two is longer here. Three! Four? Five. Six is the end.', JSON.stringify(split));
  check('never more scenes than sentences', (await page.evaluate(() => Story.splitNarration('Only one.', 6))).length === 1);

  // 3. AI writer button opens ChatGPT with the request, Gemini copies it
  await page.click('[data-write="chatgpt"]');
  check('asks for a topic first', /topic first/.test(await page.textContent('#storyMsg')));
  await page.fill('#topic', 'How the light bulb started');
  await page.selectOption('#sceneCount', '4');
  await page.selectOption('#sceneSec', '8');
  await page.click('[data-write="chatgpt"]');
  let opened = await page.evaluate(() => window.__opened.slice(-1)[0]);
  const q = decodeURIComponent((opened || '').split('?q=')[1] || '');
  check('ChatGPT opens with the writer prompt pre-filled', opened.startsWith('https://chatgpt.com/?q=') && /4-scene, 32-second/.test(q) && /at most 19 words/.test(q) && /light bulb/.test(q), q.slice(0, 80));
  await page.click('[data-write="gemini"]');
  opened = await page.evaluate(() => window.__opened.slice(-1)[0]);
  const clip1 = await page.evaluate(() => navigator.clipboard.readText());
  check('Gemini opens and the prompt is on the clipboard', opened === 'https://gemini.google.com/app' && /Reply with ONLY this JSON/.test(clip1));

  // 4. use an answer -> scenes + package
  await page.fill('#aiAnswer', JSON.stringify({ title: 'How the Light Bulb Started', scenes: [
    { narration: 'Long ago, nights were dark.', visual: 'holds a tiny candle in a dark room', onScreenText: 'Dark nights' },
    { narration: 'Inventors tried again and again, and failed.', visual: '', onScreenText: '1,000 tries' },
    { narration: 'Then came the turning point.', visual: 'looks up as a bulb glows', onScreenText: '1879' }] }));
  await page.click('#useAnswer');
  check('3 scene cards appear', (await page.$$('.scene')).length === 3);
  const info = await page.textContent('#pkgInfo');
  check('package summary', /3 scenes · 24s · 0\/3 images · 0\/3 clips/.test(info), info);
  check('package title', (await page.textContent('#pkgTitle')) === 'How the Light Bulb Started');

  // 5. prompts
  const vid0 = await page.inputValue('.scene[data-i="0"] [data-f="vidPrompt"]');
  check('video prompt: duration, format, background, start frame, narrator', /8-SECOND SCENE 1 OF 3/.test(vid0) && /vertical 9:16/.test(vid0) &&
    /midnight purple \(#1f1b45\)/.test(vid0) && /START FRAME/.test(vid0) && /says exactly: "Long ago, nights were dark\."/.test(vid0) && /No music\./.test(vid0), vid0.split('\n')[1]);
  const vid1 = await page.inputValue('.scene[data-i="1"] [data-f="vidPrompt"]');
  check('video prompt picks a visual when none is given', /stumbles over a pile of broken attempts/.test(vid1));
  const img0 = await page.inputValue('.scene[data-i="0"] [data-f="imgPrompt"]');
  check('image prompt: style, character, no text', /Flat 2D vector illustration/.test(img0) && /mustard-yellow scarf/.test(img0) && /holds a tiny candle/.test(img0) && /No text/.test(img0));
  await page.fill('.scene[data-i="0"] [data-f="narration"]', 'Before 1879, nights were dark.');
  check('editing narration updates the prompt', /says exactly: "Before 1879, nights were dark\."/.test(await page.inputValue('.scene[data-i="0"] [data-f="vidPrompt"]')));
  await page.fill('.scene[data-i="0"] [data-f="vidPrompt"]', 'MY OWN PROMPT');
  await page.fill('.scene[data-i="0"] [data-f="narration"]', 'Changed again.');
  check('hand-edited prompt is kept', (await page.inputValue('.scene[data-i="0"] [data-f="vidPrompt"]')) === 'MY OWN PROMPT');
  await page.click('.scene[data-i="0"] [data-a="reset"]');
  check('Rewrite prompts restores the generated one', /says exactly: "Changed again\."/.test(await page.inputValue('.scene[data-i="0"] [data-f="vidPrompt"]')));
  await page.selectOption('#format', '16:9');
  check('format change updates prompts', /horizontal 16:9/.test(await page.inputValue('.scene[data-i="0"] [data-f="vidPrompt"]')));
  await page.selectOption('#format', '9:16');

  // 6. next step flow
  check('next step = scene 1 image', /scene 1 start image on Gemini/.test(await page.textContent('#nextMsg')), await page.textContent('#nextMsg'));
  await page.click('#nextBtn');
  opened = await page.evaluate(() => window.__opened.slice(-1)[0]);
  check('next step opens Gemini and copies the image prompt', opened === 'https://gemini.google.com/app' && /Flat 2D vector/.test(await page.evaluate(() => navigator.clipboard.readText())));
  await page.setInputFiles('.scene[data-i="0"] [data-up="img"]', IMG);
  check('start image upload shows a thumbnail', !!(await page.$('.scene[data-i="0"] img.thumb')));
  await page.click('#skipImg');
  check('skip images -> next is a clip on Flow', /scene 1 video clip on Flow/.test(await page.textContent('#nextMsg')));
  await page.click('#vidPlat button[data-p="grok"]');
  await page.click('#nextBtn');
  opened = await page.evaluate(() => window.__opened.slice(-1)[0]);
  check('Grok opens with the video prompt pre-filled', opened.startsWith('https://grok.com/?q=') && /SCENE 1 OF 3/.test(decodeURIComponent(opened)));
  await page.click('.scene[data-i="2"] [data-a="open-vid"][data-p="flow"]');
  opened = await page.evaluate(() => window.__opened.slice(-1)[0]);
  check('Flow button opens Flow', opened === 'https://labs.google/fx/tools/flow');
  await page.setInputFiles('.scene[data-i="0"] [data-up="clip"]', CLIP1);
  await page.setInputFiles('.scene[data-i="1"] [data-up="clip"]', CLIP2);
  check('next step moves to scene 3', /scene 3 video clip/.test(await page.textContent('#nextMsg')));
  check('package counts clips', /2\/3 clips/.test(await page.textContent('#pkgInfo')));

  // 7. downloads
  const grab = async sel => { const d = page.waitForEvent('download'); await page.click(sel); const dl = await d; const f = path.join(tmp, dl.suggestedFilename()); await dl.saveAs(f); return [dl.suggestedFilename(), fs.readFileSync(f, 'utf8')]; };
  const [txtName, txt] = await grab('#dlTxt');
  check('video prompts .txt: 3 blocks, one line each', txtName === 'how-the-light-bulb-started-video-prompts.txt' && txt.trim().split('\n\n').length === 3 && !txt.trim().split('\n\n')[0].includes('\n'), txtName);
  const [, csv] = await grab('#dlCsv');
  check('.csv has header and 3 rows', csv.trim().split('\n')[0] === 'scene,seconds,narration,on_screen_text,image_prompt,video_prompt' && /^2,8,"Inventors tried again and again, and failed\."/m.test(csv));

  // 8. saved on the phone
  await page.reload();
  check('story is still there after reload', (await page.$$('.scene')).length === 3 && (await page.inputValue('#topic')) === 'How the light bulb started');
  check('uploaded clips need adding again after reload (not stored)', /0\/3 images · 0\/3 clips · images and clips are not kept/.test(await page.textContent('#pkgInfo')), await page.textContent('#pkgInfo'));
  await page.setInputFiles('.scene[data-i="0"] [data-up="clip"]', CLIP1);
  await page.setInputFiles('.scene[data-i="1"] [data-up="clip"]', CLIP2);
  await page.setInputFiles('.scene[data-i="2"] [data-up="img"]', IMG);

  // 9. layout
  await page.setViewportSize({ width: 360, height: 740 });
  check('no sideways scrolling at 360px', (await page.evaluate(() => document.documentElement.scrollWidth)) <= 360);

  // 10. join clips (2 clips of 1.5s + 1 image scene of 8s)
  await page.selectOption('.scene[data-i="2"] [data-f="dur"]', '4');
  await page.check('#burnCaps');
  await page.click('#joinBtn');
  await page.waitForFunction(() => window.__lastJoin, null, { timeout: 60000 });
  const j = await page.evaluate(() => window.__lastJoin);
  check('joined video made', !j.error && j.size > 10000, JSON.stringify(j));
  if (!j.error) {
    const d = page.waitForEvent('download'); await page.click('#joinLink button');
    const f = path.join(tmp, 'joined.' + j.ext); await (await d).saveAs(f);
    const probe = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_type,width,height', '-of', 'csv=p=0', f]).toString();
    check('joined video is 720x1280 with sound', /video,720,1280/.test(probe) && /audio/.test(probe), probe.replace(/\n/g, ' '));
    const dur = parseFloat(execFileSync('ffprobe', ['-v', 'error', '-count_packets', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString()) ||
      parseFloat(execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-count_frames', '-show_entries', 'stream=nb_read_frames', '-of', 'csv=p=0', f]).toString()) / 30;
    check('joined length ≈ 1.5 + 1.5 + 4 s', dur > 6 && dur < 8.5, dur.toFixed(2) + ' s');
    // colour check: red clip first, blue second, green image last
    const at = t => execFileSync('ffmpeg', ['-v', 'error', '-ss', String(t), '-i', f, '-frames:v', '1', '-vf', 'crop=10:10:100:100,scale=1:1', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-']);
    const c1 = at(0.6), c2 = at(2.2), c3 = at(5.0);
    check('scenes in order: red, blue, green', c1[0] > 150 && c1[2] < 90 && c2[2] > 150 && c2[0] < 90 && c3[1] > 90 && c3[0] < 90, [...c1, ...c2, ...c3].join(','));
  }

  // 11. hand-off to the Stickman Director
  await page.click('#toStick');
  await page.waitForURL(/stickman\.html/);
  const sc = await page.inputValue('#script');
  check('Stickman Director receives the story', /^3 title: How the Light Bulb Started/.test(sc) && /: Changed again\./.test(sc) && /fall: Inventors tried/.test(sc), sc.split('\n').slice(0, 2).join(' | '));

  check('no page errors', errors.length === 0, errors.join(' | '));
  await browser.close();
  console.log(failures ? failures + ' FAILED' : 'ALL PASSED');
  process.exit(failures ? 1 : 0);
})();
