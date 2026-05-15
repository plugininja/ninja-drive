<?php

namespace Pninja\ND;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class Deactivation {

	public static function init( $plugin = '', $networkWide = false ) {
		if ( is_multisite() && $networkWide ) {
			$sites = get_sites( array( 'number' => 0 ) );
			foreach ( $sites as $site ) {
				switch_to_blog( $site->blog_id );
				self::deactivateSingleSite();
				restore_current_blog();
			}
			delete_network_option( null, 'pnpnd_network_activated' );
			return;
		}

		self::deactivateSingleSite();
	}

	private static function deactivateSingleSite() {
		self::unscheduleCron();

		flush_rewrite_rules();
	}

	private static function unscheduleCron() {
		$timestamp = wp_next_scheduled( 'pnpnd_cron_fire' );

		if ( $timestamp ) {
			wp_unschedule_event( $timestamp, 'pnpnd_cron_fire' );
		}
	}
}
