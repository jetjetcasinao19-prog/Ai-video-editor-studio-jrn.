# AI Video Editor Studio

Single-file, in-browser video editor built for Android Chrome. Open `index.html`.

## Working features
- Projects: save and open your work on the phone (optionally with the video and
  music kept), autosave every 30 s, backup file to restore on any phone
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
- Export to MP4 (H.264 video, AAC or Opus sound, depending on the phone) or WebM;
  falls back to WebM with a message if the browser cannot make MP4

## Stickman Director
Open `stickman.html` (or tap "Stickman Director" at the top of the editor).
Paste your story and tap **Direct my story**: each sentence gets a stickman
action (walk, run, wave, talk, think, idea, point, jump, celebrate, dance,
shrug, sit, fall, sad, title card). Edit the script (`3 wave: Hi!` = 3 seconds
of waving with the caption "Hi!"), pick 9:16 / 16:9 / 1:1 and a background,
preview, then export MP4 (WebM on phones without MP4) and share to CapCut or
open it in the editor for music. Runs offline on the phone.
- **Character:** "Signature" (solid round head, blinking eyes, smooth limbs, a
  gold scarf that flutters as he moves) or "Classic" stick figure.
- **Narration voice:** pick an AI voice (9 US/UK voices, speed control) and tap
  **Make narration**. The voice runs on the phone (Kokoro; first use downloads
  about 92 MB, then works offline). Shots stretch to fit the voice and the
  narration is saved inside the exported video; "Save voice-over (.wav)" gives
  the voice on its own.

## AI Story Studio
Open `story.html` (or tap "AI Story Studio" at the top of the editor).
0. **Story styles:** pick one of 41 styles in the picture gallery (search,
   categories, ⭐ trending): Tagalog Drama, Micro-Drama Series, Fruit Drama,
   Pinoy Folklore Horror, POV History, Bigfoot Vlog, Satisfying ASMR, Stick
   Figure Explainer, How It Started and more. A style sets the scenes, seconds,
   language, cast, look and voice (narrator, dialogue, host, selfie vlog, POV or
   no speech) and tells the AI how to write it. Research and sources:
   `content/research/2026-11-trending-ai-story-styles.md`. Add a style in
   `story-styles.js`, then run `node tools/make-style-covers.mjs` for its cover.
1. Type a topic, pick scenes and seconds, tap **✨ ChatGPT / Gemini / Grok**: the
   AI gets a ready-made writing request. Paste its answer and tap **Use this
   answer** (or split your own narration, or make a quick draft).
2. Pick the look (niche, background colour, main character).
3. Every scene gets an **image prompt** (start frame) and a **video prompt**
   (duration, format, start frame, action, on-screen text, narrator line).
   **▶ Do next step** copies the next prompt and opens the site you picked
   (ChatGPT and Grok open with it typed in; for Gemini and Flow, paste it).
   **🎨 Free** (or the "Free (in app)" choice in Next step) makes the start
   image right in the app with the free Pollinations service, no account.
4. Add the images and clips you made to their scenes, then **Join into one
   video** (keeps the clips' sound, optional burned-in captions).
5. Download all prompts as .txt / .csv, or send the story to the Stickman
   Director. The story is saved on the phone; images and clips are not.

It cannot press buttons inside Flow, ChatGPT, Gemini or Grok for you: that
needs a desktop Chrome extension, which Chrome on Android cannot run.

## "Edit this" automatic workflow
Say "edit this" to Claude with a video: it transcribes (Groq Whisper), cuts
pauses, reframes, burns in captions, adds music and an animated HyperFrames
intro, writes the post copy and adds it to the schedule. See
`docs/AI-WORKFLOW.md`; code in `pipeline/`. Your look and voice live in
`brand/` (see `brand/README.md`).

## Team and workflow
See `docs/TEAM-GUIDE.md` (AI team agents, issue templates, posting schedule,
model switching) and `CLAUDE.md` (project rules).

## Tests
`node tests/editor.test.js`, `node tests/ai-captions.test.js`,
`node tests/caption-style.test.js`, `node tests/scene-detection.test.js`,
`node tests/transitions.test.js`, `node tests/music.test.js`,
`node tests/templates.test.js`, `node tests/assistant.test.js`,
`node tests/mp4-export.test.js`, `node tests/projects.test.js`, `node tests/stickman.test.js`, `node tests/stickman-voice.test.js` (needs internet), `node tests/story.test.js` and
`node tests/capcut.test.js` (needs ffmpeg
with flite, Playwright, internet). Runs automatically on
GitHub Actions for every push.

## Roadmap
All planned features are built. Next ideas come from testing on real phones.
