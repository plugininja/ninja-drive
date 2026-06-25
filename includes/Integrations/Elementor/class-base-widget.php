<?php

namespace Pnpnd\ND\Integrations\Elementor;

use Elementor\Controls_Manager;
use Elementor\Widget_Base as Elementor_Widget_Base;
use Pnpnd\ND\Widget;
use Pnpnd\ND\Models\Widget as Widget_Model;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

abstract class Base_Widget extends Elementor_Widget_Base {

	abstract protected function get_module_type();
	abstract protected function is_pro(): bool;

	public function register_controls() {
		$this->start_controls_section(
			'section_content',
			[
				'label' => __( 'Content', 'ninja-drive' ),
			]
		);

		$this->add_control(
			'widget_data',
			[
				'label'   => __( 'Widget Data', 'ninja-drive' ),
				'type'    => Controls_Manager::HIDDEN,
				'default' => $this->get_default_module_data(),
			]
		);

		if ( $this->should_show_upgrade_notice() ) {
			$this->add_control(
				'pnpnd_upgrade_notice',
				[
					'type' => Controls_Manager::RAW_HTML,
					'raw'  => sprintf(
						'<div style="text-align:center;padding:16px 8px;">
							<span class="pnpnd-icon pnpnd-crown" style="display:block;margin-bottom:10px;color:#f0b429;font-size:0;line-height:0;"></span>
							<p style="font-size:13px;font-weight:600;margin:0 0 6px;">%s</p>
							<p style="font-size:12px;color:#888;margin:0 0 14px;">%s</p>
							<a href="%s" target="_blank" rel="noopener noreferrer"
							   data-pnpnd-upgrade-url="%s"
							   style="display:inline-block;padding:8px 20px;background:#f0b429;color:#1a1a2e;border-radius:4px;font-weight:700;font-size:12px;text-decoration:none;">
								%s
							</a>
						</div>',
						esc_html__( 'Premium Widget', 'ninja-drive' ),
						esc_html__( 'Upgrade to Ninja Drive Premium to unlock this widget.', 'ninja-drive' ),
						esc_url( $this->get_upgrade_url() ),
						esc_url( $this->get_upgrade_url() ),
						esc_html__( 'Upgrade Now', 'ninja-drive' )
					),
				]
			);
		} else {
			if ( ! $this->use_widget_selector() ) {
				$this->add_control(
					'edit_widget',
					[
						'label' => $this->get_title(),
						'type'  => Controls_Manager::BUTTON,
						'text'  => __( 'Configure Widget', 'ninja-drive' ),
						'event' => 'pnpnd_elementor_settings',
					]
				);
			}

			$this->add_control(
				'select_widget',
				[
					'label'       => __( 'Select Widget', 'ninja-drive' ),
					'type'        => Controls_Manager::SELECT,
					'options'     => $this->get_module_options( $this->get_module_type() ),
					'default'     => '',
					'description' => __( 'Select a widget to display its content.', 'ninja-drive' ),
					'label_block' => true,
				]
			);
		}

		$this->end_controls_section();
	}

	/**
	 * Whether this widget uses the "Select Widget" dropdown instead of the
	 * Configure button. Only the Widget Selector (empty module type) does.
	 */
	protected function use_widget_selector(): bool {
		$module_type = $this->get_module_type();

		return empty( $module_type );
	}

	protected function get_default_module_data() {
		return wp_json_encode(
			[
				'id'     => $this->get_module_type(),
				'type'   => $this->get_module_type(),
				'is_pro' => $this->is_pro(),
			]
		);
	}

	public function is_editable() {

		return true;
	}

	public function get_script_depends() {
		return [];
	}

	public function get_style_depends() {
		return [ 'pnpnd-common', 'pnpnd-admin' ];
	}

	public function render() {
		$settings  = $this->get_settings_for_display();
		$widget_id = $this->get_widget_id( $settings );

		if ( $this->should_show_upgrade_notice() ) {
			$this->render_upgrade_notice();

			return;
		}

		if ( $this->should_show_empty_notice( $widget_id ) ) {
			$this->render_empty_notice();

			return;
		}

		$this->render_module( $widget_id );
	}

