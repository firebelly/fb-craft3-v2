<?php
return [
  '*' => [
    'jpegoptimEnabled' => true,
    'optipngEnabled' => true,
    'imagerUrl' => '@rootUrl/imager/',
  ],
  'staging' => [
    'useCwebp' => false, // disabling cwebp as it uses shell_exec() which is disabled in Opalstack, and it's a resource hog
    'cwebpPath' => '/home/firebelly/bin/cwebp',
  ],
  'production' => [
    'useCwebp' => false,
    'cwebpPath' => '/home/firebelly/bin/cwebp',
  ],
];
