<?php

namespace Pnpnd\ND\Pages;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class Admin_Pages {

	private static function get_sub_menu_pages(): array {
		return array(
            array(
                'id'  => 'dashboard',
                'menu' => __( 'Dashboard', 'ninja-drive' ),
                'slug' => PNPND_SLUG . '#/dashboard/overview',
            ),
			array(
				'id'   => 'file_manager',
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
			array(
				'id'   => 'user_access',
				'menu' => __( 'User Access', 'ninja-drive' ),
				'slug' => PNPND_SLUG . '#/user-access',
			)
		);
	}

	public static function admin_menu() {
		$is_menu_added = false;
		foreach ( self::get_sub_menu_pages() as $page ) {
			if ( empty( $page['id'] ) || empty( $page['menu'] ) || empty( $page['slug'] ) ) {
				continue;
			}

				if ( ! current_user_can( 'manage_options' ) ) {
					continue;
				}
			
			if ( ! $is_menu_added ) {
				self::add_menu_page( $page['menu'], $page['slug'] );
				$is_menu_added = true;
			} else {
				self::add_sub_menu_page( $page['menu'], $page['slug'] );
			}
		}
	}

	public static function admin_page() {
		wp_enqueue_style( 'pnpnd-admin' );
		wp_enqueue_script( 'pnpnd-file-browser' );
		wp_set_script_translations( 'pnpnd-file-browser', 'ninja-drive', plugin_dir_path( PNPND_FILE ) . 'languages' );
		echo '<div id="pnpnd-admin" class="pnpnd-admin pnpnd-top-level-wrapper"></div>';
	}

	private static function add_menu_page( $menu, $slug ) {
		add_menu_page(
			__( 'Ninja Drive', 'ninja-drive' ),
			__( 'Ninja Drive', 'ninja-drive' ),
			'read',
			PNPND_SLUG,
			array( self::class, 'admin_page' ),
			PNPND_ASSETS . '/images/ninja-drive.png'
		);

		self::add_sub_menu_page( $menu, $slug );
		remove_submenu_page( PNPND_SLUG, PNPND_SLUG );
	}

	private static function add_sub_menu_page( $menu, $slug ) {
		add_submenu_page(
			PNPND_SLUG,
			// translators: %s is replaced with the sub menu name, e.g. File Manager, Widget Builder, etc.
			sprintf( __( '%s - Ninja Drive', 'ninja-drive' ), $menu ),
			$menu,
			'read',
			$slug,
			'__return_null'
		);
	}
}
