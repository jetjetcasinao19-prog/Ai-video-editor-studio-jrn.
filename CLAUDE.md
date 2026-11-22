# AI Video Editor Studio — project rules

These rules apply to every Claude session and every team agent in `.claude/agents/`.

## The product
- `index.html` is the whole app: one file of HTML, CSS and JavaScript, no build step.
- The owner develops on an Android phone with Claude and GitHub.

## Non-negotiable rules
1. Read the existing code before changing it.
2. Never remove a working feature without the owner's approval.
3. Everything must work in Android Chrome.
4. Keep the layout mobile responsive (no sideways scrolling at 360px width).
5. Give complete replacement files when the owner has to copy code by hand.
6. Explain exactly how to update the GitHub repository from a phone.
7. Test before saying something works: run `node tests/editor.test.js`
   (and `node tests/ai-captions.test.js` for AI captions, `node tests/caption-style.test.js`
   for subtitle styling; both need internet; `node tests/scene-detection.test.js`
   for scene detection, `node tests/transitions.test.js` for the timeline,
   `node tests/music.test.js` for background music,
   `node tests/templates.test.js` for templates,
   `node tests/assistant.test.js` for the AI assistant,
   `node tests/mp4-export.test.js` for MP4 export,
   `node tests/projects.test.js` for projects,
   `node tests/capcut.test.js` for Send to CapCut,
   `node tests/stickman.test.js` for the Stickman Director,
   `node tests/stickman-voice.test.js` for its AI narration voice; needs internet,
   `node tests/story.test.js` for the AI Story Studio,
   `node tests/prompt.test.js` for the AI Prompt panel,
   `node tests/studio.test.js` for the Prompt Studio and the red look,
   `node tests/edit-this.test.js` for ⚡ Edit this in the app,
   `node tests/google-ai.test.js` for the Google AI key in the Prompt Studio).
8. Phones have little RAM: avoid loading whole videos into memory, free object
   URLs, stop media tracks, avoid heavy libraries unless the owner agrees.
9. Never claim a feature works unless it has been implemented and tested.
10. Work on one feature at a time.

