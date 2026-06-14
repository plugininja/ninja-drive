<?php

namespace Pnpnd\ND\Integrations;

use Pnpnd\ND\Enqueue;
use Pnpnd\ND\Integrations\Elementor\Embed_Documents;
use Pnpnd\ND\Integrations\Elementor\File_Browser;
use Pnpnd\ND\Integrations\Elementor\File_List;
use Pnpnd\ND\Integrations\Elementor\Gallery;
use Pnpnd\ND\Integrations\Elementor\Media_Player;
use Pnpnd\ND\Integrations\Elementor\Search_Box;
use Pnpnd\ND\Integrations\Elementor\Shortcode;
use Pnpnd\ND\Integrations\Elementor\Slider;
use Pnpnd\ND\Traits\Singleton;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class Elementor extends Base_Integration {

	use Singleton;

	public function __construct() {
		parent::__construct( 'elementor', 'Elementor Blocks' );
	}

	public function init( string $id, array $integration ): void {
		add_action( 'elementor/editor/wp_head', array( $this, 'render_styles' ) );
		add_action( 'elementor/frontend/after_enqueue_scripts', array( $this, 'render_styles' ) );
		add_action( 'elementor/editor/after_enqueue_scripts', array( $this, 'enqueue_editor_scripts' ) );
		add_action( 'elementor/preview/enqueue_scripts', array( $this, 'enqueue_preview_scripts' ) );
		add_action(
			'plugin_loaded',
			function () {
				if ( ! defined( 'ELEMENTOR_VERSION' ) ) {
					return;
				}

				add_action( 'elementor/elements/categories_registered', array( $this, 'add_category' ) );
				$hook = version_compare( \ELEMENTOR_VERSION, '3.5.0', '>=' ) ? 'elementor/widgets/register' : 'elementor/widgets/widgets_registered';
				add_action( $hook, array( $this, 'register_widgets' ) );
			}
		);
	}

	public function enqueue_editor_scripts(): void {
		wp_add_inline_script(
			'elementor-editor',
			"document.addEventListener( 'click', function( e ) {
				var btn = e.target.closest( '[data-pnpnd-upgrade-url], .pnpnd-upgrade-btn' );
				if ( ! btn ) {
					return;
				}
				e.preventDefault();
				e.stopPropagation();
				var url = btn.dataset.pnpndUpgradeUrl || btn.getAttribute( 'href' );
				if ( url ) {
					window.open( url, '_blank', 'noopener,noreferrer' );
				}
			} );"
		);
	}

	public function render_styles() {
		Enqueue::get_instance()->add( 'common', 'css' );
	}

	/**
	 * Runs only inside the Elementor editor preview iframe — never on the
	 * public frontend. The preview is a front-end request, so the global
	 * frontend gate (Guideline #8) skips integrations.js there; this hook
	 * restores it for the editing context where ElementorIntegration JS
	 * (Configure Widget button, module builder, re-render on
	 * elementor/editor/element-rendered) actually runs.
	 */
	public function enqueue_preview_scripts(): void {
		if ( ! current_user_can( 'edit_posts' ) ) {
			return;
		}

		$enqueue = Enqueue::get_instance();

		// Registers all handles, enqueues pnpnd-common CSS and the
		// `pnpnd` localize data (module builder needs settings/accounts).
		$enqueue->common_scripts( 'elementor-preview', 'frontend' );

		// Enqueue integrations.js with its registered dependency chain
		// (file-selector, widget-builder, shared → common → vendors → runtime).
		$enqueue->add( 'integrations', 'js' );

		// Admin styles for the notice cards / module builder UI in the preview.
		$enqueue->add( 'admin', 'css' );

		// Widgets are re-rendered via AJAX inside the preview iframe, so the
		// per-type assets enqueued during Widget::render_widget() never reach
		// the page. Preload every registered module's frontend CSS and JS
		// bundle here (premium-only handles are absent in the free build).
		$types      = array( 'file_browser', 'gallery', 'embed_documents', 'file_list', 'media_player', 'search_box', 'slider_carousel', 'file_uploader' );
		$js_handles = array();

		foreach ( $types as $type ) {
			if ( wp_style_is( "pnpnd-$type", 'registered' ) ) {
				wp_enqueue_style( "pnpnd-$type" );
			}

			if ( wp_script_is( "pnpnd-$type", 'registered' ) ) {
				$js_handles[] = "pnpnd-$type";
			}
		}

		if ( ! empty( $js_handles ) ) {
			$enqueue->add( 'shared', 'js', $js_handles );
		}
	}

	public function add_category( $elements_manager ): void {
		$elements_manager->add_category(
			'ninja-drive',
			array(
				'title' => __( 'Ninja Drive', 'ninja-drive' ),
				'icon'  => 'fa fa-cloud',
			)
		);
	}

	public function register_widgets( $widgets_manager ): void {
		$widgets = array(
			File_Browser::class,
			Gallery::class,
			Embed_Documents::class,
			Shortcode::class,
			File_List::class,
			Media_Player::class,
			Search_Box::class,
			Slider::class,
		);

		foreach ( $widgets as $class ) {
			if ( class_exists( $class ) ) {
				if ( method_exists( $widgets_manager, 'register' ) ) {
					$widgets_manager->register( new $class() );
				} else {
					$widgets_manager->register_widget_type( new $class() );
				}
			}
		}
	}
}
