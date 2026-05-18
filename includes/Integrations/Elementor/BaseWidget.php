<?php

namespace Pnpnd\ND\Integrations\Elementor;

use Elementor\Controls_Manager;
use Elementor\Widget_Base;
use Pnpnd\ND\Widget;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

abstract class BaseWidget extends Widget_Base {

	abstract protected function get_module_type();
	abstract protected function is_pro(): bool;

	public function register_controls() {
		$this->start_controls_section(
			'section_content',
			array(
				'label' => __( 'Content', 'ninja-drive' ),
			)
		);

		$this->add_control(
			'edit_widget',
			array(
				'label' => $this->get_title(),
				'type'  => Controls_Manager::BUTTON,
				'text'  => __( 'Configure Widget', 'ninja-drive' ),
				'event' => 'pnpnd_elementor_settings',
			)
		);

		$this->add_control(
			'widget_data',
			array(
				'label'   => __( 'Widget Data', 'ninja-drive' ),
				'type'    => Controls_Manager::HIDDEN,
				'default' => $this->get_default_module_data(),
			)
		);

		$this->add_control(
			'select_widget',
			array(
				'label'       => __( 'Select Widget', 'ninja-drive' ),
				'type'        => Controls_Manager::SELECT,
				'options'     => $this->get_module_options( $this->get_module_type() ),
				'default'     => '',
				'description' => __( 'Select a widget to display its content.', 'ninja-drive' ),
				'label_block' => true,
			)
		);

		$this->end_controls_section();
	}

	protected function get_default_module_data() {
		return wp_json_encode(
			array(
				'id'     => $this->get_module_type(),
				'type'   => $this->get_module_type(),
				'is_pro' => $this->is_pro(),
			)
		);
	}

	public function is_editable() {
		return true;
	}

	public function get_script_depends() {
		return array();
	}

	public function get_style_depends() {
		return array( 'pnpnd-common', 'pnpnd-admin' );
	}

	public function render() {
		$settings  = $this->get_settings_for_display();
		$widget_id = $this->get_widget_id( $settings );

		if ( $this->should_show_empty_notice( $widget_id ) ) {
			$this->render_empty_notice();

			return;
		}

		$this->render_module( $widget_id );
	}

	protected function get_widget_id( $settings ) {
		$widget_data = json_decode( $settings['widget_data'] ?? '', true );

		return $widget_data['id'] ?? null;
	}

	protected function should_show_empty_notice( $widget_id ) {
		if ( ! is_user_logged_in() ) {
			return false;
		}

		return empty( $widget_id ) || ! intval( $widget_id );
	}

	protected function render_module( $widget_id ) {
		$widget_data = Widget::getInstance()->render(
			array(
				'id'     => $widget_id,
				'type'   => 'file-uploader',
				'return' => 'array',
			)
		);

		if ( empty( $widget_data['html'] ) ) {
			return;
		}

		$script_handle = 'pnpnd-elementor-data-' . uniqid();
		wp_register_script( $script_handle, false, array(), PNPND_VERSION, false );
		wp_enqueue_script( $script_handle );
		wp_add_inline_script(
			$script_handle,
			'window.' . esc_js( $widget_data['data_id'] ) . ' = ' . wp_json_encode( $widget_data['data'] ) . ';'
		);
		wp_print_scripts( $script_handle );

		echo wp_kses(
			$widget_data['html'],
			array(
				'div' => array(
					'class'              => array(),
					'id'                 => array(),
					'data-post_id'       => array(),
					'data-id'            => array(),
					'data-status'        => array(),
					'pnpnd-theme-status' => array(),
					'style'              => array(),
				),
			)
		);
	}

	protected function render_empty_notice() {
		$args = array(
			'title'          => $this->get_title(),
			'description'    => __( 'Click Configure to setup your widget', 'ninja-drive' ),
			'icon'           => $this->get_icon(),
			'iconClass'      => $this->get_icon(),
			'card_status'    => 'primary',
			'primary_button' => array(
				'title'  => __( 'Configure Widget', 'ninja-drive' ),
				'target' => false,
				'icon'   => 'settings',
				'class'  => 'configure-widget',
			),
		);

		pnpndGetTemplate( 'notice-card/notice-card-common', $args );
	}

	public function get_module_options( $type = '' ) {
		try {
			$widgets = \Pnpnd\ND\Models\Widget::getInstance()->getAll( array( 'perPage' => 0 ) );

			if ( empty( $widgets ) ) {
				return array();
			}

			if ( ! empty( $type ) ) {
				$widgets = array_filter(
					$widgets,
					function ( $widget ) use ( $type ) {
						return $widget['type'] === $type;
					}
				);
			}
			$formatted_options = array(
				/* translators: %s: Widget type */
				'' => sprintf( __( '-- Select %s Widget --', 'ninja-drive' ), ucfirst( $type ) ),
			);

			foreach ( $widgets as $widget ) {
				if ( ! empty( $widget['id'] ) && ! empty( $widget['title'] ) ) {
					$formatted_options[ $widget['id'] ] = $widget['id'] . ' - ' . $widget['title'];
				}
			}

			return $formatted_options;
		} catch ( \Exception $e ) {

			return array();
		}
	}
}
