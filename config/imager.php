<?php
return [
  '*' => [
    'jpegoptimEnabled' => true,
    'optipngEnabled' => true,
    'imagerUrl' => '@rootUrl/imager/',
  ],
  'staging' => [
    'useCwebp' => true,
    'cwebpPath' => '/home/firebelly/bin/cwebp',
  ],
  'production' => [
    'useCwebp' => true,
    'cwebpPath' => '/home/firebelly/bin/cwebp',
  ],
];
