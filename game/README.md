# Emit Time — game

A click-based story game. Plain HTML, CSS and JavaScript with no build step.

## Play it

- Open `index.html` in a browser (works straight from disk), or
- open `dist/emit-time.html`, a single file with everything inlined.

After changing anything, run `python3 tools/bundle.py` to refresh `dist/`.
`dist/artifact.html` is the same build in the shape the claude.ai artifact host wants.

## The night

The prologue (first flash, the man who calls himself Kane, the second flash, the man in plates and
the briefing) leads into four acts and 30 visitors, 10:52 PM to 6 AM, in the order in
`js/content/night.js`. Kane comes down three times: with the shutdown device (end of act two),
"hold them off a bit longer" (end of act three) and Emit's pitch (end of act
four): help him burn the lab so time travel is never invented, or help him take it from the real Kane. Every wrong call sends you back to the first flash. Lines you heard on an earlier loop get an
"I've heard this before — Skip" button, and the notebook keeps what you learned.

Turned-away legit guests come back three visitors later; turning them away again resets. The 1920s
gentleman comes back as a 1950s salesman.

Endings (`js/content/story.js`):
- **True ending:** shoot him at the first flash once you hold the wanted poster (act four), the
  warden's file (last visitor) and have seen his watch reading 12.03.40. Epilogue: the warden takes
  the Tether, counts your tally, and the real Dr. Kane comes down for the first time.
- **Clean slate:** at dawn, tell him "Burn it". The lab burns, time travel is never invented, and
  Emit is stranded in your year but no longer hunted.
- **The right hands:** at dawn, tell him "Keep it in the right hands". He goes up to the real Kane,
  comes down alone with the name and the machine, and you guard his desk from then on.
- The warden explains (act four and the true ending) that Emit wants the first machine for himself,
  and has been "dealing with" visitors on the stairs who'd trouble him later.
- Shooting him anywhere else, or refusing him at dawn, just resets with a hint.

Debug: `EMIT.game.start('at:doe')` starts the night at any visitor or interlude.

## Files

| File | What it holds |
|---|---|
| `js/engine.js` | The loop, the step interpreter, the desk (questions + actions), memory across loops |
| `js/ui.js` | Everything on screen. The engine only talks to the screen through this |
| `js/art.js` | Pixel renderer: lobby, desk, visitors, close-ups, the flash |
| `js/audio.js` | Synthesised placeholder sounds |
| `js/radio.js` | The desk radio (from the radio thread). Click the radio on the desk to switch on, change station, and switch off after the last |
| `js/content/characters.js` | Speaker names and portrait keys |
| `js/content/opening.js` | The scenes: `opening`, `secondFlash`, `briefing` |
| `js/content/visitors.js` | Visitors at the desk, plus tonight's visitor list |
| `js/content/demo-visitors.js` | The 1920s gentleman, pizza driver, android and Channel 7 reporter |
| `js/content/act1.js` … `act4.js` | The rest of the roster, by act (`act3a`, `act3b` split act three) |
| `js/content/story.js` | Kane's interludes, the true ending, the epilogue and the end cards |
| `js/content/night.js` | The order of the night: acts, visitors, clock times, interludes |
| `docs/visitor-brief.md` | How to write a visitor (shared facts, flags, art and testing rules) |

## Writing scenes

A scene is a list of steps that run in order:

| Step | Does |
|---|---|
| `{ narrate: '...' }` | Guard's narration |
| `{ who: 'scientist', say: '...' }` | A spoken line |
| `{ ..., noSkip: true }` | A line that never offers Skip (use for lines that change between loops) |
| `{ flash: 'big' }` | The time-travel flash |
| `{ lightning: 2 }` | Small lightning flickers through the glass doors |
| `{ sfx: 'gunshot' }` | Sound cue: `flash`, `gunshot`, `door`, `distant`, `shutdown`, `scratch` |
| `{ pause: 600 }` | Wait (ms) |
| `{ clock: '10:31 PM' }` | Set the clock on the HUD |
| `{ radio: 'on' \| 'off' }` | Switches the desk radio (used after the cleanup so players find the stations) |
| `{ enter: 'assassin' }` / `{ exit: 'walk' \| 'fall' }` | Someone steps up to / leaves the desk. Arrivals come from the front doors (left); add `from: 'right'` for someone coming down from inside the building. A walk-off after Let through goes right (into the building), after Turn away goes left (out the doors); `exit: 'left' \| 'right'` forces a side |
| `{ backdrop: 'body' \| 'clean' }` | Blood on the booth glass, or cleaned up |
| `{ desk: 'visitorId' }` | Questioning and decision for a visitor (see below) |
| `{ ask: { prompt, options: [{ text, steps, requires?, exit? }] } }` | A menu of questions; `exit: true` leaves it |
| `{ note: ['who', 'text'] }` | Write in the guard's notebook (kept across loops) |
| `{ learn: 'flag' }` | Knowledge kept across loops |
| `{ set: 'flag' }` | Something true for this loop only (e.g. `hasList`, `hasDevice`) |
| `{ if: 'flag', then: [...], else: [...] }` | Branch. `'flag'` = learned on an earlier loop (memory), `'now:flag'` = learned any time, `'run:flag'` = set this loop, `'!flag'` = not, `'loop>=3'` = third loop or later, `'saw:spot'` = inspected. An array means all of them |
| `{ act: 'Act Two', title: 'Company' }` | Act title card |
| `{ show: { zoom, title, text } }` | Put a close-up on the desk (the wanted poster) |
| `{ returns: true }` | Between visitors: bring back anyone due after being turned away |
| `{ comeBack: 'visitorId' }` | Queue a visitor to arrive a few slots later |
| Text `{loops}` | Replaced with the number of resets so far |
| `{ goto: 'scene' }` / `{ reset: 'why' }` / `{ end: 'id' }` | Move on, start the loop over, or finish |

