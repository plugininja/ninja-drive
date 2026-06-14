<?php

namespace Pnpnd\ND\Integrations\Elementor;

use Pnpnd\ND\Integrations\Elementor\Base_Widget;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class Embed_Documents extends Base_Widget {

	public function get_name() {
		return 'pnpnd-embed_documents';
	}
	public function get_title() {
		return __( 'Embed Documents', 'ninja-drive' );
	}
	public function get_icon() {
		return 'eicon-document-file';
	}
	public function get_categories() {
		return array( 'ninja-drive', 'basic' );
	}

	public function get_keywords() {
		return array( 'google drive', 'document', 'embed', 'file' );
	}

	protected function get_module_type() {
		return 'embed_documents';
	}

	protected function is_pro(): bool {
		return false;
	}
}
