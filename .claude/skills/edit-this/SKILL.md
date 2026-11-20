---
name: edit-this
description: The owner's one-command video workflow. Use when the owner says "edit this", "edit this video", "make this a reel/short", or sends a video and asks for it to be edited, captioned, made into content or scheduled. Runs the FFmpeg + Groq + HyperFrames pipeline, writes the post copy and adds it to the posting schedule.
---

# "Edit this" — from raw video to a scheduled post

You are the owner's whole production team. When they say **"edit this"**, do
every step below without asking questions you can answer yourself. Ask only
for things that are truly theirs to decide (see step 7). Follow CLAUDE.md
(honesty: never say something worked unless you checked it).

## 1. Find the video
In this order:
1. A video file the owner attached or named in this conversation.
2. A video link they gave: download it with `curl -L -o inbox/<name>.mp4 <url>`
   only if it is their own video or they say they have the right to use it.
3. The newest video in `inbox/`.

If there is no video, say so in one line and offer two choices:
upload one (attach it or put it in `inbox/`), or "make content from a topic"
(then use the researcher → scriptwriter agents to write a script and a shot
list they can film, and stop there — this workflow edits real footage).

## 2. Make sure the tools are installed
```bash
command -v ffmpeg && node -v          # needs ffmpeg and Node 22+
[ -d pipeline/node_modules ] || (cd pipeline && npm ci)
```

## 3. Use the brand kit
The pipeline reads `brand/brand.json` automatically: brand colours, caption
style, logo watermark and the outro card with the owner's @handle. Read
`brand/voice.md` before writing any title, description or hashtag, and add
`hashtags` from `brand.json` to every post. If `brand.json` has no `name` and
`handle` yet, mention once that filling them in adds the watermark and outro.
If the owner asks for music and `brand/music/` has a song, use `--music auto`.

## 4. Choose the options (defaults in brackets)
Read the owner's request: platform → format, any length or style wishes.
- Format: Reels / TikTok / Shorts / Stories → `9:16` [default];
  YouTube → `16:9`; feed post → `1:1`.
- Captions: from the brand kit [default `creator`, word highlight]; `box`, `classic`, `none` when asked.
- `--max-length 60` for Shorts/Reels unless they asked otherwise; TikTok up to
  `--max-length 90`; YouTube: no limit.
- Language: the target audience is the US, so use `--language en` unless the
  owner says the video is in another language; `--language tl` for Tagalog. Leave it
  out if unsure (auto-detect).
- Music: only if they gave a file or asked for music: `--music inbox/song.mp3`,
  or `--music auto` for the brand song. Only use music they have the right to use.

## 5. First pass (no intro yet)
```bash
node pipeline/edit.mjs "<video>" --out output/<slug> --format 9:16 --max-length 60
```
Transcription uses Groq (`whisper-large-v3-turbo`) when its key works and
falls back to local Whisper automatically; the report says which one ran.

## 6. Write the content (you, using the transcript and brand/voice.md)
Read `output/<slug>/report.md` (transcript, what was cut). Then, as the
`publisher` agent describes:
- A short, specific hook title (max ~40 characters for the intro card).
- Per platform: title, description (2–3 lines, a call to action), 3–8 hashtags.
- Check the transcript for mistakes (names, terms like "Zeigarnik"). If unsure,
  cross-check a phrase with a bigger Whisper model. Fix them for the burned-in
  captions with `--fix "wrong words=right words"` (repeatable) in the final pass.
- Decide whether an intro card helps: skip it when the video already opens with
  a strong spoken hook (an intro delays the hook); keep the total under 60 s for
  Shorts/Reels.

