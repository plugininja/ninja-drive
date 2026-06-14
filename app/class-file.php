<?php

namespace Pnpnd\ND\App;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

use Pnpnd\ND\Google\Service\ServiceDriveDriveFile;
use Pnpnd\ND\Google\Service\ServiceDriveDriveFileCapabilities;
use WP_Error;

class File extends Base_File {

	private $api_file;

	public function process_file( ServiceDriveDriveFile $api_file, bool $virtual_folder = false ) {
		if ( ! $api_file instanceof ServiceDriveDriveFile ) {
			return new WP_Error( 403, __( 'Google response is not a valid Entry.', 'ninja-drive' ) );
		}

		$this->api_file = $api_file;

		$this->set_virtual_folder( $virtual_folder );

		$this->set_metadata( $api_file );

		$this->set_shortcut_details_attributes( $api_file );

		$this->set_preview_and_permissions( $api_file );

		$this->set_icon_and_thumbnail( $api_file );

		$this->set_media_data( $api_file );
	}

	public function process_data() {
		$properties = array( 'id', 'file_key', 'name', 'description', 'parent_id', 'account_id', 'size', 'mime_type', 'extension', 'icon', 'thumbnail', 'additional_data', 'meta_data', 'is_dir', 'is_shared', 'is_starred', 'media', 'permissions' );
		foreach ( $properties as $property ) {
			$this->{$property} = $this->get_property( $property );
		}
	}

