<?php

namespace Pnpnd\ND\Integrations;

use Pnpnd\ND\App\App;
use Pnpnd\ND\Integration;
use Pnpnd\ND\Models\Widget as Models_Widget;
use Pnpnd\ND\Utils\Helpers;
use Pnpnd\ND\Widget;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

abstract class Base_Integration {

	protected $id;
	protected $title;
	protected $is_init      = false;
	protected $integrations = array();
	protected $is_active    = null;
	public function __construct( $id, $title ) {
		$this->id    = $id;
		$this->title = $title;

		Integration::get_instance()->register(
			$this->id,
			array(
				'title'    => $this->title,
				'callback' => array( $this, 'init' ),
			)
		);

		$this->integrations = Helpers::get_setting( 'integrations', array() );

		if ( $this->is_active() ) {
			$this->init( $this->id, $this->integrations[ $this->id ] ?? array() );
		}
	}

	abstract public function init( string $id, array $integration ): void;

	public function is_active(): bool {
		if ( null === $this->is_active ) {
			$active_integrations = $this->integrations['active_integrations'] ?? array();
			$this->is_active     = in_array( $this->id, $active_integrations, true );
		}

		return $this->is_active;
	}

	protected function get_setting( string $key, $default_value = null ) {
		return $this->integrations[ $this->id ][ $key ] ?? $default_value;
	}

	public function get_id(): string {
		return $this->id;
	}

	public function get_title(): string {
		return $this->title;
	}

	public function is_initialized(): bool {
		return $this->is_init;
	}

	protected function get_google_drive_folder(): array {
		$folder = App::get_instance()->get_folders();

		if ( is_wp_error( $folder ) || empty( $folder ) ) {
			return array();
		}

		$options = array();
		foreach ( $folder as $file ) {
			$options[ $file['file_key'] ] = $file['name'];
		}

		return $options;
	}

	/**
	 * Return all file_uploader widgets as an id => label array for select dropdowns.
	 */
	public static function get_existing_file_uploader_widgets(): array {
		$widgets = Models_Widget::get_instance()->get_all(
			array(
				'type'     => 'file_uploader',
				'per_page' => 1000,
			)
		);

		$options = array( '' => __( 'Select a widget', 'ninja-drive' ) );

		if ( ! empty( $widgets ) && ! is_wp_error( $widgets ) ) {
			foreach ( $widgets as $widget ) {
				$label              = ! empty( $widget['title'] ) ? $widget['title'] : $widget['id'];
				$options[ $widget['id'] ] = sprintf( '%s (%s)', $label, $widget['id'] );
			}
		}

		return $options;
	}

	protected function render_widget( int $widget_id, string $field_name = '' ): string {
		$atts = array(
			'id'     => $widget_id,
			'return' => 'string',
		);

		if ( ! empty( $field_name ) ) {
			$atts['attributes'] = 'data-field-name=' . $field_name;
		}

		return (string) Widget::get_instance()->render( $atts );
	}
}
