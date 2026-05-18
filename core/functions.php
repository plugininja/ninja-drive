<?php

use Pnpnd\ND\Utils\Helpers;
use Pnpnd\ND\Utils\MimeTypeManager;
use Pnpnd\ND\Widget;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

/**
 * Retrieve an account by its key.
 *
 * @param string $key The key of the account to retrieve.
 * @return \Pnpnd\ND\App\Account|WP_Error
 */
function pnpndGetAccountByKey( $key ) {
	$account = \Pnpnd\ND\App\Accounts::getInstance()->getAccountByKey( $key );

	return $account;
}

/**
 * Retrieve a file by its key.
 *
 * @param string $key The key of the file to retrieve.
 * @return array|WP_Error The file data if found, or null if not found.
 */
function pnpndGetFileByKey( $key ) {
	$file = \Pnpnd\ND\Models\Files::getInstance()->getFileByKey( $key, 'array' );

	return $file;
}

/**
 * Retrieve file IDs from an array of file keys.
 *
 * @param array $keys An array of file keys to search for.
 *
 * @return array|WP_Error An array of file IDs if found, or null if not found.
 */
function pnpndGetFileIdsByKeys( array $keys ) {
	return \Pnpnd\ND\Models\Files::getInstance()->getFileAttributesByKeys( $keys );
}

/**
 * Retrieve selected attributes from files by their keys.
 *
 * @param array $keys An array of file keys to search for.
 * @param array $attributes An array of attributes to return for each file.
 *                          Defaults to ['id'].
 *                          Example: ['id', 'name'].
 *
 * @return WP_Error|array Returns:
 *                        - A flat array if one attribute is requested (e.g., ['id1', 'id2']).
 *                        - An array of associative arrays if multiple attributes are requested.
 *                        Example:
 *                        [
 *                        ['id' => 'abc123', 'name' => 'File A'],
 *                        ['id' => 'def456', 'name' => 'File B']
 *                        ]
 */
function pnpndGetFileAttributesByKeys( array $keys, array $attributes ) {
	return \Pnpnd\ND\Models\Files::getInstance()->getFileAttributesByKeys( $keys, $attributes );
}

/**
 * Retrieves an array of file extensions by the given types.
 *
 * @param array|string|null $keys An array, string, or null if single type of types to filter by. Valid types are:
 *                                - 'folder'
 *                                - 'document'
 *                                - 'code'
 *                                - 'image'
 *                                - 'audio'
 *                                - 'video'
 *                                - 'archive'
 *                                - 'binary_executable'
 *                                - 'all'
 *
 * @return array An array of file extensions if found, or an empty array if not found.
 */
function pnpndGetExtensionGroups( $keys = null ): array {
	if ( is_string( $keys ) ) {
		$keys = array( $keys );
	}

	$groups = array(
		'folder'            => array( 'folder' ),
		'document'          => array( 'spreadsheet', 'document', 'presentation', 'script', 'form', 'drawing', 'xls', 'xlsx', 'doc', 'docx', 'ppt', 'pptx', 'pdf', 'txt', 'csv', 'rtf', 'odt', 'ods', 'odp', 'epub', 'md' ),
		'code'              => array( 'js', 'php', 'py', 'java', 'cs', 'cpp', 'c', 'rb', 'go', 'ts', 'xml', 'json', 'yaml', 'sh' ),
		'image'             => array( 'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff', 'ico' ),
		'audio'             => array( 'mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a' ),
		'video'             => array( 'mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm' ),
		'archive'           => array( 'zip', 'rar', 'tar', 'gz', '7z', 'bz2', 'xz' ),
		'binary_executable' => array( 'exe', 'dll', 'iso', 'bin', 'apk', 'msi' ),
	);

	$downloadable = array_filter( array_merge( ...array_values( $groups ) ), fn ( $ext ) => ! in_array( $ext, MimeTypeManager::NON_DOWNLOADABLE_TYPES, true ) );

	$groups['downloadable'] = array_values( $downloadable );

	if ( null === $keys ) {
		return $groups;
	}

	if ( in_array( 'all', $keys, true ) || empty( $keys ) ) {
		return array_merge( ...array_values( $groups ) );
	}

	// Keep only requested keys
	$filtered = array_intersect_key( $groups, array_flip( $keys ) );

	// Flatten into a single array
	return $filtered ? array_merge( ...array_values( $filtered ) ) : array();
}

