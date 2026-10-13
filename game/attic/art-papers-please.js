/*
 * Emit Time — pixel renderer (placeholder art in the agreed style).
 *
 * Follows /mnt/project-files/art/style-guide.md: one 480x270 canvas scaled by
 * whole numbers with nearest-neighbour, Papers, Please split (outside strip on
 * top, booth window bottom-left, desk bottom-right), flat 2-3 tone shading,
 * palette v2, future cyan only on things from the future.
 *
 * Swapping art: each visitor is a draw function in EMIT.art.visitors, authored
 * around x≈249 / head at y≈60 (the mockup's frame) and offset into the booth.
 * A PNG sprite can replace one later:  EMIT.art.visitors.kane = EMIT.art.sprite('art/kane.png');
 */
(function () {
  'use strict';
  var E = (window.EMIT = window.EMIT || {});

  // palette v2, copied from art/palette.json
  var P = {
    night0: '#101114', night1: '#1d1e22', night2: '#2c2d31', night3: '#43443f', steel: '#5f6058', fog: '#8c8b7d',
    wood0: '#2b2519', wood1: '#3e3624', wood2: '#574c33', wood3: '#74663f', lamp3: '#a88a52', lamp4: '#d8be84',
    paper: '#cfc6a8', paperShade: '#a49c80', paperDark: '#605a48',
    plastic0: '#57534a', plastic1: '#7f796a', plastic2: '#a8a08a',
    skinA0: '#563a2e', skinA1: '#8e6450', skinA2: '#bd9074',
    skinB0: '#3a271e', skinB1: '#634434', skinB2: '#8c6650',
    brown0: '#2b2420', brown1: '#463a30', brown2: '#67574a',
    suit0: '#2a2e2c', suit1: '#3f4541', suit2: '#5a615b',
    crt0: '#13241a', crt1: '#3d7a52', crt2: '#8fd0a0',
    red0: '#5a2222', red1: '#9a3a32', green1: '#4d6b3a',
    fut0: '#2a6a78', fut1: '#58c8dc', fut2: '#b6eaf0',
    flash: '#eef0e8'
  };

  var W = 480, H = 270;
  var WINDOW = { x: 4, y: 69, w: 200, h: 127 };   // booth glass, visitors are clipped to it
  var OX = -145, OY = 42;                          // authored visitor frame -> booth window
  var g = null;                                    // current 2d context

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
    visitor: null, vx: 0, vy: 0, move: null,   // move: { from, to, axis, start, ms, done }
    blood: false,
    flashT: -1, flashReverse: false,
    drawerOpen: false,
    clock: '10:14 PM', date: 'OCT 13', loop: 1,
    crt: ['CAM 01 LOBBY', '> REC', ''],
    tally: 0, tallyFreshAt: -1,
    hasList: false, hover: null, still: false,
    radio: { on: false, index: 0 }
  };
  var rain = [], queue = [{ x: 150, u: true }, { x: 172, u: false }, { x: 192, u: true }];
  for (var i = 0; i < 60; i++) rain.push({ x: Math.random() * 480, y: Math.random() * 60, s: 2 + Math.random() * 2 });

  /* ---------- outside strip (y 0-64) ---------- */
  function exterior() {
    R(0, 0, 480, 64, P.night1);
    for (var i = 0; i < 14; i++) { var h = 10 + ((i * 29) % 18); R(i * 22, 46 - h, 18, h, P.night2); }
    R(300, 6, 180, 52, P.night2); R(300, 6, 180, 2, P.night3);
    for (var r = 0; r < 3; r++) for (var q = 0; q < 7; q++) {
      var lit = ((r * 7 + q) * 13) % 5 === 0;
      R(306 + q * 24, 14 + r * 12, 12, 6, lit ? P.lamp3 : P.night1);
    }
    R(326, 38, 30, 20, P.night0); R(340, 38, 1, 20, P.steel); R(324, 36, 34, 2, P.steel);
    text('SCIENCE CORP', 372, 52, P.fog, 6, 'Silkscreen, monospace');
    R(40, 14, 2, 44, P.steel); R(36, 12, 12, 3, P.steel); R(38, 15, 8, 1, P.lamp4);
    R(0, 56, 480, 8, P.night3); R(0, 56, 480, 1, P.steel);
    R(34, 58, 16, 1, P.lamp3); R(30, 61, 24, 1, P.wood2); R(328, 59, 26, 1, P.night1);
    queue.forEach(function (qq) {
      var x = (qq.x + S.t * 0.05) % 300;
      R(x, 40, 6, 16, P.night0); El(x + 3, 37, 3, 3, P.night0);
      if (qq.u) { poly([[x - 6, 32], [x + 12, 32], [x + 3, 26]], P.night0); R(x + 3, 32, 1, 6, P.night0); }
    });
    rain.forEach(function (d) {
      if (!S.still) { d.y += d.s * 0.6; d.x -= 0.3; if (d.y > 58) { d.y = 0; d.x = Math.random() * 490; } }
      R(d.x, d.y, 1, 2, P.steel);
    });
    R(0, 64, 480, 2, P.night0);
  }

  /* ---------- booth window (x 0-208) ---------- */
  function boothBack() {
    R(0, 66, 208, 190, P.night2);
    R(0, 150, 208, 40, P.night3); R(0, 150, 208, 1, P.steel);
    R(16, 82, 30, 38, P.paperShade); R(18, 84, 26, 6, P.red1);
    for (var i = 0; i < 5; i++) R(20, 94 + i * 5, 22 - (i * 5) % 9, 1, P.paperDark);
    R(170, 88, 22, 22, P.night1); R(172, 90, 18, 18, P.paperShade); R(181, 92, 1, 8, P.night0); R(181, 99, 5, 1, P.night0);
  }
  function boothFront() {
    if (S.blood) {
      poly([[60, 150], [96, 140], [120, 160], [110, 196], [70, 196], [52, 176]], P.red0);
      R(84, 150, 3, 30, P.red0); R(100, 160, 2, 24, P.red0); R(66, 170, 2, 20, P.red0);
    }
    R(0, 66, 4, 146, P.steel); R(204, 66, 4, 146, P.steel); R(0, 66, 208, 3, P.steel);
    poly([[20, 69], [30, 69], [4, 110], [4, 94]], 'rgba(140,139,125,.10)');
    poly([[150, 69], [156, 69], [110, 140], [104, 140]], 'rgba(140,139,125,.07)');
    R(0, 196, 208, 14, P.wood2); R(0, 196, 208, 2, P.wood3); R(70, 200, 68, 8, P.wood0); R(72, 200, 64, 2, P.night0);
    R(0, 210, 208, 60, P.night1); R(0, 210, 208, 1, P.night0);
    // the date and clock under the window are HTML (#clock-text)
  }

  /* ---------- desk (x 208-480) ---------- */
  function desk() {
    R(208, 66, 272, 204, P.wood1);
    for (var y = 72; y < 270; y += 12) R(208, y, 272, 1, P.wood0);
    El(440, 150, 70, 60, P.wood2); El(446, 132, 38, 32, P.wood3);
    R(436, 66, 30, 4, P.night0); R(448, 70, 4, 20, P.night3);
    poly([[434, 90], [468, 90], [462, 104], [440, 104]], P.night3); R(440, 104, 22, 2, P.lamp4);

    // transcript printout sits at (214,70); its paper is drawn here, text is HTML
    R(216, 72, 130, 60, P.night0); R(214, 70, 130, 60, P.paper);

    // CRT with the loop counter and camera feed
    R(350, 70, 72, 52, P.plastic1); R(352, 72, 68, 48, P.plastic2); R(356, 76, 60, 38, P.night0); R(357, 77, 58, 36, P.crt0);
    // CRT text is HTML (#crt-text) so it stays crisp; scanlines are drawn over it in CSS
    R(412, 116, 4, 2, P.crt2);

    // clipboard visitor list (clickable)
    var hl = S.hover === 'list';
    R(216, 142, 64, 122, hl ? P.brown2 : P.brown1); R(220, 148, 56, 112, P.paper); R(238, 138, 20, 8, P.steel);
    R(224, 152, 48, 4, P.paperDark);
    if (S.hasList) {
      for (var li = 0; li < 6; li++) { R(224, 162 + li * 9, 26 + (li * 11) % 14, 1, P.paperDark); R(258, 162 + li * 9, 14, 1, P.paperShade); }
      R(224, 238, 30, 1, P.paperDark); R(250, 234, 18, 6, P.red1);
    } else {
      text('NO LIST', 226, 172, P.paperShade, 8);
    }

    // question pad (HTML text sits on it)
    R(290, 136, 136, 96, P.night0); R(288, 134, 136, 96, P.paper);
    R(288, 134, 136, 8, P.paperShade);
    for (var pl = 150; pl < 228; pl += 9) R(292, pl, 128, 1, P.paperShade);
    R(298, 134, 1, 96, P.red1);

    // desk radio (clickable): dial lights up when it's on, needle shows the station
    var hr = S.hover === 'radio', on = S.radio && S.radio.on;
    R(430, 114, 46, 30, P.night0); R(428, 112, 46, 30, hr ? P.plastic2 : P.plastic1);
    R(428, 112, 46, 2, P.plastic2);
    R(431, 116, 40, 10, on ? P.lamp3 : P.plastic0);
    if (on) { var nx = 432 + Math.round(36 * S.radio.index / 5); R(nx, 116, 1, 10, P.red1); }
    for (var gx = 0; gx < 6; gx++) R(432 + gx * 4, 130, 2, 9, P.plastic0);
    El(463, 134, 5, 5, P.plastic0); El(463, 134, 2, 2, on ? P.lamp4 : P.plastic2);

    // phone
    R(432, 150, 44, 28, P.plastic1); R(434, 146, 40, 8, P.plastic2); R(436, 156, 26, 18, P.plastic0);
    for (var r = 0; r < 3; r++) for (var q = 0; q < 3; q++) R(439 + q * 8, 158 + r * 5, 5, 3, P.plastic2);
    R(466, 158, 6, 12, P.red1);

    // guard's notebook (clickable)
    var hn = S.hover === 'notebook';
    R(434, 188, 40, 30, P.night0); R(432, 186, 40, 30, hn ? P.red1 : P.red0);
    R(436, 186, 2, 30, P.brown0); text('NOTES', 442, 204, P.paperShade, 6, 'Silkscreen, monospace');

    // tally scratched into the desk, one mark per reset
    tally(434, 226);

    // the revolver drawer under the action stamps
    R(288, 254, 136, 16, P.wood0); R(288, 254, 136, 1, P.wood3);
    if (S.drawerOpen) {
      R(300, 246, 112, 10, P.night0);
      R(316, 248, 34, 4, P.steel); R(346, 248, 8, 7, P.brown1); R(330, 247, 6, 6, P.night3);
    }
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
  var visitors = {
    scientist: function () {
      poly([[190, 170], [200, 112], [222, 100], [276, 100], [298, 112], [308, 170]], P.paperShade);
      poly([[196, 170], [205, 114], [224, 102], [250, 102], [250, 170]], P.paper);
      poly([[236, 102], [262, 102], [256, 150], [242, 150]], P.suit1);
      poly([[246, 104], [252, 104], [254, 138], [250, 144], [245, 138]], P.red0);
      // dull burn marks at the hem, and one neat seam: easy to miss
      poly([[272, 160], [280, 150], [288, 156], [296, 150], [300, 170], [270, 170]], P.brown1);
      R(282, 156, 3, 2, P.brown0);
      R(270, 148, 26, 1, P.fog);
      // staff badge clipped to the pocket
      R(262, 116, 12, 8, P.paper); R(263, 117, 4, 5, P.paperShade); R(268, 118, 5, 1, P.paperDark);
      // raised hand with a cheap black digital watch
      poly([[204, 170], [198, 140], [214, 118], [228, 124], [214, 146], [218, 170]], P.paperShade);
      El(220, 124, 7, 6, P.skinA1); El(219, 123, 5, 4, P.skinA2);
      R(212, 128, 14, 6, P.night0); R(215, 129, 8, 4, P.plastic1); R(216, 130, 6, 2, P.plastic2);
      // head
      R(240, 88, 18, 16, P.skinA1); R(252, 88, 6, 16, P.skinA0);
      El(249, 68, 20, 24, P.skinA0); El(247, 69, 18, 23, P.skinA1); El(244, 67, 13, 18, P.skinA2);
      [[228, 48, 10, 10], [236, 40, 12, 10], [250, 38, 14, 10], [264, 44, 10, 12], [270, 56, 6, 12], [226, 58, 6, 12]]
        .forEach(function (e) { El(e[0], e[1], e[2], e[3], P.steel); });
      [[232, 44, 6, 5], [244, 38, 8, 5], [226, 54, 4, 5]].forEach(function (e) { El(e[0], e[1], e[2], e[3], P.fog); });
      El(249, 52, 18, 6, P.steel);
      R(234, 64, 12, 9, P.night0); R(252, 64, 12, 9, P.night0); R(246, 67, 6, 2, P.night0);
      R(236, 66, 8, 5, P.paper); R(254, 66, 8, 5, P.paper);
      var blink = (S.t % 240) < 6;
      if (!blink) { R(239, 67, 3, 3, P.night0); R(257, 67, 3, 3, P.night0); }
      R(242, 80, 14, 4, P.night0); R(244, 80, 10, 1, P.paper);
    },

    assassin: function () {
      poly([[180, 170], [196, 108], [226, 94], [272, 94], [302, 108], [318, 170]], P.night2);
      poly([[186, 170], [200, 110], [228, 98], [250, 98], [250, 170]], P.night3);
      R(244, 100, 10, 70, P.night0);
      for (var i = 0; i < 4; i++) { R(206, 116 + i * 14, 36, 2, P.night0); R(258, 116 + i * 14, 36, 2, P.night1); }
      R(206, 118, 1, 40, P.fut1); R(292, 118, 1, 40, P.fut0);
      El(214, 104, 16, 10, P.steel); El(284, 104, 16, 10, P.night3);
      R(244, 124, 10, 10, P.fut0); R(246, 126, 6, 6, P.fut1); R(248, 128, 2, 2, P.fut2);
      R(238, 84, 22, 14, P.night1);
      El(249, 58, 24, 28, P.night2); El(245, 55, 20, 24, P.night3); El(241, 50, 12, 14, P.steel);
      R(226, 64, 46, 10, P.night0); R(228, 66, 42, 6, P.fut0); R(230, 67, 38, 3, (S.t >> 5) % 2 ? P.fut1 : P.fut2);
      R(236, 80, 26, 2, P.night0);
      for (var j = 0; j < 5; j++) R(238 + j * 5, 82, 2, 4, P.night1);
    },

    // ready for later visitors (from the art mockup)
    gent: function () {
      poly([[188, 170], [200, 110], [226, 98], [272, 98], [298, 110], [310, 170]], P.brown1);
      poly([[194, 170], [204, 112], [228, 100], [249, 100], [249, 170]], P.brown2);
      poly([[236, 100], [262, 100], [260, 170], [238, 170]], P.brown0);
      poly([[240, 100], [258, 100], [249, 122]], P.paper);
      R(246, 104, 6, 4, P.red0);
      [130, 140, 150, 160].forEach(function (y) { R(248, y, 2, 2, P.lamp3); });
      for (var i = 0; i < 10; i++) R(232 + i * 2, 128 + Math.round(Math.sin(i / 3) * 3), 2, 1, P.lamp4);
      El(236, 130, 5, 5, P.lamp3); El(235, 129, 3, 3, P.lamp4);
      R(240, 86, 18, 16, P.skinB1); R(252, 86, 6, 16, P.skinB0);
      El(249, 66, 19, 23, P.skinB0); El(247, 67, 17, 22, P.skinB1); El(244, 65, 12, 17, P.skinB2);
      R(238, 64, 6, 3, P.night0); R(254, 64, 6, 3, P.night0); R(239, 64, 2, 1, P.paper); R(255, 64, 2, 1, P.paper);
      R(236, 60, 9, 2, P.night1); R(253, 60, 9, 2, P.night1);
      poly([[238, 78], [249, 74], [260, 78], [256, 81], [249, 78], [242, 81]], P.night1);
      El(249, 50, 34, 6, P.night1);
      poly([[229, 49], [233, 32], [249, 28], [265, 32], [269, 49]], P.night2);
      poly([[233, 49], [236, 33], [249, 30], [249, 49]], P.night3);
      R(229, 44, 40, 5, P.night0); R(244, 29, 10, 3, P.night1);
    },

    android: function () {
      poly([[188, 170], [200, 110], [226, 98], [272, 98], [298, 110], [310, 170]], P.suit1);
      poly([[194, 170], [204, 112], [228, 100], [249, 100], [249, 170]], P.suit2);
      poly([[240, 100], [258, 100], [256, 170], [242, 170]], P.paper);
      poly([[246, 102], [252, 102], [253, 150], [249, 156], [245, 150]], P.suit0);
      R(268, 120, 16, 12, P.paper); R(270, 122, 6, 7, P.paperShade); R(278, 123, 4, 1, P.paperDark); R(278, 126, 4, 1, P.paperDark);
      R(281, 129, 2, 2, (S.t >> 4) % 3 === 0 ? P.fut1 : P.paperShade);
      R(240, 86, 18, 16, P.skinA1); R(252, 86, 6, 16, P.skinA0);
      El(249, 66, 18, 22, P.skinA0); El(248, 67, 17, 21, P.skinA1); El(245, 65, 12, 17, P.skinA2);
      El(249, 48, 18, 8, P.brown0); R(231, 48, 36, 6, P.brown0); R(232, 46, 34, 2, P.brown1);
      R(238, 64, 7, 3, P.night0); R(253, 64, 7, 3, P.night0); R(240, 64, 2, 1, P.paper); R(255, 64, 2, 1, P.paper);
      R(237, 60, 9, 1, P.brown0); R(252, 60, 9, 1, P.brown0);
      R(240, 79, 18, 4, P.night0); R(241, 80, 16, 2, P.paper);
      R(240, 92, 18, 1, P.skinB1);
    }
  };

  /* ---------- inspection close-ups (32x24, scaled up in the zoom panel) ---------- */
  var zooms = {
    watch: function (z) {
      z.fillStyle = P.night1; z.fillRect(0, 0, 32, 24);
      z.fillStyle = P.skinA1; z.fillRect(0, 9, 32, 7);
      z.fillStyle = P.night0; z.fillRect(0, 6, 32, 12);
      z.fillStyle = P.plastic1; z.fillRect(1, 8, 30, 8);
      digits(z, '12.03.40', 3, 9, P.night0);
    },
    coat: function (z) {
      z.fillStyle = P.paper; z.fillRect(0, 0, 32, 24);
      z.fillStyle = P.fog; z.fillRect(0, 9, 32, 1);
      z.fillStyle = P.paperShade; for (var i = 1; i < 32; i += 4) z.fillRect(i, 10, 2, 1);
      var s = g; g = z; poly([[4, 24], [10, 15], [16, 19], [24, 13], [30, 24]], P.brown1); g = s;
    },
    badge: function (z) {
      z.fillStyle = P.night1; z.fillRect(0, 0, 32, 24);
      z.fillStyle = P.paper; z.fillRect(3, 3, 26, 18);
      z.fillStyle = P.paperShade; z.fillRect(5, 5, 8, 10);
      z.fillStyle = P.skinA1; z.fillRect(7, 7, 4, 5);
      z.fillStyle = P.paperDark; z.fillRect(15, 6, 12, 1); z.fillRect(15, 9, 9, 1);
      z.fillStyle = P.red1; z.fillRect(15, 14, 12, 3);
    },
    visor: function (z) {
      z.fillStyle = P.night1; z.fillRect(0, 0, 32, 24);
      z.fillStyle = P.night0; z.fillRect(0, 6, 32, 12);
      z.fillStyle = P.fut0; z.fillRect(2, 8, 28, 8);
      z.fillStyle = P.fut1; z.fillRect(4, 10, 24, 4);
      z.fillStyle = P.fut2; z.fillRect(10, 11, 4, 1); z.fillRect(20, 11, 4, 1);
    },
    core: function (z) {
      z.fillStyle = P.night2; z.fillRect(0, 0, 32, 24);
      z.fillStyle = P.night0; z.fillRect(0, 4, 32, 2); z.fillRect(0, 18, 32, 2);
      z.fillStyle = P.fut0; z.fillRect(10, 6, 12, 12);
      z.fillStyle = P.fut1; z.fillRect(12, 8, 8, 8);
      z.fillStyle = P.fut2; z.fillRect(15, 11, 2, 2);
    },
    pocketwatch: function (z) {
      z.fillStyle = P.night1; z.fillRect(0, 0, 32, 24);
      z.fillStyle = P.lamp3; z.fillRect(8, 4, 16, 16); z.fillRect(14, 0, 4, 4);
      z.fillStyle = P.lamp4; z.fillRect(10, 6, 12, 12);
      z.fillStyle = P.paper; z.fillRect(12, 8, 8, 8);
      z.fillStyle = P.night0; z.fillRect(15, 9, 1, 4); z.fillRect(15, 12, 3, 1);
    },
    badgeHolo: function (z) {
      zooms.badge(z);
      z.fillStyle = P.fut0; z.fillRect(20, 14, 6, 6);
      z.fillStyle = P.fut1; z.fillRect(21, 15, 3, 3);
    }
  };

  /* ---------- the flash: three tones, then a stepped fade ---------- */
  var FL = [[16, 17, 20], [140, 139, 125], [238, 240, 232]];
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
      var v = m.from + (m.to - m.from) * p;
      v = Math.round(v / 2) * 2;                // step in whole 2px moves, stiff like Papers, Please
      if (m.axis === 'x') S.vx = v; else S.vy = v;
      if (p >= 1) { var done = m.done; S.move = null; if (done) done(); }
    }

    exterior();
    boothBack();
    if (S.visitor && visitors[S.visitor]) {
      g.save();
      g.beginPath(); g.rect(WINDOW.x, WINDOW.y, WINDOW.w, WINDOW.h); g.clip();
      g.translate(OX + S.vx, OY + S.vy);
      visitors[S.visitor]();
      g.restore();
    }
    boothFront();
    desk();

    if (S.flashT >= 0) {
      var idx = S.flashReverse ? FLASH_STEPS.length - 1 - S.flashT : S.flashT;
      var a = FLASH_STEPS[idx];
      if (S.flashT >= FLASH_STEPS.length) { S.flashT = -1; }
      else {
        if (idx < 14) posterize();
        if (a) { g.globalAlpha = a; R(0, 0, W, H, P.flash); g.globalAlpha = 1; }
        S.flashSub = (S.flashSub || 0) + 1;
        if (S.flashSub % 3 === 0) S.flashT++;   // ~20 steps a second
      }
    }
  }

  E.art = {
    P: P, W: W, H: H, WINDOW: WINDOW, OX: OX, OY: OY,
    state: S,
    visitors: visitors,
    zooms: zooms,
    digits: digits,
    render: render,
    flashFrames: FLASH_STEPS.length,
    // clickable desk props, native coordinates
    props: [
      { id: 'list', x: 216, y: 138, w: 64, h: 126, label: 'Visitor list' },
      { id: 'notebook', x: 432, y: 186, w: 42, h: 32, label: "Guard's notebook" },
      { id: 'radio', x: 428, y: 112, w: 46, h: 30, label: 'Desk radio' }
    ],
    /** Wrap a PNG authored at 1x on the visitor frame as a draw function. */
    sprite: function (src, x, y) {
      var img = new Image(); img.src = src;
      return function () { if (img.complete) g.drawImage(img, x || 180, y || 30); };
    }
  };
})();
