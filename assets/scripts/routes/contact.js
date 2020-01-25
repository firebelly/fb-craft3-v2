// Contact page js

import appState from '../util/appState';

export default {

  init() {
    // This should probably just be done in CSS ¯\_(ツ)_/¯
    $('form.newsletter').removeClass('-light').find('button').removeClass('-white');

    // Hijack contact form submit
    $('.contact-form form').submit(function(e) {
      e.preventDefault();
      if (appState.requestInProgress) {
        return false;
      }
      let $form = $(this);
      let $status = $form.find('.status');
      let $subject = $form.find('input[name=subject]');
      let fromName = $form.find('input[name=fromName]').val();

      // Set dynamic subject line to avoid gmail making a conversation thread and hiding text
      $subject.val($subject.data('original-value') + ' from ' + fromName);

      // Set appState flag to avoid multiple submits
      appState.requestInProgress = true;

      // Store initial thanks copy if replaced by error
      let thanksHtml = $status.html();
      $status.removeClass('success error');
      $form.addClass('working');

      // Submit form
      $.post({
        url: '/',
        dataType: 'json',
        data: $form.serialize(),
        success: (response) => {
          if (response.success) {
            $form.prop('disabled', true).find('fieldset, button').velocity('slideUp', 250, 'easeOutCubic');
            $status.addClass('success').html(thanksHtml);
          } else {
            $status.addClass('error').html('Oh no! Something went wrong.<br>Please check everything and try again.');
          }
        }
      }).fail(() => {
        $status.addClass('error').html('Oh no! Something went wrong.<br>Please check everything and try again.');
      }).always(() => {
        $form.removeClass('working');
        appState.requestInProgress = false;
      });
    });
  },

  finalize() {
    // JavaScript fired after the init JS
  },

  unload() {
    // JavaScript to clean up before live page reload
    $('form.newsletter').addClass('-light').find('button').addClass('-white');
  },

};
