// Work page js

import appState from '../util/appState';
import imageReveals from '../util/imageReveals';
import modals from '../util/modals';
import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';

let $document = $(document);

export default {

  init() {
    // ajax load projects from filter-nav
    $document.on('click.filters', '#filters a', function(e) {
      e.preventDefault();

      const $this = $(this);
      const $parentFilter = $this.closest('.filter-nav');
      const title = $this.find('.filter-title').html();
      const href = this.getAttribute('href');

      $.get( href, function( data ) {
        const $data = $(data);
        let projects = $data.find('.thumbnail-grid');

        // Add to browser history
        history.pushState(null, null, href);

        // Reset active classes
        $('.filter-nav.-active').removeClass('-active');
        $parentFilter.addClass('-active');
        $('.filter-nav li.-active').removeClass('-active');
        $this.parent('li').addClass('-active');

        // Reset titles and populate projects
        let defaultLabel = $parentFilter.find('button .label').attr('data-default');
        let otherDefaultLabel = $('.filter-nav').not($parentFilter).find('button .label').attr('data-default');
        $('.filter-nav').not($parentFilter).find('button .label').html(otherDefaultLabel);
        $('.filter-nav').not($parentFilter).find('.all-option').addClass('hidden');

        if (title !== 'All') {
          $parentFilter.find('.all-option').removeClass('hidden');
          $parentFilter.find('button .label').html(title);
        } else {
          $parentFilter.find('.all-option').addClass('hidden');
          $parentFilter.find('button .label').html(defaultLabel);
        }

        $('.filtered-title').html(title + ' projects');
        $('#projects-container').html(projects);
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
