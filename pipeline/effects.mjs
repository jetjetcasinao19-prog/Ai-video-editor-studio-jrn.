// Effects for the "edit this" pipeline: zoom plans (punch-in / slow push),
// B-roll (own files or Pexels stock video), text pop-ups and sound effects.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const r3 = n => Math.round(n * 1000) / 1000;

// ---------- zoom ----------
// Returns keyframes [{t, z}] (z = zoom factor) on the output timeline.
//  punch: alternate 1.0 / 1.15 at each cut and about every 4 s at sentence
//         ends inside long parts (smooth 0.25 s move).
//  slow:  gentle push-in 1.0 → 1.08 over each part (Ken Burns style).
export function zoomPlan(style, cuts, total, words = [], { level = 1.15, every = 4, ease = 0.25 } = {}) {
  if (style === 'none' || !style) return [];
  const bounds = [0, ...cuts.filter(c => c > 0.3 && c < total - 0.3), total];
  const keys = [];
  if (style === 'slow') {
    for (let i = 0; i < bounds.length - 1; i++) {
      keys.push({ t: bounds[i], z: 1, jump: true }, { t: bounds[i + 1] - 0.001, z: 1.08 });
    }
    return keys;
  }
  // punch: change level at cuts and at sentence ends at least `every` s apart
  const ends = words.filter(w => /[.!?]$/.test(w.w)).map(w => w.end);
  const points = [...cuts];
  let last = 0;
  for (const e of ends.sort((a, b) => a - b)) {
    if (e - last >= every && points.every(p => Math.abs(p - e) > 1.5) && e < total - 1) { points.push(e); last = e; }
    else if (points.some(p => Math.abs(p - e) <= 1.5)) last = e;
  }
  points.sort((a, b) => a - b);
  let z = 1;
  keys.push({ t: 0, z: 1 });
  for (const p of points) {
    if (p <= 0.3 || p >= total - 0.3) continue;
    const nz = z === 1 ? level : 1;
    keys.push({ t: p, z }, { t: p + ease, z: nz });
    z = nz;
  }
  return keys;
}

// FFmpeg expression for zoom(t) from keyframes: smooth (smoothstep) moves
// between keyframes, jumps where marked.
export function zoomExpr(keys) {
  if (!keys.length) return '1';
  let expr = String(keys[keys.length - 1].z);
  for (let i = keys.length - 2; i >= 0; i--) {
    const a = keys[i], b = keys[i + 1];
    if (b.jump) { expr = `if(lt(t,${r3(b.t)}),${a.z},${expr})`; continue; }
    const d = Math.max(0.001, b.t - a.t), dz = b.z - a.z;
    const seg = dz === 0 ? String(a.z) : `(${a.z}+${r3(dz)}*(3*pow((t-${r3(a.t)})/${r3(d)},2)-2*pow((t-${r3(a.t)})/${r3(d)},3)))`;
    expr = `if(lt(t,${r3(b.t)}),${seg},${expr})`;
  }
  return `if(lt(t,${r3(keys[0].t)}),${keys[0].z},${expr})`;
}

export function zoomFilter(keys, W, H) {
  if (!keys.length) return '';
  const e = zoomExpr(keys).replace(/,/g, '\\,');
  return `,scale=w='trunc(${W}*(${e})/2)*2':h='trunc(${H}*(${e})/2)*2':eval=frame,crop=${W}:${H}`;
}

// Times where the zoom level changes (for whoosh sound effects).
export function zoomMoments(keys) {
  const out = [];
  for (let i = 1; i < keys.length; i++) if (keys[i].z !== keys[i - 1].z && !keys[i].jump) out.push(keys[i - 1].t);
  return out;
}

// ---------- B-roll ----------
const VIDEO = /\.(mp4|mov|m4v|webm|mkv)$/i, IMAGE = /\.(jpe?g|png|webp)$/i;

