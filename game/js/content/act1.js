/*
 * Act One visitors (night.js puts them in order).
 *   sister      Ellen Dobbs, the real Kane's sister   legit     11:20 PM  (let through)
 *   courier     smartphone courier, 2020s             intruder  11:34 PM  (shoot or turn away)
 *   janitor     Walt, the night janitor               legit     11:48 PM  (let through)
 *   influencer  "content creator", 2020s              intruder  12:02 AM  (shoot or turn away)
 *   salesman    Harold Wallis, colour TV, 1950s       intruder  tier 2, only if the 1920s
 *               gentleman was turned away (gent.comesBackAs = 'salesman')
 *
 * Flags: metSister (sister's greeting), realKaneDescribed (sister, loop 2+),
 * metJanitor, metCourier, metInfluencer, metSalesman.
 */
(function () {
  var E = window.EMIT, C = E.content.characters, V = E.content.visitors, K = E.art.kit, P = K.P;
  var Z = E.art.zooms, A = E.art.visitors;

  /* ---------- tiny 3x5 letters for close-ups ---------- */
  var LET = {
    A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110',
    E: '111100110100111', F: '111100110100100', G: '011100101101011', H: '101101111101101',
    I: '111010010010111', K: '101101110101101', L: '100100100100111', M: '101111111101101',
    N: '110101101101101', O: '010101101101010', P: '110101110100100', R: '110101110101101',
    S: '011100010001110', T: '111010010010010', U: '101101101101111', V: '101101101101010',
    W: '101101111111101', Y: '101101010010010', X: '101101010101101', '$': '011110010011110'
  };
  function word(z, str, x, y, col) {
    var cx = x;
    for (var k = 0; k < str.length; k++) {
      var ch = str[k];
      if (ch === ' ') { cx += 2; continue; }
      if (/[0-9.:]/.test(ch)) { E.art.digits(z, ch, cx, y, col); cx += (ch === '.' || ch === ':') ? 2 : 4; continue; }
      var gl = LET[ch];
      z.fillStyle = col;
      if (gl) for (var i = 0; i < 15; i++) if (gl[i] === '1') z.fillRect(cx + i % 3, y + Math.floor(i / 3), 1, 1);
      cx += 4;
    }
  }
  function fill(z, x, y, w, h, c) { K.fill(z, x, y, w, h, c); }
  function on(z, fn) { K.on(z, fn); }

  function cleanup(line) {
    return [{ pause: 500 }, { narrate: line }, { backdrop: 'clean' }];
  }

  /* ======================================================================
   * 1. Ellen Dobbs, the real Dr. Kane's sister (legit, tier 1)
   * ====================================================================== */
  C.sister = { name: 'Ellen Dobbs', notebookName: 'Ellen Dobbs, Kane\'s sister', portrait: 'sister' };

  V.sister = {
    id: 'sister',
    truth: 'legit',
    prompt: 'She smells of rain and meatloaf, and she\'s already talking.',
    arrive: [
      { crt: ['CAM 02 LOT', '> VEHICLE: WAGON', '> REC'] },
      { narrate: 'A wood-panelled station wagon nosed in by the dumpsters. A woman ran from it with her head down and a paper bag held to her chest.' },
      { sfx: 'door' },
      { enter: 'sister' }
    ],
    greeting: [
      { who: 'sister', say: 'Lou! Oh, thank God it\'s you on tonight. Look at me, I\'m drowned.' },
      { who: 'sister', say: 'I brought Dusty his supper. He forgets to eat when he\'s on to something.' },
      { narrate: 'She knew my name. She\'d been by twice before, both times with a casserole for the man upstairs.' },
      { note: ['sister', 'Kane\'s sister. Knows me by name. Calls her brother "Dusty".'] },
      { learn: 'metSister' }
    ],
    inspect: [
      { title: 'Lunch bag', zoom: 'sisterBag', x: 188, y: 200, w: 28, h: 34,
        text: 'A brown paper bag, folded over twice. ALDOUS in black marker, underlined, the way you\'d label a kid\'s lunch.',
        note: 'Brown paper lunch bag, ALDOUS written on it in marker.' },
      { title: 'Raincoat', zoom: 'sisterCoat', x: 204, y: 104, w: 30, h: 40,
        text: 'A belted tan raincoat, soaked dark across the shoulders. Rain\'s still beading on it. She\'s been out in it, all right.',
        note: 'Her raincoat is soaked through at the shoulders. Real rain.' },
      { title: 'Headscarf', zoom: 'sisterScarf', x: 228, y: 36, w: 42, h: 20,
        text: 'A red paisley scarf knotted under the chin. Old fashioned, carefully pressed, wet at the edges.',
        note: 'Red paisley headscarf, the old-fashioned kind.' },
      { title: 'Car keys', zoom: 'sisterKeys', x: 284, y: 208, w: 22, h: 24,
        text: 'Car keys on a leather fob, stamped KANE HARDWARE, MARLOW. The stamp\'s nearly worn off.',
        note: 'Her key fob: Kane Hardware, Marlow. Family store?' }
    ],
    opening: {
      name: [
        { who: 'sister', say: 'Ellen Dobbs. Dobbs since I married, Kane before that. Aldous is my little brother.' },
        { who: 'sister', say: 'Everyone back home calls him Dusty. Don\'t tell him I told you, he hates it.' },
        { note: ['sister', 'Ellen Dobbs, born Kane. Dr. Kane\'s older sister. "Dusty" to the family.'] }
      ],
      want: [
        { who: 'sister', say: 'Just let me run his supper up. Meatloaf sandwich. Two minutes, I want to see him eat it.' },
        { who: 'sister', say: 'He\'s been in that lab since Sunday, I\'d bet money on it.' },
        { who: 'sister', say: 'Science Corp ought to get a kitchen. Then I could heat his supper up instead of bringing it cold.' },
        { note: ['sister', 'Wants to take Kane his supper herself and watch him eat it.'] }
      ],
      how: [
        { who: 'sister', say: 'Drove. The wagon\'s out by the dumpsters. Your lot lights are out again, Lou.' },
        { narrate: 'They were. Maintenance had a ticket in since August.' },
        { note: ['sister', 'Drove herself. Knew the lot lights are out. They are.'] }
      ]
    },
    questions: [
      { id: 'bag', ask: 'What\'s in the bag?', requires: 'saw:sisterBag', steps: [
        { who: 'sister', say: 'Meatloaf on rye, an apple he won\'t eat, and two of Mom\'s oatmeal cookies.' },
        { who: 'sister', say: 'I write his name on it so his lab people don\'t steal it. They\'re animals.' },
        { note: ['sister', 'Meatloaf sandwich, apple, Mom\'s cookies. Labels his lunch so the lab crew won\'t take it.'] }
      ] },
      { id: 'coat', ask: 'You\'re soaked through.', requires: 'saw:sisterCoat', steps: [
        { who: 'sister', say: 'I left the umbrella in the wagon. Then I thought, it\'s twenty feet, Ellen. It was not twenty feet.' },
        { narrate: 'At least somebody tonight was getting wet the normal way.' },
        { note: ['sister', 'Ran from the car without an umbrella. Soaked, like a person.'] }
      ] },
      { id: 'scarf', ask: 'Nice scarf.', requires: 'saw:sisterScarf', steps: [
        { who: 'sister', say: 'It\'s Mom\'s. Irene Kane never left the house without one, and now I can\'t either.' },
        { note: ['sister', 'The scarf belongs to their mother, Irene Kane.'] }
      ] },
      { id: 'keys', ask: 'Kane Hardware?', requires: 'saw:sisterKeys', steps: [
        { who: 'sister', say: 'Dad\'s store, back in Marlow. Marlow, Ohio. You\'ve never heard of it. Nobody has.' },
        { who: 'sister', say: 'Dusty used to take the clocks apart behind the counter. Dad would go spare.' },
        { note: ['sister', 'The Kanes are from Marlow, Ohio. Their dad ran a hardware store. Kane took clocks apart as a boy.'] }
      ] },
      { id: 'list', ask: 'You\'re not on my list.', requires: 'saw:desk.list', steps: [
        { who: 'sister', say: 'Well, I wouldn\'t be, hon. I\'m not a meeting. I\'m his sister with a sandwich.' },
        { narrate: 'The list was Kane\'s appointments. Family dropping off supper wasn\'t an appointment.' },
        { note: ['sister', 'Not on the visitor list. She\'s family dropping off food, not a meeting.'] }
      ] },
      { id: 'looks', ask: 'What does your brother look like?', requires: 'metSister', steps: [
        { who: 'sister', say: 'Dusty? You\'ve never seen him? Short. Shorter than me. Bald as an egg since he was thirty.' },
        { who: 'sister', say: 'Grey moustache he thinks makes him look distinguished. Fifty-four in March. Why?' },
        { narrate: 'The man who ran in tonight was a head taller than me, with wild grey hair and no moustache at all.', noSkip: true },
        { note: ['sister', 'Her brother, the real Dr. Kane: short, bald, grey moustache, fifty-four in March. The man who ran in is tall with wild grey hair. That isn\'t her brother.'] },
        { learn: 'realKaneDescribed' }
      ] },
      { id: 'tall', ask: 'He hasn\'t got a head of wild grey hair?', requires: 'now:realKaneDescribed', steps: [
        { who: 'sister', say: 'Lou, he hasn\'t had a head of anything since the Bicentennial. Who have you been talking to?' },
        { narrate: 'I didn\'t answer. Somewhere upstairs, a door closed.' },
        { note: ['sister', 'She laughed at "wild grey hair". Her brother\'s been bald for twenty-odd years.'] }
      ] },
      { id: 'watch', ask: 'Does he wear a digital watch?', requires: 'sawWatch', steps: [
        { who: 'sister', say: 'Dusty? He wears Dad\'s old wind-up Timex. Says digital watches lie to you.' },
        { note: ['sister', 'Her brother wears their dad\'s old wind-up watch. The man upstairs wears a digital one.'] }
      ] },
      { id: 'callLab', ask: 'Let me try his lab phone anyway.', requires: 'run:callOffer:sister', steps: [
        { narrate: 'I dialled Kane\'s lab on four from the desk phone. It rang six times, then the machine picked up.' },
        { narrate: 'A dry recorded voice: Dr. Kane\'s laboratory, not taking calls. Leave a message at the tone.' },
        { who: 'sister', say: 'See? Never. He\'d let that thing ring through the Second Coming.' },
        { note: ['sister', 'Rang Kane\'s lab for her. The answering machine picked up. Nobody answered.'] }
      ] }
    ],
    actions: {
      letThrough: { steps: [
        { narrate: 'I pointed her to the stairs. She squeezed my arm on the way past, like I\'d done something kind.' },
        { who: 'sister', say: 'You\'re a doll, Lou. I\'ll tell him you said to eat the apple.' },
        { exit: 'walk' },
        { note: ['sister', 'Let her up with his supper.'] },
        { set: 'sentSister' }
      ] },
      turnAway: { steps: [
        { narrate: 'I told her the doctor wasn\'t to be disturbed, not even for meatloaf.' },
        { who: 'sister', say: 'Not even for his own sister? What has he got going on up there?' },
        { narrate: 'She set the bag on the counter, thought better of it, and took it with her.' },
        { exit: 'walk' },
        { note: ['sister', 'Turned her away. She took the supper back to the wagon.'] }
      ] },
      shoot: { steps: [
        { sfx: 'gunshot' },
        { exit: 'fall' },
        { backdrop: 'body' },
        { narrate: 'The bag hit the floor and split. A meatloaf sandwich, an apple, two cookies in wax paper. She brought her brother supper.' },
        { note: ['sister', 'I shot Kane\'s sister. She was bringing him supper.'] },
        { reset: 'You shot Dr. Kane\'s sister.' }
      ] }
    },
    returnArrive: [
      { crt: ['CAM 02 LOT', '> VEHICLE: WAGON', '> REC'] },
      { narrate: 'The station wagon came back fast and parked crooked. She didn\'t bother with the umbrella this time either.' },
      { sfx: 'door' }
    ],
    returnGreeting: [
      { who: 'sister', say: 'Lou. Please. It\'s Mom. She fell, they took her to St. Agnes. They think it\'s her heart.' },
      { who: 'sister', say: 'He doesn\'t answer the lab phone, he never does. I have to tell him myself. Please.' },
      { note: ['sister', 'She came back: their mother is in St. Agnes, maybe her heart. She needs to tell her brother in person.'] },
      { set: 'callOffer:sister' }
    ],
    secondTurnAway: { steps: [
      { narrate: 'I told her no again. She stood there and dripped on my floor, and then she went.' },
      { exit: 'walk' },
      { pause: 600 },
      { narrate: 'Somewhere upstairs a man never heard his mother was in the hospital. Whatever that would have changed, it didn\'t. The light came anyway.' },
      { note: ['sister', 'Turned her away twice. Her brother never got the news.'] },
      { reset: 'You turned away Ellen Dobbs twice.' }
    ] }
  };

  /* ======================================================================
   * 2. Smartphone courier (intruder, 2020s, tier 1)
   * ====================================================================== */
  C.courier = { name: 'Courier', notebookName: 'Courier with the glass phone', portrait: 'courier' };

  V.courier = {
    id: 'courier',
    truth: 'intruder',
    prompt: 'He hasn\'t looked up from his hand since he came in.',
    arrive: [
      { crt: ['CAM 01 LOBBY', '> MOTION: 1', '> REC'] },
      { narrate: 'A kid in a black rain shell came in thumbing at something that lit his face from below, like a campfire story.' },
      { sfx: 'door' },
      { enter: 'courier' }
    ],
    greeting: [
      { who: 'courier', say: 'Yo. Overnight package for Dr. Kane? Did you get my text?' },
      { narrate: 'I didn\'t know what a text was. I had a feeling I wasn\'t supposed to.' },
      { note: ['courier', 'Overnight package for Dr. Kane. Asked if I "got his text".'] },
      { learn: 'metCourier' }
    ],
    inspect: [
      { title: 'Phone', zoom: 'courierPhone', x: 196, y: 118, w: 22, h: 30,
        text: 'A slab of black glass, no buttons, no antenna. The whole face of it glows, little coloured squares in rows.',
        note: 'Holding a black glass slab with no buttons. The whole front lights up.' },
      { title: 'Ear', zoom: 'courierEarbud', x: 225, y: 62, w: 12, h: 16,
        text: 'A little white plug in his ear. No wire. Nothing connects it to anything.',
        note: 'White plug in one ear with no wire on it.' },
      { title: 'Package', zoom: 'courierLabel', x: 270, y: 186, w: 38, h: 28,
        text: 'A small box under his arm. The label is a printed square of black and white specks. No address I can read, no tracking slip.',
        note: 'His package label is a square of black and white specks. No slip, no address.' },
      { title: 'Rain shell', zoom: 'courierJacket', x: 212, y: 168, w: 34, h: 28,
        text: 'Black nylon with a reflective stripe. Wet at the hem.',
        note: 'Black nylon rain shell with a reflective stripe. Wet.' }
    ],
    opening: {
      name: [
        { who: 'courier', say: 'Jayden. It\'s on my profile.' },
        { narrate: 'His profile. I let that one sit.' },
        { note: ['courier', 'Says his name is Jayden, "it\'s on my profile". No last name, no company.'] }
      ],
      want: [
        { who: 'courier', say: 'Overnight drop for Dr. Kane. I just need him, or like, anyone, to accept it.' },
        { note: ['courier', 'Says he has an overnight package for Kane. No clipboard, no slip.'] }
      ],
      how: [
        { who: 'courier', say: 'Drove. The map kept spinning, though. Like it couldn\'t find me. Your area\'s kind of a dead zone.' },
        { narrate: 'Maps don\'t spin. They fold, badly.' },
        { note: ['courier', 'Says "the map kept spinning" and couldn\'t find him.'] }
      ]
    },
    questions: [
      { id: 'phone', ask: 'What is that thing you keep poking?', requires: 'saw:courierPhone', steps: [
        { who: 'courier', say: '...My phone? It\'s just a phone, man.' },
        { narrate: 'The phones I know have a cord, or a brick on top of them, or at least a button.' },
        { note: ['courier', 'Calls the glowing glass slab "just a phone".'] }
      ] },
      { id: 'slip', ask: 'Can I see the delivery slip?', requires: 'saw:courierLabel', steps: [
        { who: 'courier', say: 'No slip. Just sign on the screen.' },
        { narrate: 'He held the glass out to me. A box on it said SIGN HERE. I asked what with.' },
        { who: 'courier', say: 'Your finger, bro.' },
        { note: ['courier', 'No delivery slip. Wanted me to sign "on the screen" with my finger.'] }
      ] },
      { id: 'from', ask: 'Who\'s it from?', requires: 'saw:courierLabel', steps: [
        { who: 'courier', say: 'It\'s in the app. Hold on.' },
        { narrate: 'He tapped. He tapped again. The glow went grey.' },
        { who: 'courier', say: 'No Service? How is there no service? Is your Wi-Fi down? Do you guys not have Wi-Fi?' },
        { narrate: 'He held it up over his head and turned in a slow circle, like a man looking for God in the ceiling tiles.' },
        { note: ['courier', 'Couldn\'t say who sent it, "it\'s in the app". The phone said No Service and he panicked.'] }
      ] },
      { id: 'ear', ask: 'What\'s in your ear?', requires: 'saw:courierEarbud', steps: [
        { who: 'courier', say: 'Earbud. I had a call going. It dropped.' },
        { who: 'courier', say: 'Everything dropped when I walked in here, actually. It\'s weird.' },
        { note: ['courier', 'Says the thing in his ear is for calls. Lost everything when he walked in.'] }
      ] },
      { id: 'list', ask: 'You\'re not on my list.', requires: 'saw:desk.list', steps: [
        { who: 'courier', say: 'Deliveries aren\'t on lists, man. It\'s contactless. You don\'t even have to see me.' },
        { narrate: 'I was seeing him fine.' },
        { note: ['courier', 'Not on the list. Called the delivery "contactless".'] }
      ] }
    ],
    actions: {
      letThrough: { steps: [
        { narrate: 'I waved him to the stairs. He took them two at a time, thumbing at the glass.' },
        { exit: 'walk' },
        { pause: 800 },
        { sfx: 'distant' },
        { narrate: 'The package never got signed for. Whatever was in it opened itself on the fourth floor. Then the light came.' },
        { note: ['courier', 'Let him up. The package wasn\'t a package.'] },
        { reset: 'You let a courier with a phone from the future through.' }
      ] },
      turnAway: { steps: [
        { narrate: 'I told him there was nobody to sign. Come back in the morning, with paper.' },
        { who: 'courier', say: 'Paper? Okay, boomer.' },
        { exit: 'walk' },
        { narrate: 'He went out holding the glass over his head, looking for something the sky didn\'t have yet.' },
        { note: ['courier', 'Turned him away. Called me "boomer", whatever that is.'] }
      ] },
      shoot: { steps: [
        { sfx: 'gunshot' },
        { exit: 'fall' },
        { backdrop: 'body' },
        { narrate: 'The glass slab skittered across the floor, still glowing. It said No Service until the light in it went out.' },
        { note: ['courier', 'Shot him. The phone glowed on the floor for a while, then quit.'] }
      ].concat(cleanup('The box he carried was empty, except for a hum. I put it in the closet with him.')) }
    }
  };

  /* ======================================================================
   * 3. Walt, the night janitor (legit, tier 1)
   * ====================================================================== */
  C.janitor = { name: 'Walt', notebookName: 'Walt Mallory, night janitor', portrait: 'janitor' };

  V.janitor = {
    id: 'janitor',
    truth: 'legit',
    prompt: 'He\'s been pushing that bucket around this building longer than I\'ve sat here.',
    arrive: [
      { crt: ['CAM 03 SERVICE', '> DOOR OPEN', '> REC'] },
      { narrate: 'The service door banged at the back of the lobby. A bucket on squeaky wheels came out of the janitor\'s closet, then the janitor.' },
      { enter: 'janitor', from: 'right' }
    ],
    greeting: [
      { who: 'janitor', say: 'Evening, Lou. Who\'s been in my closet?' },
      { who: 'janitor', say: 'Somebody mopped my lobby. Mopped it wrong, but mopped it. That\'s never happened in eleven years.' },
      { narrate: 'Walt always calls me Lou. Six years, never once got it wrong. The people who belong here know my name. The ones who don\'t, don\'t.' },
      { note: ['janitor', 'Walt knows my name, same as always. Regulars know my name. Strangers don\'t.'] },
      { note: ['janitor', 'Noticed somebody used his mop on the lobby floor.'] },
      { learn: 'metJanitor' }
    ],
    inspect: [
      { title: 'Key ring', zoom: 'janitorKeys', x: 212, y: 190, w: 24, h: 22,
        text: 'A ring of keys the size of a saucer. One tag of masking tape reads 4TH, with a line through it.',
        note: 'Huge key ring. The tape tag for the fourth floor is crossed out.' },
      { title: 'Badge', zoom: 'janitorBadge', x: 262, y: 114, w: 18, h: 16,
        text: 'BLDG SVCS, W. MALLORY. This year\'s sticker. A photo of a younger, angrier Walt.',
        note: 'Building Services badge, W. Mallory, current sticker.' },
      { title: 'Mop bucket', zoom: 'janitorBucket', x: 266, y: 212, w: 46, h: 34,
        text: 'The mop head\'s still wet, and the water in the bucket has gone a colour I don\'t want to name.',
        note: 'His mop bucket. The water\'s gone pink. That was me.' },
      { title: 'Hands', zoom: 'janitorHands', x: 194, y: 196, w: 18, h: 18,
        text: 'Knuckles red and cracked. Bleach does that, over enough years.',
        note: 'Hands cracked and red from bleach.' }
    ],
    opening: {
      name: [
        { who: 'janitor', say: 'Lou. It\'s Walt. Same as yesterday. Same as every night for six years.' },
        { who: 'janitor', say: 'You hit your head or something?' },
        { note: ['janitor', 'Walt Mallory, night janitor. Wondered if I hit my head.'] }
      ],
      want: [
        { who: 'janitor', say: 'Nothing. I\'m doing the floors. Two, three, then four if the Doc ever goes home. He never goes home.' },
        { note: ['janitor', 'Doing the floors. Kane never goes home, he says.'] }
      ],
      how: [
        { who: 'janitor', say: 'Number twelve bus, same as always. Driver had the heater on full and the radio on that call-in guy.' },
        { who: 'janitor', say: 'Then the service door, which still sticks, which I\'ve put in a ticket about. Twice.' },
        { note: ['janitor', 'Came on the number 12 bus and in through the service door.'] }
      ]
    },
    questions: [
      { id: 'keys', ask: 'That\'s a lot of keys.', requires: 'saw:janitorKeys', steps: [
        { who: 'janitor', say: 'Forty-one. Every door in the place except the fourth floor lab.' },
        { who: 'janitor', say: 'Doc changed that lock in the summer. Won\'t give me one. I clean round it.' },
        { note: ['janitor', 'Has every key but the fourth-floor lab. Kane changed that lock in the summer.'] }
      ] },
      { id: 'badge', ask: 'That badge still good?', requires: 'saw:janitorBadge', steps: [
        { who: 'janitor', say: 'Renewed in January. Same lousy picture. They won\'t let you take it twice.' },
        { note: ['janitor', 'Badge renewed in January.'] }
      ] },
      { id: 'bucket', ask: 'Sorry about the mop, Walt.', requires: 'saw:janitorBucket', steps: [
        { who: 'janitor', say: 'That was you? You wring it out the wrong way, Lou. And it smells like pennies.' },
        { narrate: 'I said somebody had spilled something. He looked at me a long time, and then he didn\'t ask.' },
        { note: ['janitor', 'Owned up to using his mop. He didn\'t ask what I spilled.'] }
      ] },
      { id: 'hands', ask: 'Your hands look rough.', requires: 'saw:janitorHands', steps: [
        { who: 'janitor', say: 'Bleach. Thirty years of it. The Doc\'s people spill stuff up there that eats through the gloves.' },
        { note: ['janitor', 'Thirty years of bleach. Says Kane\'s lab spills things that eat gloves.'] }
      ] },
      { id: 'list', ask: 'You\'re not on my list.', requires: 'saw:desk.list', steps: [
        { who: 'janitor', say: 'I\'m not a visitor, Lou. I\'m the reason the visitors don\'t stick to the floor.' },
        { note: ['janitor', 'Not on the visitor list. He\'s staff.'] }
      ] },
      { id: 'kane', ask: 'You ever seen Dr. Kane, Walt?', requires: 'now:realKaneDescribed', steps: [
        { who: 'janitor', say: 'The Doc? Couple of times, at Christmas. Little bald fella. Moustache like a push broom.' },
        { who: 'janitor', say: 'Leaves me notes about his wastebasket. Nice handwriting. Why?' },
        { narrate: 'Short, bald, a moustache. That was two people now. Neither of them was describing the man upstairs.', noSkip: true },
        { note: ['janitor', 'Walt\'s seen the real Kane: little, bald, moustache. Matches the sister. Not the man who ran in.'] }
      ] }
    ],
    actions: {
      letThrough: { steps: [
        { narrate: 'I nodded him on. He pushed the bucket to the elevator, and the wheel squeaked the whole way.' },
        { who: 'janitor', say: 'And stay out of my closet.' },
        { exit: 'walk' },
        { note: ['janitor', 'Let Walt through to do the floors.'] }
      ] },
      turnAway: { steps: [
        { narrate: 'I told him to skip the upstairs tonight. Doctor\'s orders.' },
        { who: 'janitor', say: 'Doctor\'s orders. Fine. When the building manager asks why the bins are full, he gets your name.' },
        { exit: 'walk' },
        { note: ['janitor', 'Told Walt to skip the floors tonight. He\'s not happy.'] }
      ] },
      shoot: { steps: [
        { sfx: 'gunshot' },
        { exit: 'fall' },
        { backdrop: 'body' },
        { narrate: 'The bucket tipped over. Forty-one keys hit the floor all at once, like a dropped tray in a cafeteria.' },
        { narrate: 'Six years he called me Lou.' },
        { note: ['janitor', 'I shot Walt. He knew my name.'] },
        { reset: 'You shot Walt, the night janitor.' }
      ] }
    },
    returnArrive: [
      { crt: ['CAM 03 SERVICE', '> DOOR OPEN', '> REC'] },
      { narrate: 'The service door banged again. The squeaky wheel came back across the lobby, slower this time.' }
    ],
    returnGreeting: [
      { who: 'janitor', say: 'Lou. Building manager says if the fourth floor bins aren\'t done tonight, I\'m done. Period.' },
      { who: 'janitor', say: 'So you want to tell him why, or are you going to let me do my job?' },
      { note: ['janitor', 'Walt came back. His job\'s on the line if the floors don\'t get done.'] }
    ]
  };

  /* ======================================================================
   * 4. Influencer (intruder, 2020s, tier 1)
   * ====================================================================== */
  C.influencer = { name: 'Kenzie', notebookName: 'Kenzie, filming the lobby', portrait: 'influencer' };

  V.influencer = {
    id: 'influencer',
    truth: 'intruder',
    prompt: 'She is talking to the stick in her hand, not to me.',
    arrive: [
      { crt: ['CAM 01 LOBBY', '> MOTION: 1', '> LIGHT SOURCE?'] },
      { narrate: 'A young woman in a quilted jacket came in backwards, holding a stick out in front of her face. Something on the end of it was lit up and pointed at her.' },
      { sfx: 'door' },
      { enter: 'influencer' }
    ],
    greeting: [
      { who: 'influencer', say: 'Okay, hi, we\'re inside! Say hi to the security guy, guys.' },
      { who: 'influencer', say: 'Hiii. I\'m doing a piece on Science Corp for my channel. The vibes in here are insane.' },
      { note: ['influencer', 'Says she\'s doing a piece on Science Corp "for her channel". Talks to a stick.'] },
      { learn: 'metInfluencer' }
    ],
    inspect: [
      { title: 'Stick', zoom: 'influencerPhone', x: 186, y: 28, w: 26, h: 30,
        text: 'A telescoping pole with a slab of glass clamped on the end. The glass shows her own face, and the word LIVE in a red box. Little hearts float up the side.',
        note: 'Glass slab on a pole, pointed at her face. It says LIVE. Hearts float up it.' },
      { title: 'Ears', zoom: 'influencerBuds', x: 225, y: 64, w: 12, h: 16,
        text: 'Little white plugs in both ears, each with a stem. No wire. They hold on by themselves.',
        note: 'White plugs in both ears, no wires.' },
      { title: 'Jacket', zoom: 'influencerJacket', x: 256, y: 120, w: 34, h: 30,
        text: 'Quilted puffer, oversized, the colour of oatmeal. It\'s a lot of coat.',
        note: 'Big quilted puffer jacket, oatmeal coloured.' },
      { title: 'Bottle', zoom: 'influencerBottle', x: 284, y: 192, w: 22, h: 38,
        text: 'A steel water bottle covered in stickers. A cartoon frog, a pizza slice, one that says STAY HYDRATED.',
        note: 'Steel water bottle covered in stickers.' }
    ],
    opening: {
      name: [
        { who: 'influencer', say: 'Kenzie! Kenzie Explores? Just search me, I\'m literally the first result.' },
        { narrate: 'Search her where? The phone book?' },
        { note: ['influencer', 'Calls herself "Kenzie Explores". Told me to "search" her.'] }
      ],
      want: [
        { who: 'influencer', say: 'I just need, like, ten minutes upstairs. Mad scientist content does numbers, you have no idea.' },
        { note: ['influencer', 'Wants ten minutes upstairs because "mad scientist content does numbers".'] }
      ],
      how: [
        { who: 'influencer', say: 'Got a ride. Four point nine stars. He had mints.' },
        { narrate: 'I\'d never heard anyone rate a cab driver out loud before.' },
        { note: ['influencer', 'Gave her driver "four point nine stars".'] }
      ]
    },
    questions: [
      { id: 'channel', ask: 'Channel? Which TV station?', requires: 'saw:influencerPhone', steps: [
        { who: 'influencer', say: 'TV? No, like... my followers.' },
        { who: 'influencer', say: 'Guys, he said TV. He\'s so real for that.' },
        { narrate: 'She said it to the stick. The stick sent back more hearts.' },
        { note: ['influencer', 'Her "channel" isn\'t a TV station. It\'s "her followers".'] }
      ] },
      { id: 'wifi', ask: 'Who are you talking to?', requires: 'saw:influencerPhone', steps: [
        { who: 'influencer', say: 'Chat! Twelve hundred people, live. Well, it was. What\'s the Wi-Fi password?' },
        { narrate: 'I didn\'t know what Wi-Fi was. I was pretty sure we didn\'t have it.' },
        { note: ['influencer', 'Says twelve hundred people are watching. Asked for the "Wi-Fi password".'] }
      ] },
      { id: 'buds', ask: 'Can you even hear me with those in?', requires: 'saw:influencerBuds', steps: [
        { who: 'influencer', say: 'They\'re noise-cancelling, not noise-ignoring. I can hear you fine, no cap.' },
        { narrate: 'No cap. She wasn\'t wearing one, so I let it go.' },
        { note: ['influencer', 'Plugs in her ears "cancel noise". Said "no cap".'] }
      ] },
      { id: 'bottle', ask: 'What\'s in the bottle?', requires: 'saw:influencerBottle', steps: [
        { who: 'influencer', say: 'Water? It\'s just water. Hydration is, like, a whole thing.' },
        { note: ['influencer', 'Bottle of plain water. Nothing to it.'] }
      ] },
      { id: 'list', ask: 'You\'re not on my list.', requires: 'saw:desk.list', steps: [
        { who: 'influencer', say: 'Okay but that\'s literally the point? It\'s unfiltered. Behind the scenes.' },
        { note: ['influencer', 'Not on the list. Says that\'s "the point".'] }
      ] }
    ],
    actions: {
      letThrough: { steps: [
        { narrate: 'I waved her up. She narrated every stair to twelve hundred people who weren\'t born yet.' },
        { exit: 'walk' },
        { pause: 800 },
        { sfx: 'distant' },
        { narrate: 'She got her ten minutes. She found what she came for on the fourth floor. Then the light came.' },
        { note: ['influencer', 'Let her up. She streamed the end of the night.'] },
        { reset: 'You let a visitor from the 2020s through.' }
      ] },
      turnAway: { steps: [
        { narrate: 'I told her the building was closed to the press, and to sticks.' },
        { who: 'influencer', say: 'Wow. Okay. Guys, I\'m being kicked out. This is so unhinged. Clip that.' },
        { exit: 'walk' },
        { note: ['influencer', 'Turned her away. She told her stick to "clip that".'] }
      ] },
      shoot: { steps: [
        { sfx: 'gunshot' },
        { exit: 'fall' },
        { backdrop: 'body' },
        { narrate: 'The pole hit the floor and the glass on the end kept filming. The hearts stopped coming.' },
        { note: ['influencer', 'Shot her. The thing on the stick kept recording until it didn\'t.'] }
      ].concat(cleanup('I pried the glass off the stick and put it face down in the drawer. I didn\'t want anybody watching me mop.')) }
    }
  };

  /* ======================================================================
   * 5. Harold Wallis, colour TV salesman (intruder, 1950s, tier 2)
   *    The 1920s gentleman, back in different clothes if he was turned away.
   * ====================================================================== */
  C.salesman = { name: 'Harold Wallis', notebookName: 'Harold Wallis, colour TV salesman', portrait: 'salesman' };

  V.salesman = {
    id: 'salesman',
    truth: 'intruder',
    prompt: 'Pomade, aftershave, and under it, very faintly, cedar.',
    arrive: [
      { crt: ['CAM 01 LOBBY', '> MOTION: 1', '> REC'] },
      { narrate: 'A man in a grey suit came in swinging a sample case, his hair combed back so hard it shone like a new record.' },
      { sfx: 'door' },
      { enter: 'salesman' }
    ],
    greeting: [
      { who: 'salesman', say: 'Evening, friend! Harold Wallis, Wallis Home Electronics. I\'ve a demonstration for Dr. Kane.' },
      { who: 'salesman', say: 'Man of science like him ought to see the future first, wouldn\'t you say?' },
      { note: ['salesman', 'Harold Wallis, Wallis Home Electronics. A "demonstration" for Kane.'] },
      { learn: 'metSalesman' }
    ],
    inspect: [
      { title: 'Hair', zoom: 'salesmanHair', x: 228, y: 38, w: 42, h: 18,
        text: 'Combed straight back with a tin of pomade. Every groove in place, and not a drop of rain in it.',
        note: 'Slicked-back hair, perfectly dry. It\'s pouring outside.' },
      { title: 'Tie clip', zoom: 'salesmanTieClip', x: 238, y: 124, w: 22, h: 10,
        text: 'A gold bar clipped across a skinny tie. Engraved: I LIKE IKE.',
        note: 'Tie clip engraved "I LIKE IKE".' },
      { title: 'Sample case', zoom: 'salesmanCase', x: 184, y: 204, w: 34, h: 38,
        text: 'Brown leather with brass corners, WALLIS stencilled on the lid. Brand new, but built like nothing\'s been built in thirty years.',
        note: 'Leather sample case with brass corners, WALLIS on the lid. New, but old-fashioned.' },
      { title: 'Brochure', zoom: 'salesmanBrochure', x: 298, y: 194, w: 14, h: 30,
        text: 'A glossy fold-out: COLOR TV, with a family grinning at a set the size of a sideboard. Price on the back: $49.95.',
        note: 'His brochure prices a colour TV at $49.95.' },
      { title: 'Ring', zoom: 'salesmanRing', x: 280, y: 202, w: 14, h: 12,
        text: 'A gold signet ring on his little finger. The initials are H.W.',
        note: 'Gold signet ring, initials H.W.' }
    ],
    opening: {
      name: [
        { who: 'salesman', say: 'Harold Wallis. Wallis Home Electronics. Here\'s my card. Keep it, I\'ve got a thousand.' },
        { narrate: 'The card was crisp and cream, and the phone number on it started with letters.' },
        { note: ['salesman', 'Harold Wallis. His business card has a phone number that starts with letters.'] }
      ],
      want: [
        { who: 'salesman', say: 'Fifteen minutes with Dr. Kane, that\'s all. The new colour television. Once he sees it, he\'ll want one for the lab.' },
        { note: ['salesman', 'Wants fifteen minutes with Kane to sell him a colour TV.'] }
      ],
      how: [
        { who: 'salesman', say: 'Drove, friend. She\'s parked right out front. Purrs like a kitten.' },
        { note: ['salesman', 'Says he drove and parked out front.'] }
      ]
    },
    questions: [
      { id: 'price', ask: 'What\'s a set like that go for?', requires: 'saw:salesmanBrochure', steps: [
        { who: 'salesman', say: 'For you? A steal at forty-nine ninety-five. Easy terms, a dollar a week.' },
        { narrate: 'Fifty bucks for a colour set. Sal\'s gets fifteen for a pizza. Nobody\'s sold a TV for fifty bucks since my father was a boy.' },
        { note: ['salesman', 'Says a colour TV goes for $49.95. That\'s a price from forty years ago.'] }
      ] },
      { id: 'case', ask: 'What\'s in the case?', requires: 'saw:salesmanCase', steps: [
        { who: 'salesman', say: 'Demonstration chassis. The tubes take a minute to warm up, but oh, the colour.' },
        { who: 'salesman', say: 'Say, does the lab have a Univac? I could rig her up to it. Imagine the reports.' },
        { narrate: 'A Univac. I\'d seen one in a museum on a school trip. It filled the room.' },
        { note: ['salesman', 'TV with "tubes". Asked if the lab has a Univac. Those are in museums.'] }
      ] },
      { id: 'clip', ask: 'Nice tie clip.', requires: 'saw:salesmanTieClip', steps: [
        { who: 'salesman', say: 'Thank you, friend. My wife had it engraved the week Ike won. Proud day.' },
        { narrate: 'Ike won before I was born. Harold Wallis looked about forty.' },
        { note: ['salesman', 'Says his wife engraved the tie clip "the week Ike won". He looks forty.'] }
      ] },
      { id: 'hair', ask: 'You came in dry. It\'s pouring.', requires: 'saw:salesmanHair', steps: [
        { who: 'salesman', say: 'Did I? Careful man, I suppose.' },
        { narrate: 'I\'d heard that before tonight, or something like it.' },
        { note: ['salesman', 'Dry from the rain. "Careful man." Like the man in the dry fedora.'] }
      ] },
      { id: 'ring', ask: 'H.W. Family ring?', requires: 'saw:salesmanRing', steps: [
        { who: 'salesman', say: 'Since before I could wear it, friend.' },
        { narrate: 'H.W. The cane on the man in the three-piece suit said H.W. too. And he\'d smelled of cedar.' },
        { note: ['salesman', 'Signet ring H.W. Same initials as the 1920s man\'s cane. Same cedar smell. Same man?'] }
      ] },
      { id: 'before', ask: 'Haven\'t I seen you somewhere before?', requires: 'now:metGent', steps: [
        { who: 'salesman', say: 'I\'ve one of those faces, friend. Everybody\'s seen me somewhere.' },
        { narrate: 'His hand went to his vest pocket, where a watch chain would have hung, once.' },
        { note: ['salesman', 'Asked if I\'d seen him before. He reached for a watch chain he wasn\'t wearing.'] }
      ] },
      { id: 'list', ask: 'You\'re not on my list.', requires: 'saw:desk.list', steps: [
        { who: 'salesman', say: 'No appointment, no sale, eh? Tell you what. I\'ll leave a brochure and you put in a good word.' },
        { note: ['salesman', 'Not on the visitor list. No Wallis, no Wallace.'] }
      ] }
    ],
    actions: {
      letThrough: { steps: [
        { narrate: 'I let him up. He winked at me on the way to the stairs, like we\'d closed a deal.' },
        { exit: 'walk' },
        { pause: 800 },
        { sfx: 'distant' },
        { narrate: 'Whatever he was selling, the fourth floor bought it. Then the light came.' },
        { note: ['salesman', 'Let him up. Second try, different suit. It worked for him.'] },
        { reset: 'You let a man from the 1950s through.' }
      ] },
      turnAway: { steps: [
        { narrate: 'I told him the doctor wasn\'t in the market. He smiled like a man who\'d heard no in several decades.' },
        { who: 'salesman', say: 'Another time, then, friend.' },
        { exit: 'walk' },
        { narrate: 'Another time. That\'s what the man in the fedora said.' },
        { note: ['salesman', 'Turned him away. "Another time." Same words as the 1920s man.'] }
      ] },
      shoot: { steps: [
        { sfx: 'gunshot' },
        { exit: 'fall' },
        { backdrop: 'body' },
        { narrate: 'The sample case burst open on the tiles. Glass tubes, still warm, rolling every which way.' },
        { note: ['salesman', 'Shot him. Under the pomade, the same cedar smell as the man in the three-piece suit.'] }
      ].concat(cleanup('I picked up the tubes one by one. They stayed warm a long time.')) }
    }
  };

  /* ======================================================================
   * ART: the visitors (480x270 frame, centred on x≈249, drawn to y≈252)
   * ====================================================================== */
  var R = K.R, El = K.El, poly = K.poly, D = K.D;
  function legs(L, Dk, top) { K.legs(L, Dk, top); }
  function torso(L, Dk, hem) { K.torso(L, Dk, hem); }
  function armL(a, b, c, d) { K.armL(a, b, c, d); }
  function armR(a, b, c, d) { K.armR(a, b, c, d); }

  // neck and head at the standard spot, skin ramp [shadow, base, highlight]
  function face(s0, s1, s2) {
    R(241, 86, 16, 16, s1);
    El(249, 68, 18, 22, s1); El(246, 67, 15, 19, s2); D(256, 54, 12, 34, s0, 2);
  }

  A.sister = function () {
    // lower half: belted tan raincoat to the knee, stockings, paper bag in one hand, keys in the other
    R(222, 236, 20, 20, P.skinA1); R(256, 236, 20, 20, P.skinA0); D(222, 236, 54, 20, P.skinA0, 1);
    poly([[206, 164], [249, 164], [249, 238], [214, 240]], P.paperShade);
    poly([[249, 164], [292, 164], [286, 240], [249, 238]], P.plastic1);
    D(206, 164, 43, 74, P.plastic1, 1);
    R(249, 196, 1, 44, P.plastic0); R(246, 172, 2, 2, P.paperDark); R(252, 172, 2, 2, P.plastic0);
    R(208, 186, 80, 5, P.plastic0); R(242, 185, 10, 7, P.brown1); R(244, 187, 6, 3, P.plastic0);
    R(232, 191, 3, 12, P.plastic0); R(264, 191, 3, 10, P.plastic0);
    armL(P.paperShade, P.plastic0, P.skinA1, P.skinA2);
    armR(P.plastic1, P.plastic0, P.skinA1, P.skinA2);
    // the brown paper bag, held by its folded top
    R(190, 206, 26, 28, P.card1); R(204, 206, 12, 28, P.card0); R(190, 233, 26, 1, P.card0);
    poly([[190, 200], [216, 200], [215, 207], [191, 207]], P.card0); R(191, 202, 24, 1, P.card1);
    R(194, 216, 14, 2, P.night0); R(194, 220, 14, 1, P.night0);
    El(203, 203, 5, 4, P.skinA1); El(202, 202, 3, 2, P.skinA2);
    // car keys and fob dangling from the other hand
    R(293, 211, 1, 6, P.steel); El(294, 218, 3, 3, P.steel); El(294, 218, 1, 1, P.plastic1);
    R(291, 220, 2, 7, P.fog); R(296, 220, 2, 6, P.steel); R(293, 221, 6, 9, P.brown1); R(294, 223, 4, 1, P.card1);

    // upper half: raincoat with a wide collar, rain on the shoulders
    poly([[188, 170], [200, 110], [226, 98], [272, 98], [298, 110], [310, 170]], P.plastic1);
    poly([[194, 170], [204, 112], [228, 100], [249, 100], [249, 170]], P.paperShade);
    poly([[238, 100], [260, 100], [249, 126]], P.paper);
    poly([[230, 98], [249, 128], [244, 140], [220, 104]], P.paperShade);
    poly([[268, 98], [249, 128], [254, 140], [278, 104]], P.plastic0);
    poly([[230, 98], [249, 128], [248, 131], [229, 101]], P.paperDark);
    D(196, 100, 104, 30, P.plastic0, 1);
    [[206, 108], [218, 114], [212, 124], [282, 110], [276, 122], [292, 128], [230, 132]].forEach(function (d) { R(d[0], d[1], 1, 2, P.fog); });
    R(248, 146, 2, 2, P.paperDark); R(248, 158, 2, 2, P.paperDark);
    // a kind, tired face in her fifties
    face(P.skinA0, P.skinA1, P.skinA2);
    R(238, 66, 6, 3, P.night0); R(254, 66, 6, 3, P.night0); R(239, 66, 2, 1, P.paper); R(255, 66, 2, 1, P.paper);
    R(237, 62, 8, 1, P.brown1); R(253, 62, 8, 1, P.brown1);
    R(235, 70, 3, 1, P.skinA0); R(261, 70, 3, 1, P.skinA0);
    poly([[242, 79], [256, 79], [254, 82], [244, 82]], P.red0); R(244, 79, 10, 1, P.red1);
    R(240, 78, 2, 1, P.skinA0); R(256, 78, 2, 1, P.skinA0);
    // grey-brown curls peeking out of the scarf
    El(249, 55, 17, 5, P.hair1); El(236, 60, 4, 7, P.hair1); El(262, 60, 4, 7, P.hair1);
    [[236, 54], [244, 52], [252, 53], [260, 55], [234, 62]].forEach(function (d) { R(d[0], d[1], 3, 2, P.fog); });
    // red paisley headscarf knotted under the chin
    El(249, 46, 22, 10, P.red1); R(227, 46, 6, 34, P.red1); R(265, 46, 6, 34, P.red0);
    R(227, 50, 44, 3, P.red1); R(249, 50, 22, 3, P.red0);
    D(256, 36, 16, 18, P.red0, 2);
    [[236, 40], [246, 38], [258, 42], [241, 46], [229, 60], [228, 72]].forEach(function (d) { R(d[0], d[1], 2, 2, P.lamp3); });
    poly([[229, 80], [244, 92], [249, 88], [254, 92], [269, 80], [269, 84], [254, 98], [244, 98], [229, 84]], P.red0);
    El(249, 95, 4, 3, P.red1);
  };

  A.courier = function () {
    // lower half: black joggers, black rain shell with a reflective stripe, the box under his arm
    legs(P.night2, P.night1, 196);
    R(230, 210, 1, 44, P.night1); R(220, 228, 6, 1, P.steel);
    torso(P.night3, P.night2, 200);
    R(206, 192, 86, 2, P.fog); R(249, 164, 1, 36, P.night1);
    R(246, 196, 3, 4, P.steel);
    D(212, 188, 74, 12, P.steel, 1);
    armR(P.night2, P.night1, P.skinB1, P.skinB2);
    // package with a printed square label
    R(272, 188, 34, 24, P.card1); R(272, 188, 34, 2, P.card0); R(288, 188, 2, 24, P.card0);
    R(276, 194, 10, 10, P.paper);
    [[277, 195], [279, 197], [282, 195], [283, 199], [277, 201], [280, 200], [284, 202]].forEach(function (d) { R(d[0], d[1], 2, 2, P.night0); });
    R(292, 196, 10, 6, P.paper); for (var b = 0; b < 5; b++) R(293 + b * 2, 197, 1, 4, P.night0);

    // upper half: rain shell, hood rolled at the collar, a lit glass slab held at the chest
    poly([[190, 170], [202, 110], [226, 98], [272, 98], [296, 110], [308, 170]], P.night2);
    poly([[196, 170], [206, 112], [228, 100], [249, 100], [249, 170]], P.night3);
    El(249, 102, 24, 6, P.night1); R(226, 100, 46, 4, P.night1);
    R(249, 104, 1, 66, P.night1); R(202, 150, 96, 2, P.fog);
    R(270, 118, 8, 4, P.fog);
    poly([[194, 110], [216, 108], [218, 142], [200, 150]], P.night1);
    poly([[196, 112], [214, 110], [216, 140], [202, 147]], P.night3);
    R(199, 120, 16, 28, P.night0); R(200, 121, 14, 25, P.fut0);
    for (var r = 0; r < 4; r++) for (var c = 0; c < 3; c++) R(202 + c * 4, 124 + r * 5, 2, 2, (r + c) % 2 ? P.fut1 : P.fut2);
    El(207, 147, 6, 4, P.skinB1); El(206, 146, 4, 2, P.skinB2);
    // a young face, lit from below
    face(P.skinB0, P.skinB1, P.skinB2);
    R(238, 68, 6, 2, P.night0); R(254, 68, 6, 2, P.night0);
    R(237, 64, 8, 1, P.skinB0); R(253, 64, 8, 1, P.skinB0);
    R(243, 80, 12, 2, P.skinB0);
    D(236, 78, 26, 10, P.skinB0, 1);
    // earbud, no wire
    El(231, 70, 3, 5, P.skinB1); R(229, 68, 3, 3, P.paper); R(230, 71, 1, 5, P.paper);
    // grey beanie
    El(249, 50, 20, 12, P.steel); R(229, 50, 40, 8, P.steel); R(229, 56, 40, 4, P.night3);
    for (var k = 0; k < 10; k++) R(231 + k * 4, 56, 1, 4, P.night2);
    D(256, 40, 14, 18, P.night3, 2);
  };

  A.janitor = function () {
    // lower half: work trousers, shirt tucked in, the key ring, his bucket
    legs(P.suit1, P.suit0, 192);
    R(230, 206, 1, 48, P.suit0);
    torso(P.shirt, P.suit1, 194);
    R(208, 190, 82, 4, P.night0); R(246, 190, 5, 4, P.steel);
    // key ring on his belt
    R(222, 192, 2, 4, P.steel); El(223, 199, 5, 4, P.steel); El(223, 199, 3, 2, P.shirt);
    [[216, 202, P.steel], [219, 203, P.lamp3], [222, 204, P.steel], [225, 203, P.fog], [228, 202, P.lamp3], [231, 201, P.steel]]
      .forEach(function (k) { R(k[0], k[1], 2, 7, k[2]); });
    R(226, 202, 4, 3, P.paper); R(227, 203, 2, 1, P.red1);
    // arms; the mop handle in one hand
    armL(P.shirt, P.suit1, P.skinA1, P.skinA2);
    armR(P.suit1, P.suit0, P.skinA1, P.skinA2);
    D(198, 200, 12, 12, P.red0, 1);
    R(296, 100, 3, 122, P.wood3); R(298, 100, 1, 122, P.wood2);
    El(294, 205, 6, 7, P.skinA1); El(293, 204, 4, 5, P.skinA2);
    // mop bucket and wringer at his knee
    poly([[270, 224], [310, 224], [306, 246], [274, 246]], P.lamp3);
    poly([[292, 224], [310, 224], [306, 246], [292, 246]], P.card0);
    R(268, 222, 44, 3, P.plastic0); R(272, 214, 16, 8, P.steel); R(274, 216, 12, 2, P.night1);
    El(298, 222, 7, 3, P.paperShade); D(291, 219, 14, 5, P.red0, 1);

    // upper half: work shirt, badge on the pocket, mop handle up past his shoulder
    poly([[190, 170], [202, 110], [226, 100], [272, 100], [296, 110], [308, 170]], P.suit1);
    poly([[196, 170], [206, 112], [228, 102], [249, 102], [249, 170]], P.shirt);
    poly([[236, 100], [262, 100], [249, 114]], P.skinA1);
    poly([[230, 100], [249, 114], [240, 118], [228, 104]], P.shirt); poly([[268, 100], [249, 114], [258, 118], [270, 104]], P.suit0);
    R(248, 120, 2, 2, P.night0); R(248, 136, 2, 2, P.night0); R(248, 152, 2, 2, P.night0);
    R(218, 120, 16, 12, P.suit1); R(218, 120, 16, 1, P.night0); R(224, 116, 1, 6, P.red1);
    R(264, 116, 14, 12, P.paper); R(265, 117, 5, 6, P.paperShade); R(271, 118, 6, 1, P.paperDark); R(264, 125, 14, 3, P.red1);
    R(296, 100, 3, 70, P.wood3); R(298, 100, 1, 70, P.wood2);
    // an older face, heavy jowls, clean-shaven
    face(P.skinA0, P.skinA1, P.skinA2);
    El(249, 86, 14, 5, P.skinA1); R(238, 90, 22, 1, P.skinA0);
    R(238, 66, 6, 2, P.night0); R(254, 66, 6, 2, P.night0);
    R(236, 61, 9, 3, P.fog); R(253, 61, 9, 3, P.fog);
    R(237, 70, 6, 1, P.skinA0); R(255, 70, 6, 1, P.skinA0);
    R(242, 82, 14, 2, P.skinA0); R(244, 82, 10, 1, P.night0);
    D(256, 70, 10, 18, P.skinA0, 1);
    // grey flat-top, a pencil behind the ear
    R(231, 44, 36, 10, P.fog); R(231, 44, 36, 2, P.paperShade); D(252, 44, 15, 10, P.steel, 2);
    R(229, 52, 4, 12, P.fog); R(265, 52, 4, 12, P.steel);
    R(267, 58, 2, 10, P.lamp3); R(267, 58, 2, 2, P.red1);
  };

  A.influencer = function () {
    // lower half: black leggings, puffer to the hip, water bottle in one hand
    legs(P.night2, P.night1, 198);
    torso(P.paper, P.paperShade, 204);
    for (var q = 0; q < 4; q++) R(212, 172 + q * 9, 74, 1, P.paperShade);
    R(249, 164, 1, 40, P.paperDark);
    armR(P.paperShade, P.paperDark, P.skinA1, P.skinA2);
    R(288, 198, 14, 30, P.steel); R(288, 198, 4, 30, P.fog); R(290, 194, 10, 5, P.night3);
    R(291, 204, 6, 5, P.crt1); R(294, 214, 6, 4, P.red1); R(289, 220, 6, 4, P.lamp3);
    El(294, 206, 5, 6, P.skinA1); El(293, 205, 3, 4, P.skinA2);

    // upper half: oversized quilted puffer
    poly([[184, 170], [194, 106], [224, 96], [274, 96], [304, 106], [314, 170]], P.paperShade);
    poly([[190, 170], [198, 108], [226, 98], [249, 98], [249, 170]], P.paper);
    for (var j = 0; j < 6; j++) {
      var qy = 112 + j * 10, edge = (qy - 106) * 10 / 64;
      R(198 - edge, qy, 51 + edge, 1, P.paperShade); R(250, qy, 52 + edge, 1, P.paperDark);
    }
    El(249, 100, 22, 6, P.paperShade); R(249, 100, 1, 70, P.paperDark);
    // selfie stick raised from one hand, the glass facing her
    poly([[192, 110], [210, 106], [214, 136], [200, 146], [194, 140]], P.paperShade);
    R(196, 120, 15, 1, P.paperDark); R(197, 130, 16, 1, P.paperDark); R(200, 145, 10, 1, P.paperDark);
    El(206, 140, 6, 5, P.skinA1); El(205, 139, 4, 3, P.skinA2);
    poly([[205, 136], [207, 136], [200, 56], [198, 56]], P.steel);
    R(188, 30, 22, 26, P.night0); R(189, 31, 20, 24, P.fut0); R(190, 32, 9, 4, P.red1);
    El(199, 46, 4, 5, P.fut1); R(204, 40, 2, 2, P.red1); R(205, 36, 2, 2, P.red1); R(203, 44, 2, 2, P.red1);
    // a young face, lit cool from the screen on one side
    face(P.skinA0, P.skinA1, P.skinA2);
    R(238, 65, 6, 3, P.night0); R(254, 65, 6, 3, P.night0); R(239, 65, 2, 1, P.paper); R(255, 65, 2, 1, P.paper);
    R(237, 61, 8, 1, P.hair0); R(253, 61, 8, 1, P.hair0);
    R(236, 64, 2, 1, P.night0); R(260, 64, 2, 1, P.night0);
    poly([[242, 79], [256, 79], [254, 83], [244, 83]], P.night0); R(244, 80, 10, 1, P.paper);
    // hair scraped up into a high bun, a few strands loose
    El(249, 50, 20, 9, P.hair1); R(229, 50, 6, 18, P.hair1); R(263, 50, 6, 18, P.hair0);
    El(249, 34, 10, 8, P.hair1); El(252, 33, 6, 5, P.hair0);
    R(232, 66, 1, 10, P.hair1); R(266, 64, 1, 12, P.hair0);
    // white plugs in both ears
    R(228, 68, 3, 3, P.paper); R(229, 71, 1, 5, P.paper);
    R(267, 68, 3, 3, P.paper); R(268, 71, 1, 5, P.paperShade);
  };

  A.salesman = function () {
    // lower half: grey flannel suit, sample case in one hand, brochure and signet ring on the other
    legs(P.steel, P.night3, 192);
    R(230, 206, 1, 48, P.night2); R(268, 206, 1, 48, P.night1);
    torso(P.steel, P.night3, 200);
    R(249, 164, 1, 36, P.night2); R(246, 176, 2, 2, P.night1); R(246, 190, 2, 2, P.night1);
    R(214, 186, 14, 1, P.night2); R(270, 186, 14, 1, P.night2);
    armL(P.steel, P.paper, P.skinB1, P.skinB2);
    armR(P.night3, P.paper, P.skinB1, P.skinB2);
    R(186, 208, 30, 32, P.brown2); R(202, 208, 14, 32, P.brown1); R(186, 208, 30, 2, P.wood3);
    R(186, 208, 4, 4, P.lamp3); R(212, 208, 4, 4, P.lamp3); R(186, 236, 4, 4, P.lamp3); R(212, 236, 4, 4, P.lamp3);
    R(196, 202, 10, 2, P.brown0); R(196, 202, 2, 6, P.brown0); R(204, 202, 2, 6, P.brown0);
    R(192, 222, 18, 2, P.paperShade);
    El(201, 202, 5, 4, P.skinB1); El(200, 201, 3, 2, P.skinB2);
    R(299, 196, 12, 26, P.paper); R(300, 198, 10, 4, P.red1); R(300, 203, 10, 4, P.lamp3); R(300, 208, 10, 4, P.shirt); R(300, 213, 10, 4, P.crt1);
    R(300, 218, 8, 2, P.night0);
    El(289, 209, 3, 2, P.lamp4); R(288, 209, 2, 1, P.lamp3);

    // upper half: grey suit, white shirt, skinny tie with a gold clip
    poly([[190, 170], [200, 108], [226, 98], [272, 98], [298, 108], [308, 170]], P.night3);
    poly([[196, 170], [204, 110], [228, 100], [249, 100], [249, 170]], P.steel);
    poly([[238, 100], [260, 100], [256, 150], [242, 150]], P.paper);
    poly([[228, 100], [246, 136], [240, 140], [224, 106]], P.night3); poly([[270, 100], [252, 136], [258, 140], [274, 106]], P.night2);
    poly([[247, 104], [251, 104], [252, 146], [249, 150], [246, 146]], P.red0);
    R(246, 103, 6, 4, P.red1);
    R(242, 128, 14, 2, P.lamp4); R(242, 130, 14, 1, P.lamp3);
    R(214, 118, 12, 3, P.paper); R(216, 116, 2, 2, P.paper);
    // the same long jaw as the gentleman, a newer haircut
    R(240, 86, 18, 16, P.skinB1);
    El(249, 66, 19, 23, P.skinB1); El(246, 65, 16, 20, P.skinB2); D(257, 50, 14, 38, P.skinB0, 2);
    R(238, 64, 6, 3, P.night0); R(254, 64, 6, 3, P.night0); R(239, 64, 2, 1, P.paper); R(255, 64, 2, 1, P.paper);
    R(236, 60, 9, 2, P.night1); R(253, 60, 9, 2, P.night1);
    poly([[240, 79], [258, 79], [256, 83], [242, 83]], P.paper); R(240, 79, 18, 1, P.skinB0);
    R(243, 82, 12, 1, P.paperShade);
    // pomaded hair, combed straight back, a hard shine
    El(249, 46, 21, 9, P.hair0); R(229, 46, 40, 5, P.hair0); R(228, 48, 4, 14, P.hair0); R(266, 48, 4, 14, P.hair0);
    poly([[232, 51], [240, 48], [258, 48], [266, 51]], P.hair0);
    for (var k = 0; k < 4; k++) R(234 + k * 2, 40 + k * 3, 30 - k * 4, 1, P.night0);
    R(236, 42, 16, 1, P.fog); R(240, 41, 8, 1, P.paper);
    D(258, 38, 12, 12, P.night0, 1);
  };

  /* ======================================================================
   * ART: close-ups (32x24)
   * ====================================================================== */
  Z.sisterBag = function (z) {
    fill(z, 0, 0, 32, 24, P.card1);
    fill(z, 0, 0, 32, 5, P.card0); fill(z, 0, 4, 32, 1, P.brown1);
    for (var i = 0; i < 32; i += 5) fill(z, i, 1, 2, 1, P.card1);
    fill(z, 26, 5, 6, 19, P.card0);
    word(z, 'ALDOUS', 2, 10, P.night0);
    fill(z, 2, 17, 24, 1, P.night0);
  };
  Z.sisterCoat = function (z) {
    fill(z, 0, 0, 32, 24, P.paperShade);
    on(z, function () { D(0, 0, 32, 24, P.plastic1, 2); });
    fill(z, 0, 15, 32, 4, P.plastic0); fill(z, 13, 14, 7, 6, P.brown1); fill(z, 15, 16, 3, 2, P.plastic0);
    [[4, 3], [10, 7], [22, 4], [27, 9], [6, 11], [18, 9], [25, 21], [8, 21]].forEach(function (d) { fill(z, d[0], d[1], 1, 2, P.fog); fill(z, d[0], d[1], 1, 1, P.paper); });
  };
  Z.sisterScarf = function (z) {
    fill(z, 0, 0, 32, 24, P.red1);
    fill(z, 18, 0, 14, 24, P.red0);
    [[3, 3], [10, 6], [5, 13], [14, 16], [22, 4], [26, 13], [20, 20], [7, 20]].forEach(function (d) {
      fill(z, d[0], d[1], 3, 2, P.lamp3); fill(z, d[0] + 1, d[1] + 2, 1, 1, P.lamp3);
    });
    fill(z, 0, 22, 32, 2, P.red0);
    [[2, 0], [12, 0], [24, 0]].forEach(function (d) { fill(z, d[0], d[1], 1, 2, P.fog); });
  };
  Z.sisterKeys = function (z) {
    fill(z, 0, 0, 32, 24, P.plastic1);
    on(z, function () { El(4, 4, 3, 3, P.steel); El(4, 4, 1, 1, P.plastic1); });
    fill(z, 1, 8, 2, 12, P.fog); fill(z, 0, 14, 1, 2, P.fog); fill(z, 0, 17, 1, 1, P.fog);
    fill(z, 4, 8, 2, 10, P.steel); fill(z, 6, 12, 1, 2, P.steel);
    fill(z, 7, 6, 25, 16, P.brown1); fill(z, 7, 6, 25, 1, P.brown2); fill(z, 7, 7, 1, 2, P.steel);
    word(z, 'KANE', 12, 8, P.card1);
    word(z, 'MARLOW', 8, 15, P.brown2);
  };

  Z.courierPhone = function (z) {
    fill(z, 0, 0, 32, 24, P.skinB1);
    fill(z, 9, 0, 14, 24, P.night0);
    fill(z, 10, 1, 12, 22, P.fut0);
    fill(z, 14, 1, 4, 1, P.night0);
    for (var r = 0; r < 4; r++) for (var c = 0; c < 3; c++) fill(z, 11 + c * 4, 4 + r * 4, 2, 2, (r + c) % 2 ? P.fut1 : P.fut2);
    fill(z, 12, 20, 8, 1, P.fut2);
    fill(z, 0, 14, 9, 10, P.skinB2); fill(z, 23, 10, 9, 14, P.skinB1);
  };
  Z.courierEarbud = function (z) {
    fill(z, 0, 0, 32, 24, P.skinB0);
    on(z, function () { El(14, 11, 10, 11, P.skinB1); El(13, 10, 7, 8, P.skinB2); El(15, 12, 3, 3, P.skinB0); });
    fill(z, 12, 8, 7, 6, P.paper); fill(z, 13, 9, 3, 2, P.paperShade);
    fill(z, 15, 14, 3, 10, P.paper); fill(z, 17, 14, 1, 10, P.paperShade);
    fill(z, 18, 9, 1, 1, P.fut1);
    fill(z, 26, 0, 6, 24, P.night0);
  };
  Z.courierLabel = function (z) {
    fill(z, 0, 0, 32, 24, P.card1);
    fill(z, 0, 0, 32, 2, P.card0);
    fill(z, 3, 4, 26, 18, P.paper);
    var bits = ['1110111', '1010001', '1110101', '0001011', '1101100', '0110101', '1011101'];
    bits.forEach(function (row, y) { for (var x = 0; x < 7; x++) if (row[x] === '1') fill(z, 5 + x * 2, 6 + y * 2, 2, 2, P.night0); });
    for (var b = 0; b < 6; b++) fill(z, 21 + b, 7, 1, 8 - (b % 3) * 2, P.night0);
    fill(z, 21, 17, 6, 1, P.paperDark);
  };
  Z.courierJacket = function (z) {
    fill(z, 0, 0, 32, 24, P.night3);
    fill(z, 16, 0, 16, 24, P.night2);
    fill(z, 0, 14, 32, 3, P.fog); fill(z, 0, 15, 32, 1, P.paper);
    fill(z, 15, 0, 1, 24, P.night1);
    on(z, function () { D(0, 18, 32, 6, P.steel, 1); });
    fill(z, 22, 5, 5, 3, P.fog);
  };

  Z.janitorKeys = function (z) {
    fill(z, 0, 0, 32, 24, P.shirt);
    fill(z, 0, 0, 32, 3, P.night0);
    on(z, function () { El(16, 7, 7, 4, P.steel); El(16, 7, 5, 2, P.shirt); });
    var cols = [P.steel, P.lamp3, P.fog, P.steel, P.lamp3, P.steel, P.fog, P.lamp3];
    for (var i = 0; i < 8; i++) { fill(z, 4 + i * 3, 10, 2, 9 + (i % 3), cols[i]); fill(z, 4 + i * 3, 10, 2, 2, P.night1); }
    fill(z, 17, 14, 14, 8, P.paper);
    word(z, '4TH', 19, 16, P.night0);
    fill(z, 18, 18, 12, 1, P.red1);
  };
  Z.janitorBadge = function (z) {
    fill(z, 0, 0, 32, 24, P.shirt);
    fill(z, 2, 2, 28, 20, P.paper);
    fill(z, 4, 4, 8, 10, P.paperShade); fill(z, 6, 7, 4, 6, P.skinA1); fill(z, 5, 5, 6, 2, P.fog);
    word(z, 'BLDG', 14, 4, P.night0);
    word(z, 'SVCS', 14, 10, P.paperDark);
    fill(z, 2, 16, 28, 6, P.red1);
    word(z, 'MALLORY', 4, 17, P.paper);
  };
  Z.janitorBucket = function (z) {
    fill(z, 0, 0, 32, 24, P.night1);
    fill(z, 2, 6, 28, 18, P.lamp3); fill(z, 18, 6, 12, 18, P.card0);
    fill(z, 0, 4, 32, 3, P.plastic0);
    fill(z, 4, 7, 24, 4, P.steel);
    on(z, function () { D(4, 7, 24, 4, P.red0, 2); El(22, 4, 7, 3, P.paperShade); D(16, 1, 14, 6, P.red0, 1); });
    fill(z, 6, 0, 2, 6, P.wood3);
  };
  Z.janitorHands = function (z) {
    fill(z, 0, 0, 32, 24, P.suit1);
    fill(z, 0, 0, 32, 4, P.shirt);
    fill(z, 4, 4, 24, 10, P.skinA1);
    for (var i = 0; i < 4; i++) fill(z, 4 + i * 6, 14, 5, 9, P.skinA1);
    for (var j = 0; j < 4; j++) { fill(z, 5 + j * 6, 8, 3, 2, P.red1); fill(z, 6 + j * 6, 16, 2, 1, P.red0); fill(z, 5 + j * 6, 11, 1, 1, P.red0); }
    on(z, function () { D(4, 4, 24, 19, P.skinA0, 1); });
  };

  Z.influencerPhone = function (z) {
    fill(z, 0, 0, 32, 24, P.night1);
    fill(z, 14, 20, 3, 4, P.steel);
    fill(z, 7, 0, 18, 21, P.night0);
    fill(z, 8, 1, 16, 19, P.fut0);
    on(z, function () { El(15, 14, 4, 5, P.skinA1); El(15, 10, 4, 2, P.hair1); El(15, 7, 2, 2, P.hair1); });
    fill(z, 13, 13, 1, 1, P.night0); fill(z, 17, 13, 1, 1, P.night0); fill(z, 14, 16, 3, 1, P.red0);
    fill(z, 8, 1, 17, 7, P.red1);
    word(z, 'LIVE', 9, 2, P.paper);
    fill(z, 21, 16, 2, 2, P.red1); fill(z, 20, 12, 2, 2, P.red1); fill(z, 22, 9, 1, 1, P.red1);
  };
  Z.influencerBuds = function (z) {
    fill(z, 0, 0, 32, 24, P.hair1);
    on(z, function () { El(15, 12, 9, 11, P.skinA1); El(14, 11, 6, 8, P.skinA2); El(16, 12, 3, 3, P.skinA0); });
    fill(z, 13, 8, 7, 6, P.paper); fill(z, 14, 9, 3, 2, P.paperShade);
    fill(z, 16, 14, 3, 10, P.paper); fill(z, 18, 14, 1, 10, P.paperShade);
    fill(z, 26, 2, 1, 22, P.hair0);
  };
  Z.influencerJacket = function (z) {
    fill(z, 0, 0, 32, 24, P.paper);
    fill(z, 18, 0, 14, 24, P.paperShade);
    on(z, function () { for (var i = 0; i < 4; i++) D(0, 5 + i * 6, 32, 2, P.paperShade, 1); });
    for (var i = 0; i < 4; i++) fill(z, 0, 4 + i * 6, 32, 1, P.paperDark);
    fill(z, 17, 0, 1, 24, P.paperDark);
  };
  Z.influencerBottle = function (z) {
    fill(z, 0, 0, 32, 24, P.night1);
    fill(z, 9, 0, 14, 24, P.steel); fill(z, 9, 0, 4, 24, P.fog);
    fill(z, 11, 3, 7, 6, P.crt1); fill(z, 12, 4, 1, 1, P.night0); fill(z, 16, 4, 1, 1, P.night0);
    fill(z, 15, 11, 6, 5, P.lamp3); fill(z, 16, 12, 4, 1, P.red1);
    fill(z, 10, 18, 12, 4, P.paper); fill(z, 11, 19, 10, 1, P.shirt); fill(z, 11, 21, 7, 1, P.shirt);
  };

  Z.salesmanHair = function (z) {
    fill(z, 0, 0, 32, 24, P.hair0);
    for (var i = 0; i < 32; i += 3) fill(z, i, 0, 1, 20, P.night0);
    fill(z, 4, 5, 22, 1, P.fog); fill(z, 8, 4, 12, 1, P.paper); fill(z, 6, 10, 14, 1, P.steel);
    fill(z, 0, 20, 32, 4, P.skinB1); fill(z, 0, 19, 32, 1, P.skinB0);
  };
  Z.salesmanTieClip = function (z) {
    fill(z, 0, 0, 32, 24, P.paper);
    fill(z, 11, 0, 10, 24, P.red0); fill(z, 12, 0, 2, 24, P.red1);
    fill(z, 2, 9, 28, 7, P.lamp4); fill(z, 2, 15, 28, 1, P.lamp3);
    word(z, 'LIKE IKE', 1, 10, P.brown1);
    fill(z, 0, 0, 2, 24, P.steel); fill(z, 30, 0, 2, 24, P.night3);
  };
  Z.salesmanCase = function (z) {
    fill(z, 0, 0, 32, 24, P.brown2);
    fill(z, 20, 0, 12, 24, P.brown1);
    fill(z, 0, 0, 4, 4, P.lamp3); fill(z, 28, 0, 4, 4, P.lamp3); fill(z, 0, 20, 4, 4, P.lamp3); fill(z, 28, 20, 4, 4, P.lamp3);
    fill(z, 1, 1, 1, 1, P.lamp4); fill(z, 29, 1, 1, 1, P.lamp4);
    fill(z, 3, 8, 26, 9, P.brown0);
    word(z, 'WALLIS', 4, 10, P.paperShade);
    fill(z, 0, 19, 32, 1, P.wood3);
  };
  Z.salesmanBrochure = function (z) {
    fill(z, 0, 0, 32, 24, P.skinB1);
    fill(z, 2, 1, 28, 22, P.paper);
    word(z, 'COLOR', 4, 2, P.red1);
    word(z, 'TV', 4, 9, P.shirt);
    fill(z, 15, 8, 13, 8, P.wood2); fill(z, 16, 9, 9, 6, P.shirt); fill(z, 17, 10, 3, 2, P.red1); fill(z, 21, 12, 3, 2, P.crt1); fill(z, 26, 10, 1, 1, P.lamp3);
    fill(z, 4, 16, 24, 1, P.paperShade);
    word(z, '$', 5, 18, P.night0);
    E.art.digits(z, '49.95', 9, 18, P.night0);
  };
  Z.salesmanRing = function (z) {
    fill(z, 0, 0, 32, 24, P.night3);
    fill(z, 0, 6, 32, 12, P.skinB1); fill(z, 0, 7, 32, 3, P.skinB2); fill(z, 0, 17, 32, 1, P.skinB0);
    fill(z, 8, 5, 16, 14, P.lamp3); fill(z, 9, 5, 14, 2, P.lamp4);
    fill(z, 10, 8, 12, 9, P.lamp4);
    word(z, 'HW', 12, 10, P.brown1);
    fill(z, 26, 6, 1, 12, P.skinB0);
  };
})();
