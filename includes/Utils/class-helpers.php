<?php

namespace Pnpnd\ND\Utils;

use Pnpnd\ND\App\App;
use Pnpnd\ND\Notice;
use Pnpnd\ND\Models\Widget;

defined( 'ABSPATH' ) || exit();

class Helpers {

	public static function deactivate_and_notify( $message ) {
		deactivate_plugins( plugin_basename( PNPND_FILE ) );
		wp_die(
			sprintf(
				'<p>%s</p><p><a href="%s">%s</a></p>',
				esc_html( $message ),
				esc_url( admin_url( 'plugins.php' ) ),
				esc_html__( 'Return to the Plugins page', 'ninja-drive' )
			),
			esc_html__( 'Plugin Activation Failed', 'ninja-drive' ),
			array( 'back_link' => true )
		);
	}

	public static function check_plugin_requirements() {
		if ( version_compare( get_bloginfo( 'version' ), PNPND_WP_VERSION, '<' ) ) {
			/* translators: %s: Minimum required WordPress version */
			self::deactivate_and_notify( sprintf( __( 'WordPress %s or higher is required.', 'ninja-drive' ), PNPND_WP_VERSION ) );
		}

		if ( version_compare( PHP_VERSION, PNPND_PHP_VERSION, '<' ) ) {
			/* translators: %s: Minimum required PHP version */
			self::deactivate_and_notify( sprintf( __( 'PHP %s or higher is required.', 'ninja-drive' ), PNPND_PHP_VERSION ) );
		}
	}

	public static function get_settings( array $keys = array(), $sensitive = 'mask' ) {
		$saved_settings = get_option( PNPND_OPTIONS_NAME );

		$default_settings = pnpnd_get_default_settings();

		$settings = wp_parse_args( $saved_settings, $default_settings );

		$settings = self::sanitize_recursive_settings( $settings, $default_settings, $sensitive );

		if ( empty( $keys ) ) {
			return $settings;
		}

		$filtered_settings = array();
		foreach ( $keys as $key ) {
			if ( array_key_exists( $key, $settings ) ) {
				$filtered_settings[ $key ] = $settings[ $key ];
			}
		}

		return $filtered_settings;
	}

	public static function get_setting( $key = null, $default_value = null, $sensitive = 'mask' ) {
		$settings = self::get_settings( array(), $sensitive );

		if ( null === $key ) {
			return $settings;
		}

		if ( strpos( $key, '.' ) !== false ) {
			$keys  = explode( '.', $key );
			$value = $settings;

			foreach ( $keys as $inner_key ) {
				if ( ! is_array( $value ) || ! array_key_exists( $inner_key, $value ) ) {
					return $default_value;
				}
				$value = $value[ $inner_key ];
			}

			return $value;
		}

		return $settings[ $key ] ?? $default_value;
	}

	public static function update_setting( $key, $value ) {
		if ( empty( $key ) ) {
			return false;
		}

		$settings = self::get_settings();

		if ( strpos( $key, '.' ) !== false ) {
			$keys = explode( '.', $key );
			$temp = &$settings;

			foreach ( $keys as $inner_key ) {
				if ( ! is_array( $temp ) ) {
					return false;
				}
				if ( ! array_key_exists( $inner_key, $temp ) ) {
					$temp[ $inner_key ] = array();
				}
				$temp = &$temp[ $inner_key ];
			}

			$temp = $value;
		} else {
			$settings[ $key ] = $value;
		}

		return self::update_settings( $settings );
	}

	public static function update_settings( $settings ) {
		if ( ! is_array( $settings ) ) {
			return false;
		}

		$default_settings  = pnpnd_get_default_settings();
		$existing_settings = get_option( PNPND_OPTIONS_NAME, array() );
		$validate_default  = self::sanitize_recursive_settings( $existing_settings, $default_settings, 'decode' );

		$validate_data = self::sanitize_recursive_settings( $settings, $validate_default, 'encode' );

		return update_option( PNPND_OPTIONS_NAME, $validate_data );
	}