/**
 * Retrieves the file extension associated with a given MIME type.
 *
 * @param string $mimeType The MIME type to retrieve the extension for.
 *
 * @return string The file extension associated with the given MIME type,
 *                or 'unknown' if no extension can be determined.
 */
function pnpndGetExtensionByMimeType( string $mimeType ) {
	$map = pnpndGetMimeTypeMap( 'mime2ext' );

	return $map[ $mimeType ] ?? 'unknown';
}

/**
 * Retrieves the MIME type associated with a given file extension.
 *
 * @param string $extension The file extension to retrieve the MIME type for.
 *
 * @return string The MIME type associated with the given extension,
 *                or 'application/octet-stream' if no association can be determined.
 */
function pnpndGetMimeTypeByExtension( string $extension ) {
	$map = pnpndGetMimeTypeMap( 'ext2mime' );

	return $map[ $extension ] ?? 'application/octet-stream';
}

/**
 * Retrieves the MIME types associated with a given set of file types.
 *
 * @param array $types The set of file types to retrieve the MIME types for.
 *
 * @return array The array of MIME types associated with the given set of file types.
 */
function pnpndGetMimeTypesByGroup( array $types ) {
	$extensions = pnpndGetExtensionGroups( $types );
	$map        = pnpndGetMimeTypeMap( 'ext2mime' );

	$mimeTypes = array_filter( array_map( fn ( $ext ) => $map[ $ext ] ?? null, $extensions ) );

	return array_values( array_unique( $mimeTypes ) );
}

/**
 * Retrieves the MIME type mapping array.
 *
 * The returned array has either MIME types as keys and their associated
 * file extensions as values, or the reverse depending on the value of
 * the $type parameter. If $type is 'mime2ext', the array is flipped
 * so that file extensions are keys and MIME types are values.
 *
 * @param string $type The type of mapping to retrieve. Either 'mime2ext'
 *                     or 'ext2mime'.
 *
 * @return array The MIME type mapping array.
 */
function pnpndGetMimeTypeMap( string $type = 'mime2ext' ) {
	static $mimeMap = array(
		'application/vnd.google-apps.folder'        => 'folder',
		'application/vnd.google-apps.spreadsheet'   => 'spreadsheet',
		'application/vnd.google-apps.document'      => 'document',
		'application/vnd.google-apps.presentation'  => 'presentation',
		'application/vnd.google-apps.form'          => 'form',
		'application/vnd.google-apps.drawing'       => 'drawing',
		'application/vnd.google-apps.vid'           => 'vid',
		'application/vnd.google-apps.site'          => 'site',
		'application/vnd.google-apps.map'           => 'map',
		'application/vnd.google-apps.jam'           => 'jam',
		'application/vnd.google-apps.script+json'   => 'script',
		'application/vnd.google-apps.script+webapp' => 'script',
		'application/vnd.google-apps.script'        => 'script',
		'application/vnd.google-apps.addon'         => 'addon',
		'application/vnd.google-apps.shortcut'      => 'shortcut',

		'application/vnd.ms-excel'                  => 'xls',
		'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' => 'xlsx',
		'application/msword'                        => 'doc',
		'application/vnd.openxmlformats-officedocument.wordprocessingml.document' => 'docx',
		'application/vnd.ms-powerpoint'             => 'ppt',
		'application/vnd.openxmlformats-officedocument.presentationml.presentation' => 'pptx',

		'application/pdf'                           => 'pdf',
		'text/plain'                                => 'txt',
		'text/csv'                                  => 'csv',

		'image/jpeg'                                => 'jpg',
		'image/png'                                 => 'png',
		'image/gif'                                 => 'gif',
		'image/webp'                                => 'webp',
		'image/svg+xml'                             => 'svg',

		'application/zip'                           => 'zip',
		'application/x-rar-compressed'              => 'rar',
		'application/x-tar'                         => 'tar',
		'application/gzip'                          => 'gz',

		'audio/mpeg'                                => 'mp3',
		'audio/wav'                                 => 'wav',

		'video/mp4'                                 => 'mp4',
		'video/x-msvideo'                           => 'avi',
	);

	return $type === 'ext2mime' ? array_flip( $mimeMap ) : $mimeMap;
}

