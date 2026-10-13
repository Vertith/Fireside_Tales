# Emit Time V1.3Beta (Windows, 64-bit)

Built 2026-10-13 from a snapshot of `game/` (source files, not `dist/`). Electron 44.7.1, electron-builder 26.15.3.

- `Emit-Time-V1.3Beta-Setup.exe` — installer. Lets you pick the install folder, adds Start menu and desktop shortcuts, and an uninstaller under Apps & features.
- `Emit-Time-V1.3Beta-Portable-x64.zip` — no install. Unzip anywhere and run `Emit Time V1.3Beta.exe`.
- `SHA256SUMS.txt` — checksums.

The game runs fully offline (the two Google fonts are bundled). F11 toggles fullscreen. Save data lives in the app's own profile, separate from any browser.

**Unsigned.** There is no code-signing certificate, so Windows SmartScreen will say "Windows protected your PC". Click *More info* → *Run anyway*.

## Rebuilding

`build-source/` holds the Electron wrapper. To rebuild with newer game files: copy `game/index.html`, `game/css`, `game/js` into `build-source/game/`, re-apply the font swap (`<link>` to Google Fonts → `fonts/fonts.css`, fonts in `build-source/fonts/`) and the window title, then `npm ci && npx electron-builder --win nsis zip --x64`. On Linux this needs wine (64- and 32-bit).
