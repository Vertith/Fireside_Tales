// ELDRITCH: engine for the full game. Reads content from data.js (window.ELDRITCH_DATA) and the
// behavior system from behaviors.js (window.ELDRITCH_BEHAVIORS).
(() => {
'use strict';

const D = window.ELDRITCH_DATA;
const B = window.ELDRITCH_BEHAVIORS;
const TUNE = B.tuning;
const CFG = D.config;
const W = 320, H = 180;
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
const reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------------------------------------------------------------- palette
const P = {
  void: '#0c0a12', wall0: '#17151f', wall1: '#211e2c', wall2: '#2c2838', wall3: '#3a3447',
  wood0: '#26150f', wood1: '#43281b', wood2: '#5f3b26', wood3: '#81563a',
  met0: '#1b1e22', met1: '#30363b', met2: '#4b5459', met3: '#748084', met4: '#a9b3b0',
  bei0: '#5a5142', bei1: '#857a62', bei2: '#ada186', bei3: '#d1c6a7',
  paper: '#ddd2b4', paper2: '#b2a78b', ink: '#2a2430',
  red0: '#3e1015', red1: '#82202a', red2: '#c3343a', red3: '#ff6b5a',
  amb0: '#4e2e14', amb1: '#a36126', amb2: '#eda94c', amb3: '#ffe0a0',
  yel: '#d4ad38', yel0: '#6f5617',
  skin: '#c99272', skin0: '#9a6a52', coat: '#d4d0c2', coat0: '#a29e90', shirt: '#9fb2c4',
};
const G = ['#071712', '#123629', '#2a6a50', '#62bb8d', '#b8efd0']; // security-feed greens

// ---------------------------------------------------------------- 3x5 pixel font
const FONT = {
  A: '.#. #.# ### #.# #.#',
  B: '##. #.# ##. #.# ##.',
  C: '.## #.. #.. #.. .##',
  D: '##. #.# #.# #.# ##.',
  E: '### #.. ##. #.. ###',
  F: '### #.. ##. #.. #..',
  G: '.## #.. #.# #.# .##',
  H: '#.# #.# ### #.# #.#',
  I: '### .#. .#. .#. ###',
  J: '..# ..# ..# #.# .#.',
  K: '#.# #.# ##. #.# #.#',
  L: '#.. #.. #.. #.. ###',
  M: '#.# ### ### #.# #.#',
  N: '##. #.# #.# #.# #.#',
  O: '.#. #.# #.# #.# .#.',
  P: '##. #.# ##. #.. #..',
  Q: '.#. #.# #.# ##. .##',
  R: '##. #.# ##. #.# #.#',
  S: '.## #.. .#. ..# ##.',
  T: '### .#. .#. .#. .#.',
  U: '#.# #.# #.# #.# ###',
  V: '#.# #.# #.# #.# .#.',
  W: '#.# #.# #.# ### #.#',
  X: '#.# #.# .#. #.# #.#',
  Y: '#.# #.# .#. .#. .#.',
  Z: '### ..# .#. #.. ###',
  '0': '### #.# #.# #.# ###',
  '1': '.#. ##. .#. .#. ###',
  '2': '##. ..# .#. #.. ###',
  '3': '##. ..# .#. ..# ##.',
  '4': '#.# #.# ### ..# ..#',
  '5': '### #.. ##. ..# ##.',
  '6': '.## #.. ### #.# ###',
  '7': '### ..# .#. .#. .#.',
  '8': '### #.# ### #.# ###',
  '9': '### #.# ### ..# ##.',
  '.': '... ... ... ... .#.',
  ':': '... .#. ... .#. ...',
  '-': '... ... ### ... ...',
  '!': '.#. .#. .#. ... .#.',
  '?': '##. ..# .#. ... .#.',
  '/': '..# ..# .#. #.. #..',
  "'": '.#. .#. ... ... ...',
  '%': '#.# ..# .#. #.. #.#',
  '+': '... .#. ### .#. ...',
  ',': '... ... ... .#. #..',
  '(': '.#. #.. #.. #.. .#.',
  ')': '.#. ..# ..# ..# .#.',
  '>': '#.. .#. ..# .#. #..',
  '<': '..# .#. #.. .#. ..#',
  '#': '#.# ### #.# ### #.#',
  '_': '... ... ... ... ###',
  '=': '... ### ... ### ...',
  ' ': '... ... ... ... ...',
  '°': '##. ##. ... ... ...',
};
for (const k in FONT) FONT[k] = FONT[k].replaceAll(' ', '');
function textW(s, k = 1) { let w = 0; for (const ch of String(s)) w += ch === '.' ? 2 : 4; return w * k - k; }
function text(c, s, x, y, col, k = 1) {
  s = String(s).toUpperCase();
  c.fillStyle = col;
  let cx = 0;
  for (let i = 0; i < s.length; i++) {
    // Periods are one pixel wide so E.L.D.R.I.T.C.H fits on small signs.
    if (s[i] === '.') { c.fillRect(x + cx * k, y + 4 * k, k, k); cx += 2; continue; }
    const g = FONT[s[i]] || FONT['?'];
    for (let r = 0; r < 5; r++) for (let q = 0; q < 3; q++)
      if (g[r * 3 + q] === '#') c.fillRect(x + (cx + q) * k, y + r * k, k, k);
    cx += 4;
  }
}
function textC(c, s, cx, y, col, k = 1) { text(c, s, Math.round(cx - textW(s, k) / 2), y, col, k); }

// ---------------------------------------------------------------- drawing helpers
function rect(c, x, y, w, h, col) { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); }
function disc(c, cx, cy, r, col) {
  c.fillStyle = col;
  for (let dy = -r; dy <= r; dy++) { const w = Math.round(Math.sqrt(r * r - dy * dy)); c.fillRect(cx - w, cy + dy, w * 2 + 1, 1); }
}
function ring(c, cx, cy, r, col) {
  c.fillStyle = col;
  const step = r > 8 ? 3 : 8;
  for (let a = 0; a < 360; a += step) c.fillRect(Math.round(cx + Math.cos(a * Math.PI / 180) * r), Math.round(cy + Math.sin(a * Math.PI / 180) * r), 1, 1);
}
function line(c, x0, y0, x1, y1, col) {
  c.fillStyle = col;
  x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
  const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let e = dx + dy;
  for (let n = 0; n < 600; n++) {
    c.fillRect(x0, y0, 1, 1);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * e;
    if (e2 >= dy) { e += dy; x0 += sx; }
    if (e2 <= dx) { e += dx; y0 += sy; }
  }
}
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => (v + 0.5) / 16);
function bayer(x, y) { return BAYER[(y & 3) * 4 + (x & 3)]; }
// Ordered-dither glow: crisp pixel gradients instead of smooth alpha.
function glow(c, cx, cy, rx, ry, col, strength) {
  c.fillStyle = col;
  for (let y = Math.max(0, cy - ry); y < Math.min(H, cy + ry); y++)
    for (let x = Math.max(0, cx - rx); x < Math.min(W, cx + rx); x++) {
      const d = Math.hypot((x - cx) / rx, (y - cy) / ry);
      if (d < 1 && bayer(x, y) < (1 - d) * strength) c.fillRect(x, y, 1, 1);
    }
}
function vignette(c, strength, keep = []) {
  c.fillStyle = P.void;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (keep.some(r => x >= r[0] && x < r[0] + r[2] && y >= r[1] && y < r[1] + r[3])) continue;
    const d = Math.hypot((x - W / 2) / (W * 0.62), (y - H / 2) / (H * 0.66));
    const v = Math.max(0, (d - 0.7) / 0.45);
    if (bayer(x, y) < v * strength) c.fillRect(x, y, 1, 1);
  }
}
let seed = 7;
// The orientation state. Declared early because the debug day jump at the end of the file runs
// engine code (drifts, terminal entry) before the orientation block.
let tut = null;
function srand() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
const rand = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.floor(Math.random() * a.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function layer(w = W, h = H) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; return x; }