function pnpndGetDefaultSettings(): array {
	$settings = array(
		'accounts'                      => array(
			'connectionType'  => 'manual',
			'appClientId'     => '',
			'appClientSecret' => '',
			'redirectUri'     => PNPND_REDIRECT_URI,
		),
		'advanced'                      => array(
			'allowDotExtension'     => false,
			'deleteDataOnUninstall' => false,
		),
		'appearance'                    => array(
			'preloader'    => 1,
			'primaryColor' => '#1F6CFA',
			'customCSS'    => '',
		),
		'integrations'                  => array(
			'activeIntegrations' => array(
				'classicEditor',
				'gutenberg',
				'elementor',
			),
			'mediaLibrary'       => array(
				'folders'         => array(),
				'redirection'     => true,
				'deleteCloudFile' => false,
				'mlHoverPreview'  => false,
			),
		),
		'tools'                         => array(
			'autoSave' => false,
		),

		'createFolderOnRegistration'    => false,
		'privateFolderInAdminDashboard' => false,
		'excludeIncludeFolder'          => false,
		'isEditing'                     => false,
		'draft'                         => null,
		'menu'                          => 'Accounts',
	);

	return $settings;
}

function pnpndGetWidgetDefaultData( string $type ): array {
	if ( ! in_array( $type, Widget::getWidgetsList(), true ) ) {
		return array();
	}

	$data = array(
		'id'          => 'new',
		'status'      => 'active',
		'integration' => null,
		'data'        => array(
			'source'      => array(
				'fileKeys'      => array(),
				'selectedFiles' => array(),
			),
			'filter'      => array(
				'extension' => array(
					'include' => array(),
					// phpcs:ignore WordPressVIPMinimum.Performance.WPQueryParams.PostNotIn_exclude
					'exclude' => array(),
					'all'     => false,
				),
				'name'      => array(
					'include' => '',
					// phpcs:ignore WordPressVIPMinimum.Performance.WPQueryParams.PostNotIn_exclude
					'exclude' => '',
					'all'     => false,
					'applyTo' => array(
						'files'   => true,
						'folders' => true,
					),
				),
			),
			'advanced'    => array(),
			'permissions' => array(
				'passwordProtect' => array(
					'enable'   => false,
					'password' => '',
				),
				'displayFor'      => array(
					'whoCanViewWidget'        => 'everyone',
					'loggedInUserType'        => 'users',
					'displayFor'              => array(),
					'showAccessDeniedMessage' => true,
					'accessDeniedMessage'     => 'You do not have access to this widget.',
				),
			),
		),
	);

	$advancedDefaults = array(
		'width'               => array(
			'value' => 100,
			'unit'  => '%',
		),
		'height'              => array(
			'value' => 100,
			'unit'  => 'auto',
		),
		'theme'               => 'light',
		'borderBoxVisibility' => false,
		'files'               => array(
			'loadingType' => 'load_more',
			'perPage'     => 20,
		),
		'autoFetch'           => array(
			'status'   => false,
			'interval' => 60,
		),
		'sort'                => array(
			'orderBy' => 'name',
			'order'   => 'ASC',
		),
	);

	$permissionBase = array(
		'userAccess'       => 'everyone',
		'loggedInUserType' => 'users',
		'displayFor'       => array(),
	);

	$permissions = array(
		'newFolder' => $permissionBase + array( 'enable' => false ),
		'upload'    => $permissionBase + array(
			'enable'       => false,
			'folderUpload' => false,
		),
		'preview'   => $permissionBase + array(
			'enable'           => false,
			'inline'           => true,
			'popOut'           => false,
			'previewThumbnail' => true,
		),
		'rename'    => $permissionBase + array( 'enable' => false ),
		'download'  => $permissionBase + array(
			'enable'           => false,
			'folderDownload'   => false,
			'multipleDownload' => false,
		),
		'copy'      => $permissionBase + array( 'enable' => false ),
		'move'      => $permissionBase + array( 'enable' => false ),
		'share'     => $permissionBase + array( 'enable' => false ),
		'search'    => $permissionBase + array(
			'enable'         => false,
			'searchLocation' => array(
				'cache'  => true,
				'server' => true,
			),
			'searchScope'    => array(
				'current' => true,
				'global'  => true,
			),
		),
		'delete'    => $permissionBase + array( 'enable' => false ),
	);

	$permissionList = array(
		'newFolder',
		'upload',
		'preview',
		'rename',
		'download',
		'copy',
		'move',
		'share',
		'viewShareLink',
		'delete',
	);

	$notifications = array(
		'enable'          => array(),
		'emailRecipients' => '',
		'skipCurrentUser' => false,
	);

	foreach ( $permissionList as $action ) {
		$notifications[ $action ] = false;
	}

	$uploadFilter = array(
		'maxSize'  => 0,
		'minSize'  => 0,
		'maxFiles' => 0,
	);

	$widgets = array(
		'file-browser'    => array(
			'title'             => 'File Browser',
			'advancedKey'       => 'fileBrowser',
			'fileBrowser'       => array(
				'folderView'        => 'grid',
				'headerOptions'     => array(
					'breadcrumb' => false,
					'refresh'    => false,
					'sorting'    => false,
					'rootUpload' => false,
				),
				'listViewTableHead' => array(
					'enable'  => false,
					'name'    => 'Name',
					'type'    => 'Type',
					'size'    => 'Size',
					'updated' => 'Updated',
					'action'  => 'Action',
				),

			),
			'filters'           => array( 'upload' ),
			'permissions'       => array(
				'newFolder',
				'upload',
				'preview',
				'rename',
				'download',
				'copy',
				'move',
				'delete',
				'search',
				'share',
			),
			'notifications'     => array_keys( $notifications ),
			'advancedOverrides' => array(
				'borderBoxVisibility' => false,
			),
		),

		'gallery'         => array(
			'title'         => 'Gallery',
			'advancedKey'   => 'gallery',
			'gallery'       => array(
				'layout'                    => 'grid',
				'columnsDevice'             => 'desktop',
				'columns'                   => array(
					'desktop' => 4,
					'laptop'  => 3,
					'tablet'  => 2,
					'mobile'  => 1,
				),
				'thumbnailSpacing'          => array(
					'value' => 1,
					'unit'  => 'rem',
				),
				'thumbnailRadius'           => array(
					'value' => 1,
					'unit'  => 'rem',
				),
				'thumbnailQuality'          => 'thumbnail',
				'showOverlay'               => false,
				'overlayDisplayNumber'      => true,
				'overlayDisplayTitle'       => true,
				'overlayDisplayDescription' => true,
			),
			'permissions'   => array( 'download', 'preview' ),
			'notifications' => array( 'download', 'preview' ),
		),

		'embed-documents' => array(
			'title'             => 'Embed Documents',
			'advancedKey'       => 'embedDocuments',
			'embedDocuments'    => array(
				'showFileName' => false,
				'width'        => array(
					'value' => 100,
					'unit'  => '%',
				),
				'height'       => array(
					'value' => 600,
					'unit'  => 'px',
				),
				'allowPopOut'  => true,
			),
			'advancedOverrides' => array(
				'files' => array(
					'perPage' => 2,
				),
			),
		),
	);

	if ( ! isset( $widgets[ $type ] ) ) {
		return array();
	}

	$widget = $widgets[ $type ];

	$data['type']  = $type;
	$data['title'] = $widget['title'];

	if ( ! empty( $widget['filters'] ) ) {
		foreach ( $widget['filters'] as $filter ) {
			$data['data']['filter'][ $filter ] = $uploadFilter;
		}
	}

	if ( ! empty( $widget['overridePermissions'] ) ) {
		foreach ( $widget['overridePermissions'] as $permKey => $permValues ) {
			if ( isset( $permissions[ $permKey ] ) ) {
				$permissions[ $permKey ] = $permValues;
			}
		}
	}

	if ( ! empty( $widget['permissions'] ) ) {
		foreach ( $widget['permissions'] as $perm ) {
			$data['data']['permissions'][ $perm ] = $permissions[ $perm ];
		}
	}

	if ( ! empty( $widget['notifications'] ) ) {
		foreach ( $widget['notifications'] as $notify ) {
			$data['data']['notifications'][ $notify ] = $notifications[ $notify ];
		}
	}

	$advanced = $advancedDefaults;

	if ( ! empty( $widget['excludeAdvanced'] ) ) {
		foreach ( $widget['excludeAdvanced'] as $advKey ) {
			unset( $advanced[ $advKey ] );
		}
	}

	if ( ! empty( $widget['advancedOverrides'] ) ) {
		$advanced = pnpndDeepMergeWithUnset(
			$advanced,
			$widget['advancedOverrides']
		);
	}

	$data['data']['advanced'] = array_merge(
		$advanced,
		$widget['advancedKey'] && isset( $widget[ $widget['advancedKey'] ] ) ? array( $widget['advancedKey'] => $widget[ $widget['advancedKey'] ] ) : array()
	);

	return $data;
}

