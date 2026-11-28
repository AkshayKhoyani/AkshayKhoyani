<?php
/**
 * Plugin Name: TradeNest Claude Bridge
 * Description: Keeps on-site trust claims accurate (FSSAI + IEC only), cleans robots.txt, and exposes
 *              product display fields (name/SKU, tagline) to the REST API for admin editing.
 *              Delete this file to revert every change it makes.
 * Version: 1.6.0
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
	return (bool) preg_match( '/\b(ISO|HACCP|GMP|APEDA|Spices\s*Board|BRC|BRCGS|IFS|Halal|Kosher|USDA|NPOP|Organic|FDA|SGS|Non-?GMO|GMO|Lab\s*Tested|Laboratory|100\s*%|COA)\b/i', (string) $text );
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

// 7) Brand logo (media ID 751 = Tradenest Naturals logo) in the header via the theme's custom-logo support.
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
if(!f){return;}var i=document.createElement('img');i.src=<?php echo wp_json_encode( esc_url( $src ) ); ?>;i.alt='Tradenest Naturals';i.className='tn-footer-logo';i.loading='lazy';
f.innerHTML='';f.appendChild(i);}());
</script>
		<?php
	},
	99
);

// 9) Business address (Contact page, inquiry areas, footer). Edit TN_BRIDGE_ADDRESS to change it everywhere.
define( 'TN_BRIDGE_ADDRESS', 'Ashirwad Embro Park-1, Plot No. 1, 4th Floor, Saniya Hemad, Surat, Gujarat 395006, India' );
add_filter(
	'acf/load_value/name=tn_opt_address',
	function () {
		return TN_BRIDGE_ADDRESS;
	},
	99
);
add_filter(
	'option_tradenest_options',
	function ( $opts ) {
		$opts            = is_array( $opts ) ? $opts : array();
		$opts['address'] = TN_BRIDGE_ADDRESS;
		return $opts;
	},
	99
);
add_action(
	'wp_footer',
	function () {
		?>
<script id="tn-bridge-footer-address">
(function(){var f=document.querySelector('footer[role="contentinfo"] .lg\\:col-span-4');if(!f||f.querySelector('.tn-addr')){return;}
var p=document.createElement('p');p.className='tn-addr';p.style.cssText='font-size:12px;line-height:1.6;color:#ecfdf5;margin-top:8px';
p.textContent=<?php echo wp_json_encode( '📍 ' . TN_BRIDGE_ADDRESS ); ?>;var t=f.querySelector('p');if(t){t.insertAdjacentElement('afterend',p);}else{f.appendChild(p);}}());
</script>
		<?php
	},
	99
);

// 10) Homepage hero: the saved image/name overrides (onion) did not match the linked featured product,
//     so the card showed one product's photo with another's text. Blank them so the card uses the
//     featured product's own photo, title, link and text.
add_filter(
	'acf/load_value',
	function ( $value, $post_id, $field ) {
		if ( isset( $field['name'] ) && in_array( $field['name'], array( 'tn_hero_image', 'tn_hero_product_name' ), true ) ) {
			return null;
		}
		return $value;
	},
	99,
	3
);
// ACF formats an empty image field as false (in its type=image formatter), which the theme would print as an empty
// src. The name-specific filters run last, so return null there and the theme falls back to the featured product.
foreach ( array( 'tn_hero_image', 'tn_hero_product_name' ) as $tn_bridge_hero_field ) {
	add_filter( 'acf/format_value/name=' . $tn_bridge_hero_field, '__return_null', 999 );
}
add_action(
	'wp_footer',
	function () {
		if ( ! is_front_page() ) {
			return;
		}
		echo '<script id="tn-bridge-hero-guard">(function(){var i=document.querySelector("img[data-hero-img]");if(!i||i.getAttribute("src")){return;}var c=i.closest("[data-hero-rotate]");try{var r=JSON.parse(c.getAttribute("data-hero-rotate"));if(r&&r[0]){i.src=r[0].img;}}catch(e){}}());</script>' . "\n";
	},
	5
);

// 11) Accessibility (Lighthouse): readable contrast for small grey/footer text, names for icon-only links and unlabeled fields.
add_action(
	'wp_head',
	function () {
		echo '<style id="tn-bridge-a11y">.bg-white .text-gray-400,.bg-\[\#FAF9F5\] .text-gray-400,main .text-gray-400{color:#6b7280}'
			. 'footer .text-emerald-100\/80,footer [class*="text-emerald-100"]{color:#ecfdf5}</style>' . "\n";
	},
	99
);
add_action(
	'wp_footer',
	function () {
		?>
<script id="tn-bridge-a11y-js">
(function(){document.querySelectorAll('a[href*="wa.me/"]').forEach(function(a){if(!a.textContent.trim()&&!a.getAttribute('aria-label')){a.setAttribute('aria-label','Chat with Tradenest Naturals on WhatsApp');}});
document.querySelectorAll('textarea:not([aria-label]),input:not([type=hidden]):not([aria-label])').forEach(function(el){if(el.id&&document.querySelector('label[for="'+el.id+'"]')){return;}if(el.closest('label')){return;}
var t=el.getAttribute('placeholder')||(el.name==='message'?'Your message':el.id==='tn-fresh'?'Fresh weight (kg)':el.name);if(t){el.setAttribute('aria-label',t);}});}());
</script>
		<?php
	},
	99
);

// 12) Export documents line on product pages: only documents we can always provide.
add_filter(
	'tradenest_export_docs',
	function () {
		return array( 'Commercial invoice', 'Packing list', 'Spec sheet', 'Certificate of Origin (on request)' );
	},
	99
);

// 13) Default product FAQ (products without their own FAQ): no COA / phytosanitary promise.
add_filter(
	'tradenest_default_faq',
	function ( $faq ) {
		foreach ( $faq as &$item ) {
			if ( isset( $item['answer'] ) && false !== stripos( $item['answer'], 'COA' ) ) {
				$item['answer'] = 'Yes. Samples are available for quality checks, and a product specification sheet is shared with every quotation. Third-party lab testing can be arranged on request.';
			}
		}
		return $faq;
	},
	100
);

/**
 * Remove sentences that make claims we cannot document (COA, lab/microbial/heavy-metal testing, GMP, Non-GMO, 100%).
 *
 * @param string $text Text.
 * @return string
 */
