/*
 * Story beats between visitors and the endings:
 *   device    end of act two: Kane hands over the shutdown device
 *   holdOff   end of act three: "nearly done, hold them off a bit longer"
 *   pitch     end of act four: burn it (Emit stranded, not hunted) or keep it in "the right hands" (Emit kills the real Kane)
 *   epilogue  the true ending: Emit shot at the first flash, with the evidence
 * The first-flash shot itself is wired into the scientist's desk below.
 * Endings for the end card are in E.content.endings.
 */
(function () {
  var E = window.EMIT;
  var S = E.content.scenes, V = E.content.visitors, C = E.content.characters;
  var K = E.art.kit, P = K.P;

  /* ---------------- 2:30 AM: the device ---------------- */
  S.device = [
    { crt: ['CAM 03 LAB HALL', '> MOTION: 1', '> DOOR B: OPEN'] },
    { narrate: 'The stairwell door again. Kane, with his sleeves rolled and a smell on him like a burnt-out fuse.' },
    { enter: 'scientist', from: 'right' },
    { who: 'scientist', say: 'How are we doing? Don\'t answer. You\'re still here, so we\'re doing fine.' },
    { who: 'scientist', say: 'It\'s going to get stranger from here. Some of them won\'t be people at all.' },
    { narrate: 'He set a grey plastic box on the desk. The size of a pager, one button on it.' },
    { who: 'scientist', say: 'If anyone comes through who isn\'t... a person, point it and press. It won\'t hurt anyone who is.' },
    { set: 'hasDevice' },
    { note: ['scientist', 'Gave me a grey box with one button. For anyone who "isn\'t a person".'] },
    { ask: {
      prompt: 'Before he goes back up',
      options: [
        { text: 'Where does something like this even come from?', steps: [
          { who: 'scientist', say: 'Upstairs. Tonight. You\'d be amazed what a man can build when he knows what\'s coming.' },
          { narrate: 'It didn\'t look built tonight. The plastic was scuffed at the corners, like it had lived in a pocket for years.' },
          { note: ['scientist', 'Says he built the device tonight. It looks years old, worn at the corners.'] }
        ] },
        { text: 'Your sister says you\'re short. And bald.', requires: 'realKaneDescribed', steps: [
          { who: 'scientist', say: 'Ellen?' },
          { pause: 400 },
          { who: 'scientist', say: 'Ellen hasn\'t seen me in years. People change. Go easy on her, she worries.' },
          { narrate: 'A man doesn\'t grow eight inches and a head of hair because his sister stopped visiting.' },
          { note: ['scientist', 'Told him his sister described a short, bald man. He brushed it off. "People change."'] },
          { learn: 'kaneLied' }
        ] },
        { text: 'What if I point it at the wrong person?', steps: [
          { who: 'scientist', say: 'Then nothing happens, and they think you\'re strange. You\'ll live.' },
          { note: ['scientist', 'The device does nothing to people. They just notice you tried.'] }
        ] },
        { text: 'Got it.', exit: true, steps: [
          { who: 'scientist', say: 'Good man. Not long now.' }
        ] }
      ]
    } },
    { exit: 'walk' }
  ];

  /* ---------------- 4:52 AM: hold them off ---------------- */
  S.holdOff = [
    { crt: ['CAM 03 LAB HALL', '> MOTION: 2', '> SMOKE?'] },
    { narrate: 'He came down slower this time. Soot on his cuffs, a box of folders under one arm.' },
    { enter: 'scientist', from: 'right' },
    { who: 'scientist', say: 'Nearly done. Nearly. I need you to hold them off a bit longer.' },
    { who: 'scientist', say: 'There\'s a man from Kessler Dynamics at half five. Lindqvist. He\'s on the list. Let him up.' },
    { 'if': 'loop>=2', then: [
      { who: 'scientist', say: 'And don\'t look so worried. You handled the monk much better this time.' },
      { narrate: 'This time. I hadn\'t said a word to him about any monk.', noSkip: true },
      { note: ['scientist', 'He knew how I\'d handled the monk. He said "this time". He wasn\'t there. Either time.'] },
      { learn: 'kaneKnowsLoops' }
    ] },
    { ask: {
      prompt: 'He\'s already turning for the stairs',
      options: [
        { text: 'How do you know about the monk?', requires: 'loop>=2', steps: [
          { who: 'scientist', say: 'Camera in the hall. I watch the monitor when I\'m thinking.' },
          { narrate: 'The camera in the hall points at the hall. Not at my desk.' },
          { note: ['scientist', 'Says he watched me on the hall camera. That camera can\'t see the desk.'] }
        ] },
        { text: 'What\'s in the folders?', steps: [
          { who: 'scientist', say: 'Mistakes. Going in the incinerator.' },
          { narrate: 'The top folder said KANE, A. in someone else\'s handwriting.' },
          { note: ['scientist', 'Carrying folders labelled KANE, A. in someone else\'s handwriting, to burn them.'] }
        ] },
        { text: 'Point the device at him.', requires: 'run:hasDevice', steps: [
          { narrate: 'I picked up the grey box and pointed it at him. Just to see.' },
          { who: 'scientist', say: 'Don\'t—' },
          { narrate: 'I pressed it. Nothing happened. He flinched anyway, like a man who knew exactly what it does.' },
          { who: 'scientist', say: 'Where did you get that?' },
          { pause: 500 },
          { who: 'scientist', say: '...I gave you that. Of course I did. Long night.' },
          { note: ['scientist', 'Pointed the device at him. Nothing happened, but he flinched and asked where I got it. He gave it to me.'] },
          { learn: 'deviceFlinch' }
        ] },
        { text: 'I\'ll hold them.', exit: true, steps: [
          { who: 'scientist', say: 'I know you will. You always do.' }
        ] }
      ]
    } },
    { exit: 'walk' }
  ];

  /* ---------------- 6:04 AM: the pitch ---------------- */
  S.pitch = [
    { crt: ['CAM 03 LAB HALL', '> MOTION: 1', '> SMOKE'] },
    { narrate: 'The windows were going grey. Then the stairwell door, and Kane, with no box and no folders, just his hands.' },
    { enter: 'scientist', from: 'right' },
    { who: 'scientist', say: 'It\'s worse than I thought. They\'ll never stop coming. Not tonight, not ever, not while it\'s out of my hands.' },
    { who: 'scientist', say: 'So there are two ways this ends. I burn it. The machine, the notes, all of it. Nobody ever builds it, nobody ever comes.' },
    { who: 'scientist', say: 'Or it stays in the right hands. Mine. There\'s a man in the lab at the end of the hall who thinks it\'s his.' },
    { who: 'scientist', say: 'Either way I need the desk held. Ten minutes. Then it\'s over. For both of us.' },
    { 'if': 'now:wantedPoster', then: [
      { narrate: 'The poster was in my drawer. WANTED: EMIT. The same face, without the glasses.', noSkip: true }
    ] },
    { ask: {
      prompt: 'Ten minutes, he says',
      options: [
        { text: 'Evening, Emit.', requires: 'now:wantedPoster', exit: true, steps: [
          { narrate: 'He stopped. All of him, at once.' },
          { who: 'scientist', say: '...So the paper finally found you.' },
          { who: 'scientist', say: 'Doesn\'t matter. I\'ve got all the nights I want.' },
          { narrate: 'He touched the cheap black watch on his wrist. I knew the light before it came.' },
          { note: ['scientist', 'Called him Emit at dawn. He touched his watch and pulled the night back. It has to be where it starts.'] },
          { learn: 'emitKnowsYouKnow' },
          { sfx: 'flash' },
          { reset: 'Emit pulled the night back. Not here. Where it started.' }
        ] },
        { text: 'Open the drawer.', exit: true, steps: [
          { sfx: 'scratch' },
          { narrate: 'I had the drawer open before I\'d decided anything.' },
          { sfx: 'gunshot' },
          { narrate: 'He fell. On the way down his hand found his watch.' },
          { who: 'scientist', say: 'Not... here...' },
          { note: ['scientist', 'Shot him at dawn. He reached for his watch as he fell, and the night started over. "Not here."'] },
          { learn: 'shotEmitLate' },
          { sfx: 'flash' },
          { reset: 'He pulled the night back as he fell. It only sticks where it started.' }
        ] },
        { text: 'No. Not like this.', exit: true, steps: [
          { who: 'scientist', say: 'Then I\'ll find a guard who says yes.' },
          { narrate: 'He touched his watch. The light came, and the night folded up like a map.' },
          { note: ['scientist', 'Told him no at dawn. He touched his watch and the night started over.'] },
          { sfx: 'flash' },
          { reset: 'You told him no. He tried again with a fresh night.' }
        ] },
        { text: 'Burn it. I\'ll hold the desk.', exit: true, steps: [
          { who: 'scientist', say: 'Good man. Good man.' },
          { exit: 'right' },
          { pause: 600 },
          { clock: '6:30 AM' },
          { crt: ['CAM 03 LAB HALL', '> SIGNAL LOSS', '> SMOKE'] },
          { narrate: 'The smoke alarms went at half six. The fourth floor lab went up like a filing cabinet full of matches.' },
          { narrate: 'At seven a short, bald man came down the stairs with soot on his glasses and a blank notebook in his hands.' },
          { narrate: 'He said he\'d had something, last night. He was sure he\'d had something. He couldn\'t remember what.' },
          { narrate: 'Emit walked out the front doors at half seven, into a morning he couldn\'t leave. Nobody followed him. Nobody ever would.' },
          { note: ['scientist', 'Held the desk while he burned the lab. Time travel never gets built. He\'s stuck here now, but nobody hunts him.'] },
          { learn: 'helpedEmit' },
          { end: 'emit' }
        ] },
        { text: 'Keep it in the right hands.', exit: true, steps: [
          { who: 'scientist', say: 'I knew you\'d understand. You\'ve seen what comes through those doors.' },
          { who: 'scientist', say: 'Hold the desk. Nobody goes up. Nobody comes down but me.' },
          { exit: 'right' },
          { pause: 900 },
          { clock: '6:20 AM' },
          { crt: ['CAM 03 LAB HALL', '> MOTION: 2', '> MOTION: 1'] },
          { narrate: 'The camera on the fourth floor showed two men at the end of the hall. Then it showed one.' },
          { enter: 'scientist', from: 'right' },
          { narrate: 'He came down at half six with a coffee cup that wasn\'t his and a badge that said KANE, and this time it was true.' },
          { who: 'scientist', say: 'Dr. Aldous Kane. Fourth floor. You\'ll want to get used to the name, Lou. Everyone will.' },
          { narrate: 'No more flashes after that. Nobody came looking for him. Nobody who came looking ever got past me.' },
          { note: ['scientist', 'Held the desk while he went up to the real Kane. He came down alone, with the name and the machine.'] },
          { learn: 'emitRules' },
          { end: 'emitRules' }
        ] }
      ]
    } }
  ];

  /* ---------------- the true ending: shot at the first flash ---------------- */
  // evidence the guard needs before the first-flash shot sticks (bible section 5)
  var EVIDENCE = ['wantedPoster', 'wardenFile', 'now:sawWatch'];

  var kane = V.scientist;
  kane.questions.unshift({ id: 'emit', ask: 'Evening, Emit.', requires: 'wantedPoster', steps: [
    { narrate: 'He stopped dead, halfway to the stairs.' },
    { who: 'scientist', say: '...Who told you that name?' },
    { 'if': ['wardenFile', 'now:sawWatch'], then: [
      { narrate: 'The poster. The warden\'s file. The watch reading 12.03.40. I had all of it now, and so did the drawer.', noSkip: true }
    ], 'else': [
      { narrate: 'I had the name. I didn\'t have enough to be sure what it meant. Not yet.', noSkip: true }
    ] },
    { note: ['scientist', 'Called him Emit the moment he ran in. He stopped dead and asked who told me.'] },
    { learn: 'calledEmit' }
  ] });

  var oldShoot = kane.actions.shoot.steps;
  kane.actions.shoot = { steps: [
    { 'if': EVIDENCE, then: [{ run: 'epilogue' }], 'else': [
      { 'if': 'wantedPoster', then: [
        { narrate: 'I had a name off a poster and a bad feeling. A jury would want more. So did I.', noSkip: true }
      ] }
    ].concat(oldShoot) }
  ] };

  S.epilogue = [
    { sfx: 'gunshot' },
    { exit: 'fall' },
    { backdrop: 'body' },
    { narrate: 'He went down right where he\'d landed. On his wrist the cheap black watch sparked, tried to pull the night back, and found nowhere earlier to go.' },
    { pause: 900 },
    { clock: '6:12 AM' },
    { crt: ['CAM 01 LOBBY', '> SIGNAL: CLEAR', '> REC'] },
    { narrate: 'No flashes after that. No visitors. Just the rain, easing off, and then not even that.' },
    { narrate: 'Morning came in through the glass doors like it had never heard of me.' },
    { 'if': function () { return !!V.warden && !!E.art.visitors.warden; }, then: [
      { sfx: 'door' },
      { enter: 'warden' },
      { narrate: 'A long coat came in out of the last of the rain. He knelt by the body, unbuckled the watch, and pocketed it.' },
      { who: 'warden', say: 'Recall anchor. Prison issue, stolen.' },
      { who: 'warden', say: 'Every time one of us got near him, he pulled the whole night back like a tablecloth.' },
      { who: 'warden', say: 'You were standing on the tablecloth.' },
      { who: 'warden', say: 'All night he met your visitors on the stairs. The ones who\'d have made trouble for him later. He dealt with them.' },
      { narrate: 'He looked at the marks scratched into my desk and counted them under his breath.' },
      { who: 'warden', say: '{loops}. That\'s how many times you stood here. Most people would have walked out after one.' },
      { narrate: 'I looked at the floor. At the mess. I reached for the closet keys out of habit.' },
      { who: 'warden', say: 'Leave it. You\'ve done this enough. Allow us.' },
      { exit: 'right' },
      { pause: 700 },
      { narrate: 'A squeak of wheels from the janitor\'s closet. He came back pushing the mop bucket.' },
      { enter: 'warden', from: 'right' },
      { narrate: 'He mopped the way you\'d expect a man like that to mop. Slow, even strokes. Nothing missed.' },
      { backdrop: 'clean' },
      { narrate: 'When he was done there was nothing on the floor but the shine, and nothing by the desk at all.' },
      { who: 'warden', say: 'He\'ll be collected. Go home when your shift ends, Mr. Brennan.' },
      { exit: 'left' }
    ] },
    { pause: 600 },
    { crt: ['CAM 03 LAB HALL', '> MOTION: 1', '> DOOR B: OPEN'] },
    { narrate: 'Then the stairwell door. A short man, bald, grey moustache, glasses pushed up on his head, carrying a coffee cup.' },
    { enter: 'realKane', from: 'right' },
    { who: 'realKane', say: 'Morning. Is it morning? I\'ve been up all night. I think... I think I actually made something.' },
    { who: 'realKane', say: 'Sorry, I don\'t think we\'ve met. Aldous Kane. Fourth floor.' },
    { narrate: 'Six years on this desk, and it was the first time I\'d seen his face.' },
    { note: ['realKane', 'The real Dr. Aldous Kane came down at dawn. Short, bald, grey moustache. He has no idea.'] },
    { exit: 'walk' },
    { pause: 600 },
    { narrate: 'Lightning, I\'d told myself. It was never lightning.' },
    { learn: 'trueEnding' },
    { end: 'true' }
  ];

  /* ---------------- the real Kane (epilogue only) ---------------- */
  C.realKane = { name: 'Dr. Aldous Kane', notebookName: 'The real Dr. Aldous Kane', portrait: 'realKane' };
  V.realKane = { id: 'realKane', truth: 'legit', portrait: false };
  E.art.visitors.realKane = function () {
    // shorter than the man who wore his name: head and shoulders sit lower
    K.legs(P.brown1, P.brown0, 192);
    K.torso(P.brown2, P.brown1, 196);
    K.R(236, 164, 26, 30, P.shirt); K.R(236, 192, 26, 3, P.night0);
    K.armL(P.brown2, P.paper, P.skinA1, P.skinA2);
    K.armR(P.brown1, P.paper, P.skinA1, P.skinA2);
    K.R(286, 196, 14, 14, P.paper); K.R(287, 197, 12, 2, P.paperShade); K.R(299, 200, 3, 6, P.paper);
    K.El(294, 207, 5, 5, P.skinA1);
    // cardigan over a shirt and tie
    K.poly([[196, 170], [204, 130], [226, 120], [272, 120], [294, 130], [302, 170]], P.brown1);
    K.poly([[200, 170], [208, 132], [228, 122], [249, 122], [249, 170]], P.brown2);
    K.poly([[238, 120], [260, 120], [256, 170], [242, 170]], P.shirt);
    K.poly([[246, 122], [252, 122], [253, 156], [249, 160], [245, 156]], P.red0);
    [136, 148, 160].forEach(function (y) { K.R(237, y, 2, 2, P.plastic2); });
    // a round, bald head, grey moustache, glasses pushed up
    K.R(241, 106, 16, 16, P.skinA1);
    K.El(249, 90, 18, 20, P.skinA1); K.El(246, 88, 15, 17, P.skinA2); K.D(258, 74, 12, 34, P.skinA0, 2);
    K.El(232, 92, 3, 5, P.fog); K.El(266, 92, 3, 5, P.fog);
    K.R(236, 74, 26, 4, P.night0); K.R(238, 75, 9, 2, P.steel); K.R(251, 75, 9, 2, P.steel);
    K.R(239, 88, 6, 2, P.night0); K.R(253, 88, 6, 2, P.night0);
    K.poly([[240, 98], [249, 96], [258, 98], [257, 102], [249, 100], [241, 102]], P.fog);
    K.R(245, 104, 8, 1, P.skinA0);
  };

  /* ---------------- end cards ---------------- */
  E.content.endings = {
    'true': { eyebrow: '6:12 AM', title: 'Morning.',
      text: 'The loop is closed. Emit fell where he landed, the warden took his watch, and Dr. Kane came down the stairs for the first time. Relive the night to find what you missed, or wipe your memory from the menu and start over.' },
    emit: { eyebrow: '7:30 AM', title: 'Clean slate.',
      text: 'You held the desk while he burned it all. Time travel never gets invented. Emit is stranded in your year, and nobody is coming for him. There are other ways to end this night, and one of them starts at the first flash.' },
    emitRules: { eyebrow: 'Every night after', title: 'The right hands.',
      text: 'You held the desk while Emit took the machine and the name. You still sit the desk. The visitors still come from other times. Now they come to see him, and you decide who gets up the stairs. There are other ways to end this night, and one of them starts at the first flash.' },
    unfinished: { eyebrow: '', title: 'To be continued.', text: 'This part of the night is still being written.' }
  };
})();
