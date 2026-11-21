# Google Flow Browser MCP (merged into AI Video Editor Studio)

This folder is the owner's fork of **google-flow-browser-mcp**
(github.com/jetjetcasinao19-prog/google-flow-browser-mcp, originally by
TMSSS05), merged here with its full git history. See `README.md` in this
folder for its own instructions.

## What it is
An MCP server that drives the **Google Flow website** (labs.google/fx/tools/flow)
with Playwright in your own signed-in Chrome, so an AI agent (OpenCode or
Claude Code) can make Flow pictures and videos with your Flow account and credits.

## Where it runs
- **On a computer only** (Windows, Mac or Linux) with Node.js 18+, Google Chrome
  and your Google account signed in. It does **not** run on the Android phone,
  inside the editor page (`index.html`), or in a Claude cloud session.
- It is separate from the editor app: nothing in `index.html` uses it.

## Before you use it — your account
Google's terms don't allow automated use of its apps, and this tool hides that it
is automated from Google's bot detection. Google can limit or block an account
that does this. The safe ways to use Flow's models from the editor are already
built in:
- **Prompt Studio → 🔑 Google AI** (your Gemini API key; Gemini Omni Flash videos
  and Nano Banana pictures; paid by your Google AI Studio account), or
- **Prompt Studio → 🎬 Flow** (copy each prompt, open Flow, you generate there).

## Run it (on a computer)
```bash
cd google-flow-mcp
npm install
cp config/flow.config.example.json config/flow.config.json   # then edit it
npm start
```
`config/flow.config.json` holds your own email and Chrome profile. It is in
`.gitignore`, so never force-add it to this public repository.
