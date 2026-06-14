<?php

namespace Pnpnd\ND\Integrations\Elementor;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class Slider extends Base_Widget {

	public function get_name() {
		return 'pnpnd-slider';
	}

	public function get_title() {
		return __( 'Slider Carousel', 'ninja-drive' );
	}

	public function get_icon() {
		return 'eicon-slideshow pnpnd-icon-pro';
	}

	public function get_categories() {
		return array( 'ninja-drive' );
	}

	public function get_keywords() {
		return array( 'google drive', 'slider carousel', 'embed', 'file' );
	}

	protected function get_module_type() {
		return 'slider_carousel';
	}

	protected function is_pro(): bool {
		return true;
	}
}
