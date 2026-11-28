"""Upload each product's branded spec PDF to WordPress, attached to the product (description 'tn-spec-pdf')."""
import json, subprocess, sys
S = "https://tradenestnaturals.com/wp-json/wp/v2"
def call(args):
    return json.loads(subprocess.run(["curl", "-s"] + args, capture_output=True).stdout or b"{}")
for f in sys.argv[1:]:
    s = json.load(open(f)); pid = s.get("wp_id"); slug = s["slug"]
    if not pid:
        continue
    ex = call([f"{S}/media?parent={pid}&per_page=50&context=edit&_fields=id,description,mime_type"])
    if any(m.get("description", {}).get("raw") == "tn-spec-pdf" for m in ex if isinstance(m, dict)):
        print("skip", pid); continue
    m = call(["-X", "POST", f"{S}/media", "-H", "Content-Type: application/pdf", "-H", f'Content-Disposition: attachment; filename="tradenest-{slug}-spec-sheet.pdf"', "--data-binary", f"@out/{slug}/TradeNest_{slug}.pdf"])
    call(["-X", "POST", f"{S}/media/{m['id']}", "-H", "Content-Type: application/json", "-d", json.dumps({"title": f"{s['en_name']} - Specification Sheet (PDF)", "post": pid, "description": "tn-spec-pdf"})])
    print(pid, m.get("id"), m.get("source_url"), flush=True)
