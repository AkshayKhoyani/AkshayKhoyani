"""Generate Hindi catalog content for one product from its website page (facts only).

Usage: python3 gen_content.py spec.json  -> writes content JSON next to spec (specs/<slug>.content.json)
"""
import html, json, re, subprocess, sys

spec_path = sys.argv[1]
spec = json.load(open(spec_path))

def get(url):
    return json.loads(subprocess.run(["curl", "-s", url], capture_output=True, text=True).stdout)

p = get(f"https://tradenestnaturals.com/wp-json/wp/v2/products/{spec['wp_id']}?context=edit&_fields=title,content,excerpt")
text = html.unescape(re.sub(r"<[^>]+>", " ", p["content"]["raw"]))
text = re.sub(r"\s+", " ", text)[:9000]

RULES = """You write premium Hindi (Devanagari) B2B product-catalogue copy for TradeNest Naturals, an Indian manufacturer & exporter.
Audience: Indian B2B buyers on IndiaMART (manufacturers, brands, distributors, exporters). Use elegant, natural, professional Hindi written fully in Devanagari script.
Write trade words in Devanagari transliteration (e.g. प्राइवेट लेबल, मेश, बल्क, पैकिंग, सैंपल, एक्सपोर्ट डॉक्यूमेंटेशन, फॉर्मुलेशन). Only these may stay in
Latin letters: MOQ, FSSAI, IEC, HS, OEM, HDPE, kg, %. Never mix English words in Latin script into Hindi sentences.
The tagline must be a short, warm, premium Hindi brand line (max 8 words) like 'प्रकृति की हरियाली, हर चम्मच में'.
STRICT FACT RULES:
- Use ONLY facts in the website text below plus these company facts: FSSAI-licensed manufacturer, IEC-registered exporter, MOQ 5 Kg, OEM & private
  label, bulk supply, custom mesh/packaging on request, samples on request, export documentation support, packaging 25 kg bags/HDPE containers,
  5-10 kg bags, small private-label pouches & jars, 6-step process (sourcing, cleaning & sorting, controlled drying, grinding & sieving,
  quality inspection, packing & dispatch).
- NEVER mention: organic, ISO, HACCP, GMP, APEDA, Halal, Kosher, FDA, '100%', 'certified', lab results, prices, clients, countries exported to,
  or ANY health/medical/nutrition benefit claim (no immunity, digestion, energy, cure, detox, vitamins claims). Describe uses only as applications.
Return JSON only."""

schema = {
    "type": "object", "additionalProperties": False,
    "required": ["tagline", "overview", "highlights", "applications", "industries", "packaging", "faqs"],
    "properties": {
        "tagline": {"type": "string", "description": "one short premium Hindi line"},
        "overview": {"type": "array", "items": {"type": "string"}, "description": "2 Hindi paragraphs, 50-70 words each"},
        "highlights": {"type": "array", "items": {"type": "string"}, "description": "6 short Hindi product highlights (attributes, not health)"},
        "applications": {"type": "array", "items": {"type": "string"}, "description": "8 Hindi application areas"},
        "industries": {"type": "array", "items": {"type": "string"}, "description": "6 Hindi buyer industries"},
        "packaging": {"type": "array", "items": {"type": "string"}, "description": "4 Hindi packaging options"},
        "faqs": {"type": "array", "items": {"type": "object", "additionalProperties": False, "required": ["q", "a"],
                 "properties": {"q": {"type": "string"}, "a": {"type": "string"}}}, "description": "6 Hindi B2B FAQs"},
    },
}

body = {
    "model": "gpt-5.4-mini",
    "messages": [{"role": "system", "content": RULES},
                 {"role": "user", "content": f"Product: {spec['en_name']} ({spec['hi_name']}). Specs: {json.dumps(spec['specs'], ensure_ascii=False)}\n\nWEBSITE TEXT:\n{text}"}],
    "response_format": {"type": "json_schema", "json_schema": {"name": "catalog", "strict": True, "schema": schema}},
}
r = subprocess.run(["curl", "-s", "https://api.openai.com/v1/chat/completions", "-H", "Authorization: Bearer dummy",
                    "-H", "Content-Type: application/json", "-d", json.dumps(body)], capture_output=True, text=True)
d = json.loads(r.stdout)
content = json.loads(d["choices"][0]["message"]["content"])
BAD = re.compile(r"ऑर्गेनिक|organic|ISO|HACCP|GMP|100%|सर्टिफाइड|certified|प्रमाणित|इम्यून|रोग|पाचन|ऊर्जा|विटामिन|डिटॉक्स|इलाज", re.I)
flat = json.dumps(content, ensure_ascii=False)
hits = BAD.findall(flat)
out = spec_path.replace(".json", ".content.json")
json.dump(content, open(out, "w"), ensure_ascii=False, indent=1)
print(out, "| flagged words:", hits)
