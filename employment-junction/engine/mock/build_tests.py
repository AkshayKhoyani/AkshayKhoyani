"""Build and publish all mock tests (post type ej_test), the /free-mock-test/ hub page and MOCK_INDEX.json.
Usage: python3 engine/mock/build_tests.py [--only slug,slug] [--no-images]
"""
import html
import json
import os
import random
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.dirname(HERE))
import banks  # noqa: E402
import gen  # noqa: E402
import wp  # noqa: E402

SITE = "https://employmentjunction.in"
CSS = open(os.path.join(HERE, "quiz.css")).read()
JS = open(os.path.join(HERE, "quiz.js")).read()
import re as _re
CSS_MIN = _re.sub(r"\s*\n\s*", "", CSS)  # one line: WordPress auto-paragraphs would break multi-line CSS


def bank(name, start, n, seed):
    items = banks.BANKS[name][start:start + n]
    rng = random.Random(seed)
    out = []
    for q, o, a, e in items:
        idx = list(range(4)); rng.shuffle(idx)
        out.append({"q": q, "o": [o[i] for i in idx], "a": idx.index(a), "e": e})
    return out


# ---- catalog ----
SECTIONAL = [
    # slug, title, subject label, character, theme, builder
    ("general-knowledge-mock-test-1", "General Knowledge (GK) Mock Test 1", "General Knowledge", "office", "gold", lambda: [("General Knowledge", bank("GK", 0, 25, 11))]),
    ("general-knowledge-mock-test-2", "General Knowledge (GK) Mock Test 2", "General Knowledge", "office", "gold", lambda: [("General Knowledge", bank("GK", 25, 25, 12))]),
    ("reasoning-mock-test-1", "Reasoning Mock Test 1", "Reasoning", "answer_key", "violet", lambda: [("Reasoning", gen.gen_reasoning(101, 25))]),
    ("reasoning-mock-test-2", "Reasoning Mock Test 2", "Reasoning", "answer_key", "violet", lambda: [("Reasoning", gen.gen_reasoning(102, 25))]),
    ("reasoning-mock-test-3", "Reasoning Mock Test 3", "Reasoning", "answer_key", "violet", lambda: [("Reasoning", gen.gen_reasoning(103, 25))]),
    ("maths-mock-test-1", "Maths (Quantitative Aptitude) Mock Test 1", "Maths", "admit_card", "sky", lambda: [("Maths", gen.gen_maths(201, 25))]),
    ("maths-mock-test-2", "Maths (Quantitative Aptitude) Mock Test 2", "Maths", "admit_card", "sky", lambda: [("Maths", gen.gen_maths(202, 25))]),
    ("maths-mock-test-3", "Maths (Quantitative Aptitude) Mock Test 3", "Maths", "admit_card", "sky", lambda: [("Maths", gen.gen_maths(203, 25))]),
    ("general-science-mock-test-1", "General Science Mock Test 1", "Science", "medical", "rose", lambda: [("General Science", bank("SCIENCE", 0, 30, 13))]),
    ("indian-polity-mock-test-1", "Indian Polity & Constitution Mock Test 1", "Polity", "office", "gold", lambda: [("Polity", bank("POLITY", 0, 30, 14))]),
    ("gujarat-gk-mock-test-1", "Gujarat GK Mock Test 1", "Gujarat GK", "police", "green", lambda: [("Gujarat GK", bank("GUJARAT", 0, 30, 15))]),
    ("computer-awareness-mock-test-1", "Computer Awareness Mock Test 1", "Computer", "bank", "sky", lambda: [("Computer", bank("COMPUTER", 0, 25, 16))]),
    ("english-mock-test-1", "General English Mock Test 1", "English", "teacher", "violet", lambda: [("English", bank("ENGLISH", 0, 30, 17))]),
    ("hindi-mock-test-1", "सामान्य हिंदी मॉक टेस्ट 1 (General Hindi)", "Hindi", "teacher", "rose", lambda: [("हिंदी", bank("HINDI", 0, 25, 18))]),
]