/**
 * Recursively merges two arrays.
 *
 * @param array $base The base array.
 * @param array $override The array with overriding values.
 *
 * @return array The merged array.
 */
function pnpndDeepMergeWithUnset( array $base, array $override ): array {
	foreach ( $override as $key => $value ) {

		if ( $value === PNPND_UNSET ) {
			unset( $base[ $key ] );
			continue;
		}

		if ( is_array( $value ) && isset( $base[ $key ] ) && is_array( $base[ $key ] ) ) {
			$base[ $key ] = pnpndDeepMergeWithUnset( $base[ $key ], $value );
			continue;
		}

		$base[ $key ] = $value;
	}

	return $base;
}

/**
 * Retrieve the schema for the widget types.
 *
 * @param string|null $key The key of the widget type to retrieve.
 *
 * @return array The schema for the widget types.
 */
function pnpndGetWidgetTypesSchema( $key = null ) {
	$defaultSchema = array(
		'id'          => 'integer',
		'title'       => 'string',
		'status'      => 'string',
		'type'        => 'string',
		'integration' => 'string|null',
		'createdAt'   => 'string',
		'data'        => array(
			'source'        => array(
				'fileKeys'      => 'array',
				'hasMore'       => 'boolean',
				'totalCount'    => 'integer',
				'currentPage'   => 'integer',
				'perPage'       => 'integer',
				'nextPage'      => 'integer|null',
				'totalPages'    => 'integer',
				'privateFolder' => 'boolean',
			),
			'filter'        => 'array',
			'notifications' => 'array',
			'permissions'   => 'array',
		),
	);

	if ( current_user_can( 'manage_options' ) ) {
		$defaultSchema['locations'] = 'array';
	}

	$defaultAdvanced = array(
		'width'               => 'array',
		'height'              => 'array',
		'theme'               => 'string',
		'files'               => 'array',
		'borderBoxVisibility' => 'boolean',
		'autoFetch'           => 'array',
		'sort'                => 'array',
	);

	$gallery = $defaultSchema;

	$gallery['data']['source']['files[]'] = array(
		'fileKey'     => 'string',
		'name'        => 'string',
		'description' => 'string',
		'baseName'    => 'string',
		'extension'   => 'string',
		'mimeType'    => 'string',
		'size'        => 'integer',
		'updatedAt'   => 'string',
	);

	$gallery['data']['advanced'] = $defaultAdvanced;

	$gallery['data']['advanced']['gallery'] = 'array';

	$fileBrowser = $defaultSchema;

	$fileBrowser['data']['source']['breadcrumbs[]'] = array(
		'fileKey' => 'string',
		'name'    => 'string',
	);

	$fileBrowser['data']['source']['files[]'] = array(
		'fileKey'        => 'string',
		'name'           => 'string',
		'icon'           => 'string',
		'extension'      => 'string',
		'mimeType'       => 'string',
		'count'          => 'string',
		'size'           => 'integer',
		'updatedAt'      => 'string',
		'additionalData' => array(
			'baseName'   => 'string',
			'lastEdited' => 'string',
		),
		'saveAs'         => 'array',
		'exportLinks'    => 'array',

	);

	$fileBrowser['data']['advanced'] = $defaultAdvanced;

	$fileBrowser['data']['advanced']['fileBrowser'] = 'array';

	$schema = array(
		'gallery'      => $gallery,
		'file-browser' => $fileBrowser,
	);

	if ( ! empty( $key ) ) {
		if ( ! isset( $schema[ $key ] ) ) {
			return $gallery;
		}

		return $schema[ $key ];
	}

	return $schema;
}

