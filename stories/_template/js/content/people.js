/*
 * People you meet. A meeting is a `{ meet: 'id' }` step: the person steps up,
 * you ask questions, click on them to look closer, then choose an action.
 */
(function () {
  var P = window.TALE.content.people;

  P.stranger = {
    id: 'stranger',
    truth: 'stranger',            // picks the fallback row in config.outcomes
    prompt: 'They wait just outside the light from the fire.',
    greeting: [
      { sfx: 'door' },
      { who: 'stranger', say: 'Evening. Long walk. May I come in and warm my hands?' }
    ],
    opening: {
      name: [{ who: 'stranger', say: 'Just a traveller. Names don\'t keep well out here.' }],
      want: [{ who: 'stranger', say: 'Only the fire. I won\'t stay past morning.' }]
    },
    questions: [
      { id: 'boots', ask: 'Why are your boots dry?', requires: 'saw:boots', steps: [
        { who: 'stranger', say: 'I walked carefully.', noSkip: true },
        { note: ['stranger', 'Walked through the rain and the mud and came out dry.'] }
      ] }
    ],
    // 3 to 5 spots; coordinates are on the 480x270 canvas where the person stands
    inspect: [
      { id: 'hands', title: 'Hands', zoom: 'hands', x: 210, y: 128, w: 22, h: 18,
        text: 'Ordinary hands, a little red from the cold.', note: 'Hands red from the cold.' },
      { id: 'boots', title: 'Boots', zoom: 'boots', x: 222, y: 150, w: 36, h: 14,
        text: 'Not a speck of mud. It has rained all day.', note: 'Boots perfectly dry and clean.' }
    ],
    actions: {}                   // leave empty to use config.outcomes
  };
})();
