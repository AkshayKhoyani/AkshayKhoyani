"""Site-wide content builders, re-run on every content run.

1. Qualification hub pages  (10th / 12th / ITI / Diploma / Graduate / Post Graduate govt jobs)
2. State hub pages          (one page per state that has at least one job, + Central/All India)
3. "Related Updates" box    on every job / admit card / result / answer key / syllabus / exam date page
4. Hindi summary            ("हिंदी में संक्षिप्त जानकारी") on every job page, built from its JobPosting fields

All blocks are wrapped in HTML comment markers and replaced in place, so re-running is safe.
Usage: python3 engine/hubs.py [--dry]
"""
import datetime
import html
import json
import re
import subprocess
import sys

API = "https://employmentjunction.in/wp-json/wp/v2"
SITE = "https://employmentjunction.in"
DRY = "--dry" in sys.argv
ONLY = set(int(x) for x in sys.argv[sys.argv.index("--only-ids") + 1].split(",")) if "--only-ids" in sys.argv else None
TODAY = datetime.date.today()
TYPES = {"ej_job": "Job", "ej_admit_card": "Admit Card", "ej_result": "Result", "ej_answer_key": "Answer Key",
         "ej_syllabus": "Syllabus", "ej_schedule": "Exam Date"}
TH = 'style="padding: 10px; border: 1px solid #ddd;"'
HEAD = '<tr style="background: #0b5ed7; color: #fff;">'


def curl(*a, body=None):
    cmd = ["curl", "-s", "--max-time", "120", "-H", "User-Agent: EJ-Engine/1.0", *a]
    if body is not None:
        open("/tmp/_ej_body.json", "w").write(json.dumps(body))
        cmd += ["-H", "Content-Type: application/json", "--data-binary", "@/tmp/_ej_body.json"]
    return subprocess.run(cmd, capture_output=True, text=True).stdout


def fetch(t, fields="id,link,slug,title,meta,content,date,status"):
    out = []
    for pg in range(1, 10):
        try:
            d = json.loads(curl(f"{API}/{t}?per_page=100&page={pg}&context=edit&status=publish&_fields={fields}"))
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


def title_of(p):
    return html.unescape(p["title"]["raw"] if isinstance(p["title"], dict) else p["title"])


def date(s):
    try:
        return datetime.date.fromisoformat((s or "")[:10])
    except ValueError:
        return None


def fmt(d):
    return d.strftime("%d %b %Y") if d else "See notification"


sys.path.insert(0, __file__.rsplit("/", 1)[0] + "/mock")
try:
    import highlight as MOCK  # mock-test highlight blocks
except Exception as _e:  # MOCK_INDEX.json missing etc.
    MOCK = None
    print("mock highlight disabled:", _e)


def prepend_block(content, name, block):
    start, end = f"<!-- ej-{name} -->", f"<!-- /ej-{name} -->"
    content = re.sub(re.escape(start) + r".*?" + re.escape(end) + r"\n?", "", content, flags=re.S)
    return (start + block + end + "\n" + content) if block else content


def replace_block(content, name, block):
    start, end = f"<!-- ej-{name} -->", f"<!-- /ej-{name} -->"
    content = re.sub(re.escape(start) + r".*?" + re.escape(end), "", content, flags=re.S).rstrip()
    return content + "\n" + start + block + end if block else content


# ---------- classification ----------
QUAL = [
    ("10th-pass-govt-jobs", "10th Pass Govt Jobs 2026", "10th pass (Matriculation)",
     (r"\b10th\b", r"matric", r"high school", r"class 10", r"\bsslc\b", r"10th pass")),
    ("12th-pass-govt-jobs", "12th Pass Govt Jobs 2026", "12th pass (Intermediate / 10+2)",
     (r"\b12th\b", r"intermediate", r"10\+2", r"higher secondary", r"class 12")),
    ("iti-govt-jobs", "ITI Govt Jobs 2026", "ITI (NCVT / SCVT)", (r"\biti\b", r"ncvt", r"scvt", r"apprentice")),
    ("diploma-govt-jobs", "Diploma Govt Jobs 2026", "Diploma (Engineering / Polytechnic / Nursing)", (r"diploma", r"polytechnic", r"\bgnm\b", r"d\.el\.ed")),
    ("graduate-govt-jobs", "Graduate Govt Jobs 2026", "Graduation / Bachelor's degree",
     (r"graduat", r"bachelor", r"\bdegree\b", r"b\.tech", r"\bb\.e\b", r"b\.sc", r"b\.com", r"\bbca\b", r"b\.ed", r"\bllb\b", r"mbbs")),
    ("post-graduate-govt-jobs", "Post Graduate Govt Jobs 2026", "Post Graduation / Master's degree",
     (r"post ?graduat", r"master", r"\bm\.sc", r"\bmba\b", r"m\.tech", r"\bm\.a\b", r"\bm\.com", r"\bmca\b", r"ph\.?d", r"\bmd\b", r"\bpg\b")),
]
ELIG_MAP = {"high school": ("10th-pass-govt-jobs", "12th-pass-govt-jobs"), "professional certificate": ("iti-govt-jobs",),
            "associate degree": ("diploma-govt-jobs",), "bachelor degree": ("graduate-govt-jobs",), "postgraduate degree": ("post-graduate-govt-jobs",)}


