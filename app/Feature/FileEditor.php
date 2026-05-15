<?php

namespace Pninja\ND\App\Feature;

use Pninja\ND\App\Accounts;
use Pninja\ND\App\Service\FileService;
use WP_Error;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class FileEditor {

	private $fileService;

	private $accountId;

	public function __construct( FileService $fileService, $accountId ) {
		$this->fileService = $fileService;
		$this->accountId   = $accountId;
	}

	public function rename( $fileKey, $name ) {
		if ( empty( $fileKey ) || empty( $name ) ) {
			return;
		}

		$file = ( new FileRetriever() )->getFileByKey( $fileKey );
		if ( is_wp_error( $file ) ) {
			return $file;
		}

		$fileId = $file['id'] ?? null;
		if ( empty( $fileId ) ) {
			return new WP_Error( 400, __( 'Invalid file ID', 'ninja-drive' ) );
		}
		$extension = pathinfo( $file['name'], PATHINFO_EXTENSION );

		$name = rtrim( sanitize_text_field( "$name.$extension" ), '.' );

		return $this->fileService->rename( $fileId, $name );
	}

	public function delete( $fileKeys ) {
		if ( empty( $fileKeys ) ) {
			return new WP_Error( 400, __( 'File Keys are required to delete files.', 'ninja-drive' ) );
		}

		$fileIds = pnpndGetFileIdsByKeys( $fileKeys );
		if ( is_wp_error( $fileIds ) ) {
			return $fileIds;
		}

		if ( empty( $fileIds ) ) {
			return new WP_Error( 400, __( 'No valid file IDs found for the provided file keys.', 'ninja-drive' ) );
		}

		$delete = $this->fileService->deleteFile( $fileIds );

		if ( is_wp_error( $delete ) ) {
			return $delete;
		}

		if ( ! empty( $delete['error'] ) || empty( $delete ) ) {
			return new WP_Error( 500, __( 'Failed to delete file.', 'ninja-drive' ) );
		}

		Accounts::getInstance()->syncAccount( $this->accountId );

		return $delete;
	}
}
