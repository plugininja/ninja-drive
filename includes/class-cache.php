<?php

namespace Pnpnd\ND;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Cache {

	/**
	 * WordPress filesystem instance
	 *
	 * @var \WP_Filesystem_Base
	 */
	protected $fs;

	/**
	 * Upload base directory
	 *
	 * @var string
	 */
	protected $base_dir;

	/**
	 * Upload base URL
	 *
	 * @var string
	 */
	protected $base_url;

	/**
	 * Allowed size folders
	 *
	 * @var array
	 */
	protected $allowed_sizes = array( 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl' );

	public function __construct() {
		$this->init_filesystem();
	}

	protected function init_filesystem() {
		if ( ! function_exists( 'WP_Filesystem' ) ) {
			require_once ABSPATH . 'wp-admin/includes/file.php';
		}

		WP_Filesystem();

		global $wp_filesystem;
		$this->fs = $wp_filesystem;

		if ( ! $this->fs ) {
			return;
		}

		$upload_dir     = wp_upload_dir();
		$this->base_dir = trailingslashit( $upload_dir['basedir'] ) . 'pnpnd/';
		$this->base_url = trailingslashit( $upload_dir['baseurl'] ) . 'pnpnd/';

		if ( ! $this->fs->exists( $this->base_dir ) ) {
			$this->fs->mkdir( $this->base_dir, FS_CHMOD_DIR );
			$this->fs->put_contents( $this->base_dir . 'index.php', '<?php // Silence is golden.' );
		}
	}

	protected function is_valid_size( $size ) {
		return in_array( $size, $this->allowed_sizes, true );
	}

	public function save_file( $file_data, $filename, $size, $ext = 'webp' ) {

		if ( ! $this->fs || ! $this->is_valid_size( $size ) ) {
			return false;
		}

		try {
			$size_dir = trailingslashit( $this->base_dir . $size );

			if ( ! $this->fs->exists( $size_dir ) ) {
				if ( ! $this->fs->mkdir( $size_dir, FS_CHMOD_DIR ) ) {
					return false;
				}
				$this->fs->put_contents( $size_dir . 'index.php', '<?php // Silence is golden.' );
			}

			$file_path = $size_dir . sanitize_file_name( $filename ) . '.' . $ext;

			if ( $this->fs->exists( $file_path ) ) {
				return true;
			}

			if ( ! $this->fs->put_contents( $file_path, $file_data, FS_CHMOD_FILE ) ) {
				return false;
			}

			return true;

		} catch ( \Throwable $e ) {
			return false;
		}
	}

	public function exists_file( $filename, $size, $ext = 'webp' ) {
		if ( ! $this->fs || ! $this->is_valid_size( $size ) ) {
			return false;
		}

		$file_path = trailingslashit( $this->base_dir . $size )
			. sanitize_file_name( $filename ) . '.' . $ext;

		return $this->fs->exists( $file_path );
	}

	public function get_file_url( $filename, $size, $ext = 'webp' ) {
		if ( ! $this->fs || ! $this->is_valid_size( $size ) ) {
			return false;
		}

		$filename  = sanitize_file_name( $filename ) . '.' . $ext;
		$file_path = trailingslashit( $this->base_dir . $size ) . $filename;

		if ( ! $this->fs->exists( $file_path ) ) {
			return false;
		}

		return trailingslashit( $this->base_url . $size ) . $filename;
	}

	public function get_file_raw( $filename, $size, $ext = 'webp' ) {
		if ( ! $this->fs || ! $this->is_valid_size( $size ) ) {
			return false;
		}

		$file_path = trailingslashit( $this->base_dir . $size )
			. sanitize_file_name( $filename ) . '.' . $ext;

		if ( ! $this->fs->exists( $file_path ) ) {
			return false;
		}

		return $this->fs->get_contents( $file_path );
	}

	public function delete_file( $filename, $size, $ext = 'webp' ) {
		if ( ! $this->fs || ! $this->is_valid_size( $size ) ) {
			return false;
		}

		$file_path = trailingslashit( $this->base_dir . $size )
			. sanitize_file_name( $filename ) . '.' . $ext;

		if ( $this->fs->exists( $file_path ) ) {
			
			if ( ! $this->fs->delete( $file_path ) ) {
				return false;
			}
		}

		return true;
	}

	public function clear_cache() {
		if ( ! $this->fs ) {
			return false;
		}

		if ( $this->fs->exists( $this->base_dir ) ) {
			if ( ! $this->fs->delete( $this->base_dir, true ) ) {
				return false;
			}
		}

		return true;
	}
}
