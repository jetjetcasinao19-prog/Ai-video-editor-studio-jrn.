---
name: animated-short
description: Turn a voice-over into a 2D animated short drawn entirely in code (no stock footage, no AI images) — every frame painted on a canvas, synced word-by-word to the voice, with a generated soundtrack, sound effects, post copy and a schedule row. ALWAYS use when the owner says "edit this in 2D(OTTOMAN)" or "edit this in 2D (<style>)" (any spacing or capitals, e.g. "edit this in 2d ottoman"), and when the owner sends a voice-over (mp3/wav) and asks for an animated video, a cartoon, a "2D animated short", or a video "written from code". Styles: OTTOMAN (Ottoman miniature painting).
---

## Trigger: "edit this in 2D(STYLE)"
This is the owner's one-command phrase for this skill (the plain "edit this"
skill is for real footage; anything with "in 2D" comes here). Do every step
below without asking questions you can answer yourself:
- **Style** = the word in brackets, lower-cased → `animate/styles/<style>/`
  (`OTTOMAN` → `styles/ottoman`). No brackets → Ottoman. A style that does
  not exist yet: say so in one line and offer to build it as a new style
  (see the end of this file) or to use Ottoman now.
- **Voice-over** = the audio file attached in this conversation; else the
  newest `.mp3`/`.wav`/`.m4a` in `inbox/`. None → ask for it in one line.
- **Script** = the text the owner pasted, if any (use it to fix the spelling
  of names); otherwise the transcript.
- **Finish the whole job**: pick a device and a look → render → check → `check-unique.mjs`
  passes → send the MP4 → publisher agent writes post copy + schedule rows
  (step 7) → commit and push.
- **Monetization comes first**: every video must look and feel like its own
  piece, never like the last one with new words (see "YouTube monetization" below).

# Animated short from a voice-over — all code

The owner records or generates a voice-over (often ElevenLabs) and wants a
vertical animated short for YouTube Shorts / Reels / TikTok. You write the
animation as code: a **storyboard** (`story.mjs`) of scenes, each a function
that paints one frame on a canvas. The engine renders every frame, mixes the
voice with a generated score + sound effects, and exports an MP4.

Everything lives in `animate/`:

