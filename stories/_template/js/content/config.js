/*
 * This story's settings. Change `id`, `title` and `saveKey` first (tools/new_story.py
 * does that for you), so this story's save never touches another story's.
 */
(function () {
  var E = (window.TALE = window.TALE || {});
  E.config = {
    id: 'template',
    title: 'Untitled Tale',
    saveKey: 'fireside.template.save.v1',   // localStorage key for loops, notebook and memory
    firstScene: 'opening',                  // where a new loop starts

    // The questions everyone can be asked at a meeting. A person answers them in `opening`.
    openers: [
      { id: 'name', ask: 'Who are you?' },
      { id: 'want', ask: 'What do you want?' }
    ],

    // The buttons at a meeting, in order. `heading` says which way they walk off
    // ('in' = right, 'out' = left). `requires` locks a button until a condition holds.
    actions: [
      { id: 'welcome', stamp: 'Let in', label: 'Let them in', heading: 'in' },
      { id: 'refuse', stamp: 'Send away', label: 'Send them away', heading: 'out' },
      { id: 'lantern', stamp: 'Lantern', label: 'Hold the lantern up to them', cls: 'special',
        requires: 'run:hasLantern', lockedStamp: 'No light', lockedHint: 'You need the lantern first' }
    ],

    // What an action does when a person doesn't script it, by the person's `truth`.
    defaultTruth: 'friend',
    outcomes: {
      friend: {
        welcome: [{ narrate: 'I stepped aside and they came in out of the cold.' }, { exit: 'walk' }],
        refuse: [{ narrate: 'I shut the door on them. The knocking did not come again.' }, { exit: 'walk' }],
        lantern: { stay: true, steps: [{ narrate: 'In the light they were just tired, and a little offended.' }] }
      },
      stranger: {
        welcome: [{ narrate: 'I stepped aside. The fire went low as they passed it.' }, { reset: 'You let it in.' }],
        refuse: [{ narrate: 'I shut the door. Something stood on the other side of it for a long time.' }, { exit: 'walk' }],
        lantern: { stay: true, steps: [{ narrate: 'The light found nothing to land on.' }, { note: ['stranger', 'The lantern light passes straight through it.'] }] }
      }
    },

    // Shown when a `reset` step sends the player back to the start.
    resetText: 'The fire again. The knock again. Whatever you learned, you still know it.',
    resetButton: 'Back to the first knock',

    // Notebook groups. Notes are filed by the act they were written in.
    acts: [{ no: 1, name: 'Part One', title: '' }]
  };
})();