function tn_bridge_clean_claims( $text ) {
	$re    = '/\b(CO[Aa]|Certificates? of Analysis|heavy metals?|pesticides?|microbial|microbiolog\w*|Salmonella|E\.?\s?coli|aflatoxin|Non-?GMO|GMP|ISO|HACCP|organic|lab[- ]tested|laboratory|100\s?%)\b/i';
	$parts = preg_split( '/(?<=[.!?])\s+/', (string) $text );
	$kept  = array();
	$hit   = false;
	foreach ( $parts as $sentence ) {
		if ( preg_match( $re, $sentence ) ) {
			$hit = true;
			continue;
		}
		$kept[] = $sentence;
	}
	$out = trim( implode( ' ', $kept ) );
	if ( $hit ) {
		$out = trim( $out . ' A product specification sheet is shared with every quotation, and third-party lab testing can be arranged on request.' );
	}
	return $out;
}

// 14) Per-product FAQ answers and specification rows (ACF): drop undocumented claims and lab-only parameters.
add_filter(
	'acf/format_value/name=tn_faq',
	function ( $rows ) {
		if ( ! is_array( $rows ) ) {
			return $rows;
		}
		foreach ( $rows as &$row ) {
			if ( is_array( $row ) && isset( $row['answer'] ) ) {
				$row['answer'] = tn_bridge_clean_claims( $row['answer'] );
			}
		}
		return $rows;
	},
	99
);
add_filter(
	'acf/format_value/name=tn_tech_specs',
	function ( $rows ) {
		if ( ! is_array( $rows ) ) {
			return $rows;
		}
		$lab = '/(salmonella|coli|coliform|yeast|mou?ld|plate count|tpc|aerobic|aflatoxin|heavy|lead|arsenic|cadmium|mercury|pesticide|cfu|microb|staph|listeria)/i';
		$out = array();
		foreach ( $rows as $row ) {
			$param = is_array( $row ) && isset( $row['parameter'] ) ? $row['parameter'] : '';
			$spec  = is_array( $row ) && isset( $row['specification'] ) ? $row['specification'] : '';
			if ( preg_match( $lab, $param . ' ' . $spec ) || ( preg_match( '/purity/i', $param ) && preg_match( '/100/', $spec ) ) ) {
				continue;
			}
			$out[] = $row;
		}
		return $out;
	},
	99
);
add_filter(
	'acf/format_value/name=tn_purity',
	function ( $v ) {
		return preg_match( '/100/', (string) $v ) ? '' : $v;
	},
	99
);

