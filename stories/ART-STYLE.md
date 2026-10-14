# Fireside Tales: shared art style

The house look every tale shares, taken from Emit Time's "Noir Pixel Desk" (`/art/style-guide.md`).
These are rules to follow, not code to share: each story draws its own art in its own folder, so
redrawing one story never changes another. Each story writes its own notes on top of this (a
`style.md` in its folder) for anything that's only true there.

## What every tale keeps

1. **One 480×270 canvas**, scaled by whole numbers with nearest-neighbour (`image-rendering: pixelated`,
   `imageSmoothingEnabled = false`). Sprites snap to whole pixels. No rotation, no smooth gradients.
2. **Two layers split at y≈166.** The place and the person you're facing above the line; your side
   (a desk, a table, a bed, the dashboard) below it, where the question pad, the action buttons and
   clickable props sit. The template's HTML is placed for this split.
3. **Night palette plus one warm light.** Every tale is set at night and lit by one warm source
   (Emit Time's desk lamp, a candle, a torch, a fire). The lit side of every face and object gets the
   light tone, the far side the dark tone plus a dither.
4. **About three shades per material**, built from the shared ramps below.
5. **Dither, don't blend.** Light falloff, shadow and stains use a 2×2 ordered dither between two
   palette colours (`D()` in `art.js`). No alpha in the art itself.
6. **People built from parts** (head, outfit, hands, props) so a cast of 20–30 stays affordable.
   Readable in silhouette first. Faces a little *too* expressive; uncanny, not grotesque.
7. **Close-ups are 32×24** native art shown in the zoom panel, with one line in the narrator's voice.
   Real tells sit among ordinary details of the same size and weight, so looking alone never decides.
8. **Type:** VT323 for dialogue, narration and documents; Silkscreen for names, labels and buttons;
   hand-drawn 3×5 pixel digits for numbers inside the art.
9. **UI is objects, not frames:** a paper speech bubble with a hard 2px shadow, a ruled notepad,
   stamp-like buttons, a notebook. Hover and focus show a dashed lamp-amber outline.
10. **The flash** (three tones, then a stepped fade; run backwards for a loop reset) is the shared
    "time just moved / start again" beat. A tale may restyle it but keeps it to three tones and steps.

## Shared ramps

Keep these in every tale so they sit together around the campfire:

| Ramp | Colours | Use |
|---|---|---|
| Night | `#0b0d14` `#161a2a` `#232a40` `#39425e` `#5b6684` `#8d97b0` | Walls, shadow, outlines, outside |
| Wood & lamp | `#2a180d` `#3a2414` `#5e3a1f` `#8a5a2e` `#c88a45` `#f2c27a` | Furniture and the warm light |
| Paper | `#d9cfb4` `#a89c80` `#6e6552` | Documents, bubbles, cloth |
| Skin A / B | `#5a3428` `#9a634c` `#d29a78` / `#3a2219` `#6b4232` `#9c6a50` | People; add more ramps as casts grow |
| Cloth brown | `#2e1f17` `#4f3527` `#7a5640` | Coats, bags |
| Suit grey | `#262b38` `#3c4354` `#596277` | Suits, uniforms |
| Danger red | `#5c1a22` `#a8323a` | Consequences only: blood, the fatal button, a stamp |
| Flash | `#eef4ff` | The flash only |

## One accent per tale

Each tale adds **one accent ramp of about three colours that means "this shouldn't be here"**, and
keeps it rare. Emit Time's is future cyan (`#1c6f86` `#3fe0ff` `#b8f6ff`), which never appears on
anything from 1993. Pick each new tale's accent so no two tales share one; suggestions to start from:

| Tale | Suggested accent | Idea |
|---|---|---|
| Emit Time | Future cyan (in use) | Things from the future |
| The Asylum | Sick green `#1e3a2a` `#3f7a52` `#9fd8a8` | What the patients see that staff don't |
| Upstairs | Candle violet `#2e1e3a` `#6a4a8a` `#c8a8e8` | Whatever moves upstairs |
| It Walks | Bone white-yellow `#4a4430` `#a89a5c` `#e8dca0` | Its tracks, its eyes |
| The Lab | Chemical orange `#4a2008` `#c8641e` `#ffb070` | The experiment leaking out |

These are only starting points; each story's own `style.md` records what it settles on.

## Changing the house style

A change here applies to stories started after it. Stories already started keep their own copy;
bring a change into one of them by hand, in that story's folder, when you want it there.
