// Tests background music: volume, fades, ducking under speech, start offset,
// loop, video volume, timeline, preview play/pause, remove.
// Sound in the exported files is measured per frequency (Goertzel):
//   440 Hz  = the video's own sound ("speech"), only between 3 s and 5 s
//   1000 Hz = music for its first 4 s, 1500 Hz = music after 4 s
// Run: node tests/music.test.js   (needs ffmpeg with libmp3lame, playwright)
const { chromium, devices } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const PAGE = 'file://' + path.resolve(__dirname, '..', 'index.html');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'music-test-'));
const VIDEO = path.join(tmp, 'talk.webm');
const SONG = path.join(tmp, 'song.mp3');
const SHORT = path.join(tmp, 'short.mp3');

let failures = 0;
function check(name, ok, detail) {
  console.log((ok ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? '  (' + detail + ')' : ''));
  if (!ok) failures++;
}
const ff = args => execFileSync('ffmpeg', ['-loglevel', 'error', '-y', ...args], { maxBuffer: 512 * 1024 * 1024 });

ff(['-f', 'lavfi', '-i', 'testsrc=size=320x180:rate=30:duration=8',
  '-f', 'lavfi', '-i', "sine=frequency=440:duration=8,volume='between(t,3,5)*0.8':eval=frame",
  '-c:v', 'libvpx', '-deadline', 'realtime', '-cpu-used', '8', '-b:v', '400k', '-c:a', 'libopus', '-b:a', '128k', VIDEO]);
ff(['-f', 'lavfi', '-i', "aevalsrc='0.5*sin(2*PI*if(lt(t,4),1000,1500)*t)':s=44100:d=10", '-c:a', 'libmp3lame', '-b:a', '192k', SONG]);
ff(['-f', 'lavfi', '-i', "aevalsrc='0.5*sin(2*PI*1000*t)':s=44100:d=2", '-c:a', 'libmp3lame', '-b:a', '192k', SHORT]);

// Decode audio and measure tone levels in a time window.
function audioOf(file) {
  // Left channel only: works the same for mono and stereo recordings.
  const raw = ff(['-i', file, '-vn', '-af', 'pan=mono|c0=c0', '-ar', '16000', '-f', 'f32le', '-']);
  const pcm = new Float32Array(raw.buffer, raw.byteOffset, raw.length / 4);
  const level = (f, t0, t1) => {
    const a = Math.max(0, Math.floor(t0 * 16000)), b = Math.min(pcm.length, Math.floor(t1 * 16000));
    const n = b - a; if (n <= 0) return 0;
    const k = 2 * Math.cos(2 * Math.PI * f / 16000);
    let s1 = 0, s2 = 0;
    for (let i = a; i < b; i++) { const s0 = pcm[i] + k * s1 - s2; s2 = s1; s1 = s0; }
    return 2 * Math.sqrt(Math.max(0, s1 * s1 + s2 * s2 - k * s1 * s2)) / n;
  };
  return { level, seconds: pcm.length / 16000 };
}
const r3 = x => Math.round(x * 1000) / 1000;

