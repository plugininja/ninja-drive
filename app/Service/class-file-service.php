<?php

namespace Pnpnd\ND\App\Service;

use Exception;
use WP_Error;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

use Pnpnd\ND\App\Client;
use Pnpnd\ND\App\File;
use Pnpnd\ND\Google\Http\HttpBatch;
use Pnpnd\ND\Google\Service\ServiceDriveDrive;
use Pnpnd\ND\Google\Service\ServiceDriveDriveFile;
use Pnpnd\ND\Models\Files as ModelsFiles;

class File_Service extends Drive_Service {

	/**
	 * Summary of account_id
	 *
	 * @var string $account_id The ID of the account associated with the files.
	 */
	private $account_id;

	/**
	 * Constructor
	 *
	 * @param Client $client The client instance with the account ID
	 */
	public function __construct( Client $client ) {
		$this->account_id = $client->account_id;

		parent::__construct( $client );
	}

	/**
	 * Retrieves a file by its ID.
	 *
	 * @param string $id The ID of the file to retrieve.
	 *
	 * @return File|WP_Error The file object or false if the file is not found or not a regular file.
	 */
	public function get_file_by_id( string $id ) {
		if ( empty( $id ) ) {
			return new WP_Error( 400, __( 'Missing file id.', 'ninja-drive' ) );
		}

		try {
			$response = $this->files->get(
				$id,
				array(
					'supportsAllDrives' => true,
					'fields'            => PNPND_FILE_FIELDS,
				)
			);

			$response->setAccountId( $this->account_id );

			if ( ! $response instanceof ServiceDriveDriveFile ) {
				return new WP_Error( 404, __( 'File not found.', 'ninja-drive' ) );
			}

			wp_cache_flush_group( 'pnpnd_files' );

			return new File( $response );
		} catch ( Exception $exception ) {

			return new WP_Error( 500, $exception->getMessage() );
		}
	}

	/**
	 * Creates a new folder in Google Drive.
	 *
	 * This function creates a new folder with the specified name and parent folder
	 * in Google Drive. If the parent folder is not provided, it defaults to 'root'.
	 * It returns the newly created folder object or an error if the creation fails.
	 *
	 * @param string      $folder_name The name of the new folder to create.
	 * @param string|null $parent_folder The ID of the parent folder. Defaults to 'root'.
	 *
	 * @return array|WP_Error The file object of the newly created folder or an error.
	 */
	public function create_new_folder( $folder_name, $parent_folder ) {
		if ( empty( $parent_folder ) ) {
			$parent_folder = 'root';
		}

		try {
			$file_metadata = new ServiceDriveDriveFile(
				array(
					'name'     => $folder_name,
					'mimeType' => 'application/vnd.google-apps.folder',
					'parents'  => array( $parent_folder ),
				)
			);

			$response = $this->files->create(
				$file_metadata,
				array(
					'fields'            => PNPND_FILE_FIELDS,
					'supportsAllDrives' => true,
				)
			);

			if ( ! $response instanceof ServiceDriveDriveFile ) {
				return new WP_Error( 404, __( 'File not found.', 'ninja-drive' ) );
			}

			$response->setAccountId( $this->account_id );
			$file = new File( $response );

			wp_cache_flush_group( 'pnpnd_files' );

			return $file->save();
		} catch ( Exception $exception ) {

			return new WP_Error( 500, $exception->getMessage() );
		}
	}

	/**
	 * Renames a file in Google Drive.
	 *
	 * @param string $file_id The ID of the file to rename.
	 * @param string $name The new name for the file.
	 *
	 * @return array|WP_Error The saved file object if successful, or a WP_Error on failure.
	 *
	 * @throws WP_Error If the file ID or name is empty, or if the update fails.
	 */
	public function rename( $file_id, $name ) {

		if ( empty( $file_id ) || empty( $name ) ) {
			return new WP_Error( 404, __( 'File not found.', 'ninja-drive' ) );
		}

		$file_metadata = new ServiceDriveDriveFile();
		$file_metadata->setName( $name );

		$response = $this->files->update(
			$file_id,
			$file_metadata,
			array(
				'fields' => PNPND_FILE_FIELDS,
			)
		);

		if ( ! $response instanceof ServiceDriveDriveFile ) {
			return new WP_Error( 404, __( 'File not found.', 'ninja-drive' ) );
		}

		$response->setAccountId( $this->account_id );
		$file = new File( $response );

		wp_cache_flush_group( 'pnpnd_files' );

		return $file->save();
	}

	/**
	 * Updates the description of a file in Google Drive.
	 *
	 * @param string $file_id The ID of the file to update.
	 * @param string $description The new description for the file.
	 *
	 * @return array|WP_Error The saved file object if successful, or a WP_Error on failure.
	 */
	public function update_description( $file_id, $description ) {

		if ( empty( $file_id ) || empty( $description ) ) {
			return new WP_Error( 404, __( 'File not found.', 'ninja-drive' ) );
		}

		$file_metadata = new ServiceDriveDriveFile();
		$file_metadata->setDescription( $description );

		$response = $this->files->update(
			$file_id,
			$file_metadata,
			array(
				'fields' => PNPND_FILE_FIELDS,
			)
		);

		if ( ! $response instanceof ServiceDriveDriveFile ) {
			return new WP_Error( 404, __( 'File not found.', 'ninja-drive' ) );
		}

		$response->setAccountId( $this->account_id );
		$file = new File( $response );

		wp_cache_flush_group( 'pnpnd_files' );

		return $file->save();
	}

