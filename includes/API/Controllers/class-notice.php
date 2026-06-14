<?php

namespace Pnpnd\ND\API\Controllers;

use Pnpnd\ND\API\Base_Controller;
use Pnpnd\ND\Models\Notices as NoticeModel;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class Notice extends Base_Controller {

	public function __construct() {
		parent::__construct( 'pnpnd/v1', 'notice' );
	}

	public function register_routes(): void {
		register_rest_route(
			$this->namespace,
			$this->rest_base,
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_all' ),
					'permission_callback' => array( $this, 'manage_permission' ),
					'args'                => $this->get_collection_params(),
				),
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'add' ),
					'permission_callback' => array( $this, 'manage_permission' ),
					'args'                => $this->get_create_params(),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			$this->rest_base . '/(?P<id>\d+)',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get' ),
					'permission_callback' => array( $this, 'manage_permission' ),
					'args'                => array(
						'id' => array(
							'required'          => true,
							'type'              => 'integer',
							'description'       => __( 'Notice ID', 'ninja-drive' ),
							'minimum'           => 1,
							'sanitize_callback' => 'absint',
						),
					),
				),
				array(
					'methods'             => WP_REST_Server::DELETABLE,
					'callback'            => array( $this, 'delete' ),
					'permission_callback' => array( $this, 'manage_permission' ),
					'args'                => array(
						'id' => array(
							'required'          => true,
							'type'              => 'integer',
							'description'       => __( 'Notice ID', 'ninja-drive' ),
							'minimum'           => 1,
							'sanitize_callback' => 'absint',
						),
					),
				),
			),
		);

		register_rest_route(
			$this->namespace,
			$this->rest_base . '/clear',
			array(
				'methods'             => WP_REST_Server::DELETABLE,
				'callback'            => array( $this, 'clear' ),
				'permission_callback' => array( $this, 'manage_permission' ),
			)
		);

		register_rest_route(
			$this->namespace,
			$this->rest_base . '/status/(?P<id>\d+)',
			array(
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'change_status' ),
				'permission_callback' => array( $this, 'manage_permission' ),
				'args'                => $this->get_status_params(),
			)
		);

		register_rest_route(
			$this->namespace,
			$this->rest_base . '/mark-all-read',
			array(
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'mark_all_as_read' ),
				'permission_callback' => array( $this, 'manage_permission' ),
			)
		);
	}

	public function manage_permission( WP_REST_Request $request ) {
		if ( $this->has_permission() ) {
			return true;
		}

		return new \WP_Error(
			'forbidden',
			__( 'You do not have permission to perform this action.', 'ninja-drive' ),
			array( 'status' => 403 )
		);
	}

	public function get_all( WP_REST_Request $request ): WP_REST_Response {

		try {

			$page     = $request->get_param( 'page' );
			$per_page = $request->get_param( 'per_page' );
			$status   = $request->get_param( 'status' );
			$type     = $request->get_param( 'type' );

			$args = array(
				'page'     => $page,
				'per_page' => $per_page,
			);

			if ( ! empty( $status ) ) {
				$args['status'] = $status;
			}

			if ( ! empty( $type ) ) {
				$args['type'] = $type;
			}

			$notices = NoticeModel::get_instance()->get_all( $args );

			if ( is_wp_error( $notices ) ) {
				return $this->error_response( $notices->get_error_message(), self::HTTP_INTERNAL_SERVER_ERROR );
			}

			if ( empty( $notices ) ) {

				return $this->success_response(
					array(
						'notices'     => array(),
						'total'       => 0,
						'page'        => $page,
						'per_page'    => $per_page,
						'total_pages' => 0,
						'has_more'    => false,
					),
					__( 'No notices found.', 'ninja-drive' )
				);
			}

			return $this->success_response( $notices, __( 'Notices fetched successfully.', 'ninja-drive' ) );

		} catch ( \Throwable $e ) {
			return $this->handle_exception( $e, __( 'Failed to retrieve notices', 'ninja-drive' ) );
		}
	}

	public function get( WP_REST_Request $request ): WP_REST_Response {
		try {
			$id = (int) $request->get_param( 'id' );

			if ( ! $id ) {
				return $this->error_response( __( 'Notice ID is required.', 'ninja-drive' ), self::HTTP_BAD_REQUEST );
			}

			$notice = NoticeModel::get_instance()->get_notice( $id );

			if ( empty( $notice ) ) {
				return $this->error_response( __( 'Notice not found.', 'ninja-drive' ), self::HTTP_NOT_FOUND );
			}

			return $this->success_response(
				array(
					'notice' => $notice,
				),
				__( 'Notice fetched successfully.', 'ninja-drive' )
			);

		} catch ( \Throwable $e ) {
			return $this->handle_exception( $e, __( 'Failed to retrieve notice', 'ninja-drive' ) );
		}
	}

	public function add( WP_REST_Request $request ): WP_REST_Response {
		try {
			$title       = $request->get_param( 'title' );
			$type        = $request->get_param( 'type' );
			$description = $request->get_param( 'description' );
			$status      = $request->get_param( 'status' );
			$file_key    = $request->get_param( 'file_key' );
			$file_name   = $request->get_param( 'file_name' );
			$page        = $request->get_param( 'page' );
			$data        = $request->get_param( 'data' );
			$widget_id   = $request->get_param( 'widget_id' );
			$user_id     = $request->get_param( 'user_id' );

			if ( empty( $title ) || empty( $type ) ) {
				return $this->error_response( __( 'Notice title and type are required.', 'ninja-drive' ), self::HTTP_BAD_REQUEST );
			}

			$notice_data = array(
				'title'       => $title,
				'type'        => $type,
				'description' => $description,
				'status'      => $status,
				'file_key'    => $file_key,
				'file_name'   => $file_name,
				'page'        => $page,
				'data'        => $data,
				'widget_id'   => $widget_id,
				'user_id'     => $user_id,
			);

			$notices = NoticeModel::get_instance()->add( $notice_data );

			if ( is_wp_error( $notices ) ) {
				return $this->error_response( $notices->get_error_message(), self::HTTP_INTERNAL_SERVER_ERROR );
			}

			return $this->success_response(
				array( 'notices' => $notices ),
				__( 'Notice added successfully.', 'ninja-drive' )
			);

		} catch ( \Throwable $e ) {
			return $this->handle_exception( $e, __( 'Failed to add notice', 'ninja-drive' ) );
		}
	}

	public function delete( WP_REST_Request $request ): WP_REST_Response {
		try {
			$id = (int) $request->get_param( 'id' );

			if ( ! $id ) {
				return $this->error_response( __( 'Notice ID is required.', 'ninja-drive' ), self::HTTP_BAD_REQUEST );
			}

			$result = NoticeModel::get_instance()->delete_notice( $id );

			if ( is_wp_error( $result ) ) {
				return $this->error_response( $result->get_error_message(), self::HTTP_INTERNAL_SERVER_ERROR );
			}

			if ( empty( $result ) ) {
				return $this->success_response( array(), __( 'Notice not found or already deleted.', 'ninja-drive' ) );
			}

			return $this->success_response( $result, __( 'Notice deleted successfully.', 'ninja-drive' ) );

		} catch ( \Throwable $e ) {
			return $this->handle_exception( $e, __( 'Failed to delete notice', 'ninja-drive' ) );
		}
	}

	public function clear( WP_REST_Request $request ): WP_REST_Response {
		try {
			$result = NoticeModel::get_instance()->delete_all();

			if ( is_wp_error( $result ) ) {
				return $this->error_response( $result->get_error_message(), self::HTTP_INTERNAL_SERVER_ERROR );
			}

			if ( empty( $result ) ) {
				return $this->success_response( array(), __( 'No notices found to clear.', 'ninja-drive' ) );
			}

			return $this->success_response( $result, __( 'All notices cleared successfully.', 'ninja-drive' ) );

		} catch ( \Throwable $e ) {
			return $this->handle_exception( $e, __( 'Failed to clear notices', 'ninja-drive' ) );
		}
	}

	public function change_status( WP_REST_Request $request ): WP_REST_Response {
		try {
			$id = (int) $request->get_param( 'id' );

			if ( ! $id ) {
				return $this->error_response( __( 'Notice ID is required.', 'ninja-drive' ), self::HTTP_BAD_REQUEST );
			}

			$status = $request->get_param( 'status' );

			$result = NoticeModel::get_instance()->change_status( $id, $status );

			if ( is_wp_error( $result ) ) {
				return $this->error_response( $result->get_error_message(), self::HTTP_INTERNAL_SERVER_ERROR );
			}

			if ( empty( $result ) ) {
				return $this->success_response( array(), __( 'Notice not found.', 'ninja-drive' ) );
			}

			return $this->success_response( $result, __( 'Notice status changed successfully.', 'ninja-drive' ) );

		} catch ( \Throwable $e ) {
			return $this->handle_exception( $e, __( 'Failed to change notice status', 'ninja-drive' ) );
		}
	}

	public function mark_all_as_read( WP_REST_Request $request ): WP_REST_Response {
		try {
			$result = NoticeModel::get_instance()->mark_all_as_read();

			if ( is_wp_error( $result ) ) {
				return $this->error_response( $result->get_error_message(), self::HTTP_INTERNAL_SERVER_ERROR );
			}

			if ( empty( $result ) ) {
				return $this->success_response( array(), __( 'No notices found to mark as read.', 'ninja-drive' ) );
			}

			return $this->success_response( $result, __( 'All notices marked as read successfully.', 'ninja-drive' ) );

		} catch ( \Throwable $e ) {
			return $this->handle_exception( $e, __( 'Failed to mark all notices as read', 'ninja-drive' ) );
		}
	}

	public function get_item_schema(): array {
		$schema               = parent::get_item_schema();
		$schema['title']      = 'notice';
		$schema['properties'] = array(
			'id'          => array(
				'description' => __( 'Unique identifier for the notice.', 'ninja-drive' ),
				'type'        => 'integer',
				'context'     => array( 'view', 'edit' ),
				'readonly'    => true,
			),
			'title'       => array(
				'description' => __( 'Notice title.', 'ninja-drive' ),
				'type'        => 'string',
				'context'     => array( 'view', 'edit' ),
			),
			'type'        => array(
				'description' => __( 'Notice type.', 'ninja-drive' ),
				'type'        => 'string',
				'enum'        => NoticeModel::get_types(),
				'context'     => array( 'view', 'edit' ),
			),
			'description' => array(
				'description' => __( 'Notice description.', 'ninja-drive' ),
				'type'        => 'string',
				'context'     => array( 'view', 'edit' ),
			),
			'status'      => array(
				'description' => __( 'Notice status.', 'ninja-drive' ),
				'type'        => 'string',
				'enum'        => array( 'read', 'unread' ),
				'context'     => array( 'view', 'edit' ),
			),
			'widget_id'   => array(
				'description' => __( 'Related widget ID.', 'ninja-drive' ),
				'type'        => 'integer',
				'context'     => array( 'view', 'edit' ),
			),
			'user_id'     => array(
				'description' => __( 'ID of the user who triggered the notice.', 'ninja-drive' ),
				'type'        => 'integer',
				'context'     => array( 'view', 'edit' ),
			),
			'file_key'    => array(
				'description' => __( 'Related file key.', 'ninja-drive' ),
				'type'        => 'string',
				'context'     => array( 'view', 'edit' ),
			),
			'file_name'   => array(
				'description' => __( 'Related file name.', 'ninja-drive' ),
				'type'        => 'string',
				'context'     => array( 'view', 'edit' ),
			),
			'page'        => array(
				'description' => __( 'Page where the event occurred.', 'ninja-drive' ),
				'type'        => 'string',
				'context'     => array( 'view', 'edit' ),
			),
			'data'        => array(
				'description' => __( 'Additional notice data.', 'ninja-drive' ),
				'type'        => 'object',
				'context'     => array( 'view', 'edit' ),
			),
			'created_at'  => array(
				'description' => __( 'Creation date.', 'ninja-drive' ),
				'type'        => 'string',
				'format'      => 'date-time',
				'context'     => array( 'view', 'edit' ),
				'readonly'    => true,
			),
			'updated_at'  => array(
				'description' => __( 'Last update date.', 'ninja-drive' ),
				'type'        => 'string',
				'format'      => 'date-time',
				'context'     => array( 'view', 'edit' ),
				'readonly'    => true,
			),
		);

		return $schema;
	}

	public function get_collection_params(): array {
		return array(
			'page'     => array(
				'type'              => 'integer',
				'description'       => __( 'Page number for pagination', 'ninja-drive' ),
				'default'           => 1,
				'minimum'           => 1,
				'sanitize_callback' => 'absint',
			),
			'per_page' => array(
				'type'              => 'integer',
				'description'       => __( 'Number of notices per page', 'ninja-drive' ),
				'default'           => 10,
				'minimum'           => 1,
				'maximum'           => 100,
				'sanitize_callback' => 'absint',
			),
			'status'   => array(
				'type'              => 'string',
				'description'       => __( 'Filter notices by status', 'ninja-drive' ),
				'enum'              => array( 'read', 'unread' ),
				'sanitize_callback' => 'sanitize_text_field',
			),
			'type'     => array(
				'type'              => 'string',
				'description'       => __( 'Filter notices by type', 'ninja-drive' ),
				'enum'              => NoticeModel::get_types(),
				'sanitize_callback' => 'sanitize_text_field',
			),
		);
	}

	private function get_create_params(): array {
		return array(
			'title'       => array(
				'required'          => true,
				'type'              => 'string',
				'description'       => __( 'Notice title', 'ninja-drive' ),
				'sanitize_callback' => 'sanitize_text_field',
			),
			'type'        => array(
				'required'          => true,
				'type'              => 'string',
				'description'       => __( 'Notice type', 'ninja-drive' ),
				'enum'              => NoticeModel::get_types(),
				'sanitize_callback' => 'sanitize_text_field',
			),
			'description' => array(
				'type'              => 'string',
				'description'       => __( 'Notice description', 'ninja-drive' ),
				'default'           => '',
				'sanitize_callback' => 'sanitize_text_field',
			),
			'status'      => array(
				'type'              => 'string',
				'description'       => __( 'Notice status', 'ninja-drive' ),
				'enum'              => array( 'read', 'unread' ),
				'default'           => 'unread',
				'sanitize_callback' => 'sanitize_text_field',
			),
			'file_key'    => array(
				'type'              => 'string',
				'description'       => __( 'Related file key', 'ninja-drive' ),
				'default'           => '',
				'sanitize_callback' => 'sanitize_text_field',
			),
			'file_name'   => array(
				'type'              => 'string',
				'description'       => __( 'Related file name', 'ninja-drive' ),
				'default'           => '',
				'sanitize_callback' => 'sanitize_text_field',
			),
			'page'        => array(
				'type'              => 'string',
				'description'       => __( 'Page where the event occurred', 'ninja-drive' ),
				'default'           => '',
				'sanitize_callback' => 'sanitize_text_field',
			),
			'data'        => array(
				'type'              => 'object',
				'description'       => __( 'Additional notice data', 'ninja-drive' ),
				'default'           => new \stdClass(),
				'sanitize_callback' => function ( $value ) {
					return is_array( $value ) ? $value : array();
				},
			),
			'widget_id'   => array(
				'type'              => 'integer',
				'description'       => __( 'Related widget ID', 'ninja-drive' ),
				'default'           => 0,
				'sanitize_callback' => 'absint',
			),
			'user_id'     => array(
				'type'              => 'integer',
				'description'       => __( 'ID of the user who triggered the notice', 'ninja-drive' ),
				'default'           => get_current_user_id(),
				'sanitize_callback' => 'absint',
			),
		);
	}

	private function get_status_params(): array {
		return array(
			'id'     => array(
				'required'          => true,
				'type'              => 'integer',
				'description'       => __( 'Notice ID', 'ninja-drive' ),
				'minimum'           => 1,
				'sanitize_callback' => 'absint',
			),
			'status' => array(
				'required'          => false,
				'type'              => 'string',
				'description'       => __( 'New status for the notice', 'ninja-drive' ),
				'enum'              => array( 'read', 'unread' ),
				'default'           => 'read',
				'sanitize_callback' => 'sanitize_text_field',
			),
		);
	}
}
