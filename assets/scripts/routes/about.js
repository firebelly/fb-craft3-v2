// About page js

// Shared vars among modules
import appState from '../util/appState';
import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';

export default {

  init() {
    let $body = $('body');
    let $html = $('html');
    let $modal = $('.modal');
    let $modalOverlay = $('.modal-overlay');
    let $modalContainer = $modal.find('.inner');

    // Sigh — duplicate content for mobile display only
    $('article.person').each(function() {
      let $social = $(this).find('ul.social').clone().removeClass('show-for-medium-up');
      $social.appendTo($(this).find('.person-body .inner')).addClass('hide-for-medium-up');
    });

    // Check for hash to open user
    if (window.location.hash) {
      let $person = $(`[data-person="${window.location.hash.replace('#','')}"]`);
      if ($person.length) {
        setTimeout(function() {
          _openPerson($person);
        }, 500);
      }
    }

    // Keyboard-triggered functions
    $(document).keyup(function(e) {
      // Escape key
      if (e.keyCode === 27) {
        _closeModal();
      }
    }).on('click', '.modal a.close-modal', function(e) {
      // Clicking on "[X] Close" button
      e.preventDefault();
      _closeModal();
    }).on('click', 'body.modal-open', function(e) {
      // Clicking outside of modal content closes modal
      let $target = $(e.target);
      // Make sure target not inside modal content
      if (!$target.hasClass('col-md-1-2') && $target.parents('.col-md-1-2').length === 0) {
        _closeModal();
      }
    });

    // Team links to modals
    $('.person img').on('click', function(e) {
      e.preventDefault();
      if (appState.isAnimating) {
        return;
      }
      let $person = $(this).parents('.person');
      _openPerson($person);
    });

    function _openPerson($person) {
      let $modalContent = $person.find('.modal-content').html();
      let personSlug = $person.attr('data-person');
      $modalContainer.html($modalContent);
      // Add close button
      $modalContainer.find('.container').append('<a href="#" class="close-modal"><svg class="icon icon-close-lg" aria-hidden="true"><use xlink:href="#icon-close-lg"/></svg></a>');
      // Set isAnimating to ignore any other triggers until modal is open
      appState.isAnimating = true;
      $modal.velocity('stop').velocity({
          opacity: [1, 0],
          translateY: [0, 15],
        }, {
          duration: 500,
          display: 'block',
          complete: function() {
            $body.addClass('modal-open');
            disableBodyScroll($('.modal .person-bio .-inner')[0]);
            $html.css('overflow', 'hidden');
            appState.isAnimating = false;
            window.location.hash = '#' + personSlug;
          }
        }
      )
      appState.modalOpen = true;
      _toggleOverlay();
    }

    function _closeModal() {
      if (appState.isAnimating || !appState.modalOpen) {
        return;
      }
      appState.modalOpen = false;
      $('.modal').velocity({
          opacity: [0, 1],
          translateY: [15, 0],
        }, {
          duration: 250,
          display: 'none',
          complete: function() {
            enableBodyScroll($('.modal .person-bio .-inner')[0]);
            $html.css('overflow', '');
            // Remove hash
            history.replaceState(null, null, ' ');
          }
        }
      );
      _toggleOverlay();
      $body.removeClass('modal-open');
    }

    function _toggleOverlay() {
      $modalOverlay.velocity({
          opacity: (appState.modalOpen ? 1 : 0)
        }, {
          duration: 50,
          display: (appState.modalOpen ? 'block' : 'none')
        });
    }

  },

  finalize() {
    // JavaScript to be fired on the about page, after the init JS
  },

};
