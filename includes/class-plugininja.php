<?php

namespace Pnpnd\ND;

use Pnpnd\ND\API\Api_Registry;
use Pnpnd\ND\Integrations\Forms\Contact_Form7;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

use Pnpnd\ND\Integrations\Blocks;
use Pnpnd\ND\Integrations\Classic_Editor;
use Pnpnd\ND\Integrations\Elementor;
use Pnpnd\ND\Traits\Singleton;
use Pnpnd\ND\Widget\Locations;
use Pnpnd\ND\Account_Notifications;

class Plugininja {

	use Singleton;

	public function __construct() {
		$this->init();
	}

	private function init() {
		Content::get_instance();
		Admin::get_instance();
		Enqueue::get_instance();
		Api_Registry::get_instance();
		Widget::get_instance();
		Locations::get_instance();

		Blocks::get_instance();
		Classic_Editor::get_instance();
		Elementor::get_instance();
		Contact_Form7::get_instance();

		Schedule::get_instance();
		Review_Banner::get_instance();
		Updater::get_instance();
		Legacy_Cleanup_Notice::get_instance();
		Account_Notifications::get_instance();

			new \Pnpnd\ND\Integrations\Media_Library();
			}

	private function do_hooks() {
		add_filter( 'plugin_row_meta', array( $this, 'plugin_row_meta' ), 10, 2 );

		add_filter( 'plugin_action_links_' . plugin_basename( PNPND_FILE ), array( $this, 'action_links' ) );

		add_action( 'init', array( $this, 'register_rewrite_rules' ) );

		add_filter( 'allowed_redirect_hosts', array( $this, 'add_allowed_redirect_hosts' ) );

		if ( is_multisite() ) {
			add_action( 'wp_initialize_site', array( Activation::class, 'activate_new_site' ), 10, 1 );
		}

		\Pnpnd\pnpnd_fs()->add_action( 'after_license_activation', array( Activation::class, 'init' ) );
		\Pnpnd\pnpnd_fs()->add_action( 'after_premium_version_activation', array( Activation::class, 'init' ) );
	}

	public function plugin_row_meta( $links, $file ) {
		if ( plugin_basename( PNPND_FILE ) === $file ) {
			$links[] = sprintf( '<a target="_blank" href="%s">%s</a>', PNPND_DOCUMENTATION_URL, __( 'Docs & FAQs', 'ninja-drive' ) );
		}

		return $links;
	}

	public function action_links( $links ) {
		$links[] = sprintf( '<a target="_blank" rel="noopener noreferrer" href="%s">%s</a>', admin_url( 'admin.php?page=ninja-drive#/settings' ), __( 'Settings', 'ninja-drive' ) );

		return $links;
	}

	public function register_rewrite_rules() {
		add_rewrite_rule(
			'^pnpnd/([^/]+)/([^/]+)/([^/]+)\.([^/]+)$',
			'index.php?pnpnd-action=$matches[1]&pnpnd-key=$matches[2]&pnpnd-name=$matches[3]&pnpnd-ext=$matches[4]',
			'top'
		);
		add_rewrite_rule(
			'^pnpnd/([^/]+)/([^/]+)/([^/]+)/([^/]+)$',
			'index.php?pnpnd-action=$matches[1]&pnpnd-key=$matches[2]&pnpnd-name=$matches[3]&pnpnd-ext=$matches[4]',
			'top'
		);

		add_rewrite_rule(
			'^pnpnd/([^/]+)/([^/]+)$',
			'index.php?pnpnd-action=$matches[1]&pnpnd-key=$matches[2]',
			'top'
		);

		if ( get_transient( 'pnpnd_rewrite_rules_error' ) ) {
			delete_transient( 'pnpnd_rewrite_rules_error' );
			flush_rewrite_rules();
		}
	}

	public function add_allowed_redirect_hosts( $hosts ) {
		$hosts[] = 'drive.google.com';
		$hosts[] = 'docs.google.com';
		$hosts[] = 'sites.google.com';
		$hosts[] = 'script.google.com';
		$hosts[] = 'lh3.googleusercontent.com';
		$hosts[] = 'drive-thirdparty.googleusercontent.com';

		return $hosts;
	}
}
