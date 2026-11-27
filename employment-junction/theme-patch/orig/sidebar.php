<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }
?>
<aside class="sidebar" aria-label="Sidebar">
	<?php if ( is_active_sidebar( 'sidebar-1' ) ) : ?>
		<?php dynamic_sidebar( 'sidebar-1' ); ?>
	<?php else : ?>
		<section class="widget">
			<h3 class="widget-title">Latest Jobs</h3>
			<ul>
				<?php foreach ( get_posts( array( 'numberposts' => 8, 'category_name' => 'latest-job' ) ) as $p ) : ?>
					<li><a href="<?php echo esc_url( get_permalink( $p ) ); ?>"><?php echo esc_html( get_the_title( $p ) ); ?></a></li>
				<?php endforeach; ?>
			</ul>
		</section>
		<section class="widget">
			<h3 class="widget-title">Latest Results</h3>
			<ul>
				<?php foreach ( get_posts( array( 'numberposts' => 6, 'category_name' => 'results' ) ) as $p ) : ?>
					<li><a href="<?php echo esc_url( get_permalink( $p ) ); ?>"><?php echo esc_html( get_the_title( $p ) ); ?></a></li>
				<?php endforeach; ?>
			</ul>
		</section>
	<?php endif; ?>
</aside>
