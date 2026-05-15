<?php

namespace Pninja\ND\App\Feature;

use Pninja\ND\App\Client;
use Pninja\ND\App\File;
use Pninja\ND\Models\Files;
use Pninja\ND\Models\Notices;
use Pninja\ND\Utils\MimeTypeManager;
use WP_Error;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class MediaLinkGenerator {

	private $client;

	public function __construct( Client $client ) {
		$this->client = $client;
	}

	public function preview( $fileKey, $mode = 'preview' ) {
		if ( empty( $fileKey ) ) {
			return new WP_Error( 400, __( 'A file key is required to generate a preview link. Please provide a valid key and try again.', 'ninja-drive' ) );
		}

		$file = Files::getInstance()->getFileByKey( $fileKey );

		if ( is_wp_error( $file ) ) {
			return $file;
		}

		if ( ! ( $file instanceof File ) ) {
			return new WP_Error( 404, __( 'Unable to load file data. Please verify the file key and try again.', 'ninja-drive' ) );
		}

		$fileId          = $file->getId();
		$shortcutDetails = $file->getShortcutDetails();
		$targetId        = $shortcutDetails['targetId'] ?? null;

		if ( $targetId ) {
			$fileId = $targetId;
		} elseif ( ! $file->hasPermission( array( 'reader' ) ) ) {
			$generatePermission = ( new PermissionManager( $this->client ) )->generatePermission( $file );

			if ( is_wp_error( $generatePermission ) ) {
				return $generatePermission;
			}

			if ( ! $generatePermission ) {
				return new WP_Error( 403, __( 'Unable to generate preview link due to insufficient permissions.', 'ninja-drive' ) );
			}
		}

		if ( empty( $fileId ) ) {
			return new WP_Error( 400, __( 'Invalid file ID. Please verify the file key and try again.', 'ninja-drive' ) );
		}

		if ( $file->isDir() ) {
			return "https://drive.google.com/drive/folders/{$fileId}/";
		}

		return $this->generateEmbedUrl( $fileId, $file->getMimeType(), $mode );
	}

	public function download( $fileKey, $format = null ) {
		if ( empty( $fileKey ) ) {
			return new WP_Error( 400, __( 'A file key is required to download a file. Please provide a valid key and try again.', 'ninja-drive' ) );
		}

		$file = Files::getInstance()->getFileByKey( $fileKey );

		if ( is_wp_error( $file ) ) {
			return $file;
		}

		if ( empty( $file ) || ! ( $file instanceof File ) ) {
			return new WP_Error( 404, __( 'Unable to load file data. Please verify the file key and try again.', 'ninja-drive' ) );
		}
		$fileId = $file->getId() ?? null;

		if ( empty( $fileId ) ) {
			return new WP_Error( 400, __( 'Invalid file key. Please verify the file key and try again.', 'ninja-drive' ) );
		}

		$hasPermission = $file->hasPermission( array( 'reader' ) );

		if ( ! $hasPermission ) {
			$generatePermission = ( new PermissionManager( $this->client ) )->generatePermission( $file );
			if ( ! $generatePermission ) {

				return new WP_Error( 403, __( 'Unable to download file due to insufficient permissions.', 'ninja-drive' ) );
			}
		}

		if ( ! empty( $file->isDir() ) ) {
			Notices::getInstance()->add(
				array(
					'title'       => __( 'This file is a directory', 'ninja-drive' ),
					'description' => __( 'This file is a directory. Please download the file as a zip file.', 'ninja-drive' ),
					'type'        => 'warning',
					'fileKey'     => $fileKey,
				)
			);

			return "https://drive.google.com/drive/folders/{$fileId}/?usp=sharing";
		}

		if ( ! empty( $format ) && $format !== $file->getExtension() ) {
			$isExportAble = MimeTypeManager::isExportAble( $file->getExtension(), $format );

			if ( ! $isExportAble ) {
				return new WP_Error( 400, __( 'The requested export format is not available for this file.', 'ninja-drive' ) );
			}
		}

		return $this->getDownloadUrl( $fileId, $file->getExtension(), $format === $file->getExtension() ? null : $format );
	}

	public function generateDownloadLink( $fileKey, $options = array() ) {
		$fileModel = Files::getInstance();

		$file = $fileModel->getFileByKey( $fileKey );

		$isExported = ! empty( $options['exactFormat'] ) && $options['exactFormat'] !== $file->getExtension();

		if ( $isExported ) {
			$isExportAble = MimeTypeManager::isExportAble( $file->getExtension(), $options['exactFormat'] );

			if ( ! $isExportAble ) {
				return new WP_Error( 400, __( 'The requested export format is not available for this file.', 'ninja-drive' ) );
			}
		}

		if ( empty( $file ) || is_wp_error( $file ) ) {
			return new WP_Error( 'file_not_found', __( 'File not found', 'ninja-drive' ) );
		}

		$downloadKey = $fileModel->getDownloadKey(
			$fileKey,
			array(
				'expireIn' => $options['expireIn'] ?? 3600,
				'password' => $options['password'] ?? null,
				'limit'    => $options['limit'] ?? 0,
			)
		);

		if ( is_wp_error( $downloadKey ) ) {
			return $downloadKey;
		}

		if ( empty( $downloadKey ) ) {
			return new WP_Error( 'download_link_error', __( 'Unable to generate download link.', 'ninja-drive' ) );
		}

		$extension = ! empty( $options['exactFormat'] ) ? $options['exactFormat'] : $file->getExtension();

		$link = pnpndGetUrl(
			'download',
			$downloadKey,
			$file->getName(),
			null,
			$extension
		);

		return $link;
	}

	public function generateSharedLink( $fileKey, $options = array() ) {
		$file = Files::getInstance()->getFileByKey( $fileKey );

		if ( empty( $file ) || is_wp_error( $file ) ) {
			return new WP_Error( 'file_not_found', __( 'File not found', 'ninja-drive' ) );
		}

		$sharedKey = Files::getInstance()->getSharedKey(
			$fileKey,
			array(
				'expireIn' => $options['expireIn'] ?? 3600,
				'password' => $options['password'] ?? null,
			)
		);
		if ( empty( $sharedKey ) || is_wp_error( $sharedKey ) ) {
			return new WP_Error( 'shared_link_error', __( 'Unable to generate shared link.', 'ninja-drive' ) );
		}

		$link = pnpndGetUrl(
			'share',
			$sharedKey,
			$file->getName(),
			null,
			$file->getExtension()
		);

		return $link;
	}

	private function generateEmbedUrl( $fileId, $mimeType, $mode = 'preview' ) {
		$editorMimes = MimeTypeManager::EDITOR_MIME_TYPE_MAP;

		$service = $editorMimes[ $mimeType ] ?? null;

		if ( empty( $service ) ) {
			return "https://drive.google.com/file/d/{$fileId}/preview?rm=minimal";
		}

		if ( $service === 'forms' ) {
			return "https://docs.google.com/forms/d/{$fileId}/viewform?embedded=true";
		}

		if ( $mode === 'editable' ) {
			return "https://docs.google.com/{$service}/d/{$fileId}/edit?usp=drivesdk&rm=minimal&embedded=true";
		} elseif ( $mode === 'full-editable' ) {
			return "https://docs.google.com/{$service}/d/{$fileId}/edit?usp=drivesdk&rm=embedded&embedded=true";
		} else {
			return "https://drive.google.com/file/d/{$fileId}/preview?rm=minimal";
		}
	}

	private function getDownloadUrl( $fileId, $type, $format = null ) {
		if ( empty( $fileId ) || empty( $type ) ) {
			return null;
		}

		$fileId = trim( $fileId );
		$type   = strtolower( trim( $type ) );
		$format = $format ? ltrim( strtolower( trim( $format ) ), '.' ) : null;

		$nonExportable = MimeTypeManager::NON_DOWNLOADABLE_TYPES;

		$endpoints = array(
			'document'     => 'https://docs.google.com/feeds/download/documents/export/Export',
			'spreadsheet'  => 'https://docs.google.com/spreadsheets/export',
			'presentation' => 'https://docs.google.com/feeds/download/presentations/Export',
			'drawing'      => 'https://docs.google.com/feeds/download/drawings/Export',
			'script'       => 'https://script.google.com/feeds/download/export',
		);

		if ( ! $format && ! isset( $endpoints[ $type ] ) ) {
			if ( in_array( $type, $nonExportable, true ) ) {
				return null;
			}

			return sprintf(
				'https://drive.google.com/uc?export=download&id=%s',
				urlencode( $fileId )
			);
		}

		if ( ! isset( $endpoints[ $type ] ) ) {
			return null;
		}

		if ( ! $format ) {
			$format = MimeTypeManager::DEFAULT_EXPORT_FORMAT[ $type ] ?? null;
		}

		$formats = MimeTypeManager::CATEGORY_EXPORT_TYPE;
		$mimeMap = MimeTypeManager::EXPORT_MIME_TYPE_MAP;

		if ( isset( $mimeMap[ $format ] ) ) {
			$format = $mimeMap[ $format ];
		}

		if ( ! isset( $formats[ $type ] ) || ! in_array( $format, $formats[ $type ], true ) ) {
			return null;
		}

		$fileId = urlencode( $fileId );

		if ( $type === 'site' ) {
			return sprintf(
				'https://sites.google.com/d/%s/export?exportFormat=%s',
				$fileId,
				$format
			);
		}

		if ( $type === 'script' ) {
			return sprintf(
				'%s?id=%s&format=%s',
				$endpoints[ $type ],
				$fileId,
				$format
			);
		}

		return sprintf(
			'%s?id=%s&exportFormat=%s',
			$endpoints[ $type ],
			$fileId,
			$format
		);
	}
}
