<?php

namespace Pnpnd\ND;

use Pnpnd\ND\Utils\Helpers;
use Pnpnd\ND\Traits\Singleton;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class Integration {

	use Singleton;

	/**
	 * Registered integrations
	 *
	 * @var array
	 */
	private $integrations = array();

	/**
	 * Active integrations from settings
	 *
	 * @var array
	 */
	private $active_integrations = array();

	private function do_hooks() {
		add_action( 'plugins_loaded', array( $this, 'load_integrations' ) );
	}

	public function register( string $id, array $data ): void {
		if ( empty( $id ) ) {
			return;
		}

		$defaults = array(
			'title'      => '',
			'callback'   => null,
			'active'     => true,
			'capability' => 'manage_options',
		);

		$integration = Helpers::get_setting( 'integrations', array() );
		if ( isset( $integration[ $id ] ) ) {
			$defaults = wp_parse_args( $integration[ $id ], $defaults );
		}

		$this->integrations[ $id ] = wp_parse_args( $data, $defaults );
	}

	public function get_integrations(): array {
		return $this->integrations;
	}

	public function load_integrations(): void {
		$this->integrations = Helpers::get_setting( 'integrations', array() );

		foreach ( $this->integrations as $id => $integration ) {
			if (
				! empty( $integration['active'] )
				&& is_callable( $integration['callback'] )
				&& in_array( $id, $this->active_integrations, true )
			) {
				call_user_func( $integration['callback'], $id, $integration );
			}
		}
	}

	public function has( string $id ): bool {
		return isset( $this->integrations[ $id ] );
	}

	public function get( string $id ): ?array {
		return $this->integrations[ $id ] ?? null;
	}
}