FULL = [
    ("gujarat-police-lrd-mock-test-1", "Gujarat Police LRD Mock Test 2026 – Full Test 1", "Gujarat Police Lokrakshak (LRD) / Constable", "police", "green",
     lambda: [("Gujarat GK", bank("GUJARAT", 0, 10, 21)), ("General Knowledge", bank("GK", 0, 10, 22)), ("Reasoning", gen.gen_reasoning(301, 10)), ("Maths", gen.gen_maths(302, 10))]),
    ("ssc-mts-dsssb-mock-test-1", "SSC MTS / DSSSB MTS Mock Test 2026 – Full Test 1", "SSC MTS, DSSSB MTS, CHSL & Group C exams", "office", "gold",
     lambda: [("General Awareness", bank("GK", 10, 10, 23)), ("Reasoning", gen.gen_reasoning(311, 10)), ("Numerical Ability", gen.gen_maths(312, 10)), ("English", bank("ENGLISH", 0, 10, 24))]),
    ("railway-ntpc-group-d-mock-test-1", "Railway (RRB NTPC / Group D) Mock Test 2026 – Full Test 1", "RRB NTPC, Group D, ALP & Railway Apprentice", "railway", "sky",
     lambda: [("General Awareness", bank("GK", 20, 10, 25)), ("General Science", bank("SCIENCE", 0, 10, 26)), ("Reasoning", gen.gen_reasoning(321, 10)), ("Maths", gen.gen_maths(322, 10))]),
    ("police-constable-mock-test-1", "Police Constable Mock Test 2026 – Full Test 1 (All States)", "UP / Bihar / Uttarakhand / Delhi Police Constable & SI", "police", "green",
     lambda: [("General Knowledge", bank("GK", 30, 10, 27)), ("Hindi", bank("HINDI", 0, 10, 28)), ("Reasoning", gen.gen_reasoning(331, 10)), ("Maths", gen.gen_maths(332, 10))]),
    ("bank-clerk-po-mock-test-1", "Bank Clerk / PO Mock Test 2026 – Full Test 1", "SBI / IBPS Clerk & PO Prelims", "bank", "sky",
     lambda: [("Reasoning Ability", gen.gen_reasoning(341, 15)), ("Quantitative Aptitude", gen.gen_maths(342, 15)), ("English Language", bank("ENGLISH", 10, 10, 29))]),
    ("teaching-tet-mock-test-1", "Teaching (TET / Teacher Recruitment) Mock Test 2026 – Full Test 1", "TET, DSC, TGT/PGT & Teacher Recruitment", "teacher", "violet",
     lambda: [("General Knowledge", bank("GK", 40, 10, 30)), ("Hindi", bank("HINDI", 10, 10, 31)), ("English", bank("ENGLISH", 20, 10, 32)), ("Reasoning", gen.gen_reasoning(351, 10))]),
    ("engineering-psu-aptitude-mock-test-1", "Engineering & PSU General Aptitude Mock Test 2026 – Full Test 1", "JE, AE, PSU Trainee (non-technical section)", "engineer", "gold",
     lambda: [("Reasoning", gen.gen_reasoning(361, 10)), ("Quantitative Aptitude", gen.gen_maths(362, 10)), ("General Awareness", bank("GK", 5, 10, 33)), ("Computer", bank("COMPUTER", 0, 10, 34))]),
    ("upsc-state-psc-gs-mock-test-1", "UPSC / State PSC General Studies Mock Test 2026 – Full Test 1", "UPSC, State PCS, ASO & Group 2 Prelims", "office", "violet",
     lambda: [("Polity", bank("POLITY", 0, 15, 35)), ("History & GK", bank("GK", 10, 15, 36)), ("Science", bank("SCIENCE", 10, 10, 37))]),
]

# exam key -> (primary full mock, sectional list)
EXAMS = {
    "gujarat-police": ("gujarat-police-lrd-mock-test-1", ["gujarat-gk-mock-test-1", "reasoning-mock-test-1", "maths-mock-test-1"]),
    "police": ("police-constable-mock-test-1", ["general-knowledge-mock-test-1", "reasoning-mock-test-1", "hindi-mock-test-1"]),
    "ssc": ("ssc-mts-dsssb-mock-test-1", ["general-knowledge-mock-test-1", "reasoning-mock-test-2", "english-mock-test-1"]),
    "railway": ("railway-ntpc-group-d-mock-test-1", ["general-science-mock-test-1", "reasoning-mock-test-2", "maths-mock-test-2"]),
    "bank": ("bank-clerk-po-mock-test-1", ["reasoning-mock-test-3", "maths-mock-test-3", "english-mock-test-1"]),
    "teaching": ("teaching-tet-mock-test-1", ["hindi-mock-test-1", "english-mock-test-1", "general-knowledge-mock-test-2"]),
    "engineering": ("engineering-psu-aptitude-mock-test-1", ["reasoning-mock-test-3", "maths-mock-test-3", "computer-awareness-mock-test-1"]),
    "psc": ("upsc-state-psc-gs-mock-test-1", ["indian-polity-mock-test-1", "general-science-mock-test-1", "general-knowledge-mock-test-2"]),
}


def curl(*a, body=None):
    cmd = ["curl", "-s", "--max-time", "120", "-H", "User-Agent: EJ-Engine/1.0", *a]
    if body is not None:
        open("/tmp/_mk.json", "w").write(json.dumps(body))
        cmd += ["-H", "Content-Type: application/json", "--data-binary", "@/tmp/_mk.json"]
    return subprocess.run(cmd, capture_output=True, text=True).stdout


