<?php

namespace Pnpnd\ND\API;

use Pnpnd\ND\API\Controllers\Account;
use Pnpnd\ND\API\Controllers\Dashboard;
use Pnpnd\ND\API\Controllers\File;
use Pnpnd\ND\API\Controllers\Folder;
use Pnpnd\ND\API\Controllers\Migration;
use Pnpnd\ND\API\Controllers\Notice;
use Pnpnd\ND\API\Controllers\Settings;
use Pnpnd\ND\API\Controllers\Users;
use Pnpnd\ND\API\Controllers\Widget;
use Pnpnd\ND\Traits\Singleton;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class Api_Registry {

	use Singleton;

	private array $controllers = array();

	public function do_hooks() {
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	public function register_routes(): void {
		$this->controllers = array(
			'account'   => new Account(),
			'file'      => new File(),
			'folder'    => new Folder(),
			'migration' => new Migration(),
			'settings'  => new Settings(),
			'widget'    => new Widget(),
			'notice'    => new Notice(),
			'users'     => new Users(),
			'dashboard' => new Dashboard(),
		);

		foreach ( $this->controllers as $controller ) {
			$controller->register_routes();
		}
	}
}
