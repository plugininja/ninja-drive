<?php

namespace Pnpnd\ND;

defined( 'ABSPATH' ) or exit( 'No direct script access allowed' );

final class Autoloader {

	private static ?array $autoload_paths = null;

	public static function register() {
		spl_autoload_register( array( self::class, 'load_class' ) );
	}

	private static function load_class( string $class_name ) {
		$prefixes = self::get_autoload_paths();

		foreach ( $prefixes as $prefix => $dirs ) {
			if ( ! self::class_starts_with( $class_name, $prefix ) ) {
				continue;
			}

			$relative_class = substr( $class_name, strlen( $prefix ) );

			if ( empty( $relative_class ) ) {
				continue;
			}

			$file_paths = self::generate_file_paths( $relative_class, $prefix );

			foreach ( $dirs as $dir ) {
				foreach ( $file_paths as $file_path ) {
					$full_path = rtrim( $dir, DIRECTORY_SEPARATOR ) . DIRECTORY_SEPARATOR . $file_path;
					if ( is_file( $full_path ) ) {
						require_once $full_path;

						return;
					}
				}
			}
		}
	}

	private static function generate_file_paths( string $relative_class, string $prefix ): array {
		$parts = explode( '\\', $relative_class );

		if ( empty( $parts ) ) {
			return array();
		}

		$class_name     = array_pop( $parts );
		$namespace_path = implode( DIRECTORY_SEPARATOR, $parts );

		$namespace_path = false !== strpos( $prefix, 'Pnpnd\ND\Google' ) ? $namespace_path : self::to_lowercase_namespace( $namespace_path );

		$namespace_path = empty( $parts ) ? '' : $namespace_path . DIRECTORY_SEPARATOR;

		$paths[] = $namespace_path . $class_name . '.php';

		$kebab_class = self::convert_to_kebab_case( $class_name );
		$prefix      = self::is_trait( $parts, $class_name ) ? 'trait-' : 'class-';
		$paths[]     = $namespace_path . $prefix . $kebab_class . '.php';

		return $paths;
	}

	private static function to_lowercase_namespace( string $namespace_path ): string {
		$parts = explode( DIRECTORY_SEPARATOR, $namespace_path );

		$lowercased_parts = array_map(
			function ( $part ) {
				if ( strpos( $part, '__' ) !== false ) {
					return $part;
				}

				return strtolower( $part );
			},
			$parts
		);

		$lowercased_parts = implode( DIRECTORY_SEPARATOR, $lowercased_parts );

		return $lowercased_parts;
	}

	private static function is_trait( array $namespace_parts, string $class_name ): bool {
		$is_in_traits_namespace  = in_array( 'Traits', $namespace_parts, true );
		$class_starts_with_trait = strpos( $class_name, 'Trait_' ) === 0 || strpos( $class_name, 'Trait__' ) === 0;

		return $is_in_traits_namespace || $class_starts_with_trait;
	}

	private static function convert_to_kebab_case( string $text ): string {
		$text = str_replace( '__', "\x00", $text );
		$text = preg_replace( '/([A-Z]+)/', '-$1', lcfirst( $text ) );
		$text = strtolower( $text );

		$text = str_replace( "\x00", '__', $text );
		$text = str_replace( '_', '-', $text );
		$text = preg_replace( '/-+/', '-', $text );

		return ltrim( $text, '-' );
	}

	private static function class_starts_with( string $haystack, string $needle ): bool {
		return function_exists( 'str_starts_with' )
			? str_starts_with( $haystack, $needle )
			: strpos( $haystack, $needle ) === 0;
	}

	private static function get_autoload_paths(): array {
		if ( null === self::$autoload_paths ) {
			self::$autoload_paths = array(
				'Pnpnd\\ND\\Google\\'  => array( PNPND_VENDORS . '/Google' ),
				'Pnpnd\\ND\\Models\\'  => array( PNPND_MODELS ),
				'Pnpnd\\ND\\App\\'     => array( PNPND_APP ),
				'Pnpnd\\ND\\Updates\\' => array( PNPND_UPDATES ),
				'Pnpnd\\ND\\'          => array( PNPND_INCLUDES ),
			);
		}

		return self::$autoload_paths;
	}
}