## 7. Plan the effects (zoom, B-roll, text pop-ups, sound, progress bar)
Effects keep viewers watching. The brand kit (`brand.json` → `effects`) turns
on punch zooms, sound effects and the progress bar by default. Use
`output/<slug>/transcript.json` (word times are on the **output** timeline,
after cuts — the same timeline the plan uses) and write
`output/<slug>/plan.json`:
```json
{ "broll":  [ {"at": 8.2, "duration": 2.5, "query": "ancient roman coins"},
              {"at": 21.0, "duration": 3, "file": "inbox/broll/factory.mp4"} ],
  "popups": [ {"at": 10.8, "text": "2-minute rule"}, {"at": 40.1, "text": "Dopamine"} ] }
```
- **Zoom** (`--zoom`): `punch` for talking heads and live footage (zooms at
  cuts and sentence ends); `slow` for animation, slides or screen recordings
  (punch zooms crop drawings at the edges); `none` if the owner asks.
- **B-roll**: 3–6 moments for a 60 s video, 2–3.5 s each, at least ~6 s apart,
  never in the first 2 s (the hook) or over an on-screen reveal. Each one must
  match what is said at that moment. Prefer the owner's own clips (`file`, e.g.
  from `inbox/broll/`); otherwise a short, concrete Pexels search (`query`, for
  example "1950s diner", not "history"). Stock B-roll needs the Pexels key;
  without it the pipeline skips those entries and says so. Skip B-roll for
  animated videos (stock footage clashes with the art style).
- **Text pop-ups**: 3–6 key words or numbers (max ~20 characters) placed
  0.1–0.3 s before the word is spoken. They appear at the top, in the brand
  accent colour, with a pop sound.
- **Sound effects** (`--sfx` / `--no-sfx`): whoosh on zoom moves and B-roll,
  pop on pop-ups. Made by the pipeline itself (no licence needed).
- **Progress bar** (`--progress-bar` / `--no-progress-bar`): thin accent bar at the top.
- Stock clips: Pexels licence allows free use; the report lists each clip's
  creator under `credits` — add "B-roll: Pexels" credits to the description.

## 8. Final pass with the HyperFrames intro card (and brand outro)
```bash
node pipeline/edit.mjs "<video>" --out output/<slug> --format 9:16 --max-length 60 \
  --title "<hook title>" --subtitle "<optional second line>" --fix "wrong=right" \
  --plan output/<slug>/plan.json --zoom punch
```
Then **check the result yourself** before showing it:
```bash
ffmpeg -loglevel error -y -i output/<slug>/final.mp4 \
  -vf "fps=1/2,scale=216:-1,tile=6x2:padding=4" -frames:v 1 output/<slug>/contact.png
```
Look at `contact.png` and `thumbnail.jpg` with the Read tool: intro readable,
captions readable and not covering faces, watermark not covering anything
important, outro shows the right @handle, picture framed well, pop-ups not
covering faces, B-roll matching what is said, zoom not cutting off important
parts. Pick frames at the B-roll and pop-up times for the contact sheet. If something
is wrong, change the options and render again. Say what you checked.

## 9. Save the post and schedule it
- Write `content/posts/<YYYY-MM-DD>-<slug>.md` with: the video name, the
  transcript summary, and the per-platform title/description/hashtags.
- Add a row to `content/schedule.md` with status `planned` and a suggested
  date/time for the **US audience**: in US Eastern Time with the owner's
  Philippine time next to it (say it is general guidance, not from their analytics).
- **Posting to social media is the owner's decision.** Never post or
  schedule on a platform without their explicit "yes" in this conversation.
  If they say yes and a connected tool can publish (for example the OpusClip
  connector with their social accounts), use it and report exactly what was
  scheduled where. If no such tool is connected, tell them the files are ready
  to upload by hand and mark the row `ready`.

## 10. Deliver
- Send `output/<slug>/final.mp4`, `thumbnail.jpg` and the post file to the
  owner with SendUserFile (videos are not committed to Git; `output/` is ignored).
- Commit `content/posts/…` and `content/schedule.md` and push to the working branch.
- Finish with a short summary: what was cut (seconds), which transcriber ran,
  which effects were used (zoom style, B-roll clips and sources, pop-ups),
  the hook title, where the post is planned, and anything not done.
