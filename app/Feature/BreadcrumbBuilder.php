<?php

namespace Pnpnd\ND\App\Feature;

use Pnpnd\ND\App\Accounts;
use WP_Error;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class BreadcrumbBuilder {

	public function getBreadcrumbByKey( $fileKey, $args = array() ) {
		$defaults = array(
			'rootFileKey'    => null,
			'rootFolderKey'  => 'my-drive',
			'rootFolderName' => __( 'My Drive', 'ninja-drive' ),
		);

		$args           = wp_parse_args( $args, $defaults );
		$rootFileKey    = $args['rootFileKey'];
		$rootFolderKey  = $args['rootFolderKey'] !== '/' ? $args['rootFolderKey'] : 'my-drive';
		$rootFolderName = $args['rootFolderName'];

		$home = array(
			array(
				'fileKey' => $rootFolderKey,
				'name'    => $rootFolderName,
			),
		);

		if ( empty( $fileKey ) && $rootFolderKey === 'my-drive' ) {
			return array(
				array(
					'fileKey' => '/',
					'name'    => $rootFolderName,
				),
			);
		}

		if ( $rootFileKey !== null && $rootFolderKey === 'my-drive' ) {
			$rootFile = ( new FileRetriever() )->getFileByKey( $rootFileKey );

			if ( is_wp_error( $rootFile ) ) {
				return $home;
			}

			$parentId = $rootFile['parentId'] ?? null;

			if ( $parentId ) {
				$rootFolder = ( new FileRetriever() )->getFile(
					$parentId,
					$rootFile['accountId'] ?? ''
				);

				if ( ! is_wp_error( $rootFolder ) ) {
					$rootFolderKey = $rootFolder['fileKey'] ?? '/';
				}
			}
		}

		if ( $fileKey === $rootFolderKey ) {
			return $home;
		}

		if ( in_array( $fileKey, array( 'my-drive', 'shared', 'starred', 'computers', 'shared-drives' ) ) ) {
			$labels = array(
				'my-drive'      => __( 'My Drive', 'ninja-drive' ),
				'shared'        => __( 'Shared with me', 'ninja-drive' ),
				'starred'       => __( 'Starred', 'ninja-drive' ),
				'computers'     => __( 'Computers', 'ninja-drive' ),
				'shared-drives' => __( 'Shared Drives', 'ninja-drive' ),
			);

			return array(
				array(
					'fileKey' => $fileKey,
					'name'    => $labels[ $fileKey ] ?? ucfirst( $fileKey ),
				),
			);
		}

		$folderData = $this->getDataByKey( $fileKey );

		$accountId = $folderData['accountId'] ?? null;
		$folder    = $folderData['folder'] ?? array();

		$breadcrumb = array(
			array(
				'fileKey' => $fileKey,
				'name'    => $folder['name'] ?? __( 'Home', 'ninja-drive' ),
			),
		);

		$specialParents = array(
			'shared-drives' => __( 'Shared Drives', 'ninja-drive' ),
			'computers'     => __( 'Computers', 'ninja-drive' ),
			'shared'        => __( 'Shared with me', 'ninja-drive' ),
		);

		if ( $rootFolderKey ) {
			$specialParents[ $rootFolderKey ] = $rootFolderName;
		}

		$parentId = $folder['parentId'] ?? null;

		if ( ! empty( $parentId ) ) {
			$parentKey = pnpndGenerateKey( $parentId, $accountId );

			if ( isset( $specialParents[ $parentKey ] ) ) {
				$breadcrumb[] = array(
					'fileKey' => '/',
					'name'    => $specialParents[ $parentKey ],
				);

				return $breadcrumb;
			}

			$account = Accounts::getInstance()->getAccount( $accountId );

			if ( is_wp_error( $account ) ) {
				return $account;
			}

			if ( $account && $account->getRootId() === $parentId ) {
				$breadcrumb[] = array(
					'fileKey' => 'my-drive',
					'name'    => __( 'My Drive', 'ninja-drive' ),
				);

				return $breadcrumb;
			}

			$parentFolder = ( new FileRetriever() )->getFile( $parentId, $accountId );

			if ( is_wp_error( $parentFolder ) ) {
				return $breadcrumb;
			}

			if ( ! empty( $parentFolder['fileKey'] ) && ! is_wp_error( $parentFolder ) ) {
				$_breadcrumb = $this->getBreadcrumbByKey(
					$parentFolder['fileKey'],
					array(
						'rootFolderKey'  => $rootFolderKey,
						'rootFolderName' => $rootFolderName,
					)
				);

				if ( is_wp_error( $_breadcrumb ) ) {
					return $_breadcrumb;
				}

				return array_merge( $breadcrumb, $_breadcrumb );
			}
		}

		return $breadcrumb;
	}

	private function getDataByKey( $key ) {
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
