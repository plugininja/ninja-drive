<?php

namespace Pnpnd\ND\App\Feature;

use Pnpnd\ND\App\Accounts;
use Pnpnd\ND\App\Service\File_Service;
use Pnpnd\ND\Models\Base_Model;
use Pnpnd\ND\Models\Files;
use Pnpnd\ND\Utils\Helpers;
use WP_Error;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class Folder_Manager {

	private $files;

	public function __construct( File_Service $files ) {
		$this->files = $files;
	}

	public function get_folder_by_key( $file_key, $args = array() ) {
		if ( empty( $file_key ) ) {
			return new WP_Error( 400, __( 'Missing folder key.', 'ninja-drive' ) );
		}

		$data = $this->get_data_by_key( $file_key );

		if ( empty( $data ) || is_wp_error( $data ) ) {
			return false;
		}

		$folder_id  = $data['folder_id'] ?? null;
		$account_id = $data['account_id'] ?? null;

		if ( ! $folder_id || ! $account_id ) {
			return false;
		}

		$has_search = ! empty( $args['search'] ) || ! empty( $args['types'] );

		if ( ! empty( $has_search ) ) {
			$types         = is_array( $args['types'] ) ? $args['types'] : explode( ',', $args['types'] ?? '' );
			$search_result = ( new Search_Engine( new File_Lister( $this->files ) ) )->search(
				array(
					'query'      => $args['search'] ?? '',
					'types'      => $types,
					'from'       => $args['from'] ?? 'cache',
					'order_by'   => $args['order_by'] ?? 'name',
					'order'      => $args['order'] ?? 'ASC',
					'folderId'   => $folder_id,
					'account_id' => $account_id,
					'scope'      => 'parent',
					'limit'      => $args['per_page'] ?? 10,
				)
			);

			if ( is_wp_error( $search_result ) ) {
				return $search_result;
			}

			$page     = $args['page'] ?? 1;
			$per_page = $args['per_page'] ?? 10;

			$total_files     = count( $search_result );
			$total_pages     = ceil( $total_files / $per_page );
			$offset          = ( $page - 1 ) * $per_page;
			$paginated_files = array_slice( $search_result, $offset, $per_page );

			return array(
				'files'        => array_values( $paginated_files ),
				'has_more'     => $page < $total_pages,
				'totalFiles'   => intval( $total_files ),
				'total_pages'  => intval( $total_pages ),
				'current_page' => intval( $page ),
			);
		}

		return ( new File_Lister( $this->files ) )->get_files(
			array(
				'id'         => $folder_id,
				'account_id' => $account_id,
				'from'       => $args['from'] ?? 'cache',
				'order_by'   => $args['order_by'] ?? 'folder,name',
				'order'      => $args['order'] ?? 'ASC',
				'page'       => $args['page'] ?? 1,
				'per_page'   => $args['per_page'] ?? 20,
				'search'     => '',
				'extensions' => $args['extensions'] ?? array(),
			)
		);
	}

	public function get_folder_tree( $folder_key, $args = array() ) {
		$args = wp_parse_args(
			$args,
			array(
				'widget_id' => null,
				'order_by'  => 'name',
				'order'     => 'ASC',
			)
		);

		$query_args = array(
			'return_type' => 'array',
			'per_page'    => Base_Model::MAX_ITEMS_PER_PAGE,
			'recursive'   => false,
			'order_by'    => $args['order_by'],
			'order'       => $args['order'],
		);

		if ( ! empty( $args['widget_id'] ) ) {
			$validate_folder_key = Helpers::validate_widget_key( $args['widget_id'], $folder_key );

			if ( empty( $validate_folder_key ) || is_wp_error( $validate_folder_key ) ) {
				return new WP_Error( 'forbidden', __( 'You do not have permission to access this resource.', 'ninja-drive' ), array( 'status' => 403 ) );
			}

			if ( 'my-drive' === $folder_key || is_array( $validate_folder_key ) ) {
				return ( new File_Retriever() )->get_files_by_keys( $validate_folder_key, $query_args, $this->files );
			}

			$folder_key = is_array( $validate_folder_key )
				? $validate_folder_key[0]
				: $validate_folder_key;
		}

		if ( 'my-drive' === $folder_key ) {
			$current_account = Accounts::get_instance()->get_account();

			if ( is_wp_error( $current_account ) || empty( $current_account ) ) {
				return new WP_Error( 'forbidden', __( 'You do not have permission to access this resource.', 'ninja-drive' ), array( 'status' => 403 ) );
			}

			$parent_id  = $current_account->get_root_id();
			$account_id = $current_account->get_id();
		} else {
			$folder = ( new File_Retriever() )->get_file_by_key( $folder_key );

			if ( is_wp_error( $folder ) ) {
				return $folder;
			}

			if ( empty( $folder ) || empty( $folder['id'] ) || empty( $folder['account_id'] ) ) {
				return new WP_Error( 404, __( 'Folder not found.', 'ninja-drive' ) );
			}

			$parent_id  = $folder['id'];
			$account_id = $folder['account_id'];
		}

		return array(
			'files' => $this->get_folders(
				$account_id,
				array(
					'order_by'  => $args['order_by'],
					'order'     => $args['order'],
					'parent_id' => $parent_id,
				)
			),
		);
	}

	public function get_folders( ?string $account_id = null, array $config = array() ) {
		return Files::get_instance()->get_folders( $account_id, $config );
	}

	public function new_folder( $name, $parent_key ) {
		if ( empty( $name ) ) {
			return new WP_Error( 400, __( 'Folder name or parent folder not found for new folder creation', 'ninja-drive' ) );
		}

		if ( empty( $parent_key ) ) {
			return new WP_Error( 400, __( 'Parent folder not found key for new folder creation', 'ninja-drive' ) );
		}

		$folder = ( new File_Retriever() )->get_file_by_key( $parent_key );

		if ( is_wp_error( $folder ) ) {
			return $folder;
		}

		$folder = $this->files->create_new_folder( $name, $folder['id'] );

		if ( empty( $folder ) ) {
			return new WP_Error( 500, __( 'Failed to create folder', 'ninja-drive' ) );
		}

		return $folder;
	}

	public function get_data_by_key( $key ) {
		$folder_id  = null;
		$account_id = null;
		$folder     = null;

		if ( in_array( $key, array( 'my-drive', 'shared', 'starred', 'computers', 'shared-drives' ), true ) ) {
			$account = Accounts::get_instance()->get_account();

			if ( empty( $account ) || is_wp_error( $account ) ) {
				return false;
			}

			$account_id = $account->get_id();

			$folder_id = 'my-drive' === $key ? $account->get_root_id() : $key;
		} else {
			$folder = ( new File_Retriever() )->get_file_by_key( $key );

			if ( empty( $folder ) || is_wp_error( $folder ) ) {
				return false;
			}

			$folder_id  = $folder['id'] ?? null;
			$account_id = $folder['account_id'] ?? null;
		}

		return array(
			'folder_id'  => $folder_id,
			'account_id' => $account_id,
			'folder'     => $folder,
		);
	}
}
