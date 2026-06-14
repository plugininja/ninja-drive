<?php

namespace Pnpnd\ND\App\Feature;

use Pnpnd\ND\App\Client;
use Pnpnd\ND\App\Feature\File_Lister;
use Pnpnd\ND\App\Feature\Search_Engine;
use Pnpnd\ND\App\Service\File_Service;
use Pnpnd\ND\Models\Files;
use WP_Error;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class File_Retriever {

	public function get_files_by_keys( $file_keys, $config = array(), ?File_Service $files = null ) {
		if ( empty( $file_keys ) ) {
			return new WP_Error( 404, __( 'No file keys provided.', 'ninja-drive' ) );
		}

		if ( ! is_array( $file_keys ) ) {
			return new WP_Error( 400, __( 'File keys must be an array.', 'ninja-drive' ) );
		}

		if ( ! empty( $file_keys[0]['file_key'] ) ) {
			$file_keys = array_map(
				function ( $key ) {
					return $key['file_key'];
				},
				$file_keys
			);
		}

		$query_config = wp_parse_args(
			$config,
			array(
				'return_type'  => 'array',
				'recursive'    => true,
				'page'         => 1,
				'per_page'     => 20,
				'order_by'     => 'name',
				'order'        => 'ASC',
				'search'       => '',
				'search_scope' => 'folder',
				'from'         => 'cache',
			)
		);

		$files_model = Files::get_instance();

		if ( null !== $files && isset( $query_config['from'] ) && 'server' === $query_config['from'] ) {
			$files_data = $files_model->get_file_attributes_by_keys( $file_keys, array( 'id', 'account_id', 'extension' ) );

			if ( is_wp_error( $files_data ) ) {
				return $files_data;
			}

			if ( empty( $files_data ) ) {
				return array();
			}

			$filter_folder_ids = array_filter( $files_data, fn ( $file ) => ! empty( $file['extension'] ) && 'folder' === $file['extension'] );

			$search_query = '';

			if ( ! empty( $query_config['search'] ) ) {
				$params = array(
					'query'     => $query_config['search'],
					'full_text' => false,
					'trashed'   => false,
				);

				$search_query = ( new Search_Engine( new File_Lister( $files ) ) )->build_search_query( $params );
			}

			foreach ( $filter_folder_ids as $file ) {
				( new File_Lister( $files ) )->fetch_files_from_server(
					array(
						'account_id' => $file['account_id'],
						'id'         => $file['id'],
						'query'      => $search_query,
					)
				);
			}
		}

		return $files_model->get_files_by_keys( $file_keys, $query_config );
	}

	public function get_file( $id, $account_id, $force = false ) {
		if ( empty( $id ) || empty( $account_id ) ) {
			return new WP_Error( 400, __( 'Missing file id or account id.', 'ninja-drive' ) );
		}

		if ( empty( $force ) ) {
			$file = Files::get_instance()->get_file( $id, $account_id, 'array' );

			if ( ! empty( $file ) && ! is_wp_error( $file ) ) {
				return $file;
			}
		}

		$client = Client::get_instance( $account_id );

		$file_api = new File_Service( $client );
		$file     = $file_api->get_file_by_id( $id );

		if ( is_wp_error( $file ) ) {

			return $file;
		}

		if ( empty( $file ) ) {
			return new WP_Error( 400, __( 'Something went wrong while fetching the file. Please try again.', 'ninja-drive' ) );
		}

		return $file->save();
	}

	public function get_file_by_key( $key, $force = false, $output = 'array' ) {
		if ( empty( $key ) ) {
			return false;
		}

		$file = Files::get_instance()->get_file_by_key( $key );

		if ( empty( $file ) || is_wp_error( $file ) ) {

			return false;
		}

		if ( empty( $force ) ) {
			return 'array' === $output ? $file->to_array() : $file;
		}

		$account_id = $file->get_account_id() ?? null;
		$id         = $file->get_id() ?? null;

		if ( ! $account_id || ! $id ) {
			return false;
		}

		$client   = Client::get_instance( $account_id );
		$file_api = new File_Service( $client );
		$file     = $file_api->get_file_by_id( $id );

		if ( is_wp_error( $file ) ) {

			return $file;
		}

		$fil_date = $file->save();

		return 'array' === $output ? $fil_date : $file;
	}
}
