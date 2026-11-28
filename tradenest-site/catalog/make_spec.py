"""Create specs/<slug>.json for every published product (facts from the website; visuals/wording by LLM).

Usage: python3 make_spec.py            -> all products without a spec
"""
import html, json, os, re, subprocess, concurrent.futures as cf

HERE = os.path.dirname(os.path.abspath(__file__))
SPECS = os.path.join(HERE, "specs")
os.makedirs(SPECS, exist_ok=True)

def get(url):
    return json.loads(subprocess.run(["curl", "-s", url], capture_output=True, text=True).stdout)

def clean(s):
    s = html.unescape(re.sub(r"<[^>]+>", "", s or "")).strip()
    return re.sub(r"\s{2,}", " ", s)

BAD = re.compile(r"\b(organic|ISO|HACCP|GMP|certified|100%)\b", re.I)
products = get("https://tradenestnaturals.com/wp-json/wp/v2/products?per_page=100&status=publish&context=edit&_fields=id,title,link,excerpt,product_category")
tacc = {t["id"]: t for t in get("https://tradenestnaturals.com/wp-json/tacc/v1/products?per_page=200")}
cats = {c["id"]: html.unescape(c["name"]) for c in get("https://tradenestnaturals.com/wp-json/wp/v2/product_category?per_page=100&_fields=id,name")}

SCHEMA = {"type": "object", "additionalProperties": False,
  "required": ["name", "sub", "badge", "tagline", "texture", "points", "uses", "accent", "powder_look", "raw_props"],
  "properties": {
    "name": {"type": "string", "description": "clean product name, 2-4 words, e.g. 'Moringa Leaf Powder'. No marketing words (premium, pure, organic, wholesale, price)."},
    "sub": {"type": "string", "description": "short descriptor, max 5 words, e.g. 'Pure Drumstick Leaf Powder' or botanical/common name"},
    "badge": {"type": "string", "description": "max 5 words, e.g. 'Made from Real Moringa Leaves'"},
    "tagline": {"type": "string", "description": "warm premium brand line, max 5 words, no health claim"},
    "texture": {"type": "string", "description": "max 5 words describing look/texture"},
    "points": {"type": "array", "items": {"type": "string"}, "description": "exactly 4 short icon labels (max 4 words each). Use spec values given (mesh, shelf life) when present; include 'FSSAI Licensed' as the 4th."},
    "uses": {"type": "array", "items": {"type": "string"}, "description": "exactly 6 application captions, max 3 words each, real B2B applications for this product"},
    "accent": {"type": "string", "description": "pouch accent colour phrase matching the product, e.g. 'deep leaf-green', 'warm turmeric-yellow', 'rich tomato-red'"},
    "powder_look": {"type": "string", "description": "visual description of the product itself for an image prompt (colour, texture; powder/flakes/granules/leaves as appropriate)"},
    "raw_props": {"type": "string", "description": "the raw source ingredient(s) to show as props, visually accurate"},
  }}

RULES = ("You prepare data for premium branded product images of TradeNest Naturals (Indian manufacturer/exporter of natural food ingredients). "
         "Write polished English. NEVER use: organic, certified, ISO, HACCP, 100%, pure-claims about health, any health/medical/nutrition benefit "
         "(immunity, digestion, energy, detox, vitamins). Uses are applications only. Return JSON only.")

def build(p):
    slug_src = p["link"].rstrip("/").split("/")[-1]
    t = tacc.get(slug_src, {})
    title = clean(p["title"]["raw"])
    fields = {k: clean(t.get(k, "")) for k in ["name", "tagline", "processingMethod", "meshSize", "moistureContent", "shelfLife", "hsCode", "storageConditions"]}
    user = (f"Website title: {title}\nDisplay name: {fields['name']}\nCategory: {', '.join(cats.get(i,'') for i in p['product_category'])}\n"
            f"Summary: {clean(p['excerpt']['raw'])}\nSpecs: mesh={fields['meshSize']}, moisture={fields['moistureContent']}, shelf life={fields['shelfLife']}, processing={fields['processingMethod']}")
    body = {"model": "gpt-5.4-mini", "messages": [{"role": "system", "content": RULES}, {"role": "user", "content": user}],
            "response_format": {"type": "json_schema", "json_schema": {"name": "spec", "strict": True, "schema": SCHEMA}}}
    r = subprocess.run(["curl", "-s", "https://api.openai.com/v1/chat/completions", "-H", "Authorization: Bearer dummy",
                        "-H", "Content-Type: application/json", "-d", json.dumps(body)], capture_output=True, text=True)
    d = json.loads(json.loads(r.stdout)["choices"][0]["message"]["content"])
    slug = re.sub(r"[^a-z0-9]+", "-", d["name"].lower()).strip("-")
    def ok(v):
        return v and not BAD.search(v)
    specs = {}
    if ok(fields["processingMethod"]): specs["Processing"] = fields["processingMethod"]
    specs["Mesh Size"] = fields["meshSize"] if ok(fields["meshSize"]) else "Custom mesh on request"
    if ok(fields["moistureContent"]): specs["Moisture"] = fields["moistureContent"]
    if ok(fields["shelfLife"]): specs["Shelf Life"] = fields["shelfLife"]
    if ok(fields["hsCode"]): specs["HS Code"] = fields["hsCode"]
    specs["MOQ"] = "5 Kg"
    specs["Origin"] = "India"
    st = fields["storageConditions"]
    specs["Storage"] = (st.split(".")[0] if ok(st) else "Cool, dry place away from sunlight and moisture")[:70]
    spec = {"slug": slug, "en_name": d["name"], **d, "specs": specs, "website": p["link"], "wp_id": p["id"]}
    spec["points"] = spec["points"][:4]; spec["uses"] = spec["uses"][:6]
    path = os.path.join(SPECS, f"{slug}.json")
    if os.path.exists(path):
        path = os.path.join(SPECS, f"{slug}-{p['id']}.json"); spec["slug"] = f"{slug}-{p['id']}"
    json.dump(spec, open(path, "w"), ensure_ascii=False, indent=2)
    return spec["slug"]

done_ids = set()
for f in os.listdir(SPECS):
    if f.endswith(".json") and not f.endswith(".content.json"):
        done_ids.add(json.load(open(os.path.join(SPECS, f))).get("wp_id"))
todo = [p for p in products if p["id"] not in done_ids]
print("products", len(products), "todo", len(todo))
with cf.ThreadPoolExecutor(8) as ex:
    for f in cf.as_completed([ex.submit(build, p) for p in todo]):
        try:
            print("spec", f.result(), flush=True)
        except Exception as e:
            print("FAIL", e, flush=True)
