<?php
/**
 * Plugin Name: TradeNest Claude Bridge
 * Description: Keeps on-site trust claims accurate (FSSAI + IEC only), cleans robots.txt, and exposes
 *              product display fields (name/SKU, tagline) to the REST API for admin editing.
 *              Delete this file to revert every change it makes.
 * Version: 1.1.0
 *
 * @package Tradenest
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Certifications the business actually holds. Shown wherever the theme lists certifications.
 */
function tn_bridge_real_certifications() {
	return array( 'FSSAI Licensed', 'IEC Registered', 'Export Documentation Support' );
}

/**
 * Words that indicate a certification/claim the business does not hold.
 */
function tn_bridge_is_unverified_claim( $text ) {
	return (bool) preg_match( '/\b(ISO|HACCP|GMP|APEDA|Spices\s*Board|BRC|BRCGS|IFS|Halal|Kosher|USDA|NPOP|Organic|FDA|Kosher|SGS)\b/i', (string) $text );
}

// 1) Theme default certification list (used when a product has none).
add_filter(
	'tradenest_default_certifications',
	function () {
		return tn_bridge_real_certifications();
	},
	99
);

// 2) Per-product certification values stored in ACF (tn_certifications): drop unverified claims.
add_filter(
	'acf/format_value/name=tn_certifications',
	function ( $value ) {
		if ( ! is_array( $value ) ) {
			return $value;
		}
		$kept = array();
		foreach ( $value as $row ) {
			$label = is_array( $row ) ? ( isset( $row['item'] ) ? $row['item'] : reset( $row ) ) : $row;
			if ( '' !== trim( (string) $label ) && ! tn_bridge_is_unverified_claim( $label ) ) {
				$kept[] = $row;
			}
		}
		$labels = array();
		foreach ( $kept as $row ) {
			$labels[] = strtolower( (string) ( is_array( $row ) ? ( isset( $row['item'] ) ? $row['item'] : reset( $row ) ) : $row ) );
		}
		foreach ( tn_bridge_real_certifications() as $cert ) {
			if ( ! in_array( strtolower( $cert ), $labels, true ) ) {
				$kept[] = array( 'item' => $cert );
			}
		}
		return $kept;
	},
	99
);

// 3) Site-wide trust strings that were placeholders.
add_filter(
	'tradenest_ships_to',
	function () {
		return __( 'worldwide from India', 'tradenest' );
	},
	99
);
add_filter(
	'tradenest_export_manager',
	function ( $mgr ) {
		$mgr['reply'] = __( 'Quick replies on WhatsApp & email', 'tradenest' );
		return $mgr;
	},
	99
);

// 4) Default product FAQ: keep the theme's answers but use the real MOQ (5 Kg).
add_filter(
	'tradenest_default_faq',
	function ( $faq ) {
		foreach ( $faq as &$item ) {
			if ( isset( $item['answer'] ) ) {
				$item['answer'] = str_replace( '100 kg (samples from 5 kg)', '5 Kg', $item['answer'] );
			}
		}
		return $faq;
	},
	99
);

// 5) robots.txt: remove the non-standard "LLM-Index:" directive (flagged invalid by Google/Lighthouse).
add_filter(
	'robots_txt',
	function ( $output ) {
		return preg_replace( '/^LLM-Index:.*\R?/mi', '', (string) $output );
	},
	999
);

// 6) Expose product display fields to the REST API (admins only can write).
add_action(
	'init',
	function () {
		// REST only exposes registered meta when the post type supports custom fields.
		add_post_type_support( 'product', 'custom-fields' );
		$fields = array( 'tn_sku', 'tn_tagline', 'tn_extended_description', 'tn_purity' );
		foreach ( $fields as $key ) {
			register_post_meta(
				'product',
				$key,
				array(
					'type'          => 'string',
					'single'        => true,
					'show_in_rest'  => true,
					'auth_callback' => function () {
						return current_user_can( 'edit_posts' );
					},
				)
			);
		}
	},
	20
);

// 7) Brand logo (media ID 751 = TradeNest Naturals logo) in the header via the theme's custom-logo support.
define( 'TN_BRIDGE_LOGO_ID', 751 );
add_filter(
	'theme_mod_custom_logo',
	function ( $value ) {
		return $value ? $value : TN_BRIDGE_LOGO_ID;
	}
);

// 8) Logo sizing (header) + footer logo on a cream badge (footer is dark green).
add_action(
	'wp_head',
	function () {
		echo '<style id="tn-bridge-logo">.custom-logo-link{display:inline-flex;align-items:center}.custom-logo{height:56px;width:auto;max-width:200px;display:block}@media(max-width:640px){.custom-logo{height:46px}}'
			. 'footer .tn-footer-logo{height:64px;width:auto;background:#FBF6EC;border-radius:12px;padding:6px 12px;display:block}</style>' . "\n";
	},
	99
);
add_action(
	'wp_footer',
	function () {
		$src = wp_get_attachment_image_url( TN_BRIDGE_LOGO_ID, 'full' );
		if ( ! $src ) {
			return;
		}
		?>
<script id="tn-bridge-footer-logo">
(function(){var f=document.querySelector('footer[role="contentinfo"] .lg\\:col-span-4 > .flex.items-center');
if(!f){return;}var i=document.createElement('img');i.src=<?php echo wp_json_encode( esc_url( $src ) ); ?>;i.alt='TradeNest Naturals';i.className='tn-footer-logo';i.loading='lazy';
f.innerHTML='';f.appendChild(i);}());
</script>
		<?php
	},
	99
);
