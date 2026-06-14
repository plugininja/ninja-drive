<?php

namespace Pnpnd\ND;

use Pnpnd\ND\App\App;
use Pnpnd\ND\App\Authorization;
use Pnpnd\ND\Models\Files;
use Pnpnd\ND\Models\Widget;
use Pnpnd\ND\Utils\Helpers;
use Pnpnd\ND\Utils\Mimetype_Manager;
use Pnpnd\ND\Traits\Singleton;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class Content {

	use Singleton;

	private $widget_id;

	private function do_hooks() {
		add_filter( 'query_vars', array( $this, 'add_query_vars' ) );
		add_action( 'template_redirect', array( $this, 'redirect_template' ) );
	}

	public function add_query_vars( $vars ) {
		return array_merge(
			$vars,
			array(
				'pnpnd-share',
				'pnpnd-action',
				'pnpnd-key',
				'pnpnd-name',
				'pnpnd-ext',
				'authorization',
				'code',
			)
		);
	}

	public function redirect_template() {
		foreach ( array(
			'authorization' => fn ( $val ) => $this->doing_auth(
				$val,
				get_query_var( 'code', '' )
			),
			'pnpnd-action'  => fn ( $val ) => $this->url(
				$val,
				get_query_var( 'pnpnd-key', 'full' ),
				get_query_var( 'pnpnd-name', 'unknown' ),
				get_query_var( 'pnpnd-ext', 'jpg' )
			),
		) as $query_var => $callback ) {
			$value = get_query_var( $query_var, false );
			if ( $value ) {
				$callback( sanitize_text_field( wp_unslash( $value ) ) );

				return;
			}
		}
	}

	private function url( $action, $key, $name, $ext ) {
		$exploded_action = explode( '-', $action );
		$action          = reset( $exploded_action );
		$widget_id       = $exploded_action[1] ?? null;

		if ( 'thumbnail' === $action ) {
			$this->thumbnail( $key, $name, $ext, $widget_id );

			exit;
		} elseif ( 'preview' === $action ) {
			$this->preview( $key, $name, $ext, $widget_id );

			exit;
		} elseif ( 'share' === $action ) {
			$this->share( $key, $name, $ext, $widget_id );

			exit;
		} elseif ( 'download' === $action ) {
			$this->download( $key, $name, $ext, $widget_id );

			exit;
		}

		pnpnd_get_template(
			'notice-card/permission-denied',
			array(
				'title'       => __( 'Invalid URL.', 'ninja-drive' ),
				'description' => __( 'The URL you have entered is not valid.', 'ninja-drive' ),
				'card_status' => 'error',
			)
		);
		exit;
	}

	private function safe_redirect( string $url, $cache = HOUR_IN_SECONDS, $status = 302, $referrer = 'no-referrer' ): void {
		if ( ! empty( $referrer ) ) {
			header( "Referrer-Policy: {$referrer}" );
		}

		header( "Cache-Control: public, max-age={$cache}" );
		wp_safe_redirect( $url, $status, PNPND_NAME . ' Safe Redirect' );
		exit;
	}

	private function get_raw_data( string $url ) {
		header( 'Referrer-Policy: no-referrer' );
		$response = wp_remote_get(
			$url,
			array(
				'timeout'     => 15,
				'redirection' => 5,
			)
		);
		if ( is_wp_error( $response ) ) {
			$this->safe_redirect( $this->get_unknown_icon( 'image/jpeg' ), 0 );
			exit;
		}
		$data         = wp_remote_retrieve_body( $response );
		$content_type = wp_remote_retrieve_header( $response, 'content-type' );

		$allowed_content_types = array(
			'application/vnd.google-apps.spreadsheet',
			'application/vnd.google-apps.folder',
			'application/vnd.google-apps.document',
			'application/vnd.google-apps.presentation',
			'application/vnd.google-apps.script',
			'application/vnd.google-apps.form',
			'application/vnd.google-apps.drawing',
			'application/vnd.ms-excel',
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'application/msword',
			'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
			'application/vnd.ms-powerpoint',
			'application/vnd.openxmlformats-officedocument.presentationml.presentation',
			'application/pdf',
			'text/plain',
			'text/csv',
			'image/jpeg',
			'image/png',
			'image/gif',
			'image/webp',
			'image/svg+xml',
			'audio/mpeg',
			'audio/wav',
			'video/mp4',
			'video/x-msvideo',
		);

		$base_content_type = $content_type ? explode( ';', $content_type )[0] : '';
		$base_content_type = trim( $base_content_type );

		if ( $data && in_array( $base_content_type, $allowed_content_types, true ) ) {
			return array(
				'data'        => $data,
				'contentType' => $base_content_type,
			);
		}

		return false;
	}

	private function deny_access( ?string $message = null, int $status = 403 ): void {
		if ( null === $message ) {
			$message = __( 'Access denied!', 'ninja-drive' );
		}

		pnpnd_get_template(
			'notice-card/permission-denied',
			array(
				'title'       => __( 'Error', 'ninja-drive' ),
				'description' => $message,
				'card_status' => 'error',
			)
		);
		exit;
	}

	private function get_unknown_icon( string $mime_type = 'application/octet-stream' ): string {
		return 'https://drive-thirdparty.googleusercontent.com/128/type/' . $mime_type;
	}

	public function download( $key, $name, $ext, $widget_id = null ) {
		$exploded_key = explode( '-', $key );
		$file_key     = $exploded_key[0] ?? null;
		$link_key     = $exploded_key[1] ?? null;
		if ( ! empty( $file_key ) && ! empty( $link_key ) ) {
			return $this->download_with_generated_link( $file_key, $link_key, $name, $ext, $widget_id );
		}

		$this->url_validation( $key, $name, $ext );

		$this->check_permission( $widget_id, $key, 'download' );

		$download_link = App::get_instance()->download( $key, $ext );

		if ( is_wp_error( $download_link ) ) {
			pnpnd_get_template(
				'notice-card/permission-denied',
				array(
					'title'       => __( 'Error', 'ninja-drive' ),
					'description' => $download_link->get_error_message(),
					'card_status' => 'error',
				)
			);
			exit;
		}

		wp_safe_redirect( $download_link );
		exit;
	}

	private function download_with_generated_link( string $file_key, string $link_key, string $name, string $ext, ?string $widget_id = null ) {
		if ( empty( $file_key ) || empty( $link_key ) ) {
			wp_die( esc_html__( 'File key is required.', 'ninja-drive' ), esc_html__( 'Error', 'ninja-drive' ), array( 'response' => 400 ) );
		}

		$this->url_validation( $file_key, $name, $ext );
		$password = '';

		if ( isset( $_SERVER['REQUEST_METHOD'] ) && sanitize_text_field( wp_unslash( $_SERVER['REQUEST_METHOD'] ) ) === 'POST' && isset( $_POST['pnpnd-password-nonce'] ) && wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['pnpnd-password-nonce'] ) ), 'pnpnd_password_nonce' ) && isset( $_POST['pnpnd-download-password'] ) ) {
			$password = sanitize_text_field( wp_unslash( $_POST['pnpnd-download-password'] ) );
		}

		$is_valid_link = Files::get_instance()->validate_download_link( "$file_key-$link_key", $password );
		if ( empty( $is_valid_link ) ) {
			pnpnd_get_template(
				'notice-card/permission-denied',
				array(
					'title'       => __( 'Invalid Download URL', 'ninja-drive' ),
					'description' => __( 'Invalid or expired download link.', 'ninja-drive' ),
					'card_status' => 'error',
				)
			);
			exit;
		}

		if ( is_wp_error( $is_valid_link ) ) {
			if ( $is_valid_link->get_error_code() === 'password_required' || $is_valid_link->get_error_code() === 'invalid_password' ) {
				pnpnd_get_template(
					'content-password',
					array(
						'code'      => $is_valid_link->get_error_code(),
						'message'   => $is_valid_link->get_error_message(),
						'file_key'  => $file_key,
						'name'      => $name,
						'fieldName' => 'pnpnd-download-password',
					)
				);
				exit;
			} else {

				wp_die( esc_html( $is_valid_link->get_error_message() ), esc_html__( 'Error', 'ninja-drive' ), array( 'response' => 400 ) );
			}
		}

		$download_link = App::get_instance()->download( $file_key, $ext );

		if ( empty( $download_link ) ) {
			pnpnd_get_template(
				'notice-card/permission-denied',
				array(
					'title'       => __( 'Error', 'ninja-drive' ),
					'description' => __( 'Something went wrong to download the file.', 'ninja-drive' ),
					'card_status' => 'error',
				)
			);
			exit;
		}

		if ( is_wp_error( $download_link ) ) {
			pnpnd_get_template(
				'notice-card/permission-denied',
				array(
					'title'       => __( 'Error', 'ninja-drive' ),
					'description' => $download_link->get_error_message(),
					'card_status' => 'error',
				)
			);
			exit;
		}

		wp_safe_redirect( $download_link );
		exit;
	}

	private function preview( $key, $name, $ext, $widget_id = null ): void {
		$is_video = MimeType_Manager::is_video( $ext );

		$this->url_validation( $key, $name, $ext );
		$this->check_permission( $widget_id, $key, 'preview' );

		$file = pnpnd_get_file_by_key( $key );

		if ( is_wp_error( $file ) ) {
			$this->safe_redirect( $this->get_unknown_icon( 'image/jpeg' ), 0 );
		}

		$preview_link = '';

		if ( empty( $preview_link ) ) {
			$preview_link = App::get_instance( $file['account_id'] )->preview( $file['file_key'] );
		}

		if ( is_wp_error( $preview_link ) ) {
			$message = __( 'Unable to generate preview link.', 'ninja-drive' );
			if ( current_user_can( 'manage_options' ) ) {
				$message .= ' ' . $preview_link->get_error_message();
			}
			$this->deny_access( esc_html( $message ), 500 );
		}

		if ( empty( $preview_link ) ) {
			$this->safe_redirect( $this->get_unknown_icon( $file['mime_type'] ?? 'image/jpeg' ), 0 );
		}
		$referrer = $is_video ? '' : 'no-referrer';

		$this->safe_redirect( $preview_link, 0, 302, $referrer );
	}

	private function process_thumbnail( array $file, string $size = '5xl', string $mime_type = 'application/octet-stream' ): void {
		if ( ! is_array( $file ) || empty( $file ) || is_wp_error( $file ) ) {
			$this->safe_redirect( $this->get_unknown_icon( $file['mime_type'] ?? $mime_type ), DAY_IN_SECONDS );
		}

		$life_time = Helpers::check_lifetime( $file['updated_at'] ?? '' );

		if ( $life_time <= 0 || empty( $file['thumbnail'] ) ) {
			$file = App::get_instance( $file['account_id'] )->get_file( $file['id'], $file['account_id'], true );
			if ( is_wp_error( $file ) || empty( $file ) ) {
				$this->safe_redirect( $this->get_unknown_icon( $mime_type ), 0 );
			}

			$life_time = Helpers::check_lifetime( $file['updated_at'] ?? '' );
		}

		if ( empty( $file ) || empty( $file['thumbnail'] ) ) {
			$this->safe_redirect( $this->get_unknown_icon( $file['mime_type'] ?? $mime_type ), DAY_IN_SECONDS );
		}

		$string_size   = pnpnd_size_to_string( $size );
		$thumbnail_url = str_replace( '=s220', $string_size ? "={$string_size}" : '', $file['thumbnail'] );

		$redirection = Helpers::get_setting( 'integrations.advanced.redirection', false );

		if ( $redirection ) {
			$this->safe_redirect( apply_filters( 'pnpnd_thumbnail_url', $thumbnail_url ), $life_time );
		} else {
			$thumbnail_data = $this->get_raw_data( apply_filters( 'pnpnd_thumbnail_url', $thumbnail_url ) );

			$raw_data     = $thumbnail_data['data'] ?? false;
			$content_type = $thumbnail_data['contentType'] ?? $mime_type;
			if ( ! $raw_data ) {
				$this->safe_redirect( $this->get_unknown_icon( $file['mime_type'] ?? $mime_type ), DAY_IN_SECONDS );
			}

			$cache     = new Cache();
			$extension = MimeType_Manager::is_image( $file['mime_type'] ?? '' ) ? MimeType_Manager::get_extension( $file['mime_type'] ) : 'webp';
			$cache->save_file( $raw_data, $file['file_key'], $size, $extension );

			header( "Content-Type: {$content_type}" );
			header( "Cache-Control: public, max-age={$life_time}" );
			// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			echo $raw_data;
		}
	}

	public function thumbnail( $key, $name, $ext, $widget_id = null, $size = '2xl' ) {
		$parts = explode( '-', $name );

		$available_sizes = pnpnd_get_available_thumbnail_sizes();
		$size_keys       = array_map( 'strval', array_keys( $available_sizes ) );

		if ( count( $parts ) > 1 ) {
			$possible_size = strtolower( end( $parts ) );
			$possible_size = str_replace( array( 'thumbnail', 'medium', 'large', 'full' ), array( 'lg', 'xl', '4xl', '5xl' ), $possible_size );

			if ( in_array( $possible_size, $size_keys, true ) ) {
				$size = $possible_size;
				$name = strtolower( implode( '-', array_slice( $parts, 0, -1 ) ) );
			}
		}

		if ( 'json' === $ext || 'zip' === $ext || 'script' === $ext ) {
			$folder_icon = $this->get_unknown_icon( pnpnd_get_mimetype_by_extension( $ext ) );
			header( 'Content-Type: image/jpeg' );
			header( 'Cache-Control: public, max-age=' . DAY_IN_SECONDS );
			wp_safe_redirect( $folder_icon, 302 );
			exit;
		}

		$cache           = new Cache();
		$cached_file_raw = $cache->get_file_raw( $key, $size, $ext );
		if ( $cached_file_raw ) {
			header( 'Content-Type: ' . MimeType_Manager::get_mimetype( $ext ) );
			header( 'Cache-Control: public, max-age=' . MONTH_IN_SECONDS );
			// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			echo $cached_file_raw;
			exit;
		}

		$file = pnpnd_get_file_by_key( $key );

		if ( is_wp_error( $file ) ) {
			$file_mimetype = is_wp_error( $file ) ? 'unknown' : ( $file['mime_type'] ?? 'unknown' );

			$folder_icon = $this->get_unknown_icon( $file_mimetype );
			wp_safe_redirect( $folder_icon, 302 );
			exit;
		}

		if ( 'application/vnd.google-apps.folder' === $file['mime_type'] ) {
			$folder_icon = str_replace( '32', '128', $file['icon'] ?? '' ) ?? $this->get_unknown_icon( $file['mime_type'] );
			wp_safe_redirect( $folder_icon, 302 );
			exit;
		}

		$basename     = $file['additional_data']['base_name'] ?? '';
		$clean_name   = pnpnd_title_to_url_slug( $basename );
		$clean_name   = str_replace( '_', '-', $clean_name );
		$decoded_name = urldecode( $name );
		$decoded_name = str_replace( '_', '-', $decoded_name );

		if ( $decoded_name !== $clean_name ) {
			wp_safe_redirect( $file['icon'] ?? '', 302 );
			exit;
		}

		$this->check_permission( $widget_id, $key, 'thumbnail' );

		if ( 'application/vnd.google-apps.shortcut' === $file['mime_type'] && ! empty( $file['additional_data']['shortcutDetails']['targetId'] ?? '' ) ) {
			$file = App::get_instance()->get_file( $file['additional_data']['shortcutDetails']['targetId'], $file['account_id'] );

			if ( is_wp_error( $file ) ) {
				$this->safe_redirect( $this->get_unknown_icon( 'image/jpeg' ), 0 );
				exit;
			}
		}

		$this->process_thumbnail( $file, $size, 'image/jpeg' );
	}

	private function share( $combined_key, $name, $ext, $widget_id = null ): void {
		$exploded_key = explode( '-', $combined_key );
		$file_key     = $exploded_key[0] ?? null;
		$link_key     = $exploded_key[1] ?? null;

		if ( empty( $file_key ) || empty( $link_key ) ) {
			wp_die( esc_html__( 'File key is required.', 'ninja-drive' ), esc_html__( 'Error', 'ninja-drive' ), array( 'response' => 400 ) );
		}

		$this->url_validation( $file_key, $name, $ext );
		$password = '';

		if ( isset( $_SERVER['REQUEST_METHOD'] ) && sanitize_text_field( wp_unslash( $_SERVER['REQUEST_METHOD'] ) ) === 'POST' && isset( $_POST['pnpnd-password-nonce'] ) && wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['pnpnd-password-nonce'] ) ), 'pnpnd_password_nonce' ) && isset( $_POST['pnpnd-download-password'] ) ) {
			$password = sanitize_text_field( wp_unslash( $_POST['pnpnd-download-password'] ) );
		}

		$is_valid_link = Files::get_instance()->validate_shared_link( "$file_key-$link_key", $password );

		if ( empty( $is_valid_link ) ) {
			wp_die( esc_html__( 'Invalid or expired share link.', 'ninja-drive' ), esc_html__( 'Error', 'ninja-drive' ), array( 'response' => 400 ) );
		}

		if ( is_wp_error( $is_valid_link ) ) {
			if ( $is_valid_link->get_error_code() === 'password_required' || $is_valid_link->get_error_code() === 'invalid_password' ) {
				pnpnd_get_template(
					'content-password',
					array(
						'code'      => $is_valid_link->get_error_code(),
						'message'   => $is_valid_link->get_error_message(),
						'file_key'  => $file_key,
						'name'      => $name,
						'fieldName' => 'pnpnd-download-password',
					)
				);
				exit;
			} else {

				wp_die( esc_html( $is_valid_link->get_error_message() ), esc_html__( 'Error', 'ninja-drive' ), array( 'response' => 400 ) );
			}
		}

		$embed_link = App::get_instance()->preview( $file_key );

		if ( 'folder' === $ext || 'zip' === $ext ) {
			wp_safe_redirect( $embed_link, 302 );
			exit;
		}

		echo '<iframe src="' . esc_url( $embed_link ) . '" width="100%" height="100%" style="border:none;"></iframe>';
		exit;
	}

	private function doing_auth( $action, $code ) {

		if ( 'ninja-drive' !== $action || empty( $code ) ) {
			return;
		}

		Authorization::get_instance()->doing_auth( $code );
	}

	private function check_permission( $widget_id, $key, $action ) {
		if ( current_user_can( 'manage_options' ) ) {
			return true;
		}

		if ( empty( $widget_id ) ) {
			pnpnd_get_template(
				'notice-card/permission-denied',
				array(
					'title'       => __( 'Permission Denied', 'ninja-drive' ),
					'description' => __( 'You do not have permission to access this file. Widget ID is missing.', 'ninja-drive' ),
					'card_status' => 'error',
				)
			);
			exit;
		}

		if ( Helpers::has_widget_permission( $widget_id, $action, $key ) ) {
			return true;
		}

		pnpnd_get_template(
			'notice-card/permission-denied',
			array(
				'title'       => "#$widget_id - " . __( 'Permission Denied', 'ninja-drive' ),
				'description' => __( 'You do not have permission to access this file.', 'ninja-drive' ),
				'card_status' => 'error',
			)
		);
		exit;
	}

	private function url_validation( $key, $name, $ext ) {
		$file = pnpnd_get_file_by_key( $key );
		if ( is_wp_error( $file ) ) {
			// translators: %s: error message.
			wp_die( esc_html( $file->get_error_message() ), sprintf( esc_html__( 'Error | %s', 'ninja-drive' ), esc_html( $file->get_error_code() ) ), array( 'response' => 404 ) );
		}

		$suffixes = array( '-xs', '-sm', '-md', '-lg', '-xl', '-2xl', '-3xl', '-4xl', '-5xl', '-thumbnail', '-medium', '-large', '-full' );

		$clean_slug = static function ( string $value ) use ( $suffixes ): string {
			return pnpnd_title_to_url_slug( str_replace( $suffixes, '', $value ) );
		};

		$clean_name = $clean_slug( $file['additional_data']['base_name'] ?? $file['name'] ?? '' );
		$clean_name = str_replace( '_', '-', $clean_name );
		$name       = $clean_slug( urldecode( $name ) );
		$name       = str_replace( '_', '-', $name );

		if ( $name !== $clean_name ) {
			wp_safe_redirect( $file['icon'] ?? $this->get_unknown_icon( 'application/octet-stream' ), 302 );
			exit;
		}

		if ( $ext !== $file['extension'] && ( 'zip' !== $ext && 'folder' === $file['extension'] ) ) {
			wp_safe_redirect( $file['icon'] ?? $this->get_unknown_icon( 'application/octet-stream' ), 302 );
			exit;
		}
	}

}
