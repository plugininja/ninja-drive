<?php

namespace Pnpnd\ND\Models;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

use Pnpnd\ND\Traits\Singleton;

/**
 * File_Meta model.
 *
 * Stores per-file metadata (shared_data, download_data, cached_data, ...) as
 * key/value rows in `{$wpdb->prefix}pnpnd_file_meta`. Each file has at most
 * one row per `meta_key` — uniqueness is enforced by the composite UNIQUE KEY
 * (`file_key`, `meta_key`).
 */
class File_Meta extends Base_Model {

	use Singleton;

	public function __construct() {
		parent::__construct( 'pnpnd_file_meta' );
	}

	/**
	 * Returns the meta table name (with prefix).
	 */
	public function get_table_name() {
		return $this->table_name;
	}

	/**
	 * Retrieve a single meta value for a file.
	 *
	 * @param string $file_key The file's primary key.
	 * @param string $meta_key The meta key to read.
	 *
	 * @return mixed|null Unserialized value, or null when the row does not exist.
	 */
	public function get_meta( string $file_key, string $meta_key ) {
		if ( empty( $file_key ) || empty( $meta_key ) ) {
			return null;
		}

		$cache_key = "pnpnd_file_meta_{$file_key}_{$meta_key}";
		$cached    = wp_cache_get( $cache_key, 'pnpnd_files' );
		if ( false !== $cached ) {
			return $cached;
		}

		global $wpdb;

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
		$raw = $wpdb->get_var(
			$wpdb->prepare(
				'SELECT `meta_value` FROM %i WHERE `file_key` = %s AND `meta_key` = %s',
				$this->table_name,
				$file_key,
				$meta_key
			)
		);

		if ( null === $raw || false === $raw ) {
			wp_cache_add( $cache_key, null, 'pnpnd_files', HOUR_IN_SECONDS );
			return null;
		}

		$value = maybe_unserialize( $raw );

		wp_cache_add( $cache_key, $value, 'pnpnd_files', HOUR_IN_SECONDS );

		return $value;
	}

	/**
	 * Retrieve all meta rows for a file, keyed by `meta_key`.
	 *
	 * @param string $file_key The file's primary key.
	 *
	 * @return array Associative array of `[meta_key => unserialized_value]`.
	 */
	public function get_all_meta( string $file_key ): array {
		if ( empty( $file_key ) ) {
			return array();
		}

		global $wpdb;

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
		$rows = $wpdb->get_results(
			$wpdb->prepare(
				'SELECT `meta_key`, `meta_value` FROM %i WHERE `file_key` = %s AND `meta_value` IS NOT NULL AND `meta_value` != \'\' AND `meta_value` != \'a:0:{}\'',
				$this->table_name,
				$file_key
			),
			ARRAY_A
		);

		if ( empty( $rows ) ) {
			return array();
		}

		$meta = array();
		foreach ( $rows as $row ) {
			$meta[ $row['meta_key'] ] = maybe_unserialize( $row['meta_value'] );
		}

		return $meta;
	}

