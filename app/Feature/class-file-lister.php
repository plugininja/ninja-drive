<?php

namespace Pnpnd\ND\App\Feature;

use Pnpnd\ND\App\Accounts;
use Pnpnd\ND\App\Service\File_Service;
use Pnpnd\ND\Models\Files;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class File_Lister {

	private $files;

	private $cache_synchronizer;

	public function __construct( File_Service $files ) {
		$this->files              = $files;
		$this->cache_synchronizer = new Cache_Synchronizer();
	}

	public function get_files( array $args = array() ) {
		$args = $this->prepare_args( $args );

		$folder_id  = $args['id'] ?? null;
		$account_id = $args['account_id'] ?? null;

		if ( empty( $folder_id ) || empty( $account_id ) ) {
			return array();
		}

		$is_cached = Files::get_instance()->is_cached_folder( $folder_id, $account_id );

		$files         = array();
		$is_new_folder = false;

		if ( 'server' !== $args['from'] && $is_cached ) {
			$files = $this->fetch_files_from_cache( $args );
		} else {
			$files = $this->fetch_files_from_server( $args );

			if ( is_wp_error( $files ) ) {
				return $files;
			}

			$is_new_folder = ! empty( array_filter( $files, fn ( $file ) => $file['is_dir'] ?? false ) );
			Accounts::get_instance()->sync_account( $account_id );
		}

		if ( is_wp_error( $files ) ) {
			return $files;
		}

		$response                  = $this->prepare_response( $files, $args );
		$response['is_new_folder'] = $is_new_folder;

		return $response;
	}

	public function fetch_files_from_server( array $args ) {
		$folder_id  = $args['id'] ?? null;
		$account_id = $args['account_id'] ?? null;

		if ( empty( $folder_id ) || empty( $account_id ) ) {
			return array();
		}

		$files = array();

		if ( 'shared-drives' === $folder_id ) {
			$files = $this->files->list_drives();

			return $files;
		} else {
			$params = $this->build_server_params( $args, $folder_id );

			$files           = $this->files->list_files( $params );
			$cache_key       = "pnpnd_child_folder_ids_{$folder_id}_{$account_id}";
			$cache_key_count = "pnpnd_child_folder_count_{$folder_id}_{$account_id}";

			wp_cache_delete( $cache_key, 'pnpnd_files' );
			wp_cache_delete( $cache_key_count, 'pnpnd_files' );
			wp_cache_flush_group( 'pnpnd_files' );
		}

		if ( is_wp_error( $files ) ) {
			return $files;
		}

		if ( empty( $files ) ) {
			return array();
		}

		if ( empty( $args['query'] ) ) {
			$this->cache_synchronizer->remove_stale_files_from_database( $files, $args );
		}

		return $this->fetch_files_from_cache( $args );
	}

	private function prepare_args( $args ) {
		$default_args = array(
			'from'         => 'cache',
			'order'        => 'ASC',
			'order_by'     => 'folder,name',
			'filters'      => array(),
			'limit'        => 0,
			'file_numbers' => 0,
		);

		return wp_parse_args( $args, $default_args );
	}

	private function build_server_params( array $args, string $folder_id ) {
		$query = 'trashed=false';

		switch ( true ) {
			case ! empty( $args['query'] ):
				$query = $args['query'];
				break;
			case 'computers' === $folder_id:
				$query = "'me' in owners and mimeType='application/vnd.google-apps.folder' and trashed=false";
				break;
			case 'shared' === $folder_id:
				$query = 'sharedWithMe=true and trashed=false';
				break;
			case 'starred' === $folder_id:
				$query = 'starred=true and trashed=false';
				break;
			default:
				$query .= " and '$folder_id' in parents";
				break;
		}

		$replace_order_by = array(
			'name'      => 'folder,name',
			'size'      => 'folder,quotaBytesUsed',
			'createdAt' => 'folder,createdTime',
			'updatedAt' => 'folder,modifiedTime',
		);

		$requested_field = $args['orderBy'] ?? 'name';
		$sort_direction  = strtolower( $args['order'] ?? 'asc' ) === 'desc' ? 'desc' : 'asc';

		$mapped_field = $replace_order_by[ $requested_field ] ?? $requested_field;

		$mapped_fields  = explode( ',', $mapped_field );
		$order_by_parts = array();

		foreach ( $mapped_fields as $field ) {
			$field = trim( $field );

			if ( in_array( $field, array( 'folder' ), true ) ) {
				$order_by_parts[] = $field;
			} elseif ( in_array( $field, array( 'name', 'name_natural', 'createdTime', 'modifiedTime', 'quotaBytesUsed' ), true ) ) {
				$order_by_parts[] = "$field $sort_direction";
			}
		}

		$order_by = implode( ',', $order_by_parts );

		return array(
			'fields'                    => PNPND_LIST_FIELDS,
			'pageSize'                  => 300,
			'orderBy'                   => $order_by ? $order_by : 'folder,name',
			'pageToken'                 => '',
			'supportsAllDrives'         => true,
			'includeItemsFromAllDrives' => true,
			'corpora'                   => 'allDrives',
			'q'                         => $query,
		);
	}

	private function fetch_files_from_cache( $args ) {
		return Files::get_instance()->get_folder( $args['id'], $args['account_id'], $args );
	}

	private function prepare_response( $files, $args ) {
		$folder_id  = $args['id'] ?? null;
		$account_id = $args['account_id'] ?? null;
		$page       = $args['page'] ?? 1;
		$per_page   = $args['per_page'] ?? 20;

		if ( empty( $folder_id ) || empty( $account_id ) ) {
			return array();
		}

		if ( 'server' === $args['from'] ) {
			$files = array_slice( $files, ( $page - 1 ) * $per_page, $per_page );
		}

		$filter = array();

		if ( ! empty( $args['extensions'] ) && is_array( $args['extensions'] ) ) {
			$placeholders            = implode( ',', array_fill( 0, count( $args['extensions'] ), '%s' ) );
			$filter['filter_sql']    = " AND extension in ($placeholders)";
			$filter['filter_params'] = $args['extensions'];
		}

		$total_files = Files::get_instance()->children_count( $folder_id, $account_id, $filter );

		$total_pages = ceil( intval( $total_files ) / intval( $per_page ) );

		$has_more = $page < $total_pages;

		$filtered_files = array_filter( $files, fn ( $file ) => $file['parent_id'] === $folder_id || 'starred' === $folder_id );

		$response = array(
			'files'        => array_values( $filtered_files ),
			'has_more'     => (bool) $has_more,
			'totalFiles'   => intval( $total_files ),
			'total_pages'  => intval( $total_pages ),
			'current_page' => intval( $page ),
		);

		if ( $has_more ) {
			$response['next_page'] = $page + 1;
		}

		return $response;
	}
}