// 15) Gallery: kit images attached to the product (description "tn-gallery-N") feed the theme's gallery.
function tn_bridge_gallery_ids( $post_id ) {
	$kids = get_children(
		array(
			'post_parent'    => $post_id,
			'post_type'      => 'attachment',
			'post_mime_type' => 'image',
			'numberposts'    => 20,
		)
	);
	$ids = array();
	foreach ( $kids as $k ) {
		if ( preg_match( '/^tn-gallery-(\d+)/', (string) $k->post_content, $m ) ) {
			$ids[ (int) $m[1] ] = (int) $k->ID;
		}
	}
	ksort( $ids );
	return array_values( $ids );
}
add_filter(
	'acf/format_value/name=tn_gallery',
	function ( $v, $post_id ) {
		$ids = is_numeric( $post_id ) ? tn_bridge_gallery_ids( (int) $post_id ) : array();
		return $ids ? $ids : $v;
	},
	99,
	2
);
add_filter(
	'acf/load_value/name=tn_gallery',
	function ( $v, $post_id ) {
		if ( ! empty( $v ) || ! is_numeric( $post_id ) ) {
			return $v;
		}
		$ids = tn_bridge_gallery_ids( (int) $post_id );
		return $ids ? $ids : $v;
	},
	99,
	2
);

