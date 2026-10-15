/*
 * Emit Time — pixel renderer, "Noir Pixel Desk" (the first art style, which
 * Adam chose to keep). Source: /mnt/project-files/art/mockups/v1/desk-scene.html.
 *
 * One 480x270 canvas scaled by whole numbers with nearest-neighbour. The
 * lobby fills the top: wall panels, rainy glass doors on the left, blind
 * shadows on the right. The visitor stands behind the counter (top at
 * y=166); the guard's desk sits below it, lit by one lamp. A cut-out in the
 * middle of the desk (CUT) shows the visitor from the waist down, so hands,
 * belts and whatever they carry can be inspected. Visitors are drawn down to
 * y≈252 and clipped to the lobby plus the cut-out.
 *
 * Swapping art: each visitor is a draw function in EMIT.art.visitors,
 * authored around x≈249 with the head at y≈60. A PNG sprite can replace one:
 *   EMIT.art.visitors.scientist = EMIT.art.sprite('art/scientist.png', x, y);
 */
(function () {
  'use strict';
  var E = (window.EMIT = window.EMIT || {});

  // palette from the first style (mockups/v1)
  var P = {
    night0: '#0b0d14', night1: '#161a2a', night2: '#232a40', night3: '#39425e', steel: '#5b6684', fog: '#8d97b0',
    wood0: '#2a180d', wood1: '#3a2414', wood2: '#5e3a1f', wood3: '#8a5a2e', lamp3: '#c88a45', lamp4: '#f2c27a',
    paper: '#d9cfb4', paperShade: '#a89c80', paperDark: '#6e6552',
    plastic0: '#5f5848', plastic1: '#8a7f68', plastic2: '#b3a68a',
    skinA0: '#5a3428', skinA1: '#9a634c', skinA2: '#d29a78',
    skinB0: '#3a2219', skinB1: '#6b4232', skinB2: '#9c6a50',
    crt0: '#0f2a1c', crt1: '#2f8f5a', crt2: '#7dffb0',
    red0: '#5c1a22', red1: '#a8323a',
    cool0: '#123f3c', cool1: '#1f6f66', cool2: '#4fb39b',
    fut0: '#1c6f86', fut1: '#3fe0ff', fut2: '#b8f6ff',
    flash: '#eef4ff',
    brown0: '#2e1f17', brown1: '#4f3527', brown2: '#7a5640',
    shirt: '#4a5a7a', suit0: '#262b38', suit1: '#3c4354', suit2: '#596277',
    card0: '#7d6240', card1: '#a8875a', hair0: '#3b2416', hair1: '#5a3820'
  };

  var W = 480, H = 270;
  var WINDOW = { x: 0, y: 0, w: 480, h: 166 };     // visitors are clipped above the counter
  var OX = 0, OY = 0;                               // visitors are drawn at their authored position
  var g = null;

  /* ---------- drawing primitives (whole pixels, no anti-aliasing) ---------- */
  function R(x, y, w, h, col) { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
  function El(cx, cy, rx, ry, col) {
    g.fillStyle = col;
    for (var y = -ry; y <= ry; y++) {
      var w = Math.round(rx * Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry))));
      g.fillRect(Math.round(cx - w), Math.round(cy + y), w * 2 + 1, 1);
    }
  }
  function poly(pts, col) {
    g.fillStyle = col;
    var minY = Infinity, maxY = -Infinity;
    pts.forEach(function (p) { minY = Math.min(minY, p[1]); maxY = Math.max(maxY, p[1]); });
    for (var y = Math.floor(minY); y <= Math.ceil(maxY); y++) {
      var xs = [];
      for (var i = 0; i < pts.length; i++) {
        var a = pts[i], b = pts[(i + 1) % pts.length];
        if ((a[1] <= y && b[1] > y) || (b[1] <= y && a[1] > y)) xs.push(a[0] + (y - a[1]) * (b[0] - a[0]) / (b[1] - a[1]));
      }
      xs.sort(function (p, q) { return p - q; });
      for (var j = 0; j < xs.length; j += 2) g.fillRect(Math.round(xs[j]), y, Math.round(xs[j + 1]) - Math.round(xs[j]), 1);
    }
  }
  // ordered dither, density d = 0..4; oval clips to an ellipse
  function D(x, y, w, h, col, d, oval) {
    g.fillStyle = col;
    for (var j = 0; j < h; j++) for (var i = 0; i < w; i++) {
      var px = x + i, py = y + j;
      if (oval) { var u = (i - w / 2) / (w / 2), v = (j - h / 2) / (h / 2); if (u * u + v * v > 1) continue; }
      var bb = [[0, 2], [3, 1]][py & 1][px & 1];
      if (bb < d) g.fillRect(px, py, 1, 1);
    }
  }
  function text(str, x, y, col, size, font) {
    g.fillStyle = col;
    g.font = (size || 8) + 'px ' + (font || 'VT323, monospace');
    g.fillText(str, x, y);
  }
  // 3x5 pixel digits for tiny in-art readouts
  var GLYPH = {
    '0': '111101101101111', '1': '010110010010111', '2': '111001111100111', '3': '111001111001111',
    '4': '101101111001001', '5': '111100111001111', '6': '111100111101111', '7': '111001001001001',
    '8': '111101111101111', '9': '111101111001111'
  };
  function digits(ctx, str, x, y, col) {
    ctx.fillStyle = col;
    var cx = x;
    for (var k = 0; k < str.length; k++) {
      var ch = str[k];
      if (ch === '.' || ch === ':') { ctx.fillRect(cx, y + 4, 1, 1); if (ch === ':') ctx.fillRect(cx, y + 1, 1, 1); cx += 2; continue; }
      var gl = GLYPH[ch]; if (!gl) { cx += 4; continue; }
      for (var i = 0; i < 15; i++) if (gl[i] === '1') ctx.fillRect(cx + i % 3, y + Math.floor(i / 3), 1, 1);
      cx += 4;
    }
  }

  /* ---------- scene state, set by the UI ---------- */
  var S = {
    t: 0,
    visitor: null, vx: 0, vy: 0, move: null,
    blood: false,
    flashT: -1, flashReverse: false, flashSub: 0,
    drawerOpen: false, drawerT: 0,
    clock: '10:14 PM', loop: 1,
    crt: ['CAM 01 LOBBY', '> RAIN', '> REC'],
    tally: 0, tallyFreshAt: -1,
    hasList: false, hover: null, still: false,
    radio: { on: false, index: 0 }
  };
  var rain = [];
  for (var i = 0; i < 70; i++) rain.push({ x: Math.random() * 128 + 22, y: Math.random() * 130 + 22, s: 2 + Math.random() * 2 });

  /* ---------- the lobby ---------- */
  function room() {
    R(0, 0, 480, 270, P.night1);
    for (var x = 160; x < 480; x += 40) R(x, 0, 1, 170, P.night0);
    R(0, 166, 480, 4, P.night0);
    // glass doors onto the rainy city
    R(18, 18, 136, 144, P.steel); R(20, 20, 132, 140, P.night0);
    R(22, 22, 62, 136, P.night2); R(88, 22, 62, 136, P.night2);
    for (var i = 0; i < 9; i++) {
      var bx = 24 + i * 14, bh = 20 + ((i * 37) % 40);
      R(bx, 158 - bh - 30, 10, bh, P.night1);
      for (var w = 0; w < bh; w += 6) if ((i + w) % 3) R(bx + 3, 158 - bh - 30 + w + 2, 2, 2, (i + w) % 5 ? P.night3 : P.lamp3);
    }
    R(22, 120, 128, 38, P.night1); D(22, 112, 128, 8, P.night1, 2);
    R(84, 20, 4, 140, P.steel); R(78, 80, 2, 20, P.fog); R(90, 80, 2, 20, P.fog);
    // lightning through the doors: the glass lifts a shade and a bolt crosses the sky
    if (S.bolt > 0) {
      var lit = S.bolt > 4 || S.bolt === 2;
      if (lit) {
        R(22, 22, 62, 90, P.night3); R(88, 22, 62, 90, P.night3); D(22, 22, 128, 90, P.steel, 1);
        var bx = S.boltX;
        var zig = [3, -4, 2, 5, -3, 4, -2, 3, -5, 2, 4, -3, 2];
        for (var by = 22, zi = 0; by < 96; by += 6, zi++) {
          var nx = bx + zig[(zi + (bx & 3)) % zig.length];
          R(Math.min(bx, nx), by, Math.abs(nx - bx) + 1, 1, P.paper); R(nx, by, 1, 6, P.paper);
          if (zi === 4) for (var k = 1; k < 12; k++) R(nx + k, by + k, 1, 1, P.fog);
          bx = nx;
        }
        for (var j = 0; j < 9; j++) { var bxx = 24 + j * 14, bhh = 20 + ((j * 37) % 40); R(bxx, 158 - bhh - 30, 10, bhh, P.night1); }
      }
      if (!S.still) S.bolt--;
    }
    rain.forEach(function (d) {
      if (!S.still) { d.y += d.s * 0.5; if (d.y > 156) { d.y = 22; d.x = Math.random() * 128 + 22; } }
      if (d.x < 84 || d.x > 88) R(d.x, d.y, 1, 3, P.night3);
    });
    text('SCIENCE CORP', 176, 30, P.night3, 8, 'Silkscreen, monospace');
    R(176, 34, 82, 1, P.night3);
    // wall clock
    El(440, 40, 10, 10, P.night2); El(440, 40, 8, 8, P.paperShade); R(440, 33, 1, 7, P.night0); R(440, 40, 5, 1, P.night0);
    // venetian blind shadows from the lamp
    for (var k = 0; k < 7; k++) poly([[300, 50 + k * 14], [480, 30 + k * 14], [480, 36 + k * 14], [300, 56 + k * 14]], P.night0);
    if (S.blood) {
      poly([[214, 118], [246, 104], [282, 116], [296, 150], [270, 166], [222, 166], [206, 146]], gore());
      R(236, 140, 2, 26, gore()); R(262, 136, 3, 30, gore()); R(284, 150, 2, 16, gore());
      if (S.blood === 'coolant') {
        poly([[224, 126], [246, 114], [270, 124], [262, 140], [236, 142]], P.cool1);
        R(237, 140, 1, 20, P.cool2); R(263, 136, 1, 24, P.cool2);
        scrap(230, 128); scrap(268, 132, true); scrap(250, 150);
        spark(231, 129, 0); spark(269, 133, 37); spark(251, 151, 71);
      }
    }
  }

  // what's left after a shooting: blood, or for a machine, blue-green coolant full of sparking parts
  function gore() { return S.blood === 'coolant' ? P.cool0 : P.red0; }
  function scrap(x, y, gear) {
    if (gear) { R(x - 1, y - 1, 4, 4, P.steel); R(x, y, 2, 2, P.night1); R(x - 2, y, 1, 2, P.steel); R(x + 3, y, 1, 2, P.steel); R(x, y - 2, 2, 1, P.steel); R(x, y + 3, 2, 1, P.steel); }
    else { R(x, y, 4, 2, P.steel); R(x, y, 4, 1, P.fog); R(x + 4, y + 1, 3, 1, P.red1); R(x - 2, y + 1, 2, 1, P.lamp3); }
  }
  function spark(x, y, seed) {
    var k = (S.t + seed) % 90;
    if (k > 14 || (k > 4 && k < 8)) return;
    var c = k < 3 ? P.paper : P.lamp4, s = (seed % 3) - 1;
    R(x, y - 1, 1, 1, c);
    R(x - 1 + s, y - 2 - (k >> 2), 1, 1, P.lamp4);
    R(x + 2, y - 2 - (k >> 1), 1, 1, c);
    if (k < 4) { R(x - 1, y - 1, 3, 1, P.lamp4); R(x, y - 2, 1, 3, P.lamp4); }
  }

  // the cut-out in the desk: through it you see the visitor from the waist down
  var CUT = { x: 182, y: 166, w: 132, h: 80 };

  // what's beyond the counter, seen through the cut-out: the lower wall and the lobby floor
  function lobbyFloor() {
    R(CUT.x, 166, CUT.w, 26, P.night1);
    for (var x = 200; x < CUT.x + CUT.w; x += 40) R(x, 166, 1, 26, P.night0);
    R(CUT.x, 190, CUT.w, 3, P.night0); R(CUT.x, 189, CUT.w, 1, P.night2);
    R(CUT.x, 193, CUT.w, 53, P.night0);
    [198, 206, 218, 234].forEach(function (y) { R(CUT.x, y, CUT.w, 1, P.night1); });
    for (var k = -3; k <= 3; k++) poly([[249 + k * 16, 193], [250 + k * 16, 193], [250 + k * 40, 246], [249 + k * 40, 246]], P.night1);
    D(CUT.x, 193, CUT.w, 53, P.night1, 2);
    if (S.blood) {
      El(250, 230, 44, 10, gore()); El(236, 238, 20, 6, gore());
      if (S.blood === 'coolant') {
        El(252, 229, 30, 5, P.cool1); R(240, 230, 10, 1, P.cool2); R(262, 233, 8, 1, P.cool2);
        scrap(238, 228); scrap(262, 230, true); scrap(276, 236); scrap(228, 238, true);
        R(244, 233, 8, 1, P.red1); R(251, 232, 1, 2, P.red1); R(266, 236, 6, 1, P.lamp3);
        spark(239, 229, 11); spark(263, 231, 53); spark(277, 237, 89); spark(252, 233, 23);
      }
    }
  }

  // the cut's own edges, drawn over everything so it reads as a notch in the desk
  function cutFrame() {
    D(CUT.x, 238, CUT.w, 8, P.night0, 1);
    R(CUT.x - 4, 166, 4, CUT.h + 2, P.wood2); R(CUT.x - 4, 166, 1, CUT.h + 2, P.wood3); R(CUT.x - 1, 168, 1, CUT.h, P.wood0);
    R(CUT.x + CUT.w, 166, 4, CUT.h + 2, P.wood0); R(CUT.x + CUT.w + 3, 166, 1, CUT.h + 2, P.wood1);
    R(CUT.x - 4, 246, CUT.w + 8, 3, P.wood3); R(CUT.x - 4, 249, CUT.w + 8, 1, P.wood0);
    R(CUT.x - 4, 166, 4, 2, P.wood3); R(CUT.x + CUT.w, 166, 4, 2, P.wood2);
  }

  function counterAndDesk() {
    // everything on the guard's side is drawn around the cut-out
    g.save();
    g.beginPath(); g.rect(0, 0, W, H); g.rect(CUT.x, CUT.y, CUT.w, CUT.h); g.clip('evenodd');

    // counter top
    R(0, 166, 480, 14, P.wood2); R(0, 166, 480, 2, P.wood3); R(0, 178, 480, 2, P.wood0);
    if (S.blood) { R(160, 166, 22, 2, gore()); R(318, 168, 4, 6, gore()); }
    // desk surface
    R(0, 180, 480, 90, P.wood1);
    for (var y = 186; y < 270; y += 9) R(0, y, 480, 1, P.wood0);
    // lamp pool under the question pad, dithered falloff
    El(80, 222, 100, 50, P.wood2); D(-40, 160, 240, 120, P.wood2, 1, true);
    El(84, 220, 70, 34, P.wood3); D(10, 184, 150, 72, P.wood3, 1, true);
    El(90, 218, 34, 16, P.lamp3);
    g.restore();

    // desk lamp, leaning over the question pad
    R(158, 236, 20, 5, P.night0); R(160, 234, 16, 3, P.night3);
    poly([[166, 234], [170, 234], [174, 200], [170, 198]], P.night3);
    poly([[156, 184], [178, 182], [176, 198], [160, 200]], P.night2); R(160, 198, 16, 2, P.lamp4);

    // a compact desk phone in front of the lamp
    R(157, 248, 22, 16, P.plastic1); R(158, 245, 20, 5, P.plastic2); R(159, 251, 14, 11, P.plastic0);
    for (var r = 0; r < 3; r++) for (var q = 0; q < 3; q++) R(160 + q * 4, 252 + r * 3, 3, 2, P.plastic2);
    R(174, 252, 3, 9, P.red1);

    // the question pad sits at (8,186), 148 wide; its paper and lines are CSS, under the HTML text

    // clipboard visitor list (clickable)
    var hl = S.hover === 'list';
    poly([[322, 188], [364, 186], [367, 240], [324, 242]], hl ? P.brown2 : P.brown1);
    poly([[325, 192], [361, 190], [364, 236], [327, 238]], P.paper);
    R(337, 184, 14, 5, P.steel);
    if (S.hasList) {
      for (var i = 0; i < 6; i++) { R(330, 198 + i * 6, 18 + (i * 13) % 10, 1, P.paperDark); R(352, 198 + i * 6, 7, 1, P.paperShade); }
      R(345, 230, 14, 4, P.red1);
    } else {
      text('NO', 339, 210, P.paperDark, 8); text('LIST', 335, 220, P.paperDark, 8);
    }

    // desk radio (clickable): the dial lights up when it's on, the needle shows the station
    var hr = S.hover === 'radio', on = S.radio && S.radio.on;
    R(372, 194, 46, 28, P.night0); R(370, 192, 46, 28, hr ? P.plastic2 : P.plastic1);
    R(370, 192, 46, 2, P.plastic2);
    R(373, 196, 40, 9, on ? P.lamp3 : P.plastic0);
    if (on) R(374 + Math.round(36 * S.radio.index / 5), 196, 1, 9, P.red1);
    for (var gx = 0; gx < 6; gx++) R(374 + gx * 4, 209, 2, 8, P.plastic0);
    El(405, 213, 5, 5, P.plastic0); El(405, 213, 2, 2, on ? P.lamp4 : P.plastic2);

    // guard's notebook (clickable)
    var hn = S.hover === 'notebook';
    R(428, 194, 42, 30, P.night0); R(426, 192, 42, 30, hn ? P.red1 : P.red0);
    R(430, 192, 2, 30, P.brown0); text('NOTES', 437, 210, P.paperShade, 6, 'Silkscreen, monospace');

    // tally scratched into the desk below the cut-out, one mark per reset
    tally(188, 253);

    // revolver drawer front under the action buttons; slides out when the revolver is drawn
    R(312, 262, 164, 8, P.wood0); R(312, 262, 164, 1, P.wood3); R(388, 265, 14, 2, P.steel);
    drawer();

    // CRT monitor on the counter (its text is HTML, #crt-text)
    R(370, 110, 96, 72, P.plastic1); R(372, 112, 92, 64, P.plastic2); R(376, 118, 84, 54, P.night0);
    R(379, 121, 78, 48, P.crt0); D(379, 121, 78, 48, P.night0, 1);
    R(400, 178, 36, 6, P.plastic0); R(452, 170, 6, 3, P.crt2);
  }

  // The pulled-out drawer, seen from above: it slides up from the desk edge
  // over the clipboard, radio and notebook, with the revolver on a felt liner.
  function drawer() {
    var target = S.drawerOpen ? 1 : 0;
    if (S.drawerT !== target) S.drawerT = target > S.drawerT ? Math.min(1, S.drawerT + 0.09) : Math.max(0, S.drawerT - 0.12);
    if (S.drawerT <= 0) return;
    var e = 1 - Math.pow(1 - S.drawerT, 3), h = Math.round(64 * e);
    var x = 320, w = 152, top = 270 - h, oy = top - 204;   // oy shifts the contents with the slide
    g.save(); g.beginPath(); g.rect(x - 4, top, w + 8, h); g.clip();
    // shadow it casts on the desk, then the box: sides, back, felt
    R(x - 3, top + 2, w + 6, h, P.night0);
    R(x, top, w, 66, P.wood2); R(x, top, w, 1, P.wood3);
    R(x + 4, top + 4, w - 8, 58, P.wood0);
    R(x + 6, top + 6, w - 12, 54, P.brown0); D(x + 6, top + 6, w - 12, 54, P.night1, 2);
    // the revolver: wood grip, frame, cylinder, long barrel
    // Kane's device rides on the left once he's handed it over: a grey plastic
    // box the size of a pager, one button, worn pale at the corners
    var hasDev = !!(E.game && E.game.run && E.game.run.flags && E.game.run.flags.hasDevice);
    if (hasDev) {
      var dx = x + 12, dy = 204 + oy + 12;
      R(dx + 1, dy + 1, 16, 22, P.night0);                                      // shadow
      R(dx, dy, 16, 22, '#6c7280'); R(dx, dy, 16, 1, '#8c93a3'); R(dx, dy, 1, 22, '#8c93a3');
      R(dx + 15, dy + 1, 1, 21, '#4b505c'); R(dx + 1, dy + 21, 15, 1, '#4b505c');
      [[dx, dy], [dx + 15, dy], [dx, dy + 21], [dx + 15, dy + 21]].forEach(function (c) { R(c[0], c[1], 1, 1, P.paperShade); });
      R(dx + 1, dy + 1, 2, 1, P.paperShade); R(dx + 13, dy + 20, 2, 1, P.fog);   // scuffed edges
      R(dx + 3, dy + 3, 10, 6, '#3d424c'); R(dx + 4, dy + 4, 8, 4, '#2c3038'); // blank window
      R(dx + 5, dy + 12, 6, 6, '#2a2d33'); R(dx + 6, dy + 11, 4, 8, '#2a2d33'); R(dx + 4, dy + 13, 8, 4, '#2a2d33'); // the one button
      R(dx + 6, dy + 13, 4, 3, '#4a4f5c'); R(dx + 6, dy + 13, 2, 1, '#6c7280');
      R(dx + 4, dy + 19, 8, 1, '#565c68');                                      // seam
    }
    var gx = x + (hasDev ? 40 : 34), gy = 204 + oy + 11;
    // the wanted poster from 5:16, tucked under the barrel: glowing blue edge, photo, 0-1 in red
    if (E.game && E.game.run && E.game.run.flags && E.game.run.flags.posterInDrawer) {
      var px = gx + 26, py = gy + 4;
      R(px - 1, py - 1, 46, 22, '#3fd0e8'); R(px, py, 44, 20, '#1d6f86');
      R(px + 2, py + 2, 40, 16, P.paper); R(px + 2, py + 2, 40, 2, P.red1);
      R(px + 4, py + 6, 10, 10, P.paperShade); R(px + 6, py + 9, 6, 5, P.skinA1); R(px + 5, py + 6, 8, 3, '#b8c4d8'); R(px + 6, py + 10, 6, 1, P.night0);
      R(px + 17, py + 6, 16, 1, P.night0); R(px + 17, py + 9, 10, 4, P.red1); R(px + 29, py + 9, 11, 7, P.red1);
    }
    // grip: hangs from the back of the frame and sweeps down and back
    poly([[gx + 5, gy + 6], [gx + 14, gy + 7], [gx + 8, gy + 21], [gx + 6, gy + 23], [gx - 2, gy + 22], [gx - 3, gy + 19]], P.brown1);
    poly([[gx + 6, gy + 8], [gx + 11, gy + 9], [gx + 6, gy + 19], [gx + 1, gy + 19]], P.brown2);
    for (var q = 0; q < 4; q++) R(gx + 7 - q * 2, gy + 11 + q * 2, 2, 1, P.brown1);
    R(gx - 2, gy + 21, 8, 2, P.steel);                     // butt cap
    poly([[gx + 4, gy + 1], [gx + 26, gy + 1], [gx + 26, gy + 9], [gx + 13, gy + 9], [gx + 5, gy + 7]], P.steel);
    R(gx + 4, gy + 1, 22, 1, P.fog);
    R(gx + 14, gy - 1, 14, 11, P.steel); R(gx + 14, gy - 1, 14, 1, P.fog);
    for (var k = 0; k < 3; k++) R(gx + 16 + k * 4, gy + 1, 2, 7, P.night3);
    R(gx + 28, gy + 1, 50, 5, P.steel); R(gx + 28, gy + 1, 50, 1, P.fog); R(gx + 28, gy + 5, 50, 1, P.night3);
    R(gx + 75, gy - 1, 2, 2, P.steel);                     // front sight
    R(gx + 4, gy - 1, 4, 2, P.night3);                      // hammer
    // trigger guard: a closed loop under the frame, trigger inside it
    R(gx + 13, gy + 9, 1, 3, P.steel); R(gx + 14, gy + 12, 7, 1, P.steel); R(gx + 21, gy + 9, 1, 3, P.steel); R(gx + 14, gy + 11, 1, 1, P.steel);
    R(gx + 16, gy + 9, 1, 2, P.night3); R(gx + 17, gy + 10, 1, 1, P.night3);
    // a box of shells and the drawer's old receipts
    var bx = x + 124, by = 204 + oy + 12;
    R(bx, by, 20, 14, P.red0); R(bx, by, 20, 1, P.red1); R(bx + 3, by + 5, 14, 4, P.paperShade);
    for (var s = 0; s < 3; s++) { R(bx + 4 + s * 5, by + 18, 3, 6, P.lamp3); R(bx + 4 + s * 5, by + 18, 3, 1, P.lamp4); }
    R(x + 12, 204 + oy + 44, 30, 9, P.paperDark); R(x + 14, 204 + oy + 46, 20, 1, P.paperShade);
    // drawer front lip and pull
    R(x - 2, 262, w + 4, 8, P.wood1); R(x - 2, 262, w + 4, 1, P.wood3); R(x + w / 2 - 8, 265, 16, 2, P.steel);
    g.restore();
  }

  // the sister's supper, left on the counter when she's sent away, until Kane collects it
  function leftBag() {
    var f = E.game && E.game.run && E.game.run.flags;
    if (!f || !f.sisterBag || f.bagTaken) return;
    var x = 128, y = 150, hl = S.hover === 'bag';
    R(x + 1, y + 17, 15, 2, P.night0);                                   // shadow on the counter
    poly([[x, y + 4], [x + 14, y + 4], [x + 15, y + 17], [x - 1, y + 17]], hl ? '#c79a62' : '#b0844f');
    R(x + 1, y, 12, 5, '#c79a62'); R(x + 1, y + 2, 12, 1, '#8a6238');    // folded-over top
    R(x + 3, y + 9, 8, 1, P.night0); R(x + 3, y + 11, 6, 1, P.night0);   // ALDOUS in marker
    R(x + 13, y + 5, 1, 12, '#8a6238');
  }

  function tally(x, y) {
    var n = S.tally;
    for (var i = 0; i < n; i++) {
      var grp = Math.floor(i / 5), k = i % 5, gx = x + grp * 20;
      var col = (i === n - 1 && S.t - S.tallyFreshAt < 60) ? P.lamp4 : P.wood3;
      if (k < 4) R(gx + k * 4, y, 1, 12, col);
      else for (var j = 0; j < 16; j++) R(gx - 1 + j, y + 9 - Math.floor(j * 0.6), 1, 1, col);
    }
  }

  /* ---------- visitors, built from parts ---------- */
  // Lower-body parts shared by everyone, seen through the cut-out (y 166–252).
  // Viewer-left is lit by the lamp, so left halves take the lighter colour.
  function legs(L, Dk, top) {
    poly([[212, top], [249, top], [247, 254], [216, 254]], L);
    poly([[249, top], [286, top], [282, 254], [251, 254]], Dk);
    R(248, top + 14, 2, 254 - top - 14, P.night0);
  }
  function torso(L, Dk, hem) {
    poly([[206, 164], [249, 164], [249, hem], [212, hem]], L);
    poly([[249, 164], [292, 164], [286, hem], [249, hem]], Dk);
  }
  // an arm hanging at the side; cuff and hand at y≈196–212
  function armL(sleeve, cuff, skin, skinHi) {
    poly([[190, 164], [208, 164], [212, 198], [196, 200]], sleeve);
    poly([[208, 164], [209, 164], [213, 198], [212, 198]], P.night0);
    if (cuff) poly([[196, 196], [212, 195], [212, 199], [196, 200]], cuff);
    El(204, 205, 6, 7, skin); El(203, 204, 4, 5, skinHi);
  }
  function armR(sleeve, cuff, skin, skinHi) {
    poly([[290, 164], [308, 164], [302, 200], [286, 198]], sleeve);
    poly([[289, 164], [290, 164], [287, 198], [286, 198]], P.night0);
    if (cuff) poly([[286, 195], [302, 196], [302, 200], [286, 199]], cuff);
    El(294, 205, 6, 7, skin); El(293, 204, 4, 5, skinHi);
  }

  var visitors = {
    scientist: function () {
      // lower half: brown trousers, shirt tucked in, lab coat open to the knee
      legs(P.brown1, P.brown0, 186);
      R(236, 164, 26, 24, P.shirt); R(236, 186, 26, 3, P.night0); R(246, 186, 4, 3, P.plastic2);
      poly([[206, 164], [238, 164], [236, 242], [208, 242]], P.paper);
      poly([[260, 164], [292, 164], [290, 242], [262, 242]], P.paperShade);
      R(237, 164, 1, 78, P.paperShade); R(261, 164, 1, 78, P.paperDark);
      // pens in the coat pocket
      R(214, 198, 16, 12, P.paperShade); R(214, 198, 16, 1, P.paperDark);
      R(217, 193, 2, 6, P.night0); R(221, 194, 2, 5, P.red1); R(225, 193, 2, 6, P.steel);
      // keys on his belt loop
      R(256, 188, 1, 6, P.steel); El(257, 197, 3, 3, P.steel); El(257, 197, 1, 1, P.shirt);
      R(254, 199, 2, 6, P.plastic2); R(258, 200, 2, 5, P.steel); R(256, 200, 1, 7, P.lamp3);
      // the coat starts clean; dull scorch marks appear once the sister has gone up,
      // and more (plus a scuffed knee) once his mother has. Nothing that glows.
      var marks = E.kaneMarks ? E.kaneMarks() : 0;
      if (marks >= 1) {
        poly([[263, 242], [267, 232], [273, 236], [279, 228], [285, 234], [290, 230], [290, 242]], P.brown1);
        D(262, 224, 28, 18, P.brown0, 1);
        R(263, 223, 26, 1, P.fog);
      }
      if (marks >= 2) {
        poly([[208, 242], [211, 234], [216, 238], [221, 231], [226, 242]], P.brown1);
        D(207, 230, 20, 12, P.brown0, 1);
        R(232, 236, 8, 5, P.paperShade); D(232, 236, 8, 5, P.fog, 1);
      }
      // arms down; crumpled notes in his left hand, a cheap watch on his right wrist
      armL(P.paper, P.paperShade, P.skinA1, P.skinA2);
      armR(P.paperShade, null, P.skinA1, P.skinA2);
      if (marks >= 2) {
        // a smear of pink frosting high on the right sleeve, and a scorch near the elbow
        poly([[293, 176], [300, 174], [303, 179], [296, 182]], '#c98a96'); R(295, 177, 5, 1, P.paper); R(298, 180, 2, 1, P.paper);
        D(290, 184, 10, 6, P.brown0, 1); R(291, 186, 5, 2, P.brown1);
      }
      poly([[194, 202], [211, 199], [215, 216], [198, 219]], P.paper);
      R(199, 205, 10, 1, P.paperDark); R(200, 208, 8, 1, P.paperDark); R(200, 211, 11, 1, P.paperDark); R(201, 214, 7, 1, P.red1);
      D(194, 199, 21, 20, P.paperShade, 1);
      El(206, 203, 4, 3, P.skinA1);
      R(287, 197, 13, 4, P.night0); R(290, 198, 6, 2, P.plastic0);

      // upper half
      poly([[190, 170], [200, 112], [222, 100], [276, 100], [298, 112], [308, 170]], P.paperShade);
      poly([[196, 170], [205, 114], [224, 102], [250, 102], [250, 170]], P.paper);
      poly([[236, 102], [262, 102], [256, 150], [242, 150]], P.shirt);
      R(236, 150, 26, 20, P.shirt);
      poly([[246, 104], [252, 104], [254, 138], [250, 144], [245, 138]], P.red0);
      R(252, 104, 2, 6, P.red1);
      R(237, 102, 1, 68, P.paperShade); R(261, 102, 1, 68, P.paperDark);
      // staff badge on the pocket
      R(262, 116, 12, 8, P.paper); R(263, 117, 4, 5, P.paperShade); R(268, 118, 5, 1, P.paperDark);
      // neck and head
      R(240, 88, 18, 16, P.skinA1);
      El(249, 68, 20, 24, P.skinA1); El(246, 66, 17, 21, P.skinA2);
      D(258, 50, 14, 40, P.skinA0, 2);
      [[228, 48, 10, 10], [236, 40, 12, 10], [250, 38, 14, 10], [264, 44, 10, 12], [270, 56, 6, 12], [226, 58, 6, 12]]
        .forEach(function (e) { El(e[0], e[1], e[2], e[3], P.fog); });
      [[232, 42], [246, 34], [262, 38], [274, 50], [222, 52]].forEach(function (e) { R(e[0], e[1], 3, 3, P.paper); });
      El(249, 52, 18, 6, P.fog);
      // glasses, eyes a little too wide
      R(234, 64, 12, 9, P.night0); R(252, 64, 12, 9, P.night0); R(246, 67, 6, 2, P.night0);
      R(236, 66, 8, 5, P.paper); R(254, 66, 8, 5, P.paper);
      if ((S.t % 240) >= 6) { R(239, 67, 3, 3, P.night0); R(257, 67, 3, 3, P.night0); R(240, 67, 1, 1, P.paper); }
      // mouth mid-sentence, stubble
      R(242, 80, 14, 4, P.night0); R(244, 80, 10, 1, P.paper); R(244, 83, 10, 1, P.red0);
      D(236, 78, 26, 10, P.skinA0, 1);
    },

    assassin: function () {
      // lower half: plated legs, segmented waist, a holster with something in it that isn't a gun
      legs(P.night2, P.night1, 188);
      R(216, 214, 28, 10, P.night3); R(254, 214, 26, 10, P.night2); R(220, 218, 12, 1, P.steel);
      torso(P.night3, P.night2, 192);
      for (var k = 0; k < 4; k++) R(208, 172 + k * 5, 82, 1, P.night0);
      R(210, 188, 78, 4, P.night0);
      R(270, 190, 14, 20, P.night1); R(272, 194, 10, 2, P.fut0); R(274, 194, 3, 2, P.fut1);
      armL(P.steel, P.night0, P.night3, P.steel);
      armR(P.night3, P.night0, P.night2, P.night3);
      for (var f = 0; f < 3; f++) { R(199, 206 + f * 3, 10, 1, P.night1); R(289, 206 + f * 3, 10, 1, P.night1); }
      R(197, 176, 1, 18, P.fut0);

      // upper half
      poly([[180, 170], [196, 108], [226, 94], [272, 94], [302, 108], [318, 170]], P.night2);
      poly([[186, 170], [200, 110], [228, 98], [250, 98], [250, 170]], P.night3);
      R(244, 100, 10, 70, P.night0);
      for (var i = 0; i < 4; i++) { R(206, 116 + i * 14, 36, 2, P.night0); R(258, 116 + i * 14, 36, 2, P.night1); }
      R(206, 118, 1, 40, P.fut1); R(292, 118, 1, 40, P.fut0);
      El(214, 104, 16, 10, P.steel); El(284, 104, 16, 10, P.night3);
      R(244, 124, 10, 10, P.fut0); R(246, 126, 6, 6, P.fut1); R(248, 128, 2, 2, P.fut2);
      R(238, 84, 22, 14, P.night1);
      El(249, 58, 24, 28, P.night3); El(245, 55, 20, 24, P.steel); D(258, 40, 18, 44, P.night2, 2);
      R(226, 64, 46, 10, P.night0); R(228, 66, 42, 6, P.fut0); R(230, 67, 38, 3, P.fut1);
      R(240, 68, 6, 1, P.fut2); R(256, 68, 6, 1, P.fut2);
      if (S.t % 40 < 20) D(222, 60, 54, 18, P.fut0, 1);
      R(236, 80, 26, 2, P.night0);
      for (var j = 0; j < 5; j++) R(238 + j * 5, 82, 2, 4, P.night1);
    },

    gent: function () {
      // lower half: pressed wool trousers, waistcoat with a watch chain, a cane and a coin
      legs(P.brown2, P.brown1, 190);
      R(230, 204, 1, 50, P.brown1); R(268, 204, 1, 50, P.brown0);
      poly([[206, 164], [237, 164], [234, 202], [210, 204]], P.brown2);
      poly([[261, 164], [292, 164], [288, 204], [264, 202]], P.brown1);
      poly([[236, 164], [262, 164], [262, 188], [249, 196], [236, 188]], P.brown0);
      R(248, 168, 2, 2, P.lamp3); R(248, 178, 2, 2, P.lamp3);
      R(236, 184, 8, 1, P.night0);
      [[248, 179], [246, 181], [244, 182], [242, 183], [240, 183]].forEach(function (c) { R(c[0], c[1], 2, 1, P.lamp4); });
      El(239, 186, 3, 2, P.lamp3); R(238, 185, 2, 1, P.lamp4);
      armL(P.brown2, P.paper, P.skinB1, P.skinB2);
      armR(P.brown1, P.paper, P.skinB1, P.skinB2);
      // walking cane in his left hand, silver top above the fingers
      R(203, 210, 2, 44, P.night0); El(204, 199, 3, 2, P.fog); R(203, 197, 2, 1, P.paper);
      // a silver dollar between the fingers of his right hand
      El(297, 211, 3, 3, P.fog); R(296, 210, 2, 1, P.paper);

      // upper half
      poly([[188, 170], [200, 110], [226, 98], [272, 98], [298, 110], [310, 170]], P.brown1);
      poly([[194, 170], [204, 112], [228, 100], [249, 100], [249, 170]], P.brown2);
      poly([[236, 100], [262, 100], [262, 170], [236, 170]], P.brown0);
      poly([[240, 100], [258, 100], [249, 122]], P.paper);
      R(246, 104, 6, 4, P.red0);
      [130, 140, 150, 160].forEach(function (y) { R(248, y, 2, 2, P.lamp3); });
      R(240, 86, 18, 16, P.skinB1);
      El(249, 66, 19, 23, P.skinB1); El(246, 65, 16, 20, P.skinB2); D(257, 50, 14, 38, P.skinB0, 2);
      R(238, 64, 6, 3, P.night0); R(254, 64, 6, 3, P.night0); R(239, 64, 2, 1, P.paper); R(255, 64, 2, 1, P.paper);
      R(236, 60, 9, 2, P.night1); R(253, 60, 9, 2, P.night1);
      poly([[238, 78], [249, 74], [260, 78], [256, 81], [249, 78], [242, 81]], P.night1);
      R(244, 83, 10, 1, P.skinB0);
      El(249, 50, 34, 6, P.night1);
      poly([[229, 49], [233, 32], [249, 28], [265, 32], [269, 49]], P.night2);
      R(229, 44, 40, 5, P.night0); D(256, 30, 14, 16, P.night1, 2);
      R(244, 29, 10, 3, P.night1);
    },

    android: function () {
      // lower half: knife-edge creases, jacket buttoned, inspection order on a clipboard
      legs(P.suit2, P.suit1, 190);
      R(231, 198, 1, 56, P.suit0); R(267, 198, 1, 56, P.suit0);
      torso(P.suit2, P.suit1, 198);
      R(249, 164, 1, 34, P.suit0); R(246, 172, 2, 2, P.night0); R(246, 186, 2, 2, P.night0);
      R(214, 182, 14, 1, P.suit0); R(270, 182, 14, 1, P.suit0);
      armL(P.suit2, P.paper, P.skinA1, P.skinA2);
      armR(P.suit1, P.paper, P.skinA1, P.skinA2);
      R(282, 196, 22, 32, P.brown1); R(284, 199, 18, 27, P.paper); R(289, 194, 8, 4, P.steel);
      for (var l = 0; l < 5; l++) R(286, 203 + l * 4, 12 - (l % 2) * 4, 1, P.paperDark);
      R(292, 221, 8, 3, P.red1);
      El(285, 208, 4, 6, P.skinA1); El(284, 207, 2, 4, P.skinA2);

      // upper half
      poly([[188, 170], [200, 110], [226, 98], [272, 98], [298, 110], [310, 170]], P.suit1);
      poly([[194, 170], [204, 112], [228, 100], [249, 100], [249, 170]], P.suit2);
      poly([[240, 100], [258, 100], [256, 170], [242, 170]], P.paper);
      poly([[246, 102], [252, 102], [253, 150], [249, 156], [245, 150]], P.suit0);
      R(268, 120, 16, 12, P.paper); R(270, 122, 6, 7, P.paperShade); R(278, 123, 4, 1, P.paperDark); R(278, 126, 4, 1, P.paperDark);
      R(281, 129, 2, 2, (S.t >> 4) % 3 === 0 ? P.fut1 : P.paperShade);
      R(240, 86, 18, 16, P.skinA1);
      El(249, 66, 18, 22, P.skinA1); El(246, 65, 15, 19, P.skinA2);
      El(249, 48, 18, 8, P.brown0); R(231, 48, 36, 6, P.brown0); R(232, 46, 34, 2, P.brown1);
      R(238, 64, 7, 3, P.night0); R(253, 64, 7, 3, P.night0); R(240, 64, 2, 1, P.paper); R(255, 64, 2, 1, P.paper);
      R(237, 60, 9, 1, P.brown0); R(252, 60, 9, 1, P.brown0);
      R(240, 79, 18, 4, P.night0); R(241, 80, 16, 2, P.paper);
      R(240, 92, 18, 1, P.skinB1);
    },

    pizza: function () {
      // lower half: polo tucked into jeans, grease down the front, pager and change pouch on the belt
      legs(P.steel, P.night3, 190);
      R(230, 204, 1, 50, P.night3);
      torso(P.red1, P.red0, 192);
      El(196, 166, 8, 6, P.red1); El(302, 166, 8, 6, P.red0);
      El(226, 176, 4, 3, P.brown1); El(231, 181, 2, 2, P.brown1); El(270, 172, 3, 2, P.brown0); El(258, 184, 3, 2, P.brown0); R(240, 170, 2, 2, P.wood2);
      R(210, 190, 78, 3, P.night0); R(246, 190, 5, 3, P.steel);
      poly([[212, 192], [234, 192], [232, 208], [214, 208]], P.paperShade); R(212, 192, 22, 1, P.paperDark);
      R(217, 197, 6, 2, P.fog); R(224, 199, 6, 2, P.fog); R(216, 203, 14, 1, P.paperDark);
      R(268, 185, 12, 9, P.night0); R(270, 187, 8, 3, P.crt1); R(277, 192, 2, 1, P.red1);

      // upper half: red work polo, white collar, name tag
      poly([[190, 170], [202, 112], [226, 100], [272, 100], [296, 112], [308, 170]], P.red0);
      poly([[196, 170], [206, 114], [228, 102], [249, 102], [249, 170]], P.red1);
      poly([[238, 100], [260, 100], [249, 112]], P.paper);
      R(266, 114, 12, 5, P.paper); R(268, 116, 8, 1, P.paperDark);
      El(214, 118, 5, 4, P.brown1); El(232, 114, 2, 2, P.brown1);
      // neck and a young, tired face
      R(241, 86, 16, 16, P.skinB1);
      El(249, 68, 18, 22, P.skinB1); El(246, 67, 15, 19, P.skinB2); D(256, 54, 12, 34, P.skinB0, 2);
      R(238, 66, 6, 2, P.night0); R(254, 66, 6, 2, P.night0);
      R(237, 63, 8, 1, P.skinB0); R(253, 63, 8, 1, P.skinB0);
      R(243, 80, 12, 2, P.skinB0);
      // soaked red cap
      El(249, 50, 19, 10, P.red1); R(230, 52, 38, 4, P.red1); El(249, 56, 22, 3, P.red0);
      R(243, 44, 12, 4, P.paper); R(245, 45, 8, 1, P.red0);
      D(232, 42, 34, 14, P.red0, 1);
      // the pizza box, held out over the counter
      poly([[202, 126], [296, 126], [302, 134], [196, 134]], P.card0);
      R(196, 134, 106, 12, P.card1); R(196, 145, 106, 1, P.card0);
      El(222, 139, 4, 2, P.wood2);
      R(274, 136, 16, 8, P.paper); R(276, 138, 11, 1, P.paperDark); R(276, 141, 7, 1, P.paperDark);
      El(198, 141, 6, 5, P.skinB1); El(300, 141, 6, 5, P.skinB1);
    },

    reporter: function () {
      // lower half: navy skirt, blazer buttoned, van keys in her pocket, steno pad in her right hand
      R(222, 234, 20, 20, P.skinA1); R(256, 234, 20, 20, P.skinA0); D(222, 234, 54, 20, P.skinA0, 1);
      poly([[210, 190], [290, 190], [284, 238], [214, 238]], P.night3);
      poly([[249, 190], [290, 190], [284, 238], [249, 238]], P.night2);
      R(249, 222, 1, 16, P.night1);
      torso(P.brown2, P.brown1, 200);
      R(248, 172, 2, 2, P.lamp3); R(248, 186, 2, 2, P.lamp3); R(249, 164, 1, 36, P.brown0);
      El(194, 166, 8, 6, P.brown2);
      R(216, 184, 16, 1, P.brown0);
      R(224, 185, 1, 4, P.steel); R(221, 189, 7, 9, P.red1); R(222, 190, 5, 1, P.paper); R(223, 192, 1, 3, P.paper); R(225, 191, 1, 5, P.paper);
      armR(P.brown1, P.paper, P.skinA1, P.skinA2);
      R(287, 200, 15, 21, P.paper); for (var sp = 0; sp < 7; sp++) R(288 + sp * 2, 199, 1, 2, P.steel);
      R(289, 205, 10, 1, P.paperShade); R(289, 209, 8, 1, P.paperShade); R(289, 213, 10, 1, P.paperShade); R(290, 207, 6, 1, P.night0); R(290, 211, 7, 1, P.night0);
      El(287, 209, 4, 6, P.skinA1); El(286, 208, 2, 4, P.skinA2);

      // upper half: big hair behind the head
      El(249, 56, 28, 20, P.hair0); El(226, 74, 10, 22, P.hair0); El(272, 74, 10, 22, P.hair0);
      // camel blazer with shoulder pads, white blouse
      poly([[184, 170], [192, 106], [224, 98], [274, 98], [306, 106], [314, 170]], P.brown1);
      poly([[190, 170], [196, 108], [226, 100], [249, 100], [249, 170]], P.brown2);
      R(186, 102, 26, 8, P.brown2); R(286, 102, 26, 8, P.brown1);
      poly([[236, 100], [262, 100], [256, 142], [242, 142]], P.paper);
      // press pass
      R(264, 118, 14, 10, P.paper); R(265, 119, 5, 6, P.paperShade); R(271, 120, 6, 1, P.paperDark); R(271, 124, 6, 2, P.red1);
      // neck and face
      R(241, 86, 16, 16, P.skinA1);
      El(249, 68, 18, 22, P.skinA1); El(246, 67, 15, 19, P.skinA2); D(257, 54, 12, 34, P.skinA0, 2);
      El(249, 50, 20, 8, P.hair1); El(236, 56, 6, 8, P.hair1);
      R(238, 65, 6, 3, P.night0); R(254, 65, 6, 3, P.night0); R(239, 65, 2, 1, P.paper); R(255, 65, 2, 1, P.paper);
      R(237, 62, 8, 1, P.hair0); R(253, 62, 8, 1, P.hair0);
      R(243, 79, 12, 3, P.red1);
      R(229, 78, 2, 4, P.lamp4); R(268, 78, 2, 4, P.lamp4);
      // microphone with the station flag
      El(214, 138, 6, 5, P.skinA1);
      R(212, 108, 4, 28, P.night0);
      El(214, 102, 5, 6, P.steel); D(209, 96, 10, 12, P.night0, 1);
      R(206, 110, 16, 10, P.paper); R(206, 110, 16, 2, P.red1);
      digits(g, '7', 213, 113, P.red1);
    }
  };

  /* ---------- inspection close-ups (32x24, scaled up in the zoom panel) ---------- */
  function fill(z, x, y, w, h, col) { z.fillStyle = col; z.fillRect(x, y, w, h); }
  var zooms = {
    ammo: function (z) {
      fill(z, 0, 0, 32, 24, P.brown0);
      fill(z, 3, 4, 16, 12, P.red0); fill(z, 3, 4, 16, 1, P.red1); fill(z, 6, 8, 10, 3, P.paperShade);
      for (var i = 0; i < 4; i++) { fill(z, 21 + (i % 2) * 5, 3 + (i >> 1) * 10, 3, 8, P.lamp3); fill(z, 21 + (i % 2) * 5, 3 + (i >> 1) * 10, 3, 2, P.lamp4); }
      fill(z, 4, 18, 14, 4, P.lamp3); fill(z, 4, 18, 14, 1, P.lamp4);
    },
    lamp: function (z) {
      fill(z, 0, 0, 32, 24, P.night1);
      fill(z, 6, 0, 22, 10, P.lamp3); fill(z, 2, 12, 28, 12, P.wood2);
      var s = g; g = z;
      poly([[8, 3], [24, 2], [22, 10], [10, 11]], P.night2);
      g = s;
      fill(z, 11, 10, 10, 2, P.lamp4); fill(z, 14, 12, 4, 2, P.paper);
      fill(z, 21, 10, 2, 10, P.night3); fill(z, 15, 20, 12, 3, P.night3); fill(z, 15, 20, 12, 1, P.steel);
    },
    // Adam's call: a plain black digital watch, no future colour; 12.03.40 reads as 2240 on a replay
    watch: function (z) {
      fill(z, 0, 0, 32, 24, P.night1);
      fill(z, 0, 9, 32, 7, P.skinA1);
      fill(z, 0, 6, 32, 12, P.night0);
      fill(z, 1, 8, 30, 8, P.plastic1);
      digits(z, '12.03.40', 3, 9, P.night0);
    },
    coat: function (z) {
      var m = E.kaneMarks ? E.kaneMarks() : 1;
      fill(z, 0, 0, 32, 24, P.paper);
      fill(z, 0, 9, 32, 1, P.fog);
      for (var i = 1; i < 32; i += 4) fill(z, i, 10, 2, 1, P.paperShade);
      var s = g; g = z; poly([[4, 24], [10, 15], [16, 19], [24, 13], [30, 24]], P.brown1);
      if (m >= 2) { poly([[0, 24], [2, 18], [6, 21], [9, 24]], P.brown0); poly([[18, 24], [22, 17], [27, 20], [32, 16], [32, 24]], P.brown0); fill(z, 12, 3, 9, 4, P.paperShade); fill(z, 13, 4, 2, 1, P.paperDark); fill(z, 17, 5, 3, 1, P.paperDark); }
      g = s;
    },
    kaneSleeve: function (z) {
      fill(z, 0, 0, 32, 24, P.paperShade);
      for (var i = 0; i < 24; i += 3) fill(z, 0, i, 32, 1, P.paper);
      fill(z, 0, 18, 32, 6, P.night0); fill(z, 0, 18, 32, 1, P.paperDark);
      var s = g; g = z;
      poly([[6, 6], [19, 3], [25, 9], [12, 13]], '#c98a96');
      fill(z, 9, 6, 9, 2, P.paper); fill(z, 15, 9, 6, 1, P.paper); fill(z, 20, 6, 2, 2, '#e8b8c0');
      poly([[22, 13], [28, 11], [31, 16], [24, 17]], P.brown1);
      g = s;
    },
    badge: function (z) {
      fill(z, 0, 0, 32, 24, P.night1);
      fill(z, 3, 3, 26, 18, P.paper);
      fill(z, 5, 5, 8, 10, P.paperShade);
      fill(z, 7, 7, 4, 5, P.skinA1);
      fill(z, 15, 6, 12, 1, P.paperDark); fill(z, 15, 9, 9, 1, P.paperDark);
      fill(z, 15, 14, 12, 3, P.red1);
    },
    visor: function (z) {
      fill(z, 0, 0, 32, 24, P.night1);
      fill(z, 0, 6, 32, 12, P.night0);
      fill(z, 2, 8, 28, 8, P.fut0);
      fill(z, 4, 10, 24, 4, P.fut1);
      fill(z, 10, 11, 4, 1, P.fut2); fill(z, 20, 11, 4, 1, P.fut2);
    },
    core: function (z) {
      fill(z, 0, 0, 32, 24, P.night2);
      fill(z, 0, 4, 32, 2, P.night0); fill(z, 0, 18, 32, 2, P.night0);
      fill(z, 10, 6, 12, 12, P.fut0);
      fill(z, 12, 8, 8, 8, P.fut1);
      fill(z, 15, 11, 2, 2, P.fut2);
    },
    pocketwatch: function (z) {
      fill(z, 0, 0, 32, 24, P.night1);
      fill(z, 8, 4, 16, 16, P.lamp3); fill(z, 14, 0, 4, 4, P.lamp3);
      fill(z, 10, 6, 12, 12, P.lamp4);
      fill(z, 12, 8, 8, 8, P.paper);
      fill(z, 15, 9, 1, 4, P.night0); fill(z, 15, 12, 3, 1, P.night0);
    },
    badgeHolo: function (z) {
      zooms.badge(z);
      fill(z, 20, 14, 6, 6, P.fut0); fill(z, 21, 15, 3, 3, P.fut1);
    },
    seam: function (z) {
      fill(z, 0, 0, 32, 24, P.skinA1);
      fill(z, 0, 0, 32, 6, P.paper); fill(z, 0, 6, 32, 1, P.paperShade);
      fill(z, 0, 14, 32, 1, P.skinB1); fill(z, 0, 15, 32, 1, P.skinA2);
    },
    receipt: function (z) {
      fill(z, 0, 0, 32, 24, P.card1);
      fill(z, 3, 3, 26, 18, P.paper);
      digits(z, '10.13', 6, 6, P.paperDark);
      digits(z, '14.95', 6, 13, P.night0);
    },
    cap: function (z) {
      fill(z, 0, 0, 32, 24, P.red1);
      fill(z, 0, 18, 32, 6, P.red0);
      fill(z, 6, 7, 20, 7, P.paper);
      fill(z, 8, 9, 3, 3, P.red1); fill(z, 13, 9, 3, 3, P.red1); fill(z, 18, 9, 3, 3, P.red1); fill(z, 23, 9, 1, 3, P.red1);
      for (var i = 0; i < 32; i += 3) fill(z, i, 2 + (i % 2), 1, 2, P.red0);
    },
    press: function (z) {
      fill(z, 0, 0, 32, 24, P.brown1);
      fill(z, 3, 3, 26, 18, P.paper);
      fill(z, 5, 5, 8, 10, P.paperShade); fill(z, 7, 7, 4, 5, P.skinA1); fill(z, 6, 5, 6, 3, P.hair0);
      fill(z, 15, 5, 12, 3, P.red1);
      fill(z, 15, 10, 10, 1, P.paperDark); fill(z, 15, 13, 8, 1, P.paperDark);
      digits(z, '7', 23, 15, P.red1);
    },
    mic: function (z) {
      fill(z, 0, 0, 32, 24, P.night1);
      fill(z, 14, 0, 4, 24, P.night0);
      fill(z, 6, 6, 20, 12, P.paper); fill(z, 6, 6, 20, 2, P.red1);
      digits(z, '7', 15, 10, P.red1);
      fill(z, 8, 16, 2, 1, P.paperShade); fill(z, 20, 9, 3, 1, P.paperShade);
    },
    notes: function (z) {
      fill(z, 0, 0, 32, 24, P.paperShade);
      fill(z, 2, 1, 28, 22, P.paper);
      [[4, 4, 18], [4, 7, 22], [6, 10, 14], [4, 13, 20], [4, 16, 16]].forEach(function (l) { fill(z, l[0], l[1], l[2], 1, P.paperDark); });
      fill(z, 4, 19, 22, 1, P.night0); fill(z, 4, 20, 22, 1, P.red1); fill(z, 4, 21, 22, 1, P.red1);
      fill(z, 22, 3, 6, 4, P.brown2); fill(z, 23, 4, 4, 2, P.paperShade);
    },
    keys: function (z) {
      fill(z, 0, 0, 32, 24, P.shirt);
      fill(z, 12, 2, 8, 1, P.steel); fill(z, 11, 3, 1, 5, P.steel); fill(z, 20, 3, 1, 5, P.steel); fill(z, 12, 8, 8, 1, P.steel);
      fill(z, 8, 9, 4, 13, P.plastic2); fill(z, 9, 18, 2, 4, P.night0);
      fill(z, 14, 9, 3, 12, P.steel); fill(z, 17, 12, 2, 1, P.steel); fill(z, 17, 15, 2, 1, P.steel);
      fill(z, 21, 9, 7, 9, P.lamp3); digits(z, '4', 23, 11, P.night0);
    },
    holster: function (z) {
      fill(z, 0, 0, 32, 24, P.night2);
      fill(z, 0, 3, 32, 3, P.night0);
      fill(z, 8, 6, 16, 18, P.night1); fill(z, 8, 6, 16, 1, P.night3);
      fill(z, 11, 10, 10, 3, P.fut0); fill(z, 13, 11, 4, 1, P.fut1);
      fill(z, 11, 16, 10, 1, P.night0); fill(z, 11, 19, 10, 1, P.night0);
    },
    gloves: function (z) {
      fill(z, 0, 0, 32, 24, P.night0);
      fill(z, 6, 2, 20, 8, P.night2);
      for (var i = 0; i < 4; i++) { fill(z, 6 + i * 5, 10, 4, 12, P.night3); fill(z, 6 + i * 5, 14, 4, 1, P.night1); fill(z, 6 + i * 5, 18, 4, 1, P.night1); }
      fill(z, 6, 6, 20, 1, P.fut0);
    },
    collar: function (z) {
      fill(z, 0, 0, 32, 24, P.skinB1);
      fill(z, 0, 14, 32, 10, P.brown0);
      var s = g; g = z; poly([[4, 6], [15, 10], [17, 10], [28, 6], [28, 16], [17, 13], [15, 13], [4, 16]], P.paper); g = s;
      fill(z, 15, 10, 2, 3, P.lamp3);
      fill(z, 13, 13, 6, 6, P.red0); fill(z, 15, 19, 2, 5, P.red0);
    },
    cane: function (z) {
      fill(z, 0, 0, 32, 24, P.skinB1);
      fill(z, 0, 14, 32, 10, P.skinB2);
      fill(z, 10, 2, 12, 9, P.fog); fill(z, 12, 0, 8, 2, P.fog); fill(z, 11, 3, 2, 5, P.paper);
      fill(z, 14, 4, 1, 4, P.night1); fill(z, 17, 4, 1, 4, P.night1); fill(z, 15, 6, 2, 1, P.night1);
      fill(z, 13, 11, 6, 13, P.night0);
    },
    coin: function (z) {
      fill(z, 0, 0, 32, 24, P.skinB1);
      var s = g; g = z; El(16, 12, 10, 10, P.fog); El(16, 12, 8, 8, P.paperShade); El(14, 10, 3, 3, P.paper); g = s;
      digits(z, '1922', 9, 15, P.night1);
    },
    grease: function (z) {
      fill(z, 0, 0, 32, 24, P.red1);
      for (var i = 0; i < 32; i += 4) fill(z, i, 0, 1, 24, P.red0);
      var s = g; g = z; El(9, 8, 5, 4, P.brown1); El(11, 9, 2, 2, P.wood2); El(22, 16, 4, 3, P.brown1); El(26, 5, 2, 2, P.brown0); g = s;
    },
    pager: function (z) {
      fill(z, 0, 0, 32, 24, P.steel);
      fill(z, 0, 20, 32, 4, P.night0);
      fill(z, 3, 3, 26, 17, P.night0);
      fill(z, 5, 5, 22, 8, P.crt1);
      digits(z, '5550142', 6, 7, P.crt0);
      fill(z, 6, 15, 4, 2, P.night3); fill(z, 12, 15, 4, 2, P.night3); fill(z, 24, 15, 2, 2, P.red1);
    },
    apron: function (z) {
      fill(z, 0, 0, 32, 24, P.paperShade);
      fill(z, 0, 0, 32, 3, P.night0);
      for (var i = 0; i < 4; i++) { var s = g; g = z; El(7 + i * 6, 12, 3, 3, P.fog); El(6 + i * 6, 11, 1, 1, P.paper); g = s; }
      fill(z, 4, 18, 22, 4, P.plastic0); fill(z, 6, 19, 18, 1, P.plastic2);
    },
    order: function (z) {
      fill(z, 0, 0, 32, 24, P.brown1);
      fill(z, 2, 2, 28, 22, P.paper);
      digits(z, '13.10', 4, 4, P.night0);
      fill(z, 4, 11, 22, 1, P.paperDark); fill(z, 4, 14, 18, 1, P.paperDark); fill(z, 4, 17, 20, 1, P.paperDark);
      fill(z, 22, 18, 6, 4, P.red1);
    },
    hands: function (z) {
      fill(z, 0, 0, 32, 24, P.suit2);
      fill(z, 0, 0, 32, 5, P.paper);
      fill(z, 5, 5, 22, 9, P.skinA2);
      for (var i = 0; i < 4; i++) fill(z, 5 + i * 6, 14, 4, 9, P.skinA2);
      for (var j = 0; j < 4; j++) fill(z, 6 + j * 6, 21, 2, 1, P.paper);
    },
    trousers: function (z) {
      fill(z, 0, 0, 32, 24, P.suit2);
      fill(z, 16, 0, 16, 24, P.suit1);
      fill(z, 9, 0, 1, 24, P.suit0); fill(z, 24, 0, 1, 24, P.suit0);
      fill(z, 10, 0, 1, 24, P.fog);
    },
    steno: function (z) {
      fill(z, 0, 0, 32, 24, P.skinA1);
      fill(z, 3, 2, 26, 22, P.paper);
      for (var i = 0; i < 12; i++) fill(z, 4 + i * 2, 1, 1, 3, P.steel);
      digits(z, '9.40', 5, 6, P.night0);
      digits(z, '10.15', 5, 12, P.night0);
      digits(z, '10.52', 5, 18, P.red1);
    },
    vankeys: function (z) {
      fill(z, 0, 0, 32, 24, P.brown2);
      fill(z, 0, 0, 32, 4, P.brown0);
      fill(z, 14, 4, 2, 4, P.steel);
      fill(z, 9, 8, 14, 14, P.red1); fill(z, 10, 9, 12, 2, P.paper);
      digits(z, '7', 14, 13, P.paper);
      fill(z, 22, 6, 6, 2, P.steel); fill(z, 26, 8, 2, 8, P.steel);
    },
    hat: function (z) {
      fill(z, 0, 0, 32, 24, P.night1);
      fill(z, 2, 14, 28, 4, P.night1); fill(z, 8, 4, 16, 11, P.night2); fill(z, 8, 11, 16, 2, P.night0);
      fill(z, 26, 0, 1, 24, P.night3); fill(z, 28, 4, 1, 20, P.night3);
    }
  };

  /* ---------- the flash: three tones, then a stepped fade ---------- */
  var FL = [[11, 13, 20], [141, 151, 176], [238, 244, 255]];
  var FLASH_STEPS = [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.5, 0.25, 0.12];
  function posterize() {
    var im = g.getImageData(0, 0, W, H), a = im.data;
    for (var i = 0; i < a.length; i += 4) {
      var l = 0.3 * a[i] + 0.59 * a[i + 1] + 0.11 * a[i + 2];
      var k = l > 95 ? 2 : l > 45 ? 1 : 0;
      a[i] = FL[k][0]; a[i + 1] = FL[k][1]; a[i + 2] = FL[k][2];
    }
    g.putImageData(im, 0, 0);
  }

  /* ---------- frame ---------- */
  function render(ctx, now) {
    g = ctx;
    if (!S.still) S.t++;

    if (S.move) {
      var m = S.move, p = Math.min(1, (now - m.start) / m.ms);
      var v = Math.round((m.from + (m.to - m.from) * p) / 2) * 2;   // whole 2px steps
      if (m.axis === 'x') S.vx = v; else S.vy = v;
      if (p >= 1) { var done = m.done; S.move = null; if (done) done(); }
    }

    room();
    lobbyFloor();
    if (S.visitor && visitors[S.visitor]) {
      g.save();
      g.beginPath(); g.rect(WINDOW.x, WINDOW.y, WINDOW.w, WINDOW.h); g.rect(CUT.x, CUT.y, CUT.w, CUT.h); g.clip();
      g.translate(OX + S.vx, OY + S.vy);
      visitors[S.visitor]();
      g.restore();
    }
    counterAndDesk();
    leftBag();
    cutFrame();

    if (S.flashT >= 0) {
      var idx = S.flashReverse ? FLASH_STEPS.length - 1 - S.flashT : S.flashT;
      if (S.flashT >= FLASH_STEPS.length) { S.flashT = -1; }
      else {
        if (idx < 14) posterize();
        var a = FLASH_STEPS[idx];
        if (a) { g.globalAlpha = a; R(0, 0, W, H, P.flash); g.globalAlpha = 1; }
        S.flashSub = (S.flashSub || 0) + 1;
        if (S.flashSub % 3 === 0) S.flashT++;   // ~20 steps a second
      }
    }
  }

  E.art = {
    P: P, W: W, H: H, WINDOW: WINDOW, CUT: CUT, OX: OX, OY: OY,
    // where a visitor can be seen and clicked: the lobby plus the cut-out
    VIEW: { x: 0, y: 0, w: 480, h: CUT.y + CUT.h },
    inView: function (p) { return p.y < WINDOW.h || (p.x >= CUT.x && p.x < CUT.x + CUT.w && p.y < CUT.y + CUT.h); },
    state: S,
    visitors: visitors,
    zooms: zooms,
    digits: digits,
    render: render,
    // where people come in from and leave to (x offsets for the walk)
    enterFrom: -170, exitTo: 240, fallTo: 110,
    // clickable desk props, native coordinates
    props: [
      { id: 'list', x: 320, y: 184, w: 50, h: 60, label: 'Visitor list' },
      { id: 'notebook', x: 426, y: 192, w: 42, h: 30, label: "Guard's notebook" },
      { id: 'radio', x: 370, y: 192, w: 46, h: 28, label: 'Desk radio' },
      { id: 'lamp', x: 155, y: 180, w: 25, h: 60, label: 'Desk lamp' },
      { id: 'bag', x: 126, y: 148, w: 19, h: 22, label: 'Lunch bag', when: function () {
        var f = E.game && E.game.run && E.game.run.flags; return !!(f && f.sisterBag && !f.bagTaken); } }
    ],
    // what you can click inside the open drawer (native coordinates, fully open)
    drawerProps: function () {
      var hasDev = !!(E.game && E.game.run && E.game.run.flags && E.game.run.flags.hasDevice);
      var gx = 320 + (hasDev ? 40 : 34);
      var out = [{ id: 'gun', x: gx - 4, y: 212, w: 84, h: 26 }];
      if (hasDev) out.push({ id: 'device', x: 331, y: 217, w: 18, h: 24 });
      out.push({ id: 'ammo', x: 442, y: 214, w: 24, h: 30 });   // the box of shells
      if (E.game.run.flags.posterInDrawer) out.push({ id: 'poster', x: gx + 25, y: 228, w: 47, h: 14 });   // below the barrel
      return out;
    },
    /**
     * Drawing kit for visitor files outside art.js. Use these inside a
     * visitors[id] draw function (they draw on the frame being rendered), or
     * wrap them in kit.on(z, fn) to draw on a 32x24 zoom canvas.
     */
    kit: {
      P: P, S: S,
      R: function (x, y, w, h, c) { R(x, y, w, h, c); },
      El: function (cx, cy, rx, ry, c) { El(cx, cy, rx, ry, c); },
      poly: function (pts, c) { poly(pts, c); },
      D: function (x, y, w, h, c, d, oval) { D(x, y, w, h, c, d, oval); },
      text: function (str, x, y, c, size, font) { text(str, x, y, c, size, font); },
      digits: function (str, x, y, c) { digits(g, str, x, y, c); },
      legs: function (L, Dk, top) { legs(L, Dk, top); },
      torso: function (L, Dk, hem) { torso(L, Dk, hem); },
      armL: function (sleeve, cuff, skin, skinHi) { armL(sleeve, cuff, skin, skinHi); },
      armR: function (sleeve, cuff, skin, skinHi) { armR(sleeve, cuff, skin, skinHi); },
      fill: function (z, x, y, w, h, c) { fill(z, x, y, w, h, c); },
      on: function (z, fn) { var keep = g; g = z; try { fn(); } finally { g = keep; } }
    },
    /** Wrap a PNG authored at 1x on the visitor frame as a draw function. */
    sprite: function (src, x, y) {
      var img = new Image(); img.src = src;
      return function () { if (img.complete) g.drawImage(img, x || 180, y || 30); };
    }
  };
})();
