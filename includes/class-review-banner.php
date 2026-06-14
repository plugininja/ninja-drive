<?php

namespace Pnpnd\ND;

use Pnpnd\ND\Traits\Singleton;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class Review_Banner {

	use Singleton;

	private const OPTION_KEY      = 'pnpnd_review_banner';
	private const NONCE_ACTION    = 'pnpnd_review_banner_nonce';
	private const REVIEW_URL      = 'https://wordpress.org/support/plugin/ninja-drive/reviews/#new-post';
	private const SHOW_AFTER_DAYS = 7;

	private function do_hooks(): void {
		add_action( 'admin_notices', array( $this, 'render' ) );
		add_filter( 'pnpnd_localize_data', array( $this, 'add_nonce_to_localize_data' ), 10, 1 );
		add_action( 'wp_ajax_pnpnd_review_dismiss', array( $this, 'ajax_dismiss' ) );
		add_action( 'wp_ajax_pnpnd_review_snooze', array( $this, 'ajax_snooze' ) );
	}

	public function add_nonce_to_localize_data( array $data ): array {
		if ( $this->should_show() ) {
			$data['reviewBannerNonce'] = wp_create_nonce( self::NONCE_ACTION );
		}

		return $data;
	}

	private function should_show(): bool {
		if ( ! is_admin() || ! current_user_can( 'manage_options' ) ) {
			return false;
		}

		$screen = \get_current_screen();
		if ( ! $screen || false === strpos( $screen->id, PNPND_SLUG ) ) {
			return false;
		}

		$state = get_option( self::OPTION_KEY, array() );

		if ( ! empty( $state['dismissed'] ) ) {
			return false;
		}

		if ( ! empty( $state['snoozed_until'] ) && time() < (int) $state['snoozed_until'] ) {
			return false;
		}

		$installed_at = get_option( 'pnpnd_install_time' );
		if ( ! $installed_at ) {
			return false;
		}

		$days_required = (int) apply_filters( 'pnpnd_review_show_after_days', self::SHOW_AFTER_DAYS );
		$threshold     = strtotime( $installed_at ) + ( $days_required * DAY_IN_SECONDS );

		return time() >= $threshold;
	}

	public function render(): void {
		if ( ! $this->should_show() ) {
			return;
		}

		$review_url = esc_url( self::REVIEW_URL );
		$logo       = esc_url( PNPND_ASSETS . '/images/ninja-drive-logo.svg' );
		?>
		<div class="pnpnd-review-banner notice pnpnd-notice" id="pnpnd-review-banner" style="display:flex;align-items:center;gap:16px;padding:16px 20px;background:#fff;border-left:4px solid #4D49FC;box-shadow:0 1px 4px rgba(0,0,0,.07);position:relative;">
			<img src="<?php echo esc_url( $logo ); ?>" alt="<?php esc_attr_e( 'Ninja Drive', 'ninja-drive' ); ?>" style="width:40px;height:40px;flex-shrink:0;">
			<div style="flex:1;min-width:0;">
				<p style="margin:0 0 10px;font-size:14px;color:#1e1e1e;">
					<?php
					printf(
						/* translators: %d: Number of days the plugin has been active */
						esc_html__( 'Hi, Ninja Drive has been managing your Google Drive files for %d days — awesome! If you have a moment, please consider leaving a review on WordPress.org to help us spread the word. We greatly appreciate it!', 'ninja-drive' ),
						(int) self::SHOW_AFTER_DAYS
					);
					?>
				</p>
				<div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;">
					<a href="<?php echo esc_url( $review_url ); ?>" target="_blank" rel="noopener noreferrer"
						class="button button-primary"
						data-pnpnd-action="dismiss">
						⭐ <?php esc_html_e( 'Leave a review', 'ninja-drive' ); ?>
					</a>
					<a href="#" class="button"
						data-pnpnd-action="snooze"
						style="display:flex;align-items:center;gap:4px;">
						🕐 <?php esc_html_e( 'Maybe later', 'ninja-drive' ); ?>
					</a>
					<a href="#"
						data-pnpnd-action="dismiss"
						style="color:#787c82;text-decoration:none;font-size:13px;display:flex;align-items:center;gap:4px;">
						✕ <?php esc_html_e( "Don't show again", 'ninja-drive' ); ?>
					</a>
				</div>
			</div>
			<button type="button"
				data-pnpnd-action="dismiss"
				style="position:absolute;top:10px;right:14px;background:none;border:none;cursor:pointer;font-size:18px;color:#787c82;line-height:1;padding:0;"
				aria-label="<?php esc_attr_e( 'Dismiss', 'ninja-drive' ); ?>">&#x2715;</button>
		</div>
		<?php
	}

	public function ajax_dismiss(): void {
		check_ajax_referer( self::NONCE_ACTION, 'review_nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( null, 403 );
		}

		$state              = get_option( self::OPTION_KEY, array() );
		$state['dismissed'] = true;
		update_option( self::OPTION_KEY, $state, false );

		wp_send_json_success();
	}

	public function ajax_snooze(): void {
		check_ajax_referer( self::NONCE_ACTION, 'review_nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( null, 403 );
		}

		$state                  = get_option( self::OPTION_KEY, array() );
		$state['snoozed_until'] = time() + ( 14 * DAY_IN_SECONDS );
		update_option( self::OPTION_KEY, $state, false );

		wp_send_json_success();
	}
}
