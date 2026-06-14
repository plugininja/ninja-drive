<?php

namespace Pnpnd\ND;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

use Pnpnd\ND\Traits\Singleton;

class Admin {

	use Singleton;

	private function do_hooks() {
		add_action( 'admin_menu', array( 'Pnpnd\ND\Pages\Admin_Pages', 'admin_menu' ) );
		add_filter( 'admin_body_class', array( $this, 'admin_body_classes' ) );
	}

	public function admin_body_classes( $classes ) {
		$screen = get_current_screen();

		if ( ! $screen ) {
			return $classes;
		}

		$classes .= ' pnpnd-admin';

		if ( 'toplevel_page_' . PNPND_SLUG === $screen->id ) {
			$classes .= ' pnpnd-file-browser-page';
		}

		if ( 'ninja-drive_page_' . PNPND_SLUG . '#/settings/accounts' === $screen->id ) {
			$classes .= ' pnpnd-settings-page';
		}

		if ( 'ninja-drive_page_' . PNPND_SLUG . '#/widget-builder' === $screen->id ) {
			$classes .= ' pnpnd-widget-builder-page';
		}

		return $classes;
	}
}