function pnpndGetTablesDefinitions( $key = null ) {
	global $wpdb;

	$charsetCollate = $wpdb->get_charset_collate();
	$prefix         = $wpdb->prefix;

	$tables = array(
		'widgets'  => "CREATE TABLE IF NOT EXISTS `{$prefix}pnpnd_widgets` (
                `id` INT AUTO_INCREMENT,
                `title` VARCHAR(120) DEFAULT NULL,
                `type` VARCHAR(20) NOT NULL,
                `integration` VARCHAR(60) DEFAULT NULL,
                `status` VARCHAR(10) DEFAULT 'active',
                `data` LONGTEXT DEFAULT NULL,
                `locations` LONGTEXT DEFAULT NULL,
                `createdAt` DATETIME NOT NULL DEFAULT '0000-00-00 00:00:00',
                `updatedAt` DATETIME NOT NULL DEFAULT '0000-00-00 00:00:00',
                PRIMARY KEY (`id`)
            ) $charsetCollate;",

		'files'    => "CREATE TABLE IF NOT EXISTS `{$prefix}pnpnd_files` (
                `id` VARCHAR(120) NOT NULL,
                `fileKey` VARCHAR(120) NOT NULL,
                `name` TEXT DEFAULT NULL,
                `description` LONGTEXT DEFAULT NULL,
                `parentId` VARCHAR(120) DEFAULT NULL,
                `accountId` VARCHAR(120) NOT NULL,
                `size` BIGINT UNSIGNED DEFAULT NULL,
                `mimeType` VARCHAR(255) NOT NULL,
                `extension` VARCHAR(60) DEFAULT NULL,
                `icon` VARCHAR(255) DEFAULT NULL,
                `thumbnail` VARCHAR(255) DEFAULT NULL,
                `additionalData` LONGTEXT DEFAULT NULL,
                `metaData` LONGTEXT DEFAULT NULL,
                `isDir` TINYINT(1) DEFAULT 0,
                `isStarred` TINYINT(1) DEFAULT 0,
                `isShared` TINYINT(1) DEFAULT 0,
                `media` LONGTEXT DEFAULT NULL,
                `permissions` LONGTEXT DEFAULT NULL,
                `createdAt` DATETIME NOT NULL DEFAULT '0000-00-00 00:00:00',
                `updatedAt` DATETIME NOT NULL DEFAULT '0000-00-00 00:00:00',
                PRIMARY KEY (`fileKey`)
            ) $charsetCollate;",

		'accounts' => "CREATE TABLE IF NOT EXISTS `{$prefix}pnpnd_accounts` (
                `id` VARCHAR(120) NOT NULL,
                `accountKey` TEXT NOT NULL,
                `name` TEXT NOT NULL,
                `email` TEXT NOT NULL,
                `photo` TEXT NOT NULL,
                `storage` TEXT NOT NULL,
                `lost` TINYINT(1) DEFAULT 1,
                `rootId` TEXT NOT NULL,
                `userId` INT NOT NULL,
                `active` TINYINT(1) DEFAULT 0,
                `tokens` LONGTEXT NOT NULL,
                `createdAt` DATETIME NOT NULL DEFAULT '0000-00-00 00:00:00',
                `updatedAt` DATETIME NOT NULL DEFAULT '0000-00-00 00:00:00',
                PRIMARY KEY (`id`),
                UNIQUE KEY `unique_key` (`accountKey`(191))
            ) $charsetCollate;",

		'logs'     => "CREATE TABLE IF NOT EXISTS `{$prefix}pnpnd_logs` (
                `id` INT AUTO_INCREMENT,
                `widgetId` INT DEFAULT NULL,
                `userId` INT DEFAULT NULL,
                `fileKey` TEXT DEFAULT NULL,
                `fileName` TEXT DEFAULT NULL,
                `page` TEXT DEFAULT NULL,
                `data` LONGTEXT DEFAULT NULL,
                `type` TEXT NOT NULL,
                `title` TEXT NOT NULL,
                `status` TEXT NOT NULL,
                `description` TEXT DEFAULT NULL,
                `createdAt` DATETIME NOT NULL DEFAULT '0000-00-00 00:00:00',
                `updatedAt` DATETIME NOT NULL DEFAULT '0000-00-00 00:00:00',
                PRIMARY KEY (`id`) 
            ) $charsetCollate;",
	);

	if ( $key !== null && isset( $tables[ $key ] ) ) {
		return $tables[ $key ];
	}

	return array_values( $tables );
}

