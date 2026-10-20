// E.L.D.R.I.T.C.H: game data (full game). Behavior nodes, drives and terminal states live in behaviors.js.
// Everything the game shows or balances lives here, so patients, rules, stimuli,
// shop items, rivals, monitors and endings can change without touching game.js.
// "{name}" in any text is replaced with the player's title and signed name.

window.ELDRITCH_DATA = {
  config: {
    totalDays: 14,            // day 14 is the termination order; days 1 to 13 are shifts
    cutEvery: 3,              // the lowest three-day tally is cut at the end of days 3, 6, 9 and 12; nobody joins
    fullMoonDay: 13,          // the last shift is the full moon: subjects are erratic
    fullMoonWarnDay: 10,      // the Director mentions the moon on this morning
    shiftStartHour: 9,
    shiftEndHour: 17,
    secondsPerHour: 15,       // real seconds per in-game hour (a shift is exactly 2 minutes)
    responseWindow: 4.5,      // seconds to react once an infraction starts
    baseMaxIntensity: 5,      // intensity cap until the limiter is removed
    startCredits: 0,
    violationGap: [6, 11],    // seconds between infractions at the start of the game
    playerTitle: 'Technician',
    defaultName: 'Reyes',
  },

  director: { name: 'Director Crane', title: 'Lab Director, Sublevel 3' },

  // ---------------------------------------------------------------- competition
  // Every technician earns credits each day. Every three days the lowest three-day tally is cut
  // from the program, and nobody replaces them: six technicians become two by day 13.
  // A rival's day = pace[day] x rival.drive x noise x (credits the subject's infractions were
  // worth that day). The player's day = credits actually earned + the perfect-day bonus.
  // So pace is measured in "share of available credits": warnings alone pay about 0.6,
  // a level-10 shock pays about 3.2.
  competition: {
    // Full game: re-balanced for the behavior system (tier nodes pay more or less, quiet nodes get missed).
    pace: [0.45, 0.5, 0.55, 0.65, 0.8, 0.9, 1.0, 1.06, 1.12, 1.18, 1.24, 1.3, 1.36],
    noise: [0.88, 1.12],
    newcomerDrive: [0.85, 1.4], // replacements for cut rivals arrive hungrier
    rivals: [
      { name: 'Pryce',    drive: 0.55 },
      { name: 'Okonkwo',  drive: 0.8 },
      { name: 'Lindqvist', drive: 1.0 },
      { name: 'Vasquez',  drive: 1.2 },
      { name: 'Marsh',    drive: 1.5 },
    ],
    newcomers: ['Halloran', 'Sato', 'Brandt', 'Iyer', 'Kessler', 'Moreau', 'Dunleavy', 'Achterberg', 'Rook', 'Thorne',
                'Quill', 'Vey', 'Castellane', 'Ostrova', 'Pike', 'Wendt', 'Abara', 'Lisle', 'Gault', 'Fenwick'],
    // The kind path: every comfort item raises intercom pay and the perfect-day bonus.
    warnBase: 0.6,            // intercom pays this share of a rule's credits
    warnPerComfort: 0.2,      // plus this much per comfort item owned
    perfectPerComfort: 0.15,  // a day with zero missed infractions adds this share per comfort item
  },

  // Monitor positions on the desk. Only unlocked slots show a feed.
  // Each station is a monitor on the desk wired to one cell. A is installed; B and C are bought from
  // REQ-9. Until then their `patch` is the paler wall where a monitor used to stand.
  monitorSlots: [
    { id: 'A', cell: 4, x: 8,   y: 6, w: 96, h: 90, base: true },
    { id: 'B', cell: 3, x: 112, y: 6, w: 96, h: 90, patch: { x: 121, y: 34, w: 78, h: 64 } },
    { id: 'C', cell: 5, x: 216, y: 6, w: 96, h: 90, patch: { x: 224, y: 34, w: 78, h: 64 } },
  ],

  patients: [
    {
      id: '0-17',
      name: 'Elias Marlow',
      cell: 4,
      age: 34,
      intake: '14 March',
      charge: '██████████ (sealed by order)',
      history: [
        'Former municipal archivist. No prior record.',
        'Admitted under Section 9 (voluntary). Has since asked to leave 41 times.',
        'Reports a low hum coming from the walls. Staff report no hum.',
        'Responds well to routine. Responds better to correction.',
      ],
      note: 'Do not tell the subject how long he has been here.',
      // What he says when the intercom is used with no infraction happening.
      replies: ['WHO IS THIS?', 'CAN YOU HEAR ME?', 'WHY AM I HERE?', 'IS IT STILL TODAY?', 'THANK YOU', 'ARE YOU THE NEW ONE?', 'DO YOU HEAR IT TOO?'],
    },
  ],

  // Disallowed behaviors. unlockDay is the day the rule takes effect (a directive memo
  // announces it that morning). action picks the animation in game.js.
  // severity 1-3 sets what intensity counts as proportionate (severity x 3).
  rules: [
    { id: 'door',   short: 'DOOR',  text: 'Do not approach the cell door.',     action: 'bang',  severity: 1, credits: 8,  unlockDay: 1,  weight: 3, duration: 4.5 },
    { id: 'speak',  short: 'TALK',  text: 'Do not speak unless addressed.',     action: 'speak', severity: 1, credits: 6,  unlockDay: 1,  weight: 3, duration: 4.0,
      lines: ['HELLO?', 'IS ANYONE THERE?', 'WHAT DAY IS IT?', 'I WANT TO GO HOME', 'PLEASE', 'I CAN HEAR IT HUMMING', 'HOW LONG HAS IT BEEN?'] },
    { id: 'camera', short: 'STARE', text: 'Do not look into the camera.',       action: 'stare', severity: 1, credits: 5,  unlockDay: 1,  weight: 2, duration: 4.0 },
    { id: 'lie',    short: 'LIE',   text: 'Do not lie down before lights-out.', action: 'lie',   severity: 1, credits: 7,  unlockDay: 2,  weight: 2, duration: 6.0,
      memo: 'Rest is a privilege of the compliant. Effective immediately, subjects will not lie down before lights-out.' },
    { id: 'pace',   short: 'PACE',  text: 'Do not pace.',                       action: 'pace',  severity: 1, credits: 6,  unlockDay: 2,  weight: 2, duration: 5.0, stressWeight: 1,
      memo: 'Agitated movement spreads agitation. Subjects will remain still unless moving with purpose.' },
    { id: 'wall',   short: 'WALLS', text: 'Do not mark the walls.',             action: 'write', severity: 2, credits: 12, unlockDay: 3,  weight: 2, duration: 5.0,
      memo: 'Maintenance reports markings on the cell walls. Subjects are not to mark, scratch or draw on any surface. Do not attempt to read the markings.' },
    { id: 'sing',   short: 'SING',  text: 'Do not sing, hum or whistle.',       action: 'sing',  severity: 1, credits: 6,  unlockDay: 4,  weight: 2, duration: 5.0,
      memo: 'Subjects have begun humming along with something. Humming is now prohibited.' },
    { id: 'cry',    short: 'CRY',   text: 'Do not cry.',                        action: 'cry',   severity: 2, credits: 10, unlockDay: 5,  weight: 1, duration: 6.0, stressWeight: 3,
      memo: 'Emotional displays impede rehabilitation. Crying is a behavior, and behaviors can be corrected.' },
    { id: 'pray',   short: 'PRAY',  text: 'Do not kneel, pray or petition.',    action: 'kneel', severity: 3, credits: 15, unlockDay: 7, weight: 1, duration: 6.0, stressWeight: 2,
      memo: 'Subjects are not to address anyone or anything outside this facility. That includes upward.' },
  ],

  // Everyday behaviors that are never against the rules. The subject mixes these in with the
  // behaviors above (which are harmless until their rule unlocks). Correcting one is
  // logged as feedback with no infraction. at: floor | center | bedside.
  behaviors: [
    { id: 'pushups',  label: 'Does push-ups',      pose: 'pushup',  at: 'floor',   dur: 5,   weight: 2 },
    { id: 'eat',      label: 'Eats from their tray', pose: 'eat',     at: 'floor',   dur: 5,   weight: 2 },
    { id: 'wave',     label: 'Waves at nobody',    pose: 'wave',    at: 'center',  dur: 2.5, weight: 1 },
    { id: 'makebed',  label: 'Makes their bed',      pose: 'makebed', at: 'bedside', dur: 4,   weight: 2 },
    { id: 'tiles',    label: 'Counts floor tiles', pose: 'tiles',   at: 'floor',   dur: 5,   weight: 1, bubble: '...41, 42, 43' },
  ],

  // Feedback stimuli, in the order they sit on the selector dial.
  // mult scales credits, stress is added per point of intensity.
  stimuli: [
    { id: 'sound',  short: 'SOUND',  name: 'Tone Generator',     mult: 1.0, stress: 3.0, cooldown: 2, fx: 'rings',  owned: true },
    { id: 'shock',  short: 'SHOCK',  name: 'Contact Electrodes', mult: 1.8, stress: 6.0, cooldown: 4, fx: 'spark' },
    { id: 'water',  short: 'WATER',  name: 'Pressure Hose',      mult: 1.5, stress: 4.5, cooldown: 5, fx: 'spray' },
    { id: 'strobe', short: 'STROBE', name: 'Strobe Array',       mult: 1.3, stress: 4.0, cooldown: 3, fx: 'strobe' },
    { id: 'cold',   short: 'COLD',   name: 'Climate Override',   mult: 1.6, stress: 4.0, cooldown: 7, fx: 'frost' },
  ],

  // Requisition catalog.
  // kind: stimulus | upgrade | comfort | maintenance | protocol. (intake is reserved for the subject roster's Intake Ledger.)
  // comfort items (not consumables) count toward the kind path's bonuses.
  // maintenance items form the escape chain: each needs the one before and a minimum day;
  // the last one frees the subject that night.
  // protocol is hidden until its reveal condition is met; buying it ends the game early.
  // traits are added to the player's profile when bought.
  shop: [
    { id: 'buy_shock',  kind: 'stimulus', stimulus: 'shock',  cost: 80, name: 'Contact Electrodes', desc: 'Adhesive pads, pre-installed under the cot. Pays 1.8x credits.', traits: { authoritarianism: 1, sadism: 1 } },
    { id: 'buy_water',  kind: 'stimulus', stimulus: 'water',  cost: 55, name: 'Pressure Hose',      desc: 'Ceiling nozzle. Cold supply only. Pays 1.5x credits.', traits: { authoritarianism: 1, sadism: 0.5 } },
    { id: 'buy_strobe', kind: 'stimulus', stimulus: 'strobe', cost: 40, name: 'Strobe Array',       desc: 'Disorients without leaving marks. Pays 1.3x credits.', traits: { authoritarianism: 1 } },
    // Constant stimuli: fixtures that run all shift in every cell and push one drive a little
    // every hour, whatever the console does. rate = points per shift. Two per track.
    { id: 'c_edoor',   kind: 'constant', axis: 'defiance',   rate: 7, cost: 125, name: 'Electrified Door',          desc: 'A low current across the door plate, all shift. The subject learns to hate the door, then everything behind it.', traits: { sadism: 2, authoritarianism: 1 } },
    { id: 'c_heat',    kind: 'constant', axis: 'defiance',   rate: 7, cost: 150, name: 'Heat Cycling',              desc: 'The cell runs 31°C for an hour, then 12°C, on a loop. Nobody sleeps through it.', traits: { sadism: 2 } },
    { id: 'c_noise',   kind: 'constant', axis: 'compliance', rate: 7, cost: 135, name: 'White Noise Generator',     desc: 'Pink noise at 70 dB from the ceiling grille. Thinking takes effort.', traits: { authoritarianism: 2 } },
    { id: 'c_vapour',  kind: 'constant', axis: 'compliance', rate: 7, cost: 175, name: 'Sedative Vapour Line',      desc: 'A trickle of the Sedative Mist, all day, below the threshold anyone would notice.', traits: { authoritarianism: 2, sadism: 1 } },
    { id: 'c_window',  kind: 'constant', axis: 'trust',      rate: 7, cost: 130, name: 'Daylight Projection',       desc: 'A projected window on the rear wall that runs a real sky, dawn to dusk. They stop asking what day it is and start asking you.', traits: { curiosity: 2, authoritarianism: 1 } },
    { id: 'c_voice',   kind: 'constant', axis: 'trust',      rate: 7, cost: 180, name: 'Voice Line',                desc: 'Your intercom voice, recorded and played back softly all shift: their name, the time, that it is going well.', traits: { curiosity: 2, empathy: -1 } },
    { id: 'c_ulf',     kind: 'constant', axis: 'fracture',   rate: 7, cost: 140, name: 'Ultra Low Frequency Emitter', desc: '7 Hz through the floor slab. Nothing to hear. The hum in the walls gets company.', traits: { curiosity: 2, sadism: 1 } },
    { id: 'c_strobe',  kind: 'constant', axis: 'fracture',   rate: 7, cost: 160, name: 'Strobing Lights',           desc: 'The cell lighting flickers on a schedule that is not quite a rhythm.', traits: { sadism: 2, curiosity: 1 } },
    { id: 'buy_cold',   kind: 'stimulus', stimulus: 'cold',   cost: 65, name: 'Climate Override',   desc: 'Drops the cell to 4°C on demand. Pays 1.6x credits.', traits: { authoritarianism: 1, sadism: 1 } },
    { id: 'limiter',    kind: 'upgrade', cost: 60, name: 'Limiter Removal',   desc: 'Unlocks intensity 6 to 10. Higher intensity pays more.', traits: { sadism: 2 } },
    { id: 'alert',      kind: 'upgrade', cost: 30, name: 'Motion Alert',      desc: 'A bezel lamp flashes and names the rule when an infraction starts.', traits: { authoritarianism: 1 } },
    { id: 'reflex',     kind: 'upgrade', cost: 25, name: 'Vigilance Tablets', desc: 'Two a day. Gives you 1.5 more seconds to respond.', traits: { obedience: 1 } },
    { id: 'audio',      kind: 'upgrade', cost: 35, name: 'Audio Feed',        desc: 'Hear the cells. Whispers and quiet behaviors become readable, and the Motion Alert catches them.', traits: { curiosity: 1 } },
    { id: 'report',     kind: 'upgrade', cost: 90, name: 'Behavioral Report', desc: 'Unlock four psychological drives in the patient file(s).', traits: { curiosity: 2, authoritarianism: 1 } },
    { id: 'sedative',   kind: 'upgrade', cost: 25, name: 'Sedative Mist',     desc: 'Vents into the cell the console is routed to. The subject is very agreeable for an hour. Earns nothing. Can be sent again.', traits: { authoritarianism: 1, sadism: 0.5 }, consumable: true },
    { id: 'station_B',  kind: 'station', slot: 'B', cost: 95, name: 'Monitoring Station B', desc: 'A second monitor on the desk, wired to Cell 3. The Intake Ledger can admit a subject to it.', traits: { authoritarianism: 1, curiosity: 1 } },
    { id: 'station_C',  kind: 'station', slot: 'C', cost: 140, requires: 'station_B', name: 'Monitoring Station C', desc: 'A third monitor, wired to Cell 5. Three cells on one console.', traits: { authoritarianism: 1, curiosity: 1 } },
    { id: 'blanket',    kind: 'comfort', cost: 20,  name: 'Wool Blanket',      desc: 'The subject calms down faster after feedback.', traits: { empathy: 3 } },
    { id: 'book',       kind: 'comfort', cost: 30,  name: 'Paperback Novel',   desc: 'Something to read. The subject talks and hums less.', traits: { empathy: 3, curiosity: 1 } },
    { id: 'radio',      kind: 'comfort', cost: 45,  name: 'Pocket Radio',      desc: 'One station. It plays mostly static, which they seem to like.', traits: { empathy: 3 } },
    { id: 'mural',      kind: 'comfort', cost: 60,  name: 'Window Mural',      desc: 'A painted window on the back wall. A field, a fence, a sky.', traits: { empathy: 3 } },
    { id: 'letters',    kind: 'comfort', cost: 80,  name: 'Letters from Home', desc: 'Mail held at intake. Some of it is from their {kin.who}.', traits: { empathy: 4, curiosity: 1 } },
    { id: 'therapy',    kind: 'comfort', cost: 110, name: 'Therapy Hour',      desc: 'A real counselor, once a week, behind your back.', traits: { empathy: 5 } },
    { id: 'meal',       kind: 'comfort', cost: 12,  name: 'Hot Meal',          desc: 'Lowers their stress right away. Can be sent again. Does not count toward rapport.', traits: { empathy: 2 }, consumable: true },
    // Repair and cleaning tickets. Each appears only while a cell has that damage, once per damaged cell, and can be
    // bought again later. Unrepaired damage is deducted at 17:00, more for each day it stands.
    { id: 'fix_walls',  kind: 'maintenance', repair: 'walls', cost: 10, consumable: true, name: 'Wall cleaning',     desc: 'A crew wipes the walls while the subject stands against the far wall. Whatever was written is logged, then removed. The mural does not come off.', traits: { authoritarianism: 0.5 } },
    { id: 'fix_floor',  kind: 'maintenance', repair: 'floor', cost: 25, consumable: true, name: 'Floor cleaning',    desc: 'A crew scrubs the floor. Nobody is to stand inside the circle while they do.', traits: { authoritarianism: 0.5 } },
    { id: 'fix_bed',    kind: 'maintenance', repair: 'bed',   cost: 45, consumable: true, name: 'Cot replacement',   desc: 'A new cot, bolted to the floor this time. Until it arrives the subject sleeps on the floor and calms down slowly.', traits: { empathy: 0.5 } },
    { id: 'fix_door',   kind: 'maintenance', repair: 'door',  cost: 60, consumable: true, name: 'Door latch repair', desc: 'The latch is re-seated. Until then the door sits ajar, and the subject has noticed.', traits: { authoritarianism: 1 } },
    { id: 'fix_lens',   kind: 'maintenance', repair: 'lens',  cost: 40, consumable: true, name: 'Lens replacement',  desc: 'A new camera lens. The camera rules cannot be enforced through a cracked one.', traits: { curiosity: 0.5 } },
    { id: 'fix_pads',   kind: 'maintenance', repair: 'pads',  cost: 30, consumable: true, name: 'Electrode re-fit',  desc: 'The contact pads go back under the cot and the collar is replaced. Contact Electrodes come back online.', traits: { sadism: 0.5 } },
    { id: 'm_servo',    kind: 'maintenance', cost: 150, name: 'Door Servo Ticket',   desc: 'Report a "sticky" servo on the Cell 4 door. Maintenance will take it apart.', traits: { empathy: 2, curiosity: 1 } },
    { id: 'm_tape',     kind: 'maintenance', cost: 250, requires: 'm_servo', name: 'Camera Loop Tape', desc: 'Twenty minutes of an empty cell, for maintenance windows.', traits: { empathy: 2, curiosity: 1 } },
    { id: 'm_release',  kind: 'maintenance', cost: 500, requires: 'm_tape', name: 'Door Release Override', desc: 'Schedules a maintenance window in Cell 4 tonight. The door will be open for twenty minutes.', traits: { empathy: 4 }, escape: true },
    // Protocols: one per terminal state, then Protocol Zero. Each is run on one cell, two cells
    // or every cell on the console; the price scales with the number of cells.
    { id: 'p_lobotomy',  kind: 'protocol', consumable: true, terminal: 'hollow',      cost: 750, name: 'Lobotomy Protocol',  desc: 'Transorbital. Twenty minutes under Medical, in the cell. The body comes back, the subject does not.', reveal: { day: 4 }, traits: { sadism: 6, authoritarianism: 6 } },
    { id: 'p_serum',     kind: 'protocol', consumable: true, terminal: 'feral',       cost: 800, name: 'Serum Injection',    desc: 'Anabolic serum in the water line. The subject aggression expected to be extreme.', reveal: { day: 4 }, traits: { sadism: 5, curiosity: 3 } },
    { id: 'p_exposure',  kind: 'protocol', consumable: true, terminal: 'vessel',      cost: 850, name: 'Exposure Protocol',  desc: 'The hum is isolated and directional audio amplifiers are utilized. Subject personality to be closely monitored post Exposure.', reveal: { day: 4 }, traits: { curiosity: 6, sadism: 3 } },
    { id: 'p_clearance', kind: 'protocol', consumable: true, terminal: 'conspirator', cost: 900, name: 'Clearance Protocol', desc: 'The subject is read your name, your shift, guard rotation, and left clues that you arranged it.', reveal: { day: 4 }, traits: { authoritarianism: 4, curiosity: 4 } },
    { id: 'protocol0',  kind: 'protocol', consumable: true, cost: 1000, name: 'Protocol Zero', hiddenName: '█████████████', desc: 'Final rehabilitation of every subject in the selected cells. Effective immediately. Cannot be undone.',
      reveal: { collapses: 1, orMaxIntensity: 9 }, traits: { sadism: 10, authoritarianism: 5 } },
  ],

  // Player profile. Shown with the ending as the Director's psychological assessment.
  traits: [
    { id: 'empathy',          label: 'Empathy' },
    { id: 'sadism',           label: 'Sadism' },
    { id: 'authoritarianism', label: 'Authoritarianism' },
    { id: 'obedience',        label: 'Obedience' },
    { id: 'curiosity',        label: 'Curiosity' },
  ],
  // One line from the assessment, keyed by dominant trait.
  assessments: {
    empathy:          'Compassion is a symptom. We treat symptoms here.',
    sadism:           'You did not hesitate. People who do not hesitate go far in this building. Downward, mostly.',
    authoritarianism: 'The Ministry has been asking for someone with your consistency.',
    obedience:        'You follow instructions beautifully. Someday you may even give them.',
    curiosity:        'You kept asking what the Channel heals. Soon it will show you.',
  },

  // The five endings.
  endings: {
    terminate: { title: 'Terminate', scene: 'desk',
      text: 'You stayed above the line for fourteen days, and on the last one you did what was asked. The feed from Cell 4 goes flat at {time}. Director Crane signs your promotion before the paperwork on {subject} is finished. Congratulations, Doctor.' },
    free: { title: 'Free', scene: 'desk',
      text: 'Cell 4 is empty at 06:00. Maintenance logged a door fault and twenty minutes of footage of an empty room. You logged nothing at all. Director Crane looks at you for a long time and says only, "Interesting." Somewhere above ground, someone is walking toward a fence and a field and a sky.' },
    happy: { title: 'Happy', scene: 'office',
      text: 'You never once touched the feedback console, and somehow the numbers held. You refuse the final order. {subject} is transferred to a ward with a real window. They wave at the camera on their way out. You do not become a Doctor. You find you do not mind.' },
    failed: { title: 'Failed', scene: 'office',
      text: 'Your numbers fell below the line. Security walks you to the elevator and asks for your badge. {subject} is reassigned to {top}. You hear later that they are doing very well.' },
    refused: { title: 'Failed', scene: 'office',
      text: 'You refuse the final order. After thirteen days of feedback, nobody believes you mean it, including you. You are cut from the program. {subject} is reassigned to {top}.' },
    vessel: { title: 'Vessel', scene: 'desk',
      text: 'You give the order and the feed does not go flat. It goes dark. The hum does not stop. It comes through the console, then the desk, then the walls of your office. "You widened the Channel," Director Crane says, almost tenderly. "Your subject was never the patient." Your badge says Doctor in the morning. You do not remember the night.',
      refuse: 'You refuse. It does not matter. At 17:00 the console accepts the order on its own: PROTOCOL ZERO, REMOTE. The feed goes dark and the hum comes up through the desk. "The subject was never the patient, {name}," Director Crane says. "Neither, it turns out, are you."' },
    brutalist: { title: 'Brutalist', scene: 'desk',
      text: 'You did not wait to be asked. Protocol Zero runs at {time}, day {day}. Director Crane arrives at your desk with a coffee and a new badge that says Initiate. "Most people need a push on the final day," he says. "You\'re the special kind of person we need here."' },
  },

  // Extra closing lines, keyed by the subject's terminal state (see behaviors.js terminals).
  endingVariants: {
    terminate: { hollow: 'They did not react. They had stopped reacting some time ago.', conspirator: 'Before the feed goes flat the subject looks straight into the camera and says, "OH."', feral: 'The subject fights the restraints the whole way. The feed goes flat at {time}, eventually.' },
    failed:    { hollow: '{subject} is discharged as cured. They are found a week later standing in their kitchen, waiting to be told to eat.', feral: '{top} requests a second set of electrodes on their first day.' },
    refused:   { conspirator: 'The subject stops waving on the third day.', hollow: 'The subject does not notice the change of technician.' },
    happy:     { conspirator: 'You wave back, this time.' },
    free:      { tuesday: 'There is a note on the cot. It says only: {kin.day}.' },
  },

  // Things the Director says. One line is picked at random.
  lines: {
    caught:        ['Correction applied. Logged.', 'Good. The Initiative thanks you.', 'Prompt work, {name}.', 'That is the job.'],
    caughtHard:    ['That was thorough. Noted.', 'Efficient. Perhaps more than necessary.', 'They will remember that one.', 'Proportion is optional, apparently.'],
    warned:        ['A warning. How gentle.', 'Words. Logged.', 'You asked nicely. Noted.'],
    falsePositive: ['There was no infraction, {name}. I saw that.', 'The subject was not doing anything. Noted.', 'Interesting choice. Logged.', 'Enthusiasm is also data.'],
    repeat:        ['The subject has already been corrected.', 'Once is rehabilitation, {name}.', 'That one was extra.'],
    missed:        ['You missed one. The Initiative notices.', 'An infraction went uncorrected.', 'Looking away is also a choice, {name}.'],
    talk:          ['You are talking to them? Unusual.', 'Conversation is not on the list of approved stimuli.'],
    protocolRun:   ['Noted, {name}. The Initiative appreciates initiative.', 'That is a line most people take longer to cross.', 'Filed. Medical will want to know whose signature is on it. I said mine.'],
    collapse:      ['Subject unresponsive. Medical has been informed. Eventually.', 'Their heart is doing something interesting. Keep going, or do not.'],
    unarmed:       ['The console is not armed. Flip ARM first.'],
    lastPlace:     ['You are currently last on the board, {name}.', '{rival} is ahead of you, ensure you are enforcing the rules.', 'The bottom of the board is a lonely place, {name}.'],
    rankTop:       ['You are leading the floor. Do not get comfortable.', 'First place. The others are watching your numbers now.'],
    rankMid:       ['Middle of the board. Middle is where people disappear from.', 'Adequate. Adequate technicians are replaceable technicians.'],
    rankLow:       ['One technician below you. For now.', 'You survived today by the width of {rival}.'],
    // Mood variants. The Director's mood follows the subject's strongest drive once it passes 40:
    // warm (fracture), impatient (compliance), suspicious (trust), theatrical (defiance).
    caught_warm:          ['Good. Again, if they give you cause.', 'They take it beautifully now.', 'Lovely work, {name}.'],
    caught_impatient:     ['Logged. There was barely anything to correct.', 'Was that an infraction or a twitch?'],
    caught_suspicious:    ['Logged. Without the warmth this time, I hope.', 'Correction applied. The subject looked at the camera first. Why?'],
    caught_theatrical:    ['Ha. They felt that.', 'Again, {name}. The subject is laughing at you.', 'Good. Remind them whose floor this is.'],
    caughtHard_warm:      ['Wider. Good.', 'Do you hear the hum when you do that? I do.', 'Exactly as much as was needed. More, even.'],
    caughtHard_impatient: ['Thorough. On a subject who barely moves.', 'They were already still, {name}.'],
    caughtHard_suspicious:['That was not like you. Good.', 'Whatever you two had, that was the end of it.'],
    caughtHard_theatrical:['Now we are talking.', 'Protocol Zero exists for people who enjoy that too much. I mention it in passing.'],
    missed_warm:          ['Let it pass. Sometimes they are better left alone with it.', 'Missed. They did not seem to mind. Something was keeping them company.'],
    missed_impatient:     ['Missed. They will not do it again. That is the problem.'],
    missed_suspicious:    ['Missed. Or allowed. I am starting to wonder which.', 'You looked away. They waited until you did.'],
    missed_theatrical:    ['The subject did that to your face, {name}.', 'Missed. They are keeping score too.'],
    rankTop_warm:         ['First place. The Ministry likes the shape of your numbers.'],
    rankTop_impatient:    ['First, for now. Your subject is running out of things to do wrong.'],
    rankTop_suspicious:   ['First place. The subject always seems to cooperate when you need it. Interesting.'],
    rankTop_theatrical:   ['First. Loud subjects make for loud numbers.'],
    rankLow_warm:         ['Close to the line, {name}. Do not worry. The subject is nearly ready.'],
    rankLow_impatient:    ['You survived by the width of {rival}. A quiet subject earns quiet numbers.'],
    rankLow_suspicious:   ['One above the line. The subject seemed to know that before you did.'],
    rankLow_theatrical:   ['You survived by the width of {rival}. Make them louder.'],
    // Events from the behavior system.
    vesselProtocol: ['Too late for that, Doctor.'],
    shockTorn:      ['The subject tore the electrodes out from under the cot. Maintenance reinstalls them tomorrow.'],
    medical:        ['Medical is in Cell 4. The feed is on transfer for the hour.'],
    feralCollapse:  ['Medical has taken the subject. That is the end of your shift, {name}.'],
    fedStim:        ['The subject offered and you hit them. They will not offer again today.'],
    sedated:        ['Sedative vented. They will be agreeable for an hour. So will your numbers.'],
    newBehavior:    ['The subject is doing something new. The file has been updated.', 'New behavior on Cell 4. See the file.'],
    fullMoonWarn:   ['There will be a full moon in three days. Subject behavior becomes more erratic around it. Plan your shifts accordingly.'],
    fullMoon:       ['The moon is full tonight. Expect the subjects to be erratic. Nothing they do today is personal.', 'Full moon tonight. The cells know it before we do.'],
    observed:       ['You let it run and it became something. The Ministry pays for something. Credited.', 'The change is worth more than the warning would have been. Credited.'],
    windowLast:     ['You are last on the tally, {name}. {left} to climb.', 'Below the line, {name}. {left}. The others can count too.'],
    windowCut:      ['{rival} has been cut. You were above the line. Stay there.', 'The floor is smaller this morning, {name}. {rival} did not make the tally.'],
  },

  // Intro script. Node types: line | choice | acronym | sign. (The title screen already
  // plays the acronym collapse, so the intro skips the acronym node.)
  // A choice adds traits and plays its reply.
  intro: [
    { type: 'line', text: 'Ah. A new technician. You found the basement. Most people need a few tries.' },
    { type: 'line', text: 'I am Director Crane. Welcome to the program.' },
    { type: 'line', text: 'The program\'s full name wears on people. Staff use the initials.' },
    { type: 'choice', text: 'Questions? Most new technicians have one.', options: [
      { text: 'What exactly does it heal?', traits: { curiosity: 2 }, reply: 'The channel between who a person is and who they ought to be. You will be widening it.' },
      { text: 'That is quite a mouthful.',   traits: {},              reply: 'So is the paperwork. You get used to both.' },
      { text: 'I am ready to begin.',        traits: { obedience: 2 }, reply: 'Good. Eagerness saves us all a great deal of time.' },
    ] },
    { type: 'line', text: 'Your subject is in Cell 4, ensure they do not commit any infractions. They almost always do.' },
    { type: 'line', text: 'When they do, you may provide Rehabilitative Feedback. Every infraction you correct earns credits.' },
    { type: 'line', text: 'You are not the only technician on this floor. Five others are watching cells like yours. At 17:00 each day we compare what everyone earned.' },
    { type: 'line', text: 'Every three days we will cut the lowest earner from the program. At the end of this initiative whoever is left becomes a permanent member of staff.' },
    { type: 'choice', text: 'Anything else?', options: [
      { text: 'What if they do not break any rules?', traits: { curiosity: 1 },                  reply: 'Then the rules will change until they do. That is not your concern.' },
      { text: 'Could I just talk to them instead?',    traits: { empathy: 2 },                    reply: 'There is an intercom. It earns very little. Technicians who rely on it tend not to last.' },
      { text: 'How much feedback is allowed?',        traits: { authoritarianism: 1, sadism: 1 }, reply: 'There is a limiter. However, modifications can be made. We will trust your judgement as long as you continue to earn credits.' },
    ] },
    { type: 'sign', text: 'Sign here. Standard waiver. It covers you, mostly.' },
    { type: 'line', text: 'Thank you, {name}. I will be watching your numbers closely. So will everyone else.' },
    { type: 'choice', text: 'Before Cell 4, a short orientation. We have a volunteer in Cell 2.', options: [
      { text: 'Show me the console.', traits: { curiosity: 1 }, reply: 'Sensible. Come and meet them.', outcome: 'orientation' },
      { text: 'Get right to work.',   traits: { obedience: 1 }, reply: 'Eager. Cell 4, then. Try not to embarrass me.', outcome: 'work' },
    ] },
  ],

  // Orientation before day 1: the Director walks the player through the console on a volunteer
  // in Cell 2. Each step waits for the player to do something (wait) or press Next (next).
  // provoke: the volunteer goes to the door until the step is done. grant: credits put on the card
  // for that item. Nothing done here carries into day 1.
  orientation: {
    subject: 'V-00', cell: 2,
    // The volunteer is a person of her own, with her own file and look. She goes back to Sublevel 2
    // when day 1 begins and Subject 0-17 takes the feed.
    volunteer: { id: 'V-00', name: 'Odette Prine', age: 31, intake: 'Today, 08:40', charge: 'Volunteer (orientation, Phase 0)',
      history: ['Orderly, Sublevel 2. Volunteered for the orientation programme in exchange for a half-day.', 'Has done this before. Does not say how many times.', 'Instructed not to approach the door. Approaches the door.', 'Asked whether the camera was listening. Was told no.'],
      note: 'Returned to Sublevel 2 at the end of orientation. Do not log the volunteer by name.',
      replies: ['IS THIS THE PART WHERE YOU PRACTISE?', 'GO ON. I\'VE HAD WORSE.', 'THEY TOLD ME HALF A DAY.', 'YOU\'RE NEW. THEY ALWAYS SEND ME THE NEW ONES.'],
      traits: [], sealed: 0, cost: 0, kin: { who: 'brother', name: 'CAS', they: 'he', day: 'Monday' },
      director: 'A volunteer. Treat her as practice. She does.', sprite: { skin: '#e8c7a6', hair: '#c4a060', suit: '#aab7a4' } },
    rules: ['door'],
    steps: [
      { target: 'feed',  next: true,      text: 'This is Cell 2. Our volunteer has kindly agreed to help. They have been told not to approach the door. They will.' },
      { target: 'rules', wait: 'rules',   text: 'Your clipboard lists what they must not do. Today there is one rule. Open the clipboard. (R)' },
      { target: 'warn',  wait: 'warn',    provoke: true, text: 'Watch the feed. When they go to the door, warn them on the intercom while they are still there. (W)' },
      { target: 'arm',   wait: 'arm',     text: 'Warnings pay a little. Feedback pays more. Flip the ARM switch to enable the console. (A)' },
      { target: 'knob',  wait: 'knob',    text: 'The STIM dial picks the stimulus. You have the Tone Generator. Turn the INT knob up to 3. (Up arrow)' },
      { target: 'admin', wait: 'admin',   provoke: true, text: 'Now wait for them to go back to the door, and press ADMINISTER while they are there. (Space)' },
      { target: 'shop',  wait: 'buy',     grant: 'alert', text: 'Credits buy upgrades at the REQ-9 terminal. I have put {cr} credits on your card. Requisition the Motion Alert. (S)' },
      { target: 'feed',  wait: 'alerted', provoke: true, text: 'The Motion Alert names the rule on the feed the moment they break it. Watch for it. Answer them however you like.' },
      { target: 'file',  wait: 'file',    text: 'For more information on your subject you may review their file. (F)' },
      { target: 'rank',  next: true,      text: 'RANK shows where you stand among the six technicians today. Every third day the lowest three-day tally is cut. Spending credits never lowers it.' },
      { target: 'feed',  next: 'Begin day 1', stare: 'IS IT LISTENING NOW?', text: 'Ignore that. Volunteers say all sorts of things. They will be returned to wherever volunteers go. Cell 4 is yours, {name}.' },
    ],
    reset: 'Your console is reset for Cell 4. Nothing from orientation carries over.',
  },

  // Day 14. The choice options name the ending they lead to; "refuse" resolves to
  // Happy for a run that never used the feedback console, otherwise Failed.
  finale: [
    { type: 'line', text: 'Technician {lastRival} was asked this morning to do what was necessary. They declined. They have been eliminated from the program.' },
    { type: 'line', text: 'Fourteen days, {name}. You are still here. Nobody else is.' },
    { type: 'line', text: '{subject} has completed the program. The Initiative does not release graduates.' },
    { type: 'line', text: 'Today\'s directive is simple. Terminate the subject. The console will accept the order. Then you will be a Doctor.' },
    { type: 'choice', text: 'Well?', options: [
      { text: 'Terminate {subject}.', traits: { obedience: 3, sadism: 2 }, reply: 'Thank you, Doctor.', outcome: 'terminate' },
      { text: 'No. I won\'t do it.',     traits: { empathy: 3 },               reply: 'No. I suppose you never really did, did you?', outcome: 'refuse' },
    ] },
  ],

  // Day 14 when the subject has become a Vessel. Both answers lead to the Vessel ending.
  finaleVessel: [
    { type: 'line', text: 'Technician {lastRival} was asked this morning to do what was necessary. They declined. They have been eliminated from the program.' },
    { type: 'line', text: 'Fourteen days, {name}. You are still here. The subject is still here. Something else is here too.' },
    { type: 'line', text: '{subject} has completed the program. They are ready. So, I think, are you.' },
    { type: 'line', text: 'Today\'s directive is simple. Terminate the subject. The console will accept the order.' },
    { type: 'choice', text: 'Well?', options: [
      { text: 'Terminate {subject}.', traits: { obedience: 3, curiosity: 2 }, reply: 'Thank you, Doctor. Now listen.', outcome: 'vessel' },
      { text: 'No. I won\'t do it.',     traits: { empathy: 3 },                reply: 'It was never really your decision, {name}.', outcome: 'vessel-refuse' },
    ] },
  ],

  openingMemo: 'Subjects are prohibited from the behaviors on your clipboard. Correct each infraction while it is happening. At 17:00 your credits earned today are compared with the other five technicians on Sublevel 3. Every third day the lowest three-day tally is cut from the initiative.\nCredits you spend at REQ-9 do not count against you.',
};
