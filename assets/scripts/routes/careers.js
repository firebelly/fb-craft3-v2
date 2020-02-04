// Careers page js

import appState from '../util/appState';

const careers = {

  init() {
    // Position accordions
    $('.accordion').each(function() {
      let $this = $(this);
      $this.on('click', (e) => {
        if (!appState.isAnimating && !$this.hasClass('-active')) {
          e.preventDefault();
          // Push URL+hash for Ariel
          history.pushState(null, null, location.pathname + '#' + $this.data('position'));
          careers.openAccordion($this);
        }
      });
      $this.find('a.collapse').on('click', (e) => {
        e.preventDefault();
        appState.isAnimating = true;
        // Reset URL for Ariel
        history.pushState(null, null, location.pathname);
        $this
          .removeClass('-active')
          .find('.description')
          .velocity('slideUp', 500, 'easeOutCubic', () => {
            appState.isAnimating = false
          });
      });
    });

    // Watch for state change
    window.addEventListener('popstate', careers.checkAccordion);
  },

  openAccordion($accordion) {
    if ($accordion.hasClass('-active') || appState.isAnimating) {
      return false;
    }
    appState.isAnimating = true;

    // Accordion already open? Collapse, scroll to position, and open selected
    if ($('.accordion.-active').length) {
      $('.accordion.-active').each(function() {
        $(this).removeClass('-active')
          .find('.description')
          .velocity('scroll', { duration: 0, offset: -document.querySelector('.site-header').offsetHeight })
          .velocity('slideUp', 0, () => {
            $accordion.velocity('scroll', { duration: 50, offset: -document.querySelector('.site-header').offsetHeight })
              .addClass('-active')
              .find('.description')
              .velocity('slideDown', 500, 'easeOutCubic', () => appState.isAnimating = false);
          });
      });
    } else {
      // Just open accordion if none are already open
      $accordion.addClass('-active');
      $accordion.find('.description').velocity('slideDown', 500, 'easeOutCubic', () => appState.isAnimating = false);
    }
  },

  closeAccordions() {
    $('.accordion.-active')
      .removeClass('-active')
      .find('.description')
      .velocity('slideUp', 500, 'easeOutCubic', () => {
        appState.isAnimating = false
      });
  },

  checkAccordion() {
    if (location.hash) {
      let $position = $(`[data-position="${location.hash.replace('#','')}"]`);
      if ($position.length) {
        $position.velocity('scroll', { duration: 150, offset: -document.querySelector('.site-header').offsetHeight });
        careers.openAccordion($position);
      }
    } else {
      careers.closeAccordions();
    }
  },

  finalize() {
    // Check for initial window.hash (set in main.js before swup init) on pageload to open modal
    if (appState.initialHash) {
      // Push carousel hash into history
      history.pushState(null, null, location.pathname + appState.initialHash);
      appState.initialHash = '';
      careers.checkAccordion();
    }
  },

  unload() {
    // JavaScript to clean up before live page reload
    window.removeEventListener('popstate', careers.checkAccordion);
  },

};

export default careers