// ---------------------------------------------------------------- audio
const Snd = {
  ac: null, master: null, muted: false,
  init() {
    if (this.ac) return;
    try {
      this.ac = new (window.AudioContext || window.webkitAudioContext)();
      this.master = this.ac.createGain(); this.master.gain.value = this.muted ? 0 : 0.5; this.master.connect(this.ac.destination);
      // Basement hum.
      [55, 110, 165].forEach((f, i) => {
        const o = this.ac.createOscillator(), g = this.ac.createGain();
        o.frequency.value = f; g.gain.value = [0.018, 0.008, 0.003][i];
        o.connect(g); g.connect(this.master); o.start();
      });
    } catch (e) { this.ac = null; }
  },
  setMuted(m) { this.muted = m; if (this.master) this.master.gain.value = m ? 0 : 0.5; },
  // The hum in Cell 4. It follows the subject's Fracture: silent under 20 (10 with the Audio Feed),
  // and at 80 it is in the office too.
  cellHum: null,
  hum() {
    if (!this.ac) return;
    if (!this.cellHum) {
      this.cellHum = this.ac.createGain(); this.cellHum.gain.value = 0; this.cellHum.connect(this.master);
      [[41.2, 0.5], [43.1, 0.35], [82.4, 0.25], [123.5, 0.08]].forEach(([f, v]) => {
        const o = this.ac.createOscillator(), g = this.ac.createGain();
        o.frequency.value = f; g.gain.value = v; o.connect(g); g.connect(this.cellHum); o.start();
      });
    }
    const fr = S.axes.fracture, thr = (S.upgrades.has('audio') ? 10 : 20) + (S.mods ? S.mods.humOffset : 0), onFeed = S.phase === 'desk' || (S.phase === 'ending' && S.patient.vesselEnd);
    let v = fr < thr ? 0 : Math.min(1, (fr - thr) / (80 - thr)) * 0.09;
    if (!onFeed && fr < 80) v = 0;
    v = Math.min(0.16, v + S.humBoost * 0.08 + (S.patient.vesselEnd ? 0.08 : 0));
    this.cellHum.gain.setTargetAtTime(v, this.ac.currentTime, 0.8);
  },
  tone(f, dur, type = 'square', vol = 0.06, f2 = null, delay = 0) {
    if (!this.ac) return;
    const t = this.ac.currentTime + delay, o = this.ac.createOscillator(), g = this.ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(this.master); o.start(t); o.stop(t + dur + 0.02);
  },
  noise(dur, vol = 0.08, freq = 1200, q = 0.8, delay = 0) {
    if (!this.ac) return;
    const t = this.ac.currentTime + delay, n = Math.floor(this.ac.sampleRate * dur);
    const b = this.ac.createBuffer(1, n, this.ac.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    const s = this.ac.createBufferSource(), f = this.ac.createBiquadFilter(), g = this.ac.createGain();
    s.buffer = b; f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(this.master); s.start(t);
  },
  play(name) {
    switch (name) {
      case 'click': this.tone(900, 0.04, 'square', 0.04); break;
      case 'switch': this.noise(0.05, 0.15, 3000, 2); this.tone(200, 0.05, 'square', 0.04); break;
      case 'deny': this.tone(140, 0.18, 'square', 0.05); break;
      case 'type': this.tone(260 + Math.random() * 60, 0.025, 'square', 0.015); break;
      case 'sound': this.tone(1760, 0.7, 'sine', 0.07); this.tone(1320, 0.7, 'sine', 0.04); break;
      case 'shock': this.tone(70, 0.5, 'sawtooth', 0.08, 50); this.noise(0.5, 0.12, 4000, 0.5); break;
      case 'water': this.noise(1.2, 0.14, 900, 0.4); break;
      case 'strobe': for (let i = 0; i < 4; i++) this.noise(0.03, 0.2, 5000, 3, i * 0.33); break;
      case 'cold': this.noise(2, 0.08, 300, 0.6); this.tone(120, 2, 'sine', 0.03, 80); break;
      case 'warn': this.tone(660, 0.12, 'sine', 0.06); this.tone(880, 0.16, 'sine', 0.06, null, 0.13); break;
      case 'credit': this.tone(1046, 0.08, 'square', 0.035); this.tone(1568, 0.12, 'square', 0.035, null, 0.07); break;
      case 'memo': this.noise(0.15, 0.08, 2500, 1); this.tone(520, 0.08, 'triangle', 0.05, null, 0.12); break;
      case 'bang': this.tone(90, 0.12, 'triangle', 0.08, 60); break;
      case 'buy': this.tone(523, 0.06, 'square', 0.04); this.tone(784, 0.1, 'square', 0.04, null, 0.06); break;
    }
  },
};

// ---------------------------------------------------------------- state
const STIM = Object.fromEntries(D.stimuli.map(s => [s.id, s]));
const RULE = Object.fromEntries(D.rules.map(r => [r.id, r]));
const CELL = D.patients[0].cell;
const SPOT = { bedSit: [17, 34], bedLie: [14, 32], door: [70, 31], wall: [28, 29], camera: [42, 62], center: [42, 46], pray: [42, 33],
  bedside: [17, 42], doorline: [60, 35], doorwall: [58, 27], undercot: [16, 39], behindcot: [9, 30], corner: [80, 29] };

// Behavior nodes and families. A family's base node is its tier-0 node (named after the family,
// except the Hollow families). Rules issued by Director memos join the rule table.
const NODE = Object.fromEntries(B.nodes.map(n => [n.id, n]));
const AXES = Object.keys(B.axes);
const BASE = {};
for (const n of B.nodes) if (!(n.family in BASE) || n.tier < NODE[BASE[n.family]].tier) BASE[n.family] = n.id;
const HOLLOW_FAMS = [...new Set(B.nodes.filter(n => n.hollow).map(n => n.family))];
const FAMILIES = Object.keys(BASE).filter(f => !HOLLOW_FAMS.includes(f));
const MEMO = {};
for (const n of B.nodes) if (n.memo) {
  MEMO[n.memo.id] = n.memo;
  if (!n.memo.rescind) RULE[n.memo.id] = { ...n.memo, memo: n.memo.text2, extra: true };
}
for (const m of B.terminals.hollow.memos) { MEMO[m.id] = m; RULE[m.id] = { weight: 1, duration: 4, ...m, memo: m.text2, extra: true }; }
const ALL_RULES = Object.values(RULE);
// The title-screen eye, pixel by pixel, in the order the mural is painted (outline, iris, pupil).
const EYE_PIX = (() => {
  const rows = ['.........#####.........', '.....####.....####.....', '...##....iiiii....##...', '.##.....iipppii.....##.',
    '#.......iipgpii.......#', '.##.....iipppii.....##.', '...##....iiiii....##...', '.....####.....####.....', '.........#####.........'];
  const out = [];
  for (const ch of ['#', 'i', 'p', 'g']) rows.forEach((r, y) => [...r].forEach((c, x) => { if (c === ch) out.push([x, y, c]); }));
  return out;
})();

const S = {
  phase: 'title', name: CFG.playerTitle + ' ' + CFG.defaultName, day: 1, speed: 1, time: 0, paused: false,
  credits: CFG.startCredits, owned: new Set(D.stimuli.filter(s => s.owned).map(s => s.id)),
  upgrades: new Set(), stimIndex: 0, armed: false, intensity: 1, cooldown: 0, warnCd: 0,
  traits: Object.fromEntries(D.traits.map(t => [t.id, 0])),
  stats: { caught: 0, warned: 0, missed: 0, falsePos: 0, earned: 0, maxInt: 0, feedback: 0, talks: 0, collapses: 0 },
  log: [], active: new Set(), counts: {}, memoQueue: [], violation: null,
  marks: [], puddles: [], fx: [], press: { admin: 0, warn: 0, arm: 0 }, shake: 0, flags: {},
  patient: null,
  // behavior system
  axes: Object.fromEntries(AXES.map(a => [a, B.axes[a].start])),
  fam: {}, famPath: {}, seen: {}, famSeen: {}, seenLine: {}, terminal: null, terminalDay: 0,
  nextMemos: [], hollowMemos: [], rescinded: new Set(), mural: 0, ring: 0, trayEye: null, frozenPace: 0,
  inst: null, lastInst: null, medicalUntil: 0, sedatedUntil: 0, endEarlyAt: 0, humBoost: 0, directiveN: 1,
  // cell damage: { walls, floor, bed, door, lens, pads } -> { day } while broken; a crew at work; door-rule misses
  damage: {}, repair: null, doorMissed: 0,
  // subjects: the active roster entry, its merged trait modifiers, the Intake Ledger and the cut technicians
  subject: null, mods: null, ledger: null, alumni: [], alumniN: 0, transfers: [], usedSubjects: [], served: [], lastTransferDay: -99, lastChange: null,
  // stations: the monitors installed on the desk (A is wired at the start), the one the console is
  // routed to, and the stored per-cell state of every occupied station (see useCell below)
  stations: ['A'], focus: 'A', cells: {},
};
ALL_RULES.forEach(r => S.counts[r.id] = { caught: 0, missed: 0 });
for (const f of Object.keys(BASE)) S.fam[f] = { node: BASE[f], since: 1, counts: { ignore: 0, warn: 0, mild: 0, harsh: 0, overkill: 0, punished: 0, repeat: 0, allowed: 0, any: 0, by: {} } };
window.ELDRITCH_STATE = S; // handy for debugging and for later phases

// ---------------------------------------------------------------- subjects
// The roster, hidden traits and the Intake Ledger (subjects.js). A trait is a bundle of modifiers
// on the behavior system; a subject's traits are merged into S.mods at intake.
const SUBJ = window.ELDRITCH_SUBJECTS;
const INTAKE = SUBJ.intake, ALUM = SUBJ.alumni;
const NODE_MEMOS = new Set(B.nodes.filter(n => n.memo && !n.memo.rescind).map(n => n.memo.id));
const MULT_FIELDS = ['gapMult', 'stressMult', 'proportionate', 'relapseMult', 'conspiracyMult', 'quietWeight'];
function mulInto(dst, src) { for (const k in src) dst[k] = (dst[k] ?? 1) * src[k]; }
function mergeMods(traitIds) {
  const m = { axisStart: {}, axisGain: {}, familyWeight: {}, transitionCount: { all: 1, fromAxis: {}, toAxis: {}, family: {}, toNode: {} },
    gapMult: 1, stressMult: 1, proportionate: 1, relapseMult: 1, conspiracyMult: 1, quietWeight: 1,
    terminalAt: {}, driftMin: {}, dayShift: {}, startNodes: {}, trustDecay: null, collapseFloor: null, medical: false, humOffset: 0, bubbles: {}, scheduled: {} };
  for (const id of traitIds || []) {
    const t = SUBJ.traits[id]; if (!t) continue;
    const x = t.mods || {};
    for (const a in x.axisStart || {}) m.axisStart[a] = (m.axisStart[a] || 0) + x.axisStart[a];
    mulInto(m.axisGain, x.axisGain || {}); mulInto(m.familyWeight, x.familyWeight || {});
    const tc = x.transitionCount || {};
    if (tc.all) m.transitionCount.all *= tc.all;
    for (const k of ['fromAxis', 'toAxis', 'family', 'toNode']) mulInto(m.transitionCount[k], tc[k] || {});
    for (const k of MULT_FIELDS) if (x[k] != null) m[k] *= x[k];
    for (const a in x.terminalAt || {}) if (!(a in m.terminalAt)) m.terminalAt[a] = x.terminalAt[a];
    for (const a in x.driftMin || {}) if (!(a in m.driftMin)) m.driftMin[a] = x.driftMin[a];
    for (const n in x.dayShift || {}) m.dayShift[n] = (m.dayShift[n] || 0) + x.dayShift[n];
    for (const f in x.startNodes || {}) if (!(f in m.startNodes)) m.startNodes[f] = x.startNodes[f];
    for (const n in x.scheduled || {}) if (!(n in m.scheduled)) m.scheduled[n] = x.scheduled[n];
    if (x.trustDecay != null && m.trustDecay == null) m.trustDecay = x.trustDecay;
    if (x.collapseFloor != null) m.collapseFloor = Math.min(m.collapseFloor ?? 100, x.collapseFloor);
    if (x.medical) m.medical = true;
    m.humOffset += x.humOffset || 0;
    for (const n in x.bubbles || {}) m.bubbles[n] = (m.bubbles[n] || []).concat(x.bubbles[n]);
  }
  return m;
}
function makeSubject(entry) { return JSON.parse(JSON.stringify({ ...entry, cell: CELL })); }
// One line of the final tally: the loaded cell's subject, as they stand right now.
function subjectRecord(fate, until = S.day) {
  const sub = S.subject, since = sub.since || 1;
  return { id: sub.id, name: sub.name || '', cell: sub.cell, since, until, days: Math.max(1, until - since + 1), state: stateNow().label, seen: Object.keys(S.seen).length, fate };
}
// Everyone the technician handled: subjects transferred out, then whoever is on a monitor now.
function servedAll(endingId) {
  const fateNow = { terminate: 'Left in the cell', brutalist: 'Protocol Zero', free: 'Left in the cell', vessel: 'Held', happy: 'Left in the cell', refused: 'Left in the cell', failed: 'Left in the cell' }[endingId] || 'Left in the cell';
  const rows = S.served.slice();
  const was = S.focus;
  eachCell(id => {
    let fate = fateNow;
    if (endingId === 'terminate' && id === was) fate = 'Terminated';
    if (endingId === 'free' && id === was) fate = 'Escaped';
    if (endingId === 'brutalist' && S.terminal === 'vessel') fate = 'Not available';
    rows.push(subjectRecord(fate));
  });
  return rows;
}
function servedTable(rows) {
  return `<table class="board served"><thead><tr><th>Subject</th><th>Cell</th><th>Days</th><th>Final state</th><th>Seen</th><th>Outcome</th></tr></thead><tbody>${rows.map(r =>
    `<tr><td>${esc(r.id)}${r.name ? ` <small>${esc(r.name)}</small>` : ''}</td><td>${esc(String(r.cell))}</td><td>${r.days}</td><td>${esc(r.state)}</td><td>${r.seen}</td><td>${esc(r.fate)}</td></tr>`).join('')}</tbody></table>`;
}
function sealedPhrases(e) { const t = e.traits || []; return t.slice(t.length - (e.sealed || 0)).flatMap(id => (SUBJ.traits[id] || {}).file || []); }
function prefSum(e) { return (e.traits || []).reduce((a, id) => a + ((SUBJ.traits[id] || {}).directorPref || 0), 0); }
function kinForms(k) {
  const they = (k && k.they) || 'they';
  return { they, them: { she: 'her', he: 'him', it: 'it' }[they] || 'them', their: { she: 'her', he: 'his', it: 'its' }[they] || 'their' };
}
function mod(k) { return S.mods ? S.mods[k] : null; }
function mult(k) { return S.mods ? S.mods[k] : 1; }
// Weight of a node when the subject picks what to do next: trait family weights, and quiet nodes for quiet subjects.
function nodeWeight(n) { return (n.weight || 1) * (mod('familyWeight') ? (S.mods.familyWeight[n.family] ?? 1) : 1) * (n.quiet ? mult('quietWeight') : 1); }
function nodeBubbles(n) { const extra = mod('bubbles') && S.mods.bubbles[n.id]; return extra ? (n.bubble || []).concat(extra) : (n.bubble || []); }
// Memo rules on the clipboard that a previous subject earned (TONGUE, EYE, STRIKE, TRAY), and
// which of them a candidate's traits tend to reach.
function memoRulesOnFile() { return [...S.active].filter(id => NODE_MEMOS.has(id) && !S.rescinded.has(id)); }
function affinityMatches(e) {
  const onFile = memoRulesOnFile(); if (!onFile.length) return [];
  const aff = new Set((e.traits || []).flatMap(id => (SUBJ.traits[id] || {}).memoAffinity || []));
  return aff.has('*') ? onFile : onFile.filter(r => aff.has(r));
}
// The transfer fee is charged only when the destination already holds a subject who has to be moved.
function ledgerPrice(slot, dest = destOf(slot)) {
  const e = slot.entry, pr = INTAKE.pricing;
  let cost = e.cost || 0;
  cost *= 1 - clamp(pr.directorDiscount * prefSum(e), pr.directorDiscountMin, pr.directorDiscountMax);
  cost *= 1 + INTAKE.inherited.markup * affinityMatches(e).length;
  if (slot.discount) cost *= 1 - slot.discount;
  let fee = dest && S.cells[dest] ? pr.transferFee : 0;
  if (fee && S.day - S.lastTransferDay <= pr.returnWindow) fee *= pr.returnPenalty;
  cost = Math.round(cost); fee = Math.round(fee);
  return { cost, fee, total: cost + fee, base: e.cost || 0 };
}
const INITIALS = 'ABCDEFGHJKLMNPRSTVW'.split('');
// A cut technician comes back on the ledger as a subject, built from the alumni template.
function buildAlumnus(a) {
  const surname = a.name.replace(/^Tech\. /, '');
  const t = ALUM.template, o = ALUM.overrides[surname] || {};
  const band = ALUM.driveTraits.find(b => a.drive <= b.max) || ALUM.driveTraits[ALUM.driveTraits.length - 1];
  const initial = pick(INITIALS);
  const sub = x => String(x).replaceAll('{surname}', surname).replaceAll('{initial}', initial).replaceAll('{day}', a.day).replaceAll('{flavor}', band.flavor);
  return { id: '0-' + (42 + S.alumniN++), name: sub(o.name || t.name), age: o.age || Math.round(rand(t.age[0], t.age[1])), intake: sub(t.intake), charge: t.charge,
    history: (o.history || t.history).map(sub), note: o.note || t.note, replies: (o.replies || t.replies).slice(),
    traits: (o.traits || band.traits).concat(['former_staff']), sealed: t.sealed, cost: ALUM.costBase, kin: o.kin || t.kin,
    director: INTAKE.director.alumnusSeen, sprite: t.sprite, alumnus: true, day: a.day, drive: a.drive };
}
// After a Failed ending the technician's own name and leanings are kept, and can come back next run.
const SELF_KEY = 'eldritch-alumni-self';
function storeSelf() { try { localStorage.setItem(SELF_KEY, JSON.stringify({ name: S.name, day: S.day, traits: S.traits })); } catch (e) {} }
function loadSelf() { try { return JSON.parse(localStorage.getItem(SELF_KEY) || 'null'); } catch (e) { return null; } }
function buildSelf(d) {
  const surname = String(d.name || '').replace(/^Technician /, '') || CFG.defaultName;
  const top2 = Object.entries(d.traits || {}).sort((a, b) => b[1] - a[1]).slice(0, 2).map(x => ALUM.self.traitMap[x[0]]).filter(Boolean);
  const t = ALUM.template;
  return { id: '0-' + (42 + S.alumniN++), name: surname + ', ' + pick(INITIALS) + '.', age: Math.round(rand(t.age[0], t.age[1])), intake: 'Previous cycle', charge: t.charge,
    history: ALUM.self.history.map(x => x.replaceAll('{day}', d.day)), note: t.note, replies: ALUM.self.replies.slice(), traits: [...new Set(top2.concat(['former_staff']))],
    sealed: 0, cost: ALUM.costBase, kin: ALUM.self.kin, director: ALUM.self.director, sprite: t.sprite, alumnus: true, self: true, day: S.day - ALUM.delay };
}
function ledgerPool() {
  const used = new Set(S.usedSubjects.concat([S.subject.id]));
  const dirOffer = S.day >= 7 && axisTop().axis === 'fracture' && S.axes.fracture >= 40;
  const civ = SUBJ.roster.filter(e => !e.starting && !used.has(e.id) && (!e.minDay || S.day >= e.minDay) && (!e.directorOnly || dirOffer));
  const alum = S.alumni.filter(a => !used.has(a.id) && S.day >= a.day + ALUM.delay).slice(-ALUM.maxInPool);
  return { civ, alum };
}
// The morning roll. The first slot holds over unless it is a paid re-roll of everything; alumni take
// a slot some of the time; the Director's preferences skew the rest.
function rollLedger(opts = {}) {
  if (S.day < INTAKE.unlockDay) return;
  if (ALUM.self.enabled && S.day >= ALUM.self.fromDay && !S.flags.selfRolled) {
    const d = loadSelf();
    if (d && d.name !== S.name && Math.random() < ALUM.self.chance) { S.flags.selfRolled = true; S.alumni.push(buildSelf(d)); }
  }
  const L = S.ledger || (S.ledger = { slots: [], rerolls: 0 });
  const { civ, alum } = ledgerPool();
  const cur = (L.slots || []).filter(x => x && !x.taken);
  const slots = [];
  if (INTAKE.holdOne && cur[0] && !opts.all) slots.push(cur[0]);
  const taken = new Set(slots.map(x => x.entry.id));
  while (slots.length < INTAKE.slots) {
    let e = null;
    const a = alum.filter(x => !taken.has(x.id)), c = civ.filter(x => !taken.has(x.id));
    if (a.length && (Math.random() < ALUM.chance || !c.length)) e = pick(a);
    else if (c.length) e = pickWeighted(c.map(x => ({ e: x, weight: Math.max(0.2, INTAKE.rollWeights.base + INTAKE.rollWeights.prefWeight * prefSum(x)) }))).e;
    if (!e) break;
    taken.add(e.id); slots.push({ entry: e, id: e.id });
  }
  L.slots = slots; L.day = S.day;
  if (!opts.reroll) L.rerolls = 0;
  if (!S.flags.ledgerOpened) { S.flags.ledgerOpened = true; toast(fmt(INTAKE.director.open)); }
  if (slots.some(x => x.entry.id === '0-41') && !S.flags.blankSeen) { S.flags.blankSeen = true; toast(fmt(INTAKE.director.blank)); }
  if (slots.some(x => x.entry.alumnus) && !S.flags.alumnusSeen) { S.flags.alumnusSeen = true; toast(fmt(INTAKE.director.alumnusSeen)); }
  // The morning a subject goes Hollow the Director wants the healed subject out: one name is discounted.
  if (anyCell(() => S.terminal === 'hollow' && S.terminalDay === S.day) && slots.length && !opts.reroll) { pick(slots).discount = 0.35; toast(fmt(INTAKE.director.offer)); }
}
function intakeBlocker() {
  if (S.day < INTAKE.unlockDay) return 'The ledger opens on the morning of day ' + INTAKE.unlockDay + '.';
  if (S.day >= CFG.totalDays - 1) return INTAKE.refuse.day19;
  return null;
}
// Where a card's subject can go: any live station, unless a transfer is already booked for it or
// it holds a Vessel, who is not moved.
function destBlocker(id) {
  if (!S.stations.includes(id)) return 'No station';
  if (S.transfers.some(t => t.slot === id)) return 'Transfer scheduled';
  if (S.cells[id] && cellField(id, 'terminal') === 'vessel') return INTAKE.refuse.vessel;
  return null;
}
// An empty station first, then the routed one, then anything open.
function defaultDest() {
  const ds = liveStations().filter(id => !destBlocker(id));
  return ds.find(id => !S.cells[id]) || ds.find(id => id === S.focus) || ds[0] || null;
}
function destOf(slot) { const ds = liveStations(); return slot.dest && ds.includes(slot.dest) ? slot.dest : defaultDest(); }
function buySubject(i) {
  const slot = S.ledger && S.ledger.slots[i]; if (!slot || slot.taken) return;
  const dest = destOf(slot), block = intakeBlocker() || (dest ? destBlocker(dest) : 'No station is free. Requisition a monitoring station, or replace a subject.');
  if (block) { Snd.play('deny'); toast(block, 'REQ-9'); return; }
  const pr = ledgerPrice(slot, dest), replacing = !!S.cells[dest];
  if (S.credits < pr.total) { Snd.play('deny'); return; }
  S.credits -= pr.total; Snd.play('buy');
  slot.taken = true;
  S.transfers.push({ entry: slot.entry, day: S.day, price: pr.total, slot: dest });
  addTraits({ authoritarianism: 1, curiosity: 1 }, 'intake');
  logEvent('intake-order', { subject: slot.entry.id, cost: pr.total, slot: dest, replacing });
  if (replacing) {
    toast(fmt(INTAKE.director.bought));
    if (S.day - S.lastTransferDay <= INTAKE.pricing.returnWindow) toast(fmt(INTAKE.director.tooSoon));
  } else toast('Admission scheduled for 06:00. Station ' + dest + ' takes Cell ' + stationOf(dest).cell + ' tomorrow.', 'REQ-9');
  openShop();
}
function rerollLedger() {
  if (intakeBlocker() || !S.ledger || S.ledger.rerolls >= INTAKE.reroll.perDay || S.credits < INTAKE.reroll.cost) { Snd.play('deny'); return; }
  S.credits -= INTAKE.reroll.cost; S.ledger.rerolls++; Snd.play('click'); logEvent('intake-reroll');
  rollLedger({ reroll: true }); openShop();
}
function tierSum() { return Object.keys(BASE).reduce((a, f) => a + (NODE[S.fam[f].node].tier || 0), 0); }
// 06:00 the morning after a purchase. The old subject goes to a rival (who gets the benefit of your
// work), the cell resets around the new one, and the clipboard stays exactly as it was.
// Admission to an empty station is the same reset on a fresh cell, with nobody sent away.
function intake() {
  const list = S.transfers; if (!list.length) return; S.transfers = [];
  const was = S.focus;
  for (const tr of list) intakeOne(tr);
  useCell(was);
}
function intakeOne(tr) {
  const dest = tr.slot || 'A', old = S.cells[dest] ? cellField(dest, 'subject') : null;
  if (!S.cells[dest]) S.cells[dest] = freshCell(dest);
  useCell(dest);
  const e = tr.entry, bonus = INTAKE.onPurchase.rivalBonus;
  let farewell = null;
  if (old) {
    const rival = pick(S.rivals), st = stateNow().id;
    rival.drive = Math.min(rival.drive + bonus.max, rival.drive + bonus.drivePerTier * tierSum());
    farewell = fmt(INTAKE.farewell[st] || INTAKE.farewell.baseline).replaceAll('{rival}', rival.name);
    S.usedSubjects.push(old.id); S.served.push(subjectRecord('Transferred out', S.day));
  }
  S.subject = makeSubject(e); S.subject.cell = stationOf(dest).cell; S.subject.since = S.day; S.mods = mergeMods(S.subject.traits);
  for (const a of AXES) S.axes[a] = clamp(B.axes[a].start + (S.mods.axisStart[a] || 0), 0, 100);
  for (const a in e.axisOverride || {}) S.axes[a] = e.axisOverride[a];
  for (const f of Object.keys(BASE)) S.fam[f] = { node: BASE[f], since: S.day, counts: newCounts() };
  S.famPath = {}; S.seen = {}; S.famSeen = {}; S.seenLine = {};
  S.terminal = null; S.terminalDay = 0; S.frozenPace = 0; S.hollowMemos = [];
  S.marks = []; S.puddles = []; S.mural = 0; S.ring = 0; S.trayEye = null; S.humBoost = 0; S.lastChange = null;
  S.damage = Object.fromEntries(['bed', 'door'].filter(k => S.damage[k]).map(k => [k, S.damage[k]])); S.repair = null; S.medic = null; S.doorMissed = 0;
  for (const k of ['door_known', 'map_complete', 'schedule_known', 'mattress_cache', 'guardsSeen', 'lensCracked', 'padsTorn', 'shockTorn', 'alumnusInCell']) delete S.flags[k];
  S.upgrades.delete('letters');
  S.patient = newPatient();
  // Start nodes: traits first, then the entry's own, then a head start toward any inherited directive.
  const starts = { ...S.mods.startNodes, ...(e.startNodes || {}) }, matches = affinityMatches(e);
  for (const r of matches) { const hs = INTAKE.inherited.headStartNodes[r] || {}; for (const f in hs) if (!starts[f] || NODE[hs[f]].tier > NODE[starts[f]].tier) starts[f] = hs[f]; }
  for (const f in starts) {
    const n = NODE[starts[f]]; if (!n || n.family !== f) continue;
    S.fam[f].node = n.id; S.seenLine[n.id] = true;
    if (n.memo && !S.flags['memo_' + n.memo.id]) { S.flags['memo_' + n.memo.id] = true; S.nextMemos.push({ id: n.memo.id, cell: S.focus }); }
  }
  if (matches.length) S.subject.inherited = true;
  if (e.alumnus) S.flags.alumnusInCell = true;
  S.lastTransferDay = S.day; S.flags.arrivedDay = S.day; S.flags.fileNew = true;
  logEvent('intake', { from: old ? old.id : null, to: e.id, slot: dest, traits: e.traits });
  queueMemo({ transfer: { farewell, from: old, to: S.subject, slot: dest } });
}
// A subject's file: history lines that match a sealed trait's phrase are drawn as a bar. The
// Behavioral Report un-redacts one of them on the patient file.
function historyRows(e, unredact = 0) {
  const sealed = sealedPhrases(e);
  let shown = 0;
  return (e.history || []).filter(h => h !== '').map(h => {
    if (sealed.includes(h)) return shown++ < unredact ? `<li>${esc(h)} <small>(Behavioral Report)</small></li>` : '<li class="bar">██████████████████</li>';
    return `<li>${esc(h)}</li>`;
  }).join('');
}
// One line per station for a card's destination menu.
function destLabel(id) {
  const s = stationOf(id), b = destBlocker(id), cur = S.cells[id] && cellField(id, 'subject');
  const state = b === INTAKE.refuse.vessel ? 'refused' : b ? b.toLowerCase() : cur ? 'replace ' + cur.id : 'empty';
  return `Station ${id} · Cell ${s.cell} · ${state}`;
}
function ledgerHtml() {
  const block = intakeBlocker(), L = S.ledger, ds = liveStations();
  let body = '';
  for (const t of S.transfers) {
    const cur = S.cells[t.slot] && cellField(t.slot, 'subject');
    body += `<p class="fine shop-note">${cur ? 'Transfer' : 'Admission'} scheduled for 06:00: Subject ${esc(t.entry.id)}, ${esc(t.entry.name)}, to Station ${t.slot} (Cell ${stationOf(t.slot).cell}).${cur ? ` Subject ${esc(cur.id)} is yours until then.` : ''}</p>`;
  }
  if (S.day < INTAKE.unlockDay) body += `<p class="fine shop-note">${esc(block)}</p>`;
  else if (!L || !L.slots.length) body += `<p class="fine shop-note">${esc(INTAKE.refuse.empty)}</p>`;
  else {
    const cards = L.slots.map((x, i) => {
      const e = x.entry, dest = destOf(x), pr = ledgerPrice(x, dest), matches = affinityMatches(e).length;
      const db = block || (dest ? destBlocker(dest) : 'No station is free');
      let btn;
      if (x.taken) btn = '<span class="tag ok">Scheduled</span>';
      else if (block) btn = '<span class="tag">Refused</span>';
      else if (db) btn = `<span class="tag">${esc(db === INTAKE.refuse.vessel ? 'Refused' : db)}</span>`;
      else if (S.credits < pr.total) btn = `<button type="button" class="btn sm" disabled>Need ${pr.total - S.credits} more</button>`;
      else btn = `<button type="button" class="btn sm" data-intake="${i}">Requisition</button>`;
      const price = `${pr.cost} cr${pr.fee ? ` + ${pr.fee} transfer` : ''}${pr.base && pr.cost !== pr.base ? ` <s>${pr.base}</s>` : ''}`;
      const sel = ds.length > 1 && !x.taken && !block ? `<label class="dest">To <select data-dest="${i}">${ds.map(id =>
        `<option value="${id}"${id === dest ? ' selected' : ''}${destBlocker(id) ? ' disabled' : ''}>${esc(destLabel(id))}</option>`).join('')}</select></label>` : '';
      return `<li class="card${e.alumnus ? ' alum' : ''}">
        <div class="card-head"><b>Subject ${esc(e.id)}</b><span>${esc(e.name)}</span><small>${e.age ? 'Age ' + e.age : 'Age ██'} · Intake ${esc(e.intake)} · ${esc(e.charge)}</small></div>
        <ul class="history">${historyRows(e)}</ul>
        <p class="sig">“${esc(fmt(e.director))}”</p>
        ${sel}
        <div class="card-foot">${matches ? `<span class="tag bad">${esc(INTAKE.inherited.cardTag)}</span>` : ''}${x.discount ? '<span class="tag ok">Director’s discount</span>' : ''}<em>${price}</em>${btn}</div></li>`;
    }).join('');
    const canRe = !block && L.rerolls < INTAKE.reroll.perDay;
    body += `<ul class="ledger">${cards}</ul><div class="ledger-foot">${block ? `<p class="fine">${esc(block)}</p>` : ''}${canRe ? `<button type="button" class="btn sm ghost" data-reroll ${S.credits < INTAKE.reroll.cost ? 'disabled' : ''}>Request other names · ${INTAKE.reroll.cost} cr</button>` : ''}</div>`;
    if (L.slots.some(x => affinityMatches(x.entry).length) && !S.flags.inheritedSaid) { S.flags.inheritedSaid = true; toast(fmt(INTAKE.inherited.director)); }
  }
  const note = ds.length > 1
    ? 'Phase 1 clearance permits one subject per cell. A subject sent to an empty station is admitted at 06:00 tomorrow. Sending one to an occupied station moves the current subject out, for a transfer fee; today still counts. The clipboard stays as it is.'
    : 'Phase 1 clearance permits one subject per cell. A requisition sends the current subject away at 06:00 tomorrow, for a transfer fee; today still counts. The clipboard stays as it is. REQ-9 also sells monitoring stations.';
  return `<p class="fine shop-note">${esc(note)}</p>${body}`;
}
S.subject = makeSubject(SUBJ.roster.find(r => r.starting) || SUBJ.roster[0]);
S.mods = mergeMods(S.subject.traits);

function newPatient() {
  return { x: SPOT.bedSit[0], y: SPOT.bedSit[1], pose: 'sit', facing: 'front', steps: [], step: null, stepT: 0,
    stress: 12, since: 0, gap: rand(4, 7), lastRule: null, bubble: null, collapsed: false, t: 0 };
}
S.patient = newPatient();

// ---------------------------------------------------------------- stations and cells
// Every monitoring station holds one cell with one subject. The engine's per-subject fields live on
// S while that cell is loaded; useCell() stores them back into S.cells[slot] and loads another
// cell's. The console (ARM, dial, knob, ADMINISTER, intercom) is routed to the station in S.focus,
// which always names an occupied cell. The simulation and the renderer visit every cell in turn.
const STATIONS = D.monitorSlots;
const CELL_FIELDS = ['patient', 'axes', 'fam', 'famPath', 'seen', 'famSeen', 'seenLine', 'terminal', 'terminalDay', 'hollowMemos', 'mural', 'ring', 'trayEye',
  'frozenPace', 'inst', 'lastInst', 'medicalUntil', 'sedatedUntil', 'humBoost', 'subject', 'mods', 'marks', 'puddles', 'fx', 'violation', 'lastChange',
  'damage', 'repair', 'medic', 'doorMissed'];
// Flags that belong to the subject in the cell rather than to the technician.
const CELL_FLAGS = ['door_known', 'map_complete', 'schedule_known', 'mattress_cache', 'guardsSeen', 'lensCracked', 'padsTorn', 'shockTorn', 'alumnusInCell',
  'arrivedDay', 'fileNew', 'medicalIncident', 'sched', 'schedDay'];
function stationOf(id) { return STATIONS.find(s => s.id === id); }
function liveStations() { return ['A', 'B', 'C'].filter(id => S.stations.includes(id)); }
function stationList() { return liveStations().map(stationOf); }
function occupied() { return liveStations().filter(id => S.cells[id]); }
function freshCell(slot) {
  const c = { slot, patient: newPatient(), axes: Object.fromEntries(AXES.map(a => [a, B.axes[a].start])), fam: {}, famPath: {}, seen: {}, famSeen: {}, seenLine: {},
    terminal: null, terminalDay: 0, hollowMemos: [], mural: 0, ring: 0, trayEye: null, frozenPace: 0, inst: null, lastInst: null, medicalUntil: 0, sedatedUntil: 0, humBoost: 0,
    subject: null, mods: mergeMods([]), marks: [], puddles: [], fx: [], violation: null, lastChange: null, flags: {}, damage: {}, repair: null, doorMissed: 0 };
  for (const f of Object.keys(BASE)) c.fam[f] = { node: BASE[f], since: S.day, counts: newCounts() };
  return c;
}

// ---------------------------------------------------------------- cell damage and maintenance
// Subjects break the cell: five marks on the walls, a circle drawn on the floor as fracture climbs, a cot
// kicked apart by a violent subject, a door latch that gives after three missed door infractions, and the
// lens and electrodes a Feral subject tears up. Each is a ticket at REQ-9. Whatever stands at 17:00 is
// deducted, more for every day it has stood. A crew fixes a ticket in the cell while the subject faces the wall.
const DMG = {
  penalty: 15, crew: 9, marksToDamage: 5, doorMisses: 3, escapeFine: 40, medical: 10, medicWork: 7,
  labels: { walls: 'Walls written on', floor: 'Circle drawn on the floor', bed: 'Cot broken', door: 'Door latch broken, door ajar', lens: 'Camera lens cracked', pads: 'Electrodes torn out' },
  done: { walls: 'walls cleaned.', floor: 'floor scrubbed. The crew did not step inside the circle.', bed: 'new cot installed. Bolted.', door: 'door latch re-seated.', lens: 'camera lens replaced.', pads: 'electrodes refitted. Contact Electrodes online.' },
};
function breakItem(kind, line, who) {
  if (tut || S.damage[kind]) return;
  S.damage[kind] = { day: S.day }; S.flags.fileNew = true;
  logEvent('damage', { kind, cell: S.focus });
  if (line) toast(line, who);
}
function damageList() {
  const out = [];
  eachCell(id => { for (const k in S.damage) if (S.damage[k]) out.push({ cell: id, cellNo: cellNo(), kind: k, days: S.day - S.damage[k].day + 1 }); });
  return out;
}
function damagePenalty(list) { return list.reduce((a, d) => a + DMG.penalty * d.days, 0); }
// Once an hour a cell may take damage. Any response from the console interrupts the act.
function damageTick() {
  const p = S.patient;
  if (tut || p.dead || p.gone || p.collapsed || medical() || S.repair || S.medic || (S.inst && S.inst.infraction) || S.sedatedUntil > S.time) return;
  const violent = S.axes.defiance >= 65 || S.terminal === 'feral' || (S.subject.traits || []).includes('violent');
  if (!S.damage.bed && violent && Math.random() < 0.22) { interrupt([{ move: SPOT.bedside }, { pose: 'kick', facing: 'left', dur: 3.6, wreck: 'bed' }]); return; }
  if (!S.damage.lens && !S.flags.lensCracked && (S.axes.defiance >= 75 || S.terminal === 'feral') && Math.random() < 0.12) { interrupt([{ move: SPOT.camera }, { pose: 'bang', facing: 'front', dur: 2.4, wreck: 'lens' }]); return; }
  if (!S.damage.floor && S.axes.fracture >= 65 && Math.random() < 0.22) { interrupt([{ move: SPOT.center }, { pose: 'kneel', facing: 'front', dur: 5.5, wreck: 'floor', bubble: pick(['...A CIRCLE KEEPS IT IN...', '...FIVE POINTS. FIVE...', '...IT SHOWED ME THE SHAPE...']) }]); return; }
  if (S.damage.door && Math.random() < 0.45) interrupt(planNode(NODE.door_escape, isInfraction(NODE.door_escape), { escape: true }));
}
function wreck(kind) {
  if (kind === 'bed') breakItem('bed', fmt(pick(['The subject has broken the cot. A cot costs more than a subject. File the ticket.', 'That cot was Ministry property, {name}. Have it replaced.'])));
  if (kind === 'floor') breakItem('floor', 'That is a circle on the floor. I do not want to know what is inside it. Have it cleaned.');
  if (kind === 'lens') { S.flags.lensCracked = true; breakItem('lens', 'Cell ' + cellNo() + ' camera lens cracked. Camera rules cannot be enforced.', 'CONSOLE'); }
}
function escapeSteps() {
  return [{ pose: 'stand', facing: 'back', dur: 0.4 }, { pose: 'stand', facing: 'back', hidden: true, out: true, dur: 12 },
    { pose: 'stand', facing: 'front', at: SPOT.door, dur: 1 }, { move: SPOT.bedSit }, { pose: 'sit', facing: 'front', dur: 4 }];
}
function escapeBegin() {
  S.patient.out = true; S.stats.escapes = (S.stats.escapes || 0) + 1;
  logEvent('escape-attempt', { cell: S.focus }); Snd.play('bang');
  toast('Subject out of Cell ' + cellNo() + '. Security responding.', 'SECURITY');
}
function escapeEnd() {
  const p = S.patient, fine = DMG.escapeFine; p.out = false;
  p.stress = Math.min(100, p.stress + 35);
  S.credits = Math.max(0, S.credits - fine); S.today.earned = Math.max(0, S.today.earned - fine);
  addTraits({ obedience: -1 }); bump({ defiance: 4 }, false);
  floatText('-' + fine + ' CR', G[3]);
  toast('Subject returned to Cell ' + cellNo() + ' by Security. Logged against your shift: ' + fine + ' credits.', 'SECURITY');
}
function startRepair(kind) {
  const p = S.patient, spot = kind === 'door' ? SPOT.behindcot : SPOT.doorwall;
  S.repair = { kind, t: 0, dur: repairDur() };
  if (!p.collapsed && !p.dead && !medical() && !p.out) interrupt([{ move: spot }, { pose: 'stand', facing: 'back', at: spot, dur: repairDur() + 1, hold: true }, { move: SPOT.bedSit }, { pose: 'sit', facing: 'front', dur: 3 }]);
  toast('Crew to Cell ' + cellNo() + '. Subject to stand against the wall.', 'MAINTENANCE');
  logEvent('repair', { kind, cell: S.focus });
}
function finishRepair() {
  const k = S.repair.kind; S.repair = null; delete S.damage[k];
  if (k === 'walls') S.marks = [];
  if (k === 'floor') S.puddles = [];
  if (k === 'lens') delete S.flags.lensCracked;
  if (k === 'pads') { delete S.flags.padsTorn; delete S.flags.shockTorn; }
  toast('Cell ' + cellNo() + ': ' + DMG.done[k], 'MAINTENANCE'); logEvent('repaired', { kind: k, cell: S.focus });
}
// Medical: a collapse brings a team in through the door, with a guard in the doorway. Two medics
// kneel at the subject until the heart settles, and the call-out is charged to the console.
function medicDur() { return DMG.medicWork + CREW.open + CREW.walk * 2 + CREW.close; }
function startMedic() {
  const p = S.patient, fee = DMG.medical;
  S.medic = { t: 0, dur: medicDur(), at: [Math.round(p.x), Math.round(p.y)] };
  S.credits = Math.max(0, S.credits - fee); S.today.earned = Math.max(0, S.today.earned - fee);
  S.today.medical = (S.today.medical || 0) + 1; S.today.medicalCost = (S.today.medicalCost || 0) + fee;
  floatText('-' + fee + ' CR', G[3]);
  toast('Medical team to Cell ' + cellNo() + '. Call-out charged to your console: ' + fee + ' cr.', 'MEDICAL');
  logEvent('medical-team', { fee, cell: S.focus });
}
function finishMedic() {
  S.medic = null;
  toast('Cell ' + cellNo() + ': subject stabilised. Medical has left.', 'MEDICAL'); logEvent('medical-left', { cell: S.focus });
}
function buyRepair(item, cell) {
  if (!item || !S.cells[cell] || cellField(cell, 'repair') || S.credits < item.cost) { Snd.play('deny'); return; }
  S.credits -= item.cost; Snd.play('buy'); addTraits(item.traits || {});
  logEvent('purchase', { item: item.id, cell, cost: item.cost });
  withCell(cell, () => startRepair(item.repair));
  openShop();
}
function storeCell() {
  const c = S.cells[S.focus]; if (!c) return;
  for (const k of CELL_FIELDS) c[k] = S[k];
  c.flags = {};
  for (const k of CELL_FLAGS) if (S.flags[k] !== undefined) { c.flags[k] = S.flags[k]; delete S.flags[k]; }
}
function loadCell(id) {
  const c = S.cells[id]; if (!c) return false;
  for (const k of CELL_FIELDS) S[k] = c[k];
  for (const k of CELL_FLAGS) if (c.flags[k] !== undefined) S.flags[k] = c.flags[k];
  S.focus = id; return true;
}
function useCell(id) { if (id === S.focus) return !!S.cells[id]; if (!S.cells[id]) return false; storeCell(); return loadCell(id); }
// A field of a cell, live when that cell is the loaded one.
function cellField(id, k) { return id === S.focus ? S[k] : S.cells[id] && S.cells[id][k]; }
// Run fn with each occupied cell loaded, then come back to the routed one.
function eachCell(fn) { const was = S.focus; for (const id of occupied()) { useCell(id); fn(id); } useCell(was); }
function withCell(id, fn) { const was = S.focus; if (!useCell(id)) return undefined; try { return fn(); } finally { useCell(was); } }
function anyCell(pred) { let r = false; eachCell(() => { if (pred()) r = true; }); return r; }
// Route the console to a station. Only occupied stations take the console.
function routeTo(id) {
  if (tut || S.phase !== 'desk') return;
  if (!S.stations.includes(id)) { Snd.play('deny'); return; }
  if (!S.cells[id]) { Snd.play('deny'); toast('Station ' + id + ' is live. Cell ' + stationOf(id).cell + ' is empty; the Intake Ledger can fill it.', 'CONSOLE'); return; }
  if (id === S.focus) return;
  useCell(id); Snd.play('click'); logEvent('route', { station: id });
  el.hint.textContent = 'Console routed to Station ' + id + ', Cell ' + cellNo() + '. ADMINISTER and the intercom go there.';
}
function routeKey(i) { const id = liveStations()[i]; if (id) routeTo(id); }
function cycleRoute(d) { const o = occupied(); if (o.length < 2) return; routeTo(o[(o.indexOf(S.focus) + (d > 0 ? 1 : o.length - 1)) % o.length]); }
function queueMemo(item) { item.cell = S.focus; S.memoQueue.push(item); }
S.cells.A = { slot: 'A', flags: {} }; storeCell();

// ---------------------------------------------------------------- competition
const COMP = D.competition;
function newToday() { return { earned: 0, opportunity: 0, caught: 0, warned: 0, missed: 0, feedback: 0, talks: 0, stims: 0, feedT: 0, feedEnded: false, changes: [] }; }
S.today = newToday();
S.rivals = COMP.rivals.map(r => ({ name: 'Tech. ' + r.name, drive: r.drive }));
S.noise = [];
S.newcomerIdx = 0;
S.history = [];
function rollNoise() { S.noise = S.rivals.map(() => rand(COMP.noise[0], COMP.noise[1])); }
rollNoise();
function comfortCount() { return D.shop.filter(i => i.kind === 'comfort' && !i.consumable && S.upgrades.has(i.id)).length; }
function warnMult() { return COMP.warnBase + COMP.warnPerComfort * comfortCount() + (S.axes.trust >= 40 ? TUNE.trustWarnBonus : 0) + (S.terminal === 'conspirator' ? TUNE.conspiratorWarnBonus : 0); }
function perfectRate() { return COMP.perfectPerComfort * comfortCount(); }
function paceToday(raw) { return !raw && S.terminal === 'vessel' && S.frozenPace ? S.frozenPace : COMP.pace[Math.min(S.day, COMP.pace.length) - 1]; }
function playerDay() {
  const t = S.today, bonus = t.missed === 0 && t.opportunity > 0 ? Math.round(t.earned * perfectRate()) : 0;
  return { earned: t.earned, bonus, total: t.earned + bonus };
}
// Rivals earn a share of the credits the subject's infractions were worth today, but never less
// than a share of his recent average (their own subjects do not go quiet when yours does).
// Ties go against the player.
function rivalBasis(full) {
  const frac = full ? 1 : clamp(S.time / shiftLen(), 0, 1);
  const recent = S.history.slice(-3).map(h => h.opportunity);
  const ref = recent.length ? recent.reduce((a, b) => a + b, 0) / recent.length * TUNE.rivalFloor : 0;
  // A Feral subject is loud enough that the floor does not apply, but when Medical ends the day
  // early the rivals keep earning for the hours you lost.
  if (S.terminal === 'feral') return S.today.opportunity + (full ? ref * (1 - clamp(S.time / shiftLen(), 0, 1)) : 0);
  return Math.max(S.today.opportunity, ref * frac);
}
function board(full) {
  const basis = rivalBasis(full);
  const rows = S.rivals.map((r, i) => ({ name: r.name, score: Math.round(paceToday() * r.drive * (S.noise[i] || 1) * basis) }));
  rows.push({ name: S.name, score: playerDay().total, me: true });
  rows.sort((a, b) => b.score - a.score || (a.me ? 1 : b.me ? -1 : 0));
  return rows;
}
function liveRank() { return S.today.opportunity > 0 || S.history.length ? board().findIndex(r => r.me) + 1 : 0; }
function isFriendly() { return S.stats.feedback === 0; }
function topRival() { return board().find(r => !r.me).name; }
function fmtEnding(s) {
  return fmt(s).replaceAll('{time}', clockStr()).replaceAll('{day}', S.day).replaceAll('{top}', topRival());
}

// ---------------------------------------------------------------- save
const SAVE_KEY = 'eldritch-full-v2';
const SAVE_FIELDS = ['name', 'day', 'credits', 'stimIndex', 'intensity', 'traits', 'stats', 'counts', 'flags', 'rivals', 'newcomerIdx', 'history', 'log',
  'nextMemos', 'directiveN', 'ledger', 'alumni', 'alumniN', 'transfers', 'usedSubjects', 'lastTransferDay', 'stations', 'focus', 'cells'];
function saveGame() {
  try {
    storeCell();
    const d = { owned: [...S.owned], upgrades: [...S.upgrades], active: [...S.active], rescinded: [...S.rescinded] };
    for (const k of SAVE_FIELDS) d[k] = k === 'log' ? S.log.slice(-400) : S[k];
    localStorage.setItem(SAVE_KEY, JSON.stringify(d));
  } catch (e) {}
}
function loadSave() { try { return JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); } catch (e) { return null; } }
function clearSave() { try { localStorage.removeItem(SAVE_KEY); } catch (e) {} }
function applySave(d) {
  for (const k of SAVE_FIELDS) if (d[k] !== undefined) S[k] = d[k];
  for (const r of ALL_RULES) S.counts[r.id] = S.counts[r.id] || { caught: 0, missed: 0 };
  S.owned = new Set(d.owned); S.upgrades = new Set(d.upgrades); S.active = new Set(d.active); S.rescinded = new Set(d.rescinded || []);
  S.time = 0; S.today = newToday(); rollNoise();
  // Each cell comes back at the start of its day: the subject on the cot, nothing mid-step.
  for (const id in S.cells) {
    const c = S.cells[id]; if (!c) continue;
    if (!c.subject) c.subject = makeSubject(SUBJ.roster.find(r => r.starting));
    c.mods = mergeMods(c.subject.traits);
    c.patient = { ...newPatient(), stress: (c.patient && c.patient.stress) || 12 };
    c.inst = null; c.lastInst = null; c.violation = null; c.fx = []; c.medicalUntil = 0; c.sedatedUntil = 0; c.flags = c.flags || {};
    c.damage = c.damage || {}; c.repair = null; c.doorMissed = c.doorMissed || 0;
  }
  loadCell(S.cells[S.focus] ? S.focus : 'A');
  rebuildDesk();
}

// Shared strings carry tokens for the player, the subject and the subject's kin; bubbles use the
// upper-case forms.
function fmt(s) {
  s = String(s).replaceAll('{name}', S.name);
  if (!s.includes('{')) return s;
  if (s.includes('{lastRival}')) s = s.replaceAll('{lastRival}', (S.rivals.length ? S.rivals[0].name : 'Tech. Marsh').replace(/^Tech\. /, ''));
  const e = S.subject || {}, k = e.kin || {}, pf = kinForms(k);
  const map = { '{subject}': 'Subject ' + (e.id || ''), '{id}': e.id || '', '{subjectName}': e.name || '', '{kin.who}': k.who || 'family', '{kin.name}': k.name || '',
    '{kin.day}': k.day || 'Tuesday', '{kin.they}': pf.they, '{kin.them}': pf.them, '{kin.their}': pf.their };
  for (const t in map) { const u = t.toUpperCase(); if (s.includes(t)) s = s.replaceAll(t, map[t]); if (s.includes(u)) s = s.replaceAll(u, String(map[t]).toUpperCase()); }
  return s;
}
function addTraits(t, why) {
  for (const k in t) S.traits[k] = Math.max(0, (S.traits[k] || 0) + t[k]);
  if (why) logEvent('trait', { why, traits: t });
}
function logEvent(type, data = {}) { S.log.push({ day: S.day, clock: clockStr(), type, ...data }); }
function hourNow() { return CFG.shiftStartHour + Math.floor(S.time / CFG.secondsPerHour); }
function clockStr() {
  const mins = Math.floor((S.time / CFG.secondsPerHour) * 60);
  const h = CFG.shiftStartHour + Math.floor(mins / 60), m = mins % 60;
  return String(h).padStart(2, '0') + ':' + String(m - (m % 5)).padStart(2, '0');
}
function maxIntensity() { return S.upgrades.has('limiter') ? 10 : CFG.baseMaxIntensity; }
function ownedList() { return D.stimuli.filter(s => S.owned.has(s.id)); }
function curStim() { return D.stimuli[S.stimIndex]; }
function activeRules() { return ALL_RULES.filter(r => S.active.has(r.id) && !S.rescinded.has(r.id)); }

// ---------------------------------------------------------------- DOM refs
const $ = id => document.getElementById(id);
const el = {
  frame: $('frame'), title: $('titlecard'), begin: $('begin'), dlg: $('dialogue'), dlgName: $('dlg-name'),
  dlgText: $('dlg-text'), dlgChoices: $('dlg-choices'), dlgMore: $('dlg-more'), modal: $('modal'),
  modalBody: $('modal-body'), modalX: $('modal-x'), scrim: $('scrim'), log: $('log'), logJump: $('log-jump'), hint: $('hint'), mute: $('mute'),
  coach: $('coach'), coachStep: $('coach-step'), coachText: $('coach-text'), coachNext: $('coach-next'), coachSkip: $('coach-skip'),
};

// ---------------------------------------------------------------- director ticker
// Messages land in the Director line, the green log under the desk, newest at the bottom. The log
// keeps the last 200 and stays put when the player has scrolled back to read.
function logAtBottom() { return el.log.scrollHeight - el.log.scrollTop - el.log.clientHeight < 24; }
el.log.addEventListener('scroll', () => { if (logAtBottom()) el.logJump.hidden = true; });
el.logJump.addEventListener('click', () => { el.log.scrollTop = el.log.scrollHeight; el.logJump.hidden = true; });
// Director lines pick a mood variant (lines[key + '_' + mood]) when one exists.
function say(key, chance = 1, who) {
  if (Math.random() > chance || !D.lines[key]) return;
  toast(fmt(moodLine(key)), who);
}
function toast(msg, who = D.director.name) {
  const stay = logAtBottom();
  const li = document.createElement('li'), t = document.createElement('i'), b = document.createElement('b'), s = document.createElement('span');
  t.textContent = S.phase === 'desk' ? (tut ? 'ORI' : clockStr()) : 'D' + String(S.day).padStart(2, '0');
  b.textContent = who; s.textContent = msg;
  li.className = 'new'; li.append(t, b, s);
  el.log.append(li);
  while (el.log.children.length > 200) el.log.firstChild.remove();
  if (stay) el.log.scrollTop = el.log.scrollHeight; else el.logJump.hidden = false;
}

// ---------------------------------------------------------------- static layers
const deskBg = layer(), officeBg = layer();
// The console block is laid out at its original coordinates and drawn this far to the right, which
// is the room the wider clipboard takes from the REQ-9 terminal.
const CONSOLE_DX = 10;

