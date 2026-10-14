/*
 * The night's opening: first flash, the scientist, the second flash,
 * the briefing and the cleanup. Every reset in the game lands back on
 * `opening`. See README.md for the step reference.
 */
(function () {
  var S = (window.EMIT.content.scenes = window.EMIT.content.scenes || {});

  S.opening = [
    { backdrop: 'clean' },
    { clock: '10:14 PM' },
    { crt: ['CAM 01 LOBBY', '> RAIN', '> REC'] },
    // Adam's opening: a charged storm night, static on the guard's neck, then the big flash
    { narrate: 'Storm all night. The kind that makes a building feel like it\'s holding its breath.' },
    { lightning: 1 },
    { narrate: 'Every time the sky lit up, the hair on the back of my neck stood on end. Static, I told myself.' },
    { lightning: 2 },
    { pause: 700 },
    { sfx: 'flash' },
    { flash: 'big' },
    { crt: ['CAM 01 LOBBY', '> MOTION: 1', '> REC'] },
    { narrate: 'Then the big one. White, everywhere, all at once.' },
    { 'if': 'heardFirstFlash', then: [
      { narrate: 'Last time I thought it was lightning.', noSkip: true }
    ] },
    { 'if': 'wantedPoster', then: [
      { narrate: 'It wasn\'t lightning. It never was.', noSkip: true }
    ] },
    { learn: 'heardFirstFlash' },
    { sfx: 'door' },
    { enter: 'scientist' },
    { narrate: 'A lab coat came through the doors at a run. The badge clipped to it said KANE.' },
    { who: 'scientist', say: 'You! Guard! You won\'t believe it. Nobody is going to believe it.' },
    { who: 'scientist', say: 'I did it. Tonight. Up there. Do you understand what I\'m telling you? I did it.' },
    { who: 'scientist', say: 'Time. I cracked it. The whole knot of it. Displacement, the arrow, travel. All of it.' },
    { who: 'scientist', say: 'Time travel, Guard. Real, working, sitting on a bench on the fourth floor.' },
    { note: ['scientist', 'Says he cracked time travel tonight, upstairs. Out of breath, but the story came out in one piece.'] },
    { desk: 'scientist' },
    { goto: 'secondFlash' }
  ];

  S.secondFlash = [
    { clock: '10:31 PM' },
    { narrate: 'Seventeen minutes. I counted drops on the glass and lost count twice.' },
    { pause: 500 },
    { sfx: 'flash' },
    { flash: 'big' },
    { crt: ['CAM 01 LOBBY', '> SIGNAL LOSS', '> ##@!%&'] },
    { narrate: 'More lightning, still close. The doors barely slid open enough when he came in.' },
    { enter: 'assassin' },
    { narrate: 'Seven feet of him, give or take. Plates where a coat should be, and a blue glow running along the seams. The rain didn\'t seem to stick to him.' },
    { who: 'assassin', say: 'Directions. The science laboratory.' },
    { who: 'assassin', say: 'Everyone inside is to be terminated. Cooperate, and you will not be.' },
    { desk: 'assassin' },
    { goto: 'briefing' }
  ];

  S.briefing = [
    { clock: '10:33 PM' },
    { crt: ['CAM 03 LAB HALL', '> MOTION: 1', '> DOOR B: OPEN'] },
    { pause: 600 },
    { narrate: 'The stairwell door banged open. Kane, holding the rail, staring at the floor. At what was on the floor.' },
    { enter: 'scientist', from: 'right' },
    { 'if': 'heardBriefing', then: [
      { narrate: 'He didn\'t look surprised. I was starting to notice that he never did.', noSkip: true }
    ] },
    { who: 'scientist', say: 'Oh. Oh, good. Good man.' },
    { who: 'scientist', say: 'Listen to me. Now that it exists, it exists everywhere. Every when. Do you follow?' },
    { who: 'scientist', say: 'Somebody, somewhen, is going to want it stopped. Or want it for themselves. They\'ll come here. They\'ll come to this desk.' },
    { who: 'scientist', say: 'Not like him. The next ones will be careful. They\'ll look like they belong.' },
    { who: 'scientist', say: 'I have real visitors coming tonight. Government. Other researchers. Company people. They have to get through.' },
    { narrate: 'He dropped a clipboard on the desk. A typed list, tonight\'s date across the top.' },
    { set: 'hasList' },
    { who: 'scientist', say: 'Screen everyone. Ask questions. Look at them properly. And whatever you do, don\'t let them know you know.' },
    { who: 'scientist', say: 'If they think you\'re onto them, they\'ll find another way in. One you won\'t see.' },
    { ask: {
      prompt: 'Before he goes',
      options: [
        { text: 'Who was he? The one I shot.', steps: [
          { who: 'scientist', say: 'Nobody you\'ll meet twice.' },
          { narrate: 'He said it like a man who had checked.' },
          { note: ['scientist', 'Asked who the man in plates was. "Nobody you\'ll meet twice." He sounded sure of it.'] }
        ] },
        { text: 'Shouldn\'t I call the police?', steps: [
          { who: 'scientist', say: 'And tell them what? That the lights flickered and a man in armour asked for directions?' },
          { who: 'scientist', say: 'No police. Not tonight.' },
          { note: ['scientist', 'Didn\'t want the police called. Not tonight.'] }
        ] },
        { text: 'Why me?', steps: [
          { who: 'scientist', say: 'Because you\'re here.' },
          { pause: 400 },
          { who: 'scientist', say: 'You\'re always here.' },
          { note: ['scientist', 'Asked why me. "You\'re always here." I\'ve only met him tonight.'] }
        ] },
        { text: 'Understood.', exit: true, steps: [
          { who: 'scientist', say: 'Good. And clean that up, would you? I have work to finish.' }
        ] }
      ]
    } },
    { learn: 'heardBriefing' },
    { exit: 'walk' },
    { narrate: 'He was gone before I could ask where a man puts seven feet of anybody.' },
    { pause: 400 },
    { clock: '10:51 PM' },
    { narrate: 'The mop bucket was in the janitor\'s closet. The rain had the decency to keep going.' },
    { backdrop: 'clean' },
    { crt: ['CAM 01 LOBBY', '> MOTION: 0', '> REC'] },
    { narrate: 'By ten fifty-one the floor shone. The night had other plans for it.' },
    { goto: 'night' }
  ];
})();
