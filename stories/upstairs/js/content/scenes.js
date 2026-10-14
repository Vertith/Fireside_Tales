/*
 * Upstairs: scenes. Each room is a scene; the "What now" menu at the end of
 * a room is how you walk around the house. Story bible: /story/upstairs/story-bible.md.
 *
 * Story-only steps (defined in js/puzzles.js):
 *   { room: 'kitchen' }      which room the art draws
 *   { vanish: true }         whoever is in view is just gone
 *   { count: 'foyer' }       count a visit (game.run.counts)
 *   { mark: 'fakeAt' }       remember the foyer count right now
 *   { puzzle: 'wires', then: [...], else: [...] }
 *   { proof: 'good' | 'bad' } the basement test (two good: reunited, two bad: shot)
 */
(function () {
  var S = window.TALE.content.scenes;

  function counts(g) { return g.run.counts || {}; }
  // The fake deputy knocks once you've called (they listened), or after a few trips through the foyer anyway.
  function fakeCopDue(g) {
    var f = g.run.flags;
    return !f.fakeCopDone && (f.called || (counts(g).foyer || 0) >= 4);
  }
  // The real one only comes if you called, and only after the fake has been and gone.
  function realCopDue(g) {
    var f = g.run.flags;
    return f.called && f.fakeCopDone && !f.realCopGone && (counts(g).foyer || 0) >= (g.run.fakeAt || 0) + 2;
  }
  function onePROOF(g) { return (g.run.good || 0) >= 1; }

  /* ---------- bedtime ---------- */
  S.opening = [
    { room: 'bedtime' }, { actNo: 1 },
    { clock: '8:40 PM' },
    { blink: 'open' },
    { if: 'loop>=2', then: [
      { ask: { title: 'Bedtime', prompt: 'Bedtime again. Mom in the rocking chair, the book open. I remembered all of it.', options: [
        { text: 'Remember it again', exit: true },
        { text: 'Skip to 3:07', steps: [{ goto: 'wake' }] }
      ] } }
    ] },
    { narrate: 'First night in the new house. Boxes everywhere, and my room smelled like somebody else\'s.' },
    { narrate: 'Bath, teeth, rocket pajamas. Mom said I was the cleanest boy in the whole county.' },
    { enter: 'momread', from: 'here' },
    { who: 'momread', say: 'Okay, bug. One chapter. Then it\'s sleep, and I mean it.' },
    { narrate: 'Biscuit\'s tags jingled at the foot of the bed. He was already snoring.' },
    { backdrop: 'dad' },
    { who: 'dadvoice', say: 'Furnace is knocking again. I locked the basement. Key\'s up on the door frame, where little hands can\'t get it.' },
    { note: ['dadvoice', 'Dad keeps the basement key up on top of the basement door frame.'] },
    { who: 'dadvoice', say: 'Lights out by nine, bug.' },
    { narrate: 'He tapped his watch, on his left wrist like always, and went downstairs.' },
    { note: ['dadvoice', 'Dad wears his watch on his left wrist.'] },
    { backdrop: null },
    { who: 'momread', say: '"From the journal of the Reverend Josiah Penhallow. Third of October."' },
    { who: 'momread', say: '"The boy went into the beech-wood at dusk, against every warning his mother gave him."' },
    { who: 'momread', say: '"And the thing that walked out of it at moonrise wore his face, as a man wears a borrowed coat."' },
    { who: 'momread', say: '"It sat at her table. It ate nothing. It called her Mother, in a voice that had been listening at keyholes a long, long while."' },
    { who: 'momread', say: '"Mark me well. They cannot abide cold iron. They cannot speak a plain lie. And they are made from the mirror\'s side of things..."' },
    { narrate: 'My eyes were so heavy. Her voice was far away.' },
    { who: 'momread', say: '"...so that all of them is turned the wrong way about."' },
    { note: ['momread', 'Mom was reading me The Hollow Hill. I fell asleep at "the wrong way about."'] },
    { note: ['momread', 'Mom always calls me bug.'] },
    { who: 'momread', say: 'Night, bug.' },
    { blink: 'sleep' },
    { goto: 'wake' }
  ];

  /* ---------- 3:07 AM ---------- */
  S.wake = [
    { vanish: true },
    { room: 'bedroom' }, { actNo: 1 },
    { clock: '3:07 AM' },
    { blink: 'wake' },
    { if: 'loop>=2', then: [
      { narrate: 'The clock said 3:07 again. I knew the noise before it came.', noSkip: true }
    ], else: [
      { narrate: 'When I woke up the room was darker, and Mom was gone.' }
    ] },
    { narrate: 'The book was in the rocking chair, and her shawl was over the arm of it. Biscuit was gone from my feet.' },
    { sfx: 'distant' },
    { narrate: 'Downstairs, something dragged across the floor. Then the TV came on. All static.' },
    { sfx: 'static' },
    { goto: 'bedroom' }
  ];

  /* ---------- upstairs ---------- */
  S.bedroom = [
    { room: 'bedroom' }, { actNo: 1 },
    { ask: { prompt: 'My room. The nightlight made everything orange at the edges.', options: [
      { text: 'Read the rest of Mom\'s book', requires: '!run:readBook', steps: [
        { show: { zoom: 'book', title: 'The Hollow Hill', text: 'Mom\'s book, open where she stopped. A corner folded down.' } },
        { who: 'book', say: '"...so that all of them is turned the wrong way about."' },
        { who: 'book', say: '"And if one should call you by your name, child, do not answer, and do not go to it. Answering is the door, and going is the threshold."' },
        { who: 'book', say: '"Its mother kept it from the boy\'s bed with an old horseshoe, and it stood at the foot all night, wearing his face, asking to be let in."' },
        { note: ['book', 'They can\'t stand iron. They can\'t tell a plain lie. Everything about them is backwards, like a mirror.'] },
        { note: ['book', 'If they call you, don\'t answer and don\'t go to them.'] },
        { note: ['book', 'A horseshoe kept the thing away from the boy\'s bed.'] },
        { learn: 'rules' }, { set: 'readBook' }
      ] },
      { text: 'Touch Mom\'s shawl', requires: '!run:shawl', steps: [
        { narrate: 'It was cold. Mom always leaves it warm. She\'d been gone a long time.' },
        { note: ['house', 'Mom\'s shawl is on my rocking chair. She left it there.'] },
        { learn: 'shawlHere' }, { set: 'shawl' }
      ] },
      { text: 'Look under the bed', requires: '!run:hasLight', steps: [
        { narrate: 'Socks, a Game Boy cartridge, and my flashlight. The big yellow one from Grandpa\'s truck.' },
        { narrate: 'I clicked it on. Its light was the color of a pumpkin. It made me feel braver.' },
        { set: 'hasLight' }
      ] },
      { text: 'Call for Mom', requires: '!run:calledMom', steps: [
        { narrate: '"Mom?" Just a whisper.' },
        { who: 'mom', say: 'I\'m right out here, sweetheart. Come out to me.', noSkip: true },
        { narrate: 'It sounded just like her. But Mom calls me bug.' },
        { note: ['mom', 'When I called for Mom, something answered "sweetheart" from the hall.'] },
        { set: 'calledMom' }
      ] },
      { text: 'Look out the window', requires: '!run:window', steps: [
        { narrate: 'The woods behind the house were black. Something white stood between the trees.' },
        { narrate: 'I blinked, and it was a birch tree. I think it was a birch tree.' },
        { set: 'window' }
      ] },
      { text: 'Go out to the hall', exit: true, steps: [{ goto: 'hall' }] }
    ] } },
    { goto: 'bedroom' }
  ];

  S.hall = [
    { room: 'hall' }, { actNo: 1 },
    { if: '!run:hallSeen', then: [
      { set: 'hallSeen' },
      { narrate: 'Pepper was sitting outside Mom and Dad\'s door with her back up, like a Halloween cat.' },
      { if: '!run:momGone', then: [
        { who: 'mom', say: 'Sweetheart? Is that you out there? Come here, sweetheart. Come in to me.' }
      ] }
    ] },
    { ask: { prompt: 'The hall. The attic hatch up in the ceiling. The stairs going down into black.', options: [
      { text: 'Go in Mom and Dad\'s room', exit: true, steps: [{ goto: 'parents' }] },
      { text: 'Go in the bathroom', exit: true, steps: [{ goto: 'bathroom' }] },
      { text: 'Pet Pepper', requires: '!run:pepper', steps: [
        { narrate: 'She let me. She was warm, and shaking. Mom says cats see things we can\'t.' },
        { note: ['pepper', 'Pepper is real. She\'s scared. She hisses at the things that aren\'t right.'] },
        { set: 'pepper' }
      ] },
      { text: 'Look up at the attic hatch', requires: '!run:hasPole', steps: [
        { narrate: 'Dad opens it with a long pole that has a hook on the end. I didn\'t know where he kept it.' }
      ] },
      { text: 'Pull down the attic ladder', requires: 'run:hasPole', exit: true, steps: [{ goto: 'attic' }] },
      { text: 'Go downstairs', exit: true, steps: [
        { if: 'run:hasLight', then: [{ goto: 'foyer' }], else: [
          { narrate: 'The stairs went down into total black. I wasn\'t going down there without a light.' }
        ] }
      ] },
      { text: 'Go back in my room', exit: true, steps: [{ goto: 'bedroom' }] }
    ] } },
    { goto: 'hall' }
  ];

  S.parents = [
    { room: 'parents' }, { actNo: 1 },
    { if: '!run:momGone', then: [{ meet: 'mom' }] },
    { ask: { prompt: 'Their bed was empty now. The covers were cold.', options: [
      { text: 'Look at Mom\'s nightstand', requires: '!run:nightstand', steps: [
        { narrate: 'Her phone, the one that\'s the same line as the kitchen. It was off the hook, buzzing.' },
        { narrate: 'Her glass of water was full. Something had put a finger in it. The ring it made was going the wrong way.' },
        { note: ['house', 'The upstairs phone in Mom and Dad\'s room was off the hook.'] },
        { set: 'nightstand' }
      ] },
      { text: 'Back to the hall', exit: true, steps: [{ goto: 'hall' }] }
    ] } },
    { goto: 'parents' }
  ];

  S.bathroom = [
    { room: 'bathroom' }, { actNo: 1 },
    { if: ['!run:mirrorDone', '!run:hasStool'], then: [{ meet: 'mirror' }] },
    { ask: { prompt: 'The bathroom. Drip, drip, from the tub.', options: [
      { text: 'Take my stepstool', requires: '!run:hasStool', steps: [
        { narrate: 'My stepstool. The blue one, for brushing my teeth. It\'s light. I put it under my arm.' },
        { set: 'hasStool' }
      ] },
      { text: 'Back to the hall', exit: true, steps: [{ goto: 'hall' }] }
    ] } },
    { goto: 'bathroom' }
  ];

  S.attic = [
    { room: 'attic' }, { actNo: 1 },
    { if: '!run:atticSeen', then: [
      { set: 'atticSeen' }, { clock: '3:28 AM' },
      { narrate: 'I hooked the hatch and pulled. The ladder came down with a groan, and cold came down with it.' },
      { narrate: 'I\'d never been up here. Dad says it\'s full of the Whitlocks\' junk, the people from before us.' },
      { narrate: 'In the middle of the floor somebody had made a big circle. Salt, and chalk, and nails all the way round.' },
      { narrate: 'Candles. And in the middle, a pair of little sneakers.' }
    ] },
    { ask: { prompt: 'The attic. The circle. The round window at the end, full of moon.', options: [
      { text: 'Read the notebook on the crate', requires: '!run:journal', steps: [
        { show: { zoom: 'journal', title: 'A notebook', text: 'Grown-up handwriting, getting worse as it goes.' } },
        { who: 'whitlock', say: '"October 1987. Thomas went into the woods after the dog. What came back wore his face. It ate nothing."' },
        { who: 'whitlock', say: '"The old book was right. Iron. Mirrors. Never answer. We have nailed the house shut with iron. It walks around inside anyway."' },
        { who: 'whitlock', say: '"There is an old way to call a taken child home. The circle tells the night over and over, until the one they took comes back to finish it."' },
        { who: 'whitlock', say: '"Every night is the same night now. He never comes. Nancy says we must stop. I cannot stop."' },
        { note: ['whitlock', 'The Whitlocks\' boy Thomas was taken in 1987. They made this circle to bring him back.'] },
        { note: ['whitlock', 'The circle makes the night happen over and over. That\'s why I keep waking up at 3:07.'] },
        { learn: 'journal' }, { set: 'journal' }
      ] },
      { text: 'Look at the sneakers', requires: '!run:sneakers', steps: [
        { show: { zoom: 'sneakers', title: 'Sneakers', text: 'Red, with velcro. Somebody wrote in the tongue: THOMAS W.' } },
        { narrate: 'Little red sneakers with velcro. My size. THOMAS W., in marker, on the tongue.' },
        { set: 'sneakers' }
      ] },
      { text: 'Step into the circle', steps: [{ goto: 'hill' }] },
      { text: 'Go back down the ladder', exit: true, steps: [{ goto: 'hall' }] }
    ] } },
    { goto: 'attic' }
  ];

  /* ---------- downstairs ---------- */
  S.foyer = [
    { room: 'foyer' }, { actNo: 2 },
    { count: 'foyer' },
    { if: '!run:downSeen', then: [
      { set: 'downSeen' }, { clock: '3:19 AM' },
      { narrate: 'Downstairs was cold. Rain all over the front door glass. Static light flickering out of the living room.' },
      { narrate: 'Over the basement door were Dad\'s two old horseshoes from the barn sale. He said they were for luck.' },
      { note: ['house', 'Dad nailed two horseshoes over the basement door.'] }
    ] },
    { if: fakeCopDue, then: [
      { room: 'frontdoor' },
      { meet: 'cop' }
    ] },
    { if: realCopDue, then: [
      { room: 'frontdoor' },
      { meet: 'deputy' }
    ] },
    { room: 'foyer' },
    { ask: { prompt: 'The front hall. The front door, the basement door, the living room, the kitchen.', options: [
      { text: 'Go in the living room', exit: true, steps: [{ goto: 'living' }] },
      { text: 'Go in the kitchen', exit: true, steps: [{ goto: 'kitchen' }] },
      { text: 'Try the basement door', requires: ['!run:hasKey', '!run:triedDoor'], steps: [
        { narrate: 'Locked. Through the crack at the bottom came warm air, and lantern light. And whispering.' },
        { note: ['house', 'The basement door is locked. There\'s light and whispering down there.'] },
        { set: 'triedDoor' }
      ] },
      { text: 'Feel along the top of the door frame', requires: ['!run:hasKey', '!run:hasStool'], steps: [
        { narrate: 'I went up on my tiptoes as high as I could go. Not even close. Little hands can\'t get it.' },
        { narrate: 'I needed something to stand on.' }
      ] },
      { text: 'Stand on my stepstool and feel the door frame', requires: ['!run:hasKey', 'run:hasStool'], steps: [
        { narrate: 'I put my stepstool under the basement door and climbed up. Dust. A dead fly. A nail.' },
        { narrate: 'And a key, right where Dad said. Cold and heavy, like a horseshoe.' },
        { set: 'hasKey' },
        { note: ['house', 'I found the basement key on top of the door frame, standing on my stepstool.'] }
      ] },
      { text: 'Put the torn picture back together', requires: ['run:hasPieces', '!run:photoDone'], steps: [
        { puzzle: 'photo', then: [
          { narrate: 'There we were on the porch, the day we moved in. Mom. Dad, with his watch on his left arm.' },
          { narrate: 'And Biscuit in front, with his tongue out and one ear inside out. His collar was red. Red!' },
          { note: ['biscuit', 'In the picture, Biscuit\'s collar is RED. The kitchen Biscuit\'s is blue.'] },
          { learn: 'collarRed' }, { set: 'photoDone' }
        ], else: [
          { narrate: 'I put the pieces in my pajama pocket for later.' }
        ] }
      ] },
      { text: 'Unlock the basement door', requires: 'run:hasKey', exit: true, steps: [{ goto: 'basement' }] },
      { text: 'Go back upstairs', exit: true, steps: [{ goto: 'hall' }] }
    ] } },
    { goto: 'foyer' }
  ];

  S.living = [
    { room: 'living' }, { actNo: 2 },
    { meet: 'dad' },
    { goto: 'foyer' }
  ];

  S.kitchen = [
    { room: 'kitchen' }, { actNo: 2 },
    { if: '!run:dogGone', then: [{ meet: 'biscuit' }] },
    { ask: { prompt: 'The kitchen. The fridge humming. The phone on the wall by the back door.', options: [
      { text: 'Look at the phone', requires: '!run:sawPhone', steps: [
        { show: { zoom: 'cordCut', title: 'The phone', text: 'The curly cord was cut in half. Four little wires sticking out of each end.' } },
        { narrate: 'The curly cord was cut through. Not pulled, cut, like with Mom\'s good scissors.' },
        { note: ['house', 'Somebody cut the kitchen phone cord.'] },
        { learn: 'cordCut' }, { set: 'sawPhone' }
      ] },
      { text: 'Fix the phone cord', requires: ['run:sawPhone', '!run:called'], steps: [
        { puzzle: 'wires', then: [
          { narrate: 'Red to red, green to green. I twisted them like Dad does with the Christmas lights. The phone hummed.' },
          { puzzle: 'dial', then: [
            { who: 'dispatch', say: 'Nine-one-one, what is your emergency?' },
            { narrate: 'I whispered it. Mom and Dad were gone, and there were things in the house pretending to be them.' },
            { who: 'dispatch', say: 'Okay, honey. You\'re doing great. Can you tell me your address?' },
            { narrate: 'I knew it. Mom made me learn it. 41 Hollow Road.' },
            { who: 'dispatch', say: 'I\'ve got a deputy on the way to you. Is anybody with you right now, honey?' },
            { sfx: 'click' },
            { narrate: 'Click. Somebody picked up the other phone. The one upstairs, in Mom and Dad\'s room.' },
            { narrate: 'I could hear it breathing on the line. Listening.' },
            { who: 'dispatch', say: 'Honey? Are you still there?' },
            { narrate: 'I hung up.' },
            { set: 'called' }, { clock: '3:36 AM' },
            { note: ['dispatch', 'I called 911. A deputy is coming. Something upstairs listened on the other phone.'] },
            { pause: 500 },
            { if: '!run:albrightGone', then: [
              { narrate: 'Tap tap tap. On the back door glass.' },
              { room: 'backdoor' },
              { meet: 'albright' }
            ] }
          ], else: [
            { narrate: 'I didn\'t call. Not yet.' }
          ] }
        ], else: [
          { narrate: 'My fingers were shaking too much. I left it.' }
        ] }
      ] },
      { text: 'Look at the back door', requires: ['run:called', 'run:albrightGone', '!run:handprint'], steps: [
        { narrate: 'The handprint was still there, on the inside of the glass. Long fingers. Too many knuckles.' },
        { set: 'handprint' }
      ] },
      { text: 'Back to the front hall', exit: true, steps: [{ goto: 'foyer' }] }
    ] } },
    { goto: 'kitchen' }
  ];

  /* ---------- the basement ---------- */
  S.basement = [
    { room: 'basement' }, { actNo: 3 },
    { act: 'The basement', title: 'Iron' },
    { clock: '3:52 AM' },
    { narrate: 'The key turned. Warm air came up, smelling like the furnace and wet rocks.' },
    { narrate: 'At the bottom of the stairs, a camping lantern. A ring of nails and horseshoes on the floor. And inside it...' },
    { enter: 'family', from: 'here' },
    { who: 'family', say: 'Stop. Right there. Not one more step.' },
    { who: 'family', say: 'You\'ve come down those stairs three times tonight. Every time it looked like Owen. Every time it wasn\'t.' },
    { who: 'realmom', say: 'Mike. Mike, look at him.' },
    { who: 'family', say: 'I looked at the last one, Laura.' },
    { narrate: 'Biscuit was behind Dad\'s legs, panting like a train. One ear inside out. Dad\'s watch on his left arm.' },
    { note: ['family', 'The real Mom, Dad and Biscuit are in the basement, inside a ring of iron.'] },
    { ask: { title: 'Prove it', prompt: 'Dad had his shotgun pointed up the stairs. At me. I had to make them believe me.', options: [
      { text: 'Run down to Mom', steps: [
        { narrate: 'I ran. I just wanted Mom.' },
        { goto: 'shot' }
      ] },
      { text: 'Say "Dad, it\'s me. It\'s bug."', steps: [
        { who: 'family', say: 'That\'s what they all say. They all know "bug."' },
        { proof: 'bad' }
      ] },
      { text: 'Tell them what color Biscuit\'s collar is', steps: [
        { who: 'family', say: 'Okay. What color is Biscuit\'s collar? The real Owen picked it out himself.' },
        { ask: { title: 'His collar is', prompt: 'Biscuit\'s collar. What color?', options: [
          { text: '"It\'s red."', requires: 'now:collarRed', exit: true, steps: [
            { who: 'family', say: '...Red. Yeah. It\'s red.' },
            { proof: 'good' }
          ] },
          { text: '"It\'s blue."', requires: 'now:sawBlueCollar', exit: true, steps: [
            { who: 'family', say: 'Blue. That\'s what the last one said.' },
            { proof: 'bad' }
          ] },
          { text: '"I... I don\'t remember."', exit: true, steps: [
            { who: 'family', say: 'You were there. You picked it out.' },
            { proof: 'bad' }
          ] }
        ] } }
      ] },
      { text: 'Tell Mom where she stopped reading', steps: [
        { who: 'realmom', say: 'Bug. Where did I stop reading tonight? Where did you fall asleep?' },
        { ask: { title: 'She stopped at', prompt: 'Where did she stop?', options: [
          { text: '"...wore his face, as a man wears a borrowed coat."', exit: true, steps: [
            { who: 'realmom', say: 'No. No, that\'s not where.' },
            { proof: 'bad' }
          ] },
          { text: '"...the wrong way about."', exit: true, steps: [
            { who: 'realmom', say: 'The wrong way about. That\'s right. That\'s exactly right, Mike.' },
            { proof: 'good' }
          ] },
          { text: '"...listening at keyholes a long, long while."', exit: true, steps: [
            { who: 'realmom', say: 'No. I read past that, bug.' },
            { proof: 'bad' }
          ] }
        ] } }
      ] },
      { text: 'Ask Mom to look at me in her compact mirror', requires: 'now:mirrorRule', steps: [
        { narrate: '"They don\'t show up in mirrors," I said. "Look at me in your mirror. The one in your purse."' },
        { narrate: 'Mom held up her little round compact, so she could see the stairs in it. See me.' },
        { who: 'realmom', say: 'Mike. He\'s in it. He\'s in the mirror.' },
        { proof: 'good' }
      ] },
      { text: 'Step over the iron to show them', requires: ['now:rules', onePROOF], steps: [
        { narrate: 'I came down the last steps with my hands up, like on TV. Right up to the nails.' },
        { narrate: 'Then I stepped over them. Easy. Just a step.' },
        { who: 'family', say: 'It couldn\'t. None of them could get over it.' },
        { proof: 'good' }
      ] },
      { text: 'I don\'t know what else to say', exit: true, steps: [{ goto: 'shot' }] }
    ] } }
  ];

  S.shot = [
    { narrate: 'Dad\'s finger moved.' },
    { sfx: 'gunshot' },
    { backdrop: 'black' },
    { vanish: true },
    { pause: 900 },
    { narrate: 'Dad had been right three times tonight. He didn\'t wait to see if he was wrong.' },
    { note: ['family', 'Dad shot me. I didn\'t make him believe it was really me.'] },
    { end: 'shot' }
  ];

  S.reunited = [
    { who: 'family', say: 'Oh God. Oh God, bug. Come here. Over the nails, don\'t touch them, come here.' },
    { narrate: 'Mom grabbed me so hard my flashlight fell and rolled away. Biscuit licked my ear. His tongue was warm.' },
    { who: 'realmom', say: 'You\'re freezing. Oh, bug. You\'re freezing.' },
    { narrate: 'We sat in the circle all night. Up in the house, things walked around and called our names. We didn\'t answer.' },
    { clock: '6:41 AM' },
    { narrate: 'Then the little window up by the furnace went grey, and then pink. Upstairs went quiet.' },
    { if: 'run:called', then: [
      { narrate: 'Red and blue lights came up the driveway. A deputy knocked and said his own name, and he was soaking wet.' }
    ] },
    { end: 'reunited' }
  ];

  S.outside = [
    { vanish: true },
    { narrate: 'I unlocked the door. He scooped me up, rain and all, and ran me down the steps to his car.' },
    { who: 'deputy', say: 'Stay here. Lock the doors. I\'m going back in for your folks.' },
    { backdrop: 'black' },
    { narrate: 'I watched him go in. I watched the windows. Up in my room, somebody stood at the glass and waved. With the wrong hand.' },
    { clock: '9:15 AM' },
    { narrate: 'They searched all morning. More cars came. A dog came.' },
    { narrate: 'The house was empty. No Mom. No Dad. No Biscuit. In the basement, somebody had kicked a circle of nails apart.' },
    { note: ['deputy', 'I went with the real deputy. They never found Mom and Dad.'] },
    { end: 'outside' }
  ];

  S.hill = [
    { narrate: 'I stepped over the salt, into the middle, next to the little sneakers.' },
    { backdrop: 'candles' },
    { sfx: 'taken' },
    { narrate: 'The candles lit by themselves. All at once. Purple.' },
    { narrate: 'The round window wasn\'t a window anymore. It was trees. Beech trees, white in the moon, and a path going in.' },
    { narrate: 'Somebody small stood on the path, in red sneakers just like the ones by my feet. He waved. The wrong way round.' },
    { who: 'momread', say: '"...and the boy went into the beech-wood at moonrise, and was not afraid, and did not come out of it again."' },
    { narrate: 'It was Mom\'s voice, reading. I don\'t know where from. I went down the path.' },
    { note: ['whitlock', 'I stepped into the circle and went into the woods with Thomas.'] },
    { end: 'hill' }
  ];

  // End cards, by the id an `end` step names
  window.TALE.content.endings = {
    shot: { eyebrow: '3:58 AM', title: 'Wrong.', text: 'Dad had been right three times tonight. Down in the basement, they wait for morning.' },
    reunited: { eyebrow: '6:41 AM', title: 'Morning.', text: 'You found them, and they believed you. The things upstairs never get an answer.' },
    outside: { eyebrow: '9:15 AM', title: 'The house was empty.', text: 'You got out. Nobody else did. You never see your family again.' },
    hill: { eyebrow: 'Moonrise', title: 'The Hollow Hill.', text: 'He went into the beech-wood, and was not afraid, and did not come out of it again.' }
  };
})();