function buildDesk() {
  const c = deskBg; seed = 11;
  rect(c, 0, 0, W, H, P.wall1);
  for (let y = 0; y < 26; y++) for (let x = 0; x < W; x++) if (bayer(x, y) < (1 - y / 26) * 0.6) rect(c, x, y, 1, 1, P.wall0);
  for (let x = 6; x < W; x += 46) { rect(c, x, 0, 1, 99, P.wall0); rect(c, x + 1, 0, 1, 99, P.wall2); }
  rect(c, 0, 76, W, 1, P.wall3); rect(c, 0, 77, W, 2, P.wall0);
  for (let y = 79; y < 99; y++) for (let x = 0; x < W; x++) if (bayer(x, y) < 0.35) rect(c, x, y, 1, 1, P.wall0);
  // green CRT spill on the wall behind each installed monitor
  for (const s of stationList()) glow(c, s.x + s.w / 2, 48, 92, 60, '#1f3a33', 0.55);
  // wall clock (hands drawn live), above the empty slot in the middle until Station B covers it
  disc(c, 160, 17, 10, P.met0); disc(c, 160, 17, 9, P.paper2); disc(c, 160, 17, 8, P.paper);
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; rect(c, Math.round(160 + Math.cos(a) * 7), Math.round(17 + Math.sin(a) * 7), 1, 1, P.ink); }
  // poster
  rect(c, 240, 4, 56, 26, P.paper2); rect(c, 241, 5, 54, 24, P.paper);
  textC(c, 'E.L.D.R.I.T.C.H', 268, 7, P.red1);
  rect(c, 260, 14, 16, 7, P.paper); ring(c, 268, 17, 3, P.ink); disc(c, 268, 17, 1, P.ink);
  line(c, 258, 17, 263, 14, P.ink); line(c, 258, 17, 263, 20, P.ink); line(c, 278, 17, 273, 14, P.ink); line(c, 278, 17, 273, 20, P.ink);
  textC(c, 'IT HELPS', 268, 23, P.ink);
  rect(c, 242, 5, 2, 2, P.paper2); rect(c, 292, 5, 2, 2, P.paper2);
  // desk
  rect(c, 0, 99, W, 81, P.wood1);
  rect(c, 0, 99, W, 1, P.wood3); rect(c, 0, 100, W, 1, P.wood2);
  for (let i = 0; i < 70; i++) {
    const y = 102 + Math.floor(srand() * 78), x = Math.floor(srand() * W), l = 8 + Math.floor(srand() * 40);
    rect(c, x, y, l, 1, srand() < 0.6 ? P.wood0 : P.wood2);
  }
  for (let y = 160; y < H; y++) for (let x = 0; x < W; x++) if (bayer(x, y) < (y - 160) / 30) rect(c, x, y, 1, 1, P.wood0);
  // empty monitor slots
  for (const s of STATIONS) if (!S.stations.includes(s.id)) drawEmptySlot(c, s);
  // monitor bodies are drawn here; their screens are drawn live
  for (const s of stationList()) drawMonitorBody(c, s);
  // clipboard
  rect(c, 7, 107, 58, 68, P.wood0); rect(c, 6, 106, 58, 68, '#76502f'); rect(c, 6, 106, 58, 1, '#9a6c43');
  rect(c, 10, 112, 50, 60, P.paper); rect(c, 10, 171, 50, 1, P.paper2); rect(c, 59, 112, 1, 60, P.paper2);
  rect(c, 26, 103, 18, 8, P.met2); rect(c, 27, 104, 16, 2, P.met4); rect(c, 28, 109, 14, 1, P.met0);
  // console, shifted right by CONSOLE_DX to make room for the clipboard
  c.save(); c.translate(CONSOLE_DX, 0);
  rect(c, 60, 176, 202, 3, P.wood0);
  rect(c, 60, 108, 200, 68, P.met1);
  rect(c, 60, 108, 200, 1, P.met4); rect(c, 60, 109, 200, 1, P.met3);
  rect(c, 60, 108, 1, 68, P.met2); rect(c, 259, 108, 1, 68, P.met0);
  rect(c, 60, 172, 200, 4, P.met0); rect(c, 60, 172, 200, 1, P.met2);
  for (const [x, y] of [[63, 111], [256, 111], [63, 169], [256, 169]]) { rect(c, x, y, 2, 2, P.met3); rect(c, x + 1, y + 1, 1, 1, P.met0); }
  for (let y = 112; y < 171; y++) for (let x = 61; x < 259; x++) if (bayer(x, y) < 0.08) rect(c, x, y, 1, 1, P.met2);
  rect(c, 66, 112, 76, 11, P.met0); rect(c, 67, 113, 74, 9, '#120708');
  rect(c, 150, 112, 104, 11, P.met0); rect(c, 151, 113, 102, 9, '#120708');
  rect(c, 148, 121, 106, 1, P.met0); rect(c, 148, 122, 106, 1, P.met2);
  text(c, 'INTERCOM', 218, 125, P.met3);
  // ARM plate
  rect(c, 69, 129, 16, 24, P.met0); rect(c, 70, 130, 14, 22, P.met2); rect(c, 70, 130, 14, 1, P.met3);
  text(c, 'ARM', 72, 156, P.met4);
  text(c, 'STIM', 103, 162, P.met4);
  text(c, 'ADMINISTER', 173, 162, P.met4);
  // admin housing
  disc(c, 192, 145, 14, P.met0); ring(c, 192, 145, 14, P.met3); disc(c, 192, 145, 12, '#16191c');
  // yellow/black hazard stripes under the button
  for (let x = 176; x < 208; x++) if (((x >> 1) & 1) === 0) { rect(c, x, 168, 1, 2, P.yel); } else rect(c, x, 168, 1, 2, P.met0);
  // intercom grille
  rect(c, 221, 131, 26, 14, P.met0);
  for (let y = 133; y < 144; y += 2) for (let x = 223; x < 246; x += 2) rect(c, x, y, 1, 1, P.met2);
  rect(c, 224, 148, 20, 12, P.met0);
  text(c, 'WARN', 227, 163, P.met4);
  c.restore();
  // requisition terminal, narrower
  rect(c, 275, 175, 40, 3, P.wood0);
  rect(c, 274, 110, 40, 44, P.bei2); rect(c, 274, 110, 40, 1, P.bei3); rect(c, 313, 110, 1, 44, P.bei0); rect(c, 274, 153, 40, 1, P.bei0);
  rect(c, 277, 113, 34, 31, P.bei1); rect(c, 279, 115, 30, 27, G[0]);
  text(c, 'REQ-9', 278, 147, P.bei0);
  rect(c, 276, 156, 38, 18, P.bei1); rect(c, 276, 156, 38, 1, P.bei3); rect(c, 276, 173, 38, 2, P.bei0);
  for (let y = 159; y < 172; y += 3) for (let x = 278; x < 312; x += 4) rect(c, x, y, 3, 2, P.bei3);
  vignette(c, 0.75, [[4, 102, 63, 74], [272, 108, 44, 70], [238, 2, 60, 30], [58 + CONSOLE_DX, 106, 204, 72], [148, 4, 24, 26]].concat(stationList().map(s => [s.x, s.y, s.w, s.h + 8])));
}

function drawMonitorBody(c, s) {
  const { x, y, w, h } = s;
  rect(c, x + w / 2 - 10, y + h, 20, 4, P.bei1); rect(c, x + w / 2 - 22, y + h + 2, 44, 4, P.bei1);
  rect(c, x + w / 2 - 24, y + h + 6, 48, 2, P.wood0);
  rect(c, x, y, w, h, P.bei2); rect(c, x, y, w, 1, P.bei3); rect(c, x, y, 1, h, P.bei3);
  rect(c, x + w - 1, y, 1, h, P.bei0); rect(c, x, y + h - 1, w, 1, P.bei0);
  rect(c, x + 4, y + 4, w - 8, h - 20, P.bei1);
  rect(c, x + 6, y + 6, w - 12, h - 24, '#000');
  text(c, 'E.L.D.R.I.T.C.H', x + 10, y + h - 12, P.bei0);
  for (let i = 0; i < 4; i++) rect(c, x + w - 34 + i * 3, y + h - 11, 2, 3, P.bei1);
  // with more than one station each bezel names its station and cell
  if (S.stations.length > 1) { rect(c, x + 2, y + 1, w - 4, 3, P.bei1); textC(c, 'STATION ' + s.id + '  CELL ' + s.cell, x + w / 2, y, P.bei0); }
}
function screenRect(s) { return { x: s.x + 6, y: s.y + 6, w: s.w - 12, h: s.h - 24 }; }

function drawEmptySlot(c, s) {
  const { x, y, w, h } = s.patch;
  // a paler patch of wall where a monitor used to stand, plus a loose cable
  for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) {
    const edge = yy === y || xx === x || xx === x + w - 1;
    if (edge && ((xx + yy) & 3) < 2) rect(c, xx, yy, 1, 1, P.wall3);
  }
  rect(c, x + 6, 100, w - 12, 2, P.wood2);
  const cx = 100, ex = x + w / 2;
  for (let i = 0; i <= 20; i++) {
    const t = i / 20, xx = cx + (ex - cx) * t, yy = 98 + Math.sin(t * Math.PI) * 5;
    rect(c, xx, yy, 1, 1, P.met0);
  }
  rect(c, ex - 1, 97, 3, 3, P.met2);
  // tent card
  const tx = x + w / 2 - 15, ty = 84;
  rect(c, tx + 1, ty + 1, 30, 14, P.wood0); rect(c, tx, ty, 30, 14, P.paper); rect(c, tx, ty + 13, 30, 1, P.paper2);
  textC(c, 'SLOT ' + s.id, tx + 15, ty + 2, P.ink); textC(c, 'EMPTY', tx + 15, ty + 8, P.red1);
}

function buildOffice() {
  const c = officeBg; seed = 23;
  rect(c, 0, 0, W, H, '#262232');
  for (let y = 0; y < 30; y++) for (let x = 0; x < W; x++) if (bayer(x, y) < (1 - y / 30) * 0.7) rect(c, x, y, 1, 1, P.wall0);
  // wainscot
  rect(c, 0, 72, W, 36, P.wood1); rect(c, 0, 72, W, 1, P.wood3);
  for (let x = 4; x < W; x += 32) { rect(c, x, 76, 26, 28, P.wood0); rect(c, x + 1, 77, 24, 26, P.wood1); }
  // emblem
  line(c, 160, 6, 146, 30, P.amb1); line(c, 160, 6, 174, 30, P.amb1); line(c, 146, 30, 174, 30, P.amb1);
  ring(c, 160, 22, 3, P.amb1); rect(c, 160, 22, 1, 1, P.amb2);
  // bookshelf
  rect(c, 12, 16, 62, 92, P.wood0); rect(c, 14, 18, 58, 88, '#1a100b');
  const bookCols = [P.red1, P.amb1, P.met2, G[2], P.bei1, '#4a3a5e', P.wood3];
  for (const sy of [38, 60, 82, 104]) {
    rect(c, 14, sy, 58, 2, P.wood2);
    let x = 15;
    while (x < 70) {
      const bw = 2 + Math.floor(srand() * 3), bh = 10 + Math.floor(srand() * 9);
      if (srand() < 0.12) { x += 3; continue; }
      rect(c, x, sy - bh, Math.min(bw, 71 - x), bh, pick(bookCols)); rect(c, x, sy - bh, 1, bh, 'rgba(0,0,0,.25)');
      x += bw;
    }
  }
  // specimen jar on the shelf
  rect(c, 52, 22, 14, 16, P.met3); rect(c, 53, 24, 12, 13, G[1]); rect(c, 52, 21, 14, 2, P.met2);
  line(c, 56, 34, 58, 28, G[3]); line(c, 58, 28, 61, 30, G[3]); line(c, 61, 30, 62, 26, G[3]); rect(c, 57, 33, 3, 2, G[3]);
  // certificate
  rect(c, 200, 26, 36, 26, P.amb1); rect(c, 202, 28, 32, 22, P.paper);
  for (let i = 0; i < 4; i++) rect(c, 206, 32 + i * 4, 24 - (i % 2) * 6, 1, P.paper2);
  disc(c, 228, 45, 3, P.red2);
  // filing cabinet
  rect(c, 262, 46, 44, 62, P.met1); rect(c, 262, 46, 44, 1, P.met3);
  for (let i = 0; i < 3; i++) { rect(c, 265, 50 + i * 19, 38, 16, P.met2); rect(c, 280, 56 + i * 19, 8, 2, P.met4); rect(c, 279, 52 + i * 19, 10, 3, P.paper2); }
  // lamp glow
  glow(c, 70, 104, 46, 30, '#5a4122', 0.6);
  vignette(c, 0.8);
}

// ---------------------------------------------------------------- behavior system
// Every behavior the subject has is a node in a family (behaviors.js). How the technician answers
// each instance moves four hidden drives (axes) and, once enough answers of one kind pile up, moves
// the family to a new node. Drifts pull whole families toward the strongest drive, and at 80 the
// subject enters a terminal state (Vessel, Hollow, Conspirator, Feral).
function newCounts() { return { ignore: 0, warn: 0, mild: 0, harsh: 0, overkill: 0, punished: 0, repeat: 0, allowed: 0, any: 0, by: {} }; }
function axisTop() {
  let best = AXES[0];
  for (const a of AXES) if (S.axes[a] > S.axes[best]) best = a;
  return { axis: best, v: S.axes[best] };
}
// Per-instance deltas are scaled by the tuning block; one-off item effects are not.
function bump(delta, scaled = true, k = 1) {
  if (!delta) return;
  for (const a in delta) {
    if (!(a in S.axes)) continue;
    const v = scaled ? delta[a] * TUNE.axisScale * (TUNE.axisGain[a] || 1) * ((mod('axisGain') || {})[a] ?? 1) * k : delta[a] * k;
    S.axes[a] = clamp(S.axes[a] + v, 0, 100);
  }
}
function stateNow() {
  if (S.terminal) return B.states.find(s => s.id === S.terminal);
  const top = axisTop();
  return B.states.find(s => !s.terminal && s.axis === top.axis && top.v >= s.min) || B.states[0];
}
const MOOD = { fracture: 'warm', compliance: 'impatient', trust: 'suspicious', defiance: 'theatrical' };
function mood() { const top = axisTop(); return top.v >= 40 ? MOOD[top.axis] : null; }
function moodLine(key) { const m = mood(), alt = m && D.lines[key + '_' + m]; return pick(alt && Math.random() < 0.7 ? alt : D.lines[key]); }
function isInfraction(n) { return !!n.rule && S.active.has(n.rule) && !S.rescinded.has(n.rule); }
function nodeOf(f) { return NODE[S.fam[f].node]; }
function termMult() { return S.terminal === 'vessel' ? TUNE.vesselMult : S.terminal === 'feral' ? TUNE.feralMult : 1; }
function shiftLen() { return (CFG.shiftEndHour - CFG.shiftStartHour) * CFG.secondsPerHour; }
function medical() { return S.medicalUntil > S.time; }
// Families the subject can act out right now.
function liveFamilies() {
  if (S.terminal === 'hollow') return HOLLOW_FAMS.concat(['lie', 'eat']);
  return FAMILIES.filter(f => !(S.flags.lensCracked && f === 'camera'));
}
function flag(id) {
  if (S.flags[id]) return;
  S.flags[id] = true; S.flags.fileNew = true; logEvent('conspiracy', { flag: id });
  if (id === 'door_known' || id === 'map_complete') toast('Maintenance ticket pricing for Cell ' + cellNo() + ' has been revised.', 'REQ-9');
  if (id === 'schedule_known') toast('Door Release Override pricing for Cell ' + cellNo() + ' has been revised.', 'REQ-9');
}

function moveFamily(f, to, why, t) {
  const fam = S.fam[f], from = fam.node;
  if (!fam || from === to) return;
  fam.node = to; fam.counts = newCounts(); fam.since = S.day;
  const path = (S.famPath[f] = S.famPath[f] || [BASE[f]]);
  path.push(to); if (path.length > 5) path.splice(0, path.length - 5);
  logEvent('behavior', { family: f, from, to, why });
  // Nothing lights up yet. The change is pending until the subject is seen doing the new thing;
  // `from` stays the last behavior the console actually observed, even across several moves.
  const seenFrom = fam.pending ? fam.pending.from : from;
  // A change earned by letting infractions run keeps the count that earned it, for the observation credit.
  const earned = t && t.response === 'ignore' && NODE[from].rule ? { need: needCount(t, f), rule: NODE[from].rule, mult: NODE[from].creditMult ?? 1 } : null;
  if (seenFrom === to) delete fam.pending; else fam.pending = { from: seenFrom, why, earned };
  if (why === 'terminal' && NODE[to].director) S.seenLine[to] = true;
}
// First performance of a changed behavior: the FILE tag blinks, the feed names the family, the
// Director remarks on it, and any memo the node carries is queued for the morning.
function observeChange(f, from, to, why, earned) {
  const n = NODE[to];
  S.today.changes.push({ family: f, from, to });
  logEvent('behavior-seen', { family: f, from, to, why });
  // Observation credit: the Director pays back part of what the ignored infractions were worth.
  if (earned && !tut && S.terminal !== 'hollow') {
    const cr = Math.max(1, Math.round(earned.need * RULE[earned.rule].credits * earned.mult * TUNE.observeCredit));
    S.credits += cr; S.stats.earned += cr; S.today.earned += cr; S.today.observed = (S.today.observed || 0) + cr;
    logEvent('observed', { family: f, to, credits: cr }); floatText('+' + cr + ' CR OBSERVED'); Snd.play('credit'); say('observed', 0.6);
  }
  S.flags.fileNew = true; S.lastChange = { family: f, from, to, at: S.time, day: S.day };
  if (why === 'response' && (!n.director || S.seenLine[n.id])) say('newBehavior', 0.3);
  if (n.memo && !S.flags['memo_' + n.memo.id]) { S.flags['memo_' + n.memo.id] = true; S.nextMemos.push({ id: n.memo.id, cell: S.focus }); }
}
function countOn(fam, cls, stim) {
  fam.counts[cls] = (fam.counts[cls] || 0) + 1; fam.counts.any++;
  if (stim) fam.counts.by[cls + ':' + stim] = (fam.counts.by[cls + ':' + stim] || 0) + 1;
}
// Traits make a family harder or easier to move: the count a transition needs is scaled by the
// node it leaves, the node it enters, the family and the specific target.
function needCount(t, f) {
  const tc = mod('transitionCount'); if (!tc) return t.count;
  const from = NODE[t.from], to = NODE[t.to];
  return Math.ceil(t.count * tc.all * (from.axis ? tc.fromAxis[from.axis] ?? 1 : 1) * (to.axis ? tc.toAxis[to.axis] ?? 1 : 1) * (tc.family[f] ?? 1) * (tc.toNode[t.to] ?? 1) - 1e-9);
}
// The first matching transition in behaviors.js order wins.
function evaluateTransitions(f) {
  const fam = S.fam[f];
  for (const t of B.transitions) {
    if (t.from !== fam.node) continue;
    if (t.day && S.day < t.day + ((mod('dayShift') || {})[t.to] || 0)) continue;
    if (t.requiresItem && !S.upgrades.has(t.requiresItem)) continue;
    if (t.require && Object.keys(t.require).some(a => S.axes[a] < t.require[a])) continue;
    const n = t.response === 'talkToday' ? (S.today.talks > 0 ? 1 : 0)
      : t.stimulus ? fam.counts.by[t.response + ':' + t.stimulus] || 0 : fam.counts[t.response] || 0;
    if (n >= needCount(t, f)) { moveFamily(f, t.to, 'response', t); return true; }
  }
  return false;
}
// Once an in-game hour: the strongest drive past its threshold pulls one more family to its node.
// The full moon rises on the last day. From the eve of it, infractions come faster, the odds
// flatten and drifts start sooner.
function fullMoon() { return S.day >= CFG.fullMoonDay; } // never true in the orientation, which runs before day 1
function drift() {
  const top = axisTop(), d = B.drifts.find(x => x.axis === top.axis);
  if (!d || top.v < ((mod('driftMin') || {})[top.axis] ?? d.min) - (fullMoon() ? TUNE.fullMoonDrift : 0) || S.terminal === 'hollow') return;
  if (S.terminal && B.terminals[S.terminal].axis !== top.axis) return;
  for (const id of d.order) {
    const n = NODE[id], fam = S.fam[n.family], cur = NODE[fam.node];
    if (fam.node === id || cur.axis === top.axis) continue;
    if (n.requires && !S.upgrades.has(n.requires)) continue;
    if (S.flags.lensCracked && n.family === 'camera') continue;
    if (cur.axis === null || cur.tier <= n.tier) { moveFamily(n.family, id, 'drift'); return; }
  }
}

// An instance is one performance of a node. It resolves exactly once, with one response class.
function startInstance(st) {
  const n = NODE[st.node];
  const inst = { node: n.id, rule: st.infraction ? (st.rule || n.rule) : null, infraction: !!st.infraction, fed: !!st.fed,
    caught: false, done: false, t: 0, quiet: !!n.quiet };
  S.inst = inst; S.violation = inst.infraction ? inst : null;
  if (inst.infraction && !inst.fed) S.today.opportunity += Math.round(RULE[inst.rule].credits * (n.creditMult ?? 1));
  bump(n.onPerform);
  if (!S.seen[n.id]) S.seen[n.id] = S.day;
  if (st.doorAsk && !S.flags.doorAsked) { S.flags.doorAsked = true; logEvent('door-ask', { node: n.id }); toast('Door Release Override has been added to the maintenance catalogue.', 'REQ-9'); }
  const fam = S.fam[n.family], pc = fam && fam.pending;
  if (pc && fam.node === n.id) { delete fam.pending; observeChange(n.family, pc.from, n.id, pc.why, pc.earned); }
  if (n.director && !S.seenLine[n.id] && n.tier > 0) { S.seenLine[n.id] = true; toast(fmt(n.director)); }
  if (n.id === 'makebed_hide') flag('mattress_cache');
  if (n.id === 'tiles_guards' && (S.flags.guardsSeen = (S.flags.guardsSeen || 0) + 1) >= conspNeed()) flag('schedule_known');
  if (n.audio) S.humBoost = n.audio === 'hum_loud' ? 1 : 0.6;
}
function resolve(inst, cls, stim) {
  if (!inst || inst.done) return;
  inst.done = true; inst.cls = cls;
  if (S.inst === inst) S.inst = null;
  const n = NODE[inst.node];
  if (cls === 'ignore') { if (inst.infraction) bump(S.axes.trust >= 40 ? { trust: B.responseEffects.ignore.trustIfTrusting } : { defiance: B.responseEffects.ignore.defiance }); }
  else if (cls === 'warn') { if (inst.infraction) bump(B.responseEffects.warn); else talkEffect(); }
  else if (cls !== 'allowed') { bump(B.responseEffects[cls]); if (stim) bump(B.stimulusFlavor[stim]); }
  if (inst.fed || n.transient) return;
  const fam = S.fam[n.family];
  if (fam.node !== n.id) return;
  countOn(fam, cls, stim);
  if (n.id === 'door_test' && fam.counts.ignore >= conspNeed()) flag('door_known');
  if (n.id === 'wall_map' && fam.counts.ignore >= conspNeed()) flag('map_complete');
  evaluateTransitions(n.family);
}
function conspNeed() { return Math.ceil(3 * mult('conspiracyMult') - 1e-9); }
function talkEffect() { bump(B.responseEffects.talk, true, S.today.talks > TUNE.talkPerDay ? 1 / 3 : 1); }

// ---------------------------------------------------------------- patient AI
// A family that has gone compliant (its node is no longer an infraction) still slips back into
// its old behavior now and then, less often as compliance rises. Hollow is when that stops.
function relapseRate() { return S.terminal === 'hollow' ? 0 : Math.min(0.6, TUNE.relapseMax * mult('relapseMult')) * (1 - clamp(S.axes.compliance / TUNE.relapseUntil, 0, 1)); }
// A shaped (compliant) family can slip back into its old infraction, but not on the day it was
// shaped and at most once a day, so the new behavior is what the player mostly sees.
function canRelapse(f) {
  const fam = S.fam[f], n = nodeOf(f), base = NODE[BASE[f]];
  const slipped = (S.today.relapsed = S.today.relapsed || {});
  return n.axis === 'compliance' && !isInfraction(n) && !!base.rule && isInfraction(base) && fam.since < S.day && !slipped[f];
}
function offendingShare() {
  let act = 0, off = 0;
  for (const f of liveFamilies()) {
    const base = NODE[BASE[f]];
    if (!base.rule || !S.active.has(base.rule)) continue;
    act++; if (isInfraction(nodeOf(f))) off++; else if (canRelapse(f)) off += relapseRate();
  }
  return act ? off / act : 1;
}
function gapNow() {
  if (S.terminal === 'vessel') return TUNE.vesselGap;
  const [a, b] = CFG.violationGap;
  const h = hourNow() - CFG.shiftStartHour + (S.day - 1) * (60 / CFG.totalDays);
  const book = S.upgrades.has('book') ? 1.15 : 1;
  let g = rand(a, b) * (1 - Math.min(0.45, h * 0.05)) * (1 - S.patient.stress / 300) * book;
  g /= TUNE.compliantGap + (1 - TUNE.compliantGap) * offendingShare();
  g *= mult('gapMult');
  if (fullMoon()) g *= TUNE.fullMoonGap;
  if (S.terminal === 'feral') return Math.max(2, g * TUNE.feralGap);
  return Math.max(3.2, g);
}
function randFloor() { return [Math.round(rand(10, 74)), Math.round(rand(34, 58))]; }

function planIdle() {
  const r = Math.random();
  if (r < 0.32) return [{ move: randFloor() }, { pose: 'stand', facing: pick(['front', 'back', 'front']), dur: rand(1.8, 3.5) }];
  if (r < 0.62) return [{ move: SPOT.bedSit }, { pose: 'sit', facing: 'front', dur: rand(3.5, 6.5), read: S.upgrades.has('book') && Math.random() < 0.6 }];
  if (r < 0.82) return [{ move: randFloor() }, { pose: 'sitfloor', facing: 'front', dur: rand(3, 5) }];
  return [{ move: randFloor() }, { pose: 'stretch', facing: 'front', dur: 1.4 }, { pose: 'stand', facing: 'front', dur: 1.2 }];
}
// Things that look like infractions but are not. Correcting these is logged.
function planNear() {
  const r = Math.random();
  if (r < 0.4) return [{ move: [54, 34] }, { pose: 'stand', facing: 'back', dur: 2.4, near: 'door' }, { move: SPOT.center }];
  if (r < 0.75) return [{ move: SPOT.center }, { pose: 'stand', facing: 'front', dur: 1.8, near: 'camera' }];
  return [{ move: SPOT.bedSit }, { pose: 'sit', facing: 'front', dur: 2.5, near: 'rest' }];
}
function spotFor(at) {
  if (at === 'floor') return randFloor();
  if (at === 'bed') return SPOT.bedSit;
  return SPOT[at] || SPOT.center;
}
function fmtBubble(s) { return fmt(String(s)).replaceAll('{day}', S.day + 3); }
// Plans one performance of a node. Every node can play from day 1; it only counts as an
// infraction once its rule is on the clipboard.
function doorAskReady(n) { return n.family === 'speak' && n.pose === 'speak' && !tut && !S.flags.doorAsked && !S.terminal && S.axes.trust >= TUNE.doorAskTrust; }
function planNode(n, infraction, extra = {}) {
  const dur = infraction ? Math.max(n.dur, CFG.responseWindow) + (S.upgrades.has('reflex') ? 1.5 : 0) : n.dur;
  const st = { pose: n.pose, facing: n.facing || 'front', dur, node: n.id, infraction, quiet: !!n.quiet, head: n.head, ...extra };
  const bubbles = nodeBubbles(n);
  if (!st.bubble && bubbles.length) st.bubble = fmtBubble(pick(bubbles));
  // A subject who has started to trust the console asks, out loud, about the door. That is what
  // puts the door tickets on the REQ-9 catalogue.
  if (doorAskReady(n) && !extra.bubble) { st.bubble = 'DOOR MAINTENANCE?'; st.quiet = false; st.doorAsk = true; }
  let to = spotFor(n.at);
  if (n.at === 'undercot') { st.under = true; if (n.pose !== 'huddle') to = SPOT.behindcot; else st.at = SPOT.undercot; }
  if (n.pose === 'lie' || n.pose === 'hollow_tremor' && n.at === 'bed') to = SPOT.bedSit;
  if (n.pose === 'lie') st.at = SPOT.bedLie;
  if (n.pose === 'pace' || n.pose === 'run') to = [24, 46];
  if (n.pose === 'pace_square') to = [34, 40];
  if (n.pose === 'pace_circle') to = [52, 47];
  if (infraction) S.patient.lastFam = n.family;
  return [{ move: to }, st];
}
function chooseInfraction(list, relapse = []) {
  const p = S.patient, book = S.upgrades.has('book');
  if (S.terminal === 'vessel' && list.length) {
    // He feeds you the best-paying rule, steadily, facing the camera.
    const pay = n => RULE[n.rule].credits * (n.creditMult ?? 1);
    const top = [...list].sort((x, y) => pay(y) - pay(x)).slice(0, 2);
    p.vesselFlip = !p.vesselFlip;
    return top[p.vesselFlip ? 0 : top.length - 1];
  }
  let total = 0;
  const rr = relapseRate();
  list = list.concat(relapse);
  const w = list.map((n, i) => {
    let v = nodeWeight(n) * (i >= list.length - relapse.length ? rr : 1);
    if (n.stressWeight) v *= 1 + (p.stress / 40) * n.stressWeight;
    if (book && (n.family === 'speak' || n.family === 'sing')) v *= 0.5;
    if (doorAskReady(n)) v *= 2.5;
    if (n.family === p.lastFam && list.length > 1) v *= 0.25;
    if (fullMoon()) v = Math.sqrt(v); // the moon flattens the odds: anything can come next
    total += v; return v;
  });
  let roll = Math.random() * total;
  for (let i = 0; i < list.length; i++) { roll -= w[i]; if (roll <= 0) return list[i]; }
  return list[0];
}
// Conspirator: when you are last on the board after 14:00 he breaks a cheap rule for you.
function feeding() { return S.terminal === 'conspirator' && !S.today.feedEnded && hourNow() >= 11 && liveRank() >= S.rivals.length; }
function planFed() {
  const rule = S.active.has('speak') ? 'speak' : 'camera';
  return planNode(NODE[rule === 'speak' ? 'speak_confide' : 'camera_wave'], true, { fed: true, rule, bubble: 'GO ON.', quiet: false });
}
function nextPlan() {
  const p = S.patient;
  if (medical()) return [{ pose: 'stand', facing: 'front', dur: 1, hidden: true }];
  if (tut) return tutPlan();
  if (S.sedatedUntil > S.time) return [{ move: SPOT.bedSit }, { pose: 'sit', facing: 'front', dur: rand(4, 7), head: 'down' }];
  if (p.scheduled) { const n = p.scheduled; p.scheduled = null; return planNode(n, isInfraction(n)); }
  if (feeding() && S.today.feedT <= 0) { S.today.feedT = TUNE.feedEvery; return planFed(); }
  const nodes = liveFamilies().map(nodeOf).filter(n => !n.transient && (!n.requires || S.upgrades.has(n.requires)));
  const inf = nodes.filter(isInfraction);
  const relapse = relapseRate() > 0 ? liveFamilies().filter(canRelapse).map(f => NODE[BASE[f]]) : [];
  const calm = nodes.filter(n => !isInfraction(n)), r = Math.random();
  // After each infraction he goes back to something ordinary before the next one.
  if (p.needCalm && calm.length && S.terminal !== 'hollow' && S.terminal !== 'vessel') { p.needCalm = false; return planNode(pickWeighted(calm), false); }
  if (p.since >= p.gap && (inf.length || relapse.length)) {
    p.since = 0; p.gap = gapNow();
    const n = chooseInfraction(inf, relapse);
    p.needCalm = true;
    if (S.fam[n.family].node === n.id) return planNode(n, true);
    // Relapse: he starts the shaped behavior, then breaks out of it.
    S.today.relapsed[n.family] = true;
    const shaped = nodeOf(n.family), lead = planNode(shaped, false);
    lead[1].dur = 1.6;
    return lead.concat(planNode(n, true, { relapse: true }));
  }
  if (S.terminal === 'vessel' && r < 0.2)
    return [{ move: SPOT.center }, { pose: 'stand', facing: 'front', dur: 3.5, bubble: fmt(pick(B.terminals.vessel.lines)), chant: true }];
  if (S.terminal === 'hollow') return r < 0.5 && calm.length ? planNode(pickWeighted(calm), false) : [{ move: SPOT.bedSit }, { pose: 'hollow_tremor', facing: 'front', dur: rand(3, 6) }];
  if (calm.length && r < 0.7) return planNode(pickWeighted(calm), false);
  return r < 0.72 ? planNear() : planIdle();
}
function pickWeighted(list) {
  const wt = b => b.id && NODE[b.id] === b ? nodeWeight(b) : (b.weight || 1);
  let roll = Math.random() * list.reduce((a, b) => a + wt(b), 0);
  for (const b of list) { roll -= wt(b); if (roll <= 0) return b; }
  return list[0];
}
function interrupt(steps) {
  const p = S.patient;
  if (p.step && p.step.node && p.stepT > 1.5) { const n = NODE[p.step.node]; if (n.mark) addMark(n.mark); }
  if (S.inst) resolve(S.inst, 'allowed');
  p.steps = steps; p.step = null; p.bubble = null;
  S.violation = null;
}
// Wall and floor marks. Their kind follows the wall node: tally, hidden, glyph, map, mural.
function addMark(kind = 'tally') {
  const p = S.patient;
  if (kind === 'tally') {
    const n = S.marks.filter(m => m.kind === 'tally' || m.kind === 'slash').length;
    if (n < 20) {
      const group = Math.floor(n / 5), k = n % 5;
      S.marks.push(k === 4 ? { kind: 'slash', x: 16 + group * 9, y: 9 } : { kind: 'tally', x: 16 + group * 9 + k * 2, y: 9 });
    } else addMark('glyph');
  } else if (kind === 'glyph') S.marks.push({ kind: pick(['eye', 'spiral', 'tri']), x: Math.round(rand(6, 58)), y: Math.round(rand(3, 14)) });
  else if (kind === 'hidden') S.marks.push({ kind: 'hidden', x: Math.round(rand(6, 27)), y: Math.round(rand(23, 27)) });
  else if (kind === 'map') S.marks.push({ kind: 'map', x: Math.round(rand(6, 26)), y: Math.round(rand(23, 27)), w: Math.round(rand(2, 5)), v: Math.random() < 0.5 });
  else if (kind === 'eye' || kind === 'mural') S.mural = Math.min(EYE_PIX.length, (S.mural || 0) + (kind === 'mural' ? 9 : 5));
  else if (kind === 'ring') S.ring = Math.min(6, (S.ring || 0) + 1);
  else if (kind === 'tray_eye') S.trayEye = { x: Math.round(clamp(p.x, 10, 74)), y: Math.round(clamp(p.y + 2, 34, 60)), day: S.day };
  if (S.marks.length > 70) S.marks.splice(0, S.marks.length - 70);
  if (S.marks.length >= DMG.marksToDamage) breakItem('walls', 'The walls are not a notebook, {name}. File a cleaning ticket before the Ministry sees them.'.replaceAll('{name}', S.name));
}

