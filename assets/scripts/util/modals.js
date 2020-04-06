// Modals

import appState from '../util/appState';
import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';

// Shared vars
const reducedMotionMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
let $body = $('body'),
            $document = $(document),
            $html = $('html'),
            $modal,
            $modalOverlay,
            $modalContainer,
            scrollableSelector,
            eventBinded = false,
            useHistory = true;

// Accessibility/tab trap taken from https://github.com/gdkraus/accessible-modal-dialog
// jQuery formatted selector to search for focusable items
let focusableElementsString = "a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, *[tabindex], *[contenteditable]";

// store the item that has focus before opening the modal window
let focusedElementBeforeModal;

const modals = {

  // Init modals
  init: function(scrollableSelectorValue) {
    // Inject modal html if not in DOM
    if ($('.modal-overlay').length === 0) {
      $body.append(`
        <div class="modal-overlay"></div>
        <div class="modal">
          <div class="inner"></div>
          <a href="#" class="close-modal"><svg class="icon icon-close-lg" aria-hidden="true"><use xlink:href="#icon-close-lg"/></svg></a>
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
      // Disabling esc key trigger again because it's firing multiple times and we can't figure out why
      // Escape key goes back (closing modal)
      // if (e.keyCode === 27 && !eventBinded && !appState.isAnimating && appState.modalOpen) {
      //   e.preventDefault();
      //   if (useHistory) {
      //     history.back();
      //   } else {
      //     modals.closeModal();
      //   }
      // }
    }).on('click.modal', '.modal a.close-modal', e => {
      // Clicking on X (close) button
      e.preventDefault();
      if (useHistory) {
        history.back();
      } else {
        modals.closeModal();
      }
    });

    // Trap tab key inside modal
    $('.modal').keydown(function(event) {
      modals.trapTabKey($(this), event);
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
  openModal: function(html, noHistory) {
    if (typeof noHistory !== 'undefined') {
      useHistory = false;
    } else {
      useHistory = true;
    }

    $modalContainer.html(html);
    // Set isAnimating to ignore any other triggers until modal is open
    appState.isAnimating = true;
    // Only animate opening if user doesn't prefer reduced motion
    if (!reducedMotionMQ.matches) {
      $modal.velocity('stop').velocity({
          opacity: [1, 0],
          translateY: [0, 15],
        }, {
          duration: 500,
          display: 'block',
          complete: function() {
            modals.enableModal();
          }
        }
      );
    } else {
      $modal.css({
        'display': 'block',
        'opacity': 1,
      });
      modals.enableModal();
    }
    appState.modalOpen = true;
    modals.toggleOverlay();

    // attach a listener to redirect the tab to the modal window if the user somehow gets out of the modal window
    $('body').on('focusin', '.site-main', function() {
      modals.setFocusToFirstItemInModal($('.modal'));
    });

    // save current focus
    focusedElementBeforeModal = $(':focus');
    // If trigger is person modal
    if (focusedElementBeforeModal.parents('.person').length) {
      var person = focusedElementBeforeModal.parents('.person')
      appState.personModalTrigger = person.attr('data-person');
    }
  },

  enableModal: function() {
    $body.addClass('modal-open');
    $modal.scrollTop(0);
    disableBodyScroll($(scrollableSelector)[0]);
    $html.css('overflow', 'hidden');
    appState.isAnimating = false;
  },

  // Close the modal
  closeModal: function() {
    if (!appState.modalOpen) {
      return;
    }
    appState.modalOpen = false;
    if (!reducedMotionMQ.matches) {
      $('.modal').velocity({
          opacity: [0, 1],
          translateY: [15, 0],
        }, {
          duration: 250,
          display: 'none',
          complete: function() {
            // appState.modalJustClosed = true;
            modals.disableModal();
          }
        }
      );
    } else {
      $modal.css({
        'opacity': 1,
        'display': 'none'
      });
      modals.disableModal();
    }
    modals.toggleOverlay();
    $body.removeClass('modal-open');

    // remove the listener which redirects tab keys in the main content area to the modal
    $('body').off('focusin','.site-main');

    // set focus back to element that had it before the modal was opened
    if (!appState.personModalTrigger) {
      focusedElementBeforeModal.focus();
    }
  },

  disableModal: function() {
    enableBodyScroll($(scrollableSelector)[0]);
    $html.css('overflow', '');
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
  },

  trapTabKey: function(obj, evt) {
    // if tab or shift-tab pressed
    if (evt.which == 9) {

      // get list of all children elements in given object
      var o = obj.find('*');

      // get list of focusable items
      var focusableItems;
      focusableItems = o.filter(focusableElementsString).filter(':visible')

      // get currently focused item
      var focusedItem;
      focusedItem = $(':focus');

      // get the number of focusable items
      var numberOfFocusableItems;
      numberOfFocusableItems = focusableItems.length

      // get the index of the currently focused item
      var focusedItemIndex;
      focusedItemIndex = focusableItems.index(focusedItem);

      if (evt.shiftKey) {
        //back tab
        // if focused on first item and user preses back-tab, go to the last focusable item
        if (focusedItemIndex == 0) {
          focusableItems.get(numberOfFocusableItems - 1).focus();
          evt.preventDefault();
        }

      } else {
        //forward tab
        // if focused on the last item and user preses tab, go to the first focusable item
        if (focusedItemIndex == numberOfFocusableItems - 1) {
          focusableItems.get(0).focus();
          evt.preventDefault();
        }
      }
    }
  },

  setFocusToFirstItemInModal: function(obj) {
    // get list of all children elements in given object
    var o = obj.find('*');

    // set the focus to the first keyboard focusable item
    o.filter(focusableElementsString).filter(':visible').first().focus();
  }

};

export default modals
