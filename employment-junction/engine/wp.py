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


PCSS = (".wrap.layout>div{min-width:0}.ejp{contain:inline-size;max-width:100%;font-size:17px;line-height:1.7}"
        ".ejp h2{position:relative;margin:34px 0 14px!important;padding:12px 16px 12px 18px!important;border-radius:12px;background:linear-gradient(90deg,#eef4ff,#fff);border-left:6px solid #0b3d91;color:#0b2a66!important;font-size:24px!important;line-height:1.3}"
        ".ejp h3{color:#0b3d91!important;margin:20px 0 6px!important}"
        ".ejp-t{width:100%;border-collapse:separate!important;border-spacing:0;border-radius:14px;overflow:hidden;box-shadow:0 6px 20px rgba(11,61,145,.10);border:1px solid #dbe4f3;margin:10px 0 18px;font-size:16px}"
        ".ejp-t th{background:linear-gradient(90deg,#0b3d91,#1554c0);color:#fff;text-align:left;padding:12px 14px}"
        ".ejp-t td{padding:11px 14px;border-top:1px solid #e8eef8;vertical-align:top;overflow-wrap:anywhere}.ejp-t tr:nth-child(even) td{background:#f6f9ff}"
        ".ejp-t td:first-child{font-weight:700;color:#0f172a;width:38%}"
        ".ejp-sum{border-radius:20px;padding:3px;background:linear-gradient(120deg,#ffb703,#ff4d6d,#1554c0);margin:8px 0 22px;box-shadow:0 12px 30px rgba(11,61,145,.18)}"
        ".ejp-sum>div{border-radius:17px;background:linear-gradient(160deg,#0b2a66,#071a3d);color:#fff;padding:20px}"
        ".ejp-sum h4{margin:0 0 14px!important;color:#ffd166!important;font-size:20px;letter-spacing:.3px}"
        ".ejp-g{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}"
        ".ejp-g div{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.16);border-radius:12px;padding:10px 12px}"
        ".ejp-g small{display:block;color:#9fb3d1;font-size:12px;text-transform:uppercase;letter-spacing:.8px;font-weight:700}.ejp-g b{color:#fff;font-size:16px;overflow-wrap:anywhere}"
        ".ejp-g .hot{background:rgba(239,68,68,.22);border-color:#f87171}"
        ".ejp-bt{display:flex;flex-wrap:wrap;gap:10px;margin-top:16px}"
        ".ejp-btn{display:inline-flex;align-items:center;gap:8px;font-weight:900;font-size:16px;padding:12px 18px;border-radius:12px;text-decoration:none!important;color:#fff!important;box-shadow:0 6px 16px rgba(0,0,0,.18)}"
        ".ejp-btn.ap{background:linear-gradient(180deg,#22c55e,#15803d)}.ejp-btn.nt{background:linear-gradient(180deg,#3b82f6,#1d4ed8)}"
        ".ejp-btn.wa{background:#25d366}.ejp-btn.tg{background:#229ed9}.ejp-btn.ow{background:linear-gradient(180deg,#f59e0b,#d97706)}"
        ".ejp-note{background:#fffbeb;border:1px solid #fde68a;border-left:6px solid #f59e0b;border-radius:12px;padding:12px 16px;color:#78350f;font-size:15px}"
        ".ejp-share{text-align:center;border:2px dashed #c7d2fe;border-radius:16px;padding:16px;margin:24px 0;background:#f8faff}"
        ".ejp-share p{margin:0 0 10px!important;font-weight:800;color:#0b2a66}")
ICONS = {"vacancy": "📊", "eligib": "🎓", "qualif": "🎓", "age": "🎂", "fee": "💰", "date": "📅", "selection": "✅", "apply": "📝", "salary": "💵",
         "pay": "💵", "link": "🔗", "syllabus": "📚", "pattern": "📚", "result": "🏆", "download": "⬇️", "cut": "📈", "answer": "🔑", "faq": "❓"}


def _icon(h):
    hl = h.lower()
    for k, v in ICONS.items():
        if k in hl:
            return v + " "
    return "📌 "


