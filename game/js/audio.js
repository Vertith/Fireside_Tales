/*
 * Emit Time — placeholder sound, synthesised with Web Audio so the game ships
 * with no audio files. Swap any cue by replacing EMIT.audio.cues[name].
 */
(function () {
  'use strict';
  var E = (window.EMIT = window.EMIT || {});
  var ctx = null, master = null, rain = null;
  var muted = false;
  try { muted = localStorage.getItem('emit-time.muted') === '1'; } catch (e) { /* ignore */ }

  function ac() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = muted ? 0 : 0.8;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function noiseBuffer(seconds) {
    var c = ac(), len = Math.floor(c.sampleRate * seconds);
    var buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  function burst(opts) {
    var c = ac(); if (!c) return;
    var t = c.currentTime + (opts.delay || 0);
    var src = c.createBufferSource(); src.buffer = noiseBuffer(opts.len || 0.6);
    var f = c.createBiquadFilter(); f.type = opts.type || 'lowpass'; f.frequency.value = opts.freq || 1200;
    var g = c.createGain();
    g.gain.setValueAtTime(opts.gain || 0.8, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + (opts.decay || 0.4));
    src.connect(f); f.connect(g); g.connect(master);
    src.start(t); src.stop(t + (opts.len || 0.6));
  }

  function tone(opts) {
    var c = ac(); if (!c) return;
    var t = c.currentTime + (opts.delay || 0);
    var o = c.createOscillator(); o.type = opts.wave || 'sine';
    o.frequency.setValueAtTime(opts.from, t);
    o.frequency.exponentialRampToValueAtTime(opts.to, t + opts.len);
    var g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(opts.gain || 0.3, t + (opts.attack || 0.05));
    g.gain.exponentialRampToValueAtTime(0.0001, t + opts.len);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + opts.len + 0.05);
  }

  var cues = {
    flash: function () {
      tone({ from: 220, to: 1760, len: 0.9, gain: 0.12, wave: 'sawtooth', attack: 0.6 });
      tone({ from: 70, to: 30, len: 1.6, gain: 0.5, delay: 0.85 });
      burst({ freq: 300, gain: 0.5, decay: 1.4, len: 1.6, delay: 0.85 });
    },
    gunshot: function () {
      burst({ freq: 4000, gain: 1, decay: 0.18, len: 0.3 });
      tone({ from: 150, to: 40, len: 0.25, gain: 0.7 });
      burst({ freq: 900, gain: 0.25, decay: 0.9, len: 1, delay: 0.05 });
    },
    door: function () {
      tone({ from: 880, to: 870, len: 0.5, gain: 0.08, wave: 'triangle' });
      tone({ from: 660, to: 655, len: 0.7, gain: 0.08, wave: 'triangle', delay: 0.18 });
    },
    distant: function () {
      for (var i = 0; i < 4; i++) burst({ freq: 500, gain: 0.25, decay: 0.3, len: 0.4, delay: i * 0.38 + Math.random() * 0.1 });
    },
    shutdown: function () {
      tone({ from: 900, to: 60, len: 0.7, gain: 0.25, wave: 'square' });
    },
    drawer: function () {
      burst({ freq: 700, gain: 0.35, decay: 0.35, len: 0.4 });
      tone({ from: 140, to: 90, len: 0.25, gain: 0.25, wave: 'triangle', delay: 0.3 });
    },
    scratch: function () {
      burst({ freq: 3000, type: 'bandpass', gain: 0.3, decay: 0.25, len: 0.3 });
    }
  };

  /*
   * Act cards get a short noir cue: a slow minor pad, a brushed snare, a walking
   * upright bass and a muted horn line that never quite resolves. It plays once,
   * then the pad holds low until the card is clicked and everything fades.
   * Returns a stop() function.
   */
  var NOTE = { A1: 55, D2: 73.42, E2: 82.41, F2: 87.31, G2: 98, A2: 110, Bb2: 116.54, D3: 146.83,
    A3: 220, Bb3: 233.08, Cs4: 277.18, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392 };
  function noirScore() {
    var c = ac(); if (!c) return function () {};
    var bus = c.createGain(), t0 = c.currentTime + 0.05, beat = 60 / 66, live = [];
    bus.gain.value = 0.9; bus.connect(master);
    function keep(n) { live.push(n); return n; }
    // pad: detuned saws through a dark filter, held for as long as the card is up
    var padF = c.createBiquadFilter(); padF.type = 'lowpass'; padF.frequency.value = 520; padF.Q.value = 0.7;
    var padG = c.createGain(); padG.gain.setValueAtTime(0.0001, t0); padG.gain.exponentialRampToValueAtTime(0.05, t0 + 2.2);
    padF.connect(padG); padG.connect(bus);
    [[NOTE.D2, -6], [NOTE.D2, 6], [NOTE.A2, -4], [NOTE.F2 * 2, 5]].forEach(function (n) {
      var o = keep(c.createOscillator()); o.type = 'sawtooth'; o.frequency.value = n[0]; o.detune.value = n[1];
      o.connect(padF); o.start(t0);
    });
    // brushes: soft swishes on every beat, a little louder on two and four
    for (var b = 0; b < 12; b++) {
      var bt = t0 + 1.2 + b * beat;
      var src = keep(c.createBufferSource()); src.buffer = noiseBuffer(0.5);
      var bf = c.createBiquadFilter(); bf.type = 'bandpass'; bf.frequency.value = 5200; bf.Q.value = 0.6;
      var bg = c.createGain(); bg.gain.setValueAtTime(0.0001, bt);
      bg.gain.exponentialRampToValueAtTime(b % 2 ? 0.035 : 0.018, bt + 0.06);
      bg.gain.exponentialRampToValueAtTime(0.0001, bt + 0.42);
      src.connect(bf); bf.connect(bg); bg.connect(bus); src.start(bt); src.stop(bt + 0.5);
    }
    // walking bass: plucked, round
    ['D2', 'A1', 'D2', 'F2', 'G2', 'F2', 'E2', 'A1', 'Bb2', 'A2', 'G2', 'A1'].forEach(function (nm, i) {
      var t = t0 + 1.2 + i * beat, o = keep(c.createOscillator()), g = c.createGain(), f = c.createBiquadFilter();
      o.type = 'triangle'; o.frequency.value = NOTE[nm]; f.type = 'lowpass'; f.frequency.value = 380;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.22, t + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t + beat * 0.9);
      o.connect(f); f.connect(g); g.connect(bus); o.start(t); o.stop(t + beat);
    });
    // muted horn: saw through a narrow filter with slow vibrato; ends on the tense note
    var line = [['A3', 0, 1], ['D4', 1, 0.5], ['F4', 1.5, 1.5], ['E4', 3, 0.5], ['D4', 3.5, 0.5], ['Cs4', 4, 2],
                ['D4', 6.5, 0.5], ['F4', 7, 0.5], ['E4', 7.5, 1], ['Bb3', 8.5, 1.2], ['A3', 9.7, 2.6]];
    line.forEach(function (n) {
      var t = t0 + 1.2 + n[1] * beat, len = n[2] * beat;
      var o = keep(c.createOscillator()), f = c.createBiquadFilter(), g = c.createGain();
      var lfo = keep(c.createOscillator()), lg = c.createGain();
      o.type = 'sawtooth'; o.frequency.value = NOTE[n[0]];
      lfo.frequency.value = 5; lg.gain.value = 0; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(4, t + len);
      lfo.connect(lg); lg.connect(o.detune);
      f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = 1.6;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.07, t + 0.09);
      g.gain.setValueAtTime(0.07, t + len * 0.7); g.gain.exponentialRampToValueAtTime(0.0001, t + len + 0.15);
      o.connect(f); f.connect(g); g.connect(bus);
      o.start(t); lfo.start(t); o.stop(t + len + 0.2); lfo.stop(t + len + 0.2);
    });
    var stopped = false;
    return function stop() {
      if (stopped) return; stopped = true;
      var t = c.currentTime;
      bus.gain.cancelScheduledValues(t); bus.gain.setValueAtTime(bus.gain.value, t);
      bus.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
      setTimeout(function () {
        live.forEach(function (n) { try { n.stop(); } catch (e) { /* already stopped */ } });
        bus.disconnect();
      }, 1000);
    };
  }

  function startRain() {
    var c = ac(); if (!c || rain) return;
    var src = c.createBufferSource(); src.buffer = noiseBuffer(3); src.loop = true;
    var f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1400; f.Q.value = 0.4;
    var g = c.createGain(); g.gain.value = 0.05;
    src.connect(f); f.connect(g); g.connect(master); src.start();
    rain = src;
  }

  E.audio = {
    cues: cues,
    unlock: function () { if (ac()) startRain(); },
    play: function (name) { if (muted || !cues[name]) return; try { if (ac()) cues[name](); } catch (e) { /* ignore */ } },
    /** Start the act-card cue; returns a function that fades it out. */
    score: function () { if (muted) return function () {}; try { return noirScore(); } catch (e) { return function () {}; } },
    isMuted: function () { return muted; },
    toggle: function () {
      muted = !muted;
      try { localStorage.setItem('emit-time.muted', muted ? '1' : '0'); } catch (e) { /* ignore */ }
      if (master) master.gain.value = muted ? 0 : 0.8;
      if (!muted) this.unlock();
      return muted;
    }
  };
})();
