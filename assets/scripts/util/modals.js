// Modals

import appState from '../util/appState';
import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';

// Shared vars
let $body = $('body'),
            $document = $(document),
            $html = $('html'),
            $modal,
            $modalOverlay,
            $modalContainer,
            scrollableSelector;

const modals = {

  // Init modals
  init: function(scrollableSelectorValue) {
    // Inject modal html if not in DOM
    if ($('.modal-overlay').length === 0) {
      $body.append(`
        <div class="modal-overlay"></div>
        <div class="modal">
          <a href="#" class="close-modal"><svg class="icon icon-close-lg" aria-hidden="true"><use xlink:href="#icon-close-lg"/></svg></a>
          <div class="inner"></div>
        </div>
      `);
    }
    $modal = $('.modal');
    $modalOverlay = $('.modal-overlay');
    $modalContainer = $modal.find('.inner');

    // Selector of div that scrolls when bodylock is enabled
    scrollableSelector = scrollableSelectorValue;

    // Keyboard-triggered functions
    $document.keyup(e => {
      // Escape key
      if (e.keyCode === 27) {
        modals.closeModal();
      }
    }).on('click.modal', '.modal a.close-modal', e => {
      // Clicking on X (close) button
      e.preventDefault();
      modals.closeModal();
    });

  },

  // Open a modal with html, set window.hash for linkability
  openModal: function(html, hash) {
    $modalContainer.html(html);
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
          disableBodyScroll($(scrollableSelector)[0]);
          $html.css('overflow', 'hidden');
          appState.isAnimating = false;
          // if (typeof hash !== 'undefined') {
          //   window.location.hash = `#${hash}`;
          // }
        }
      }
    )
    appState.modalOpen = true;
    modals.toggleOverlay();
  },

  // Close the modal
  closeModal: function() {
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
          enableBodyScroll($(scrollableSelector)[0]);
          $html.css('overflow', '');
          // Remove hash
          // history.replaceState(null, null, ' ');
        }
      }
    );
    modals.toggleOverlay();
    $body.removeClass('modal-open');
  },

  // Toggle modal overlay
  toggleOverlay: function() {
    $modalOverlay.velocity({
        opacity: (appState.modalOpen ? 1 : 0)
      }, {
        duration: 50,
        display: (appState.modalOpen ? 'block' : 'none')
      });
  },

  // Remove events
  unload: function() {
    $document.off('click.modal');
  }

};

export default modals