// 16) Front-end text fixes in theme templates that have no filter (MOQ, lab/COA promises, purity badges, yield calculator).
add_action(
	'template_redirect',
	function () {
		if ( is_admin() || wp_doing_ajax() || is_feed() || ( defined( 'REST_REQUEST' ) && REST_REQUEST ) ) {
			return;
		}
		ob_start( 'tn_bridge_filter_html' );
	},
	99999 // Inner buffer: runs before WP Rocket's page cache stores the HTML.
);
function tn_bridge_filter_html( $html ) {
	if ( false === stripos( (string) $html, '<html' ) ) {
		return $html;
	}
	$map  = array(
		'Our standard MOQ for international bulk orders is 500 Kg per product line item.' => 'Our MOQ is just 5 Kg per product, so you can trial an ingredient before scaling up.',
		'Yes! We provide 100g - 250g lab testing samples with complete COA documents to verified food manufacturers, procurement heads, and importers worldwide.' => 'Yes. We send 100g - 250g samples with a product specification sheet to food manufacturers, procurement teams and importers worldwide.',
		'Our processes follow strict quality control protocols, hygienic stainless-steel batch handling, moisture testing, and comprehensive Certificate of Analysis (COA) verification.' => 'Tradenest Naturals is an FSSAI licensed food business. Every batch is processed hygienically and checked against the agreed specification, and third-party lab testing can be arranged on request.',
		'Our private label facility packs into' => 'For private label we pack into',
		'Get proforma pricing, free 250g lab testing samples, and batch COA datasheets.' => 'Get proforma pricing, free samples and product specification sheets.',
		'Batch Tested &amp; Laboratory Verified' => 'FSSAI Licensed &middot; IEC Registered',
		'100% Pure Sourcing' => 'Natural Ingredients',
		'100% Pure Spray Dried &amp; Dehydrated Ingredients' => 'Spray Dried &amp; Dehydrated Ingredients',
		'500 Kg (Trial Batch)' => '5 - 100 Kg (Trial Order)',
		'Get spec sheet + sample COA' => 'Get spec sheet &amp; price',
		'Download spec sheet + COA' => 'Download spec sheet',
		'Parameters tested on every production batch' => 'Typical specification. Exact values are confirmed with your quotation.',
		'Test Method / Protocol' => 'Notes',
		'>Standard Method<' => '>Typical<',
		'Quality Certifications' => 'Licences &amp; Support',
		'Ships to worldwide from India' => 'Ships worldwide from India',
		'Lab testing sample pack available' => 'Samples available on request',
		'Batch COA &amp; spec sheets attached' => 'Spec sheet shared with every quote',
		'Batch COA & spec sheets attached' => 'Spec sheet shared with every quote',
		'Verified food manufacturers receive COA datasheets and complimentary 250g lab testing samples.' => 'Food manufacturers and importers receive product specification sheets and free 100g - 250g samples.',
		'Dispatch 250g Free Sample &amp; Lab COA' => 'Send me a free sample &amp; spec sheet',
		'Manufacturer and exporter of spray-dried powders, dehydrated vegetables, and natural extracts. Reliable bulk ingredient partner for international food brands.' => 'Manufacturer and exporter of spray dried, dehydrated, spice and herbal powders from India. MOQ just 5 Kg, private label packing and worldwide shipping for food brands, manufacturers and importers.',
		'dehydrated vegetable powders, spray dried fruit powders, botanical extracts, and custom spice blends.' => 'dehydrated vegetable powders, spray dried fruit powders, herbal powders, spices and seasoning blends.',
		'View All 12 Categories' => 'View All Categories',
		'offering spray dried powders, dehydrated vegetables, botanical extracts, and custom B2B formulations.' => 'offering spray dried powders, dehydrated vegetables, spices, herbal powders and private label supply from Surat, India.',
		'>0 Items<' => '>Coming soon<',
		'Custom formulations engineered to integrate seamlessly into high-speed industrial processing lines.' => 'Ingredients specified to suit how each industry uses them, from seasoning lines to capsule filling.',
		'Botanical extracts, herbal capsules &amp; functional blends' => 'Herbal powders for capsules, teas &amp; functional blends',
		'Dedicated capability and quality assurance for food manufacturers, wholesalers, and exporters worldwide.' => 'What food manufacturers, brands and importers get when they buy from us.',
		'Quality is at the center of everything we do. From sourcing raw materials to final packaging, we focus on consistency, hygiene and customer satisfaction.' => 'From raw material to final packing, every batch is processed hygienically and checked against the specification agreed with you.',
		'Dehydrated Onion powder' => 'Dehydrated Onion Powder',
	);
	$html = strtr( $html, $map );
	// Yield calculator (meant for flakes/granules; misleading on powders).
	$html = preg_replace( '#<!-- Rehydration & yield calculator -->.*?(?=<!-- Spec sheet \+ COA -->)#s', '', $html );
	// Badges we cannot document (Non-GMO, Lab Tested, 100% ...).
	$html = preg_replace( '#<span class="text-\[11px\] font-semibold[^"]*"[^>]*>(?:(?!</span>).)*?(?:Non-?GMO|Lab Tested|100\s?%)(?:(?!</span>).)*?</span>#s', '', $html );
	$html = preg_replace( '#<span class="px-3 py-1 bg-emerald-100[^"]*">\s*100[^<]*</span>#', '', $html );
	return $html;
}

