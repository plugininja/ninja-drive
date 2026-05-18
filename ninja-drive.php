<?php

namespace Pnpnd;

use Pnpnd\ND\Activation;
use Pnpnd\ND\Autoload;
use Pnpnd\ND\Deactivation;
use Pnpnd\ND\Plugininja;

/**
 * Plugin Name:       Ninja Drive
 * Plugin URI:        https://plugininja.com/ninja-drive/
 * Description:       Seamlessly integrate Google Drive with WordPress to embed, share, play, and download documents and media files directly from Google Drive.
 * Version:           1.0.0
 * Requires at least: 6.2
 * Requires PHP:      7.4
 * Author:            Plugininja
 * Author URI:        https://plugininja.com
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       ninja-drive
 * Domain Path:       /languages/
 *
 * This plugin bundles a modified version of the Google API Client library
 * (vendors/Google/), which is licensed under the Apache License, Version 2.0.
 * Apache 2.0 is compatible with GPLv3; as this plugin is "GPL-2.0-or-later",
 * the combined work may be distributed under GPLv3 terms.
 */

if (! defined('ABSPATH')) {
    exit('Direct access to this file is not allowed.');
}

if (! class_exists('\Pnpnd\ND\Autoload')) {

    define('PNPND_FILE', __FILE__);

    require_once plugin_dir_path(PNPND_FILE) . 'core/config.php';
    require_once plugin_dir_path(PNPND_FILE) . 'core/functions.php';
    require_once plugin_dir_path(PNPND_FILE) . 'includes/Autoload.php';

    Autoload::register();
    register_activation_hook(__FILE__, [ Activation::class, 'init' ]);
    register_deactivation_hook(__FILE__, [ Deactivation::class, 'init' ]);
    Plugininja::getInstance();
}
