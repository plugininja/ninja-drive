<?php

use Pnpnd\ND\Utils\Helpers;
use Pnpnd\ND\Utils\Mimetype_Manager;
use Pnpnd\ND\Widget;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

/**
 * Retrieve an account by its key.
 *
 * @param string $key The key of the account to retrieve.
 * @return \Pnpnd\ND\App\Account|WP_Error
 */
function pnpnd_get_account_by_key( $key ) {
	$account = \Pnpnd\ND\App\Accounts::get_instance()->get_account_by_key( $key );

	return $account;
}

/**
 * Retrieve a file by its key.
 *
 * @param string $key The key of the file to retrieve.
 * @return array|WP_Error The file data if found, or null if not found.
 */
function pnpnd_get_file_by_key( $key ) {
	$file = \Pnpnd\ND\Models\Files::get_instance()->get_file_by_key( $key, 'array' );

	return $file;
}

/**
 * Retrieve file IDs from an array of file keys.
 *
 * @param array $keys An array of file keys to search for.
 *
 * @return array|WP_Error An array of file IDs if found, or null if not found.
 */
function pnpnd_get_file_ids_by_keys( array $keys ) {
	return \Pnpnd\ND\Models\Files::get_instance()->get_file_attributes_by_keys( $keys );
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
function pnpnd_get_file_attributes_by_keys( array $keys, array $attributes ) {
	return \Pnpnd\ND\Models\Files::get_instance()->get_file_attributes_by_keys( $keys, $attributes );
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
function pnpnd_get_extension_groups( $keys = null ): array {
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

	$downloadable = array_filter( array_merge( ...array_values( $groups ) ), fn ( $ext ) => ! in_array( $ext, MimeType_Manager::NON_DOWNLOADABLE_TYPES, true ) );

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
 * @param string $mime_type The MIME type to retrieve the extension for.
 *
 * @return string The file extension associated with the given MIME type,
 *                or 'unknown' if no extension can be determined.
 */
function pnpnd_get_extension_by_mimetype( string $mime_type ) {
	$map = pnpnd_get_mimetype_map( 'mime2ext' );

	return $map[ $mime_type ] ?? 'unknown';
}

/**
 * Retrieves the MIME type associated with a given file extension.
 *
 * @param string $extension The file extension to retrieve the MIME type for.
 *
 * @return string The MIME type associated with the given extension,
 *                or 'application/octet-stream' if no association can be determined.
 */
function pnpnd_get_mimetype_by_extension( string $extension ) {
	$map = pnpnd_get_mimetype_map( 'ext2mime' );

	return $map[ $extension ] ?? 'application/octet-stream';
}

/**
 * Retrieves the MIME types associated with a given set of file types.
 *
 * @param array $types The set of file types to retrieve the MIME types for.
 *
 * @return array The array of MIME types associated with the given set of file types.
 */
function pnpnd_get_mimetypes_by_group( array $types ) {
	$extensions = pnpnd_get_extension_groups( $types );
	$map        = pnpnd_get_mimetype_map( 'ext2mime' );

	$mimetypes = array_filter( array_map( fn ( $ext ) => $map[ $ext ] ?? null, $extensions ) );

	return array_values( array_unique( $mimetypes ) );
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
function pnpnd_get_mimetype_map( string $type = 'mime2ext' ) {
	static $mime_map = array(
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

	return 'ext2mime' === $type ? array_flip( $mime_map ) : $mime_map;
}

function pnpnd_get_default_settings(): array {
	$settings = array(
		'accounts'                          => array(
			'connection_type'   => 'manual',
			'app_client_id'     => '',
			'app_client_secret' => '',
			'redirect_uri'      => PNPND_REDIRECT_URI,
		),
		'advanced'                          => array(
			'allow_dot_extension'      => false,
			'redirection'              => true,
			'delete_data_on_uninstall' => false,
			'redirection'              => false,
		),
		'appearance'                        => array(
			'preloader' => 1,
		),
		'integrations'                      => array(
			'active_integrations' => array(
				'contact_form_7',
				'gutenberg',
				'elementor',
			),
		),
		'tools'                             => array(
			'auto_save' => false,
		),

		'create_folder_on_registration'     => false,
		'private_folder_in_admin_dashboard' => false,
		'exclude_include_folder'            => false,
		'is_editing'                        => false,
		'draft'                             => null,
		'menu'                              => 'Accounts',
	);

	return $settings;
}

/**
 * Applies add/remove overrides to an array section.
 *
 * Supports PNPND_UNSET sentinel inside 'add' for deep removal.
 *
 * @param array $section   The base section array.
 * @param array $overrides Keys: 'add' (deep-merged) and/or 'remove' (explicit unset list).
 * @return array
 */
function pnpnd_apply_section_overrides( array $section, array $overrides ): array {
	if ( ! empty( $overrides['add'] ) ) {
		$section = pnpnd_deep_merge_with_unset( $section, $overrides['add'] );
	}

	if ( ! empty( $overrides['remove'] ) ) {
		foreach ( $overrides['remove'] as $key ) {
			unset( $section[ $key ] );
		}
	}

	return $section;
}

/**
 * Build default widget data for a given widget type.
 *
 * Each widget definition declares an 'overrides' key with per-section
 * add/remove directives. Sections: advanced, filter, style, permissions,
 * notifications. The permissions and notifications sections additionally
 * support a 'select' key (list of keys to include) and 'override' key
 * (per-key default replacements for permissions).
 *
 * @param string $type Widget type slug.
 * @return array Default widget data, or empty array for unknown types.
 */
function pnpnd_build_widget_data( string $type ): array {
	if ( ! in_array( $type, Widget::get_widgets_list(), true ) ) {
		return array();
	}

	// --- Shared base structures ---

	$base_source = array(
		'file_keys'      => array(),
		'files'          => array(),
		'breadcrumbs'    => array(),
		'selected_files' => array(),
		'current_page'   => 1,
		'has_more'       => false,
		'total_count'    => 0,
		'total_pages'    => 1,
		'next_page'      => null,
		'per_page'       => 20,
	);

	$base_advanced = array(
		'auto_fetch'            => array(
			'status'   => false,
			'interval' => 60,
		),
		'sort'                  => array(
			'order_by' => 'name',
			'order'    => 'ASC',
		),
		'secure_video_playback' => false,
	);

	$base_security = array(
		'password_protect' => array(
			'enable'   => false,
			'password' => '',
		),
		'display_for'      => array(
			'who_can_view_module'        => 'everyone',
			'logged_in_user_type'        => 'users',
			'display_for'                => array(),
			'show_access_denied_message' => true,
			'access_denied_message'      => 'You do not have access to this widget.',
		),
	);

	$base_filter = array(
		'extension' => array(
			'include' => array(),
			'all'     => false,
			'ignore'  => array(),
		),
		'name'      => array(
			'include'  => '',
			'ignore'   => '',
			'all'      => false,
			'apply_to' => array(
				'files'   => true,
				'folders' => true,
			),
		),
	);

	$base_style = array(
		'width'                 => array(
			'value' => 100,
			'unit'  => '%',
		),
		'height'                => array(
			'value' => 100,
			'unit'  => 'auto',
		),
		'theme'                 => 'light',
		'border_box_visibility' => false,
		'files'                 => array(
			'loading_type' => 'load_more',
			'per_page'     => 20,
		),
	);

	$permission_base = array(
		'user_access'         => 'everyone',
		'logged_in_user_type' => 'users',
		'display_for'         => array(),
	);

	$all_permissions = array(
		'new_folder' => $permission_base + array( 'enable' => false ),
		'upload'     => $permission_base + array(
			'enable'        => false,
			'folder_upload' => false,
		),
		'preview'    => $permission_base + array(
			'enable'            => false,
			'inline'            => true,
			'pop_out'           => false,
			'preview_thumbnail' => true,
		),
		'rename'     => $permission_base + array( 'enable' => false ),
		'download'   => $permission_base + array(
			'enable'            => false,
			'folder_download'   => false,
			'multiple_download' => false,
		),
		'copy'       => $permission_base + array( 'enable' => false ),
		'move'       => $permission_base + array( 'enable' => false ),
		'share'      => $permission_base + array( 'enable' => false ),
		'search'     => $permission_base + array(
			'enable'          => false,
			'search_location' => array(
				'cache'  => true,
				'server' => true,
			),
			'search_scope'    => array(
				'current' => true,
				'global'  => true,
			),
		),
		'delete'     => $permission_base + array( 'enable' => false ),
	);

	$notification_action_keys = array(
		'new_folder',
		'upload',
		'preview',
		'rename',
		'download',
		'copy',
		'move',
		'share',
		'view_share_link',
		'delete',
	);

	$all_notifications = array_merge(
		array(
			'enable'            => array(),
			'email_recipients'  => '',
			'skip_current_user' => false,
		),
		array_fill_keys( $notification_action_keys, false )
	);

	$upload_filter = null;

	// --- Widget definitions ---
	$widgets = array(
		'file_browser'    => array(
			'title'        => 'File Browser',
			'style_key'    => 'file_browser',
			'file_browser' => array(
				'folder_view'          => 'grid',
				'header_options'       => array(
					'breadcrumb'  => false,
					'refresh'     => false,
					'sorting'     => false,
					'root_upload' => false,
				),
				'list_view_table_head' => array(
					'enable'  => false,
					'name'    => 'Name',
					'type'    => 'Type',
					'size'    => 'Size',
					'updated' => 'Updated',
					'action'  => 'Action',
				),
			),
			'overrides'    => array(
				'filter'        => $upload_filter ? array( 'add' => array( 'upload' => $upload_filter ) ) : array(),
				'permissions'   => array(
					'select' => array( 'new_folder', 'upload', 'preview', 'rename', 'download', 'copy', 'move', 'delete', 'search', 'share' ),
				),
				'notifications' => array(
					'select' => array_keys( $all_notifications ),
				),
			),
		),

		'gallery'         => array(
			'title'     => 'Gallery',
			'style_key' => 'gallery',
			'gallery'   => array(
				'layout'                      => 'grid',
				'columns_device'              => 'desktop',
				'columns'                     => array(
					'desktop' => 4,
					'laptop'  => 3,
					'tablet'  => 2,
					'mobile'  => 1,
				),
				'thumbnail_spacing'           => array(
					'value' => 1,
					'unit'  => 'rem',
				),
				'thumbnail_radius'            => array(
					'value' => 1,
					'unit'  => 'rem',
				),
				'thumbnail_quality'           => 'large',
				'show_overlay'                => false,
				'overlay_display_number'      => true,
				'overlay_display_title'       => true,
				'overlay_display_description' => true,
			),
			'overrides' => array(
				'advanced'      => array(
					'remove' => array( 'secure_video_playback' ),
				),
				'permissions'   => array( 'select' => array( 'download', 'preview' ) ),
				'notifications' => array( 'select' => array( 'download', 'preview' ) ),
			),
		),

		'embed_documents' => array(
			'title'           => 'Embed Documents',
			'style_key'       => 'embed_documents',
			'embed_documents' => array(
				'show_file_name' => false,
				'width'          => array(
					'value' => 100,
					'unit'  => '%',
				),
				'height'         => array(
					'value' => 600,
					'unit'  => 'px',
				),
				'allow_pop_out'  => true,
			),
			'overrides'       => array(
				'advanced' => array(
					'remove' => array( 'secure_video_playback' ),
				),
				'style'    => array(
					'add' => array(
						'files' => array( 'per_page' => 2 ),
					),
				),
			),
		),
	);

	if ( ! in_array( $type, array( 'file_browser', 'gallery', 'embed_documents' ), true ) ) {
		return array();
	}

	if ( ! isset( $widgets[ $type ] ) ) {
		return array();
	}

	$widget_def = $widgets[ $type ];
	$overrides  = $widget_def['overrides'] ?? array();

	// --- Apply per-section overrides ---

	$advanced = pnpnd_apply_section_overrides( $base_advanced, $overrides['advanced'] ?? array() );
	$filter   = pnpnd_apply_section_overrides( $base_filter, $overrides['filter'] ?? array() );
	$style    = pnpnd_apply_section_overrides( $base_style, $overrides['style'] ?? array() );

	// --- Build permissions: apply per-key overrides, then select ---

	$perm_overrides  = $overrides['permissions'] ?? array();
	$all_permissions = pnpnd_apply_section_overrides( $all_permissions, array( 'add' => $perm_overrides['override'] ?? array() ) );
	$permissions     = array_intersect_key( $all_permissions, array_flip( $perm_overrides['select'] ?? array() ) );

	// --- Build notifications: select from pool ---

	$notifications = array_intersect_key( $all_notifications, array_flip( $overrides['notifications']['select'] ?? array() ) );

	// --- Embed type-specific config into style ---

	$style_key = $widget_def['style_key'] ?? null;
	if ( $style_key && isset( $widget_def[ $style_key ] ) ) {
		$style[ $style_key ] = $widget_def[ $style_key ];
	}

	// --- Assemble configuration and apply section-level removes ---

	$configuration = pnpnd_apply_section_overrides(
		array(
			'advanced' => $advanced,
			'security' => $base_security,
			'filter'   => $filter,
		),
		$overrides['configuration'] ?? array()
	);

	return array(
		'id'          => 'new',
		'status'      => 'active',
		'type'        => $type,
		'title'       => $widget_def['title'],
		'integration' => null,
		'data'        => array(
			'source'        => $base_source,
			'configuration' => $configuration,
			'style'         => $style,
			'permissions'   => $permissions,
			'notifications' => $notifications,
		),
	);
}

/**
 * @deprecated Use pnpnd_build_widget_data() instead.
 */
function pnpnd_get_widget_default_data( string $type ): array {
	return pnpnd_build_widget_data( $type );
}

/**
 * Recursively merges two arrays.
 *
 * @param array $base The base array.
 * @param array $override The array with overriding values.
 *
 * @return array The merged array.
 */
function pnpnd_deep_merge_with_unset( array $base, array $override ): array {
	foreach ( $override as $key => $value ) {

		if ( PNPND_UNSET === $value ) {
			unset( $base[ $key ] );
			continue;
		}

		if ( is_array( $value ) && isset( $base[ $key ] ) && is_array( $base[ $key ] ) ) {
			$base[ $key ] = pnpnd_deep_merge_with_unset( $base[ $key ], $value );
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
function pnpnd_get_widget_types_schema( $key = null ) {
	$default_schema = array(
		'id'          => 'integer',
		'title'       => 'string',
		'status'      => 'string',
		'type'        => 'string',
		'integration' => 'string|null',
		'created_at'  => 'string',
		'data'        => array(
			'source'        => array(
				'file_keys'      => 'array',
				'has_more'       => 'boolean',
				'total_count'    => 'integer',
				'current_page'   => 'integer',
				'per_page'       => 'integer',
				'next_page'      => 'integer|null',
				'total_pages'    => 'integer',
				'private_folder' => 'boolean',
			),
			'configuration' => 'array',
			'notifications' => 'array',
			'permissions'   => 'array',
		),
	);

	if ( current_user_can( 'manage_options' ) ) {
		$default_schema['data']['source']['selected_files'] = 'array';
		$default_schema['locations']                        = 'array';
	}

	$default_style = array(
		'width'                 => 'array',
		'height'                => 'array',
		'theme'                 => 'string',
		'files'                 => 'array',
		'border_box_visibility' => 'boolean',
		'auto_fetch'            => 'array',
		'sort'                  => 'array',
	);

	$file_browser = $default_schema;

	$file_browser['data']['source']['breadcrumbs[]'] = array(
		'file_key' => 'string',
		'name'     => 'string',
	);

	$file_browser['data']['source']['files[]'] = array(
		'file_key'        => 'string',
		'name'            => 'string',
		'icon'            => 'string',
		'extension'       => 'string',
		'mime_type'       => 'string',
		'count'           => 'string',
		'size'            => 'integer',
		'updated_at'      => 'string',
		'additional_data' => array(
			'base_name'   => 'string',
			'last_edited' => 'string',
		),
		'save_as'         => 'array',
		'export_links'    => 'array',
	);

	$file_browser['data']['style'] = $default_style;

	$file_browser['data']['style']['file_browser'] = 'array';

	$gallery = $default_schema;

	$gallery['data']['source']['files[]'] = array(
		'file_key'    => 'string',
		'name'        => 'string',
		'description' => 'string',
		'base_name'   => 'string',
		'extension'   => 'string',
		'mime_type'   => 'string',
		'size'        => 'integer',
		'updated_at'  => 'string',
	);

	$gallery['data']['style'] = $default_style;

	$gallery['data']['style']['gallery'] = 'array';

	$embed_documents = $default_schema;

	$embed_documents['data']['source']['files[]'] = array(
		'file_key'    => 'string',
		'name'        => 'string',
		'description' => 'string',
		'base_name'   => 'string',
		'extension'   => 'string',
		'mime_type'   => 'string',
		'size'        => 'integer',
		'updated_at'  => 'string',
	);

	$embed_documents['data']['style'] = $default_style;

	$embed_documents['data']['style']['embed_documents'] = 'array';

	$schema = array(
		'file_browser'    => $file_browser,
		'gallery'         => $gallery,
		'embed_documents' => $embed_documents,
	);

	if ( ! empty( $key ) ) {
		if ( ! isset( $schema[ $key ] ) ) {
			return $gallery;
		}

		return $schema[ $key ];
	}

	return $schema;
}

function pnpnd_get_tables_definitions( $key = null ) {
	global $wpdb;

	$charset_collate = $wpdb->get_charset_collate();
	$prefix          = $wpdb->prefix;

	$tables = array(
		'widgets'  => "CREATE TABLE IF NOT EXISTS `{$prefix}pnpnd_widgets` (
                `id` INT AUTO_INCREMENT,
                `title` VARCHAR(120) DEFAULT NULL,
                `type` VARCHAR(20) NOT NULL,
                `integration` VARCHAR(60) DEFAULT NULL,
                `status` VARCHAR(10) DEFAULT 'active',
                `data` LONGTEXT DEFAULT NULL,
                `locations` LONGTEXT DEFAULT NULL,
                `created_at` DATETIME NOT NULL DEFAULT '0000-00-00 00:00:00',
                `updated_at` DATETIME NOT NULL DEFAULT '0000-00-00 00:00:00',
                PRIMARY KEY (`id`)
            ) $charset_collate;",

		'files'    => "CREATE TABLE IF NOT EXISTS `{$prefix}pnpnd_files` (
                `id` VARCHAR(120) NOT NULL,
                `file_key` VARCHAR(120) NOT NULL,
                `name` TEXT DEFAULT NULL,
                `description` LONGTEXT DEFAULT NULL,
                `parent_id` VARCHAR(120) DEFAULT NULL,
                `account_id` VARCHAR(120) NOT NULL,
                `size` BIGINT UNSIGNED DEFAULT NULL,
                `mime_type` VARCHAR(255) NOT NULL,
                `extension` VARCHAR(60) DEFAULT NULL,
                `icon` VARCHAR(255) DEFAULT NULL,
                `thumbnail` VARCHAR(255) DEFAULT NULL,
                `additional_data` LONGTEXT DEFAULT NULL,
                `meta_data` LONGTEXT DEFAULT NULL,
                `is_dir` TINYINT(1) DEFAULT 0,
                `is_starred` TINYINT(1) DEFAULT 0,
                `is_shared` TINYINT(1) DEFAULT 0,
                `media` LONGTEXT DEFAULT NULL,
                `permissions` LONGTEXT DEFAULT NULL,
                `created_at` DATETIME NOT NULL DEFAULT '0000-00-00 00:00:00',
                `updated_at` DATETIME NOT NULL DEFAULT '0000-00-00 00:00:00',
                PRIMARY KEY (`file_key`),
                KEY idx_id (id),
                KEY idx_account_ext_parent (account_id, extension, parent_id)
            ) $charset_collate;",

		'accounts' => "CREATE TABLE IF NOT EXISTS `{$prefix}pnpnd_accounts` (
                `id` VARCHAR(120) NOT NULL,
                `account_key` TEXT NOT NULL,
                `name` TEXT NOT NULL,
                `email` TEXT NOT NULL,
                `photo` TEXT NOT NULL,
                `storage` TEXT NOT NULL,
                `lost` TINYINT(1) DEFAULT 1,
                `root_id` TEXT NOT NULL,
                `user_id` INT NOT NULL,
                `active` TINYINT(1) DEFAULT 0,
                `tokens` LONGTEXT NOT NULL,
                `created_at` DATETIME NOT NULL DEFAULT '0000-00-00 00:00:00',
                `updated_at` DATETIME NOT NULL DEFAULT '0000-00-00 00:00:00',
                PRIMARY KEY (`id`),
                UNIQUE KEY `unique_key` (`account_key`(191))
            ) $charset_collate;",

		'notices'  => "CREATE TABLE IF NOT EXISTS `{$prefix}pnpnd_notices` (
                `id` INT AUTO_INCREMENT,
                `widget_id` INT DEFAULT NULL,
                `user_id` INT DEFAULT NULL,
                `file_key` TEXT DEFAULT NULL,
                `file_name` TEXT DEFAULT NULL,
                `page` TEXT DEFAULT NULL,
                `data` LONGTEXT DEFAULT NULL,
                `type` TEXT NOT NULL,
                `title` TEXT NOT NULL,
                `status` TEXT NOT NULL,
                `description` TEXT DEFAULT NULL,
                `created_at` DATETIME NOT NULL DEFAULT '0000-00-00 00:00:00',
                `updated_at` DATETIME NOT NULL DEFAULT '0000-00-00 00:00:00',
                PRIMARY KEY (`id`)
            ) $charset_collate;",
	);

	if ( null !== $key && isset( $tables[ $key ] ) ) {
		return $tables[ $key ];
	}

	return array_values( $tables );
}

function pnpnd_get_allowed_widget_extensions( string $type ) {
	$gallery      = array( 'image' );
	$media_player = array( 'audio', 'video' );

	$type_groups = array(
		'gallery'         => pnpnd_get_extension_groups( $gallery ),
		'all'             => pnpnd_get_extension_groups( 'all' ),
		'embed-documents' => pnpnd_get_extension_groups( 'document' ),
	);

	return $type_groups[ $type ] ?? $type_groups['all'];
}

function pnpnd_get_template( $slug, $args = array(), $name = null ) {
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

function pnpnd_generate_key( string $file_id, string $account_id ): string {
	return md5( "{$file_id}-{$account_id}" );
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
function pnpnd_size_to_string( $size ) {
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

function pnpnd_title_to_url_slug( string $filename ): string {
	if ( '' === $filename ) {
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
function pnpnd_get_url( $action, $key, $name = 'unknown', $size = 'lg', $ext = 'webp', $referer = null ) {
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
	$referer = null !== $referer ? $referer : null;
	$key     = sanitize_key( $key );
	$name    = pnpnd_title_to_url_slug( $name );
	$size    = strtolower( sanitize_text_field( $size ?? '' ) );

	$allow_sizes = array_keys( pnpnd_get_available_thumbnail_sizes() );

	$allowed_sizes = apply_filters( 'pnpnd_allowed_sizes', $allow_sizes );

	if ( ! in_array( $size, $allowed_sizes, true ) ) {
		$size = null;
	}

	if ( null !== $referer ) {
		$action .= "-{$referer}";
	}

	if ( $size ) {
		$name .= "-{$size}";
	}

	$ext = empty( $ext ) ? 'webp' : strtolower( sanitize_text_field( $ext ) );

	$allow_dot_extension = Helpers::get_setting( 'advanced.allow_dot_extension', false );

	if ( $allow_dot_extension ) {
		return home_url( sprintf( '/pnpnd/%s/%s/%s.%s/', $action, $key, $name, $ext ) );
	} else {
		return home_url( sprintf( '/pnpnd/%s/%s/%s/%s/', $action, $key, $name, $ext ) );
	}
}

function pnpnd_get_widgets() {

	$widgets = array(
		array(
			'id'          => 'file_browser',
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
			'id'          => 'embed_documents',
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

function pnpnd_get_available_thumbnail_sizes() {
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

/**
 * Add a notice/notification.
 *
 * @param string $type        Notice type. Use Notice::TYPE_ERROR, Notice::TYPE_SUCCESS, etc.
 * @param string $title       Notice title.
 * @param string $description Notice description.
 * @param array  $extra       Additional data (file_key, file_name, page, widget_id, etc.).
 *
 * @return int|\WP_Error
 */
function pnpnd_notify( string $type, string $title, string $description = '', array $extra = array() ) {
	return \Pnpnd\ND\Notice::get_instance()->add( $type, $title, $description, $extra );
}

