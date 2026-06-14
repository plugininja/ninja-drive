<?php

namespace Pnpnd\ND\App;

use Exception;
use Pnpnd\ND\App\Service\Account_Service;
use Pnpnd\ND\Notice;
use Pnpnd\ND\Traits\Singleton;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class Authorization {

	use Singleton;

	public function doing_auth( string $code ) {

		if ( empty( $code ) ) {
			pnpnd_notify(
				Notice::TYPE_ERROR,
				__( 'Unable to get authorization code.', 'ninja-drive' ),
				__( 'Required parameters "code" is missing. so we are unable to get authorization this account. please try again', 'ninja-drive' )
			);
			$this->close_and_exit();
			exit;
		}

		$this->create_access_token( $code );

		$this->close_and_exit();
	}

	private function create_access_token( string $code ) {

		try {
			$client = new Client( 'new' );

			$google_client = $client->get_client();

			$access_token = $google_client->authenticate( $code );
			if ( false === $access_token ) {
				pnpnd_notify(
					Notice::TYPE_ERROR,
					__( 'Unable to get access token.', 'ninja-drive' ),
					__( 'Access token is missing so we are not able to add this account. please try again', 'ninja-drive' )
				);
				$this->close_and_exit();
				exit;
			}

			$account_service = new Account_Service( $client );
			$account         = $account_service->get();

			if ( is_wp_error( $account ) ) {
				pnpnd_notify(
					Notice::TYPE_ERROR,
					__( 'Unable to get account data.', 'ninja-drive' ),
					$account->get_error_message()
				);
				$this->close_and_exit();
			}

			if ( false === $account ) {
				pnpnd_notify(
					Notice::TYPE_ERROR,
					__( 'Unable to get account data.', 'ninja-drive' ),
					__( 'Account data is missing so we are not able to add this account. please try again', 'ninja-drive' )
				);
				$this->close_and_exit();
			}

			$id      = $account['id'] ?? 0;
			$name    = $account['name'] ?? '';
			$email   = $account['email'] ?? '';
			$photo   = $account['photo'] ?? '';
			$storage = $account['storage'] ?? array();
			$lost    = $account['lost'] ?? false;
			$root_id = $account['root_id'] ?? 0;
			$user_id = get_current_user_id();

			if ( empty( $id ) || empty( $name ) || empty( $email ) || empty( $photo ) || empty( $storage ) || empty( $root_id ) ) {
				pnpnd_notify(
					Notice::TYPE_ERROR,
					__( 'Unable to get account data.', 'ninja-drive' ),
					__( 'Account data is missing so we are not able to add this account. please try again', 'ninja-drive' )
				);
				$this->close_and_exit();
			}

			$account = Accounts::get_instance()->add_account( $id, $name, $email, $photo, $storage, $lost, $root_id, $user_id, $access_token );
			if ( is_wp_error( $account ) ) {
				pnpnd_notify(
					Notice::TYPE_ERROR,
					__( 'Unable to add account.', 'ninja-drive' ),
					$account->get_error_message()
				);
				$this->close_and_exit();
			} else {
				pnpnd_notify(
					Notice::TYPE_SUCCESS,
					__( 'Account added successfully.', 'ninja-drive' ),
					__( 'Great! Your account is added successfully. Now you can start using your files in your website. if you have any issue or need any help please feel free to contact us.', 'ninja-drive' )
				);
			}
		} catch ( Exception $exception ) {
			pnpnd_notify(
				Notice::TYPE_ERROR,
				__( 'Unable to get account data.', 'ninja-drive' ),
				$exception->getMessage()
			);
			$this->close_and_exit();
		}

		return true;
	}

	private function close_and_exit() {
		$redirect_url = esc_url( admin_url( 'admin.php?page=ninja-drive' ) );
		wp_safe_redirect( $redirect_url );
		exit;
	}
}
