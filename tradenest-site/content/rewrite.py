"""Clean product page copy on tradenestnaturals.com: remove unverifiable claims, keep SEO structure/keywords,
align specs with the catalog spec files. Saves to out/<id>.json, then (with --post) updates WordPress.
Usage: python3 rewrite.py [--post] <wp_id> ..."""
import json, os, re, subprocess, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "catalog"))
import gemini
S = "https://tradenestnaturals.com/wp-json/wp/v2"
CAT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "catalog", "specs")
SPECS = {}
for f in os.listdir(CAT):
    if f.endswith(".json") and not f.endswith(".content.json"):
        s = json.load(open(os.path.join(CAT, f))); SPECS[s["wp_id"]] = s

BANNED = r"\b(COA|CoA|Certificates? of Analysis|heavy metals?|pesticides?|microbial|microbiolog\w*|Salmonella|E\. ?coli|aflatoxin|Non-GMO|GMO|GMP|ISO|HACCP|BRC\w*|organic|APEDA|Spices Board|FDA|USDA|Halal|Kosher|lab[- ]tested|laboratory|100\s?%|state-of-the-art|world-class|cutting-edge|unmatched|uncompromising|premier|leading|immunit\w*|detox\w*|cure[sd]?|heal\w*|anti-?inflammat\w*|blood sugar|diabet\w*|disease|Welcome to)\b"
SYSTEM = """You edit B2B product page copy for Tradenest Naturals, an Indian manufacturer-exporter of food ingredient powders (Surat, India).
Facts you may state: FSSAI licensed food business; IEC registered exporter; export documentation support; MOQ 5 Kg; samples on request; OEM and private label packing; ships worldwide from India.
Rewrite the given fields so they are accurate, professional and credible for importers in the USA, UK, Canada and Europe. Rules:
1. Keep the same HTML structure (same headings h2/h3, paragraphs, lists) and roughly the same length (within 15%). Keep every <strong> keyword phrase (you may fix grammar inside it). Keep FAQ questions if present.
2. Never claim or imply: Certificate of Analysis/COA, lab testing or lab reports, heavy metal / pesticide / microbial / aflatoxin testing, Non-GMO, GMP, ISO, HACCP, organic, APEDA or Spices Board registration, FDA, Halal, Kosher, '100%' anything. Where documents or testing come up, say a product specification sheet is shared with every quotation and third-party lab testing can be arranged on request at the buyer's cost.
3. No health or medical claims (immunity, detox, healing, cures, blood sugar, digestion benefits, disease). You may say an ingredient is traditionally used in Ayurvedic or herbal formulations, without stating effects.
4. No hype words: state-of-the-art, world-class, cutting-edge, unmatched, uncompromising, premier, leading, best. Do not start with 'Welcome to'. Open with what the product is and who buys it.
5. Do not claim we own farms or control farms. Say raw material is carefully selected and sourced from trusted growers.
6. Specifications must match the SPEC FACTS exactly (processing method, mesh, moisture, shelf life, MOQ). If the text mentions another mesh/moisture/shelf life value, correct it. Do not invent new numbers (no lead-time days, no prices, no capacities).
7. Brand name is always written 'Tradenest Naturals'. Plain international English, short sentences, no em dashes.
Return JSON with the edited fields only."""

SCHEMA = {"type": "object", "required": ["content_html", "excerpt", "tagline", "extended_description"],
          "properties": {"content_html": {"type": "string"}, "excerpt": {"type": "string"},
                         "tagline": {"type": "string"}, "extended_description": {"type": "string"}}}

def get(pid):
    r = subprocess.run(["curl", "-s", f"{S}/products/{pid}?context=edit&_fields=id,title,content,excerpt,meta"], capture_output=True, text=True)
    return json.loads(r.stdout)

def facts(pid):
    s = SPECS.get(pid)
    if not s:
        return "Not available: keep existing values but remove claims."
    sp = s["specs"]
    return json.dumps({"product": s["en_name"], "processing": sp.get("Processing"), "mesh": sp.get("Mesh Size") or sp.get("Mesh") or sp.get("Cut Size") or sp.get("Size"),
                       "moisture": sp.get("Moisture"), "shelf_life": sp.get("Shelf Life"), "hs_code": sp.get("HS Code"), "moq": "5 Kg"}, ensure_ascii=False)

