// About page js

import appState from '../util/appState';
import modals from '../util/modals';
import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';

export default {

  init() {
    // Init modal & specify scrollable container when modal is open
    modals.init('.modal');

    // Check for hash to open user
    if (window.location.hash) {
      let $person = $(`[data-person="${window.location.hash.replace('#','')}"]`);
      if ($person.length) {
        setTimeout(function() {
          _openPerson($person);
          $(window).scrollTop($person.offset().top - $('.site-header').outerHeight() - 50);
        }, 500);
      }
    }

    // Person links to modals
    $('.person a').on('click', function(e) {
      e.preventDefault();
      if (appState.isAnimating) {
        return;
      }
      let $person = $(this).parents('.person');
      _openPerson($person);
    });

    function _openPerson($person) {
      $('body').removeClass('-cursor-active');
      let html = $person.find('.modal-content').html();
      let hash = $person.attr('data-person');
      modals.openModal(html, hash);
    }
  },

  finalize() {
    // JavaScript fired after the init JS
  },

  unload() {
    // JavaScript to clean up before live page reload
    modals.unload();
  },

};
