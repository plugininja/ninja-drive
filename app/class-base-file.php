<?php

namespace Pnpnd\ND\App;

use Pnpnd\ND\Google\Service\ServiceDriveDriveFile;
use Pnpnd\ND\Models\Files;
use Pnpnd\ND\Utils\Helpers;

defined( 'ABSPATH' ) or die( 'Direct access is not allowed' );

abstract class Base_File {

	public $id;
	public $file_key;
	public $name;
	public $parent_id;
	public $account_id;
	public $size;
	public $mime_type;
	public $extension;
	public $icon;
	public $thumbnail;
	public $is_dir;
	public $meta_data = false;
	public $is_starred;
	public $is_shared = false;
	public $description;
	public $permissions = array(
		'can_download'                               => false,
		'can_preview'                                => false,
		'can_delete'                                 => false,
		'can_trash'                                  => false,
		'can_move'                                   => false,
		'can_edit'                                   => false,
		'can_share'                                  => false,
		'can_rename'                                 => false,
		'copy_requires_writer_permission'            => false,
		'can_change_copy_requires_writer_permission' => false,
	);

	public $media;
	public $additional_data = array();
	public $life_time       = 0;

	protected $data = array();

	public function __construct( $data, bool $is_virtual_folder = false ) {
		if ( empty( $data ) ) {
			return;
		}

		if ( $data instanceof ServiceDriveDriveFile ) {
			$this->file_key = pnpnd_generate_key( $data->getId(), $data->getAccountId() );
			$this->process_file( $data, $is_virtual_folder );
			$this->data = $this->to_array();
		} elseif ( is_array( $data ) && isset( $data['id'], $data['account_id'] ) ) {
			$this->file_key = pnpnd_generate_key( $data['id'], $data['account_id'] );
			$this->data     = $data;
			$this->process_data();
		}
	}

	abstract public function process_file( ServiceDriveDriveFile $api_file, bool $is_virtual_folder = false );
	abstract public function process_data();

	protected function get_property( $key, $default_value = null ) {
		return $this->data[ $key ] ?? $default_value;
	}

	public function to_array() {

		return $this->data_for_save( false );
	}

	public function data_for_save( $is_serialized = true ) {
		$file = array(
			'id'              => $this->id,
			'file_key'        => $this->file_key,
			'name'            => $this->name,
			'description'     => $this->description,
			'parent_id'       => $this->parent_id,
			'account_id'      => $this->account_id,
			'size'            => $this->size,
			'mime_type'       => $this->mime_type,
			'extension'       => $this->extension,
			'icon'            => $this->icon,
			'thumbnail'       => $this->thumbnail,
			'is_dir'          => $this->is_dir,
			'is_shared'       => $this->is_shared,
			'is_starred'      => $this->is_starred,
			'additional_data' => $this->additional_data,
			'meta_data'       => $this->meta_data,
			'media'           => $this->media,
			'permissions'     => $this->permissions,
		);

		return $file;
	}

	public function get_account_id() {
		return $this->account_id;
	}

	public function set_account_id( $account_id ) {
		$this->account_id = $account_id;
	}

	public function has_thumbnail() {
		return ! empty( $this->thumbnail );
	}

	public function set_thumbnail( $value ) {
		$this->thumbnail = $value;
	}

	public function get_shared() {
		return $this->is_shared;
	}

	public function set_shared( $shared = true ) {
		$this->is_shared = $shared;

		return $this;
	}

	public function get_starred() {
		return $this->is_starred;
	}

	public function set_starred( $is_starred ) {
		$this->is_starred = (bool) $is_starred;

		return $this;
	}

	public function get_media( $setting = null ) {
		if ( ! empty( $setting ) ) {
			if ( isset( $this->media[ $setting ] ) ) {
				return $this->media[ $setting ];
			}

			return null;
		}

		return $this->media;
	}

	public function set_media( $media ) {
		$this->media = $media;
	}

	public function get_icon() {
		return $this->icon;
	}

	public function set_icon( $icon ) {
		$this->icon = $icon;
	}

	public function get_id() {
		return $this->id;
	}

	public function set_id( $id ) {
		$this->id = $id;
	}

	public function get_name() {
		return $this->name;
	}

	public function set_name( $name ) {
		$this->name = $name;
	}

	public function get_parent_id() {
		return $this->parent_id;
	}

	public function set_parent_id( $parent_id ) {
		$this->parent_id = is_array( $parent_id ) ? reset( $parent_id ) : $parent_id;
	}

	public function get_parent_key() {
		return pnpnd_generate_key( $this->parent_id, $this->account_id );
	}

	public function has_parent() {
		return ! empty( $this->parent_id );
	}

	public function get_extension() {
		return $this->extension;
	}

	public function set_extension( $extension ) {
		$this->extension = $extension;
	}

	public function get_mimetype() {
		return $this->mime_type;
	}

	public function set_mimetype( $mime_type ) {
		$this->mime_type = ! empty( $mime_type ) ? $mime_type : '';
	}

