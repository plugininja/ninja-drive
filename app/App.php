<?php

namespace Pnpnd\ND\App;

use Pnpnd\ND\App\Feature\BreadcrumbBuilder;
use Pnpnd\ND\App\Feature\FileEditor;
use Pnpnd\ND\App\Feature\FileLister;
use Pnpnd\ND\App\Feature\FileRetriever;
use Pnpnd\ND\App\Feature\FileUploader;
use Pnpnd\ND\App\Feature\FolderManager;
use Pnpnd\ND\App\Feature\MediaLinkGenerator;
use Pnpnd\ND\App\Feature\SearchEngine;
use Pnpnd\ND\App\Service\FileService;
use Pnpnd\ND\Utils\Singleton;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class App {

	use Singleton;

	/**
	 * Summary of accountId
	 *
	 * @var string $accountId The ID of the account to be used for API interactions. If not provided, the active account will be used.
	 */
	public $accountId;

	/**
	 * Summary of files
	 *
	 * @var FileService $files An instance of the FileService class, responsible for handling file-related operations and interactions with the API.
	 */
	private $files;

	/**
	 * Summary of client
	 *
	 * @var Client $client An instance of the Client class, responsible for handling API interactions.
	 */
	private $client;

	public function __construct( ?string $accountId = null ) {
		if ( null === $accountId ) {
			$activeAccount = Accounts::getInstance()->getAccount();

			if ( is_wp_error( $activeAccount ) || empty( $activeAccount ) ) {
				return;
			}

			$accountId       = $activeAccount->getId();
			$this->accountId = $accountId;
		}

		$this->prepareApiFiles( $accountId );
	}

	public function getFile( string $id, ?string $accountId = null, bool $force = false ) {
		$accountId = $accountId ?? $this->accountId;

		return ( new FileRetriever() )->getFile( $id, $accountId, $force );
	}

	public function getFileByKey( string $key, bool $force = false, string $output = 'array' ) {
		return ( new FileRetriever() )->getFileByKey( $key, $force, $output );
	}

	public function getFiles( array $args = array() ) {
		return ( new FileLister( $this->files ) )->getFiles( $args );
	}

	public function getFolderByKey( string $fileKey, array $args = array() ) {
		return ( new FolderManager( $this->files ) )->getFolderByKey( $fileKey, $args );
	}

	public function getFolderTree( string $folderKey, array $args = array() ) {
		return ( new FolderManager( $this->files ) )->getFolderTree( $folderKey, $args );
	}

	public function getFolders( ?string $accountId = null, array $config = array() ) {
		$accountId = $accountId ?? $this->accountId;

		return ( new FolderManager( $this->files ) )->getFolders( $accountId, $config );
	}

	public function getBreadcrumbByKey( ?string $fileKey = null, array $args = array() ) {
		return ( new BreadcrumbBuilder() )->getBreadcrumbByKey( $fileKey, $args );
	}

	public function newFolder( string $name, string $parentKey ) {
		return ( new FolderManager( $this->files ) )->newFolder( $name, $parentKey );
	}

	public function upload( string $name, string $type, string $folderKey, string $content = '', string $description = '', int $size = 0 ) {
		return ( new FileUploader() )->upload( $name, $type, $folderKey, $content, $description, $size, $this->accountId );
	}

	public function getUploadedFile( string $fileId, string $uploadId, string $folderKey ) {
		return ( new FileUploader() )->getUploadedFile( $fileId, $uploadId, $folderKey, $this->accountId );
	}

	public function rename( string $fileKey, string $name ) {
		return ( new FileEditor( $this->files, $this->accountId ) )->rename( $fileKey, $name );
	}

	public function delete( array $fileKeys ) {
		return ( new FileEditor( $this->files, $this->accountId ) )->delete( $fileKeys );
	}

	public function preview( string $fileKey, string $mode = 'preview' ) {
		return ( new MediaLinkGenerator( $this->client ) )->preview( $fileKey, $mode );
	}

	public function download( string $fileKey, ?string $format = null ) {
		return ( new MediaLinkGenerator( $this->client ) )->download( $fileKey, $format );
	}

	public function generateDownloadLink( string $fileKey, array $options = array() ) {
		return ( new MediaLinkGenerator( $this->client ) )->generateDownloadLink( $fileKey, $options );
	}

	public function generateSharedLink( string $fileKey, array $options = array() ) {
		return ( new MediaLinkGenerator( $this->client ) )->generateSharedLink( $fileKey, $options );
	}

	public function search( array $data ) {
		return ( new SearchEngine( new FileLister( $this->files ) ) )->search( $data );
	}

	public function getFilesByKeys( array $fileKeys, array $config = array() ) {
		return ( new FileRetriever() )->getFilesByKeys( $fileKeys, $config, $this->files );
	}

	private function prepareApiFiles( string $accountId ) {
		$this->accountId = $accountId;
		$this->client    = Client::getInstance( $accountId );
		$this->files     = new FileService( $this->client );
	}
}
