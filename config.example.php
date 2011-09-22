<?php

/**
 * NOTE: Use the $appConfigDevelopment config fore now.
 */

/**
 * There are two modes in this program. One for development and one for 
 * production. You can change this mode my editing the 'mode' parameter in the 
 * underlying code. Every mode has its own config array.
 */
$appConfig = array(
    'mode' => 'development', // or production
);

/**
 * Config for Development mode.
 * ============================
 * template.path: absulute path to the folder that contains the templates.
 * subdir: The path to the hostname that hosts the Data-Tank UI.
 * tdt-url: Url of the Data-Tank this UI uses to get and set its data.
 *
 * NOTE: all paths are without trailing slash unless otherwise noted.
 */
$appConfigDevelopment = array(
    'debug' => true,
    'log.enable' => true,
    'log.path' => '/tmp/',
    'log.level' => 4,
    'templates.path' => '/Users/abe/Sites/The-DataTank-GUI/templates',
    'view' => 'TwigView',
    // Name of the host that runs the UI.
    'hostname' => 'http://localhost',
    'subdir' => '/~abe/The-DataTank-GUI/app.php',
    'static' => '/~abe/The-DataTank-GUI/static',
    // Name of the host where the datatank is hosted
    'tdt-url' => 'http://localhost',
    'database.dsn' => 'sqlite:/tmp/tdt.db',
    'database.user' => '',
    'database.password' => '',
    'tdt.content-type' => 'json',
    'tdt.cache-system' => 'NoCache',
);

/**
 * Config for Production mode.
 */
$appConfigProduction = array(
    'debug' => true,
    'log.enable' => true,
    'log.path' => '/tmp/',
    'log.level' => 4,
    'templates.path' => '/Users/abe/Sites/The-DataTank-GUI/templates',
    'view' => 'TwigView',
    // Name of the host that runs the UI.
    'hostname' => 'http://localhost',
    'subdir' => '/~abe/The-DataTank-GUI/app.php',
    'static' => '/~abe/The-DataTank-GUI/static',
    // Name of the host where the datatank is hosted
    'tdt-url' => 'http://localhost',
    'database.dsn' => 'sqlite:/tmp/tdt.db',
    'database.user' => '',
    'database.password' => '',
    'tdt.content-type' => 'json',
    'tdt.cache-system' => 'NoCache',
);

