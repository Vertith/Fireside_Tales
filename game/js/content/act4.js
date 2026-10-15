/*
 * Act Four: "Wanted" (5:04 AM to 5:52 AM). night.js puts them in order.
 *   insurance  G. Pruitt, Mutual Life of the Midwest   legit     (let through; red herring for the android rule)
 *   lawyer     J. Whitcombe, patent counsel            legit     (let through; red herring, evasive but every date right)
 *   engineer   P. Lindqvist, "Kessler Dynamics"        intruder  (shoot or turn away; drops the wanted poster: Emit)
 *   futureyou  an older Lou Brennan                    intruder  (shoot; turning him away doesn't hold him)
 *   warden     Warden T. Hask, 2240                    intruder, every word true (turn away; letting him up resets,
 *                                                                shooting him doesn't, but it's the worst call of the night)
 *
 * Memory flags set here: wantedPoster (engineer), wardenFile (warden), wardenBriefing,
 * engineerMerger, futureYouSlipped, shotFutureYou, shotWarden.
 */
(function () {
  var E = window.EMIT, C = E.content.characters, V = E.content.visitors, K = E.art.kit, P = K.P;

  C.insurance = { name: 'G. Pruitt', notebookName: 'Gordon Pruitt, Mutual Life of the Midwest', portrait: 'insurance' };
  C.lawyer = { name: 'J. Whitcombe', notebookName: 'James Whitcombe, Whitcombe & Lyle (patent counsel)', portrait: 'lawyer' };
  C.engineer = { name: 'P. Lindqvist', notebookName: 'Per Lindqvist, "Kessler Dynamics"', portrait: 'engineer' };
  C.futureyou = { name: 'Lou Brennan?', notebookName: 'The older guard (me?)', portrait: 'futureyou' };
  C.warden = { name: 'Warden T. Hask', notebookName: 'Warden T. Hask, Custodial Authority', portrait: 'warden' };

  E.content.visitorList.push(
    { name: 'G. Pruitt', org: 'Mutual Life of the Midwest', seeing: 'Dr. Kane' },
    { name: 'P. Lindqvist', org: 'Kessler Dynamics, joint project', seeing: 'Dr. Kane' }
  );

  /* ================= G. Pruitt, health insurance (legit) ================= */
  V.insurance = {
    id: 'insurance',
    truth: 'legit',
    prompt: 'He answers exactly what you ask, and not one word more.',
    arrive: [
      { crt: ['CAM 02 LOT', '> VEHICLE: 1', '> REC'] },
      { narrate: 'A beige sedan parked dead centre in its space, in an empty lot. The man who got out had an umbrella that had already given up.' },
      { sfx: 'door' },
      { enter: 'insurance' }
    ],
    greeting: [
      { who: 'insurance', say: 'Good morning. Gordon Pruitt, Mutual Life of the Midwest. I have a five o\'clock with Dr. Kane.' },
      { who: 'insurance', say: 'It is now four minutes past five. I apologise for that.' }
    ],
    inspect: [
      { title: 'Breast pocket', zoom: 'insuranceGuide', x: 210, y: 112, w: 18, h: 16,
        text: 'A TV Guide folded to Friday night, one listing circled in blue pen. Nine o\'clock.',
        note: 'TV Guide in his breast pocket, Friday 9 PM circled.' },
      { title: 'Tie', zoom: 'insuranceTie', x: 243, y: 104, w: 12, h: 40,
        text: 'Mustard tie, clip dead level. A stitched lighthouse: Mutual Life. Their ad runs during the late movie.',
        note: 'Mustard tie with a lighthouse logo. Mutual Life of the Midwest, from the late-movie ads.' },
      { title: 'Policy', zoom: 'insurancePolicy', x: 280, y: 188, w: 26, h: 34,
        text: 'Typed clean, not one strikeover. INSURED: KANE, ALDOUS. AGE 54. HEIGHT 5\'5". Somebody can really type.',
        note: 'His policy is typed perfectly. Insured: Aldous Kane, age 54, five foot five.' },
      { title: 'Left hand', zoom: 'insuranceHand', x: 194, y: 196, w: 20, h: 16,
        text: 'A paper cut across one knuckle, a drugstore bandage curling off it. The man bleeds for his paperwork.',
        note: 'Paper cut on his knuckle under a curling bandage.' },
      { title: 'Umbrella', zoom: 'insuranceUmbrella', x: 186, y: 214, w: 26, h: 32,
        text: 'A two-dollar umbrella, three spokes snapped. He\'s soaked to the shoulders. The rain found him fine.',
        note: 'Broken umbrella. He\'s soaked through.' }
    ],
    opening: {
      name: [
        { who: 'insurance', say: 'Pruitt. Gordon Pruitt. Regional underwriting, Mutual Life of the Midwest.' },
        { narrate: 'He slid a business card across. Raised print, a lighthouse, a phone, a fax and a P.O. box in Toledo.' },
        { note: ['insurance', 'Gordon Pruitt, Mutual Life of the Midwest. Business card with a Toledo P.O. box.'] }
      ],
      want: [
        { who: 'insurance', say: 'Dr. Kane\'s key-man policy lapses at six. The board needs his signature on page four.' },
        { who: 'insurance', say: 'Page four of four.' },
        { note: ['insurance', 'Needs Kane to sign a key-man policy renewal before it lapses at six.'] }
      ],
      how: [
        { who: 'insurance', say: 'I drove. The interstate, then Route 9, then the detour around Route 9.' },
        { who: 'insurance', say: 'Route 9 is flooded past the Texaco. There is a sign. The sign is also flooded.' },
        { narrate: 'He gave me the directions whether I wanted them or not. Some men are built that way.' },
        { note: ['insurance', 'Drove in. Knows Route 9 is flooded past the Texaco. Very literal.'] }
      ]
    },
    questions: [
      { id: 'list', ask: 'Let me check the list.', requires: 'saw:desk.list', steps: [
        { narrate: 'There he was in Kane\'s handwriting: G. Pruitt, Mutual Life of the Midwest.' },
        { note: ['insurance', 'On the visitor list: G. Pruitt, Mutual Life of the Midwest.'] }
      ] },
      { id: 'guide', ask: 'X-Files fan?', requires: 'saw:insuranceGuide', steps: [
        { who: 'insurance', say: 'I watch it.' },
        { pause: 500 },
        { who: 'insurance', say: 'The truth is out there.' },
        { narrate: 'Then he sighed, all the way down to his shoes.' },
        { who: 'insurance', say: 'My son says that whenever I ask him where the car keys went.' },
        { narrate: 'He got the joke, and it cost him something. Machines don\'t sigh like that.' },
        { note: ['insurance', 'Got the X-Files line, then sighed about his son. Dull, but human.'] }
      ] },
      { id: 'tie', ask: 'You\'re the lighthouse people. From the late movie.', requires: 'saw:insuranceTie', steps: [
        { who: 'insurance', say: '"A light on the shore, and a little bit more." Yes.' },
        { who: 'insurance', say: 'I did not write it. I would like that on the record.' },
        { note: ['insurance', 'Knows his company\'s jingle, and is embarrassed by it.'] }
      ] },
      { id: 'policy', ask: 'Five foot five? That\'s Dr. Kane?', requires: 'saw:insurancePolicy', steps: [
        { who: 'insurance', say: 'That is what the medical examiner recorded. Five five, one sixty, moustache.' },
        { who: 'insurance', say: 'Applicants do not usually lie about being shorter.' },
        { narrate: 'The man who ran down the stairs tonight had to duck under the exit sign.' },
        { note: ['insurance', 'Kane\'s medical exam: five foot five, one sixty, moustache. The man who ran in was tall, no moustache.'] },
        { note: ['scientist', 'His insurance policy says the real Kane is five foot five with a moustache.'] }
      ] },
      { id: 'hand', ask: 'What happened to your hand?', requires: 'saw:insuranceHand', steps: [
        { who: 'insurance', say: 'Page three. Carbonless forms. They are sharper than they look.' },
        { note: ['insurance', 'Cut his hand on a carbonless form.'] }
      ] },
      { id: 'umbrella', ask: 'Rough out there?', requires: 'saw:insuranceUmbrella', steps: [
        { who: 'insurance', say: 'Point eight of an inch since midnight, according to the radio.' },
        { pause: 500 },
        { who: 'insurance', say: 'Also, my umbrella broke. I liked that umbrella.' },
        { note: ['insurance', 'Answered the weather with a number, then mourned his umbrella.'] }
      ] }
    ],
    actions: {
      letThrough: { steps: [
        { narrate: 'I sent him up. He thanked me, checked his watch, and wrote down the minute I\'d let him through.' },
        { exit: 'walk' },
        { note: ['insurance', 'Let him up to get page four signed.'] }
      ] },
      turnAway: { steps: [
        { narrate: 'I told him Kane wasn\'t seeing anyone. He wrote that down too.' },
        { who: 'insurance', say: 'Then I will wait in the car. The policy lapses at six. I will note that it was not my fault.' },
        { exit: 'walk' },
        { note: ['insurance', 'Turned him away. He\'s waiting in his car.'] }
      ] },
      shoot: { steps: [
        { sfx: 'gunshot' },
        { exit: 'fall' },
        { backdrop: 'body' },
        { narrate: 'He went down holding the folder. Even then, the pages stayed in order.' },
        { narrate: 'The policy lapsed at six. Nobody ever signed page four.' },
        { note: ['insurance', 'I shot the insurance man. He was exactly as dull as he seemed.'] },
        { reset: 'You shot an insurance man. He was exactly who he said he was.' }
      ] },
      shutdown: { steps: [
        { narrate: 'I pointed Kane\'s grey box at him and pressed the button. He looked at it, then at me.' },
        { who: 'insurance', say: 'Is that device insured?' },
        { note: ['insurance', 'Tried the device on him. He asked if it was insured.'] }
      ] }
    },
    returnArrive: [
      { sfx: 'door' },
      { narrate: 'Pruitt again. He\'d sat in the car with the wipers going and come back with a new form.' },
      { enter: 'insurance' }
    ],
    returnGreeting: [
      { who: 'insurance', say: 'I have prepared a form stating that I was refused entry at five-oh-four.' },
      { who: 'insurance', say: 'You may sign it, or you may let me up. I would prefer the second. So would the board.' }
    ]
  };

  /* ================= J. Whitcombe, patent counsel (legit) ================= */
  V.lawyer = {
    id: 'lawyer',
    truth: 'legit',
    prompt: 'His briefcase is one bad step from bursting.',
    arrive: [
      { crt: ['CAM 02 LOT', '> VEHICLE: 1', '> REC'] },
      { narrate: 'A Lincoln took up two spaces. The man who got out carried his briefcase in both arms, like it might make a run for it.' },
      { sfx: 'door' },
      { enter: 'lawyer' }
    ],
    greeting: [
      { who: 'lawyer', say: 'Whitcombe. Whitcombe and Lyle. Aldous is expecting me.' },
      { who: 'lawyer', say: 'And before you ask, I am in no mood for a sign-in sheet.' }
    ],
    inspect: [
      { title: 'Briefcase', zoom: 'lawyerCase', x: 270, y: 184, w: 40, h: 48,
        text: 'Oxblood leather, latches straining. One corner sticking out reads PROVISIONAL APPLICATION.',
        note: 'Overstuffed briefcase. A corner of a provisional patent application sticking out.' },
      { title: 'Cover sheet', zoom: 'lawyerFiling', x: 192, y: 192, w: 28, h: 34,
        text: 'A filing cover sheet stamped RECEIVED, yesterday\'s date. At this hour, yesterday still counts as today.',
        note: 'Patent filing stamped RECEIVED, dated yesterday. The date checks out.' },
      { title: 'Lapel pin', zoom: 'lawyerPin', x: 210, y: 112, w: 16, h: 14,
        text: 'A gold pin: the scales of justice and a bar number. The kind they hand out at dinners nobody enjoys.',
        note: 'Bar association pin on his lapel.' },
      { title: 'Tie', zoom: 'lawyerTie', x: 242, y: 104, w: 14, h: 44,
        text: 'Red silk, a coffee stain he\'s attacked with a napkin and lost. He\'s been up all night too.',
        note: 'Coffee stain on his tie. He\'s been up all night.' }
    ],
    opening: {
      name: [
        { who: 'lawyer', say: 'James Whitcombe. Of Whitcombe and Lyle, which you would know if you read your list.' },
        { note: ['lawyer', 'James Whitcombe, Whitcombe & Lyle. Patent counsel. Rude.'] }
      ],
      want: [
        { who: 'lawyer', say: 'I need to see Dr. Kane.' },
        { narrate: 'I asked what about.' },
        { who: 'lawyer', say: 'That is privileged.' },
        { note: ['lawyer', 'Wants Kane. Won\'t say why: "privileged".'] }
      ],
      how: [
        { who: 'lawyer', say: 'Town Car. I drove myself. My driver has more sense than to be awake at this hour.' },
        { note: ['lawyer', 'Drove himself in a Lincoln Town Car.'] }
      ]
    },
    questions: [
      { id: 'list', ask: 'Let me check the list.', requires: 'saw:desk.list', steps: [
        { narrate: 'J. Whitcombe, Whitcombe & Lyle, patent counsel. Right there in the middle of the page.' },
        { note: ['lawyer', 'On the visitor list: J. Whitcombe, Whitcombe & Lyle, patent counsel.'] }
      ] },
      { id: 'case', ask: 'What\'s in the case?', requires: 'saw:lawyerCase', steps: [
        { who: 'lawyer', say: 'Privileged.' },
        { narrate: 'I asked if all of it was.' },
        { who: 'lawyer', say: 'Especially the parts you\'re looking at.' },
        { note: ['lawyer', 'Everything in the briefcase is "privileged".'] }
      ] },
      { id: 'filing', ask: 'When did Kane file?', requires: 'saw:lawyerFiling', steps: [
        { who: 'lawyer', say: 'What he filed is privileged. When is public record.' },
        { who: 'lawyer', say: 'Yesterday. Received at four fifty-eight, the last window before close. I drove it down myself.' },
        { narrate: 'The stamp said the same. He was cagey about everything except dates, and every date was right.' },
        { note: ['lawyer', 'Filed yesterday at 4:58 PM. Every date on his paperwork matches.'] }
      ] },
      { id: 'tie', ask: 'Long night?', requires: 'saw:lawyerTie', steps: [
        { who: 'lawyer', say: 'Aldous rang me at ten past four. In thirty years he has never once called me after nine.' },
        { who: 'lawyer', say: '"Witness it before sunrise, James, or it never happened." Then he hung up.' },
        { narrate: 'Kane had told me nobody goes up. He hadn\'t mentioned calling his lawyer.' },
        { note: ['lawyer', 'Kane phoned him at 4:10 AM: "Witness it before sunrise, or it never happened."'] }
      ] },
      { id: 'pin', ask: 'Known Dr. Kane long?', requires: 'saw:lawyerPin', steps: [
        { who: 'lawyer', say: 'I\'ve filed for Aldous since he was building radios in his mother\'s garage in Marlow.' },
        { who: 'lawyer', say: 'Thirty-one years. He still can\'t spell "provisional".' },
        { note: ['lawyer', 'Has known Kane since his garage in Marlow. Thirty-one years.'] }
      ] },
      { id: 'looks', ask: 'What does Dr. Kane look like?', requires: 'realKaneDescribed', steps: [
        { who: 'lawyer', say: 'Aldous? Short. Bald as a doorknob. A moustache he believes makes him distinguished.' },
        { who: 'lawyer', say: 'Why on earth do you ask?' },
        { narrate: 'Because the man who ran in tonight had a full head of wild grey hair, and no moustache at all.' },
        { note: ['lawyer', 'Kane is short and bald with a moustache. Same as his family says. Not the man who ran in.'] },
        { note: ['scientist', 'Kane\'s lawyer of thirty years describes a short bald man. Not him.'] }
      ] },
      { id: 'emit', ask: 'Ever heard the name Emit?', requires: 'wantedPoster', steps: [
        { who: 'lawyer', say: 'Emit? No. Sounds like a typo.' },
        { narrate: 'He turned it over the way lawyers turn over words.' },
        { who: 'lawyer', say: 'Time, backwards. Somebody thinks he\'s clever.' },
        { note: ['lawyer', 'Never heard of Emit. Pointed out it\'s "time" spelled backwards.'] }
      ] }
    ],
    actions: {
      letThrough: { steps: [
        { narrate: 'I waved him up. He took the stairs one at a time, briefcase first, like a man carrying a sleeping child.' },
        { exit: 'walk' },
        { note: ['lawyer', 'Let him up. On the list, and every date checked out.'] }
      ] },
      turnAway: { steps: [
        { narrate: 'I told him Kane wasn\'t seeing anyone until morning.' },
        { who: 'lawyer', say: 'It is morning. I will be in my car, billing somebody for this.' },
        { exit: 'walk' },
        { note: ['lawyer', 'Turned him away. He was on the list. He\'ll be back.'] }
      ] },
      shoot: { steps: [
        { sfx: 'gunshot' },
        { exit: 'fall' },
        { backdrop: 'body' },
        { narrate: 'The briefcase finally burst. Thirty years of Kane\'s filings slid across the lobby floor.' },
        { narrate: 'Every date on them was right.' },
        { note: ['lawyer', 'I shot Kane\'s patent lawyer. He was on the list.'] },
        { reset: 'You shot Kane\'s patent lawyer. He was on the list.' }
      ] },
      shutdown: { steps: [
        { narrate: 'I thumbed the grey box at him. Nothing.' },
        { who: 'lawyer', say: 'If that is a recording device, everything I have said tonight is privileged.' },
        { note: ['lawyer', 'Tried the device. He assumed it was a tape recorder.'] }
      ] }
    },
    returnArrive: [
      { sfx: 'door' },
      { narrate: 'Whitcombe was back. His Lincoln had stalled in the flood, and his mood had stalled with it.' },
      { enter: 'lawyer' }
    ],
    returnGreeting: [
      { who: 'lawyer', say: 'I have now been refused entry to a building I helped incorporate.' },
      { who: 'lawyer', say: 'Let me up, or I will own this desk by noon.' }
    ]
  };

  /* ================= P. Lindqvist, "Kessler Dynamics" (intruder, the wanted poster) ================= */
  var POSTER = { show: { zoom: 'wantedPoster', title: 'Wanted poster',
    text: 'WANTED: EMIT. Prisoner 0-1. Escaped custody, 2240. The photo: wild grey hair, glasses, a prison collar.' } };

  V.engineer = {
    id: 'engineer',
    truth: 'intruder',
    prompt: 'Polite, prepared, on the list. What fell out of his coat is in your drawer.',
    arrive: [
      { crt: ['CAM 02 LOT', '> MOTION: 1', '> REC'] },
      { narrate: 'A slate raincoat came across the lot at an even walk, umbrella held dead upright. I didn\'t see a car pull in.' },
      { sfx: 'door' },
      { enter: 'engineer' }
    ],
    greeting: [
      { who: 'engineer', say: 'Good morning. Lindqvist, Kessler Dynamics. Joint project with Dr. Kane. I\'m on your list.' },
      { narrate: 'He reached into his coat for his badge. Something came out with it: a folded sheet that slid across the counter and fell open by my hand.' },
      POSTER,
      { 'if': 'wantedPoster', then: [
        { narrate: 'Same sheet, same fold, same face. This time I knew it was coming, and it still turned my stomach.', noSkip: true }
      ], 'else': [
        { narrate: 'It wasn\'t paper. Thin, stiff, cold as a windowpane, with a border that glowed like my radio dial, only bluer.' },
        { narrate: 'The face on it was one I\'d seen at a quarter past ten, shouting about breakthroughs.' },
        { narrate: 'Emit. I\'d been calling him Kane all night.' }
      ] },
      { learn: 'wantedPoster' },
      { note: ['engineer', 'A wanted poster fell out of his coat: "WANTED: EMIT. Prisoner 0-1. Escaped custody, 2240." The photo is the man who calls himself Kane.'] },
      { note: ['scientist', 'His name isn\'t Kane. It\'s Emit. Prisoner 0-1, escaped custody in 2240. I have the poster.'] },
      { who: 'engineer', say: 'That\'s... I\'m sorry. That isn\'t mine.' },
      { narrate: 'He reached for it. I got there first and put it in the drawer, under the revolver.' },
      { set: 'posterInDrawer' },
      { who: 'engineer', say: 'Badge. Here. As I said, I\'m on the list.' }
    ],
    inspect: [
      { title: 'Badge', zoom: 'engineerBadge', x: 256, y: 112, w: 18, h: 20,
        text: 'LINDQVIST, P., senior engineer. Over the photo, a logo: KESSLER–SCIENCE. Corporate types love a dash.',
        note: 'His badge logo reads KESSLER–SCIENCE. One company, joined with a dash.' },
      { title: 'Coat pocket', zoom: 'engineerCoat', x: 212, y: 122, w: 22, h: 22,
        text: 'Gaping where the sheet fell out. The lining is quilted in tiny diamonds, every one the same.',
        note: 'Inside coat pocket where the poster came from. Lining quilted in tiny even diamonds.' },
      { title: 'Umbrella', zoom: 'engineerUmbrella', x: 188, y: 196, w: 18, h: 50,
        text: 'A black umbrella, furled tight and dripping properly. He\'s been out in it.',
        note: 'Black umbrella, wet. Nothing odd.' },
      { title: 'Drawing tube', zoom: 'engineerTube', x: 284, y: 184, w: 20, h: 52,
        text: 'A cardboard drawing tube, capped, KESSLER DYNAMICS stencilled down the side. Blueprints, he\'d say.',
        note: 'Cardboard drawing tube stencilled KESSLER DYNAMICS.' }
    ],
    opening: {
      name: [
        { who: 'engineer', say: 'Per Lindqvist. Senior engineer, Kessler Dynamics.' },
        { who: 'engineer', say: 'P. Lindqvist on your list. One L in the middle. People always add a second.' },
        { note: ['engineer', 'Per Lindqvist, senior engineer, Kessler Dynamics.'] }
      ],
      want: [
        { who: 'engineer', say: 'Joint project with Dr. Kane. It\'s on the list.' },
        { who: 'engineer', say: 'He wanted the bench measurements before sunrise. They\'re in the tube.' },
        { note: ['engineer', 'Says he\'s on a joint project with Kane, bringing bench measurements.'] }
      ],
      how: [
        { who: 'engineer', say: 'Drove down from Cambridge. Route 9 is under water past the Texaco, so I came round by the mall.' },
        { narrate: 'Same detour the pizza kid took. He knew the roads.' },
        { note: ['engineer', 'Drove from Cambridge. Knew about the flood on Route 9.'] }
      ]
    },
    questions: [
      { id: 'list', ask: 'Let me check the list.', requires: 'saw:desk.list', steps: [
        { narrate: 'P. Lindqvist, Kessler Dynamics, joint project. In Kane\'s handwriting, same as every other line.' },
        { 'if': 'now:wantedPoster', then: [{ narrate: 'Emit\'s handwriting, I corrected myself.' }] },
        { note: ['engineer', 'On the list: P. Lindqvist, Kessler Dynamics, joint project. Same handwriting as the rest.'] }
      ] },
      { id: 'badge', ask: 'Kessler–Science? What\'s that?', requires: 'saw:engineerBadge', steps: [
        { who: 'engineer', say: 'The joint project\'s branding. Marketing\'s idea. They print a dash and call it a partnership.' },
        { note: ['engineer', 'Says KESSLER–SCIENCE is just the joint project\'s branding.'] }
      ] },
      { id: 'tube', ask: 'What\'s in the tube?', requires: 'saw:engineerTube', steps: [
        { who: 'engineer', say: 'Bench measurements and two drawings. You can look. You won\'t enjoy it.' },
        { narrate: 'He uncapped it. Graph paper, pencil, columns of numbers. It looked like homework.' },
        { note: ['engineer', 'The tube holds graph paper and numbers. Looks real.'] }
      ] },
      { id: 'umbrella', ask: 'Long drive in this?', requires: 'saw:engineerUmbrella', steps: [
        { who: 'engineer', say: 'Two hours. I had the radio for company. Everyone\'s calling in about the lights over your building.' },
        { note: ['engineer', 'Says the radio is full of calls about the lights over the building.'] }
      ] },
      { id: 'pocket', ask: 'What else is in that coat?', requires: 'saw:engineerCoat', steps: [
        { who: 'engineer', say: 'Receipts. Lint. A pen that doesn\'t work.' },
        { narrate: 'I asked about the sheet.' },
        { who: 'engineer', say: 'I told you. It isn\'t mine.' },
        { narrate: 'He said it the way a man says it about a gun.' },
        { note: ['engineer', 'Swears the poster isn\'t his. Said it like it was a gun.'] }
      ] },
      { id: 'poster', ask: 'This face. Do you know him?', requires: 'now:wantedPoster', steps: [
        { who: 'engineer', say: 'Never seen him in my life.' },
        { narrate: 'His eyes went to the stairwell door when he said it, and stayed there a beat too long.' },
        { note: ['engineer', 'Says he\'s never seen the man on the poster. Looked at the stairwell door when he said it.'] }
      ] },
      { id: 'kessler', ask: 'Since when are you with Science Corp? Kessler\'s their rival.', requires: 'heardKessler', steps: [
        { who: 'engineer', say: 'Since the merger.' },
        { narrate: 'I asked him what merger.' },
        { who: 'engineer', say: 'The... April. Oh-three. It was in all the papers.' },
        { pause: 600 },
        { narrate: 'Kessler and Science Corp couldn\'t agree on a lunch order. Nobody had merged anything. Not yet.' },
        { note: ['engineer', 'Said he joined Science Corp "since the merger, April oh-three". No merger has happened. He\'s from later.'] },
        { learn: 'engineerMerger' }
      ] }
    ],
    actions: {
      letThrough: { steps: [
        { narrate: 'I sent him up. He took the stairs at that same even walk, the tube under his arm.' },
        { exit: 'walk' },
        { pause: 800 },
        { crt: ['CAM 03 LAB HALL', '> MOTION: 2', '> REC'] },
        { narrate: 'On the lab camera, two shapes in the hall. One of them looked straight up into the lens.' },
        { sfx: 'distant' },
        { narrate: 'Then the light came.' },
        { note: ['engineer', 'Let him up. The night started over.'] },
        { reset: 'You let a man from a merger that hasn\'t happened yet through.' }
      ] },
      turnAway: { steps: [
        { narrate: 'I told him the joint project could wait for business hours.' },
        { who: 'engineer', say: 'It can\'t, actually. But all right.' },
        { exit: 'walk' },
        { narrate: 'He walked out into the rain and didn\'t get into any car I could see.' },
        { note: ['engineer', 'Turned him away. He went without a fuss. No car.'] }
      ] },
      shoot: { steps: [
        { sfx: 'gunshot' },
        { exit: 'fall' },
        { backdrop: 'body' },
        { narrate: 'His name was on the list... but the dead man in front of my desk wasn\'t that man.' },
        { narrate: 'The badge said KESSLER–SCIENCE. A company that didn\'t exist, on a man who hadn\'t been born.' },
        { note: ['engineer', 'Shot him. His badge was for a company that doesn\'t exist yet.'] }
      ] },
      shutdown: { steps: [
        { narrate: 'I pointed the grey box at him. Nothing happened. He looked at it with professional interest.' },
        { who: 'engineer', say: 'Early model.' },
        { narrate: 'Early. As if he\'d seen the late ones.' },
        { note: ['engineer', 'Tried the device on him. He called it "an early model".'] }
      ] }
    }
  };

  /* ================= "Future You": an older Lou Brennan (intruder) ================= */
  V.futureyou = {
    id: 'futureyou',
    truth: 'intruder',
    prompt: 'He knows where the drawer is. He knows which way it sticks.',
    arrive: [
      { crt: ['CAM 01 LOBBY', '> MOTION: 1', '> ID 4471'] },
      { narrate: 'A guard came in out of the rain. Grey uniform, grey hair, a thermos in his fist. He walked up to my desk like it was his.' },
      { narrate: 'The camera read his badge number. It was mine.' },
      { sfx: 'door' },
      { enter: 'futureyou' }
    ],
    greeting: [
      { who: 'futureyou', say: 'Lou.' },
      { narrate: 'Nobody who comes through those doors after midnight knows my name.' },
      { who: 'futureyou', say: 'Don\'t go for the drawer yet. It sticks on the left runner. You keep meaning to wax it.' },
      { narrate: 'It does. I do.' }
    ],
    inspect: [
      { title: 'Face', zoom: 'futureyouFace', x: 230, y: 40, w: 38, h: 48,
        text: 'Older. Thirty years, give or take. My father\'s face, which I suppose is mine, eventually.',
        note: 'His face is mine, thirty years on.' },
      { title: 'Shoulder patch', zoom: 'futureyouPatch', x: 194, y: 104, w: 18, h: 18,
        text: 'The Science Corp patch, but not ours. Same atom, drawn sharper, with a ring on top like a crown.',
        note: 'His shoulder patch is a later Science Corp logo: sharper, with a ring like a crown.' },
      { title: 'Badge', zoom: 'futureyouBadge', x: 264, y: 114, w: 16, h: 16,
        text: 'Badge 4471. My number. The shine is worn off in the places I touch mine.',
        note: 'Badge 4471. My number, worn where I touch mine.' },
      { title: 'Left hand', zoom: 'futureyouScar', x: 194, y: 196, w: 20, h: 18,
        text: 'A hook-shaped scar on the back of his left hand, gone white. I have that scar. Same hand, same hook.',
        note: 'Same scar as mine, same hand.' },
      { title: 'Thermos', zoom: 'futureyouThermos', x: 284, y: 188, w: 18, h: 38,
        text: 'A steel thermos, a dent in the lid. Mine has that dent. I dropped it on the stairs my first week.',
        note: 'His thermos has the same dent as mine.' }
    ],
    opening: {
      name: [
        { who: 'futureyou', say: 'Lou Brennan. Badge four-four-seven-one. Six years on this desk, and then a lot more than six.' },
        { note: ['futureyou', 'Says he\'s Lou Brennan, badge 4471. Me.'] }
      ],
      want: [
        { who: 'futureyou', say: 'I need to get upstairs.' },
        { who: 'futureyou', say: 'If you let me through, the loop ends. I\'ve done this a hundred times.' },
        { who: 'futureyou', say: 'You get to go home, Lou. You get to see the sun come up.' },
        { note: ['futureyou', '"If you let me through, the loop ends. I\'ve done this a hundred times."'] }
      ],
      how: [
        { who: 'futureyou', say: 'I walked. Took me thirty years.' },
        { narrate: 'He said it like a joke he\'d told before, to people who didn\'t laugh.' },
        { note: ['futureyou', '"I walked. Took me thirty years."'] }
      ]
    },
    questions: [
      { id: 'list', ask: 'You\'re not on the list.', requires: 'saw:desk.list', steps: [
        { who: 'futureyou', say: 'Neither are you, and you\'re here every night.' },
        { note: ['futureyou', 'Not on the list. Didn\'t care.'] }
      ] },
      { id: 'face', ask: 'You look tired.', requires: 'saw:futureyouFace', steps: [
        { who: 'futureyou', say: 'You\'d be tired too.' },
        { pause: 400 },
        { who: 'futureyou', say: 'You will be.' },
        { note: ['futureyou', '"You\'d be tired too. You will be."'] }
      ] },
      { id: 'scar', ask: 'Where\'d you get that scar?', requires: 'saw:futureyouScar', steps: [
        { who: 'futureyou', say: 'Dad\'s Pontiac. The driver\'s door, in the driveway. You were nineteen.' },
        { who: 'futureyou', say: 'You told the girls at the Rialto it was a knife fight.' },
        { narrate: 'I had. I\'d never told a soul it wasn\'t.' },
        { note: ['futureyou', 'Knows where my scar came from, and the lie I told about it. Nobody knows that.'] }
      ] },
      { id: 'thermos', ask: 'What\'s in the thermos?', requires: 'saw:futureyouThermos', steps: [
        { who: 'futureyou', say: 'Black, two sugars. You don\'t touch it before three, so the back half of the night goes faster.' },
        { who: 'futureyou', say: 'Didn\'t work tonight, did it.' },
        { note: ['futureyou', 'Knows how I take my coffee, and when.'] }
      ] },
      { id: 'patch', ask: 'That isn\'t our patch.', requires: 'saw:futureyouPatch', steps: [
        { who: 'futureyou', say: 'It will be. They redo the logo.' },
        { who: 'futureyou', say: 'They redo a lot of things.' },
        { narrate: 'He put his hand over it. Not fast. But he covered it.' },
        { note: ['futureyou', 'The patch is from later. "They redo a lot of things." Covered it with his hand.'] }
      ] },
      { id: 'badge', ask: 'Same number.', requires: 'saw:futureyouBadge', steps: [
        { who: 'futureyou', say: 'Same badge. Nobody ever gave me another one.' },
        { note: ['futureyou', 'Wears badge 4471. Says nobody gave him another.'] }
      ] },
      { id: 'count', ask: 'A hundred times? I\'ve counted the marks on this desk.', requires: 'loop>=2', steps: [
        { narrate: 'I\'d scratched {loops} into the desk so far. Not a hundred.' },
        { who: 'futureyou', say: 'Then you\'re still near the start.' },
        { narrate: 'He didn\'t look at the marks. I would have.' },
        { note: ['futureyou', 'Says a hundred times. Didn\'t look at the tally on the desk.'] }
      ] },
      { id: 'shot', ask: 'What happened when I shot him?', requires: 'shotKane', steps: [
        { who: 'futureyou', say: 'You missed.' },
        { who: 'futureyou', say: 'Put one in the clock over the door. He laughed at you and went back up the stairs.' },
        { pause: 600 },
        { narrate: 'I didn\'t miss. I remember the kick of it. The squad car. The back seat that smelled of somebody else\'s night.' },
        { narrate: 'He didn\'t remember any of it. He wasn\'t there.' },
        { note: ['futureyou', 'Asked what happened when I shot Kane. He said I missed. I didn\'t. Whoever he is, he never lived my night.'] },
        { learn: 'futureYouSlipped' }
      ] },
      { id: 'emit', ask: 'Who\'s Emit?', requires: 'now:wantedPoster', steps: [
        { who: 'futureyou', say: '...' },
        { who: 'futureyou', say: 'Where did you hear that name?' },
        { who: 'futureyou', say: 'Forget it, Lou. Names don\'t matter tonight. Let me up and it\'s over.' },
        { narrate: 'He didn\'t ask who Emit was. He asked where I\'d heard it.' },
        { note: ['futureyou', 'Knows the name Emit. Asked where I\'d heard it, not who it was.'] }
      ] }
    ],
    actions: {
      letThrough: { steps: [
        { narrate: 'I stepped aside. He touched the desk on his way past, the way you touch a doorframe in a house you\'re leaving.' },
        { exit: 'walk' },
        { pause: 900 },
        { crt: ['CAM 03 LAB HALL', '> MOTION: 2', '> REC'] },
        { narrate: 'On the lab camera he went straight to the end of the hall. A door opened for him. Nobody had to knock.' },
        { sfx: 'distant' },
        { narrate: 'Nothing ended. The light came, same as always.' },
        { note: ['futureyou', 'Let him through. The loop didn\'t end. He lied to me in my own voice.'] },
        { reset: 'You let yourself through. It wasn\'t you.' }
      ] },
      turnAway: { steps: [
        { narrate: 'I told him no. Not tonight, not any night.' },
        { who: 'futureyou', say: 'Lou. You won\'t stop me. I know, because I didn\'t.' },
        { narrate: 'He walked round the end of the desk and through the stairwell door, and I let him, because he\'d been right about everything else.' },
        { exit: 'right' },   // on into the building, not back out the doors
        { pause: 800 },
        { sfx: 'distant' },
        { narrate: 'Then the light.' },
        { note: ['futureyou', 'Told him no. He walked past me anyway. Words won\'t stop him.'] },
        { reset: 'Words don\'t stop him. He knows you too well.' }
      ] },
      shoot: { steps: [
        { narrate: 'The drawer stuck on the left runner. He waited while I worked it loose. He didn\'t move.' },
        { sfx: 'gunshot' },
        { exit: 'fall' },
        { backdrop: 'body' },
        { narrate: 'He said my name once on the way down, gently, like he was letting me off a hook.' },
        { narrate: 'I looked at the scar on the back of my left hand for a long time.' },
        { note: ['futureyou', 'I shot him. My face, my scar, my badge. It was the right call. It didn\'t feel like one.'] },
        { learn: 'shotFutureYou' }
      ] },
      shutdown: { steps: [
        { narrate: 'I pointed the grey box at him. Nothing. He smiled at it with my smile.' },
        { who: 'futureyou', say: 'That thing never did a thing to people, Lou. You know that.' },
        { note: ['futureyou', 'The device did nothing. He knew it wouldn\'t.'] }
      ] }
    }
  };

  /* ================= Warden T. Hask, 2240 (intruder by era; every word true) ================= */
  var FILE = { show: { zoom: 'wardenFile', title: 'Prisoner file',
    text: 'CUSTODIAL AUTHORITY. PRISONER 0-1. Escaped custody, 2240. The photo is the man upstairs, in a collar.' } };

  var BRIEFING = [
    { 'if': 'run:wardenBriefed', then: [
      { who: 'warden', say: 'You have all of it now, officer. I\'ve nothing left that\'s worth your time.' }
    ], 'else': [
      { set: 'wardenBriefed' },
      { who: 'warden', say: 'Then I\'ll tell you the rest, and you can do what you like with it.' },
      { who: 'warden', say: 'Kane is real. A short man, bald, upstairs in that lab right now. Tonight he builds the first machine.' },
      { who: 'warden', say: 'Everything that comes after starts with him. The Authority. The cells. Me.' },
      { who: 'warden', say: 'Emit doesn\'t want it stopped. He wants it started in his hands, not Kane\'s. Whoever holds the first machine holds all of it.' },
      { who: 'warden', say: 'And anyone tonight who\'d be trouble for him later, he meets on the stairs. You\'ve been sending them up to him.' },
      { narrate: 'I thought about the people I\'d pointed at the stairwell door. I didn\'t like the list.' },
      { who: 'warden', say: 'Every time one of us gets near him, the night starts over. You\'ve noticed.' },
      { narrate: 'I\'d noticed.' },
      { who: 'warden', say: 'He can\'t be taken up there. He\'s had all night to dig in. He\'s had every night.' },
      { who: 'warden', say: 'He has to be stopped where it started. The moment he arrived, before he takes a step from the light.' },
      { who: 'warden', say: 'You\'re the one standing there, officer. You always were.' },
      { learn: 'wardenBriefing' },
      { note: ['warden', 'Kane is real: short, bald, upstairs. Emit wants the first machine for himself. Anyone who\'d trouble him later, he "deals with" on the stairs. Every time someone gets near Emit, the night resets.'] },
      { note: ['warden', 'He has to be stopped where it started: the moment he arrives, at the first flash. I\'m the one standing there.'] },
      { note: ['scientist', 'The warden says Emit can only be stopped the moment he arrives. The first flash.'] }
    ] }
  ];

  V.warden = {
    id: 'warden',
    truth: 'intruder',
    prompt: 'Everything he has said so far is true. You can feel it, the way you feel weather.',
    arrive: [
      { crt: ['CAM 01 LOBBY', '> MOTION: 1', '> REC'] },
      { narrate: 'No flash this time. Just the doors, and a tall man in a long dark coat who stopped to wipe his boots on the mat.' },
      { narrate: 'Nobody else tonight had wiped their boots.' },
      { sfx: 'door' },
      { enter: 'warden' }
    ],
    greeting: [
      { who: 'warden', say: 'Good morning, officer.' },
      { who: 'warden', say: 'I\'m not going to lie to you tonight. I\'d like the same courtesy, if you can manage it.' }
    ],
    inspect: [
      { title: 'Face', zoom: 'wardenFace', x: 230, y: 34, w: 38, h: 46,
        text: 'White hair cut to the bone, grey eyes. A man who has done one hard job for a long time, and never enjoyed it.',
        note: 'White crew cut, grey eyes. Tired, not cruel.' },
      { title: 'Lapel', zoom: 'wardenInsignia', x: 206, y: 106, w: 20, h: 22,
        text: 'A steel badge under the lapel: an hourglass in a cage, ringed CUSTODIAL AUTHORITY, EST. 2198.',
        note: 'Badge under his lapel: an hourglass in a cage. "Custodial Authority, est. 2198."' },
      { title: 'Folder', zoom: 'wardenFolder', x: 188, y: 188, w: 30, h: 40,
        text: 'A grey folder thick as a phone book, tabbed 0-1. A red band that means do not open, in any century.',
        note: 'Grey folder tabbed 0-1, with a red band.' },
      { title: 'Belt', zoom: 'wardenKeys', x: 260, y: 192, w: 20, h: 22,
        text: 'A ring of keys on his belt. Flat and smooth, not a tooth on any of them.',
        note: 'Keys with no teeth on his belt.' }
    ],
    opening: {
      name: [
        { who: 'warden', say: 'Hask. Warden, Custodial Authority, northern facility.' },
        { who: 'warden', say: 'You won\'t have heard of it. You won\'t for a long time.' },
        { note: ['warden', 'Warden T. Hask, Custodial Authority. "You won\'t have heard of it for a long time."'] }
      ],
      want: [
        { who: 'warden', say: 'I\'m here for a prisoner. The man upstairs. He\'s told you his name is Kane. It isn\'t.' },
        { narrate: 'He laid the grey folder on the counter and opened it to the first page.' },
        FILE,
        { who: 'warden', say: 'Prisoner 0-1. Escaped custody, year 2240.' },
        { who: 'warden', say: 'Kane builds the first machine tonight. Emit\'s here to make sure he never does.' },
        { learn: 'wardenFile' },
        { note: ['warden', 'Showed me his prisoner file: Prisoner 0-1, escaped custody, year 2240. The photo is the man upstairs.'] },
        { note: ['warden', '"Kane builds the first machine tonight. Emit\'s here to make sure he never does."'] },
        { note: ['scientist', 'The warden has his prisoner file. Prisoner 0-1, escaped 2240.'] }
      ],
      how: [
        { who: 'warden', say: 'The same way he did. Through the light.' },
        { who: 'warden', say: 'He came first. We\'ve been coming after him all night. You\'ve met some of us.' },
        { narrate: 'The man in plates. The engineer with the dash on his badge. I thought about the revolver, and how warm it had got.' },
        { note: ['warden', 'Came "through the light", like the others. They\'ve all been coming after the man upstairs.'] }
      ]
    },
    questions: [
      { id: 'list', ask: 'You\'re not on the list.', requires: 'saw:desk.list', steps: [
        { who: 'warden', say: 'No. He wrote that list. I\'d hardly expect to be on it.' },
        { note: ['warden', 'Says the man upstairs wrote the visitor list.'] }
      ] },
      { id: 'face', ask: 'You look like you\'ve done this before.', requires: 'saw:wardenFace', steps: [
        { who: 'warden', say: 'Many times. I have never once got past this desk.' },
        { who: 'warden', say: 'I don\'t hold that against you. You didn\'t know.' },
        { note: ['warden', 'Has tried many times. Never got past my desk.'] }
      ] },
      { id: 'insignia', ask: 'Custodial Authority?', requires: 'saw:wardenInsignia', steps: [
        { who: 'warden', say: 'Prisons. Once time can be travelled, you build your cells out of it.' },
        { who: 'warden', say: 'He is the only one who ever got out.' },
        { note: ['warden', 'The Authority builds prisons out of time. The man upstairs is the only one who ever escaped.'] }
      ] },
      { id: 'folder', ask: 'What else is in the file?', requires: 'saw:wardenFolder', steps: [
        FILE,
        { who: 'warden', say: 'Forty-one counts. Tampering with recorded history, mostly.' },
        { who: 'warden', say: 'He\'s been other people. A king, once, for eleven years that nobody remembers now.' },
        { narrate: 'I thought about the strangers tonight, from places and centuries that made no sense. All of them headed for the same lab.' },
        { learn: 'wardenFile' },
        { note: ['warden', 'Forty-one counts of tampering with history. He was a king once, for eleven years nobody remembers.'] }
      ] },
      { id: 'keys', ask: 'Those keys don\'t have teeth.', requires: 'saw:wardenKeys', steps: [
        { who: 'warden', say: 'The locks don\'t need them. They know whose hand it is.' },
        { note: ['warden', 'His keys have no teeth. "The locks know whose hand it is."'] }
      ] },
      { id: 'year', ask: '2240. His watch reads 12.03.40.', requires: 'sawWatch', steps: [
        { who: 'warden', say: 'Twelfth of March, twenty-two forty. The day he walked out.' },
        { who: 'warden', say: 'He kept it on. Of course he kept it on.' },
        { note: ['warden', 'The watch date 12.03.40 is the day he escaped: 12 March 2240.'] },
        { note: ['scientist', 'His watch isn\'t wrong. 12.03.40 is the day he escaped, in 2240.'] }
      ].concat(BRIEFING) },
      { id: 'emit', ask: 'His name is Emit.', requires: 'now:wantedPoster', steps: [
        { who: 'warden', say: 'So you\'ve seen the poster. Then you\'re further along than most.' }
      ].concat(BRIEFING) },
      { id: 'shot', ask: 'I shot him once. It didn\'t take.', requires: 'shotKane', steps: [
        { who: 'warden', say: 'Next time you need to get him to take his watch off before you shoot.' },
        { who: 'warden', say: 'It\'s the tether, you were close enough when it went off that you\'re in the loop with him. If you don\'t get that watch it won\'t matter what you do.' },
        { note: ['warden', 'Shooting him doesn\'t stick while he has the watch. It\'s the tether, and I\'m in the loop with him. Get the watch first.'] },
        { learn: 'knowsTether' }
      ] }
    ],
    actions: {
      letThrough: { steps: [
        { narrate: 'I sent him up. He thanked me, and took the stairs like a man who\'d walked a long way to climb them.' },
        { exit: 'walk' },
        { pause: 900 },
        { crt: ['CAM 03 LAB HALL', '> MOTION: 2', '> REC'] },
        { narrate: 'On the lab camera, the warden reached the end of the hall. A door opened an inch, and a face looked up into the lens. Right at me.' },
        { narrate: 'Emit saw him coming. The light came before the warden ever reached the door.' },
        { note: ['warden', 'Let him up. Emit saw him on the lab camera and pulled the night back before he could be caught.'] },
        { reset: 'Emit saw the warden coming on the lab camera.' }
      ] },
      turnAway: { steps: [
        { narrate: 'I told him I couldn\'t let him up. Not tonight.' },
        { who: 'warden', say: 'Then I\'ll wait.' },
        { who: 'warden', say: 'When it starts again, be where it starts.' },
        { exit: 'walk' },
        { narrate: 'He went out and stood under the awning, collar up, watching the doors like a man who could wait a very long time.' },
        { note: ['warden', 'Turned him away. "When it starts again, be where it starts." He\'s waiting outside.'] }
      ] },
      shoot: { steps: [
        { narrate: 'He saw my hand go to the drawer. He didn\'t reach for anything. He moved the folder aside, so it wouldn\'t get blood on it.' },
        { sfx: 'gunshot' },
        { exit: 'fall' },
        { backdrop: 'body' },
        { narrate: 'He was the only one all night who told me the truth, start to finish. I\'d shot him for it.' },
        { narrate: 'Upstairs, the man I\'d been calling Kane had one less person coming for him. I could almost hear him thank me.' },
        { note: ['warden', 'I shot the warden. Every word he said was true. Worst thing I did all night.'] },
        { learn: 'shotWarden' }
      ] },
      shutdown: { steps: [
        { narrate: 'I pointed the grey box at him. Nothing.' },
        { who: 'warden', say: 'That won\'t work on me, officer. I\'m not one of the machines. Just a man with a file.' },
        { note: ['warden', 'The device did nothing. "Just a man with a file."'] }
      ] }
    }
  };

  /* ======================================================================
   * Art. Lower half first (seen through the desk cut-out), then upper half.
   * ====================================================================== */
  var A = E.art.visitors, Z = E.art.zooms;
  var R = K.R, El = K.El, poly = K.poly, D = K.D;
  var legs = K.legs, torso = K.torso, armL = K.armL, armR = K.armR;

  // shoulders and chest of a coat; L is the lamp-lit side
  function jacket(L, Dk, x0, x1) {
    poly([[x0, 170], [x0 + 12, 110], [226, 98], [272, 98], [x1 - 12, 110], [x1, 170]], Dk);
    poly([[x0 + 6, 170], [x0 + 16, 112], [228, 100], [249, 100], [249, 170]], L);
  }
  function eyes(cy, brow) {
    R(238, cy, 7, 3, P.night0); R(253, cy, 7, 3, P.night0); R(240, cy, 2, 1, P.paper); R(255, cy, 2, 1, P.paper);
    R(237, cy - 4, 9, 1, brow); R(252, cy - 4, 9, 1, brow);
  }

  // Pruitt: thin tan suit, mustard tie, rain-plastered side parting, broken umbrella, typed folder
  A.insurance = function () {
    legs(P.plastic1, P.plastic0, 192);
    R(230, 204, 1, 50, P.plastic0); R(268, 204, 1, 50, P.night1);
    torso(P.plastic2, P.plastic1, 200);
    R(249, 164, 1, 36, P.plastic0); R(246, 174, 2, 2, P.night0); R(246, 188, 2, 2, P.night0);
    R(212, 186, 16, 1, P.plastic0); R(270, 186, 16, 1, P.plastic0);
    D(206, 164, 86, 36, P.plastic0, 1);
    armL(P.plastic2, P.paper, P.skinA1, P.skinA2);
    armR(P.plastic1, P.paper, P.skinA1, P.skinA2);
    // bandage on the left knuckle
    R(199, 202, 7, 3, P.paper); R(200, 203, 5, 1, P.paperShade);
    // broken umbrella hanging off the left wrist
    R(203, 210, 1, 6, P.night0);
    poly([[196, 216], [208, 214], [212, 240], [200, 246], [190, 238]], P.night1);
    R(197, 218, 1, 22, P.steel); R(204, 216, 1, 26, P.steel); R(192, 232, 6, 1, P.steel);
    R(199, 246, 2, 4, P.night0);
    // manila folder in the right hand, typed sheet poking out
    R(282, 192, 22, 30, P.card1); R(284, 189, 18, 6, P.paper);
    for (var l = 0; l < 5; l++) R(286, 197 + l * 4, 14 - (l % 2) * 3, 1, P.card0);
    El(287, 206, 4, 6, P.skinA1); El(286, 205, 2, 4, P.skinA2);

    // upper half: narrow shoulders, soaked
    poly([[194, 170], [204, 112], [228, 100], [270, 100], [294, 112], [304, 170]], P.plastic1);
    poly([[200, 170], [208, 114], [230, 102], [249, 102], [249, 170]], P.plastic2);
    D(196, 100, 108, 18, P.plastic0, 2);
    poly([[238, 100], [260, 100], [255, 168], [243, 168]], P.paper);
    poly([[246, 102], [252, 102], [253, 146], [249, 150], [245, 146]], P.lamp3);
    R(245, 102, 8, 4, P.wood3); R(244, 128, 10, 1, P.steel);
    R(248, 136, 2, 2, P.paper);
    // TV Guide folded in the breast pocket
    R(212, 120, 14, 2, P.plastic0); R(214, 114, 10, 7, P.paper); R(214, 114, 10, 2, P.red1); R(216, 118, 6, 1, P.paperDark);
    // face: long, plain, tired
    R(241, 86, 16, 16, P.skinA1);
    El(249, 66, 17, 23, P.skinA1); El(246, 65, 14, 20, P.skinA2); D(256, 50, 12, 38, P.skinA0, 2);
    eyes(64, P.hair0);
    R(242, 81, 14, 1, P.skinA0);
    R(248, 70, 2, 7, P.skinA1);
    // wet hair plastered flat, a hard side parting, a drip running off it
    El(249, 48, 18, 7, P.hair0); R(231, 46, 36, 6, P.hair0); R(231, 52, 4, 10, P.hair0); R(263, 52, 4, 8, P.hair0);
    R(238, 44, 1, 6, P.night0); R(242, 46, 14, 1, P.steel); R(252, 48, 10, 1, P.steel);
    R(232, 62, 1, 3, P.fog);
  };

  // Whitcombe: wide charcoal pinstripe, red tie, slicked silver hair, jowls, bursting briefcase
  A.lawyer = function () {
    legs(P.suit1, P.suit0, 190);
    for (var s = 0; s < 8; s++) R(216 + s * 9, 192, 1, 62, s < 4 ? P.suit2 : P.suit1);
    torso(P.suit1, P.suit0, 202);
    for (var t = 0; t < 9; t++) R(210 + t * 9, 164, 1, 38, t < 4 ? P.suit2 : P.suit1);
    R(249, 164, 1, 38, P.night0); R(246, 176, 2, 2, P.night0); R(246, 190, 2, 2, P.night0);
    armL(P.suit1, P.paper, P.skinA1, P.skinA2);
    armR(P.suit0, P.paper, P.skinA1, P.skinA2);
    R(198, 197, 3, 2, P.lamp4); R(296, 197, 3, 2, P.lamp3);
    // filing cover sheet in the left hand, a red RECEIVED stamp
    poly([[194, 196], [216, 194], [218, 224], [196, 226]], P.paper);
    R(198, 200, 14, 1, P.paperDark); R(198, 204, 12, 1, P.paperDark); R(199, 212, 10, 5, P.red1); R(200, 213, 8, 3, P.paper); R(201, 214, 6, 1, P.red1);
    El(205, 205, 5, 6, P.skinA1); El(204, 204, 3, 4, P.skinA2);
    // the briefcase, about to burst
    R(272, 196, 38, 34, P.wood1); R(272, 196, 38, 2, P.wood2); R(273, 198, 18, 30, P.wood2);
    poly([[274, 196], [280, 186], [290, 190], [298, 184], [306, 192], [308, 196]], P.paper);
    R(283, 188, 10, 1, P.paperDark); R(296, 190, 8, 1, P.paperShade);
    R(270, 206, 2, 14, P.paper); R(310, 210, 2, 10, P.paperShade);
    R(278, 197, 4, 3, P.lamp3); R(300, 197, 4, 3, P.lamp3);
    R(286, 190, 10, 2, P.wood0);
    El(291, 191, 4, 3, P.skinA1);

    // upper half: broad, heavy
    poly([[182, 170], [194, 108], [224, 96], [274, 96], [304, 108], [316, 170]], P.suit0);
    poly([[188, 170], [198, 110], [226, 98], [249, 98], [249, 170]], P.suit1);
    for (var u = 0; u < 7; u++) R(196 + u * 8, 112, 1, 58, P.suit2);
    for (var v = 0; v < 6; v++) R(258 + v * 8, 112, 1, 58, P.suit1);
    poly([[236, 98], [262, 98], [256, 150], [242, 150]], P.paper);
    poly([[226, 98], [240, 98], [249, 150], [234, 130]], P.suit0);
    poly([[272, 98], [258, 98], [249, 150], [264, 130]], P.night1);
    poly([[246, 100], [252, 100], [254, 146], [249, 152], [244, 146]], P.red1);
    R(245, 100, 8, 5, P.red0); El(250, 124, 3, 2, P.brown2);
    R(216, 118, 4, 4, P.lamp4); R(217, 119, 2, 2, P.lamp3);
    // heavy face, jowls
    R(239, 84, 20, 16, P.skinA1);
    El(249, 66, 20, 24, P.skinA1); El(246, 65, 17, 21, P.skinA2); D(258, 50, 14, 40, P.skinA0, 2);
    R(234, 78, 2, 8, P.skinA0); R(263, 78, 2, 8, P.skinA0);
    eyes(64, P.fog);
    R(238, 68, 6, 1, P.skinA0); R(254, 68, 6, 1, P.skinA0);
    R(242, 80, 14, 2, P.skinA0); R(244, 82, 10, 1, P.red0);
    // slicked silver hair, combed straight back
    El(249, 48, 21, 9, P.fog); R(229, 46, 6, 14, P.fog); R(263, 46, 6, 12, P.steel);
    for (var h = 0; h < 5; h++) R(236 + h * 6, 42, 1, 10, P.steel);
    R(229, 54, 4, 8, P.paper);
  };

  // Lindqvist: slate raincoat to the knee, blond, short beard, lanyard badge, umbrella, drawing tube
  A.engineer = function () {
    legs(P.night2, P.night1, 196);
    // raincoat skirts over the legs
    poly([[204, 164], [249, 164], [249, 242], [208, 242]], P.steel);
    poly([[249, 164], [294, 164], [290, 242], [249, 242]], P.night3);
    R(249, 164, 1, 78, P.night1); R(240, 164, 2, 78, P.night3);
    R(210, 190, 30, 3, P.night3); R(258, 190, 30, 3, P.night2); R(232, 190, 4, 3, P.fog);
    R(214, 210, 18, 1, P.night3); R(266, 210, 18, 1, P.night2);
    armL(P.steel, P.night3, P.skinA1, P.skinA2);
    armR(P.night3, P.night2, P.skinA1, P.skinA2);
    // furled umbrella in the left hand, tip on the floor
    R(195, 198, 2, 4, P.night0); poly([[194, 202], [200, 202], [198, 246], [196, 246]], P.night1);
    R(196, 204, 1, 30, P.night3); R(196, 246, 2, 6, P.steel);
    El(203, 206, 5, 6, P.skinA1); El(202, 205, 3, 4, P.skinA2);
    // drawing tube in the right hand
    R(286, 184, 12, 52, P.card1); R(286, 184, 12, 3, P.night1); R(294, 186, 4, 50, P.card0);
    R(289, 196, 2, 30, P.night1);
    El(292, 206, 6, 6, P.skinA1); El(291, 205, 4, 4, P.skinA2);

    // upper half: raincoat with wide lapels, open at the inside pocket
    jacket(P.steel, P.night3, 188, 310);
    poly([[238, 100], [260, 100], [256, 166], [242, 166]], P.shirt);
    poly([[226, 98], [240, 98], [246, 140], [232, 128]], P.fog);
    poly([[272, 98], [258, 98], [252, 140], [266, 128]], P.night2);
    // the inside pocket, gaping
    R(214, 124, 18, 18, P.night2); R(215, 125, 16, 16, P.night1);
    for (var q = 0; q < 4; q++) R(216 + q * 4, 127 + (q % 2) * 4, 2, 2, P.night2);
    // lanyard and badge
    R(244, 100, 1, 14, P.night0); R(256, 100, 1, 14, P.night0); R(244, 113, 13, 1, P.night0);
    R(258, 114, 14, 16, P.paper); R(260, 116, 5, 6, P.paperShade); R(266, 116, 5, 2, P.red0); R(266, 118, 5, 2, P.night3);
    R(260, 124, 10, 1, P.paperDark); R(260, 127, 8, 1, P.paperDark);
    // face, neat short beard, blond hair
    R(241, 86, 16, 16, P.skinA2);
    El(249, 66, 18, 22, P.skinA1); El(246, 65, 15, 19, P.skinA2); D(257, 52, 12, 34, P.skinA0, 2);
    eyes(64, P.lamp3);
    poly([[232, 70], [236, 84], [249, 92], [262, 84], [266, 70], [262, 78], [249, 82], [236, 78]], P.lamp3);
    R(243, 80, 12, 2, P.wood3);
    El(249, 48, 19, 9, P.lamp4); R(230, 46, 8, 12, P.lamp4); R(260, 46, 8, 12, P.lamp3);
    R(236, 42, 20, 2, P.paper); D(252, 40, 16, 12, P.lamp3, 2);
  };

  // Future You: grey guard uniform, cap, older Lou, scar on the left hand, thermos, later patch
  A.futureyou = function () {
    legs(P.suit1, P.suit0, 190);
    R(230, 204, 1, 50, P.suit0); R(268, 204, 1, 50, P.night1);
    torso(P.suit2, P.suit1, 194);
    R(249, 164, 1, 30, P.suit0); R(246, 172, 2, 2, P.night0); R(246, 182, 2, 2, P.night0);
    // duty belt, flashlight, keys
    R(208, 188, 82, 6, P.night0); R(244, 189, 10, 4, P.steel); R(245, 190, 8, 2, P.night1);
    R(216, 186, 6, 18, P.night1); R(216, 186, 6, 2, P.steel);
    R(270, 194, 1, 6, P.steel); R(268, 200, 2, 6, P.steel); R(271, 200, 2, 5, P.lamp3);
    armL(P.suit2, P.suit1, P.skinA1, P.skinA2);
    armR(P.suit1, P.suit0, P.skinA1, P.skinA2);
    // the scar: a white hook on the back of the left hand
    R(200, 203, 6, 1, P.paperShade); R(205, 204, 1, 2, P.paperShade); R(199, 202, 1, 2, P.paperShade);
    // steel thermos in the right hand, dent in the lid
    R(287, 190, 12, 34, P.steel); R(287, 190, 12, 5, P.fog); R(295, 192, 4, 32, P.night3);
    R(290, 191, 3, 2, P.night3); R(287, 208, 12, 1, P.night3);
    El(290, 206, 5, 6, P.skinA1); El(289, 205, 3, 4, P.skinA2);

    // upper half: uniform shirt with epaulettes, patch, badge
    jacket(P.suit2, P.suit1, 190, 308);
    R(204, 104, 22, 4, P.suit1); R(272, 104, 22, 4, P.suit0);
    poly([[240, 100], [258, 100], [249, 116]], P.suit0);
    R(248, 116, 2, 54, P.suit0); [124, 138, 152].forEach(function (y) { R(247, y, 3, 3, P.steel); });
    R(222, 124, 16, 10, P.suit1); R(262, 132, 16, 10, P.suit0);
    // shoulder patch: later logo, ring like a crown
    El(203, 114, 7, 7, P.night1); El(203, 114, 5, 5, P.suit2); El(203, 115, 2, 2, P.lamp3);
    R(198, 108, 10, 1, P.lamp3); R(199, 106, 1, 2, P.lamp3); R(203, 105, 1, 3, P.lamp3); R(207, 106, 1, 2, P.lamp3);
    // badge 4471
    poly([[266, 116], [276, 116], [276, 124], [271, 128], [266, 124]], P.lamp3); R(268, 118, 6, 4, P.lamp4);
    // older face: lines, grey stubble
    R(241, 86, 16, 16, P.skinA1);
    El(249, 68, 18, 22, P.skinA1); El(246, 67, 15, 19, P.skinA2); D(257, 54, 12, 34, P.skinA0, 2);
    eyes(66, P.fog);
    R(236, 72, 8, 1, P.skinA0); R(254, 72, 8, 1, P.skinA0); R(236, 60, 3, 1, P.skinA0);
    R(243, 82, 12, 1, P.skinA0);
    D(236, 76, 26, 12, P.fog, 1);
    R(231, 58, 4, 12, P.fog); R(263, 58, 4, 12, P.steel);
    // security cap
    El(249, 48, 20, 9, P.night1); R(229, 50, 40, 6, P.night1); R(226, 55, 46, 3, P.night0);
    R(245, 44, 8, 6, P.lamp3); R(246, 45, 6, 4, P.lamp4); D(254, 40, 14, 14, P.night0, 1);
  };

  // Warden: tall, very broad, long black coat, collar up, white crew cut, folder with a red band
  A.warden = function () {
    legs(P.night2, P.night1, 196);
    poly([[200, 164], [249, 164], [249, 250], [204, 250]], P.night2);
    poly([[249, 164], [298, 164], [294, 250], [249, 250]], P.night1);
    R(249, 164, 1, 86, P.night0); R(244, 164, 1, 86, P.night3);
    R(206, 194, 40, 4, P.night1); R(252, 194, 42, 4, P.night0); R(240, 194, 6, 4, P.steel);
    [172, 184, 206].forEach(function (y) { R(252, y, 3, 3, P.steel); });
    // keys with no teeth on the belt
    R(268, 194, 1, 4, P.steel); El(269, 200, 3, 3, P.steel); El(269, 200, 1, 1, P.night1);
    R(265, 202, 2, 8, P.fog); R(269, 203, 2, 8, P.steel); R(273, 202, 2, 7, P.fog);
    armL(P.night2, P.night1, P.night1, P.night3);
    armR(P.night1, P.night0, P.night1, P.night3);
    // grey folder with a red band in the left hand
    R(190, 192, 26, 34, P.steel); R(190, 192, 26, 2, P.fog); R(192, 194, 22, 30, P.fog);
    R(190, 206, 26, 4, P.red1); R(208, 188, 8, 5, P.fog);
    R(195, 198, 14, 1, P.steel); R(195, 216, 12, 1, P.steel);
    El(204, 214, 5, 6, P.night1); El(203, 213, 3, 4, P.night3);

    // upper half: huge shoulders, collar turned up
    poly([[180, 170], [192, 104], [222, 92], [276, 92], [306, 104], [318, 170]], P.night1);
    poly([[186, 170], [196, 106], [224, 94], [249, 94], [249, 170]], P.night2);
    poly([[240, 98], [258, 98], [254, 170], [244, 170]], P.night0);
    R(246, 100, 6, 70, P.suit1);
    // lapel turned back on the left: the insignia under it
    poly([[224, 96], [240, 98], [230, 138], [212, 126]], P.night3);
    poly([[208, 110], [222, 108], [226, 124], [212, 128]], P.night0);
    El(216, 117, 4, 4, P.steel); R(215, 114, 3, 1, P.fog); R(216, 115, 1, 5, P.fog); R(215, 119, 3, 1, P.fog);
    poly([[274, 96], [258, 98], [268, 138], [286, 126]], P.night0);
    // high collar
    poly([[226, 98], [234, 80], [240, 98]], P.night2);
    poly([[272, 98], [264, 80], [258, 98]], P.night1);
    // head set higher: a tall man
    R(241, 82, 16, 16, P.skinA1);
    El(249, 60, 18, 22, P.skinA1); El(246, 59, 15, 19, P.skinA2); D(257, 46, 12, 34, P.skinA0, 2);
    R(238, 58, 7, 2, P.night0); R(253, 58, 7, 2, P.night0); R(240, 58, 2, 1, P.fog); R(255, 58, 2, 1, P.fog);
    R(236, 54, 10, 2, P.fog); R(252, 54, 10, 2, P.paperShade);
    R(243, 76, 12, 1, P.skinA0); R(236, 66, 1, 8, P.skinA0); R(262, 66, 1, 8, P.skinA0);
    // white crew cut
    El(249, 42, 18, 6, P.paper); R(231, 42, 36, 5, P.paper); D(250, 38, 16, 10, P.paperShade, 2);
    R(231, 47, 3, 6, P.paperShade); R(264, 47, 3, 6, P.fog);
  };

  /* ---------------- close-ups (32x24) ---------------- */
  function f(z, x, y, w, h, c) { K.fill(z, x, y, w, h, c); }

  // the man upstairs, clean-shaven, in a prison collar (the poster and the warden's file)
  function mugshot(z, x, y) {
    f(z, x, y, 11, 12, P.paperShade);
    K.on(z, function () {
      El(x + 5, y + 3, 5, 3, P.fog); R(x, y + 2, 2, 5, P.fog); R(x + 9, y + 2, 2, 5, P.fog);
      El(x + 5, y + 6, 3, 4, P.skinA2);
    });
    f(z, x + 3, y + 5, 2, 2, P.night0); f(z, x + 6, y + 5, 2, 2, P.night0); f(z, x + 5, y + 5, 1, 1, P.night0);
    f(z, x + 4, y + 9, 3, 1, P.skinA0);
    f(z, x + 1, y + 10, 9, 2, P.steel); f(z, x + 2, y + 10, 7, 1, P.fog);
  }

  // Pruitt
  Z.insuranceGuide = function (z) {
    f(z, 0, 0, 32, 24, P.plastic1);
    f(z, 0, 18, 32, 6, P.plastic0);
    f(z, 6, 2, 20, 18, P.paper); f(z, 6, 2, 20, 4, P.red1); f(z, 8, 3, 8, 2, P.paper);
    [8, 11, 14].forEach(function (y) { f(z, 8, y, 16, 1, P.paperShade); });
    K.on(z, function () { K.digits('9', 9, 10, P.night0); });
    f(z, 7, 9, 16, 1, P.shirt); f(z, 7, 15, 16, 1, P.shirt); f(z, 7, 9, 1, 7, P.shirt); f(z, 22, 9, 1, 7, P.shirt);
  };
  Z.insuranceTie = function (z) {
    f(z, 0, 0, 32, 24, P.paper);
    f(z, 11, 0, 10, 24, P.lamp3); f(z, 18, 0, 3, 24, P.wood3);
    f(z, 6, 8, 20, 2, P.steel); f(z, 6, 8, 20, 1, P.fog);
    f(z, 14, 15, 4, 4, P.paper); f(z, 15, 13, 2, 2, P.paper); f(z, 15, 14, 2, 1, P.lamp4); f(z, 13, 19, 6, 1, P.shirt);
  };
  Z.insurancePolicy = function (z) {
    f(z, 0, 0, 32, 24, P.card1);
    f(z, 3, 1, 26, 22, P.paper);
    f(z, 5, 3, 12, 1, P.night0);
    [6, 8, 10].forEach(function (y) { f(z, 5, y, 20, 1, P.paperDark); });
    K.on(z, function () { K.digits('54', 5, 13, P.night0); K.digits('55', 16, 13, P.night0); });
    f(z, 20, 13, 1, 2, P.night0); f(z, 24, 13, 1, 2, P.night0); f(z, 25, 13, 1, 2, P.night0);
    f(z, 5, 20, 10, 1, P.paperDark); f(z, 18, 20, 8, 1, P.night0);
  };
  Z.insuranceHand = function (z) {
    f(z, 0, 0, 32, 24, P.plastic1);
    f(z, 0, 0, 32, 5, P.paper);
    K.on(z, function () { El(16, 15, 15, 9, P.skinA1); El(14, 13, 11, 6, P.skinA2); });
    f(z, 8, 10, 14, 6, P.paper); f(z, 8, 10, 14, 1, P.paperShade); f(z, 12, 12, 6, 2, P.paperShade);
    f(z, 8, 10, 1, 1, P.plastic1); f(z, 21, 15, 1, 1, P.skinA2);
    f(z, 22, 12, 4, 1, P.red1);
  };
  Z.insuranceUmbrella = function (z) {
    f(z, 0, 0, 32, 24, P.night1);
    K.on(z, function () { poly([[4, 6], [26, 2], [30, 16], [10, 22]], P.night0); });
    f(z, 6, 8, 1, 12, P.steel); f(z, 14, 4, 1, 16, P.steel); f(z, 22, 3, 1, 9, P.steel); f(z, 22, 12, 6, 1, P.steel); f(z, 6, 20, 5, 1, P.steel);
    f(z, 18, 18, 2, 6, P.wood2);
    [[3, 12], [9, 22], [28, 18], [24, 22]].forEach(function (d) { f(z, d[0], d[1], 1, 2, P.fog); });
  };

  // Whitcombe
  Z.lawyerCase = function (z) {
    f(z, 0, 0, 32, 24, P.night1);
    f(z, 2, 8, 28, 16, P.wood1); f(z, 2, 8, 28, 2, P.wood2); f(z, 3, 10, 13, 14, P.wood2);
    K.on(z, function () { poly([[3, 9], [7, 1], [14, 4], [20, 0], [29, 5], [29, 9]], P.paper); });
    f(z, 8, 4, 8, 1, P.night0); f(z, 18, 3, 8, 1, P.paperDark); f(z, 8, 6, 12, 1, P.paperDark);
    f(z, 6, 9, 3, 3, P.lamp3); f(z, 23, 9, 3, 3, P.lamp3);
    f(z, 0, 14, 3, 6, P.paper);
  };
  Z.lawyerFiling = function (z) {
    f(z, 0, 0, 32, 24, P.suit1);
    f(z, 3, 1, 26, 22, P.paper);
    [4, 6, 8].forEach(function (y) { f(z, 6, y, 18, 1, P.paperDark); });
    f(z, 6, 11, 20, 9, P.red1); f(z, 7, 12, 18, 7, P.paper);
    f(z, 8, 13, 14, 1, P.red1);
    K.on(z, function () { K.digits('10.13', 8, 15, P.red1); });
  };
  Z.lawyerPin = function (z) {
    f(z, 0, 0, 32, 24, P.suit1);
    for (var i = 0; i < 32; i += 5) f(z, i, 0, 1, 24, P.suit2);
    K.on(z, function () { El(16, 12, 8, 8, P.lamp3); El(16, 12, 6, 6, P.lamp4); });
    f(z, 15, 7, 2, 10, P.wood2); f(z, 11, 9, 10, 1, P.wood2);
    f(z, 10, 10, 3, 3, P.wood2); f(z, 19, 10, 3, 3, P.wood2); f(z, 13, 16, 6, 1, P.wood2);
  };
  Z.lawyerTie = function (z) {
    f(z, 0, 0, 32, 24, P.paper);
    f(z, 0, 0, 7, 24, P.suit1); f(z, 25, 0, 7, 24, P.suit0);
    f(z, 10, 0, 12, 24, P.red1); f(z, 18, 0, 4, 24, P.red0);
    K.on(z, function () { El(15, 12, 4, 3, P.brown2); D(11, 8, 10, 10, P.brown1, 1); });
    f(z, 12, 20, 6, 1, P.red0);
  };

  // Lindqvist
  Z.engineerBadge = function (z) {
    f(z, 0, 0, 32, 24, P.night3);
    f(z, 4, 1, 24, 22, P.paper);
    // KESSLER (red) and SCIENCE (slate), joined by a dash
    f(z, 6, 3, 9, 3, P.red0); f(z, 15, 4, 2, 1, P.night0); f(z, 17, 3, 9, 3, P.night3);
    f(z, 6, 8, 8, 10, P.paperShade);
    K.on(z, function () { El(10, 12, 3, 4, P.skinA2); El(10, 9, 3, 2, P.lamp4); });
    f(z, 8, 15, 5, 3, P.lamp3);
    f(z, 16, 9, 10, 1, P.paperDark); f(z, 16, 12, 8, 1, P.paperDark); f(z, 16, 15, 9, 1, P.paperDark);
    f(z, 6, 20, 20, 1, P.night0);
  };
  Z.engineerCoat = function (z) {
    f(z, 0, 0, 32, 24, P.steel);
    f(z, 4, 4, 24, 18, P.night2);
    for (var y = 0; y < 4; y++) for (var x = 0; x < 6; x++) f(z, 5 + x * 4 + (y % 2) * 2, 6 + y * 4, 1, 1, P.night3);
    f(z, 4, 4, 24, 1, P.fog); f(z, 4, 21, 24, 1, P.night1);
  };
  Z.engineerUmbrella = function (z) {
    f(z, 0, 0, 32, 24, P.night1);
    K.on(z, function () { poly([[12, 0], [20, 0], [18, 24], [14, 24]], P.night0); });
    f(z, 15, 0, 1, 24, P.night3); f(z, 13, 6, 6, 1, P.steel);
    [[10, 4], [21, 9], [11, 15], [20, 20]].forEach(function (d) { f(z, d[0], d[1], 1, 2, P.fog); });
  };
  Z.engineerTube = function (z) {
    f(z, 0, 0, 32, 24, P.night3);
    f(z, 8, 0, 16, 24, P.card1); f(z, 20, 0, 4, 24, P.card0); f(z, 8, 0, 16, 3, P.night1);
    [5, 9, 13, 17].forEach(function (y) { f(z, 12, y, 6, 2, P.night1); });
    f(z, 8, 21, 16, 1, P.card0);
  };
  // THE wanted poster: future plastic with a cyan border, the face of the man upstairs
  Z.wantedPoster = function (z) {
    f(z, 0, 0, 32, 24, P.wood1);
    f(z, 1, 1, 30, 22, P.fut1); f(z, 2, 2, 28, 20, P.fut0);
    f(z, 3, 3, 26, 18, P.paper);
    f(z, 3, 3, 26, 3, P.red1); f(z, 5, 4, 14, 1, P.paper);
    mugshot(z, 3, 7);
    f(z, 15, 7, 12, 1, P.night0);
    K.on(z, function () { K.digits('0', 15, 9, P.night0); K.digits('1', 21, 9, P.night0); K.digits('2240', 14, 15, P.red0); });
    f(z, 19, 11, 1, 1, P.night0);
    f(z, 1, 1, 2, 1, P.fut2); f(z, 29, 22, 2, 1, P.fut2);
  };

  // Future You
  Z.futureyouFace = function (z) {
    f(z, 0, 0, 32, 24, P.night2);
    K.on(z, function () { El(16, 14, 12, 12, P.skinA1); El(14, 13, 10, 10, P.skinA2); });
    f(z, 4, 0, 24, 5, P.night1); f(z, 2, 5, 28, 2, P.night0); f(z, 13, 1, 6, 3, P.lamp3);
    f(z, 8, 10, 5, 2, P.night0); f(z, 19, 10, 5, 2, P.night0);
    f(z, 7, 13, 6, 1, P.skinA0); f(z, 19, 13, 6, 1, P.skinA0); f(z, 6, 8, 2, 6, P.fog); f(z, 24, 8, 2, 6, P.fog);
    f(z, 12, 19, 8, 1, P.skinA0);
    K.on(z, function () { D(6, 16, 20, 8, P.fog, 1); });
  };
  Z.futureyouPatch = function (z) {
    f(z, 0, 0, 32, 24, P.suit2);
    K.on(z, function () { El(16, 13, 10, 9, P.night1); El(16, 13, 8, 7, P.suit2); El(16, 13, 6, 3, P.lamp3); El(16, 13, 2, 6, P.lamp3); El(16, 13, 1, 1, P.lamp4); });
    f(z, 8, 2, 16, 1, P.lamp4); f(z, 8, 0, 1, 3, P.lamp4); f(z, 12, 0, 1, 3, P.lamp4); f(z, 16, 0, 1, 3, P.lamp4); f(z, 20, 0, 1, 3, P.lamp4); f(z, 23, 0, 1, 3, P.lamp4);
  };
  Z.futureyouBadge = function (z) {
    f(z, 0, 0, 32, 24, P.suit2);
    K.on(z, function () { poly([[7, 2], [25, 2], [25, 15], [16, 22], [7, 15]], P.lamp3); poly([[9, 4], [23, 4], [23, 14], [16, 20], [9, 14]], P.lamp4); });
    K.on(z, function () { K.digits('4471', 9, 9, P.wood1); });
    f(z, 10, 5, 3, 2, P.lamp3); f(z, 20, 15, 2, 2, P.lamp3);
  };
  Z.futureyouScar = function (z) {
    f(z, 0, 0, 32, 24, P.suit1);
    K.on(z, function () { El(16, 13, 15, 10, P.skinA1); El(14, 11, 11, 7, P.skinA2); });
    f(z, 6, 12, 14, 1, P.paper); f(z, 20, 13, 1, 3, P.paper); f(z, 18, 16, 2, 1, P.paper); f(z, 6, 13, 13, 1, P.paperShade);
    [[8, 7], [14, 6], [22, 8]].forEach(function (k) { f(z, k[0], k[1], 3, 1, P.skinA0); });
  };
  Z.futureyouThermos = function (z) {
    f(z, 0, 0, 32, 24, P.suit0);
    f(z, 9, 0, 14, 24, P.steel); f(z, 19, 0, 4, 24, P.night3); f(z, 10, 0, 3, 24, P.fog);
    f(z, 8, 0, 16, 6, P.fog); f(z, 8, 5, 16, 1, P.night3);
    f(z, 13, 1, 5, 2, P.night3); f(z, 14, 3, 3, 1, P.steel);
    f(z, 9, 14, 14, 1, P.night3);
  };

  // Warden
  Z.wardenFace = function (z) {
    f(z, 0, 0, 32, 24, P.night1);
    K.on(z, function () { El(16, 14, 11, 12, P.skinA1); El(14, 13, 9, 10, P.skinA2); El(16, 3, 11, 4, P.paper); });
    f(z, 8, 10, 5, 2, P.night0); f(z, 19, 10, 5, 2, P.night0); f(z, 9, 10, 1, 1, P.fog); f(z, 20, 10, 1, 1, P.fog);
    f(z, 7, 8, 7, 1, P.paperShade); f(z, 18, 8, 7, 1, P.paperShade);
    f(z, 12, 19, 8, 1, P.skinA0);
    f(z, 0, 18, 6, 6, P.night2); f(z, 26, 18, 6, 6, P.night2);
  };
  Z.wardenInsignia = function (z) {
    f(z, 0, 0, 32, 24, P.night2);
    f(z, 0, 0, 10, 24, P.night3);
    K.on(z, function () { El(18, 12, 9, 9, P.steel); El(18, 12, 7, 7, P.night1); });
    f(z, 14, 6, 9, 1, P.fog); f(z, 14, 17, 9, 1, P.fog);
    f(z, 15, 7, 7, 2, P.paperShade); f(z, 17, 9, 3, 2, P.paperShade); f(z, 18, 11, 1, 2, P.paperShade);
    f(z, 17, 13, 3, 2, P.paperShade); f(z, 15, 15, 7, 2, P.paperShade);
    [13, 16, 19, 22].forEach(function (x) { f(z, x, 5, 1, 14, P.steel); });
  };
  Z.wardenFolder = function (z) {
    f(z, 0, 0, 32, 24, P.night1);
    f(z, 3, 4, 26, 19, P.steel); f(z, 4, 5, 24, 17, P.fog);
    f(z, 18, 0, 10, 5, P.fog);
    K.on(z, function () { K.digits('0', 19, 0, P.night0); K.digits('1', 24, 0, P.night0); });
    f(z, 23, 2, 1, 1, P.night0);
    f(z, 3, 12, 26, 4, P.red1); f(z, 3, 12, 26, 1, P.red0);
    f(z, 7, 8, 12, 1, P.steel); f(z, 7, 19, 10, 1, P.steel);
  };
  Z.wardenKeys = function (z) {
    f(z, 0, 0, 32, 24, P.night1);
    f(z, 0, 2, 32, 4, P.night0); f(z, 14, 2, 4, 4, P.steel);
    K.on(z, function () { El(16, 10, 4, 3, P.steel); El(16, 10, 2, 1, P.night1); });
    f(z, 9, 12, 3, 11, P.fog); f(z, 15, 13, 3, 11, P.steel); f(z, 21, 12, 3, 10, P.fog);
    f(z, 10, 12, 1, 10, P.paper); f(z, 22, 12, 1, 9, P.paper);
  };
  Z.wardenFile = function (z) {
    f(z, 0, 0, 32, 24, P.steel);
    f(z, 1, 1, 30, 22, P.fog);
    f(z, 3, 2, 26, 20, P.paper);
    f(z, 3, 2, 26, 2, P.night1);
    mugshot(z, 4, 4);
    K.on(z, function () { K.digits('0', 17, 5, P.night0); K.digits('1', 23, 5, P.night0); K.digits('2240', 14, 16, P.night0); });
    f(z, 21, 7, 1, 1, P.night0);
    f(z, 17, 12, 10, 1, P.paperDark);
    f(z, 5, 21, 22, 1, P.red1);
  };
})();
