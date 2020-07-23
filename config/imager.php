<?php
return [
  '*' => [
    'cacheDuration' => 31536000, // cache for a year
    'resizeFilter' => 'catrom', // quicker transforms
    'imagerUrl' => (strpos(getallheaders()['Cookie'], 'username') ? '@rootUrl/imager/' : '@cdnUrl/imager/'), // if not logged in, use cdn
  ],
];
