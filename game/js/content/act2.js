/*
 * Act Two visitors (night.js schedules them):
 *   doe        R. Halloway, Dept. of Energy     legit     12:18  (let through; rude, on the list)
 *   victorian  "Dr. Pembroke", 1880s            intruder  12:30  (shoot or turn away)
 *   intern     Marcus Bell, summer intern       legit     12:58  (let through; retro red herring)
 *   monk       "Brother Anselm", 1300s          intruder  1:10   (shoot or turn away)
 *   mit        Dr. Samuel Okafor, MIT           legit     1:24   (let through; teaches heardKessler)
 *   soldier    "Ed Novak, just a veteran", WWII intruder  1:38   (shoot or turn away)
 */
(function () {
  var E = window.EMIT, C = E.content.characters, V = E.content.visitors, K = E.art.kit, P = K.P;

  /* ---------- shared bits ---------- */
  // 3x5 capitals for tiny printed words in the close-ups
  var FONT = {
    A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110',
    E: '111100110100111', G: '011100101101011', H: '101101111101101', I: '111010010010111',
    K: '101101110101101', L: '100100100100111', M: '101111111101101', N: '110101101101101',
    O: '010101101101010', P: '110101110100100', Q: '010101101110011', R: '110101110101101',
    S: '011100010001110', T: '111010010010010', U: '101101101101111', V: '101101101101010',
    X: '101101010101101', Y: '101101010010010', '-': '000000111000000'
  };
  function word(z, str, x, y, col) {
    z.fillStyle = col;
    for (var k = 0; k < str.length; k++) {
      var ch = str[k];
      if (/[0-9.]/.test(ch)) { E.art.digits(z, ch, x, y, col); z.fillStyle = col; x += ch === '.' ? 2 : 4; continue; }
      if (ch === 'M') { ['10001', '11011', '10101', '10001', '10001'].forEach(function (row, j) { for (var q = 0; q < 5; q++) if (row[q] === '1') z.fillRect(x + q, y + j, 1, 1); }); x += 6; continue; }
      var gl = FONT[ch];
      if (gl) for (var i = 0; i < 15; i++) if (gl[i] === '1') z.fillRect(x + i % 3, y + Math.floor(i / 3), 1, 1);
      x += 4;
    }
  }
  function zoom(name, fn) { E.art.zooms[name] = function (z) { K.on(z, function () { fn(z); }); }; }
  function shot(id, line, note) {
    return { steps: [
      { sfx: 'gunshot' },
      { exit: 'fall' },
      { backdrop: 'body' },
      { narrate: line },
      { note: [id, note] }
    ] };
  }

  /* =====================================================================
   * 1. R. Halloway, Department of Energy (legit, on the list)
   * ===================================================================== */
  C.doe = { name: 'R. Halloway, DOE', notebookName: 'R. Halloway, Dept. of Energy', portrait: 'doe' };

  V.doe = {
    id: 'doe',
    truth: 'legit',
    prompt: 'He has the look of a man composing a memo about you.',
    arrive: [
      { crt: ['CAM 02 LOT', '> VEHICLE: SEDAN', '> FIRE LANE'] },
      { narrate: 'A grey government sedan pulled into the fire lane and stayed there.' },
      { sfx: 'door' },
      { narrate: 'The man who got out shook his umbrella like it owed him money.' },
      { enter: 'doe' }
    ],
    greeting: [
      { who: 'doe', say: 'Halloway, Department of Energy. I\'m expected, and I\'m late, and neither one is my fault.' },
      { who: 'doe', say: 'So let\'s skip the part where you squint at me.' }
    ],
    inspect: [
      { title: 'Badge', zoom: 'doeBadge', x: 264, y: 114, w: 18, h: 16,
        text: 'Laminated, U.S. DEPARTMENT OF ENERGY, a blue Q in the corner. The photo scowls exactly like he does.',
        note: 'DOE badge, laminated, with a Q clearance mark. Photo matches, scowl and all.' },
      { title: 'Tie clip', zoom: 'doeTie', x: 242, y: 124, w: 14, h: 12,
        text: 'A tie clip with a little enamel atom on it. The kind of thing you get for twenty years of service.',
        note: 'Tie clip with an enamel atom on it. A service award, probably.' },
      { title: 'Umbrella', zoom: 'doeUmbrella', x: 194, y: 190, w: 18, h: 56,
        text: 'A black government-issue umbrella, furled tight and dripping on my floor. He hasn\'t noticed. Or cared.',
        note: 'Wet umbrella, dripping on the lobby floor. He came in from the rain like everyone else.' },
      { title: 'Briefcase', zoom: 'doeBriefcase', x: 276, y: 198, w: 36, h: 38,
        text: 'Scuffed leather, combination locks. Tractor-feed printout sticking out the top, holes down both edges.',
        note: 'Briefcase with a dot-matrix printout sticking out of it.' }
    ],
    opening: {
      name: [
        { who: 'doe', say: 'Halloway. R. Halloway. It\'s on the badge, which I am holding at your eye level for a reason.' },
        { note: ['doe', 'R. Halloway, U.S. Department of Energy. Rude about it.'] }
      ],
      want: [
        { who: 'doe', say: 'A meeting with Dr. Kane. Tonight. The visit request went through Germantown three days ago.' },
        { who: 'doe', say: 'Your building pulled four megawatts off the county grid this evening. That\'s not a lab. That\'s a smelter.' },
        { note: ['doe', 'Here to see Kane about the building drawing four megawatts off the grid tonight. Visit filed through Germantown.'] }
      ],
      how: [
        { who: 'doe', say: 'Motor pool sedan. It\'s in your fire lane. Ticket it and see what happens to your week.' },
        { note: ['doe', 'Drove a government motor pool sedan. Parked it in the fire lane.'] }
      ]
    },
    questions: [
      { id: 'list', ask: 'Let me check the list.', requires: 'saw:desk.list', steps: [
        { 'if': 'run:hasList', then: [
          { narrate: 'Top of the clipboard. R. Halloway, U.S. Dept. of Energy, seeing Dr. Kane.' },
          { who: 'doe', say: 'Yes. I know. I typed the request.' },
          { note: ['doe', 'On Kane\'s list: R. Halloway, U.S. Dept. of Energy.'] }
        ], 'else': [
          { narrate: 'The clipboard was empty. He watched me read nothing.' }
        ] }
      ] },
      { id: 'badge', ask: 'What\'s the Q on the badge?', requires: 'saw:doeBadge', steps: [
        { who: 'doe', say: 'Q clearance. Which is more clearance than this entire building has, including you.' },
        { who: 'doe', say: 'Are we finished with show-and-tell?' },
        { note: ['doe', 'Has a Q clearance and wanted me to know it.'] }
      ] },
      { id: 'tie', ask: 'Nice tie clip.', requires: 'saw:doeTie', steps: [
        { who: 'doe', say: 'Twenty years. They give you a clip and a handshake, and then they take the handshake back.' },
        { narrate: 'For a second he almost looked human. Then he checked his watch.' },
        { note: ['doe', 'Twenty years at the department. The tie clip was his service award.'] }
      ] },
      { id: 'umbrella', ask: 'Mind leaving the umbrella by the door?', requires: 'saw:doeUmbrella', steps: [
        { who: 'doe', say: 'It\'s government property. It stays with me. Put down a towel if the floor matters to you.' },
        { note: ['doe', 'Wouldn\'t leave his umbrella by the door. "Government property."'] }
      ] },
      { id: 'printout', ask: 'What\'s the printout?', requires: 'saw:doeBriefcase', steps: [
        { who: 'doe', say: 'The utility\'s load log. Spikes at nine-forty, ten-fifteen, ten fifty-two. Four megawatts each.' },
        { who: 'doe', say: 'Nobody pulls that much power by accident. Somebody upstairs is going to explain it to me.' },
        { narrate: 'I wrote the times down. Somebody else in this town was going to want them.' },
        { note: ['doe', 'His printout logs four-megawatt power spikes at 9:40, 10:15 and 10:52.'] }
      ] },
      { id: 'kessler', ask: 'Ever deal with Kessler Dynamics?', requires: 'heardKessler', steps: [
        { who: 'doe', say: 'Kessler filed for a power waiver last spring. Different form, different office. Not my problem tonight.' },
        { note: ['doe', 'Knows Kessler Dynamics filed a power waiver last spring. Not why he\'s here.'] }
      ] }
    ],
    actions: {
      letThrough: { steps: [
        { narrate: 'I waved him to the stairs. He didn\'t say thank you. I hadn\'t expected him to.' },
        { who: 'doe', say: 'About time.' },
        { exit: 'walk' },
        { narrate: 'He left a trail of drips all the way to the stairwell door.' },
        { note: ['doe', 'Let him up. He was on the list and he knew it.'] }
      ] },
      turnAway: { steps: [
        { narrate: 'I told him the doctor wasn\'t seeing anyone else tonight.' },
        { who: 'doe', say: 'Is that so. What\'s your badge number?' },
        { narrate: 'He read it off my shirt and wrote it down. Four-four-seven-one. He underlined it.' },
        { who: 'doe', say: 'You\'ll be in a report by eight A.M. I\'ll be back long before then.' },
        { exit: 'walk' },
        { note: ['doe', 'Turned him away. He took my badge number and said he\'d be back.'] }
      ] },
      shoot: { steps: [
        { sfx: 'gunshot' },
        { exit: 'fall' },
        { narrate: 'The umbrella rolled across the lobby. The printout slid out of the briefcase. His name was on my clipboard.' },
        { pause: 500 },
        { narrate: 'Shoot a man from the Department of Energy and the federal government notices. It noticed by one A.M.' },
        { note: ['doe', 'I shot Halloway. He was on the list. Rude isn\'t a reason.'] },
        { reset: 'You shot R. Halloway from the Department of Energy. He was on the list.' }
      ] },
      shutdown: { steps: [
        { narrate: 'I pointed Kane\'s device at him and pressed the button. Nothing.' },
        { who: 'doe', say: 'Did you just point a garage door opener at a federal official?' },
        { note: ['doe', 'Tried the device on him. Nothing, except he\'s angrier.'] }
      ] }
    },
    returnArrive: [
      { crt: ['CAM 02 LOT', '> VEHICLE: SEDAN', '> FIRE LANE'] },
      { narrate: 'The grey sedan was back in the fire lane, parked crooked this time.' },
      { sfx: 'door' },
      { narrate: 'Halloway came through the door with the umbrella still furled and a fresh sheet of fax paper in his fist.' }
    ],
    returnGreeting: [
      { who: 'doe', say: 'I just spent twenty minutes on a pay phone with Deputy Assistant Secretary Hensley.' },
      { who: 'doe', say: 'She wants my report on her desk by two A.M. Not two-oh-five. Two.' },
      { who: 'doe', say: 'If I\'m not upstairs in five minutes, badge four-four-seven-one is the first line of it.' },
      { note: ['doe', 'Came back. His supervisor, Deputy Asst. Secretary Hensley, wants his report by 2 A.M.'] }
    ],
    secondTurnAway: { steps: [
      { narrate: 'I sent him away a second time. He didn\'t shout. That was worse.' },
      { who: 'doe', say: 'Fine. Then the review finds against you.' },
      { exit: 'walk' },
      { pause: 600 },
      { narrate: 'By two the building was red-tagged. By two-fifteen there were men in the lobby. Then the light came.' },
      { note: ['doe', 'Turned Halloway away twice. The department shut the building down.'] },
      { reset: 'You turned R. Halloway away twice.' }
    ] }
  };

  /* =====================================================================
   * 2. "Dr. Pembroke, consulting physician" (intruder, 1880s)
   * ===================================================================== */
  C.victorian = { name: 'Dr. Pembroke', notebookName: '"Dr. Pembroke", consulting physician', portrait: 'victorian' };

  V.victorian = {
    id: 'victorian',
    truth: 'intruder',
    prompt: 'He is looking at the overhead lights as if they might be rude to him.',
    arrive: [
      { crt: ['CAM 01 LOBBY', '> MOTION: 1', '> REC'] },
      { narrate: 'A tall black hat came in first. The man under it carried a doctor\'s bag and a great deal of whisker.' },
      { enter: 'victorian' }
    ],
    greeting: [
      { who: 'victorian', say: 'Good evening. Dr. Pembroke, consulting physician. Dr. Kane has sent for me.' },
      { who: 'victorian', say: 'If you would be so good as to take my card up to him, my man.' },
      { set: 'callOffer:victorian' }
    ],
    inspect: [
      { title: 'Hat', zoom: 'victorianHat', x: 228, y: 16, w: 42, h: 34,
        text: 'A silk top hat, rain beaded on the nap. Somebody\'s been to a wedding, or a magic act.',
        note: 'Silk top hat, wet from the rain.' },
      { title: 'Whiskers', zoom: 'victorianWhiskers', x: 226, y: 66, w: 46, h: 22,
        text: 'Mutton chops down to the jaw, chin shaved clean. Half the bands on the radio have worse.',
        note: 'Big mutton-chop sideburns, chin shaved.' },
      { title: 'Breast pocket', zoom: 'victorianThermo', x: 266, y: 108, w: 14, h: 18,
        text: 'A thermometer in a little brass screw-top case, mercury glass. Engraved, worn smooth at the cap.',
        note: 'Glass mercury thermometer in an engraved brass case, in his breast pocket.' },
      { title: 'Gloves', zoom: 'victorianGloves', x: 196, y: 196, w: 18, h: 18,
        text: 'Grey kid gloves, buttoned at the wrist with one pearl button. He hasn\'t taken them off.',
        note: 'Grey kid gloves with a pearl button. Kept them on.' },
      { title: 'Bag', zoom: 'victorianBag', x: 276, y: 202, w: 36, h: 40,
        text: 'A leather doctor\'s bag with a brass frame, the old split-top kind. It smells of camphor.',
        note: 'Leather doctor\'s bag with a brass frame. Smells of camphor.' }
    ],
    opening: {
      name: [
        { who: 'victorian', say: 'Pembroke. Dr. Edmund Pembroke. Late of Edinburgh, now of Harley Street.' },
        { narrate: 'He handed me a card. Heavy stock, copperplate. No phone number on it.' },
        { note: ['victorian', 'Calls himself Dr. Edmund Pembroke, of Harley Street. His card has no phone number.'] }
      ],
      want: [
        { who: 'victorian', say: 'Dr. Kane sent for me. A disorder of the nerves, I\'m told. Overwork, and lightning.' },
        { who: 'victorian', say: 'Kindly show me up. A physician should not be kept standing in a vestibule.' },
        { note: ['victorian', 'Says Kane sent for him about a "disorder of the nerves".'] }
      ],
      how: [
        { who: 'victorian', say: 'By hansom cab. The driver would go no farther than your gate.' },
        { who: 'victorian', say: 'The horse took fright at your lamps. I can\'t say I blame the animal.' },
        { narrate: 'A hansom cab. With a horse. I looked out at the lot. It was full of puddles and nothing else.' },
        { note: ['victorian', 'Says he came by hansom cab and the horse spooked at our lights.'] }
      ]
    },
    questions: [
      { id: 'list', ask: 'You\'re not on my list.', requires: 'saw:desk.list', steps: [
        { who: 'victorian', say: 'Lists are for tradesmen. Send word upstairs and the doctor will vouch for me.' },
        { note: ['victorian', 'Not on Kane\'s visitor list. "Lists are for tradesmen."'] },
        { set: 'callOffer:victorian' }
      ] },
      { id: 'callUp', ask: 'I\'ll ring Dr. Kane\'s lab and ask.', requires: 'run:callOffer:victorian', steps: [
        { narrate: 'I dialled Kane\'s lab on four from the desk phone. It rang six times, then the machine picked up.' },
        { narrate: 'A dry recorded voice: Dr. Kane\'s laboratory, not taking calls. Leave a message at the tone.' },
        { who: 'victorian', say: 'You are speaking into that thing, and a gramophone is answering? Extraordinary.' },
        { note: ['victorian', 'Rang Kane\'s lab to ask about him. Answering machine. He thought it was a gramophone.'] }
      ] },
      { id: 'phone', ask: 'What number can I call to confirm?', requires: 'saw:desk.list', steps: [
        { who: 'victorian', say: 'Number? I have a telegraph address. PEMBROKE, LONDON will find me.' },
        { narrate: 'A telegraph address. I didn\'t know they still sent telegrams. Neither, I suspected, did he.' },
        { note: ['victorian', 'Asked for a number to call. He gave me a telegraph address.'] }
      ] },
      { id: 'thermo', ask: 'What\'s the thermometer for?', requires: 'saw:victorianThermo', steps: [
        { who: 'victorian', say: 'For the fever, naturally. Though I suspect your doctor\'s trouble is electrical.' },
        { who: 'victorian', say: 'An imbalance of the electrical humours. Common in men who work with lightning.' },
        { narrate: 'Electrical humours. I wrote it down so I could ask somebody who went to college.' },
        { note: ['victorian', 'Says Kane is suffering "an imbalance of the electrical humours".'] }
      ] },
      { id: 'gloves', ask: 'You can take the gloves off. It\'s warm in here.', requires: 'saw:victorianGloves', steps: [
        { who: 'victorian', say: 'A physician does not go barehanded among the sick. Not since Lister.' },
        { narrate: 'The only Lister I knew was on a bottle of mouthwash.' },
        { note: ['victorian', 'Won\'t take his gloves off. "Not since Lister."'] }
      ] },
      { id: 'bag', ask: 'Mind opening the bag for me?', requires: 'saw:victorianBag', steps: [
        { narrate: 'He sighed and opened it. A wooden stethoscope, one straight tube like a little trumpet.' },
        { narrate: 'Under it, a brown bottle with a hand-written label: LAUDANUM.' },
        { who: 'victorian', say: 'For the nerves. Twenty drops in a glass of claret. He\'ll sleep like a child.' },
        { note: ['victorian', 'His bag: a wooden trumpet stethoscope and a bottle of laudanum "for the nerves".'] }
      ] },
      { id: 'hat', ask: 'Big night out?', requires: 'saw:victorianHat', steps: [
        { who: 'victorian', say: 'Hardly. One dresses properly to call on a patient. I see standards have slipped here.' },
        { narrate: 'He looked at my uniform shirt the way I look at a parking ticket.' },
        { note: ['victorian', 'Thinks a top hat is ordinary dress for a house call.'] }
      ] }
    ],
    actions: {
      letThrough: { steps: [
        { narrate: 'I let him up. He climbed the stairs like he was counting them for a bill.' },
        { exit: 'walk' },
        { pause: 800 },
        { sfx: 'distant' },
        { narrate: 'Twenty drops in a glass of something. Then the fourth floor went quiet, and the light came.' },
        { note: ['victorian', 'Let him up. Whatever was in that bag, Kane got it. The night started over.'] },
        { reset: 'You let a doctor from the 1880s through.' }
      ] },
      turnAway: { steps: [
        { narrate: 'I told him the doctor had a doctor already.' },
        { who: 'victorian', say: 'Then I pity him. Good night to you.' },
        { exit: 'walk' },
        { narrate: 'He walked out into the rain looking for a cab that wasn\'t coming.' },
        { note: ['victorian', 'Turned him away. He went looking for a hansom cab.'] }
      ] },
      shoot: shot('victorian',
        'The hat went one way and the bag went the other. The laudanum bottle didn\'t even break.',
        'Shot "Dr. Pembroke". Laudanum in the bag, nineteenth century in the head.'),
      shutdown: { steps: [
        { narrate: 'I pointed Kane\'s device at him and pressed the button. Nothing.' },
        { who: 'victorian', say: 'Is that an electrical apparatus? Put it away, man, before you do yourself an injury.' },
        { note: ['victorian', 'The device does nothing to him. He thinks it\'s dangerous.'] }
      ] }
    }
  };

  /* =====================================================================
   * 3. Marcus Bell, summer intern (legit, red herring)
   * ===================================================================== */
  C.intern = { name: 'Marcus Bell', notebookName: 'Marcus Bell, intern, Lab 2', portrait: 'intern' };

  V.intern = {
    id: 'intern',
    truth: 'legit',
    prompt: 'A kid in his dad\'s idea of a cool jacket. Or his grandad\'s.',
    arrive: [
      { crt: ['CAM 02 LOT', '> VEHICLE', '> REC'] },
      { narrate: 'A hatchback idled in the lot, wipers going. A kid got out of the passenger side and ran for it.' },
      { sfx: 'door' },
      { enter: 'intern' }
    ],
    greeting: [
      { who: 'intern', say: 'Hey. Hi. I\'m supposed to be in Lab 2, like, ten minutes ago.' },
      { who: 'intern', say: 'Dr. Halvorsen\'s gonna have a cow.' }
    ],
    inspect: [
      { title: 'Walkman', zoom: 'internWalkman', x: 226, y: 182, w: 16, h: 18,
        text: 'A yellow sports Walkman clipped to his belt, foam headphones round his neck. A tape is still turning.',
        note: 'Yellow Walkman on his belt, headphones round his neck, tape playing.' },
      { title: 'Jacket', zoom: 'internJacket', x: 200, y: 106, w: 28, h: 30,
        text: 'Tan suede, collar out to here, straight out of the seventies. A thrift-store tag still pinned inside: $8.',
        note: 'Seventies suede jacket with an $8 thrift-store tag still pinned in it.' },
      { title: 'Badge', zoom: 'internBadge', x: 264, y: 116, w: 15, h: 18,
        text: 'Science Corp ID, INTERN across the top in red. BELL, M. LAB 2. This year\'s sticker.',
        note: 'Science Corp intern badge: BELL, M., Lab 2, this year\'s sticker.' },
      { title: 'Paper sack', zoom: 'internSack', x: 190, y: 202, w: 28, h: 32,
        text: 'A drive-thru sack, grease spots, a receipt stapled to the fold: $3.27.',
        note: 'Drive-thru bag with a $3.27 receipt stapled on.' }
    ],
    opening: {
      name: [
        { who: 'intern', say: 'Marcus. Marcus Bell. I\'m the intern? Lab 2? I\'m on the list. Probably. Hopefully.' },
        { note: ['intern', 'Marcus Bell, intern in Lab 2. Thinks he\'s on the list.'] }
      ],
      want: [
        { who: 'intern', say: 'Late shift with Dr. Halvorsen. I babysit a centrifuge till six. It\'s da bomb.' },
        { who: 'intern', say: 'Not. It\'s, like, the opposite of da bomb.' },
        { note: ['intern', 'Watches a centrifuge in Lab 2 for Dr. Halvorsen till six.'] }
      ],
      how: [
        { who: 'intern', say: 'My mom drove me. That\'s her Tercel. She won\'t leave till she sees me get in.' },
        { narrate: 'Out in the lot, the hatchback flashed its lights at me. Twice.' },
        { note: ['intern', 'His mom drove him in her Tercel. She\'s waiting in the lot.'] }
      ]
    },
    questions: [
      { id: 'list', ask: 'Let me check the list.', requires: 'saw:desk.list', steps: [
        { 'if': 'run:hasList', then: [
          { narrate: 'Near the bottom, in a different pen: M. Bell, Summer intern, Lab 2.' },
          { who: 'intern', say: 'Sweet. I exist.' },
          { note: ['intern', 'On Kane\'s list: M. Bell, Summer intern, Lab 2.'] }
        ], 'else': [
          { narrate: 'The clipboard was empty.' },
          { who: 'intern', say: 'As if. Story of my life.' }
        ] }
      ] },
      { id: 'summer', ask: 'Summer intern? It\'s October.', requires: 'saw:internBadge', steps: [
        { who: 'intern', say: 'They kept me on part-time. Nights, \'cause of school. My guidance counselor\'s psyched.' },
        { who: 'intern', say: 'Looks good for college, supposedly. Nobody told me about the centrifuge.' },
        { note: ['intern', 'Summer intern kept on part-time, nights, around school.'] }
      ] },
      { id: 'tape', ask: 'What are you listening to?', requires: 'saw:internWalkman', steps: [
        { who: 'intern', say: 'Mixtape. Number four. Took me all weekend taping stuff off the radio.' },
        { who: 'intern', say: 'My dad still has an eight-track in his Buick. Eight-track! It\'s like a museum on wheels.' },
        { note: ['intern', 'Playing a mixtape he taped off the radio. Joked about his dad\'s 8-track.'] }
      ] },
      { id: 'jacket', ask: 'Nice jacket. Seventies?', requires: 'saw:internJacket', steps: [
        { who: 'intern', say: 'Totally. Goodwill on Fifth, eight bucks. My dad says he had the exact same one.' },
        { who: 'intern', say: 'As if he was ever this cool.' },
        { note: ['intern', 'Bought the jacket at Goodwill for eight bucks.'] }
      ] },
      { id: 'sack', ask: 'Dinner?', requires: 'saw:internSack', steps: [
        { who: 'intern', say: 'Three tacos and a Coke. Three twenty-seven. Dinner of champions.' },
        { who: 'intern', say: 'Lab 2 ordered pizza earlier but I bet those guys ate it all. They always do.' },
        { note: ['intern', 'Tacos and a Coke for $3.27. Knows Lab 2 ordered pizza tonight.'] }
      ] },
      { id: 'milk', ask: 'Got milk?', requires: 'stoppedAndroid', steps: [
        { who: 'intern', say: 'What, like the commercials? With the mustache?' },
        { who: 'intern', say: 'Dude, I\'m lactose intolerant. Don\'t even.' },
        { narrate: 'He knew the ad. He hated the ad. About as human as it gets.' },
        { note: ['intern', 'Knew the "Got milk?" ads right away.'] }
      ] }
    ],
    actions: {
      letThrough: { steps: [
        { narrate: 'I buzzed him in. He was through the stairwell door before the buzzer stopped.' },
        { who: 'intern', say: 'You\'re da bomb, man!' },
        { exit: 'walk' },
        { narrate: 'Out in the lot, the Tercel flashed its lights once and pulled away.' },
        { note: ['intern', 'Let him up to Lab 2. His mom drove off happy.'] }
      ] },
      turnAway: { steps: [
        { narrate: 'I told him nobody goes up after midnight without a call from upstairs.' },
        { who: 'intern', say: 'Seriously? Dr. Halvorsen\'s gonna kill me. And then my mom\'s gonna kill me.' },
        { exit: 'walk' },
        { narrate: 'He trudged back to the Tercel. It didn\'t leave the lot.' },
        { note: ['intern', 'Turned him away. His mom didn\'t drive off. He\'ll be back.'] }
      ] },
      shoot: { steps: [
        { sfx: 'gunshot' },
        { exit: 'fall' },
        { narrate: 'The Walkman hit the floor and kept playing. Out in the lot, a woman in a Tercel started screaming.' },
        { pause: 500 },
        { narrate: 'He was sixteen and he was on the list. Nothing about him was from anywhere but here.' },
        { note: ['intern', 'I shot the intern. He was on the list. A retro jacket, nothing else.'] },
        { reset: 'You shot Marcus Bell, the intern. He was on the list.' }
      ] },
      shutdown: { steps: [
        { narrate: 'I pointed Kane\'s device at him and pressed the button. Nothing.' },
        { who: 'intern', say: 'Whoa. Is that a tricorder? Can I see it? No? Okay.' },
        { note: ['intern', 'Tried the device on him. He thought it was a tricorder.'] }
      ] }
    },
    returnArrive: [
      { crt: ['CAM 02 LOT', '> VEHICLE', '> REC'] },
      { narrate: 'The Tercel\'s door slammed. The intern came back in, and this time his mother was right behind him.' },
      { sfx: 'door' }
    ],
    returnGreeting: [
      { who: 'intern', say: 'Okay, so Dr. Halvorsen paged my mom. Like, from the lab. Her pager went off in the car.' },
      { who: 'intern', say: 'He says the centrifuge is beeping and he needs me now. Please, man. She\'s right there.' },
      { narrate: 'Through the glass his mother pointed at me, then at the stairs. I got the message.' },
      { note: ['intern', 'Came back. Dr. Halvorsen paged his mom; Lab 2 needs him now.'] }
    ],
    secondTurnAway: { steps: [
      { narrate: 'I sent him away again. His mother came to the glass and said things I won\'t write down.' },
      { exit: 'walk' },
      { pause: 600 },
      { narrate: 'Nobody watched the centrifuge in Lab 2. At two-ten it shook itself off the bench. Then the light came.' },
      { note: ['intern', 'Turned the intern away twice. Lab 2 had an accident nobody was there to stop.'] },
      { reset: 'You turned Marcus Bell away twice.' }
    ] }
  };

  /* =====================================================================
   * 4. "Brother Anselm, from St. Brendan's" (intruder, 1300s)
   * ===================================================================== */
  C.monk = { name: 'Brother Anselm', notebookName: '"Brother Anselm", St. Brendan\'s', portrait: 'monk' };

  V.monk = {
    id: 'monk',
    truth: 'intruder',
    prompt: 'He keeps one eye on the glass doors, as if they might come for him.',
    arrive: [
      { crt: ['CAM 01 LOBBY', '> MOTION: 1', '> REC'] },
      { narrate: 'A brown robe stood outside the glass for a long time, working out where the handle was.' },
      { sfx: 'door' },
      { narrate: 'The door slid open on its own. He jumped back a full yard, then came in sideways.' },
      { enter: 'monk' }
    ],
    greeting: [
      { who: 'monk', say: 'Peace be upon this house. I am Brother Anselm, of St. Brendan\'s, down the road.' },
      { who: 'monk', say: 'I seek the learned man who keeps the lightning. Dr. Kane, they call him.' },
      { sfx: 'door' },
      { narrate: 'Behind him the automatic door slid open again for nobody. He spun round.' },
      { who: 'monk', say: 'Deus, in adiutorium meum intende!' },
      { narrate: 'Latin. I\'d heard it in church once, when I was eight, from an old priest who smelled of cough drops.' },
      { learn: 'heardMonkLatin' },
      { note: ['monk', 'The automatic door scared him half to death. He cried out in Latin.'] }
    ],
    inspect: [
      { title: 'Haircut', zoom: 'monkTonsure', x: 228, y: 36, w: 42, h: 22,
        text: 'Shaved bald on top, a ring of hair all the way round. Like a monk in a cartoon. Or a monk.',
        note: 'Bald crown with a ring of hair round it. A tonsure.' },
      { title: 'Rope belt', zoom: 'monkBelt', x: 228, y: 180, w: 16, h: 44,
        text: 'A rope belt, knotted three times where it hangs. My aunt said the knots mean poverty, chastity, obedience.',
        note: 'Rope belt with three knots in the hanging end.' },
      { title: 'Purse', zoom: 'monkPurse', x: 252, y: 186, w: 16, h: 24,
        text: 'A little leather purse on a cord. Three silver coins inside, thin as fingernails, cut a bit crooked.',
        note: 'Leather purse with three thin, crooked silver coins in it.' },
      { title: 'Feet', zoom: 'monkSandals', x: 214, y: 236, w: 70, h: 10,
        text: 'Leather sandals, bare toes red with cold, mud to the ankle. It\'s forty degrees and raining.',
        note: 'Bare feet in sandals, muddy to the ankles, in October rain.' }
    ],
    opening: {
      name: [
        { who: 'monk', say: 'Anselm. Brother Anselm, of the house of St. Brendan, down the road.' },
        { note: ['monk', 'Calls himself Brother Anselm, from St. Brendan\'s "down the road".'] }
      ],
      want: [
        { who: 'monk', say: 'Shelter from the storm, and a word with your master. The one who works in lightning.' },
        { who: 'monk', say: 'I have seen his fires from the hill. I must know if they are of God.' },
        { note: ['monk', 'Wants to see Kane, "the one who works in lightning". Called him my master.'] }
      ],
      how: [
        { who: 'monk', say: 'On foot. I followed the light in the sky until the road became black stone.' },
        { narrate: 'Black stone. He meant the asphalt. He\'d stepped onto it like it might be hot.' },
        { note: ['monk', 'Walked here following the flashes. Called the road "black stone".'] }
      ]
    },
    questions: [
      { id: 'road', ask: 'You walked in those? Which road?', requires: 'saw:monkSandals', steps: [
        { who: 'monk', say: 'Past the mill, down to the ford where the ferryman drowned. The water runs low at Michaelmas.' },
        { who: 'monk', say: 'Then up the hill by the gallows oak. You cannot miss it.' },
        { narrate: 'Six years of driving this county. No mill. No ford. The only gallows I knew of was the zoning board.' },
        { note: ['monk', 'Asked which road. He described a ford, a mill and a gallows oak. None of them exist here.'] }
      ] },
      { id: 'latin', ask: 'What was that you shouted?', requires: 'now:heardMonkLatin', steps: [
        { who: 'monk', say: 'Forgive me. The door. It opened with no hand upon it.' },
        { who: 'monk', say: 'Is it the Devil\'s work, or your master\'s?' },
        { note: ['monk', 'Thinks the automatic door is the Devil\'s work, or Kane\'s.'] }
      ] },
      { id: 'list', ask: 'Which St. Brendan\'s? I\'ll call over.', requires: 'saw:desk.list', steps: [
        { who: 'monk', say: 'Call? You need not shout. It is only across the valley.' },
        { narrate: 'Not on the clipboard. No St. Brendan\'s in the phone book, either. I\'d looked once, for a funeral.' },
        { note: ['monk', 'Not on the list. Thought "call over" meant shouting across the valley.'] }
      ] },
      { id: 'tonsure', ask: 'Which order are you with?', requires: 'saw:monkTonsure', steps: [
        { who: 'monk', say: 'The Order of St. Benedict. Our abbot is Father Walter. He holds the land from the king.' },
        { narrate: 'From the king. I let that one sit on the counter between us.' },
        { note: ['monk', 'Says his abbot "holds the land from the king".'] }
      ] },
      { id: 'purse', ask: 'What\'s in the purse?', requires: 'saw:monkPurse', steps: [
        { who: 'monk', say: 'Three pennies. Enough for bread and a bed at any inn. Will you take one, for your kindness?' },
        { narrate: 'He held out a silver penny the size of my thumbnail, a king\'s head on it. Bread and a bed.' },
        { note: ['monk', 'Offered me a hand-struck silver penny. Thinks three of them buy bread and a bed.'] }
      ] },
      { id: 'belt', ask: 'What are the knots for?', requires: 'saw:monkBelt', steps: [
        { who: 'monk', say: 'Poverty, chastity, obedience. One for each vow.' },
        { note: ['monk', 'Three knots, one for each vow. Knows his stuff.'] }
      ] }
    ],
    actions: {
      letThrough: { steps: [
        { narrate: 'I let him up. He crossed himself at the stairwell door and went through it at a run.' },
        { exit: 'walk' },
        { pause: 800 },
        { sfx: 'distant' },
        { narrate: 'He found the lightning. Somebody had sent him to put it out. The light came anyway.' },
        { note: ['monk', 'Let him up. He came to put out "the lightning". The night started over.'] },
        { reset: 'You let a monk from the 1300s through.' }
      ] },
      turnAway: { steps: [
        { narrate: 'I told him the master wasn\'t receiving pilgrims tonight.' },
        { who: 'monk', say: 'Then God keep you, porter. And keep you from that door.' },
        { exit: 'walk' },
        { narrate: 'He waited for the door to open, flinched, and went out into the rain in his sandals.' },
        { note: ['monk', 'Turned him away. He called me "porter".'] }
      ] },
      shoot: shot('monk',
        'He went down without a word. The purse spilled three silver pennies across the floor.',
        'Shot "Brother Anselm". Three hand-struck pennies on the floor.'),
      shutdown: { steps: [
        { narrate: 'I pointed Kane\'s device at him and pressed the button. Nothing.' },
        { who: 'monk', say: 'Pater noster, qui es in caelis...' },
        { narrate: 'He prayed at it until I put it away.' },
        { note: ['monk', 'The device does nothing to him. He prayed at it.'] }
      ] }
    }
  };

  /* =====================================================================
   * 5. Dr. Samuel Okafor, MIT (legit, red herring, on the list)
   * ===================================================================== */
  C.mit = { name: 'Dr. Samuel Okafor', notebookName: 'Dr. S. Okafor, MIT', portrait: 'mit' };

  V.mit = {
    id: 'mit',
    truth: 'legit',
    prompt: 'He is reading the fire certificate on the wall with real interest.',
    arrive: [
      { crt: ['CAM 02 LOT', '> VEHICLE: SEDAN', '> REC'] },
      { narrate: 'A rental car parked carefully between the lines, which made it the first one tonight.' },
      { sfx: 'door' },
      { enter: 'mit' }
    ],
    greeting: [
      { who: 'mit', say: 'Good evening! Or morning. Is that a Zenith monitor? They don\'t make tubes like that anymore.' },
      { who: 'mit', say: 'Sorry. Okafor, MIT. Dr. Kane is expecting me.' }
    ],
    inspect: [
      { title: 'Glasses', zoom: 'mitGlasses', x: 230, y: 58, w: 38, h: 18,
        text: 'Thick black horn-rims, older than he is. Tape on one hinge. The lenses could start a fire.',
        note: 'Thick old horn-rimmed glasses, taped at the hinge.' },
      { title: 'Breast pocket', zoom: 'mitSlideRule', x: 266, y: 100, w: 14, h: 28,
        text: 'A slide rule clipped in his pocket like a pen. Somebody\'s stuck a label on it: BACKUP COMPUTER.',
        note: 'Slide rule in his breast pocket, labelled BACKUP COMPUTER.' },
      { title: 'Visitor badge', zoom: 'mitBadge', x: 211, y: 114, w: 18, h: 15,
        text: 'An MIT ID with a Science Corp visitor sticker on it. OKAFOR, S. Dated this week. Photo matches.',
        note: 'MIT ID, Science Corp visitor sticker dated this week. Photo matches.' },
      { title: 'Disks', zoom: 'mitDisks', x: 190, y: 198, w: 28, h: 28,
        text: 'A stack of floppy disks under a rubber band, labels in neat capitals: SIM 1, SIM 2, SIM 3...',
        note: 'Stack of floppy disks labelled SIM 1, SIM 2, SIM 3.' }
    ],
    opening: {
      name: [
        { who: 'mit', say: 'Okafor. Samuel Okafor. Visiting researcher, MIT. You should have me down as S. Okafor.' },
        { note: ['mit', 'Dr. Samuel Okafor, visiting researcher from MIT.'] }
      ],
      want: [
        { who: 'mit', say: 'Dr. Kane wants a second pair of eyes on his numbers before he goes public.' },
        { who: 'mit', say: 'Before Kessler Dynamics gets wind of it, really. They\'re Science Corp\'s big rival.' },
        { who: 'mit', say: 'Kessler\'s been circling this work for a year. Kane doesn\'t trust a soul over there.' },
        { learn: 'heardKessler' },
        { note: ['mit', 'Kessler Dynamics is Science Corp\'s rival. Kane wants Okafor\'s check before Kessler finds out.'] }
      ],
      how: [
        { who: 'mit', say: 'Flew out of Logan this afternoon. Rental car from the airport. A Taurus, the colour of regret.' },
        { who: 'mit', say: 'Route 9\'s under water, so I came round by the mall. There\'s a news van out front, did you know?' },
        { note: ['mit', 'Flew from Boston, rental Taurus. Knew Route 9 was flooded and saw the news van.'] }
      ]
    },
    questions: [
      { id: 'list', ask: 'Let me check the list.', requires: 'saw:desk.list', steps: [
        { 'if': 'run:hasList', then: [
          { narrate: 'Second from the top. Dr. S. Okafor, MIT, visiting researcher.' },
          { who: 'mit', say: 'Ah, good. I always half expect to be left off. Academics.' },
          { note: ['mit', 'On Kane\'s list: Dr. S. Okafor, MIT.'] }
        ], 'else': [
          { narrate: 'The clipboard was empty.' },
          { who: 'mit', say: 'Ah. Well. I always half expect to be left off.' }
        ] }
      ] },
      { id: 'rule', ask: 'Is that a slide rule?', requires: 'saw:mitSlideRule', steps: [
        { who: 'mit', say: 'A joke from my students. I still use it, though. It never crashes.' },
        { who: 'mit', say: 'They don\'t make relays like they used to, either. But get a modem, you\'ll see.' },
        { who: 'mit', say: 'The World Wide Web is going to be huge. Every lab, every library, every house.' },
        { narrate: 'Going to be. Future tense, from a man who sounded like he believed it. Nobody\'s ever sure.' },
        { note: ['mit', 'Uses a slide rule as a joke. Thinks the World Wide Web is "going to be huge".'] }
      ] },
      { id: 'glasses', ask: 'Those glasses vintage?', requires: 'saw:mitGlasses', steps: [
        { who: 'mit', say: 'My grandfather\'s frames, new lenses. I can\'t see a thing without them.' },
        { who: 'mit', say: 'My optometrist begs me to get the new plastic ones. I tell him I\'m sentimental.' },
        { note: ['mit', 'Wears his grandfather\'s frames with new lenses.'] }
      ] },
      { id: 'badge', ask: 'When did Kane\'s office send you this?', requires: 'saw:mitBadge', steps: [
        { who: 'mit', say: 'The sticker came Federal Express on Monday. The fax was Friday. Four pages, mostly upside down.' },
        { note: ['mit', 'Got his visitor sticker by FedEx Monday, after a fax on Friday.'] }
      ] },
      { id: 'disks', ask: 'What\'s on the disks?', requires: 'saw:mitDisks', steps: [
        { who: 'mit', say: 'Forty simulation runs. Took our VAX three weeks. Kane wants a copy outside his own building.' },
        { who: 'mit', say: 'In case somebody from Kessler walks off with his. He\'s careful. You\'d have to be.' },
        { note: ['mit', 'Carrying forty simulation runs on floppies. Kane wanted a copy outside the building.'] }
      ] },
      { id: 'met', ask: 'Ever met Kane in person?', requires: 'metSister', steps: [
        { who: 'mit', say: 'Never. Four years of phone and fax. I know his handwriting better than my own mother\'s.' },
        { who: 'mit', say: 'He doesn\'t do conferences. Tonight\'s the first time he\'s asked anyone up.' },
        { note: ['mit', 'Has never met Kane face to face. Four years of phone and fax.'] }
      ] },
      { id: 'callLine', ask: 'Let me ring Kane\'s line myself.', requires: 'run:callOffer:mit', steps: [
        { narrate: 'I dialled Kane\'s lab on four from the desk phone. It rang six times, then the machine picked up.' },
        { narrate: 'A dry recorded voice: Dr. Kane\'s laboratory, not taking calls. Leave a message at the tone.' },
        { narrate: 'Whatever he\'d heard from the Texaco, it wasn\'t on this end of the tape. I hung up before the beep.' },
        { who: 'mit', say: 'There\'s a second message if you press star. Never mind. Machines.' },
        { note: ['mit', 'Rang Kane\'s line. Answering machine, "not taking calls". Proved nothing either way.'] }
      ] }
    ],
    actions: {
      letThrough: { steps: [
        { narrate: 'I sent him up. He stopped at the stairwell door to admire the hinge.' },
        { who: 'mit', say: 'Thank you! Lovely building. Terrible wiring, I\'d bet.' },
        { exit: 'walk' },
        { note: ['mit', 'Let him up. He was on the list.'] }
      ] },
      turnAway: { steps: [
        { narrate: 'I told him Dr. Kane wasn\'t taking visitors.' },
        { who: 'mit', say: 'Oh. He asked me to fly six hundred miles. Could you check again, maybe? I\'ll wait in the car.' },
        { exit: 'walk' },
        { note: ['mit', 'Turned him away. He went to wait in his car.'] }
      ] },
      shoot: { steps: [
        { sfx: 'gunshot' },
        { exit: 'fall' },
        { narrate: 'The floppies scattered across the floor like a dropped deck of cards. Forty simulations.' },
        { pause: 500 },
        { narrate: 'A slide rule and an old pair of glasses. That was all it took to make me a murderer.' },
        { note: ['mit', 'I shot Okafor. He was on the list. Old glasses aren\'t a reason.'] },
        { reset: 'You shot Dr. Okafor from MIT. He was on the list.' }
      ] },
      shutdown: { steps: [
        { narrate: 'I pointed Kane\'s device at him and pressed the button. Nothing.' },
        { who: 'mit', say: 'Ooh. What is that? Infrared? Can I look inside it? No? Fair.' },
        { note: ['mit', 'Tried the device on him. He wanted to take it apart.'] }
      ] }
    },
    returnArrive: [
      { crt: ['CAM 02 LOT', '> VEHICLE: SEDAN', '> REC'] },
      { narrate: 'The rental car\'s dome light had been on in the lot for half an hour. Now its door opened.' },
      { sfx: 'door' }
    ],
    returnGreeting: [
      { who: 'mit', say: 'Sorry, me again. I rang Kane\'s line from the pay phone outside the Texaco.' },
      { who: 'mit', say: 'The machine says the meeting\'s on. And it\'s getting late for these numbers. Please.' },
      { note: ['mit', 'Came back. Says Kane\'s answering machine confirms the meeting.'] },
      { set: 'callOffer:mit' }
    ],
    secondTurnAway: { steps: [
      { narrate: 'I sent him away again. He nodded like I\'d given him a bad grade, and went.' },
      { exit: 'walk' },
      { pause: 600 },
      { narrate: 'Nobody checked Kane\'s numbers. Whatever was meant to be caught upstairs, wasn\'t. The light came.' },
      { note: ['mit', 'Turned Okafor away twice. Kane\'s numbers never got checked.'] },
      { reset: 'You turned Dr. Okafor away twice.' }
    ] }
  };

  /* =====================================================================
   * 6. "Just a veteran" (intruder, WWII)
   * ===================================================================== */
  C.soldier = { name: 'Ed Novak', notebookName: '"Ed Novak", a veteran', portrait: 'soldier' };

  V.soldier = {
    id: 'soldier',
    truth: 'intruder',
    prompt: 'He stands like somebody might inspect his boots.',
    arrive: [
      { crt: ['CAM 01 LOBBY', '> MOTION: 1', '> REC'] },
      { narrate: 'A young man in a long wool overcoat came in out of the rain and wiped his feet like his mother was watching.' },
      { sfx: 'door' },
      { enter: 'soldier' }
    ],
    greeting: [
      { who: 'soldier', say: 'Evening, sir. Sorry to trouble you. I\'m just a veteran, visiting my granddaughter.' },
      { who: 'soldier', say: 'She works nights here. Swell building.' }
    ],
    inspect: [
      { title: 'Haircut', zoom: 'soldierHair', x: 230, y: 38, w: 38, h: 16,
        text: 'Short back and sides, buzzed to the skin. Plenty of kids get that at the barber on Fourth.',
        note: 'Military-style haircut, sides buzzed to the skin.' },
      { title: 'Collar', zoom: 'soldierTags', x: 240, y: 98, w: 18, h: 18,
        text: 'Dog tags on a chain under his collar. NOVAK E J, a serial number, T43, a blood type.',
        note: 'Dog tags: NOVAK E J, T43 and a blood type.' },
      { title: 'Coat pocket', zoom: 'soldierTin', x: 266, y: 178, w: 22, h: 18,
        text: 'A waxed cardboard box sticking out of his pocket, printed K-RATION. Army surplus stores sell all sorts.',
        note: 'Waxed box in his coat pocket, printed K-RATION.' },
      { title: 'Photo', zoom: 'soldierPhoto', x: 194, y: 198, w: 20, h: 22,
        text: 'A small black-and-white photo with scalloped edges. A girl with her hair pinned up in rolls, smiling.',
        note: 'Holding a black-and-white photo of a smiling girl with rolled hair.' }
    ],
    opening: {
      name: [
        { who: 'soldier', say: 'Novak, sir. Private— Ed. Just Ed Novak. Just a veteran.' },
        { note: ['soldier', 'Ed Novak. Almost gave me a rank. Calls himself "just a veteran".'] }
      ],
      want: [
        { who: 'soldier', say: 'Visiting my granddaughter. She works nights here. I\'d sure like to see her.' },
        { narrate: 'He looked about twenty-two. The grandfathers I know don\'t have all their hair and none of their wrinkles.' },
        { note: ['soldier', 'Here to see his "granddaughter" who works nights. He looks about twenty-two.'] }
      ],
      how: [
        { who: 'soldier', say: 'Hitched a ride on a truck, then walked from the depot. Swell fella, the driver.' },
        { note: ['soldier', 'Hitched a ride on a truck and walked from "the depot".'] }
      ]
    },
    questions: [
      { id: 'morse', ask: 'There\'s Morse code on my radio. Can you read it?', requires: 'now:heardMorse', steps: [
        { narrate: 'I turned the radio up. He tilted his head toward it like a dog hearing its name.' },
        { who: 'soldier', say: 'Sure. Signals school, Camp Crowder. They drill it into you till you dream in it.' },
        { who: 'soldier', say: 'P-R-I-S-O-N-E-R. E-S-C-A-P-E-D. Prisoner escaped. Over and over.' },
        { who: 'soldier', say: 'Somebody\'s lost a man, sir. I\'d hate to be the fella on watch.' },
        { note: ['soldier', 'Read the Morse on the shortwave without blinking: PRISONER ESCAPED, over and over.'] },
        { learn: 'morseDecoded' }
      ] },
      { id: 'serve', ask: 'Where did you serve?', requires: 'saw:soldierTin', steps: [
        { who: 'soldier', say: 'The Ardennes, last winter. Cold as anything. Jerry threw everything he had at us.' },
        { narrate: 'Last winter. The Ardennes was fifty-odd years ago. Any man who\'d been there would be seventy now.' },
        { note: ['soldier', 'Says he served in the Ardennes "last winter", against "Jerry". That was fifty years ago.'] }
      ] },
      { id: 'tags', ask: 'What\'s the T43 on your tags?', requires: 'saw:soldierTags', steps: [
        { who: 'soldier', say: 'Tetanus shot. Got it at Fort Dix in forty-three, same as every—' },
        { narrate: 'He stopped. He did some sums in his head that didn\'t come out right.' },
        { note: ['soldier', 'Got his tetanus shot at Fort Dix "in forty-three". Stopped himself.'] }
      ] },
      { id: 'photo', ask: 'Who\'s in the photo?', requires: 'saw:soldierPhoto', steps: [
        { who: 'soldier', say: 'That\'s my— that\'s my granddaughter. Rosie.' },
        { narrate: 'He held it the way you hold your girl\'s picture, not your granddaughter\'s.' },
        { narrate: 'He turned it over without thinking. On the back, in pencil: Love, R. 1944.' },
        { note: ['soldier', 'Says the girl in the photo is his granddaughter Rosie. The back says "Love, R. 1944".'] }
      ] },
      { id: 'list', ask: 'What\'s her name? I know the night staff.', requires: 'saw:desk.list', steps: [
        { who: 'soldier', say: 'Rose. Rose Novak. Swell kid. Works in the... the office.' },
        { narrate: 'Six years on this desk. No Rose, no Novak, nobody on nights young enough to be anyone\'s granddaughter.' },
        { note: ['soldier', 'Says his granddaughter is Rose Novak. Nobody by that name works here.'] }
      ] },
      { id: 'hair', ask: 'Fresh haircut?', requires: 'saw:soldierHair', steps: [
        { who: 'soldier', say: 'Regulation. Barber on the base does it swell. Two bits and a shave.' },
        { narrate: 'Two bits. A haircut cost me eleven dollars on Saturday, and I didn\'t get a shave.' },
        { note: ['soldier', 'Says his haircut cost "two bits" on the base.'] }
      ] }
    ],
    actions: {
      letThrough: { steps: [
        { narrate: 'I let him up to find a granddaughter who wasn\'t there. He took the stairs two at a time.' },
        { exit: 'walk' },
        { pause: 800 },
        { sfx: 'distant' },
        { narrate: 'He wasn\'t looking for a girl. He was on a mission, and he\'d been trained to finish them. Then the light came.' },
        { note: ['soldier', 'Let him up. He wasn\'t visiting anybody. The night started over.'] },
        { reset: 'You let a soldier from the 1940s through.' }
      ] },
      turnAway: { steps: [
        { narrate: 'I told him visiting hours were over and his granddaughter could call him in the morning.' },
        { who: 'soldier', say: 'Yes, sir. Understood, sir.' },
        { exit: 'walk' },
        { narrate: 'He saluted on his way out. He didn\'t seem to notice he\'d done it.' },
        { note: ['soldier', 'Turned him away. He saluted me on the way out.'] }
      ] },
      shoot: shot('soldier',
        'He went down hard. The photo landed face down. Love, R. 1944.',
        'Shot "Ed Novak". A K-ration and a photo dated 1944.'),
      shutdown: { steps: [
        { narrate: 'I pointed Kane\'s device at him and pressed the button. Nothing.' },
        { who: 'soldier', say: 'Some kind of radio, sir? Swell. We could\'ve used those.' },
        { note: ['soldier', 'Tried the device. Nothing. He thought it was a radio.'] }
      ] }
    }
  };

  // Kane's clipboard: Halloway and Okafor are already on it; the intern is added here
  E.content.visitorList.push({ name: 'M. Bell', org: 'Summer intern, Lab 2', seeing: 'Dr. Halvorsen' });

  /* =====================================================================
   * Art: full figures (head to knee), lower half first, then upper half
   * ===================================================================== */
  var A = E.art.visitors, R = K.R, El = K.El, poly = K.poly, Dd = K.D;

  // Halloway: grey suit, red tie, furled umbrella, briefcase, steel-grey side part
  A.doe = function () {
    K.legs(P.suit1, P.suit0, 192);
    R(231, 204, 1, 50, P.suit0); R(267, 204, 1, 50, P.suit0);
    K.torso(P.suit2, P.suit1, 200);
    R(240, 164, 18, 18, P.paper);
    poly([[246, 164], [252, 164], [253, 178], [249, 184], [245, 178]], P.red1);
    poly([[236, 166], [244, 166], [249, 200], [238, 200]], P.suit2);
    poly([[254, 166], [262, 166], [262, 200], [249, 200]], P.suit1);
    R(248, 186, 2, 2, P.night0); R(214, 186, 14, 1, P.suit0); R(270, 186, 14, 1, P.suit0);
    K.armL(P.suit2, P.paper, P.skinA1, P.skinA2);
    K.armR(P.suit1, P.paper, P.skinA1, P.skinA2);
    // umbrella hooked in his left hand, dripping
    R(202, 192, 6, 2, P.brown1); R(202, 192, 2, 6, P.brown1); R(206, 192, 2, 12, P.night1);
    poly([[199, 210], [213, 210], [208, 244], [206, 250], [204, 244]], P.night2);
    poly([[200, 212], [205, 212], [205, 242]], P.night3);
    R(201, 222, 11, 1, P.night1); R(202, 232, 8, 1, P.night1);
    R(205, 252, 1, 2, P.fog); R(202, 240, 1, 2, P.fog);
    El(204, 205, 6, 7, P.skinA1); El(203, 204, 4, 5, P.skinA2);
    // briefcase in his right hand, printout sticking out
    poly([[286, 206], [304, 205], [306, 214], [288, 215]], P.paper);
    for (var h = 0; h < 4; h++) { R(288, 207 + h * 2, 1, 1, P.paperDark); R(303, 207 + h * 2, 1, 1, P.paperDark); }
    R(290, 209, 10, 1, P.paperDark);
    R(278, 212, 34, 24, P.brown1); R(278, 212, 34, 3, P.brown2); R(278, 235, 34, 1, P.brown0);
    R(283, 216, 4, 3, P.lamp3); R(303, 216, 4, 3, P.lamp3);
    R(288, 202, 12, 3, P.brown0);
    El(294, 205, 6, 6, P.skinA1); El(293, 204, 4, 4, P.skinA2);

    // upper half: wet shoulders
    poly([[188, 170], [200, 110], [226, 98], [272, 98], [298, 110], [310, 170]], P.suit1);
    poly([[194, 170], [204, 112], [228, 100], [249, 100], [249, 170]], P.suit2);
    Dd(216, 102, 66, 6, P.fog, 1);
    poly([[238, 100], [260, 100], [256, 170], [242, 170]], P.paper);
    poly([[246, 102], [252, 102], [253, 150], [249, 156], [245, 150]], P.red1);
    R(247, 104, 4, 3, P.red0);
    R(244, 128, 10, 2, P.lamp3); El(249, 129, 2, 2, P.fog);
    poly([[228, 100], [240, 100], [246, 140], [236, 130]], P.suit2);
    poly([[258, 100], [270, 100], [262, 130], [252, 140]], P.suit0);
    // laminated badge on the pocket
    R(265, 115, 16, 13, P.fog); R(266, 116, 14, 11, P.paper);
    R(267, 117, 5, 6, P.paperShade); R(268, 118, 3, 3, P.skinA1);
    R(273, 118, 6, 1, P.paperDark); R(273, 121, 5, 1, P.paperDark); R(276, 123, 3, 3, P.shirt);
    R(266, 116, 14, 1, P.flash);
    // neck and a scowl
    R(240, 86, 18, 16, P.skinA1);
    El(249, 67, 19, 23, P.skinA1); El(246, 66, 16, 20, P.skinA2); Dd(257, 50, 14, 38, P.skinA0, 2);
    poly([[236, 61], [245, 63], [245, 65], [236, 63]], P.night1); poly([[253, 63], [262, 61], [262, 63], [253, 65]], P.night1);
    R(238, 66, 6, 3, P.night0); R(254, 66, 6, 3, P.night0); R(239, 66, 2, 1, P.paper); R(255, 66, 2, 1, P.paper);
    R(243, 81, 12, 1, P.skinA0); R(242, 82, 2, 1, P.skinA0); R(254, 82, 2, 1, P.skinA0);
    R(248, 68, 2, 8, P.skinA0);
    // steel-grey hair, hard side part
    El(249, 50, 20, 9, P.steel); R(229, 50, 6, 12, P.steel); R(263, 50, 6, 12, P.night3);
    R(240, 42, 1, 9, P.night3); Dd(252, 42, 16, 10, P.night3, 2);
  };

  // Pembroke: top hat, frock coat, burgundy waistcoat, mutton chops, grey gloves, Gladstone bag
  A.victorian = function () {
    K.legs(P.suit2, P.suit1, 196);
    for (var s = 216; s < 284; s += 5) R(s, 200, 1, 54, s < 249 ? P.suit1 : P.suit0);
    poly([[236, 164], [262, 164], [262, 196], [249, 202], [236, 196]], P.red0);
    R(248, 170, 2, 2, P.lamp3); R(248, 180, 2, 2, P.lamp3); R(248, 190, 2, 2, P.lamp3);
    poly([[204, 164], [237, 164], [234, 242], [200, 242]], P.night2);
    poly([[261, 164], [294, 164], [298, 242], [264, 242]], P.night1);
    R(234, 164, 1, 78, P.night3); R(264, 164, 1, 78, P.night0);
    K.armL(P.night2, P.paper, P.paperShade, P.paper);
    K.armR(P.night1, P.paper, P.paperShade, P.paper);
    R(206, 199, 1, 1, P.lamp4);
    // Gladstone bag
    poly([[278, 214], [312, 214], [314, 242], [276, 242]], P.brown1);
    poly([[278, 214], [295, 214], [295, 242], [276, 242]], P.brown2);
    R(277, 212, 37, 3, P.lamp3); R(293, 214, 4, 4, P.lamp4);
    R(286, 203, 18, 3, P.brown0); R(286, 203, 2, 10, P.brown0); R(302, 203, 2, 10, P.brown0);
    El(294, 205, 6, 6, P.paperShade); El(293, 204, 4, 4, P.paper);

    // upper half: frock coat
    poly([[188, 170], [200, 108], [226, 96], [272, 96], [298, 108], [310, 170]], P.night1);
    poly([[194, 170], [204, 110], [228, 98], [249, 98], [249, 170]], P.night2);
    poly([[236, 98], [262, 98], [262, 170], [236, 170]], P.red0);
    poly([[238, 98], [260, 98], [256, 118], [242, 118]], P.paper);
    poly([[242, 102], [256, 102], [252, 112], [246, 112]], P.night0); R(248, 106, 2, 2, P.fog);
    poly([[226, 98], [238, 98], [244, 150], [232, 140]], P.night3);
    poly([[260, 98], [272, 98], [266, 140], [254, 150]], P.night0);
    [130, 142, 154].forEach(function (y) { R(248, y, 2, 2, P.lamp3); });
    // breast pocket with the brass thermometer case
    R(266, 124, 14, 1, P.night0);
    R(272, 112, 3, 12, P.lamp3); R(272, 111, 3, 2, P.lamp4); R(273, 114, 1, 8, P.wood3);
    // neck, face
    R(240, 86, 18, 14, P.skinA1);
    El(249, 67, 18, 22, P.skinA1); El(246, 66, 15, 19, P.skinA2); Dd(257, 52, 12, 34, P.skinA0, 2);
    R(238, 65, 6, 2, P.night0); R(254, 65, 6, 2, P.night0); R(239, 65, 2, 1, P.paper);
    R(236, 61, 9, 2, P.hair0); R(253, 61, 9, 2, P.hair0);
    // mutton chops joined to the moustache, chin bare
    poly([[229, 58], [236, 58], [238, 80], [246, 76], [249, 78], [252, 76], [260, 80], [262, 58], [269, 58], [270, 76], [262, 86], [256, 84], [252, 80], [246, 80], [242, 84], [236, 86], [228, 76]], P.hair1);
    Dd(255, 60, 15, 26, P.hair0, 2);
    R(244, 84, 10, 1, P.skinA0);
    // top hat
    El(249, 47, 28, 4, P.night0);
    R(232, 18, 34, 28, P.night0); R(232, 38, 34, 4, P.night2);
    R(234, 20, 4, 18, P.night2); Dd(236, 20, 8, 18, P.night3, 1);
    R(231, 17, 36, 2, P.night1);
  };

  // Marcus: curtains haircut, seventies suede jacket, headphones, Walkman, drive-thru sack
  A.intern = function () {
    K.legs(P.steel, P.night3, 192);
    R(230, 204, 1, 50, P.night3); R(219, 230, 6, 3, P.fog); R(272, 240, 7, 2, P.night2);
    K.torso(P.shirt, P.night3, 192);
    R(210, 190, 78, 3, P.night0); R(246, 190, 6, 3, P.lamp3);
    poly([[204, 164], [228, 164], [226, 206], [206, 208]], P.card1);
    poly([[270, 164], [294, 164], [292, 208], [272, 206]], P.card0);
    R(226, 164, 1, 42, P.card0); R(271, 164, 1, 42, P.brown1);
    R(212, 196, 12, 1, P.card0); R(276, 196, 12, 1, P.brown1);
    // Walkman on his belt, cord running up
    R(234, 166, 1, 18, P.night0);
    R(228, 184, 13, 16, P.lamp4); R(228, 184, 13, 2, P.lamp3);
    R(230, 188, 9, 6, P.night0); R(231, 189, 7, 4, P.night2); R(233, 190, 3, 2, P.paperShade);
    R(230, 196, 3, 2, P.night1); R(235, 196, 3, 2, P.night1);
    K.armL(P.card1, null, P.skinA1, P.skinA2);
    K.armR(P.card0, null, P.skinA1, P.skinA2);
    // drive-thru sack
    poly([[193, 210], [215, 210], [217, 232], [191, 232]], P.card1);
    R(193, 208, 22, 3, P.card0); R(204, 214, 9, 10, P.paper); R(205, 216, 6, 1, P.paperDark); R(205, 219, 5, 1, P.paperDark);
    El(196, 226, 2, 2, P.card0); R(210, 211, 2, 1, P.steel);
    El(204, 205, 6, 6, P.skinA1); El(203, 204, 4, 4, P.skinA2);

    // upper half: suede jacket with a huge collar over a blue tee
    poly([[190, 170], [202, 110], [226, 100], [272, 100], [296, 110], [308, 170]], P.card0);
    poly([[196, 170], [206, 112], [228, 102], [249, 102], [249, 170]], P.card1);
    poly([[236, 100], [262, 100], [262, 170], [236, 170]], P.shirt);
    poly([[228, 100], [240, 100], [244, 136], [218, 120]], P.brown2);
    poly([[258, 100], [270, 100], [280, 120], [254, 136]], P.brown1);
    R(238, 100, 22, 3, P.night3);
    // headphones round his neck
    R(234, 96, 30, 2, P.night0); El(233, 99, 4, 4, P.lamp3); El(265, 99, 4, 4, P.wood3);
    // badge clipped to the jacket
    R(266, 120, 11, 13, P.paper); R(266, 120, 11, 3, P.red1); R(268, 124, 4, 5, P.paperShade); R(273, 125, 3, 1, P.paperDark);
    R(270, 117, 3, 3, P.steel);
    // young face, grin
    R(241, 86, 16, 12, P.skinA1);
    El(249, 68, 17, 21, P.skinA1); El(246, 67, 14, 18, P.skinA2); Dd(256, 54, 11, 32, P.skinA0, 2);
    R(238, 67, 5, 3, P.night0); R(254, 67, 5, 3, P.night0); R(239, 67, 1, 1, P.paper); R(255, 67, 1, 1, P.paper);
    R(242, 79, 14, 3, P.night0); R(243, 79, 12, 1, P.paper);
    El(236, 75, 2, 1, P.red1);
    // curtains, middle part
    El(249, 50, 19, 9, P.hair1);
    poly([[230, 48], [249, 44], [247, 58], [238, 64], [231, 66]], P.hair1);
    poly([[249, 44], [268, 48], [267, 66], [260, 64], [251, 58]], P.hair0);
    R(248, 43, 2, 12, P.skinA2);
  };

  // Anselm: brown habit, tonsure, rope belt with a purse, wide sleeves, sandals
  A.monk = function () {
    // feet in sandals under the hem
    R(222, 238, 10, 8, P.skinA1); R(266, 238, 10, 8, P.skinA0);
    El(226, 248, 10, 4, P.skinA1); El(271, 248, 10, 4, P.skinA0);
    R(216, 247, 20, 2, P.brown0); R(261, 247, 20, 2, P.brown0); R(222, 242, 10, 1, P.brown0); R(266, 242, 10, 1, P.brown0);
    Dd(216, 249, 20, 3, P.red0, 2); Dd(261, 249, 20, 3, P.red0, 2);
    Dd(216, 238, 64, 8, P.wood2, 1);
    // habit to the shins
    poly([[208, 164], [249, 164], [249, 240], [204, 240]], P.brown2);
    poly([[249, 164], [290, 164], [296, 240], [249, 240]], P.brown1);
    R(224, 196, 1, 44, P.brown1); R(272, 196, 1, 44, P.brown0); R(204, 238, 92, 2, P.brown0);
    // rope belt, knotted end hanging
    R(208, 182, 82, 3, P.paperShade); R(208, 182, 82, 1, P.paper);
    R(236, 185, 2, 36, P.paperShade);
    El(237, 196, 2, 2, P.paper); El(237, 207, 2, 2, P.paper); El(237, 218, 2, 2, P.paper);
    // purse hanging from the belt on a cord
    R(259, 185, 1, 10, P.paperShade);
    El(260, 201, 6, 7, P.brown0); El(259, 199, 4, 4, P.wood2); R(255, 195, 10, 1, P.wood1);
    // wide sleeves, hands hanging at his sides
    poly([[188, 164], [208, 164], [216, 200], [190, 204]], P.brown2);
    poly([[208, 164], [209, 164], [217, 200], [216, 200]], P.brown0);
    poly([[290, 164], [310, 164], [308, 204], [282, 200]], P.brown1);
    poly([[289, 164], [290, 164], [282, 200], [281, 200]], P.brown0);
    R(190, 202, 26, 2, P.brown0); R(282, 202, 26, 2, P.brown0);
    El(203, 210, 6, 7, P.skinA1); El(202, 209, 4, 5, P.skinA2);
    El(295, 210, 6, 7, P.skinA0); El(294, 209, 4, 5, P.skinA1);

    // upper half: habit and a bunched hood
    poly([[190, 170], [200, 110], [224, 100], [274, 100], [298, 110], [308, 170]], P.brown1);
    poly([[196, 170], [205, 112], [226, 102], [249, 102], [249, 170]], P.brown2);
    El(249, 102, 30, 8, P.brown0); El(244, 100, 22, 6, P.brown1);
    R(236, 108, 26, 62, P.brown1); R(236, 108, 13, 62, P.brown2); R(236, 108, 1, 62, P.brown0); R(261, 108, 1, 62, P.brown0);
    // a plain wooden cross on a cord
    R(248, 100, 1, 18, P.paperShade); R(246, 118, 6, 2, P.wood3); R(248, 116, 2, 8, P.wood3);
    // face, frightened
    R(241, 86, 16, 14, P.skinA1);
    El(249, 66, 18, 22, P.skinA1); El(246, 65, 15, 19, P.skinA2); Dd(257, 52, 12, 34, P.skinA0, 2);
    R(237, 63, 7, 4, P.paper); R(253, 63, 7, 4, P.paper); R(240, 64, 2, 2, P.night0); R(256, 64, 2, 2, P.night0);
    R(237, 59, 7, 1, P.hair0); R(253, 58, 7, 1, P.hair0);
    R(247, 80, 4, 3, P.night0);
    // tonsure: bald crown, ring of hair
    El(249, 50, 18, 8, P.hair1);
    R(231, 50, 36, 8, P.hair1); Dd(250, 48, 18, 10, P.hair0, 2);
    El(249, 47, 13, 6, P.skinA2); El(252, 47, 8, 4, P.skinA1);
    R(231, 54, 3, 10, P.hair1); R(265, 54, 3, 10, P.hair0);
  };

  // Okafor: tweed jacket, sweater vest, bow tie, thick horn-rims, slide rule, floppy disks
  A.mit = function () {
    K.legs(P.brown1, P.brown0, 194);
    for (var c = 214; c < 284; c += 3) R(c, 200, 1, 54, c < 249 ? P.brown0 : P.night1);
    K.torso(P.night3, P.night2, 196);
    for (var v = 0; v < 6; v++) R(238, 168 + v * 5, 22, 1, P.night2);
    poly([[204, 164], [232, 164], [230, 212], [206, 214]], P.wood2);
    poly([[266, 164], [294, 164], [292, 214], [268, 212]], P.wood1);
    for (var ly = 166; ly < 210; ly += 4) { R(208 + (ly % 8), ly, 1, 1, P.brown1); R(218 + (ly % 8), ly, 1, 1, P.brown1); R(272 + (ly % 8), ly, 1, 1, P.wood0); R(282 + (ly % 8), ly, 1, 1, P.wood0); }
    R(210, 196, 16, 1, P.wood1); R(272, 196, 16, 1, P.wood0);
    K.armL(P.wood2, P.paper, P.skinB1, P.skinB2);
    K.armR(P.wood1, P.paper, P.skinB1, P.skinB2);
    // floppy disks under a rubber band
    R(192, 204, 22, 22, P.night0); R(194, 202, 22, 22, P.night1); R(196, 200, 20, 22, P.night0);
    R(200, 200, 10, 7, P.steel); R(206, 201, 2, 5, P.night0);
    R(199, 211, 14, 9, P.paper); R(200, 213, 9, 1, P.paperDark); R(200, 216, 6, 1, P.paperDark);
    R(196, 209, 20, 1, P.red1);
    El(204, 205, 6, 6, P.skinB1); El(203, 204, 4, 4, P.skinB2);

    // upper half: tweed
    poly([[188, 170], [200, 110], [226, 98], [272, 98], [298, 110], [310, 170]], P.wood1);
    poly([[194, 170], [204, 112], [228, 100], [249, 100], [249, 170]], P.wood2);
    for (var fy = 112; fy < 170; fy += 4) for (var fx = 214 + (fy % 8); fx < 286; fx += 8) if (fx < 236 || fx > 262) R(fx, fy, 1, 1, fx < 249 ? P.brown1 : P.wood0);
    poly([[236, 100], [262, 100], [262, 170], [236, 170]], P.night3);
    for (var w = 0; w < 10; w++) R(238, 122 + w * 5, 22, 1, P.night2);
    poly([[238, 100], [260, 100], [256, 120], [242, 120]], P.paper);
    poly([[241, 104], [249, 107], [257, 104], [257, 112], [249, 109], [241, 112]], P.red1); R(247, 106, 4, 4, P.red0);
    poly([[228, 100], [238, 100], [242, 140], [230, 130]], P.card0);
    poly([[260, 100], [270, 100], [266, 130], [256, 140]], P.wood0);
    // MIT badge on the left lapel
    R(213, 116, 14, 11, P.paper); R(213, 116, 14, 2, P.red0); R(215, 119, 4, 5, P.skinB1); R(220, 120, 5, 1, P.paperDark); R(222, 123, 3, 3, P.lamp3);
    // slide rule in the breast pocket
    R(266, 124, 14, 1, P.wood0);
    R(270, 102, 6, 24, P.paper); R(270, 108, 6, 2, P.steel);
    for (var t = 0; t < 7; t++) R(271 + (t % 2) * 2, 104 + t * 3, 1, 1, P.paperDark);
    // face, close-cropped hair and beard, thick glasses
    R(240, 86, 18, 14, P.skinB1);
    El(249, 67, 18, 22, P.skinB1); El(246, 66, 15, 19, P.skinB2); Dd(257, 52, 12, 34, P.skinB0, 2);
    El(249, 50, 18, 8, P.night0); R(231, 50, 4, 12, P.night0); R(263, 50, 4, 12, P.night0);
    Dd(236, 78, 26, 12, P.night0, 2);
    R(244, 81, 10, 2, P.night0); R(245, 81, 8, 1, P.paper);
    R(231, 61, 15, 12, P.night0); R(252, 61, 15, 12, P.night0); R(246, 64, 6, 2, P.night0);
    R(233, 63, 11, 8, P.night3); R(254, 63, 11, 8, P.night3);
    R(236, 66, 4, 3, P.paper); R(257, 66, 4, 3, P.paper); R(238, 67, 2, 2, P.night0); R(259, 67, 2, 2, P.night0);
    R(234, 63, 2, 1, P.fog); R(255, 63, 2, 1, P.fog);
    R(229, 64, 2, 2, P.paperShade);
  };

  // Novak: khaki wool overcoat, high-and-tight, dog tags, ration box, a photo in his hand
  A.soldier = function () {
    K.legs(P.brown1, P.brown0, 200);
    poly([[204, 164], [249, 164], [249, 242], [204, 242]], P.card0);
    poly([[249, 164], [294, 164], [296, 242], [249, 242]], P.brown1);
    R(249, 164, 1, 78, P.brown0); R(240, 172, 2, 2, P.brown0); R(240, 188, 2, 2, P.brown0); R(258, 172, 2, 2, P.brown0); R(258, 188, 2, 2, P.brown0);
    R(208, 194, 82, 3, P.brown0);
    // ration box in the right-hand pocket
    R(270, 181, 13, 10, P.paperShade); R(270, 181, 13, 1, P.paper); R(272, 184, 9, 1, P.night0); R(272, 187, 6, 1, P.night1);
    R(266, 190, 22, 3, P.brown0); R(266, 193, 22, 14, P.brown1);
    K.armL(P.card0, P.brown0, P.skinA1, P.skinA2);
    K.armR(P.brown1, P.brown0, P.skinA1, P.skinA2);
    // the photo, held out a little
    R(196, 206, 15, 12, P.paper); R(198, 208, 11, 8, P.night3); El(203, 211, 2, 2, P.paperShade); R(201, 213, 5, 3, P.paperShade);
    Dd(196, 206, 15, 1, P.night1, 2); Dd(196, 217, 15, 1, P.night1, 2);
    El(200, 204, 5, 5, P.skinA1); El(199, 203, 3, 3, P.skinA2);

    // upper half: overcoat with wide lapels over a khaki shirt and tie
    poly([[186, 170], [198, 106], [224, 96], [274, 96], [300, 106], [312, 170]], P.brown1);
    poly([[192, 170], [202, 108], [226, 98], [249, 98], [249, 170]], P.card0);
    R(212, 150, 30, 1, P.brown1); R(262, 150, 26, 1, P.brown0);
    poly([[238, 98], [260, 98], [256, 150], [242, 150]], P.card1);
    poly([[246, 102], [252, 102], [252, 140], [249, 146], [246, 140]], P.brown0);
    poly([[224, 96], [240, 98], [248, 150], [228, 126]], P.card1);
    poly([[258, 98], [274, 96], [270, 126], [250, 150]], P.brown0);
    // dog tag chain at the collar
    R(242, 100, 1, 8, P.fog); R(255, 100, 1, 8, P.fog); R(243, 108, 12, 1, P.fog);
    R(252, 109, 4, 6, P.fog); R(253, 110, 2, 1, P.steel);
    // young face, ears out, high-and-tight
    R(241, 86, 16, 14, P.skinA1);
    El(249, 67, 17, 22, P.skinA1); El(246, 66, 14, 19, P.skinA2); Dd(256, 52, 11, 34, P.skinA0, 2);
    El(231, 68, 3, 5, P.skinA1); El(267, 68, 3, 5, P.skinA0);
    R(238, 66, 6, 2, P.night0); R(254, 66, 6, 2, P.night0); R(239, 66, 1, 1, P.paper);
    R(237, 62, 7, 1, P.hair1); R(254, 62, 7, 1, P.hair1);
    R(243, 80, 12, 1, P.skinA0); R(244, 81, 10, 1, P.red0);
    Dd(232, 46, 34, 12, P.skinA0, 1);
    R(236, 44, 26, 6, P.hair1); R(238, 42, 22, 2, P.hair1); R(250, 44, 12, 6, P.hair0);
  };

  /* ---------- close-ups (32x24) ---------- */
  zoom('doeBadge', function (z) {
    K.fill(z, 0, 0, 32, 24, P.suit1);
    K.fill(z, 2, 2, 28, 20, P.fog); K.fill(z, 3, 3, 26, 18, P.paper);
    K.fill(z, 3, 3, 26, 1, P.flash);
    K.fill(z, 5, 6, 8, 10, P.paperShade); K.fill(z, 7, 8, 4, 5, P.skinA1); K.fill(z, 6, 6, 6, 2, P.steel);
    word(z, 'DOE', 15, 5, P.night0);
    K.fill(z, 15, 12, 10, 1, P.paperDark); K.fill(z, 15, 15, 7, 1, P.paperDark);
    K.fill(z, 23, 14, 5, 7, P.shirt); word(z, 'Q', 24, 15, P.paper);
  });
  zoom('doeTie', function (z) {
    K.fill(z, 0, 0, 32, 24, P.paper);
    K.fill(z, 10, 0, 12, 24, P.red1); K.fill(z, 18, 0, 4, 24, P.red0);
    K.fill(z, 2, 9, 28, 5, P.lamp3); K.fill(z, 2, 9, 28, 1, P.lamp4);
    El(16, 11, 6, 2, P.shirt); El(16, 11, 2, 5, P.shirt); El(16, 11, 1, 1, P.red1);
  });
  zoom('doeUmbrella', function (z) {
    K.fill(z, 0, 0, 32, 24, P.night1);
    poly([[10, 0], [22, 0], [19, 22], [16, 24], [13, 22]], P.night0);
    poly([[12, 0], [16, 0], [15, 20]], P.night2);
    K.fill(z, 18, 4, 1, 14, P.night3);
    [[9, 8], [23, 14], [16, 23], [7, 18], [25, 4]].forEach(function (d) { K.fill(z, d[0], d[1], 1, 2, P.fog); });
    El(16, 23, 8, 1, P.night3);
  });
  zoom('doeBriefcase', function (z) {
    K.fill(z, 0, 0, 32, 24, P.brown1);
    K.fill(z, 0, 14, 32, 2, P.brown2);
    K.fill(z, 4, 0, 24, 14, P.paper);
    for (var i = 0; i < 14; i += 3) { K.fill(z, 5, i + 1, 1, 1, P.paperShade); K.fill(z, 26, i + 1, 1, 1, P.paperShade); }
    K.digits('9.40', 8, 2, P.night0); K.digits('10.15', 8, 8, P.night0);
    K.fill(z, 6, 18, 5, 4, P.lamp3); K.fill(z, 21, 18, 5, 4, P.lamp3);
  });

  zoom('victorianHat', function (z) {
    K.fill(z, 0, 0, 32, 24, P.night1);
    K.fill(z, 7, 0, 18, 18, P.night0); K.fill(z, 7, 13, 18, 3, P.night2);
    K.fill(z, 9, 1, 3, 12, P.night2);
    El(16, 19, 14, 2, P.night0);
    [[10, 4], [15, 2], [20, 6], [13, 9], [22, 11]].forEach(function (d) { K.fill(z, d[0], d[1], 1, 1, P.fog); });
  });
  zoom('victorianWhiskers', function (z) {
    K.fill(z, 0, 0, 32, 24, P.skinA2);
    poly([[0, 0], [7, 0], [9, 16], [14, 13], [18, 13], [23, 16], [25, 0], [32, 0], [32, 18], [24, 22], [19, 17], [13, 17], [8, 22], [0, 18]], P.hair1);
    Dd(16, 0, 16, 24, P.hair0, 2);
    K.fill(z, 13, 19, 6, 1, P.skinA0);
  });
  zoom('victorianThermo', function (z) {
    K.fill(z, 0, 0, 32, 24, P.night1);
    K.fill(z, 0, 16, 32, 1, P.night0);
    K.fill(z, 12, 1, 7, 20, P.lamp3); K.fill(z, 12, 1, 7, 3, P.lamp4); K.fill(z, 12, 1, 2, 20, P.lamp4);
    K.fill(z, 14, 6, 3, 13, P.paper); K.fill(z, 15, 9, 1, 10, P.fog);
    for (var i = 0; i < 5; i++) K.fill(z, 17, 7 + i * 2, 1, 1, P.wood2);
    K.fill(z, 12, 4, 7, 1, P.wood2);
  });
  zoom('victorianGloves', function (z) {
    K.fill(z, 0, 0, 32, 24, P.night2);
    K.fill(z, 0, 0, 32, 5, P.paper);
    K.fill(z, 4, 5, 24, 9, P.paperShade);
    for (var i = 0; i < 4; i++) K.fill(z, 5 + i * 6, 14, 4, 9, P.paperShade);
    for (var j = 0; j < 4; j++) K.fill(z, 5 + j * 6, 14, 1, 9, P.paper);
    El(23, 8, 2, 2, P.paper); K.fill(z, 23, 8, 1, 1, P.fog);
  });
  zoom('victorianBag', function (z) {
    K.fill(z, 0, 0, 32, 24, P.night0);
    poly([[3, 6], [29, 6], [31, 24], [1, 24]], P.brown1);
    poly([[3, 6], [16, 6], [16, 24], [1, 24]], P.brown2);
    K.fill(z, 2, 5, 28, 2, P.lamp3); K.fill(z, 14, 6, 4, 4, P.lamp4);
    K.fill(z, 9, 0, 14, 2, P.brown0); K.fill(z, 9, 0, 2, 5, P.brown0); K.fill(z, 21, 0, 2, 5, P.brown0);
    for (var i = 4; i < 30; i += 3) K.fill(z, i, 22, 1, 1, P.brown0);
  });

  zoom('internWalkman', function (z) {
    K.fill(z, 0, 0, 32, 24, P.shirt);
    K.fill(z, 0, 20, 32, 4, P.night0);
    K.fill(z, 5, 2, 22, 18, P.lamp4); K.fill(z, 5, 2, 22, 2, P.lamp3);
    K.fill(z, 8, 6, 16, 9, P.night0); K.fill(z, 9, 7, 14, 7, P.night2);
    K.fill(z, 9, 7, 16, 6, P.paper); word(z, 'MIX', 10, 8, P.red1);
    K.fill(z, 7, 16, 4, 2, P.night1); K.fill(z, 13, 16, 4, 2, P.night1); K.fill(z, 19, 16, 4, 2, P.night1);
    K.fill(z, 15, 0, 1, 2, P.night0);
  });
  zoom('internJacket', function (z) {
    K.fill(z, 0, 0, 32, 24, P.card1);
    poly([[0, 0], [14, 0], [20, 24], [0, 14]], P.brown2);
    Dd(0, 0, 32, 24, P.card0, 1);
    K.fill(z, 19, 6, 11, 12, P.paper); K.fill(z, 23, 3, 2, 4, P.steel);
    K.fill(z, 21, 9, 1, 5, P.night0); K.fill(z, 20, 10, 3, 1, P.night0); K.fill(z, 20, 12, 3, 1, P.night0);
    K.digits('8', 24, 9, P.night0);
  });
  zoom('internBadge', function (z) {
    K.fill(z, 0, 0, 32, 24, P.card0);
    K.fill(z, 4, 1, 25, 22, P.paper);
    K.fill(z, 4, 1, 25, 7, P.red1); word(z, 'INTERN', 5, 2, P.paper);
    K.fill(z, 6, 10, 7, 10, P.paperShade); K.fill(z, 7, 12, 5, 5, P.skinA1); K.fill(z, 7, 10, 5, 2, P.hair1);
    word(z, 'BELL', 14, 10, P.night0); K.fill(z, 14, 17, 6, 1, P.paperDark); K.digits('2', 23, 16, P.night0);
  });
  zoom('internSack', function (z) {
    K.fill(z, 0, 0, 32, 24, P.card1);
    K.fill(z, 0, 0, 32, 4, P.card0); K.fill(z, 0, 4, 32, 1, P.wood2);
    El(5, 17, 3, 2, P.card0); El(26, 9, 2, 2, P.card0);
    K.fill(z, 10, 3, 14, 19, P.paper); K.fill(z, 15, 2, 4, 2, P.steel);
    K.fill(z, 12, 7, 9, 1, P.paperShade); K.fill(z, 12, 10, 7, 1, P.paperShade);
    K.digits('3.27', 12, 14, P.night0);
  });

  zoom('monkTonsure', function (z) {
    K.fill(z, 0, 0, 32, 24, P.night1);
    El(16, 14, 14, 11, P.hair1); Dd(16, 3, 15, 22, P.hair0, 2);
    El(16, 13, 9, 7, P.skinA2); El(18, 14, 6, 5, P.skinA1); El(13, 10, 3, 2, P.paper);
  });
  zoom('monkBelt', function (z) {
    K.fill(z, 0, 0, 32, 24, P.brown1); K.fill(z, 0, 0, 16, 24, P.brown2);
    K.fill(z, 0, 3, 32, 4, P.paperShade); K.fill(z, 0, 3, 32, 1, P.paper);
    for (var i = 0; i < 32; i += 3) K.fill(z, i, 5, 1, 1, P.paperDark);
    K.fill(z, 14, 7, 3, 17, P.paperShade);
    [10, 15, 20].forEach(function (y) { El(15, y, 3, 2, P.paper); K.fill(z, 16, y, 1, 1, P.paperDark); });
  });
  zoom('monkPurse', function (z) {
    K.fill(z, 0, 0, 32, 24, P.brown2);
    K.fill(z, 8, 0, 2, 9, P.paperShade);
    El(9, 15, 7, 7, P.brown0); El(8, 13, 4, 4, P.wood2);
    El(21, 15, 4, 4, P.fog); El(21, 15, 3, 3, P.paperShade); K.fill(z, 20, 13, 2, 4, P.night3); K.fill(z, 19, 14, 4, 1, P.night3);
    El(27, 20, 3, 3, P.fog); El(26, 19, 1, 1, P.paper);
  });
  zoom('monkSandals', function (z) {
    K.fill(z, 0, 0, 32, 24, P.night1);
    K.fill(z, 0, 0, 32, 4, P.brown1); K.fill(z, 0, 4, 32, 1, P.brown0);
    K.fill(z, 6, 5, 6, 6, P.skinA1); K.fill(z, 20, 5, 6, 6, P.skinA0);
    El(9, 15, 6, 6, P.skinA1); El(23, 15, 6, 6, P.skinA0);
    [4, 7, 10, 13].forEach(function (x) { El(x, 20, 1, 1, P.red1); El(x + 14, 20, 1, 1, P.red0); });
    K.fill(z, 3, 22, 13, 2, P.brown0); K.fill(z, 17, 22, 13, 2, P.brown0);
    K.fill(z, 5, 8, 8, 2, P.brown0); K.fill(z, 19, 8, 8, 2, P.brown0);
    K.fill(z, 3, 14, 12, 2, P.brown0); K.fill(z, 17, 14, 12, 2, P.brown0);
    Dd(4, 5, 24, 4, P.wood2, 2);
  });

  zoom('mitGlasses', function (z) {
    K.fill(z, 0, 0, 32, 24, P.skinB1);
    K.fill(z, 1, 6, 13, 12, P.night0); K.fill(z, 18, 6, 13, 12, P.night0); K.fill(z, 14, 9, 4, 2, P.night0);
    K.fill(z, 3, 8, 9, 8, P.night3); K.fill(z, 20, 8, 9, 8, P.night3);
    El(7, 12, 2, 2, P.paper); El(24, 12, 2, 2, P.paper); K.fill(z, 7, 12, 1, 1, P.night0); K.fill(z, 24, 12, 1, 1, P.night0);
    K.fill(z, 4, 9, 3, 1, P.fog); K.fill(z, 21, 9, 3, 1, P.fog);
    K.fill(z, 29, 7, 3, 4, P.paper); K.fill(z, 30, 7, 1, 4, P.paperShade);
  });
  zoom('mitSlideRule', function (z) {
    K.fill(z, 0, 0, 32, 24, P.wood1); Dd(0, 0, 32, 24, P.brown1, 1);
    K.fill(z, 0, 18, 32, 1, P.wood0);
    K.fill(z, 9, 0, 14, 24, P.paper); K.fill(z, 9, 8, 14, 3, P.paperShade);
    for (var i = 0; i < 24; i += 2) K.fill(z, 9, i, i % 4 ? 2 : 3, 1, P.paperDark);
    K.fill(z, 8, 12, 16, 2, P.steel);
    K.fill(z, 14, 2, 8, 5, P.lamp4); K.fill(z, 15, 3, 6, 1, P.night0); K.fill(z, 15, 5, 4, 1, P.night0);
  });
  zoom('mitBadge', function (z) {
    K.fill(z, 0, 0, 32, 24, P.wood2);
    K.fill(z, 2, 3, 28, 19, P.paper); K.fill(z, 2, 3, 28, 6, P.red0);
    word(z, 'MIT', 4, 4, P.paper);
    K.fill(z, 4, 10, 8, 10, P.paperShade); K.fill(z, 5, 12, 6, 6, P.skinB1); K.fill(z, 5, 11, 6, 2, P.night0); K.fill(z, 5, 13, 6, 2, P.night0);
    K.fill(z, 14, 11, 9, 1, P.paperDark); K.fill(z, 14, 14, 7, 1, P.paperDark);
    El(25, 17, 4, 4, P.lamp3); El(25, 17, 2, 2, P.lamp4);
  });
  zoom('mitDisks', function (z) {
    K.fill(z, 0, 0, 32, 24, P.skinB1);
    K.fill(z, 3, 5, 26, 19, P.night1); K.fill(z, 5, 3, 24, 20, P.night0);
    K.fill(z, 10, 3, 12, 7, P.steel); K.fill(z, 17, 4, 3, 5, P.night0);
    K.fill(z, 8, 12, 18, 9, P.paper); word(z, 'SIM', 9, 14, P.night0); K.digits('3', 24, 14, P.night0);
    K.fill(z, 3, 10, 26, 1, P.red1);
  });

  zoom('soldierHair', function (z) {
    K.fill(z, 0, 0, 32, 24, P.night1);
    El(16, 18, 14, 14, P.skinA1);
    Dd(2, 6, 28, 12, P.skinA0, 1);
    K.fill(z, 7, 2, 18, 6, P.hair1); K.fill(z, 9, 1, 14, 1, P.hair1); Dd(16, 2, 9, 6, P.hair0, 2);
    El(3, 16, 2, 4, P.skinA1); El(29, 16, 2, 4, P.skinA0);
  });
  zoom('soldierTags', function (z) {
    K.fill(z, 0, 0, 32, 24, P.card1);
    for (var i = 0; i < 16; i += 2) K.fill(z, 4 + i, 1 + (i >> 2), 1, 1, P.fog);
    K.fill(z, 4, 6, 24, 16, P.fog); K.fill(z, 5, 7, 22, 14, P.paperShade);
    word(z, 'NOVAK', 6, 8, P.night1);
    word(z, 'T43', 6, 14, P.night1);
    word(z, 'O', 22, 14, P.night1);
  });
  zoom('soldierTin', function (z) {
    K.fill(z, 0, 0, 32, 24, P.brown1); Dd(0, 0, 32, 24, P.night2, 1);
    K.fill(z, 0, 17, 32, 3, P.brown0);
    K.fill(z, 0, 4, 32, 13, P.paperShade); K.fill(z, 0, 4, 32, 1, P.paper);
    word(z, 'K-RATION', 0, 8, P.night0);
    K.fill(z, 2, 14, 18, 1, P.paperDark);
  });
  zoom('soldierPhoto', function (z) {
    K.fill(z, 0, 0, 32, 24, P.skinA1);
    K.fill(z, 4, 1, 24, 22, P.paper);
    for (var i = 4; i < 28; i += 2) { K.fill(z, i, 1, 1, 1, P.skinA1); K.fill(z, i, 22, 1, 1, P.skinA1); }
    K.fill(z, 6, 3, 20, 17, P.night3);
    El(16, 10, 4, 5, P.paperShade);
    El(12, 6, 3, 2, P.night1); El(20, 6, 3, 2, P.night1); K.fill(z, 12, 5, 9, 2, P.night1);
    K.fill(z, 14, 12, 4, 1, P.night1);
    poly([[8, 20], [12, 15], [20, 15], [24, 20]], P.paperDark);
  });
})();
