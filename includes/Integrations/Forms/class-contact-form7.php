<?php

namespace Pnpnd\ND\Integrations\Forms;

use Pnpnd\ND\Traits\Singleton;
use WPCF7_Submission;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

class Contact_Form7 extends Form_Upload_Base {

	use Singleton;

	public function __construct() {
		parent::__construct( 'contact_form_7', 'Contact Form 7' );
	}

	public function init( string $id, array $integration ): void {
		add_action(
			'admin_enqueue_scripts',
			function () {
				wp_enqueue_style( 'pnpnd-admin' );
			}
		);
		add_action( 'wpcf7_init', array( $this, 'wpcf7_init' ) );
	}

	public function wpcf7_init() {
		add_filter( 'wpcf7_pre_construct_contact_form_properties', array( $this, 'register_property' ), 10, 2 );
		add_filter( 'wpcf7_editor_panels', array( $this, 'editor_panel' ) );
		add_action( 'wpcf7_save_contact_form', array( $this, 'save_form' ), 10, 3 );
		add_action( 'wpcf7_before_send_mail', array( $this, 'process_uploaded_files' ), 10, 3 );
	}

	/**
	 * Register the pnpnd_cf7 property on CF7 forms.
	 */
	public function register_property( $properties, $contact_form ) {
		$properties += array( 'pnpnd_cf7' => array() );

		return $properties;
	}

	/**
	 * Add the Ninja Drive tab to the CF7 editor.
	 */
	public function editor_panel( $panels ) {
		$panels['ninja-drive-panel'] = array(
			'title'    => __( 'Ninja Drive', 'ninja-drive' ),
			'callback' => array( $this, 'render_editor_panel' ),
		);

		return $panels;
	}

	/**
	 * Render the Ninja Drive settings panel.
	 */
	public function render_editor_panel( $post ) {
		$prop = wp_parse_args(
			$post->prop( 'pnpnd_cf7' ),
			array(
				'enable'            => false,
				'upload_folder'     => '',
				'skip_local_upload' => false,
			)
		);

		$folders = $this->get_google_drive_folder();
		?>
		<h2><?php esc_html_e( 'Ninja Drive Upload', 'ninja-drive' ); ?></h2>
		<?php wp_nonce_field( 'pnpnd_cf7_settings', 'pnpnd_cf7_nonce' ); ?>

		<fieldset>
			<legend>
				<?php esc_html_e( 'Upload files attached to this form to Ninja Drive. Files will be uploaded to the selected folder. This setting applies only to CF7 file fields.', 'ninja-drive' ); ?>
			</legend>

			<table class="form-table" role="presentation">
				<tr>
					<th scope="row">
						<label for="pnpnd-cf7-enable">
							<?php esc_html_e( 'Enable Ninja Drive Upload', 'ninja-drive' ); ?>
						</label>
					</th>
					<td>
						<input type="checkbox" id="pnpnd-cf7-enable" name="pnpnd-ninja-drive[enable]" value="1" <?php checked( $prop['enable'] ); ?> />
					</td>
				</tr>
				<tr>
					<th scope="row">
						<label for="pnpnd-cf7-folder">
							<?php esc_html_e( 'Upload Folder', 'ninja-drive' ); ?>
						</label>
					</th>
					<td>
						<select id="pnpnd-cf7-folder" name="pnpnd-ninja-drive[upload_folder]">
							<option value=""><?php esc_html_e( '— Select Folder —', 'ninja-drive' ); ?></option>
							<?php foreach ( $folders as $key => $name ) : ?>
								<option value="<?php echo esc_attr( $key ); ?>" <?php selected( $prop['upload_folder'], $key ); ?>>
									<?php echo esc_html( $name ); ?>
								</option>
							<?php endforeach; ?>
						</select>
					</td>
				</tr>
				<tr>
					<th scope="row">
						<label for="pnpnd-cf7-skip-local">
							<?php esc_html_e( 'Skip Local Upload', 'ninja-drive' ); ?>
						</label>
					</th>
					<td>
						<input type="checkbox" id="pnpnd-cf7-skip-local" name="pnpnd-ninja-drive[skip_local_upload]" value="1" <?php checked( $prop['skip_local_upload'] ); ?> />
						<p class="description">
							<?php esc_html_e( 'If enabled, files will only be uploaded to Google Drive and not stored locally on the server.', 'ninja-drive' ); ?>
						</p>
					</td>
				</tr>
			</table>
		</fieldset>
		<?php
	}

	/**
	 * Save the Ninja Drive settings when the form is saved.
	 */
	public function save_form( $contact_form, $args, $context ) {
		if ( ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['pnpnd_cf7_nonce'] ?? '' ) ), 'pnpnd_cf7_settings' ) ) {
			return;
		}

		$data = isset( $_POST['pnpnd-ninja-drive'] ) ? (array) wp_unslash( $_POST['pnpnd-ninja-drive'] ) : array();

		$contact_form->set_properties(
			array(
				'pnpnd_cf7' => array(
					'enable'            => ! empty( $data['enable'] ),
					'upload_folder'     => sanitize_text_field( $data['upload_folder'] ?? '' ),
					'skip_local_upload' => ! empty( $data['skip_local_upload'] ),
				),
			)
		);
	}

	/**
	 * Upload CF7 file fields to Google Drive on submission.
	 */
	public function process_uploaded_files( $contact_form, $abort, $submission ) {
		$submission = WPCF7_Submission::get_instance();
		$pnpnd_cf7  = $contact_form->prop( 'pnpnd_cf7' );

		if ( empty( $pnpnd_cf7['enable'] ) || empty( $pnpnd_cf7['upload_folder'] ) ) {
			return;
		}

		if ( ! $submission ) {
			return;
		}

		$uploaded_files = $submission->uploaded_files();

		if ( empty( $uploaded_files ) ) {
			return;
		}

		foreach ( $uploaded_files as $path ) {
			if ( is_array( $path ) ) {
				$path = reset( $path );
			}

			if ( ! wpcf7_is_file_path_in_content_dir( $path ) ) {
				continue;
			}

			$result = $this->upload_file( $path, $pnpnd_cf7['upload_folder'] );
			$name   = sanitize_file_name( basename( $path ) );

			$this->notify_upload_result( $result, $name );

			if ( ! is_wp_error( $result ) && ! empty( $pnpnd_cf7['skip_local_upload'] ) ) {
				wpcf7_rmdir_p( $path );
			}
		}
	}
}
