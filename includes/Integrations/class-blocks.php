<?php

namespace Pnpnd\ND\Integrations;

use Pnpnd\ND\Traits\Singleton;
use Pnpnd\ND\Widget;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class Blocks extends Base_Integration {

	use Singleton;

	public function __construct() {
		parent::__construct( 'gutenberg', 'Gutenberg Blocks' );
	}

	public function init( string $id, array $integration ): void {
		add_action( 'init', array( $this, 'register_gutenberg_blocks' ) );
		add_filter( 'block_categories_all', array( $this, 'block_category' ), 10, 2 );
	}

	public function register_gutenberg_blocks() {
		// Free blocks — available to all users.
		$free_blocks = array(
			'file-browser',
			'gallery',
			'embed-documents',
			'shortcode',
		);

		// Premium blocks — always registered so they appear in the block
		// inserter with a crown badge. The JS (BlockIcon / BlockContainer)
		// shows the upgrade popup instead of the widget builder for free users.
		// On the frontend, blocks with no configured widget (empty `id`)
		// return an empty string via render_blocks().
		$premium_blocks = array(
			'file-list__premium_only',
			'media-player__premium_only',
			'search-box__premium_only',
			'slider__premium_only',
		);

		foreach ( array_merge( $free_blocks, $premium_blocks ) as $block ) {
			$block_path = PNPND_PATH . 'assets/js/blocks/' . $block;

			if ( ! file_exists( $block_path . '/block.json' ) ) {
				continue;
			}

			register_block_type(
				$block_path,
				array(
					'render_callback' => array( $this, 'render_blocks' ),
				)
			);
		}
	}

	public function render_blocks( $attributes, $content, $block ) {
		if ( empty( $attributes['id'] ) ) {
			return '';
		}

		$html = Widget::get_instance()->render(
			array(
				'id' => absint( $attributes['id'] ),
			)
		);

		return wp_kses( $html, Widget::ALLOW_HTML_TAGS );
	}

	public function block_category( $categories ) {
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
