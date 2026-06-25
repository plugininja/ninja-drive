<?php

namespace Pnpnd\ND\Updates;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

/**
 * Base class for all Ninja Drive DB migrations.
 *
 * Drop a file `includes/Updates/{version}-{slug}.php` containing a class that
 * extends this base. The runner will discover and apply it automatically on
 * plugin update or manual trigger.
 *
 * @example
 *   class Add_Foo_Index_1_2_0 extends Abstract_Migration {
 *       public function version(): string      { return '1.2.0'; }
 *       public function description(): string  { return 'Add idx_foo on pnpnd_files'; }
 *       public function up(): bool {
 *           global $wpdb;
 *           $wpdb->query( "CREATE INDEX idx_foo ON {$wpdb->prefix}pnpnd_files(name)" );
 *           return true;
 *       }
 *   }
 */
abstract class Abstract_Migration {

	/**
	 * Semver string for this migration, e.g. "1.1.0".
	 *
	 * Must be unique across all migrations. When this is the head version it
	 * should match `PNPND_DB_VERSION`.
	 */
	abstract public function version(): string;

	/**
	 * Human-readable summary shown in admin UI and logs.
	 */
	abstract public function description(): string;

	/**
	 * Apply the migration. Return true on success, false to abort the chain.
	 *
	 * Throwing an exception also aborts the chain and is recorded in the audit
	 * table with status='failed'.
	 */
	abstract public function up(): bool;

	/**
	 * Revert the migration. Default: unsupported (returns false).
	 *
	 * Override and return true to enable rollback via the admin UI or
	 * `Migration_Runner::rollback()`.
	 */
	public function down(): bool {
		return false;
	}

	/**
	 * Default batch size for row-by-row migrations. Override per migration.
	 */
	public function batch_size(): int {
		return 200;
	}

	/**
	 * Optional pre-up hook for one-off setup (e.g. acquiring extra locks).
	 */
	public function before(): void {}

	/**
	 * Optional post-up hook for one-off teardown (e.g. cache flushes).
	 */
	public function after(): void {}

	/**
	 * Helper — check if a column exists on a table.
	 *
	 * @param string $table  Full table name (with prefix).
	 * @param string $column Column name to look up.
	 */
	protected function column_exists( string $table, string $column ): bool {
		global $wpdb;

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
		return null !== $wpdb->get_var(
			$wpdb->prepare( 'SHOW COLUMNS FROM %i LIKE %s', $table, $column )
		);
	}

	/**
	 * Helper — check if an index exists on a table.
	 *
	 * @param string $table Full table name (with prefix).
	 * @param string $index Index name to look up.
	 */
	protected function index_exists( string $table, string $index ): bool {
		global $wpdb;

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
		return null !== $wpdb->get_var(
			$wpdb->prepare( 'SHOW INDEX FROM %i WHERE Key_name = %s', $table, $index )
		);
	}

	/**
	 * Helper — check if a table exists.
	 *
	 * @param string $table Full table name (with prefix).
	 */
	protected function table_exists( string $table ): bool {
		global $wpdb;

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
		return null !== $wpdb->get_var(
			$wpdb->prepare( 'SHOW TABLES LIKE %s', $table )
		);
	}
}
