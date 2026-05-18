<?php

namespace Pnpnd\ND;

use function array_slice;
use function count;
use function in_array;
use function is_array;

use Pnpnd\ND\App\App;
use Pnpnd\ND\App\Authorization;
use Pnpnd\ND\Models\Files;
use Pnpnd\ND\Utils\Helpers;
use Pnpnd\ND\Utils\MimeTypeManager;
use Pnpnd\ND\Utils\Singleton;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class Content {

	use Singleton;

	private $widgetId;

	private function doHooks() {
		add_filter( 'query_vars', array( $this, 'addQueryVars' ) );
		add_action( 'template_redirect', array( $this, 'redirectTemplate' ) );
	}

	public function addQueryVars( $vars ) {
		return array_merge(
			$vars,
			array(
				'pnpnd-share',
				'pnpnd-thumbnail',
				'pnpnd-action',
				'pnpnd-key',
				'pnpnd-name',
				'pnpnd-ext',
				'authorization',
				'code',
			)
		);
	}

	public function redirectTemplate() {
		foreach ( array(
			'authorization'   => fn ( $val ) => $this->doingAuth(
				$val,
				get_query_var( 'code', '' )
			),
			'pnpnd-thumbnail' => fn ( $val ) => $this->thumbnailHash( $val ),
			'pnpnd-action'    => fn ( $val ) => $this->url(
				$val,
				get_query_var( 'pnpnd-key', 'full' ),
				get_query_var( 'pnpnd-name', 'unknown' ),
				get_query_var( 'pnpnd-ext', 'jpg' )
			),
		) as $queryVar => $callback ) {
			$value = get_query_var( $queryVar, false );
			if ( $value ) {
				$callback( sanitize_text_field( wp_unslash( $value ) ) );

				return;
			}
		}
	}

	private function url( $action, $key, $name, $ext ) {
		$explodedAction = explode( '-', $action );
		$action         = reset( $explodedAction );
		$widgetId       = $explodedAction[1] ?? null;

		if ( $action === 'thumbnail' ) {
			$this->thumbnail( $key, $name, $ext, $widgetId );

			exit;
		} elseif ( $action === 'preview' ) {
			$this->preview( $key, $name, $ext, $widgetId );

			exit;
		} elseif ( $action === 'share' ) {
			$this->share( $key, $name, $ext, $widgetId );

			exit;
		} elseif ( $action === 'download' ) {
			$this->download( $key, $name, $ext, $widgetId );

			exit;
		} else {
			wp_die( esc_html__( 'Invalid action specified.', 'ninja-drive' ), esc_html__( 'Error', 'ninja-drive' ), array( 'response' => 400 ) );
		}
	}

	/*
	-------------------------
	 * Helpers
	 * ------------------------- */

	private function safeRedirect( string $url, $cache = HOUR_IN_SECONDS, $status = 302, $referrer = 'no-referrer' ): void {
		if ( ! empty( $referrer ) ) {
            // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			// WP redirect functions (wp_redirect/wp_safe_redirect) cannot set Referrer-Policy headers.
			// This header is required for privacy on cross-origin redirects.
			header( "Referrer-Policy: {$referrer}" );
		}

        // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		// WP redirect functions (wp_redirect/wp_safe_redirect) cannot set Cache-Control headers.
		// This header prevents caching of redirect responses.
		header( "Cache-Control: public, max-age={$cache}" );
		wp_safe_redirect( $url, $status, PNPND_NAME . ' Safe Redirect' );
		exit;
	}

	private function getRawData( string $url ) {
        // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		// WP does not provide a native way to set Referrer-Policy on outgoing HTTP requests.
		// wp_remote_get() does not support custom request headers for Referrer-Policy.
		header( 'Referrer-Policy: no-referrer' );
		$response = wp_remote_get(
			$url,
			array(
				'timeout'     => 15,
				'redirection' => 5,
			)
		);
		if ( is_wp_error( $response ) ) {
			$this->safeRedirect( $this->getUnknownIcon( 'image/jpeg' ), 0 );
			exit;
		}
		$data        = wp_remote_retrieve_body( $response );
		$contentType = wp_remote_retrieve_header( $response, 'content-type' );

		// Whitelist of safe content types to prevent XSS and other security issues
		$allowedContentTypes = array(
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

		// Extract the base content type (remove charset and other parameters)
		$baseContentType = $contentType ? explode( ';', $contentType )[0] : '';
		$baseContentType = trim( $baseContentType );

		if ( $data && in_array( $baseContentType, $allowedContentTypes, true ) ) {
			return array(
				'data'        => $data,
				'contentType' => $baseContentType,
			);
		}

		return false;
	}

	private function denyAccess( ?string $message = null, int $status = 403 ): void {
		if ( $message === null ) {
			$message = __( 'Access denied!', 'ninja-drive' );
		}

		pnpndGetTemplate(
			'notice-card/permission-denied',
			array(
				'title'       => __( 'Error', 'ninja-drive' ),
				'description' => $message,
				'card_status' => 'error',
			)
		);
		exit;
	}

	private function getUnknownIcon( string $mimeType = 'application/octet-stream' ): string {

		// Google Drive provides a special thumbnail for unknown file types, which is more appropriate than a generic icon for files that can't be previewed. The URL pattern is consistent and can be used to get a suitable thumbnail.
		return 'https://drive-thirdparty.googleusercontent.com/128/type/' . $mimeType;
	}

	/*
	-------------------------
	 * Download
	 * ------------------------- */
	public function download( $key, $name, $ext, $widgetId = null ) {
		$explodedKey = explode( '-', $key );
		$fileKey     = $explodedKey[0] ?? null;
		$linkKey     = $explodedKey[1] ?? null;
		if ( ! empty( $fileKey ) && ! empty( $linkKey ) ) {
			return $this->downloadWithGeneratedLink( $fileKey, $linkKey, $name, $ext, $widgetId );
		}

		$this->urlValidation( $key, $name, $ext );

		$this->checkPermission( $widgetId, $key, 'download' );

		$downloadLink = App::getInstance()->download( $key, $ext );

		if ( is_wp_error( $downloadLink ) ) {
			pnpndGetTemplate(
				'notice-card/permission-denied',
				array(
					'title'       => __( 'Error', 'ninja-drive' ),
					'description' => $downloadLink->get_error_message(),
					'card_status' => 'error',
				)
			);
			exit;
		}

		wp_safe_redirect( $downloadLink );
		exit;
	}

	/**
	 * Summary of downloadWithGeneratedLink
	 *
	 * @param string      $fileKey
	 * @param string      $linkKey
	 * @param string      $name
	 * @param string      $ext
	 * @param string|null $widgetId
	 *
	 * @return never
	 */
	private function downloadWithGeneratedLink( string $fileKey, string $linkKey, string $name, string $ext, ?string $widgetId = null ) {
		if ( empty( $fileKey ) || empty( $linkKey ) ) {
			wp_die( esc_html__( 'File key is required.', 'ninja-drive' ), esc_html__( 'Error', 'ninja-drive' ), array( 'response' => 400 ) );
		}

		$this->urlValidation( $fileKey, $name, $ext );
		$password = '';

		if ( isset( $_SERVER['REQUEST_METHOD'] ) && sanitize_text_field( wp_unslash( $_SERVER['REQUEST_METHOD'] ) ) === 'POST' && isset( $_POST['pnpnd-password-nonce'] ) && wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['pnpnd-password-nonce'] ) ), 'pnpnd_password_nonce' ) && isset( $_POST['pnpnd-download-password'] ) ) {
			$password = sanitize_text_field( wp_unslash( $_POST['pnpnd-download-password'] ) );
		}

		$isValidLink = Files::getInstance()->validateDownloadLink( "$fileKey-$linkKey", $password );
		if ( empty( $isValidLink ) ) {
			pnpndGetTemplate(
				'notice-card/permission-denied',
				array(
					'title'       => __( 'Invalid Download URL', 'ninja-drive' ),
					'description' => __( 'Invalid or expired download link.', 'ninja-drive' ),
					'card_status' => 'error',
				)
			);
			exit;
		}

		if ( is_wp_error( $isValidLink ) ) {
			if ( $isValidLink->get_error_code() === 'password_required' || $isValidLink->get_error_code() === 'invalid_password' ) {
				pnpndGetTemplate(
					'content-password',
					array(
						'code'      => $isValidLink->get_error_code(),
						'message'   => $isValidLink->get_error_message(),
						'fileKey'   => $fileKey,
						'name'      => $name,
						'fieldName' => 'pnpnd-download-password',
					)
				);
				exit;
			} else {

				wp_die( esc_html( $isValidLink->get_error_message() ), esc_html__( 'Error', 'ninja-drive' ), array( 'response' => 400 ) );
			}
		}

		$downloadLink = App::getInstance()->download( $fileKey, $ext );

		if ( empty( $downloadLink ) ) {
			pnpndGetTemplate(
				'notice-card/permission-denied',
				array(
					'title'       => __( 'Error', 'ninja-drive' ),
					'description' => __( 'Something went wrong to download the file.', 'ninja-drive' ),
					'card_status' => 'error',
				)
			);
			exit;
		}

		if ( is_wp_error( $downloadLink ) ) {
			pnpndGetTemplate(
				'notice-card/permission-denied',
				array(
					'title'       => __( 'Error', 'ninja-drive' ),
					'description' => $downloadLink->get_error_message(),
					'card_status' => 'error',
				)
			);
			exit;
		}

		wp_safe_redirect( $downloadLink );
		exit;
	}

	/*
	-------------------------
	 * Preview
	 * ------------------------- */
	private function preview( $key, $name, $ext, $widgetId = null ): void {
		$isVideo = MimeTypeManager::isVideo( $ext );

		$this->urlValidation( $key, $name, $ext );
		$this->checkPermission( $widgetId, $key, 'preview' );

		$file = pnpndGetFileByKey( $key );

		if ( is_wp_error( $file ) ) {
			$this->safeRedirect( $this->getUnknownIcon( 'image/jpeg' ), 0 );
		}

		$previewLink = '';

		if ( empty( $previewLink ) ) {
			$previewLink = App::getInstance( $file['accountId'] )->preview( $file['fileKey'] );
		}

		if ( is_wp_error( $previewLink ) ) {
			$message = __( 'Unable to generate preview link.', 'ninja-drive' );
			if ( current_user_can( 'manage_options' ) ) {
				$message .= ' ' . $previewLink->get_error_message();
			}
			$this->denyAccess( esc_html( $message ), 500 );
		}

		if ( empty( $previewLink ) ) {
			$this->safeRedirect( $this->getUnknownIcon( $file['mimeType'] ?? 'image/jpeg' ), 0 );
		}
		$referrer = $isVideo ? '' : 'no-referrer';

		$this->safeRedirect( $previewLink, 0, 302, $referrer );
	}

	private function processThumbnail( array $file, string $size = '5xl', string $mimeType = 'application/octet-stream' ): void {
		if ( ! is_array( $file ) || empty( $file ) || is_wp_error( $file ) ) {
			$this->safeRedirect( $this->getUnknownIcon( $file['mimeType'] ?? $mimeType ), DAY_IN_SECONDS );
		}

		$lifeTime = Helpers::checkLifeTime( $file['updatedAt'] ?? '' );

		if ( $lifeTime <= 0 || empty( $file['thumbnail'] ) ) {
			$file = App::getInstance( $file['accountId'] )->getFile( $file['id'], $file['accountId'], true );
			if ( is_wp_error( $file ) || empty( $file ) ) {
				$this->safeRedirect( $this->getUnknownIcon( $mimeType ), 0 );
			}

			$lifeTime = Helpers::checkLifeTime( $file['updatedAt'] ?? '' );
		}

		if ( empty( $file ) || empty( $file['thumbnail'] ) ) {
			$this->safeRedirect( $this->getUnknownIcon( $file['mimeType'] ?? $mimeType ), DAY_IN_SECONDS );
		}

		$stringSize   = pnpndSizeToString( $size );
		$thumbnailUrl = str_replace( '=s220', $stringSize ? "={$stringSize}" : '', $file['thumbnail'] );

		$redirection = Helpers::getSetting( 'integrations.mediaLibrary.redirection', true );

		if ( $redirection ) {
			$this->safeRedirect( apply_filters( 'pnpnd_thumbnail_url', $thumbnailUrl ), $lifeTime );
		} else {
			$thumbnailData = $this->getRawData( apply_filters( 'pnpnd_thumbnail_url', $thumbnailUrl ) );

			$rawData     = $thumbnailData['data'] ?? false;
			$contentType = $thumbnailData['contentType'] ?? $mimeType;
			if ( ! $rawData ) {
				$this->safeRedirect( $this->getUnknownIcon( $file['mimeType'] ?? $mimeType ), DAY_IN_SECONDS );
			}

			$cache     = new Cache();
			$extension = MimeTypeManager::isImage( $file['mimeType'] ?? '' ) ? MimeTypeManager::getExtension( $file['mimeType'] ) : 'webp';
			$cache->saveFile( $rawData, $file['fileKey'], $size, $extension );

            // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			// Binary image data is streamed directly to the browser. WP has no native function
			// to set Content-Type headers when echoing raw binary output. header() is required.
			header( "Content-Type: {$contentType}" );
            // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			// Cache-Control for browser caching of proxied remote thumbnails.
			// WP does not provide an alternative for setting cache headers during binary streaming.
			header( "Cache-Control: public, max-age={$lifeTime}" );
			// Binary data, not output, so no escaping needed
            // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			echo $rawData;
		}
	}

	public function thumbnail( $key, $name, $ext, $widgetId = null, $size = '2xl' ) {
		$parts = explode( '-', $name );

		$availableSizes = pnpndGetAvailableThumbnailSizes();
		$sizeKeys       = array_map( 'strval', array_keys( $availableSizes ) );

		if ( count( $parts ) > 1 ) {
			$possibleSize = strtolower( end( $parts ) );
			$possibleSize = str_replace( array( 'thumbnail', 'medium', 'large', 'full' ), array( 'lg', 'xl', '4xl', '5xl' ), $possibleSize );

			if ( in_array( $possibleSize, $sizeKeys, true ) ) {
				$size = $possibleSize;
				$name = strtolower( implode( '-', array_slice( $parts, 0, -1 ) ) );
			}
		}

		if ( $ext === 'json' || $ext === 'zip' || $ext === 'script' ) {
			$folderIcon = $this->getUnknownIcon( pnpndGetMimeTypeByExtension( $ext ) );
            // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			// Binary image data is streamed directly. WP has no native alternative
			// for setting Content-Type when echoing raw binary data.
			header( 'Content-Type: image/jpeg' );
            // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			// Cache-Control for browser caching of fallback folder icons.
			header( 'Cache-Control: public, max-age=' . DAY_IN_SECONDS );
			wp_safe_redirect( $folderIcon, 302 );
			exit;
		}

		$cache         = new Cache();
		$cachedFileRaw = $cache->getFileRaw( $key, $size, $ext );
		if ( $cachedFileRaw ) {
            // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			// Binary file data is streamed directly from cache. WP has no native alternative
			// for setting Content-Type when echoing raw binary data.
			header( 'Content-Type: ' . MimeTypeManager::getMimeType( $ext ) );
            // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			// Cache-Control for browser caching of cached file output.
			header( 'Cache-Control: public, max-age=' . MONTH_IN_SECONDS );
			// Binary data, not output, so no escaping needed
            // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			echo $cachedFileRaw;
			exit;
		}

		$file = pnpndGetFileByKey( $key );

		if ( is_wp_error( $file ) ) {

			$fileMimeType = is_wp_error( $file ) ? 'unknown' : ( $file['mimeType'] ?? 'unknown' );

			$folderIcon = $this->getUnknownIcon( $fileMimeType );
			wp_safe_redirect( $folderIcon, 302 );
			exit;
		}

		if ( $file['mimeType'] === 'application/vnd.google-apps.folder' ) {
			$folderIcon = str_replace( '32', '128', $file['icon'] ?? '' ) ?? $this->getUnknownIcon( $file['mimeType'] );
			wp_safe_redirect( $folderIcon, 302 );
			exit;
		}

		$basename    = $file['additionalData']['baseName'] ?? '';
		$cleanName   = pnpndTitleToUrlSlug( $basename );
		$cleanName   = str_replace( '_', '-', $cleanName );
		$decodedName = urldecode( $name );
		$decodedName = str_replace( '_', '-', $decodedName );

		if ( $decodedName !== $cleanName ) {
			wp_safe_redirect( $file['icon'] ?? '', 302 );
			exit;
		}

		$this->checkPermission( $widgetId, $key, 'thumbnail' );

		if ( $file['mimeType'] === 'application/vnd.google-apps.shortcut' && ! empty( $file['additionalData']['shortcutDetails']['targetId'] ?? '' ) ) {
			$file = App::getInstance()->getFile( $file['additionalData']['shortcutDetails']['targetId'], $file['accountId'] );

			if ( is_wp_error( $file ) ) {
				$this->safeRedirect( $this->getUnknownIcon( 'image/jpeg' ), 0 );
				exit;
			}
		}

		$this->processThumbnail( $file, $size, 'image/jpeg' );
	}

	private function share( $combinedKey, $name, $ext, $widgetId = null ): void {
		$explodedKey = explode( '-', $combinedKey );
		$fileKey     = $explodedKey[0] ?? null;
		$linkKey     = $explodedKey[1] ?? null;

		if ( empty( $fileKey ) || empty( $linkKey ) ) {
			wp_die( esc_html__( 'File key is required.', 'ninja-drive' ), esc_html__( 'Error', 'ninja-drive' ), array( 'response' => 400 ) );
		}

		$this->urlValidation( $fileKey, $name, $ext );
		$password = '';

		if ( isset( $_SERVER['REQUEST_METHOD'] ) && sanitize_text_field( wp_unslash( $_SERVER['REQUEST_METHOD'] ) ) === 'POST' && isset( $_POST['pnpnd-password-nonce'] ) && wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['pnpnd-password-nonce'] ) ), 'pnpnd_password_nonce' ) && isset( $_POST['pnpnd-download-password'] ) ) {
			$password = sanitize_text_field( wp_unslash( $_POST['pnpnd-download-password'] ) );
		}

		$isValidLink = Files::getInstance()->validateSharedLink( "$fileKey-$linkKey", $password );

		if ( empty( $isValidLink ) ) {
			wp_die( esc_html__( 'Invalid or expired share link.', 'ninja-drive' ), esc_html__( 'Error', 'ninja-drive' ), array( 'response' => 400 ) );
		}

		if ( is_wp_error( $isValidLink ) ) {
			if ( $isValidLink->get_error_code() === 'password_required' || $isValidLink->get_error_code() === 'invalid_password' ) {
				pnpndGetTemplate(
					'content-password',
					array(
						'code'      => $isValidLink->get_error_code(),
						'message'   => $isValidLink->get_error_message(),
						'fileKey'   => $fileKey,
						'name'      => $name,
						'fieldName' => 'pnpnd-download-password',
					)
				);
				exit;
			} else {

				wp_die( esc_html( $isValidLink->get_error_message() ), esc_html__( 'Error', 'ninja-drive' ), array( 'response' => 400 ) );
			}
		}

		$embedLink = App::getInstance()->preview( $fileKey );

		if ( $ext === 'folder' || $ext === 'zip' ) {
			wp_safe_redirect( $embedLink, 302 );
			exit;
		}

		echo '<iframe src="' . esc_url( $embedLink ) . '" width="100%" height="100%" style="border:none;"></iframe>';
		exit;
	}

	private function doingAuth( $action, $code ) {

		if ( 'ninja-drive' !== $action || empty( $code ) ) {
			return;
		}

		Authorization::getInstance()->doingAuth( $code );
	}

	private function checkPermission( $widgetId, $key, $action ) {
		if ( current_user_can( 'manage_options' ) ) {
			return true;
		}

		if ( empty( $widgetId ) ) {
			pnpndGetTemplate(
				'notice-card/permission-denied',
				array(
					'title'       => __( 'Permission Denied', 'ninja-drive' ),
					'description' => __( 'You do not have permission to access this file. Widget ID is missing.', 'ninja-drive' ),
					'card_status' => 'error',
				)
			);
			exit;
		}

		if ( Helpers::hasWidgetPermission( $widgetId, $action, $key ) ) {
			return true;
		}

		pnpndGetTemplate(
			'notice-card/permission-denied',
			array(
				'title'       => "#$widgetId - " . __( 'Permission Denied', 'ninja-drive' ),
				'description' => __( 'You do not have permission to access this file.', 'ninja-drive' ),
				'card_status' => 'error',
			)
		);
		exit;
	}

	private function urlValidation( $key, $name, $ext ) {
		$file = pnpndGetFileByKey( $key );
		if ( is_wp_error( $file ) ) {
			/* translators: %s: error code returned by the file lookup */
			wp_die( esc_html( $file->get_error_message() ), sprintf( esc_html__( 'Error | %s', 'ninja-drive' ), esc_html( $file->get_error_code() ) ), array( 'response' => 404 ) );
		}

		$suffixes = array( '-xs', '-sm', '-md', '-lg', '-xl', '-2xl', '-3xl', '-4xl', '-5xl', '-thumbnail', '-medium', '-large', '-full' );

		$cleanSlug = static function ( string $value ) use ( $suffixes ): string {
			return pnpndTitleToUrlSlug( str_replace( $suffixes, '', $value ) );
		};

		$cleanName = $cleanSlug( $file['additionalData']['baseName'] ?? $file['name'] ?? '' );
		$cleanName = str_replace( '_', '-', $cleanName );
		$name      = $cleanSlug( urldecode( $name ) );
		$name      = str_replace( '_', '-', $name );

		if ( $name !== $cleanName ) {
			wp_safe_redirect( $file['icon'] ?? $this->getUnknownIcon( 'application/octet-stream' ), 302 );
			exit;
		}

		if ( $ext !== $file['extension'] && ( $ext !== 'zip' && $file['extension'] === 'folder' ) ) {
			wp_safe_redirect( $file['icon'] ?? $this->getUnknownIcon( 'application/octet-stream' ), 302 );
			exit;
		}
	}

	private function thumbnailHash( $dataString ) {
		if ( $dataString ) {
			$thumbnail = Helpers::decode( $dataString );
			$thumbnail = json_decode( $thumbnail, true );
			$mimeType  = $thumbnail['mimeType'] ?? 'application/octet-stream';

			$unknownIcon = $this->getUnknownIcon( $mimeType );

			if ( empty( $thumbnail['key'] ) || empty( $thumbnail['sz'] ) ) {
				$this->safeRedirect( $unknownIcon, 0 );
				exit;
			}

			$file = App::getInstance()->getFileByKey( $thumbnail['key'] ?? '' );

			if ( is_wp_error( $file ) || empty( $file ) ) {
				$this->safeRedirect( $unknownIcon, 0 );
				exit;
			}

			$this->processThumbnail( $file, '3xl', 'image/jpeg' );
		}
	}
}
