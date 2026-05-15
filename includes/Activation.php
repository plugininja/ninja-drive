<?php

namespace Pninja\ND;

use Pninja\ND\Utils\Helpers;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class Activation {

	public static function init() {
		if ( is_multisite() ) {
			$pluginFile  = constant( 'PNPND_FILE' );
			$networkWide = function_exists( 'is_plugin_active_for_network' )
				&& is_plugin_active_for_network( plugin_basename( $pluginFile ) );

			if ( $networkWide ) {
				$sites = get_sites( array( 'number' => 0 ) );
				foreach ( $sites as $site ) {
					switch_to_blog( $site->blog_id );
					self::activateSingleSite();
					restore_current_blog();
				}
				update_network_option( null, 'pnpnd_network_activated', true );
				return;
			}
		}

		self::activateSingleSite();
	}

	public static function activateNewSite( $newSite ) {
		$networkActivated = get_network_option( null, 'pnpnd_network_activated', false );
		if ( ! $networkActivated ) {
			return;
		}

		switch_to_blog( $newSite->blog_id );
		self::activateSingleSite();
		restore_current_blog();
	}

	private static function activateSingleSite() {
		Helpers::checkPluginRequirements();

		self::setDefaultTable();
		self::setDefaultData();
		self::setDefaultSettings();
		self::setRewriteRules();
	}

	private static function setDefaultTable() {
		global $wpdb;
		$wpdb->hide_errors();
		if ( ! function_exists( 'dbDelta' ) ) {
			require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		}

		$tables = pnpndGetTablesDefinitions();

		foreach ( $tables as $table ) {
			dbDelta( $table );
		}
	}

	private static function setDefaultData() {
		if ( ! get_option( 'pnpnd_version' ) ) {
			update_option( 'pnpnd_version', PNPND_VERSION );
		}

		if ( ! get_option( 'pnpnd_install_time' ) ) {
			update_option( 'pnpnd_install_time', current_time( 'mysql' ) );
		}

		if ( ! get_option( 'pnpnd_encryption_key' ) ) {
			update_option( 'pnpnd_encryption_key', wp_generate_uuid4() );
		}

		set_transient( 'pnpnd_rating_notice_interval', 'off', 10 * DAY_IN_SECONDS );
	}

	private static function setDefaultSettings() {
		$default_settings = get_option( PNPND_OPTIONS_NAME, false );

		if ( ! $default_settings ) {

			$default_settings = array(
				'integrations' => array(
					'activeIntegrations' => array( 'mediaLibrary' ),
					'mediaLibrary'       => array(
						'folders'         => array(),
						'mlHoverPreview'  => false,
						'deleteCloudFile' => false,
					),
				),
			);
			update_option( PNPND_OPTIONS_NAME, $default_settings );
		}
	}

	/**
	 * Sets up rewrite rules for the plugin.
	 *
	 * This function adds a rewrite rule that matches the following pattern:
	 * ^pnpnd/([^/]+)/([^/]+)/([^/]+)\.([^/]+)$
	 * The pattern matches the following example URL:
	 * https://example.com/pnpnd/action/key/name.ext
	 *
	 * The matched groups are mapped to the following query parameters:
	 * - action: $matches[1]
	 * - key: $matches[2]
	 * - name: $matches[3]
	 * - ext: $matches[4]
	 * The rewrite rule is added with a priority of 'top' to ensure it takes precedence over other rules.
	 *
	 * @since 1.2.0
	 *
	 * @return void
	 */
	private static function setRewriteRules() {
		add_rewrite_rule(
			'^pnpnd/([^/]+)/([^/]+)/([^/]+)\.([^/]+)$',
			'index.php?pnpnd-action=$matches[1]&pnpnd-key=$matches[2]&pnpnd-name=$matches[3]&pnpnd-ext=$matches[4]',
			'top'
		);

		add_rewrite_rule(
			'^pnpnd/([^/]+)/([^/]+)/([^/]+)/([^/]+)$',
			'index.php?pnpnd-action=$matches[1]&pnpnd-key=$matches[2]&pnpnd-name=$matches[3]&pnpnd-ext=$matches[4]',
			'top'
		);

		add_rewrite_rule(
			'^pnpnd/([^/]+)/([^/]+)$',
			'index.php?pnpnd-action=$matches[1]&pnpnd-key=$matches[2]',
			'top'
		);

		flush_rewrite_rules();
	}
}
