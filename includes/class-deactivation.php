<?php

namespace Pnpnd\ND;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class Deactivation {

	public static function init( $plugin = '', $network_wide = false ) {
		if ( is_multisite() && $network_wide ) {
			$sites = get_sites( array( 'number' => 0 ) );
			foreach ( $sites as $site ) {
				switch_to_blog( $site->blog_id );
				self::deactivate_single_site();
				restore_current_blog();
			}
			delete_network_option( null, 'pnpnd_network_activated' );
			return;
		}

		self::deactivate_single_site();
	}

	private static function deactivate_single_site() {
		self::unschedule_cron();

		flush_rewrite_rules();
	}

	private static function unschedule_cron() {
		$timestamp = wp_next_scheduled( 'pnpnd_cron_fire' );

		if ( $timestamp ) {
			wp_unschedule_event( $timestamp, 'pnpnd_cron_fire' );
		}
	}
}
