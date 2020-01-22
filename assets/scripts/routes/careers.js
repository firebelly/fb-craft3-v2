// Careers page js

import appState from '../util/appState';

const careers = {

  init() {

    // Position accordions
    $('.accordion').each(function() {
      let $this = $(this);
      let href = $this.find('a')[0].href;
      $this.on('click', (e) => {
        if (!$this.hasClass('-active')) {
          e.preventDefault();
          history.pushState(null, null, href);
          careers.openAccordion($this);
        }
      });
      $this.find('a.collapse').on('click', (e) => {
        e.preventDefault();
        appState.isAnimating = true;
        $this
          .removeClass('-active')
          .find('.description')
          .velocity('slideUp', 500, 'easeOutCubic', () => {
            appState.isAnimating = false
          });
        // history.back();
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
    $accordion.addClass('-active');
    $accordion.find('.description').velocity('slideDown', 500, 'easeOutCubic', () => appState.isAnimating = false);
  },

  closeAccordions() {
    $('.accordion.-active')
      .removeClass('-active')
      .find('.description')
      .velocity('slideUp', 500, 'easeOutCubic', () => {
        appState.isAnimating = false
      });
  },

  openPerson($person) {
    $('body').removeClass('-cursor-active');
    let html = $person.find('.modal-content').html();
    let hash = $person.attr('data-person');
    modals.openModal(html, hash);
  },

  checkAccordion() {
    if (location.hash) {
      let $position = $(`[data-position="${window.location.hash.replace('#','')}"]`);
      if ($position.length) {
        careers.openAccordion($position);
        $position.velocity('scroll', { duration: 500, offset: -document.querySelector('.site-header').offsetHeight });
      }
    } else {
      careers.closeAccordions();
    }
  },

  finalize() {
    // JavaScript fired after the init JS

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
