<?php

namespace Pnpnd\ND\App;

use Exception;
use Pnpnd\ND\Google\Client as Google_Client;
use Pnpnd\ND\Notice;
use Pnpnd\ND\Utils\Helpers;
use Pnpnd\ND\Traits\Singleton;
use WP_Error;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class Client {

	use Singleton;

	public $client;
	public $account_id;
	public $account;
	private $client_id;
	private $client_secret;
	private $redirect_uri;

	public function __construct( $account_id = null ) {
		$credentials = $this->set_credentials();

		if ( is_wp_error( $credentials ) ) {
			pnpnd_notify(
				Notice::TYPE_ERROR,
				__( 'Configuration Error', 'ninja-drive' ),
				$credentials->get_error_message()
			);

			add_action(
				'admin_notices',
				function () use ( $credentials ) {
					?>
				<div class="pnpnd-notice notice notice-error">
					<p><?php echo esc_html( $credentials->get_error_message() ); ?></p>
				</div>
					<?php
				}
			);

			return;
		}

		$this->account_id = $account_id;
		if ( 'new' === $account_id ) {
			return;
		}

		$account = Accounts::get_instance()->get_account( $this->account_id );

		if ( $account instanceof Account ) {
			$this->account    = $account;
			$this->account_id = $account->get_id();
			if ( $account->is_lost() ) {

				return;
			}
		}
	}

	public function get_client() {
		if ( empty( $this->client ) ) {
			$client = $this->getting_client();

			if ( is_wp_error( $client ) || empty( $client ) ) {
				return new Google_Client();
			}

			$this->client = $client;
		}

		return $this->client;
	}

	public function get_new_client() {
		$this->initialize_google_client();
		$this->configure_google_client();

		return $this->client;
	}

	public function get_auth_url() {
		return $this->get_new_client()->createAuthUrl();
	}

	public function get_access_token() {
		$access_token = $this->get_client()->getAccessToken();

		if ( $access_token ) {
			return json_decode( $access_token )->access_token;
		}

		return false;
	}

	public function get_refresh_token() {
		return $this->get_client()->getRefreshToken();
	}

	public function refresh_token() {
		$refresh_token = $this->get_client()->getRefreshToken();

		if ( empty( $refresh_token ) ) {
			$this->get_client()->revokeToken();
			$lost_account = Accounts::get_instance()->lost_account( $this->account_id );

			if ( is_wp_error( $lost_account ) ) {
				pnpnd_notify(
					Notice::TYPE_ERROR,
					__( 'Account connection lost', 'ninja-drive' ),
					$lost_account->get_error_message()
				);

				return $lost_account;
			}
			pnpnd_notify(
				Notice::TYPE_ERROR,
				__( 'Account connection lost', 'ninja-drive' ),
				__( 'Your account connection was lost. Please re-authorize to continue.', 'ninja-drive' )
			);
			do_action( 'pnpnd_account_lost', $this->account );
		}

		try {
			$this->client->refreshToken( $refresh_token );
			$new_tokens = $this->get_client()->getAccessToken();
			$this->account->set_access_tokens( $new_tokens );

			return $this->client;
		} catch ( \Throwable $th ) {
			$lost_account = Accounts::get_instance()->lost_account( $this->account_id );
			if ( is_wp_error( $lost_account ) ) {
				return $lost_account;
			}
			do_action( 'pnpnd_account_lost', $this->account );

			return new WP_Error( 403, $th->getMessage() );
		}
	}

	private function getting_client() {
		try {
			$this->initialize_google_client();
		} catch ( Exception $exception ) {
			return new WP_Error( 403, $exception->getMessage() );
		}

		$this->configure_google_client();

		if ( empty( $this->account ) || empty( $this->account->has_access_token() ) ) {
			return $this->client;
		}

		$access_token = $this->account->get_access_token();

		if ( empty( $access_token ) ) {

			return new WP_Error( 403, __( 'Access token is empty. Please re-authenticate.', 'ninja-drive' ) );
		}

		if ( ! is_array( $access_token ) ) {
			$access_token = json_decode( $access_token, true );
		}

		if ( json_last_error() !== JSON_ERROR_NONE ) {
			return new WP_Error( 403, __( 'Access token is invalid. Please re-authenticate.', 'ninja-drive' ) );
		}

		$this->client->setAccessToken( wp_json_encode( $access_token ) );

		if ( ! $this->client->isAccessTokenExpired() ) {
			return $this->client;
		}

		try {
			$refreshed_client = $this->refresh_token();

			if ( ! $refreshed_client || is_wp_error( $refreshed_client ) ) {
				return new WP_Error( 403, __( 'Refresh token is empty. Please re-authenticate.', 'ninja-drive' ) );
			}

			return $refreshed_client;
		} catch ( Exception $exception ) {

			return new WP_Error( 403, $exception->getMessage() );
		}
	}

	private function initialize_google_client() {
		$this->client = new Google_Client();
	}

	private function configure_google_client() {
		$this->client->setApplicationName( PNPND_NAME . ' -v ' . PNPND_VERSION );
		$this->client->setClientId( $this->client_id );
		$this->client->setClientSecret( $this->client_secret );
		$this->client->setRedirectUri( $this->redirect_uri );
		$this->client->setApprovalPrompt( 'force' );
		$this->client->setAccessType( 'offline' );

		$plugin_url = site_url( '/pnpnd/authorize/' );

		$state = array(
			'authorize_url' => $plugin_url,
			'site_url'      => site_url(),
			'site_name'     => get_bloginfo( 'name' ),
		);

		$json_state = serialize( $state );

		$this->client->setState( base64_encode( $json_state ) );

		$this->client->setScopes(
			array(
				'https://www.googleapis.com/auth/drive',
			)
		);
	}

	private function set_credentials() {

		$client_id     = Helpers::get_setting( 'accounts.app_client_id', null );
		$client_secret = Helpers::get_setting( 'accounts.app_client_secret', null, 'decode' );
		$redirect_uri  = PNPND_REDIRECT_URI;

		if ( 'automatic' === Helpers::get_setting( 'accounts.connection_type', 'manual' ) ) {
			$client_id     = '';
			$client_secret = '';
			$redirect_uri  = 'https://plugininja.com/?authorization=integration-ninja-drive';
		}

		if ( empty( $client_id ) ) {
			return new WP_Error( 403, __( 'Client ID is required. Please set it in the settings.', 'ninja-drive' ) );
		}

		if ( empty( $client_secret ) ) {
			return new WP_Error( 403, __( 'Client Secret is required. Please set it in the settings.', 'ninja-drive' ) );
		}

		if ( empty( $redirect_uri ) ) {
			return new WP_Error( 403, __( 'Redirect URL is required. Please set it in the settings.', 'ninja-drive' ) );
		}

		$this->client_id     = apply_filters( 'pnpnd_client_id', $client_id );
		$this->client_secret = apply_filters( 'pnpnd_client_secret', $client_secret );
		$this->redirect_uri  = apply_filters( 'pnpnd_redirect_uri', $redirect_uri );

		return array(
			'client_id'     => $this->client_id,
			'client_secret' => $this->client_secret,
			'redirect_uri'  => $this->redirect_uri,
		);
	}
}