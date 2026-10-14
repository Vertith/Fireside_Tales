/*
 * Fireside Tales story template: script engine.
 * Forked from Emit Time's engine (game/js/engine.js, 14 Oct 2026). This copy
 * belongs to this story only; change it freely, nothing else reads it.
 *
 * Runs the scene scripts in js/content/*.js. Scenes are plain arrays of steps
 * (see README.md for the full step list). Any `reset` step sends the player
 * back to the first scene, while the memory that carries across loops (heard
 * lines, notebook, knowledge flags) is kept and saved to localStorage under
 * TALE.config.saveKey.
 *
 * What stayed in Emit Time: the desk drawer, the shutdown device, the visitor
 * list and the legit/intruder/android rules. Here a meeting's actions and
 * their fallback outcomes come from TALE.config instead.
 */
(function () {
  'use strict';
  var E = (window.TALE = window.TALE || {});
  E.content = E.content || {};
  E.content.scenes = E.content.scenes || {};
  E.content.people = E.content.people || {};
  E.content.characters = E.content.characters || {};

  var CANCEL = { cancelled: true };
  function cfg() { return E.config || {}; }
  function storeKey() { return cfg().saveKey || 'fireside.' + (cfg().id || 'tale') + '.save.v1'; }

  function freshMemory() {
    return {
      loop: 1,         // which pass through the story this is
      heard: {},       // line key -> loop it was first heard in
      asked: {},       // "person.question" -> loop first asked
      knows: {},       // knowledge flags that survive resets -> loop learned
      notebook: [],    // { id, who, text, loop, act }
      endings: {}      // ending id -> loop first reached
    };
  }

  function load() {
    try {
      var raw = localStorage.getItem(storeKey());
      if (!raw) return null;
      var data = JSON.parse(raw);
      var base = freshMemory();
      for (var k in base) if (!(k in data)) data[k] = base[k];
      return data;
    } catch (e) { return null; }
  }

  function hash(s) {
    var h = 5381;
    for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
    return (h >>> 0).toString(36);
  }

  function Game(ui) {
    this.ui = ui;
    this.memory = load() || freshMemory();
    this.hasSave = !!load();
    this.gen = 0;
    this.run = null;
    this.skipping = false;
  }

  Game.prototype.save = function () {
    try { localStorage.setItem(storeKey(), JSON.stringify(this.memory)); } catch (e) { /* storage unavailable */ }
  };

  Game.prototype.wipe = function () {
    this.memory = freshMemory();
    try { localStorage.removeItem(storeKey()); } catch (e) { /* ignore */ }
    this.hasSave = false;
  };

  /* ---------- conditions ----------
   * "flag"          learned on an earlier loop (memory)
   * "now:flag"      learned at any time, this loop included
   * "run:flag"      set this loop only
   * "saw:spot"      inspected (this loop or remembered)
   * "loop>=3"       third loop or later
   * "!x"            negation; an array means all of them
   */
  Game.prototype.test = function (cond) {
    if (!cond) return true;
    if (Array.isArray(cond)) return cond.every(this.test, this);
    if (typeof cond === 'function') return !!cond(this);
    var neg = cond.charAt(0) === '!';
    if (neg) cond = cond.slice(1);
    var lp = /^loop>=(\d+)$/.exec(cond);
    var val = lp ? this.memory.loop >= +lp[1]
      : cond.indexOf('saw:') === 0 ? !!(this.run.flags[cond] || this.memory.knows[cond])
      : cond.indexOf('run:') === 0 ? !!this.run.flags[cond.slice(4)]
      : cond.indexOf('now:') === 0 ? !!this.memory.knows[cond.slice(4)]
      : !!this.memory.knows[cond] && this.memory.knows[cond] < this.memory.loop;
    return neg ? !val : val;
  };

  Game.prototype.check = function (gen) {
    if (gen !== this.gen) throw CANCEL;
  };

  /* ---------- the main loop ---------- */
  Game.prototype.firstScene = function () { return cfg().firstScene || 'opening'; };

  Game.prototype.start = function (sceneId) {
    var self = this;
    var gen = ++this.gen;
    this.newRun();
    var scene = sceneId || this.firstScene();

    (async function () {
      try {
        for (;;) {
          var steps = E.content.scenes[scene];
          if (!steps) throw new Error('Unknown scene: ' + scene);
          var signal = await self.runSteps(steps, scene, gen);
          self.check(gen);
          if (!signal) signal = { end: 'unfinished' };
          if (signal.goto) { scene = signal.goto; continue; }
          if (signal.reset) {
            await self.reset(signal.reset, gen);
            scene = self.firstScene();
            continue;
          }
          if (signal.end) {
            if (!self.memory.endings[signal.end]) self.memory.endings[signal.end] = self.memory.loop;
            self.save();
            self.ui.endCard(signal.end, self.stats());
            return;
          }
        }
      } catch (e) {
        if (e !== CANCEL) { console.error(e); self.ui.error(e); }
      }
    })();
  };

  Game.prototype.newRun = function () {
    this.run = { flags: {}, asked: {}, present: null, slot: 0, queue: [] };
    this.skipping = false;
    this.ui.newRun(this);
  };

  Game.prototype.reset = async function (reason, gen) {
    this.skipping = false;
    var text = typeof reason === 'string' ? reason : reason.text;
    await this.ui.resetSequence(text, this.memory.loop + 1);
    this.check(gen);
    this.memory.loop += 1;
    this.save();
    this.newRun();
  };

  /** Start the next loop by choice (from the end card). Counts as a new pass. */
  Game.prototype.relive = function () {
    this.memory.loop += 1;
    this.save();
    this.start(this.firstScene());
  };

  Game.prototype.stats = function () {
    var m = this.memory;
    return { loop: m.loop, notes: m.notebook.length, knows: Object.keys(m.knows).length, endings: m.endings };
  };

  /* ---------- step interpreter ---------- */
  Game.prototype.runSteps = async function (steps, ctx, gen) {
    for (var i = 0; i < steps.length; i++) {
      this.check(gen);
      var r = await this.exec(steps[i], ctx, gen);
      if (r) return r;
    }
    return null;
  };

  Game.prototype.exec = async function (step, ctx, gen) {
    var ui = this.ui, fast = this.skipping;

    if ('narrate' in step) return this.line(null, step.narrate, ctx, gen, step);
    if ('say' in step) return this.line(step.who, step.say, ctx, gen, step);
    if (step.flash) { await ui.flash(step.flash, fast); return null; }
    if (step.sfx) { if (!fast) E.audio && E.audio.play(step.sfx); return null; }
    if (step.pause) { if (!fast) await ui.wait(step.pause); return null; }
    if (step.clock) { ui.clock(step.clock); return null; }
    if ('backdrop' in step) { ui.backdrop(step.backdrop); return null; }
    if (step.enter) { this.run.present = step.enter; this.run.heading = null; await ui.enter(step.enter, fast, step.from); return null; }
    if (step.exit) {
      this.run.gone = this.run.present; this.run.present = null;
      await ui.exit(step.exit, fast, this.exitSide(step.exit));
      return null;
    }
    if (step.note) { this.note(step.note[0], step.note[1]); return null; }
    if (step.learn) { this.learn(step.learn); return null; }
    if (step.set) { this.run.flags[step.set] = true; ui.refresh(this); return null; }
    if (step.unset) { delete this.run.flags[step.unset]; ui.refresh(this); return null; }
    if ('if' in step) {
      var branch = this.test(step['if']) ? step.then : step['else'];
      return branch ? this.runSteps(branch, ctx, gen) : null;
    }
    if (step.ask) { this.skipping = false; return this.ask(step.ask, ctx, gen); }
    if (step.meet) { this.skipping = false; return this.meet(step.meet, gen); }
    if (step.returns) return this.returns(gen);
    if (step.comeBack) { this.comeBack(step.comeBack, step.mode || 'new', step.after); return null; }
    if (step.show) { await ui.show(step.show); return null; }
    if ('actNo' in step) { this.run.actNo = step.actNo; return null; }
    if (step.act) { if (!fast) await ui.actCard(step.act, step.title || ''); return null; }
    if (step.goto) return { goto: step.goto };
    if (step.reset) return { reset: step.reset };
    if (step.end) return { end: step.end };
    if (step.run) return this.runSteps(E.content.scenes[step.run], step.run, gen);
    // a story can add its own steps: TALE.steps.myStep = function (game, step, ctx, gen) { ... }
    for (var k in step) if (E.steps && E.steps[k]) return (await E.steps[k](this, step, ctx, gen)) || null;
    console.warn('Unknown step', step);
    return null;
  };

  /** One line of dialog or narration. Lines heard in an earlier loop can be skipped. */
  Game.prototype.line = async function (who, text, ctx, gen, step) {
    text = text.replace('{loops}', String(this.memory.loop - 1)).replace('{loop}', String(this.memory.loop));
    var key = (step.key || ctx) + ':' + hash((who || '') + '|' + text);
    var first = this.memory.heard[key];
    var heardBefore = !!first && first < this.memory.loop && !step.noSkip;
    if (!first) { this.memory.heard[key] = this.memory.loop; this.save(); }

    if (this.skipping && heardBefore) {
      this.ui.setLine(who, text);
      return null;
    }
    this.skipping = false;

    var res = await this.ui.showLine({ who: who, text: text, heardBefore: heardBefore });
    this.check(gen);
    if (res === 'skip') this.skipping = true;
    return null;
  };

  Game.prototype.learn = function (flag) {
    if (!this.memory.knows[flag]) { this.memory.knows[flag] = this.memory.loop; this.save(); }
  };

  /** The player looked at something ('stranger.hands', 'prop.notebook'). Counts this loop and is remembered. */
  Game.prototype.saw = function (key) {
    this.run.flags['saw:' + key] = true;
    this.learn('saw:' + key);
  };

  Game.prototype.note = function (who, text) {
    var id = who + ':' + hash(text);
    for (var i = 0; i < this.memory.notebook.length; i++) {
      if (this.memory.notebook[i].id === id) return;
    }
    this.memory.notebook.push({ id: id, who: who, text: text, loop: this.memory.loop, act: this.run.actNo || 1 });
    this.save();
    this.ui.noted(this, who);
  };

  /** A free-standing choice menu. Options marked `exit: true` leave the menu. */
  Game.prototype.ask = async function (spec, ctx, gen) {
    var chosen = {};
    for (;;) {
      var self = this;
      var opts = spec.options.filter(function (o, i) {
        o._i = i;
        return self.test(o.requires) && (o.exit || !chosen[i]);
      });
      var pick = await this.ui.choices({
        prompt: spec.prompt,
        title: spec.title,
        options: opts.map(function (o) {
          var k = ctx + '.ask.' + o._i;
          return {
            text: o.text,
            heard: !!self.memory.asked[k] && self.memory.asked[k] < self.memory.loop,
            memory: !!o.requires && !o.requires.toString().match(/^(!|run:|now:)/),
            exit: !!o.exit
          };
        })
      });
      this.check(gen);
      var opt = opts[pick];
      chosen[opt._i] = true;
      var askKey = ctx + '.ask.' + opt._i;
      if (!this.memory.asked[askKey]) { this.memory.asked[askKey] = this.memory.loop; this.save(); }
      var r = await this.runSteps(opt.steps || [], askKey, gen);
      if (r) return r;
      if (opt.exit) return null;
    }
  };

  /* ---------- a meeting: questioning someone, inspecting them, then deciding ---------- */
  Game.prototype.meet = async function (id, gen, opts) {
    opts = opts || {};
    var v = E.content.people[id];
    if (!v) throw new Error('Unknown person: ' + id);
    var self = this, C = cfg();
    if (this.run.present !== id && v.portrait !== false) {
      this.run.present = id;
      await this.ui.enter(id, false, v.from);
    }
    var greet = opts.returning
      ? (v.returnGreeting || [{ who: id, say: 'Me again.' }])
      : v.greeting;
    if (greet) {
      var g = await this.runSteps(greet, id + (opts.returning ? '.return' : '.greeting'), gen);
      if (g) return g;
    }

    // everyone gets the same openers (config.openers); anything more is unlocked
    // by inspecting something ('saw:spot') or by memory from an earlier loop
    var all = (C.openers || []).filter(function (o) { return v.opening && v.opening[o.id]; })
      .map(function (o) { return { id: o.id, ask: o.ask, steps: v.opening[o.id] }; })
      .concat(v.questions || []);
    function req(q) {
      var r = q.requires;
      return typeof r === 'string' && /^saw:[^.]+$/.test(r) ? 'saw:' + id + '.' + r.slice(4) : r;
    }

    for (;;) {
      var questions = all.filter(function (q) {
        return self.test(req(q)) && !self.run.asked[id + '.' + q.id];
      }).map(function (q) {
        var k = id + '.' + q.id, r = req(q);
        var noticed = typeof r === 'string' && r.indexOf('saw:') === 0 && !!self.run.flags[r];
        return {
          id: q.id,
          text: q.ask,
          heard: !!self.memory.asked[k] && self.memory.asked[k] < self.memory.loop,
          noticed: noticed,
          memory: !noticed && !!r && typeof r === 'string' && !/^(!|run:|now:)/.test(r)
        };
      });

      var actions = (C.actions || []).filter(function (a) {
        return !(v.actions && v.actions[a.id] === false) && !self.run.flags['tried:' + id + '.' + a.id];
      }).map(function (a) {
        var spec = (v.actions && v.actions[a.id]) || {};
        var locked = !!a.requires && !self.test(a.requires);
        return {
          id: a.id,
          label: spec.label || a.label || a.stamp,
          stamp: locked ? (a.lockedStamp || a.stamp) : spec.stamp || a.stamp,
          cls: a.cls || '',
          locked: locked,
          hint: locked ? a.lockedHint || '' : spec.hint || ''
        };
      });

      var pick = await this.ui.meet({ id: id, person: v, questions: questions, actions: actions, prompt: v.prompt });
      this.check(gen);

      if (pick.type === 'refresh') continue;
      if (pick.type === 'question') {
        var q = all.filter(function (x) { return x.id === pick.id; })[0];
        var key = id + '.' + q.id;
        this.run.asked[key] = true;
        if (!this.memory.asked[key]) { this.memory.asked[key] = this.memory.loop; this.save(); }
        var r = await this.runSteps(q.steps || [], key, gen);
        if (r) return r;
        continue;
      }

      // the decision is made
      this.ui.setTranscript('', '');
      var action = (C.actions || []).filter(function (a) { return a.id === pick.id; })[0] || {};
      this.run.heading = action.heading || null;
      var outcome = (opts.returning && v.returnActions && v.returnActions[pick.id]) ||
        (v.actions && v.actions[pick.id]) || this.defaultOutcome(v, pick.id);
      var out = await this.runSteps((outcome && outcome.steps) || [], id + '.' + pick.id + (opts.returning ? '.return' : ''), gen);
      if (out) return out;
      // an outcome with `stay: true` keeps the meeting going (that action is used up)
      if (outcome && outcome.stay) { this.run.flags['tried:' + id + '.' + pick.id] = true; continue; }
      if (this.run.present === id) { this.run.present = null; await this.ui.exit('walk', this.skipping, this.exitSide('walk')); }
      return null;
    }
  };

  /** Walk-offs: {exit:'left'|'right'} is explicit; otherwise the action's `heading` decides ('in' = right, 'out' = left). */
  Game.prototype.exitSide = function (kind) {
    if (kind === 'left' || kind === 'right') return kind;
    return this.run.heading === 'out' ? 'left' : 'right';
  };

  Game.prototype.name = function (id) {
    var c = E.content.characters[id];
    return (c && c.name) || id;
  };

  /** Queue someone to arrive a few meetings later. mode 'return' uses their return greeting. */
  Game.prototype.comeBack = function (id, mode, after) {
    this.run.queue.push({ id: id, mode: mode, due: this.run.slot + (after || 3) });
  };

  /** Between meetings: count one more done, then bring in anyone due. */
  Game.prototype.returns = async function (gen) {
    this.run.slot += 1;
    var due = this.run.queue.filter(function (q) { return q.due <= this.run.slot; }, this);
    this.run.queue = this.run.queue.filter(function (q) { return q.due > this.run.slot; }, this);
    for (var i = 0; i < due.length; i++) {
      var q = due[i], v = E.content.people[q.id];
      if (!v) continue;
      var arrive = q.mode === 'return' ? (v.returnArrive || [{ sfx: 'door' }]) : (v.arrive || [{ sfx: 'door' }]);
      var r = await this.runSteps(arrive, q.id + (q.mode === 'return' ? '.returnArrive' : '.arrive'), gen);
      if (r) return r;
      r = await this.meet(q.id, gen, { returning: q.mode === 'return' });
      if (r) return r;
    }
    return null;
  };

  /** Fallback outcomes from TALE.config.outcomes[truth][action], so a person only scripts what's special. */
  Game.prototype.defaultOutcome = function (v, action) {
    var table = cfg().outcomes || {};
    var t = table[v.truth] || table[cfg().defaultTruth] || {};
    var o = t[action];
    if (typeof o === 'function') o = o(v, this);
    if (Array.isArray(o)) o = { steps: o };
    return o || { steps: [] };
  };

  E.Game = Game;
})();
