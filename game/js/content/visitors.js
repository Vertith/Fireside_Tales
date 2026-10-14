/*
 * Visitors at the desk. Each one has:
 *   truth      'legit' | 'intruder' | 'android'  (drives default outcomes)
 *   greeting   steps run when the desk opens (optional)
 *   opening    { name, want, how }: answers to the three questions everyone gets
 *              ("What's your name?", "What can I do for you?", "How did you get here?")
 *   questions  [{ id, ask, steps, requires }]  extras, each unlocked by
 *              requires: 'saw:<zoom>'  after inspecting that spot (or remembered from a past loop)
 *                        'saw:desk.list'  after reading the visitor list
 *                        '<flag>'  knowledge learned in an earlier loop
 *   actions    { letThrough, turnAway, shoot, shutdown } each { label?, steps }
 *              set an action to false to hide it; leave it out to use the
 *              default from the bible's action rules (engine.defaultOutcome).
 */
(function () {
  var V = (window.EMIT.content.visitors = window.EMIT.content.visitors || {});

  // How roughed-up "Kane" looks this run: 0 clean, 1 after the sister is sent up,
  // 2 after the mother is too. Never explained; the guard only sees the marks.
  function kaneMarks() {
    var f = (window.EMIT.game && window.EMIT.game.run && window.EMIT.game.run.flags) || {};
    return f.sentMother ? 2 : f.sentSister ? 1 : 0;
  }
  window.EMIT.kaneMarks = kaneMarks;

  /* ---------------- The scientist (first flash) ---------------- */
  V.scientist = {
    id: 'scientist',
    truth: 'legit', // as far as the guard knows
    prompt: 'He is already halfway to the stairs. Look him over, ask him something, or let him go.',
    // click spots in the booth window; coordinates are in the art's visitor frame
    inspect: [
      { title: 'Staff badge', zoom: 'badge', x: 258, y: 112, w: 18, h: 14,
        text: 'KANE, A. Fourth floor. The photo is a few years old. Aren\'t they all.',
        note: 'Staff badge says KANE, A., fourth floor. The photo looks a few years younger than him.' },
      { title: 'Crumpled notes', zoom: 'notes', x: 192, y: 196, w: 24, h: 24,
        text: 'Equations, a coffee ring, and one line at the bottom underlined three times. I can\'t read any of it.',
        note: 'He\'s clutching crumpled notes. Equations, and one line underlined three times.' },
      { title: 'Key ring', zoom: 'keys', x: 250, y: 186, w: 14, h: 22,
        text: 'A brass tag stamped 4, a car key, a filing cabinet key. Lab keys. The tag is shiny, like nobody\'s carried it long.',
        note: 'Fourth-floor lab keys on his belt. The brass tag looks brand new.' },
      { title: 'Wrist', zoom: 'watch', x: 284, y: 194, w: 20, h: 10,
        text: 'Cheap digital. The date reads \'40. Battery\'s dying, probably.',
        note: 'Cheap black digital watch. The date read 12.03.40. Dying battery, I figured.', learn: 'sawWatch' },
      // the coat is clean when he first runs in; it picks up marks each time
      // someone who knows the real Kane is sent upstairs (sister, then mother)
      { title: 'Coat hem', zoom: 'coat', x: 260, y: 220, w: 34, h: 24, when: function () { return kaneMarks() >= 1; },
        text: function () {
          return kaneMarks() >= 2
            ? 'More scorch marks at the hem than last time, and a scuff like he\'d been on his knees. Lab work, I guess.'
            : 'Scorch marks at the hem. Weren\'t there earlier. Looks like a lab incident.';
        },
        note: function () {
          return kaneMarks() >= 2
            ? 'More scorch marks on his hem now, and a scuff at the knee. Busy night in the lab.'
            : 'Fresh scorch marks on his coat hem. Weren\'t there when he first came down.';
        }, learn: 'sawHem' },
      { title: 'Sleeve', zoom: 'kaneSleeve', x: 288, y: 170, w: 18, h: 18, when: function () { return kaneMarks() >= 2; },
        text: 'Something pink and creamy smeared on his cuff. Looks like he got some cake on his sleeve.',
        note: 'Cake frosting on his sleeve, of all things.' }
    ],
    // the three openers everyone gets (Adam's rule); everything else is unlocked below
    opening: {
      name: [
        { who: 'scientist', say: 'Kane. Dr. Aldous Kane. Fourth floor, the lab at the end of the hall.' },
        { note: ['scientist', 'Dr. Aldous Kane, fourth floor.'] }
      ],
      want: [
        { who: 'scientist', say: 'Just stay vigilant tonight, this night is critical to all my plans.' },
        { note: ['scientist', 'Asked what I could do for him. "Just stay vigilant tonight, this night is critical to all my plans."'] }
      ],
      how: [
        { who: 'scientist', say: 'I work here.' },
        { who: 'scientist', say: 'I\'ve been here for years. You must be new.' },
        { narrate: 'Six years on this desk. I didn\'t place the face. Then again, the fourth floor keeps to itself.' },
        { note: ['scientist', 'Says he works here and has for years. I didn\'t recognise him.'] }
      ]
    },
    // extras unlock by inspecting a spot ('saw:<zoom>') or from memory of an earlier loop
    questions: [
      { id: 'badge', ask: 'That photo doesn\'t look much like you.', requires: 'saw:badge', steps: [
        { who: 'scientist', say: 'Long nights age a man. You\'ll find out.' },
        { note: ['scientist', 'Asked about his badge photo. "Long nights age a man."'] }
      ] },
      { id: 'notes', ask: 'What\'s on the notes?', requires: 'saw:notes', steps: [
        { who: 'scientist', say: 'The future.' },
        { narrate: 'He folded them smaller and put them where I couldn\'t see.' },
        { note: ['scientist', 'Wouldn\'t let me see his notes. Called them "the future".'] }
      ] },
      { id: 'keys', ask: 'New keys?', requires: 'saw:keys', steps: [
        { who: 'scientist', say: 'Locks got changed. Everyone upstairs is paranoid this week.' },
        { narrate: 'You would have thought they would let me know, I\'m always the last to know.' },
        { note: ['scientist', 'Says the fourth-floor locks were changed. Nobody told me, as usual.'] }
      ] },
      { id: 'watch', ask: 'Your watch has the wrong date.', requires: 'saw:watch', steps: [
        { who: 'scientist', say: 'Has it? Cheap thing. It\'s been wrong all week.' },
        { narrate: 'He shrugged like time was a regular annoyance for him.' },
        { note: ['scientist', 'Pointed out his watch was wrong. He shrugged it off like time was a nuisance.'] }
      ] },
      { id: 'coat', ask: 'What happened to your coat?', requires: ['run:saw:scientist.coat'], steps: [
        { who: 'scientist', say: 'Lab accident. Comes with the job.' },
        { note: ['scientist', 'Scorch marks on his coat. "Lab accident."'] }
      ] },
      { id: 'cake', ask: 'Is that cake on your sleeve?', requires: ['run:saw:scientist.kaneSleeve'], steps: [
        { who: 'scientist', say: 'I bumped into a woman with a cake, but that\'s not important.' },
        { narrate: 'A woman. If I\'d ever called my mother "a woman" to her face, I\'d have been smacked into next week.' },
        { note: ['scientist', 'Cake on his sleeve. Says he "bumped into a woman with a cake".'] }
      ] },
      { id: 'morse', ask: 'There\'s Morse code on the shortwave. Know anything about it?', requires: 'morseDecoded', steps: [
        { who: 'scientist', say: 'Morse code.' },
        { who: 'scientist', say: 'Whatever it is, it isn\'t as important as the guests tonight.' },
        { narrate: 'He said it like a man brushing lint off a coat. He didn\'t ask what it said.' },
        { note: ['scientist', 'Asked him about the Morse on the shortwave. Brushed it off: not as important as tonight\'s guests. Never asked what it said.'] }
      ] },
      { id: 'guess', ask: 'Let me guess. Someone\'s going to come to stop you.', requires: 'heardBriefing', steps: [
        { who: 'scientist', say: '...' },
        { who: 'scientist', say: 'How would you...' },
        { who: 'scientist', say: 'Lucky guess. Keep guessing like that and you\'ll do fine tonight.' },
        { narrate: 'For half a second he looked at me like I\'d read his mail.' },
        { note: ['scientist', 'Told him others would come before he said it himself. He looked rattled for a second, then smoothed it over.'] },
        { learn: 'kaneFlinched' }
      ] }
    ],
    actions: {
      letThrough: { label: 'Let him go back up', stamp: 'Let him go', steps: [
        { crt: ['CAM 03 LAB HALL', '> MOTION: 1', '> DOOR B: OPEN'] },
        { who: 'scientist', say: 'Hold the desk. Nobody goes up. Not until I say so.' },
        { exit: 'walk' },
        { narrate: 'He took the stairs two at a time. In six years I\'d never seen a lab coat run.' }
      ] },
      turnAway: false,
      shutdown: false,
      shoot: { steps: [
        { sfx: 'gunshot' },
        { exit: 'fall' },
        { narrate: 'I don\'t know why I did it. Neither did anyone else.' },
        { narrate: 'The police came at two. Nobody believes a night guard who shoots a scientist for being excited.' },
        { narrate: 'From the back of the squad car I saw a light over the building, bright as noon.' },
        { note: ['scientist', 'I shot him the moment he came in. Without proof, nobody believed me.'] },
        { learn: 'shotKane' },
        { reset: 'You shot the scientist with nothing to show for it.' }
      ] }
    }
  };

  /* ---------------- The man in plates (second flash, tutorial intruder) ---------------- */
  V.assassin = {
    id: 'assassin',
    truth: 'intruder',
    machine: true, // a robot: shooting him leaves coolant and sparking parts, not blood
    prompt: 'He waits. He does not blink, if he can.',
    inspect: [
      { title: 'Visor', zoom: 'visor', x: 226, y: 62, w: 46, h: 16,
        text: 'Light where eyes should be. It hums when it looks at you.',
        note: 'No eyes, just a visor that glows. It hums.' },
      { title: 'Chest', zoom: 'core', x: 238, y: 118, w: 22, h: 22,
        text: 'A light in his chest, a colour nothing in this building comes in.',
        note: 'Something glowing in his chest. That blue isn\'t a colour anything here comes in.' },
      { title: 'Hip', zoom: 'holster', x: 266, y: 186, w: 22, h: 26,
        text: 'A holster, and in it something with no barrel and no trigger. It\'s warm from here.',
        note: 'Holster on his hip. Whatever\'s in it isn\'t a gun, and it\'s warm.' },
      { title: 'Hands', zoom: 'gloves', x: 194, y: 196, w: 20, h: 18,
        text: 'Plated gloves, every finger segmented. He hasn\'t touched anything since he came in.',
        note: 'Segmented armoured gloves. He hasn\'t touched a thing.' }
    ],
    opening: {
      name: [
        { who: 'assassin', say: 'Irrelevant.' },
        { note: ['assassin', 'Wouldn\'t give a name. "Irrelevant."'] }
      ],
      want: [
        { who: 'assassin', say: 'Directions. The science laboratory. I have an order.' },
        { note: ['assassin', 'No appointment. Wants the lab. "I have an order."'] }
      ],
      how: [
        { who: 'assassin', say: 'That is not a question you would understand the answer to.' },
        { note: ['assassin', 'Wouldn\'t say how he got here. Said I wouldn\'t understand.'] }
      ]
    },
    questions: [
      { id: 'visor', ask: 'What are you looking at?', requires: 'saw:visor', steps: [
        { who: 'assassin', say: 'The building. What is being built up there must not be finished. The one building it must not continue.' },
        { note: ['assassin', 'Wants whatever is being built upstairs stopped. Said "the one building it", singular.'] }
      ] },
      { id: 'core', ask: 'What\'s that light in your chest?', requires: 'saw:core', steps: [
        { who: 'assassin', say: 'Retrieval. Enforcement Division, year twenty-two—' },
        { who: 'assassin', say: 'Irrelevant. Directions.' },
        { note: ['assassin', 'Calls himself Retrieval, Enforcement Division. Started to give a year beginning with twenty-two, then stopped.'] },
        { learn: 'assassinYear' }
      ] },
      { id: 'holster', ask: 'What\'s in the holster?', requires: 'saw:holster', steps: [
        { who: 'assassin', say: 'An instrument. It is not for you, if you cooperate.' },
        { note: ['assassin', 'The thing in his holster "is not for me, if I cooperate."'] }
      ] },
      { id: 'signin', ask: 'Take a glove off and sign in, please.', requires: 'saw:gloves', steps: [
        { narrate: 'I slid the sign-in sheet across. He looked at the ballpoint pen the way you\'d look at a flint axe.' },
        { who: 'assassin', say: 'Your record-keeping is noted.' },
        { note: ['assassin', 'Didn\'t know what to do with a ballpoint pen.'] }
      ] },
      { id: 'kane', ask: 'You\'re here for Dr. Kane.', requires: 'heardBriefing', steps: [
        { who: 'assassin', say: 'Kane.' },
        { pause: 500 },
        { who: 'assassin', say: 'Is that what he calls himself here?' },
        { who: 'assassin', say: 'You do not know who you work for, guard.' },
        { note: ['assassin', 'Knew who I meant by Kane, but not by that name. "You do not know who you work for."'] },
        { learn: 'assassinWhisper' }
      ] }
    ],
    actions: {
      letThrough: { label: 'Point him to the stairs', steps: [
        { narrate: 'I pointed at the stairwell door. God help me, I pointed.' },
        { exit: 'walk' },
        { pause: 900 },
        { sfx: 'distant' },
        { narrate: 'It wasn\'t gunfire, exactly. It was quieter than gunfire, and worse.' },
        { narrate: 'Then the light came, and this time it came for everything.' },
        { note: ['assassin', 'I let him up. Whatever he did up there, the night started over.'] },
        { reset: 'You let an intruder through.' }
      ] },
      turnAway: { label: 'Turn him away', steps: [
        { narrate: 'I told him visiting hours were over. It was the best line I had.' },
        { who: 'assassin', say: 'Noted.' },
        { exit: 'walk' },
        { narrate: 'He walked past the desk like it was weather. I heard him on the stairs, then nothing, then I saw the light.' },
        { note: ['assassin', 'Turning him away doesn\'t work. He just walks past.'] },
        { reset: 'Some visitors don\'t take no for an answer.' }
      ] },
      shoot: { steps: [
        { sfx: 'gunshot' },
        { pause: 250 },
        { sfx: 'gunshot' },
        { exit: 'fall' },
        { narrate: 'Two shots. Until tonight I\'d never fired that revolver at anything but a coffee can.' },
        { backdrop: 'body' },
        { narrate: 'He went down like a dropped toolbox, all corners. The blue in the seams flickered and went out.' },
        { narrate: 'What ran out of him wasn\'t blood. Blue-green, oily, full of little parts that kept on sparking.' },
        { note: ['assassin', 'Shot him. Two rounds. The glow in his seams went out.'] },
        { learn: 'shotAssassin' }
      ] }
    }
  };
})();

/*
 * Tonight's expected visitors, the clipboard Kane leaves on the desk.
 * This is the reference document players check visitors against.
 */
window.EMIT.content.visitorList = [
  { name: 'R. Halloway', org: 'U.S. Dept. of Energy', seeing: 'Dr. Kane' },
  { name: 'Dr. S. Okafor', org: 'MIT, visiting researcher', seeing: 'Dr. Kane' },
  { name: 'M. Thorne', org: 'Science Corp board (investor)', seeing: 'Dr. Kane' },
  { name: 'Lt. Col. D. Brandt', org: 'Defense liaison', seeing: 'Dr. Kane' },
  { name: 'J. Whitcombe', org: 'Whitcombe & Lyle, patent counsel', seeing: 'Dr. Kane' },
  { name: 'A. Reyes', org: 'Office of Sen. Marsh', seeing: 'Dr. Kane' }
];
