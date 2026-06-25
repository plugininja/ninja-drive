<?php

namespace Pnpnd\ND\Updates;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

/**
 * Discovers and applies Ninja Drive DB migrations.
 *
 * Migrations live as files in `PNPND_UPDATES` matching the pattern
 * `{semver}-{slug}.php`, each defining a class that extends
 * `Abstract_Migration`.
 *
 * The runner is idempotent: applied migrations are recorded in the
 * `pnpnd_migrations` audit table and skipped on subsequent runs.
 *
 * A 5-minute transient lock prevents concurrent runs (e.g. two requests
 * racing during a deploy).
 */
class Migration_Runner {

	private const LOCK_KEY     = 'pnpnd_migration_lock';
	private const LOCK_TTL     = 5 * MINUTE_IN_SECONDS;
	private const APPLIED_OPT  = 'pnpnd_db_version';
	private const MIGRATIONS_T = 'pnpnd_migrations';

	/**
	 * Discover + apply all pending migrations in version order.
	 *
	 * @return array{
	 *     applied: string[],
	 *     skipped: string[],
	 *     errors:  array{version: string, message: string}[]
	 * }
	 */
	public static function run(): array {
		$result = array(
			'applied' => array(),
			'skipped' => array(),
			'errors'  => array(),
		);

		if ( ! self::acquire_lock() ) {
			Migration_Logger::log( 'Skipped: lock already held', 'warning' );
			$result['skipped'][] = 'lock_held';
			return $result;
		}

		try {
			try {
				self::ensure_schema();
			} catch ( \Throwable $e ) {
				$result['errors'][] = array(
					'version' => 'schema',
					'message' => $e->getMessage(),
				);
				Migration_Logger::log(
					sprintf( 'Schema sync failed: %s', $e->getMessage() ),
					'error'
				);
				return $result;
			}

			$applied    = self::applied_versions();
			$migrations = self::discover();

			if ( empty( $migrations ) ) {
				Migration_Logger::log( 'No migrations discovered' );
			}

			foreach ( $migrations as $migration ) {
				$version = $migration->version();

				if ( in_array( $version, $applied, true ) ) {
					$result['skipped'][] = $version;
					continue;
				}

				$start = microtime( true );
				try {
					$migration->before();

					$ok = (bool) $migration->up();
					if ( ! $ok ) {
						throw new \RuntimeException( 'up() returned false' );
					}

					$migration->after();
				} catch ( \Throwable $e ) {
					$result['errors'][] = array(
						'version' => $version,
						'message' => $e->getMessage(),
					);
					Migration_Logger::log(
						sprintf( 'Migration %s failed: %s', $version, $e->getMessage() ),
						'error'
					);
					break;
				}

				$duration_ms = (int) round( ( microtime( true ) - $start ) * 1000 );
				self::record( $migration, $duration_ms );
				update_option( self::APPLIED_OPT, $version );

				$result['applied'][] = $version;
				Migration_Logger::log(
					sprintf( 'Applied %s in %dms — %s', $version, $duration_ms, $migration->description() )
				);
			}
		} finally {
			self::release_lock();
		}

		return $result;
	}

	/**
	 * Rollback a single applied migration.
	 *
	 * Only works for migrations that override `down()` and return true.
	 *
	 * @param string $version Migration version to revert.
	 *
	 * @return bool True on successful rollback, false otherwise.
	 */
	public static function rollback( string $version ): bool {
		if ( '' === $version ) {
			return false;
		}

		try {
			self::ensure_schema();
		} catch ( \Throwable $e ) {
			Migration_Logger::log(
				sprintf( 'Schema sync failed during rollback: %s', $e->getMessage() ),
				'error'
			);
			return false;
		}

		$migrations = self::discover();
		foreach ( $migrations as $migration ) {
			if ( $migration->version() !== $version ) {
				continue;
			}

			try {
				$migration->before();
				$ok = (bool) $migration->down();
				$migration->after();

				if ( ! $ok ) {
					return false;
				}
			} catch ( \Throwable $e ) {
				Migration_Logger::log(
					sprintf( 'Rollback of %s failed: %s', $version, $e->getMessage() ),
					'error'
				);
				return false;
			}

			self::mark_reverted( $version );
			update_option( self::APPLIED_OPT, self::previous_applied_version() );

			Migration_Logger::log( sprintf( 'Rolled back %s', $version ) );
			return true;
		}

		return false;
	}

