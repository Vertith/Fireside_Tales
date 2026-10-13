/*
 * Act three, second half (3:36 AM to 4:40 AM). night.js puts them in order.
 *   investor       M. Thorne, Science Corp board      legit     (let through; on the list, lies about dinner)
 *   foodinspector  "Inspector Dale Voss"              intruder  (shoot, or turn away; 2050s)
 *   aide           A. Reyes, Office of Sen. Marsh     legit     (let through; on the list, brick phone)
 *   robot          delivery robot "operator"          android   (shutdown device)
 *   dotcom         Brett Sandoval, PocketNet          legit     (let through; not on the list, meeting moved)
 *   mother         Irene Kane, the real Kane's mother legit     (let through; her photo is the real Kane)
 */
(function () {
  var E = window.EMIT, C = E.content.characters, V = E.content.visitors, K = E.art.kit, P = K.P;
  var R = K.R, El = K.El, poly = K.poly, D = K.D;

  C.investor = { name: 'Martin Thorne', notebookName: 'Martin Thorne, Science Corp board', portrait: 'investor' };
  C.foodinspector = { name: 'Insp. Dale Voss', notebookName: '"Inspector Dale Voss", Health Dept.', portrait: 'foodinspector' };
  C.aide = { name: 'Alicia Reyes', notebookName: 'Alicia Reyes, Office of Sen. Marsh', portrait: 'aide' };
  C.robot = { name: 'Ray, Swift Courier', notebookName: '"Ray", courier with no van', portrait: 'robot' };
  C.dotcom = { name: 'Brett Sandoval', notebookName: 'Brett Sandoval, PocketNet', portrait: 'dotcom' };
  C.mother = { name: 'Irene Kane', notebookName: 'Irene Kane, Dr. Kane\'s mother', portrait: 'mother' };

  /* ================= M. Thorne, investor (legit, red herring) ================= */
  V.investor = {
    id: 'investor',
    truth: 'legit',
    prompt: 'Good watch, good teeth, and a smile that\'s been in a lot of meetings.',
    arrive: [
      { crt: ['CAM 02 LOT', '> VEHICLE: SEDAN', '> REC'] },
      { narrate: 'A black town car idled in the fire lane. The driver stayed put. The passenger didn\'t hold the door for anyone.' },
      { sfx: 'door' },
      { enter: 'investor' },
      { narrate: 'The cologne got to the desk a second before he did.' }
    ],
    greeting: [
      { who: 'investor', say: 'Evening. Or morning. Thorne, I\'m on the board. Kane\'s expecting me.' },
      { who: 'investor', say: 'Sorry I\'m late. Held up at the office.' }
    ],
    inspect: [
      { title: 'Wristwatch', zoom: 'investorWatch', x: 284, y: 192, w: 20, h: 10,
        text: 'Gold, Swiss, heavy as a fishing weight. Hands at 3:36, right to the minute. A watch you insure, not wind.',
        note: 'Gold Swiss watch. Shows the right time, 3:36. Expensive.' },
      { title: 'Business card', zoom: 'investorCard', x: 194, y: 204, w: 18, h: 14,
        text: 'MARTIN THORNE, Thorne Capital, Board of Directors, Science Corp. Engraved, not printed. It matches the list.',
        note: 'His card: Martin Thorne, Thorne Capital, Science Corp board. Matches the list.' },
      { title: 'Coat pocket', zoom: 'investorMatches', x: 208, y: 176, w: 16, h: 16,
        text: 'A matchbook poking out: THE AMBASSADOR ROOM, steaks and cocktails. Across town. Nowhere near any office.',
        note: 'Matchbook from the Ambassador Room in his coat pocket. A steakhouse across town.' },
      { title: 'Shirt collar', zoom: 'investorCollar', x: 250, y: 96, w: 16, h: 10,
        text: 'Crisp white collar. A smudge of red on the edge, about the size of a thumbprint. Not his shade.',
        note: 'A smudge of lipstick on his collar.' }
    ],
    opening: {
      name: [
        { who: 'investor', say: 'Martin Thorne. Thorne Capital. I sit on the board here, which makes me one of your bosses.' },
        { narrate: 'He said it like a joke. It wasn\'t one.' },
        { note: ['investor', 'Martin Thorne, Thorne Capital. On the Science Corp board. Wanted me to know he\'s my boss.'] }
      ],
      want: [
        { who: 'investor', say: 'Board business with Kane. Kessler Dynamics made us an offer this week. A big one.' },
        { who: 'investor', say: 'Kessler\'s been our rival for twenty years. If Kane has something, I want it signed before they hear.' },
        { note: ['investor', 'Here on board business. Kessler Dynamics, Science Corp\'s rival, made an offer this week.'] },
        { learn: 'heardKessler' }
      ],
      how: [
        { who: 'investor', say: 'Car\'s outside. I was held up at the office. Budgets. You know how it is.' },
        { narrate: 'I didn\'t. Nobody\'s ever been held up at the office smelling like that.' },
        { note: ['investor', 'Says he was held up at the office. Came by town car.'] }
      ]
    },
    questions: [
      { id: 'list', ask: 'Thorne. Board of directors. You\'re on my list.', requires: 'saw:desk.list', steps: [
        { 'if': 'run:hasList', then: [
          { narrate: 'Kane\'s clipboard: M. Thorne, Science Corp board (investor). Same name as the card.' },
          { who: 'investor', say: 'Of course I am. I sign the checks that pay for that clipboard.' },
          { note: ['investor', 'On Kane\'s visitor list: M. Thorne, board.'] }
        ], 'else': [
          { narrate: 'No list tonight. He looked at the empty clipboard like it owed him money.' }
        ] }
      ] },
      { id: 'matches', ask: 'Your office keeps matches from the Ambassador Room?', requires: 'saw:investorMatches', steps: [
        { who: 'investor', say: '...Fine. I had dinner. It ran long.' },
        { who: 'investor', say: 'With someone my wife doesn\'t need to hear about. Neither does the board.' },
        { narrate: 'A lie, sure. The ordinary kind. Men have been lying about dinner since there was dinner.' },
        { note: ['investor', 'He lied about the office. Dinner at the Ambassador Room with someone who isn\'t his wife.'] },
        { note: ['investor', 'People lie about personal things. That doesn\'t make them from another year.'] }
      ] },
      { id: 'collar', ask: 'You\'ve got something on your collar.', requires: 'saw:investorCollar', steps: [
        { who: 'investor', say: 'Ketchup.' },
        { narrate: 'At a steakhouse. In that colour.' },
        { who: 'investor', say: 'Write that in your little book and I\'ll have the agency send someone new on Monday.' },
        { note: ['investor', 'Said the lipstick was ketchup. Threatened my job.'] }
      ] },
      { id: 'watch', ask: 'Nice watch.', requires: 'saw:investorWatch', steps: [
        { who: 'investor', say: 'The board gave it to me when we went public. Twelve hundred dollars. Keeps better time than Kane.' },
        { narrate: 'Twelve hundred for a watch. Rich, but this decade\'s rich.' },
        { note: ['investor', 'Watch was a board gift when they went public. $1,200. The price sounds right for now.'] }
      ] },
      { id: 'pitch', ask: 'Anyone else coming to see Kane tonight?', requires: 'saw:investorCard', steps: [
        { who: 'investor', say: 'Some kid with a computer company. Kane\'s office squeezed him in after me.' },
        { who: 'investor', say: 'Fleece vest, wants to put the internet on a pager. God help us all.' },
        { note: ['investor', 'A young computer guy is seeing Kane after him. Fleece vest. Thorne thinks he\'s a joke.'] },
        { learn: 'heardSandoval' }
      ] }
    ],
    actions: {
      letThrough: { steps: [
        { narrate: 'I pointed him to the stairs. He tucked the matchbook deeper into his pocket on the way.' },
        { exit: 'walk' },
        { note: ['investor', 'Let him up to see Kane. Board business, and a dinner he\'ll never mention.'] }
      ] },
      turnAway: { steps: [
        { narrate: 'I told him Kane wasn\'t seeing anyone else tonight.' },
        { who: 'investor', say: 'Do you know who signs your paycheck? Find out. Then call me.' },
        { exit: 'walk' },
        { note: ['investor', 'Turned him away. He was on the list. He\'ll be back, louder.'] }
      ] },
      shoot: { steps: [
        { sfx: 'gunshot' },
        { exit: 'fall' },
        { backdrop: 'body' },
        { narrate: 'His watch kept ticking on the floor. 3:37. 3:38. His name had been on the clipboard all night.' },
        { note: ['investor', 'I shot a board member for lying about dinner. Lying isn\'t the tell.'] },
        { reset: 'You shot a board member who was on the list.' }
      ] },
      shutdown: { steps: [
        { narrate: 'I pointed Kane\'s grey box at him and pressed. Nothing.' },
        { who: 'investor', say: 'Is that a garage door opener? Are you trying to open me?' },
        { note: ['investor', 'The device did nothing to him. He thinks I\'m an idiot.'] }
      ] }
    },
    returnArrive: [
      { sfx: 'door' },
      { narrate: 'The town car was back. So was Thorne, and he\'d had time to make some calls.' },
      { enter: 'investor' }
    ],
    returnGreeting: [
      { who: 'investor', say: 'I\'ve just spoken to your agency. You can let me up, or you can find another desk.' },
      { who: 'investor', say: 'Kessler won\'t wait for us. I won\'t wait for you.' }
    ]
  };

  /* ================= "Inspector Dale Voss" (intruder, 2050s) ================= */
  V.foodinspector = {
    id: 'foodinspector',
    truth: 'intruder',
    prompt: 'He looks like a health inspector. He looks exactly like a health inspector.',
    arrive: [
      { crt: ['CAM 01 LOBBY', '> MOTION: 1', '> REC'] },
      { narrate: 'Ten to four. A man in a tan windbreaker, hairnet already on, clipboard ready. Nobody\'s that ready at ten to four.' },
      { sfx: 'door' },
      { enter: 'foodinspector' }
    ],
    greeting: [
      { who: 'foodinspector', say: 'Health Department. Spot check. Won\'t take long if your kitchen\'s clean.' }
    ],
    inspect: [
      { title: 'Clipboard', zoom: 'foodinspectorBoard', x: 270, y: 180, w: 28, h: 36,
        text: 'Thinner than a clipboard should be. The page doesn\'t curl at the corner. When his thumb moved, the writing moved too.',
        note: 'His clipboard paper doesn\'t bend, and the text scrolled when he touched it.' },
      { title: 'ID card', zoom: 'foodinspectorBadge', x: 224, y: 114, w: 16, h: 18,
        text: 'County Health Department, D. VOSS, INSPECTOR. Photo, seal, signature. Looks like every county ID I\'ve seen.',
        note: 'County Health Dept. ID, D. Voss. Looks right.' },
      { title: 'Hairnet', zoom: 'foodinspectorNet', x: 228, y: 38, w: 42, h: 18,
        text: 'A paper hairnet, on before he came in out of the rain. It\'s soaked. He came dressed for a kitchen.',
        note: 'Wore his hairnet in from the street. Came dressed for a kitchen.' },
      { title: 'Thermometer', zoom: 'foodinspectorProbe', x: 262, y: 100, w: 12, h: 22,
        text: 'A dial probe thermometer in his pocket, the kind they stab into hamburgers. Ordinary. Scuffed.',
        note: 'A probe thermometer in his breast pocket. Ordinary.' }
    ],
    opening: {
      name: [
        { who: 'foodinspector', say: 'Voss. Inspector Dale Voss, Health Department.' },
        { note: ['foodinspector', 'Inspector Dale Voss, Health Department.'] }
      ],
      want: [
        { who: 'foodinspector', say: 'Spot check on the kitchen. Under Section 4 of the Food Provenance Act.' },
        { narrate: 'I\'d never heard of it. Then again, I\'ve never heard of most laws.' },
        { note: ['foodinspector', 'Spot check on "the kitchen", under "Section 4 of the Food Provenance Act". Never heard of it.'] }
      ],
      how: [
        { who: 'foodinspector', say: 'County car. It\'s by the hydrant. Official business.' },
        { note: ['foodinspector', 'Says he came in a county car, parked by the hydrant.'] }
      ]
    },
    questions: [
      { id: 'kitchen', ask: 'What kitchen? The pizza kid says this whole building orders out.', requires: 'now:heardNoKitchen', steps: [
        { who: 'foodinspector', say: 'Every facility has a kitchen. Somewhere.' },
        { pause: 500 },
        { who: 'foodinspector', say: 'A nutrient printer, at least. Even the small offices have one by—' },
        { narrate: 'He stopped. By when, he didn\'t say.' },
        { note: ['foodinspector', 'Told him there\'s no kitchen here. He said every building has one, or "a nutrient printer at least".'] }
      ] },
      { id: 'board', ask: 'Mind if I look at the form?', requires: 'saw:foodinspectorBoard', steps: [
        { who: 'foodinspector', say: 'Inspection records are confidential.' },
        { narrate: 'He looks like he\'s getting annoyed.' },
        { note: ['foodinspector', 'Wouldn\'t show me his clipboard. Getting annoyed.'] }
      ] },
      { id: 'act', ask: 'This Food Provenance Act. When did that pass?', requires: 'saw:foodinspectorBadge', steps: [
        { who: 'foodinspector', say: 'It\'s been on the books for years. Look it up.' },
        { narrate: 'Yeah, with everything going on tonight, I\'m not running to the library.' },
        { note: ['foodinspector', 'Asked when the Food Provenance Act passed. "On the books for years. Look it up." Never heard of it.'] }
      ] },
      { id: 'net', ask: 'You wore the hairnet in the car?', requires: 'saw:foodinspectorNet', steps: [
        { who: 'foodinspector', say: 'It saves time. Now I need to see your food storage facilities and make sure the protein is stored correctly.' },
        { narrate: 'Protein. Not the food, not the meat. The protein. Like it came in a can marked PROTEIN.' },
        { note: ['foodinspector', 'Wants to see the food storage and check "the protein is stored correctly".'] }
      ] },
      { id: 'probe', ask: 'What\'s the thermometer for?', requires: 'saw:foodinspectorProbe', steps: [
        { who: 'foodinspector', say: 'Hot food above one-forty, cold below forty. Standard.' },
        { narrate: 'That one he had down cold. Somebody had studied.' },
        { note: ['foodinspector', 'Knows his food temperatures. That part he\'d studied.'] }
      ] }
    ],
    actions: {
      letThrough: { steps: [
        { narrate: 'I sent him up to look for a kitchen that doesn\'t exist. He didn\'t look for it.' },
        { exit: 'walk' },
        { pause: 800 },
        { sfx: 'distant' },
        { narrate: 'The elevator went straight to four. Then the fourth floor went white.' },
        { note: ['foodinspector', 'Let him up. He went straight to the fourth floor, not looking for any kitchen.'] },
        { reset: 'You let a man from the 2050s through.' }
      ] },
      turnAway: { steps: [
        { narrate: 'I told him there was no kitchen, so there was nothing to inspect.' },
        { who: 'foodinspector', say: 'I\'ll note that you obstructed.' },
        { exit: 'walk' },
        { narrate: 'He tapped his clipboard on the way out. I\'d have sworn it lit up.' },
        { note: ['foodinspector', 'Turned him away. He said he\'d note I obstructed him.'] }
      ] },
      shoot: { steps: [
        { sfx: 'gunshot' },
        { exit: 'fall' },
        { backdrop: 'body' },
        { narrate: 'The clipboard hit the floor flat, no bounce. The page on it was still scrolling.' },
        { note: ['foodinspector', 'Shot him. His clipboard kept scrolling on the floor. Not paper.'] }
      ] },
      shutdown: { steps: [
        { narrate: 'I pointed Kane\'s grey box at him. He looked at it, then at me, like he knew exactly what it was.' },
        { who: 'foodinspector', say: 'That doesn\'t work on people.' },
        { narrate: 'How would a health inspector know that?' },
        { note: ['foodinspector', 'The device did nothing. He knew it "doesn\'t work on people". How?'] }
      ] }
    }
  };

  /* ================= A. Reyes, senator's aide (legit, red herring) ================= */
  V.aide = {
    id: 'aide',
    truth: 'legit',
    prompt: 'Two things on her are buzzing and she hasn\'t looked at either.',
    arrive: [
      { crt: ['CAM 02 LOT', '> VEHICLE', '> REC'] },
      { narrate: 'A rental car took the corner too fast. A woman got out talking, with nobody next to her.' },
      { sfx: 'door' },
      { enter: 'aide' }
    ],
    greeting: [
      { who: 'aide', say: '—no, I\'m here, I\'m in the lobby. I\'ll call you back. You\'re breaking up.' },
      { who: 'aide', say: 'Reyes, Senator Marsh\'s office. Dr. Kane. I\'m late. Which floor?' }
    ],
    inspect: [
      { title: 'Cell phone', zoom: 'aidePhone', x: 284, y: 184, w: 20, h: 32,
        text: 'A cell phone the size of a brick, pull-up antenna, green screen. ROAM. One bar. It buzzes in her fist like a hornet.',
        note: 'Brick cell phone, pull-up antenna, green screen reading ROAM. Buzzing.' },
      { title: 'Pager', zoom: 'aidePager', x: 260, y: 190, w: 16, h: 12,
        text: 'A pager clipped to her waistband, also buzzing. A Washington number, then 911.',
        note: 'Pager on her belt: a 202 number and 911.' },
      { title: 'Lapel ID', zoom: 'aideBadge', x: 262, y: 112, w: 16, h: 16,
        text: 'U.S. Senate staff ID on a clip. Unflattering photo, laminate peeling at the corner.',
        note: 'U.S. Senate staff ID. Worn, real.' },
      { title: 'Folder', zoom: 'aideFolder', x: 188, y: 182, w: 28, h: 50,
        text: 'A manila folder in her other hand, stamped ENERGY RESEARCH APPROPRIATIONS. A letter on Senate letterhead with a blank signature line.',
        note: 'Folder: Energy research appropriations. A letter waiting for a signature.' }
    ],
    opening: {
      name: [
        { who: 'aide', say: 'Alicia Reyes. Senator Marsh. Her office, not her.' },
        { note: ['aide', 'Alicia Reyes, Office of Senator Marsh.'] }
      ],
      want: [
        { who: 'aide', say: 'Dr. Kane signs a letter, I drive it back. Committee votes at nine.' },
        { who: 'aide', say: 'Two minutes. One, if he has a pen.' },
        { note: ['aide', 'Needs Kane to sign a letter before a committee vote at nine.'] }
      ],
      how: [
        { who: 'aide', say: 'Drove. Three hours. Rental smells like cigarettes.' },
        { note: ['aide', 'Drove three hours in a rental.'] }
      ]
    },
    questions: [
      { id: 'phone', ask: 'That thing actually work out here?', requires: 'saw:aidePhone', steps: [
        { who: 'aide', say: 'Barely. My carrier drops every call past the bridge.' },
        { who: 'aide', say: 'And roaming\'s ninety cents a minute. The Senator thinks it\'s free.' },
        { narrate: 'A phone the size of a brick, a bill the size of a phone book. That\'s about right for now.' },
        { note: ['aide', 'Her carrier drops calls past the bridge. Roaming 90 cents a minute. Sounds like now.'] }
      ] },
      { id: 'pager', ask: 'Somebody really wants you.', requires: 'saw:aidePager', steps: [
        { who: 'aide', say: 'The Senator. 911 means call back. 911 911 means I\'m fired.' },
        { narrate: 'It buzzed again. She looked. One 911.' },
        { note: ['aide', 'Pager is the Senator. "911 means call back, 911 911 means I\'m fired."'] }
      ] },
      { id: 'list', ask: 'Reyes, Senator Marsh\'s office. You\'re on the list.', requires: 'saw:desk.list', steps: [
        { 'if': 'run:hasList', then: [
          { narrate: 'Kane\'s clipboard: A. Reyes, Office of Sen. Marsh.' },
          { who: 'aide', say: 'Great. Then we agree. Which floor?' },
          { note: ['aide', 'On Kane\'s visitor list: A. Reyes, Office of Sen. Marsh.'] }
        ], 'else': [
          { narrate: 'No clipboard tonight. She didn\'t wait for me to find one.' }
        ] }
      ] },
      { id: 'folder', ask: 'What\'s he signing?', requires: 'saw:aideFolder', steps: [
        { who: 'aide', say: 'A letter of support. Energy research money. If he wants a lab next year, he signs tonight.' },
        { note: ['aide', 'Kane\'s signing a letter of support for energy research funding.'] }
      ] },
      { id: 'badge', ask: 'Rough night?', requires: 'saw:aideBadge', steps: [
        { who: 'aide', say: 'Rough year. Ask me after the vote.' },
        { note: ['aide', 'Short with me. Rough year, she says.'] }
      ] }
    ],
    actions: {
      letThrough: { steps: [
        { narrate: 'Second floor stairs, then the elevator to four. She was gone before the "four".' },
        { exit: 'walk' },
        { note: ['aide', 'Let her up. Her phone was ringing all the way up the stairs.'] }
      ] },
      turnAway: { steps: [
        { narrate: 'I told her Kane wasn\'t signing anything tonight.' },
        { who: 'aide', say: 'Then you can explain it to the Senator. She\'ll call. You\'ll answer.' },
        { exit: 'walk' },
        { note: ['aide', 'Turned her away. She was on the list. She\'ll be back.'] }
      ] },
      shoot: { steps: [
        { sfx: 'gunshot' },
        { exit: 'fall' },
        { backdrop: 'body' },
        { narrate: 'The brick phone kept buzzing on the tiles. Somewhere a senator was calling. Nobody answered.' },
        { note: ['aide', 'I shot a senator\'s aide because her phone was ringing. A phone isn\'t the tell. The kind of phone is.'] },
        { reset: 'You shot a senator\'s aide who was on the list.' }
      ] },
      shutdown: { steps: [
        { narrate: 'I aimed the grey box and pressed. Her pager went off. That was a coincidence.' },
        { who: 'aide', say: 'Was that a beeper? Are you paging me? I\'m standing right here.' },
        { note: ['aide', 'Device did nothing to her. Her pager went off by chance.'] }
      ] }
    },
    returnArrive: [
      { sfx: 'door' },
      { narrate: 'The rental was back across two spaces. So was Reyes, phone at her ear.' },
      { enter: 'aide' }
    ],
    returnGreeting: [
      { who: 'aide', say: 'The Senator called your building manager at home. At home. Which floor?' }
    ]
  };

  /* ================= Delivery robot "operator" (android, near future) ================= */
  V.robot = {
    id: 'robot',
    truth: 'android',
    prompt: 'A courier, neat as a new deck of cards. The rain didn\'t get the memo.',
    arrive: [
      { crt: ['CAM 01 LOBBY', '> MOTION: 1', '> REC'] },
      { narrate: 'No van in the lot, no headlights. Just a courier coming in from the dark with a parcel in both hands.' },
      { enter: 'robot' }
    ],
    greeting: [
      { who: 'robot', say: 'Good morning. Delivery for the fourth floor. Signature required.' }
    ],
    inspect: [
      { title: 'Eyes', zoom: 'robotEyes', x: 232, y: 58, w: 34, h: 12,
        text: 'I tipped the lamp up into his face. Anyone else squints. His pupils stayed exactly the size they were.',
        note: 'Shone the lamp in his eyes. His pupils didn\'t shrink.' },
      { title: 'Uniform', zoom: 'robotUniform', x: 222, y: 128, w: 22, h: 26,
        text: 'A courier uniform, not one crease. Not at the elbow, not at the waist. Like it had never been sat in.',
        note: 'His uniform has no creases at all. Not even at the elbows.' },
      { title: 'Delivery slip', zoom: 'robotSlip', x: 280, y: 196, w: 20, h: 18,
        text: 'Signature slip under his thumb. Time of delivery printed: 04:16:07. To the second, in army time.',
        note: 'Delivery slip time-stamped 04:16:07. To the second, 24-hour time.' },
      { title: 'Parcel', zoom: 'robotParcel', x: 214, y: 196, w: 26, h: 16,
        text: 'Brown paper, string, a typed label: DR. A. KANE, LAB 4. No postage, no return address.',
        note: 'Parcel addressed to Dr. A. Kane, Lab 4. No return address.' },
      { title: 'Shoes', zoom: 'robotShoes', x: 216, y: 230, w: 66, h: 16,
        text: 'Trouser cuffs and black shoes, shined. Bone dry. Not a drop on the welts. He says he walked here.',
        note: 'His shoes and trouser cuffs are bone dry. He says he walked.' }
    ],
    opening: {
      name: [
        { who: 'robot', say: 'Ray. Swift Courier.' },
        { note: ['robot', 'Says he\'s Ray, Swift Courier.'] }
      ],
      want: [
        { who: 'robot', say: 'A parcel for Dr. Kane. It must be signed for in person. By Dr. Kane.' },
        { note: ['robot', 'Parcel for Kane, has to be signed for by Kane in person.'] }
      ],
      how: [
        { who: 'robot', say: 'The delivery unit broke down, so I walked it in myself.' },
        { narrate: 'Delivery unit. The van, I figured. Couriers have funny words for everything.' },
        { note: ['robot', 'Says "the delivery unit broke down", so he walked it in.'] }
      ]
    },
    questions: [
      { id: 'unit', ask: 'What kind of delivery unit breaks down?', requires: 'saw:robotParcel', steps: [
        { who: 'robot', say: 'It happens less now. Drones used to be so unreliable.' },
        { pause: 500 },
        { who: 'robot', say: 'Vans. I meant vans.' },
        { note: ['robot', 'Said "drones used to be so unreliable." Then corrected it to vans.'] }
      ] },
      { id: 'slip', ask: 'Your slip\'s stamped to the second.', requires: 'saw:robotSlip', steps: [
        { who: 'robot', say: 'Oh-four-sixteen and seven seconds. Precision is a service standard.' },
        { narrate: 'Nobody\'s courier company cares what second it is. Mine barely knows the day.' },
        { note: ['robot', 'Read his slip out as "oh-four-sixteen and seven seconds". Precision is a "service standard".'] }
      ] },
      { id: 'weather', ask: 'Some weather out there, huh?', requires: 'saw:robotShoes', steps: [
        { who: 'robot', say: 'Yes. There is weather. It is rain.' },
        { pause: 500 },
        { who: 'robot', say: 'Eleven millimetres per hour.' },
        { narrate: 'And not one of those millimetres on his shoes.' },
        { note: ['robot', 'Small talk about the weather: "There is weather. It is rain. Eleven millimetres per hour."'] }
      ] },
      { id: 'lamp', ask: 'Look right into the lamp for me.', requires: 'saw:robotEyes', steps: [
        { who: 'robot', say: 'Of course.' },
        { narrate: 'He looked straight into a sixty-watt bulb from a foot away and didn\'t blink. Not once.' },
        { note: ['robot', 'Stared into the desk lamp without blinking.'] }
      ] },
      { id: 'creases', ask: 'Uniform looks brand new.', requires: 'saw:robotUniform', steps: [
        { who: 'robot', say: 'It is issued fresh at the start of each shift.' },
        { note: ['robot', 'Says his uniform is "issued fresh" each shift.'] }
      ] },
      { id: 'inspector', ask: 'Your friend the inspector didn\'t make it upstairs either.', requires: 'now:stoppedAndroid', steps: [
        { who: 'robot', say: 'I do not know an inspector.' },
        { pause: 600 },
        { who: 'robot', say: 'Is everything in order?' },
        { narrate: 'Same words. Same smile. Different face.' },
        { note: ['robot', 'Mentioned the inspector. He asked "Is everything in order?" Same as the inspector did.'] }
      ] }
    ],
    actions: {
      shutdown: { steps: [
        { sfx: 'shutdown' },
        { narrate: 'I pointed Kane\'s box at him and pressed. He stopped with his pen held out for my signature.' },
        { exit: 'fall' },
        { narrate: 'The parcel landed on its corner. Inside, it ticked. Then it stopped, too.' },
        { note: ['robot', 'The device dropped him mid-sentence. The parcel ticked, then went quiet.'] },
        { learn: 'stoppedAndroid' }
      ] },
      shoot: { steps: [
        { sfx: 'gunshot' },
        { narrate: 'The shot put a hole through the crease that wasn\'t there. He didn\'t even look down.' },
        { who: 'robot', say: 'That is not a signature.' },
        { note: ['robot', 'Bullets do nothing to the courier. The grey box is for things like him.'] },
        { reset: 'Bullets don\'t stop androids. That\'s what the device is for.' }
      ] },
      letThrough: { steps: [
        { narrate: 'I signed for it and sent him up to have Kane sign too. His footsteps on the stairs were metronome steady.' },
        { exit: 'walk' },
        { pause: 800 },
        { sfx: 'distant' },
        { narrate: 'Whatever was in the parcel got delivered. Then the light came.' },
        { note: ['robot', 'Let the courier up. The parcel reached Kane. The night started over.'] },
        { reset: 'You let an android through.' }
      ] },
      turnAway: { steps: [
        { narrate: 'I told him to leave it at the desk or take it back.' },
        { who: 'robot', say: 'The parcel must be signed for in person. I will reattempt delivery.' },
        { exit: 'walk' },
        { narrate: 'He walked out into the rain without hunching. The rain didn\'t seem to bother him either.' },
        { note: ['robot', 'Turned him away. He\'ll "reattempt delivery".'] }
      ] }
    }
  };

  /* ================= Brett Sandoval, dot-com founder (legit, red herring) ================= */
  V.dotcom = {
    id: 'dotcom',
    truth: 'legit',
    prompt: 'He talks about the future like a man selling tickets to it.',
    arrive: [
      { crt: ['CAM 02 LOT', '> VEHICLE: TAXI', '> REC'] },
      { narrate: 'A taxi. A young guy in a fleece vest paid with a fifty and didn\'t wait for change.' },
      { sfx: 'door' },
      { enter: 'dotcom' }
    ],
    greeting: [
      { who: 'dotcom', say: 'Hey! Hi. Brett. Here for Dr. Kane. Is this the right building? It is. I can tell. Great energy.' }
    ],
    inspect: [
      { title: 'Organizer', zoom: 'dotcomPalm', x: 284, y: 190, w: 20, h: 26,
        text: 'A grey pocket organizer with a little plastic stylus. Calendar on the screen, black on grey. 4:30 KANE.',
        note: 'Pocket organizer with a stylus. Calendar says 4:30 KANE.' },
      { title: 'Pager', zoom: 'dotcomPager', x: 258, y: 188, w: 16, h: 12,
        text: 'A pager on his belt, message still up: MTG MOVED 430AM KANE OFC. Sent at 6:12 last night.',
        note: 'Pager message: MTG MOVED 430AM KANE OFC, sent yesterday evening.' },
      { title: 'Business card', zoom: 'dotcomCard', x: 194, y: 202, w: 18, h: 14,
        text: 'BRETT SANDOVAL, FOUNDER & CEO, POCKETNET INC. A dot-com address under the phone number. Fresh from the printer.',
        note: 'His card: Brett Sandoval, Founder & CEO, PocketNet Inc. Web address on it.' },
      { title: 'Fleece vest', zoom: 'dotcomFleece', x: 260, y: 114, w: 16, h: 12,
        text: 'A fleece vest with a trade-show logo stitched on: COMDEX. They hand those out by the thousand.',
        note: 'Fleece vest with a trade-show logo. Free swag.' }
    ],
    opening: {
      name: [
        { who: 'dotcom', say: 'Brett Sandoval. Founder, PocketNet. You haven\'t heard of us. You will.' },
        { note: ['dotcom', 'Brett Sandoval, founder of PocketNet.'] }
      ],
      want: [
        { who: 'dotcom', say: 'Dr. Kane. My investor meeting got moved. His office paged me. Four-thirty.' },
        { who: 'dotcom', say: 'Weird hour, I know. Genius keeps genius hours. I respect it.' },
        { note: ['dotcom', 'Says Kane\'s office moved his investor meeting to 4:30 and paged him.'] }
      ],
      how: [
        { who: 'dotcom', say: 'Red-eye from San Jose, then a cab. Cabbie had never heard of the internet. Can you believe that?' },
        { narrate: 'I could. I\'d heard of it. I just hadn\'t met anyone who\'d been.' },
        { note: ['dotcom', 'Red-eye from San Jose and a cab. Shocked the cabbie hadn\'t heard of the internet.'] }
      ]
    },
    questions: [
      { id: 'list', ask: 'You\'re not on my list.', requires: 'saw:desk.list', steps: [
        { who: 'dotcom', say: 'Right, no, because it moved. Last night. Check my pager. Seriously, look.' },
        { narrate: 'He unclipped it and held it up like a badge.' },
        { note: ['dotcom', 'Not on Kane\'s list. Says the meeting moved last night, showed me his pager.'] }
      ] },
      { id: 'pager', ask: 'Who sent the page?', requires: 'saw:dotcomPager', steps: [
        { who: 'dotcom', say: 'Kane\'s office. Some lady, very dry. Said he works nights and I could come at four-thirty or never.' },
        { note: ['dotcom', 'Kane\'s office paged him: come at 4:30 or never.'] }
      ] },
      { id: 'palm', ask: 'What\'s that gadget?', requires: 'saw:dotcomPalm', steps: [
        { who: 'dotcom', say: 'Organizer. Calendar, contacts, notes. It\'s nothing. It\'s a toy. It\'s the start.' },
        { who: 'dotcom', say: 'Someday everyone will carry the internet in their pocket. Everyone.' },
        { narrate: 'Will. He said will. The ones from later talk like it\'s already happened.' },
        { note: ['dotcom', 'Says "someday everyone WILL carry the internet in their pocket." Future tense. A prediction.'] }
      ] },
      { id: 'card', ask: 'So what does PocketNet do?', requires: 'saw:dotcomCard', steps: [
        { who: 'dotcom', say: 'Right now? Nothing. In five years we\'ll put the internet on pocket fax machines. Coast to coast.' },
        { narrate: 'Pocket fax machines. A guess, and a wrong one. Nobody who\'d seen it would guess.' },
        { note: ['dotcom', 'His big idea: the internet on "pocket fax machines". He\'s guessing, and guessing wrong.'] }
      ] },
      { id: 'thorne', ask: 'Martin Thorne mentioned you.', requires: 'now:heardSandoval', steps: [
        { who: 'dotcom', say: 'Thorne\'s here? Great. He thinks I\'m a joke. He\'ll think different when we go public.' },
        { note: ['dotcom', 'Knows Thorne, the investor. Thorne thinks he\'s a joke. Their stories match.'] }
      ] },
      { id: 'kessler', ask: 'You pitch Kessler Dynamics too?', requires: 'now:heardKessler', steps: [
        { who: 'dotcom', say: 'Kessler passed. Said the internet\'s a fad, like CB radio. Their loss. Write that down.' },
        { narrate: 'I wrote it down.' },
        { note: ['dotcom', 'Kessler Dynamics passed on PocketNet. Called the internet "a fad, like CB radio".'] }
      ] }
    ],
    actions: {
      letThrough: { steps: [
        { narrate: 'I sent him up. He was pitching the elevator before the doors closed.' },
        { exit: 'walk' },
        { note: ['dotcom', 'Let him up for his 4:30 with Kane.'] }
      ] },
      turnAway: { steps: [
        { narrate: 'I told him nobody without a name on the list goes up.' },
        { who: 'dotcom', say: 'Okay. Okay! That\'s fine. Someday you\'ll tell people you turned me away. It\'ll be a great story.' },
        { exit: 'walk' },
        { note: ['dotcom', 'Turned him away. He was very upbeat about it. He\'ll be back.'] }
      ] },
      shoot: { steps: [
        { sfx: 'gunshot' },
        { exit: 'fall' },
        { backdrop: 'body' },
        { narrate: 'The organizer skittered across the tiles. The calendar on it still said 4:30 KANE.' },
        { note: ['dotcom', 'I shot him for talking about the future. He talked about it in the future tense.'] },
        { reset: 'You shot a dot-com founder for guessing about the future.' }
      ] },
      shutdown: { steps: [
        { narrate: 'I pointed the grey box at him and pressed. Nothing.' },
        { who: 'dotcom', say: 'Whoa. Is that infrared? Can I see it? Who makes that? Are they funded?' },
        { note: ['dotcom', 'Device did nothing. He wanted to invest in it.'] }
      ] }
    },
    returnArrive: [
      { sfx: 'door' },
      { narrate: 'Another taxi. Brett, still smiling, but it had started to cost him something.' },
      { enter: 'dotcom' }
    ],
    returnGreeting: [
      { who: 'dotcom', say: 'Me again! Kane\'s office paged me twice. Twice. They want me up there. Please.' }
    ]
  };

  /* ================= Irene Kane, the real Kane's mother (legit, twist clue) ================= */
  V.mother = {
    id: 'mother',
    truth: 'legit',
    prompt: 'A little lady with a big cake, and a son she\'s very proud of.',
    arrive: [
      { crt: ['CAM 02 LOT', '> VEHICLE: TAXI', '> REC'] },
      { narrate: 'A taxi, and a driver who got out in the rain to hold the door. For a cake box, and the lady behind it.' },
      { sfx: 'door' },
      { enter: 'mother' }
    ],
    greeting: [
      { who: 'mother', say: 'Hello, dear. I\'m here to see my son. He works upstairs. He\'s a doctor. Not the medical kind.' }
    ],
    inspect: [
      { title: 'Cake box', zoom: 'motherCake', x: 206, y: 124, w: 86, h: 22,
        text: 'A white bakery box tied with string. Through the window, blue icing: HAPPY BIRTHDAY DUSTY.',
        note: 'Bakery cake, iced HAPPY BIRTHDAY DUSTY.' },
      { title: 'Handbag', zoom: 'motherPhoto', x: 190, y: 196, w: 26, h: 26,
        text: 'She opened the handbag for her glasses and a photo slid half out: a short, bald man with a grey moustache. Her son.',
        note: 'Photo of her son in her purse: short, bald, grey moustache. Not the man who ran in.', learn: 'realKaneDescribed' },
      { title: 'Rain bonnet', zoom: 'motherBonnet', x: 226, y: 44, w: 46, h: 20,
        text: 'A clear plastic rain bonnet over a fresh set. Folds into a pouch the size of a matchbook. Every mother in Ohio has one.',
        note: 'Plastic rain bonnet over a fresh hairdo.' },
      { title: 'Coat pocket', zoom: 'motherTicket', x: 268, y: 198, w: 22, h: 14,
        text: 'A bus ticket stub in her coat pocket. MARLOW, OH to here. Today\'s date. Thirty-one fifty, one way.',
        note: 'Bus ticket stub: Marlow, Ohio to here, today, $31.50 one way.' }
    ],
    opening: {
      name: [
        { who: 'mother', say: 'Irene Kane. I\'m Aldous\'s mother. Dr. Kane, I should say. He hates it when I don\'t.' },
        { note: ['mother', 'Irene Kane, Dr. Aldous Kane\'s mother.'] }
      ],
      want: [
        { who: 'mother', say: 'It\'s his birthday. Or near enough. I brought a cake.' },
        { who: 'mother', say: 'His birthday\'s in March... or is it April?' },
        { pause: 500 },
        { who: 'mother', say: 'March. I was there, wasn\'t I.' },
        { note: ['mother', 'Brought a birthday cake. Wasn\'t sure if his birthday is March or April. Settled on March.'] }
      ],
      how: [
        { who: 'mother', say: 'The bus from Marlow. That\'s Ohio. Then a taxi. The driver carried the cake. Such a nice boy.' },
        { note: ['mother', 'Took the bus from Marlow, Ohio, then a taxi.'] }
      ]
    },
    questions: [
      { id: 'dusty', ask: 'Who\'s Dusty?', requires: 'saw:motherCake', steps: [
        { who: 'mother', say: 'Aldous! That\'s what we called him. Always taking apart his daddy\'s clocks. Covered in dust.' },
        { who: 'mother', say: 'He called last week. Said he was close to something big. Something with clocks.' },
        { who: 'mother', say: 'Still clocks. Fifty-some years old. I\'m so proud I could spit.' },
        { narrate: 'Clocks. The man who ran in tonight had cracked time, he said. Same idea. Different man, maybe.' },
        { note: ['mother', 'His childhood nickname is Dusty. Called her last week: "close to something big, something with clocks."'] }
      ] },
      { id: 'photo', ask: 'Can I see that photo?', requires: 'saw:motherPhoto', steps: [
        { who: 'mother', say: 'Oh, that\'s my Aldous. At the lake, two summers ago. He hates having his picture taken.' },
        { narrate: 'Short. Bald as a doorknob. A grey moustache and glasses, squinting at the sun.' },
        { narrate: 'The man who ran past my desk tonight was a head taller, with a lot of wild grey hair.' },
        { note: ['mother', 'Her photo of Aldous: short, bald, grey moustache, glasses. The "Kane" who ran in is tall, wild-haired.'] },
        { learn: 'realKaneDescribed' }
      ] },
      { id: 'tall', ask: 'Your son. Tall fellow? Wild grey hair?', requires: 'now:realKaneDescribed', steps: [
        { who: 'mother', say: 'Tall? Aldous? Oh, honey, no. Five foot five in his good shoes.' },
        { who: 'mother', say: 'And he hasn\'t had hair since his thirties. Gets that from his father.' },
        { note: ['mother', 'Says Aldous is 5\'5" and bald since his thirties. Not tall. Not wild-haired.'] }
      ] },
      { id: 'sister', ask: 'Your daughter Ellen came by earlier.', requires: 'now:metSister', steps: [
        { who: 'mother', say: 'Ellen! Of course she did. She worries about him. She\'ll have told you he forgets to eat.' },
        { who: 'mother', say: 'And I bet she called him Dusty. She tells everyone.' },
        { narrate: 'Same nickname. Same town. Their stories fit like two halves of a ticket.' },
        { note: ['mother', 'Her story matches Ellen Dobbs\'s: the nickname Dusty, Marlow, Ohio.'] }
      ] },
      { id: 'bonnet', ask: 'Long way to come for a cake.', requires: 'saw:motherBonnet', steps: [
        { who: 'mother', say: 'He never comes home. So home comes to him. Mothers do that.' },
        { note: ['mother', 'Came all this way because her son never comes home.'] }
      ] },
      { id: 'emit', ask: 'Does the name Emit mean anything to you?', requires: 'wantedPoster', steps: [
        { who: 'mother', say: 'Emit? No, dear. Is that one of his friends from work?' },
        { pause: 500 },
        { who: 'mother', say: 'Aldous doesn\'t have friends from work. He has clocks.' },
        { note: ['mother', 'She\'s never heard the name Emit.'] }
      ] }
    ],
    actions: {
      letThrough: { steps: [
        { narrate: 'I told her the fourth floor, end of the hall. She thanked me like I\'d carried the cake myself.' },
        { exit: 'walk' },
        { narrate: 'The man upstairs was expecting a lot of people tonight. I didn\'t think he was expecting his mother. Not his.' },
        { note: ['mother', 'Let her up with the cake. I wonder which Kane she\'ll find.'] },
        { set: 'sentMother' }
      ] },
      turnAway: { steps: [
        { narrate: 'I told her the doctor wasn\'t seeing anyone tonight. Not even family.' },
        { who: 'mother', say: 'Oh. Well. He always was busy. I\'ll wait in the taxi. Tell him his mother came.' },
        { exit: 'walk' },
        { note: ['mother', 'Turned away Kane\'s mother. She said she\'d wait. I felt about two inches tall.'] }
      ] },
      shoot: { steps: [
        { sfx: 'gunshot' },
        { exit: 'fall' },
        { backdrop: 'body' },
        { narrate: 'The cake box landed right side up. HAPPY BIRTHDAY DUSTY. I sat down hard.' },
        { note: ['mother', 'I shot Kane\'s mother. Nothing on earth is worth that.'] },
        { reset: 'You shot Dr. Kane\'s mother.' }
      ] },
      shutdown: { steps: [
        { narrate: 'I pointed the grey box at her and pressed. Nothing. I was glad.' },
        { who: 'mother', say: 'Is that the television clicker? Aldous has one just like it. Never finds it.' },
        { note: ['mother', 'Device did nothing to her. She thought it was a TV remote.'] }
      ] }
    },
    returnArrive: [
      { sfx: 'door' },
      { narrate: 'The taxi had waited. She came back in with the cake, a little wetter, a lot more determined.' },
      { enter: 'mother' }
    ],
    returnGreeting: [
      { who: 'mother', say: 'I\'m sorry, dear. I came all this way. Could you just tell him his mother\'s downstairs?' }
    ]
  };

  /* ===================================================================== */
  /* ============================== ART ================================== */
  /* ===================================================================== */
  var A = E.art.visitors, Z = E.art.zooms;
  function face(skin, hi, sh, cy) {
    // a standard head: neck, oval, lamp-lit left, shadowed right
    R(240, cy + 20, 18, 16, skin);
    El(249, cy, 18, 22, skin); El(246, cy - 1, 15, 19, hi); D(257, cy - 14, 12, 34, sh, 2);
  }

  /* --- Martin Thorne: navy pinstripe, camel overcoat, slicked hair --- */
  A.investor = function () {
    // lower half: pinstriped navy trousers, jacket, camel overcoat open over it
    K.legs(P.night3, P.night2, 194);
    [222, 236, 262, 276].forEach(function (x) { R(x, 194, 1, 60, P.suit2); });
    K.torso(P.night3, P.night2, 200);
    [222, 234, 264, 276].forEach(function (x) { R(x, 164, 1, 36, P.suit2); });
    R(249, 164, 1, 36, P.night0); R(246, 182, 2, 2, P.night0);
    poly([[196, 164], [224, 164], [226, 246], [202, 246]], P.card1);
    poly([[274, 164], [302, 164], [298, 246], [272, 246]], P.card0);
    R(224, 164, 1, 82, P.card0); R(273, 164, 1, 82, P.brown1);
    // matchbook poking out of the left coat pocket
    R(210, 186, 14, 1, P.card0);
    R(213, 180, 7, 7, P.red1); R(213, 182, 7, 1, P.paper);
    K.armL(P.card1, P.paper, P.skinA1, P.skinA2);
    K.armR(P.card0, P.paper, P.skinA1, P.skinA2);
    // business card in the left hand, gold watch on the right wrist
    R(197, 208, 13, 8, P.paper); R(199, 210, 8, 1, P.paperDark); R(199, 213, 6, 1, P.paperShade);
    El(205, 207, 3, 2, P.skinA1);
    R(287, 195, 14, 5, P.lamp3); R(292, 195, 5, 5, P.lamp4); R(293, 196, 3, 3, P.paper);
    R(296, 210, 3, 2, P.lamp4);

    // upper half: camel overcoat shoulders, navy suit, white shirt, red tie
    poly([[182, 170], [194, 106], [224, 96], [274, 96], [304, 106], [316, 170]], P.card0);
    poly([[188, 170], [198, 108], [226, 98], [249, 98], [249, 170]], P.card1);
    poly([[224, 100], [274, 100], [268, 170], [230, 170]], P.night2);
    poly([[224, 100], [249, 100], [249, 170], [230, 170]], P.night3);
    [232, 240, 258, 266].forEach(function (x) { R(x, 120, 1, 50, P.suit2); });
    poly([[238, 100], [260, 100], [249, 134]], P.paper);
    poly([[247, 104], [251, 104], [253, 136], [249, 142], [245, 136]], P.red1);
    R(248, 104, 2, 4, P.red0);
    // pocket square
    R(260, 118, 8, 3, P.paper); R(262, 116, 3, 2, P.paper);
    // collar with a smudge you only see up close
    R(253, 100, 4, 1, P.red1);
    // face: clean-shaven, tan, a sideways smile
    face(P.skinA1, P.skinA2, P.skinA0, 66);
    // slicked-back dark hair, grey at the temples
    El(249, 47, 19, 8, P.hair0); R(231, 48, 36, 8, P.hair0); R(232, 46, 30, 2, P.hair1);
    R(234, 44, 22, 1, P.hair1);
    D(231, 54, 4, 8, P.fog, 2); D(264, 54, 4, 8, P.steel, 2);
    // half-lidded eyes
    R(238, 65, 7, 2, P.night0); R(253, 65, 7, 2, P.night0); R(237, 63, 9, 2, P.skinA0); R(252, 63, 9, 2, P.skinA0);
    R(239, 65, 2, 1, P.paper); R(254, 65, 2, 1, P.paper);
    R(236, 60, 9, 1, P.hair0); R(253, 60, 9, 1, P.hair0);
    // shady smile, one corner up
    R(242, 80, 12, 1, P.skinA0); R(254, 78, 2, 2, P.skinA0); R(244, 81, 8, 1, P.paper);
  };

  /* --- "Inspector Voss": tan windbreaker, hairnet, clipboard --- */
  A.foodinspector = function () {
    // lower half: dark slacks, elastic windbreaker hem, clipboard in the right hand
    K.legs(P.night2, P.night1, 196);
    K.torso(P.wood3, P.wood2, 198);
    R(210, 192, 78, 6, P.wood1); R(210, 192, 78, 1, P.wood2);
    R(249, 164, 1, 34, P.night1);
    for (var z = 166; z < 196; z += 3) R(248, z, 3, 1, P.steel);
    R(214, 176, 18, 1, P.wood2); R(268, 176, 16, 1, P.wood1);
    K.armL(P.wood3, P.wood1, P.skinB1, P.skinB2);
    K.armR(P.wood2, P.wood1, P.skinB1, P.skinB2);
    // the clipboard: a clip, a page, a board edge one pixel too thin
    R(273, 184, 24, 32, P.paper); R(273, 215, 24, 1, P.paperShade);
    R(280, 182, 10, 4, P.steel); R(281, 183, 8, 1, P.fog);
    for (var l = 0; l < 6; l++) R(276, 190 + l * 4, 16 - (l % 3) * 3, 1, P.paperDark);
    R(276, 212, 6, 1, P.red1);
    El(293, 205, 5, 6, P.skinB1); El(292, 204, 3, 4, P.skinB2);

    // upper half: tan windbreaker, stand collar, ID card, probe thermometer
    poly([[188, 170], [200, 110], [226, 98], [272, 98], [298, 110], [310, 170]], P.wood2);
    poly([[194, 170], [204, 112], [228, 100], [249, 100], [249, 170]], P.wood3);
    R(249, 102, 1, 68, P.night1);
    for (var zz = 106; zz < 170; zz += 3) R(248, zz, 3, 1, P.steel);
    poly([[232, 96], [266, 96], [264, 106], [234, 106]], P.wood2); R(232, 96, 17, 10, P.wood3);
    R(234, 106, 30, 1, P.wood1);
    // ID card clipped to the left chest
    R(226, 116, 12, 15, P.paper); R(228, 118, 5, 6, P.paperShade); R(229, 119, 3, 4, P.skinB1);
    R(228, 126, 8, 1, P.paperDark); R(228, 128, 6, 2, P.red1); R(231, 114, 2, 3, P.steel);
    // breast pocket with the thermometer
    R(260, 114, 14, 10, P.wood1); R(260, 114, 14, 1, P.wood3);
    R(266, 104, 2, 12, P.steel); El(267, 103, 2, 2, P.fog); R(267, 103, 1, 1, P.night0);
    // face: square jaw, moustache, nobody's uncle
    face(P.skinB1, P.skinB2, P.skinB0, 66);
    R(232, 74, 34, 10, P.skinB1); R(232, 74, 17, 10, P.skinB2); D(254, 74, 12, 10, P.skinB0, 2);
    R(238, 65, 6, 2, P.night0); R(254, 65, 6, 2, P.night0);
    R(237, 61, 8, 2, P.hair0); R(253, 61, 8, 2, P.hair0);
    poly([[239, 78], [249, 76], [259, 78], [258, 81], [249, 79], [240, 81]], P.hair0);
    R(244, 84, 10, 1, P.skinB0);
    // hair under a paper hairnet
    El(249, 49, 20, 9, P.hair0); R(230, 50, 38, 6, P.hair0);
    D(230, 40, 38, 16, P.paperShade, 1, true);
    R(230, 55, 38, 1, P.paperShade); R(229, 56, 2, 4, P.paperShade); R(267, 56, 2, 4, P.paperShade);
  };

  /* --- A. Reyes: burgundy suit, brick phone, pager, folder --- */
  A.aide = function () {
    var buzz = (K.S.t % 50) < 8 ? ((K.S.t & 2) ? 1 : -1) : 0;
    // lower half: black trousers, burgundy jacket, pager on the waistband
    K.legs(P.night1, P.night0, 198);
    K.torso(P.red1, P.red0, 200);
    R(249, 164, 1, 36, P.night0); R(246, 176, 2, 2, P.paperShade); R(246, 188, 2, 2, P.paperShade);
    R(212, 196, 74, 2, P.night0);
    var pb = (K.S.t % 60) > 46 ? ((K.S.t & 2) ? 1 : -1) : 0;
    R(262 + pb, 192, 12, 9, P.night0); R(263 + pb, 193, 9, 3, P.crt1); R(271 + pb, 198, 2, 1, P.red1);
    K.armL(P.red1, P.paper, P.skinA0, P.skinA1);
    K.armR(P.red0, P.paper, P.skinA0, P.skinA1);
    // the brick phone, upright in her right fist, antenna up
    R(286 + buzz, 180, 12, 34, P.night0); R(287 + buzz, 181, 10, 32, P.night1);
    R(295 + buzz, 168, 2, 13, P.night0); El(296 + buzz, 167, 1, 1, P.night3);
    R(288 + buzz, 183, 8, 6, P.crt1); R(289 + buzz, 185, 4, 1, P.crt0);
    for (var k = 0; k < 4; k++) for (var j = 0; j < 3; j++) R(288 + buzz + j * 3, 192 + k * 4, 2, 2, P.night3);
    El(294 + buzz, 207, 6, 5, P.skinA0); El(293 + buzz, 206, 4, 3, P.skinA1);
    // manila folder held against her leg
    poly([[190, 186], [212, 184], [216, 230], [194, 232]], P.card1);
    R(191, 184, 20, 2, P.card0); R(195, 194, 12, 2, P.red0); R(195, 200, 14, 1, P.card0); R(214, 186, 1, 44, P.card0);
    El(205, 199, 5, 5, P.skinA0); El(204, 198, 3, 3, P.skinA1);

    // upper half: shoulder-padded burgundy jacket, white shell, folder under her left arm
    poly([[184, 170], [192, 106], [224, 98], [274, 98], [306, 106], [314, 170]], P.red0);
    poly([[190, 170], [196, 108], [226, 100], [249, 100], [249, 170]], P.red1);
    R(186, 102, 26, 8, P.red1); R(286, 102, 26, 8, P.red0);
    poly([[238, 100], [260, 100], [256, 132], [242, 132]], P.paper);
    R(242, 102, 14, 2, P.paperShade);
    // Senate ID on the lapel
    R(264, 116, 12, 12, P.paper); R(265, 117, 4, 6, P.paperShade); R(266, 118, 2, 3, P.skinA0);
    R(270, 118, 5, 1, P.night2); R(270, 121, 5, 1, P.paperDark); R(264, 125, 12, 2, P.night2);
    // folder
    // face, dark hair pulled back tight, small gold earrings
    face(P.skinA0, P.skinA1, P.skinB0, 66);
    El(249, 48, 20, 9, P.hair0); R(230, 48, 38, 10, P.hair0);
    R(231, 58, 3, 12, P.hair0); R(264, 58, 3, 12, P.hair0);
    poly([[238, 44], [252, 42], [246, 50], [236, 52]], P.hair1);
    R(229, 74, 2, 3, P.lamp4); R(268, 74, 2, 3, P.lamp3);
    R(238, 65, 6, 3, P.night0); R(254, 65, 6, 3, P.night0); R(239, 65, 2, 1, P.paper); R(255, 65, 2, 1, P.paper);
    R(237, 61, 8, 1, P.hair0); R(253, 60, 8, 1, P.hair0);
    // lips pressed thin: no time
    R(243, 80, 12, 2, P.red0);
  };

  /* --- "Ray": a courier uniform with no creases, a parcel, dry shoes --- */
  A.robot = function () {
    // lower half: trousers to the cuff, shined dry shoes, a parcel held at the waist
    K.legs(P.steel, P.night3, 196);
    R(214, 232, 34, 3, P.night3); R(251, 232, 33, 3, P.night2);
    R(214, 235, 34, 11, P.night0); R(251, 235, 33, 11, P.night0);
    R(218, 237, 12, 1, P.fog); R(256, 237, 10, 1, P.night3);
    K.torso(P.steel, P.night3, 200);
    R(249, 164, 1, 36, P.night2);
    R(206, 168, 4, 30, P.paperShade);
    K.armL(P.steel, P.paperShade, P.skinA1, P.skinA2);
    K.armR(P.night3, P.paperShade, P.skinA1, P.skinA2);
    // the parcel
    R(208, 194, 82, 26, P.card1); R(208, 219, 82, 1, P.card0); R(249, 194, 41, 26, P.card0);
    R(208, 205, 82, 1, P.wood2); R(246, 194, 2, 26, P.wood2);
    R(216, 198, 20, 10, P.paper); R(218, 200, 14, 1, P.night0); R(218, 203, 10, 1, P.paperDark);
    // signature slip pinned under his right thumb
    R(282, 198, 14, 14, P.paper); R(284, 201, 9, 1, P.paperDark); R(284, 205, 7, 1, P.paperDark); R(284, 208, 10, 1, P.night0);
    El(204, 206, 5, 6, P.skinA1); El(203, 205, 3, 4, P.skinA2);
    El(296, 206, 5, 6, P.skinA1); El(295, 205, 3, 4, P.skinA2);

    // upper half: uniform jacket, every seam ruler-straight, a name patch
    poly([[188, 170], [200, 110], [226, 98], [272, 98], [298, 110], [310, 170]], P.night3);
    poly([[194, 170], [204, 112], [228, 100], [249, 100], [249, 170]], P.steel);
    R(200, 112, 98, 3, P.paperShade);
    poly([[238, 98], [260, 98], [256, 110], [242, 110]], P.night2);
    R(249, 110, 1, 60, P.night2);
    [124, 140, 156].forEach(function (y) { R(252, y, 2, 2, P.paperShade); });
    R(226, 122, 16, 6, P.paper); R(228, 124, 10, 1, P.night2);
    R(262, 122, 12, 8, P.night2); R(262, 122, 12, 1, P.steel);
    // face: pleasant, symmetrical, wide still pupils
    face(P.skinA1, P.skinA2, P.skinA0, 66);
    R(237, 63, 8, 5, P.paper); R(253, 63, 8, 5, P.paper);
    R(239, 63, 5, 5, P.night0); R(255, 63, 5, 5, P.night0);
    R(240, 64, 1, 1, P.paper); R(256, 64, 1, 1, P.paper);
    R(237, 60, 8, 1, P.brown1); R(253, 60, 8, 1, P.brown1);
    R(242, 80, 14, 2, P.skinA0); R(243, 82, 12, 1, P.paper);
    // courier cap, brim dead level
    El(249, 49, 19, 9, P.steel); R(230, 49, 38, 6, P.steel); R(230, 49, 38, 2, P.paperShade);
    D(256, 40, 12, 14, P.night3, 2);
    R(226, 55, 46, 3, P.night2); R(226, 55, 46, 1, P.night3);
    R(244, 43, 10, 4, P.paperShade);
  };

  /* --- Brett Sandoval: fleece vest, oxford shirt, khakis, organizer --- */
  A.dotcom = function () {
    // lower half: khakis, braided belt, pager, organizer in the right hand
    K.legs(P.card1, P.card0, 196);
    R(232, 210, 1, 44, P.card0);
    K.torso(P.fog, P.steel, 194);
    R(210, 192, 78, 4, P.brown1); for (var b = 212; b < 286; b += 3) R(b, 193, 1, 2, P.brown2);
    R(246, 192, 6, 4, P.steel);
    R(260, 189, 12, 9, P.night0); R(262, 191, 8, 3, P.crt1);
    // vest hem over the shirt
    poly([[206, 164], [240, 164], [240, 186], [212, 188]], P.night3);
    poly([[258, 164], [292, 164], [286, 188], [258, 186]], P.night2);
    D(206, 164, 34, 24, P.steel, 1);
    R(240, 164, 1, 22, P.night3); R(257, 164, 1, 22, P.night1);
    K.armL(P.fog, P.paper, P.skinA1, P.skinA2);
    K.armR(P.steel, P.paper, P.skinA1, P.skinA2);
    // business card held out in the left hand
    R(196, 206, 14, 8, P.paper); R(198, 208, 6, 1, P.red1); R(198, 211, 9, 1, P.paperDark);
    El(205, 205, 3, 2, P.skinA1);
    // pocket organizer and stylus in the right
    R(285, 192, 15, 22, P.plastic1); R(287, 194, 11, 12, P.plastic2); R(288, 196, 8, 1, P.night1); R(288, 199, 6, 1, P.night1);
    R(288, 202, 7, 1, P.night1); R(288, 208, 3, 2, P.plastic0); R(293, 208, 3, 2, P.plastic0);
    R(300, 188, 1, 12, P.steel);
    El(294, 210, 5, 4, P.skinA1);

    // upper half: blue oxford shirt, grey fleece vest, open collar
    poly([[192, 170], [202, 110], [226, 100], [272, 100], [296, 110], [306, 170]], P.steel);
    poly([[196, 170], [206, 112], [228, 102], [249, 102], [249, 170]], P.fog);
    poly([[208, 116], [234, 104], [240, 170], [212, 170]], P.night3);
    poly([[258, 104], [290, 116], [286, 170], [258, 170]], P.night2);
    D(208, 116, 32, 54, P.steel, 1);
    R(240, 106, 1, 64, P.night3); R(257, 106, 1, 64, P.night1);
    poly([[236, 100], [262, 100], [256, 112], [249, 106], [242, 112]], P.fog);
    R(242, 100, 14, 2, P.paper);
    // trade-show logo on the vest
    R(263, 118, 10, 4, P.night2); R(264, 119, 8, 2, P.lamp3);
    // face: young, eager, rectangular glasses, gelled spikes
    face(P.skinA1, P.skinA2, P.skinA0, 68);
    R(235, 64, 11, 7, P.night1); R(252, 64, 11, 7, P.night1); R(246, 66, 6, 1, P.night1);
    R(236, 65, 9, 5, P.skinA2); R(253, 65, 9, 5, P.skinA1);
    R(239, 66, 3, 3, P.night0); R(256, 66, 3, 3, P.night0);
    R(241, 80, 16, 4, P.night0); R(242, 80, 14, 2, P.paper);
    R(247, 88, 4, 2, P.hair1);
    El(249, 50, 19, 8, P.hair1); R(231, 50, 36, 8, P.hair1);
    [[232, 42], [238, 38], [244, 36], [250, 36], [256, 38], [262, 42]].forEach(function (s, i) {
      poly([[s[0] - 3, s[1] + 8], [s[0] + 1, s[1] - 3], [s[0] + 4, s[1] + 8]], i < 3 ? P.hair1 : P.hair0);
      R(s[0], s[1] - 1, 2, 2, P.lamp4);
    });
  };

  /* --- Irene Kane: oatmeal coat, rain bonnet, cake box, handbag --- */
  A.mother = function () {
    // lower half: a long oatmeal coat to below the knee, stockinged shins
    R(224, 236, 18, 18, P.skinA0); R(256, 236, 18, 18, P.skinB1); D(224, 236, 50, 18, P.skinB0, 1);
    poly([[204, 164], [249, 164], [249, 236], [210, 236]], P.plastic2);
    poly([[249, 164], [294, 164], [288, 236], [249, 236]], P.plastic1);
    R(249, 164, 1, 72, P.plastic0);
    [176, 196, 216].forEach(function (y) { R(252, y, 3, 3, P.brown1); });
    R(210, 234, 78, 2, P.plastic0);
    // coat pocket with the bus ticket stub
    R(268, 204, 18, 1, P.plastic0); R(272, 200, 9, 5, P.paper); R(273, 201, 6, 1, P.red1);
    // handbag hanging from her forearm (her hands are on the cake)
    R(200, 166, 1, 34, P.brown0); R(212, 166, 1, 34, P.brown0);
    poly([[192, 200], [216, 200], [218, 222], [190, 222]], P.brown1);
    R(192, 200, 24, 3, P.brown2); R(202, 203, 4, 3, P.lamp3);
    R(196, 202, 10, 2, P.paper);

    // upper half: coat shoulders, the cake box held out over the counter
    poly([[194, 170], [204, 116], [228, 106], [270, 106], [294, 116], [304, 170]], P.plastic1);
    poly([[198, 170], [208, 118], [230, 108], [249, 108], [249, 170]], P.plastic2);
    poly([[236, 106], [262, 106], [256, 120], [249, 114], [242, 120]], P.plastic0);
    R(240, 108, 18, 4, P.paperShade);
    // glasses chain, a brooch
    R(232, 96, 1, 14, P.lamp3); R(266, 96, 1, 14, P.lamp3);
    El(226, 122, 2, 2, P.lamp3);
    // face: older, softer, a little lost
    face(P.skinA1, P.skinA2, P.skinA0, 76);
    R(236, 70, 26, 1, P.skinA0);
    R(236, 73, 9, 6, P.night1); R(253, 73, 9, 6, P.night1); R(245, 75, 8, 1, P.night1);
    R(237, 74, 7, 4, P.paper); R(254, 74, 7, 4, P.paperShade);
    R(239, 75, 3, 2, P.night0); R(256, 75, 3, 2, P.night0);
    R(234, 80, 3, 1, P.skinA0); R(262, 80, 3, 1, P.skinA0);
    R(243, 88, 12, 2, P.red0); R(242, 87, 2, 1, P.skinA0); R(254, 87, 2, 1, P.skinA0);
    // grey set curls under a clear plastic rain bonnet
    El(249, 58, 21, 10, P.fog);
    [[232, 62], [238, 54], [246, 51], [254, 51], [262, 54], [267, 62], [230, 70], [268, 70]].forEach(function (c) {
      El(c[0], c[1], 4, 4, P.fog); R(c[0] - 1, c[1] - 2, 2, 2, P.paper);
    });
    D(226, 46, 48, 22, P.paper, 1, true);
    R(228, 66, 2, 20, P.paperShade); R(268, 66, 2, 20, P.paperShade); R(244, 98, 10, 1, P.paperShade);
    // the cake box
    poly([[204, 128], [294, 128], [298, 134], [200, 134]], P.paperShade);
    R(200, 134, 98, 16, P.paper); R(200, 149, 98, 1, P.paperShade);
    R(232, 136, 34, 10, P.paperShade); R(233, 137, 32, 8, P.lamp4); R(236, 140, 26, 1, P.shirt); R(240, 142, 18, 1, P.shirt);
    R(248, 128, 2, 22, P.red1); R(200, 141, 98, 1, P.red1);
    El(201, 142, 6, 5, P.skinA1); El(297, 142, 6, 5, P.skinA1);
  };

  /* ---------------- close-ups (32x24) ---------------- */
  var F = K.fill;
  Z.investorWatch = function (z) {
    F(z, 0, 0, 32, 24, P.skinA1); F(z, 0, 0, 32, 5, P.card0);
    F(z, 0, 8, 32, 8, P.lamp3);
    K.on(z, function () { El(16, 12, 9, 9, P.lamp3); El(16, 12, 7, 7, P.paper); El(16, 12, 1, 1, P.night0); });
    // 3:36: minute hand just past six, hour hand past three
    F(z, 15, 12, 1, 6, P.night0); F(z, 16, 13, 4, 1, P.night0);
    F(z, 9, 12, 1, 1, P.paperDark); F(z, 22, 12, 1, 1, P.paperDark); F(z, 16, 18, 1, 1, P.paperDark); F(z, 16, 5, 1, 1, P.lamp3);
    F(z, 21, 7, 2, 2, P.lamp4);
  };
  Z.investorCard = function (z) {
    F(z, 0, 0, 32, 24, P.skinA1);
    F(z, 2, 4, 28, 16, P.paper); F(z, 2, 19, 28, 1, P.paperShade);
    F(z, 5, 7, 16, 2, P.night1); F(z, 5, 11, 12, 1, P.paperDark); F(z, 5, 14, 20, 1, P.paperDark); F(z, 5, 16, 14, 1, P.paperDark);
    F(z, 24, 6, 3, 3, P.lamp3);
  };
  Z.investorMatches = function (z) {
    F(z, 0, 0, 32, 24, P.card1); F(z, 0, 14, 32, 10, P.card0); F(z, 0, 14, 32, 1, P.brown1);
    F(z, 9, 2, 14, 16, P.red1); F(z, 9, 2, 14, 1, P.red0);
    F(z, 10, 6, 12, 1, P.paper); F(z, 11, 9, 10, 2, P.lamp4); F(z, 12, 13, 8, 1, P.paper);
    F(z, 9, 17, 14, 1, P.paperShade);
  };
  Z.investorCollar = function (z) {
    F(z, 0, 0, 32, 24, P.skinA1); F(z, 0, 0, 32, 4, P.skinA2);
    K.on(z, function () { poly([[0, 10], [16, 14], [32, 10], [32, 24], [0, 24]], P.paper); poly([[12, 16], [16, 22], [20, 16]], P.red1); });
    F(z, 0, 18, 8, 6, P.night2); F(z, 24, 18, 8, 6, P.night2);
    F(z, 22, 11, 4, 2, P.red1); F(z, 23, 13, 2, 1, P.red0);
  };

  Z.foodinspectorBoard = function (z) {
    // a slab, not a board: no curl, text lines caught mid-scroll, a faint glow at the edge
    F(z, 0, 0, 32, 24, P.wood2);
    F(z, 4, 1, 24, 23, P.paper); F(z, 27, 1, 1, 23, P.fut0);
    F(z, 12, 0, 8, 3, P.steel);
    for (var i = 0; i < 7; i++) F(z, 6, 4 + i * 3, 14 - (i % 3) * 3, 1, P.paperDark);
    F(z, 6, 3, 18, 1, P.paperShade); F(z, 6, 22, 14, 1, P.paperShade);
    F(z, 23, 9, 2, 5, P.fut1);
  };
  Z.foodinspectorBadge = function (z) {
    F(z, 0, 0, 32, 24, P.wood3);
    F(z, 4, 2, 24, 20, P.paper);
    F(z, 6, 4, 8, 10, P.paperShade); F(z, 8, 6, 4, 5, P.skinB1); F(z, 8, 5, 4, 1, P.hair0);
    F(z, 16, 5, 10, 1, P.night1); F(z, 16, 8, 8, 1, P.paperDark); F(z, 16, 11, 9, 1, P.paperDark);
    F(z, 6, 16, 20, 3, P.red1);
    K.on(z, function () { El(22, 15, 2, 2, P.lamp3); });
  };
  Z.foodinspectorNet = function (z) {
    F(z, 0, 0, 32, 24, P.hair0);
    for (var y = 0; y < 18; y += 3) for (var x = (y % 2) * 2; x < 32; x += 4) F(z, x, y, 2, 1, P.paperShade);
    F(z, 0, 17, 32, 2, P.paperShade); F(z, 0, 19, 32, 5, P.skinB1);
    F(z, 5, 20, 1, 2, P.fog); F(z, 14, 21, 1, 2, P.fog); F(z, 25, 20, 1, 2, P.fog);
  };
  Z.foodinspectorProbe = function (z) {
    F(z, 0, 0, 32, 24, P.wood3); F(z, 0, 12, 32, 12, P.wood2); F(z, 0, 12, 32, 1, P.wood1);
    K.on(z, function () { El(16, 7, 6, 6, P.steel); El(16, 7, 5, 5, P.paper); });
    F(z, 16, 3, 1, 4, P.night0); F(z, 16, 7, 3, 1, P.red1);
    F(z, 15, 13, 2, 11, P.steel); F(z, 15, 13, 1, 11, P.fog);
  };

  Z.aidePhone = function (z) {
    F(z, 0, 0, 32, 24, P.skinA0);
    F(z, 9, 0, 14, 24, P.night0); F(z, 10, 1, 12, 23, P.night1);
    F(z, 19, 0, 2, 2, P.night3);
    F(z, 11, 3, 10, 6, P.crt1); F(z, 12, 4, 8, 1, P.crt0); F(z, 12, 6, 3, 2, P.crt0);
    for (var r = 0; r < 4; r++) for (var c = 0; c < 3; c++) F(z, 11 + c * 4, 11 + r * 3, 2, 2, P.night3);
    F(z, 0, 14, 9, 10, P.skinA1); F(z, 23, 14, 9, 10, P.skinA0);
  };
  Z.aidePager = function (z) {
    F(z, 0, 0, 32, 24, P.night1);
    F(z, 2, 4, 28, 16, P.night0);
    F(z, 3, 6, 26, 9, P.crt1);
    K.on(z, function () { K.digits('202555', 4, 7, P.crt0); K.digits('911', 17, 7, P.night0); });
    F(z, 4, 16, 4, 2, P.night3); F(z, 10, 16, 4, 2, P.night3); F(z, 25, 16, 2, 2, P.red1);
    F(z, 2, 0, 28, 3, P.red0);
  };
  Z.aideBadge = function (z) {
    F(z, 0, 0, 32, 24, P.red0);
    F(z, 3, 2, 26, 20, P.paper); F(z, 26, 2, 3, 3, P.paperShade);
    F(z, 5, 4, 8, 10, P.paperShade); F(z, 7, 6, 4, 6, P.skinA0); F(z, 6, 4, 6, 3, P.hair0);
    F(z, 15, 5, 12, 2, P.night2); F(z, 15, 9, 10, 1, P.paperDark); F(z, 15, 12, 8, 1, P.paperDark);
    F(z, 3, 17, 26, 3, P.night2); F(z, 14, 18, 4, 1, P.paper);
  };
  Z.aideFolder = function (z) {
    F(z, 0, 0, 32, 24, P.card0);
    F(z, 2, 2, 28, 20, P.card1);
    F(z, 4, 4, 18, 3, P.red0);
    F(z, 6, 9, 22, 13, P.paper);
    F(z, 8, 11, 12, 1, P.night2); F(z, 8, 14, 16, 1, P.paperDark); F(z, 8, 16, 14, 1, P.paperDark);
    F(z, 16, 20, 10, 1, P.night0);
  };

  Z.robotEyes = function (z) {
    // lamp light full in the face, and the pupil stays wide open
    F(z, 0, 0, 32, 24, P.skinA2);
    F(z, 0, 0, 32, 4, P.lamp4); F(z, 0, 4, 32, 2, P.skinA1);
    K.on(z, function () { El(16, 13, 12, 6, P.paper); El(16, 13, 6, 6, P.brown1); El(16, 13, 5, 5, P.night0); });
    F(z, 13, 10, 2, 2, P.lamp4);
    F(z, 3, 6, 26, 1, P.brown1); F(z, 4, 20, 24, 1, P.skinA1);
  };
  Z.robotUniform = function (z) {
    F(z, 0, 0, 32, 24, P.steel);
    F(z, 16, 0, 16, 24, P.night3);
    F(z, 0, 4, 32, 3, P.paperShade);
    F(z, 4, 12, 10, 4, P.paper); F(z, 5, 13, 7, 1, P.night2);
    F(z, 20, 12, 2, 2, P.paperShade); F(z, 20, 20, 2, 2, P.paperShade);
  };
  Z.robotSlip = function (z) {
    F(z, 0, 0, 32, 24, P.card0);
    F(z, 2, 2, 28, 20, P.paper);
    F(z, 4, 4, 14, 1, P.paperDark);
    K.on(z, function () { K.digits('04:16:07', 4, 8, P.night0); El(28, 20, 4, 3, P.skinA1); });
    F(z, 4, 16, 20, 1, P.paperShade); F(z, 4, 19, 12, 1, P.paperDark);
  };
  Z.robotParcel = function (z) {
    F(z, 0, 0, 32, 24, P.card1); F(z, 16, 0, 16, 24, P.card0);
    F(z, 0, 11, 32, 2, P.wood2); F(z, 14, 0, 2, 24, P.wood2);
    F(z, 1, 2, 12, 8, P.paper); F(z, 2, 4, 6, 1, P.night0); F(z, 2, 7, 5, 1, P.paperDark);
    K.on(z, function () { K.digits('4', 9, 4, P.night0); });
  };
  Z.robotShoes = function (z) {
    F(z, 0, 0, 32, 24, P.night0);
    F(z, 0, 0, 14, 8, P.steel); F(z, 17, 0, 14, 8, P.night3);
    F(z, 0, 7, 14, 2, P.night3); F(z, 17, 7, 14, 2, P.night2);
    F(z, 0, 9, 15, 10, P.night1); F(z, 17, 9, 15, 10, P.night1);
    F(z, 2, 10, 8, 1, P.fog); F(z, 19, 10, 6, 1, P.steel);
    F(z, 0, 19, 32, 5, P.night2);
  };

  Z.dotcomPalm = function (z) {
    F(z, 0, 0, 32, 24, P.skinA1);
    F(z, 7, 0, 18, 24, P.plastic1);
    F(z, 9, 2, 14, 13, P.plastic2);
    K.on(z, function () { K.digits('4:30', 10, 4, P.night1); });
    F(z, 10, 10, 11, 1, P.night1); F(z, 10, 12, 8, 1, P.paperShade);
    F(z, 9, 17, 4, 3, P.plastic0); F(z, 19, 17, 4, 3, P.plastic0);
    F(z, 27, 0, 1, 18, P.steel);
  };
  Z.dotcomPager = function (z) {
    F(z, 0, 0, 32, 24, P.card1);
    F(z, 2, 3, 28, 16, P.night0);
    F(z, 4, 5, 24, 9, P.crt1);
    K.on(z, function () { K.digits('430', 5, 7, P.crt0); });
    F(z, 18, 7, 8, 1, P.crt0); F(z, 18, 10, 6, 1, P.crt0);
    F(z, 5, 15, 4, 2, P.night3); F(z, 25, 15, 2, 2, P.red1);
    F(z, 0, 20, 32, 4, P.brown1);
  };
  Z.dotcomCard = function (z) {
    F(z, 0, 0, 32, 24, P.skinA1);
    F(z, 2, 4, 28, 16, P.paper);
    F(z, 4, 6, 10, 3, P.red1); F(z, 15, 7, 12, 1, P.night1);
    F(z, 4, 12, 18, 1, P.paperDark); F(z, 4, 14, 14, 1, P.paperDark); F(z, 4, 17, 22, 1, P.shirt);
  };
  Z.dotcomFleece = function (z) {
    F(z, 0, 0, 32, 24, P.steel);
    for (var y = 0; y < 24; y += 2) for (var x = (y % 4); x < 32; x += 4) F(z, x, y, 1, 1, P.fog);
    F(z, 6, 8, 20, 8, P.night2); F(z, 8, 10, 16, 4, P.lamp3); F(z, 10, 11, 12, 2, P.lamp4);
  };

  Z.motherCake = function (z) {
    F(z, 0, 0, 32, 24, P.paper);
    F(z, 4, 4, 24, 14, P.paperShade);
    F(z, 5, 5, 22, 12, P.lamp4); F(z, 5, 13, 22, 4, P.paper);
    F(z, 7, 7, 18, 1, P.shirt); F(z, 9, 10, 14, 1, P.shirt);
    F(z, 8, 14, 2, 2, P.red1); F(z, 15, 14, 2, 2, P.red1); F(z, 22, 14, 2, 2, P.red1);
    F(z, 15, 0, 2, 4, P.red1); F(z, 0, 20, 32, 1, P.red1);
  };
  Z.motherPhoto = function (z) {
    // the real Kane: short, bald, grey moustache, glasses, squinting at a lake
    F(z, 0, 0, 32, 24, P.brown1);
    F(z, 3, 1, 26, 22, P.paper);
    F(z, 5, 3, 22, 18, P.steel); F(z, 5, 3, 22, 7, P.fog); F(z, 5, 15, 22, 6, P.night3);
    K.on(z, function () { El(16, 10, 4, 4, P.skinA2); El(17, 11, 3, 3, P.skinA1); });
    F(z, 13, 10, 7, 1, P.night0); F(z, 14, 13, 5, 1, P.fog);
    F(z, 11, 15, 10, 6, P.brown2); F(z, 15, 15, 2, 4, P.shirt);
  };
  Z.motherBonnet = function (z) {
    F(z, 0, 0, 32, 24, P.fog);
    K.on(z, function () {
      for (var i = 0; i < 7; i++) { El(2 + i * 5, 10 + (i % 2) * 3, 3, 3, P.paper); El(2 + i * 5, 11 + (i % 2) * 3, 2, 2, P.fog); }
      D(0, 0, 32, 20, P.paper, 1);
    });
    F(z, 0, 3, 32, 1, P.paper); F(z, 0, 20, 32, 4, P.skinA1); F(z, 6, 19, 20, 1, P.paperShade);
  };
  Z.motherTicket = function (z) {
    F(z, 0, 0, 32, 24, P.plastic1);
    F(z, 3, 4, 26, 14, P.paper); for (var x = 3; x < 29; x += 2) F(z, x, 17, 1, 1, P.plastic1);
    F(z, 5, 6, 12, 2, P.red1); F(z, 5, 10, 18, 1, P.paperDark);
    K.on(z, function () { K.digits('31.50', 9, 12, P.night0); });
  };
})();
