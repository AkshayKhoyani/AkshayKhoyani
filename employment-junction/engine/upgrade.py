"""Upgrade already-published pages to the premium layout and the new featured-image design.

- wraps the body in .ejp with the premium CSS, adds the Quick Summary card (from the page's first overview table
  and its JobPosting fields), restyles every table and adds icons to H2s; keeps the ej-mock / ej-related / ej-hindi blocks.
- renders a new featured image from the page's own data (title + JobPosting fields), uploads it and swaps it in.
Nothing about the facts changes. Usage: python3 engine/upgrade.py [--types ej_job,ej_result] [--ids 1,2] [--no-images] [--dry]
"""
import html
import json
import os
import re
import subprocess
import sys
from urllib.parse import quote

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import wp  # noqa: E402

API = "https://employmentjunction.in/wp-json/wp/v2"
ARGS = sys.argv
DRY = "--dry" in ARGS
TYPES = ARGS[ARGS.index("--types") + 1].split(",") if "--types" in ARGS else ["ej_job", "ej_admit_card", "ej_result", "ej_answer_key", "ej_syllabus", "ej_schedule", "posts"]
IDS = set(int(x) for x in ARGS[ARGS.index("--ids") + 1].split(",")) if "--ids" in ARGS else None
LABEL = {"ej_job": None, "ej_admit_card": "ADMIT CARD", "ej_result": "RESULT", "ej_answer_key": "ANSWER KEY", "ej_syllabus": "SYLLABUS",
         "ej_schedule": "EXAM DATE", "posts": None}
ELIG = {"high school": "10th / 12th Pass", "professional certificate": "ITI / Certificate", "associate degree": "Diploma",
        "bachelor degree": "Graduate", "postgraduate degree": "Post Graduate"}


def curl(*a, body=None):
    cmd = ["curl", "-s", "--max-time", "120", "-H", "User-Agent: EJ-Engine/1.0", *a]
    if body is not None:
        open("/tmp/_up.json", "w").write(json.dumps(body))
        cmd += ["-H", "Content-Type: application/json", "--data-binary", "@/tmp/_up.json"]
    return subprocess.run(cmd, capture_output=True, text=True).stdout


def fetch(t):
    out = []
    for pg in range(1, 10):
        try:
            d = json.loads(curl(f"{API}/{t}?per_page=100&page={pg}&context=edit&status=publish&_fields=id,slug,link,title,content,meta,date,featured_media"))
        except Exception:
            break
        if not isinstance(d, list) or not d:
            break
        out += d
        if len(d) < 100:
            break
    return out


def text(s):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", s or ""))).strip()


BLOCK = re.compile(r"<!-- ej-(\w+) -->.*?<!-- /ej-\1 -->\n?", re.S)
EMOJI = re.compile(r"^[\U0001F300-\U0001FAFF☀-➿]")


def first_table_rows(body):
    m = re.search(r"<table.*?</table>", body, re.S)
    if not m:
        return []
    rows = []
    for tr in re.findall(r"<tr[^>]*>(.*?)</tr>", m.group(0), re.S):
        cells = [text(c) for c in re.findall(r"<t[dh][^>]*>(.*?)</t[dh]>", tr, re.S)]
        if len(cells) == 2 and cells[0].lower() not in ("particular", "particulars", "details", "field"):
            rows.append((cells[0], cells[1]))
    return rows


def restyle(body):
    body = re.sub(r"<table[^>]*>", '<table class="ejp-t">', body)
    body = re.sub(r"<(tr|th|td)\s+style=\"[^\"]*\"", r"<\1", body)
    body = re.sub(r"<(tr|th|td)([^>]*?)\s+style=\"[^\"]*\"", r"<\1\2", body)

    def h2(m):
        inner = m.group(2)
        return m.group(0) if EMOJI.match(text(inner)) else f"<h2{m.group(1)}>{wp._icon(text(inner))}{inner}</h2>"
    return re.sub(r"<h2([^>]*)>(.*?)</h2>", h2, body, flags=re.S)


def summary_card(p, rows):
    m = p.get("meta") or {}
    facts = list(rows)
    if m.get("ej_vacancies") and not any("post" in k.lower() or "vacanc" in k.lower() for k, _ in facts):
        facts.insert(0, ("Total Posts", f"{m['ej_vacancies']:,}"))
    if m.get("ej_last_date") and not any("last" in k.lower() for k, _ in facts):
        facts.append(("Last Date", wp_date(m["ej_last_date"])))
    tiles = wp.pick_tiles(facts) if facts else []
    if not tiles:
        return ""
    title = html.unescape(p["title"]["raw"])
    short = title.split(" – ")[0].split(" - ")[0]
    wa = "https://wa.me/?text=" + quote(f"{title}\n👉 {p['link']}")
    btns = ""
    if m.get("ej_apply_url"):
        btns += f'<a class="ejp-btn ap" href="{html.escape(m["ej_apply_url"])}" target="_blank" rel="noopener nofollow">📝 Apply Online</a>'
    if m.get("ej_notification_url") and m.get("ej_notification_url") != m.get("ej_apply_url"):
        btns += f'<a class="ejp-btn nt" href="{html.escape(m["ej_notification_url"])}" target="_blank" rel="noopener nofollow">📄 Notification</a>'
    btns += f'<a class="ejp-btn wa" href="{wa}" target="_blank" rel="noopener">💬 WhatsApp Share</a>'
    t = "".join(f'<div class="{"hot" if "last" in k.lower() else ""}"><small>{html.escape(k)}</small><b>{html.escape(v)}</b></div>' for k, v in tiles)
    return f'<div class="ejp-sum"><div><h4>⚡ Quick Summary – {html.escape(short)}</h4><div class="ejp-g">{t}</div><div class="ejp-bt">{btns}</div></div></div>'


