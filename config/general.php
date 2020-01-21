<?php
/**
 * General Configuration
 *
 * All of your system's general configuration settings go in here. You can see a
 * list of the available settings in vendor/craftcms/cms/src/config/GeneralConfig.php.
 *
 * @see craft\config\GeneralConfig
 */

return [
    // Global settings
    '*' => [
        // Default Week Start Day (0 = Sunday, 1 = Monday...)
        'defaultWeekStartDay' => 0,

        // Enable CSRF Protection (recommended)
        'enableCsrfProtection' => true,

        // Whether generated URLs should omit "index.php"
        'omitScriptNameInUrls' => true,

        // Control Panel trigger word
        'cpTrigger' => 'admin',

        // The secure key Craft will use for hashing and encrypting data
        'securityKey' => getenv('SECURITY_KEY'),

        // Allow extra file extensions to be uploaded to assets
        'extraAllowedFileExtensions' => 'woff, svg',

        // FB specifics
        'cdnUrl' => getenv('CDN_URL'),
        'stripePublishableKey' => getenv('STRIPE_PUBLISHABLE_KEY'),

        // Enable Project Config
        'useProjectConfigFile' => true,

        // Base site URL
        'siteUrl' => getenv('SITE_URL'),

        'aliases' => [
            '@rootUrl' => getenv('SITE_URL'),
        ],
    ],

    // Dev environment settings
    'dev' => [
        // Fix backing up mysql on dev w/ homebrew mysql
        'backupCommand' =>  "/usr/local/bin/mysqldump -h localhost -u root -proot --add-drop-table --comments --create-options --dump-date --no-autocommit --routines --set-charset --triggers --single-transaction --no-data --result-file=\"{file}\" {database} && /usr/local/bin/mysqldump -h localhost -u root -proot --add-drop-table --comments --create-options --dump-date --no-autocommit --routines --set-charset --triggers --no-create-info --ignore-table={database}.assetindexdata --ignore-table={database}.assettransformindex --ignore-table={database}.cache --ignore-table={database}.sessions --ignore-table={database}.templatecaches --ignore-table={database}.templatecachecriteria --ignore-table={database}.templatecacheelements {database} >> \"{file}\"",
        'restoreCommand' => "/usr/local/bin/mysql -h localhost -u root -proot {database} < \"{file}\"",
        // Dev Mode (see https://craftcms.com/support/dev-mode)
        'devMode' => true,
    ],

    // Staging environment settings
    'staging' => [
        // Disable project config changes & updates on staging
        'allowAdminChanges' => false,
        'allowUpdates' => false,
    ],

    // Production environment settings
    'production' => [
        // Disable project config changes & updates on production
        'allowAdminChanges' => false,
        'allowUpdates' => false,
    ],
];
