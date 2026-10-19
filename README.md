# Fireside Tales

A set of click-based pixel art story games, told around a campfire. The site opens on the fire ([`index.html`](index.html)); pick a tale from the stumps around it. **Emit Time** and **The Lab** are finished. The Asylum, Intruders and It Walks are coming.

## Emit Time

A click-based pixel art story game.

It's a stormy night in 1993 at Science Corp. You're the security guard on the front desk, and a man in a lab coat has just run in to say he's cracked time travel on the fourth floor. Now people from every era are turning up to stop it, steal it, or deliver dinner. Over 30 visitors between 10:52 PM and 6 AM, you question each one, inspect what they carry, and decide: let them through, turn them away, or shoot. Every wrong call sends you back to the first flash of light, but your notebook remembers what you learned, and so, it turns out do you.

## Play

- **Online:** [vertith.github.io/Fireside_Tales](https://vertith.github.io/Fireside_Tales/) opens the campfire; Emit Time itself is at [/game/](https://vertith.github.io/Fireside_Tales/game/)
- **In a browser:** open `game/index.html`, or the single-file build `game/dist/emit-time.html`. No build step or server needed.
- **On Windows:** the V1.3 Beta installer and portable zip are distributed separately (they're too large for the repository). See [`releases/v1.3beta/README.md`](releases/v1.3beta/README.md).

## What's here

| Folder | Contents |
|---|---|
| [`game/`](game/) | The game: plain HTML, CSS and JavaScript. Its [README](game/README.md) covers the engine, content files and how to write scenes |
| [`stories/`](stories/) | The other tales. [`stories/lab/`](stories/lab/) is The Lab (E.L.D.R.I.T.C.H), brought over from its own project. [`stories/upstairs/`](stories/upstairs/) is Upstairs, now retired from the campfire (Intruders takes its place); [`stories/README.md`](stories/README.md) explains how to start a new one from the template |
| [`story/`](story/) | Emit Time's story bible, story arc, visitor tells and alternate endings, plus [`story/upstairs/`](story/upstairs/) for Upstairs |
| [`art/`](art/) | Style guide, palette and desk-scene mockups |
| [`releases/v1.3beta/`](releases/v1.3beta/) | Release notes and EULA for the Windows build |
