import openpyxl
from openpyxl.styles import Font, Alignment, PatternFill
S="https://tradenestnaturals.com"
wb=openpyxl.Workbook()
H=Font(bold=True,color="FFFFFF"); F=PatternFill("solid",fgColor="1B4332")
def sheet(name,rows,widths):
    ws=wb.create_sheet(name); 
    for r in rows: ws.append(r)
    for c in ws[1]: c.font=H; c.fill=F
    for i,w in enumerate(widths): ws.column_dimensions[chr(65+i)].width=w
    for row in ws.iter_rows():
        for c in row: c.alignment=Alignment(wrap_text=True,vertical="top")
    return ws
wb.remove(wb.active)
# 1 Google Business Profile
gbp_desc=("Tradenest Naturals is a manufacturer and exporter of dehydrated, spray dried, spice and herbal powders from Surat, India. "
 "We supply food manufacturers, brands, importers and distributors in the USA, UK, Canada, Europe, the Middle East and Australia. "
 "Our range covers 80+ ingredients: spray dried fruit and vegetable powders, dehydrated onion, garlic, tomato and potato, culinary herbs, "
 "Indian spices, moringa, ashwagandha and other botanical powders, plus custom seasoning blends. MOQ 5 Kg per product, samples on request, "
 "private label packing and export documentation support. FSSAI licensed and IEC registered.")
assert len(gbp_desc)<=750,len(gbp_desc)
sheet("1 Google Business",[
 ["Field","Paste this","Note"],
 ["Business name","Tradenest Naturals","Exactly as on your licence/signboard"],
 ["Primary category","Food products supplier","Search the category list; pick the closest"],
 ["Additional categories","Spice exporter; Exporter; Spice wholesaler; Wholesale food store","Max 9"],
 ["Address",ADDR:="Ashirwad Embro Park-1, Plot No. 1, 4th Floor, Saniya Hemad, Surat, Gujarat 395006, India","Google will verify (video or postcard)"],
 ["Service area","Worldwide (export) - add: United States, United Kingdom, Canada, United Arab Emirates, Saudi Arabia, Germany, Australia","Optional"],
 ["Phone","+91 92651 28276",""],
 ["Website",S,""],
 ["Hours","Mon-Sat 9:30 AM - 7:00 PM","Change if different"],
 ["Description (750 max)",gbp_desc,f"{len(gbp_desc)} characters"],
 ["Products (add each)","Moringa Leaf Powder | Ashwagandha Powder | Turmeric Powder | Dehydrated Onion Powder | Spray Dried Mango Powder | Spray Dried Beetroot Powder | Tomato Powder | Chai Masala | Custom Seasoning Blends","Use the branded pouch photo (01-hero-pouch.jpg) for each, link to its product page"],
 ["Services","Bulk ingredient supply; Private label packing; Custom seasoning blends; Sample dispatch; Export documentation support",""],
 ["Photos to upload","Logo, 10 product pouch photos, 3 bulk packing photos (04-bulk.jpg), and real photos of your office / packing area","Real photos matter most"],
 ["First posts","Post 1: 'Now exporting 80+ food ingredient powders from India - MOQ 5 Kg.' + link to /export-markets/   Post 2: Moringa powder + link   Post 3: Custom seasoning blends + link",""],
],[24,90,40])
# 2 Google Ads
camps=[("US & Canada","United States; Canada","/bulk-food-ingredient-powder-supplier-usa/"),
 ("UK & Europe","United Kingdom; Germany; Netherlands; France; Spain; Italy; Ireland; Belgium","/bulk-food-ingredient-powder-supplier-europe/"),
 ("Gulf","United Arab Emirates; Saudi Arabia; Qatar; Oman; Kuwait; Bahrain","/bulk-food-ingredient-powder-supplier-uae-middle-east/"),
 ("Australia & NZ","Australia; New Zealand","/bulk-food-ingredient-powder-supplier-australia/")]
groups=[("Moringa","/products/premium-moringa-leaf-powder-manufacturers-exporters-tradenest-naturals/",["moringa powder supplier","bulk moringa powder","moringa leaf powder wholesale","moringa powder manufacturer india","moringa powder exporter"]),
 ("Ashwagandha & herbal","/product-category/herbal-ayurvedic-powders/",["ashwagandha powder supplier","bulk ashwagandha powder","ashwagandha root powder wholesale","herbal powder supplier india","ayurvedic powder manufacturer"]),
 ("Spices","/product-category/spices-masala-powders/",["turmeric powder supplier","bulk turmeric powder","spice supplier india","wholesale spices india","red chilli powder exporter"]),
 ("Dehydrated veg","/product-category/dehydrated-vegetable-powders-flakes/",["dehydrated onion powder supplier","bulk onion powder","garlic powder wholesale","tomato powder supplier","dehydrated vegetable powder manufacturer"]),
 ("Fruit powders","/product-category/spray-dried-fruit-powders/",["mango powder supplier","spray dried fruit powder","bulk fruit powder","fruit powder manufacturer india","strawberry powder wholesale"]),
 ("Private label","/private-label-herbal-powders-from-india/",["private label supplements powder","private label spices supplier","white label herbal powder","custom seasoning blend manufacturer","private label food ingredients india"])]
rows=[["Campaign","Locations","Ad group","Keyword","Match type","Final URL"]]
for c,loc,lp in camps:
    for g,url,kws in groups:
        for k in kws:
            rows.append([f"Search - {c}",loc,g,k,"Phrase",S+url])
            rows.append([f"Search - {c}",loc,g,k,"Exact",S+url])
