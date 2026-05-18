<?php

namespace Pnpnd\ND\App\Feature;

use Pnpnd\ND\App\Client;
use Pnpnd\ND\App\File;
use Pnpnd\ND\App\Service\UploadService;
use Pnpnd\ND\Google\Service\ServiceDriveDriveFile;
use WP_Error;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class FileUploader {

	public function upload( $name, $type, $folderKey, $content = '', $description = '', $size = 0, $accountId = null ) {
		$folderId = null;

		if ( $folderKey !== 'my-drive' ) {
			$folder = ( new FileRetriever() )->getFileByKey( $folderKey );
			if ( is_wp_error( $folder ) ) {
				return $folder;
			}

			$folderId  = $folder['id'] ?? 'my-drive';
			$accountId = $folder['accountId'] ?? $accountId;
		}

		$client = Client::getInstance( $accountId );

		$upload = new UploadService( $client );
		$result = $upload->upload( $name, $type, $folderId, $content, $description, $size );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		if ( $result instanceof ServiceDriveDriveFile ) {
			$result->setAccountId( $accountId );
			$file = new File( $result );

			wp_cache_flush_group( 'pnpnd_files' );

			return $file->save();
		}

		if ( empty( $result['url'] ) ) {
			return new WP_Error( 500, __( 'Failed to get upload URL', 'ninja-drive' ) );
		}

		return $result;
	}

	public function getUploadedFile( $fileId, $uploadId, $folderKey, $accountId = null ) {
		if ( empty( $fileId ) || empty( $uploadId ) || empty( $folderKey ) ) {
			return new WP_Error( 400, __( 'Invalid parameters for retrieving uploaded file', 'ninja-drive' ) );
		}

		$transientKey = "pnpnd-upload-id-$uploadId";
		$transientId  = get_transient( $transientKey );
		$folder       = null;

		if ( $transientId !== 'my-drive' ) {
			$folder = ( new FileRetriever() )->getFileByKey( $folderKey );

			if ( is_wp_error( $folder ) ) {
				return $folder;
			}

			$folderId = $folder['id'] ?? null;
		} else {
			$folderId = $folderKey;
		}

		if ( $folderId !== $transientId ) {
			return new WP_Error( 403, __( 'You do not have permission to access this file', 'ninja-drive' ) );
		}

		$accountId = $folder['accountId'] ?? $accountId;

		$file = ( new FileRetriever() )->getFile( $fileId, $accountId, true );

		if ( is_wp_error( $file ) ) {
			return $file;
		}

		if ( empty( $file['id'] ) ) {
			return new WP_Error( 404, __( 'Uploaded file not found', 'ninja-drive' ) );
		}

		return $file;
	}
}