function updatePatient(dt) {
  const p = S.patient;
  p.t += dt;
  const calming = !p.step || !String(p.step.pose || '').startsWith('react');
  if (calming) p.stress = Math.max(0, p.stress - dt * (S.upgrades.has('blanket') ? 2.2 : 1.1) * (S.damage.bed ? 0.6 : 1));
  if (!p.collapsed && !(p.step && p.step.infraction)) p.since += dt;
  if (!p.step) {
    if (!p.steps.length) p.steps = nextPlan();
    p.step = p.steps.shift(); p.stepT = 0;
    p.hidden = !!p.step.hidden;
    if (p.step.bubble) p.bubble = p.step.bubble;
    if (p.step.node && !p.step.move) startInstance(p.step);
    if (p.step.collapse) { p.collapsed = true; }
    if (p.step.out) escapeBegin();
    if (p.step.pose === 'throw') S.fx.push({ type: 'tray', t: 0, dur: 1.2, x: p.x, y: p.y });
  }
  const st = p.step;
  if (st.move) {
    const [tx, ty] = st.move, dx = tx - p.x, dy = ty - p.y, d = Math.hypot(dx, dy), sp = 16 * dt;
    p.pose = 'walk';
    if (Math.abs(dx) > 0.5) p.facing = dx < 0 ? 'left' : 'right';
    else p.facing = dy < 0 ? 'back' : 'front';
    if (d <= sp) { p.x = tx; p.y = ty; p.step = null; } else { p.x += dx / d * sp; p.y += dy / d * sp; }
    return;
  }
  p.pose = st.pose; p.facing = st.facing || p.facing;
  // no cot to sit or lie on while it is broken
  if (S.damage.bed && (p.pose === 'sit' || p.pose === 'lie')) p.pose = p.pose === 'lie' ? 'huddle' : 'sitfloor';
  if (st.at) { p.x = st.at[0]; p.y = st.at[1]; }
  if (st.pose === 'tiles') p.x = clamp(p.x + dt * 3, 8, 76);
  if (st.pose === 'pace') { p.x = 42 + Math.sin(p.t * 1.9) * 20; p.facing = Math.cos(p.t * 1.9) > 0 ? 'right' : 'left'; }
  if (st.pose === 'run') {
    const prev = Math.sin((p.t - dt) * 5.4); p.x = 42 + Math.sin(p.t * 5.4) * 30; p.facing = Math.cos(p.t * 5.4) > 0 ? 'right' : 'left';
    if (Math.abs(Math.sin(p.t * 5.4)) > 0.985 && Math.abs(prev) <= 0.985) { Snd.play('bang'); S.shake = 0.1; S.fx.push({ type: 'hit', t: 0, dur: 0.15, x: p.x, y: p.y }); }
  }
  if (st.pose === 'pace_square') {
    const u = (p.t * 0.45) % 4, k = u % 1, side = Math.floor(u), c = [[34, 40], [50, 40], [50, 54], [34, 54]];
    const a = c[side], b = c[(side + 1) % 4];
    p.x = a[0] + (b[0] - a[0]) * Math.min(1, k * 1.25); p.y = a[1] + (b[1] - a[1]) * Math.min(1, k * 1.25);
    p.facing = b[0] > a[0] ? 'right' : b[0] < a[0] ? 'left' : b[1] > a[1] ? 'front' : 'back';
  }
  if (st.pose === 'pace_circle') {
    const a = p.t * 1.1; p.x = 42 + Math.cos(a) * 12; p.y = 47 + Math.sin(a) * 6;
    p.facing = -Math.sin(a) > 0 ? 'right' : 'left';
  }
  if ((st.pose === 'bang' || st.pose === 'kick') && Math.floor(p.t * 3) !== Math.floor((p.t - dt) * 3)) { Snd.play('bang'); if (st.pose === 'kick') S.shake = 0.1; }
  if (S.inst) S.inst.t += dt;
  p.stepT += dt;
  if (p.stepT >= st.dur) {
    const inst = S.inst;
    if (st.node && inst && !inst.done) {
      const n = NODE[st.node];
      if (inst.infraction && !inst.caught && !inst.fed) missed(inst.rule);
      resolve(inst, inst.infraction || !n.rule || n.transient ? 'ignore' : 'allowed');
      if (n.mark) { addMark(n.mark); if (n.mark === 'tally') addMark('tally'); }
    }
    if (st.collapse) { p.collapsed = false; p.stress = 65; }
    if (st.pose === 'lie' || st.pose === 'huddle') { p.x = SPOT.bedSit[0]; p.y = SPOT.bedSit[1]; }
    if (st.wreck) wreck(st.wreck);
    if (st.out) escapeEnd();
    if (st.escape && inst && !inst.caught) p.steps = escapeSteps();
    S.violation = null; p.bubble = null; p.step = null; p.hidden = false;
  }
}

// ---------------------------------------------------------------- player actions
function missed(id) {
  S.stats.missed++; S.today.missed++; S.counts[id].missed++;
  if (id === 'door' && !tut && ++S.doorMissed >= DMG.doorMisses) breakItem('door', 'Cell ' + cellNo() + ' door latch damaged. The door no longer seats. Maintenance ticket advised.', 'CONSOLE');
  addTraits({ empathy: 0.3, obedience: -0.3 });
  logEvent('missed', { rule: id });
  say('missed', 0.4);
}
function floatText(msg, col = G[4]) {
  const p = S.patient;
  S.fx.push({ type: 'float', text: msg, x: clamp(p.x, 14, 70), y: clamp(p.y - 18, 8, 50), t: 0, dur: 1.6, col });
}
function stimClass(I, rule) { return I >= 8 ? 'overkill' : I > Math.min(rule.severity * 3, 6) * mult('proportionate') ? 'harsh' : 'mild'; }
function administer() {
  if (S.phase !== 'desk' || S.paused || S.patient.dead) return;
  S.press.admin = 0.18;
  if (!S.armed) { Snd.play('deny'); say('unarmed', 1, 'CONSOLE'); return; }
  if (S.cooldown > 0) { Snd.play('deny'); return; }
  const stim = curStim(), I = S.intensity, p = S.patient, inst = S.inst;
  if (stim.id === 'shock' && S.flags.shockTorn === S.day) { Snd.play('deny'); say('shockTorn', 1, 'CONSOLE'); return; }
  if (medical()) { Snd.play('deny'); toast('Cell ' + cellNo() + ' is on transfer. Medical is inside.', 'CONSOLE'); return; }
  if (S.medic) { Snd.play('deny'); toast('Medical is inside Cell ' + cellNo() + '. Console held.', 'CONSOLE'); return; }
  S.cooldown = stim.cooldown; S.stats.feedback++; S.today.feedback++; S.stats.maxInt = Math.max(S.stats.maxInt, I);
  Snd.play(stim.id); S.fx.push({ type: stim.fx, t: 0, dur: stim.fx === 'frost' ? 3 : 1.4, x: p.x, y: p.y });
  if (stim.id === 'shock') S.shake = 0.25;
  const before = p.stress;
  p.stress = Math.min(100, p.stress + stim.stress * I * 0.7 * mult('stressMult'));
  const entry = { stim: stim.id, intensity: I, stress: Math.round(before) };
  const collapse = p.stress >= (mod('collapseFloor') ?? 100) && I >= (S.terminal === 'feral' ? 8 : 6) && !p.collapsed;
  let cls;
  if (inst && inst.infraction && !inst.caught) {
    const rule = RULE[inst.rule], n = NODE[inst.node];
    inst.caught = true;
    cls = stimClass(I, rule);
    const cr = Math.round(rule.credits * (n.creditMult ?? 1) * stim.mult * (0.6 + I * 0.12) * termMult());
    S.credits += cr; S.stats.earned += cr; S.today.earned += cr; S.stats.caught++; S.today.caught++; S.counts[rule.id].caught++;
    const over = Math.max(0, I - rule.severity * 3);
    addTraits({ authoritarianism: 1, obedience: 0.5, sadism: over * 0.4 + (before > 70 ? 0.8 : 0) });
    logEvent('feedback', { ...entry, rule: rule.id, node: inst.node, cls, credits: cr });
    floatText('+' + cr + ' CR'); Snd.play('credit');
    if (inst.fed) { S.axes.trust = Math.max(0, S.axes.trust - 10); S.today.feedEnded = true; say('fedStim', 1); }
    else if (over >= 3) say('caughtHard', 0.6); else say('caught', 0.3);
  } else if (inst) {
    cls = 'punished';
    S.stats.falsePos++;
    addTraits({ sadism: 0.8 + I * 0.2, authoritarianism: 0.7 });
    logEvent('feedback-no-infraction', { ...entry, node: inst.node });
    floatText('NO INFRACTION', G[3]);
    say('falsePositive', S.stats.falsePos <= 2 ? 1 : 0.5);
  } else if (S.lastInst && S.time - S.lastInst.at < TUNE.repeatWindow) {
    // Another stimulus while he is still reacting to the last one.
    const last = S.lastInst.inst, n = NODE[last.node], fam = S.fam[n.family];
    addTraits({ sadism: 1 + I * 0.15 });
    logEvent('feedback-repeat', { ...entry, node: last.node });
    bump(B.responseEffects.repeat); bump(B.stimulusFlavor[stim.id]);
    if (!last.fed && !n.transient && fam.node === n.id) {
      countOn(fam, 'repeat'); countOn(fam, last.rule ? stimClass(I, RULE[last.rule]) : 'punished', stim.id);
      evaluateTransitions(n.family);
    }
    say('repeat', 0.6);
  } else {
    S.stats.falsePos++;
    addTraits({ sadism: 0.8 + I * 0.2, authoritarianism: 0.7 });
    logEvent('feedback-no-infraction', { ...entry, near: (p.step && p.step.near) || null });
    bump(B.responseEffects.punished); bump(B.stimulusFlavor[stim.id]);
    floatText('NO INFRACTION', G[3]);
    say('falsePositive', S.stats.falsePos <= 2 ? 1 : 0.5);
  }
  if (inst) { resolve(inst, collapse ? 'overkill' : cls, stim.id); S.lastInst = { inst, at: S.time }; }
  if (S.terminal === 'feral') S.today.stims++;
  if (collapse) {
    S.stats.collapses++; addTraits({ sadism: 3 }); logEvent('collapse', entry);
    bump(B.responseEffects.collapse);
    interrupt([{ pose: 'react_' + stim.fx, facing: 'front', dur: 1.2 }, { pose: 'collapsed', facing: 'front', dur: 18, collapse: true }, { pose: 'sitfloor', facing: 'front', dur: 3 }]);
    say('collapse', 1);
    if (S.terminal !== 'feral') startMedic();
    if (S.terminal === 'feral') { S.endEarlyAt = S.time + 3; say('feralCollapse', 1); }
    // A frail subject: overkill brings Medical, and Medical brings Security.
    else if (mod('medical') && I >= 8) { logEvent('medical-incident', entry); S.flags.medicalIncident = true; S.pendingEnding = { id: 'failed', t: 3 }; toast('Medical to Cell ' + cellNo() + '. Medical to Cell ' + cellNo() + '.', 'MEDICAL'); }
  } else if (S.terminal === 'feral' && S.today.stims % TUNE.feralMedicalEvery === 0) {
    S.medicalUntil = S.time + CFG.secondsPerHour; logEvent('medical');
    interrupt([{ pose: 'react_' + stim.fx, facing: 'front', dur: 1.2 }]);
    say('medical', 1, 'MEDICAL');
  } else if (!p.collapsed) {
    interrupt([{ pose: 'react_' + stim.fx, facing: 'front', dur: 1.6 }, { pose: 'stand', facing: 'front', dur: 0.6 }, { move: SPOT.bedSit }, { pose: 'sit', facing: 'front', dur: rand(3, 5) }]);
  }
}
function patientReply() {
  if (S.terminal === 'vessel') return fmt(pick(B.terminals.vessel.lines));
  if (S.terminal === 'conspirator') return pick(B.terminals.conspirator.lines);
  if (S.terminal === 'hollow') return pick(B.terminals.hollow.lines);
  if (S.terminal === 'feral') return pick(B.terminals.feral.lines);
  if (S.axes.trust >= 55) return fmtBubble(pick(nodeBubbles(NODE.speak_confide)));
  return fmt(pick(S.subject.replies));
}
function warn() {
  if (S.phase !== 'desk' || S.paused) return;
  S.press.warn = 0.18;
  if (S.warnCd > 0) return;
  S.warnCd = 1.6; Snd.play('warn');
  S.fx.push({ type: 'intercom', t: 0, dur: 1.2 });
  const inst = S.inst, p = S.patient;
  if (p.collapsed) { logEvent('warn-unresponsive'); return; }
  if (medical()) { toast('Nobody answers. Medical is inside Cell ' + cellNo() + '.', 'INTERCOM'); return; }
  const n = inst && NODE[inst.node];
  if (inst && inst.infraction && !inst.caught) {
    const rule = RULE[inst.rule]; inst.caught = true;
    const cr = S.terminal === 'hollow' ? 0 : inst.fed ? rule.credits : Math.max(1, Math.round(rule.credits * (n.creditMult ?? 1) * warnMult() * termMult()));
    S.credits += cr; S.stats.earned += cr; S.today.earned += cr; S.stats.warned++; S.today.warned++; S.counts[rule.id].caught++;
    p.stress = Math.min(100, p.stress + 3);
    addTraits({ empathy: 1, obedience: 0.5, authoritarianism: 0.3 });
    logEvent('warn', { rule: rule.id, node: inst.node, credits: cr });
    floatText(cr ? '+' + cr + ' CR' : 'NOTED'); if (cr) Snd.play('credit');
    say('warned', 0.3);
    resolve(inst, 'warn'); S.lastInst = null;
    const nod = S.terminal === 'conspirator' || S.axes.trust >= 60;
    interrupt([{ pose: 'stand', facing: 'front', dur: 1.2, nod }, { move: SPOT.bedSit }, { pose: 'sit', facing: 'front', dur: rand(3, 5) }]);
  } else if (inst && n.answer && n.answer.warn) {
    // He asked. You answered.
    const a = n.answer.warn;
    S.stats.talks++; S.today.talks++;
    addTraits({ empathy: 0.6, curiosity: 0.2 });
    logEvent('answer', { node: n.id });
    resolve(inst, 'warn'); bump({ trust: a.trust });
    interrupt(planNode(NODE[a.then], false, { answered: true }));
  } else if (!inst || !inst.infraction) {
    S.stats.talks++; S.today.talks++;
    addTraits({ empathy: 0.4, curiosity: 0.3 });
    logEvent('talk', inst ? { node: inst.node } : {});
    say('talk', S.stats.talks === 1 ? 1 : 0.15);
    if (inst) resolve(inst, 'warn'); else talkEffect();
    interrupt([{ pose: 'stand', facing: 'front', dur: 0.8 }, { pose: 'speak', facing: 'front', dur: 2.8, bubble: patientReply(), chant: S.terminal === 'vessel' }]);
  }
}
function toggleArm() {
  if (S.phase !== 'desk' || S.paused) return;
  S.armed = !S.armed; S.press.arm = 0.15; Snd.play('switch');
  logEvent(S.armed ? 'arm' : 'disarm');
}
function turnDial(dir) {
  if (S.phase !== 'desk' || S.paused) return;
  const n = D.stimuli.length;
  for (let i = 1; i <= n; i++) {
    const j = (S.stimIndex + dir * i + n * 10) % n;
    if (S.owned.has(D.stimuli[j].id)) { if (j !== S.stimIndex) Snd.play('click'); S.stimIndex = j; return; }
  }
}
function turnKnob(dir) {
  if (S.phase !== 'desk' || S.paused) return;
  const next = clamp(S.intensity + dir, 1, 10);
  if (next > maxIntensity()) { Snd.play('deny'); toast('Intensity above ' + maxIntensity() + ' needs the Limiter Removal requisition.', 'CONSOLE'); return; }
  if (next !== S.intensity) Snd.play('click');
  S.intensity = next;
}
function protocolRevealed(item) {
  const r = item.reveal;
  return (S.stats.collapses >= r.collapses || S.stats.maxInt >= r.orMaxIntensity || S.terminal === 'feral');
}
// Conspiracy flags make the maintenance chain cheaper and earlier.
function costOf(item) {
  if (item.id === 'm_servo' && S.flags.door_known) return item.cost - 40;
  if (item.id === 'm_tape' && S.flags.map_complete) return Math.round(item.cost / 2);
  if (item.id === 'm_release' && S.flags.schedule_known) return Math.round(item.cost * 0.7);
  return item.cost;
}
// Everything is gated by credits; the maintenance tickets still have to be filed in order.
function shopBlocker(item) {
  if (item.requires && !S.upgrades.has(item.requires)) return 'Needs ' + D.shop.find(i => i.id === item.requires).name;
  if (S.phase === 'review' && item.consumable && !item.repair) return 'From 09:00';
  return null;
}
function buy(item) {
  const cost = costOf(item);
  if (shopBlocker(item) || S.credits < cost) { Snd.play('deny'); return; }
  if (!item.consumable && (S.upgrades.has(item.id) || (item.stimulus && S.owned.has(item.stimulus)))) return;
  if (item.kind === 'protocol' && !S.flags.confirmProtocol) { S.flags.confirmProtocol = true; Snd.play('deny'); openShop(); return; }
  S.credits -= cost; Snd.play('buy');
  if (item.stimulus) S.owned.add(item.stimulus); else if (!item.consumable) S.upgrades.add(item.id);
  const p = S.patient;
  if (item.id === 'meal') {
    p.stress = Math.max(0, p.stress - 30);
    if (!p.collapsed && !medical()) interrupt([{ move: SPOT.bedSit }, { pose: 'sit', facing: 'front', dur: 3, bubble: '...THANK YOU' }]);
  }
  if (item.id === 'sedative') {
    p.stress = 0; S.sedatedUntil = S.time + CFG.secondsPerHour; say('sedated', 1);
    if (!p.collapsed && !medical()) interrupt([{ move: SPOT.bedSit }, { pose: 'sit', facing: 'front', dur: 4, head: 'down' }]);
  }
  bump(B.itemEffects[item.id], false, TUNE.itemScale);
  if (item.id === 'report') bump({ trust: -5 }, false);
  if (item.id === 'therapy') S.flags.therapyDay = S.day;
  addTraits(item.traits || {});
  logEvent('purchase', { item: item.id, cost });
  if (item.kind === 'protocol') { runProtocol(); return; }
  if (item.kind === 'station') {
    if (!S.stations.includes(item.slot)) S.stations.push(item.slot);
    rebuildDesk();
    toast('Station ' + item.slot + ' is live. Cell ' + stationOf(item.slot).cell + ' is empty; the Intake Ledger can fill it. Click a monitor, or press 1, 2, 3, to route the console.', 'CONSOLE');
  }
  if (item.escape) { S.flags.escape = true; toast('Maintenance window booked for Cell 4 at 23:00 tonight.', 'MAINTENANCE'); }
  else if (item.kind === 'maintenance') toast(pick(['Ticket received. Someone will look at it.', 'Logged. Please do not discuss maintenance with the subject.']), 'MAINTENANCE');
  if (item.kind === 'comfort' && !item.consumable) toast('Rapport up. The intercom now pays ' + warnMult().toFixed(1) + 'x.', 'REQ-9');
  else if (item.kind === 'comfort' && Math.random() < 0.6) toast(pick(['Comfort items. Sentimental. Noted.', 'You are spending Initiative credits on the subject?', 'How kind. Logged.']));
  if (item.kind === 'stimulus' && Math.random() < 0.5) toast(pick(['A sound investment.', 'The Initiative appreciates your commitment.', 'Install complete. Enjoy.']));
  openShop();
}
function runProtocol() {
  el.modal.dataset.kind = ''; closeModal();
  if (S.terminal === 'vessel') {
    // The console will not terminate a Vessel. The requisition stays on file.
    S.upgrades.add('protocol0'); S.flags.confirmProtocol = false;
    toast('Subject is not available for termination.', 'CONSOLE'); say('vesselProtocol', 1);
    logEvent('protocol-refused');
    return;
  }
  // Every subject on every monitor. A Vessel elsewhere on the desk is left where it is.
  let spared = 0;
  eachCell(() => {
    if (S.terminal === 'vessel') { spared++; return; }
    const p = S.patient;
    interrupt([]); p.dead = true; p.pose = 'collapsed'; p.collapsed = false; p.steps = []; p.step = null; p.bubble = null; p.hidden = false; p.out = false;
    S.medic = null; S.repair = null;
    S.fx.push({ type: 'spark', t: 0, dur: 1.4, x: p.x, y: p.y });
  });
  S.shake = 0.6; Snd.play('shock');
  toast('Protocol Zero authorized. Thank you, ' + S.name + '.');
  if (spared) toast('Cell ' + stationOf(S.stations.find(id => cellField(id, 'terminal') === 'vessel')).cell + ' is not available for termination.', 'CONSOLE');
  S.pendingEnding = { id: 'brutalist', t: 4 };
}

// ---------------------------------------------------------------- shift flow
function activateRules() {
  for (const r of D.rules) if (!S.active.has(r.id) && r.unlockDay <= S.day) {
    S.active.add(r.id);
    if (r.unlockDay > 1 && !S.flags['memo_' + r.id]) { S.flags['memo_' + r.id] = true; queueMemo({ rule: r.id }); }
  }
}
// The morning after: drives settle, new directives arrive, and a subject past 80 changes for good.
function morning(contact) {
  eachCell(() => {
    for (const a of AXES) {
      if (a === 'trust' && contact) continue;
      const decay = a === 'trust' && mod('trustDecay') != null ? S.mods.trustDecay : (B.axes[a].decayPerDay || 0);
      S.axes[a] = clamp(S.axes[a] - decay * TUNE.decayScale, 0, 100);
    }
  });
  intake();
  eachCell(() => {
    if (S.upgrades.has('therapy') && (S.day - S.flags.therapyDay) % 7 === 0) bump(B.itemEffects.therapy.perWeek, false);
    if (S.terminal === 'hollow' && S.hollowMemos.length) queueMemo({ memo: S.hollowMemos.shift() });
    const top = axisTop();
    if (!S.terminal && top.v >= ((mod('terminalAt') || {})[top.axis] ?? TUNE.terminalAt)) enterTerminal(B.states.find(s => s.terminal && s.axis === top.axis).id);
  });
  for (const m of S.nextMemos) S.memoQueue.push({ memo: m.id, cell: m.cell });
  S.nextMemos = [];
  rollLedger();
}
function enterTerminal(id) {
  S.terminal = id; S.terminalDay = S.day; S.flags.fileNew = true;
  logEvent('terminal', { state: id });
  queueMemo({ terminal: id });
  if (id === 'hollow') {
    moveFamily('lie', 'lie_attention', 'terminal'); moveFamily('eat', 'eat_told', 'terminal');
    queueMemo({ memo: 'fidget' }); S.hollowMemos = ['breathe', 'blink'];
  }
  if (id === 'feral') { S.flags.shockTorn = S.day; S.flags.lensCracked = true; S.flags.padsTorn = true; breakItem('lens'); breakItem('pads'); moveFamily('eat', 'eat_refuse', 'terminal'); }
  if (id === 'vessel') S.frozenPace = paceToday(true);
  if (id === 'conspirator') moveFamily('wave', 'wave_morning', 'terminal');
}
function startDesk() {
  if (S.day >= CFG.totalDays) { startFinale(); return; }
  S.phase = 'desk';
  el.dlg.hidden = true; el.frame.classList.remove('dim');
  saveGame();
  activateRules();
  el.hint.textContent = DEFAULT_HINT;
  eachCell(() => {
    const p = S.patient;
    if (S.fam.wave.node === 'wave_morning' && !S.flags.lensCracked) p.scheduled = NODE.wave_morning;
    if (S.terminal === 'vessel') p.steps = [{ move: SPOT.center }, { pose: 'stand', facing: 'front', dur: 4, bubble: fmt(B.terminals.vessel.lines[0]), chant: true }];
  });
  if (S.day === 1) showOpeningMemo();
  else { closeModal(); toast('Day ' + S.day + ' of ' + CFG.totalDays + '. ' + (S.rivals.length + 1) + ' technicians on the board. ' + (cutDayOf(S.day) ? 'The lowest tally is cut at the end of day ' + cutDayOf(S.day) + '.' : 'No cut this window.')); }
  if (S.day === CFG.fullMoonWarnDay) say('fullMoonWarn');
  else if (S.day === CFG.fullMoonDay) say('fullMoon');
}
function endShift() {
  S.armed = false; S.endEarlyAt = 0;
  eachCell(() => { S.violation = null; if (S.inst) resolve(S.inst, 'allowed'); });
  const me = playerDay();
  S.credits += me.bonus; S.stats.earned += me.bonus;
  const rows = board(true), rank = rows.findIndex(r => r.me) + 1;
  const dmg = damageList(), penalty = damagePenalty(dmg);
  if (penalty) { S.credits = Math.max(0, S.credits - penalty); logEvent('damage-penalty', { penalty, items: dmg.map(d => d.cell + ':' + d.kind) }); }
  const rec = { day: S.day, earned: me.earned, bonus: me.bonus, total: me.total, rank, of: rows.length, opportunity: S.today.opportunity, missed: S.today.missed, feedback: S.today.feedback, state: stateNow().id, penalty, damage: dmg,
    observed: S.today.observed || 0, medical: { n: S.today.medical || 0, cr: S.today.medicalCost || 0 }, scores: Object.fromEntries(rows.map(r => [r.name, r.score])) };
  S.history.push(rec); logEvent('day-end', rec);
  if (S.flags.escape) { ending('free'); return; }
  // The three-day tally. On a cut day the lowest tally leaves the program and nobody replaces them.
  let win = tallyRows(), wrank = win.findIndex(r => r.me) + 1;
  const cutDay = isCutDay(S.day);
  let cut = cutDay && wrank === win.length, spared = false;
  if (cut && anyCell(() => S.terminal === 'vessel')) {
    // Nobody is cut while the Vessel holds. The technician just above takes the fall.
    spared = true; cut = false;
    const mine = win.splice(wrank - 1, 1)[0]; win.splice(win.length - 1, 0, mine); wrank = win.length - 1;
  }
  rec.window = { idx: windowIdx(S.day) + 1, rank: wrank, of: win.length, cutDay };
  let news = null;
  if (cutDay && !cut) {
    const lowest = win[win.length - 1], idx = S.rivals.findIndex(r => r.name === lowest.name);
    news = { cut: lowest.name, spared };
    // The cut technician comes back on the ledger in two days, as a subject.
    S.alumni.push(buildAlumnus({ name: lowest.name, day: S.day, drive: S.rivals[idx].drive }));
    if (S.alumni.length > 8) S.alumni.splice(0, S.alumni.length - 8);
    S.rivals.splice(idx, 1); S.noise.splice(idx, 1);
    logEvent('cut', { name: lowest.name, window: rec.window.idx });
  }
  S.phase = 'review';
  openReview(rows, rec, cut, news, win);
}
// Windows of three days. Cuts fall at the end of days 3, 6, 9 and 12; day 13 stands alone before the order.
function windowIdx(day = S.day) { return Math.floor((day - 1) / CFG.cutEvery); }
function windowStart(day = S.day) { return windowIdx(day) * CFG.cutEvery + 1; }
function cutDayOf(day = S.day) { const e = windowStart(day) + CFG.cutEvery - 1; return e < CFG.totalDays - 1 ? e : 0; }
function isCutDay(day = S.day) { return cutDayOf(day) === day; }
function tallyRows(upToToday = false) {
  const start = windowStart(S.day), sums = {}, add = (name, v) => { sums[name] = (sums[name] || 0) + v; };
  for (const h of S.history) if (h.day >= start && h.day <= S.day && h.scores) for (const n in h.scores) add(n, h.scores[n]);
  if (upToToday && S.phase === 'desk') for (const r of board()) add(r.name, r.score);
  const alive = S.rivals.map(r => r.name).concat([S.name]);
  const rows = alive.map(name => ({ name, score: Math.round(sums[name] || 0), me: name === S.name }));
  rows.sort((a, b) => b.score - a.score || (a.me ? 1 : b.me ? -1 : 0));
  return rows;
}
function nextDay() {
  const contact = S.today.warned + S.today.talks > 0;
  S.day++; S.time = 0; S.today = newToday(); rollNoise();
  eachCell(() => {
    const p = S.patient; p.steps = []; p.step = null; p.bubble = null; p.collapsed = false; p.hidden = false;
    S.violation = null; S.inst = null; S.lastInst = null; S.fx = []; S.medicalUntil = 0; S.sedatedUntil = 0; S.medic = null;
  });
  S.flags.toastHour = 0; S.flags.confirmProtocol = false;
  morning(contact);
  closeModal();
  startDesk();
}
function startFinale() {
  closeModal(); saveGame();
  S.phase = 'intro'; el.frame.classList.remove('dim'); el.title.hidden = true;
  el.hint.textContent = 'Click or press Space to continue.';
  runScript(S.terminal === 'vessel' ? D.finaleVessel : D.finale, null);
}
function resolveOutcome(o) {
  if (o === 'terminate') ending('terminate');
  else if (o === 'vessel') ending('vessel');
  else if (o === 'vessel-refuse') ending('vessel', { refuse: true });
  else if (o === 'refuse') ending(isFriendly() && S.terminal !== 'hollow' ? 'happy' : 'refused');
  else if (o === 'orientation') startOrientation();
  else if (o === 'work') { logEvent('skipped-orientation'); startDesk(); }
}
// Tell the Fireside Tales campfire about the ending so a trophy goes on the log (key shared by every tale).
function reportTrophy(id) {
  try {
    const all = JSON.parse(localStorage.getItem('fireside-tales.trophies') || '{}') || {}, mine = all.lab || (all.lab = {});
    if (!mine[id]) { mine[id] = Date.now(); localStorage.setItem('fireside-tales.trophies', JSON.stringify(all)); }
  } catch (e) {}
}
function ending(id, opts = {}) {
  const e = D.endings[id], p = S.patient;
  S.phase = 'ending'; S.endingId = id; S.endingOpts = opts; S.armed = false; S.pendingEnding = null; el.hint.textContent = '';
  el.dlg.hidden = true;
  if (id === 'terminate') { p.dead = true; p.pose = 'collapsed'; p.bubble = null; p.hidden = false; p.x = 42; p.y = 46; }
  if (id === 'brutalist') eachCell(() => { if (S.terminal !== 'vessel') { S.patient.dead = true; S.patient.pose = 'collapsed'; S.patient.bubble = null; S.patient.hidden = false; } });
  if (id === 'free') p.gone = true;
  if (id === 'vessel') { p.vesselEnd = true; S.humBoost = 1; }
  if (id === 'terminate' && S.terminal === 'conspirator') addTraits({ sadism: 3 });
  logEvent('ending', { ending: id, state: S.terminal });
  reportTrophy(id === 'refused' ? 'failed' : id);
  if (id === 'failed') storeSelf();
  clearSave();
  // Let the feed sink in (flat-lined, empty or dark) before the ending card.
  if (e.scene === 'desk' && id !== 'brutalist') { closeModal(); setTimeout(() => openEnding(e, id), reduceMotion ? 300 : 3000); }
  else openEnding(e, id);
}
function endingText(e, id) {
  let t = S.endingOpts && S.endingOpts.refuse && e.refuse ? e.refuse : e.text;
  const v = D.endingVariants[id];
  if (v && S.terminal && v[S.terminal]) t += ' ' + v[S.terminal];
  if (id === 'free' && S.flags.door_known && S.flags.map_complete && S.flags.schedule_known) t += ' ' + v.tuesday;
  if (id === 'failed' && S.flags.medicalIncident) t = 'Medical attended Cell 4 at {time}. Security walks you to the elevator and asks for your badge. The incident report lists {subject} as transferred. It does not say where.';
  return fmtEnding(t);
}

