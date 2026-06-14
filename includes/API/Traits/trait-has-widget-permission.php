<?php

namespace Pnpnd\ND\API\Traits;

use Pnpnd\ND\Utils\Helpers;
use WP_Error;
use WP_REST_Request;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

trait Has_Widget_Permission {

	protected function check_widget_permission( WP_REST_Request $request, string $action ) {
		$widget_id = $request->get_param( 'widget_id' );

		$file_key   = (array) $request->get_param( 'file_key' ) ?? array();
		$folder_key = (array) $request->get_param( 'folder_key' ) ?? array();
		$file_keys  = (array) $request->get_param( 'file_keys' ) ?? array();

		$merged_keys = array_merge( $file_key, $folder_key, $file_keys );

		if ( empty( $merged_keys ) ) {
			return Helpers::has_widget_permission( $widget_id, $action );
		}

		foreach ( $merged_keys as $key ) {
			if ( ! Helpers::has_widget_permission( $widget_id, $action, $key ) ) {
				return new WP_Error( 'forbidden', 'You do not have permission.', array( 'status' => 403 ) );
			}
		}

		return true;
	}
}
