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
      // Escape key goes back (closing modal)
      if (e.keyCode === 27 && !appState.isAnimating && appState.modalOpen) {
        e.preventDefault();
        history.back();
      }
    }).on('click.modal', '.modal a.close-modal', e => {
      // Clicking on X (close) button
      e.preventDefault();
      history.back();
    });

    // Watch for back button and close modal if open
    window.addEventListener('popstate', modals.checkModal);

  },

  checkModal: function() {
    if (appState.modalOpen) {
      modals.closeModal();
    }
  },

  // Open a modal with html
  openModal: function(html) {
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
        }
      }
    )
    appState.modalOpen = true;
    modals.toggleOverlay();
  },

  // Close the modal
  closeModal: function() {
    if (!appState.modalOpen) {
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
          // appState.modalJustClosed = true;
          enableBodyScroll($(scrollableSelector)[0]);
          $html.css('overflow', '');
        }
      }
    );
    modals.toggleOverlay();
    $body.removeClass('modal-open');
    $('.modal').scrollTop(0);
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
    window.removeEventListener('popstate', modals.checkModal);
  }

};

export default modals
