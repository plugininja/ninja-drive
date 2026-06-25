<?php

namespace Pnpnd\ND\API\Controllers;

use Pnpnd\ND\API\Traits\Has_Widget_Permission;
use Pnpnd\ND\API\Base_Controller;
use Pnpnd\ND\Models\Widget as WidgetModel;
use Pnpnd\ND\Widget as NDWidget;
use WP_Error;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class Widget extends Base_Controller {

	use Has_Widget_Permission;

	public function __construct() {
		parent::__construct( 'pnpnd/v1', 'widget' );
	}

	public function manage_permission( WP_REST_Request $request ) {
		if ( $this->has_permission() ) {
			return true;
		}

		$route  = $request->get_route();
		$method = $request->get_method();
		$action = '';

		$widget_id = $request->get_param( 'widget_id' );

			$action = strpos( $route, '/widget' ) !== false && 'GET' === $method && ! empty( $widget_id ) ? 'get_folder' : '';
		
		if ( empty( $action ) ) {
			return new WP_Error( 'forbidden', 'You do not have permission.', array( 'status' => 403 ) );
		}

		return $this->check_widget_permission( $request, $action );
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
				),
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'add' ),
					'permission_callback' => array( $this, 'manage_permission' ),
					'args'                => $this->get_create_params(),
				),
				array(
					'methods'             => WP_REST_Server::DELETABLE,
					'callback'            => array( $this, 'delete' ),
					'permission_callback' => array( $this, 'manage_permission' ),
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
					'permission_callback' => array( $this, 'manage_permission' ),
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
					'permission_callback' => array( $this, 'manage_permission' ),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			"{$this->rest_base}/embed",
			array(
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'embed' ),
					'permission_callback' => array( $this, 'manage_permission' ),
					'args'                => array(
						'page_id'   => array(
							'required'          => false,
							'type'              => 'integer',
							'sanitize_callback' => 'absint',
							'default'           => 0,
						),
						'page_name' => array(
							'required'          => false,
							'type'              => 'string',
							'default'           => '',
							'sanitize_callback' => 'sanitize_text_field',
						),
						'widget_id' => array(
							'required'          => true,
							'type'              => 'integer',
							'sanitize_callback' => 'absint',
						),
						'editor'    => array(
							'required'          => false,
							'type'              => 'string',
							'default'           => 'auto',
							'sanitize_callback' => 'sanitize_text_field',
							'validate_callback' => function ( $value ) {
								return in_array( $value, array( 'auto', 'gutenberg', 'classic', 'elementor', 'popular' ), true );
							},
						),
					),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			"{$this->rest_base}/onboarding",
			array(
				array(
					'methods'             => WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'onboarding' ),
					'permission_callback' => array( $this, 'manage_permission' ),
					'args'                => array(
						'status' => array(
							'required'          => false,
							'type'              => 'boolean',
							'sanitize_callback' => 'rest_sanitize_boolean',
							'default'           => false,
						),
					),
				),
			)
		);

			register_rest_route(
				$this->namespace,
				"{$this->rest_base}/(?P<type>file_browser|gallery|embed_documents)",
				array(
					array(
						'methods'             => WP_REST_Server::READABLE,
						'permission_callback' => array( $this, 'manage_permission' ),
						'callback'            => array( $this, 'get_default_template' ),
						'args'                => array(
							'type' => array(
								'validate_callback' => fn ( $param ) => in_array( $param, array( 'file_browser', 'gallery', 'embed_documents' ), true ),
							),
						),
					),
				)
			);
		
		register_rest_route(
			$this->namespace,
			"{$this->rest_base}/(?P<widget_id>[^/]+)",
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get' ),
					'permission_callback' => array( $this, 'manage_permission' ),
					'args'                => array(
						'widget_id'    => array(
							'required'          => true,
							'type'              => 'integer',
							'sanitize_callback' => 'absint',
						),
						'page'         => array(
							'required'          => false,
							'type'              => 'integer',
							'default'           => 1,
							'sanitize_callback' => 'absint',
						),
						'per_page'     => array(
							'required'          => false,
							'type'              => 'integer',
							'default'           => 20,
							'sanitize_callback' => 'absint',
						),
						'file_key'     => array(
							'required'          => false,
							'type'              => 'string',
							'default'           => '/',
							'sanitize_callback' => 'sanitize_text_field',
						),
						'order'        => array(
							'required'          => false,
							'type'              => 'string',
							'default'           => 'DESC',
							'sanitize_callback' => 'sanitize_text_field',
						),
						'order_by'     => array(
							'required'          => false,
							'type'              => 'string',
							'default'           => 'created_at',
							'sanitize_callback' => 'sanitize_text_field',
						),
						'search'       => array(
							'required'          => false,
							'type'              => 'string',
							'default'           => '',
							'sanitize_callback' => 'sanitize_text_field',
						),
						'search_scope' => array(
							'required'          => false,
							'type'              => 'string',
							'default'           => 'folder',
							'sanitize_callback' => 'sanitize_text_field',
						),
						'from'         => array(
							'required'          => false,
							'type'              => 'string',
							'default'           => 'cache',
							'sanitize_callback' => 'sanitize_text_field',
						),
						'password'     => array(
							'required'          => false,
							'type'              => 'string',
							'default'           => '',
							'sanitize_callback' => 'sanitize_text_field',
						),
						'types'        => array(
							'required'          => false,
							'type'              => 'string',
							'default'           => 'all',
							'sanitize_callback' => 'sanitize_text_field',
						),
						'is_admin'     => array(
							'required' => false,
							'type'     => 'boolean',
							'default'  => false,
						),
					),
				),
				array(
					'methods'             => WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'update' ),
					'permission_callback' => array( $this, 'manage_permission' ),
					'args'                => array(
						'widget_id' => array(
							'required'          => true,
							'type'              => 'integer',
							'sanitize_callback' => 'absint',
						),
						'title'     => array(
							'required'          => false,
							'type'              => 'string',
							'sanitize_callback' => 'sanitize_text_field',
						),
						'type'      => array(
							'required'          => false,
							'type'              => 'string',
							'sanitize_callback' => 'sanitize_text_field',
						),
						'status'    => array(
							'required'          => false,
							'type'              => 'string',
							'sanitize_callback' => 'sanitize_text_field',
						),
						'data'      => array(
							'required'          => false,
							'type'              => 'object',
							'validate_callback' => function ( $value, $request, $param ) {
								if ( ! is_array( $value ) ) {
									return new \WP_Error( 'invalid_data', 'Data must be an array.' );
								}

								return true;
							},
						),
						'location'  => array(
							'required'          => false,
							'type'              => 'string',
							'sanitize_callback' => 'sanitize_text_field',
						),
					),
				),
				array(
					'methods'             => WP_REST_Server::DELETABLE,
					'callback'            => array( $this, 'delete' ),
					'permission_callback' => array( $this, 'manage_permission' ),
					'args'                => array(
						'widget_id' => array(
							'required' => true,
							'type'     => 'integer',
						),
					),
				),
			)
		);
	}

	public function get_default_template( WP_REST_Request $request ): WP_REST_Response {
		$type = $request->get_param( 'type' );

		try {
			$template = pnpnd_build_widget_data( $type );

			if ( empty( $template ) || is_wp_error( $template ) ) {
				return $this->error_response( __( 'Default template not found.', 'ninja-drive' ), self::HTTP_NOT_FOUND );
			}

			return $this->success_response(
				array(
					'widget' => $template,
				)
			);
		} catch ( \Throwable $e ) {
			return $this->handle_exception( $e, __( 'Failed to retrieve default template.', 'ninja-drive' ) );
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

			$widget = WidgetModel::get_instance()->add(
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
				return $this->error_response( $widget->get_error_message(), self::HTTP_BAD_REQUEST );
			}

			return $this->success_response(
				array(
					'widget' => $widget,
				),
				__( 'Widget created successfully.', 'ninja-drive' )
			);
		} catch ( \Exception $e ) {
			return $this->handle_exception( $e, __( 'Failed to create widget.', 'ninja-drive' ) );
		}
	}

	public function get( WP_REST_Request $request ): WP_REST_Response {
		$id           = $request->get_param( 'widget_id' );
		$page         = $request->get_param( 'page' );
		$per_page     = $request->get_param( 'per_page' );
		$file_key     = $request->get_param( 'file_key' );
		$order        = $request->get_param( 'order' );
		$order_by     = $request->get_param( 'order_by' );
		$search       = $request->get_param( 'search' );
		$search_scope = $request->get_param( 'search_scope' );
		$from         = $request->get_param( 'from' );
		$password     = $request->get_param( 'password' );
		$types        = $request->get_param( 'types' );
		$is_admin     = $request->get_param( 'is_admin' );

		$types = 'all' === $types ? array() : array_filter( array_map( 'trim', explode( ',', $types ) ) );

		try {
			$widget = WidgetModel::get_instance()->get(
				$id,
				array(
					'page'         => $page,
					'per_page'     => $per_page,
					'file_key'     => $file_key,
					'order'        => $order,
					'order_by'     => $order_by,
					'search'       => $search,
					'search_scope' => $search_scope,
					'from'         => $from,
					'password'     => $password,
					'types'        => $types,
					'is_admin'     => $is_admin,
				)
			);

			if ( is_wp_error( $widget ) ) {
				return $this->error_response( $widget->get_error_message(), self::HTTP_INTERNAL_SERVER_ERROR );
			}

			if ( empty( $widget ) ) {
				return $this->error_response( __( 'Widget not found.', 'ninja-drive' ), self::HTTP_NOT_FOUND );
			}

			return $this->success_response(
				array(
					'widget' => $widget,
				)
			);
		} catch ( \Exception $e ) {
			return $this->handle_exception( $e, __( 'Failed to retrieve widget.', 'ninja-drive' ) );
		}
	}

	public function get_all( WP_REST_Request $request ): WP_REST_Response {
		$defaults = array(
			'type'     => 'all',
			'search'   => '',
			'status'   => 'all',
			'order'    => 'DESC',
			'order_by' => 'updated_at',
			'page'     => 1,
			'per_page' => 10,
		);

		$query_args = array();
		foreach ( $defaults as $key => $default ) {
			$query_args[ $key ] = $request->get_param( $key ) ?? $default;
		}

		$query_args['page']     = (int) $query_args['page'];
		$query_args['per_page'] = (int) $query_args['per_page'];

		try {
			$widgets      = WidgetModel::get_instance()->get_all( $query_args );
			$total_result = WidgetModel::get_instance()->total_count( $query_args );
			$total_count  = WidgetModel::get_instance()->total_count();

			if ( is_wp_error( $widgets ) ) {
				return $this->error_response( $widgets->get_error_message(), self::HTTP_INTERNAL_SERVER_ERROR );
			}

			if ( is_wp_error( $total_result ) ) {
				return $this->error_response( $total_result->get_error_message(), self::HTTP_INTERNAL_SERVER_ERROR );
			}

			$total       = (int) $total_result;
			$total_pages = $total > 0 ? (int) ceil( $total / $query_args['per_page'] ) : 0;
			$has_more    = $query_args['page'] < $total_pages;

			return $this->success_response(
				array(
					'widgets'     => $widgets,
					'total_pages' => $total_pages,
					'has_more'    => $has_more,
					'total'       => $total_count,
					'page'        => (int) $query_args['page'],
				)
			);

		} catch ( \Throwable $e ) {
			return $this->handle_exception( $e, __( 'Failed to retrieve widgets.', 'ninja-drive' ) );
		}
	}

	public function update( WP_REST_Request $request ): WP_REST_Response {
		$id       = (int) $request->get_param( 'widget_id' );
		$title    = $request->get_param( 'title' );
		$type     = $request->get_param( 'type' );
		$status   = $request->get_param( 'status' );
		$data     = $request->get_param( 'data' );
		$location = $request->get_param( 'location' );

		try {
			$widget = WidgetModel::get_instance()->add(
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
				return $this->error_response( $widget->get_error_message(), self::HTTP_INTERNAL_SERVER_ERROR );
			}

			return $this->success_response(
				array(
					'widget' => $widget,
				),
				__( 'Widget updated successfully.', 'ninja-drive' )
			);
		} catch ( \Throwable $e ) {
			return $this->handle_exception( $e, __( 'Failed to update widget.', 'ninja-drive' ) );
		}
	}

	public function delete( WP_REST_Request $request ): WP_REST_Response {
		$ids = $request->get_param( 'ids' );
		$id  = $request->get_param( 'widget_id' );
		if ( ! empty( $id ) ) {
			$ids = array( $id );
		}

		try {
			$deleted = WidgetModel::get_instance()->remove( $ids );

			if ( is_wp_error( $deleted ) ) {
				return $this->error_response( $deleted->get_error_message(), self::HTTP_INTERNAL_SERVER_ERROR );
			}

			return $this->success_response( $deleted, __( 'Widget deleted successfully.', 'ninja-drive' ) );
		} catch ( \Throwable $e ) {
			return $this->handle_exception( $e, __( 'Failed to delete widget.', 'ninja-drive' ) );
		}
	}

	public function duplicate( WP_REST_Request $request ): WP_REST_Response {
		$ids = $request->get_param( 'ids' );

		if ( empty( $ids ) ) {
			return $this->error_response( __( 'Widget IDs are required.', 'ninja-drive' ), self::HTTP_BAD_REQUEST );
		}

		if ( ! is_array( $ids ) ) {
			$ids = array( $ids );
		}

		try {
			$result = WidgetModel::get_instance()->duplicate( $ids );

			if ( is_wp_error( $result ) ) {

				return $this->error_response( $result->get_error_message(), self::HTTP_INTERNAL_SERVER_ERROR );
			}

			return $this->success_response(
				array(
					'duplicated' => $result,
				),
				__( 'Widget(s) duplicated successfully.', 'ninja-drive' )
			);
		} catch ( \Throwable $e ) {
			return $this->handle_exception( $e, __( 'Failed to duplicate widget(s).', 'ninja-drive' ) );
		}
	}

	public function import( WP_REST_Request $request ): WP_REST_Response {
		$widgets = $request->get_param( 'widgets' );

		if ( empty( $widgets ) ) {
			return $this->error_response( __( 'Import widgets is required.', 'ninja-drive' ), self::HTTP_BAD_REQUEST );
		}

		try {
			$imported_widgets = WidgetModel::get_instance()->import( $widgets );

			if ( is_wp_error( $imported_widgets ) ) {
				return $this->error_response( $imported_widgets->get_error_message(), self::HTTP_INTERNAL_SERVER_ERROR );
			}

			return $this->success_response(
				array(
					'imported' => $imported_widgets,
				),
				__( 'Widgets imported successfully.', 'ninja-drive' )
			);
		} catch ( \Exception $e ) {
			return $this->handle_exception( $e, __( 'Failed to import widgets.', 'ninja-drive' ) );
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

	public function embed( WP_REST_Request $request ): WP_REST_Response {
		$name      = $request->get_param( 'page_name' );
		$page_id   = $request->get_param( 'page_id' );
		$widget_id = $request->get_param( 'widget_id' );
		$editor    = $request->get_param( 'editor' );

		try {
			$embed_page_url = NDWidget::get_instance()->embed_to_page( $widget_id, $page_id, $name, $editor );

			if ( is_wp_error( $embed_page_url ) ) {
				return $this->error_response( $embed_page_url->get_error_message(), self::HTTP_INTERNAL_SERVER_ERROR );
			}

			$is_onboarding = get_option( 'pnpnd_onboarding_module_builder', 1 );

			if ( ! empty( $is_onboarding ) ) {
				update_option( 'pnpnd_onboarding_module_builder', 0 );
			}

			return $this->success_response(
				array(
					'page_url' => $embed_page_url,
				),
				__( 'Widget embed URL generated successfully.', 'ninja-drive' )
			);

		} catch ( \Exception $e ) {
			return $this->handle_exception( $e, __( 'Failed to generate embed code.', 'ninja-drive' ) );
		}
	}

	public function onboarding( WP_REST_Request $request ): WP_REST_Response {
		$status = $request->get_param( 'status' );

		try {
			update_option( 'pnpnd_onboarding_module_builder', $status ? 1 : 0 );

			return $this->success_response(
				array(
					'status' => $status,
				),
				__( 'Onboarding status updated successfully.', 'ninja-drive' )
			);
		} catch ( \Exception $e ) {
			return $this->handle_exception( $e, __( 'Failed to update onboarding status.', 'ninja-drive' ) );
		}
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
