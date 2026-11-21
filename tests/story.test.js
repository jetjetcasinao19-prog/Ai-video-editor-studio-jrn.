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

  // 12. story style gallery
  await page.setViewportSize({ width: 412, height: 900 });
  const gal = await page.evaluate(() => ({ n: Story.STYLES.length, cards: document.querySelectorAll('#gallery .card').length, count: document.getElementById('galCount').textContent }));
  check('gallery shows every style', gal.n >= 35 && gal.cards === gal.n && /styles · All/.test(gal.count), JSON.stringify(gal));
  const ids = await page.evaluate(() => Story.STYLES.map(s => s.id));
  for (const want of ['tagalog-drama', 'ai-drama', 'anime-drama', 'pinoy-folklore', 'stick', 'animated-short', 'food-body', 'herbal', 'ugc-ad', 'podcast-hugot',
    'reverse-history', 'jeepney-diaries', 'blotter', 'sari-sari', 'halloween', 'unsolved', 'luxury-files', 'pera-matters', 'pov-history', 'kapre-vlog',
    'creature-comedy', 'time-travel-pov', 'micro-drama', 'claude-cartoon', 'stickman-horror', 'silhouette-explainer', 'caricature-doc', 'family-cartoon', 'fruit-drama', 'cat-soap', 'creature-vlog', 'asmr', 'street-interview', 'animal-podcast', 'how-it-started'])
    if (!ids.includes(want)) check('style ' + want + ' exists', false);
  const covers = ids.filter(id => fs.existsSync(path.resolve(__dirname, '..', 'img', 'styles', id + '.webp')));
  check('every style has a cover picture', covers.length === ids.length, covers.length + '/' + ids.length);
  const fill = await page.evaluate(() => { const c = document.querySelector('#gallery .card .cov'), i = c.querySelector('img'); const a = c.getBoundingClientRect(), b = i.getBoundingClientRect();
    return Math.abs(a.left - b.left) < 1 && Math.abs(a.width - b.width) < 1 && Math.abs(a.height - b.height) < 1; });
  check('cover picture fills the whole card (no emoji strip)', fill);
  await page.click('#galCats button[data-c="horror"]');
  const horror = await page.$$eval('#gallery .card b', els => els.map(e => e.textContent));
  check('category filter', horror.includes('Pinoy Folklore Horror') && !horror.includes('UGC Product Ad'), horror.join(', '));
  await page.click('#galCats button[data-c="all"]');
  await page.fill('#galSearch', 'tagalog');
  const tg = await page.$$eval('#gallery .card b', els => els.map(e => e.textContent));
  check('search finds Tagalog styles', tg.length >= 5 && tg.includes('Sari-Sari Store Confessions'), tg.length);
  await page.fill('#galSearch', '');
  await page.check('#galTrend');
  const tr = await page.evaluate(() => [...document.querySelectorAll('#gallery .card')].every(c => c.querySelector('.badge') && c.querySelector('.badge').textContent === 'TRENDING'));
  check('trending only', tr);
  await page.uncheck('#galTrend');

  // 13. picking a style changes everything
  await page.click('#gallery .card[data-id="tagalog-drama"]');
  const applied = await page.evaluate(() => ({ niche: niche.value, n: sceneCount.value, sec: sceneSec.value, lang: lang.value, voice: voiceType.value,
    ch: character.value, bgHidden: document.getElementById('bgBox').hidden, on: document.querySelector('.card.on').dataset.id, now: styleNow.textContent }));
  check('style sets scenes, seconds, language, voice, cast', applied.niche === 'tagalog-drama' && applied.n === '8' && applied.sec === '8' && applied.lang === 'Tagalog' &&
    applied.voice === 'dialogue' && /street-food vendor/.test(applied.ch) && applied.bgHidden && applied.on === 'tagalog-drama' && /Using Tagalog Drama/.test(applied.now), JSON.stringify(applied));
  await page.fill('#topic', 'Ang anak na umalis');
  await page.click('[data-write="chatgpt"]');
  const wq = decodeURIComponent((await page.evaluate(() => window.__opened.slice(-1)[0])).split('?q=')[1]);
  check('writer prompt follows the style', /Style: Tagalog Drama/.test(wq) && /8-scene, 64-second/.test(wq) && /Story beats, one per scene: 1\. emotional hook/.test(wq) &&
    /every spoken word in Tagalog/.test(wq) && /Name: line/.test(wq) && /teleserye/.test(wq) && !/How it Started/.test(wq), wq.split('\n')[1]);
  const vp = await page.inputValue('.scene[data-i="0"] [data-f="vidPrompt"]');
  check('video prompt follows the style', /^TAGALOG DRAMA — 8-SECOND SCENE 1 OF 3/.test(vp) && /cinematic photoreal drama/.test(vp) && /lip-sync/.test(vp) &&
    /DIALOGUE — In Tagalog/.test(vp) && !/solid .* background/.test(vp), vp.split('\n').slice(0, 2).join(' | '));
  const ip = await page.inputValue('.scene[data-i="0"] [data-f="imgPrompt"]');
  check('image prompt follows the style', /^Cinematic photoreal film still/.test(ip) && !/solid/.test(ip), ip.slice(0, 60));
  await page.click('#gallery .card[data-id="asmr"]');
  const asmr = await page.inputValue('.scene[data-i="0"] [data-f="vidPrompt"]');
  check('ASMR style: no speech', /no speech, rich natural sound effects/.test(asmr) && !/says exactly/.test(asmr) && !(await page.isChecked('#narrator')));
  await page.click('#gallery .card[data-id="creature-vlog"]');
  check('vlog style: selfie camera talking', /handheld selfie camera/.test(await page.inputValue('.scene[data-i="0"] [data-f="vidPrompt"]')));
  await page.reload();
  check('chosen style is remembered', (await page.inputValue('#niche')) === 'creature-vlog' && !!(await page.$('#gallery .card.on[data-id="creature-vlog"]')));

  // 14. free start images (picture service mocked)
  let picMode = 'ok', picUrl = '';
  await page.route('https://image.pollinations.ai/**', route => {
    picUrl = route.request().url();
    if (picMode === 'limit') return route.fulfill({ status: 429, body: 'slow down', headers: { 'access-control-allow-origin': '*' } });
    return route.fulfill({ status: 200, contentType: 'image/png', headers: { 'access-control-allow-origin': '*' }, body: fs.readFileSync(IMG) });
  });
  await page.click('.scene[data-i="1"] [data-a="free-img"]');
  await page.waitForSelector('.scene[data-i="1"] img.thumb', { timeout: 10000 });
  check('free image becomes the scene start image', /width=720&height=1376/.test(picUrl) && /Bigfoot/.test(decodeURIComponent(picUrl)) &&
    /Start image made/.test(await page.textContent('.scene[data-i="1"] .genbox')), decodeURIComponent(picUrl).slice(36, 90));
  const cropped = await page.evaluate(() => new Promise(r => { const im = document.querySelector('.scene[data-i="1"] img.thumb'); const go = () => r([im.naturalWidth, im.naturalHeight]); im.complete ? go() : im.onload = go; }));
  check('service mark strip is cut off (bottom 7%)', cropped[0] === 360 && cropped[1] === 595, cropped.join('x'));
  picMode = 'limit';
  await page.click('.scene[data-i="2"] [data-a="free-img"]');
  await page.waitForFunction(() => /every 45 seconds/.test(document.querySelector('.scene[data-i="2"] .genbox').textContent), null, { timeout: 10000 });
  check('free picture limit message', true);
  picMode = 'ok';
  await page.click('#skipImg'); // images back on (was skipped earlier)
  await page.click('#imgPlat button[data-p="free"]');
  check('Next step offers the free picture maker', /start image on Free \(in app\)/.test(await page.textContent('#nextMsg')), await page.textContent('#nextMsg'));
  const before = await page.evaluate(() => window.__opened.length);
  await page.click('#nextBtn');
  await page.waitForFunction(() => /Start image made/.test(document.querySelector('.scene[data-i="0"] .genbox').textContent), null, { timeout: 10000 });
  check('Next step makes the image in the app (no site opened)', (await page.evaluate(() => window.__opened.length)) === before);
  await page.unroute('https://image.pollinations.ai/**');
  await page.setViewportSize({ width: 360, height: 740 });
  check('no sideways scrolling at 360px with the gallery', (await page.evaluate(() => document.documentElement.scrollWidth)) <= 360);
  await page.click('#gallery .card[data-id="stick"]');

  // 15. my Google Flow
  await page.setViewportSize({ width: 412, height: 900 });
  check('Flow not set up yet', /Not set up yet/.test(await page.textContent('#flowState')));
  await page.fill('#flowLink', 'https://evil.example.com/tools/flow');
  await page.click('#flowSave');
  check('rejects a non-Flow link', /not a Flow link/.test(await page.textContent('#flowState')));
  const myFlow = 'https://labs.google/fx/tools/flow/project/abc-123_XYZ';
  await page.fill('#flowLink', myFlow);
  await page.click('#flowSave');
  check('saves my Flow project', /Connected to your Flow project/.test(await page.textContent('#flowState')));
  await page.click('.scene[data-i="0"] [data-a="open-vid"][data-p="flow"]');
  check('Flow buttons open my project', (await page.evaluate(() => window.__opened.slice(-1)[0])) === myFlow);
  await page.click('#flowTest');
  check('Open my project button', (await page.evaluate(() => window.__opened.slice(-1)[0])) === myFlow);
  check('accepts a localized Flow link', await page.evaluate(() => { localStorage.setItem('story.flow', 'https://labs.google/fx/es/tools/flow/project/9'); return Story.flowLink() === 'https://labs.google/fx/es/tools/flow/project/9'; }));
  await page.reload();
  check('Flow project remembered after reload', /Connected/.test(await page.textContent('#flowState')) && (await page.inputValue('#flowLink')).includes('/fx/es/tools/flow/project/9'));
  await page.click('#flowClear');
  check('Forget clears it', /Not set up yet/.test(await page.textContent('#flowState')));

  // 16. Claude writer + Claude cartoon styles + word-pop captions
  await page.click('[data-write="claude"]');
  const cl = await page.evaluate(() => window.__opened.slice(-1)[0]);
  check('Claude opens with the writer prompt', cl.startsWith('https://claude.ai/new?q=') && /Reply with ONLY this JSON/.test(decodeURIComponent(cl)));
  await page.click('#galCats button[data-c="claude"]');
  const cc = await page.$$eval('#gallery .card b', els => els.map(e => e.textContent));
  check('Claude Cartoons category', cc.includes('Claude Cartoon Shorts') && cc.includes('Stickman Horror') && cc.includes('Silhouette History Explainer') && cc.length === 5, cc.join(', '));
  await page.click('#gallery .card[data-id="claude-cartoon"]');
  check('Claude Cartoon style turns on word-pop captions', (await page.inputValue('#capStyle')) === 'wordpop' && (await page.isChecked('#burnCaps')));
  check('Claude Cartoon image prompt describes the egg-head look', /egg-shaped head/.test(await page.inputValue('.scene[data-i="0"] [data-f="imgPrompt"]')));
  const wp = await page.evaluate(() => {
    const c = document.createElement('canvas'); c.width = 360; c.height = 640; const x = c.getContext('2d');
    const lit = () => { const d = x.getImageData(0, 0, 360, 640).data; let n = 0, top = 640, bot = 0; for (let i = 0; i < d.length; i += 4) if (d[i] > 240 && d[i + 1] > 240) { n++; const y = Math.floor(i / 4 / 360); top = Math.min(top, y); bot = Math.max(bot, y); } return { n, top, bot }; };
    x.fillStyle = '#336'; x.fillRect(0, 0, 360, 640); Story.drawWordPop(x, 'He sold ice to the tropics', 0.05); const a = lit();
    x.fillStyle = '#336'; x.fillRect(0, 0, 360, 640); Story.drawWordPop(x, 'He sold ice to the tropics', 0.9); const b = lit();
    return { a, b };
  });
  check('word-pop shows a few words in the middle and changes over time', wp.a.n > 200 && wp.a.top > 300 && wp.a.bot < 480 && Math.abs(wp.a.n - wp.b.n) > 20, JSON.stringify(wp));
  await page.click('#galCats button[data-c="all"]');
  await page.click('#gallery .card[data-id="stick"]');

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
