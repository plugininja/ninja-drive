<?php defined('ABSPATH') || exit;

if (! empty($args)) :
    $pnpnd_title            = isset($args['title']) ? $args['title'] : '';
    $pnpnd_description      = isset($args['description']) ? $args['description'] : '';
    $pnpnd_icon             = isset($args['icon']) ? $args['icon'] : '';
    $pnpnd_wrapper_class    = isset($args['wrapper_class']) ? $args['wrapper_class'] : '';
    $pnpnd_iconClass        = isset($args['iconClass']) ? $args['iconClass'] : '';
    $pnpnd_card_status      = isset($args['card_status']) ? $args['card_status'] : 'primary';
    $pnpnd_primary_button   = isset($args['primary_button']) ? (array) $args['primary_button'] : [];
    $pnpnd_secondary_button = isset($args['secondary_button']) ? (array) $args['secondary_button'] : [];

    $pnpnd_pb_title  = isset($pnpnd_primary_button['title']) ? $pnpnd_primary_button['title'] : '';
    $pnpnd_pb_url    = isset($pnpnd_primary_button['url']) ? $pnpnd_primary_button['url'] : '';
    $pnpnd_pb_target = ! empty($pnpnd_primary_button['target']) ? '_blank' : '_self';
    $pnpnd_pb_icon   = isset($pnpnd_primary_button['icon']) ? $pnpnd_primary_button['icon'] : 'check';
    $pnpnd_pb_class  = isset($pnpnd_primary_button['class']) ? ' pnpnd-' . $pnpnd_primary_button['class'] : '';

    $pnpnd_sb_title  = isset($pnpnd_secondary_button['title']) ? $pnpnd_secondary_button['title'] : '';
    $pnpnd_sb_url    = isset($pnpnd_secondary_button['url']) ? $pnpnd_secondary_button['url'] : '';
    $pnpnd_sb_target = ! empty($pnpnd_secondary_button['target']) ? '_blank' : '_self';
    $pnpnd_sb_icon   = isset($pnpnd_secondary_button['icon']) ? $pnpnd_secondary_button['icon'] : 'check';
    $pnpnd_sb_class  = isset($pnpnd_secondary_button['class']) ? ' pnpnd-' . $pnpnd_secondary_button['class'] : '';
    wp_enqueue_style('pnpnd-common');

    ?>
	<div class="pnpnd-top-level-wrapper <?php echo esc_attr($pnpnd_wrapper_class); ?>">
		<div class="pnpnd-notice-card flex-center rounded-md pnpnd-notice-status-<?php echo esc_attr($pnpnd_card_status); ?>">
			<div class="pnpnd-notice-card-wrapper flex-center flex-col">
				<?php if (! empty($pnpnd_icon)) : ?>
					<span class="pnpnd-icon pnpnd-notice-card-wrapper-icon <?php echo esc_attr($pnpnd_iconClass); ?>"><?php echo esc_html($pnpnd_icon); ?></span>
				<?php endif; ?>

				<div class="pnpnd-notice-card-wrapper-content flex-center flex-col">
					<?php if (! empty($pnpnd_title)) : ?>
						<h3 class="pnpnd-title"><?php echo esc_html($pnpnd_title); ?></h3>
					<?php endif; ?>

					<?php if (! empty($pnpnd_description)) : ?>
						<p class="pnpnd-description"><?php echo esc_html($pnpnd_description); ?></p>
					<?php endif; ?>
				</div>

				<?php if ($pnpnd_pb_title || $pnpnd_sb_title) : ?>
					<div class="pnpnd-notice-card-wrapper-buttons flex-center">
						<?php if ($pnpnd_pb_title) : ?>
							<?php if ($pnpnd_pb_url) : ?>
								<a href="<?php echo esc_url($pnpnd_pb_url); ?>"
									target="<?php echo esc_attr($pnpnd_pb_target); ?>"
									class="pnpnd-notice-card-btn pn-button pn-button--primary pn-button--small rounded-sm pn-button--<?php echo esc_attr($pnpnd_card_status); ?> <?php echo esc_attr($pnpnd_pb_class); ?>">
								<?php else : ?>
									<button type="button"
										class="pnpnd-notice-card-btn pn-button pn-button--primary pn-button--small rounded-sm pn-button--<?php echo esc_attr($pnpnd_card_status); ?> <?php echo esc_attr($pnpnd_pb_class); ?> not-own-color">
									<?php endif; ?>

									<span class="pnpnd-icon text-md"><?php echo esc_html($pnpnd_pb_icon); ?></span>
									<span><?php echo esc_html($pnpnd_pb_title); ?></span>
									<?php if ($pnpnd_pb_url) : ?>
								</a>
							<?php else : ?>
								</button>
							<?php endif; ?>
						<?php endif; ?>

						<?php if ($pnpnd_sb_title) : ?>
							<?php if ($pnpnd_sb_url) : ?>
								<a href="<?php echo esc_url($pnpnd_sb_url); ?>"
									target="<?php echo esc_attr($pnpnd_sb_target); ?>"
									class="pnpnd-notice-card-btn pnpnd-btn pnpnd-btn--rounded-sm pnpnd-btn--<?php echo esc_attr($pnpnd_card_status); ?> <?php echo esc_attr($pnpnd_sb_class); ?> not-own-color">
								<?php else : ?>
									<button type="button" class="pnpnd-notice-card-btn pnpnd-btn pnpnd-btn--rounded-sm pnpnd-btn--<?php echo esc_attr($pnpnd_card_status); ?> <?php echo esc_attr($pnpnd_sb_class); ?> not-own-color">
									<?php endif; ?>

									<span class="pnpnd-icon text-md"><?php echo esc_html($pnpnd_sb_icon); ?></span>
									<span><?php echo esc_html($pnpnd_sb_title); ?></span>

									<?php if ($pnpnd_sb_url) : ?>
								</a>
							<?php else : ?>
								</button>
							<?php endif; ?>
						<?php endif; ?>

					</div>
				<?php endif; ?>

			</div>
		</div>
	</div>
<?php endif; ?>