def _table(head, rows):
    trs = "<tr>" + "".join(f"<th>{e(x)}</th>" for x in head) + "</tr>"
    for r in rows:
        trs += "<tr>" + "".join(f"<td>{c if str(c).startswith('<a ') else e(c)}</td>" for c in r) + "</tr>"
    return f'<table class="ejp-t"><tbody>{trs}</tbody></table>'


TILE_ORDER = ["total posts", "posts", "vacanc", "qualif", "eligib", "age", "fee", "salary", "pay", "start", "last date", "exam date", "result date", "release", "mode", "website"]


def pick_tiles(rows, n=6):
    """The 6 facts readers look for first, in a fixed order; last date always included."""
    picked = []
    for key in TILE_ORDER:
        for k, v in rows:
            if key in k.lower() and (k, v) not in picked and len(v) < 90:
                picked.append((k, v)); break
    last = [r for r in picked if "last" in r[0].lower()]
    out = [r for r in picked if r not in last][: n - len(last)] + last
    return out or rows[:n]


def render(s):
    """Job spec -> premium post HTML (no H1: the theme prints the title as the page's only H1)."""
    links = s.get("links", [])
    apply = next((v for k, v in links if "apply" in k.lower()), links[0][1] if links else "")
    notif = next((v for k, v in links if "notif" in k.lower() or "pdf" in k.lower()), "")
    slug = s.get("slug", "")
    ptype = s.get("type", "ej_job")
    base = {"ej_job": "jobs", "ej_admit_card": "admit-card", "ej_result": "results", "ej_answer_key": "answer-key",
            "ej_syllabus": "syllabus", "ej_schedule": "exam-dates", "posts": ""}.get(ptype, "jobs")
    url = f"{SITE}/{base + '/' if base else ''}{slug}/"
    from urllib.parse import quote
    wa = "https://wa.me/?text=" + quote(f"{s['title']}\n👉 {url}")
    tg = "https://t.me/share/url?url=" + quote(url) + "&text=" + quote(s["title"])
    out = [f"<style>{PCSS}</style>", '<div class="ejp">']
    # quick summary card
    tiles = "".join(f'<div class="{"hot" if "last" in k.lower() else ""}"><small>{e(k)}</small><b>{e(v)}</b></div>' for k, v in pick_tiles(s["table"]))
    btns = ""
    if apply:
        btns += f'<a class="ejp-btn ap" href="{e(apply)}" target="_blank" rel="noopener nofollow">📝 {"Apply Online" if ptype in ("ej_job", "posts") else "Official Link"}</a>'
    if notif and notif != apply:
        btns += f'<a class="ejp-btn nt" href="{e(notif)}" target="_blank" rel="noopener nofollow">📄 Notification</a>'
    btns += f'<a class="ejp-btn wa" href="{wa}" target="_blank" rel="noopener">💬 WhatsApp Share</a>'
    out.append(f'<div class="ejp-sum"><div><h4>⚡ Quick Summary – {e(s["short"])}</h4><div class="ejp-g">{tiles}</div><div class="ejp-bt">{btns}</div></div></div>')
    out.append("<p>" + "<br />".join(f"<strong>{e(k)}:</strong> {e(v)}" for k, v in s["summary"]) + "</p>")
    out += [f"<p>{p}</p>" for p in s["intro"]]
    out.append(f"<h2>📋 {e(s['short'])} – Overview</h2>")
    out.append(_table(["Particular", "Details"], s["table"]))
    for sec in s["sections"]:
        out.append(f"<h2>{_icon(sec['h'])}{e(sec['h'])}</h2>")
        out += [f"<p>{p}</p>" for p in sec.get("p", [])]
        if sec.get("table"):
            out.append(_table(sec.get("th", ["Particular", "Details"]), sec["table"]))
        if sec.get("ul"):
            out.append("<ul>" + "".join(f"<li>{x}</li>" for x in sec["ul"]) + "</ul>")
        if sec.get("ol"):
            out.append("<ol>" + "".join(f"<li>{x}</li>" for x in sec["ol"]) + "</ol>")
        out += [f"<p>{p}</p>" for p in sec.get("after", [])]
    if links:
        out.append("<h2>🔗 Important Links</h2>")
        out.append('<div class="ejp-bt">' + "".join(
            f'<a class="ejp-btn {"ap" if "apply" in k.lower() else "nt" if ("notif" in k.lower() or "pdf" in k.lower()) else "ow"}" href="{e(v)}" target="_blank" rel="noopener nofollow">{e(k)} →</a>'
            for k, v in links) + "</div>")
        out.append(_table(["Link", "Open"], [[k, f'<a href="{e(v)}" target="_blank" rel="noopener nofollow">Click Here</a>'] for k, v in links]))
    out.append(f"<h2>❓ {e(s['short'])} – Frequently Asked Questions (FAQ)</h2>")
    for q, a_ in s["faq"]:
        out.append(f"<h3>{e(q)}</h3><p>{a_}</p>")
    out.append("<h2>📝 Final Words</h2>")
    out += [f"<p>{p}</p>" for p in s["final"]]
    out.append(f'<div class="ejp-share"><p>📢 Is bharti ki jaankari doston ke saath share karein</p><div class="ejp-bt" style="justify-content:center">'
               f'<a class="ejp-btn wa" href="{wa}" target="_blank" rel="noopener">💬 WhatsApp</a><a class="ejp-btn tg" href="{tg}" target="_blank" rel="noopener">✈️ Telegram</a></div></div>')
    out.append('<p class="ejp-note"><strong>Disclaimer:</strong> Employment Junction is an independent information portal and is not affiliated with any government '
               'body. Always verify details from the official notification before applying. We never charge money for any job.</p>')
    out.append("</div>")
    html_out = "\n".join(out)
    ig = '<a href="https://www.instagram.com/employmentjunction.in/" target="_blank" rel="noopener">@employmentjunction.in</a>'
    html_out = html_out.replace("<strong>@employmentjunction.in</strong>", "<strong>" + ig + "</strong>")
    import notif as _nf  # every "official notification" mention links to the notification itself (+ our PDF mirror)
    return _nf.link_notifications(html_out, notif, s.get("notification_mirror", ""))


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
# Brand cast (engine/assets/CHARACTERS.md): Naukri Bhaiya (jobs), Exam Didi (prep), Result Chacha (results), Junction Bot (alerts)
# Website images use the original 3D AI characters (assets/characters/<name>.webp). The brand cast (cast_*) and the
# code-drawn cast are for reels only — owner decision 28 Nov 2026.
TYPE_CHAR = {"ej_result": "student_result", "ej_admit_card": "admit_card", "ej_answer_key": "answer_key", "ej_syllabus": "admit_card"}
CAST_FOR = {}  # job category -> reel-only cast: not used on website images
BRAND_CAST = {"jobs": "cast_naukri_bhaiya", "prep": "cast_exam_didi", "results": "cast_result_chacha", "alerts": "cast_junction_bot"}
THEME = {"student_result": "green", "admit_card": "sky", "answer_key": "violet", "medical": "rose", "defence": "green", "police": "red",
         "railway": "sky", "bank": "green", "teacher": "violet", "engineer": "gold", "apprentice": "gold", "office": "gold",
         "cast_naukri_bhaiya": "gold", "cast_exam_didi": "violet", "cast_result_chacha": "green", "cast_junction_bot": "sky",
         "cast_engineer_bhai": "gold", "cast_daroga_ji": "red", "cast_fauji_bhai": "green", "cast_station_master": "sky", "cast_nurse_didi": "rose",
         "cast_bank_babu": "green"}
