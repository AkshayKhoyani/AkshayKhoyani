# Brief: translated product pages for Tradenest Naturals

Tradenest Naturals (Surat, India) is a B2B manufacturer-exporter of dehydrated, spray dried, spice and herbal powders.
Work only in /home/user/AkshayKhoyani/tradenest-site/i18n. Do NOT call any website or API; only write local files.

Input: the products_partN.json file named in your task. Each item: id, name (English), url (English product page), image (photo URL),
category, specs (dict, e.g. Processing, Mesh Size, Moisture, Shelf Life, HS Code, MOQ, Origin), tagline, english_html (the full English page).

For EACH product write out_products/<LANG>/<id>.json with keys:
- title: natural product page title in the target language, as an importer would search (e.g. ES "Moringa en polvo a granel de la India"). No brand.
- slug: short lowercase ASCII slug with hyphens in the target language (German: ae/oe/ue/ss; Arabic: English ASCII words). Must be unique per product.
- seo_title: max 60 chars, ending " | Tradenest".
- meta_description: 120-155 chars.
- content_html: 300-480 words. Allowed tags: figure, img, h2, h3, p, ul, li, strong, em, a, table, tbody, tr, th, td (and for Arabic one wrapper div).
  Structure:
  1. <figure><img src="IMAGE" alt="translated product name - Tradenest Naturals" loading="lazy" width="600" height="600"></figure>
  2. Intro paragraph: what the product is, who buys it, MOQ 5 Kg, samples, private label, ships worldwide from India.
  3. h2 specifications + a <table> with one row per spec (translate the labels; keep numbers, mesh and HS code exactly; translate words like "Dehydrated", "Months", "India").
  4. h2 applications: <ul> of 5-7 uses taken from the English page.
  5. h2 packing and ordering: short paragraph (packing formats only if in the English page) + how to order in 3 short steps (<ul>).
  6. Contact paragraph: email <a href="mailto:export@tradenestnaturals.com">export@tradenestnaturals.com</a>, WhatsApp <a href="https://wa.me/919265128276">+91 92651 28276</a>, and a link to the English page (url) labelled in the target language (e.g. "Ver la ficha completa en inglés").
  For Arabic: wrap everything in <div dir="rtl" lang="ar" style="text-align:right"> ... </div>, and add dir="ltr" on the WhatsApp link.
Rules:
- Translate faithfully from english_html; do not add facts. Allowed company facts: FSSAI licensed, IEC registered exporter, export documentation support, MOQ 5 Kg, samples on request, private label, custom seasoning blends, worldwide shipping from India.
- Never claim: organic, certificate of analysis/COA, lab testing, GMP, ISO, HACCP, Non-GMO, halal, "100%", health or medical benefits, hype (best, leading, premium quality guaranteed). Keep "third-party lab testing can be arranged on request at the buyer's cost" only if it is in the English page.
- Native professional business language. No em dashes.
Self-check with a python script: valid JSON with exactly 5 keys, image URL and English url present, word count 280-500, seo_title <= 60 and ends with " | Tradenest", meta 120-155, slug ascii unique, no banned words (organic/orgánico/biologique/bio /عضوي, ISO, HACCP, GMP, GMO, COA, 100%, halal/حلال). Fix until all pass.
Report briefly: count done, any product you were unsure about.
