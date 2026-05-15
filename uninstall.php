<?php

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) || ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once plugin_dir_path( __FILE__ ) . 'core/config.php';

$pnpnd_tables = array(
	'pnpnd_widgets',
	'pnpnd_files',
	'pnpnd_accounts',
	'pnpnd_logs',
);

$pnpnd_options = array(
	'pnpnd_install_time',
	'pnpnd_encryption_key',
	'pnpnd_notice',
	'pnpnd_settings',
	'pnpnd_version',
);

if ( is_multisite() ) {
	$pnpnd_sites = get_sites( array( 'number' => 0 ) );
	foreach ( $pnpnd_sites as $pnpnd_site ) {
		switch_to_blog( $pnpnd_site->blog_id );
		pnpndMaybeCleanupSite( $pnpnd_tables, $pnpnd_options );
		restore_current_blog();
	}
	delete_network_option( null, 'pnpnd_network_activated' );
} else {
	pnpndMaybeCleanupSite( $pnpnd_tables, $pnpnd_options );
}

/**
 * Clean up plugin data for the current site if the setting allows it.
 *
 * @param array $tables List of custom table suffixes.
 * @param array $options List of option names to delete.
 */
function pnpndMaybeCleanupSite( array $tables, array $options ) {
	global $wpdb;

	$settings   = get_option( PNPND_OPTIONS_NAME, array() );
	$deleteData = $settings['advanced']['deleteDataOnUninstall'] ?? false;

	if ( ! $deleteData ) {
		return;
	}

	foreach ( $tables as $table ) {
		$wpdb->query( $wpdb->prepare( 'DROP TABLE IF EXISTS %i', "{$wpdb->prefix}$table" ) ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.DirectDatabaseQuery.SchemaChange
	}

	foreach ( $options as $key ) {
		delete_option( $key );
	}

    // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
	$wpdb->query(
		$wpdb->prepare(
			"DELETE FROM {$wpdb->options} WHERE option_name LIKE %s OR option_name LIKE %s",
			$wpdb->esc_like( '_transient_pnpnd_' ) . '%',
			$wpdb->esc_like( '_transient_timeout_pnpnd_' ) . '%'
		)
	);

	$timestamp = wp_next_scheduled( 'pnpnd_cron_fire' );
	if ( $timestamp ) {
		wp_unschedule_event( $timestamp, 'pnpnd_cron_fire' );
	}

	wp_cache_flush();
	flush_rewrite_rules();
}
