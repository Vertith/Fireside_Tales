/*
 * Emit Time — script engine.
 *
 * Runs the scene scripts in js/content/*.js. Scenes are plain arrays of steps
 * (see README.md for the full step list). The engine owns the loop: any
 * `reset` step sends the player back to the first flash, while the memory
 * that carries across loops (heard lines, notebook, knowledge flags) is kept
 * in `persist` and saved to localStorage when the browser allows it.
 */
(function () {
  'use strict';
  var E = (window.EMIT = window.EMIT || {});
  E.content = E.content || {};
  E.content.scenes = E.content.scenes || {};
  E.content.visitors = E.content.visitors || {};
  E.content.characters = E.content.characters || {};

  var STORE_KEY = 'emit-time.save.v1';
  var CANCEL = { cancelled: true };
  var ACTIONS = ['letThrough', 'turnAway', 'shoot', 'shutdown'];
  // the three questions every visitor can be asked; a visitor answers them in `opening`
  var OPENERS = [
    { id: 'name', ask: 'What\'s your name?' },
    { id: 'want', ask: 'What can I do for you?' },
    { id: 'how', ask: 'How did you get here?' }
  ];
  var STAMPS = { letThrough: 'Let through', turnAway: 'Turn away', shoot: 'Drawer', shutdown: 'Device' };
  var ACTION_LABELS = {
    letThrough: 'Let through',
    turnAway: 'Turn away',
    shoot: 'Shoot',
    shutdown: 'Shutdown device'
  };

  function freshMemory() {
    return {
      loop: 1,         // which pass through the night this is
      heard: {},       // line key -> loop it was first heard in
      asked: {},       // "visitor.question" -> loop first asked
      knows: {},       // knowledge flags that survive resets -> loop learned
      notebook: [],    // { id, who, text, loop }
      endings: {}      // ending id -> loop first reached
    };
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
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
    try { localStorage.setItem(STORE_KEY, JSON.stringify(this.memory)); } catch (e) { /* storage unavailable */ }
  };

  Game.prototype.wipe = function () {
    this.memory = freshMemory();
    try { localStorage.removeItem(STORE_KEY); } catch (e) { /* ignore */ }
    this.hasSave = false;
  };

  /* ---------- conditions ----------
   * "heardBriefing"      knowledge carried across loops
   * "run:hasList"        something true only in this loop
   * "!x"                 negation of either
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
      : cond.indexOf('run:') === 0
      ? !!this.run.flags[cond.slice(4)]
      : cond.indexOf('now:') === 0
      ? !!this.memory.knows[cond.slice(4)]
      // a plain flag is memory: something learned on an earlier pass through the night
      : !!this.memory.knows[cond] && this.memory.knows[cond] < this.memory.loop;
    return neg ? !val : val;
  };

  Game.prototype.check = function (gen) {
    if (gen !== this.gen) throw CANCEL;
  };

  /* ---------- the main loop ---------- */
  Game.prototype.start = function (sceneId) {
    var self = this;
    var gen = ++this.gen;
    this.newRun();
    var scene = sceneId || 'opening';

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
            scene = 'opening';
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
    this.start('opening');
  };

  Game.prototype.stats = function () {
    var m = this.memory;
    return {
      loop: m.loop,
      notes: m.notebook.length,
      knows: Object.keys(m.knows).length,
      endings: m.endings
    };
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
    if (step.lightning) { if (!fast) await ui.lightning(step.lightning); return null; }
    if (step.sfx) { if (!fast) E.audio && E.audio.play(step.sfx); return null; }
    if (step.pause) { if (!fast) await ui.wait(step.pause); return null; }
    // a new slot on the clock means a new arrival: a Skip pressed for the last visitor stops here,
    // so the next one's arrival and greeting play (with their own Skip if heard before)
    if (step.clock) { ui.clock(step.clock); this.skipping = false; return null; }
    if (step.crt) { ui.crt(step.crt); return null; }
    if (step.backdrop) {
      if (step.backdrop === 'body') this.run.flags.mess = true; else delete this.run.flags.mess;
      var gone = E.content.visitors[this.run.gone || this.run.present] || {};
      ui.backdrop(step.backdrop, gone.machine || gone.truth === 'android' ? 'coolant' : 'blood');
      return null;
    }
    if (step.enter) { this.run.present = step.enter; this.run.heading = null; this.run.shooting = false; await ui.enter(step.enter, fast, step.from); return null; }
    if (step.exit) {
      this.run.gone = this.run.present; this.run.present = null;
      await ui.exit(step.exit, fast, this.exitSide(step.exit));
      // whoever is shot and goes down leaves blood, or coolant and sparking parts if they were a machine
      if (step.exit === 'fall' && this.run.shooting) return this.exec({ backdrop: 'body' }, ctx, gen);
      return null;
    }
    if (step.note) { this.note(step.note[0], step.note[1]); return null; }
    if (step.learn) { this.learn(step.learn); return null; }
    if (step.set) { this.run.flags[step.set] = true; ui.refresh(this); return null; }
    if ('if' in step) {
      var branch = this.test(step['if']) ? step.then : step['else'];
      return branch ? this.runSteps(branch, ctx, gen) : null;
    }
    if (step.ask) { this.skipping = false; return this.ask(step.ask, ctx, gen); }
    if (step.desk) { this.skipping = false; return this.desk(step.desk, gen); }
    if (step.returns) return this.returns(gen);
    if (step.comeBack) { this.comeBack(step.comeBack, 'new'); return null; }
    if (step.radio) { if (E.radio) { if (step.radio === 'off') E.radio.off(); else if (step.radio === 'calm') {
      // turn the dial on to the next music station, never landing on static, news or Morse
      var st = E.radio.stations, at = E.radio.state().index;
      for (var k = 1; k <= st.length; k++) {
        var j = (at + k) % st.length;
        if (['jazz', 'bigband', 'blues'].indexOf(st[j].id) >= 0) { E.radio.tune(j); break; }
      }
    } else if (!E.radio.isOn()) E.radio.on(); } return null; }
    if (step.show) { await ui.show(step.show); return null; }
    if ('actNo' in step) { this.run.actNo = step.actNo; return null; }
    if (step.act) { if (!fast) await ui.actCard(step.act, step.title || ''); return null; }
    if (step.goto) return { goto: step.goto };
    if (step.reset) return { reset: step.reset };
    if (step.end) return { end: step.end };
    if (step.run) return this.runSteps(E.content.scenes[step.run], step.run, gen);
    console.warn('Unknown step', step);
    return null;
  };

  /** One line of dialog or narration. Lines heard in an earlier loop can be skipped. */
  Game.prototype.line = async function (who, text, ctx, gen, step) {
    // the key is taken before {loops} is filled in, so a line that counts loops is still "heard before"
    var key = (step.key || ctx) + ':' + hash((who || '') + '|' + text);
    text = text.replace('{loops}', String(this.memory.loop - 1)).replace('{loop}', String(this.memory.loop));
    var first = this.memory.heard[key];
    var heardBefore = !!first && first < this.memory.loop && !step.noSkip;
    if (!first) { this.memory.heard[key] = this.memory.loop; this.save(); }

    // Skip runs straight on to the next decision (a question pad or the desk),
    // so nobody has to click Next again on the way there
    if (this.skipping) {
      // keep the box showing where we are, so the next choice has context
      this.ui.setLine(who, text, (who ? 'speech' : 'narration') + ' done');
      return null;
    }

    var res = await this.ui.showLine({ who: who, text: text, heardBefore: heardBefore });
    this.check(gen);
    if (res === 'skip') this.skipping = true;
    return null;
  };

  Game.prototype.learn = function (flag) {
    if (!this.memory.knows[flag]) { this.memory.knows[flag] = this.memory.loop; this.save(); }
  };

  /**
   * The player looked at something: an inspection spot ('scientist.watch') or a
   * desk prop ('desk.list'). It counts for this loop and is remembered after.
   */
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
        // `stay` options can be picked again and again without ending the choice
        return self.test(o.requires) && (o.exit || o.stay || !chosen[i]);
      });
      var pick = await this.ui.choices({
        prompt: spec.prompt,
        options: opts.map(function (o) {
          var k = ctx + '.ask.' + o._i;
          return {
            text: o.text,
            heard: !!self.memory.asked[k] && self.memory.asked[k] < self.memory.loop,
            memory: !!o.requires && !o.requires.toString().match(/^(!|run:)/),
            exit: !!o.exit,
            // an option with an action is a desk decision: it shows as a stamp, not a line to say
            action: o.action || null,
            stamp: o.action ? (o.stamp || STAMPS[o.action]) : null,
            label: o.action ? (o.label || ACTION_LABELS[o.action]) : null
          };
        })
      });
      this.check(gen);
      var opt = opts[pick];
      chosen[opt._i] = true;
      if (opt.action) {
        this.ui.setTranscript('', '');
        this.run.heading = opt.heading || (opt.action === 'letThrough' ? 'in' : 'out');
        this.run.shooting = opt.action === 'shoot';
      }
      var askKey = ctx + '.ask.' + opt._i;
      if (!this.memory.asked[askKey]) { this.memory.asked[askKey] = this.memory.loop; this.save(); }
      var r = await this.runSteps(opt.steps || [], askKey, gen);
      if (r) return r;
      if (opt.exit) return null;
    }
  };

  /* ---------- the desk: questioning a visitor and deciding ---------- */
  Game.prototype.desk = async function (id, gen, opts) {
    opts = opts || {};
    var v = E.content.visitors[id];
    if (!v) throw new Error('Unknown visitor: ' + id);
    var self = this;
    if (this.run.present !== id && v.portrait !== false) {
      this.run.present = id;
      await this.ui.enter(id, false);
    }
    var greet = opts.returning
      ? (v.returnGreeting || [{ who: id, say: 'Me again. And this can\'t wait. I need to get upstairs, now.' }])
      : v.greeting;
    if (greet) {
      var g = await this.runSteps(greet, id + (opts.returning ? '.return' : '.greeting'), gen);
      if (g) return g;
    }

    // Adam's rule: everyone gets the same three openers; anything more is unlocked
    // by inspecting something ('saw:spot') or by memory from an earlier loop.
    var all = OPENERS.filter(function (o) { return v.opening && v.opening[o.id]; })
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

      var actions = ACTIONS.filter(function (a) {
        return !(v.actions && v.actions[a] === false);
      }).map(function (a) {
        var spec = (v.actions && v.actions[a]) || {};
        var locked = a === 'shutdown' && !self.run.flags.hasDevice;
        if (a === 'shutdown' && self.run.flags['deviceTried:' + id]) return null;
        return {
          id: a,
          label: spec.label || ACTION_LABELS[a],
          stamp: spec.stamp || STAMPS[a],
          locked: locked,
          hint: locked ? 'Not issued yet' : spec.hint || ''
        };
      }).filter(Boolean);

      var pick = await this.ui.desk({ id: id, visitor: v, questions: questions, actions: actions, prompt: v.prompt });
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

      // the decision is made: clear the last thing they said off the bubble
      this.ui.setTranscript('', '');
      // which way they walk off: let through means into the building (right), anything else back out the doors (left)
      this.run.heading = pick.id === 'letThrough' ? 'in' : 'out';
      this.run.shooting = pick.id === 'shoot';
      var outcome = (v.actions && v.actions[pick.id]) || this.defaultOutcome(v, pick.id);
      if (opts.returning && pick.id === 'turnAway' && v.truth === 'legit') {
        // turning a legit guest away twice: the meeting they needed never happens
        outcome = v.secondTurnAway || { steps: [
          { narrate: 'I sent them away a second time. They didn\'t argue. They just looked at the clock over my head and left.' },
          { exit: 'walk' },
          { pause: 600 },
          { narrate: 'Whatever was supposed to happen upstairs because of them didn\'t. The light came anyway.' },
          { reset: 'You turned away ' + this.name(id) + ' twice.' }
        ] };
      }
      var out = await this.runSteps(outcome.steps || [], id + '.' + pick.id + (opts.returning ? '.return' : ''), gen);
      if (out) return out;
      // the device on a person does nothing; the conversation goes on, a little colder
      if (pick.id === 'shutdown' && v.truth !== 'android' && !(outcome && outcome.ends)) {
        this.run.flags['deviceTried:' + id] = true;
        continue;
      }
      if (pick.id === 'turnAway' && !opts.returning) {
        if (v.comesBackAs) this.comeBack(v.comesBackAs, 'new');
        else if (v.truth === 'legit' && v.returns !== false) this.comeBack(id, 'return');
      }
      return null;
    }
  };

  /** Walk-offs: {exit:'left'|'right'} is explicit; otherwise turned away goes left, let in (or no decision) goes right. */
  Game.prototype.exitSide = function (kind) {
    if (kind === 'left' || kind === 'right') return kind;
    return this.run.heading === 'out' ? 'left' : 'right';
  };

  Game.prototype.name = function (id) {
    var c = E.content.characters[id];
    return (c && c.name) || id;
  };

  /** A turned-away visitor comes back a few visitors later (bible section 4). */
  Game.prototype.comeBack = function (id, mode) {
    this.run.queue.push({ id: id, mode: mode, due: this.run.slot + (mode === 'return' ? 3 : 4) });
  };

  /** Between slots: count one more visitor done, then bring in anyone due back. */
  Game.prototype.returns = async function (gen) {
    this.run.slot += 1;
    var due = this.run.queue.filter(function (q) { return q.due <= this.run.slot; }, this);
    this.run.queue = this.run.queue.filter(function (q) { return q.due > this.run.slot; }, this);
    for (var i = 0; i < due.length; i++) {
      var q = due[i], v = E.content.visitors[q.id];
      if (!v) continue;
      this.skipping = false;   // a returning visitor is a new arrival too
      var arrive = q.mode === 'return'
        ? (v.returnArrive || [{ sfx: 'door' }, { narrate: this.name(q.id) + ' was back, wetter than before and in no mood to wait.' }])
        : (v.arrive || [{ sfx: 'door' }]);
      var r = await this.runSteps(arrive, q.id + (q.mode === 'return' ? '.returnArrive' : '.arrive'), gen);
      if (r) return r;
      r = await this.desk(q.id, gen, { returning: q.mode === 'return' });
      if (r) return r;
      if (this.run.present) { this.run.present = null; await this.ui.exit('walk', this.skipping, this.exitSide('walk')); }
    }
    return null;
  };

  /**
   * Fallback outcomes from the bible's action rules table, so a new visitor
   * only needs to script the actions that are special for them.
   * truth: 'legit' | 'intruder' | 'android'
   */
  Game.prototype.defaultOutcome = function (v, action) {
    var t = v.truth || 'legit';
    var name = v.id;
    var leave = { exit: 'walk' };
    var table = {
      legit: {
        letThrough: [{ narrate: 'I waved them on. The stairwell door sighed shut behind them.' }, leave],
        turnAway: [{ narrate: 'I sent them back out into the rain. They did not go quietly.' }, { set: 'turnedAway:' + name }, leave],
        shoot: [{ sfx: 'gunshot' }, { exit: 'fall' }, { narrate: 'They were on the list. They had been on the list the whole time.' }, { reset: 'You shot a legitimate visitor.' }],
        shutdown: [{ narrate: 'I pointed the device at them. Nothing happened, except that now they were watching me.' }, { set: 'suspicious:' + name }]
      },
      intruder: {
        letThrough: [{ narrate: 'I waved them on. Somewhere upstairs, the night went wrong.' }, { reset: 'You let an intruder through.' }],
        turnAway: [{ narrate: 'I sent them back out into the rain. Something told me I hadn\'t seen the last of them.' }, { set: 'turnedAway:' + name }, leave],
        shoot: [{ sfx: 'gunshot' }, { exit: 'fall' }, { backdrop: 'body' }],
        shutdown: [{ narrate: 'I pointed the device at them. Nothing happened, and they knew exactly what I had tried.' }, { set: 'suspicious:' + name }]
      },
      android: {
        letThrough: [{ narrate: 'I waved them on. The footsteps on the stairs were a little too even.' }, { reset: 'You let an android through.' }],
        turnAway: [{ narrate: 'I sent them back out into the rain. They did not get wet.' }, { set: 'turnedAway:' + name }, leave],
        shoot: [{ sfx: 'gunshot' }, { narrate: 'The bullet did something. Not enough.' }, { reset: 'Bullets do not stop androids.' }],
        shutdown: [{ sfx: 'shutdown' }, { exit: 'fall' }, { narrate: 'The device clicked. They stopped mid-word, like a tape someone had paused.' }]
      }
    };
    return { steps: (table[t] || table.legit)[action] };
  };

  E.Game = Game;
  E.ACTION_LABELS = ACTION_LABELS;
})();
