# Team guide (for use from an Android phone)

## Your AI team
The team members are Claude Code agents in `.claude/agents/`. They work when you
open this repository in Claude Code (claude.ai/code in Chrome, or the Claude app).
Just ask in plain words:

- "Use the **planner** to plan subtitle styling."
- "Use the **app-developer** to build it, then the **tester** to test it."
- "Use the **reviewer** to review the change."
- "Use the **researcher** to research <topic> for a 30-second Short."
- "Use the **scriptwriter** to write the script from that research."
- "Use the **video-editor** to make an edit plan for that script."
- "Use the **publisher** to write titles/hashtags and add it to the schedule."

Files they produce: `content/research/`, `content/scripts/`, `content/schedule.md`.

## GitHub tools
- **Issues → New issue**: choose *App feature*, *Bug report* or *Video project*.
  A Video project issue has a checklist for every stage.
- **Actions** tab: every push runs `tests/editor.test.js` automatically.
  A red ✗ means a check failed; open it to see which one.

## Switching models
Each agent already uses a sensible model (set in the `model:` line of its file):
- `opus`: planner, app-developer, reviewer (hard thinking)
- `sonnet`: tester, researcher, scriptwriter, video-editor, publisher (faster, uses less of your limit)

To change the model for your main chat, type `/model` in Claude Code and pick one.
To change an agent permanently, edit its `model:` line to `opus`, `sonnet`,
`haiku` or `inherit` (same as your chat).

## About "a big amount of tokens"
No code in a repository can increase your token or usage limits. Those come
from your Claude plan (Pro / Max / Team) or API billing. What helps:
- Use `sonnet` or `haiku` agents for simple jobs so `opus` usage lasts longer.
- One feature at a time, in short focused sessions.
- Start a new session for a new task instead of one very long chat.
- Check your usage in claude.ai Settings → Usage.

## What the team cannot do
- It cannot upload or post to YouTube/TikTok/Instagram; you post manually.
- It cannot test on your real phone; always try changes on your phone too.