	private static $editable_mimetypes = array(
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

	public function edit_supported_in_cloud() {
		return isset( self::$editable_mimetypes[ $this->get_mimetype() ] );
	}

	public function has_permission( $permission_role = array( 'reader', 'writer' ) ) {
		$users = $this->permissions['users'] ?? array();

		if ( empty( $users ) ) {
			return false;
		}

		foreach ( $users as $user ) {
			if ( 'anyone' === $user['type'] ) {
				return true;
			}

			if ( in_array( $user['role'], $permission_role, true ) ) {
				return true;
			}
		}

		return false;
	}

	private function set_metadata( ServiceDriveDriveFile $api_file ) {
		$this->set_id( $api_file->getId() );
		$this->set_name( $api_file->getName() );
		$this->set_drive_id( $api_file->getDriveId() );
		$this->set_starred( $api_file->getStarred() );
		$this->set_account_id( $api_file->getAccountId() );

		if ( ! empty( $api_file->getFileExtension() ) ) {
			$this->set_extension( strtolower( $api_file->getFileExtension() ) );
		}

		if ( 'application/vnd.google-apps.shortcut' === $api_file->getMimeType() ) {
			$this->set_extension( 'shortcut' );
		} elseif ( empty( $api_file->getFileExtension() ) ) {
			$mime_type = $api_file->getMimeType();
			$extension = pnpnd_get_extension_by_mimetype( $mime_type );
			$this->set_extension( $extension ? $extension : 'unknown' );
		}

		$this->set_mimetype( $api_file->getMimeType() );

		if ( empty( $this->extension ) ) {
			$this->set_base_name( $this->get_name() );
		} else {
			$this->set_base_name( str_ireplace( '.' . $this->get_extension(), '', $api_file->getName() ) );
		}

		$this->set_trashed( $api_file->getTrashed() );
		$this->set_is_dir( 'application/vnd.google-apps.folder' === $api_file->getMimeType() );
		$this->set_size( $this->is_dir() ? 0 : $api_file->getSize() );
		$this->set_description( $api_file->getDescription() );
		$this->set_last_edited( $api_file->getModifiedTime() );
		$this->set_created_time( $api_file->getCreatedTime() );

		$this->set_owned_by_me( $this->is_owned_by_me( $api_file ) );
		$this->set_shared( $this->is_shared( $api_file ) );

		$this->set_parent_id( $api_file->getParents() );
		$this->set_parent_folder( $api_file );
		$this->set_resource_key( $api_file->getResourceKey() );
	}

	private function set_preview_and_permissions( ServiceDriveDriveFile $api_file ) {
		$capabilities = $api_file->getCapabilities();
		if ( empty( $capabilities ) ) {
			return;
		}
		$this->set_capabilities( $capabilities );

		$permissions = $this->get_permissions( $api_file );
		$this->set_permissions( $permissions );
	}

	private function set_icon_and_thumbnail( ServiceDriveDriveFile $api_file ) {
		$icon = $api_file->getIconLink();
		if ( ! empty( $icon ) ) {
			$this->set_icon( str_replace( array( '/16/' ), array( '/128/' ), $icon ) );
		}
		$thumbnail = $api_file->getThumbnailLink();
		$this->set_thumbnail( $thumbnail );
	}

	private function set_media_data( ServiceDriveDriveFile $api_file ) {
		$media_data = array();

		$image_metadata = $api_file->getImageMediaMetadata();
		$video_metadata = $api_file->getVideoMediaMetadata();

		if ( ! empty( $image_metadata ) ) {
			$media_data = $this->get_image_metadata( $image_metadata );
		} elseif ( ! empty( $video_metadata ) ) {
			$media_data = $this->get_video_metadata( $video_metadata );
		}

		$this->set_media( $media_data );
	}

	private function set_parent_folder( ServiceDriveDriveFile $api_file ) {
		if ( empty( $api_file->getParents() ) && ! $this->is_virtual_folder() ) {
			if ( $api_file->getDriveId() === $api_file->getId() ) {
				$this->set_parent_id( 'shared-drives' );
				$this->set_virtual_folder( 'shared-drive' );
			} elseif ( $api_file->getShared() && ! $api_file->getOwnedByMe() ) {
				$this->set_parent_id( 'shared' );
			} elseif ( ! empty( $api_file->getSharedWithMeTime() ) && ! $api_file->getOwnedByMe() ) {
				$this->set_parent_id( 'shared' );
			} elseif ( ! $api_file->getShared() && $api_file->getOwnedByMe() ) {
				$this->set_parent_id( 'computers' );
				$this->set_virtual_folder( 'computer' );
			} else {
				return new WP_Error( 403, __( 'Found an item without a parent folder (orphaned):', 'ninja-drive' ) );
			}
		}
	}

	private function is_owned_by_me( ServiceDriveDriveFile $api_file ) {
		return ( 'mydrive' !== $api_file->getDriveId() ) ? true : $api_file->getOwnedByMe();
	}

	private function is_shared( $api_file = null ) {
		if ( empty( $api_file ) ) {
			$api_file = $this->api_file;
		}

		return $api_file->getShared();
	}

	private function set_capabilities( ServiceDriveDriveFileCapabilities $capabilities ) {
		if ( ! $capabilities instanceof ServiceDriveDriveFileCapabilities ) {
			return;
		}

		$this->set_can_edit_in_cloud( $capabilities->getCanEdit() && $this->edit_supported_in_cloud() );
		$this->set_permission( 'canEdit', $capabilities->getCanEdit() );
		$this->set_permission( 'canRename', $capabilities->getCanRename() );
		$this->set_permission( 'canShare', $capabilities->getCanShare() );
		$this->set_permission( 'canDelete', $capabilities->getCanDelete() );
		$this->set_permission( 'canTrash', $capabilities->getCanTrash() );
		$this->set_permission( 'canMove', $capabilities->getCanMoveItemWithinDrive() );
		$this->set_permission( 'canChangeCopyRequiresWriterPermission', $capabilities->getCanChangeCopyRequiresWriterPermission() ?? false );
	}

	private function get_permissions( ServiceDriveDriveFile $api_file ) {
		$users           = array();
		$api_permissions = $api_file->getPermissions();

		if ( count( $api_permissions ) > 0 ) {
			foreach ( $api_permissions as $permission ) {
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
			'canAdd'                                => $api_file->getOwnedByMe(),
			'canMove'                               => $api_file->getOwnedByMe(),
			'canShare'                              => $api_file->getOwnedByMe(),
			'canTrash'                              => $api_file->getOwnedByMe(),
			'canRename'                             => $api_file->getOwnedByMe(),
			'canDelete'                             => $api_file->getOwnedByMe(),
			'copyRequiresWriterPermission'          => $api_file->getCopyRequiresWriterPermission(),
			'canChangeCopyRequiresWriterPermission' => $this->get_permission( 'canChangeCopyRequiresWriterPermission' ),
		);
	}

	private function set_shortcut_details_attributes( $api_file ) {
		$shortcut_details = $api_file->getShortcutDetails();

		if ( ! empty( $shortcut_details ) ) {
			$this->set_shortcut_details(
				array(
					'targetId'          => $shortcut_details->getTargetId(),
					'targetMimeType'    => $shortcut_details->getTargetMimeType(),
					'targetResourceKey' => $shortcut_details->getTargetResourceKey(),
				)
			);
		}
	}

	private function get_image_metadata( $image_metadata ) {
		$media_data = array();
		if ( empty( $image_metadata->rotation ) || 0 === $image_metadata->getRotation() || 2 === $image_metadata->getRotation() ) {
			$media_data['width']  = $image_metadata->getWidth();
			$media_data['height'] = $image_metadata->getHeight();
		} else {
			$media_data['width']  = $image_metadata->getHeight();
			$media_data['height'] = $image_metadata->getWidth();
		}

		if ( ! empty( $image_metadata->time ) ) {
			$dtime = \DateTime::createFromFormat( 'Y:m:d H:i:s', $image_metadata->getTime(), new \DateTimeZone( 'UTC' ) );

			if ( $dtime ) {
				$media_data['time'] = $dtime->getTimestamp();
			}
		}

		return $media_data;
	}

	private function get_video_metadata( $video_metadata ) {
		return array(
			'width'    => $video_metadata->getWidth(),
			'height'   => $video_metadata->getHeight(),
			'duration' => $video_metadata->getDurationMillis(),
		);
	}
}