// 17) Product structured data (Product schema) for single product pages.
add_action(
	'wp_head',
	function () {
		if ( ! is_singular( 'product' ) ) {
			return;
		}
		$id     = get_queried_object_id();
		$images = array();
		$feat   = get_the_post_thumbnail_url( $id, 'full' );
		if ( $feat ) {
			$images[] = $feat;
		}
		foreach ( tn_bridge_gallery_ids( $id ) as $gid ) {
			$u = wp_get_attachment_image_url( $gid, 'full' );
			if ( $u ) {
				$images[] = $u;
			}
		}
		$terms = get_the_terms( $id, 'product_category' );
		$props = array();
		foreach ( array( 'hs_code' => 'HS Code', 'mesh_size' => 'Mesh size', 'moisture_content' => 'Moisture', 'shelf_life' => 'Shelf life', 'moq' => 'Minimum order quantity' ) as $k => $label ) {
			$v = function_exists( 'tradenest_pm' ) ? tradenest_pm( $k, $id ) : '';
			if ( is_string( $v ) && '' !== trim( $v ) ) {
				$props[] = array( '@type' => 'PropertyValue', 'name' => $label, 'value' => wp_strip_all_tags( $v ) );
			}
		}
		$data = array(
			'@context'        => 'https://schema.org',
			'@type'           => 'Product',
			'name'            => wp_strip_all_tags( get_the_title( $id ) ),
			'url'             => get_permalink( $id ),
			'image'           => $images,
			'description'     => wp_strip_all_tags( get_the_excerpt( $id ) ),
			'brand'           => array( '@type' => 'Brand', 'name' => 'Tradenest Naturals' ),
			'manufacturer'    => array( '@type' => 'Organization', 'name' => 'Tradenest Naturals', 'url' => home_url( '/' ) ),
			'countryOfOrigin' => array( '@type' => 'Country', 'name' => 'India' ),
		);
		if ( $terms && ! is_wp_error( $terms ) ) {
			$data['category'] = $terms[0]->name;
		}
		if ( $props ) {
			$data['additionalProperty'] = $props;
		}
		echo '<script type="application/ld+json" id="tn-bridge-product">' . wp_json_encode( $data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE ) . '</script>' . "\n";
	},
	20
);

// 18) Layout polish: compact mobile header, product name first on mobile, one WhatsApp button on product pages, gallery click-to-view.
add_action(
	'wp_head',
	function () {
		echo '<style id="tn-bridge-layout">'
			. '@media(max-width:767px){header[role="banner"]>div:first-child{display:none}.single-product [data-whatsapp-widget]{display:none}}'
			. '[data-whatsapp-tooltip]{display:none!important}'
			. '@media(max-width:1023px){.single-product main .grid.lg\:grid-cols-12.items-start>.lg\:col-span-7{display:contents}'
			. '.single-product main .grid.lg\:grid-cols-12.items-start>.lg\:col-span-7>*{order:2}'
			. '.single-product main .grid.lg\:grid-cols-12.items-start>.lg\:col-span-7>div:first-child{order:0}'
			. '.single-product main .grid.lg\:grid-cols-12.items-start>.lg\:col-span-5{order:1}}'
			. '.tn-g-thumb{cursor:pointer;transition:outline-color .2s;outline:2px solid transparent;outline-offset:2px}.tn-g-thumb.is-active{outline-color:#1B4332}'
			. '</style>' . "\n";
	},
	99
);
add_action(
	'wp_footer',
	function () {
		if ( ! is_singular( 'product' ) ) {
			return;
		}
		?>
<script id="tn-bridge-gallery">
(function(){var main=document.querySelector('main .lg\\:col-span-5 img.wp-post-image');var grid=main&&main.closest('.lg\\:col-span-5').querySelector('.grid.grid-cols-4');if(!main||!grid){return;}
var first={src:main.currentSrc||main.src,srcset:main.getAttribute('srcset')||''};
var full=function(u){return u.replace(/-\d+x\d+(\.\w+)$/,'$1');};
var tiles=[].slice.call(grid.children);
var mk=function(src,srcset){var d=document.createElement('div');d.className=tiles[0]?tiles[0].className:'';var i=document.createElement('img');i.src=src;i.className='w-full h-full object-cover';i.alt=main.alt;i.loading='lazy';d.appendChild(i);d.dataset.full=src;d.dataset.srcset=srcset;return d;};
var all=[mk(first.src,first.srcset)];tiles.forEach(function(t){var im=t.querySelector('img');if(im){t.dataset.full=full(im.src);t.dataset.srcset='';all.push(t);}});
grid.innerHTML='';grid.style.cssText='display:grid;grid-template-columns:repeat('+Math.min(all.length,5)+',minmax(0,1fr));gap:8px';all.forEach(function(t,ix){t.classList.add('tn-g-thumb');if(!ix){t.classList.add('is-active');}t.setAttribute('role','button');t.setAttribute('tabindex','0');
var go=function(){main.removeAttribute('srcset');main.src=t.dataset.full;if(t.dataset.srcset){main.setAttribute('srcset',t.dataset.srcset);}all.forEach(function(x){x.classList.remove('is-active');});t.classList.add('is-active');};
t.addEventListener('click',go);t.addEventListener('keydown',function(e){if(e.key==='Enter'){go();}});grid.appendChild(t);});}());
</script>
		<?php
	},
	99
);

