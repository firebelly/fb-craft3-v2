// Work page js

import appState from '../util/appState';
import imageReveals from '../util/imageReveals';
import modals from '../util/modals';
import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';

let $document = $(document);

export default {

  init() {
    // ajax load projects from filter-nav
    $document.on('click.filters', '#filters a, .filtered-title a', function(e) {
      e.preventDefault();

      const $this = $(this);
      let clearFilter,
          $parentFilter,
          title;

      // Drop opacity of page until projects are loaded
      $('#page').css('opacity', '0.5');

      // If it's a filter link (as opposed to a clear filter link)
      if ($this.parents('#filters').length) {
        clearFilter = false;
        $parentFilter = $this.closest('.filter-nav');
        title = $this.find('.filter-title').html();
      } else  {
        clearFilter = true;
      }

      const href = this.getAttribute('href');

      $.get( href, function( data ) {
        const $data = $(data);
        let projects = $data.find('.thumbnail-grid');

        // Add to browser history
        history.pushState(null, null, href);

        // Reset active classes
        $('.filter-nav.-active').removeClass('-active');
        $('.filter-nav li.-active').removeClass('-active');

        if (!clearFilter) {
          $parentFilter.addClass('-active');
          $this.parent('li').addClass('-active');
          // Reset active classest
          $('.filter-nav').not($parentFilter).find('.all-option').addClass('hidden');
          // Show/hide "all" filter options
          if (title !== 'All') {
            $parentFilter.find('.all-option').removeClass('hidden');
          } else {
            $parentFilter.find('.all-option').addClass('hidden');
          }
          // Set section title
          $('.filtered-title').html(title + ' projects <a href="/work" data-no-swup><span class="visually-hidden">Clear Filter</span><svg class="icon-close" aria-hidden="true" role="presentation"><use xlink:href="#icon-close"/></svg></a>');
        } else {
          $('.filtered-title').html('All Projects');
          $('.all-option').addClass('hidden');
        }

        $('#projects-container').html(projects);
      })
      .done(function() {
        $('#page').css('opacity', '1');

        // run image reveals to show projects
        imageReveals.init();
      })
      .fail(function() {
        $('#projects-container').html('<h2 class="error">We had some trouble processing your request. Try reloading the page and trying again.');
      });
    });

  },

  finalize() {
    // JavaScript fired after the init JS
  },

  unload() {
    // JavaScript to clean up before live page reload
    modals.unload();
    $document.off('click.filters');
  },

};
