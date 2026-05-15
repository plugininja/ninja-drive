<?php

namespace Pninja\ND\App\Service;

use Pninja\ND\App\Client;
use Pninja\ND\Google\Client as GoogleClient;
use Pninja\ND\Google\Service\ServiceDrive;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

abstract class DriveService {

	/**
	 * Google Client instance.
	 *
	 * @var GoogleClient
	 */
	protected $client;

	/**
	 * ServiceDrive instance.
	 *
	 * @var \Pninja\ND\Google\Service\ServiceDrive
	 */
	protected $service;

	/**
	 * About API instance.
	 *
	 * @var \Pninja\ND\Google\Service\ServiceDriveAboutResource
	 */
	protected $about;

	/**
	 * Files API instance.
	 *
	 * @var \Pninja\ND\Google\Service\ServiceDriveFilesResource
	 */
	protected $files;

	/**
	 * Permissions API instance.
	 *
	 * @var \Pninja\ND\Google\Service\ServiceDrivePermissionsResource
	 */
	protected $permissions;

	/**
	 * Drives API instance.
	 *
	 * @var \Pninja\ND\Google\Service\ServiceDriveDrivesResource
	 */
	protected $drives;

	/**
	 * Service name.
	 *
	 * @var string
	 */
	protected $serviceName;

	public function __construct( Client $client ) {
		$this->init( $client->getClient() );
	}

	// ================= Protected methods ==================

	protected function getGoogleService() {
		return $this->service;
	}

	protected function getGoogleClient() {
		return $this->client;
	}

	protected function getGoogleAbout() {
		return $this->about;
	}

	protected function getGoogleDrives() {
		return $this->drives;
	}

	protected function getGoogleFiles() {
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
		$this->client  = $client;
		$this->service = new ServiceDrive( $this->client );

		$this->drives      = $this->service->drives;
		$this->about       = $this->service->about;
		$this->files       = $this->service->files;
		$this->permissions = $this->service->permissions;
		$this->serviceName = $this->service->serviceName;
	}
}
