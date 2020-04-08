// Careers page js

import appState from '../util/appState';
const reducedMotionMQ = window.matchMedia('(prefers-reduced-motion: reduce)');

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
        if (!reducedMotionMQ.matches) {
          $this
            .removeClass('-active')
            .find('.description')
            .velocity('slideUp', 500, 'easeOutCubic', () => {
              appState.isAnimating = false;
            });
        } else {
          $this
            .removeClass('-active')
            .find('.description')
            .css({
              'display': 'none',
              'opacity': 0
            });
            setTimeout(function() {
              appState.isAnimating = false;
            }, 500);
        }
      });
    });

    // Watch for state change
    window.addEventListener('popstate', careers.checkAccordion);
  },

  openAccordion($accordion) {
    if ($accordion.hasClass('-active') || appState.isAnimating) {
      return false;
    }

    // Accordion already open? Collapse, scroll to position, and open selected
    if ($('.accordion.-active').length) {
      $('.accordion.-active').each(function() {
        appState.isAnimating = true;
        if (!reducedMotionMQ.matches) {
          $(this).removeClass('-active')
            .find('.description')
            .velocity('scroll', { duration: 0, offset: -document.querySelector('.site-header').offsetHeight })
            .velocity('slideUp', 0, () => {
              $accordion.velocity('scroll', { duration: 50, offset: -document.querySelector('.site-header').offsetHeight })
                .addClass('-active')
                .find('.description')
                .velocity('slideDown', 500, 'easeOutCubic', () => appState.isAnimating = false);
            });
        } else {
          // If prefers reduced motion is enabled, just hide/show/jump — no movement
          $(this).removeClass('-active');
          var prevOffset = $(this).offset().top;
          window.scrollTo(0, prevOffset -document.querySelector('.site-header').offsetHeight);
          $(this).find('.description')
            .css({
              'display': 'none',
              'opacity': 0
            });
          var newOffset = $accordion.offset().top;
          window.scrollTo(0, newOffset -document.querySelector('.site-header').offsetHeight);
          $accordion.addClass('-active')
            .find('.description')
            .css({
              'display': 'block',
              'opacity': 1
            });
          appState.isAnimating = false;
        }
      });
    } else {
      // Just open accordion if none are already open
      $accordion.addClass('-active');
      if (!reducedMotionMQ.matches) {
        $accordion.find('.description').velocity('slideDown', 500, 'easeOutCubic', () => appState.isAnimating = false);
      } else {
        // If reduced motion is enabled just show it
        $accordion.find('.description').css({
          'display': 'block',
          'opacity': 1
        });
        appState.isAnimating = false;
      }
    }
  },

  closeAccordions() {
    if (!reducedMotionMQ.matches) {
      $('.accordion.-active')
        .removeClass('-active')
        .find('.description')
        .velocity('slideUp', 500, 'easeOutCubic', () => {
          appState.isAnimating = false;
        });
    } else {
      // If reduced motion is enabled, just hide it
      $('.accordion.-active')
        .removeClass('-active')
        .find('.description')
        .css({
          'display': 'none',
          'css': 0
        });
      appState.isAnimating = false;
    }
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
