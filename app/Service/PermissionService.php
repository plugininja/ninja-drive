<?php

namespace Pnpnd\ND\App\Service;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

use Pnpnd\ND\Google\Http\HttpRequest;
use Pnpnd\ND\Google\Service\ServiceDrivePermission;
use WP_Error;

class PermissionService extends DriveService {

	/**
	 * Set a permission on a file
	 *
	 * @param string $fileId The ID of the file
	 * @param array  $permission The permission to be set
	 * @return ServiceDrivePermission|WP_Error The created permission
	 *
	 * @since 1.0.0
	 */
	public function createPermission( $fileId, $permission = array() ) {
		$defaultPermission = array(
			'type' => 'anyone',
			'role' => 'reader',
		);

		$permission = wp_parse_args( $permission, $defaultPermission );

		$_permission = new ServiceDrivePermission();
		$_permission->setType( $permission['type'] );
		$_permission->setRole( $permission['role'] );
		$_permission->setAllowFileDiscovery( false );

		if ( $permission['type'] === 'domain' && ! empty( $permission['domain'] ) ) {
			$_permission->setDomain( $permission['domain'] );
		}

		$params = array(
			'fields'            => 'id,role,type,domain',
			'supportsAllDrives' => true,
		);

		try {
			return $this->permissions->create( $fileId, $_permission, $params );
		} catch ( \Throwable $th ) {

			return new WP_Error( 'error', $th->getMessage() );
		}
	}

	/**
	 * Checks if a file is shared.
	 *
	 * Checks if a file is shared with the current user.
	 *
	 * @param \Pnpnd\ND\App\File $file The file to be checked.
	 * @return bool|WP_Error True if the file is shared, false if not.
	 */
	public function isShared( $file ) {
		$fileId      = $file->getId();
		$resourceKey = $file->getResourceKey();
		$isDir       = $file->isDir();

		$users = $file->getPermission( 'users' );

		if ( isset( $users['anyoneWithLink']['type'] ) && $users['anyoneWithLink']['type'] === 'anyone' ) {
			return true;
		}

		$url = "https://drive.google.com/file/d/{$fileId}/view";

		if ( $isDir ) {
			$url = "https://drive.google.com/drive/folders/{$fileId}";
		}

		if ( ! empty( $resourceKey ) ) {
			$url .= '?resourcekey=' . urlencode( $resourceKey );
		}

		try {
			$request = new HttpRequest( $url, 'GET' );

			$httpResponse = $this->client->getIo()->makeRequest( $request );

			return $httpResponse->getResponseHttpCode() === 200;

		} catch ( \Throwable $th ) {
			return new WP_Error( 'error', $th->getMessage() );
		}
	}
}
