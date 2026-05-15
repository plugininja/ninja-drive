<?php

namespace Pninja\ND\Models;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

use Pninja\ND\App\Account as AppAccount;
use Pninja\ND\Utils\Helpers;
use Pninja\ND\Utils\Singleton;
use stdClass;
use WP_Error;
use WP_User;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class Account extends BaseModel {

	use Singleton;

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
	public function isValidAccount( $id ) {
		if ( empty( $id ) || ! is_numeric( $id ) ) {
			return false;
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

		return $exists;
	}

	/**
	 * Get all accounts from the database
	 *
	 * @return array|WP_Error
	 */
	public function getAccounts() {
		if ( ! function_exists( 'wp_get_current_user' ) ) {
			return array();
		}

		$cacheKey      = 'pnpnd_accounts_all';
		$cacheAccounts = wp_cache_get( $cacheKey, 'pnpnd_accounts' );
		if ( false !== $cacheAccounts ) {
			return $cacheAccounts === 'no-account-found' ? array() : $cacheAccounts;
		}

		global $wpdb;

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
		$result = $wpdb->get_results( $wpdb->prepare( 'SELECT * FROM %i', $this->tableName ) );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		$processedAccounts = $this->processAccounts( $result );
		wp_cache_set( $cacheKey, $processedAccounts ?: 'no-account-found', 'pnpnd_accounts' );

		return $processedAccounts;
	}

	/**
	 * Get account by ID
	 *
	 * @param string|null $id
	 * @return AppAccount|WP_Error|false
	 */
	public function getAccount( $id = null ) {
		global $wpdb;

		$cacheKey = 'pnpnd_account_' . ( $id ?? 'active' );
		if ( false !== ( $cachedAccount = wp_cache_get( $cacheKey, 'pnpnd_accounts' ) ) ) {
			return $cachedAccount;
		}

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$result = ( empty( $id ) ) ? $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM %i WHERE `active` = %d LIMIT 1', $this->tableName, 1 ) ) : $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM %i WHERE `id` = %s LIMIT 1', $this->tableName, $id ) );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		$result = $this->processAccount( $result );

		wp_cache_set( $cacheKey, $result, 'pnpnd_accounts' );

		return $result;
	}

	/**
	 * Retrieve an account by its key.
	 *
	 * @param string $key The key of the account to retrieve.
	 * @return AppAccount|WP_Error|false The account object if found, or a WP_Error object if not found.
	 */
	public function getAccountByKey( $key ) {

		$cacheKey = "pnpnd_account_key_{$key}";
		if ( false !== ( $cachedAccount = wp_cache_get( $cacheKey, 'pnpnd_accounts' ) ) ) {
			return $cachedAccount;
		}

		global $wpdb;

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
		$result = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM %i WHERE `accountKey` = %s LIMIT 1', $this->tableName, $key ) );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		$result = $this->processAccount( $result );

		wp_cache_set( $cacheKey, $result, 'pnpnd_accounts' );

		$cacheKeyById = "pnpnd_account_{$result->getId()}";
		wp_cache_set( $cacheKeyById, $result, 'pnpnd_accounts' );

		return $result;
	}

	/**
	 * Add a new account to the database
	 *
	 * @param AppAccount $account
	 * @return bool|WP_Error
	 */
	public function addAccount( AppAccount $account ) {

		$tokens  = $account->getAccessToken();
		$storage = maybe_serialize( $account->getStorage() );

		if ( is_string( $tokens ) ) {
			$tokens = maybe_serialize( json_decode( $tokens, true ) );
		}

		$hashTokens = Helpers::encode( $tokens );

		$data = array(
			'id'         => $account->getId(),
			'accountKey' => $account->getAccountKey(),
			'name'       => $account->getName(),
			'email'      => $account->getEmail(),
			'photo'      => $account->getPhoto(),
			'storage'    => $storage,
			'lost'       => (int) $account->getLost(),
			'rootId'     => $account->getRootId(),
			'userId'     => $account->getUser(),
			'active'     => 1,
			'tokens'     => $hashTokens,
			'createdAt'  => current_time( 'mysql' ),
			'updatedAt'  => current_time( 'mysql' ),
		);

		$format = array(
			'%s', // id
			'%s', // accountKey
			'%s', // name
			'%s', // email
			'%s', // photo
			'%s', // storage
			'%d', // lost
			'%s', // rootId
			'%d', // userId
			'%d', // active
			'%s', // tokens
			'%s', // createdAt
			'%s', // updatedAt
		);

		$isExistingAccount = $this->getAccount( $data['id'] );

		if ( is_wp_error( $isExistingAccount ) ) {
			return $isExistingAccount;
		}

		if ( $isExistingAccount ) {
			unset( $data['id'] );
			unset( $data['accountKey'] );
			unset( $data['createdAt'] );
			$data['updatedAt'] = current_time( 'mysql' );

			$updateFormat = array(
				'%s', // name
				'%s', // email
				'%s', // photo
				'%s', // storage
				'%d', // lost
				'%s', // rootId
				'%d', // userId
				'%d', // active
				'%s', // tokens
				'%s', // updatedAt
			);

			$where       = array( 'id' => $account->getId() );
			$whereFormat = array( '%s' );

			$result = $this->update( $data, $where, $updateFormat, $whereFormat );
		} else {
			$result = $this->insert( $data, $format );
		}

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		wp_cache_delete( "pnpnd_account_{$account->getId()}", 'pnpnd_accounts' );
		wp_cache_delete( 'pnpnd_account_active', 'pnpnd_accounts' );
		wp_cache_delete( 'pnpnd_accounts_all', 'pnpnd_accounts' );

		return (bool) $result;
	}

	/**
	 * Update account in the database
	 *
	 * @param AppAccount $account
	 * @return bool|WP_Error
	 */
	public function updateAccount( AppAccount $account ) {
		if ( ! current_user_can( 'manage_options' ) ) {
			return new WP_Error( 401, __( 'You do not have permission to update accounts.', 'ninja-drive' ) );
		}

		$tokens     = maybe_serialize( $account->getAccessToken() );
		$hashTokens = Helpers::encode( $tokens );

		$data = array(
			'name'      => $account->getName(),
			'email'     => $account->getEmail(),
			'photo'     => $account->getPhoto(),
			'storage'   => maybe_serialize( $account->getStorage() ),
			'lost'      => (int) $account->getLost(),
			'rootId'    => $account->getRootId(),
			'active'    => (int) $account->getActive(),
			'tokens'    => $hashTokens,
			'updatedAt' => current_time( 'mysql' ),
		);

		$format = array(
			'%s', // name
			'%s', // email
			'%s', // photo
			'%s', // storage
			'%d', // lost
			'%s', // rootId
			'%d', // active
			'%s', // tokens
			'%s', // updatedAt
		);

		$where       = array( 'id' => $account->getId() );
		$whereFormat = array( '%s' );

		$result = $this->update( $data, $where, $format, $whereFormat );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		wp_cache_delete( "pnpnd_account_{$account->getId()}", 'pnpnd_accounts' );
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
	public function deleteAccount( $id ) {
		if ( ! current_user_can( 'manage_options' ) || empty( $id ) ) {
			return new WP_Error( 401, __( 'You do not have permission to delete this account.', 'ninja-drive' ) );
		}

		$account = $this->getAccount( $id );
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
		$filesModel = Files::getInstance();
		$filesModel->deleteFilesByAccountId( $id );

		wp_cache_delete( "pnpnd_account_{$id}", 'pnpnd_accounts' );
		wp_cache_delete( 'pnpnd_account_active', 'pnpnd_accounts' );
		wp_cache_delete( 'pnpnd_accounts_all', 'pnpnd_accounts' );

		return (bool) $result;
	}

	/**
	 * Sets the specified account as lost.
	 *
	 * @param string|int $id The ID of the account to set as lost.
	 * @return bool|WP_Error True if the account was successfully set as lost, false otherwise.
	 *                       If an error occurred, a WP_Error object is returned.
	 */
	public function lostAccount( $id ) {
		if ( empty( $id ) ) {
			return false;
		}

		$result = $this->update( array( 'lost' => 1 ), array( 'id' => $id ), array( '%d' ), array( '%s' ) );

		if ( is_wp_error( $result ) ) {
			return $result;
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
	public function isLost( $id ) {
		if ( empty( $id ) ) {

			return false;
		}

		$account = $this->getAccount( $id );

		if ( is_wp_error( $account ) || ! $account instanceof AppAccount ) {
			return false;
		}

		$result = $account->getLost() == 1;

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
	public function getTokens( $id = null ) {
		global $wpdb;
		if ( ! current_user_can( 'manage_options' ) ) {
			return new WP_Error( 401, __( 'You do not have permission to retrieve tokens.', 'ninja-drive' ) );
		}

		if ( empty( $id ) ) {
			$account = $this->getAccount();

			if ( is_wp_error( $account ) ) {
				return $account;
			}

			if ( $account instanceof AppAccount ) {
				$id = $account->getId();
			}
		}

		if ( empty( $id ) || ! is_numeric( $id ) ) {
			return new WP_Error( 400, __( 'Account ID is required.', 'ninja-drive' ) );
		}

		$cacheKey = "pnpnd_account_tokens_{$id}";
		if ( false !== ( $cachedTokens = wp_cache_get( $cacheKey, 'pnpnd_accounts' ) ) ) {
			return $cachedTokens;
		}

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
		$result = $wpdb->get_row( $wpdb->prepare( 'SELECT tokens FROM %i WHERE id = %s', $this->tableName, $id ), ARRAY_A );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		$tokens = Helpers::decode( $result['tokens'] );
		wp_cache_set( $cacheKey, $tokens, 'pnpnd_accounts' );

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
	public function setToken( $id, $token ) {
		if ( ! current_user_can( 'manage_options' ) ) {
			return new WP_Error( 401, __( 'You do not have permission to update tokens.', 'ninja-drive' ) );
		}

		if ( empty( $id ) || empty( $token ) ) {
			return new WP_Error( 400, __( 'Account ID and token are required.', 'ninja-drive' ) );
		}

		$token     = maybe_serialize( json_decode( $token, true ) );
		$hashToken = Helpers::encode( $token );

		$data = array(
			'tokens'    => $hashToken,
			'updatedAt' => current_time( 'mysql' ),
		);

		$where = array(
			'id' => $id,
		);

		$format = array(
			'%s',
			'%s',
		);

		$whereFormat = array(
			'%s',
		);

		$result = $this->update( $data, $where, $format, $whereFormat );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return $result !== false;
	}

	/**
	 * Process a single account object
	 *
	 * @param stdClass $account
	 * @return AppAccount|bool
	 */
	private function processAccount( $account ) {
		if ( empty( $account ) ) {

			return false;
		}

		$user = \get_user( $account->userId ?? 0 );

		$userInfo = array();

		if ( $user instanceof WP_User ) {
			$userInfo = array(
				'id'     => $user->ID,
				'email'  => $user->user_email,
				'name'   => $user->display_name,
				'avatar' => get_avatar_url( $user->ID ),
				'roles'  => $user->roles,
			);
		}

		return new AppAccount(
			$account->id,
			$account->name,
			$account->email,
			$account->photo,
			maybe_unserialize( $account->storage ),
			(int) $account->lost,
			$account->rootId,
			$userInfo,
			(int) $account->active,
			maybe_unserialize( Helpers::decode( $account->tokens ) )
		);
	}

	/**
	 * Process an array of account objects
	 *
	 * @param array $accounts
	 * @return array
	 */
	private function processAccounts( array $accounts ) {
		$processAccounts = array_map( array( $this, 'processAccount' ), $accounts );
		$accountsById    = array();
		foreach ( $processAccounts as $processedAccount ) {
			if ( $processedAccount ) {
				$accountId = $processedAccount->getId();
				if ( $accountId !== null ) {
					$accountsById[ $accountId ] = $processedAccount;
				}
			}
		}

		return $accountsById;
	}
}