def wp_date(d):
    import datetime
    try:
        return datetime.date.fromisoformat(d[:10]).strftime("%d %b %Y")
    except ValueError:
        return d


def upgrade_content(p):
    c = p["content"]["raw"]
    if 'class="ejp"' in c:
        return None
    blocks = {m.group(1): m.group(0) for m in BLOCK.finditer(c)}
    body = BLOCK.sub("", c).strip()
    card = summary_card(p, first_table_rows(body))
    new_body = f"<style>{wp.PCSS}</style>\n" + '<div class="ejp">\n' + card + "\n" + restyle(body) + "\n</div>"
    top = blocks.get("mock", "").rstrip("\n")
    tail = "".join(blocks.get(k, "") for k in ("mock2", "related", "hindi"))
    return (top + "\n" if top else "") + new_body + ("\n" + tail if tail else "")


def image_data(p, ptype):
    m = p.get("meta") or {}
    title = html.unescape(p["title"]["raw"])
    head = re.split(r" – | - |: ", title)[0]
    head = re.sub(r"\b(Recruitment|Apply Online|Notification)\b.*$", "", head).strip() or head
    label = LABEL.get(ptype)
    tl = " " + title.lower() + " "
    cat = next((c for k, c in [(r"\b(rrb|rrc|railway|ntpc|konkan)\b", "RAILWAY JOBS"), (r"police|constable|lrd|\bsi\b|\b(bsf|crpf|cisf|itbp|capf)\b", "POLICE JOBS"),
                               (r"\b(bank|sbi|ibps|rbi|nabard|exim|sidbi)\b", "BANK JOBS"), (r"army|navy|air force|agniveer|defence|\bnda\b|\bcds\b", "DEFENCE JOBS"),
                               (r"teacher|\btet\b|\bdsc\b|lecturer|professor|faculty", "TEACHING JOBS"), (r"nurse|nursing|medical|aiims|hospital|pharmac", "MEDICAL JOBS"),
                               (r"apprentice", "APPRENTICE"), (r"engineer|\bje\b|\bae\b|trainee|\bpsu\b", "ENGINEERING JOBS")] if re.search(k, tl)), None)
    tag = label or cat or ((m.get("ej_state_name") + " GOVT JOBS").upper() if m.get("ej_state_name") and m.get("ej_state_name") not in ("All India", "") else "GOVT JOBS 2026")
    org = m.get("ej_org_name") or (p["slug"].split("-")[0].upper() + " · Latest Update")
    chips = []
    if ptype in ("ej_job", "posts"):
        q = ELIG.get((m.get("ej_eligibility") or "").lower())
        if q:
            chips.append(["Qualification", q])
        if m.get("ej_location"):
            chips.append(["Location", m["ej_location"][:18]])
        if m.get("ej_last_date"):
            chips.append(["Last Date", wp_date(m["ej_last_date"]), True])
        headline = head + ("<br><em>Recruitment 2026</em>" if "2026" not in head else "")
    else:
        chips.append(["Updated", wp_date(p["date"])])
        headline = head
    return {"slug": p["slug"], "type": ptype, "title": title, "job": {"vacancies": m.get("ej_vacancies") or 0},
            "image": {"tag": tag[:28], "org": org[:70], "headline": html.escape(headline).replace("&lt;br&gt;&lt;em&gt;", "<br><em>").replace("&lt;/em&gt;", "</em>"), "chips": chips}}


def main():
    done = 0
    for t in TYPES:
        for p in fetch(t):
            if IDS and p["id"] not in IDS:
                continue
            upd = {}
            new = upgrade_content(p)
            if new is None and "--force" not in ARGS:
                continue  # already upgraded (content and image)
            if new:
                upd["content"] = new
            if "--no-images" not in ARGS:
                spec = image_data(p, t)
                img = f"/tmp/_up_{p['id']}.jpg"
                wp.featured_image(spec, img)
                if not DRY:
                    upd["featured_media"] = wp.upload(img, spec["title"], spec["title"])
            if upd and not DRY:
                r = json.loads(curl("-X", "POST", f"{API}/{t}/{p['id']}", body=upd))
                old = p.get("featured_media")
                if "featured_media" in upd and old and r.get("featured_media") == upd["featured_media"] and p["date"] >= "2026-11-23":
                    curl("-X", "DELETE", f"{API}/media/{old}?force=true")  # our own old engine image
            done += 1
            print(t, p["id"], "content" if new else "-", "image" if "featured_media" in upd else "-", flush=True)
    print("done", done)


if __name__ == "__main__":
    main()
