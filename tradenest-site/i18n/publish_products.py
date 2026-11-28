"""Publish translated product pages under /es/ /fr/ /de/ /ar/, update bridge config, relink translated category pages."""
import json, subprocess, sys, glob, os, concurrent.futures as cf
API = "https://tradenestnaturals.com/wp-json"
PARENT = {"es": 1404, "fr": 1405, "de": 1406, "ar": 1407}
BAN = ["organic", "orgánico", "organique", "biologique", "عضوي", " ISO ", "HACCP", "GMP", "COA", "100%", "halal", "حلال"]
def call(m, u, d=None):
    a = ["curl", "-s", "-X", m, API + u, "-H", "Content-Type: application/json"] + (["-d", json.dumps(d)] if d is not None else [])
    return json.loads(subprocess.run(a, capture_output=True, text=True).stdout or "{}")
prods = {str(p["id"]): p for p in json.load(open("products_en.json"))}
state = json.load(open("products_published.json")) if os.path.exists("products_published.json") else {}
todo = []
for lang in sys.argv[1:]:
    for f in sorted(glob.glob(f"out_products/{lang}/*.json")):
        pid = os.path.basename(f)[:-5]; d = json.load(open(f)); txt = d["content_html"]
        bad = [b for b in BAN if b.lower() in txt.lower()]
        if bad or prods[pid]["image"] not in txt:
            print("SKIP", lang, pid, bad); continue
        todo.append((lang, pid, d))
def pub(t):
    lang, pid, d = t; key = f"{lang}/{pid}"
    body = {"title": d["title"], "slug": d["slug"], "content": d["content_html"], "status": "publish", "parent": PARENT[lang], "excerpt": d["meta_description"]}
    old = state.get(key, {}).get("id")
    r = call("POST", "/wp/v2/pages" + (f"/{old}" if old else ""), body)
    call("POST", "/wp-abilities/v1/abilities/yoast-seo/update-post-seo-data/run", {"input": {"post_id": r["id"], "seo_title": d["seo_title"], "meta_description": d["meta_description"]}})
    return key, {"id": r["id"], "link": r["link"], "en": prods[pid]["url"]}
with cf.ThreadPoolExecutor(4) as ex:
    for key, v in ex.map(pub, todo):
        state[key] = v
json.dump(state, open("products_published.json", "w"), indent=1)
print("published", len(todo), "total", len(state))
# config: lang_pages + hreflang groups (keep home + category groups, rebuild product groups)
raw = call("GET", "/wp/v2/pages/1409?context=edit&_fields=content")["content"]["raw"]
cfg = json.loads(raw.split("<!-- tn-config -->")[1].split("<!-- /tn-config -->")[0])
for k, v in state.items():
    cfg["lang_pages"][str(v["id"])] = k.split("/")[0]
product_urls = {p["url"] for p in prods.values()}
groups = [g for g in cfg["hreflang"] if g.get("en") not in product_urls]
pg = {}
for k, v in state.items():
    pg.setdefault(v["en"], {"en": v["en"]})[k.split("/")[0]] = v["link"]
cfg["hreflang"] = groups + list(pg.values())
r = subprocess.run(["curl", "-s", "-o", "/dev/null", "-w", "%{http_code}", "-X", "POST", API + "/wp/v2/pages/1409", "-H", "Content-Type: application/json",
                    "-d", json.dumps({"content": "<!-- tn-config -->" + json.dumps(cfg, ensure_ascii=False) + "<!-- /tn-config -->"})], capture_output=True, text=True)
print("config", r.stdout, len(cfg["hreflang"]), "groups")
# relink translated category pages
cat_state = json.load(open("published.json"))
for ck, cv in cat_state.items():
    lang = ck.split("/")[0]
    if lang not in sys.argv[1:]:
        continue
    raw = call("GET", f"/wp/v2/pages/{cv['id']}?context=edit&_fields=content")["content"]["raw"]; n = 0
    for pid, p in prods.items():
        k = f"{lang}/{pid}"
        if k in state and f'href="{p["url"]}"' in raw:
            raw = raw.replace(f'href="{p["url"]}"', f'href="{state[k]["link"]}"'); n += 1
    if n:
        call("POST", f"/wp/v2/pages/{cv['id']}", {"content": raw})
    print("relinked", ck, n)
