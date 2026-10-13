/*
 * Emit Time — the desk radio. Six stations, all synthesised with Web Audio,
 * so there are no audio files and nothing to license.
 *
 *   EMIT.radio.on() / off() / toggle()   power (call from a click: browsers
 *                                         only start audio after a gesture)
 *   EMIT.radio.next() / prev() / tune(i) change station (a burst of static
 *                                         plays between stations)
 *   EMIT.radio.current()                 the station object { id, band, freq, name, blurb }
 *   EMIT.radio.setVolume(0..1)
 *   EMIT.radio.onChange(fn)              fn(state) on power or station change
 *   EMIT.radio.widget(el)                optional ready-made dial (styles in css/radio.css)
 *
 * Stations keep running in step with a shared clock, so tuning away and back
 * lands mid-song, like a real radio. If EMIT.audio exists, the radio follows
 * its mute switch.
 */
(function () {
  'use strict';
  var E = (window.EMIT = window.EMIT || {});

  var ctx = null, live = null;          // ctx is swapped for offline renders
  var bus, out, hiss, hissGain;
  var epoch = 0, power = false, volume = 0.55, cur = 0, inst = null, timer = null;
  var listeners = [];
  var NOISE = null;

  // ---------- small helpers ----------

  function mtof(m) { return 440 * Math.pow(2, (m - 69) / 12); }

  // Deterministic random in [0,1) for (step, salt): the same step always plays
  // the same thing, which is what lets stations continue in step.
  function rnd(a, b) {
    var h = Math.imul((a | 0) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(((b | 0) + 0x632be5ab) | 0, 0xc2b2ae35);
    h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d);
    h ^= h >>> 12; h = Math.imul(h, 0x297a2d39);
    h ^= h >>> 15;
    return (h >>> 0) / 4294967296;
  }

  function scale(root, steps, lo, hi) {
    var out = [];
    for (var m = lo; m <= hi; m++) if (steps.indexOf(((m - root) % 12 + 12) % 12) >= 0) out.push(m);
    return out;
  }

  function nearest(list, m) {
    var best = list[0];
    for (var k = 1; k < list.length; k++) if (Math.abs(list[k] - m) < Math.abs(best - m)) best = list[k];
    return best;
  }

  function noiseBuf() {
    if (NOISE && NOISE.sampleRate === ctx.sampleRate) return NOISE;
    var len = Math.floor(ctx.sampleRate * 2), b = ctx.createBuffer(1, len, ctx.sampleRate), d = b.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return (NOISE = b);
  }

  function filter(type, freq, q, gain) {
    var f = ctx.createBiquadFilter();
    f.type = type; f.frequency.value = freq;
    if (q != null) f.Q.value = q;
    if (gain != null) f.gain.value = gain;
    return f;
  }

  function chain() {
    for (var i = 0; i < arguments.length - 1; i++) arguments[i].connect(arguments[i + 1]);
    return arguments[0];
  }

  /*
   * One synth note. o: { t, f, len, dest, wave, gain, attack, release,
   * pluck (decay over len instead of holding), lp, lpTo, q, vib, vibRate,
   * glideFrom, glide, detune }
   */
  function note(o) {
    var t = o.t, len = o.len, peak = o.gain || 0.1;
    var s = ctx.createOscillator(); s.type = o.wave || 'sine';
    if (o.glideFrom) {
      s.frequency.setValueAtTime(o.glideFrom, t);
      s.frequency.exponentialRampToValueAtTime(o.f, t + (o.glide || 0.08));
    } else s.frequency.setValueAtTime(o.f, t);
    if (o.detune) s.detune.value = o.detune;
    var node = s, end;
    if (o.lp) {
      var f = filter('lowpass', o.lp, o.q || 0.7);
      f.frequency.setValueAtTime(o.lp, t);
      if (o.lpTo) f.frequency.exponentialRampToValueAtTime(o.lpTo, t + len);
      node.connect(f); node = f;
    }
    var g = ctx.createGain(); node.connect(g); g.connect(o.dest);
    var a = o.attack || 0.005;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    if (o.pluck) {
      g.gain.exponentialRampToValueAtTime(0.0001, t + len);
      end = t + len;
    } else {
      var r = o.release || 0.06;
      g.gain.setValueAtTime(peak, t + Math.max(a, len - r));
      g.gain.exponentialRampToValueAtTime(0.0001, t + len);
      end = t + len;
    }
    s.start(t); s.stop(end + 0.02);
    if (o.vib) {
      var l = ctx.createOscillator(), lg = ctx.createGain();
      l.frequency.value = o.vibRate || 5; lg.gain.value = o.f * o.vib;
      l.connect(lg); lg.connect(s.frequency);
      l.start(t); l.stop(end + 0.02);
    }
  }

  // A burst of filtered noise: drums, crackle, consonants.
  function hit(o) {
    var t = o.t, len = o.len || 0.05;
    var src = ctx.createBufferSource(); src.buffer = noiseBuf();
    var f = filter(o.type || 'bandpass', o.freq || 2000, o.q || 1);
    var g = ctx.createGain();
    g.gain.setValueAtTime(o.gain || 0.1, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    chain(src, f, g, o.dest);
    src.start(t, Math.random() * 1.5); src.stop(t + len + 0.01);
  }

  function kick(t, dest, gain) {
    var s = ctx.createOscillator(), g = ctx.createGain();
    s.frequency.setValueAtTime(150, t); s.frequency.exponentialRampToValueAtTime(50, t + 0.12);
    g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    chain(s, g, dest); s.start(t); s.stop(t + 0.25);
  }

  // Leads: a smooth seeded contour picks the pitch, so melodies wander
  // instead of jumping at random, yet any step can be computed on its own.
  function contour(i, seed) {
    return 3.4 * Math.sin(i * 0.41 + seed) + 2.2 * Math.sin(i * 0.17 + seed * 1.7) + 1.1 * Math.sin(i * 1.13 + seed * 0.3);
  }

  function holdSteps(i, salt, density, max) {
    for (var j = 1; j < max; j++) if (rnd(i + j, salt) < density) return j;
    return max;
  }

  // ---------- the stations ----------

  // Chords for the jazz and big band stations: [root midi, intervals]
  var MAJ = [0, 4, 7, 12], DOM7 = [0, 4, 7, 10], MIN = [0, 3, 7, 12];
  function voicing(root, ints, lo, hi) {
    var pcs = ints.map(function (x) { return (root + x) % 12; });
    return scale(0, pcs, lo, hi).slice(0, 4);
  }
  function chordTones(root, ints, lo, hi) {
    return scale(0, ints.map(function (x) { return (root + x) % 12; }), lo, hi);
  }

  var STATIONS = [
    {
      id: 'jazz', band: 'FM', freq: '94.7', name: 'The Velvet Hour',
      blurb: 'Smooth jazz till sunrise',
      hiss: 0.012,
      stepDur: 60 / 76 / 2,                          // swung eighths at 76 bpm
      prog: [
        { bass: 48, keys: [52, 55, 59, 62] },        // Cmaj9
        { bass: 45, keys: [55, 59, 60, 64] },        // Am9
        { bass: 50, keys: [53, 57, 60, 64] },        // Dm9
        { bass: 43, keys: [53, 57, 59, 64] }         // G13
      ],
      lead: scale(0, [0, 2, 4, 7, 9], 62, 81),
      step: function (i, t, d) {
        var sd = this.stepDur, s = i % 8, bar = Math.floor(i / 8), ch = this.prog[bar % 4];
        var next = this.prog[(bar + 1) % 4];
        var tt = t + (s % 2 ? sd * 0.2 : 0);
        // Rhodes: a sine body with a little bell on top
        if (s === 0 || s === 3 || (s === 6 && rnd(bar, 3) < 0.4)) {
          var big = s === 0;
          ch.keys.forEach(function (m, k) {
            note({ t: tt + k * 0.006, f: mtof(m), len: big ? 1.8 : 0.9, gain: big ? 0.05 : 0.032, pluck: true, dest: d });
            note({ t: tt + k * 0.006, f: mtof(m) * 2, len: 0.35, gain: 0.01, wave: 'triangle', pluck: true, dest: d });
          });
        }
        // Bass: root, fifth, and a walk-up into the next bar
        var b = s === 0 ? ch.bass : s === 4 ? ch.bass + 7 : (s === 7 && rnd(bar, 5) < 0.6) ? next.bass - 1 : 0;
        if (b) note({ t: tt, f: mtof(b), len: s === 7 ? 0.3 : 0.7, gain: 0.16, wave: 'triangle', lp: 900, pluck: true, dest: d });
        // Brushes, rim on 2 and 4, a soft kick
        hit({ t: tt, len: 0.09, freq: 6500, q: 0.8, gain: s % 2 ? 0.02 : 0.035, dest: d });
        if (s === 2 || s === 6) hit({ t: tt, len: 0.035, freq: 1700, q: 4, gain: 0.12, dest: d });
        if (s === 0 || (s === 5 && rnd(bar, 7) < 0.5)) kick(tt, d, 0.18);
        // Soprano sax: two bars on, two bars off
        if (Math.floor(bar / 2) % 2 === 0 && rnd(i, 11) < 0.5 && !(s === 7 && bar % 2 === 1)) {
          var c = contour(i, Math.floor(bar / 4) * 1.9);
          var m = this.lead[Math.max(0, Math.min(this.lead.length - 1, Math.round(6 + c)))];
          var hold = holdSteps(i, 11, 0.5, 4);
          note({ t: tt, f: mtof(m), len: hold * sd * 0.95, gain: 0.055, wave: 'sawtooth', lp: 2000, q: 1.2,
            attack: 0.05, release: 0.08, vib: 0.006, vibRate: 5, glideFrom: rnd(i, 12) < 0.2 ? mtof(m - 1) : 0, dest: d });
        }
      }
    },

    {
      id: 'bigband', band: 'AM', freq: '660', name: 'Palais Ballroom 1926',
      blurb: 'Big band from the old wire',
      hiss: 0.03,
      stepDur: 60 / 192 / 2,                          // eighths at 192 bpm
      prog: [[48, MAJ], [45, DOM7], [50, DOM7], [43, DOM7], [48, MAJ], [48, DOM7], [41, MAJ], [43, DOM7]],
      setup: function (d) {
        // A narrow old-wireless band
        var hp = filter('highpass', 380, 0.7), lp = filter('lowpass', 2900, 0.9), pk = filter('peaking', 1300, 1, 4);
        chain(hp, lp, pk, d);
        return { out: hp };
      },
      step: function (i, t, d, st) {
        var sd = this.stepDur, s = i % 8, bar = Math.floor(i / 8), o = st.out;
        var c = this.prog[bar % 8], root = c[0], ints = c[1];
        var tt = t + (s % 2 ? sd * 0.16 : 0);
        // Tuba on 1 and 3
        if (s === 0 || s === 4) note({ t: tt, f: mtof(s === 0 ? root : root + 7 - (root + 7 > 52 ? 12 : 0)), len: 0.26, gain: 0.15, wave: 'sawtooth', lp: 650, pluck: true, dest: o });
        // Banjo chunks on every beat, heavier on 2 and 4
        if (s % 2 === 0) {
          voicing(root, ints, 55, 69).forEach(function (m, k) {
            note({ t: tt + k * 0.007, f: mtof(m), len: 0.16, gain: s % 4 ? 0.045 : 0.025, wave: 'sawtooth', lp: 3200, lpTo: 700, pluck: true, dest: o });
          });
        }
        // Snare brush on 2 and 4, a woodblock fill now and then
        if (s === 2 || s === 6) hit({ t: tt, len: 0.07, type: 'highpass', freq: 3500, gain: 0.08, dest: o });
        if (s === 7 && rnd(bar, 2) < 0.35) note({ t: tt, f: 1150, len: 0.06, gain: 0.08, pluck: true, dest: o });
        // Brass section stabs: on the downbeat every other bar, pushes on the and-of-4
        if ((s === 0 && bar % 2 === 0) || (s === 7 && rnd(bar, 4) < 0.4)) {
          var nx = s === 7 ? this.prog[(bar + 1) % 8] : c;
          voicing(nx[0], nx[1], 58, 72).slice(0, 3).forEach(function (m) {
            note({ t: tt, f: mtof(m), len: 0.22, gain: 0.035, wave: 'sawtooth', lp: 1900, attack: 0.02, release: 0.08, dest: o });
            note({ t: tt, f: mtof(m), len: 0.22, gain: 0.02, wave: 'sawtooth', lp: 1900, detune: 12, attack: 0.02, release: 0.08, dest: o });
          });
        }
        // Clarinet: chord tones on the beat, scale tones in between
        if (rnd(i, 21) < (bar % 4 === 3 ? 0.35 : 0.62)) {
          var target = 75 + contour(i, Math.floor(bar / 8) * 2.3) * 1.3;
          var pool = s % 2 ? scale(root, [0, 2, 4, 5, 7, 9, ints[3] === 10 ? 10 : 11], 66, 86) : chordTones(root, ints, 66, 86);
          var m = nearest(pool, target);
          var hold = holdSteps(i, 21, 0.62, 3);
          note({ t: tt, f: mtof(m), len: hold * sd * 0.9, gain: 0.05, wave: 'square', lp: 2600, attack: 0.02, release: 0.04, vib: 0.009, vibRate: 6.2, dest: o });
        }
        // Shellac crackle
        if (rnd(i, 30) < 0.25) hit({ t: t + rnd(i, 31) * sd, len: 0.004 + rnd(i, 32) * 0.01, type: 'highpass', freq: 1500, gain: 0.05 + rnd(i, 33) * 0.15, dest: d });
      }
    },

    {
      id: 'blues', band: 'FM', freq: '101.3', name: 'Delta After Dark',
      blurb: 'Slow blues, long night',
      hiss: 0.015,
      stepDur: 60 / 68 / 3,                           // 12/8 shuffle at 68 bpm
      form: [40, 45, 40, 40, 45, 45, 40, 40, 47, 45, 40, 47],   // E7 A7 E7 E7 | A7 A7 E7 E7 | B7 A7 E7 B7
      lead: scale(4, [0, 3, 5, 6, 7, 10], 62, 81),
      step: function (i, t, d) {
        var sd = this.stepDur, s = i % 12, beat = Math.floor(s / 3), sub = s % 3;
        var bar = Math.floor(i / 12), root = this.form[bar % 12];
        // Guitar boogie: long-short shuffle, root-fifth then root-sixth
        if (sub !== 1) {
          var top = root + (beat % 2 ? 9 : 7);
          [root, top].forEach(function (m, k) {
            note({ t: t + k * 0.004, f: mtof(m), len: sub === 0 ? 0.32 : 0.2, gain: 0.07, wave: 'sawtooth', lp: 1500, lpTo: 450, pluck: true, dest: d });
          });
        }
        // Drums
        if (sub === 0 && beat % 2 === 0) kick(t, d, 0.22);
        if (sub === 0 && beat % 2 === 1) {
          hit({ t: t, len: 0.14, freq: 1600, q: 0.9, gain: 0.13, dest: d });
          note({ t: t, f: 190, len: 0.08, gain: 0.07, wave: 'triangle', pluck: true, dest: d });
        }
        if (sub !== 1) hit({ t: t, len: 0.05, type: 'highpass', freq: 7000, gain: sub ? 0.03 : 0.05, dest: d });
        // Lead guitar answers in the first two bars of each line, with bends
        if (bar % 4 < 2 && rnd(i, 41) < 0.42) {
          var c = contour(i, Math.floor(bar / 12) * 3.1);
          var m = this.lead[Math.max(0, Math.min(this.lead.length - 1, Math.round(7 + c)))];
          var bend = rnd(i, 42) < 0.35;
          var hold = holdSteps(i, 41, 0.42, 5);
          note({ t: t, f: mtof(m), len: hold * sd * 0.95, gain: 0.06, wave: 'sawtooth', lp: 1900, q: 3, attack: 0.008,
            release: 0.12, vib: 0.008, vibRate: 5.5, glideFrom: bend ? mtof(m - (rnd(i, 43) < 0.5 ? 1 : 2)) : 0, glide: 0.12, dest: d });
        }
      }
    },

    {
      id: 'news', band: 'AM', freq: '1010', name: 'Night News Radio',
      blurb: 'News on the hour, every hour',
      hiss: 0.025,
      stepDur: 0.165,                                 // one syllable
      segLen: 130,                                    // ~21 s per story
      setup: function (d) {
        var hp = filter('highpass', 280, 0.7), lp = filter('lowpass', 3300, 0.7);
        chain(hp, lp, d);
        return { out: hp, segs: {} };
      },
      // A story is phrases of syllables separated by breaths; cached per story.
      plan: function (seg, st) {
        if (st.segs[seg]) return st.segs[seg];
        var p = [], k = 0, j = seg % 3 === 0 ? 10 : 2;
        for (var x = 0; x < j; x++) p.push(null);
        while (p.length < this.segLen - 6) {
          var n = 5 + Math.floor(rnd(seg * 97 + k, 51) * 11);
          for (var y = 0; y < n; y++) p.push({ pos: y, n: n, stress: rnd(seg * 97 + k * 13 + y, 52) < 0.3 });
          var gap = 2 + Math.floor(rnd(seg * 97 + k, 53) * 3);
          for (var z = 0; z < gap; z++) p.push(null);
          k++;
        }
        while (p.length < this.segLen) p.push(null);
        var keys = Object.keys(st.segs); if (keys.length > 4) delete st.segs[keys[0]];
        return (st.segs[seg] = p);
      },
      vowels: [[750, 1200], [500, 1850], [320, 2250], [520, 900], [350, 850], [650, 1650]],
      step: function (i, t, d, st) {
        var seg = Math.floor(i / this.segLen), L = i % this.segLen, o = st.out;
        // The news sting: three chimes at the top of every third story
        if (seg % 3 === 0 && L < 6 && L % 2 === 0) {
          var m = [79, 76, 72][L / 2];
          note({ t: t, f: mtof(m), len: 0.9, gain: 0.08, pluck: true, dest: o });
          note({ t: t, f: mtof(m) * 3, len: 0.3, gain: 0.015, pluck: true, dest: o });
        }
        var syl = this.plan(seg, st)[L];
        if (!syl) return;
        var male = seg % 2 === 0, base = male ? 112 : 185;
        var f0 = base * (1.12 - 0.22 * syl.pos / syl.n) * (syl.stress ? 1.12 : 1) * (1 + (rnd(i, 54) - 0.5) * 0.06);
        if (syl.pos === syl.n - 1 && rnd(i, 59) < 0.3) f0 *= 1.15;   // the odd rising question
        var len = this.stepDur * (0.75 + rnd(i, 55) * 0.3);
        var on = t;
        // Consonant: a hiss or a click before the vowel
        if (rnd(i, 56) < 0.65) {
          var cl = 0.025 + rnd(i, 57) * 0.04;
          hit({ t: t, len: cl, freq: 2500 + rnd(i, 58) * 3500, q: 1.5, gain: 0.05, dest: o });
          on = t + cl * 0.7;
        }
        var src = ctx.createOscillator(); src.type = 'sawtooth';
        src.frequency.setValueAtTime(f0, on);
        src.frequency.linearRampToValueAtTime(f0 * 0.93, on + len);
        var env = ctx.createGain();
        env.gain.setValueAtTime(0.0001, on);
        env.gain.exponentialRampToValueAtTime(syl.stress ? 0.6 : 0.42, on + 0.025);
        env.gain.setValueAtTime(syl.stress ? 0.6 : 0.42, on + len - 0.04);
        env.gain.exponentialRampToValueAtTime(0.0001, on + len);
        src.connect(env);
        var v1 = this.vowels[Math.floor(rnd(i, 60) * this.vowels.length)];
        var v2 = this.vowels[Math.floor(rnd(i, 61) * this.vowels.length)];
        [[0, 6, 1], [1, 9, 0.55]].forEach(function (fm) {
          var f = filter('bandpass', v1[fm[0]], fm[1]);
          f.frequency.setValueAtTime(v1[fm[0]], on);
          f.frequency.linearRampToValueAtTime(v2[fm[0]] * 0.5 + v1[fm[0]] * 0.5, on + len);
          var g = ctx.createGain(); g.gain.value = fm[2];
          chain(env, f, g, o);
        });
        var f3 = filter('bandpass', male ? 2500 : 2900, 10), g3 = ctx.createGain(); g3.gain.value = 0.25;
        chain(env, f3, g3, o);
        src.start(on); src.stop(on + len + 0.02);
      }
    },

    {
      id: 'static', band: '', freq: '- - -', name: 'Between stations',
      blurb: 'Nothing but the weather',
      hiss: 0,
      stepDur: 0.05,
      setup: function (d) {
        var st = { srcs: [] };
        var a = ctx.createBufferSource(); a.buffer = noiseBuf(); a.loop = true;
        var bp = filter('bandpass', 1500, 0.6), ga = ctx.createGain(); ga.gain.value = 0.17;
        var lfo = ctx.createOscillator(), lg = ctx.createGain();
        lfo.frequency.value = 0.11; lg.gain.value = 700; chain(lfo, lg); lg.connect(bp.frequency);
        chain(a, bp, ga, d);
        var b = ctx.createBufferSource(); b.buffer = noiseBuf(); b.loop = true; b.loopStart = 0.7;
        var lp = filter('lowpass', 380, 0.7), gb = ctx.createGain(); gb.gain.value = 0.12;
        var lfo2 = ctx.createOscillator(), lg2 = ctx.createGain();
        lfo2.frequency.value = 0.07; lg2.gain.value = 0.07; chain(lfo2, lg2); lg2.connect(gb.gain);
        chain(b, lp, gb, d);
        [a, b, lfo, lfo2].forEach(function (n) { n.start(); st.srcs.push(n); });
        return st;
      },
      teardown: function (st) { st.srcs.forEach(function (n) { try { n.stop(); } catch (e) { /* ignore */ } }); },
      step: function (i, t, d) {
        if (rnd(i, 71) < 0.18) hit({ t: t + rnd(i, 72) * 0.05, len: 0.003 + rnd(i, 73) * 0.02, type: 'highpass', freq: 900, gain: 0.05 + rnd(i, 74) * 0.18, dest: d });
        // A heterodyne whistle drifts through now and then
        if (i % 120 === 0 && rnd(i, 75) < 0.6) {
          var f = 700 + rnd(i, 76) * 900;
          note({ t: t, f: f * 1.6, glideFrom: f, glide: 3.5, len: 4, gain: 0.025, attack: 1.2, release: 1.5, dest: d });
        }
      }
    },

    {
      id: 'morse', band: 'SW', freq: '7.335', name: 'Shortwave',
      blurb: 'Someone keying a signal',
      hiss: 0.03,
      stepDur: 0.075,                                 // one Morse unit, ~16 wpm
      setup: function (d) {
        // Shortwave fade: the signal swells and sinks slowly
        var g = ctx.createGain(); g.gain.value = 0.8;
        var lfo = ctx.createOscillator(), lg = ctx.createGain();
        lfo.frequency.value = 0.09; lg.gain.value = 0.2; chain(lfo, lg); lg.connect(g.gain);
        lfo.start(); g.connect(d);
        return { out: g, lfo: lfo };
      },
      teardown: function (st) { try { st.lfo.stop(); } catch (e) { /* ignore */ } },
      step: function (i, t, d, st) {
        var pos = ((i % MORSE.units) + MORSE.units) % MORSE.units, len = MORSE.starts[pos];
        if (len) note({ t: t, f: 640, len: len * this.stepDur, gain: 0.13, attack: 0.006, release: 0.008, dest: st.out });
        if (rnd(i, 81) < 0.04) hit({ t: t, len: 0.01, type: 'highpass', freq: 1200, gain: 0.12, dest: d });
      }
    }
  ];

  // ---------- Morse ----------

  var CODE = {
    A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..', J: '.---',
    K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-',
    U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..'
  };

  // Standard timing: dot 1 unit, dash 3, 1 between elements, 3 between
  // letters, 7 between words, and a long pause before the message repeats.
  function buildMorse(text) {
    var starts = [], charAt = [], u = 0, code = [], at = 0;
    text.split(' ').forEach(function (word, w) {
      if (w) { u += 4; at++; }                       // 3 already added after the letter, +4 = 7
      word.split('').forEach(function (ch) {
        var c = CODE[ch]; code.push(c);
        c.split('').forEach(function (el) {
          var l = el === '-' ? 3 : 1;
          starts[u] = l;
          for (var x = 0; x < l + 1; x++) charAt[u + x] = at;
          u += l + 1;
        });
        at++;
        u += 2;                                      // 1 after the element, +2 = 3
      });
      code.push('/');
    });
    u += 18;                                         // breathe before repeating
    for (var k = 0; k < u; k++) { starts[k] = starts[k] || 0; if (charAt[k] == null) charAt[k] = -1; }
    return { text: text, code: code.slice(0, -1).join(' '), units: u, starts: starts, charAt: charAt };
  }
  var MORSE = buildMorse('PRISONER ESCAPED');

  // ---------- engine ----------

  function speaker(c) {
    var b = c.createGain();
    var hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 130;
    var lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 5200;
    var pk = c.createBiquadFilter(); pk.type = 'peaking'; pk.frequency.value = 1700; pk.gain.value = 2.5;
    var comp = c.createDynamicsCompressor(); comp.threshold.value = -20; comp.ratio.value = 4;
    var o = c.createGain(); o.gain.value = 0;
    b.connect(hp); hp.connect(lp); lp.connect(pk); pk.connect(comp); comp.connect(o); o.connect(c.destination);
    return { bus: b, out: o };
  }

  function boot() {
    if (live) { if (live.state === 'suspended') live.resume(); return true; }
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = live = new AC();
    var sp = speaker(ctx); bus = sp.bus; out = sp.out;
    hiss = ctx.createBufferSource(); hiss.buffer = noiseBuf(); hiss.loop = true;
    hissGain = ctx.createGain(); hissGain.gain.value = 0;
    chain(hiss, filter('highpass', 2500, 0.5), hissGain, bus);
    hiss.start();
    epoch = ctx.currentTime;
    return true;
  }

  function startStation(k, at) {
    var def = STATIONS[k], g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(1, at + 0.25);
    g.connect(bus);
    var st = (def.setup && def.setup(g)) || {};
    hissGain.gain.setTargetAtTime(def.hiss, at, 0.1);
    return { def: def, g: g, st: st, next: Math.ceil((at - epoch) / def.stepDur) };
  }

  function stopStation(s) {
    var t = ctx.currentTime;
    s.g.gain.cancelScheduledValues(t);
    s.g.gain.setValueAtTime(Math.max(0.0001, s.g.gain.value), t);
    s.g.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
    setTimeout(function () {
      if (s.def.teardown) s.def.teardown(s.st);
      s.g.disconnect();
    }, 600);
  }

  function schedule(s, until) {
    var d = s.def;
    while (epoch + s.next * d.stepDur < until) {
      d.step(s.next, epoch + s.next * d.stepDur, s.g, s.st);
      s.next++;
    }
  }

  function tick() {
    if (!inst) return;
    var hidden = typeof document !== 'undefined' && document.hidden;
    schedule(inst, ctx.currentTime + (hidden ? 1.5 : 0.3));
    var muted = !!(E.audio && E.audio.isMuted && E.audio.isMuted());
    var want = power && !muted ? volume : 0;
    if (Math.abs(out.gain.value - want) > 0.001) out.gain.setTargetAtTime(want, ctx.currentTime, 0.05);
  }

  // Sound of the dial moving between stations
  function sweep() {
    var t = ctx.currentTime;
    hit({ t: t, len: 0.35, freq: 1800, q: 0.5, gain: 0.35, dest: bus });
    note({ t: t, f: 2400, glideFrom: 500, glide: 0.3, len: 0.3, gain: 0.03, attack: 0.02, release: 0.1, dest: bus });
  }

  function emit() {
    var s = api.state();
    listeners.forEach(function (fn) { try { fn(s); } catch (e) { /* ignore */ } });
  }

  var api = {
    stations: STATIONS,
    morse: MORSE,
    on: function () {
      if (!boot()) return false;
      power = true;
      if (!inst) inst = startStation(cur, ctx.currentTime + 0.05);
      out.gain.setTargetAtTime(volume, ctx.currentTime, 0.08);
      if (!timer) timer = setInterval(tick, 40);
      tick(); emit();
      return true;
    },
    off: function () {
      power = false;
      if (inst) { stopStation(inst); inst = null; }
      if (out) out.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
      if (timer) { clearInterval(timer); timer = null; }
      emit();
    },
    toggle: function () { return power ? (this.off(), false) : this.on(); },
    isOn: function () { return power; },
    tune: function (k) {
      cur = ((k % STATIONS.length) + STATIONS.length) % STATIONS.length;
      if (power && ctx) {
        if (inst) stopStation(inst);
        sweep();
        inst = startStation(cur, ctx.currentTime + 0.22);
        tick();
      }
      emit();
      return STATIONS[cur];
    },
    next: function () { return this.tune(cur + 1); },
    prev: function () { return this.tune(cur - 1); },
    current: function () { return STATIONS[cur]; },
    index: function () { return cur; },
    setVolume: function (v) {
      volume = Math.max(0, Math.min(1, v));
      if (power && out) out.gain.setTargetAtTime(volume, ctx.currentTime, 0.05);
    },
    // Which letter of the Morse message is being keyed right now (-1 between repeats or when not tuned in)
    morseNow: function () {
      if (!power || !inst || inst.def.id !== 'morse') return -1;
      var u = Math.floor((ctx.currentTime - epoch) / inst.def.stepDur);
      return MORSE.charAt[((u % MORSE.units) + MORSE.units) % MORSE.units];
    },
    state: function () { return { on: power, index: cur, station: STATIONS[cur], volume: volume }; },
    onChange: function (fn) { listeners.push(fn); return function () { listeners = listeners.filter(function (f) { return f !== fn; }); }; },

    // Render a station into an AudioBuffer without touching the live radio.
    // Used for testing; also handy for exporting clips.
    renderOffline: function (k, seconds, rate) {
      var OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
      var saved = [ctx, bus, epoch, NOISE];
      var oc = new OAC(1, Math.ceil((rate || 44100) * seconds), rate || 44100);
      ctx = oc; NOISE = null; epoch = 0;
      var sp = speaker(oc); sp.out.gain.value = 1; bus = sp.bus;
      var def = STATIONS[k], g = oc.createGain(); g.connect(bus);
      var st = (def.setup && def.setup(g)) || {};
      if (def.hiss) {
        var h = oc.createBufferSource(); h.buffer = noiseBuf(); h.loop = true;
        var hg = oc.createGain(); hg.gain.value = def.hiss;
        chain(h, filter('highpass', 2500, 0.5), hg, bus); h.start();
      }
      for (var i = 0; i * def.stepDur < seconds; i++) def.step(i, i * def.stepDur, g, st);
      ctx = saved[0]; bus = saved[1]; epoch = saved[2]; NOISE = saved[3];
      return oc.startRendering();
    },

    // A ready-made dial. Click the window to tune, the knob for power.
    widget: function (el) {
      el.classList.add('radio');
      el.innerHTML =
        '<button type="button" class="radio-window" aria-label="Change station">' +
          '<span class="radio-scale" aria-hidden="true"><i class="radio-needle"></i></span>' +
          '<span class="radio-freq"></span><span class="radio-name"></span><span class="radio-blurb"></span>' +
        '</button>' +
        '<div class="radio-controls">' +
          '<button type="button" class="radio-prev" aria-label="Previous station">&#9664;</button>' +
          '<button type="button" class="radio-power" aria-pressed="false">Off</button>' +
          '<button type="button" class="radio-next" aria-label="Next station">&#9654;</button>' +
        '</div>';
      var q = function (c) { return el.querySelector(c); };
      var self = this;
      q('.radio-window').addEventListener('click', function () { if (!power) self.on(); else self.next(); });
      q('.radio-prev').addEventListener('click', function () { if (!power) self.on(); self.prev(); });
      q('.radio-next').addEventListener('click', function () { if (!power) self.on(); self.next(); });
      q('.radio-power').addEventListener('click', function () { self.toggle(); });
      function paint(s) {
        el.classList.toggle('is-on', s.on);
        el.dataset.station = s.station.id;
        q('.radio-freq').textContent = s.station.freq + (s.station.band ? ' ' + s.station.band : '');
        q('.radio-name').textContent = s.on ? s.station.name : 'Radio off';
        q('.radio-blurb').textContent = s.on ? s.station.blurb : 'Click to switch on';
        q('.radio-needle').style.left = (6 + 88 * s.index / (STATIONS.length - 1)) + '%';
        q('.radio-power').textContent = s.on ? 'On' : 'Off';
        q('.radio-power').setAttribute('aria-pressed', String(s.on));
      }
      this.onChange(paint); paint(this.state());
      return el;
    }
  };

  E.radio = api;
})();
