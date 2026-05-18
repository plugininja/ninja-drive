<?php

namespace Pnpnd\ND;

use function defined;

use Pnpnd\ND\App\Account;
use Pnpnd\ND\App\Accounts;
use Pnpnd\ND\Models\Notices;
use Pnpnd\ND\Utils\Helpers;
use Pnpnd\ND\Utils\Singleton;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class Enqueue {

	use Singleton;

	/**
	 * Initialize hooks
	 *
	 * @return void
	 */
	private function doHooks(): void {
		add_action( 'admin_enqueue_scripts', array( $this, 'adminEnqueue' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'frontendEnqueue' ) );
	}

	/**
	 * Register a script with default parameters
	 *
	 * @param string $handle Script handle
	 * @param string $src Script source URL
	 * @param array  $deps Script dependencies
	 * @param string $ver Script version
	 * @param bool   $in_footer Load in footer
	 * @return void
	 */
	protected function register_script( string $handle, string $src, array $deps = array(), string $ver = PNPND_VERSION, bool $in_footer = true ): void {
		wp_register_script( $handle, $src, $deps, $ver, $in_footer );
	}

	/**
	 * Register a style with default parameters
	 *
	 * @param string $handle Style handle
	 * @param string $src Style source URL
	 * @param array  $deps Style dependencies
	 * @param string $ver Style version
	 * @param bool   $rtl Support RTL
	 * @return void
	 */
	protected function register_style( string $handle, string $src, array $deps = array(), string $ver = PNPND_VERSION, bool $rtl = false ): void {
		wp_register_style( $handle, $src, $deps, $ver );
		if ( $rtl ) {
			wp_style_add_data( $handle, 'rtl', 'replace' );
		}
	}

	private function style( string $handle, array $deps = array(), $args = array() ) {
		$_args = array(
			'ver'       => PNPND_VERSION,
			'folder'    => 'css',
			'in_footer' => false,
			'type'      => 'enqueue',
			'nesting'   => false,
			'priority'  => 10,
		);

		$args = wp_parse_args( $args, $_args );

		if ( $args['nesting'] ) {
			$args['folder'] = "css/{$handle}";
		}

		$filePath = PNPND_ASSETS . "/{$args['folder']}/{$handle}.css";

		if ( $args['type'] === 'enqueue' ) {
			wp_enqueue_style( "pnpnd-$handle", $filePath, $deps, $args['ver'] );
		} elseif ( $args['type'] === 'register' ) {
			wp_register_style( "pnpnd-$handle", $filePath, $deps, $args['ver'] );
		} else {
			Notices::getInstance()->add(
				array(
					'type'        => 'error',
					'title'       => 'Unknown style type.',
					'description' => "Unknown style type '{$args['type']}' provided for handle '{$handle}'.",
				)
			);
		}
	}

	/**
	 * Registers a style for later use.
	 *
	 * @param string $handle The style handle.
	 * @param array  $deps Optional. An array of registered stylesheet handles this stylesheet depends on. Default empty array.
	 * @param array  $args Optional. Additional arguments for registering the style. Default empty array.
	 */
	private function r_style( string $handle, array $deps = array(), $args = array() ) {
		$args['type'] = 'register';
		$this->style( $handle, $deps, $args );
	}

	/**
	 * Enqueue a script or register it for later use.
	 *
	 * @param string $handle Script handle
	 * @param array  $deps Script dependencies
	 * @param array  $args {
	 *                     Optional. Additional args for the script.
	 *
	 * @type string $ver Script version. Default is PNPND_VERSION.
	 * @type string $folder Folder to look for the script in. Default is 'js'.
	 * @type bool $in_footer Load script in footer. Default is true.
	 * @type string $type Type of enqueue action. 'enqueue' or 'register'. Default is 'enqueue'.
	 *              }
	 * @return void
	 * @uses wp_enqueue_script()
	 * @uses wp_register_script()
	 */
	private function script( string $handle, array $deps = array(), $args = array() ): void {
		$_args = array(
			'ver'       => PNPND_VERSION,
			'folder'    => 'js',
			'in_footer' => true,
			'type'      => 'enqueue',
			'priority'  => 10,
		);

		$defaultDeps = array();

		$deps = wp_parse_args( $deps, $defaultDeps );

		$args = wp_parse_args( $args, $_args );

		$assetsPath = PNPND_PATH . "assets/{$args['folder']}/{$handle}.asset.php";

		if ( file_exists( $assetsPath ) ) {
			$assets = include $assetsPath;
			if ( defined( 'WP_ENVIRONMENT_TYPE' ) && WP_ENVIRONMENT_TYPE === 'local' ) {
				$args['ver'] = $assets['version'];
			}

			$deps = wp_parse_args( $deps, $assets['dependencies'] );
		}

		$filePath = PNPND_ASSETS . "/{$args['folder']}/{$handle}.js";

		if ( $args['type'] === 'enqueue' ) {
			wp_enqueue_script( 'pnpnd-' . $handle, $filePath, $deps, $args['ver'], $args['in_footer'] );
			wp_set_script_translations( 'pnpnd-' . $handle, 'ninja-drive', plugin_dir_path( PNPND_FILE ) . 'languages' );
		} elseif ( $args['type'] === 'register' ) {
			wp_register_script( 'pnpnd-' . $handle, $filePath, $deps, $args['ver'], $args['in_footer'] );
		} else {
			Notices::getInstance()->add(
				array(
					'type'        => 'error',
					'title'       => 'Unknown script type.',
					'description' => "Unknown script type '{$args['type']}' provided for handle '{$handle}'.",
				)
			);
		}
	}

	/**
	 * Registers a script for later use.
	 *
	 * @param string $handle The script handle.
	 * @param array  $deps Optional. An array of registered script handles this script depends on. Default empty array.
	 * @param array  $args Optional. Additional arguments for registering the script. Default empty array.
	 * @return void
	 * @uses self::script()
	 * @uses wp_register_script()
	 */
	private function r_script( string $handle, array $deps = array(), $args = array() ) {
		$args['type'] = 'register';
		$this->script( $handle, $deps, $args );
	}

	/**
	 * Registers a plugin's scripts and styles for later use.
	 *
	 * @param string $handle The handle of the plugin script/style.
	 * @param array  $deps Optional. An array of registered handles this script/style depends on. Default empty array.
	 * @param array  $args Optional. Additional arguments for registering the script/style. Default empty array.
	 * @uses self::r_script()
	 * @uses self::r_style()
	 */
	private function r_plugins( string $handle, array $deps = array(), $args = array() ) {
		$this->r_script( $handle, array( 'jquery' ), array( 'folder' => 'plugins' ) );
	}

	private array $admin_hooks = array(
		'toplevel_page_ninja-drive',
		'toplevel_page_ninja-forms',
		'toplevel_page_fluent_forms',
		'toplevel_page_formidable',
		'post.php',
		'post-new.php',
		'site-editor.php',
		'upload.php',
	);

	/**
	 * Enqueue admin scripts and styles
	 *
	 * @param string $hook Current admin page hook
	 * @return void
	 */
	public function adminEnqueue( string $hook ): void {
		$this->common_scripts( $hook );

		if ( in_array( $hook, $this->admin_hooks, true ) ) {
			$this->script( 'admin', array( 'pnpnd-shared', 'wp-plupload', 'pnpnd-file-selector', 'pnpnd-widget-builder' ) );
		}

		$this->style( 'admin', array() );
	}

	/**
	 * Enqueue common scripts and styles
	 *
	 * @param string $hook Current page hook
	 * @param string $context Context (admin or frontend)
	 * @return void
	 */
	public function common_scripts( string $hook, string $context = 'admin' ): void {
		$this->r_style( 'admin', array() );

		$this->r_script( 'runtime' );
		$this->r_script( 'vendors', array( 'pnpnd-runtime' ) );
		$this->r_script( 'common', array( 'wp-util', 'pnpnd-vendors', 'pnpnd-popup/gallery' ) );

		$sharedDeps = apply_filters( 'pnpnd_shared_script_dependencies', array( 'pnpnd-common' ), $hook, $context );
		$this->r_script( 'shared', $sharedDeps );

		$this->r_script( 'widget-builder' );
		$this->r_script( 'file-selector' );

		$this->r_script( 'integrations', array( 'pnpnd-file-selector', 'pnpnd-widget-builder', 'pnpnd-shared' ) );

		if ( current_user_can( 'manage_options' ) ) {
			$this->script( 'integrations', array( 'pnpnd-file-selector', 'pnpnd-widget-builder', 'pnpnd-shared' ) );
		}

		$this->style( 'common', array( 'pnpnd-popup/gallery' ), array( 'priority' => 5 ) );

		$this->r_script( 'popup/gallery', array(), array( 'folder' => 'plugins' ) );
		$this->r_style( 'popup/gallery', array(), array( 'folder' => 'plugins' ) );

		wp_localize_script( 'pnpnd-common', 'pnpnd', $this->getLocalizeData( $hook, $context ) );

		// =======================================================================
		// Register Widget Scripts
		// -----------------------------------------------------------------------
		// This section handles the registration of all JavaScript files related
		// to individual widgets used in the project.
		// =======================================================================
		$commonDeps = array( 'pnpnd-common' );
		$args       = array( 'folder' => 'js/widgets' );
		$this->r_script( 'file-browser', array_merge( $commonDeps, array( 'wp-plupload' ) ), $args );
		$this->r_script( 'gallery', $commonDeps, $args );
		$this->r_script( 'embed-documents', $commonDeps, $args );

		// =======================================================================
		// Register Widget Styles
		// -----------------------------------------------------------------------
		// This section handles the registration of all CSS files related
		// to individual widgets used in the project.
		// =======================================================================
		$widgetStyleArgs = array( 'folder' => 'css/frontend' );
		$commonDeps      = array();
		$this->r_style( 'file-browser', array_merge( $commonDeps, array( 'wp-components' ) ), $widgetStyleArgs );
		$this->r_style( 'gallery', array_merge( $commonDeps ), $widgetStyleArgs );
		$this->r_style( 'embed-documents', $commonDeps, $widgetStyleArgs );
	}

	/**
	 * Adds a script or style to be enqueued if not already enqueued.
	 *
	 * @param string $handle Handle of the script/style
	 * @param string $type Type: 'js' or 'css'
	 * @param array  $deps Dependencies
	 * @param array  $args Extra arguments
	 *
	 * @return void
	 */
	public function add( string $handle, string $type, array $deps = array(), array $args = array(), bool $register = false ): void {
		$fullHandle = "pnpnd-$handle";

		if ( $type === 'js' ) {
			if ( empty( $deps ) && wp_script_is( $fullHandle, 'enqueued' ) ) {
				return;
			}

			global $wp_scripts;
			$previousDeps = isset( $wp_scripts->registered[ $fullHandle ] ) ? $wp_scripts->registered[ $fullHandle ]->deps : array();
			$deps         = array_unique( array_merge( $previousDeps, $deps ) );
			wp_deregister_script( $fullHandle );
			if ( $register ) {
				$this->r_script( $handle, $deps, $args );
			} else {
				$this->script( $handle, $deps, $args );
			}
		} elseif ( $type === 'css' ) {
			if ( empty( $deps ) && wp_style_is( $fullHandle, 'enqueued' ) ) {
				return;
			}
			global $wp_styles;

			$previousDeps = isset( $wp_styles->registered[ $fullHandle ] ) ? $wp_styles->registered[ $fullHandle ]->deps : array();
			$deps         = array_unique( array_merge( $previousDeps, $deps ) );

			wp_deregister_style( $fullHandle );

			if ( ! wp_style_is( $fullHandle ) ) {
				if ( $register ) {
					$this->r_style( $handle, $deps, $args );
				} else {
					$this->style( $handle, $deps, $args );
				}
			}
		}
	}

	/**
	 * Enqueue frontend scripts and styles
	 * * @param string $context Context (gallery, fileBrowser, etc.)
	 *
	 * @return void
	 */
	public function frontendEnqueue(): void {
		$this->common_scripts( '', 'frontend' );
	}

	/**
	 * Get general localize data
	 *
	 * @param string $hook Current page hook
	 * @param string $script Context (admin or frontend)
	 * @return array
	 */
	private function getLocalizeData( $hook = false, $script = 'admin' ) {
		$appearance = Helpers::getSettings( array( 'appearance' ) );
		$data       = array(
			'ajaxUrl'         => esc_url( admin_url( 'admin-ajax.php' ) ),
			'restUrl'         => esc_url( rest_url( 'pnpnd/v1/' ) ),
			'isPlain'         => get_option( 'permalink_structure' ) === '',
			'nonce'           => wp_create_nonce( 'wp_rest' ),
			'siteUrl'         => site_url(),
			'pluginUrl'       => PNPND_URL,
			'isAdmin'         => is_admin(),
			'isLoggedIn'      => is_user_logged_in(),
			'version'         => PNPND_VERSION,
			'pluginName'      => PNPND_NAME,
			'assetUrl'        => PNPND_ASSETS,
			'textDomain'      => PNPND_TEXTDOMAIN,
			'settings'        => array( 'appearance' => $appearance['appearance'] ?? array( '#1F6CFA' ) ),
			'extensionGroups' => pnpndGetExtensionGroups(),
			'widgetList'      => pnpndGetWidgets(),
		);

		if ( is_user_logged_in() ) {
			$data['currentUser'] = array(
				'id'    => get_current_user_id(),
				'name'  => wp_get_current_user()->display_name,
				'roles' => wp_get_current_user()->roles ?? array( 'subscriber' ),
			);
		}

		if ( current_user_can( 'manage_options' ) ) {
			$accounts = Accounts::getInstance()->getAccounts();
			if ( is_wp_error( $accounts ) ) {
				$accounts = array();
			}

			$accounts = array_map(
				function ( Account $account ) {
					$accountId = $account->getId();

					$syncing = get_transient( "pnpnd_syncing_account_{$accountId}" );

					return array(
						'id'         => $accountId,
						'accountKey' => $account->getAccountKey(),
						'name'       => $account->getName(),
						'email'      => $account->getEmail(),
						'photo'      => $account->getPhoto(),
						'syncing'    => $syncing ? true : false,
						'active'     => $account->getActive(),
						'lost'       => $account->getLost(),
						'rootId'     => $account->getRootId(),
						'storage'    => $account->getStorage(),
						'user'       => $account->getUser(),
					);
				},
				$accounts
			);

			$data['accounts']        = array_values( $accounts ?? array() );
			$data['settings']        = Helpers::getSettings();
			$data['defaultSettings'] = pnpndGetDefaultSettings();
			$data['adminPageUrl']    = admin_url( 'admin.php?page=ninja-drive' );
			$data['redirectUri']     = PNPND_REDIRECT_URI;
		}

		$data = apply_filters( 'pnpnd_localize_data', $data, $script, $hook );

		return $data;
	}
}
