<?php

namespace Pninja\ND;

use Pninja\ND\Utils\Helpers;
use Pninja\ND\Utils\Singleton;

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
	private $activeIntegrations = array();

	private function doHooks() {
		add_action( 'plugins_loaded', array( $this, 'loadIntegrations' ) );
	}

	/**
	 * Register a new integration
	 */
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

		$integration = Helpers::getSetting( 'integrations', array() );
		if ( isset( $integration[ $id ] ) ) {
			$defaults = wp_parse_args( $integration[ $id ], $defaults );
		}

		$this->integrations[ $id ] = wp_parse_args( $data, $defaults );
	}

	/**
	 * Get all registered integrations
	 */
	public function getIntegrations(): array {
		return $this->integrations;
	}

	/**
	 * Load only active integrations
	 */
	public function loadIntegrations(): void {
		$this->integrations = Helpers::getSetting( 'integrations' ) ?: array();

		foreach ( $this->integrations as $id => $integration ) {
			if (
				! empty( $integration['active'] )
				&& is_callable( $integration['callback'] )
				&& in_array( $id, $this->activeIntegrations, true )
			) {
				call_user_func( $integration['callback'], $id, $integration );
			}
		}
	}

	/**
	 * Check if integration exists
	 */
	public function has( string $id ): bool {
		return isset( $this->integrations[ $id ] );
	}

	/**
	 * Get single integration
	 */
	public function get( string $id ): ?array {
		return $this->integrations[ $id ] ?? null;
	}
}
