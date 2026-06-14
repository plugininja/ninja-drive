<?php

namespace Pnpnd\ND\App\Feature;

use Pnpnd\ND\Models\Files;
use WP_Error;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class Cache_Synchronizer {

	public function remove_stale_files_from_database( array $current_files, array $query_args ): void {
		$folder_id  = $query_args['id'] ?? null;
		$account_id = $query_args['account_id'] ?? null;

		if ( empty( $folder_id ) || empty( $account_id ) ) {
			return;
		}

		$cached_files = Files::get_instance()->get_folder( $folder_id, $account_id, $query_args );
		if ( is_wp_error( $cached_files ) || empty( $cached_files ) ) {
			return;
		}
		$current_file_ids = array_column( $current_files, 'id' );

		foreach ( $cached_files as $file ) {
			if ( ! in_array( $file['id'], $current_file_ids, true ) ) {
				$result = Files::get_instance()->delete_file( $file['id'], $file['account_id'] );

				if ( is_wp_error( $result ) ) {
					continue;
				}
			}
		}
	}
}
