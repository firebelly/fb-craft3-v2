<?php
$config = [];
$request = Craft::$app->request;

// Support overriding toEmail from form value (which is set in admin on Contact entry field)
if (
  !$request->getIsConsoleRequest() &&
  ($toEmail = $request->getValidatedBodyParam('toEmail')) !== null
) {
  $config['toEmail'] = $toEmail;
}

return $config;
