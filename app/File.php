<?php

namespace Pninja\ND\App;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

use Pninja\ND\Google\Service\ServiceDriveDriveFile;
use Pninja\ND\Google\Service\ServiceDriveDriveFileCapabilities;
use WP_Error;

class File extends BaseFile {

	/**
	 *  The API file object
	 *
	 * @var ServiceDriveDriveFile
	 */
	private $apiFile;

	public function processFile( ServiceDriveDriveFile $apiFile, bool $virtualFolder = false ) {
		if ( ! $apiFile instanceof ServiceDriveDriveFile ) {
			return new WP_Error( 403, __( 'Google response is not a valid Entry.', 'ninja-drive' ) );
		}

		$this->apiFile = $apiFile;

		$this->setVirtualFolder( $virtualFolder );

		$this->setMetadata( $apiFile );

		$this->setShortcutDetailsAttributes( $apiFile );

		$this->setPreviewAndPermissions( $apiFile );

		$this->setIconAndThumbnail( $apiFile );

		$this->setMediaData( $apiFile );
	}

	public function processData() {
		$properties = array( 'id', 'fileKey', 'name', 'description', 'parentId', 'accountId', 'size', 'mimeType', 'extension', 'icon', 'thumbnail', 'additionalData', 'metaData', 'isDir', 'isShared', 'isStarred', 'media', 'permissions' );
		foreach ( $properties as $property ) {
			$this->{$property} = $this->getProperty( $property );
		}
	}

	private static $editableMimeTypes = array(
		'application/msword'                             => true,
		'application/vnd.ms-excel'                       => true,
		'application/vnd.ms-powerpoint'                  => true,
		'application/vnd.ms-excel.sheet.macroenabled.12' => true,
		'application/vnd.google-apps.drawing'            => true,
		'application/vnd.google-apps.document'           => true,
		'application/vnd.google-apps.spreadsheet'        => true,
		'application/vnd.google-apps.presentation'       => true,
		'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' => true,
		'application/vnd.openxmlformats-officedocument.presentational.slideshow' => true,
		'application/vnd.openxmlformats-officedocument.wordprocessingml.document' => true,
		'application/vnd.openxmlformats-officedocument.presentationml.presentation' => true,
	);

	public function editSupportedInCloud() {
		return isset( self::$editableMimeTypes[ $this->getMimeType() ] );
	}

	public function hasPermission( $permission_role = array( 'reader', 'writer' ) ) {
		$users = $this->permissions['users'] ?? array();

		if ( empty( $users ) ) {
			return false;
		}

		foreach ( $users as $user ) {
			if ( $user['type'] == 'anyone' ) {
				return true;
			}

			// Check if user has required permission role
			if ( in_array( $user['role'], $permission_role, true ) ) {
				return true;
			}
		}

		return false;
	}

	// ========================== Private methods ==========================
	private function setMetadata( ServiceDriveDriveFile $apiFile ) {
		$this->setId( $apiFile->getId() );
		$this->setName( $apiFile->getName() );
		$this->setDriveId( $apiFile->getDriveId() );
		$this->setStarred( $apiFile->getStarred() );
		$this->setAccountId( $apiFile->getAccountId() );

		if ( ! empty( $apiFile->getFileExtension() ) ) {
			$this->setExtension( strtolower( $apiFile->getFileExtension() ) );
		}

		if ( 'application/vnd.google-apps.shortcut' === $apiFile->getMimeType() ) {
			$this->setExtension( 'shortcut' );
		} elseif ( empty( $apiFile->getFileExtension() ) ) {
			$mimeType  = $apiFile->getMimeType();
			$extension = pnpndGetExtensionByMimeType( $mimeType );
			$this->setExtension( $extension ?: 'unknown' );
		}

		$this->setMimeType( $apiFile->getMimeType() );

		// Set basename more efficiently
		if ( empty( $this->extension ) ) {
			$this->setBasename( $this->getName() );
		} else {
			// Remove extension from filename (case insensitive)
			$this->setBasename( str_ireplace( '.' . $this->getExtension(), '', $apiFile->getName() ) );
		}

		$this->setTrashed( $apiFile->getTrashed() );
		$this->setIsDir( 'application/vnd.google-apps.folder' === $apiFile->getMimeType() );
		$this->setSize( $this->isDir() ? 0 : $apiFile->getSize() );
		$this->setDescription( $apiFile->getDescription() );
		$this->setLastEdited( $apiFile->getModifiedTime() );
		$this->setCreatedTime( $apiFile->getCreatedTime() );

		$this->setOwnedByMe( $this->isOwnedByMe( $apiFile ) );
		$this->setShared( $this->isShared( $apiFile ) );

		$this->setParentId( $apiFile->getParents() );
		$this->setParentFolder( $apiFile );
		$this->setResourceKey( $apiFile->getResourceKey() );
	}

	private function setPreviewAndPermissions( ServiceDriveDriveFile $apiFile ) {
		$capabilities = $apiFile->getCapabilities();
		if ( empty( $capabilities ) ) {
			return;
		}
		$this->setCapabilities( $capabilities );

		$permissions = $this->getPermissions( $apiFile );
		$this->setPermissions( $permissions );
	}

	private function setIconAndThumbnail( ServiceDriveDriveFile $apiFile ) {
		$icon = $apiFile->getIconLink();
		if ( ! empty( $icon ) ) {
			$this->setIcon( str_replace( array( '/16/' ), array( '/128/' ), $icon ) );
		}
		$thumbnail = $apiFile->getThumbnailLink();
		$this->setThumbnail( $thumbnail );
	}

