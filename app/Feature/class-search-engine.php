<?php

namespace Pnpnd\ND\App\Feature;

use Pnpnd\ND\Models\Files;
use WP_Error;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class Search_Engine {

	private $file_lister;

	public function __construct( File_Lister $file_lister ) {
		$this->file_lister = $file_lister;
	}

	public function search( $data ) {
		$data = wp_parse_args(
			$data,
			array(
				'from'           => 'cache',
				'scope'          => 'parent',
				'types'          => array(),
				'limit'          => 100,
				'query'          => '',
				'order_by'       => 'name',
				'order'          => 'ASC',
				'full_text'      => false,
				'trashed'        => false,
				'folderId'       => null,
				'account_id'     => null,
				'modified_after' => null,
			)
		);

		$query = trim( $data['query'] );

		$data['scope'] = in_array( $data['scope'], array( 'parent', 'global' ), true ) ? $data['scope'] : 'parent';
		$data['from']  = in_array( $data['from'], array( 'cache', 'server' ), true ) ? $data['from'] : 'cache';

		if ( 'cache' === $data['from'] ) {
			return Files::get_instance()->search( $data );
		} elseif ( 'server' === $data['from'] ) {
			$full_text = filter_var( $data['full_text'], FILTER_VALIDATE_BOOLEAN );
			$mimetypes = pnpnd_get_mimetypes_by_group( $data['types'] );

			$params = array(
				'query'          => $query,
				'full_text'      => $full_text,
				'mimetypes'      => $mimetypes,
				'parent'         => $data['folderId'],
				'trashed'        => false,
				'modified_after' => $data['modified_after'],
			);

			if ( 'global' === $data['scope'] && current_user_can( 'manage_options' ) ) {
				$params['parent'] = null;
			}

			$search_query = $this->build_search_query( $params );

			$files = $this->file_lister->fetch_files_from_server(
				array(
					'account_id' => $data['account_id'],
					'id'         => $data['folderId'],
					'query'      => $search_query,
				)
			);

			if ( is_wp_error( $files ) ) {
				return $files;
			}

			return Files::get_instance()->search( $data );
		}

		return array();
	}

	public function build_search_query( array $params ): string {
		$query_parts = array();

		if ( ! empty( $params['query'] ) ) {
			$search        = addslashes( $params['query'] );
			$query_parts[] = ( ! empty( $params['full_text'] ) ) ? "fullText contains '{$search}'" : "name contains '{$search}'";
		}

		if ( ! empty( $params['mimetypes'] ) && is_array( $params['mimetypes'] ) ) {
			$mime_queries  = array_map( fn ( $type ) => "mime_type = '{$type}'", $params['mimetypes'] );
			$query_parts[] = '(' . implode( ' or ', $mime_queries ) . ')';
		}

		if ( ! empty( $params['parent'] ) ) {
			$query_parts[] = "'{$params['parent']}' in parents";
		}

		$query_parts[] = isset( $params['trashed'] ) && true === $params['trashed'] ? 'trashed = true' : 'trashed = false';

		if ( ! empty( $params['modified_after'] ) ) {
			$query_parts[] = "modifiedTime > '{$params['modified_after']}'";
		}

		if ( ! empty( $params['shared_with_me'] ) ) {
			$query_parts[] = 'sharedWithMe';
		}

		return implode( ' and ', $query_parts );
	}
}
