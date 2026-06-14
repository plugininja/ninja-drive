<?php

namespace Pnpnd\ND\Models;

use Pnpnd\ND\Traits\Singleton;
use WP_Error;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

/**
 * Notice Model Class for Ninja Drive Plugin
 *
 * This class extends BaseModel to provide notice/log management functionality
 * with full compatibility with the base model's CRUD operations and error handling.
 *
 * @package Pnpnd\ND\Models
 * @since 1.0.0
 */
class Notices extends Base_Model {

	use Singleton;

	const TYPE_ERROR   = 'error';
	const TYPE_SUCCESS = 'success';
	const TYPE_WARNING = 'warning';
	const TYPE_INFO    = 'info';
	const MAX_ROWS     = 5000;

	/**
	 * Get all valid notice types.
	 *
	 * @return string[]
	 */
	public static function get_types(): array {
		return array(
			self::TYPE_ERROR,
			self::TYPE_SUCCESS,
			self::TYPE_WARNING,
			self::TYPE_INFO,
		);
	}

	/**
	 * Allowed columns for ordering
	 *
	 * @var array
	 */
	private $allowed_order_columns = array( 'id', 'created_at', 'updated_at', 'type', 'status', 'title' );

	/**
	 * Constructor
	 */
	public function __construct() {
		parent::__construct( 'pnpnd_notices' );
	}

