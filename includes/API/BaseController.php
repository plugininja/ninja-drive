<?php

namespace Pnpnd\ND\API;

use function defined;

defined( 'ABSPATH' ) || exit;

use WP_Error;
use WP_REST_Controller;
use WP_REST_Request;
use WP_REST_Response;

abstract class BaseController extends WP_REST_Controller {

	// HTTP Status Codes
	protected const HTTP_OK                    = 200;
	protected const HTTP_CREATED               = 201;
	protected const HTTP_BAD_REQUEST           = 400;
	protected const HTTP_UNAUTHORIZED          = 401;
	protected const HTTP_FORBIDDEN             = 403;
	protected const HTTP_NOT_FOUND             = 404;
	protected const HTTP_INTERNAL_SERVER_ERROR = 500;

	public function __construct( string $namespace, string $rest_base ) {
		$this->namespace = $namespace;
		$this->rest_base = "/$rest_base";
	}

	public function register_routes(): void {
		_doing_it_wrong(
			__METHOD__,
			'Subclasses must override register_routes().',
			'1.0.0'
		);
	}

	/**
	 * Check permissions - can be overridden by child classes
	 */
	public function hasPermission(): bool {
		return current_user_can( 'manage_options' );
	}

	/**
	 * Create success response
	 */
	protected function successResponse( $data, string $message = 'Success', array $meta = array() ): WP_REST_Response {
		$response_data = array(
			'success' => true,
			'message' => $message,
			'data'    => $data,
		);

		if ( ! empty( $meta ) ) {
			$response_data['meta'] = $meta;
		}

		return new WP_REST_Response( $response_data, self::HTTP_OK );
	}

	/**
	 * Create error response
	 */
	protected function errorResponse( string $message, int $status = self::HTTP_BAD_REQUEST, array $extra = array() ): WP_REST_Response {
		$response_data = array(
			'success' => false,
			'message' => $message,
		);

		if ( ! empty( $extra ) ) {
			$response_data['extra'] = $extra;
		}

		return new WP_REST_Response( $response_data, $status );
	}

	/**
	 * Validate and sanitize request data
	 */
	protected function validateRequestData( WP_REST_Request $request, array $rules = array() ): array {
		$data = $request->get_json_params() ?: $request->get_params();

		// Add your validation logic here
		foreach ( $rules as $field => $rule ) {
			if ( $rule['required'] && ! isset( $data[ $field ] ) ) {
				throw new \InvalidArgumentException( esc_html( "Missing required field: {$field}" ) );
			}
		}

		return $data;
	}

	/**
	 * Handle exceptions and return appropriate response
	 */
	protected function handleException( \Throwable $e, string $default_message = 'An error occurred' ): WP_REST_Response {
		$message = $default_message;
		$status  = self::HTTP_INTERNAL_SERVER_ERROR;
		$extra   = array();

		if ( $e instanceof \InvalidArgumentException ) {
			$message = $e->getMessage();
			$status  = self::HTTP_BAD_REQUEST;
		}

		if ( $e instanceof WP_Error ) {
			$message   = $e->get_error_message() ?: $message;
			$errorCode = $e->get_error_code();
			$status    = is_numeric( $errorCode ) ? (int) $errorCode : self::HTTP_INTERNAL_SERVER_ERROR;
		}

		return $this->errorResponse( $message, $status, $extra );
	}

	public function get_item_schema(): array {
		return array(
			'$schema'    => 'http://json-schema.org/draft-04/schema#',
			'title'      => $this->rest_base,
			'type'       => 'object',
			'properties' => array(),
		);
	}

	public function get_collection_params(): array {
		return array(
			'page'     => array(
				'description'       => __( 'Current page of the collection.', 'ninja-drive' ),
				'type'              => 'integer',
				'default'           => 1,
				'minimum'           => 1,
				'sanitize_callback' => 'absint',
			),
			'per_page' => array(
				'description'       => __( 'Maximum number of items to be returned in result set.', 'ninja-drive' ),
				'type'              => 'integer',
				'default'           => 20,
				'minimum'           => 1,
				'maximum'           => 100,
				'sanitize_callback' => 'absint',
			),
			'order'    => array(
				'description' => __( 'Order sort attribute ascending or descending.', 'ninja-drive' ),
				'type'        => 'string',
				'default'     => 'desc',
				'enum'        => array( 'asc', 'desc' ),
			),
			'orderby'  => array(
				'description' => __( 'Sort collection by parameter.', 'ninja-drive' ),
				'type'        => 'string',
				'default'     => 'updatedAt',
			),
		);
	}

	public function prepare_item_for_response( $item, $request ) {
		return rest_ensure_response( $item );
	}
}
