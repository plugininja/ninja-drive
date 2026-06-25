<?php

namespace Pnpnd\ND\API\Controllers;

use Pnpnd\ND\API\Base_Controller;
use Pnpnd\ND\Updates\Migration_Logger;
use Pnpnd\ND\Updates\Migration_Runner;
use WP_REST_Request;
use WP_REST_Response;

defined( 'ABSPATH' ) || exit;

class Migration extends Base_Controller {

	public function __construct() {
		parent::__construct( 'pnpnd/v1', 'migration' );
	}

	public function register_routes(): void {
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/status',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'get_status' ),
				'permission_callback' => array( $this, 'has_permission' ),
			)
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/run',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'run_migrations' ),
				'permission_callback' => array( $this, 'has_permission' ),
			)
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/rollback',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'rollback' ),
				'permission_callback' => array( $this, 'has_permission' ),
				'args'                => array(
					'version' => array(
						'required' => true,
						'type'     => 'string',
					),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/logs',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'get_logs' ),
				'permission_callback' => array( $this, 'has_permission' ),
				'args'                => array(
					'tail' => array(
						'required' => false,
						'type'     => 'integer',
						'default'  => 50,
					),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/logs',
			array(
				'methods'             => 'DELETE',
				'callback'            => array( $this, 'clear_logs' ),
				'permission_callback' => array( $this, 'has_permission' ),
			)
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/cleanup',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'cleanup_legacy_column' ),
				'permission_callback' => array( $this, 'has_permission' ),
			)
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/dismiss-cleanup',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'dismiss_cleanup_notice' ),
				'permission_callback' => array( $this, 'has_permission' ),
				'args'                => array(
					'duration' => array(
						'required' => true,
						'type'     => 'string',
						'enum'     => array( '30days', 'forever' ),
					),
				),
			)
		);
	}

	public function get_status(): WP_REST_Response {
		return $this->success_response( Migration_Runner::status() );
	}

	public function run_migrations(): WP_REST_Response {
		$results = Migration_Runner::run();

		if ( ! empty( $results['errors'] ) ) {
			return $this->error_response(
				__( 'One or more migrations failed.', 'ninja-drive' ),
				self::HTTP_INTERNAL_SERVER_ERROR,
				$results
			);
		}

		return $this->success_response( $results );
	}

	public function rollback( WP_REST_Request $request ): WP_REST_Response {
		$version = sanitize_text_field( (string) $request->get_param( 'version' ) );

		if ( '' === $version ) {
			return $this->error_response(
				__( 'Missing version parameter.', 'ninja-drive' ),
				self::HTTP_BAD_REQUEST
			);
		}

		$ok = Migration_Runner::rollback( $version );
		if ( ! $ok ) {
			return $this->error_response(
				__( 'Rollback failed or unsupported for this migration.', 'ninja-drive' ),
				self::HTTP_BAD_REQUEST
			);
		}

		return $this->success_response( array( 'rolled_back' => $version ) );
	}

	public function get_logs( WP_REST_Request $request ): WP_REST_Response {
		$tail = (int) ( $request->get_param( 'tail' ) ?? 50 );

		return $this->success_response(
			array(
				'lines' => Migration_Logger::tail( $tail ),
				'file'  => Migration_Logger::log_file_path(),
			)
		);
	}

	public function clear_logs(): WP_REST_Response {
		$ok = Migration_Logger::clear();

		return $ok
			? $this->success_response( array( 'cleared' => true ) )
			: $this->error_response(
				__( 'Failed to clear log file.', 'ninja-drive' ),
				self::HTTP_INTERNAL_SERVER_ERROR
			);
	}

	public function cleanup_legacy_column(): WP_REST_Response {
		$results = Migration_Runner::run();

		if ( ! empty( $results['errors'] ) || ! in_array( '1.2.0', $results['applied'], true ) ) {
			return $this->error_response(
				__( 'Cleanup migration failed or was skipped — see logs.', 'ninja-drive' ),
				self::HTTP_INTERNAL_SERVER_ERROR,
				$results
			);
		}

		update_user_meta( get_current_user_id(), 'pnpnd_cleanup_dismissed', true );

		return $this->success_response( $results );
	}

	public function dismiss_cleanup_notice( WP_REST_Request $request ): WP_REST_Response {
		$duration = sanitize_text_field( (string) $request->get_param( 'duration' ) );
		$user_id  = get_current_user_id();

		if ( 'forever' === $duration ) {
			update_user_meta( $user_id, 'pnpnd_cleanup_dismissed', true );
		} elseif ( '30days' === $duration ) {
			set_transient( 'pnpnd_cleanup_dismissed_' . $user_id, 1, 30 * DAY_IN_SECONDS );
		} else {
			return $this->error_response(
				__( 'Invalid duration. Use "30days" or "forever".', 'ninja-drive' ),
				self::HTTP_BAD_REQUEST
			);
		}

		return $this->success_response( array( 'dismissed' => $duration ) );
	}
}
