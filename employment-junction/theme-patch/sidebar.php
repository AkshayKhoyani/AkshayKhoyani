<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }
?>
<aside class="sidebar" aria-label="Sidebar">
	<?php if ( is_active_sidebar( 'sidebar-1' ) ) : ?>
		<?php dynamic_sidebar( 'sidebar-1' ); ?>
	<?php else : ?>
		<?php foreach ( array( 'ej_job' => array( 'Latest Jobs', 8 ), 'ej_result' => array( 'Latest Results', 5 ), 'ej_admit_card' => array( 'Admit Card', 5 ) ) as $ejt_pt => $ejt_w ) :
			if ( ! post_type_exists( $ejt_pt ) ) { continue; }
			$ejt_items = get_posts( array( 'numberposts' => $ejt_w[1], 'post_type' => $ejt_pt, 'post_status' => 'publish', 'post__not_in' => array( get_the_ID() ) ) );
			if ( ! $ejt_items ) { continue; }
			?>
			<section class="widget">
				<h3 class="widget-title"><?php echo esc_html( $ejt_w[0] ); ?></h3>
				<ul>
					<?php foreach ( $ejt_items as $p ) : ?>
						<li><a href="<?php echo esc_url( get_permalink( $p ) ); ?>"><?php echo esc_html( get_the_title( $p ) ); ?></a></li>
					<?php endforeach; ?>
				</ul>
			</section>
		<?php endforeach; ?>
		<section class="widget" style="background:linear-gradient(135deg,#ef233c,#7c3aed);color:#fff;border-radius:14px;padding:16px">
			<h3 class="widget-title" style="color:#fff">🎯 Free Mock Test</h3>
			<p style="margin:0 0 10px">Real exam pattern · Instant score · Full solutions</p>
			<a href="<?php echo esc_url( home_url( '/free-mock-test/' ) ); ?>" style="display:inline-block;background:#fff;color:#0f172a;font-weight:800;border-radius:10px;padding:8px 14px">Start Now →</a>
		</section>
	<?php endif; ?>
</aside>
