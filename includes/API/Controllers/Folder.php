<?php

namespace Pnpnd\ND\API\Controllers;

use Exception;
use Pnpnd\ND\API\BaseController;
use Pnpnd\ND\API\Traits\HasWidgetPermission;
use Pnpnd\ND\App\App;
use Pnpnd\ND\Models\Widget;
use WP_Error;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class Folder extends BaseController {

	use HasWidgetPermission;

	public function __construct() {
		parent::__construct( 'pnpnd/v1', 'folder' );
	}

	public function managePermission( WP_REST_Request $request ) {
		if ( $this->hasPermission() ) {
			return true;
		}

		$route  = $request->get_route();
		$method = $request->get_method();
		$action = '';

		switch ( true ) {
			case strpos( $route, '/folder/tree' ) !== false && $method === 'GET':
				$action = 'tree';

				if ( $request->get_param( 'fileKey' ) === 'my-drive' ) {
					return \Pnpnd\ND\Utils\Helpers::hasWidgetPermission( $request->get_param( 'widgetId' ), 'tree' );
				}

				break;
			case strpos( $route, '/folder/create' ) !== false && $method === 'POST':
				$action = 'newFolder';
				break;
		}

		if ( empty( $action ) ) {
			return new WP_Error( 'forbidden', 'You do not have permission.', array( 'status' => 403 ) );
		}

		return $this->checkWidgetPermission( $request, $action );
	}

	public function register_routes(): void {

		register_rest_route(
			$this->namespace,
			"{$this->rest_base}/create",
			array(
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'create' ),
					'permission_callback' => array( $this, 'managePermission' ),
					'args'                => array(
						'name'     => array(
							'type'              => 'string',
							'required'          => true,
							'sanitize_callback' => 'sanitize_text_field',
						),
						'fileKey'  => array(
							'type'              => 'string',
							'required'          => true,
							'sanitize_callback' => 'sanitize_text_field',
						),
						'widgetId' => array(
							'type'              => 'integer',
							'required'          => false,
							'default'           => null,
							'sanitize_callback' => 'absint',
						),
					),
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
					'permission_callback' => array( $this, 'managePermission' ),
					'args'                => array(
						'fileKey'  => array(
							'type'              => 'string',
							'required'          => false,
							'default'           => 'my-drive',
							'sanitize_callback' => 'sanitize_text_field',
						),
						'widgetId' => array(
							'type'              => 'integer',
							'required'          => false,
							'default'           => null,
							'sanitize_callback' => 'absint',
						),
						'orderBy'  => array(
							'type'              => 'string',
							'required'          => false,
							'default'           => 'name',
							'sanitize_callback' => 'sanitize_text_field',
						),
						'order'    => array(
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
			"{$this->rest_base}/(?P<fileKey>[^/]+)",
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get' ),
					'permission_callback' => array( $this, 'managePermission' ),
					'args'                => array(
						'fileKey' => array(
							'type'              => 'string',
							'required'          => true,
							'sanitize_callback' => 'sanitize_text_field',
						),
						'from'    => array(
							'type'              => 'string',
							'required'          => false,
							'default'           => 'cache',
							'sanitize_callback' => 'sanitize_text_field',
						),
						'perPage' => array(
							'type'              => 'integer',
							'required'          => false,
							'default'           => 20,
							'sanitize_callback' => 'absint',
						),
						'page'    => array(
							'type'              => 'integer',
							'required'          => false,
							'default'           => 1,
							'sanitize_callback' => 'absint',
						),
						'orderBy' => array(
							'type'              => 'string',
							'required'          => false,
							'default'           => 'updatedAt',
							'sanitize_callback' => 'sanitize_text_field',
						),
						'order'   => array(
							'type'              => 'string',
							'required'          => false,
							'default'           => 'desc',
							'sanitize_callback' => 'sanitize_text_field',
						),
						'types'   => array(
							'type'              => 'string',
							'required'          => false,
							'default'           => 'all',
							'sanitize_callback' => 'sanitize_text_field',
						),
						'search'  => array(
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
			$key     = $request->get_param( 'fileKey' );
			$from    = $request->get_param( 'from' );
			$perPage = $request->get_param( 'perPage' );
			$page    = $request->get_param( 'page' );
			$orderBy = $request->get_param( 'orderBy' );
			$order   = $request->get_param( 'order' );
			$types   = $request->get_param( 'types' );
			$search  = $request->get_param( 'search' );
			// $searchScope   = $request->get_param('searchScope');

			$types = $types === 'all' ? array() : array_filter( array_map( 'trim', explode( ',', $types ) ) );

			$args = array(
				'from'    => $from,
				'perPage' => $perPage,
				'page'    => $page,
				'orderBy' => $orderBy,
				'order'   => $order,
				'types'   => $types,
				'search'  => $search,
			);

			$folder = App::getInstance()->getFolderByKey( $key, $args );

			if ( empty( $folder ) ) {
				return $this->errorResponse( 'Folder not found', self::HTTP_NOT_FOUND );
			}

			if ( is_wp_error( $folder ) ) {
				$message = $folder->get_error_message();

				return $this->errorResponse( $message, self::HTTP_INTERNAL_SERVER_ERROR );
			}

			$folder['breadcrumbs'] = array_reverse( App::getInstance()->getBreadcrumbByKey( $key ) );

			return $this->successResponse( $folder, 'Folder retrieved successfully' );

		} catch ( Exception $e ) {
			return $this->handleException( $e, 'Failed to retrieve folder' );
		}
	}

	public function tree( WP_REST_Request $request ): WP_REST_Response {
		try {
			$folderKey = $request->get_param( 'fileKey' );
			$widgetId  = $request->get_param( 'widgetId' );
			$orderBy   = $request->get_param( 'orderBy' ) ?? 'name';
			$order     = $request->get_param( 'order' ) ?? 'ASC';

			$args = array(
				'widgetId' => $widgetId,
				'orderBy'  => $orderBy,
				'order'    => $order,
			);

			$folderTree = App::getInstance()->getFolderTree( $folderKey, $args );

			if ( is_wp_error( $folderTree ) ) {
				$message = $folderTree->get_error_message();
				$json    = json_decode( $message, true );

				if ( JSON_ERROR_NONE === json_last_error() ) {
					if ( isset( $json['error_summary'] ) ) {
						$message = $json['error_summary'];
					}
				}

				return $this->successResponse( array(), 'Folder tree not found', array( 'error' => $message ) );
			}

			return $this->successResponse( $folderTree, 'Folder tree retrieved successfully' );

		} catch ( Exception $e ) {
			return $this->handleException( $e, 'Failed to retrieve folder tree' );
		}
	}

	public function get_item_schema(): array {
		$schema               = parent::get_item_schema();
		$schema['title']      = 'folder';
		$schema['properties'] = array(
			'id'          => array(
				'description' => __( 'Google Drive folder ID.', 'ninja-drive' ),
				'type'        => 'string',
				'context'     => array( 'view', 'edit' ),
				'readonly'    => true,
			),
			'fileKey'     => array(
				'description' => __( 'Unique key for the folder.', 'ninja-drive' ),
				'type'        => 'string',
				'context'     => array( 'view', 'edit' ),
				'readonly'    => true,
			),
			'name'        => array(
				'description' => __( 'Folder name.', 'ninja-drive' ),
				'type'        => 'string',
				'context'     => array( 'view', 'edit' ),
			),
			'parentId'    => array(
				'description' => __( 'Parent folder ID.', 'ninja-drive' ),
				'type'        => 'string',
				'context'     => array( 'view', 'edit' ),
			),
			'accountId'   => array(
				'description' => __( 'Owning account ID.', 'ninja-drive' ),
				'type'        => 'string',
				'context'     => array( 'view', 'edit' ),
				'readonly'    => true,
			),
			'breadcrumbs' => array(
				'description' => __( 'Breadcrumb trail for the folder.', 'ninja-drive' ),
				'type'        => 'array',
				'context'     => array( 'view', 'edit' ),
				'items'       => array(
					'type'       => 'object',
					'properties' => array(
						'fileKey' => array( 'type' => 'string' ),
						'name'    => array( 'type' => 'string' ),
					),
				),
			),
			'files'       => array(
				'description' => __( 'Files and folders contained within.', 'ninja-drive' ),
				'type'        => 'array',
				'context'     => array( 'view', 'edit' ),
				'items'       => array(
					'type' => 'object',
				),
			),
			'hasMore'     => array(
				'description' => __( 'Whether there are more items to load.', 'ninja-drive' ),
				'type'        => 'boolean',
				'context'     => array( 'view', 'edit' ),
			),
			'total'       => array(
				'description' => __( 'Total number of items.', 'ninja-drive' ),
				'type'        => 'integer',
				'context'     => array( 'view', 'edit' ),
			),
			'totalPages'  => array(
				'description' => __( 'Total number of pages.', 'ninja-drive' ),
				'type'        => 'integer',
				'context'     => array( 'view', 'edit' ),
			),
			'currentPage' => array(
				'description' => __( 'Current page number.', 'ninja-drive' ),
				'type'        => 'integer',
				'context'     => array( 'view', 'edit' ),
			),
			'perPage'     => array(
				'description' => __( 'Items per page.', 'ninja-drive' ),
				'type'        => 'integer',
				'context'     => array( 'view', 'edit' ),
			),
			'size'        => array(
				'description' => __( 'Folder size in bytes.', 'ninja-drive' ),
				'type'        => 'integer',
				'context'     => array( 'view', 'edit' ),
			),
			'mimeType'    => array(
				'description' => __( 'MIME type.', 'ninja-drive' ),
				'type'        => 'string',
				'context'     => array( 'view', 'edit' ),
			),
			'isDir'       => array(
				'description' => __( 'Whether this is a directory.', 'ninja-drive' ),
				'type'        => 'integer',
				'enum'        => array( 0, 1 ),
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

	public function create( WP_REST_Request $request ): WP_REST_Response {
		try {
			$name     = $request->get_param( 'name' );
			$parent   = $request->get_param( 'fileKey' );
			$widgetId = $request->get_param( 'widgetId' ) ?? null;

			if ( empty( $name ) || empty( $parent ) ) {
				return $this->errorResponse( __( 'Folder name and parent file key are required', 'ninja-drive' ), self::HTTP_BAD_REQUEST );
			}

			$widget       = null;
			$isRootUpload = false;

			if ( $widgetId ) {
				$widget = Widget::getInstance()->getWidget( $widgetId );

				if ( is_wp_error( $widget ) ) {
					return $this->errorResponse( $widget->get_error_message(), 500 );
				}
			}

			if ( $parent === 'my-drive' || $parent === '/' || $parent === '' ) {

				if ( $widgetId ) {
					if ( is_wp_error( $widget ) ) {
						return $this->errorResponse( $widget->get_error_message(), 500 );
					}

					$widgetType = $widget['type'] ?? '';

					if ( $widgetType === 'file-browser' ) {
						$isRootUpload = $widget['data']['advanced']['fileBrowser']['headerOptions']['rootUpload'] ?? false;
						if ( ! $isRootUpload ) {
							return $this->errorResponse( 'Root upload is not enabled for this file browser widget.', 400 );
						}

						$parent = 'my-drive';
					} else {
						return $this->errorResponse( 'Invalid widget type for root folder creation.', 400 );
					}
				}
			}

			$folder = App::getInstance()->newFolder( $name, $parent );

			if ( empty( $folder['fileKey'] ) ) {
				return $this->errorResponse( 'Failed to create folder. No file key returned.', self::HTTP_INTERNAL_SERVER_ERROR );
			}

			if ( is_wp_error( $folder ) ) {
				return $this->errorResponse( $folder->get_error_message(), self::HTTP_INTERNAL_SERVER_ERROR );
			}

			if ( $parent === 'my-drive' && ! empty( $widget ) ) {
				$widgetType = $widget['type'] ?? '';

				if ( empty( $widgetType ) ) {
					return $this->errorResponse( 'Widget type is missing', 500 );
				}

				if ( $widgetType === 'file-browser' && $isRootUpload ) {
					$folderKey = $folder['fileKey'];
					$result    = Widget::getInstance()->insertFile( $widgetId, $folderKey );
					if ( is_wp_error( $result ) ) {
						return $this->errorResponse( $result->get_error_message(), self::HTTP_INTERNAL_SERVER_ERROR );
					}
				}
			}

			return $this->successResponse( $folder, 'Folder created successfully' );

		} catch ( Exception $e ) {
			return $this->handleException( $e, 'Failed to create folder' );
		}
	}
}
