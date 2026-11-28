"""Replace a product's spec card (tn-gallery-4) and spec PDF (tn-spec-pdf) on the website with the rebuilt files.
Uploads the new file, tags it, then deletes the old attachment. Usage: python3 site_swap_docs.py specs/<slug>.json [...]"""
import io, json, subprocess, sys
from PIL import Image
S = "https://tradenestnaturals.com/wp-json/wp/v2"

def call(args, data=None):
    r = subprocess.run(["curl", "-s"] + args, input=data, capture_output=True)
    try:
        return json.loads(r.stdout or b"{}")
    except ValueError:
        return {}

def upload(data, ctype, fname, meta):
    m = call(["-X", "POST", f"{S}/media", "-H", f"Content-Type: {ctype}",
              "-H", f'Content-Disposition: attachment; filename="{fname}"', "--data-binary", "@-"], data)
    if not m.get("id"):
        raise RuntimeError(f"upload failed {fname}: {str(m)[:200]}")
    call(["-X", "POST", f"{S}/media/{m['id']}", "-H", "Content-Type: application/json", "-d", json.dumps(meta)])
    return m["id"]

def run(specf):
    sp = json.load(open(specf)); pid = sp.get("wp_id"); slug = sp["slug"]; name = sp["en_name"]
    if not pid:
        return slug, "no wp_id"
    ex = call([f"{S}/media?parent={pid}&per_page=50&context=edit&_fields=id,description"])
    old = {}
    for m in ex if isinstance(ex, list) else []:
        old.setdefault(m["description"]["raw"], []).append(m["id"])
    res = []
    b = io.BytesIO(); Image.open(f"out/{slug}/06-spec-card.jpg").convert("RGB").save(b, "WEBP", quality=82, method=6)
    alt = f"{name} technical specifications"
    nid = upload(b.getvalue(), "image/webp", f"{slug}-technical-specifications.webp",
                 {"alt_text": alt, "title": alt, "post": pid, "description": "tn-gallery-4"})
    res.append(("card", nid))
    pdf = open(f"out/{slug}/TradeNest_{slug}.pdf", "rb").read()
    nid2 = upload(pdf, "application/pdf", f"tradenest-{slug}-spec-sheet.pdf",
                  {"title": f"{name} - Specification Sheet (PDF)", "post": pid, "description": "tn-spec-pdf"})
    res.append(("pdf", nid2))
    for tag in ("tn-gallery-4", "tn-spec-pdf"):
        for oid in old.get(tag, []):
            call(["-X", "DELETE", f"{S}/media/{oid}?force=true"])
            res.append(("deleted", oid))
    return slug, res

if __name__ == "__main__":
    for f in sys.argv[1:]:
        try:
            print(run(f), flush=True)
        except Exception as e:
            print("ERR", f, e, flush=True)
