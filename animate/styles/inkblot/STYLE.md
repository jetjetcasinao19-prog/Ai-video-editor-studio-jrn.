# INKBLOT — the psychology style

**Look:** a psychology case file come to life. Black ink on old card stock,
one red ink (like the red on Rorschach plates II and III), and mirror symmetry
everywhere. Every scene is a numbered **plate** (I, II, III…), and the picture
card has a centre fold. Ink blots are alive: they breathe, bleed and fold.
People are ink silhouettes with paper-white eyes. A therapist's **red pen**
circles things, draws arrows and scribbles notes. Captions are typewritten,
and the progress bar is an **EEG polygraph** whose pen jumps when the voice speaks.

**Why it works for psychology:** the inkblot already means "the mind", so
people read the image as psychology before the first word. It looks like no
other channel, and it stays readable on a phone (high contrast, three inks).
"What do you see?" moments get comments.

## The symbols (use them on purpose)
| Symbol | Meaning | Kit |
|---|---|---|
| Red **open loop** (a ring with a gap and a loose thread) | an unfinished thought, a craving, a worry | `loop(ctx, x, y, r, open, t, {pulse, glow})` |
| **Profile head**, skull lid opens | look inside the mind | `profile(ctx, x, y, s, {lid, inside, blink})` |
| **Brain** with glowing spots | a region "lights up" | `brain(ctx, x, y, s, t, {glow, spots})` |
| Living **ink blot** | the subconscious, ambiguity, transitions | `blot(ctx, x, y, w, h, {seed, kind, live, t, grow, color})` |
| **Eye** | attention, being watched, hooked | `eye(ctx, x, y, r, {open, look})` |
| **Spiral** | hypnosis, loops, habits | `spiral(ctx, x, y, r, t)` |
| **Rubin's vase** | perception, two ways to see one thing | `rubin(ctx, cx, cy, s)` |
| Red **stamp** | the verdict / the fact | `stamp(ctx, 'TEXT', x, y, size, k)` |
| **Red pen** | the narrator's notes | `scrawl`, `penCircle`, `penLine`, `arrow` |
| **Typewriter** | case notes, data | `typeOn(ctx, text, x, y, size, k)` |

People: `figure(ctx, x, y, {s, face, hat: 'bowler'|'cloche'|'cap', hair:
'slick'|'bob'|'bun', glasses, apron, bowtie, tie, skirt, sit, walk, armL, armR,
mood: 'calm'|'smile'|'worry'|'shock', look, blink, holdR})`.
Props: `cafeChair`, `bistroTable`, `cup`, `plate`, `FOOD.*` (pretzel, beer,
cake, sausage, coffee, bread, wine, soup), `bill`, `notepad`, `puzzlePiece`,
`beads`, `clay`, `tab`, `phone`, `clock`, `moon`, `bed`, `cliff`, `bars`, `splat`.
Backdrops (`scenes.mjs`): `plate` (blank card with a faint living blot),
`cafe` (1920s Berlin), `study`, `night`, `dream` (a surreal plain under blot clouds).

## Outro template (the closing brand card)
Every INKBLOT short ends like the Ottoman ones end on the book cover: the last
plate is swallowed by an ink blot that opens on the **case-file cover**. It has
mirrored paper-ink corners, a living blot with a red heart behind the channel
logo (`brand/logo.png`), the tagline taped on like evidence, the handle, a red
"CASE: OPEN" stamp, and ink moths rising. Put it at the end of the last scene, right after the final word:
```js
import { caseCover, inkReveal } from '../../styles/inkblot/scenes.mjs';
const rv = S.at('finish') + 0.6;   // the last spoken word
inkReveal(ctx, S, tween(u, rv, rv + 0.7, ease.linear),
  c => caseCover(c, S, u - rv, { handle: meta.brand.handle, caseNo: '1927', tagline: meta.brand.tagline }));
```
Options: `tagline` (default "THE MIND FILES"), `stamp` (text, or `false`),
`caseNo`. Call it outside `S.cam(...)` (wrap the scene in `ctx.save()/restore()`).
Leave about 3 s after the voice (`meta.duration`) and set `meta.outro.at` so the
call to action types into the caption panel. Sfx: `splat` at the reveal, `stamp`
about 1.2 s later, then `moth`.

## Transitions (`trans:` on a scene)
- `fold` (default) — the card folds shut along the crease and opens on the next plate
- `bleed` — ink floods the card, then drains away (use for a new chapter or a reveal)
- `blink` — eyelids close and open (going "inside the head", or night)
- `wipe` (red pen), `flash` (memory / camera), `cut` (fast beats)

## Rules of the style
1. Three inks: `P.ink`, `P.red`, paper. Pastels (`rose`, `sky`, `ochre`,
   `sage`, `lilac`) only for small props, like the late colour plates.
2. One idea per plate, 2–4 s. Make the key moment land on its word (`S.at('word')`).
3. Show the metaphor, not the literal thing. An unfinished task is an open
   loop; a cliffhanger is a real cliff; a worry is a moth (a blot that flaps).
4. Red-pen labels for names, numbers and the punchline. Short notes in US English.
5. Facts on screen must be in the script or checked (the brand is "dramatic but true").
6. Sound: `music.kit: 'mind'`; sfx `fold` on fold cuts, `splat` on bleeds,
   `blink` on blinks, `stamp` on stamps, `pen` on red-pen notes, `typewriter` on typing.

Template: `animate/projects/zeigarnik-effect/story.mjs`.
