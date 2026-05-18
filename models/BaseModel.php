<?php

namespace Pnpnd\ND\Models;

use Exception;
use WP_Error;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

/**
 * Base Model Class for Ninja Drive Plugin
 *
 * This abstract class provides common database operations and utilities
 * for all model classes in the Ninja Drive plugin.
 *
 * Features:
 * - CRUD operations (Create, Read, Update, Delete)
 * - Database error handling with WP_Error
 * - Input validation and sanitization
 * - Pagination utilities
 * - Account validation
 * - Protection against cloning and serialization
 *
 * @package Pnpnd\ND\Models
 * @since 1.0.0
 */
abstract class BaseModel {

	public const MAX_ITEMS_PER_PAGE = 1000;

	/**
	 * Table name for the model
	 *
	 * @var string
	 */
	protected $tableName;

	/**
	 * Constructor to initialize the model with database access
	 *
	 * @param string $tableSuffix Table suffix specific to the model
	 */
	public function __construct( $tableSuffix ) {
		global $wpdb;
		$this->tableName = "{$wpdb->prefix}$tableSuffix";
	}

	/**
	 * Disallow cloning of this class
	 *
	 * @throws Exception
	 */
	public function __clone() {
		throw new Exception( esc_html__( 'Clone is not allowed.', 'ninja-drive' ) );
	}

	/**
	 * Disallow serialization of this class
	 *
	 * @throws Exception
	 */
	public function __sleep() {
		throw new Exception( esc_html__( 'Serialization is forbidden.', 'ninja-drive' ) );
	}

	/**
	 * Disallow deserialization of this class
	 *
	 * @throws Exception
	 */
	public function __wakeup() {
		throw new Exception( esc_html__( 'Deserialization is forbidden.', 'ninja-drive' ) );
	}

	/**
	 * Returns the number of rows in the table
	 *
	 * @return int|WP_Error The number of rows in the table, or a WP_Error if a database error occurred
	 */
	public function count() {
		global $wpdb;

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$result = $wpdb->get_var( $wpdb->prepare( 'SELECT COUNT(*) FROM %i', $this->tableName ) );

		if ( $wpdb->last_error ) {
			$message = __( 'A database error occurred. Please try again.', 'ninja-drive' );
			if ( current_user_can( 'manage_options' ) ) {
				$message = sprintf(
					// translators: %1$s is the table name, %2$s is the database error message.
					__( 'A database error occurred while counting records in %1$s: %2$s', 'ninja-drive' ),
					esc_html( $this->tableName ),
					$wpdb->last_error
				);
			}

			return new WP_Error(
				400,
				$message
			);
		}

		return (int) $result;
	}

	/**
	 * Insert a record into the database
	 *
	 * @param array  $data The data to insert
	 * @param array  $format Array of formats to be mapped to each of the value in $data
	 * @param string $output Output type: 'bool', ARRAY_A, ARRAY_N, or OBJECT
	 * @return bool|array|object|WP_Error
	 */
	protected function insert( array $data, array $format, $output = 'bool' ) {
		global $wpdb;
		if ( empty( $data ) ) {
			return new WP_Error( 400, __( 'Data cannot be empty for insert operation.', 'ninja-drive' ) );
		}

		$allowedOutputs = array( 'bool', ARRAY_A, ARRAY_N, OBJECT );
		if ( ! in_array( $output, $allowedOutputs, true ) ) {
			$output = 'bool';
		}

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
		$inserted = $wpdb->insert( $this->tableName, $data, $format );

		if ( $wpdb->last_error ) {
			$message = __( 'A database error occurred. Please try again.', 'ninja-drive' );
			if ( current_user_can( 'manage_options' ) ) {
				$message = sprintf(
					// translators: %1$s is the table name, %2$s is the database error message.
					__( 'A database error occurred while inserting record into %1$s: %2$s', 'ninja-drive' ),
					esc_html( $this->tableName ),
					$wpdb->last_error
				);
			}

			return new WP_Error( 400, $message );
		}

		if ( ! $inserted ) {
			return new WP_Error( 500, __( 'Failed to insert data into database.', 'ninja-drive' ) );
		}

		if ( $output === 'bool' ) {
			return true;
		}

		$insertedId = $wpdb->insert_id;
		if ( is_int( $insertedId ) && $insertedId > 0 ) {

            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			return $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM %i WHERE id = %d', $this->tableName, $insertedId ), $output );
		}

		return $inserted;
	}