	/**
	 * Build a status snapshot for the admin UI / REST.
	 *
	 * @return array{
	 *     applied: array<int, array{version: string, description: string, applied_at: string, duration_ms: int|null, status: string}>,
	 *     pending: array<int, array{version: string, description: string}>
	 * }
	 */
	public static function status(): array {
		global $wpdb;

		try {
			self::ensure_schema();
		} catch ( \Throwable $e ) {
			Migration_Logger::log(
				sprintf( 'Schema sync failed during status: %s', $e->getMessage() ),
				'error'
			);
			return array(
				'applied' => array(),
				'pending' => array(),
				'error'   => $e->getMessage(),
			);
		}

		$audit_table = self::migrations_table();
		$rows        = array();
		$pending     = array();

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$rows = $wpdb->get_results( $wpdb->prepare( "SELECT version, description, applied_at, duration_ms, status FROM %i ORDER BY version ASC", $audit_table ), ARRAY_A );
		
		if ( ! is_array( $rows ) ) {
			$rows = array();
		}

		$applied_map = array();
		foreach ( $rows as $row ) {
			$applied_map[ $row['version'] ] = array(
				'version'     => $row['version'],
				'description' => $row['description'] ?? '',
				'applied_at'  => $row['applied_at'] ?? '',
				'duration_ms' => isset( $row['duration_ms'] ) ? (int) $row['duration_ms'] : null,
				'status'      => $row['status'] ?? 'applied',
			);
		}

		foreach ( self::discover() as $migration ) {
			if ( ! isset( $applied_map[ $migration->version() ] ) ) {
				$pending[] = array(
					'version'     => $migration->version(),
					'description' => $migration->description(),
				);
			}
		}

		return array(
			'applied' => array_values( $applied_map ),
			'pending' => $pending,
		);
	}

	/**
	 * Discover all migration files in the Updates directory.
	 *
	 * @return Abstract_Migration[]
	 */
	private static function discover(): array {
		if ( ! defined( 'PNPND_UPDATES' ) ) {
			return array();
		}

		$dir = PNPND_UPDATES;
		if ( ! is_dir( $dir ) ) {
			return array();
		}

		$files = glob( $dir . '/[0-9]*\.[0-9]*\.[0-9]*-*.php' );
		if ( false === $files ) {
			return array();
		}

		$migrations = array();
		foreach ( $files as $file ) {
			require_once $file;

			$base  = basename( $file, '.php' );
			$class = self::class_name_from_filename( $base );
			$fqcn  = __NAMESPACE__ . '\\' . $class;

			if ( ! class_exists( $fqcn ) ) {
				Migration_Logger::log(
					sprintf( 'Discovered %s but class %s not found — skipping', basename( $file ), $fqcn ),
					'warning'
				);
				continue;
			}

			$instance = new $fqcn();
			if ( ! $instance instanceof Abstract_Migration ) {
				Migration_Logger::log(
					sprintf( 'Class %s does not extend Abstract_Migration — skipping', $fqcn ),
					'warning'
				);
				continue;
			}

			$migrations[] = $instance;
		}

		usort(
			$migrations,
			static function ( Abstract_Migration $a, Abstract_Migration $b ): int {
				return version_compare( $a->version(), $b->version(), '<' ) ? -1 : 1;
			}
		);

		return $migrations;
	}

	/**
	 * Convert `1.1.0-extract-file-meta` → `Extract_File_Meta_1_1_0`.
	 */
	private static function class_name_from_filename( string $filename ): string {
		// Drop the version prefix.
		$without_version = preg_replace( '/^[0-9]+\.[0-9]+\.[0-9]+-/', '', $filename );

		// Convert kebab-case to PascalCase with underscores preserved.
		$parts  = explode( '-', $without_version );
		$pascal = implode( '_', array_map( 'ucfirst', $parts ) );

		// Reattach the version (with dots → underscores) at the end.
		if ( preg_match( '/^([0-9]+\.[0-9]+\.[0-9]+)/', $filename, $m ) ) {
			$version_underscored = str_replace( '.', '_', $m[1] );
			return $pascal . '_' . $version_underscored;
		}

		return $pascal;
	}

	private static function acquire_lock(): bool {
		if ( false !== get_transient( self::LOCK_KEY ) ) {
			return false;
		}
		set_transient( self::LOCK_KEY, time(), self::LOCK_TTL );
		return true;
	}

	private static function release_lock(): void {
		delete_transient( self::LOCK_KEY );
	}

