<?php

namespace Pnpnd\ND\API\Traits;

use Pnpnd\ND\Utils\Helpers;
use WP_Error;
use WP_REST_Request;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

trait HasWidgetPermission {

	protected function checkWidgetPermission( WP_REST_Request $request, string $action ) {
		$widgetId = $request->get_param( 'widgetId' );

		$fileKey   = (array) $request->get_param( 'fileKey' ) ?? array();
		$folderKey = (array) $request->get_param( 'folderKey' ) ?? array();
		$fileKeys  = (array) $request->get_param( 'fileKeys' ) ?? array();

		$mergedKeys = array_merge( $fileKey, $folderKey, $fileKeys );

		if ( empty( $mergedKeys ) ) {
			return Helpers::hasWidgetPermission( $widgetId, $action );
		}

		foreach ( $mergedKeys as $key ) {
			if ( ! Helpers::hasWidgetPermission( $widgetId, $action, $key ) ) {
				return new WP_Error( 'forbidden', 'You do not have permission.', array( 'status' => 403 ) );
			}
		}

		return true;
	}
}
