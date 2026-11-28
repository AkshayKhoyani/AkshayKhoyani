"""Upload IndiaMART kit images to the website: 01 becomes the featured image, 03/04/05/06 become the gallery.
Gallery images are attached to the product and tagged with description 'tn-gallery-N' (read by the bridge mu-plugin).
Usage: python3 site_images.py specs/<slug>.json [...]"""
import io, json, subprocess, sys
from PIL import Image
S = "https://tradenestnaturals.com/wp-json/wp/v2"
PLAN = [("01-hero-pouch.jpg", "featured", "{n} bulk supplier and exporter from India - Tradenest Naturals", "{s}-bulk-supplier-india-tradenest"),
        ("03-closeup.jpg", 1, "{n} close-up texture", "{s}-texture-closeup"),
        ("04-bulk.jpg", 2, "{n} bulk and private label packing", "{s}-bulk-private-label-packing"),
        ("05-uses.jpg", 3, "{n} applications and uses", "{s}-applications-uses"),
        ("06-spec-card.jpg", 4, "{n} technical specifications", "{s}-technical-specifications")]

def call(args, data=None):
    r = subprocess.run(["curl", "-s"] + args, input=data, capture_output=True)
    return json.loads(r.stdout or b"{}")

def run(specf):
    sp = json.load(open(specf)); pid = sp["wp_id"]; name = sp["en_name"]; slug = sp["slug"]
    # skip if already done
    ex = call([f"{S}/media?parent={pid}&per_page=50&context=edit&_fields=id,description.raw"])
    done = {m["description"]["raw"] for m in ex if isinstance(m, dict) and m.get("description", {}).get("raw", "").startswith("tn-")}
    out = []
    for fn, role, alt, base in PLAN:
        tag = "tn-featured" if role == "featured" else f"tn-gallery-{role}"
        if tag in done:
            continue
        im = Image.open(f"out/{slug}/{fn}").convert("RGB")
        b = io.BytesIO(); im.save(b, "WEBP", quality=82, method=6); data = b.getvalue()
        m = call(["-X", "POST", f"{S}/media", "-H", "Content-Type: image/webp",
                  "-H", f'Content-Disposition: attachment; filename="{base.format(s=slug)}.webp"', "--data-binary", "@-"], data)
        mid = m["id"]
        call(["-X", "POST", f"{S}/media/{mid}", "-H", "Content-Type: application/json", "-d",
              json.dumps({"alt_text": alt.format(n=name), "title": alt.format(n=name), "post": pid, "description": tag})])
        if role == "featured":
            call(["-X", "POST", f"{S}/products/{pid}", "-H", "Content-Type: application/json", "-d", json.dumps({"featured_media": mid})])
        out.append((fn, mid, len(data) // 1024))
    return pid, slug, out

if __name__ == "__main__":
    for f in sys.argv[1:]:
        try:
            print(run(f), flush=True)
        except Exception as e:
            print("ERR", f, repr(e), flush=True)
