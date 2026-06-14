<?php

namespace Pnpnd\ND\Integrations\Elementor;

use Pnpnd\ND\Integrations\Elementor\Base_Widget;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class File_Browser extends Base_Widget {

	public function get_name() {
		return 'pnpnd-file_browser';
	}
	public function get_title() {
		return __( 'File Browser', 'ninja-drive' );
	}
	public function get_icon() {
		return 'eicon-folder';
	}
	public function get_categories() {
		return array( 'ninja-drive', 'basic' );
	}

	public function get_keywords() {
		return array( 'google drive', 'file browser', 'embed', 'file' );
	}

	protected function get_module_type() {
		return 'file_browser';
	}

	protected function is_pro(): bool {
		return false;
	}
}
