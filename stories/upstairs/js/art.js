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
    blue0: '#24365c', blue: '#3d5f9e', blueHi: '#6a8ac8', pink: '#c98290', gold: '#b8862e',
    olive0: '#232a1e', olive1: '#38432c', olive2: '#56633f',      // the Whitlocks' wallpaper, downstairs and in the hall
    rose0: '#3a2430', rose1: '#5e3a48', rose2: '#8a5a68',         // Mom and Dad's room
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
    if (room === 'bedtime' || room === 'black' || room === 'taken' || room === 'car') return;
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

  /* ---------- the house kit ----------
   * Every room is the same house, so every room is built from the same pieces:
   * the same six-panel doors in the same casing, the same baseboard, the same
   * oak floor running the same way, windows with the same sills. A door is
   * 64 wide and 112 tall wherever it stands, and the back wall meets the floor
   * at y=146. People who come close to Owen are drawn big, in front of all this.
   */
  function seeded(n) { var x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); }

  function crown(col, hi) { R(0, 0, W, 4, col); R(0, 4, W, 1, hi); R(0, 5, W, 1, P.night0); }
  function baseboard(col, hi) { R(0, 136, W, 10, col); R(0, 136, W, 1, hi); R(0, 138, W, 1, P.wood0); R(0, 145, W, 1, P.night0); }
  // the floor strip between the back wall and the bottom of the picture; the boards run toward Owen
  function boards(a, b, c) {
    R(0, 146, W, 20, a);
    for (var i = -14; i <= 14; i++) line(240 + i * 22, 146, 240 + i * 30, 166, b);
    for (var k = 0; k < 26; k++) {
      var y = 148 + Math.floor(seeded(k) * 16), x = Math.floor(seeded(k + 40) * W);
      R(x, y, 9 + Math.floor(seeded(k + 9) * 10), 1, b);
    }
    D(0, 146, W, 3, P.night0, 2);
    if (c) for (var j = 0; j < 12; j++) R(Math.floor(seeded(j + 70) * W), 150 + Math.floor(seeded(j + 90) * 14), 6, 1, c);
  }
  // trim round any opening: lit top and left, shadowed right
  function casing(x, y, w, h, col) {
    col = col || [P.wood1, P.wood2, P.wood3];
    R(x - 6, y - 6, w + 12, h + 6, col[1]);
    R(x - 6, y - 6, w + 12, 1, col[2]); R(x - 6, y - 6, 1, h + 6, col[2]);
    R(x + w + 5, y - 6, 1, h + 6, col[0]); R(x - 3, y - 3, w + 6, 1, col[0]);
    R(x - 6, y - 8, w + 12, 2, col[2]); R(x - 7, y - 8, 1, 2, col[1]); R(x + w + 6, y - 8, 1, 2, col[0]);   // the head trim
  }
  // the house door: six raised panels, brass knob on the right, hinges on the left
  function door(x, y, w, h, o) {
    o = o || {};
    var c = o.col || [P.wood1, P.wood2, P.wood3];
    casing(x, y, w, h, o.trim);
    if (o.open) {
      R(x, y, w, h, P.night0);
      D(x, y + h - 40, w, 40, P.night1, 1);          // the floor of the dark room beyond
      R(x, y, 3, h, P.night1);                        // the edge of the open door, against the jamb
      return;
    }
    R(x, y, w, h, c[1]);
    var m = 6, pw = Math.floor((w - m * 3) / 2), rows = [[m, Math.round(h * 0.2)], [0, Math.round(h * 0.4)], [0, Math.round(h * 0.25)]], py = y;
    rows.forEach(function (r, i) {
      py += (i ? m : r[0]);
      var ph = r[1];
      for (var col = 0; col < 2; col++) {
        var px = x + m + col * (pw + m);
        R(px, py, pw, ph, c[0]); R(px + 2, py + 2, pw - 4, ph - 4, c[1]);
        R(px, py, pw, 1, c[2]); R(px, py, 1, ph, c[2]);
        R(px + 2, py + ph - 3, pw - 4, 1, c[0]);
      }
      py += ph;
    });
    D(x + Math.floor(w / 2), y, Math.ceil(w / 2), h, c[0], 1);     // the far half is out of the light
    // knob, plate, hinges
    var kx = x + w - 8, ky = y + Math.round(h * 0.52);
    R(kx - 1, ky - 6, 4, 12, c[0]); El(kx + 1, ky, 3, 3, P.wood0); El(kx, ky - 1, 2, 2, P.lamp3); R(kx - 1, ky - 2, 1, 1, P.lamp4);
    R(x + 1, y + 14, 2, 8, P.wood0); R(x + 1, y + h - 22, 2, 8, P.wood0);
  }
  // a window on the night: o.view(x, y, w, h) draws what's outside, o.curtain = [dark, mid, light]
  function windowOn(x, y, w, h, o) {
    o = o || {};
    casing(x, y, w, h);
    g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
    R(x, y, w, h, P.night1); D(x, y, w, Math.round(h * 0.45), P.night0, 2);
    if (o.view) o.view(x, y, w, h);
    // the old wavy glass catches a line of light
    for (var s = 0; s < 3; s++) line(x + 6 + s * 3, y + 4, x + 22 + s * 3, y + 20, s === 1 ? P.steel : P.night3);
    g.restore();
    // sash and muntins
    R(x + Math.floor(w / 2) - 2, y, 4, h, P.wood1); R(x + Math.floor(w / 2) - 2, y, 1, h, P.wood2);
    R(x, y + Math.floor(h / 2) - 2, w, 4, P.wood2); R(x, y + Math.floor(h / 2) - 2, w, 1, P.wood3);
    // the sill
    R(x - 9, y + h, w + 18, 4, P.wood3); R(x - 9, y + h + 4, w + 18, 2, P.wood1); R(x - 9, y + h, w + 18, 1, P.lamp3);
    if (o.curtain) curtains(x - 14, y - 10, w + 28, h + 30, o.curtain, o.tied);
  }
  function curtains(x, y, w, h, c, tied) {
    R(x - 2, y - 3, w + 4, 3, P.wood3); El(x - 3, y - 2, 2, 2, P.wood3); El(x + w + 2, y - 2, 2, 2, P.wood3);   // the rod
    [[x, 1], [x + w - 18, -1]].forEach(function (p) {
      var px = p[0], dir = p[1];
      for (var yy = 0; yy < h; yy++) {
        // gathered at the tie-back two thirds down, then flaring
        var pinch = tied ? Math.max(0, 6 - Math.abs(yy - h * 0.62) * 0.35) : 0;
        var x0 = dir > 0 ? px : px + Math.round(pinch), wv = 18 - Math.round(pinch);
        R(x0, y + yy, wv, 1, c[1]);
        for (var f = 0; f < wv; f += 5) R(x0 + f, y + yy, 2, 1, c[0]);
        R(dir > 0 ? x0 + 1 : x0 + wv - 2, y + yy, 1, 1, c[2]);
      }
      if (tied) R(dir > 0 ? px : px + 6, y + Math.round(h * 0.62) - 1, 12, 3, c[2]);
    });
  }
  // the woods behind the house, black, with one white birch in them
  function woods(x, y, w, h, o) {
    o = o || {};
    El(x + w - 16, y + 12, 6, 6, P.night3); El(x + w - 15, y + 11, 4, 4, P.fog);           // the moon, low
    for (var t = 0; t < 9; t++) {
      var tx = x + 4 + t * (w / 8), th = 24 + Math.floor(seeded(t + 3) * 18);
      poly([[tx - 7, y + h], [tx, y + h - th - 12], [tx + 7, y + h]], P.night0);
      R(tx - 1, y + h - 8, 2, 8, P.night0);
    }
    if (o.birch !== false) {   // a birch tree. Probably a birch tree.
      var bx = x + Math.round(w * 0.38);
      R(bx, y + h - 34, 3, 34, P.paperShade); R(bx, y + h - 34, 1, 34, P.paper);
      for (var k = 0; k < 5; k++) R(bx, y + h - 30 + k * 6, 2, 1, P.night1);
      line(bx + 1, y + h - 30, bx - 6, y + h - 40, P.paperDark); line(bx + 2, y + h - 24, bx + 8, y + h - 32, P.paperDark);
    }
    if (o.rain) for (var r = 0; r < 12; r++) R(x + (r * 13) % w, y + ((S.still ? 0 : S.t >> 1) * 3 + r * 17) % h, 1, 3, P.steel);
  }
  function frame(x, y, w, h, inner) {
    R(x - 3, y - 3, w + 6, h + 6, P.wood1); R(x - 3, y - 3, w + 6, 1, P.wood3); R(x - 3, y - 3, 1, h + 6, P.wood3);
    R(x - 1, y - 1, w + 2, h + 2, P.wood0); R(x, y, w, h, inner || P.night2);
  }
  function clock(x, y, txt, blink) {
    R(x, y, 24, 12, P.night0); R(x, y, 24, 1, P.night3); R(x + 1, y + 11, 22, 1, P.night1);
    R(x + 2, y + 2, 20, 8, '#140a0c');
    if (!blink || flick(5)) digits(g, txt, x + 3, y + 3, P.red1);
  }
  // moving boxes: it's the first night in the new house
  function box(x, y, w, h, label) {
    R(x, y, w, h, P.wood3); R(x, y, w, 2, P.lamp3); R(x, y, 1, h, P.lamp3); D(x + Math.floor(w / 2), y + 2, Math.ceil(w / 2), h - 2, P.wood2, 1);
    R(x + Math.floor(w / 2) - 1, y, 3, Math.min(10, h), P.paperShade);          // the tape
    R(x, y + h - 1, w, 1, P.wood1);
    if (label) {   // marker, in Mom's capitals
      for (var i = 0; i < label; i++) R(x + 5 + i * 4, y + Math.floor(h / 2) + 2, 3, 4, P.wood0);
    }
  }
  function outlet(x, y, glow) {
    R(x, y, 6, 9, P.paperShade); R(x, y, 6, 1, P.paper);
    if (glow) { R(x + 1, y + 2, 4, 5, P.lamp3); R(x + 2, y + 3, 2, 3, P.lamp4); D(x - 6, y - 4, 18, 18, P.lamp3, 1, true); }
    else { R(x + 2, y + 2, 1, 2, P.wood0); R(x + 2, y + 6, 1, 2, P.wood0); }
  }
  function switchPlate(x, y) { R(x, y, 6, 10, P.paperShade); R(x, y, 6, 1, P.paper); R(x + 2, y + 3, 2, 4, P.paper); R(x + 2, y + 6, 2, 1, P.paperDark); }
  function horseshoe(x, y) {
    R(x, y, 3, 12, P.steel); R(x + 9, y, 3, 12, P.steel); R(x, y + 10, 12, 3, P.steel); R(x + 1, y + 1, 1, 9, P.fog);
    R(x + 1, y + 3, 1, 1, P.night1); R(x + 10, y + 3, 1, 1, P.night1); R(x + 5, y + 11, 1, 1, P.night1);
    R(x + 5, y - 3, 2, 3, P.wood0);   // its nail
  }
  function rockers(cx, y, half, col, hi) {
    for (var x = -half; x <= half; x++) {
      var yy = y - Math.round(Math.pow(x / half, 2) * 5);
      R(cx + x, yy, 1, 4, col); R(cx + x, yy, 1, 1, hi);
    }
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
      // olive damask over a painted wainscot: the Whitlocks' wallpaper, which Mom hates
      R(0, 0, W, 136, P.olive1);
      for (var y = 10; y < 92; y += 14) for (var x = ((y / 14) & 1) * 9; x < W; x += 18) {
        R(x + 3, y, 2, 1, P.olive2); R(x + 2, y + 1, 4, 1, P.olive2); R(x + 1, y + 2, 6, 1, P.olive0); R(x + 2, y + 3, 4, 1, P.olive2); R(x + 3, y + 4, 2, 1, P.olive2);
      }
      R(0, 92, W, 44, P.paperDark); R(0, 92, W, 3, P.paperShade); R(0, 95, W, 1, P.wood0);
      for (var p = 6; p < W; p += 40) { R(p, 102, 30, 28, P.paperShade); R(p + 1, 103, 28, 26, P.paperDark); R(p, 129, 30, 1, P.paperShade); }
      crown(P.paperShade, P.paper);
      baseboard(P.paperShade, P.paper);
      boards(P.wood2, P.wood1, P.wood3);
      // the runner down the hall
      R(120, 148, 240, 18, P.red0); R(124, 150, 232, 14, P.red1); D(124, 150, 232, 14, P.red0, 2);
      for (var f = 0; f < 6; f++) R(140 + f * 40, 155, 8, 4, P.lamp3);
      // the attic hatch in the ceiling, and the ring for Dad's hook
      R(196, 0, 88, 10, P.paper); R(200, 0, 80, 7, P.paperShade); R(200, 7, 80, 1, P.paperDark);
      El(240, 9, 3, 2, P.steel); R(239, 8, 2, 1, P.night0);
      // the smoke detector, blinking green
      El(140, 10, 6, 3, P.paper); R(136, 10, 9, 1, P.paperShade); if ((S.t % 90) < 6) R(139, 11, 2, 1, '#6ac86a');
      // parents' door (left), bathroom door (right)
      door(40, 34, 64, 112);
      switchPlate(114, 76);
      door(300, 34, 64, 112);
      // the stairs down (far right): the stairwell, a banister at railing height, its newel post
      R(396, 28, 84, 118, P.night0); D(396, 28, 84, 50, P.night1, 1);
      for (var s = 0; s < 5; s++) { R(396 + s * 16, 108 + s * 8, 84 - s * 16, 2, P.night2); }
      R(392, 94, 88, 4, P.wood3); R(392, 94, 88, 1, P.lamp3); R(392, 98, 88, 1, P.wood0);
      for (var b = 0; b < 6; b++) { R(400 + b * 14, 99, 3, 47, P.wood2); R(400 + b * 14, 99, 1, 47, P.wood3); }
      R(386, 86, 10, 60, P.wood3); R(386, 86, 3, 60, P.lamp3); R(384, 82, 14, 6, P.wood3); El(391, 80, 5, 3, P.wood3); R(394, 88, 2, 58, P.wood1);
      // the hall table, its lamp (off), and a picture of woods that came with the house
      frame(150, 40, 46, 34, P.night2);
      g.save(); g.beginPath(); g.rect(150, 40, 46, 34); g.clip();
      R(150, 40, 46, 34, P.olive0); for (var tr = 0; tr < 7; tr++) { R(153 + tr * 6, 46 + (tr % 2) * 3, 2, 28, P.paperShade); R(153 + tr * 6, 50 + tr % 3 * 4, 2, 1, P.night1); }
      R(150, 68, 46, 6, P.olive1); R(171, 56, 4, 18, P.night1);   // a path going in
      g.restore();
      R(150, 108, 80, 4, P.wood3); R(150, 108, 80, 1, P.lamp3); R(150, 112, 80, 6, P.wood2);
      R(154, 118, 4, 28, P.wood2); R(222, 118, 4, 28, P.wood1); R(154, 134, 72, 2, P.wood1);
      R(176, 96, 8, 12, P.paperShade); R(178, 92, 4, 4, P.wood3); poly([[170, 92], [190, 92], [186, 80], [174, 80]], P.paper); poly([[180, 92], [190, 92], [186, 80], [180, 80]], P.paperShade);
      R(204, 100, 14, 8, P.night2); R(205, 101, 12, 6, P.blue);     // a little dish for Dad's keys (empty)
      // boxes nobody has unpacked yet
      box(240, 110, 34, 26, 4); box(246, 92, 26, 18, 3);
      // Pepper, outside their door, back up
      if (!has('momGone')) pepper(118, 112);
    },

    parents: function () {
      // dusty rose stripes, a window with heavy curtains, the big bed with its posts
      R(0, 0, W, 136, P.rose1);
      for (var x = 0; x < W; x += 12) { R(x, 0, 4, 136, P.rose0); R(x + 6, 0, 1, 136, P.rose2); }
      D(0, 0, W, 136, P.rose0, 1);
      crown(P.wood2, P.wood3); baseboard(P.wood2, P.wood3);
      boards(P.wood2, P.wood1, P.wood3);
      windowOn(28, 30, 54, 62, { view: function (x, y, w, h) { woods(x, y, w, h, { birch: false }); }, curtain: [P.red0, '#7a2a32', P.red1], tied: true });
      // a framed print over the bed
      frame(214, 10, 52, 18, P.paperShade); R(218, 14, 44, 10, P.rose2); R(222, 18, 36, 4, P.olive2);
      // the bed: headboard with posts and finials, pillows, the quilt and the skirt
      R(132, 32, 8, 114, P.wood2); R(340, 32, 8, 114, P.wood1); R(132, 32, 2, 114, P.wood3);
      El(136, 28, 5, 5, P.wood3); El(344, 28, 5, 5, P.wood2); R(134, 24, 4, 2, P.lamp3);
      R(140, 40, 200, 70, P.wood2); R(140, 40, 200, 3, P.wood3);
      for (var pn = 0; pn < 4; pn++) { R(148 + pn * 48, 50, 40, 52, P.wood1); R(150 + pn * 48, 52, 36, 48, P.wood2); R(150 + pn * 48, 52, 36, 1, P.wood3); }
      D(240, 43, 100, 67, P.wood1, 1);
      if (!S.person) {
        El(194, 104, 34, 10, P.paperShade); El(192, 102, 30, 8, P.paper); El(286, 104, 34, 10, P.paperDark); El(284, 102, 30, 8, P.paperShade);
        // a dent in Mom's pillow; the covers thrown back
        El(194, 103, 12, 3, P.paperShade);
        poly([[150, 116], [250, 110], [330, 114], [330, 124], [150, 126]], P.paper);
      }
      bedQuilt();
      // nightstands: Mom's (left) with the phone off the hook and her glass of water, Dad's (right) with the clock
      R(92, 102, 36, 44, P.wood2); R(92, 102, 36, 3, P.wood3); R(96, 110, 28, 12, P.wood1); R(108, 115, 4, 2, P.lamp3); R(94, 140, 3, 6, P.wood1); R(123, 140, 3, 6, P.wood1);
      R(98, 94, 18, 8, P.paperShade); R(98, 94, 18, 2, P.paper); R(100, 96, 4, 2, P.night3);       // the phone's base
      R(104, 90, 22, 4, P.paper); R(104, 90, 4, 6, P.paper); R(122, 90, 4, 6, P.paper);              // its handset, off the hook
      if (!S.still && (S.t % 40) < 20) R(102, 97, 2, 1, P.red1);
      R(118, 92, 6, 10, P.fog); R(119, 94, 4, 7, P.steel); R(119, 93, 4, 1, P.paper);               // the water glass
      R(352, 102, 36, 44, P.wood1); R(352, 102, 36, 3, P.wood2); R(356, 110, 28, 12, P.wood0); R(368, 115, 4, 2, P.lamp3);
      clock(358, 90, '1200', true);
      // the closet: louvered doors, one open a crack
      casing(404, 30, 64, 116);
      R(404, 30, 64, 116, P.wood2);
      for (var lv = 0; lv < 2; lv++) {
        var lx = 404 + lv * 33;
        R(lx + 3, 36, 25, 48, P.wood1); for (var sl = 0; sl < 11; sl++) { R(lx + 4, 38 + sl * 4, 23, 2, P.wood2); R(lx + 4, 38 + sl * 4, 23, 1, P.wood3); }
        R(lx + 3, 90, 25, 50, P.wood1); R(lx + 5, 92, 21, 46, P.wood2); R(lx + 5, 92, 21, 1, P.wood3);
      }
      R(435, 30, 3, 116, P.night0);
      R(431, 86, 2, 6, P.lamp3); R(440, 86, 2, 6, P.lamp3);
    },

    bathroom: function () {
      // white tile to the chair rail, little blue sailboats above it
      R(0, 0, W, 136, P.paperShade);
      for (var y = 10; y < 66; y += 16) for (var x = ((y / 16) & 1) * 14; x < W; x += 28) {
        poly([[x + 4, y + 6], [x + 4, y], [x + 9, y + 6]], P.blueHi); R(x + 1, y + 7, 10, 2, P.blue);
      }
      for (var ty = 72; ty < 136; ty += 8) R(0, ty, W, 1, P.paperDark);
      for (var tx = 0; tx < W; tx += 8) R(tx, 72, 1, 64, P.paperDark);
      D(0, 72, W, 64, P.paper, 1);
      R(0, 66, W, 6, P.blue); R(0, 66, W, 1, P.blueHi); R(0, 71, W, 1, P.night2);
      crown(P.paper, P.paper);
      R(0, 136, W, 10, P.paper); R(0, 136, W, 1, P.paper); R(0, 145, W, 1, P.paperDark);
      // the floor: little hexagon tile
      R(0, 146, W, 20, P.paperShade);
      for (var hy = 146; hy < 166; hy += 4) for (var hx = ((hy / 4) & 1) * 3; hx < W; hx += 6) R(hx, hy, 1, 1, P.paperDark);
      D(0, 146, W, 3, P.night0, 2);
      // the tub (left), its curtain on rings, half drawn
      R(4, 98, 150, 48, P.paper); R(4, 98, 150, 4, P.fog); R(8, 102, 142, 2, P.paperShade); D(80, 104, 74, 42, P.paperShade, 1);
      El(16, 146, 5, 3, P.lamp3); El(144, 146, 5, 3, P.lamp3);   // claw feet
      R(4, 8, 152, 3, P.steel); R(4, 8, 152, 1, P.fog);
      for (var c = 0; c < 104; c++) {
        var wv = (c % 8) < 4 ? P.blueHi : P.blue;
        R(6 + c, 12, 1, 88, wv);
        if (c % 8 === 0) { El(6 + c, 11, 2, 2, P.fog); R(6 + c, 12, 1, 88, P.paper); }
      }
      for (var fi = 0; fi < 8; fi++) { var fx = 14 + (fi % 4) * 24, fy = 26 + Math.floor(fi / 4) * 34 + (fi % 2) * 8; El(fx, fy, 4, 2, P.paper); R(fx + 4, fy - 1, 2, 3, P.paper); R(fx - 3, fy, 1, 1, P.night1); }
      D(60, 12, 50, 88, P.blue, 1);
      // a towel on its bar
      R(162, 60, 26, 2, P.steel); R(164, 62, 22, 34, P.red1); R(164, 62, 22, 2, '#d65a5a'); D(176, 62, 10, 34, P.red0, 1); R(164, 90, 22, 2, P.paper);
      // the medicine cabinet mirror over the sink
      R(190, 20, 100, 90, P.fog); R(190, 20, 100, 1, P.paper); R(192, 22, 96, 86, P.steel);
      R(196, 26, 88, 78, P.night1); D(196, 26, 88, 78, P.night2, 1);
      if (!S.person) {
        // the dark doorway behind Owen, and Owen himself, a shape in the glass
        R(258, 30, 22, 74, P.night0);
        El(240, 70, 13, 15, P.night2); R(226, 84, 28, 20, P.night2); El(240, 58, 13, 8, P.night3);
      }
      line(204, 30, 222, 48, P.fog); line(206, 30, 226, 50, P.night3); line(262, 84, 276, 98, P.night3);
      // the sink: basin, faucet, the toothbrush cup
      R(184, 110, 112, 8, P.paper); R(184, 110, 112, 2, P.fog); El(240, 114, 30, 3, P.paperShade);
      R(238, 102, 4, 8, P.steel); R(234, 102, 12, 2, P.fog); R(226, 106, 4, 4, P.fog); R(250, 106, 4, 4, P.fog);
      R(200, 100, 8, 10, P.blueHi); R(202, 94, 2, 8, P.red1); R(205, 92, 2, 10, P.lamp3);
      R(270, 102, 14, 8, P.paperShade); R(270, 102, 14, 2, P.paper);   // the toothpaste, uncapped
      R(198, 118, 84, 28, P.wood2); R(198, 118, 84, 1, P.wood3); R(201, 121, 37, 22, P.wood1); R(242, 121, 37, 22, P.wood1); R(234, 128, 2, 6, P.lamp3); R(244, 128, 2, 6, P.lamp3);
      // Owen's stepstool, until he takes it
      if (!has('hasStool')) { R(220, 134, 40, 6, P.blueHi); R(220, 140, 40, 2, P.blue); R(222, 142, 5, 14, P.blue); R(253, 142, 5, 14, P.blue); R(224, 136, 32, 1, P.paper); }
      // the door (right), and the nightlight
      door(380, 34, 64, 112);
      outlet(360, 112, true);
      if (S.room === 'bathroom') {
        // toothpaste spots on the glass
        R(204, 92, 1, 1, P.paper); R(209, 95, 2, 1, P.paper); R(206, 98, 1, 1, P.paper);
      }
    },

    attic: function () {
      // under the roof: plank walls, rafters coming down both sides, the round window in the gable
      R(0, 0, W, HORIZON, P.wood0);
      for (var x = 0; x < W; x += 9) { R(x, 0, 1, 146, P.night0); R(x + 1, 0, 1, 146, P.wood1); }
      D(0, 0, W, 146, P.night0, 1);
      poly([[0, 0], [228, 0], [0, 118]], P.wood1); poly([[480, 0], [252, 0], [480, 118]], P.wood1);
      for (var i = 0; i < 7; i++) {
        line(228 - i * 2, 0, i * 34, 118 - i * 18, P.wood2); line(229 - i * 2, 0, i * 34 + 1, 118 - i * 18, P.wood3);
        line(252 + i * 2, 0, 480 - i * 34, 118 - i * 18, P.wood2); line(251 + i * 2, 0, 479 - i * 34, 118 - i * 18, P.wood0);
      }
      D(0, 0, 228, 118, P.wood0, 1);
      // pink insulation between the rafters, here and there
      [[30, 80], [90, 50], [380, 52], [430, 80]].forEach(function (p) { D(p[0], p[1], 24, 18, P.pink, 1); });
      // the floor: wide old boards
      R(0, 118, W, 48, P.wood1); for (var y = 124; y < 166; y += 7) R(0, y, W, 1, P.wood0);
      for (var j = 0; j < 14; j++) R(Math.floor(seeded(j + 5) * W), 120 + Math.floor(seeded(j + 6) * 44), 1, 6, P.wood0);
      // the round window, full of moon, or full of trees
      El(240, 46, 26, 26, P.wood3); El(240, 46, 24, 24, P.wood2); El(240, 46, 20, 20, P.night1);
      g.save(); g.beginPath(); g.arc(240, 46, 20, 0, Math.PI * 2); g.clip();
      if (S.backdrop === 'candles') beechwood(220, 26, 40, 40);
      else { D(220, 26, 40, 20, P.night0, 2); El(232, 38, 7, 7, P.fog); El(234, 36, 6, 6, P.paper); woods(220, 26, 40, 40, { birch: false }); }
      g.restore();
      R(220, 45, 40, 2, P.wood2); R(239, 26, 2, 40, P.wood2);
      // the Whitlocks' junk: a trunk, boxes, a dress form, a rocking horse with no eyes
      R(26, 98, 60, 34, P.brown1); R(26, 98, 60, 4, P.brown2); R(26, 112, 60, 2, P.lamp3); R(52, 108, 8, 8, P.lamp3); D(56, 102, 30, 30, P.brown0, 1);
      box(66, 70, 40, 28, 4); box(372, 92, 46, 38, 0); box(424, 78, 40, 52, 3);
      El(126, 74, 11, 15, P.night3); El(124, 72, 8, 12, P.steel); R(125, 89, 2, 34, P.night3); poly([[118, 122], [134, 122], [126, 116]], P.night3);
      poly([[322, 112], [342, 98], [352, 98], [362, 112], [354, 112], [348, 104], [336, 112]], P.wood3); El(338, 96, 10, 6, P.paperShade); R(330, 92, 4, 4, P.paperShade); R(350, 100, 4, 8, P.wood3);
      rockers(342, 122, 22, P.wood2, P.wood3);
      // the crate the notebook sits on
      R(388, 128, 40, 22, P.wood2); for (var cb = 0; cb < 3; cb++) R(388, 131 + cb * 7, 40, 1, P.wood1); R(396, 124, 18, 4, P.paperShade); R(396, 124, 18, 1, P.paper);
      // the circle: salt, then chalk marks, nails all round, candle stubs, the little sneakers in the middle
      El(240, 146, 100, 18, P.paper); El(240, 146, 97, 16, P.wood1); El(240, 146, 86, 13, P.paperShade); El(240, 146, 84, 12, P.wood1);
      for (var m = 0; m < 12; m++) {
        var a = m / 12 * Math.PI * 2, mx = 240 + Math.cos(a) * 91, my = 146 + Math.sin(a) * 14;
        R(mx - 2, my, 5, 1, P.paperShade); R(mx, my - 1, 1, 3, P.paperShade);
      }
      for (var n = 0; n < 22; n++) {
        var na = n / 22 * Math.PI * 2, nx = 240 + Math.cos(na) * 100, ny = 146 + Math.sin(na) * 18;
        R(nx, ny - 2, 1, 3, P.fog); R(nx - 1, ny - 2, 3, 1, P.steel);
      }
      for (var k = 0; k < 6; k++) {
        var b = k / 6 * Math.PI * 2 + 0.3, cx = Math.round(240 + Math.cos(b) * 106), cy = Math.round(146 + Math.sin(b) * 22);
        R(cx - 2, cy - 8, 5, 8, P.paper); R(cx + 1, cy - 8, 2, 8, P.paperShade); R(cx - 3, cy - 1, 7, 2, P.paperShade); R(cx, cy - 10, 1, 2, P.night0);
        if (S.backdrop === 'candles') { El(cx, cy - 13, 1, 2 + flick(2), P.acc2); R(cx - 1, cy - 12, 3, 1, P.acc1); D(cx - 8, cy - 22, 17, 16, P.acc1, 1, true); }
      }
      sneakers(226, 141);
      // dust in the air, drifting through the light
      if (has('hasLight')) for (var d = 0; d < 14; d++) R(170 + (d * 37 + (S.still ? 0 : S.t >> 3)) % 140, 40 + (d * 23 + (S.still ? 0 : S.t >> 4)) % 80, 1, 1, P.paperShade);
    },

    foyer: function () {
      // the front hall: the same olive paper as upstairs, oak wainscot, the stairs going up
      R(0, 0, W, 136, P.olive1);
      for (var y = 10; y < 80; y += 14) for (var x = ((y / 14) & 1) * 9; x < W; x += 18) {
        R(x + 3, y, 2, 1, P.olive2); R(x + 2, y + 1, 4, 1, P.olive2); R(x + 1, y + 2, 6, 1, P.olive0); R(x + 2, y + 3, 4, 1, P.olive2); R(x + 3, y + 4, 2, 1, P.olive2);
      }
      R(0, 82, W, 54, P.wood1); R(0, 82, W, 3, P.wood3); R(0, 85, W, 1, P.wood0);
      for (var px = 4; px < W; px += 32) { R(px, 92, 26, 38, P.wood0); R(px + 1, 93, 24, 36, P.wood1); R(px, 92, 26, 1, P.wood2); R(px, 92, 1, 38, P.wood2); }
      crown(P.wood2, P.wood3); baseboard(P.wood2, P.wood3);
      boards(P.wood2, P.wood1, P.wood3);
      R(30, 150, 90, 16, P.red0); R(32, 152, 86, 12, P.night3); D(32, 152, 86, 12, P.red0, 1);   // the doormat
      // the front door (left): a window in it, rain on the window, a sidelight beside it
      door(40, 34, 64, 112);
      R(48, 40, 48, 30, P.wood0); R(50, 42, 44, 26, P.night1);
      for (var r = 0; r < 8; r++) R(52 + r * 5, 42 + ((S.still ? 0 : S.t >> 2) + r * 7) % 24, 1, 3, P.fog);
      R(71, 42, 2, 26, P.wood1); R(50, 54, 44, 2, P.wood1);
      R(112, 34, 10, 112, P.wood2); R(114, 38, 6, 70, P.night1); for (var sr = 0; sr < 3; sr++) R(116, 40 + ((S.still ? 0 : S.t >> 1) + sr * 21) % 66, 1, 3, P.fog);
      // coat hooks: Mom's red coat, Dad's barn jacket
      R(136, 46, 54, 4, P.wood3); R(136, 46, 54, 1, P.lamp3);
      for (var h = 0; h < 3; h++) R(142 + h * 20, 50, 2, 4, P.steel);
      poly([[138, 54], [150, 52], [154, 96], [134, 98]], P.red1); D(144, 54, 10, 44, P.red0, 1); R(143, 60, 2, 2, P.paper); R(143, 70, 2, 2, P.paper);
      poly([[158, 54], [172, 52], [178, 92], [156, 94]], P.brown2); D(166, 54, 12, 40, P.brown1, 1); R(160, 54, 10, 6, P.wood0);
      // the little table under the hooks, with the bowl for the keys
      R(132, 104, 56, 4, P.wood3); R(134, 108, 4, 38, P.wood2); R(182, 108, 4, 38, P.wood1);
      El(160, 102, 10, 3, P.blue); El(160, 101, 7, 1, P.night2);
      // the basement door (middle), the two horseshoes over it, lantern light under it
      door(210, 34, 64, 112);
      if (has('hasKey')) { R(266, 86, 3, 8, P.steel); R(266, 86, 3, 1, P.fog); }
      horseshoe(222, 14); horseshoe(250, 14);
      R(210, 145, 64, 1, P.lamp3); D(204, 146, 76, 4, P.lamp3, 1);
      // the stairs going up (right): stringer, treads, balusters, the rail
      poly([[318, 146], [480, 10], [480, 146]], P.wood1);
      for (var s = 0; s < 9; s++) { var sx = 318 + s * 18, sy = 130 - s * 15; R(sx, sy, 162 - s * 18, 3, P.wood3); R(sx, sy + 3, 162 - s * 18, 12, P.wood2); R(sx, sy + 3, 162 - s * 18, 1, P.wood0); }
      for (var bl = 0; bl < 9; bl++) { var bx = 326 + bl * 18, by = 124 - bl * 15; R(bx, by - 34, 2, 34, P.wood3); R(bx + 1, by - 34, 1, 34, P.wood1); }
      line(316, 92, 480, -46, P.wood3); line(316, 93, 480, -45, P.lamp3); line(316, 94, 480, -44, P.wood1);
      R(310, 84, 10, 62, P.wood3); R(310, 84, 3, 62, P.lamp3); R(308, 80, 14, 6, P.wood3); El(315, 78, 6, 3, P.lamp3);
      // static light from the living room, flickering on the wall
      if (!S.still && (S.t % 7) < 4) D(280, 20, 30, 116, P.fog, 1);
    },

    living: function () {
      // the Whitlocks' wood paneling; the fireplace and mantel (left), the sofa, Dad's armchair, the TV
      R(0, 0, W, 136, P.wood1);
      for (var x = 0; x < W; x += 14) { R(x, 0, 1, 136, P.wood0); R(x + 6, 0, 1, 136, P.wood2); if ((x / 14) % 3 === 0) R(x + 3, 0, 1, 136, P.wood0); }
      crown(P.wood2, P.wood3); baseboard(P.wood2, P.wood3);
      boards(P.wood2, P.wood1, P.wood3);
      D(300, 20, 180, 126, P.steel, 1, true);    // the TV's glow on the paneling
      // the rug
      R(120, 150, 240, 16, P.red0); R(124, 152, 232, 12, P.olive1); D(124, 152, 232, 12, P.red0, 1); R(124, 157, 232, 1, P.lamp3);
      // the fireplace: brick, firebox, the mantel shelf
      R(18, 64, 120, 82, P.red0);
      for (var by = 64; by < 146; by += 5) for (var bx = 18 + ((by / 5) & 1) * 6; bx < 138; bx += 12) R(bx, by, 1, 5, P.wood0);
      for (var bh = 64; bh < 146; bh += 5) R(18, bh, 120, 1, P.wood0);
      D(18, 64, 120, 82, P.red1, 1);
      R(44, 94, 68, 52, P.night0); R(44, 94, 68, 2, P.wood0); R(50, 136, 56, 4, P.steel);   // the firebox and its grate
      R(10, 58, 136, 6, P.wood3); R(10, 58, 136, 1, P.lamp3); R(12, 64, 132, 2, P.wood0);
      // on the mantel: the brass clock, two candlesticks, and the empty frame where the picture was
      R(28, 44, 4, 14, P.lamp3); R(27, 44, 6, 1, P.lamp4); R(124, 44, 4, 14, P.lamp3); R(123, 44, 6, 1, P.lamp4);
      frame(64, 28, 30, 26, P.night0); R(66, 30, 26, 22, P.wood0);
      if (has('photoDone')) { R(66, 30, 26, 22, P.lamp4); R(70, 38, 6, 12, P.blue); R(80, 40, 6, 10, P.red1); R(76, 46, 6, 5, P.gold); }
      El(108, 48, 7, 7, P.lamp3); El(108, 48, 5, 5, P.paper); R(108, 45, 1, 3, P.night0); R(108, 48, 3, 1, P.night0); R(103, 55, 10, 3, P.lamp3);
      // the sofa, against the wall
      R(150, 92, 48, 54, P.brown1); R(150, 92, 48, 3, P.brown2); R(150, 110, 48, 14, P.brown2); R(150, 124, 48, 22, P.brown1); R(152, 142, 4, 4, P.wood0);
      // Dad's armchair (middle): a big wingback, so whoever sits in it is framed by it
      armchair();
      // a floor lamp (off)
      R(312, 54, 3, 92, P.wood2); poly([[302, 54], [324, 54], [320, 36], [306, 36]], P.paperShade); R(306, 144, 16, 2, P.wood2);
      // the TV on its stand, all static, the VCR blinking 12:00 under it
      R(344, 58, 108, 80, P.night2); R(344, 58, 108, 2, P.steel); R(350, 64, 82, 62, P.night0);
      for (var i = 0; i < 180; i++) {
        var sx = 352 + ((i * 37 + (S.still ? 0 : S.t * 13)) % 78), sy = 66 + ((i * 53 + (S.still ? 0 : S.t * 7)) % 58);
        R(sx, sy, 2, 1, i % 3 ? P.fog : P.paper);
      }
      R(436, 70, 10, 4, P.night1); for (var kn = 0; kn < 4; kn++) R(437, 80 + kn * 8, 8, 5, P.night1);
      line(380, 58, 368, 30, P.steel); line(410, 58, 424, 28, P.steel);   // rabbit ears
      R(348, 138, 100, 8, P.wood2); R(348, 138, 100, 1, P.wood3);
      R(356, 128, 50, 10, P.night1); R(358, 130, 14, 2, P.night3); clock(386, 127, '1200', true);
      // the torn picture on the rug, until it's picked up
      if (!has('hasPieces')) {
        [[210, 152, 8, 6], [226, 156, 7, 5], [242, 151, 9, 6], [258, 155, 6, 6], [272, 152, 7, 5], [196, 158, 6, 4]].forEach(function (pc, n) {
          R(pc[0], pc[1], pc[2], pc[3], n & 1 ? P.paper : P.paperShade); R(pc[0] + 1, pc[1] + 1, pc[2] - 2, 1, n & 1 ? P.lamp3 : P.blue);
        });
      }
      box(452, 112, 28, 24, 2);
    },

    kitchen: function () {
      // harvest-gold check wallpaper, wood cabinets, the window over the sink, the back door with its glass
      R(0, 0, W, 136, P.paperShade);
      for (var y = 0; y < 136; y += 8) for (var x = ((y / 8) & 1) * 8; x < W; x += 16) R(x, y, 8, 8, '#bfa77a');
      for (var gy = 4; gy < 136; gy += 8) R(0, gy, W, 1, P.paperDark);
      crown(P.wood2, P.wood3);
      // the floor: big black and cream linoleum squares
      R(0, 136, W, 10, P.wood2); R(0, 136, W, 1, P.wood3); R(0, 145, W, 1, P.night0);
      R(0, 146, W, 20, P.paper);
      for (var fx = -12; fx < 12; fx++) for (var fr = 0; fr < 2; fr++) if ((fx + fr) & 1) poly([[240 + fx * (20 + fr * 3), 146 + fr * 10], [240 + (fx + 1) * (20 + fr * 3), 146 + fr * 10], [240 + (fx + 1) * (23 + fr * 3), 156 + fr * 10], [240 + fx * (23 + fr * 3), 156 + fr * 10]], P.night3);
      D(0, 146, W, 3, P.night0, 2);
      // the fridge (left): magnets, a crayon drawing, the calendar
      R(18, 26, 70, 120, P.paper); R(18, 26, 70, 2, P.fog); R(18, 26, 2, 120, P.fog); R(18, 70, 70, 2, P.paperShade); D(54, 28, 34, 118, P.paperShade, 1);
      R(80, 40, 3, 22, P.steel); R(80, 80, 3, 40, P.steel);
      R(28, 82, 30, 24, P.paper); R(28, 82, 30, 1, P.paperShade);   // the drawing: our new house, a dog, four people
      poly([[32, 94], [42, 86], [52, 94]], P.red1); R(34, 94, 16, 10, P.lamp3); R(40, 98, 4, 6, P.wood2); R(54, 98, 1, 6, P.blue); R(56, 98, 1, 6, P.blue); El(36, 104, 3, 1, P.gold);
      El(32, 82, 2, 2, P.red1); El(54, 82, 2, 2, P.blue); R(62, 90, 6, 6, P.lamp4); R(64, 112, 8, 6, '#4d6b3a');
      R(28, 34, 26, 30, P.paper); R(28, 34, 26, 8, P.red1); for (var cg = 0; cg < 20; cg++) R(30 + (cg % 5) * 5, 44 + Math.floor(cg / 5) * 5, 3, 3, P.paperShade);   // the calendar: October
      // the upper cabinets, the counter, the lower cabinets
      R(104, 10, 236, 44, P.wood2); for (var c = 104; c < 340; c += 47) { R(c, 10, 2, 44, P.wood0); R(c + 4, 14, 39, 36, P.wood1); R(c + 6, 16, 35, 32, P.wood2); R(c + 6, 16, 35, 1, P.wood3); R(c + 38, 40, 2, 6, P.lamp3); }
      R(104, 54, 236, 2, P.wood0);
      R(100, 94, 244, 6, P.paper); R(100, 94, 244, 1, P.fog); R(100, 100, 244, 2, P.paperDark);
      R(104, 102, 236, 44, P.wood2);
      for (var d = 104; d < 340; d += 47) { R(d, 102, 2, 44, P.wood0); R(d + 4, 106, 39, 36, P.wood1); R(d + 6, 108, 35, 32, P.wood2); R(d + 6, 108, 35, 1, P.wood3); R(d + 20, 110, 6, 2, P.lamp3); }
      D(222, 56, 118, 90, P.wood1, 1);
      // the window over the sink, with a cafe curtain; the faucet and the dish rack
      casing(178, 60, 84, 30);
      R(178, 60, 84, 30, P.night1); g.save(); g.beginPath(); g.rect(178, 60, 84, 30); g.clip(); woods(178, 50, 84, 40, { birch: false }); g.restore();
      R(219, 60, 2, 30, P.wood1);
      R(178, 74, 84, 16, P.paper); for (var cc = 0; cc < 84; cc += 6) R(178 + cc, 74, 3, 16, P.paperShade); R(176, 73, 88, 1, P.steel);
      R(218, 84, 4, 10, P.steel); R(214, 84, 12, 2, P.fog);
      R(270, 82, 30, 12, P.paperShade); for (var dr = 0; dr < 6; dr++) R(272 + dr * 5, 76, 1, 18, P.fog); El(280, 82, 6, 6, P.blueHi);
      // the toaster and the microwave
      R(124, 82, 20, 12, P.fog); R(124, 82, 20, 2, P.paper); R(128, 80, 4, 2, P.night1); R(136, 80, 4, 2, P.night1);
      R(300, 72, 36, 22, P.night2); R(302, 74, 22, 18, P.night0); R(326, 74, 8, 18, P.night1); if (!S.still && (S.t % 60) < 30) digits(g, '1200', 302, 86, '#4d8a4a');
      // the phone on the wall, its cord cut (until it's fixed)
      R(356, 50, 22, 40, P.paper); R(356, 50, 22, 2, P.fog); R(358, 54, 18, 10, P.paperShade); R(360, 68, 14, 18, P.paperShade);
      for (var kb = 0; kb < 9; kb++) R(362 + (kb % 3) * 4, 70 + Math.floor(kb / 3) * 5, 2, 3, P.paperDark);
      R(380, 50, 6, 36, P.paper); R(380, 50, 6, 3, P.paperShade);                      // the handset
      if (has('called')) { for (var k = 0; k < 12; k++) R(381 + (k & 1) * 2, 88 + k * 4, 3, 3, P.paperShade); }
      else {
        for (var j = 0; j < 4; j++) R(381 + (j & 1) * 2, 88 + j * 4, 3, 3, P.paperShade);
        R(380, 104, 1, 3, P.red1); R(382, 104, 1, 4, P.lamp4); R(384, 104, 1, 3, P.night0); R(386, 104, 1, 2, '#4d6b3a');
        for (var j2 = 0; j2 < 4; j2++) R(381 + (j2 & 1) * 2, 130 + j2 * 4, 3, 3, P.paperShade);
        R(380, 127, 1, 3, P.night0); R(382, 126, 1, 4, P.red1); R(384, 127, 1, 3, P.lamp4); R(386, 128, 1, 2, '#4d6b3a');
      }
      // the back door (right), its window with the curtain pushed aside
      door(404, 34, 64, 112);
      R(412, 40, 48, 40, P.wood0); R(414, 42, 44, 36, P.night1);
      g.save(); g.beginPath(); g.rect(414, 42, 44, 36); g.clip(); woods(414, 42, 44, 36, { birch: true }); g.restore();
      R(414, 42, 10, 36, P.paper); for (var cu = 0; cu < 10; cu += 3) R(414 + cu, 42, 1, 36, P.paperShade);
      if (has('albrightGone')) { El(440, 60, 4, 6, P.fog); R(436, 49, 1, 7, P.fog); R(439, 47, 1, 8, P.fog); R(442, 48, 1, 8, P.fog); R(445, 50, 1, 7, P.fog); R(447, 56, 3, 1, P.fog); }
      // Biscuit's bowls on their mat
      R(150, 150, 50, 10, P.red0); El(164, 154, 9, 3, P.red1); El(164, 153, 6, 1, P.night1); El(186, 154, 9, 3, P.steel); El(186, 153, 6, 1, P.blue);
    },

    basement: function () {
      // block walls, joists and ducts overhead, the furnace and water heater, the stairs Owen is on
      R(0, 0, W, 146, P.night3);
      for (var y = 22; y < 146; y += 10) { R(0, y, W, 1, P.night2); for (var x = ((y / 10) & 1) * 10; x < W; x += 20) R(x, y, 1, 10, P.night2); }
      D(0, 22, W, 124, P.steel, 1);
      R(0, 0, W, 22, P.night1); for (var j = 0; j < W; j += 30) { R(j, 0, 8, 22, P.wood1); R(j, 0, 2, 22, P.wood2); }
      R(0, 14, W, 6, P.steel); R(0, 14, W, 1, P.fog); R(0, 19, W, 1, P.night1);    // the duct
      R(0, 24, W, 2, '#8a5a2e');                                                     // a copper pipe
      R(0, 146, W, 20, P.night2); D(0, 146, W, 20, P.night1, 1);
      for (var cr = 0; cr < 4; cr++) line(60 + cr * 110, 148 + cr % 2 * 6, 90 + cr * 110, 160, P.night1);
      // the little window up by the furnace
      R(300, 30, 44, 16, P.wood1); R(302, 32, 40, 12, S.backdrop === 'dawn' ? P.pink : P.night0);
      if (S.backdrop === 'dawn') { D(302, 32, 40, 6, P.lamp4, 1); D(270, 46, 100, 100, P.pink, 1, true); }
      // the furnace and the water heater
      R(360, 40, 70, 106, P.night1); R(360, 40, 70, 2, P.night3); R(364, 46, 62, 1, P.night2); R(372, 70, 30, 20, P.night0);
      R(378, 76, 18, 8, P.lamp3); if (!S.still) R(380 + (S.t >> 2) % 12, 78, 3, 4, P.lamp4);
      R(386, 22, 12, 18, P.steel); for (var r = 0; r < 4; r++) R(366, 100 + r * 8, 58, 2, P.night2);
      R(440, 60, 32, 86, P.fog); R(440, 60, 32, 2, P.paper); El(456, 60, 16, 3, P.fog); D(456, 62, 16, 84, P.steel, 1); R(446, 120, 8, 6, P.night1);
      // shelves of paint cans and jars
      R(150, 50, 70, 3, P.wood2); R(150, 90, 70, 3, P.wood2);
      [[154, 38], [168, 40], [182, 36], [198, 40], [156, 78], [174, 80], [192, 76]].forEach(function (c, i) {
        R(c[0], c[1], 10, 12, i % 2 ? P.fog : P.steel);
        R(c[0], c[1], 10, 2, P.paper); R(c[0] + 2, c[1] + 4, 6, 3, [P.red1, P.blue, P.lamp3, '#4d6b3a'][i % 4]);
      });
      // the stairs Owen is standing on (left), open treads going up into the dark
      for (var s = 0; s < 7; s++) { R(0, 22 + s * 18, 100 - s * 12, 4, P.wood2); R(0, 22 + s * 18, 100 - s * 12, 1, P.wood3); R(0, 26 + s * 18, 100 - s * 12, 1, P.wood0); }
      R(96, 22, 3, 124, P.wood1); line(100, 22, 18, 146, P.wood2);
      // the iron ring on the floor, horseshoes in it
      El(240, 156, 150, 10, P.night1);
      for (var n = 0; n < 34; n++) {
        var a = n / 34 * Math.PI * 2, nx = 240 + Math.cos(a) * 146, ny = 156 + Math.sin(a) * 8;
        R(nx, ny - 3, 1, 4, P.fog); R(nx - 1, ny - 3, 3, 1, P.steel);
      }
      horseshoe(116, 148); horseshoe(352, 148);
      // sleeping bags and the camping lantern
      R(150, 146, 60, 10, P.blue); R(150, 146, 60, 2, P.blueHi); R(270, 148, 56, 8, P.red0); R(270, 148, 56, 1, P.red1);
      R(300, 126, 14, 20, P.night1); R(302, 130, 10, 12, P.lamp4); R(304, 132, 6, 8, P.paper); R(300, 124, 14, 3, P.steel); R(305, 120, 4, 4, P.steel);
    },

    frontdoor: function () { glassDoor(false); },
    backdoor: function () { glassDoor(true); },

    // the patrol car, at the bottom of the driveway: the house through the wet windshield
    car: function () {
      R(0, 0, W, HORIZON, P.night0); D(0, 0, W, 60, P.night1, 1);
      woods(0, 50, W, 70, { birch: true });
      // the house: the porch light off, one window lit upstairs (Owen's), somebody in it
      poly([[150, 60], [240, 20], [330, 60]], P.night1); R(160, 60, 160, 70, P.night2); D(160, 60, 160, 70, P.night1, 2);
      R(152, 58, 176, 3, P.night3); R(170, 100, 140, 3, P.night3); for (var pp = 0; pp < 6; pp++) R(172 + pp * 27, 100, 3, 30, P.night3);
      R(228, 108, 22, 22, P.night0); R(186, 72, 18, 20, P.night0); R(276, 72, 18, 20, P.night0);
      R(212, 68, 20, 22, P.lamp3); R(213, 69, 18, 20, P.lamp4); R(221, 68, 2, 22, P.wood1); R(212, 78, 20, 2, P.wood1);
      // someone at Owen's window, waving with the wrong hand
      El(222, 78, 3, 3, P.night0); R(219, 82, 7, 8, P.night0); R(227 + flick(4), 74, 2, 8, P.night0);
      R(0, 130, W, 36, P.night1); R(200, 130, 80, 36, P.night2);   // the lawn, the driveway
      // red and blue on everything
      var on = !S.still && (S.t >> 3) % 2;
      D(0, 0, W, HORIZON, on ? P.red0 : P.blue, 1);
      // rain on the windshield, and the wiper
      for (var r = 0; r < 40; r++) { var rx = (r * 53) % W, ry = (r * 31 + (S.still ? 0 : S.t)) % HORIZON; R(rx, ry, 1, 2 + r % 3, P.steel); }
      var wa = S.still ? 0 : (S.t % 120) / 120 * Math.PI;
      line(240, 166, Math.round(240 - Math.cos(wa) * 200), Math.round(166 - Math.sin(wa) * 120), P.night0);
      R(0, 150, W, 16, P.night0); R(0, 150, W, 1, P.night2);   // the dashboard edge
    }
  };

  function sneakers(x, y) {
    // little red velcro sneakers, side by side
    R(x, y, 12, 6, P.red1); R(x, y + 5, 12, 2, P.paper); R(x + 2, y + 1, 6, 1, P.paperShade); R(x + 2, y + 3, 6, 1, P.paperShade); R(x + 9, y - 1, 3, 2, P.red0);
    R(x + 16, y, 12, 6, P.red1); R(x + 16, y + 5, 12, 2, P.paper); R(x + 18, y + 1, 6, 1, P.paperShade); R(x + 18, y + 3, 6, 1, P.paperShade); R(x + 25, y - 1, 3, 2, P.red0);
    D(x + 6, y, 6, 5, P.red0, 1); D(x + 22, y, 6, 5, P.red0, 1);
  }
  // the beech-wood, through the round window, once the candles light: white trunks, a path, a boy on it
  function beechwood(x, y, w, h) {
    R(x, y, w, h, P.night1); El(x + w - 10, y + 8, 4, 4, P.paper);
    for (var t = 0; t < 7; t++) { var tx = x + 2 + t * 6; R(tx, y, 2, h, t % 2 ? P.paper : P.paperShade); R(tx, y + 6 + t * 3, 2, 1, P.night1); }
    poly([[x + 16, y + h], [x + 19, y + 22], [x + 21, y + 22], [x + 26, y + h]], P.paperDark);
    // the boy: small, dark, red at the feet, waving the wrong way round
    R(x + 19, y + 18, 3, 5, P.night0); El(x + 20, y + 16, 1, 1, P.night0); R(x + 22, y + 14 - flick(4), 1, 4, P.night0); R(x + 19, y + 23, 3, 1, P.red1);
  }

  // Mom and Dad's quilt: it comes toward Owen, so it runs off the bottom of the picture
  function bedQuilt() {
    poly([[140, 110], [340, 110], [356, 166], [124, 166]], P.rose2);
    for (var row = 0; row < 4; row++) {
      var y0 = 112 + row * 14, inset = Math.round((row * 14) * 16 / 56);
      for (var q = 0; q < 8; q++) {
        var w0 = (200 + inset * 2) / 8, x0 = 140 - inset + q * w0;
        R(x0 + 2, y0 + 1, w0 - 4, 11, ((q + row) & 1) ? P.rose1 : P.paper);
        R(x0 + 2, y0 + 1, w0 - 4, 1, ((q + row) & 1) ? P.rose2 : P.paperShade);
      }
    }
    R(140, 110, 200, 2, P.pink);
    D(240, 110, 116, 56, P.rose0, 1);
  }
  function armchair() {
    // a wingback, red, its wings framing the head of whoever sits in it
    var c0 = P.red0, c1 = '#7a2a32', c2 = P.red1;
    R(192, 38, 96, 100, c1); El(240, 40, 48, 10, c1); R(192, 38, 96, 2, c2);
    for (var tf = 0; tf < 4; tf++) for (var tr = 0; tr < 3; tr++) R(204 + tf * 24, 52 + tr * 22, 2, 2, c0);   // buttons
    poly([[176, 44], [196, 40], [200, 102], [178, 108]], c2); poly([[284, 40], [304, 44], [302, 108], [280, 102]], c0);   // wings
    R(176, 96, 26, 50, c1); R(176, 96, 26, 6, c2); El(189, 98, 13, 5, c2);
    R(278, 96, 26, 50, c0); R(278, 96, 26, 6, c1); El(291, 98, 13, 5, c1);
    R(200, 112, 80, 34, c1); R(200, 112, 80, 4, c2); D(240, 112, 40, 34, c0, 1);
    R(180, 140, 120, 6, c0); for (var f = 0; f < 12; f++) R(182 + f * 10, 140, 1, 6, P.wood0);   // the skirt
    R(182, 146, 4, 3, P.wood0); R(294, 146, 4, 3, P.wood0);
  }
  function armchairFront() {
    // the arms again, over Dad's sleeves
    var c0 = P.red0, c1 = '#7a2a32', c2 = P.red1;
    R(176, 100, 24, 46, c1); El(188, 101, 12, 5, c2); R(176, 104, 24, 2, c2);
    R(280, 100, 24, 46, c0); El(292, 101, 12, 5, c1); R(280, 104, 24, 2, c1);
  }

  function bedroom(lit) {
    // Owen's room: wallpaper with little moons, the window on the woods, his dresser, Mom's rocking chair, boxes
    var w0 = lit ? P.night2 : P.night1, w1 = lit ? P.night3 : P.night2, w2 = lit ? P.steel : P.night3;
    R(0, 0, W, 136, w1);
    for (var y = 10; y < 132; y += 18) for (var x = ((y / 18) & 1) * 15; x < W; x += 30) {
      if (((x + y) / 6) & 1) { El(x + 3, y + 3, 3, 3, w2); El(x + 5, y + 2, 3, 3, w1); }
      else { R(x + 2, y + 3, 5, 1, w2); R(x + 4, y + 1, 1, 5, w2); }
    }
    D(0, 0, W, 136, w0, 1);
    crown(P.wood2, P.wood3); baseboard(P.wood2, P.wood3);
    boards(P.wood2, P.wood1, P.wood3);
    // glow-in-the-dark stars Dad stuck up on the first night, faint green
    [[60, 18], [150, 12], [190, 24], [300, 14], [350, 26], [420, 12], [110, 30]].forEach(function (s) { R(s[0], s[1], 3, 1, '#6a8a6a'); R(s[0] + 1, s[1] - 1, 1, 3, '#6a8a6a'); });
    // the lamp's warm circle on the wall (bedtime only)
    if (lit) { D(234, 20, 200, 120, P.lamp3, 1, true); D(274, 40, 120, 80, P.lamp4, 1, true); }
    // the window on the woods (left)
    windowOn(26, 28, 74, 70, { view: function (x, y, w, h) { woods(x, y, w, h); }, curtain: [P.blue0, P.blue, P.blueHi], tied: true });
    // a planets poster, taped up crooked
    R(118, 22, 44, 56, P.night0); R(118, 22, 44, 1, P.night2);
    El(130, 34, 5, 5, P.lamp3); El(129, 33, 3, 3, P.lamp4); El(148, 44, 4, 4, P.blueHi); El(134, 56, 6, 6, P.wood3); R(124, 56, 20, 1, P.paperShade);
    El(152, 64, 3, 3, P.red1); for (var st = 0; st < 8; st++) R(120 + (st * 13) % 40, 24 + (st * 7) % 50, 1, 1, P.paper);
    R(116, 20, 6, 4, P.paperShade); R(158, 20, 6, 4, P.paperShade); R(116, 76, 6, 4, P.paperShade);
    // the dresser: Game Boy, the clock, a toy rocket
    R(110, 92, 80, 54, P.wood2); R(108, 90, 84, 4, P.wood3); R(108, 90, 84, 1, P.lamp3);
    for (var d = 0; d < 3; d++) { R(114, 98 + d * 15, 72, 12, P.wood1); R(115, 99 + d * 15, 70, 1, P.wood3); El(132, 104 + d * 15, 2, 1, P.lamp3); El(168, 104 + d * 15, 2, 1, P.lamp3); }
    D(150, 94, 40, 52, P.wood1, 1);
    R(118, 79, 10, 11, P.paperShade); R(118, 79, 10, 1, P.paper); R(120, 81, 6, 4, '#5a6a3a'); R(124, 86, 2, 2, P.red1); R(120, 87, 2, 1, P.night1);
    clock(160, 78, lit ? '840' : '307');
    R(140, 70, 4, 20, P.paper); poly([[140, 70], [142, 64], [144, 70]], P.red1); R(138, 84, 2, 6, P.red1); R(144, 84, 2, 6, P.red1);
    // the nightstand and its lamp, between the chair and the door
    R(318, 108, 34, 38, P.wood2); R(316, 106, 38, 3, P.wood3); R(320, 116, 30, 12, P.wood1); R(333, 121, 4, 2, P.lamp3);
    R(332, 90, 6, 16, lit ? P.lamp3 : P.wood3); El(335, 105, 7, 2, P.wood3);
    poly([[322, 90], [348, 90], [344, 72], [326, 72]], lit ? P.lamp4 : P.paperDark); poly([[335, 90], [348, 90], [344, 72], [335, 72]], lit ? P.lamp3 : P.night3);
    if (lit) { R(326, 90, 18, 1, P.paper); }
    // moving boxes by the door: TOYS, BOOKS
    box(440, 104, 40, 32, 4); box(446, 80, 32, 24, 5); box(440, 136, 36, 10, 0);
    // the nightlight, plugged in by the door
    outlet(360, 120, true);
    // the door (right), open on the dark hall
    door(374, 30, 60, 116, { open: true });
    if (S.backdrop === 'dad') dadInDoor();
    // Mom's rocking chair, close by the bed
    rockingChair(lit);
  }

  // Mom's rocking chair: spindle back with a curved top rail, arms, rockers. Big, because it's right by the bed.
  function rockingChair(lit) {
    var c0 = P.wood1, c1 = P.wood2, c2 = P.wood3;
    rockers(240, 158, 72, c1, c2);
    // the back posts and the curved top rail, with finials
    R(194, 24, 7, 132, c1); R(194, 24, 2, 132, c2); R(279, 24, 7, 132, c0); R(279, 24, 2, 132, c1);
    El(197, 20, 4, 4, c2); El(282, 20, 4, 4, c1);
    for (var x = 194; x <= 286; x++) {
      var yy = 26 - Math.round(7 * (1 - Math.pow((x - 240) / 46, 2)));
      R(x, yy, 1, 10, x < 240 ? c1 : c0); R(x, yy, 1, 1, c2);
    }
    // spindles, and the rail across the middle
    for (var s = 0; s < 7; s++) { var sx = 206 + s * 11; R(sx, 34, 4, 80, s < 3 ? c1 : c0); R(sx, 34, 1, 80, c2); }
    R(198, 80, 84, 3, c1); R(198, 80, 84, 1, c2);
    // the seat, with Mom's cushion on it
    R(184, 112, 112, 10, c1); R(184, 112, 112, 2, c2); R(184, 120, 112, 2, c0);
    R(196, 106, 88, 8, P.red0); R(196, 106, 88, 2, P.red1); for (var t = 0; t < 4; t++) R(206 + t * 22, 109, 2, 2, P.night1);
    // front legs and the stretcher between them
    R(188, 122, 6, 36, c1); R(188, 122, 2, 36, c2); R(286, 122, 6, 36, c0); R(194, 140, 92, 3, c0);
    if (!lit && !S.person) {
      // the book, open face down on the cushion, where she left it
      poly([[214, 108], [240, 98], [266, 108], [262, 112], [218, 112]], P.red0); R(239, 98, 2, 12, P.red1);
      R(218, 110, 44, 2, P.paper); R(222, 104, 12, 1, P.lamp3); R(246, 104, 12, 1, P.lamp3);
    }
    if (!S.person) rockingChairArms();
    if (!lit && !S.person) shawlOnArm();
  }
  // her shawl, over the arm of the chair: a knitted wrap, blue-grey, with a fringe, hanging nearly to the floor
  function shawlOnArm() {
    El(287, 92, 20, 5, P.fog); R(268, 90, 38, 2, P.paperShade);
    poly([[268, 94], [306, 94], [310, 118], [306, 136], [296, 142], [286, 138], [278, 128], [272, 110]], P.fog);
    poly([[290, 94], [306, 94], [310, 118], [306, 136], [296, 142]], P.steel);
    for (var r = 0; r < 8; r++) for (var c = 0; c < 6; c++) {
      var x = 274 + c * 6 + (r & 1) * 3, y = 98 + r * 5;
      if (x < 306 - (r > 5 ? 6 : 0)) { R(x, y, 1, 1, P.night3); R(x + 1, y + 1, 1, 1, P.night3); R(x + 2, y, 1, 1, P.night3); }
    }
    for (var f = 0; f < 9; f++) R(280 + f * 3, 134 + Math.round(Math.sin(f) * 2) + (f > 5 ? f - 5 : 0), 1, 7, f > 4 ? P.paperDark : P.paperShade);
  }
  function rockingChairArms() {
    var c0 = P.wood1, c1 = P.wood2, c2 = P.wood3;
    R(176, 92, 36, 6, c2); R(176, 92, 36, 1, P.lamp3); R(176, 98, 36, 2, c0); El(178, 95, 4, 3, c2);
    R(182, 100, 5, 14, c1); R(182, 100, 1, 14, c2);
    R(268, 92, 36, 6, c1); R(268, 92, 36, 1, c2); R(268, 98, 36, 2, c0); El(302, 95, 4, 3, c1);
    R(293, 100, 5, 14, c0);
  }

  // Dad, the real one, standing in Owen's doorway at bedtime: the whole of him, at the door's size.
  // Lit from the bedside lamp on the viewer's left; his watch on his left wrist (viewer-right) on the raised arm.
  function dadInDoor() {
    var cx = 402, top = 42, k = SKIN.A;
    // a little hall light behind him
    D(376, 32, 56, 114, P.night1, 1);
    // legs: jeans, white socks
    R(cx - 9, top + 58, 8, 40, P.blue0); R(cx + 1, top + 58, 8, 40, P.blue0); R(cx - 9, top + 58, 3, 40, P.blue);
    R(cx - 1, top + 64, 2, 34, P.night0);
    R(cx - 10, top + 98, 10, 4, P.paper); R(cx + 1, top + 98, 10, 4, P.paperShade);
    R(cx - 10, top + 56, 20, 3, P.wood0); R(cx - 2, top + 56, 3, 3, P.steel);   // belt
    // the flannel: shoulders, sleeves, the plaid
    poly([[cx - 13, top + 20], [cx + 13, top + 20], [cx + 12, top + 57], [cx - 12, top + 57]], P.red1);
    for (var py = top + 24; py < top + 57; py += 6) { R(cx - 13, py, 26, 1, P.red0); }
    for (var px = cx - 11; px < cx + 12; px += 6) { R(px, top + 20, 1, 37, P.red0); R(px + 3, top + 20, 1, 37, P.lamp3); }
    D(cx + 1, top + 20, 12, 37, P.night0, 1);
    R(cx - 3, top + 20, 6, 5, P.paper); R(cx, top + 26, 1, 30, P.paperShade);
    // his near arm hanging down, the far arm up on the door frame (watch on that wrist)
    R(cx - 17, top + 22, 5, 30, P.red1); R(cx - 17, top + 22, 2, 30, P.lamp3); El(cx - 15, top + 54, 3, 3, k.s2);
    poly([[cx + 11, top + 21], [cx + 15, top + 20], [cx + 25, top + 34], [cx + 21, top + 37], [cx + 11, top + 28]], P.red0);   // upper arm, out to the elbow
    poly([[cx + 21, top + 37], [cx + 25, top + 34], [cx + 34, top + 18], [cx + 30, top + 16]], P.red0);                      // forearm, up to the frame
    R(cx + 23, top + 31, 1, 4, P.lamp3);
    R(cx + 28, top + 19, 5, 3, P.steel); R(cx + 29, top + 20, 2, 1, P.paper);    // the watch, on his left wrist
    El(cx + 33, top + 15, 3, 3, k.s1); R(cx + 31, top + 12, 2, 3, k.s0);         // his hand on the door frame
    // head: hair parted on his left, glasses with the lamp in them
    R(cx - 3, top + 15, 6, 5, k.s1); R(cx + 1, top + 15, 2, 5, k.s0);
    El(cx, top + 7, 7, 9, k.s1); El(cx - 1, top + 6, 5, 7, k.s2); D(cx + 2, top, 5, 15, k.s0, 2);
    El(cx - 7, top + 8, 1, 2, k.s1); El(cx + 7, top + 8, 1, 2, k.s0);
    El(cx, top - 1, 7, 4, P.brown1); R(cx - 7, top - 1, 2, 7, P.brown1); R(cx + 6, top - 1, 2, 6, P.brown0); R(cx + 3, top - 4, 1, 4, P.brown0); R(cx - 6, top - 3, 8, 1, P.brown2);
    R(cx - 6, top + 5, 5, 3, P.night0); R(cx + 1, top + 5, 5, 3, P.night0); R(cx - 1, top + 6, 2, 1, P.night0);
    if (blinking(77)) { R(cx - 5, top + 6, 3, 1, k.s0); R(cx + 2, top + 6, 3, 1, k.s0); }
    else { R(cx - 5, top + 6, 3, 1, P.lamp4); R(cx + 2, top + 6, 3, 1, P.night3); R(cx - 4, top + 7, 1, 1, P.blue); R(cx + 3, top + 7, 1, 1, P.blue); }
    D(cx - 4, top + 10, 9, 5, k.s0, 1);                                  // stubble
    R(cx - 2, top + 12, 5, 1, P.red0); R(cx + 2, top + 11, 1, 1, P.red0);   // half a smile
  }

  // The front or back door, close up, glass in the top two-thirds. People stand behind it.
  function glassDoor(back) {
    if (back) { R(0, 0, W, HORIZON, P.paperShade); for (var y = 0; y < 136; y += 8) for (var x = ((y / 8) & 1) * 8; x < W; x += 16) R(x, y, 8, 8, '#bfa77a'); D(0, 0, W, HORIZON, P.paperDark, 1); }
    else {
      R(0, 0, W, HORIZON, P.olive1); D(0, 0, W, HORIZON, P.olive0, 1);
      R(0, 82, W, 84, P.wood1); R(0, 82, W, 3, P.wood3);
    }
    R(156, 0, 168, HORIZON, P.wood2); R(156, 0, 2, HORIZON, P.wood3); R(322, 0, 2, HORIZON, P.wood0);
    R(170, 6, 140, 160, P.wood1);
    // outside: the porch, the rain, the street (or the back yard and Mrs. Albright's dark house)
    var gh = back ? 146 : 120;   // the kitchen door is glass nearly to the floor
    R(180, 14, 120, gh, P.night1); D(180, 14, 120, 50, P.night0, 2);
    g.save(); g.beginPath(); g.rect(180, 14, 120, gh); g.clip();
    if (back) {
      woods(180, 40, 120, 60, { birch: true });
      poly([[262, 32], [282, 16], [302, 32]], P.night0); R(266, 32, 32, 30, P.night0); R(271, 40, 7, 7, P.night2); R(287, 40, 7, 7, P.night2); R(279, 50, 6, 12, P.night2);
      R(180, 100, 120, 60, P.night2); for (var f = 0; f < 10; f++) R(184 + f * 12, 94, 2, 12, P.night3);   // the fence
      R(180, 148, 120, 12, P.night3); R(180, 148, 120, 1, P.steel);   // the back step, wet
    } else {
      R(180, 92, 120, 4, P.night3); for (var rp = 0; rp < 6; rp++) R(184 + rp * 22, 96, 3, 38, P.night3);   // the porch rail
      R(180, 60, 120, 32, P.night1); woods(180, 40, 120, 52, { birch: false });
      if (S.person === 'deputy' && !S.still) {   // his car at the end of the drive, lights going
        R(214, 80, 40, 10, P.night2); R(220, 74, 26, 6, P.night2); R(224, 72, 8, 2, (S.t >> 3) % 2 ? P.red1 : P.night1); R(234, 72, 8, 2, (S.t >> 3) % 2 ? P.night1 : P.blueHi);
        D(180, 14, 120, 120, (S.t >> 3) % 2 ? P.red0 : P.blue0, 1);
      }
    }
    g.restore();
  }
  function glassOver(back) {
    // rain on the glass, over whoever is outside, then the frame and the bottom panel
    for (var r = 0; r < 22; r++) {
      var rx = 182 + (r * 31) % 116, ry = 14 + ((S.still ? 0 : S.t >> 1) * (2 + r % 3) + r * 23) % 116;
      R(rx, ry, 1, 4, P.fog); R(rx, ry + 4, 1, 2, P.steel);
    }
    for (var b = 0; b < 8; b++) El(186 + (b * 47) % 108, 20 + (b * 29) % 100, 1, 1, P.steel);   // beads that stay put
    R(170, 6, 140, 8, P.wood1); R(170, 6, 10, 160, P.wood1); R(300, 6, 10, 160, P.wood1);
    R(170, 6, 140, 1, P.wood2); R(178, 14, 2, 120, P.wood0); R(300, 14, 2, 120, P.wood2);
    if (back) { R(170, 160, 140, 6, P.wood2); R(178, 160, 124, 1, P.wood0); }
    else { R(170, 134, 140, 32, P.wood2); R(178, 140, 124, 20, P.wood1); R(180, 142, 120, 16, P.wood2); R(180, 142, 120, 1, P.wood3); }
    R(180, 112, 120, 3, P.wood1); R(180, 112, 120, 1, P.wood3);    // one cross bar, low, so faces stay clear
    if (back) { R(302, 70, 5, 20, P.lamp3); R(303, 76, 3, 3, P.wood0); }   // the deadbolt
    else { R(302, 92, 6, 12, P.lamp3); El(305, 98, 2, 2, P.lamp4); R(302, 74, 6, 8, P.lamp3); R(304, 77, 2, 2, P.wood0); }
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
      rockingChairArms();
    },
    // the Mom in the big bed (fake): her own shawl, hair parted the wrong way, a neck a little too long, that smile
    mom: function () {
      mom({ part: -1, shawl: true, fake: true, longNeck: true, mouth: 'smile' });
      // the covers over her lap, the same quilt as the bed, and her hands much too far apart on them
      bedQuilt();
      hand(192, 116, SKIN.A, true); hand(290, 116, SKIN.A, false);
      R(184, 112, 4, 6, P.skinA1); R(296, 112, 4, 6, P.skinA0);
    },
    // the Dad in the armchair (fake): watch on the wrong wrist, glasses that don't shine
    dad: function () {
      R(214, 128, 52, 22, P.suit1); D(240, 128, 26, 22, P.suit0, 2);       // jeans on the seat
      R(214, 148, 20, 16, P.suit1); R(246, 148, 20, 16, P.suit0);
      flannel(240, 94, 42);
      armchairFront();
      // forearms on the armrests
      poly([[180, 96], [204, 100], [206, 114], [182, 112]], P.red1); poly([[276, 100], [300, 96], [298, 112], [274, 114]], P.red0);
      hand(200, 116, SKIN.A, true); hand(280, 116, SKIN.A, false);
      R(194, 108, 12, 4, P.steel); R(198, 109, 4, 2, P.paper);   // the watch, on his right wrist
      R(274, 112, 14, 5, P.night1); R(276, 113, 3, 1, P.red1);    // remote
      dadHead(240, 62, { fake: true });
      R(306, 154, 16, 5, P.wood2); R(322, 155, 5, 3, P.wood2); R(327, 155, 2, 3, P.steel); R(308, 155, 8, 3, P.paper); R(309, 156, 6, 1, P.red1); R(306, 154, 16, 1, P.lamp3);   // the bottle, on its side
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
      R(cx - 36, 130, 72, 16, P.pink); D(cx, 130, 36, 16, '#9a5a68', 2); R(cx - 36, 144, 72, 2, '#9a5a68');
      for (var y = 104; y < 144; y += 9) for (var x = cx - 36; x < cx + 36; x += 9) R(x + ((y / 9) & 1) * 4, y, 2, 2, P.paper);   // quilting
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
      // thin shins and bare feet on the wet step
      R(224, 146, 7, 8, k.s1); R(224, 146, 2, 8, k.s2); R(250, 146, 7, 8, k.s0); R(250, 146, 2, 8, k.s1);
      El(225, 155, 8, 3, k.s2); El(255, 155, 8, 3, k.s1);
      for (var t = 0; t < 4; t++) { R(218 + t * 3, 157, 2, 2, k.s1); R(252 + t * 3, 157, 2, 2, k.s0); }
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

  /* ---------- close-ups (64x48, one game pixel to one canvas pixel, shown in the zoom panel) ----------
   * Drawn at the scene's own pixel size, so a close-up reads as a closer look at the same thing.
   */
  var ZW = 64, ZH = 48;
  function Z(fn) { return function (z) { on(z, fn); }; }
  function vignette() { D(0, 0, ZW, 3, P.night0, 2); D(0, ZH - 3, ZW, 3, P.night0, 2); D(0, 0, 3, ZH, P.night0, 2); D(ZW - 3, 0, 3, ZH, P.night0, 2); }
  function skinField(k) { R(0, 0, ZW, ZH, k.s1); D(0, 0, ZW, ZH, k.s2, 1); D(36, 0, 28, ZH, k.s0, 1); }
  function bigEye(cx, cy, iris, o) {
    o = o || {};
    El(cx, cy, 9, 5, P.paper); El(cx + 3, cy + 1, 6, 4, P.paperShade);
    El(cx + (o.dx || 0), cy, 4, 4, iris); El(cx + (o.dx || 0), cy, 2, 2, o.pupil || P.night0);
    if (o.shine !== false) R(cx - 2 + (o.dx || 0), cy - 2, 2, 2, P.paper);
    R(cx - 9, cy - 5, 19, 2, P.night0); R(cx - 10, cy - 3, 1, 2, P.night0);
    R(cx - 8, cy + 5, 17, 1, o.lid || P.skinA0);
  }
  var zooms = {
    // her hair, parted on the wrong side: the white line of the part on the viewer's left
    momHair: Z(function () {
      R(0, 0, ZW, ZH, P.brown1);
      for (var s = 0; s < 22; s++) { var x = s * 3; line(x, 0, x + (x < 20 ? -10 : 12), ZH, s % 3 ? P.brown0 : P.brown2); }
      R(18, 0, 3, ZH, P.skinA2); R(19, 0, 1, ZH, P.paper); R(17, 0, 1, ZH, P.brown0); R(21, 0, 1, ZH, P.brown0);
      poly([[0, 38], [64, 30], [64, 48], [0, 48]], P.skinA1); D(0, 38, 64, 10, P.skinA2, 1);
      vignette();
    }),
    // the shawl: cable knit, blue-grey, a fringe. Warm, or cold.
    momShawl: Z(function () {
      R(0, 0, ZW, ZH, P.fog);
      for (var c = 0; c < 4; c++) for (var r = 0; r < 8; r++) {
        var x = 4 + c * 16, y = r * 5;
        R(x, y, 3, 3, P.steel); R(x + 3, y + 2, 3, 3, P.steel); R(x + 8, y, 3, 3, P.paperShade); R(x + 5, y + 2, 3, 3, P.paperShade);
      }
      for (var v = 0; v < 64; v += 4) R(v, 0, 1, 40, P.night3);
      for (var f = 0; f < 21; f++) R(1 + f * 3, 40, 1, 8 - (f % 3), P.paperShade);
      D(40, 0, 24, 48, P.steel, 1);
      vignette();
    }),
    // her eyes, wide, not blinking, and the dark in them going violet
    momEyes: Z(function () {
      skinField(SKIN.A);
      R(4, 9, 22, 3, P.brown1); R(38, 9, 22, 3, P.brown0);
      bigEye(16, 22, '#5a7a4a', { pupil: P.acc1, shine: false });
      bigEye(48, 22, '#5a7a4a', { pupil: P.acc1, shine: false });
      R(15, 21, 2, 2, P.acc2); R(47, 21, 2, 2, P.acc2);
      R(30, 26, 4, 12, P.skinA1); R(33, 30, 3, 10, P.skinA0);
      vignette();
    }),
    // their clock, blinking 12:00
    clock: Z(function () {
      R(0, 0, ZW, ZH, P.wood1); D(0, 0, ZW, ZH, P.wood2, 1); R(0, 34, ZW, 14, P.wood2); R(0, 34, ZW, 1, P.wood3);
      R(6, 8, 52, 26, P.night0); R(6, 8, 52, 1, P.night3); R(9, 11, 46, 20, '#140a0c');
      g.save(); g.translate(13, 15); g.scale(2, 2); digits(g, '12:00', 0, 0, P.red1); g.restore();
      R(46, 28, 2, 2, P.red1);
      vignette();
    }),
    // the watch, on the wrong wrist: his right
    watchWrong: Z(function () {
      R(0, 0, ZW, ZH, P.red0); for (var p = 0; p < 64; p += 8) { R(p, 0, 2, ZH, '#7a2a32'); R(p + 5, 0, 1, ZH, P.lamp3); }
      for (var q = 0; q < 48; q += 8) R(0, q, ZW, 2, P.night1);
      R(0, 18, ZW, 18, SKIN.A.s1); R(0, 18, ZW, 4, SKIN.A.s2); D(0, 30, 64, 6, SKIN.A.s0, 1);
      R(22, 12, 20, 30, P.steel); R(22, 12, 20, 1, P.fog);
      El(32, 27, 9, 9, P.fog); El(32, 27, 8, 8, P.paper); R(32, 20, 1, 7, P.night0); R(32, 27, 5, 1, P.night0); R(31, 26, 3, 3, P.red1);
      for (var t = 0; t < 12; t++) { var a = t / 12 * Math.PI * 2; R(32 + Math.round(Math.cos(a) * 7), 27 + Math.round(Math.sin(a) * 7), 1, 1, P.night3); }
      vignette();
    }),
    // his glasses with the TV in front of them, and nothing in the lenses
    glasses: Z(function () {
      skinField(SKIN.A);
      R(4, 14, 24, 18, P.night0); R(36, 14, 24, 18, P.night0); R(28, 18, 8, 3, P.night0); R(0, 18, 4, 2, P.night0); R(60, 18, 4, 2, P.night0);
      R(6, 16, 20, 14, P.night1); R(38, 16, 20, 14, P.night1);
      R(9, 21, 6, 4, P.night2); R(43, 21, 6, 4, P.night2);
      R(2, 6, 26, 3, P.brown0); R(36, 6, 26, 3, P.brown0);
      vignette();
    }),
    // the remote, back off, no batteries, no tape
    remote: Z(function () {
      R(0, 0, ZW, ZH, P.red0); D(0, 0, ZW, ZH, '#7a2a32', 1);
      R(12, 6, 40, 36, P.night1); R(12, 6, 40, 1, P.night3); R(16, 10, 6, 4, P.red1);
      for (var b = 0; b < 9; b++) R(18 + (b % 3) * 9, 18 + Math.floor(b / 3) * 6, 6, 3, P.night3);
      R(36, 8, 14, 8, P.night0); R(38, 10, 4, 4, P.steel); R(44, 10, 4, 4, P.steel);   // the empty battery well
      R(52, 30, 8, 2, P.paperShade);
      vignette();
    }),
    // his root beer bottle on its side: empty, and dry
    bottle: Z(function () {
      R(0, 0, ZW, ZH, P.wood2); for (var b = 0; b < 48; b += 7) { R(0, b, ZW, 1, P.wood1); R(Math.floor(seeded(b) * 50), b + 3, 12, 1, P.wood1); }
      R(8, 22, 34, 12, P.wood1); R(8, 22, 34, 3, P.wood3); R(42, 24, 8, 8, P.wood1); R(50, 26, 8, 4, P.wood1); R(58, 25, 2, 6, P.steel);
      R(12, 26, 20, 6, P.paper); R(14, 27, 16, 2, P.red1);
      R(10, 23, 30, 1, P.lamp3);
      vignette();
    }),
    // a blue collar and a bone tag hung the wrong way round
    collarBlue: Z(function () {
      R(0, 0, ZW, ZH, P.gold); for (var f = 0; f < 30; f++) line(f * 3, 0, f * 3 - 6, ZH, f % 2 ? P.lamp3 : P.wood3);
      R(0, 12, ZW, 10, P.blue); R(0, 12, ZW, 2, P.blueHi); R(0, 21, ZW, 1, P.blue0); for (var s = 2; s < 64; s += 6) R(s, 16, 2, 2, P.blue0);
      R(30, 22, 3, 5, P.steel); El(31, 28, 3, 3, P.fog);
      R(22, 30, 20, 8, P.paperShade); R(22, 30, 20, 1, P.paper);
      El(41, 30, 4, 3, P.paperShade); El(41, 37, 4, 3, P.paperShade); R(19, 32, 4, 4, P.paperShade);   // the knobs at the wrong end
      R(26, 33, 8, 1, P.paperDark);
      vignette();
    }),
    // his mouth, shut tight
    dogMouth: Z(function () {
      R(0, 0, ZW, ZH, P.gold); D(0, 0, ZW, ZH, P.lamp3, 1);
      El(24, 28, 24, 14, P.lamp3); El(22, 26, 20, 10, P.lamp4);
      El(6, 18, 5, 4, P.night0); R(4, 16, 2, 1, P.fog);
      R(6, 36, 40, 1, P.night0); R(46, 34, 3, 3, P.night0);
      for (var w = 0; w < 6; w++) R(14 + w * 4, 30 + (w & 1), 1, 1, P.wood2);
      vignette();
    }),
    // muddy paws
    paws: Z(function () {
      linoleum();
      [[10, 4], [36, 6]].forEach(function (p) {
        R(p[0], p[1], 16, 30, P.gold); R(p[0], p[1], 4, 30, P.lamp3); R(p[0] - 2, p[1] + 26, 20, 12, P.brown1); D(p[0] - 2, p[1] + 20, 20, 8, P.brown1, 2);
        for (var k = 0; k < 3; k++) R(p[0] + 1 + k * 6, p[1] + 36, 3, 2, P.night0);
      });
      for (var m = 0; m < 6; m++) El(8 + m * 10, 44 + (m & 1), 3, 1, P.brown1);
      vignette();
    }),
    // his bowl, licked clean
    bowl: Z(function () {
      linoleum();
      El(32, 30, 26, 12, P.red0); El(32, 27, 24, 9, P.red1); El(32, 27, 18, 6, P.steel); El(32, 27, 16, 5, P.fog);
      R(22, 25, 8, 1, P.paper); R(36, 28, 6, 1, P.paper);
      vignette();
    }),
    // the boy in the mirror: the cowlick on his right
    mirrorFace: Z(function () {
      R(0, 0, ZW, ZH, P.night1); D(0, 0, ZW, ZH, P.night2, 1);
      El(32, 30, 18, 20, SKIN.A.s1); El(30, 28, 14, 16, SKIN.A.s2); D(38, 14, 12, 34, SKIN.A.s0, 2);
      El(32, 12, 18, 7, P.brown1); D(36, 6, 14, 9, P.brown0, 2); for (var fr = 0; fr < 9; fr++) R(16 + fr * 4, 16, 3, 3 + (fr % 2) * 2, P.brown1); R(13, 12, 4, 10, P.brown1); R(47, 12, 4, 10, P.brown0);
      R(40, 1, 3, 6, P.brown1); R(42, 0, 3, 3, P.brown2); R(43, 3, 2, 4, P.brown1);   // the cowlick
      R(20, 26, 8, 4, P.paper); R(36, 26, 8, 4, P.paperShade); R(23, 27, 3, 3, '#5a7a4a'); R(39, 27, 3, 3, '#5a7a4a');
      R(22, 40, 20, 1, P.night0); R(21, 39, 1, 1, P.night0); R(42, 39, 1, 1, P.night0);
      line(4, 2, 18, 16, P.fog);
      vignette();
    }),
    // rocket pajamas: the rockets fly the way his own do
    rockets: Z(function () {
      R(0, 0, ZW, ZH, P.suit2); for (var s = 0; s < 64; s += 8) R(s, 0, 1, ZH, P.suit1);
      [[8, 8], [36, 16], [12, 30], [42, 36]].forEach(function (r) {
        R(r[0], r[1], 14, 5, P.paper); poly([[r[0] + 14, r[1]], [r[0] + 19, r[1] + 2], [r[0] + 14, r[1] + 5]], P.red1);
        R(r[0] + 4, r[1] + 1, 3, 3, P.blueHi); R(r[0] - 4, r[1] + 1, 4, 3, P.lamp4); R(r[0] - 6, r[1] + 2, 2, 1, P.lamp3);
        R(r[0] + 1, r[1] - 2, 3, 2, P.red1); R(r[0] + 1, r[1] + 5, 3, 2, P.red1);
      });
      vignette();
    }),
    // toothpaste spots on the glass
    toothpaste: Z(function () {
      R(0, 0, ZW, ZH, P.night2); D(0, 0, ZW, ZH, P.night3, 1); line(2, 2, 24, 24, P.fog); line(4, 2, 26, 24, P.night3);
      [[12, 14, 3], [26, 22, 4], [18, 32, 2], [44, 16, 2], [38, 34, 3], [52, 28, 2]].forEach(function (d) { El(d[0], d[1], d[2], d[2] - 1, P.paper); R(d[0] - 1, d[1] - 1, 1, 1, P.blueHi); });
      vignette();
    }),
    curlers: Z(function () {
      R(0, 0, ZW, ZH, P.fog); for (var h = 0; h < 64; h += 3) line(h, 0, h + 4, ZH, P.steel);
      for (var i = 0; i < 4; i++) {
        var x = 4 + i * 15, y = 10 + (i & 1) * 8;
        R(x, y, 12, 18, P.pink); R(x, y, 12, 2, P.paper); R(x, y + 16, 12, 2, '#9a5a68');
        for (var k = 0; k < 4; k++) R(x + 1 + k * 3, y + 3, 1, 12, '#9a5a68');
        R(x + 5, y - 2, 2, 22, P.paperShade);
      }
      vignette();
    }),
    // her glasses chain, the beads stopped mid-swing, hanging out sideways
    chain: Z(function () {
      R(0, 0, ZW, ZH, P.pink); D(0, 0, ZW, ZH, '#9a5a68', 1);
      for (var q = 0; q < 64; q += 10) for (var r = 0; r < 48; r += 10) R(q + 4, r + 4, 2, 2, P.paper);
      R(34, 4, 26, 16, P.lamp3); R(36, 6, 22, 12, P.night1); R(38, 8, 6, 3, P.night3);
      for (var i = 0; i < 12; i++) { var x = 32 - i * 2, y = 14 + i * 3; R(x, y, 2, 2, P.lamp3); R(x, y, 1, 1, P.lamp4); }
      vignette();
    }),
    // bare feet on the wet step
    bareFeet: Z(function () {
      R(0, 0, ZW, ZH, P.night1); R(0, 28, ZW, 20, P.night3); R(0, 28, ZW, 1, P.steel);
      for (var w = 0; w < 10; w++) R(Math.floor(seeded(w + 2) * 60), 32 + Math.floor(seeded(w + 8) * 14), 3, 1, P.fog);
      [[18, 1], [44, -1]].forEach(function (f) {
        R(f[0] - 5, 4, 10, 22, SKIN.old.s1); R(f[0] - 5, 4, 3, 22, SKIN.old.s2);
        El(f[0], 30, 9, 5, SKIN.old.s2); El(f[0] + 2, 31, 7, 3, SKIN.old.s1);
        for (var t = 0; t < 5; t++) El(f[0] - 7 + t * 3, 35, 1, 1, SKIN.old.s1);
        R(f[0] - 4, 26, 1, 3, P.red0);
      });
      R(0, 0, ZW, 6, P.pink); D(0, 0, ZW, 6, '#9a5a68', 1);
      vignette();
    }),
    // her house across the yard, all dark, no TV light
    darkHouse: Z(function () {
      R(0, 0, ZW, ZH, P.night1); D(0, 0, ZW, 20, P.night0, 2);
      El(52, 8, 4, 4, P.fog);
      poly([[6, 22], [32, 6], [58, 22]], P.night0); R(10, 22, 44, 22, P.night0); R(30, 10, 4, 6, P.night0);
      R(16, 28, 8, 8, P.night2); R(40, 28, 8, 8, P.night2); R(28, 30, 8, 14, P.night2); R(19, 28, 1, 8, P.night0); R(43, 28, 1, 8, P.night0);
      R(0, 44, ZW, 4, P.night2); for (var f = 0; f < 64; f += 6) R(f, 38, 2, 8, P.night3);
      for (var r = 0; r < 12; r++) R((r * 23) % 64, (r * 17 + (S.still ? 0 : S.t)) % 48, 1, 3, P.steel);
      vignette();
    }),
    badgeWrong: Z(function () { badgeZoom(true); }),
    badgeRight: Z(function () { badgeZoom(false); }),
    hatDry: Z(function () { hatZoom(false); }),
    hatWet: Z(function () { hatZoom(true); }),
    radio: Z(function () {
      R(0, 0, ZW, ZH, P.paperDark); D(0, 0, ZW, ZH, P.paperShade, 1); R(0, 0, 10, ZH, P.brown2);
      R(20, 8, 24, 36, P.night1); R(20, 8, 24, 1, P.night3); R(24, 2, 4, 8, P.night3);
      for (var i = 0; i < 6; i++) R(24, 14 + i * 3, 16, 1, P.night3);
      R(24, 34, 6, 6, P.night2); R(34, 34, 6, 6, P.night2);
      R(36, 10, 3, 2, flick(3) ? '#4d6b3a' : P.night2);
      vignette();
    }),
    // his eyes, under the brim: two little lights, purple, like the VCR
    copEyes: Z(function () {
      R(0, 0, ZW, ZH, P.skinB1); D(0, 0, ZW, ZH, P.skinB0, 1);
      R(0, 0, ZW, 14, P.brown1); R(0, 12, ZW, 2, P.wood1); R(0, 14, ZW, 14, P.night0); D(0, 28, ZW, 6, P.night0, 2);
      El(18, 22, 3, 2, P.acc1); El(46, 22, 3, 2, P.acc1); R(17, 21, 2, 2, P.acc2); R(45, 21, 2, 2, P.acc2);
      R(30, 32, 4, 10, P.skinB1); R(33, 34, 3, 8, P.skinB0);
      vignette();
    }),
    // Mom's book, open where she stopped, the corner folded down
    book: Z(function () {
      R(0, 0, ZW, ZH, P.red0); R(2, 2, 60, 44, P.wood0);
      R(4, 4, 27, 40, P.paper); R(33, 4, 27, 40, P.paper); R(31, 4, 2, 40, P.paperShade); D(27, 4, 4, 40, P.paperShade, 1);
      for (var i = 0; i < 12; i++) { R(7, 9 + i * 3, 21 - (i === 11 ? 10 : 0), 1, P.paperDark); R(36, 9 + i * 3, 21 - (i === 4 ? 12 : 0), 1, P.paperDark); }
      R(8, 6, 6, 2, P.red1);
      poly([[50, 4], [60, 4], [60, 14]], P.paperShade); line(50, 4, 60, 14, P.paperDark);
      vignette();
    }),
    // the Whitlocks' notebook, the handwriting going to pieces, the last lines in red
    journal: Z(function () {
      R(0, 0, ZW, ZH, P.wood2); R(4, 2, 56, 44, P.paperShade); R(4, 2, 56, 1, P.paper); R(6, 2, 1, 44, P.red1);
      for (var i = 0; i < 13; i++) {
        var w = 48 - i * 2, wob = i > 6 ? (i - 6) : 0;
        for (var x = 10; x < 10 + w; x += 3) R(x, 6 + i * 3 + ((x * 7 + i) % 3 < wob ? 1 : 0), 2, 1, i > 9 ? P.red0 : P.paperDark);
      }
      R(40, 40, 16, 4, P.red1);
      vignette();
    }),
    // THOMAS W.: little red sneakers with velcro
    sneakers: Z(function () {
      R(0, 0, ZW, ZH, P.wood1); for (var b = 0; b < 48; b += 6) R(0, b, ZW, 1, P.wood0);
      [[4, 14], [34, 18]].forEach(function (s, i) {
        poly([[s[0], s[1] + 22], [s[0] + 4, s[1] + 4], [s[0] + 16, s[1]], [s[0] + 22, s[1] + 10], [s[0] + 26, s[1] + 22]], P.red1);
        R(s[0], s[1] + 22, 27, 4, P.paper); R(s[0], s[1] + 25, 27, 1, P.paperShade);
        R(s[0] + 6, s[1] + 8, 14, 3, P.paperShade); R(s[0] + 7, s[1] + 13, 14, 3, P.paperShade);
        R(s[0] + 14, s[1] + 2, 6, 6, P.paper); if (i === 0) { R(s[0] + 15, s[1] + 4, 2, 1, P.night0); R(s[0] + 18, s[1] + 4, 1, 1, P.night0); }
        D(s[0] + 14, s[1] + 10, 12, 12, P.red0, 1);
      });
      vignette();
    }),
    // the cut cord: four little wires at each end
    cordCut: Z(function () {
      R(0, 0, ZW, ZH, P.paperShade); for (var y = 0; y < 48; y += 8) for (var x = ((y / 8) & 1) * 8; x < 64; x += 16) R(x, y, 8, 8, '#bfa77a');
      for (var i = 0; i < 4; i++) { El(10 + (i & 1) * 4, 3 + i * 4, 4, 2, P.paper); El(10 + (i & 1) * 4, 3 + i * 4, 3, 1, P.paperShade); }
      R(6, 18, 2, 6, P.red1); R(9, 18, 2, 8, '#4d6b3a'); R(12, 18, 2, 6, '#e0b84a'); R(15, 18, 2, 5, P.night0);
      R(46, 26, 2, 5, P.night0); R(49, 25, 2, 7, P.red1); R(52, 26, 2, 6, '#e0b84a'); R(55, 27, 2, 5, '#4d6b3a');
      for (var j = 0; j < 4; j++) { El(52 + (j & 1) * 4, 34 + j * 4, 4, 2, P.paper); El(52 + (j & 1) * 4, 34 + j * 4, 3, 1, P.paperShade); }
      R(5, 17, 13, 1, P.paperDark); R(45, 32, 13, 1, P.paperDark);
      vignette();
    })
  };
  function linoleum() { R(0, 0, ZW, ZH, P.paper); for (var y = 0; y < ZH; y += 16) for (var x = ((y / 16) & 1) * 16; x < ZW; x += 32) R(x, y, 16, 16, P.night3); }
  function badgeZoom(wrong) {
    R(0, 0, ZW, ZH, P.paperShade); D(0, 0, ZW, ZH, P.paperDark, 1);
    R(0, 40, ZW, 2, P.brown2);
    var cx = 32, cy = 22;
    poly([[cx, cy - 20], [cx + 6, cy - 6], [cx + 20, cy - 6], [cx + 9, cy + 4], [cx + 14, cy + 19], [cx, cy + 10], [cx - 14, cy + 19], [cx - 9, cy + 4], [cx - 20, cy - 6], [cx - 6, cy - 6]], P.gold);
    poly([[cx, cy - 20], [cx + 6, cy - 6], [cx, cy - 4], [cx - 6, cy - 6]], P.lamp4);
    El(cx, cy + 1, 9, 7, P.lamp3); El(cx, cy + 1, 8, 6, P.gold);
    digits(g, '714', cx - 6, cy - 2, P.wood0, wrong);
    if (wrong) { R(cx - 6, cy - 2, 1, 1, P.wood0); }
    vignette();
  }
  function hatZoom(wet) {
    R(0, 0, ZW, ZH, P.night1);
    poly([[14, 30], [18, 6], [28, 2], [32, 6], [36, 2], [46, 6], [50, 30]], P.brown1);
    poly([[14, 30], [18, 6], [28, 2], [32, 6], [32, 30]], P.brown2);
    R(14, 24, 36, 5, P.wood1); R(14, 24, 36, 1, P.gold);
    El(32, 32, 30, 5, P.brown1); El(30, 31, 26, 3, P.brown2);
    if (wet) {
      for (var d = 0; d < 9; d++) R(4 + d * 7, 36 + ((S.t >> 2) + d * 3) % 10, 1, 3, P.fog);
      R(56, 34, 1, 14, P.fog);
      for (var b = 0; b < 6; b++) R(20 + b * 5, 8 + (b % 3) * 5, 1, 1, P.fog);
      D(14, 4, 36, 26, P.night2, 1);
    } else {
      for (var r = 0; r < 14; r++) R((r * 19) % 64, (r * 13 + (S.still ? 0 : S.t)) % 48, 1, 3, P.steel);
    }
    vignette();
  }
  function star(cx, cy) {
    poly([[cx, cy - 10], [cx + 3, cy - 3], [cx + 10, cy - 3], [cx + 4, cy + 2], [cx + 7, cy + 10], [cx, cy + 5], [cx - 7, cy + 10], [cx - 4, cy + 2], [cx - 10, cy - 3], [cx - 3, cy - 3]], P.gold);
  }

  /* ---------- the family photo, for the torn-photo puzzle (96x64) ---------- */
  function photo(ctx) {
    on(ctx, function () {
      var k = SKIN.A;
      // a white border, a summer afternoon, the new house behind us
      R(0, 0, 96, 64, P.paper);
      R(3, 3, 90, 58, '#9ab8d8'); D(3, 3, 90, 12, P.paper, 1);
      R(3, 12, 90, 30, P.paperShade); for (var sd = 14; sd < 42; sd += 3) R(3, sd, 90, 1, P.paperDark);   // white siding
      R(70, 14, 20, 28, P.paper); R(72, 16, 16, 26, P.red0); R(74, 18, 12, 8, P.wood0); R(84, 30, 2, 2, P.lamp4);   // the red front door
      R(6, 16, 16, 12, P.night3); R(7, 17, 14, 10, '#9ab8d8'); R(13, 17, 1, 10, P.paper);                            // a window
      R(3, 40, 90, 3, P.paper); for (var rp = 0; rp < 9; rp++) R(4 + rp * 11, 34, 2, 7, P.paper);                     // the porch rail
      R(3, 43, 90, 18, P.wood3); for (var y = 46; y < 61; y += 4) R(3, y, 90, 1, P.wood2);                           // the porch floor
      // Mom (left): blue sundress, long brown hair, parted on her left
      R(14, 24, 20, 22, P.blue); R(14, 24, 6, 22, P.blueHi); R(16, 46, 4, 6, k.s2); R(28, 46, 4, 6, k.s1);
      El(24, 15, 7, 8, P.brown1); R(17, 15, 3, 14, P.brown1); R(28, 15, 3, 14, P.brown0);
      El(24, 17, 5, 6, k.s2); R(26, 9, 1, 4, k.s1);
      R(21, 16, 2, 1, P.night0); R(25, 16, 2, 1, P.night0); R(22, 20, 4, 1, P.red1);
      // Owen (middle, small): red T-shirt, the cowlick
      R(40, 32, 14, 14, P.red1); R(40, 32, 4, 14, '#d65a5a'); R(42, 46, 4, 6, P.suit2); R(48, 46, 4, 6, P.suit2);
      El(47, 26, 5, 6, k.s2); El(47, 22, 5, 3, P.brown1); R(45, 18, 2, 3, P.brown1);
      R(45, 26, 1, 1, P.night0); R(48, 26, 1, 1, P.night0); R(45, 29, 4, 1, P.red0);
      // Dad (right): flannel, glasses, his watch on his left wrist
      R(56, 20, 18, 28, P.red1); for (var pl = 22; pl < 48; pl += 4) R(56, pl, 18, 1, P.red0); R(62, 20, 1, 28, P.red0); R(68, 20, 1, 28, P.lamp3);
      R(58, 48, 5, 8, P.suit1); R(66, 48, 5, 8, P.suit1);
      El(65, 13, 6, 7, k.s2); El(65, 8, 6, 3, P.brown1); R(67, 6, 1, 3, P.brown0);
      R(61, 12, 3, 2, P.night0); R(66, 12, 3, 2, P.night0); R(64, 12, 2, 1, P.night0); R(62, 12, 1, 1, P.paper);
      R(62, 17, 6, 1, P.red0);
      R(74, 24, 4, 14, P.red1); R(74, 36, 4, 3, P.steel); R(75, 36, 2, 1, P.paper); El(76, 41, 2, 2, k.s2);
      // Biscuit in front: tongue out, one ear inside out, a RED collar
      El(50, 54, 15, 6, P.gold); El(48, 52, 12, 4, P.lamp3);
      R(60, 50, 6, 3, P.gold); R(62, 47, 4, 4, P.gold);   // tail, mid-wag
      El(34, 49, 8, 7, P.gold); El(33, 48, 6, 5, P.lamp3); El(28, 52, 4, 3, P.lamp4);
      R(39, 42, 4, 8, P.wood3); poly([[28, 43], [33, 40], [33, 45]], P.pink);
      R(31, 47, 2, 1, P.night0); R(36, 47, 2, 1, P.night0); R(25, 50, 3, 2, P.night0);
      R(28, 54, 3, 4, P.pink); R(29, 54, 1, 3, P.red1);
      R(33, 54, 8, 3, P.red1); R(33, 54, 8, 1, '#d65a5a'); R(36, 57, 2, 2, P.paperShade);
      // the corner of the print, gone yellow
      D(78, 3, 15, 10, P.lamp3, 1); D(86, 13, 7, 6, P.lamp3, 1);
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
    var room = S.backdrop === 'black' || S.backdrop === 'taken' || S.backdrop === 'car' ? S.backdrop : S.room;
    var draw = rooms[room] || rooms.black;
    var keep = S.room; S.room = room;
    draw();
    if (S.person && people[S.person] && room !== 'black' && room !== 'taken' && room !== 'car') {
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
