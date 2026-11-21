---
name: animated-short
description: Turn a voice-over into a 2D animated short drawn entirely in code (no stock footage, no AI images) — every frame painted on a canvas, synced word-by-word to the voice, with a generated soundtrack and sound effects. Use when the owner sends a voice-over (mp3/wav) and asks for an animated video, a cartoon, a "2D animated short", or a video "written from code", or names a visual style (first style: Ottoman miniature painting).
---

# Animated short from a voice-over — all code

The owner records or generates a voice-over (often ElevenLabs) and wants a
vertical animated short for YouTube Shorts / Reels / TikTok. You write the
animation as code: a **storyboard** (`story.mjs`) of scenes, each a function
that paints one frame on a canvas. The engine renders every frame, mixes the
voice with a generated score + sound effects, and exports an MP4.

Everything lives in `animate/`:

| Path | What it is |
|---|---|
| `animate/setup.sh` | installs/checks the tools (Node 22+, FFmpeg + libx264, Python 3 + numpy, `@napi-rs/canvas`, fonts) |
| `animate/transcribe.mjs` | voice → `words.json` (word timings; OmniRoute if `OMNIROUTE_URL` is set, else Groq Whisper) |
| `animate/render.mjs` | CLI: contact sheet, stills, full render |
| `animate/lib/engine.mjs` | parallel frame workers → FFmpeg, then soundtrack + mux |
| `animate/lib/audio.py` | synthesised score (maqam scales, oud/kanun strings, ney, def/darbuka) + 20 sound effects + voice ducking + −14 LUFS |
| `animate/styles/ottoman/` | the Ottoman miniature style: `kit.mjs` (figures, turbans, cloud bands, spongy rocks, cypresses, tulips, waves, galley, tughra, seals, stamps…), `page.mjs` (ebru marbled margins, illuminated header, gold-ruled frame, captions, progress reed), `index.mjs` (transitions) |
| `animate/projects/<name>/` | one video: `voice.mp3`, `words.json`, `story.mjs` → `out/<slug>.mp4` |
| `animate/projects/bubble-wrap/` | the first finished short — **copy it as the template** |

Follow CLAUDE.md: never say it works until you rendered and looked at it.

## 1. Tools
```bash
bash animate/setup.sh            # prints "ready" when everything is there
```

## 2. New project + word timings
```bash
cd animate
mkdir -p projects/<slug> && cp <voice-file> projects/<slug>/voice.mp3
node transcribe.mjs projects/<slug>/voice.mp3 projects/<slug> --fix "Mark=Marc"
```
Read the printed transcript. Fix misheard names with `--fix "Heard=Right"`
(check spellings of real people/brands with a quick search). If the owner
also pasted the script, use its spelling. Note the word times — scenes
are cut on them.

## 3. Plan the scenes (before writing code)
Write a short beat list: one scene per sentence or idea, **2–4 s each**
(fast-cut reel pacing), cut ~0.1 s before the first word of the beat. For each
scene pick: chapter title (header text), what is painted, what moves, which
spoken word triggers the key moment, the transition, the sound effects.
Be inventive inside the style — visual metaphors beat literal pictures
(the bubble-wrap short: the IBM computer sails on an Ottoman galley, the
company name is written as a tughra and stamped with a seal, the world map is
drawn like Piri Reis's 1513 chart, the last bubble grows into the closed book).
Check facts (dates, names) — the brand is "dramatic but true" (`brand/voice.md`).

## 4. Write `story.mjs`
Start from `projects/bubble-wrap/story.mjs`. It exports:
- `meta` — title, slug, `style: 'ottoman'`, 1080×1920, 30 fps, `duration`
  (voice end + ~2.5 s for the outro), `voice`, `brand` (handle + logo from
  `brand/brand.json`), `outro` (call to action shown in the caption panel).
- `scenes` — `{ start, title, trans, draw(ctx, u, S) }`. `u` = seconds into
  the scene. `S.at('word')` = when that word is spoken (sync moments to it).
  `S.cam(zoom, cx, cy)` = camera. `S.k` = the style kit, `S.P` = palette,
  `S.W/S.H` = painting size (940×1060). Transitions: `iris` (scalloped gold
  circle), `wipe`, `unroll` (scroll), `flash` (gold), `cut`.
- `sfx` — `{ t, type, gain, pitch }`; types: pop, whoosh, paper, chime, stamp,
  thud, pluck, slide, sizzle, wind, rain, waves, crickets, flop, riser, gong,
  clank, alarm, thunder, crack, coins.
- `music` — `{ bpm, root, maqam: 'hicaz'|'rast'|'nihavend', gain, sections:[{from,to,mood}] }`,
  moods: intro, groove, sad, drive, triumph, end. Match moods to the story's
  turns (failure → sad, comeback → drive, payoff → triumph).

Use helpers from the kit before drawing by hand. Animation tools are in
`lib/core.mjs`: `tween`, `ease.*`, `pop`, `shake`, `rng` (seeded — never
`Math.random`, frames render in parallel and must be repeatable).

## 5. Look, fix, repeat
```bash
node render.mjs projects/<slug> --sheet            # one frame per scene → build/sheet.png
node render.mjs projects/<slug> --stills 3.2,14,41 # full-size PNGs → build/stills/
```
Open the images (Read tool) and check: nothing important hidden behind the
header/caption panels, text fits, figures readable at phone size, every
scene different, the key moment lands on its word. Iterate until good.

## 6. Render + verify
```bash
node render.mjs projects/<slug>                    # → projects/<slug>/out/<slug>.mp4 (~1 min on 4 cores)
npm test                                           # engine + story checks + a 1 s render
```
Then verify the MP4 itself: `ffprobe` (1080×1920, h264 + aac, right length),
grab frames at transitions with `ffmpeg -ss <t> -i out.mp4 -frames:v 1`, and
measure loudness (`ffmpeg -i build/mix.wav -af ebur128 -f null -` → about −14 LUFS).
You cannot hear the audio — say so, and ask the owner to listen.

## 7. Hand-off
Send the MP4 to the owner (SendUserFile). Do not commit the MP4 or
`build/` (gitignored, too large); commit the project's `story.mjs`,
`words.json` and `voice.mp3`. Offer the publisher agent for titles,
hashtags and a schedule row (`content/schedule.md`), and **never post
anything without the owner's explicit yes**.

## Adding another style
Make `animate/styles/<style>/index.mjs` exporting `createRenderer(project)`
→ `(ctx, t) => void` (see `styles/ottoman/index.mjs`), with its own kit, and
set `meta.style` in the story. Keep the same `S` helpers so storyboards stay
portable.
