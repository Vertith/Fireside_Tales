/*
 * Four of the night's visitors (night.js puts them in order).
 *   gent     1920s gentleman      intruder  (shoot, or turn away)
 *   pizza    delivery driver      legit     (let through)
 *   android  "inspector"          android   (shutdown device)
 *   reporter Channel 7 reporter   legit     (let through, she's on the list)
 */
(function () {
  var C = window.EMIT.content.characters;
  var V = window.EMIT.content.visitors;
  var S = window.EMIT.content.scenes;

  C.gent = { name: 'Mr. H. Wallace', notebookName: 'Mr. H. Wallace (three-piece suit)', portrait: 'gent' };
  C.pizza = { name: 'Danny, Sal\'s Pizza', notebookName: 'Pizza delivery driver', portrait: 'pizza' };
  C.android = { name: 'Insp. R. Hale', notebookName: 'Inspector R. Hale, Municipal Facilities', portrait: 'android' };
  C.reporter = { name: 'Carol Vance, Channel 7', notebookName: 'Carol Vance, Channel 7 News', portrait: 'reporter' };

  // after any shooting, the mess gets dealt with before the next visitor
  function cleanup(line) {
    return [
      { pause: 500 },
      { narrate: line },
      { backdrop: 'clean' }
    ];
  }

  /* ---------------- 1920s gentleman (intruder) ---------------- */
  V.gent = {
    id: 'gent',
    truth: 'intruder',
    prompt: 'He smells of cedar and somebody else\'s century.',
    greeting: [
      { who: 'gent', say: 'Good evening, old sport. I\'ve an appointment upstairs with Dr. Kane.' },
      { who: 'gent', say: 'Might I trouble you for your telephone apparatus? I ought to ring ahead.' },
      { learn: 'metGent' }
    ],
    inspect: [
      { title: 'Hat', zoom: 'hat', x: 228, y: 26, w: 44, h: 24,
        text: 'A fedora, bone dry. It has been pouring since nine.',
        note: 'His fedora is completely dry. It\'s pouring outside.' },
      { title: 'Collar', zoom: 'collar', x: 236, y: 98, w: 26, h: 14,
        text: 'A stiff wing collar, buttoned on with a brass stud. My grandfather had a box of those.',
        note: 'Detachable wing collar with a brass stud. Grandfather stuff.' },
      { title: 'Watch chain', zoom: 'pocketwatch', x: 232, y: 174, w: 22, h: 16,
        text: 'A gold pocket watch, wound tight, engraved "1923". Nobody carries one of these anymore.',
        note: 'Gold pocket watch on a chain, engraved 1923.' },
      { title: 'Cane', zoom: 'cane', x: 196, y: 194, w: 14, h: 50,
        text: 'Silver-topped, initials H.W. The silver\'s been polished, not worn smooth by years of hands.',
        note: 'Silver-topped cane, initials H.W. Polished like new.' },
      { title: 'Coin', zoom: 'coin', x: 288, y: 204, w: 16, h: 14,
        text: 'A silver dollar, dated 1922, shiny as the day it was struck. He\'s turning it over like a tip.',
        note: 'He\'s holding a 1922 silver dollar in mint condition.' }
    ],
    opening: {
      name: [
        { who: 'gent', say: 'Wallace. H. Wallace, Esquire.' },
        { narrate: 'He slid a calling card across the counter. Yellowed, embossed: H. WALLACE, ESQ. No photo, no address, no phone number.' },
        { note: ['gent', 'Calls himself H. Wallace. No ID, just a yellowed calling card with no phone number.'] }
      ],
      want: [
        { who: 'gent', say: 'An appointment upstairs with Dr. Kane. The doctor arranged it himself. By wire, last Tuesday.' },
        { narrate: 'By wire.' },
        { note: ['gent', 'Says Kane arranged his appointment "by wire".'] }
      ],
      how: [
        { who: 'gent', say: 'The trolley, naturally.' },
        { narrate: 'The last trolley in this town stopped running before my father was born.' },
        { note: ['gent', 'Says he came by trolley. There hasn\'t been a trolley here in decades.'] }
      ]
    },
    questions: [
      { id: 'hat', ask: 'Your hat\'s dry. It\'s pouring out there.', requires: 'saw:hat', steps: [
        { who: 'gent', say: 'Is it? I hadn\'t noticed, old sport.' },
        { note: ['gent', 'Asked why his hat was dry. He hadn\'t noticed the rain.'] }
      ] },
      { id: 'coin', ask: 'What\'s the coin for?', requires: 'saw:coin', steps: [
        { who: 'gent', say: 'For your trouble. A cup of coffee, and keep the change.' },
        { narrate: 'A silver dollar for a cup of coffee. In this decade it wouldn\'t buy the cup.' },
        { note: ['gent', 'Offered me a 1922 silver dollar for a coffee. Told me to keep the change.'] }
      ] },
      { id: 'watch', ask: 'Nice watch. What year\'s engraved on it?', requires: 'saw:pocketwatch', steps: [
        { who: 'gent', say: 'Twenty-three. A gift from my father, the year I made partner.' },
        { narrate: 'Partner in 1923 would make him about a hundred.' },
        { note: ['gent', 'Says the watch was a gift in \'23, the year he made partner.'] }
      ] },
      { id: 'list', ask: 'You\'re not on my list.', requires: 'saw:desk.list', steps: [
        { who: 'gent', say: 'Then your list is mistaken, old sport. Might I trouble you for your telephone apparatus?' },
        { narrate: 'He lifted the receiver and looked the phone over for a crank.' },
        { who: 'gent', say: 'Operator? ... Operator?' },
        { note: ['gent', 'Not on the visitor list. Didn\'t know how to use a push-button phone. Kept asking for the operator.'] }
      ] },
      { id: 'year', ask: 'You\'re here for the man upstairs. What year did you leave?', requires: 'metGent', steps: [
        { who: 'gent', say: '...I\'m sure I don\'t follow, old sport.' },
        { narrate: 'His hand went to the watch chain anyway.' },
        { note: ['gent', 'Asked what year he left. He said he didn\'t follow, and reached for his watch.'] }
      ] }
    ],
    actions: {
      letThrough: { steps: [
        { narrate: 'I waved him to the stairs. He tipped his hat like it was 1925. For him, it was.' },
        { exit: 'walk' },
        { pause: 800 },
        { sfx: 'distant' },
        { narrate: 'Twenty minutes later every light on the fourth floor went out at once. Then the other light came.' },
        { note: ['gent', 'I let him up. The fourth floor went dark and the night started over.'] },
        { reset: 'You let a man from 1923 through.' }
      ] },
      turnAway: { steps: [
        { narrate: 'I told him the doctor wasn\'t taking visitors tonight. He looked at me for a long time.' },
        { who: 'gent', say: 'Another time, then.' },
        { exit: 'walk' },
        { narrate: 'He walked out into the rain. It didn\'t seem to touch him. Something told me he\'d be back in different clothes.' },
        { note: ['gent', 'Turned him away. He went quietly. He\'ll be back.'] }
      ] },
      shoot: { steps: [
        { sfx: 'gunshot' },
        { exit: 'fall' },
        { backdrop: 'body' },
        { narrate: 'He went down without a sound. The fedora rolled along the counter, still dry.' },
        { note: ['gent', 'Shot him. Nobody came looking.'] }
      ].concat(cleanup('Another one for the supply closet. I was getting good with that mop.')) }
    }
  };

  /* ---------------- Pizza delivery driver (legit) ---------------- */
  V.pizza = {
    id: 'pizza',
    truth: 'legit',
    prompt: 'The box is still warm. The kid is not thrilled about the rain.',
    greeting: [
      { who: 'pizza', say: 'Large pepperoni, extra garlic, for, uh...' },
      { who: 'pizza', say: 'Halvorsen? Lab two? Night crew. They paid on the phone, I just need a signature.' }
    ],
    inspect: [
      { title: 'Cap', zoom: 'cap', x: 228, y: 38, w: 44, h: 22,
        text: 'SAL\'S PIZZA, stitched in white. Sal\'s does the best slice on the east side. I\'ve had it twice this week.',
        note: 'Sal\'s Pizza cap, soaked through. Sal\'s is the good place on the east side.' },
      { title: 'Receipt', zoom: 'receipt', x: 270, y: 132, w: 24, h: 14,
        text: 'Taped to the lid. Today\'s date, 10.13. Fourteen ninety-five, paid by phone.',
        note: 'Receipt on the box: today\'s date, $14.95, paid by phone, Lab 2.' },
      { title: 'Shirt', zoom: 'grease', x: 218, y: 166, w: 60, h: 22,
        text: 'Grease down the front of his polo, pepperoni orange. That\'s a week of shifts, not a costume.',
        note: 'Grease stains all down his work polo. Real wear.' },
      { title: 'Pager', zoom: 'pager', x: 266, y: 182, w: 16, h: 14,
        text: 'A beat-up pager clipped to his belt. The screen says 555-0142. Sal\'s number, probably calling him back.',
        note: 'Pager on his belt, showing 555-0142.' },
      { title: 'Change pouch', zoom: 'apron', x: 210, y: 190, w: 26, h: 20,
        text: 'A canvas pouch of rolled quarters and crumpled ones. Tip money.',
        note: 'Canvas change pouch full of quarters.' }
    ],
    opening: {
      name: [
        { who: 'pizza', say: 'Danny. From Sal\'s.' },
        { note: ['pizza', 'Danny, delivery driver for Sal\'s Pizza.'] }
      ],
      want: [
        { who: 'pizza', say: 'Large pepperoni for lab two. Third floor, right?' },
        { narrate: 'Lab two is on the second floor. Honest mistake, from a kid who\'s never been past this desk.' },
        { who: 'pizza', say: 'You guys should get a kitchen in here, man. Whole building orders out.' },
        { note: ['pizza', 'Pizza for Lab 2. Thought it was on the third floor. Says there\'s no kitchen here, everyone orders out.'] },
        { learn: 'heardNoKitchen' }
      ],
      how: [
        { who: 'pizza', say: 'Route 9\'s flooded past the Texaco, so I came round by the mall. Took forever.' },
        { note: ['pizza', 'Knows the local roads. Route 9 is flooded past the Texaco.'] }
      ]
    },
    questions: [
      { id: 'cap', ask: 'Sal\'s, huh? Still doing the garlic knots?', requires: 'saw:cap', steps: [
        { who: 'pizza', say: 'Every night, man. Next time you order, ask for me. I\'ll throw extra in.' },
        { note: ['pizza', 'Knows Sal\'s menu. Offered me extra garlic knots.'] }
      ] },
      { id: 'receipt', ask: 'Who ordered it?', requires: 'saw:receipt', steps: [
        { who: 'pizza', say: 'Halvorsen, lab two. Same guy every Tuesday, man. Tips in quarters.' },
        { note: ['pizza', 'Delivers to Halvorsen in Lab 2 every Tuesday.'] }
      ] },
      { id: 'grease', ask: 'Long shift?', requires: 'saw:grease', steps: [
        { who: 'pizza', say: 'Since four. This is pie number eleven. My shirt\'s seen all of them.' },
        { note: ['pizza', 'On shift since four. Eleventh delivery tonight.'] }
      ] },
      { id: 'pager', ask: 'That thing on your belt keeps beeping.', requires: 'saw:pager', steps: [
        { who: 'pizza', say: 'Boss makes us carry the pager. It never stops.' },
        { narrate: 'A pager. About as ordinary as it gets. I relaxed a little.' },
        { note: ['pizza', 'Carries a work pager that won\'t stop beeping.'] }
      ] }
    ],
    actions: {
      letThrough: { steps: [
        { narrate: 'I signed for it and sent him up the back stairs. Lab two would live to see another pepperoni.' },
        { exit: 'walk' },
        { note: ['pizza', 'Let him through. Lab 2 got their pizza.'] }
      ] },
      turnAway: { steps: [
        { narrate: 'I told him no deliveries after ten. He swore at me in a way that was very much of this decade.' },
        { exit: 'walk' },
        { note: ['pizza', 'Turned him away. Lab 2 is going to be furious.'] }
      ] },
      shoot: { steps: [
        { sfx: 'gunshot' },
        { exit: 'fall' },
        { backdrop: 'body' },
        { narrate: 'The box hit the floor before he did. He was nineteen and he was on the phone log.' },
        { note: ['pizza', 'I shot the pizza kid. He was exactly who he said he was.'] },
        { reset: 'You shot the pizza delivery driver.' }
      ] },
      shutdown: { steps: [
        { narrate: 'I pointed Kane\'s device at him and pressed the button. Nothing happened.' },
        { who: 'pizza', say: 'Is that a... are you scanning me? Dude.' },
        { note: ['pizza', 'Tried the device on him. Nothing. He thinks I\'m nuts.'] }
      ] }
    }
  };

  /* ---------------- The obvious android (android) ---------------- */
  V.android = {
    id: 'android',
    truth: 'android',
    prompt: 'He hasn\'t blinked once. His smile is very even.',
    greeting: [
      { who: 'android', say: 'Good evening. I am Inspector R. Hale, Municipal Facilities. This is a routine inspection.' },
      { who: 'android', say: 'Is everything in order?' },
      { pause: 700 },
      { who: 'android', say: 'Is everything in order?' }
    ],
    inspect: [
      { title: 'ID badge', zoom: 'badgeHolo', x: 264, y: 116, w: 22, h: 18,
        text: 'Laminated, like ours. But the seal shifts colour when you tilt it.',
        note: 'His badge seal shifts colour, like a hologram. Ours don\'t do that.' },
      { title: 'Neck', zoom: 'seam', x: 236, y: 86, w: 26, h: 10,
        text: 'A hairline seam under the collar. Straight as a ruler.',
        note: 'A perfectly straight seam under his collar.' },
      { title: 'Inspection order', zoom: 'order', x: 280, y: 192, w: 26, h: 36,
        text: 'Dated 13.10. Day first, month second. Nobody in this country writes a date like that.',
        note: 'His inspection order is dated day first, 13.10.' },
      { title: 'Hands', zoom: 'hands', x: 196, y: 196, w: 18, h: 18,
        text: 'No knuckle creases, no hair, every nail exactly the same length.',
        note: 'His hands are too smooth. No creases at the knuckles.' },
      { title: 'Trousers', zoom: 'trousers', x: 214, y: 206, w: 64, h: 38,
        text: 'Pressed to a knife edge and bone dry, cuffs and all. It\'s pouring out there.',
        note: 'Trousers bone dry, even at the cuffs.' }
    ],
    opening: {
      name: [
        { who: 'android', say: 'Inspector R. Hale, Municipal Facilities.' },
        { who: 'android', say: 'Is everything in order?' },
        { note: ['android', 'Inspector R. Hale, Municipal Facilities. Keeps asking if everything is in order.'] }
      ],
      want: [
        { who: 'android', say: 'A routine inspection. Inspections are conducted at optimal hours.' },
        { note: ['android', 'A "routine inspection" at a quarter to three in the morning.'] }
      ],
      how: [
        { who: 'android', say: 'I arrived by the conventional method.' },
        { narrate: 'He said it like he was reading it off a card.' },
        { note: ['android', 'Says he arrived "by the conventional method".'] }
      ]
    },
    questions: [
      { id: 'badge', ask: 'Can I take a closer look at that badge?', requires: 'saw:badgeHolo', steps: [
        { who: 'android', say: 'It is a valid badge.' },
        { narrate: 'He didn\'t hand it over.' },
        { note: ['android', 'Wouldn\'t hand over his badge. "It is a valid badge."'] }
      ] },
      { id: 'order', ask: 'Your order\'s dated day first.', requires: 'saw:order', steps: [
        { who: 'android', say: 'That is the correct format.' },
        { who: 'android', say: 'Is everything in order?' },
        { note: ['android', 'Says day-first dates are "the correct format".'] }
      ] },
      { id: 'coffee', ask: 'Coffee? Warm your hands up.', requires: 'saw:hands', steps: [
        { who: 'android', say: 'I do not require—' },
        { who: 'android', say: 'Yes. I would enjoy the coffee.' },
        { narrate: 'He held the cup without drinking. The steam went straight into his eyes. He didn\'t blink.' },
        { note: ['android', 'Took coffee and didn\'t drink it. Steam in his eyes, no blink.'] }
      ] },
      { id: 'dry', ask: 'You walked in from the lot and you\'re bone dry.', requires: 'saw:trousers', steps: [
        { who: 'android', say: 'I walked between the drops.' },
        { pause: 600 },
        { who: 'android', say: 'That was a joke. People enjoy jokes.' },
        { note: ['android', 'Bone dry from the lot. Says he "walked between the drops", then explained it was a joke.'] }
      ] },
      { id: 'milk', ask: 'Got milk?', requires: 'stoppedAndroid', steps: [
        { who: 'android', say: 'I have no milk.' },
        { note: ['android', 'Didn\'t know the milk ad. "I have no milk."'] }
      ] }
    ],
    actions: {
      shutdown: { steps: [
        { sfx: 'shutdown' },
        { narrate: 'I thumbed the button on Kane\'s grey box. A click, and the inspector stopped mid-smile, like a tape on pause.' },
        { exit: 'fall' },
        { narrate: 'Under the collar the seam had split open. Wires, and a smell like a hot radio.' },
        { note: ['android', 'The device dropped him. Wires under the collar.'] },
        { learn: 'stoppedAndroid' }
      ] },
      shoot: { steps: [
        { sfx: 'gunshot' },
        { narrate: 'The bullet went in. Nothing came out. He looked down at the hole, then up at me.' },
        { who: 'android', say: 'Everything is not in order.' },
        { note: ['android', 'Bullets don\'t stop him. Use Kane\'s device.'] },
        { reset: 'Bullets don\'t stop androids. That\'s what the device is for.' }
      ] },
      letThrough: { steps: [
        { narrate: 'I waved him on. His footsteps on the stairs were perfectly even, every one the same.' },
        { exit: 'walk' },
        { pause: 800 },
        { sfx: 'distant' },
        { narrate: 'The inspection took four minutes. Then the light came.' },
        { note: ['android', 'Let him through. The inspection went badly for everyone.'] },
        { reset: 'You let an android through.' }
      ] },
      turnAway: { steps: [
        { narrate: 'I told him to come back during business hours.' },
        { who: 'android', say: 'Understood. I will return during business hours.' },
        { exit: 'walk' },
        { narrate: 'He didn\'t get wet on the way out. Something told me business hours were going to start early.' },
        { note: ['android', 'Turned him away. He said he\'d come back.'] }
      ] }
    }
  };

  /* ---------------- Channel 7 reporter (legit, on the list) ---------------- */
  V.reporter = {
    id: 'reporter',
    truth: 'legit',
    prompt: 'She is already looking past you, at the stairs.',
    greeting: [
      { who: 'reporter', say: 'Carol Vance, Channel Seven Eyewitness News. Dr. Kane\'s expecting me. Twelve-thirty sit-down.' },
      { who: 'reporter', say: 'Big night, huh? We\'ve had three calls about strange lights over this building.' }
    ],
    inspect: [
      { title: 'Press pass', zoom: 'press', x: 262, y: 116, w: 20, h: 14,
        text: 'PRESS, WKRN Channel 7, this year\'s sticker. The photo is unkind, which is how you know it\'s real.',
        note: 'Channel 7 press pass, this year\'s sticker. The photo matches.' },
      { title: 'Microphone', zoom: 'mic', x: 202, y: 96, w: 26, h: 30,
        text: 'A Channel 7 mic flag, scuffed from a lot of car doors.',
        note: 'Channel 7 microphone, well used.' },
      { title: 'Steno pad', zoom: 'steno', x: 284, y: 196, w: 20, h: 26,
        text: 'Shorthand I can\'t read, and three times down the margin: 9:40, 10:15, 10:52. The last one is circled.',
        note: 'Her notepad lists 9:40, 10:15 and 10:52, the last one circled.' },
      { title: 'Keys', zoom: 'vankeys', x: 216, y: 182, w: 16, h: 18,
        text: 'Van keys on a red Channel 7 fob, hanging out of her pocket.',
        note: 'Channel 7 van keys in her pocket.' }
    ],
    opening: {
      name: [
        { who: 'reporter', say: 'Carol Vance. Channel Seven Eyewitness News. You\'ve probably seen me at six.' },
        { note: ['reporter', 'Carol Vance, Channel 7 Eyewitness News.'] }
      ],
      want: [
        { who: 'reporter', say: 'Dr. Kane\'s expecting me. Quarter-to-one sit-down. He picked the time.' },
        { who: 'reporter', say: 'Said it\'d be the story of the century. Somebody has to break it.' },
        { note: ['reporter', 'Kane booked her for a 12:45 interview himself. "Story of the century."'] }
      ],
      how: [
        { who: 'reporter', say: 'News van. Rodney\'s parking it. He\'ll bring the camera up after me. Big guy, Steelers jacket, be nice to him.' },
        { note: ['reporter', 'Came in the news van. Her cameraman Rodney is coming up after her.'] }
      ]
    },
    questions: [
      { id: 'list', ask: 'Let me check the list.', requires: 'saw:desk.list', steps: [
        { 'if': 'run:hasList', then: [
          { narrate: 'There she was on Kane\'s clipboard: C. Vance, Channel 7 News, 12:45.' },
          { note: ['reporter', 'On Kane\'s visitor list: C. Vance, Channel 7, 12:45.'] }
        ], 'else': [
          { narrate: 'The clipboard was empty. Kane never gave me a list this time.' }
        ] }
      ] },
      { id: 'press', ask: 'That press pass current?', requires: 'saw:press', steps: [
        { who: 'reporter', say: 'This year\'s sticker. Want my driver\'s license too? The photo\'s worse.' },
        { note: ['reporter', 'Press pass is current. Offered her license too.'] }
      ] },
      { id: 'lights', ask: 'What are those times on your pad?', requires: 'saw:steno', steps: [
        { who: 'reporter', say: 'Flashes over this building. Nine-forty, ten-fifteen, ten-fifty-two. Bright as noon, no thunder.' },
        { who: 'reporter', say: 'You must have seen them. You\'re sitting right under them.' },
        { narrate: 'I said I hadn\'t. She wrote that down.' },
        { note: ['reporter', 'She\'s logged flashes at 9:40, 10:15 and 10:52. Wrote down that I said I hadn\'t seen any.'] }
      ] }
    ],
    actions: {
      letThrough: { steps: [
        { narrate: 'I pointed her to the stairs. She was halfway up before I finished pointing.' },
        { exit: 'walk' },
        { note: ['reporter', 'Let her up for the interview.'] }
      ] },
      turnAway: { steps: [
        { narrate: 'I told her the doctor wasn\'t giving interviews tonight.' },
        { who: 'reporter', say: 'He called us. You know that, right? This is going on the eleven o\'clock tomorrow.' },
        { exit: 'walk' },
        { note: ['reporter', 'Turned her away. She was on the list. She\'ll be back, angrier.'] }
      ] },
      shoot: { steps: [
        { sfx: 'gunshot' },
        { exit: 'fall' },
        { backdrop: 'body' },
        { narrate: 'Her name was on the clipboard the whole time. Channel 7 ran the story anyway. The story was me.' },
        { note: ['reporter', 'I shot a reporter who was on the list.'] },
        { reset: 'You shot a legitimate visitor.' }
      ] }
    }
  };

  /* ---------------- how each one arrives (night.js adds the clock) ---------------- */
  V.gent.arrive = [
    { crt: ['CAM 01 LOBBY', '> MOTION: 1', '> REC'] },
    { narrate: 'A man in a three-piece suit, shaking rain off a hat that wasn\'t wet.' },
    { enter: 'gent' }
  ];
  V.pizza.arrive = [
    { crt: ['CAM 02 LOT', '> VEHICLE', '> REC'] },
    { narrate: 'Headlights in the lot. A dented hatchback with a lit-up sign on the roof.' },
    { sfx: 'door' },
    { enter: 'pizza' }
  ];
  V.android.arrive = [
    { crt: ['CAM 01 LOBBY', '> MOTION: 1', '> HEAT: NONE'] },
    { narrate: 'The next one came in dry, pressed and smiling. The camera said there was nobody there.' },
    { enter: 'android' }
  ];
  V.reporter.arrive = [
    { crt: ['CAM 02 LOT', '> VEHICLE: VAN', '> REC'] },
    { narrate: 'A news van with a dish on the roof parked across two spaces. Out came a woman with a microphone and somewhere to be.' },
    { sfx: 'door' },
    { enter: 'reporter' }
  ];
  // the 1920s man comes back as a 1950s salesman (act1.js) if you turn him away
  V.gent.comesBackAs = 'salesman';

  window.EMIT.content.visitorList.push(
    { name: 'C. Vance', org: 'WKRN Channel 7 News (12:45 interview)', seeing: 'Dr. Kane' }
  );
})();
