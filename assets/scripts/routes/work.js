// Work page js

import appState from '../util/appState';
import modals from '../util/modals';
import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';

export default {

  init() {
    let pageCache = {};
    let $document = $(document);
    let $page = $('#page');

    // Init filters modal
    modals.init('.modal .-inner');

    // Open filters modal when clicking "Change Filters"
    let filtersHtml = $('.modal-content').html();
    $document.on('click', 'a.filter-projects', function(e) {
      e.preventDefault();
      modals.openModal(filtersHtml);
    });

    // Use history API if available
    if (window.history && history.pushState) {
      // Store initial page content in cache
      pageCache[encodeURIComponent(location.pathname)] = $page.html();

      // Hijack clicks in filters modal as well as projects' services links
      $document.on('click', 'ul.services-nav a, .project .services a', function(e) {
        e.preventDefault();
        // Todo: set title in state data based on data attribute
        history.pushState(null, null, this.href);
        _loadPage();
      });

      // Watch for state change
      window.addEventListener('popstate', function(e) {
        _updatePage('noscroll');
      });
    }

    // Load AJAX content & store in pageCache array, then swap out page html
    function _loadPage() {
      if (pageCache[encodeURIComponent(location.pathname)]) {
        _updatePage();
      } else {
        $.ajax({
          url: location.pathname,
          method: 'get',
          dataType: 'html',
          success: function(response) {
            pageCache[encodeURIComponent(location.pathname)] = $.parseHTML(response);
            _updatePage();
          }
        });
      }
    }

    // Update page with cached content
    function _updatePage(noscroll) {
      let $content = $(pageCache[encodeURIComponent(location.pathname)]);
      $page.html($content);
      modals.closeModal();

      // Todo: update document.title once we figure out what they should be

      // If back/forward is used, don't scroll body to top
      if (typeof noscroll === 'undefined') {
        appState.isAnimating = true;
        $('#page > .container').velocity('scroll', {
          duration: 250,
          offset: -120,
          complete: function(elements) {
            appState.isAnimating = false;
          }
        }, 'easeOutSine');
      }
    }

  },

  finalize() {
    // JavaScript fired after the init JS
  },

};
