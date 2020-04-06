// About page js

import appState from '../util/appState';
import modals from '../util/modals';
import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';

const about = {

  init() {
    // Init modal & specify scrollable container when modal is open
    modals.init('.modal');

    // If page is being loaded after a modual using history is closed,
    // set focus to the element that was in focus before the modal was opened
    if (appState.personModalTrigger != false) {
      $('[data-person="' + appState.personModalTrigger + '"] a:first-of-type').focus();
      appState.personModalTrigger = false;
    }

    // Person links to modals
    $('.person a').on('click', function(e) {
      e.preventDefault();
      if (appState.isAnimating) {
        return;
      }
      let $person = $(this).parents('.person');
      history.pushState(null, null, this.href);
      about.openPerson($person);
    });

    // Watch for state change (e.g. hitting next returning to /about#dawn-hancock, reopen modal)
    window.addEventListener('popstate', about.checkModal);

  },

  openPerson($person) {
    $('body').removeClass('-cursor-active');
    let html = $person.find('.modal-content').html();
    modals.openModal(html);
  },

  checkModal() {
    if (location.hash) {
      let $person = $(`[data-person="${location.hash.replace('#','')}"]`);
      if ($person.length) {
        about.openPerson($person);
        $(window).scrollTop($person.offset().top - $('.site-header').outerHeight() - 50);
      }
    } else {
      modals.closeModal();
    }
  },

  finalize() {
    // JavaScript fired after the init JS

    // Check for initial window.hash (set in main.js before swup init) on load to open modal
    if (appState.initialHash) {
      history.pushState(null, null, location.pathname + appState.initialHash);
      appState.initialHash = '';
      about.checkModal();
    }
  },

  unload() {
    // JavaScript to clean up before live page reload
    modals.unload();
    window.removeEventListener('popstate', about.checkModal);
  },

};

export default about
