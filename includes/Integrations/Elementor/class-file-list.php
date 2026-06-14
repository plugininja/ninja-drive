<?php

namespace Pnpnd\ND\Integrations\Elementor;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class File_List extends Base_Widget {

	public function get_name() {
		return 'pnpnd-file_list';
	}

	public function get_title() {
		return __( 'File List', 'ninja-drive' );
	}

	public function get_icon() {
		return 'eicon-editor-list-ul pnpnd-icon-pro';
	}

	public function get_categories() {
		return array( 'ninja-drive' );
	}

	public function get_keywords() {
		return array( 'google drive', 'file list', 'embed', 'file' );
	}

	protected function get_module_type() {
		return 'file_list';
	}

	protected function is_pro(): bool {
		return true;
	}
}