(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const context = await browser.newContext({ ...devices['Pixel 7'], acceptDownloads: true });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('dialog', d => d.accept());

  const set = (id, v) => page.evaluate(([id, v]) => {
    const el = document.getElementById(id);
    if (el.type === 'checkbox') el.checked = v; else el.value = v;
    el.dispatchEvent(new Event('input')); el.dispatchEvent(new Event('change'));
  }, [id, v]);
  const loadMusic = async f => {
    await page.setInputFiles('#musicFile', f);
    await page.waitForFunction(() => /^(♪|Could not)/.test(document.getElementById('musicInfo').textContent));
  };
  let n = 0;
  const exportRange = async (a, b) => {
    await page.fill('#start', String(a)); await page.fill('#end', String(b));
    await page.click('#export');
    await page.waitForFunction(() => /Export (completed|error)/.test(document.getElementById('status').textContent), null, { timeout: 60000 });
    const st = await page.textContent('#status');
    if (!st.startsWith('Export completed')) throw new Error(st);
    const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#result a')]);
    const out = path.join(tmp, 'out' + (++n) + '.webm');
    await dl.saveAs(out);
    if (process.env.SHOT_DIR) fs.copyFileSync(out, path.join(process.env.SHOT_DIR, 'music' + n + '.webm'));
    return audioOf(out);
  };

  try {
    await page.goto(PAGE);
    check('no mixer before music is added (old audio path untouched)', await page.evaluate(() => mixer === null));
    await page.setInputFiles('#file', VIDEO);
    await page.waitForFunction(() => document.getElementById('status').textContent === 'Video ready.');

    await loadMusic(SONG);
    check('MP3 music loads and shows its length', /^♪ song\.mp3 \(10\.0 s\)/.test(await page.textContent('#musicInfo')), await page.textContent('#musicInfo'));
    check('music controls appear', await page.isVisible('#musicVol'));
    check('no horizontal scroll with music controls', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));

    // Main export: vol 50%, fade in 1 s, fade out 2 s, ducking to 30%.
    await set('musicVol', 50); await set('musicFadeIn', 1); await set('musicFadeOut', 2);
    await set('musicDuck', true); await set('musicDuckLevel', 30);
    const A = await exportRange(0, 8);
    const full = A.level(1000, 2.0, 2.6);
    const start = A.level(1000, 0.0, 0.25);
    const ducked = A.level(1000, 3.4, 3.9);
    const duckedB = A.level(1500, 4.2, 4.8);
    const back = A.level(1500, 5.5, 5.9);
    const end = A.level(1500, 7.65, 7.95);
    const speech = A.level(440, 3.4, 4.6);
    console.log('     levels:', JSON.stringify({ start: r3(start), full: r3(full), ducked: r3(ducked), duckedB: r3(duckedB), back: r3(back), end: r3(end), speech: r3(speech) }));
    check('music is in the export', full > 0.05, r3(full));
    check('music volume 50% of a 0.5 song ≈ 0.25', full > 0.19 && full < 0.31, r3(full));
    check('fade in: music starts quiet', start < full * 0.4, r3(start) + ' vs ' + r3(full));
    check('ducking: music lowered while the video "talks"', ducked < full * 0.5 && duckedB < full * 0.5, r3(ducked) + ', ' + r3(duckedB) + ' vs ' + r3(full));
    check('ducking: music comes back after talking', back > duckedB * 1.5, r3(back) + ' vs ' + r3(duckedB));
    check('fade out: music quiet at the end', end < back * 0.4, r3(end) + ' vs ' + r3(back));
    check("video's own sound kept at its level (0.1)", speech > 0.075 && speech < 0.125, r3(speech));
    check('music follows the song (1500 Hz after 4 s, not before)', A.level(1500, 2.0, 2.6) < full * 0.15 && A.level(1000, 5.5, 5.9) < back * 0.3);
    check('music stops after export', await page.evaluate(() => music.el.paused));

    // Volume 100% should be twice 50% (same window, no ducking, no fade).
    await set('musicVol', 100); await set('musicFadeIn', 0); await set('musicDuck', false);
    const V100 = await exportRange(0, 2.5);
    await set('musicVol', 50);
    const V50 = await exportRange(0, 2.5);
    const ratio = V50.level(1000, 0.5, 2.0) / V100.level(1000, 0.5, 2.0);
    check('volume slider: 50% is half of 100%', ratio > 0.42 && ratio < 0.58, ratio.toFixed(2));

    // Start offset 4 s: the first part of the export already has 1500 Hz.
    await set('musicOffset', 4); await set('musicFadeIn', 0); await set('musicDuck', false);
    const B = await exportRange(0, 2.5);
    check('start offset: song starts 4 s in', B.level(1500, 0.5, 1.5) > 0.1 && B.level(1000, 0.5, 1.5) < 0.03,
      r3(B.level(1500, 0.5, 1.5)) + ' / ' + r3(B.level(1000, 0.5, 1.5)));
    await set('musicOffset', 0);

    // Video volume 0
    await set('videoVol', 0);
    const C = await exportRange(2.5, 5.5);
    check("video's own sound can be turned off", C.level(440, 1.0, 2.0) < 0.02, r3(C.level(440, 1.0, 2.0)));
    await set('videoVol', 100);

    // Loop: 2 s song, 5 s export.
    await loadMusic(SHORT);
    await set('musicFadeOut', 0);
    const D = await exportRange(0, 5);
    check('loop on: short song repeats', D.level(1000, 3.0, 3.6) > 0.1 && D.level(1000, 4.2, 4.7) > 0.1, r3(D.level(1000, 4.2, 4.7)));
    await set('musicLoop', false);
    const E = await exportRange(0, 5);
    check('loop off: music stops when the song ends', E.level(1000, 0.5, 1.5) > 0.1 && E.level(1000, 3.0, 4.5) < 0.02, r3(E.level(1000, 3.0, 4.5)));
    await set('musicLoop', true);

    // Timeline export includes the music.
    await loadMusic(SONG);
    await set('musicFadeIn', 0);
    await page.fill('#start', '0'); await page.fill('#end', '2'); await page.click('#tlAddRange');
    await page.fill('#start', '5'); await page.fill('#end', '7'); await page.click('#tlAddRange');
    await page.click('#export');
    await page.waitForFunction(() => /Export (completed|error)/.test(document.getElementById('status').textContent), null, { timeout: 60000 });
    const [dlT] = await Promise.all([page.waitForEvent('download'), page.click('#result a')]);
    const outT = path.join(tmp, 'timeline.webm'); await dlT.saveAs(outT);
    const T = audioOf(outT);
    check('timeline export includes the music', T.level(1000, 1.0, 2.5) > 0.1, r3(T.level(1000, 1.0, 2.5)));
    check('timeline: no extra players left', await page.evaluate(() => document.querySelectorAll('video').length === 1 && !busy));
    await page.evaluate(() => { timeline = []; renderTimeline(); });

    // Preview: PLAY starts the music in sync, PAUSE stops it.
    await page.fill('#start', '0'); await page.fill('#end', '8');
    await page.evaluate(() => { video.currentTime = 1; });
    await page.waitForTimeout(300);
    await page.click('#play');
    await page.waitForTimeout(1200);
    const p = await page.evaluate(() => ({ playing: !music.el.paused, vt: video.currentTime, mt: music.el.currentTime }));
    check('PLAY: music plays in sync with the video', p.playing && Math.abs(p.vt - p.mt) < 0.35, JSON.stringify(p));
    await page.click('#pause');
    await page.waitForTimeout(200);
    check('PAUSE: music stops', await page.evaluate(() => music.el.paused));

    // Remove music: export has no music, video sound back to normal.
    await page.click('#musicRemove');
    check('remove hides the controls', !(await page.isVisible('#musicVol')) && (await page.textContent('#musicInfo')) === 'No music added.');
    const F = await exportRange(2.5, 5.5);
    check('after remove: no music, video sound kept', F.level(1000, 0.2, 2.5) < 0.02 && F.level(1500, 0.2, 2.5) < 0.02 && F.level(440, 1.0, 2.0) > 0.075,
      r3(F.level(1000, 0.2, 2.5)) + ' / ' + r3(F.level(440, 1.0, 2.0)));

    // A file that is not audio
    await loadMusic(path.join(__dirname, 'music.test.js'));
    check('non-audio file gives a clear message', (await page.textContent('#musicInfo')).startsWith('Could not read'));

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
