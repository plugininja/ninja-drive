<?php

namespace Pninja\ND\Integrations;

use Pninja\ND\Enqueue;
use Pninja\ND\Integrations\Elementor\EmbedDocuments;
use Pninja\ND\Integrations\Elementor\FileBrowser;
use Pninja\ND\Integrations\Elementor\Gallery;
use Pninja\ND\Utils\Singleton;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class Elementor extends BaseIntegration {

	use Singleton;

	public function __construct() {
		parent::__construct( 'elementor', 'Elementor Blocks' );
	}

	public function init( string $id, array $integration ): void {
		add_action( 'elementor/editor/wp_head', array( $this, 'renderStyles' ) );
		add_action( 'elementor/frontend/after_enqueue_scripts', array( $this, 'renderStyles' ) );
		add_action(
			'plugin_loaded',
			function () {
				if ( ! defined( 'ELEMENTOR_VERSION' ) ) {
					return;
				}

				add_action( 'elementor/elements/categories_registered', array( $this, 'addCategory' ) );
				$hook = version_compare( \ELEMENTOR_VERSION, '3.5.0', '>=' ) ? 'elementor/widgets/register' : 'elementor/widgets/widgets_registered';
				add_action( $hook, array( $this, 'registerWidgets' ) );
			}
		);
	}

	public function renderStyles() {
		Enqueue::getInstance()->add( 'common', 'css' );
	}

	public function addCategory( $elements_manager ): void {
		$elements_manager->add_category(
			'ninja-drive',
			array(
				'title' => __( 'Ninja Drive', 'ninja-drive' ),
				'icon'  => 'fa fa-cloud',
			)
		);
	}

	public function registerWidgets( $widgets_manager ): void {
		$widgets = array(
			FileBrowser::class,
			Gallery::class,
			EmbedDocuments::class,
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
