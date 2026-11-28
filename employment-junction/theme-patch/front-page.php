<?php
/**
 * Employment Junction — homepage v2 (fast, newest-first, animated, mobile-first).
 * Everything is pulled live from all sections, so the newest update is always on top.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header();

$ejh_types = array(
	'ej_job'        => array( 'Latest Jobs', '💼', '#2563eb' ),
	'ej_result'     => array( 'Result', '🏆', '#16a34a' ),
	'ej_admit_card' => array( 'Admit Card', '🎫', '#ea580c' ),
	'ej_answer_key' => array( 'Answer Key', '🔑', '#9333ea' ),
	'ej_syllabus'   => array( 'Syllabus', '📚', '#0891b2' ),
	'ej_schedule'   => array( 'Exam Dates', '📅', '#db2777' ),
	'ej_test'       => array( 'Mock Test', '🎯', '#dc2626' ),
);
foreach ( array_keys( $ejh_types ) as $t ) {
	if ( ! post_type_exists( $t ) ) {
		unset( $ejh_types[ $t ] );
	}
}
$ejh_feed_types = array_merge( array( 'post' ), array_diff( array_keys( $ejh_types ), array( 'ej_test' ) ) );
$ejh_today      = current_time( 'Y-m-d' );
$ejh_now        = current_time( 'timestamp' );

$ejh_latest = get_posts( array( 'numberposts' => 12, 'post_status' => 'publish', 'post_type' => $ejh_feed_types, 'orderby' => 'date', 'order' => 'DESC' ) );

$ejh_open = get_posts( array(
	'numberposts' => 8,
	'post_status' => 'publish',
	'post_type'   => 'ej_job',
	'meta_key'    => 'ej_last_date',
	'orderby'     => 'meta_value',
	'order'       => 'ASC',
	'meta_query'  => array( array( 'key' => 'ej_last_date', 'value' => $ejh_today, 'compare' => '>=', 'type' => 'DATE' ) ),
) );

$ejh_active_jobs = 0;
$ejh_vac         = 0;
foreach ( get_posts( array( 'numberposts' => 200, 'post_status' => 'publish', 'post_type' => 'ej_job', 'fields' => 'ids', 'meta_query' => array( array( 'key' => 'ej_last_date', 'value' => $ejh_today, 'compare' => '>=', 'type' => 'DATE' ) ) ) ) as $jid ) {
	$ejh_active_jobs++;
	$ejh_vac += (int) get_post_meta( $jid, 'ej_vacancies', true );
}

if ( ! function_exists( 'ejh_label' ) ) {
function ejh_label( $p, $types ) {
	if ( isset( $types[ $p->post_type ] ) ) {
		return $types[ $p->post_type ];
	}
	$c = get_the_category( $p->ID );
	return array( $c ? $c[0]->name : 'Update', '📰', '#475569' );
}
function ejh_ago( $p, $now ) {
	$d = $now - get_post_time( 'U', false, $p );
	if ( $d < HOUR_IN_SECONDS ) { return 'Abhi abhi'; }
	if ( $d < DAY_IN_SECONDS ) { return floor( $d / HOUR_IN_SECONDS ) . ' ghante pehle'; }
	if ( $d < 7 * DAY_IN_SECONDS ) { return floor( $d / DAY_IN_SECONDS ) . ' din pehle'; }
	return get_the_date( 'j M Y', $p );
}
function ejh_days_left( $id, $today ) {
	$l = get_post_meta( $id, 'ej_last_date', true );
	if ( ! $l ) { return null; }
	return (int) round( ( strtotime( $l ) - strtotime( $today ) ) / DAY_IN_SECONDS );
}
}
$ejh_last_update = $ejh_latest ? ejh_ago( $ejh_latest[0], $ejh_now ) : '';
?>
<style>
.ejh{--n:#071a3d;--n2:#0b3d91;--y:#ffd60a;--o:#ff7a00;--r:#ef233c;font-family:Inter,system-ui,sans-serif;overflow-x:clip}.ejh *{box-sizing:border-box}.ejh a{text-decoration:none}.ejh .w{max-width:1200px;margin:0 auto;padding:0 16px}
.ejh-hero{position:relative;background:radial-gradient(700px 400px at 85% 10%,rgba(255,214,10,.22),transparent 60%),radial-gradient(600px 500px at 0% 100%,rgba(239,35,60,.25),transparent 60%),linear-gradient(135deg,#0b3d91,#071a3d 70%);color:#fff;padding:30px 0 26px;overflow:hidden}
.ejh-hero:before{content:"";position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,.09) 1.5px,transparent 1.6px);background-size:22px 22px;pointer-events:none}
.ejh-orb{position:absolute;border-radius:50%;filter:blur(2px);opacity:.5;animation:ejhfloat 9s ease-in-out infinite;pointer-events:none}.ejh-orb.a{width:140px;height:140px;right:6%;top:18%;background:radial-gradient(circle at 30% 30%,#ffd60a,#ff7a00)}.ejh-orb.b{width:70px;height:70px;left:58%;bottom:8%;background:radial-gradient(circle at 30% 30%,#7dd3fc,#2563eb);animation-delay:-4s}
@keyframes ejhfloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-18px)}}
.ejh-hero .w{position:relative}.ejh-live{display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);border-radius:999px;padding:6px 14px;font-size:13px;font-weight:700}.ejh-live i{width:9px;height:9px;border-radius:50%;background:#22c55e;box-shadow:0 0 0 0 rgba(34,197,94,.7);animation:ejhping 1.6s infinite}
@keyframes ejhping{70%{box-shadow:0 0 0 10px rgba(34,197,94,0)}100%{box-shadow:0 0 0 0 rgba(34,197,94,0)}}
.ejh h1{color:#fff;font-size:clamp(26px,5.4vw,46px);line-height:1.12;font-weight:900;margin:14px 0 8px;letter-spacing:-.5px}.ejh h1 span{background:linear-gradient(90deg,#ffd60a,#ff9f1c);-webkit-background-clip:text;background-clip:text;color:transparent}
.ejh-sub{color:#c7d6f2;margin:0 0 16px;font-size:15.5px;max-width:640px}
.ejh-search{display:flex;background:#fff;border-radius:14px;padding:5px;max-width:620px;box-shadow:0 12px 30px rgba(0,0,0,.3)}.ejh-search input{flex:1;min-width:0;border:0;outline:0;font-size:16px;padding:10px 12px;color:#0f172a;background:transparent}.ejh-search button{border:0;border-radius:10px;background:linear-gradient(90deg,var(--y),var(--o));color:#071a3d;font-weight:900;padding:0 18px;cursor:pointer;font-size:15px}
.ejh-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:16px;max-width:520px}.ejh-stats div{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.16);border-radius:12px;padding:8px 10px}.ejh-stats b{display:block;font-size:20px;color:var(--y);line-height:1.1}.ejh-stats span{font-size:12px;color:#c7d6f2}
.ejh-quick{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:18px}.ejh-quick a{display:flex;flex-direction:column;align-items:center;gap:4px;background:#fff;border-radius:14px;padding:10px 4px;color:#0f172a;font-weight:800;font-size:12.5px;text-align:center;box-shadow:0 8px 20px rgba(0,0,0,.2);transition:transform .2s}.ejh-quick a:hover{transform:translateY(-3px)}.ejh-quick a em{font-style:normal;font-size:22px;width:42px;height:42px;display:grid;place-items:center;border-radius:12px;background:var(--c)}
.ejh-quick a.mock{background:linear-gradient(135deg,#ef233c,#7c3aed);color:#fff}.ejh-quick a.mock em{background:rgba(255,255,255,.2)}
@media(min-width:760px){.ejh-quick{grid-template-columns:repeat(8,1fr)}}
.ejh-tick{background:#0a0a0a;color:#fff;display:flex;align-items:center;overflow:hidden;white-space:nowrap;font-size:14px}.ejh-tick b{background:var(--r);padding:10px 14px;flex:0 0 auto;font-weight:900;z-index:1}.ejh-tick div{overflow:hidden;flex:1}.ejh-tick p{display:inline-block;margin:0;padding-left:100%;animation:ejhmq 55s linear infinite}.ejh-tick p:hover{animation-play-state:paused}.ejh-tick a{color:#fff;margin-right:34px}.ejh-tick a:before{content:"🔥 "}
@keyframes ejhmq{to{transform:translateX(-100%)}}
.ejh-sec{padding:26px 0 6px}.ejh-h{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:0 0 14px}.ejh-h h2{margin:0;font-size:clamp(20px,3.4vw,26px);font-weight:900;color:#0f172a;display:flex;align-items:center;gap:8px}.ejh-h h2:after{content:"";display:block;width:42px;height:4px;border-radius:4px;background:linear-gradient(90deg,var(--y),var(--o))}.ejh-h a{font-weight:800;font-size:14px;color:#2563eb;white-space:nowrap}
.ejh-grid{display:grid;gap:14px;grid-template-columns:repeat(auto-fill,minmax(270px,1fr))}
.ejh-card{position:relative;display:flex;flex-direction:column;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e6ebf4;box-shadow:0 6px 18px rgba(15,23,42,.07);color:#0f172a;transition:transform .25s,box-shadow .25s;animation:ejhup .6s both}.ejh-card:hover{transform:translateY(-4px);box-shadow:0 14px 30px rgba(15,23,42,.14)}
.ejh-card .im{aspect-ratio:16/9;background:#e2e8f0;overflow:hidden}.ejh-card .im img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s}.ejh-card:hover .im img{transform:scale(1.05)}
.ejh-card .bd{padding:12px 14px 14px;display:flex;flex-direction:column;gap:8px;flex:1}.ejh-card h3{margin:0;font-size:15.5px;line-height:1.35;font-weight:800;color:#0f172a;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.ejh-tag{position:absolute;left:10px;top:10px;color:#fff;font-size:11.5px;font-weight:900;letter-spacing:.4px;padding:5px 10px;border-radius:999px;text-transform:uppercase;box-shadow:0 4px 12px rgba(0,0,0,.25)}
.ejh-new{position:absolute;right:10px;top:10px;background:var(--y);color:#0a0a0a;font-size:11px;font-weight:900;padding:4px 9px;border-radius:999px;animation:ejhpulse 1.6s infinite}
@keyframes ejhpulse{0%,100%{box-shadow:0 0 0 0 rgba(255,214,10,.8)}60%{box-shadow:0 0 0 9px rgba(255,214,10,0)}}
.ejh-meta{display:flex;flex-wrap:wrap;gap:6px;margin-top:auto;font-size:12.5px;font-weight:700;color:#64748b}.ejh-meta span{background:#f1f5f9;border-radius:8px;padding:3px 8px}.ejh-meta .hot{background:#fee2e2;color:#b91c1c}
@keyframes ejhup{from{opacity:.001;transform:translateY(18px)}to{opacity:1;transform:none}}
.ejh-grid .ejh-card:nth-child(2){animation-delay:.06s}.ejh-grid .ejh-card:nth-child(3){animation-delay:.12s}.ejh-grid .ejh-card:nth-child(4){animation-delay:.18s}.ejh-grid .ejh-card:nth-child(5){animation-delay:.24s}.ejh-grid .ejh-card:nth-child(6){animation-delay:.3s}
.ejh-mock{position:relative;display:grid;gap:14px;align-items:center;grid-template-columns:1fr;border-radius:22px;padding:22px;color:#fff;overflow:hidden;background:linear-gradient(120deg,#ef233c,#7c3aed,#2563eb,#ef233c);background-size:300% 300%;animation:ejhgrad 10s ease infinite}
@keyframes ejhgrad{0%,100%{background-position:0 50%}50%{background-position:100% 50%}}
.ejh-mock h2{color:#fff;margin:6px 0;font-size:clamp(21px,4vw,30px);font-weight:900}.ejh-mock p{margin:0;color:#f1e9ff}.ejh-mock .pill{display:inline-block;background:var(--y);color:#0a0a0a;font-weight:900;font-size:12px;padding:5px 12px;border-radius:999px}
.ejh-mock .go{display:inline-flex;gap:8px;align-items:center;background:#fff;color:#0f172a;font-weight:900;padding:12px 22px;border-radius:12px;box-shadow:0 10px 24px rgba(0,0,0,.25);animation:ejhbob 2.4s ease-in-out infinite;justify-self:start}
@keyframes ejhbob{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
.ejh-mock .ts{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}.ejh-mock .ts a{background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.3);color:#fff;border-radius:999px;padding:6px 12px;font-size:13px;font-weight:700}
@media(min-width:760px){.ejh-mock{grid-template-columns:1fr auto;padding:30px}}
.ejh-dl{display:grid;gap:10px}.ejh-dl a{display:flex;align-items:center;gap:12px;background:#fff;border:1px solid #e6ebf4;border-radius:14px;padding:10px 12px;color:#0f172a;box-shadow:0 4px 12px rgba(15,23,42,.05);transition:transform .2s}.ejh-dl a:hover{transform:translateX(4px)}
.ejh-dl .d{flex:0 0 58px;height:58px;border-radius:12px;display:grid;place-items:center;text-align:center;background:linear-gradient(160deg,#fff7ed,#ffedd5);color:#c2410c;font-weight:900;line-height:1}.ejh-dl .d b{display:block;font-size:22px}.ejh-dl .d small{font-size:10px;letter-spacing:.5px}.ejh-dl .d.u{background:linear-gradient(160deg,#fee2e2,#fecaca);color:#b91c1c;animation:ejhpulse 1.8s infinite}
.ejh-dl .t{flex:1;min-width:0}.ejh-dl .t strong{display:block;font-size:14.5px;line-height:1.35;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}.ejh-dl .t span{font-size:12.5px;color:#64748b;font-weight:700}
@media(min-width:900px){.ejh-dl{grid-template-columns:1fr 1fr}}
.ejh-tabs{background:#fff;border:1px solid #e6ebf4;border-radius:18px;box-shadow:0 6px 18px rgba(15,23,42,.06);overflow:hidden}.ejh-tabs>input{position:absolute;opacity:0;pointer-events:none}
.ejh-tl{display:flex;gap:6px;overflow-x:auto;padding:10px;background:#f4f6fb;border-bottom:1px solid #e6ebf4;scrollbar-width:none}.ejh-tl::-webkit-scrollbar{display:none}.ejh-tl label{flex:0 0 auto;cursor:pointer;border-radius:999px;padding:8px 14px;font-weight:800;font-size:13.5px;color:#334155;background:#fff;border:1px solid #dbe2ee;transition:all .2s}
.ejh-pn{display:none;padding:6px 14px 12px}.ejh-pn ul{list-style:none;margin:0;padding:0}.ejh-pn li{border-bottom:1px dashed #e2e8f0}.ejh-pn li:last-child{border:0}.ejh-pn li a{display:flex;gap:10px;align-items:flex-start;padding:11px 2px;color:#0f172a;font-weight:700;font-size:14.5px;line-height:1.4}.ejh-pn li a:before{content:"➤";color:var(--o);font-size:12px;margin-top:3px}.ejh-pn li a:hover{color:#2563eb}.ejh-pn li small{display:block;color:#94a3b8;font-weight:600;font-size:12px}.ejh-pn .all{display:inline-block;margin:8px 0 4px;font-weight:900;color:#2563eb}
<?php $i = 0; foreach ( $ejh_types as $t => $m ) { $i++; echo '#ejt' . $i . ':checked~.ejh-tl label[for=ejt' . $i . ']{background:' . $m[2] . ';border-color:' . $m[2] . ';color:#fff}#ejt' . $i . ':checked~.ejh-p' . $i . '{display:block;animation:ejhup .35s}'; } ?>
.ejh-chips{display:flex;flex-wrap:wrap;gap:8px}.ejh-chips a{background:#fff;border:1px solid #dbe2ee;border-radius:999px;padding:8px 14px;font-weight:800;font-size:13.5px;color:#0f172a;transition:all .2s}.ejh-chips a:hover{background:#0b3d91;color:#fff;border-color:#0b3d91}.ejh-chips.q a{background:linear-gradient(160deg,#fff,#f1f5ff)}
.ejh-two{display:grid;gap:14px}@media(min-width:900px){.ejh-two{grid-template-columns:1fr 1fr}}
.ejh-box{border-radius:18px;padding:20px;color:#fff;display:flex;flex-direction:column;gap:8px}.ejh-box h3{color:#fff;margin:0;font-size:20px;font-weight:900}.ejh-box p{margin:0;opacity:.92}.ejh-box a.b{align-self:flex-start;background:#fff;color:#0f172a;font-weight:900;border-radius:12px;padding:10px 18px;margin-top:6px}
.ejh-box.news{background:linear-gradient(135deg,#0f766e,#064e3b)}.ejh-box.ig{background:linear-gradient(135deg,#f58529,#dd2a7b 50%,#8134af)}
.ejh-lazy{content-visibility:auto;contain-intrinsic-size:1px 700px}
@media(max-width:600px){.ejh-grid{grid-template-columns:1fr}.ejh-card{flex-direction:row;align-items:stretch}.ejh-card .im{flex:0 0 38%;aspect-ratio:auto;min-height:108px}.ejh-card .bd{padding:10px 12px}.ejh-card h3{font-size:14px}.ejh-tag{font-size:9.5px;padding:3px 7px;left:6px;top:6px}.ejh-new{right:auto;left:6px;top:auto;bottom:6px;font-size:9.5px}.ejh-meta{font-size:11.5px}.ejh-hero{padding:22px 0 20px}.ejh-orb.a{width:110px;height:110px;top:auto;bottom:34%;right:-40px;opacity:.35}}
@media(prefers-reduced-motion:reduce){.ejh *{animation:none!important;transition:none!important}}
</style>

<div class="ejh">
	<section class="ejh-hero">
		<span class="ejh-orb a"></span><span class="ejh-orb b"></span>
		<div class="w">
			<span class="ejh-live"><i></i> LIVE · Last update: <?php echo esc_html( $ejh_last_update ); ?></span>
			<h1>Sarkari Naukri ki <span>har khabar</span>, sabse pehle.</h1>
			<p class="ejh-sub">Latest Govt Jobs, Result, Admit Card, Answer Key, Syllabus &amp; Free Mock Test — roz update, official link ke saath.</p>
			<form class="ejh-search" role="search" method="get" action="<?php echo esc_url( home_url( '/' ) ); ?>">
				<input type="search" name="s" placeholder="Job, exam ya board search karein… (e.g. SSC, Police)" aria-label="Search">
				<button type="submit">Search</button>
			</form>
			<div class="ejh-stats">
				<div><b><?php echo (int) $ejh_active_jobs; ?></b><span>Active Jobs</span></div>
				<?php if ( $ejh_vac ) : ?><div><b><?php echo esc_html( number_format_i18n( $ejh_vac ) ); ?>+</b><span>Open Vacancies</span></div><?php endif; ?>
				<div><b>100%</b><span>Free Mock Tests</span></div>
			</div>
			<nav class="ejh-quick" aria-label="Sections">
				<?php foreach ( $ejh_types as $t => $m ) :
					$link = 'ej_test' === $t ? home_url( '/free-mock-test/' ) : get_post_type_archive_link( $t );
					?>
					<a href="<?php echo esc_url( $link ); ?>" class="<?php echo 'ej_test' === $t ? 'mock' : ''; ?>" style="--c:<?php echo esc_attr( $m[2] ); ?>1f"><em><?php echo $m[1]; ?></em><?php echo esc_html( $m[0] ); ?></a>
				<?php endforeach; ?>
				<a href="<?php echo esc_url( home_url( '/employment-news-this-week/' ) ); ?>" style="--c:#0f766e1f"><em>📰</em>Emp. News</a>
			</nav>
		</div>
	</section>

	<?php if ( $ejh_latest ) : ?>
	<div class="ejh-tick" aria-label="Latest updates"><b>⚡ NEW</b><div><p>
		<?php foreach ( array_slice( $ejh_latest, 0, 10 ) as $p ) : ?><a href="<?php echo esc_url( get_permalink( $p ) ); ?>"><?php echo esc_html( get_the_title( $p ) ); ?></a><?php endforeach; ?>
	</p></div></div>
	<?php endif; ?>

	<section class="ejh-sec">
		<div class="w">
			<div class="ejh-h"><h2>⚡ Abhi Aaye Updates</h2><a href="<?php echo esc_url( get_post_type_archive_link( 'ej_job' ) ); ?>">Sab dekhein →</a></div>
			<div class="ejh-grid">
				<?php foreach ( array_slice( $ejh_latest, 0, 8 ) as $n => $p ) :
					$m    = ejh_label( $p, $ejh_types );
					$left = 'ej_job' === $p->post_type ? ejh_days_left( $p->ID, $ejh_today ) : null;
					$new  = ( $ejh_now - get_post_time( 'U', false, $p ) ) < 3 * DAY_IN_SECONDS;
					?>
					<a class="ejh-card" href="<?php echo esc_url( get_permalink( $p ) ); ?>">
						<div class="im"><?php echo get_the_post_thumbnail( $p, 'ejt_card', array( 'loading' => $n < 2 ? 'eager' : 'lazy', 'fetchpriority' => 0 === $n ? 'high' : 'auto', 'decoding' => 'async', 'sizes' => '(max-width:600px) 40vw, 380px' ) ); ?></div>
						<span class="ejh-tag" style="background:<?php echo esc_attr( $m[2] ); ?>"><?php echo $m[1] . ' ' . esc_html( $m[0] ); ?></span>
						<?php if ( $new ) : ?><span class="ejh-new">NEW</span><?php endif; ?>
						<div class="bd">
							<h3><?php echo esc_html( get_the_title( $p ) ); ?></h3>
							<div class="ejh-meta"><span>🕒 <?php echo esc_html( ejh_ago( $p, $ejh_now ) ); ?></span>
								<?php if ( null !== $left && $left >= 0 ) : ?><span class="<?php echo $left <= 7 ? 'hot' : ''; ?>">⏰ <?php echo 0 === $left ? 'Aaj last date' : esc_html( $left . ' din baaki' ); ?></span><?php endif; ?>
							</div>
						</div>
					</a>
				<?php endforeach; ?>
			</div>
		</div>
	</section>

	<section class="ejh-sec">
		<div class="w">
			<div class="ejh-mock">
				<div>
					<span class="pill">🎯 100% FREE · NO LOGIN</span>
					<h2>Free Mock Test 2026 — Abhi Practice Karo!</h2>
					<p>SSC, Railway, Police, Bank, Teaching, PSC — real exam pattern, timer, instant score aur full solutions.</p>
					<div class="ts">
						<?php foreach ( get_posts( array( 'numberposts' => 4, 'post_status' => 'publish', 'post_type' => 'ej_test' ) ) as $p ) : ?>
							<a href="<?php echo esc_url( get_permalink( $p ) ); ?>"><?php echo esc_html( trim( preg_replace( '/\s*[\(–-].*$/u', '', get_the_title( $p ) ) ) ); ?></a>
						<?php endforeach; ?>
					</div>
				</div>
				<a class="go" href="<?php echo esc_url( home_url( '/free-mock-test/' ) ); ?>">Start Free Test →</a>
			</div>
		</div>
	</section>

	<?php if ( $ejh_open ) : ?>
	<section class="ejh-sec">
		<div class="w">
			<div class="ejh-h"><h2>⏰ Last Date Najdeek</h2><a href="<?php echo esc_url( get_post_type_archive_link( 'ej_job' ) ); ?>">All Jobs →</a></div>
			<div class="ejh-dl">
				<?php foreach ( $ejh_open as $p ) :
					$left = ejh_days_left( $p->ID, $ejh_today );
					$vac  = (int) get_post_meta( $p->ID, 'ej_vacancies', true );
					$ld   = get_post_meta( $p->ID, 'ej_last_date', true );
					?>
					<a href="<?php echo esc_url( get_permalink( $p ) ); ?>">
						<span class="d<?php echo $left <= 5 ? ' u' : ''; ?>"><?php if ( 0 === $left ) : ?><b style="font-size:15px">AAJ</b><small>LAST DATE</small><?php else : ?><b><?php echo (int) $left; ?></b><small>DIN BAAKI</small><?php endif; ?></span>
						<span class="t"><strong><?php echo esc_html( get_the_title( $p ) ); ?></strong><span>📅 Last Date: <?php echo esc_html( date_i18n( 'j M Y', strtotime( $ld ) ) ); ?><?php echo $vac ? ' · 👥 ' . esc_html( number_format_i18n( $vac ) ) . ' Posts' : ''; ?></span></span>
					</a>
				<?php endforeach; ?>
			</div>
		</div>
	</section>
	<?php endif; ?>

	<section class="ejh-sec">
		<div class="w">
			<div class="ejh-h"><h2>📂 Section-wise Updates</h2></div>
			<div class="ejh-tabs">
				<?php $i = 0; foreach ( $ejh_types as $t => $m ) { $i++; echo '<input type="radio" name="ejhtab" id="ejt' . $i . '"' . ( 1 === $i ? ' checked' : '' ) . '>'; } ?>
				<div class="ejh-tl" role="tablist">
					<?php $i = 0; foreach ( $ejh_types as $t => $m ) { $i++; echo '<label for="ejt' . $i . '">' . $m[1] . ' ' . esc_html( $m[0] ) . '</label>'; } ?>
				</div>
				<?php $i = 0; foreach ( $ejh_types as $t => $m ) :
					$i++;
					$items = get_posts( array( 'numberposts' => 8, 'post_status' => 'publish', 'post_type' => $t ) );
					$link  = 'ej_test' === $t ? home_url( '/free-mock-test/' ) : get_post_type_archive_link( $t );
					?>
					<div class="ejh-pn ejh-p<?php echo $i; ?>">
						<ul>
							<?php foreach ( $items as $p ) : ?>
								<li><a href="<?php echo esc_url( get_permalink( $p ) ); ?>"><span><?php echo esc_html( get_the_title( $p ) ); ?><small><?php echo esc_html( ejh_ago( $p, $ejh_now ) ); ?></small></span></a></li>
							<?php endforeach; ?>
							<?php if ( ! $items ) : ?><li><a href="<?php echo esc_url( $link ); ?>">Jald hi update aayega…</a></li><?php endif; ?>
						</ul>
						<a class="all" href="<?php echo esc_url( $link ); ?>">Sabhi <?php echo esc_html( $m[0] ); ?> dekhein →</a>
					</div>
				<?php endforeach; ?>
			</div>
		</div>
	</section>

	<section class="ejh-sec">
		<div class="w">
			<div class="ejh-h"><h2>🎓 Qualification-wise Jobs</h2></div>
			<div class="ejh-chips q">
				<?php foreach ( array( '10th-pass-govt-jobs' => '🎒 10th Pass', '12th-pass-govt-jobs' => '📘 12th Pass', 'iti-govt-jobs' => '🔧 ITI', 'diploma-govt-jobs' => '📐 Diploma', 'graduate-govt-jobs' => '🎓 Graduate', 'post-graduate-govt-jobs' => '🏅 Post Graduate', 'central-govt-jobs' => '🇮🇳 Central Govt' ) as $slug => $label ) : ?>
					<a href="<?php echo esc_url( home_url( '/' . $slug . '/' ) ); ?>"><?php echo esc_html( $label ); ?></a>
				<?php endforeach; ?>
			</div>
			<div class="ejh-h" style="margin-top:22px"><h2>🗺️ State-wise Jobs</h2></div>
			<div class="ejh-chips">
				<?php
				$ejh_states = get_posts( array( 'numberposts' => 100, 'post_type' => 'page', 'post_status' => 'publish', 'orderby' => 'title', 'order' => 'ASC' ) );
				foreach ( $ejh_states as $p ) {
					if ( preg_match( '/-govt-jobs-2026$/', $p->post_name ) ) {
						echo '<a href="' . esc_url( get_permalink( $p ) ) . '">📍 ' . esc_html( trim( str_replace( 'Govt Jobs 2026', '', get_the_title( $p ) ) ) ) . '</a>';
					}
				}
				?>
			</div>
		</div>
	</section>

	<section class="ejh-sec" style="padding-bottom:30px">
		<div class="w ejh-two">
			<div class="ejh-box news">
				<h3>📰 Employment News This Week</h3>
				<p>Is hafte ki Rozgar Samachar ki saari naukriyan — ek hi list me, direct link ke saath.</p>
				<a class="b" href="<?php echo esc_url( home_url( '/employment-news-this-week/' ) ); ?>">List dekhein →</a>
			</div>
			<div class="ejh-box ig">
				<h3>📸 Instagram par Follow karein</h3>
				<p>Roz ki naukri updates, last date reminders aur exam tips — seedha aapke feed me.</p>
				<a class="b" href="https://www.instagram.com/employmentjunction.in/" target="_blank" rel="noopener">@employmentjunction.in</a>
			</div>
		</div>
	</section>
</div>

<?php get_footer(); ?>
