<?php

namespace Pninja\ND\App\Feature;

use Pninja\ND\Models\Files;
use WP_Error;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class CacheSynchronizer {

	public function removeStaleFilesFromDatabase( array $currentFiles, array $queryArgs ): void {
		$folderId  = $queryArgs['id'] ?? null;
		$accountId = $queryArgs['accountId'] ?? null;

		if ( empty( $folderId ) || empty( $accountId ) ) {
			return;
		}

		$cachedFiles    = Files::getInstance()->getFolder( $folderId, $accountId, $queryArgs );
		$currentFileIds = array_column( $currentFiles, 'id' );

		foreach ( $cachedFiles as $file ) {
			if ( ! in_array( $file['id'], $currentFileIds, true ) ) {
				$result = Files::getInstance()->deleteFile( $file['id'], $file['accountId'] );

				if ( is_wp_error( $result ) ) {
					continue;
				}
			}
		}
	}
}