sheet("2 Google Ads keywords",rows,[22,40,20,36,10,70])
heads=["Tradenest Naturals","Bulk Powders From India","MOQ Just 5 Kg","Samples On Request","Private Label Available","80+ Food Ingredients","Dehydrated & Spray Dried","FSSAI Licensed Exporter","Get A Bulk Quote Today","Moringa Powder Supplier","Indian Spices In Bulk","Custom Seasoning Blends","Ships Worldwide From India","Spec Sheet With Every Quote","Reply On WhatsApp Fast"]
descs=["Dehydrated, spray dried, spice and herbal powders from India. MOQ 5 Kg. Get a quote.",
 "80+ ingredients from one supplier. Samples, spec sheets and private label packing.",
 "FSSAI licensed manufacturer and IEC registered exporter. Ships worldwide.",
 "Send product, quantity and port. We reply with price and spec sheet quickly."]
for h in heads: assert len(h)<=30,h
for d in descs: assert len(d)<=90,(len(d),d)
ads=[["Type","Text","Characters"]]+[["Headline",h,len(h)] for h in heads]+[["Description",d,len(d)] for d in descs]
ads+=[["Sitelink","Product Catalog | "+S+"/products/",""],["Sitelink","Export Markets | "+S+"/export-markets/",""],["Sitelink","Request a Quote | "+S+"/contact/",""],["Sitelink","Private Label Guide | "+S+"/private-label-herbal-powders-from-india/",""],
 ["Callout","MOQ 5 Kg",""],["Callout","Free Samples",""],["Callout","Private Label",""],["Callout","Export Documents",""],
 ["Negative keywords","recipe, recipes, benefits, side effects, how to make, near me, amazon, walmart, costco, jobs, career, free, diy, capsules for weight loss, review, reviews, wikipedia, meaning, pdf, homemade",""],
 ["Bidding","Start: Maximize conversions after 15+ leads; first 2 weeks Maximize clicks with max CPC limit",""],
 ["Budget","Start ₹800-1,500/day total. Split: US&Canada 35%, UK&Europe 30%, Gulf 20%, Australia 15%. Review weekly.",""],
 ["Conversions","Track: contact form submit, WhatsApp click, email click (set up via Google Analytics 4 / Site Kit, I will configure once connected)",""]]
sheet("3 Google Ads copy",ads,[18,95,12])
# 3 Meta
ig_bio="Bulk dehydrated, spray dried & spice powders from India 🌿 MOQ 5 Kg · Private label · Ships worldwide 👇 Get a quote"
assert len(ig_bio)<=150,len(ig_bio)
sheet("4 Facebook & Instagram",[
 ["Item","Paste this","Note"],
 ["Facebook Page name","Tradenest Naturals",""],
 ["Page category","Food & Beverage Company; Wholesale & Supply Store; Import/Export Company","Up to 3"],
 ["Username","@tradenestnaturals","If taken: @tradenest.naturals"],
 ["Page bio (255 max)","Manufacturer & exporter of dehydrated, spray dried, spice and herbal powders from Surat, India. MOQ 5 Kg, samples, private label, worldwide shipping.",""],
 ["Instagram bio (150 max)",ig_bio,f"{len(ig_bio)} characters"],
 ["Link in bio",S+"/export-markets/",""],
 ["Button","Send WhatsApp message (+91 92651 28276)",""],
 ["Profile photo","Logo on cream background (brand-kit/assets/tradenest-logo.png)",""],
 ["Cover photo","Use a 02-banner.jpg product banner",""],
 ["Ad 1 - Lead (Moringa)","Image: moringa 01-hero-pouch.jpg | Text: 'Looking for a reliable moringa powder supplier? Low-temperature dried, 80-100 mesh, MOQ just 5 Kg. Samples and private label available.' | Headline: 'Bulk Moringa Powder from India' | Button: Send WhatsApp message","Countries: US, UK, UAE, AU. Interests: food manufacturing, dietary supplements, import/export, private label"],
 ["Ad 2 - Range carousel","5 cards: moringa, turmeric, mango powder, onion powder, beetroot powder (01-hero-pouch.jpg each) | Text: '80+ food ingredient powders from one supplier. Dehydrated, spray dried and spices. MOQ 5 Kg.' | Button: Learn more -> /products/",""],
 ["Ad 3 - Private label","Image: any 04-bulk.jpg | Text: 'Launch your own powder brand. We pack moringa, ashwagandha, spices and fruit powders under your label. Start from 5 Kg.' | Headline: 'Private Label Powders from India'",""],
 ["Ad 4 - Gulf spices","Image: turmeric 01 + chilli 01 | Text: 'Indian spices in bulk for UAE and Saudi traders. Short transit to Jebel Ali and Dammam. Get a quote on WhatsApp.'","Countries: UAE, Saudi Arabia, Qatar, Oman, Kuwait"],
 ["Ad budget","Start ₹500-800/day, Leads/Messages objective, 7-day test per ad, keep the 2 best",""],
],[26,95,45])
# 4 Content calendar
cal=[["Week","Day","Platform","Post","Asset"]]
plan=[("Mon","Product spotlight","01-hero-pouch.jpg of the week's product + specs in caption"),("Wed","Reel","15-20s reel: powder pour + pouch + 'MOQ 5 Kg' (I will make these)"),("Fri","Use case","05-uses.jpg - 'Where buyers use it'"),("Sat","Behind the scenes","Real photo/video from your office or packing (send to me)")]
prods=["Moringa Leaf Powder","Turmeric Powder","Spray Dried Mango Powder","Dehydrated Onion Powder"]
for w,p in enumerate(prods,1):
    for d,t,a in plan: cal.append([f"Week {w}: {p}",d,"Instagram + Facebook",t,a])
sheet("5 Content calendar",cal,[30,8,20,22,70])
wb.save("Tradenest_Marketing_Kit.xlsx"); print("ok", len(rows)-1, "keywords")
