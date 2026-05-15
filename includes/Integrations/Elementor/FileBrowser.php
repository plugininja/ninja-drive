<?php

namespace Pninja\ND\Integrations\Elementor;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class FileBrowser extends BaseWidget {

	public function get_name() {
		return 'pnpnd-file-browser';
	}
	public function get_title() {
		return __( 'File Browser', 'ninja-drive' );
	}
	public function get_icon() {
		return 'eicon-library-folder';
	}
	public function get_categories() {
		return array( 'ninja-drive', 'basic' );
	}

	protected function get_module_type() {
		return 'file-browser';
	}

	protected function is_pro(): bool {
		return false;
	}
}