## Adding a visitor

```js
EMIT.content.characters.courier = { name: 'Courier', portrait: 'courier' };
EMIT.content.visitors.courier = {
  id: 'courier',
  truth: 'intruder',            // 'legit' | 'intruder' | 'android'
  prompt: 'He keeps glancing at his phone.',
  greeting: [ { who: 'courier', say: 'Package for Dr. Kane. Did you get my text?' } ],
  questions: [
    { id: 'text', ask: 'Your what?', steps: [ ... ] },
    { id: 'name', ask: 'Who sent it?', requires: 'metSister', steps: [ ... ] }  // only after a past loop taught you this
  ],
  actions: { }                  // leave empty to use the default action rules
};
```

Then add `{ desk: 'courier' }` to a scene. Any action you don't script falls back
to the bible's action-rules table (`defaultOutcome` in `engine.js`): letting an
intruder through resets the loop, shooting a legit visitor resets, the shutdown
device only works on androids, and so on. Set an action to `false` to hide it.

## Art

The look is the Art style thread's first style, "Noir Pixel Desk" (`/mnt/project-files/art/mockups/v1/`),
which Adam chose over the later Papers, Please layout: pixel art on one 480x270 canvas scaled by whole
numbers, with the lobby and visitor above the counter (top at y=166) and the guard's desk below.
A cut-out in the middle of the desk (`EMIT.art.CUT`, x 182–314, y 166–246) shows the visitor from the
waist down, so hands, belts and carried things can be inspected. The question pad sits on the left
under the lamp; the visitor list, radio and notebook are on the right.
Text and buttons are HTML laid over the canvas at native coordinates when the screen fits a 2x scale;
on narrow screens they stack under the picture. The Papers, Please version is kept in `attic/`.

- `js/art.js` draws everything procedurally. Visitors are draw functions in `EMIT.art.visitors`,
  authored around x≈249 with the head at y≈60 and drawn down to y≈252. The shared helpers `legs`,
  `torso`, `armL` and `armR` draw the lower half seen through the cut-out.
- Swap a visitor for a PNG sprite with `EMIT.art.visitors.scientist = EMIT.art.sprite('art/scientist.png', x, y)`.
- Close-ups are 32x24 draw functions in `EMIT.art.zooms`.

## Questions at the desk

Adam's rule: every visitor gets the same three openers, "What's your name?", "What can I do for you?"
and "How did you get here?". A visitor answers them in `opening: { name, want, how }`. Anything else in
`questions` needs a `requires`, so it only appears once it's earned:

- `'saw:watch'`: after inspecting that visitor's `watch` spot (tagged "noticed"). Spots are remembered,
  so on a later loop it shows up straight away, tagged "from memory".
- `'saw:desk.list'`: after reading the visitor list.
- `'heardBriefing'` or any other flag: learned in an earlier loop ("from memory").

The question list redraws as soon as something new is inspected.

## Inspecting visitors

Give a visitor an `inspect` list of 3 to 5 spots. Each spot is clickable in the lobby or the desk
cut-out, opens a close-up, and writes its `note` (or `text`) into the notebook. The pad title counts
how many you've looked at ("Ask · looked at 2 of 5"). Keep the real tell at the same size and weight
as the ordinary details around it:

```js
inspect: [
  { title: 'Wrist', zoom: 'watch', x: 284, y: 194, w: 20, h: 10,   // visitor-frame coords
    text: 'What the guard says in the close-up', note: 'What goes in the notebook', learn: 'sawWatch' }
]
```

Visitor steps can also set the CRT: `{ crt: ['CAM 01 LOBBY', '> MOTION: 1', '> REC'] }`.
