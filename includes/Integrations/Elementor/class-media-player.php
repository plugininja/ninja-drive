<?php

namespace Pnpnd\ND\Integrations\Elementor;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class Media_Player extends Base_Widget {

	public function get_name() {
		return 'pnpnd-media_player';
	}

	public function get_title() {
		return __( 'Media Player', 'ninja-drive' );
	}

	public function get_icon() {
		return 'eicon-video-camera pnpnd-icon-pro';
	}

	public function get_categories() {
		return array( 'ninja-drive' );
	}

	public function get_keywords() {
		return array( 'google drive', 'media player', 'embed', 'file' );
	}

	protected function get_module_type() {
		return 'media_player';
	}

	protected function is_pro(): bool {
		return true;
	}
}
