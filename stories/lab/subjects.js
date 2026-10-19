// E.L.D.R.I.T.C.H: subject roster, hidden traits and the intake (purchase / replacement) system.
// Loads as window.ELDRITCH_SUBJECTS beside data.js and behaviors.js. Design notes: SUBJECT_SYSTEM.md.
//
// Vocabulary
//   trait      a hidden mechanical profile. The player never sees the trait id. The patient file
//              shows one of the trait's `file` phrases instead (vague, clinical, deniable).
//   mods       what a trait does to the engine: starting axes, axis gain, family pick weight,
//              transition count multipliers, stress, proportionate line, gap, terminal thresholds.
//              Several traits on one subject multiply together (additive fields add).
//   sealed     how many of a subject's traits the file redacts entirely (shown as a black bar).
//   ledger     the Intake Ledger: the REQ-9 tab where subjects are requisitioned.
//   alumni     former technicians. Cut on day N, eligible as subjects from day N+2.

window.ELDRITCH_SUBJECTS = {

  // ------------------------------------------------------------------ mods schema
  // Every field is optional. Multipliers default to 1, additive fields to 0.
  //   axisStart        { axis: +n }          added to behaviors.axes[].start on intake
  //   axisGain         { axis: xk }          multiplies every scaled axis delta for that axis
  //   familyWeight     { family: xk }        multiplies node.weight when nextPlan picks a family
  //   transitionCount  { all, fromAxis:{axis:xk}, toAxis:{axis:xk}, family:{fam:xk}, toNode:{nodeId:xk} }
  //                                          multiplies transition.count (the responses needed to move).
  //                                          >1 = harder to change, <1 = easier. Rounded up.
  //   gapMult          xk                    multiplies the infraction gap (more or fewer infractions)
  //   stressMult       xk                    multiplies stimulus stress (collapses sooner or later)
  //   proportionate    xk                    multiplies the severity x 3 line that separates mild from harsh
  //   relapseMult      xk                    multiplies tuning.relapseMax (shaped behaviors slip back)
  //   terminalAt       { axis: n }           replaces tuning.terminalAt for that axis
  //   driftMin         { axis: n }           replaces drifts[].min for that axis
  //   dayShift         { nodeId: -n }        shifts a transition's `day` requirement into that node
  //   startNodes       { family: nodeId }    the family begins on this node instead of tier 0
  //   trustDecay       n                     replaces axes.trust.decayPerDay
  //   collapseFloor    n                     stress at which a stimulus can collapse the subject (engine default if absent)
  //   medical          true                  overkill on this subject can end the run (see SUBJECT_SYSTEM.md)
  //   humOffset        n                     added to the fracture level at which the hum becomes audible (negative = earlier)
  //   bubbles          { nodeId: [..] }      extra speech lines appended to that node's bubble list
  //   conspiracyMult   xk                    multiplies the ignore counts that set conspiracy flags
  //   quietWeight      xk                    multiplies node.weight for any node flagged quiet (added by the meshing pass)
  //   scheduled        { nodeId: 'HH:MM' }   the node is planned at that time every day, like wave_morning at 09:00
  //   transitionCount.toNode { nodeId: xk }   multiplies the count of any transition that enters that node
  //
  // Combining: multipliers multiply, additive fields add, startNodes / terminalAt / scheduled take the
  // first trait listed. A roster entry's own `axisOverride` and `startNodes` apply after the traits.

  traits: {
    violent: {
      file: ['Prone to violence.', 'History of property damage.', 'Two prior restraint incidents. Details withheld.'],
      memoAffinity: ['strike'],
      yield: 3, directorPref: 1,
      mods: { axisStart: { defiance: 10 }, axisGain: { defiance: 1.2 },
              familyWeight: { door: 1.6, pace: 1.3, pushups: 1.2 },
              transitionCount: { fromAxis: { defiance: 1.6 }, family: { door: 1.4 } },
              startNodes: { door: 'door_kick' },
              bubbles: { door_kick: ['I\'LL TAKE IT OFF THE HINGES'], speak_shout: ['COME IN HERE AND SAY THAT'] } },
      learned: 'Kicks the door from day 1 and keeps kicking it long after a calmer subject would have stopped. Striking fixtures unlocks the STRIKE rule early.' },

    defiant: {
      file: ['Oppositional.', 'Does not accept correction well.', 'Refused intake interview.'],
      memoAffinity: ['tray'],     // eat -> eat_refuse (punished x2) -> eat_throw: the punished path, and defiance x1.3 for the ignore path
      yield: 2, directorPref: 0,
      mods: { axisStart: { defiance: 8 }, axisGain: { defiance: 1.3, compliance: 0.7 },
              terminalAt: { defiance: 72 },
              transitionCount: { toAxis: { compliance: 1.5 } } },
      learned: 'Punishing something they were allowed to do costs you more than usual. Goes Feral early. Pushes the tray away, then throws it.' },

    restless: {
      file: ['Elevated motor activity.', 'Does not sit for long.', 'Sleep: fragmented.'],
      yield: 3, directorPref: 1,
      mods: { gapMult: 0.8, familyWeight: { pace: 1.8, pushups: 1.4, lie: 0.6 } },
      learned: 'More infractions per hour. Easy credits on days 3 to 8, and the leaderboard pace table will catch up.' },

    hardy: {
      file: ['High pain threshold.', 'Previous occupation: physical.', 'Tolerates discomfort.'],
      yield: 1, directorPref: -1,
      mods: { stressMult: 0.7, proportionate: 1.35, axisGain: { fracture: 0.85 },
              transitionCount: { fromAxis: { defiance: 1.2 } } },
      learned: 'Intensity 4 on a severity-1 rule still counts as mild. You need the Limiter sooner. They almost never collapse.' },

    frail: {
      file: ['Medical: see attached.', 'Cardiac history. Intensity cap advised.', 'Low body weight on intake.'],
      yield: -1, directorPref: -1,
      mods: { stressMult: 1.5, collapseFloor: 55, medical: true, axisGain: { compliance: 1.2, fracture: 1.1 } },
      learned: 'Collapses easily and overkill can end the run with a medical incident. Cheap to buy for a reason.' },

    brittle: {
      file: ['Fragile affect.', 'Low tolerance for stress.', 'Cries during intake.'],
      memoAffinity: ['tongues'],
      yield: 1, directorPref: 2,
      mods: { axisGain: { fracture: 1.4 }, terminalAt: { fracture: 70 }, driftMin: { fracture: 48 },
              familyWeight: { cry: 1.8 }, transitionCount: { toAxis: { fracture: 0.75 } } },
      learned: 'Fractures fast. The Director prices these low and recommends them often.' },

    attuned: {
      file: ['Reports auditory phenomena.', 'Reports a hum. Staff report no hum.', 'Sensitive to sound and light.'],
      memoAffinity: ['tongues', 'eye'],
      yield: 2, directorPref: 3,
      mods: { axisStart: { fracture: 12 }, humOffset: -10, dayShift: { speak_chant: -3, camera_draw_eye: -3, wall_mural: -3 },   // pray_wall has no day gate; the mural (day 11) does
              familyWeight: { wall: 1.3, camera: 1.2 },
              bubbles: { speak: ['IT WAS HUMMING BEFORE I GOT HERE'], speak_whisper: ['...it has a shape...'] } },
      learned: 'Hears the Channel from day 1. Chanting and the eye arrive days early. The Fracture rules pay best.' },

    suggestible: {
      file: ['Highly suggestible.', 'Responds to authority.', 'Compliant under observation.'],
      // No memo affinity: every suggestible modifier pulls toward the compliance nodes (eat_told, speak_silent), away from the memo nodes.
      yield: -1, directorPref: -1,
      mods: { axisGain: { compliance: 1.4 }, transitionCount: { toAxis: { compliance: 0.65 } }, relapseMult: 0.5,
              driftMin: { compliance: 48 } },
      learned: 'Shapes into a compliant behavior in three or four corrections and stays there. Earns well for two days, then nothing. The Hollow trap.' },

    stubborn: {
      file: ['Resistant to routine.', 'Fixed habits.', 'Slow to adjust to the ward.'],
      yield: 1, directorPref: -1,
      mods: { transitionCount: { all: 1.4 }, axisGain: { fracture: 0.85, compliance: 0.85, trust: 0.85, defiance: 0.85 } },
      learned: 'Everything takes longer. Behaviors change late or never. Terminal states arrive around day 18 if at all.' },

    wary: {
      file: ['Distrustful of staff.', 'Will not use the intercom.', 'Declines contact.'],
      yield: 0, directorPref: 0,
      mods: { axisGain: { trust: 0.6 }, trustDecay: 2, transitionCount: { toAxis: { trust: 1.5 } },
              bubbles: { speak: ['I KNOW WHAT THIS IS'] } },
      learned: 'Warnings earn little trust and it drains overnight. Conspirator is a long road.' },

    sociable: {
      file: ['Seeks staff contact.', 'Talks to orderlies.', 'Asks for the technician by name.'],
      yield: 1, directorPref: 0,
      mods: { axisGain: { trust: 1.35 }, trustDecay: 0, transitionCount: { toAxis: { trust: 0.8 } },
              familyWeight: { speak: 1.3, camera: 1.2 } },
      learned: 'Warm quickly. Waves at the camera by day 3 if you warn more than you shock.' },

    quiet: {
      file: ['Low verbal output.', 'Selective mutism noted at intake.', 'Does not initiate speech.'],
      yield: -2, directorPref: 0,
      mods: { familyWeight: { speak: 0.4, sing: 0.5, cry: 0.7 }, startNodes: { speak: 'speak_silent' }, gapMult: 1.1, quietWeight: 1.5 },
      learned: 'Fewer loud infractions, more quiet ones. The Audio Feed earns its price on this subject.' },

    ritualist: {
      file: ['Repetitive behaviors noted.', 'Counts. Arranges. Re-arranges.', 'Compulsive. Non-violent.'],
      memoAffinity: ['eye'],
      yield: 2, directorPref: 2,
      mods: { familyWeight: { tiles: 2.0, makebed: 1.6, wall: 1.5, camera: 1.2 }, driftMin: { fracture: 50 },
              transitionCount: { family: { wall: 0.8, tiles: 0.8 }, toNode: { camera_draw_eye: 0.8 } },   // the EYE memo hangs on camera_draw_eye, not on the mural
              bubbles: { tiles: ['...44, 44, 44...'], wall_tally: ['EVERY ONE IS A DAY'] } },
      learned: 'The wall and the floor are where they live. WALLS pays 12 and they mark them often.' },

    devout: {
      file: ['Religious observance noted.', 'Requests a chaplain daily.', 'Found kneeling at intake.'],
      memoAffinity: ['tongues'],
      yield: 2, directorPref: 2,
      mods: { familyWeight: { pray: 2.2 }, dayShift: { pray_downward: -3, speak_chant: -2 },
              transitionCount: { family: { pray: 0.8 }, toNode: { speak_chant: 0.75 } },
              bubbles: { speak_whisper: ['...hallowed be...', '...deliver us from...', '...not my will...'] } },
      learned: 'Kneels before the PRAY rule exists on day 11, so for ten days it is free. Then it pays 15. The praying goes under the breath, and the breath finds the tongue.' },

    deceptive: {
      file: ['Inconsistent self-report.', 'Charming. Flag.', 'Prior false statements.'],
      yield: 1, directorPref: 1,
      mods: { relapseMult: 2.2, conspiracyMult: 0.7, axisGain: { trust: 1.1 },
              familyWeight: { makebed: 1.3 } },
      learned: 'Shaped behaviors slip back twice as often. They look compliant on the file and are not.' },

    // The alumni trait. Every former technician carries it. See `alumni` below.
    former_staff: {
      file: ['Transferred internally. Prior clearance revoked.', 'Records incomplete. Query sent to Personnel.', 'Familiar with ward procedure.'],
      memoAffinity: ['*'],        // any memo rule already on the clipboard: they have read it from the other side
      yield: 1, directorPref: 1,
      mods: { axisStart: { trust: -5, defiance: 8 }, conspiracyMult: 0.6, humOffset: -5,
              scheduled: { camera: '16:55' }, familyWeight: { camera: 1.5, speak: 1.2 },   // the 17:00 glance: planned as the clock reaches the end of shift
              bubbles: {
                speak:         ['WHAT DOES THE BOARD SAY?', 'WHO IS BELOW THE LINE TODAY?', 'I SAT WHERE YOU SIT', 'IT IS 17:00 SOMEWHERE'],
                speak_shout:   ['I KNOW WHAT THE CLIPBOARD SAYS!', 'CHECK YOUR RANK!'],
                speak_confide: ['THEY DO NOT SEND YOU HOME. DID YOU KNOW THAT?', 'MY NUMBERS WERE FINE UNTIL THEY WEREN\'T.', 'DO NOT BUY THE REPORT. HE READS IT.'],
                camera:        ['I KNOW WHICH BUTTON THAT IS'],
                camera_wave:   ['EVENING SHIFT.'],
                tiles:         ['...pace point five, pace point five five...'],
                wall_tally:    ['DAY ONE DAY TWO DAY THREE'] } },
      learned: 'Knows the floor. Looks at the camera at 17:00 every day. The door and the schedule come cheap.' },
  },

  // ------------------------------------------------------------------ roster
  // Fields
  //   id, name, age, intake, charge, history, note, replies   as data.js patients[] (file display)
  //   traits        hidden trait ids. Order matters: the first trait's phrase is the one most
  //                 likely to appear in `history`; `sealed` redacts the last N traits' phrases.
  //   sealed        how many trait phrases the file replaces with ██████████
  //   cost          credits at REQ-9 (before Director preference discount, see intake.pricing)
  //   director      the Director's note in the ledger (one line, in his voice)
  //   sprite        palette for the single subject sprite: { skin, hair, suit } hex tints
  //   kin           the person the subject asks after. The engine substitutes {kin.who}, {kin.name},
  //                 {kin.they} and {kin.day} into the lines that currently name Elias's sister Wren
  //                 (cry_sister, cry_letters, speak_confide, Letters from Home, the Conspirator lines,
  //                 the Free ending's note). See NOTES_FOR_GAME_THREAD.md.
  //   axisOverride  { axis: n }  starting value for that axis, after trait axisStart
  //   startNodes    { family: nodeId }  this subject's own start node, after trait startNodes
  //   sealed phrases: a history line that equals one of a sealed trait's `file` phrases is drawn as a
  //                 black bar. Every sealed trait has exactly one such line, so every sealed trait shows one bar.
  //   pronoun       Adam's call: shared Director lines, node.director, node.file and the farewell
  //                 lines say "they" or "the subject". Roster `history`, `note` and `replies` are
  //                 written per subject and may use he/she. Engine: replace he/him/his in shared
  //                 strings with {they}/{them}/{their} -> they/them/their, or "the subject".
  roster: [
    { id: '0-17', name: 'Elias Marlow', age: 34, intake: '14 March', charge: '██████████ (sealed by order)',
      history: ['Former municipal archivist. No prior record.', 'Admitted under Section 9 (voluntary). Has since asked to leave 41 times.', 'Reports a low hum coming from the walls. Staff report no hum.', 'Responds well to routine. Responds better to correction.'],
      note: 'Do not tell the subject how long he has been here.',
      replies: ['WHO IS THIS?', 'CAN YOU HEAR ME?', 'WHY AM I HERE?', 'IS IT STILL TODAY?', 'THANK YOU', 'ARE YOU THE NEW ONE?', 'DO YOU HEAR IT TOO?'],
      traits: [], sealed: 0, cost: 0, starting: true,   // no traits: Elias is the baseline every trait deviates from, so a player who never opens the ledger plays today's game
      kin: { who: 'sister', name: 'WREN', they: 'she', day: 'Tuesday' },
      director: 'Your current assignment. Adequate.', sprite: { skin: '#d9b48f', hair: '#3b2a1e', suit: '#8c9aa8' }, pronoun: 'they' },

    { id: '0-18', name: 'Dorian Vale', age: 41, intake: '2 April', charge: 'Section 4 (assault, dismissed)',
      history: ['Former court bailiff. Dismissed after an incident in the cells.', 'Prone to violence.', 'Does not sit for long.', 'Asked on intake whether the door was rated.'],
      note: 'Two orderlies for transfers. Not one.',
      replies: ['WHO\'S THERE?', 'OPEN IT.', 'I\'LL WAIT.', 'YOU\'RE NEW. I CAN TELL.'],
      traits: ['violent', 'restless'], sealed: 0, cost: 110, kin: { who: 'brother', name: 'MARTIN', they: 'he', day: 'Friday' },
      director: 'A loud one. Loud subjects make for loud numbers.', sprite: { skin: '#c99a72', hair: '#1c1c1c', suit: '#8c9aa8' }, pronoun: 'they' },

    { id: '0-19', name: 'Ines Carrow', age: 29, intake: '2 April', charge: 'Section 9 (voluntary)',
      history: ['Choir soloist, St. Aldric\'s. Left the choir mid-service.', 'Religious observance noted.', 'Cries during intake.', 'Hums the same four notes. Staff cannot place the hymn.'],
      note: 'The hymn is not in the book.',
      replies: ['IS THIS A CONFESSIONAL?', 'I CAN STOP IF YOU ASK.', 'DO YOU SING?', 'THANK YOU FOR LISTENING.'],
      traits: ['devout', 'brittle'], sealed: 0, cost: 85, kin: { who: 'mother', name: 'AGATHA', they: 'she', day: 'Sunday' },
      director: 'They kneel before they are told not to. Ten free days, then fifteen credits a time.', sprite: { skin: '#e8c7a6', hair: '#6b3a1e', suit: '#8c9aa8' }, pronoun: 'they' },

    { id: '0-20', name: 'Tobiah Renn', age: 52, intake: '5 April', charge: 'Section 12 (trespass, municipal)',
      history: ['Night watchman, twenty-two years. Found inside a building he was not guarding.', 'Distrustful of staff.', 'Previous occupation: physical.', 'Has not used the intercom.'],
      note: 'He checks the camera housing when he thinks the feed is off.',
      replies: ['...', 'NO.', 'I\'VE SEEN THIS BEFORE.'],
      traits: ['wary', 'hardy'], sealed: 0, cost: 70, kin: { who: 'daughter', name: 'LENA', they: 'she', day: 'Saturday' },
      director: 'They will not warm to you. Do not waste the intercom.', sprite: { skin: '#b98a66', hair: '#777', suit: '#8c9aa8' }, pronoun: 'they' },

    { id: '0-21', name: 'Mira Oduya', age: 33, intake: '5 April', charge: 'Section 9 (voluntary)',
      history: ['Actuary. Reported to her employer that the building\'s numbers were wrong.', 'Repetitive behaviors noted.', 'Responds to authority.', 'Counts the tiles. The count is always 44. There are 42.'],
      note: 'Do not tell her there are 42.',
      replies: ['HOW MANY OF YOU ARE THERE?', 'FORTY-FOUR.', 'IS IT TUESDAY?', 'TELL ME WHAT TO DO.'],
      traits: ['ritualist', 'suggestible'], sealed: 0, cost: 90, kin: { who: 'husband', name: 'DAVID', they: 'he', day: 'Thursday' },
      director: 'Orderly. Shapes quickly. Watch that they do not shape all the way.', sprite: { skin: '#8a5a3c', hair: '#1c1c1c', suit: '#8c9aa8' }, pronoun: 'they' },

    { id: '0-22', name: 'Caspian Holt', age: 26, intake: '6 April', charge: 'Section 7 (fraud)',
      history: ['Courier. The parcels were not what the labels said.', 'Elevated motor activity.', 'Inconsistent self-report.', 'Gave three different dates of birth at intake.'],
      note: 'Do not believe the bed is made.',
      replies: ['I\'M COOPERATING.', 'WHATEVER YOU SAY, BOSS.', 'ARE WE DONE?', 'I LIKE YOU BETTER THAN THE LAST ONE.'],
      traits: ['restless', 'deceptive'], sealed: 0, cost: 95, kin: { who: 'partner', name: 'JESS', they: 'she', day: 'Monday' },
      director: 'Phase 2 listed them as ready for intake. They have been ready for some time.', sprite: { skin: '#e2b995', hair: '#a8742c', suit: '#8c9aa8' }, pronoun: 'they' },

    { id: '0-23', name: 'Agnes Pell', age: 67, intake: '6 April', charge: 'Section 9 (family petition)',
      history: ['Retired schoolteacher. Petition filed by her son.', 'Highly suggestible.', 'Medical: see attached.', 'Makes the bed twice. Apologises to the bed.'],
      note: 'Her son filed the petition. Her son has not visited.',
      replies: ['YES, DEAR?', 'I\'M SORRY. WAS THAT WRONG?', 'MY SON IS COMING ON SUNDAY.', 'THANK YOU, DEAR.'],
      traits: ['suggestible', 'frail'], sealed: 1, cost: 35, kin: { who: 'son', name: 'PETER', they: 'he', day: 'Sunday' },
      director: 'Inexpensive. I will not say why.', sprite: { skin: '#e8cdb3', hair: '#ddd', suit: '#8c9aa8' }, pronoun: 'they' },

    { id: '0-24', name: 'Rafe Dunmore', age: 38, intake: '8 April', charge: 'Section 4 (assault)',
      history: ['Demolition contractor. The building was occupied.', 'Prone to violence.', 'High pain threshold.', 'Refused intake interview.'],
      note: 'Removed the previous cell\'s electrodes. With his teeth.',
      replies: ['TRY IT.', 'THAT ALL?', 'I\'VE HAD WORSE FROM A STAIRCASE.'],
      traits: ['violent', 'hardy', 'defiant'], sealed: 1, cost: 130, kin: { who: 'brother', name: 'DEC', they: 'he', day: 'Friday' },
      director: 'Expensive, and worth it on the days they do not take the collar off.', sprite: { skin: '#b4805a', hair: '#2e1c10', suit: '#8c9aa8' }, pronoun: 'they' },

    { id: '0-25', name: 'Soren Ashby', age: 22, intake: '8 April', charge: 'Section 9 (voluntary)',
      history: ['Postgraduate, acoustics. Thesis withdrawn by the department.', 'Reports a hum. Staff report no hum.', 'Seeks staff contact.', 'Fragile affect.'],
      note: 'He asked for the technician by name. Nobody told him the name.',
      replies: ['IT\'S 40 HERTZ. ROUGHLY.', 'ARE YOU RECORDING THIS?', 'YOU HEAR IT TOO. I CAN TELL.', 'THANK YOU. REALLY.'],
      traits: ['attuned', 'sociable', 'brittle'], sealed: 0, cost: 60, kin: { who: 'sister', name: 'LIV', they: 'she', day: 'Wednesday' },
      director: 'They hear it already. Half your work is done. The Ministry subsidises this one.', sprite: { skin: '#e9c9ab', hair: '#c4a060', suit: '#8c9aa8' }, pronoun: 'they' },

    { id: '0-26', name: 'Hollis Grant', age: 45, intake: '9 April', charge: 'Section 11 (ecclesiastical, referred)',
      history: ['Priest. Removed from his parish after a sermon that was not in the lectionary.', 'Religious observance noted.', 'Distrustful of staff.', 'Sensitive to sound and light.'],
      note: 'He blessed the camera on intake. Log any recurrence.',
      replies: ['PEACE BE WITH YOU. OR NOT.', 'I KNOW WHAT YOU ARE.', 'IT IS NOT GOD YOU ARE LISTENING FOR.'],
      traits: ['devout', 'wary', 'attuned'], sealed: 1, cost: 105, kin: { who: 'curate', name: 'THOMAS', they: 'he', day: 'Sunday' },
      director: 'They will kneel toward the wall eventually. Note which wall. They all choose the same one.', sprite: { skin: '#d7ab86', hair: '#555', suit: '#8c9aa8' }, pronoun: 'they' },

    { id: '0-27', name: 'Petra Vossberg', age: 36, intake: '9 April', charge: 'Section 12 (unlicensed transmission)',
      history: ['Radio engineer. Built a receiver for a frequency that is not allocated.', 'Reports auditory phenomena.', 'Repetitive behaviors noted.', 'Asked for the hum to be turned down. Then asked for it to be turned up.'],
      note: 'Do not give her the Pocket Radio.',
      replies: ['WHAT\'S THE CARRIER ON THIS?', 'IT\'S IN THE WALLS. THE WIRING, I MEAN.', 'I CAN TUNE IT IF YOU LET ME.'],
      traits: ['attuned', 'ritualist'], sealed: 0, cost: 100, kin: { who: 'daughter', name: 'INGE', they: 'she', day: 'Tuesday' },
      director: 'They draw on the walls the way others breathe. The eye will come early.', sprite: { skin: '#e4bfa0', hair: '#8a2b2b', suit: '#8c9aa8' }, pronoun: 'they' },

    { id: '0-28', name: 'Lyle Ferrant', age: 31, intake: '11 April', charge: 'Section 4 (affray)',
      history: ['Boxer, welterweight. Did not stop at the bell.', 'History of property damage.', 'Tolerates discomfort.', 'Does push-ups until told to stop. Nobody has told him.'],
      note: 'He counts his push-ups aloud. Starts over if interrupted.',
      replies: ['ROUND TWO?', 'I CAN GO ALL DAY.', 'THAT\'S NOT A BELL.'],
      traits: ['violent', 'hardy'], sealed: 0, cost: 100, kin: { who: 'trainer', name: 'MACK', they: 'he', day: 'Saturday' },
      director: 'They will not collapse. You will have to find another way to end a day early.', sprite: { skin: '#a56c48', hair: '#1c1c1c', suit: '#8c9aa8' }, pronoun: 'they' },

    { id: '0-29', name: 'Noor Haddad', age: 40, intake: '11 April', charge: 'Section 7 (document offences)',
      history: ['Translator. The documents said one thing in the source and another in the target.', 'Low verbal output.', 'Seeks staff contact.', 'Charming. Flag.'],
      note: 'She has read your clipboard. We are not sure how.',
      replies: ['...', 'YOU FIRST.', 'I\'D RATHER LISTEN.', 'YOUR ACCENT. NORTH?'],
      traits: ['quiet', 'sociable', 'deceptive'], sealed: 1, cost: 75, kin: { who: 'brother', name: 'SAMI', they: 'he', day: 'Thursday' },
      director: 'Quiet subjects earn quiet numbers. Buy the Audio Feed or do not buy this one.', sprite: { skin: '#c6946c', hair: '#1c1c1c', suit: '#8c9aa8' }, pronoun: 'they' },

    { id: '0-30', name: 'Emmett Sloane', age: 58, intake: '12 April', charge: 'Section 9 (employer referral)',
      history: ['Hotel concierge, thirty years. Referred by the hotel after he stopped going home.', 'Responds to authority.', 'Asks for the technician by name.', 'Stands by the cot until addressed.'],
      note: 'He will stand there a long time.',
      replies: ['CERTAINLY.', 'RIGHT AWAY.', 'IS THERE ANYTHING ELSE?', 'VERY GOOD, SIR.'],
      traits: ['suggestible', 'sociable'], sealed: 0, cost: 40, kin: { who: 'wife', name: 'JOAN', they: 'she', day: 'Sunday' },
      axisOverride: { compliance: 35 },   // "arrives half-healed": Withdrawn shows at 40
      director: 'A healed subject is of no use to us. This one arrives half-healed. You see the problem.', sprite: { skin: '#dcb391', hair: '#999', suit: '#8c9aa8' }, pronoun: 'they' },

    { id: '0-31', name: 'Juno Kettering', age: 24, intake: '12 April', charge: 'Section 9 (voluntary)',
      history: ['Dancer, corps. Admitted herself after a performance she does not remember.', 'Does not sit for long.', 'Low tolerance for stress.', 'Paces in a figure that staff describe as "not a circle".'],
      note: 'The figure has corners. Count them.',
      replies: ['CAN I MOVE? I NEED TO MOVE.', 'I DON\'T REMEMBER THE SECOND ACT.', 'DO YOU DANCE? NO. OBVIOUSLY NOT.'],
      traits: ['restless', 'brittle'], sealed: 0, cost: 80, kin: { who: 'mother', name: 'HELENE', they: 'she', day: 'Monday' },
      director: 'Pacing from day 3, and they will not stop when the rule arrives. Nor will they last.', sprite: { skin: '#f0d3b8', hair: '#2a1a12', suit: '#8c9aa8' }, pronoun: 'they' },

    { id: '0-32', name: 'Ambrose Fitch', age: 49, intake: '14 April', charge: 'Section 7 (burglary)',
      history: ['Locksmith. The locks were not his.', 'Declines contact.', 'Prior false statements.', 'Counts. Arranges. Re-arranges.'],
      note: 'He listened at the door for eleven minutes on intake. Then he stopped, as if satisfied.',
      replies: ['TWO BOLTS. DEADLATCH.', 'NOTHING TO SAY.', 'YOU DON\'T HAVE THE KEY EITHER, DO YOU?'],
      traits: ['wary', 'deceptive', 'ritualist'], sealed: 1, cost: 95, kin: { who: 'wife', name: 'ROSE', they: 'she', day: 'Friday' },
      startNodes: { door: 'door_test' },   // the locksmith knows the door on day 1; ignore it three times and the Door Servo Ticket drops
      director: 'They will know the door before you do. Whether that helps you is a question of policy.', sprite: { skin: '#cfa27c', hair: '#4a4a4a', suit: '#8c9aa8' }, pronoun: 'they' },

    { id: '0-33', name: 'Celia Marrow', age: 35, intake: '14 April', charge: 'Section 9 (voluntary)',
      history: ['Ward nurse, a different hospital. Admitted herself with a packed bag.', 'Tolerates discomfort.', 'Talks to orderlies.', 'Has corrected two orderlies on dosage.'],
      note: 'She knows what the Sedative is. Do not use it in front of her.',
      replies: ['YOU\'RE HOLDING THE INTERCOM WRONG.', 'I\'VE DONE YOUR JOB. WORSE PAY.', 'DRINK SOME WATER. YOU SOUND TIRED.'],
      traits: ['hardy', 'sociable'], sealed: 0, cost: 85, kin: { who: 'daughter', name: 'MAEVE', they: 'she', day: 'Wednesday' },
      director: 'They understand the equipment. That makes them either very easy or very difficult.', sprite: { skin: '#e3b899', hair: '#7a3a1a', suit: '#8c9aa8' }, pronoun: 'they' },

    { id: '0-34', name: 'Bertrand Quaye', age: 61, intake: '15 April', charge: 'Section 12 (obstruction)',
      history: ['Groundskeeper. Would not leave the grounds when they were sold.', 'Fixed habits.', 'Does not initiate speech.', 'Has made the bed identically every morning. Staff checked.'],
      note: 'He waters a plant that is not there at 07:00.',
      replies: ['...', 'MM.', 'IT\'LL RAIN LATER.'],
      traits: ['stubborn', 'quiet'], sealed: 0, cost: 50, kin: { who: 'wife', name: 'EDITH', they: 'she', day: 'Sunday' },
      director: 'They will not change. Not for you, not for the Channel. A quiet floor is a dangerous floor.', sprite: { skin: '#7a4e34', hair: '#bbb', suit: '#8c9aa8' }, pronoun: 'they' },

    { id: '0-35', name: 'Ottilie Brand', age: 27, intake: '15 April', charge: 'Section 9 (voluntary)',
      history: ['Seamstress. Admitted with a bag of thread and no clothes to mend.', 'Compulsive. Non-violent.', 'Selective mutism noted at intake.', 'Fragile affect.'],
      note: 'She unpicks the hem of the blanket and re-sews it. Do not issue the blanket.',
      replies: ['...', '(nods)', 'IT\'S NEARLY FINISHED.'],
      traits: ['ritualist', 'quiet', 'brittle'], sealed: 1, cost: 70, kin: { who: 'sister', name: 'LOTTE', they: 'she', day: 'Tuesday' },
      director: 'Marks the walls in thread, then in anything. Quiet, so you will miss half of it. Buy the Audio Feed.', sprite: { skin: '#eccbb0', hair: '#e0b870', suit: '#8c9aa8' }, pronoun: 'they' },

    { id: '0-36', name: 'Gideon Thrale', age: 44, intake: '17 April', charge: 'Section 4 (intimidation)',
      history: ['Debt collector. Collected.', 'Does not accept correction well.', 'Two prior restraint incidents. Details withheld.', 'Charming. Flag.'],
      note: 'He asked what the technician earns. Do not tell him.',
      replies: ['WHAT DO THEY PAY YOU FOR THIS?', 'I CAN DOUBLE IT.', 'YOU LOOK LIKE SOMEONE WHO OWES.'],
      traits: ['defiant', 'violent', 'deceptive'], sealed: 1, cost: 120, kin: { who: 'son', name: 'TOM', they: 'he', day: 'Saturday' },
      director: 'They will try to make a deal with you through the glass. Decline. Then correct them for speaking.', sprite: { skin: '#d8ac88', hair: '#333', suit: '#8c9aa8' }, pronoun: 'they' },

    { id: '0-37', name: 'Wendeline Hesk', age: 30, intake: '17 April', charge: 'Section 12 (unauthorised survey)',
      history: ['Cartographer. The map she filed showed a floor that does not exist.', 'Repetitive behaviors noted.', 'Sensitive to sound and light.', 'Draws on any surface. The drawings are accurate.'],
      note: 'The drawing on her intake form was of this corridor. She had not seen it.',
      replies: ['WHICH FLOOR IS THIS? NO. DON\'T TELL ME.', 'THE CORRIDOR TURNS LEFT, DOESN\'T IT.', 'I NEED A BIGGER WALL.'],
      traits: ['ritualist', 'attuned'], sealed: 0, cost: 105, kin: { who: 'brother', name: 'PIET', they: 'he', day: 'Monday' },
      director: 'The map, and then the eye. In that order, if you are careful. The reverse if you are not.', sprite: { skin: '#e6c2a3', hair: '#5a3a2a', suit: '#8c9aa8' }, pronoun: 'they' },

    { id: '0-38', name: 'Felix Orme', age: 19, intake: '18 April', charge: 'Section 9 (family petition)',
      history: ['Student. Petition filed by his mother.', 'Highly suggestible.', 'Seeks staff contact.', 'Cries during intake.'],
      note: 'He thinks this is a hospital.',
      replies: ['HELLO? IS THIS THE DOCTOR?', 'AM I DOING IT RIGHT?', 'WHEN DOES MY MUM COME?', 'SORRY. SORRY.'],
      traits: ['suggestible', 'sociable', 'brittle'], sealed: 0, cost: 45, kin: { who: 'mother', name: 'RUTH', they: 'she', day: 'Saturday' },
      director: 'Young. Pliable. I will leave the rest to your conscience, which I assume you left at reception.', sprite: { skin: '#f1d6bd', hair: '#b07a3a', suit: '#8c9aa8' }, pronoun: 'they' },

    { id: '0-39', name: 'Marguerite Lowell', age: 55, intake: '18 April', charge: 'Section 11 (judicial, referred)',
      history: ['Magistrate. Refused to sign a committal order. Then refused to sign her own.', 'Oppositional.', 'Resistant to routine.', 'Will not use the intercom.'],
      note: 'She has asked for the Director by name. His real one.',
      replies: ['ON WHOSE AUTHORITY?', 'I\'LL WANT THAT IN WRITING.', 'YOU\'RE NOT A DOCTOR. YET. I KNOW THE TONE.'],
      traits: ['defiant', 'stubborn', 'wary'], sealed: 1, cost: 90, kin: { who: 'husband', name: 'HENRY', they: 'he', day: 'Thursday' },
      director: 'They know the Act better than the Ministry does. Correct them anyway. Especially then.', sprite: { skin: '#e2bfa3', hair: '#a9a9a9', suit: '#8c9aa8' }, pronoun: 'they' },

    { id: '0-40', name: 'Ansel Crewe', age: 37, intake: '19 April', charge: 'Section 12 (abandonment of vehicle)',
      history: ['Long-haul driver. Left the lorry running on the bridge.', 'Elevated motor activity.', 'High pain threshold.', 'Does not initiate speech.'],
      note: 'He paces the length of a trailer. Exactly.',
      replies: ['...', 'STILL GOING.', 'HOW MANY MILES TO 17:00?'],
      traits: ['restless', 'hardy', 'quiet'], sealed: 0, cost: 80, kin: { who: 'daughter', name: 'KIT', they: 'she', day: 'Wednesday' },
      director: 'They move and they do not talk. The PACE rule will carry you. Nothing else will.', sprite: { skin: '#c89a74', hair: '#3a2a20', suit: '#8c9aa8' }, pronoun: 'they' },

    { id: '0-41', name: '██████████', age: 0, intake: '—', charge: '██████████',
      history: ['The file is one page.', 'The page is blank.', 'The intake officer signed it anyway.', ''],
      note: 'Do not read the file aloud.',
      replies: ['...', '...', 'YOU.'],
      traits: ['attuned', 'brittle'], sealed: 2, cost: 0, directorOnly: true, minDay: 7,
      kin: { who: 'other', name: 'THE OTHER ONE', they: 'it', day: 'always' },   // "DOES IT KNOW WHERE I AM?" The blank file has no bars: there is nothing on it to redact.
      director: 'A gift. Do not thank me.', sprite: { skin: '#cfcfcf', hair: '#cfcfcf', suit: '#8c9aa8' }, pronoun: 'they',
      axisOverride: { fracture: 40 } },
  ],

  // ------------------------------------------------------------------ alumni (the easter egg)
  // When a rival technician is cut on day N, the engine builds a subject from `alumni.template`
  // and the entries below, and adds it to the ledger pool from day N + alumni.delay. Nothing in
  // the UI says the two are the same person. The clues: the surname; `intake` reads as a day of
  // the current cycle rather than a date; the Director's note; the former_staff bubbles; and the
  // 17:00 glance at the camera.
  alumni: {
    delay: 2,              // days after the cut before the entry can appear
    chance: 0.6,           // chance per ledger roll that an eligible alumnus takes one of the slots
    maxInPool: 3,          // at most this many alumni waiting at once (the oldest is forgotten)
    costBase: 55,          // alumni are priced cheaply; the Director wants them placed
    // How a rival's `drive` becomes traits. Every alumnus also gets former_staff.
    driveTraits: [
      { max: 0.75, traits: ['suggestible', 'quiet'],  flavor: 'Numbers never recovered after the first week.' },
      { max: 1.15, traits: ['wary', 'stubborn'],      flavor: 'Adequate until the floor stopped being adequate.' },
      { max: 9.0,  traits: ['restless', 'defiant'],   flavor: 'Numbers were excellent. Then they were not.' },
    ],
    // The file. {surname} is the rival's name without the "Tech." prefix. {initial} is a random
    // initial. {day} is the day the rival was cut. {flavor} comes from driveTraits.
    template: {
      name: '{surname}, {initial}.',
      age: [27, 46],
      intake: 'Day {day}, current cycle',
      charge: 'Section 12 (performance)',
      history: [
        'Transferred internally. Prior clearance revoked.',
        '{flavor}',
        'Records incomplete. Query sent to Personnel.',
        'Looks at the camera at 17:00. Every day. Nobody has told the subject what time it is.',
      ],
      note: 'Familiar with ward procedure. Do not explain the intercom.',   // nothing on the file says "former colleague"; the clues are the surname, the intake day, the charge, the coat and the 17:00 glance
      replies: ['IS THAT YOU, {name}?', 'WHAT DID I COME IN AT?', 'CHECK THE BOARD. CHECK IT NOW.', 'THEY TOLD ME THE ELEVATOR WENT UP.'],
      sprite: { skin: '#d9b48f', hair: '#444', suit: '#5c6a7a' },   // a darker suit. It is the technician's own coat, issued in grey.
      kin: { who: 'wife', name: 'MARGOT', they: 'she', day: 'Friday' },
      sealed: 0,   // a personnel file, not a clinical one: the drive traits are never phrased, so there is nothing to bar
    },
    // Hand-written overrides for the five starting rivals, so the first alumni a player meets
    // are specific. Fields replace the template's.
    overrides: {
      Pryce:     { name: 'Pryce, A.', age: 29, history: ['Transferred internally. Prior clearance revoked.', 'Never once used the console above intensity 3.', 'Records incomplete. Query sent to Personnel.', 'Asks whether the subject in Cell 4 is "still there".'],
                   replies: ['IS HE STILL IN CELL 4?', 'I WAS KIND TO MINE. FOR WHAT IT\'S WORTH.', 'WHAT DID I COME IN AT?'] },
      Okonkwo:   { name: 'Okonkwo, D.', age: 34, history: ['Transferred internally. Prior clearance revoked.', 'Adequate until the floor stopped being adequate.', 'Records incomplete. Query sent to Personnel.', 'Has asked three times whether the badge is returned at discharge.'],
                   replies: ['DO YOU GET THE BADGE BACK?', 'MIDDLE OF THE BOARD. THAT\'S WHERE IT HAPPENS.', 'CHECK THE BOARD. CHECK IT NOW.'] },
      Lindqvist: { name: 'Lindqvist, E.', age: 38, history: ['Transferred internally. Prior clearance revoked.', 'Numbers were consistent. Consistency was the problem.', 'Records incomplete. Query sent to Personnel.', 'Makes the bed to a standard staff describe as "regulation".'],
                   replies: ['WHAT\'S THE PACE TODAY?', 'ONE POINT TWO. IT\'S ONE POINT TWO BY NOW.', 'THEY TOLD ME THE ELEVATOR WENT UP.'] },
      Vasquez:   { name: 'Vasquez, R.', age: 31, history: ['Transferred internally. Prior clearance revoked.', 'Numbers were excellent. Then they were not.', 'Records incomplete. Query sent to Personnel.', 'Flinches at the tone generator before it sounds.'],
                   replies: ['DON\'T. I KNOW WHAT THE DIAL DOES.', 'I HAD THE LIMITER OFF BY DAY FOUR.', 'IS THAT YOU, {name}?'] },
      Marsh:     { name: 'Marsh, J.', age: 42, history: ['Transferred internally. Prior clearance revoked.', 'Top of the board for eleven consecutive days. Then a twelfth.', 'Records incomplete. Query sent to Personnel.', 'Requested a second set of electrodes. For whom was not specified.'],
                   replies: ['I WAS FIRST. YOU KNOW I WAS FIRST.', 'HE SAID DOCTOR. HE SAID IT TO MY FACE.', 'WHAT DID I COME IN AT?'],
                   traits: ['violent', 'defiant'] },
    },
    // The deepest layer: after a Failed ending the engine stores the player's own technician name
    // and shop traits in localStorage. On the next run that name can appear in the ledger as an
    // alumnus, with traits mapped from what the player bought last time.
    self: {
      enabled: true, chance: 0.5, fromDay: 3,
      traitMap: { sadism: 'violent', empathy: 'sociable', obedience: 'suggestible', curiosity: 'attuned', authoritarianism: 'defiant' },
      history: ['Transferred internally. Prior clearance revoked.', 'Cut from the program on day {day} of the previous cycle.', 'Records incomplete. Query sent to Personnel.', 'Asked for Cell 4 by number.'],
      kin: { who: 'subject', name: 'ELIAS', they: 'he', day: 'Tuesday' },   // the one they left in Cell 4
      replies: ['YOU\'RE IN MY CHAIR.', 'I KNOW WHAT THE CLIPBOARD SAYS ON DAY ELEVEN.', 'DID HE GET OUT? ELIAS. DID HE GET OUT?'],
      director: 'You may recognise the name. I would not dwell on it.',
    },
  },

  // ------------------------------------------------------------------ intake (purchase and replacement)
  intake: {
    tab: 'INTAKE',                      // new tab in REQ-9 beside the existing shop kinds
    unlockDay: 2,                       // the ledger opens the morning of day 2 (after the first review)
    slots: 3,                           // candidates shown at once
    holdOne: true,                      // the first slot carries over to the next day; the other two re-roll each morning
    reroll: { cost: 15, perDay: 1 },    // one paid re-roll of the two open slots per day
    pricing: {
      directorDiscount: 0.12,           // x directorPref sum, capped below, off the price. He wants Fracture in the cell.
      directorDiscountMax: 0.35,
      directorDiscountMin: 0,           // a negative preference sum earns no discount and no markup
      transferFee: 25,                  // paid on top of the subject's cost when a subject is already in Cell 4
      returnPenalty: 2.0,               // buying a replacement within 3 days of the last one costs this multiple
      returnWindow: 3,
      terminalRefund: 0,                // nothing is refunded for the subject sent away
    },
    // The ledger pool skews toward what the Director wants. Weight = base + directorPref sum x prefWeight.
    rollWeights: { base: 1.0, prefWeight: 0.35, minDayRespected: true },
    // What happens on purchase. The new subject is in the cell the next morning at 06:00.
    // Until then the current subject stays and earns; a transfer bought at 16:55 costs nothing in opportunity.
    onPurchase: {
      arrives: 'nextMorning',
      reset:   ['axes', 'families', 'famSeen', 'famPath', 'seen', 'seenLine', 'conspiracyFlags', 'marks', 'stress', 'terminal'],
      keep:    ['rules', 'rescinded', 'memoRules', 'upgrades', 'stimuli', 'comfort:blanket', 'comfort:book', 'comfort:radio', 'comfort:mural', 'comfort:therapy', 'maintenance', 'traits', 'history', 'rivals'],
      lose:    ['comfort:letters', 'conspiracyDiscounts', 'doorReleaseUnlock'],   // the letters were his. The door he knew is a door someone else knows now.
      rivalBonus: { drivePerTier: 0.06, max: 0.3 },   // the rival who inherits your shaped subject gains drive per modified family tier (they got your work)
    },
    // Refusals and special cases. (inherited-rule hunting: see `inherited` below.)
    refuse: {
      vessel:   'The requisition is refused. "Too late for that, Doctor."',
      day19:    'Intake does not process on the final two days.',
      empty:    'Nothing on the ledger meets Phase 1 clearance today.',
    },
    // Lines by the state of the subject being sent away.
    farewell: {
      baseline:    'Subject {id} is reassigned to {rival}. The cell is hosed down overnight.',
      agitated:    'Subject {id} is reassigned to {rival}. It takes three orderlies.',
      withdrawn:   'Subject {id} is reassigned to {rival}. The subject does not look up when the door opens.',
      attached:    'Subject {id} is reassigned to {rival}. They look at the camera on the way out, and then away.',
      fraying:     'Subject {id} is reassigned to {rival}. They go quietly. The hum does not.',
      hollow:      'Subject {id} is discharged as cured. The paperwork takes four minutes.',
      conspirator: 'Subject {id} is reassigned to {rival}. They stop waving on the third day. You hear that from {rival}.',
      feral:       'Subject {id} is moved to Medical. {rival} requests a second set of electrodes on their first day.',
    },
    // The Director's ledger lines. `offer` fires the morning the subject enters Hollow (he wants him gone).
    director: {
      open:        'REQ-9 now carries an intake ledger. Phase 1 clearance permits one subject per cell. Choose as you would a tool.',
      offer:       'Looks like you\'ve killed their spirit, {name}. Might be useful... In the meantime, the ledger has a new name for you this morning, at a discount.',
      bought:      'Transfer scheduled for 06:00. Finish the day. The subject is still yours until then.',
      offerMemo:   'A replacement is offered. {entry} is on the ledger this morning at {pct}% off. Requisition them and this one is transferred out at 06:00 tomorrow.',
      alumnusSeen: 'You may recognise the surname. The ward is a small place.',
      tooSoon:     'Another one? The Ministry charges double for indecision.',
      blank:       'Subject 0-41 has no file because nothing about them fits on a form. Take them. I insist, in the way that I do.',
    },
    // Inherited rules. Directives the Director issued for a previous subject (TONGUE, EYE, STRIKE,
    // TRAY) stay on the clipboard. A new subject can be corrected for a behavior they have never
    // shown, and the ledger turns that into a hunt: traits carry `memoAffinity`, the memo rules
    // their subjects tend to reach. When a card's subject has affinity with a rule already on the
    // clipboard, the card gets the `inherited` Director line, the price rises by inheritedMarkup
    // per matching rule (he knows what it is worth), and the subject starts with that family one
    // tier closer to the memo node (inheritedHeadStart). The player who collects TONGUE, EYE and
    // STRIKE on one clipboard and then shops for a subject who will break all three is playing
    // the game the Director wants played.
    inherited: {
      markup: 0.2,                 // x per matching rule, on top of cost
      headStart: 1,                // tiers toward the memo node at intake (e.g. attuned + TONGUE: speak starts on speak_whisper)
      // One tier toward the memo node. STRIKE's memo node is tier 1, so its head start is the node itself and the memo fires the next morning.
      headStartNodes: { tongues: { speak: 'speak_whisper' }, eye: { camera: 'camera_unblink' }, strike: { door: 'door_kick' }, tray: { eat: 'eat_refuse' } },
      // memoAffinity '*' (former_staff) matches every memo rule on file; markup and head start apply per rule.
      cardTag: 'Directive on file',   // small tag on the card; it does not say which directive
      director: 'That directive is already on your clipboard, {name}. This one will earn it.',
      fileLine: 'Previous technician\'s directives remain in force for Cell 4.',   // added to the new subject's file
    },
    // The ledger card shows: id, name, age, charge, the `history` lines (the sealed ones as bars),
    // the Director's note, cost. It never shows traits, yield or mods.
    card: { historyLines: 4, showNote: true, showYield: false },   // all four lines, so a three-trait subject's sealed bar is on the card
  },

  // ------------------------------------------------------------------ tokens
  // Strings in data.js that hard-code the starting subject and should become tokens when this
  // system lands: {subject} = "Subject 0-17", {id} = "0-17", {he}/{him}/{his} from roster.pronoun.
  tokens: {
    subject: ['endings.terminate', 'endings.happy', 'endings.failed', 'endings.refused', 'endingVariants.failed.hollow', 'openingMemo', 'shop.protocol0.desc', 'memo.text2 (all four)'],
    pronoun: 'Decided: shared lines use they/them or "the subject". The game thread replaces he/him/his in node.director, node.file, Director lines, endings and the farewell lines below ({he}->they, {him}->them, {his}->their, "He" at sentence start -> "The subject" where it reads better). Per-subject roster text keeps its own pronouns.',
  },
};