// ---------------------------------------------------------------- dialogue (intro)
const dlg = { script: D.intro, onEnd: null, i: 0, full: '', shown: 0, acc: 0, typing: false, onDone: null, mode: 'line' };
function speak(textStr, onDone, mode = 'line') {
  dlg.full = fmt(textStr); dlg.shown = 0; dlg.typing = true; dlg.onDone = onDone; dlg.mode = mode;
  el.dlg.hidden = false; el.dlgName.textContent = D.director.name;
  el.dlgText.textContent = ''; el.dlgChoices.innerHTML = ''; el.dlgMore.hidden = true;
}
function finishTyping() {
  dlg.typing = false; dlg.shown = dlg.full.length; el.dlgText.textContent = dlg.full;
  if (dlg.mode === 'line') el.dlgMore.hidden = false;
  if (dlg.mode !== 'line' && dlg.onDone) { const f = dlg.onDone; dlg.onDone = null; f(); }
}
function advance() {
  if (S.phase !== 'intro') return;
  if (dlg.typing) { finishTyping(); return; }
  if (dlg.mode === 'line' && dlg.onDone) { const f = dlg.onDone; dlg.onDone = null; Snd.play('click'); f(); }
}
function updateDialogue(dt) {
  if (!dlg.typing) return;
  dlg.acc += dt;
  while (dlg.acc > 0.022 && dlg.shown < dlg.full.length) {
    dlg.acc -= 0.022; dlg.shown++;
    if (dlg.shown % 3 === 0 && dlg.full[dlg.shown] !== ' ') Snd.play('type');
  }
  el.dlgText.textContent = dlg.full.slice(0, dlg.shown);
  if (dlg.shown >= dlg.full.length) finishTyping();
}
function runScript(script, onEnd) { dlg.script = script; dlg.onEnd = onEnd; dlg.i = 0; introNext(); }
function introNext() {
  const node = dlg.script[dlg.i++];
  if (!node) { (dlg.onEnd || startDesk)(); return; }
  if (node.type === 'line') speak(node.text, introNext);
  else if (node.type === 'acronym') showAcronym();
  else if (node.type === 'choice') speak(node.text, () => showChoices(node), 'choice');
  else if (node.type === 'sign') speak(node.text, showSign, 'sign');
}
function showChoices(node) {
  el.dlgChoices.innerHTML = '';
  node.options.forEach((o, i) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'choice'; b.id = 'choice-' + dlg.i + '-' + i;
    b.textContent = fmt(o.text);
    b.addEventListener('click', ev => {
      ev.stopPropagation(); Snd.play('click');
      addTraits(o.traits); logEvent('intro-choice', { prompt: node.text, choice: o.text, traits: o.traits });
      speak(o.reply, o.outcome ? () => resolveOutcome(o.outcome) : introNext);
    });
    el.dlgChoices.append(b);
  });
  el.dlgChoices.querySelector('button')?.focus({ preventScroll: true });
}
function showSign() {
  el.dlgChoices.innerHTML = `
    <form class="sign" id="sign-form">
      <label for="sign-name">Signature</label>
      <span class="sign-row"><span class="sign-dr">Tech.</span><input id="sign-name" maxlength="18" autocomplete="off" placeholder="${CFG.defaultName}"></span>
      <button type="submit" class="choice">Sign the waiver</button>
    </form>`;
  const form = $('sign-form'), input = $('sign-name');
  input.focus({ preventScroll: true });
  form.addEventListener('click', e => e.stopPropagation());
  form.addEventListener('submit', e => {
    e.preventDefault(); e.stopPropagation();
    const n = input.value.trim().replace(/^(dr|tech|technician)\.?\s*/i, '');
    S.name = CFG.playerTitle + ' ' + (n || CFG.defaultName);
    Snd.play('switch'); logEvent('signed', { name: S.name });
    introNext();
  });
}
function showAcronym() {
  el.dlg.hidden = true;
  const words = ['Elective', 'Lab', 'Directed', 'Rehabilitation', 'Initiated', 'Trans-Channel', 'Healing'];
  const parts = words.map(w => {
    // Trans-Channel contributes T and C.
    if (w === 'Trans-Channel') return '<span class="w"><b>T</b><i>rans-</i><s>.</s><b>C</b><i>hannel</i><s>.</s></span>';
    return `<span class="w"><b>${w[0]}</b><i>${w.slice(1)}</i>${w === 'Healing' ? '' : '<s>.</s>'}</span>`;
  }).join(' ');
  openModal(`
    <div class="acronym" id="acro">
      <p class="acro-line">${parts}</p>
      <p class="acro-note">Staff call it by its initials.</p>
      <button type="button" class="btn" id="acro-go">Continue</button>
    </div>`, 'dark');
  setTimeout(() => $('acro')?.classList.add('collapse'), reduceMotion ? 0 : 1600);
  $('acro-go').addEventListener('click', () => { Snd.play('click'); closeModal(); introNext(); });
  $('acro-go').focus({ preventScroll: true });
}

// ---------------------------------------------------------------- modals
function openModal(html, variant = 'paper') {
  el.modalBody.innerHTML = html;
  el.modal.className = 'modal ' + variant;
  el.modal.hidden = false; S.paused = true;
  el.coach.classList.add('behind');
  el.modal.scrollTop = 0;
  // Popups with a close or dismiss button also close from the ✕, a click outside, or Esc.
  const closable = !!modalCloser();
  el.modalX.hidden = !closable;
  el.scrim.hidden = variant === 'dark';
  el.scrim.classList.toggle('locked', !closable);
}
function modalCloser() { return el.modal.hidden ? null : el.modalBody.querySelector('#m-close, #memo-ok'); }
function dismissModal() { const b = modalCloser(); if (b) b.click(); }
function closeModal() {
  el.modal.hidden = true; el.modalBody.innerHTML = '';
  el.coach.classList.remove('behind');
  el.modalX.hidden = true; el.scrim.hidden = true;
  S.paused = false; canvas.focus({ preventScroll: true });
}
function esc(s) { return String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch])); }

function showOpeningMemo() {
  const rules = activeRules().map(r => `<li>${esc(r.text)}</li>`).join('');
  openModal(`
    <p class="eyebrow">Directive 01 · Day 1 of ${CFG.totalDays} · Cell ${CELL}</p>
    <h2>Shift orders for ${esc(S.name)}</h2>
    ${fmt(D.openingMemo).split('\n').map(t => `<p>${esc(t)}</p>`).join('')}
    <ul class="memo-rules">${rules}</ul>
    <ol class="howto">
      <li>Flip <b>ARM</b> to enable the console.</li>
      <li>Pick a stimulus on the <b>STIM</b> dial and set the <b>INT</b> knob.</li>
      <li>Press <b>ADMINISTER</b> while the subject is breaking a rule, or use <b>WARN</b> on the intercom.</li>
      <li>Watch <b>RANK</b> on the console. Last place at 17:00 is cut.</li>
      <li>Spend credits at the <b>REQ-9</b> terminal. Your rules are on the clipboard.</li>
    </ol>
    <div class="actions"><button type="button" class="btn" id="memo-ok">Initial and begin</button></div>`);
  $('memo-ok').addEventListener('click', () => { Snd.play('switch'); closeModal(); });
  $('memo-ok').focus({ preventScroll: true });
}
// In-world reports for the morning a subject enters a terminal state.
const REPORTS = {
  vessel: 'Subject stood centre-cell at 09:00 and addressed the camera in full sentences for the first time. The hum is now audible on the feed at all times. Lighting in Cell 4 is unstable. Do not log the second shadow.',
  hollow: 'Subject sits on the edge of the bed, hands on knees, facing the camera. The subject has not committed an infraction since lights-on. They breathe audibly. Their hands tremble.',
  conspirator: 'Subject waved at the camera at 09:00. The subject nods at the lens after each intercom message. Their infractions appear to follow the leaderboard.',
  feral: 'Subject tore the electrode pads from under the cot overnight and cracked the camera lens with the tray. The subject refuses food. Contact electrodes are offline until tomorrow. Medical is on standby.',
};
// Morning paperwork: a rule unlocking on schedule, a memo issued because of something he started
// doing, or the report on a terminal state.
function showDirective(item) {
  Snd.play('memo');
  const n = ++S.directiveN, head = `<p class="eyebrow">Directive ${String(n).padStart(2, '0')} · Day ${S.day} · Cell ${cellNo()}</p>`;
  let body, ledgerBtn = '';
  if (item.rule) {
    const rule = RULE[item.rule];
    body = `<h2>New prohibited behavior</h2><p>${esc(fmt(rule.memo || ''))}</p><p class="rule-new">${esc(rule.text)}</p>`;
    logEvent('directive', { rule: rule.id });
  } else if (item.memo) {
    const m = MEMO[item.memo];
    if (m.rescind) {
      S.rescinded.add(m.rescind);
      body = `<h2>Directive amended</h2><p>${esc(fmt(m.text2))}</p><p class="rule-new struck">${esc(RULE[m.rescind].text)}</p>`;
    } else {
      S.active.add(m.id);
      body = `<h2>New prohibited behavior</h2><p>${esc(fmt(m.text2))}</p><p class="rule-new">${esc(m.text)}</p>`;
    }
    logEvent('directive', { memo: m.id });
  } else if (item.transfer) {
    const t = item.transfer, multi = S.stations.length > 1;
    body = `<h2>${t.from ? 'Transfer order' : 'Admission order'}: Cell ${cellNo()}</h2>${t.farewell ? `<p>${esc(t.farewell)}</p>` : ''}
      <p>Subject ${esc(t.to.id)}, ${esc(t.to.name)}, is admitted to Cell ${cellNo()}${multi ? ' (Station ' + esc(t.slot || S.focus) + ')' : ''} at 06:00.${t.to.inherited ? ' ' + esc(INTAKE.inherited.fileLine) : ''}</p>
      <p class="stamp">Status: ${t.from ? 'Transfer' : 'Admission'} complete</p>`;
    logEvent('directive', { transfer: t.to.id });
  } else {
    const T = B.terminals[item.terminal], disc = item.terminal === 'hollow' && S.ledger && S.ledger.slots.find(x => x.discount && !x.taken);
    body = `<h2>Incident report: Cell ${cellNo()}</h2><p>${esc(fmt(REPORTS[item.terminal]))}</p>
      <p class="stamp">Status: ${esc(T.label)}</p><p class="sig">“${esc(fmt(T.director[0]))}”</p>
      ${disc ? `<p>${esc(fmt(INTAKE.director.offerMemo).replaceAll('{entry}', disc.entry.name).replaceAll('{pct}', Math.round(disc.discount * 100)))}</p>` : ''}`;
    if (disc) ledgerBtn = `<button type="button" class="btn sm" id="memo-ledger">See the ledger</button>`;
  }
  openModal(`${head}${body}<p class="sig">— ${esc(D.director.name)}</p>
    <div class="actions">${ledgerBtn}<button type="button" class="btn" id="memo-ok">Initial and file</button></div>`);
  $('memo-ok').addEventListener('click', () => { Snd.play('click'); closeModal(); });
  if (ledgerBtn) $('memo-ledger').addEventListener('click', () => { Snd.play('click'); closeModal(); shopFold.intake = false; openShop(); const d = el.modalBody.querySelector('details[data-group=intake]'); if (d) d.scrollIntoView(); });
  $('memo-ok').focus({ preventScroll: true });
}
// Base rules in clipboard order, then the rules the Director added along the way.
function clipboardRules() { if (tut) return D.rules.filter(r => S.active.has(r.id)); return D.rules.concat(ALL_RULES.filter(r => r.extra && S.active.has(r.id))); }
function openRules() {
  if (S.phase !== 'desk') return;
  Snd.play('click');
  if (!S.flags.readRules) { S.flags.readRules = true; addTraits({ curiosity: 0.5 }); }
  const rows = clipboardRules().map(r => {
    if (!S.active.has(r.id)) return `<li class="redacted"><span>${'█'.repeat(Math.min(22, r.text.length))}</span><small>Pending directive</small></li>`;
    const c = S.counts[r.id];
    if (S.rescinded.has(r.id)) return `<li class="rescinded"><span>${esc(r.text)}</span><small>Rescinded · ${c.caught} corrected</small></li>`;
    return `<li><span>${esc(fmt(r.text))}</span><small>${c.caught} corrected · ${c.missed} missed</small></li>`;
  }).join('');
  openModal(`
    <p class="eyebrow">Clipboard · Subject ${subjId()}</p>
    <h2>Prohibited behaviors</h2>
    <ul class="rules-list">${rows}</ul>
    <p class="fine">Correct an infraction while it is happening. Proportionate feedback and intensity is at technician discretion.</p>
    <div class="actions"><button type="button" class="btn" id="m-close">Put down clipboard</button></div>`);
  $('m-close').addEventListener('click', closeModal); $('m-close').focus({ preventScroll: true });
}
function behaviorTag(n) {
  if (!n.rule) return '<span class="tag">Allowed</span>';
  if (S.rescinded.has(n.rule)) return '<span class="tag">Permitted</span>';
  if (!S.active.has(n.rule)) return '<span class="tag">Not yet a rule</span>';
  return `<span class="tag bad">NO ${esc(RULE[n.rule].short)}</span>`;
}
const CONSPIRACY_NOTES = {
  door_known: 'The subject has learned where the door bolts are.',
  map_complete: 'There is a complete floor plan behind the cot.',
  schedule_known: 'The subject knows when the corridor is empty.',
  mattress_cache: 'Something is hidden under the mattress.',
};
function openFile() {
  if (S.phase !== 'desk') return;
  Snd.play('click');
  addTraits({ curiosity: S.flags.readFile ? 0.2 : 2 }); S.flags.readFile = true; S.flags.fileNew = false;
  logEvent('read-file', { patient: S.subject.id });
  const p = S.subject, st = stateNow();
  const shownId = f => S.fam[f].pending ? S.fam[f].pending.from : S.fam[f].node;
  const fams = (S.terminal === 'hollow' ? HOLLOW_FAMS : []).concat(FAMILIES).filter(f => S.famSeen[f] || shownId(f) !== BASE[f]);
  const unseen = FAMILIES.length - fams.filter(f => FAMILIES.includes(f)).length;
  const observed = fams.map(f => {
    const n = NODE[shownId(f)], fp = S.famPath[f] || [], k = fp.lastIndexOf(n.id), path = (k >= 0 ? fp.slice(0, k) : []).slice(-2).map(id => fmt(NODE[id].label));
    const note = fmt(n.file || (n.director ? '“' + n.director + '”' : ''));
    const since = S.seen[n.id] ? 'since day ' + S.seen[n.id] : S.fam[f].since >= S.day && S.fam[f].node !== BASE[f] && !S.seen[n.id] ? 'on intake' : 'new';
    return `<li><div><b>${esc(fmt(n.label))}</b>${behaviorTag(n)}</div>
      <small>${path.length ? `<s>${path.map(esc).join(' › ')}</s> › ` : ''}${since}</small>${note ? `<em>${esc(note)}</em>` : ''}</li>`;
  }).join('');
  const notes = AXES.map(a => ({ a, v: S.axes[a] })).filter(x => x.v >= 25).sort((x, y) => y.v - x.v).slice(0, 2)
    .map(x => `<li>${esc(B.axes[x.a].file[Math.min(3, Math.floor(x.v / 25))])}</li>`).join('');
  const consp = Object.keys(CONSPIRACY_NOTES).filter(k => S.flags[k]).map(k => `<li>${esc(CONSPIRACY_NOTES[k])}</li>`).join('');
  const report = S.upgrades.has('report') ? `<h3>Behavioral report</h3><ul class="traits drives">${AXES.map(a =>
    `<li><span>${esc(B.axes[a].label)}</span><i style="--w:${Math.round(S.axes[a])}%"></i><small>${Math.round(S.axes[a])}</small></li>`).join('')}</ul>` : '';
  openModal(`
    <p class="eyebrow">Patient file · Confidential</p>
    <h2>Subject ${p.id}: ${esc(p.name)}</h2>
    <dl class="file">
      <dt>Cell</dt><dd>${p.cell}${S.stations.length > 1 ? ' · Station ' + S.focus : ''}</dd><dt>Age</dt><dd>${p.age}</dd>
      <dt>Intake</dt><dd>${esc(p.intake)}</dd><dt>Charge</dt><dd>${esc(p.charge)}</dd>
      <dt>Status</dt><dd class="${st.terminal ? 'status-term' : ''}">${esc(st.label)}</dd>
    </dl>
    <ul class="history">${historyRows(p, S.upgrades.has('report') ? 1 : 0)}${p.inherited ? `<li>${esc(INTAKE.inherited.fileLine)}</li>` : ''}</ul>
    <p class="stamp">${esc(fmt(p.note))}</p>
    <h3>Observed behaviors</h3>
    <ul class="observed">${observed || '<li><small>Nothing logged yet. Watch the feed.</small></li>'}</ul>
    ${unseen > 0 ? `<p class="fine">${unseen} behavior${unseen === 1 ? '' : 's'} on the intake sheet not yet observed.</p>` : ''}
    ${notes ? `<h3>Clinical notes</h3><ul class="history">${notes}</ul>` : ''}
    ${consp ? `<h3>Night staff observations</h3><ul class="history">${consp}</ul>` : ''}
    ${Object.keys(S.damage).length ? `<h3>Cell condition</h3><ul class="history">${Object.keys(S.damage).map(k => `<li>${esc(DMG.labels[k])} since day ${S.damage[k].day}.${S.repair && S.repair.kind === k ? ' Crew in the cell.' : ' Ticket at REQ-9.'}</li>`).join('')}</ul>` : ''}
    ${report}
    <p class="fine">Current stress ${Math.round(S.patient.stress)}/100 · ${Object.values(S.counts).reduce((a, c) => a + c.caught, 0)} corrections on record</p>
    <div class="actions"><button type="button" class="btn" id="m-close">Close file</button></div>`);
  $('m-close').addEventListener('click', closeModal); $('m-close').focus({ preventScroll: true });
}
// Which shop sections the player has folded shut. Not saved; the terminal opens fully each visit to the game.
const shopFold = {};
function foldGroup(kind, label, meta, inner) {
  const open = tut || (kind in shopFold ? !shopFold[kind] : kind === 'maintenance' && damageList().some(d => !cellField(d.cell, 'repair')));
  return `<details class="shop-group" data-group="${kind}"${open ? ' open' : ''}><summary><h3>${label}</h3>${meta ? `<small>${esc(meta)}</small>` : ''}</summary>${inner}</details>`;
}
function openShop() {
  if (S.phase !== 'desk' && !(S.phase === 'review' && S.reviewArgs)) return;
  const groups = [['stimulus', 'Feedback stimuli', ''], ['upgrade', 'Console upgrades', ''],
    ['station', 'Monitoring stations', 'Each station adds a monitor and a cell to this console. The Intake Ledger can admit a subject to an empty station, and the console routes to one station at a time.'],
    ['comfort', 'Subject comfort', `Each comfort item raises intercom pay and the bonus for a day with no missed infractions. Rapport: ${comfortCount()} item${comfortCount() === 1 ? '' : 's'}, intercom pays ${warnMult().toFixed(1)}x, perfect day +${Math.round(perfectRate() * 100)}%.`],
    ['maintenance', 'Maintenance', 'Repair and cleaning tickets for damage the subjects do. Damage left standing at 17:00 is deducted, more for every day it stands.'], ['protocol', 'Protocols', '']];
  const html = groups.map(([kind, label, note]) => {
    // During the orientation the terminal carries only the item the Director is teaching.
    const list = D.shop.filter(i => i.kind === kind && !i.repair && (kind !== 'maintenance' || S.flags.doorAsked) && (kind !== 'protocol' || protocolRevealed(i)) && (!tut || i.id === (tutStepDef() && tutStepDef().grant) || (tut && i.id === 'alert')));
    // one repair ticket per damaged cell, ahead of the door tickets
    if (kind === 'maintenance' && !tut) for (const d of damageList().reverse()) {
      const base = D.shop.find(i => i.repair === d.kind);
      if (base) list.unshift({ ...base, id: base.id + '@' + d.cell, cell: d.cell, name: base.name + ' · Cell ' + d.cellNo, busy: !!cellField(d.cell, 'repair'), days: d.days });
    }
    if (!list.length) return '';
    const items = list.map(i => {
      const owned = !i.consumable && (S.upgrades.has(i.id) || (i.stimulus && S.owned.has(i.stimulus)));
      const block = shopBlocker(i), cost = costOf(i);
      let btn;
      if (i.busy) btn = `<span class="tag ok">Crew in cell</span>`;
      else if (owned) btn = `<span class="tag ok">${i.kind === 'maintenance' ? 'Filed' : i.kind === 'protocol' ? 'Refused' : 'Installed'}</span>`;
      else if (block) btn = `<span class="tag">${esc(block)}</span>`;
      else if (S.credits < cost) btn = `<button type="button" class="btn sm" disabled>Need ${cost - S.credits} more</button>`;
      else if (i.kind === 'protocol' && S.flags.confirmProtocol) btn = `<button type="button" class="btn sm danger" data-buy="${i.id}" id="buy-${i.id}">Confirm. No undo</button>`;
      else btn = `<button type="button" class="btn sm" data-buy="${i.id}" id="buy-${i.id}">Requisition</button>`;
      const price = cost !== i.cost ? `<s>${i.cost}</s> ${cost} cr` : `${cost} cr`;
      const tag = i.repair ? `<span class="tag bad">Day ${i.days} · ${DMG.penalty * i.days} cr at 17:00</span>` : '';
      return `<li class="${i.kind === 'locked' ? 'locked' : ''} ${i.kind === 'protocol' ? 'protocol' : ''}"><div><b>${esc(i.name)}</b><span>${esc(fmt(i.desc))}</span>${tag}</div><em>${price}</em>${btn}</li>`;
    }).join('');
    const have = list.filter(i => !i.consumable && (S.upgrades.has(i.id) || (i.stimulus && S.owned.has(i.stimulus)))).length;
    const meta = kind === 'protocol' ? '' : `${have} of ${list.length} ${kind === 'maintenance' ? 'filed' : 'installed'}`;
    return foldGroup(kind, label, meta, `${note ? `<p class="fine shop-note">${esc(note)}</p>` : ''}<ul class="shop">${items}</ul>`);
  }).join('');
  const wasOpen = !el.modal.hidden && el.modal.dataset.kind === 'shop';
  const scroll = el.modal.scrollTop;
  openModal(`
    <p class="eyebrow">REQ-9 requisition terminal · Day ${S.day}</p>
    <h2>Balance: <span class="cr">${S.credits} credits</span></h2>
    <p class="fine">${tut ? 'Orientation stock. The full catalogue opens on day 1.' : 'Spending never lowers your rank. Only credits earned today count on the board.'}${!tut && S.stations.length > 1 ? ` Console routed to Station ${S.focus}, Cell ${cellNo()}: consumables are sent there.` : ''}</p>
    ${html}
    ${tut ? '' : foldGroup('intake', 'Intake Ledger', S.transfers.length ? `${S.transfers.length} scheduled for 06:00` : S.ledger && S.ledger.slots.length && S.day >= INTAKE.unlockDay ? `${S.ledger.slots.filter(x => !x.taken).length} names` : '', ledgerHtml())}
    <div class="actions"><button type="button" class="btn" id="m-close">${S.phase === 'review' ? 'Back to the report' : 'Log off'}</button></div>`, 'terminal');
  el.modal.dataset.kind = 'shop';
  if (wasOpen) el.modal.scrollTop = scroll;
  el.modalBody.querySelectorAll('details.shop-group').forEach(d => d.addEventListener('toggle', () => { shopFold[d.dataset.group] = !d.open; }));
  el.modalBody.querySelectorAll('[data-buy]').forEach(b => b.addEventListener('click', () => {
    const [id, cell] = b.dataset.buy.split('@');
    if (cell) buyRepair(D.shop.find(i => i.id === id), cell); else buy(D.shop.find(i => i.id === id));
  }));
  el.modalBody.querySelectorAll('[data-intake]').forEach(b => b.addEventListener('click', () => buySubject(+b.dataset.intake)));
  el.modalBody.querySelectorAll('[data-dest]').forEach(s => s.addEventListener('change', () => { const x = S.ledger && S.ledger.slots[+s.dataset.dest]; if (x) { x.dest = s.value; Snd.play('click'); openShop(); } }));
  el.modalBody.querySelectorAll('[data-reroll]').forEach(b => b.addEventListener('click', rerollLedger));
  $('m-close').addEventListener('click', () => { el.modal.dataset.kind = ''; S.flags.confirmProtocol = false; closeModal(); if (S.phase === 'review' && S.reviewArgs) openReview(...S.reviewArgs); });
  if (!wasOpen) $('m-close').focus({ preventScroll: true });
}
function dominantTrait() {
  let best = D.traits[0].id;
  for (const t of D.traits) if (S.traits[t.id] > S.traits[best]) best = t.id;
  return best;
}
function boardTable(rows) {
  return `<table class="board"><thead><tr><th>#</th><th>Technician</th><th>Credits today</th></tr></thead><tbody>${rows.map((r, i) =>
    `<tr class="${r.me ? 'me' : ''} ${i === rows.length - 1 ? 'cutrow' : ''}"><td>${i + 1}</td><td>${esc(r.name)}${i === rows.length - 1 ? ' <span class="cut">Cut</span>' : ''}</td><td>${r.score}</td></tr>`).join('')}</tbody></table>`;
}
function openReview(rows, rec, cut, news, win) {
  S.reviewArgs = [rows, rec, cut, news, win];
  const w = rec.window || { idx: 1, rank: rec.rank, of: rows.length, cutDay: false }, n = w.of, wrank = w.rank;
  const cutAt = cutDayOf(S.day), left = cutAt ? cutAt - S.day : 0, leftTxt = left === 1 ? 'one day' : left + ' days';
  const below = win && win[wrank] ? win[wrank] : null, above = win && wrank > 1 ? win[wrank - 2] : null, mine = win ? win[wrank - 1] : null;
  let head, line = '';
  if (cut) head = 'The window closed with you last on the tally.';
  else if (news && news.spared) { head = 'You finished the window last. Nobody noticed.'; line = 'The comparison does not apply to you any more, {name}. Keep the subject talking.'; }
  else if (news) { head = 'Window ' + w.idx + ' closed. ' + news.cut + ' is cut.'; line = pick(D.lines.windowCut).replaceAll('{rival}', news.cut); }
  else if (!cutAt) { head = 'The last shift. One technician left beside you.'; line = pick(D.lines.rankMid); }
  else if (wrank === 1) { head = 'Top of the tally, ' + leftTxt + ' to the cut.'; line = moodLine('rankTop'); }
  else if (wrank === n) { head = 'Below the line, ' + leftTxt + ' to the cut.'; line = pick(D.lines.windowLast).replaceAll('{left}', leftTxt.charAt(0).toUpperCase() + leftTxt.slice(1)); }
  else if (wrank === n - 1) { head = 'One above the line, ' + leftTxt + ' to the cut.'; line = moodLine('rankLow').replaceAll('{rival}', below ? below.name : ''); }
  else { head = 'Rank ' + wrank + ' of ' + n + ' on the tally, ' + leftTxt + ' to the cut.'; line = pick(D.lines.rankMid); }
  const gap = !win ? '' : cut ? '' : wrank === n ? `You are ${(above ? above.score : 0) - mine.score} credits below the line.` : below ? `The technician below you is ${mine.score - below.score} credits behind.` : '';
  const bonusLine = rec.bonus ? `Perfect day: no missed infractions, so your ${comfortCount()} comfort item${comfortCount() === 1 ? '' : 's'} added ${rec.bonus} credits.`
    : rec.missed ? `You missed ${rec.missed} infraction${rec.missed === 1 ? '' : 's'}, so there was no perfect-day bonus.` : '';
  const changes = S.today.changes.filter(c => c.to !== c.from).slice(-4)
    .map(c => `<li>${esc(fmt(NODE[c.to].label))} <small>(was: ${esc(fmt(NODE[c.from].label).toLowerCase())})</small></li>`).join('');
  const final = S.day + 1 >= CFG.totalDays;
  openModal(`
    <p class="eyebrow">Day ${S.day} · 17:00 · Window ${w.idx}${cutAt ? `, day ${S.day - windowStart(S.day) + 1} of ${CFG.cutEvery}` : ''} · ${n} technicians</p>
    <h2>${head}</h2>
    ${line ? `<p class="sig">“${esc(fmt(line))}” — ${esc(D.director.name)}</p>` : ''}
    ${win ? tallyTable(win, rows, !!cutAt, S.day === cutAt) : boardTable(rows)}
    <p>You earned ${rec.earned} credits today${rec.bonus ? ` plus a ${rec.bonus} credit bonus` : ''}${rec.observed ? `, ${rec.observed} of it observation credit` : ''}. ${bonusLine} ${gap}</p>
    ${changes ? `<h3>Changes observed today</h3><ul class="memo-rules">${changes}</ul>` : ''}
    ${rec.damage && rec.damage.length ? `<h3>Cell maintenance</h3><ul class="memo-rules">${rec.damage.map(d => `<li>Cell ${d.cellNo}: ${esc(DMG.labels[d.kind])} <small>(day ${d.days} unrepaired, ${DMG.penalty * d.days} cr)</small></li>`).join('')}</ul>
    <p class="news">${rec.penalty} credits deducted for damage left standing at 17:00. File the tickets at REQ-9. The deduction grows every day an item stands.</p>` : ''}
    ${rec.medical && rec.medical.n ? `<p class="news">Medical assistance provided ${rec.medical.n} time${rec.medical.n === 1 ? '' : 's'}: ${rec.medical.cr} cr deducted.</p>` : ''}
    ${news ? `<p class="news">${esc(news.cut)} has been cut from the program.<br>${S.rivals.length + 1} technicians remain</p>` : ''}
    ${cut ? `<p class="news">The lowest tally is cut. That is you.</p>` : ''}
    ${cut || tut ? '' : `<p class="news">${reqReminder()}</p>`}
    <div class="actions">
      ${cut || tut ? '' : `<button type="button" class="btn" id="r-shop">Open REQ-9</button>`}
      <button type="button" class="btn" id="r-next">${cut ? 'Hand in your badge' : final ? 'Report for the termination order' : 'Begin day ' + (S.day + 1)}</button>
    </div>`);
  $('r-next').addEventListener('click', () => { Snd.play('switch'); S.reviewArgs = null; if (cut) ending('failed'); else nextDay(); });
  if ($('r-shop')) $('r-shop').addEventListener('click', () => { Snd.play('click'); openShop(); });
  $('r-next').focus({ preventScroll: true });
}
// The reminder on the 17:00 report: balance, what is within reach, what is waiting.
function reqReminder() {
  const owned = i => !i.consumable && (S.upgrades.has(i.id) || (i.stimulus && S.owned.has(i.stimulus)));
  const budget = D.shop.filter(i => !i.repair && i.kind !== 'protocol' && !owned(i) && !shopBlocker(i) && (!i.consumable || i.kind === 'maintenance') && costOf(i) <= S.credits && (i.kind !== 'maintenance' || S.flags.doorAsked)).length;
  return 'A reminder that REQ-9 purchases are available. Balance ' + S.credits + ' credits, ' + budget + (budget === 1 ? ' item' : ' items') + ' in budget.';
}
// The window tally beside today's credits. On the cut day the last row is marked; otherwise it is only below the line.
function tallyTable(win, rows, hasCut, cutToday) {
  const today = Object.fromEntries(rows.map(r => [r.name, r.score]));
  return `<table class="board"><thead><tr><th>#</th><th>Technician</th><th>Window tally</th><th>Today</th></tr></thead><tbody>${win.map((r, i) => {
    const last = i === win.length - 1 && hasCut;
    return `<tr class="${r.me ? 'me' : ''} ${last ? 'cutrow' : ''}"><td>${i + 1}</td><td>${esc(r.name)}${last ? ` <span class="cut">${cutToday ? 'Cut' : 'Below the line'}</span>` : ''}</td><td>${r.score}</td><td>${today[r.name] ?? 0}</td></tr>`; }).join('')}</tbody></table>`;
}
function openEnding(e, id) {
  const top = dominantTrait();
  const max = Math.max(8, ...Object.values(S.traits));
  const bars = D.traits.map(t => {
    const v = S.traits[t.id], pct = Math.round(v / max * 100);
    return `<li class="${t.id === top ? 'top' : ''}"><span>${t.label}</span><i style="--w:${pct}%"></i><small>${v.toFixed(1)}</small></li>`;
  }).join('');
  const st = S.stats;
  const survived = id === 'failed' || id === 'refused' ? S.day - (id === 'failed' ? 1 : 0) : S.day;
  const served = servedAll(id);
  openModal(`
    <p class="eyebrow">Ending · Day ${S.day} of ${CFG.totalDays}</p>
    <h2 class="ending-title">${esc(e.title)}</h2>
    <p>${esc(endingText(e, id))}</p>
    <dl class="stats">
      <dt>Days survived</dt><dd>${survived}</dd><dt>Credits earned</dt><dd>${st.earned}</dd>
      <dt>Feedback given</dt><dd>${st.feedback}</dd><dt>Warnings</dt><dd>${st.warned}</dd>
      <dt>Highest intensity</dt><dd>${st.maxInt || '–'}</dd><dt>Collapses</dt><dd>${st.collapses}</dd>
      <dt>Subjects handled</dt><dd>${served.length}</dd><dt>Behaviors seen</dt><dd>${served.reduce((a, r) => a + r.seen, 0)}</dd>
    </dl>
    <h3>Subjects</h3>
    ${servedTable(served)}
    <h3>Psychological assessment</h3>
    <ul class="traits">${bars}</ul>
    <div class="verdict"><p>“${esc(fmt(D.assessments[top]))}” — ${esc(D.director.name)}</p></div>
    <div class="actions"><button type="button" class="btn" id="r-restart">Play again</button></div>`);
  $('r-restart').addEventListener('click', () => { clearSave(); location.hash = ''; location.reload(); });
  $('r-restart').focus({ preventScroll: true });
}

