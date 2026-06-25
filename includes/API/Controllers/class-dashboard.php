<?php

namespace Pnpnd\ND\API\Controllers;

use Exception;
use Pnpnd\ND\API\Base_Controller;
use Pnpnd\ND\Models\Files;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class Dashboard extends Base_Controller {

	private const ALL_FIELDS = array(
		'cached_files',
		'downloaded_files',
		'shared_files',
		'image_cache',
	);

	public function __construct() {
		parent::__construct( 'pnpnd/v1', 'dashboard' );
	}

	public function register_routes(): void {
		register_rest_route(
			$this->namespace,
			$this->rest_base . '/',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get' ),
				'permission_callback' => array( $this, 'manage_permission' ),
				'args'                => array(
					'fields' => array(
						'required'          => false,
						'description'       => __( 'Specific fields to retrieve (e.g., storage_stats, image_cache).', 'ninja-drive' ),
						'sanitize_callback' => 'sanitize_text_field',
					),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			$this->rest_base . '/cache',
			array(
				'methods'             => WP_REST_Server::DELETABLE,
				'callback'            => array( $this, 'delete_cache' ),
				'permission_callback' => array( $this, 'manage_permission' ),
				'args'                => array(
					'type' => array(
						'required'    => false,
						'enum'        => array( 'total', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl' ),
						'description' => __( 'Type of cache to delete (total, or specific size).', 'ninja-drive' ),
						'default'     => 'total',
					),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			$this->rest_base . '/cache/file',
			array(
				'methods'             => WP_REST_Server::DELETABLE,
				'callback'            => array( $this, 'delete_cache_file' ),
				'permission_callback' => array( $this, 'manage_permission' ),
				'args'                => array(
					'file_key' => array(
						'required'          => true,
						'type'              => 'string',
						'description'       => __( 'File key to delete from cache.', 'ninja-drive' ),
						'sanitize_callback' => 'sanitize_text_field',
					),
					'size'     => array(
						'required'    => false,
						'enum'        => array( 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl' ),
						'description' => __( 'Cache size to delete (all sizes if not specified).', 'ninja-drive' ),
					),
					'ext'      => array(
						'required'          => false,
						'default'           => 'webp',
						'description'       => __( 'File extension.', 'ninja-drive' ),
						'sanitize_callback' => 'sanitize_text_field',
					),
				),
			)
		);
	}

	public function manage_permission( WP_REST_Request $request ) {
		if ( $this->has_permission() ) {
			return true;
		}

		return new \WP_Error(
			'forbidden',
			__( 'You do not have permission.', 'ninja-drive' ),
			array( 'status' => 403 )
		);
	}

	public function get( WP_REST_Request $request ): WP_REST_Response {
		$fields = $request->get_param( 'fields' );

		$requested       = $fields ? array_map( 'trim', explode( ',', $fields ) ) : array();
		$expected_fields = $requested ? array_intersect( $requested, self::ALL_FIELDS ) : self::ALL_FIELDS;
		$expected_set    = array_flip( $expected_fields );

		try {
			$response = $this->get_dashboard_data( $expected_set );

			return $this->success_response(
				$response,
				__( 'Dashboard data retrieved successfully.', 'ninja-drive' )
			);
		} catch ( Exception $e ) {
			return $this->handle_exception( $e, __( 'Failed to retrieve dashboard data.', 'ninja-drive' ) );
		}
	}

	public function delete_cache( WP_REST_Request $request ): WP_REST_Response {
		$cache_type = $request->get_param( 'type' ) ?? 'total';

		try {
			$cache_obj = new \Pnpnd\ND\Cache();

			if ( 'total' === $cache_type ) {
				$cache_obj->clear_cache();
			} else {
				$cache_obj->clear_cache_by_size( $cache_type );
			}

			delete_transient( 'pnpnd_dashboard_image_cache' );

			$response = $this->get_dashboard_data(
				array(
					'image_cache'   => true,
					'storage_stats' => true,
				)
			);

			return $this->success_response(
				$response,
				__( 'Cache deleted successfully.', 'ninja-drive' )
			);
		} catch ( Exception $e ) {
			return $this->error_response(
				$e->getMessage(),
				self::HTTP_INTERNAL_SERVER_ERROR
			);
		}
	}

	public function delete_cache_file( WP_REST_Request $request ): WP_REST_Response {
		$file_key = $request->get_param( 'file_key' );
		$size     = $request->get_param( 'size' );
		$ext      = $request->get_param( 'ext' ) ?? 'webp';

		try {
			$cache_obj = new \Pnpnd\ND\Cache();

			$allowed_sizes = array( 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl' );

			if ( $size ) {
				$cache_obj->delete_file( $file_key, $size, $ext );
			} else {
				foreach ( $allowed_sizes as $size_folder ) {
					$cache_obj->delete_file( $file_key, $size_folder, $ext );
				}
			}

			delete_transient( 'pnpnd_dashboard_image_cache' );

			$response = $this->get_dashboard_data(
				array(
					'image_cache'  => true,
					'cached_files' => true,
				)
			);

			return $this->success_response(
				$response,
				__( 'File cache deleted successfully.', 'ninja-drive' )
			);
		} catch ( Exception $e ) {
			return $this->error_response(
				$e->getMessage(),
				self::HTTP_INTERNAL_SERVER_ERROR
			);
		}
	}

	private function get_dashboard_data( array $expected_set ): array {
		$response = array();

		if ( isset( $expected_set['image_cache'] ) ) {
			$cache_key   = 'pnpnd_dashboard_image_cache';
			$image_cache = get_transient( $cache_key );

			if ( false === $image_cache ) {
				$image_cache = ( new \Pnpnd\ND\Cache() )->calculate_cache_size_and_count();
				set_transient( $cache_key, $image_cache, 10 * MINUTE_IN_SECONDS );
			}

			$response['image_cache'] = $image_cache;
		}

		$files_instance = null;
		$needs_files    = isset( $expected_set['cached_files'] )
			|| isset( $expected_set['downloaded_files'] )
			|| isset( $expected_set['shared_files'] );

		if ( $needs_files ) {
			$files_instance = Files::get_instance();
		}

		if ( isset( $expected_set['cached_files'] ) ) {
			$response['cached_files'] = $files_instance->cached_files();
		}

		if ( isset( $expected_set['downloaded_files'] ) ) {
			$response['downloaded_files'] = $files_instance->downloaded_files();
		}

		if ( isset( $expected_set['shared_files'] ) ) {
			$response['shared_files'] = $files_instance->shared_files();
		}

		return $response;
	}
}
