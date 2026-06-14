<?php

namespace Pnpnd\ND\Integrations;

use Pnpnd\ND\Traits\Singleton;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class Classic_Editor extends Base_Integration {

	use Singleton;

	public function __construct() {
		parent::__construct( 'classic_editor', 'Classic Editor' );
	}

	public function init( string $id, array $integration ): void {
		$this->is_init = true;
	}

	public function do_hooks(): void {
		if ( ! $this->is_active() ) {
			return;
		}

		add_action( 'media_buttons', array( $this, 'add_media_button' ), 20 );
	}

	public function add_media_button(): void {

		if ( ! function_exists( 'get_current_screen' ) ) {
			return;
		}

		$screen = get_current_screen();
		if ( ! empty( $screen ) && 'post' !== $screen->base ) {
			return;
		}

		printf(
			'<div class="pnpnd-top-level-wrapper" style="display: inline;">
				<button id="pnpnd-media-button" type="button" class="pn-button pn-button--primary pn-button--medium rounded-sm text-capitalize not-own-color"
					role="button"
					title="%s">
					<span class="pn-icon">add_to_drive</span>%s
				</button>
			</div>',
			esc_attr__( 'Insert file from Google Drive', 'ninja-drive' ),
			esc_html__( 'Google Drive', 'ninja-drive' )
		);
	}
}