def qual_text(job):
    c = job["content"]["raw"]
    m = re.search(r"<b>(?:Educational )?Qualification[^<]*</b></td><td[^>]*>(.*?)</td>", c, re.S | re.I)
    parts = [title_of(job), job["meta"].get("ej_eligibility", "")]
    if m:
        parts.append(m.group(1))
    else:
        e = re.search(r"<h2>[^<]*(?:Eligibility|Qualification)[^<]*</h2>(.*?)<h2>", c, re.S | re.I)
        parts.append(e.group(1) if e else "")
    return text(" ".join(parts)).lower()


def quals(job):
    t = qual_text(job)
    hit = {slug for slug, _, _, pats in QUAL if any(re.search(p, t) for p in pats)}
    if not hit:
        hit = set(ELIG_MAP.get(job["meta"].get("ej_eligibility", "").lower(), ()))
    return hit


STATES = ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh",
          "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha",
          "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi",
          "Jammu and Kashmir", "Ladakh", "Chandigarh", "Puducherry"]
CENTRAL = r"\b(ssc|upsc|rrb|rrc|ibps|sbi|rbi|nabard|sidbi|exim|bhel|ntpc|nhpc|nlc|iocl|ongc|gail|drdo|isro|barc|icar|asrb|aiims|esic|epfo|kvs|nvs|bsf|crpf|cisf|itbp|ssb|army|navy|air force|indian railway|central)\b"


def state_of(job):
    s = (job["meta"].get("ej_state_name") or "").strip()
    if s in ("Jammu & Kashmir", "J&K"):
        s = "Jammu and Kashmir"
    if s in STATES:
        return s
    t = title_of(job) + " " + job["meta"].get("ej_org_name", "")
    for st in STATES:
        if st.lower() in t.lower():
            return st
    return "Central"


