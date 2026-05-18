<?php

namespace Pnpnd\ND\App\Service;

use Exception;
use WP_Error;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class AccountService extends DriveService {

	/**
	 * Retrieves account information including user details and storage quota.
	 *
	 * @return array|WP_Error Returns an associative array with account details such as user ID, name, email, photo,
	 *                        storage usage, and root ID, or a WP_Error on failure.
	 */
	public function get() {

		try {
			$about = $this->about->get( array( 'fields' => 'storageQuota,user' ) );

			$data = array(
				'id'      => $about->getUser()->getPermissionId(),
				'name'    => $about->getUser()->getDisplayName(),
				'email'   => $about->getUser()->getEmailAddress(),
				'photo'   => $about->getUser()->getPhotoLink(),
				'storage' => array(
					'usage' => $about->getStorageQuota()->getUsage(),
					'limit' => $about->getStorageQuota()->getLimit(),
				),
				'lost'    => false,
				'root_id' => $this->service->files->get( 'root' )->getId(),
			);

			return $data;
		} catch ( Exception $exception ) {
			return new WP_Error( 500, $exception->getMessage() );
		}
	}
}