// Pexels free stock video (https://www.pexels.com/license/): search and
// download one clip for a query. The API key is added by the session proxy
// (or PEXELS_API_KEY when run elsewhere).
export async function pexelsClip(query, orientation, dir) {
  const key = process.env.PEXELS_API_KEY || 'proxy-injected';
  const url = (process.env.PEXELS_API_BASE || 'https://api.pexels.com') + '/videos/search?per_page=8&size=medium&orientation=' + orientation + '&query=' + encodeURIComponent(query);
  const res = await fetch(url, { headers: { Authorization: key } });
  if (!res.ok) throw new Error('Pexels ' + res.status + (res.status === 401 ? ' (API key missing or wrong)' : ''));
  const data = await res.json();
  const vids = (data.videos || []).filter(v => v.duration >= 3);
  if (!vids.length) throw new Error('no Pexels video for "' + query + '"');
  const v = vids[0];
  const files = (v.video_files || []).filter(f => f.file_type === 'video/mp4' && f.width && f.height)
    .sort((a, b) => Math.abs(a.height - 1920) - Math.abs(b.height - 1920));
  if (!files.length) throw new Error('no MP4 file for "' + query + '"');
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, 'pexels-' + v.id + '.mp4');
  if (!fs.existsSync(file)) {
    const r = await fetch(files[0].link);
    if (!r.ok) throw new Error('download failed (' + r.status + ')');
    fs.writeFileSync(file, Buffer.from(await r.arrayBuffer()));
  }
  return { file, credit: (v.user && v.user.name ? v.user.name + ' on Pexels' : 'Pexels'), url: v.url };
}

// Resolve plan entries to files. Entries: {at, duration, file} or {at, duration, query}.
export async function resolveBroll(entries, { total, orientation, cacheDir, baseDir, log }) {
  const out = [];
  for (const e of entries || []) {
    const at = Number(e.at), dur = Math.min(Number(e.duration) || 3, 8);
    if (!(at >= 0) || at >= total - 0.5) { log && log('broll-skip', { at: e.at, reason: 'outside the video' }); continue; }
    const d = Math.min(dur, total - at);
    try {
      if (e.file) {
        const f = path.resolve(baseDir, e.file);
        if (!fs.existsSync(f) || !(VIDEO.test(f) || IMAGE.test(f))) throw new Error('file not found or not a video/image: ' + e.file);
        out.push({ at, duration: d, file: f, image: IMAGE.test(f), source: path.basename(f) });
      } else if (e.query) {
        const c = await pexelsClip(String(e.query), orientation, cacheDir);
        out.push({ at, duration: d, file: c.file, image: false, source: 'Pexels: ' + e.query, credit: c.credit, url: c.url });
      }
    } catch (err) {
      log && log('broll-skip', { at, reason: err.message });
    }
  }
  // no overlaps: keep the earlier one
  out.sort((a, b) => a.at - b.at);
  return out.filter((b, i) => i === 0 || b.at >= out[i - 1].at + out[i - 1].duration);
}

// ---------- sound effects (made here: no licences needed) ----------
export function makeSfx(dir) {
  fs.mkdirSync(dir, { recursive: true });
  const whoosh = path.join(dir, 'whoosh.wav'), pop = path.join(dir, 'pop.wav');
  if (!fs.existsSync(whoosh)) execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'lavfi', '-i',
    'anoisesrc=d=0.5:c=pink:a=0.5:r=48000,highpass=f=300,lowpass=f=5000,afade=t=in:d=0.22:curve=exp,afade=t=out:st=0.22:d=0.28,volume=14dB,alimiter=limit=0.7,aformat=channel_layouts=stereo', whoosh]);
  if (!fs.existsSync(pop)) execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'lavfi', '-i',
    "aevalsrc='0.7*sin(2*PI*(700+500*exp(-40*t))*t)*exp(-18*t)':s=48000:d=0.2,aformat=channel_layouts=stereo", pop]);
  return { whoosh, pop };
}
