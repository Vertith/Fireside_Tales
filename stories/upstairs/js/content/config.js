/*
 * Upstairs: settings. The story bible is /story/upstairs/story-bible.md.
 */
(function () {
  var E = (window.TALE = window.TALE || {});
  E.config = {
    id: 'upstairs',
    title: 'Upstairs',
    saveKey: 'fireside.upstairs.save.v1',   // localStorage key for nights, notebook and memory
    firstScene: 'opening',                  // where a new night starts

    loopWord: 'night', loopWordCap: 'Night',
    padTitle: 'Quietly',                    // what you can do from where you are, without going to them
    choiceTitle: 'What now',
    endingCount: 4,                         // end cards (deaths reset the night instead)

    // No openers: you never talk to them out loud on purpose.
    openers: [],

    // At a meeting: go to them (that's how they get you), keep still, or back off.
    actions: [
      { id: 'go', stamp: 'Go to them', label: 'Go to them', heading: 'in', cls: 'danger' },
      { id: 'still', stamp: 'Keep still', label: 'Keep still and wait', heading: 'in' },
      { id: 'back', stamp: 'Back away', label: 'Back away quietly', heading: 'out' }
    ],

    defaultTruth: 'fae',
    outcomes: {
      fae: {
        go: [{ narrate: 'I went to it.' }, { reset: 'You went to it.' }],
        still: { stay: true, steps: [{ narrate: 'I held my breath. It didn\'t move either.' }] },
        back: [{ narrate: 'I backed away, one step at a time.' }]
      },
      real: {
        go: [{ narrate: 'I went to them.' }],
        still: { stay: true, steps: [{ narrate: 'I kept still.' }] },
        back: [{ narrate: 'I backed away.' }]
      }
    },

    resetText: 'Maybe it was all a dream, but it felt so real.',
    resetButton: 'Wake up again',

    acts: [
      { no: 1, name: 'Upstairs', title: '' },
      { no: 2, name: 'Downstairs', title: '' },
      { no: 3, name: 'The basement', title: '' }
    ]
  };
})();