function pnpndGetAllowedWidgetExtensions( string $type ) {
	$gallery     = array( 'image' );
	$mediaPlayer = array( 'audio', 'video' );

	$typeGroups = array(
		'gallery'         => pnpndGetExtensionGroups( $gallery ),
		'all'             => pnpndGetExtensionGroups( 'all' ),
		'embed-documents' => pnpndGetExtensionGroups( 'document' ),
	);

	return $typeGroups[ $type ] ?? $typeGroups['all'];
}

function pnpndGetTemplate( $slug, $args = array(), $name = null ) {
	$template = locate_template( "{$slug}-{$name}.php" );

	if ( ! $template ) {
		$template = PNPND_PATH . "templates/{$slug}.php";
		if ( $name ) {
			$template = PNPND_PATH . "templates/{$slug}-{$name}.php";
		}
	}

	if ( file_exists( $template ) ) {
		include $template;
	}
}

function pnpndGenerateKey( string $fileId, string $accountId ): string {
	return md5( "{$fileId}-{$accountId}" );
}

/**
 * Convert a size identifier to a Google Drive thumbnail size string.
 *
 * @param string $size The size identifier. Valid values are:
 *                     - 'full': Original size (no resizing).
 *                     - 'thumbnail': 150x150 pixels.
 *                     - 'medium': 300x300 pixels.
 *                     - 'large': 1024x1024 pixels.
 *                     - Custom size in the format 'WIDTHxHEIGHT' (e.g., '400x300').
 *
 * @return string The corresponding Google Drive thumbnail size string.
 *                Returns an empty string for 'full' or invalid inputs.
 */
