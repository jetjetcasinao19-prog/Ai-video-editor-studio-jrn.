// Tests MP4 export (and the WebM choice / fallback), checking the real files.
// Run: node tests/mp4-export.test.js   (needs ffmpeg and playwright)
// MP4 needs H.264 recording: open-source Chromium may lack it, so CI runs
// this test in Google Chrome (PW_CHANNEL=chrome), like Chrome on Android.
const { chromium, devices } = require('playwright');
const { execFileSync, spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const PAGE = 'file://' + path.resolve(__dirname, '..', 'index.html');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mp4-test-'));
const VIDEO = path.join(tmp, 'colors.webm'); // red 0-2 s, blue 2-4 s, 440 Hz tone
const SONG = path.join(tmp, 'song.wav');

let failures = 0;
function check(name, ok, detail) {
  console.log((ok ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? '  (' + detail + ')' : ''));
  if (!ok) failures++;
}
const ff = args => execFileSync('ffmpeg', ['-loglevel', 'error', '-y', ...args], { maxBuffer: 256 * 1024 * 1024 });
ff(['-f', 'lavfi', '-i', 'color=c=red:size=320x180:rate=30:duration=2', '-f', 'lavfi', '-i', 'color=c=blue:size=320x180:rate=30:duration=2',
  '-f', 'lavfi', '-i', 'sine=frequency=440:duration=4',
  '-filter_complex', '[0][1]concat=n=2:v=1:a=0[v]', '-map', '[v]', '-map', '2:a',
  '-c:v', 'libvpx', '-deadline', 'realtime', '-cpu-used', '8', '-c:a', 'libopus', VIDEO]);
ff(['-f', 'lavfi', '-i', 'sine=frequency=1000:duration=10', SONG]);

function probe(file) {
  const j = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_format', '-show_streams', '-of', 'json', file]).toString());
  const v = j.streams.find(s => s.codec_type === 'video'), a = j.streams.find(s => s.codec_type === 'audio');
  const frames = Number(execFileSync('ffprobe', ['-v', 'error', '-count_frames', '-select_streams', 'v', '-show_entries',
    'stream=nb_read_frames', '-of', 'csv=p=0', file]).toString().trim());
  // Decode every video and audio frame with ffprobe: report decoder errors,
  // and check each video frame has its own, increasing timestamp.
  // (Recordings have a variable frame rate, so no fixed-rate output is used.)
  const vf = spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'v', '-show_entries', 'frame=pts,pts_time', '-of', 'csv=p=0', file]);
  const af = spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'a', '-show_entries', 'frame=pts', '-of', 'csv=p=0', file]);
  const rows = vf.stdout.toString().trim().split('\n').map(l => l.split(',').map(Number));
  const pts = rows.map(r => r[0]);
  // Real length from the timestamps (first to last frame + one frame), not from
  // the frame count: a busy computer records fewer frames of a correct-length video.
  const times = rows.map(r => r[1]);
  const seconds = times[times.length - 1] - times[0] + 1 / 30;
  const ordered = pts.every((x, i) => i === 0 || x > pts[i - 1]);
  const decodeErrors = (vf.stderr.toString() + af.stderr.toString()).trim() + (ordered ? '' : ' video timestamps not increasing');
  return { format: j.format.format_name, video: v && v.codec_name, audio: a && a.codec_name, w: v && v.width, h: v && v.height, frames, seconds, decodeErrors };
}
function colourAt(file, t) {
  const raw = ff(['-ss', String(t), '-i', file, '-frames:v', '1', '-vf', 'scale=8:8', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-']);
  let r = 0, g = 0, b = 0; for (let i = 0; i < raw.length; i += 3) { r += raw[i]; g += raw[i + 1]; b += raw[i + 2]; }
  const n = raw.length / 3; return [r / n, g / n, b / n].map(Math.round);
}
function toneLevel(file, f, t0, t1) {
  const raw = ff(['-i', file, '-vn', '-af', 'pan=mono|c0=c0', '-ar', '16000', '-f', 'f32le', '-']);
  const pcm = new Float32Array(raw.buffer, raw.byteOffset, raw.length / 4);
  const a = Math.floor(t0 * 16000), b = Math.min(pcm.length, Math.floor(t1 * 16000)), k = 2 * Math.cos(2 * Math.PI * f / 16000);
  let s1 = 0, s2 = 0; for (let i = a; i < b; i++) { const s0 = pcm[i] + k * s1 - s2; s2 = s1; s1 = s0; }
  return 2 * Math.sqrt(Math.max(0, s1 * s1 + s2 * s2 - k * s1 * s2)) / Math.max(1, b - a);
}

(async () => {
  const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || undefined, args: ['--autoplay-policy=no-user-gesture-required'] });
  const errors = [];
  const newPage = async (init) => {
    const ctx = await browser.newContext({ ...devices['Pixel 7'], acceptDownloads: true });
    const page = await ctx.newPage();
    page.on('pageerror', e => errors.push(e.message));
    page.on('dialog', d => d.accept());
    if (init) await page.addInitScript(init);
    await page.goto(PAGE);
    return page;
  };
  const load = async (page, f) => {
    await page.setInputFiles('#file', f);
    await page.waitForFunction(() => document.getElementById('status').textContent === 'Video ready.');
  };
  const doExport = async (page, name) => {
    await page.click('#export');
    await page.waitForFunction(() => /Export (completed|error)/.test(document.getElementById('status').textContent), null, { timeout: 60000 });
    const status = await page.textContent('#status');
    if (!status.startsWith('Export completed')) return { status };
    const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#result a')]);
    const out = path.join(tmp, name); await dl.saveAs(out);
    return { status, out, filename: dl.suggestedFilename(), link: await page.textContent('#result a') };
  };

  try {
    const page = await newPage();
    await page.evaluate(() => localStorage.removeItem('aves.exportFormat'));
    await page.reload();
    const canMp4 = await page.evaluate(() => !!firstSupported(EXPORT_FORMATS.mp4));
    check('this browser can record MP4', canMp4, await page.evaluate(() => firstSupported(EXPORT_FORMATS.mp4)));
    check('MP4 is the default format', (await page.inputValue('#exportFormat')) === 'mp4');
    check('format note explains the sound codec', /^MP4 with AAC sound|makes MP4 with Opus sound/.test(await page.textContent('#formatNote')), await page.textContent('#formatNote'));

    // Start–End export as MP4, with a caption.
    await load(page, VIDEO);
    await page.selectOption('#fit', 'cover');
    await page.evaluate(() => { captions = [{ start: 0, end: 4, text: 'MP4 caption test' }]; renderCaptionList(); });
    await page.fill('#start', '0.5'); await page.fill('#end', '3.5');
    const A = await doExport(page, 'a.mp4');
    if (process.env.SHOT_DIR) fs.copyFileSync(A.out, path.join(process.env.SHOT_DIR, 'a.mp4'));
    const pa = probe(A.out);
    check('download is named edited-video.mp4', A.filename === 'edited-video.mp4', A.filename);
    check('file really is MP4 with H.264 video', /mp4/.test(pa.format) && pa.video === 'h264', pa.format + ' / ' + pa.video);
    check('MP4 has sound (AAC or Opus)', pa.audio === 'aac' || pa.audio === 'opus', pa.audio);
    check('status says exactly what was made', A.status.includes('MP4 (H.264 video, ' + (pa.audio === 'aac' ? 'AAC' : 'Opus') + ' sound)'), A.status);
    check('9:16 size 720x1280', pa.w === 720 && pa.h === 1280, pa.w + 'x' + pa.h);
    check('length ≈ 3.0 s', Math.abs(pa.seconds - 3) < 0.4, pa.seconds.toFixed(2) + ' s (' + pa.frames + ' frames)');
    check('whole file decodes without errors', pa.decodeErrors === '', pa.decodeErrors.slice(0, 120));
    const c1 = colourAt(A.out, 0.5), c2 = colourAt(A.out, 2.5);
    check('picture correct (red, then blue)', c1[0] > 150 && c1[2] < 80 && c2[2] > 150 && c2[0] < 80, JSON.stringify([c1, c2]));
    check('video sound present (440 Hz)', toneLevel(A.out, 440, 0.5, 2.5) > 0.05, toneLevel(A.out, 440, 0.5, 2.5).toFixed(3));
    const capPx = (() => {
      const raw = ff(['-ss', '1', '-i', A.out, '-frames:v', '1', '-vf', 'crop=iw:ih*0.2:0:ih*0.8', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-']);
      let n = 0; for (let i = 0; i < raw.length; i += 3) if (raw[i] > 230 && raw[i + 1] > 230 && raw[i + 2] > 230) n++; return n;
    })();
    check('caption burned into the MP4', capPx > 500, capPx + ' white pixels');

    // The phone browser can play the MP4 back.
    const play = await page.evaluate(async url => {
      const v = document.createElement('video'); v.muted = true; v.src = url;
      try { await new Promise((res, rej) => { v.onloadeddata = res; v.onerror = () => rej(new Error('error ' + (v.error && v.error.code))); setTimeout(() => rej(new Error('timeout')), 8000); });
        return { ok: true, w: v.videoWidth, h: v.videoHeight }; } catch (e) { return { ok: false, e: e.message }; }
    }, await page.evaluate(() => exportURL));
    check('exported MP4 plays in the browser', play.ok && play.w === 720, JSON.stringify(play));

    // Timeline + music as MP4.
    await page.setInputFiles('#musicFile', SONG);
    await page.waitForFunction(() => document.getElementById('musicInfo').textContent.startsWith('♪ song.wav ('));
    await page.evaluate(() => { for (const [id, v] of [['musicVol', 50], ['musicFadeIn', 0], ['musicFadeOut', 0]]) { const el = document.getElementById(id); el.value = v; el.dispatchEvent(new Event('input')); } document.getElementById('musicDuck').checked = false; });
    await page.fill('#start', '0'); await page.fill('#end', '1.5'); await page.click('#tlAddRange');
    await page.fill('#start', '2.5'); await page.fill('#end', '4'); await page.click('#tlAddRange');
    const T = await doExport(page, 't.mp4');
    const pt = probe(T.out);
    check('timeline exports as MP4', /mp4/.test(pt.format) && pt.video === 'h264' && T.filename === 'edited-video.mp4', pt.format + ' ' + T.filename);
    check('timeline MP4 length ≈ 2.5 s (two 1.5 s clips, 0.5 s crossfade)', Math.abs(pt.seconds - 2.5) < 0.4, pt.seconds.toFixed(2) + ' s (' + pt.frames + ' frames)');
    check('timeline MP4 has the music (song 0.125 × 50% ≈ 0.0625)', toneLevel(T.out, 1000, 0.3, 2.2) > 0.045, toneLevel(T.out, 1000, 0.3, 2.2).toFixed(3));
    check('timeline MP4 decodes without errors', pt.decodeErrors === '', pt.decodeErrors.slice(0, 120));
    await page.evaluate(() => { timeline = []; renderTimeline(); });
    await page.click('#musicRemove');

    // WebM choice still works and is remembered.
    await page.selectOption('#exportFormat', 'webm');
    check('WebM note shown', /^WebM plays/.test(await page.textContent('#formatNote')));
    await page.fill('#start', '0'); await page.fill('#end', '1.5');
    const W = await doExport(page, 'w.webm');
    const pw = probe(W.out);
    check('WebM export: .webm file with VP8/VP9', W.filename === 'edited-video.webm' && /webm|matroska/.test(pw.format) && /vp8|vp9/.test(pw.video), W.filename + ' ' + pw.video);
    check('status says WebM', W.status.includes('WebM'), W.status);
    await page.reload();
    check('format choice remembered after reload', (await page.inputValue('#exportFormat')) === 'webm');
    await page.selectOption('#exportFormat', 'mp4');
    check('no horizontal scroll', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));

    // A browser that cannot make MP4: honest message and WebM fallback.
    const p2 = await newPage(() => {
      const real = MediaRecorder.isTypeSupported.bind(MediaRecorder);
      MediaRecorder.isTypeSupported = t => !/mp4/.test(t) && real(t);
      try { localStorage.removeItem('aves.exportFormat'); } catch (e) {}
    });
    check('no MP4 support: WebM selected by default', (await p2.inputValue('#exportFormat')) === 'webm');
    await p2.selectOption('#exportFormat', 'mp4');
    check('no MP4 support: note says WebM will be used', /cannot make MP4/.test(await p2.textContent('#formatNote')), await p2.textContent('#formatNote'));
    await load(p2, VIDEO);
    await p2.fill('#start', '0'); await p2.fill('#end', '1');
    const F = await doExport(p2, 'f.webm');
    check('no MP4 support: exports WebM and says so', F.filename === 'edited-video.webm' && /cannot make MP4, so it was saved as WebM/.test(F.status), F.status);

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
