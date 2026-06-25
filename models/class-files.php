<?php

namespace Pnpnd\ND\Models;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

use Pnpnd\ND\App\Accounts;
use Pnpnd\ND\Utils\Helpers;
use Pnpnd\ND\Traits\Singleton;
use Pnpnd\ND\Models\File_Meta;
use WP_Error;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class Files extends Base_Model {

	use Singleton;

	public function __construct() {
		parent::__construct( 'pnpnd_files' );
	}

	/**
	 * Retrieves a list of files from the specified folder and account.
	 *
	 * @param string $root_id The ID of the root folder to retrieve files from.
	 * @param string $account_id The ID of the account associated with the files.
	 * @param array  $config Optional configuration settings for retrieving files.
	 *
	 * @return array|null|WP_Error An array of processed file data from the specified folder.
	 */
	public function get_folder( $root_id, $account_id, $config = array() ) {
		if ( Account::get_instance()->is_valid_account( $account_id ) === false ) {
			return new WP_Error( 403, __( 'This account is lost or does not exist. Please re-authorize it.', 'ninja-drive' ) );
		}

		$allowed_order_by = array( 'created_at', 'name', 'updated_at', 'size' );

		$order    = $this->sanitize_order( isset( $config['order'] ) ? $config['order'] : 'DESC' );
		$order_by = $this->sanitize_order_by( isset( $config['order_by'] ) ? $config['order_by'] : 'created_at', $allowed_order_by );

		$page       = isset( $config['page'] ) ? (int) $config['page'] : 1;
		$per_page   = isset( $config['per_page'] ) ? (int) $config['per_page'] : 24;
		$extensions = isset( $config['extensions'] ) ? (array) $config['extensions'] : array();

		$pagination = $this->sanitize_pagination( $page, $per_page );

		global $wpdb;

		$sql = $wpdb->prepare( 'SELECT * FROM %i WHERE account_id = %s', $this->table_name, $account_id );

		if ( 'starred' === $root_id ) {
			$sql .= $wpdb->prepare( ' AND is_starred = %d', 1 );
		} else {
			$sql .= $wpdb->prepare( ' AND parent_id = %s', $root_id );
		}

		if ( ! empty( $extensions ) ) {
			$placeholders = implode( ',', array_fill( 0, count( $extensions ), '%s' ) );
            // phpcs:ignore WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			$sql .= $wpdb->prepare( " AND extension IN ($placeholders)", $extensions );
		}

		if ( 'ASC' === $order ) {
			$sql .= $wpdb->prepare(
				" ORDER BY (CASE WHEN extension = 'folder' THEN 0 ELSE 1 END), %i ASC LIMIT %d OFFSET %d",
				$order_by,
				$pagination['per_page'],
				$pagination['offset']
			);
		} else {
			$sql .= $wpdb->prepare(
				" ORDER BY (CASE WHEN extension = 'folder' THEN 0 ELSE 1 END), %i DESC LIMIT %d OFFSET %d",
				$order_by,
				$pagination['per_page'],
				$pagination['offset']
			);
		}

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery, WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.PreparedSQL.InterpolatedNotPrepared - We are using $wpdb->prepare for the dynamic parts of the query, but the table name cannot be parameterized, so we have to use $wpdb->prepare for the rest of the query and then insert the table name directly.
		$files = $wpdb->get_results( $sql, ARRAY_A );

		if ( is_wp_error( $files ) ) {
			return $files;
		}

		return $this->process_files( $files );
	}

	public function get_folders( string $account_id, array $config = array() ) {
		if ( Account::get_instance()->is_valid_account( $account_id ) === false ) {
			return new WP_Error( 403, __( 'This account is lost or does not exist. Please re-authorize it.', 'ninja-drive' ) );
		}

		$default = array(
			'order_by' => 'name',
			'order'    => 'ASC',
		);

		$config = wp_parse_args( $config, $default );

		$should_count = ! empty( $config['page'] ) && ! empty( $config['per_page'] );

		global $wpdb;
		$sql       = $wpdb->prepare( "SELECT * FROM %i WHERE account_id = %s AND extension = 'folder'", $this->table_name, $account_id );
		$count_sql = '';

		if ( $should_count ) {
			$count_sql = $wpdb->prepare( "SELECT COUNT(*) FROM %i WHERE account_id = %s AND extension = 'folder'", $this->table_name, $account_id );
		}

		if ( ! empty( $config['parent_id'] ) ) {
			$sql .= $wpdb->prepare( ' AND parent_id = %s', $config['parent_id'] );
			if ( $should_count ) {
				$count_sql .= $wpdb->prepare( ' AND parent_id = %s', $config['parent_id'] );
			}
		}

		if ( ! empty( $config['order_by'] ) && ! empty( $config['order'] ) ) {
			$allowed_order_by = array( 'created_at', 'name', 'updated_at', 'size' );
			$order_by         = $this->sanitize_order_by( $config['order_by'], $allowed_order_by );
			$order            = $this->sanitize_order( $config['order'] );
			if ( 'ASC' === $order ) {
				$sql .= $wpdb->prepare( ' ORDER BY %i ASC', $order_by );
			} else {
				$sql .= $wpdb->prepare( ' ORDER BY %i DESC', $order_by );
			}
		}

		if ( $should_count ) {
			$pagination = $this->sanitize_pagination( (int) $config['page'], (int) $config['per_page'] );
			$sql       .= $wpdb->prepare( ' LIMIT %d OFFSET %d', $pagination['per_page'], $pagination['offset'] );
		}

		$cache_key = "pnpnd_folders_{$account_id}_" . md5( $sql );
		$cache     = wp_cache_get( $cache_key, 'pnpnd_folders' );
		if ( $cache ) {
			return $cache;
		}

        // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery
		$files = $wpdb->get_results( $sql, ARRAY_A );

		if ( is_wp_error( $files ) ) {
			return $files;
		}

		$result = $this->process_files( $files );
		if ( is_wp_error( $result ) && empty( $result ) ) {
			return array();
		}

		if ( $should_count ) {
            // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, PluginCheck.Security.DirectDB.UnescapedDBParameter
			$total_count = $wpdb->get_var( $count_sql );

			if ( is_wp_error( $total_count ) ) {
				return $total_count;
			}

			$total_page = ceil( (int) $total_count / intval( $config['per_page'] ) );

			$per_page     = (int) $config['per_page'];
			$current_page = (int) $config['page'];
			$has_more     = $total_page > $current_page;
			$next_page    = $has_more ? $current_page + 1 : null;

			$response = array(
				'files'        => $result,
				'total_count'  => (int) $total_count,
				'total_page'   => $total_page,
				'current_page' => $current_page,
				'per_page'     => $per_page,
				'has_more'     => $has_more,
			);

			if ( $has_more ) {
				$response['next_page'] = $next_page;
			}

			wp_cache_set( $cache_key, $response, 'pnpnd_folders', HOUR_IN_SECONDS );

			return $response;
		}

		wp_cache_set( $cache_key, $result, 'pnpnd_folders', HOUR_IN_SECONDS );

		return $result;
	}

	public function search( array $data ) {
		$account_id   = $data['account_id'] ?? '';
		$search_query = $data['query'] ?? '';
		$types        = $data['types'] ?? array( 'all' );
		$limit        = isset( $data['limit'] ) ? (int) $data['limit'] : 100;
		$order        = $data['order'] ?? 'ASC';
		$order_by     = $data['order_by'] ?? 'name';
		$folder_id    = $data['folderId'] ?? '';
		$scope        = isset( $data['scope'] ) && in_array( $data['scope'], array( 'folder', 'global' ), true ) ? $data['scope'] : 'folder';

		if ( ! Account::get_instance()->is_valid_account( $account_id ) ) {
			return new WP_Error( 403, __( 'This account is lost or does not exist. Please re-authorize it.', 'ninja-drive' ) );
		}

		if ( empty( $account_id ) ) {
			return new WP_Error( 404, __( 'The requested file could not be found. 3', 'ninja-drive' ) );
		}

		$allowed_order_by = array( 'name', 'created_at', 'updated_at', 'size' );
		$order_by         = $this->sanitize_order_by( $order_by, $allowed_order_by );
		$order            = $this->sanitize_order( $order );
		$limit            = max( 1, min( 1000, $limit ) );

		$extensions = pnpnd_get_extension_groups( $types );

		global $wpdb;

		$query_string = $wpdb->prepare( 'SELECT * FROM %i WHERE name LIKE %s AND account_id = %s', $this->table_name, '%' . $wpdb->esc_like( $search_query ) . '%', $account_id );

		if ( ! empty( $extensions ) ) {
			$placeholders = implode( ',', array_fill( 0, count( $extensions ), '%s' ) );
            // phpcs:ignore WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			$query_string .= $wpdb->prepare( " AND extension IN ($placeholders)", $extensions );
		}

		if ( 'folder' === $scope && ! empty( $folder_id ) ) {
			$query_string .= $wpdb->prepare( ' AND parent_id = %s', $folder_id );
		}

		if ( 'ASC' === $order ) {
			$query_string .= $wpdb->prepare( " ORDER BY (CASE WHEN extension = 'folder' THEN 0 ELSE 1 END), %i ASC LIMIT %d", $order_by, $limit );
		} else {
			$query_string .= $wpdb->prepare( " ORDER BY (CASE WHEN extension = 'folder' THEN 0 ELSE 1 END), %i DESC LIMIT %d", $order_by, $limit );
		}

		$cache_key = "pnpnd_search_{$account_id}_" . md5( $query_string );
		$cache     = wp_cache_get( $cache_key, 'pnpnd_search' );
		if ( $cache ) {
			return $cache;
		}

        // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery
		$files = $wpdb->get_results( $query_string, ARRAY_A );

		if ( is_wp_error( $files ) ) {
			return $files;
		}

		$result = $this->process_files( $files );
		if ( ! is_wp_error( $result ) && ! empty( $result ) ) {
			wp_cache_add( $cache_key, $result, 'pnpnd_search', HOUR_IN_SECONDS );
		}

		return $result;
	}

	/**
	 * Retrieves a list of all files associated with the specified account ID.
	 *
	 * @param string $account_id The ID of the account associated with the files.
	 * @param array  $config Optional configuration settings for retrieving files.
	 *
	 * @return array|WP_Error An array of processed file data associated with the specified account.
	 */
	public function get_files_by_account_id( $account_id, $config = array() ) {
		if ( Account::get_instance()->is_valid_account( $account_id ) === false ) {
			return new WP_Error( 403, __( 'This account is lost or does not exist. Please re-authorize it.', 'ninja-drive' ) );
		}

		$allowed_order_by = array( 'created_at', 'name', 'updated_at', 'size' );

		$order    = $this->sanitize_order( isset( $config['order'] ) ? $config['order'] : 'DESC' );
		$order_by = $this->sanitize_order_by( isset( $config['order_by'] ) ? $config['order_by'] : 'created_at', $allowed_order_by );

		$page     = isset( $config['page'] ) ? (int) $config['page'] : 1;
		$per_page = isset( $config['per_page'] ) ? (int) $config['per_page'] : 24;

		$pagination = $this->sanitize_pagination( $page, $per_page );

		global $wpdb;

		$sql = $wpdb->prepare( 'SELECT * FROM %i WHERE account_id = %s', $this->table_name, $account_id );

		if ( 'ASC' === $order ) {
			$sql .= $wpdb->prepare( " ORDER BY (CASE WHEN extension = 'folder' THEN 0 ELSE 1 END), %i ASC LIMIT %d OFFSET %d", $order_by, $pagination['per_page'], $pagination['offset'] );
		} else {
			$sql .= $wpdb->prepare( " ORDER BY (CASE WHEN extension = 'folder' THEN 0 ELSE 1 END), %i DESC LIMIT %d OFFSET %d", $order_by, $pagination['per_page'], $pagination['offset'] );
		}

		$cache_key = "pnpnd_files_account_{$account_id}_" . md5( $sql );
		$cache     = wp_cache_get( $cache_key, 'pnpnd_files' );
		if ( $cache ) {
			return $cache;
		}

        // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery
		$files = $wpdb->get_results( $sql, ARRAY_A );

		if ( is_wp_error( $files ) ) {
			return $files;
		}

		$result = $this->process_files( $files );
		if ( ! is_wp_error( $result ) && ! empty( $result ) ) {
			wp_cache_add( $cache_key, $result, 'pnpnd_files', HOUR_IN_SECONDS );
		}

		return $result;
	}

	/**
	 * Retrieves a file by its ID and account ID.
	 *
	 * This method queries the database for a file associated with the given
	 * ID and account ID. If a matching file is found, it processes and returns
	 * the file data. If no file is found, an error notice is added and null is
	 * returned.
	 *
	 * @param string $id The ID of the file to retrieve.
	 * @param string $account_id The ID of the account associated with the file.
	 *
	 * @return \Pnpnd\ND\App\File|array|WP_Error The processed file data if found, otherwise null.
	 */
	public function get_file( string $id, string $account_id, $return_type = 'object' ) {
		global $wpdb;
		if ( Account::get_instance()->is_valid_account( $account_id ) === false ) {
			return new WP_Error( 403, __( 'This account is lost or does not exist. Please re-authorize it.', 'ninja-drive' ) );
		}
		$cache_key = "pnpnd_file_{$id}_{$account_id}_{$return_type}";

		$cache = wp_cache_get( $cache_key, 'pnpnd_files' );
		if ( $cache ) {
			return $cache;
		}

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery
		$file = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM %i WHERE id = %s AND account_id = %s', $this->table_name, $id, $account_id ), ARRAY_A );

		if ( empty( $file ) ) {
			return new WP_Error( 404, __( 'The requested file could not be found. 1', 'ninja-drive' ) );
		}

		$file = $this->process_file( $file, $return_type );
		if ( is_wp_error( $file ) || empty( $file ) ) {
			return $file;
		}

		wp_cache_add( $cache_key, $file, 'pnpnd_files', HOUR_IN_SECONDS );

		return $file;
	}

	/**
	 * Retrieves a file by its unique key.
	 *
	 * This method queries the database for a file associated with the given key.
	 * If a matching file is found, it processes and returns the file data.
	 * If no file is found, an error notice is added and null is returned.
	 *
	 * @param string $key The unique key identifying the file.
	 * @param string $return_type The type of return value, either 'object' or 'array'.
	 *
	 * @return \Pnpnd\ND\App\File|array|WP_Error The processed file data if found, otherwise null.
	 */
	public function get_file_by_key( string $key, string $return_type = 'object' ) {
		$root_keys = array( 'my-drive', 'shared', 'starred', 'computers', 'shared-with-me' );

		if ( in_array( $key, $root_keys, true ) ) {
			return array();
		}

		global $wpdb;
		if ( empty( $key ) ) {
			return new WP_Error( 404, __( 'The requested file could not be found. 4', 'ninja-drive' ) );
		}

		$cache_key = "pnpnd_file_key_{$key}_{$return_type}";
		$cache     = wp_cache_get( $cache_key, 'pnpnd_files' );
		if ( $cache ) {
			return $cache;
		}

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery
		$file = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM %i WHERE `file_key` = %s', $this->table_name, $key ), ARRAY_A );

		if ( empty( $file ) ) {
			return new WP_Error( 404, __( 'The requested file could not be found. 5', 'ninja-drive' ) );
		}

		$file = $this->process_file( $file, $return_type );

		if ( is_wp_error( $file ) || empty( $file ) ) {
			return $file;
		}

		wp_cache_add( $cache_key, $file, 'pnpnd_files', HOUR_IN_SECONDS );

		return $file;
	}

	public function get_files_by_keys( array $keys, array $args = array() ) {
		if ( empty( $keys ) ) {
			return array();
		}

		$defaults = array(
			'recursive'       => false,
			'return_type'     => 'array',
			'page'            => 1,
			'per_page'        => 24,
			'order_by'        => 'updated_at',
			'order'           => 'DESC',
			'search'          => '',
			'search_scope'    => 'folder',
			'search_location' => 'cache',
			'types'           => array(),
		);

		$args = wp_parse_args( $args, $defaults );

		$recursive              = $args['recursive'];
		$return_type            = $args['return_type'];
		$widget_type            = $args['widget_type'] ?? '';
		$additional_extensions  = $args['extensions'] ?? array();
		$extensions_filter_type = $args['extensions_filter_type'] ?? '';
		$search                 = $args['search'];
		$search_scope           = $args['search_scope'];
		$types                  = $args['types'];
		$names_string           = $args['names'] ?? '';
		$names_filter_type      = $args['names_filter_type'] ?? '';
		$apply_names_filter     = $args['apply_name_filter'] ?? array();

		$allowed_extensions = pnpnd_get_allowed_widget_extensions( $widget_type );

		$extensions = $this->process_extensions(
			$allowed_extensions,
			$additional_extensions,
			$extensions_filter_type
		);

		if ( 'all' !== $types && ! empty( $types ) ) {
			$extensions = pnpnd_get_extension_groups( $types );
		}

		$files_data = $this->get_file_attributes_by_keys( $keys, array( 'id', 'account_id', 'name', 'is_dir' ) );

		if ( is_wp_error( $files_data ) || empty( $files_data ) ) {
			return $files_data ? $files_data : array();
		}

		if ( empty( $files_data ) ) {
			return array();
		}

		$ids    = array_map( fn ( $file ) => $file['id'], $files_data );
		$params = $ids;

		global $wpdb;
		$sql             = $wpdb->prepare( 'SELECT * FROM %i WHERE 1 =1', $this->table_name );
		$total_count_sql = $wpdb->prepare( 'SELECT COUNT(*) as count FROM %i WHERE 1 =1', $this->table_name );

		if ( ! empty( $search ) ) {

			$search_ids = array();

			if ( 'global' === $search_scope ) {
				foreach ( $files_data as $file ) {
					$search_ids[] = $this->get_successors( $file['id'], $file['account_id'] );
				}
				$params = array_merge( ...$search_ids );
			} elseif ( 'folder' === $search_scope && ! empty( $args['file_id'] ) ) {
				$params = array( $args['file_id'] );
			}

			if ( empty( $params ) ) {
				return array();
			}

			$placeholders = implode( ',', array_fill( 0, count( $params ), '%s' ) );

            // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			$sql .= $wpdb->prepare( " AND (`id` IN ($placeholders) OR `parent_id` IN ($placeholders)) AND `name` LIKE %s", array_merge( $params, $params, array( '%' . $wpdb->esc_like( $search ) . '%' ) ) );

            // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			$total_count_sql .= $wpdb->prepare( " AND (`id` IN ($placeholders) OR `parent_id` IN ($placeholders)) AND `name` LIKE %s", array_merge( $params, $params, array( '%' . $wpdb->esc_like( $search ) . '%' ) ) );

		} elseif ( $recursive ) {
			$placeholders = implode( ',', array_fill( 0, count( $params ), '%s' ) );

			if ( 'file_browser' === $widget_type ) {
				$sql             .= $wpdb->prepare( " AND `parent_id` IN ($placeholders)", $params ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare
				$total_count_sql .= $wpdb->prepare( " AND `parent_id` IN ($placeholders)", $params ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare
			} else {
				$sql             .= $wpdb->prepare( " AND (`id` IN ($placeholders) OR `parent_id` IN ($placeholders)) AND `extension` != 'folder'", array_merge( $params, $params ) ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare
				$total_count_sql .= $wpdb->prepare( " AND (`id` IN ($placeholders) OR `parent_id` IN ($placeholders)) AND `extension` != 'folder'", array_merge( $params, $params ) ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare
			}
		} else {
			if ( ! empty( $extensions ) && ! in_array( 'folder', $extensions, true ) ) {
				$extensions[] = 'folder';
			}

			$placeholders = implode( ',', array_fill( 0, count( $params ), '%s' ) );

			$sql             .= $wpdb->prepare( " AND `id` IN ($placeholders)", $params ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare
			$total_count_sql .= $wpdb->prepare( " AND `id` IN ($placeholders)", $params ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare
		}

		$filter_sql    = '';
		$filter_params = array();

		if ( ! empty( $extensions ) ) {
			$ext_placeholders = implode( ',', array_fill( 0, count( $extensions ), '%s' ) );
			$sql             .= $wpdb->prepare( " AND `extension` IN ($ext_placeholders)", $extensions ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare
			$total_count_sql .= $wpdb->prepare( " AND `extension` IN ($ext_placeholders)", $extensions ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare

			$filter_sql    = " AND `extension` IN ($ext_placeholders)";
			$filter_params = $extensions;
		}

		if ( ! empty( $args['order_by'] ) && ! empty( $args['order'] ) ) {
			$allowed_order_by = array( 'id', 'name', 'size', 'created_at', 'updated_at' );
			$order_by         = $this->sanitize_order_by( $args['order_by'], $allowed_order_by );
			$order            = $this->sanitize_order( $args['order'] );
			$offset           = $this->sanitize_pagination( $args['page'], $args['per_page'] );

			if ( 'ASC' === $order ) {
				$sql .= $wpdb->prepare( " ORDER BY (CASE WHEN extension = 'folder' THEN 0 ELSE 1 END), %i ASC LIMIT %d OFFSET %d", $order_by, $offset['per_page'], $offset['offset'] );
			} else {
				$sql .= $wpdb->prepare( " ORDER BY (CASE WHEN extension = 'folder' THEN 0 ELSE 1 END), %i DESC LIMIT %d OFFSET %d", $order_by, $offset['per_page'], $offset['offset'] );
			}
		}

		$cache_key = 'pnpnd_file_by_keys_' . md5( $sql );

		$cache = wp_cache_get( $cache_key, 'pnpnd_files' );
		if ( $cache ) {
			return $cache;
		}

		$files = $wpdb->get_results( $sql, ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery

		$total_count = $wpdb->get_row( $total_count_sql, ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, PluginCheck.Security.DirectDB.UnescapedDBParameter

		if ( empty( $files ) || is_wp_error( $files ) || is_wp_error( $total_count ) ) {
			return array();
		}

		$files = $this->process_files(
			$files,
			$return_type,
			array(
				'filter_sql'    => $filter_sql,
				'filter_params' => $filter_params,
			)
		);

		$result = array(
			'files'       => $files,
			'total_count' => isset( $total_count['count'] ) ? (int) $total_count['count'] : count( $files ),
		);

		wp_cache_set( $cache_key, $result, 'pnpnd_files', HOUR_IN_SECONDS );

		return $result;
	}

	/**
	 * Retrieve selected attributes from files by their keys.
	 *
	 * @param array $keys An array of file keys to search for.
	 * @param array $attributes An array of attributes to return for each file.
	 *                          Defaults to ['id'].
	 *                          Example: ['file_key', 'name'].
	 *
	 * @return WP_Error|array Returns:
	 *                        - A flat array if one attribute is requested (e.g., ['id1', 'id2']).
	 *                        - An array of associative arrays if multiple attributes are requested.
	 *                        Example:
	 *                        [
	 *                        ['file_key' => 'abc123', 'name' => 'File A'],
	 *                        ['file_key' => 'def456', 'name' => 'File B']
	 *                        ]
	 */
	public function get_file_attributes_by_keys( array $keys, array $attributes = array( 'id' ) ) {
		if ( empty( $keys ) ) {
			return array();
		}

		$placeholders = implode( ',', array_fill( 0, count( $keys ), '%s' ) );

		global $wpdb;

		$cache_key = 'pnpnd_file_by_keys_' . md5( implode( ',', $keys ) . implode( ',', $attributes ) );

		$cache_files = wp_cache_get( $cache_key, 'pnpnd_files' );
		if ( false !== $cache_files ) {
			return $cache_files;
		}

		$files = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM %i WHERE `file_key` IN ($placeholders)", array_merge( array( $this->table_name ), $keys ) ), ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare, WordPress.DB.DirectDatabaseQuery.DirectQuery

		if ( empty( $files ) ) {
			return array();
		}

		$processed_files = $this->process_files( $files, 'object' );

		$first_file = reset( $processed_files );
		if ( Account::get_instance()->is_valid_account( $first_file->account_id ) === false ) {
			return new WP_Error( 403, __( 'This account is lost or does not exist. Please re-authorize it.', 'ninja-drive' ) );
		}

		if ( 1 === count( $attributes ) ) {
			$attr   = $attributes[0];
			$result = array();
			foreach ( $processed_files as $file ) {
				$result[] = $file->$attr ?? null;
			}

			return $result;
		}

		$result = array();
		foreach ( $processed_files as $file ) {
			$file_data = array();
			foreach ( $attributes as $attr ) {
				$file_data[ $attr ] = $file->$attr ?? null;
			}
			$result[] = $file_data;
		}

		wp_cache_set( $cache_key, $result, 'pnpnd_files', HOUR_IN_SECONDS );

		return $result;
	}

	public function add_file( array $data ) {
		$account_id = isset( $data['account_id'] ) ? $data['account_id'] : null;
		if ( ! Account::get_instance()->is_valid_account( $account_id ) ) {
			return new WP_Error( 'error', __( 'This account is lost or does not exist. Please re-authorize it.', 'ninja-drive' ) );
		}

		$file = array(
			'id'              => $data['id'] ?? null,
			'file_key'        => $data['file_key'] ?? null,
			'name'            => $data['name'] ?? null,
			'description'     => $data['description'] ?? null,
			'parent_id'       => $data['parent_id'] ?? null,
			'account_id'      => $data['account_id'] ?? null,
			'size'            => $data['size'] ?? null,
			'mime_type'       => $data['mime_type'] ?? null,
			'extension'       => $data['extension'] ?? null,
			'icon'            => $data['icon'] ?? null,
			'thumbnail'       => $data['thumbnail'] ?? null,
			'additional_data' => isset( $data['additional_data'] ) ? maybe_serialize( $data['additional_data'] ) : null,
			'is_dir'          => $data['is_dir'] ?? null,
			'is_shared'       => $data['is_shared'] ?? null,
			'is_starred'      => $data['is_starred'] ?? null,
			'media'           => isset( $data['media'] ) ? maybe_serialize( $data['media'] ) : null,
			'permissions'     => isset( $data['permissions'] ) ? maybe_serialize( $data['permissions'] ) : null,
			'created_at'      => current_time( 'mysql' ),
			'updated_at'      => current_time( 'mysql' ),
		);

		if ( empty( $file['id'] ) || empty( $file['account_id'] ) ) {
			return new WP_Error( 404, __( 'The requested file could not be found. 7', 'ninja-drive' ) );
		}

		$format = array(
			'%s', // id
			'%s', // file_key
			'%s', // name
			'%s', // description
			'%s', // parent_id
			'%s', // account_id
			'%d', // size
			'%s', // mime_type
			'%s', // extension
			'%s', // icon
			'%s', // thumbnail
			'%s', // additional_data
			'%d', // is_dir
			'%d', // is_shared
			'%d', // is_starred
			'%s', // media
			'%s', // permissions
			'%s', // created_at
			'%s', // updated_at
		);

		if ( $this->is_cached_file( $file['id'], $file['account_id'] ) ) {
			$id         = $file['id'];
			$account_id = $file['account_id'];

			unset( $file['id'] );
			unset( $file['file_key'] );
			unset( $file['created_at'] );

			$update_format = array_slice( $format, 2 );
			array_pop( $update_format );

			return $this->update(
				$file,
				array(
					'id'         => $id,
					'account_id' => $account_id,
				),
				$update_format,
				array( '%s', '%s' )
			);
		}

		return $this->insert( $file, $format );
	}

	/**
	 * Delete a file from the database
	 *
	 * @param string $id The ID of the file to be deleted
	 *
	 * @return bool|WP_Error True if the deletion was successful, false otherwise
	 */
	public function delete_file( $id, $account_id ) {
		if ( ! Account::get_instance()->is_valid_account( $account_id ) ) {
			return new WP_Error( 'error', __( 'This account is lost or does not exist. Please re-authorize it.', 'ninja-drive' ) );
		}

		$file = $this->get_file( $id, $account_id );
		if ( is_wp_error( $file ) ) {
			return $file;
		}

		if ( $file->is_dir ) {
			$successors = $this->get_successors( $id, $account_id );
			if ( is_wp_error( $successors ) ) {
				return $successors;
			}
			if ( empty( $successors ) ) {
				return 0;
			}

			global $wpdb;

			$placeholders = implode( ',', array_fill( 0, count( $successors ), '%s' ) );

			$sql = $wpdb->prepare( "DELETE FROM %i WHERE (id IN ($placeholders) OR parent_id IN ($placeholders)) AND account_id = %s", array_merge( array( $this->table_name ), $successors, $successors, array( $account_id ) ) ); // phpcs:ignore WordPress.DB.PreparedSQLPlaceholders.ReplacementsWrongNumber, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.PreparedSQL.InterpolatedNotPrepared

			$cache_key             = "pnpnd_file_{$id}";
			$file_key              = pnpnd_generate_key( $id, $account_id );
			$cache_key_by_file_key = "pnpnd_file_key_{$file_key}";

			wp_cache_delete( $cache_key, 'pnpnd_files' );
			wp_cache_delete( $cache_key_by_file_key, 'pnpnd_files' );

			return false !== $wpdb->query( $sql ); // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery
		}

		$cache_key             = "pnpnd_file_{$id}";
		$file_key              = pnpnd_generate_key( $id, $account_id );
		$cache_key_by_file_key = "pnpnd_file_key_{$file_key}";

		wp_cache_delete( $cache_key, 'pnpnd_files' );
		wp_cache_delete( $cache_key_by_file_key, 'pnpnd_files' );

		return $this->delete(
			array(
				'id'         => $id,
				'account_id' => $account_id,
			),
			array( '%s', '%s' )
		);
	}

	/**
	 * Deletes all files associated with a given account ID from the database.
	 *
	 * @param string $account_id The ID of the account whose files are to be deleted.
	 * @return bool|WP_Error True if the deletion was successful, false otherwise or an error.
	 */
	public function delete_files_by_account_id( $account_id ) {
		wp_cache_flush_group( 'pnpnd_files' );

		return $this->delete( array( 'account_id' => $account_id ), array( '%s' ) );
	}

	/**
	 * Update a file in the database
	 *
	 * @param string $id The ID of the file to be updated
	 * @param array  $data The data to be updated
	 * @param array  $data_format The format of the data
	 * @return bool|WP_Error True if the update was successful, false otherwise
	 */
	public function update_file( $id, $data, $data_format ) {
		$cache_key = "pnpnd_file_{$id}";

		wp_cache_delete( $cache_key, 'pnpnd_files' );

		return $this->update( $data, array( 'id' => $id ), $data_format, array( '%s' ) );
	}

	public function is_cached_folder( $folder_id, $account_id ) {
		global $wpdb;
		if ( Account::get_instance()->is_valid_account( $account_id ) === false ) {
			return new WP_Error( 403, __( 'This account is lost or does not exist. Please re-authorize it.', 'ninja-drive' ) );
		}

		$cache_key = "pnpnd_file_{$folder_id}";
		if ( wp_cache_get( $cache_key, 'pnpnd_files' ) ) {
			return true;
		}

		$folder = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM %i WHERE parent_id = %s AND account_id = %s', $this->table_name, $folder_id, $account_id ) ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery

		if ( is_wp_error( $folder ) || empty( $folder ) ) {
			return false;
		}

		wp_cache_add( $cache_key, $folder, 'pnpnd_files', HOUR_IN_SECONDS );

		return ! empty( $folder );
	}

	public function is_cached_file( $folder_id, $account_id ) {
		if ( Account::get_instance()->is_valid_account( $account_id ) === false ) {
			return new WP_Error( 403, __( 'This account is lost or does not exist. Please re-authorize it.', 'ninja-drive' ) );
		}

		$cache_key = "pnpnd_file_{$folder_id}";
		if ( wp_cache_get( $cache_key, 'pnpnd_files' ) ) {
			return true;
		}

		global $wpdb;

		$folder = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM %i WHERE id = %s AND account_id = %s', $this->table_name, $folder_id, $account_id ) ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery

		if ( is_wp_error( $folder ) || empty( $folder ) ) {
			return false;
		}

		wp_cache_add( $cache_key, $folder, 'pnpnd_files', HOUR_IN_SECONDS );

		return ! empty( $folder );
	}

	/**
	 * Counts the number of files in a folder
	 *
	 * @param string $folder_id The ID of the folder
	 * @param string $account_id The ID of the account
	 *
	 * @return int|WP_Error The number of files in the folder, or a WP_Error if the query fails
	 */
	public function children_count( $folder_id, $account_id, $filter = null ) {
		global $wpdb;
		$sql = $wpdb->prepare( 'SELECT COUNT(*) as count FROM %i WHERE parent_id = %s AND account_id = %s', array( $this->table_name, $folder_id, $account_id ) );

		if ( ! empty( $filter['filter_params'] ) && ! empty( $filter['filter_sql'] ) ) {

			$sql .= $wpdb->prepare( $filter['filter_sql'], $filter['filter_params'] ); // phpcs:ignore WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare, WordPress.DB.PreparedSQL.NotPrepared
		}

		$cache_key    = "pnpnd_child_folder_count_{$folder_id}_{$account_id}";
		$cached_count = wp_cache_get( $cache_key, 'pnpnd_folder_counts' );
		if ( false !== $cached_count ) {
			return $cached_count;
		}

		$count = $wpdb->get_row( $sql ); // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, PluginCheck.Security.DirectDB.UnescapedDBParameter

		if ( is_wp_error( $count ) ) {

			return $count;
		}

		if ( ! isset( $count->count ) ) {
			return 0;
		}

		wp_cache_add( $cache_key, $count->count, 'pnpnd_folder_counts', HOUR_IN_SECONDS );

		return $count->count;
	}

	public function get_successors( string $parent_id, string $account_id ) {
		$successor = array();
		$folders   = $this->get_child_folder_ids( $parent_id, $account_id );

		foreach ( $folders as $folder_row ) {
			$folder_id     = $folder_row['id'];
			$successor[]   = $folder_id;
			$child_folders = $this->get_child_folder_ids( $folder_id, $account_id );
			if ( ! empty( $child_folders ) ) {
				$successor = array_merge( $successor, $this->get_successors( $folder_id, $account_id ) );
			}
		}

		$successor[] = $parent_id;

		return array_unique( $successor );
	}

	public function get_shared_key( string $file_key, array $options = array() ) {
		$defaults = array(
			'expire_in' => 3600,
			'password'  => null,
		);

		$options = wp_parse_args( $options, $defaults );

		$expire_in = intval( $options['expire_in'] );
		$password  = sanitize_text_field( $options['password'] ?? null );

		$expiry        = 0 < $expire_in ? time() + $expire_in : 0;
		$password_hash = ! empty( $password ) ? md5( $password ) : '';

		$shared_data = $this->get_shared_data( $file_key );

		$key = md5( "$file_key|$expiry|$password_hash" );

		if ( ! empty( $shared_data[ $key ] ) && time() <= $shared_data[ $key ]['expiry'] ) {
			return "{$file_key}-{$key}";
		}

		$shared_data[ $key ] = array(
			'expiry'      => $expiry,
			'password'    => $password_hash,
			'view_count'  => 0,
			'last_viewed' => null,
		);

		$this->save_shared_data( $file_key, $shared_data );

		return "{$file_key}-{$key}";
	}

	public function update_shared_key__premium_only( string $file_key, string $share_link_id, array $options = array() ) {
		$shared_data = $this->get_shared_data( $file_key );

		if ( empty( $shared_data[ $share_link_id ] ) ) {
			return new WP_Error( 404, __( 'The specified share link does not exist.', 'ninja-drive' ) );
		}

		$share_info = $shared_data[ $share_link_id ];

		$expire_in = isset( $options['expire_in'] ) ? intval( $options['expire_in'] ) : null;
		$password  = isset( $options['password'] ) ? sanitize_text_field( $options['password'] ) : null;

		if ( null !== $expire_in ) {
			$share_info['expiry'] = 0 < $expire_in ? time() + $expire_in : 0;
		}

		if ( null !== $password ) {
			$share_info['password'] = ! empty( $password ) ? md5( $password ) : '';
		}

		$shared_data[ $share_link_id ] = $share_info;

		return $this->save_shared_data( $file_key, $shared_data );
	}

	public function delete_shared_key( string $file_key, string $share_link_id ) {
		$shared_data = $this->get_shared_data( $file_key );

		if ( empty( $shared_data[ $share_link_id ] ) && 'all' !== $share_link_id ) {
			return new WP_Error( 404, __( 'The specified share link does not exist.', 'ninja-drive' ) );
		}

		if ( 'all' === $share_link_id ) {
			$shared_data = null;
		} else {
			unset( $shared_data[ $share_link_id ] );

			if ( empty( $shared_data ) ) {
				$shared_data = null;
			}
		}

		return $this->save_shared_data( $file_key, $shared_data );
	}

	public function validate_shared_link( string $combined_key, string $password = '' ) {
		[$file_key, $link_key] = $this->parse_combined_key( $combined_key );

		if ( ! $file_key || ! $link_key ) {

			return false;
		}

		$shared_data = $this->get_shared_data( $file_key );

		if ( empty( $shared_data[ $link_key ] ) ) {
			return false;
		}

		$share_info = $shared_data[ $link_key ];

		if ( time() > $share_info['expiry'] && 0 !== $share_info['expiry'] ) {
			$this->delete_shared_entry( $file_key, $link_key );

			return false;
		}

		$hashed_password = md5( sanitize_text_field( $password ) );
		if ( ! empty( $share_info['password'] ) ) {
			if ( empty( $password ) ) {
				return new WP_Error( 'password_required', __( 'This shared link is protected by a password. Please provide the password to access the file.', 'ninja-drive' ) );
			}

			if ( $hashed_password !== $share_info['password'] ) {
				return new WP_Error( 'invalid_password', __( 'The provided password is incorrect.', 'ninja-drive' ) );
			}
		}

		$share_info['view_count']  = intval( $share_info['view_count'] ?? 0 ) + 1;
		$share_info['last_viewed'] = current_time( 'mysql' );

		$result = $this->update_shared_data( $combined_key, $share_info );

		if ( is_wp_error( $result ) ) {
			return false;
		}

		return $shared_data[ $link_key ];
	}

	public function validate_download_link( string $combined_key, string $password = '' ) {
		[$file_key, $link_key] = $this->parse_combined_key( $combined_key );

		if ( ! $file_key || ! $link_key ) {

			return false;
		}

		$download_data = $this->get_download_data( $file_key );

		if ( empty( $download_data[ $link_key ] ) ) {
			return false;
		}

		$download_info = $download_data[ $link_key ];

		if ( time() > $download_info['expiry'] && 0 !== $download_info['expiry'] ) {
			return new WP_Error( 'link_expired', __( 'This download link has expired.', 'ninja-drive' ) );
		}

		$download_limit = intval( $download_info['limit'] ?? 0 );

		if ( 0 < $download_limit && $download_limit <= intval( $download_info['download_count'] ?? 0 ) ) {
			return new WP_Error( 'download_limit_exceeded', __( 'The download limit for this link has been exceeded.', 'ninja-drive' ) );
		}

		$hashed_password = md5( sanitize_text_field( $password ) );
		if ( ! empty( $download_info['password'] ) ) {
			if ( empty( $password ) ) {
				return new WP_Error( 'password_required', __( 'This Download link is protected by a password. Please provide the password to access the file.', 'ninja-drive' ) );
			}

			if ( $hashed_password !== $download_info['password'] ) {
				return new WP_Error( 'invalid_password', __( 'The provided password is incorrect.', 'ninja-drive' ) );
			}
		}

		$download_info['download_count'] = intval( $download_info['download_count'] ?? 0 ) + 1;
		$download_info['last_viewed']    = current_time( 'mysql' );

		$result = $this->update_download_data( $combined_key, $download_info );

		if ( is_wp_error( $result ) ) {
			return false;
		}

		return $download_data[ $link_key ];
	}

	public function get_download_key( string $file_key, array $options = array() ) {
		$defaults = array(
			'expire_in' => 3600,
			'password'  => null,
			'limit'     => 0,
		);

		$options = wp_parse_args( $options, $defaults );

		$expire_in = intval( $options['expire_in'] );
		$password  = sanitize_text_field( $options['password'] ?? null );
		$limit     = intval( $options['limit'] );

		$expiry        = 0 < $expire_in ? time() + $expire_in : 0;
		$password_hash = ! empty( $password ) ? md5( $password ) : '';

		$download_data = $this->get_download_data( $file_key );

		$key = md5( "$file_key|$expiry|$password_hash|$limit" );

		if ( ! empty( $download_data[ $key ] ) && time() <= $download_data[ $key ]['expiry'] ) {
			return "{$file_key}-{$key}";
		}

		$download_data[ $key ] = array(
			'expiry'      => $expiry,
			'password'    => $password_hash,
			'limit'       => $limit,
			'view_count'  => 0,
			'last_viewed' => null,
		);

		$this->save_download_data( $file_key, $download_data );

		return "{$file_key}-{$key}";
	}

	public function update_download_key__premium_only( string $file_key, string $download_link_id, array $options = array() ) {
		$download_data = $this->get_download_data( $file_key );

		if ( empty( $download_data[ $download_link_id ] ) ) {
			return new WP_Error( 404, __( 'The specified download link does not exist.', 'ninja-drive' ) );
		}

		$download_info = $download_data[ $download_link_id ];

		$expire_in = isset( $options['expire_in'] ) ? intval( $options['expire_in'] ) : null;
		$password  = isset( $options['password'] ) ? sanitize_text_field( $options['password'] ) : null;
		$limit     = isset( $options['limit'] ) ? intval( $options['limit'] ) : null;

		if ( null !== $expire_in ) {
			$download_info['expiry'] = 0 < $expire_in ? time() + $expire_in : 0;
		}

		if ( null !== $password ) {
			$download_info['password'] = ! empty( $password ) ? md5( $password ) : '';
		}

		if ( null !== $limit ) {
			$download_info['limit'] = $limit;
		}

		$download_data[ $download_link_id ] = $download_info;

		return $this->save_download_data( $file_key, $download_data );
	}

	public function delete_download_key( string $file_key, string $download_link_id ) {
		$download_data = $this->get_download_data( $file_key );

		if ( empty( $download_data[ $download_link_id ] ) && 'all' !== $download_link_id ) {
			return new WP_Error( 404, __( 'The specified download link does not exist.', 'ninja-drive' ) );
		}

		if ( 'all' === $download_link_id ) {
			$download_data = null;
		} else {
			unset( $download_data[ $download_link_id ] );

			if ( empty( $download_data ) ) {
				$download_data = null;
			}
		}

		return $this->save_download_data( $file_key, $download_data );
	}

	private function parse_combined_key( string $combined_key ) {
		$parts = explode( '-', $combined_key, 2 );

		return array( $parts[0] ?? '', $parts[1] ?? '' );
	}

	private function get_shared_data( string $file_key ) {
		$file = $this->get_file_by_key( $file_key );

		if ( ! $file ) {
			return array();
		}

		$meta = File_Meta::get_instance()->get_meta( $file_key, 'shared_data' );

		return is_array( $meta ) ? $meta : array();
	}

	private function save_shared_data( string $file_key, ?array $shared_data ) {
		$file = $this->get_file_by_key( $file_key );

		if ( ! $file ) {
			return false;
		}

		File_Meta::get_instance()->update_meta( $file_key, 'shared_data', $shared_data );

		return $this->get_shared_data( $file_key );
	}

	private function delete_shared_entry( string $file_key, string $link_key ) {
		$shared_data = $this->get_shared_data( $file_key );

		if ( isset( $shared_data[ $link_key ] ) ) {
			unset( $shared_data[ $link_key ] );

			return $this->save_shared_data( $file_key, $shared_data );
		}

		return false;
	}

	public function update_shared_data( string $combined_key, array $updates = array() ) {
		[$file_key, $link_key] = $this->parse_combined_key( $combined_key );

		if ( ! $file_key || ! $link_key ) {
			return false;
		}

		$shared_data = $this->get_shared_data( $file_key );

		if ( empty( $shared_data[ $link_key ] ) ) {
			return false;
		}

		$shared_data[ $link_key ] = array_merge(
			$shared_data[ $link_key ],
			array_filter(
				$updates,
				function ( $v ) {
					return null !== $v;
				}
			)
		);

		return $this->save_shared_data( $file_key, $shared_data );
	}

	private function get_download_data( string $file_key ) {
		global $wpdb;

		$file = $this->get_file_by_key( $file_key );

		if ( ! $file ) {
			return array();
		}

		if ( 'folder' === $file->extension ) {
			return array();
		}

		$meta = File_Meta::get_instance()->get_meta( $file_key, 'download_data' );

		return is_array( $meta ) ? $meta : array();
	}

	private function save_download_data( string $file_key, ?array $download_data ) {
		global $wpdb;

		$file = $this->get_file_by_key( $file_key );

		if ( ! $file ) {
			return false;
		}

		File_Meta::get_instance()->update_meta( $file_key, 'download_data', $download_data );

		return $this->get_download_data( $file_key );
	}

	public function update_download_data( string $combined_key, array $updates = array() ) {
		[$file_key, $link_key] = $this->parse_combined_key( $combined_key );

		if ( ! $file_key || ! $link_key ) {
			return false;
		}

		$download_data = $this->get_download_data( $file_key );

		if ( empty( $download_data[ $link_key ] ) ) {
			return false;
		}

		$download_data[ $link_key ] = array_merge(
			$download_data[ $link_key ],
			array_filter(
				$updates,
				function ( $v ) {
					return null !== $v;
				}
			)
		);

		return $this->save_download_data( $file_key, $download_data );
	}

	public function shared_files( array $args = array() ) {
		return $this->files_by_meta_key( 'shared_data', $args );
	}

	public function downloaded_files( array $args = array() ) {
		return $this->files_by_meta_key( 'download_data', $args );
	}

	public function cached_files( array $args = array() ) {
		return $this->files_by_meta_key( 'cached_data', $args );
	}

	private function files_by_meta_key( string $meta_key, array $args = array() ) {
		global $wpdb;

		$defaults = array(
			'account_id' => null,
			'per_page'   => 5,
			'page'       => 1,
			'order_by'   => 'updated_at',
			'order'      => 'DESC',
		);
		$args     = wp_parse_args( $args, $defaults );

		$account_id = $args['account_id'];

		if ( empty( $account_id ) ) {
			$account = Accounts::get_instance()->get_account();
			if ( is_wp_error( $account ) ) {
				return $account;
			}

			$account_id = $account ? $account->get_id() : null;
		}

		$per_page = (int) $args['per_page'];
		$page     = (int) $args['page'];

		$pagination = $this->sanitize_pagination( $page, $per_page );
		$order      = $this->sanitize_order( $args['order'] );
		$order_by   = $this->sanitize_order_by( $args['order_by'], array( 'name', 'created_at', 'updated_at', 'size' ) );

		$meta_table = File_Meta::get_instance()->get_table_name();

		$sql = $wpdb->prepare(
			"SELECT f.* FROM %i f INNER JOIN %i fm ON f.file_key = fm.file_key WHERE fm.meta_key = %s AND `meta_value` IS NOT NULL AND `meta_value` != '' AND `meta_value` != 'a:0:{}'",
			$this->table_name,
			$meta_table,
			$meta_key
		);

		$count_sql = $wpdb->prepare(
			"SELECT COUNT(*) FROM %i f INNER JOIN %i fm ON f.file_key = fm.file_key WHERE fm.meta_key = %s AND `meta_value` IS NOT NULL AND `meta_value` != '' AND `meta_value` != 'a:0:{}'",
			$this->table_name,
			$meta_table,
			$meta_key
		);

		if ( $args['account_id'] ) {
			$sql       .= $wpdb->prepare( ' AND f.`account_id` = %s', $args['account_id'] );
			$count_sql .= $wpdb->prepare( ' AND f.`account_id` = %s', $args['account_id'] );
		}

		if ( 'ASC' === $order ) {
			$sql .= $wpdb->prepare( ' ORDER BY f.%i ASC LIMIT %d OFFSET %d', $order_by, $pagination['per_page'], $pagination['offset'] );
		} else {
			$sql .= $wpdb->prepare( ' ORDER BY f.%i DESC LIMIT %d OFFSET %d', $order_by, $pagination['per_page'], $pagination['offset'] );
		}

		$files = $wpdb->get_results( $sql, ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
		$total = $wpdb->get_var( $count_sql ); // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared

		if ( is_wp_error( $files ) ) {
			return $files;
		}

		if ( empty( $files ) ) {
			return array(
				'files'        => array(),
				'total'        => 0,
				'per_page'     => $pagination['per_page'],
				'current_page' => $pagination['page'],
				'total_pages'  => 0,
				'has_more'     => false,
				'next_page'    => null,
			);
		}

		$files = $this->process_files( $files );

		$result = array(
			'files'        => $files,
			'total'        => (int) $total,
			'per_page'     => $pagination['per_page'],
			'current_page' => $pagination['page'],
			'total_pages'  => ceil( $total / $pagination['per_page'] ),
			'has_more'     => $total > $pagination['page'] * $pagination['per_page'],
			'next_page'    => $total > $pagination['page'] * $pagination['per_page'] ? $pagination['page'] + 1 : null,
		);

		return $result;
	}

	private function process_files( array $files, $return_type = 'array', $filter = null ) {
		if ( empty( $files ) ) {
			return array();
		}

		// Batch-load meta to avoid N+1 queries in list views.
		$file_keys = array();
		foreach ( $files as $file ) {
			if ( isset( $file['file_key'] ) ) {
				$file_keys[] = $file['file_key'];
			}
		}

		$all_meta = array();
		if ( ! empty( $file_keys ) ) {
			$all_meta = File_Meta::get_instance()->get_meta_for_files( $file_keys );
		}

		$processed_files = array();
		foreach ( $files as $file ) {
			$file['__batch_meta__'] = $all_meta[ $file['file_key'] ] ?? array();
			$processed_files[]      = $this->process_file( $file, $return_type, $filter );
		}

		return $processed_files;
	}

	private function process_file( array $file, $return_type = 'object', $filter = null ) {
		if ( empty( $file ) || ! is_array( $file ) ) {

			return array();
		}

		$file_data['thumbnail'] = ( 0 < Helpers::check_lifetime( $file['updated_at'] ) ) ? $file['thumbnail'] : null;

		// Prefer meta loaded in batch by process_files(); otherwise fall back to a single lookup.
		if ( isset( $file['__batch_meta__'] ) ) {
			$resolved_meta = ! empty( $file['__batch_meta__'] ) ? $file['__batch_meta__'] : false;
			unset( $file['__batch_meta__'] );
		} else {
			$resolved_meta = $this->load_file_meta( $file['file_key'] );
		}

		$file_data = array(
			'id'              => $file['id'],
			'file_key'        => $file['file_key'],
			'name'            => $file['name'],
			'description'     => $file['description'],
			'parent_id'       => $file['parent_id'],
			'account_id'      => $file['account_id'],
			'size'            => $file['size'],
			'mime_type'       => $file['mime_type'],
			'extension'       => $file['extension'],
			'icon'            => $file['icon'],
			'additional_data' => maybe_unserialize( $file['additional_data'] ),
			'meta_data'       => $resolved_meta,
			'is_dir'          => $file['is_dir'],
			'is_shared'       => $file['is_shared'],
			'is_starred'      => $file['is_starred'],
			'media'           => maybe_unserialize( $file['media'] ),
			'permissions'     => maybe_unserialize( $file['permissions'] ),
			'created_at'      => $file['created_at'],
			'updated_at'      => $file['updated_at'],
		);

		if ( 'object' === $return_type ) {

			$file = new \Pnpnd\ND\App\File( $file_data );

			return $file;
		} elseif ( 'array' === $return_type ) {

			return $file_data;
		}

		return array(
			'id'        => $file['id'],
			'name'      => $file['name'],
			'file_key'  => $file['file_key'],
			'mime_type' => $file['mime_type'],
			'size'      => $file['size'],
		);
	}

	/**
	 * Single-file meta lookup. Used by `process_file()` only when the row is
	 * not part of a batch (e.g. direct calls to `get_file()` / `get_file_by_key()`).
	 */
	private function load_file_meta( string $file_key ) {
		if ( empty( $file_key ) ) {
			return false;
		}

		$meta = File_Meta::get_instance()->get_all_meta( $file_key );
		if ( empty( $meta ) ) {
			return false;
		}

		return $meta;
	}

	private function process_extensions( array $extensions, array $additional_extensions, string $filter_type ): array {
		if ( empty( $additional_extensions ) ) {
			return $extensions;
		}

		if ( empty( $extensions ) ) {
			return $additional_extensions;
		}

		if ( 'include' === $filter_type ) {
			$filter_extensions = array_filter(
				$extensions,
				function ( $ext ) use ( $additional_extensions ) {
					return in_array( $ext, $additional_extensions, true );
				}
			);

			return array_values( $filter_extensions );
		} elseif ( 'ignore' === $filter_type ) {
			$filter_extensions = array_filter(
				$extensions,
				function ( $ext ) use ( $additional_extensions ) {
					return ! in_array( $ext, $additional_extensions, true );
				}
			);

			return array_values( $filter_extensions );
		}

		return $extensions;
	}

	private function get_child_folder_ids( string $parent_id, string $account_id ) {
		global $wpdb;

		$cache_key     = "pnpnd_child_folder_ids_{$parent_id}_{$account_id}";
		$cached_result = wp_cache_get( $cache_key, 'pnpnd_files' );
		if ( false !== $cached_result ) {
			return $cached_result;
		}

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
		$result = $wpdb->get_results(
			$wpdb->prepare( "SELECT `id` FROM %i WHERE `parent_id` = %s AND `account_id` = %s AND `extension` = 'folder'", $this->table_name, $parent_id, $account_id ),
			ARRAY_A
		);

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		wp_cache_add( $cache_key, $result, 'pnpnd_files', HOUR_IN_SECONDS );

		return $result;
	}

	private function process_naming_filters__premium_only( string $names_string, array $apply_names_filter, string $names_filter_type ) {

		if ( ! empty( $names_string ) && ! empty( $apply_names_filter ) ) {
			$names     = array_map( 'trim', explode( ',', $names_string ) );
			$sql_names = array_map(
				fn ( $p ) => strtr(
					$p,
					array(
						'*' => '%',
						'?' => '_',
					)
				),
				$names
			);

			$type_where  = array();
			$type_params = array();
			foreach ( $apply_names_filter as $type => $value ) {
				if ( ! $value ) {
					continue;
				}

				$type_where[]  = 'is_dir = %d';
				$type_params[] = ( 'folders' === $type ) ? 1 : 0;
			}

			$type_sql = $type_where ? '(' . implode( ' OR ', $type_where ) . ')' : '';

			$name_where  = array();
			$name_params = array();

			$like_op    = ( 'include' === $names_filter_type ) ? 'LIKE' : 'NOT LIKE';
			$glue       = ( 'include' === $names_filter_type ) ? 'OR' : 'AND';
			$multi_type = 1 < count( $type_params );

			foreach ( $sql_names as $pat ) {
				if ( $multi_type ) {
					$name_where[] = "($type_sql AND name $like_op %s)";
					$name_params  = array_merge( $name_params, $type_params, array( $pat ) );
				} else {
					$name_where[] = "($type_sql AND name $like_op %s OR is_dir != %d)";
					$name_params  = array_merge( $name_params, $type_params, array( $pat ), $type_params );
				}
			}

			if ( $name_where ) {
				$sql = ' AND (' . implode( " $glue ", $name_where ) . ')';

				return array(
					'sql'        => $sql,
					'params'     => $name_params,
					'sql_glue'   => $glue,
					'name_where' => $name_where,
				);
			}

			return array();
		}
	}

	public function add_to_cache( $file_key, $size ) {
		if ( empty( $file_key ) ) {
			return false;
		}

		$cached_data          = File_Meta::get_instance()->get_meta( $file_key, 'cached_data' ) ?? array();
		$cached_data[ $size ] = current_time( 'mysql' );

		delete_transient( 'pnpnd_dashboard_image_cache' );

		return File_Meta::get_instance()->update_meta( $file_key, 'cached_data', $cached_data );
	}

	public function clear_cache_files( $size = null ) {
		global $wpdb;

		$meta_table = File_Meta::get_instance()->get_table_name();

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
		$files = $wpdb->get_col(
			$wpdb->prepare(
				'SELECT `file_key` FROM %i WHERE `meta_key` = %s',
				$meta_table,
				'cached_data'
			)
		);

		if ( is_wp_error( $files ) || empty( $files ) ) {
			return true;
		}

		foreach ( $files as $file_key ) {
			$this->clear_cache( $file_key, $size );
		}

		return true;
	}

	public function clear_cache( $file_key, $size = null ) {
		if ( empty( $file_key ) ) {
			return false;
		}

		if ( $size ) {
			$cached_data = File_Meta::get_instance()->get_meta( $file_key, 'cached_data' ) ?? array();
			unset( $cached_data[ $size ] );
			$result = File_Meta::get_instance()->update_meta( $file_key, 'cached_data', $cached_data );
		} else {
			$result = File_Meta::get_instance()->delete_meta( $file_key, 'cached_data' );
		}

		delete_transient( 'pnpnd_dashboard_image_cache' );

		return ! is_wp_error( $result ) && $result;
	}
}
