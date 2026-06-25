<?php

namespace Pnpnd\ND\Models;

use Pnpnd\ND\App\App;
use Pnpnd\ND\Utils\Helpers;
use Pnpnd\ND\Traits\Singleton;
use Pnpnd\ND\Widget as MainWidget;
use WP_Error;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class Widget extends Base_Model {

	use Singleton;

	private $breadcrumbs;

	private static $per_page     = 20;
	private static $max_per_page = 1000;

	public function __construct() {
		parent::__construct( 'pnpnd_widgets' );
	}

	/**
	 * Retrieve a widget by its ID.
	 *
	 * @param int $id The ID of the widget to retrieve.
	 * @return array|WP_Error Array containing widget data or WP_Error if the ID is invalid or an error occurs.
	 */
	public function get( $id, array $config = array() ) {
		if ( empty( $id ) ) {
			return new WP_Error( 404, __( 'Widget ID is required.', 'ninja-drive' ) );
		}

		$widget = $this->fetch_widget( $id );

		if ( is_wp_error( $widget ) ) {
			return $widget;
		}

		return $this->process_data( $widget, $config );
	}

	public function get_all( array $config ) {
		$defaults = array(
			'type'     => 'all',
			'search'   => '',
			'status'   => 'all',
			'order'    => 'DESC',
			'orderby'  => 'updated_at',
			'page'     => 1,
			'per_page' => self::$per_page,
		);

		$config = wp_parse_args( $config, $defaults );

		$allowed_orderby = array( 'title', 'type', 'status', 'id', 'created_at', 'updated_at' );

		$order_by   = $this->sanitize_order_by( $config['orderby'], $allowed_orderby );
		$order      = $this->sanitize_order( $config['order'] );
		$pagination = $this->sanitize_pagination( $config['page'], $config['per_page'] );

		global $wpdb;

		$sql_parts = $wpdb->prepare( 'SELECT * FROM %i WHERE 1=1', $this->table_name );

		if ( 'all' !== $config['type'] ) {
			$sql_parts .= $wpdb->prepare( ' AND type = %s', $config['type'] );
		}

		if ( 'all' !== $config['status'] ) {
			$sql_parts .= $wpdb->prepare( ' AND status = %s', $config['status'] );
			$sql_parts .= $wpdb->prepare( ' AND status = %s', $config['status'] );
		}

		if ( ! empty( $config['search'] ) ) {
			$sql_parts .= $wpdb->prepare( ' AND title LIKE %s', '%' . $wpdb->esc_like( $config['search'] ) . '%' );
		}

		if ( 'DESC' === $order ) {
			$sql_parts .= $wpdb->prepare( ' ORDER BY %i DESC', $order_by );
		} else {
			$sql_parts .= $wpdb->prepare( ' ORDER BY %i ASC', $order_by );
		}

		if ( $pagination['per_page'] > 0 ) {
			$sql_parts .= $wpdb->prepare( ' LIMIT %d OFFSET %d', $pagination['per_page'], $pagination['offset'] );
		}

		$cache_key      = 'pnpnd_widgets_' . md5( $sql_parts );
		$cached_results = wp_cache_get( $cache_key, 'pnpnd_widgets' );
		if ( false !== $cached_results ) {
			return $cached_results;
		}

		// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery
		$results = $wpdb->get_results( $sql_parts, ARRAY_A );

		if ( is_wp_error( $results ) ) {
			return $results;
		}

		$processed_data = array();
		foreach ( $results as $result ) {
			$processed_data[] = $this->process_data( $result, array( 'data_process' => false ) );
		}

		wp_cache_set( $cache_key, $processed_data, 'pnpnd_widgets' );

		return $processed_data;
	}

	public function add( array $data, $force = false ) {
		if ( ! in_array( $data['type'], MainWidget::get_widgets_list(), true ) ) {
			return new WP_Error( 'invalid_type', __( 'Invalid widget type.', 'ninja-drive' ), array( 'status' => 400 ) );
		}

		$now = current_time( 'mysql' );

		$is_update = ! empty( $data['id'] ) && is_numeric( $data['id'] );

		if ( $force && $is_update ) {
			$exists = $this->widget_exists( (int) $data['id'] );
			if ( ! $exists ) {
				$is_update = false;
			}
		}

		if ( ! empty( $data['data'] ) && is_array( $data['data'] ) ) {
			$data['data'] = $this->process_and_serialize_widget_data( $data['type'], $data['data'] );
		}

		if ( isset( $data['locations'] ) ) {
			unset( $data['locations'] );
		}

		if ( $is_update ) {
			$id = $data['id'];
			unset( $data['id'], $data['created_at'] );

			$data['updated_at'] = $now;

			$format       = $this->generate_format( $data );
			$where_format = array( '%d' );

			$result = $this->update( $data, array( 'id' => $id ), $format, $where_format, ARRAY_A );

			if ( is_wp_error( $result ) ) {
				return $result;
			}

			return $this->process_data( $result );
		} else {

			if ( empty( $data['type'] ) ) {
				return new WP_Error( 404, __( 'Widget type is required.', 'ninja-drive' ) );
			}

			if ( empty( $data['data'] ) ) {
				return new WP_Error( 404, __( 'Widget data is required.', 'ninja-drive' ) );
			}

			// Apply defaults
			$data['title']    ??= 'Untitled';
			$data['status']   ??= 'on';
			$data['created_at'] = $now;
			$data['updated_at'] = $now;

			$format = $this->generate_format( $data );

			$inserted = $this->insert( $data, $format, ARRAY_A );

			if ( is_wp_error( $inserted ) ) {
				return $inserted;
			}

			return $this->process_data( $inserted );
		}
	}

	public function get_widget( $id, $key = null ) {
		if ( empty( $id ) ) {
			return new WP_Error( 'invalid_id', __( 'Invalid ID provided.', 'ninja-drive' ), array( 'status' => 404 ) );
		}

		$widget = $this->fetch_widget( $id );

		if ( is_wp_error( $widget ) ) {
			return $widget;
		}

		if ( isset( $widget['data'] ) && is_serialized( $widget['data'] ) ) {
			$widget['data'] = maybe_unserialize( $widget['data'] );
		}

		if ( empty( $key ) ) {
			return $widget;
		}

		if ( strpos( $key, '.' ) !== false ) {
			$keys  = explode( '.', $key );
			$value = $widget;

			foreach ( $keys as $inner_key ) {
				if ( ! is_array( $value ) || ! array_key_exists( $inner_key, $value ) ) {
					return null;
				}

				$value = $value[ $inner_key ];
			}

			return $value;
		}

		return $widget[ $key ] ?? null;
	}

	/**
	 * Delete widgets from the database.
	 *
	 * @param int|array $ids The ID or IDs of the widgets to delete.
	 * @return int|WP_Error The number of rows affected or a WP_Error object if an error occurs.
	 */
	public function remove( $ids ) {
		if ( ! is_array( $ids ) ) {
			$ids = array( $ids );
		}

		if ( empty( $ids ) ) {
			return 0;
		}

		foreach ( $ids as $id ) {
			if ( ! is_numeric( $id ) ) {
				return new WP_Error( 404, __( 'Invalid ID provided.', 'ninja-drive' ) );
			}
		}

		$success_count = 0;
		$total_count   = count( $ids );

		foreach ( $ids as $id ) {
			$result = $this->delete( array( 'id' => (int) $id ), array( '%d' ) );
			if ( ! is_wp_error( $result ) && $result ) {
				++$success_count;
			}
		}

		if ( 0 === $success_count ) {
			return new WP_Error( 500, __( 'Failed to delete any widgets.', 'ninja-drive' ) );
		}

		return $success_count;
	}

	public function duplicate( $ids ) {
		global $wpdb;
		if ( ! is_array( $ids ) ) {
			$ids = array( $ids );
		}

		if ( empty( $ids ) ) {
			return new WP_Error( 404, __( 'Invalid ID provided.', 'ninja-drive' ) );
		}

		foreach ( $ids as $id ) {
			if ( ! is_numeric( $id ) ) {
				return new WP_Error( 404, __( 'Invalid ID provided.', 'ninja-drive' ) );
			}
		}

		$widgets = array();
		foreach ( $ids as $id ) {
			$cache_key    = "pnpnd_widget_{$id}";
			$cache_widget = wp_cache_get( $cache_key, 'pnpnd_widgets' );
			if ( false !== $cache_widget ) {
				$widgets[] = $cache_widget;
				continue;
			}

			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
			$widget = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM %i WHERE id = %d', $this->table_name, $id ), ARRAY_A );
			if ( is_wp_error( $widget ) ) {
				return $widget;
			}
			if ( ! empty( $widget ) ) {
				$widgets[] = $widget;
				wp_cache_set( $cache_key, $widget, 'pnpnd_widgets' );
			}
		}

		if ( empty( $widgets ) ) {
			return new WP_Error( 404, __( 'Invalid ID provided.', 'ninja-drive' ) );
		}

		$results = 0;
		foreach ( $widgets as $widget ) {
			$widget['title'] .= ' - Copy';
			$widget['status'] = 'off';
			unset( $widget['id'] );
			$widget['created_at'] = current_time( 'mysql' );
			$widget['updated_at'] = current_time( 'mysql' );

			$result = $this->insert( $widget, $this->generate_format( $widget ) );

			if ( is_wp_error( $result ) ) {
				return $result;
			}

			++$results;
		}

		wp_cache_flush_group( 'pnpnd_widgets' );

		return $results;
	}

	public function total_count( $config = array() ) {
		$default_config = array(
			'type'   => 'all',
			'search' => '',
			'status' => 'all',
		);

		$config = wp_parse_args( $config, $default_config );

		$type   = $config['type'];
		$search = $config['search'];
		$status = $config['status'];

		global $wpdb;

		$sql = $wpdb->prepare( 'SELECT COUNT(*) FROM %i WHERE 1=1', $this->table_name );

		if ( 'all' !== $type ) {
			$sql .= $wpdb->prepare( ' AND type = %s', $type );
		}

		if ( 'all' !== $status ) {
			$sql .= $wpdb->prepare( ' AND status = %s', $status );
		}

		if ( ! empty( $search ) ) {
			$search = '%' . $wpdb->esc_like( $search ) . '%';
			$sql   .= $wpdb->prepare( ' AND title LIKE %s', $search );
		}

		$cache_key    = 'pnpnd_widgets_count_' . md5( $sql );
		$cached_count = wp_cache_get( $cache_key, 'pnpnd_widgets' );

		if ( false !== $cached_count ) {
			return $cached_count;
		}

		// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery
		$count = $wpdb->get_var( $sql );

		if ( $wpdb->last_error ) {
			$message = __( 'A database error occurred. Please try again.', 'ninja-drive' );
			if ( current_user_can( 'manage_options' ) ) {
				$message = sprintf(
				// translators: %1$s is the table name, %2$s is the database error message.
					esc_html__( 'A database error occurred while counting widgets in %1$s: %2$s', 'ninja-drive' ),
					esc_html( $this->table_name ),
					esc_html( $wpdb->last_error )
				);
			}

			return new WP_Error(
				400,
				$message
			);
		}

		wp_cache_set( $cache_key, (int) $count, 'pnpnd_widgets' );

		return (int) $count;
	}

	// ========================= Utility methods =========================

	/**
	 * Check if a widget exists by ID.
	 *
	 * @param int $id The widget ID.
	 * @return bool True if exists, false otherwise.
	 */
	public function widget_exists( $id ) {
		return $this->exists( array( 'id' => (string) $id ) );
	}

	/**
	 * Update widget status.
	 *
	 * @param int    $id The widget ID.
	 * @param string $status The new status.
	 * @return bool|WP_Error True on success, WP_Error on failure.
	 */
	public function update_status( $id, $status ) {
		return $this->update(
			array(
				'status'     => $status,
				'updated_at' => current_time( 'mysql' ),
			),
			array( 'id' => (string) $id ),
			array( '%s', '%s' ),
			array( '%d' )
		);
	}

	public function insert_file( $id, $file_key ) {
		$widget = $this->get_widget( $id );

		if ( is_wp_error( $widget ) ) {
			return $widget;
		}

		if ( empty( $widget['data']['source']['file_keys'] ) || ! is_array( $widget['data']['source']['file_keys'] ) ) {
			$widget['data']['source']['file_keys'] = array();
		}

		foreach ( $widget['data']['source']['file_keys'] as $existing_file ) {
			if ( isset( $existing_file['file_key'] ) && $existing_file['file_key'] === $file_key ) {
				return true;
			}
		}

		$widget['data']['source']['file_keys'][] = array(
			'file_key'      => $file_key,
			'thumbnail_key' => '',
		);

		return $this->add( $widget );
	}

	public function import( $widgets_data ) {
		$imported_count = 0;

		foreach ( $widgets_data as $widget_data ) {
			$data           = array(
				'id'          => $widget_data['id'] ?? null,
				'title'       => $widget_data['title'] ?? 'Untitled',
				'type'        => $widget_data['type'] ?? '',
				'status'      => $widget_data['status'] ?? 'inactive',
				'integration' => $widget_data['integration'] ?? '',
				'locations'   => maybe_unserialize( $widget_data['locations'] ?? array() ) ?? array(),
				'data'        => maybe_unserialize( $widget_data['data'] ?? array() ) ?? array(),
			);
			$validated_data = $this->validate_widget_data( $data );
			if ( empty( $validated_data ) ) {
				continue;
			}
			$result = $this->add( $validated_data, true );

			if ( is_wp_error( $result ) ) {
				return $result;
			}

			++$imported_count;
		}

		return $imported_count;
	}

	// ========================= Private methods =========================

	private function process_and_serialize_widget_data( $type, $data ) {
		$processed_data = array();

		foreach ( $data as $key => $value ) {
			if ( 'source' === $key ) {
				$file_key_and_thumbnail_keys                = $value['file_keys'] ?? array();
				$processed_data['source']['file_keys']      = $file_key_and_thumbnail_keys;
				$processed_data['source']['private_folder'] = filter_var( $value['private_folder'] ?? false, FILTER_VALIDATE_BOOLEAN );
			} else {
				$processed_data[ $key ] = $value;
			}
		}

		return maybe_serialize( $processed_data );
	}

	private function validate_widget_data( $data ) {
		if ( empty( $data ) || ! is_array( $data ) || empty( $data['type'] ) || ! in_array( $data['type'], MainWidget::get_widgets_list(), true ) ) {
			return array();
		}

		$sanitized_data = array();
		if ( is_string( $data ) && is_serialized( $data ) ) {
			$data = maybe_unserialize( $data );
		}

		$default_widget_data = pnpnd_build_widget_data( $data['type'] );

		if ( is_wp_error( $default_widget_data ) && empty( $default_widget_data ) ) {
			return array();
		}

		foreach ( $default_widget_data as $key => $value ) {
			if ( ! empty( $data[ $key ] ) ) {
				if ( is_array( $value ) ) {
					if ( is_array( $data[ $key ] ) ) {
						$sanitized_data[ $key ] = is_array( $data[ $key ] ) ? $data[ $key ] : $value;
					} else {
						$sanitized_data[ $key ] = $value;
					}
				} else {
					$sanitized_data[ $key ] = $data[ $key ];
				}
			} else {
				$sanitized_data[ $key ] = $value;
			}
		}

		return $sanitized_data;
	}

	private function generate_format( $data ) {
		$format = array();

		foreach ( $data as $key => $value ) {
			$format[] = ( is_numeric( $value ) && (int) $value === $value ) ? '%d' : '%s';
		}

		return $format;
	}

	/**
	 * Processes the input data for a widget, handling serialization, file retrieval,
	 * and optional schema validation and sanitization.
	 *
	 * @param array $data The data array containing 'type' and serialized 'data'.
	 * @param array $config Optional configuration for processing, including:
	 *
	 * @return array|WP_Error Processed and optionally validated data.
	 */
	private function process_data( $data, $config = array() ) {
		if ( empty( $data['type'] ) || empty( $data['data'] ) ) {
			return array();
		}

		$widget_type = $data['type'] ?? '';
		$id          = $data['id'] ?? 0;

		if ( empty( $id ) ) {
			return array();
		}

		$default = array(
			'validate_schema' => true,
			'return_type'     => 'array',
			'recursive'       => ! in_array( $widget_type, array( 'file_browser' ), true ),
			'page'            => 1,
			'per_page'        => null,
			'file_key'        => null,
			'order'           => null,
			'order_by'        => null,
			'search'          => null,
			'search_scope'    => 'folder',
			'from'            => 'cache',
			'password'        => null,
			'widget_type'     => $widget_type,
			'data_process'    => true,
			'widget_id'       => $id,
		);

		$query_config = wp_parse_args( $config, $default );

		$is_admin = ( $query_config['is_admin'] ?? false );

		$validate_schema = $query_config['validate_schema'] ?? true;
		$file_key        = $query_config['file_key'] ?? null;
		$order           = $query_config['order'] ?? null;
		$order_by        = $query_config['order_by'] ?? null;
		$per_page        = $query_config['per_page'] ?? null;
		$password        = $query_config['password'] ?? null;

		$processed_data = array();

		foreach ( $data as $key => $value ) {
			if ( is_serialized( $value ) ) {
				$value = unserialize( $value );
				if ( 'data' === $key && $query_config['data_process'] ) {
					if ( ! in_array( $data['type'], MainWidget::get_widgets_list(), true ) ) {
						$processed_data[ $key ] = array();
						continue;
					}

					$password_protect = $value['configuration']['security']['password_protect'] ?? array();

					$is_password_bypassed = current_user_can( 'manage_options' );

					if ( ! empty( $password_protect ) && ! $is_password_bypassed ) {

						if ( isset( $password_protect['enable'] ) && $password_protect['enable'] && isset( $password_protect['password'] ) && ! empty( $password_protect['password'] ) ) {
							$stored_password = $password_protect['password'];

							$cookie_key = "pnpnd_token_{$id}";

							$secure_hash = hash( 'sha256', $stored_password );

							if ( ( isset( $_COOKIE[ $cookie_key ] ) && sanitize_text_field( wp_unslash( $_COOKIE[ $cookie_key ] ) ) !== $secure_hash ) || empty( $_COOKIE[ $cookie_key ] ) ) {

								if ( empty( $password ) ) {

									$processed_data['error_type']    = 'password-protected';
									$processed_data['error_message'] = __( 'This widget is password protected. Please enter the password to view the content.', 'ninja-drive' );
									unset( $value['data'] );

									return $processed_data;
								}

								$new_hash = hash( 'sha256', $password );
								if ( $secure_hash !== $new_hash ) {
									$processed_data['error_type']    = 'password_incorrect';
									$processed_data['error_message'] = __( 'Password is incorrect', 'ninja-drive' );
									unset( $value['data'] );
									pnpnd_notify(
										\Pnpnd\ND\Notice::TYPE_ERROR,
										__( 'Password Error', 'ninja-drive' ),
										sprintf(
											"A User '%s' tried to access #%d: %s widget with an incorrect password.",
											wp_get_current_user()->user_login ?? 'Guest',
											$id,
											$widget_type
										)
									);

									return $processed_data;
								} else {
									setcookie( $cookie_key, $secure_hash, time() + DAY_IN_SECONDS, COOKIEPATH, COOKIE_DOMAIN, is_ssl(), true );
								}
							}
						}
					}

					$source_file_keys = $value['source']['file_keys'] ?? array();

					$file_keys = $source_file_keys;

					if ( empty( $file_keys ) ) {
						return new WP_Error( 'no_file_keys', __( 'No file keys specified in the widget data.', 'ninja-drive' ), array( 'status' => 400 ) );
					}

						if ( ! empty( $file_key ) && '/' !== $file_key && '' !== $file_key && 'my-drive' !== $file_key ) {
							$file_keys = array_column( $file_keys, 'file_key' );

							if ( Helpers::validate_file_key( $file_key, $file_keys ) ) {
								$file_keys                 = array(
									array(
										'file_key'      => $file_key,
										'thumbnail_key' => '',
									),
								);
								$query_config['recursive'] = true;
							} else {
								return new WP_Error( 'file_key_not_allowed', __( 'The specified file key is not allowed for this widget.', 'ninja-drive' ), array( 'status' => 403 ) );
							}
						}
					
					$sort = $value['configuration']['advanced']['sort'] ?? false;

					if ( $sort ) {
						$setting_order    = strtoupper( $sort['order'] ?? 'DESC' );
						$setting_order_by = $sort['order_by'] ?? 'name';

						$query_config['order']    = $order ?? $setting_order;
						$query_config['order_by'] = $order_by ?? $setting_order_by;
					}

					$auto_fetch = $value['configuration']['advanced']['auto_fetch'] ?? false;
					if ( $auto_fetch['status'] ?? false ) {
						$query_config['from'] = $query_config['from'] ?? 'cache';
					} else {
						$query_config['from'] = 'cache';
					}

					$filter_config = $value['configuration']['filter'] ?? array();

					if ( ! empty( $filter_config ) ) {
						// Extensions filter
						$extensions_filter    = $filter_config['extension'] ?? array();
						$allow_all_extensions = $extensions_filter['all'] ?? true;
						$include              = $extensions_filter['include'] ?? array();
						$ignore               = $extensions_filter['ignore'] ?? array();

						$extensions             = $allow_all_extensions ? $ignore : $include;
						$extensions_filter_type = $allow_all_extensions ? 'ignore' : 'include';

						$query_config['extensions']             = $extensions;
						$query_config['extensions_filter_type'] = $extensions_filter_type;

					}

					$per_page = $value['style']['files']['per_page'] ?? self::$per_page;

					$query_config['per_page'] = $per_page ?? $per_page;

					$app = App::get_instance();

					$files_data = $app->get_files_by_keys( $file_keys, $query_config );

					if ( empty( $files_data ) && empty( $query_config['search'] ) ) {
						$query_config['from'] = 'server';
						$files_data           = $app->get_files_by_keys( $file_keys, $query_config );
					}

					if ( is_wp_error( $files_data ) ) {
						$processed_data['error'] = array(
							'code'    => $files_data->get_error_code(),
							'message' => $files_data->get_error_message(),
						);

						continue;
					}

					$files = $files_data['files'] ?? array();

					$per_page    = isset( $query_config['per_page'] ) ? (int) $query_config['per_page'] : self::$per_page;
					$total_count = isset( $files_data['total_count'] ) ? (int) $files_data['total_count'] : count( $files_data['files'] ?? array() );

					$current_page = isset( $query_config['page'] ) ? (int) $query_config['page'] : 1;
					$total_pages  = ceil( $total_count / $per_page );
					$has_more     = $current_page < $total_pages;

					$value['source']['total_count']  = $total_count;
					$value['source']['per_page']     = $per_page;
					$value['source']['current_page'] = $current_page;
					$value['source']['total_pages']  = $total_pages;
					$value['source']['has_more']     = $has_more;

						if ( 'file_browser' === $widget_type ) {
							$breadcrumb_key = $source_file_keys[0]['file_key'] ?? null;

							$breadcrumbs_args = array(
								'root_file_key'    => $breadcrumb_key,
								'root_folder_name' => 'Home',
							);

							$breadcrumbs = App::get_instance()->get_breadcrumb_by_key( $file_key, $breadcrumbs_args );

							if ( is_array( $breadcrumbs ) && ! empty( $breadcrumbs ) && ! is_wp_error( $breadcrumbs ) ) {
								$value['source']['breadcrumbs'] = array_reverse( $breadcrumbs );
							}
						}
					
					$value['source']['files']     = $files;
					$value['source']['next_page'] = $has_more ? $current_page + 1 : null;

					if ( $is_admin ) {
						$selected_files = $this->get_selected_files( $file_keys, $query_config );

						if ( ! is_wp_error( $selected_files ) ) {
							if ( 'media_player' === $widget_type ) {
								$selected_files = $this->attach_thumbnails_to_files( $selected_files, $source_file_keys );
							}
							$value['source']['selected_files'] = $selected_files;
						}
					}
				}

				$processed_data[ $key ] = $value;
			} else {
				$processed_data[ $key ] = 'id' === $key ? intval( $value ) : $value;
			}
		}

		$is_widget_manager = current_user_can( 'manage_options' );

		if ( $validate_schema || ! $is_widget_manager ) {
			$type = $processed_data['type'] ?? '';

			if ( empty( $type ) ) {
				return new WP_Error( 'invalid_type', __( 'Invalid widget type.', 'ninja-drive' ), array( 'status' => 400 ) );
			}

			$schema = pnpnd_get_widget_types_schema( $type );

			if ( empty( $schema ) ) {
				return new WP_Error( 'unsupported_type', __( 'Unsupported widget type for schema validation.', 'ninja-drive' ), array( 'status' => 400 ) );
			}

			$processed_data = $this->validate_and_sanitize( $processed_data, $schema );
		}

		return $processed_data;
	}

	private function validate_and_sanitize( array $data, array $schema ) {
		$result                                       = array();
		$schema['data']['source']['selected_files[]'] = $schema['data']['source']['files[]'] ?? 'null';

		foreach ( $schema as $key => $expected_type ) {
			$filtered_key = str_replace( '[]', '', $key );
			if ( ! isset( $data[ $filtered_key ] ) ) {
				continue;
			}

			$value = $data[ $filtered_key ];

			if ( is_array( $expected_type ) ) {
				if ( is_array( $value ) ) {
					if ( empty( $value ) ) {
						$result[ $filtered_key ] = array();
						continue;
					}

					$is_nested_array = strpos( $key, '[]' ) !== false;
					if ( $is_nested_array ) {
						foreach ( $value as $index => $item ) {
							$nested = $this->validate_and_sanitize( $item, $expected_type );
							if ( ! empty( $nested ) ) {
								$result[ $filtered_key ][ $index ] = $nested;
							}
						}
					} else {
						$nested = $this->validate_and_sanitize( $value, $expected_type );
						if ( ! empty( $nested ) ) {
							$result[ $filtered_key ] = $nested;
						}
					}
				}
			} elseif ( $this->is_type_match( $value, $expected_type ) ) {
				$result[ $filtered_key ] = $value;
			}
		}

		return $result;
	}

	private function is_type_match( $value, $type ) {
		$types = explode( '|', $type );

		foreach ( $types as $t ) {
			switch ( $t ) {
				case 'integer':
					if ( is_int( $value ) || is_numeric( $value ) ) {
						return true;
					}
					break;
				case 'string':
					if ( is_string( $value ) ) {
						return true;
					}
					break;
				case 'boolean':
					if ( is_bool( $value ) ) {
						return true;
					}
					break;
				case 'array':
					if ( is_array( $value ) ) {
						return true;
					}
					break;
				case 'object':
					if ( is_object( $value ) ) {
						return true;
					}
					break;
				case 'NULL':
					if ( null === $value ) {
						return true;
					}
					break;
				case 'any':
					return true;
				default:
					if ( gettype( $value ) === $t ) {
						return true;
					}
			}
		}

		return false;
	}

	private function fetch_widget( int $id ) {
		if ( empty( $id ) ) {
			return new WP_Error( 404, __( 'Widget ID is required.', 'ninja-drive' ) );
		}

		$cache_key = "pnpnd_widget_{$id}";
		$cached    = wp_cache_get( $cache_key, 'pnpnd_widgets' );
		if ( false !== $cached ) {
			return $cached;
		}

		global $wpdb;

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
		$result = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM %i WHERE id = %d', $this->table_name, $id ), ARRAY_A );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		if ( empty( $result ) ) {
			return new WP_Error( 404, __( 'Widget not found.', 'ninja-drive' ) );
		}
		wp_cache_set( $cache_key, $result, 'pnpnd_widgets', HOUR_IN_SECONDS );

		return $result;
	}

	private function is_widget_auto_fetch( $id, $widget_config ) {
		if ( empty( $widget_config ) ) {
			return false;
		}

		if ( empty( $widget_config['auto_fetch'] ) ) {
			return false;
		}

		$transient_key = "pnpnd_widget_auto_fetch_{$id}";
		$auto_fetch    = get_transient( $transient_key );

		if ( empty( $auto_fetch ) ) {
			$auto_fetch_interval = $widget_config['auto_fetch_interval'] ?? 60;
			set_transient( $transient_key, true, $auto_fetch_interval );

			return true;
		}

		return false;
	}

	private function get_selected_files( $file_keys, $args ) {
		$config = array(
			'recursive'   => false,
			'return_type' => 'array',
			'page'        => 1,
			'per_page'    => self::$max_per_page,
			'from'        => 'cache',
		);

		$config = wp_parse_args( $config, $args );

		$app             = App::get_instance();
		$recursive_files = $app->get_files_by_keys( $file_keys, $config );

		if ( is_wp_error( $recursive_files ) ) {
			return $recursive_files;
		}

		$selected_files = $recursive_files['files'] ?? array();

		return $selected_files;
	}

	/**
	 * Attach thumbnail data to files using thumbnail keys.
	 *
	 * @param array $files Files list (each item must contain file_key)
	 * @param array $file_keys Source file keys with optional thumbnail_key
	 *
	 * @return array
	 */
	private function attach_thumbnails_to_files( array $files, array $file_keys ): array {
		$available_thumbnail = array_filter(
			$file_keys,
			static fn ( $item ) => ! empty( $item['thumbnail_key'] )
		);

		if ( ! $available_thumbnail ) {
			return $files;
		}

		/**
		 * Map: thumbnail_key => original_file_key
		 */
		$thumbnail_to_original = array();
		$thumbnail_keys        = array();

		foreach ( $available_thumbnail as $item ) {
			$thumbnail_keys[]                                = $item['thumbnail_key'];
			$thumbnail_to_original[ $item['thumbnail_key'] ] = $item['file_key'];
		}

		$thumbnails = Files::get_instance()->get_file_attributes_by_keys(
			$thumbnail_keys,
			array( 'file_key', 'name', 'additional_data', 'extension' )
		);

		if ( is_wp_error( $thumbnails ) || ! $thumbnails ) {
			return $files;
		}

		/**
		 * Map: original_file_key => thumbnail data
		 */
		$thumbnail_map = array();
		foreach ( $thumbnails as $thumbnail ) {
			$original_file_key = $thumbnail_to_original[ $thumbnail['file_key'] ] ?? null;
			if ( $original_file_key ) {
				$thumbnail['base_name'] = $thumbnail['additional_data']['base_name'] ?? '';
				$thumbnail['thumbnail'] = pnpnd_get_url( 'thumbnail', $thumbnail['file_key'], $thumbnail['base_name'], 'lg', $thumbnail['extension'] );
				unset( $thumbnail['additional_data'] );
				$thumbnail_map[ $original_file_key ] = $thumbnail;
			}
		}

		/**
		 * Attach thumbnails in a single pass
		 */
		foreach ( $files as &$file ) {
			if ( ! empty( $thumbnail_map[ $file['file_key'] ] ) ) {
				$file['thumbnail_data'] = $thumbnail_map[ $file['file_key'] ];
			}
		}
		unset( $file ); // prevent reference leak

		return $files;
	}
}
