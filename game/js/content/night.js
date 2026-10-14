/*
 * The night, in order. Each visitor slot becomes a scene named 'at:<id>':
 * clock, a mop-up if the last one left a mess, the visitor's own `arrive`
 * steps, the desk, then anyone due back after being turned away.
 * Interludes run a scene from story.js. Visitors that don't exist yet are
 * skipped, so the night still runs while content is being written.
 *
 * Debug: EMIT.game.start('at:doe') starts the night at that visitor.
 */
(function () {
  var E = window.EMIT;
  var S = E.content.scenes, V = E.content.visitors;

  var NIGHT = [
    // after the Act One card the guard settles in, and the player finds the radio
    { act: 'Act One', title: 'The night shift', after: [
      // if the player already has the radio playing, Lou turns the dial instead of switching it on
      { 'if': function () { return !!(E.radio && E.radio.isOn()); }, then: [
        { narrate: 'My hands hadn\'t stopped shaking. I changed the channel, looking for something to calm my nerves.' },
        { radio: 'calm' }
      ], 'else': [
        { narrate: 'My hands hadn\'t stopped shaking. I flipped on the radio to calm my nerves.' },
        { radio: 'on' }
      ] },
      { pause: 900 },
      { narrate: 'Six stations if you kept turning the dial. Tonight I had a feeling I\'d need all of them.' }
    ] },
    { id: 'pizza', at: '10:52 PM' },
    { id: 'gent', at: '11:06 PM' },
    { id: 'sister', at: '11:20 PM' },
    { id: 'courier', at: '11:34 PM' },
    { id: 'janitor', at: '11:48 PM' },
    { id: 'influencer', at: '12:02 AM' },
    { act: 'Act Two', title: 'Company' },
    { id: 'doe', at: '12:18 AM' },
    { id: 'victorian', at: '12:30 AM' },
    { id: 'reporter', at: '12:44 AM' },
    { id: 'intern', at: '12:58 AM' },
    { id: 'monk', at: '1:10 AM' },
    { id: 'mit', at: '1:24 AM' },
    { id: 'soldier', at: '1:38 AM' },
    { id: 'liaison', at: '1:52 AM' },
    { id: 'hippie', at: '2:04 AM' },
    { id: 'viking', at: '2:18 AM' },
    { scene: 'device', at: '2:30 AM' },
    { act: 'Act Three', title: 'Things that aren\'t people' },
    { id: 'android', at: '2:44 AM' },
    { id: 'wife', at: '2:58 AM' },
    { id: 'professor', at: '3:10 AM' },
    { id: 'roman', at: '3:24 AM' },
    { id: 'investor', at: '3:36 AM' },
    { id: 'foodinspector', at: '3:50 AM' },
    { id: 'aide', at: '4:02 AM' },
    { id: 'robot', at: '4:16 AM' },
    { id: 'dotcom', at: '4:28 AM' },
    { id: 'mother', at: '4:40 AM' },
    { scene: 'holdOff', at: '4:52 AM' },
    { act: 'Act Four', title: 'Wanted' },
    { id: 'insurance', at: '5:04 AM' },
    { id: 'lawyer', at: '5:16 AM' },
    { id: 'engineer', at: '5:28 AM' },
    { id: 'futureyou', at: '5:40 AM' },
    { id: 'warden', at: '5:52 AM' },
    { scene: 'pitch', at: '6:04 AM' }
  ];
  E.content.night = NIGHT;

  // lines for mopping up after a shooting, picked by slot so they vary
  var MOPS = [
    'I dragged what was left into the supply closet and mopped. The rain covered the sound.',
    'Mop, bucket, closet. I was getting faster at it, which I didn\'t like.',
    'I cleaned up. The floor took bleach better than I did.',
    'Another one for the supply closet. The mop knew the way by now.'
  ];

  // act numbers, for the notebook: every slot knows which act it belongs to
  var actNo = 0, ACT_OF = {}, ACTS = [];
  NIGHT.forEach(function (n) {
    if (n.act) { actNo++; ACTS.push({ no: actNo, name: n.act, title: n.title }); }
    n.actNo = Math.max(1, actNo);
    if (n.id && !(n.id in ACT_OF)) ACT_OF[n.id] = n.actNo;
  });
  E.content.acts = ACTS;
  E.content.actOf = ACT_OF;

  var hasDevice = false;
  var scenes = [];
  NIGHT.forEach(function (n, i) {
    if (n.id && !V[n.id]) return;              // not written yet
    if (n.scene === 'device') hasDevice = true;
    scenes.push({ n: n, i: i, device: hasDevice });
  });

  scenes.forEach(function (sc, k) {
    var n = sc.n, steps = [];
    var name = n.id ? 'at:' + n.id : n.scene ? 'at:' + n.scene : 'act:' + sc.i;
    var next = scenes[k + 1];
    var nextName = next ? (next.n.id ? 'at:' + next.n.id : next.n.scene ? 'at:' + next.n.scene : 'act:' + next.i) : null;

    // keep the desk tools consistent when a scene is started directly (debug, tests)
    steps.push({ set: 'hasList' });
    steps.push({ actNo: n.actNo });
    if (sc.device) steps.push({ set: 'hasDevice' });

    if (n.act) {
      steps.push({ act: n.act, title: n.title });
      if (n.after) steps = steps.concat(n.after);
    } else {
      steps.push({ clock: n.at });
      steps.push({ 'if': 'run:mess', then: [{ narrate: MOPS[k % MOPS.length] }, { backdrop: 'clean' }] });
      if (n.id) {
        steps = steps.concat(V[n.id].arrive || [{ sfx: 'door' }, { enter: n.id }]);
        steps.push({ desk: n.id });
        steps.push({ exit: 'walk' });
        steps.push({ returns: true });
      } else {
        steps.push({ run: n.scene });
      }
    }
    steps.push(nextName ? { goto: nextName } : { end: 'unfinished' });
    S[name] = steps;
    if (k === 0) S.night = [{ goto: name }];
  });
})();