| Path | What it is |
|---|---|
| `animate/setup.sh` | installs/checks the tools (Node 22+, FFmpeg + libx264, Python 3 + numpy, `@napi-rs/canvas`, fonts) |
| `animate/transcribe.mjs` | voice → `words.json` (word timings; OmniRoute if `OMNIROUTE_URL` is set, else Groq Whisper) |
| `animate/render.mjs` | CLI: contact sheet, stills, full render; `--look <name>` previews another look |
| `animate/subtitles.mjs` | writes the `.srt` subtitle file for a project (`--all` for every one); full renders write it automatically |
| `animate/lint-story.mjs` | craft check of a storyboard: labels that repeat the narration, too many stamps, scenes that don't change, flat camera, one backdrop everywhere (`--all` for every project) |
| `animate/check-unique.mjs` | compares a project with every other one (page design, near-copy pictures, music, transitions, script formula); exit 1 = too similar |
| `animate/compile.mjs` | several shorts → one 16:9 long-form video with intro, chapter cards, outro and a YouTube chapters list |
| `animate/styles/ottoman/looks.mjs` | the looks: `classic`, `album`, `tile`, `night`, `scroll` (page layout, marbling colours, caption colours, particles, colour grade, camera drift, their own transitions) |
| `animate/lib/engine.mjs` | parallel frame workers → FFmpeg, then soundtrack + mux |
| `animate/lib/audio.py` | synthesised score (maqam scales, oud/kanun strings, ney, def/darbuka) + 20 sound effects + voice ducking + −14 LUFS |
| `animate/styles/ottoman/` | the Ottoman miniature style: `kit.mjs` (figures, turbans, cloud bands, spongy rocks, cypresses, tulips, waves, galley, tughra, seals, stamps, sticky notes, books, alembic, jar, hammam + basin, water streams, water gun, rocket, pagoda, flower cards, taxi car, rice bowl, treasure chest, Ultra Hand lattice, handheld console, toy box, lamb, roast turkey, pie, pumpkin, calendar page, quill, envelope, printing press, magazine, peach basket, 1891 leather ball, ladder, maple leaf, snow, gym railing, cookie, chocolate bar + chunks, knife, brick oven, balance scale, coin, chip bag, dough blob, soot, dough can, coal stove, newspaper, cobweb, hillside sign letters (rise/tilt/fall/light up), palm, hourglass, searchlights, film reel, clapperboard, guitar, gas pump, drumstick, striped bucket, bank check, pressure cooker, celestial spheres, galaxy, BBC microphone with radio waves, horn antenna, chalkboard, stepped-gable house, speech bubble, magnifier, drum, reindeer, sleigh, generic soda bottle, easel, gilded frame, toy brick (with tubes cut-away), wooden pull duck, yo-yo, flames, windmill, curved ink stroke, running shoe, ring, share certificate, melting candy bar, magnetron cutaway, gold wave rays, radar dish and scope, exploding egg, 1940s cabinet oven, countertop microwave, measuring rod, Statue of Liberty (`liberty` with any `metal` colour, `COPPER` new/brown/green, `mixColor`), her pedestal, penny, paint bucket, Karagöz `puppet` (jointed shadow puppet on a rod: `hat` bun/fedora/bowler/cap/bald, `arm`, `walk`, `talk`, `hold`), `gameBoard` (generic race-around board with houses and moving tokens), `gavel`, `coinStack`, 1914 hats (`servicecap`, `pickelhaube`, `zucchetto`), `candleTree`, `barbedWire`, `trench`, `letter`, `candle`, `bandana` hat, `wcdiPoster` (the 1943 poster re-painted), `gramophone`, `archiveDrawer`, `kepi` and `campaignhat` hats, `idTag` (paper note / 1906 disc / modern tag), `aTent`, `bugle`, `lantern`, `staff` (music staff with the Taps notes), `headstone`, `usFlag` (1862), `helmet` (WWII M1), `mesas`, `hogan`, `fieldRadio`, `loomRug` (generic woven rug on a loom, rows 0..1), fireworks bursts, wedge-shaped tower, glowing time ball with bulbs, clock face, street sign, field mouse (also as an ink sketch), hare, steam train, river steamboat, picture-house screen with curtains, padlock…), `page.mjs` (ebru marbled margins, illuminated header, gold-ruled frame, captions, progress reed), `scenes.mjs` (ready backdrops: `land`, `interior`, `lamp`, `compassRose`, `bookCover` for the closing brand card, `bigSign` gold title, `medallion` ?/!, `heart`, `usMap`), `index.mjs` (transitions) |
| `animate/projects/<name>/` | one video: `voice.mp3`, `words.json`, `story.mjs` → `out/<slug>.mp4` |
| `animate/projects/bubble-wrap/` | the first finished short — **copy it as the template** |
| `animate/projects/post-it-notes/` | second short (sticky notes, alembic, choir, hymn book, bazaar stall, map of America) |
| `animate/projects/super-soaker/` | third short (hammam bathroom, water blasts, rocket, gates stamped NO with days flying by, counter over a treasure heap, festival) |
| `animate/projects/nintendo/` | fourth short (Kyoto pagoda, flower cards, counters, a palace that grows behind a little shop) |
| `animate/projects/thanksgiving/` | fifth short (a woman with a hotoz cap and veil, Lincoln in a stovepipe hat, calendars, letters, a torn map, a feast) |
| `animate/projects/basketball/` | sixth short (snowy town, a palace-hall gym with baskets on the balcony, teams of nine, a chalk scoreboard, a janitor on a ladder) |
| `animate/projects/chocolate-chip-cookie/` | seventh short (a kitchen, chopping chocolate, a brick oven, a cookbook, a deal under a canopy, a rolling coin) |
| `animate/projects/play-doh/` | eighth short (a sooty wall wiped clean in stripes, a coal stove, a gas heater, a classroom of dough, a can that becomes a toy) |
| `animate/projects/hollywood-sign/` | ninth short (a hillside sign whose letters rise, light up, fall and fly away; a rock star; searchlights and film reels). Keep videos under 60 s: set `duration` ≤ 59.8 |
| `animate/projects/kentucky-fried-chicken/` | tenth short (a real person's signature look — white suit, goatee, string tie — without any logo; a bypass highway on a chart; coins per chicken into a jar) |
| `animate/projects/big-bang/` | eleventh short (celestial spheres from Ottoman astronomy manuscripts expanding and collapsing to one point, a BBC microphone, a horn antenna, Einstein's wild hair) |
| `animate/projects/ok/` | twelfth short (a word's origin: a newspaper page, joke abbreviations, a nickname with its initials lit, parade, speech bubbles around the world) |
| `animate/projects/santa/` | thirteenth short (myth-busting; a brand's product drawn generic with no logo; framed pictures showing a change over the years) |
| `animate/projects/lego/` | fourteenth short (a word built from two words — LEG GODT → LEGO; a factory fire and rebuild; a patent drawing). Tip: `S.at(/^leg$/i)` matches a whole word when a longer word starts the same |
| `animate/projects/nike-swoosh/` | fifteenth short (a logo's origin told editorially: ink sketches on paper, an invoice, a ring — never a reproduced brand lockup) |
| `animate/projects/times-square-ball/` | sixteenth short (a night skyline, fireworks then a BANNED stamp, a street sign renamed, a harbor time ball setting ships' clocks, the 1907 ball lowering, homes lighting up one by one). Holiday story: schedule it before the holiday |
| `animate/projects/mickey-mouse/` | seventeenth short (a famous character's origin without drawing the character: a generic painted mouse and hare, a 1928 film shown in black and white on a picture-house screen, a padlock opening for the public domain). `microphone(..., text)` takes `''` to drop the BBC band. First video in a new look: `album` |
| `animate/projects/microwave/` | eighteenth short, first `marvels` device (Book of Wonders: magnetron cutaway with gold callouts, a measuring rod and balance for 6 ft / 750 lb, astonished onlookers with `mood: 'wow'`, a wheel of kitchens), `scroll` look, `tiles` room |
| `animate/projects/statue-of-liberty/` | nineteenth short, first `mosaic` device: the statue cut into ~300 tiles from cached copper/brown/green layers (`mosaicStatue` in the story) — tiles pop in, then the patina spreads tile by tile; `tile` look with `ambient: 'dust'`, `lattice` room |
| `animate/projects/monopoly/` | twentieth short, first `karagoz` device: Lizzie Magie vs. Charles Darrow as jointed shadow puppets (draw them 30% larger than the kit default), curtain between acts, a spotlight for the twist; generic board, never the brand's design; `karagoz` look, `tent` room |
| `animate/projects/black-friday/` | twenty-first short, first `meddah` device (a coffeehouse storyteller on a high seat with stick and handkerchief, listeners with coffee cups who react; story scenes in between, back to him for the twist) and the new `ledger` look; posted between existing videos, so it needed a look none of its neighbours use — when inserting a video into the schedule, check the looks of the videos before AND after it (`check-unique.mjs --all`) |
| `animate/projects/christmas-truce/` | twenty-second short, first `letters` device; the voice ran 60.2 s, so it was sped up 5% (`ffmpeg -af atempo=1.05`, then re-transcribed) to stay under 60 s — tell the owner when you do this; `silentnight` sound effect (public-domain tune on a ney); Times Square moved to `ledger` so night could go to this Christmas Eve slot |
| `animate/projects/we-can-do-it/` | twenty-third short, first `voyage` device: the poster travels a gold road across a map of its own life (`voyageMap` in the story), plus a Matrakçı panorama where copies pop up on every block; a copyrighted painting (Rockwell) is shown only as a generic magazine cover with the artist's name |
| `animate/projects/dog-tags/` | twenty-fourth short, `marvels` device on the `ledger` look (an army register); lesson from its first sheet: diagram scenes on plain paper look empty on a paper look — give every diagram a real setting (a desk, a velvet tray, a camp) |
| `animate/projects/taps/` | twenty-fifth short: the motif is the call's official name — the camp's lanterns go out one by one as the real melody plays (`taps1`/`taps2`); score drops to `end` mood under the bugle; the signature brush shows as dark ink on night scenes, which is expected |
| `animate/projects/code-talkers/` | twenty-sixth short, first `loom` device: a rug woven row by row opens and closes it; real Indigenous people shown with respect in correct uniforms, a generic rug pattern (never a copied tribal design), code words only by their documented English meanings, drawn as picture pairs (iron fish → submarine) |
| `animate/projects/marathon/` | twenty-seventh short, `voyage` device on a painted map of Greece (each run is a dotted road; the map opens and closes the story); the famous death-run is drawn as a legend (the runner fades to a dotted outline with a question mark) because Herodotus never tells it; hoplite helmets (`greekhelm`), Persian caps (`tiara`) and a laurel (`wreath`) for figures; `aspis()` shield and a top-down `stadium()` for 1896, no Olympic rings |
| `animate/projects/thermopylae/` | twenty-eighth short, a Karagöz shadow play like Monopoly but at war: hoplite and Persian puppets with spear-and-shield `hold`, pierced mountain set pieces and a sea strip; the last fight is told by the lamp behind the screen burning down (no gore), the forgotten 700 Thespians step into the light beside the Spartans, and the ending cuts the epitaph Herodotus records (traditionally given to Simonides) into a stone line by line |
| `animate/projects/gladiators/` | twenty-ninth short, `mosaic` device done generically: `mosaic(key, S, paint)` paints any picture offscreen and re-lays it as square tesserae (nearest colour from a Roman tile palette, jittered, on grout); the opener lays a gladiator mosaic bottom-up, its tiles flip to a funeral, and near the end the arena flips back over the funeral; Roman props (`gladhelm` hat, scutum, ox, Colosseum in elevation, ancestor masks); the hedged fact ("likely prisoners of war") gets a quiet question mark and "the sources don't say for sure" |
| `animate/projects/great-wall/` | thirtieth short, `chronicle` on a patchwork map of the seven rival kingdoms that returns four times (borders, Qin's black flood, the northern walls joined by a gold thread, Wei's wall built against Qin); `wall()` draws a wall along any path as rammed earth (striped) or Ming brick (crenels, towers); Chinese dress per era (`topknot`, the emperor's `mianguan`, `minghelm`); the Xiongnu are riders of the steppe, never "barbarians"; Whisper heard "Qin" as "chin" — fixed in words.json. Note: `hills()` stops 90 px under yTop, so start `ground()` there or the page shows through |
| `animate/projects/terracotta/` | thirty-first short, `marvels` on one cut-away of the earth (`cutaway()`: sky, field, four soil layers; `shaft()` for the well) that returns six times, ending with a water drop falling down the well and lighting the army gold; clay warriors are `figure()` in clay tones with varied beards and moustaches, the general in a `heguan` cap; the emperor reuses the Great Wall short's `mianguan`; voice sped up 3% (atempo 1.03) to stay under 59.8 s |
| `animate/projects/hannibal/` | thirty-second short, `voyage` again on a painted Mediterranean (`seaMap()`; the march is a dotted road New Carthage → Alps → Cannae); a hook where a giant general's shadow turns out to belong to a nine-year-old; an `elephant()` drawn the way the court painters drew the sultan's; the oath is labelled "as Hannibal told it · recorded by Polybius"; Cannae is a top-down diagram where the thin line bends from a flat front into a U and the cavalry closes the back; losses in the Alps are figures fading into snow |
| `animate/projects/troy/` | thirty-third short, `letters` device (Calvert's letter, Schliemann's `telegram()`, the Ottoman lawsuit) around a recurring `hillCake()`: the hill cut open into nine coloured cities (Troy I–IX, numerals inside the edge) that the great trench slices through, with a glow on the layer where the gold really lay; in 1873 the hill was Ottoman, so the officials wear the fez and the label says "Ottoman Empire, today Turkey"; Whisper's "Hisalik" fixed to Hisarlik |
| `animate/projects/pyrrhic/` | thirty-fourth short, `meddah` device (storyteller + listeners, story pictures in a panel above them) with one object that keeps returning: `scales()` built on `k.balance()`, a laurel in one pan for every win and a helmet in the other for every loss, so the cost pan sinks scene by scene until it hits the floor; losses are helmets, never bodies; the quote is labelled "as Plutarch reports it"; ends on a dictionary entry for the phrase |
| `animate/projects/rubicon/` | thirty-fifth short, `mosaic` device through the new shared `styles/ottoman/mosaic.mjs` (`mosaic()`, `drawMosaic()`, `mosaicBorder()` — use these instead of copying the gladiators code): it opens on a river-and-legion mosaic laid from the river outwards and closes as its tiles flip to "ALEA IACTA EST" and a foot on the far bank; night look for the night crossing; "the die is cast" is labelled as Suetonius wrote it ~170 years later; the river's location is shown as several candidate streams with question marks |
| `animate/projects/decimate/` | thirty-sixth short (38 s), a word origin told as a `chronicle` on a ruled ledger `page()` that returns in most scenes: dictionary entry → DECEM = TEN → rows of ten → lots from a helmet → one of ten becomes a dashed outline while the nine turn away → a near-empty ledger of centuries → a pie swinging from "most" back to "1 in 10"; the punishment is never shown as violence (advertiser-friendly) |
| `animate/projects/laconic/` | thirty-seventh short (37 s), `letters` device as a contrast of sizes: Philip's threat is a `longScroll()` that never stops unrolling, Sparta's answer a `scrap()` with one word; the place name morphs LACONIA → LACONIC and the three closing words land as spear-point arrows; invented details were cut (no made-up word counts or quotes) |
| `animate/projects/deadline/` | thirty-eighth short (34 s), `loom` device as one red `thread()` woven through every scene, changing meaning as it goes: the line under a date on a clerk's calendar → the dead line railing inside a bird's-eye `stockade()` at Andersonville → a guide line on a press bed → the calendar again; the prison camp is shown with respect (sentry box, men keeping their distance, no shooting) |
| `animate/projects/freelancer/` | thirty-ninth short (35 s), a Karagöz shadow play for a word origin: a laptop worker flips (puppet squashed to zero width and back) into a mounted knight, the word splits FREE + LANCE while lords' banners are crossed out, and the lance turns into a pen at the end; new puppet hat `knighthelm` (pot helm with eye slit and plume), a pierced cut-out `horse()` (draw it at 2× the knight's scale or it reads as a dog); the coinage is credited to Scott's Ivanhoe (Dec 1819, dated 1820) |
| `animate/projects/velcro/` | fortieth short (36 s), `marvels` device built on a `magnified()` circle where hook rows close down onto loop rows; new kit props `dog()` (walk phase, wagging tail, `burrs` option), `burr()` and `microscope()`; trademark handled by never drawing a logo, only spelling the name as VELOURS + CROCHET → VEL + CRO |
| `animate/projects/slinky/` | forty-first short (41 s), `voyage` device where the traveller is the toy itself: `walkingSlinky()` draws rings stacked at one end, an arch of rings (each turned across the arc's tangent) and rings landing at the next step — a first try that bent one coil along an arc read as a crumpled bundle; it walks down stairs, off a shelf, across a dictionary page and past the store; the 400 → 0 counter empties a pyramid of plain boxes; trademark handled with lowercase text only |
| `animate/projects/stethoscope/` | forty-second short (37 s), `letters` device as a doctor's `notebook()` where the heartbeat is written as a lub-dub `rhythm()` line; a paper sheet curls into a `tube()` that becomes a turned wooden one; the patient is always clothed and at a distance, and the "ear on the chest" custom is a plain EAR → CHEST diagram; Whisper's "Lenec" fixed to Laennec |
| `animate/projects/pacemaker/` | forty-third short (41 s), `loom` device as one glowing green `pulse()` trace (spike every N px, shadowBlur glow) woven through an oscilloscope `scope()`, a parts drawer with look-alike `resistor()`s (the wrong one glows), a faltering heart, the shrinking `device()` and the operating-room monitor; the surgery is shown with respect (draped table, surgeons, monitor) |
| `animate/projects/penicillin/` | forty-fourth short (40 s), `mosaic` device on a culture plate: `plateTiles()` lays the plate outward from the centre, then clears the tiles in a ring around the mold patch (the clear zone Fleming saw), and the same plate closes the video; US spelling "mold" in words.json for the American audience; an off-format "fly on the wall" psychology tip was set aside when the owner sent this instead |
| `animate/projects/insulin/` | forty-fifth short (42 s), `chronicle` on a ruled ledger `page()` with one silver dollar as the returning object (on the `patentDoc()` at the start, three coins at the end); extract `flask()`s turn from murky to clear as it is purified; no suffering shown — the boy is drawn only recovering, his skin colour warming; Whisper's "McLeod" fixed to Macleod |
| `animate/projects/ether-dome/` | forty-sixth short (39 s), a Karagöz shadow play for a medical first — silhouettes keep the surgery gentle; an `amphitheatre()` of curved tiers filling with puppet spectators under a skylit dome is the recurring set; an ether `inhaler()` globe; the voice came as a Cartesia WAV (a different, British narrator) and was converted to voice.mp3 first; Whisper's "Aetherdome" split into "Ether Dome" |
| `animate/projects/vaccine/` | forty-seventh short (40 s), `letters` device around Jenner's 1798 `pamphlet()`, with a spotted `cow()` as the returning character and a closing word-build VACCA → VACCINATION; the procedure is shown gently (a `lancet()`, a tiny scratch in an inset, the boy later running with a hoop); British narrator (Cartesia WAV converted to mp3) |
| `animate/projects/band-aid/` | forty-eighth short (35 s), `loom` device as one `strip()` of tape with gauze squares that can follow any path — it draws a heart (`heartPath()`) to open and close, slips off a finger, is laid square by square on the table and snipped; trademark handled with plain "ADHESIVE BANDAGES" boxes; the narrator says "Earl Dixon" but the subtitles use the historical spelling Earle Dickson |
| `animate/projects/heimlich/` | forty-ninth short (35 s), `night` look in the `arches` room with the `chronicle` device; the method is shown only as a metaphor — a squeezed `bottle()` popping its cork, labelled "THE IDEA, NOT A HOW-TO" — never as instructions; `journal()` is the June 1974 *Emergency Medicine* page, the beagles use `k.dog`, and the first reported save is a diner silhouette, kept calm and non-graphic |

Follow CLAUDE.md: never say it works until you rendered and looked at it.

## 1. Tools
```bash
bash animate/setup.sh            # prints "ready" when everything is there
```

## 2. New project + word timings
```bash
cd animate
mkdir -p projects/<slug> && cp <voice-file> projects/<slug>/voice.mp3
node transcribe.mjs projects/<slug>/voice.mp3 projects/<slug> --fix "Mark=Marc"
```
Read the printed transcript. Fix misheard names with `--fix "Heard=Right"`
(check spellings of real people/brands with a quick search). If the owner
also pasted the script, use its spelling. Note the word times — scenes
are cut on them.

## 2b. Check the script before drawing anything (5 minutes, saves hours)
Before writing `story.mjs`, use the **researcher** agent on the transcript: check
every name, date, number and "first/only/biggest" claim against 2 reputable
sources. Then tell the owner in a few lines:
- **Facts**: anything wrong or disputed, with the corrected wording and a source
  (e.g. "the first microwave went on sale in 1947, not 1946"). If a line is wrong,
  offer to wait for a re-recorded voice-over before animating.
- **Three alternative opening lines** for the next script, each a different
  shape (a question, a number, the twist first, a quote), never "X exists because…"
  twice in a row. The owner decides; never change their voice-over yourself.
- **Length**: if the voice runs over ~57.5 s, say so; the fallback is speeding it
  up up to 5% (`ffmpeg -af atempo=1.05`, then re-transcribe), and say you did.
Don't block on answers: if the facts are fine, carry on and mention it in the hand-off.

## 3. Plan the scenes (before writing code)
Write a short beat list: one scene per sentence or idea, **2–4 s each**
(fast-cut reel pacing), cut ~0.1 s before the first word of the beat. For each
scene pick: chapter title (header text), what is painted, what moves, which
spoken word triggers the key moment, the transition, the sound effects.
Be inventive inside the style — visual metaphors beat literal pictures
(the bubble-wrap short: the IBM computer sails on an Ottoman galley, the
company name is written as a tughra and stamped with a seal, the world map is
drawn like Piri Reis's 1513 chart, the last bubble grows into the closed book).
Check facts (dates, names) — the brand is "dramatic but true" (`brand/voice.md`).

**Creativity bar (every video, no exceptions):**
- At least **three visual metaphors** nobody would draw literally (a contract
  stamped OWNED, a "?" in a train window turning into a star, homes lighting up
  one window at a time). A scene that only shows a person standing and talking is
  not finished.
- One **hero moment**: the biggest, most animated beat on the story's twist,
  with a sound hit (gong/stamp/riser) and a camera move.
- **Open on tension.** The first 2 s must already move and ask a question
  (fireworks then BANNED; a star sliding away). Nothing static in the first frame.
- **No recycled compositions.** Don't repeat a layout, prop arrangement or scene
  idea from an earlier project; `check-unique.mjs` catches near-copies.
- **New props for new stories.** Add what the story needs to the kit (period
  objects, places, animals) instead of reusing the nearest old prop.
- Vary the **music**: a different maqam or root from the previous video, moods
  that follow the story's turns.

## Craft rules: no slop
What makes a code-drawn short feel machine-made, and what to do instead. Run
`node lint-story.mjs projects/<slug>` (inside `animate/`) after every sheet; it must
print OK before the full render.

1. **Don't caption the captions.** The narration is already on screen, word by word.
   A label may only add what the voice does not say: a name's spelling, a date, a
   number, a place, a street sign, a joke. "LONG SHIFTS" under a tired policeman is
   slop; a clock whose hands race round is not. (`echo-labels`: more than 3 fails.)
2. **Two stamps at most**, for the real turning points. Show the other beats with
   action: a banner that peels off and falls, a red ink line struck through a page,
   a face that changes. (`stamp-habit`)
3. **Every scene changes** between its first and last second: someone acts,
   something arrives or transforms, the light moves. (`static-scenes`)
4. **Move the camera** like an animator: push in on the key word, pull out for the
   reveal, a close-up for emotion, a slight tilt when something goes wrong.
   Aim for half the scenes. (`flat-camera`)
5. **Vary the setting**; no backdrop behind more than half the scenes. (`same-backdrop`)
6. **Hand-made motion is on** in every look except classic: drawings are held two
   frames ("on twos", 15 drawings a second) and the paper grain shifts between
   them, like cel or stop-motion animation. Don't fight it with very fast motion.
7. **Borrow from the real tradition**, not from stock-video habits. At least one per video:
   - *Matrakçı's city panoramas* (`panorama()` in `scenes.mjs`): a city from above
     like a map, every building standing up in elevation, rivers with boats, gardens
     as rows of trees, no people, and the important building painted far larger.
     Use it to establish a place instead of a generic skyline.
   - *Continuous narration*: the same character appears two or three times in one
     picture doing successive things (goes in, buys, comes out with parcels).
   - *Faces hidden in rocks* (`k.rockFace`) for the attentive viewer.
   - *Figures breaking the frame* (`scene.over`), *stacked registers* (the picture
     in horizontal bands for depth), *gold skies*, *several viewpoints in one picture*.
8. **Specific beats generic.** Philadelphia is Penn's grid with City Hall in the
   centre square, not "a city"; the downtown sign says MARKET ST. Look things up.
9. **Plant and pay off**: something from the first scene comes back in the last
   (the bubble in the storyteller's head is struck through at the end).
10. **The voice is the owner's call**, but say it plainly if a script reads like a
    template, and suggest a sharper line.

## The host: the Nakkaş (and acting)
The channel has an original host: **the Nakkaş**, a young miniature painter
(saffron turban with a red reed pen tucked in, teal kaftan with gold dots, an ink
pot on his sash), drawn in `styles/ottoman/host.mjs`. He is the narrator.
- **Sign-off** (automatic in every look except classic; `meta.host: false` turns it
  off): as the voice reaches "Every legend has a beginning", an arched window opens
  at the bottom of the painting and he says the line on screen. His mouth follows
  the loudness of the real voice-over (`voiceEnvelope`), he blinks, lifts his brows
  on stressed words and raises his reed pen on "beginning"; then the book opens.
- **Cameos** (optional): `meta.cameos: [{ at: 'word' | seconds, dur: 1.6, mood: 'wow' | 'smile' | 'calm' }]`
  pops him into the lower corner for a reaction at a twist. One or two per video, never more.
- Stories can read the voice's loudness too: `S.voice` (0..1 at this frame), e.g. to
  make a character in the scene speak a quoted line.

**Acting.** Characters perform instead of standing with an arm out. Use the gesture
library in `styles/ottoman/acting.mjs`:
`k.figure(ctx, x, y, { ...LOOK, ...act('shrug', u, tween(u, at, at + 0.3)) })`.
Gestures: `point`, `present`, `wave`, `cheer`, `shrug` (open palms), `think`,
`worry`, `angry`, `surprise`, `count`, `walk`, `rest`. Change gesture on the word
that motivates it (a character starts to `worry` on "broke", `cheer`s on "hit").

## The signature (what no other channel has)
These run automatically in every look except `classic` — they are the channel's
fingerprint, so keep them on:
- **The painter's brush (nakkaş).** Every scene first appears as an ink drawing
  on paper; a reed brush with a vermilion tip sweeps across in dry-brush strokes
  and the colour floods in behind it (`styles/ottoman/brush.mjs`, about 1 s;
  `meta.paintIn: 0` turns it off, `paint: false` on one scene skips it there).
  Karagöz uses lamp-lit screen colour instead.
- **Gold glint.** A light runs round the gilded frame at every scene change.
- **The sign-off.** When the outro starts, a gold tughra-style monogram is
  written stroke by stroke in the painting's corner and the channel's seal
  (initials from `brand/brand.json`) stamps beside it, on the **sound logo**: a
  kanun run in maqam hicaz, a ney answer and a soft gong (`signature` sound
  effect, mixed in by the engine; `meta.signature: false` turns both off).
- **Generated score in maqams** and hand-made sound effects — no stock music, so
  no Content ID claims, and the sound is as recognisable as the look.

## 3a. Pick a storytelling device (rotate them)
A device is HOW the story is told; it changes the whole structure, not only the
page. Set `meta.device`; `check-unique.mjs` warns when the last videos all use
the same one. Pick what fits the story, never the same as the previous video:

| device | how to build it |
|---|---|
| `chronicle` | a court chronicle: one painted scene per beat (the first 16 videos) |
| `meddah` | a coffeehouse storyteller (figure with a handkerchief over the shoulder and a stick) tells the tale: open on him and his listeners, cut into the story, come back to him for the twist and the ending; listeners react (gasp, laugh) |
| `karagoz` | a shadow play: use the `karagoz` look; two rival puppets argue the story out (inventor vs. doubter, brand vs. rival); jointed figures swing in profile, the curtain closes between acts |
| `voyage` | the story is a journey on a portolan chart: a ship or caravan moves along a dotted route; every beat is a stop with a vignette, place names written as the ship arrives; end with the whole chart |
| `loom` | a carpet being woven: each scene appears row by row from the bottom (unroll/wipe up), the borders gain a motif per beat; pull out at the end to show the finished carpet with every scene as a medallion |
| `marvels` | a Book of Wonders (acaib): the subject treated as a marvel — labelled diagrams, cutaways, measurements in gold, astonished onlookers pointing |
| `letters` | a letter home: open on the writer by candlelight, the story plays as what they saw, come back to them signing it (a fictional letter; never present it as a real quote) |
| `mosaic` | an İznik tile mural assembled tile by tile (`tile` look); each beat adds a panel; the last shot reveals the whole wall |

Write the device into the beat list (step 3) before any code.

## 3b. Pick the look (never the same as the last three videos)
Each video gets its own page design so the channel never looks templated:

| look | page | particles | transitions |
|---|---|---|---|
| `album` | murakka album page, gold-sprinkled paper, title under the picture, logo roundel | gold dust | unroll, ink, page, iris |
| `tile` | İznik tile panel, white caption box with cobalt rules | none | tiles, lattice, wipe |
| `night` | navy lacquer with gold vines, cream captions, moon footer | fireflies | ink, iris, lattice |
| `scroll` | hanging scroll with wooden rollers, title tag, ribbon captions | petals | unroll, page, wipe, ink |
| `ledger` | an Ottoman account book (defter): ruled paper, red and black ink rules, the title written between red rules, spoken words highlighted in red ink, columns of accounts in the footer | dust | ink, wipe, page, unroll |
| `karagoz` | Karagöz shadow-theatre booth: backlit muslin screen, red drapes, wooden sign and caption plank, oil lamps; colours glow like translucent leather puppets, lamp flicker | none | curtain, iris, cut |
| `classic` | the original lapis header page (used by the first 16 videos — avoid for now) | none | as written |

Also set `meta.room` — the design of every indoor scene (`interior()`):
`arches` (ogee arches, cypresses), `library` (book niches, calligraphy frieze),
`lattice` (wooden kafes screen with light through it), `tiles` (İznik wall with a
tulip-vase panel), `tent` (striped campaign tent with appliqué arches). Never the
same room as the video before.

Set `meta.look` in `story.mjs` (optional `meta.ambient`: `dust`, `fireflies`,
`petals`, `embers`, `snow`, `none`). Pick a look the three videos posted before it did
not use (`node check-unique.mjs --all` lists every video's look in posting order), and one that fits the story
(night stories → `night`, holidays/celebrations → `album` or `scroll`, inventions
and science → `tile`, rivalries, comedy, showbiz and characters → `karagoz`). Preview any look without editing:
`node render.mjs projects/<slug> --look night --sheet`. A look replaces the
story's transitions with its own set (except `cut` and `flash`, which are story
beats); set `transLock: true` on a scene to keep its own. Each look also adds a
slow camera push-in inside every scene and a colour grade + vignette.

## 4. Write `story.mjs`
Start from `projects/bubble-wrap/story.mjs`. It exports:
- `meta` — title, slug, `style: 'ottoman'`, 1080×1920, 30 fps, `duration`
  (voice end + ~2.5 s for the outro), `voice`, `brand` (handle + logo from
  `brand/brand.json`), `outro` (call to action shown in the caption panel).
- `scenes` — `{ start, title, trans, draw(ctx, u, S) }`. `u` = seconds into
  the scene. `S.at('word')` = when that word is spoken (sync moments to it).
  `S.cam(zoom, cx, cy)` = camera. `S.k` = the style kit, `S.P` = palette,
  `S.W/S.H` = painting size (940×1060). Transitions: `iris` (scalloped gold
  circle), `wipe`, `unroll` (scroll), `flash` (gold), `cut`, `ink` (ink blots
  spread), `lattice` (shutter slats open), `tiles` (tile mosaic), `page` (a leaf
  turns), `curtain` (booth curtains close and open). With a look other than `classic` the look picks them (see 3b).
- `sfx` — `{ t, type, gain, pitch }`; types: pop, whoosh, paper, chime, stamp,
  thud, pluck, slide, sizzle, wind, rain, waves, crickets, flop, riser, gong,
  clank, alarm, thunder, crack, coins, spray, splash, drip, silentnight (the
  public-domain carol on a ney; `pitch` transposes from C), taps1 / taps2 / taps
  (the 1862 bugle call: opening phrase, closing phrase, whole call).
- `music` — `{ bpm, root, maqam: 'hicaz'|'rast'|'nihavend', gain, sections:[{from,to,mood}] }`,
  moods: intro, groove, sad, drive, triumph, end. Match moods to the story's
  turns (failure → sad, comeback → drive, payoff → triumph).

Use helpers from the kit before drawing by hand. Figures take `skin:` (a colour), `hat:` (`turban`, `fez`, `cap`, `crown`, `hotoz` for women with `veil`/`hair`, `stovepipe`, `longhair` with `hair`/`eyePaint`, `shorthair` with `hair`, `wildhair` with `hair`, `santa`, `furcap`), `stringTie`, `collar`, `mustacheColor` and `beard:` (`none`, `short`, `long`, `chin`) —
match real people's skin tone (the kit default is light). Painting a
real place, use its own landmarks (a Kyoto pagoda, not a mosque) inside the
miniature style; don't turn a company building into a religious one. For holiday stories,
ask the publisher to schedule before the holiday, not after it.
Draw period-correct objects (the 1891 ball was brown laced leather, not a
modern black-and-white one). Animation tools are in
`lib/core.mjs`: `tween`, `ease.*`, `pop`, `shake`, `rng` (seeded — never
`Math.random`, frames render in parallel and must be repeatable).

## 5. Look, fix, repeat
```bash
node render.mjs projects/<slug> --sheet            # one frame per scene → build/sheet.png
node render.mjs projects/<slug> --stills 3.2,14,41 # full-size PNGs → build/stills/
node lint-story.mjs projects/<slug>               # craft check (see "Craft rules"); must say OK
```
Open the images (Read tool) and check: nothing important hidden behind the
header/caption panels, text fits, figures readable at phone size, every
scene different, the key moment lands on its word. Iterate until good.

## 6. Render + verify
```bash
node render.mjs projects/<slug>                    # → projects/<slug>/out/<slug>.mp4 (~1 min on 4 cores)
npm test                                           # engine + story checks + a 1 s render
```
Then verify the MP4 itself: `ffprobe` (1080×1920, h264 + aac, right length),
grab frames at transitions with `ffmpeg -ss <t> -i out.mp4 -frames:v 1`, and
measure loudness (`ffmpeg -i build/mix.wav -af ebur128 -f null -` → about −14 LUFS).
You cannot hear the audio — say so, and ask the owner to listen.

It also writes `out/<slug>.srt` (subtitles from the word timings; `node subtitles.mjs
projects/<slug>` re-makes it). Send it with the MP4: the owner uploads it on YouTube
(Subtitles → Upload file → With timing) so the captions are searchable and can be
auto-translated.

Then check that the video is its own piece:
```bash
node check-unique.mjs projects/<slug>              # must print UNIQUE ENOUGH ✔ (exit 0)
node check-unique.mjs projects/<slug> --look tile  # try another look if it fails
node check-unique.mjs --all                        # the whole channel, in posting order
```
"Latest videos" means the ones posted just before this one, read from
`content/schedule.md` (a project not scheduled yet counts as the newest).
It FAILS when the page design matches one of the last three videos or more than
a quarter of the scenes are near-copies of other videos' scenes. Fix every FAIL
before sending; fix warnings when you can (music key, transition order, the
script's opening formula — tell the owner if the hooks all start the same way).

## 7. Hand-off: post copy + schedule
1. Send the MP4 to the owner (SendUserFile).
2. Use the **publisher** agent (`.claude/agents/publisher.md`) to write
   `content/posts/<YYYY-MM-DD>-<slug>.md` (same format as the other files
   there: hook, summary, fact-check notes, and title/description/hashtags for
   YouTube Shorts, TikTok, Instagram Reels, Facebook Reels, always with the
   brand hashtags) and to add one row per platform to `content/schedule.md`.
   Give it the exact voice-over text, the dates/facts shown on screen, and
   tell it: **US audience**, times in US Eastern Time with the owner's
   Philippine time next to them (PHT = ET + 13 h Nov–Mar, + 12 h in US
   daylight saving), status `ready`, and no clashes with existing rows.
3. Check its file and rows yourself (dates, weekday, PHT day roll-over,
   no claims the video does not make).
4. Commit `story.mjs`, `words.json`, `voice.mp3`, the post file and the
   schedule. Do not commit the MP4 or `build/` (gitignored, too large).

**Never post anything without the owner's explicit yes**, and never mark a
row `posted` unless the owner says they posted it.

## Learn from the channel's own numbers
When the owner shares YouTube Studio data (a screenshot or numbers of the
audience-retention graph, average view duration, swipe-away rate), map each drop to
the scene and word at that second (`story.mjs` scene starts + `words.json`), and
write what you learned to `content/analytics.md`: date, video, what held viewers,
where they left, and one rule to try next time. Read that file before planning a
new video and apply its rules; they beat the general rules above.

## Series and playlists
Every video belongs to one series, listed in `content/playlists.md`; the publisher
puts the series name in the YouTube description and the owner adds the video to
that playlist. Holiday stories go in "Holiday Origins", brands in "Brand Origins",
inventions in "Accidental Inventions", objects in "Everyday Objects", words and symbols in "Words & Symbols",
places and landmarks in "Landmarks". Add the new video's row there.

## YouTube monetization (what this skill does about it)
Facts to tell the owner honestly (checked Nov 2026; re-check YouTube's help pages):
- **YPP entry**: 1,000 subscribers **and** 4,000 public watch hours on long-form
  videos in 12 months, **or** 10 million public Shorts views in 90 days. From
  **Feb 1, 2027** new applicants need 8,000 hours or 20 million Shorts views.
  Shorts views never count toward watch hours.
- **Inauthentic content** (formerly "repetitious"): mass-produced or template
  videos that differ only on the surface (the same narrated-slideshow format with
  new words) are not monetized, however they were made. AI tools are allowed;
  near-identical uploads are not. This is the biggest risk for this channel: the
  first 16 shorts share one page design, one voice and one script formula.
- Meeting the numbers starts a human review; nobody can promise approval.

What to do every time:
1. A different **look** from the last three videos (3b), a rotated **device**
   (3a), the signature on, and `check-unique.mjs` passing.
2. The **creativity bar** (section 3): new metaphors, a hero moment, new props.
3. **Original audio**: the score and sound effects are generated here (no
   Content ID claims). The voice is the owner's — remind them that ElevenLabs
   voices need a paid plan for commercial use (the free plan is non-commercial
   and needs attribution); check their plan.
4. **Vary the scripts**: if `check-unique` warns that hooks share a formula
   ("X exists because…"), tell the owner; suggest other openings (a question, a
   number, a twist first, a quote).
5. **Long-form for watch hours**: every 8–10 shorts, offer a themed
   compilation (below), ideally with a newly recorded intro so it adds new value.
6. The publisher adds 1–2 real sources to the YouTube description and never
   writes a title the video does not deliver.

## Long-form compilations (16:9, for watch hours)
```bash
cd animate
node compile.mjs --title "Origins of the Holidays" projects/thanksgiving projects/santa projects/times-square-ball \
  [--subtitle "…"] [--intro-voice projects/_intros/holidays.mp3]
```
Output in `animate/compilations/<slug>/` (gitignored): `<slug>.mp4` at 1920×1080,
`chapters.txt` (paste into the YouTube description; first chapter 0:00, ≥3
chapters of ≥10 s) and the painted cards. Each short plays inside a marbled album
spread with its chapter number and title on the left and the channel on the
right; chapter cards get a generated maqam sting. Missing MP4s are rendered
first. Aim for **8+ minutes** (8–10 shorts) so mid-roll ads are possible. A
compilation of the owner's own shorts is allowed, but a new spoken intro
(`--intro-voice`) and a themed order make it a new piece rather than a re-upload.
Send it to the owner with the chapter list; the publisher writes its post file
like any other video (one YouTube row, a weekend morning or evening slot).

## Adding another style
Make `animate/styles/<style>/index.mjs` exporting `createRenderer(project)`
→ `(ctx, t) => void` (see `styles/ottoman/index.mjs`), with its own kit, and
set `meta.style` in the story. Keep the same `S` helpers so storyboards stay
portable.
