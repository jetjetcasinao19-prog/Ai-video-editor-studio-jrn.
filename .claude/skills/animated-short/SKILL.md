---
name: animated-short
description: Turn a voice-over (or just a script) into a 2D animated short drawn entirely in code (no stock footage, no AI images) — every frame painted on a canvas, synced word-by-word to the voice, with a generated soundtrack, sound effects, post copy and a schedule row. ALWAYS use when the owner says "edit this in 2D(OTTOMAN)", "edit this in 2D(INKBLOT)" or "edit this in 2D (<style>)" (any spacing or capitals, e.g. "edit this in 2d inkblot"), and when the owner sends a voice-over (mp3/wav) or a script and asks for an animated video, a cartoon, a "2D animated short", a psychology explainer, or a video "written from code". Styles: OTTOMAN (Ottoman miniature painting — history/origins), INKBLOT (Rorschach case file — psychology).
---

## Trigger: "edit this in 2D(STYLE)"
This is the owner's one-command phrase for this skill (the plain "edit this"
skill is for real footage; anything with "in 2D" comes here). Do every step
below without asking questions you can answer yourself:
- **Style** = the word in brackets, lower-cased → `animate/styles/<style>/`
  (`OTTOMAN` → `styles/ottoman`, `INKBLOT` → `styles/inkblot`). No brackets →
  INKBLOT for psychology / mind / behaviour topics, Ottoman for everything else. A style that does
  not exist yet: say so in one line and offer to build it as a new style
  (see the end of this file) or to use Ottoman now.
- **Voice-over** = the audio file attached in this conversation; else the
  newest `.mp3`/`.wav`/`.m4a` in `inbox/`. No audio but a script (pasted or
  `.txt`) → make the voice with `voice.mjs` (step 2b). Neither → ask in one line.
- **Script** = the text the owner pasted, if any (use it to fix the spelling
  of names); otherwise the transcript.
- **Channel** = the one the owner names; else INKBLOT → MindTrace
  (`meta.brandKit: 'mindtrace'`, `brand/mindtrace/`), OTTOMAN → How it Started
  (`meta.brandKit: ''`, `brand/`). The kit supplies the logo, handle, tagline
  and outro line; never hard-code them in the story.
- **Finish the whole job**: render → check → send the MP4 → publisher agent
  writes post copy + schedule rows (step 7) → commit and push.

## Retention rules — read before writing anything
**Why:** in November 2026 YouTube Studio showed **85.1% of viewers swiped
away** from How it Started (only 14.9% stayed). People decide in the first
second. Healthy Shorts keep 70%+. Every new short follows these rules, and
`node render.mjs <project> --check` warns when one is broken (it also runs
before every `--sheet` and render). A warning may stay only with a reason
you can tell the owner.

**The script (voice-over)**
1. **Line 1 is the hook**, spoken in the first second: the familiar thing +
   the surprise, 4–9 words. "This glue was a failure." / "One word makes
   people say yes." Never open on a date, a name or "In 1906…" — dates
   come after the hook.
2. **Name the thing early.** Viewers must know what the story is about by
   2 s (Post-it Notes, basketball, Taps, the Zeigarnik effect). Nobody swipes
   to keep watching "Art Fry".
3. **25–40 s of voice** (45 s max). Cut setup, side facts and repeated ideas;
   keep: hook → humble start → problem → turning point → payoff.
4. **An open question every ~8 s** ("But 3M had a problem…", "Then it clicked.")
   so there is always a reason to keep watching.
5. **The last line pays off the first** (and ideally loops into it), then the
   call to action. No long goodbye.
6. If the owner sends a voice-over that breaks 1–3, make the video anyway and
   say in one line what would make the next one stronger. With `voice.mjs`
   (script only) you write the script, so follow the rules.
7. Trim silence so the **first word lands in the first 0.4 s**
   (`ffmpeg -ss <s> -i voice.mp3 …`, then transcribe again).

**The picture**
8. **`meta.hook`** — the hook card, on screen from frame 0 until the first
   sentence ends: `hook: { text: 'This glue was a *FAILURE*' }` (3–7 words,
   `*word*` or `*several words*` = accent colour; optional `until` seconds,
   `y` 0–1 position in the painting, `label`). Usually the spoken hook,
   shortened. It must not give away the ending.
9. **First scene title = the thing's name** ("POST-IT NOTES", "THE ZEIGARNIK
   EFFECT"), never a date or a person. Dates go in later headers or stamps.
10. **The first shot shows the subject BIG** (at least half the painting
    width) and something moves in the first 0.3 s (a pop, a tip, a stamp,
    a zoom). No slow establishing shots at the start.