	private static function sanitize_recursive_settings( array $settings, array $default_settings, $sensitive = 'encode' ) {
		$sanitized = array();
		foreach ( $default_settings as $key => $value ) {

			if ( is_array( $value ) ) {

				if ( self::is_sequential_array( $value ) || ( empty( $value ) && self::is_sequential_array( $settings[ $key ] ) ) ) {
					$sanitized[ $key ] = array_key_exists( $key, $settings ) && is_array( $settings[ $key ] )
							? array_values( $settings[ $key ] )
							: $value;

				} else {
					$sanitized[ $key ] = array_key_exists( $key, $settings ) && is_array( $settings[ $key ] ) ? self::sanitize_recursive_settings( wp_parse_args( $settings[ $key ], $value ), $value, $sensitive ) : $value;
				}
			} else {

				if ( 'redirect_uri' === $key ) {
					$sanitized[ $key ] = PNPND_REDIRECT_URI;
					continue;
				} elseif ( 'app_client_secret' === $key ) {
					if ( 'encode' === $sensitive ) {
						$sanitized[ $key ] = ( strpos( $settings[ $key ], '******' ) !== false ) ? self::encode( $value ) : self::encode( $settings[ $key ] ?? '' );
					} elseif ( 'mask' === $sensitive ) {
						$decoded_app_secret = self::decode( $settings[ $key ] ?? '' );
						$masked             = str_repeat( '*', max( 0, strlen( $decoded_app_secret ) - 4 ) ) . substr( $decoded_app_secret, -4 );

						$sanitized[ $key ] = $masked;
					} elseif ( 'decode' === $sensitive ) {
						$sanitized[ $key ] = self::decode( $settings[ $key ] ?? '' );
					} else {
						$sanitized[ $key ] = $settings[ $key ] ?? '';
					}
					continue;
				}

				$sanitized[ $key ] = array_key_exists( $key, $settings ) ? $settings[ $key ] : $value;
			}
		}

		return $sanitized;
	}

	private static function is_sequential_array( array $haystack ) {
		return array_keys( $haystack ) === range( 0, count( $haystack ) - 1 );
	}

	public static function recursive_map( $data ) {
		if ( is_array( $data ) ) {
			foreach ( $data as $key => $value ) {
				$data[ $key ] = self::recursive_map( $value );
			}

			return $data;
		}

		if ( is_string( $data ) ) {
			return sanitize_text_field( wp_unslash( $data ) );
		}

		if ( is_numeric( $data ) ) {
			return $data + 0;
		}

		return $data;
	}

	private static function sanitize_nested_array( $data ) {
		$sanitize_data = array();

		foreach ( $data as $key => $value ) {
			if ( is_string( $value ) ) {
				$sanitize_data[ $key ] = sanitize_text_field( wp_unslash( $value ) );
			} elseif ( is_array( $value ) ) {
				$sanitize_data[ $key ] = self::sanitize_nested_array( $value );
			}
		}

		return $sanitize_data;
	}

	public static function sanitization( $data ) {
		$sanitize_data = '';

		if ( is_array( $data ) ) {

			$sanitize_data = self::sanitize_nested_array( $data );
		} elseif ( is_string( $data ) ) {

			$sanitize_data = sanitize_text_field( wp_unslash( $data ) );
		}

		return $sanitize_data;
	}

	public static function validate_widget_key( $widget_id, $file_key ) {
		$allowed_file_keys = Widget::get_instance()->get_widget( $widget_id, 'data.source.file_keys' );

		if ( is_wp_error( $allowed_file_keys ) || empty( $allowed_file_keys ) ) {
			pnpnd_notify(
				Notice::TYPE_ERROR,
				'Widget file keys not found',
				"No file keys found for widget ID: {$widget_id}"
			);

			return false;
		}

		$filtered_keys = array();
		foreach ( $allowed_file_keys as $item ) {
			if ( isset( $item['file_key'] ) ) {
				$filtered_keys[] = $item['file_key'];
			}
		}

		if ( empty( $filtered_keys ) ) {
			pnpnd_notify(
				Notice::TYPE_ERROR,
				'Widget file keys empty',
				"No valid file keys found for widget ID: {$widget_id}"
			);

			return false;
		}

		if ( empty( $file_key ) || '/' === $file_key || 'my-drive' === $file_key ) {
			return $filtered_keys;
		}

		$validate = self::validate_file_key( $file_key, $filtered_keys );
		if ( is_wp_error( $validate ) || false === $validate ) {
			return false;
		}

		return $file_key;
	}

