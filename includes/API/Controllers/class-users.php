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

	/**
	 * Get parameters for create endpoint
	 */

}
