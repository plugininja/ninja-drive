<?php

namespace Pnpnd\ND\Integrations\Elementor;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class Shortcode extends Base_Widget {

	public function get_name() {
		return 'pnpnd-shortcode';
	}

	public function get_title() {
		return __( 'Widget Selector', 'ninja-drive' );
	}

	public function get_icon() {
		return 'eicon-code';
	}

	public function get_categories() {
		return [ 'ninja-drive', 'basic' ];
	}

	public function get_keywords() {
		return [ 'google drive', 'shortcode', 'widget', 'file browser', 'gallery', 'embed', 'media', 'file list', 'search' ];
	}

	/**
	 * Empty string — returns all widget types in the module selector.
	 */
	protected function get_module_type() {
		return '';
	}

	protected function is_pro(): bool {
		return false;
	}
}
