<?php

namespace Pnpnd\ND\App\Feature;

use Pnpnd\ND\App\Accounts;
use WP_Error;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class Breadcrumb_Builder {

	public function get_breadcrumb_by_key( $file_key, $args = array() ) {
		$defaults = array(
			'rootFileKey'    => null,
			'rootFolderKey'  => 'my-drive',
			'rootFolderName' => __( 'My Drive', 'ninja-drive' ),
		);

		$args             = wp_parse_args( $args, $defaults );
		$root_file_key    = $args['rootFileKey'];
		$root_folder_key  = '/' !== $args['rootFolderKey'] ? $args['rootFolderKey'] : 'my-drive';
		$root_folder_name = $args['rootFolderName'];

		$home = array(
			array(
				'file_key' => $root_folder_key,
				'name'    => $root_folder_name,
			),
		);

		if ( empty( $file_key ) && 'my-drive' === $root_folder_key ) {
			return array(
				array(
					'file_key' => '/',
					'name'    => $root_folder_name,
				),
			);
		}

		if ( null !== $root_file_key && 'my-drive' === $root_folder_key ) {
			$root_file = ( new File_Retriever() )->get_file_by_key( $root_file_key );

			if ( is_wp_error( $root_file ) ) {
				return $home;
			}

			$parent_id = $root_file['parent_id'] ?? null;

			if ( $parent_id ) {
				$root_folder = ( new File_Retriever() )->get_file(
					$parent_id,
					$root_file['account_id'] ?? ''
				);

				if ( ! is_wp_error( $root_folder ) ) {
					$root_folder_key = $root_folder['file_key'] ?? '/';
				}
			}
		}

		if ( $file_key === $root_folder_key ) {
			return $home;
		}

		if ( in_array( $file_key, array( 'my-drive', 'shared', 'starred', 'computers', 'shared-drives' ), true ) ) {
			$labels = array(
				'my-drive'      => __( 'My Drive', 'ninja-drive' ),
				'shared'        => __( 'Shared with me', 'ninja-drive' ),
				'starred'       => __( 'Starred', 'ninja-drive' ),
				'computers'     => __( 'Computers', 'ninja-drive' ),
				'shared-drives' => __( 'Shared Drives', 'ninja-drive' ),
			);

			return array(
				array(
					'file_key' => $file_key,
					'name'    => $labels[ $file_key ] ?? ucfirst( $file_key ),
				),
			);
		}

		$folder_data = $this->get_data_by_key( $file_key );

		$account_id = $folder_data['account_id'] ?? null;
		$folder     = $folder_data['folder'] ?? array();

		$breadcrumb = array(
			array(
				'file_key' => $file_key,
				'name'    => $folder['name'] ?? __( 'Home', 'ninja-drive' ),
			),
		);

		$special_parents = array(
			'shared-drives' => __( 'Shared Drives', 'ninja-drive' ),
			'computers'     => __( 'Computers', 'ninja-drive' ),
			'shared'        => __( 'Shared with me', 'ninja-drive' ),
		);

		if ( $root_folder_key ) {
			$special_parents[ $root_folder_key ] = $root_folder_name;
		}

		$parent_id = $folder['parent_id'] ?? null;

		if ( ! empty( $parent_id ) ) {
			$parent_key = pnpnd_generate_key( $parent_id, $account_id );

			if ( isset( $special_parents[ $parent_key ] ) ) {
				$breadcrumb[] = array(
					'file_key' => '/',
					'name'    => $special_parents[ $parent_key ],
				);

				return $breadcrumb;
			}

			$account = Accounts::get_instance()->get_account( $account_id );

			if ( is_wp_error( $account ) ) {
				return $account;
			}

			if ( $account && $account->get_root_id() === $parent_id ) {
				$breadcrumb[] = array(
					'file_key' => 'my-drive',
					'name'    => __( 'My Drive', 'ninja-drive' ),
				);

				return $breadcrumb;
			}

			$parent_folder = ( new File_Retriever() )->get_file( $parent_id, $account_id );

			if ( is_wp_error( $parent_folder ) ) {
				return $breadcrumb;
			}

			if ( ! empty( $parent_folder['file_key'] ) && ! is_wp_error( $parent_folder ) ) {
				$_breadcrumb = $this->get_breadcrumb_by_key(
					$parent_folder['file_key'],
					array(
						'rootFolderKey'  => $root_folder_key,
						'rootFolderName' => $root_folder_name,
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

	private function get_data_by_key( $key ) {
		$folder_id  = null;
		$account_id = null;
		$folder     = null;

		if ( in_array( $key, array( 'my-drive', 'shared', 'starred', 'computers', 'shared-drives' ), true ) ) {
			$account = Accounts::get_instance()->get_account();

			if ( empty( $account ) || is_wp_error( $account ) ) {
				return false;
			}

			$account_id = $account->get_id();

			$folder_id = 'my-drive' === $key ? $account->get_root_id() : $key;
		} else {
			$folder = ( new File_Retriever() )->get_file_by_key( $key );

			if ( empty( $folder ) || is_wp_error( $folder ) ) {
				return false;
			}

			$folder_id  = $folder['id'] ?? null;
			$account_id = $folder['account_id'] ?? null;
		}

		return array(
			'folderId'  => $folder_id,
			'account_id' => $account_id,
			'folder'    => $folder,
		);
	}
}
