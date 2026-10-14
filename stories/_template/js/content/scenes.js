/*
 * Scenes: lists of steps that run in order (README.md has the full list).
 * The engine starts at config.firstScene and a `reset` step comes back here.
 */
(function () {
  var S = window.TALE.content.scenes;

  S.opening = [
    { clock: '11:40 PM' },
    { narrate: 'The cabin creaks. The fire is the only light for miles.' },
    { if: 'loop>=2', then: [
      { narrate: 'I took the lantern down before the knock came. I knew it would come.' },
      { set: 'hasLantern' }
    ] },
    { pause: 500 },
    { sfx: 'flash' },
    { flash: 'big' },
    { narrate: 'Lightning, close enough to taste. Then someone knocks.' },
    { meet: 'stranger' },
    { goto: 'morning' }
  ];

  S.morning = [
    { clock: '6:02 AM' },
    { narrate: 'Grey light. The fire is ash, and you are still here.' },
    { end: 'dawn' }
  ];

  // End cards, by the id an `end` step names
  window.TALE.content.endings = {
    dawn: { eyebrow: '6:02 AM', title: 'Morning.', text: 'You made it through the night.' }
  };
})();
