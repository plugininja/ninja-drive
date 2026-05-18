<?php

namespace Pnpnd\ND\API\Controllers;

use Pnpnd\ND\API\BaseController;
use Pnpnd\ND\Models\Notices as NoticeModel;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class Notice extends BaseController {

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
					'callback'            => array( $this, 'getAll' ),
					'permission_callback' => array( $this, 'managePermission' ),
					'args'                => $this->get_collection_params(),
				),
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'add' ),
					'permission_callback' => array( $this, 'managePermission' ),
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
					'permission_callback' => array( $this, 'managePermission' ),
				),
				array(
					'methods'             => WP_REST_Server::DELETABLE,
					'callback'            => array( $this, 'delete' ),
					'permission_callback' => array( $this, 'managePermission' ),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			$this->rest_base . '/clear',
			array(
				'methods'             => WP_REST_Server::DELETABLE,
				'callback'            => array( $this, 'clear' ),
				'permission_callback' => array( $this, 'managePermission' ),
			)
		);

		register_rest_route(
			$this->namespace,
			$this->rest_base . '/status/(?P<id>\d+)/',
			array(
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'changeStatus' ),
				'permission_callback' => array( $this, 'managePermission' ),
				'args'                => $this->get_status_params(),
			)
		);

		register_rest_route(
			$this->namespace,
			$this->rest_base . '/mark-all-read',
			array(
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'markAllAsRead' ),
				'permission_callback' => array( $this, 'managePermission' ),
			)
		);
	}

	public function managePermission(): bool {
		return current_user_can( 'manage_options' );
	}

	public function getAll( WP_REST_Request $request ): WP_REST_Response {

		try {

			$page    = (int) $request->get_param( 'page' ) ?: 1;
			$perPage = (int) $request->get_param( 'perPage' ) ?: 10;
			$status  = $request->get_param( 'status' ) ?: '';

			$args = array(
				'page'    => $page,
				'perPage' => $perPage,
			);

			if ( ! empty( $status ) ) {
				$args['status'] = $status;
			}

			$notices = NoticeModel::getInstance()->getAll( $args );

			if ( is_wp_error( $notices ) ) {
				return $this->errorResponse( $notices->get_error_message(), self::HTTP_INTERNAL_SERVER_ERROR );
			}

			if ( empty( $notices ) ) {

				return $this->successResponse( array(), 'No notices found.' );
			}

			return $this->successResponse( $notices, 'Notices fetched successfully.' );

		} catch ( \Throwable $e ) {
			return $this->handleException( $e, 'Failed to retrieve notices' );
		}
	}

	public function get( WP_REST_Request $request ): WP_REST_Response {
		try {
			$id = (int) $request->get_param( 'id' );

			if ( ! $id ) {
				return $this->errorResponse( 'Notice ID is required.', self::HTTP_BAD_REQUEST );
			}

			$notice = NoticeModel::getInstance()->get( $id );

			if ( empty( $notice ) ) {
				return $this->errorResponse( 'Notice not found.', self::HTTP_NOT_FOUND );
			}

			return $this->successResponse(
				(array) $notice,
				'Notice fetched successfully.'
			);

		} catch ( \Throwable $e ) {
			return $this->handleException( $e, 'Failed to retrieve notice' );
		}
	}

	public function add( WP_REST_Request $request ): WP_REST_Response {
		try {
			$title       = $request->get_param( 'title' );
			$type        = $request->get_param( 'type' );
			$description = $request->get_param( 'description' ) ?: '';
			$status      = $request->get_param( 'status' ) ?: 'unread';

			if ( empty( $title ) || empty( $type ) ) {
				return $this->errorResponse( 'Notice title and type are required.', self::HTTP_BAD_REQUEST );
			}

			$notice_data = array(
				'title'       => $title,
				'type'        => $type,
				'description' => $description,
				'status'      => $status,
			);

			$notices = NoticeModel::getInstance()->add( $notice_data );

			if ( is_wp_error( $notices ) ) {
				return $this->errorResponse( $notices->get_error_message(), self::HTTP_INTERNAL_SERVER_ERROR );
			}

			if ( empty( $notices ) ) {
				return $this->successResponse( array(), 'Failed to add notice.' );
			}

			return $this->successResponse(
				array( 'notices' => $notices ),
				'Notice added successfully.'
			);

		} catch ( \Throwable $e ) {
			return $this->handleException( $e, 'Failed to add notice' );
		}
	}

	public function delete( WP_REST_Request $request ): WP_REST_Response {
		try {
			$id = (int) $request->get_param( 'id' );

			if ( ! $id ) {
				return $this->errorResponse( 'Notice ID is required.', self::HTTP_BAD_REQUEST );
			}

			$result = NoticeModel::getInstance()->deleteNotice( $id );

			if ( is_wp_error( $result ) ) {
				return $this->errorResponse( $result->get_error_message(), self::HTTP_INTERNAL_SERVER_ERROR );
			}

			if ( empty( $result ) ) {
				return $this->successResponse( array(), 'Notice not found or already deleted.' );
			}

			return $this->successResponse( $result, 'Notice deleted successfully.' );

		} catch ( \Throwable $e ) {
			return $this->handleException( $e, 'Failed to delete notice' );
		}
	}

	public function clear( WP_REST_Request $request ): WP_REST_Response {
		try {
			$result = NoticeModel::getInstance()->deleteAll();

			if ( is_wp_error( $result ) ) {
				return $this->errorResponse( $result->get_error_message(), self::HTTP_INTERNAL_SERVER_ERROR );
			}

			if ( empty( $result ) ) {
				return $this->successResponse( array(), 'No notices found to clear.' );
			}

			return $this->successResponse( $result, 'All notices cleared successfully.' );

		} catch ( \Throwable $e ) {
			return $this->handleException( $e, 'Failed to clear notices' );
		}
	}

	public function changeStatus( WP_REST_Request $request ): WP_REST_Response {
		try {
			$id = (int) $request->get_param( 'id' );

			if ( ! $id ) {
				return $this->errorResponse( 'Notice ID is required.', self::HTTP_BAD_REQUEST );
			}

			$result = NoticeModel::getInstance()->changeStatus( $id );

			if ( is_wp_error( $result ) ) {
				return $this->errorResponse( $result->get_error_message(), self::HTTP_INTERNAL_SERVER_ERROR );
			}

			if ( empty( $result ) ) {
				return $this->successResponse( array(), 'Notice not found.' );
			}

			return $this->successResponse( $result, 'Notice status changed successfully.' );

		} catch ( \Throwable $e ) {
			return $this->handleException( $e, 'Failed to change notice status' );
		}
	}

	public function markAllAsRead( WP_REST_Request $request ): WP_REST_Response {
		try {
			$result = NoticeModel::getInstance()->markAllAsRead();

			if ( is_wp_error( $result ) ) {
				return $this->errorResponse( $result->get_error_message(), self::HTTP_INTERNAL_SERVER_ERROR );
			}

			if ( empty( $result ) ) {
				return $this->successResponse( array(), 'No notices found to mark as read.' );
			}

			return $this->successResponse( $result, 'All notices marked as read successfully.' );

		} catch ( \Throwable $e ) {
			return $this->handleException( $e, 'Failed to mark all notices as read' );
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
			'widgetId'    => array(
				'description' => __( 'Related widget ID.', 'ninja-drive' ),
				'type'        => 'integer',
				'context'     => array( 'view', 'edit' ),
			),
			'userId'      => array(
				'description' => __( 'ID of the user who triggered the notice.', 'ninja-drive' ),
				'type'        => 'integer',
				'context'     => array( 'view', 'edit' ),
			),
			'fileKey'     => array(
				'description' => __( 'Related file key.', 'ninja-drive' ),
				'type'        => 'string',
				'context'     => array( 'view', 'edit' ),
			),
			'fileName'    => array(
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
			'createdAt'   => array(
				'description' => __( 'Creation date.', 'ninja-drive' ),
				'type'        => 'string',
				'format'      => 'date-time',
				'context'     => array( 'view', 'edit' ),
				'readonly'    => true,
			),
			'updatedAt'   => array(
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
			'page'    => array(
				'type'        => 'integer',
				'description' => 'Page number for pagination',
				'default'     => 1,
				'minimum'     => 1,
			),
			'perPage' => array(
				'type'        => 'integer',
				'description' => 'Number of notices per page',
				'default'     => 10,
				'minimum'     => 1,
				'maximum'     => 100,
			),
			'status'  => array(
				'type'              => 'string',
				'description'       => 'Filter notices by status',
				'enum'              => array( 'read', 'unread' ),
				'sanitize_callback' => 'sanitize_text_field',
			),
		);
	}

	private function get_create_params(): array {
		return array(
			'title'       => array(
				'required'          => true,
				'type'              => 'string',
				'description'       => 'Notice title',
				'sanitize_callback' => 'sanitize_text_field',
			),
			'type'        => array(
				'required'          => true,
				'type'              => 'string',
				'description'       => 'Notice type',
				'sanitize_callback' => 'sanitize_text_field',
			),
			'description' => array(
				'type'              => 'string',
				'description'       => 'Notice description',
				'default'           => '',
				'sanitize_callback' => 'sanitize_text_field',
			),
			'status'      => array(
				'type'              => 'string',
				'description'       => 'Notice status',
				'enum'              => array( 'read', 'unread' ),
				'default'           => 'unread',
				'sanitize_callback' => 'sanitize_text_field',
			),
		);
	}

	private function get_status_params(): array {
		return array(
			'id' => array(
				'required'    => true,
				'type'        => 'integer',
				'description' => 'Notice ID',
				'minimum'     => 1,
			),
		);
	}
}