	protected function should_show_upgrade_notice(): bool {
		if ( ! is_user_logged_in() ) {
			return false;
		}

		if ( ! $this->is_pro() ) {
			return false;
		}

		return true;
	}

	protected function get_upgrade_url(): string {
		return 'https://plugininja.com/google-drive-pricing';
	}

	protected function render_upgrade_notice(): void {
		$args = [
			'title'          => $this->get_title(),
			'description'    => __( 'This widget is available in the premium version.', 'ninja-drive' ),
			'icon_class'      => 'eicon-crown',
			'wrapper_class'  => 'pnpnd-elementor-widgets-card',
			'card_status'    => 'warning',
			'primary_button' => [
				'title'  => __( 'Upgrade Now', 'ninja-drive' ),
				'url'    => esc_url( $this->get_upgrade_url() ),
				'target' => true,
				'icon'   => 'crown',
				'type'   => 'link',
				'class'  => 'configure-widget',
			],
		];

		pnpnd_get_template( 'notice-card/notice-card-common', $args );
	}

	protected function get_widget_id( $settings ) {
		// The Select Widget dropdown takes precedence when a widget is chosen.
		if ( ! empty( $settings['select_widget'] ) ) {
			return $settings['select_widget'];
		}

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
		$widget_data = Widget::get_instance()->render(
			[
				'id'     => $widget_id,
				'return' => 'array',
			]
		);

		if ( empty( $widget_data['html'] ) ) {
			return;
		}

		$script_handle = 'pnpnd-elementor-data-' . uniqid();
		wp_register_script( $script_handle, false, [], PNPND_VERSION, false );
		wp_enqueue_script( $script_handle );
		wp_add_inline_script(
			$script_handle,
			'window.' . esc_js( $widget_data['data_id'] ) . ' = ' . wp_json_encode( $widget_data['data'] ) . ';'
		);
		wp_print_scripts( $script_handle );

		echo wp_kses(
			$widget_data['html'],
			[
				'div' => [
					'class'              => [],
					'id'                 => [],
					'data-post_id'       => [],
					'data-id'            => [],
					'data-render_id'     => [],
					'data-status'        => [],
					'pnpnd-theme-status' => [],
					'style'              => [],
				],
			]
		);
	}

	protected function render_empty_notice() {
		$args = [
			'title'          => $this->get_title(),
			'description'    => __( 'Click Configure to setup your widget', 'ninja-drive' ),
			'wrapper_class'  => 'pnpnd-elementor-widgets-card' . $this->get_icon(),
			'icon_class'      => $this->get_icon(),
			'card_status'    => 'primary',
			'primary_button' => [
				'title'  => __( 'Configure Widget', 'ninja-drive' ),
				'target' => false,
				'icon'   => 'settings',
				'class'  => 'configure-widget',
			],
		];

		if ( $this->use_widget_selector() ) {
			$args['description'] = __( 'Select a widget from the panel to display its content.', 'ninja-drive' );
			unset( $args['primary_button'] );
		}

		pnpnd_get_template( 'notice-card/notice-card-common', $args );
	}

	public function get_module_options( $type = '' ) {
		$formatted_options = [
			'' => empty( $type )
				? __( '-- Select Widget --', 'ninja-drive' )
				// translators: %s is replaced with the type of widget, e.g., Gallery, File Browser, etc.
				: sprintf( __( '-- Select %s Widget --', 'ninja-drive' ), ucwords( str_replace( '_', ' ', $type ) ) ),
		];

		try {
			$widgets = Widget_Model::get_instance()->get_all( [ 'per_page' => 0 ] );

			if ( is_wp_error( $widgets ) || empty( $widgets ) ) {
				return $formatted_options;
			}

			if ( ! empty( $type ) ) {
				$widgets = array_filter(
					$widgets,
					function ( $widget ) use ( $type ) {
						return $widget['type'] === $type;
					}
				);
			}

			foreach ( $widgets as $widget ) {
				if ( ! empty( $widget['id'] ) && ! empty( $widget['title'] ) ) {
					$formatted_options[ $widget['id'] ] = $widget['id'] . ' - ' . $widget['title'];
				}
			}

			return $formatted_options;
		} catch ( \Throwable $e ) {

			return $formatted_options;
		}
	}
}