## Feature roadmap (in order)
- [x] Captions track (manual, SRT/VTT import, SRT download, burned into export)
- [x] AI automatic captions (Whisper on-device via transformers.js; tests/ai-captions.test.js)
- [x] Subtitle styling (presets, fonts, colours, box, position; tests/caption-style.test.js)
- [x] Automatic scene detection (hard cuts; tests/scene-detection.test.js)
- [x] Video transitions (clip timeline, 8 transitions, fade in/out; tests/transitions.test.js)
- [x] Background music controls (volume, offset, loop, fades, ducking; tests/music.test.js)
- [x] Video templates (7 built-in + saved "My templates"; tests/templates.test.js)
- [x] AI-assisted editing (remove silences, highlight reel, title ideas; tests/assistant.test.js)
- [x] MP4 export (H.264 + AAC/Opus via MediaRecorder, WebM fallback; tests/mp4-export.test.js)
- [x] Project management (save/open in IndexedDB, optional kept media, autosave, backup file; tests/projects.test.js)
- [x] Send to CapCut (share sheet hand-off after export + Open CapCut link; tests/capcut.test.js)
- [x] Stickman Director (`stickman.html`: story → stickman script → animated video export; tests/stickman.test.js)
- [x] Stickman narration voice + Signature character (Kokoro TTS on-device, voice in export, .wav; tests/stickman-voice.test.js)
- [x] AI Story Studio (`story.html`: topic → scenes → image/video prompts for Flow, ChatGPT, Gemini, Grok → join clips; tests/story.test.js)
- [x] Story styles gallery (41 styles incl. 2026 trends, covers in img/styles, free in-app start images; story-styles.js; tests/story.test.js)
- [x] My Google Flow link, ✨ Claude writer, Claude Cartoons styles (46 styles), word-pop captions, accurate covers (tests/story.test.js)
- [x] AI Prompt panel (typed commands/scripts run the editor; prompt → picture via free Pollinations.ai, download or show on video; tests/prompt.test.js)
- [x] Prompt Studio + red restyle (prompt queue → free pictures, Stickman, or guided copy/open/share hand-off to Flow, Gemini, ChatGPT, Grok — no automation of those sites; .txt/.csv; start frames; tab bar; tests/studio.test.js)
- [x] ⚡ Edit this in the app (the edit-this skill on the phone: brand, Whisper captions with word highlight, cut pauses, max length, hook intro card, punch/slow zoom, Wikimedia B-roll, pop-ups, whoosh/pop, progress bar, logo, outro, export, thumbnail, post text, ET/PHT schedule; never posts; tests/edit-this.test.js)
- [x] My Google Flow account (owner's Gmail saved only on the phone, never in code: Flow buttons open flow.google.com in that account via authuser; Google sign-in with the email filled in; shared by index.html and story.html; accepts flow.google.com project links; tests/studio.test.js, tests/story.test.js)
- [x] Google AI in the Prompt Studio (owner's own Gemini API key, saved only on the phone: Gemini Omni Flash videos (Veo was shut down in the Gemini API on Oct 22, 2026) and Nano Banana pictures via the REST interactions endpoint; cost shown and confirmed before spending; USE IN EDITOR; Flow itself has no API, so it stays a hand-off; tests/google-ai.test.js)

## "Edit this" workflow (server side)
When the owner says "edit this", use the `edit-this` skill
(`.claude/skills/edit-this/SKILL.md`). It runs `pipeline/edit.mjs` (FFmpeg +
OmniRoute gateway if `OMNIROUTE_URL` is set, else Groq Whisper or local Whisper
+ HyperFrames intro; effects: zoom, B-roll from files, Wikimedia Commons images
(no key) or Pexels, text pop-ups, sound effects, progress bar), writes post copy to
`content/posts/` and adds a row to `content/schedule.md`. Test it with
`cd pipeline && npm test` (OmniRoute: `node test/omniroute.test.mjs`). Never post to social media without the owner's
explicit yes in the conversation. Guide: `docs/AI-WORKFLOW.md`.

## Animated shorts from code (server side)
When the owner says **"edit this in 2D(OTTOMAN)"** (or "edit this in 2D(<style>)"),
or sends a voice-over and asks for an animated short / cartoon
"written from code", use the `animated-short` skill
(`.claude/skills/animated-short/SKILL.md`). It lives in `animate/`
(Node canvas frames → FFmpeg, Python-generated score and sound effects;
first style: Ottoman miniature painting). Setup: `bash animate/setup.sh`.
Every video gets its own look (`meta.look`: album, tile, night, scroll,
classic) and must pass `node animate/check-unique.mjs projects/<slug>` so the
channel stays monetizable (YouTube's inauthentic-content policy);
`animate/compile.mjs` stitches shorts into a 16:9 long-form video with chapters.
Test: `cd animate && npm test`. Example: `animate/projects/bubble-wrap/`.
Like `pipeline/`, it is not part of the phone app and is left out of Pages.

## Google Flow MCP (merged repo)
`google-flow-mcp/` is the owner's fork of google-flow-browser-mcp, merged with
its history. It is a separate Node.js MCP server that drives the Google Flow
website with Playwright in the owner's own Chrome on a computer. It is not part
of the phone app and does not run in cloud sessions. Google's terms don't allow
automating its apps and the tool hides from bot detection, so don't run it for
the owner or wire it into `index.html`; point to Prompt Studio → Google AI
(API key) or the Flow hand-off instead. Never commit `google-flow-mcp/config/flow.config.json`.
Read `google-flow-mcp/ABOUT-THIS-FOLDER.md` first.

## OmniRoute and Remotion (linked repos)
`omniroute/` and `remotion/` are git **submodules**: links to the owner's forks
jetjetcasinao19-prog/OmniRoute and jetjetcasinao19-prog/remotion at a fixed
commit (each is 0.6–1 GB, so they are not copied in). They are empty until
fetched: `git submodule update --init --depth 1 omniroute` (or `remotion`), or
clone with `git clone --recurse-submodules --shallow-submodules`. To move a
link to a newer version: fetch it, check out the commit inside the folder,
then commit the folder. The pipeline reaches OmniRoute through `OMNIROUTE_URL`
(a running OmniRoute server), not through this folder.
GitHub Pages is published by `.github/workflows/pages.yml`, which leaves the
submodules, `pipeline/` and `google-flow-mcp/` out (Settings → Pages → Source:
GitHub Actions). Never switch Pages back to "Deploy from a branch": the default
builder downloads the submodules and fails.

## Brand kit
`brand/brand.json` (name, @handle, colours, caption style, intro, outro,
watermark, music volume, hashtags), `brand/voice.md` (how posts sound),
`brand/logo.png` (optional; otherwise an initials logo is made),
`brand/music/` (licensed songs). The pipeline applies it automatically
(`--no-brand` turns it off). Preview: `node pipeline/brand-preview.mjs` →
`brand/preview.png`. All writing must follow `brand/voice.md`.
Publishing target: **US audience** — US English, US Eastern Time posting
schedule (with the owner's Philippine time shown next to it).

## Team
Agents live in `.claude/agents/`. In Claude Code, ask for one by name, for
example: "use the planner agent to plan subtitle styling".

| Agent | Job |
|---|---|
| planner | Breaks a goal into small steps and updates the roadmap |
| app-developer | Builds features in `index.html` |
| tester | Runs tests and checks Android/mobile compatibility |
| reviewer | Reviews changes for bugs, removed features and RAM problems |
| researcher | Researches video topics, trends and facts with sources |
| scriptwriter | Writes video scripts and captions from research |
| video-editor | Plans edits: cuts, captions, music, transitions, formats |
| publisher | Prepares titles, descriptions, hashtags and the posting schedule |

## Content workflow
idea → `researcher` (content/research/) → `scriptwriter` (content/scripts/)
→ `video-editor` (edit plan) → owner edits in the app → `reviewer`
→ `publisher` (content/schedule.md) → owner posts.
