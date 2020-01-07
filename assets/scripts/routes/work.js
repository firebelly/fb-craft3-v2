// Work page js

import appState from '../util/appState';
import modals from '../util/modals';
import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';

export default {

  init() {
    // Init filters modal
    modals.init('.modal .-inner');

    let filtersHtml = $('.modal-content').html();
    $('a.filter-projects').on('click', function(e) {
      e.preventDefault();
      modals.openModal(filtersHtml, '#filters');
    });

  },

  finalize() {
    // JavaScript fired after the init JS
  },

};
