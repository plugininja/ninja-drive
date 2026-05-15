<?php

namespace Pninja\ND\Integrations\Elementor;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class EmbedDocuments extends BaseWidget {

	public function get_name() {
		return 'pnpnd-embed-documents';
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

	protected function get_module_type() {
		return 'embed-documents';
	}

	protected function is_pro(): bool {
		return true;
	}
}
