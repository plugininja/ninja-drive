<?php

namespace Pnpnd\ND\App\Feature;

use Pnpnd\ND\App\Client;
use Pnpnd\ND\App\File;
use Pnpnd\ND\App\Service\Permission_Service;
use WP_Error;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class Permission_Manager {

	private $client;

	public function __construct( Client $client ) {
		$this->client = $client;
	}

	public function generate_permission( File $file ) {
		$users = $file->get_permission( 'users' ) ?? array();

		if ( isset( $users['anyoneWithLink']['type'] ) && 'anyone' === $users['anyoneWithLink']['type'] ) {
			return true;
		}

		$permission = new Permission_Service( $this->client );
		$is_shared  = $permission->is_shared( $file );

		if ( is_wp_error( $is_shared ) ) {
			return $is_shared;
		}

		if ( $is_shared ) {
			$users['anyoneWithLink'] = array(
				'domain' => false,
				'role'   => 'reader',
				'type'   => 'anyone',
			);

			$file->set_permission( 'users', $users );
			$file->save();

			return true;
		}

		$get_permission = $permission->create_permission(
			$file->get_id(),
			array(
				'domain' => false,
				'type'   => 'anyone',
				'role'   => 'reader',
			)
		);

		if ( empty( $get_permission ) || is_wp_error( $get_permission ) ) {
			return new WP_Error( 401, __( 'Unable to create a permission for this file. Please try again.', 'ninja-drive' ) );
		}

		$users[ $get_permission->getId() ] = array(
			'type'   => $get_permission->getType(),
			'role'   => $get_permission->getRole(),
			'domain' => $get_permission->getDomain(),
		);

		$file->set_permission( 'users', $users );
		$file->save();

		return true;
	}
}
