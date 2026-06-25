<?php

namespace Pnpnd\ND\Models;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

use Pnpnd\ND\App\Account as AppAccount;
use Pnpnd\ND\Utils\Helpers;
use Pnpnd\ND\Traits\Singleton;
use WP_Error;
use WP_User;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class Account extends Base_Model {

	use Singleton;

	public const USER_ACTIVE_ACCOUNT_KEY = 'pnpnd_active_account';

	/**
	 * Constructor to initialize the model with database access
	 */
	public function __construct() {
		parent::__construct( 'pnpnd_accounts' );
	}

	/**
	 * Check if an account exists and is valid (not lost)
	 *
	 * @param string $id The account ID to validate
	 * @return bool True if account is valid, false otherwise
	 */
	public function is_valid_account( $id ) {
		if ( empty( $id ) || ! is_numeric( $id ) ) {
			return false;
		}

		$cache_key    = "pnpnd_valid_account_{$id}";
		$cached_valid = wp_cache_get( $cache_key, 'pnpnd_accounts' );
		if ( false !== $cached_valid ) {
			return (bool) $cached_valid;
		}

		global $wpdb;
		$exists = $this->exists(
			array(
				'id'   => $id,
				'lost' => 0,
			),
			$wpdb->prefix . 'pnpnd_accounts'
		);

		if ( is_wp_error( $exists ) ) {
			return false;
		}

		wp_cache_set( $cache_key, $exists ? 1 : 0, 'pnpnd_accounts', HOUR_IN_SECONDS );

		return $exists;
	}

	/**
	 * Get all accounts from the database
	 *
	 * @return array|WP_Error
	 */
	public function get_accounts() {
		if ( ! function_exists( 'wp_get_current_user' ) ) {
			return array();
		}

		$cache_key      = 'pnpnd_accounts_all';
		$cache_accounts = wp_cache_get( $cache_key, 'pnpnd_accounts' );
		if ( false !== $cache_accounts ) {
			return $cache_accounts;
		}

		global $wpdb;

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
		$result = $wpdb->get_results( $wpdb->prepare( 'SELECT * FROM %i', $this->table_name ), ARRAY_A );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		$processed_accounts = $this->process_accounts( $result );

		if ( ! empty( $processed_accounts ) && is_array( $processed_accounts ) ) {
			wp_cache_set( $cache_key, $processed_accounts, 'pnpnd_accounts' );
		}

		return $processed_accounts;
	}

	public function get_accounts_summary() {
		global $wpdb;

		$cache_key = 'pnpnd_dashboard_accounts_summary';
		$cache     = wp_cache_get( $cache_key, 'pnpnd_accounts' );
		if ( false !== $cache ) {
			return $cache;
		}

		$sql = $wpdb->prepare(
			'SELECT id, account_key, name, email, photo, lost, active, created_at
			FROM %i
			ORDER BY active DESC, created_at DESC',
			$this->table_name
		);

		$accounts = $wpdb->get_results( $sql, ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery

		if ( is_wp_error( $accounts ) || empty( $accounts ) ) {
			return array();
		}

		$summary = array();

		foreach ( $accounts as $account ) {
			$summary[] = array(
				'id'           => $account['id'],
				'account_key'  => $account['account_key'],
				'name'         => $account['name'],
				'email'        => $account['email'],
				'photo'        => $account['photo'],
				'is_lost'      => (bool) $account['lost'],
				'is_active'    => (bool) $account['active'],
				'connected_at' => $account['created_at'],
			);
		}

		wp_cache_set( $cache_key, $summary, 'pnpnd_accounts', HOUR_IN_SECONDS );

		return $summary;
	}

	/**
	 * Get account by ID
	 *
	 * @param string|null $id
	 * @return AppAccount|WP_Error|false
	 */
	public function get_account( $id = null ) {
		global $wpdb;

		$cache_key      = 'pnpnd_account_' . ( $id ?? 'active' );
		$cached_account = wp_cache_get( $cache_key, 'pnpnd_accounts' );
		if ( false !== $cached_account ) {
			return $cached_account;
		}

		if ( empty( $id ) ) {
			$get_current_user_active_account = get_user_meta( get_current_user_id(), self::USER_ACTIVE_ACCOUNT_KEY, true );
			if ( ! empty( $get_current_user_active_account ) ) {
				$id = $get_current_user_active_account;
			}
		}

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$result = ( empty( $id ) ) ? $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM %i WHERE `active` = %d LIMIT 1', $this->table_name, 1 ), ARRAY_A ) : $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM %i WHERE `id` = %s LIMIT 1', $this->table_name, $id ), ARRAY_A );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		if ( empty( $result ) ) {
			return false;
		}

		$result = $this->process_account( $result );

		wp_cache_set( $cache_key, $result, 'pnpnd_accounts' );

		if ( empty( $id ) && $result instanceof AppAccount ) {
			update_user_meta( get_current_user_id(), self::USER_ACTIVE_ACCOUNT_KEY, $result->get_id() );
		}

		return $result;
	}

	/**
	 * Retrieve an account by its key.
	 *
	 * @param string $key The key of the account to retrieve.
	 * @return AppAccount|WP_Error|false The account object if found, or a WP_Error object if not found.
	 */
	public function get_account_by_key( $key ) {

		$cache_key      = "pnpnd_account_key_{$key}";
		$cached_account = wp_cache_get( $cache_key, 'pnpnd_accounts' );
		if ( false !== $cached_account ) {
			return $cached_account;
		}

		global $wpdb;

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
		$result = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM %i WHERE `account_key` = %s LIMIT 1', $this->table_name, $key ), ARRAY_A );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		if ( empty( $result ) ) {
			return false;
		}

		$result = $this->process_account( $result );

		wp_cache_set( $cache_key, $result, 'pnpnd_accounts' );

		$cache_key_by_id = "pnpnd_account_{$result->get_id()}";
		wp_cache_set( $cache_key_by_id, $result, 'pnpnd_accounts' );

		return $result;
	}

	/**
	 * Add a new account to the database
	 *
	 * @param AppAccount $account
	 * @return bool|WP_Error
	 */
	public function add_account( AppAccount $account ) {

		$tokens  = $account->get_access_token();
		$storage = maybe_serialize( $account->get_storage() );

		if ( is_string( $tokens ) ) {
			$tokens = maybe_serialize( json_decode( $tokens, true ) );
		}

		$hash_tokens = Helpers::encode( $tokens );

		$data = array(
			'id'          => $account->get_id(),
			'account_key' => $account->get_account_key(),
			'name'        => $account->get_name(),
			'email'       => $account->get_email(),
			'photo'       => $account->get_photo(),
			'storage'     => $storage,
			'lost'        => (int) $account->is_lost(),
			'root_id'     => $account->get_root_id(),
			'user_id'     => $account->get_user(),
			'active'      => 1,
			'tokens'      => $hash_tokens,
			'created_at'  => current_time( 'mysql' ),
			'updated_at'  => current_time( 'mysql' ),
		);

		$format = array(
			'%s', // id
			'%s', // account_key
			'%s', // name
			'%s', // email
			'%s', // photo
			'%s', // storage
			'%d', // lost
			'%s', // root_id
			'%d', // user_id
			'%d', // active
			'%s', // tokens
			'%s', // created_at
			'%s', // updated_at
		);

		$is_existing_account = $this->get_account( $data['id'] );

		if ( is_wp_error( $is_existing_account ) ) {
			return $is_existing_account;
		}

		if ( $is_existing_account ) {
			unset( $data['id'] );
			unset( $data['account_key'] );
			unset( $data['created_at'] );
			$data['updated_at'] = current_time( 'mysql' );

			$update_format = array(
				'%s', // name
				'%s', // email
				'%s', // photo
				'%s', // storage
				'%d', // lost
				'%s', // root_id
				'%d', // user_id
				'%d', // active
				'%s', // tokens
				'%s', // updated_at
			);

			$where        = array( 'id' => $account->get_id() );
			$where_format = array( '%s' );

			$result = $this->update( $data, $where, $update_format, $where_format );
		} else {
			$result = $this->insert( $data, $format );
		}

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		wp_cache_delete( "pnpnd_account_{$account->get_id()}", 'pnpnd_accounts' );
		wp_cache_delete( 'pnpnd_account_active', 'pnpnd_accounts' );
		wp_cache_delete( 'pnpnd_accounts_all', 'pnpnd_accounts' );

		update_user_meta( get_current_user_id(), self::USER_ACTIVE_ACCOUNT_KEY, $account->get_id() );

		return (bool) $result;
	}

	/**
	 * Update account in the database
	 *
	 * @param AppAccount $account
	 * @return bool|WP_Error
	 */
	public function update_account( AppAccount $account ) {
		if ( ! current_user_can( 'manage_options' ) ) {
			return new WP_Error( 401, __( 'You do not have permission to update accounts.', 'ninja-drive' ) );
		}

		$tokens      = maybe_serialize( $account->get_access_token() );
		$hash_tokens = Helpers::encode( $tokens );

		$data = array(
			'name'       => $account->get_name(),
			'email'      => $account->get_email(),
			'photo'      => $account->get_photo(),
			'storage'    => maybe_serialize( $account->get_storage() ),
			'lost'       => (int) $account->is_lost(),
			'root_id'    => $account->get_root_id(),
			'active'     => (int) $account->get_active(),
			'tokens'     => $hash_tokens,
			'updated_at' => current_time( 'mysql' ),
		);

		$format = array(
			'%s', // name
			'%s', // email
			'%s', // photo
			'%s', // storage
			'%d', // lost
			'%s', // root_id
			'%d', // active
			'%s', // tokens
			'%s', // updated_at
		);

		$where        = array( 'id' => $account->get_id() );
		$where_format = array( '%s' );

		$result = $this->update( $data, $where, $format, $where_format );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		wp_cache_delete( "pnpnd_account_{$account->get_id()}", 'pnpnd_accounts' );
		wp_cache_delete( 'pnpnd_account_active', 'pnpnd_accounts' );
		wp_cache_delete( 'pnpnd_accounts_all', 'pnpnd_accounts' );

		return (bool) $result;
	}

	/**
	 * Delete an account by ID
	 *
	 * @param int|string $id
	 * @return bool|WP_Error
	 */
	public function delete_account( $id ) {
		if ( ! current_user_can( 'manage_options' ) || empty( $id ) ) {
			return new WP_Error( 401, __( 'You do not have permission to delete this account.', 'ninja-drive' ) );
		}

		$account = $this->get_account( $id );
		if ( is_wp_error( $account ) ) {
			return $account;
		}

		if ( empty( $account ) ) {
			return new WP_Error( 404, __( 'Account not found.', 'ninja-drive' ) );
		}

		if ( ! $account instanceof AppAccount ) {
			return new WP_Error( 400, __( 'Invalid account data.', 'ninja-drive' ) );
		}

		$result = $this->delete( array( 'id' => $id ), array( '%s' ) );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		if ( empty( $result ) ) {
			return new WP_Error( 400, __( 'Failed to delete account.', 'ninja-drive' ) );
		}

		// Remove all files and folders associated with the account
		$files_model = Files::get_instance();
		$files_model->delete_files_by_account_id( $id );

		wp_cache_delete( "pnpnd_account_{$id}", 'pnpnd_accounts' );
		wp_cache_delete( 'pnpnd_account_active', 'pnpnd_accounts' );
		wp_cache_delete( 'pnpnd_accounts_all', 'pnpnd_accounts' );

		$get_all_user = get_users(
			array(
				'meta_key'   => self::USER_ACTIVE_ACCOUNT_KEY,
				'meta_value' => $id,
			)
		);

		foreach ( $get_all_user as $user ) {
			delete_user_meta( $user->ID, self::USER_ACTIVE_ACCOUNT_KEY );
		}

		return (bool) $result;
	}

	/**
	 * Sets the specified account as lost.
	 *
	 * @param string|int $id The ID of the account to set as lost.
	 * @return bool|WP_Error True if the account was successfully set as lost, false otherwise.
	 *                       If an error occurred, a WP_Error object is returned.
	 */
	public function lost_account( $id ) {
		if ( empty( $id ) ) {
			return false;
		}

		$result = $this->update( array( 'lost' => 1 ), array( 'id' => $id ), array( '%d' ), array( '%s' ) );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		$get_all_user = get_users(
			array(
				'meta_key'   => self::USER_ACTIVE_ACCOUNT_KEY,
				'meta_value' => $id,
			)
		);

		foreach ( $get_all_user as $user ) {
			delete_user_meta( $user->ID, self::USER_ACTIVE_ACCOUNT_KEY );
		}

		return (bool) $result;
	}

	/**
	 * Checks if the specified account is lost.
	 *
	 * @param string|int $id The ID of the account to check.
	 *
	 * @return bool True if the account is lost, false otherwise.
	 *              If the account does not exist, an error occurred, or the user does not have permission, false is returned.
	 */
	public function is_lost( $id ) {
		if ( empty( $id ) ) {

			return false;
		}

		$account = $this->get_account( $id );
		if ( is_wp_error( $account ) ) {
			return $account;
		}

		$result = $account->is_lost();

		if ( is_wp_error( $result ) ) {

			return false;
		}

		return (bool) $result;
	}

	/**
	 * Get tokens for a given account ID
	 *
	 * @param int|string|null $id Optional account ID
	 * @return array|false|WP_Error
	 */
	public function get_tokens( $id = null ) {
		global $wpdb;
		if ( ! current_user_can( 'manage_options' ) ) {
			return new WP_Error( 401, __( 'You do not have permission to retrieve tokens.', 'ninja-drive' ) );
		}

		if ( empty( $id ) ) {
			$account = $this->get_account( $id );

			if ( is_wp_error( $account ) ) {
				return $account;
			}

			if ( $account instanceof AppAccount ) {
				$id = $account->get_id();
			}
		}

		if ( empty( $id ) || ! is_numeric( $id ) ) {
			return new WP_Error( 400, __( 'Account ID is required.', 'ninja-drive' ) );
		}

		$cache_key     = "pnpnd_account_tokens_{$id}";
		$cached_tokens = wp_cache_get( $cache_key, 'pnpnd_accounts' );
		if ( false !== $cached_tokens ) {
			return $cached_tokens;
		}

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
		$result = $wpdb->get_row( $wpdb->prepare( 'SELECT tokens FROM %i WHERE id = %s', $this->table_name, $id ), ARRAY_A );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		$tokens = Helpers::decode( $result['tokens'] );
		wp_cache_set( $cache_key, $tokens, 'pnpnd_accounts' );

		return $tokens;
	}

	/**
	 * Updates the token for a given account ID.
	 *
	 * Validates user permissions and checks that the provided ID and token are
	 * non-empty and valid. Then serializes the token and updates it in the database.
	 * Logs any database errors encountered during the update process.
	 *
	 * @param string $id The account ID for which the token is being updated.
	 * @param string $token The token to be set for the account.
	 * @return bool|WP_Error True if the token was successfully updated, false otherwise.
	 */
	public function set_token( $id, $token ) {
		if ( ! current_user_can( 'manage_options' ) ) {
			return new WP_Error( 401, __( 'You do not have permission to update tokens.', 'ninja-drive' ) );
		}

		if ( empty( $id ) || empty( $token ) ) {
			return new WP_Error( 400, __( 'Account ID and token are required.', 'ninja-drive' ) );
		}

		$token      = maybe_serialize( json_decode( $token, true ) );
		$hash_token = Helpers::encode( $token );

		$data = array(
			'tokens'     => $hash_token,
			'updated_at' => current_time( 'mysql' ),
		);

		$where = array(
			'id' => $id,
		);

		$format = array(
			'%s',
			'%s',
		);

		$where_format = array(
			'%s',
		);

		$result = $this->update( $data, $where, $format, $where_format );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return false !== $result;
	}

	/**
	 * Process a single account object
	 *
	 * @param array $account
	 * @return AppAccount|bool
	 */
	private function process_account( array $account ) {
		if ( empty( $account ) ) {

			return false;
		}

		$user = \get_user( $account['user_id'] ?? 0 );

		$user_info = array();

		if ( $user instanceof WP_User ) {
			$user_info = array(
				'id'     => $user->ID,
				'email'  => $user->user_email,
				'name'   => $user->display_name,
				'avatar' => get_avatar_url( $user->ID ),
				'roles'  => $user->roles,
			);
		}

		return new AppAccount(
			$account['id'],
			$account['name'],
			$account['email'],
			$account['photo'],
			maybe_unserialize( $account['storage'] ),
			(int) $account['lost'],
			$account['root_id'],
			$user_info,
			(int) $account['active'],
			maybe_unserialize( Helpers::decode( $account['tokens'] ) )
		);
	}

	/**
	 * Process an array of account objects
	 *
	 * @param array $accounts
	 * @return array
	 */
	private function process_accounts( array $accounts ) {
		$process_accounts = array_map( array( $this, 'process_account' ), $accounts );
		$accounts_by_id   = array();
		foreach ( $process_accounts as $processed_account ) {
			if ( $processed_account ) {
				$account_id = $processed_account->get_id();
				if ( null !== $account_id ) {
					$accounts_by_id[ $account_id ] = $processed_account;
				}
			}
		}

		return $accounts_by_id;
	}

	/**
	 * Switches the active account to the specified account ID.
	 *
	 * @param string|int $id The ID of the account to switch to.
	 * @return bool|WP_Error True if the account was successfully switched, false otherwise.
	 */
	public function switch_account__premium_only( $id ) {
		if ( ! pnpnd_get_current_user_access__premium_only() || empty( $id ) ) {
			return new WP_Error( 401, __( 'You do not have permission to switch accounts.', 'ninja-drive' ) );
		}

		$account = $this->get_account( $id );

		if ( is_wp_error( $account ) ) {
			return $account;
		}

		if ( empty( $account ) ) {
			return new WP_Error( 400, __( 'The account you are trying to switch does not exist.', 'ninja-drive' ) );
		}

		if ( $account->is_lost() ) {
			return new WP_Error( 400, __( 'The account you are trying to switch is lost.', 'ninja-drive' ) );
		}

		global $wpdb;

        // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
		$result = $wpdb->query( $wpdb->prepare( 'UPDATE %i SET active = CASE WHEN id = %s THEN 1 ELSE 0 END', $this->table_name, $id ) );

		if ( $wpdb->last_error ) {
			return new WP_Error( 400, __( 'A database error occurred: ', 'ninja-drive' ) . $wpdb->last_error );
		}

		wp_cache_delete( 'pnpnd_account_active', 'pnpnd_accounts' );
		wp_cache_delete( 'pnpnd_accounts_all', 'pnpnd_accounts' );

		update_user_meta( get_current_user_id(), self::USER_ACTIVE_ACCOUNT_KEY, $id );

		return (bool) $result;
	}
}
