# Emit Time — Visitor Tells and Lies

**Status:** First pass (13 Oct 2026), drafted from Adam's direction: *difficulty comes from small visual tells and from the lies visitors tell in dialogue.* Adam will fine-tune once a full playthrough exists. Everything here is a starting point.
**Builds on:** [story-bible.md](story-bible.md) sections 3, 4 and 6 (roster numbers match the bible's), and the art style guide at [../art/style-guide.md](../art/style-guide.md).

---

## 1. How difficulty works

Two dials set how hard a visitor is. Colour is not one of them.

1. **How small the visual tell is.** It can be visible at a glance, it can be something you have to look for, it can show only in the close-up zoom, or there can be none at all.
2. **How well the lie holds up.** It can collapse on the first question, survive until you cross-check it against something on the desk, stay consistent with itself and only contradict another visitor or document, or only be catchable with knowledge from an earlier loop.

Each tier is also an **act** of the shift: the tutorial is the prologue, and tiers 1–4 are acts 1–4.

| Tier | Slots | Visual tell | The lie | What the player needs |
|---|---|---|---|---|
| **0 — Tutorial** | Opening | Unmissable | None; he says what he wants | Nothing |
| **1 — Obvious** | 1–6 | Visible at a glance | Slips on the first or second question (wrong slang, wrong tech, wrong price) | Ears and eyes |
| **2 — Cross-check** | 7–15 | Small, you have to look | Sounds fine, but contradicts the visitor list, a document, the calendar or a phone call | The desk tools |
| **3 — Subtle** | 16–25 | Only in the zoom | Consistent on its own; contradicts something another visitor said, or a detail on paperwork | Memory within the shift |
| **4 — Loop knowledge** | 26–30 | None, or one you only know to look for from a past loop | Airtight on loop 1. Built to fool first-timers (bible: "designed failure points") | Something learned in an earlier loop |

### The rules that keep it fair

- **Every intruder has at least one visual tell and at least one dialogue lie** (bible section 4). In tier 4 the visual tell may be one you only know to look for after a past loop.
- **On loop 1, every intruder below tier 4 can be caught with a question the player can reach**: one of the three openers, or one unlocked by inspecting a spot or reading the visitor list (section 2a). Tier 4 visitors may need a question that only unlocks from memory of a past loop.
- **Legit visitors can be wrong, rude, evasive or lying, but never about their era.** A legit visitor may lie about why they're late, refuse to answer ("classified"), or misremember a floor number. Only intruders get era-locked facts wrong (prices, technology, slang, current events, how dates are written). Teaching this rule early is what lets later red herrings work.
- **Red herrings mirror real tells.** For every kind of tell, at least one legit visitor shows something that looks like it: a pocket watch, retro gadgets, talk about the future, too-perfect paperwork, a costume.
- **Intruders don't know the guard.** Legit regulars (janitor, sister, liaison) greet the guard by name. Intruders don't, until *Future you*, who knows it too well.

## 2a. How questions unlock — DECIDED by Adam, live in the game

- **Every visitor opens with the same three questions:** *"What's your name?"*, *"What can I do for you?"* and *"How did you get here?"* (engine: `opening: { name, want, how }`).
- **Every other question unlocks** only after the player inspects a spot on the visitor (`requires: 'saw:<zoom id>'`), reads the visitor list (`'saw:desk.list'`), or remembers something from an earlier loop (a memory flag). The question pad tags these "noticed".
- **Inspected spots are remembered across loops**, so on later loops their questions come back tagged "from memory".

What this means for the entries below:
- **Tier 1 lies live in the openers.** The 1920s man's "The trolley, naturally." is his *How did you get here?* answer. The pizza driver's honest mistake ("Third floor, right?") is in his *What can I do for you?* answer.
- **Tier 2 lies need one inspected spot or the visitor list** to unlock the question that exposes them. For example, the WWII soldier's "Where did you serve?" unlocks after inspecting his ration tin.
- **Tier 3 lies need a zoom-only spot**, or a question unlocked by what another visitor said earlier that night.
- **Tier 4 lies need a memory flag** from an earlier loop.
- In section 4, an "Exposed by" question that isn't one of the three openers is unlocked by the visual tell listed above it in the same entry. The working lines for the demo's visitors are in `/mnt/project-files/game/js/content/visitors.js` and `demo-visitors.js`.

## 2. The lie toolkit

The kinds of lies visitors tell, ordered roughly from easiest to hardest to catch.

| Lie type | What it sounds like | How the player catches it | Typical tier |
|---|---|---|---|
| **Anachronism slip** | Wrong slang, wrong tech word, wrong price. "Did you get my text?" | Ask anything about how they got here, how they'll pay, how to reach them | 1 |
| **Cover-story gap** | A plausible story with one wrong noun: "I took the trolley." | Ask a follow-up about the detail | 1–2 |
| **Paper contradiction** | Their story disagrees with their own document or the visitor list (name, date, department) | Compare the document, the list and the calendar | 2 |
| **Phone contradiction** | "Call my office, they'll confirm." The number doesn't exist, or the switchboard has never heard of them | Use the phone or the Rolodex | 2 |
| **Date-format slip** | Writes the date the wrong way on the sign-in sheet (`2024-03-12`, Roman numerals, day first) | Read the sign-in sheet | 2–3 |
| **Overknowledge** | Knows something they shouldn't: your badge number, a name nobody told them, how tonight ends | Notice it; ask "How do you know that?" | 3 |
| **Literal answers** | Answers an idiom or a brand name literally ("Got milk?" "I have no milk.") | Ask small talk with a pop-culture hook | 3 |
| **Cross-visitor contradiction** | Their story disagrees with what an earlier visitor said tonight | Remember, or check the Guard's Notebook | 3 |
| **Tense slip** | Talks about future tech in the past tense, as if it already happened | Listen for "back when" or "we used to" about things that don't exist yet | 3 |
| **Loop-locked lie** | Airtight unless you know something from a past loop | A `requires:` question unlocked by a past loop | 4 |

## 3. The desk tools that catch lies

| Tool | What it checks | First available |
|---|---|---|
| **Visitor list** (clipboard) | Name, organisation, who they're seeing | Briefing |
| **Wall calendar** | Today's date, so documents and stories can be dated | Briefing |
| **Their document** | Name, photo, date, issuer, material (era-wrong paper or plastic) | Every visitor who has one |
| **Sign-in sheet** | Handwriting, how they write the date | Slot 7 |
| **Phone + Rolodex** | Call the lab, a switchboard, or the number they gave | Slot 7 |
| **Inspection zoom** | Small visual tells on the body | Always |
| **Guard's Notebook** (CRT) | What earlier visitors said tonight and in past loops | Always; fills as you play |

---

## 4. Visitor by visitor

Each entry lists the cover story, the visual tell, the dialogue lie and the question that exposes it, plus what a legit visitor's red herring is. Lines are drafts for tone.

**Key:** L = legitimate, I = intruder (human), A = android. Tier as in section 1.

### Tier 0 — Tutorial

#### 1. The assassin — I (future), tier 0
- **Cover story:** none.
- **Visual:** armour, glowing visor. The only visitor drawn to look obviously wrong.
- **Dialogue:** no lie. "Directions to the laboratory. Every occupant must be terminated."
- **Teaches:** the desk has a gun, wrong calls reset the loop, the scientist gives the orders.

### Tier 1 — Obvious (slots 1–6)

#### 2. Pizza delivery driver — L, tier 1
- **Visual:** grease-stained box; receipt with today's date and "LAB 2 – NIGHT SHIFT".
- **Dialogue:** complains about roadworks on the main road. **Honest mistake:** says the order is for "the third floor" when the lab is on two. Teaches that legit people get trivia wrong.
- **Checks out:** receipt date matches the calendar; the price is a believable 90s price.

#### 3. Government official, Dept. of Energy — L, tier 1
- **Visual:** laminated government badge, briefcase, wet umbrella.
- **Dialogue:** impatient and rude, name-drops an agency process. Threatens to report the guard if delayed.
- **Red herring:** hostility. Being unpleasant isn't a tell.
- **Returns (if turned away):** furious, with a supervisor's name and a deadline. Turning him away twice resets.

#### 4. Man in a 1920s three-piece suit — I (1920s), tier 1
- **Visual:** fedora that is **dry** although it's pouring outside; pocket watch engraved 1923; calling card instead of an ID.
- **Lie:** says he's "Mr. H. Wallace, from the board."
- **Exposed by:**
  - *"How did you get here tonight?"* → "The trolley, naturally." (No trolley line exists.)
  - *"Can I get you a coffee?"* → offers a silver dollar and tells you to keep the change.
  - Calls the phone a "telephone apparatus."
- **Cross-check:** no Wallace on the visitor list.
- **Returns as a 1950s salesman (tier 2):** pomade, a tie clip, sells "the new colour television". **Lie:** calls himself "Harold Wallis". **Exposed by:** prices ("a steal at forty-nine ninety-five" for a colour set), and he asks if the lab has a "Univac".

#### 5. The scientist's sister — L, tier 1 (twist clue in later loops)
- **Visual:** brown paper lunch bag with his name on it, raincoat.
- **Dialogue:** warm and chatty. Knows his childhood nickname.
- **Twist hook (loop 2+):** a question unlocks, *"What does your brother look like?"* She describes a short, bald man with a moustache, nothing like the man who ran in. She's telling the truth: her brother, the real Aldous Kane, is upstairs, and the man who ran in isn't him (bible section 5, clue 3).
- **Returns:** with urgent family news.

#### 6. Courier with a smartphone — I (2020s), tier 1
- **Visual:** taps a glass-screened phone; no clipboard; wireless earbud in one ear.
- **Lie:** "Overnight package for Dr. Kane."
- **Exposed by:**
  - Greeting slip: *"Did you get my text?"*
  - *"Can I see the delivery slip?"* → holds out the phone: "Just sign on the screen."
  - *"Who's it from?"* → "It's in the app." Then the phone shows "No Service" and he panics.
- **Cross-check:** no tracking slip.

#### 27. Influencer — I (2020s), tier 1
- **Visual:** earbuds and a selfie stick, filming the lobby.
- **Lie:** says she's "doing a piece on Science Corp for her channel."
- **Exposed by:** asks for the Wi-Fi password; *"Channel? Which TV station?"* → "No, like, my followers." Says "no cap."

### Tier 2 — Cross-check (slots 7–15)

#### 7. Visiting researcher from MIT — L, tier 2 (red herring)
- **Visual:** thick vintage glasses, a slide rule clipped to his pocket as a joke.
- **Dialogue:** nerds out about old tech ("they don't make relays like they used to"). **Red herring:** says the World Wide Web "is going to be huge", which is a 90s prediction, not a slip.
- **Checks out:** on the list, correct department, knows tonight's news.

#### 8. Company executive / investor — L, tier 2 (red herring)
- **Visual:** expensive watch, cologne, a shady smile.
- **Lie (a legit one):** says he was "held up at the office." Ask follow-ups and it's clear he was at a dinner he doesn't want anyone to know about. **Teaches:** people lie about personal things. A lie isn't proof of time travel unless it's about the era.
- **Checks out:** on the list; business card matches.

#### 10. Teen intern — L, tier 2 (red herring)
- **Visual:** a Walkman and a thrifted 1970s suede jacket.
- **Dialogue:** current 90s slang ("as if", "that's da bomb"). Mentions his dad's 8-track as a joke.
- **Red herring:** retro look, but every era-locked answer is right.

#### 11. Victorian-era "doctor" — I (1880s), tier 2
- **Visual:** leather medical bag, mutton chops. Small tell: a **mercury thermometer in a brass case** in his breast pocket (zoom).
- **Lie:** "Dr. Pembroke, consulting physician. Dr. Kane sent for me."
- **Exposed by:**
  - *"What number should I call to confirm?"* → "I have a telegraph address."
  - *"How'd you get here?"* → "By hansom cab."
  - Mentions treating "an imbalance of electrical humours."
- **Cross-check:** not on the list; the lab line doesn't know him.

#### 12. Night janitor — L, tier 1–2
- **Visual:** big ring of keys, building badge, mop bucket.
- **Dialogue:** greets the guard **by name**, grumbles about the building. Plants the rule that regulars know the guard.

#### 13. Military liaison — L, tier 2 (red herring)
- **Visual:** uniform, sidearm, hard face.
- **Dialogue:** brusque. **Legit evasion:** "That's classified" to two questions.
- **Checks out:** on the list; rank insignia and ID are correct for the 90s.

#### 14. "Journalist" in a peace-sign jacket — I (1960s), tier 2
- **Visual:** film camera (fine in the 90s), a peace patch, press pass for a **paper that folded decades ago** (zoom: masthead name and price "10¢").
- **Lie:** "Covering the big announcement for the *Free Press*."
- **Exposed by:**
  - *"Who told you about an announcement?"* → "It's all over the wire."
  - Offers a quarter for a coffee and calls it generous.
  - *"What's your email?"* → "My what?"
- **Cross-check:** press pass price and masthead.

#### 15. Wife of a lab tech — L, tier 2
- **Visual:** upset, holding a spare set of car keys.
- **Dialogue:** knows her husband's car (an '89 Corolla, blue, dented bumper) and his extension.
- **Checks out:** call his extension on the Rolodex and he confirms.

