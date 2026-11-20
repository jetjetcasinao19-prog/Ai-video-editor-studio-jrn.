// Brand kit: reads brand/brand.json, fills in defaults and checks values,
// and makes an initials logo when the brand has a name but no logo file.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

export const DEFAULT_BRAND = {
  name: '', handle: '', tagline: '',
  colors: { background: '#0b0e14', text: '#ffffff', accent: '#ffe600', captionText: '#ffffff', captionHighlight: '#ffe600' },
  captions: { style: 'creator' },
  intro: { enabled: true },
  outro: { enabled: true, text: 'Follow for more', seconds: 2.5 },
  watermark: { enabled: true, position: 'top-right', size: 0.14, opacity: 0.85 },
  logo: 'logo.png',
  music: { volume: 0.2 },
  hashtags: []
};
const HEX = /^#[0-9a-fA-F]{6}$/;
const POSITIONS = ['top-right', 'top-left', 'bottom-right', 'bottom-left'];

export function loadBrand(file) {
  const b = structuredClone(DEFAULT_BRAND);
  b.dir = file ? path.dirname(path.resolve(file)) : null;
  if (!file || !fs.existsSync(file)) return b;
  let raw;
  try { raw = JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (e) { throw new Error('brand.json is not valid JSON (' + e.message + '). Check commas and quotes.'); }
  const str = (v, max) => typeof v === 'string' ? v.trim().slice(0, max) : '';
  b.name = str(raw.name, 40);
  b.handle = str(raw.handle, 40);
  if (b.handle && !b.handle.startsWith('@')) b.handle = '@' + b.handle;
  b.tagline = str(raw.tagline, 60);
  for (const k of Object.keys(b.colors)) {
    const v = raw.colors && raw.colors[k];
    if (v !== undefined) {
      if (!HEX.test(v)) throw new Error(`brand.json colors.${k} must look like "#ffe600" (got ${JSON.stringify(v)}).`);
      b.colors[k] = v.toLowerCase();
    }
  }
  if (raw.captions && raw.captions.style) {
    if (!['creator', 'box', 'classic', 'none'].includes(raw.captions.style)) throw new Error('brand.json captions.style must be creator, box, classic or none.');
    b.captions.style = raw.captions.style;
  }
  if (raw.intro && raw.intro.enabled === false) b.intro.enabled = false;
  if (raw.outro) {
    if (raw.outro.enabled === false) b.outro.enabled = false;
    if (raw.outro.text !== undefined) b.outro.text = str(raw.outro.text, 50);
    const s = Number(raw.outro.seconds);
    if (Number.isFinite(s)) b.outro.seconds = Math.min(5, Math.max(1.5, s));
  }
  if (raw.watermark) {
    if (raw.watermark.enabled === false) b.watermark.enabled = false;
    if (raw.watermark.position !== undefined) {
      if (!POSITIONS.includes(raw.watermark.position)) throw new Error('brand.json watermark.position must be ' + POSITIONS.join(', ') + '.');
      b.watermark.position = raw.watermark.position;
    }
    const sz = Number(raw.watermark.size), op = Number(raw.watermark.opacity);
    if (Number.isFinite(sz)) b.watermark.size = Math.min(0.3, Math.max(0.05, sz));
    if (Number.isFinite(op)) b.watermark.opacity = Math.min(1, Math.max(0.1, op));
  }
  if (typeof raw.logo === 'string' && raw.logo) b.logo = raw.logo;
  const vol = Number(raw.music && raw.music.volume);
  if (Number.isFinite(vol)) b.music.volume = Math.min(1, Math.max(0, vol));
  if (Array.isArray(raw.hashtags)) b.hashtags = raw.hashtags.filter(h => typeof h === 'string').map(h => h.startsWith('#') ? h : '#' + h).slice(0, 15);
  return b;
}

// #RRGGBB → ASS colour &H00BBGGRR
export function assColor(hex) {
  return '&H00' + hex.slice(5, 7).toUpperCase() + hex.slice(3, 5).toUpperCase() + hex.slice(1, 3).toUpperCase();
}

export function initials(name) {
  const parts = name.replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter(Boolean);
  return (parts.length >= 2 ? parts[0][0] + parts[1][0] : (parts[0] || '').slice(0, 2)).toUpperCase();
}

// The logo to use: the brand's logo file, or an initials logo (made with
// FFmpeg in the brand colours) when only a name is set. null = no logo.
export function brandLogo(brand, cacheDir, fontsDir) {
  if (brand.dir && brand.logo) {
    const f = path.resolve(brand.dir, brand.logo);
    if (fs.existsSync(f)) return { file: f, generated: false };
  }
  if (!brand.name) return null;
  fs.mkdirSync(cacheDir, { recursive: true });
  const text = initials(brand.name) || 'TV';
  const out = path.join(cacheDir, 'logo-' + text + '-' + brand.colors.accent.slice(1) + brand.colors.background.slice(1) + '.png');
  if (!fs.existsSync(out)) {
    const font = path.join(fontsDir, 'Montserrat.ttf').replace(/:/g, '\\:');
    const bg = brand.colors.background.slice(1), ac = brand.colors.accent.slice(1);
    // Accent-coloured circle with the initials in the background colour.
    execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'lavfi', '-i', `color=c=0x${ac}:s=512x512:d=1`,
      '-vf', `drawtext=fontfile='${font}':text='${text}':fontcolor=0x${bg}:fontsize=${text.length > 1 ? 210 : 260}:x=(w-text_w)/2:y=(h-text_h)/2,` +
        `format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='if(lte(hypot(X-255.5,Y-255.5),250),255,0)'`,
      '-frames:v', '1', out]);
  }
  return { file: out, generated: true };
}

export function pickMusic(brand) {
  if (!brand.dir) return null;
  const dir = path.join(brand.dir, 'music');
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir).filter(f => /\.(mp3|m4a|aac|wav|ogg|opus|flac)$/i.test(f)).sort();
  return files.length ? path.join(dir, files[0]) : null;
}
