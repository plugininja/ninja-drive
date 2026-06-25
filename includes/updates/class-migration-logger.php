<?php

namespace Pnpnd\ND\Updates;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

/**
 * Minimal logger for migration runs.
 *
 * Writes timestamped entries to `wp-content/uploads/pnpnd-migrations.log`.
 * Also surfaces to PHP's `error_log` when `WP_DEBUG` is enabled.
 */
class Migration_Logger {

	private const FILE_NAME = 'pnpnd-migrations.log';

	/**
	 * Append a log entry.
	 *
	 * @param string $message Message body.
	 * @param string $level   One of: info, warning, error.
	 */
	public static function log( string $message, string $level = 'info' ): void {
		$line = sprintf(
			"[%s] [%s] %s\n",
			current_time( 'mysql' ),
			strtoupper( $level ),
			$message
		);
		$file = self::log_file_path();

		self::append_to_log_file( $file, $line );

		if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log( '[ninja-drive migration] ' . trim( $line ) );
		}
	}

	/**
	 * Append a line to the log file with proper error handling.
	 *
	 * Best-effort: failures (missing directory, no write permission) are
	 * surfaced via `error_log` so they're never silently lost, but never
	 * thrown — logging must never break a migration.
	 *
	 * @param string $file Full path to the log file.
	 * @param string $line Line to append (must include trailing newline).
	 */
	private static function append_to_log_file( string $file, string $line ): void {
		$dir = dirname( $file );

		if ( ! is_dir( $dir ) || ! is_writable( $dir ) ) {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log(
				sprintf(
					'[ninja-drive migration] log directory not writable: %s — %s',
					$dir,
					trim( $line )
				)
			);
			return;
		}

		// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
		$written = file_put_contents( $file, $line, FILE_APPEND | LOCK_EX );

		if ( false === $written ) {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log(
				sprintf(
					'[ninja-drive migration] failed to write to log: %s — %s',
					$file,
					trim( $line )
				)
			);
		}
	}

	/**
	 * Read the last N log lines.
	 *
	 * @param int $lines Number of tail lines to return.
	 *
	 * @return array<string> Lines in chronological order.
	 */
	public static function tail( int $lines = 50 ): array {
		$file = self::log_file_path();
		if ( ! file_exists( $file ) ) {
			return array();
		}

		$raw = file( $file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES );
		if ( false === $raw ) {
			return array();
		}

		return array_slice( $raw, max( 0, count( $raw ) - $lines ) );
	}

	/**
	 * Delete the log file. Used by the admin UI's "Clear logs" action.
	 */
	public static function clear(): bool {
		$file = self::log_file_path();

		if ( ! file_exists( $file ) ) {
			return true;
		}

		if ( ! is_writable( $file ) ) {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log( "[ninja-drive migration] cannot clear log — not writable: {$file}" );
			return false;
		}

		// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_unlink
		$result = unlink( $file );

		return false !== $result;
	}

	/**
	 * Absolute path to the log file.
	 */
	public static function log_file_path(): string {
		$upload = wp_upload_dir();

		return trailingslashit( $upload['basedir'] ?? WP_CONTENT_DIR ) . self::FILE_NAME;
	}
}
