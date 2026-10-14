/*
 * Upstairs: pixel renderer. Started from the Fireside template's art.js and
 * redrawn for the Hale house. House rules: /stories/ART-STYLE.md. This
 * story's own notes: ../style.md.
 *
 * Above y=166 is the room Owen is standing in (S.room), and whoever is in it.
 * Below is the floor at his feet: his flashlight, what he's carrying, and his
 * notebook. The one warm light is his flashlight (before he finds it, only
 * the nightlight). Everything is drawn, then a dithered darkness mask is laid
 * over the room so only the light pool reads clearly.
 *
 * Candle violet (P.acc*) only ever means one of them.
 */
(function () {
  'use strict';
  var E = (window.TALE = window.TALE || {});

  var P = {
    night0: '#0b0d14', night1: '#161a2a', night2: '#232a40', night3: '#39425e', steel: '#5b6684', fog: '#8d97b0',
    wood0: '#2a180d', wood1: '#3a2414', wood2: '#5e3a1f', wood3: '#8a5a2e', lamp3: '#c88a45', lamp4: '#f2c27a',
    paper: '#d9cfb4', paperShade: '#a89c80', paperDark: '#6e6552',
    skinA0: '#5a3428', skinA1: '#9a634c', skinA2: '#d29a78',
    skinB0: '#3a2219', skinB1: '#6b4232', skinB2: '#9c6a50',
    brown0: '#2e1f17', brown1: '#4f3527', brown2: '#7a5640',
    suit0: '#262b38', suit1: '#3c4354', suit2: '#596277',
    red0: '#5c1a22', red1: '#a8323a',
    flash: '#eef4ff',
    // Upstairs only
    blue: '#3d5f9e', blueHi: '#6a8ac8', pink: '#c98290', gold: '#b8862e',
    // the accent: candle violet, only ever one of them
    acc0: '#2e1e3a', acc1: '#6a4a8a', acc2: '#c8a8e8'
  };

  var W = 480, H = 270;
  var HORIZON = 166;
  var VIEW = { x: 0, y: 0, w: 480, h: HORIZON };
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
  function D(x, y, w, h, col, d, oval) {
    g.fillStyle = col;
    for (var j = 0; j < h; j++) for (var i = 0; i < w; i++) {
      var px = x + i, py = y + j;
      if (oval) { var u = (i - w / 2) / (w / 2), v = (j - h / 2) / (h / 2); if (u * u + v * v > 1) continue; }
      var bb = [[0, 2], [3, 1]][py & 1][px & 1];
      if (bb < d) g.fillRect(px, py, 1, 1);
    }
  }
  function line(x0, y0, x1, y1, col) {
    var n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) || 1;
    g.fillStyle = col;
    for (var i = 0; i <= n; i++) g.fillRect(Math.round(x0 + (x1 - x0) * i / n), Math.round(y0 + (y1 - y0) * i / n), 1, 1);
  }
  var GLYPH = {
    '0': '111101101101111', '1': '010110010010111', '2': '111001111100111', '3': '111001111001111',
    '4': '101101111001001', '5': '111100111001111', '6': '111100111101111', '7': '111001001001001',
    '8': '111101111101111', '9': '111101111001111'
  };
  // 3x5 digits; flip=true draws each one mirrored (for the fakes)
  function digits(ctx, str, x, y, col, flip) {
    ctx.fillStyle = col;
    var cx = x;
    for (var k = 0; k < str.length; k++) {
      var ch = str[k];
      if (ch === '.' || ch === ':') { ctx.fillRect(cx, y + 4, 1, 1); if (ch === ':') ctx.fillRect(cx, y + 1, 1, 1); cx += 2; continue; }
      var gl = GLYPH[ch]; if (!gl) { cx += 4; continue; }
      for (var i = 0; i < 15; i++) if (gl[i] === '1') ctx.fillRect(cx + (flip ? 2 - i % 3 : i % 3), y + Math.floor(i / 3), 1, 1);
      cx += 4;
    }
  }
  function fill(z, x, y, w, h, col) { z.fillStyle = col; z.fillRect(x, y, w, h); }
  function on(z, fn) { var keep = g; g = z; try { fn(); } finally { g = keep; } }

  /* ---------- scene state, set by the UI and puzzles.js ---------- */
  var S = {
    t: 0,
    room: 'bedtime',
    person: null, vx: 0, vy: 0, move: null,
    backdrop: null,
    flashT: -1, flashReverse: false, flashSub: 0,
    clock: '', loop: 1,
    tally: 0, tallyFreshAt: -1,
    hover: null, still: false
  };
  function has(flag) { var gm = E.game; return !!(gm && gm.run && gm.run.flags[flag]); }
  function flick(n) { return S.still ? 0 : (S.t >> n) % 2; }
  // their eyes catch the light violet, now and then
  function glint(x, y, gap) {
    if (S.still || (S.t % 260) > 10) return;
    R(x, y, 2, 1, P.acc2); R(x + (gap || 9), y, 2, 1, P.acc2);
  }

  /* ---------- light: a dithered dark laid over the room ---------- */
  var masks = {};
  function mask(key, lights, floor) {
    if (masks[key]) return masks[key];
    var c = document.createElement('canvas'); c.width = W; c.height = HORIZON;
    var m = c.getContext('2d'); m.fillStyle = P.night0;
    for (var y = 0; y < HORIZON; y++) for (var x = 0; x < W; x++) {
      var d = 9;
      lights.forEach(function (l) {
        var dx = (x - l.x) / l.r, dy = (y - l.y) / (l.ry || l.r);
        d = Math.min(d, Math.sqrt(dx * dx + dy * dy));
      });
      var dens = d < 0.55 ? 0 : d < 0.75 ? 1 : d < 0.95 ? 2 : d < 1.3 ? 3 : (floor == null ? 3 : floor);
      var bb = [[0, 2], [3, 1]][y & 1][x & 1];
      if (bb < dens) m.fillRect(x, y, 1, 1);
    }
    return (masks[key] = c);
  }
  var TORCH = { x: 240, y: 92, r: 170, ry: 160 };   // wide enough that whoever stands in front of Owen is fully lit
  function darkness() {
    var room = S.room, torch = has('hasLight'), L = [];
    if (room === 'bedtime' || room === 'black' || room === 'taken') return;
    if (room === 'basement') L.push({ x: 240, y: 140, r: 230, ry: 150 });
    if (room === 'attic') L.push({ x: 240, y: 46, r: 70 });
    if (room === 'attic' && S.backdrop === 'candles') L.push({ x: 240, y: 140, r: 220, ry: 120 });
    if (room === 'bedroom') L.push({ x: 336, y: 136, r: 80, ry: 60 });
    if (room === 'frontdoor' || room === 'backdoor') L.push({ x: 240, y: 70, r: 120, ry: 140 });
    if (room === 'living') L.push({ x: 400, y: 100, r: 120, ry: 90 });
    if (torch) L.push(TORCH);
    var key = room + (torch ? '+t' : '') + (S.backdrop === 'candles' ? '+c' : '');
    if (!L.length) L.push({ x: 240, y: 80, r: 60 });
    g.drawImage(mask(key, L), 0, 0);
  }

  /* ---------- room pieces ---------- */
  function wall(top, bot, a, b, stripe) {
    R(0, 0, W, HORIZON, a);
    if (stripe) for (var x = 0; x < W; x += stripe) D(x, 0, Math.floor(stripe / 2), HORIZON, b, 1);
    R(0, 148, W, 18, bot);           // floor strip at the back of the room
    R(0, 146, W, 3, P.wood0);        // baseboard
  }
  function door(x, y, w, h, open, col) {
    R(x - 3, y - 3, w + 6, h + 3, P.wood1);
    R(x, y, w, h, open ? P.night0 : (col || P.wood2));
    if (!open) {
      R(x + 5, y + 6, w - 10, h / 2 - 10, P.wood1); R(x + 5, y + h / 2 + 2, w - 10, h / 2 - 10, P.wood1);
      El(x + w - 7, y + h / 2, 2, 2, P.lamp3);
    }
  }
  function frame(x, y, w, h, inner) { R(x - 2, y - 2, w + 4, h + 4, P.wood1); R(x, y, w, h, inner || P.night2); }
  function clock(x, y) {
    R(x, y, 22, 11, P.night0); R(x, y, 22, 1, P.night3);
    if (flick(5)) digits(g, '1200', x + 2, y + 3, P.red1);
  }

  /* ---------- the rooms ---------- */
  var rooms = {
    black: function () { R(0, 0, W, HORIZON, P.night0); },
    // after one of them gets you: dark, and then their eyes open, one pair at a time, closer and closer
    taken: function () {
      R(0, 0, W, HORIZON, P.night0);
      var since = S.t - (S.takenAt || 0);
      [[90, 40, 6], [380, 30, 6], [150, 110, 8], [330, 96, 8], [60, 140, 6], [420, 130, 6], [240, 70, 14]].forEach(function (e, i) {
        if (since < 20 + i * 14) return;
        var open = Math.min(3, Math.floor((since - 20 - i * 14) / 4)), w = e[2];
        if ((S.t + i * 37) % 200 < 6) return;   // they blink too
        R(e[0] - w - 2, e[1] - Math.floor(open / 2), w, open, i === 6 ? P.acc2 : P.acc1);
        R(e[0] + 2, e[1] - Math.floor(open / 2), w, open, i === 6 ? P.acc2 : P.acc1);
      });
    },

    bedtime: function () { bedroom(true); },
    bedroom: function () { bedroom(false); },

    hall: function () {
      wall(0, 0, P.brown1, P.brown0, 12);
      // the attic hatch in the ceiling and its cord
      R(200, 0, 80, 9, P.wood1); R(204, 0, 72, 6, P.wood0); R(239, 9, 1, 10, P.paperShade); R(237, 19, 5, 3, P.paperShade);
      // parents' door (left), bathroom door (right), the stairs going down (far right)
      door(40, 36, 64, 110, false);
      door(300, 36, 60, 110, false);
      R(390, 40, 90, 108, P.night0);
      for (var i = 0; i < 6; i++) R(390 + i * 15, 60 + i * 15, 90 - i * 15, 2, P.night2);
      R(386, 30, 4, 118, P.wood2); R(386, 30, 94, 4, P.wood2);
      for (var k = 0; k < 5; k++) R(396 + k * 18, 34, 2, 30, P.wood2);
      // a picture frame and the little table
      frame(150, 50, 40, 30, P.night3); D(152, 52, 36, 26, P.steel, 1);
      R(150, 110, 70, 4, P.wood3); R(154, 114, 4, 32, P.wood2); R(212, 114, 4, 32, P.wood2);
      R(170, 98, 10, 12, P.paperShade); El(175, 96, 6, 3, P.paper);   // the little lamp (off)
      // Pepper, outside their door, back up
      if (!has('momGone')) pepper(118, 112);
    },

    parents: function () {
      wall(0, 0, P.suit1, P.suit0, 10);
      // window, curtains
      frame(30, 30, 60, 60, P.night1); R(59, 30, 2, 60, P.wood1); D(32, 70, 56, 20, P.night2, 2);
      R(22, 26, 12, 80, P.red0); R(86, 26, 12, 80, P.red0);
      // the big bed: headboard, pillows, quilt
      R(150, 60, 180, 50, P.wood1); R(156, 66, 168, 40, P.wood2); D(156, 66, 168, 40, P.wood1, 1);
      R(140, 108, 200, 40, P.paperShade); R(140, 108, 200, 3, P.paper); D(140, 120, 200, 28, P.paperDark, 1);
      R(140, 146, 200, 4, P.wood1);
      if (!S.person) { El(196, 106, 26, 7, P.paper); El(284, 106, 26, 7, P.paper); }
      // nightstands, the clock and Mom's phone
      R(102, 100, 34, 46, P.wood1); R(344, 100, 34, 46, P.wood1);
      clock(330, 101);
      R(108, 92, 20, 8, P.paperShade); R(108, 92, 20, 2, P.paper);
      // the closet (right)
      door(400, 30, 64, 116, false, P.wood2);
    },

    bathroom: function () {
      R(0, 0, W, HORIZON, P.paperShade);
      for (var y = 0; y < 148; y += 10) R(0, y, W, 1, P.paperDark);
      for (var x = 0; x < W; x += 10) R(x, 70, 1, 78, P.paperDark);
      R(0, 68, W, 3, P.blue);
      R(0, 146, W, 20, P.night3); R(0, 146, W, 2, P.night1);
      // the tub and its curtain (left)
      R(10, 100, 140, 46, P.paper); R(10, 100, 140, 4, P.fog);
      R(10, 10, 140, 92, P.blueHi); for (var c = 14; c < 150; c += 12) R(c, 10, 2, 92, P.blue);
      R(8, 6, 144, 3, P.steel);
      // the mirror over the sink
      R(192, 22, 96, 86, P.steel); R(196, 26, 88, 78, P.night1);
      D(196, 26, 88, 78, P.night2, 1); line(204, 30, 222, 48, P.fog); line(206, 30, 226, 50, P.night3);
      if (!S.person) { D(222, 60, 36, 44, P.night0, 2, true); }
      // the sink
      R(196, 110, 88, 12, P.paper); R(196, 110, 88, 2, P.fog); R(222, 122, 36, 24, P.paperShade);
      R(238, 104, 4, 6, P.steel);
      // Owen's stepstool, until he takes it
      if (!has('hasStool')) { R(222, 132, 36, 6, P.blue); R(222, 132, 36, 1, P.blueHi); R(224, 138, 4, 8, P.blue); R(252, 138, 4, 8, P.blue); }
      // the door (right)
      door(380, 36, 60, 110, false);
      if (S.room === 'bathroom') {
        // toothpaste spots
        R(204, 92, 1, 1, P.paper); R(209, 95, 2, 1, P.paper); R(206, 98, 1, 1, P.paper);
      }
    },

    attic: function () {
      R(0, 0, W, HORIZON, P.wood0);
      // the roof slopes and beams
      poly([[0, 0], [240, 0], [0, 120]], P.wood1); poly([[480, 0], [240, 0], [480, 120]], P.wood1);
      for (var i = 0; i < 6; i++) { line(240, 0, i * 40, 120 - i * 20, P.wood2); line(240, 0, 480 - i * 40, 120 - i * 20, P.wood2); }
      R(0, 120, W, 46, P.wood1); for (var y = 126; y < 166; y += 8) R(0, y, W, 1, P.wood0);
      // the round window in the gable, full of moon (or trees)
      El(240, 46, 24, 24, P.wood2); El(240, 46, 20, 20, P.night2);
      if (S.backdrop === 'candles') {
        El(240, 46, 20, 20, P.night1);
        for (var t = 0; t < 5; t++) R(224 + t * 8, 30 + (t % 2) * 4, 3, 36, P.paperShade);
        R(238, 52, 4, 14, P.acc1);
      } else { El(234, 40, 7, 7, P.fog); El(236, 38, 6, 6, P.paper); R(220, 46, 40, 1, P.wood2); R(239, 26, 1, 40, P.wood2); }
      // junk: boxes, a dress form, the crate with the journal
      R(30, 90, 50, 40, P.wood2); R(30, 90, 50, 3, P.wood3); R(70, 70, 40, 60, P.brown1);
      R(370, 96, 44, 34, P.wood2); R(374, 92, 22, 6, P.paper); R(420, 80, 40, 50, P.brown1);
      El(120, 80, 10, 16, P.night3); R(119, 96, 2, 34, P.night3);
      // the circle: salt, chalk and nails, candles round it, sneakers in the middle
      El(240, 146, 96, 18, P.paperShade); El(240, 146, 92, 15, P.wood1);
      for (var n = 0; n < 16; n++) {
        var a = n / 16 * Math.PI * 2, nx = 240 + Math.cos(a) * 94, ny = 146 + Math.sin(a) * 16;
        R(nx, ny - 1, 1, 3, P.steel);
      }
      for (var k = 0; k < 6; k++) {
        var b = k / 6 * Math.PI * 2 + 0.3, cx = 240 + Math.cos(b) * 100, cy = 146 + Math.sin(b) * 20;
        R(cx - 2, cy - 8, 4, 8, P.paper);
        if (S.backdrop === 'candles') { El(cx, cy - 11, 1, 2 + flick(2), P.acc2); R(cx - 1, cy - 10, 2, 1, P.acc1); }
      }
      R(228, 144, 9, 5, P.red1); R(242, 144, 9, 5, P.red1); R(228, 148, 9, 1, P.paper); R(242, 148, 9, 1, P.paper);
    },

    foyer: function () {
      wall(0, 0, P.brown1, P.brown0, 0);
      R(0, 96, W, 50, P.wood1); R(0, 96, W, 3, P.wood2);
      for (var x = 6; x < W; x += 30) R(x, 104, 22, 36, P.wood0);
      // the front door (left), rain on its glass
      door(40, 32, 70, 114, false, P.wood2);
      R(52, 40, 46, 40, P.night1);
      for (var r = 0; r < 8; r++) R(55 + r * 6, 42 + ((S.t >> 2) + r * 7) % 34, 1, 4, P.fog);
      // the stairs going up (right)
      poly([[330, 148], [480, 20], [480, 148]], P.wood1);
      for (var s = 0; s < 8; s++) R(330 + s * 19, 128 - s * 16, 150 - s * 19, 2, P.wood2);
      line(330, 100, 480, -20, P.wood3); for (var b = 0; b < 8; b++) R(338 + b * 19, 92 - b * 16, 2, 36, P.wood2);
      // the basement door (middle) with the two horseshoes
      door(200, 36, 64, 110, false, P.wood2);
      if (has('hasKey')) R(260, 88, 3, 6, P.steel);
      horseshoe(214, 18); horseshoe(242, 18);
      R(214, 145, 36, 1, P.lamp3);          // lantern light under the door
      // coat hooks
      R(130, 50, 50, 3, P.wood3); R(136, 53, 12, 40, P.red0); R(156, 53, 14, 34, P.suit1);
    },

    living: function () {
      wall(0, 0, P.brown0, P.brown1, 16);
      // the mantel and the empty frame (left)
      R(30, 70, 110, 76, P.night1); R(24, 66, 122, 6, P.wood3); R(56, 98, 58, 48, P.night0);
      frame(64, 40, 30, 24, P.night0);
      // the sofa
      R(126, 108, 60, 38, P.brown1); R(126, 100, 60, 10, P.brown2);
      // the armchair (middle)
      R(196, 54, 88, 70, P.red0); R(196, 54, 88, 4, P.red1);
      R(188, 100, 20, 46, P.red0); R(272, 100, 20, 46, P.red0); R(188, 100, 20, 3, P.red1); R(272, 100, 20, 3, P.red1);
      R(204, 120, 72, 26, P.red0);
      // the TV on its stand (right), all static
      R(350, 60, 100, 76, P.night3); R(356, 66, 88, 60, P.night0);
      for (var i = 0; i < 160; i++) {
        var sx = 358 + ((i * 37 + (S.still ? 0 : S.t * 13)) % 84), sy = 68 + ((i * 53 + (S.still ? 0 : S.t * 7)) % 56);
        R(sx, sy, 2, 1, i % 3 ? P.fog : P.paper);
      }
      R(360, 136, 80, 10, P.wood1);
      D(300, 40, 60, 110, P.fog, 1, true);
      // the torn picture on the rug, until it's picked up
      if (!has('hasPieces')) { R(214, 152, 8, 6, P.paperShade); R(228, 156, 7, 5, P.paper); R(244, 151, 9, 6, P.paperShade); R(258, 155, 6, 6, P.paper); }
    },

    kitchen: function () {
      R(0, 0, W, HORIZON, P.paperDark); D(0, 0, W, 70, P.paperShade, 1);
      R(0, 146, W, 20, P.paper); for (var x = 0; x < W; x += 16) for (var y = 146; y < 166; y += 8) if (((x + y) / 8) & 1) R(x, y, 16, 8, P.paperShade);
      // fridge (left)
      R(24, 30, 64, 116, P.paper); R(24, 30, 64, 2, P.fog); R(24, 74, 64, 2, P.paperShade); R(80, 50, 3, 16, P.steel); R(80, 84, 3, 30, P.steel);
      R(34, 90, 8, 10, P.red1); R(46, 94, 10, 8, P.blue); R(36, 104, 12, 12, P.paperShade);   // magnets and a drawing
      // cabinets and the window over the sink
      R(110, 14, 220, 40, P.wood2); for (var c = 110; c < 330; c += 44) R(c, 14, 2, 40, P.wood1);
      R(110, 96, 220, 50, P.wood2); R(106, 92, 228, 6, P.paperShade);
      for (var d = 110; d < 330; d += 44) { R(d, 98, 2, 48, P.wood1); R(d + 18, 104, 8, 2, P.steel); }
      frame(180, 58, 80, 32, P.night1); R(219, 58, 2, 32, P.wood1);
      // the back door (right), with its glass
      door(400, 30, 60, 116, false, P.wood2); R(410, 38, 40, 46, P.night1);
      if (has('albrightGone')) { El(422, 60, 4, 6, P.fog); R(418, 50, 1, 6, P.fog); R(421, 48, 1, 7, P.fog); R(424, 49, 1, 7, P.fog); }
      // the phone on the wall, its cord cut (until it's fixed)
      R(360, 60, 18, 30, P.paper); R(362, 62, 14, 8, P.paperShade); R(364, 72, 10, 14, P.paperShade);
      if (has('called')) { for (var k = 0; k < 10; k++) R(366 + (k & 1) * 2, 90 + k * 4, 3, 3, P.paperShade); }
      else { for (var j = 0; j < 4; j++) R(366 + (j & 1) * 2, 90 + j * 4, 3, 3, P.paperShade); R(364, 106, 1, 3, P.red1); R(366, 106, 1, 4, P.lamp4); R(368, 106, 1, 3, P.night0); R(370, 106, 1, 2, '#4d6b3a'); }
      // Biscuit's bowl
      El(172, 156, 14, 4, P.red0); El(172, 155, 11, 2, P.night1);
    },

    basement: function () {
      R(0, 0, W, HORIZON, P.night3); D(0, 0, W, HORIZON, P.steel, 1);
      for (var y = 10; y < 140; y += 22) R(0, y, W, 1, P.night2);
      R(0, 140, W, 26, P.night2);
      // joists overhead, the furnace (right), the little window
      for (var x = 0; x < W; x += 40) R(x, 0, 8, 14, P.wood1);
      R(360, 40, 80, 100, P.night1); R(370, 60, 30, 20, P.night0); R(376, 66, 18, 8, P.lamp3);
      R(300, 16, 40, 16, P.night1); D(302, 18, 36, 12, S.backdrop === 'dawn' ? P.pink : P.night0, 2);
      // the stairs Owen is standing on (left)
      for (var s = 0; s < 6; s++) R(0, 30 + s * 20, 90 - s * 12, 4, P.wood2);
      // the iron ring on the floor
      El(240, 156, 150, 10, P.night1);
      for (var n = 0; n < 30; n++) {
        var a = n / 30 * Math.PI * 2, nx = 240 + Math.cos(a) * 146, ny = 156 + Math.sin(a) * 8;
        R(nx, ny - 2, 2, 4, P.steel);
      }
      horseshoe(120, 150); horseshoe(350, 150);
      // the camping lantern
      R(300, 128, 14, 18, P.night1); R(302, 132, 10, 10, P.lamp4); R(300, 126, 14, 3, P.steel);
    },

    frontdoor: function () { glassDoor(false); },
    backdoor: function () { glassDoor(true); }
  };

  function bedroom(lit) {
    wall(0, 0, lit ? P.night3 : P.night2, P.night1, 0);
    // glow-in-the-dark stars on the wall
    [[60, 20], [130, 12], [180, 30], [300, 16], [340, 34], [420, 14], [100, 40]].forEach(function (s) {
      R(s[0], s[1], 3, 1, P.paperShade); R(s[0] + 1, s[1] - 1, 1, 3, P.paperShade);
    });
    // window and curtains (left)
    frame(30, 30, 70, 70, P.night1); R(64, 30, 2, 70, P.wood1); R(30, 64, 70, 2, P.wood1);
    D(32, 76, 66, 24, P.night0, 2);
    El(48, 94, 6, 12, P.night0); El(84, 92, 8, 14, P.night0);
    R(20, 24, 14, 90, P.blue); R(96, 24, 14, 90, P.blue);
    // dresser, with the Game Boy and the clock
    R(120, 92, 72, 54, P.wood2); R(120, 92, 72, 3, P.wood3);
    for (var d = 0; d < 3; d++) { R(124, 100 + d * 15, 64, 12, P.wood1); R(152, 105 + d * 15, 8, 2, P.lamp3); }
    R(130, 82, 10, 10, P.fog); R(132, 84, 6, 4, P.night3);
    if (lit) { R(162, 81, 22, 11, P.night0); digits(g, '840', 166, 84, P.red1); }
    else { R(162, 81, 22, 11, P.night0); digits(g, '307', 166, 84, P.red1); }
    // the bedside lamp
    R(206, 80, 4, 30, P.wood3); poly([[198, 80], [218, 80], [214, 66], [202, 66]], lit ? P.lamp4 : P.paperDark);
    if (lit) D(150, 40, 120, 80, P.lamp3, 1, true);
    // the rocking chair (middle)
    R(222, 50, 4, 70, P.wood2); R(254, 50, 4, 70, P.wood2); R(222, 50, 36, 4, P.wood2);
    for (var r = 0; r < 4; r++) R(228 + r * 7, 56, 2, 46, P.wood1);
    R(216, 100, 48, 8, P.wood2); R(218, 108, 3, 30, P.wood1); R(259, 108, 3, 30, P.wood1);
    poly([[204, 140], [276, 140], [270, 144], [210, 144]], P.wood2);
    if (!lit && !S.person) {
      // the book and her shawl, left behind
      R(228, 94, 22, 6, P.red0); R(229, 94, 20, 2, P.paper);
      poly([[254, 54], [262, 52], [268, 100], [258, 116], [252, 104]], P.fog); D(254, 54, 14, 60, P.steel, 1);
    }
    // the door (right), open on the dark hall; Dad leans in at bedtime
    door(370, 30, 64, 116, true);
    if (S.backdrop === 'dad') {
      // Dad leaning in the doorway, the real one: watch on his left wrist, light on his glasses
      g.save(); g.beginPath(); g.rect(370, 30, 64, 116); g.clip(); g.translate(162, -6);
      flannel(240, 94, 34);
      dadHead(240, 62, { fake: false, mouth: 'calm', glare: P.lamp4 });
      g.restore();
      poly([[418, 118], [430, 112], [432, 124], [420, 128]], P.red0); hand(424, 128, SKIN.A, false); R(420, 120, 10, 4, P.steel); R(423, 121, 3, 2, P.paper);
    }
    // the nightlight by the door
    R(332, 128, 8, 10, P.lamp3); R(333, 129, 6, 6, P.lamp4);
  }

  function horseshoe(x, y) {
    R(x, y, 3, 12, P.steel); R(x + 9, y, 3, 12, P.steel); R(x, y + 10, 12, 3, P.steel); R(x + 1, y + 1, 1, 9, P.fog);
  }

  // The front or back door, close up, glass in the top two-thirds. People stand behind it.
  function glassDoor(back) {
    R(0, 0, W, HORIZON, back ? P.paperDark : P.brown1);
    if (back) D(0, 0, W, HORIZON, P.paperShade, 1);
    R(170, 6, 140, 160, P.wood1);
    R(180, 14, 120, 120, P.night1);           // outside: dark, raining
    D(180, 100, 120, 34, P.night2, 2);
    if (back) { R(300, 40, 1, 1, P.night1); R(312, 30, 46, 36, P.night1); poly([[308, 30], [335, 14], [362, 30]], P.night1); }
  }
  function glassOver(back) {
    // rain streaks on the glass, over whoever is outside, then the frame and the bottom panel
    for (var r = 0; r < 18; r++) {
      var rx = 182 + r * 7, ry = 14 + ((S.still ? 0 : S.t >> 1) * (2 + r % 3) + r * 23) % 116;
      R(rx, ry, 1, 5, P.fog);
    }
    R(170, 6, 140, 8, P.wood1); R(170, 6, 10, 160, P.wood1); R(300, 6, 10, 160, P.wood1);
    R(170, 134, 140, 32, P.wood2); R(178, 140, 124, 20, P.wood1);
    R(180, 112, 120, 3, P.wood1); R(180, 115, 120, 1, P.wood2);   // one cross bar, low, so faces stay clear
    R(292, 96, 5, 8, P.lamp3);
    if (back) R(296, 108, 2, 6, P.steel);
  }

  /* ---------- the floor at Owen's feet ---------- */
  function foreground() {
    var room = S.room;
    if (room === 'bedtime' || room === 'bedroom') quilt(room === 'bedtime');
    else if (room === 'black' || room === 'taken') R(0, HORIZON, W, H - HORIZON, P.night0);
    else {
      var a = P.wood1, b = P.wood0;
      if (room === 'kitchen' || room === 'bathroom') { a = P.paperDark; b = P.night3; }
      if (room === 'basement') { a = P.night2; b = P.night1; }
      if (room === 'frontdoor' || room === 'backdoor') { a = P.wood1; b = P.wood0; }
      R(0, HORIZON, W, H - HORIZON, a);
      for (var y = HORIZON + 8; y < H; y += 12) R(0, y, W, 1, b);
      for (var x = 0; x < W; x += 61) R(x + ((x / 61) % 2) * 20, HORIZON, 1, H - HORIZON, b);
      D(0, HORIZON, W, H - HORIZON, P.night0, 2);
      if (room === 'basement') {
        El(240, 172, 150, 8, P.night1);
        for (var n = 0; n < 18; n++) R(96 + n * 16, 170 + (n % 3), 2, 6, P.steel);
      }
    }
    if (has('hasLight') && room !== 'bedtime' && room !== 'black' && room !== 'taken') D(170, HORIZON + 2, 140, 50, P.lamp3, 1, true);
    inventory();
  }

  function quilt(lit) {
    R(0, HORIZON, W, H - HORIZON, P.night1);
    var cols = lit ? [P.red1, P.blue, P.paperShade, P.lamp3] : [P.red0, P.suit1, P.paperDark, P.wood2];
    for (var y = HORIZON; y < H; y += 20) for (var x = 0; x < W; x += 24) {
      R(x, y, 24, 20, cols[((x / 24) + (y - HORIZON) / 20 * 3) % 4 | 0]);
      R(x, y, 24, 1, P.night0); R(x, y, 1, 20, P.night0);
    }
    if (!lit) D(0, HORIZON, W, H - HORIZON, P.night0, 2);
    // his feet under the covers
    El(220, 190, 12, 8, lit ? P.paper : P.paperDark); El(260, 190, 12, 8, lit ? P.paper : P.paperDark);
    // Biscuit, asleep at the foot of the bed (bedtime only)
    if (lit) {
      g.save(); g.translate(-200, 0);   // on the near corner of the bed, clear of the text panel
      // curled up asleep: back to us, nose on his paws, tail wrapped round
      El(300, 216, 38, 15, P.wood3); El(298, 212, 34, 12, P.gold); El(294, 208, 26, 7, P.lamp3);
      for (var f = 0; f < 8; f++) R(274 + f * 6, 204 + (f & 1), 3, 1, P.lamp4);
      poly([[334, 214], [344, 222], [330, 230], [300, 232], [280, 228], [300, 226], [326, 222]], P.gold);   // tail
      for (var tf = 0; tf < 5; tf++) R(300 + tf * 7, 228 - (tf & 1), 2, 3, P.lamp3);
      El(266, 220, 9, 4, P.lamp3); El(280, 224, 8, 4, P.gold);                                      // paws
      El(266, 208, 13, 10, P.gold); El(263, 205, 9, 7, P.lamp3); R(259, 201, 6, 2, P.lamp4);         // head
      El(254, 214, 7, 5, P.lamp4); El(249, 213, 2, 2, P.night0);                                     // muzzle and nose
      R(259, 207, 5, 1, P.night0);                                                                    // eye shut
      poly([[268, 200], [278, 204], [278, 218], [270, 214]], P.wood3);                                // ear
      R(272, 213, 4, 10, P.red1); R(273, 222, 3, 3, P.paperShade);                                    // red collar, tag
      if (!S.still && (S.t >> 5) % 2) El(300, 211, 34, 12, P.gold);                                   // breathing
      g.restore();
    }
  }

  function inventory() {
    var items = [];
    if (has('hasLight')) items.push('light');
    if (has('hasStool')) items.push('stool');
    if (has('hasPieces')) items.push(has('photoDone') ? 'photo' : 'pieces');
    if (has('hasPole')) items.push('pole');
    if (has('hasKey')) items.push('key');
    items.forEach(function (it, i) {
      var x = 8 + i * 16, y = 251;
      R(x, y, 14, 14, P.night1); R(x, y, 14, 1, P.night3);
      if (it === 'light') { R(x + 3, y + 4, 8, 6, P.lamp3); R(x + 10, y + 3, 2, 8, P.lamp4); }
      if (it === 'stool') { R(x + 2, y + 4, 10, 3, P.blue); R(x + 3, y + 7, 2, 5, P.blue); R(x + 9, y + 7, 2, 5, P.blue); }
      if (it === 'pieces') { R(x + 2, y + 3, 5, 4, P.paper); R(x + 7, y + 6, 4, 5, P.paperShade); R(x + 3, y + 9, 4, 3, P.paper); }
      if (it === 'photo') { R(x + 2, y + 3, 10, 8, P.paper); R(x + 3, y + 4, 8, 6, P.wood2); R(x + 6, y + 8, 2, 1, P.red1); }
      if (it === 'pole') { line(x + 2, y + 12, x + 11, y + 3, P.wood3); R(x + 10, y + 2, 2, 3, P.steel); }
      if (it === 'key') { El(x + 4, y + 7, 2, 2, P.steel); R(x + 6, y + 6, 6, 2, P.steel); R(x + 10, y + 8, 1, 2, P.steel); }
    });
  }

  function notebook() {
    var hov = S.hover === 'notebook';
    R(422, 190, 46, 32, hov ? P.red1 : P.red0); R(424, 192, 42, 28, hov ? P.red1 : P.red0);
    for (var r = 0; r < 7; r++) R(420, 193 + r * 4, 5, 2, P.fog);
    // a crayon house on the cover
    poly([[436, 208], [446, 199], [456, 208]], P.lamp4); R(438, 208, 16, 9, P.paper); R(444, 211, 4, 6, P.wood2);
  }

  function tally(x, y) {
    var n = S.tally;
    for (var i = 0; i < n && i < 25; i++) {
      var grp = Math.floor(i / 5), k = i % 5, gx = x + grp * 20;
      var col = (i === n - 1 && S.t - S.tallyFreshAt < 60) ? P.lamp4 : P.lamp3;
      if (k < 4) R(gx + k * 4, y, 1, 9, col);
      else for (var j = 0; j < 16; j++) R(gx - 1 + j, y + 7 - Math.floor(j * 0.45), 1, 1, col);
    }
  }

  /* ---------- people, built from parts ----------
   * Drawn the Emit Time way: big readable heads, the near side lit by Owen's
   * flashlight (viewer-left takes the light tone), the far side the dark tone
   * plus a dither, eyes with whites, lids and brows, and a blink. Everyone is
   * authored around x=240 with the face centred at y≈62; g.translate moves them.
   * The fakes are the same parts, mirror-wrong where it counts.
   */
  var SKIN = {
    A: { s0: P.skinA0, s1: P.skinA1, s2: P.skinA2 },
    B: { s0: P.skinB0, s1: P.skinB1, s2: P.skinB2 },
    old: { s0: P.skinA1, s1: P.skinA2, s2: '#e6c0a0' }
  };
  function blinking(seed) { return !S.still && ((S.t + (seed || 0)) % 230) < 6; }

  function neck(cx, top, k, len) {
    R(cx - 8, top, 16, len || 16, k.s1); D(cx + 1, top, 7, len || 16, k.s0, 2);
    R(cx - 8, top, 16, 3, k.s0);
  }
  // face: an oval, lit on the left, ears, a nose with its shadow on the far side
  function face(cx, cy, k, rx, ry) {
    rx = (rx || 18) + 1; ry = (ry || 22) + 1;
    El(cx - rx, cy + 2, 3, 5, k.s1); El(cx + rx, cy + 2, 3, 5, k.s0);
    El(cx, cy, rx, ry, k.s1); El(cx - 3, cy - 2, rx - 4, ry - 3, k.s2);
    D(cx + Math.round(rx * 0.35), cy - ry + 3, Math.round(rx * 0.7), ry * 2 - 4, k.s0, 2);
    R(cx, cy + 1, 2, 7, k.s1); R(cx + 2, cy + 3, 2, 6, k.s0); R(cx - 3, cy + 9, 7, 1, k.s0);
    D(cx - rx + 4, cy + 6, 6, 4, P.red1, 1);   // a bit of colour in the lit cheek
  }
  // eyes: iris colour, where they look (dx, dy), and whether one of them is wearing the face
  function eyes(cx, cy, opt) {
    opt = opt || {};
    var iris = opt.iris || P.brown1, lx = cx - 11, rx = cx + 4, y = cy - 4, dx = opt.dx || 0, dy = opt.dy || 0;
    var brow = opt.brow || P.brown0;
    R(lx - 1, y - 5 - (opt.raise || 0), 9, 2, brow); R(rx, y - 5 - (opt.raise || 0), 9, 2, brow);
    if (blinking(opt.seed) && !opt.still) {
      R(lx, y + 2, 8, 1, P.night0); R(rx, y + 2, 8, 1, P.night0);
      return;
    }
    R(lx, y, 8, 5, P.paper); R(rx, y, 8, 5, P.paperShade);
    var glow = opt.fake && !S.still && (S.t % 260) < 10;
    var ic = glow ? P.acc2 : iris;
    R(lx + 3 + dx, y + 1 + dy, 3, 3, ic); R(rx + 3 + dx, y + 1 + dy, 3, 3, ic);
    R(lx + 4 + dx, y + 2 + dy, 1, 1, glow ? P.acc1 : P.night0); R(rx + 4 + dx, y + 2 + dy, 1, 1, glow ? P.acc1 : P.night0);
    if (!opt.fake) { R(lx + 3 + dx, y + 1 + dy, 1, 1, P.paper); R(rx + 3 + dx, y + 1 + dy, 1, 1, P.paper); }
    R(lx, y - 1, 8, 1, P.night0); R(rx, y - 1, 8, 1, P.night0);   // upper lids
    if (opt.lashes) { R(lx - 1, y, 1, 1, P.night0); R(rx + 8, y, 1, 1, P.night0); }
  }
  function mouth(cx, cy, kind, k) {
    var y = cy + 13;
    if (kind === 'smile') {          // too wide, too still
      R(cx - 9, y, 18, 1, P.night0); R(cx - 10, y - 1, 1, 1, P.night0); R(cx + 9, y - 1, 1, 1, P.night0);
      R(cx - 7, y + 1, 14, 1, P.paper); R(cx - 6, y + 2, 12, 1, P.red0);
    } else if (kind === 'open') {
      R(cx - 4, y - 1, 9, 4, P.night0); R(cx - 3, y + 2, 7, 1, P.red0);
    } else if (kind === 'grim') {
      R(cx - 6, y, 12, 1, P.night0); R(cx - 5, y + 2, 10, 1, k.s0);
    } else {
      R(cx - 5, y, 10, 1, P.red0); R(cx - 4, y + 1, 8, 1, P.red1); R(cx - 3, y + 3, 6, 1, k.s0);
    }
  }
  // shoulders and chest: a lit near half, a dark far half
  function shoulders(cx, top, L, Dk, wide) {
    var w = (wide || 44) + 6;
    poly([[cx - w - 4, 166], [cx - w + 2, top + 14], [cx - 20, top], [cx + 20, top], [cx + w - 2, top + 14], [cx + w + 4, 166]], Dk);
    poly([[cx - w + 2, 166], [cx - w + 6, top + 15], [cx - 19, top + 2], [cx, top + 2], [cx, 166]], L);
  }

  /* Mom. part: -1 parts on the viewer's left (wrong), +1 on the right (hers). */
  function momHair(cx, cy, part, back) {
    var h0 = P.brown0, h1 = P.brown1, h2 = P.brown2;
    if (back) {   // the long fall behind her shoulders
      poly([[cx - 26, cy - 10], [cx - 30, cy + 30], [cx - 34, cy + 54], [cx - 22, cy + 58], [cx - 14, cy + 30]], h1);
      poly([[cx + 26, cy - 10], [cx + 30, cy + 30], [cx + 35, cy + 56], [cx + 22, cy + 60], [cx + 14, cy + 30]], h0);
      return;
    }
    El(cx, cy - 21, 21, 10, h1); R(cx - 19, cy - 20, 38, 6, h1);
    D(cx + 4, cy - 30, 18, 16, h0, 2);
    // side curtains framing the face, with a wave in them
    poly([[cx - 22, cy - 14], [cx - 14, cy - 18], [cx - 13, cy + 4], [cx - 16, cy + 22], [cx - 22, cy + 36], [cx - 27, cy + 20], [cx - 25, cy]], h1);
    poly([[cx + 22, cy - 14], [cx + 14, cy - 18], [cx + 14, cy + 4], [cx + 17, cy + 22], [cx + 23, cy + 38], [cx + 28, cy + 20], [cx + 26, cy]], h0);
    // strands catching the light on the near side
    [[cx - 18, cy - 20, 10], [cx - 22, cy - 8, 14], [cx - 24, cy + 10, 12], [cx - 10, cy - 26, 6]].forEach(function (s) { R(s[0], s[1], 1, s[2], h2); });
    R(cx - 20, cy - 24, 12, 1, h2); R(cx - 16, cy - 26, 10, 1, h2);
    // the part, and the fringe swept away from it
    var px = cx + part * 6;
    R(px, cy - 28, 1, 12, P.skinA0); R(px, cy - 28, 1, 3, P.skinA1);
    poly([[px, cy - 26], [cx - part * 19, cy - 18], [cx - part * 18, cy - 11], [px - part * 3, cy - 20]], part > 0 ? h1 : h0);
    // little gold studs
    R(cx - 19, cy + 8, 2, 2, P.lamp4); R(cx + 18, cy + 8, 2, 2, P.lamp3);
  }
  function shawl(cx, top) {
    poly([[cx - 46, top + 30], [cx - 40, top + 10], [cx - 22, top], [cx - 10, top + 6], [cx - 14, top + 40], [cx - 30, top + 56], [cx - 48, top + 52]], P.fog);
    poly([[cx + 46, top + 30], [cx + 40, top + 10], [cx + 22, top], [cx + 10, top + 6], [cx + 14, top + 40], [cx + 30, top + 56], [cx + 48, top + 52]], P.steel);
    D(cx + 12, top + 4, 36, 52, P.night3, 1);
    for (var i = 0; i < 6; i++) { R(cx - 42 + i * 5, top + 14 + i * 6, 6, 1, P.steel); R(cx + 18 + i * 4, top + 10 + i * 7, 6, 1, P.night3); }
    for (var f = 0; f < 6; f++) { R(cx - 44 + f * 3, top + 52 + (f & 1), 1, 5, P.paperShade); R(cx + 32 + f * 3, top + 54 + (f & 1), 1, 5, P.fog); }
  }
  function nightgown(cx, top) {
    shoulders(cx, top, P.paper, P.paperShade, 38);
    poly([[cx - 12, top + 1], [cx + 12, top + 1], [cx + 6, top + 14], [cx - 6, top + 14]], P.skinA1);   // the neckline
    for (var i = 0; i < 7; i++) R(cx - 13 + i * 4, top + 14 + (i & 1), 2, 2, P.paper);                   // lace edge
    R(cx - 1, top + 18, 2, 2, P.fog); R(cx - 1, top + 26, 2, 2, P.fog);
  }
  function mom(o) {
    var cx = 240, cy = 62, k = SKIN.A;
    momHair(cx, cy, o.part, true);
    neck(cx, 76, k, o.longNeck ? 22 : 20);
    nightgown(cx, 94);
    if (o.shawl) shawl(cx, 92);
    face(cx, cy - (o.longNeck ? 4 : 0), k, 17, 21);
    var fy = cy - (o.longNeck ? 4 : 0);
    eyes(cx, fy, { iris: '#5a7a4a', dx: o.dx || 0, dy: o.dy || 0, lashes: true, fake: o.fake, still: o.fake, seed: 31, brow: P.brown1 });
    mouth(cx, fy, o.mouth || 'calm', k);
    momHair(cx, fy, o.part, false);
  }

  /* Dad: short hair with a side part, glasses, stubble, flannel. */
  function dadHead(cx, cy, o) {
    var k = SKIN.A;
    neck(cx, 80, k);
    face(cx, cy, k, 18, 22);
    D(cx - 14, cy + 6, 28, 14, k.s0, 1);   // stubble
    El(cx, cy - 21, 20, 9, P.brown1); D(cx + 2, cy - 28, 18, 12, P.brown0, 2);
    R(cx - 20, cy - 14, 4, 12, P.brown1); R(cx + 17, cy - 14, 4, 12, P.brown0);
    var side = o.fake ? 1 : -1;   // Dad parts on his left (viewer-right); the copy doesn't
    poly([[cx + side * 6, cy - 26], [cx - side * 20, cy - 18], [cx - side * 18, cy - 12], [cx + side * 4, cy - 20]], P.brown2);
    R(cx + side * 7, cy - 26, 1, 8, P.brown0);
    eyes(cx, cy, { iris: P.blue, fake: o.fake, still: o.fake, seed: 77, brow: P.brown0, dy: o.dy || 0 });
    // the glasses: frames, and the light on the lenses (the copy's lenses stay black)
    R(cx - 13, cy - 7, 12, 9, P.night0); R(cx + 2, cy - 7, 12, 9, P.night0); R(cx - 1, cy - 5, 3, 1, P.night0);
    R(cx - 12, cy - 6, 10, 7, o.fake ? P.night1 : P.night3); R(cx + 3, cy - 6, 10, 7, o.fake ? P.night1 : P.night3);
    if (!o.fake) {
      R(cx - 11, cy - 5, 3, 1, o.glare || P.fog); R(cx + 4, cy - 5, 3, 1, o.glare || P.fog);
      R(cx - 9, cy - 4, 3, 3, P.blue); R(cx + 6, cy - 4, 3, 3, P.blue); R(cx - 8, cy - 3, 1, 1, P.night0); R(cx + 7, cy - 3, 1, 1, P.night0);
    }
    R(cx - 19, cy - 5, 6, 1, P.night0); R(cx + 14, cy - 5, 6, 1, P.night0);
    mouth(cx, cy, o.mouth || 'grim', k);
  }
  function flannel(cx, top, wide) {
    shoulders(cx, top, P.red1, P.red0, wide || 46);
    // the plaid: dark bands and a thin light thread, both ways
    for (var y = top + 8; y < 166; y += 12) { R(cx - 48, y, 96, 3, P.red0); R(cx - 48, y + 6, 96, 1, P.lamp3); }
    for (var x = cx - 44; x < cx + 46; x += 12) { D(x, top + 4, 3, 166 - top, P.night0, 1); R(x + 6, top + 6, 1, 160 - top, P.lamp3); }
    D(cx + 4, top + 2, 46, 166 - top, P.night0, 1);
    // the open collar and a white T-shirt under it
    poly([[cx - 10, top + 1], [cx + 10, top + 1], [cx + 4, top + 16], [cx - 4, top + 16]], P.paper);
    poly([[cx - 20, top], [cx - 8, top], [cx - 2, top + 20], [cx - 12, top + 10]], P.red1);
    poly([[cx + 20, top], [cx + 8, top], [cx + 2, top + 20], [cx + 12, top + 10]], P.red0);
    R(cx - 1, top + 24, 2, 2, P.paperShade); R(cx - 1, top + 36, 2, 2, P.paperShade); R(cx - 1, top + 48, 2, 2, P.paperShade);
  }
  function hand(x, y, k, lit) {
    El(x, y, 7, 6, lit ? k.s1 : k.s0); El(x - 1, y - 1, 5, 4, lit ? k.s2 : k.s1);
    for (var i = 0; i < 3; i++) R(x - 4 + i * 3, y + 4, 1, 2, k.s0);
  }

  /* Biscuit: a golden dog, side-on facing left (standing) or facing you (sitting). */
  var FUR = { d: P.wood3, m: P.gold, l: P.lamp3, h: P.lamp4 };
  function dogStanding(o) {
    var wag = S.still ? 0 : ((S.t >> (o.fake ? 3 : 2)) % 2) * 5;
    // long retriever legs first, then the rest of him lifted onto them
    R(262, 122, 8, 34, FUR.d); R(226, 122, 8, 34, FUR.d);
    R(214, 124, 9, 32, FUR.m); R(214, 124, 3, 30, FUR.l); R(274, 126, 8, 30, FUR.m);
    [[212, 154], [224, 154], [260, 154], [272, 154]].forEach(function (p, i) {
      R(p[0], p[1], 11, 5, i % 2 ? FUR.d : FUR.m);
      if (o.mud) { R(p[0], p[1] + 2, 11, 3, P.brown1); D(p[0], p[1], 11, 3, P.brown1, 1); }
    });
    g.save(); g.translate(0, -12);
    // tail plume
    poly([[286, 114], [298, 100 - wag], [306, 92 - wag], [304, 102 - wag], [294, 118]], FUR.m);
    for (var t = 0; t < 4; t++) R(296 + t * 2, 98 - wag + t * 4, 1, 4, FUR.l);
    // far legs (darker), body, near legs
    El(250, 124, 40, 17, FUR.m); El(246, 119, 34, 10, FUR.l); D(222, 128, 60, 13, FUR.d, 1);
    for (var f = 0; f < 9; f++) R(216 + f * 7, 138 + (f & 1) * 2, 2, 4, FUR.m);   // the feathery belly
    poly([[268, 126], [284, 124], [286, 146], [276, 150], [270, 144]], FUR.m);    // haunch
    // chest ruff and neck
    poly([[204, 104], [222, 108], [226, 136], [210, 140], [202, 122]], FUR.m);
    for (var r = 0; r < 5; r++) R(206 + r * 3, 126 + (r & 1) * 3, 2, 8, FUR.l);
    // head: skull, muzzle, nose, eye
    El(200, 100, 15, 13, FUR.m); El(197, 97, 11, 9, FUR.l); R(193, 91, 6, 2, FUR.h);
    El(184, 108, 12, 7, FUR.l); El(183, 106, 9, 4, FUR.h);
    El(173, 104, 3, 3, P.night0); R(172, 103, 1, 1, P.fog);
    if (o.fake) {
      R(174, 112, 16, 1, P.night0);                                   // mouth shut tight
    } else {
      R(176, 111, 12, 2, P.night0); R(178, 113, 5, 6, P.pink); R(179, 113, 2, 5, P.red1);   // panting
    }
    R(190, 96, 4, 3, P.night0); R(190, 96, 1, 1, o.fake && !S.still && (S.t % 260) < 10 ? P.acc2 : P.paper);
    // ears: the copy's are both perfect; the real one has one inside out
    poly([[202, 90], [214, 92], [216, 110], [208, 116], [202, 106]], FUR.d);
    R(204, 94, 2, 14, FUR.m);
    if (!o.fake) poly([[196, 88], [204, 84], [208, 90]], P.pink);
    // the collar and the bone tag
    var cc = o.fake ? P.blue : P.red1, ch = o.fake ? P.blueHi : '#d65a5a';
    poly([[206, 110], [214, 108], [220, 122], [212, 125]], cc); R(208, 110, 2, 12, ch);
    var tx = 210, ty = 126;
    R(tx, ty, 6, 3, P.paperShade);
    if (o.fake) { R(tx + 5, ty - 1, 2, 2, P.paperShade); R(tx + 5, ty + 2, 2, 2, P.paperShade); }
    else { R(tx - 1, ty - 1, 2, 2, P.paperShade); R(tx - 1, ty + 2, 2, 2, P.paperShade); }
    g.restore();
  }
  function dogSitting(cx, base, o) {
    // haunches and chest
    El(cx, base - 16, 22, 18, FUR.m); El(cx - 4, base - 20, 16, 14, FUR.l); D(cx + 6, base - 32, 16, 30, FUR.d, 1);
    R(cx - 14, base - 10, 8, 10, FUR.m); R(cx + 6, base - 10, 8, 10, FUR.d);
    for (var r = 0; r < 6; r++) R(cx - 10 + r * 4, base - 30 + (r & 1) * 3, 2, 9, FUR.h);
    // head, facing you
    var hy = base - 46;
    El(cx, hy, 14, 13, FUR.m); El(cx - 2, hy - 2, 10, 9, FUR.l); R(cx - 6, hy - 10, 8, 2, FUR.h);
    El(cx, hy + 9, 8, 6, FUR.h); El(cx, hy + 6, 3, 2, P.night0);
    R(cx - 7, hy - 2, 3, 3, P.night0); R(cx + 5, hy - 2, 3, 3, P.night0); R(cx - 7, hy - 2, 1, 1, P.paper); R(cx + 5, hy - 2, 1, 1, P.paper);
    poly([[cx - 12, hy - 10], [cx - 20, hy - 2], [cx - 18, hy + 14], [cx - 12, hy + 6]], FUR.d);
    if (o.flipEar) poly([[cx + 12, hy - 10], [cx + 22, hy - 14], [cx + 18, hy - 4]], P.pink);
    else poly([[cx + 12, hy - 10], [cx + 20, hy - 2], [cx + 18, hy + 14], [cx + 12, hy + 6]], FUR.d);
    if (o.pant) { R(cx - 3, hy + 12, 6, 7 + (S.still ? 0 : (S.t >> 3) % 2), P.pink); R(cx - 1, hy + 12, 2, 6, P.red1); }
    R(cx - 12, hy + 16, 24, 4, o.collar || P.red1); R(cx - 12, hy + 16, 24, 1, '#d65a5a');
    R(cx - 2, hy + 20, 5, 3, P.paperShade);
  }

  /* Pepper, the cat (real). Black, back up, eyes catching the flashlight. */
  function pepper(x, y) {
    // sitting side-on, back arched and fur up, facing the parents' door; eyes catching the flashlight
    poly([[x + 4, y + 30], [x + 2, y + 14], [x + 10, y + 2], [x + 24, y], [x + 34, y + 8], [x + 36, y + 30]], P.night1);
    for (var f = 0; f < 7; f++) R(x + 8 + f * 4, y - 1 + (f % 3 === 1 ? -2 : 0), 2, 3, P.night1);   // hackles
    D(x + 8, y + 4, 22, 10, P.night2, 1);
    R(x + 6, y + 24, 5, 10, P.night1); R(x + 14, y + 26, 5, 8, P.night1); R(x + 28, y + 24, 6, 10, P.night1);
    R(x + 5, y + 33, 7, 2, P.night2); R(x + 13, y + 33, 7, 2, P.night2);
    // head, ears flat back, mouth open in a hiss
    El(x - 2, y + 10, 10, 9, P.night1); D(x - 10, y + 2, 10, 8, P.night2, 1);
    poly([[x - 8, y + 4], [x - 4, y - 4], [x, y + 2]], P.night1); poly([[x + 1, y + 2], [x + 6, y - 3], [x + 7, y + 5]], P.night1);
    poly([[x - 7, y + 3], [x - 4, y - 2], [x - 2, y + 2]], P.red0);
    if (!blinking(91)) { R(x - 8, y + 7, 4, 3, P.lamp4); R(x - 1, y + 7, 4, 3, P.lamp4); R(x - 7, y + 7, 1, 3, P.night0); R(x, y + 7, 1, 3, P.night0); }
    else { R(x - 8, y + 9, 4, 1, P.night3); R(x - 1, y + 9, 4, 1, P.night3); }
    R(x - 5, y + 12, 3, 2, P.red0); R(x - 6, y + 14, 5, 2, P.night0); R(x - 6, y + 14, 1, 2, P.paper); R(x - 2, y + 14, 1, 2, P.paper);
    for (var w = 0; w < 3; w++) { R(x - 16, y + 11 + w * 2, 7, 1, P.fog); R(x + 4, y + 11 + w * 2, 7, 1, P.steel); }
    // tail straight up and bottle-brushed
    poly([[x + 34, y + 28], [x + 40, y + 10], [x + 42, y - 10], [x + 46, y - 8], [x + 44, y + 12], [x + 38, y + 30]], P.night1);
    for (var t = 0; t < 6; t++) { R(x + 39 + (t & 1) * 6, y - 8 + t * 6, 2, 1, P.night2); }
  }

  /* Deputies: campaign hat, tan shirt, star, tie, belt. */
  function deputy(fake) {
    var cx = 240, cy = 62, k = SKIN.B;
    shoulders(cx, 94, P.paperShade, P.paperDark, 46);
    D(cx + 4, 96, 48, 70, P.brown2, 1);
    R(cx - 44, 104, 10, 4, P.brown2); R(cx + 34, 104, 10, 4, P.brown1);       // epaulets
    poly([[cx - 8, 96], [cx + 8, 96], [cx + 4, 104], [cx - 4, 104]], P.paperShade);
    poly([[cx - 3, 102], [cx + 3, 102], [cx + 4, 140], [cx, 146], [cx - 4, 140]], P.night1);   // the tie
    R(cx - 32, 116, 18, 12, P.paperDark); R(cx - 32, 116, 18, 2, P.brown2); R(cx + 16, 116, 18, 12, P.brown2); R(cx + 16, 116, 18, 2, P.brown1);
    R(cx - 28, 132, 14, 3, P.night1);   // name tag
    var bx = fake ? cx - 30 : cx + 20;  // the star belongs over his heart: viewer-right
    poly([[bx + 6, 104], [bx + 8, 109], [bx + 13, 109], [bx + 9, 112], [bx + 11, 117], [bx + 6, 114], [bx + 1, 117], [bx + 3, 112], [bx - 1, 109], [bx + 4, 109]], P.gold);
    R(bx + 5, 108, 2, 2, P.lamp4);
    R(cx - 48, 150, 96, 6, P.night1); R(cx - 4, 150, 8, 6, P.steel);   // belt and buckle
    R(cx - 41, 112, 9, 12, P.night1); R(cx - 39, 108, 2, 4, P.night3); R(cx - 40, 117, 7, 4, P.night3);   // shoulder radio
    if (!fake && flick(3)) R(cx - 38, 114, 2, 1, '#4d6b3a');
    neck(cx, 80, k);
    face(cx, cy, k, 18, 22);
    eyes(cx, cy, { iris: P.brown0, fake: fake, still: fake, seed: 13, brow: P.night1, dy: fake ? 0 : -1, raise: fake ? 0 : 1 });
    mouth(cx, cy, fake ? 'smile' : 'open', k);
    // the hat: wide flat brim and a pinched crown
    El(cx, cy - 22, 34, 5, P.brown1); El(cx - 4, cy - 23, 26, 3, P.brown2);
    poly([[cx - 16, cy - 24], [cx - 14, cy - 40], [cx - 6, cy - 44], [cx, cy - 40], [cx + 6, cy - 44], [cx + 14, cy - 40], [cx + 16, cy - 24]], P.brown1);
    poly([[cx - 16, cy - 24], [cx - 14, cy - 40], [cx - 6, cy - 44], [cx, cy - 40], [cx, cy - 24]], P.brown2);
    R(cx - 16, cy - 28, 32, 3, P.wood1);
    if (fake) { R(cx - 18, cy - 21, 36, 4, P.night0); D(cx - 14, cy - 18, 28, 14, P.night0, 2); }   // the dark under the brim
    else for (var d = 0; d < 8; d++) R(cx - 30 + d * 8, cy - 18 + ((S.t >> 2) + d * 3) % 9, 1, 2, P.fog);   // dripping
  }

  /* Owen, as the boy in the mirror. */
  function owen(cx, cy, o) {
    var k = SKIN.A;
    shoulders(cx, cy + 22, P.suit2, P.suit1, 30);
    [[cx - 20, cy + 34], [cx + 6, cy + 46], [cx - 12, cy + 60], [cx + 10, cy + 70]].forEach(function (r) {
      var flip = o.fake ? -1 : 1;   // the rockets on the copy point the same way as Owen's own
      R(r[0], r[1], 8, 3, P.paper); R(flip > 0 ? r[0] + 8 : r[0] - 2, r[1] + 1, 2, 1, P.red1); R(flip > 0 ? r[0] - 2 : r[0] + 8, r[1] + 1, 2, 1, P.lamp4);
    });
    R(cx - 6, cy + 22, 12, 3, P.suit0);
    neck(cx, cy + 12, k, 10);
    face(cx, cy, k, 13, 15);
    eyes(cx, cy + 2, { iris: '#5a7a4a', fake: o.fake, still: o.fake, seed: 5 });
    mouth(cx, cy - 2, o.fake ? 'smile' : 'calm', k);
    El(cx, cy - 11, 15, 8, P.brown1); D(cx + 2, cy - 18, 13, 8, P.brown0, 2);
    R(cx - 15, cy - 10, 4, 8, P.brown1); R(cx + 12, cy - 10, 4, 8, P.brown0);
    var cw = o.fake ? cx + 6 : cx - 8;   // the cowlick
    R(cw, cy - 22, 3, 5, P.brown1); R(cw + 1, cy - 24, 2, 3, P.brown2);
  }

  var people = {
    // Mom at bedtime, in the rocking chair with the book (real): looking down at the page
    momread: function () {
      mom({ part: 1, shawl: true, dy: 2 });
      // the book held open in her lap, pages lit by the lamp
      R(214, 128, 52, 22, P.red0); R(216, 126, 23, 22, P.paper); R(241, 126, 23, 22, P.paperShade); R(239, 126, 2, 22, P.paperDark);
      for (var i = 0; i < 6; i++) { R(218, 130 + i * 3, 18, 1, P.paperDark); R(243, 130 + i * 3, 18, 1, P.paperDark); }
      hand(214, 140, SKIN.A, true); hand(266, 140, SKIN.A, false);
    },
    // the Mom in the big bed (fake): her own shawl, hair parted the wrong way, a neck a little too long, that smile
    mom: function () {
      mom({ part: -1, shawl: true, fake: true, longNeck: true, mouth: 'smile' });
      // the covers over her lap, and her hands much too far apart on them
      R(140, 112, 200, 36, P.paperShade); R(140, 112, 200, 3, P.paper); D(140, 124, 200, 24, P.paperDark, 1);
      for (var q = 0; q < 6; q++) R(150 + q * 32, 116, 1, 32, P.paperDark);
      hand(192, 116, SKIN.A, true); hand(290, 116, SKIN.A, false);
      R(184, 112, 4, 6, P.skinA1); R(296, 112, 4, 6, P.skinA0);
    },
    // the Dad in the armchair (fake): watch on the wrong wrist, glasses that don't shine
    dad: function () {
      R(214, 128, 52, 22, P.suit1); D(240, 128, 26, 22, P.suit0, 2);       // jeans on the seat
      R(214, 148, 20, 16, P.suit1); R(246, 148, 20, 16, P.suit0);
      flannel(240, 94, 42);
      // forearms on the armrests
      poly([[194, 100], [208, 104], [208, 120], [192, 118]], P.red1); poly([[272, 104], [286, 100], [288, 118], [272, 120]], P.red0);
      hand(200, 122, SKIN.A, true); hand(280, 122, SKIN.A, false);
      R(194, 114, 12, 4, P.steel); R(198, 115, 4, 2, P.paper);   // the watch, on his right wrist
      R(274, 118, 14, 5, P.night1); R(276, 119, 3, 1, P.red1);    // remote
      dadHead(240, 62, { fake: true });
      R(290, 138, 5, 18, P.wood2); R(291, 134, 3, 5, P.wood2); R(290, 140, 1, 12, P.lamp3);   // the bottle
    },
    biscuit: function () { dogStanding({ fake: true, mud: true }); },
    // the boy in the bathroom mirror (fake), inside the glass
    mirror: function () {
      g.save(); g.beginPath(); g.rect(196, 26, 88, 78); g.clip();
      R(196, 26, 88, 78, P.night1); D(196, 26, 88, 78, P.night2, 1);
      R(256, 30, 24, 74, P.night0); R(258, 34, 12, 70, P.night2); El(264, 40, 5, 6, P.night3);   // the open door behind him, and something tall in it
      owen(240, 60, { fake: true });
      line(204, 30, 222, 48, P.fog);
      g.restore();
    },
    // Mrs. Albright behind the back door glass (fake): barefoot, beads that don't swing
    albright: function () {
      var cx = 240, cy = 62, k = SKIN.old;
      shoulders(cx, 94, P.pink, '#9a5a68', 40);
      R(cx - 36, 130, 72, 34, P.pink); D(cx, 130, 36, 34, '#9a5a68', 2);
      for (var y = 104; y < 166; y += 9) for (var x = cx - 36; x < cx + 36; x += 9) R(x + ((y / 9) & 1) * 4, y, 2, 2, P.paper);   // quilting
      poly([[cx - 10, 96], [cx + 10, 96], [cx, 116]], k.s1);
      neck(cx, 80, k);
      face(cx, cy, k, 17, 21);
      R(cx - 12, cy + 4, 4, 1, k.s0); R(cx + 9, cy + 4, 4, 1, k.s0); R(cx - 14, cy - 12, 3, 1, k.s0);   // lines
      eyes(cx, cy, { iris: P.blue, fake: true, still: true, brow: P.fog });
      R(cx - 13, cy - 6, 11, 8, P.lamp3); R(cx + 2, cy - 6, 11, 8, P.lamp3); R(cx - 12, cy - 5, 9, 6, P.night1); R(cx + 3, cy - 5, 9, 6, P.night1);
      R(cx - 10, cy - 4, 3, 2, P.blue); R(cx + 5, cy - 4, 3, 2, P.blue);
      // the glasses chain, hanging dead straight
      for (var b = 0; b < 8; b++) { R(cx - 14 - b, cy + 2 + b * 4, 1, 2, P.lamp3); R(cx + 13 + b, cy + 2 + b * 4, 1, 2, P.lamp3); }
      mouth(cx, cy, 'smile', k);
      // grey hair in pink curlers
      El(cx, cy - 21, 21, 9, P.fog); D(cx + 4, cy - 30, 18, 14, P.steel, 2);
      for (var c = 0; c < 5; c++) { var x2 = cx - 20 + c * 9; R(x2, cy - 30 + (c % 2) * 3, 7, 6, P.pink); R(x2 + 1, cy - 29 + (c % 2) * 3, 5, 1, P.paper); R(x2 + 3, cy - 30 + (c % 2) * 3, 1, 6, '#9a5a68'); }
      R(cx - 22, cy - 18, 6, 5, P.pink); R(cx + 16, cy - 18, 6, 5, '#9a5a68');
      // bare feet on the wet step
      El(222, 158, 8, 3, k.s2); El(258, 158, 8, 3, k.s1);
      for (var t = 0; t < 4; t++) { R(216 + t * 3, 156, 2, 2, k.s1); R(254 + t * 3, 156, 2, 2, k.s0); }
    },
    cop: function () { deputy(true); },
    deputy: function () { deputy(false); },
    // the real family, in the basement inside the iron
    family: function () {
      // Mom, behind Dad and to the right, scared
      g.save(); g.translate(62, 6);
      mom({ part: 1, shawl: false, dx: -2, mouth: 'open' });
      g.restore();
      // Biscuit, sitting at Dad's feet, panting, one ear inside out, red collar
      dogSitting(150, 162, { pant: true, flipEar: true });
      // Dad with the shotgun, pointed up the stairs at you
      g.save(); g.translate(-12, 0);
      flannel(240, 94, 42);
      dadHead(240, 62, { fake: false, mouth: 'grim', dy: -1, glare: P.lamp4 });
      R(196, 104, 76, 6, P.wood2); R(196, 104, 76, 2, P.wood3); R(182, 102, 16, 9, P.steel); R(182, 102, 16, 2, P.fog);
      El(186, 106, 2, 2, P.night0); El(193, 106, 2, 2, P.night0);
      hand(212, 112, SKIN.A, true); hand(262, 110, SKIN.A, false);
      R(258, 104, 12, 4, P.steel); R(262, 105, 4, 2, P.paper);   // his watch, on his left wrist
      g.restore();
    }
  };

  /* ---------- close-ups (32x24, scaled up in the zoom panel) ---------- */
  function Z(fn) { return function (z) { on(z, fn); }; }
  var zooms = {
    momHair: Z(function () {
      R(0, 0, 32, 24, P.brown1); D(0, 0, 32, 24, P.brown2, 1);
      R(10, 0, 2, 24, P.skinA2); R(8, 18, 16, 6, P.skinA1);
    }),
    momShawl: Z(function () { R(0, 0, 32, 24, P.fog); D(0, 0, 32, 24, P.steel, 2); for (var i = 0; i < 6; i++) R(i * 6, 20, 2, 4, P.paperShade); }),
    momEyes: Z(function () {
      R(0, 0, 32, 24, P.skinA1); D(0, 0, 32, 24, P.skinA2, 1);
      El(9, 12, 5, 3, P.paper); El(23, 12, 5, 3, P.paper); El(9, 12, 2, 2, P.acc1); El(23, 12, 2, 2, P.acc1);
      R(9, 12, 1, 1, P.acc2); R(23, 12, 1, 1, P.acc2);
    }),
    clock: Z(function () { R(0, 0, 32, 24, P.wood1); R(3, 6, 26, 12, P.night0); digits(g, '12:00', 6, 9, P.red1); }),
    watchWrong: Z(function () {
      R(0, 0, 32, 24, P.red0); R(0, 8, 32, 10, P.skinA1); R(10, 6, 12, 14, P.steel); El(16, 13, 4, 4, P.paper);
      R(16, 10, 1, 3, P.night0); R(16, 13, 3, 1, P.night0); digits(g, '2', 2, 1, P.paperShade);
    }),
    glasses: Z(function () {
      R(0, 0, 32, 24, P.skinA1); R(2, 8, 12, 9, P.night0); R(18, 8, 12, 9, P.night0); R(2, 8, 12, 1, P.steel); R(18, 8, 12, 1, P.steel); R(14, 10, 4, 1, P.steel);
    }),
    remote: Z(function () { R(0, 0, 32, 24, P.red0); R(6, 4, 20, 16, P.night1); R(8, 6, 4, 2, P.red1); for (var i = 0; i < 6; i++) R(9 + (i % 3) * 5, 10 + Math.floor(i / 3) * 4, 3, 2, P.night3); R(20, 4, 6, 4, P.night0); }),
    bottle: Z(function () { R(0, 0, 32, 24, P.wood1); R(4, 14, 22, 6, P.wood2); R(24, 15, 6, 4, P.wood2); R(6, 15, 14, 1, P.lamp3); }),
    collarBlue: Z(function () {
      R(0, 0, 32, 24, P.gold); D(0, 0, 32, 24, P.lamp3, 1);
      R(0, 6, 32, 6, P.blue); R(0, 6, 32, 1, P.blueHi);
      R(14, 12, 2, 3, P.steel); R(10, 15, 10, 4, P.paperShade); El(10, 15, 2, 2, P.paperShade); El(10, 19, 2, 2, P.paperShade);
    }),
    dogMouth: Z(function () { R(0, 0, 32, 24, P.gold); El(16, 14, 14, 8, P.lamp3); R(4, 10, 6, 4, P.night0); R(8, 18, 20, 1, P.wood2); }),
    paws: Z(function () { R(0, 0, 32, 24, P.paperShade); R(4, 4, 8, 16, P.gold); R(20, 4, 8, 16, P.gold); R(3, 16, 10, 5, P.brown1); R(19, 16, 10, 5, P.brown1); }),
    bowl: Z(function () { R(0, 0, 32, 24, P.paper); El(16, 14, 14, 7, P.red0); El(16, 13, 11, 4, P.night1); R(12, 12, 4, 1, P.fog); }),
    mirrorFace: Z(function () {
      R(0, 0, 32, 24, P.night1); El(16, 14, 11, 12, P.skinA1); El(15, 13, 8, 9, P.skinA2);
      El(16, 4, 12, 5, P.brown1); R(9, 0, 3, 4, P.brown1);
      R(11, 12, 3, 2, P.night0); R(18, 12, 3, 2, P.night0); R(11, 19, 10, 1, P.skinA0);
    }),
    rockets: Z(function () {
      R(0, 0, 32, 24, P.suit2);
      [[3, 4], [17, 10], [6, 16]].forEach(function (r) { R(r[0], r[1], 8, 3, P.paper); R(r[0] + 8, r[1] + 1, 2, 1, P.red1); R(r[0] - 2, r[1] + 1, 2, 1, P.lamp4); });
    }),
    toothpaste: Z(function () { R(0, 0, 32, 24, P.night2); D(0, 0, 32, 24, P.night3, 1); R(6, 6, 2, 2, P.paper); R(14, 10, 3, 2, P.paper); R(9, 16, 2, 1, P.paper); R(22, 7, 1, 1, P.paper); }),
    curlers: Z(function () { R(0, 0, 32, 24, P.paperShade); for (var i = 0; i < 4; i++) { R(2 + i * 8, 6, 6, 10, P.pink); R(3 + i * 8, 8, 4, 6, P.paper); } }),
    chain: Z(function () { R(0, 0, 32, 24, P.pink); D(0, 0, 32, 24, P.brown2, 1); for (var i = 0; i < 8; i++) R(4 + i * 3, 4 + i * 2, 2, 2, P.lamp3); R(20, 12, 10, 6, P.night3); }),
    bareFeet: Z(function () { R(0, 0, 32, 24, P.night1); R(0, 16, 32, 8, P.night3); El(9, 16, 6, 3, P.skinA2); El(23, 16, 6, 3, P.skinA2); for (var i = 0; i < 4; i++) R(2 + i * 8, 19, 1, 3, P.fog); }),
    darkHouse: Z(function () { R(0, 0, 32, 24, P.night1); poly([[4, 10], [16, 2], [28, 10]], P.night0); R(6, 10, 20, 14, P.night0); R(10, 14, 4, 4, P.night1); R(18, 14, 4, 4, P.night1); }),
    badgeWrong: Z(function () { R(0, 0, 32, 24, P.paperDark); star(16, 12); digits(g, '714', 10, 10, P.wood1, true); }),
    badgeRight: Z(function () { R(0, 0, 32, 24, P.paperDark); star(16, 12); digits(g, '714', 10, 10, P.wood1, false); }),
    hatDry: Z(function () { R(0, 0, 32, 24, P.night1); R(2, 14, 28, 4, P.brown1); R(8, 4, 16, 11, P.brown1); R(8, 12, 16, 2, P.wood2); }),
    hatWet: Z(function () {
      R(0, 0, 32, 24, P.night1); R(2, 14, 28, 4, P.brown1); R(8, 4, 16, 11, P.brown1); R(8, 12, 16, 2, P.wood2);
      for (var i = 0; i < 7; i++) R(3 + i * 4, 18 + (i % 3) * 2, 1, 2, P.fog); R(10, 6, 1, 1, P.fog); R(18, 8, 1, 1, P.fog);
    }),
    radio: Z(function () { R(0, 0, 32, 24, P.paperDark); R(10, 4, 12, 18, P.night1); R(12, 0, 2, 4, P.night3); R(12, 8, 8, 6, P.night3); for (var i = 0; i < 3; i++) R(12, 16 + i * 2, 8, 1, P.night3); }),
    copEyes: Z(function () { R(0, 0, 32, 24, P.skinB1); R(0, 0, 32, 8, P.brown1); R(0, 8, 32, 6, P.night0); R(8, 12, 3, 2, P.acc2); R(21, 12, 3, 2, P.acc2); }),
    book: Z(function () {
      R(0, 0, 32, 24, P.red0); R(2, 2, 13, 20, P.paper); R(17, 2, 13, 20, P.paper); R(15, 2, 2, 20, P.paperShade);
      for (var i = 0; i < 8; i++) { R(4, 5 + i * 2, 9, 1, P.paperDark); R(19, 5 + i * 2, 9, 1, P.paperDark); }
      poly([[24, 2], [30, 2], [30, 8]], P.paperShade);
    }),
    journal: Z(function () {
      R(0, 0, 32, 24, P.wood2); R(3, 2, 26, 20, P.paperShade);
      for (var i = 0; i < 8; i++) { var w = 22 - i * 2; R(5, 4 + i * 2, w, 1, i > 4 ? P.red0 : P.paperDark); }
    }),
    sneakers: Z(function () { R(0, 0, 32, 24, P.wood1); R(3, 10, 12, 7, P.red1); R(17, 10, 12, 7, P.red1); R(3, 16, 12, 2, P.paper); R(17, 16, 12, 2, P.paper); R(5, 11, 6, 2, P.paperShade); R(19, 11, 6, 2, P.paperShade); }),
    cordCut: Z(function () {
      R(0, 0, 32, 24, P.paperDark);
      for (var i = 0; i < 4; i++) R(4 + (i & 1) * 2, i * 3, 4, 3, P.paperShade);
      R(4, 12, 1, 4, P.red1); R(6, 12, 1, 5, '#4d6b3a'); R(8, 12, 1, 4, '#e0b84a'); R(10, 12, 1, 3, P.night0);
      R(20, 15, 1, 4, P.night0); R(22, 15, 1, 5, P.red1); R(24, 16, 1, 4, '#e0b84a'); R(26, 15, 1, 4, '#4d6b3a');
      for (var j = 0; j < 2; j++) R(20 + (j & 1) * 2, 19 + j * 3, 7, 3, P.paperShade);
    })
  };
  function star(cx, cy) {
    poly([[cx, cy - 10], [cx + 3, cy - 3], [cx + 10, cy - 3], [cx + 4, cy + 2], [cx + 7, cy + 10], [cx, cy + 5], [cx - 7, cy + 10], [cx - 4, cy + 2], [cx - 10, cy - 3], [cx - 3, cy - 3]], P.gold);
  }

  /* ---------- the family photo, for the torn-photo puzzle (96x64) ---------- */
  function photo(ctx) {
    on(ctx, function () {
      R(0, 0, 96, 64, P.paper);
      R(3, 3, 90, 58, P.lamp4); D(3, 3, 90, 30, P.paper, 1);           // a sunny afternoon
      R(3, 40, 90, 21, P.wood2); for (var y = 44; y < 61; y += 4) R(3, y, 90, 1, P.wood1);   // the porch
      R(70, 6, 20, 34, P.paperShade); R(74, 12, 12, 28, P.wood1);      // the front door
      // Mom (left)
      R(16, 24, 18, 22, P.blue); El(25, 18, 7, 8, P.brown1); El(25, 19, 5, 6, P.skinA2); R(18, 18, 3, 12, P.brown1); R(30, 18, 3, 12, P.brown1);
      // Owen (middle, small)
      R(42, 32, 12, 14, P.red1); El(48, 27, 5, 6, P.skinA2); El(48, 23, 5, 3, P.brown1);
      // Dad (right), his watch on his left wrist
      R(56, 20, 18, 26, P.red1); D(56, 20, 18, 26, P.red0, 2); El(65, 14, 7, 8, P.skinA2); R(60, 10, 11, 3, P.brown1);
      R(61, 13, 4, 2, P.night0); R(66, 13, 4, 2, P.night0);
      R(74, 30, 4, 6, P.skinA2); R(74, 32, 4, 2, P.steel);
      // Biscuit in front: tongue out, one ear inside out, RED collar
      El(48, 52, 14, 7, P.gold); El(34, 47, 7, 6, P.gold); R(30, 41, 3, 5, P.wood3); R(37, 40, 3, 3, P.pink);
      R(31, 47, 2, 1, P.night0); R(36, 47, 2, 1, P.night0); R(33, 51, 2, 3, P.pink);
      R(37, 49, 4, 5, P.red1); R(38, 54, 2, 2, P.paperShade);
      R(60, 48, 3, 2, P.gold);
    });
  }

  /* ---------- the flash: three tones, then a stepped fade (shared Fireside effect) ---------- */
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

  /* ---------- Owen's eyelids (the blink that replaces the flash) ---------- */
  function lids(now) {
    var b = S.blink; if (!b) return;
    var t = now - b.start, K = b.keys, f = K[K.length - 1][1];
    for (var i = 1; i < K.length; i++) {
      if (t < K[i][0]) { var a = K[i - 1], c = K[i], u = (t - a[0]) / (c[0] - a[0]); u = u * u * (3 - 2 * u); f = a[1] + (c[1] - a[1]) * u; break; }
    }
    if (f <= 0.001) return;
    var half = Math.ceil(H / 2 * f);
    R(0, 0, W, half, P.night0); R(0, H - half, W, half, P.night0);
    D(0, half, W, 6, P.night0, 2); D(0, H - half - 6, W, 6, P.night0, 2);
    if (f > 0.97) R(0, 0, W, H, P.night0);
  }

  /* ---------- frame ---------- */
  function render(ctx, now) {
    g = ctx;
    if (!S.still) S.t++;

    if (S.move) {
      var m = S.move, p = Math.min(1, (now - m.start) / m.ms);
      var v = Math.round((m.from + (m.to - m.from) * p) / 2) * 2;
      if (m.axis === 'x') S.vx = v; else S.vy = v;
      if (p >= 1) { var done = m.done; S.move = null; if (done) done(); }
    }

    if (S.backdrop === 'taken' && S.takenFor !== S.backdrop + S.loop) { S.takenFor = S.backdrop + S.loop; S.takenAt = S.t; }
    if (S.backdrop !== 'taken') S.takenFor = null;
    var room = S.backdrop === 'black' || S.backdrop === 'taken' ? S.backdrop : S.room;
    var draw = rooms[room] || rooms.black;
    var keep = S.room; S.room = room;
    draw();
    if (S.person && people[S.person] && room !== 'black' && room !== 'taken') {
      g.save();
      g.beginPath(); g.rect(VIEW.x, VIEW.y, VIEW.w, VIEW.h); g.clip();
      g.translate(S.vx, S.vy);
      people[S.person]();
      g.restore();
    }
    if (room === 'frontdoor' || room === 'backdoor') glassOver(room === 'backdoor');
    darkness();
    R(0, HORIZON - 1, W, 1, P.night0);
    foreground();
    S.room = keep;

    lids(now);

    if (S.flashT >= 0) {
      var idx = S.flashReverse ? FLASH_STEPS.length - 1 - S.flashT : S.flashT;
      if (S.flashT >= FLASH_STEPS.length) { S.flashT = -1; }
      else {
        if (idx < 14) posterize();
        var a = FLASH_STEPS[idx];
        if (a) { g.globalAlpha = a; R(0, 0, W, H, P.flash); g.globalAlpha = 1; }
        S.flashSub = (S.flashSub || 0) + 1;
        if (S.flashSub % 3 === 0) S.flashT++;
      }
    }
  }

  E.art = {
    P: P, W: W, H: H, HORIZON: HORIZON, VIEW: VIEW,
    inView: function (p) { return p.x >= VIEW.x && p.x < VIEW.x + VIEW.w && p.y >= VIEW.y && p.y < VIEW.y + VIEW.h; },
    state: S,
    people: people,
    zooms: zooms,
    rooms: rooms,
    photo: photo,
    digits: digits,
    render: render,
    enterFrom: -300, exitTo: 300, fallTo: 110,
    props: [],   // the notebook lives in the top bar; the floor is for the text panel
    kit: {
      P: P, S: S,
      R: function (x, y, w, h, c) { R(x, y, w, h, c); },
      El: function (cx, cy, rx, ry, c) { El(cx, cy, rx, ry, c); },
      poly: function (pts, c) { poly(pts, c); },
      D: function (x, y, w, h, c, d, oval) { D(x, y, w, h, c, d, oval); },
      digits: function (str, x, y, c, flip) { digits(g, str, x, y, c, flip); },
      fill: fill,
      on: on
    }
  };
})();
