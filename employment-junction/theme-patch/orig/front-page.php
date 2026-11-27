<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header();

$sections = ejt_home_sections();

/* Latest post overall for the hero. */
$latest = get_posts( array( 'numberposts' => 3, 'post_status' => 'publish' ) );
?>

<section class="hero">
	<div class="wrap">
		<h1><?php echo esc_html( ejt_opt( 'ejt_hero_title', 'No.1 Platform For Sarkari Job Updates, Results & Admit Cards' ) ); ?></h1>
		<p class="hero-sub"><?php echo esc_html( ejt_opt( 'ejt_hero_sub' ) ); ?></p>
		<?php if ( $latest ) : ?>
			<div class="hero-latest">
				<?php foreach ( $latest as $p ) : ?>
					<a href="<?php echo esc_url( get_permalink( $p ) ); ?>">
						<span class="badge">New</span>
						<span><?php echo esc_html( get_the_title( $p ) ); ?></span>
					</a>
				<?php endforeach; ?>
			</div>
		<?php endif; ?>
	</div>
</section>

<!-- Top 6 highlights -->
<?php
$ejt_top_types = array( 'post' );
foreach ( array( 'ej_job', 'ej_result', 'ej_admit_card', 'ej_answer_key', 'ej_syllabus', 'ej_schedule' ) as $ejt_t ) {
	if ( post_type_exists( $ejt_t ) ) {
		$ejt_top_types[] = $ejt_t;
	}
}
$ejt_top = get_posts( array( 'numberposts' => 6, 'post_status' => 'publish', 'post_type' => $ejt_top_types ) );
if ( $ejt_top ) :
?>
<section class="section top-section">
	<div class="wrap">
		<div class="section-head"><h2>🔥 Top Updates</h2></div>
		<div class="top-grid">
			<?php foreach ( $ejt_top as $ejt_p ) :
				$ejt_img = get_the_post_thumbnail_url( $ejt_p, 'ejt_card' );
				?>
				<a class="top-card" href="<?php echo esc_url( get_permalink( $ejt_p ) ); ?>"<?php echo $ejt_img ? ' style="--img:url(\'' . esc_url( $ejt_img ) . '\')"' : ''; ?>>
					<span class="tc-badge">Latest</span>
					<h3><?php echo esc_html( get_the_title( $ejt_p ) ); ?></h3>
					<span class="tc-date"><?php echo esc_html( get_the_date( 'j M Y', $ejt_p ) ); ?></span>
				</a>
			<?php endforeach; ?>
		</div>
	</div>
</section>
<?php endif; ?>

<!-- Jobs By Qualification -->
<section class="section">
	<div class="wrap">
		<div class="section-head"><h2>Jobs By Qualification</h2></div>
		<div class="qual-grid">
			<?php foreach ( ejt_qualifications() as $q ) : ?>
				<a class="qual-card" href="<?php echo esc_url( ejt_term_link_or_search( $q ) ); ?>">
					<span class="ico"><?php echo esc_html( strtoupper( substr( $q, 0, 2 ) ) ); ?></span>
					<span class="label"><?php echo esc_html( $q ); ?></span>
				</a>
			<?php endforeach; ?>
		</div>
	</div>
</section>

<!-- Jobs By State -->
<section class="section">
	<div class="wrap">
		<div class="section-head"><h2>Jobs By State</h2></div>
		<div class="qual-grid">
			<?php foreach ( ejt_states() as $s ) :
				$code = ejt_state_code( $s );
				$hue  = ejt_state_hue( $s );
				$icon = function_exists( 'ejt_state_icon' ) ? ejt_state_icon( $s ) : 0;
				?>
				<a class="qual-card state-card" href="<?php echo esc_url( ejt_state_link( $s ) ); ?>">
					<?php if ( $icon ) : ?>
						<span class="state-photo"><?php echo wp_get_attachment_image( $icon, 'medium', false, array( 'alt' => esc_attr( $s ), 'loading' => 'lazy' ) ); ?></span>
					<?php else : ?>
						<span class="ico state-ico" style="background:hsl(<?php echo (int) $hue; ?>,72%,93%);color:hsl(<?php echo (int) $hue; ?>,62%,38%);box-shadow:0 0 0 3px hsl(<?php echo (int) $hue; ?>,72%,96%)"><?php echo esc_html( $code ); ?></span>
					<?php endif; ?>
					<span class="label"><?php echo esc_html( $s ); ?></span>
				</a>
			<?php endforeach; ?>
		</div>
	</div>
