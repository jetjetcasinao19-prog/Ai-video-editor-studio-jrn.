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
   for scene detection).
8. Phones have little RAM: avoid loading whole videos into memory, free object
   URLs, stop media tracks, avoid heavy libraries unless the owner agrees.
9. Never claim a feature works unless it has been implemented and tested.
10. Work on one feature at a time.

## Feature roadmap (in order)
- [x] Captions track (manual, SRT/VTT import, SRT download, burned into export)
- [x] AI automatic captions (Whisper on-device via transformers.js; tests/ai-captions.test.js)
- [x] Subtitle styling (presets, fonts, colours, box, position; tests/caption-style.test.js)
- [x] Automatic scene detection (hard cuts; tests/scene-detection.test.js)
- [ ] Video transitions
- [ ] Background music controls
- [ ] Video templates
- [ ] AI-assisted editing
- [ ] MP4 export
- [ ] Project management (save/load projects)

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
