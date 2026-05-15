<?php

namespace Pninja\ND\App\Feature;

use Pninja\ND\App\Client;
use Pninja\ND\App\Feature\FileLister;
use Pninja\ND\App\Feature\SearchEngine;
use Pninja\ND\App\Service\FileService;
use Pninja\ND\Models\Files;
use WP_Error;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class FileRetriever {

	public function getFilesByKeys( $fileKeys, $config = array(), ?FileService $files = null ) {
		if ( empty( $fileKeys ) ) {
			return new WP_Error( 404, __( 'No file keys provided.', 'ninja-drive' ) );
		}

		if ( ! is_array( $fileKeys ) ) {
			return new WP_Error( 400, __( 'File keys must be an array.', 'ninja-drive' ) );
		}

		if ( ! empty( $fileKeys[0]['fileKey'] ) ) {
			$fileKeys = array_map(
				function ( $key ) {
					return $key['fileKey'];
				},
				$fileKeys
			);
		}

		$queryConfig = wp_parse_args(
			$config,
			array(
				'returnType'  => 'array',
				'recursive'   => true,
				'page'        => 1,
				'perPage'     => 20,
				'orderBy'     => 'name',
				'order'       => 'ASC',
				'search'      => '',
				'searchScope' => 'folder',
				'from'        => 'cache',
			)
		);

		$filesModel = Files::getInstance();

		if ( $files !== null && isset( $queryConfig['from'] ) && $queryConfig['from'] === 'server' ) {
			$filesData = $filesModel->getFileAttributesByKeys( $fileKeys, array( 'id', 'accountId', 'extension' ) );

			if ( is_wp_error( $filesData ) ) {
				return $filesData;
			}

			if ( empty( $filesData ) ) {
				return array();
			}

			$filterFolderIds = array_filter( $filesData, fn ( $file ) => ! empty( $file['extension'] ) && $file['extension'] === 'folder' );

			$searchQuery = '';

			if ( ! empty( $queryConfig['search'] ) ) {
				$params = array(
					'query'    => $queryConfig['search'],
					'fullText' => false,
					'trashed'  => false,
				);

				$searchQuery = ( new SearchEngine( new FileLister( $files ) ) )->buildSearchQuery( $params );
			}

			foreach ( $filterFolderIds as $file ) {
				( new FileLister( $files ) )->fetchFilesFromServer(
					array(
						'accountId' => $file['accountId'],
						'id'        => $file['id'],
						'query'     => $searchQuery,
					)
				);
			}
		}

		return $filesModel->getFilesByKeys( $fileKeys, $queryConfig );
	}

	public function getFile( $id, $accountId, $force = false ) {
		if ( empty( $id ) || empty( $accountId ) ) {
			return new WP_Error( 400, __( 'Missing file id or account id.', 'ninja-drive' ) );
		}

		if ( empty( $force ) ) {
			$file = Files::getInstance()->getFile( $id, $accountId, 'array' );

			if ( ! empty( $file ) && ! is_wp_error( $file ) ) {
				return $file;
			}
		}

		$client = Client::getInstance( $accountId );

		$fileApi = new FileService( $client );
		$file    = $fileApi->getFileById( $id );

		if ( is_wp_error( $file ) ) {

			return $file;
		}

		if ( empty( $file ) ) {
			return new WP_Error( 400, __( 'Something went wrong while fetching the file. Please try again.', 'ninja-drive' ) );
		}

		return $file->save();
	}

	public function getFileByKey( $key, $force = false, $output = 'array' ) {
		if ( empty( $key ) ) {
			return false;
		}

		$file = Files::getInstance()->getFileByKey( $key );

		if ( empty( $file ) || is_wp_error( $file ) ) {

			return false;
		}

		if ( empty( $force ) ) {
			return $output === 'array' ? $file->toArray() : $file;
		}

		$accountId = $file->getAccountId() ?? null;
		$id        = $file->getId() ?? null;

		if ( ! $accountId || ! $id ) {
			return false;
		}

		$client  = Client::getInstance( $accountId );
		$fileApi = new FileService( $client );
		$file    = $fileApi->getFileById( $id );

		if ( is_wp_error( $file ) ) {

			return $file;
		}

		$filDate = $file->save();

		return $output === 'array' ? $filDate : $file;
	}
}
