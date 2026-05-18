<?php

namespace Pnpnd\ND\Widget;

use function defined;
use function in_array;
use function is_array;

use Pnpnd\ND\Utils\Singleton;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class Locations {

	use Singleton;

	public function __construct() {
		// Monitoring hooks.
		add_action( 'save_post', array( $this, 'save_post' ), 10, 3 );
		add_action( 'post_updated', array( $this, 'post_updated' ), 10, 3 );
		add_action( 'wp_trash_post', array( $this, 'trash_post' ) );
		add_action( 'untrash_post', array( $this, 'untrash_post' ) );
		add_action( 'delete_post', array( $this, 'trash_post' ) );
	}

	public function save_post( $post_ID, $post, $update ) {
		if (
			$update ||
			! in_array( $post->post_type, $this->get_post_types(), true ) ||
			! in_array( $post->post_status, $this->get_post_statuses(), true )
		) {
			return;
		}

		$widget_ids = $this->get_widget_ids( $post->post_content );
		$this->update_widget_locations( $post, array(), $widget_ids );
	}

	public function post_updated( $post_id, $post_after, $post_before ) {

		if (
			! in_array( $post_after->post_type, $this->get_post_types(), true ) ||
			! in_array( $post_after->post_status, $this->get_post_statuses(), true )
		) {
			return;
		}

		$widget_ids_before = $this->get_widget_ids( $post_before->post_content );
		$widget_ids_after  = $this->get_widget_ids( $post_after->post_content );

		$this->update_widget_locations( $post_after, $widget_ids_before, $widget_ids_after );
	}

	public function trash_post( $post_id ) {

		$post              = get_post( $post_id );
		$widget_ids_before = $this->get_widget_ids( $post->post_content );
		$widget_ids_after  = array();

		$this->update_widget_locations( $post, $widget_ids_before, $widget_ids_after );
	}

	public function untrash_post( $post_id ) {

		$post              = get_post( $post_id );
		$widget_ids_before = array();
		$widget_ids_after  = $this->get_widget_ids( $post->post_content );

		$this->update_widget_locations( $post, $widget_ids_before, $widget_ids_after );
	}

	public function update_widget_locations( $post_after, $widget_ids_before, $widget_ids_after, $additionalData = array() ) {
		global $wpdb;

		$table = "{$wpdb->prefix}pnpnd_widgets";

		$post_id = $post_after->ID;
		$url     = get_permalink( $post_id );
		$url     = ( $url === false || is_wp_error( $url ) ) ? '' : $url;

		$widget_ids_to_remove = array_diff( $widget_ids_before, $widget_ids_after );
		$widget_ids_to_add    = array_diff( $widget_ids_after, $widget_ids_before );

		foreach ( $widget_ids_to_remove as $widget_id ) {
			$locations = $this->get_locations_without_current_post( $widget_id, $post_id );

			$serialize_locations = maybe_serialize( $locations );

			$cacheKey = "pnpnd_widget_locations_{$widget_id}_{$post_id}_" . md5( $serialize_locations );

			if ( wp_cache_get( $cacheKey, 'ninja-drive' ) === $serialize_locations ) {
				continue;
			}

			wp_cache_set( $cacheKey, $serialize_locations, 'ninja-drive' );

            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
			$wpdb->update( $table, array( 'locations' => $serialize_locations ), array( 'id' => $widget_id ) );
		}

		foreach ( $widget_ids_to_add as $widget_id ) {
			$locations = $this->get_locations_without_current_post( $widget_id, $post_id );

			$location = array(
				'type'      => $post_after->post_type,
				'title'     => $post_after->post_title,
				'widget_id' => $widget_id,
				'post_id'   => $post_id,
				'status'    => $post_after->post_status,
				'url'       => $url,
			);

			$locations[] = wp_parse_args( $additionalData, $location );

			$cacheKey = "pnpnd_widget_locations_{$widget_id}_{$post_id}_" . md5( maybe_serialize( $locations ) );

			if ( wp_cache_get( $cacheKey, 'ninja-drive' ) === maybe_serialize( $locations ) ) {
				continue;
			}

			$locations = maybe_serialize( $locations );

			wp_cache_set( $cacheKey, $locations, 'ninja-drive' );

            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
			$wpdb->update( $table, array( 'locations' => $locations ), array( 'id' => $widget_id ) );
		}
	}

	/**
	 * Get post types for search in.
	 *
	 * @return string[]
	 * @since 1.0.1
	 */
	public function get_post_types() {

		$args       = array(
			'public'             => true,
			'publicly_queryable' => true,
		);
		$post_types = get_post_types( $args, 'names', 'or' );

		unset( $post_types['attachment'] );

		$post_types[] = 'wp_template';
		$post_types[] = 'wp_template_part';

		return $post_types;
	}

	/**
	 * Get post statuses for search in.
	 *
	 * @return string[]
	 * @since 1.0.1
	 */
	public function get_post_statuses() {

		return array( 'publish', 'pending', 'draft', 'future', 'private' );
	}

	public function get_widget_ids( $content ) {

		$widget_ids = array();

		$widgets    = pnpndGetWidgets();
		$widgets_id = wp_list_pluck( $widgets, 'id' );

		$widgets_id_string = implode( '|', $widgets_id );

		if (
			preg_match_all(
				/**
				 * Extract id from shortcode or block.
				 * Examples:
				 * [ninja-drive id="1" ]
				 * <!-- wp:ninja-drive/shortcodes {"id":"1"} /-->
				 * In both, we should find 1.
				 */
				'#\[\s*ninja-drive\b[^\]]*id\s*=\s*"(\d+)"[^\]]*\]|<!--\s*wp:ninja-drive/(?:' . $widgets_id_string . '|shortcodes)\s+\{"id":"(\d+)"\}\s*/-->#',
				$content,
				$matches
			)
		) {
			array_shift( $matches );
			$widget_ids = array_map(
				'intval',
				array_unique( array_filter( array_merge( ...$matches ) ) )
			);
		}

		return $widget_ids;
	}

	private function get_locations_without_current_post( $widget_id, $post_id ) {
		if ( empty( $widget_id ) || empty( $post_id ) ) {
			return array();
		}
		global $wpdb;
		$table = "{$wpdb->prefix}pnpnd_widgets";

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$locations = $wpdb->get_var( $wpdb->prepare( 'SELECT locations FROM %i WHERE id = %d', $table, $widget_id ) );
		$locations = ! empty( $locations ) ? maybe_unserialize( $locations ) : array();

		$locations = is_array( $locations ) ? array_values( $locations ) : array();

		if ( ! is_array( $locations ) ) {
			$locations = array();
		}

		return array_filter(
			$locations,
			static function ( $location ) use ( $post_id ) {
				if ( ! is_array( $location ) || ! isset( $location['post_id'] ) ) {
					return false;
				}

				return $location['post_id'] !== $post_id;
			}
		);
	}
}
