<?php

namespace Pninja\ND\App\Service;

use Pninja\ND\Google\Http\HttpMediaFileUpload;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

use Pninja\ND\Google\Service\ServiceDriveDriveFile;
use WP_Error;

class UploadService extends DriveService {

	public function upload( string $name, string $type, ?string $folderId = null, string $content = '', string $description = '', int $size = 0 ) {
		try {
			$file = new ServiceDriveDriveFile();
			$file->setName( $name );
			$file->setDescription( $description );
			$file->setMimeType( $type );

			if ( $folderId ) {
				$file->setParents( array( $folderId ) );
			}

			$this->client->setDefer( true );

			$request = $this->files->create(
				$file,
				array(
					'fields'            => PNPND_FILE_FIELDS,
					'supportsAllDrives' => true,
				)
			);

			$request_headers = $request->getRequestHeaders();

			if ( ! empty( $_SERVER['HTTP_ORIGIN'] ) ) {
				$request_headers['Origin'] = esc_url_raw( wp_unslash( $_SERVER['HTTP_ORIGIN'] ?? '' ) );
			}

			$request->setRequestHeaders( $request_headers );

			$chunkSizeBytes = 1 * 1024 * 1024;
			// $isResumableUpload = empty($content);

			$media = new HttpMediaFileUpload( $this->client, $request, $type, $content, true, $chunkSizeBytes );

			if ( empty( $content ) && $size > 0 ) {
				$media->setFileSize( $size );
				$url = $media->getResumeUri();

				$this->client->setDefer( false );

				$uploadId = $this->setUploadIdInTransient( $url, $folderId );

				return array(
					'url'      => $url,
					'uploadId' => $uploadId,
				);
			}

			return $media->nextChunk();

		} catch ( \Throwable $th ) {
			return new WP_Error( 'error', $th->getMessage() );
		}
	}

	private function setUploadIdInTransient( string $url, ?string $folderId = null ): ?string {
		$parts = wp_parse_url( $url );

		if ( ! isset( $parts['query'] ) ) {
			return null;
		}

		parse_str( $parts['query'], $queryParams );

		$uploadId = $queryParams['upload_id'] ?? null;

		if ( $uploadId ) {
			set_transient( "pnpnd-upload-id-{$uploadId}", $folderId ?? 'my-drive', 10 * MINUTE_IN_SECONDS );
		}

		return $uploadId;
	}
}
