<?php

namespace Pnpnd\ND\App;

use Pnpnd\ND\App\Service\Account_Service;
use Pnpnd\ND\Models\Account as Account_Model;
use Pnpnd\ND\Models\Files;
use Pnpnd\ND\Traits\Singleton;
use WP_Error;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class Accounts {

	use Singleton;

	private $model;
	private $accounts;
	private $current_account;

	public function __construct() {
		$this->model = new Account_Model();

		$this->accounts        = $this->model->get_accounts();
		$this->current_account = $this->model->get_account();
	}

	public function add_account( $id, $name, $email, $photo, $storage, $lost, $root_id, $user_id, $tokens = '' ) {
		$account = new Account( $id, $name, $email, $photo, $storage, $lost, $root_id, $user_id, false, $tokens );
		$result  = $this->model->add_account( $account );

		if ( ! is_wp_error( $result ) ) {
			$this->accounts[ $id ] = $account;
		}

		return $account;
	}

	public function get_accounts() {
		if ( ! isset( $this->accounts ) || empty( $this->accounts ) ) {
			$this->accounts = $this->model->get_accounts();
		}

		return $this->accounts;
	}

	public function __sleep() {
		return array( 'accounts', 'current_account' );
	}

	public function __wakeup() {
		$this->accounts = $this->model->get_accounts();
	}

	public function get_account( $account_id = null ) {
		if ( empty( $account_id ) ) {
			return $this->current_account;
		}

		if ( ! isset( $this->accounts[ $account_id ] ) ) {
			$account = $this->model->get_account( $account_id );

			if ( is_wp_error( $account ) ) {
				return $account;
			}

			$this->accounts[ $account_id ] = $account;
		}

		return $this->accounts[ $account_id ];
	}

	public function sync_account( $account_id ) {
		$client          = Client::get_instance( $account_id );
		$account_service = new Account_Service( $client );

		$account = $account_service->get();

		if ( is_wp_error( $account ) ) {
			return $account;
		}

		return $this->update_account( $account_id, $account );
	}

	public function get_account_by_key( $key ) {
		if ( in_array( $key, array( 'my-drive', 'shared', 'computers', 'shared-drives', 'starred' ), true ) ) {
			if ( current_user_can( 'manage_options' ) ) {
				return $this->get_account();
			} else {
				return new WP_Error( 'no_access', esc_html__( 'You do not have access to this account', 'ninja-drive' ), array( 'status' => 403 ) );
			}
		}

		foreach ( $this->accounts as $account ) {
			if ( $account->get_account_key() === $key && ! $account->is_lost() ) {
				return $account;
			}
		}

		return $this->model->get_account_by_key( $key );
	}

	public function update_account( string $account_id, array $updated_data ) {
		$account = $this->model->get_account( $account_id );

		if ( is_wp_error( $account ) ) {
			return $account;
		}

		$updated_account = new Account(
			$account_id,
			$updated_data['name'] ?? $account->get_name(),
			$updated_data['email'] ?? $account->get_email(),
			$updated_data['photo'] ?? $account->get_photo(),
			$updated_data['storage'] ?? $account->get_storage(),
			$updated_data['lost'] ?? $account->is_lost(),
			$updated_data['root_id'] ?? $account->get_root_id(),
			$updated_data['user_id'] ?? $account->get_user(),
			$updated_data['active'] ?? $account->get_active(),
			$updated_data['tokens'] ?? $account->get_access_token()
		);

		$result = $this->model->update_account( $updated_account );

		if ( ! is_wp_error( $result ) ) {
			$this->accounts[ $account_id ] = $updated_account;
		}

		return $this->accounts[ $account_id ] ?? $result;
	}

	public function delete_account( $account_id ) {
		$result = $this->model->delete_account( $account_id );
		if ( is_wp_error( $result ) ) {
			return $result;
		}

		$files = Files::get_instance()->get_files_by_account_id( $account_id );
		if ( ! is_wp_error( $files ) ) {
			foreach ( $files as $file ) {
				Files::get_instance()->delete_file( $file['id'], $account_id );
			}
		}

		unset( $this->accounts[ $account_id ] );

		return true;
	}

	public function lost_account( $account_id ) {
		$result = $this->model->lost_account( $account_id );

		return $result;
	}

	/**
	 * Switches the active account to the specified account ID.
	 *
	 * @param string $account_id The ID of the account to switch to.
	 *
	 * @return Account|bool The switched account object if successful, false if the switch failed.
	 */
}
