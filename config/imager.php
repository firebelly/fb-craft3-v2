<?php
return [
  '*' => [
    'cacheDuration' => 31536000, // cache for a year
    'resizeFilter' => 'catrom', // quicker transforms
    'imagerUrl' => (Craft::$app->getUser() ? '/imager/' : '@cdnUrl/imager/'),
  ],
];
