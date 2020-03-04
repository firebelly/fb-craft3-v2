// Work page js

import appState from '../util/appState';
import modals from '../util/modals';
import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';

let $document = $(document);

export default {

  init() {

    // Init filters modal
    modals.init('.modal .-inner');

    // Open filters modal when clicking "Change Filters"
    let filtersHtml = $('.modal-content').html();
    $document.on('click.filters', 'a.filter-projects', function(e) {
      e.preventDefault();
      modals.openModal(filtersHtml, 'noHistory');
    });

    // Hijack clicks in filters modal
    $document.on('click.services', 'ul.services-nav a', function(e) {
      e.preventDefault();
      modals.closeModal();
      swup.loadPage({ url: this.pathname });
    });

  },

  finalize() {
    // JavaScript fired after the init JS
  },

  unload() {
    // JavaScript to clean up before live page reload
    modals.unload();
    $document.off('click.filters click.services');
  },

};
