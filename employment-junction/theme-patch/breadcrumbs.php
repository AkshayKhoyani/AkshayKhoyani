<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }

/**
 * Visible breadcrumb trail (matches the JSON-LD BreadcrumbList).
 * Custom post types (jobs, results, admit cards…) link to their own section — never a generic "Archives".
 */
function ejt_breadcrumbs() {
	if ( is_front_page() ) {
		return;
	}
	$sep  = '<span class="sep">›</span>';
	$html = '<a href="' . esc_url( home_url( '/' ) ) . '">Home</a>';
	$labels = array(
		'ej_job' => 'Latest Jobs', 'ej_result' => 'Result', 'ej_admit_card' => 'Admit Card', 'ej_answer_key' => 'Answer Key',
		'ej_syllabus' => 'Syllabus', 'ej_schedule' => 'Exam Dates', 'ej_test' => 'Free Mock Test',
	);

	if ( is_singular( 'post' ) ) {
		$cats = get_the_category();
		if ( ! empty( $cats ) ) {
			$html .= $sep . '<a href="' . esc_url( get_category_link( $cats[0]->term_id ) ) . '">' . esc_html( $cats[0]->name ) . '</a>';
		}
		$html .= $sep . '<span>' . esc_html( wp_trim_words( get_the_title(), 8, '…' ) ) . '</span>';
	} elseif ( is_singular() && ! is_page() ) {
		$pt   = get_post_type();
		$obj  = get_post_type_object( $pt );
		$name = isset( $labels[ $pt ] ) ? $labels[ $pt ] : ( $obj ? $obj->labels->name : '' );
		$link = 'ej_test' === $pt ? home_url( '/free-mock-test/' ) : get_post_type_archive_link( $pt );
		if ( $name ) {
			$html .= $sep . ( $link ? '<a href="' . esc_url( $link ) . '">' . esc_html( $name ) . '</a>' : '<span>' . esc_html( $name ) . '</span>' );
		}
		$html .= $sep . '<span>' . esc_html( wp_trim_words( get_the_title(), 8, '…' ) ) . '</span>';
	} elseif ( is_post_type_archive() ) {
		$pt = get_query_var( 'post_type' );
		$pt = is_array( $pt ) ? reset( $pt ) : $pt;
		$html .= $sep . '<span>' . esc_html( isset( $labels[ $pt ] ) ? $labels[ $pt ] : post_type_archive_title( '', false ) ) . '</span>';
	} elseif ( is_category() || is_tag() || is_tax() ) {
		$html .= $sep . '<span>' . esc_html( single_term_title( '', false ) ) . '</span>';
	} elseif ( is_page() ) {
		$html .= $sep . '<span>' . esc_html( get_the_title() ) . '</span>';
	} elseif ( is_search() ) {
		$html .= $sep . '<span>Search: ' . esc_html( get_search_query() ) . '</span>';
	} elseif ( is_404() ) {
		$html .= $sep . '<span>Not found</span>';
	} else {
		$html .= $sep . '<span>' . esc_html( wp_strip_all_tags( get_the_archive_title() ) ) . '</span>';
	}

	echo '<nav class="breadcrumbs" aria-label="Breadcrumb">' . $html . '</nav>';
}