// 19) HS codes (6-digit international HS), reviewed against tariff schedules and customs rulings. The 8-digit
//     Indian ITC-HS line for each shipment is confirmed by the customs broker.
function tn_bridge_hs_map() {
	return array(
		140 => '0712.20',
		146 => '0712.20',
		157 => '0904.22',
		184 => '0712.20',
		198 => '0712.90',
		211 => '0712.90',
		212 => '2002.90',
		218 => '1105.10',
		223 => '1105.20',
		232 => '0712.90',
		235 => '0712.90',
		238 => '0712.90',
		241 => '0712.90',
		243 => '0712.90',
		301 => '0910.99',
		304 => '1211.90',
		307 => '2106.90',
		309 => '1106.30',
		311 => '1106.30',
		316 => '0910.30',
		318 => '0904.22',
		321 => '0904.22',
		324 => '0904.12',
		327 => '0909.22',
		329 => '0910.91',
		332 => '2501.00',
		353 => '0910.99',
		355 => '1211.90',
		357 => '1211.90',
		359 => '0910.99',
		363 => '1211.90',
		365 => '1211.90',
		368 => '0910.99',
		386 => '1211.90',
		390 => '1211.90',
		392 => '1211.90',
		394 => '1211.90',
		396 => '1302.19',
		398 => '1214.10',
		400 => '1212.99',
		402 => '1212.99',
		404 => '1211.90',
		406 => '1211.90',
		408 => '1211.90',
		410 => '1211.90',
		412 => '1211.90',
		414 => '1211.90',
		416 => '1211.90',
		418 => '1211.90',
		420 => '1211.90',
		422 => '1211.90',
		424 => '1211.90',
		426 => '1211.90',
		428 => '1211.90',
		430 => '1211.90',
		432 => '1211.90',
		434 => '1404.90',
		436 => '1211.90',
		438 => '1211.90',
		440 => '1211.90',
		442 => '1211.90',
		444 => '1211.90',
		446 => '1211.90',
		520 => '1106.30',
		522 => '1106.30',
		524 => '1106.30',
		526 => '1106.30',
		528 => '1106.30',
		531 => '1106.30',
		533 => '1106.30',
		537 => '1106.30',
		539 => '1106.30',
		542 => '1106.30',
		545 => '1106.30',
		558 => '0712.90',
		560 => '0712.90',
		562 => '0712.90',
		564 => '0712.90',
		566 => '0712.90',
		568 => '0406.20',
		577 => '2101.30',
		582 => '2103.10',
	);
}
add_filter(
	'acf/format_value/name=tn_hs_code',
	function ( $v, $post_id ) {
		$map = tn_bridge_hs_map();
		return ( is_numeric( $post_id ) && isset( $map[ (int) $post_id ] ) ) ? $map[ (int) $post_id ] : $v;
	},
	99,
	2
);
add_filter(
	'get_post_metadata',
	function ( $value, $object_id, $meta_key, $single ) {
		// The theme stores the code in tn_hs_code (ACF) and _tn_hs_code (legacy); ACF also reads _tn_hs_code as its
		// field reference, so the ACF format filter above may never run. Filtering the raw meta covers every path.
		if ( 'tn_hs_code' !== $meta_key && '_tn_hs_code' !== $meta_key ) {
			return $value;
		}
		$map = tn_bridge_hs_map();
		if ( ! isset( $map[ (int) $object_id ] ) || 'product' !== get_post_type( (int) $object_id ) ) {
			return $value;
		}
		return $single ? $map[ (int) $object_id ] : array( $map[ (int) $object_id ] );
	},
	99,
	4
);

