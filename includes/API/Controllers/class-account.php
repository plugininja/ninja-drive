<?php

namespace Pnpnd\ND\API\Controllers;

use Pnpnd\ND\API\Base_Controller;
use Pnpnd\ND\App\Account as AppAccount;
use Pnpnd\ND\App\Accounts;
use Pnpnd\ND\App\Client;
use Pnpnd\ND\Utils\Helpers;
use WP_Error;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class Account extends Base_Controller {

	public function __construct() {
		parent::__construct( 'pnpnd/v1', 'account' );
	}

	public function manage_permission( WP_REST_Request $request ) {
		if ( $this->has_permission() ) {
			return true;
		}

		return new WP_Error( 'forbidden', 'You do not have permission.', array( 'status' => 403 ) );
	}

	public function register_routes(): void {
		register_rest_route(
			$this->namespace,
			"{$this->rest_base}/auth-url",
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_auth_url' ),
				'permission_callback' => array( $this, 'manage_permission' ),
				'args'                => array(
					'account_key'     => array(
						'required'          => false,
						'type'              => 'string',
						'description'       => 'The unique key of the account to reconnect. If not provided, a new auth URL will be generated for a new account connection.',
						'sanitize_callback' => 'sanitize_text_field',
					),
					'app_key'         => array(
						'required'          => false,
						'type'              => 'string',
						'description'       => 'The application key for the account. If not provided, the default app key will be used.',
						'sanitize_callback' => 'sanitize_text_field',
					),
					'app_secret'      => array(
						'required'          => false,
						'type'              => 'string',
						'description'       => 'The application secret for the account. If not provided, the default app secret will be used.',
						'sanitize_callback' => 'sanitize_text_field',
					),
					'connection_type' => array(
						'required'          => false,
						'type'              => 'string',
						'default'           => null,
						'description'       => 'The type of connection for the account (e.g., "standard", "premium"). This can be used to determine the level of access or features available for the account.',
						'sanitize_callback' => 'sanitize_text_field',
					),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			"{$this->rest_base}/all",
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_all_accounts' ),
				'permission_callback' => array( $this, 'manage_permission' ),
			)
		);

		register_rest_route(
			$this->namespace,
			"{$this->rest_base}/sync",
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'sync_status' ),
					'permission_callback' => array( $this, 'manage_permission' ),
					'args'                => array(
						'account_key' => array(
							'type'              => 'string',
							'required'          => true,
							'sanitize_callback' => 'sanitize_text_field',
						),
					),
				),
				array(
					'methods'             => WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'sync' ),
					'permission_callback' => array( $this, 'manage_permission' ),
					'args'                => array(
						'account_key' => array(
							'type'              => 'string',
							'required'          => true,
							'sanitize_callback' => 'sanitize_text_field',
						),
					),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			"{$this->rest_base}/(?P<account_key>[^/]+)",
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_account' ),
					'permission_callback' => array( $this, 'manage_permission' ),
					'args'                => array(
						'account_key' => array(
							'required'          => true,
							'type'              => 'string',
							'sanitize_callback' => 'sanitize_text_field',
						),
					),
				),
				array(
					'methods'             => WP_REST_Server::DELETABLE,
					'callback'            => array( $this, 'delete_account' ),
					'permission_callback' => array( $this, 'manage_permission' ),
					'args'                => array(
						'account_key' => array(
							'required'          => true,
							'type'              => 'string',
							'sanitize_callback' => 'sanitize_text_field',
						),
					),
				),
			)
		);
	}

	public function get_auth_url( WP_REST_Request $request ): WP_REST_Response {
		try {
			$account_key     = $request->get_param( 'account_key' );
			$app_key         = $request->get_param( 'app_key' );
			$app_secret      = $request->get_param( 'app_secret' );
			$connection_type = $request->get_param( 'connection_type' );

			if ( ! empty( $account_key ) ) {
				$account = pnpnd_get_account_by_key( $account_key );

				if ( is_wp_error( $account ) ) {
					return self::error_response( $account->get_error_message(), self::HTTP_BAD_REQUEST );
				}

				if ( empty( $account ) || ! $account instanceof AppAccount ) {
					return self::error_response( __( 'Invalid account key provided.', 'ninja-drive' ), self::HTTP_BAD_REQUEST );
				}

				if ( ! empty( $account_key ) && 'null' !== $account_key ) {
					$account = Accounts::get_instance()->sync_account( $account->get_id() );
					if ( $account instanceof AppAccount && (int) $account->is_lost() === 0 ) {
						return $this->success_response(
							$account->jsonSerialize(),
							__( 'Reconnected account successfully', 'ninja-drive' )
						);
					}
				}
			}

			if ( ! empty( $app_key ) && ! empty( $app_secret ) ) {
				$existing_app_key    = Helpers::get_setting( 'accounts.app_client_id', null );
				$existing_app_secret = Helpers::get_setting( 'accounts.app_client_secret', null, 'decode' );

				if ( $existing_app_key !== $app_key ) {
					Helpers::update_setting( 'accounts.app_client_id', trim( $app_key ) );
				}

				if ( $existing_app_secret !== $app_secret ) {
					Helpers::update_setting( 'accounts.app_client_secret', trim( $app_secret ) );
				}
			}

			if ( ! empty( $connection_type ) ) {
				$validated_connection_types = array( 'automatic', 'manual' );

				if ( in_array( $connection_type, $validated_connection_types, true ) ) {
					$existing_connection_type = Helpers::get_setting( 'accounts.connection_type', 'manual' );

					if ( $existing_connection_type !== $connection_type ) {
						Helpers::update_setting( 'accounts.connection_type', $connection_type );
					}
				}
			}

			$auth_url = Client::get_instance( 'new' )->get_auth_url();

			if ( empty( $auth_url ) ) {
				return $this->error_response(
					__( 'Auth URL could not be generated', 'ninja-drive' ),
					self::HTTP_NOT_FOUND
				);
			}

			return $this->success_response(
				$auth_url,
				__( 'Auth URL retrieved successfully', 'ninja-drive' )
			);

		} catch ( \Exception $e ) {
			return $this->handle_exception( $e, 'Failed to retrieve auth URL' );
		}
	}

	public function get_all_accounts( WP_REST_Request $request ): WP_REST_Response {
		try {
			$accounts = Accounts::get_instance()->get_accounts();

			if ( empty( $accounts ) ) {
				return $this->error_response( 'No account found', self::HTTP_NOT_FOUND );
			}

			return $this->success_response( array_values( $accounts ), 'Accounts retrieved successfully' );

		} catch ( \Exception $e ) {
			return $this->handle_exception( $e, 'Failed to retrieve accounts' );
		}
	}

	public function get_account( WP_REST_Request $request ): WP_REST_Response {
		try {
			$account_key = $request->get_param( 'account_key' );
			if ( empty( $account_key ) ) {
				return $this->error_response( __( 'Account key is required.', 'ninja-drive' ), self::HTTP_BAD_REQUEST );
			}

			$account = Accounts::get_instance()->get_account_by_key( $account_key );
			if ( empty( $account ) ) {
				return $this->error_response( 'No account found', self::HTTP_NOT_FOUND );
			}

			return $this->success_response( $account->jsonSerialize(), 'Account retrieved successfully' );

		} catch ( \Exception $e ) {
			return $this->handle_exception( $e, 'Failed to retrieve account' );
		}
	}

	public function delete_account( WP_REST_Request $request ): WP_REST_Response {
		$account_key = $request->get_param( 'account_key' );

		$account = pnpnd_get_account_by_key( $account_key );

		if ( is_wp_error( $account ) ) {
			return self::error_response( $account->get_error_message(), self::HTTP_BAD_REQUEST );
		}

		if ( empty( $account ) || ! $account instanceof AppAccount ) {
			return self::error_response( __( 'Invalid account key provided.', 'ninja-drive' ), self::HTTP_BAD_REQUEST );
		}

		try {

			$result = Accounts::get_instance()->delete_account( $account->get_id() );

			if ( is_wp_error( $result ) ) {
				return $this->error_response( $result->get_error_message(), $result->get_error_code() );
			}

			return $this->success_response( $result, 'Account deleted successfully' );

		} catch ( \Exception $e ) {
			return $this->handle_exception( $e, 'Failed to delete account' );
		}
	}

	public function sync_status( WP_REST_Request $request ): WP_REST_Response {
		$account_key = $request->get_param( 'account_key' );

		if ( empty( $account_key ) ) {
			return self::error_response( __( 'Account key is required.', 'ninja-drive' ), self::HTTP_BAD_REQUEST );
		}

		$account = pnpnd_get_account_by_key( $account_key );
		if ( is_wp_error( $account ) ) {
			return self::error_response( $account->get_error_message(), self::HTTP_BAD_REQUEST );
		}

		if ( empty( $account ) || ! $account instanceof AppAccount ) {
			return self::error_response( __( 'Invalid account key provided.', 'ninja-drive' ), self::HTTP_BAD_REQUEST );
		}

		$syncing = get_transient( "pnpnd_syncing_account_{$account->get_id()}" );

		return $this->success_response(
			array(
				'syncing' => $syncing ? true : false,
			),
			'Account syncing status retrieved successfully'
		);
	}

	public function sync( WP_REST_Request $request ): WP_REST_Response {

		$account_key = $request->get_param( 'account_key' );

		$account = pnpnd_get_account_by_key( $account_key );

		if ( is_wp_error( $account ) ) {
			return self::error_response( $account->get_error_message(), self::HTTP_BAD_REQUEST );
		}

		if ( empty( $account ) || ! $account instanceof AppAccount ) {
			return self::error_response( __( 'Invalid account key provided.', 'ninja-drive' ), self::HTTP_BAD_REQUEST );
		}

		try {
			$account = Accounts::get_instance()->sync_account( $account->get_id() );

			if ( is_wp_error( $account ) ) {
				return $this->error_response( $account->get_error_message(), $account->get_error_code() );
			}

			wp_schedule_single_event( time() + 5, 'pnpnd_sync_all_files', array( $account->get_id(), 1 ) );
			set_transient(
				"pnpnd_syncing_account_{$account->get_id()}",
				maybe_serialize(
					array(
						'status'            => 'started',
						'processed_folders' => 0,
						'processed_files'   => 0,
						'errors'            => array(),
					)
				),
				60
			);

			return $this->success_response( $account, 'Account synced successfully' );

		} catch ( \Exception $e ) {
			return $this->handle_exception( $e, 'Failed to sync account' );
		}
	}

	public function get_item_schema(): array {
		$schema               = parent::get_item_schema();
		$schema['title']      = 'account';
		$schema['properties'] = array(
			'id'          => array(
				'description' => __( 'Unique identifier for the account.', 'ninja-drive' ),
				'type'        => 'string',
				'context'     => array( 'view', 'edit' ),
				'readonly'    => true,
			),
			'account_key' => array(
				'description' => __( 'Unique key for the account.', 'ninja-drive' ),
				'type'        => 'string',
				'context'     => array( 'view', 'edit' ),
				'readonly'    => true,
			),
			'name'        => array(
				'description' => __( 'Display name of the account.', 'ninja-drive' ),
				'type'        => 'string',
				'context'     => array( 'view', 'edit' ),
			),
			'email'       => array(
				'description' => __( 'Email address associated with the account.', 'ninja-drive' ),
				'type'        => 'string',
				'format'      => 'email',
				'context'     => array( 'view', 'edit' ),
			),
			'photo'       => array(
				'description' => __( 'Avatar URL for the account.', 'ninja-drive' ),
				'type'        => 'string',
				'format'      => 'uri',
				'context'     => array( 'view', 'edit' ),
			),
			'storage'     => array(
				'description' => __( 'Storage usage information.', 'ninja-drive' ),
				'type'        => 'object',
				'context'     => array( 'view', 'edit' ),
			),
			'lost'        => array(
				'description' => __( 'Whether the account has lost authentication.', 'ninja-drive' ),
				'type'        => 'integer',
				'enum'        => array( 0, 1 ),
				'context'     => array( 'view', 'edit' ),
			),
			'root_id'     => array(
				'description' => __( 'Root folder ID for the account.', 'ninja-drive' ),
				'type'        => 'string',
				'context'     => array( 'view', 'edit' ),
			),
			'user'        => array(
				'description' => __( 'Associated WordPress user.', 'ninja-drive' ),
				'type'        => 'object',
				'context'     => array( 'view', 'edit' ),
				'properties'  => array(
					'id'     => array( 'type' => 'integer' ),
					'email'  => array( 'type' => 'string' ),
					'name'   => array( 'type' => 'string' ),
					'avatar' => array( 'type' => 'string' ),
					'roles'  => array(
						'type'  => 'array',
						'items' => array( 'type' => 'string' ),
					),
				),
			),
			'active'      => array(
				'description' => __( 'Whether the account is active.', 'ninja-drive' ),
				'type'        => 'integer',
				'enum'        => array( 0, 1 ),
				'context'     => array( 'view', 'edit' ),
			),
		);

		return $schema;
	}

	public function switch_account__premium_only( WP_REST_Request $request ): WP_REST_Response {
		try {
			$account_key = $request->get_param( 'account_key' );

			if ( empty( $account_key ) ) {
				return self::error_response( __( 'Account key is required.', 'ninja-drive' ), self::HTTP_BAD_REQUEST );
			}

			$account = pnpnd_get_account_by_key( $account_key );

			if ( is_wp_error( $account ) ) {
				return self::error_response( $account->get_error_message(), self::HTTP_BAD_REQUEST );
			}

			if ( empty( $account ) || ! $account instanceof AppAccount ) {
				return self::error_response( __( 'Invalid account key provided.', 'ninja-drive' ), self::HTTP_BAD_REQUEST );
			}

			$account = Accounts::get_instance()->switch_account__premium_only( $account->get_id() );

			if ( empty( $account ) ) {
				return $this->error_response( 'Failed to switch account', 400 );
			}

				return $this->success_response( $account->jsonSerialize(), 'Account switched successfully' );

		} catch ( \Exception $e ) {
			return $this->handle_exception( $e, 'Failed to switch account' );
		}
	}
}
