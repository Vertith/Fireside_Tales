/*
 * Upstairs: placeholder sound, synthesised with Web Audio so the story ships
 * with no audio files. Started from the Fireside template's audio.js. The act
 * card plays a little music-box tune, slightly out of tune, that never resolves.
 */
(function () {
  'use strict';
  var E = (window.TALE = window.TALE || {});
  var ctx = null, master = null, ambience = null;
  var muted = false;
  try { muted = localStorage.getItem('fireside.muted') === '1'; } catch (e) { /* ignore */ }

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
    // a death: something breathes in close, a low drone opens up, one music-box note goes badly flat
    taken: function () {
      burst({ freq: 900, type: 'bandpass', gain: 0.35, decay: 1.6, len: 1.8 });
      tone({ from: 55, to: 41, len: 3.2, gain: 0.35, wave: 'sawtooth', attack: 0.8 });
      tone({ from: 58, to: 43, len: 3.2, gain: 0.25, wave: 'sawtooth', attack: 0.9 });
      tone({ from: 1318, to: 1100, len: 2.4, gain: 0.08, delay: 1.1, attack: 0.01 });
      tone({ from: 2650, to: 2180, len: 0.9, gain: 0.02, delay: 1.1, wave: 'triangle', attack: 0.01 });
    },
    knock: function () {
      for (var i = 0; i < 3; i++) {
        tone({ from: 120, to: 60, len: 0.18, gain: 0.5, delay: i * 0.32 });
        burst({ freq: 700, gain: 0.35, decay: 0.12, len: 0.16, delay: i * 0.32 });
      }
    },
    static: function () { burst({ freq: 5000, type: 'highpass', gain: 0.18, decay: 1.4, len: 1.5 }); },
    click: function () { burst({ freq: 2500, type: 'bandpass', gain: 0.5, decay: 0.05, len: 0.08 }); },
    beep: function () { tone({ from: 941, to: 940, len: 0.14, gain: 0.08, wave: 'square' }); },
    creak: function () { tone({ from: 140, to: 95, len: 0.9, gain: 0.12, wave: 'sawtooth', attack: 0.3 }); },
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
    scratch: function () {
      burst({ freq: 3000, type: 'bandpass', gain: 0.3, decay: 0.25, len: 0.3 });
    }
  };

  /*
   * Act cards get a music box: a slow tune in a minor key, every note a
   * little flat, the last one held as if the box is winding down.
   * Returns a stop() function.
   */
  function musicBox() {
    var c = ac(); if (!c) return function () {};
    var bus = c.createGain(), t0 = c.currentTime + 0.1, live = [];
    bus.gain.value = 0.9; bus.connect(master);
    var A4 = 440, semis = [0, 3, 7, 12, 10, 7, 8, 7, 3, 5, 2, -2, 0];
    var lens = [1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 4];
    var t = t0, beat = 0.42 * 1.0;
    semis.forEach(function (s, i) {
      var f = A4 * Math.pow(2, s / 12) * (1 - 0.004 * i);   // drifting flat as it slows
      var o = c.createOscillator(), g = c.createGain();
      o.type = 'sine'; o.frequency.value = f * 2;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.09, t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
      o.connect(g); g.connect(bus); o.start(t); o.stop(t + 1.7); live.push(o);
      var o2 = c.createOscillator(), g2 = c.createGain();
      o2.type = 'triangle'; o2.frequency.value = f * 4.02;
      g2.gain.setValueAtTime(0.0001, t); g2.gain.exponentialRampToValueAtTime(0.02, t + 0.005);
      g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
      o2.connect(g2); g2.connect(bus); o2.start(t); o2.stop(t + 0.6); live.push(o2);
      t += lens[i] * beat * (1 + i * 0.03);
    });
    var stopped = false;
    return function stop() {
      if (stopped) return; stopped = true;
      var n = c.currentTime;
      bus.gain.cancelScheduledValues(n); bus.gain.setValueAtTime(bus.gain.value, n);
      bus.gain.exponentialRampToValueAtTime(0.0001, n + 0.9);
      setTimeout(function () {
        live.forEach(function (x) { try { x.stop(); } catch (e) { /* already stopped */ } });
        bus.disconnect();
      }, 1000);
    };
  }

  // The house at night, in place of the template's rain: a furnace hum under everything,
  // a clock ticking somewhere downstairs, and now and then the house settling.
  function brownBuffer(seconds) {
    var c = ac(), len = Math.floor(c.sampleRate * seconds);
    var buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0), last = 0;
    for (var i = 0; i < len; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3.5; }
    return buf;
  }
  var settles = [
    function () { tone({ from: 180 + Math.random() * 60, to: 110, len: 0.7 + Math.random() * 0.6, gain: 0.025, wave: 'sawtooth', attack: 0.25 }); },  // a floorboard
    function () { burst({ freq: 3200, type: 'bandpass', gain: 0.06, decay: 0.04, len: 0.06 }); burst({ freq: 2600, type: 'bandpass', gain: 0.04, decay: 0.04, len: 0.06, delay: 0.35 }); },  // the pipes ticking
    function () { burst({ freq: 140, type: 'lowpass', gain: 0.14, decay: 0.3, len: 0.4 }); },  // a soft thump in the walls
    function () { burst({ freq: 500, type: 'bandpass', gain: 0.035, decay: 2.2, len: 2.4 }); }  // wind leaning on the window
  ];
  function startAmbience() {
    var c = ac(); if (!c || ambience) return;
    var air = c.createBufferSource(); air.buffer = brownBuffer(4); air.loop = true;
    var f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 260;
    var g = c.createGain(); g.gain.value = 0.09;
    air.connect(f); f.connect(g); g.connect(master); air.start();
    var hum = c.createOscillator(); hum.frequency.value = 60;
    var hg = c.createGain(); hg.gain.value = 0.012;
    hum.connect(hg); hg.connect(master); hum.start();
    ambience = air;
    var beat = 0;
    (function tick() {
      if (!muted) {
        beat++;
        burst({ freq: beat % 2 ? 1900 : 1600, type: 'bandpass', gain: 0.025, decay: 0.03, len: 0.04 });   // the clock downstairs
        if (Math.random() < 0.04) settles[Math.floor(Math.random() * settles.length)]();
      }
      setTimeout(tick, 1000);
    })();
  }

  E.audio = {
    cues: cues,
    unlock: function () { if (ac()) startAmbience(); },
    play: function (name) { if (muted || !cues[name]) return; try { if (ac()) cues[name](); } catch (e) { /* ignore */ } },
    /** Start the act-card cue; returns a function that fades it out. */
    score: function () { if (muted) return function () {}; try { return musicBox(); } catch (e) { return function () {}; } },
    isMuted: function () { return muted; },
    toggle: function () {
      muted = !muted;
      try { localStorage.setItem('fireside.muted', muted ? '1' : '0'); } catch (e) { /* ignore */ }
      if (master) master.gain.value = muted ? 0 : 0.8;
      if (!muted) this.unlock();
      return muted;
    }
  };
})();
