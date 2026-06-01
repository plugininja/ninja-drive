<?php

namespace Pnpnd\ND;

use function defined;

use Pnpnd\ND\API\ApiRegistry;
use Pnpnd\ND\Integrations\Forms\ContactForm7;

use function sprintf;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

use Pnpnd\ND\Integrations\Blocks;
use Pnpnd\ND\Integrations\Elementor;
use Pnpnd\ND\Utils\Singleton;
use Pnpnd\ND\Widget\Locations;

class Plugininja {

	use Singleton;

	public function __construct() {
		$this->init();
	}

	private function init() {
		// Initialize the admin class.
		Content::getInstance();
		Admin::getInstance();
		Enqueue::getInstance();
		ApiRegistry::getInstance();
		Widget::getInstance();
		Locations::getInstance();

		Blocks::getInstance();
		Elementor::getInstance();
		ContactForm7::getInstance();
	}

	/**
	 * Adds hooks to the WordPress hooks system.
	 *
	 * @return void
	 */
	private function doHooks() {
		// Adds a link to the plugin's row meta in the WordPress plugin list.
		// The link points to the plugin's documentation page.
		add_filter( 'plugin_row_meta', array( $this, 'pluginRowMeta' ), 10, 2 );

		// Add a filter to modify the plugin action links.
		// This filter allows adding additional links to the plugin's entry in the plugins list.
		add_filter( 'plugin_action_links_' . plugin_basename( PNPND_FILE ), array( $this, 'actionLinks' ) );

		add_action( 'init', array( $this, 'registerRewriteRules' ) );

		add_filter( 'allowed_redirect_hosts', array( $this, 'addAllowedRedirectHosts' ) );

		if ( is_multisite() ) {
			add_action( 'wp_initialize_site', array( Activation::class, 'activateNewSite' ), 10, 1 );
		}
	}

	/**
	 * Adds a link to the plugin's row meta in the WordPress plugin list.
	 *
	 * The link points to the plugin's documentation page.
	 *
	 * @param array $links The current links in the plugin row meta.
	 * @param string $file The path to the plugin's main file.
	 *
	 * @return array The updated links in the plugin row meta.
	 */
	public function pluginRowMeta( $links, $file ) {
		if ( plugin_basename( PNPND_FILE ) === $file ) {
			$links[] = sprintf( '<a target="_blank" href="%s">%s</a>', PNPND_DOCUMENTATION_URL, __( 'Docs & FAQs', 'ninja-drive' ) );
		}

		return $links;
	}

	/**
	 * Adds a settings link to the plugin's action links in the WordPress plugins list.
	 *
	 * This link points to the plugin's settings page in the WordPress admin dashboard.
	 *
	 * @param array $links The current action links for the plugin.
	 *
	 * @return array The updated action links for the plugin.
	 */
	public function actionLinks( $links ) {
		$links[] = sprintf( '<a target="_blank" rel="noopener noreferrer" href="%s">%s</a>', admin_url( 'admin.php?page=ninja-drive#/settings' ), __( 'Settings', 'ninja-drive' ) );

		return $links;
	}

	/**
	 * Registers rewrite rules for the plugin.
	 *
	 * Registers a rewrite rule that matches the following pattern:
	 * ^pnpnd/([^/]+)/([^/]+)/([^/]+)\.([^/]+)$
	 *
	 * The pattern matches the following example URL:
	 * https://example.com/pnpnd/action/key/name.ext
	 *
	 * The matched groups are mapped to the following query parameters:
	 * - action: $matches[1]
	 * - key: $matches[2]
	 * - name: $matches[3]
	 * - ext: $matches[4]
	 * The rewrite rule is added with a priority of 'top' to ensure it takes precedence over other rules.
	 * @since 1.2.0
	 *
	 * @return void
	 */
	public function registerRewriteRules() {
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

		if ( get_option( 'pnpnd_flush_rewrite_rules' ) ) {
            flush_rewrite_rules( false );
			delete_option( 'pnpnd_flush_rewrite_rules' );
		}
	}

	public function addAllowedRedirectHosts( $hosts ) {
		$hosts[] = 'drive.google.com';
		$hosts[] = 'docs.google.com';
		$hosts[] = 'sites.google.com';
		$hosts[] = 'script.google.com';
		$hosts[] = 'lh3.googleusercontent.com';
		$hosts[] = 'drive-thirdparty.googleusercontent.com';

		return $hosts;
	}
}
