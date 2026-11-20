// Tests video templates: built-in templates, applying, saving, deleting,
// persistence, and that content (video, captions, clips, Start/End, title
// text, music file) is never changed by a template.
// Run: node tests/templates.test.js   (needs ffmpeg and playwright)
const { chromium, devices } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const PAGE = 'file://' + path.resolve(__dirname, '..', 'index.html');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tpl-test-'));
const VIDEO = path.join(tmp, 'v.webm');
const SONG = path.join(tmp, 'song.wav');

let failures = 0;
function check(name, ok, detail) {
  console.log((ok ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? '  (' + detail + ')' : ''));
  if (!ok) failures++;
}
execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'lavfi', '-i', 'testsrc=size=320x180:rate=30:duration=6',
  '-f', 'lavfi', '-i', 'sine=duration=6', '-c:v', 'libvpx', '-deadline', 'realtime', '-cpu-used', '8', '-c:a', 'libopus', '-shortest', VIDEO]);
execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'lavfi', '-i', 'sine=frequency=600:duration=5', SONG]);

(async () => {
  const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY, bypass: 'localhost,127.0.0.1' } : undefined;
  const browser = await chromium.launch({ proxy, args: ['--autoplay-policy=no-user-gesture-required'] });
  const context = await browser.newContext({ ...devices['Pixel 7'], acceptDownloads: true });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('dialog', d => d.accept());

  const state = () => page.evaluate(() => ({
    ratio: document.getElementById('ratio').value, canvas: canvas.width + 'x' + canvas.height,
    fit: document.getElementById('fit').value, titlePos: document.getElementById('position').value,
    titleColor: document.getElementById('color').value, showCaptions: document.getElementById('showCaptions').checked,
    capPreset: document.getElementById('capPreset').value, capFont: capStyle.font,
    tlType: document.getElementById('tlType').value, tlDur: Number(document.getElementById('tlDur').value),
    tlDurLabel: document.getElementById('tlDurVal').textContent,
    tlFadeIn: document.getElementById('tlFadeIn').checked, tlFadeOut: document.getElementById('tlFadeOut').checked,
    musicVol: Number(document.getElementById('musicVol').value), musicVolLabel: document.getElementById('musicVolVal').textContent,
    videoVol: Number(document.getElementById('videoVol').value), musicDuck: document.getElementById('musicDuck').checked,
    clipTrans: timeline.map(c => c.trans),
    content: JSON.stringify({ caps: captions, clips: timeline.map(c => [c.start, c.end]), start: document.getElementById('start').value,
      end: document.getElementById('end').value, title: document.getElementById('overlay').value, music: music.loaded, src: video.src })
  }));
  const clickTpl = name => page.locator('#tplGrid .tpl', { hasText: name }).click();

  try {
    await page.goto(PAGE);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    check('7 built-in templates shown', await page.locator('#tplGrid .tpl').count() === 7);
    check('no horizontal scroll with templates', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));

    // Set up content that templates must not touch.
    await page.setInputFiles('#file', VIDEO);
    await page.waitForFunction(() => document.getElementById('status').textContent === 'Video ready.');
    await page.setInputFiles('#musicFile', SONG);
    await page.waitForFunction(() => /^♪/.test(document.getElementById('musicInfo').textContent));
    await page.fill('#overlay', 'My title');
    await page.evaluate(() => { captions = [{ start: 0, end: 5, text: 'Hello' }]; renderCaptionList(); });
    await page.fill('#start', '0'); await page.fill('#end', '2'); await page.click('#tlAddRange');
    await page.fill('#start', '3'); await page.fill('#end', '5'); await page.click('#tlAddRange');
    await page.fill('#start', '1'); await page.fill('#end', '4');
    const content0 = (await state()).content;

    const expect = {
      'Reels / TikTok / Shorts': { ratio: '9:16', canvas: '720x1280', capPreset: 'creator', tlType: 'fade', tlDur: 0.4, musicVol: 35 },
      'YouTube vlog': { ratio: '16:9', canvas: '1280x720', capPreset: 'box', tlType: 'fade', tlFadeIn: true, musicVol: 25 },
      'Tutorial / how-to': { ratio: '16:9', fit: 'contain', titleColor: '#00e5ff', tlType: 'wipe', musicVol: 15 },
      'Fast montage': { ratio: '9:16', showCaptions: false, tlType: 'slideleft', tlDur: 0.3, musicVol: 80, videoVol: 30, musicDuck: false },
      'Story / quote': { titlePos: 'center', capPreset: 'bold', capFont: 'anton', tlType: 'black' },
      'Square post': { ratio: '1:1', canvas: '1080x1080', capPreset: 'classic' },
      'Cinematic': { ratio: '16:9', capPreset: 'minimal', tlType: 'black', tlDur: 1.2, tlDurLabel: '1.2' }
    };
    for (const [name, want] of Object.entries(expect)) {
      await clickTpl(name);
      const s = await state();
      const bad = Object.entries(want).filter(([k, v]) => s[k] !== v).map(([k, v]) => k + '=' + s[k] + '≠' + v);
      check('template "' + name + '" applies its settings', bad.length === 0, bad.join(', ') || 'ok');
      check('  …and updates timeline clips + labels', s.clipTrans.every(t => t === s.tlType) && s.musicVolLabel === String(s.musicVol) &&
        s.tlDurLabel === s.tlDur.toFixed(1), JSON.stringify(s.clipTrans));
      check('  …and leaves content unchanged', s.content === content0);
    }
    check('applied template is highlighted', await page.locator('#tplGrid .tpl.active').count() === 1 &&
      (await page.textContent('#tplGrid .tpl.active b')) === 'Cinematic');
    check('status message names the template', (await page.textContent('#tplStatus')).includes('Cinematic'));

    // Save a custom template with a custom caption colour.
    await clickTpl('Square post');
    await page.click('#tplBox summary');
    await page.click('#styleBox summary');
    await page.evaluate(() => { const el = document.getElementById('capColor'); el.value = '#ff00ff'; el.dispatchEvent(new Event('input')); el.dispatchEvent(new Event('change')); });
    await page.selectOption('#tlType', 'zoom');
    await page.fill('#tplName', '');
    await page.click('#tplSave');
    check('saving without a name asks for one', (await page.textContent('#tplStatus')).includes('name'));
    await page.fill('#tplName', 'Purple square');
    await page.click('#tplSave');
    check('custom template saved', await page.locator('#myTplList .clip').count() === 1 && (await page.textContent('#tplStatus')).includes('saved'));

    // Change everything, then apply the saved one.
    await clickTpl('YouTube vlog');
    await page.locator('#myTplList .clip', { hasText: 'Purple square' }).getByText('APPLY').click();
    const p = await state();
    check('custom template restores its settings (incl. custom caption colour)',
      p.ratio === '1:1' && p.tlType === 'zoom' && p.capPreset === 'custom' && await page.evaluate(() => capStyle.color) === '#ff00ff',
      JSON.stringify({ ratio: p.ratio, tlType: p.tlType, capPreset: p.capPreset }));

    // Persistence and delete
    await page.reload();
    check('saved template survives a reload', await page.locator('#myTplList .clip').count() === 1);
    await page.click('#tplBox summary');
    await page.fill('#tplName', 'purple SQUARE');
    await page.click('#tplSave');
    check('saving with the same name replaces (no duplicate)', await page.locator('#myTplList .clip').count() === 1);
    await page.locator('#myTplList .clip').getByText('✕').click();
    check('custom template deleted', await page.locator('#myTplList .clip').count() === 0 && (await page.textContent('#myTplNote')) === 'No saved templates yet.');

    // Export still works after applying a template.
    await page.setInputFiles('#file', VIDEO);
    await page.waitForFunction(() => document.getElementById('status').textContent === 'Video ready.');
    await clickTpl('Reels / TikTok / Shorts');
    await page.fill('#start', '0'); await page.fill('#end', '1.5');
    await page.click('#export');
    await page.waitForFunction(() => /Export (completed|error)/.test(document.getElementById('status').textContent), null, { timeout: 30000 });
    check('export works after applying a template', (await page.textContent('#status')).startsWith('Export completed'), await page.textContent('#status'));

    // Storage blocked: templates still apply, saving reports a clear message.
    const ctx2 = await browser.newContext({ ...devices['Pixel 7'] });
    const p2 = await ctx2.newPage();
    await p2.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); } });
    });
    const errs2 = []; p2.on('pageerror', e => errs2.push(e.message));
    await p2.goto(PAGE);
    await p2.locator('#tplGrid .tpl', { hasText: 'YouTube vlog' }).click();
    await p2.click('#tplBox summary'); await p2.fill('#tplName', 'x'); await p2.click('#tplSave');
    check('storage blocked: templates still apply, clear save message',
      (await p2.inputValue('#ratio')) === '16:9' && (await p2.textContent('#tplStatus')).includes('Could not save') && errs2.length === 0,
      (await p2.textContent('#tplStatus')) + ' ' + errs2.join('|'));
    await ctx2.close();

    check('no JavaScript errors', errors.length === 0, errors.join(' | '));
  } catch (e) {
    check('test run', false, e.message);
  } finally {
    await browser.close();
    fs.rmSync(tmp, { recursive: true, force: true });
  }
  console.log(failures ? '\n' + failures + ' check(s) FAILED' : '\nAll checks passed');
  process.exit(failures ? 1 : 0);
})();