function pnpndSizeToString( $size ) {
	$map = array(
		'xs'  => 'w32-h32-c-nu',
		'sm'  => 'w64-h64-c-nu',
		'md'  => 'w128-h128-c-nu',
		'lg'  => 'w150-h150-c-nu', // thumbnail
		'xl'  => 'w300-h300-c-nu', // medium
		'2xl' => 'w960-h640-c-nu',
		'3xl' => 'w1024-h1024-c-nu', // large
		'4xl' => 'w1280-h960-c-nu',
		'5xl' => '', // original
	);

	if ( isset( $map[ $size ] ) ) {
		return $map[ $size ];
	}

	if ( preg_match( '/^(\d+)x(\d+)$/', $size, $m ) ) {
		$w = (int) $m[1];
		$h = (int) $m[2];

		return "w{$w}-h{$h}-c-nu";
	}

	return '';
}

function pnpndTitleToUrlSlug( string $filename ): string {
	if ( $filename === '' ) {
		return 'unknown-file';
	}

	if ( class_exists( 'Normalizer' ) ) {
		$filename = Normalizer::normalize( $filename, Normalizer::FORM_C );
	}

	$filename = preg_replace(
		'/[\/\\\\\?\<\>\:\*\|"\`~!@#$%^&()+={}\[\];\',]+/u',
		'',
		$filename
	);

	$filename = preg_replace( '/\s+/u', '-', $filename );
	$filename = preg_replace( '/-+/u', '-', $filename );
	$filename = preg_replace( '/\.{2,}/u', '.', $filename );
	$filename = trim( $filename, '.-_' );

	$filename = mb_strtolower( $filename, 'UTF-8' );

	return $filename;
}