	private function setMediaData( ServiceDriveDriveFile $apiFile ) {
		$mediaData = array();

		$imageMetadata = $apiFile->getImageMediaMetadata();
		$videoMetadata = $apiFile->getVideoMediaMetadata();

		if ( ! empty( $imageMetadata ) ) {
			$mediaData = $this->getImageMetadata( $imageMetadata );
		} elseif ( ! empty( $videoMetadata ) ) {
			$mediaData = $this->getVideoMetadata( $videoMetadata );
		}

		$this->setMedia( $mediaData );
	}

	private function setParentFolder( ServiceDriveDriveFile $apiFile ) {
		if ( empty( $apiFile->getParents() ) && ! $this->isVirtualFolder() ) {
			if ( $apiFile->getDriveId() === $apiFile->getId() ) {
				$this->setParentId( 'shared-drives' );
				$this->setVirtualFolder( 'shared-drive' );
			} elseif ( $apiFile->getShared() && ! $apiFile->getOwnedByMe() ) {
				$this->setParentId( 'shared' );
			} elseif ( ! empty( $apiFile->getSharedWithMeTime() ) && ! $apiFile->getOwnedByMe() ) {
				$this->setParentId( 'shared' );
			} elseif ( ! $apiFile->getShared() && $apiFile->getOwnedByMe() ) {
				$this->setParentId( 'computers' );
				$this->setVirtualFolder( 'computer' );
			} else {
				return new WP_Error( 403, __( 'Found an item without a parent folder (orphaned):', 'ninja-drive' ) );
			}
		}
	}

	private function isOwnedByMe( ServiceDriveDriveFile $apiFile ) {
		return ( 'mydrive' !== $apiFile->getDriveId() ) ? true : $apiFile->getOwnedByMe();
	}

	/**
	 * Checks if a file is shared.
	 *
	 * Checks if a file is shared with the current user.
	 *
	 * @param ServiceDriveDriveFile|null $apiFile The file to be checked. If empty, uses the current file.
	 * @return bool True if the file is shared, false if not.
	 */
	private function isShared( $apiFile = null ) {
		if ( empty( $apiFile ) ) {
			$apiFile = $this->apiFile;
		}

		return $apiFile->getShared();
	}

	private function setCapabilities( ServiceDriveDriveFileCapabilities $capabilities ) {
		if ( ! $capabilities instanceof ServiceDriveDriveFileCapabilities ) {
			return;
		}

		$this->setCanEditInCloud( $capabilities->getCanEdit() && $this->editSupportedInCloud() );
		$this->setPermission( 'canEdit', $capabilities->getCanEdit() );
		$this->setPermission( 'canRename', $capabilities->getCanRename() );
		$this->setPermission( 'canShare', $capabilities->getCanShare() );
		$this->setPermission( 'canDelete', $capabilities->getCanDelete() );
		$this->setPermission( 'canTrash', $capabilities->getCanTrash() );
		$this->setPermission( 'canMove', $capabilities->getCanMoveItemWithinDrive() );
		$this->setPermission( 'canChangeCopyRequiresWriterPermission', $capabilities->getCanChangeCopyRequiresWriterPermission() ?? false );
	}

	private function getPermissions( ServiceDriveDriveFile $apiFile ) {
		$users          = array();
		$apiPermissions = $apiFile->getPermissions();

		if ( count( $apiPermissions ) > 0 ) {
			foreach ( $apiPermissions as $permission ) {
				$users[ $permission->getId() ] = array(
					'type'   => $permission->getType(),
					'role'   => $permission->getRole(),
					'domain' => $permission->getDomain(),
				);
			}
		}

		return array(
			'users'                                 => $users,
			'canPreview'                            => true,
			'canDownload'                           => true,
			'canAdd'                                => $apiFile->getOwnedByMe(),
			'canMove'                               => $apiFile->getOwnedByMe(),
			'canShare'                              => $apiFile->getOwnedByMe(),
			'canTrash'                              => $apiFile->getOwnedByMe(),
			'canRename'                             => $apiFile->getOwnedByMe(),
			'canDelete'                             => $apiFile->getOwnedByMe(),
			'copyRequiresWriterPermission'          => $apiFile->getCopyRequiresWriterPermission(),
			'canChangeCopyRequiresWriterPermission' => $this->getPermission( 'canChangeCopyRequiresWriterPermission' ),
		);
	}

	private function setShortcutDetailsAttributes( $apiFile ) {
		$shortcutDetails = $apiFile->getShortcutDetails();

		if ( ! empty( $shortcutDetails ) ) {
			$this->setShortcutDetails(
				array(
					'targetId'          => $shortcutDetails->getTargetId(),
					'targetMimeType'    => $shortcutDetails->getTargetMimeType(),
					'targetResourceKey' => $shortcutDetails->getTargetResourceKey(),
				)
			);
		}
	}

	private function getImageMetadata( $imageMetadata ) {
		$mediaData = array();
		if ( empty( $imageMetadata->rotation ) || 0 === $imageMetadata->getRotation() || 2 === $imageMetadata->getRotation() ) {
			$mediaData['width']  = $imageMetadata->getWidth();
			$mediaData['height'] = $imageMetadata->getHeight();
		} else {
			$mediaData['width']  = $imageMetadata->getHeight();
			$mediaData['height'] = $imageMetadata->getWidth();
		}

		if ( ! empty( $imageMetadata->time ) ) {
			$dtime = \DateTime::createFromFormat( 'Y:m:d H:i:s', $imageMetadata->getTime(), new \DateTimeZone( 'UTC' ) );

			if ( $dtime ) {
				$mediaData['time'] = $dtime->getTimestamp();
			}
		}

		return $mediaData;
	}

	private function getVideoMetadata( $videoMetadata ) {
		return array(
			'width'    => $videoMetadata->getWidth(),
			'height'   => $videoMetadata->getHeight(),
			'duration' => $videoMetadata->getDurationMillis(),
		);
	}
}
