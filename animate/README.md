# animate/ — 2D animated shorts drawn entirely in code

Voice-over in → vertical MP4 out. Every frame is painted with code on a
canvas (`@napi-rs/canvas`), synced word-by-word to the voice, rendered in
parallel and encoded with FFmpeg. The soundtrack (score + sound effects) is
synthesised in `lib/audio.py`. No stock footage and no AI images.

```bash
bash setup.sh                                              # once
node transcribe.mjs voice.mp3 projects/my-short            # word timings
# write projects/my-short/story.mjs (copy projects/bubble-wrap/story.mjs)
node render.mjs projects/my-short --sheet                  # preview every scene
node render.mjs projects/my-short                          # → projects/my-short/out/*.mp4
npm test
```

Styles: `styles/ottoman/` (Ottoman miniature painting: ebru margins,
illuminated header, gold-ruled frame, cloud bands, spongy rocks, figures in
kaftans and turbans, tughra, seals). Full workflow:
`.claude/skills/animated-short/SKILL.md`.
