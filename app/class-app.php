<?php

namespace Pnpnd\ND\App;

use Pnpnd\ND\App\Feature\Breadcrumb_Builder;
use Pnpnd\ND\App\Feature\File_Editor;
use Pnpnd\ND\App\Feature\File_Lister;
use Pnpnd\ND\App\Feature\File_Retriever;
use Pnpnd\ND\App\Feature\File_Uploader;
use Pnpnd\ND\App\Feature\Folder_Manager;
use Pnpnd\ND\App\Feature\Media_Link_Generator;
use Pnpnd\ND\App\Feature\Search_Engine;
use Pnpnd\ND\App\Service\File_Service;
use Pnpnd\ND\Traits\Singleton;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class App {

	use Singleton;

	public $account_id;
	private $files;
	private $client;

	public function __construct( ?string $account_id = null ) {
		if ( null === $account_id ) {
			$active_account = Accounts::get_instance()->get_account();

			if ( is_wp_error( $active_account ) || empty( $active_account ) ) {
				return;
			}

			$account_id       = $active_account->get_id();
			$this->account_id = $account_id;
		}

		$this->prepare_api_files( $account_id );
	}

	public function get_file( string $id, ?string $account_id = null, bool $force = false ) {
		$account_id = $account_id ?? $this->account_id;

		return ( new File_Retriever() )->get_file( $id, $account_id, $force );
	}

	public function get_file_by_key( string $key, bool $force = false, string $output = 'array' ) {
		return ( new File_Retriever() )->get_file_by_key( $key, $force, $output );
	}

	public function get_files( array $args = array() ) {
		return ( new File_Lister( $this->files ) )->get_files( $args );
	}

	public function get_folder_by_key( string $file_key, array $args = array() ) {
		return ( new Folder_Manager( $this->files ) )->get_folder_by_key( $file_key, $args );
	}

	public function get_folder_tree( string $folder_key, array $args = array() ) {
		return ( new Folder_Manager( $this->files ) )->get_folder_tree( $folder_key, $args );
	}

	public function get_folders( ?string $account_id = null, array $config = array() ) {
		$account_id = $account_id ?? $this->account_id;

		return ( new Folder_Manager( $this->files ) )->get_folders( $account_id, $config );
	}

	public function get_breadcrumb_by_key( ?string $file_key = null, array $args = array() ) {
		return ( new Breadcrumb_Builder() )->get_breadcrumb_by_key( $file_key, $args );
	}

	public function new_folder( string $name, string $parent_key ) {
		return ( new Folder_Manager( $this->files ) )->new_folder( $name, $parent_key );
	}

	public function upload( string $name, string $type, string $folder_key, string $content = '', string $description = '', int $size = 0 ) {
		return ( new File_Uploader() )->upload( $name, $type, $folder_key, $content, $description, $size, $this->account_id );
	}

	public function get_uploaded_file( string $file_id, string $upload_id, string $folder_key ) {
		return ( new File_Uploader() )->get_uploaded_file( $file_id, $upload_id, $folder_key, $this->account_id );
	}

	public function rename( string $file_key, string $name ) {
		return ( new File_Editor( $this->files, $this->account_id ) )->rename( $file_key, $name );
	}

	public function delete( array $file_keys ) {
		return ( new File_Editor( $this->files, $this->account_id ) )->delete( $file_keys );
	}

	public function preview( string $file_key, string $mode = 'preview' ) {
		return ( new Media_Link_Generator( $this->client ) )->preview( $file_key, $mode );
	}

	public function download( string $file_key, ?string $format = null ) {
		return ( new Media_Link_Generator( $this->client ) )->download( $file_key, $format );
	}

	public function generate_download_link( string $file_key, array $options = array() ) {
		return ( new Media_Link_Generator( $this->client ) )->generate_download_link( $file_key, $options );
	}

	public function generate_shared_link( string $file_key, array $options = array() ) {
		return ( new Media_Link_Generator( $this->client ) )->generate_shared_link( $file_key, $options );
	}

	public function search( array $data ) {
		return ( new Search_Engine( new File_Lister( $this->files ) ) )->search( $data );
	}

	public function get_files_by_keys( array $file_keys, array $config = array() ) {
		return ( new File_Retriever() )->get_files_by_keys( $file_keys, $config, $this->files );
	}

	private function prepare_api_files( string $account_id ) {
		$this->account_id = $account_id;
		$this->client     = Client::get_instance( $account_id );
		$this->files      = new File_Service( $this->client );
	}

}
