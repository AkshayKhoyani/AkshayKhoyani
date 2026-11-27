"""Employment Junction WordPress publisher.

Turns a job spec (JSON) into a post in the site's house format, renders a featured
image, uploads it, creates the post and fills Rank Math SEO fields.

Auth: the session's network proxy injects the WordPress Application Password for
employmentjunction.in, so no credentials live in this code.

Usage:
  python3 engine/wp.py jobs/<slug>.json [--status draft|publish] [--update <post_id>]
"""
import argparse
import html
import json
import os
import subprocess
import sys
import urllib.request

SITE = "https://employmentjunction.in"
API = SITE + "/wp-json"
HERE = os.path.dirname(os.path.abspath(__file__))

TH = 'style="padding: 10px; border: 1px solid #ddd;"'
TD = 'style="padding: 10px; border: 1px solid #ddd;"'


def req(method, path, data=None, headers=None, raw=None):
    url = path if path.startswith("http") else API + path
    body = raw if raw is not None else (json.dumps(data).encode() if data is not None else None)
    h = {"Content-Type": "application/json", "User-Agent": "EJ-Engine/1.0"}
    h.update(headers or {})
    r = urllib.request.Request(url, data=body, method=method, headers=h)
    try:
        with urllib.request.urlopen(r, timeout=120) as resp:
            return json.loads(resp.read() or b"null")
    except urllib.error.HTTPError as e:
        sys.exit(f"{method} {url} -> {e.code}: {e.read()[:400]!r}")


e = html.escape


def render(s):
    """Job spec -> post HTML matching the site's existing posts."""
    # no H1 here: the theme prints the post title as the page's only H1
    out = []
    out.append("<p>" + "<br />".join(f"<strong>{e(k)}:</strong> {e(v)}" for k, v in s["summary"]) + "</p>")
    out += [f"<p>{p}</p>" for p in s["intro"]]
    rows = [f'<tr style="background: #0b5ed7; color: #fff;"><th {TH}>Particular</th><th {TH}>Details</th></tr>']
    for i, (k, v) in enumerate(s["table"]):
        bg = ' style="background: #f6f6f6;"' if i % 2 else ""
        rows.append(f"<tr{bg}><td {TD}><b>{e(k)}</b></td><td {TD}>{e(v)}</td></tr>")
    out.append('<table style="width: 100%; border-collapse: collapse; font-size: 16px;"><tbody>' + "".join(rows) + "</tbody></table>")
    for sec in s["sections"]:
        out.append(f"<h2>{e(sec['h'])}</h2>")
        for p in sec.get("p", []):
            out.append(f"<p>{p}</p>")
        if sec.get("table"):
            th = sec.get("th", ["Particular", "Details"])
            rows = [f'<tr style="background: #0b5ed7; color: #fff;">' + "".join(f"<th {TH}>{e(x)}</th>" for x in th) + "</tr>"]
            for i, r in enumerate(sec["table"]):
                bg = ' style="background: #f6f6f6;"' if i % 2 else ""
                rows.append(f"<tr{bg}>" + "".join(f"<td {TD}>{'<b>' + e(c) + '</b>' if j == 0 else e(c)}</td>" for j, c in enumerate(r)) + "</tr>")
            out.append('<table style="width: 100%; border-collapse: collapse; font-size: 16px;"><tbody>' + "".join(rows) + "</tbody></table>")
        if sec.get("ul"):
            out.append("<ul>" + "".join(f"<li>{x}</li>" for x in sec["ul"]) + "</ul>")
        if sec.get("ol"):
            out.append("<ol>" + "".join(f"<li>{x}</li>" for x in sec["ol"]) + "</ol>")
        for p in sec.get("after", []):
            out.append(f"<p>{p}</p>")
    if s.get("links"):
        out.append("<h2>Important Links</h2>")
        rows = [f'<tr style="background: #0b5ed7; color: #fff;"><th {TH}>Link</th><th {TH}>URL</th></tr>']
        for k, v in s["links"]:
            rows.append(f'<tr><td {TD}><b>{e(k)}</b></td><td {TD}><a href="{e(v)}" target="_blank" rel="noopener nofollow">{e(v)}</a></td></tr>')
        out.append('<table style="width: 100%; border-collapse: collapse; font-size: 16px;"><tbody>' + "".join(rows) + "</tbody></table>")
    out.append(f"<h2>{e(s['short'])} – Frequently Asked Questions (FAQ)</h2>")
    for q, a in s["faq"]:
        out.append(f"<h3>{e(q)}</h3><p>{a}</p>")
    out.append("<h2>Final Words</h2>")
    out += [f"<p>{p}</p>" for p in s["final"]]
    out.append('<p><em>Disclaimer: Employment Junction is an independent information portal and is not affiliated with any government '
               'body. Always verify details from the official notification before applying. We never charge money for any job.</em></p>')
    html_out = "\n".join(out)
    # make every Instagram handle mention clickable
    ig = '<a href="https://www.instagram.com/employmentjunction.in/" target="_blank" rel="noopener">@employmentjunction.in</a>'
    return html_out.replace("<strong>@employmentjunction.in</strong>", "<strong>" + ig + "</strong>")


