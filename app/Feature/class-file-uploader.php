<?php

namespace Pnpnd\ND\App\Feature;

use Pnpnd\ND\App\Accounts;
use Pnpnd\ND\App\Client;
use Pnpnd\ND\App\File;
use Pnpnd\ND\App\Service\Upload_Service;
use Pnpnd\ND\Google\Service\ServiceDriveDriveFile;
use WP_Error;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class File_Uploader {

	public function upload( $name, $type, $folder_key, $content = '', $description = '', $size = 0, $account_id = null ) {
		$folder_id = null;

		if ( 'my-drive' !== $folder_key && ! empty( $folder_key ) && '/' !== $folder_key ) {
			$folder = ( new File_Retriever() )->get_file_by_key( $folder_key );
			if ( is_wp_error( $folder ) ) {
				return $folder;
			}

			$folder_id  = $folder['id'] ?? 'my-drive';
			$account_id = $folder['account_id'] ?? $account_id;
		} else {
			$folder_id = 'my-drive';
		}

		if ( 'my-drive' === $folder_id ) {
			$account = Accounts::get_instance()->get_account( $account_id );
			if ( ! $account instanceof \Pnpnd\ND\App\Account ) {
				return new WP_Error( 400, __( 'Invalid account', 'ninja-drive' ) );
			}

			$folder_id = $account->get_root_id();

			$account_id = $account->get_id();
		}

		$client = Client::get_instance( $account_id );

		$upload = new Upload_Service( $client );
		$result = $upload->upload( $name, $type, $folder_id, $content, $description, $size );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		if ( $result instanceof ServiceDriveDriveFile ) {
			$result->setAccountId( $account_id );
			$file = new File( $result );

			wp_cache_flush_group( 'pnpnd_files' );

			return $file->save();
		}

		if ( empty( $result['url'] ) ) {
			return new WP_Error( 500, __( 'Failed to get upload URL', 'ninja-drive' ) );
		}

		return $result;
	}

	public function get_uploaded_file( $file_id, $upload_id, $folder_key, $account_id = null ) {
		if ( empty( $file_id ) || empty( $upload_id ) || empty( $folder_key ) ) {
			return new WP_Error( 400, __( 'Invalid parameters for retrieving uploaded file', 'ninja-drive' ) );
		}

		$transient_key = "pnpnd-upload-id-$upload_id";
		$transient_id  = get_transient( $transient_key );
		$folder        = null;

		if ( 'my-drive' !== $transient_id ) {
			$folder = ( new File_Retriever() )->get_file_by_key( $folder_key );

			if ( is_wp_error( $folder ) ) {
				return $folder;
			}

			$folder_id = $folder['id'] ?? null;
		} else {
			$folder_id = $folder_key;
		}

		if ( $folder_id !== $transient_id ) {
			return new WP_Error( 403, __( 'You do not have permission to access this file', 'ninja-drive' ) );
		}

		$account_id = $folder['account_id'] ?? $account_id;

		$file = ( new File_Retriever() )->get_file( $file_id, $account_id, true );

		if ( is_wp_error( $file ) ) {
			return $file;
		}

		if ( empty( $file['id'] ) ) {
			return new WP_Error( 404, __( 'Uploaded file not found', 'ninja-drive' ) );
		}

		return $file;
	}
}
