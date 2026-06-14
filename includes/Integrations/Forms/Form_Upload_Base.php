<?php

namespace Pnpnd\ND\Integrations\Forms;

use Pnpnd\ND\App\App;
use Pnpnd\ND\Integrations\Base_Integration;
use Pnpnd\ND\Notice;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

/**
 * Abstract base for form integrations that upload submitted files to Google Drive.
 *
 * Provides shared helpers used by Contact Form 7, Gravity Forms, and Elementor Form Upload.
 * Subclasses only need to implement the hook registration (init()) and call these helpers
 * when handling a form submission.
 */
abstract class Form_Upload_Base extends Base_Integration {

	/**
	 * Read a local file and upload it to Google Drive.
	 *
	 * @param string $file_path  Absolute path to the local file.
	 * @param string $folder_key Google Drive folder key to upload into.
	 * @return array|\WP_Error   Upload result array on success, WP_Error on failure.
	 */
	protected function upload_file( string $file_path, string $folder_key ) {
		if ( ! file_exists( $file_path ) ) {
			return new \WP_Error( 'file_not_found', __( 'Local file not found.', 'ninja-drive' ) );
		}

		$name    = sanitize_file_name( basename( $file_path ) );
		$type    = wp_check_filetype( $name )['type'];
		$content = file_get_contents( $file_path ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents

		if ( false === $content ) {
			return new \WP_Error( 'file_read_error', __( 'Could not read local file.', 'ninja-drive' ) );
		}

		return App::get_instance()->upload( $name, $type, $folder_key, $content );
	}

	/**
	 * Delete a local file when skip-local is enabled.
	 *
	 * @param string $file_path  Absolute path to the local file.
	 * @param bool   $skip_local Whether to skip local storage.
	 */
	protected function maybe_delete_local( string $file_path, bool $skip_local ): void {
		if ( $skip_local && file_exists( $file_path ) ) {
			wp_delete_file( $file_path );
		}
	}

	/**
	 * Notify the admin dashboard about an upload result.
	 *
	 * @param array|\WP_Error $result Upload result.
	 * @param string          $name   Original file name for the message.
	 */
	protected function notify_upload_result( $result, string $name ): void {
		if ( is_wp_error( $result ) ) {
			pnpnd_notify(
				Notice::TYPE_ERROR,
				sprintf(
					/* translators: 1: File name, 2: Error message */
					__( 'Failed to upload "%1$s" to Google Drive: %2$s', 'ninja-drive' ),
					$name,
					$result->get_error_message()
				)
			);
		} else {
			pnpnd_notify(
				Notice::TYPE_SUCCESS,
				sprintf(
					/* translators: %s: File name */
					__( 'File "%s" uploaded to Google Drive successfully.', 'ninja-drive' ),
					$name
				)
			);
		}
	}

	/**
	 * Build a preview URL from an upload result.
	 *
	 * @param array  $result Upload result array returned by App::upload().
	 * @param string $name   Fallback file name.
	 * @return string        Preview URL, or empty string on failure.
	 */
	protected function get_preview_url( array $result, string $name = '' ): string {
		if ( empty( $result['file_key'] ) ) {
			return '';
		}

		return pnpnd_get_url(
			'preview',
			$result['file_key'],
			$result['name'] ?? $name,
			'5xl',
			$result['extension'] ?? pathinfo( $name, PATHINFO_EXTENSION )
		) ?? '';
	}

	/**
	 * Convert a WordPress upload URL to its local filesystem path.
	 *
	 * @param string $url File URL.
	 * @return string     Absolute file path, or empty string if not resolvable.
	 */
	protected function url_to_path( string $url ): string {
		$upload_dir = wp_upload_dir();

		if ( 0 === strpos( $url, $upload_dir['baseurl'] ) ) {
			return str_replace( $upload_dir['baseurl'], $upload_dir['basedir'], $url );
		}

		return '';
	}
}
