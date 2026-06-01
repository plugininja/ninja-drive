<?php

namespace Pnpnd\ND\API\Controllers;

use Exception;
use Pnpnd\ND\API\BaseController;
use Pnpnd\ND\App\App;
use Pnpnd\ND\Models\Files as ModelFiles;
use Pnpnd\ND\Models\Widget;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class File extends BaseController {

	public function __construct() {
		parent::__construct( 'pnpnd/v1', 'file' );
	}

	public function managePermission( WP_REST_Request $request ): bool {
		if ( $this->hasPermission() ) {
			return true;
		}

		return false;
	}

	public function register_routes(): void {

		register_rest_route(
			$this->namespace,
			"{$this->rest_base}/rename",
			array(
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'rename' ),
					'permission_callback' => array( $this, 'managePermission' ),
					'args'                => array(
						'fileKey'  => array(
							'type'              => 'string',
							'required'          => true,
							'sanitize_callback' => 'sanitize_text_field',
						),
						'name'     => array(
							'type'              => 'string',
							'required'          => true,
							'sanitize_callback' => 'sanitize_text_field',
						),
						'widgetId' => array(
							'type'              => 'integer',
							'required'          => false,
							'default'           => null,
							'sanitize_callback' => 'absint',
						),
					),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			"{$this->rest_base}/open-in-drive/(?P<fileKey>[^/]+)",
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'openInDrive' ),
					'permission_callback' => array( $this, 'managePermission' ),
					'args'                => array(
						'fileKey' => array(
							'type'              => 'string',
							'required'          => true,
							'sanitize_callback' => 'sanitize_text_field',
						),
					),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			"{$this->rest_base}/share/(?P<fileKey>[^/]+)",
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'shareLink' ),
					'permission_callback' => array( $this, 'managePermission' ),
					'args'                => array(
						'expiry'   => array(
							'required'          => false,
							'type'              => 'integer',
							'default'           => 3600,
							'sanitize_callback' => 'absint',
						),
						'password' => array(
							'required'          => false,
							'type'              => 'string',
							'default'           => null,
							'sanitize_callback' => 'sanitize_text_field',
						),
						'widgetId' => array(
							'required'          => false,
							'type'              => 'integer',
							'default'           => null,
							'sanitize_callback' => 'absint',
						),
					),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			"{$this->rest_base}/download/(?P<fileKey>[^/]+)",
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'downloadLink' ),
					'permission_callback' => array( $this, 'managePermission' ),
					'args'                => array(
						'expiry'   => array(
							'required'          => false,
							'type'              => 'integer',
							'default'           => 3600,
							'sanitize_callback' => 'absint',
						),
						'limit'    => array(
							'required'          => false,
							'type'              => 'integer',
							'default'           => null,
							'sanitize_callback' => 'absint',
						),
						'password' => array(
							'required'          => false,
							'type'              => 'string',
							'default'           => null,
							'sanitize_callback' => 'sanitize_text_field',
						),
						'widgetId' => array(
							'required'          => false,
							'type'              => 'integer',
							'default'           => null,
							'sanitize_callback' => 'absint',
						),
					),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			"{$this->rest_base}/upload",
			array(
				array(
					'methods'             => WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'upload' ),
					'permission_callback' => array( $this, 'managePermission' ),
					'args'                => array(
						'name'        => array(
							'type'              => 'string',
							'required'          => true,
							'sanitize_callback' => 'sanitize_text_field',
						),
						'type'        => array(
							'type'              => 'string',
							'required'          => true,
							'sanitize_callback' => 'sanitize_text_field',
						),
						'description' => array(
							'type'              => 'string',
							'required'          => false,
							'default'           => '',
							'sanitize_callback' => 'sanitize_text_field',
						),
						'folderKey'   => array(
							'type'              => 'string',
							'required'          => true,
							'sanitize_callback' => 'sanitize_text_field',
						),
						'size'        => array(
							'type'              => 'integer',
							'required'          => true,
							'sanitize_callback' => 'absint',
						),
						'postId'      => array(
							'type'              => 'integer',
							'required'          => false,
							'default'           => 0,
							'sanitize_callback' => 'absint',
						),
						'queueIndex'  => array(
							'type'              => 'integer',
							'required'          => false,
							'default'           => 0,
							'sanitize_callback' => 'absint',
						),
						'widgetId'    => array(
							'type'              => 'integer',
							'required'          => false,
							'default'           => null,
							'sanitize_callback' => 'absint',
						),
					),
				),
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'getUploadedFile' ),
					'permission_callback' => array( $this, 'managePermission' ),
					'args'                => array(
						'fileId'    => array(
							'type'              => 'string',
							'required'          => true,
							'sanitize_callback' => 'sanitize_text_field',
						),
						'uploadId'  => array(
							'type'              => 'string',
							'required'          => true,
							'sanitize_callback' => 'sanitize_text_field',
						),
						'folderKey' => array(
							'type'              => 'string',
							'required'          => true,
							'sanitize_callback' => 'sanitize_text_field',
						),
						'widgetId'  => array(
							'type'              => 'integer',
							'required'          => false,
							'default'           => null,
							'sanitize_callback' => 'absint',
						),
					),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			"{$this->rest_base}/by-keys",
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'getFiles' ),
					'permission_callback' => array( $this, 'managePermission' ),
					'args'                => array(
						'fileKeys' => array(
							'type'              => 'string',
							'required'          => true,
							'sanitize_callback' => 'sanitize_text_field',
						),
					),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			"{$this->rest_base}/(?P<fileKey>[^/]+)",
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get' ),
					'permission_callback' => array( $this, 'managePermission' ),
					'args'                => array(
						'fileKey' => array(
							'type'              => 'string',
							'required'          => true,
							'sanitize_callback' => 'sanitize_text_field',
						),
						'from'    => array(
							'type'              => 'string',
							'required'          => false,
							'default'           => 'cache',
							'sanitize_callback' => 'sanitize_text_field',
						),
					),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			"{$this->rest_base}/",
			array(
				array(
					'methods'             => WP_REST_Server::DELETABLE,
					'callback'            => array( $this, 'delete' ),
					'permission_callback' => array( $this, 'managePermission' ),
					'args'                => array(
						'fileKeys' => array(
							'type'              => 'string',
							'required'          => true,
							'sanitize_callback' => 'sanitize_text_field',
						),
					),
				),
			)
		);
	}

	public function upload( WP_REST_Request $request ): WP_REST_Response {
		try {
			$name        = $request->get_param( 'name' ) ?? '';
			$type        = $request->get_param( 'type' ) ?? '';
			$description = $request->get_param( 'description' ) ?? '';
			$folderKey   = $request->get_param( 'folderKey' ) ?? '';
			$size        = $request->get_param( 'size' ) ?? 0;
			$postId      = $request->get_param( 'postId' ) ?? 0;
			$queueIndex  = $request->get_param( 'queueIndex' ) ?? 0;
			$widgetId    = $request->get_param( 'widgetId' ) ?? 0;

			if ( empty( $name ) || empty( $type ) || empty( $folderKey ) || empty( $size ) ) {
				return $this->errorResponse( 'Missing required parameters', self::HTTP_BAD_REQUEST );
			}

			if ( ! empty( $widgetId ) ) {
				$widget = Widget::getInstance()->getWidget( $widgetId );

				if ( is_wp_error( $widget ) ) {
					return $this->errorResponse( $widget->get_error_message(), 500 );
				}

				if ( '/' === $folderKey || empty( $folderKey ) || 'my-drive' === $folderKey ) {
					$files = $widget['data']['source']['fileKeys'] ?? array();
					if ( empty( $files ) ) {
						return $this->errorResponse( 'No files found in the widget for root upload.', 400 );
					}

					if ( $widget['type'] === 'file-browser' ) {

						if ( $widget['data']['advanced']['fileBrowser']['headerOptions']['rootUpload'] ?? false ) {
							$folderKey = 'my-drive';
						} else {
							return $this->errorResponse( 'Root upload is not allowed for this widget.', self::HTTP_FORBIDDEN );
						}
					}
				}

				$template = $widget['data']['advanced']['fileUploader']['renameFile'] ?? '';
				if ( $template ) {
					$name = $this->generateFileNameFromTemplate( $template, $name, $queueIndex, $postId );
				}
			}

			$resumeUrl = App::getInstance()->upload( $name, $type, $folderKey, '', $description, $size );

			if ( is_wp_error( $resumeUrl ) ) {
				return $this->errorResponse( $resumeUrl->get_error_message(), self::HTTP_INTERNAL_SERVER_ERROR );
			}

			return $this->successResponse( $resumeUrl, 'Resume URL generated successfully' );
		} catch ( Exception $e ) {
			return $this->handleException( $e, 'Failed to generate resume URL' );
		}
	}

	public function getUploadedFile( WP_REST_Request $request ): WP_REST_Response {
		try {
			$fileId    = $request->get_param( 'fileId' ) ?? '';
			$token     = $request->get_param( 'uploadId' ) ?? '';
			$folderKey = $request->get_param( 'folderKey' ) ?? '';
			$widgetId  = $request->get_param( 'widgetId' ) ?? 0;

			if ( empty( $fileId ) || empty( $token ) || empty( $folderKey ) ) {
				return $this->errorResponse( 'Missing required parameters', self::HTTP_BAD_REQUEST );
			}

			$file = App::getInstance()->getUploadedFile( $fileId, $token, $folderKey );

			if ( is_wp_error( $file ) ) {
				return $this->errorResponse( $file->get_error_message(), self::HTTP_INTERNAL_SERVER_ERROR );
			}

			if ( empty( $file ) ) {
				return $this->errorResponse( 'File not found', self::HTTP_NOT_FOUND );
			}

			if ( ! empty( $widgetId ) && ! is_wp_error( $file ) && $folderKey === 'my-drive' ) {
				$widget       = Widget::getInstance()->getWidget( $widgetId );
				$isRootUpload = $widget['data']['advanced']['fileBrowser']['headerOptions']['rootUpload'] ?? false;

				$fileKey = $file['fileKey'] ?? '';

				if ( $widget['type'] === 'file-browser' && $isRootUpload && $fileKey ) {
					Widget::getInstance()->insertFile( $widgetId, $fileKey );
				}
			}

			return $this->successResponse( $file, 'File retrieved successfully' );
		} catch ( Exception $e ) {
			return $this->handleException( $e, 'Failed to retrieve uploaded file' );
		}
	}

	public function get( WP_REST_Request $request ): WP_REST_Response {
		try {
			$fileKey = $request->get_param( 'fileKey' );
			$from    = $request->get_param( 'from' ) ?? 'cache';

			if ( empty( $fileKey ) ) {
				return $this->errorResponse( 'File key is required', self::HTTP_BAD_REQUEST );
			}

			$file = App::getInstance()->getFileByKey( $fileKey, $from === 'server' );
			if ( empty( $file ) ) {
				return $this->errorResponse( 'File not found', self::HTTP_NOT_FOUND );
			}

			if ( is_wp_error( $file ) ) {
				return $this->errorResponse( $file->get_error_message(), self::HTTP_INTERNAL_SERVER_ERROR );
			}

			return $this->successResponse( $file, 'File retrieved successfully' );

		} catch ( Exception $e ) {
			return $this->handleException( $e, 'Failed to retrieve file' );
		}
	}

	public function delete( WP_REST_Request $request ): WP_REST_Response {
		try {
			$fileKeys = $request->get_param( 'fileKeys' );

			if ( empty( $fileKeys ) ) {
				return $this->errorResponse( 'File key is required', self::HTTP_BAD_REQUEST );
			}

			$file = App::getInstance()->delete( $fileKeys );

			if ( is_wp_error( $file ) ) {
				return $this->errorResponse( $file->get_error_message(), self::HTTP_INTERNAL_SERVER_ERROR );
			}

			return $this->successResponse( $file, 'File deleted successfully' );
		} catch ( Exception $e ) {
			return $this->handleException( $e, 'Failed to delete file' );
		}
	}
	public function rename( WP_REST_Request $request ): WP_REST_Response {
		try {
			$fileKey  = $request->get_param( 'fileKey' );
			$name     = $request->get_param( 'name' );
			$widgetId = $request->get_param( 'widgetId' );

			if ( empty( $fileKey ) || empty( $name ) ) {
				return $this->errorResponse( 'File key and new name are required', self::HTTP_BAD_REQUEST );
			}

			$folder = App::getInstance()->rename( $fileKey, $name );

			if ( empty( $folder ) ) {
				return $this->errorResponse( 'Failed to rename folder', self::HTTP_INTERNAL_SERVER_ERROR );
			}

			if ( is_wp_error( $folder ) ) {
				return $this->errorResponse( $folder->get_error_message(), self::HTTP_INTERNAL_SERVER_ERROR );
			}

			return $this->successResponse( $folder, 'Folder renamed successfully' );
		} catch ( Exception $e ) {
			return $this->handleException( $e, 'Failed to rename folder' );
		}
	}
	public function openInDrive( WP_REST_Request $request ): WP_REST_Response {
		try {
			$fileKey = $request->get_param( 'fileKey' );

			if ( empty( $fileKey ) ) {
				return $this->errorResponse( 'File key is required', self::HTTP_BAD_REQUEST );
			}

			$shareLink = App::getInstance()->preview( $fileKey );

			if ( is_wp_error( $shareLink ) ) {
				return $this->errorResponse( $shareLink->get_error_message(), self::HTTP_INTERNAL_SERVER_ERROR );
			}

			return $this->successResponse( $shareLink, 'Preview retrieved successfully' );
		} catch ( Exception $e ) {
			return $this->handleException( $e, 'Failed to retrieve preview' );
		}
	}

	public function shareLink( WP_REST_Request $request ): WP_REST_Response {
		try {
			$fileKey  = $request->get_param( 'fileKey' );
			$expireIn = $request->get_param( 'expireIn' );
			$password = $request->get_param( 'password' );
			$widgetId = $request->get_param( 'widgetId' );

			if ( empty( $fileKey ) ) {
				return $this->errorResponse( 'File key is required', self::HTTP_BAD_REQUEST );
			}

			$shareLink = App::getInstance()->generateSharedLink(
				$fileKey,
				array(
					'expireIn' => $expireIn,
					'password' => $password,
				)
			);

			if ( is_wp_error( $shareLink ) ) {
				return $this->errorResponse( $shareLink->get_error_message(), self::HTTP_INTERNAL_SERVER_ERROR );
			}

			return $this->successResponse( $shareLink, 'Share link retrieved successfully' );
		} catch ( Exception $e ) {
			return $this->handleException( $e, 'Failed to retrieve share link' );
		}
	}

	public function downloadLink( WP_REST_Request $request ): WP_REST_Response {
		try {
			$fileKey     = $request->get_param( 'fileKey' );
			$expireIn    = $request->get_param( 'expireIn' );
			$limit       = $request->get_param( 'limit' );
			$password    = $request->get_param( 'password' );
			$exactFormat = $request->get_param( 'exactFormat' );
			$widgetId    = $request->get_param( 'widgetId' );

			if ( empty( $fileKey ) ) {
				return $this->errorResponse( 'File key is required', self::HTTP_BAD_REQUEST );
			}

			$shareLink = App::getInstance()->generateDownloadLink(
				$fileKey,
				array(
					'expireIn'    => $expireIn,
					'password'    => $password,
					'limit'       => $limit,
					'exactFormat' => $exactFormat,
				)
			);

			if ( is_wp_error( $shareLink ) ) {
				return $this->errorResponse( $shareLink->get_error_message(), self::HTTP_INTERNAL_SERVER_ERROR );
			}

			return $this->successResponse( $shareLink, 'Download link retrieved successfully' );
		} catch ( Exception $e ) {
			return $this->handleException( $e, 'Failed to retrieve download link' );
		}
	}

	public function getFiles( WP_REST_Request $request ): WP_REST_Response {
		try {
			$fileKeys = explode( ',', $request->get_param( 'fileKeys' ) );

			if ( empty( $fileKeys ) ) {
				return $this->errorResponse( 'File keys are required', self::HTTP_BAD_REQUEST );
			}

			$files = ModelFiles::getInstance()->getFilesByKeys( $fileKeys );

			if ( is_wp_error( $files ) ) {
				return $this->errorResponse( 'Files not found', self::HTTP_INTERNAL_SERVER_ERROR );
			}

			return $this->successResponse( $files, 'Files retrieved successfully' );
		} catch ( Exception $e ) {
			return $this->handleException( $e, 'Failed to retrieve files' );
		}
	}

	public function get_item_schema(): array {
		$schema               = parent::get_item_schema();
		$schema['title']      = 'file';
		$schema['properties'] = array(
			'id'             => array(
				'description' => __( 'Google Drive file ID.', 'ninja-drive' ),
				'type'        => 'string',
				'context'     => array( 'view', 'edit' ),
				'readonly'    => true,
			),
			'fileKey'        => array(
				'description' => __( 'Unique key for the file.', 'ninja-drive' ),
				'type'        => 'string',
				'context'     => array( 'view', 'edit' ),
				'readonly'    => true,
			),
			'name'           => array(
				'description' => __( 'File name.', 'ninja-drive' ),
				'type'        => 'string',
				'context'     => array( 'view', 'edit' ),
			),
			'description'    => array(
				'description' => __( 'File description.', 'ninja-drive' ),
				'type'        => 'string',
				'context'     => array( 'view', 'edit' ),
			),
			'parentId'       => array(
				'description' => __( 'Parent folder ID.', 'ninja-drive' ),
				'type'        => 'string',
				'context'     => array( 'view', 'edit' ),
			),
			'accountId'      => array(
				'description' => __( 'Owning account ID.', 'ninja-drive' ),
				'type'        => 'string',
				'context'     => array( 'view', 'edit' ),
				'readonly'    => true,
			),
			'size'           => array(
				'description' => __( 'File size in bytes.', 'ninja-drive' ),
				'type'        => 'integer',
				'context'     => array( 'view', 'edit' ),
			),
			'mimeType'       => array(
				'description' => __( 'MIME type of the file.', 'ninja-drive' ),
				'type'        => 'string',
				'context'     => array( 'view', 'edit' ),
			),
			'extension'      => array(
				'description' => __( 'File extension.', 'ninja-drive' ),
				'type'        => 'string',
				'context'     => array( 'view', 'edit' ),
			),
			'icon'           => array(
				'description' => __( 'File icon URL.', 'ninja-drive' ),
				'type'        => 'string',
				'format'      => 'uri',
				'context'     => array( 'view', 'edit' ),
			),
			'thumbnail'      => array(
				'description' => __( 'File thumbnail URL.', 'ninja-drive' ),
				'type'        => 'string',
				'format'      => 'uri',
				'context'     => array( 'view', 'edit' ),
			),
			'additionalData' => array(
				'description' => __( 'Additional file metadata from Google Drive.', 'ninja-drive' ),
				'type'        => 'object',
				'context'     => array( 'view', 'edit' ),
			),
			'isDir'          => array(
				'description' => __( 'Whether this is a directory.', 'ninja-drive' ),
				'type'        => 'integer',
				'enum'        => array( 0, 1 ),
				'context'     => array( 'view', 'edit' ),
			),
			'isShared'       => array(
				'description' => __( 'Whether the file is shared.', 'ninja-drive' ),
				'type'        => 'integer',
				'enum'        => array( 0, 1 ),
				'context'     => array( 'view', 'edit' ),
			),
			'isStarred'      => array(
				'description' => __( 'Whether the file is starred.', 'ninja-drive' ),
				'type'        => 'integer',
				'enum'        => array( 0, 1 ),
				'context'     => array( 'view', 'edit' ),
			),
			'media'          => array(
				'description' => __( 'Media metadata for images/videos.', 'ninja-drive' ),
				'type'        => 'object',
				'context'     => array( 'view', 'edit' ),
			),
			'permissions'    => array(
				'description' => __( 'File permissions from Google Drive.', 'ninja-drive' ),
				'type'        => 'object',
				'context'     => array( 'view', 'edit' ),
			),
			'createdAt'      => array(
				'description' => __( 'Creation date.', 'ninja-drive' ),
				'type'        => 'string',
				'format'      => 'date-time',
				'context'     => array( 'view', 'edit' ),
				'readonly'    => true,
			),
			'updatedAt'      => array(
				'description' => __( 'Last update date.', 'ninja-drive' ),
				'type'        => 'string',
				'format'      => 'date-time',
				'context'     => array( 'view', 'edit' ),
				'readonly'    => true,
			),
		);

		return $schema;
	}

	private function generateFileNameFromTemplate( string $template, string $name, int $queueIndex = 0, int $postId = 0 ): string {
		$fileInfo    = explode( '.', $name );
		$extension   = array_pop( $fileInfo );
		$baseName    = implode( '.', $fileInfo );
		$currentDate = gmdate( 'Y-m-d' );
		$currentTime = gmdate( 'H-i-s' );
		$uniqueId    = uniqid();
		$queueIndex  = $queueIndex ?? '0';
		$postId      = $postId ?? '0';
		$postTitle   = get_the_title( $postId );
		$postTitle   = ( ! empty( $postTitle ) ) ? sanitize_title( $postTitle ) : "post-$postId";

		$newName = str_replace(
			array( '{file_name}', '{file_extension}', '{current_date}', '{current_time}', '{unique_id}', '{queue_index}', '{post_id}', '{post_title}' ),
			array( $baseName, $extension, $currentDate, $currentTime, $uniqueId, $queueIndex, $postId, $postTitle ),
			$template
		);

		return "$newName.$extension";
	}
}
