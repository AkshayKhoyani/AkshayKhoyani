<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header();
?>
<div class="wrap layout">
	<div>
		<?php ejt_breadcrumbs(); ?>
		<div class="archive-head">
			<h1><?php echo esc_html( wp_strip_all_tags( get_the_archive_title() ) ); ?></h1>
			<?php the_archive_description(); ?>
		</div>

		<?php if ( have_posts() ) : ?>
			<div class="card-grid">
				<?php while ( have_posts() ) : the_post(); get_template_part( 'template-parts/card' ); endwhile; ?>
			</div>
			<div class="pagination"><?php echo paginate_links( array( 'mid_size' => 1 ) ); ?></div>
		<?php else : ?>
			<div class="article"><p>No posts found here yet.</p></div>
		<?php endif; ?>
	</div>
	<?php get_sidebar(); ?>
</div>
<?php get_footer(); ?>
