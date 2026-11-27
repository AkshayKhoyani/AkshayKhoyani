<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header();
?>
<div class="wrap layout">
	<div>
		<?php ejt_breadcrumbs(); ?>

		<?php while ( have_posts() ) : the_post(); ?>
			<article <?php post_class( 'article' ); ?>>
				<?php
				$cats = get_the_category();
				if ( ! empty( $cats ) ) {
					echo '<span class="post-card__cat" style="color:var(--accent);font-weight:800;text-transform:uppercase;font-size:.72rem;letter-spacing:.04em">' . esc_html( $cats[0]->name ) . '</span>';
				}
				?>
				<h1 class="entry-title"><?php the_title(); ?></h1>

				<div class="entry-meta">
					<span>📅 <?php echo esc_html( get_the_date( 'j F Y' ) ); ?></span>
					<span>🕒 <?php echo esc_html( ejt_reading_time() ); ?></span>
					<?php if ( get_the_modified_date( 'Ymd' ) !== get_the_date( 'Ymd' ) ) : ?>
						<span>Updated: <?php echo esc_html( get_the_modified_date( 'j M Y' ) ); ?></span>
					<?php endif; ?>
				</div>

				<?php if ( has_post_thumbnail() ) : ?>
					<div class="featured" style="margin-bottom:18px">
						<?php the_post_thumbnail( 'full', array( 'style' => 'border-radius:12px;width:100%;height:auto', 'fetchpriority' => 'high', 'loading' => 'eager', 'sizes' => '(max-width:800px) 100vw, 800px' ) ); ?>
					</div>
				<?php endif; ?>

				<div class="entry-content">
					<?php
					the_content();
					wp_link_pages( array( 'before' => '<div class="page-links">Pages: ', 'after' => '</div>' ) );
					?>
				</div>

				<?php
				$url   = rawurlencode( get_permalink() );
				$title = rawurlencode( get_the_title() );
				?>
				<div class="share-row" aria-label="Share">
					<a class="wa" href="https://api.whatsapp.com/send?text=<?php echo $title . '%20' . $url; ?>" rel="noopener nofollow" target="_blank">WhatsApp</a>
					<a class="tg" href="https://t.me/share/url?url=<?php echo $url; ?>&text=<?php echo $title; ?>" rel="noopener nofollow" target="_blank">Telegram</a>
					<a class="fb" href="https://www.facebook.com/sharer/sharer.php?u=<?php echo $url; ?>" rel="noopener nofollow" target="_blank">Facebook</a>
					<a class="tw" href="https://twitter.com/intent/tweet?url=<?php echo $url; ?>&text=<?php echo $title; ?>" rel="noopener nofollow" target="_blank">X</a>
				</div>

				<?php if ( has_tag() ) : ?>
					<div style="margin-top:18px"><?php the_tags( '<strong>Tags:</strong> ', ', ' ); ?></div>
				<?php endif; ?>
			</article>

			<?php
			/* More updates from the SAME section (jobs → jobs, results → results). Never an unfiltered list of everything. */
			$ejt_args = array(
				'numberposts'  => 4,
				'post_status'  => 'publish',
				'post_type'    => get_post_type(),
				'post__not_in' => array( get_the_ID() ),
				'orderby'      => 'date',
			);
			if ( 'post' === get_post_type() ) {
				$ejt_ids = wp_list_pluck( $cats, 'term_id' );
				if ( $ejt_ids ) {
					$ejt_args['category__in'] = $ejt_ids;
				}
			}
			$related = get_posts( $ejt_args );
			if ( $related ) : ?>
				<section class="section" style="padding:26px 0 0">
					<div class="section-head"><h2>More Latest Updates</h2></div>
					<div class="card-grid">
						<?php foreach ( $related as $p ) : ?>
							<a class="post-card" href="<?php echo esc_url( get_permalink( $p ) ); ?>" style="color:inherit">
								<div class="thumb"><?php echo get_the_post_thumbnail( $p, 'ejt_card', array( 'loading' => 'lazy' ) ); ?></div>
								<div class="body">
									<h3><?php echo esc_html( get_the_title( $p ) ); ?></h3>
									<span class="meta"><?php echo esc_html( get_the_date( 'j M Y', $p ) ); ?></span>
								</div>
							</a>
						<?php endforeach; ?>
					</div>
				</section>
			<?php endif; ?>

			<?php
			if ( comments_open() || get_comments_number() ) {
				comments_template();
			}
			?>
		<?php endwhile; ?>
	</div>

	<?php get_sidebar(); ?>
</div>
<?php get_footer(); ?>
