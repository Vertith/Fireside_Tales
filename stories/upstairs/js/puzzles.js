/*
 * Upstairs: story-only steps and the three small puzzles (the cut phone
 * cord, dialling 911, the torn photo). Each puzzle is one screen in the
 * #puzzle-overlay sheet and resolves true (done) or false (put it down).
 */
(function () {
  'use strict';
  var E = window.TALE;
  var $ = function (id) { return document.getElementById(id); };
  E.steps = E.steps || {};

  /* ---------- steps ---------- */
  E.steps.room = function (game, step) {
    if (E.art.state.room !== step.room) E.ui.setTranscript('', '');   // last room's words stay in the last room
    E.art.state.room = step.room;
    return null;
  };

  E.steps.vanish = function (game) {
    game.run.present = null;
    E.ui.present = null;
    E.art.state.person = null; E.art.state.vx = 0; E.art.state.vy = 0;
    E.ui.setTranscript('', '');
    $('hots').innerHTML = '';
    $('zoom').hidden = true;
    return null;
  };

  // Owen's eyes: 'sleep' drifts shut over a few heavy blinks, 'wake' opens slowly, 'shut' closes at once.
  E.steps.blink = function (game, step) {
    var S = E.art.state, K = {
      sleep: [[0, 0], [700, 0.55], [1100, 0.15], [2000, 0.8], [2400, 0.45], [3600, 1]],
      wake: [[0, 1], [500, 1], [1400, 0.6], [1700, 0.85], [2800, 0]],
      open: [[0, 1], [700, 0]],
      shut: [[0, 1]]
    }[step.blink] || [[0, 0]];
    if (game.skipping || window.matchMedia('(prefers-reduced-motion: reduce)').matches) K = [[0, K[K.length - 1][1]]];
    S.blink = { keys: K, start: performance.now() };
    return E.ui.wait(K[K.length - 1][0] + 200).then(function () { return null; });
  };

  E.steps.count = function (game, step) {
    var c = game.run.counts = game.run.counts || {};
    c[step.count] = (c[step.count] || 0) + 1;
    return null;
  };

  E.steps.mark = function (game, step) {
    game.run[step.mark] = (game.run.counts && game.run.counts.foyer) || 0;
    return null;
  };

  E.steps.puzzle = async function (game, step, ctx, gen) {
    var ok = await E.puzzles[step.puzzle](game);
    game.check(gen);
    return game.runSteps((ok ? step.then : step['else']) || [], ctx + '.' + step.puzzle + (ok ? '.done' : '.left'), gen);
  };

  // The basement: two good proofs and Dad lowers the gun; two bad ones and he doesn't.
  E.steps.proof = async function (game, step, ctx, gen) {
    var r = game.run;
    if (step.proof === 'good') {
      r.good = (r.good || 0) + 1;
      if (r.good >= 2) return { goto: 'reunited' };
      return game.runSteps([{ narrate: 'The gun went down an inch. Not all the way.' }], ctx + '.proof', gen);
    }
    r.bad = (r.bad || 0) + 1;
    if (r.bad >= 2) return { goto: 'shot' };
    return game.runSteps([{ who: 'family', say: 'Last chance, bug. If that\'s you. Last chance.', noSkip: true }], ctx + '.proof', gen);
  };

  /* ---------- the puzzle sheet ---------- */
  function open(title, sub) {
    $('pz-title').textContent = title;
    $('pz-sub').textContent = sub;
    $('pz-msg').textContent = '';
    $('pz-body').innerHTML = '';
    $('pz-quit').hidden = false;
    $('puzzle-overlay').hidden = false;
    return $('pz-body');
  }
  function run(build) {
    return new Promise(function (resolve) {
      var finished = false;
      function done(ok) {
        if (finished) return; finished = true;
        $('pz-quit').onclick = null;
        if (ok) {
          $('pz-quit').hidden = true;
          setTimeout(function () { $('puzzle-overlay').hidden = true; resolve(true); }, 1100);
        } else { $('puzzle-overlay').hidden = true; resolve(false); }
      }
      $('pz-quit').onclick = function () { done(false); };
      build(done);
      var first = $('pz-body').querySelector('button');
      if (first && !('ontouchstart' in window)) first.focus({ preventScroll: true });
    });
  }
  function say(text) { $('pz-msg').textContent = text; }
  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  E.puzzles = {
    /* The cut cord: click a wire on the wall end, then the same colour on the phone end. */
    wires: function () {
      var body = open('The phone cord', 'Four little wires on each end. Click one on the wall side, then the one that matches on the phone side.');
      var colors = [
        { id: 'red', name: 'red', css: '#a8323a' },
        { id: 'green', name: 'green', css: '#4d6b3a' },
        { id: 'yellow', name: 'yellow', css: '#e0b84a' },
        { id: 'black', name: 'black', css: '#161a2a' }
      ];
      return run(function (done) {
        var wrap = document.createElement('div'); wrap.className = 'wires';
        var left = document.createElement('div'), right = document.createElement('div');
        left.className = 'wire-col'; right.className = 'wire-col right';
        var mid = document.createElement('div'); mid.className = 'wire-gap'; mid.textContent = 'snip';
        wrap.appendChild(left); wrap.appendChild(mid); wrap.appendChild(right);
        body.appendChild(wrap);
        var picked = null, joined = 0;
        function wire(c, side) {
          var b = document.createElement('button');
          b.type = 'button'; b.className = 'wire'; b.style.setProperty('--w', c.css);
          b.setAttribute('aria-label', c.name + ' wire, ' + (side === 'l' ? 'wall side' : 'phone side'));
          b.innerHTML = '<span class="strand"></span><span class="tip"></span>';
          b.dataset.c = c.id;
          return b;
        }
        colors.forEach(function (c) {
          var b = wire(c, 'l');
          b.addEventListener('click', function () {
            if (b.classList.contains('joined')) return;
            left.querySelectorAll('.wire').forEach(function (x) { x.classList.remove('picked'); });
            b.classList.add('picked'); picked = b; say('The ' + c.name + ' one. Now its match.');
          });
          left.appendChild(b);
        });
        var order = shuffle(colors.slice());
        if (order.every(function (c, i) { return c === colors[i]; })) order.reverse();
        order.forEach(function (c) {
          var b = wire(c, 'r');
          b.addEventListener('click', function () {
            if (b.classList.contains('joined')) return;
            if (!picked) { say('Start on the wall side.'); return; }
            if (picked.dataset.c !== c.id) { say('That\'s not the same color. Dad says that makes sparks.'); b.classList.add('nope'); setTimeout(function () { b.classList.remove('nope'); }, 300); return; }
            picked.classList.remove('picked'); picked.classList.add('joined'); b.classList.add('joined');
            picked.disabled = true; b.disabled = true; picked = null; joined++;
            say(joined < 4 ? 'Twisted. ' + (4 - joined) + ' to go.' : 'All four. The phone made a little hum.');
            if (joined === 4) done(true);
          });
          right.appendChild(b);
        });
      });
    },

    /* Dial 9-1-1. */
    dial: function () {
      var body = open('The phone', 'A dial tone. Mom made me learn the number for emergencies.');
      return run(function (done) {
        var screen = document.createElement('div'); screen.className = 'dial-screen'; screen.textContent = '_ _ _';
        var pad = document.createElement('div'); pad.className = 'keypad';
        body.appendChild(screen); body.appendChild(pad);
        var typed = '';
        '123456789*0#'.split('').forEach(function (k) {
          var b = document.createElement('button');
          b.type = 'button'; b.textContent = k; b.className = 'key';
          b.addEventListener('click', function () {
            E.audio.play('beep');
            typed += k;
            screen.textContent = (typed + '___').slice(0, 3).split('').join(' ');
            if (typed.length < 3) return;
            if (typed === '911') { say('Ringing...'); done(true); }
            else { say('That wasn\'t it. Hang up and try again.'); typed = ''; setTimeout(function () { screen.textContent = '_ _ _'; }, 500); }
          });
          pad.appendChild(b);
        });
      });
    },

    /* The torn photo: click two pieces to swap them until the picture is right. */
    photo: function () {
      var body = open('The torn picture', 'Six pieces of the picture from the mantel. Click two pieces to swap them.');
      return run(function (done) {
        var src = document.createElement('canvas'); src.width = 96; src.height = 64;
        var sg = src.getContext('2d'); sg.imageSmoothingEnabled = false;
        E.art.photo(sg);
        var grid = document.createElement('div'); grid.className = 'photo-grid';
        body.appendChild(grid);
        var slots = shuffle([0, 1, 2, 3, 4, 5]);
        if (slots.every(function (p, i) { return p === i; })) slots = [1, 0, 2, 3, 5, 4];
        var sel = null;
        function draw() {
          grid.innerHTML = '';
          slots.forEach(function (piece, i) {
            var b = document.createElement('button');
            b.type = 'button'; b.className = 'piece' + (sel === i ? ' picked' : '');
            b.setAttribute('aria-label', 'Piece in spot ' + (i + 1));
            var c = document.createElement('canvas'); c.width = 32; c.height = 32;
            var g = c.getContext('2d'); g.imageSmoothingEnabled = false;
            g.drawImage(src, (piece % 3) * 32, Math.floor(piece / 3) * 32, 32, 32, 0, 0, 32, 32);
            b.appendChild(c);
            b.addEventListener('click', function () {
              if (sel === null) { sel = i; draw(); grid.querySelectorAll('.piece')[i].focus(); return; }
              var t = slots[sel]; slots[sel] = slots[i]; slots[i] = t; sel = null; draw();
              grid.querySelectorAll('.piece')[i].focus();
              if (slots.every(function (p, k) { return p === k; })) {
                grid.classList.add('solved');
                grid.querySelectorAll('button').forEach(function (x) { x.disabled = true; });
                say('There. That\'s us.');
                done(true);
              }
            });
            grid.appendChild(b);
          });
        }
        draw();
      });
    }
  };
})();
