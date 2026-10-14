# Fireside Tales story template

Template version: 2026-10-14

A click-based story game in plain HTML, CSS and JavaScript with no build step, forked from Emit
Time's engine with Emit Time's story, desk drawer, radio, CRT and visitor list taken out. Don't
build a story here: run `python3 stories/new_story.py <id> "<Title>"` and work in the copy.

## Play it

- Open `index.html` in a browser (works straight from disk), or
- run `python3 tools/bundle.py` and open `dist/<id>.html`, a single file with everything inlined.
  `dist/artifact.html` is the same build in the shape the claude.ai artifact host wants.

The placeholder: a stranger knocks at a cabin door. Look at their boots, ask about them, and
decide. Letting them in resets the loop; on loop 2 you have the lantern, which unlocks a third button.

## Files

| File | What it holds |
|---|---|
| `js/content/config.js` | This story's id, title, save key, the opener questions, the meeting buttons and their fallback outcomes, reset text, act names |
| `js/content/characters.js` | Speaker names and portrait keys |
| `js/content/people.js` | People you meet: greeting, answers, questions, inspection spots |
| `js/content/scenes.js` | Scenes (lists of steps) and the end cards |
| `js/engine.js` | The loop, the step interpreter, meetings, memory across loops |
| `js/ui.js` | Everything on screen. The engine only talks to the screen through this |
| `js/art.js` | Pixel renderer: room, foreground, people, close-ups, the flash |
| `js/audio.js` | Synthesised placeholder sounds |
| `css/tale.css` | Layout and look; HTML text is placed for the art's y=166 split |

Everything lives under `window.TALE` (Emit Time uses `window.EMIT`), and saves go under
`config.saveKey`, so two stories never read each other's state.

## Steps

| Step | Does |
|---|---|
| `{ narrate: '...' }` | Narration (top left) |
| `{ who: 'id', say: '...' }` | A spoken line (speech bubble) |
| `{ ..., noSkip: true }` | A line that never offers Skip (for lines that change between loops) |
| `{ flash: 'big' }` | The flash (pair with `{ sfx: 'flash' }`) |
| `{ sfx: 'door' }` | Sound cue: `flash`, `gunshot`, `door`, `distant`, `scratch` |
| `{ pause: 600 }` | Wait (ms) |
| `{ clock: '11:40 PM' }` | Set the clock in the top bar |
| `{ backdrop: 'name' }` | Set `art.state.backdrop` for `room()` to draw (e.g. a stain); `null` clears |
| `{ enter: 'id', from: 'right' }` / `{ exit: 'walk' \| 'fall' \| 'left' \| 'right' }` | Someone steps up / leaves |
| `{ meet: 'id' }` | Questions, inspecting and a decision with that person (below) |
| `{ ask: { prompt, options: [{ text, steps, requires?, exit? }] } }` | A menu of choices; `exit: true` leaves it |
| `{ note: ['who', 'text'] }` | Write in the notebook (kept across loops) |
| `{ learn: 'flag' }` | Knowledge kept across loops |
| `{ set: 'flag' }` / `{ unset: 'flag' }` | True for this loop only |
| `{ if: cond, then: [...], else: [...] }` | Branch. `'flag'` = learned on an earlier loop, `'now:flag'` = learned any time, `'run:flag'` = set this loop, `'saw:spot'` = inspected, `'loop>=3'`, `'!x'` = not; an array means all |
| `{ act: 'Part Two', title: '...' }` / `{ actNo: 2 }` | Act title card / which act new notes file under |
| `{ show: { zoom, title, text } }` | Put a close-up in the zoom panel |
| `{ comeBack: 'id', mode: 'return', after: 3 }` / `{ returns: true }` | Queue someone for later / bring in anyone due (between meetings) |
| `{ goto: 'scene' }` / `{ run: 'scene' }` / `{ reset: 'why' }` / `{ end: 'id' }` | Move on, run a scene inline, start the loop over, or finish |
| Text `{loops}` / `{loop}` | Replaced with resets so far / this loop's number |

A story can add its own steps without touching the engine:
`TALE.steps.shake = async function (game, step) { ... }` makes `{ shake: 3 }` work.

## Meetings

```js
TALE.content.people.nurse = {
  id: 'nurse',
  truth: 'friend',                       // picks the row in config.outcomes
  prompt: 'She keeps one hand in her pocket.',
  greeting: [ { who: 'nurse', say: 'Rounds. Let me through.' } ],
  opening: { name: [ ... ], want: [ ... ] },   // answers to config.openers
  questions: [ { id: 'pocket', ask: 'What\'s in your pocket?', requires: 'saw:pocket', steps: [ ... ] } ],
  inspect: [ { id: 'pocket', title: 'Pocket', zoom: 'pocket', x: 250, y: 130, w: 18, h: 14,
               text: 'What the narrator says', note: 'What goes in the notebook', learn: 'flag?' } ],
  actions: { refuse: { steps: [ ... ] }, lantern: false }   // override, or false to hide
};
```

The buttons come from `config.actions` (`id`, `stamp`, `label`, `heading: 'in' | 'out'`, `cls`,
`requires` + `lockedStamp` + `lockedHint`). Any action a person doesn't script falls back to
`config.outcomes[truth][action]`. An outcome with `stay: true` keeps the meeting going and uses up
that button. Questions with `requires` stay hidden until earned; `saw:spot` questions show as
"noticed", memory ones as "from memory".

## Art

See `/stories/ART-STYLE.md` for the house rules. In `js/art.js`, replace `room()` (above y=166),
`foreground()` (below it), the `people` draw functions (authored around x≈240, head at y≈60) and
the 32×24 `zooms`. Clickable props are listed in `TALE.art.props`; `open: 'notebook'` opens the
notebook, any other prop calls `TALE.props[id](game, ui)` if the story defines it and counts as
`saw:prop.<id>`. Put the story's accent colours in `P.acc0..2` and `--acc` in the CSS.
