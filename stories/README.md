# Fireside Tales: stories

Every tale around the campfire lives in its own folder here, with **its own copy** of the engine,
screen and art kit. Nothing is shared live between stories, so a change made for one story can't
break or reshape another.

| Path | What it is |
|---|---|
| `_template/` | The starter: Emit Time's engine and look with Emit Time's story taken out, and a one-scene placeholder (a stranger knocks at a cabin door) to show every feature working |
| `ART-STYLE.md` | The house look all tales share: canvas, palette, lighting, type, UI |
| `new_story.py` | Copies the template into a new story folder with its own id, title and save key |
| `<story>/` | One folder per tale once it's started (none yet) |

Emit Time itself stays where it is (`/game`); it is the original the template was taken from and is
not changed by anything here.

## Starting a tale

```
python3 stories/new_story.py asylum "The Asylum"
python3 stories/new_story.py upstairs "Upstairs"
python3 stories/new_story.py walks "It Walks"
python3 stories/new_story.py lab "The Lab"
```

Then open `stories/<id>/index.html`. Replace the placeholder scene, person and room with the
story's own, and write the story's art notes in `stories/<id>/style.md`.

## The rules that keep stories independent

1. **A story only ever edits its own folder.** Never load another story's files, and never point a
   story at `_template/` at runtime.
2. **Improving the template doesn't update stories.** If a fix in one story would help the others,
   make it in `_template/` too, then copy it into each other story by hand when that story wants it.
   Each story's `FORKED.md` says which template version it started from.
3. **Saves are separate.** Each story saves under its own `fireside.<id>.save.v1` key, so wiping or
   changing one story's save never touches another's (Emit Time's own save is `emit-time.save.v1`).
   The sound on/off setting is the one thing they share, on purpose.
4. **Shared look, own accent.** Follow `ART-STYLE.md`; each tale picks its own accent colour.

## Trophies on the campfire log

When a player reaches an ending, the tale records it in one localStorage key that every tale shares and the campfire reads:

```js
// localStorage['fireside-tales.trophies'] = { "<tale id>": { "<ending id>": <time first reached> } }
var all = JSON.parse(localStorage.getItem('fireside-tales.trophies') || '{}');
(all.intruders = all.intruders || {})['escaped'] = all.intruders['escaped'] || Date.now();
localStorage.setItem('fireside-tales.trophies', JSON.stringify(all));
```

Use the tale's id from `TALES` in the root `index.html` (`emit`, `asylum`, `intruders`, `walks`, `lab`). Never clear this key from inside a tale, even on a "wipe save". To show a tale's endings on its trophy, list them in `TROPHIES` in the root `index.html` as `[ending id, title]` pairs, in place of the `soon: 3` placeholder. Emit Time's version is `reportTrophies` in `game/js/engine.js`.
