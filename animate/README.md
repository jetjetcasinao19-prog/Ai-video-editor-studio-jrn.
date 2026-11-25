# animate/ — 2D animated shorts drawn entirely in code

Voice-over in → vertical MP4 out. Every frame is painted with code on a
canvas (`@napi-rs/canvas`), synced word-by-word to the voice, rendered in
parallel and encoded with FFmpeg. The soundtrack (score + sound effects) is
synthesised in `lib/audio.py`. No stock footage and no AI images.

```bash
bash setup.sh                                              # once (add --voice for the local TTS)
node voice.mjs script.txt projects/my-short                # only if there is no recording: script → voice.mp3
node transcribe.mjs voice.mp3 projects/my-short            # word timings
# write projects/my-short/story.mjs (copy projects/bubble-wrap/story.mjs)
node render.mjs projects/my-short --sheet                  # preview every scene
node render.mjs projects/my-short                          # → projects/my-short/out/*.mp4
npm test
```

Styles: `styles/ottoman/` (Ottoman miniature painting: ebru margins,
illuminated header, gold-ruled frame, cloud bands, spongy rocks, figures in
kaftans and turbans, tughra, seals) and `styles/inkblot/` (a psychology
case file: living mirror-symmetric Rorschach blots, numbered plates, silhouette
people with paper-white eyes, red-pen notes, typewriter captions, an EEG
polygraph progress line; music-box/felt-piano score — see its `STYLE.md`).
Every frame gets a hand-made finish (`lib/finish.mjs`: line boil, animation
on twos, ink bleed, real paper, gold-leaf sheen, rostrum push-in, film grain)
and the soundtrack plays in a synthetic room with humanised notes.
Effects: 12 shared transitions (`lib/transitions.mjs`: page, burn, tear,
drip, shutter, whip, zoom, spin, glitch, marble, tiles, doors), in-scene
effects (`lib/fx.mjs` → `S.fx`: shake, punch, particle bursts, impact lines,
speed lines, rays, rings, flash, spotlight, squash), freeze frames and
automatic transition sounds + impact shakes (`lib/stage.mjs`), and ~60
synthesised sound effects (`lib/audio.py`). See them all in
`demo/fx-inkblot` and `demo/fx-ottoman`.
Full workflow:
`.claude/skills/animated-short/SKILL.md`.
