<?php

namespace Pnpnd\ND\App\Feature;

use Pnpnd\ND\App\Client;
use Pnpnd\ND\App\File;
use Pnpnd\ND\Models\Files;
use Pnpnd\ND\Notice;
use Pnpnd\ND\Utils\Mimetype_Manager;
use WP_Error;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class Media_Link_Generator {

	private $client;

	public function __construct( Client $client ) {
		$this->client = $client;
	}

	public function preview( $file_key, $mode = 'preview' ) {
		if ( empty( $file_key ) ) {
			return new WP_Error( 400, __( 'A file key is required to generate a preview link. Please provide a valid key and try again.', 'ninja-drive' ) );
		}

		$file = Files::get_instance()->get_file_by_key( $file_key );

		if ( is_wp_error( $file ) ) {
			return $file;
		}

		if ( ! ( $file instanceof File ) ) {
			return new WP_Error( 404, __( 'Unable to load file data. Please verify the file key and try again.', 'ninja-drive' ) );
		}

		$shortcut_details = $file->get_shortcut_details();
		$target_id        = $shortcut_details['target_id'] ?? null;

		if ( $target_id ) {
			$file = Files::get_instance()->get_file( $target_id, $file->get_account_id() );
		}

		$file_id = $file->get_id();

		if ( ! $file->has_permission( array( 'reader' ) ) ) {
			$generate_permission = ( new Permission_Manager( $this->client ) )->generate_permission( $file );

			if ( is_wp_error( $generate_permission ) ) {
				return $generate_permission;
			}

			if ( ! $generate_permission ) {
				return new WP_Error( 403, __( 'Unable to generate preview link due to insufficient permissions.', 'ninja-drive' ) );
			}
		}

		if ( empty( $file_id ) ) {
			return new WP_Error( 400, __( 'Invalid file ID. Please verify the file key and try again.', 'ninja-drive' ) );
		}

		if ( $file->is_dir() ) {
			return "https://drive.google.com/drive/folders/{$file_id}/";
		}

		return $this->generate_embed_url( $file_id, $file->get_mimetype(), $mode );
	}

	public function download( $file_key, $format = null ) {
		if ( empty( $file_key ) ) {
			return new WP_Error( 400, __( 'A file key is required to download a file. Please provide a valid key and try again.', 'ninja-drive' ) );
		}

		$file = Files::get_instance()->get_file_by_key( $file_key );

		if ( is_wp_error( $file ) ) {
			return $file;
		}

		if ( empty( $file ) || ! ( $file instanceof File ) ) {
			return new WP_Error( 404, __( 'Unable to load file data. Please verify the file key and try again.', 'ninja-drive' ) );
		}
		$file_id = $file->get_id() ?? null;

		if ( empty( $file_id ) ) {
			return new WP_Error( 400, __( 'Invalid file key. Please verify the file key and try again.', 'ninja-drive' ) );
		}

		$has_permission = $file->has_permission( array( 'reader' ) );

		if ( ! $has_permission ) {
			$generate_permission = ( new Permission_Manager( $this->client ) )->generate_permission( $file );
			if ( ! $generate_permission ) {

				return new WP_Error( 403, __( 'Unable to download file due to insufficient permissions.', 'ninja-drive' ) );
			}
		}

		if ( ! empty( $file->is_dir() ) ) {
			pnpnd_notify(
				Notice::TYPE_WARNING,
				__( 'This file is a directory', 'ninja-drive' ),
				__( 'This file is a directory. Please download the file as a zip file.', 'ninja-drive' ),
				array( 'file_key' => $file_key )
			);

			return "https://drive.google.com/drive/folders/{$file_id}/?usp=sharing";
		}

		if ( ! empty( $format ) && $format !== $file->get_extension() ) {
			$is_exportable = MimeType_Manager::is_exportable( $file->get_extension(), $format );

			if ( ! $is_exportable ) {
				return new WP_Error( 400, __( 'The requested export format is not available for this file.', 'ninja-drive' ) );
			}
		}

		return $this->get_download_url( $file_id, $file->get_extension(), $format === $file->get_extension() ? null : $format );
	}

	public function generate_download_link( $file_key, $options = array() ) {
		$file_model = Files::get_instance();

		$file = $file_model->get_file_by_key( $file_key );

		$is_exported = ! empty( $options['exact_format'] ) && $options['exact_format'] !== $file->get_extension();

		if ( $is_exported ) {
			$is_exportable = MimeType_Manager::is_exportable( $file->get_extension(), $options['exact_format'] );

			if ( ! $is_exportable ) {
				return new WP_Error( 400, __( 'The requested export format is not available for this file.', 'ninja-drive' ) );
			}
		}

		if ( empty( $file ) || is_wp_error( $file ) ) {
			return new WP_Error( 'file_not_found', __( 'File not found', 'ninja-drive' ) );
		}

		$download_key = $file_model->get_download_key(
			$file_key,
			array(
				'expire_in' => $options['expire_in'] ?? 3600,
				'password'  => $options['password'] ?? null,
				'limit'     => $options['limit'] ?? 0,
			)
		);

		if ( is_wp_error( $download_key ) ) {
			return $download_key;
		}

		if ( empty( $download_key ) ) {
			return new WP_Error( 'download_link_error', __( 'Unable to generate download link.', 'ninja-drive' ) );
		}

		$extension = ! empty( $options['exact_format'] ) ? $options['exact_format'] : $file->get_extension();

		$link = pnpnd_get_url(
			'download',
			$download_key,
			$file->get_name(),
			null,
			$extension
		);

		return $link;
	}

	public function generate_shared_link( string $file_key, $options = array() ) {
		$file = Files::get_instance()->get_file_by_key( $file_key );

		if ( empty( $file ) || is_wp_error( $file ) ) {
			return new WP_Error( 'file_not_found', __( 'File not found', 'ninja-drive' ) );
		}

		$shared_key = Files::get_instance()->get_shared_key(
			$file_key,
			array(
				'expire_in' => $options['expire_in'] ?? 3600,
				'password'  => $options['password'] ?? null,
			)
		);
		if ( empty( $shared_key ) || is_wp_error( $shared_key ) ) {
			return new WP_Error( 'shared_link_error', __( 'Unable to generate shared link.', 'ninja-drive' ) );
		}

		$link = pnpnd_get_url(
			'share',
			$shared_key,
			$file->get_name(),
			null,
			$file->get_extension()
		);

		return $link;
	}

	private function generate_embed_url( $file_id, $mime_type, $mode = 'preview' ) {
		$editor_mimes = MimeType_Manager::EDITOR_MIME_TYPE_MAP;

		$service = $editor_mimes[ $mime_type ] ?? null;

		if ( empty( $service ) ) {
			return "https://drive.google.com/file/d/{$file_id}/preview?rm=minimal";
		}

		if ( 'forms' === $service ) {
			return "https://docs.google.com/forms/d/{$file_id}/viewform?embedded=true";
		}

		if ( 'editable' === $mode ) {
			return "https://docs.google.com/{$service}/d/{$file_id}/edit?usp=drivesdk&rm=minimal&embedded=true";
		} elseif ( 'full-editable' === $mode ) {
			return "https://docs.google.com/{$service}/d/{$file_id}/edit?usp=drivesdk&rm=embedded&embedded=true";
		} else {
			return "https://drive.google.com/file/d/{$file_id}/preview?rm=minimal";
		}
	}

	private function get_download_url( $file_id, $type, $format = null ) {
		if ( empty( $file_id ) || empty( $type ) ) {
			return null;
		}

		$file_id = trim( $file_id );
		$type    = strtolower( trim( $type ) );
		$format  = $format ? ltrim( strtolower( trim( $format ) ), '.' ) : null;

		$non_exportable = MimeType_Manager::NON_DOWNLOADABLE_TYPES;

		$endpoints = array(
			'document'     => 'https://docs.google.com/feeds/download/documents/export/Export',
			'spreadsheet'  => 'https://docs.google.com/spreadsheets/export',
			'presentation' => 'https://docs.google.com/feeds/download/presentations/Export',
			'drawing'      => 'https://docs.google.com/feeds/download/drawings/Export',
			'script'       => 'https://script.google.com/feeds/download/export',
		);

		if ( ! $format && ! isset( $endpoints[ $type ] ) ) {
			if ( in_array( $type, $non_exportable, true ) ) {
				return null;
			}

			return sprintf(
				'https://drive.google.com/uc?export=download&id=%s',
				urlencode( $file_id )
			);
		}

		if ( ! isset( $endpoints[ $type ] ) ) {
			return null;
		}

		if ( ! $format ) {
			$format = MimeType_Manager::DEFAULT_EXPORT_FORMAT[ $type ] ?? null;
		}

		$formats  = MimeType_Manager::CATEGORY_EXPORT_TYPE;
		$mime_map = MimeType_Manager::EXPORT_MIME_TYPE_MAP;

		if ( isset( $mime_map[ $format ] ) ) {
			$format = $mime_map[ $format ];
		}

		if ( ! isset( $formats[ $type ] ) || ! in_array( $format, $formats[ $type ], true ) ) {
			return null;
		}

		$file_id = urlencode( $file_id );

		if ( 'site' === $type ) {
			return sprintf(
				'https://sites.google.com/d/%s/export?exportFormat=%s',
				$file_id,
				$format
			);
		}

		if ( 'script' === $type ) {
			return sprintf(
				'%s?id=%s&format=%s',
				$endpoints[ $type ],
				$file_id,
				$format
			);
		}

		return sprintf(
			'%s?id=%s&exportFormat=%s',
			$endpoints[ $type ],
			$file_id,
			$format
		);
	}
}
