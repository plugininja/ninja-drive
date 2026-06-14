<?php

namespace Pnpnd\ND\App\Service;

use Pnpnd\ND\Google\Http\HttpMediaFileUpload;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

use Pnpnd\ND\Google\Service\ServiceDriveDriveFile;
use WP_Error;

class Upload_Service extends Drive_Service {

	public function upload( string $name, string $type, ?string $folder_id = null, string $content = '', string $description = '', int $size = 0 ) {
		try {
			$file = new ServiceDriveDriveFile();
			$file->setName( $name );
			$file->setDescription( $description );
			$file->setMimeType( $type );

			if ( $folder_id ) {
				$file->setParents( array( $folder_id ) );
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

			$chunk_size_bytes = 1 * 1024 * 1024;
			// $is_resumable_upload = empty($content);

			$media = new HttpMediaFileUpload( $this->client, $request, $type, $content, true, $chunk_size_bytes );

			if ( empty( $content ) && $size > 0 ) {
				$media->setFileSize( $size );
				$url = $media->getResumeUri();

				$this->client->setDefer( false );

				$upload_id = $this->set_upload_id_in_transient( $url, $folder_id );

				return array(
					'url'      => $url,
					'uploadId' => $upload_id,
				);
			}

			return $media->nextChunk();

		} catch ( \Throwable $th ) {
			return new WP_Error( 'error', $th->getMessage() );
		}
	}

	private function set_upload_id_in_transient( string $url, ?string $folder_id = null ): ?string {
		$parts = wp_parse_url( $url );

		if ( ! isset( $parts['query'] ) ) {
			return null;
		}

		parse_str( $parts['query'], $query_params );

		$upload_id = $query_params['upload_id'] ?? null;

		if ( $upload_id ) {
			set_transient( "pnpnd-upload-id-{$upload_id}", $folder_id ?? 'my-drive', 10 * MINUTE_IN_SECONDS );
		}

		return $upload_id;
	}
}
