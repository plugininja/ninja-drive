<?php

namespace Pninja\ND\App\Feature;

use Pninja\ND\App\Accounts;
use Pninja\ND\App\Service\FileService;
use Pninja\ND\Models\Files;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class FileLister {

	private $files;

	private $cacheSynchronizer;

	public function __construct( FileService $files ) {
		$this->files             = $files;
		$this->cacheSynchronizer = new CacheSynchronizer();
	}

	public function getFiles( array $args = array() ) {
		$args = $this->prepareArgs( $args );

		$folderId  = $args['id'] ?? null;
		$accountId = $args['accountId'] ?? null;

		if ( empty( $folderId ) || empty( $accountId ) ) {
			return array();
		}

		$isCached = Files::getInstance()->isCachedFolder( $folderId, $accountId );

		$files       = array();
		$isNewFolder = false;

		if ( $isCached && $args['from'] !== 'server' ) {
			$files = $this->fetchFilesFromCache( $args );
		} else {
			$files = $this->fetchFilesFromServer( $args );

			if ( is_wp_error( $files ) ) {
				return $files;
			}

			$isNewFolder = ! empty( array_filter( $files, fn ( $file ) => $file['isDir'] ?? false ) );
			Accounts::getInstance()->syncAccount( $accountId );
		}

		if ( is_wp_error( $files ) ) {
			return $files;
		}

		$response                = $this->prepareResponse( $files, $args );
		$response['isNewFolder'] = $isNewFolder;

		return $response;
	}

	public function fetchFilesFromServer( array $args ) {
		$folderId  = $args['id'] ?? null;
		$accountId = $args['accountId'] ?? null;

		if ( empty( $folderId ) || empty( $accountId ) ) {
			return array();
		}

		$files = array();

		if ( $folderId === 'shared-drives' ) {
			$files = $this->files->listDrives();

			return $files;
		} else {
			$params = $this->buildServerParams( $args, $folderId );

			$files         = $this->files->listFiles( $params );
			$cacheKey      = "pnpnd_child_folder_ids_{$folderId}_{$accountId}";
			$cacheKeyCount = "pnpnd_child_folder_count_{$folderId}_{$accountId}";

			wp_cache_delete( $cacheKey, 'pnpnd_files' );
			wp_cache_delete( $cacheKeyCount, 'pnpnd_files' );
			wp_cache_flush_group( 'pnpnd_files' );
		}

		if ( is_wp_error( $files ) ) {
			return $files;
		}

		if ( empty( $files ) ) {
			return array();
		}

		if ( empty( $args['query'] ) ) {
			$this->cacheSynchronizer->removeStaleFilesFromDatabase( $files, $args );
		}

		return $this->fetchFilesFromCache( $args );
	}

	private function prepareArgs( $args ) {
		$defaultArgs = array(
			'from'        => 'cache',
			'order'       => 'ASC',
			'orderBy'     => 'folder,name',
			'filters'     => array(),
			'limit'       => 0,
			'fileNumbers' => 0,
		);

		return wp_parse_args( $args, $defaultArgs );
	}

	private function buildServerParams( array $args, string $folderId ) {
		$query = 'trashed=false';

		switch ( true ) {
			case ! empty( $args['query'] ):
				$query = $args['query'];
				break;
			case $folderId === 'computers':
				$query = "'me' in owners and mimeType='application/vnd.google-apps.folder' and trashed=false";
				break;
			case $folderId === 'shared':
				$query = 'sharedWithMe=true and trashed=false';
				break;
			case $folderId === 'starred':
				$query = 'starred=true and trashed=false';
				break;
			default:
				$query .= " and '$folderId' in parents";
				break;
		}

		$replaceOrderBy = array(
			'name'      => 'folder,name',
			'size'      => 'folder,quotaBytesUsed',
			'createdAt' => 'folder,createdTime',
			'updatedAt' => 'folder,modifiedTime',
		);

		$requestedField = $args['orderBy'] ?? 'name';
		$sortDirection  = strtolower( $args['order'] ?? 'asc' ) === 'desc' ? 'desc' : 'asc';

		$mappedField = $replaceOrderBy[ $requestedField ] ?? $requestedField;

		$mappedFields = explode( ',', $mappedField );
		$orderByParts = array();

		foreach ( $mappedFields as $field ) {
			$field = trim( $field );

			if ( in_array( $field, array( 'folder' ) ) ) {
				$orderByParts[] = $field;
			} elseif ( in_array( $field, array( 'name', 'name_natural', 'createdTime', 'modifiedTime', 'quotaBytesUsed' ) ) ) {
				$orderByParts[] = "$field $sortDirection";
			}
		}

		$orderBy = implode( ',', $orderByParts );

		return array(
			'fields'                    => PNPND_LIST_FIELDS,
			'pageSize'                  => 300,
			'orderBy'                   => $orderBy ?: 'folder,name',
			'pageToken'                 => '',
			'supportsAllDrives'         => true,
			'includeItemsFromAllDrives' => true,
			'corpora'                   => 'allDrives',
			'q'                         => $query,
		);
	}

	private function fetchFilesFromCache( $args ) {
		return Files::getInstance()->getFolder( $args['id'], $args['accountId'], $args );
	}

	private function prepareResponse( $files, $args ) {
		$folderId  = $args['id'] ?? null;
		$accountId = $args['accountId'] ?? null;
		$page      = $args['page'] ?? 1;
		$perPage   = $args['perPage'] ?? 20;

		if ( empty( $folderId ) || empty( $accountId ) ) {
			return array();
		}

		if ( $args['from'] === 'server' ) {
			$files = array_slice( $files, ( $page - 1 ) * $perPage, $perPage );
		}

		$filter = array();

		if ( ! empty( $args['extensions'] ) && is_array( $args['extensions'] ) ) {
			$placeholders           = implode( ',', array_fill( 0, count( $args['extensions'] ), '%s' ) );
			$filter['filterSql']    = " AND extension in ($placeholders)";
			$filter['filterParams'] = $args['extensions'];
		}

		$totalFiles = Files::getInstance()->childrenCount( $folderId, $accountId, $filter );

		$totalPages = ceil( intval( $totalFiles ) / intval( $perPage ) );

		$hasMore = $page < $totalPages;

		$filteredFiles = array_filter( $files, fn ( $file ) => $file['parentId'] === $folderId || $folderId === 'starred' );

		$response = array(
			'files'       => array_values( $filteredFiles ),
			'hasMore'     => (bool) $hasMore,
			'totalFiles'  => intval( $totalFiles ),
			'totalPages'  => intval( $totalPages ),
			'currentPage' => intval( $page ),
		);

		if ( $hasMore ) {
			$response['nextPage'] = $page + 1;
		}

		return $response;
	}
}
