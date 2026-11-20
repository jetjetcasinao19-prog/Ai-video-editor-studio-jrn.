# AI Video Editor Studio

Single-file, in-browser video editor built for Android Chrome. Open `index.html`.

## Working features
- Import a video from the phone, canvas preview, play/pause
- Formats 9:16 / 16:9 / 1:1, fill or fit
- Trim with start/end time (preview stops at the end time)
- Title text overlay (position, colour, live preview)
- Captions: add/edit/delete by hand, import .srt/.vtt, download .srt,
  burned into preview and export
- AI automatic captions: Whisper speech recognition running in the browser
  (Tiny 41 MB / Base 77 MB model, downloaded on first use, cached on websites)
- Subtitle styling: 7 quick styles, fonts (incl. Anton, Montserrat, Bangers from
  Google Fonts), size, text/outline colours, background box, position, ALL CAPS;
  remembered on the phone
- Scene detection: finds shot changes (hard cuts) on the phone, with thumbnails,
  GO (jump) and TRIM (set Start/End to a scene)
- Timeline & transitions: clips from scenes or Start–End, reorder/remove,
  Cut / Crossfade / Fade through black or white / Slide left or up / Wipe / Zoom,
  fade in/out, preview, sound crossfades; Export uses the timeline when it has clips
- Background music: MP3/M4A/OGG/WAV, music and video volume, start offset,
  loop, fade in/out, automatic lowering under speech (ducking); in preview,
  timeline and export
- Templates: 7 built-in looks (Reels/TikTok, YouTube vlog, tutorial, montage,
  story, square, cinematic) and your own saved templates
- AI assistant (on the phone, offline): remove silences (jump cuts), highlight
  reel of the liveliest scenes to a target length, title ideas from captions
- Export to WebM with audio

## Team and workflow
See `docs/TEAM-GUIDE.md` (AI team agents, issue templates, posting schedule,
model switching) and `CLAUDE.md` (project rules).

## Tests
`node tests/editor.test.js`, `node tests/ai-captions.test.js`,
`node tests/caption-style.test.js`, `node tests/scene-detection.test.js`,
`node tests/transitions.test.js`, `node tests/music.test.js`,
`node tests/templates.test.js` and `node tests/assistant.test.js` (needs ffmpeg
with flite, Playwright, internet). Runs automatically on
GitHub Actions for every push.

## Roadmap (not implemented yet)
MP4 export, project management.
