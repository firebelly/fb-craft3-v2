// Careers page js

import appState from '../util/appState';

export default {

  init() {

    // Check for hash to open user
    if (window.location.hash) {
      let $position = $(`[data-position="${window.location.hash.replace('#','')}"]`);
      if ($position.length) {
        $(window).scrollTop($position.offset().top - $('.site-header').outerHeight() - 50);
        _toggleAccordion($position);
      }
    }

    // Position accordions
    $('.accordion').each(function() {
      let $this = $(this);
      $this.on('click', (e) => {
        if (!$this.hasClass('active')) {
          e.preventDefault();
          _toggleAccordion($this);
        }
      });
      $this.find('a.toggle').on('click', (e) => {
        e.preventDefault();
        _toggleAccordion($this)
      });
    });

    function _toggleAccordion($accordion) {
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
