<?php

namespace Pnpnd\ND;

use Pnpnd\ND\Utils\Helpers;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class Activation {

	public static function init() {
		if ( is_multisite() ) {
			$plugin_file  = constant( 'PNPND_FILE' );
			$network_wide = function_exists( 'is_plugin_active_for_network' )
				&& is_plugin_active_for_network( plugin_basename( $plugin_file ) );

			if ( $network_wide ) {
				$sites = get_sites( array( 'number' => 0 ) );
				foreach ( $sites as $site ) {
					switch_to_blog( $site->blog_id );
					self::activate_single_site();
					restore_current_blog();
				}
				update_network_option( null, 'pnpnd_network_activated', true );

				return;
			}
		}

		self::activate_single_site();
	}

	public static function activate_new_site( $new_site ) {
		$network_activated = get_network_option( null, 'pnpnd_network_activated', false );
		if ( ! $network_activated ) {
			return;
		}

		switch_to_blog( $new_site->blog_id );
		self::activate_single_site();
		restore_current_blog();
	}

	private static function activate_single_site() {
		Helpers::check_plugin_requirements();

		self::set_default_table();
		self::set_default_data();
		self::set_default_settings();
		self::set_rewrite_rules();
	}

	private static function set_default_table() {
		global $wpdb;
		$wpdb->hide_errors();
		if ( ! function_exists( 'dbDelta' ) ) {
			require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		}

		$tables = pnpnd_get_tables_definitions();

		foreach ( $tables as $table ) {
			dbDelta( $table );
		}
	}

	private static function set_default_data() {
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

	private static function set_default_settings() {
		$default_settings = get_option( PNPND_OPTIONS_NAME, false );

		if ( ! $default_settings ) {

			$default_settings = array(
				'integrations' => array(
					'active_integrations' => array( 'media_library' ),
					'media_library'       => array(
						'folders'           => array(),
						'ml_hover_preview'  => false,
						'delete_cloud_file' => false,
					),
				),
			);
			update_option( PNPND_OPTIONS_NAME, $default_settings );
		}
	}

	private static function set_rewrite_rules() {
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
