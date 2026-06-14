<?php

namespace Pnpnd\ND;

use Pnpnd\ND\Models\Notices;
use Pnpnd\ND\Traits\Singleton;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class Notice {

	use Singleton;

	const TYPE_ERROR   = 'error';
	const TYPE_SUCCESS = 'success';
	const TYPE_WARNING = 'warning';
	const TYPE_INFO    = 'info';

	public function add( string $type, string $title, string $description = '', array $extra = array() ) {
		return Notices::get_instance()->add(
			array_merge(
				$extra,
				array(
					'type'        => $type,
					'title'       => $title,
					'description' => $description,
					'user_id'     => get_current_user_id(),
				)
			)
		);
	}
}