STICKER = {"ej_job": ("NEW VACANCY", "2026 · APPLY ONLINE", "APPLY NOW"), "ej_admit_card": ("ADMIT CARD OUT", "DOWNLOAD NOW", "DOWNLOAD NOW"),
           "ej_result": ("RESULT OUT", "CHECK NOW", "CHECK RESULT"), "ej_answer_key": ("ANSWER KEY OUT", "CHECK & OBJECT", "CHECK ANSWER KEY"),
           "ej_syllabus": ("SYLLABUS 2026", "EXAM PATTERN", "DOWNLOAD PDF"), "ej_schedule": ("EXAM DATE OUT", "SCHEDULE", "CHECK DATES"),
           "ej_test": ("FREE MOCK TEST", "TIMER · SOLUTIONS", "START TEST"), "posts": ("NEW VACANCY", "2026 · APPLY ONLINE", "APPLY NOW")}


def pick_character(s):
    im = s.get("image", {})
    if im.get("character"):
        return im["character"]
    ptype = s.get("type", "ej_job")
    if ptype in TYPE_CHAR and os.path.exists(os.path.join(CHAR_DIR, TYPE_CHAR[ptype] + ".webp")):
        return TYPE_CHAR[ptype]
    text = " " + " ".join([s.get("title", ""), im.get("tag", ""), im.get("org", "")]).lower() + " "
    for words, ch in CHAR_RULES:
        if any(w in text for w in words):
            for c in (CAST_FOR.get(ch), ch):
                if c and os.path.exists(os.path.join(CHAR_DIR, c + ".webp")):
                    return c
    return "office"


