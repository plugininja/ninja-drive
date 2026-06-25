<?php

namespace Pnpnd\ND;

use Pnpnd\ND\Traits\Singleton;
use Pnpnd\ND\Updates\Migration_Runner;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

/**
 * Renders a wp-admin notice prompting the user to drop the legacy
 * `pnpnd_files.meta_data` column once data has been safely migrated
 * to `pnpnd_file_meta`.
 *
 * Visibility conditions:
 *   1. User has `manage_options` capability.
 *   2. Migration 1.1.0 has been applied (recorded in audit table).
 *   3. The legacy `meta_data` column still exists.
 *   4. The user has not dismissed the notice.
 *
 * Dismissal storage:
 *   - User meta `pnpnd_cleanup_dismissed` (bool) for "Never" and after "Clean up".
 *   - Transient `pnpnd_cleanup_dismissed_{user_id}` (30 days) for "Remind me later".
 *
 * Action handlers (GET with nonce):
 *   - `pnpnd_action=cleanup_legacy_meta` → run Migration_Runner, set permanent dismiss
 *   - `pnpnd_action=dismiss_legacy_meta_later` → set 30-day transient
 *   - `pnpnd_action=dismiss_legacy_meta_forever` → set permanent dismiss without cleanup
 */
class Legacy_Cleanup_Notice {

	use Singleton;

	private const USER_META_KEY = 'pnpnd_cleanup_dismissed';
	private const TRANSIENT_KEY = 'pnpnd_cleanup_dismissed_';

	public function __construct() {
		add_action( 'admin_notices', array( $this, 'maybe_render' ) );
		add_action( 'admin_init', array( __CLASS__, 'handle_actions' ) );
	}

	public function maybe_render(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		if ( ! self::is_migration_applied() ) {
			return;
		}

		if ( ! self::column_exists() ) {
			return;
		}

		if ( self::is_dismissed() ) {
			return;
		}

		$this->render();
	}

	/**
	 * Run the cleanup action handlers from `admin_init`.
	 *
	 * GET-based for simplicity (a single admin button on a wp-admin notice),
	 * with nonce verification per action.
	 */
	public static function handle_actions(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}
		if ( empty( $_GET['pnpnd_action'] ) ) {
			return;
		}

		$action  = sanitize_text_field( wp_unslash( $_GET['pnpnd_action'] ) );
		$user_id = get_current_user_id();

		switch ( $action ) {
			case 'cleanup_legacy_meta':
				check_admin_referer( 'pnpnd_cleanup_legacy_meta' );
				Migration_Runner::run();
				update_user_meta( $user_id, self::USER_META_KEY, true );
				wp_safe_redirect(
					add_query_arg(
						array( 'pnpnd_cleanup_result' => 'done' ),
						remove_query_arg( array( 'pnpnd_action', '_wpnonce' ) )
					)
				);
				exit;

			case 'dismiss_legacy_meta_later':
				check_admin_referer( 'pnpnd_dismiss_later' );
				set_transient( self::TRANSIENT_KEY . $user_id, 1, 30 * DAY_IN_SECONDS );
				wp_safe_redirect( remove_query_arg( array( 'pnpnd_action', '_wpnonce' ) ) );
				exit;

			case 'dismiss_legacy_meta_forever':
				check_admin_referer( 'pnpnd_dismiss_forever' );
				update_user_meta( $user_id, self::USER_META_KEY, true );
				wp_safe_redirect( remove_query_arg( array( 'pnpnd_action', '_wpnonce' ) ) );
				exit;
		}
	}

	private static function is_migration_applied(): bool {
		global $wpdb;

		$audit  = "{$wpdb->prefix}pnpnd_migrations";
		$exists = $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $audit ) );
		if ( null === $exists ) {
			return false;
		}

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
		$count = (int) $wpdb->get_var(
			$wpdb->prepare(
				'SELECT COUNT(*) FROM %i WHERE version = %s AND status = %s',
				$audit,
				'1.1.0',
				'applied'
			)
		);

		return 0 < $count;
	}

	private static function column_exists(): bool {
		global $wpdb;

		$files = "{$wpdb->prefix}pnpnd_files";
		$table = $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $files ) );
		if ( null === $table ) {
			return false;
		}

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
		return null !== $wpdb->get_var(
			$wpdb->prepare( 'SHOW COLUMNS FROM %i LIKE %s', $files, 'meta_data' )
		);
	}

	private static function is_dismissed(): bool {
		$user_id = get_current_user_id();

		if ( get_user_meta( $user_id, self::USER_META_KEY, true ) ) {
			return true;
		}

		if ( get_transient( self::TRANSIENT_KEY . $user_id ) ) {
			return true;
		}

		return false;
	}

	private function render(): void {
		$cleanup_url = wp_nonce_url(
			add_query_arg( 'pnpnd_action', 'cleanup_legacy_meta', admin_url() ),
			'pnpnd_cleanup_legacy_meta'
		);
		$later_url   = wp_nonce_url(
			add_query_arg( 'pnpnd_action', 'dismiss_legacy_meta_later', admin_url() ),
			'pnpnd_dismiss_later'
		);
		$never_url   = wp_nonce_url(
			add_query_arg( 'pnpnd_action', 'dismiss_legacy_meta_forever', admin_url() ),
			'pnpnd_dismiss_forever'
		);

		echo '<div class="notice notice-warning is-dismissible pnpnd-cleanup-notice">';
		echo '<p><strong>' . esc_html__( 'Ninja Drive: legacy data cleanup available', 'ninja-drive' ) . '</strong></p>';
		echo '<p>' . esc_html__( 'Your file metadata has been safely migrated to the new relational table. The legacy meta_data column can now be removed to free up disk space.', 'ninja-drive' ) . '</p>';
		echo '<p>';
		echo '<a href="' . esc_url( $cleanup_url ) . '" class="button button-primary">' . esc_html__( 'Clean up now', 'ninja-drive' ) . '</a> ';
		echo '<a href="' . esc_url( $later_url ) . '" class="button">' . esc_html__( 'Remind me in 30 days', 'ninja-drive' ) . '</a> ';
		echo '<a href="' . esc_url( $never_url ) . '" class="button button-link">' . esc_html__( "Don't ask again", 'ninja-drive' ) . '</a>';
		echo '</p></div>';
	}
}