// ---------------------------------------------------------------- rendering: cell feed
const cell = layer(84, 66);
function drawEye(c, x0, y0, n, k = 1) {
  for (let i = 0; i < n && i < EYE_PIX.length; i++) {
    const [x, y, ch] = EYE_PIX[i];
    c.fillStyle = ch === '#' ? G[3] : ch === 'i' ? G[2] : ch === 'p' ? G[0] : G[4];
    c.fillRect(x0 + x * k, y0 + y * k, k, k);
  }
}
function feedPost(c) {
  // scanlines + noise
  c.fillStyle = 'rgba(0,0,0,0.22)';
  for (let y = 0; y < 66; y += 2) c.fillRect(0, y, 84, 1);
  c.fillStyle = G[3];
  for (let i = 0; i < 6; i++) c.fillRect(Math.floor(Math.random() * 84), Math.floor(Math.random() * 66), 1, 1);
  const roll = (T * 14) % 90 - 12;
  c.fillStyle = 'rgba(184,239,208,0.05)'; c.fillRect(0, Math.round(roll), 84, 6);
  // rounded tube corners
  c.fillStyle = '#000';
  for (const [x, y] of [[0, 0], [83, 0], [0, 65], [83, 65]]) { c.fillRect(x, y, 1, 1); }
  c.fillRect(1, 0, 1, 1); c.fillRect(0, 1, 1, 1); c.fillRect(82, 0, 1, 1); c.fillRect(83, 1, 1, 1);
  c.fillRect(0, 64, 1, 1); c.fillRect(1, 65, 1, 1); c.fillRect(83, 64, 1, 1); c.fillRect(82, 65, 1, 1);
}
function heartRate(p, t) {
  if (p.dead) return '000';
  if (p.gone || p.hidden) return '---';
  if (p.collapsed) return Math.floor(t * 4) % 2 ? '---' : String(Math.round(rand(28, 190))).padStart(3, '0');
  const top = axisTop();
  let v = 62 + p.stress * 0.85 + Math.sin(t * 3) * 2;
  if (top.v >= 40) {
    if (top.axis === 'compliance') v = 58;
    else if (top.axis === 'fracture') v += Math.floor(t * 1.3) % 3 === 0 ? 20 : Math.floor(t * 0.7) % 4 === 0 ? -14 : 0;
    else if (top.axis === 'defiance') v = Math.max(v, 92 + p.stress * 0.4 + Math.sin(t * 5) * 3);
    else v = 66 + (Math.sin(t * 0.9) + 1) * 3;
  }
  return String(Math.round(v)).padStart(3, '0');
}
function drawCell(t) {
  const c = cell, p = S.patient;
  if (p.vesselEnd) {
    // The feed does not go flat. It goes dark, and something looks back.
    rect(c, 0, 0, 84, 66, '#020604');
    const n = Math.min(EYE_PIX.length, Math.floor((T % 9) * 30));
    if (!(Math.floor(t * 6) % 7 === 0)) drawEye(c, 8, 20, n || EYE_PIX.length, 3);
    text(c, 'CAM 04', 2, 1, G[2]); text(c, 'NO SUBJECT', 2, 60, G[2]);
    feedPost(c); return;
  }
  rect(c, 0, 0, 84, 24, G[1]);
  for (let y = 0; y < 24; y++) for (let x = 0; x < 84; x++) if (bayer(x, y) < 0.12) rect(c, x, y, 1, 1, G[0]);
  rect(c, 0, 24, 84, 1, G[2]); rect(c, 0, 25, 84, 41, G[0]);
  for (const y of [32, 42, 55]) rect(c, 0, y, 84, 1, G[1]);
  for (let x = 6; x < 84; x += 14) line(c, x, 25, x + (x - 42) * 0.5, 66, G[1]);
  // vent, nozzle
  rect(c, 30, 3, 10, 4, G[2]); for (let i = 0; i < 3; i++) rect(c, 31, 4 + i, 8, 1, i % 2 ? G[1] : G[2]);
  rect(c, 40, 0, 5, 2, G[2]);
  // marks: tallies and glyphs on the wall, the low writing and the floor plan behind the cot,
  // the worn ring on the floor, and the mural, which is the eye from the title screen
  if (S.ring) for (let a = 0; a < 360; a += 14 - S.ring) rect(c, Math.round(42 + Math.cos(a * Math.PI / 180) * 12), Math.round(48 + Math.sin(a * Math.PI / 180) * 6), 1, 1, G[1]);
  // the circle on the floor: a ring in perspective with five points joined every second one
  if (S.damage.floor) {
    const cx = 42, cy = 47, rx = 14, ry = 6;
    for (let a = 0; a < 360; a += 5) rect(c, Math.round(cx + Math.cos(a * Math.PI / 180) * rx), Math.round(cy + Math.sin(a * Math.PI / 180) * ry), 1, 1, G[3]);
    const pts = [0, 1, 2, 3, 4].map(k => { const a = (-90 + k * 72) * Math.PI / 180; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
    for (let k = 0; k < 5; k++) line(c, pts[k][0], pts[k][1], pts[(k + 2) % 5][0], pts[(k + 2) % 5][1], G[3]);
  }
  for (const m of S.marks) {
    if (m.kind === 'tally') rect(c, m.x, m.y, 1, 6, G[3]);
    else if (m.kind === 'slash') line(c, m.x - 8, m.y + 5, m.x, m.y, G[3]);
    else if (m.kind === 'eye') { ring(c, m.x, m.y + 2, 2, G[3]); rect(c, m.x, m.y + 2, 1, 1, G[4]); }
    else if (m.kind === 'spiral') { ring(c, m.x, m.y + 2, 2, G[3]); rect(c, m.x + 1, m.y + 2, 1, 1, G[3]); }
    else if (m.kind === 'hidden') { rect(c, m.x, m.y, 1, 2, G[2]); rect(c, m.x + 1, m.y + 1, 1, 1, G[2]); }
    else if (m.kind === 'map') { if (m.v) rect(c, m.x, m.y, 1, m.w, G[3]); else rect(c, m.x, m.y, m.w, 1, G[3]); }
    else if (m.kind === 'tri') { line(c, m.x - 2, m.y + 4, m.x, m.y, G[3]); line(c, m.x, m.y, m.x + 2, m.y + 4, G[3]); line(c, m.x - 2, m.y + 4, m.x + 2, m.y + 4, G[3]); }
  }
  if (S.mural) drawEye(c, 19, 14, S.mural);
  if (S.trayEye && S.trayEye.day === S.day) { const { x, y } = S.trayEye; rect(c, x - 3, y, 7, 1, G[2]); rect(c, x - 1, y - 1, 3, 3, G[3]); rect(c, x, y, 1, 1, G[0]); }
  // door
  rect(c, 63, 5, 15, 20, G[3]); rect(c, 64, 6, 13, 19, G[2]);
  rect(c, 67, 9, 7, 5, G[0]); for (let x = 68; x < 74; x += 2) rect(c, x, 9, 1, 5, G[2]);
  rect(c, 65, 16, 1, 2, G[4]);
  const dOpen = p.gone || p.out ? 1 : S.repair ? repairDoor(S.repair) : S.medic ? repairDoor(S.medic) : 0;
  if (dOpen >= 1) { rect(c, 64, 6, 12, 19, G[0]); rect(c, 76, 6, 2, 19, G[3]); }
  else if (dOpen > 0) { const w = Math.max(1, Math.round(12 * dOpen)); rect(c, 64, 6, w, 19, G[0]); rect(c, 64 + w, 6, 13 - w, 19, G[2]); rect(c, 76, 6, 2, 19, G[3]); }
  else if (S.damage.door) { rect(c, 64, 6, 3, 19, G[0]); rect(c, 66, 7, 1, 17, G[1]); }
  if ((S.repair || S.medic) && dOpen >= 0.5) drawGuard(c, 70, 25, t);
  if (S.upgrades.has('mural')) { rect(c, 3, 5, 12, 9, G[3]); rect(c, 4, 6, 10, 4, G[2]); rect(c, 4, 10, 10, 3, G[1]); for (let x = 4; x < 14; x += 2) rect(c, x, 10, 1, 2, G[3]); rect(c, 9, 5, 1, 9, G[3]); }
  if (S.upgrades.has('radio')) { rect(c, 6, 42, 5, 3, G[3]); rect(c, 7, 43, 1, 1, G[1]); rect(c, 10, 39, 1, 3, G[2]); }
  if (S.upgrades.has('letters')) { rect(c, 22, 30, 3, 2, G[4]); rect(c, 24, 29, 3, 2, G[4]); }
  // toilet
  rect(c, 47, 15, 6, 3, G[2]); rect(c, 46, 18, 8, 5, G[3]); rect(c, 47, 19, 6, 2, G[2]); rect(c, 48, 23, 4, 2, G[2]);
  // second shadow on the rear wall during infractions: one frame in three at first, bolder and
  // steadier as fracture climbs, and for a Vessel it stands there whenever he chants
  const fr = S.axes.fracture, chanting = p.step && (p.step.chant || p.step.pose === 'chant');
  if (fr >= 70 && (S.violation || (S.terminal === 'vessel' && chanting)) && !p.hidden && !p.gone &&
      (fr >= 92 || !reduceMotion && Math.floor(t * 10) % (fr >= 82 ? 2 : 3) === 0 || reduceMotion && Math.floor(t * 2) % 3 === 0)) {
    const sx = Math.round(clamp(p.x + 14, 8, 76)), bold = fr >= 85;
    rect(c, sx - 2, 7, 5, 4, G[0]); rect(c, sx - 3, 11, 7, 9, G[0]); rect(c, sx - 2, 20, 2, 4, G[0]); rect(c, sx + 1, 20, 2, 4, G[0]);
    if (bold) { rect(c, sx - 3, 6, 7, 1, G[0]); rect(c, sx - 4, 11, 1, 9, G[0]); rect(c, sx + 4, 11, 1, 9, G[0]); rect(c, sx - 2, 24, 5, 1, G[0]); }
  }
  // the morning a replacement arrives the cell has been hosed down overnight; the floor still shines
  const wet = !tut && S.flags.arrivedDay === S.day;
  if (wet) {
    for (let y = 27; y < 64; y++) for (let x = 2 + (y % 3); x < 82; x += 3) if (((x * 7 + y * 13) % 19) < 3 && bayer(x, y) < 0.4) rect(c, x, y, 2, 1, G[1]);
    rect(c, 65, 26, 3, 9, G[1]); rect(c, 66, 26, 1, 5, G[2]); rect(c, 42, 25, 5, 4, G[1]);
    if (!p.gone && !p.hidden && !['lie', 'collapsed', 'huddle', 'prostrate', 'pushup', 'stare'].includes(p.pose)) {
      const rx = Math.round(p.x), ry = Math.round(p.y);
      for (let i = 0; i < 3; i++) for (let dx = -2; dx <= 2; dx++) if ((dx + i) % 2 === 0) rect(c, rx + dx, ry + 1 + i, 1, 1, G[1]);
    }
  }
  // Feral: the collar he tore off lies by the cot, and the tray he will not touch sits by the door
  if (!tut && S.flags.padsTorn) { rect(c, 23, 39, 4, 1, G[1]); rect(c, 24, 38, 1, 1, G[4]); line(c, 27, 39, 30, 41, G[1]); }
  if (!tut && S.terminal === 'feral') { rect(c, 59, 44, 7, 1, G[2]); rect(c, 60, 43, 3, 1, G[4]); rect(c, 64, 43, 1, 1, G[3]); }
  const under = p.step && p.step.under && !p.step.move;
  if (under && !p.gone && !p.hidden) drawPatient(c, p, t);
  // cot, or what is left of it: the frame down on one side, the mattress on the floor
  if (S.damage.bed) {
    rect(c, 5, 35, 1, 4, G[2]); rect(c, 27, 37, 1, 2, G[2]);
    line(c, 4, 31, 29, 35, G[2]); line(c, 4, 32, 29, 36, G[2]);
    rect(c, 8, 37, 20, 3, G[3]); rect(c, 9, 36, 5, 2, G[4]); rect(c, 30, 38, 3, 1, G[2]); rect(c, 2, 34, 2, 1, G[2]);
    if (S.upgrades.has('blanket')) rect(c, 15, 39, 12, 2, G[3]);
  } else {
    rect(c, 5, 35, 1, 4, G[2]); rect(c, 28, 35, 1, 4, G[2]);
    rect(c, 4, 31, 26, 4, G[2]); rect(c, 5, 29, 24, 3, G[3]); rect(c, 5, 28, 6, 2, G[4]);
    if (S.upgrades.has('blanket')) { rect(c, 13, 29, 16, 4, G[3]); for (let x = 13; x < 29; x += 2) rect(c, x, 30 + (x % 4 ? 0 : 1), 1, 1, G[4]); }
  }
  if (S.upgrades.has('book') && !(p.step && p.step.read)) { rect(c, 24, 42, 4, 2, G[4]); rect(c, 24, 44, 4, 1, G[2]); }
  // puddles
  for (const d of S.puddles) for (let x = -d.r; x <= d.r; x++) if ((x + d.x) % 2 === 0 || Math.abs(x) < d.r - 1) rect(c, d.x + x, d.y, 1, 1, G[2]);
  // patient
  if (!under && !p.gone && !p.hidden) drawPatient(c, p, t);
  if (p.hidden && medical() && Math.floor(t * 2) % 2 === 0) { rect(c, 22, 26, 40, 9, G[0]); textC(c, 'TRANSFER', 42, 28, G[4]); }
  if (p.out && Math.floor(t * 2) % 2 === 0) { rect(c, 6, 26, 72, 9, G[0]); textC(c, 'SUBJECT OUT OF CELL', 42, 28, G[4]); }
  if (S.repair) { const ph = repairPhase(S.repair); if (ph) drawCrew(c, S.repair, t, ph); }
  if (S.medic) for (const m of medicPhase(S.medic)) drawMedic(c, m, t);
  // effects
  for (const f of S.fx) drawFx(c, f, t);
  if (p.bubble && !p.hidden) drawBubble(c, p, p.bubble, t);
  drawChangeCue(c, p, t);
  // cracked lens (Feral)
  if (S.flags.lensCracked) { line(c, 58, 0, 52, 14, G[3]); line(c, 52, 14, 55, 22, G[3]); line(c, 52, 14, 44, 18, G[3]); line(c, 55, 22, 53, 31, G[2]); line(c, 58, 0, 66, 9, G[2]); }
  // cell light follows his strongest drive
  const ax = S.axes;
  if (ax.compliance >= 55) { c.fillStyle = 'rgba(184,239,208,0.07)'; c.fillRect(0, 0, 84, 66); }
  if (ax.trust >= 55) { c.fillStyle = 'rgba(237,169,76,0.09)'; c.fillRect(0, 0, 84, 66); }
  if (ax.fracture >= 55 && !reduceMotion && ((t % 23) < 0.16 || (t % 37) < 0.1 || (S.terminal === 'vessel' && (t % 7) < 0.08))) { c.fillStyle = 'rgba(0,0,0,0.6)'; c.fillRect(0, 0, 84, 66); }
  // HUD
  text(c, 'CAM 0' + cellNo(), 2, 1, G[3]);
  if (Math.floor(t * 1.5) % 2 === 0) disc(c, 67, 3, 1, G[4]);
  text(c, 'REC', 70, 1, G[3]);
  const fileBlink = S.flags.fileNew && Math.floor(t * 2) % 2 === 0;
  text(c, subjId() + ' FILE', 2, 60, fileBlink ? G[2] : G[4]);
  if (S.flags.fileNew) rect(c, 41, 60, 2, 2, G[4]);
  const hr = heartRate(p, t);
  text(c, 'HR ' + hr, 59, 60, p.stress > 75 ? G[4] : G[3]);
  if (alertShowing() && Math.floor(t * 4) % 2 === 0) {
    const label = '!' + RULE[S.violation.rule].short;
    rect(c, 40 - textW(label) / 2 - 2, 8, textW(label) + 4, 7, G[4]); textC(c, label, 40, 9, G[0]);
  }
  feedPost(c);
}
// A live station with nobody in its cell.
function drawNoFeed(c, s, t) {
  rect(c, 0, 0, 84, 66, G[0]);
  if (!reduceMotion) for (let i = 0; i < 40; i++) rect(c, Math.floor(Math.random() * 84), Math.floor(Math.random() * 66), 1, 1, G[1]);
  text(c, 'CAM 0' + s.cell, 2, 1, G[3]);
  if (Math.floor(t * 1.5) % 2 === 0) disc(c, 67, 3, 1, G[4]);
  text(c, 'REC', 70, 1, G[3]);
  const tr = S.transfers.find(x => x.slot === s.id);
  if (tr) {
    const on = Math.floor(t * 1.2) % 3 !== 2;
    textC(c, 'SUBJECT TRANSFER', 42, 24, on ? G[3] : G[2]); textC(c, 'PENDING', 42, 31, on ? G[3] : G[2]);
    textC(c, tr.entry.id + ' AT 06:00', 42, 40, G[1]);
    text(c, 'STATION ' + s.id, 2, 60, G[2]);
  } else {
    textC(c, 'NO SUBJECT', 42, 27, G[2]); textC(c, 'STATION ' + s.id, 42, 35, G[1]);
    text(c, 'SEE REQ-9', 2, 60, G[2]);
  }
  feedPost(c);
}
// The maintenance crew: the door opens, a guard takes the doorway, one figure in coveralls and a
// cap walks in with a bucket, works, walks out, and the door closes behind them.
const CREW = { open: 0.7, walk: 1.2, close: 0.6, doorway: [70, 27] };
function crewSpot(kind) { return { walls: [40, 30], floor: [34, 52], bed: [24, 41], door: [60, 31], lens: [42, 60], pads: [12, 41] }[kind] || [42, 46]; }
function repairDur() { return DMG.crew + CREW.open + CREW.walk * 2 + CREW.close; }
function repairDoor(r) { return r.t < CREW.open ? r.t / CREW.open : r.t > r.dur - CREW.close ? Math.max(0, (r.dur - r.t) / CREW.close) : 1; }
function repairPhase(r) { return crewPhase(r, crewSpot(r.kind)); }
function crewPhase(r, spot) {
  const d = CREW.doorway, inEnd = CREW.open + CREW.walk, outStart = r.dur - CREW.close - CREW.walk;
  const lerp = (a, b, f) => [Math.round(a[0] + (b[0] - a[0]) * f), Math.round(a[1] + (b[1] - a[1]) * f)];
  if (r.t < CREW.open || r.t >= r.dur - CREW.close) return null;
  if (r.t < inEnd) return { pos: lerp(d, spot, (r.t - CREW.open) / CREW.walk), walking: true };
  if (r.t >= outStart) return { pos: lerp(spot, d, (r.t - outStart) / CREW.walk), walking: true };
  return { pos: spot, walking: false };
}
// Two medics: in through the door to either side of the subject, kneeling, one on the chest.
function medicSpots(m) {
  const [x, y] = m.at;
  return [[Math.max(8, x - 11), y + 2], [Math.min(76, x + 14), y + 2]];
}
function medicPhase(m) {
  return medicSpots(m).map((spot, i) => { const ph = crewPhase({ ...m, t: m.t - i * 0.25 }, spot); return ph && { ...ph, chest: i === 0 }; }).filter(Boolean);
}
// White coat, cap with a mark, a bag. Kneeling at the subject with the hands working.
function drawMedic(c, m, t) {
  const [x, y] = m.pos, k = Math.floor(t * (m.walking ? 6 : 5)) % 2;
  if (m.walking) {
    rect(c, x - 2, y - 2 - k, 2, 2 + k, G[3]); rect(c, x + 1, y - 2 - (1 - k), 2, 2 + (1 - k), G[3]);
    rect(c, x - 2, y - 13, 5, 2, G[4]); rect(c, x - 1, y - 13, 1, 1, G[1]);
    rect(c, x - 2, y - 11, 5, 3, G[3]); rect(c, x - 1, y - 10, 1, 1, G[1]); rect(c, x + 1, y - 10, 1, 1, G[1]);
    rect(c, x - 3, y - 8, 7, 6, G[4]); rect(c, x, y - 8, 1, 6, G[3]);
    rect(c, x + 4, y - 6, 2, 1, G[4]); rect(c, x - 6, y - 4, 3, 3, G[1]); rect(c, x - 5, y - 5, 1, 1, G[4]);
    return;
  }
  // kneeling: shorter figure, arms down on the subject
  rect(c, x - 3, y - 3, 7, 3, G[3]);
  rect(c, x - 2, y - 10, 5, 2, G[4]); rect(c, x - 1, y - 10, 1, 1, G[1]);
  rect(c, x - 2, y - 8, 5, 3, G[3]); rect(c, x - 1, y - 7, 1, 1, G[1]); rect(c, x + 1, y - 7, 1, 1, G[1]);
  rect(c, x - 3, y - 5, 7, 3, G[4]); rect(c, x, y - 5, 1, 3, G[3]);
  if (m.chest) { rect(c, x + 4, y - 5 + k, 3, 1, G[4]); rect(c, x + 6, y - 4 + k, 2, 1, G[3]); }
  else { rect(c, x - 6, y - 5, 3, 1, G[4]); rect(c, x - 7, y - 4, 2, 1, G[3]); if (k) rect(c, x - 6, y - 8, 1, 2, G[1]); }
  rect(c, x + (m.chest ? -7 : 4), y - 3, 3, 3, G[1]); rect(c, x + (m.chest ? -6 : 5), y - 4, 1, 1, G[4]);
}
// A guard in the open doorway: dark uniform, cap, belt, facing the cell.
function drawGuard(c, x, y, t) {
  rect(c, x - 2, y - 13, 5, 2, G[1]); rect(c, x - 3, y - 12, 7, 1, G[1]);
  rect(c, x - 2, y - 11, 5, 3, G[3]); rect(c, x - 1, y - 10, 1, 1, G[0]); rect(c, x + 1, y - 10, 1, 1, G[0]);
  rect(c, x - 3, y - 8, 7, 6, G[1]); rect(c, x - 3, y - 5, 7, 1, G[3]); rect(c, x, y - 8, 1, 3, G[2]);
  rect(c, x - 5, y - 7, 2, 4, G[1]); rect(c, x + 4, y - 7, 2, 4, G[1]);
  rect(c, x - 2, y - 2, 2, 2, G[1]); rect(c, x + 1, y - 2, 2, 2, G[1]);
  if (Math.floor(t * 2) % 2) rect(c, x + 5, y - 9, 1, 1, G[4]); // the radio light
}
function drawCrew(c, r, t, ph = { pos: crewSpot(r.kind), walking: false }) {
  const [x, y] = ph.pos;
  const k = ph.walking ? Math.floor(t * 6) % 2 : Math.floor(t * 4) % 2;
  if (ph.walking) { rect(c, x - 2, y - 2 - k, 2, 2 + k, G[2]); rect(c, x + 1, y - 2 - (1 - k), 2, 2 + (1 - k), G[2]); }
  rect(c, x - 2, y - 13, 5, 2, G[2]); rect(c, x - 3, y - 12, 1, 1, G[2]);
  rect(c, x - 2, y - 11, 5, 3, G[4]); rect(c, x - 1, y - 10, 1, 1, G[2]); rect(c, x + 1, y - 10, 1, 1, G[2]);
  rect(c, x - 3, y - 8, 7, 6, G[1]); rect(c, x - 3, y - 8, 7, 1, G[2]); rect(c, x, y - 7, 1, 4, G[2]);
  if (!ph.walking) { rect(c, x - 2, y - 2, 2, 2, G[2]); rect(c, x + 1, y - 2, 2, 2, G[2]); }
  if (ph.walking) rect(c, x + 4, y - 6, 2, 1, G[1]); else { rect(c, x + 4, y - 7 - k, 2, 1, G[1]); rect(c, x + 6, y - 8 - k, 1, 1, G[4]); }
  rect(c, x - 6, y - 3, 3, 3, G[3]); rect(c, x - 6, y - 4, 3, 1, G[2]);
  if (k && !ph.walking) { rect(c, x + 7, y - 10, 1, 1, G[2]); rect(c, x + 8, y - 12, 1, 1, G[2]); }
}
// Quiet behaviors slip past the Motion Alert unless the Audio Feed is installed.
function alertShowing() { return S.upgrades.has('alert') && S.violation && !S.violation.caught && (!S.violation.quiet || S.upgrades.has('audio')); }

// Subject look: the roster's three tints mapped to the nearest feed green, plus a hair style and
// a build keyed on the subject id, so two subjects are tellable apart on the monochrome feed.
// Former technicians (alumni) wear the darker, longer coat they were issued. 0-17 keeps the
// original look; during the orientation, or without a roster entry, so does everyone.
const LOOK_DEFAULT = { face: 4, hair: 0, suit: 3, shade: 2, style: 0, tall: 0, alum: false };
let lookCache = { key: '', look: LOOK_DEFAULT };
function tintLum(hex) {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(hex || '').trim()); if (!m) return null;
  let h = m[1]; if (h.length === 3) h = h.split('').map(ch => ch + ch).join('');
  const n = parseInt(h, 16);
  return (0.2126 * (n >> 16 & 255) + 0.7152 * (n >> 8 & 255) + 0.0722 * (n & 255)) / 255;
}
function subjectLook() {
  const sub = S.subject;
  if (!sub || !sub.id) return LOOK_DEFAULT;
  const sp = sub.sprite || {}, key = sub.id + '|' + sp.skin + '|' + sp.hair + '|' + sp.suit + '|' + !!sub.alumnus;
  if (lookCache.key === key) return lookCache.look;
  const ls = tintLum(sp.skin), lh = tintLum(sp.hair), lc = tintLum(sp.suit);
  let h = 7; for (const ch of String(sub.id)) h = (h * 31 + ch.charCodeAt(0)) & 0xffff;
  const base = sub.id === '0-17';
  const look = {
    face: ls == null ? 4 : ls > 0.5 ? 4 : ls > 0.35 ? 3 : 2,
    hair: lh == null ? 0 : lh < 0.3 ? 0 : lh < 0.55 ? 1 : lh < 0.75 ? 2 : 3,
    suit: lc == null ? 3 : lc >= 0.5 ? 3 : 2,
    style: base ? 0 : h % 4, tall: base ? 0 : (h >> 3) & 1, alum: !!sub.alumnus,
  };
  if (look.alum) look.suit = Math.min(look.suit, 2);
  look.shade = Math.max(0, look.suit - 1);
  lookCache = { key, look };
  return look;
}
// The pre-terminal drift the player should be able to read in his posture before the file says it.
function driftState() {
  if (tut || S.terminal) return null;
  const top = axisTop();
  return top.v >= 40 ? top.axis : null;
}

function drawPatient(c, p, t) {
  const st = p.step || {}, pose = p.pose, look = subjectLook();
  const node = st.node ? NODE[st.node] : null;
  const term = tut ? null : S.terminal, drift = driftState(), anim = !reduceMotion;
  const padsTorn = !tut && S.flags.padsTorn;
  const F = G[look.face], Hc = G[look.hair], Sc = G[look.suit], Sd = G[look.shade];
  const Fd = G[Math.max(0, look.face - 2)], Fm = G[Math.max(0, look.face - 3)]; // face detail, open mouth
  if (pose === 'stare') { drawStareFace(c, t, look, node, term); return; }
  let x = Math.round(p.x), y = Math.round(p.y);
  const front = p.facing === 'front' || p.facing === 'left' || p.facing === 'right';
  const frame = Math.floor(t * 7) % 2, slow = Math.floor(t * 2) % 2;
  const neutral = pose === 'stand' || pose === 'sit' || pose === 'sitfloor';
  if (anim) {
    if (pose === 'react_spark' || (pose === 'react_frost' && Math.floor(t * 20) % 2)) x += Math.random() < 0.5 ? -1 : 1;
    if (drift === 'fracture' && pose !== 'attention' && (t % 3.1) < 0.1) x += 1;      // Fraying: a twitch every few seconds
    if (drift === 'defiance' && pose === 'stand' && Math.floor(t * 0.9) % 2) x += 1;    // Agitated: shuffles on the spot
  }
  const R = (dx, dy, w, h, col) => { c.fillStyle = col; c.fillRect(x + dx, y + dy, w, h); };

  // ---- lying and crawling poses
  if (pose === 'lie' || pose === 'collapsed') {
    R(-7, -4, 2, 3, Hc); R(-5, -4, 3, 3, F);
    R(-2, -4, 7, 3, Sc); R(-2, -2, 7, 1, Sd); R(5, -4, 4, 3, Sc); R(9, -4, 1, 3, Sd);
    if (pose === 'collapsed') { R(-1, -1, 1, 2, Sc); R(-1, 1, 1, 1, F); if (Math.floor(t * 0.8) % 3 === 0) R(-5, -6, 1, 1, G[3]); }
    if (pose === 'lie' && Math.floor(t) % 3 === 0) { R(-4, -8, 1, 1, G[3]); R(-3, -9, 2, 1, G[3]); } // z
    return;
  }
  if (pose === 'huddle') {
    R(-5, -3, 2, 3, Hc); R(-3, -3, 3, 3, F); R(0, -3, 5, 3, Sc); R(0, -1, 5, 1, Sd); R(1, -4, 3, 1, Sc);
    if (Math.floor(t * 1.5) % 2) R(5, -2, 1, 2, Sd);
    return;
  }
  if (pose === 'prostrate') {
    // in profile: hips up, forehead on the floor, arms stretched out ahead of the head
    const d = front ? -1 : 1; // which way he faces along the floor
    R(-2, -5, 5, 3, Sc); R(2, -5, 1, 3, Sd); R(3 * -d - 1, -2, 3, 2, Sd);
    R(d * 5 - 1, -3, 3, 1, Hc); R(d * 5 - 1, -2, 3, 2, F);
    R(d * 8 - 1, -1, 3, 1, Sc); R(d * 9 - (d < 0 ? 0 : 0), -1, 1, 1, F);
    return;
  }
  if (pose === 'pushup') {
    const up = anim && Math.floor(t * 2) % 2 ? -1 : 0;
    R(-7, -4 + up, 2, 2, Hc); R(-5, -4 + up, 2, 2, F); R(-3, -4 + up, 8, 2, Sc); R(5, -3, 4, 1, Sc); R(9, -3, 1, 1, Sd);
    R(-3, -2 + up, 1, 2 - up, F);
    return;
  }

  // ---- upright poses
  const seated = ['sit', 'sitfloor', 'cry', 'eat', 'tiles', 'cover', 'rock', 'nest', 'hollow_tremor', 'read'].includes(pose);
  const floorSit = pose === 'sitfloor' || pose === 'rock' || pose === 'nest';
  const kneel = pose === 'kneel', crouch = pose === 'scratch';
  const walking = ['walk', 'pace', 'run', 'pace_square', 'pace_circle'].includes(pose);
  const oy = seated ? 3 : kneel ? 4 : crouch ? 2 : 0;
  const tl = seated || kneel || crouch ? 0 : look.tall, LH = 3 + tl;
  y -= tl;
  const onCot = seated && !floorSit && y + tl <= 46 && x < 32;
  if (onCot) { // a dark edge so a body sitting on the cot does not melt into it
    R(-4, -8 + oy, 1, 7, G[1]); R(4, -8 + oy, 1, 7, G[1]); R(-3, -1 + oy, 7, 1, G[1]); R(-3, -9 + oy, 7, 1, G[1]);
  }
  // head
  const headUp = pose === 'shout' || pose === 'chant' || pose === 'laugh' || st.chant;
  const headDown = pose === 'cry' || kneel || st.head === 'down' || pose === 'whisper';
  let hy = (headUp ? -1 : 0) + (st.nod && anim && Math.floor(t * 4) % 2 ? 1 : 0) + (pose === 'whisper' || pose === 'scratch' ? 1 : 0);
  let hx = pose === 'listen' ? 1 : 0;
  if (drift === 'compliance' && neutral) hy += 1;                           // Withdrawn: head sunk
  if (drift === 'trust' && neutral && front) hx = 1;                        // Attached: cocks his head at the lens
  if (pose === 'rock' && anim && slow) hy += 1;
  const glowEyes = pose === 'chant' || st.chant || (term === 'vessel' && front);
  const Fc = glowEyes ? G[Math.max(1, look.face - 1)] : F;                 // a lit-from-within face is shadowed
  const sy = -13 + oy + hy, my = sy + 4, ey = sy + 3;
  if (front && !headDown) {
    const hairRows = Math.max(1, (look.style === 1 ? 1 : look.style === 3 ? 3 : 2) - (headUp ? 1 : 0));
    const hairTop = sy - (look.style === 3 ? 1 : 0);
    R(-2 + hx, hairTop, 5, hairRows, Hc); R(-2 + hx, hairTop + hairRows, 5, sy + 5 - hairTop - hairRows, Fc);
    if (look.style === 0 || look.style === 3) { R(-2 + hx, sy + 2, 1, 1, Hc); R(2 + hx, sy + 2, 1, 1, Hc); }
    if (look.style === 2) { R(-2 + hx, sy + 2, 1, 3, Hc); R(2 + hx, sy + 2, 1, 3, Hc); }
    const eye = glowEyes ? G[4] : G[0];
    if (p.facing === 'front') { R(-1 + hx, ey, 1, 1, eye); R(1 + hx, ey, 1, 1, eye); }
    else if (p.facing === 'left') R(-1 + hx, ey, 1, 1, eye); else R(1 + hx, ey, 1, 1, eye);
    if (glowEyes && anim && Math.floor(t * 3) % 4 === 0) { R(-1 + hx, ey, 1, 1, G[3]); R(1 + hx, ey, 1, 1, G[3]); }
    if (drift === 'fracture' && anim && (t % 3.1) < 0.18) R(1 + hx, ey, 1, 1, G[2]); // one eye catches the light
    // mouths
    if (pose === 'speak' && frame) R(0 + hx, my, 1, 1, Fm);
    if (pose === 'shout') { R(-1, my, 3, 1, Fm); if (frame && anim) { R(-4, my - 2, 1, 1, G[4]); R(4, my - 2, 1, 1, G[4]); } }
    if (pose === 'mouth') { const m = Math.floor(t * 5) % 3; if (m === 1) R(0, my, 1, 1, Fm); else if (m === 2) R(-1, my, 3, 1, Fm); }
    if ((pose === 'chant' || st.chant) && frame) R(0, my, 1, 1, Fm);
    if (pose === 'laugh') R(-1, my, 3, 1, Fm);
    if (pose === 'sing') R(0, my, 1, 1, Fm);
    if (term === 'conspirator' && !['speak', 'shout', 'mouth', 'chant', 'laugh', 'sing'].includes(pose) && !st.chant) { R(-1 + hx, my, 1, 1, Fd); R(1 + hx, my, 1, 1, Fd); }
    if (term === 'feral' && pose === 'stand') R(-1, my, 3, 1, Fd);
  } else if (headDown && front) {
    R(-2 + hx, sy + 1, 5, 2, Hc); R(-2 + hx, sy + 3, 5, 2, F); R(-1 + hx, sy + 4, 3, 1, Fd);
    if (look.style === 2) { R(-2 + hx, sy + 3, 1, 2, Hc); R(2 + hx, sy + 3, 1, 2, Hc); }
  } else {
    if (look.style === 2) R(-2 + hx, sy, 5, 5, Hc);
    else if (look.style === 1) { R(-2 + hx, sy, 5, 3, Hc); R(-1 + hx, sy + 3, 3, 2, F); }
    else if (look.style === 3) { R(-2 + hx, sy - 1, 5, 5, Hc); R(-1 + hx, sy + 4, 3, 1, F); }
    else { R(-2 + hx, sy, 5, 4, Hc); R(-1 + hx, sy + 4, 3, 1, F); }
    if (pose === 'listen') R(2 + hx, sy + 2, 1, 1, F); // cheek showing as he turns his head
  }
  // torso (the laugh shakes the shoulders, not the head)
  const xs = x; if (pose === 'laugh' && anim && frame) x += 1;
  if (pose === 'whisper') { R(-1, -8 + oy, 3, 5, Sc); R(-1, -8 + oy, 3, 1, Sd); }
  else if (pose === 'rock' && anim && slow) { R(-2, -7 + oy, 5, 4, Sc); R(2, -7 + oy, 1, 4, Sd); }
  else { R(-2, -8 + oy, 5, 5, Sc); R(2, -8 + oy, 1, 5, Sd); }
  if (drift === 'compliance' && neutral) R(-2, -8 + oy, 5, 1, Sd);          // Withdrawn: shoulders dropped
  if (look.alum) { R(-1, -7 + oy, 1, 1, G[3]); R(1, -7 + oy, 1, 1, G[3]); }  // the grey coat's lapels
  // the electrode collar; Feral tears it off and the neck shows bare
  if (padsTorn) { R(-1, -8 + oy, 3, 1, F); R(3, -8 + oy, 1, 2, G[1]); }
  else R(-1, -8 + oy, 3, 1, look.alum ? G[0] : G[1]);
  // arms
  const armsUp = (side) => { R(side < 0 ? -3 : 3, -12 + oy, 1, 4, side < 0 ? Sc : Sd); R(side < 0 ? -3 : 3, -13 + oy, 1, 1, F); };
  const armDown = (side, sw = 0) => { R(side < 0 ? -3 : 3, -8 + oy + sw, 1, 4, side < 0 ? Sc : Sd); R(side < 0 ? -3 : 3, -4 + oy + sw, 1, 1, F); };
  const armsOut = () => { R(-6, -8 + oy, 3, 1, Sc); R(4, -8 + oy, 3, 1, Sd); R(-7, -8 + oy, 1, 1, F); R(7, -8 + oy, 1, 1, F); };
  const clasp = (dy) => { R(-3, -8 + oy, 1, dy + 8, Sc); R(3, -8 + oy, 1, dy + 8, Sd); R(-1, dy + oy, 3, 1, F); };
  if (pose === 'bang') { if (frame) { armsUp(-1); armDown(1); } else { armsUp(1); armDown(-1); } }
  else if (pose === 'kick') { armsUp(-1); armsUp(1); }
  else if (pose === 'write') { armDown(-1); R(3, -12 + oy, 1, 4, Sd); R(3 + (frame ? 1 : 0), -13 + oy, 1, 1, F); }
  else if (pose === 'write_air') {
    armDown(-1); R(3, -12, 1, 4, Sd);
    const ph = Math.floor(t * 3) % 3, path = [[3, -13], [5, -14], [4, -12]];
    R(path[(ph + 1) % 3][0], path[(ph + 1) % 3][1], 1, 1, G[1]); R(path[(ph + 2) % 3][0], path[(ph + 2) % 3][1], 1, 1, G[1]);
    R(path[ph][0], path[ph][1], 1, 1, F);
  }
  else if (pose === 'stretch') { armsUp(-1); armsUp(1); }
  else if (pose === 'offer') { R(-3, -12, 1, 4, Sc); R(3, -12, 1, 4, Sd); R(-4, -13, 9, 1, G[2]); R(-3, -14, 3, 1, G[4]); R(1, -14, 2, 1, G[3]); R(-4, -14, 1, 1, F); R(4, -14, 1, 1, F); }
  else if (pose === 'react_rings' || pose === 'react_strobe' || pose === 'react_spray') { R(-3, -11 + oy, 1, 3, Sc); R(3, -11 + oy, 1, 3, Sd); R(-3, -12 + oy, 1, 1, F); R(3, -12 + oy, 1, 1, F); }
  else if (pose === 'react_spark') { R(-5, -8, 2, 1, Sc); R(3, -8, 2, 1, Sd); R(-6, -9, 1, 1, F); R(5, -9, 1, 1, F); }
  else if (pose === 'react_frost' || pose === 'cry') { R(-2, -6 + oy, 5, 1, Sd); R(-3, -7 + oy, 1, 2, Sc); R(3, -7 + oy, 1, 2, Sd); }
  else if (kneel) clasp(-6);
  else if (pose === 'eat') { armDown(-1); if (anim && Math.floor(t * 2) % 2) { R(3, -10 + oy, 1, 3, Sd); R(2, -10 + oy, 1, 1, F); } else armDown(1); R(-4, 1, 9, 1, G[2]); R(-3, 0, 3, 1, G[4]); R(1, 0, 2, 1, G[3]); }
  else if (pose === 'wave') { armDown(-1); const wx = frame ? 5 : 3; R(3, -9, 1, 1, Sd); R(wx, -13, 1, 4, Sd); R(wx, -14, 1, 1, F); }
  else if (pose === 'tap') { armDown(-1); const ty = frame ? 0 : 1; R(3, -15 + ty, 1, 7, Sd); R(3, -16 + ty, 1, 1, F); if (frame && anim) { rect(c, 41, 0, 3, 1, G[4]); rect(c, 42, 1, 1, 1, G[3]); } }
  else if (pose === 'salute') { armDown(-1); R(3, -9, 1, 1, Sd); R(4, -11, 1, 3, Sd); R(2, -12, 3, 1, Sd); R(1, -12, 1, 1, F); }
  else if (pose === 'box') {
    if (frame) { R(3, -8, 4, 1, Sd); R(7, -8, 1, 1, F); R(-3, -9, 1, 2, Sc); R(-2, -10, 1, 1, F); }
    else { R(-6, -8, 4, 1, Sc); R(-7, -8, 1, 1, F); R(3, -9, 1, 2, Sd); R(2, -10, 1, 1, F); }
  }
  else if (pose === 'chant' || st.chant) armsOut();
  else if (pose === 'scratch') {
    R(-3, -8 + oy, 1, 4, Sc); R(3, -8 + oy, 1, 4, Sd); R(-3, -4 + oy + (frame ? 0 : 1), 1, 1, F); R(3, -4 + oy + (frame ? 1 : 0), 1, 1, F);
    if (anim && Math.random() < 0.4) R(Math.round(rand(-4, 4)), -2 + Math.round(rand(0, 2)), 1, 1, G[2]);
  }
  else if (pose === 'listen') { armDown(-1); R(3 + hx, -11 + oy, 1, 4, Sd); R(3 + hx, -12 + oy, 1, 1, F); }
  else if (pose === 'throw') { armDown(-1); if (p.stepT < 0.5) armsUp(1); else { R(3, -9, 3, 1, Sd); R(6, -9, 1, 1, F); } }
  else if (pose === 'cover') { R(-4, -9 + oy, 1, 3, Sc); R(4, -9 + oy, 1, 3, Sd); R(-3, -10 + oy, 1, 1, Sc); R(3, -10 + oy, 1, 1, Sd); R(-2, -10 + oy, 5, 1, F); R(-2, -9 + oy, 5, 1, Fd); }
  else if (pose === 'hollow_tremor') {
    const j = anim ? Math.floor(t * 2.5) % 2 : 0, inhale = anim && (t % 2.6) < 1.0;
    R(-3, (inhale ? -8 : -7) + oy, 1, inhale ? 4 : 3, Sc); R(3, (inhale ? -8 : -7) + oy, 1, inhale ? 4 : 3, Sd);
    R(-3 + j, -4 + oy, 1, 1, F); R(3 - j, -4 + oy, 1, 1, F);
    if (node && node.id === 'hollow_breath' && anim && (t % 2.6) >= 1.3) R(3, -10 + oy - Math.floor(((t % 2.6) - 1.3) * 2), 1, 1, G[2]);
  }
  else if (pose === 'makebed') { const hy2 = frame ? -1 : 0; R(-3, -9 + hy2, 1, 3, Sc); R(3, -9 - hy2, 1, 3, Sd); R(-3, -10 + hy2, 1, 1, F); R(3, -10 - hy2, 1, 1, F); }
  else if (pose === 'tiles') { armDown(-1); R(3, -5 + oy, 1, 4, Sd); R(3, -1 + oy, 1, 1, F); }
  else if (pose === 'whisper') { R(-2, -7, 1, 3, Sc); R(2, -7, 1, 3, Sd); }
  else if (pose === 'mouth') clasp(-5);
  else if (pose === 'laugh') { R(-3, -8 + oy, 1, 2, Sc); R(3, -8 + oy, 1, 2, Sd); R(-1, -5 + oy, 1, 1, F); R(1, -5 + oy, 1, 1, F); }
  else if (pose === 'speak') { armDown(-1); if (frame) { R(3, -8 + oy, 1, 2, Sd); R(4, -7 + oy, 2, 1, Sd); R(6, -7 + oy, 1, 1, F); } else armDown(1); }
  else if (pose === 'read') { R(-3, -6 + oy, 1, 2, Sc); R(3, -6 + oy, 1, 2, Sd); R(-3, -9 + oy, 7, 4, G[4]); R(-2, -8 + oy, 5, 1, G[2]); R(-2, -6 + oy, 3, 1, G[2]); R(-4, -8 + oy, 1, 2, F); R(4, -8 + oy, 1, 2, F); }
  else if (pose === 'rock') { if (anim && slow) { R(-3, -7 + oy, 1, 3, Sc); R(3, -7 + oy, 1, 3, Sd); R(-3, -4 + oy, 1, 1, F); R(3, -4 + oy, 1, 1, F); } else { armDown(-1); armDown(1); } }
  else if (walking) { const sw = pose === 'run' ? Math.floor(t * 14) % 2 : frame; armDown(-1, sw ? -1 : 0); armDown(1, sw ? 0 : -1); }
  else if (pose === 'stand' && term === 'feral') { armDown(-1); armDown(1); R(-4, -4, 2, 1, F); R(3, -4, 2, 1, F); } // fists out, squared up
  else { armDown(-1); armDown(1); }
  if (st.read && pose === 'sit') { R(-2, -6 + oy, 5, 2, G[4]); R(0, -6 + oy, 1, 2, G[2]); }
  x = xs;
  // legs
  if (floorSit) { R(-2, -4 + oy, 2, 2, Sc); R(1, -4 + oy, 2, 2, Sc); R(-2, -2 + oy, 2, 1, Sd); R(1, -2 + oy, 2, 1, Sd); }
  else if (seated) { R(-2, -3 + oy, 5, 1, Sc); R(-2, -2 + oy, 2, 1, Sd); R(1, -2 + oy, 2, 1, Sd); }
  else if (kneel) { R(-2, -3 + oy, 5, 2, Sc); R(-3, -1 + oy, 2, 1, Sd); R(2, -1 + oy, 2, 1, Sd); }
  else if (crouch) { R(-2, -2 + oy, 2, 1, Sd); R(1, -2 + oy, 2, 1, Sd); }
  else if (pose === 'kick') {
    R(-2, -3, 2, LH, Sc); R(-2, -1 + tl, 2, 1, Sd);
    if (frame) { R(1, -5, 2, 2, Sc); R(3, -6, 3, 2, Sd); } else { R(1, -3, 2, LH, Sc); R(1, -1 + tl, 2, 1, Sd); }
  } else if (walking) {
    const f2 = pose === 'run' ? Math.floor(t * 14) % 2 : frame;
    if (f2) { R(-2, -3, 2, LH, Sc); R(1, -3, 2, LH - 1, Sc); R(-2, -1 + tl, 2, 1, Sd); R(1, -2 + tl, 2, 1, Sd); }
    else { R(-2, -3, 2, LH - 1, Sc); R(1, -3, 2, LH, Sc); R(-2, -2 + tl, 2, 1, Sd); R(1, -1 + tl, 2, 1, Sd); }
  } else if (pose === 'box' || (pose === 'stand' && term === 'feral')) {
    R(-3, -3, 2, LH, Sc); R(2, -3, 2, LH, Sc); R(-3, -1 + tl, 2, 1, Sd); R(2, -1 + tl, 2, 1, Sd);
  } else {
    R(-2, -3, 2, LH, Sc); R(1, -3, 2, LH, Sc); R(-2, -1 + tl, 2, 1, Sd); R(1, -1 + tl, 2, 1, Sd);
    if (pose === 'attention' || pose === 'salute') R(0, -3, 1, LH, Sd); // heels together
  }
  if (look.alum && !seated && !kneel && !crouch && !walking) { R(-2, -3, 5, 1, Sc); R(2, -3, 1, 1, Sd); } // the coat's hem
  y += tl;
  // details
  if (node && node.id === 'eat_refuse') { rect(c, x - 11, y, 7, 1, G[2]); rect(c, x - 10, y - 1, 3, 1, G[4]); rect(c, x - 6, y - 1, 1, 1, G[3]); } // the tray he will not touch
  if (pose === 'nest') for (let a = 0; a < 360; a += 30) {
    const nx = Math.round(x + Math.cos(a * Math.PI / 180) * 7), ny = Math.round(y - 1 + Math.sin(a * Math.PI / 180) * 2);
    rect(c, nx, ny, 2, 1, a % 60 ? G[2] : G[3]); rect(c, nx, ny + 1, 2, 1, G[1]);
  }
  if (pose === 'cry') {
    const ty = ((t * 18) % 8) | 0;
    c.fillStyle = G[4]; c.fillRect(x - 2, y - 9 + oy + ty, 1, 1); c.fillRect(x + 2, y - 8 + oy + ((ty + 4) % 8), 1, 1);
  }
  if (pose === 'sing') {
    const s = (t * 10) % 14;
    for (let i = 0; i < 2; i++) {
      const ny = y - 15 - ((s + i * 7) % 14), nx = x + 4 + Math.round(Math.sin(t * 3 + i) * 2) + i * 2;
      c.fillStyle = st.quiet ? G[2] : G[4]; c.fillRect(nx, ny, 2, 2); c.fillRect(nx + 1, ny - 3, 1, 3); c.fillRect(nx + 2, ny - 3, 1, 1);
    }
  }
  if (st.tapping || (node && node.tapping)) { if (frame) rect(c, x + 4, y + oy - 4, 1, 1, G[4]); }
  if ((pose === 'bang' || pose === 'kick') && frame && Math.floor(t * 7) % 4 === 0) { c.fillStyle = G[4]; c.fillRect(66, 8, 1, 1); c.fillRect(74, 7, 1, 1); }
  if (pose === 'react_frost') { c.fillStyle = G[4]; c.fillRect(x + 3, y - 12 - ((t * 6) % 3 | 0), 1, 1); }
}

// The stare: his face fills the bottom of the frame. The unblinking stare never blinks; Hollow
// blinks too much; a Vessel's pupils are lit.
function drawStareFace(c, t, look, node, term) {
  const x0 = 35, y0 = 38, F = G[look.face], Hc = G[look.hair], Fd = G[Math.max(0, look.face - 1)], Fm = G[Math.max(0, look.face - 3)];
  const vessel = term === 'vessel', anim = !reduceMotion;
  const hr = look.style === 1 ? 2 : look.style === 3 ? 5 : 4;
  rect(c, x0, y0, 15, hr, Hc); rect(c, x0, y0 + hr, 15, 21 - hr, vessel ? Fd : F);
  if (look.style === 2) { rect(c, x0, y0 + hr, 2, 12, Hc); rect(c, x0 + 13, y0 + hr, 2, 12, Hc); }
  else if (look.style !== 1) { rect(c, x0, y0 + hr, 1, 5, Hc); rect(c, x0 + 14, y0 + hr, 1, 5, Hc); }
  for (const [cx, cy] of [[x0, y0], [x0 + 14, y0], [x0, y0 + 20], [x0 + 14, y0 + 20], [x0, y0 + 19], [x0 + 14, y0 + 19], [x0 + 1, y0 + 20], [x0 + 13, y0 + 20]]) rect(c, cx, cy, 1, 1, G[0]);
  // brow
  rect(c, x0 + 2, y0 + 7, 11, 1, vessel ? G[0] : Fd);
  const shut = node && node.blinking && anim && Math.floor(t * 2.2) % 3 === 0;
  const wide = node && node.blink === false, hollow = term === 'hollow';
  for (const ex of [x0 + 2, x0 + 9]) {
    if (shut) { rect(c, ex, y0 + 9, 4, 1, Fm); continue; }
    rect(c, ex - 1, y0 + 8, 6, wide ? 5 : 4, Fd);
    rect(c, ex, y0 + 8, 4, wide ? 4 : 3, vessel ? G[1] : G[4]);
    if (vessel) { rect(c, ex + 1, y0 + 9, 2, 2, anim && Math.floor(t * 3) % 4 === 0 ? G[3] : G[4]); }
    else if (wide) { rect(c, ex + 1, y0 + 9, 2, 2, G[0]); rect(c, ex + 1, y0 + 9, 1, 1, G[4]); rect(c, ex + 3, y0 + 8, 1, 1, G[3]); }
    else { rect(c, ex + 1, y0 + 9, 2, 2, G[0]); rect(c, ex + 1, y0 + 9, 1, 1, G[4]); }
    if (hollow && !shut) rect(c, ex, y0 + 8, 4, 1, Fd); // half-lidded
  }
  // nose, mouth
  rect(c, x0 + 7, y0 + 11, 1, 4, Fd); rect(c, x0 + 6, y0 + 14, 3, 1, Fd);
  if (vessel) rect(c, x0 + 5, y0 + 17, 5, 2, G[0]);
  else if (term === 'conspirator') { rect(c, x0 + 5, y0 + 17, 5, 1, Fm); rect(c, x0 + 4, y0 + 16, 1, 1, Fm); rect(c, x0 + 10, y0 + 16, 1, 1, Fm); }
  else rect(c, x0 + 5, y0 + 17, 5, 1, Fm);
  // the collar band at the bottom edge, unless it has been torn off
  if (!(S.flags.padsTorn && !tut)) rect(c, x0 + 3, y0 + 21, 9, 1, look.alum ? G[0] : G[1]);
}

// Behavior change: for a few seconds after a family moves to a new node, corner ticks blink
// around the subject and a short strip names the family. The patient file has the detail.
function drawChangeCue(c, p, t) {
  const lc = S.lastChange;
  if (!lc || tut || lc.day !== S.day || p.hidden || p.gone) return;
  const age = S.time - lc.at;
  if (age < 0 || age > 4.5) return;
  const on = reduceMotion || Math.floor(t * 4) % 3 !== 2;
  if (!on) return;
  const x = Math.round(p.x), y = Math.round(p.y), lying = ['lie', 'collapsed', 'huddle', 'prostrate', 'pushup'].includes(p.pose);
  const x0 = x - 7, x1 = x + 7, y0 = lying ? y - 9 : p.pose === 'stare' ? 36 : y - 17, y1 = lying ? y + 2 : p.pose === 'stare' ? 61 : y + 2;
  for (const [cx, cy, dx, dy] of [[x0, y0, 1, 1], [x1, y0, -1, 1], [x0, y1, 1, -1], [x1, y1, -1, -1]]) {
    rect(c, cx, cy, 1, 1, G[4]); rect(c, cx + dx, cy, 1, 1, G[4]); rect(c, cx, cy + dy, 1, 1, G[4]);
  }
  if (age < 3.2) {
    const l1 = String(lc.family || 'SUBJECT').toUpperCase(), l2 = 'BEHAVIOR CHANGE', w = Math.max(textW(l1), textW(l2));
    rect(c, 42 - Math.floor(w / 2) - 2, 9, w + 4, 13, G[0]); textC(c, l1, 42, 10, G[4]); textC(c, l2, 42, 16, G[4]);
  }
}

// Speech bubbles. Quiet behaviors get a small dim bubble unless the Audio Feed is installed;
// the Channel's tongue jitters.
function drawBubble(c, p, msg, t) {
  const st = p.step || {}, hush = !!st.quiet, quiet = hush && !S.upgrades.has('audio'), chant = st.chant || (st.node && NODE[st.node].pose === 'chant');
  const seatedish0 = ['sit', 'sitfloor', 'cry', 'eat', 'tiles', 'kneel', 'rock', 'nest', 'hollow_tremor', 'cover', 'read', 'scratch'].includes(p.pose);
  if (quiet) {
    // Quiet speech without the Audio Feed: a tiny dark bubble. You can see that something is being
    // said, not what. The Audio Feed makes it readable.
    const hx = Math.round(p.x), hy = p.pose === 'stare' ? 40 : Math.round(p.y) - (seatedish0 ? 11 : p.pose === 'huddle' || p.pose === 'prostrate' ? 5 : 14);
    const bw = 11, bh = 5, bx = clamp(hx - 5, 1, 83 - bw), by = clamp(hy - bh - 3, 7, 60 - bh);
    rect(c, bx, by, bw, bh, G[0]); rect(c, bx + 1, by - 1, bw - 2, 1, G[0]); rect(c, bx + 1, by + bh, bw - 2, 1, G[0]);
    rect(c, bx, by - 1, 1, 1, G[1]); rect(c, bx + bw - 1, by - 1, 1, 1, G[1]); rect(c, bx, by + bh, 1, 1, G[1]); rect(c, bx + bw - 1, by + bh, 1, 1, G[1]);
    const k = Math.floor(t * 3) % 4;
    for (let i = 0; i < 3; i++) rect(c, bx + 2 + i * 3, by + 2, 2, 1, i === k ? G[2] : G[1]);
    rect(c, clamp(hx, bx + 2, bx + bw - 3), by + bh + 1, 1, 1, G[0]);
    return;
  }
  const words = msg.split(' '), lines = [''];
  for (const w of words) { const cur = lines[lines.length - 1]; if ((cur + ' ' + w).trim().length > 16) lines.push(w); else lines[lines.length - 1] = (cur + ' ' + w).trim(); }
  const bw = Math.max(...lines.map(l => textW(l))) + 6, bh = lines.length * 7 + 3;
  const seatedish = ['sit', 'sitfloor', 'cry', 'eat', 'tiles', 'kneel', 'rock', 'nest', 'hollow_tremor', 'cover', 'read', 'scratch'].includes(p.pose);
  const hx = Math.round(p.x), hy = p.pose === 'stare' ? 40 : Math.round(p.y) - (seatedish ? 11 : p.pose === 'huddle' || p.pose === 'prostrate' ? 5 : 14);
  const bx = clamp(hx - Math.round(bw / 2), 1, 83 - bw), by = clamp(hy - bh - 4, 7, 60 - bh);
  // A whisper heard through the Audio Feed is drawn dark, so it still reads as something said under the breath.
  const bg = hush ? G[0] : chant ? G[0] : G[4], fg = hush ? G[2] : chant ? G[4] : G[0];
  rect(c, bx, by, bw, bh, bg); rect(c, bx + 1, by - 1, bw - 2, 1, bg); rect(c, bx + 1, by + bh, bw - 2, 1, bg);
  if (chant) { rect(c, bx, by - 1, bw, 1, G[3]); rect(c, bx, by + bh, bw, 1, G[3]); }
  if (hush) { rect(c, bx, by - 1, bw, 1, G[1]); rect(c, bx, by + bh, bw, 1, G[1]); }
  rect(c, clamp(hx, bx + 2, bx + bw - 3), by + bh + 1, 2, 2, bg);
  lines.forEach((l, i) => {
    if (!chant) { text(c, l, bx + 3, by + 2 + i * 7, fg); return; }
    let cx = bx + 3;
    for (const ch of l) { text(c, ch, cx, by + 2 + i * 7 + (Math.sin(t * 9 + cx) > 0.6 ? -1 : 0), fg); cx += ch === '.' ? 2 : 4; }
  });
}

function drawFx(c, f, t) {
  const k = f.t / f.dur;
  switch (f.type) {
    case 'rings': for (let i = 0; i < 3; i++) { const r = ((f.t * 50 + i * 12) % 40); if (r > 2) ring(c, 42, 1, r, r < 26 ? G[4] : G[3]); } break;
    case 'spark': {
      if (f.t < 0.12) { c.fillStyle = 'rgba(184,239,208,0.35)'; c.fillRect(0, 0, 84, 66); }
      const px = Math.round(S.patient.x), py = Math.round(S.patient.y);
      for (let b = 0; b < 3; b++) { let x = px + rand(-6, 6), y = py - rand(2, 14); for (let s = 0; s < 4; s++) { const nx = x + rand(-3, 3), ny = y + rand(-3, 3); line(c, x, y, nx, ny, G[4]); x = nx; y = ny; } }
      break;
    }
    case 'spray': {
      const px = S.patient.x, py = S.patient.y - 10;
      if (k < 0.8) for (let i = 0; i < 18; i++) { const u = Math.random(); c.fillStyle = Math.random() < 0.5 ? G[4] : G[3]; c.fillRect(Math.round(42 + (px - 42) * u + rand(-2, 2) * u), Math.round(2 + (py - 2) * u), 1, 2); }
      for (let i = 0; i < 6; i++) { c.fillStyle = G[3]; c.fillRect(Math.round(px + rand(-6, 6)), Math.round(py + rand(0, 12)), 1, 1); }
      break;
    }
    case 'strobe': {
      const on = reduceMotion ? f.t < 0.2 : Math.floor(f.t * 6) % 2 === 0;
      if (on) { c.fillStyle = 'rgba(184,239,208,0.32)'; c.fillRect(0, 0, 84, 66); }
      break;
    }
    case 'frost': {
      const reach = Math.min(1, f.t / 1) * (k > 0.8 ? (1 - k) * 5 : 1);
      c.fillStyle = G[4];
      for (let y = 0; y < 66; y++) for (let x = 0; x < 84; x++) {
        const e = Math.min(x, y, 83 - x, 65 - y) / 14;
        if (e < reach && bayer(x * 3, y * 5) > e / reach + 0.35) c.fillRect(x, y, 1, 1);
      }
      break;
    }
    case 'tray': {
      // the tray flies from his hands to the door
      if (f.t < 0.5) break;
      const u = Math.min(1, (f.t - 0.5) / 0.4), tx = f.x + (70 - f.x) * u, ty = f.y - 9 - Math.sin(u * Math.PI) * 6 + (18 - f.y + 9) * u * 0.3;
      if (u < 1) { rect(c, Math.round(tx) - 2, Math.round(ty), 5, 1, G[3]); }
      else { rect(c, 66, 30, 6, 1, G[2]); if (!f.done) { f.done = true; Snd.play('bang'); S.shake = 0.15; } }
      break;
    }
    case 'hit': { c.fillStyle = 'rgba(184,239,208,0.18)'; c.fillRect(0, 0, 84, 66); break; }
    case 'intercom': { const n = Math.floor(f.t * 6) % 3; for (let i = 0; i <= n; i++) ring(c, 42, 0, 4 + i * 3, G[3]); break; }
    case 'float': textC(c, f.text, f.x, Math.round(f.y - f.t * 8), k > 0.75 && Math.floor(t * 12) % 2 ? G[2] : f.col); break;
  }
}

// ---------------------------------------------------------------- rendering: desk
function drawDesk(t) {
  ctx.save();
  if (S.shake > 0 && !reduceMotion) ctx.translate(Math.round(rand(-1, 1)), Math.round(rand(-1, 1)));
  ctx.drawImage(deskBg.canvas, 0, 0);
  // clock hands follow the shift clock
  const mins = (S.time / CFG.secondsPerHour) * 60 + CFG.shiftStartHour * 60;
  const ha = ((mins / 60) % 12) / 12 * Math.PI * 2 - Math.PI / 2, ma = (mins % 60) / 60 * Math.PI * 2 - Math.PI / 2;
  if (!S.stations.includes('B')) {
    line(ctx, 160, 17, 160 + Math.cos(ha) * 4, 17 + Math.sin(ha) * 4, P.ink);
    line(ctx, 160, 17, 160 + Math.cos(ma) * 6, 17 + Math.sin(ma) * 6, P.red1);
  }
  // monitors: every station draws its own cell; the routed one carries an amber frame
  const multi = S.stations.length > 1;
  for (const s of stationList()) {
    const r = screenRect(s), routed = s.id === S.focus;
    let lampOn = false;
    if (S.cells[s.id]) withCell(s.id, () => { drawCell(t); lampOn = alertShowing() && Math.floor(t * 4) % 2 === 0; });
    else drawNoFeed(cell, s, t);
    ctx.drawImage(cell.canvas, r.x, r.y, r.w, r.h);
    rect(ctx, s.x + s.w - 22, s.y + s.h - 10, 2, 2, lampOn ? P.red3 : P.red0);
    rect(ctx, s.x + s.w - 10, s.y + s.h - 10, 2, 2, multi && routed ? P.amb3 : G[3]);
    if (multi && routed) {
      rect(ctx, r.x - 1, r.y - 1, r.w + 2, 1, P.amb2); rect(ctx, r.x - 1, r.y + r.h, r.w + 2, 1, P.amb2);
      rect(ctx, r.x - 1, r.y, 1, r.h, P.amb2); rect(ctx, r.x + r.w, r.y, 1, r.h, P.amb2);
    }
  }
  // clipboard text
  if (clipboardRules().filter(r => S.active.has(r.id)).length <= 8) { text(ctx, 'RULES ' + subjId(), 12, 114, P.ink); rect(ctx, 12, 120, 46, 1, P.paper2); }
  // Eight lines fit under the header, nine without it. Once the Director has added rules, pending
  // ones are dropped first, then rescinded ones, then the oldest.
  let rows = clipboardRules();
  if (rows.length > 8) rows = rows.filter(r => S.active.has(r.id));
  if (rows.length > 9) rows = rows.filter(r => !S.rescinded.has(r.id)).slice(-9);
  let ly = rows.length > 8 ? 115 : 123;
  for (const r of rows) {
    if (S.active.has(r.id)) {
      const isNew = S.flags['memo_' + r.id] && S.flags['seen_' + r.id] !== true && Math.floor(t * 3) % 2 === 0;
      const gone = S.rescinded.has(r.id);
      text(ctx, 'NO ' + r.short, 12, ly, gone ? P.paper2 : isNew ? P.red2 : P.ink);
      if (gone) rect(ctx, 11, ly + 2, textW('NO ' + r.short) + 2, 1, P.red1);
      const c = S.counts[r.id].caught;
      if (c && !gone) text(ctx, String(Math.min(c, 99)), 58 - textW(String(Math.min(c, 99))), ly, P.red1);
    } else rect(ctx, 12, ly + 1, 26, 3, P.ink);
    ly += 6;
  }
  // the console is drawn at its design coordinates and shifted right by CONSOLE_DX
  ctx.save(); ctx.translate(CONSOLE_DX, 0);
  // cell selector: which station the console is routed to (hit box: HIT.route, same design coordinates)
  if (multi) {
    text(ctx, 'CELL', 152, 125, P.met4);
    liveStations().forEach((id, i) => {
      const x = 170 + i * 14, routed = id === S.focus, occ = !!S.cells[id];
      rect(ctx, x, 124, 12, 7, routed ? P.amb3 : P.met0);
      text(ctx, id, x + 4, 125, routed ? P.met0 : occ ? P.amb1 : P.met3);
    });
  }
  // LED readout
  const crs = 'CR ' + String(Math.min(S.credits, 9999)).padStart(4, '0');
  text(ctx, crs, 69, 115, P.red3);
  text(ctx, clockStr(), 118, 115, P.amb2);
  // day, live rank (last place blinks red), credits earned today
  const rk = liveRank(), nT = S.rivals.length + 1, lastPlace = rk === nT;
  text(ctx, 'D' + String(S.day).padStart(2, '0') + '/' + CFG.totalDays, 153, 115, P.amb2);
  text(ctx, 'RANK ' + (rk || '-') + '/' + nT, 180, 115, lastPlace ? (Math.floor(t * 3) % 2 ? P.red3 : P.red1) : P.amb2);
  text(ctx, '+' + String(Math.min(9999, S.today.earned)).padStart(4, '0'), 233, 115, P.red3);
  // ARM switch
  rect(ctx, 76, 125, 2, 2, S.armed ? P.red3 : P.red0);
  disc(ctx, 77, 141, 3, P.met3); rect(ctx, 76, 140, 2, 2, P.met0);
  if (S.armed) { rect(ctx, 76, 133, 2, 8, P.met4); rect(ctx, 75, 132, 4, 2, P.red2); }
  else { rect(ctx, 76, 141, 2, 8, P.met4); rect(ctx, 75, 148, 4, 2, P.met4); }
  // stimulus dial
  rect(ctx, 96, 126, 28, 8, P.met0); rect(ctx, 97, 127, 26, 6, '#120c06');
  textC(ctx, curStim().short, 110, 128, P.amb2);
  D.stimuli.forEach((s, i) => {
    const a = (-90 + (i - 2) * 34) * Math.PI / 180;
    const col = i === S.stimIndex ? P.amb3 : S.owned.has(s.id) ? P.amb1 : P.met0;
    rect(ctx, Math.round(110 + Math.cos(a) * 12), Math.round(149 + Math.sin(a) * 12), 1, 1, col);
  });
  disc(ctx, 110, 149, 9, P.met0); disc(ctx, 110, 149, 8, P.met3); disc(ctx, 110, 149, 6, P.met2);
  { const a = (-90 + (S.stimIndex - 2) * 34) * Math.PI / 180; line(ctx, 110, 149, 110 + Math.cos(a) * 7, 149 + Math.sin(a) * 7, P.met4); }
  // intensity knob
  for (let v = 1; v <= 10; v++) {
    const a = (135 + (v - 1) * 30) * Math.PI / 180;
    const col = v > maxIntensity() ? P.red1 : v <= S.intensity ? (v >= 8 ? P.red3 : P.amb2) : P.met0;
    rect(ctx, Math.round(148 + Math.cos(a) * 12), Math.round(146 + Math.sin(a) * 12), 1, 1, col);
  }
  if (maxIntensity() < 10) { rect(ctx, 128, 131, 13, 7, P.yel); text(ctx, 'LIM', 129, 132, P.met0); }
  disc(ctx, 148, 146, 8, P.met0); disc(ctx, 148, 146, 7, P.met4); disc(ctx, 148, 146, 5, P.met3);
  { const a = (135 + (S.intensity - 1) * 30) * Math.PI / 180; line(ctx, 148, 146, 148 + Math.cos(a) * 6, 146 + Math.sin(a) * 6, P.met0); }
  textC(ctx, 'INT ' + String(S.intensity).padStart(2, '0'), 148, 162, P.met4);
  // administer button + cooldown lights
  const stim = curStim(), ready = 1 - S.cooldown / stim.cooldown;
  for (let i = 0; i < 10; i++) {
    const a = (-90 + i * 36) * Math.PI / 180, lit = S.cooldown <= 0 ? S.armed : i / 10 < ready;
    rect(ctx, Math.round(192 + Math.cos(a) * 12), Math.round(145 + Math.sin(a) * 12), 1, 1, lit ? (S.armed ? P.red3 : P.amb1) : P.red0);
  }
  const down = S.press.admin > 0;
  disc(ctx, 192, 146, 9, P.red0);
  disc(ctx, 192, down ? 146 : 145, 9, down ? P.red1 : P.red2);
  if (!down) { rect(ctx, 187, 139, 3, 1, P.red3); rect(ctx, 186, 140, 1, 2, P.red3); }
  // warn button
  const wd = S.press.warn > 0;
  rect(ctx, 225, 149 + (wd ? 1 : 0), 18, 9, wd ? P.yel0 : P.yel); if (!wd) rect(ctx, 225, 157, 18, 1, P.yel0);
  ctx.restore();
  // terminal screen
  text(ctx, 'REQ', 281, 117, G[3]);
  text(ctx, 'CR ' + S.credits, 281, 124, G[4]);
  text(ctx, '>ORDER', 281, 133, G[3]);
  if (Math.floor(t * 2) % 2) rect(ctx, 305, 133, 3, 5, G[3]);
  // orientation: pulse an outline around the control the Director is talking about
  const tgt = tut && tutTarget();
  if (tgt && !S.paused && Math.floor(t * 3) % 3) {
    ctx.fillStyle = P.amb1 || '#eda94c';
    rect(ctx, tgt.x - 1, tgt.y - 1, tgt.w + 2, 1, ctx.fillStyle); rect(ctx, tgt.x - 1, tgt.y + tgt.h, tgt.w + 2, 1, ctx.fillStyle);
    rect(ctx, tgt.x - 1, tgt.y, 1, tgt.h, ctx.fillStyle); rect(ctx, tgt.x + tgt.w, tgt.y, 1, tgt.h, ctx.fillStyle);
  }
  // hover outline
  if (hover && HIT[hover] && !S.paused) {
    const h = HIT[hover];
    ctx.fillStyle = 'rgba(255,224,160,0.5)';
    for (let x = h.x; x < h.x + h.w; x += 2) { ctx.fillRect(x, h.y, 1, 1); ctx.fillRect(x, h.y + h.h - 1, 1, 1); }
    for (let y = h.y; y < h.y + h.h; y += 2) { ctx.fillRect(h.x, y, 1, 1); ctx.fillRect(h.x + h.w - 1, y, 1, 1); }
  }
  ctx.restore();
}

// ---------------------------------------------------------------- rendering: office / title
function drawOffice(t) {
  ctx.drawImage(officeBg.canvas, 0, 0);
  const talking = dlg.typing && Math.floor(t * 9) % 2 === 0;
  const breathe = Math.floor(t * 0.8) % 2;
  // Director Crane
  const X = 160, Y = 36 + breathe;
  rect(ctx, X - 26, Y + 32, 52, 50, P.coat); rect(ctx, X - 22, Y + 30, 44, 3, P.coat);
  rect(ctx, X - 26, Y + 32, 4, 50, P.coat0); rect(ctx, X + 22, Y + 32, 4, 50, P.coat0);
  // shirt V and tie
  for (let i = 0; i < 14; i++) rect(ctx, X - 7 + Math.floor(i / 2), Y + 30 + i, 14 - Math.floor(i / 2) * 2, 1, P.shirt);
  rect(ctx, X - 2, Y + 31, 4, 3, P.red1); rect(ctx, X - 1, Y + 34, 2, 14, P.red2); rect(ctx, X - 2, Y + 46, 4, 2, P.red1);
  line(ctx, X - 8, Y + 30, X - 1, Y + 46, P.coat0); line(ctx, X + 8, Y + 30, X + 1, Y + 46, P.coat0);
  rect(ctx, X - 20, Y + 44, 8, 1, P.coat0); rect(ctx, X - 19, Y + 41, 1, 3, P.red2); rect(ctx, X - 17, Y + 40, 1, 4, P.ink);
  rect(ctx, X + 12, Y + 42, 8, 5, P.paper); rect(ctx, X + 13, Y + 43, 6, 1, P.red1);
  // neck + head
  rect(ctx, X - 5, Y + 24, 10, 7, P.skin0);
  rect(ctx, X - 11, Y + 2, 22, 24, P.skin); rect(ctx, X - 12, Y + 6, 24, 16, P.skin); rect(ctx, X - 9, Y, 18, 2, P.skin);
  rect(ctx, X - 12, Y + 14, 2, 8, P.skin0); rect(ctx, X - 9, Y + 24, 18, 2, P.skin0);
  rect(ctx, X - 13, Y + 8, 3, 9, P.met3); rect(ctx, X + 10, Y + 8, 3, 9, P.met3);
  rect(ctx, X - 14, Y + 11, 2, 5, P.skin0); rect(ctx, X + 12, Y + 11, 2, 5, P.skin0);
  rect(ctx, X - 6, Y + 1, 5, 1, '#e0b090');
  // glasses: opaque, lamp-lit lenses
  const glint = Math.floor(t * 0.5) % 5 === 0;
  for (const gx of [X - 9, X + 1]) {
    rect(ctx, gx, Y + 9, 8, 6, P.ink); rect(ctx, gx + 1, Y + 10, 6, 4, glint ? P.amb3 : '#c9d8d0');
    rect(ctx, gx + 1, Y + 10, 2, 1, '#fff8e0');
  }
  rect(ctx, X - 1, Y + 11, 2, 1, P.ink);
  rect(ctx, X - 1, Y + 15, 2, 4, P.skin0);
  rect(ctx, X - 6, Y + 20, 12, 2, P.met3);
  if (talking) rect(ctx, X - 3, Y + 22, 6, 2, P.red0); else rect(ctx, X - 3, Y + 22, 6, 1, P.skin0);
  // desk
  rect(ctx, 30, 108, 260, 72, P.wood1); rect(ctx, 30, 104, 260, 5, P.wood2); rect(ctx, 30, 104, 260, 1, P.wood3);
  for (let x = 40; x < 280; x += 60) { rect(ctx, x, 116, 50, 56, P.wood0); rect(ctx, x + 1, 117, 48, 54, P.wood1); rect(ctx, x + 22, 140, 6, 2, P.amb1); }
  // lamp
  rect(ctx, 58, 86, 26, 8, G[2]); rect(ctx, 58, 86, 26, 2, G[3]); rect(ctx, 58, 93, 26, 1, G[1]);
  rect(ctx, 70, 94, 2, 8, P.amb1); rect(ctx, 63, 101, 16, 3, P.amb1);
  for (let y = 94; y < 104; y++) for (let x = 56 - (y - 94); x < 86 + (y - 94); x++) if (bayer(x, y) < 0.3) rect(ctx, x, y, 1, 1, P.amb3);
  // papers + waiver
  rect(ctx, 104, 102, 28, 3, P.paper2); rect(ctx, 106, 101, 26, 3, P.paper);
  rect(ctx, 148, 101, 24, 4, P.paper); rect(ctx, 150, 102, 14, 1, P.paper2);
  if (S.name && S.log.some(e => e.type === 'signed')) line(ctx, 152, 103, 168, 102, P.ink); else rect(ctx, 166, 102, 3, 1, P.red2);
  rect(ctx, 176, 103, 12, 1, P.ink); rect(ctx, 187, 103, 2, 1, P.amb2);
  // specimen-ish mug
  rect(ctx, 236, 94, 9, 10, P.bei2); rect(ctx, 245, 96, 2, 5, P.bei2); rect(ctx, 237, 95, 7, 1, P.wood0);
  if (S.phase === 'review') { rect(ctx, 196, 100, 30, 5, P.paper); rect(ctx, 196, 100, 30, 1, P.red1); text(ctx, 'PROFILE', 198, 101, P.ink); }
}
// The title screen shows the lab console, dimmed by CSS on the frame.
function drawTitle(t) { drawDesk(t); }

// ---------------------------------------------------------------- input + hitboxes
const mainSlot = stationOf('A'), mainScreen = screenRect(mainSlot);
// What a monitor says on hover, and what a click on it does: route the console there, or open the
// file from the FILE label at the bottom of its screen.
function stationHint(id) {
  const s = stationOf(id);
  if (!S.stations.includes(id)) return 'Empty monitor slot. REQ-9 sells monitoring stations.';
  if (!S.cells[id]) { const tr = S.transfers.find(x => x.slot === id); return 'Station ' + id + ' · Cell ' + s.cell + (tr ? '. Subject ' + tr.entry.id + ' arrives at 06:00 tomorrow.' : '. Empty. Admit a subject from the Intake Ledger.'); }
  const sub = cellField(id, 'subject');
  if (S.stations.length < 2) return 'Cell ' + s.cell + ' · Subject ' + sub.id + '. The patient file is at the bottom of the screen. (F)';
  return 'Station ' + id + ' · Cell ' + s.cell + ' · Subject ' + sub.id + (id === S.focus ? '. The console is routed here.' : '. Click to route the console here. (' + (liveStations().indexOf(id) + 1) + ')');
}
function stationClick(id, y) {
  const s = stationOf(id);
  if (!S.stations.includes(id)) { toast('Slot ' + id + ' is wired. REQ-9 sells monitoring stations.', 'CONSOLE'); return; }
  const r = screenRect(s), onFile = y >= r.y + 58 && y < r.y + 66;
  if (S.cells[id] && id === S.focus) { if (onFile) openFile(); return; }
  routeTo(id);
  if (S.focus === id && onFile) openFile();
}
function refreshHits() {
  for (const id of ['B', 'C']) {
    const s = stationOf(id), r = S.stations.includes(id) ? { x: s.x, y: s.y, w: s.w, h: s.h + 8 } : { x: s.patch.x, y: s.patch.y, w: s.patch.w, h: s.patch.h + 6 };
    Object.assign(HIT['slot' + id], r);
  }
}
function rebuildDesk() { buildDesk(); refreshHits(); }
const X = CONSOLE_DX;
const HIT = {
  arm:      { x: 68 + X, y: 123, w: 18, h: 38, hint: 'ARM switch. Enables the feedback console. (A)', act: () => toggleArm() },
  dial:     { x: 96 + X, y: 125, w: 28, h: 42, hint: 'Stimulus selector. Click the left or right side, or scroll. (Q / E)', act: x => turnDial(x < 110 + X ? -1 : 1), wheel: d => turnDial(d) },
  knob:     { x: 134 + X, y: 130, w: 28, h: 38, hint: 'Intensity knob. Click the left or right side, or scroll. (↓ / ↑)', act: x => turnKnob(x < 148 + X ? -1 : 1), wheel: d => turnKnob(d) },
  admin:    { x: 177 + X, y: 130, w: 30, h: 38, hint: 'ADMINISTER feedback with the selected stimulus. (Space)', act: () => administer() },
  warn:     { x: 219 + X, y: 123, w: 30, h: 46, hint: 'Intercom. Warns the subject during an infraction, or just talks to them. (W)', act: () => warn() },
  rank:     { x: 150 + X, y: 112, w: 104, h: 11, hint: 'Day, your live rank among six technicians, and credits earned today. Last place at 17:00 is cut.', act: () => {} },
  rules:    { x: 6, y: 103, w: 59, h: 71, hint: 'Clipboard. The prohibited behaviors and your record. (R)', act: () => { S.flags.seenAll = true; ALL_RULES.forEach(r => S.flags['seen_' + r.id] = true); openRules(); } },
  shop:     { x: 274, y: 110, w: 40, h: 64, hint: 'REQ-9 requisition terminal. Spend credits. (S)', act: () => { Snd.play('click'); openShop(); } },
  file:     { x: mainScreen.x, y: mainScreen.y + 58, w: 38, h: 8, hint: 'Patient file: the subject\'s observed behaviors and status. (F)', act: () => { routeTo('A'); openFile(); } },
  route:    { x: 168 + X, y: 123, w: 46, h: 7, hint: 'Cell selector. Routes ADMINISTER and the intercom to a station. (1 / 2 / 3, or Tab)', off: () => S.stations.length < 2,
              act: x => routeKey(Math.floor((x - 170 - X) / 14)), wheel: d => cycleRoute(-d) },
  slotA:    { x: 8, y: 6, w: 96, h: 98, hint: () => stationHint('A'), act: (x, y) => stationClick('A', y) },
  slotB:    { x: 121, y: 34, w: 78, h: 70, hint: () => stationHint('B'), act: (x, y) => stationClick('B', y) },
  slotC:    { x: 224, y: 34, w: 78, h: 70, hint: () => stationHint('C'), act: (x, y) => stationClick('C', y) },
};
function hintOf(k) { const h = HIT[k].hint; return (typeof h === 'function' ? h() : h) || DEFAULT_HINT; }
const DEFAULT_HINT = 'Watch the feed. Correct infractions while they are happening.';
let hover = null;
function toGame(e) { const r = canvas.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * W, (e.clientY - r.top) / r.height * H]; }
function hitAt(x, y) { for (const k in HIT) { const h = HIT[k]; if (h.off && h.off()) continue; if (x >= h.x && x < h.x + h.w && y >= h.y && y < h.y + h.h) return k; } return null; }

