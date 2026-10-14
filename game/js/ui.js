/*
 * Emit Time — the screen. Everything the engine asks to show goes through
 * this object. The art is one 480x270 canvas (js/art.js); text and buttons
 * are HTML laid over it at native coordinates when the screen is wide enough
 * for a 2x scale, and stacked under it on narrow screens.
 */
(function () {
  'use strict';
  var E = window.EMIT;
  var $ = function (id) { return document.getElementById(id); };
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function charName(id) {
    var c = E.content.characters[id];
    return c ? c.name : id;
  }
  function artKey(id) {
    var c = E.content.characters[id], v = E.content.visitors[id];
    return (v && v.portrait) || (c && c.portrait) || id;
  }

  var UI = {
    game: null,
    pending: null,
    typing: null,
    mode: null,
    present: null,   // visitor id in the window
    S: null,         // art state

    init: function () {
      var self = this;
      this.S = E.art.state;
      this.S.still = reduced;
      var canvas = $('screen');
      this.ctx = canvas.getContext('2d', { willReadFrequently: true });
      this.ctx.imageSmoothingEnabled = false;
      (function loop(now) { E.art.render(self.ctx, now); requestAnimationFrame(loop); })(performance.now());

      window.addEventListener('resize', function () { self.fit(); });
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { self.fit(); });
      this.fit();

      // desk props and advancing by clicking the booth
      canvas.addEventListener('mousemove', function (e) {
        var p = self.native(e), hit = self.propAt(p);
        self.S.hover = hit ? hit.id : null;
        canvas.style.cursor = hit ? 'pointer' : (self.mode === 'line' && E.art.inView(p) ? 'pointer' : 'default');
      });
      canvas.addEventListener('mouseleave', function () { self.S.hover = null; });
      canvas.addEventListener('click', function (e) {
        var p = self.native(e), hit = self.propAt(p);
        if (hit) {
          if (hit.id === 'list') self.openList();
          else if (hit.id === 'radio') self.radio();
          else self.openNotebook();
          return;
        }
        if (E.art.inView(p)) self.advance();
      });
      $('narr').addEventListener('click', function () { self.advance(); });
      $('transcript').addEventListener('click', function (e) { if (!e.target.closest('button')) self.advance(); });
      $('btn-next').addEventListener('click', function () { self.advance(); });
      $('btn-skip').addEventListener('click', function () { self.answer('skip'); });
      $('zoom').addEventListener('click', function () { $('zoom').hidden = true; });

      $('btn-notebook').addEventListener('click', function () { self.openNotebook(); });
      $('btn-list').addEventListener('click', function () { self.openList(); });
      $('btn-menu').addEventListener('click', function () { self.openMenu(); });
      $('btn-sound').addEventListener('click', function () { self.soundLabel(E.audio.toggle()); });
      if (E.radio) {
        E.radio.setVolume(0.35);
        E.radio.onChange(function (st) {
          self.S.radio = { on: st.on, index: st.index };
          $('radio-text').textContent = st.on ? st.station.freq + ' ' + st.station.name : '';
          // tuning in the shortwave Morse once is enough for the soldiers to be asked about it
          if (st.on && st.station.id === 'morse' && self.game && self.game.run) self.game.learn('heardMorse');
        });
      }
      this.soundLabel(E.audio.isMuted());

      document.querySelectorAll('[data-close]').forEach(function (b) {
        b.addEventListener('click', function () { b.closest('.overlay').hidden = true; });
      });
      document.querySelectorAll('.overlay[data-dismiss]').forEach(function (o) {
        o.addEventListener('click', function (e) { if (e.target === o) o.hidden = true; });
      });

      document.addEventListener('keydown', function (e) {
        var open = document.querySelector('.overlay[data-dismiss]:not([hidden])');
        if (e.key === 'Escape') { if (open) open.hidden = true; $('zoom').hidden = true; return; }
        if (open || !$('title-overlay').hidden || !$('reset-overlay').hidden || !$('end-overlay').hidden) return;
        if ((e.key === ' ' || e.key === 'Enter') && self.mode === 'line') {
          if (e.target.tagName === 'BUTTON' && e.target.id !== 'btn-next') return;
          e.preventDefault(); self.advance();
        } else if ((e.key === 's' || e.key === 'S') && self.mode === 'line' && !$('btn-skip').hidden) {
          self.answer('skip');
        } else if (/^[1-9]$/.test(e.key) && (self.mode === 'choice' || self.mode === 'desk')) {
          var b = $('questions').querySelectorAll('button')[+e.key - 1];
          if (b) b.click();
        }
      });
    },

    /* ---------- scaling: whole-number scale when it fits, else stack the UI ---------- */
    fit: function () {
      var frame = $('frame'), stage = $('stage'), ui = $('ui');
      var availW = $('app').clientWidth;
      var availH = window.innerHeight - $('topbar').offsetHeight - 24;
      var whole = Math.floor(Math.min(availW / 480, availH / 270));
      var wide = whole >= 2;
      var scale = wide ? whole : Math.min(availW / 480, 2);
      stage.style.transform = 'scale(' + scale + ')';
      frame.style.width = 480 * scale + 'px';
      frame.style.height = 270 * scale + 'px';
      document.body.classList.toggle('wide', wide);
      document.body.classList.toggle('narrow', !wide);
      if (wide && ui.parentNode !== stage) stage.appendChild(ui);
      if (!wide && ui.parentNode !== $('app')) $('app').appendChild(ui);
      this.scale = scale;
    },

    /** Click the radio: switch on, then step through the stations, then off again. */
    radio: function () {
      var R = E.radio;
      if (!R) return;
      if (!R.isOn()) { R.tune(0); R.on(); }
      else if (R.state().index >= 5) R.off();
      else R.next();
    },

    native: function (e) {
      var r = $('screen').getBoundingClientRect();
      return { x: (e.clientX - r.left) * 480 / r.width, y: (e.clientY - r.top) * 270 / r.height };
    },

    propAt: function (p) {
      var hit = null;
      E.art.props.forEach(function (q) {
        if (p.x >= q.x && p.x < q.x + q.w && p.y >= q.y && p.y < q.y + q.h) hit = q;
      });
      return hit;
    },

    soundLabel: function (muted) {
      $('btn-sound').textContent = muted ? 'Sound off' : 'Sound on';
      $('btn-sound').setAttribute('aria-pressed', String(!muted));
    },

    /* ---------- state ---------- */
    newRun: function (game) {
      this.game = game;
      this.mode = null;
      this.present = null;
      var S = this.S;
      S.visitor = null; S.vx = 0; S.vy = 0; S.move = null; S.blood = false; this.setDrawer(false);
      S.crt = ['CAM 01 LOBBY', '> RAIN', '> REC'];
      this.drawCrt();
      $('pad').hidden = true;
      $('actions').hidden = true;
      $('zoom').hidden = true;
      $('hots').innerHTML = '';
      this.setTranscript('', '');
      this.setNarr('');
      this.refresh(game);
    },

    refresh: function (game) {
      game = game || this.game;
      this.S.loop = game.memory.loop;
      this.S.tally = game.memory.loop - 1;
      this.S.hasList = !!(game.run && game.run.flags.hasList);
      this.drawCrt();
    },

    clock: function (t) { this.S.clock = t; this.drawCrt(); },
    crt: function (lines) { this.S.crt = lines; this.drawCrt(); },
    drawCrt: function () {
      $('crt-text').innerHTML = this.S.crt.map(esc).join('\n') + '\n> ' + esc(this.S.clock) + '\n<span class="dim">LOOP ' + this.S.loop + '</span>';
    },
    backdrop: function (state, fluid) { this.S.blood = state === 'body' ? (fluid || 'blood') : false; },

    wait: function (ms) {
      return new Promise(function (r) { setTimeout(r, reduced ? Math.min(ms, 300) : ms); });
    },

    /* ---------- people in the window ---------- */
    move: function (axis, from, to, ms) {
      var S = this.S;
      if (axis === 'x') S.vx = from; else S.vy = from;
      return new Promise(function (resolve) {
        S.move = { axis: axis, from: from, to: to, start: performance.now(), ms: reduced ? 1 : ms, done: resolve };
      });
    },

    enter: function (id, fast, side) {
      this.present = id;
      this.S.visitor = artKey(id);
      this.S.vy = 0;
      this.setTranscript('', '');
      $('hots').innerHTML = '';
      $('zoom').hidden = true;
      var self = this;
      return this.move('x', side === 'right' ? E.art.exitTo : E.art.enterFrom, 0, fast ? 1 : 700).then(function () { self.hotspots(id); });
    },

    exit: function (kind, fast, side) {
      var S = this.S, self = this;
      $('hots').innerHTML = '';
      $('zoom').hidden = true;
      if (kind === 'fall' && S.drawerOpen) { clearTimeout(this.drawerTimer2); this.setDrawer(false); E.audio.play('drawer'); }
      if (!S.visitor) return Promise.resolve();
      var p = kind === 'fall' ? this.move('y', 0, E.art.fallTo, fast ? 1 : 380) : this.move('x', 0, side === 'left' ? E.art.enterFrom : E.art.exitTo, fast ? 1 : 650);
      return p.then(function () { S.visitor = null; S.vx = 0; S.vy = 0; self.present = null; });
    },

    /** Small lightning flickers through the glass doors: the normal palette, nothing like the big flash. */
    lightning: function (n) {
      var S = this.S, self = this, i = 0;
      return new Promise(function (resolve) {
        (function one() {
          if (i++ >= n) return resolve();
          S.bolt = 7; S.boltX = 30 + Math.floor(Math.random() * 100);
          setTimeout(one, 260 + Math.random() * 200);
        })();
      }).then(function () { return self.wait(250); });
    },

    flash: function (kind, fast) {
      var S = this.S;
      S.flashReverse = false;
      S.flashSub = 0;
      S.flashT = 0;
      return this.wait(fast ? 250 : 1100);
    },

    /* ---------- inspection: click a visitor to look closer ---------- */
    hotspots: function (id) {
      var v = E.content.visitors[id], box = $('hots'), self = this;
      box.innerHTML = '';
      if (!v || !v.inspect) return;
      var W = E.art.VIEW;
      this.looked = {};
      this.padTitle();
      this.spots = v.inspect.filter(function (h) { return !h.when || h.when(); });
      this.spots.forEach(function (h) {
        var x = Math.max(W.x, h.x + E.art.OX), y = Math.max(W.y, h.y + E.art.OY);
        var el = document.createElement('button');
        el.type = 'button';
        el.className = 'hot';
        el.setAttribute('aria-label', 'Look closer: ' + h.title.toLowerCase());
        el.title = 'Look closer';
        el.style.left = x + 'px';
        el.style.top = y + 'px';
        el.style.width = Math.min(h.w, W.x + W.w - x) + 'px';
        el.style.height = Math.min(h.h, W.y + W.h - y) + 'px';
        el.addEventListener('click', function (e) { e.stopPropagation(); self.inspect(id, h); });
        box.appendChild(el);
      });
    },

    inspect: function (id, h) {
      var z = $('zoom-art').getContext('2d');
      z.imageSmoothingEnabled = false;
      z.clearRect(0, 0, 32, 24);
      if (E.art.zooms[h.zoom]) E.art.zooms[h.zoom](z);
      $('zoom-title').textContent = h.title;
      var text = typeof h.text === 'function' ? h.text() : h.text;
      var note = typeof h.note === 'function' ? h.note() : h.note;
      $('zoom-text').textContent = text;
      $('zoom').hidden = false;
      this.looked = this.looked || {};
      this.looked[h.title] = true;
      this.padTitle();
      if (this.game) {
        this.game.note(id, note || text);
        if (h.learn) this.game.learn(h.learn);
        this.game.saw(id + '.' + (h.id || h.zoom));
        this.deskRefresh();
      }
    },

    /** The pad title counts what you've looked at on the visitor in front of you. */
    padTitle: function () {
      var v = this.present && E.content.visitors[this.present];
      var base = this.mode === 'choice' ? 'Say' : 'Ask';
      var n = v && v.inspect ? (this.spots || v.inspect).length : 0;
      $('pad-title').textContent = n && this.mode !== 'choice'
        ? base + ' \u00b7 looked at ' + Object.keys(this.looked || {}).length + ' of ' + n
        : base;
    },

    /** A close-up the script hands you (something lands on the desk), same panel as inspecting. */
    show: function (spec) {
      var z = $('zoom-art').getContext('2d');
      z.imageSmoothingEnabled = false;
      z.clearRect(0, 0, 32, 24);
      if (E.art.zooms[spec.zoom]) E.art.zooms[spec.zoom](z);
      $('zoom-title').textContent = spec.title || '';
      $('zoom-text').textContent = spec.text || '';
      $('zoom').hidden = false;
      return Promise.resolve();
    },

    /** Act title between parts of the night. Click or wait to carry on. */
    actCard: function (act, title) {
      var o = $('act-overlay');
      $('act-eyebrow').textContent = act;
      $('act-title').textContent = title;
      o.hidden = false;
      var stop = E.audio.score ? E.audio.score() : function () {};
      // stays up until the player clicks (or presses Space / Enter)
      return new Promise(function (resolve) {
        var done = function () {
          o.hidden = true; o.removeEventListener('click', done); document.removeEventListener('keydown', key, true);
          stop(); resolve();
        };
        var key = function (e) { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); done(); } };
        o.addEventListener('click', done);
        document.addEventListener('keydown', key, true);
      });
    },

    /* ---------- dialog ---------- */
    setTranscript: function (who, text, done) {
      $('who').textContent = who ? charName(who) : '';
      $('line').textContent = text;
      $('line').classList.toggle('done', !!done);
    },
    setNarr: function (text) { $('narr').textContent = text; },

    /** Used when lines are skipped, so the screen still shows where you are. */
    setLine: function (who, text) {
      $('controls').hidden = true; // nothing to click while skipping through
      if (who) { this.setNarr(''); this.setTranscript(who, text, true); }
      else { this.setTranscript('', ''); this.setNarr(text); }
    },

    showLine: function (opts) {
      var self = this;
      this.mode = 'line';
      $('pad').hidden = true;
      $('actions').hidden = true;
      $('controls').hidden = false;
      $('btn-skip').hidden = !opts.heardBefore;
      var target, text = opts.text;
      // only the newest line is on screen, so it's always clear what to read
      if (opts.who) {
        this.setNarr('');
        this.setTranscript(opts.who, '');
        target = $('line');
        $('ui').dataset.active = 'speech';
      } else {
        this.setTranscript('', '');
        target = $('narr');
        $('ui').dataset.active = 'narr';
      }
      target.textContent = '';
      target.classList.remove('done');
      clearInterval(this.typing);
      this.typingTarget = target;
      this.fullText = text;
      if (reduced) { target.textContent = text; target.classList.add('done'); this.typing = null; }
      else {
        var i = 0;
        this.typing = setInterval(function () {
          i += 2;
          target.textContent = text.slice(0, i);
          if (i >= text.length) { clearInterval(self.typing); self.typing = null; target.classList.add('done'); }
        }, 22);
      }
      return new Promise(function (resolve) { self.pending = resolve; });
    },

    advance: function () {
      if (this.mode !== 'line') return;
      if (this.typing) {
        clearInterval(this.typing); this.typing = null;
        this.typingTarget.textContent = this.fullText;
        this.typingTarget.classList.add('done');
        return;
      }
      this.answer('next');
    },

    answer: function (val) {
      var r = this.pending;
      if (!r) return;
      clearInterval(this.typing); this.typing = null;
      if (this.typingTarget) { this.typingTarget.textContent = this.fullText; this.typingTarget.classList.add('done'); }
      this.pending = null;
      this.mode = null;
      $('btn-skip').hidden = true;
      r(val);
    },

    /* ---------- questions and the desk ---------- */
    renderQuestions: function (list, onPick) {
      var box = $('questions');
      box.innerHTML = '';
      if (!list.length) { box.innerHTML = '<p class="empty">Nothing left to ask.</p>'; return; }
      list.forEach(function (q, i) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = q.noticed ? 'noticed' : q.memory ? 'memory' : q.heard ? 'heard' : '';
        b.innerHTML = '<span class="num">' + (i + 1) + '</span><span class="q">' + esc(q.text) + '</span>' +
          (q.noticed ? '<span class="tag">noticed</span>' : q.memory ? '<span class="tag">from memory</span>' : q.heard ? '<span class="tag">asked</span>' : '');
        b.addEventListener('click', function () { onPick(i); });
        box.appendChild(b);
      });
    },

    turn: function (prompt) {
      $('controls').hidden = true;
      $('btn-skip').hidden = true;
      $('ui').dataset.active = 'desk';
      if (prompt) this.setNarr(prompt);
      $('pad').hidden = false;
    },

    choices: function (spec) {
      var self = this;
      this.mode = 'choice';
      this.turn(spec.prompt);
      $('actions').hidden = true;
      $('pad-title').textContent = 'Say';
      var says = [], acts = [];
      spec.options.forEach(function (o, i) { (o.action ? acts : says).push({ o: o, i: i }); });
      return new Promise(function (resolve) {
        function pick(i) { self.mode = null; $('pad').hidden = true; $('actions').hidden = true; resolve(i); }
        self.renderQuestions(says.map(function (s) { return s.o; }), function (k) { pick(says[k].i); });
        if (acts.length) {
          $('actions').hidden = false;
          self.renderActions(acts.map(function (a) {
            return { id: a.o.action, stamp: a.o.stamp, label: a.o.label, index: a.i };
          }), function (v) {
            if (v.id === 'shoot') self.drawerTimer2 = setTimeout(function () { self.setDrawer(false); }, 2600);
            else self.setDrawer(false);
            var hit = acts.filter(function (a) { return a.o.action === v.id; })[0];
            pick(hit.i);
          });
        }
        self.focusFirst();
      });
    },

    desk: function (spec) {
      var self = this;
      this.mode = 'desk';
      this.turn(spec.prompt);
      this.padTitle();
      $('actions').hidden = false;
      return new Promise(function (resolve) {
        function done(v) {
          self.deskDone = null;
          self.mode = null;
          // after a shot the drawer stays out a moment, then slides home
          // the drawer slides home as the visitor goes down (see exit); a shot
          // that drops nobody, or the device on a person, closes it shortly after
          if (v && v.id === 'shoot') self.drawerTimer2 = setTimeout(function () { self.setDrawer(false); }, 2600);
          else if (v && v.id === 'shutdown') self.drawerTimer2 = setTimeout(function () { self.setDrawer(false); }, 700);
          else self.setDrawer(false);
          $('pad').hidden = true; $('actions').hidden = true;
          resolve(v);
        }
        self.deskDone = done;
        self.renderQuestions(spec.questions, function (i) { done({ type: 'question', id: spec.questions[i].id }); });
        self.renderActions(spec.actions, done);
        self.focusFirst();
      });
    },

    /** Open or close the desk drawer. The radio's HTML readout sits where the drawer
     *  slides out, so it's hidden while the drawer is out and comes back once it's home. */
    setDrawer: function (open) {
      var S = this.S;
      S.drawerOpen = open;
      clearTimeout(this.drawerTimer);
      if (open) $('radio-text').style.visibility = 'hidden';
      else this.drawerTimer = setTimeout(function () { if (!S.drawerOpen) $('radio-text').style.visibility = ''; }, 450);
    },

    renderActions: function (actions, done) {
      var box = $('actions'), self = this;
      box.innerHTML = '';
      // the device lives in the drawer with the revolver: both only show once it's open
      var device = actions.filter(function (a) { return a.id === 'shutdown' && !a.locked; })[0];
      box.classList.toggle('with-device', !!(this.S.drawerOpen && device));
      if (this.S.drawerOpen) {
        var fire = this.stamp('Fire', 'shoot armed', 'Fire the revolver');
        fire.addEventListener('click', function () { E.audio.play('scratch'); done({ type: 'action', id: 'shoot' }); });
        box.appendChild(fire);
        if (device) {
          var dev = this.stamp('Use device', 'shutdown', device.label || 'Use Kane\'s device');
          dev.addEventListener('click', function () { done({ type: 'action', id: 'shutdown' }); });
          box.appendChild(dev);
        }
        var shut = this.stamp('Shut drawer', 'drawer', 'Close the drawer');
        shut.addEventListener('click', function () { self.setDrawer(false); E.audio.play('drawer'); self.renderActions(actions, done); box.querySelector('button').focus(); });
        box.appendChild(shut);
        fire.focus();
        return;
      }
      actions.filter(function (a) { return a.id !== 'shutdown'; }).forEach(function (a) {
        var label = a.locked ? 'Device locked' : a.stamp;
        // the Drawer stamp only opens the drawer; firing is the next click
        var tip = a.locked ? a.hint : a.id === 'shoot' ? 'Open the drawer' : a.label;
        var b = self.stamp(label, a.id + (a.locked ? ' locked' : ''), tip);
        if (a.locked) b.disabled = true;
        b.addEventListener('click', function () {
          if (a.id === 'shoot') { self.setDrawer(true); E.audio.play('drawer'); self.renderActions(actions, done); return; }
          done({ type: 'action', id: a.id });
        });
        box.appendChild(b);
      });
    },

    stamp: function (label, cls, title) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'stamp ' + cls;
      b.textContent = label;
      if (title) { b.title = title; b.setAttribute('aria-label', title); }
      return b;
    },

    focusFirst: function () {
      var b = $('questions').querySelector('button') || $('actions').querySelector('button:not([disabled])');
      if (b && !('ontouchstart' in window)) b.focus({ preventScroll: true });
    },

    /* ---------- notebook, list, menu ---------- */
    noted: function () { $('nb-badge').hidden = false; },

    openNotebook: function () {
      // notes are filed by act (anything before Act One counts as Act One), then by person
      var g = this.game, notes = g.memory.notebook, latest = g.memory.loop;
      var acts = E.content.acts && E.content.acts.length ? E.content.acts : [{ no: 1, name: 'Act One', title: '' }];
      var actOf = E.content.actOf || {}, byAct = {};
      notes.forEach(function (n) {
        var a = Math.min(acts.length, n.act || actOf[n.who] || 1);
        var bucket = byAct[a] = byAct[a] || { groups: {}, order: [], count: 0, fresh: 0 };
        if (!bucket.groups[n.who]) { bucket.groups[n.who] = []; bucket.order.push(n.who); }
        bucket.groups[n.who].push(n); bucket.count++; if (n.loop === latest) bucket.fresh++;
      });
      var here = Math.min(acts.length, (g.run && g.run.actNo) || 1);
      var html = notes.length ? '' : '<p class="empty-note">Nothing written down yet. Ask questions, and click on people in the window to look closer. The notebook keeps what you learn when the night starts over.</p>';
      acts.forEach(function (act) {
        var b = byAct[act.no];
        if (!b) return;
        html += '<details class="act"' + (act.no === here ? ' open' : '') + '><summary><span class="act-name">' + esc(act.name) +
          (act.title ? ' \u00b7 ' + esc(act.title) : '') + '</span><span class="act-count">' + b.count + ' note' + (b.count === 1 ? '' : 's') +
          (b.fresh ? ', ' + b.fresh + ' new' : '') + '</span></summary>';
        b.order.forEach(function (who) {
          var c = E.content.characters[who];
          html += '<h3>' + esc(c ? c.notebookName || c.name : who) + '</h3><ul>';
          b.groups[who].forEach(function (n) {
            html += '<li class="' + (n.loop === latest ? 'new' : '') + '"><span class="txt">' + esc(n.text) + '</span><span class="when">loop ' + n.loop + '</span></li>';
          });
          html += '</ul>';
        });
        html += '</details>';
      });
      $('notebook-body').innerHTML = html;
      $('nb-badge').hidden = true;
      $('notebook-overlay').hidden = false;
      $('notebook-overlay').querySelector('.close').focus();
    },

    openList: function () {
      var has = this.game && this.game.run && this.game.run.flags.hasList;
      var list = E.content.visitorList || [];
      var html;
      if (!has) {
        html = '<p class="empty-note">The clipboard is empty. Nobody has told you to expect anyone tonight.</p>';
      } else {
        html = '<div class="table-wrap"><table><thead><tr><th>Visitor</th><th>Organisation</th><th>Seeing</th></tr></thead><tbody>';
        list.forEach(function (r) {
          html += '<tr><td>' + esc(r.name) + '</td><td>' + esc(r.org) + '</td><td>' + esc(r.seeing) + '</td></tr>';
        });
        html += '</tbody></table></div><p class="signed">Authorised, A. Kane</p>';
      }
      if (this.game && has) { this.game.saw('desk.list'); this.deskRefresh(); }
      $('list-body').innerHTML = html;
      $('list-overlay').hidden = false;
      $('list-overlay').querySelector('.close').focus();
    },

    /** Something new was noticed mid-desk: redraw the questions so unlocked ones appear. */
    deskRefresh: function () {
      if (this.mode === 'desk' && this.deskDone) this.deskDone({ type: 'refresh' });
    },

    openMenu: function () {
      var wipe = $('menu-wipe');
      wipe.dataset.armed = '';
      wipe.textContent = 'Wipe memory and start over';
      $('menu-overlay').hidden = false;
      $('menu-overlay').querySelector('.close').focus();
    },

    /* ---------- loop reset and end ---------- */
    resetSequence: function (reason, nextLoop) {
      var self = this, S = this.S;
      return new Promise(function (resolve) {
        E.audio.play('flash');
        S.flashReverse = true; S.flashSub = 0; S.flashT = 0;
        setTimeout(function () {
          $('reset-reason').textContent = reason;
          $('reset-loop').textContent = 'Loop ' + nextLoop;
          $('reset-overlay').hidden = false;
          $('reset-go').focus();
        }, reduced ? 0 : 700);
        $('reset-go').onclick = function () {
          $('reset-go').onclick = null;
          $('reset-overlay').hidden = true;
          S.tally = nextLoop - 1;
          S.tallyFreshAt = S.t;
          E.audio.play('scratch');
          resolve();
        };
      });
    },

    endCard: function (id, stats) {
      var card = (E.content.endings || {})[id] || { eyebrow: '', title: 'The end.', text: '' };
      $('end-eyebrow').textContent = card.eyebrow;
      $('end-title').textContent = card.title;
      $('end-text').textContent = card.text;
      $('end-stats').innerHTML =
        '<span>LOOP ' + stats.loop + '</span><span>' + stats.notes + ' NOTES</span><span>' + stats.knows + ' REMEMBERED</span>';
      $('end-overlay').hidden = false;
      $('end-again').focus();
    },

    error: function (e) { this.setNarr('Something broke in the script: ' + e.message); }
  };

  E.ui = UI;
})();
