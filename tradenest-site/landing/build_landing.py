"""Build + publish country landing pages (USA, UK, Canada) on tradenestnaturals.com via WP REST."""
import json, subprocess, sys
S = "https://tradenestnaturals.com"
P = S + "/products/"
C = S + "/product-category/"
def a(href, text): return f'<a href="{href}">{text}</a>'

CATS = [
    ("spray-dried-fruit-powders", "Spray dried fruit powders", "mango, pineapple, strawberry, blueberry, lemon juice and more for beverages, dairy, bakery and smoothie mixes"),
    ("spray-dried-vegetable-powders", "Spray dried vegetable powders", "beetroot, carrot, garlic, cabbage and tomato for soups, sauces, seasonings and colour"),
    ("dehydrated-vegetable-powders-flakes", "Dehydrated vegetable powders & flakes", "onion, potato, tomato, spinach and beetroot powders and flakes for ready meals and snack seasonings"),
    ("dehydrated-herbs-leaves", "Dehydrated herbs & leaves", "basil, oregano, rosemary, thyme, parsley, mint and bay leaves for seasoning blends"),
    ("spices-masala-powders", "Spices & masala powders", "turmeric, red chilli, coriander, black pepper and chai masala"),
    ("herbal-ayurvedic-powders", "Herbal & botanical powders", "ashwagandha, moringa, tulsi, neem, shatavari, amla and other Indian botanicals"),
    ("superfood-green-powders", "Superfood & green powders", "moringa, wheatgrass, barley grass and alfalfa"),
]

