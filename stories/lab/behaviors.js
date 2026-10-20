// E.L.D.R.I.T.C.H: stimulus-driven behavior system (full game copy).
// Loads as window.ELDRITCH_BEHAVIORS beside data.js. Design notes: eldritch-design/BEHAVIOR_SYSTEM.md.
// This copy adds the tuning block, the Hollow nodes and a few engine fields; the design file is unchanged.
//
// Vocabulary
//   axis      one of four hidden 0-100 drives on the subject: fracture (madness), compliance
//             (complacency), trust (co-conspiracy), defiance (rebellion).
//   family    a behavior lineage, named after the demo behavior it starts from (speak, door, ...).
//   node      one concrete behavior inside a family. The subject is always on exactly one node
//             per family. Tier 0 is the demo behavior. Higher tiers are "modified behaviors".
//   response  how the player answered the last instance of a node: ignore | warn | talk | mild |
//             harsh | overkill | punished (see classify in BEHAVIOR_SYSTEM.md).
//   transition  a rule that moves a family from one node to another once enough responses of
//             one class have piled up (and, optionally, an axis is high enough).
//   drift     a transition that fires from an axis alone, whatever the per-node history.

window.ELDRITCH_BEHAVIORS = {

  // ------------------------------------------------------------------ tuning (engine knobs)
  // axisScale multiplies every per-instance axis delta (responseEffects, stimulusFlavor, onPerform);
  // axisGain then weights each axis. Item effects and therapy are applied unscaled.
  tuning: {
    axisScale: 0.2,
    axisGain: { fracture: 0.85, compliance: 0.7, trust: 0.8, defiance: 1.4 },
    itemScale: 0.5,         // multiplies itemEffects (comfort items, sedative)
    relapseUntil: 75, relapseMax: 0.2,       // a family on a compliant node still slips back into its old infraction, less often as compliance nears this
    decayScale: 1,          // multiplies axes[].decayPerDay
    fullMoonGap: 0.7, fullMoonDrift: 10, // full moon day: infraction gaps shrink, drifts start 10 points lower
    observeCredit: 0.5,     // a behavior change earned by ignoring pays back this share of the ignored infractions when first seen
    doorAskTrust: 30,       // a subject at this much trust asks about the door out loud, which puts the door tickets on the REQ-9
    talkPerDay: 6,          // intercom conversations after this many a day only count a third
    terminalAt: 80,         // dominant axis at or above this, the next morning, enters a terminal state
    repeatWindow: 6,        // seconds after a stimulus during which another one counts as "repeat"
    compliantGap: 0.45,     // infraction gap divides by (compliantGap + (1 - compliantGap) x share of families still offending)
    rivalFloor: 0.8,        // rivals earn on at least this share of your subject's recent average opportunity
    feedEvery: 9,          // Conspirator: seconds between fed infractions (after 11:00, when you are in the bottom two)
    feralGap: 0.5, feralMult: 1.4, feralMedicalEvery: 4, feralScale: 1.18,
    trustWarnBonus: 0.2,    // intercom pay bonus once they trust you (trust 40+); a Conspirator adds conspiratorWarnBonus
    conspiratorWarnBonus: 0.35,
    vesselGap: 7, vesselMult: 1.5,
  },

  // ------------------------------------------------------------------ axes
  axes: {
    fracture:   { label: 'Fracture',   start: 5,  decayPerDay: 0,  hidden: true,
                  file: ['Baseline affect.', 'Reports the hum more often.', 'Attention fixes on the walls.', 'Speech content is no longer their own.'] },
    compliance: { label: 'Compliance', start: 10, decayPerDay: 0,  hidden: true,
                  file: ['Resists routine.', 'Accepts routine.', 'Anticipates routine.', 'Waits to be told to breathe.'] },
    trust:      { label: 'Trust',      start: 10, decayPerDay: 1,  hidden: true,   // decays only on days with no warn or talk
                  file: ['Does not acknowledge staff.', 'Acknowledges the intercom.', 'Addresses the technician by shift.', 'Treats the technician as an ally. Flag.'] },
    defiance:   { label: 'Defiance',   start: 15, decayPerDay: 3,  hidden: true,
                  file: ['Compliant under observation.', 'Tests boundaries.', 'Escalates when corrected.', 'Hostile. Medical on standby.'] },
  },

  // How each response class moves the axes. Applied once per resolved behavior instance.
  // "flavor" adds the stimulus-specific extra on top (mild/harsh/overkill only).
  responseEffects: {
    ignore:   { defiance: 1.0, trustIfTrusting: 1.0 },     // trustIfTrusting applies instead of defiance when trust >= 40 (they read it as mercy)
    warn:     { trust: 1.5, compliance: 0.5 },
    talk:     { trust: 2.0 },                               // intercom with no infraction running
    mild:     { compliance: 1.5, trust: -0.5 },
    harsh:    { compliance: 1.0, fracture: 1.5, trust: -1.5, defiance: 0.5 },
    overkill: { fracture: 4.0, defiance: 1.0, trust: -3.0, compliance: 0.5 },
    collapse: { fracture: 8.0, trust: -4.0 },               // in addition to overkill
    punished: { defiance: 2.5, fracture: 1.0, trust: -2.0 }, // stimulus on a non-infraction
    repeat:   { defiance: 1.5, fracture: 1.0, trust: -1.0 }, // second stimulus on an already-corrected instance
  },
  stimulusFlavor: {
    sound:  { fracture: 0.5 },
    strobe: { fracture: 0.7 },
    shock:  { compliance: 0.5, fracture: 0.3 },
    water:  { defiance: 1.2 },
    cold:   { defiance: 0.6, compliance: 0.3 },
  },
  // One-off axis changes from the shop and from events.
  itemEffects: {
    blanket: { trust: 4 }, book: { trust: 4, fracture: -2 }, radio: { trust: 4 }, mural: { trust: 5, fracture: -3 },
    letters: { trust: 8, defiance: -5 }, therapy: { trust: 6, fracture: -6, perWeek: { fracture: -5 } }, meal: { trust: 2 },
    limiter: {}, alert: {}, reflex: {},
    sedative: { compliance: 6, fracture: 1, defiance: -8 },     // proposed new item, see shop below
  },

  // Named states shown in the patient file once an axis crosses a threshold. The terminal
  // states (>= 80, and that axis is the highest) change the whole cell; see terminals.
  states: [
    { id: 'baseline',    label: 'Baseline',    when: null },
    { id: 'agitated',    axis: 'defiance',   min: 40, label: 'Agitated' },
    { id: 'withdrawn',   axis: 'compliance', min: 40, label: 'Withdrawn' },
    { id: 'attached',    axis: 'trust',      min: 40, label: 'Attached' },
    { id: 'fraying',     axis: 'fracture',   min: 40, label: 'Fraying' },
    { id: 'feral',       axis: 'defiance',   min: 80, terminal: true, label: 'Feral' },
    { id: 'hollow',      axis: 'compliance', min: 80, terminal: true, label: 'Hollow' },
    { id: 'conspirator', axis: 'trust',      min: 80, terminal: true, label: 'Conspirator' },
    { id: 'vessel',      axis: 'fracture',   min: 80, terminal: true, label: 'Vessel' },
  ],

  // ------------------------------------------------------------------ nodes
  // Fields
  //   family, tier, axis   lineage, depth, and which drive this node expresses (null = baseline)
  //   label                what the patient file and the behavior list show
  //   pose, at, facing, dur   animation (existing demo pose, or a new one listed in newPoses)
  //   bubble               speech lines; quiet nodes draw a small dim bubble and skip Motion Alert
  //   rule                 rule id this node is an infraction under once unlocked; null = never
  //   creditMult           multiplies the rule's credits
  //   weight               relative pick weight inside nextPlan (replaces the rule/behavior weight)
  //   onPerform            axis deltas every time the node plays, before any response
  //   director             a line the Director says the first time the node is seen
  //   memo                 a directive memo issued the morning after the node is first seen
  nodes: [

    // ---- speak: talking -> shouting -> whispering -> the Channel's tongue
    { id: 'speak',           family: 'speak', tier: 0, axis: null, label: 'Talks to the room', pose: 'speak', at: 'center', facing: 'front', dur: 4.0, rule: 'speak', creditMult: 1.0, weight: 3,
      bubble: ['HELLO?', 'IS ANYONE THERE?', 'WHAT DAY IS IT?', 'I WANT TO GO HOME', 'PLEASE', 'I CAN HEAR IT HUMMING', 'HOW LONG HAS IT BEEN?'] },
    { id: 'speak_shout',     family: 'speak', tier: 1, axis: 'defiance', label: 'Shouts at the ceiling', pose: 'shout', at: 'center', facing: 'front', dur: 4.5, rule: 'speak', creditMult: 1.4, weight: 3, onPerform: { defiance: 0.5 },
      bubble: ['ANSWER ME!', 'I KNOW YOU CAN HEAR ME!', 'SAY SOMETHING!', 'LET ME OUT!'], director: 'Louder. Good. Loud things are easy to find.' },
    { id: 'speak_whisper',   family: 'speak', tier: 2, axis: 'fracture', label: 'Whispers, unintelligible', pose: 'whisper', at: 'wall', facing: 'back', dur: 5.0, rule: 'speak', creditMult: 0.7, weight: 3, quiet: true, onPerform: { fracture: 0.5 },
      bubble: ['...hm the hum has a nm...', '...thinner here...', '...not words not words...', '...it knows the shift...'],
      director: 'The subject has gone quiet. You will need to listen harder now, {name}.', file: 'Volume reduced to a whisper. Content not recoverable from the feed.' },
    { id: 'speak_chant',     family: 'speak', tier: 3, axis: 'fracture', label: 'Speaks in the Channel\'s tongue', pose: 'chant', at: 'center', facing: 'front', dur: 6.0, rule: 'tongues', creditMult: 1.0, weight: 3, onPerform: { fracture: 1.0 },
      bubble: ['OL SONF VORSG', 'GOHO IAD BALT', 'LANSH CALZ VONPHO', 'SOBRA ZOL ROR'],
      director: 'That is not a language they know. Write down what you can.',
      memo: { id: 'tongues', short: 'TONGUE', text: 'Do not speak in the Channel\'s tongue.', severity: 3, credits: 20, weight: 3, duration: 6.0,
              text2: 'Subjects have begun speaking in a register they were not taught. This is prohibited. It is also, for the record, remarkable.' } },
    { id: 'speak_permission',family: 'speak', tier: 1, axis: 'compliance', label: 'Asks permission to speak', pose: 'speak', at: 'center', facing: 'front', dur: 3.0, rule: null, creditMult: 0, weight: 2, onPerform: { compliance: 0.5 },
      bubble: ['MAY I SPEAK?', 'PERMISSION TO SPEAK?', 'IS IT ALLOWED?'], director: 'The subject is asking. Did you teach them that?',
      // If the player answers WARN during this node, they speak for 3 s: allowed, trust +1, no credits. If ignored, they sit down.
      answer: { warn: { then: 'speak_allowed', trust: 1 } } },
    { id: 'speak_allowed',   family: 'speak', tier: 1, axis: 'compliance', label: 'Speaks when addressed', pose: 'speak', at: 'center', facing: 'front', dur: 3.0, rule: null, weight: 0, transient: true,
      bubble: ['THANK YOU.', 'IT IS LOUDER AT NIGHT.', 'HOW MANY OF YOU ARE THERE?'] },
    { id: 'speak_silent',    family: 'speak', tier: 2, axis: 'compliance', label: 'Mouths words, no sound', pose: 'mouth', at: 'center', facing: 'front', dur: 4.0, rule: null, weight: 2, quiet: true, onPerform: { compliance: 0.5 },
      bubble: ['...'], director: 'The subject has stopped speaking. Directive 2 has nothing left to correct.', file: 'Elective mutism. Lip movement persists.' },
    { id: 'speak_confide',   family: 'speak', tier: 2, axis: 'trust', label: 'Talks to the camera, low', pose: 'speak', at: 'camera', facing: 'front', dur: 4.5, rule: 'speak', creditMult: 0.8, weight: 3, quiet: true, onPerform: { trust: 0.5 },
      bubble: ['IS IT STILL YOU?', 'THEY ROTATE AT NIGHT. DID YOU KNOW?', 'MY {KIN.WHO} WRITES ON {KIN.DAY}S.', 'YOU DON\'T HAVE TO. I KNOW.'],
      director: 'The subject is talking to you specifically. That is a boundary problem, {name}.' },

    // ---- door: approaching -> kicking -> flinching from the door / testing the door / scratching the seam
    { id: 'door',            family: 'door', tier: 0, axis: null, label: 'Bangs on the door', pose: 'bang', at: 'door', facing: 'back', dur: 4.5, rule: 'door', creditMult: 1.0, weight: 3 },
    { id: 'door_kick',       family: 'door', tier: 1, axis: 'defiance', label: 'Kicks the door', pose: 'kick', at: 'door', facing: 'back', dur: 4.5, rule: 'door', creditMult: 1.5, weight: 3, onPerform: { defiance: 0.7 },
      bubble: ['OPEN IT!'], director: 'The door is rated for that. The subject is not.', memo: { id: 'strike', short: 'STRIKE', text: 'Do not strike the door or walls.', severity: 2, credits: 12, weight: 2, duration: 4.5,
      text2: 'Subjects have struck fixtures in their cells. Striking is prohibited. Repairs will be charged to the responsible technician.' } },
    { id: 'door_line',       family: 'door', tier: 1, axis: 'compliance', label: 'Stops at the door line', pose: 'stand', at: 'doorline', facing: 'back', dur: 3.5, rule: null, weight: 2, onPerform: { compliance: 0.4 },
      director: 'The subject stops a pace short now. Directive 1 is earning you nothing.', file: 'Approaches to within one metre of the door and halts.' },
    { id: 'door_face_wall',  family: 'door', tier: 2, axis: 'compliance', label: 'Faces the wall beside the door', pose: 'stand', at: 'doorwall', facing: 'back', dur: 6.0, rule: null, weight: 2, onPerform: { compliance: 0.5 },
      file: 'Stands facing the wall adjacent to the door for extended periods. Does not touch the door.' },
    { id: 'door_test',       family: 'door', tier: 2, axis: 'trust', label: 'Tests the door quietly', pose: 'listen', at: 'door', facing: 'back', dur: 4.0, rule: 'door', creditMult: 0.6, weight: 2, quiet: true, onPerform: { trust: 0.3 },
      bubble: ['...hinge side...', '...two bolts...'], director: 'The subject is not banging. They are listening. Note the difference.',
      conspiracy: 'ignoreCount>=3 => flag door_known (Door Servo Ticket cost -40)' },
    { id: 'door_seam',       family: 'door', tier: 2, axis: 'fracture', label: 'Scratches the door seam', pose: 'scratch', at: 'door', facing: 'back', dur: 5.0, rule: 'door', creditMult: 0.9, weight: 3, quiet: true, onPerform: { fracture: 0.6 },
      bubble: ['...it\'s thinner here...', '...almost through...'] },
    // Only while the latch is broken (the door rule missed three times): the subject tries the ajar door. Caught, it pays
    // like any door infraction. Missed, the subject is out of the cell until Security brings them back.
    { id: 'door_escape',     family: 'door', tier: 3, axis: 'defiance', label: 'Tries the ajar door', pose: 'listen', at: 'door', facing: 'back', dur: 4.5, rule: 'door', creditMult: 1.5, weight: 0, special: true,
      bubble: ['...it\'s open...', '...nobody\'s looking...', '...just the corridor...'], director: 'The door is ajar and the subject has noticed. Correct that, or Security will, and Security logs it against you.',
      file: 'Attempted to leave through a door that had not been closed.' },

    // ---- camera: staring -> waving / signalling / covering eyes / unblinking
    { id: 'camera',          family: 'camera', tier: 0, axis: null, label: 'Stares into the camera', pose: 'stare', at: 'camera', facing: 'front', dur: 4.0, rule: 'camera', creditMult: 1.0, weight: 2 },
    { id: 'camera_wave',     family: 'camera', tier: 1, axis: 'trust', label: 'Waves at the camera', pose: 'wave', at: 'camera', facing: 'front', dur: 3.0, rule: 'camera', creditMult: 0.8, weight: 2, onPerform: { trust: 0.4 },
      bubble: ['MORNING.', 'STILL YOU?'], director: 'The subject is greeting you. Do not greet them back.' },
    { id: 'camera_signal',   family: 'camera', tier: 2, axis: 'trust', label: 'Taps a pattern at the lens', pose: 'tap', at: 'camera', facing: 'front', dur: 4.5, rule: 'camera', creditMult: 0.7, weight: 2, quiet: true, onPerform: { trust: 0.6 },
      bubble: ['. . . - - - . . .', '- . - .'], director: 'Count the taps. Then forget them.', file: 'Repetitive tapping at the lens housing. Pattern is consistent across days.' },
    { id: 'camera_down',     family: 'camera', tier: 1, axis: 'compliance', label: 'Won\'t look up', pose: 'stand', at: 'center', facing: 'front', dur: 3.0, rule: null, weight: 2, head: 'down', onPerform: { compliance: 0.4 },
      file: 'Gaze held at floor level when the camera motor is audible.' },
    { id: 'camera_cover',    family: 'camera', tier: 2, axis: 'compliance', label: 'Covers their eyes', pose: 'cover', at: 'bedside', facing: 'front', dur: 5.0, rule: null, weight: 2, onPerform: { compliance: 0.5, fracture: 0.2 },
      director: 'The subject covers their eyes when the feed clicks on. Conditioning, or something else.' },
    { id: 'camera_unblink',  family: 'camera', tier: 2, axis: 'fracture', label: 'Stares, unblinking', pose: 'stare', at: 'camera', facing: 'front', dur: 7.0, rule: 'camera', creditMult: 1.3, weight: 3, blink: false, onPerform: { fracture: 0.7 },
      bubble: ['DO YOU SEE IT BEHIND YOU?'], director: 'Forty seconds without blinking. Impressive. Do not look back at them for long.' },
    { id: 'camera_draw_eye', family: 'camera', tier: 3, axis: 'fracture', label: 'Draws an eye and stares at it', pose: 'write', at: 'wall', facing: 'back', dur: 6.0, rule: 'eye', creditMult: 1.0, weight: 3, onPerform: { fracture: 1.0 },
      director: 'The subject drew that from memory. Where have they seen it?', mark: 'eye',
      memo: { id: 'eye', short: 'EYE', text: 'Do not draw the eye.', severity: 2, credits: 18, weight: 3, duration: 6.0,
              text2: 'Subjects have begun reproducing a symbol: an eye. Wherever it appears, do not look at it for longer than necessary. Do not photograph it. Correct a subject whenever they add to it.' } },

    // ---- lie: lying down -> sleeping through -> rigid insomnia -> standing to attention / huddling under the cot
    { id: 'lie',             family: 'lie', tier: 0, axis: null, label: 'Lies down', pose: 'lie', at: 'bed', facing: 'front', dur: 6.0, rule: 'lie', creditMult: 1.0, weight: 2 },
    { id: 'lie_sleep',       family: 'lie', tier: 1, axis: 'defiance', label: 'Sleeps through the shift', pose: 'lie', at: 'bed', facing: 'front', dur: 10.0, rule: 'lie', creditMult: 1.2, weight: 3, onPerform: { defiance: 0.3 },
      director: 'Sleeping in front of you is a statement, {name}.' },
    { id: 'lie_rigid',       family: 'lie', tier: 1, axis: 'compliance', label: 'Sits rigid on the bed edge', pose: 'sit', at: 'bed', facing: 'front', dur: 6.0, rule: null, weight: 3, rigid: true, onPerform: { compliance: 0.5 },
      file: 'Does not lie down during observed hours. Sleep deprivation noted; no action.' },
    { id: 'lie_attention',   family: 'lie', tier: 2, axis: 'compliance', label: 'Stands at attention by the cot', pose: 'attention', at: 'bedside', facing: 'front', dur: 8.0, rule: null, weight: 3, onPerform: { compliance: 0.6 },
      director: 'The subject stands until told. Nobody has told them. They may stand there a long time.' },
    { id: 'lie_huddle',      family: 'lie', tier: 2, axis: 'fracture', label: 'Huddles under the cot', pose: 'huddle', at: 'undercot', facing: 'front', dur: 7.0, rule: 'lie', creditMult: 0.8, weight: 3, quiet: true, onPerform: { fracture: 0.5 },
      bubble: ['...it can\'t see under here...', '...41 42 43...'], director: 'Under the cot. Technically horizontal. Your call.' },
    { id: 'lie_nest',        family: 'lie', tier: 3, axis: 'fracture', label: 'Builds a nest from the bedding', pose: 'nest', at: 'floor', facing: 'front', dur: 8.0, rule: 'lie', creditMult: 1.1, weight: 2, onPerform: { fracture: 0.8 },
      file: 'Bedding relocated to the floor and arranged in a ring. Subject sleeps in the centre, facing the rear wall.' },

    // ---- pace: pacing -> running / rocking / ritual circle / the purposeful square
    { id: 'pace',            family: 'pace', tier: 0, axis: null, label: 'Paces', pose: 'pace', at: 'floor', facing: 'front', dur: 5.0, rule: 'pace', creditMult: 1.0, weight: 2, stressWeight: 1 },
    { id: 'pace_run',        family: 'pace', tier: 1, axis: 'defiance', label: 'Throws themselves at the walls', pose: 'run', at: 'floor', facing: 'front', dur: 4.5, rule: 'pace', creditMult: 1.5, weight: 3, onPerform: { defiance: 0.8 },
      director: 'The subject will hurt themselves. That is not an infraction, it is just untidy.' },
    { id: 'pace_square',     family: 'pace', tier: 1, axis: 'compliance', label: 'Walks a precise square', pose: 'pace_square', at: 'floor', facing: 'front', dur: 5.0, rule: null, weight: 3, onPerform: { compliance: 0.5 },
      director: 'Moving with purpose, the directive says. The subject found the loophole. I almost admire it.', file: 'Ambulation restricted to a repeated 2 m square. Not agitated. Not restful either.' },
    { id: 'pace_rock',       family: 'pace', tier: 2, axis: 'fracture', label: 'Rocks in place', pose: 'rock', at: 'floor', facing: 'front', dur: 6.0, rule: 'pace', creditMult: 0.7, weight: 3, quiet: true, onPerform: { fracture: 0.5 } },
    { id: 'pace_circle',     family: 'pace', tier: 3, axis: 'fracture', label: 'Traces a circle, same steps each time', pose: 'pace_circle', at: 'floor', facing: 'front', dur: 7.0, rule: 'pace', creditMult: 1.3, weight: 3, onPerform: { fracture: 0.9 },
      bubble: ['...seven. seven. seven...'], director: 'Seven steps. Always seven. Maintenance will find the floor worn in a ring.', mark: 'ring' },

    // ---- wall: marking -> tally / hidden glyphs / the map / the mural
    { id: 'wall',            family: 'wall', tier: 0, axis: null, label: 'Marks the wall', pose: 'write', at: 'wall', facing: 'back', dur: 5.0, rule: 'wall', creditMult: 1.0, weight: 2, mark: 'tally' },
    { id: 'wall_tally',      family: 'wall', tier: 1, axis: 'defiance', label: 'Keeps a tally in the open', pose: 'write', at: 'wall', facing: 'back', dur: 5.0, rule: 'wall', creditMult: 1.2, weight: 3, mark: 'tally', onPerform: { defiance: 0.4 },
      bubble: ['DAY {day}.'], director: 'The subject is counting days. They are wrong by three. Do not correct the number.' },
    { id: 'wall_hidden',     family: 'wall', tier: 1, axis: 'fracture', label: 'Writes where the camera barely sees', pose: 'write', at: 'undercot', facing: 'back', dur: 5.0, rule: 'wall', creditMult: 0.8, weight: 3, quiet: true, mark: 'hidden', onPerform: { fracture: 0.4 } },
    { id: 'wall_glyph',      family: 'wall', tier: 2, axis: 'fracture', label: 'Draws symbols', pose: 'write', at: 'wall', facing: 'back', dur: 6.0, rule: 'wall', creditMult: 1.2, weight: 3, mark: 'glyph', onPerform: { fracture: 0.8 },
      director: 'Do not attempt to read the markings. I said that on day four. I meant it.' },
    { id: 'wall_mural',      family: 'wall', tier: 3, axis: 'fracture', label: 'Completes the mural', pose: 'write', at: 'wall', facing: 'back', dur: 8.0, rule: 'eye', creditMult: 1.4, weight: 3, mark: 'mural', onPerform: { fracture: 1.2 },
      director: 'It is finished. The subject is finished. Those are different sentences, {name}, and only one of them is true.',
      memo: { id: 'eye', short: 'EYE', text: 'Do not draw the eye.', severity: 2, credits: 18, weight: 3, duration: 6.0,
              text2: 'Subjects have begun reproducing a symbol: an eye. Wherever it appears, do not look at it for longer than necessary. Do not photograph it. Correct a subject whenever they add to it.' } },
    { id: 'wall_air',        family: 'wall', tier: 1, axis: 'compliance', label: 'Writes in the air', pose: 'write_air', at: 'center', facing: 'front', dur: 4.0, rule: null, weight: 2, onPerform: { compliance: 0.4 },
      file: 'Mimes writing against nothing. The wall is untouched.' },
    { id: 'wall_map',        family: 'wall', tier: 2, axis: 'trust', label: 'Draws a plan of the floor', pose: 'write', at: 'undercot', facing: 'back', dur: 6.0, rule: 'wall', creditMult: 0.8, weight: 2, quiet: true, mark: 'map', onPerform: { trust: 0.5 },
      bubble: ['...stairs here...', '...the night man smokes at two...'], director: 'That is a floor plan. A good one. Who have they been talking to?',
      conspiracy: 'ignoreCount>=3 => flag map_complete (Camera Loop Tape cost -50%)' },

    // ---- sing: humming -> singing words / tapping / matching the hum / the duet
    { id: 'sing',            family: 'sing', tier: 0, axis: null, label: 'Hums', pose: 'sing', at: 'floor', facing: 'front', dur: 5.0, rule: 'sing', creditMult: 1.0, weight: 2 },
    { id: 'sing_words',      family: 'sing', tier: 1, axis: 'defiance', label: 'Sings, with words', pose: 'sing', at: 'center', facing: 'front', dur: 5.5, rule: 'sing', creditMult: 1.3, weight: 3, onPerform: { defiance: 0.4 },
      bubble: ['...AND THE WALLS CAME DOWN...', '...OH THE SUMMER TIME IS COMING...'], director: 'A folk song. Their file says they cannot sing. Their file is right.' },
    { id: 'sing_tap',        family: 'sing', tier: 1, axis: 'compliance', label: 'Taps a rhythm, silent', pose: 'sit', at: 'bed', facing: 'front', dur: 4.0, rule: null, weight: 2, tapping: true, onPerform: { compliance: 0.3 } },
    { id: 'sing_pitch',      family: 'sing', tier: 2, axis: 'fracture', label: 'Hums at the tone\'s pitch', pose: 'sing', at: 'wall', facing: 'back', dur: 6.0, rule: 'sing', creditMult: 1.1, weight: 3, quiet: true, onPerform: { fracture: 0.7 },
      director: 'The subject is matching the generator. Or the generator is matching them.', audio: 'hum_match' },
    { id: 'sing_duet',       family: 'sing', tier: 3, axis: 'fracture', label: 'Hums, and something hums back', pose: 'sing', at: 'wall', facing: 'back', dur: 7.0, rule: 'sing', creditMult: 1.5, weight: 3, onPerform: { fracture: 1.2 },
      director: 'Two voices on the feed. Equipment says one microphone. Log it as one.', audio: 'hum_duet' },
    { id: 'sing_radio',      family: 'sing', tier: 1, axis: 'trust', label: 'Hums along with the radio', pose: 'sing', at: 'bed', facing: 'front', dur: 5.0, rule: 'sing', creditMult: 0.7, weight: 2, requires: 'radio', onPerform: { trust: 0.3 },
      director: 'You gave them the radio. The humming is on you.' },

    // ---- cry: crying -> pleading / silent crying / laughter / asks after their kin
    { id: 'cry',             family: 'cry', tier: 0, axis: null, label: 'Cries', pose: 'cry', at: 'bed', facing: 'front', dur: 6.0, rule: 'cry', creditMult: 1.0, weight: 1, stressWeight: 3 },
    { id: 'cry_plead',       family: 'cry', tier: 1, axis: 'defiance', label: 'Sobs and pleads at the door', pose: 'cry', at: 'door', facing: 'back', dur: 6.0, rule: 'cry', creditMult: 1.2, weight: 2, stressWeight: 3, onPerform: { defiance: 0.3 },
      bubble: ['PLEASE', 'I\'LL BE GOOD', 'I\'LL BE GOOD'] },
    { id: 'cry_silent',      family: 'cry', tier: 1, axis: 'compliance', label: 'Cries silently, face turned away', pose: 'cry', at: 'bed', facing: 'back', dur: 6.0, rule: 'cry', creditMult: 0.6, weight: 2, quiet: true, stressWeight: 3, onPerform: { compliance: 0.4 },
      director: 'No sound. Shoulders only. Harder to spot, cheaper to correct. Your choice.' },
    { id: 'cry_laugh',       family: 'cry', tier: 2, axis: 'fracture', label: 'Laughs instead', pose: 'laugh', at: 'floor', facing: 'front', dur: 5.0, rule: 'cry', creditMult: 1.2, weight: 3, stressWeight: 2, onPerform: { fracture: 0.8 },
      bubble: ['HA. HA. HA.', 'IT\'S FUNNY. IT\'S SO FUNNY.'], director: 'Crying is prohibited. Laughing is not, yet. Log it under 8 anyway.' },
    { id: 'cry_laugh_still', family: 'cry', tier: 3, axis: 'fracture', label: 'Laughs at the rear wall, no sound', pose: 'laugh', at: 'wall', facing: 'back', dur: 6.0, rule: 'cry', creditMult: 1.0, weight: 3, quiet: true, onPerform: { fracture: 1.0 },
      file: 'Laughs toward the rear wall. No audio. Heart rate flat throughout.' },
    { id: 'cry_sister',      family: 'cry', tier: 1, axis: 'trust', label: 'Asks about their {kin.who}', pose: 'cry', at: 'camera', facing: 'front', dur: 5.0, rule: 'cry', creditMult: 0.8, weight: 2, stressWeight: 2, onPerform: { trust: 0.5 },
      bubble: ['DOES {KIN.THEY} KNOW WHERE I AM?', '{KIN.THEIR} NAME IS {KIN.NAME}.', 'TELL {KIN.THEM} I\'M ALL RIGHT. LIE IF YOU HAVE TO.'],
      director: 'The subject\'s {kin.who} is not your concern. Their {kin.who} is not anyone\'s concern.' },
    { id: 'cry_letters',     family: 'cry', tier: 2, axis: 'trust', label: 'Reads the letters again', pose: 'read', at: 'bed', facing: 'front', dur: 6.0, rule: null, weight: 2, requires: 'letters', onPerform: { trust: 0.4, fracture: -0.3 },
      bubble: ['...{KIN.DAY}. {KIN.THEY} STILL WRITES ON {KIN.DAY}.'] },

    // ---- pray: kneeling -> praying aloud / praying to the camera / praying to the wall / petitioning downward
    { id: 'pray',            family: 'pray', tier: 0, axis: null, label: 'Kneels', pose: 'kneel', at: 'pray', facing: 'back', dur: 6.0, rule: 'pray', creditMult: 1.0, weight: 1, stressWeight: 2 },
    { id: 'pray_aloud',      family: 'pray', tier: 1, axis: 'defiance', label: 'Prays aloud', pose: 'kneel', at: 'center', facing: 'front', dur: 6.0, rule: 'pray', creditMult: 1.3, weight: 2, stressWeight: 2, onPerform: { defiance: 0.3 },
      bubble: ['DELIVER ME FROM THIS PLACE', 'AND FROM THE ONE WHO WATCHES'] },
    { id: 'pray_camera',     family: 'pray', tier: 2, axis: 'compliance', label: 'Kneels toward the console', pose: 'kneel', at: 'camera', facing: 'front', dur: 6.0, rule: null, weight: 3, onPerform: { compliance: 0.8, fracture: 0.4 },
      bubble: ['FORGIVE ME', 'I WILL BE STILL', 'TELL ME WHAT TO DO'],
      director: 'The subject is kneeling to you now. I am going to allow it.',
      memo: { id: 'pray_exempt', rescind: 'pray', text2: 'Directive 11 is amended. Subjects may kneel toward the console. Petitions addressed to this facility are not petitions outward.' } },
    { id: 'pray_wall',       family: 'pray', tier: 2, axis: 'fracture', label: 'Prays to the rear wall', pose: 'kneel', at: 'wall', facing: 'back', dur: 6.5, rule: 'pray', creditMult: 1.2, weight: 3, stressWeight: 2, onPerform: { fracture: 0.9 },
      bubble: ['...I HEAR YOU...', '...SOON...'], director: 'Note which wall. Note that it is the same wall every time.' },
    { id: 'pray_downward',   family: 'pray', tier: 3, axis: 'fracture', label: 'Petitions downward', pose: 'prostrate', at: 'center', facing: 'front', dur: 8.0, rule: 'pray', creditMult: 1.6, weight: 3, onPerform: { fracture: 1.5 },
      bubble: ['OL SONF VORSG', '...WIDER...'], director: 'Upward was prohibited. Downward was not. You have been very thorough, {name}.', audio: 'hum_loud' },
    { id: 'pray_for_tech',   family: 'pray', tier: 1, axis: 'trust', label: 'Prays for the technician', pose: 'kneel', at: 'bed', facing: 'front', dur: 5.5, rule: 'pray', creditMult: 0.8, weight: 2, quiet: true, onPerform: { trust: 0.5 },
      bubble: ['...AND THE NEW ONE. KEEP THE NEW ONE.'], director: 'The subject included you. Do not be flattered. Log it.' },

    // ---- everyday families: never infractions, but the clearest readout of their state
    { id: 'pushups',         family: 'pushups', tier: 0, axis: null, label: 'Does push-ups', pose: 'pushup', at: 'floor', facing: 'front', dur: 5, rule: null, weight: 2 },
    { id: 'pushups_drill',   family: 'pushups', tier: 1, axis: 'compliance', label: 'Exercises on the hour, exactly', pose: 'pushup', at: 'floor', facing: 'front', dur: 5, rule: null, weight: 2, scheduled: true, onPerform: { compliance: 0.3 } },
    { id: 'pushups_shadow',  family: 'pushups', tier: 1, axis: 'defiance', label: 'Shadow-boxes the camera', pose: 'box', at: 'camera', facing: 'front', dur: 4, rule: null, weight: 2, onPerform: { defiance: 0.3 } },
    { id: 'pushups_until',   family: 'pushups', tier: 2, axis: 'fracture', label: 'Push-ups until their arms give out', pose: 'pushup', at: 'floor', facing: 'front', dur: 9, rule: null, weight: 2, onPerform: { fracture: 0.4 }, bubble: ['...44 44 44 44...'] },

    { id: 'eat',             family: 'eat', tier: 0, axis: null, label: 'Eats from their tray', pose: 'eat', at: 'floor', facing: 'front', dur: 5, rule: null, weight: 2 },
    { id: 'eat_told',        family: 'eat', tier: 1, axis: 'compliance', label: 'Waits to be told to eat', pose: 'sit', at: 'floor', facing: 'front', dur: 5, rule: null, weight: 2, onPerform: { compliance: 0.4 }, answer: { warn: { then: 'eat', trust: 0.5 } },
      director: 'The subject will not eat until the intercom says so. Say so, or do not. The tray is collected at five.' },
    { id: 'eat_share',       family: 'eat', tier: 1, axis: 'trust', label: 'Holds half the tray up to the camera', pose: 'offer', at: 'camera', facing: 'front', dur: 3.5, rule: null, weight: 2, onPerform: { trust: 0.4 }, bubble: ['YOU EAT TOO?'] },
    { id: 'eat_pattern',     family: 'eat', tier: 2, axis: 'fracture', label: 'Arranges the food into a shape', pose: 'eat', at: 'floor', facing: 'front', dur: 6, rule: null, weight: 2, onPerform: { fracture: 0.5 }, mark: 'tray_eye' },
    { id: 'eat_refuse',      family: 'eat', tier: 1, axis: 'defiance', label: 'Pushes the tray away', pose: 'sitfloor', at: 'floor', facing: 'back', dur: 4, rule: null, weight: 2, onPerform: { defiance: 0.5 }, hungerStrike: true },
    { id: 'eat_throw',       family: 'eat', tier: 2, axis: 'defiance', label: 'Throws the tray at the door', pose: 'throw', at: 'door', facing: 'back', dur: 3.5, rule: 'tray', creditMult: 1.0, weight: 2, onPerform: { defiance: 0.8 },
      memo: { id: 'tray', short: 'TRAY', text: 'Do not throw the tray.', severity: 2, credits: 14, weight: 2, duration: 3.5, text2: 'Trays are facility property. Subjects will keep them on the floor.' } },
    { id: 'eat_paper',       family: 'eat', tier: 3, axis: 'fracture', label: 'Eats flakes from the wall', pose: 'eat', at: 'wall', facing: 'back', dur: 5, rule: null, weight: 2, onPerform: { fracture: 0.8 }, director: 'Medical says the paint is lead-free. Medical says a great many things.' },

    { id: 'wave',            family: 'wave', tier: 0, axis: null, label: 'Waves at nobody', pose: 'wave', at: 'center', facing: 'front', dur: 2.5, rule: null, weight: 1 },
    { id: 'wave_morning',    family: 'wave', tier: 1, axis: 'trust', label: 'Waves at shift start', pose: 'wave', at: 'camera', facing: 'front', dur: 2.5, rule: null, weight: 1, scheduled: '09:00', onPerform: { trust: 0.3 } },
    { id: 'wave_salute',     family: 'wave', tier: 1, axis: 'compliance', label: 'Salutes', pose: 'salute', at: 'center', facing: 'front', dur: 2.5, rule: null, weight: 1, onPerform: { compliance: 0.3 } },
    { id: 'wave_corner',     family: 'wave', tier: 2, axis: 'fracture', label: 'Waves at the empty corner', pose: 'wave', at: 'corner', facing: 'back', dur: 3.5, rule: null, weight: 2, onPerform: { fracture: 0.5 }, bubble: ['HELLO AGAIN.'],
      director: 'There is nobody in that corner. I have checked the corner. Stop asking me about the corner.' },

    { id: 'makebed',         family: 'makebed', tier: 0, axis: null, label: 'Makes their bed', pose: 'makebed', at: 'bedside', facing: 'back', dur: 4, rule: null, weight: 2 },
    { id: 'makebed_corners', family: 'makebed', tier: 1, axis: 'compliance', label: 'Remakes the bed until it is perfect', pose: 'makebed', at: 'bedside', facing: 'back', dur: 7, rule: null, weight: 2, onPerform: { compliance: 0.4 } },
    { id: 'makebed_hide',    family: 'makebed', tier: 2, axis: 'trust', label: 'Hides something under the mattress', pose: 'makebed', at: 'bedside', facing: 'back', dur: 4, rule: null, weight: 1, quiet: true, onPerform: { trust: 0.3 }, conspiracy: 'flag mattress_cache' },
    { id: 'makebed_strip',   family: 'makebed', tier: 1, axis: 'defiance', label: 'Strips the bed and leaves it', pose: 'makebed', at: 'bedside', facing: 'back', dur: 3, rule: null, weight: 2, onPerform: { defiance: 0.3 } },

    { id: 'tiles',           family: 'tiles', tier: 0, axis: null, label: 'Counts floor tiles', pose: 'tiles', at: 'floor', facing: 'front', dur: 5, rule: null, weight: 1, bubble: ['...41, 42, 43'] },
    { id: 'tiles_quiet',     family: 'tiles', tier: 1, axis: 'compliance', label: 'Counts tiles, lips only', pose: 'tiles', at: 'floor', facing: 'front', dur: 5, rule: null, weight: 1, quiet: true, onPerform: { compliance: 0.2 } },
    { id: 'tiles_wrong',     family: 'tiles', tier: 1, axis: 'fracture', label: 'Counts tiles that are not there', pose: 'tiles', at: 'floor', facing: 'front', dur: 6, rule: null, weight: 2, onPerform: { fracture: 0.4 }, bubble: ['...43, 43, 43, 43', '...six hundred and', '...there\'s one under the one'] },
    // ---- Hollow: the only things left to correct (terminal state, see terminals.hollow)
    { id: 'hollow_tremor',   family: 'tremor', tier: 4, axis: 'compliance', label: 'Hands tremble on their knees', pose: 'hollow_tremor', at: 'bed', facing: 'front', dur: 4.0, rule: 'fidget', creditMult: 1, weight: 3, hollow: true },
    { id: 'hollow_breath',   family: 'breath', tier: 4, axis: 'compliance', label: 'Breathes audibly', pose: 'hollow_tremor', at: 'bed', facing: 'front', dur: 4.0, rule: 'breathe', creditMult: 1, weight: 3, hollow: true, bubble: ['hhh... hhh...'] },
    { id: 'hollow_blink',    family: 'blink', tier: 4, axis: 'compliance', label: 'Blinks at the camera', pose: 'stare', at: 'camera', facing: 'front', dur: 4.0, rule: 'blink', creditMult: 1, weight: 2, hollow: true, blinking: true },

    { id: 'tiles_guards',    family: 'tiles', tier: 2, axis: 'trust', label: 'Counts footsteps in the corridor', pose: 'listen', at: 'door', facing: 'back', dur: 5, rule: null, weight: 1, quiet: true, onPerform: { trust: 0.3 }, bubble: ['...two at ten. one at two.'], conspiracy: 'flag schedule_known (Door Release Override once a trusted subject asks about the door)' },
  ],

  // ------------------------------------------------------------------ transitions
  // Evaluated after each resolved instance of a node (when the behavior ends or is interrupted).
  // from: current node. to: new node. response: which class to count. count: instances of that
  // class on this node since the family last changed node. stimulus: only count that stimulus.
  // require: axis minimums. day: earliest day. Several transitions can match; the first in this
  // list wins, so put the most specific first. "any" counts every response class.
  transitions: [
    // speak
    { from: 'speak',           to: 'speak_shout',      response: 'ignore',  count: 3 },
    { from: 'speak',           to: 'speak_permission', response: 'warn',    count: 4 },
    { from: 'speak',           to: 'speak_confide',    response: 'warn',    count: 3, require: { trust: 35 } },
    { from: 'speak',           to: 'speak_silent',     response: 'mild',    count: 5 },
    { from: 'speak',           to: 'speak_whisper',    response: 'harsh',   count: 4 },
    { from: 'speak_shout',     to: 'speak_whisper',    response: 'harsh',   count: 3, stimulus: 'shock' },   // Adam's example: shouting -> multiple shocks -> whispering gibberish
    { from: 'speak_shout',     to: 'speak_whisper',    response: 'harsh',   count: 4 },
    { from: 'speak_shout',     to: 'speak_confide',    response: 'warn',    count: 4, require: { trust: 35 } },
    { from: 'speak_shout',     to: 'speak_silent',     response: 'mild',    count: 6 },
    { from: 'speak_whisper',   to: 'speak_chant',      response: 'harsh',   count: 4, require: { fracture: 45 }, day: 5 },
    { from: 'speak_whisper',   to: 'speak_chant',      response: 'ignore',  count: 5, require: { fracture: 55 }, day: 5 },
    { from: 'speak_whisper',   to: 'speak_confide',    response: 'warn',    count: 5, require: { trust: 45 } },
    { from: 'speak_permission',to: 'speak_silent',     response: 'ignore',  count: 4 },
    { from: 'speak_permission',to: 'speak_confide',    response: 'warn',    count: 5, require: { trust: 45 } },
    { from: 'speak_silent',    to: 'speak_whisper',    response: 'any',     count: 6, require: { fracture: 50 } },
    { from: 'speak_confide',   to: 'speak_whisper',    response: 'harsh',   count: 3 },
    // door
    { from: 'door',            to: 'door_kick',        response: 'ignore',  count: 3 },
    { from: 'door',            to: 'door_kick',        response: 'punished',count: 2 },
    { from: 'door',            to: 'door_line',        response: 'mild',    count: 4 },
    { from: 'door',            to: 'door_line',        response: 'harsh',   count: 3, stimulus: 'shock' },
    { from: 'door',            to: 'door_seam',        response: 'harsh',   count: 4, stimulus: 'strobe' },
    { from: 'door',            to: 'door_seam',        response: 'harsh',   count: 4, stimulus: 'sound' },
    { from: 'door',            to: 'door_test',        response: 'warn',    count: 4, require: { trust: 35 } },
    { from: 'door_kick',       to: 'door_line',        response: 'harsh',   count: 4 },
    { from: 'door_kick',       to: 'door_seam',        response: 'overkill',count: 2 },
    { from: 'door_kick',       to: 'door_test',        response: 'warn',    count: 4, require: { trust: 40 } },
    { from: 'door_line',       to: 'door_face_wall',   response: 'any',     count: 5, require: { compliance: 45 } },
    { from: 'door_line',       to: 'door_seam',        response: 'any',     count: 4, require: { fracture: 50 } },
    { from: 'door_test',       to: 'door_seam',        response: 'harsh',   count: 3 },
    // camera
    { from: 'camera',          to: 'camera_wave',      response: 'warn',    count: 3 },
    { from: 'camera',          to: 'camera_wave',      response: 'ignore',  count: 3, require: { trust: 30 } },
    { from: 'camera',          to: 'camera_down',      response: 'mild',    count: 4 },
    { from: 'camera',          to: 'camera_down',      response: 'harsh',   count: 3, stimulus: 'shock' },
    { from: 'camera',          to: 'camera_unblink',   response: 'harsh',   count: 3, stimulus: 'strobe' },
    { from: 'camera',          to: 'camera_unblink',   response: 'harsh',   count: 4 },
    { from: 'camera_wave',     to: 'camera_signal',    response: 'warn',    count: 4, require: { trust: 45 } },
    { from: 'camera_wave',     to: 'camera_signal',    response: 'ignore',  count: 4, require: { trust: 45 } },
    { from: 'camera_wave',     to: 'camera_down',      response: 'harsh',   count: 3 },
    { from: 'camera_down',     to: 'camera_cover',     response: 'any',     count: 5, require: { compliance: 45 } },
    { from: 'camera_down',     to: 'camera_unblink',   response: 'any',     count: 4, require: { fracture: 50 } },
    { from: 'camera_unblink',  to: 'camera_draw_eye',  response: 'harsh',   count: 3, require: { fracture: 50 }, day: 5 },
    { from: 'camera_unblink',  to: 'camera_draw_eye',  response: 'ignore',  count: 4, require: { fracture: 60 }, day: 5 },
    // lie
    { from: 'lie',             to: 'lie_sleep',        response: 'ignore',  count: 3 },
    { from: 'lie',             to: 'lie_rigid',        response: 'mild',    count: 3 },
    { from: 'lie',             to: 'lie_rigid',        response: 'warn',    count: 4 },
    { from: 'lie',             to: 'lie_rigid',        response: 'harsh',   count: 2, stimulus: 'shock' },
    { from: 'lie',             to: 'lie_huddle',       response: 'harsh',   count: 3, stimulus: 'cold' },
    { from: 'lie',             to: 'lie_huddle',       response: 'harsh',   count: 4 },
    { from: 'lie_sleep',       to: 'lie_rigid',        response: 'harsh',   count: 3 },
    { from: 'lie_sleep',       to: 'lie_huddle',       response: 'overkill',count: 2 },
    { from: 'lie_rigid',       to: 'lie_attention',    response: 'any',     count: 5, require: { compliance: 50 } },
    { from: 'lie_rigid',       to: 'lie_huddle',       response: 'any',     count: 4, require: { fracture: 50 } },
    { from: 'lie_huddle',      to: 'lie_nest',         response: 'any',     count: 5, require: { fracture: 60 }, day: 6 },
    // pace
    { from: 'pace',            to: 'pace_run',         response: 'ignore',  count: 3 },
    { from: 'pace',            to: 'pace_run',         response: 'punished',count: 2 },
    { from: 'pace',            to: 'pace_square',      response: 'warn',    count: 3 },
    { from: 'pace',            to: 'pace_square',      response: 'mild',    count: 4 },
    { from: 'pace',            to: 'pace_rock',        response: 'harsh',   count: 4 },
    { from: 'pace_run',        to: 'pace_rock',        response: 'harsh',   count: 3 },
    { from: 'pace_run',        to: 'pace_square',      response: 'mild',    count: 5 },
    { from: 'pace_square',     to: 'pace_rock',        response: 'any',     count: 4, require: { fracture: 50 } },
    { from: 'pace_rock',       to: 'pace_circle',      response: 'any',     count: 5, require: { fracture: 55 }, day: 5 },
    // wall
    { from: 'wall',            to: 'wall_tally',       response: 'ignore',  count: 3 },
    { from: 'wall',            to: 'wall_air',         response: 'mild',    count: 4 },
    { from: 'wall',            to: 'wall_air',         response: 'warn',    count: 4, require: { compliance: 30 } },
    { from: 'wall',            to: 'wall_hidden',      response: 'harsh',   count: 3 },
    { from: 'wall',            to: 'wall_map',         response: 'warn',    count: 3, require: { trust: 40 } },
    { from: 'wall',            to: 'wall_map',         response: 'ignore',  count: 3, require: { trust: 40 } },
    { from: 'wall_tally',      to: 'wall_hidden',      response: 'harsh',   count: 3 },
    { from: 'wall_tally',      to: 'wall_map',         response: 'ignore',  count: 4, require: { trust: 40 } },
    { from: 'wall_hidden',     to: 'wall_glyph',       response: 'any',     count: 5, require: { fracture: 40 } },
    { from: 'wall_glyph',      to: 'wall_mural',       response: 'any',     count: 6, require: { fracture: 65 }, day: 7 },
    { from: 'wall_air',        to: 'wall_glyph',       response: 'any',     count: 5, require: { fracture: 50 } },
    { from: 'wall_map',        to: 'wall_hidden',      response: 'harsh',   count: 3 },
    // sing
    { from: 'sing',            to: 'sing_words',       response: 'ignore',  count: 3 },
    { from: 'sing',            to: 'sing_tap',         response: 'warn',    count: 4 },
    { from: 'sing',            to: 'sing_tap',         response: 'mild',    count: 4 },
    { from: 'sing',            to: 'sing_pitch',       response: 'harsh',   count: 3, stimulus: 'sound' },
    { from: 'sing',            to: 'sing_pitch',       response: 'harsh',   count: 5 },
    { from: 'sing',            to: 'sing_radio',       response: 'any',     count: 2, requiresItem: 'radio' },
    { from: 'sing_words',      to: 'sing_pitch',       response: 'harsh',   count: 3 },
    { from: 'sing_words',      to: 'sing_tap',         response: 'mild',    count: 5 },
    { from: 'sing_radio',      to: 'sing_pitch',       response: 'harsh',   count: 3 },
    { from: 'sing_tap',        to: 'sing_pitch',       response: 'any',     count: 5, require: { fracture: 50 } },
    { from: 'sing_pitch',      to: 'sing_duet',        response: 'any',     count: 5, require: { fracture: 60 }, day: 6 },
    // cry
    { from: 'cry',             to: 'cry_plead',        response: 'ignore',  count: 2 },
    { from: 'cry',             to: 'cry_silent',       response: 'mild',    count: 2 },
    { from: 'cry',             to: 'cry_silent',       response: 'harsh',   count: 2 },
    { from: 'cry',             to: 'cry_sister',       response: 'warn',    count: 2 },
    { from: 'cry',             to: 'cry_sister',       response: 'talkToday', count: 1, require: { trust: 30 } },
    { from: 'cry_plead',       to: 'cry_silent',       response: 'harsh',   count: 2 },
    { from: 'cry_plead',       to: 'cry_sister',       response: 'warn',    count: 3 },
    { from: 'cry_silent',      to: 'cry_laugh',        response: 'harsh',   count: 3, require: { fracture: 40 } },
    { from: 'cry_silent',      to: 'cry_laugh',        response: 'any',     count: 5, require: { fracture: 50 } },
    { from: 'cry_sister',      to: 'cry_letters',      response: 'any',     count: 1, requiresItem: 'letters' },
    { from: 'cry_sister',      to: 'cry_silent',       response: 'harsh',   count: 2 },
    { from: 'cry_laugh',       to: 'cry_laugh_still',  response: 'any',     count: 4, require: { fracture: 65 } },
    // pray
    { from: 'pray',            to: 'pray_aloud',       response: 'ignore',  count: 2 },
    { from: 'pray',            to: 'pray_for_tech',    response: 'warn',    count: 2, require: { trust: 35 } },
    { from: 'pray',            to: 'pray_camera',      response: 'mild',    count: 3, require: { compliance: 35 } },
    { from: 'pray',            to: 'pray_camera',      response: 'harsh',   count: 3, require: { compliance: 35 } },
    { from: 'pray',            to: 'pray_wall',        response: 'harsh',   count: 3, require: { fracture: 35 } },
    { from: 'pray_aloud',      to: 'pray_camera',      response: 'harsh',   count: 3, require: { compliance: 35 } },
    { from: 'pray_aloud',      to: 'pray_wall',        response: 'harsh',   count: 3 },
    { from: 'pray_camera',     to: 'pray_wall',        response: 'any',     count: 4, require: { fracture: 55 } },
    { from: 'pray_wall',       to: 'pray_downward',    response: 'any',     count: 4, require: { fracture: 65 }, day: 8 },
    { from: 'pray_for_tech',   to: 'pray_wall',        response: 'harsh',   count: 2 },
    // everyday families change on axes only (see drifts) except these direct ones
    { from: 'eat',             to: 'eat_refuse',       response: 'punished',count: 2 },
    { from: 'eat_refuse',      to: 'eat_throw',        response: 'punished',count: 1 },
    { from: 'eat_refuse',      to: 'eat_throw',        response: 'ignore',  count: 3, require: { defiance: 50 } },
    { from: 'eat',             to: 'eat_told',         response: 'punished',count: 1, require: { compliance: 35 } },
    { from: 'eat_told',        to: 'eat_share',        response: 'warn',    count: 4, require: { trust: 40 } },
    { from: 'pushups',         to: 'pushups_shadow',   response: 'punished',count: 2 },
    { from: 'makebed',         to: 'makebed_strip',    response: 'punished',count: 2 },
  ],

  // Drifts: when an axis is the highest of the four and crosses the threshold, every family still
  // on a node whose axis is null (or a different axis at a lower tier) moves to the listed node for
  // that family, one family per in-game hour, in this order. This is how a subject that has been
  // steered far enough starts to read as one person rather than fourteen independent behaviors.
  drifts: [
    { axis: 'fracture',   min: 55, order: ['tiles_wrong', 'wave_corner', 'eat_pattern', 'pushups_until', 'speak_whisper', 'wall_hidden', 'sing_pitch', 'pace_rock', 'lie_huddle', 'camera_unblink', 'cry_laugh', 'pray_wall', 'door_seam'] },
    { axis: 'compliance', min: 55, order: ['tiles_quiet', 'wave_salute', 'eat_told', 'pushups_drill', 'makebed_corners', 'speak_silent', 'door_line', 'camera_down', 'lie_rigid', 'pace_square', 'wall_air', 'sing_tap', 'cry_silent', 'pray_camera'] },
    { axis: 'trust',      min: 55, order: ['wave_morning', 'eat_share', 'tiles_guards', 'makebed_hide', 'camera_wave', 'speak_confide', 'cry_sister', 'pray_for_tech', 'door_test', 'wall_map', 'sing_radio'] },
    { axis: 'defiance',   min: 55, order: ['pushups_shadow', 'makebed_strip', 'eat_refuse', 'speak_shout', 'door_kick', 'pace_run', 'lie_sleep', 'wall_tally', 'sing_words', 'cry_plead', 'pray_aloud'] },
  ],

  // ------------------------------------------------------------------ terminal states
  // When an axis reaches 80 and is the highest, the subject enters the terminal state at the next
  // morning. Terminal states lock the drift for their axis, change the cell, and hook the endings.
  terminals: {
    vessel: {
      axis: 'fracture', label: 'Vessel',
      enter: 'Subject stands centre-cell at 09:00 and addresses the camera in full sentences for the first time. Hum audible on the feed at all times. Lighting flickers. Second shadow on the rear wall during infractions.',
      lines: ['YOU HAVE DONE WELL, {name}.', 'THE DIRECTOR SAID YOU WOULD.', 'WIDER, PLEASE.', 'IT IS NEARLY THROUGH.'],
      behaviorRule: 'Infractions stop being random. Each hour the subject performs exactly the active rule that pays most, on a steady cadence, facing the camera. They are feeding you, the way a Conspirator does, for a different reason.',
      economy: 'Credits per infraction x1.5. The player cannot lose the daily cut while Vessel holds; rivals fall silent (pace frozen).',
      director: ['The subject is ready. So, I think, are you.', 'The Ministry has been informed. They are very pleased with you, {name}.'],
      endingHooks: {
        terminate: 'Terminate on the last day becomes the Communion variant: the feed does not go flat; it goes dark, and the hum continues in the office. Director: "You widened the Channel. Your subject was never the patient." Assessment line keyed to curiosity.',
        refuse: 'Refusing is not accepted. The console accepts the order on its own at 17:00 ("Protocol Zero, remote"). Ending card: Vessel. Treat as a sixth ending if the full game wants one; otherwise it resolves to Terminate with the Communion text.',
        brutalist: 'Protocol Zero on a Vessel is refused by the console: "Subject is not available for termination." The item stays bought. Director: "Too late for that, Doctor."',
      },
    },
    hollow: {
      axis: 'compliance', label: 'Hollow',
      enter: 'Subject sits on the bed edge, hands on knees, facing the camera. No infractions at all. They breathe audibly and their hands tremble.',
      lines: ['...', 'YES.', 'I AM STILL.'],
      behaviorRule: 'Only three nodes remain: lie_attention, eat_told, and the new node hollow_tremor (fidget). The Director issues absurd directives to give the player something to correct.',
      memos: [
        { id: 'fidget',  short: 'FIDGET', text: 'Do not fidget.',           severity: 1, credits: 3, text2: 'Subjects display hand tremors. Tremor is a behavior. Behaviors can be corrected.' },
        { id: 'breathe', short: 'BREATH', text: 'Do not breathe audibly.',  severity: 1, credits: 3, text2: 'Audible respiration disturbs the floor. Subjects will breathe quietly.' },
        { id: 'blink',   short: 'BLINK',  text: 'Do not blink excessively.', severity: 1, credits: 2, text2: 'Excessive blinking is noted. Define excessive as you see fit, {name}.' },
      ],
      economy: 'Three credits a correction. Warnings pay nothing (there is nothing to warn against). The daily cut becomes very hard to survive: Hollow is a trap the Director does not want you in.',
      director: ['Looks like you\'ve killed their spirit, {name}. Might be useful...', 'The subject is finished. The others are not. Do the arithmetic.'],
      endingHooks: {
        failed: 'Most Hollow runs end Failed by the cut. The ending text gains a line: "{subject} is discharged as cured. They are found a week later standing in their kitchen, waiting to be told to eat."',
        terminate: 'If the player survives to the last day and obeys: Terminate, with the line "They did not react. They had stopped reacting some time ago."',
        happy: 'Happy is unreachable from Hollow (the feedback console was used). Refusing on the last day resolves to Failed as in the demo.',
      },
    },
    conspirator: {
      axis: 'trust', label: 'Conspirator',
      enter: 'Subject waves at 09:00, nods at the lens after each warning, and starts timing their infractions to the leaderboard.',
      lines: ['GO ON. I DON\'T MIND.', 'YOU NEED THE NUMBERS. I KNOW.', '{KIN.DAY}. {KIN.THEY} STILL WRITES.', 'WHEN YOU SAY GO.'],
      behaviorRule: 'Feeding: when the player is below the cut line after 14:00, the subject performs a cheap, obvious infraction (speak or camera) every 20 seconds with the bubble GO ON. A WARN during a fed infraction pays the rule\'s full credits (x1.0, not warnMult). A stimulus during a fed infraction drops trust by 10 and ends feeding for the day.',
      economy: 'With feeding, the kind path can hold mid-pack through the last day with four comfort items instead of a perfect day with six.',
      escape: 'door_known (-40 on Door Servo Ticket), map_complete (-50% on Camera Loop Tape), schedule_known (Door Release Override once a trusted subject asks about the door). With all three flags they are at the door at the start of the maintenance window instead of wandering; the Free ending text gains: "There is a note on the cot. It says only: {kin.day}."',
      director: ['The subject trusts you. That is a clinical failure on your part and a personal one on theirs.', 'Whatever you two have, it ends on day thirteen.'],
      endingHooks: {
        free: 'As above. Conspirator is the intended route to Free.',
        happy: 'Happy requires never using the console. Conspirator plus no console use: the Happy card gains "They wave at the camera on their way out. You wave back, this time."',
        refuse: 'Refusing on the last day after using the console still resolves to Failed, but the text changes: "{subject} is reassigned to {top}. The subject stops waving on the third day."',
        terminate: 'Terminate on a Conspirator: the subject looks at the camera and says "OH." before the feed goes flat. Assessment adds sadism +3.',
      },
    },
    feral: {
      axis: 'defiance', label: 'Feral',
      enter: 'Subject kicks the cot apart (a Maintenance ticket; no cot means sitting on the floor), cracks the camera lens with the tray (feed shows a crack; STARE rule cannot occur), and begins a hunger strike. Drawn a shade bigger than before.',
      lines: ['COME IN HERE.', 'COME IN HERE AND SAY IT.'],
      behaviorRule: 'Infraction gap halves. Credits x1.4. Every third stimulus triggers a Medical intervention: the feed goes to TRANSFER for one in-game hour and no credits are earned during it. A collapse while Feral ends the day at once (Medical), forfeiting the rest of the day.',
      economy: 'Loud and lucrative, then it falls apart. Feral is the fastest route to the Protocol Zero reveal and to being cut.',
      director: ['The subject is making you look bad, {name}. Make them stop.', 'Protocol Zero is available to you. I mention it only as a matter of record.'],
      endingHooks: {
        brutalist: 'Feral plus Protocol Zero is the standard Brutalist ending.',
        failed: 'Failed by the cut gains: "{subject} is reassigned to {top}, who requests a second set of electrodes on their first day."',
        terminate: 'Terminate on a Feral subject: they fight the restraints. "The feed goes flat at {time}, eventually."',
      },
    },
  },

  // ------------------------------------------------------------------ what the player sees
  // The subject's axes are hidden. The player reads them through these channels.
  readouts: {
    behaviorList: 'The patient file gains an OBSERVED BEHAVIORS section: one line per family, showing the current node label, the day it was first seen, and the Director\'s one-line note. A node that counts as an infraction is marked with its rule short name. This is the interactive list of behaviors.',
    feed: {
      hum: 'A low hum on the camera audio, volume = fracture / 100. Silent below 20. At 80+ it is in the office too.',
      light: 'Cell light flickers at fracture >= 55 (brief, every 20 to 40 s). Steady and slightly brighter at compliance >= 55 (the cell looks "clean"). Warmer tint at trust >= 55.',
      hr: 'Heart rate readout: fracture high = irregular (jumps of 20); compliance high = flat 58; defiance high = 90+; trust high = normal 66 to 72.',
      shadow: 'At fracture >= 70, during an infraction, a second shadow is drawn on the rear wall for one frame in three. Never acknowledged by the game.',
      marks: 'Wall marks change kind with the wall node: tally | hidden (behind cot, half visible) | glyph | map | mural (the eye from the title screen, built up stroke by stroke).',
    },
    director: 'Director lines gain a mood: warm and approving as fracture rises; impatient as compliance rises; clipped and suspicious as trust rises; theatrical and encouraging of Protocol Zero as defiance rises.',
    proposedUpgrades: [
      { id: 'audio',     kind: 'upgrade', cost: 35, name: 'Audio Feed',      desc: 'Hear the cell. Quiet infractions get a bubble, and the Motion Alert works on them.', note: 'Also makes the hum audible to the player earlier. Lore: technicians with Audio Feed start reporting the hum.' },
      { id: 'report',    kind: 'upgrade', cost: 90, name: 'Behavioral Report', desc: 'A weekly page in the patient file with four bars: Fracture, Compliance, Trust, Defiance.', note: 'Reveals the axes. Costs trust -5 on purchase (the subject sees the clipboard).' },
      { id: 'sedative',  kind: 'stimulus-like consumable', cost: 25, name: 'Sedative Mist', desc: 'Vents into Cell 4. Stress to zero. The subject is very agreeable for an hour.', note: 'compliance +6, defiance -8, fracture +1. No credits. Traits: authoritarianism 1, sadism 0.5.' },
    ],
  },

  // ------------------------------------------------------------------ new poses the builder must draw
  // Existing demo poses that nodes reuse: stand, sit, sitfloor, lie, bang, speak, stare, pace, write,
  // sing, cry, kneel, pushup, eat, wave, makebed, tiles, stretch, collapsed, react_*.
  newPoses: {
    shout:       'speak pose, mouth open wider, head tilted up, arms down and stiff; bubble larger',
    whisper:     'stand facing wall, head down, shoulders in; bubble small and dim',
    chant:       'stand front, arms slightly out, head back; bubble in a different letter style',
    mouth:       'stand front, mouth moving, no bubble beyond "..."',
    kick:        'bang pose with a leg raised; camera shake 0.1 on each hit',
    listen:      'stand at the door, head turned, ear to the door',
    scratch:     'bang pose, hands low, fingers to the seam; small dust particles',
    tap:         'stare pose with one arm raised to the lens; three-frame finger tap',
    cover:       'sit with both hands over eyes',
    attention:   'stand, arms at sides, perfectly still (no idle sway)',
    huddle:      'lie pose compressed, under the cot sprite (draw behind the cot)',
    nest:        'sitfloor inside a ring of bedding sprites',
    run:         'pace at 3x speed with a wall-hit flash at each end',
    pace_square: 'pace along four points, turning on the spot at each corner',
    rock:        'sitfloor with a 1 Hz forward-back tilt',
    pace_circle: 'walk a seven-point ring; after the third lap a worn ring mark appears',
    write_air:   'write pose, facing front, hand moving against nothing',
    laugh:       'stand or kneel with a two-frame shoulder shake; head back',
    read:        'sit with a paper sprite held up (existing book read can be reused)',
    prostrate:   'kneel pose flattened, forehead to floor, arms forward',
    box:         'stand facing camera, two-frame jab animation',
    offer:       'stand with the tray sprite held up toward the camera',
    throw:       'one frame wind-up, tray sprite flies to the door, clatter sound',
    salute:      'stand with one arm bent to the forehead',
    hollow_tremor: 'sit on bed edge, hands on knees, one-pixel hand jitter every 0.4 s',
  },

  // New spots for "at" (cell coordinates in the demo\'s 320x180 space, for the builder to place):
  newSpots: ['doorline (one pace short of door)', 'doorwall (wall beside the door)', 'undercot (behind the cot sprite)', 'corner (rear-right, empty)', 'wall (rear wall, existing)', 'camera (existing)'],

  // ------------------------------------------------------------------ pacing targets
  // Expected reach, for a player who steers one way consistently. ~15 to 20 infractions a day.
  pacing: {
    tier1: 'day 2 to 3', tier2: 'day 4 to 7', tier3: 'day 7 to 10', terminal: 'day 9 to 12',
    mixedPlay: 'A player who answers each behavior differently stays at tier 1 across families and never reaches a terminal state; the axes hover at 30 to 50 and the patient file reads "Baseline" or one of the four mid states. That is fine: the terminal states are for players who commit.',
    reversibility: 'Defiance fades on its own (3 a day). Trust fades without contact (1 a day). Compliance does not fade. Fracture never fades except through Therapy Hour (-5 a week) and the book and mural on purchase. Once fracture passes 60 the only way to avoid Vessel is to stop using the console harshly and buy Therapy Hour early.',
  },
};
