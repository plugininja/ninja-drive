<?php

namespace Pnpnd\ND\API\Controllers;

use Exception;
use Pnpnd\ND\API\Base_Controller;
use Pnpnd\ND\Utils\Helpers;
use WP_Error;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class Users extends Base_Controller {

	public function __construct() {
		parent::__construct( 'pnpnd/v1', 'user' );
	}

	public function manage_users_permission( WP_REST_Request $request ): bool {
		if ( $this->has_permission() ) {
			return true;
		}

		return false;
	}

	public function register_routes(): void {
		register_rest_route(
			$this->namespace,
			$this->rest_base . '/list',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_user_list' ),
				'permission_callback' => array( $this, 'manage_users_permission' ),
				'args'                => array(
					'hide_current_user' => array(
						'required'    => false,
						'type'        => 'boolean',
						'default'     => false,
						'description' => __( 'Whether to hide the current logged-in user from the list.', 'ninja-drive' ),
					),

					'fields'            => array(
						'required'          => false,
						'type'              => 'string',
						'description'       => __( 'Comma-separated list of user fields to retrieve. Allowed fields are: ID, user_login, user_nicename, user_email, user_url, user_registered, display_name, nickname, first_name, last_name, description, roles.', 'ninja-drive' ),
						'default'           => 'ID,user_login',
						'validate_callback' => function ( $param, $request, $key ) {
							if ( ! is_string( $param ) ) {
								return false;
							}
							$allowed_fields = array(
								'ID',
								'user_login',
								'user_nicename',
								'user_email',
								'user_url',
								'user_registered',
								'display_name',
								'nickname',
								'first_name',
								'last_name',
								'description',
								'roles',
							);
							$fields         = array_map( 'trim', explode( ',', $param ) );
							foreach ( $fields as $field ) {
								if ( ! in_array( $field, $allowed_fields, true ) ) {

									// translators: %s is the invalid field name.
									return new WP_Error( 'invalid_field', sprintf( __( 'Invalid field: %s', 'ninja-drive' ), $field ) );
								}
							}

							return true;
						},
					),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			$this->rest_base . '/roles',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_user_roles' ),
				'permission_callback' => array( $this, 'manage_users_permission' ),
			)
		);

	}

	public function get_item_schema(): array {
		$schema               = parent::get_item_schema();
		$schema['title']      = 'user';
		$schema['properties'] = array(
			'users' => array(
				'description' => __( 'List of WordPress users.', 'ninja-drive' ),
				'type'        => 'array',
				'context'     => array( 'view', 'edit' ),
				'items'       => array(
					'type'       => 'object',
					'properties' => array(
						'ID'              => array( 'type' => 'integer' ),
						'user_login'      => array( 'type' => 'string' ),
						'user_nicename'   => array( 'type' => 'string' ),
						'user_email'      => array(
							'type'   => 'string',
							'format' => 'email',
						),
						'user_url'        => array(
							'type'   => 'string',
							'format' => 'uri',
						),
						'user_registered' => array(
							'type'   => 'string',
							'format' => 'date-time',
						),
						'display_name'    => array( 'type' => 'string' ),
						'nickname'        => array( 'type' => 'string' ),
						'first_name'      => array( 'type' => 'string' ),
						'last_name'       => array( 'type' => 'string' ),
						'description'     => array( 'type' => 'string' ),
						'roles'           => array(
							'type'  => 'array',
							'items' => array( 'type' => 'string' ),
						),
					),
				),
			),
			'roles' => array(
				'description' => __( 'List of WordPress roles.', 'ninja-drive' ),
				'type'        => 'array',
				'context'     => array( 'view', 'edit' ),
				'items'       => array(
					'type'       => 'object',
					'properties' => array(
						'role_key'  => array( 'type' => 'string' ),
						'role_name' => array( 'type' => 'string' ),
					),
				),
			),
		);

		return $schema;
	}

	public function get_user_roles( WP_REST_Request $request ): WP_REST_Response {
		try {
			global $wp_roles;

			if ( ! isset( $wp_roles ) ) {
				$wp_roles = new \WP_Roles();
			}

			$roles      = $wp_roles->get_names();
			$roles_list = array();

			foreach ( $roles as $role_key => $role_name ) {
				$roles_list[] = array(
					'role_key'  => $role_key,
					'role_name' => $role_name,
				);
			}

			return $this->success_response( array( 'roles' => $roles_list ), 'Roles retrieved successfully' );

		} catch ( Exception $e ) {
			return $this->handle_exception( $e, 'Failed to retrieve roles' );
		}
	}

	public function get_user_list( WP_REST_Request $request ): WP_REST_Response {
		$hide_current_user = $request->get_param( 'hide_current_user' );
		$fields            = $request->get_param( 'fields' );
		$fields            = array_map( 'trim', explode( ',', $fields ) );
		$current_user_id   = get_current_user_id();
		try {
			$args = array(
				'orderby' => 'display_name',
				'order'   => 'ASC',
			);

			$users     = get_users( $args );
			$user_list = array();

			foreach ( $users as $user ) {
				if ( $hide_current_user && (int) $user->ID === (int) $current_user_id ) {
					continue;
				}

				$list = array();

				foreach ( $fields as $field ) {
					$list[ $field ] = $user->{$field} ?? null;
				}

				$user_list[] = $list;
			}

			return $this->success_response(
				array(
					'users' => $user_list,
				),
				'Users retrieved successfully'
			);

		} catch ( Exception $e ) {
			return $this->handle_exception( $e, 'Failed to retrieve users' );
		}
	}

	public function set_user_access__premium_only( WP_REST_Request $request ): WP_REST_Response {
		try {
			$type        = sanitize_text_field( $request->get_param( 'type' ) );
			$value       = sanitize_text_field( $request->get_param( 'value' ) );
			$title       = sanitize_text_field( $request->get_param( 'title' ) );
			$status      = sanitize_text_field( $request->get_param( 'status' ) );
			$permissions = $request->get_param( 'permissions' );
			$folders     = $request->get_param( 'folders' );
			$pages       = $request->get_param( 'pages' );

			if ( empty( $type ) || empty( $value ) ) {
				return $this->error_response( 'Type and Value are required fields.', self::HTTP_BAD_REQUEST );
			}

			if ( empty( $folders ) ) {
				return $this->error_response( 'Folders field is required!', self::HTTP_BAD_REQUEST );
			}

			if ( empty( $permissions ) ) {
				return $this->error_response( 'Permissions field is required!', self::HTTP_BAD_REQUEST );
			}

			if ( empty( $title ) ) {
				$title = 'Access Rule';
			}

			if ( empty( $status ) ) {
				$status = 'active';
			}

			if ( ! in_array( $status, array( 'active', 'inactive' ), true ) ) {
				return $this->error_response( 'Status must be "active" or "inactive".', self::HTTP_BAD_REQUEST );
			}

			$validation_result = $this->validate_permissions__premium_only( $permissions, $pages );

			if ( is_wp_error( $validation_result ) ) {
				return $this->error_response( $validation_result->get_error_message(), self::HTTP_BAD_REQUEST );
			}

			if ( 'user' === $type ) {
				$current_user = wp_get_current_user();
				if ( $current_user->user_login === $value ) {
					return $this->error_response( 'You cannot set access for the currently logged-in user!', self::HTTP_BAD_REQUEST );
				}

				$user = get_user_by( 'login', $value );

				if ( empty( $user ) ) {
					return $this->error_response( 'User not found!', self::HTTP_NOT_FOUND );
				}
			} elseif ( 'role' === $type ) {
				if ( 'administrator' === $value ) {
					return $this->error_response( 'You cannot set access for the administrator role!', self::HTTP_BAD_REQUEST );
				}

				$role = get_role( $value );

				if ( empty( $role ) ) {
					return $this->error_response( 'Role not found!', self::HTTP_NOT_FOUND );
				}
			} else {
				return $this->error_response( 'Invalid type specified! Must be "user" or "role".', self::HTTP_BAD_REQUEST );
			}

			$insert_id = \Pnpnd\ND\Models\UserAccess__premium_only::get_instance()->create( $type, $value, $folders, $pages, $permissions, $title, $status );

			if ( ! $insert_id ) {
				return $this->error_response( 'Failed to create access record', self::HTTP_INTERNAL_SERVER_ERROR );
			}

			return $this->success_response(
				array(
					'id'          => $insert_id,
					'type'        => $type,
					'value'       => $value,
					'title'       => $title,
					'status'      => $status,
					'folders'     => $folders,
					'pages'       => $pages,
					'permissions' => $permissions,
				),
				'Access successfully set!'
			);

		} catch ( Exception $e ) {
			return $this->handle_exception( $e, 'Failed to set user access' );
		} catch ( \Error $e ) {
			return $this->error_response( 'System error: ' . $e->getMessage(), self::HTTP_INTERNAL_SERVER_ERROR );
		}
	}

	public function remove_user_access__premium_only( WP_REST_Request $request ): WP_REST_Response {
		try {
			$ids = $request->get_param( 'ids' );

			if ( empty( $ids ) || ! is_array( $ids ) ) {
				return $this->error_response( 'Valid IDs are required!', self::HTTP_BAD_REQUEST );
			}

			$user_access = \Pnpnd\ND\Models\UserAccess__premium_only::get_instance();

			$delete = $user_access->delete_records( $ids );

			if ( empty( $delete ) ) {
				return $this->error_response( 'Failed to delete record!', self::HTTP_INTERNAL_SERVER_ERROR );
			}

			return $this->success_response( $delete, 'User access removed successfully!' );

		} catch ( Exception $e ) {
			return $this->handle_exception( $e, 'Failed to remove user access' );
		} catch ( \Error $e ) {
			return $this->error_response( 'System error: ' . $e->getMessage(), self::HTTP_INTERNAL_SERVER_ERROR );
		}
	}

	public function get_users_access__premium_only( WP_REST_Request $request ): WP_REST_Response {

		$page      = $request->get_param( 'page' );
		$per_page  = $request->get_param( 'per_page' );
		$search    = $request->get_param( 'search' );
		$remaining = $request->get_param( 'remaining' );
		$order     = $request->get_param( 'order' );
		$order_by  = $request->get_param( 'order_by' );
		$type      = $request->get_param( 'type' );
		$status    = $request->get_param( 'status' );

		try {
			$users_access = \Pnpnd\ND\Models\UserAccess__premium_only::get_instance()->get_all( $page, $per_page, $search, $order, $order_by, $type, $status );

			if ( is_wp_error( $users_access ) ) {
				return $this->error_response( $users_access->get_error_message(), self::HTTP_INTERNAL_SERVER_ERROR );
			}

			if ( ! $remaining ) {
				return $this->success_response( $users_access, 'User access retrieved successfully!' );
			}

			$remaining_data = $this->remaining_user_and_roles__premium_only();

			if ( is_wp_error( $remaining_data ) ) {
				return $this->error_response( $remaining_data->get_error_message(), self::HTTP_INTERNAL_SERVER_ERROR );
			}

			$response = array(
				'user_access' => $users_access,
			);

			if ( empty( $remaining_data['users'] ) && empty( $remaining_data['roles'] ) ) {
				$response['remaining'] = null;
			} else {
				$response['remaining'] = $remaining_data;
			}

			return $this->success_response( $response, 'User access retrieved successfully!' );

		} catch ( Exception $e ) {
			return $this->handle_exception( $e, 'Failed to retrieve users access' );
		} catch ( \Error $e ) {
			return $this->error_response( 'System error: ' . $e->getMessage(), self::HTTP_INTERNAL_SERVER_ERROR );
		}
	}

	public function get_user_access_template__premium_only( WP_REST_Request $request ): WP_REST_Response {
		try {
			$remaining = $this->remaining_user_and_roles__premium_only();

			$first_remaining_role = $remaining['roles'][0] ?? null;
			$first_remaining_user = $remaining['users'][0] ?? null;

			if ( empty( $first_remaining_role ) && empty( $first_remaining_user ) ) {
				return $this->success_response(
					array(
						'access'    => null,
						'remaining' => null,
					),
					'No remaining users or roles available for access assignment.'
				);
			}

			$decide_type  = ! empty( $first_remaining_role ) ? 'role' : 'user';
			$decide_value = 'role' === $decide_type ? $first_remaining_role : $first_remaining_user;

			$template = array(
				'id'          => null,
				'type'        => $decide_type,
				'value'       => $decide_value,
				'title'       => '',
				'status'      => 'active',
				'folders'     => array(),
				'pages'       => array(),
				'permissions' => array(),
			);

			$response = array(
				'access'    => $template,
				'remaining' => $this->remaining_user_and_roles__premium_only(),
			);

			return $this->success_response( $response, 'User access template retrieved successfully!' );

		} catch ( Exception $e ) {
			return $this->handle_exception( $e, 'Failed to retrieve user access template' );
		} catch ( \Error $e ) {
			return $this->error_response( 'System error: ' . $e->getMessage(), self::HTTP_INTERNAL_SERVER_ERROR );
		}
	}

	public function get_user_access__premium_only( WP_REST_Request $request ): WP_REST_Response {
		try {
			$id           = (int) $request->get_param( 'id' );
			$is_remaining = (bool) $request->get_param( 'remaining' );

			if ( $id <= 0 ) {
				return $this->error_response( 'Valid ID is required!', self::HTTP_BAD_REQUEST );
			}

			$user_access = \Pnpnd\ND\Models\UserAccess__premium_only::get_instance()->get( $id );

			if ( is_wp_error( $user_access ) ) {
				return $this->error_response( $user_access->get_error_message(), self::HTTP_INTERNAL_SERVER_ERROR );
			} elseif ( empty( $user_access ) ) {
				return $this->error_response( 'No access data found for the specified ID.', self::HTTP_NOT_FOUND );
			}

			if ( ! $is_remaining ) {
				return $this->success_response( $user_access, 'User access retrieved successfully!' );
			}

			$remaining = $this->remaining_user_and_roles__premium_only();

			if ( 'user' === $user_access['type'] ) {
				$remaining['users'][] = $user_access['value'];
			} elseif ( 'role' === $user_access['type'] ) {
				$remaining['roles'][] = $user_access['value'];
			}

			$response = array(
				'access'    => $user_access,
				'remaining' => $remaining,
			);

			return $this->success_response( $response, 'User access retrieved successfully!' );

		} catch ( Exception $e ) {
			return $this->handle_exception( $e, 'Failed to retrieve user access' );
		} catch ( \Error $e ) {
			return $this->error_response( 'System error: ' . $e->getMessage(), self::HTTP_INTERNAL_SERVER_ERROR );
		}
	}

	public function update_user_access__premium_only( WP_REST_Request $request ): WP_REST_Response {
		try {
			$id          = (int) $request->get_param( 'id' );
			$type        = sanitize_text_field( $request->get_param( 'type' ) );
			$value       = sanitize_text_field( $request->get_param( 'value' ) );
			$title       = sanitize_text_field( $request->get_param( 'title' ) );
			$status      = sanitize_text_field( $request->get_param( 'status' ) );
			$permissions = $request->get_param( 'permissions' );
			$folders     = $request->get_param( 'folders' ) ?? array();
			$pages       = $request->get_param( 'pages' ) ?? array();

			if ( $id <= 0 || empty( $type ) || empty( $value ) ) {
				return $this->error_response( 'ID, type, and value are required!', self::HTTP_BAD_REQUEST );
			}

			if ( empty( $folders ) ) {
				return $this->error_response( 'Folders is required!', self::HTTP_BAD_REQUEST );
			}

			if ( ! empty( $status ) && ! in_array( $status, array( 'active', 'inactive' ), true ) ) {
				return $this->error_response( 'Status must be "active" or "inactive".', self::HTTP_BAD_REQUEST );
			}

			if ( 'user' === $type ) {
				$user = get_user_by( 'login', $value );

				if ( empty( $user ) ) {
					return $this->error_response( 'User not found!', self::HTTP_NOT_FOUND );
				}
			} elseif ( 'role' === $type ) {
				$role = get_role( $value );

				if ( empty( $role ) ) {
					return $this->error_response( 'Role not found!', self::HTTP_NOT_FOUND );
				}
			} else {
				return $this->error_response( 'Invalid type specified! Must be "user" or "role".', self::HTTP_BAD_REQUEST );
			}

			$folders     = Helpers::sanitization( $folders );
			$pages       = Helpers::sanitization( $pages );
			$permissions = Helpers::sanitization( $permissions );

			$user_access = \Pnpnd\ND\Models\UserAccess__premium_only::get_instance();

			$update = $user_access->update_record( $id, $type, $value, $folders, $pages, $permissions, $title, $status );

			if ( is_wp_error( $update ) ) {
				return $this->error_response( 'Update failed!', self::HTTP_INTERNAL_SERVER_ERROR );
			}

			return $this->success_response(
				array(
					'id'          => $id,
					'type'        => $type,
					'value'       => $value,
					'title'       => $title,
					'status'      => $status,
					'folders'     => $folders,
					'pages'       => $pages,
					'permissions' => $permissions,
				),
				'User access updated successfully!'
			);

		} catch ( Exception $e ) {
			return $this->handle_exception( $e, 'Failed to update user access' );
		} catch ( \Error $e ) {
			return $this->error_response( 'System error: ' . $e->getMessage(), self::HTTP_INTERNAL_SERVER_ERROR );
		}
	}

	private function get_access_params__premium_only(): array {
		return array(
			'id' => array(
				'required'          => true,
				'type'              => 'integer',
				'description'       => 'User access ID',
				'sanitize_callback' => 'absint',
				'minimum'           => 1,
			),
		);
	}

	/**
	 * Get parameters for create endpoint
	 */
	private function get_create_params__premium_only(): array {
		$allowed_permissions = array(
			'files.view',
			'files.upload',
			'files.download',
			'files.preview',
			'files.rename',
			'files.delete',
			'files.copy',
			'files.move',
			'files.share',
			'folders.view',
			'folders.create',
			'accounts.connect',
			'accounts.manage',
			'settings.view',
			'settings.manage',
			'widgets.manage',
			'users.view',
			'users.manage',
		);

		$allowed_pages = array(
			'file_manager',
			'widget_builder',
			'settings',
			'user_access',
			'media_library',
		);

		return array(
			'title'       => array(
				'required'    => false,
				'type'        => 'string',
				'description' => 'Access rule title',
				'default'     => 'Access Rule',
			),
			'type'        => array(
				'required'    => true,
				'type'        => 'string',
				'description' => 'Access type (user or role)',
				'enum'        => array( 'user', 'role' ),
			),
			'value'       => array(
				'required'    => true,
				'type'        => 'string',
				'description' => 'User login or role name',
			),
			'status'      => array(
				'required'    => false,
				'type'        => 'string',
				'description' => 'Access rule status (active or inactive)',
				'default'     => 'active',
				'enum'        => array( 'active', 'inactive' ),
			),
			'folders'     => array(
				'required'    => true,
				'type'        => 'array',
				'description' => 'Array of folder keys',
				'items'       => array(
					'type' => 'string',
				),
			),
			'pages'       => array(
				'required'          => true,
				'type'              => 'array',
				'description'       => 'Array of page keys',
				'validate_callback' => function ( $value ) use ( $allowed_pages ) {
					if ( ! is_array( $value ) ) {
						return false;
					}

					foreach ( $value as $item ) {
						if ( ! is_string( $item ) ) {
							return false;
						}

						if ( ! in_array( $item, $allowed_pages, true ) ) {
							return false;
						}
					}

					return true;
				},
			),
			'permissions' => array(
				'type'              => 'array',
				'description'       => 'Micro-permissions for granular access control',
				'required'          => true,
				'validate_callback' => function ( $value ) use ( $allowed_permissions ) {
					if ( ! is_array( $value ) ) {
						return false;
					}

					foreach ( $value as $item ) {
						if ( ! in_array( $item, $allowed_permissions, true ) ) {
							return false;
						}
					}

					return true;
				},
			),
		);
	}

	private function get_update_params__premium_only(): array {
		return array_merge( $this->get_access_params__premium_only(), $this->get_create_params__premium_only() );
	}

	private function validate_permissions__premium_only( $permissions, $pages ) {

		$allowed_pages_by_permission = array(
			'files.view'       => array( 'file_manager', 'media_library', 'widget_builder', 'user_access' ), // /file/by-keys, /file/<file_key>
			'files.upload'     => array( 'file_manager', 'media_library', 'widget_builder', 'user_access', 'settings' ), // /file/upload
			'files.download'   => array( 'file_manager', 'media_library', 'widget_builder', 'user_access' ), // /file/download
			'files.preview'    => array( 'file_manager', 'media_library', 'widget_builder', 'user_access' ), // /file/open-in-drive
			'files.rename'     => array( 'file_manager', 'media_library', 'widget_builder', 'user_access' ), // /file/rename
			'files.delete'     => array( 'file_manager', 'media_library', 'widget_builder', 'user_access' ), // /file/delete
			'files.copy'       => array( 'file_manager', 'media_library', 'widget_builder', 'user_access' ), // /file/copy
			'files.move'       => array( 'file_manager', 'media_library', 'widget_builder', 'user_access' ), // /file/move
			'files.share'      => array( 'file_manager', 'media_library', 'widget_builder', 'user_access' ), // /file/share
			'folders.view'     => array( 'file_manager', 'media_library', 'widget_builder', 'settings', 'user_access' ), // /folder, /folder/tree
			'folders.create'   => array( 'file_manager', 'media_library', 'widget_builder', 'user_access', 'settings' ), // /folder/create
			'accounts.connect' => array( 'file_manager', 'media_library', 'settings', 'widget_builder', 'user_access' ), // /account/auth-url
			'accounts.manage'  => array( 'file_manager', 'media_library', 'settings', 'widget_builder', 'user_access' ), // /account/switch, /account = DELETE, GET, /account/sync, /account/all
			'settings.view'    => array( 'file_manager', 'media_library', 'widget_builder', 'settings' ), // /settings = GET
			'settings.manage'  => array( 'settings' ), // /settings = POST, /settings/reset, /settings/syncing
			'widgets.manage'   => array( 'widget_builder' ), // /widgets/*
			'users.view'       => array( 'user_access' ), // /user/access = GET, /user/access/<id> = GET
			'users.manage'     => array( 'user_access' ), // /user/access = POST, /user/access/<id> = PUT, /user/access = DELETE, /user/access/status
		);

		// file_manager = files.view, folders.view, settings.view
		// media_library = files.view, folders.view, settings.view
		// widget_builder = folders.view, widgets.manage, settings.view, files.view
		// settings = settings.view, settings.manage
		// user_access = users.view, users.manage, folders.view

		foreach ( $permissions as $permission ) {
			if ( isset( $allowed_pages_by_permission[ $permission ] ) ) {
				$allowed_pages = $allowed_pages_by_permission[ $permission ];

				if ( ! array_intersect( $pages, $allowed_pages ) ) {
					return new WP_Error( 'invalid_permission_page_combination', sprintf( 'Permission "%s" requires at least one of the following pages: %s', $permission, implode( ', ', $allowed_pages ) ) );
				}
			}
		}

		return true;
	}

	private function remaining_user_and_roles__premium_only() {
		$users = get_users( array( 'fields' => array( 'user_login' ) ) );
		$roles = wp_roles()->get_names();

		$user_logins = wp_list_pluck( $users, 'user_login' );
		$role_keys   = array_keys( $roles );

		$used_role_and_access = \Pnpnd\ND\Models\UserAccess__premium_only::get_instance()->get_used_users_and_roles();

		foreach ( $used_role_and_access as $type => $values ) {
			if ( 'users' === $type ) {
				$user_logins = array_diff( $user_logins, $values );

			} elseif ( 'roles' === $type ) {
				$role_keys = array_diff( $role_keys, $values );
			}
		}

		unset( $user_logins[ array_search( wp_get_current_user()->user_login, $user_logins, true ) ] );
		unset( $role_keys[ array_search( 'administrator', $role_keys, true ) ] );

		return array(
			'users' => array_values( $user_logins ),
			'roles' => array_values( $role_keys ),
		);
	}

	public function get_user_access_status__premium_only( WP_REST_Request $request ): WP_REST_Response {
		try {
			$username = $request->get_param( 'username' );

			$response = \Pnpnd\ND\Models\UserAccess__premium_only::get_instance()->get_user_access_status( $username );
			if ( is_wp_error( $response ) ) {
				return $this->error_response( $response->get_error_message(), self::HTTP_INTERNAL_SERVER_ERROR );
			}

			return $this->success_response( $response, 'User access status counts retrieved successfully!' );

		} catch ( Exception $e ) {
			return $this->handle_exception( $e, 'Failed to retrieve user access status counts' );
		} catch ( \Error $e ) {
			return $this->error_response( 'System error: ' . $e->getMessage(), self::HTTP_INTERNAL_SERVER_ERROR );
		}
	}
}
