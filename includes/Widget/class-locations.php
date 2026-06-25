<?php

namespace Pnpnd\ND\Widget;

use Pnpnd\ND\Traits\Singleton;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class Locations {

	use Singleton;

	private static $cached_elementor_widget_ids = array();

	public function __construct() {
		add_action( 'pre_post_update', array( $this, 'pre_post_update' ), 10, 2 );
		add_action( 'save_post', array( $this, 'save_post' ), 10, 3 );
		add_action( 'post_updated', array( $this, 'post_updated' ), 10, 3 );
		add_action( 'wp_trash_post', array( $this, 'trash_post' ) );
		add_action( 'untrash_post', array( $this, 'untrash_post' ) );
		add_action( 'delete_post', array( $this, 'trash_post' ) );
	}

	public function pre_post_update( $post_id, $data ) {
		if (
			! in_array( get_post_type( $post_id ), $this->get_post_types(), true ) ||
			'builder' !== get_post_meta( $post_id, '_elementor_edit_mode', true )
		) {
			return;
		}

		self::$cached_elementor_widget_ids[ $post_id ] = $this->get_widget_ids_from_elementor_data( $post_id );
	}

	public function save_post( $post_id, $post, $update ) {
		if (
			$update ||
			! in_array( $post->post_type, $this->get_post_types(), true ) ||
			! in_array( $post->post_status, $this->get_post_statuses(), true )
		) {
			return;
		}

		$widget_ids = $this->get_widget_ids_from_post( $post );
		$this->update_widget_locations( $post, array(), $widget_ids );
	}

	public function post_updated( $post_id, $post_after, $post_before ) {

		if (
			! in_array( $post_after->post_type, $this->get_post_types(), true ) ||
			! in_array( $post_after->post_status, $this->get_post_statuses(), true )
		) {
			return;
		}

		$content_before = $this->get_widget_ids( $post_before->post_content );
		$content_after  = $this->get_widget_ids( $post_after->post_content );

		$elementor_before = isset( self::$cached_elementor_widget_ids[ $post_id ] )
			? self::$cached_elementor_widget_ids[ $post_id ]
			: array();
		$elementor_after  = $this->get_widget_ids_from_elementor_data( $post_id );

		unset( self::$cached_elementor_widget_ids[ $post_id ] );

		$widget_ids_before = array_values( array_unique( array_merge( $content_before, $elementor_before ) ) );
		$widget_ids_after  = array_values( array_unique( array_merge( $content_after, $elementor_after ) ) );

		$this->update_widget_locations( $post_after, $widget_ids_before, $widget_ids_after );
	}

	public function trash_post( $post_id ) {

		$post              = get_post( $post_id );
		$widget_ids_before = $this->get_widget_ids_from_post( $post );
		$widget_ids_after  = array();

		$this->update_widget_locations( $post, $widget_ids_before, $widget_ids_after );
	}

	public function untrash_post( $post_id ) {

		$post              = get_post( $post_id );
		$widget_ids_before = array();
		$widget_ids_after  = $this->get_widget_ids_from_post( $post );

		$this->update_widget_locations( $post, $widget_ids_before, $widget_ids_after );
	}

	private function get_widget_ids_from_post( $post ) {
		$content_ids   = $this->get_widget_ids( $post->post_content );
		$elementor_ids = $this->get_widget_ids_from_elementor_data( $post->ID );

		return array_values( array_unique( array_merge( $content_ids, $elementor_ids ) ) );
	}

	public function get_widget_ids_from_elementor_data( $post_id ) {

		$widget_ids = array();

		$elementor_data = get_post_meta( $post_id, '_elementor_data', true );

		if ( empty( $elementor_data ) ) {
			return $widget_ids;
		}

		if ( is_string( $elementor_data ) ) {
			$elementor_data = json_decode( $elementor_data, true );
		}

		if ( ! is_array( $elementor_data ) ) {
			return $widget_ids;
		}

		$this->extract_widget_ids_from_elementor_elements( $elementor_data, $widget_ids );

		return array_values( array_unique( array_map( 'intval', $widget_ids ) ) );
	}

	private function extract_widget_ids_from_elementor_elements( $elements, &$widget_ids ) {

		foreach ( $elements as $element ) {
			if ( empty( $element['elType'] ) ) {
				continue;
			}

			if ( 'widget' === $element['elType'] && ! empty( $element['widgetType'] ) ) {
				if ( 0 === strpos( $element['widgetType'], 'pnpnd-' ) ) {
					$settings = ! empty( $element['settings'] ) ? $element['settings'] : array();

					if ( ! empty( $settings['widget_data'] ) ) {
						$widget_data = json_decode( $settings['widget_data'], true );
						if ( ! empty( $widget_data['id'] ) ) {
							$widget_ids[] = $widget_data['id'];
						}
					}

					if ( ! empty( $settings['select_widget'] ) ) {
						$widget_ids[] = $settings['select_widget'];
					}
				}
				continue;
			}

			if ( ! empty( $element['elements'] ) && is_array( $element['elements'] ) ) {
				$this->extract_widget_ids_from_elementor_elements( $element['elements'], $widget_ids );
			}
		}
	}

	public function update_widget_locations( $post_after, $widget_ids_before, $widget_ids_after, $additional_data = array() ) {
		global $wpdb;

		$table = "{$wpdb->prefix}pnpnd_widgets";

		$post_id = $post_after->ID;
		$url     = get_permalink( $post_id );
		$url     = ( false === $url || is_wp_error( $url ) ) ? '' : $url;

		$widget_ids_to_remove = array_diff( $widget_ids_before, $widget_ids_after );
		$widget_ids_to_add    = array_diff( $widget_ids_after, $widget_ids_before );
		$widget_ids_to_update = array_intersect( $widget_ids_before, $widget_ids_after );

		$widget_ids_to_add = array_merge( $widget_ids_to_add, $widget_ids_to_update );

		foreach ( $widget_ids_to_remove as $widget_id ) {
			$locations = $this->get_locations_without_current_post( $widget_id, $post_id );

			$serialize_locations = maybe_serialize( $locations );

			$cache_key = "pnpnd_widget_locations_{$widget_id}_{$post_id}_" . md5( $serialize_locations );

			if ( wp_cache_get( $cache_key, 'ninja-drive' ) === $serialize_locations ) {
				continue;
			}

			wp_cache_set( $cache_key, $serialize_locations, 'ninja-drive' );

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

			$locations[] = wp_parse_args( $additional_data, $location );

			$cache_key = "pnpnd_widget_locations_{$widget_id}_{$post_id}_" . md5( maybe_serialize( $locations ) );

			if ( wp_cache_get( $cache_key, 'ninja-drive' ) === maybe_serialize( $locations ) ) {
				continue;
			}

			$locations = maybe_serialize( $locations );

			wp_cache_set( $cache_key, $locations, 'ninja-drive' );

			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
			$wpdb->update( $table, array( 'locations' => $locations ), array( 'id' => $widget_id ) );
		}
	}

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

	public function get_post_statuses() {

		return array( 'publish', 'pending', 'draft', 'future', 'private' );
	}

	public function get_widget_ids( $content ) {

		$widget_ids = array();

		$widgets    = pnpnd_get_widgets();
		$widgets_id = wp_list_pluck( $widgets, 'id' );

		$widgets_id_string = implode( '|', $widgets_id );

		if (
			preg_match_all(
				'#\[\s*ninja-drive\b[^\]]*id\s*=\s*"(\d+)"[^\]]*\]|<!--\s*wp:ninja-drive/(?:' . $widgets_id_string . '|shortcodes)\s+\{[^}]*"id"\s*:\s*"?(\d+)"?[^}]*\}\s*/-->#',
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

	private function get_locations_without_current_post( int $widget_id, int $post_id ) {
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