// 20) Permanent redirects for old / merged product URLs (moved here from Yoast SEO Premium so no paid plugin is needed).
function tn_bridge_redirect_map() {
	return array(
		'products/wholesale-potato-powder-dehydrated-potato-powder-80-mesh' => 'products/dehydrated-potato-powder-supplier-bulk-potato-powder-80-mesh',
		'products/potato-powder-price-per-kg-dehydrated-potato-powder' => 'products/dehydrated-potato-powder-supplier-bulk-potato-powder-80-mesh',
		'products/dehydrated-potato-powder-80-mesh-bulk-supplier-exporter' => 'products/dehydrated-potato-powder-supplier-bulk-potato-powder-80-mesh',
		'products/dehydrated-potato-powder-supplier-bulk-potato-powder-from-india' => 'products/dehydrated-potato-powder-supplier-bulk-potato-powder-80-mesh',
		'products/dehydrated-tomato-flakes-supplier-india-bulk-food-grade-tomato-flakes' => 'products/dehydrated-tomato-flakes-supplier-india-bulk-tomato-flakes',
		'products/premium-moringa-powder-exporter-pure-organic-bulk-supply' => 'products/premium-moringa-leaf-powder-manufacturers-exporters-tradenest-naturals',
		'products/spray-dried-muskmelon-powder' => 'products/premium-spray-dried-muskmelon-powder',
		'products/dehydrated-basil-leaves-premium-dehydrated-basil-leaves-supplier-india' => 'products/bulk-dehydrated-basil-leaves-supplier-india-tradenest-naturals',
		'products/dehydrated-parsley-leaves-supplier-and-exporter-from-india' => 'products/dehydrated-parsley-flakes-food-grade-dried-parsley-leaves',
		'products/wholesale-wheat-grass-powder-premium-organic-bulk-supply' => 'products/wholesale-wheat-grass-powder-premium-bulk-supply',
		'products/shatavari-powder-manufacturer-india-premium-organic-bulk-supplier' => 'products/shatavari-powder-manufacturer-india-premium-bulk-supplier',
		'products/organic-ashwagandha-powder-price-per-kg-bulk-exporter-manufacturer' => 'products/ashwagandha-powder-price-per-kg-bulk-exporter-manufacturer',
		'products/safed-musli-powder-exporter-premium-organic-bulk-supplier' => 'products/safed-musli-powder-exporter-premium-bulk-supplier',
	);
}
add_action(
	'template_redirect',
	function () {
		if ( ! is_404() ) {
			return;
		}
		$path = trim( (string) wp_parse_url( isset( $_SERVER['REQUEST_URI'] ) ? wp_unslash( $_SERVER['REQUEST_URI'] ) : '', PHP_URL_PATH ), '/' ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
		$map  = tn_bridge_redirect_map();
		if ( isset( $map[ $path ] ) ) {
			wp_safe_redirect( home_url( '/' . $map[ $path ] . '/' ), 301, 'Tradenest' );
			exit;
		}
	},
	1
);
