<?php

namespace Pnpnd\ND\API\Controllers;

use Exception;
use Pnpnd\ND\API\Base_Controller;
use Pnpnd\ND\API\Traits\Has_Widget_Permission;
use Pnpnd\ND\App\App;
use Pnpnd\ND\Models\Files as ModelFiles;
use Pnpnd\ND\Models\Widget;
use WP_Error;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class File extends Base_Controller {

	use Has_Widget_Permission;

	public function __construct() {
		parent::__construct( 'pnpnd/v1', 'file' );
	}

	public function manage_permission( WP_REST_Request $request ) {
		if ( $this->has_permission() ) {
			return true;
		}

		return new WP_Error( 'forbidden', 'You do not have permission.', array( 'status' => 403 ) );
	}

	public function register_routes(): void {

		$rename_args = array(
			'file_key' => array(
				'type'              => 'string',
				'required'          => true,
				'sanitize_callback' => 'sanitize_text_field',
			),
			'name'     => array(
				'type'              => 'string',
				'required'          => true,
				'sanitize_callback' => 'sanitize_text_field',
			),
		);

		register_rest_route(
			$this->namespace,
			"{$this->rest_base}/rename",
			array(
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'rename' ),
					'permission_callback' => array( $this, 'manage_permission' ),
					'args'                => $rename_args,
				),
			)
		);

		$open_in_drive_args = array(
			'file_key' => array(
				'type'              => 'string',
				'required'          => true,
				'sanitize_callback' => 'sanitize_text_field',
			),
		);

		register_rest_route(
			$this->namespace,
			"{$this->rest_base}/open-in-drive/(?P<file_key>[^/]+)",
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'open_in_drive' ),
					'permission_callback' => array( $this, 'manage_permission' ),
					'args'                => $open_in_drive_args,
				),
			)
		);

		$share_link_args = array(
			'expiry'   => array(
				'required'          => false,
				'type'              => 'integer',
				'default'           => 3600,
				'sanitize_callback' => 'absint',
				'validate_callback' => array( $this, 'validate_expiry' ),
			),
			'password' => array(
				'required'          => false,
				'type'              => 'string',
				'default'           => null,
				'sanitize_callback' => 'sanitize_text_field',
			),
		);

		register_rest_route(
			$this->namespace,
			"{$this->rest_base}/share/(?P<file_key>[^/]+)",
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'share_link' ),
					'permission_callback' => array( $this, 'manage_permission' ),
					'args'                => $share_link_args,
				),
			),
		);

		$download_args = array(
			'expiry'   => array(
				'required'          => false,
				'type'              => 'integer',
				'default'           => 3600,
				'sanitize_callback' => 'absint',
				'validate_callback' => array( $this, 'validate_expiry' ),
			),
			'limit'    => array(
				'required'          => false,
				'type'              => 'integer',
				'default'           => null,
				'sanitize_callback' => 'absint',
				'validate_callback' => array( $this, 'validate_limit' ),
			),
			'password' => array(
				'required'          => false,
				'type'              => 'string',
				'default'           => null,
				'sanitize_callback' => 'sanitize_text_field',
			),
		);

		register_rest_route(
			$this->namespace,
			"{$this->rest_base}/download/(?P<file_key>[^/]+)",
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'download_link' ),
					'permission_callback' => array( $this, 'manage_permission' ),
					'args'                => $download_args,
				),
			)
		);

		$upload_args = array(
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
			'folder_key'  => array(
				'type'              => 'string',
				'required'          => true,
				'sanitize_callback' => 'sanitize_text_field',
			),
			'size'        => array(
				'type'              => 'integer',
				'required'          => true,
				'sanitize_callback' => 'absint',
			),
		);

		$get_uploaded_file_args = array(
			'file_id'    => array(
				'type'              => 'string',
				'required'          => true,
				'sanitize_callback' => 'sanitize_text_field',
			),
			'upload_id'  => array(
				'type'              => 'string',
				'required'          => true,
				'sanitize_callback' => 'sanitize_text_field',
			),
			'folder_key' => array(
				'type'              => 'string',
				'required'          => true,
				'sanitize_callback' => 'sanitize_text_field',
			),
		);

		register_rest_route(
			$this->namespace,
			"{$this->rest_base}/upload",
			array(
				array(
					'methods'             => WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'upload' ),
					'permission_callback' => array( $this, 'manage_permission' ),
					'args'                => $upload_args,
				),
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_uploaded_file' ),
					'permission_callback' => array( $this, 'manage_permission' ),
					'args'                => $get_uploaded_file_args,
				),
			)
		);

		register_rest_route(
			$this->namespace,
			"{$this->rest_base}/by-keys",
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_files' ),
					'permission_callback' => array( $this, 'manage_permission' ),
					'args'                => array(
						'file_keys' => array(
							'type'              => 'string',
							'required'          => true,
							'sanitize_callback' => array(
								$this,
								'sanitize_file_keys_array',
							),
						),
					),
				),
			),
		);

		register_rest_route(
			$this->namespace,
			"{$this->rest_base}/(?P<file_key>[^/]+)",
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get' ),
					'permission_callback' => array( $this, 'manage_permission' ),
					'args'                => array(
						'file_key' => array(
							'type'              => 'string',
							'required'          => true,
							'sanitize_callback' => 'sanitize_text_field',
						),
						'from'     => array(
							'type'              => 'string',
							'required'          => false,
							'default'           => 'cache',
							'sanitize_callback' => 'sanitize_text_field',
						),
					),
				),
			)
		);

		$delete_args = array(
			'file_keys' => array(
				'type'              => 'string',
				'required'          => true,
				'sanitize_callback' => array( $this, 'sanitize_file_keys_array' ),
			),
		);

		register_rest_route(
			$this->namespace,
			"{$this->rest_base}/",
			array(
				array(
					'methods'             => WP_REST_Server::DELETABLE,
					'callback'            => array( $this, 'delete' ),
					'permission_callback' => array( $this, 'manage_permission' ),
					'args'                => $delete_args,
				),
			)
		);
	}

	public function upload( WP_REST_Request $request ): WP_REST_Response {
		try {
			$name        = $request->get_param( 'name' ) ?? '';
			$type        = $request->get_param( 'type' ) ?? '';
			$description = $request->get_param( 'description' ) ?? '';
			$folder_key  = $request->get_param( 'folder_key' ) ?? '';
			$size        = $request->get_param( 'size' ) ?? 0;

			if ( empty( $name ) || empty( $type ) || empty( $size ) || empty( $folder_key ) ) {
				return $this->error_response( 'Missing required parameters', self::HTTP_BAD_REQUEST );
			}

			if ( empty( $folder_key ) ) {
				return $this->error_response( 'Folder key is required for upload.', self::HTTP_BAD_REQUEST );
			}

			$resume_url = App::get_instance()->upload( $name, $type, $folder_key, '', $description, $size );

			if ( is_wp_error( $resume_url ) ) {
				return $this->error_response( $resume_url->get_error_message(), self::HTTP_INTERNAL_SERVER_ERROR );
			}

			return $this->success_response( $resume_url, 'Resume URL generated successfully' );
		} catch ( Exception $e ) {
			return $this->handle_exception( $e, 'Failed to generate resume URL' );
		}
	}

	public function get_uploaded_file( WP_REST_Request $request ): WP_REST_Response {
		try {
			$file_id    = $request->get_param( 'file_id' ) ?? '';
			$token      = $request->get_param( 'upload_id' ) ?? '';
			$folder_key = $request->get_param( 'folder_key' ) ?? '';

			if ( empty( $file_id ) || empty( $token ) || empty( $folder_key ) ) {
				return $this->error_response( 'Missing required parameters', self::HTTP_BAD_REQUEST );
			}

			$file = App::get_instance()->get_uploaded_file( $file_id, $token, $folder_key );

			if ( is_wp_error( $file ) ) {
				return $this->error_response( $file->get_error_message(), self::HTTP_INTERNAL_SERVER_ERROR );
			}

			if ( empty( $file ) ) {
				return $this->error_response( 'File not found', self::HTTP_NOT_FOUND );
			}

			return $this->success_response( $file, 'File retrieved successfully' );
		} catch ( Exception $e ) {
			return $this->handle_exception( $e, 'Failed to retrieve uploaded file' );
		}
	}

	public function get( WP_REST_Request $request ): WP_REST_Response {
		try {
			$file_key = $request->get_param( 'file_key' );
			$from     = $request->get_param( 'from' ) ?? 'cache';

			if ( empty( $file_key ) ) {
				return $this->error_response( 'File key is required', self::HTTP_BAD_REQUEST );
			}

			$file = App::get_instance()->get_file_by_key( $file_key, 'server' === $from );
			if ( empty( $file ) ) {
				return $this->error_response( 'File not found', self::HTTP_NOT_FOUND );
			}

			if ( is_wp_error( $file ) ) {
				return $this->error_response( $file->get_error_message(), self::HTTP_INTERNAL_SERVER_ERROR );
			}

			return $this->success_response( $file, 'File retrieved successfully' );

		} catch ( Exception $e ) {
			return $this->handle_exception( $e, 'Failed to retrieve file' );
		}
	}

	public function delete( WP_REST_Request $request ): WP_REST_Response {
		try {
			$file_keys = $request->get_param( 'file_keys' );

			if ( empty( $file_keys ) ) {
				return $this->error_response( 'File key is required', self::HTTP_BAD_REQUEST );
			}

			$file = App::get_instance()->delete( $file_keys );

			if ( is_wp_error( $file ) ) {
				return $this->error_response( $file->get_error_message(), self::HTTP_INTERNAL_SERVER_ERROR );
			}

			return $this->success_response( $file, 'File deleted successfully' );
		} catch ( Exception $e ) {
			return $this->handle_exception( $e, 'Failed to delete file' );
		}
	}

	public function rename( WP_REST_Request $request ): WP_REST_Response {
		try {
			$file_key = $request->get_param( 'file_key' );
			$name     = $request->get_param( 'name' );

			if ( empty( $file_key ) || empty( $name ) ) {
				return $this->error_response( 'File key and new name are required', self::HTTP_BAD_REQUEST );
			}

			$folder = App::get_instance()->rename( $file_key, $name );

			if ( empty( $folder ) ) {
				return $this->error_response( 'Failed to rename folder', self::HTTP_INTERNAL_SERVER_ERROR );
			}

			if ( is_wp_error( $folder ) ) {
				return $this->error_response( $folder->get_error_message(), self::HTTP_INTERNAL_SERVER_ERROR );
			}

			return $this->success_response( $folder, 'Folder renamed successfully' );
		} catch ( Exception $e ) {
			return $this->handle_exception( $e, 'Failed to rename folder' );
		}
	}

	public function open_in_drive( WP_REST_Request $request ): WP_REST_Response {
		try {
			$file_key = $request->get_param( 'file_key' );

			if ( empty( $file_key ) ) {
				return $this->error_response( 'File key is required', self::HTTP_BAD_REQUEST );
			}

			$share_link = App::get_instance()->preview( $file_key );

			if ( is_wp_error( $share_link ) ) {
				return $this->error_response( $share_link->get_error_message(), self::HTTP_INTERNAL_SERVER_ERROR );
			}

			return $this->success_response( $share_link, 'Preview retrieved successfully' );
		} catch ( Exception $e ) {
			return $this->handle_exception( $e, 'Failed to retrieve preview' );
		}
	}

	public function share_link( WP_REST_Request $request ): WP_REST_Response {
		try {
			$file_key  = $request->get_param( 'file_key' );
			$expire_in = $request->get_param( 'expiry' );
			$password  = $request->get_param( 'password' );

			if ( empty( $file_key ) ) {
				return $this->error_response( 'File key is required', self::HTTP_BAD_REQUEST );
			}

			$share_link = App::get_instance()->generate_shared_link(
				$file_key,
				array(
					'expire_in' => $expire_in,
					'password'  => $password,
				)
			);

			if ( is_wp_error( $share_link ) ) {
				$message = $share_link->get_error_message();
				if ( ! current_user_can( 'manage_options' ) ) {
					$message = 'Failed to generate share link. Please contact the administrator.';
				}

				return $this->error_response( $message, self::HTTP_INTERNAL_SERVER_ERROR );
			}

			return $this->success_response( $share_link, 'Share link retrieved successfully' );
		} catch ( Exception $e ) {
			return $this->handle_exception( $e, 'Failed to retrieve share link' );
		}
	}

	public function download_link( WP_REST_Request $request ): WP_REST_Response {
		try {
			$file_key     = $request->get_param( 'file_key' );
			$expire_in    = $request->get_param( 'expiry' );
			$limit        = $request->get_param( 'limit' );
			$password     = $request->get_param( 'password' );
			$exact_format = $request->get_param( 'exact_format' );

			if ( empty( $file_key ) ) {
				return $this->error_response( 'File key is required', self::HTTP_BAD_REQUEST );
			}

			$download_link = App::get_instance()->generate_download_link(
				$file_key,
				array(
					'expire_in'    => $expire_in,
					'password'     => $password,
					'limit'        => $limit,
					'exact_format' => $exact_format,
				)
			);

			if ( is_wp_error( $download_link ) ) {
				return $this->error_response( $download_link->get_error_message(), self::HTTP_INTERNAL_SERVER_ERROR );
			}

			return $this->success_response( $download_link, 'Download link retrieved successfully' );
		} catch ( Exception $e ) {
			return $this->handle_exception( $e, 'Failed to retrieve download link' );
		}
	}

	public function get_files( WP_REST_Request $request ): WP_REST_Response {
		try {
			$file_keys = $request->get_param( 'file_keys' );

			if ( empty( $file_keys ) || ! is_array( $file_keys ) ) {
				return $this->error_response( 'File keys are required', self::HTTP_BAD_REQUEST );
			}

			$files = ModelFiles::get_instance()->get_files_by_keys( $file_keys );

			if ( is_wp_error( $files ) ) {
				return $this->error_response( 'Files not found', self::HTTP_INTERNAL_SERVER_ERROR );
			}

			return $this->success_response( $files, 'Files retrieved successfully' );
		} catch ( Exception $e ) {
			return $this->handle_exception( $e, 'Failed to retrieve files' );
		}
	}

	public function get_item_schema(): array {
		$schema               = parent::get_item_schema();
		$schema['title']      = 'file';
		$schema['properties'] = array(
			'id'              => array(
				'description' => __( 'Google Drive file ID.', 'ninja-drive' ),
				'type'        => 'string',
				'context'     => array( 'view', 'edit' ),
				'readonly'    => true,
			),
			'file_key'        => array(
				'description' => __( 'Unique key for the file.', 'ninja-drive' ),
				'type'        => 'string',
				'context'     => array( 'view', 'edit' ),
				'readonly'    => true,
			),
			'name'            => array(
				'description' => __( 'File name.', 'ninja-drive' ),
				'type'        => 'string',
				'context'     => array( 'view', 'edit' ),
			),
			'description'     => array(
				'description' => __( 'File description.', 'ninja-drive' ),
				'type'        => 'string',
				'context'     => array( 'view', 'edit' ),
			),
			'parent_id'       => array(
				'description' => __( 'Parent folder ID.', 'ninja-drive' ),
				'type'        => 'string',
				'context'     => array( 'view', 'edit' ),
			),
			'account_id'      => array(
				'description' => __( 'Owning account ID.', 'ninja-drive' ),
				'type'        => 'string',
				'context'     => array( 'view', 'edit' ),
				'readonly'    => true,
			),
			'size'            => array(
				'description' => __( 'File size in bytes.', 'ninja-drive' ),
				'type'        => 'integer',
				'context'     => array( 'view', 'edit' ),
			),
			'mime_type'       => array(
				'description' => __( 'MIME type of the file.', 'ninja-drive' ),
				'type'        => 'string',
				'context'     => array( 'view', 'edit' ),
			),
			'extension'       => array(
				'description' => __( 'File extension.', 'ninja-drive' ),
				'type'        => 'string',
				'context'     => array( 'view', 'edit' ),
			),
			'icon'            => array(
				'description' => __( 'File icon URL.', 'ninja-drive' ),
				'type'        => 'string',
				'format'      => 'uri',
				'context'     => array( 'view', 'edit' ),
			),
			'thumbnail'       => array(
				'description' => __( 'File thumbnail URL.', 'ninja-drive' ),
				'type'        => 'string',
				'format'      => 'uri',
				'context'     => array( 'view', 'edit' ),
			),
			'additional_data' => array(
				'description' => __( 'Additional file metadata from Google Drive.', 'ninja-drive' ),
				'type'        => 'object',
				'context'     => array( 'view', 'edit' ),
			),
			'is_dir'          => array(
				'description' => __( 'Whether this is a directory.', 'ninja-drive' ),
				'type'        => 'integer',
				'enum'        => array( 0, 1 ),
				'context'     => array( 'view', 'edit' ),
			),
			'is_shared'       => array(
				'description' => __( 'Whether the file is shared.', 'ninja-drive' ),
				'type'        => 'integer',
				'enum'        => array( 0, 1 ),
				'context'     => array( 'view', 'edit' ),
			),
			'is_starred'      => array(
				'description' => __( 'Whether the file is starred.', 'ninja-drive' ),
				'type'        => 'integer',
				'enum'        => array( 0, 1 ),
				'context'     => array( 'view', 'edit' ),
			),
			'media'           => array(
				'description' => __( 'Media metadata for images/videos.', 'ninja-drive' ),
				'type'        => 'object',
				'context'     => array( 'view', 'edit' ),
			),
			'permissions'     => array(
				'description' => __( 'File permissions from Google Drive.', 'ninja-drive' ),
				'type'        => 'object',
				'context'     => array( 'view', 'edit' ),
			),
			'created_at'      => array(
				'description' => __( 'Creation date.', 'ninja-drive' ),
				'type'        => 'string',
				'format'      => 'date-time',
				'context'     => array( 'view', 'edit' ),
				'readonly'    => true,
			),
			'updated_at'      => array(
				'description' => __( 'Last update date.', 'ninja-drive' ),
				'type'        => 'string',
				'format'      => 'date-time',
				'context'     => array( 'view', 'edit' ),
				'readonly'    => true,
			),
		);

		return $schema;
	}

	public function validate_expiry( int $value ) {

		$value = absint( $value );
		if ( 3600 === $value || 7200 === $value || 86400 === $value ) {
			return $value;
		} else {
			return new WP_Error( 'invalid_expiry', 'Invalid expiry value. Allowed values are 3600, 7200, or 86400 seconds.', array( 'status' => 400 ) );
		}
	}

	public function validate_limit( int $value ) {
		$value = absint( $value );
		if ( 1 <= $value && $value <= 5 ) {
			return $value;
		} else {
			return new WP_Error( 'invalid_limit', 'Invalid limit value. Allowed values are 1 to 5.', array( 'status' => 400 ) );
		}
	}

	public function sanitize_file_keys_array( $value ) {
		if ( is_array( $value ) ) {
			return array_map( 'sanitize_text_field', $value );
		} elseif ( is_string( $value ) ) {
			// If it's a comma-separated string, convert it to an array
			$array = explode( ',', $value );
			return array_map( 'sanitize_text_field', $array );
		} else {
			return new WP_Error( 'invalid_file_keys', 'File keys must be an array or a comma-separated string.', array( 'status' => 400 ) );
		}
	}

}