	/**
	 * Prune oldest rows when count exceeds MAX_ROWS.
	 */
	public function maybe_prune() {
		global $wpdb;

		$count = (int) $wpdb->get_var( $wpdb->prepare( 'SELECT COUNT(*) FROM %i', $this->table_name ) ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
		if ( $count >= self::MAX_ROWS ) {
			$wpdb->query( $wpdb->prepare( 'DELETE FROM %i ORDER BY id ASC LIMIT %d', $this->table_name, $count - self::MAX_ROWS + 1 ) ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
		}
	}

	/**
	 * Get a single notice by ID
	 *
	 * @param int    $id The notice ID
	 * @param string $output Output type: OBJECT, ARRAY_A, or ARRAY_N
	 * @return object|array|null|WP_Error
	 */
	public function get_notice( int $id, $output = OBJECT ) {
		global $wpdb;

		$cache_key     = "pnpnd_notice_{$id}";
		$cached_notice = wp_cache_get( $cache_key, 'pnpnd_notices' );
		if ( false !== $cached_notice ) {
			return $cached_notice;
		}

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
		$notice = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM %i WHERE id = %d', $this->table_name, $id ), $output );
		if ( $notice ) {
			wp_cache_set( $cache_key, $notice, 'pnpnd_notices' );
		}

		return $notice;
	}

	/**
	 * Get all notices
	 *
	 * @param array  $args Optional arguments for pagination and filtering
	 * @param string $output Output type: OBJECT, ARRAY_A, or ARRAY_N
	 * @return array|WP_Error
	 */
	public function get_all( array $args = array(), $output = ARRAY_A ) {

		$page     = intval( $args['page'] ) ?? 1;
		$per_page = intval( $args['per_page'] ) ?? 10;
		$offset   = ( $page - 1 ) * $per_page;

		$status = $args['status'] ?? 'all';
		$type   = $args['type'] ?? '';

		global $wpdb;

		$sql = $wpdb->prepare( 'SELECT * FROM %i WHERE 1=1', $this->table_name );

		if ( ! empty( $status ) && 'all' !== $status ) {
			$sql .= $wpdb->prepare( ' AND status = %s', $status );
		}

		if ( ! empty( $type ) && in_array( $type, self::get_types(), true ) ) {
			$sql .= $wpdb->prepare( ' AND type = %s', $type );
		}

		$sql .= $wpdb->prepare( ' ORDER BY created_at DESC LIMIT %d OFFSET %d', $per_page, $offset );

		$valid_output_types = array( OBJECT, ARRAY_A, ARRAY_N );

		if ( ! in_array( $output, $valid_output_types, true ) ) {
			return new WP_Error( 400, __( 'Invalid output type specified.', 'ninja-drive' ) );
		}

		$cache_key      = "pnpnd_notices_page_{$page}_per_page_{$per_page}_status_{$status}_type_{$type}_output_{$output}";
		$cached_notices = wp_cache_get( $cache_key, 'pnpnd_notices' );
		if ( false !== $cached_notices ) {
			return $cached_notices;
		}

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.PreparedSQL.NotPrepared
		$notices = $wpdb->get_results( $sql, $output );

		if ( is_wp_error( $notices ) ) {
			return $notices;
		}

		if ( empty( $notices ) ) {
			return array();
		}

		// Get total count for pagination

		$count        = $this->count();
		$unread_count = $this->get_unread_count();

		$has_more = $page < ceil( $count / $per_page );

		$response = array(
			'notices'      => array_values( $notices ),
			'has_more'     => $has_more,
			'total'        => $count,
			'current_page' => $page,
			'per_page'     => $per_page,
			'total_pages'  => max( 1, (int) ceil( $count / $per_page ) ),
		);

		if ( ! empty( $unread_count ) ) {
			$response['unread_count'] = $unread_count;
		}

		if ( $has_more ) {
			$response['next_page'] = $page + 1;
		}

		wp_cache_set( $cache_key, $response, 'pnpnd_notices' );

		return $response;
	}

	/**
	 * Add a new notice to the database.
	 *
	 * @param array $data {
	 *                    An array of data to be inserted.
	 *
	 * @type string $widget_id    Widget ID.
	 * @type int $user_id      User ID.
	 * @type string $file_key     File key.
	 * @type string $file_name    File name.
	 * @type string $page        Page.
	 * @type array $data        Data.
	 * @type string $type        Notice type.
	 * @type string $title       Notice title.
	 * @type string $status      Notice status. Default 'unread'.
	 * @type string $description Notice description.
	 *              }
	 *
	 * @return int|WP_Error The ID of the new notice on success, WP_Error on failure.
	 */
	public function add( array $data ) {
		if ( empty( $data['type'] ) || empty( $data['title'] ) ) {
			return new WP_Error( 400, __( 'Type and title are required fields.', 'ninja-drive' ) );
		}

		$notice = array(
			'widget_id'   => $data['widget_id'] ?? null,
			'user_id'     => $data['user_id'] ?? get_current_user_id(),
			'file_key'    => $data['file_key'] ?? null,
			'file_name'   => $data['file_name'] ?? null,
			'page'        => $data['page'] ?? null,
			'data'        => maybe_serialize( $data['data'] ?? '' ),
			'type'        => $data['type'],
			'title'       => $data['title'],
			'status'      => $data['status'] ?? 'unread',
			'description' => $data['description'] ?? null,
			'created_at'  => current_time( 'mysql' ),
			'updated_at'  => current_time( 'mysql' ),
		);

		$format = array(
			'%s', // widget_id
			'%d', // user_id
			'%s', // file_key
			'%s', // file_name
			'%s', // page
			'%s', // data
			'%s', // type
			'%s', // title
			'%s', // status
			'%s', // description
			'%s', // created_at
			'%s', // updated_at
		);

		$result = $this->insert( $notice, $format, ARRAY_A );
		if ( is_wp_error( $result ) ) {
			return $result;
		}

		wp_cache_flush_group( 'pnpnd_notices' );
		$this->maybe_prune();

		return $result;
	}

	/**
	 * Delete a single notice
	 *
	 * @param int $id The notice ID
	 * @return bool|WP_Error
	 */
	public function delete_notice( int $id ) {
		if ( empty( $id ) ) {
			return new WP_Error( 400, __( 'Invalid ID provided.', 'ninja-drive' ) );
		}

		if ( ! $this->exists( array( 'id' => $id ) ) ) {
			return new WP_Error( 404, __( 'Notice not found.', 'ninja-drive' ) );
		}

		$result = $this->delete( array( 'id' => $id ), array( '%d' ) );
		if ( is_wp_error( $result ) ) {
			return $result;
		}

		wp_cache_delete( "pnpnd_notice_{$id}", 'pnpnd_notices' );
		wp_cache_delete( 'pnpnd_unread_count', 'pnpnd_notices' );

		return $result;
	}

	/**
	 * Delete all notices
	 *
	 * @return bool|WP_Error
	 */
	public function delete_all() {
		$result = $this->delete( array(), array(), true );
		if ( is_wp_error( $result ) ) {
			return $result;
		}

		wp_cache_flush_group( 'pnpnd_notices' );

		return $result;
	}

	/**
	 * Change the status of a notice
	 *
	 * @param int    $id The notice ID
	 * @param string $status The new status
	 * @param string $output Output type: 'bool', ARRAY_A, ARRAY_N, or OBJECT
	 * @return bool|array|object|WP_Error
	 */
	public function change_status( int $id, $status = 'read', $output = ARRAY_A ) {
		if ( empty( $id ) ) {
			return new WP_Error( 400, __( 'Invalid ID provided.', 'ninja-drive' ) );
		}

		$status = in_array( $status, array( 'read', 'unread' ), true ) ? $status : 'read';

		$result = $this->update( array( 'status' => $status ), array( 'id' => $id ), array( '%s' ), array( '%d' ), ARRAY_A );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		wp_cache_delete( "pnpnd_notice_{$id}", 'pnpnd_notices' );
		wp_cache_delete( 'pnpnd_unread_count', 'pnpnd_notices' );

		return $result;
	}

	/**
	 * Mark all notices as read
	 *
	 * @return bool|WP_Error
	 */
	public function mark_all_as_read() {
		$result = $this->update( array( 'status' => 'read' ), array( 'status' => 'unread' ), array( '%s' ), array( '%s' ) );
		if ( is_wp_error( $result ) ) {
			return $result;
		}

		wp_cache_flush_group( 'pnpnd_notices' );

		return $result;
	}

	public function get_unread_count() {
		$cache_key    = 'pnpnd_unread_count';
		$cached_count = wp_cache_get( $cache_key, 'pnpnd_notices' );
		if ( false !== $cached_count ) {
			return $cached_count;
		}

		global $wpdb;
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
		$result = $wpdb->get_var( $wpdb->prepare( 'SELECT COUNT(*) FROM %i WHERE status = %s', $this->table_name, 'unread' ) );
		if ( $wpdb->last_error ) {
			$message = __( 'A database error occurred while fetching unread count. Please try again.', 'ninja-drive' );
			if ( current_user_can( 'manage_options' ) ) {
				$message = sprintf(
					// translators: %1$s is the table name, %2$s is the database error message.
					__( 'A database error occurred while fetching unread count from %1$s: %2$s', 'ninja-drive' ),
					esc_html( $this->table_name ),
					$wpdb->last_error
				);
			}

			return new WP_Error( 400, $message );
		}

		wp_cache_set( $cache_key, (int) $result, 'pnpnd_notices' );

		return (int) $result;
	}
}
