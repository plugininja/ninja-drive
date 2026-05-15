<?php

namespace Pninja\ND\API\Controllers;

use Pninja\ND\API\BaseController;
use Pninja\ND\App\Account as AppAccount;
use Pninja\ND\App\Accounts;
use Pninja\ND\App\Client;
use Pninja\ND\Utils\Helpers;
use WP_Error;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class Account extends BaseController {

	public function __construct() {
		parent::__construct( 'pnpnd/v1', 'account' );
	}

	public function managePermission(): bool {
		return current_user_can( 'manage_options' );
	}

	public function register_routes(): void {
		register_rest_route(
			$this->namespace,
			"{$this->rest_base}/auth-url",
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'getAuthUrl' ),
				'permission_callback' => array( $this, 'managePermission' ),
				'args'                => array(
					'accountKey'     => array(
						'required'          => false,
						'type'              => 'string',
						'description'       => 'The unique key of the account to reconnect. If not provided, a new auth URL will be generated for a new account connection.',
						'sanitize_callback' => 'sanitize_text_field',
					),
					'appKey'         => array(
						'required'          => false,
						'type'              => 'string',
						'description'       => 'The application key for the account. If not provided, the default app key will be used.',
						'sanitize_callback' => 'sanitize_text_field',
					),
					'appSecret'      => array(
						'required'          => false,
						'type'              => 'string',
						'description'       => 'The application secret for the account. If not provided, the default app secret will be used.',
						'sanitize_callback' => 'sanitize_text_field',
					),
					'connectionType' => array(
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
				'callback'            => array( $this, 'getAllAccounts' ),
				'permission_callback' => array( $this, 'managePermission' ),
			)
		);

		register_rest_route(
			$this->namespace,
			"{$this->rest_base}/switch",
			array(
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'switch' ),
				'permission_callback' => array( $this, 'managePermission' ),
			)
		);

		register_rest_route(
			$this->namespace,
			"{$this->rest_base}/sync",
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'syncStatus' ),
					'permission_callback' => array( $this, 'managePermission' ),
					'args'                => array(
						'accountKey' => array(
							'type'              => 'string',
							'required'          => true,
							'sanitize_callback' => 'sanitize_text_field',
						),
					),
				),
				array(
					'methods'             => WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'sync' ),
					'permission_callback' => array( $this, 'managePermission' ),
					'args'                => array(
						'accountKey' => array(
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
			"{$this->rest_base}/(?P<accountKey>[^/]+)",
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'getAccount' ),
					'permission_callback' => array( $this, 'managePermission' ),
					'args'                => array(
						'accountKey' => array(
							'required'          => true,
							'type'              => 'string',
							'sanitize_callback' => 'sanitize_text_field',
						),
					),
				),
				array(
					'methods'             => WP_REST_Server::DELETABLE,
					'callback'            => array( $this, 'deleteAccount' ),
					'permission_callback' => array( $this, 'managePermission' ),
				),
			)
		);
	}

	public function getAuthUrl( WP_REST_Request $request ): WP_REST_Response {
		try {
			$accountKey     = $request->get_param( 'accountKey' );
			$appKey         = $request->get_param( 'appKey' );
			$appSecret      = $request->get_param( 'appSecret' );
			$connectionType = $request->get_param( 'connectionType' );

			if ( ! empty( $accountKey ) ) {
				$account = pnpndGetAccountByKey( $accountKey );

				if ( is_wp_error( $account ) ) {
					return self::errorResponse( $account->get_error_message(), self::HTTP_BAD_REQUEST );
				}

				if ( empty( $account ) || ! $account instanceof AppAccount ) {
					return self::errorResponse( __( 'Invalid account key provided.', 'ninja-drive' ), self::HTTP_BAD_REQUEST );
				}

				// If accountKey exists, check existing account status
				if ( ! empty( $accountKey ) && $accountKey !== 'null' ) {
					$account = Accounts::getInstance()->syncAccount( $account->getId() );
					if ( $account instanceof AppAccount && (int) $account->getLost() === 0 ) {
						return $this->successResponse(
							$account->jsonSerialize(),
							__( 'Reconnected account successfully', 'ninja-drive' )
						);
					}
				}
			}

			if ( ! empty( $appKey ) && ! empty( $appSecret ) ) {
				$existingAppKey    = Helpers::getSetting( 'accounts.appClientId', null );
				$existingAppSecret = Helpers::getSetting( 'accounts.appClientSecret', null, 'decode' );

				if ( $existingAppKey !== $appKey ) {
					Helpers::updateSetting( 'accounts.appClientId', trim( $appKey ) );
				}

				if ( $existingAppSecret !== $appSecret ) {
					Helpers::updateSetting( 'accounts.appClientSecret', trim( $appSecret ) );
				}
			}

			if ( ! empty( $connectionType = $request->get_param( 'connectionType' ) ) ) {
				$validatedConnectionTypes = array( 'automatic', 'manual' );

				if ( in_array( $connectionType, $validatedConnectionTypes, true ) ) {
					$existingConnectionType = Helpers::getSetting( 'accounts.connectionType', 'manual' );

					if ( $existingConnectionType !== $connectionType ) {
						Helpers::updateSetting( 'accounts.connectionType', $connectionType );
					}
				}
			}

			// Generate new auth URL
			$authUrl = Client::getInstance( 'new' )->getAuthUrl();

			if ( empty( $authUrl ) ) {
				return $this->errorResponse(
					__( 'Auth URL could not be generated', 'ninja-drive' ),
					self::HTTP_NOT_FOUND
				);
			}

			return $this->successResponse(
				$authUrl,
				__( 'Auth URL retrieved successfully', 'ninja-drive' )
			);

		} catch ( \Exception $e ) {
			return $this->handleException( $e, 'Failed to retrieve auth URL' );
		}
	}

	public function getAllAccounts( WP_REST_Request $request ): WP_REST_Response {
		try {
			$accounts = Accounts::getInstance()->getAccounts();

			if ( empty( $accounts ) ) {
				return $this->errorResponse( 'No account found', self::HTTP_NOT_FOUND );
			}

			return $this->successResponse( array_values( $accounts ), 'Accounts retrieved successfully' );

		} catch ( \Exception $e ) {
			return $this->handleException( $e, 'Failed to retrieve accounts' );
		}
	}

	public function getAccount( WP_REST_Request $request ): WP_REST_Response {
		try {
			$accountKey = $request->get_param( 'accountKey' );
			if ( empty( $accountKey ) ) {
				return $this->errorResponse( __( 'Account key is required.', 'ninja-drive' ), self::HTTP_BAD_REQUEST );
			}

			$account = Accounts::getInstance()->getAccountByKey( $accountKey );
			if ( empty( $account ) ) {
				return $this->errorResponse( 'No account found', self::HTTP_NOT_FOUND );
			}

			return $this->successResponse( $account->jsonSerialize(), 'Account retrieved successfully' );

		} catch ( \Exception $e ) {
			return $this->handleException( $e, 'Failed to retrieve account' );
		}
	}

	public function deleteAccount( WP_REST_Request $request ): WP_REST_Response {
		$accountKey = $request->get_param( 'accountKey' );

		$account = pnpndGetAccountByKey( $accountKey );

		if ( is_wp_error( $account ) ) {
			return self::errorResponse( $account->get_error_message(), self::HTTP_BAD_REQUEST );
		}

		if ( empty( $account ) || ! $account instanceof AppAccount ) {
			return self::errorResponse( __( 'Invalid account key provided.', 'ninja-drive' ), self::HTTP_BAD_REQUEST );
		}

		try {

			$result = Accounts::getInstance()->deleteAccount( $account->getId() );

			if ( is_wp_error( $result ) ) {
				return $this->errorResponse( $result->get_error_message(), $result->get_error_code() );
			}

			return $this->successResponse( $result, 'Account deleted successfully' );

		} catch ( \Exception $e ) {
			return $this->handleException( $e, 'Failed to delete account' );
		}
	}

	public function syncStatus( WP_REST_Request $request ): WP_REST_Response {
		$accountKey = $request->get_param( 'accountKey' );

		if ( empty( $accountKey ) ) {
			return self::errorResponse( __( 'Account key is required.', 'ninja-drive' ), self::HTTP_BAD_REQUEST );
		}

		$account = pnpndGetAccountByKey( $accountKey );
		if ( is_wp_error( $account ) ) {
			return self::errorResponse( $account->get_error_message(), self::HTTP_BAD_REQUEST );
		}

		if ( empty( $account ) || ! $account instanceof AppAccount ) {
			return self::errorResponse( __( 'Invalid account key provided.', 'ninja-drive' ), self::HTTP_BAD_REQUEST );
		}

		$syncing = get_transient( "pnpnd_syncing_account_{$account->getId()}" );

		return $this->successResponse(
			array(
				'syncing' => $syncing ? true : false,
			),
			'Account syncing status retrieved successfully'
		);
	}

	public function sync( WP_REST_Request $request ): WP_REST_Response {

		$accountKey = $request->get_param( 'accountKey' );

		$account = pnpndGetAccountByKey( $accountKey );

		if ( is_wp_error( $account ) ) {
			return self::errorResponse( $account->get_error_message(), self::HTTP_BAD_REQUEST );
		}

		if ( empty( $account ) || ! $account instanceof AppAccount ) {
			return self::errorResponse( __( 'Invalid account key provided.', 'ninja-drive' ), self::HTTP_BAD_REQUEST );
		}

		try {
			$account = Accounts::getInstance()->syncAccount( $account->getId() );

			if ( is_wp_error( $account ) ) {
				return $this->errorResponse( $account->get_error_message(), $account->get_error_code() );
			}

			wp_schedule_single_event( time() + 5, 'pnpnd_sync_all_files', array( $account->getId(), 1 ) );
			set_transient(
				"pnpnd_syncing_account_{$account->getId()}",
				maybe_serialize(
					array(
						'status'           => 'started',
						'processedFolders' => 0,
						'processedFiles'   => 0,
						'errors'           => array(),
					)
				),
				60
			);

			return $this->successResponse( $account, 'Account synced successfully' );

		} catch ( \Exception $e ) {
			return $this->handleException( $e, 'Failed to sync account' );
		}
	}

	public function get_item_schema(): array {
		$schema               = parent::get_item_schema();
		$schema['title']      = 'account';
		$schema['properties'] = array(
			'id'         => array(
				'description' => __( 'Unique identifier for the account.', 'ninja-drive' ),
				'type'        => 'string',
				'context'     => array( 'view', 'edit' ),
				'readonly'    => true,
			),
			'accountKey' => array(
				'description' => __( 'Unique key for the account.', 'ninja-drive' ),
				'type'        => 'string',
				'context'     => array( 'view', 'edit' ),
				'readonly'    => true,
			),
			'name'       => array(
				'description' => __( 'Display name of the account.', 'ninja-drive' ),
				'type'        => 'string',
				'context'     => array( 'view', 'edit' ),
			),
			'email'      => array(
				'description' => __( 'Email address associated with the account.', 'ninja-drive' ),
				'type'        => 'string',
				'format'      => 'email',
				'context'     => array( 'view', 'edit' ),
			),
			'photo'      => array(
				'description' => __( 'Avatar URL for the account.', 'ninja-drive' ),
				'type'        => 'string',
				'format'      => 'uri',
				'context'     => array( 'view', 'edit' ),
			),
			'storage'    => array(
				'description' => __( 'Storage usage information.', 'ninja-drive' ),
				'type'        => 'object',
				'context'     => array( 'view', 'edit' ),
			),
			'lost'       => array(
				'description' => __( 'Whether the account has lost authentication.', 'ninja-drive' ),
				'type'        => 'integer',
				'enum'        => array( 0, 1 ),
				'context'     => array( 'view', 'edit' ),
			),
			'rootId'     => array(
				'description' => __( 'Root folder ID for the account.', 'ninja-drive' ),
				'type'        => 'string',
				'context'     => array( 'view', 'edit' ),
			),
			'user'       => array(
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
			'active'     => array(
				'description' => __( 'Whether the account is active.', 'ninja-drive' ),
				'type'        => 'integer',
				'enum'        => array( 0, 1 ),
				'context'     => array( 'view', 'edit' ),
			),
		);

		return $schema;
	}

	public function switch( WP_REST_Request $request ): WP_REST_Response {
		try {
			$accountKey = $request->get_param( 'accountKey' );

			if ( empty( $accountKey ) ) {
				return self::errorResponse( __( 'Account key is required.', 'ninja-drive' ), self::HTTP_BAD_REQUEST );
			}

			$account = pnpndGetAccountByKey( $accountKey );

			if ( is_wp_error( $account ) ) {
				return self::errorResponse( $account->get_error_message(), self::HTTP_BAD_REQUEST );
			}

			if ( empty( $account ) || ! $account instanceof AppAccount ) {
				return self::errorResponse( __( 'Invalid account key provided.', 'ninja-drive' ), self::HTTP_BAD_REQUEST );
			}

			$account = Accounts::getInstance()->syncAccount( $accountKey );

			if ( $account instanceof AppAccount && (int) $account->getLost() === 0 ) {
				return $this->successResponse(
					$account->jsonSerialize(),
					__( 'Reconnected account successfully', 'ninja-drive' )
				);
			}

			return $this->successResponse(
				$account->jsonSerialize(),
				__( 'Switched account successfully', 'ninja-drive' )
			);

		} catch ( \Exception $e ) {
			return $this->handleException( $e, 'Failed to switch account' );
		}
	}
}
