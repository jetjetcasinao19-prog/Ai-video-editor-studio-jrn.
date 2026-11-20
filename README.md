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
- Export to WebM with audio

## Team and workflow
See `docs/TEAM-GUIDE.md` (AI team agents, issue templates, posting schedule,
model switching) and `CLAUDE.md` (project rules).

## Tests
`node tests/editor.test.js` and `node tests/ai-captions.test.js` (needs ffmpeg
with flite, Playwright, internet). Runs automatically on
GitHub Actions for every push.

## Roadmap (not implemented yet)
Subtitle styling, scene detection, transitions,
background music, templates, AI-assisted editing, MP4 export, project management.
