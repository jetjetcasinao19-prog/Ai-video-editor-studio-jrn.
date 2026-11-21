# "Edit this" — the automatic video workflow

Say **"edit this"** to Claude in this repository (Claude Code on claude.ai/code
or the Claude app) and attach a video, give a link to your own video, or put
it in `inbox/`. Claude then does the whole job:

1. **Transcribes** the speech — through your OmniRoute gateway if you set one
   up (see below), otherwise Groq Whisper (`whisper-large-v3-turbo`), or
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

## Effects
Claude plans these from the transcript for every video:
- **Zoom**: punch-in zooms at cuts and sentences (talking/live footage) or a
  slow push-in (animation, slides).
- **B-roll**: pictures or clips over the video where they match what is said —
  your own clips (put them in `inbox/broll/`), **historical photos, paintings
  and maps from Wikimedia Commons** (no key needed; only free licences; the
  credits go into your post description), or Pexels stock video (optional,
  needs a free Pexels API key). Photos are shown whole on a blurred background
  with a slow documentary zoom.
- **Text pop-ups**: key words and numbers pop in at the top in your gold.
- **Sound effects**: whoosh and pop, made by the pipeline (no licence needed).
- **Progress bar**: thin gold bar at the top.
Say "no zoom", "no B-roll", "no sound effects" etc. to leave any of them out.

## Your brand
Every video uses the brand kit in `brand/` (see `brand/README.md`): your
colours, caption style, a logo watermark and an outro card with your @handle.
Post text follows `brand/voice.md`. Fill in your name and handle to switch on
the watermark and outro; until then they are left out.

## Examples
- "edit this" (with a video attached) → 9:16 Reel, max 60 s, creator captions
- "edit this for YouTube" → 16:9, no length limit, box captions
- "edit this in Tagalog with inbox/song.mp3" → Tagalog captions + music
- "edit this with my brand music" → uses the song in `brand/music/`
- "edit this, no captions, max 30 seconds"

## What is installed
| Tool | What it does here |
|---|---|
| FFmpeg | cutting, reframing, captions, music mixing, loudness, MP4 |
| HyperFrames (HeyGen, open source) | animated intro card rendered from HTML |
| Groq API | fast, accurate Whisper transcription (needs your API key) |
| transformers.js Whisper (local) | backup transcription when Groq is unavailable |
| OmniRoute (optional, you run it) | AI gateway: one key for many providers, with fallback |
| Claude team agents | hook title, post copy, schedule |

The cloud environment **ai-video-editor-studio** prepares every new session with
a setup script: it installs FFmpeg if it is missing (`apt-get install ffmpeg`)
and the pipeline packages (`npm ci` in `pipeline/`). It also adds your Groq key
to requests to api.groq.com. GitHub's automatic tests install FFmpeg the same way.

## Run it yourself
```bash
cd pipeline && npm ci
node edit.mjs ../inbox/myvideo.mp4 --format 9:16 --max-length 60 --title "My hook"
node edit.mjs --help   # all options are listed at the top of edit.mjs
node brand-preview.mjs # picture of your brand look → brand/preview.png
npm test               # 38 automated checks
```

## OmniRoute (optional AI gateway)
[OmniRoute](https://github.com/cheaper-inference/OmniRoute) (MIT, free) is a
gateway you run yourself. You connect your AI provider keys once in its
dashboard (Groq, OpenAI, Deepgram and others), and the pipeline talks only to
OmniRoute. If one provider is rate limited or down, OmniRoute tries the next.

It is a big install (about 3 GB) that keeps running in the background, so run
it on a computer or a small server, not inside a Claude cloud session (those
are wiped). It can also run on Android in Termux, but phones have little space.

1. Install and start it:
   `npm install -g omniroute` then `omniroute` (needs Node.js 22 or newer).
2. Open `http://localhost:20128`, go to **Providers** and add Groq (paste your
   Groq key). Add others for fallback if you like.
3. Copy your OmniRoute key from **Endpoints**.
4. Tell the pipeline where it is:
   ```bash
   export OMNIROUTE_URL=http://localhost:20128/v1
   export OMNIROUTE_API_KEY=<key from step 3>
   # optional, default groq/whisper-large-v3-turbo:
   export OMNIROUTE_TRANSCRIBE_MODEL=groq/whisper-large-v3-turbo
   node pipeline/edit.mjs inbox/myvideo.mp4
   ```
With `OMNIROUTE_URL` set, the pipeline tries OmniRoute first, then Groq
directly, then local Whisper. `--transcriber omniroute` uses only OmniRoute and
stops with its error message if it fails. `report.md` says which one ran.
Test: `cd pipeline && node test/omniroute.test.mjs`.

## Limits (honest)
- Edits real footage; it does not film for you or generate a presenter.
- Pause cutting goes by loudness: noisy backgrounds need `--min-pause` tuning.
- Local Whisper (backup) is less accurate than Groq and its word timing is
  approximate; captions may need small fixes.
- Groq's free tier accepts about 25 MB of audio per request (about 100 minutes
  at the pipeline's compression); longer videos are refused with a message.
