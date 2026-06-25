<?php

namespace Pnpnd\ND\API\Controllers;

use Pnpnd\ND\API\Base_Controller;
use Pnpnd\ND\Utils\Helpers;
use WP_Error;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class Settings extends Base_Controller {

	public function __construct() {
		parent::__construct( 'pnpnd/v1', 'settings' );
	}

	public function manage_permission( WP_REST_Request $request ) {
		if ( $this->has_permission() ) {
			return true;
		}

		return new WP_Error( 'forbidden', 'You do not have permission.', array( 'status' => 403 ) );
	}

	public function register_routes(): void {
		register_rest_route(
			$this->namespace,
			$this->rest_base,
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_settings' ),
					'permission_callback' => array( $this, 'manage_permission' ),
					'args'                => array(),
				),
				array(
					'methods'             => WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'update_settings' ),
					'permission_callback' => array( $this, 'manage_permission' ),
					'args'                => $this->get_update_params(),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			"{$this->rest_base}/(?P<key>accounts|advanced|appearance|integrations|tools)",
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_setting' ),
				'permission_callback' => array( $this, 'manage_permission' ),
				'args'                => array(
					'key' => array(
						'required'    => true,
						'enum'        => array( 'accounts', 'advanced', 'appearance', 'integrations', 'tools' ),
						'description' => 'Setting key to retrieve',
					),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			"{$this->rest_base}/bulk",
			array(
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'bulk_update_settings' ),
				'permission_callback' => array( $this, 'manage_permission' ),
				'args'                => array(
					'operations' => array(
						'required'    => true,
						'type'        => 'array',
						'description' => 'Array of operations to perform',
					),
				),

			)
		);

		register_rest_route(
			$this->namespace,
			"{$this->rest_base}/reset",
			array(
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'reset_settings' ),
				'permission_callback' => array( $this, 'manage_permission' ),
				'args'                => array(
					'keys' => array(
						'required'    => false,
						'type'        => 'array',
						'description' => 'Specific keys to reset (empty = reset all)',
					),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			"{$this->rest_base}/validate",
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'validate_settings_endpoint' ),
				'permission_callback' => array( $this, 'manage_permission' ),
				'args'                => array(
					'settings' => array(
						'required'    => true,
						'type'        => 'object',
						'description' => 'Settings to validate',
					),
				),
			)
		);

	}

	public function get_settings( WP_REST_Request $request ): WP_REST_Response {
		try {
			$defaults         = $this->get_default_settings();
			$current_settings = get_option( PNPND_OPTIONS_NAME, $defaults );

			[$merged_settings, $diff_keys] = $this->merge_with_defaults( $current_settings, $defaults );

			if ( ! empty( $merged_settings['accounts']['app_client_secret'] ) ) {
				$decoded_secret = Helpers::decode( $merged_settings['accounts']['app_client_secret'] );

				$musk = array_fill( 0, strlen( $decoded_secret ) - 4, '*' );
				$merged_settings['accounts']['app_client_secret'] = implode( '', $musk ) . substr( $decoded_secret, - 4 );
			}

			return $this->success_response(
				array(
					'defaults' => $defaults,
					'current'  => $merged_settings,
				)
			);

		} catch ( \Exception $e ) {
			return $this->handle_exception( $e, 'Failed to retrieve settings' );
		}
	}

	public function get_setting( WP_REST_Request $request ): WP_REST_Response {
		try {
			$key              = $request->get_param( 'key' );
			$defaults         = $this->get_default_settings();
			$current_settings = get_option( PNPND_OPTIONS_NAME, $defaults );

			if ( ! array_key_exists( $key, $current_settings ) ) {
				return $this->error_response( "Setting key '{$key}' not found", self::HTTP_NOT_FOUND );
			}

			if ( ! empty( $current_settings[ $key ]['app_client_secret'] ) ) {
				$decoded_secret = Helpers::decode( $current_settings[ $key ]['app_client_secret'] );

				$musk = array_fill( 0, strlen( $decoded_secret ) - 4, '*' );
				$current_settings[ $key ]['app_client_secret'] = implode( '', $musk ) . substr( $decoded_secret, - 4 );
			}

			return $this->success_response(
				array(
					'key'     => $key,
					'value'   => $current_settings[ $key ],
					'default' => $defaults[ $key ] ?? null,
				)
			);

		} catch ( \Exception $e ) {
			return $this->handle_exception( $e, 'Failed to retrieve setting' );
		}
	}

	public function update_settings( WP_REST_Request $request ): WP_REST_Response {
		try {
			$new_settings = $request->get_param( 'settings' );

			if ( empty( $new_settings ) || ! is_array( $new_settings ) ) {
				return $this->error_response( 'Settings parameter is required and must be an array', self::HTTP_BAD_REQUEST );
			}

			$defaults         = $this->get_default_settings();
			$current_settings = get_option( PNPND_OPTIONS_NAME, $defaults );

			$validated_settings = $this->validate_and_sanitize_settings( $new_settings, $defaults );

			if ( ! empty( $validated_settings['accounts']['app_client_secret'] ) ) {
				if ( strpos( $validated_settings['accounts']['app_client_secret'], '****' ) !== false ) {
					$validated_settings['accounts']['app_client_secret'] = $current_settings['accounts']['app_client_secret'] ?? '';
				} else {
					$validated_settings['accounts']['app_client_secret'] = Helpers::encode( $validated_settings['accounts']['app_client_secret'] );
				}
			}

			[$updated_settings, $diff_keys] = $this->deep_merge( $current_settings, $validated_settings );

			$result = update_option( PNPND_OPTIONS_NAME, $updated_settings );

			$verification = get_option( PNPND_OPTIONS_NAME );
			if ( $verification !== $updated_settings && ! $result ) {
				return $this->error_response( 'Failed to update settings', self::HTTP_INTERNAL_SERVER_ERROR );
			}

			if ( ! empty( $updated_settings['accounts']['app_client_secret'] ) ) {
				$decoded_secret = Helpers::decode( $updated_settings['accounts']['app_client_secret'] );

				$musk = array_fill( 0, strlen( $decoded_secret ) - 4, '*' );
				$updated_settings['accounts']['app_client_secret'] = implode( '', $musk ) . substr( $decoded_secret, - 4 );
			}

			return $this->success_response(
				array(
					'settings' => $updated_settings,
					'updated'  => $diff_keys,
				),
				'Settings updated successfully'
			);

		} catch ( \InvalidArgumentException $e ) {
			return $this->error_response( $e->getMessage(), self::HTTP_BAD_REQUEST );
		} catch ( \Exception $e ) {
			return $this->handle_exception( $e, 'Failed to update settings' );
		}
	}

	public function bulk_update_settings( WP_REST_Request $request ): WP_REST_Response {
		try {
			$operations = $request->get_param( 'operations' );

			if ( empty( $operations ) || ! is_array( $operations ) ) {
				return $this->error_response( 'Operations parameter is required and must be an array', self::HTTP_BAD_REQUEST );
			}

			$defaults         = $this->get_default_settings();
			$current_settings = get_option( PNPND_OPTIONS_NAME, $defaults );
			$results          = array();
			$errors           = array();
			$updated_settings = $current_settings;

			foreach ( $operations as $index => $operation ) {
				try {
					$result    = $this->process_bulk_operation( $operation, $current_settings, $defaults );
					$results[] = $result;

					if ( 'success' === $result['status'] && isset( $result['data'] ) ) {
						[$updated_settings, $diff_keys] = $this->deep_merge( $current_settings, $result['data'] );

						if ( ! empty( $updated_settings['accounts']['app_client_secret'] ) ) {
							if ( strpos( $updated_settings['accounts']['app_client_secret'], '****' ) !== false ) {
								$updated_settings['accounts']['app_client_secret'] = $current_settings['accounts']['app_client_secret'];
							} else {
								$updated_settings['accounts']['app_client_secret'] = Helpers::encode( $updated_settings['accounts']['app_client_secret'] );
							}
						}
					}
				} catch ( \Exception $e ) {
					$errors[] = array(
						'index'     => $index,
						'operation' => $operation,
						'error'     => $e->getMessage(),
					);
				}
			}

			if ( empty( $errors ) ) {
				update_option( PNPND_OPTIONS_NAME, $updated_settings );

				return $this->success_response(
					array(
						'results'  => $results,
						'settings' => $updated_settings,
					),
					'All bulk operations completed successfully'
				);
			}

			return $this->error_response(
				'Some bulk operations failed',
				self::HTTP_BAD_REQUEST,
				array(
					'results' => $results,
					'errors'  => $errors,
				)
			);

		} catch ( \Exception $e ) {
			return $this->handle_exception( $e, 'Bulk operation failed' );
		}
	}

	public function reset_settings( WP_REST_Request $request ): WP_REST_Response {
		try {
			$keys_to_reset = $request->get_param( 'keys' );
			$defaults      = $this->get_default_settings();

			if ( empty( $keys_to_reset ) ) {
				update_option( PNPND_OPTIONS_NAME, $defaults );

				return $this->success_response(
					array(
						'settings' => $defaults,
						'reset'    => 'all',
					),
					'All settings reset to defaults'
				);
			}

			$current_settings = get_option( PNPND_OPTIONS_NAME, $defaults );
			$updated_settings = $current_settings;
			$reset_keys       = array();

			foreach ( $keys_to_reset as $key ) {
				if ( array_key_exists( $key, $defaults ) ) {
					$updated_settings[ $key ] = $defaults[ $key ];
					$reset_keys[]             = $key;
				}
			}

			if ( empty( $reset_keys ) ) {
				return $this->error_response( 'No valid keys provided for reset', self::HTTP_BAD_REQUEST );
			}

			update_option( PNPND_OPTIONS_NAME, $updated_settings );

			return $this->success_response(
				array(
					'settings' => $updated_settings,
					'reset'    => $reset_keys,
				),
				'Selected settings reset to defaults'
			);

		} catch ( \Exception $e ) {
			return $this->handle_exception( $e, 'Failed to reset settings' );
		}
	}

	public function validate_settings_endpoint( WP_REST_Request $request ): WP_REST_Response {
		try {
			$settings = $request->get_param( 'settings' );
			$defaults = $this->get_default_settings();

			$validated = $this->validate_and_sanitize_settings( $settings, $defaults );

			return $this->success_response(
				array(
					'valid'    => true,
					'settings' => $validated,
				),
				'Settings are valid'
			);

		} catch ( \InvalidArgumentException $e ) {
			return $this->error_response(
				$e->getMessage(),
				self::HTTP_BAD_REQUEST,
				array(
					'valid' => false,
				)
			);
		} catch ( \Exception $e ) {
			return $this->handle_exception( $e, 'Validation failed' );
		}
	}

	private function process_bulk_operation( array $operation, array $current_settings, array $defaults ): array {
		$action = $operation['action'] ?? null;
		$key    = $operation['key'] ?? null;
		$value  = $operation['value'] ?? null;

		if ( ! $action ) {
			throw new \InvalidArgumentException( 'Operation action is required' );
		}

		switch ( $action ) {
			case 'set':
				if ( ! $key ) {
					throw new \InvalidArgumentException( 'Key is required for set operation' );
				}

				$validated = $this->validate_and_sanitize_settings( array( $key => $value ), $defaults );

				return array(
					'status' => 'success',
					'action' => 'set',
					'key'    => $key,
					'data'   => $validated,
				);

			case 'delete':
				if ( ! $key ) {
					throw new \InvalidArgumentException( 'Key is required for delete operation' );
				}

				return array(
					'status' => 'success',
					'action' => 'delete',
					'key'    => $key,
					'data'   => array( $key => $defaults[ $key ] ?? null ),
				);

			case 'reset':
				if ( ! $key ) {
					throw new \InvalidArgumentException( 'Key is required for reset operation' );
				}

				if ( ! array_key_exists( $key, $defaults ) ) {
					throw new \InvalidArgumentException( esc_html( "Invalid setting key for reset: {$key}" ) );
				}

				return array(
					'status' => 'success',
					'action' => 'reset',
					'key'    => $key,
					'data'   => array( $key => $defaults[ $key ] ),
				);

			default:
				throw new \InvalidArgumentException( esc_html( "Invalid operation action: {$action}" ) );
		}
	}

	private function validate_and_sanitize_settings( array $settings, array $defaults ): array {
		$validated = array();

		foreach ( $settings as $key => $value ) {
			if ( ! array_key_exists( $key, $defaults ) ) {
				throw new \InvalidArgumentException( esc_html( "Invalid setting key: {$key}" ) );
			}

			$validated[ $key ] = $this->sanitize_setting_value( $key, $value, $defaults[ $key ] );
		}

		return $validated;
	}

	private function sanitize_setting_value( string $key, $value, $default_value ) {
		if ( is_array( $default_value ) ) {
			if ( ! is_array( $value ) ) {
				throw new \InvalidArgumentException( esc_html( "Setting '{$key}' must be an array" ) );
			}

			$sanitized = array();
			foreach ( $value as $sub_key => $sub_value ) {
				if ( isset( $default_value[ $sub_key ] ) ) {
					$sanitized[ $sub_key ] = $this->sanitize_setting_value( "{$key}.{$sub_key}", $sub_value, $default_value[ $sub_key ] );
				} else {
					$sanitized[ $sub_key ] = $this->sanitize_value( $sub_value );
				}
			}

			return $sanitized;
		}

		if ( is_bool( $default_value ) ) {
			return (bool) $value;
		}

		if ( is_int( $default_value ) ) {
			return (int) $value;
		}

		if ( is_string( $default_value ) ) {
			if ( 'appearance.customCSS' === $key ) {
				return trim( sanitize_textarea_field( $value ) );
			}

			return sanitize_text_field( $value );
		}

		return $this->sanitize_value( $value );
	}

	private function sanitize_value( $value ) {
		if ( is_string( $value ) ) {
			return sanitize_text_field( $value );
		}
		if ( is_bool( $value ) || is_int( $value ) || is_float( $value ) ) {
			return $value;
		}
		if ( is_array( $value ) ) {
			return array_map( array( $this, 'sanitize_value' ), $value );
		}
		if ( null === $value ) {
			return null;
		}

		return sanitize_text_field( (string) $value );
	}

	private function deep_merge( array $original, array $changes, string $prefix = '' ): array {
		$diff_keys = array();

		foreach ( $changes as $key => $value ) {

			$dot_key = '' === $prefix ? $key : "{$prefix}.{$key}";

			if (
				isset( $original[ $key ] ) &&
				is_array( $value ) &&
				is_array( $original[ $key ] ) &&
				$this->is_assoc( $value ) &&
				$this->is_assoc( $original[ $key ] )
			) {
				[$original[ $key ], $child_diff] = $this->deep_merge( $original[ $key ], $value, $dot_key );

				$diff_keys = array_merge( $diff_keys, $child_diff );
			} else {
				if ( ! array_key_exists( $key, $original ) || $original[ $key ] !== $value ) {
					$diff_keys[] = $dot_key;
				}

				$original[ $key ] = $value;
			}
		}

		return array( $original, $diff_keys );
	}

	private function is_assoc( array $arr ): bool {
		return array() !== $arr && array_keys( $arr ) !== range( 0, count( $arr ) - 1 );
	}

	private function merge_with_defaults( array $current, array $defaults ): array {
		return $this->deep_merge( $defaults, $current );
	}

	private function get_default_settings(): array {
		return function_exists( 'pnpnd_get_default_settings' )
			? pnpnd_get_default_settings()
			: array();
	}

	public function get_item_schema(): array {
		$schema               = parent::get_item_schema();
		$schema['title']      = 'settings';
		$schema['properties'] = array(
			'defaults' => array(
				'description' => __( 'Default settings values.', 'ninja-drive' ),
				'type'        => 'object',
				'context'     => array( 'view', 'edit' ),
				'readonly'    => true,
			),
			'current'  => array(
				'description' => __( 'Current settings values.', 'ninja-drive' ),
				'type'        => 'object',
				'context'     => array( 'view', 'edit' ),
				'properties'  => array(
					'accounts'     => array(
						'type'       => 'object',
						'properties' => array(
							'connection_type'   => array( 'type' => 'string' ),
							'app_client_id'     => array( 'type' => 'string' ),
							'app_client_secret' => array( 'type' => 'string' ),
							'redirect_uri'      => array( 'type' => 'string' ),
						),
					),
					'advanced'     => array(
						'type'       => 'object',
						'properties' => array(
							'allow_dot_extension'      => array( 'type' => 'boolean' ),
							'delete_data_on_uninstall' => array( 'type' => 'boolean' ),
						),
					),
					'appearance'   => array(
						'type'       => 'object',
						'properties' => array(
							'preloader'     => array( 'type' => 'integer' ),
							'primary_color' => array( 'type' => 'string' ),
							'custom_css'    => array( 'type' => 'string' ),
						),
					),
					'integrations' => array(
						'type'       => 'object',
						'properties' => array(
							'active_integrations' => array(
								'type'  => 'array',
								'items' => array( 'type' => 'string' ),
							),
							'media_library'       => array( 'type' => 'object' ),
						),
					),
					'tools'        => array( 'type' => 'object' ),
					'menu'         => array( 'type' => 'string' ),
				),
			),
		);

		return $schema;
	}

	private function get_update_params(): array {
		return array(
			'settings' => array(
				'required'          => true,
				'type'              => 'object',
				'description'       => 'Plugin settings to update',
				'validate_callback' => function ( $param ) {
					return is_array( $param );
				},
			),
		);
	}

	public function syncing__premium_only( WP_REST_Request $request ): WP_REST_Response {
		try {

			$auto_sync = \Pnpnd\ND\AutoSync__premium_only::get_instance();

			$auto_sync->run_cron_task();

			return $this->success_response(
				array(
					'message' => 'Auto sync executed successfully',
				)
			);

		} catch ( \Exception $e ) {
			return $this->handle_exception( $e, 'Failed to retrieve syncing intervals' );
		}
	}
}