MARKETS = {
 "usa": dict(
   slug="bulk-food-ingredient-powder-supplier-usa", country="USA", place="the USA", people="US",
   title="Bulk Food Ingredient Powders Supplier for USA Importers",
   seo_title="Bulk Ingredient Powders Supplier for USA Importers | TradeNest",
   desc="Dehydrated, spray dried, spice and botanical powders from India for US food manufacturers, brands and importers. MOQ 5 Kg, private label, samples.",
   buyers=["Food and beverage manufacturers", "Seasoning and spice blenders", "Supplement and wellness brands", "Private label and Amazon / DTC brands", "Ethnic and Indian grocery importers", "Distributors and ingredient traders"],
   products=[("premium-moringa-leaf-powder-manufacturers-exporters-tradenest-naturals","Moringa Leaf Powder"),("ashwagandha-powder-price-per-kg-bulk-exporter-manufacturer","Ashwagandha Powder"),("turmeric-powder-wholesale-price-80-mesh-bulk-turmeric-powder","Turmeric Powder"),("onion-powder-price-per-kg-premium-dehydrated-onion-powder-manufacturer-india","Dehydrated Onion Powder"),("premium-spray-dried-garlic-powder-supplier-bulk-wholesale-solutions","Spray Dried Garlic Powder"),("tomato-powder-price-dehydrated-tomato-powder-supplier","Tomato Powder"),("premium-spray-dried-beetroot-powder","Spray Dried Beetroot Powder"),("premium-spray-dried-mango-alphonso-powder","Alphonso Mango Powder")],
   import_note="For shipments to the United States, the US importer of record usually handles FDA Prior Notice and their own supplier verification process. Tell us what your compliance team needs and we will confirm which documents we can provide for your order before you commit.",
   ship="We ship by sea freight to US ports and by air or courier for samples and small orders. Incoterms such as FOB or CIF can be quoted on request.",
   timezone="We answer emails and WhatsApp messages quickly and can schedule calls in US morning or evening hours."),
 "uk": dict(
   slug="bulk-food-ingredient-powder-supplier-uk", country="UK", place="the UK", people="UK",
   title="Bulk Food Ingredient Powders Supplier for UK Importers",
   seo_title="Bulk Ingredient Powders Supplier for UK Importers | TradeNest",
   desc="Dehydrated, spray dried, spice and botanical powders from India for UK food manufacturers, brands and wholesalers. MOQ 5 Kg, private label, samples.",
   buyers=["Food manufacturers and co-packers", "Spice, curry and seasoning blenders", "Health food and supplement brands", "Private label and online brands", "Asian and world-food wholesalers", "Ingredient distributors"],
   products=[("turmeric-powder-wholesale-price-80-mesh-bulk-turmeric-powder","Turmeric Powder"),("dehydrated-red-chilli-powder-manufacturer-and-exporter","Red Chilli Powder"),("coriander-powder-hs-code-09092200-bulk-ground-coriander","Coriander Powder"),("chai-masala-powder-bulk-chai-masala-powder-supplier-india","Chai Masala Powder"),("premium-moringa-leaf-powder-manufacturers-exporters-tradenest-naturals","Moringa Leaf Powder"),("ashwagandha-powder-price-per-kg-bulk-exporter-manufacturer","Ashwagandha Powder"),("onion-powder-price-per-kg-premium-dehydrated-onion-powder-manufacturer-india","Dehydrated Onion Powder"),("premium-dehydrated-kasuri-methi-supplier-india-tradenest-naturals","Kasuri Methi")],
   import_note="For shipments to the United Kingdom, the UK importer usually handles customs clearance and any port health checks. Tell us what your compliance team needs and we will confirm which documents we can provide for your order before you commit.",
   ship="We ship by sea freight to UK ports such as Felixstowe and Southampton, and by air or courier for samples and small orders. Incoterms such as FOB or CIF can be quoted on request.",
   timezone="India is only 4.5 to 5.5 hours ahead of the UK, so we can reply and take calls within your working day."),
 "canada": dict(
   slug="bulk-food-ingredient-powder-supplier-canada", country="Canada", people="Canadian",
   title="Bulk Food Ingredient Powders Supplier for Canadian Importers",
   seo_title="Bulk Ingredient Powders Supplier for Canada Importers | TradeNest",
   desc="Dehydrated, spray dried, spice and botanical powders from India for Canadian food manufacturers, brands and importers. MOQ 5 Kg, private label, samples.",
   buyers=["Food and snack manufacturers", "Seasoning and spice blenders", "Natural health and wellness brands", "Private label and online brands", "South Asian grocery importers", "Distributors and ingredient traders"],
   products=[("premium-moringa-leaf-powder-manufacturers-exporters-tradenest-naturals","Moringa Leaf Powder"),("turmeric-powder-wholesale-price-80-mesh-bulk-turmeric-powder","Turmeric Powder"),("ashwagandha-powder-price-per-kg-bulk-exporter-manufacturer","Ashwagandha Powder"),("onion-powder-price-per-kg-premium-dehydrated-onion-powder-manufacturer-india","Dehydrated Onion Powder"),("dehydrated-potato-powder-supplier-bulk-potato-powder-80-mesh","Dehydrated Potato Powder"),("premium-spray-dried-beetroot-powder","Spray Dried Beetroot Powder"),("premium-spray-dried-strawberry-powder","Spray Dried Strawberry Powder"),("chai-masala-powder-bulk-chai-masala-powder-supplier-india","Chai Masala Powder")],
   import_note="For shipments to Canada, the Canadian importer usually holds the import licence and handles clearance with the CFIA and CBSA. Tell us what your compliance team needs and we will confirm which documents we can provide for your order before you commit.",
   ship="We ship by sea freight to Canadian ports such as Vancouver, Montreal and Halifax, and by air or courier for samples and small orders. Incoterms such as FOB or CIF can be quoted on request.",
   timezone="We answer emails and WhatsApp messages quickly and can schedule calls in Canadian morning or evening hours."),
}

