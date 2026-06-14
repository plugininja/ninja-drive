<?php

namespace Pnpnd\ND\Integrations\Elementor;

use Pnpnd\ND\Integrations\Elementor\Base_Widget;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class Gallery extends Base_Widget {

	public function get_name() {
		return 'pnpnd-gallery';
	}
	public function get_title() {
		return __( 'Gallery', 'ninja-drive' );
	}
	public function get_icon() {
		return 'eicon-gallery-justified';
	}
	public function get_categories() {
		return array( 'ninja-drive', 'basic' );
	}

	protected function get_module_type() {
		return 'gallery';
	}

	public function get_keywords() {
		return array( 'google drive', 'gallery', 'embed', 'file' );
	}

	protected function is_pro(): bool {
		return false;
	}
}
