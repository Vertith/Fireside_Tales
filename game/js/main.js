/* Emit Time — boot. Wires the title, end and menu screens to the engine. */
(function () {
  'use strict';
  var E = window.EMIT;
  var $ = function (id) { return document.getElementById(id); };

  function boot() {
    E.ui.init();
    var game = (E.game = new E.Game(E.ui));
    E.ui.game = game;
    E.ui.refresh(game);

    var hasSave = game.hasSave && game.memory.loop > 1;
    $('title-start').textContent = hasSave ? 'Continue from the first flash' : 'Start the shift';
    $('title-note').textContent = hasSave
      ? 'You have been through this night ' + (game.memory.loop - 1) + ' time' + (game.memory.loop === 2 ? '' : 's') + '. Your notebook remembers.'
      : '';
    $('title-wipe').hidden = !hasSave;

    $('title-start').addEventListener('click', function () {
      E.audio.unlock();
      $('title-overlay').hidden = true;
      game.start('opening');
    });
    $('title-wipe').addEventListener('click', function () {
      if (!this.dataset.armed) { this.dataset.armed = '1'; this.textContent = 'Click again to wipe your memory'; return; }
      game.wipe();
      E.ui.refresh(game);
      this.hidden = true;
      $('title-note').textContent = '';
      $('title-start').textContent = 'Start the shift';
    });

    $('end-again').addEventListener('click', function () {
      $('end-overlay').hidden = true;
      game.relive();
    });
    $('end-notebook').addEventListener('click', function () { E.ui.openNotebook(); });

    $('menu-restart').addEventListener('click', function () {
      $('menu-overlay').hidden = true;
      $('end-overlay').hidden = true;
      game.relive();
    });
    $('menu-wipe').addEventListener('click', function () {
      if (!this.dataset.armed) { this.dataset.armed = '1'; this.textContent = 'Click again to wipe everything'; return; }
      $('menu-overlay').hidden = true;
      $('end-overlay').hidden = true;
      game.wipe();
      game.start('opening');
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
