<?php

namespace Pnpnd\ND;

use Pnpnd\ND\App\Account;
use Pnpnd\ND\Traits\Singleton;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class Account_Notifications {

	use Singleton;

	public function do_hooks() {
		add_action( 'pnpnd_account_lost',    array( $this, 'notify_lost' ) );
		add_action( 'pnpnd_account_deleted', array( $this, 'notify_deleted' ) );
		add_action( 'pnpnd_account_added',   array( $this, 'notify_added' ) );
	}

	public function notify_lost( Account $account ) {
		$this->send_email( 'lost', $account );
	}

	public function notify_deleted( Account $account ) {
		$this->send_email( 'deleted', $account );
	}

	public function notify_added( Account $account ) {
		$this->send_email( 'added', $account );
	}

	private function resolve_owner( Account $account ): array {
		$user = $account->get_user();

		if ( is_array( $user ) && ! empty( $user ) ) {
			return array(
				'name'  => $user['name'] ?? __( 'Unknown user', 'ninja-drive' ),
				'email' => $user['email'] ?? '',
			);
		}

		// get_user() returns the raw user_id integer for freshly added accounts.
		$user_id = is_numeric( $user ) ? (int) $user : 0;
		$wp_user = $user_id ? get_userdata( $user_id ) : false;

		return array(
			'name'  => $wp_user ? $wp_user->display_name : __( 'Unknown user', 'ninja-drive' ),
			'email' => $wp_user ? $wp_user->user_email   : '',
		);
	}

	private function send_email( string $event, Account $account ) {
		$site_name    = get_bloginfo( 'name' );
		$admin_email  = get_option( 'admin_email' );
		$owner        = $this->resolve_owner( $account );
		$owner_name   = $owner['name'];
		$owner_email  = $owner['email'];
		$account_name = esc_html( $account->get_name() );
		$google_email = esc_html( $account->get_email() );
		$admin_url    = esc_url( admin_url( 'admin.php?page=ninja-drive#/settings/accounts' ) );

		$recipients = array_unique( array_filter( array( $admin_email, $owner_email ) ) );

		$impact = __( 'As a result, files may not load properly on your site. Features such as file downloads, auto sync, and other account-dependent functionality will not work until this is resolved.', 'ninja-drive' );

		if ( 'added' === $event ) {
			$subject = sprintf(
				/* translators: 1: site name, 2: Google account name */
				__( '[%1$s] New Google Drive account "%2$s" connected', 'ninja-drive' ),
				$site_name,
				$account->get_name()
			);

			$message = sprintf(
				'<p>%s</p><p><a href="%s">%s</a></p>',
				sprintf(
					/* translators: 1: account name, 2: Google email, 3: WP username */
					__( 'A new Google Drive account <strong>%1$s</strong> (%2$s) has been successfully connected to your site by %3$s.', 'ninja-drive' ),
					$account_name,
					$google_email,
					esc_html( $owner_name )
				),
				$admin_url,
				__( 'Go to Accounts settings', 'ninja-drive' )
			);
		} elseif ( 'lost' === $event ) {
			$subject = sprintf(
				/* translators: 1: site name, 2: Google account name */
				__( '[%1$s] Google Drive account "%2$s" connection lost', 'ninja-drive' ),
				$site_name,
				$account->get_name()
			);

			$message = sprintf(
				'<p>%s</p><p>%s</p><p>%s</p><p><a href="%s">%s</a></p>',
				sprintf(
					/* translators: 1: account name, 2: Google email, 3: WP username */
					__( 'The Google Drive account <strong>%1$s</strong> (%2$s), connected by %3$s, has lost its authorization.', 'ninja-drive' ),
					$account_name,
					$google_email,
					esc_html( $owner_name )
				),
				$impact,
				__( 'Please re-authorize the account as soon as possible to restore access.', 'ninja-drive' ),
				$admin_url,
				__( 'Go to Accounts settings', 'ninja-drive' )
			);
		} else { // deleted
			$subject = sprintf(
				/* translators: 1: site name, 2: Google account name */
				__( '[%1$s] Google Drive account "%2$s" removed', 'ninja-drive' ),
				$site_name,
				$account->get_name()
			);

			$message = sprintf(
				'<p>%s</p><p>%s</p><p>%s</p><p><a href="%s">%s</a></p>',
				sprintf(
					/* translators: 1: account name, 2: Google email, 3: WP username */
					__( 'The Google Drive account <strong>%1$s</strong> (%2$s), connected by %3$s, has been removed from Ninja Drive. All associated file records have been deleted.', 'ninja-drive' ),
					$account_name,
					$google_email,
					esc_html( $owner_name )
				),
				$impact,
				__( 'To reconnect or add a new Google Drive account, visit the Accounts settings page.', 'ninja-drive' ),
				$admin_url,
				__( 'Go to Accounts settings', 'ninja-drive' )
			);
		}

		$headers = array(
			'Content-Type: text/html; charset=UTF-8',
			sprintf( 'From: %s <%s>', $site_name, $admin_email ),
		);

		foreach ( $recipients as $to ) {
			wp_mail( $to, $subject, $message, $headers );
		}
	}
}
