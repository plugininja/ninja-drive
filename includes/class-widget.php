<?php

namespace Pnpnd\ND;

use Pnpnd\ND\Models\Widget as Models_Widget;
use Pnpnd\ND\Traits\Singleton;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class Widget {

	use Singleton;

	/**
	 * Widget instance
	 *
	 * @var Models_Widget
	 */
	private $sc_model;

	private $return = 'string';

	private $integration = null;

	private $attributes = '';

	public static $widgets_list = array(
		'file_browser',
		'gallery',
		'embed_documents',
	);

	public const ALLOW_HTML_TAGS = array(
		'div'    => array(
			'id'                 => true,
			'class'              => true,
			'style'              => true,

			'data-post_id'       => true,
			'data-id'            => true,
			'data-render_id'     => true,
			'data-status'        => true,
			'data-field-name'    => true,

			'pnpnd-theme-status' => true,
		),
		'span'   => array(
			'class' => true,
		),
		'a'      => array(
			'href'   => true,
			'target' => true,
			'class'  => true,
		),
		'h3'     => array(
			'class' => true,
		),
		'p'      => array(
			'class' => true,
		),
		'button' => array(
			'type'  => true,
			'class' => true,
		),
	);

	public function __construct() {
		if ( empty( $this->sc_model ) ) {
			$this->sc_model = Models_Widget::get_instance();
		}
	}

	public static function get_widgets_list() {

		return self::$widgets_list;
	}

	private function do_hooks() {
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

		$this->return      = 'array' === $atts['return'] ? 'array' : 'string';
		$this->integration = sanitize_text_field( wp_unslash( $atts['integration'] ?? '' ) );
		$this->attributes  = $atts['attributes'] ?? '';

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
			pnpnd_get_template( 'notice-card/notice-card-common', $args );

			return wp_kses( ob_get_clean(), self::ALLOW_HTML_TAGS );
		}

		$widget = $this->sc_model->get( $id );

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
			pnpnd_get_template( 'notice-card/notice-card-common', $args );

			return wp_kses( ob_get_clean(), self::ALLOW_HTML_TAGS );
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
			pnpnd_get_template( 'notice-card/notice-card-common', $args );

			return wp_kses( ob_get_clean(), self::ALLOW_HTML_TAGS );
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
			pnpnd_get_template( 'notice-card/notice-card-common', $args );

			return wp_kses( ob_get_clean(), self::ALLOW_HTML_TAGS );
		}

		if ( empty( $widget['status'] ) || ( isset( $widget['status'] ) && 'active' !== $widget['status'] ) ) {
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
			wp_enqueue_style( 'pnpnd-common' );
			pnpnd_get_template( 'notice-card/notice-card-common', $args );

			return wp_kses( ob_get_clean(), self::ALLOW_HTML_TAGS );
		}

		$data = maybe_unserialize( $widget['data'] ?? '' );

		if ( ! empty( $data ) && ! is_wp_error( $data ) ) {
			$widget['data'] = $data;
		}

		return $this->render_widget( $id, $widget );
	}

	private function render_widget( int $id, array $widget ) {
		$type = $widget['type'] ?? '';

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
			pnpnd_get_template( 'notice-card/notice-card-common', $args );

			return wp_kses( ob_get_clean(), self::ALLOW_HTML_TAGS );
		}

		if ( ( ! isset( $widget['data'] ) || empty( $widget['data'] ) ) && empty( $widget['error_type'] ) ) {
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
			pnpnd_get_template( 'notice-card/notice-card-common', $args );

			return wp_kses( ob_get_clean(), self::ALLOW_HTML_TAGS );
		}

		$status = 'public';

		$permission = $widget['data']['configuration']['security']['display_for'] ?? array();

		if ( ! empty( $permission ) ) {
			$is_permission = $this->is_widget_permission__premium_only( $permission );

			if ( is_wp_error( $is_permission ) ) {
				if ( ! empty( $permission['show_access_denied_message'] ) ) {

					$args = array(
						'title'       => $is_permission->get_error_message(),
						'card_status' => 'warning',
						'icon'        => 'encrypted',
					);

					ob_start();
					pnpnd_get_template( 'notice-card/notice-card-common', $args );

					return ob_get_clean();
				}

				return '';
			}
		}

		if ( isset( $widget['data']['configuration']['security']['password_protect']['password'] ) ) {
			unset( $widget['data']['configuration']['security']['password_protect']['password'] );
		}

		$object_key     = "PNPND_{$id}";
		$enqueue_handle = "pnpnd-$type";
		$theme          = $widget['data']['style']['theme'] ?? 'light';

		$enqueue = Enqueue::get_instance();
		$enqueue->common_scripts( $object_key, is_admin() ? 'admin' : 'frontend' );
		$enqueue->add( 'shared', 'js', array( $enqueue_handle ) );

		if ( 'embed_documents' !== $type ) {
			$enqueue->add( 'search_box' === $type ? 'file_browser' : $type, 'css', array(), array( 'folder' => 'css/frontend' ) );
		}

		if ( 'file_browser' === $type && ! empty( $widget['data']['permissions']['upload']['enable'] ) ) {
			$enqueue->add( 'file_uploader', 'css', array(), array( 'folder' => 'css/frontend' ) );
		}

		if ( 'file_uploader' === $type && ! empty( $widget['data']['style']['file_uploader']['upload_preview']['enable'] ) ) {
			$enqueue->add( 'file_browser', 'css', array(), array( 'folder' => 'css/frontend' ) );
		}

		$escaped_id             = absint( $id );
		$escaped_status         = esc_attr( $status );
		$escaped_enqueue_handle = esc_attr( $enqueue_handle );
		$escaped_object_key     = esc_js( $object_key );

		$width       = $widget['data']['style']['width']['value'] ?? 100;
		$width_unit  = $widget['data']['style']['width']['unit'] ?? '%';
		$height      = $widget['data']['style']['height']['value'] ?? '';
		$height_unit = $widget['data']['style']['height']['unit'] ?? 'auto';

		$style = '';

		if ( '' !== $width ) {
			$style .= 'width:' . esc_attr( $width . $width_unit ) . ';';
		}

		if ( '' !== $height ) {
			if ( 'auto' === $height_unit ) {
				$style .= 'height:auto;';
			} else {
				$style .= 'height:' . esc_attr( $height . $height_unit ) . ';';
			}
		}

		$post_id   = get_the_ID();
		$render_id = uniqid( "PNPND_{$escaped_id}_", true );

		$html = sprintf(
			'<div data-post_id="%d" data-id="PNPND_%d" data-render_id="%s" data-status="%s" id="pnpnd-widget-%d" class="pnpnd-top-level-wrapper pnpnd-widget %s" pnpnd-theme-status="%s" style="%s" %s></div>',
			$post_id,
			$escaped_id,
			$render_id,
			$escaped_status,
			$escaped_id,
			$escaped_enqueue_handle,
			esc_attr( $theme ),
			esc_attr( $style ),
			esc_html( $this->attributes )
		);

		if ( 'array' === $this->return ) {
			return array(
				'id'             => $escaped_id,
				'status'         => $escaped_status,
				'data_id'        => "PNPND_{$escaped_id}",
				'element_id'     => "pnpnd-widget-{$escaped_id}",
				'enqueue_handle' => $escaped_enqueue_handle,
				'type'           => $type,
				'data'           => $widget ?? array(),
				'html'           => $html,
			);
		}

		$json_data = wp_json_encode( $widget ?? array(), JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT );

		if ( false === $json_data ) {
			$json_data = '{}';
		}

		wp_add_inline_script(
			$enqueue_handle,
			'window.' . $escaped_object_key . ' = ' . $json_data . ';'
		);

		return wp_kses( $html, self::ALLOW_HTML_TAGS );
	}

	private function is_widget_permission__premium_only( array $permission = array() ) {
		if ( is_wp_error( $permission ) ) {
			return $permission;
		}

		$error_message = new \WP_Error( 'permission_denied', $permission['access_denied_message'] ?? __( 'You do not have permission to view this widget.', 'ninja-drive' ) );

		if ( empty( $permission ) ) {
			return $error_message;
		}

		if ( pnpnd_has_user_access_page__premium_only( 'widget_builder' ) ) {
			return true;
		}

		if ( 'everyone' === $permission['who_can_view_module'] ) {
			return true;
		}

		if ( ! is_user_logged_in() ) {
			return $error_message;
		}

		if ( empty( $permission['display_for'] ) ) {
			return true;
		}

		$current_user = wp_get_current_user();

		if ( empty( $current_user->ID ) ) {
			return $error_message;
		}

		$user_name = $current_user->user_login;

		$logged_in_user_type = $permission['logged_in_user_type'] ?? 'users';

		if ( 'users' === $logged_in_user_type ) {
			$is_permission = in_array( $user_name, $permission['display_for'], true );

			if ( ! $is_permission ) {
				return $error_message;
			}

			return true;
		}

		if ( 'roles' === $logged_in_user_type ) {
			$user_roles = $current_user->roles;

			if ( empty( $user_roles ) ) {
				return $error_message;
			}

			foreach ( $user_roles as $role ) {
				if ( in_array( $role, $permission['display_for'], true ) ) {
					return true;
				}
			}

			return $error_message;
		}

		return $error_message;
	}

	public function embed_to_page( int $widget_id, int $page_id, string $name = '', string $editor = 'auto' ) {
		$widget = $this->sc_model->get( $widget_id );

		if ( is_wp_error( $widget ) || empty( $widget ) ) {
			return new \WP_Error( 'invalid_widget', 'The provided widget ID is invalid.' );
		}

		$is_new_page = 0 === $page_id || empty( $page_id );

		$page_id = $is_new_page ? wp_insert_post(
			array(
				'post_title'  => $name ? $name : 'Ninja Drive Widget Page',
				'post_type'   => 'page',
				'post_status' => 'publish',
			),
			true
		) : $page_id;

		if ( is_wp_error( $page_id ) ) {
			return $page_id;
		}

		$shortcode = sprintf( '[ninja-drive id="%d"]', absint( $widget_id ) );

		if ( 'gutenberg' === $editor ) {
			$post_content = sprintf( '<!-- wp:shortcode -->%s<!-- /wp:shortcode -->', $shortcode );
		} else {
			$post_content = $shortcode;
		}

		if ( empty( $is_new_page ) ) {
			$existing_content = get_post_field( 'post_content', $page_id );
			$post_content     = $existing_content . "\n" . $shortcode;
		}

		$updated_post_id = wp_update_post(
			array(
				'ID'           => $page_id,
				'post_content' => $post_content,
			),
			true
		);

		if ( is_wp_error( $updated_post_id ) ) {
			return $updated_post_id;
		}

		return get_permalink( $page_id );
	}
}