	/**
	 * Update a record in the database
	 *
	 * @param array  $data The data to update
	 * @param array  $where Array of where conditions for the update
	 * @param array  $format Array of formats to be mapped to each of the value in $data
	 * @param array  $where_format Array of formats to be mapped to each of the values in $where
	 * @param string $output Output type: 'bool', ARRAY_A, ARRAY_N, or OBJECT
	 * @return bool|array|object|WP_Error
	 */
	protected function update( array $data, array $where, array $format, array $where_format, $output = 'bool' ) {
		global $wpdb;
		if ( empty( $data ) ) {
			return new WP_Error( 400, __( 'Data cannot be empty for update operation.', 'ninja-drive' ) );
		}

		if ( empty( $where ) ) {
			return new WP_Error( 400, __( 'Where conditions cannot be empty for update operation.', 'ninja-drive' ) );
		}

		$allowedOutputs = array( 'bool', ARRAY_A, ARRAY_N, OBJECT );
		if ( ! in_array( $output, $allowedOutputs, true ) ) {
			$output = 'bool';
		}

		if ( count( $data ) !== count( $format ) ) {
			return new WP_Error( 400, __( 'Data and format array must have the same number of elements.', 'ninja-drive' ) );
		}

		if ( count( $where ) !== count( $where_format ) ) {
			return new WP_Error( 400, __( 'Where conditions and where format array must have the same number of elements.', 'ninja-drive' ) );
		}

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
		$updated = $wpdb->update( $this->tableName, $data, $where, $format, $where_format );

		if ( $wpdb->last_error ) {
			$message = __( 'A database error occurred. Please try again.', 'ninja-drive' );
			if ( current_user_can( 'manage_options' ) ) {
				$message = sprintf(
					// translators: %1$s is the table name, %2$s is the database error message.
					__( 'A database error occurred while updating record in %1$s: %2$s', 'ninja-drive' ),
					esc_html( $this->tableName ),
					$wpdb->last_error
				);
			}

			return new WP_Error( 400, $message );
		}

		if ( $updated === false ) {
			return new WP_Error( 500, __( 'Failed to update data in database.', 'ninja-drive' ) );
		}

		wp_cache_flush_group( 'pnpnd_exists' );
		wp_cache_flush_group( 'pnpnd_widgets' );
		wp_cache_flush_group( 'pnpnd_accounts' );
		wp_cache_flush_group( 'pnpnd_files' );

		if ( $output === 'bool' ) {
			return $updated > 0;
		}

		if ( $updated > 0 && isset( $where['id'] ) && is_int( $where['id'] ) && $where['id'] > 0 ) {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			return $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM %i WHERE id = %d', $this->tableName, $where['id'] ), $output );
		}

		return $updated;
	}

	/**
	 * Delete records from the database.
	 *
	 * This method supports both associative arrays for conditions and raw SQL strings with placeholders.
	 * The method will automatically determine which approach to use.
	 *
	 * @param array|string $where The conditions to delete. Can be an associative array or a raw SQL string with placeholders.
	 * @param array        $where_format The formats for the values in $where.
	 * @param bool         $allowAll Whether to allow deletion of all records without a WHERE clause. Defaults to false.
	 * @return int|WP_Error The number of rows deleted if successful, or a WP_Error object on failure.
	 */
	protected function delete( $where = array(), $where_format = array(), $allowAll = false ) {
		global $wpdb;
		if ( is_array( $where ) && ! empty( $where ) ) {

			foreach ( array_keys( $where ) as $field ) {
				if ( ! preg_match( '/^[a-zA-Z0-9_]+$/', $field ) ) {
					return new WP_Error(
						'invalid_field',
						__( 'Invalid field name provided.', 'ninja-drive' )
					);
				}
			}

            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
			$result = $wpdb->delete( $this->tableName, $where, $where_format );
		} elseif ( empty( $where ) && $allowAll ) {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
			$result = $wpdb->query( $wpdb->prepare( 'DELETE FROM %i', $this->tableName ) );
		} else {
			return new WP_Error(
				'no_where_clause',
				__( 'Delete operation blocked: WHERE clause is required.', 'ninja-drive' )
			);
		}

		if ( $wpdb->last_error ) {
			$message = __( 'A database error occurred. Please try again.', 'ninja-drive' );
			if ( current_user_can( 'manage_options' ) ) {
				$message = sprintf(
					/* translators: %1$s is the table name, %2$s is the database error message. */
					__( 'A database error occurred while deleting record from %1$s: %2$s', 'ninja-drive' ),
					esc_html( $this->tableName ),
					$wpdb->last_error
				);
			}

			return new WP_Error(
				'db_error',
				$message
			);
		}

		if ( $result === false ) {
			return new WP_Error(
				'delete_failed',
				__( 'Failed to delete data from database.', 'ninja-drive' )
			);
		}

		wp_cache_flush_group( 'pnpnd_exists' );
		wp_cache_flush_group( 'pnpnd_widgets' );
		wp_cache_flush_group( 'pnpnd_accounts' );
		wp_cache_flush_group( 'pnpnd_files' );

		return (int) $result;
	}