11. **Something new every 2–3 s**: a cut, a camera move, a stamp, a pop. No
    scene holds more than 4.5 s (except the outro).
12. **Captions**: `captionChars: 18` (one big bold line). They sit inside
    the safe area (x 120–960, above y 1580), so YouTube's buttons and
    title don't cover them. Don't move important things into the bottom
    20% or the right 120 px of the frame.

**The channel**
13. One channel, one promise: origin stories → How it Started (OTTOMAN);
    psychology / habits / the mind → MindTrace (INKBLOT). Never post a
    psychology topic on How it Started.

## Craft rules — hand-made, never AI slop
**Why:** viewers swipe away from anything that looks generated: perfect
vector lines, flat fills, everything gliding at 30 fps, stock symbols
(lightbulbs, gears, glowing brains), dead-silent gaps, a robotic score. The
owner asked for videos that look made by an artist. The engine now does the
material part for you; the storyboard has to do the rest.

**What the engine does on every frame (`lib/finish.mjs`, on by default)**
- **Line boil**: every line wobbles slightly and is "re-traced" 10× a second, like
  hand-drawn animation. **On twos**: the painting gets a new drawing every
  2nd frame (15/s), like cel and cut-out animation; captions stay smooth.
- **Ink bleed** (soft halo where ink meets paper), **real paper** (fibres,
  cloudy pulp, pigment grit, foxing), **lamp light** (soft falloff), **film
  grain + faint flicker** over the whole frame.
- **Gold leaf** (OTTOMAN): gilded areas catch a slow sheen and a few glints.
- **Rostrum camera**: every shot slowly pushes in (~2%), so no plate is a
  frozen slide. Set `still: true` on a scene that must not move (a chart
  being read, the outro card if it looks better still).
- Tune with `meta.finish = { boil, twos, bleed, gold, grain, flicker, breathe, light }`
  (0/false turns one part off). `meta.finish = false` is the old clean look —
  never ship that.
- **Sound** (`lib/audio.py`): the score plays in a synthetic stereo hall
  (OTTOMAN) or an intimate room (INKBLOT); sound effects sit in a lighter room;
  notes are humanised (a few ms early/late, louder/softer); a faint analog bed
  (room tone / tape hiss + soft crackle) means there is never digital silence;
  the voice gets a rumble filter and gentle compression and stays dry and in
  front. Optional `export const space = { reverb, wet, sfxWet, bed, polish }`.

**What the storyboard must do**
14. **Specific, never generic.** Draw the exact thing from this story (the
    "BE A SAFE DRIVER" card, Spencer Silver's alembic, the waiter's notepad),
    not a symbol any channel could use. Banned unless the script literally
    says it: lightbulb for "idea", gears for "process", rocket for "growth",
    trophy, thumbs-up, money rain, floating question marks, a glowing brain as
    filler, a world globe for "everywhere".
15. **One focal point per plate.** The eye must know where to look in 0.2 s:
    the subject is the biggest, highest-contrast thing; everything else is
    quieter. One accent colour per plate (red in INKBLOT, vermilion or gold in
    OTTOMAN) on the thing that matters.
16. **Vary the shot.** Wide → medium → close-up → insert (a hand, an eye, an
    object). Never three plates in a row at the same size. Use `S.cam` to
    punch in on the key word.
17. **Act, don't slide.** Figures move like people: *anticipation* (a small
    move the other way before a big one), *overshoot and settle*
    (`ease.outBack`, `pop`), *follow-through*. Change a pose at least once per
    plate (`armL/armR`, `mood`, `look`, `tilt`). Eyes look at what matters
    (`look`), people blink every 2–4 s (`blink`). Nothing appears by just
    fading in.
18. **Stagger, then hold.** Elements arrive 0.08–0.15 s apart, never all at
    once. When the key image lands, hold it ~0.5 s before cutting.
19. **Depth in three layers.** Something in the foreground (often cut by the
    frame edge), the action in the middle, a quiet background. Overlap things.
20. **Words belong in captions.** Text inside the painting is at most 3
    hand-lettered words (red pen, stamp, cartouche) — never a sentence.
21. **Every impact has a sound, and silence is a tool.** Pops, stamps, folds
    and splats get an sfx; drop the music to `sad`/`tense` (or near silence)
    one beat before the reveal so the payoff hits. No more than two sfx
    within 0.3 s.