	/**
	 * Retrieves a list of files from the specified folder and account.
	 *
	 * @param array $args {
	 *                    An associative array of arguments.
	 *
	 * @type string $id The ID of the folder to retrieve files from.
	 * @type string $account_id The ID of the account associated with the files.
	 * @type string $from Where to retrieve files from. Can be either 'cache' or 'server'.
	 * @type int $limit The maximum number of files to retrieve.
	 * @type int $file_numbers The number of files to show in the response. If this is less than the total number of files,
	 *           the function will return a subset of the files.
	 *           }
	 *
	 * @return array|WP_Error The list of files, sorted by name and limited to the specified number of items.
	 */
	public function list_files( array $args ) {
		$files      = array();
		$page_token = null;

		do {
			try {
				if ( $page_token ) {
					$args['pageToken'] = $page_token;
				}

				$response = $this->files->listFiles( $args );

				$page_token = $response->getNextPageToken();

				foreach ( $response->getFiles() as $api_file ) {
					if ( $api_file instanceof ServiceDriveDriveFile ) {
						$api_file->setAccountId( $this->account_id );
						$file        = new File( $api_file );
						$saved_files = $file->save();
						if ( $saved_files ) {
							$files[] = $saved_files;
						}
					}
				}
			} catch ( Exception $exception ) {
				return new WP_Error( 500, $exception->getMessage() );
			}
		} while ( ! empty( $page_token ) );

		wp_cache_flush_group( 'pnpnd_files' );

		return $files;
	}

	/**
	 * Retrieves a list of Google Drive shared drives available to the user.
	 *
	 * This function fetches shared drives using the Google Drive API and returns
	 * them as an array of saved file data. The function continues to fetch drives
	 * in a paginated manner until all drives are retrieved.
	 *
	 * @param array $args Optional parameters for fetching the drives. Defaults
	 *                    include 'fields', 'pageSize', and 'pageToken'.
	 *
	 * @return array|WP_Error An array of saved drive data or a WP_Error if an
	 *                        exception occurs during the API call.
	 */
	public function list_drives( $args = array() ) {
		$default_params = array(
			'fields'    => 'kind,nextPageToken,drives(kind,id,name,capabilities,backgroundImageFile,backgroundImageLink,createdTime,hidden)',
			'pageSize'  => 100,
			'pageToken' => '',
		);

		$params = wp_parse_args( $args, $default_params );

		$files = array();

		do {
			try {
				$response = $this->service->drives->listDrives( $params );

				$drives              = $response->getDrives();
				$page_token          = ! empty( $response->getNextPageToken() ) ? $response->getNextPageToken() : '';
				$params['pageToken'] = $page_token;

				if ( ! empty( $drives ) ) {
					foreach ( $drives as $drive ) {
						if ( $drive instanceof ServiceDriveDrive ) {
							$api_file = new ServiceDriveDriveFile();
							$api_file->setAccountId( $this->account_id );
							$api_file->setId( $drive->getId() );
							$api_file->setName( $drive->getName() );
							$api_file->setMimeType( 'application/vnd.google-apps.folder' );
							$api_file->setCreatedTime( $drive->getCreatedTime()->format( DATE_ATOM ) );
							$api_file->setModifiedTime( $drive->getCreatedTime()->format( DATE_ATOM ) );
							$api_file->setThumbnailLink( $drive->getBackgroundImageLink() );
							$api_file->setIconLink( $drive->getBackgroundImageLink() );
							$api_file->setParents( 'shared-drives' );

							$file        = new File( $api_file, true );
							$saved_files = $file->save();
							if ( $saved_files ) {
								$files[] = $saved_files;
							}
						}
					}
				}
			} catch ( Exception $ex ) {
				return new WP_Error( 500, $ex->getMessage() );
			}
		} while ( ! empty( $page_token ) );

		wp_cache_flush_group( 'pnpnd_files' );

		return $files;
	}

	public function delete_file( $file_ids ) {
		try {
			$this->client->setUseBatch( true );
			$batch = new HttpBatch( $this->client );
			foreach ( $file_ids as $file_id ) {
				$file_metadata = new ServiceDriveDriveFile(
					array(
						'trashed' => true,
					)
				);
				ModelsFiles::get_instance()->delete_file( $file_id, $this->account_id );
				$batch->add( $this->files->update( $file_id, $file_metadata ) );
			}

			$batch->execute();
			$this->client->setUseBatch( false );

			wp_cache_flush_group( 'pnpnd_files' );

			return true;
		} catch ( Exception $exception ) {

			return new WP_Error( 500, $exception->getMessage() );
		}
	}

}
