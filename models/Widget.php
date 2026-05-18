<?php

namespace Pnpnd\ND\Models;

use function count;
use function gettype;
use function in_array;
use function is_array;
use function is_bool;
use function is_int;
use function is_object;
use function is_string;

use Pnpnd\ND\App\App;
use Pnpnd\ND\Utils\Helpers;
use Pnpnd\ND\Utils\Singleton;
use Pnpnd\ND\Widget as MainWidget;
use WP_Error;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class Widget extends BaseModel {

	use Singleton;

	private $breadcrumbs;

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

		$widget = $this->fetchWidget( $id );

		if ( is_wp_error( $widget ) ) {
			return $widget;
		}

		return $this->processData( $widget, $config );
	}

	public function getAll( array $config ) {
		$defaults = array(
			'type'    => 'all',
			'search'  => '',
			'status'  => 'all',
			'order'   => 'DESC',
			'orderBy' => 'updatedAt',
			'page'    => 1,
			'perPage' => 10,
		);

		$config = wp_parse_args( $config, $defaults );

		$allowedOrderBy = array( 'title', 'type', 'status', 'id', 'createdAt', 'updatedAt' );

		$orderBy    = $this->sanitizeOrderBy( $config['orderBy'], $allowedOrderBy );
		$order      = $this->sanitizeOrder( $config['order'] );
		$pagination = $this->sanitizePagination( $config['page'], $config['perPage'] );

		global $wpdb;

		$sqlParts = $wpdb->prepare( 'SELECT * FROM %i WHERE 1=1', $this->tableName );

		if ( $config['type'] !== 'all' ) {
			$sqlParts .= $wpdb->prepare( ' AND type = %s', $config['type'] );
		}

		if ( $config['status'] !== 'all' ) {
			$sqlParts .= $wpdb->prepare( ' AND status = %s', $config['status'] );
		}

		if ( ! empty( $config['search'] ) ) {
			$sqlParts .= $wpdb->prepare( ' AND title LIKE %s', '%' . $wpdb->esc_like( $config['search'] ) . '%' );
		}

		if ( $order === 'DESC' ) {
			$sqlParts .= $wpdb->prepare( ' ORDER BY %i DESC', $orderBy );
		} else {
			$sqlParts .= $wpdb->prepare( ' ORDER BY %i ASC', $orderBy );
		}

		if ( $pagination['perPage'] > 0 ) {
			$sqlParts .= $wpdb->prepare( ' LIMIT %d OFFSET %d', $pagination['perPage'], $pagination['offset'] );
		}

		$cacheKey = 'pnpnd_widgets_' . md5( $sqlParts );
		if ( false !== ( $cachedResults = wp_cache_get( $cacheKey, 'pnpnd_widgets' ) ) ) {
			return $cachedResults;
		}

        // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery
		$results = $wpdb->get_results( $sqlParts, ARRAY_A );

		if ( is_wp_error( $results ) ) {
			return $results;
		}

		$processData = array();
		foreach ( $results as $result ) {
			$processData[] = $this->processData( $result, array( 'dataProcess' => false ) );
		}

		wp_cache_set( $cacheKey, $processData, 'pnpnd_widgets' );

		return $processData;
	}

	public function add( array $data, $force = false ) {
		if ( ! in_array( $data['type'], MainWidget::getWidgetsList() ) ) {
			return new WP_Error( 'invalid_type', __( 'Invalid widget type.', 'ninja-drive' ), array( 'status' => 400 ) );
		}

		$now = current_time( 'mysql' );

		$is_update = ! empty( $data['id'] ) && is_numeric( $data['id'] );

		if ( $force && $is_update ) {
			$exists = $this->widgetExists( (int) $data['id'] );
			if ( ! $exists ) {
				$is_update = false;
			}
		}

		if ( ! empty( $data['data'] ) && is_array( $data['data'] ) ) {
			$data['data'] = $this->processAndSerializeWidgetData( $data['type'], $data['data'] );
		}

		if ( isset( $data['locations'] ) ) {
			unset( $data['locations'] );
		}

		if ( $is_update ) {
			$id = $data['id'];
			unset( $data['id'], $data['createdAt'] );

			$data['updatedAt'] = $now;

			$format       = $this->generateFormat( $data );
			$where_format = array( '%d' );

			$result = $this->update( $data, array( 'id' => $id ), $format, $where_format, ARRAY_A );

			if ( is_wp_error( $result ) ) {
				return $result;
			}

			return $this->processData( $result );
		} else {

			if ( empty( $data['type'] ) ) {
				return new WP_Error( 404, __( 'Widget type is required.', 'ninja-drive' ) );
			}

			if ( empty( $data['data'] ) ) {
				return new WP_Error( 404, __( 'Widget data is required.', 'ninja-drive' ) );
			}

			// Apply defaults
			$data['title']   ??= 'Untitled';
			$data['status']  ??= 'on';
			$data['createdAt'] = $now;
			$data['updatedAt'] = $now;

			$format = $this->generateFormat( $data );

			$inserted = $this->insert( $data, $format, ARRAY_A );

			if ( is_wp_error( $inserted ) ) {
				return $inserted;
			}

			return $this->processData( $inserted );
		}
	}

	public function getWidget( $id, $key = null ) {
		if ( empty( $id ) ) {
			return new WP_Error( 'invalid_id', __( 'Invalid ID provided.', 'ninja-drive' ), array( 'status' => 404 ) );
		}

		$widget = $this->fetchWidget( $id );

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

			foreach ( $keys as $innerKey ) {
				if ( ! is_array( $value ) || ! array_key_exists( $innerKey, $value ) ) {
					return null;
				}

				$value = $value[ $innerKey ];
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

		if ( $success_count === 0 ) {
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
			$cacheKey    = "pnpnd_widget_{$id}";
			$cacheWidget = wp_cache_get( $cacheKey, 'pnpnd_widgets' );
			if ( $cacheWidget !== false ) {
				$widgets[] = $cacheWidget;
				continue;
			}

            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
			$widget = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM %i WHERE id = %d', $this->tableName, $id ), ARRAY_A );
			if ( is_wp_error( $widget ) ) {
				return $widget;
			}
			if ( ! empty( $widget ) ) {
				$widgets[] = $widget;
				wp_cache_set( $cacheKey, $widget, 'pnpnd_widgets' );
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
			$widget['createdAt'] = current_time( 'mysql' );
			$widget['updatedAt'] = current_time( 'mysql' );

			$result = $this->insert( $widget, $this->generateFormat( $widget ) );

			if ( is_wp_error( $result ) ) {
				return $result;
			}

			++$results;
		}

		wp_cache_flush_group( 'pnpnd_widgets' );

		return $results;
	}

	public function totalCount( $config = array() ) {
		$defaultConfig = array(
			'type'   => 'all',
			'search' => '',
			'status' => 'all',
		);

		$config = wp_parse_args( $config, $defaultConfig );

		$type   = $config['type'];
		$search = $config['search'];
		$status = $config['status'];

		global $wpdb;

		$sql = $wpdb->prepare( 'SELECT COUNT(*) FROM %i WHERE 1=1', $this->tableName );

		if ( $type !== 'all' ) {
			$sql .= $wpdb->prepare( ' AND type = %s', $type );
		}

		if ( $status !== 'all' ) {
			$sql .= $wpdb->prepare( ' AND status = %s', $status );
		}

		if ( ! empty( $search ) ) {
			$search = '%' . $wpdb->esc_like( $search ) . '%';
			$sql   .= $wpdb->prepare( ' AND title LIKE %s', $search );
		}

		$cacheKey = 'pnpnd_widgets_count_' . md5( $sql );

		if ( false !== ( $cachedCount = wp_cache_get( $cacheKey, 'pnpnd_widgets' ) ) ) {
			return $cachedCount;
		}

        // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery
		$count = $wpdb->get_var( $sql );

		if ( $wpdb->last_error ) {
			$message = __( 'A database error occurred. Please try again.', 'ninja-drive' );
			if ( current_user_can( 'manage_options' ) ) {
				$message = sprintf(
					// translators: %1$s is the table name, %2$s is the database error message.
					esc_html__( 'A database error occurred while counting widgets in %1$s: %2$s', 'ninja-drive' ),
					esc_html( $this->tableName ),
					esc_html( $wpdb->last_error )
				);
			}

			return new WP_Error(
				400,
				$message
			);
		}

		wp_cache_set( $cacheKey, (int) $count, 'pnpnd_widgets' );

		return (int) $count;
	}

	// ========================= Utility methods =========================

	/**
	 * Check if a widget exists by ID.
	 *
	 * @param int $id The widget ID.
	 * @return bool True if exists, false otherwise.
	 */
	public function widgetExists( $id ) {
		return $this->exists( array( 'id' => (string) $id ) );
	}

	/**
	 * Update widget status.
	 *
	 * @param int    $id The widget ID.
	 * @param string $status The new status.
	 * @return bool|WP_Error True on success, WP_Error on failure.
	 */
	public function updateStatus( $id, $status ) {
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

	public function insertFile( $id, $fileKey ) {
		$widget = $this->getWidget( $id );

		if ( is_wp_error( $widget ) ) {
			return $widget;
		}

		if ( empty( $widget['data']['source']['fileKeys'] ) || ! is_array( $widget['data']['source']['fileKeys'] ) ) {
			$widget['data']['source']['fileKeys'] = array();
		}

		foreach ( $widget['data']['source']['fileKeys'] as $existingFile ) {
			if ( isset( $existingFile['fileKey'] ) && $existingFile['fileKey'] === $fileKey ) {
				return true;
			}
		}

		$widget['data']['source']['fileKeys'][] = array(
			'fileKey'      => $fileKey,
			'thumbnailKey' => '',
		);

		return $this->add( $widget );
	}

	public function import( $widgetsData ) {
		$importedCount = 0;

		foreach ( $widgetsData as $widgetData ) {
			$data          = array(
				'id'          => $widgetData['id'] ?? null,
				'title'       => $widgetData['title'] ?? 'Untitled',
				'type'        => $widgetData['type'] ?? '',
				'status'      => $widgetData['status'] ?? 'inactive',
				'integration' => $widgetData['integration'] ?? '',
				'locations'   => maybe_unserialize( $widgetData['locations'] ?? array() ) ?? array(),
				'data'        => maybe_unserialize( $widgetData['data'] ?? array() ) ?? array(),
			);
			$validatedData = $this->validateWidgetData( $data );
			if ( empty( $validatedData ) ) {
				continue;
			}
			$result = $this->add( $validatedData, true );

			if ( is_wp_error( $result ) ) {
				return $result;
			}

			++$importedCount;
		}

		return $importedCount;
	}

	// ========================= Private methods =========================

	private function processAndSerializeWidgetData( $type, $data ) {
		$processedData = array();

		foreach ( $data as $key => $value ) {
			if ( $key === 'source' ) {
				$fileKyeAndThumbnailKeys                  = $value['fileKeys'] ?? array();
				$processedData['source']['fileKeys']      = $fileKyeAndThumbnailKeys;
				$processedData['source']['privateFolder'] = filter_var( $value['privateFolder'] ?? false, FILTER_VALIDATE_BOOLEAN );
			} else {
				$processedData[ $key ] = $value;
			}
		}

		return maybe_serialize( $processedData );
	}

	private function validateWidgetData( $data ) {
		if ( empty( $data ) || ! is_array( $data ) || empty( $data['type'] ) || ! in_array( $data['type'], MainWidget::getWidgetsList() ) ) {
			return array();
		}

		$sanitizedData = array();
		if ( is_string( $data ) && is_serialized( $data ) ) {
			$data = maybe_unserialize( $data );
		}

		$defaultWidgetData = pnpndGetWidgetDefaultData( $data['type'] );

		if ( is_wp_error( $defaultWidgetData ) && empty( $defaultWidgetData ) ) {
			return array();
		}

		foreach ( $defaultWidgetData as $key => $value ) {
			if ( ! empty( $data[ $key ] ) ) {
				if ( is_array( $value ) ) {
					if ( is_array( $data[ $key ] ) ) {
						$sanitizedData[ $key ] = is_array( $data[ $key ] ) ? $data[ $key ] : $value;
					} else {
						$sanitizedData[ $key ] = $value;
					}
				} else {
					$sanitizedData[ $key ] = $data[ $key ];
				}
			} else {
				$sanitizedData[ $key ] = $value;
			}
		}

		return $sanitizedData;
	}

	private function generateFormat( $data ) {
		$format = array();

		foreach ( $data as $key => $value ) {
			$format[] = ( is_numeric( $value ) && (int) $value == $value ) ? '%d' : '%s';
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
	private function processData( $data, $config = array() ) {
		if ( empty( $data['type'] ) || empty( $data['data'] ) ) {
			return array();
		}

		$widgetType = $data['type'] ?? '';
		$id         = $data['id'] ?? 0;

		if ( empty( $id ) ) {
			return array();
		}

		$default = array(
			'validateSchema' => true,
			'returnType'     => 'array',
			'recursive'      => ! in_array( $widgetType, array( 'file-browser' ) ),
			'page'           => 1,
			'fileKey'        => null,
			'order'          => null,
			'orderBy'        => null,
			'search'         => null,
			'searchScope'    => 'folder',
			'from'           => 'cache',
			'password'       => null,
			'widgetType'     => $widgetType,
			'dataProcess'    => true,
			'widgetId'       => $id,
		);

		$queryConfig = wp_parse_args( $config, $default );

		$isAdmin = ( $queryConfig['isAdmin'] ?? false );

		$validateSchema = $queryConfig['validateSchema'] ?? true;
		$fileKey        = $queryConfig['fileKey'] ?? null;
		$order          = $queryConfig['order'] ?? null;
		$orderBy        = $queryConfig['orderBy'] ?? null;
		$password       = $queryConfig['password'] ?? null;

		$processedData = array();

		foreach ( $data as $key => $value ) {
			if ( is_serialized( $value ) ) {
				$value = unserialize( $value );
				if ( $key === 'data' && $queryConfig['dataProcess'] ) {
					if ( ! in_array( $data['type'], MainWidget::getWidgetsList() ) ) {
						$processedData[ $key ] = array();
						continue;
					}

					$permissions = $value['permissions'] ?? array();

					if ( ! empty( $permissions ) && ! current_user_can( 'manage_options' ) ) {
						$passwordProtect = $permissions['passwordProtect'] ?? '';

						if ( isset( $passwordProtect['enable'] ) && $passwordProtect['enable'] && isset( $passwordProtect['password'] ) && ! empty( $passwordProtect['password'] ) ) {
							$storedPassword = $passwordProtect['password'];

							$cookieKey = "pnpnd_token_{$id}";

							$secure_hash = hash( 'sha256', $storedPassword );

							if ( ( isset( $_COOKIE[ $cookieKey ] ) && sanitize_text_field( wp_unslash( $_COOKIE[ $cookieKey ] ) ) !== $secure_hash ) || empty( $_COOKIE[ $cookieKey ] ) ) {

								if ( empty( $password ) ) {
									$value['source']['files'] = new WP_Error( 'password_required', __( 'Password is required', 'ninja-drive' ), array( 'status' => 401 ) );
									$processedData[ $key ]    = $value;

									return $processedData;
								}

								$new_hash = hash( 'sha256', $password );
								if ( $secure_hash !== $new_hash ) {
									$value['source']['files'] = new WP_Error( 'password_incorrect', __( 'Password is incorrect', 'ninja-drive' ), array( 'status' => 401 ) );
									$processedData[ $key ]    = $value;
									Notices::getInstance()->add(
										array(
											'type'        => 'error',
											'title'       => __( 'Password Error', 'ninja-drive' ),
											'description' => sprintf(
												"A User '%s' tried to access #%d: %s widget with an incorrect password.",
												wp_get_current_user()->user_login ?? 'Guest',
												$id,
												$widgetType
											),
										)
									);

									return $processedData;
								} else {
									setcookie( $cookieKey, $secure_hash, time() + DAY_IN_SECONDS, COOKIEPATH, COOKIE_DOMAIN, is_ssl(), true );
								}
							}
						}
					}

					$sourceFileKeys = $value['source']['fileKeys'] ?? array();

					$fileKeys = $sourceFileKeys;

					if ( empty( $fileKeys ) ) {
						return new WP_Error( 'no_file_keys', __( 'No file keys specified in the widget data.', 'ninja-drive' ), array( 'status' => 400 ) );
					}

					if ( ! empty( $fileKey ) && $fileKey !== '/' && $fileKey !== '' && 'my-drive' !== $fileKey ) {
						$fileKeys = array_column( $fileKeys, 'fileKey' );

						if ( Helpers::validateFileKey( $fileKey, $fileKeys ) ) {
							$fileKeys                 = array(
								array(
									'fileKey'      => $fileKey,
									'thumbnailKey' => '',
								),
							);
							$queryConfig['recursive'] = true;
						} else {
							return new WP_Error( 'file_key_not_allowed', __( 'The specified file key is not allowed for this widget.', 'ninja-drive' ), array( 'status' => 403 ) );
						}
					}

					$advancedTab = $value['advanced'] ?? false;

					if ( $advancedTab ) {
						$queryConfig['perPage'] ??= $advancedTab['files']['perPage'] ?? 20;

						if ( isset( $advancedTab['fileBrowser'] ) && ! empty( $advancedTab['fileBrowser'] ) ) {
							$queryConfig['orderBy'] = $advancedTab['sort']['orderBy'] ?? 'name';
							$queryConfig['order']   = strtoupper( $advancedTab['sort']['order'] ?? 'ASC' );
							$queryConfig['from']    = 'cache';
						} else {
							if ( empty( $this->isWidgetAutoFetch( $id, $advancedTab ?? array() ) ) ) {
								$queryConfig['from'] = 'cache';
							}

							$queryConfig['orderBy'] = $orderBy ?? $advancedTab['sort']['orderBy'] ?? 'name';
							$queryConfig['order']   = strtoupper( $order ?? $advancedTab['sort']['order'] ?? 'ASC' );
						}
					}

					if ( ! empty( $value['filter'] ) ) {
						// Extensions filter
						$extensionsFilter   = $value['filter']['extension'] ?? array();
						$allowAllExtensions = $extensionsFilter['all'] ?? true;
						$include            = $extensionsFilter['include'] ?? array();
						$exclude            = $extensionsFilter['exclude'] ?? array();

						$extensions           = $allowAllExtensions ? $exclude : $include;
						$extensionsFilterType = $allowAllExtensions ? 'exclude' : 'include';

						$queryConfig['extensions']           = $extensions;
						$queryConfig['extensionsFilterType'] = $extensionsFilterType;

						$queryConfig['applyNameFilter'] = array();
						$queryConfig['names']           = '';
					}

					$app = App::getInstance();

					$filesData = $app->getFilesByKeys( $fileKeys, $queryConfig );

					if ( empty( $filesData ) && empty( $queryConfig['search'] ) ) {
						$queryConfig['from'] = 'server';
						$filesData           = $app->getFilesByKeys( $fileKeys, $queryConfig );
					}

					if ( is_wp_error( $filesData ) ) {
						$processedData['error'] = array(
							'code'    => $filesData->get_error_code(),
							'message' => $filesData->get_error_message(),
						);

						continue;
					}

					$files = $filesData['files'] ?? array();

					$perPage    = isset( $queryConfig['perPage'] ) ? (int) $queryConfig['perPage'] : 20;
					$totalCount = isset( $filesData['totalCount'] ) ? (int) $filesData['totalCount'] : count( $filesData['files'] ?? array() );

					$currentPage = isset( $queryConfig['page'] ) ? (int) $queryConfig['page'] : 1;
					$totalPages  = ceil( $totalCount / $perPage );
					$hasMore     = $currentPage < $totalPages;

					$value['source']['totalCount']  = $totalCount;
					$value['source']['perPage']     = $perPage;
					$value['source']['currentPage'] = $currentPage;
					$value['source']['totalPages']  = $totalPages;
					$value['source']['hasMore']     = $hasMore;

					if ( $widgetType === 'file-browser' ) {
						$breadcrumbKey = $sourceFileKeys[0]['fileKey'] ?? null;

						$breadcrumbsArgs = array(
							'rootFileKey'    => $breadcrumbKey,
							'rootFolderName' => 'Home',
						);

						$breadcrumbs = App::getInstance()->getBreadcrumbByKey( $fileKey, $breadcrumbsArgs );

						if ( is_array( $breadcrumbs ) && ! empty( $breadcrumbs ) && ! is_wp_error( $breadcrumbs ) ) {
							$value['source']['breadcrumbs'] = array_reverse( $breadcrumbs );
						}
					}

					$value['source']['files']    = $files;
					$value['source']['nextPage'] = $hasMore ? $currentPage + 1 : null;

					if ( $isAdmin ) {
						$selectedFiles = $this->getSelectedFiles( $fileKeys, $queryConfig );

						if ( ! is_wp_error( $selectedFiles ) ) {
							$value['source']['selectedFiles'] = $selectedFiles;
						}
					}
				}

				$processedData[ $key ] = $value;
			} else {
				$processedData[ $key ] = $key === 'id' ? intval( $value ) : $value;
			}
		}

		if ( $validateSchema || ! current_user_can( 'manage_options' ) ) {
			$type = $processedData['type'] ?? '';

			if ( empty( $type ) ) {
				return new WP_Error( 'invalid_type', __( 'Invalid widget type.', 'ninja-drive' ), array( 'status' => 400 ) );
			}

			$schema = pnpndGetWidgetTypesSchema( $type );

			if ( empty( $schema ) ) {
				return new WP_Error( 'unsupported_type', __( 'Unsupported widget type for schema validation.', 'ninja-drive' ), array( 'status' => 400 ) );
			}

			$processedData = $this->validateAndSanitize( $processedData, $schema );
		}

		return $processedData;
	}

	private function validateAndSanitize( array $data, array $schema ) {
		$result                                      = array();
		$schema['data']['source']['selectedFiles[]'] = $schema['data']['source']['files[]'] ?? 'null';

		foreach ( $schema as $key => $expectedType ) {
			$filteredKey = str_replace( '[]', '', $key );
			if ( ! isset( $data[ $filteredKey ] ) ) {
				continue;
			}

			$value = $data[ $filteredKey ];

			if ( is_array( $expectedType ) ) {
				if ( is_array( $value ) ) {
					if ( empty( $value ) ) {
						$result[ $filteredKey ] = array();
						continue;
					}

					$isNestedArray = strpos( $key, '[]' ) !== false;
					if ( $isNestedArray ) {
						foreach ( $value as $index => $item ) {
							$nested = $this->validateAndSanitize( $item, $expectedType );
							if ( ! empty( $nested ) ) {
								$result[ $filteredKey ][ $index ] = $nested;
							}
						}
					} else {
						$nested = $this->validateAndSanitize( $value, $expectedType );
						if ( ! empty( $nested ) ) {
							$result[ $filteredKey ] = $nested;
						}
					}
				}
			} elseif ( $this->isTypeMatch( $value, $expectedType ) ) {
					$result[ $filteredKey ] = $value;
			}
		}

		return $result;
	}

	private function isTypeMatch( $value, $type ) {
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
					if ( $value === null ) {
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

	private function fetchWidget( int $id ) {
		if ( empty( $id ) ) {
			return new WP_Error( 404, __( 'Widget ID is required.', 'ninja-drive' ) );
		}

		$cacheKey = "pnpnd_widget_{$id}";
		$cached   = wp_cache_get( $cacheKey, 'pnpnd_widgets' );
		if ( $cached !== false ) {
			return $cached;
		}

		global $wpdb;

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
		$result = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM %i WHERE id = %d', $this->tableName, $id ), ARRAY_A );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		if ( empty( $result ) ) {
			return new WP_Error( 404, __( 'Widget not found.', 'ninja-drive' ) );
		}
		wp_cache_set( $cacheKey, $result, 'pnpnd_widgets', HOUR_IN_SECONDS );

		return $result;
	}

	private function isWidgetAutoFetch( $id, $widgetConfig ) {
		if ( empty( $widgetConfig ) ) {
			return false;
		}

		if ( empty( $widgetConfig['autoFetch'] ) ) {
			return false;
		}

		$transientKey = "pnpnd_widget_auto_fetch_{$id}";
		$autoFetch    = get_transient( $transientKey );

		if ( empty( $autoFetch ) ) {
			$autoFetchInterval = $widgetConfig['autoFetchInterval'] ?? 60;
			set_transient( $transientKey, true, $autoFetchInterval );

			return true;
		}

		return false;
	}

	private function getSelectedFiles( $fileKeys, $args ) {
		$config = array(
			'recursive'  => false,
			'returnType' => 'array',
			'page'       => 1,
			'perPage'    => 1000,
			'from'       => 'cache',
		);

		$config = wp_parse_args( $config, $args );

		$app            = App::getInstance();
		$recursiveFiles = $app->getFilesByKeys( $fileKeys, $config );

		if ( is_wp_error( $recursiveFiles ) ) {
			return $recursiveFiles;
		}

		$selectedFiles = $recursiveFiles['files'] ?? array();

		return $selectedFiles;
	}

	/**
	 * Attach thumbnail data to files using thumbnail keys.
	 *
	 * @param array $files Files list (each item must contain fileKey)
	 * @param array $fileKeys Source file keys with optional thumbnailKey
	 *
	 * @return array
	 */
	private function attachThumbnailsToFiles( array $files, array $fileKeys ): array {
		$availableThumbnail = array_filter(
			$fileKeys,
			static fn ( $item ) => ! empty( $item['thumbnailKey'] )
		);

		if ( ! $availableThumbnail ) {
			return $files;
		}

		/**
		 * Map: thumbnailKey => originalFileKey
		 */
		$thumbnailToOriginal = array();
		$thumbnailKeys       = array();

		foreach ( $availableThumbnail as $item ) {
			$thumbnailKeys[]                              = $item['thumbnailKey'];
			$thumbnailToOriginal[ $item['thumbnailKey'] ] = $item['fileKey'];
		}

		$thumbnails = Files::getInstance()->getFileAttributesByKeys(
			$thumbnailKeys,
			array( 'fileKey', 'name', 'additionalData', 'extension' )
		);

		if ( is_wp_error( $thumbnails ) || ! $thumbnails ) {
			return $files;
		}

		/**
		 * Map: originalFileKey => thumbnail data
		 */
		$thumbnailMap = array();
		foreach ( $thumbnails as $thumbnail ) {
			$originalFileKey = $thumbnailToOriginal[ $thumbnail['fileKey'] ] ?? null;
			if ( $originalFileKey ) {
				$thumbnail['basename']  = $thumbnail['additionalData']['baseName'] ?? '';
				$thumbnail['thumbnail'] = pnpndGetUrl( 'thumbnail', $thumbnail['fileKey'], $thumbnail['basename'], 'lg', $thumbnail['extension'] );
				unset( $thumbnail['additionalData'] );
				$thumbnailMap[ $originalFileKey ] = $thumbnail;
			}
		}

		/**
		 * Attach thumbnails in a single pass
		 */
		foreach ( $files as &$file ) {
			if ( ! empty( $thumbnailMap[ $file['fileKey'] ] ) ) {
				$file['thumbnailData'] = $thumbnailMap[ $file['fileKey'] ];
			}
		}
		unset( $file ); // prevent reference leak

		return $files;
	}
}
