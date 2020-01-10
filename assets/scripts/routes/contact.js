// Contact page js

import appState from '../util/appState';

export default {

  init() {
    // Hijack contact form submit
    $('.contact-form form').submit(function(e) {
      e.preventDefault();
      if (appState.requestInProgress) {
        return false;
      }
      let $this = $(this);

      // Set appState flag to avoid multiple submits
      appState.requestInProgress = true;
      let $status = $this.find('.status');

      // Store initial thanks copy if replaced by error
      let thanksHtml = $status.html();
      $status.removeClass('active');

      // Submit form
      $.post({
        url: '/',
        dataType: 'json',
        data: $this.serialize(),
        success: (response) => {
          if (response.success) {
            $this.prop('disabled', true).find('fieldset, button').slideUp(250);
            $status.html(thanksHtml);
          } else {
            $status.html('Oh no! Something went wrong.<br>Please check everything and try again.');
          }
        }
      }).fail(() => {
        $status.html('Oh no! Something went wrong.<br>Please check everything and try again.');
      }).always(() => {
        appState.requestInProgress = false;
        $status.addClass('active');
      });
    });
  },

  finalize() {
    // JavaScript fired after the init JS
  },

  unload() {
    // JavaScript to clean up before live page reload
  },

};
