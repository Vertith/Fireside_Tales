/*
 * Who can speak. `name` is shown above their lines; `portrait` is a key in
 * TALE.art.people. Notebook pages are grouped by these ids too.
 */
(function () {
  var C = window.TALE.content.characters;
  C.mom = { name: 'Mom', notebookName: 'Mom (in the big bed)', portrait: 'mom' };
  C.momread = { name: 'Mom', notebookName: 'Mom, at bedtime', portrait: 'momread' };
  C.dad = { name: 'Dad', notebookName: 'Dad (in the armchair)', portrait: 'dad' };
  C.dadvoice = { name: 'Dad', notebookName: 'Dad, at bedtime' };
  C.biscuit = { name: 'Biscuit', notebookName: 'Biscuit (in the kitchen)', portrait: 'biscuit' };
  C.mirror = { name: 'Me?', notebookName: 'The boy in the mirror', portrait: 'mirror' };
  C.albright = { name: 'Mrs. Albright', notebookName: 'Mrs. Albright (at the back door)', portrait: 'albright' };
  C.cop = { name: 'Deputy', notebookName: 'The deputy who knocked', portrait: 'cop' };
  C.deputy = { name: 'Deputy', notebookName: 'The deputy who came after I called', portrait: 'deputy' };
  C.dispatch = { name: '911', notebookName: 'The phone' };
  C.family = { name: 'Dad', notebookName: 'In the basement', portrait: 'family' };
  C.realmom = { name: 'Mom', notebookName: 'In the basement' };
  C.pepper = { name: 'Pepper', notebookName: 'Pepper' };
  C.house = { name: '', notebookName: 'The house' };
  C.book = { name: 'The book', notebookName: 'The Hollow Hill (Mom\'s book)' };
  C.whitlock = { name: 'The journal', notebookName: 'The people who lived here before' };
})();
