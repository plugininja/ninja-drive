<?php

namespace Pnpnd\ND;

use Pnpnd\ND\App\Account;
use Pnpnd\ND\App\Accounts;
use Pnpnd\ND\Notice;
use Pnpnd\ND\Utils\Helpers;
use Pnpnd\ND\Traits\Singleton;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class Enqueue {

	use Singleton;

	/**
	 * Whether assets have been registered for the current request.
	 *
	 * @var bool
	 */
	private $assets_registered = false;

	/**
	 * Whether the `pnpnd` JS object has been attached to pnpnd-common.
	 *
	 * @var bool
	 */
	private $common_localized = false;

	private function do_hooks(): void {
		add_action( 'admin_enqueue_scripts', array( $this, 'admin_enqueue' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'frontend_enqueue' ) );

		// Safety net: if pnpnd-common was enqueued by an integration
		// (form plugins, WooCommerce, etc.) after wp_enqueue_scripts,
		// attach the localize data before footer scripts print.
		add_action( 'wp_footer', array( $this, 'maybe_localize_late' ), 9 );
	}

	protected function register_script( string $handle, string $src, array $deps = array(), string $ver = PNPND_VERSION, bool $in_footer = true ): void {
		wp_register_script( $handle, $src, $deps, $ver, $in_footer );
	}

	protected function register_style( string $handle, string $src, array $deps = array(), string $ver = PNPND_VERSION, bool $rtl = false ): void {
		wp_register_style( $handle, $src, $deps, $ver );
		if ( $rtl ) {
			wp_style_add_data( $handle, 'rtl', 'replace' );
		}
	}

	private function normalize_asset_name( string $value ): string {

		return str_replace( '_', '-', $value );
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

		$file_name = $this->normalize_asset_name( $handle );

		if ( $args['nesting'] ) {
			$args['folder'] = "css/{$file_name}";
		}

		$file_path = PNPND_ASSETS . "/{$args['folder']}/{$file_name}.css";

		$file_path = $this->normalize_asset_name( $file_path );

		if ( 'enqueue' === $args['type'] ) {
			wp_enqueue_style( "pnpnd-$handle", $file_path, $deps, $args['ver'] );
		} elseif ( 'register' === $args['type'] ) {
			wp_register_style( "pnpnd-$handle", $file_path, $deps, $args['ver'] );
		} else {
			pnpnd_notify(
				Notice::TYPE_ERROR,
				'Unknown style type.',
				"Unknown style type '{$args['type']}' provided for handle '{$handle}'."
			);
		}
	}

	private function r_style( string $handle, array $deps = array(), $args = array() ) {
		$args['type'] = 'register';
		$this->style( $handle, $deps, $args );
	}

	private function script( string $handle, array $deps = array(), $args = array() ): void {
		$_args = array(
			'ver'       => PNPND_VERSION,
			'folder'    => 'js',
			'in_footer' => true,
			'type'      => 'enqueue',
			'priority'  => 10,
		);

		$default_deps = array();

		$deps = wp_parse_args( $deps, $default_deps );

		$args      = wp_parse_args( $args, $_args );
		$file_name = $this->normalize_asset_name( $handle );

		$assets_path = PNPND_PATH . "assets/{$args['folder']}/{$file_name}.asset.php";

		if ( file_exists( $assets_path ) ) {
			$assets = include $assets_path;
			if ( defined( 'WP_ENVIRONMENT_TYPE' ) && WP_ENVIRONMENT_TYPE === 'local' ) {
				$args['ver'] = $assets['version'];
			}

			$deps = wp_parse_args( $deps, $assets['dependencies'] );
		}

		$file_path = PNPND_ASSETS . "/{$args['folder']}/{$file_name}.js";
		$file_path = $this->normalize_asset_name( $file_path );

		if ( 'enqueue' === $args['type'] ) {
			wp_enqueue_script( 'pnpnd-' . $handle, $file_path, $deps, $args['ver'], $args['in_footer'] );
			wp_set_script_translations( 'pnpnd-' . $handle, 'ninja-drive', plugin_dir_path( PNPND_FILE ) . 'languages' );
		} elseif ( 'register' === $args['type'] ) {
			wp_register_script( 'pnpnd-' . $handle, $file_path, $deps, $args['ver'], $args['in_footer'] );
		} else {
			pnpnd_notify(
				Notice::TYPE_ERROR,
				'Unknown script type.',
				"Unknown script type '{$args['type']}' provided for handle '{$handle}'."
			);
		}
	}

	private function r_script( string $handle, array $deps = array(), $args = array() ) {
		$args['type'] = 'register';
		$this->script( $handle, $deps, $args );
	}

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

	public function admin_enqueue( string $hook ): void {
		$this->common_scripts( $hook );

		if ( in_array( $hook, $this->admin_hooks, true ) ) {
			$this->script( 'admin', array( 'pnpnd-shared', 'wp-plupload', 'pnpnd-file-selector', 'pnpnd-widget-builder' ) );
		}

		$this->style( 'admin', array() );

		$admin_widget_styles = array( 'file_browser', 'gallery', 'embed_documents', 'file_uploader' );
		foreach ( $admin_widget_styles as $_handle ) {
			if ( wp_style_is( "pnpnd-$_handle", 'registered' ) ) {
				wp_enqueue_style( "pnpnd-$_handle" );
			}
		}
	}

	/**
	 * Backwards-compatible entry point: registers all assets and enqueues
	 * the common bundle. Called from admin_enqueue() on admin screens and
	 * from Widget::render_widget() at render time on the frontend.
	 */
	public function common_scripts( string $hook, string $context = 'admin' ): void {
		$this->register_assets( $hook, $context );
		$this->enqueue_common_assets( $hook, $context );

		if ( 'admin' === $context ) {
			wp_enqueue_script( 'pnpnd-vendors-admin' );

			$post_edit_hooks = array( 'post.php', 'post-new.php' );
			if ( current_user_can( 'manage_options' ) ) {
				$this->script( 'integrations', array( 'pnpnd-file-selector', 'pnpnd-widget-builder', 'pnpnd-shared' ) );
			} elseif ( current_user_can( 'edit_posts' ) && in_array( $hook, $post_edit_hooks, true ) ) {
				$this->script( 'integrations', array( 'pnpnd-file-selector', 'pnpnd-widget-builder', 'pnpnd-shared' ) );
			}
		}
	}

	/**
	 * Register (but do not enqueue) every plugin asset.
	 *
	 * Registration is free — nothing is output unless a handle is enqueued.
	 * This must always run so that integrations (form plugins, WooCommerce,
	 * templates) can wp_enqueue_*() a handle at render time.
	 */
	public function register_assets( string $hook = '', string $context = 'admin' ): void {
		if ( $this->assets_registered ) {
			return;
		}
		$this->assets_registered = true;

		$this->r_style( 'admin', array() );

		$this->r_script( 'popup/gallery', array(), array( 'folder' => 'plugins' ) );
		$this->r_style( 'popup/gallery', array(), array( 'folder' => 'plugins' ) );

		// Register common style first so inline custom CSS can attach to it.
		$this->r_style( 'common', array( 'pnpnd-popup/gallery' ), array( 'priority' => 5 ) );

		$custom_css = Helpers::get_setting( 'appearance.custom_css', '' );

		if ( ! empty( $custom_css ) ) {
			wp_add_inline_style(
				'pnpnd-common',
				wp_strip_all_tags( html_entity_decode( $custom_css ) )
			);
		}

		$this->r_script( 'runtime' );
		$this->r_script( 'vendors', array( 'pnpnd-runtime' ) );
		$this->r_script( 'vendors-admin', array( 'pnpnd-runtime' ) );
		$this->r_script( 'common', array( 'wp-util', 'pnpnd-vendors', 'pnpnd-popup/gallery' ) );

		$shared_deps = apply_filters( 'pnpnd_shared_script_dependencies', array( 'pnpnd-common' ), $hook, $context );
		$this->r_script( 'shared', $shared_deps );

		$this->r_script( 'widget-builder' );
		$this->r_script( 'file-selector' );

		$this->r_script( 'media-library', array( 'media-models', 'media-views', 'media-editor', 'wp-mediaelement', 'pnpnd-shared', 'pnpnd-file-selector' ) );

		$this->r_script( 'integrations', array( 'pnpnd-file-selector', 'pnpnd-widget-builder', 'pnpnd-shared' ) );

		$common_deps = array( 'pnpnd-common' );
		$args        = array( 'folder' => 'js/widgets' );
		$this->r_script( 'file_browser', array_merge( $common_deps, array( 'wp-plupload' ) ), $args );
		$this->r_script( 'gallery', $common_deps, $args );
		$this->r_script( 'embed_documents', $common_deps, $args );

		$this->r_script( 'file_uploader', array_merge( $common_deps, array( 'wp-plupload' ) ), $args );

		$widget_style_args = array( 'folder' => 'css/frontend' );
		$common_deps       = array();
		$fb_deps = array( 'wp-components', 'pnpnd-file_uploader' );
		$this->r_style( 'file_browser', array_merge( $common_deps, $fb_deps ), $widget_style_args );
		$this->r_style( 'gallery', array_merge( $common_deps ), $widget_style_args );
		$this->r_style( 'embed_documents', $common_deps, $widget_style_args );

		$this->r_style( 'file_uploader', array_merge( $common_deps, array( 'wp-components' ) ), $widget_style_args );

	}

	/**
	 * Enqueue the common style bundle and attach the `pnpnd` JS object.
	 * Only call this when the page actually uses the plugin.
	 */
	public function enqueue_common_assets( string $hook = '', string $context = 'admin' ): void {
		$this->register_assets( $hook, $context );

		wp_enqueue_style( 'pnpnd-common' );

		$this->localize_common( $hook, $context );
	}

	/**
	 * Attach the `pnpnd` data object to the pnpnd-common script (once).
	 */
	public function localize_common( $hook = '', string $context = 'admin' ): void {
		if ( $this->common_localized ) {
			return;
		}
		$this->common_localized = true;

		wp_localize_script( 'pnpnd-common', 'pnpnd', $this->get_localize_data( $hook, $context ) );
	}

	/**
	 * Late safety net: integrations (form plugins, WooCommerce downloads,
	 * templates) may enqueue plugin handles during render, bypassing
	 * enqueue_common_assets(). If pnpnd-common ended up in the queue
	 * (directly or as a dependency), localize it before footer scripts print.
	 */
	public function maybe_localize_late(): void {
		if ( $this->common_localized ) {
			return;
		}

		if ( wp_script_is( 'pnpnd-common', 'enqueued' ) ) {
			$this->localize_common( '', 'frontend' );
		}
	}

	/**
	 * Detect whether the current front-end request renders plugin content.
	 *
	 * Covers the [ninja-drive] shortcode and all ninja-drive/* Gutenberg
	 * blocks. Anything this misses (template parts, page builders, reusable
	 * blocks, archive loops) is covered by the render-time enqueue in
	 * Widget::render_widget().
	 */
	private function page_has_plugin_content(): bool {
		$detected = false;

		if ( is_singular() ) {
			$post = get_post();

			if ( $post instanceof \WP_Post && ! empty( $post->post_content ) ) {
				$detected = has_shortcode( $post->post_content, 'ninja-drive' )
					|| false !== strpos( $post->post_content, '<!-- wp:ninja-drive/' );
			}
		}

		/**
		 * Filter whether Ninja Drive front-end assets should load on the
		 * current request. Return true to force-load (e.g. widgets rendered
		 * in theme template parts where early detection is impossible).
		 *
		 * @param bool $detected Whether plugin content was detected.
		 */
		return (bool) apply_filters( 'pnpnd_load_frontend_assets', $detected );
	}

	public function add( string $handle, string $type, array $deps = array(), array $args = array(), bool $register = false ): void {
		$full_handle = "pnpnd-$handle";

		if ( 'js' === $type ) {
			if ( empty( $deps ) && wp_script_is( $full_handle, 'enqueued' ) ) {
				return;
			}

			global $wp_scripts;
			$previous_deps = isset( $wp_scripts->registered[ $full_handle ] ) ? $wp_scripts->registered[ $full_handle ]->deps : array();
			$deps          = array_unique( array_merge( $previous_deps, $deps ) );
			wp_deregister_script( $full_handle );
			if ( $register ) {
				$this->r_script( $handle, $deps, $args );
			} else {
				$this->script( $handle, $deps, $args );
			}
		} elseif ( 'css' === $type ) {
			if ( empty( $deps ) && wp_style_is( $full_handle, 'enqueued' ) ) {
				return;
			}
			global $wp_styles;

			$previous_deps = isset( $wp_styles->registered[ $full_handle ] ) ? $wp_styles->registered[ $full_handle ]->deps : array();
			$deps          = array_unique( array_merge( $previous_deps, $deps ) );

			wp_deregister_style( $full_handle );

			if ( ! wp_style_is( $full_handle ) ) {
				if ( $register ) {
					$this->r_style( $handle, $deps, $args );
				} else {
					$this->style( $handle, $deps, $args );
				}
			}
		}
	}

	public function frontend_enqueue(): void {
		// Always register — registration outputs nothing and lets
		// integrations enqueue handles at render time.
		$this->register_assets( '', 'frontend' );

		// Only enqueue when the page actually contains plugin content
		// (Plugin Directory Guideline #8). Widgets that early detection
		// misses are handled at render time by Widget::render_widget().
		if ( $this->page_has_plugin_content() ) {
			$this->enqueue_common_assets( '', 'frontend' );
		}

		if ( $this->is_elementor_preview_iframe() ) {
			$this->script( 'integrations', array( 'pnpnd-file-selector', 'pnpnd-widget-builder', 'pnpnd-shared' ) );
		}
	}

	private function is_elementor_preview_iframe(): bool {
		if ( ! defined( 'ELEMENTOR_VERSION' ) ) {
			return false;
		}

		return isset( $_GET['elementor-preview'] ) && absint( $_GET['elementor-preview'] ) > 0; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
	}

	private function get_localize_data( $hook = false, $script = 'admin' ) {

		$appearance = Helpers::get_settings( array( 'appearance' ) );
		$data       = array(
			'ajax_url'         => esc_url( admin_url( 'admin-ajax.php' ) ),
			'upgrade_url'      => 'https://plugininja.com/ninja-drive-pricing',
			'rest_url'         => esc_url( rest_url( 'pnpnd/v1/' ) ),
			'is_plain'         => get_option( 'permalink_structure' ) === '',
			'nonce'            => wp_create_nonce( 'wp_rest' ),
			'site_url'         => site_url(),
			'plugin_url'       => PNPND_URL,
			'is_admin'         => is_admin(),
			'is_logged_in'     => is_user_logged_in(),
			'version'          => PNPND_VERSION,
			'plugin_name'      => PNPND_NAME,
			'asset_url'        => PNPND_ASSETS,
			'text_domain'      => PNPND_TEXTDOMAIN,
			'settings'         => array(
				'appearance' => $appearance['appearance'] ?? array( '#1F6CFA' ),
				'advanced'   => array(
					'allow_dot_extensions' => Helpers::get_setting( 'advanced.allow_dot_extension', false ),
				),
			),
			'extension_groups' => pnpnd_get_extension_groups(),
			'widget_list'      => pnpnd_get_widgets(),
		);

		if ( is_user_logged_in() ) {
			$data['current_user'] = array(
				'id'       => get_current_user_id(),
				'name'     => wp_get_current_user()->display_name,
				'username' => wp_get_current_user()->user_login,
				'roles'    => wp_get_current_user()->roles ?? array( 'subscriber' ),
			);
		}

		if ( current_user_can( 'manage_options' ) ) {
			$accounts = Accounts::get_instance()->get_accounts();
			if ( is_wp_error( $accounts ) ) {
				$accounts = array();
			}

			$accounts = array_map(
				function ( Account $account ) {
					$account_id = $account->get_id();

					$syncing = get_transient( "pnpnd_syncing_account_{$account_id}" );

					return array(
						'id'          => $account_id,
						'account_key' => $account->get_account_key(),
						'name'        => $account->get_name(),
						'email'       => $account->get_email(),
						'photo'       => $account->get_photo(),
						'syncing'     => $syncing ? true : false,
						'active'      => $account->get_active(),
						'lost'        => $account->is_lost(),
						'root_id'     => $account->get_root_id(),
						'storage'     => $account->get_storage(),
						'user'        => $account->get_user(),
					);
				},
				$accounts
			);

			$data['accounts']         = array_values( $accounts ?? array() );
			$data['settings']         = Helpers::get_settings();
			$data['default_settings'] = pnpnd_get_default_settings();
			$data['admin_page_url']   = admin_url( 'admin.php?page=ninja-drive' );
			$data['redirect_uri']     = PNPND_REDIRECT_URI;
			$data['onboarding']       = get_option( 'pnpnd_onboarding_module_builder', 1 );

		}

		if ( current_user_can( 'manage_options' ) ) {
			$data['active_plugins'] = $this->get_active_integration_plugins();
		}

		$data = apply_filters( 'pnpnd_localize_data', $data, $script, $hook );

		return $data;
	}

	/**
	 * Check which integration-required plugins are active.
	 *
	 * @return array<string, bool>
	 */
	private function get_active_integration_plugins(): array {
		if ( ! function_exists( 'is_plugin_active' ) ) {
			require_once ABSPATH . 'wp-admin/includes/plugin.php';
		}

		return array(
			'classic_editor'         => is_plugin_active( 'classic-editor/classic-editor.php' ),
			'elementor'              => is_plugin_active( 'elementor/elementor.php' ),
			'woocommerce'            => is_plugin_active( 'woocommerce/woocommerce.php' ),
			'easy_digital_downloads' => is_plugin_active( 'easy-digital-downloads/easy-digital-downloads.php' ),
			'tutor_lms'              => is_plugin_active( 'tutor/tutor.php' ),
			'elementor_form_upload'  => is_plugin_active( 'elementor/elementor.php' ),
			'contact_form_7'         => is_plugin_active( 'contact-form-7/wp-contact-form-7.php' ),
			'wp_forms'               => is_plugin_active( 'wpforms-lite/wpforms.php' ) || is_plugin_active( 'wpforms/wpforms.php' ),
			'ninja_forms'            => is_plugin_active( 'ninja-forms/ninja-forms.php' ),
			'gravity_form'           => is_plugin_active( 'gravityforms/gravityforms.php' ),
			'formidable_forms'       => is_plugin_active( 'formidable/formidable.php' ),
			'fluent_forms'           => is_plugin_active( 'fluentform/fluentform.php' ),
			'master_study_lms'       => is_plugin_active( 'masterstudy-lms-learning-management-system/masterstudy-lms.php' ),
		);
	}
}