def slugify(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


# ---------- hub page rendering ----------
def job_rows(items):
    rows = [HEAD + f"<th {TH}>Recruitment</th><th {TH}>Posts</th><th {TH}>Last Date</th></tr>"]
    for i, j in enumerate(items):
        bg = ' style="background: #f6f6f6;"' if i % 2 else ""
        v = j["meta"].get("ej_vacancies") or 0
        rows.append(f'<tr{bg}><td {TH}><a href="{j["link"]}">{html.escape(title_of(j))}</a></td>'
                    f'<td {TH}>{f"{v:,}" if v else "Various"}</td><td {TH}>{fmt(date(j["meta"].get("ej_last_date")))}</td></tr>')
    return '<table style="width: 100%; border-collapse: collapse; font-size: 16px;"><tbody>' + "".join(rows) + "</tbody></table>"


def hub_content(intro, items, closed_note, faq):
    open_ = sorted([j for j in items if (date(j["meta"].get("ej_last_date")) or TODAY) >= TODAY],
                   key=lambda j: date(j["meta"].get("ej_last_date")) or datetime.date.max)
    closed = sorted([j for j in items if j not in open_], key=lambda j: j["date"], reverse=True)[:20]
    total = sum((j["meta"].get("ej_vacancies") or 0) for j in open_)
    out = [f"<p><strong>Last updated:</strong> {TODAY.strftime('%d %B %Y')} · <strong>{len(open_)}</strong> open recruitments"
           + (f" · <strong>{total:,}+</strong> posts" if total else "") + "</p>"]
    out += [f"<p>{p}</p>" for p in intro]
    out.append("<h2>Apply Now – Open Recruitments</h2>")
    out.append(job_rows(open_) if open_ else "<p>No open recruitment right now. New notifications are added here as soon as they are released.</p>")
    if closed:
        out.append("<h2>Recently Closed</h2><p>" + closed_note + "</p>" + job_rows(closed))
    out.append("<h2>Frequently Asked Questions</h2>")
    out += [f"<h3>{html.escape(q)}</h3><p>{a}</p>" for q, a in faq]
    out.append('<p>Get every new update first: follow <strong><a href="https://www.instagram.com/employmentjunction.in/" target="_blank" '
               'rel="noopener">@employmentjunction.in</a></strong> on Instagram.</p>')
    out.append("<p><em>Always verify details from the official notification before applying. Employment Junction never charges any fee.</em></p>")
    return "\n".join(out), len(open_)


def upsert_page(slug, title, content, seo_title, desc, pages_by_slug):
    meta = {"title": title, "slug": slug, "status": "publish", "content": content}
    if DRY:
        print("DRY page", slug, len(content))
        return pages_by_slug.get(slug, {}).get("link", SITE + "/" + slug + "/")
    pid = pages_by_slug.get(slug, {}).get("id")
    r = json.loads(curl("-X", "POST", f"{API}/pages/{pid}" if pid else f"{API}/pages", body=meta))
    if "id" in r:
        curl("-X", "POST", f"{SITE}/wp-json/rankmath/v1/updateMeta", body={"objectType": "post", "objectID": r["id"], "meta": {
            "rank_math_title": seo_title + " | Employment Junction", "rank_math_description": desc, "rank_math_focus_keyword": title.replace(" 2026", "")}})
        print("page", "updated" if pid else "created", r["link"])
        return r["link"]
    print("page FAILED", slug, str(r)[:200])
    return None


# ---------- Hindi summary ----------
HI_MONTHS = ["जनवरी", "फ़रवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर"]


def hi_date(d):
    return f"{d.day} {HI_MONTHS[d.month - 1]} {d.year}" if d else "आधिकारिक अधिसूचना देखें"


def hindi_block(job):
    m = job["meta"]
    org, post = m.get("ej_org_name") or "", m.get("ej_post_name") or ""
    if not org:
        return ""
    v = m.get("ej_vacancies") or 0
    s, l = date(m.get("ej_start_date")), date(m.get("ej_last_date"))
    rows = [("संस्था", org), ("पद का नाम", post or "विभिन्न पद"), ("कुल पद", f"{v:,}" if v else "विभिन्न"),
            ("आवेदन शुरू", hi_date(s)), ("अंतिम तिथि", hi_date(l)), ("आवेदन का तरीका", "ऑनलाइन")]
    if m.get("ej_apply_url"):
        rows.append(("आवेदन लिंक", f'<a href="{html.escape(m["ej_apply_url"])}" target="_blank" rel="noopener nofollow">यहाँ क्लिक करें</a>'))
    trs = "".join(f"<tr><td {TH}><b>{k}</b></td><td {TH}>{val if k == 'आवेदन लिंक' else html.escape(val)}</td></tr>" for k, val in rows)
    para = (f"{html.escape(org)} ने {html.escape(post or 'विभिन्न पदों')} के " + (f"{v:,} " if v else "") +
            "पदों पर भर्ती का नोटिफिकेशन जारी किया है। " +
            (f"ऑनलाइन आवेदन {hi_date(s)} से शुरू हैं और अंतिम तिथि {hi_date(l)} है। " if l else "") +
            "योग्यता, आयु सीमा, आवेदन शुल्क और चयन प्रक्रिया की पूरी जानकारी ऊपर दी गई है। आवेदन करने से पहले आधिकारिक अधिसूचना ज़रूर पढ़ें।")
    return (f'<h2>हिंदी में संक्षिप्त जानकारी</h2><p>{para}</p>'
            f'<table style="width: 100%; border-collapse: collapse; font-size: 16px;"><tbody>{trs}</tbody></table>')


# ---------- Related updates ----------
STOP = {"recruitment", "admit", "result", "answer", "syllabus", "exam", "date", "calendar", "card", "key", "final", "mains",
        "prelims", "2026", "2027", "posts", "apply", "online", "for", "and", "of", "the", "www"}


def keys(slug):
    toks = [t for t in slug.split("-") if t and not t.isdigit() and t not in STOP]
    return toks[:2]


def related_block(p, everyone):
    k = keys(p["slug"])
    if not k:
        return ""
    scored = []
    for q in everyone:
        if q["id"] == p["id"]:
            continue
        kq = keys(q["slug"])
        if not kq or kq[0] != k[0]:
            continue
        score = 2 if kq[:2] == k[:2] else 1
        scored.append((score, q["date"], q))
    scored.sort(key=lambda x: (x[0], x[1]), reverse=True)
    picks = [q for _, _, q in scored[:6]]
    if not picks:
        return ""
    lis = "".join(f'<li><a href="{q["link"]}">{html.escape(title_of(q))}</a> <em>({TYPES[q["_type"]]})</em></li>' for q in picks)
    return f"<h2>Related Updates</h2><ul>{lis}</ul>"


def main():
    pages_by_slug = {p["slug"]: p for p in fetch("pages", "id,slug,link")}
    every = []
    for t in TYPES:
        for p in fetch(t):
            p["_type"] = t
            every.append(p)
    jobs = [p for p in every if p["_type"] == "ej_job"]
    print(len(every), "pages,", len(jobs), "jobs")

    # 1. qualification hubs
    hub_links = []
    for slug, title, label, _ in ([] if ONLY else QUAL):
        items = [j for j in jobs if slug in quals(j)]
        intro = [f"Here is the complete, daily-updated list of <strong>government jobs for {label}</strong> candidates in 2026 – central and state "
                 "recruitments from railways, SSC, banks, police, PSUs and state commissions.",
                 "Each recruitment links to a full page with eligibility, age limit and category-wise relaxation, application fee, important dates, "
                 "selection process and the official notification and apply-online links."]
        faq = [(f"Which govt jobs are open for {label} in 2026?", "All currently open recruitments are listed in the table above, sorted by last date."),
               ("How often is this list updated?", "Several times every day, as soon as a new notification, date extension or result is released."),
               ("Is there any fee to apply through Employment Junction?", "No. We only share information. Always apply on the official website.")]
        content, n = hub_content(intro, items, "These recruitments are closed, but their pages are kept for admit card, answer key and result updates.", faq)
        desc = f"Latest {title}: {n} open recruitments for {label} candidates – posts, last date, eligibility and apply links. Updated daily."
        link = upsert_page(slug, title, content, f"{title} – Latest Sarkari Naukri for {label.split(' (')[0]}", desc[:160], pages_by_slug)
        if link:
            hub_links.append((title, link))

    # 2. state hubs
    by_state = {}
    for j in jobs:
        by_state.setdefault(state_of(j), []).append(j)
    for st, items in ([] if ONLY else sorted(by_state.items())):
        name = "Central Govt Jobs 2026" if st == "Central" else f"{st} Govt Jobs 2026"
        slug = "central-govt-jobs" if st == "Central" else slugify(st) + "-govt-jobs-2026"
        where = "all over India (central government, railways, banks, PSUs, defence)" if st == "Central" else st
        intro = [f"Latest <strong>{name.replace(' 2026', '')}</strong> notifications for 2026 – every open government recruitment for {where}, "
                 "updated daily with posts, last date and direct links to the full details.",
                 "Click any recruitment to see eligibility, age limit, category-wise fee and relaxation, important dates, selection process and the official links."]
        faq = [(f"How many {name.replace(' 2026', '')} are open right now?", "See the table above – it lists every open recruitment with its last date."),
               ("Where do I apply?", "Each job page has the official apply-online link and notification PDF link.")]
        content, n = hub_content(intro, items, "Closed recruitments are kept for admit card and result updates.", faq)
        desc = f"{name}: {n} open recruitments with posts, last date, eligibility, fee and apply links. Updated daily by Employment Junction."
        link = upsert_page(slug, name, content, f"{name} – Latest Sarkari Naukri Notifications", desc[:160], pages_by_slug)
        if link:
            hub_links.append((name, link))

    # mock test hub page
    if MOCK and not ONLY:
        upsert_page("free-mock-test", "Free Mock Test Series 2026 – Online Test for Govt Exams", MOCK.hub_html(),
                    "Free Mock Test 2026 – Online Test Series for Govt Exams", "Free online mock tests for Police, Gujarat LRD, SSC, DSSSB, Railway, Bank, Teaching & PSC exams with timer, score and solutions.", pages_by_slug)

    # old-style job posts (post type "posts") also get the mock-test banner
    for p in fetch("posts"):
        p["_type"] = "posts"
        every.append(p)
    TYPES.setdefault("posts", "Job")

    # 3 + 4 + 5. related box, Hindi summary and mock-test banners on content pages
    changed = 0
    for p in every:
        if ONLY and p["id"] not in ONLY:
            continue
        c = p["content"]["raw"]
        new = c if p["_type"] == "posts" else replace_block(c, "related", related_block(p, every))
        if MOCK and p["_type"] in ("ej_job", "ej_admit_card", "ej_answer_key", "ej_syllabus", "ej_schedule", "posts"):
            txt = title_of(p) + " " + (p.get("meta") or {}).get("ej_org_name", "")
            new = prepend_block(new, "mock", MOCK.block(txt))
            new = replace_block(new, "mock2", MOCK.block(txt, compact=True))
        if p["_type"] == "ej_job":
            new = replace_block(new, "hindi", hindi_block(p))
        if new != c:
            changed += 1
            if not DRY:
                curl("-X", "POST", f"{API}/{p['_type']}/{p['id']}", body={"content": new})
    print("content pages updated:", changed)

    json.dump(hub_links, open(__file__.replace("hubs.py", "HUB_PAGES.json"), "w"), indent=1)
    # IndexNow ping for hubs
    if not DRY and hub_links:
        curl("-X", "POST", f"{SITE}/wp-json/rankmath/v1/in/submitUrls", body={"urls": "\n".join(l for _, l in hub_links)})


if __name__ == "__main__":
    main()