def featured_image(s, path):
    """Render a 1536x1024 premium featured image (3D character + details) as JPEG q82."""
    data = dict(s["image"])
    ch = pick_character(s)
    src = os.path.join(CHAR_DIR, ch + ".webp")
    if not os.path.exists(src):
        src = os.path.join(CHAR_DIR, "office.webp")
    data["character_src"] = "file://" + src
    data["cast"], data["cast_name"] = ch.startswith("cast_"), ch
    if data["cast"]:  # wide poses (raised flag, open arms) get the wider framing so they never cover the headline
        from PIL import Image as _I
        with _I.open(src) as _im:
            data["cast_wide"] = _im.width / _im.height > 0.45  # brand mascots are full-body: frame them from the knees up
    data["logo_src"] = "file://" + os.path.join(HERE, "assets", "logo.webp")  # official Employment Junction logo — always on the image
    data.setdefault("theme", THEME.get(ch, "gold"))
    ptype = s.get("type", "ej_job")
    st = STICKER.get(ptype, STICKER["ej_job"])
    data.setdefault("sticker", st[0]); data.setdefault("sticker_sub", st[1]); data.setdefault("cta", st[2])
    vac = s.get("job", {}).get("vacancies") or 0
    if "big" not in data and vac:
        data["big"] = f"{vac:,}"
    # put the last-date chip last and highlighted; keep 3 chips max (the burst shows the post count)
    chips = [c for c in data.get("chips", []) if not str(c[0]).lower().startswith(("posts", "total"))]
    hot = [c for c in chips if len(c) > 2 and c[2]]
    data["chips"] = ([c for c in chips if c not in hot][:3 - len(hot[:1])] + hot[:1])
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
await p.waitForFunction(() => {{ const i = document.getElementById('char'); const l = document.getElementById('logo'); return (!i.src || i.complete) && (!l.src || l.complete); }});
await p.screenshot({{ path: '{path}', type: 'jpeg', quality: 84 }}); await b.close(); }})();
"""], check=True)
    os.remove(tmp)


def upload(path, title, alt):
    import time
    name = os.path.basename(path)
    for attempt in range(3):  # Hostinger occasionally answers 502 on uploads
        try:
            return _upload(path, title, alt, name)
        except SystemExit as err:
            print("upload retry", attempt + 1, err)
            time.sleep(10 * (attempt + 1))
    return _upload(path, title, alt, name)


def _upload(path, title, alt, name):
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

    # official notification: link the PDF itself and keep a mirror copy in our media library
    nurl = next((v for k, v in s.get("links", []) if "notif" in k.lower() or "pdf" in k.lower()), "")
    if nurl and not s.get("notification_mirror"):
        import notif as _nf
        s["notification_mirror"] = _nf.mirror_pdf(s.get("notification_pdf") or nurl, s["slug"])
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
