# Emit Time — Art Style Guide

**Status:** v2 (13 Oct 2026), updated with Adam's decisions: pixel art leaning hard into Papers, Please; the scientist's tells are very subtle, catchable on a second playthrough.
**Mockup:** [mockups/desk-scene.html](mockups/desk-scene.html) (interactive), stills in [mockups/](mockups/): `scientist.png`, `scientist-watch-zoom.png`, `assassin.png`, `gent.png`, `android.png`, `android-badge-zoom.png`, `flash.png`. The first, moodier take is kept in `mockups/v1/` for comparison.
**Palette file for the engine:** [palette.json](palette.json)

---

## 1. The direction in one line — DECIDED

**Papers, Please at a night desk.** Drab, flat, mid-resolution pixel art in Lucas Pope's mould, with the same split screen (the outside on top, the person at your window bottom-left, your desk bottom-right). Film noir comes through the night, the rain and one desk lamp, not through saturated colour. From the other two games we borrow only small things: No, I'm Not a Human's slightly uncomfortable close-ups of people, and Probably Stolen's habit of judging the object as well as the person.

## 2. What we take from each reference

| Game | What it does visually | What Emit Time takes |
|---|---|---|
| **Papers, Please** (Lucas Pope) — the main model | Mid-res pixel art rendered small and scaled up. Each object limited to about three flat shades rather than one global palette. Screen split into the outside view (queue), the booth (the traveller), and the desk (documents you drag around). Portraits built from swappable parts. Stiff, rotoscope-like animation. Drab, grim colours. | Almost everything: the three-panel layout, flat shading, drab palette, parts-based portraits, documents on a desk, a transcript printout, stamp-style decision buttons, a drawer for the gun. |
| **No, I'm Not a Human** (Trioskaz) | An eerie, stylised look. You judge strangers by physical tells (teeth, fingernails, eyes) and inspect them up close; a shotgun decides. | The inspection close-up panel, and faces that are slightly off (too-even teeth, too-wide eyes). |
| **Probably Stolen** (tinyBuild, in playtest) | Gritty cyberpunk pixel-art shop simulator: judge the item and the seller, then approve, refuse, report or look away. | Items on the desk are as important as the face at the window. |