	/**
	 * Batch-load meta for many files in a single query to avoid N+1 in list views.
	 *
	 * @param array $file_keys Array of file primary keys.
	 *
	 * @return array Map of `[file_key => [meta_key => unserialized_value]]`.
	 */
	public function get_meta_for_files( array $file_keys ): array {
		if ( empty( $file_keys ) ) {
			return array();
		}

		$file_keys = array_values( array_unique( array_filter( $file_keys ) ) );
		if ( empty( $file_keys ) ) {
			return array();
		}

		$placeholders = implode( ',', array_fill( 0, count( $file_keys ), '%s' ) );

		global $wpdb;

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$rows = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT `file_key`, `meta_key`, `meta_value` FROM %i WHERE `file_key` IN ($placeholders) AND `meta_value` IS NOT NULL AND `meta_value` != '' AND `meta_value` != 'a:0:{}'", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
				array_merge( array( $this->table_name ), $file_keys )
			),
			ARRAY_A
		);

		$result = array();
		foreach ( $file_keys as $key ) {
			$result[ $key ] = array();
		}

		if ( empty( $rows ) ) {
			return $result;
		}

		foreach ( $rows as $row ) {
			$result[ $row['file_key'] ][ $row['meta_key'] ] = maybe_unserialize( $row['meta_value'] );
		}

		return $result;
	}

	/**
	 * Insert or update a single meta value for a file.
	 *
	 * Existing rows (matched by `file_key` + `meta_key`) are overwritten via
	 * `INSERT ... ON DUPLICATE KEY UPDATE` so this is safe to call repeatedly.
	 *
	 * @param string $file_key   The file's primary key.
	 * @param string $meta_key   The meta key to write.
	 * @param mixed  $meta_value Value to store. Serialized automatically.
	 *
	 * @return bool|WP_Error True on success, WP_Error on failure.
	 */
	public function update_meta( string $file_key, string $meta_key, $meta_value ) {
		if ( empty( $file_key ) || empty( $meta_key ) ) {
			return new \WP_Error( 'invalid_meta', __( 'file_key and meta_key are required.', 'ninja-drive' ) );
		}

		global $wpdb;

		$now        = current_time( 'mysql' );
		$serialized = maybe_serialize( $meta_value );

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
		$result = $wpdb->query(
			$wpdb->prepare(
				'INSERT INTO %i (`file_key`, `meta_key`, `meta_value`, `created_at`, `updated_at`)
				VALUES (%s, %s, %s, %s, %s)
				ON DUPLICATE KEY UPDATE `meta_value` = VALUES(`meta_value`), `updated_at` = VALUES(`updated_at`)',
				$this->table_name,
				$file_key,
				$meta_key,
				$serialized,
				$now,
				$now
			)
		);

		if ( false === $result ) {
			return new \WP_Error( 'db_error', __( 'Failed to write file meta.', 'ninja-drive' ) );
		}

		$this->flush_meta_cache( $file_key, $meta_key );

		return true;
	}

	/**
	 * Delete a single meta row from a file.
	 *
	 * @param string $file_key The file's primary key.
	 * @param string $meta_key The meta key to remove.
	 *
	 * @return int|WP_Error Number of rows deleted or WP_Error on failure.
	 */
	public function delete_meta( string $file_key, string $meta_key ) {
		if ( empty( $file_key ) || empty( $meta_key ) ) {
			return 0;
		}

		global $wpdb;

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
		$result = $wpdb->delete(
			$this->table_name,
			array(
				'file_key' => $file_key,
				'meta_key' => $meta_key,
			),
			array( '%s', '%s' )
		);

		if ( false === $result ) {
			return new \WP_Error( 'db_error', __( 'Failed to delete file meta.', 'ninja-drive' ) );
		}

		$this->flush_meta_cache( $file_key, $meta_key );

		return (int) $result;
	}

	/**
	 * Delete every meta row for a file.
	 *
	 * @param string $file_key The file's primary key.
	 *
	 * @return int|WP_Error Number of rows deleted or WP_Error on failure.
	 */
	public function delete_all_meta( string $file_key ) {
		if ( empty( $file_key ) ) {
			return 0;
		}

		global $wpdb;

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
		$result = $wpdb->delete(
			$this->table_name,
			array( 'file_key' => $file_key ),
			array( '%s' )
		);

		if ( false === $result ) {
			return new \WP_Error( 'db_error', __( 'Failed to delete file meta.', 'ninja-drive' ) );
		}

		wp_cache_flush_group( 'pnpnd_files' );

		return (int) $result;
	}

	/**
	 * Invalidate the per-row and parent-file caches for a meta entry.
	 */
	private function flush_meta_cache( string $file_key, string $meta_key ) {
		wp_cache_delete( "pnpnd_file_meta_{$file_key}_{$meta_key}", 'pnpnd_files' );
		wp_cache_flush_group( 'pnpnd_files' );
	}
}
