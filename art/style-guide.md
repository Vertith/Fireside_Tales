# Emit Time — Art Style Guide

**Status:** v3 (13 Oct 2026). Adam chose the first direction, **Noir Pixel Desk**, over the Papers, Please redo because it fits the theme better. His other decisions carry over: pixel art, and very subtle scientist tells that a second-time player can catch.
**Mockup:** [mockups/desk-scene.html](mockups/desk-scene.html) (interactive), stills in [mockups/](mockups/): `scientist.png`, `scientist-watch-zoom.png`, `assassin.png`, `gent.png`, `android.png`, `android-badge-zoom.png`, `flash.png`. The rejected Papers, Please version is kept in `mockups/v2/` for reference only.
**Palette file for the engine:** [palette.json](palette.json)

---

## 1. The direction in one line — DECIDED

**"Noir Pixel Desk":** chunky mid-resolution pixel art with Papers, Please's discipline (low-res canvas, few shades per object, parts-built portraits), lit like a film noir by one desk lamp, with slightly-too-much-face portraits borrowed from No, I'm Not a Human, and a counter you lean over to inspect things, as in Probably Stolen. One continuous lobby view, not a split screen: the guard sits at a desk facing the glass doors and whoever walks up to the counter.

## 2. What we're taking from each reference

| Game | What it does visually | What Emit Time takes |
|---|---|---|
| **Papers, Please** (Lucas Pope) | Mid-res pixel art rendered small and scaled up with nearest-neighbour. Pope avoided one global palette and limited each object to roughly three shades. Portraits built from swappable parts (head and shoulders, eyes, mouth/nose). Stiff, rotoscope-like animation. Documents you drag around a desk. | Native low-res canvas scaled by whole numbers; three shades per material; parts-based portraits; documents on the desk. |
| **No, I'm Not a Human** (Trioskaz) | An eerie, stylised look. You judge strangers at the door by physical tells (teeth, fingernails, eyes) and inspect them up close; a shotgun decides. | Faces that are a little *too* expressive (wide eyes, visible teeth, stubble). An inspection close-up for tells. Dread from stillness, not jump scares. |
| **Probably Stolen** (tinyBuild, in playtest) | A gritty cyberpunk pixel-art shop simulator: judge the item and the seller across a counter, then approve, refuse, report or look away. | The counter as the stage: visitors' items sit on the desk as inspectable objects. |

