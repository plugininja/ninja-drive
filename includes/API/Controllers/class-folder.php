<?php

namespace Pnpnd\ND\API\Controllers;

use Exception;
use Pnpnd\ND\API\Base_Controller;
use Pnpnd\ND\API\Traits\Has_Widget_Permission;
use Pnpnd\ND\App\App;
use Pnpnd\ND\Models\Widget;
use WP_Error;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class Folder extends Base_Controller {

	use Has_Widget_Permission;

	public function __construct() {
		parent::__construct( 'pnpnd/v1', 'folder' );
	}

	public function manage_permission( WP_REST_Request $request ) {
		if ( $this->has_permission() ) {
			return true;
		}

		return new WP_Error( 'forbidden', 'You do not have permission.', array( 'status' => 403 ) );
	}

	public function register_routes(): void {

		$create_folder_args = array(
			'name'     => array(
				'type'              => 'string',
				'required'          => true,
				'sanitize_callback' => 'sanitize_text_field',
			),
			'file_key' => array(
				'type'              => 'string',
				'required'          => true,
				'sanitize_callback' => 'sanitize_text_field',
			),
		);

		register_rest_route(
			$this->namespace,
			"{$this->rest_base}/create",
			array(
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'create' ),
					'permission_callback' => array( $this, 'manage_permission' ),
					'args'                => $create_folder_args,
				),
			)
		);

		register_rest_route(
			$this->namespace,
			"{$this->rest_base}/tree",
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'tree' ),
					'permission_callback' => array( $this, 'manage_permission' ),
					'args'                => array(
						'file_key'  => array(
							'type'              => 'string',
							'required'          => false,
							'default'           => 'my-drive',
							'sanitize_callback' => 'sanitize_text_field',
						),
						'widget_id' => array(
							'type'              => 'integer',
							'required'          => false,
							'default'           => null,
							'sanitize_callback' => 'absint',
						),
						'order_by'  => array(
							'type'              => 'string',
							'required'          => false,
							'default'           => 'name',
							'sanitize_callback' => 'sanitize_text_field',
						),
						'order'     => array(
							'type'              => 'string',
							'required'          => false,
							'default'           => 'ASC',
							'sanitize_callback' => 'sanitize_text_field',
						),
					),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			"{$this->rest_base}/(?P<file_key>[^/]+)",
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get' ),
					'permission_callback' => array( $this, 'manage_permission' ),
					'args'                => array(
						'file_key' => array(
							'type'              => 'string',
							'required'          => true,
							'sanitize_callback' => 'sanitize_text_field',
						),
						'from'     => array(
							'type'              => 'string',
							'required'          => false,
							'default'           => 'cache',
							'sanitize_callback' => 'sanitize_text_field',
						),
						'per_page' => array(
							'type'              => 'integer',
							'required'          => false,
							'default'           => 20,
							'sanitize_callback' => 'absint',
						),
						'page'     => array(
							'type'              => 'integer',
							'required'          => false,
							'default'           => 1,
							'sanitize_callback' => 'absint',
						),
						'order_by' => array(
							'type'              => 'string',
							'required'          => false,
							'default'           => 'updated_at',
							'sanitize_callback' => 'sanitize_text_field',
						),
						'order'    => array(
							'type'              => 'string',
							'required'          => false,
							'default'           => 'desc',
							'sanitize_callback' => 'sanitize_text_field',
						),
						'types'    => array(
							'type'              => 'string',
							'required'          => false,
							'default'           => 'all',
							'sanitize_callback' => 'sanitize_text_field',
						),
						'search'   => array(
							'type'              => 'string',
							'required'          => false,
							'default'           => null,
							'sanitize_callback' => 'sanitize_text_field',
						),
					),
				),
			)
		);
	}

	public function get( WP_REST_Request $request ): WP_REST_Response {
		try {
			$key      = $request->get_param( 'file_key' );
			$from     = $request->get_param( 'from' );
			$per_page = $request->get_param( 'per_page' );
			$page     = $request->get_param( 'page' );
			$order_by = $request->get_param( 'order_by' );
			$order    = $request->get_param( 'order' );
			$types    = $request->get_param( 'types' );
			$search   = $request->get_param( 'search' );

			$types = 'all' === $types ? array() : array_filter( array_map( 'trim', explode( ',', $types ) ) );

			$args = array(
				'from'     => $from,
				'per_page' => $per_page,
				'page'     => $page,
				'order_by' => $order_by,
				'order'    => $order,
				'types'    => $types,
				'search'   => $search,
			);

			$folder = App::get_instance()->get_folder_by_key( $key, $args );

			if ( empty( $folder ) ) {
				return $this->error_response( 'Folder not found', self::HTTP_NOT_FOUND );
			}

			if ( is_wp_error( $folder ) ) {
				$message = $folder->get_error_message();

				return $this->error_response( $message, self::HTTP_INTERNAL_SERVER_ERROR );
			}

			$folder['breadcrumbs'] = array_reverse( App::get_instance()->get_breadcrumb_by_key( $key ) );

			return $this->success_response( $folder, 'Folder retrieved successfully' );

		} catch ( Exception $e ) {
			return $this->handle_exception( $e, 'Failed to retrieve folder' );
		}
	}

	public function tree( WP_REST_Request $request ): WP_REST_Response {
		try {
			$folder_key = $request->get_param( 'file_key' );
			$widget_id  = $request->get_param( 'widget_id' );
			$order_by   = $request->get_param( 'order_by' ) ?? 'name';
			$order      = $request->get_param( 'order' ) ?? 'ASC';

			$args = array(
				'widget_id' => $widget_id,
				'order_by'  => $order_by,
				'order'     => $order,
			);

			$folder_tree = App::get_instance()->get_folder_tree( $folder_key, $args );

			if ( is_wp_error( $folder_tree ) ) {
				$message = $folder_tree->get_error_message();
				$json    = json_decode( $message, true );

				if ( JSON_ERROR_NONE === json_last_error() ) {
					if ( isset( $json['error_summary'] ) ) {
						$message = $json['error_summary'];
					}
				}

				return $this->success_response( array(), 'Folder tree not found', array( 'error' => $message ) );
			}

			return $this->success_response( $folder_tree, 'Folder tree retrieved successfully' );

		} catch ( Exception $e ) {
			return $this->handle_exception( $e, 'Failed to retrieve folder tree' );
		}
	}

	public function get_item_schema(): array {
		$schema               = parent::get_item_schema();
		$schema['title']      = 'folder';
		$schema['properties'] = array(
			'id'           => array(
				'description' => __( 'Google Drive folder ID.', 'ninja-drive' ),
				'type'        => 'string',
				'context'     => array( 'view', 'edit' ),
				'readonly'    => true,
			),
			'file_key'     => array(
				'description' => __( 'Unique key for the folder.', 'ninja-drive' ),
				'type'        => 'string',
				'context'     => array( 'view', 'edit' ),
				'readonly'    => true,
			),
			'name'         => array(
				'description' => __( 'Folder name.', 'ninja-drive' ),
				'type'        => 'string',
				'context'     => array( 'view', 'edit' ),
			),
			'parent_id'    => array(
				'description' => __( 'Parent folder ID.', 'ninja-drive' ),
				'type'        => 'string',
				'context'     => array( 'view', 'edit' ),
			),
			'account_id'   => array(
				'description' => __( 'Owning account ID.', 'ninja-drive' ),
				'type'        => 'string',
				'context'     => array( 'view', 'edit' ),
				'readonly'    => true,
			),
			'breadcrumbs'  => array(
				'description' => __( 'Breadcrumb trail for the folder.', 'ninja-drive' ),
				'type'        => 'array',
				'context'     => array( 'view', 'edit' ),
				'items'       => array(
					'type'       => 'object',
					'properties' => array(
						'file_key' => array( 'type' => 'string' ),
						'name'     => array( 'type' => 'string' ),
					),
				),
			),
			'files'        => array(
				'description' => __( 'Files and folders contained within.', 'ninja-drive' ),
				'type'        => 'array',
				'context'     => array( 'view', 'edit' ),
				'items'       => array(
					'type' => 'object',
				),
			),
			'has_more'     => array(
				'description' => __( 'Whether there are more items to load.', 'ninja-drive' ),
				'type'        => 'boolean',
				'context'     => array( 'view', 'edit' ),
			),
			'total'        => array(
				'description' => __( 'Total number of items.', 'ninja-drive' ),
				'type'        => 'integer',
				'context'     => array( 'view', 'edit' ),
			),
			'total_pages'  => array(
				'description' => __( 'Total number of pages.', 'ninja-drive' ),
				'type'        => 'integer',
				'context'     => array( 'view', 'edit' ),
			),
			'current_page' => array(
				'description' => __( 'Current page number.', 'ninja-drive' ),
				'type'        => 'integer',
				'context'     => array( 'view', 'edit' ),
			),
			'per_page'     => array(
				'description' => __( 'Items per page.', 'ninja-drive' ),
				'type'        => 'integer',
				'context'     => array( 'view', 'edit' ),
			),
			'size'         => array(
				'description' => __( 'Folder size in bytes.', 'ninja-drive' ),
				'type'        => 'integer',
				'context'     => array( 'view', 'edit' ),
			),
			'mime_type'    => array(
				'description' => __( 'MIME type.', 'ninja-drive' ),
				'type'        => 'string',
				'context'     => array( 'view', 'edit' ),
			),
			'is_dir'       => array(
				'description' => __( 'Whether this is a directory.', 'ninja-drive' ),
				'type'        => 'integer',
				'enum'        => array( 0, 1 ),
				'context'     => array( 'view', 'edit' ),
			),
			'created_at'   => array(
				'description' => __( 'Creation date.', 'ninja-drive' ),
				'type'        => 'string',
				'format'      => 'date-time',
				'context'     => array( 'view', 'edit' ),
				'readonly'    => true,
			),
			'updated_at'   => array(
				'description' => __( 'Last update date.', 'ninja-drive' ),
				'type'        => 'string',
				'format'      => 'date-time',
				'context'     => array( 'view', 'edit' ),
				'readonly'    => true,
			),
		);

		return $schema;
	}

	public function create( WP_REST_Request $request ): WP_REST_Response {
		try {
			$name   = $request->get_param( 'name' );
			$parent = $request->get_param( 'file_key' );

			if ( empty( $name ) || empty( $parent ) ) {
				return $this->error_response( __( 'Folder name and parent file key are required', 'ninja-drive' ), self::HTTP_BAD_REQUEST );
			}

			$folder = App::get_instance()->new_folder( $name, $parent );

			if ( empty( $folder['file_key'] ) ) {
				return $this->error_response( 'Failed to create folder. No file key returned.', self::HTTP_INTERNAL_SERVER_ERROR );
			}

			if ( is_wp_error( $folder ) ) {
				return $this->error_response( $folder->get_error_message(), self::HTTP_INTERNAL_SERVER_ERROR );
			}

			return $this->success_response( $folder, 'Folder created successfully' );

		} catch ( Exception $e ) {
			return $this->handle_exception( $e, 'Failed to create folder' );
		}
	}
}
