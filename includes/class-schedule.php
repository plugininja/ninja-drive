<?php

namespace Pnpnd\ND;

use Pnpnd\ND\App\Accounts;
use Pnpnd\ND\App\App;
use Pnpnd\ND\Traits\Singleton;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class Schedule {

	use Singleton;

	private const MAX_EXECUTION_TIME = 120;
	private const PER_PAGE           = 50;

	public function __construct() {
		\add_action( 'pnpnd_sync_all_files', array( $this, 'sync_cached_files' ), 10, 2 );
	}

	public function sync_cached_files( string $account_id, int $page ): void {
		if ( empty( $account_id ) || $page < 1 ) {
			return;
		}

		$start_time        = time();
		$per_page          = self::PER_PAGE;
		$processed_folders = 0;
		$processed_files   = 0;
		$errors            = array();

		$app = App::get_instance( $account_id );

		$account = Accounts::get_instance()->get_account( $account_id );

		if ( \is_wp_error( $account ) ) {
			$this->update_sync_progress(
				$account_id,
				array(
					'status'  => 'error',
					'message' => $account->get_error_message(),
				)
			);
			$this->cleanup_sync( $account_id );

			return;
		}

		$root_folder = $app->get_files(
			array(
				'id'         => $account->get_root_id(),
				'account_id' => $account_id,
				'from'       => 'server',
			)
		);

		if ( \is_wp_error( $root_folder ) ) {
			$this->update_sync_progress(
				$account_id,
				array(
					'status'  => 'error',
					'message' => $root_folder->get_error_message(),
				)
			);
			$this->cleanup_sync( $account_id );

			return;
		}

		$result = $app->get_folders(
			$account_id,
			array(
				'page'     => $page,
				'per_page' => $per_page,
			)
		);

		if ( \is_wp_error( $result ) ) {
			$this->update_sync_progress(
				$account_id,
				array(
					'status'  => 'error',
					'message' => $result->get_error_message(),
				)
			);
			$this->cleanup_sync( $account_id );

			return;
		}

		if ( empty( $result['files'] ) ) {
			$this->update_sync_progress(
				$account_id,
				array(
					'status'            => 'complete',
					'processed_folders' => 0,
					'processed_files'   => 0,
					'errors'            => array(),
				)
			);
			$this->cleanup_sync( $account_id );

			return;
		}

		$running = ! empty( $result['files'] );

		while ( $running ) {
			if ( time() - $start_time >= self::MAX_EXECUTION_TIME ) {
				$this->update_sync_progress(
					$account_id,
					array(
						'status'            => 'partial',
						'processed_folders' => $processed_folders,
						'processed_files'   => $processed_files,
						'next_page'         => $result['next_page'] ?? $page,
						'errors'            => $errors,
					)
				);

				return;
			}

			foreach ( $result['files'] as $file ) {
				if ( empty( $file['id'] ) ) {
					continue;
				}

				try {
					$file_result = $app->get_files(
						array(
							'id'         => $file['id'],
							'account_id' => $account_id,
							'from'       => 'server',
						)
					);

					if ( \is_wp_error( $file_result ) ) {
						$errors[] = "Failed to sync file {$file['id']}: " . $file_result->get_error_message();
					} else {
						$processed_files += count( $file_result['files'] ?? array() );
					}
				} catch ( \Exception $e ) {
					$errors[] = "Exception syncing file {$file['id']}: " . $e->getMessage();
				}
			}

			$processed_folders += count( $result['files'] );

			if ( isset( $result['has_more'] ) && $result['has_more'] && isset( $result['next_page'] ) ) {
				$result = $app->get_folders(
					$account_id,
					array(
						'page'     => $result['next_page'],
						'per_page' => $per_page,
					)
				);

				if ( \is_wp_error( $result ) || empty( $result['files'] ) ) {
					$running = false;
				}
			} else {
				$running = false;
			}
		}

		$this->update_sync_progress(
			$account_id,
			array(
				'status'            => 'complete',
				'processed_folders' => $processed_folders,
				'processed_files'   => $processed_files,
				'errors'            => $errors,
			)
		);

		$this->cleanup_sync( $account_id );
	}

	private function update_sync_progress( string $account_id, array $data ): void {
		\set_transient( "pnpnd_syncing_account_{$account_id}", maybe_serialize( $data ), \HOUR_IN_SECONDS );
	}

	private function cleanup_sync( string $account_id ): void {
		\delete_transient( "pnpnd_syncing_account_{$account_id}" );
	}
}
