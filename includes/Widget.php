<?php

namespace Pninja\ND;

use Pninja\ND\Models\Widget as ModelsWidget;
use Pninja\ND\Utils\Singleton;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class Widget {

	use Singleton;

	/**
	 * Widget instance
	 *
	 * @var ModelsWidget
	 */
	private $scModel;

	private $return = 'string';

	private $integration = null;

	private $attributes = '';

	public static $widgetsList = array(
		'file-browser',
		'gallery',
		'embed-documents',
	);

	public const ALLOW_HTML_TAGS = array(
		'div'    => array(
			'id'                 => true,
			'class'              => true,
			'style'              => true,

			// Custom attributes
			'data-post_id'       => true,
			'data-id'            => true,
			'data-render_id'     => true,
			'data-status'        => true,
			'data-field-name'    => true,

			// Custom plugin attributes
			'pnpnd-theme-status' => true,
		),

		'script' => array(
			'type' => true,
		),
	);

	public function __construct() {
		if ( empty( $this->scModel ) ) {
			$this->scModel = ModelsWidget::getInstance();
		}
	}

	public static function getWidgetsList() {
		return self::$widgetsList;
	}

	private function doHooks() {
		add_shortcode( 'ninja-drive', array( $this, 'render' ) );
	}

	public function render( $atts = array() ) {

		$atts = shortcode_atts(
			array(
				'id'          => 0,
				'return'      => 'string',
				'integration' => '',
				'attributes'  => '',
			),
			$atts
		);

		$this->return      = $atts['return'] === 'array' ? 'array' : 'string';
		$this->integration = sanitize_text_field( wp_unslash( $atts['integration'] ?? '' ) );
		$this->attributes  = $atts['attributes'] ?? '';

		// Validate and sanitize ID
		$id = $atts['id'] ?? 0;

		if ( ! is_numeric( $id ) && preg_match( '/id="(\d+)"/', $id, $matches ) ) {
			$id = absint( $matches[1] );
		} else {
			$id = absint( $id );
		}

		if ( empty( $id ) ) {
			if ( ! current_user_can( 'manage_options' ) ) {
				return;
			}
			$args = array(
				'title'       => __( 'Please provide a valid ID', 'ninja-drive' ),
				'description' => 'Please provide a valid ID. Widget ID not found.',
				'card_status' => 'error',
				'icon'        => 'report',
			);

			ob_start();
			pnpndGetTemplate( 'notice-card/notice-card-common', $args );

			return ob_get_clean();
		}

		$widget = $this->scModel->get( $id );

		if ( empty( $widget ) || is_wp_error( $widget ) ) {
			if ( ! current_user_can( 'manage_options' ) ) {
				return;
			}

			$message = is_wp_error( $widget ) ? $widget->get_error_message() : __( 'Widget not found', 'ninja-drive' );

			$args = array(
				'title'       => "#$id - $message",
				'card_status' => 'error',
				'icon'        => 'error',
			);

			ob_start();
			pnpndGetTemplate( 'notice-card/notice-card-common', $args );

			return ob_get_clean();
		}

		if ( is_wp_error( $widget ) ) {
			if ( ! current_user_can( 'manage_options' ) ) {
				return;
			}

			$message = $widget->get_error_message();

			$args = array(
				'title'       => $message,
				'card_status' => 'warning',
				'icon'        => 'error',
			);

			ob_start();
			pnpndGetTemplate( 'notice-card/notice-card-common', $args );

			return ob_get_clean();
		}

		if ( empty( $widget ) ) {
			if ( ! current_user_can( 'manage_options' ) ) {
				return;
			}

			$message = __( 'Widget not found', 'ninja-drive' );

			$args = array(
				'title'       => "#$id - $message",
				'card_status' => 'error',
				'icon'        => 'error',
			);

			ob_start();
			pnpndGetTemplate( 'notice-card/notice-card-common', $args );

			return ob_get_clean();
		}

		if ( empty( $widget['status'] ) || ( isset( $widget['status'] ) && $widget['status'] !== 'active' ) ) {
			if ( ! current_user_can( 'manage_options' ) ) {
				return;
			}

			$message = __( 'Widget is disabled', 'ninja-drive' );

			$args = array(
				'title'          => "#$id - $message",
				'description'    => __( 'Please enable this Widget from Widget Builder', 'ninja-drive' ),
				'card_status'    => 'error',
				'icon'           => 'sentiment_very_dissatisfied',
				'primary_button' => array(
					'title'  => 'Enable Widget',
					'url'    => admin_url( "admin.php?page=ninja-drive#/widget-builder/$id/widgets" ),
					'target' => true,
				),
			);

			ob_start();
			pnpndGetTemplate( 'notice-card/notice-card-common', $args );

			return ob_get_clean();
		}

		$data = maybe_unserialize( $widget['data'] ?? '' );
		if ( empty( $data ) ) {
			if ( ! current_user_can( 'manage_options' ) ) {
				return;
			}

			$message = __( 'No data available for this Widget', 'ninja-drive' );

			$args = array(
				'title'       => "#$id - $message",
				'card_status' => 'error',
				'icon'        => 'sentiment_dissatisfied',
			);

			ob_start();
			pnpndGetTemplate( 'notice-card/notice-card-common', $args );

			return ob_get_clean();
		}

		$widget['data'] = $data;

		return $this->renderWidget( $id, $widget );
	}

	private function renderWidget( int $id, array $data ) {
		$type = $data['type'] ?? '';

		if ( empty( $type ) ) {
			if ( ! current_user_can( 'manage_options' ) ) {
				return;
			}

			$message = __( 'Type not given for this Widget', 'ninja-drive' );

			$args = array(
				'title'       => "#$id - $message",
				'card_status' => 'warning',
				'icon'        => 'warning',
			);

			ob_start();
			pnpndGetTemplate( 'notice-card/notice-card-common', $args );

			return ob_get_clean();
		}

		if ( ! isset( $data['data'] ) || empty( $data['data'] ) ) {
			if ( ! current_user_can( 'manage_options' ) ) {
				return;
			}

			$message = __( 'No data provided for this Widget', 'ninja-drive' );

			$args = array(
				'title'       => "#$id - $message",
				'card_status' => 'warning',
				'icon'        => 'sentiment_very_dissatisfied',
			);

			ob_start();
			pnpndGetTemplate( 'notice-card/notice-card-common', $args );

			return ob_get_clean();
		}

		$status = 'public';

		if ( isset( $data['data']['permissions']['passwordProtect']['password'] ) ) {
			unset( $data['data']['permissions']['passwordProtect']['password'] );
		}

		$object_key    = "PNPND_{$id}";
		$enqueueHandle = "pnpnd-$type";
		$theme         = $data['data']['advanced']['theme'] ?? 'light';

		$enqueue = Enqueue::getInstance();
		$enqueue->common_scripts( $object_key, 'frontend' );
		$enqueue->add( 'shared', 'js', array( $enqueueHandle ) );
		$enqueue->add( $type, 'css', array(), array( 'folder' => 'css/frontend' ) );

		// Escape all output for security
		$escaped_id             = absint( $id );
		$escaped_status         = esc_attr( $status );
		$escaped_enqueue_handle = esc_attr( $enqueueHandle );
		$escaped_object_key     = esc_js( $object_key );

		$width       = $data['data']['advanced']['width']['value'] ?? '';
		$width_unit  = $data['data']['advanced']['width']['unit'] ?? '%';
		$height      = $data['data']['advanced']['height']['value'] ?? '';
		$height_unit = $data['data']['advanced']['height']['unit'] ?? 'auto';

		$style = '';

		if ( $width !== '' ) {
			$style .= 'width:' . esc_attr( $width . $width_unit ) . ';';
		}

		if ( $height !== '' ) {
			if ( $height_unit === 'auto' ) {
				$style .= 'height:auto;';
			} else {
				$style .= 'height:' . esc_attr( $height . $height_unit ) . ';';
			}
		}

		$postId    = get_the_ID();
		$render_id = uniqid( "PNPND_{$escaped_id}_", true );

		$html = sprintf(
			'<div data-post_id="%d" data-id="PNPND_%d" data-render_id="%s" data-status="%s" id="pnpnd-widget-%d" class="pnpnd-top-level-wrapper pnpnd-widget %s" pnpnd-theme-status="%s" style="%s" %s></div>',
			$postId,
			$escaped_id,
			$render_id,
			$escaped_status,
			$escaped_id,
			$escaped_enqueue_handle,
			$theme,
			esc_attr( $style ),
			esc_html( $this->attributes )
		);

		if ( $this->return === 'array' ) {
			return array(
				'id'             => $escaped_id,
				'status'         => $escaped_status,
				'data_id'        => "PNPND_{$escaped_id}",
				'element_id'     => "pnpnd-widget-{$escaped_id}",
				'enqueue_handle' => $escaped_enqueue_handle,
				'type'           => $type,
				'data'           => $data,
				'html'           => $html,
			);
		}

		// Use proper JSON encoding with security flags to prevent XSS
		$json_data = wp_json_encode( $data, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT );

		if ( false === $json_data ) {
			// Fallback if encoding fails
			$json_data = '{}';
		}

		$html .= sprintf(
			'<script>window.%s = %s;</script>',
			$escaped_object_key,
			$json_data
		);

		return $html;
	}
}
