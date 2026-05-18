<?php

namespace Pnpnd\ND\App\Feature;

use Pnpnd\ND\App\Accounts;
use Pnpnd\ND\App\Service\FileService;
use Pnpnd\ND\Models\BaseModel;
use Pnpnd\ND\Models\Files;
use Pnpnd\ND\Utils\Helpers;
use WP_Error;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class FolderManager {

	private $files;

	public function __construct( FileService $files ) {
		$this->files = $files;
	}

	public function getFolderByKey( $fileKey, $args = array() ) {
		if ( empty( $fileKey ) ) {
			return new WP_Error( 400, __( 'Missing folder key.', 'ninja-drive' ) );
		}

		if ( in_array( $fileKey, array( 'my-drive', 'shared', 'starred', 'computers', 'shared-drives' ) ) && ! current_user_can( 'manage_options' ) ) {
			return new WP_Error( 403, __( 'You do not have permission to access this resource.', 'ninja-drive' ), array( 'status' => 403 ) );
		}

		$data = $this->getDataByKey( $fileKey );

		if ( empty( $data ) || is_wp_error( $data ) ) {
			return false;
		}

		$folderId  = $data['folderId'] ?? null;
		$accountId = $data['accountId'] ?? null;

		if ( ! $folderId || ! $accountId ) {
			return false;
		}

		$hasSearch = ! empty( $args['search'] ) || ! empty( $args['types'] );

		if ( ! empty( $hasSearch ) ) {
			$types        = is_array( $args['types'] ) ? $args['types'] : explode( ',', $args['types'] ?? '' );
			$searchResult = ( new SearchEngine( new FileLister( $this->files ) ) )->search(
				array(
					'query'     => $args['search'] ?? '',
					'types'     => $types,
					'from'      => $args['from'] ?? 'cache',
					'orderBy'   => $args['orderBy'] ?? 'name',
					'order'     => $args['order'] ?? 'ASC',
					'folderId'  => $folderId,
					'accountId' => $accountId,
					'scope'     => 'parent',
					'limit'     => $args['perPage'] ?? 10,
				)
			);

			if ( is_wp_error( $searchResult ) ) {
				return $searchResult;
			}

			$page    = $args['page'] ?? 1;
			$perPage = $args['perPage'] ?? 10;

			$totalFiles     = count( $searchResult );
			$totalPages     = ceil( $totalFiles / $perPage );
			$offset         = ( $page - 1 ) * $perPage;
			$paginatedFiles = array_slice( $searchResult, $offset, $perPage );

			return array(
				'files'       => array_values( $paginatedFiles ),
				'hasMore'     => $page < $totalPages,
				'totalFiles'  => intval( $totalFiles ),
				'totalPages'  => intval( $totalPages ),
				'currentPage' => intval( $page ),
			);
		}

		return ( new FileLister( $this->files ) )->getFiles(
			array(
				'id'         => $folderId,
				'accountId'  => $accountId,
				'from'       => $args['from'] ?? 'cache',
				'orderBy'    => $args['orderBy'] ?? 'folder,name',
				'order'      => $args['order'] ?? 'ASC',
				'page'       => $args['page'] ?? 1,
				'perPage'    => $args['perPage'] ?? 20,
				'search'     => '',
				'extensions' => $args['extensions'] ?? array(),
			)
		);
	}

	public function getFolderTree( $folderKey, $args = array() ) {
		$args = wp_parse_args(
			$args,
			array(
				'widgetId' => null,
				'orderBy'  => 'name',
				'order'    => 'ASC',
			)
		);

		$queryArgs = array(
			'returnType' => 'array',
			'perPage'    => BaseModel::MAX_ITEMS_PER_PAGE,
			'recursive'  => false,
			'orderBy'    => $args['orderBy'],
			'order'      => $args['order'],
		);

		if ( ! empty( $args['widgetId'] ) ) {
			$validateFolderKey = Helpers::validateWidgetKey( $args['widgetId'], $folderKey );

			if ( empty( $validateFolderKey ) || is_wp_error( $validateFolderKey ) ) {
				return new WP_Error( 'forbidden', __( 'You do not have permission to access this resource.', 'ninja-drive' ), array( 'status' => 403 ) );
			}

			if ( $folderKey === 'my-drive' || is_array( $validateFolderKey ) ) {
				return ( new FileRetriever() )->getFilesByKeys( $validateFolderKey, $queryArgs, $this->files );
			}

			$folderKey = is_array( $validateFolderKey )
				? $validateFolderKey[0]
				: $validateFolderKey;
		}

		if ( $folderKey === 'my-drive' ) {
			$currentAccount = Accounts::getInstance()->getAccount();

			if ( is_wp_error( $currentAccount ) || empty( $currentAccount ) ) {
				return new WP_Error( 'forbidden', __( 'You do not have permission to access this resource.', 'ninja-drive' ), array( 'status' => 403 ) );
			}

			$parentId  = $currentAccount->getRootId();
			$accountId = $currentAccount->getId();
		} else {
			$folder = ( new FileRetriever() )->getFileByKey( $folderKey );

			if ( is_wp_error( $folder ) ) {
				return $folder;
			}

			if ( empty( $folder ) || empty( $folder['id'] ) || empty( $folder['accountId'] ) ) {
				return new WP_Error( 404, __( 'Folder not found.', 'ninja-drive' ) );
			}

			$parentId  = $folder['id'];
			$accountId = $folder['accountId'];
		}

		return array(
			'files' => $this->getFolders(
				$accountId,
				array(
					'orderBy'  => $args['orderBy'],
					'order'    => $args['order'],
					'parentId' => $parentId,
				)
			),
		);
	}

	public function getFolders( ?string $accountId = null, array $config = array() ) {
		return Files::getInstance()->getFolders( $accountId, $config );
	}

	public function newFolder( $name, $parentKey ) {
		if ( empty( $name ) ) {
			return new WP_Error( 400, __( 'Folder name or parent folder not found for new folder creation', 'ninja-drive' ) );
		}

		if ( empty( $parentKey ) ) {
			return new WP_Error( 400, __( 'Parent folder not found key for new folder creation', 'ninja-drive' ) );
		}

		$folder = ( new FileRetriever() )->getFileByKey( $parentKey );

		if ( is_wp_error( $folder ) ) {
			return $folder;
		}

		$folder = $this->files->createNewFolder( $name, $folder['id'] );

		if ( empty( $folder ) ) {
			return new WP_Error( 500, __( 'Failed to create folder', 'ninja-drive' ) );
		}

		return $folder;
	}

	public function getDataByKey( $key ) {
		$folderId  = null;
		$accountId = null;
		$folder    = null;

		if ( in_array( $key, array( 'my-drive', 'shared', 'starred', 'computers', 'shared-drives' ) ) ) {
			$account = Accounts::getInstance()->getAccount();

			if ( empty( $account ) || is_wp_error( $account ) ) {
				return false;
			}

			$accountId = $account->getId();

			$folderId = $key === 'my-drive' ? $account->getRootId() : $key;
		} else {
			$folder = ( new FileRetriever() )->getFileByKey( $key );

			if ( empty( $folder ) || is_wp_error( $folder ) ) {
				return false;
			}

			$folderId  = $folder['id'] ?? null;
			$accountId = $folder['accountId'] ?? null;
		}

		return array(
			'folderId'  => $folderId,
			'accountId' => $accountId,
			'folder'    => $folder,
		);
	}
}
