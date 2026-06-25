<?php

namespace Pnpnd\ND\Integrations;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class Media_Library extends Base_Integration {

	public function __construct() {
		parent::__construct( 'media_library', 'Media Library' );
		add_action( 'pre_get_posts', array( $this, 'filter_grid_attachments' ) );
	}

	public function init( string $id, array $integration ): void {
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_scripts' ) );
	}

	public function enqueue_admin_scripts( $hook ): void {
		if ( 'upload.php' !== $hook ) {
			return;
		}

		wp_enqueue_script( 'pnpnd-media-library' );
	}

	public function filter_grid_attachments( $query ) {

		if ( ! isset( $query->query_vars['post_type'] ) || 'attachment' !== $query->query_vars['post_type'] ) {
			return $query;
		}

        // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		if ( empty( $_REQUEST['query'] ) ) {
			return $query;
		}

		$meta_query = $query->get( 'meta_query' );
		if ( empty( $meta_query ) ) {
			$meta_query = array();
		}

		$meta_query[] = array(
			'relation' => 'OR',
			array(
				'key'     => '_pnpnd_media_file_key',
				'compare' => 'NOT EXISTS',
			),
		);

		$query->set( 'meta_query', $meta_query );

		return $query;
	}
}
