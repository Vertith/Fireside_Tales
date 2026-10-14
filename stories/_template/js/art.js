/*
 * Fireside Tales story template: pixel renderer.
 * Forked from Emit Time's art.js ("Noir Pixel Desk"), 14 Oct 2026. This copy
 * belongs to this story only. The house rules it follows are in
 * /stories/ART-STYLE.md (480x270, whole-number scaling, three shades per
 * material, one warm light source in a cold night).
 *
 * The screen has two layers, like Emit Time: the room above y=166, where the
 * person you meet stands, and the foreground below it (here a table lit by
 * a candle) where the question pad, the action buttons and props sit. The
 * HTML text in css/tale.css is placed for this split, so keep it or move
 * both together.
 *
 * Replace room(), foreground() and the people/zooms with this story's own.
 * A PNG can stand in for a person:
 *   TALE.art.people.stranger = TALE.art.sprite('art/stranger.png', x, y);
 */
(function () {
  'use strict';
  var E = (window.TALE = window.TALE || {});

  // The shared Fireside palette (stories/ART-STYLE.md). Add this story's own
  // accent ramp at the bottom; keep the night, wood/lamp and paper ramps.
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
    // story accent (replace): a sickly green for things that aren't right
    acc0: '#1e3a2a', acc1: '#3f7a52', acc2: '#9fd8a8'
  };

  var W = 480, H = 270;
  var HORIZON = 166;                                // the room is above this line, the foreground below
  var VIEW = { x: 0, y: 0, w: 480, h: HORIZON };    // where a person can be seen and clicked
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
  function fill(z, x, y, w, h, col) { z.fillStyle = col; z.fillRect(x, y, w, h); }

  /* ---------- scene state, set by the UI ---------- */
  var S = {
    t: 0,
    person: null, vx: 0, vy: 0, move: null,
    backdrop: null,
    flashT: -1, flashReverse: false, flashSub: 0,
    clock: '', loop: 1,
    tally: 0, tallyFreshAt: -1,
    hover: null, still: false
  };

  /* ---------- the room (above the horizon) ---------- */
  function room() {
    // plank wall
    R(0, 0, W, HORIZON, P.wood0);
    for (var y = 6; y < HORIZON; y += 12) R(0, y, W, 1, P.night0);
    for (var x = 0; x < W; x += 37) R(x + ((x / 37) % 2) * 9, 0, 1, HORIZON, P.night1);
    // window on the left: night sky and a moon
    R(30, 30, 90, 70, P.wood1); R(34, 34, 82, 62, P.night1);
    El(96, 52, 7, 7, P.fog); El(98, 50, 6, 6, P.night1);
    D(34, 74, 82, 22, P.night2, 2);
    R(74, 34, 2, 62, P.wood1); R(34, 64, 82, 2, P.wood1);
    // the door the person stands in
    R(186, 16, 108, 150, P.wood1);
    R(192, 22, 96, 144, S.person ? P.night0 : P.wood2);
    if (!S.person) { R(198, 28, 84, 60, P.wood1); R(198, 96, 84, 62, P.wood1); El(276, 96, 2, 2, P.lamp3); }
    // fireplace on the right, flickering
    D(330, 70, 150, 96, P.wood2, 2, true);
    R(360, 92, 100, 74, P.night1); R(372, 104, 76, 62, P.night0);
    var f = S.still ? 0 : (S.t >> 3) % 3;
    poly([[384, 166], [396, 136 - f * 2], [404, 150], [412, 128 + f], [422, 148], [432, 138 - f], [440, 166]], P.lamp3);
    poly([[396, 166], [404, 150 - f], [412, 142], [420, 156], [428, 166]], P.lamp4);
    if (S.backdrop === 'scratches') for (var k = 0; k < 4; k++) R(300 + k * 5, 60 + k, 1, 30, P.paper);
    R(0, HORIZON - 2, W, 2, P.night0);
  }

  /* ---------- the foreground (below the horizon) ---------- */
  function foreground() {
    R(0, HORIZON, W, H - HORIZON, P.wood1);
    for (var y = HORIZON + 8; y < H; y += 14) R(0, y, W, 1, P.wood0);
    // candle light pool, dithered out from the candle
    D(120, HORIZON, 240, 104, P.wood2, 2, true);
    D(170, HORIZON + 20, 140, 64, P.wood3, 1, true);
    R(236, 196, 8, 22, P.paper); R(236, 196, 8, 1, P.paperShade);
    var fl = S.still ? 0 : (S.t >> 2) % 2;
    El(240, 191 - fl, 2, 4, P.lamp4); R(239, 193, 2, 3, P.lamp3);
    R(230, 218, 20, 3, P.steel);
    // notebook (a prop: click to open)
    var hov = S.hover === 'notebook';
    R(422, 190, 46, 32, hov ? P.paper : P.paperShade); R(422, 190, 3, 32, P.red1);
    for (var l = 196; l < 220; l += 4) R(428, l, 36, 1, P.paperDark);
    // loops so far, scratched into the table
    tally(340, 236);
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

  /* ---------- people, built from parts ---------- */
  // Authored standing in the doorway around x≈240, head at y≈60, clipped at the horizon.
  // Viewer-left is lit (the fire is right, but the candle is closer), so left halves take the lighter shade.
  function head(skin, skinHi, skinLo) {
    El(240, 62, 15, 18, skin); El(236, 60, 10, 14, skinHi);
    R(231, 58, 4, 2, P.night0); R(245, 58, 4, 2, P.night0);
    R(236, 72, 9, 1, skinLo);
  }
  function coat(L, Dk) {
    poly([[204, 166], [212, 92], [240, 84], [240, 166]], L);
    poly([[240, 84], [268, 92], [276, 166], [240, 166]], Dk);
    R(239, 92, 2, 74, P.night0);
  }
  function hands(skin, skinHi) {
    El(220, 138, 6, 7, skin); El(219, 137, 4, 5, skinHi);
    El(260, 138, 6, 7, skin);
  }

  var people = {
    stranger: function () {
      coat(P.suit1, P.suit0);
      R(222, 90, 36, 6, P.suit2);
      hands(P.skinA1, P.skinA2);
      head(P.skinA1, P.skinA2, P.skinA0);
      // wide-brimmed hat; the face under it a shade too still
      R(214, 44, 52, 4, P.night1); R(224, 30, 32, 15, P.night1); R(224, 41, 32, 2, P.brown1);
      // boots, perfectly clean
      R(222, 156, 14, 10, P.night1); R(244, 156, 14, 10, P.night1); R(222, 156, 14, 1, P.steel); R(244, 156, 14, 1, P.steel);
    }
  };

  /* ---------- close-ups (32x24, scaled up in the zoom panel) ---------- */
  var zooms = {
    hands: function (z) {
      fill(z, 0, 0, 32, 24, P.suit0);
      fill(z, 6, 6, 20, 12, P.skinA1); fill(z, 7, 7, 14, 6, P.skinA2);
      fill(z, 8, 14, 3, 1, P.red1); fill(z, 14, 15, 4, 1, P.red1);
    },
    boots: function (z) {
      fill(z, 0, 0, 32, 24, P.wood1);
      fill(z, 0, 20, 32, 4, P.brown0);
      fill(z, 4, 8, 11, 12, P.night1); fill(z, 18, 8, 11, 12, P.night1);
      fill(z, 4, 8, 11, 1, P.steel); fill(z, 18, 8, 11, 1, P.steel);
      fill(z, 6, 11, 2, 1, P.fog); fill(z, 20, 11, 2, 1, P.fog);
    }
  };

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
    if (S.person && people[S.person]) {
      g.save();
      g.beginPath(); g.rect(VIEW.x, VIEW.y, VIEW.w, VIEW.h); g.clip();
      g.translate(S.vx, S.vy);
      people[S.person]();
      g.restore();
    }
    foreground();

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
    P: P, W: W, H: H, HORIZON: HORIZON, VIEW: VIEW,
    inView: function (p) { return p.x >= VIEW.x && p.x < VIEW.x + VIEW.w && p.y >= VIEW.y && p.y < VIEW.y + VIEW.h; },
    state: S,
    people: people,
    zooms: zooms,
    digits: digits,
    render: render,
    // where people come in from and leave to (x offsets for the walk)
    enterFrom: -300, exitTo: 300, fallTo: 110,
    // clickable props in the foreground, native coordinates; `open` names what the UI opens
    props: [
      { id: 'notebook', open: 'notebook', x: 422, y: 190, w: 46, h: 32, label: 'Notebook' }
    ],
    /** Drawing kit for people or close-ups kept in other files. kit.on(z, fn) draws on a zoom canvas. */
    kit: {
      P: P, S: S,
      R: function (x, y, w, h, c) { R(x, y, w, h, c); },
      El: function (cx, cy, rx, ry, c) { El(cx, cy, rx, ry, c); },
      poly: function (pts, c) { poly(pts, c); },
      D: function (x, y, w, h, c, d, oval) { D(x, y, w, h, c, d, oval); },
      text: function (str, x, y, c, size, font) { text(str, x, y, c, size, font); },
      digits: function (str, x, y, c) { digits(g, str, x, y, c); },
      head: head, coat: coat, hands: hands,
      fill: fill,
      on: function (z, fn) { var keep = g; g = z; try { fn(); } finally { g = keep; } }
    },
    /** Wrap a PNG authored at 1x on the 480x270 frame as a draw function. */
    sprite: function (src, x, y) {
      var img = new Image(); img.src = src;
      return function () { if (img.complete) g.drawImage(img, x || 180, y || 30); };
    }
  };
})();
