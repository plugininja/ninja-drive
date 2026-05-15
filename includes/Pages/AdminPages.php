<?php

namespace Pninja\ND\Pages;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class AdminPages {

	private static function getSubMenuPages(): array {
		return array(
			array(
				'id'   => 'file_browser',
				'menu' => __( 'File Manager', 'ninja-drive' ),
				'slug' => PNPND_SLUG . '#/file-browser/my-drive',
			),
			array(
				'id'   => 'widget_builder',
				'menu' => __( 'Widget Builder', 'ninja-drive' ),
				'slug' => PNPND_SLUG . '#/widget-builder',
			),
			array(
				'id'   => 'settings',
				'menu' => __( 'Settings', 'ninja-drive' ),
				'slug' => PNPND_SLUG . '#/settings/accounts',
			),
		);
	}

	/**
	 * Adds the top level menu item for the Ninja Drive settings page.
	 *
	 * @since 1.0.0
	 */
	public static function adminMenu() {
		$isMenuAdded = false;
		foreach ( self::getSubMenuPages() as $page ) {
			if ( empty( $page['id'] ) || empty( $page['menu'] ) || empty( $page['slug'] ) ) {
				continue;
			}

			if ( ! current_user_can( 'manage_options' ) ) {
				continue;
			}

			if ( ! $isMenuAdded ) {
				self::addMenuPage( $page['menu'], $page['slug'] );
				$isMenuAdded = true;
			} else {
				self::addSubMenuPage( $page['menu'], $page['slug'] );
			}
		}
	}

	public static function adminPage() {
		wp_enqueue_style( 'pnpnd-admin' );
		wp_enqueue_script( 'pnpnd-file-browser' );
		wp_set_script_translations( 'pnpnd-file-browser', 'ninja-drive', plugin_dir_path( PNPND_FILE ) . 'languages' );
		echo '<div id="pnpnd-admin" class="pnpnd-admin pnpnd-top-level-wrapper"></div>';
	}

	private static function addMenuPage( $menu, $slug ) {
		add_menu_page(
			__( 'Ninja Drive', 'ninja-drive' ),
			__( 'Ninja Drive', 'ninja-drive' ),
			'manage_options',
			PNPND_SLUG,
			array( self::class, 'adminPage' ),
			PNPND_ASSETS . '/images/drive.png'
		);

		self::addSubMenuPage( $menu, $slug );
		remove_submenu_page( PNPND_SLUG, PNPND_SLUG );
	}

	private static function addSubMenuPage( $menu, $slug ) {
		add_submenu_page(
			PNPND_SLUG,
			/* translators: %s: Menu title (e.g. "File Manager") */
			sprintf( __( '%s - Ninja Drive', 'ninja-drive' ), $menu ),
			$menu,
			'manage_options',
			$slug,
			'__return_null'
		);
	}
}