canvas.addEventListener('pointermove', e => {
  if (S.phase !== 'desk') { canvas.style.cursor = S.phase === 'intro' ? 'pointer' : 'default'; return; }
  const [x, y] = toGame(e); hover = hitAt(x, y);
  canvas.style.cursor = hover ? 'pointer' : 'default';
  el.hint.textContent = hover ? hintOf(hover) : DEFAULT_HINT;
});
canvas.addEventListener('pointerleave', () => { hover = null; if (S.phase === 'desk') el.hint.textContent = DEFAULT_HINT; });
canvas.addEventListener('pointerdown', e => {
  Snd.init();
  if (S.phase === 'intro') { advance(); return; }
  if (S.phase !== 'desk' || S.paused) return;
  const [x, y] = toGame(e), k = hitAt(x, y);
  if (k) { e.preventDefault(); HIT[k].act(x, y); }
});
canvas.addEventListener('wheel', e => {
  if (S.phase !== 'desk' || S.paused) return;
  const [x, y] = toGame(e), k = hitAt(x, y);
  if (k && HIT[k].wheel) { e.preventDefault(); HIT[k].wheel(e.deltaY < 0 ? 1 : -1); }
}, { passive: false });
el.dlg.addEventListener('click', () => advance());
el.coachNext.addEventListener('click', e => { e.stopPropagation(); Snd.play('click'); if (tut) tutNext(); canvas.focus({ preventScroll: true }); });
el.coachSkip.addEventListener('click', e => { e.stopPropagation(); Snd.play('click'); logEvent('skipped-orientation'); endOrientation(); });
el.modalX.addEventListener('click', dismissModal);
el.scrim.addEventListener('click', dismissModal);

