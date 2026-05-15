<?php

namespace Pninja\ND\Integrations\Forms;

use Pninja\ND\App\App;
use Pninja\ND\Integrations\BaseIntegration;
use Pninja\ND\Models\Notices;
use Pninja\ND\Utils\Singleton;
use WPCF7_Submission;

defined( 'ABSPATH' ) or exit;

class ContactForm7 extends BaseIntegration {

	use Singleton;

	public function __construct() {
		parent::__construct( 'contactForm7', 'Contact Form 7' );
	}

	public function init( string $id, array $integration ): void {
		add_action(
			'admin_enqueue_scripts',
			function () {
				wp_enqueue_style( 'pnpnd-admin' );
			}
		);
		add_action( 'wpcf7_init', array( $this, 'wpcf7Init' ) );
	}

	public function wpcf7Init() {
		add_filter( 'wpcf7_pre_construct_contact_form_properties', array( $this, 'registerProperty' ), 10, 2 );
		add_filter( 'wpcf7_editor_panels', array( $this, 'editorPanel' ) );
		add_action( 'wpcf7_save_contact_form', array( $this, 'saveForm' ), 10, 3 );
		add_action( 'wpcf7_before_send_mail', array( $this, 'processUploadedFiles' ), 10, 3 );
	}

	/**
	 * Register the ninja_drive property on CF7 forms.
	 */
	public function registerProperty( $properties, $contact_form ) {
		$properties += array(
			'ninja_drive' => array(),
		);

		return $properties;
	}

	/**
	 * Add the Ninja Drive tab to the CF7 editor.
	 */
	public function editorPanel( $panels ) {
		$panels['ninja-drive-panel'] = array(
			'title'    => __( 'Ninja Drive', 'ninja-drive' ),
			'callback' => array( $this, 'renderEditorPanel' ),
		);

		return $panels;
	}

	/**
	 * Render the Ninja Drive settings panel.
	 */
	public function renderEditorPanel( $post ) {
		$prop = wp_parse_args(
			$post->prop( 'ninja_drive' ),
			array(
				'enable'            => false,
				'upload_folder'     => '',
				'skip_local_upload' => false,
			)
		);

		$folders = $this->getGoogleDriveFolder();
		?>
		<h2><?php esc_html_e( 'Ninja Drive Upload', 'ninja-drive' ); ?></h2>
		<?php wp_nonce_field( 'pnpnd_cf7_ninja_drive_settings', 'pnpnd_cf7_ninja_drive_nonce' ); ?>

		<fieldset>
			<legend>
				<?php esc_html_e( 'Upload files attached to this form to Ninja Drive. Files will be uploaded to the selected folder. This settings will apply only the CF7 file fields.', 'ninja-drive' ); ?>
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
	public function saveForm( $contact_form, $args, $context ) {
		if ( ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['pnpnd_cf7_ninja_drive_nonce'] ?? '' ) ), 'pnpnd_cf7_ninja_drive_settings' ) ) {
			return;
		}

		// It's a mixed array of scalar values and arrays, so we need to sanitize it carefully.
        // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
		$data = isset( $_POST['pnpnd-ninja-drive'] ) ? (array) wp_unslash( $_POST['pnpnd-ninja-drive'] ) : array();

		$prop = array(
			'enable'            => ! empty( $data['enable'] ),
			'upload_folder'     => sanitize_text_field( $data['upload_folder'] ?? '' ),
			'skip_local_upload' => ! empty( $data['skip_local_upload'] ),
		);

		$contact_form->set_properties(
			array(
				'ninja_drive' => $prop,
			)
		);
	}

	public function processUploadedFiles( $contact_form, $abort, $submission ) {
		$submission  = WPCF7_Submission::get_instance();
		$ninja_drive = $contact_form->prop( 'ninja_drive' );

		if ( empty( $ninja_drive['enable'] ) || empty( $ninja_drive['upload_folder'] ) ) {
			return;
		}

		if ( $submission ) {
			$uploaded_files = $submission->uploaded_files();

			$result = null;
			$name   = '';

			if ( ! empty( $uploaded_files ) ) {
				global $wp_filesystem;

				if ( ! function_exists( 'WP_Filesystem' ) ) {
					require_once ABSPATH . 'wp-admin/includes/file.php';
				}

				WP_Filesystem();

				foreach ( $uploaded_files as $fieldName => $path ) {
					if ( is_array( $path ) ) {
						$path = reset( $path );
					}

					if ( ! wpcf7_is_file_path_in_content_dir( $path ) ) {
						continue;
					}

					$name      = basename( $path );
					$type      = wp_check_filetype( $name )['type'];
					$content   = $wp_filesystem->get_contents( $path );
					$folderKey = $ninja_drive['upload_folder'];

					$result = App::getInstance()->upload( $name, $type, $folderKey, $content );
				}
			}

			if ( is_wp_error( $result ) || empty( $result ) ) {
				$message = is_wp_error( $result ) ? $result->get_error_message() : __( 'Unknown error', 'ninja-drive' );
				Notices::getInstance()->add(
					array(
						'type'    => 'error',
						'message' => sprintf(
							/* translators: 1: File name, 2: Error message */
							__( 'Failed to upload file "%1$s" to Google Drive: %2$s', 'ninja-drive' ),
							$name,
							$message
						),
					)
				);
			} else {
				Notices::getInstance()->add(
					array(
						'type'    => 'success',
						'message' => sprintf(
							/* translators: 1: File name */
							__( 'File "%s" uploaded to Google Drive successfully.', 'ninja-drive' ),
							$name
						),
					)
				);

				// If skip_local_upload is enabled, remove the local file after uploading to Google Drive
				if ( ! empty( $ninja_drive['skip_local_upload'] ) ) {
					wpcf7_rmdir_p( $path );
				}
			}
		}
	}
}
