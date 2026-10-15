/*
 * Act two's tail and act three's first humans (night.js puts them in order).
 *   liaison    Lt. Col. D. Brandt, Defense liaison   legit     (let through; on the list, red herring)
 *   hippie     "journalist", the Free Press           intruder  (1960s; shoot or turn away)
 *   viking     Greg, in character as "Gunnar"         legit     (let through; red herring)
 *   wife       Carla Dunn, wife of lab tech Pete Dunn legit     (let through)
 *   professor  Prof. E. Harrow, emeritus              legit     (let through; on the list, red herring)
 *   roman      "Quintus Varro, consultant"            intruder  (ancient Rome; shoot or turn away)
 */
(function () {
  var E = window.EMIT, C = E.content.characters, V = E.content.visitors, K = E.art.kit, P = K.P;
  var R = K.R, El = K.El, poly = K.poly, D = K.D;

  C.liaison = { name: 'Lt. Col. D. Brandt', notebookName: 'Lt. Col. D. Brandt, Defense liaison', portrait: 'liaison' };
  C.hippie = { name: 'Skip Lowell', notebookName: 'Skip Lowell, "the Free Press" (peace-sign jacket)', portrait: 'hippie' };
  C.viking = { name: 'Gunnar', notebookName: 'Greg, the Viking ("Gunnar")', portrait: 'viking' };
  C.wife = { name: 'Carla Dunn', notebookName: 'Carla Dunn, Pete Dunn\'s wife', portrait: 'wife' };
  C.professor = { name: 'Prof. E. Harrow', notebookName: 'Prof. E. Harrow, emeritus (physics)', portrait: 'professor' };
  C.roman = { name: 'Quintus Varro', notebookName: 'Quintus Varro, "consultant, from Rome"', portrait: 'roman' };

  function legitShot(id, line, note, why) {
    return { steps: [
      { sfx: 'gunshot' },
      { exit: 'fall' },
      { backdrop: 'body' },
      { narrate: line },
      { note: [id, note] },
      { reset: why || 'You shot a legitimate visitor.' }
    ] };
  }

  /* ================= Lt. Col. D. Brandt, Defense liaison (legit, red herring) ================= */
  V.liaison = {
    id: 'liaison',
    truth: 'legit',
    prompt: 'He stands like the floor owes him money. The gun on his hip is not a costume.',
    arrive: [
      { crt: ['CAM 02 LOT', '> VEHICLE: SEDAN', '> GOV PLATES'] },
      { narrate: 'A dark sedan with government plates. The driver stayed in the car with the engine running.' },
      { sfx: 'door' },
      { enter: 'liaison' }
    ],
    greeting: [
      { who: 'liaison', say: 'Brennan.' },
      { narrate: 'He read it off my name tag without moving his eyes. Then he waited, like I was the one who was late.' }
    ],
    inspect: [
      { title: 'Shoulder boards', zoom: 'liaisonInsignia', x: 202, y: 100, w: 26, h: 12,
        text: 'A silver oak leaf on each shoulder. Lieutenant colonel. Sewn on straight, worn at the edges.',
        note: 'Silver oak leaf on his shoulders: lieutenant colonel. The real thing, a little worn.' },
      { title: 'Ribbons', zoom: 'liaisonRibbons', x: 260, y: 112, w: 24, h: 18,
        text: 'Three rows of ribbons and a name plate: BRANDT. One of them is the sand-coloured one they handed out after the Gulf.',
        note: 'Ribbon rack and name plate, BRANDT. One ribbon from the Gulf.' },
      { title: 'Sidearm', zoom: 'liaisonSidearm', x: 260, y: 192, w: 20, h: 24,
        text: 'A Beretta in a flap holster. Standard issue. The holster leather is creased from years of sitting in cars.',
        note: 'Beretta sidearm, standard issue, in a well-used holster.' },
      { title: 'ID card', zoom: 'liaisonId', x: 194, y: 200, w: 22, h: 18,
        text: 'Armed Forces ID, green, laminated. Photo matches, scowl and all. Expires in two years.',
        note: 'Green Armed Forces ID card. Photo matches. Current.' },
      { title: 'Briefcase', zoom: 'liaisonCase', x: 280, y: 208, w: 32, h: 32,
        text: 'Black leather, combination locks, a red-striped folder corner pinched in the lid.',
        note: 'Locked briefcase. A red-striped folder caught in the lid.' }
    ],
    opening: {
      name: [
        { who: 'liaison', say: 'Brandt. Lieutenant Colonel. Defense liaison.' },
        { narrate: 'He held up a green ID card between two fingers and didn\'t let go of it.' },
        { note: ['liaison', 'Lt. Col. D. Brandt, Defense liaison. Showed his ID without being asked.'] }
      ],
      want: [
        { who: 'liaison', say: 'Dr. Kane. Two o\'clock.' },
        { narrate: 'I asked what about.' },
        { who: 'liaison', say: 'That\'s classified.' },
        { note: ['liaison', 'Here to see Kane at two. What about: "That\'s classified."'] }
      ],
      how: [
        { who: 'liaison', say: 'Motor pool sedan, from the base. Forty minutes. Your access road needs paving.' },
        { note: ['liaison', 'Came by motor pool sedan from the base. Complained about the access road.'] }
      ]
    },
    questions: [
      { id: 'morse', ask: 'There\'s Morse on my radio, Colonel. Know what it is?', requires: 'now:heardMorse', steps: [
        { narrate: 'He listened for four seconds. His jaw did something.' },
        { who: 'liaison', say: 'Prisoner escaped. Repeating.' },
        { who: 'liaison', say: 'That\'s not a ham operator, son. That\'s a facility talking to someone who\'s meant to be listening.' },
        { who: 'liaison', say: 'Turn it off. Or don\'t. Either way, you didn\'t hear it from me.' },
        { note: ['liaison', 'Brandt decoded the shortwave Morse: PRISONER ESCAPED. Says it\'s a facility signalling someone.'] },
        { learn: 'morseDecoded' }
      ] },
      { id: 'list', ask: 'Let me check the list.', requires: 'saw:desk.list', steps: [
        { 'if': 'run:hasList', then: [
          { narrate: 'Lt. Col. D. Brandt, Defense liaison. Right there in Kane\'s hand.' },
          { who: 'liaison', say: 'Then we\'re done here.' },
          { note: ['liaison', 'On Kane\'s visitor list: Lt. Col. D. Brandt, Defense liaison.'] }
        ], 'else': [
          { narrate: 'There was no list on the desk this time.' }
        ] }
      ] },
      { id: 'case', ask: 'What\'s in the case?', requires: 'saw:liaisonCase', steps: [
        { who: 'liaison', say: 'That\'s classified.' },
        { narrate: 'Second time. He said it the way other people say "excuse me".' },
        { note: ['liaison', 'Wouldn\'t say what\'s in his briefcase. "That\'s classified."'] }
      ] },
      { id: 'gun', ask: 'You can\'t carry that in here.', requires: 'saw:liaisonSidearm', steps: [
        { who: 'liaison', say: 'I can. I\'m on federal business in a building with a federal contract.' },
        { who: 'liaison', say: 'You\'ve got one in your drawer, Brennan. Second drawer, left side. We\'re even.' },
        { narrate: 'Second drawer, left side. He\'d been here before, or he\'d read a file.' },
        { note: ['liaison', 'Keeps his sidearm. Knew I keep a revolver in the second drawer.'] }
      ] },
      { id: 'ribbons', ask: 'The Gulf?', requires: 'saw:liaisonRibbons', steps: [
        { who: 'liaison', say: 'A hundred hours of it. Most of the rest I can\'t talk about.' },
        { narrate: 'He didn\'t say it to impress me. He said it so I\'d stop asking.' },
        { note: ['liaison', 'Served in the Gulf. Won\'t talk about the rest.'] }
      ] },
      { id: 'id', ask: 'Mind if I look at that ID properly?', requires: 'saw:liaisonId', steps: [
        { narrate: 'He laid it on the counter. Green card, laminated, his scowl ten years younger. Not the kind of thing you fake at a copy shop.' },
        { who: 'liaison', say: 'Satisfied?' },
        { note: ['liaison', 'Let me check his ID properly. Everything in order.'] }
      ] },
      { id: 'kessler', ask: 'Is this about Kessler Dynamics?', requires: 'now:heardKessler', steps: [
        { who: 'liaison', say: '...' },
        { who: 'liaison', say: 'Who said that name to you?' },
        { narrate: 'For the first time he looked at me instead of through me. I said I\'d heard it around.' },
        { who: 'liaison', say: 'Stop hearing it.' },
        { note: ['liaison', 'Mentioned Kessler Dynamics. He wanted to know who told me. Defense is watching Kessler too.'] }
      ] }
    ],
    actions: {
      letThrough: { steps: [
        { narrate: 'I buzzed the stairwell door. He went up at a march, briefcase first.' },
        { exit: 'walk' },
        { narrate: 'Out in the lot, the sedan\'s engine kept running.' },
        { note: ['liaison', 'Let him up. On the list, gruff, entirely real.'] }
      ] },
      turnAway: { steps: [
        { narrate: 'I told him Dr. Kane wasn\'t seeing anyone else tonight.' },
        { who: 'liaison', say: 'You\'re making a note of the time, I hope. Because I am.' },
        { exit: 'walk' },
        { narrate: 'He didn\'t slam the door. Men like him don\'t need to.' },
        { note: ['liaison', 'Turned him away. He was on the list. He\'ll be back, and he\'ll bring rank.'] }
      ] },
      shoot: legitShot('liaison',
        'He went for his own sidearm on the way down. He was faster than me at everything except that.',
        'I shot a Defense liaison who was on the list. The men from the sedan came in after that.',
        'You shot a Defense liaison who was on the list.')
    },
    returnArrive: [
      { crt: ['CAM 02 LOT', '> VEHICLE: SEDAN', '> GOV PLATES'] },
      { sfx: 'door' },
      { narrate: 'The sedan was back. This time the driver got out too, and stood by the door with his hands folded.' },
      { enter: 'liaison' }
    ],
    returnGreeting: [
      { who: 'liaison', say: 'Brennan. I\'ve had the Pentagon on the car phone for twenty minutes about you.' },
      { who: 'liaison', say: 'I\'m going upstairs. You can let me, or you can explain to a general why you didn\'t.' }
    ]
  };

  /* ================= "Journalist" in a peace-sign jacket (intruder, 1960s) ================= */
  V.hippie = {
    id: 'hippie',
    truth: 'intruder',
    prompt: 'He smiles at the security camera like it\'s an old friend.',
    arrive: [
      { crt: ['CAM 01 LOBBY', '> MOTION: 1', '> REC'] },
      { narrate: 'No car in the lot. He came out of the rain on foot, a fringed jacket, a camera on his chest and his hair in a headband.' },
      { sfx: 'door' },
      { enter: 'hippie' }
    ],
    greeting: [
      { who: 'hippie', say: 'Evening, brother. Peace. I\'m here for the big announcement.' },
      { who: 'hippie', say: 'Covering it for the Free Press. Point me at the scientist and I\'ll be out of your hair.' },
      { learn: 'metHippie' }
    ],
    inspect: [
      { title: 'Press pass', zoom: 'hippiePass', x: 264, y: 108, w: 18, h: 14,
        text: 'PRESS, tucked in his pocket. The masthead says FREE PRESS. Up in the corner, the cover price: 10¢.',
        note: 'Press pass for the Free Press, cover price 10 cents. That paper folded decades ago.' },
      { title: 'Peace patch', zoom: 'hippiePatch', x: 208, y: 116, w: 20, h: 16,
        text: 'A peace sign stitched on the suede. The thread is bright and tight. The jacket\'s scuffed all round it, the patch isn\'t.',
        note: 'Peace-sign patch on his jacket. The stitching looks new.' },
      { title: 'Camera', zoom: 'hippieCamera', x: 234, y: 124, w: 30, h: 22,
        text: 'A 35mm SLR, film counter on 12. Lots of photographers still swear by these. Nothing wrong with it.',
        note: 'A 35mm film camera. Plenty of press still use them.' },
      { title: 'Notepad', zoom: 'hippieNotepad', x: 192, y: 198, w: 22, h: 22,
        text: 'A reporter\'s pad. At the top, a contact number: KL5-2207. Letters first, like on my grandmother\'s phone.',
        note: 'His notepad has a contact number KL5-2207, letters first. Old exchange-style number.' },
      { title: 'Right hand', zoom: 'hippieQuarter', x: 286, y: 200, w: 18, h: 16,
        text: 'A quarter, held out between two fingers like a tip.',
        note: 'He\'s holding out a quarter.' }
    ],
    opening: {
      name: [
        { who: 'hippie', say: 'Skip. Skip Lowell. Free Press. You\'ve read me, man, you just don\'t know it.' },
        { note: ['hippie', 'Calls himself Skip Lowell, of the Free Press.'] }
      ],
      want: [
        { who: 'hippie', say: 'Ten minutes with the scientist. The people have a right to know what\'s going on up there.' },
        { who: 'hippie', say: 'Time, man. The big one. Everybody\'s talking about it.' },
        { note: ['hippie', 'Wants an interview about "the big announcement". Says everybody\'s talking about it.'] }
      ],
      how: [
        { who: 'hippie', say: 'Thumbed a ride out from the city. Nice cat, had a Beetle, gave me half his sandwich.' },
        { note: ['hippie', 'Hitchhiked from the city in a Beetle.'] }
      ]
    },
    questions: [
      { id: 'wire', ask: 'Who told you about an announcement?', requires: 'saw:hippiePass', steps: [
        { who: 'hippie', say: 'It\'s all over the wire, man. Rang off the teletype at the office all night.' },
        { narrate: 'Kane hadn\'t announced anything to anyone. Channel 7 only knew because he\'d booked them himself.' },
        { note: ['hippie', 'Says the announcement is "all over the wire". Nothing has been announced.'] }
      ] },
      { id: 'pass', ask: 'The Free Press. Haven\'t seen that on a newsstand in a while.', requires: 'saw:hippiePass', steps: [
        { who: 'hippie', say: 'Every corner, brother. Ten cents. Best dime you\'ll spend.' },
        { narrate: 'The Free Press folded before I was old enough to read it. And nothing on a newsstand has cost a dime in a long time.' },
        { note: ['hippie', 'Says the Free Press sells on every corner for ten cents. It folded decades ago.'] }
      ] },
      { id: 'quarter', ask: 'What\'s the quarter for?', requires: 'saw:hippieQuarter', steps: [
        { who: 'hippie', say: 'For a coffee, if you\'ve got a pot going. Keep the change. I\'m feeling generous.' },
        { narrate: 'The machine down the hall wants seventy-five cents and gives you mud.' },
        { narrate: 'He pressed it into my hand anyway. I put it in my pocket, but the face on it looked familiar.' },
        { set: 'gotQuarter' },
        { note: ['hippie', 'Gave me a quarter for a coffee and told me to keep the change. It\'s in my pocket. The face on it looked familiar.'] }
      ] },
      { id: 'email', ask: 'Got an email address? In case Dr. Kane wants to reach you.', requires: 'saw:hippieNotepad', steps: [
        { who: 'hippie', say: 'My what?' },
        { who: 'hippie', say: 'Just ring the office. KLondike five, two-two-oh-seven. Ask for Skip.' },
        { narrate: 'Channel 7 had a fax number on her card. This one gave me a telephone exchange.' },
        { note: ['hippie', 'Didn\'t know what email was. Gave me a phone number with an exchange name, KLondike 5.'] },
        { set: 'callOffer:hippie' }
      ] },
      { id: 'callOffice', ask: 'I\'ll ring your office. Ask for Skip, you said.', requires: 'run:callOffer:hippie', steps: [
        { narrate: 'I dialled KL5-2207 on the desk phone. The K and the L were a five and a five. I checked twice.' },
        { narrate: 'Three rising tones, then a woman on tape: the number you have dialed is not in service.' },
        { who: 'hippie', say: 'Huh. They must be on deadline, man. Nobody picks up on deadline.' },
        { note: ['hippie', 'Rang his office, KLondike 5-2207. "The number you have dialed is not in service."'] }
      ] },
      { id: 'patch', ask: 'Nice patch. Vintage?', requires: 'saw:hippiePatch', steps: [
        { who: 'hippie', say: 'Vintage? Sewed it on last week. You into the movement?' },
        { narrate: 'Which movement, I didn\'t ask.' },
        { note: ['hippie', 'The peace patch isn\'t vintage to him. "Sewed it on last week."'] }
      ] },
      { id: 'camera', ask: 'What are you shooting on?', requires: 'saw:hippieCamera', steps: [
        { who: 'hippie', say: 'Tri-X, pushed for the rain. You can\'t catch history in colour, man. Colour lies.' },
        { note: ['hippie', 'Shoots black-and-white film. Knows his camera.'] }
      ] },
      { id: 'list', ask: 'You\'re not on Dr. Kane\'s list.', requires: 'saw:desk.list', steps: [
        { who: 'hippie', say: 'Lists are how the Man keeps the people out, brother. Freedom of the press.' },
        { narrate: 'The Channel 7 woman was on the list. The Free Press wasn\'t. Nobody\'s put the Free Press on a list in a long time.' },
        { note: ['hippie', 'Not on the visitor list. Channel 7 was. "Lists are how the Man keeps the people out."'] }
      ] },
      { id: 'year', ask: 'Skip. What year do you think it is?', requires: 'metHippie', steps: [
        { who: 'hippie', say: 'Ha. Heavy question, man.' },
        { who: 'hippie', say: '...The year it all changes. That\'s the only year that matters.' },
        { narrate: 'He didn\'t say a number. He looked at the clock over my head like it might help.' },
        { note: ['hippie', 'Asked him what year it was. Wouldn\'t give a number.'] }
      ] }
    ],
    actions: {
      letThrough: { steps: [
        { narrate: 'I let him up. He flashed me a peace sign on the stairs.' },
        { exit: 'walk' },
        { pause: 800 },
        { sfx: 'distant' },
        { narrate: 'A camera flash on the fourth floor was the last small light. The big one came after.' },
        { note: ['hippie', 'Let him up. He wasn\'t press. Not from any decade with me in it.'] },
        { reset: 'You let a man from the sixties through.' }
      ] },
      turnAway: { steps: [
        { narrate: 'I told him the doctor wasn\'t talking to the press tonight.' },
        { who: 'hippie', say: 'That\'s cool. That\'s cool. History doesn\'t need a press pass, brother.' },
        { exit: 'walk' },
        { 'if': '!run:gotQuarter', then: [
          { narrate: 'He left his quarter on the counter. I didn\'t pick it up.' }
        ] },
        { note: ['hippie', 'Turned him away. He went peacefully.'] }
      ] },
      shoot: { steps: [
        { sfx: 'gunshot' },
        { exit: 'fall' },
        { backdrop: 'body' },
        { narrate: 'The camera hit the floor and the back sprang open. The film inside had never been exposed.' },
        { narrate: 'His press pass said ten cents. That was about what it was worth.' },
        { note: ['hippie', 'Shot him. His camera had never taken a picture of anything.'] }
      ] }
    }
  };

  /* ================= Viking cosplayer, Greg as "Gunnar" (legit, red herring) ================= */
  V.viking = {
    id: 'viking',
    truth: 'legit',
    prompt: 'He is enormous, damp and clearly enjoying himself. The axe bends when he leans on it.',
    arrive: [
      { crt: ['CAM 01 LOBBY', '> MOTION: 1', '> OBJ: HORNS?'] },
      { narrate: 'Something with horns came across the lot at a jog. The camera wasn\'t sure what it was. Neither was I.' },
      { sfx: 'door' },
      { enter: 'viking' }
    ],
    greeting: [
      { who: 'viking', say: 'HAIL, gatekeeper! Gunnar Ironbeard seeks passage to the halls of his kin!' },
      { narrate: 'The axe hit the counter with a sound like a pool noodle.' }
    ],
    inspect: [
      { title: 'Helmet', zoom: 'vikingHelmet', x: 212, y: 18, w: 74, h: 34,
        text: 'A horned helmet. The horns are plastic, hot-glued on. Real Vikings never wore horns. Somebody should tell him.',
        note: 'Horned helmet, plastic horns hot-glued on.' },
      { title: 'Axe', zoom: 'vikingAxe', x: 172, y: 82, w: 28, h: 46,
        text: 'Grey paint over foam, duct tape on the handle, an orange zip tie round the head.',
        note: 'Foam axe, duct-taped handle, orange zip tie on the head.' },
      { title: 'Lanyard', zoom: 'vikingLanyard', x: 238, y: 128, w: 22, h: 20,
        text: 'A convention badge. MIDWINTERCON, OCT 12-14, the Ramada on Route 9. Name: GREG P. This weekend.',
        note: 'Convention lanyard: MidwinterCon, Oct 12-14, the Ramada. Name GREG P. This weekend.' },
      { title: 'Wrist', zoom: 'vikingWatch', x: 284, y: 192, w: 20, h: 12,
        text: 'Under the fur bracer, a calculator watch. Tiny buttons, rubber strap. Every kid in my nephew\'s class wants one.',
        note: 'Calculator watch under his fur bracer.' }
    ],
    opening: {
      name: [
        { who: 'viking', say: 'I am Gunnar, son of Thorvald, scourge of the northern—' },
        { narrate: 'I gave him a look. He gave up the ghost.' },
        { who: 'viking', say: '...Greg. Greg Pappas. Sorry. It\'s been a long day in character.' },
        { note: ['viking', 'Calls himself Gunnar, then admits he\'s Greg Pappas.'] }
      ],
      want: [
        { who: 'viking', say: 'Sorry, con\'s down the street. My cousin works here and has my car keys.' },
        { who: 'viking', say: 'Dana Holt. Lab three. She drove me over this morning and took the keys up with her.' },
        { note: ['viking', 'Says his cousin Dana Holt, Lab 3, has his car keys.'] }
      ],
      how: [
        { who: 'viking', say: 'Walked from the Ramada. Route 9\'s a river past the Texaco, so I cut across the parking lots.' },
        { note: ['viking', 'Walked from the Ramada. Knows Route 9 is flooded by the Texaco.'] }
      ]
    },
    questions: [
      { id: 'con', ask: 'What\'s MidwinterCon?', requires: 'saw:vikingLanyard', steps: [
        { who: 'viking', say: 'Sci-fi and fantasy, three days. Dealers\' room, a Klingon wedding, a guy who was on Star Trek once.' },
        { who: 'viking', say: 'I placed third in the costume contest. Lost to a Ghostbuster.' },
        { note: ['viking', 'MidwinterCon is a sci-fi convention at the Ramada this weekend. He came third in the costume contest.'] }
      ] },
      { id: 'horns', ask: 'Vikings didn\'t wear horns, you know.', requires: 'saw:vikingHelmet', steps: [
        { who: 'viking', say: 'I KNOW. Tell the judges. You show up historically accurate, you lose to a Ghostbuster.' },
        { note: ['viking', 'Knows Vikings didn\'t wear horns. Wore them for the judges.'] }
      ] },
      { id: 'axe', ask: 'That axe real?', requires: 'saw:vikingAxe', steps: [
        { who: 'viking', say: 'Foam. The zip tie means it\'s been peace-bonded. Con rules, no real weapons.' },
        { narrate: 'He bonked himself on the head with it to prove it. The helmet rang hollow.' },
        { note: ['viking', 'Foam axe, peace-bonded with a zip tie for the con.'] }
      ] },
      { id: 'watch', ask: 'Nice watch, Gunnar.', requires: 'saw:vikingWatch', steps: [
        { who: 'viking', say: 'Don\'t laugh. It\'s how I keep track of hit points.' },
        { narrate: 'I didn\'t know what a hit point was. I knew the watch. Every kid wanted one.' },
        { note: ['viking', 'Calculator watch. Uses it to "keep track of hit points".'] }
      ] },
      { id: 'cousin', ask: 'Your cousin isn\'t on my visitor list.', requires: 'saw:desk.list', steps: [
        { who: 'viking', say: 'She\'s not a visitor, man, she works here. Night crew, lab three. Short, glasses, laughs like a goose.' },
        { narrate: 'I flipped the Rolodex. HOLT, D. Lab 3. Night crew. Extension 3318.' },
        { note: ['viking', 'His cousin isn\'t a visitor. Dana Holt is in the Rolodex: Lab 3, night crew, ext. 3318.'] },
        { set: 'callOffer:viking' }
      ] },
      { id: 'callDana', ask: 'Let me ring Dana Holt in Lab 3.', requires: 'run:callOffer:viking', steps: [
        { narrate: 'HOLT, D. in the Rolodex. Extension 3318. I dialled it from the desk phone.' },
        { narrate: 'A man picked up with a lot of machinery behind him. Holt was in the clean room, gowned to the eyes.' },
        { narrate: 'Nobody comes out of there to answer a phone, he said. He\'d leave her a note. He hung up.' },
        { who: 'viking', say: 'Clean room. Yeah. She does that. Comes out looking like a marshmallow.' },
        { note: ['viking', 'Rang Lab 3, ext. 3318. Dana Holt was in the clean room. Couldn\'t come to the phone.'] }
      ] }
    ],
    actions: {
      letThrough: { steps: [
        { narrate: 'I sent him up to Lab 3. He saluted me with the axe on his way to the stairs.' },
        { exit: 'walk' },
        { pause: 600 },
        { narrate: 'Five minutes later he came back down jingling a set of Ford keys and wished me a mighty Valhalla.' },
        { note: ['viking', 'Let him up. He got his keys and left. Just a guy in horns.'] }
      ] },
      turnAway: { steps: [
        { narrate: 'I told him nobody goes upstairs tonight. Not even Vikings.' },
        { who: 'viking', say: 'Aw, come on. It\'s a two-mile walk back in a fur cape.' },
        { exit: 'walk' },
        { narrate: 'He trudged out into the rain. The horns drooped a little.' },
        { note: ['viking', 'Turned him away. He\'ll be back, wetter. He still needs those keys.'] }
      ] },
      shoot: legitShot('viking',
        'The helmet rolled to the door. The axe bounced once, because it was foam. It was always foam.',
        'I shot a man in a foam costume. His cousin came down from Lab 3 and screamed.',
        'You shot a man in a Viking costume. He was exactly who he said he was.')
    },
    returnArrive: [
      { crt: ['CAM 01 LOBBY', '> MOTION: 1', '> OBJ: HORNS'] },
      { sfx: 'door' },
      { narrate: 'The Viking was back. The cape had soaked up about half the rain in the county.' },
      { enter: 'viking' }
    ],
    returnGreeting: [
      { who: 'viking', say: 'Okay. I\'m not Gunnar anymore. I\'m a cold guy named Greg who wants his car keys.' },
      { who: 'viking', say: 'Please. Call Dana. Lab three. I\'ll stand right here and drip.' },
      { set: 'callOffer:viking' }
    ]
  };

  /* ================= Carla Dunn, wife of lab tech Pete Dunn (legit) ================= */
  V.wife = {
    id: 'wife',
    truth: 'legit',
    prompt: 'She has been crying, or driving with the window down. Probably both.',
    arrive: [
      { crt: ['CAM 02 LOT', '> VEHICLE: WAGON', '> REC'] },
      { narrate: 'A station wagon pulled in crooked next to a blue Corolla under the lot light. The woman who got out slammed the door twice.' },
      { sfx: 'door' },
      { enter: 'wife' }
    ],
    greeting: [
      { who: 'wife', say: 'You\'re Lou, right? Pete says you do the crossword in pen.' },
      { who: 'wife', say: 'He locked his keys in the car. Again. At three in the morning. I brought the spare.' }
    ],
    inspect: [
      { title: 'Keys', zoom: 'wifeKeys', x: 194, y: 210, w: 24, h: 22,
        text: 'A Toyota key and a house key on a ring, with a paper tag in a woman\'s hand: PETE SPARE, x4410.',
        note: 'Spare Toyota key, tagged PETE SPARE, x4410.' },
      { title: 'Ring', zoom: 'wifeRing', x: 194, y: 196, w: 20, h: 12,
        text: 'A plain gold wedding band, a little tight. Eleven years of dishwater.',
        note: 'Plain gold wedding ring, worn.' },
      { title: 'Thermos', zoom: 'wifeThermos', x: 284, y: 194, w: 20, h: 34,
        text: 'A dented steel thermos with a red cap. Still hot. Somebody\'s getting coffee and a lecture.',
        note: 'Dented steel thermos of coffee.' },
      { title: 'Hospital badge', zoom: 'wifeBadge', x: 254, y: 112, w: 18, h: 16,
        text: 'ST. MARY\'S, C. DUNN, RN. Clipped to her scrubs under the raincoat. She came straight from a shift.',
        note: 'Hospital ID: St. Mary\'s, C. Dunn, RN. Came from a shift.' }
    ],
    opening: {
      name: [
        { who: 'wife', say: 'Carla Dunn. My husband\'s Pete Dunn. He\'s a tech up on four.' },
        { note: ['wife', 'Carla Dunn, wife of Pete Dunn, a lab tech on the fourth floor.'] }
      ],
      want: [
        { who: 'wife', say: 'He called from the lab at one. Locked the keys in with the engine off, thank God. I brought the spare.' },
        { who: 'wife', say: 'I just want to hand them over and see his face. Two minutes.' },
        { note: ['wife', 'Bringing Pete his spare car keys. He called her from the lab at one.'] },
        { set: 'callOffer:wife' }
      ],
      how: [
        { who: 'wife', say: 'Drove. Straight from the hospital. Route 9\'s closed at the Texaco, so I went round by the mall.' },
        { note: ['wife', 'Drove from the hospital. Route 9 closed at the Texaco.'] }
      ]
    },
    questions: [
      { id: 'car', ask: 'What does he drive?', requires: 'saw:wifeKeys', steps: [
        { who: 'wife', say: 'An \'89 Corolla. Blue. Dented back bumper, he backed into our mailbox in June.' },
        { narrate: 'There was a blue Corolla under the lot light, back bumper pushed in like a thumbprint.' },
        { note: ['wife', 'Pete drives a blue \'89 Corolla with a dented back bumper. It\'s in the lot.'] }
      ] },
      { id: 'ext', ask: 'Let me ring Pete upstairs.', requires: function (g) {
        return g.test('saw:wife.wifeKeys') || g.test('run:callOffer:wife');
      }, steps: [
        { 'if': 'saw:wife.wifeKeys', then: [
          { narrate: 'I dialled the extension on the tag, 4410. It rang twice.' }
        ], 'else': [
          { narrate: 'DUNN, P. in the Rolodex. Fourth floor, extension 4410. I dialled it. It rang twice.' }
        ] },
        { narrate: 'A tired man said "Dunn," like he knew exactly who was downstairs. I said his wife was here. He said a word I won\'t write down.' },
        { who: 'wife', say: 'That\'s him. He says that every time.' },
        { note: ['wife', 'Rang extension 4410. Pete Dunn picked up and knew she was coming.'] }
      ] },
      { id: 'badge', ask: 'Coming off a shift?', requires: 'saw:wifeBadge', steps: [
        { who: 'wife', say: 'Twelve hours in the ER. Two car wrecks and a kid who swallowed a Lego. And now this.' },
        { note: ['wife', 'ER nurse at St. Mary\'s, coming off a twelve-hour shift.'] }
      ] },
      { id: 'thermos', ask: 'Brought him coffee too?', requires: 'saw:wifeThermos', steps: [
        { who: 'wife', say: 'He forgot that too. He remembers every formula and none of our anniversaries.' },
        { note: ['wife', 'Brought Pete coffee. He forgets anniversaries.'] }
      ] },
      { id: 'ring', ask: 'How long have you two been married?', requires: 'saw:wifeRing', steps: [
        { who: 'wife', say: 'Eleven years in May. Elks Lodge. Pete wore a rented tux and sneakers.' },
        { note: ['wife', 'Married eleven years in May, at the Elks Lodge.'] }
      ] }
    ],
    actions: {
      letThrough: { steps: [
        { narrate: 'I buzzed her through to the elevator. She thanked me like I\'d pulled someone out of a river.' },
        { exit: 'walk' },
        { narrate: 'Ten minutes later the blue Corolla\'s dome light came on, then off. Somebody had their keys back.' },
        { note: ['wife', 'Let her up. Pete got his keys and his coffee.'] }
      ] },
      turnAway: { steps: [
        { narrate: 'I told her I couldn\'t let anyone up tonight. I offered to take the keys.' },
        { who: 'wife', say: 'You\'re kidding. After twelve hours? He\'s right upstairs.' },
        { exit: 'walk' },
        { narrate: 'She took the keys with her. Some things you hand over in person.' },
        { note: ['wife', 'Turned her away. She kept the keys. She\'ll be back.'] }
      ] },
      shoot: legitShot('wife',
        'The keys hit the floor first. Up on four, a phone started ringing at extension 4410 and nobody answered it.',
        'I shot Pete Dunn\'s wife. She was holding his car keys.',
        'You shot a nurse who came to drop off her husband\'s keys.'),
      shutdown: { steps: [
        { narrate: 'I pointed Kane\'s grey box at her and pressed the button. It clicked. Nothing else did.' },
        { who: 'wife', say: 'Is that a garage door opener? Pete, what kind of place is this.' },
        { note: ['wife', 'Tried the device on her. Nothing. She thought it was a garage door opener.'] }
      ] }
    },
    returnArrive: [
      { crt: ['CAM 02 LOT', '> VEHICLE: WAGON', '> REC'] },
      { sfx: 'door' },
      { narrate: 'The station wagon was back. So was Carla Dunn, with her jaw set and the keys in her fist.' },
      { enter: 'wife' }
    ],
    returnGreeting: [
      { who: 'wife', say: 'He called me again. He\'s stuck here till his shift ends and I\'m on again at seven.' },
      { who: 'wife', say: 'Two minutes, Lou. I\'m not leaving these with a man who locked them in a car.' },
      { set: 'callOffer:wife' }
    ]
  };

  /* ================= Prof. E. Harrow, emeritus (legit, red herring) ================= */
  V.professor = {
    id: 'professor',
    truth: 'legit',
    prompt: 'He leans on the counter like it is an old friend, and checks his pocket watch twice.',
    arrive: [
      { crt: ['CAM 02 LOT', '> VEHICLE: TAXI', '> REC'] },
      { narrate: 'A taxi idled at the kerb while an old man in a cardigan got out one careful leg at a time.' },
      { sfx: 'door' },
      { enter: 'professor' }
    ],
    greeting: [
      { who: 'professor', say: 'I say, young man. Good evening. Or good morning, I suppose, at this hour.' },
      { who: 'professor', say: 'Harrow, to see Dr. Kane. He\'s expecting me, though I dare say he\'s forgotten.' }
    ],
    inspect: [
      { title: 'Pocket watch', zoom: 'professorWatch', x: 284, y: 196, w: 20, h: 20,
        text: 'A gold pocket watch, lid open. Inside the lid: "For 40 years of service. Dept. of Physics." Dated four Junes ago.',
        note: 'Gold pocket watch. Engraved inside: "For 40 years of service", a retirement gift from a few years back.' },
      { title: 'Cane', zoom: 'professorCane', x: 194, y: 196, w: 18, h: 50,
        text: 'Plain hickory with a rubber tip. The grip is worn pale and taped where his hand goes. Years of leaning on it.',
        note: 'Plain wooden cane, rubber tip, grip worn smooth and taped. Old and used.' },
      { title: 'Cardigan pocket', zoom: 'professorJournal', x: 262, y: 174, w: 22, h: 24,
        text: 'A journal rolled into his pocket. Physical Review Letters. Last month\'s issue, dog-eared, his name on the mailing label.',
        note: 'Last month\'s Physical Review Letters rolled in his pocket, his name on the label.' },
      { title: 'Ear', zoom: 'professorEar', x: 222, y: 62, w: 14, h: 18,
        text: 'A beige hearing aid behind his ear, the kind with a little battery door. The volume wheel is turned right down.',
        note: 'Beige hearing aid, turned down.' }
    ],
    opening: {
      name: [
        { who: 'professor', say: 'Harrow. Edmund Harrow. Professor emeritus, which is Latin for "please stop coming in".' },
        { note: ['professor', 'Prof. Edmund Harrow, emeritus. Very old-fashioned way of talking.'] }
      ],
      want: [
        { who: 'professor', say: 'Kane wants a second pair of eyes on some figures. Old eyes, but they\'ve read a great many figures.' },
        { who: 'professor', say: 'He telephoned on Tuesday. Most insistent. I gather tonight is rather a big night.' },
        { note: ['professor', 'Kane telephoned him Tuesday to check some figures tonight.'] }
      ],
      how: [
        { who: 'professor', say: 'A taxicab. Yellow, smelling of pine trees. The driver had a great many opinions about the mayor.' },
        { note: ['professor', 'Came by taxi. It\'s waiting in the lot.'] }
      ]
    },
    questions: [
      { id: 'list', ask: 'Let me check the list.', requires: 'saw:desk.list', steps: [
        { 'if': 'run:hasList', then: [
          { narrate: 'There, near the bottom: Prof. E. Harrow, Emeritus, Physics.' },
          { who: 'professor', say: 'Splendid. I do so like being expected.' },
          { note: ['professor', 'On Kane\'s visitor list: Prof. E. Harrow, Emeritus, Physics.'] }
        ], 'else': [
          { narrate: 'There was no list on the desk this time.' }
        ] }
      ] },
      { id: 'watch', ask: 'Fine watch. Old?', requires: 'saw:professorWatch', steps: [
        { who: 'professor', say: 'Rather newer than its owner. The department gave it to me when they put me out to pasture.' },
        { who: 'professor', say: 'Forty years, and they gave me a device for counting the time I have left. Physicists have no tact.' },
        { narrate: 'Same kind of watch as the man in the three-piece suit. Different engraving. That was the whole difference.' },
        { note: ['professor', 'The watch was his retirement gift. Read the engraving, not just the watch.'] }
      ] },
      { id: 'journal', ask: 'What are you reading?', requires: 'saw:professorJournal', steps: [
        { who: 'professor', say: 'Last month\'s Physical Review. A young fellow at Berkeley timing photons as they tunnel through a barrier.' },
        { who: 'professor', say: 'He claims they arrive early. Faster than light, if you squint. He\'s wrong, but he\'s wrong beautifully.' },
        { note: ['professor', 'Knows last month\'s physics journal in detail: photon tunnelling, "faster than light, if you squint".'] }
      ] },
      { id: 'cane', ask: 'Need a hand with the stairs?', requires: 'saw:professorCane', steps: [
        { who: 'professor', say: 'I\'ve climbed stairs since Roosevelt, young man. The second one. Point me at the elevator.' },
        { note: ['professor', 'Very old, and proud of it. Wants the elevator.'] }
      ] },
      { id: 'ear', ask: 'Can you hear me all right?', requires: 'saw:professorEar', steps: [
        { who: 'professor', say: 'Beg pardon?' },
        { pause: 500 },
        { who: 'professor', say: 'Ha. The battery\'s new. I hear perfectly well. I simply prefer not to, at faculty meetings.' },
        { note: ['professor', 'Hearing aid turned down on purpose. Sharp as a tack.'] }
      ] },
      { id: 'gent', ask: 'Last man in here with a pocket watch was a long way from home.', requires: 'now:metGent', steps: [
        { who: 'professor', say: 'Then he had excellent taste and poor timing.' },
        { narrate: 'He snapped the lid shut and held up the face. It matched the lobby clock to the minute.' },
        { note: ['professor', 'His watch keeps the right time, to the minute.'] }
      ] }
    ],
    actions: {
      letThrough: { steps: [
        { narrate: 'I called the elevator for him and held the door. He tipped an imaginary hat.' },
        { who: 'professor', say: 'Thank you, young man. If Kane\'s figures are wrong, I shall be down directly to complain.' },
        { exit: 'walk' },
        { note: ['professor', 'Let him up. An old man with an old watch, and every right to both.'] }
      ] },
      turnAway: { steps: [
        { narrate: 'I told him the doctor wasn\'t seeing anyone else tonight.' },
        { who: 'professor', say: 'I see. Well. I\'ve been sent home by better men. Though not recently.' },
        { exit: 'walk' },
        { narrate: 'The taxi didn\'t leave. He sat in the back with the dome light on, reading his journal, waiting.' },
        { note: ['professor', 'Turned him away. He was on the list. His taxi is still in the lot.'] }
      ] },
      shoot: legitShot('professor',
        'He sat down against the counter, slowly, the way he did everything. The watch kept ticking. It was right to the minute.',
        'I shot an old professor who was on the list because of his watch.',
        'You shot a professor emeritus who was on the list.'),
      shutdown: { steps: [
        { narrate: 'I aimed Kane\'s grey box at him and pressed the button. Nothing.' },
        { who: 'professor', say: 'Fascinating. Does it do anything, or is that the experiment?' },
        { note: ['professor', 'Tried the device on him. Nothing. He was curious about it.'] }
      ] }
    },
    returnArrive: [
      { crt: ['CAM 02 LOT', '> VEHICLE: TAXI', '> REC'] },
      { sfx: 'door' },
      { narrate: 'The professor came back in from his taxi, cane first, looking less patient than a man his age has time for.' },
      { enter: 'professor' }
    ],
    returnGreeting: [
      { who: 'professor', say: 'Young man, Kane has telephoned the taxi company looking for me. That has never happened before.' },
      { who: 'professor', say: 'Whatever he needs checked, he needs it checked now. I really must insist.' }
    ]
  };

  /* ================= Ancient Roman "consultant" (intruder) ================= */
  V.roman = {
    id: 'roman',
    truth: 'intruder',
    prompt: 'He stands very straight, chin up, like he\'s waiting for a crowd to stop cheering.',
    arrive: [
      { crt: ['CAM 01 LOBBY', '> MOTION: 1', '> REC'] },
      { narrate: 'A man in a trench coat buttoned to the throat marched across the lot like it was a parade ground.' },
      { narrate: 'The automatic door opened for him. He nodded to it.' },
      { enter: 'roman' }
    ],
    greeting: [
      { who: 'roman', say: 'Greetings. I am Quintus Varro. Consultant.' },
      { who: 'roman', say: 'From Rome.' },
      { pause: 400 },
      { who: 'roman', say: 'Italy.' },
      { learn: 'metRoman' }
    ],
    inspect: [
      { title: 'Collar', zoom: 'romanCollar', x: 236, y: 86, w: 26, h: 14,
        text: 'Buttoned to the throat. Under the top button, a fold of thick white wool. Not a scarf. Too much of it for a scarf.',
        note: 'Trench coat buttoned to the neck. Thick white wool folded underneath, too much for a scarf.' },
      { title: 'Coat hem', zoom: 'romanSandal', x: 216, y: 226, w: 66, h: 20,
        text: 'Below the coat, bare shins. A leather strap wound criss-cross up the calf. A sandal, in October, in this.',
        note: 'Bare shins under his coat, with leather sandal straps wound up the calf.' },
      { title: 'Purse', zoom: 'romanPurse', x: 212, y: 192, w: 18, h: 20,
        text: 'A leather drawstring purse on his belt. It clinks. Small silver coins, a head stamped on each.',
        note: 'Leather drawstring purse of small silver coins, each with a head stamped on it.' },
      { title: 'Appointment card', zoom: 'romanCard', x: 284, y: 202, w: 20, h: 16,
        text: 'A card in neat capitals: KANE. Underneath, the date and hour: XIII · X, and III.',
        note: 'His appointment card has the date in Roman numerals: XIII X. Hour III.' },
      { title: 'Ring', zoom: 'romanRing', x: 194, y: 196, w: 16, h: 12,
        text: 'A heavy gold ring with a carved red stone. An eagle, cut backwards, for pressing into wax.',
        note: 'Gold signet ring, carved eagle, for sealing wax.' }
    ],
    opening: {
      name: [
        { who: 'roman', say: 'Quintus Varro. Of the Varr— of no family in particular. Consultant.' },
        { note: ['roman', 'Calls himself Quintus Varro, consultant from Rome. Italy.'] }
      ],
      want: [
        { who: 'roman', say: 'I am to see the doctor. Kane. He is on the... on floor eye-vee.' },
        { pause: 400 },
        { who: 'roman', say: 'Four. The fourth.' },
        { narrate: 'He\'d read the directory board as letters, I-V. The board says 4.' },
        { note: ['roman', 'Called the fourth floor "eye-vee", as in IV. The board says 4.'] }
      ],
      how: [
        { who: 'roman', say: 'On foot, from the station. Your roads are very straight. Someone built them well.' },
        { note: ['roman', 'Walked from the station. Admired how straight the roads are.'] }
      ]
    },
    questions: [
      { id: 'card', ask: 'Your card\'s dated in Roman numerals.', requires: 'saw:romanCard', steps: [
        { who: 'roman', say: 'The thirteenth day of the tenth month. At the third hour. Is that not how it is written?' },
        { narrate: 'Not on any appointment card I\'ve ever seen. And the third hour after what?' },
        { note: ['roman', 'Writes dates in Roman numerals. "Is that not how it is written?"'] }
      ] },
      { id: 'lira', ask: 'How\'s the lira doing these days?', requires: 'saw:romanPurse', steps: [
        { who: 'roman', say: 'The lira.' },
        { who: 'roman', say: 'It is... well. It is well played, at feasts.' },
        { narrate: 'A man from Rome, Italy, who thinks the lira is a harp.' },
        { note: ['roman', 'Had no idea what the lira was. Thought it was an instrument.'] }
      ] },
      { id: 'count', ask: 'How much is in the purse?', requires: 'saw:romanPurse', steps: [
        { who: 'roman', say: 'One, two, three... four, five. Six, seven, eight... nine, ten. Ten denarii.' },
        { narrate: 'He counted on his fingers, lips moving, and scratched the tally on the counter with his thumbnail: X.' },
        { note: ['roman', 'Counted his coins on his fingers and scratched an X. Called them denarii.'] }
      ] },
      { id: 'sandals', ask: 'Sandals? In this rain?', requires: 'saw:romanSandal', steps: [
        { who: 'roman', say: 'A Roman does not fear a little water. We built aqueducts.' },
        { narrate: 'He heard it as soon as he said it. His chin came down a quarter of an inch.' },
        { note: ['roman', 'Sandals in the rain. "We built aqueducts."'] }
      ] },
      { id: 'coat', ask: 'Warm in here. Let me take your coat.', requires: 'saw:romanCollar', steps: [
        { who: 'roman', say: 'No!' },
        { narrate: 'Both hands went to the top button.' },
        { who: 'roman', say: '...No. Thank you. In Rome, it is fashionable. To be... buttoned.' },
        { note: ['roman', 'Wouldn\'t let me take his coat. Grabbed the top button.'] }
      ] },
      { id: 'ring', ask: 'That ring\'s for sealing letters, isn\'t it?', requires: 'saw:romanRing', steps: [
        { who: 'roman', say: 'Every man of standing has one. How else would you know a letter was mine?' },
        { narrate: 'I thought of the fax machine in the office. I didn\'t say anything.' },
        { note: ['roman', 'Seals his letters with a signet ring. Asked how else you\'d know who sent one.'] }
      ] },
      { id: 'list', ask: 'You\'re not on Dr. Kane\'s list.', requires: 'saw:desk.list', steps: [
        { who: 'roman', say: 'A list. Written by a man in a hurry. Lists are wrong all the time. I have struck names from many.' },
        { note: ['roman', 'Not on the visitor list. Says he has "struck names from many" lists.'] }
      ] },
      { id: 'salve', ask: 'Salve, Quintus.', requires: 'metRoman', steps: [
        { who: 'roman', say: 'Salve! Quid—' },
        { narrate: 'He stopped with his arm already up in a salute I\'d only seen in movies.' },
        { who: 'roman', say: '...Hello. Hello, I meant to say.' },
        { note: ['roman', 'Greeted him in Latin. He answered in Latin, with a salute, before he caught himself.'] }
      ] }
    ],
    actions: {
      letThrough: { steps: [
        { narrate: 'I pointed him to the stairs. He took them like a man marching on a city.' },
        { exit: 'walk' },
        { pause: 800 },
        { sfx: 'distant' },
        { narrate: 'Someone on four shouted something in Latin. Then the light came, and nobody shouted anything.' },
        { note: ['roman', 'Let him up. Rome, Italy, my foot. The night started over.'] },
        { reset: 'You let a man from ancient Rome through.' }
      ] },
      turnAway: { steps: [
        { narrate: 'I told him the doctor wasn\'t taking consultants tonight.' },
        { who: 'roman', say: 'Then I shall wait. Rome was not built in a day, guard.' },
        { exit: 'walk' },
        { narrate: 'He stood in the rain at the edge of the lot for a long time, perfectly still, like he was guarding something.' },
        { note: ['roman', 'Turned him away. He went to stand in the rain.'] }
      ] },
      shoot: { steps: [
        { sfx: 'gunshot' },
        { exit: 'fall' },
        { backdrop: 'body' },
        { narrate: 'The trench coat fell open. Underneath, white wool, wrapped and pinned the old way, with a purple stripe along the edge.' },
        { narrate: 'The coins in his purse rolled across the lobby. None of them said lira.' },
        { note: ['roman', 'Shot him. Under the trench coat, a toga with a purple stripe.'] }
      ] },
      shutdown: { steps: [
        { narrate: 'I pointed Kane\'s grey box at him. It clicked. He didn\'t.' },
        { who: 'roman', say: 'Is that a... charm? Against me?' },
        { narrate: 'He looked at me differently after that. Like a soldier looks at a wall he\'ll have to climb.' },
        { note: ['roman', 'Tried the device on him. Nothing. Now he knows I\'m suspicious.'] }
      ] }
    }
  };

  E.content.visitorList.push({ name: 'Prof. E. Harrow', org: 'Emeritus, Physics', seeing: 'Dr. Kane' });

  /* ================================= art ================================= */
  // tiny 3x5 capitals for close-ups
  var FONT = {
    A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110',
    E: '111100110100111', F: '111100110100100', G: '011100101101011', H: '101101111101101',
    I: '111010010010111', K: '101101110101101', L: '100100100100111', M: '101111111101101',
    N: '110101101101101', O: '010101101101010', P: '110101110100100', R: '110101110101101',
    S: '011100010001110', T: '111010010010010', U: '101101101101111', V: '101101101101010',
    W: '101101111111101', X: '101101010101101', Y: '101101010010010', '-': '000000111000000'
  };
  function word(str, x, y, col) {
    for (var k = 0; k < str.length; k++) {
      var gl = FONT[str[k]];
      if (gl) for (var i = 0; i < 15; i++) if (gl[i] === '1') R(x + i % 3, y + Math.floor(i / 3), 1, 1, col);
      x += str[k] === ' ' ? 2 : 4;
    }
  }
  function zoom(fn) { return function (z) { K.on(z, fn); }; }

  var A = E.art.visitors, Z = E.art.zooms;

  /* ---------- Lt. Col. Brandt: Air Force blue service dress, peaked cap ---------- */
  A.liaison = function () {
    // lower half: blue trousers, coat to the hip, web belt and holster, ID in one hand, briefcase in the other
    K.legs(P.night3, P.night2, 196);
    R(231, 204, 1, 50, P.night2); R(267, 204, 1, 50, P.night1);
    K.torso(P.shirt, P.night3, 200);
    R(249, 164, 1, 36, P.night1);
    R(246, 172, 3, 3, P.fog); R(246, 186, 3, 3, P.fog);
    R(214, 180, 18, 2, P.night2); R(266, 180, 18, 2, P.night1);
    R(208, 190, 82, 4, P.night0); R(246, 190, 6, 4, P.fog);
    // flap holster on his left hip (viewer right)
    poly([[262, 194], [278, 194], [276, 214], [264, 214]], P.brown0);
    R(262, 194, 16, 6, P.brown1); R(269, 197, 2, 2, P.steel); R(265, 192, 10, 2, P.night0);
    K.armL(P.shirt, P.night3, P.skinA1, P.skinA2);
    K.armR(P.night3, P.night2, P.skinA1, P.skinA2);
    // green ID card held up in his right hand (viewer left)
    R(196, 202, 18, 13, P.crt0); R(197, 203, 16, 11, P.night3); R(198, 204, 5, 6, P.paper); R(199, 205, 3, 3, P.skinA1);
    R(204, 205, 7, 1, P.paper); R(204, 208, 6, 1, P.paperShade); R(204, 211, 8, 1, P.crt1);
    El(205, 214, 4, 3, P.skinA1);
    // briefcase hanging from his left hand
    R(290, 208, 10, 2, P.night0); R(290, 208, 2, 5, P.night0); R(298, 208, 2, 5, P.night0);
    R(280, 212, 30, 28, P.night0); R(281, 213, 28, 1, P.night2); R(284, 218, 4, 3, P.steel); R(302, 218, 4, 3, P.steel);
    R(288, 212, 6, 3, P.red1); R(294, 212, 4, 3, P.paper);

    // upper half: service coat, light blue shirt, dark tie
    poly([[188, 170], [200, 108], [226, 98], [272, 98], [298, 108], [310, 170]], P.night3);
    poly([[194, 170], [204, 110], [228, 100], [249, 100], [249, 170]], P.shirt);
    poly([[238, 100], [260, 100], [249, 130]], P.fog);
    poly([[246, 102], [252, 102], [251, 126], [249, 130], [247, 126]], P.night0);
    poly([[232, 100], [242, 100], [249, 130], [240, 136]], P.night2);
    poly([[256, 100], [266, 100], [258, 136], [249, 130]], P.night1);
    // shoulder boards with the silver oak leaf
    R(204, 102, 22, 6, P.night2); El(214, 104, 3, 2, P.fog); R(213, 103, 2, 1, P.paper);
    R(272, 102, 22, 6, P.night1); El(284, 104, 3, 2, P.steel);
    // ribbon rack and name plate on his left breast (viewer right)
    R(264, 114, 16, 3, P.red1); R(268, 114, 4, 3, P.lamp3); R(274, 114, 3, 3, P.paper);
    R(264, 117, 16, 3, P.lamp4); R(270, 117, 3, 3, P.red0); R(276, 117, 4, 3, P.shirt);
    R(264, 120, 16, 3, P.crt1); R(268, 120, 4, 3, P.paper);
    R(262, 125, 20, 4, P.night0); R(264, 126, 16, 2, P.fog);
    // pocket flaps and buttons
    R(212, 130, 20, 3, P.night3); R(266, 136, 20, 3, P.night2);
    R(248, 140, 3, 3, P.fog); R(248, 156, 3, 3, P.fog);
    // neck, square jaw, hard face
    R(240, 84, 18, 16, P.skinA1);
    El(249, 66, 18, 21, P.skinA1); El(246, 65, 15, 18, P.skinA2);
    R(234, 72, 30, 12, P.skinA1); R(236, 72, 20, 10, P.skinA2); D(254, 54, 14, 32, P.skinA0, 2);
    R(236, 62, 10, 2, P.night1); R(252, 62, 10, 2, P.night1);
    R(238, 65, 6, 2, P.night0); R(254, 65, 6, 2, P.night0);
    R(242, 80, 14, 1, P.skinA0); R(236, 84, 26, 2, P.skinA0);
    R(230, 60, 3, 10, P.hair0); R(265, 60, 3, 10, P.hair0);
    // peaked service cap with a silver badge
    El(249, 46, 26, 9, P.night3); El(246, 44, 22, 7, P.shirt);
    R(226, 50, 46, 6, P.night0);
    poly([[228, 56], [270, 56], [266, 61], [232, 61]], P.night0); R(232, 56, 30, 1, P.steel);
    El(249, 44, 4, 3, P.fog); R(248, 42, 2, 2, P.paper);
  };

  Z.liaisonInsignia = zoom(function () {
    R(0, 0, 32, 24, P.shirt);
    R(0, 6, 32, 12, P.night2); R(0, 6, 32, 1, P.night3); R(28, 6, 4, 12, P.night1);
    R(3, 10, 2, 2, P.fog);
    poly([[12, 12], [16, 7], [21, 8], [23, 12], [21, 16], [16, 17]], P.fog);
    poly([[14, 12], [17, 9], [20, 10], [21, 12], [18, 15]], P.paper);
    R(10, 12, 3, 1, P.steel); R(16, 12, 6, 1, P.steel);
    D(12, 7, 12, 11, P.steel, 1);
  });
  Z.liaisonRibbons = zoom(function () {
    R(0, 0, 32, 24, P.night3);
    var rows = [[P.red1, P.lamp3, P.paper, P.shirt], [P.lamp4, P.red0, P.crt1, P.shirt], [P.crt1, P.paper, P.red1, P.lamp4]];
    rows.forEach(function (row, j) { row.forEach(function (c, i) { R(4 + i * 6, 2 + j * 4, 6, 3, c); R(5 + i * 6, 3 + j * 4, 1, 1, P.night0); }); });
    R(2, 15, 28, 8, P.night0); R(2, 15, 28, 1, P.steel);
    word('BRANDT', 4, 17, P.paper);
  });
  Z.liaisonSidearm = zoom(function () {
    R(0, 0, 32, 24, P.night3);
    R(0, 2, 32, 4, P.night0); R(14, 2, 4, 4, P.fog);
    poly([[8, 6], [24, 6], [22, 24], [10, 24]], P.brown0);
    R(8, 6, 16, 8, P.brown1); R(9, 7, 14, 1, P.brown2);
    R(15, 11, 2, 2, P.steel);
    R(10, 1, 9, 6, P.night0); for (var g = 0; g < 4; g++) R(11 + g * 2, 2 + (g % 2), 1, 1, P.night2);
    R(12, 16, 1, 6, P.wood0); R(19, 16, 1, 6, P.wood0);
  });
  Z.liaisonId = zoom(function () {
    R(0, 0, 32, 24, P.skinA1);
    R(2, 2, 28, 19, P.crt0); R(3, 3, 26, 17, P.night3);
    R(3, 3, 26, 5, P.crt0); word('USA', 5, 3, P.paperShade);
    R(5, 9, 8, 10, P.paper); R(6, 11, 6, 7, P.skinA1); R(6, 10, 6, 2, P.hair0); R(7, 16, 4, 1, P.skinA0);
    R(15, 10, 12, 1, P.paper); R(15, 13, 10, 1, P.paperShade); R(15, 16, 8, 1, P.paperShade);
    R(24, 15, 3, 3, P.crt1);
    R(2, 2, 28, 1, P.fog);
  });
  Z.liaisonCase = zoom(function () {
    R(0, 0, 32, 24, P.night1);
    R(1, 5, 30, 19, P.night0); R(1, 5, 30, 1, P.night2);
    R(10, 0, 12, 2, P.night0); R(10, 0, 2, 5, P.night0); R(20, 0, 2, 5, P.night0);
    R(5, 8, 5, 4, P.steel); R(6, 9, 1, 2, P.night0); R(8, 9, 1, 2, P.night0);
    R(22, 8, 5, 4, P.steel); R(23, 9, 1, 2, P.night0); R(25, 9, 1, 2, P.night0);
    R(12, 4, 10, 3, P.paper); R(12, 4, 4, 3, P.red1); R(18, 5, 3, 1, P.paperDark);
  });

  /* ---------- "Skip Lowell": denim jacket, headband, camera on his chest ---------- */
  A.hippie = function () {
    // lower half: flared jeans, wide belt, notepad in one hand, a quarter in the other
    K.legs(P.steel, P.night3, 196);
    poly([[212, 232], [222, 232], [218, 254], [204, 254]], P.steel);
    poly([[276, 232], [286, 232], [294, 254], [280, 254]], P.night3);
    R(230, 204, 1, 50, P.night3); R(266, 204, 1, 50, P.night2);
    K.torso(P.brown2, P.brown1, 194);
    R(249, 164, 1, 30, P.brown0);
    for (var b = 0; b < 3; b++) { R(242, 170 + b * 8, 2, 2, P.lamp3); R(254, 170 + b * 8, 2, 2, P.lamp3); }
    R(208, 192, 82, 5, P.brown1); R(240, 191, 18, 7, P.lamp3); R(243, 193, 12, 3, P.brown2);
    // tie-dye shirt showing under the jacket
    R(236, 164, 26, 6, P.red1); R(240, 166, 4, 2, P.lamp4); R(250, 165, 5, 2, P.fog);
    K.armL(P.brown2, P.brown1, P.skinA1, P.skinA2);
    K.armR(P.brown1, P.brown0, P.skinA1, P.skinA2);
    for (var f = 0; f < 5; f++) { R(194 + f * 3, 176 + f * 4, 1, 5, P.card1); R(304 - f * 3, 176 + f * 4, 1, 5, P.brown0); }
    // reporter's notepad in his right hand (viewer left)
    R(194, 202, 16, 18, P.paper); for (var s = 0; s < 6; s++) R(195 + s * 2, 201, 1, 2, P.steel);
    R(196, 206, 11, 1, P.paperDark); R(196, 209, 8, 1, P.paperShade); R(196, 212, 10, 1, P.paperShade);
    El(206, 210, 4, 5, P.skinA1); El(205, 209, 2, 3, P.skinA2);
    // a quarter between his fingers
    El(297, 211, 3, 3, P.fog); R(296, 210, 2, 1, P.paper);

    // upper half: long hair behind the shoulders
    El(230, 92, 9, 18, P.hair1); El(268, 92, 9, 18, P.hair0);
    // suede jacket with a fringed yoke, collar out
    poly([[190, 170], [202, 110], [226, 98], [272, 98], [296, 110], [308, 170]], P.brown1);
    poly([[196, 170], [206, 112], [228, 100], [249, 100], [249, 170]], P.brown2);
    poly([[238, 100], [260, 100], [256, 130], [242, 130]], P.red1);
    R(242, 104, 5, 4, P.lamp4); R(252, 112, 4, 4, P.fog); R(244, 120, 6, 3, P.lamp3);
    poly([[226, 98], [240, 100], [244, 120], [230, 112]], P.card1);
    poly([[272, 98], [258, 100], [254, 120], [268, 112]], P.card0);
    for (var y = 0; y < 10; y++) { R(206 + y * 3, 112, 1, 5, P.card1); R(262 + y * 3, 112, 1, 5, P.brown0); }
    for (var y2 = 0; y2 < 6; y2++) { R(196 + y2 * 2, 130 + y2 * 6, 1, 6, P.card1); R(300 - y2 * 2, 130 + y2 * 6, 1, 6, P.brown0); }
    // peace patch, left chest (viewer left)
    El(218, 124, 6, 6, P.paper); El(218, 124, 5, 5, P.night1); El(218, 124, 4, 4, P.paper);
    R(218, 120, 1, 9, P.night1); R(215, 126, 3, 1, P.night1); R(219, 126, 3, 1, P.night1);
    R(216, 125, 1, 1, P.night1); R(221, 125, 1, 1, P.night1);
    // press pass tucked in the pocket (viewer right)
    R(264, 116, 22, 8, P.brown0); R(267, 110, 12, 10, P.paper); R(267, 110, 12, 3, P.night0); R(276, 114, 2, 2, P.red1);
    // camera on its strap
    R(236, 102, 1, 24, P.night0); R(262, 102, 1, 24, P.night0);
    R(234, 126, 30, 18, P.night0); R(234, 126, 30, 3, P.fog); R(242, 123, 14, 4, P.night0); R(244, 124, 10, 2, P.steel);
    El(249, 136, 7, 6, P.night1); El(249, 136, 4, 4, P.steel); El(248, 135, 1, 1, P.paper);
    R(256, 128, 4, 2, P.paperShade);
    // neck, face, moustache, round tinted glasses, headband
    R(241, 86, 16, 16, P.skinA1);
    El(249, 68, 18, 22, P.skinA1); El(246, 67, 15, 19, P.skinA2); D(257, 54, 12, 34, P.skinA0, 2);
    El(240, 66, 5, 4, P.night0); El(258, 66, 5, 4, P.night0);
    El(240, 66, 4, 3, P.lamp3); El(258, 66, 4, 3, P.wood3); R(245, 65, 8, 1, P.night0);
    R(239, 65, 2, 1, P.lamp4);
    poly([[239, 78], [249, 76], [259, 78], [258, 84], [254, 80], [244, 80], [240, 84]], P.hair0);
    R(244, 82, 10, 1, P.red0);
    El(249, 50, 21, 9, P.hair1); El(256, 52, 12, 6, P.hair0);
    R(229, 54, 6, 24, P.hair1); R(263, 54, 6, 24, P.hair0);
    R(229, 52, 40, 3, P.red1); R(229, 53, 40, 1, P.red0); R(266, 54, 3, 8, P.red1);
  };

  Z.hippiePass = zoom(function () {
    R(0, 0, 32, 24, P.brown2);
    R(2, 1, 28, 22, P.paper);
    R(2, 1, 28, 13, P.night0);
    word('FREE', 4, 2, P.paper);
    word('PRESS', 4, 8, P.paper);
    // the cover price, 10 cents
    D(2, 14, 28, 9, P.paperShade, 1);
    R(4, 16, 6, 6, P.paperShade); R(5, 17, 4, 4, P.skinA1);
    R(11, 17, 5, 1, P.paperDark); R(11, 20, 4, 1, P.paperDark);
    // the cover price: 10 cents
    K.digits('10', 18, 17, P.night0);
    R(27, 18, 2, 1, P.night0); R(26, 19, 1, 2, P.night0); R(27, 21, 2, 1, P.night0); R(27, 16, 1, 7, P.night0);
  });
  Z.hippiePatch = zoom(function () {
    R(0, 0, 32, 24, P.brown2);
    for (var i = 0; i < 32; i += 3) R(i, 0, 1, 24, P.brown1);
    El(16, 12, 10, 10, P.paper); El(16, 12, 8, 8, P.night1); El(16, 12, 6, 6, P.paper);
    R(15, 3, 2, 18, P.night1);
    poly([[15, 12], [17, 12], [11, 19], [9, 18]], P.night1);
    poly([[15, 12], [17, 12], [23, 18], [21, 19]], P.night1);
    R(6, 12, 1, 1, P.lamp4); R(26, 12, 1, 1, P.lamp4); R(16, 2, 1, 1, P.lamp4);
  });
  Z.hippieCamera = zoom(function () {
    R(0, 0, 32, 24, P.brown2);
    R(2, 5, 28, 17, P.night0); R(2, 5, 28, 4, P.fog); R(10, 1, 12, 5, P.fog); R(12, 2, 8, 2, P.night1);
    R(4, 6, 3, 2, P.paper); R(24, 6, 4, 2, P.steel);
    El(16, 15, 6, 6, P.night2); El(16, 15, 4, 4, P.night0); El(15, 14, 1, 1, P.fog);
    K.digits('12', 23, 11, P.lamp3);
  });
  Z.hippieNotepad = zoom(function () {
    R(0, 0, 32, 24, P.skinA1);
    R(3, 1, 26, 23, P.paper);
    for (var i = 0; i < 12; i++) R(4 + i * 2, 0, 1, 3, P.steel);
    word('KL', 6, 5, P.night0); K.digits('5', 14, 5, P.night0); R(18, 7, 2, 1, P.night0);
    K.digits('2207', 10, 12, P.night0);
    R(5, 18, 20, 1, P.paperShade); R(5, 21, 16, 1, P.paperShade);
  });
  Z.hippieQuarter = zoom(function () {
    R(0, 0, 32, 24, P.skinA1);
    R(0, 16, 32, 8, P.skinA2);
    El(16, 11, 9, 9, P.fog); El(16, 11, 7, 7, P.paperShade);
    El(15, 10, 3, 4, P.fog); R(13, 7, 4, 1, P.paper);
    for (var i = 0; i < 18; i += 2) R(7 + i, 2, 1, 1, P.steel);
    R(5, 17, 22, 1, P.skinA0);
  });

  /* ---------- Greg / "Gunnar": horns, fur, foam axe, convention lanyard ---------- */
  A.viking = function () {
    // lower half: belted red tunic, grey sweatpants with leg wraps, axe handle in his right hand
    K.legs(P.plastic1, P.plastic0, 206);
    for (var w = 0; w < 6; w++) {
      R(214, 216 + w * 6, 32, 2, P.brown1); R(252, 219 + w * 6, 30, 2, P.brown0);
    }
    K.torso(P.red1, P.red0, 216);
    poly([[208, 212], [290, 212], [288, 218], [210, 218]], P.red0);
    R(208, 190, 82, 5, P.brown0); El(249, 192, 5, 4, P.lamp3); El(249, 192, 3, 2, P.brown1);
    R(226, 196, 12, 14, P.brown1); R(226, 196, 12, 3, P.brown0); El(232, 203, 1, 1, P.lamp3);
    K.armL(P.red1, P.brown2, P.skinA1, P.skinA2);
    K.armR(P.red0, P.brown1, P.skinA1, P.skinA2);
    D(196, 186, 16, 12, P.brown1, 2); D(286, 186, 16, 12, P.brown0, 2);
    // calculator watch on his left wrist (viewer right)
    R(287, 196, 14, 5, P.night0); R(289, 197, 7, 2, P.plastic2); R(297, 197, 3, 3, P.night2);
    // axe handle runs from his fist up over his shoulder
    poly([[200, 214], [204, 214], [194, 110], [190, 110]], P.wood2);
    R(197, 150, 4, 8, P.steel);
    El(204, 206, 6, 6, P.skinA1); El(203, 205, 4, 4, P.skinA2);

    // upper half: tunic, fur mantle, lanyard
    poly([[184, 170], [196, 108], [226, 96], [272, 96], [302, 108], [314, 170]], P.red0);
    poly([[190, 170], [200, 110], [228, 98], [249, 98], [249, 170]], P.red1);
    El(222, 104, 26, 10, P.brown2); El(276, 104, 26, 10, P.brown1);
    D(198, 96, 50, 18, P.brown1, 2); D(250, 96, 50, 18, P.brown0, 2);
    R(214, 150, 70, 3, P.lamp3);
    // axe handle in front of the tunic, foam head over his right shoulder
    poly([[196, 166], [200, 166], [194, 108], [190, 108]], P.wood2);
    for (var t = 0; t < 4; t++) R(191 + t, 140 + t * 4, 5, 1, P.steel);
    poly([[176, 82], [200, 98], [198, 112], [176, 130], [172, 118], [178, 104]], P.steel);
    poly([[177, 86], [196, 99], [194, 106], [178, 102]], P.fog);
    R(186, 101, 10, 2, P.lamp3); R(190, 98, 2, 8, P.lamp3);
    // lanyard and convention badge
    poly([[240, 98], [242, 98], [246, 130], [244, 130]], P.paper);
    poly([[258, 98], [256, 98], [252, 130], [254, 130]], P.paperShade);
    R(240, 130, 18, 16, P.paper); R(240, 130, 18, 4, P.red0); R(242, 136, 14, 1, P.paperDark); R(242, 139, 10, 1, P.paperDark); R(242, 142, 12, 2, P.night0);
    // neck, broad face, big braided beard
    R(240, 82, 18, 16, P.skinA1);
    El(249, 66, 19, 22, P.skinA1); El(246, 65, 16, 19, P.skinA2); D(257, 52, 12, 34, P.skinA0, 2);
    R(238, 64, 6, 2, P.night0); R(254, 64, 6, 2, P.night0); R(239, 64, 2, 1, P.paper);
    R(236, 60, 9, 2, P.lamp3); R(253, 60, 9, 2, P.wood3);
    El(249, 84, 17, 16, P.lamp3); El(245, 82, 12, 12, P.lamp4); D(252, 74, 16, 26, P.wood3, 1);
    R(242, 96, 4, 14, P.lamp3); R(252, 96, 4, 14, P.wood3); R(242, 104, 4, 2, P.brown0); R(252, 104, 4, 2, P.brown0);
    R(242, 78, 14, 3, P.red0); R(244, 78, 10, 1, P.night0);
    El(232, 70, 4, 10, P.lamp3); El(266, 70, 4, 10, P.wood3);
    // horned helmet
    El(249, 48, 22, 13, P.steel); El(245, 45, 17, 10, P.fog); R(227, 52, 44, 5, P.night3); R(228, 53, 42, 1, P.fog);
    for (var r = 0; r < 6; r++) R(231 + r * 7, 54, 2, 2, P.paper);
    R(247, 36, 4, 16, P.night3);
    poly([[230, 48], [222, 40], [216, 30], [214, 20], [220, 28], [228, 36], [234, 44]], P.paper);
    poly([[268, 48], [276, 40], [282, 30], [284, 20], [278, 28], [270, 36], [264, 44]], P.paperShade);
    R(214, 20, 2, 3, P.paperShade); R(283, 20, 2, 3, P.paperDark);
  };

  Z.vikingHelmet = zoom(function () {
    R(0, 0, 32, 24, P.night1);
    El(16, 18, 11, 8, P.steel); El(14, 16, 8, 6, P.fog);
    R(4, 20, 24, 4, P.night3);
    poly([[6, 16], [3, 10], [2, 2], [5, 8], [9, 14]], P.paper);
    poly([[26, 16], [29, 10], [30, 2], [27, 8], [23, 14]], P.paperShade);
    // hot glue blobs at the horn roots
    El(7, 16, 2, 1, P.lamp4); El(25, 16, 2, 1, P.lamp4); R(6, 17, 1, 2, P.lamp4);
  });
  Z.vikingAxe = zoom(function () {
    R(0, 0, 32, 24, P.night1);
    poly([[4, 2], [18, 6], [18, 18], [4, 22], [8, 12]], P.steel);
    poly([[6, 4], [16, 7], [16, 11], [9, 11]], P.fog);
    R(7, 14, 3, 1, P.plastic1); R(11, 6, 2, 1, P.plastic1); R(6, 18, 4, 1, P.plastic1);
    R(18, 10, 14, 5, P.wood2); R(18, 10, 14, 1, P.wood3);
    for (var i = 20; i < 32; i += 3) R(i, 10, 1, 5, P.steel);
    R(15, 6, 2, 13, P.lamp3); R(14, 18, 4, 2, P.lamp3);
  });
  Z.vikingLanyard = zoom(function () {
    R(0, 0, 32, 24, P.red1);
    R(14, 0, 1, 3, P.paper); R(18, 0, 1, 3, P.paper);
    R(2, 3, 28, 21, P.paper);
    R(2, 3, 28, 7, P.red0);
    word('MIDWNTR', 3, 4, P.paper);
    word('OCT', 4, 11, P.night0); K.digits('12', 17, 11, P.night0); R(25, 13, 2, 1, P.night0);
    K.digits('14', 4, 17, P.night0);
    word('GREG', 13, 17, P.red0);
  });
  Z.vikingWatch = zoom(function () {
    R(0, 0, 32, 24, P.skinA1);
    D(0, 0, 32, 5, P.brown1, 3); D(0, 19, 32, 5, P.brown1, 3);
    R(0, 7, 32, 10, P.night0);
    R(6, 4, 20, 16, P.night1); R(8, 6, 16, 5, P.plastic2);
    K.digits('2:18', 10, 6, P.night0);
    for (var i = 0; i < 4; i++) { R(8 + i * 4, 13, 3, 2, P.steel); R(8 + i * 4, 16, 3, 2, P.steel); }
  });

  /* ---------- Carla Dunn: raincoat over scrubs, keys and a thermos ---------- */
  A.wife = function () {
    // lower half: blue scrub trousers, long raincoat hanging open, keys in one hand, thermos in the other
    K.legs(P.shirt, P.night3, 196);
    R(230, 204, 1, 50, P.night3);
    R(230, 164, 38, 34, P.shirt); R(249, 164, 19, 34, P.night3);
    R(234, 176, 10, 8, P.night3); R(234, 176, 10, 1, P.night2);
    poly([[204, 164], [232, 164], [230, 244], [206, 244]], P.red1);
    poly([[266, 164], [294, 164], [292, 244], [268, 244]], P.red0);
    R(231, 164, 1, 80, P.red0); R(266, 164, 1, 80, P.night0);
    R(208, 192, 22, 2, P.red0); R(270, 192, 20, 2, P.night0);
    K.armL(P.red1, P.red0, P.skinA1, P.skinA2);
    K.armR(P.red0, P.night0, P.skinA1, P.skinA2);
    // wedding ring and the spare keys hanging from her fist
    R(200, 200, 6, 2, P.lamp3);
    El(204, 214, 4, 4, P.steel); El(204, 214, 2, 2, P.skinA1);
    R(199, 217, 3, 10, P.night0); R(199, 217, 3, 3, P.night2); R(200, 220, 1, 6, P.steel);
    R(205, 218, 2, 8, P.lamp3); R(208, 216, 7, 9, P.paper); R(209, 218, 5, 1, P.paperDark); R(209, 221, 4, 1, P.paperDark);
    // thermos in her other hand
    R(287, 198, 14, 28, P.steel); R(287, 198, 4, 28, P.fog); R(287, 196, 14, 4, P.red1); R(290, 210, 3, 2, P.night3);
    El(294, 206, 6, 5, P.skinA1); El(293, 205, 4, 3, P.skinA2);

    // upper half: big curly hair behind, raincoat collar, scrubs top, hospital badge
    El(249, 66, 30, 30, P.hair1); El(258, 70, 22, 28, P.hair0);
    D(220, 40, 60, 60, P.hair0, 1, true);
    poly([[188, 170], [200, 108], [226, 98], [272, 98], [298, 108], [310, 170]], P.red0);
    poly([[194, 170], [204, 110], [228, 100], [249, 100], [249, 170]], P.red1);
    poly([[228, 100], [270, 100], [262, 170], [236, 170]], P.shirt);
    poly([[249, 100], [270, 100], [262, 170], [249, 170]], P.night3);
    poly([[240, 100], [258, 100], [249, 114]], P.skinA1);
    poly([[222, 98], [238, 100], [236, 130], [228, 120]], P.red0);
    poly([[276, 98], [260, 100], [262, 130], [270, 120]], P.night0);
    R(256, 116, 14, 10, P.paper); R(257, 117, 4, 6, P.paperShade); R(262, 118, 6, 1, P.red1); R(262, 121, 6, 1, P.paperDark);
    R(262, 112, 1, 4, P.steel);
    // neck and a tired face
    R(241, 86, 16, 16, P.skinA1);
    El(249, 68, 17, 21, P.skinA1); El(246, 67, 14, 18, P.skinA2); D(256, 54, 12, 34, P.skinA0, 2);
    R(238, 66, 6, 2, P.night0); R(254, 66, 6, 2, P.night0); R(239, 66, 2, 1, P.paper);
    R(237, 62, 4, 1, P.hair0); R(241, 61, 4, 1, P.hair0); R(253, 61, 4, 1, P.hair0); R(257, 62, 4, 1, P.hair0);
    R(238, 69, 6, 1, P.red0); R(254, 69, 6, 1, P.red0);
    R(244, 81, 10, 2, P.red0); R(243, 82, 1, 1, P.skinA0); R(254, 82, 1, 1, P.skinA0);
    // curls over the forehead, scrunchie
    El(249, 49, 20, 7, P.hair1); El(236, 53, 6, 7, P.hair1); El(262, 53, 6, 7, P.hair0);
    for (var cu = 0; cu < 6; cu++) R(234 + cu * 6, 53 + (cu % 2) * 2, 3, 2, cu < 3 ? P.hair0 : P.hair0);
    R(270, 44, 6, 6, P.red1);
  };

  Z.wifeKeys = zoom(function () {
    R(0, 0, 32, 24, P.night2);
    El(8, 5, 5, 4, P.steel); El(8, 5, 3, 2, P.night2);
    R(4, 8, 5, 14, P.night0); R(4, 8, 5, 4, P.night3); R(5, 13, 3, 8, P.steel); R(8, 15, 1, 1, P.night0); R(8, 18, 1, 1, P.night0);
    R(11, 8, 3, 12, P.lamp3); R(14, 12, 1, 2, P.lamp3); R(14, 16, 1, 1, P.lamp3);
    R(15, 6, 17, 17, P.paper); R(16, 5, 1, 2, P.steel);
    word('PETE', 16, 8, P.night1);
    K.digits('4410', 16, 16, P.night1);
  });
  Z.wifeRing = zoom(function () {
    R(0, 0, 32, 24, P.night2);
    R(0, 4, 32, 16, P.skinA1); R(0, 4, 32, 4, P.skinA2);
    for (var i = 0; i < 4; i++) R(0, 7 + i * 4, 32, 1, P.skinA0);
    R(12, 6, 5, 14, P.lamp3); R(13, 6, 2, 14, P.lamp4); R(16, 6, 1, 14, P.wood3);
  });
  Z.wifeThermos = zoom(function () {
    R(0, 0, 32, 24, P.night1);
    R(9, 0, 16, 5, P.red1); R(9, 0, 4, 5, P.lamp4); R(9, 5, 16, 1, P.red0);
    R(10, 6, 14, 18, P.steel); R(10, 6, 4, 18, P.fog);
    El(19, 14, 3, 2, P.night3); R(12, 20, 3, 1, P.night3);
    D(14, 8, 10, 16, P.night3, 1);
    El(4, 18, 4, 6, P.skinA1);
  });
  Z.wifeBadge = zoom(function () {
    R(0, 0, 32, 24, P.shirt);
    R(15, 0, 2, 4, P.steel);
    R(2, 3, 28, 20, P.paper);
    R(2, 3, 28, 7, P.red1); word('ST M', 4, 4, P.paper);
    R(4, 12, 8, 9, P.paperShade); R(5, 14, 6, 7, P.skinA1); R(5, 12, 6, 3, P.hair1);
    word('RN', 15, 13, P.night0);
    R(14, 19, 13, 1, P.paperDark);
  });

  /* ---------- Prof. Harrow: cardigan, bow tie, cane, pocket watch ---------- */
  A.professor = function () {
    // lower half: corduroy trousers, cardigan to the hip, journal in the pocket, watch in hand
    K.legs(P.brown2, P.brown1, 198);
    for (var c = 0; c < 6; c++) { R(218 + c * 5, 206, 1, 48, P.brown1); R(254 + c * 5, 206, 1, 48, P.brown0); }
    K.torso(P.fog, P.steel, 204);
    R(240, 164, 18, 40, P.paper); R(249, 164, 9, 40, P.paperShade);
    R(238, 164, 2, 40, P.steel); R(258, 164, 2, 40, P.night3);
    R(237, 170, 3, 3, P.brown1); R(237, 182, 3, 3, P.brown1); R(237, 194, 3, 3, P.brown1);
    R(214, 186, 18, 12, P.steel); R(214, 186, 18, 1, P.night3);
    R(264, 186, 18, 12, P.night3); R(264, 186, 18, 1, P.night2);
    // rolled journal sticking out of the pocket
    R(266, 178, 12, 12, P.paper); R(266, 178, 12, 2, P.red1); R(268, 182, 8, 1, P.paperDark); El(272, 178, 6, 2, P.paperShade);
    K.armL(P.fog, P.steel, P.skinA1, P.skinA2);
    K.armR(P.steel, P.night3, P.skinA1, P.skinA2);
    // hickory cane with a taped grip and rubber tip
    R(202, 212, 3, 42, P.wood2); R(202, 212, 1, 42, P.wood3);
    poly([[196, 200], [210, 198], [212, 203], [198, 205]], P.wood2); R(203, 206, 3, 6, P.paperShade);
    R(201, 250, 5, 4, P.night0);
    El(205, 205, 6, 6, P.skinA1); El(204, 204, 4, 4, P.skinA2);
    // pocket watch open in his other hand, chain looping back to the cardigan
    El(294, 208, 6, 6, P.lamp3); El(294, 208, 4, 4, P.paper); R(294, 205, 1, 3, P.night0); R(294, 208, 3, 1, P.night0);
    El(294, 200, 5, 2, P.lamp4);
    [[288, 210], [285, 208], [282, 205], [279, 202], [276, 200]].forEach(function (p) { R(p[0], p[1], 2, 1, P.lamp3); });

    // upper half: stooped shoulders, open cardigan, white shirt, red bow tie
    poly([[190, 170], [202, 116], [228, 104], [270, 104], [296, 116], [308, 170]], P.steel);
    poly([[196, 170], [206, 118], [230, 106], [249, 106], [249, 170]], P.fog);
    poly([[236, 104], [262, 104], [260, 170], [238, 170]], P.paper);
    poly([[249, 104], [262, 104], [260, 170], [249, 170]], P.paperShade);
    R(236, 104, 2, 66, P.steel); R(260, 104, 2, 66, P.night3);
    for (var bt = 0; bt < 4; bt++) R(237, 124 + bt * 12, 3, 3, P.brown1);
    poly([[240, 104], [248, 108], [240, 112]], P.red1); poly([[258, 104], [250, 108], [258, 112]], P.red0); R(247, 106, 4, 4, P.red0);
    // neck and an old face, leaning forward a little
    R(241, 92, 16, 14, P.skinA1); D(241, 92, 16, 14, P.skinA0, 1);
    El(249, 72, 18, 21, P.skinA1); El(246, 71, 15, 18, P.skinA2); D(257, 58, 12, 32, P.skinA0, 2);
    // bald dome, white fringe, bushy brows
    El(249, 56, 15, 8, P.skinA2); R(244, 53, 4, 2, P.paper);
    El(232, 70, 5, 10, P.paper); El(266, 70, 5, 10, P.fog); D(229, 62, 8, 18, P.fog, 2);
    R(235, 64, 10, 3, P.paper); R(253, 64, 10, 3, P.fog);
    // wire spectacles
    R(236, 67, 10, 7, P.steel); R(252, 67, 10, 7, P.steel); R(246, 69, 6, 1, P.steel);
    R(237, 68, 8, 5, P.skinA2); R(253, 68, 8, 5, P.skinA1);
    R(239, 70, 4, 2, P.night0); R(255, 70, 4, 2, P.night0);
    // hearing aid behind his ear
    El(230, 72, 3, 5, P.skinA1); R(226, 66, 4, 9, P.plastic2); R(226, 66, 4, 2, P.plastic1);
    R(242, 84, 14, 1, P.skinA0); R(243, 86, 12, 1, P.skinA0); D(236, 76, 26, 14, P.skinA0, 1);
  };

  Z.professorWatch = zoom(function () {
    R(0, 0, 32, 24, P.skinA1);
    // open lid on the left, engraved
    El(9, 12, 8, 9, P.lamp3); El(9, 12, 7, 8, P.lamp4);
    K.digits('40', 5, 6, P.wood2);
    word('YRS', 3, 13, P.wood2);
    R(3, 19, 12, 1, P.wood3);
    // face on the right, ten past three
    El(23, 12, 8, 9, P.lamp3); El(23, 12, 6, 7, P.paper);
    R(23, 7, 1, 5, P.night0); R(23, 12, 4, 1, P.night0);
    R(17, 12, 1, 1, P.night0); R(29, 12, 1, 1, P.night0); R(23, 18, 1, 1, P.night0);
    R(15, 11, 2, 2, P.lamp3);
  });
  Z.professorCane = zoom(function () {
    R(0, 0, 32, 24, P.brown2);
    R(0, 0, 32, 4, P.fog);
    poly([[4, 6], [26, 4], [28, 9], [6, 11]], P.wood2); R(6, 6, 20, 1, P.wood3);
    for (var i = 0; i < 4; i++) R(14 + i * 3, 4, 2, 7, P.paperShade);
    R(13, 10, 5, 14, P.wood2); R(13, 10, 2, 14, P.wood3);
    D(13, 10, 5, 14, P.wood1, 1);
  });
  Z.professorJournal = zoom(function () {
    R(0, 0, 32, 24, P.night3);
    R(0, 14, 32, 10, P.steel); R(0, 14, 32, 1, P.night2);
    R(4, 1, 24, 18, P.paper); R(4, 1, 24, 7, P.red1);
    word('PHYS', 6, 2, P.paper);
    word('REV', 6, 10, P.night0);
    R(18, 13, 9, 4, P.paperShade); R(19, 14, 7, 1, P.paperDark); R(19, 16, 5, 1, P.paperDark);
    R(26, 1, 2, 4, P.paperShade);
  });
  Z.professorEar = zoom(function () {
    R(0, 0, 32, 24, P.skinA1);
    D(0, 0, 32, 10, P.paper, 2);
    El(14, 13, 6, 9, P.skinA2); El(15, 13, 3, 6, P.skinA1);
    poly([[18, 4], [24, 2], [27, 6], [26, 18], [22, 20], [21, 8]], P.plastic2);
    R(23, 5, 3, 3, P.plastic1); R(24, 6, 1, 1, P.night1);
    R(22, 18, 2, 4, P.plastic1);
    R(4, 0, 2, 24, P.steel);
  });

  /* ---------- "Quintus Varro": trench coat to the throat, bare shins, sandals ---------- */
  A.roman = function () {
    // lower half: bare shins with sandal straps under the coat hem
    R(220, 226, 24, 28, P.skinB2); R(254, 226, 24, 28, P.skinB1); D(220, 226, 24, 28, P.skinB1, 1);
    for (var s = 0; s < 4; s++) {
      poly([[220, 230 + s * 6], [244, 236 + s * 6], [244, 238 + s * 6], [220, 232 + s * 6]], P.brown0);
      poly([[254, 236 + s * 6], [278, 230 + s * 6], [278, 232 + s * 6], [254, 238 + s * 6]], P.brown0);
    }
    // trench coat, belted, to just below the knee
    poly([[206, 164], [249, 164], [249, 230], [212, 230]], P.card1);
    poly([[249, 164], [292, 164], [286, 230], [249, 230]], P.card0);
    R(240, 164, 1, 66, P.wood2); R(212, 228, 74, 2, P.wood2);
    R(208, 190, 82, 5, P.card0); R(208, 190, 82, 1, P.wood2); R(244, 189, 10, 7, P.wood1); R(246, 191, 6, 3, P.card0);
    R(232, 172, 3, 3, P.wood1); R(258, 172, 3, 3, P.wood1); R(232, 206, 3, 3, P.wood1); R(258, 206, 3, 3, P.wood1);
    // drawstring purse on the belt
    poly([[214, 196], [226, 196], [228, 210], [212, 210]], P.brown1); R(214, 196, 12, 2, P.brown0); R(219, 194, 2, 4, P.brown0);
    El(220, 205, 3, 2, P.brown2);
    K.armL(P.card1, P.card0, P.skinB1, P.skinB2);
    K.armR(P.card0, P.wood2, P.skinB1, P.skinB2);
    // signet ring
    R(200, 201, 6, 3, P.lamp3); R(202, 201, 2, 2, P.red1);
    // appointment card
    R(286, 204, 16, 11, P.paper); R(288, 206, 10, 1, P.night0); R(288, 209, 6, 1, P.night1); R(288, 212, 4, 1, P.night1);
    El(294, 212, 5, 4, P.skinB1);

    // upper half: double-breasted trench, collar up, buttoned to the neck
    poly([[188, 170], [200, 108], [226, 98], [272, 98], [298, 108], [310, 170]], P.card0);
    poly([[194, 170], [204, 110], [228, 100], [249, 100], [249, 170]], P.card1);
    poly([[204, 110], [226, 100], [232, 128], [212, 124]], P.card0);
    R(222, 120, 16, 8, P.card0);
    for (var b = 0; b < 3; b++) { R(234, 116 + b * 16, 3, 3, P.wood1); R(260, 116 + b * 16, 3, 3, P.wood1); }
    R(249, 100, 1, 70, P.wood2);
    poly([[232, 88], [240, 100], [258, 100], [266, 88], [266, 104], [232, 104]], P.card1);
    poly([[249, 100], [258, 100], [266, 88], [266, 104], [249, 104]], P.card0);
    R(240, 96, 18, 3, P.paper); R(250, 96, 8, 3, P.paperShade);
    R(247, 100, 4, 3, P.wood1);
    // neck, strong face, cropped hair combed forward
    R(241, 84, 16, 12, P.skinB1);
    El(249, 66, 18, 22, P.skinB1); El(246, 65, 15, 19, P.skinB2); D(256, 52, 12, 34, P.skinB0, 2);
    R(238, 64, 6, 2, P.night0); R(254, 64, 6, 2, P.night0);
    R(236, 60, 9, 2, P.hair0); R(253, 60, 9, 2, P.hair0);
    poly([[247, 64], [251, 64], [253, 75], [245, 75]], P.skinB1); R(245, 75, 8, 1, P.skinB0);
    R(242, 80, 14, 1, P.skinB0); R(240, 85, 18, 1, P.skinB0);
    El(249, 49, 19, 9, P.hair0);
    for (var h = 0; h < 7; h++) R(232 + h * 5, 52 + (h % 2), 3, 3, P.hair0);
    for (var h2 = 0; h2 < 5; h2++) R(236 + h2 * 6, 46 + (h2 % 2), 2, 2, P.hair1);
    R(230, 56, 4, 10, P.hair0); R(264, 56, 4, 10, P.hair0);
  };

  Z.romanCollar = zoom(function () {
    R(0, 0, 32, 24, P.skinB1);
    poly([[0, 8], [10, 14], [22, 14], [32, 8], [32, 24], [0, 24]], P.card1);
    poly([[16, 14], [22, 14], [32, 8], [32, 24], [16, 24]], P.card0);
    R(6, 9, 20, 5, P.paper); R(6, 11, 20, 1, P.paperShade); R(16, 9, 10, 5, P.paperShade);
    R(14, 15, 4, 4, P.wood1); R(15, 16, 2, 2, P.card0);
    R(0, 6, 32, 2, P.skinB0);
  });
  Z.romanSandal = zoom(function () {
    R(0, 0, 32, 24, P.night1);
    R(0, 0, 32, 5, P.card0); R(0, 4, 32, 1, P.wood2);
    R(4, 5, 10, 19, P.skinB2); R(18, 5, 10, 19, P.skinB1);
    for (var i = 0; i < 4; i++) {
      poly([[4, 6 + i * 5], [14, 9 + i * 5], [14, 10 + i * 5], [4, 7 + i * 5]], P.brown0);
      poly([[18, 9 + i * 5], [28, 6 + i * 5], [28, 7 + i * 5], [18, 10 + i * 5]], P.brown0);
    }
    R(4, 5, 1, 19, P.skinB0); R(27, 5, 1, 19, P.skinB0);
  });
  Z.romanPurse = zoom(function () {
    R(0, 0, 32, 24, P.card1);
    R(0, 0, 32, 3, P.card0);
    poly([[8, 3], [16, 3], [18, 8], [6, 8]], P.brown1); R(6, 6, 12, 1, P.brown0); R(11, 0, 2, 4, P.brown0);
    El(12, 15, 9, 8, P.brown1); D(4, 8, 18, 16, P.brown0, 1);
    El(24, 17, 5, 5, P.fog); El(24, 17, 4, 4, P.paperShade); El(23, 16, 1, 2, P.steel); R(22, 18, 3, 1, P.steel);
    El(19, 21, 3, 3, P.fog);
  });
  Z.romanCard = zoom(function () {
    R(0, 0, 32, 24, P.skinB1);
    R(2, 2, 28, 20, P.paper);
    word('KANE', 9, 4, P.night0);
    word('XIII', 4, 11, P.night0); R(20, 13, 1, 1, P.night0); word('X', 23, 11, P.night0);
    word('III', 11, 17, P.red0);
  });
  Z.romanRing = zoom(function () {
    R(0, 0, 32, 24, P.skinB1);
    R(0, 0, 32, 4, P.skinB2);
    for (var i = 0; i < 3; i++) R(0, 9 + i * 5, 32, 1, P.skinB0);
    R(8, 8, 16, 10, P.lamp3); R(8, 8, 16, 1, P.lamp4);
    El(16, 13, 5, 4, P.red0); El(16, 13, 4, 3, P.red1);
    R(14, 11, 4, 1, P.red0); R(15, 12, 2, 3, P.red0); R(13, 12, 1, 1, P.red0); R(18, 12, 1, 1, P.red0);
  });
})();
