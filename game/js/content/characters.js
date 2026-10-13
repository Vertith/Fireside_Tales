/*
 * Who can speak. `name` is shown above their lines; `portrait` is a key in
 * EMIT.art.portraits. Notebook pages are grouped by these ids too.
 */
(function () {
  var C = (window.EMIT.content.characters = window.EMIT.content.characters || {});

  C.scientist = {
    name: 'Dr. Aldous Kane',
    notebookName: 'Dr. Aldous Kane, fourth floor',
    portrait: 'scientist'
  };

  C.assassin = {
    name: '???',
    notebookName: 'The man in plates (second flash)',
    portrait: 'assassin'
  };
})();