	public static function format_date_time( $timestamp, $is_short = true ) {
		$local_time = get_date_from_gmt( gmdate( 'Y-m-d H:i:s', $timestamp ) );
		$now        = time();

		if ( ! $is_short ) {
			return date_i18n( get_option( 'date_format' ) . ' ' . get_option( 'time_format' ), strtotime( $local_time ) );
		}

		if ( $timestamp > ( $now - 86400 ) ) {
			return date_i18n( get_option( 'time_format' ), strtotime( $local_time ) );
		} elseif ( $timestamp > strtotime( 'first day of january this year' ) ) {
			return date_i18n( str_replace( array( ', Y', ',Y', 'Y-', '-Y', '/Y', 'Y/', ' Y' ), '', get_option( 'date_format' ) ), strtotime( $local_time ) );
		} else {
			return date_i18n( get_option( 'date_format' ), strtotime( $local_time ) );
		}
	}

	public static function encode( string $input ) {
		$uuid = get_option( 'pnpnd_encryption_key', 'pnpnd' );
		$key  = hash( 'sha256', $uuid, true );

		if ( function_exists( 'sodium_crypto_secretbox' ) ) {
			return self::sodium_encrypt( $input, $key );
		}

		return self::openssl_encrypt( $input, $key );
	}

	public static function decode( string $input ) {
		$uuid = get_option( 'pnpnd_encryption_key', 'pnpnd' );
		$key  = hash( 'sha256', $uuid, true );

		// Legacy format detection
		if ( strpos( $input, 'PNPND' ) === 0 && strpos( $input, 'PNPNDSEC' ) !== 0 ) {
			// Old format - XOR encryption
			return self::legacy_decode( $input );
		}

		if ( function_exists( 'sodium_crypto_secretbox' ) ) {
			return self::sodium_decrypt( $input, $key );
		}

		return self::openssl_decrypt( $input, $key );
	}

	private static function sodium_encrypt( string $input, string $key ) {
		$nonce      = random_bytes( SODIUM_CRYPTO_SECRETBOX_NONCEBYTES );
		$ciphertext = sodium_crypto_secretbox( $input, $nonce, $key );

		return 'PNPNDSEC' . base64_encode( $nonce . $ciphertext );
	}

	private static function sodium_decrypt( string $input, string $key ) {
		if ( strpos( $input, 'PNPNDSEC' ) !== 0 ) {
			return false;
		}

		$data = base64_decode( substr( $input, 8 ) );
		if ( false === $data ) {
			return false;
		}

		$nonce      = substr( $data, 0, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES );
		$ciphertext = substr( $data, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES );

		return sodium_crypto_secretbox_open( $ciphertext, $nonce, $key );
	}

	private static function openssl_encrypt( string $input, string $key ) {
		$nonce      = random_bytes( 12 );
		$ciphertext = openssl_encrypt(
			$input,
			'aes-256-gcm',
			$key,
			OPENSSL_RAW_DATA,
			$nonce
		);

		if ( false === $ciphertext ) {
			return false;
		}

		$tag        = substr( $ciphertext, -16 );
		$ciphertext = substr( $ciphertext, 0, -16 );

		return 'PNPNDSEC' . base64_encode( $nonce . $ciphertext . $tag );
	}

