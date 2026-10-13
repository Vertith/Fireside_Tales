# Writing a visitor for Emit Time (brief for the full-game build)

You are adding visitors to a finished engine. Read these first:
- `/mnt/project-files/game/README.md` (step reference, questions rule, inspection)
- `/mnt/project-files/game/js/content/demo-visitors.js` (four complete visitors: copy this shape)
- `/mnt/project-files/game/js/art.js` (look at `visitors.pizza`, `visitors.android`, `visitors.reporter`, and the `zooms` block, then the `kit` near the bottom)
- `/mnt/project-files/story/visitor-tells.md` (your visitors' cover story, tells, lies) and `/mnt/project-files/story/story-bible.md` (canon). Both are read-only.

## Hard rules
- Only write your own file, `js/content/<your batch>.js`. Never edit any other file. If you think the engine needs a change, say so in your final report instead.
- Classic script, no modules, no build step. Wrap everything in `(function () { ... })();`.
- Don't run `tools/bundle.py`. Test by loading `file:///mnt/project-files/game/index.html` (it loads every js file directly).
- Every visitor opens with the same three questions (Adam's rule). You answer them in `opening: { name: [...], want: [...], how: [...] }`. Every other question must have `requires`: `'saw:<zoomKey>'` (unlocked by inspecting that spot), `'saw:desk.list'` (after reading the visitor list), a memory flag learned on an EARLIER loop (`'heardBriefing'`, `'heardKessler'` ...), or `'now:<flag>'` (learned any time, including earlier tonight).
- Each visitor has 3 to 5 inspect spots, each with its own 32x24 zoom drawing. Zoom keys are global, so prefix them with the visitor id in camelCase, no dots: `sisterBag`, `monkSandals`.
- The real tell must be the same size and weight as the ordinary details around it. Red herrings mirror real tells.
- Legit visitors never get their era wrong. They can be rude, evasive or wrong about trivia. Only intruders slip on era facts (prices, tech, slang, dates).
- Keep the 90s vague: never name a year for the present. Prices loosely mid-90s.
- Future cyan (`P.fut0/1/2`) only ever appears on future tech, never on 90s people or legit visitors.
- Voice: the guard narrates in short, soft-noir first person, dry wit, no parody. Visitor lines short (they show in a small speech bubble, about 110 characters max per line; split longer speech into several steps).

## Shared facts (keep consistent across batches)
- The guard: Lou Brennan, six years on the night desk, badge number 4471. Regulars (janitor, real staff) call him Lou. Intruders don't know his name, except Future You.
- The man who calls himself Dr. Aldous Kane (really Emit, never named before act 4's wanted poster): tall, wild grey hair, glasses, lab coat.
- The real Dr. Aldous Kane: short, bald, grey moustache, in his fifties. Childhood nickname "Dusty". Hometown Marlow, Ohio. Birthday in March. Sister: Ellen Dobbs. Mother: Irene Kane. He's reclusive; Lou has never met him face to face.
- Science Corp has no kitchen; everyone orders out (the pizza driver says so, flag `heardNoKitchen`).
- Kessler Dynamics is Science Corp's rival company. The MIT researcher and the investor each mention Kessler as a rival: they must `learn: 'heardKessler'`. A merged "Kessler–Science" company does not exist yet.
- Desk tools that exist: the visitor list (clipboard), the guard's notebook, inspection, the drawer (revolver) and, from act three, Kane's grey shutdown device. There is no working phone, Rolodex or sign-in sheet as a tool, but lines can mention them as narration.
- Visitor list names already on the clipboard (use these exact names): R. Halloway (Dept. of Energy), Dr. S. Okafor (MIT), M. Thorne (Science Corp board, investor), Lt. Col. D. Brandt (Defense liaison), J. Whitcombe (Whitcombe & Lyle, patent counsel), A. Reyes (Office of Sen. Marsh), C. Vance (Channel 7). Add rows for your on-list visitors with `E.content.visitorList.push({ name, org, seeing })`.
- Night times (night.js adds the clock; use these in dialogue if you mention the time): pizza 10:52 PM, gent 11:06, sister 11:20, courier 11:34, janitor 11:48, influencer 12:02 AM, doe 12:18, victorian 12:30, reporter 12:44, intern 12:58, monk 1:10, mit 1:24, soldier 1:38, liaison 1:52, hippie 2:04, viking 2:18, (device handover 2:30), android 2:44, wife 2:58, professor 3:10, roman 3:24, investor 3:36, foodinspector 3:50, aide 4:02, robot 4:16, dotcom 4:28, mother 4:40, (hold them off 4:52), insurance 5:04, lawyer 5:16, engineer 5:28, futureyou 5:40, warden 5:52, (the pitch 6:04).
- Memory flags other batches rely on (set them exactly): `heardKessler` (MIT researcher, investor), `wantedPoster` (engineer), `wardenFile` (warden), `realKaneDescribed` (sister's or mother's description of the real Kane), `metSister`. Existing ones you can require: `heardBriefing`, `sawWatch`, `shotKane`, `stoppedAndroid`, `heardNoKitchen`.

## File shape
```js
(function () {
  var E = window.EMIT, C = E.content.characters, V = E.content.visitors, K = E.art.kit, P = K.P;

  C.sister = { name: 'Ellen Dobbs', notebookName: 'Ellen Dobbs, Kane\'s sister', portrait: 'sister' };

  V.sister = {
    id: 'sister',
    truth: 'legit',                 // 'legit' | 'intruder' | 'android'
    prompt: 'One line of narration shown while you decide.',
    arrive: [                       // night.js adds the clock before these
      { crt: ['CAM 01 LOBBY', '> MOTION: 1', '> REC'] },
      { narrate: 'How they come in.' },
      { sfx: 'door' },
      { enter: 'sister' }
    ],
    greeting: [ { who: 'sister', say: '...' } ],
    inspect: [ { title: 'Lunch bag', zoom: 'sisterBag', x: 200, y: 196, w: 22, h: 24, text: 'Close-up text', note: 'Notebook line' } ],
    opening: { name: [...], want: [...], how: [...] },
    questions: [ { id: 'bag', ask: '...', requires: 'saw:sisterBag', steps: [...] } ],
    actions: { letThrough: { steps: [...] }, turnAway: { steps: [...] }, shoot: { steps: [...] } }
    // optional: returnArrive, returnGreeting (legit guests come back angry 3 slots after being
    //           turned away; turning them away again resets), secondTurnAway, comesBackAs: 'otherVisitorId'
  };

  E.art.visitors.sister = function () { /* lower half first, then upper half; see art.js visitors */ };
  E.art.zooms.sisterBag = function (z) { K.fill(z, 0, 0, 32, 24, P.paper); K.on(z, function () { K.El(16, 12, 6, 6, P.brown1); }); };
})();
```

### Actions
- Defaults exist for every action (engine `defaultOutcome`), but write custom `letThrough`, `turnAway` and `shoot` for each visitor so the lines fit.
- Wrong calls end with `{ reset: 'Short reason the player sees.' }` (letting an intruder or android through, shooting a legit visitor, shooting an android).
- Shooting an intruder: `{ sfx: 'gunshot' }, { exit: 'fall' }, { backdrop: 'body' }`, a line, a note. night.js mops up before the next visitor.
- Androids: `shutdown` is correct: `{ sfx: 'shutdown' }, { exit: 'fall' }`, lines, note. Shooting an android resets.
- The device on a person does nothing and the desk carries on automatically; a custom `shutdown` line for legit visitors is a nice touch, not required.
- Leaving: `{ exit: 'walk' }`.
- Always add `{ note: [id, 'text'] }` lines so the notebook fills.

### Art
- 480x270 canvas. The visitor stands centred on x≈249, head at y≈40–90, shoulders y≈100, chest to the counter at y=166. A cut-out in the desk (x 182–314, y 166–246) shows them from the waist down, so draw down to y≈252: torso to a hem at y≈190–200, arms hanging with hands at about (204,205) and (294,205), trousers or a skirt below. Use `K.legs`, `K.torso`, `K.armL`, `K.armR` like the existing visitors. Draw the lower half first, then the upper half.
- Things to inspect at waist level (belts, hands, bags) must sit inside x 182–314, y 166–246.
- Left halves are lamp-lit (lighter ramp colour), right halves darker. Use only palette colours from `K.P`. `K.D` dithers, `K.El` ellipses, `K.poly` polygons.
- Make each visitor read differently at a glance: silhouette, hair, hat, colour.

### Testing (required)
Use Playwright (installed globally; run with `NODE_PATH=$(npm root -g) node yourscript.js`, Chromium is preinstalled, never run `playwright install`). Write scripts in your own scratch directory, not in the project folder. A good loop:
1. `await page.goto('file:///mnt/project-files/game/index.html')`, clear localStorage, reload.
2. `await page.evaluate(() => { document.getElementById('title-overlay').hidden = true; EMIT.game.start('at:<id>'); })`
3. Click `#btn-next` until `#pad` is visible (click `#act-overlay` if it shows). Screenshot at 1280x860 and look at it with the Read tool. Click every `.hot` spot and check the matching questions appear, tagged NOTICED. Try each action (`.stamp.letThrough`, `.stamp.turnAway`, `.stamp.shoot` then `.stamp.armed`, `.stamp.shutdown`) in fresh runs and check resets happen only where they should.
4. Zero console errors.

Report back: the visitors you wrote, the right call for each, any flags you set, and anything you think the engine needs.
