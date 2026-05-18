<?php

namespace Pnpnd\ND;

defined( 'ABSPATH' ) or exit( 'No direct script access allowed' );

class Autoload {

	public static function register() {
		spl_autoload_register( array( self::class, 'loadClass' ) );
	}

	/**
	 * PSR-4 style autoloader for the Pnpnd\ND namespace.
	 *
	 * @param string $class Fully qualified class name.
	 */
	private static function loadClass( $class ) {
		$prefixes = self::getAutoloadPaths();

		foreach ( $prefixes as $prefix => $dirs ) {
			if ( strpos( $class, $prefix ) !== 0 ) {
				continue;
			}

			$relativeClass = substr( $class, strlen( $prefix ) );
			$filePath      = str_replace( '\\', DIRECTORY_SEPARATOR, $relativeClass ) . '.php';

			foreach ( $dirs as $dir ) {
				$fullPath = rtrim( $dir, DIRECTORY_SEPARATOR ) . DIRECTORY_SEPARATOR . $filePath;
				if ( is_file( $fullPath ) ) {
					require_once $fullPath;

					return;
				}
			}
		}
	}

	/**
	 * Maps namespace prefixes to their corresponding base directories.
	 *
	 * @return array
	 */
	private static function getAutoloadPaths() {
		return array(
			// Order matters: more specific namespaces first
			'Pnpnd\\ND\\ZipStream\\' => array( PNPND_VENDORS . '/ZipStream' ),
			'Pnpnd\\ND\\Google\\'    => array( PNPND_VENDORS . '/Google' ),
			'Pnpnd\\ND\\Models\\'    => array( PNPND_MODELS ),
			'Pnpnd\\ND\\App\\'       => array( PNPND_APP ),
			'Pnpnd\\ND\\'            => array( PNPND_INCLUDES ),
		);
	}
}