	private static function openssl_decrypt( string $input, string $key ) {
		if ( strpos( $input, 'PNPNDSEC' ) !== 0 ) {
			return false;
		}

		$data = base64_decode( substr( $input, 8 ) );
		if ( false === $data ) {
			return false;
		}

		$nonce      = substr( $data, 0, 12 );
		$ciphertext = substr( $data, 12, -16 );
		$tag        = substr( $data, -16 );

		return openssl_decrypt(
			$ciphertext,
			'aes-256-gcm',
			$key,
			OPENSSL_RAW_DATA,
			$nonce,
			$tag
		);
	}

	private static function legacy_decode( string $input, ?string $key = null ) {
		if ( null === $key ) {
			$key = get_option( 'pnpnd_encryption_key', 'pnpnd' );
		}

		$prefix        = 'PNPND';
		$prefix_length = strlen( $prefix );

		if ( substr( $input, 0, $prefix_length ) === $prefix ) {
			$input = substr( $input, $prefix_length );
		} else {
			return false;
		}

		$xor_encoded = hex2bin( $input );
		if ( false === $xor_encoded ) {
			return false;
		}

		$key_length     = strlen( $key );
		$base64_encoded = '';
		for ( $i = 0, $len = strlen( $xor_encoded ); $i < $len; $i++ ) {
			$base64_encoded .= chr( ord( $xor_encoded[ $i ] ) ^ ord( $key[ $i % $key_length ] ) );
		}

		return base64_decode( $base64_encoded );
	}

	public static function validate_file_key( $target_file_key, $allowed_keys ) {
		if ( in_array( $target_file_key, $allowed_keys, true ) ) {
			return true;
		}

		$breadcrumb_trail = App::get_instance()->get_breadcrumb_by_key( $target_file_key );

		if ( empty( $breadcrumb_trail ) ) {
			pnpnd_notify(
				Notice::TYPE_ERROR,
				'File key not found',
				"No breadcrumb found for file key: {$target_file_key}"
			);

			return false;
		}

		$breadcrumb_keys = array_column( $breadcrumb_trail, 'file_key' );
		$checked_parents = array();

		foreach ( $breadcrumb_keys as $parent_key ) {
			$checked_parents[] = $parent_key;

			if ( in_array( $parent_key, $allowed_keys, true ) ) {
				return array_filter( $breadcrumb_trail, fn ( $crumb ) => in_array( $crumb['file_key'], $checked_parents, true ) );
			}
		}

		return false;
	}

	public static function has_widget_permission( $widget_id, $action, $key = null ) {

		if ( empty( $widget_id ) || empty( $action ) ) {
			return false;
		}

		$widget = Widget::get_instance()->get_widget( $widget_id );
		$type   = $widget['type'] ?? '';

		if ( ! empty( $key ) && '/' !== $key && 'my-drive' !== $key ) {
			$file_keys = array();

			$file_key_thumbnail_key = $widget['data']['source']['file_keys'] ?? array();
			if ( is_wp_error( $file_key_thumbnail_key ) || empty( $file_key_thumbnail_key ) ) {
				return false;
			}

			foreach ( $file_key_thumbnail_key as $item ) {
				if ( isset( $item['file_key'] ) ) {
					if ( 'thumbnail' === $action && isset( $item['thumbnail_key'] ) && $item['thumbnail_key'] === $key ) {
						return true;
					}
					$file_keys[] = $item['file_key'];
				}
			}

			if ( ! self::validate_file_key( $key, $file_keys ) ) {
				return false;
			}

			if ( 'thumbnail' === $action || 'get_folder' === $action ) {
				return true;
			}
		}

		return false;
	}

	public static function check_lifetime( $updated_at ) {
		$lifetime = (float) get_option( 'pnpnd_thumbnail_lifetime', 1 );

		$lifetime = intval( apply_filters( 'pnpnd_thumbnail_lifetime', $lifetime ) );

		$lifetime *= HOUR_IN_SECONDS;

		if ( $lifetime ) {
			$current_time = current_time( 'mysql' );

			$file_time         = strtotime( $updated_at );
			$current_timestamp = strtotime( $current_time );
			$file_lifetime     = $file_time + $lifetime;
			$diff              = $file_lifetime - $current_timestamp;

			return max( 0, $diff );
		}

		return 0;
	}
}
