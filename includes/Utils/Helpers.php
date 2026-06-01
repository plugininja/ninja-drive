<?php

namespace Pnpnd\ND\Utils;

use function in_array;
use function is_array;
use function is_string;

use Pnpnd\ND\App\App;
use Pnpnd\ND\Models\Notices;
use Pnpnd\ND\Models\Widget;

defined( 'ABSPATH' ) || exit();

class Helpers {

	public static function deactivateAndNotify( $message ) {
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

	public static function checkPluginRequirements() {
		if ( version_compare( get_bloginfo( 'version' ), PNPND_WP_VERSION, '<' ) ) {
			/* translators: %s: Minimum required WordPress version */
			self::deactivateAndNotify( sprintf( __( 'WordPress %s or higher is required.', 'ninja-drive' ), PNPND_WP_VERSION ) );
		}

		if ( version_compare( PHP_VERSION, PNPND_PHP_VERSION, '<' ) ) {
			/* translators: %s: Minimum required PHP version */
			self::deactivateAndNotify( sprintf( __( 'PHP %s or higher is required.', 'ninja-drive' ), PNPND_PHP_VERSION ) );
		}
	}

	public static function getSettings( array $keys = array(), $sensitive = 'mask' ) {
		$savedSettings = get_option( PNPND_OPTIONS_NAME );

		$defaultSettings = pnpndGetDefaultSettings();

		$settings = wp_parse_args( $savedSettings, $defaultSettings );

		$settings = self::sanitizeRecursiveSettings( $settings, $defaultSettings, $sensitive );

		if ( empty( $keys ) ) {
			return $settings;
		}

		$filteredSettings = array();
		foreach ( $keys as $key ) {
			if ( array_key_exists( $key, $settings ) ) {
				$filteredSettings[ $key ] = $settings[ $key ];
			}
		}

		return $filteredSettings;
	}

	public static function getSetting( $key = null, $defaultValue = null, $sensitive = 'mask' ) {
		$settings = self::getSettings( array(), $sensitive );

		if ( $key === null ) {
			return $settings;
		}

		if ( strpos( $key, '.' ) !== false ) {
			$keys  = explode( '.', $key );
			$value = $settings;

			foreach ( $keys as $innerKey ) {
				if ( ! is_array( $value ) || ! array_key_exists( $innerKey, $value ) ) {
					return $defaultValue;
				}
				$value = $value[ $innerKey ];
			}

			return $value;
		}

		return $settings[ $key ] ?? $defaultValue;
	}

	public static function updateSetting( $key, $value ) {
		if ( empty( $key ) ) {
			return false;
		}

		$settings = self::getSettings();

		if ( strpos( $key, '.' ) !== false ) {
			$keys = explode( '.', $key );
			$temp = &$settings;

			foreach ( $keys as $innerKey ) {
				if ( ! is_array( $temp ) ) {
					return false;
				}
				if ( ! array_key_exists( $innerKey, $temp ) ) {
					$temp[ $innerKey ] = array();
				}
				$temp = &$temp[ $innerKey ];
			}

			$temp = $value;
		} else {
			$settings[ $key ] = $value;
		}

		return self::updateSettings( $settings );
	}

	public static function updateSettings( $settings ) {
		if ( ! is_array( $settings ) ) {
			return false;
		}

		$defaultSettings  = pnpndGetDefaultSettings();
		$existingSettings = get_option( PNPND_OPTIONS_NAME, array() );
		$validateDefault  = self::sanitizeRecursiveSettings( $existingSettings, $defaultSettings, 'decode' );

		$validateData = self::sanitizeRecursiveSettings( $settings, $validateDefault, 'encode' );

		return update_option( PNPND_OPTIONS_NAME, $validateData );
	}

	private static function sanitizeRecursiveSettings( array $settings, array $defaultSettings, $sensitive = 'encode' ): array {
		$sanitized = array();
		foreach ( $defaultSettings as $key => $value ) {

			if ( is_array( $value ) ) {

				if ( self::isSequentialArray( $value ) || ( empty( $value ) && self::isSequentialArray( $settings[ $key ] ) ) ) {
					$sanitized[ $key ] = array_key_exists( $key, $settings ) && is_array( $settings[ $key ] )
							? array_values( $settings[ $key ] )
							: $value;

				} else {
					$sanitized[ $key ] = array_key_exists( $key, $settings ) && is_array( $settings[ $key ] ) ? self::sanitizeRecursiveSettings( wp_parse_args( $settings[ $key ], $value ), $value, $sensitive ) : $value;
				}
			} else {

				if ( 'redirectUri' === $key ) {
					$sanitized[ $key ] = PNPND_REDIRECT_URI;
					continue;
				} elseif ( 'appClientSecret' === $key ) {
					if ( $sensitive === 'encode' ) {
						$sanitized[ $key ] = ( strpos( $settings[ $key ], '******' ) !== false ) ? self::encode( $value ) : self::encode( $settings[ $key ] ?? '' );
					} elseif ( $sensitive === 'mask' ) {
						$decodedAppSecret = self::decode( $settings[ $key ] ?? '' );
						$masked           = str_repeat( '*', max( 0, strlen( $decodedAppSecret ) - 4 ) ) . substr( $decodedAppSecret, -4 );

						$sanitized[ $key ] = $masked;
					} elseif ( $sensitive === 'decode' ) {
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

	private static function isSequentialArray( array $array ): bool {
		return array_keys( $array ) === range( 0, count( $array ) - 1 );
	}

	public static function recursiveMap( $data ) {
		if ( is_array( $data ) ) {
			foreach ( $data as $key => $value ) {
				$data[ $key ] = self::recursiveMap( $value );
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

	public static function validateWidgetKey( $widgetId, $fileKey ) {
		$allowedFileKeys = Widget::getInstance()->getWidget( $widgetId, 'data.source.fileKeys' );

		if ( is_wp_error( $allowedFileKeys ) || empty( $allowedFileKeys ) ) {
			Notices::getInstance()->add(
				array(
					'type'        => 'error',
					'title'       => 'Widget file keys not found',
					'description' => "No file keys found for widget ID: {$widgetId}",
				)
			);

			return false;
		}

		$filteredKeys = array();
		foreach ( $allowedFileKeys as $item ) {
			if ( isset( $item['fileKey'] ) ) {
				$filteredKeys[] = $item['fileKey'];
			}
		}

		if ( empty( $filteredKeys ) ) {
			Notices::getInstance()->add(
				array(
					'type'        => 'error',
					'title'       => 'Widget file keys empty',
					'description' => "No valid file keys found for widget ID: {$widgetId}",
				)
			);

			return false;
		}

		if ( empty( $fileKey ) || $fileKey === '/' || $fileKey === 'my-drive' ) {
			return $filteredKeys;
		}

		$validate = self::validateFileKey( $fileKey, $filteredKeys );
		if ( is_wp_error( $validate ) || $validate === false ) {
			return false;
		}

		return $fileKey;
	}

	public static function formatDateTime( $timestamp, $isShort = true ) {
		$localTime = get_date_from_gmt( gmdate( 'Y-m-d H:i:s', $timestamp ) );
		$now       = time();

		if ( ! $isShort ) {
			return date_i18n( get_option( 'date_format' ) . ' ' . get_option( 'time_format' ), strtotime( $localTime ) );
		}

		if ( $timestamp > ( $now - 86400 ) ) {
			return date_i18n( get_option( 'time_format' ), strtotime( $localTime ) );
		} elseif ( $timestamp > strtotime( 'first day of january this year' ) ) {
			return date_i18n( str_replace( array( ', Y', ',Y', 'Y-', '-Y', '/Y', 'Y/', ' Y' ), '', get_option( 'date_format' ) ), strtotime( $localTime ) );
		} else {
			return date_i18n( get_option( 'date_format' ), strtotime( $localTime ) );
		}
	}

	public static function encode( string $input ) {
		$uuid = get_option( 'pnpnd_encryption_key', 'pnpnd' );
		$key  = hash( 'sha256', $uuid, true );

		if ( function_exists( 'sodium_crypto_secretbox' ) ) {
			return self::sodiumEncrypt( $input, $key );
		}

		return self::opensslEncrypt( $input, $key );
	}

	public static function decode( string $input ) {
		$uuid = get_option( 'pnpnd_encryption_key', 'pnpnd' );
		$key  = hash( 'sha256', $uuid, true );

		// Legacy format detection
		if ( strpos( $input, 'PNPND' ) === 0 && strpos( $input, 'PNPNDSEC' ) !== 0 ) {
			// Old format - XOR encryption
			return self::legacyDecode( $input );
		}

		if ( function_exists( 'sodium_crypto_secretbox' ) ) {
			return self::sodiumDecrypt( $input, $key );
		}

		return self::opensslDecrypt( $input, $key );
	}

	private static function sodiumEncrypt( string $input, string $key ): string {
		$nonce      = random_bytes( SODIUM_CRYPTO_SECRETBOX_NONCEBYTES );
		$ciphertext = sodium_crypto_secretbox( $input, $nonce, $key );

		return 'PNPNDSEC' . base64_encode( $nonce . $ciphertext );
	}

	private static function sodiumDecrypt( string $input, string $key ) {
		if ( strpos( $input, 'PNPNDSEC' ) !== 0 ) {
			return false;
		}

		$data = base64_decode( substr( $input, 8 ) );
		if ( $data === false ) {
			return false;
		}

		$nonce      = substr( $data, 0, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES );
		$ciphertext = substr( $data, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES );

		return sodium_crypto_secretbox_open( $ciphertext, $nonce, $key );
	}

	private static function opensslEncrypt( string $input, string $key ) {
		$nonce      = random_bytes( 12 );
		$ciphertext = openssl_encrypt(
			$input,
			'aes-256-gcm',
			$key,
			OPENSSL_RAW_DATA,
			$nonce
		);

		if ( $ciphertext === false ) {
			return false;
		}

		$tag        = substr( $ciphertext, -16 );
		$ciphertext = substr( $ciphertext, 0, -16 );

		return 'PNPNDSEC' . base64_encode( $nonce . $ciphertext . $tag );
	}

	private static function opensslDecrypt( string $input, string $key ) {
		if ( strpos( $input, 'PNPNDSEC' ) !== 0 ) {
			return false;
		}

		$data = base64_decode( substr( $input, 8 ) );
		if ( $data === false ) {
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

	private static function legacyDecode( string $input, ?string $key = null ) {
		if ( null === $key ) {
			$key = get_option( 'pnpnd_encryption_key', 'pnpnd' );
		}

		$prefix       = 'PNPND';
		$prefixLength = strlen( $prefix );

		if ( substr( $input, 0, $prefixLength ) === $prefix ) {
			$input = substr( $input, $prefixLength );
		} else {
			return false;
		}

		$xorEncoded = hex2bin( $input );
		if ( $xorEncoded === false ) {
			return false;
		}

		$keyLength     = strlen( $key );
		$base64Encoded = '';
		for ( $i = 0, $len = strlen( $xorEncoded ); $i < $len; $i++ ) {
			$base64Encoded .= chr( ord( $xorEncoded[ $i ] ) ^ ord( $key[ $i % $keyLength ] ) );
		}

		return base64_decode( $base64Encoded );
	}

	public static function validateFileKey( $targetFileKey, $allowedKeys ) {
		if ( in_array( $targetFileKey, $allowedKeys, true ) ) {
			return true;
		}

		$breadcrumbTrail = App::getInstance()->getBreadcrumbByKey( $targetFileKey );

		if ( empty( $breadcrumbTrail ) ) {
			Notices::getInstance()->add(
				array(
					'type'        => 'error',
					'title'       => 'File key not found',
					'description' => "No breadcrumb found for file key: {$targetFileKey}",
				)
			);

			return false;
		}

		$breadcrumbKeys = array_column( $breadcrumbTrail, 'fileKey' );
		$checkedParents = array();

		foreach ( $breadcrumbKeys as $parentKey ) {
			$checkedParents[] = $parentKey;

			if ( in_array( $parentKey, $allowedKeys, true ) ) {
				return array_filter( $breadcrumbTrail, fn ( $crumb ) => in_array( $crumb['fileKey'], $checkedParents, true ) );
			}
		}

		return false;
	}

	public static function hasWidgetPermission( $widgetId, $action, $key = null ) {

		if ( empty( $widgetId ) || empty( $action ) ) {
			return false;
		}

		$widget = Widget::getInstance()->getWidget( $widgetId );
		$type   = $widget['type'] ?? '';

		if ( ! empty( $key ) && '/' !== $key && $key !== 'my-drive' ) {
			$fileKeys = array();

			$fileKey_thumbnailKey = $widget['data']['source']['fileKeys'] ?? array();
			if ( is_wp_error( $fileKey_thumbnailKey ) || empty( $fileKey_thumbnailKey ) ) {
				return false;
			}

			foreach ( $fileKey_thumbnailKey as $item ) {
				if ( isset( $item['fileKey'] ) ) {
					if ( $action === 'thumbnail' && isset( $item['thumbnailKey'] ) && $item['thumbnailKey'] === $key ) {
						return true;
					}
					$fileKeys[] = $item['fileKey'];
				}
			}

			if ( ! self::validateFileKey( $key, $fileKeys ) ) {
				return false;
			}

			if ( $action === 'thumbnail' || $action === 'getFolder' ) {
				return true;
			}
		}

		// Special case for previewing self type widgets
		if ( 'preview' === $action && in_array( $type, array( 'embed-documents' ), true ) ) {
			return true;
		}

		return false;
	}

	public static function checkLifeTime( $updatedAt ) {
		$lifeTime = (float) get_option( 'pnpnd_thumbnail_lifetime', 1 );

		$lifeTime = intval( apply_filters( 'pnpnd_thumbnail_lifetime', $lifeTime ) );

		$lifeTime *= HOUR_IN_SECONDS;

		if ( $lifeTime ) {
			$currentTime = current_time( 'mysql' );

			$fileTime         = strtotime( $updatedAt );
			$currentTimestamp = strtotime( $currentTime );
			$fileLifeTime     = $fileTime + $lifeTime;
			$diff             = $fileLifeTime - $currentTimestamp;

			return max( 0, $diff );
		}

		return 0;
	}
}
