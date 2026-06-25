<?php

defined( 'ABSPATH' ) || exit( 'Direct access to this file is not allowed.' );

/**
 * Plugin version information
 */
define( 'PNPND_DB_VERSION', '1.2.0' );
define( 'PNPND_OPTIONS_VERSION', '1.0.0' );
define( 'PNPND_VERSION', '2.0.1' );

define( 'PNPND_URL', plugin_dir_url( PNPND_FILE ) );
define( 'PNPND_ASSETS', PNPND_URL . 'assets' );

define( 'PNPND_BUILD_ASSETS', PNPND_URL . 'build' );
define( 'PNPND_PLUGIN_URL', 'https://plugininja.com/ninja-drive/' );
define( 'PNPND_INCLUDES_URL', PNPND_URL . 'includes' );
define( 'PNPND_INTEGRATIONS_URL', PNPND_INCLUDES_URL . '/Integrations' );
define( 'PNPND_BLOCKS_URL', PNPND_INTEGRATIONS_URL . '/Blocks' );

/**
 * Plugin directory paths
 */
define( 'PNPND_PATH', plugin_dir_path( PNPND_FILE ) );
define( 'PNPND_APP', PNPND_PATH . 'app' );
define( 'PNPND_INCLUDES', PNPND_PATH . 'includes' );
define( 'PNPND_INTEGRATIONS', PNPND_INCLUDES . '/Integrations' );
define( 'PNPND_MODELS', PNPND_PATH . 'models' );
define( 'PNPND_UPDATES', PNPND_INCLUDES . '/Updates' );
define( 'PNPND_VENDORS', PNPND_PATH . 'vendors' );

/**
 * Plugin author information
 */
define( 'PNPND_AUTHOR', 'Plugininja' );
define( 'PNPND_AUTHOR_URL', 'https://plugininja.com' );

/**
 * OAuth redirect URIs for Google Drive authentication.
 *
 * PNPND_REDIRECT_URI routes through the local site URL to handle the OAuth
 * handshake. No file content or user data passes through this server —
 * it only facilitates the OAuth token exchange with Google.
 */
define( 'PNPND_REDIRECT_URI', site_url( '/?authorization=ninja-drive' ) );

/**
 * Plugin constants for Google Drive API fields
 */
define( 'PNPND_FILE_FIELDS', 'capabilities(canEdit,canRename,canDelete,canShare,canTrash,canMoveItemWithinDrive),shared,starred,sharedWithMeTime,description,fileExtension,iconLink,id,driveId,imageMediaMetadata(height,rotation,width,time),mimeType,createdTime,modifiedTime,name,ownedByMe,parents,size,thumbnailLink,trashed,videoMediaMetadata(height,width,durationMillis),webContentLink,webViewLink,exportLinks,permissions(id,type,role,domain),copyRequiresWriterPermission,shortcutDetails,resourceKey' );
define( 'PNPND_LIST_CHANGES_FIELDS', 'changes(file(' . PNPND_FILE_FIELDS . '),removed, changeType, fileId),newStartPageToken,nextPageToken' );
define( 'PNPND_LIST_FIELDS', 'files( ' . PNPND_FILE_FIELDS . '),nextPageToken' );

/**
 * Plugin localization
 */
define( 'PNPND_TEXTDOMAIN', 'ninja-drive' );
define( 'PNPND_TEXTDOMAIN_PATH', dirname( plugin_basename( PNPND_FILE ) ) . '/languages/' );

/**
 * Plugin naming and slug
 */
define( 'PNPND_NAME', 'Ninja Drive' );
define( 'PNPND_OPTIONS_NAME', 'pnpnd_settings' );
define( 'PNPND_SLUG', PNPND_TEXTDOMAIN );

/**
 * Plugin minimum requirements
 */
define( 'PNPND_PHP_VERSION', '7.4' );
define( 'PNPND_WP_VERSION', '6.2' );

/**
 * Plugin database
 */
define( 'PNPND_DB_PREFIX', 'pnpnd_' );

/**
 * Chunk size for file uploads (5 MB)
 */
define( 'PNPND_CHUNK_SIZE', 5 * 1024 * 1024 );

define( 'PNPND_UNSET', '[unset]' );

/**
 * Plugin documentation URL
 */
define( 'PNPND_DOCUMENTATION_URL', 'https://plugininja.com/docs-category/ninja-drive/' );

// Required functions for the plugin to work
require_once __DIR__ . '/functions.php';
