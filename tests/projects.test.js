// Tests project management: save, open (with and without kept media),
// autosave, replace, delete, backup file and restore.
// Run: node tests/projects.test.js   (needs ffmpeg and playwright)
const { chromium, devices } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const PAGE = 'file://' + path.resolve(__dirname, '..', 'index.html');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'proj-test-'));
const VIDEO = path.join(tmp, 'beach.webm');
const OTHER = path.join(tmp, 'other.webm');
const SONG = path.join(tmp, 'song.wav');

let failures = 0;
function check(name, ok, detail) {
  console.log((ok ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? '  (' + detail + ')' : ''));
  if (!ok) failures++;
}
const enc = ['-c:v', 'libvpx', '-deadline', 'realtime', '-cpu-used', '8', '-c:a', 'libopus', '-shortest'];
execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'lavfi', '-i', 'testsrc=size=320x180:rate=30:duration=8', '-f', 'lavfi', '-i', 'sine=duration=8', ...enc, VIDEO]);
execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'lavfi', '-i', 'testsrc2=size=320x180:rate=30:duration=5', '-f', 'lavfi', '-i', 'sine=duration=5', ...enc, OTHER]);
execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'lavfi', '-i', 'sine=frequency=700:duration=6', SONG]);

(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const errors = [];
  const ctx = await browser.newContext({ ...devices['Pixel 7'], acceptDownloads: true });
  const page = await ctx.newPage();
  page.on('pageerror', e => errors.push(e.message));
  page.on('dialog', d => d.accept());

  const status = () => page.textContent('#projStatus');
  const waitStatus = re => page.waitForFunction(r => new RegExp(r).test(document.getElementById('projStatus').textContent), re, { timeout: 30000 });
  const state = () => page.evaluate(() => JSON.stringify(collectState()));
  const load = async (p, f) => { await p.setInputFiles('#file', f); await p.waitForFunction(() => document.getElementById('status').textContent === 'Video ready.'); };
  const count = p => p.evaluate(async () => (await projGetAll()).length);
  const mediaKeys = p => p.evaluate(async () => (await idb('media', 'readonly', st => st.getAllKeys())).length);

  try {
    await page.goto(PAGE);
    check('no saved projects at first', (await page.textContent('#projCount')) === '0' && await count(page) === 0);
    await page.click('#projSave');
    check('saving without a name asks for one', (await status()).includes('name'));
    await page.fill('#projName', 'Beach vlog');
    await page.click('#projSave');
    check('saving without a video asks for one', (await status()).includes('Import a video'));

    // Build a rich project.
    await load(page, VIDEO);
    await page.locator('#tplGrid .tpl', { hasText: 'YouTube vlog' }).click();
    await page.click('#styleBox summary');
    await page.evaluate(() => { const el = document.getElementById('capColor'); el.value = '#ff8800'; el.dispatchEvent(new Event('input')); el.dispatchEvent(new Event('change')); });
    await page.setInputFiles('#musicFile', SONG);
    await page.waitForFunction(() => document.getElementById('musicInfo').textContent.startsWith('♪ song.wav ('));
    await page.fill('#musicOffset', '1.5');
    await page.fill('#overlay', 'Sunny day at the beach');
    await page.selectOption('#exportFormat', 'webm');
    await page.selectOption('#sceneSens', 'high');
    await page.evaluate(() => {
      captions = [{ start: 0.5, end: 2, text: 'Hello beach' }, { start: 3, end: 5, text: 'Waves are big today' }]; renderCaptionList();
      const th = document.createElement('canvas'); th.width = th.height = 8; const thumb = th.toDataURL('image/jpeg');
      scenes = [{ start: 0, end: 4, thumb }, { start: 4, end: 8, thumb }]; renderScenes();
    });
    await page.fill('#start', '1'); await page.fill('#end', '3'); await page.click('#tlAddRange');
    await page.fill('#start', '5'); await page.fill('#end', '7.5'); await page.click('#tlAddRange');
    await page.evaluate(() => { timeline[0].trans = 'slideleft'; timeline[0].thumb = scenes[0].thumb; renderTimeline(); });
    await page.fill('#start', '0.5'); await page.fill('#end', '7');
    const before = await state();

    await page.click('#projSave');
    await waitStatus('^(Saved|Could not)');
    check('project saved', (await status()).startsWith('Saved at'), await status());
    check('list shows the project with its video kept', (await page.textContent('#projCount')) === '1' &&
      /video kept/.test(await page.textContent('#projList')), await page.textContent('#projList'));
    check('video and music stored', await mediaKeys(page) === 2);
    check('current project named', (await page.textContent('#projCurrent')).includes('Beach vlog'));

    // New session: reload, then open.
    await page.reload();
    check('project still listed after reload', (await page.textContent('#projCount')) === '1');
    check('page starts empty after reload', await page.evaluate(() => !currentFile && captions.length === 0 && timeline.length === 0));
    await page.click('#projListBox summary');
    await page.locator('#projList .clip', { hasText: 'Beach vlog' }).getByText('OPEN').click();
    await waitStatus('^(Opened|Could not)');
    await page.waitForFunction(() => music.loaded);
    const after = await state();
    check('opened with one tap (video and music from the phone)', (await status()).startsWith('Opened “Beach vlog”.'), await status());
    check('everything restored exactly', after === before, after === before ? 'identical' : 'DIFF\n' + before + '\n' + after);
    check('custom caption colour restored', await page.evaluate(() => capStyle.color) === '#ff8800');
    check('timeline transition and thumbnail restored', await page.evaluate(() => timeline[0].trans === 'slideleft' && !!timeline[0].thumb && document.querySelectorAll('#tlList .clip').length === 2));
    check('canvas uses the restored 16:9 format', await page.evaluate(() => canvas.width === 1280 && canvas.height === 720));

    // Exports work after opening (timeline with music, WebM as saved).
    await page.click('#export');
    await page.waitForFunction(() => /Export (completed|error)/.test(document.getElementById('status').textContent), null, { timeout: 60000 });
    check('export works after opening a project', (await page.textContent('#status')).startsWith('Export completed! WebM'), await page.textContent('#status'));

    // Autosave stores changes.
    await page.fill('#overlay', 'Changed title');
    await page.evaluate(() => saveProject(true));
    await waitStatus('^(Autosaved|Could not)');
    check('autosave stores changes', await page.evaluate(async () => (await projGet(currentProjectId)).state.settings.title) === 'Changed title', await status());
    check('autosave does not store the video again', await mediaKeys(page) === 2);

    // Tapping SAVE while an autosave is running still saves (not ignored).
    await page.fill('#overlay', 'Saved during autosave');
    const overlap = await page.evaluate(async () => {
      const auto = saveProject(true);              // autosave starts…
      document.getElementById('projSave').click(); // …and the user taps SAVE
      await auto;
      await new Promise(r => setTimeout(r, 500));
      return { status: document.getElementById('projStatus').textContent,
        title: (await projGet(currentProjectId)).state.settings.title };
    });
    check('SAVE during an autosave is not ignored', overlap.status.startsWith('Saved at') && overlap.title === 'Saved during autosave', JSON.stringify(overlap));
    // Put things back for the next steps (title, and a clear status line).
    await page.fill('#overlay', 'Changed title');
    await page.evaluate(async () => { await saveProject(true); projStatus(''); });

    // Second project without kept media; same-name replace.
    await page.uncheck('#projKeepMedia');
    await page.fill('#projName', 'No media');
    await page.click('#projSave');
    await waitStatus('^(Saved|Could not)');
    check('second project saved without media', (await count(page)) === 2 && /video not kept/.test(await page.textContent('#projList')));
    await page.fill('#projName', 'no MEDIA');
    await page.click('#projSave');
    await waitStatus('^(Saved|Not saved|Could not)');
    check('same name replaces instead of duplicating', (await count(page)) === 2);

    // Open the project without media: asks for the video again.
    await page.reload();
    await page.click('#projListBox summary');
    await page.locator('#projList .clip', { hasText: 'no MEDIA' }).getByText('OPEN').click();
    await waitStatus('CHOOSE VIDEO');
    check('asks to choose the video, naming the file', (await status()).includes('beach.webm') && await page.isVisible('#projRelinkBtn'), await status());
    await page.setInputFiles('#projRelink', VIDEO);
    await waitStatus('^Opened');
    check('opens after choosing the same video; asks to add music again', (await status()).includes('Add the music “song.wav” again'), await status());
    check('content restored after choosing the video', await page.evaluate(() => captions.length === 2 && timeline.length === 2 && document.getElementById('overlay').value === 'Changed title'));

    // A different file triggers a warning (accepted in this test).
    let warned = '';
    page.removeAllListeners('dialog');
    page.on('dialog', d => { warned += d.message(); d.accept(); });
    await page.locator('#projList .clip', { hasText: 'no MEDIA' }).getByText('OPEN').click();
    await waitStatus('CHOOSE VIDEO');
    await page.setInputFiles('#projRelink', OTHER);
    await waitStatus('^Opened');
    check('warns when a different video is chosen', /not the same file/.test(warned), warned.slice(0, 80));
    check('clips beyond the shorter video are dropped', await page.evaluate(() => timeline.every(c => c.end <= video.duration + 0.05)));

    // Backup file and restore on a "fresh phone".
    await page.locator('#projList .clip', { hasText: 'Beach vlog' }).getByText('OPEN').click();
    await waitStatus('^Opened');
    await page.waitForFunction(() => music.loaded);
    const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#projExport')]);
    const backup = path.join(tmp, 'backup.json'); await dl.saveAs(backup);
    check('backup file named after the project', dl.suggestedFilename() === 'Beach-vlog.project.json', dl.suggestedFilename());
    const backupState = await state();

    const ctx2 = await browser.newContext({ ...devices['Pixel 7'] });
    const p2 = await ctx2.newPage();
    p2.on('pageerror', e => errors.push('p2: ' + e.message));
    p2.on('dialog', d => d.accept());
    await p2.goto(PAGE);
    check('fresh phone has no projects', await count(p2) === 0);
    await p2.click('#projListBox summary');
    await p2.setInputFiles('#projImport', backup);
    await p2.waitForFunction(() => /^(Restored|Could not)/.test(document.getElementById('projStatus').textContent));
    check('backup restored into the list', (await p2.textContent('#projStatus')).startsWith('Restored “Beach vlog”'), await p2.textContent('#projStatus'));
    await p2.locator('#projList .clip', { hasText: 'Beach vlog' }).getByText('OPEN').click();
    await p2.waitForFunction(() => /CHOOSE VIDEO/.test(document.getElementById('projStatus').textContent));
    await p2.setInputFiles('#projRelink', VIDEO);
    await p2.waitForFunction(() => /^Opened/.test(document.getElementById('projStatus').textContent));
    await p2.setInputFiles('#musicFile', SONG);
    await p2.waitForFunction(() => document.getElementById('musicInfo').textContent.startsWith('♪ song.wav ('));
    const restored = await p2.evaluate(() => JSON.stringify(collectState()));
    check('restored backup matches the original project', restored === backupState, restored === backupState ? 'identical' : 'DIFF');

    // Damaged / foreign files are refused.
    const bad = path.join(tmp, 'bad.json'); fs.writeFileSync(bad, '{ not json');
    await p2.setInputFiles('#projImport', bad);
    await p2.waitForFunction(() => /^Could not restore/.test(document.getElementById('projStatus').textContent));
    check('damaged backup refused clearly', (await p2.textContent('#projStatus')).includes('damaged'));
    const foreign = path.join(tmp, 'foreign.json'); fs.writeFileSync(foreign, JSON.stringify({ hello: 1 }));
    await p2.setInputFiles('#projImport', foreign);
    await p2.waitForFunction(() => /not a project file/.test(document.getElementById('projStatus').textContent));
    check('foreign JSON refused clearly', true);
    await ctx2.close();

    // The 30-second autosave timer really fires (browser clock fast-forwarded).
    const ctx3 = await browser.newContext({ ...devices['Pixel 7'] });
    const p3 = await ctx3.newPage();
    p3.on('pageerror', e => errors.push('p3: ' + e.message));
    await p3.clock.install();
    await p3.goto(PAGE);
    await load(p3, VIDEO);
    await p3.fill('#projName', 'Timer test');
    await p3.click('#projSave');
    await p3.waitForFunction(() => /^Saved/.test(document.getElementById('projStatus').textContent));
    await p3.fill('#overlay', 'Typed after saving');
    await p3.clock.runFor(31000);
    await p3.waitForFunction(() => /^Autosaved/.test(document.getElementById('projStatus').textContent), null, { timeout: 10000 });
    check('autosave timer saves changes after 30 s', await p3.evaluate(async () => (await projGet(currentProjectId)).state.settings.title) === 'Typed after saving');
    await ctx3.close();

    // Delete removes the project and its stored media.
    page.removeAllListeners('dialog'); page.on('dialog', d => d.accept());
    await page.locator('#projList .clip', { hasText: 'Beach vlog' }).getByText('✕').click();
    await waitStatus('^Deleted');
    check('delete removes project and its media', (await count(page)) === 1 && await mediaKeys(page) === 0);
    check('storage use shown', /uses [\d.]+ MB of phone storage/.test(await page.textContent('#projStorage')), await page.textContent('#projStorage'));
    check('no horizontal scroll with projects', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));

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
