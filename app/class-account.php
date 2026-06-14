<?php

namespace Pnpnd\ND\App;

use Pnpnd\ND\Models\Account as Account_Model;

use JsonSerializable;
use WP_Error;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class Account implements JsonSerializable {

	private $id;
	private $account_key;
	private $lost;
	private $name;
	private $email;
	private $photo;
	private $root_id;
	private $user;
	private $storage;
	private $active;
	private $tokens;

	public function __construct( $id, $name, $email, $photo, $storage, $lost, $root_id, $user, $active = false, $tokens = '' ) {
		$this->id          = $id;
		$this->account_key = md5( "{$id}-{$root_id}" );
		$this->lost        = $lost;
		$this->name        = $name;
		$this->email       = $email;
		$this->photo       = $photo;
		$this->user        = $user;
		$this->root_id     = $root_id;
		$this->storage     = $storage;
		$this->active      = $active;
		$this->tokens      = $tokens;
	}

	public function get_id() {
		return $this->id;
	}

	public function get_account_key() {
		return $this->account_key;
	}

	public function get_name() {
		return $this->name;
	}

	public function get_email() {
		return $this->email;
	}

	public function get_photo() {
		return $this->photo;
	}

	public function get_root_id() {
		return $this->root_id;
	}

	public function get_user() {
		return $this->user;
	}

	public function get_storage() {
		return $this->storage;
	}

	public function get_access_token() {
		return $this->tokens;
	}

	public function has_access_token() {
		return ! empty( $this->tokens );
	}

	public function is_lost() {
		return $this->lost;
	}

	public function get_active() {
		return $this->active;
	}

	public function set_access_tokens( string $tokens ) {
		$this->tokens = $tokens;
		$set_token    = Account_Model::get_instance()->set_token( $this->get_id(), $tokens );

		if ( is_wp_error( $set_token ) ) {
			return $set_token;
		}

		return $set_token;
	}

	public function set_lost( $lost ) {
		$this->lost = $lost;
	}

	public function save() {
		return Account_Model::get_instance()->update_account( $this );
	}

	public function jsonSerialize(): array {
		return array(
			'id'          => $this->id,
			'account_key' => $this->account_key,
			'name'        => $this->name,
			'email'       => $this->email,
			'photo'       => $this->photo,
			'storage'     => $this->storage,
			'lost'        => $this->lost,
			'root_id'     => $this->root_id,
			'user'        => $this->user,
			'active'      => $this->active,
		);
	}
}
