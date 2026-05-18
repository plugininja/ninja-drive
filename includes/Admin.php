<?php

namespace Pnpnd\ND;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

use Pnpnd\ND\Utils\Singleton;

class Admin {

	use Singleton;

	private function doHooks() {
		add_action( 'admin_menu', array( 'Pnpnd\ND\Pages\AdminPages', 'adminMenu' ) );
		add_filter( 'admin_body_class', array( $this, 'adminBodyClasses' ) );
	}

	public function adminBodyClasses( $classes ) {
		$screen = get_current_screen();

		if ( ! $screen ) {
			return $classes;
		}

		$classes .= ' pnpnd-admin';

		if ( $screen->id === 'toplevel_page_' . PNPND_SLUG ) {
			$classes .= ' pnpnd-file-browser-page';
		}

		if ( $screen->id === 'ninja-drive_page_' . PNPND_SLUG . '#/settings/accounts' ) {
			$classes .= ' pnpnd-settings-page';
		}

		if ( $screen->id === 'ninja-drive_page_' . PNPND_SLUG . '#/widget-builder' ) {
			$classes .= ' pnpnd-widget-builder-page';
		}

		return $classes;
	}
}
