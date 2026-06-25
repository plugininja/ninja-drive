<?php

namespace Pnpnd\ND;

use Pnpnd\ND\Traits\Singleton;
use Pnpnd\ND\Updates\Migration_Runner;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

/**
 * Bridges plugin update events to the migration runner.
 *
 *  - `upgrader_process_complete` — primary trigger. Fires after WordPress
 *    updates this plugin via its own update mechanism.
 *  - `plugins_loaded` — fallback version check. Catches cases the upgrader
 *    hook misses (FTP deploy, manual file replacement, multi-site network
 *    activation edge cases).
 *
 * Both paths delegate to `Migration_Runner::run()`, which is idempotent and
 * internally gated by a transient lock.
 */
class Updater {

	use Singleton;

	public function __construct() {
		add_action( 'upgrader_process_complete', array( $this, 'on_upgrade' ), 10, 2 );
		add_action( 'plugins_loaded', array( $this, 'maybe_migrate' ), 20 );
	}

	/**
	 * Primary trigger — only fires when WP's own updater updates our plugin.
	 *
	 * @param \WP_Upgrader $upgrader Unused.
	 * @param array        $data     Upgrade event payload.
	 */
	public function on_upgrade( $upgrader, $data ): void {
		if ( ! is_array( $data ) ) {
			return;
		}

		if ( 'update' !== ( $data['action'] ?? '' ) ) {
			return;
		}
		if ( 'plugin' !== ( $data['type'] ?? '' ) ) {
			return;
		}
		if ( ! in_array( plugin_basename( PNPND_FILE ), (array) ( $data['plugins'] ?? array() ), true ) ) {
			return;
		}

		$this->maybe_migrate();
	}

	/**
	 * Fallback — detect schema version drift on every request.
	 *
	 * Cheap: `get_option()` is object-cached; only the version string is read.
	 * The expensive migration body runs only when a version bump is detected.
	 */
	public function maybe_migrate(): void {
		$stored = get_option( 'pnpnd_db_version', '0.0.0' );

		if ( version_compare( $stored, PNPND_DB_VERSION, '<' ) ) {
			Migration_Runner::run();
		}
	}
}
