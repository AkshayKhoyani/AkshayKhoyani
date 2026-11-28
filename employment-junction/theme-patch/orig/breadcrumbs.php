<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }

/**
 * Visible breadcrumb trail (matches the JSON-LD BreadcrumbList).
 */
function ejt_breadcrumbs() {
	if ( is_front_page() ) {
		return;
	}
	$sep  = '<span class="sep">›</span>';
	$html = '<a href="' . esc_url( home_url( '/' ) ) . '">Home</a>';

	if ( is_singular( 'post' ) ) {
		$cats = get_the_category();
		if ( ! empty( $cats ) ) {
			$html .= $sep . '<a href="' . esc_url( get_category_link( $cats[0]->term_id ) ) . '">' . esc_html( $cats[0]->name ) . '</a>';
		}
		$html .= $sep . '<span>' . esc_html( wp_trim_words( get_the_title(), 8, '…' ) ) . '</span>';
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
