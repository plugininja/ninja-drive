<?php

namespace Pnpnd\ND\App\Feature;

use Pnpnd\ND\App\Accounts;
use Pnpnd\ND\App\Service\File_Service;
use WP_Error;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class File_Editor {

	private $file_service;

	private $account_id;

	public function __construct( File_Service $file_service, $account_id ) {
		$this->file_service = $file_service;
		$this->account_id   = $account_id;
	}

	public function rename( $file_key, $name ) {
		if ( empty( $file_key ) || empty( $name ) ) {
			return;
		}

		$file = ( new File_Retriever() )->get_file_by_key( $file_key );
		if ( is_wp_error( $file ) ) {
			return $file;
		}

		$file_id = $file['id'] ?? null;
		if ( empty( $file_id ) ) {
			return new WP_Error( 400, __( 'Invalid file ID', 'ninja-drive' ) );
		}
		$extension = pathinfo( $file['name'], PATHINFO_EXTENSION );

		$name = rtrim( sanitize_text_field( "$name.$extension" ), '.' );

		return $this->file_service->rename( $file_id, $name );
	}

	public function delete( $file_keys ) {
		if ( empty( $file_keys ) ) {
			return new WP_Error( 400, __( 'File Keys are required to delete files.', 'ninja-drive' ) );
		}

		$file_ids = pnpnd_get_file_ids_by_keys( $file_keys );
		if ( is_wp_error( $file_ids ) ) {
			return $file_ids;
		}

		if ( empty( $file_ids ) ) {
			return new WP_Error( 400, __( 'No valid file IDs found for the provided file keys.', 'ninja-drive' ) );
		}

		$delete = $this->file_service->delete_file( $file_ids );

		if ( is_wp_error( $delete ) ) {
			return $delete;
		}

		if ( ! empty( $delete['error'] ) || empty( $delete ) ) {
			return new WP_Error( 500, __( 'Failed to delete file.', 'ninja-drive' ) );
		}

		Accounts::get_instance()->sync_account( $this->account_id );

		return $delete;
	}

}