	/**
	 * Ensure all plugin tables exist by running `dbDelta` on every
	 * table definition. Called at the top of every public entry point
	 * (`run`, `rollback`, `status`) so the migration framework is
	 * self-sufficient and works even when `register_activation_hook`
	 * does not fire (e.g. on plugin update, FTP deploy, multisite edge cases).
	 *
	 * `dbDelta` is idempotent — repeated calls are essentially free when
	 * the schema is already current.
	 *
	 * @throws \RuntimeException If a critical table is still missing after dbDelta.
	 */
	private static function ensure_schema(): void {
		if ( ! function_exists( 'dbDelta' ) ) {
			require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		}

		global $wpdb;
		$wpdb->hide_errors();

		$definitions = pnpnd_get_tables_definitions();
		foreach ( $definitions as $sql ) {
			dbDelta( $sql );
		}

		// Post-verify critical tables so failures are surfaced clearly
		// rather than as cryptic "table doesn't exist" errors deep inside
		// a migration.
		$required = array(
			"{$wpdb->prefix}pnpnd_files",
			"{$wpdb->prefix}pnpnd_file_meta",
			"{$wpdb->prefix}pnpnd_migrations",
		);

		foreach ( $required as $table ) {
			if ( ! self::table_exists_string( $table ) ) {
				Migration_Logger::log(
					sprintf( 'Schema sync failed — table %s still missing after dbDelta', $table ),
					'error'
				);
				throw new \RuntimeException(
					sprintf( 'Required table %s is missing after dbDelta', $table )
				);
			}
		}

		Migration_Logger::log( 'Schema ensured' );
	}

	private static function migrations_table(): string {
		global $wpdb;
		return "{$wpdb->prefix}pnpnd_migrations";
	}

	private static function table_exists_string( string $table ): bool {
		global $wpdb;
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
		return null !== $wpdb->get_var(
			$wpdb->prepare( 'SHOW TABLES LIKE %s', $table )
		);
	}

	/**
	 * Read applied versions from the audit table, sorted semver-ascending.
	 *
	 * The `version` column is a string, so we sort in PHP using `version_compare`
	 * rather than relying on MySQL's lexicographic `ORDER BY` (which would
	 * sort `1.10.0` before `1.2.0`).
	 *
	 * @return string[]
	 */
	private static function applied_versions(): array {
		global $wpdb;
		$table = self::migrations_table();

		if ( ! self::table_exists_string( $table ) ) {
			return array();
		}

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
		$rows = $wpdb->get_col(
			$wpdb->prepare( "SELECT version FROM %i WHERE status = 'applied'", $table )
		);
		if ( ! is_array( $rows ) ) {
			return array();
		}

		usort(
			$rows,
			static function ( $a, $b ) {
				return version_compare( $a, $b, '<' ) ? -1 : 1;
			}
		);

		return $rows;
	}

	private static function record( Abstract_Migration $migration, int $duration_ms ): void {
		global $wpdb;
		$table = self::migrations_table();

		if ( ! self::table_exists_string( $table ) ) {
			return;
		}

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
		$wpdb->replace(
			$table,
			array(
				'version'     => $migration->version(),
				'description' => $migration->description(),
				'applied_at'  => current_time( 'mysql' ),
				'duration_ms' => $duration_ms,
				'status'      => 'applied',
			),
			array( '%s', '%s', '%s', '%d', '%s' )
		);
	}

	private static function mark_reverted( string $version ): void {
		global $wpdb;
		$table = self::migrations_table();

		if ( ! self::table_exists_string( $table ) ) {
			return;
		}

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
		$wpdb->update(
			$table,
			array(
				'status'     => 'reverted',
				'applied_at' => current_time( 'mysql' ),
			),
			array( 'version' => $version ),
			array( '%s', '%s' ),
			array( '%s' )
		);
	}

	/**
	 * Find the version that should become the head after rolling back $version.
	 *
	 * Returns the highest applied version strictly less than $version, or
	 * '0.0.0' if none. Sorting is done in PHP via `version_compare` so that
	 * `1.10.0` correctly sorts after `1.2.0`.
	 */
	private static function previous_applied_version(): string {
		global $wpdb;
		$table = self::migrations_table();

		if ( ! self::table_exists_string( $table ) ) {
			return '0.0.0';
		}

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
		$rows = $wpdb->get_results(
			$wpdb->prepare( "SELECT version FROM %i WHERE status = 'applied'", $table ),
			ARRAY_A
		);
		if ( empty( $rows ) || ! is_array( $rows ) ) {
			return '0.0.0';
		}

		$versions = array_column( $rows, 'version' );
		usort(
			$versions,
			static function ( $a, $b ) {
				return version_compare( $a, $b, '<' ) ? -1 : 1;
			}
		);

		$end = end( $versions );

		return $end ? $end : '0.0.0';
	}
}