def page_html(t, sections, exam_label, nxt, url):
    n = sum(len(q) for _, q in sections)
    dur = max(10, round(n * 0.75))
    data = {"id": t, "title": TITLES[t], "exam": exam_label, "duration": dur, "marking": {"correct": 1, "wrong": 0.25},
            "sections": [{"name": s, "questions": q} for s, q in sections], "next": nxt, "url": url}
    b64 = lambda t: __import__("base64").b64encode(t.encode("utf-8")).decode()
    boot = ("<script>!function(){function d(b){return decodeURIComponent(escape(atob(b)))}"
            f'window.__EJQ=JSON.parse(d("{b64(json.dumps(data, ensure_ascii=False))}"));new Function(d("{b64(JS)}"))()' + "}()</script>")
    subj = ", ".join(s for s, _ in sections)
    intro = (f"<p>Practise with this <strong>free online {html.escape(TITLES[t])}</strong> – {n} questions, {dur} minutes, covering {html.escape(subj)}. "
             f"Useful for <strong>{html.escape(exam_label)}</strong>. Get your score, section-wise analysis and the full solution of every question as soon as you submit.</p>")
    more = "".join(f'<li><a href="{x["u"]}">{html.escape(x["t"])}</a></li>' for x in nxt)
    return (intro + f"<style>{CSS_MIN}</style>" + '<div id="ejq"></div>' + boot
            + "<h2>How to attempt this mock test</h2><ol><li>Click <strong>Start Test</strong> – the timer starts.</li><li>Choose an option; use <strong>Review</strong> to come back later.</li>"
              "<li>Submit to see your score, accuracy and solutions. Retake as many times as you like – it is free.</li></ol>"
            + (f"<h2>More Free Mock Tests</h2><ul>{more}</ul>" if more else "")
            + f'<p>👉 See all tests on the <a href="{SITE}/free-mock-test/"><strong>Free Mock Test Series</strong></a> page.</p>')


TITLES = {s[0]: s[1] for s in SECTIONAL + FULL}


def main():
    only = None
    if "--only" in sys.argv:
        only = set(sys.argv[sys.argv.index("--only") + 1].split(","))
    existing = {p["slug"]: p for p in json.loads(curl(f"{SITE}/wp-json/wp/v2/ej_test?per_page=100&status=publish,draft&_fields=id,slug,link,featured_media"))}
    links = {}
    for slug, _t, *_ in SECTIONAL + FULL:
        links[slug] = existing.get(slug, {}).get("link", f"{SITE}/mock-test/{slug}/")
    exam_of = {}
    for k, (full, secs) in EXAMS.items():
        exam_of.setdefault(full, k)
    for slug, title, label, char, theme, build in FULL + SECTIONAL:
        if only and slug not in only:
            continue
        sections = build()
        is_full = slug in exam_of
        if is_full:
            nxt = [{"t": TITLES[s], "u": links[s]} for s in EXAMS[exam_of[slug]][1]]
        else:
            nxt = [{"t": TITLES[f], "u": links[f]} for f, _ in list(EXAMS.values())[:3]]
        content = page_html(slug, sections, label, nxt, links[slug])
        n = sum(len(q) for _, q in sections)
        body = {"title": title + f" ({n} Questions)", "slug": slug, "status": "publish", "content": content,
                "excerpt": f"Free online {title}: {n} questions with timer, score and solutions."}
        pid = existing.get(slug, {}).get("id")
        if "--no-images" not in sys.argv and not existing.get(slug, {}).get("featured_media"):
            spec = {"slug": slug, "type": "ej_test", "title": title, "image": {"tag": "FREE MOCK TEST", "org": label, "character": char, "theme": theme,
                    "headline": title.replace(" – ", "<br><em>").replace("Mock Test", "Mock Test") + ("</em>" if " – " in title else ""),
                    "chips": [["Questions", str(n)], ["Time", f"{max(10, round(n * .75))} min"], ["Solutions", "Included"], ["Price", "FREE", True]]}}
            img = f"/tmp/_mock_{slug}.jpg"
            wp.featured_image(spec, img)
            body["featured_media"] = wp.upload(img, title, title)
        r = json.loads(curl("-X", "POST", f"{SITE}/wp-json/wp/v2/ej_test/{pid}" if pid else f"{SITE}/wp-json/wp/v2/ej_test", body=body))
        if "id" not in r:
            print("FAIL", slug, str(r)[:200]); continue
        links[slug] = r["link"]
        curl("-X", "POST", f"{SITE}/wp-json/rankmath/v1/updateMeta", body={"objectType": "post", "objectID": r["id"], "meta": {
            "rank_math_title": f"{title} – Free Online Test with Solutions | Employment Junction",
            "rank_math_description": f"Attempt the free {title} online: {n} questions, timer, instant score and detailed solutions. Best practice for {label}."[:160],
            "rank_math_focus_keyword": title.split(" – ")[0]}})
        print("ok", r["link"])
    json.dump({"links": links, "titles": TITLES, "exams": EXAMS}, open(os.path.join(HERE, "MOCK_INDEX.json"), "w"), indent=1)


if __name__ == "__main__":
    main()