Sources: Pope's [Papers, Please devlog](https://dukope.com/devlogs/papers-please/tig-00), [Game Developer on Pope's style](https://gamedeveloper.com/design/lucas-pope-and-the-rise-of-the-1-bit-dither-punk-aesthetic), [No, I'm Not a Human on Wikipedia](https://en.wikipedia.org/wiki/No,_I%27m_Not_a_Human), [Military.com review](https://secure.military.com/off-duty/games/steams-latest-horror-hit-isnt-everyone-its-perfect-me.html), [Probably Stolen announcement](https://www.gamedeveloper.com/press-release/tinybuild-announces-probably-stolen-a-cyberpunk-pixel-art-shop-simulator-where-the-goods-aren-t-purely-legal). Written sources describe the last two games only loosely, so check their Steam pages before relying on those rows.

## 3. Canvas and scaling

- **Native resolution: 480 × 270** (16:9), scaled by whole numbers (×2, ×3, ×4) with nearest-neighbour: `image-rendering: pixelated`, `ctx.imageSmoothingEnabled = false`. Letterbox odd window sizes.
- Dialogue, documents and CRT text are HTML text laid over the scaled canvas in pixel-style fonts so they stay readable. Tiny in-art readouts (a watch, a badge number) use a hand-drawn 3×5 pixel digit font so they stay crisp.
- Sprites snap to whole native pixels. No rotation.

## 4. Screen layout (Papers, Please split)

```
+-----------------------------------------------------------+
| OUTSIDE (y 0-64): rain, street lamp, queue with umbrellas, |
| the Science Corp building and its doors. Flashes land here.|
+---------------------------+-------------------------------+
| BOOTH WINDOW (x 0-208)    | DESK (x 208-480)              |
| lobby wall, poster, clock | transcript   CRT      lamp    |
| VISITOR head & shoulders  | clipboard  document  phone    |
| ledge + document tray     |                               |
| narration, date, time     | [LET] [TURN] [DRAWER] [DEVICE]|
+---------------------------+-------------------------------+
```

- **Outside strip:** a side view of the street, like Papers, Please's checkpoint view. Silhouettes with umbrellas queue toward the doors, so the player sees the night getting busier. The flash happens here first.
- **Booth window:** the visitor framed by a steel window frame and glass glare, with a ledge and a slot tray where documents come through. Below it: the guard's narration line, the date and time, and the speaker grille.
- **Desk:** a paper **transcript** of what the visitor said (Papers, Please's interrogation printout), the CRT for cameras and later the Guard's Notebook, the visitor list on a clipboard (the scientist's own entry highlighted), whatever document the visitor handed over, and the phone.
- **Actions as desk hardware:** *Let through* (green) and *Turn away* (red) are stamp-style buttons. *Shoot* is a **drawer** with the revolver in it, a direct nod to the rifle drawer in Papers, Please. *Device* sits locked until the scientist hands it over.

## 5. Palette

40 colours in ramps of three, per Pope's per-object rule. Desaturated and slightly warm-grey, like Papers, Please, so the few strong colours carry meaning. Full list in [palette.json](palette.json).

| Group | Use | Colours |
|---|---|---|
| **Night** (6) | Sky, walls, outlines, the street | `#101114` `#1d1e22` `#2c2d31` `#43443f` `#5f6058` `#8c8b7d` |
| **Desk & lamp** (6) | Desk, ledge, lamp pool, lit windows | `#2b2519` `#3e3624` `#574c33` `#74663f` `#a88a52` `#d8be84` |
| **Paper** (3) | Documents, transcript, lab coat | `#cfc6a8` `#a49c80` `#605a48` |
| **90s plastic** (3) | Phone, CRT, cheap watches | `#57534a` `#7f796a` `#a8a08a` |
| **Skin** (2 ramps × 3) | Visitors; add ramps as the cast grows | `#563a2e` `#8e6450` `#bd9074` / `#3a271e` `#634434` `#8c6650` |
| **Cloth brown** (3) | Old-fashioned suits, coats | `#2b2420` `#463a30` `#67574a` |
| **Suit grey** (3) | Office suits, uniforms | `#2a2e2c` `#3f4541` `#5a615b` |
| **CRT phosphor** (3) | Monitor | `#13241a` `#3d7a52` `#8fd0a0` |
| **Signal** (3) | Turn away, blood, ties | `#5a2222` `#9a3a32`; Let through `#4d6b3a` |
| **Future cyan** (3) | Only on things from the future | `#2a6a78` `#58c8dc` `#b6eaf0` |
| **Flash** (1) | The time-travel flash only | `#eef0e8` |

### Colour rules

1. **The 90s are drab.** Everything belonging to the present sits in night greys, desk browns, paper and beige plastic.
2. **Future cyan never appears on anything from the 1990s.** It's the one colour that shouldn't exist here.
3. **How much cyan a future visitor shows is the difficulty dial.** Early future visitors are covered in it; later ones look completely normal and carry one small cyan detail you only notice up close. Examples:
   - **The assassin (tutorial, visitor 1):** glowing cyan visor, cyan seams down the armour, a cyan core in the chest. You can't miss it. This teaches the player "cyan means the future".
   - **The android inspector (roster #9, mid-game):** a plain grey 90s suit, a normal face, a normal laminated badge. The only cyan is the badge's security seal, a 2×2-pixel square that briefly flickers cyan every few seconds. At normal size it reads as a grey dot; in the zoom it's clearly a hologram (see `android-badge-zoom.png`). Their document has the same flickering seal.
   - **Late game (e.g. the rival engineer, #26):** no cyan at all. The only tell is in the paperwork, a merger date that hasn't happened yet.
   - **Past-era intruders never get cyan.** Their tells are silhouette, props and material (a fedora that's bone-dry in the rain, a yellowed calling card).
4. **Red is for consequences** (Turn away, blood, stamps). **Green only on Let through.** Neither is used for decoration.
5. Light comes from the **lamp at the desk's top right**; faces in the booth are lit from the left by the lobby lights. Each face uses a three-step flat ramp (shadow, base, light), no gradients.

## 6. Lighting and texture

- **Flat shading, Papers, Please style.** Characters and props use two or three flat tones per material. No dithering on characters.
- **The lamp pool** on the desk is two flat, stepped ellipses.
- **Glass glare** on the booth window: two faint flat diagonal bands.
- **Rain:** 1×2 px streaks drifting across the outside strip, always on.
- **CRT:** scanlines every other row, a power LED.

## 7. The flash

1. Two or three frames of flash white.
2. About ten frames where the **whole screen collapses to three tones** (near-black, grey, flash white). Shapes survive; colour doesn't. See `flash.png`.
3. A stepped fade back: 50%, 25%, 12% white, then normal.

A loop reset plays the same effect in reverse.

## 8. Characters

- **Framing:** head and shoulders in the booth window, roughly 110 px tall, centred in the window.
- **Built from parts** (head, skin ramp, hair, eyes, mouth, outfit, era props) and recoloured by swapping ramps, as Pope did. This keeps 30+ visitors affordable.
- **Expressions are stiff and grim**, with one thing slightly off per face where it matters (the android's perfectly even smile).
- **Silhouette first:** the fedora, the wild hair, the helmet. A player should guess the era from the outline.
- **Animation:** two or three frames at most (blink, mouth open/closed, a fidget). The rain, the queue and the CRT carry the motion.

### Tells

- Each intruder needs at least one **visual** tell (story bible rule). They live:
  1. **On the body** (a fedora dry in a rainstorm).
  2. **On the desk** (the document they hand over).
  3. **Only in the zoom** (an engraved date, a neck seam, a hologram seal).
- **Inspection zoom:** clicking a spot on the visitor opens a small close-up panel (32×24 native art, scaled up) with one line of the guard's observation. Spots show a dashed lamp-amber outline on hover or keyboard focus.
- **Red herrings use the same visual language** as real tells, so looks alone never decide.

### The scientist's tells — DECIDED: very subtle, catchable on a replay

His tells are drawn in the 90s palette, so nothing about him looks futuristic on a first playthrough. Each one has an innocent explanation that the guard's own line offers, and only makes sense once you know the twist.

| Tell | What you see | What the guard says | What a returning player realises |
|---|---|---|---|
| **Wristwatch** | A cheap black digital watch on his raised hand. No cyan. Zoom shows `12.03.40`. | "Cheap digital. The date reads '40. Battery's dying, probably." | It isn't 1940 or a dead battery. It's 2240. |
| **Coat hem** | Dull burn marks at the hem and one thin, neat seam line. | "Burn marks. Lab accident, he'd say. The stitching is very neat for a man this rumpled." | The coat was burned arriving through time, and re-stitched with future thread. |
| **Visitor list** | His name is the highlighted entry on the clipboard. | (none) | Later: the list is in his handwriting, dated in the future (story bible, section 5). |

### Visitors in the mockup

| Visitor | Silhouette | Palette | Tells |
|---|---|---|---|
| **The scientist** | Exploding grey hair, glasses, lab coat | Paper coat, red tie | Above. |
| **The assassin (tutorial)** | Smooth helmet, heavy pauldrons | Night armour, lots of future cyan | Glowing visor, glowing seams. No ambiguity. |
| **1920s gentleman** | Fedora, three-piece suit, mustache | Cloth browns, gold watch chain | Pocket watch engraved 1923; dry fedora; a yellowed calling card instead of ID. |
| **Android inspector** | Neat hair, grey suit, clip-on badge | Suit greys; one flickering cyan pixel | Badge seal (zoom), hairline neck seam (zoom), too-even smile, "Is everything in order?" |

## 9. Documents and desk props

- Documents are paper-ramp rectangles with a hard 2 px drop shadow, a photo box, ruled lines and one red label. They arrive through the booth tray and are dragged around the desk.
- Era-wrong documents differ in **material** first: a 1920s calling card is yellowed (`#bfae84`), a 90s badge is laminated paper, a future document hides a hologram seal.
- The **transcript** is a paper printout of the visitor's last lines.
- Desk props stay 90s-plausible: beige phone with a red hold button, clipboard, CRT, desk lamp, later a Rolodex and wall calendar.

## 10. Type

| Role | Font | Notes |
|---|---|---|
| Transcript, documents, CRT, narration | **VT323** (Google Fonts, free) | Terminal style; reads as both typewriter and CRT. |
| Names, labels, buttons | **Silkscreen** (Google Fonts, free) | Small pixel capitals. |
| In-art readouts | Hand-drawn 3×5 pixel digits | For watches, badge numbers, clocks inside sprites. |

## 11. UI chrome

- No floating modern UI. Everything is an object: transcript paper, CRT, stamp buttons, a drawer, a notebook.
- Speaker names in Silkscreen, signal red.
- Hover and keyboard focus show a dashed lamp-amber outline.

## 12. Notes for the engine

- One 480×270 canvas for the art, scaled with CSS by the largest whole number that fits. HTML overlays are positioned in native coordinates inside the scaled wrapper.
- Draw order: outside strip → booth back wall → visitor (clipped to the window) → window frame and ledge → desk and documents → flash post-process → HTML UI.
- Visitor art is authored on its own frame and offset into the window, so the same sprite can be reused elsewhere (a returning visitor in the queue, the Notebook).
- Placeholder art can be drawn procedurally as the mockup does (rectangles, pixel ellipses, scanline polygons) and later swapped for PNG sprite sheets on the same palette, authored at 1× native size.
- The flash posterise is a cheap `getImageData` pass mapping brightness to three palette colours.
- Load colours from `palette.json` so art and code agree.

## 13. Open questions

None blocking. Pixel art leaning into Papers, Please is decided, and so are the very subtle scientist tells. Future cyan as the difficulty dial (section 5, rule 3) awaits Adam's OK.