	public function is_dir() {
		return $this->is_dir;
	}

	public function set_is_dir( bool $is_dir ) {
		$this->is_dir = $is_dir;
		return $this;
	}

	public function is_file() {
		return ! $this->is_dir;
	}

	public function meta_data() {
		return ! empty( $this->meta_data );
	}

	public function set_meta_data( $meta_data ) {
		$this->meta_data = $meta_data;
	}

	public function get_size() {
		return $this->size;
	}

	public function set_size( $size ) {
		$this->size = (int) $size;
	}

	public function get_description() {
		return $this->description ?? '';
	}

	public function set_description( $description ) {
		$this->description = ! empty( $description ) ? trim( $description ) : '';
	}

	public function set_permissions( array $permissions ) {
		$this->permissions = $permissions;
	}

	public function get_permission( string $key ) {
		return $this->permissions[ $key ] ?? null;
	}
	public function set_permission( string $key, $value ) {
		$this->permissions[ $key ] = $value;

		return $this;
	}

	public function get_file_key() {
		return $this->file_key;
	}
	public function set_file_key() {
		$this->file_key = pnpnd_generate_key( $this->id, $this->account_id );
	}

	public function save() {
		Files::get_instance()->add_file( $this->data_for_save() );

		return $this->to_array();
	}

	public function set_life_time( $life_time ) {
		$this->life_time = $life_time;
	}

	public function get_life_time() {
		return $this->life_time;
	}

	public function get_can_preview_in_cloud() {
		return $this->additional_data['can_preview_in_cloud'] ?? false;
	}

	public function set_can_preview_in_cloud( $can_preview_in_cloud ) {
		$this->additional_data['can_preview_in_cloud'] = $can_preview_in_cloud;

		return $this;
	}

	public function get_can_edit_in_cloud() {
		return $this->additional_data['can_edit_in_cloud'] ?? false;
	}

	public function set_can_edit_in_cloud( $can_edit_in_cloud ) {
		$this->additional_data['can_edit_in_cloud'] = $can_edit_in_cloud;

		return $this;
	}

	public function get_resource_key() {
		return $this->additional_data['resource_key'] ?? null;
	}

	public function set_resource_key( $resource_key ) {
		$this->additional_data['resource_key'] = $resource_key;

		return $this;
	}

	public function has_resource_key() {
		return ! empty( $this->additional_data['resource_key'] ?? false );
	}

	public function set_export_links( $export_links ) {
		$this->additional_data['export_links'] = $export_links;

		return $this;
	}
	public function get_created_time() {
		return $this->additional_data['created_time'] ?? '';
	}

	public function set_created_time( $created_time ) {
		$this->additional_data['created_time'] = $created_time;

		return $this;
	}

	public function get_created_time_formatted( $is_short = true ) {
		return empty( $this->additional_data['created_time'] ) ? '' : Helpers::format_date_time( strtotime( $this->additional_data['created_time'] ), $is_short );
	}

	public function get_last_edited() {
		return $this->additional_data['last_edited'] ?? '';
	}

	public function set_last_edited( $last_edited ) {
		$this->additional_data['last_edited'] = $last_edited;

		return $this;
	}

	public function get_last_edited_formatted( $is_short = true ) {
		return empty( $this->additional_data['last_edited'] ) ? '' : Helpers::format_date_time( strtotime( $this->additional_data['last_edited'] ), $is_short );
	}

	public function is_virtual_folder() {
		return $this->additional_data['is_virtual_folder'] ?? false;
	}

	public function set_virtual_folder( $is_virtual_folder ) {
		$this->additional_data['is_virtual_folder'] = $is_virtual_folder;

		return $this;
	}

	public function get_owned_by_me() {
		return $this->additional_data['owned_by_me'] ?? false;
	}

	public function set_owned_by_me( $is_owned_by_me = true ) {
		$this->additional_data['owned_by_me'] = $is_owned_by_me;

		return $this;
	}

	public function get_trashed() {
		return $this->additional_data['trashed'] ?? false;
	}

	public function set_trashed( $is_trashed ) {
		$this->additional_data['trashed'] = (bool) $is_trashed;

		return $this;
	}

	public function get_additional_data() {
		return $this->additional_data;
	}

	public function get_drive_id() {
		return $this->additional_data['drive_id'] ?? null;
	}

	public function set_drive_id( $drive_id ) {
		$this->additional_data['drive_id'] = $drive_id;

		return $this;
	}

	public function get_base_name() {
		return $this->additional_data['base_name'] ?? $this->base_name ?? pathinfo( $this->name, PATHINFO_FILENAME );
	}

	public function set_base_name( $base_name ) {
		$this->additional_data['base_name'] = $base_name;

		return $this;
	}

	public function get_shortcut_details() {
		return $this->additional_data['shortcut_details'] ?? null;
	}

	public function set_shortcut_details( array $shortcut_details ) {
		$this->additional_data['shortcut_details'] = $shortcut_details;

		return $this;
	}
}