/**
 * Generate a secure and optimized attachment URL for PNPND.
 *
 * @param string $action The action to perform (e.g., 'attachment', 'thumbnail').
 * @param string $key Unique file key.
 * @param string $name File name (without extension).
 * @param string $size Image size (default: full).
 * @param string $ext File extension (default: webp).
 * @param string|null $referer Optional referer.
 *
 * @return string Sanitized attachment URL.
 */
function pnpndGetUrl( $action, $key, $name = 'unknown', $size = 'lg', $ext = 'webp', $referer = null ) {
	if ( empty( $key ) ) {
		return '';
	}

	$ext  = empty( $ext ) ? 'webp' : strtolower( sanitize_text_field( $ext ) );
	$name = str_replace( ".{$ext}", '', $name );

	$allowed_actions = array( 'thumbnail', 'stream', 'preview', 'download', 'share' );

	if ( ! in_array( $action, $allowed_actions, true ) ) {
		return '';
	}

	$action  = sanitize_key( $action );
	$referer = $referer !== null ? $referer : null;
	$key     = sanitize_key( $key );
	$name    = pnpndTitleToUrlSlug( $name );
	$size    = strtolower( sanitize_text_field( $size ?? '' ) );

	$allowSizes = array_keys( pnpndGetAvailableThumbnailSizes() );

	$allowed_sizes = apply_filters( 'pnpnd_allowed_sizes', $allowSizes );

	if ( ! in_array( $size, $allowed_sizes, true ) ) {
		$size = null;
	}

	if ( $referer !== null ) {
		$action .= "-{$referer}";
	}

	if ( $size ) {
		$name .= "-{$size}";
	}

	$ext = empty( $ext ) ? 'webp' : strtolower( sanitize_text_field( $ext ) );

	$allowDotExtension = Helpers::getSetting( 'advanced.allowDotExtension', false );

	if ( $allowDotExtension ) {
		return home_url( sprintf( '/pnpnd/%s/%s/%s.%s/', $action, $key, $name, $ext ) );
	} else {
		return home_url( sprintf( '/pnpnd/%s/%s/%s/%s/', $action, $key, $name, $ext ) );
	}
}

function pnpndGetWidgets() {

	$widgets = array(
		array(
			'id'          => 'file-browser',
			'title'       => 'File Browser',
			'description' => 'Allow users to browse selected Google Drive files and folders directly on your site.',
			'icon'        => 'folder',
			'dependency'  => array(
				'js' => array( 'wp-plupload' ),
			),
		),
		array(
			'id'          => 'gallery',
			'title'       => 'Gallery',
			'description' => 'Showcase images and Video from Google Drive in a visually appealing gallery format.',
			'icon'        => 'imagesmode',
			'dependency'  => array(
				'js' => array(),
			),
		),
		array(
			'id'          => 'embed-documents',
			'title'       => 'Embed Documents',
			'description' => 'Easily embed Google Docs, Sheets, and Slides into your website securely.',
			'icon'        => 'text_compare',
			'dependency'  => array(
				'js' => array(),
			),
		),
	);

	return $widgets;
}

function pnpndGetAvailableThumbnailSizes() {
	return array(
		'xs'  => '32x32',
		'sm'  => '64x64',
		'md'  => '128x128',
		'lg'  => '256x256', // thumbnail
		'xl'  => '480x320', // medium
		'2xl' => '640x480',
		'3xl' => '960x640', // large
		'4xl' => '1024x768', // extra large
		'5xl' => '', // original
	);
}
