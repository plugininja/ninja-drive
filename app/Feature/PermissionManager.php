<?php

namespace Pnpnd\ND\App\Feature;

use Pnpnd\ND\App\Client;
use Pnpnd\ND\App\File;
use Pnpnd\ND\App\Service\PermissionService;
use WP_Error;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class PermissionManager {

	private $client;

	public function __construct( Client $client ) {
		$this->client = $client;
	}

	public function generatePermission( File $file ) {
		$users = $file->getPermission( 'users' ) ?? array();

		if ( isset( $users['anyoneWithLink']['type'] ) && $users['anyoneWithLink']['type'] === 'anyone' ) {
			return true;
		}

		$permission = new PermissionService( $this->client );
		$isShared   = $permission->isShared( $file );

		if ( is_wp_error( $isShared ) ) {
			return $isShared;
		}

		if ( $isShared ) {
			$users['anyoneWithLink'] = array(
				'domain' => false,
				'role'   => 'reader',
				'type'   => 'anyone',
			);

			$file->setPermission( 'users', $users );
			$file->save();

			return true;
		}

		$getPermission = $permission->createPermission(
			$file->getId(),
			array(
				'domain' => false,
				'type'   => 'anyone',
				'role'   => 'reader',
			)
		);

		if ( empty( $getPermission ) || is_wp_error( $getPermission ) ) {
			return new WP_Error( 401, __( 'Unable to create a permission for this file. Please try again.', 'ninja-drive' ) );
		}

		$users[ $getPermission->getId() ] = array(
			'type'   => $getPermission->getType(),
			'role'   => $getPermission->getRole(),
			'domain' => $getPermission->getDomain(),
		);

		$file->setPermission( 'users', $users );
		$file->save();

		return true;

		return new WP_Error( 401, __( 'Failed to create preview/share due to insufficient permissions. Please enable the required access in Google Drive or in the plugin by going to Settings → Advanced → Manage Sharing Permissions.', 'ninja-drive' ) );
	}
}
