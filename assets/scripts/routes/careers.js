// Careers page js

import appState from '../util/appState';

export default {

  init() {

    // Position accordions
    $('.accordion').each(function() {
      let $this = $(this);
      $this.on('click', (e) => {
        if (!$this.hasClass('active')) {
          _toggleAccordion(e, $this);
        }
      });
      $this.find('a.toggle').on('click', (e) => _toggleAccordion(e, $this));
    });

    function _toggleAccordion(e, $accordion) {
      e.preventDefault();
      if (appState.isAnimating) {
        return false;
      }
      appState.isAnimating = true;
      $accordion.toggleClass('active');
      $accordion.find('.description').velocity(($accordion.is('.active') ? 'slideDown' : 'slideUp'), 500, 'easeOutCubic', () => appState.isAnimating = false);
    };

  },

  finalize() {
    // JavaScript fired after the init JS
  },

  unload() {
    // JavaScript to clean up before live page reload
  },

};
