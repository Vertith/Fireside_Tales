# Upstairs

A Fireside Tale. Early 2000s; Owen, seven, falls asleep while Mom reads him *The Hollow Hill*. He wakes at 3:07 AM to her shawl in the empty rocking chair and something downstairs using her voice. Find the real family in the basement without ever going to one of the things that imitates them.

- **Story bible:** `/story/upstairs/story-bible.md` (beats, the Fae rules, tells, puzzles, endings, open questions)
- **Art notes:** `style.md`
- **Play:** open `index.html`, or run `python3 tools/bundle.py` and open `dist/upstairs.html` (single file). `dist/artifact.html` is the same build for the claude.ai artifact host.

## How it plays

Each room is a scene (`js/content/scenes.js`). The *What now* list is how you move around the house. When one of them is in the room it's a meeting (`js/content/people.js`): you can do things *quietly* (whisper, listen, look), click on them to look closer, and then choose. **Going to them** (or letting them in, or touching the glass) kills you and the night starts over at 3:07; the notebook keeps what you learned.

| Ending | How |
|---|---|
| Taken (a reset, not an end card) | Go to any of them |
| Wrong | Reach the basement and don't convince Dad |
| Morning | Reach the basement and give two good proofs |
| The house was empty | Call 911, wait out the fake deputy, unlock the door for the real one |
| The Hollow Hill | Get the attic pole (hide in the closet from Mom), go up, step into the circle |

Puzzles (`js/puzzles.js`): the cut phone cord, dialling 911, the torn family photo. The basement key is a find, not a puzzle: carry the bathroom stepstool down and feel along the top of the basement door frame, where Dad said it was.

## Changed from the template

- `engine.js`: people can appear in place (`from: 'here'`); `ask` menus can have their own title.
- `ui.js`: configurable pad title and night/loop word; props can come and go (`when`); end card counts endings found; empty speech bubble is hidden.
- `art.js`: all new (rooms, people, close-ups, darkness masks, the family photo).
- `puzzles.js`: new. Story steps `room`, `vanish`, `count`, `mark`, `puzzle`, `proof`.
- `audio.js`: knock, static, click, keypad beep, creak; the act card plays a music box.
