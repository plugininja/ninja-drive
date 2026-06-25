<?php // phpcs:ignore WordPress.Files.FileName.InvalidClassFileName

namespace Pnpnd\ND\Updates;

use Pnpnd\ND\Models\File_Meta;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

/**
 * Migration 1.1.0 — extract serialized `meta_data` blobs from
 * `pnpnd_files.meta_data` into the new relational `pnpnd_file_meta` table.
 *
 * The legacy column is preserved initially for downgrade safety and is
 * dropped by the 1.2.0 migration (triggered via the Legacy_Cleanup_Notice
 * admin button).
 */
class Extract_File_Meta_1_1_0 extends Abstract_Migration {

	public function version(): string {
		return '1.1.0';
	}

	public function description(): string {
		return 'Extract serialized meta_data blobs into the new pnpnd_file_meta table';
	}

	public function up(): bool {
		global $wpdb;

		$files_table = "{$wpdb->prefix}pnpnd_files";

		if ( ! $this->table_exists( $files_table ) ) {
			Migration_Logger::log(
				sprintf( 'Source table %s missing — nothing to migrate', $files_table ),
				'warning'
			);
			return true;
		}

		if ( ! $this->column_exists( $files_table, 'meta_data' ) ) {
			Migration_Logger::log(
				'pnpnd_files.meta_data column missing — nothing to migrate',
				'warning'
			);
			return true;
		}

		$batch_size = $this->batch_size();
		$offset     = 0;
		$total      = 0;

		do {
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			$rows = $wpdb->get_results(
				$wpdb->prepare(
					"SELECT `file_key`, `meta_data` FROM %i
					WHERE `meta_data` IS NOT NULL AND `meta_data` != ''
					LIMIT %d OFFSET %d",
					$files_table,
					$batch_size,
					$offset
				)
			);

			if ( empty( $rows ) ) {
				break;
			}

			foreach ( $rows as $row ) {
				$meta = maybe_unserialize( $row->meta_data );
				if ( ! is_array( $meta ) || empty( $meta ) ) {
					continue;
				}

				foreach ( $meta as $meta_key => $meta_value ) {
					if ( ! is_string( $meta_key ) ) {
						continue;
					}
					File_Meta::get_instance()->update_meta(
						$row->file_key,
						$meta_key,
						$meta_value
					);
					++$total;
				}
			}

			$offset += $batch_size;
		} while ( count( $rows ) === $batch_size );

		Migration_Logger::log(
			sprintf( 'Migrated %d meta entries to pnpnd_file_meta', $total )
		);

		return true;
	}

	public function down(): bool {
		Migration_Logger::log(
			'Down migration not implemented — legacy pnpnd_files.meta_data column is dropped by the 1.2.0 migration once the admin confirms via the cleanup notice.',
			'warning'
		);
		return false;
	}
}
