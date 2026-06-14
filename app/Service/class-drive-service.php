<?php

namespace Pnpnd\ND\App\Service;

use Pnpnd\ND\App\Client;
use Pnpnd\ND\Google\Client as GoogleClient;
use Pnpnd\ND\Google\Service\ServiceDrive;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

abstract class Drive_Service {

	/**
	 * Google Client instance.
	 *
	 * @var GoogleClient
	 */
	protected $client;

	/**
	 * ServiceDrive instance.
	 *
	 * @var \Pnpnd\ND\Google\Service\ServiceDrive
	 */
	protected $service;

	/**
	 * About API instance.
	 *
	 * @var \Pnpnd\ND\Google\Service\ServiceDriveAboutResource
	 */
	protected $about;

	/**
	 * Files API instance.
	 *
	 * @var \Pnpnd\ND\Google\Service\ServiceDriveFilesResource
	 */
	protected $files;

	/**
	 * Permissions API instance.
	 *
	 * @var \Pnpnd\ND\Google\Service\ServiceDrivePermissionsResource
	 */
	protected $permissions;

	/**
	 * Drives API instance.
	 *
	 * @var \Pnpnd\ND\Google\Service\ServiceDriveDrivesResource
	 */
	protected $drives;

	/**
	 * Service name.
	 *
	 * @var string
	 */
	protected $service_name;

	public function __construct( Client $client ) {
		$this->init( $client->get_client() );
	}

	// ================= Protected methods ==================

	protected function get_google_service() {
		return $this->service;
	}

	protected function get_google_client() {
		return $this->client;
	}

	protected function get_google_about() {
		return $this->about;
	}

	protected function get_google_drives() {
		return $this->drives;
	}

	protected function get_google_files() {
		return $this->files;
	}

	/**
	 * Initializes the API service with the given client
	 *
	 * @param GoogleClient $client The client to use for the API service
	 *
	 * @return void
	 */
	protected function init( GoogleClient $client ) {
		$this->client       = $client;
		$this->service      = new ServiceDrive( $this->client );
		$this->drives       = $this->service->drives;
		$this->about        = $this->service->about;
		$this->files        = $this->service->files;
		$this->permissions  = $this->service->permissions;
		$this->service_name = $this->service->serviceName;
	}
}
