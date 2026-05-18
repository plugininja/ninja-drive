<?php

namespace Pnpnd\ND\Integrations;

use Pnpnd\ND\Utils\Singleton;
use Pnpnd\ND\Widget;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class Blocks extends BaseIntegration {

	use Singleton;

	public function __construct() {
		parent::__construct( 'gutenberg', 'Gutenberg Blocks' );
	}

	public function init( string $id, array $integration ): void {
		add_action( 'init', array( $this, 'registerGutenbergBlocks' ) );
		add_filter( 'block_categories_all', array( $this, 'blockCategory' ), 10, 2 );
	}

	public function registerGutenbergBlocks() {
		$blocks = array(
			'file-browser',
			'gallery',
			'embed-documents',
		);
		foreach ( $blocks as $block ) {
			register_block_type(
				PNPND_PATH . 'assets/js/blocks/' . $block,
				array(
					'render_callback' => array( $this, 'renderBlocks' ),
				)
			);
		}
	}

	public function renderBlocks( $attributes, $content, $block ) {
		if ( empty( $attributes['id'] ) ) {
			return '';
		}

		$html = Widget::getInstance()->render(
			array(
				'id' => absint( $attributes['id'] ),
			)
		);

		return wp_kses( $html, Widget::ALLOW_HTML_TAGS );
	}

	public function blockCategory( $categories ) {
		array_unshift(
			$categories,
			array(
				'slug'  => 'ninja-drive',
				'title' => __( 'Ninja Drive', 'ninja-drive' ),
				'icon'  => 'cloud',
			)
		);

		return $categories;
	}
}
