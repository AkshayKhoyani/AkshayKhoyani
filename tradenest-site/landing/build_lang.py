"""Native-language landing pages (es, fr, de, ar) for tradenestnaturals.com."""
import json, subprocess, sys
S = "https://tradenestnaturals.com"
C = S + "/product-category/"
WA = "https://wa.me/919265128276"
ADDR = "Ashirwad Embro Park-1, Plot No. 1, 4th Floor, Saniya Hemad, Surat, Gujarat 395006, India"
CATS = ["spray-dried-fruit-powders", "spray-dried-vegetable-powders", "dehydrated-vegetable-powders-flakes", "dehydrated-herbs-leaves", "spices-masala-powders", "herbal-ayurvedic-powders", "superfood-green-powders"]

L = {
"es": dict(slug="proveedor-polvos-deshidratados-india", title="Proveedor de Polvos Deshidratados y Atomizados de la India",
  seo="Proveedor de Polvos Deshidratados y Especias de India | Tradenest",
  desc="Fabricante y exportador indio de polvos deshidratados, atomizados, especias y hierbas. MOQ 5 Kg, muestras, marca blanca y envíos a España y Latinoamérica.",
  intro="<strong>Tradenest Naturals</strong> es un fabricante y exportador de Surat, India, de polvos deshidratados, polvos atomizados (spray dried), especias y polvos de hierbas. Suministramos a fabricantes de alimentos, marcas, importadores y distribuidores de España y Latinoamérica, desde un pedido de prueba de 5 Kg hasta contenedores completos.",
  why="Por qué comprar a Tradenest Naturals",
  points=["<strong>Pedido mínimo de solo 5 Kg</strong> por producto, para probar antes de comprar en volumen.", "<strong>Más de 80 ingredientes</strong> de un solo proveedor: frutas, verduras, especias y hierbas.", "<strong>Deshidratado o atomizado</strong>, con la malla y el grado que necesita su aplicación.", "<strong>Marca blanca</strong>: sacos a granel o bolsas y frascos con su marca.", "<strong>Licencia FSSAI</strong> y registro de exportador IEC, con apoyo en la documentación de exportación.", "<strong>Muestras disponibles</strong> y ficha técnica con cada cotización."],
  ranges="Nuestras gamas de productos",
  cats=["Frutas en polvo atomizadas (mango, piña, fresa, arándano)", "Verduras en polvo atomizadas (remolacha, zanahoria, ajo)", "Verduras deshidratadas en polvo y escamas (cebolla, tomate, papa, espinaca)", "Hierbas deshidratadas (albahaca, orégano, romero, tomillo)", "Especias molidas (cúrcuma, chile rojo, cilantro, pimienta negra)", "Polvos de hierbas y botánicos (ashwagandha, tulsi, neem, amla)", "Superalimentos verdes (moringa, pasto de trigo, cebada, alfalfa)"],
  how="Cómo hacer un pedido", steps=["Envíe el producto, la cantidad, la malla o grado, el envase y el puerto de destino.", "Le enviamos precio, ficha técnica y, si lo desea, una muestra.", "Confirme el pedido; procesamos, envasamos y etiquetamos según su requisito.", "Despachamos por mar o aire y compartimos los documentos del envío."],
  note="Las fichas de producto de nuestra web están en inglés. Puede escribirnos en español o en inglés.",
  cta="Solicite una cotización", contact="Escríbanos a <a href=\"mailto:export@tradenestnaturals.com\">export@tradenestnaturals.com</a> o por WhatsApp al <a href=\"" + WA + "\">+91 92651 28276</a>, o use nuestra <a href=\"" + S + "/contact/\">página de contacto</a>."),
"fr": dict(slug="fournisseur-poudres-deshydratees-inde", title="Fournisseur de Poudres Déshydratées et Atomisées d'Inde",
  seo="Fournisseur de Poudres Déshydratées et Épices d'Inde | Tradenest",
  desc="Fabricant et exportateur indien de poudres déshydratées, atomisées, épices et plantes. MOQ 5 Kg, échantillons, marque privée et expédition vers la France et l'Afrique.",
  intro="<strong>Tradenest Naturals</strong> est un fabricant et exportateur basé à Surat, en Inde, de poudres déshydratées, de poudres atomisées (spray dried), d'épices et de poudres de plantes. Nous approvisionnons les industriels de l'agroalimentaire, les marques, les importateurs et les distributeurs en France, en Belgique, au Canada francophone et en Afrique, d'une commande d'essai de 5 Kg jusqu'au conteneur complet.",
  why="Pourquoi acheter chez Tradenest Naturals",
  points=["<strong>Minimum de commande de 5 Kg</strong> par produit, pour tester avant d'acheter en volume.", "<strong>Plus de 80 ingrédients</strong> chez un seul fournisseur : fruits, légumes, épices et plantes.", "<strong>Déshydraté ou atomisé</strong>, avec la granulométrie et la qualité adaptées à votre application.", "<strong>Marque privée</strong> : sacs en vrac ou sachets et pots à votre marque.", "<strong>Licence FSSAI</strong> et enregistrement exportateur IEC, avec assistance pour les documents d'export.", "<strong>Échantillons disponibles</strong> et fiche technique avec chaque devis."],
  ranges="Nos gammes de produits",
  cats=["Poudres de fruits atomisées (mangue, ananas, fraise, myrtille)", "Poudres de légumes atomisées (betterave, carotte, ail)", "Poudres et flocons de légumes déshydratés (oignon, tomate, pomme de terre, épinard)", "Herbes séchées (basilic, origan, romarin, thym)", "Épices moulues (curcuma, piment rouge, coriandre, poivre noir)", "Poudres de plantes et botaniques (ashwagandha, tulsi, neem, amla)", "Superaliments verts (moringa, herbe de blé, orge, luzerne)"],
  how="Comment commander", steps=["Envoyez le produit, la quantité, la granulométrie, l'emballage et le port de destination.", "Nous vous envoyons le prix, la fiche technique et, si vous le souhaitez, un échantillon.", "Confirmez la commande ; nous transformons, emballons et étiquetons selon vos besoins.", "Nous expédions par mer ou par avion et partageons les documents d'expédition."],
  note="Les fiches produits de notre site sont en anglais. Vous pouvez nous écrire en français ou en anglais.",
  cta="Demandez un devis", contact="Écrivez-nous à <a href=\"mailto:export@tradenestnaturals.com\">export@tradenestnaturals.com</a> ou sur WhatsApp au <a href=\"" + WA + "\">+91 92651 28276</a>, ou utilisez notre <a href=\"" + S + "/contact/\">page de contact</a>."),
"de": dict(slug="lieferant-getrocknete-pulver-indien", title="Lieferant für getrocknete und sprühgetrocknete Pulver aus Indien",
  seo="Lieferant für getrocknete Pulver und Gewürze aus Indien | Tradenest",
  desc="Indischer Hersteller und Exporteur von getrockneten und sprühgetrockneten Pulvern, Gewürzen und Kräutern. MOQ 5 Kg, Muster, Private Label, Versand nach Europa.",
  intro="<strong>Tradenest Naturals</strong> ist ein Hersteller und Exporteur aus Surat, Indien, für getrocknete Pulver, sprühgetrocknete Pulver, Gewürze und Kräuterpulver. Wir beliefern Lebensmittelhersteller, Marken, Importeure und Händler in Deutschland, Österreich und der Schweiz, von einer Probebestellung über 5 Kg bis zum vollen Container.",
  why="Warum Sie bei Tradenest Naturals kaufen",
  points=["<strong>Mindestbestellmenge nur 5 Kg</strong> pro Produkt, zum Testen vor der Großbestellung.", "<strong>Über 80 Zutaten</strong> von einem Lieferanten: Obst, Gemüse, Gewürze und Kräuter.", "<strong>Getrocknet oder sprühgetrocknet</strong>, in der Körnung und Qualität, die Ihre Anwendung braucht.", "<strong>Private Label</strong>: Großsäcke oder Beutel und Gläser mit Ihrer Marke.", "<strong>FSSAI-Lizenz</strong> und IEC-Exportregistrierung, mit Unterstützung bei den Exportdokumenten.", "<strong>Muster verfügbar</strong> und Produktdatenblatt mit jedem Angebot."],
  ranges="Unser Sortiment",
  cats=["Sprühgetrocknete Fruchtpulver (Mango, Ananas, Erdbeere, Heidelbeere)", "Sprühgetrocknete Gemüsepulver (Rote Bete, Karotte, Knoblauch)", "Getrocknete Gemüsepulver und Flocken (Zwiebel, Tomate, Kartoffel, Spinat)", "Getrocknete Kräuter (Basilikum, Oregano, Rosmarin, Thymian)", "Gemahlene Gewürze (Kurkuma, Chili, Koriander, schwarzer Pfeffer)", "Kräuter- und Botanikpulver (Ashwagandha, Tulsi, Neem, Amla)", "Grüne Superfood-Pulver (Moringa, Weizengras, Gerstengras, Alfalfa)"],
  how="So bestellen Sie", steps=["Senden Sie uns Produkt, Menge, Körnung, Verpackung und Zielhafen.", "Wir senden Ihnen Preis, Datenblatt und auf Wunsch ein Muster.", "Bestätigen Sie die Bestellung; wir verarbeiten, verpacken und etikettieren nach Ihren Vorgaben.", "Wir versenden per See- oder Luftfracht und teilen die Versanddokumente."],
  note="Die Produktseiten unserer Website sind auf Englisch. Sie können uns auf Deutsch oder Englisch schreiben.",
  cta="Angebot anfordern", contact="Schreiben Sie an <a href=\"mailto:export@tradenestnaturals.com\">export@tradenestnaturals.com</a> oder per WhatsApp an <a href=\"" + WA + "\">+91 92651 28276</a>, oder nutzen Sie unsere <a href=\"" + S + "/contact/\">Kontaktseite</a>."),
"ar": dict(slug="supplier-dehydrated-powders-india-arabic", title="مورد المساحيق المجففة والمجففة بالرذاذ من الهند",
  seo="مورد المساحيق المجففة والتوابل من الهند | Tradenest Naturals",
  desc="مصنع ومصدر هندي للمساحيق المجففة والمجففة بالرذاذ والتوابل والأعشاب. الحد الأدنى للطلب 5 كجم، عينات، علامة خاصة، شحن إلى الخليج والشرق الأوسط.",
  intro="<strong>Tradenest Naturals</strong> شركة مصنعة ومصدرة من مدينة سورات في الهند، متخصصة في المساحيق المجففة، والمساحيق المجففة بالرذاذ، والتوابل، ومساحيق الأعشاب. نورّد لمصانع الأغذية والعلامات التجارية والمستوردين والموزعين في الإمارات والسعودية وقطر وعُمان والكويت وسائر الشرق الأوسط، من طلب تجريبي بوزن 5 كجم حتى الحاويات الكاملة.",
  why="لماذا تشتري من Tradenest Naturals",
  points=["<strong>الحد الأدنى للطلب 5 كجم فقط</strong> لكل منتج، لتجربة المنتج قبل الشراء بالجملة.", "<strong>أكثر من 80 مكوناً</strong> من مورد واحد: فواكه وخضروات وتوابل وأعشاب.", "<strong>مجفف أو مجفف بالرذاذ</strong> بدرجة النعومة والجودة التي يحتاجها منتجك.", "<strong>علامة خاصة</strong>: أكياس كبيرة أو عبوات وبرطمانات باسم علامتك التجارية.", "<strong>ترخيص FSSAI</strong> وتسجيل المصدّر IEC، مع دعم في مستندات التصدير.", "<strong>عينات متاحة</strong> ومواصفات فنية مع كل عرض سعر."],
  ranges="مجموعات منتجاتنا",
  cats=["مساحيق فواكه مجففة بالرذاذ (مانجو، أناناس، فراولة، توت أزرق)", "مساحيق خضروات مجففة بالرذاذ (شمندر، جزر، ثوم)", "مساحيق ورقائق خضروات مجففة (بصل، طماطم، بطاطس، سبانخ)", "أعشاب مجففة (ريحان، أوريغانو، إكليل الجبل، زعتر)", "توابل مطحونة (كركم، فلفل أحمر، كزبرة، فلفل أسود)", "مساحيق أعشاب ونباتات (أشواغاندا، تولسي، نيم، آملا)", "مساحيق خضراء فائقة (مورينجا، عشب القمح، عشب الشعير، البرسيم)"],
  how="كيفية الطلب", steps=["أرسل لنا المنتج والكمية ودرجة النعومة والتعبئة وميناء الوصول.", "نرسل لك السعر والمواصفات الفنية، وعينة إذا رغبت.", "أكّد الطلب؛ نقوم بالتصنيع والتعبئة والملصقات حسب متطلباتك.", "نشحن بحراً أو جواً ونرسل لك مستندات الشحن."],
  note="صفحات المنتجات في موقعنا باللغة الإنجليزية. يمكنك مراسلتنا بالعربية أو الإنجليزية.",
  cta="اطلب عرض سعر", contact="راسلنا على <a href=\"mailto:export@tradenestnaturals.com\">export@tradenestnaturals.com</a> أو عبر واتساب على <a href=\"" + WA + "\" dir=\"ltr\">+91 92651 28276</a>، أو استخدم <a href=\"" + S + "/contact/\">صفحة التواصل</a>."),
}

