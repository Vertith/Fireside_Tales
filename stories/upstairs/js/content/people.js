/*
 * Upstairs: the people (and things) Owen meets in the house. A meeting is a
 * `{ meet: 'id' }` step. "Quietly" items are what he can do from where he
 * stands: listen, whisper through the gap, look harder. The stamps are the
 * decision. Going to one of them is the "direct interaction" that kills.
 *
 * The tells all come from the rules in Mom's book (story bible section 3):
 * mirror-wrong, can't lie, can't cross iron, want an answer, colours wrong,
 * know words but not habits.
 */
(function () {
  var P = window.TALE.content.people;

  function death(who, lines, reason, note, flag) {
    return lines.concat([
      { sfx: 'taken' },
      { backdrop: 'taken' },
      { vanish: true },
      { pause: 2600 },
      { note: [who, note] },
      { learn: 'died:' + flag },
      { learn: 'taken' },
      { reset: reason }
    ]);
  }

  /* ---------- Mom, in the big bed ---------- */
  P.mom = {
    id: 'mom', truth: 'fae', from: 'here',
    prompt: 'Mom was sitting up in the big bed in the dark. She was smiling at the door. At me.',
    greeting: [
      { who: 'mom', say: 'There you are, sweetheart. Bad dream? Come here. Come get in with me.' },
      { if: 'died:mom', then: [{ narrate: 'Her arms. I remembered her arms.' }] }
    ],
    questions: [
      { id: 'isMom', ask: 'Whisper: "Are you my mom?"', steps: [
        { who: 'mom', say: 'I\'m the one who tucked you in, sweetheart.', noSkip: true },
        { narrate: 'That wasn\'t a yes.' },
        { note: ['mom', 'I asked if she was my mom. She said she was "the one who tucked me in". Not yes.'] },
        { learn: 'cantLie' }
      ] },
      { id: 'bug', ask: 'Whisper: "What do you call me?"', steps: [
        { who: 'mom', say: 'Sweetheart. My sweetheart. Come here.', noSkip: true },
        { narrate: 'Mom calls me bug. She always calls me bug.' },
        { note: ['mom', 'She calls me sweetheart. Mom calls me bug.'] }
      ] },
      { id: 'shawlAsk', ask: 'Whisper: "Your shawl\'s on my chair."', requires: 'now:shawlHere', steps: [
        { who: 'mom', say: 'Then whose is this?', noSkip: true },
        { narrate: 'She pulled it tighter. It went on pulling after her hands stopped.' },
        { note: ['mom', 'Mom\'s shawl is on my chair. The one she\'s wearing moves by itself.'] }
      ] },
      { id: 'pepper', ask: 'Look at Pepper', steps: [
        { narrate: 'Pepper had followed me. She stood in the doorway making a sound like a kettle.' },
        { note: ['pepper', 'Pepper hissed at the Mom in the big bed.'] }
      ] }
    ],
    inspect: [
      { id: 'hair', title: 'Her hair', zoom: 'momHair', x: 224, y: 40, w: 32, h: 12,
        text: 'Mom parts her hair on the left. This was parted on the other side.',
        note: 'Her hair was parted on the wrong side.', learn: 'mirrorWrong' },
      { id: 'shawl', title: 'The shawl', zoom: 'momShawl', x: 204, y: 84, w: 72, h: 22,
        text: function () {
          return window.TALE.game.test('now:shawlHere')
            ? 'Mom\'s grey shawl. But Mom\'s grey shawl was on my chair. I\'d touched it.'
            : 'Mom\'s grey shawl, around her shoulders like always.';
        },
        note: function () {
          return window.TALE.game.test('now:shawlHere')
            ? 'She was wearing Mom\'s shawl. But Mom\'s shawl was on my chair.' : 'She had Mom\'s shawl on.';
        } },
      { id: 'eyes', title: 'Her eyes', zoom: 'momEyes', x: 228, y: 54, w: 24, h: 12,
        text: 'She didn\'t blink. Once, the dark in them went a kind of purple.',
        note: 'Her eyes went purple for a second.' },
      { id: 'clock', title: 'The clock', zoom: 'clock', x: 330, y: 100, w: 22, h: 12,
        text: 'Their clock was blinking 12:00. The power must have gone off.',
        note: 'The clocks are all blinking. The power went off.' }
    ],
    actions: {
      go: { steps: death('mom', [
        { narrate: 'I climbed up. She put her arms around me and they were cold, cold like the car door in winter.' },
        { narrate: 'And they kept going around. Around and around. Arms aren\'t that long.' }
      ], 'Mom wasn\'t Mom.', 'The Mom in the big bed wasn\'t Mom. Don\'t go to her.', 'mom') },
      still: { label: 'Hide in the closet', stamp: 'Hide in closet', steps: [
        { narrate: 'I slid into their closet and pulled the door almost shut. Dad\'s shirts smelled like Dad.' },
        { who: 'mom', say: 'Sweetheart? Where did you go?' },
        { narrate: 'She got up. She walked the wrong way, heel and then toe, past the closet and out to the hall.' },
        { exit: 'right' },
        { pause: 500 },
        { narrate: 'Something long and hooked fell against my leg. Dad\'s pole, for the attic hatch.' },
        { set: 'hasPole' }, { set: 'momGone' },
        { note: ['house', 'Dad keeps the attic pole in their closet.'] },
        { goto: 'parents' }
      ] },
      back: { steps: [
        { narrate: 'I backed out into the hall. She kept smiling at the place I had been.' },
        { goto: 'hall' }
      ] }
    }
  };

  /* ---------- Dad, in the armchair ---------- */
  P.dad = {
    id: 'dad', truth: 'fae', from: 'here',
    prompt: 'Dad was in his armchair, lit up by the static. He didn\'t look away from it.',
    greeting: [
      { who: 'dad', say: 'Hey, bug. Can\'t sleep? Come sit with me. Come sit on the arm of the chair, like always.' },
      { if: 'died:dad', then: [{ narrate: 'The chair. I remembered what the chair did.' }] }
    ],
    questions: [
      { id: 'isDad', ask: 'Whisper: "Are you my dad?"', steps: [
        { who: 'dad', say: 'Who else would be sitting in your dad\'s chair, bug?', noSkip: true },
        { narrate: 'That wasn\'t a yes either.' },
        { note: ['dad', 'He answered "are you my dad" with a question. Not yes.'] },
        { learn: 'cantLie' }
      ] },
      { id: 'tv', ask: 'Look at the TV', steps: [
        { narrate: 'Just snow and hiss. Dad hates static. He\'d have turned it off.' },
        { note: ['dad', 'He watches static. Dad hates static.'] }
      ] },
      { id: 'pieces', ask: 'Sneak the photo pieces off the rug', requires: '!run:hasPieces', steps: [
        { narrate: 'The picture from the mantel was torn up on the rug. I crawled and got the pieces. All six.' },
        { who: 'dad', say: 'Leave those, bug. Nobody needs those.', noSkip: true },
        { set: 'hasPieces' },
        { note: ['house', 'Somebody tore up our family picture. They don\'t like pictures.'] }
      ] }
    ],
    inspect: [
      { id: 'watch', title: 'His watch', zoom: 'watchWrong', x: 196, y: 110, w: 20, h: 12,
        text: 'Dad\'s watch. On his right arm. Dad wears it on his left, always, the side he taps it on.',
        note: 'His watch is on his right wrist. Dad\'s is on his left.', learn: 'mirrorWrong' },
      { id: 'glasses', title: 'His glasses', zoom: 'glasses', x: 226, y: 48, w: 28, h: 12,
        text: 'The TV should have been shining in his glasses. They were just dark.',
        note: 'Nothing shines in his glasses.' },
      { id: 'remote', title: 'His other hand', zoom: 'remote', x: 264, y: 110, w: 20, h: 12,
        text: 'The remote, with the batteries out. Dad keeps them in with tape.',
        note: 'He\'s holding the remote. No batteries in it.' },
      { id: 'bottle', title: 'The floor', zoom: 'bottle', x: 288, y: 136, w: 14, h: 22,
        text: 'His bottle of root beer, tipped over. It hadn\'t spilled. It was empty and dry.',
        note: 'His root beer bottle is empty and dry.' }
    ],
    actions: {
      go: { label: 'Go sit with him', stamp: 'Sit with him', steps: death('dad', [
        { narrate: 'I sat on the arm of the chair, like always. He patted the cushion.' },
        { narrate: 'The cushion was soft, and then it was softer, and then I was in it up to my shoulders.' }
      ], 'Dad wasn\'t Dad.', 'The Dad in the armchair wasn\'t Dad. Don\'t sit with him.', 'dad') },
      still: false,
      back: { steps: [
        { who: 'dad', say: 'Where you going, bug? I\'ll be right here.' },
        { goto: 'foyer' }
      ] }
    }
  };

  /* ---------- Biscuit, in the kitchen ---------- */
  P.biscuit = {
    id: 'biscuit', truth: 'fae', from: 'here',
    prompt: 'Biscuit was at his bowl, eating. His bowl was empty.',
    greeting: [
      { narrate: 'His tail was going. It went the same speed the whole time, like the fan in Dad\'s computer.' },
      { if: 'died:biscuit', then: [{ narrate: 'His tongue. I remembered his tongue.' }] }
    ],
    questions: [
      { id: 'name', ask: 'Whisper: "Biscuit?"', steps: [
        { narrate: 'He looked up. Biscuit always looks up with one ear inside out. Both of these were perfect.' },
        { note: ['biscuit', 'Both his ears were perfect. Real Biscuit always has one inside out.'] }
      ] },
      { id: 'breath', ask: 'Listen to him', steps: [
        { narrate: 'Biscuit pants all the time. Mom says he sounds like a train. This one didn\'t make a sound.' },
        { note: ['biscuit', 'He didn\'t pant. He didn\'t breathe at all.'] }
      ] }
    ],
    inspect: [
      { id: 'collar', title: 'His collar', zoom: 'collarBlue', x: 204, y: 96, w: 20, h: 18,
        text: 'A blue collar, with his bone tag. The bone pointed the wrong way. Was his collar blue? I couldn\'t remember.',
        note: 'His collar is blue, and the bone tag faces backwards. I couldn\'t remember if that was right.',
        learn: 'sawBlueCollar' },
      { id: 'mouth', title: 'His mouth', zoom: 'dogMouth', x: 170, y: 90, w: 22, h: 14,
        text: 'No tongue hanging out. Biscuit\'s tongue is always out.', note: 'His mouth was shut tight.' },
      { id: 'paws', title: 'His paws', zoom: 'paws', x: 220, y: 146, w: 50, h: 14,
        text: 'Muddy paws. Biscuit gets muddy every day.', note: 'Muddy paws, like always.' },
      { id: 'bowl', title: 'The bowl', zoom: 'bowl', x: 156, y: 148, w: 30, h: 14,
        text: 'His bowl. Licked clean. It had been clean all night.', note: 'He eats out of an empty bowl.' }
    ],
    actions: {
      go: { label: 'Pet him', stamp: 'Pet him', steps: death('biscuit', [
        { narrate: 'I held out my hand, the way you\'re supposed to. He licked it.' },
        { narrate: 'His tongue was cold as a spoon, and it didn\'t stop at my hand.' }
      ], 'Biscuit wasn\'t Biscuit.', 'The Biscuit in the kitchen wasn\'t Biscuit. Don\'t pet him.', 'biscuit') },
      still: { label: 'Keep still and let him pass', steps: [
        { narrate: 'I stood still as a lamp. He came at me, and then past me, so close his fur touched my pajamas.' },
        { narrate: 'It didn\'t feel like fur. He went off toward the living room, tail going the same speed.' },
        { exit: 'left' },
        { set: 'dogGone' },
        { note: ['biscuit', 'If I keep still, the Biscuit thing walks past me.'] },
        { goto: 'kitchen' }
      ] },
      back: { steps: [{ goto: 'foyer' }] }
    }
  };

  /* ---------- the boy in the bathroom mirror ---------- */
  P.mirror = {
    id: 'mirror', truth: 'fae', from: 'here',
    prompt: 'The boy in the mirror was me. Rocket pajamas, the cowlick. He was smiling. I wasn\'t.',
    greeting: [
      { narrate: 'I climbed on my stepstool to see. There I was in the glass, holding my flashlight.' },
      { narrate: 'Then the me in the mirror smiled.' }
    ],
    questions: [
      { id: 'wave', ask: 'Wave at him', steps: [
        { narrate: 'I waved. He waved too, a second late, with the same hand as me. Mirrors don\'t do that.' },
        { note: ['mirror', 'He waved with the same hand as me. A mirror should be backwards.'] }
      ] },
      { id: 'lookBack', ask: 'Look behind me', steps: [
        { narrate: 'In the mirror, the bathroom door behind me was open, and something tall stood in it.' },
        { narrate: 'I turned around. The door was shut. Nobody there.' },
        { narrate: 'I turned back. He had stopped pretending to hold a flashlight.' }
      ] },
      { id: 'step', ask: 'Step off the stool', steps: [
        { narrate: 'I stepped down so I was too short to be in the mirror. He stayed. He was standing on nothing.' },
        { narrate: 'That\'s when I understood. They don\'t have a reflection. This wasn\'t my reflection. It was one of them.' },
        { note: ['mirror', 'They don\'t show up in mirrors. The real me does. That\'s how to tell.'] },
        { learn: 'mirrorRule' }
      ] }
    ],
    inspect: [
      { id: 'face', title: 'His face', zoom: 'mirrorFace', x: 226, y: 44, w: 28, h: 22,
        text: 'My face, but the cowlick was on the wrong side for a mirror. It was on the right side for me.',
        note: 'His cowlick was on my side, not the mirror side.', learn: 'mirrorWrong' },
      { id: 'pjs', title: 'His pajamas', zoom: 'rockets', x: 218, y: 74, w: 44, h: 26,
        text: 'My rocket pajamas. The rockets pointed the same way as mine. In a mirror they should flip.',
        note: 'The rockets on his pajamas pointed the same way as mine.' },
      { id: 'paste', title: 'The glass', zoom: 'toothpaste', x: 200, y: 88, w: 16, h: 12,
        text: 'Toothpaste spots on the glass, where I spit. They were on my side, so the glass was real.',
        note: 'Toothpaste spots on the mirror.' }
    ],
    actions: {
      go: { label: 'Touch the glass', stamp: 'Touch glass', steps: death('mirror', [
        { narrate: 'I put my hand flat on the glass, to see if it was cold.' },
        { narrate: 'He put his hand on the other side. The glass wasn\'t there. His hand was.' }
      ], 'You touched the glass.', 'The boy in the bathroom mirror isn\'t me. Don\'t touch the glass.', 'mirror') },
      still: false,
      back: { label: 'Look away', stamp: 'Look away', steps: [
        { narrate: 'I got down and didn\'t look at the mirror again. When I peeked, it was just the bathroom.' },
        { set: 'mirrorDone' },
        { goto: 'bathroom' }
      ] }
    }
  };

  /* ---------- Mrs. Albright, at the back door ---------- */
  P.albright = {
    id: 'albright', truth: 'fae', from: 'here',
    prompt: 'Mrs. Albright from next door was at the back door, her face on the glass.',
    greeting: [
      { sfx: 'knock' },
      { who: 'albright', say: 'Owen, dear. It\'s only me. Your mother asked me to look in on you. Open up for me.' }
    ],
    questions: [
      { id: 'mom', ask: 'Whisper: "Where\'s my mom?"', steps: [
        { who: 'albright', say: 'Oh, she\'s just where you\'d think she\'d be, dear.', noSkip: true },
        { narrate: 'That wasn\'t anything.' },
        { note: ['albright', 'I asked where Mom was. She said "where you\'d think". That\'s not an answer.'] }
      ] },
      { id: 'cold', ask: 'Whisper: "Aren\'t you cold?"', steps: [
        { who: 'albright', say: 'It\'s much colder out here than in there, dear. Let me in and I\'ll show you.', noSkip: true }
      ] }
    ],
    inspect: [
      { id: 'curlers', title: 'Her curlers', zoom: 'curlers', x: 222, y: 36, w: 36, h: 14,
        text: 'Pink curlers, like always. She wears them to the mailbox.', note: 'Curlers, like always.' },
      { id: 'glasses', title: 'Her glasses', zoom: 'chain', x: 228, y: 56, w: 24, h: 12,
        text: 'Her reading glasses on the chain. The little beads on the chain were stopped mid-swing.',
        note: 'The beads on her glasses chain don\'t swing.' },
      { id: 'feet', title: 'Her feet', zoom: 'bareFeet', x: 220, y: 146, w: 40, h: 16,
        text: 'Bare feet on the wet step. Mrs. Albright has bad feet. She wears her big slippers even in summer.',
        note: 'She was barefoot. Mrs. Albright never goes barefoot.' },
      { id: 'house', title: 'Behind her', zoom: 'darkHouse', x: 296, y: 34, w: 40, h: 40,
        text: 'Her house, across the yard. All dark. Her TV is always on. She sleeps with it on.',
        note: 'Her house was totally dark. She always has her TV on.' }
    ],
    actions: {
      go: { label: 'Unlock the back door', stamp: 'Let her in', steps: death('albright', [
        { narrate: 'I turned the lock. She didn\'t open the door. She didn\'t have to, after that.' },
        { narrate: 'She came in the way smoke comes in.' }
      ], 'You let her in.', 'The Mrs. Albright at the back door wasn\'t her. Don\'t open the door.', 'albright') },
      still: { label: 'Don\'t answer', stamp: 'Don\'t answer', steps: [
        { narrate: 'I didn\'t answer. I didn\'t breathe.' },
        { who: 'albright', say: 'Well. I\'ll be just outside, dear. Whenever you want me.' },
        { narrate: 'When I looked again there was only a handprint on the glass. It was on the inside.' },
        { exit: 'left' },
        { set: 'albrightGone' },
        { note: ['albright', 'If I don\'t answer, they go away. For a while.'] },
        { learn: 'dontAnswer' },
        { goto: 'kitchen' }
      ] },
      back: false
    }
  };

  /* ---------- the deputy who knocks first (fake) ---------- */
  P.cop = {
    id: 'cop', truth: 'fae', from: 'here',
    prompt: 'A deputy stood on the porch, behind the glass of the front door. The porch light wasn\'t on, but I could see him fine.',
    greeting: [
      { sfx: 'knock' },
      { if: 'run:called', then: [
        { who: 'cop', say: 'Sheriff\'s department. You called us, didn\'t you, son? I heard you. Every word.' }
      ], else: [
        { who: 'cop', say: 'Sheriff\'s department. Somebody called about a disturbance at this address.' },
        { if: 'now:cordCut', then: [{ narrate: 'Nobody called anybody. The phone was cut.' }] }
      ] },
      { who: 'cop', say: 'Now, I can\'t come in unless you say so. That\'s the rule. So you just say "come in."' }
    ],
    questions: [
      { id: 'name', ask: 'Whisper: "Are you a real policeman?"', steps: [
        { who: 'cop', say: 'I\'m wearing the uniform, aren\'t I, son?', noSkip: true },
        { note: ['cop', 'I asked if he was a real policeman. He said "I\'m wearing the uniform." Not yes.'] },
        { learn: 'cantLie' }
      ] },
      { id: 'rule', ask: 'Whisper: "Why do I have to say it?"', steps: [
        { who: 'cop', say: 'Because a door\'s a door, son, and a word\'s a word.', noSkip: true },
        { note: ['cop', 'He needed me to SAY he could come in.'] }
      ] }
    ],
    inspect: [
      { id: 'badge', title: 'His badge', zoom: 'badgeWrong', x: 208, y: 102, w: 18, h: 17,
        text: 'A gold star with a number. The number was backwards, like writing in a mirror.',
        note: 'His badge number was backwards.', learn: 'mirrorWrong' },
      { id: 'hat', title: 'His hat', zoom: 'hatDry', x: 220, y: 28, w: 40, h: 16,
        text: 'It was raining hard. His hat was completely dry.', note: 'It was pouring, and his hat was dry.' },
      { id: 'radio', title: 'His radio', zoom: 'radio', x: 197, y: 106, w: 12, h: 18,
        text: 'The radio on his belt. It never made a sound. On TV they always crackle.', note: 'His radio never made a sound.' },
      { id: 'eyes', title: 'His eyes', zoom: 'copEyes', x: 228, y: 52, w: 24, h: 10,
        text: 'Under the hat brim, two little purple lights, like the ones on the VCR.', note: 'His eyes glowed purple under the hat.' }
    ],
    actions: {
      go: { label: 'Say "Come in"', stamp: 'Say come in', steps: death('cop', [
        { narrate: '"Come in," I said. I said it really small, but it counted.' },
        { narrate: 'The lock turned by itself. He took off his hat, and there was nothing under it, and then there was a lot.' }
      ], 'You said "come in."', 'The deputy who wants me to say "come in" isn\'t a deputy.', 'cop') },
      still: { label: 'Don\'t answer', stamp: 'Don\'t answer', steps: [
        { narrate: 'I didn\'t say anything. I sat on the bottom step with my hands over my mouth.' },
        { who: 'cop', say: 'That\'s fine, son. I\'ll be right out here. We\'ve got all night. We\'ve got every night.' },
        { narrate: 'After a while the glass was just dark.' },
        { exit: 'right' },
        { set: 'fakeCopDone' },
        { learn: 'dontAnswer' },
        { mark: 'fakeAt' },
        { goto: 'foyer' }
      ] },
      back: false
    }
  };

  /* ---------- the real deputy (only if Owen called 911) ---------- */
  P.deputy = {
    id: 'deputy', truth: 'real', from: 'here',
    prompt: 'Another deputy. Rain dripping off his hat brim. A flashlight, swinging around. He looked scared.',
    greeting: [
      { sfx: 'knock' },
      { who: 'deputy', say: 'Sheriff\'s department! Owen? Is it Owen? Dispatch said a little boy called. Buddy, I need you to unlock this door.' },
      { if: 'run:fakeCopDone', then: [{ narrate: 'Two deputies in one night. The first one wanted me to say a word. This one wanted the lock.' }] }
    ],
    questions: [
      { id: 'isCop', ask: 'Whisper: "Are you a real policeman?"', steps: [
        { who: 'deputy', say: 'Yes. Yes, I am. Deputy Ray Castillo. You can call me Ray. Can you open the door, Owen?', noSkip: true },
        { narrate: 'He said yes. Just yes.' },
        { note: ['deputy', 'He said yes, he was a real policeman. They can\'t say yes.'] }
      ] },
      { id: 'parents', ask: 'Whisper: "My mom and dad are gone."', steps: [
        { who: 'deputy', say: 'Okay. Okay, buddy. First we get you out to my car where it\'s warm. Then I come back in for your folks. Deal?', noSkip: true }
      ] }
    ],
    inspect: [
      { id: 'badge', title: 'His badge', zoom: 'badgeRight', x: 258, y: 102, w: 18, h: 17,
        text: 'A gold star. 714. The number read the right way.', note: 'His badge read the right way: 714.' },
      { id: 'hat', title: 'His hat', zoom: 'hatWet', x: 220, y: 28, w: 40, h: 16,
        text: 'Soaked. Water running off the brim in a string.', note: 'His hat was soaking wet.' },
      { id: 'radio', title: 'His radio', zoom: 'radio', x: 197, y: 106, w: 12, h: 18,
        text: 'His radio crackled: "...unit seven, status?" He pressed it and said, "On scene."', note: 'His radio crackled and talked.' }
    ],
    actions: {
      go: { label: 'Unlock the door for him', stamp: 'Unlock it', steps: [{ goto: 'outside' }] },
      still: { label: 'Don\'t answer', stamp: 'Don\'t answer', steps: [
        { who: 'deputy', say: 'Owen? Okay. I\'m going around back. Stay right there.' },
        { narrate: 'His flashlight went away along the side of the house. I didn\'t hear him again.' },
        { exit: 'left' },
        { set: 'realCopGone' },
        { goto: 'foyer' }
      ] },
      back: false
    }
  };
})();