Sources: Pope's [Papers, Please devlog](https://dukope.com/devlogs/papers-please/tig-00), [Game Developer on Pope's style](https://gamedeveloper.com/design/lucas-pope-and-the-rise-of-the-1-bit-dither-punk-aesthetic), [No, I'm Not a Human on Wikipedia](https://en.wikipedia.org/wiki/No,_I%27m_Not_a_Human), [Military.com review](https://secure.military.com/off-duty/games/steams-latest-horror-hit-isnt-everyone-its-perfect-me.html), [Probably Stolen announcement](https://www.gamedeveloper.com/press-release/tinybuild-announces-probably-stolen-a-cyberpunk-pixel-art-shop-simulator-where-the-goods-aren-t-purely-legal). Written sources describe the last two games only loosely, so check their Steam pages before relying on those rows.

## 3. Canvas and scaling

- **Native resolution: 480 × 270** (16:9). Scales cleanly ×2 (960×540), ×3 (1440×810), ×4 (1920×1080).
- Integer scaling only, nearest-neighbour: `image-rendering: pixelated` on the canvas and `ctx.imageSmoothingEnabled = false`. Letterbox odd window sizes.
- **Text is the exception.** Dialogue, documents and the CRT are HTML text laid over the scaled canvas so they stay readable. Use pixel-styled fonts so it still feels of a piece. Tiny readouts inside the art (a watch, a badge number) use a hand-drawn 3×5 pixel digit font.
- Sprites snap to whole native pixels. No rotation.

## 4. Screen layout

```
+-----------------------------------------------------------+
| narration line                        [dialogue bubble]   |
|  [glass doors:      [ VISITOR  ]                          |
|   rain, city,        head and                [CRT monitor |
|   flashes]           shoulders               cams / log] |
|================== counter (y≈166) ========================|
|  lamp + light pool   clipboard   document   phone         |
|                                   [LET][TURN][SHOOT][DEV] |
+-----------------------------------------------------------+
```

- **Top 62% (y 0–166): the lobby.** Glass doors on the left (rain, city lights, the flashes), the visitor centre stage behind the counter, the Science Corp logo and wall clock, venetian-blind shadows across the right wall.
- **Desk cut-out (x 182–314, y 166–246) — DECIDED by Adam, live in the game.** A notch in the counter and desk shows visitors from the waist down: hands, belts, carried items. The notch has a lit left edge, a shadowed right edge and a lip at y 246; through it you see the lower lobby wall, a skirting line at y≈190 and dark floor tiles. The game (`/mnt/project-files/game/js/art.js`, `EMIT.art.CUT`) is the reference for this; the mockup here predates it.
- **Bottom 38% (y 166–270): the desk.** The player's workspace. Documents the visitor hands over land here and can be dragged. Fixed props: desk lamp, clipboard visitor list, beige phone, CRT.
- **Actions** are physical-looking buttons on the desk's lower right. *Shoot* is the only red one. *Device* sits greyed out until the scientist hands it over.
- The **CRT** carries security-camera readouts, and is a natural home for the Guard's Notebook and the loop counter later.

## 5. Palette

39 colours, grouped in ramps of three or so, per Pope's per-object rule. Full hex list with names in [palette.json](palette.json).

| Group | Use | Colours |
|---|---|---|
| **Night** (6) | Walls, shadows, outlines, the outside | `#0b0d14` `#161a2a` `#232a40` `#39425e` `#5b6684` `#8d97b0` |
| **Lamp & wood** (6) | Desk, counter, the warm light pool | `#2a180d` `#3a2414` `#5e3a1f` `#8a5a2e` `#c88a45` `#f2c27a` |
| **Paper** (3) | Documents, lab coat, bubbles | `#d9cfb4` `#a89c80` `#6e6552` |
| **90s plastic** (3) | Phone, CRT case, pagers, cheap watches | `#5f5848` `#8a7f68` `#b3a68a` |
| **Skin** (2 ramps × 3) | Visitors; add more ramps as the cast grows | `#5a3428` `#9a634c` `#d29a78` / `#3a2219` `#6b4232` `#9c6a50` |
| **Cloth brown** (3) | Old-fashioned suits, coats, bags | `#2e1f17` `#4f3527` `#7a5640` |
| **Suit grey** (3) | Office suits, uniforms | `#262b38` `#3c4354` `#596277` |
| **CRT phosphor** (3) | Monitor text and glow | `#0f2a1c` `#2f8f5a` `#7dffb0` |
| **Danger red** (2) | Shoot, blood, ties, the stamp on documents. Rare. | `#5c1a22` `#a8323a` |
| **Future cyan** (3) | Only on things from the future | `#1c6f86` `#3fe0ff` `#b8f6ff` |
| **Flash** (1) | The time-travel flash only | `#eef4ff` |

### Colour rules

1. **The 90s are warm and dim.** Everything that belongs in the present sits in night blues, lamp ambers, paper and beige plastic.
2. **Future cyan never appears on anything from the 1990s.** It is the one colour that "shouldn't be here".
3. **Colour is not the difficulty dial — DECIDED.** Difficulty comes from how small a visual tell is and from the lies visitors tell in dialogue (see [../story/visitor-tells.md](../story/visitor-tells.md)). Cyan only marks obviously futuristic gear (the tutorial assassin's armour) or a tiny detail that happens to be future tech, like the android inspector's badge seal that flickers in the zoom. Past-era intruders and the scientist never show it.
4. **Red is for consequences**: the Shoot button, blood, a stamp. Don't spend it on decoration.
5. Light comes from the **lamp on the left**: the left side of every face and object gets the light tone, the right side gets the dark tone plus a dither.

## 6. Lighting and texture

- **Dithering, not gradients.** Light falloff, shadows on faces, scorch marks and the lamp's pool use a 2×2 ordered dither between two palette colours. No alpha blending in the art itself.
- **Lamp pool:** an ellipse on the desk, stepped in three tones with dithered, oval edges.
- **Blind shadows:** diagonal dark bands across the right wall. They can slide slowly to suggest passing headlights.
- **Rain:** 1×3 px streaks on the glass, constant. Rain is the game's metronome.
- **CRT:** scanlines every other row, slight phosphor glow on text, a blinking power LED.

## 7. The flash

The flash is the game's signature beat and should look like nothing else in it.

1. Two to three frames of pure flash white.
2. About ten frames where the **whole scene collapses to three tones** (near-black, fog grey, flash white), like a photo negative or a nod to Pope's 1-bit *Return of the Obra Dinn*. Shapes and silhouettes survive; colour doesn't. See `flash.png`.
3. A stepped (not smooth) fade back: 50%, 25%, 12% white, then normal colour.

The loop reset uses the same effect, run backwards, so players learn to read the flash as "time just moved".

## 8. Characters

- **Framing:** head and shoulders behind the counter, about 100–110 native px tall, centred around x≈250. Hands can rise into frame to show a prop (the scientist's watch).
- **Built from parts** (Papers, Please style): head shape, skin ramp, hair, eyes, mouth, torso/outfit, era props. Recolour by swapping ramps. This is how 30+ visitors stay affordable.
- **Faces a little too much** (No, I'm Not a Human style): eyes slightly wide, teeth visible when talking, stubble or sweat drawn as dither. Uncanny but not grotesque; the tone is soft noir, not horror.
- **Every visitor reads in silhouette first.** The fedora, the wild hair, the helmet. A player should guess the era from the outline before reading any tell.
- **Animation:** two-to-three-frame loops at most (blink, mouth open/closed, a fidget). The rain and the CRT carry the motion.

### Tells

- Each intruder needs at least one **visual** tell (story bible rule). Visual tells live in three places:
  1. **On the body** (the fedora that is dry in a rainstorm, sandals in winter).
  2. **On the desk** (a document, a coin, a phone they set down).
  3. **In the zoom** only (a seam on an android's neck, the date engraved on a pocket watch).
- **Inspection zoom:** clicking a hotspot opens a small close-up panel (32×24 native art scaled up) with one line of the guard's noir observation. Hotspots are invisible until hovered or focused, then show a dashed lamp-amber outline.
- **Red herrings use the same visual language** as real tells, so look alone never decides.

### The scientist's tells — DECIDED: very subtle, catchable on a replay

His tells are drawn in the 90s palette, so nothing about him looks futuristic on a first playthrough. Each has an innocent explanation in the guard's own line, and only makes sense once you know the twist.

| Tell | What you see | What the guard says | What a returning player realises |
|---|---|---|---|
| **Wristwatch** | A cheap black digital watch on his raised hand. No cyan. Zoom shows `12.03.40`. | "Cheap digital. The date reads '40. Battery's dying, probably." | It isn't a dead battery. The year is 2240. |
| **Coat hem** | Dull burn marks at the hem and one thin, neat seam line. | "Burn marks. Lab accident, he'd say. The stitching is very neat for a man this rumpled." | The coat was burned arriving through time, and re-stitched with future thread. |
| **Visitor list** | His name is on the clipboard like anyone else's. | (none) | Later: the list is in his handwriting, dated in the future (story bible, section 5). |

### Visitors in the mockup

| Visitor | Silhouette | Palette | Tells |
|---|---|---|---|
| **The scientist** | Exploding grey hair, glasses, lab coat | Paper coat, red tie, warm skin | Above. |
| **The assassin (tutorial)** | Smooth helmet, heavy pauldrons | Night armour, lots of future cyan | Glowing visor that pulses, glowing seams and chest core. Zero ambiguity, by design. |
| **1920s gentleman** | Fedora, three-piece suit, mustache | Cloth browns, gold watch chain | Pocket watch engraved 1923; fedora bone-dry in the rain; a calling card instead of an ID. |
| **Android inspector** | Neat hair, grey suit, clip-on badge | Suit greys; one flickering cyan pixel | Badge seal (zoom), hairline neck seam (zoom), too-even smile, "Is everything in order?" |

## 9. Documents and desk props

- Documents are paper-ramp rectangles with a dark drop shadow (1–2 px offset), a small photo box, ruled lines for text, and one red stamp or label.
- Era-wrong documents differ in **material** first: a 1920s calling card is yellowed (`#c9b98f`), a 90s badge is laminated paper, a future document hides a hologram seal.
- Desk props are all 90s-plausible: beige corded phone with a red hold button, clipboard visitor list, CRT, Rolodex, wall calendar.

## 10. Type

| Role | Font | Notes |
|---|---|---|
| Dialogue, documents, CRT | **VT323** (Google Fonts, free) | Terminal-style; reads as both typewriter and CRT. |
| Labels, names, buttons | **Silkscreen** (Google Fonts, free) | Small pixel capitals; use for speaker names, stamps, button labels. |
| Guard's narration | VT323 italic, lamp amber | One short line top-left, noir voice. |
| In-art readouts | Hand-drawn 3×5 pixel digits | For watches, badge numbers, clocks inside sprites. |

## 11. UI chrome

- No modern UI frames. Everything is an object: a paper speech bubble with a hard 2 px shadow, physical buttons, a CRT, a notebook.
- Speaker names in Silkscreen, danger red.
- Hover and focus states use a dashed lamp-amber outline; keep these visible for keyboard players.

## 12. Notes for the engine

- One 480×270 canvas for the art, scaled with CSS by the largest whole number that fits; HTML overlays positioned in native coordinates inside a scaled wrapper.
- The counter top sits at y≈166 of 270 (about 61.5% of the height).
- **Full-body visitors:** with the cut-out, visitors are drawn down to y≈252. Torso to a hem at y 190–200, arms at the sides with hands at y≈198–212 (x≈204 and x≈294), trousers or a skirt below, long coats to y≈242. Waist-height details (watches on the wrist, key rings, belts, bags) become inspection spots.
- **Desk props around the cut-out:** question pad on the left (x 8–156) under a smaller lamp (x 156–180), compact phone below the lamp, visitor-list clipboard at x 322–367, loop tally scratched into the desk under the cut-out at (188,253). Radio, notebook, CRT and drawer as before.
- **Clickable details:** each visitor has 4–5 inspection spots, so the real tells sit among ordinary ones. The scientist's watch is on his right wrist at waist height, next to his key ring, crumpled notes and coat hem.
- Draw order: room → visitor → counter and desk → documents → flash/posterise post-process → HTML UI.
- Placeholder art can be drawn procedurally exactly as the mockup does (rectangles, pixel ellipses, scanline polygons, ordered dither) and swapped later for PNG sprite sheets on the same palette. Sprite sheets should be authored at 1× native size.
- The flash posterise is a cheap `getImageData` pass mapping brightness to three palette colours.
- Load colours from `palette.json` so art and code agree.

## 13. Open questions

None. Difficulty is set by tells and dialogue lies per visitor, drafted in [../story/visitor-tells.md](../story/visitor-tells.md).
