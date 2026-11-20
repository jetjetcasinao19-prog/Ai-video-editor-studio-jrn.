# "Edit this" — the automatic video workflow

Say **"edit this"** to Claude in this repository (Claude Code on claude.ai/code
or the Claude app) and attach a video, give a link to your own video, or put
it in `inbox/`. Claude then does the whole job:

1. **Transcribes** the speech — Groq Whisper (`whisper-large-v3-turbo`), or
   local Whisper if the Groq key is missing or not working.
2. **Cuts the pauses** (jump cuts) and, for Shorts/Reels, keeps it under 60 s.
3. **Reframes** to 9:16 (or 16:9 / 1:1) with a blurred background.
4. **Burns in captions** in creator style (the spoken word lights up yellow),
   kept in sync with the cuts. Also saves `captions.srt`.
5. **Adds music** if you give a song (lowered automatically when you talk)
   and evens the loudness to −14 LUFS like TikTok/Reels/YouTube expect.
6. **Writes the hook title** from what you said and renders an animated
   **HyperFrames** intro card.
7. **Writes the post copy** — title, description and hashtags per platform —
   in `content/posts/`, and **adds it to `content/schedule.md`**.
8. **Sends you** the final MP4, the thumbnail and the post text.

Claude asks you before it posts or schedules anything on a social platform.
That only happens if you say yes and a publishing tool is connected (for
example OpusClip with your social accounts); otherwise you upload by hand.

## Examples
- "edit this" (with a video attached) → 9:16 Reel, max 60 s, creator captions
- "edit this for YouTube" → 16:9, no length limit, box captions
- "edit this in Tagalog with inbox/song.mp3" → Tagalog captions + music
- "edit this, no captions, max 30 seconds"

## What is installed
| Tool | What it does here |
|---|---|
| FFmpeg | cutting, reframing, captions, music mixing, loudness, MP4 |
| HyperFrames (HeyGen, open source) | animated intro card rendered from HTML |
| Groq API | fast, accurate Whisper transcription (needs your API key) |
| transformers.js Whisper (local) | backup transcription when Groq is unavailable |
| Claude team agents | hook title, post copy, schedule |

The cloud environment **ai-video-editor-studio** installs the pipeline in every
new session (setup script) and adds your Groq key to requests to api.groq.com.

## Run it yourself
```bash
cd pipeline && npm ci
node edit.mjs ../inbox/myvideo.mp4 --format 9:16 --max-length 60 --title "My hook"
node edit.mjs --help   # all options are listed at the top of edit.mjs
npm test               # 24 automated checks
```

## Limits (honest)
- Edits real footage; it does not film for you or generate a presenter.
- Pause cutting goes by loudness: noisy backgrounds need `--min-pause` tuning.
- Local Whisper (backup) is less accurate than Groq and its word timing is
  approximate; captions may need small fixes.
- Groq's free tier accepts about 25 MB of audio per request (about 100 minutes
  at the pipeline's compression); longer videos are refused with a message.
