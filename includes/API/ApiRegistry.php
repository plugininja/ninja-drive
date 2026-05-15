<?php

namespace Pninja\ND\API;

use Pninja\ND\API\Controllers\Account;
use Pninja\ND\API\Controllers\File;
use Pninja\ND\API\Controllers\Folder;
use Pninja\ND\API\Controllers\Notice;
use Pninja\ND\API\Controllers\Settings;
use Pninja\ND\API\Controllers\Users;
use Pninja\ND\API\Controllers\Widget;
use Pninja\ND\Utils\Singleton;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class ApiRegistry {

	use Singleton;

	private array $controllers = array();

	public function doHooks() {
		add_action( 'rest_api_init', array( $this, 'registerRoutes' ) );
	}

	public function registerRoutes(): void {
		$this->controllers = array(
			'account'  => new Account(),
			'file'     => new File(),
			'folder'   => new Folder(),
			'settings' => new Settings(),
			'widget'   => new Widget(),
			'notice'   => new Notice(),
			'users'    => new Users(),
		);

		foreach ( $this->controllers as $controller ) {
			$controller->register_routes();
		}
	}
}
