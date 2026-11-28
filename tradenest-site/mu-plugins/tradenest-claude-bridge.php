<?php
/**
 * Plugin Name: TradeNest Claude Bridge
 * Description: Keeps on-site trust claims accurate (FSSAI + IEC only), cleans robots.txt, and exposes
 *              product display fields (name/SKU, tagline) to the REST API for admin editing.
 *              Delete this file to revert every change it makes.
 * Version: 1.8.1
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
	return array( 'FSSAI Registered', 'IEC Registered', 'Export Documentation Support' );
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
		'Our processes follow strict quality control protocols, hygienic stainless-steel batch handling, moisture testing, and comprehensive Certificate of Analysis (COA) verification.' => 'Tradenest Naturals is an FSSAI registered food business. Every batch is processed hygienically and checked against the agreed specification, and third-party lab testing can be arranged on request.',
		'Our private label facility packs into' => 'For private label we pack into',
		'Get proforma pricing, free 250g lab testing samples, and batch COA datasheets.' => 'Get proforma pricing, free samples and product specification sheets.',
		'Batch Tested &amp; Laboratory Verified' => 'FSSAI Registered &middot; IEC Registered',
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
		'Manufacturer and exporter of spray-dried powders, dehydrated vegetables, and natural extracts. Reliable bulk ingredient partner for international food brands.' => 'Supplier and exporter of spray dried, dehydrated, spice and herbal powders from India, with in-house manufacturing of dehydrated vegetables. MOQ just 5 Kg, private label packing and worldwide shipping.',
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
	if ( function_exists( 'tn_bridge_product_html' ) ) {
		$html = tn_bridge_product_html( $html );
	}
	$cfg_map = tn_bridge_config( 'replace', array() );
	if ( is_array( $cfg_map ) && $cfg_map ) {
		$html = strtr( $html, array_map( 'strval', $cfg_map ) );
	}
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
			'countryOfOrigin' => array( '@type' => 'Country', 'name' => 'India' ),
		);
		if ( $terms && ! is_wp_error( $terms ) ) {
			$data['category'] = $terms[0]->name;
			// Manufacturer claim only for dehydrated vegetable products (FSSAI registration scope); others are supplied.
			$veg = array( 'dehydrated-onion-products', 'dehydrated-onion-powder', 'dehydrated-vegetable-powders-flakes' );
			foreach ( $terms as $t ) {
				if ( in_array( $t->slug, $veg, true ) ) {
					$data['manufacturer'] = array( '@type' => 'Organization', 'name' => 'Tradenest Naturals', 'url' => home_url( '/' ) );
					break;
				}
			}
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
		$more = function_exists( 'tn_bridge_config' ) ? tn_bridge_config( 'redirects', array() ) : array();
		if ( is_array( $more ) ) {
			foreach ( $more as $from => $to ) {
				$map[ trim( (string) $from, '/' ) ] = trim( (string) $to, '/' );
			}
		}
		if ( isset( $map[ $path ] ) ) {
			wp_safe_redirect( home_url( '/' . $map[ $path ] . '/' ), 301, 'Tradenest' );
			exit;
		}
	},
	1
);

// 21) Config page: a private page (slug tn-bridge-config) holds JSON between <!-- tn-config --> markers.
//     Admins can change site CSS, hreflang groups, page languages, text replacements and the language
//     switcher there without editing this file.
function tn_bridge_config( $key = null, $default = null ) {
	static $cfg = null;
	if ( null === $cfg ) {
		$cfg  = array();
		$page = get_page_by_path( 'tn-bridge-config', OBJECT, 'page' );
		if ( $page && preg_match( '#<!-- tn-config -->(.*?)<!-- /tn-config -->#s', (string) $page->post_content, $m ) ) {
			$json = json_decode( html_entity_decode( $m[1], ENT_QUOTES ), true );
			if ( is_array( $json ) ) {
				$cfg = $json;
			}
		}
	}
	if ( null === $key ) {
		return $cfg;
	}
	return array_key_exists( $key, $cfg ) ? $cfg[ $key ] : $default;
}

// 22) Extra site CSS from the config page.
add_action(
	'wp_head',
	function () {
		$css = (string) tn_bridge_config( 'css', '' );
		if ( '' !== trim( $css ) ) {
			echo '<style id="tn-bridge-config-css">' . str_replace( '</', '<\/', wp_strip_all_tags( $css ) ) . '</style>' . "\n"; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		}
	},
	100
);

/**
 * Current request URL without query string, with trailing slash.
 *
 * @return string
 */
