<?php

namespace Pnpnd\ND\App;

use Exception;
use Pnpnd\ND\App\Service\AccountService;
use Pnpnd\ND\Models\Notices;
use Pnpnd\ND\Utils\Singleton;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class Authorization {

	use Singleton;

	public function doingAuth( string $code ) {

		if ( empty( $code ) ) {
			Notices::getInstance()->add(
				array(
					'type'        => 'error',
					'title'       => __( 'Unable to get authorization code.', 'ninja-drive' ),
					'description' => __( 'Required parameters "code" is missing. so we are unable to get authorization this account. please try again', 'ninja-drive' ),
				)
			);
			$this->closeAndExit();
			exit;
		}

		$this->createAccessToken( $code );

		$this->closeAndExit();
	}

	private function createAccessToken( string $code ) {

		try {
			$client = new Client( 'new' );

			$googleClient = $client->getClient();

			$accessToken = $googleClient->authenticate( $code );
			if ( false === $accessToken ) {
				Notices::getInstance()->add(
					array(
						'type'        => 'error',
						'title'       => __( 'Unable to get access token.', 'ninja-drive' ),
						'description' => __( 'Access token is missing so we are not able to add this account. please try again', 'ninja-drive' ),
					)
				);
				$this->closeAndExit();
				exit;
			}

			// $data = Account::getInstance($googleClient, 'client')->get();
			$accountAPI = new AccountService( $client );
			$account    = $accountAPI->get();

			if ( is_wp_error( $account ) ) {
				Notices::getInstance()->add(
					array(
						'type'        => 'error',
						'title'       => __( 'Unable to get account data.', 'ninja-drive' ),
						'description' => $account->get_error_message(),
					)
				);
				$this->closeAndExit();
			}

			if ( false === $account ) {
				Notices::getInstance()->add(
					array(
						'type'        => 'error',
						'title'       => __( 'Unable to get account data.', 'ninja-drive' ),
						'description' => __( 'Account data is missing so we are not able to add this account. please try again', 'ninja-drive' ),
					)
				);
				$this->closeAndExit();
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
				Notices::getInstance()->add(
					array(
						'type'        => 'error',
						'title'       => __( 'Unable to get account data.', 'ninja-drive' ),
						'description' => __( 'Account data is missing so we are not able to add this account. please try again', 'ninja-drive' ),
					)
				);
				$this->closeAndExit();
			}

			$account = Accounts::getInstance()->addAccount( $id, $name, $email, $photo, $storage, $lost, $root_id, $user_id, $accessToken );
			if ( is_wp_error( $account ) ) {
				Notices::getInstance()->add(
					array(
						'type'        => 'error',
						'title'       => __( 'Unable to add account.', 'ninja-drive' ),
						'description' => $account->get_error_message(),
					)
				);
				$this->closeAndExit();
			} else {
				Notices::getInstance()->add(
					array(
						'type'        => 'success',
						'title'       => __( 'Account added successfully.', 'ninja-drive' ),
						'description' => __( 'Great! Your account is added successfully. Now you can start using your files in your website. if you have any issue or need any help please feel free to contact us.', 'ninja-drive' ),
					)
				);
			}
		} catch ( Exception $exception ) {
			Notices::getInstance()->add(
				array(
					'type'        => 'error',
					'title'       => __( 'Unable to get account data.', 'ninja-drive' ),
					'description' => $exception->getMessage(),
				)
			);
			$this->closeAndExit();
		}

		return true;
	}

	private function closeAndExit() {
		$redirect_url = esc_url( admin_url( 'admin.php?page=ninja-drive' ) );
		wp_safe_redirect( $redirect_url );
		exit;
	}
}
