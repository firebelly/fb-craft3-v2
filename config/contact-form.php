<?php
use craft\contactform\models\Submission;
use yii\base\Event;
use \DrewM\MailChimp\MailChimp;

Event::on(Submission::class, Submission::EVENT_AFTER_VALIDATE, function(Event $e) {

  // Subscribe user to Mailchimp list on contact submission
  // $apiKey = getenv('MAILCHIMP_API_KEY');
  // if (!empty($apiKey)) {

  //   $submission = $e->sender;
  //   $siteOptions = \craft\elements\GlobalSet::find()
  //     ->handle('siteOptions')
  //     ->one();
  //   $listId = $siteOptions->misc->mailchimpListId;
  //   $email = $submission->fromEmail;
  //   $name = $submission->fromName;

  //   // Split name for mailchimp
  //   $parts = explode(' ', $name);
  //   if(count($parts) > 1) {
  //     $last = array_pop($parts);
  //     $first = implode(" ", $parts);
  //   } else {
  //     $first = $name;
  //     $last = '';
  //   }

  //   // Subscribe user to mailchimp list
  //   if (!empty($listId)) {
  //     try {
  //       $MailChimp = new MailChimp($apiKey);
  //       $result = $MailChimp->post("lists/{$listId}/members", [
  //         'email_address' => $email,
  //         'merge_fields'  => ['FNAME'=>$first, 'LNAME'=>$last],
  //         'status'        => 'subscribed',
  //       ]);
  //     } catch (Exception $e) {
  //       $submission->addError('mailchimp', $e->getMessage());
  //     }
  //   }
  // }

});
