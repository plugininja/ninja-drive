<?php

namespace Pninja\ND\App\Feature;

use Pninja\ND\Models\Files;
use WP_Error;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class SearchEngine {

	private $fileLister;

	public function __construct( FileLister $fileLister ) {
		$this->fileLister = $fileLister;
	}

	public function search( $data ) {
		$data = wp_parse_args(
			$data,
			array(
				'from'          => 'cache',
				'scope'         => 'parent',
				'types'         => array(),
				'limit'         => 100,
				'query'         => '',
				'orderBy'       => 'name',
				'order'         => 'ASC',
				'fullText'      => false,
				'trashed'       => false,
				'folderId'      => null,
				'accountId'     => null,
				'modifiedAfter' => null,
			)
		);

		$query = trim( $data['query'] );

		$data['scope'] = in_array( $data['scope'], array( 'parent', 'global' ) ) ? $data['scope'] : 'parent';
		$data['from']  = in_array( $data['from'], array( 'cache', 'server' ) ) ? $data['from'] : 'cache';

		if ( $data['from'] === 'cache' ) {
			return Files::getInstance()->search( $data );
		} elseif ( $data['from'] === 'server' ) {
			$fullText  = filter_var( $data['fullText'], FILTER_VALIDATE_BOOLEAN );
			$mimeTypes = pnpndGetMimeTypesByGroup( $data['types'] );

			$params = array(
				'query'         => $query,
				'fullText'      => $fullText,
				'mimeTypes'     => $mimeTypes,
				'parent'        => $data['folderId'],
				'trashed'       => false,
				'modifiedAfter' => $data['modifiedAfter'],
			);

			if ( $data['scope'] === 'global' && current_user_can( 'manage_options' ) ) {
				$params['parent'] = null;
			}

			$searchQuery = $this->buildSearchQuery( $params );

			$files = $this->fileLister->fetchFilesFromServer(
				array(
					'accountId' => $data['accountId'],
					'id'        => $data['folderId'],
					'query'     => $searchQuery,
				)
			);

			if ( is_wp_error( $files ) ) {
				return $files;
			}

			return Files::getInstance()->search( $data );
		}

		return array();
	}

	public function buildSearchQuery( array $params ): string {
		$queryParts = array();

		if ( ! empty( $params['query'] ) ) {
			$search       = addslashes( $params['query'] );
			$queryParts[] = ( ! empty( $params['fullText'] ) ) ? "fullText contains '{$search}'" : "name contains '{$search}'";
		}

		if ( ! empty( $params['mimeTypes'] ) && is_array( $params['mimeTypes'] ) ) {
			$mimeQueries  = array_map( fn ( $type ) => "mimeType = '{$type}'", $params['mimeTypes'] );
			$queryParts[] = '(' . implode( ' or ', $mimeQueries ) . ')';
		}

		if ( ! empty( $params['parent'] ) ) {
			$queryParts[] = "'{$params['parent']}' in parents";
		}

		$queryParts[] = isset( $params['trashed'] ) && $params['trashed'] === true ? 'trashed = true' : 'trashed = false';

		if ( ! empty( $params['modifiedAfter'] ) ) {
			$queryParts[] = "modifiedTime > '{$params['modifiedAfter']}'";
		}

		if ( ! empty( $params['sharedWithMe'] ) ) {
			$queryParts[] = 'sharedWithMe';
		}

		return implode( ' and ', $queryParts );
	}
}
