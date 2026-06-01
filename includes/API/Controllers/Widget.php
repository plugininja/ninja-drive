<?php

namespace Pnpnd\ND\API\Controllers;

use function in_array;
use function is_array;

use Pnpnd\ND\API\BaseController;
use Pnpnd\ND\API\Traits\HasWidgetPermission;
use Pnpnd\ND\Models\Widget as WidgetModel;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class Widget extends BaseController {

	use HasWidgetPermission;

	public function __construct() {
		parent::__construct( 'pnpnd/v1', 'widget' );
	}

	public function managePermission( WP_REST_Request $request ):bool {
		if ( $this->hasPermission() ) {
			return true;
		}

		$route  = $request->get_route();
		$method = $request->get_method();
		$action = '';

		if(strpos( $route, '/widget' ) !== false && $method === 'GET') {
            $action = 'getFolder';
        }

		if ( empty( $action ) ) {
			return false;
		}

		return $this->checkWidgetPermission( $request, $action );
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
                    'args'               => array(
                        'type' => array(
                            'required'          => false,
                            'type'              => 'string',
                            'description'       => 'Filter by widget type',
                            'sanitize_callback' => 'sanitize_text_field',
                        ),
                        'search' => array(
                            'required'          => false,
                            'type'              => 'string',
                            'description'       => 'Search term for widget title',
                            'sanitize_callback' => 'sanitize_text_field',
                        ),
                        'status' => array(
                            'required'          => false,
                            'type'              => 'string',
                            'description'       => 'Filter by widget status',
                            'enum'              => array( 'active', 'inactive', 'on', 'off' ),
                            'sanitize_callback' => 'sanitize_text_field',
                        ),
                        'order' => array(
                            'required'          => false,
                            'type'              => 'string',
                            'description'       => 'Order direction',
                            'enum'              => array( 'ASC', 'DESC' ),
                            'default'           => 'DESC',
                            'sanitize_callback' => 'sanitize_text_field',
                        ),
                        'orderBy' => array(
                            'required'          => false,
                            'type'              => 'string',
                            'description'       => 'Field to order by',
                            'enum'              => array( 'createdAt', 'title', 'type',  ),
                            'default'           => 'createdAt',
                            'sanitize_callback' => 'sanitize_text_field',
                        ),
                        'page' => array(
                            'required'          => false,
                            'type'              => 'integer',
                            'description'       => 'Page number for pagination',
                            'default'           => 1,
                            'sanitize_callback' => 'absint',
                        ),
                        'perPage' => array(
                            'required'          => false,
                            'type'              => 'integer',
                            'description'       => 'Number of items per page for pagination',
                            'default'           => 20,
                            'sanitize_callback' => 'absint',
                        ),
                    ),
				),
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'add' ),
					'permission_callback' => array( $this, 'managePermission' ),
					'args'                => $this->get_create_params(),
				),
				array(
					'methods'             => WP_REST_Server::DELETABLE,
					'callback'            => array( $this, 'delete' ),
					'permission_callback' => array( $this, 'managePermission' ),
                    'args'               => array(
                        'ids' => array(
                            'required' => true,
                            'type'     => 'array',
                            'description' => 'Array of widget IDs to delete',
                            'sanitize_callback' => function ( $value, $request, $param ) {
                                if ( ! is_array( $value ) ) {
                                    return new \WP_Error( 'invalid_ids', 'IDs must be an array.' );
                                }

                                foreach ( $value as $id ) {
                                    if ( ! is_numeric( $id ) || intval( $id ) <= 0 ) {
                                        return new \WP_Error( 'invalid_id', 'Each ID must be a positive integer.' );
                                    }
                                }

                                return true;
                            },
                        ),
                    ),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			"{$this->rest_base}/duplicate",
			array(
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'duplicate' ),
					'permission_callback' => array( $this, 'managePermission' ),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			"{$this->rest_base}/import",
			array(
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'import' ),
					'permission_callback' => array( $this, 'managePermission' ),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			"{$this->rest_base}/(?P<type>file-browser|gallery|embed-documents)",
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'permission_callback' => array( $this, 'managePermission' ),
					'callback'            => array( $this, 'getDefaultTemplate' ),
					'args'                => array(
						'type' => array(
							'validate_callback' => fn ( $param ) => in_array( $param, array( 'file-browser', 'gallery', 'embed-documents' ), true ),
						),
					),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			"{$this->rest_base}/(?P<widgetId>[^/]+)",
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get' ),
					'permission_callback' => array( $this, 'managePermission' ),
					'args'                => array(
						'widgetId'    => array(
							'required' => true,
							'type'     => 'integer',
                            'sanitize_callback' => 'absint',
						),
						'page'        => array(
							'required' => false,
							'type'     => 'integer',
							'default'  => 1,
                            'sanitize_callback' => 'absint',
						),
						'perPage'     => array(
							'required' => false,
							'type'     => 'integer',
							'default'  => 20,
                            'sanitize_callback' => 'absint',
						),
						'fileKey'     => array(
							'required'          => false,
							'type'              => 'string',
							'default'           => '/',
							'sanitize_callback' => 'sanitize_text_field',
						),
						'order'       => array(
							'required'          => false,
							'type'              => 'string',
							'default'           => 'DESC',
							'sanitize_callback' => 'sanitize_text_field',
						),
						'orderBy'     => array(
							'required'          => false,
							'type'              => 'string',
							'default'           => 'createdAt',
							'sanitize_callback' => 'sanitize_text_field',
						),
						'search'      => array(
							'required'          => false,
							'type'              => 'string',
							'default'           => '',
							'sanitize_callback' => 'sanitize_text_field',
						),
						'searchScope' => array(
							'required'          => false,
							'type'              => 'string',
							'default'           => 'folder',
							'sanitize_callback' => 'sanitize_text_field',
						),
						'from'        => array(
							'required'          => false,
							'type'              => 'string',
							'default'           => 'cache',
							'sanitize_callback' => 'sanitize_text_field',
						),
						'password'    => array(
							'required'          => false,
							'type'              => 'string',
							'default'           => '',
							'sanitize_callback' => 'sanitize_text_field',
						),
						'types'       => array(
							'required'          => false,
							'type'              => 'string',
							'default'           => 'all',
							'sanitize_callback' => 'sanitize_text_field',
						),
						'isAdmin'     => array(
							'required' => false,
							'type'     => 'boolean',
							'default'  => false,
                            'sanitize_callback' => 'rest_sanitize_boolean',
						),
					),
				),
				array(
					'methods'             => WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'update' ),
					'permission_callback' => array( $this, 'managePermission' ),
					'args'                => array(
						'widgetId' => array(
							'required' => true,
							'type'     => 'integer',
                            'sanitize_callback' => 'absint',
						),
						'title'    => array(
							'required' => false,
							'type'     => 'string',
                            'sanitize_callback' => 'sanitize_text_field',
						),
						'type'     => array(
							'required' => false,
							'type'     => 'string',
                            'enum'     => array( 'file-browser', 'gallery', 'embed-documents' ),
                            'sanitize_callback' => 'sanitize_text_field',
						),
						'status'   => array(
							'required' => false,
							'type'     => 'string',
                            'enum'     => array( 'active', 'inactive' ),
                            'sanitize_callback' => 'sanitize_text_field',
						),
						'data'     => array(
							'required'          => false,
							'type'              => 'object',
							'validate_callback' => function ( $value, $request, $param ) {
								if ( ! is_array( $value ) ) {
									return new \WP_Error( 'invalid_data', 'Data must be an array.' );
								}

								return true;
							},
						),
						'location' => array(
							'required' => false,
							'type'     => 'string',
                            'sanitize_callback' => 'sanitize_text_field',
						),
					),
				),
			),
		);
	}

	public function getDefaultTemplate( WP_REST_Request $request ): WP_REST_Response {
		$type = $request->get_param( 'type' );

		try {
			$template = pnpndGetWidgetDefaultData( $type );

			if ( empty( $template ) || is_wp_error( $template ) ) {
				return $this->errorResponse( __( 'Default template not found.', 'ninja-drive' ), self::HTTP_NOT_FOUND );
			}

			return $this->successResponse(
				array(
					'widget' => $template,
				)
			);
		} catch ( \Throwable $e ) {
			return $this->handleException( $e, __( 'Failed to retrieve default template.', 'ninja-drive' ) );
		}
	}

	public function add( WP_REST_Request $request ): WP_REST_Response {
		$title       = $request->get_param( 'title' );
		$type        = $request->get_param( 'type' );
		$status      = $request->get_param( 'status' );
		$data        = $request->get_param( 'data' );
		$location    = $request->get_param( 'location' );
		$integration = $request->get_param( 'integration' );

		try {

			$widget = WidgetModel::getInstance()->add(
				array(
					'title'       => $title,
					'type'        => $type,
					'status'      => $status,
					'data'        => $data,
					'locations'   => $location,
					'integration' => $integration,
				)
			);

			if ( is_wp_error( $widget ) ) {
				return $this->errorResponse( $widget->get_error_message(), self::HTTP_BAD_REQUEST );
			}

			return $this->successResponse(
				array(
					'widget' => $widget,
				),
				__( 'Widget created successfully.', 'ninja-drive' )
			);
		} catch ( \Exception $e ) {
			return $this->handleException( $e, __( 'Failed to create widget.', 'ninja-drive' ) );
		}
	}

	public function get( WP_REST_Request $request ): WP_REST_Response {
		$id          = (int) $request->get_param( 'widgetId' );
		$page        = $request->get_param( 'page' );
		$perPage     = $request->get_param( 'perPage' );
		$fileKey     = $request->get_param( 'fileKey' );
		$order       = $request->get_param( 'order' );
		$orderBy     = $request->get_param( 'orderBy' );
		$search      = $request->get_param( 'search' );
		$searchScope = $request->get_param( 'searchScope' );
		$from        = $request->get_param( 'from' );
		$password    = $request->get_param( 'password' );
		$types       = $request->get_param( 'types' );
		$isAdmin     = $request->get_param( 'isAdmin' );

		$types = $types === 'all' ? array() : array_filter( array_map( 'trim', explode( ',', $types ) ) );

		try {
			$widget = WidgetModel::getInstance()->get(
				$id,
				array(
					'page'        => $page,
					'perPage'     => $perPage,
					'fileKey'     => $fileKey,
					'order'       => $order,
					'orderBy'     => $orderBy,
					'search'      => $search,
					'searchScope' => $searchScope,
					'from'        => $from,
					'password'    => $password,
					'types'       => $types,
					'isAdmin'     => $isAdmin,
				)
			);

			if ( is_wp_error( $widget ) ) {
				return $this->errorResponse( $widget->get_error_message(), self::HTTP_INTERNAL_SERVER_ERROR );
			}

			if ( empty( $widget ) ) {
				return $this->errorResponse( __( 'Widget not found.', 'ninja-drive' ), self::HTTP_NOT_FOUND );
			}

			return $this->successResponse(
				array(
					'widget' => $widget,
				)
			);
		} catch ( \Exception $e ) {
			return $this->handleException( $e, __( 'Failed to retrieve widget.', 'ninja-drive' ) );
		}
	}

	public function getAll( WP_REST_Request $request ): WP_REST_Response {

        $type = $request->get_param( 'type' );
        $search = $request->get_param( 'search' );
        $status = $request->get_param( 'status' );
        $order = $request->get_param( 'order' );
        $orderBy = $request->get_param( 'orderBy' );
        $page = $request->get_param( 'page' );
        $perPage = $request->get_param( 'perPage' );

        $queryArgs = array(
            'type' => $type,
            'search' => $search,
            'status' => $status,
            'order' => $order,
            'orderBy' => $orderBy,
            'page' => $page,
            'perPage' => $perPage,
        );

		try {
			$widgets     = WidgetModel::getInstance()->getAll( $queryArgs );
			$totalResult = WidgetModel::getInstance()->totalCount( $queryArgs );
			$totalCount  = WidgetModel::getInstance()->totalCount();

			if ( is_wp_error( $widgets ) ) {
				return $this->errorResponse( $widgets->get_error_message(), self::HTTP_INTERNAL_SERVER_ERROR );
			}

			if ( is_wp_error( $totalResult ) ) {
				return $this->errorResponse( $totalResult->get_error_message(), self::HTTP_INTERNAL_SERVER_ERROR );
			}

			$total      = (int) $totalResult;
			$totalPages = $total > 0 ? (int) ceil( $total / $queryArgs['perPage'] ) : 0;
			$hasMore    = $queryArgs['page'] < $totalPages;

			return $this->successResponse(
				array(
					'widgets'    => $widgets,
					'totalPages' => $totalPages,
					'hasMore'    => $hasMore,
					'total'      => $totalCount,
					'page'       => (int) $queryArgs['page'],
				)
			);

		} catch ( \Throwable $e ) {
			return $this->handleException( $e, __( 'Failed to retrieve widgets.', 'ninja-drive' ) );
		}
	}

	public function update( WP_REST_Request $request ): WP_REST_Response {
		$id       = (int) $request->get_param( 'widgetId' );
		$title    = $request->get_param( 'title' );
		$type     = $request->get_param( 'type' );
		$status   = $request->get_param( 'status' );
		$data     = $request->get_param( 'data' );
		$location = $request->get_param( 'location' );

		try {
			$widget = WidgetModel::getInstance()->add(
				array(
					'id'        => $id,
					'title'     => $title,
					'type'      => $type,
					'status'    => $status,
					'data'      => $data,
					'locations' => $location,
				)
			);

			if ( is_wp_error( $widget ) ) {
				return $this->errorResponse( $widget->get_error_message(), self::HTTP_INTERNAL_SERVER_ERROR );
			}

			return $this->successResponse(
				array(
					'widget' => $widget,
				),
				__( 'Widget updated successfully.', 'ninja-drive' )
			);
		} catch ( \Throwable $e ) {
			return $this->handleException( $e, __( 'Failed to update widget.', 'ninja-drive' ) );
		}
	}

	public function delete( WP_REST_Request $request ): WP_REST_Response {
		$ids = $request->get_param( 'ids' );

		try {
			$deleted = WidgetModel::getInstance()->remove( $ids );

			if ( is_wp_error( $deleted ) ) {
				return $this->errorResponse( $deleted->get_error_message(), self::HTTP_INTERNAL_SERVER_ERROR );
			}

			return $this->successResponse( $deleted, __( 'Widget deleted successfully.', 'ninja-drive' ) );
		} catch ( \Throwable $e ) {
			return $this->handleException( $e, __( 'Failed to delete widget.', 'ninja-drive' ) );
		}
	}

	public function duplicate( WP_REST_Request $request ): WP_REST_Response {
		$ids = $request->get_param( 'ids' );

		if ( empty( $ids ) ) {
			return $this->errorResponse( __( 'Widget IDs are required.', 'ninja-drive' ), self::HTTP_BAD_REQUEST );
		}

		if ( ! is_array( $ids ) ) {
			$ids = array( $ids );
		}

		try {
			$result = WidgetModel::getInstance()->duplicate( $ids );

			if ( is_wp_error( $result ) ) {

				return $this->errorResponse( $result->get_error_message(), self::HTTP_INTERNAL_SERVER_ERROR );
			}

			return $this->successResponse(
				array(
					'duplicated' => $result,
				),
				__( 'Widget(s) duplicated successfully.', 'ninja-drive' )
			);
		} catch ( \Throwable $e ) {
			return $this->handleException( $e, __( 'Failed to duplicate widget(s).', 'ninja-drive' ) );
		}
	}

	public function import( WP_REST_Request $request ): WP_REST_Response {
		$widgets = $request->get_param( 'widgets' );

		if ( empty( $widgets ) ) {
			return $this->errorResponse( __( 'Import widgets is required.', 'ninja-drive' ), self::HTTP_BAD_REQUEST );
		}

		try {
			$importedWidgets = WidgetModel::getInstance()->import( $widgets );

			if ( is_wp_error( $importedWidgets ) ) {
				return $this->errorResponse( $importedWidgets->get_error_message(), self::HTTP_INTERNAL_SERVER_ERROR );
			}

			return $this->successResponse(
				array(
					'imported' => $importedWidgets,
				),
				__( 'Widgets imported successfully.', 'ninja-drive' )
			);
		} catch ( \Exception $e ) {
			return $this->handleException( $e, __( 'Failed to import widgets.', 'ninja-drive' ) );
		}
	}

	public function get_item_schema(): array {
		$schema               = parent::get_item_schema();
		$schema['title']      = 'widget';
		$schema['properties'] = array(
			'id'          => array(
				'description' => __( 'Unique identifier for the widget.', 'ninja-drive' ),
				'type'        => 'integer',
				'context'     => array( 'view', 'edit' ),
				'readonly'    => true,
			),
			'title'       => array(
				'description' => __( 'Widget title.', 'ninja-drive' ),
				'type'        => 'string',
				'context'     => array( 'view', 'edit' ),
			),
			'type'        => array(
				'description' => __( 'Widget type.', 'ninja-drive' ),
				'type'        => 'string',
				'enum'        => array( 'file-browser', 'gallery', 'embed-documents' ),
				'context'     => array( 'view', 'edit' ),
			),
			'status'      => array(
				'description' => __( 'Widget status.', 'ninja-drive' ),
				'type'        => 'string',
				'enum'        => array( 'active', 'inactive', 'on', 'off' ),
				'context'     => array( 'view', 'edit' ),
			),
			'integration' => array(
				'description' => __( 'Integration identifier.', 'ninja-drive' ),
				'type'        => 'string',
				'context'     => array( 'view', 'edit' ),
			),
			'data'        => array(
				'description' => __( 'Widget configuration data.', 'ninja-drive' ),
				'type'        => 'object',
				'context'     => array( 'view', 'edit' ),
			),
			'locations'   => array(
				'description' => __( 'Widget location assignments.', 'ninja-drive' ),
				'type'        => 'array',
				'context'     => array( 'view', 'edit' ),
				'items'       => array( 'type' => 'string' ),
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

	private function get_create_params(): array {
		return array(
			'title'    => array(
				'required'          => true,
				'type'              => 'string',
				'description'       => 'Widget title',
				'sanitize_callback' => 'sanitize_text_field',
			),
			'type'     => array(
				'required'          => true,
				'type'              => 'string',
				'description'       => 'Widget type',
				'sanitize_callback' => 'sanitize_text_field',
			),
			'status'   => array(
				'type'              => 'string',
				'description'       => 'Widget status',
				'enum'              => array( 'active', 'inactive' ),
				'default'           => 'active',
				'sanitize_callback' => 'sanitize_text_field',
			),
			'data'     => array(
				'required'          => true,
				'type'              => 'object',
				'description'       => 'Widget data',
				'validate_callback' => function ( $value, $request, $param ) {
					if ( ! is_array( $value ) ) {
						return new \WP_Error( 'invalid_data', 'Data must be an array.' );
					}

					return true;
				},
			),
			'location' => array(
				'type'              => 'string',
				'description'       => 'Widget location',
				'sanitize_callback' => 'sanitize_text_field',
			),
		);
	}
}
