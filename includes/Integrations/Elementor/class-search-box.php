<?php

namespace Pnpnd\ND\Integrations\Elementor;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class Search_Box extends Base_Widget {

	public function get_name() {
		return 'pnpnd-search_box';
	}

	public function get_title() {
		return __( 'Search Box', 'ninja-drive' );
	}

	public function get_icon() {
		return 'eicon-search pnpnd-icon-pro';
	}

	public function get_categories() {
		return array( 'ninja-drive' );
	}

	public function get_keywords() {
		return array( 'google drive', 'search box', 'embed', 'file' );
	}

	protected function get_module_type() {
		return 'search_box';
	}

	protected function is_pro(): bool {
		return true;
	}
}