function tn_bridge_current_url() {
	$path = (string) wp_parse_url( isset( $_SERVER['REQUEST_URI'] ) ? wp_unslash( $_SERVER['REQUEST_URI'] ) : '/', PHP_URL_PATH ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
	return trailingslashit( home_url( $path ) );
}

// 23) hreflang alternates for translated pages (groups of language => URL in the config).
add_action(
	'wp_head',
	function () {
		$groups = tn_bridge_config( 'hreflang', array() );
		if ( ! is_array( $groups ) || ! $groups ) {
			return;
		}
		$here = tn_bridge_current_url();
		foreach ( $groups as $group ) {
			if ( ! is_array( $group ) ) {
				continue;
			}
			$urls = array_map( 'trailingslashit', array_map( 'strval', $group ) );
			if ( ! in_array( $here, $urls, true ) ) {
				continue;
			}
			foreach ( $urls as $lang => $url ) {
				echo '<link rel="alternate" hreflang="' . esc_attr( $lang ) . '" href="' . esc_url( $url ) . '" />' . "\n";
			}
			if ( isset( $urls['en'] ) ) {
				echo '<link rel="alternate" hreflang="x-default" href="' . esc_url( $urls['en'] ) . '" />' . "\n";
			}
			break;
		}
	},
	2
);

// 24) Page language (and right-to-left for Arabic) for translated pages: {"page_id": "es"}.
add_filter(
	'language_attributes',
	function ( $output ) {
		if ( is_admin() || ! is_singular() ) {
			return $output;
		}
		$langs = tn_bridge_config( 'lang_pages', array() );
		$id    = (string) get_queried_object_id();
		if ( is_array( $langs ) && isset( $langs[ $id ] ) ) {
			$lang   = sanitize_key( $langs[ $id ] );
			$output = 'lang="' . esc_attr( $lang ) . '"' . ( in_array( $lang, array( 'ar', 'he', 'fa', 'ur' ), true ) ? ' dir="rtl"' : '' );
		}
		return $output;
	},
	99
);

// 25) Website translator (GTranslate free widget). Config: "translator": {"languages": [...], "position": "left"}.
add_action(
	'wp_footer',
	function () {
		$t = tn_bridge_config( 'translator', null );
		if ( ! is_array( $t ) || empty( $t['languages'] ) ) {
			return;
		}
		$settings = array(
			'default_language'             => 'en',
			'native_language_names'        => true,
			'languages'                    => array_values( array_map( 'sanitize_text_field', (array) $t['languages'] ) ),
			'wrapper_selector'             => '.gtranslate_wrapper',
			'switcher_horizontal_position' => ( isset( $t['position'] ) && 'right' === $t['position'] ) ? 'right' : 'left',
			'switcher_vertical_position'   => 'bottom',
			'alt_flags'                    => array( 'en' => 'usa' ),
		);
		echo '<div class="gtranslate_wrapper"></div><script>window.gtranslateSettings=' . wp_json_encode( $settings ) . ';</script>'
			. '<script src="https://cdn.gtranslate.net/widgets/latest/float.js" defer></script>' . "\n"; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	},
	50
);

// 26) Product page premium layer: visual tabs, trust badges, language links, spec PDF, similar products, FAQ fixes + schema.
function tn_bridge_spec_pdf( $pid ) {
	$kids = get_children( array( 'post_parent' => $pid, 'post_type' => 'attachment', 'post_mime_type' => 'application/pdf', 'numberposts' => 10 ) );
	foreach ( $kids as $k ) {
		if ( 'tn-spec-pdf' === trim( (string) $k->post_content ) ) {
			return wp_get_attachment_url( $k->ID );
		}
	}
	return '';
}

function tn_bridge_svg( $d ) {
	return '<svg class="tn-ico" viewBox="0 0 24 24" aria-hidden="true">' . $d . '</svg>';
}

/**
 * Normalise FAQ answers: real MOQ, no fixed lead-time promises, no undocumented claims.
 */
function tn_bridge_fix_faq_answer( $text ) {
	$parts = preg_split( '/(?<=[.!?])\s+/', trim( (string) $text ) );
	$out   = array();
	$moq   = false;
	$lead  = false;
	foreach ( $parts as $sn ) {
		if ( preg_match( '/flexible|depend|based on|vary|varies|minimum order|\bMOQ\b/i', $sn ) && preg_match( '/\bMOQ\b|minimum order/i', $sn ) ) {
			if ( ! $moq ) {
				$out[] = 'The MOQ is 5 Kg per product, so you can start with a trial order and scale up.';
				$moq   = true;
			}
			continue;
		}
		if ( preg_match( '/\b\d+\s*(?:to|-|–)\s*\d+\s*(?:business\s+)?(?:days|weeks)\b|\bwithin\s+\d+\s*(?:business\s+)?(?:days|weeks|hours)\b/i', $sn ) ) {
			if ( ! $lead ) {
				$out[] = 'Lead time is confirmed with each quotation and depends on quantity and packing.';
				$lead  = true;
			}
			continue;
		}
		$out[] = $sn;
	}
	return function_exists( 'tn_bridge_clean_claims' ) ? tn_bridge_clean_claims( implode( ' ', $out ) ) : implode( ' ', $out );
}

add_action(
	'template_redirect',
	function () {
		if ( is_singular( 'product' ) ) {
			$GLOBALS['tn_bridge_pid'] = get_queried_object_id();
		}
	},
	0
);

function tn_bridge_product_html( $html ) {
	$pid = isset( $GLOBALS['tn_bridge_pid'] ) ? (int) $GLOBALS['tn_bridge_pid'] : 0;
	if ( ! $pid ) {
		return $html;
	}
	// Trust badges + language links under the title.
	$b = array(
		array( '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>', 'FSSAI Registered' ),
		array( '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/>', 'IEC Registered Exporter' ),
		array( '<path d="M21 8l-9-5-9 5v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>', 'MOQ 5 Kg' ),
		array( '<path d="M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>', 'Free Samples' ),
		array( '<path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2c1.3 0 1.9.5 2.5 1"/><path d="M19.4 18L21 12l-9-4-9 4 1.6 6"/><path d="M12 2v6"/>', 'Ships Worldwide' ),
	);
	$badges = '<div class="tn-badges">';
	foreach ( $b as $x ) {
		$badges .= '<span class="tn-badge"><i>' . tn_bridge_svg( $x[0] ) . '</i>' . esc_html( $x[1] ) . '</span>';
	}
	$badges .= '</div>';
	$names  = array( 'es' => 'Español', 'fr' => 'Français', 'de' => 'Deutsch', 'ar' => 'العربية' );
	$here   = trailingslashit( get_permalink( $pid ) );
	$readin = '';
	foreach ( (array) tn_bridge_config( 'hreflang', array() ) as $g ) {
		if ( is_array( $g ) && isset( $g['en'] ) && trailingslashit( $g['en'] ) === $here ) {
			foreach ( $names as $l => $n ) {
				if ( ! empty( $g[ $l ] ) ) {
					$readin .= '<a href="' . esc_url( $g[ $l ] ) . '" hreflang="' . $l . '" lang="' . $l . '">' . esc_html( $n ) . '</a>';
				}
			}
			break;
		}
	}
	if ( $readin ) {
		$readin = '<div class="tn-readin">' . tn_bridge_svg( '<path d="M5 8l6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6"/>' ) . '<span>Read in:</span>' . $readin . '</div>';
	}
	$count = 0;
	$html  = preg_replace( '#(<p class="text-lg font-medium text-emerald-900/80 mt-1">.*?</p>)#s', '$1' . str_replace( '$', '\\$', $badges . $readin ), $html, 1, $count );
	if ( ! $count ) {
		$marker = '<div class="text-gray-600 leading-relaxed text-sm sm:text-base tn-prose">';
		$pos    = strpos( $html, $marker );
		if ( false !== $pos ) {
			$html = substr_replace( $html, $badges . $readin . $marker, $pos, strlen( $marker ) );
		}
	}
	// Spec sheet PDF button above the action buttons.
	$pdf = tn_bridge_spec_pdf( $pid );
	if ( $pdf ) {
		$btn  = '<a class="tn-pdf-btn" href="' . esc_url( $pdf ) . '" target="_blank" rel="noopener" download>' . tn_bridge_svg( '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M12 18v-6M9 15l3 3 3-3"/>' ) . '<span>Download Spec Sheet <small>(PDF)</small></span></a>';
		$html = preg_replace( '/<!-- Action buttons -->/', $btn . '<!-- Action buttons -->', $html, 1 );
	}
	// Similar products carousel (same category first).
	$terms = get_the_terms( $pid, 'product_category' );
	$args  = array( 'post_type' => 'product', 'post_status' => 'publish', 'posts_per_page' => 12, 'post__not_in' => array( $pid ), 'orderby' => 'menu_order title', 'order' => 'ASC', 'no_found_rows' => true );
	if ( $terms && ! is_wp_error( $terms ) ) {
		$args['tax_query'] = array( array( 'taxonomy' => 'product_category', 'field' => 'term_id', 'terms' => $terms[0]->term_id ) ); // phpcs:ignore WordPress.DB.SlowDBQuery
	}
	$ids = get_posts( array_merge( $args, array( 'fields' => 'ids' ) ) );
	if ( count( $ids ) < 4 ) {
		unset( $args['tax_query'] );
		$args['post__not_in'] = array_merge( array( $pid ), $ids );
		$args['posts_per_page'] = 8 - count( $ids );
		$ids = array_merge( $ids, get_posts( array_merge( $args, array( 'fields' => 'ids' ) ) ) );
	}
	if ( $ids ) {
		$title = ( $terms && ! is_wp_error( $terms ) ) ? 'More ' . $terms[0]->name : 'More Products';
		$c     = '<section class="tn-similar"><div class="tn-sim-h"><h2>' . esc_html( $title ) . '</h2><div><button type="button" class="tn-sim-nav" data-d="l" aria-label="Previous">&#8249;</button><button type="button" class="tn-sim-nav" data-d="r" aria-label="Next">&#8250;</button></div></div><div class="tn-sim-track">';
		foreach ( $ids as $id ) {
			$img = get_the_post_thumbnail_url( $id, 'medium_large' );
			$c  .= '<a class="tn-sim-card" href="' . esc_url( get_permalink( $id ) ) . '">' . ( $img ? '<img src="' . esc_url( $img ) . '" alt="' . esc_attr( get_the_title( $id ) ) . '" loading="lazy">' : '' ) . '<div><b>' . esc_html( get_the_title( $id ) ) . '</b><small>MOQ 5 Kg &middot; Samples available</small></div></a>';
		}
		$c   .= '</div></section>';
		$html = preg_replace( '/<!-- Related products -->/', $c . '<!-- Related products -->', $html, 1 );
	}
	// FAQ answers: real MOQ, no fixed lead times.
	$html = preg_replace_callback(
		'#(<p class="text-xs text-gray-600 pl-6 leading-relaxed">)(.*?)(</p>)#s',
		function ( $m ) {
			return $m[1] . esc_html( tn_bridge_fix_faq_answer( html_entity_decode( wp_strip_all_tags( $m[2] ), ENT_QUOTES ) ) ) . $m[3];
		},
		$html
	);
	return $html;
}

add_action(
	'wp_head',
	function () {
		if ( ! is_singular( 'product' ) ) {
			return;
		}
		echo "<style id=\"tn-bridge-tabs\">\n" . <<<'TNCSS'
/* Tradenest product tabs: visual cards, icon tiles, logistics timeline, FAQ accordion */
.tn-ico{width:22px;height:22px;stroke:currentColor;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.tn-spec-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:14px;margin-top:6px}
.tn-spec-card{position:relative;background:linear-gradient(180deg,#fff, #f7faf7);border:1px solid #e3ece5;border-radius:18px;padding:18px 16px 16px;overflow:hidden;transition:transform .2s,box-shadow .2s}
.tn-spec-card:hover{transform:translateY(-3px);box-shadow:0 14px 30px -18px rgba(15,56,44,.45)}
.tn-spec-card:after{content:"";position:absolute;right:-26px;top:-26px;width:80px;height:80px;border-radius:50%;background:radial-gradient(circle,#e7f3ea 0,#e7f3ea00 70%)}
.tn-spec-ic{width:42px;height:42px;border-radius:12px;background:#1B4332;color:#d9f2e3;display:flex;align-items:center;justify-content:center;margin-bottom:12px}
.tn-spec-label{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#6b7a72;font-weight:700}
.tn-spec-val{font-size:17px;font-weight:800;color:#0F382C;margin-top:4px;line-height:1.25;font-family:inherit}
.tn-spec-note{font-size:11px;color:#8a978f;margin-top:14px}
.tn-app-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px}
.tn-app-tile{background:#fff;border:1px solid #e3ece5;border-radius:16px;padding:16px 14px;text-align:center;transition:all .2s}
.tn-app-tile:hover{border-color:#1B4332;box-shadow:0 12px 26px -18px rgba(15,56,44,.5)}
.tn-app-ic{width:50px;height:50px;margin:0 auto 10px;border-radius:50%;background:#eaf5ee;color:#1B4332;display:flex;align-items:center;justify-content:center}
.tn-app-ic .tn-ico{width:24px;height:24px}
.tn-app-tx{font-size:13px;font-weight:600;color:#1f2a24;line-height:1.35}
.tn-ind-wrap{display:flex;flex-wrap:wrap;gap:8px}
.tn-ind-chip{display:inline-flex;align-items:center;gap:8px;background:#0F382C;color:#e8f6ee;border-radius:999px;padding:8px 14px 8px 8px;font-size:13px;font-weight:600}
.tn-ind-chip i{width:26px;height:26px;border-radius:50%;background:#ffffff1f;display:flex;align-items:center;justify-content:center}
.tn-ind-chip .tn-ico{width:15px;height:15px}
.tn-pack-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px}
.tn-pack-card{display:flex;gap:14px;align-items:center;background:#fff;border:1px solid #e3ece5;border-radius:18px;padding:16px}
.tn-pack-ic{flex:0 0 56px;height:56px;border-radius:14px;background:linear-gradient(135deg,#1B4332,#2d6a4f);color:#fff;display:flex;align-items:center;justify-content:center}
.tn-pack-ic .tn-ico{width:28px;height:28px}
.tn-pack-no{font-size:10px;letter-spacing:.12em;color:#8a978f;font-weight:800}
.tn-pack-tx{font-size:14px;font-weight:700;color:#0F382C;margin-top:2px}
.tn-flow{margin-top:26px;padding:22px 18px;border-radius:20px;background:#0F382C;color:#e8f6ee}
.tn-flow h3{font-size:15px;font-weight:800;margin:0 0 18px;color:#fff}
.tn-flow ol{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(5,1fr);gap:10px;position:relative}
.tn-flow ol:before{content:"";position:absolute;left:8%;right:8%;top:22px;height:2px;background:repeating-linear-gradient(90deg,#74c69d 0 8px,transparent 8px 14px)}
.tn-flow li{position:relative;text-align:center;font-size:12px;line-height:1.35;color:#cfe9da}
.tn-flow li b{display:block;color:#fff;font-size:13px;margin-top:8px}
.tn-flow .tn-step{width:46px;height:46px;margin:0 auto;border-radius:50%;background:#D98A24;color:#fff;display:flex;align-items:center;justify-content:center;position:relative;z-index:1;box-shadow:0 0 0 5px #0F382C}
.tn-flow .tn-step .tn-ico{width:22px;height:22px}
@media(max-width:700px){.tn-flow ol{grid-template-columns:1fr;gap:16px}.tn-flow ol:before{left:22px;right:auto;top:8px;bottom:8px;width:2px;height:auto;background:repeating-linear-gradient(180deg,#74c69d 0 8px,transparent 8px 14px)}.tn-flow li{display:flex;gap:14px;text-align:left;align-items:center}.tn-flow .tn-step{margin:0;flex:0 0 46px}.tn-flow li b{margin-top:0}}
.tn-faq{display:flex;flex-direction:column;gap:10px}
.tn-faq-item{background:#fff;border:1px solid #e3ece5;border-radius:16px;overflow:hidden}
.tn-faq-q{width:100%;display:flex;align-items:center;gap:14px;padding:16px 18px;text-align:left;background:none;border:0;cursor:pointer;font-weight:700;font-size:14.5px;color:#0F382C}
.tn-faq-n{flex:0 0 30px;height:30px;border-radius:50%;background:#eaf5ee;color:#1B4332;font-size:12px;font-weight:800;display:flex;align-items:center;justify-content:center}
.tn-faq-q span.t{flex:1}
.tn-faq-ch{transition:transform .25s;color:#1B4332}
.tn-faq-item.open .tn-faq-ch{transform:rotate(180deg)}
.tn-faq-item.open{border-color:#1B4332;box-shadow:0 14px 30px -20px rgba(15,56,44,.45)}
.tn-faq-a{display:none;padding:0 18px 18px 62px;font-size:13.5px;line-height:1.65;color:#4b5a52}
.tn-faq-item.open .tn-faq-a{display:block}
.tn-apps-1col{grid-template-columns:1fr!important}
.tn-apps-1col h2{margin-bottom:6px}
@media(max-width:640px){.tn-spec-grid{grid-template-columns:1fr 1fr;gap:10px}.tn-spec-card{padding:12px 12px 13px;border-radius:14px}.tn-spec-ic{width:34px;height:34px;border-radius:10px;margin-bottom:8px}.tn-spec-ic .tn-ico{width:18px;height:18px}.tn-spec-label{font-size:9.5px}.tn-spec-val{font-size:14px}
.tn-app-grid{grid-template-columns:1fr 1fr;gap:10px}.tn-app-tile{padding:12px 10px}.tn-app-ic{width:42px;height:42px}.tn-app-tx{font-size:12px}
.tn-pack-grid{grid-template-columns:1fr}.tn-faq-a{padding-left:18px}}

.tn-calc{margin-top:18px;border:1px solid #e3ece5;border-radius:20px;background:#fff;padding:18px}
.tn-calc-h{display:flex;gap:12px;align-items:center;margin-bottom:14px}.tn-calc-h b{display:block;color:#0F382C;font-size:15px}.tn-calc-h small{color:#6b7a72;font-size:12px}
.tn-calc-ic{width:40px;height:40px;border-radius:12px;background:#D98A24;color:#fff;display:flex;align-items:center;justify-content:center}
.tn-calc-row{display:grid;grid-template-columns:220px 1fr;gap:16px;align-items:end}
.tn-calc-row label{font-size:12px;font-weight:700;color:#4b5a52;display:flex;flex-direction:column;gap:6px}
.tn-calc-row label span{display:flex;align-items:center;border:2px solid #1B4332;border-radius:14px;overflow:hidden}
.tn-calc-row input{flex:1;border:0;padding:12px 14px;font-size:20px;font-weight:800;color:#0F382C;width:100%;outline:0}
.tn-calc-row em{font-style:normal;background:#1B4332;color:#fff;padding:14px;font-weight:700}
.tn-calc-out{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.tn-calc-out div{background:#f4f9f5;border-radius:14px;padding:12px;text-align:center}.tn-calc-out strong{display:block;font-size:22px;color:#0F382C}.tn-calc-out small{font-size:11px;color:#6b7a72}
.tn-calc-ft{display:flex;gap:14px;align-items:center;justify-content:space-between;margin-top:14px;flex-wrap:wrap}.tn-calc-ft small{font-size:11px;color:#8a978f;flex:1;min-width:220px}
.tn-calc-btn{background:#1B4332;color:#fff;border:0;border-radius:12px;padding:12px 18px;font-weight:700;font-size:13px;cursor:pointer}
@media(max-width:700px){.tn-calc-row{grid-template-columns:1fr}.tn-calc-out strong{font-size:18px}}
.tn-badges{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0 4px}
.tn-badge{display:inline-flex;align-items:center;gap:7px;padding:7px 12px 7px 8px;border-radius:999px;background:#fff;border:1px solid #dbe9df;font-size:12.5px;font-weight:700;color:#1B4332}
.tn-badge i{width:24px;height:24px;border-radius:50%;background:#eaf5ee;display:flex;align-items:center;justify-content:center}.tn-badge .tn-ico{width:14px;height:14px}
.tn-readin{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin:8px 0 2px;font-size:12px;color:#6b7a72}
.tn-readin a{padding:4px 10px;border-radius:8px;background:#f1f6f2;color:#1B4332;font-weight:700;text-decoration:none}.tn-readin a:hover{background:#1B4332;color:#fff}
.tn-pdf-btn{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;padding:13px 18px;margin:4px 0 2px;border-radius:14px;border:2px dashed #1B4332;color:#1B4332;font-weight:800;font-size:14px;text-decoration:none;background:#f7fbf8;transition:all .2s}
.tn-pdf-btn:hover{background:#1B4332;color:#fff;border-style:solid}.tn-pdf-btn small{font-weight:600;opacity:.75}
.tn-bar-pdf{display:inline-flex;align-items:center;gap:6px;padding:9px 12px;border-radius:12px;border:1px solid #1B4332;color:#1B4332;font-weight:700;font-size:12px;text-decoration:none;white-space:nowrap}.tn-bar-pdf .tn-ico{width:16px;height:16px}
.tn-similar{margin-top:8px}.tn-sim-h{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}.tn-sim-h h2{font-size:20px;font-weight:800;color:#0F382C;margin:0}
.tn-sim-nav{width:40px;height:40px;border-radius:50%;border:1px solid #cfe0d4;background:#fff;color:#1B4332;cursor:pointer;margin-left:6px;font-size:18px}
.tn-sim-track{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(220px,1fr);gap:16px;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:8px;scrollbar-width:thin}
@media(min-width:1024px){.tn-sim-track{grid-auto-columns:calc((100% - 48px)/4)}}
.tn-sim-card{scroll-snap-align:start;background:#fff;border:1px solid #e3ece5;border-radius:20px;overflow:hidden;text-decoration:none;transition:all .2s}
.tn-sim-card:hover{transform:translateY(-4px);box-shadow:0 18px 36px -20px rgba(15,56,44,.45);border-color:#1B4332}
.tn-sim-card img{width:100%;aspect-ratio:4/3;object-fit:cover;display:block}.tn-sim-card div{padding:12px 14px 14px}
.tn-sim-card b{display:block;color:#0F382C;font-size:14px;line-height:1.3}.tn-sim-card small{color:#6b7a72;font-size:12px}
.single-product #gt_float_wrapper{bottom:92px!important}
@media(max-width:767px){.single-product #gt_float_wrapper{bottom:84px!important;left:auto!important;right:10px!important;transform:scale(.8);transform-origin:right bottom}}
.tn-badge{font-size:12px;padding:6px 11px 6px 6px;gap:6px}.tn-badge i{width:22px;height:22px}

TNCSS
		. "</style>\n"; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		// FAQPage schema from the product FAQ.
		$faq = function_exists( 'tradenest_pm_faq' ) ? tradenest_pm_faq( get_queried_object_id() ) : array();
		$q   = array();
		foreach ( (array) $faq as $f ) {
			if ( ! empty( $f['question'] ) && ! empty( $f['answer'] ) ) {
				$q[] = array( '@type' => 'Question', 'name' => wp_strip_all_tags( $f['question'] ), 'acceptedAnswer' => array( '@type' => 'Answer', 'text' => tn_bridge_fix_faq_answer( wp_strip_all_tags( $f['answer'] ) ) ) );
			}
		}
		if ( $q ) {
			echo '<script type="application/ld+json" id="tn-bridge-faq">' . wp_json_encode( array( '@context' => 'https://schema.org', '@type' => 'FAQPage', 'mainEntity' => $q ), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE ) . '</script>' . "\n";
		}
	},
	101
);
add_action(
	'wp_footer',
	function () {
		if ( ! is_singular( 'product' ) ) {
			return;
		}
		echo "<script id=\"tn-bridge-tabs-js\">\n" . <<<'TNJS'
/* Tradenest product tabs enhancer: keeps the original text (SEO), rebuilds the four tab panels visually. */
(function () {
  var P = {
    sieve: '<path d="M3 7h18"/><path d="M5 7l1.5 11a2 2 0 0 0 2 1.7h7a2 2 0 0 0 2-1.7L19 7"/><path d="M9 11h.01M12 11h.01M15 11h.01M10.5 14h.01M13.5 14h.01"/>',
    drop: '<path d="M12 2.7s6 6.3 6 11.3a6 6 0 0 1-12 0c0-5 6-11.3 6-11.3z"/>',
    cal: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/>',
    box: '<path d="M21 8l-9-5-9 5v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
    flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.4-.5-2-1-3-1.1-2.1-.2-4 2-6 .5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.2.4-2.3 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    palette: '<circle cx="13.5" cy="6.5" r="1"/><circle cx="17.5" cy="10.5" r="1"/><circle cx="8.5" cy="7.5" r="1"/><circle cx="6.5" cy="12.5" r="1"/><path d="M12 2a10 10 0 0 0 0 20c1 0 1.7-.8 1.7-1.7 0-.4-.2-.8-.4-1.1-.3-.3-.4-.7-.4-1.1 0-.9.8-1.7 1.7-1.7H16a6 6 0 0 0 6-6c0-4.8-4.5-8.4-10-8.4z"/>',
    leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10z"/><path d="M2 21c0-3 1.9-5.4 5.1-6C9.5 14.5 12 13 13 12"/>',
    cup: '<path d="M17 8h1a4 4 0 0 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z"/><path d="M6 2v2M10 2v2M14 2v2"/>',
    bread: '<path d="M5 11a4 4 0 1 1 3-6.6A4 4 0 0 1 12 3a4 4 0 0 1 4 1.4A4 4 0 1 1 19 11v8a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z"/>',
    pill: '<path d="M10.5 20.5a7 7 0 0 1-9.9-9.9l9.9-9.9a7 7 0 0 1 9.9 9.9z"/><path d="M5.5 5.5l9.9 9.9"/>',
    bowl: '<path d="M2 12h20"/><path d="M20 12a8 8 0 0 1-16 0"/><path d="M9 3c0 2 2 2 2 4M14 3c0 2 2 2 2 4"/>',
    spark: '<path d="M12 3l1.9 5.8L20 10l-6.1 1.2L12 17l-1.9-5.8L4 10l6.1-1.2z"/><path d="M19 17l.8 2.2L22 20l-2.2.8L19 23l-.8-2.2L16 20l2.2-.8z"/>',
    shaker: '<path d="M8 2h8l-1 5H9z"/><rect x="6" y="7" width="12" height="15" rx="2"/><path d="M10 12h.01M14 12h.01M12 15h.01"/>',
    milk: '<path d="M8 2h8M9 2v3l-3 4v11a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V9l-3-4V2"/><path d="M6 14c2-1 4 1 6 0s4-1 6 0"/>',
    factory: '<path d="M2 20h20V9l-6 4V9l-6 4V4H2z"/><path d="M6 16h.01M10 16h.01M14 16h.01M18 16h.01"/>',
    store: '<path d="M3 9l1-5h16l1 5"/><path d="M4 9v11h16V9"/><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/>',
    truck: '<path d="M14 18V6H2v12h2"/><path d="M14 9h4l4 4v5h-2"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
    ship: '<path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1s1.2 1 2.5 1c2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M19.4 18L21 12l-9-4-9 4 1.6 6"/><path d="M12 2v6M8 4h8"/>',
    doc: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h6"/>',
    check: '<circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-6"/>',
    cog: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 0 1-4 0v-.1A1.6 1.6 0 0 0 9 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3.3 14H3a2 2 0 0 1 0-4h.1A1.6 1.6 0 0 0 4.6 9a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 9 4.6 1.6 1.6 0 0 0 10 3.1V3a2 2 0 0 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1A1.6 1.6 0 0 0 19.4 9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/>',
    tag: '<path d="M12.6 2.6A2 2 0 0 0 11.2 2H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.7 8.7a2.4 2.4 0 0 0 3.4 0l6.6-6.6a2.4 2.4 0 0 0 0-3.4z"/><circle cx="7.5" cy="7.5" r="1"/>',
    chev: '<path d="M6 9l6 6 6-6"/>'
  };
  function ic(n) { return '<svg class="tn-ico" viewBox="0 0 24 24" aria-hidden="true">' + (P[n] || P.check) + '</svg>'; }
  function pick(t, rules, d) { t = (t || '').toLowerCase(); for (var i = 0; i < rules.length; i++) { if (rules[i][0].test(t)) { return rules[i][1]; } } return d; }
  var SPEC = [[/mesh|particle|size|grain/, 'sieve'], [/moist/, 'drop'], [/shelf|life/, 'cal'], [/hs|code|tariff/, 'globe'], [/moq|order|minimum/, 'box'], [/origin|country/, 'pin'], [/process|method|dried|drying/, 'flame'], [/appear|look|form/, 'eye'], [/colou?r/, 'palette'], [/taste|flavou?r|aroma|odou?r|botanic|part used|plant/, 'leaf'], [/solub/, 'drop'], [/storage|store/, 'box'], [/ash|density|bulk/, 'cog']];
  var APP = [[/beverage|drink|juice|smoothie|shake|tea|coffee|latte/, 'cup'], [/bak|bread|cookie|biscuit|cake|muffin/, 'bread'], [/supplement|capsule|tablet|nutraceut|pharma/, 'pill'], [/soup|sauce|gravy|ready meal|curry|noodle|dip/, 'bowl'], [/cosmetic|skin|hair|face|soap|beauty/, 'spark'], [/season|spice|masala|snack|chip|namkeen|rub/, 'shaker'], [/dairy|yogh?urt|ice cream|milk|dessert/, 'milk'], [/herbal|ayurved|botanical|green|superfood/, 'leaf'], [/manufactur|processor|industr|food brand/, 'factory'], [/retail|private label|brand|store|distribut|import|wholesal/, 'store'], [/horeca|restaurant|hotel|catering|food ?service|kitchen/, 'bowl'], [/feed|animal|pet/, 'leaf']];
  var PACK = [[/pouch|sachet/, 'tag'], [/jar|bottle|tin|can\b/, 'box'], [/hdpe|container|drum|pail|bucket/, 'box'], [/bag|sack|kraft|paper|bulk/, 'box'], [/carton|box/, 'box'], [/pallet|container load|fcl|lcl/, 'ship'], [/private|custom|label/, 'tag']];
  function txt(el) { return (el.textContent || '').replace(/\s+/g, ' ').trim(); }

  function specs(panel) {
    var table = panel.querySelector('table'); if (!table || panel.querySelector('.tn-spec-grid')) { return; }
    var grid = document.createElement('div'); grid.className = 'tn-spec-grid';
    var seen = {};
    [].forEach.call(table.querySelectorAll('tbody tr'), function (tr) {
      var td = tr.querySelectorAll('td'); if (td.length < 2) { return; }
      var l = txt(td[0]), v = txt(td[1]);
      var key = l.toLowerCase().replace(/content|\s+/g, ''); if (seen[key]) { return; } seen[key] = 1;
      grid.insertAdjacentHTML('beforeend', '<div class="tn-spec-card"><div class="tn-spec-ic">' + ic(pick(l, SPEC, 'check')) + '</div><div class="tn-spec-label"></div><div class="tn-spec-val"></div></div>');
      var c = grid.lastChild; c.querySelector('.tn-spec-label').textContent = l; c.querySelector('.tn-spec-val').textContent = v;
    });
    var wrap = table.closest('.overflow-x-auto') || table;
    wrap.style.display = 'none'; wrap.parentNode.insertBefore(grid, wrap);
  }

  function apps(panel) {
    if (panel.querySelector('.tn-app-grid')) { return; }
    var cols = panel.querySelectorAll(':scope > div');
    [].forEach.call(cols, function (col, i) {
      var list = col.querySelector('.space-y-2\\.5') || col.querySelector('div'); if (!list) { return; }
      var items = [].map.call(list.querySelectorAll(':scope > div'), txt).filter(Boolean); if (!items.length) { return; }
      var out = document.createElement('div');
      if (i === 0) {
        out.className = 'tn-app-grid';
        items.forEach(function (t) { out.insertAdjacentHTML('beforeend', '<div class="tn-app-tile"><div class="tn-app-ic">' + ic(pick(t, APP, 'check')) + '</div><div class="tn-app-tx"></div></div>'); out.lastChild.querySelector('.tn-app-tx').textContent = t; });
      } else {
        out.className = 'tn-ind-wrap';
        items.forEach(function (t) { out.insertAdjacentHTML('beforeend', '<span class="tn-ind-chip"><i>' + ic(pick(t, APP, 'factory')) + '</i><span></span></span>'); out.lastChild.lastChild.textContent = t; });
      }
      list.style.display = 'none'; list.parentNode.insertBefore(out, list);
    });
    panel.classList.add('tn-apps-1col');
  }

  function pack(panel) {
    if (panel.querySelector('.tn-pack-grid')) { return; }
    var grid = panel.querySelector('.grid'); if (!grid) { return; }
    var cards = [].slice.call(grid.children);
    var out = document.createElement('div'); out.className = 'tn-pack-grid';
    cards.forEach(function (c, i) {
      var ps = c.querySelectorAll('p'); var t = ps.length ? txt(ps[ps.length - 1]) : txt(c); if (!t) { return; }
      out.insertAdjacentHTML('beforeend', '<div class="tn-pack-card"><div class="tn-pack-ic">' + ic(pick(t, PACK, 'box')) + '</div><div><div class="tn-pack-no">OPTION ' + ('0' + (i + 1)).slice(-2) + '</div><div class="tn-pack-tx"></div></div></div>');
      out.lastChild.querySelector('.tn-pack-tx').textContent = t;
    });
    grid.style.display = 'none'; grid.parentNode.insertBefore(out, grid);
    var steps = [['doc', 'Inquiry', 'Product, quantity, packing and port'], ['cog', 'Sample &amp; quote', 'Spec sheet with every quotation'], ['factory', 'Processing', 'Cleaned, dried, milled and sieved'], ['box', 'Packing', 'Bulk or private label, export packed'], ['ship', 'Dispatch', 'Sea or air, documents shared']];
    var html = '<div class="tn-flow"><h3>How your order moves</h3><ol>';
    steps.forEach(function (s) { html += '<li><span class="tn-step">' + ic(s[0]) + '</span><div><b>' + s[1] + '</b>' + s[2] + '</div></li>'; });
    out.insertAdjacentHTML('afterend', html + '</ol></div>');
  }

  function faq(panel) {
    if (panel.querySelector('.tn-faq')) { return; }
    var box = panel.querySelector('.space-y-3'); if (!box) { return; }
    var out = document.createElement('div'); out.className = 'tn-faq';
    [].forEach.call(box.children, function (it, i) {
      var ps = it.querySelectorAll('p'); if (ps.length < 2) { return; }
      out.insertAdjacentHTML('beforeend', '<div class="tn-faq-item' + (i === 0 ? ' open' : '') + '"><button type="button" class="tn-faq-q" aria-expanded="' + (i === 0) + '"><span class="tn-faq-n">' + (i + 1) + '</span><span class="t"></span><span class="tn-faq-ch">' + ic('chev') + '</span></button><div class="tn-faq-a"></div></div>');
      var el = out.lastChild; el.querySelector('.t').textContent = txt(ps[0]); el.querySelector('.tn-faq-a').textContent = txt(ps[1]);
      el.querySelector('button').addEventListener('click', function () { var o = el.classList.toggle('open'); this.setAttribute('aria-expanded', o); });
    });
    box.style.display = 'none'; box.parentNode.insertBefore(out, box);
  }


  function calc(panel) {
    if (panel.querySelector('.tn-calc')) { return; }
    var anchor = panel.querySelector('.tn-flow'); if (!anchor) { return; }
    anchor.insertAdjacentHTML('afterend', '<div class="tn-calc"><div class="tn-calc-h"><span class="tn-calc-ic">' + ic('box') + '</span><div><b>Quantity planner</b><small>Enter your quantity to see packing and container estimates</small></div></div>'
      + '<div class="tn-calc-row"><label>Quantity needed<span><input type="number" min="5" step="5" value="500" inputmode="numeric" aria-label="Quantity in kg"><em>kg</em></span></label>'
      + '<div class="tn-calc-out"><div><strong data-o="bags">20</strong><small>bags of 25 kg</small></div><div><strong data-o="small">100</strong><small>packs of 5 kg</small></div><div><strong data-o="cont">4%</strong><small>of a 20ft container*</small></div></div></div>'
      + '<div class="tn-calc-ft"><small>*Approximate. A 20ft container typically carries 12 to 16 tonnes of bagged powder, depending on product density and packing. Exact loading is confirmed with your quotation.</small><button type="button" class="tn-calc-btn">Request a quote for <span data-o="qty">500</span> kg</button></div></div>');
    var box = panel.querySelector('.tn-calc'), inp = box.querySelector('input');
    var upd = function () { var kg = Math.max(0, parseFloat(inp.value) || 0); box.querySelector('[data-o=bags]').textContent = Math.ceil(kg / 25); box.querySelector('[data-o=small]').textContent = Math.ceil(kg / 5); var pc = kg / 14000 * 100; box.querySelector('[data-o=cont]').textContent = (pc >= 100 ? (kg / 14000).toFixed(1) + ' x' : (pc < 1 && kg > 0 ? '<1%' : Math.round(pc) + '%')); box.querySelector('[data-o=cont]').nextElementSibling.textContent = pc >= 100 ? '20ft containers (approx.)*' : 'of a 20ft container*'; box.querySelector('[data-o=qty]').textContent = kg; };
    inp.addEventListener('input', upd); upd();
    box.querySelector('.tn-calc-btn').addEventListener('click', function () {
      var t = document.querySelector('[data-inquiry-open]'); if (t) { t.click(); }
      setTimeout(function () { var ta = document.getElementById('tn-inq-message'); var n = (document.querySelector('main h1') || {}).textContent || 'this product'; if (ta) { ta.value = 'We need approx. ' + inp.value + ' kg of ' + n.trim() + '. Please share price, packing options and lead time.'; } }, 300);
    });
  }
  function sticky() {
    var bar = document.querySelector('.fixed.bottom-0.left-0.right-0'); var pdf = document.querySelector('.tn-pdf-btn');
    if (!bar || bar.querySelector('.tn-bar-pdf')) { return; }
    var img = document.querySelector('main img.wp-post-image'); var tn = bar.querySelector('.w-9.h-9');
    if (img && tn) { tn.innerHTML = '<img src="' + (img.currentSrc || img.src) + '" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:10px">'; tn.style.padding = '0'; tn.style.overflow = 'hidden'; }
    var btns = bar.querySelector('.flex.items-center.gap-3.w-full'); if (pdf && btns) { btns.insertAdjacentHTML('afterbegin', '<a class="tn-bar-pdf" href="' + pdf.getAttribute('href') + '" target="_blank" rel="noopener">' + ic('doc') + '<span>Spec PDF</span></a>'); }
  }
  function similar() { var s = document.querySelector('.tn-similar'); if (!s) { return; } var n = s.nextElementSibling; if (n && /Related Products/.test(n.textContent)) { n.style.display = 'none'; }
    var tr = s.querySelector('.tn-sim-track'); [].forEach.call(s.querySelectorAll('.tn-sim-nav'), function (b) { b.addEventListener('click', function () { tr.scrollBy({ left: (b.dataset.d === 'l' ? -1 : 1) * tr.clientWidth * 0.8, behavior: 'smooth' }); }); }); }
  function run() {
    var q = function (n) { return document.querySelector('[data-tab-panel="' + n + '"]'); };
    try { if (q('specs')) { specs(q('specs')); } } catch (e) {}
    try { if (q('applications')) { apps(q('applications')); } } catch (e) {}
    try { if (q('packaging')) { pack(q('packaging')); } } catch (e) {}
    try { if (q('faq')) { faq(q('faq')); } } catch (e) {}
    try { if (q('packaging')) { calc(q('packaging')); } } catch (e) {}
    try { sticky(); } catch (e) {}
    try { similar(); } catch (e) {}
  }
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', run); } else { run(); }
})();

TNJS
		. "</script>\n"; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	},
	60
);