</section>

<!-- Category columns -->
<section class="section" style="padding-top:6px">
	<div class="wrap">
		<div class="cat-grid">
			<?php
			foreach ( $sections as $slug => $label ) :
				$link  = ejt_section_archive( $slug );
				$posts = ejt_section_posts( $slug, 8 );
				?>
				<div class="cat-card">
					<div class="cat-card-head">
						<span><?php echo esc_html( $label ); ?></span>
						<a href="<?php echo esc_url( $link ); ?>">View All →</a>
					</div>
					<ul class="post-list">
						<?php if ( $posts ) : ?>
							<?php foreach ( $posts as $p ) : ?>
								<li>
									<a href="<?php echo esc_url( get_permalink( $p ) ); ?>">
										<?php echo esc_html( get_the_title( $p ) ); ?>
										<span class="date"><?php echo esc_html( get_the_date( 'j M Y', $p ) ); ?></span>
									</a>
								</li>
							<?php endforeach; ?>
						<?php else : ?>
							<li><a href="<?php echo esc_url( $link ); ?>">No <?php echo esc_html( $label ); ?> posts yet.</a></li>
						<?php endif; ?>
					</ul>
					<div class="cat-card-foot"><a class="btn btn--amber" href="<?php echo esc_url( $link ); ?>">See all <?php echo esc_html( $label ); ?></a></div>
				</div>
			<?php endforeach; ?>
		</div>
	</div>
</section>

<!-- Employment Blogs (highlighted) -->
<?php
$blogs = get_posts( array(
	'numberposts'  => 6,
	'post_status'  => 'publish',
	'category_name' => 'employment-blogs',
) );
if ( $blogs ) :
?>
<section class="section blogs-section">
	<div class="wrap">
		<div class="section-head">
			<h2><span class="blogs-highlight">Employment Blogs</span></h2>
			<a class="btn btn--amber" href="<?php echo esc_url( home_url( '/category/employment-blogs/' ) ); ?>">View All Blogs</a>
		</div>
		<div class="card-grid">
			<?php foreach ( $blogs as $b ) : ?>
				<a class="post-card" href="<?php echo esc_url( get_permalink( $b ) ); ?>" style="color:inherit;text-decoration:none">
					<div class="thumb"><?php echo get_the_post_thumbnail( $b, 'ejt_card', array( 'loading' => 'lazy' ) ); ?></div>
					<div class="body">
						<span class="cat-tag">Blog</span>
						<h3><?php echo esc_html( get_the_title( $b ) ); ?></h3>
						<span class="meta"><?php echo esc_html( get_the_date( 'j M Y', $b ) ); ?></span>
					</div>
				</a>
			<?php endforeach; ?>
		</div>
	</div>
</section>
<?php endif; ?>

<!-- Social strip -->
<section class="section">
	<div class="wrap">
		<div class="social-strip">
			<h2>Follow Us On Social Media</h2>
			<p class="subtitle">Get the latest government-job updates at your fingertips.</p>
			<div class="social-links">
				<?php
				$s = array(
					'ejt_facebook'  => array( 'Facebook', 'fb' ),
					'ejt_telegram'  => array( 'Telegram', 'tg' ),
					'ejt_whatsapp'  => array( 'WhatsApp', 'wa' ),
					'ejt_youtube'   => array( 'YouTube', 'yt' ),
					'ejt_instagram' => array( 'Instagram', 'ig' ),
				);
				foreach ( $s as $id => $meta ) {
					if ( ejt_opt( $id ) ) {
						echo '<a class="' . esc_attr( $meta[1] ) . '" href="' . esc_url( ejt_opt( $id ) ) . '" rel="noopener">' . esc_html( $meta[0] ) . '</a>';
					}
				}
				?>
			</div>
		</div>
	</div>
</section>

<?php get_footer(); ?>
