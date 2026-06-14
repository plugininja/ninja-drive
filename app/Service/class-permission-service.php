<?php

namespace Pnpnd\ND\App\Service;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

use Pnpnd\ND\Google\Http\HttpRequest;
use Pnpnd\ND\Google\Service\ServiceDrivePermission;
use WP_Error;

class Permission_Service extends Drive_Service {

	/**
	 * Set a permission on a file
	 *
	 * @param string $file_id The ID of the file
	 * @param array  $permission The permission to be set
	 * @return ServiceDrivePermission|WP_Error The created permission
	 *
	 * @since 1.0.0
	 */
	public function create_permission( $file_id, $permission = array() ) {
		$default_permission = array(
			'type' => 'anyone',
			'role' => 'reader',
		);

		$permission = wp_parse_args( $permission, $default_permission );

		$_permission = new ServiceDrivePermission();
		$_permission->setType( $permission['type'] );
		$_permission->setRole( $permission['role'] );
		$_permission->setAllowFileDiscovery( false );

		if ( 'domain' === $permission['type'] && ! empty( $permission['domain'] ) ) {
			$_permission->setDomain( $permission['domain'] );
		}

		$params = array(
			'fields'            => 'id,role,type,domain',
			'supportsAllDrives' => true,
		);

		try {
			return $this->permissions->create( $file_id, $_permission, $params );
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
	public function is_shared( $file ) {
		$file_id      = $file->get_id();
		$resource_key = $file->get_resource_key();
		$is_dir       = $file->is_dir();

		$users = $file->get_permission( 'users' );

		if ( isset( $users['anyoneWithLink']['type'] ) && 'anyone' === $users['anyoneWithLink']['type'] ) {
			return true;
		}

		$url = "https://drive.google.com/file/d/{$file_id}/view";

		if ( $is_dir ) {
			$url = "https://drive.google.com/drive/folders/{$file_id}";
		}

		if ( ! empty( $resource_key ) ) {
			$url .= '?resourcekey=' . urlencode( $resource_key );
		}

		try {
			$request = new HttpRequest( $url, 'GET' );

			$http_response = $this->client->getIo()->makeRequest( $request );

			return $http_response->getResponseHttpCode() === 200;

		} catch ( \Throwable $th ) {
			return new WP_Error( 'error', $th->getMessage() );
		}
	}
}
