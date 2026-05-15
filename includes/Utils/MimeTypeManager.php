<?php

namespace Pninja\ND\Utils;

use function in_array;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class MimeTypeManager {

	private static $mimeMap    = null;
	private static $reverseMap = null;

	public const CATEGORY_EXPORT_TYPE = array(
		'document'     => array( 'pdf', 'docx', 'odt', 'rtf', 'txt', 'html', 'epub', 'zip', 'markdown' ),
		'presentation' => array( 'pptx', 'odp', 'pdf', 'txt', 'jpeg', 'png', 'svg' ),
		'spreadsheet'  => array( 'xlsx', 'ods', 'csv', 'tsv', 'pdf', 'zip' ),
		'drawing'      => array( 'png', 'jpeg', 'svg', 'pdf' ),
		'script'       => array( 'json' ),
	);

	public const EXPORT_MIME_TYPE_MAP = array(
		'application/pdf'                                 => 'pdf',
		'application/json'                                => 'json',
		'application/vnd.openxmlformats-officedocument.wordprocessingml.document' => 'docx',
		'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' => 'xlsx',
		'application/vnd.openxmlformats-officedocument.presentationml.presentation' => 'pptx',
		'application/vnd.oasis.opendocument.spreadsheet'  => 'ods',
		'application/vnd.oasis.opendocument.presentation' => 'odp',
		'application/vnd.oasis.opendocument.text'         => 'odt',
		'text/plain'                                      => 'txt',
		'text/csv'                                        => 'csv',
		'image/png'                                       => 'png',
		'image/jpeg'                                      => 'jpeg',
		'image/svg+xml'                                   => 'svg',
		'application/epub+zip'                            => 'epub',
		'application/rtf'                                 => 'rtf',
		'text/markdown'                                   => 'markdown',
		'application/zip'                                 => 'zip',
		'text/html'                                       => 'html',
		'text/tab-separated-values'                       => 'tsv',
	);

	public const EDITOR_MIME_TYPE_MAP = array(
		'application/vnd.google-apps.document'      => 'document',
		'application/vnd.google-apps.spreadsheet'   => 'spreadsheets',
		'application/vnd.google-apps.presentation'  => 'presentation',
		'application/vnd.google-apps.form'          => 'forms',
		'application/vnd.google-apps.drawing'       => 'drawings',
		'application/vnd.google-apps.jam'           => 'jam',
		'application/vnd.google-apps.site'          => 'site',
		'application/vnd.google-apps.map'           => 'maps',
		'application/vnd.google-apps.script'        => 'script',
		'application/vnd.google-apps.script+json'   => 'script',
		'application/vnd.google-apps.script+webapp' => 'script',
		'application/vnd.google-apps.addon'         => 'addon',
		'application/vnd.google-apps.vid'           => 'vid',
	);

	public const DEFAULT_EXPORT_FORMAT = array(
		'document'     => 'docx',
		'presentation' => 'pptx',
		'spreadsheet'  => 'xlsx',
		'drawing'      => 'png',
		'script'       => 'json',
	);

	public const NON_DOWNLOADABLE_TYPES = array( 'form', 'jam', 'map', 'addon', 'vid', 'site', 'shortcut' );

	public static function isExportAble( $extension, $format ) {
		$extension = strtolower( trim( $extension ) );
		self::initializeMaps();

		if ( ! isset( self::CATEGORY_EXPORT_TYPE[ $extension ] ) ) {
			return false;
		}

		return in_array( $format, self::CATEGORY_EXPORT_TYPE[ $extension ] );
	}

	/**
	 * Get MIME type from file extension
	 *
	 * @param string $extension File extension (with or without dot)
	 * @return string MIME type
	 */
	public static function getMimeType( $extension = '' ) {
		if ( empty( $extension ) ) {
			return 'application/octet-stream';
		}

		// Remove dot if present
		$extension = ltrim( strtolower( $extension ), '.' );

		self::initializeMaps();

		return self::$mimeMap[ $extension ] ?? 'application/octet-stream';
	}

	/**
	 * Get file extension(s) from MIME type
	 *
	 * @param string $mimeType MIME type
	 * @param bool   $getAll Return all extensions or just the primary one
	 * @return string|array|null Extension(s) or null if not found
	 */
	public static function getExtension( $mimeType, $getAll = false ) {
		if ( empty( $mimeType ) ) {
			return null;
		}

		$mimeType = strtolower( trim( $mimeType ) );
		self::initializeMaps();

		if ( ! isset( self::$reverseMap[ $mimeType ] ) ) {
			return null;
		}

		$extensions = self::$reverseMap[ $mimeType ];

		return $getAll ? $extensions : $extensions[0];
	}

	/**
	 * Check if file is an image
	 *
	 * @param string $extensionOrMime File path/extension or MIME type
	 * @return bool
	 */
	public static function isImage( $extensionOrMime ) {
		$mime = strpos( $extensionOrMime, '/' ) !== false
			? $extensionOrMime
			: self::getMimeType( $extensionOrMime );

		return strpos( $mime, 'image/' ) === 0;
	}

	/**
	 * Check if file is a video
	 *
	 * @param string $extensionOrMime File path/extension or MIME type
	 * @return bool
	 */
	public static function isVideo( $extensionOrMime ) {
		$mime = strpos( $extensionOrMime, '/' ) !== false
			? $extensionOrMime
			: self::getMimeType( $extensionOrMime );

		return strpos( $mime, 'video/' ) === 0;
	}

	/**
	 * Check if file is audio
	 *
	 * @param string $extensionOrMime File path/extension or MIME type
	 * @return bool
	 */
	public static function isAudio( $extensionOrMime ) {
		$mime = strpos( $extensionOrMime, '/' ) !== false
			? $extensionOrMime
			: self::getMimeType( $extensionOrMime );

		return strpos( $mime, 'audio/' ) === 0;
	}

	/**
	 * Initialize MIME type maps (lazy loading)
	 */
	private static function initializeMaps() {
		if ( self::$mimeMap !== null ) {
			return;
		}

		self::$mimeMap = array(
			// Common images
			'jpg'      => 'image/jpeg',
			'jpeg'     => 'image/jpeg',
			'png'      => 'image/png',
			'gif'      => 'image/gif',
			'svg'      => 'image/svg+xml',
			'bmp'      => 'image/bmp',
			'webp'     => 'image/webp',
			// Common video
			'mp4'      => 'video/mp4',
			'mov'      => 'video/quicktime',
			'avi'      => 'video/x-msvideo',
			'mkv'      => 'video/x-matroska',
			'webm'     => 'video/webm',
			// Common audio
			'mp3'      => 'audio/mpeg',
			'wav'      => 'audio/wav',
			'ogg'      => 'audio/ogg',
			'flac'     => 'audio/flac',
			'aac'      => 'audio/aac',
			// Common documents
			'pdf'      => 'application/pdf',
			'doc'      => 'application/msword',
			'docx'     => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
			'xls'      => 'application/vnd.ms-excel',
			'xlsx'     => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'ppt'      => 'application/vnd.ms-powerpoint',
			'pptx'     => 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
			'txt'      => 'text/plain',
			'csv'      => 'text/csv',
			'rtf'      => 'text/rtf',
			'odt'      => 'application/vnd.oasis.opendocument.text',
			'ods'      => 'application/vnd.oasis.opendocument.spreadsheet',
			'odp'      => 'application/vnd.oasis.opendocument.presentation',
			// Common archives
			'zip'      => 'application/zip',
			'rar'      => 'application/x-rar-compressed',
			'7z'       => 'application/x-7z-compressed',
			'tar'      => 'application/x-tar',
			'gz'       => 'application/gzip',
			// Google Apps MIME types
			'gdoc'     => 'application/vnd.google-apps.document',
			'gslides'  => 'application/vnd.google-apps.presentation',
			'gsheet'   => 'application/vnd.google-apps.spreadsheet',
			'gdraw'    => 'application/vnd.google-apps.drawing',
			'gtable'   => 'application/vnd.google-apps.fusiontable',
			'gform'    => 'application/vnd.google-apps.form',
			'shortcut' => 'application/vnd.google-apps.shortcut',
			// Add more as needed
			'folder'   => 'folder',
		);

		// Build reverse map for MIME type to extensions
		self::$reverseMap = array();
		foreach ( self::$mimeMap as $ext => $mime ) {
			if ( ! isset( self::$reverseMap[ $mime ] ) ) {
				self::$reverseMap[ $mime ] = array();
			}
			self::$reverseMap[ $mime ][] = $ext;
		}
	}
}