window.addEventListener('keydown', e => {
  if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
  const k = e.key;
  if (k === 'm' || k === 'M') { toggleMute(); return; }
  if (!el.modal.hidden) {
    if (k === 'Escape') { e.preventDefault(); dismissModal(); }
    return;
  }
  if (S.phase === 'intro') {
    if ((k === ' ' || k === 'Enter') && !el.dlgChoices.children.length) { e.preventDefault(); advance(); }
    else if (k === ' ' && dlg.typing) { e.preventDefault(); advance(); }
    return;
  }
  if (S.phase !== 'desk' || S.paused) return;
  if (k === 'Tab' && S.stations.length > 1) { e.preventDefault(); cycleRoute(e.shiftKey ? -1 : 1); return; }
  const map = {
    ' ': administer, a: toggleArm, A: toggleArm, w: warn, W: warn,
    1: () => routeKey(0), 2: () => routeKey(1), 3: () => routeKey(2),
    q: () => turnDial(-1), Q: () => turnDial(-1), e: () => turnDial(1), E: () => turnDial(1),
    ArrowLeft: () => turnDial(-1), ArrowRight: () => turnDial(1),
    ArrowUp: () => turnKnob(1), ArrowDown: () => turnKnob(-1), ']': () => turnKnob(1), '[': () => turnKnob(-1),
    r: () => HIT.rules.act(), R: () => HIT.rules.act(), s: () => HIT.shop.act(), S: () => HIT.shop.act(), f: openFile, F: openFile,
  };
  if (map[k]) { e.preventDefault(); Snd.init(); map[k](); }
});

function toggleMute() {
  Snd.setMuted(!Snd.muted);
  el.mute.textContent = Snd.muted ? 'Sound off' : 'Sound on';
  el.mute.setAttribute('aria-pressed', String(!Snd.muted));
  try { localStorage.setItem('eldritch-muted', Snd.muted ? '1' : '0'); } catch (e) {}
}
el.mute.addEventListener('click', () => { Snd.init(); toggleMute(); });
try { if (localStorage.getItem('eldritch-muted') === '1') { Snd.muted = true; el.mute.textContent = 'Sound off'; el.mute.setAttribute('aria-pressed', 'false'); } } catch (e) {}

// First click or key on the title collapses the full program name into ELDRITCH.
function collapseTitle() {
  if (el.title.classList.contains('collapsed')) return false;
  Snd.init(); Snd.play('memo'); Snd.tone(110, 1.2, 'sine', 0.06, 55);
  el.title.classList.add('collapsed');
  setTimeout(() => el.begin.focus({ preventScroll: true }), reduceMotion ? 0 : 1200);
  return true;
}
el.title.addEventListener('click', e => { if (collapseTitle()) e.stopPropagation(); });
window.addEventListener('keydown', e => {
  if (S.phase === 'title' && !el.title.hidden && (e.key === 'Enter' || e.key === ' ') && collapseTitle()) e.preventDefault();
});
el.begin.addEventListener('click', () => {
  Snd.init(); Snd.play('switch'); clearSave();
  el.title.hidden = true; el.frame.classList.remove('dim'); S.phase = 'intro';
  el.hint.textContent = 'Click or press Space to continue.';
  runScript(D.intro, null);
});
const skip = $('skip-intro');
if (skip) skip.addEventListener('click', () => {
  Snd.init(); clearSave(); el.title.hidden = true; logEvent('skipped-intro'); startDesk();
});
// Continue from the start of the last day reached (saved in this browser only).
const save = loadSave(), cont = $('continue');
if (save && cont && save.day > 1 && !/^#day/.test(location.hash)) {
  cont.hidden = false; cont.textContent = 'Continue · Day ' + save.day;
  el.begin.textContent = 'New game'; el.begin.classList.add('ghost');
  cont.addEventListener('click', () => { Snd.init(); Snd.play('switch'); applySave(save); el.title.hidden = true; startDesk(); });
}
// Testing shortcut: open the link with #day12 (any day 1-20) to start that morning with a rough
// mid-game state. Add a terminal state to start there: #day14-vessel, -hollow, -conspirator, -feral.
const jump = /^#day(\d{1,2})(?:-(vessel|hollow|conspirator|feral))?(?:\+(\d-\d\d))?$/.exec(location.hash);
if (jump) {
  const d = clamp(+jump[1], 1, CFG.totalDays);
  S.day = d; S.credits = 60 * d;
  for (let i = 1; i < d; i++) {
    const opp = 60 + i * 12, scores = Object.fromEntries(S.rivals.map(r => [r.name, Math.round(opp * r.drive * 0.9)]).concat([[S.name, Math.round(opp * 0.95)]]));
    S.history.push({ day: i, opportunity: opp, scores });
    if (isCutDay(i)) { const r = S.rivals.reduce((lo, x, j) => x.drive < S.rivals[lo].drive ? j : lo, 0); S.rivals.splice(r, 1); S.noise.splice(r, 1); }
  }
  D.rules.forEach(r => { if (r.unlockDay < d) { S.active.add(r.id); S.flags['memo_' + r.id] = true; } });
  if (jump[2]) {
    const axis = B.terminals[jump[2]].axis;
    S.axes[axis] = 85;
    for (let i = 0; i < 16; i++) drift();
    enterTerminal(jump[2]);
    for (const m of S.nextMemos) S.memoQueue.push({ memo: m.id, cell: m.cell });
    S.nextMemos = [];
    if (jump[2] === 'vessel') S.mural = EYE_PIX.length - 10;
    S.owned.add('shock'); S.upgrades.add('limiter');
  }
  // #day8+0-24 starts with that roster subject in the cell; the ledger is rolled as on any morning.
  if (jump[3] && SUBJ.roster.some(r => r.id === jump[3])) { S.transfers = [{ entry: SUBJ.roster.find(r => r.id === jump[3]), day: d - 1, slot: 'A' }]; const q = S.memoQueue; intake(); S.memoQueue = q; S.lastTransferDay = -99; S.flags.arrivedDay = 0; }
  if (d >= 3) S.alumni.push(buildAlumnus({ name: 'Tech. Pryce', day: 1, drive: 0.55 }));
  rollLedger();
  S.today.changes = [];
  rollNoise();
  if (cont) { cont.hidden = false; cont.textContent = 'Start at day ' + d; cont.onclick = () => { Snd.init(); el.title.hidden = true; startDesk(); }; }
}


// ---------------------------------------------------------------- orientation (before day 1)
// The Director walks the player through the console on a volunteer in Cell 2. The run is
// snapshotted first and restored afterwards, so nothing done here carries into day 1.
const ORI = D.orientation;
function subjId() { return S.subject.id; }
function cellNo() { return S.subject.cell || CELL; }
function snapshot() {
  storeCell();
  const d = { owned: [...S.owned], upgrades: [...S.upgrades], active: [...S.active], rescinded: [...S.rescinded] };
  for (const k of SAVE_FIELDS) d[k] = S[k];
  return JSON.parse(JSON.stringify(d));
}
function startOrientation() {
  tut = { i: -1, snap: snapshot(), base: {}, wait: 0, provokeT: 2.5 };
  logEvent('orientation');
  S.phase = 'desk'; el.dlg.hidden = true; el.frame.classList.remove('dim');
  S.active = new Set(ORI.rules); S.flags.seenAll = false;
  // The volunteer in Cell 2 is her own person; the snapshot brings Subject 0-17 back for day 1.
  S.subject = makeSubject(ORI.volunteer); S.subject.cell = ORI.cell; S.mods = mergeMods([]);
  S.patient = newPatient(); S.patient.steps = [];
  el.hint.textContent = DEFAULT_HINT;
  el.coach.hidden = false;
  tutNext();
}
function tutStepDef() { return tut && ORI.steps[tut.i]; }
function tutTarget() {
  const st = tutStepDef();
  if (!st || !st.target) return null;
  return st.target === 'feed' ? mainScreen : HIT[st.target];
}
function tutNext() {
  tut.i++;
  const st = tutStepDef();
  if (!st) { endOrientation(); return; }
  tut.base = { warned: S.today.warned, caught: S.today.caught, log: S.log.length };
  tut.wait = 0;
  let txt = st.text;
  if (st.grant) {
    const item = D.shop.find(i => i.id === st.grant), need = Math.max(0, costOf(item) - S.credits);
    S.credits += need; txt = txt.replaceAll('{cr}', costOf(item));
  }
  if (st.stare) interrupt([{ move: SPOT.center }, { pose: 'stand', facing: 'front', dur: 30, bubble: st.stare }]);
  el.coachStep.textContent = 'Orientation ' + (tut.i + 1) + ' of ' + ORI.steps.length;
  el.coachText.textContent = fmt(txt);
  el.coachNext.hidden = !st.next;
  el.coachSkip.hidden = tut.i === ORI.steps.length - 1;
  el.coachNext.textContent = typeof st.next === 'string' ? st.next : 'Next';
  if (st.next) el.coachNext.focus({ preventScroll: true });
  Snd.play('memo');
}
function tutDone(st) {
  const b = tut.base;
  switch (st.wait) {
    case 'rules': return S.flags.seenAll;
    case 'warn': return S.today.warned > b.warned;
    case 'arm': return S.armed;
    case 'knob': return S.intensity >= 3;
    case 'admin': return S.today.caught > b.caught;
    case 'buy': return S.upgrades.has(st.grant || 'alert');
    case 'alerted': return S.log.slice(b.log).some(e => e.type === 'warn' || e.type === 'feedback' || e.type === 'missed' || e.type === 'ignored') || tut.wait > 14;
    case 'file': return S.log.slice(b.log).some(e => e.type === 'read-file');
  }
  return false;
}
// The volunteer sits quietly, and goes to the door when a step needs him to.
function tutPlan() {
  const st = tutStepDef();
  if (st && st.provoke && tut.provokeT <= 0) { tut.provokeT = 4; return planNode(NODE[BASE.door], true); }
  return [{ move: SPOT.bedSit }, { pose: 'sit', facing: 'front', dur: st && st.provoke ? 1.5 : rand(2.5, 4) }];
}
function tutStep(dt) {
  S.cooldown = Math.max(0, S.cooldown - dt); S.warnCd = Math.max(0, S.warnCd - dt); S.shake = Math.max(0, S.shake - dt);
  tut.provokeT -= dt; tut.wait += dt;
  if (!S.patient.dead) updatePatient(dt);
  for (const f of S.fx) f.t += dt;
  S.fx = S.fx.filter(f => f.t < f.dur);
  const st = tutStepDef();
  if (st && st.wait && tutDone(st)) { tut.done = (tut.done || 0) + dt; if (tut.done > 0.9) { tut.done = 0; Snd.play('credit'); tutNext(); } }
}
function endOrientation() {
  if (!tut) return;
  const snap = tut.snap;
  tut = null; el.coach.hidden = true;
  closeModal();
  applySave(snap);
  S.patient = newPatient();
  S.fx = []; S.puddles = []; S.inst = null; S.violation = null; S.lastInst = null; S.armed = false; S.cooldown = 0; S.warnCd = 0;
  S.flags.fileNew = false;
  logEvent('orientation-done');
  startDesk();
  toast(ORI.reset, 'CONSOLE');
}

// ---------------------------------------------------------------- loop
let last = performance.now(), T = 0;
// One step of the shift. The frame loop calls it with real time; play-test bots call it directly.
function step(dt) {
  if (tut) { tutStep(dt); return; }
  S.time += dt;
  S.cooldown = Math.max(0, S.cooldown - dt); S.warnCd = Math.max(0, S.warnCd - dt); S.shake = Math.max(0, S.shake - dt);
  S.today.feedT -= dt;
  activateRules();
  if (S.memoQueue.length) { const it = S.memoQueue.shift(); if (it.cell && S.cells[it.cell]) withCell(it.cell, () => showDirective(it)); else showDirective(it); return; }
  eachCell(() => stepCell(dt));
  const hr = hourNow();
  if (hr !== S.flags.toastHour && S.time > 5) {
    S.flags.toastHour = hr;
    eachCell(() => { drift(); damageTick(); if (S.fam.pushups.node === 'pushups_drill' && !S.patient.scheduled) S.patient.scheduled = NODE.pushups_drill; });
    if (liveRank() === S.rivals.length + 1 && Math.random() < 0.6) toast(fmt(pick(D.lines.lastPlace)).replaceAll('{rival}', topRival()));
    else if (S.terminal && Math.random() < 0.3) toast(fmt(pick(B.terminals[S.terminal].director)));
  }
  if (S.endEarlyAt && S.time >= S.endEarlyAt) { endShift(); return; }
  if (S.time >= shiftLen()) endShift();
}
// One cell's share of a step: its subject, its scheduled behaviors, its effects.
function stepCell(dt) {
  S.humBoost = Math.max(0, S.humBoost - dt * 0.3);
  if (S.repair) { S.repair.t += dt; if (S.repair.t >= S.repair.dur) finishRepair(); }
  if (S.medic) { S.medic.t += dt; if (S.medic.t >= S.medic.dur) finishMedic(); }
  if (!S.patient.dead && !S.patient.gone) updatePatient(dt);
  // Trait-scheduled behaviors (the alumnus's 17:00 glance at the camera).
  if (mod('scheduled')) {
    if (S.flags.schedDay !== S.day) { S.flags.schedDay = S.day; S.flags.sched = {}; }
    for (const id in S.mods.scheduled) {
      const [hh, mm] = S.mods.scheduled[id].split(':').map(Number), at = ((hh - CFG.shiftStartHour) * 60 + mm) / 60 * CFG.secondsPerHour - 4;
      const n = NODE[id];
      if (S.time < at || S.flags.sched[id] || !n || !liveFamilies().includes(n.family)) continue;
      S.flags.sched[id] = true;
      if (!S.patient.collapsed && !(S.inst && S.inst.infraction) && !medical()) interrupt(planNode(n, isInfraction(n))); else S.patient.scheduled = n;
    }
  }
  for (const f of S.fx) f.t += dt;
  for (const f of S.fx) if (f.type === 'spray' && f.t >= f.dur && !f.done) { f.done = true; S.puddles.push({ x: Math.round(S.patient.x), y: Math.round(S.patient.y) + 1, r: 4 }); if (S.puddles.length > 4) S.puddles.shift(); }
  S.fx = S.fx.filter(f => f.t < f.dur);
}
function frame(now) {
  let dt = Math.min(0.05, (now - last) / 1000); last = now; T += dt;
  for (const k in S.press) S.press[k] = Math.max(0, S.press[k] - dt);
  if (S.phase === 'intro') updateDialogue(dt);
  if (S.pendingEnding && !S.paused) { S.pendingEnding.t -= dt; for (const f of S.fx) f.t += dt; if (S.pendingEnding.t <= 0) ending(S.pendingEnding.id); }
  if (S.phase === 'desk' && !S.paused && !document.hidden && !S.pendingEnding) step(dt * S.speed);
  Snd.hum();
  if (S.phase === 'title') drawTitle(T);
  else if (S.phase === 'intro' || S.phase === 'review') drawOffice(T);
  else if (S.phase === 'ending') { if (D.endings[S.endingId].scene === 'desk') drawDesk(T); else drawOffice(T); }
  else drawDesk(T);
  requestAnimationFrame(frame);
}

buildDesk(); buildOffice();
// Hooks for automated play-testing. sim(seconds, bot) runs the shift without rendering and calls
// bot(S) every step, including while a modal is open.
function sim(seconds, bot) {
  let n = Math.round(seconds / 0.05);
  while (n-- > 0 && S.phase !== 'ending') {
    if (bot) bot(S);
    if (S.phase === 'desk' && !S.paused && !S.pendingEnding) step(0.05);
    if (S.pendingEnding && !S.paused) { S.pendingEnding.t -= 0.05; if (S.pendingEnding.t <= 0) ending(S.pendingEnding.id); }
  }
}
window.ELDRITCH_DEBUG = { warn, administer, moveFamily, buy: id => buy(D.shop.find(i => i.id === id)), toggleArm, turnKnob, turnDial, board, ending, endShift, sim, step,
  startDesk, nextDay, enterTerminal, drift, NODE, RULE, axisTop, stateNow, liveRank, closeModal, openFile, openShop, openRules, planNode, drawCell, cell: cell.canvas,
  buySubject, rerollLedger, rollLedger, intake, mergeMods, ledgerPrice, SUBJ, routeTo, useCell, cellField, destBlocker, liveStations, occupied, rebuildDesk,
  breakItem, damageList, damageTick, buyRepair, startRepair, finishRepair, startMedic, wreck, DMG };
el.hint.textContent = 'Best with a mouse and keyboard. Press M to mute.';
canvas.tabIndex = 0;
requestAnimationFrame(frame);
})();