22. **The slop test** (do it on the contact sheet before rendering): Would a
    human illustrator have drawn this plate? Is any plate a generic icon? Are
    two neighbours the same shot size? Is any plate mostly empty or mostly
    text? Fix it, then render.

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
| `animate/voice.mjs` | script → `voice.mp3` (Groq Orpheus TTS if its terms are accepted, else Kokoro-82M on this machine — free, installs itself into `animate/.voice/` on first use) |
| `animate/transcribe.mjs` | voice → `words.json` (word timings; OmniRoute if `OMNIROUTE_URL` is set, else Groq Whisper; repairs out-of-order word times) |
| `animate/render.mjs` | CLI: contact sheet, stills, full render |
| `animate/lib/engine.mjs` | parallel frame workers → FFmpeg, then soundtrack + mux |
| `animate/lib/finish.mjs` | the hand-made finish on every frame: line boil, on-twos timing, ink bleed, paper, lamp light, gold-leaf sheen, rostrum push-in, film grain (see Craft rules) |
| `animate/lib/audio.py` | synthesised scores — `kit: 'ottoman'` (maqam scales, oud/kanun, ney, def/darbuka) or `kit: 'mind'` (music box, felt piano, low strings, ticking clock, heartbeat) — + 32 sound effects + voice ducking + stereo hall/room reverb, humanised notes, an analog bed, voice clean-up + −14 LUFS |
| `animate/styles/ottoman/` | the Ottoman miniature style: `kit.mjs` (figures, turbans, cloud bands, spongy rocks, cypresses, tulips, waves, galley, tughra, seals, stamps…), `page.mjs` (ebru marbled margins, illuminated header, gold-ruled frame, captions, progress reed), `scenes.mjs` (ready backdrops: `land`, `interior`, `lamp`, `compassRose`, `bookCover` for the closing brand card), `index.mjs` (transitions) |
| `animate/styles/inkblot/` | the INKBLOT psychology style — read its `STYLE.md` first: `kit.mjs` (living mirror-symmetric ink blots, profile head with opening skull, brain, eye, open loop, silhouette people, café props, food icons, bill, notepad, tabs, phone, bed, cliff, bar chart, Rubin's vase, stamps, typewriter + red-pen notes), `page.mjs` (case-file page: plate numerals I–XXII, typewriter captions, EEG polygraph progress), `scenes.mjs` (`plate`, `cafe`, `study`, `night`, `dream`, and the outro template `caseCover` + `inkReveal`: the closing case-file brand card, INKBLOT's version of Ottoman's `bookCover`), `index.mjs` (transitions `fold`, `bleed`, `blink`, `wipe`, `flash`, `cut`) |
| `animate/projects/zeigarnik-effect/` | the first INKBLOT short (22 plates) — **copy it as the INKBLOT template** |
| `animate/projects/<name>/` | one video: `voice.mp3`, `words.json`, `story.mjs` → `out/<slug>.mp4` |
| `animate/projects/bubble-wrap/` | the first finished short — **copy it as the template** |
| `animate/projects/post-it-notes/` | second short (sticky notes, alembic, choir, hymn book, bazaar stall, map of America) |

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
**2b. Only a script, no recording?** Save it as `projects/<slug>/script.txt`
(blank line = paragraph pause, "..." = dramatic pause), then:
```bash
node voice.mjs projects/<slug>/script.txt projects/<slug> --voice af_heart --speed 1.1
```
Kokoro voices: `af_heart` (best, warm female), `af_bella`, `am_michael`,
`am_fenrir`, `bm_george`. Groq voices (after the owner accepts the Orpheus
terms once at console.groq.com): `daniel`, `troy`, `austin`, `diana`, `hannah`,
`autumn`. Tell the owner it is an AI voice and that their own recording or
ElevenLabs voice can replace `voice.mp3` at any time (re-run transcribe).
Read the printed transcript. Fix misheard names with `--fix "Heard=Right"`
(check spellings of real people/brands with a quick search). If the owner
also pasted the script, use its spelling. Note the word times — scenes
are cut on them.

## 3. Plan the scenes (before writing code)
Check the script against the retention rules above first (hook in line 1,
the thing named by 2 s, 25–40 s). Then write a short beat list: one scene per sentence or idea, **2–4 s each**
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
- `meta` — title, slug, `style: 'ottoman'` or `'inkblot'`, 1080×1920, 30 fps, `duration`
  (voice end + ~2.5 s for the outro), `voice`, `brandKit` ('' = How it
  Started, 'mindtrace' = MindTrace: logo, handle, tagline and outro text come
  from that kit), `outro: { at }` (when the call to action types into the
  caption panel; `text` only to override the kit's).
- `hook` — the hook card (retention rule 8): `{ text: 'This glue was a *FAILURE*' }`.
- `captionChars: 18` — one big caption line at a time (the default).
- `scenes` — `{ start, title, trans, still, draw(ctx, u, S) }` (`still: true` = no rostrum push-in). `u` = seconds into
  the scene. `S.at('word')` = when that word is spoken (sync moments to it).
  `S.cam(zoom, cx, cy)` = camera. `S.k` = the style kit, `S.P` = palette,
  `S.W/S.H` = painting size (940×1060). Transitions: `iris` (scalloped gold
  circle), `wipe`, `unroll` (scroll), `flash` (gold), `cut`.
- `sfx` — `{ t, type, gain, pitch }`; types: pop, whoosh, paper, chime, stamp,
  thud, pluck, slide, sizzle, wind, rain, waves, crickets, flop, riser, gong,
  clank, alarm, thunder, crack, coins.
- `music` — Ottoman: `{ bpm, root, maqam: 'hicaz'|'rast'|'nihavend', gain, sections:[{from,to,mood}] }`;
  INKBLOT: `{ kit: 'mind', bpm, root, scale: 'minor'|'dorian'|'harmonic'|'major'|'lydian', gain, sections }`.
  Moods: intro, groove, sad, drive, triumph, end (+ `tense` in the mind kit:
  heartbeat + ticking). Match moods to the story's turns (failure → sad,
  comeback → drive, revelation → tense, payoff → triumph).
- INKBLOT sfx extras: tick, heartbeat, splat, fold, blink, typewriter, bell,
  click, snap, buzz, pen, moth.

Use helpers from the kit before drawing by hand. Animation tools are in
`lib/core.mjs`: `tween`, `ease.*`, `pop`, `shake`, `rng` (seeded — never
`Math.random`, frames render in parallel and must be repeatable).

## 5. Look, fix, repeat
```bash
node render.mjs projects/<slug> --check            # retention warnings only
node render.mjs projects/<slug> --stills 0,1        # the first second: hook card readable? subject big?
node render.mjs projects/<slug> --sheet            # one frame per scene → build/sheet.png
node render.mjs projects/<slug> --stills 3.2,14,41 # full-size PNGs → build/stills/
```
Open the images (Read tool) and run the **slop test** (craft rule 22). Check: **frame 0 makes you want to watch**
(hook card readable at a glance, subject big, nothing important covered by
the hook band), nothing important hidden behind the
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

## 7. Hand-off: post copy + schedule
1. Send the MP4 to the owner (SendUserFile).
2. Use the **publisher** agent (`.claude/agents/publisher.md`) to write
   `content/posts/<YYYY-MM-DD>-<slug>.md` (same format as the other files
   there: hook, summary, fact-check notes, and title/description/hashtags for
   YouTube Shorts, TikTok, Instagram Reels, Facebook Reels, always with the
   brand hashtags) and to add one row per platform to `content/schedule.md`.
   Give it the exact voice-over text, the dates/facts shown on screen, and
   tell it: **US audience**, times in US Eastern Time with the owner's
   Philippine time next to them (PHT = ET + 13 h Nov–Mar, + 12 h in US
   daylight saving), status `ready`, and no clashes with existing rows.
3. Check its file and rows yourself (dates, weekday, PHT day roll-over,
   no claims the video does not make).
4. Commit `story.mjs`, `words.json`, `voice.mp3`, the post file and the
   schedule. Do not commit the MP4 or `build/` (gitignored, too large).

**Never post anything without the owner's explicit yes**, and never mark a
row `posted` unless the owner says they posted it.

## Style menu (unique, code-drawn, viral-friendly)
Built: **OTTOMAN** (history/origins), **INKBLOT** (psychology). When the owner
asks for a new look, offer these (each is a new `styles/<name>/`):
- **ANATOMY** — 1800s anatomical engraving: cross-hatched brains and nerves,
  Latin labels, sepia plates (neuroscience, body facts).
- **DREAMCORE** — surrealist dream painting: endless plains, melting clocks,
  doors in the sky, long shadows (dreams, the subconscious).
- **UKIYO** — Japanese woodblock print: flat colour, bold outlines, wave
  patterns, wood grain (discipline, philosophy, focus).
- **BAUHAUS** — 1920s posters: circles, squares, primary colours, big type
  (cognitive biases as geometry).
- **SILHOUETTE** — paper-cut shadow puppets in front of a lamp (fables,
  dark psychology, stories).

## Adding another style
Make `animate/styles/<style>/index.mjs` exporting `createRenderer(project)`
→ `(ctx, t) => void` (see `styles/ottoman/index.mjs`), with its own kit, and
set `meta.style` in the story. Keep the same `S` helpers so storyboards stay
portable.