#### 18. WWII soldier in disguise — I (1940s), tier 2
- **Visual:** military haircut, ration tin in his coat pocket (zoom: "K-RATION").
- **Lie:** "Just a veteran, visiting my granddaughter, she works nights here."
- **Exposed by:** he looks about 22. *"Where did you serve?"* → "The Ardennes, last winter." In the 90s a WWII veteran would be about 70. Also says "swell" and calls the enemy "Jerry."
- **Cross-check:** no granddaughter on the staff list.

#### 22. Viking-styled cosplayer — L, tier 2 (red herring)
- **Visual:** foam axe, horned helmet, **convention lanyard** (zoom: a 90s convention name and this weekend's dates).
- **Dialogue:** in character at first, then drops it: "Sorry, con's down the street, my cousin works here and has my car keys."
- **Checks out:** cousin is on the staff list.

#### 23. Medieval monk — I (1300s), tier 2
- **Visual:** sandals in winter, rope belt, tonsure; flinches whenever the automatic door opens.
- **Lie:** "Brother Anselm, from St. Brendan's down the road."
- **Exposed by:** answers in Latin when startled; *"Which road?"* → describes a river ford.
- **Cross-check:** no St. Brendan's in the Rolodex or phone book.

#### 29. Ancient Roman "consultant" — I (ancient Rome), tier 2
- **Visual:** trench coat buttoned to the neck; a **sandal strap** shows at the ankle (zoom).
- **Lie:** "Consultant, from Rome. Italy."
- **Exposed by:** writes the date on the sign-in sheet in Roman numerals; *"How's the lira doing?"* → no idea what that is.

### Tier 3 — Subtle (slots 16–25)

#### 9. "Inspector" with flawless ID — A (future), tier 3
- **Visual:** neat suit, normal face. Zoom only: the badge's security seal shifts colour when tilted; a hairline seam under the collar.
- **Lie:** "Routine facilities inspection."
- **Exposed by:**
  - **Literal answers:** *"Got milk?"* → "I have no milk." (He doesn't know the ad.)
  - **Overknowledge:** calls the guard by their badge number, which nobody gave him.
  - **Paper contradiction:** the inspection order is dated day-first with the full year, unlike every other US document on the desk.
  - Repeats your question back to you: "Is everything in order?"
- **Correct action:** shutdown device.

#### 16. Delivery robot "operator" — A (near future), tier 3
- **Visual:** uniform without a single crease. Zoom: shoes completely **dry**; pupils don't shrink when you shine the desk lamp.
- **Lie:** "The delivery unit broke down, so I walked it in myself."
- **Exposed by:**
  - **Tense slip:** "Drones used to be so unreliable."
  - Delivery slip is time-stamped to the second, in 24-hour time.
  - Literal answer to small talk about the weather.
- **Correct action:** shutdown device.

#### 17. Patent lawyer — L, tier 3 (red herring)
- **Visual:** overstuffed briefcase.
- **Dialogue:** evasive about the filing ("privileged"). **Red herring:** evasion again, but every date on his paperwork is right and he's on the list.

#### 19. Elderly emeritus professor — L, tier 3 (red herring)
- **Visual:** cane, cardigan and a **pocket watch**, the same kind of tell as the 1920s man. Zoom: the engraving is a retirement gift, "For 40 years of service", with a 90s date.
- **Dialogue:** very old-fashioned speech ("I say, young man"). Knows last month's journal papers in detail.
- **Teaches:** read the engraving, not just the object.

#### 20. Food safety inspector — I (2050s), tier 3
- **Visual:** a clipboard that is slightly too thin. Zoom: the "paper" doesn't bend; text scrolls when he touches it.
- **Lie:** "Health department. Spot check on the kitchen."
- **Exposed by:**
  - Cites "Section 4 of the Food Provenance Act" (no such law).
  - **Cross-visitor contradiction:** the pizza driver said there's no kitchen, staff order out.
  - Asks to see "the nutrient printer."

#### 21. The scientist's mother — L, tier 3 (red herring, twist clue)
- **Visual:** birthday cake in a box.
- **Dialogue:** a little confused. Gets a date wrong ("his birthday's in March... or is it April?"). **Red herring:** inconsistency from age, not from lying.
- **Checks out:** her story matches the sister's (nickname, hometown).
- **Twist hook:** proudly says her son "called last week, said he was close to something big, something with clocks." The photo in her purse (zoom) is of the short, bald man the sister described, the real Kane.

#### 24. Senator's aide — L, tier 3 (red herring)
- **Visual:** a **brick cell phone** and a pager, both buzzing. Mirrors the smartphone courier.
- **Dialogue:** rushed and short. Answers phone questions with real 90s detail ("my carrier drops every call past the bridge").
- **Teaches:** a phone isn't the tell; the kind of phone is.

#### 27a. Dot-com founder — L, tier 3 (red herring)
- **Visual:** a business-casual fleece and a Palm-style organiser.
- **Dialogue:** sounds like he's from the future: "Everyone will carry the internet in their pocket."
- **How to tell him apart:** he talks about the future in the **future tense**, and gets details wrong ("on pocket fax machines"). Intruders talk about it in the past tense or assume it already exists.

#### 28. Health insurance rep — L, tier 3 (red herring)
- **Visual:** plain suit, perfectly typed paperwork.
- **Dialogue:** monotone and literal, answers exactly what was asked. **Red herring** for the android rule.
- **How to tell him apart:** ask small talk with a pop-culture hook and he gets it, then sighs about it.

### Tier 4 — Loop knowledge (slots 26–30)

#### 25. "Future you" — I (future), tier 4
- **Visual:** an older guard in the same uniform, with the same scar on the same hand. Zoom: the shoulder patch is a **later version** of the Science Corp logo.
- **Lie:** "If you let me through, the loop ends. I've done this a hundred times."
- **Exposed by:**
  - **Overknowledge, turned around:** he knows the guard's name and habits, which normally signals a legit regular. That's the trap.
  - **Loop-locked question:** after any earlier loop where the player shot the scientist without evidence, *"What happened when I shot him?"* gets a wrong answer. He describes a version of that loop that didn't happen.
- **Design note:** the hardest call in the game, and a test of nerve.

#### 26. Rival company engineer — I (future), tier 4 — carries the wanted poster
- **Visual:** none on loop 1. Zoom (once the player knows to look): the corporate badge names a merged company, "Kessler–Science", that doesn't exist yet.
- **Lie:** "Joint project with Dr. Kane, it's on the list."
- **Exposed by:** he *is* on the list (the scientist wrote it, bible section 5). His answers are airtight. Only after an earlier loop where a legit visitor (the MIT researcher or the investor) mentions "Kessler" as a rival does a question unlock: *"Since when are you with Science Corp?"* He answers with a merger date in the future.
- **The wanted poster (act 4) — DECIDED by Adam: this is where the scientist's real name, Emit, is revealed.** When the engineer reaches for his badge, a folded paper falls out of his coat onto the desk: **"WANTED — EMIT. Prisoner 0-1. Escaped custody, 2240."** The photo is the man in the lab, clean-shaven and in a prison collar. The player can pick it up whatever they decide about the engineer, and it goes into the Guard's Notebook, so it carries across loops. In the art it's a future-plastic sheet with a cyan border (future gear), the one bold piece of future tech in act 4.
- **Designer's choice in the bible; this draft makes him an intruder.**

#### 30. Prison warden from the future — I (future, telling the truth), tier 4
- **Visual:** a long coat with an insignia under the lapel (zoom), a folder.
- **Dialogue:** **no lies at all.** The only visitor whose every line is true. He has the scientist's prisoner file: "Prisoner 0-1. Escaped custody, year 2240."
- **The catch:** letting him through still resets, because Emit sees him coming on the lab camera and slips away to try again (bible section 6). He exists to hand the player the twist, not to be passed.
- **What he can tell you:** "Kane builds the first machine tonight. Emit's here to make sure he never does." 
- **Loop hook:** a player who saw the watch reading `12.03.40` can say "2240" to him, and a player holding the wanted poster can say "Emit". Either unlocks his full briefing in later loops.

### The opening narration — DECIDED direction (Adam), draft lines

The guard narrates a storm night that feels charged. The static from the lightning makes the hair on the back of his neck stand up. Then the big flash comes, and he makes the first wrong inference: that it's lightning. Only later does the player learn it was the event, Emit arriving. The static on his neck is also the in-world reason he remembers the loops, since he was nearest the flash.

**Loop 1 (normal, skippable on replay):**
1. *"Storm all night. The kind that makes a building feel like it's holding its breath."*
2. *"Every time the sky lit up, the hair on the back of my neck stood on end. Static, I told myself."*
3. *"Something about tonight felt different. I couldn't have told you what."*
4. `{ flash: 'big' }`
5. *"Then the big one. White, everywhere, all at once."*
6. *"My neck was still buzzing when the door banged open."* (Emit rushes in.)

On loop 1 the guard never says what the flash was. The player assumes lightning from the storm, which is the wrong inference Adam wants.

**Added after line 5 on later loops (`noSkip`, so the player notices) — DECIDED by Adam:**
- Loop 2 onward: *"Last time I thought it was lightning."*
- Once the player has `learn: 'wantedPoster'`, it is followed by: *"It wasn't lightning. It never was."*
- Optional, after a few loops, replacing line 2: *"The hair on my neck went up before the sky did. It always does now."* (A hint that the guard is tuned to the flash.)

**Visual:** small lightning flickers through the glass doors before the big flash, using the normal palette, so the big flash's three-tone collapse (style guide section 7) reads as something bigger.

### The scientist (not a visitor, but tells apply)

**His real name is Emit** ("time" backwards, and half the game's title). The name first appears on the wanted poster in act 4 (see the rival engineer, #26). Before that, nothing in the game says it.

**The real Dr. Aldous Kane exists — DECIDED by Adam.** Kane is a real Science Corp researcher, upstairs in the lab tonight, and he is the first person ever to invent time travel. Emit, an escaped prisoner from 2240, has come back to this night to stop Kane, because if time travel is never invented, nobody can ever come after Emit. That's why Emit keeps returning to this exact moment, and why this desk is where everyone ends up.

What this means at the desk:
- **The man who rushes in after the first flash is Emit wearing Kane's name.** His "breakthrough" speech is Kane's real breakthrough, claimed as his own. "Hold them off a bit longer" means he needs more time upstairs to stop Kane.
- **The future intruders are trying to protect Kane**, or to catch Emit before he can stop him. They're on the right side but play the part of the enemy, because the guard is working for Emit.
- **Kane's family are real.** The sister and mother come for the real Kane, so their description of him never matches the man who ran in.
- **"Destroy time travel"** (bible section 5) becomes literal: Emit means stopping its inventor before he finishes tonight.

Drawn in the 90s palette, his tells only make sense on a replay (style guide section 8): the watch that reads `12.03.40`, the burned coat hem with neat future stitching, and later the visitor list in his handwriting. His lies are in the briefing: he calls the intruders "people trying to steal the breakthrough" and never says which year they're from. The sister, the mother and the warden contradict him. Once the player has seen the poster, a loop-locked line opens when he rushes in after the first flash: *"Evening, Emit."* He stops dead. That's the strongest "I know what you are" moment before the final shot.

---

## 5. Suggested shift order

Slots run in order through one loop. Returning guests reappear about four to six slots after being turned away.

| Slot | Visitor | Truth | Tier |
|---|---|---|---|
| **Prologue** | | | |
| Tutorial | Assassin (1) | I | 0 |
| **Act 1** | | | |
| 1 | Pizza driver (2) | L | 1 |
| 2 | 1920s man (4) | I | 1 |
| 3 | Sister (5) | L | 1 |
| 4 | Smartphone courier (6) | I | 1 |
| 5 | Night janitor (12) | L | 1 |
| 6 | Influencer (27) | I | 1 |
| **Act 2** | | | |
| 7 | DOE official (3) | L | 2 |
| 8 | Victorian doctor (11) | I | 2 |
| 9 | Teen intern (10) | L | 2 |
| 10 | Monk (23) | I | 2 |
| 11 | MIT researcher (7) | L | 2 |
| 12 | WWII soldier (18) | I | 2 |
| 13 | Military liaison (13) | L | 2 |
| 14 | Journalist (14) | I | 2 |
| 15 | Viking cosplayer (22) | L | 2 |
| — | *The scientist hands over the shutdown device* | | |
| **Act 3** | | | |
| 16 | Android inspector (9) | A | 3 |
| 17 | Wife of lab tech (15) | L | 2 |
| 18 | Emeritus professor (19) | L | 3 |
| 19 | Roman consultant (29) | I | 2 |
| 20 | Investor (8) | L | 2 |
| 21 | Food safety inspector (20) | I | 3 |
| 22 | Senator's aide (24) | L | 3 |
| 23 | Delivery robot operator (16) | A | 3 |
| 24 | Dot-com founder (27a) | L | 3 |
| 25 | Mother (21) | L | 3 |
| — | *The scientist: "Hold them off a bit longer"* | | |
| **Act 4** | | | |
| 26 | Health insurance rep (28) | L | 3 |
| 27 | Patent lawyer (17) | L | 3 |
| 28 | Rival engineer (26), drops the wanted poster | I | 4 |
| 29 | Future you (25) | I | 4 |
| 30 | Prison warden (30) | I (truthful) | 4 |

Mix: 16 legit, 12 human intruders and 2 androids, with six strong red herrings (7, 8, 10, 19, 22, 27a) and two softer ones (24, 28). That's 53% legit, a little under the bible's 55–60% target; adding one returning legit guest (the sister with urgent news, or the furious DOE official) brings it to 55%. Low-tier intruders slotted late (the Roman, slot 19) act as breathers.

## 6. Open questions for Adam

1. **Rival engineer: intruder or legit?** This draft makes him an intruder, since a future merger badge is a strong loop-locked tell.
2. ~~**The scientist's real name.**~~ **Decided:** Emit, revealed on the wanted poster in act 4. Dr. Aldous Kane is a real person, the inventor of time travel, whose name Emit is using.
4. ~~**Why is the guard special?**~~ **Decided:** this night and this desk are where time travel is born, so every traveler has to get past the guard. The guard is standing nearest the first flash when Emit lands, which is why he alone keeps his memory across the resets. It also explains why *Future you* exists.
3. **How exact should the 90s be?** Prices and slang here are kept loosely mid-90s so they work without naming a year.