def page(m):
    c = m["country"]; pl = m.get("place", c)
    cats = "".join(f"<li><strong>{a(C+s+'/', n)}</strong>: {w}.</li>" for s, n, w in CATS)
    prods = "".join(f"<li>{a(P+s+'/', n)}</li>" for s, n in m["products"])
    buyers = "".join(f"<li>{b}</li>" for b in m["buyers"])
    faq = [
      (f"What is your minimum order quantity for {pl}?", "Our MOQ is 5 Kg per product, so you can trial an ingredient before ordering in bulk. Larger volumes are quoted per order."),
      ("Can I get samples before ordering?", "Yes. Samples are available on request and are usually sent by courier."),
      ("Do you offer private label packing?", "Yes. We supply bulk bags and can pack in smaller private label pouches and jars for your brand."),
      ("Which licences do you hold?", "TradeNest Naturals is an FSSAI licensed food business and holds an Import Export Code (IEC) from the Government of India. We also provide export documentation support."),
      ("How do I get a price?", "Send the product, quantity, mesh or grade, packing and destination port to export@tradenestnaturals.com or WhatsApp +91 92651 28276. We reply with a quote, usually within one business day."),
    ]
    faqh = "".join(f"<h3>{q}</h3><p>{ans}</p>" for q, ans in faq)
    return f"""<p><strong>TradeNest Naturals</strong> is a manufacturer and exporter of dehydrated, spray dried, spice and botanical powders based in Surat, India. We supply {m['people']} food manufacturers, brands, importers and distributors with consistent bulk ingredients, from a 5 Kg trial order to full container loads.</p>
<p><strong>Request a quote:</strong> {a('mailto:export@tradenestnaturals.com','export@tradenestnaturals.com')} | WhatsApp {a('https://wa.me/919265128276','+91 92651 28276')}</p>

<h2>Why {c} buyers source from TradeNest Naturals</h2>
<ul>
<li><strong>Low MOQ of 5 Kg</strong>: test a product with your team before committing to volume.</li>
<li><strong>80+ ingredients from one supplier</strong>: consolidate fruit, vegetable, spice and herbal powders in one shipment.</li>
<li><strong>Dehydrated and spray dried options</strong>: choose the process, mesh size and grade that suits your application.</li>
<li><strong>Private label and custom packing</strong>: bulk bags or retail-ready pouches and jars.</li>
<li><strong>FSSAI licensed and IEC registered</strong>, with export documentation support for every shipment.</li>
<li><strong>Responsive export desk</strong>: {m['timezone']}</li>
</ul>

<h2>Ingredient ranges we supply to {pl}</h2>
<ul>{cats}</ul>
<p>See the full {a(S+'/products/','product catalog')} for specifications such as mesh size, moisture and shelf life.</p>

<h2>Popular products with {c} buyers</h2>
<ul>{prods}</ul>

<h2>Who we work with in {pl}</h2>
<ul>{buyers}</ul>

<h2>Shipping and documents</h2>
<p>{m['ship']}</p>
<p>Every order ships with a commercial invoice, packing list and product specification sheet, and we support other export documents as your shipment requires. {m['import_note']}</p>

<h2>How ordering works</h2>
<ol>
<li><strong>Send your requirement</strong>: product, quantity, grade or mesh, packing and destination.</li>
<li><strong>Get a quote and samples</strong>: we confirm price, lead time and specifications.</li>
<li><strong>Confirm the order</strong>: we process, pack and label to your requirement.</li>
<li><strong>Dispatch</strong>: we arrange shipment and share documents and tracking.</li>
</ol>

<h2>Frequently asked questions</h2>
{faqh}

<h2>Get a quote for {pl}</h2>
<p>Email {a('mailto:export@tradenestnaturals.com','export@tradenestnaturals.com')}, message us on WhatsApp at {a('https://wa.me/919265128276','+91 92651 28276')}, or use our {a(S+'/contact/','contact page')}. TradeNest Naturals, Ashirwad Embro Park-1, Plot No. 1, 4th Floor, Saniya Hemad, Surat, Gujarat 395006, India.</p>
"""

def curl(method, url, data):
    r = subprocess.run(["curl", "-s", "-X", method, url, "-H", "Content-Type: application/json", "-d", json.dumps(data)], capture_output=True, text=True)
    return json.loads(r.stdout)

if __name__ == "__main__":
    for key in sys.argv[1:]:
        m = MARKETS[key]
        ex = json.loads(subprocess.run(["curl", "-s", f"{S}/wp-json/wp/v2/pages?slug={m['slug']}&status=any&_fields=id"], capture_output=True, text=True).stdout)
        body = {"title": m["title"], "slug": m["slug"], "content": page(m), "status": "publish", "excerpt": m["desc"]}
        res = curl("POST", f"{S}/wp-json/wp/v2/pages" + (f"/{ex[0]['id']}" if ex else ""), body)
        print(key, res.get("id"), res.get("link"), res.get("message", ""))
        r2 = curl("POST", f"{S}/wp-json/wp-abilities/v1/abilities/yoast-seo/update-post-seo-data/run", {"input": {"post_id": res["id"], "seo_title": m["seo_title"], "meta_description": m["desc"]}})
        print("  seo", r2.get("post_id"), r2.get("message", ""))