def check(orig, new):
    probs = []
    txt = re.sub(r"<[^>]+>", " ", new["content_html"] + " " + new["excerpt"] + " " + new["tagline"] + " " + new["extended_description"])
    # allowed: 'lab testing can be arranged on request' phrasing
    t2 = re.sub(r"(third-party )?lab(oratory)? testing can be arranged[^.]*\.", "", txt, flags=re.I)
    bad = sorted(set(m.group(0) for m in re.finditer(BANNED, t2, re.I)))
    if bad: probs.append(f"banned: {bad}")
    lo, ln = len(re.sub(r"<[^>]+>", "", orig)), len(re.sub(r"<[^>]+>", "", new["content_html"]))
    if not (0.75 * lo <= ln <= 1.3 * lo): probs.append(f"length {lo}->{ln}")
    for tag in ("h2", "h3", "ul", "li"):
        a, b = len(re.findall(f"<{tag}[ >]", orig)), len(re.findall(f"<{tag}[ >]", new["content_html"]))
        if abs(a - b) > max(1, a // 5): probs.append(f"{tag} {a}->{b}")
    so = re.findall(r"<strong>(.*?)</strong>", orig); sn = " ".join(re.findall(r"<strong>(.*?)</strong>", new["content_html"])).lower()
    kept = sum(1 for k in so if k.lower()[:25] in sn)
    if so and kept < 0.7 * len(so): probs.append(f"keywords {kept}/{len(so)}")
    return probs

def run(pid, post):
    path = f"out/{pid}.json"
    p = get(pid)
    if os.path.exists(path):
        new = json.load(open(path))
    else:
        m = p["meta"]
        src = {"content_html": p["content"]["raw"], "excerpt": p["excerpt"]["raw"], "tagline": m.get("tn_tagline", ""),
               "extended_description": m.get("tn_extended_description", "")}
        new, probs = None, None
        for attempt in range(3):
            user = f"SPEC FACTS: {facts(pid)}\n\nFIELDS (JSON):\n{json.dumps(src, ensure_ascii=False)}"
            if probs: user += f"\n\nYour previous attempt had these problems, fix them: {probs}"
            new = gemini.json_call(SYSTEM, user, SCHEMA)
            probs = check(src["content_html"], new)
            if not probs: break
        new["_problems"] = probs
        json.dump(new, open(path, "w"), indent=1, ensure_ascii=False)
    if post and not new.get("_problems"):
        body = {"content": new["content_html"], "excerpt": new["excerpt"],
                "meta": {"tn_tagline": new["tagline"], "tn_extended_description": new["extended_description"], "tn_purity": ""}}
        r = subprocess.run(["curl", "-s", "-o", "/dev/null", "-w", "%{http_code}", "-X", "POST", f"{S}/products/{pid}",
                            "-H", "Content-Type: application/json", "-d", json.dumps(body)], capture_output=True, text=True)
        return pid, "posted", r.stdout
    return pid, "saved", new.get("_problems")

def emit(pid):
    p = get(pid); m = p["meta"]
    src = {"content_html": p["content"]["raw"], "excerpt": p["excerpt"]["raw"], "tagline": m.get("tn_tagline", ""),
           "extended_description": m.get("tn_extended_description", "")}
    os.makedirs("src", exist_ok=True)
    json.dump(src, open(f"src/{pid}.json", "w"), indent=1, ensure_ascii=False)
    return f"src/{pid}.json  SPEC FACTS: {facts(pid)}"

if __name__ == "__main__" and sys.argv[1:2] == ["--emit"]:
    for a in sys.argv[2:]: print(a, emit(int(a)))
    sys.exit(0)
if __name__ == "__main__" and sys.argv[1:2] == ["--check"]:
    for a in sys.argv[2:]:
        src = json.load(open(f"src/{a}.json")); new = json.load(open(f"out/{a}.json"))
        print(a, check(src["content_html"], new) or "OK")
    sys.exit(0)
if __name__ == "__main__":
    os.makedirs("out", exist_ok=True)
    post = "--post" in sys.argv
    for a in [x for x in sys.argv[1:] if x != "--post"]:
        try:
            print(run(int(a), post), flush=True)
        except Exception as e:
            print("ERR", a, repr(e)[:200], flush=True)