	/**
	 * Check if a record exists based on given conditions
	 *
	 * @param array       $where Array of where conditions
	 * @param string|null $tableName Optional table name to check against, defaults to the model's table
	 * @return bool|WP_Error True if record exists, false if not, WP_Error on database error
	 */
	protected function exists( array $where, $tableName = null ) {
		if ( empty( $where ) ) {
			return new WP_Error(
				'empty_where',
				__( 'Where conditions cannot be empty for exists check.', 'ninja-drive' )
			);
		}

		global $wpdb;
		$tableName = empty( $tableName ) ? $this->tableName : $tableName;

		$sql = $wpdb->prepare( 'SELECT 1 FROM %i WHERE 1=1', $tableName );

		foreach ( $where as $column => $value ) {
			if ( ! preg_match( '/^[a-zA-Z0-9_]+$/', $column ) ) {
				return new WP_Error(
					'invalid_column',
					__( 'Invalid column name provided.', 'ninja-drive' )
				);
			}

			$sql .= $wpdb->prepare( ' AND %i = %s', $column, $value );
		}

		$sql .= $wpdb->prepare( ' LIMIT %d', 1 );

        // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared, PluginCheck.Security.DirectDB.UnescapedDBParameter, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.DirectDatabaseQuery.DirectQuery
		$result = $wpdb->get_var( $sql );

		if ( $wpdb->last_error ) {
			$message = __( 'A database error occurred. Please try again.', 'ninja-drive' );
			if ( current_user_can( 'manage_options' ) ) {
				$message = sprintf(
					// translators: %1$s is the table name, %2$s is the database error message.
					__( 'A database error occurred while checking existence in %1$s: %2$s', 'ninja-drive' ),
					esc_html( $this->tableName ),
					$wpdb->last_error
				);
			}

			return new WP_Error(
				'db_error',
				$message
			);
		}

		return ! is_null( $result );
	}

	/**
	 * Sanitize and validate order direction
	 *
	 * @param string $order The order direction (ASC or DESC)
	 * @return string Valid order direction
	 */
	protected function sanitizeOrder( $order ) {
		$order = strtoupper( trim( $order ) );

		return in_array( $order, array( 'ASC', 'DESC' ), true ) ? $order : 'DESC';
	}

	/**
	 * Sanitize and validate order by column
	 *
	 * @param string $orderBy The column to order by
	 * @param array  $allowedColumns Array of allowed column names
	 * @return string Valid column name or default
	 */
	protected function sanitizeOrderBy( $orderBy, array $allowedColumns ) {
		$orderBy = trim( $orderBy );

		return in_array( $orderBy, $allowedColumns, true ) ? $orderBy : ( isset( $allowedColumns[0] ) ? $allowedColumns[0] : 'id' );
	}

	/**
	 * Sanitize pagination parameters
	 *
	 * @param int $page The page number
	 * @param int $perPage Items per page
	 * @return array Sanitized pagination parameters
	 */
	protected function sanitizePagination( $page, $perPage ) {
		$page    = max( 1, (int) $page );
		$perPage = max( 0, min( 1000, (int) $perPage ) ); // Limit to prevent memory issues
		$offset  = ( $page - 1 ) * $perPage;

		return array(
			'page'    => $page,
			'perPage' => $perPage,
			'offset'  => $offset,
		);
	}

	/**
	 * Batch insert multiple records
	 *
	 * @param array $data Array of arrays, each containing data for one record
	 * @param array $format Array of formats for the data
	 * @return bool|WP_Error True on success, WP_Error on failure
	 */
	protected function batchInsert( array $data, array $format ) {
		if ( empty( $data ) ) {
			return new WP_Error( 400, __( 'Data cannot be empty for batch insert operation.', 'ninja-drive' ) );
		}

		$success_count = 0;
		$total_count   = count( $data );

		foreach ( $data as $record ) {
			if ( ! is_array( $record ) ) {
				continue;
			}

			$result = $this->insert( $record, $format );
			if ( ! is_wp_error( $result ) && $result ) {
				++$success_count;
			}
		}

		if ( $success_count === 0 ) {
			return new WP_Error( 500, __( 'Failed to insert any records in batch operation.', 'ninja-drive' ) );
		}

		return $success_count === $total_count;
	}
}