CHAR_DIR = os.path.join(HERE, "assets", "characters")
# keyword in title/tag/org -> character (first match wins); falls back by post type
CHAR_RULES = [
    (("engineer", " je ", "je ", "junior engineer", "aee", "technical", "electrical", "civil"), "engineer"),
    (("police", "constable", "lokrakshak", "lrd", "si ", "sub inspector", "capf", "home guard", "jail", "fireman", "forest guard"), "police"),
    (("army", "navy", "air force", "agniveer", "defence", "nda", "cds", "bsf", "crpf", "itbp", "ssb", "cisf"), "defence"),
    (("apprentice", "iti", "trade"), "apprentice"),
    (("railway", "rrb", "rrc", "loco", "station master"), "railway"),
    (("teacher", "tgt", "pgt", "prt", "lecturer", "professor", "faculty", "tet", "kvs", "nvs"), "teacher"),
    (("nurse", "nursing", "medical", "doctor", "pharmacist", "aiims", "hospital", "health", "paramedical"), "medical"),
    (("bank", "sbi", "ibps", "rbi", "nabard", "po ", "clerk", "exim", "sidbi"), "bank"),
]
TYPE_CHAR = {"ej_result": "student_result", "ej_admit_card": "admit_card", "ej_answer_key": "answer_key", "ej_syllabus": "admit_card"}
THEME = {"student_result": "green", "admit_card": "sky", "answer_key": "violet", "medical": "rose", "defence": "green"}


def pick_character(s):
    im = s.get("image", {})
    if im.get("character"):
        return im["character"]
    ptype = s.get("type", "ej_job")
    if ptype in TYPE_CHAR:
        return TYPE_CHAR[ptype]
    text = " " + " ".join([s.get("title", ""), im.get("tag", ""), im.get("org", "")]).lower() + " "
    for words, ch in CHAR_RULES:
        if any(w in text for w in words) and os.path.exists(os.path.join(CHAR_DIR, ch + ".webp")):
            return ch
    return "office"


def featured_image(s, path):
    """Render a 1536x1024 premium featured image (3D character + details) as JPEG q82."""
    data = dict(s["image"])
    ch = pick_character(s)
    src = os.path.join(CHAR_DIR, ch + ".webp")
    if not os.path.exists(src):
        src = os.path.join(CHAR_DIR, "office.webp")
    data["character_src"] = "file://" + src
    data.setdefault("theme", THEME.get(ch, "gold"))
    # job / admit card / syllabus pages link to a free mock test -> show the ribbon
    data.setdefault("mock", s.get("type", "ej_job") in ("ej_job", "ej_admit_card", "ej_syllabus", "ej_answer_key"))
    tpl = open(os.path.join(HERE, "featured.html")).read()
    page = tpl.replace("__DATA__", json.dumps(data))
    tmp = path + ".html"
    open(tmp, "w").write(page)
    subprocess.run(["node", "-e", f"""
const {{ chromium }} = require('playwright');
(async () => {{ const b = await chromium.launch(); const p = await b.newPage({{ viewport: {{ width: 1536, height: 1024 }} }});
await p.goto('file://{tmp}'); await p.evaluate(() => document.fonts.ready);
await p.waitForFunction(() => {{ const i = document.getElementById('char'); return !i.src || i.complete; }});
await p.screenshot({{ path: '{path}', type: 'jpeg', quality: 84 }}); await b.close(); }})();
"""], check=True)
    os.remove(tmp)


def upload(path, title, alt):
    name = os.path.basename(path)
    m = req("POST", "/wp/v2/media", raw=open(path, "rb").read(),
            headers={"Content-Type": "image/jpeg" if path.endswith(".jpg") else "image/png", "Content-Disposition": f'attachment; filename="{name}"'})
    req("POST", f"/wp/v2/media/{m['id']}", {"title": title, "alt_text": alt})
    return m["id"]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("spec")
    ap.add_argument("--status", default="draft", choices=["draft", "publish"])
    ap.add_argument("--update", type=int)
    a = ap.parse_args()
    s = json.load(open(a.spec))
    out_dir = os.path.join(os.path.dirname(os.path.abspath(a.spec)), "out")
    os.makedirs(out_dir, exist_ok=True)

    img = os.path.join(out_dir, s["slug"] + ".jpg")
    featured_image(s, img)
    media_id = upload(img, s["title"], s["title"])

    content = render(s)
    open(os.path.join(out_dir, s["slug"] + ".html"), "w").write(content)
    # content type: ej_job (default, emits JobPosting schema), ej_result, ej_admit_card, ej_answer_key, ej_syllabus, posts
    ptype = s.get("type", "ej_job")
    post = {"title": s["title"], "slug": s["slug"], "content": content, "status": a.status,
            "featured_media": media_id, "excerpt": s.get("schema_description", s["seo"]["description"]),
            # the site's own SEO plugin (employmentjunction-seo-suite)
            "meta": {"ej_seo_title": s["seo"]["title"].replace(" %sep% %sitename%", " | Employment Junction"),
                     "ej_seo_desc": s["seo"]["description"], "ej_focus_kw": s["seo"]["keyword"]}}
    if ptype == "posts":
        post["categories"] = s["categories"]
    # JobPosting fields read by the site's employmentjunction-seo-suite plugin
    for k, v in s.get("job", {}).items():
        post["meta"]["ej_" + k] = v
    p = req("POST", f"/wp/v2/{ptype}/{a.update}" if a.update else f"/wp/v2/{ptype}", post)
    req("POST", "/rankmath/v1/updateMeta", {"objectType": "post", "objectID": p["id"], "meta": {
        "rank_math_title": s["seo"]["title"], "rank_math_description": s["seo"]["description"],
        "rank_math_focus_keyword": s["seo"]["keyword"]}})
    if p["status"] == "publish":
        # IndexNow (Bing, Yandex, Seznam, Naver) via Rank Math – instant crawl request for the new/updated URL
        try:
            req("POST", "/rankmath/v1/in/submitUrls", {"urls": p["link"]})
        except SystemExit as err:
            print("IndexNow submit failed:", err)
    print(json.dumps({"id": p["id"], "status": p["status"], "link": p["link"], "media": media_id}))


if __name__ == "__main__":
    main()