def page(k, m):
    lis = "".join(f"<li>{p}</li>" for p in m["points"])
    cats = "".join(f'<li><a href="{C}{s}/">{n}</a></li>' for s, n in zip(CATS, m["cats"]))
    steps = "".join(f"<li>{x}</li>" for x in m["steps"])
    body = f"""<p>{m['intro']}</p>
<h2>{m['why']}</h2>
<ul>{lis}</ul>
<h2>{m['ranges']}</h2>
<ul>{cats}</ul>
<p><em>{m['note']}</em></p>
<h2>{m['how']}</h2>
<ol>{steps}</ol>
<h2>{m['cta']}</h2>
<p>{m['contact']}</p>
<p dir="ltr">Tradenest Naturals, {ADDR}</p>"""
    if k == "ar":
        body = f'<div dir="rtl" lang="ar" style="text-align:right">{body}</div>'
    else:
        body = f'<div lang="{k}">{body}</div>'
    return body

def curl(method, url, data=None):
    a = ["curl", "-s", "-X", method, url, "-H", "Content-Type: application/json"] + (["-d", json.dumps(data)] if data is not None else [])
    return json.loads(subprocess.run(a, capture_output=True, text=True).stdout)

for k in sys.argv[1:]:
    m = L[k]
    ex = json.loads(subprocess.run(["curl", "-s", f"{S}/wp-json/wp/v2/pages?slug={m['slug']}&status=any&_fields=id"], capture_output=True, text=True).stdout)
    res = curl("POST", f"{S}/wp-json/wp/v2/pages" + (f"/{ex[0]['id']}" if ex else ""), {"title": m["title"], "slug": m["slug"], "content": page(k, m), "status": "publish", "excerpt": m["desc"]})
    curl("POST", f"{S}/wp-json/wp-abilities/v1/abilities/yoast-seo/update-post-seo-data/run", {"input": {"post_id": res["id"], "seo_title": m["seo"], "meta_description": m["desc"]}})
    print(k, res.get("id"), res.get("link"))
