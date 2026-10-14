/*
 * Fireside Tales story template: the screen.
 * Forked from Emit Time's ui.js, 14 Oct 2026. This copy belongs to this story.
 *
 * Everything the engine asks to show goes through this object. The art is
 * one 480x270 canvas (js/art.js); text and buttons are HTML laid over it at
 * native coordinates when the screen fits a 2x scale, and stacked under it
 * on narrow screens.
 */
(function () {
  'use strict';
  var E = window.TALE;
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
    var c = E.content.characters[id], v = E.content.people[id];
    return (v && v.portrait) || (c && c.portrait) || id;
  }

  var UI = {
    game: null,
    pending: null,
    typing: null,
    mode: null,
    present: null,   // person id in view
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

      // props, and advancing by clicking the room
      canvas.addEventListener('mousemove', function (e) {
        var p = self.native(e), hit = self.propAt(p);
        self.S.hover = hit ? hit.id : null;
        canvas.style.cursor = hit ? 'pointer' : (self.mode === 'line' && E.art.inView(p) ? 'pointer' : 'default');
      });
      canvas.addEventListener('mouseleave', function () { self.S.hover = null; });
      canvas.addEventListener('click', function (e) {
        var p = self.native(e), hit = self.propAt(p);
        if (hit) { self.openProp(hit); return; }
        if (E.art.inView(p)) self.advance();
      });
      $('narr').addEventListener('click', function () { self.advance(); });
      $('transcript').addEventListener('click', function (e) { if (!e.target.closest('button')) self.advance(); });
      $('btn-next').addEventListener('click', function () { self.advance(); });
      $('btn-skip').addEventListener('click', function () { self.answer('skip'); });
      $('zoom').addEventListener('click', function () { $('zoom').hidden = true; });

      $('btn-notebook').addEventListener('click', function () { self.openNotebook(); });
      $('btn-menu').addEventListener('click', function () { self.openMenu(); });
      $('btn-sound').addEventListener('click', function () { self.soundLabel(E.audio.toggle()); });
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
        } else if (/^[1-9]$/.test(e.key) && (self.mode === 'choice' || self.mode === 'meet')) {
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

    native: function (e) {
      var r = $('screen').getBoundingClientRect();
      return { x: (e.clientX - r.left) * 480 / r.width, y: (e.clientY - r.top) * 270 / r.height };
    },

    propAt: function (p) {
      var hit = null;
      E.art.props.forEach(function (q) {
        if (q.when && !q.when()) return;
        if (p.x >= q.x && p.x < q.x + q.w && p.y >= q.y && p.y < q.y + q.h) hit = q;
      });
      return hit;
    },

    /** A prop was clicked. 'notebook' is built in; anything else calls TALE.props[id](game) if the story defines it. */
    openProp: function (prop) {
      if (prop.open === 'notebook') return this.openNotebook();
      if (this.game) this.game.saw('prop.' + prop.id);
      if (E.props && E.props[prop.id]) E.props[prop.id](this.game, this);
      this.meetRefresh();
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
      S.person = null; S.vx = 0; S.vy = 0; S.move = null; S.backdrop = null;
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
      this.drawHud();
    },

    clock: function (t) { this.S.clock = t; this.drawHud(); },
    drawHud: function () {
      $('hud').textContent = (this.S.clock ? this.S.clock + ' · ' : '') + (E.config.loopWord || 'loop') + ' ' + this.S.loop;
    },
    backdrop: function (state) { this.S.backdrop = state || null; },

    wait: function (ms) {
      return new Promise(function (r) { setTimeout(r, reduced ? Math.min(ms, 300) : ms); });
    },

    /* ---------- people in view ---------- */
    move: function (axis, from, to, ms) {
      var S = this.S;
      if (axis === 'x') S.vx = from; else S.vy = from;
      return new Promise(function (resolve) {
        S.move = { axis: axis, from: from, to: to, start: performance.now(), ms: reduced ? 1 : ms, done: resolve };
      });
    },

    enter: function (id, fast, side) {
      this.present = id;
      this.S.person = artKey(id);
      this.S.vy = 0;
      this.setTranscript('', '');
      $('hots').innerHTML = '';
      $('zoom').hidden = true;
      var self = this;
      if (side === 'here') return this.move('x', 0, 0, fast ? 1 : 260).then(function () { self.hotspots(id); });
      return this.move('x', side === 'right' ? E.art.exitTo : E.art.enterFrom, 0, fast ? 1 : 700).then(function () { self.hotspots(id); });
    },

    exit: function (kind, fast, side) {
      var S = this.S, self = this;
      $('hots').innerHTML = '';
      $('zoom').hidden = true;
      if (!S.person) return Promise.resolve();
      var p = kind === 'fall' ? this.move('y', 0, E.art.fallTo, fast ? 1 : 380) : this.move('x', 0, side === 'left' ? E.art.enterFrom : E.art.exitTo, fast ? 1 : 650);
      return p.then(function () { S.person = null; S.vx = 0; S.vy = 0; self.present = null; });
    },

    flash: function (kind, fast) {
      var S = this.S;
      S.flashReverse = false;
      S.flashSub = 0;
      S.flashT = 0;
      return this.wait(fast ? 250 : 1100);
    },

    /* ---------- inspection: click a person to look closer ---------- */
    hotspots: function (id) {
      var v = E.content.people[id], box = $('hots'), self = this;
      box.innerHTML = '';
      if (!v || !v.inspect) return;
      var W = E.art.VIEW;
      this.looked = {};
      this.padTitle();
      this.spots = v.inspect.filter(function (h) { return !h.when || h.when(); });
      this.spots.forEach(function (h) {
        var x = Math.max(W.x, h.x), y = Math.max(W.y, h.y);
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
      this.closeUp(h.zoom, h.title, typeof h.text === 'function' ? h.text() : h.text);
      var note = typeof h.note === 'function' ? h.note() : h.note;
      this.looked = this.looked || {};
      this.looked[h.title] = true;
      this.padTitle();
      if (this.game) {
        this.game.note(id, note || $('zoom-text').textContent);
        if (h.learn) this.game.learn(h.learn);
        this.game.saw(id + '.' + (h.id || h.zoom));
        this.meetRefresh();
      }
    },

    closeUp: function (zoom, title, text) {
      var z = $('zoom-art').getContext('2d');
      z.imageSmoothingEnabled = false;
      z.clearRect(0, 0, 32, 24);
      if (E.art.zooms[zoom]) E.art.zooms[zoom](z);
      $('zoom-title').textContent = title || '';
      $('zoom-text').textContent = text || '';
      $('zoom').hidden = false;
    },

    /** The pad title counts what you've looked at on the person in front of you. */
    padTitle: function () {
      var v = this.present && E.content.people[this.present];
      var base = this.mode === 'choice' ? (this.choiceTitle || E.config.choiceTitle || 'Say') : (E.config.padTitle || 'Ask');
      var n = v && v.inspect ? (this.spots || v.inspect).length : 0;
      $('pad-title').textContent = n && this.mode !== 'choice'
        ? base + ' · looked at ' + Object.keys(this.looked || {}).length + ' of ' + n
        : base;
    },

    /** A close-up the script hands you, same panel as inspecting. */
    show: function (spec) {
      this.closeUp(spec.zoom, spec.title, spec.text);
      return Promise.resolve();
    },

    /** Act title between parts of the story. Click or press Space to carry on. */
    actCard: function (act, title) {
      var o = $('act-overlay');
      $('act-eyebrow').textContent = act;
      $('act-title').textContent = title;
      o.hidden = false;
      var stop = E.audio.score ? E.audio.score() : function () {};
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
      $('transcript').classList.toggle('blank', !who && !text);   // no paper bubble when nobody has spoken
    },
    setNarr: function (text) { $('narr').textContent = text; },

    /** Used when lines are skipped, so the screen still shows where you are. */
    setLine: function (who, text) {
      if (who) this.setTranscript(who, text, true); else this.setNarr(text);
    },

    showLine: function (opts) {
      var self = this;
      this.mode = 'line';
      $('pad').hidden = true;
      $('actions').hidden = true;
      $('controls').hidden = false;
      $('btn-skip').hidden = !opts.heardBefore;
      var target, text = opts.text;
      if (opts.who) {
        this.setTranscript(opts.who, '');
        target = $('line');
        $('ui').dataset.active = 'speech';
      } else {
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

    /* ---------- questions and meetings ---------- */
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
      $('ui').dataset.active = 'meet';
      if (prompt) this.setNarr(prompt);
      $('pad').hidden = false;
    },

    choices: function (spec) {
      var self = this;
      this.mode = 'choice';
      this.turn(spec.prompt);
      $('actions').hidden = true;
      this.choiceTitle = spec.title;
      $('pad-title').textContent = spec.title || E.config.choiceTitle || 'Say';
      return new Promise(function (resolve) {
        self.renderQuestions(spec.options, function (i) { self.mode = null; $('pad').hidden = true; resolve(i); });
        self.focusFirst();
      });
    },

    meet: function (spec) {
      var self = this;
      this.mode = 'meet';
      this.turn(spec.prompt);
      this.padTitle();
      $('actions').hidden = false;
      return new Promise(function (resolve) {
        function done(v) {
          self.meetDone = null;
          self.mode = null;
          $('pad').hidden = true; $('actions').hidden = true;
          resolve(v);
        }
        self.meetDone = done;
        self.renderQuestions(spec.questions, function (i) { done({ type: 'question', id: spec.questions[i].id }); });
        self.renderActions(spec.actions, done);
        self.focusFirst();
      });
    },

    renderActions: function (actions, done) {
      var box = $('actions'), self = this;
      box.innerHTML = '';
      box.style.setProperty('--n', String(Math.max(1, actions.length)));
      actions.forEach(function (a) {
        var b = self.stamp(a.stamp, (a.cls || a.id) + (a.locked ? ' locked' : ''), a.locked ? a.hint : a.label);
        if (a.locked) b.disabled = true;
        b.addEventListener('click', function () { done({ type: 'action', id: a.id }); });
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

    /** Something new was noticed mid-meeting: redraw the questions so unlocked ones appear. */
    meetRefresh: function () {
      if (this.mode === 'meet' && this.meetDone) this.meetDone({ type: 'refresh' });
    },

    /* ---------- notebook and menu ---------- */
    noted: function () { $('nb-badge').hidden = false; },

    openNotebook: function () {
      // notes are filed by act, then by person
      var g = this.game, notes = g.memory.notebook, latest = g.memory.loop;
      var acts = (E.config.acts && E.config.acts.length) ? E.config.acts : [{ no: 1, name: 'Part One', title: '' }];
      var byAct = {};
      notes.forEach(function (n) {
        var a = Math.min(acts.length, n.act || 1);
        var bucket = byAct[a] = byAct[a] || { groups: {}, order: [], count: 0, fresh: 0 };
        if (!bucket.groups[n.who]) { bucket.groups[n.who] = []; bucket.order.push(n.who); }
        bucket.groups[n.who].push(n); bucket.count++; if (n.loop === latest) bucket.fresh++;
      });
      var here = Math.min(acts.length, (g.run && g.run.actNo) || 1);
      var html = notes.length ? '' : '<p class="empty-note">Nothing written down yet. Ask questions, and click on people to look closer. The notebook keeps what you learn when things start over.</p>';
      acts.forEach(function (act) {
        var b = byAct[act.no];
        if (!b) return;
        html += '<details class="act"' + (act.no === here ? ' open' : '') + '><summary><span class="act-name">' + esc(act.name) +
          (act.title ? ' · ' + esc(act.title) : '') + '</span><span class="act-count">' + b.count + ' note' + (b.count === 1 ? '' : 's') +
          (b.fresh ? ', ' + b.fresh + ' new' : '') + '</span></summary>';
        b.order.forEach(function (who) {
          var c = E.content.characters[who];
          html += '<h3>' + esc(c ? c.notebookName || c.name : who) + '</h3><ul>';
          b.groups[who].forEach(function (n) {
            html += '<li class="' + (n.loop === latest ? 'new' : '') + '"><span class="txt">' + esc(n.text) + '</span><span class="when">' + (E.config.loopWord || 'loop') + ' ' + n.loop + '</span></li>';
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

    openMenu: function () {
      var wipe = $('menu-wipe');
      wipe.dataset.armed = '';
      wipe.textContent = 'Wipe memory and start over';
      $('menu-overlay').hidden = false;
      $('menu-overlay').querySelector('.close').focus();
    },

    /* ---------- loop reset and end ---------- */
    resetSequence: function (reason, nextLoop) {
      var S = this.S, C = E.config;
      return new Promise(function (resolve) {
        S.blink = { keys: [[0, 1]], start: performance.now() };   // stay in the dark
        setTimeout(function () {
          $('reset-reason').textContent = reason;
          $('reset-loop').textContent = (E.config.loopWordCap || 'Loop') + ' ' + nextLoop;
          $('reset-text').textContent = C.resetText || '';
          $('reset-go').textContent = C.resetButton || 'Start again';
          $('reset-overlay').hidden = false;
          $('reset-go').focus();
        }, reduced ? 0 : 400);
        $('reset-go').onclick = function () {
          $('reset-go').onclick = null;
          $('reset-overlay').hidden = true;
          S.tally = nextLoop - 1;
          S.tallyFreshAt = S.t;
          resolve();
        };
      });
    },

    endCard: function (id, stats) {
      var card = (E.content.endings || {})[id] || { eyebrow: '', title: 'The end.', text: '' };
      $('zoom').hidden = true;
      $('end-eyebrow').textContent = card.eyebrow;
      $('end-title').textContent = card.title;
      $('end-text').textContent = card.text;
      $('end-stats').innerHTML =
        '<span>' + (E.config.loopWord || 'loop').toUpperCase() + ' ' + stats.loop + '</span><span>' + stats.notes + ' NOTES</span>' +
        (E.config.endingCount ? '<span>' + Object.keys(stats.endings).filter(function (k) { return E.content.endings[k]; }).length + ' OF ' + E.config.endingCount + ' ENDINGS</span>' : '<span>' + stats.knows + ' REMEMBERED</span>');
      $('end-overlay').hidden = false;
      $('end-again').focus();
    },

    error: function (e) { this.setNarr('Something broke in the script: ' + e.message); }
  };

  E.ui = UI;
})();
