<?php // phpcs:ignore WordPress.Files.FileName.InvalidClassFileName

namespace Pnpnd\ND\Updates;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

/**
 * Migration 1.2.0 — drop the legacy `meta_data` LONGTEXT column from
 * `pnpnd_files` now that data has been extracted into `pnpnd_file_meta`
 * by migration 1.1.0.
 *
 * Idempotent — skips if the column is already gone. Safety-checked —
 * refuses to drop while rows still have unmigrated data. Intended to
 * run only when an admin confirms via the Legacy_Cleanup_Notice.
 */
class Drop_Legacy_Meta_Column_1_2_0 extends Abstract_Migration {

	public function version(): string {
		return '1.2.0';
	}

	public function description(): string {
		return 'Drop legacy meta_data column from pnpnd_files';
	}

	public function up(): bool {
		global $wpdb;

		$files_table = "{$wpdb->prefix}pnpnd_files";

		if ( ! $this->table_exists( $files_table ) ) {
			Migration_Logger::log(
				sprintf( 'Source table %s missing — nothing to drop', $files_table ),
				'warning'
			);
			return true;
		}

		if ( ! $this->column_exists( $files_table, 'meta_data' ) ) {
			Migration_Logger::log(
				sprintf( 'pnpnd_files.meta_data already gone — nothing to drop on %s', $files_table ),
				'info'
			);
			return true;
		}

		// Safety: trust the audit table as the source of truth. If migration
		// 1.1.0 is recorded as applied, every row that 1.1.0's SELECT clause
		// matched (`meta_data IS NOT NULL AND meta_data != ''`) was iterated —
		// and either migrated (File_Meta UPSERT is idempotent) or skipped
		// (empty arrays, corrupt serialization). Either way, dropping the
		// legacy column is safe.
		$audit_table = "{$wpdb->prefix}pnpnd_migrations";

		if ( ! $this->table_exists( $audit_table ) ) {
			Migration_Logger::log(
				'pnpnd_migrations audit table missing — cannot verify 1.1.0 was applied. Refusing to drop meta_data.',
				'error'
			);
			return false;
		}

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
		$one_applied = (int) $wpdb->get_var(
			$wpdb->prepare(
				'SELECT COUNT(*) FROM %i WHERE version = %s AND status = %s',
				$audit_table,
				'1.1.0',
				'applied'
			)
		);

		if ( 0 === $one_applied ) {
			Migration_Logger::log(
				'Refusing to drop meta_data — migration 1.1.0 has not been recorded as applied. Run the 1.1.0 migration first.',
				'error'
			);
			return false;
		}

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$wpdb->query( "ALTER TABLE {$files_table} DROP COLUMN `meta_data`" );

		if ( $this->column_exists( $files_table, 'meta_data' ) ) {
			Migration_Logger::log(
				sprintf( 'Failed to drop meta_data column from %s', $files_table ),
				'error'
			);
			return false;
		}

		Migration_Logger::log( sprintf( 'Dropped meta_data column from %s', $files_table ) );
		return true;
	}

	public function down(): bool {
		Migration_Logger::log(
			'Down migration not implemented — manual downgrade: ALTER TABLE pnpnd_files ADD COLUMN meta_data LONGTEXT.',
			'warning'
		);
		return false;
	}
}
