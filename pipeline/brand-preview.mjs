#!/usr/bin/env node
// Brand preview: renders a short sample video with the brand kit (intro,
// captions, watermark, outro) and saves brand/preview.png (one frame of each).
//   node pipeline/brand-preview.mjs [--brand brand/brand.json]
// If the brand has no name/handle yet, placeholders are shown so you can see
// where they will appear.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { editVideo } from './edit.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const i = process.argv.indexOf('--brand');
const brandFile = path.resolve(i > 0 ? process.argv[i + 1] : path.join(HERE, '..', 'brand', 'brand.json'));
const outPng = path.join(path.dirname(brandFile), 'preview.png');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'brand-preview-'));

// Use the real brand file; fill in placeholders where name/handle are empty.
const raw = JSON.parse(fs.readFileSync(brandFile, 'utf8'));
const placeholder = !raw.name && !raw.handle;
const sample = { ...raw, name: raw.name || 'Your Channel', handle: raw.handle || '@yourhandle', tagline: raw.tagline || 'Your tagline here' };
const sampleBrand = path.join(tmp, 'brand.json');
fs.writeFileSync(sampleBrand, JSON.stringify(sample));
const logo = raw.logo || 'logo.png';
if (fs.existsSync(path.join(path.dirname(brandFile), logo))) fs.copyFileSync(path.join(path.dirname(brandFile), logo), path.join(tmp, logo));

// 4 s sample "footage" with a soft moving gradient and silent sound.
const video = path.join(tmp, 'sample.mp4');
execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'lavfi', '-i', 'gradients=s=1080x1920:d=4:speed=0.02:c0=0x3a4a6b:c1=0x8a6f5a',
  '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo', '-t', '4', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', video]);
const words = 'This is how your captions will look in every video'.split(' ').map((w, k) => ({ w, start: 0.2 + k * 0.36, end: 0.5 + k * 0.36 }));
const wordsFile = path.join(tmp, 'words.json');
fs.writeFileSync(wordsFile, JSON.stringify({ words }));

const rep = await editVideo({ input: video, out: path.join(tmp, 'out'), format: '9:16', transcriber: 'none', cutPauses: false,
  minPause: 0.6, brand: sampleBrand, wordsFile, title: 'Your hook title here' });
const fin = path.join(tmp, 'out', 'final.mp4');
const outroAt = rep.final.duration - 1.2;
execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', fin, '-vf',
  `select='eq(n\\,36)+eq(n\\,${Math.round((2.5 + 1.3) * 30)})+eq(n\\,${Math.round((2.5 + 2.8) * 30)})+eq(n\\,${Math.round(outroAt * 30)})',scale=360:-1,tile=4x1:padding=8:color=0x222222`,
  '-frames:v', '1', outPng]);
fs.rmSync(tmp, { recursive: true, force: true });
console.log('Saved ' + path.relative(process.cwd(), outPng) + (placeholder ? ' (name and handle are placeholders: fill them in brand/brand.json)' : ''));
