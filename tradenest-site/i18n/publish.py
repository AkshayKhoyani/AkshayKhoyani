"""Publish translated category pages as children of /es/ /fr/ /de/ /ar/ and update bridge config (lang + hreflang)."""
import json, subprocess, sys, glob, os, re
S = "https://tradenestnaturals.com/wp-json/wp/v2"
PARENT = {"es": 1404, "fr": 1405, "de": 1406, "ar": 1407}
def c(m, u, d=None):
    a = ["curl", "-s", "-X", m, S + u, "-H", "Content-Type: application/json"] + (["-d", json.dumps(d)] if d is not None else [])
    return json.loads(subprocess.run(a, capture_output=True, text=True).stdout or "{}")
cats = {x["slug"]: x for x in json.load(open("categories_en.json"))}
state = json.load(open("published.json")) if os.path.exists("published.json") else {}
for lang in sys.argv[1:]:
    for f in sorted(glob.glob(f"out/{lang}/*.json")):
        en_slug = os.path.basename(f)[:-5]; d = json.load(open(f))
        key = f"{lang}/{en_slug}"
        body = {"title": d["title"], "slug": d["slug"], "content": d["content_html"], "status": "publish", "parent": PARENT[lang], "excerpt": d["meta_description"]}
        pid = state.get(key, {}).get("id")
        r = c("POST", "/pages" + (f"/{pid}" if pid else ""), body)
        c("POST", "/../../wp-abilities/v1/abilities/yoast-seo/update-post-seo-data/run".replace("/wp/v2/../../", "/"), None) if False else None
        subprocess.run(["curl", "-s", "-o", "/dev/null", "-X", "POST", "https://tradenestnaturals.com/wp-json/wp-abilities/v1/abilities/yoast-seo/update-post-seo-data/run",
                        "-H", "Content-Type: application/json", "-d", json.dumps({"input": {"post_id": r["id"], "seo_title": d["seo_title"], "meta_description": d["meta_description"]}})])
        state[key] = {"id": r["id"], "link": r["link"], "en": cats[en_slug]["url"]}
        print(key, r.get("id"), r.get("link"))
json.dump(state, open("published.json", "w"), indent=1)
# config update
P = "/pages/1409"
raw = c("GET", P + "?context=edit&_fields=content")["content"]["raw"]
cfg = json.loads(raw.split("<!-- tn-config -->")[1].split("<!-- /tn-config -->")[0])
for k, v in state.items():
    cfg["lang_pages"][str(v["id"])] = k.split("/")[0]
groups = {}
for k, v in state.items():
    lang, en_slug = k.split("/")
    groups.setdefault(v["en"], {"en": v["en"]})[lang] = v["link"]
home = [g for g in cfg["hreflang"] if g.get("en") == "https://tradenestnaturals.com/"]
cfg["hreflang"] = home + list(groups.values())
r = subprocess.run(["curl", "-s", "-o", "/dev/null", "-w", "%{http_code}", "-X", "POST", S + P, "-H", "Content-Type: application/json",
                    "-d", json.dumps({"content": "<!-- tn-config -->" + json.dumps(cfg, ensure_ascii=False) + "<!-- /tn-config -->"})], capture_output=True, text=True)
print("config", r.stdout, len(cfg["hreflang"]), "hreflang groups")
