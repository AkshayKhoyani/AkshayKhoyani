"""Mock tests v2 — syllabus-accurate, exam-wise, PYQ and topic-wise.

Sources (engine/mock/data):
  blueprints.json   official pattern + topic weightage per exam  -> full-length mocks (3 sets per exam)
  bank/*.json       original topic-wise questions                  -> topic-wise tests + pool for full mocks
  pyq/*.json        official previous papers + official keys       -> one test per paper (exact paper) + pool
  gen.py / gen2.py  computed maths & reasoning (always correct)    -> topic-wise tests + pool
Every test page carries the exam pattern table and the topic coverage table (that is what makes it "syllabus-wise").

Usage: python3 engine/mock/build_v2.py [--plan] [--only kind] [--no-images] [--sets 3]
  --plan       print what would be built (no publishing)
  --only       full,pyq,topic,state (comma list)
"""
import glob
import hashlib
import html
import json
import os
import random
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.dirname(HERE))
import banks  # noqa: E402
import gen2  # noqa: E402
from build_tests import CSS_MIN, JS, SITE, curl  # noqa: E402

DATA = os.path.join(HERE, "data")
ARGS = sys.argv
PLAN = "--plan" in ARGS
ONLY = set(ARGS[ARGS.index("--only") + 1].split(",")) if "--only" in ARGS else {"full", "pyq", "topic", "state"}
SETS = int(ARGS[ARGS.index("--sets") + 1]) if "--sets" in ARGS else 3


def slugify(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def seed_of(*parts):
    return int(hashlib.md5("|".join(map(str, parts)).encode()).hexdigest()[:8], 16)


# ---------------- question pools ----------------
POOL = {}  # topic -> list of questions {q,o,a,e,src?}


def add(topic, q):
    if len(q.get("o", [])) == 4 and isinstance(q.get("a"), int) and 0 <= q["a"] < 4 and q.get("q"):
        POOL.setdefault(topic, []).append({k: q[k] for k in ("q", "o", "a", "e") if k in q} | ({"src": q["src"]} if q.get("src") else {}))


for f in sorted(glob.glob(os.path.join(DATA, "bank", "*.json"))):
    for q in json.load(open(f)):
        add(q.get("topic") or os.path.basename(f)[:-5], q)
LEGACY = {"GK": "General Knowledge", "SCIENCE": "General Science", "POLITY": "Polity", "GUJARAT": "Gujarat GK", "COMPUTER": "Computer", "ENGLISH": "English (Mixed)", "HINDI": "Hindi Grammar"}
for k, topic in LEGACY.items():
    for q, o, a, e in banks.BANKS[k]:
        add(topic, {"q": q, "o": o, "a": a, "e": e})

PYQ = []
for f in sorted(glob.glob(os.path.join(DATA, "pyq", "*.json"))):
    try:
        p = json.load(open(f))
    except ValueError:
        continue
    qs = [q for q in p.get("questions", []) if len(q.get("o", [])) == 4 and isinstance(q.get("a"), int)]
    if len(qs) < 20:
        continue
    p["questions"], p["file"] = qs, os.path.basename(f)[:-5]
    PYQ.append(p)
    for q in qs:
        add(q.get("topic") or q.get("section") or "General Knowledge", dict(q, src=f"PYQ: {p['exam']} {p['year']}"))

GS = ["Polity", "Ancient History", "Medieval History", "Modern History", "Indian Geography", "World Geography", "Economy", "Physics", "Chemistry",
      "Biology", "Static GK", "Art & Culture", "General Knowledge", "General Science", "Computer"]
SCI = ["Physics", "Chemistry", "Biology", "General Science"]
HIST = ["Ancient History", "Medieval History", "Modern History"]
ENG_V, ENG_G = ["English Vocabulary"], ["English Grammar", "English (Mixed)"]
PED = ["Child Development & Pedagogy"]
GUJ = ["Gujarat History", "Gujarat Geography", "Gujarat Culture", "Gujarat GK"]
ALIAS = {
    "Science & Technology": SCI, "Science Content": SCI, "General Science": SCI, "Environment & Ecology": ["Biology", "Indian Geography"],
    "Geography Content": ["Indian Geography", "World Geography"], "History Content": HIST, "History": HIST, "Geography": ["Indian Geography", "World Geography"],
    "Social & Political Life Content": ["Polity", "Constitution & Panchayati Raj"], "Books & Authors": ["Static GK"], "Awards & Honours": ["Static GK"],
    "Sports": ["Static GK"], "Static GK": ["Static GK", "General Knowledge"], "Rights & RTI": ["Polity"], "Public Administration": ["Polity"],
    "Indian Polity": ["Polity"], "Constitution": ["Polity", "Constitution & Panchayati Raj"], "Gujarat Panchayati Raj": ["Constitution & Panchayati Raj"],
    "Synonyms": ENG_V, "Antonyms": ENG_V, "One Word Substitution": ENG_V, "Idioms & Phrases": ENG_V, "Spelling Correction": ENG_V, "Word Usage": ENG_V,
    "Error Spotting": ENG_G, "Fill in the Blanks": ENG_G, "Sentence Improvement": ENG_G, "Active Passive Voice": ENG_G, "Direct Indirect Speech": ENG_G,
    "Grammar": ENG_G, "Cloze Test": ENG_G, "Para Jumbles": ENG_G, "Reading Comprehension": ENG_G, "Language Comprehension": ENG_G,
    "Child Development & Pedagogy": PED, "Learning & Pedagogy": PED, "Inclusive Education": PED, "Language Pedagogy": PED, "Mathematics Pedagogy": PED,
    "Science Pedagogy": PED, "EVS Pedagogy": PED, "Social Studies Pedagogy": PED, "EVS Content": ["Biology", "Indian Geography"],
    "Gujarat History": ["Gujarat History", "Gujarat GK"], "Gujarat Geography": ["Gujarat Geography", "Gujarat GK"], "Gujarat Culture": ["Gujarat Culture", "Gujarat GK"],
    "Bihar GK": ["Bihar GK"], "Delhi GK": ["Delhi GK"], "Uttar Pradesh GK": ["Uttar Pradesh GK"],
}
for t in ["Hindi Grammar", "Hindi Sahitya", "Paryayvachi", "Vilom Shabd", "Sandhi", "Samas", "Muhavare & Lokoktiyan", "Vakya Shuddhi", "Tatsam Tadbhav",
          "Upsarg Pratyay", "Anekarthi & Ek Shabd", "Ras Chhand Alankar"]:
    ALIAS[t] = ["Hindi Grammar"]
REASON = [g for t in ["Series", "Coding-Decoding", "Classification", "Direction", "Order & Ranking", "Analogy", "Blood Relation", "Syllogism", "Calendar & Clock",
                      "Inequality", "Dictionary Order", "Mathematical Operations", "Missing Number", "Ages"] for g in gen2.TOPIC_GENS[t]]
MATHS = [g for t in ["Percentage", "Profit & Loss", "Simple Interest", "Compound Interest", "Ratio & Proportion", "Average", "Time & Work", "Speed Time Distance",
                     "Number System", "Simplification", "Mensuration", "Algebra", "Geometry", "Boats & Streams", "Partnership", "Mixture & Alligation"] for g in gen2.TOPIC_GENS[t]]


def family(section):
    s = section.lower()
    if re.search(r"reason|intelligence|mental", s):
        return "gen", REASON
    if re.search(r"quant|math|numer|arith|data interp", s):
        return "gen", MATHS
    if "english" in s:
        return "pool", ENG_G + ENG_V
    if "hindi" in s or "हिं" in s:
        return "pool", ["Hindi Grammar"]
    if "gujarati" in s:
        return "pool", [t for t in POOL if t.lower().startswith("gujarati")]
    if re.search(r"pedagog|child", s):
        return "pool", PED
    if "computer" in s:
        return "pool", ["Computer"]
    if "gujarat" in s:
        return "pool", GUJ
    return "pool", GS


class Drawer:
    """Rotates through each topic pool across the sets of one exam (fresh questions first), never repeating inside one test."""

    def __init__(self, key):
        self.key, self.pos, self.in_test = key, {}, set()

    def new_test(self):
        self.in_test = set()

    def take(self, topics, n, rng):
        out = []
        topics = [t for t in topics if POOL.get(t)]
        k = 0
        while len(out) < n and topics and k < n * 10:
            t = topics[k % len(topics)]; k += 1
            pool = POOL[t]
            order = sorted(range(len(pool)), key=lambda i: seed_of(self.key, t, i))
            for _ in range(len(pool)):
                p = self.pos.get(t, 0); self.pos[t] = p + 1
                i = order[p % len(pool)]
                if (t, i) not in self.in_test:
                    self.in_test.add((t, i)); out.append(shuffle(pool[i], rng)); break
        return out


def shuffle(q, rng):
    if any(re.search(r"no error|none of these|all of these|both", o, re.I) for o in q["o"]):
        out = dict(q)
    else:
        idx = list(range(4)); rng.shuffle(idx)
        out = dict(q, o=[q["o"][i] for i in idx], a=idx.index(q["a"]))
    if out.get("src"):
        out["e"] = (out.get("e", "") + f" ({out['src']})").strip()
    out.pop("src", None)
    return out


def fill_section(sec, drawer, exam_key, k, alt_lang=None):
    rng = random.Random(seed_of(exam_key, sec["name"], k))
    want, got, cover = sec["questions"], [], {}
    for topic, c in sec["topics"].items():
        if c <= 0:
            continue
        qs = gen2.gen_topic(topic, seed_of(exam_key, topic, k), c) if topic in gen2.TOPIC_GENS else drawer.take(ALIAS.get(topic, [topic]), c, rng)
        cover[topic] = (c, len(qs))
        got += qs
    if len(got) < want:  # same-section fallback, never another subject
        kind, src = family(sec["name"])
        need = want - len(got)
        extra = gen2.gen_funcs(src, seed_of(exam_key, sec["name"], k, "fb"), need) if kind == "gen" else drawer.take(src, need, rng)
        got += extra
    rng.shuffle(got)
    return got[:want], cover


# ---------------- page ----------------
def pattern_table(bp, built):
    rows = "".join(f"<tr><td>{html.escape(s['name'])}</td><td>{s['questions']}</td><td>{len(q)}</td></tr>" for s, (q, _) in zip(bp["sections"], built))
    return ('<table class="ejp-t"><tbody><tr><th>Section</th><th>Questions (official)</th><th>In this mock</th></tr>' + rows +
            f"<tr><td><b>Total</b></td><td><b>{sum(s['questions'] for s in bp['sections'])}</b></td><td><b>{sum(len(q) for q, _ in built)}</b></td></tr></tbody></table>")


def coverage_table(bp, built):
    rows = ""
    for s, (_, cover) in zip(bp["sections"], built):
        tops = ", ".join(f"{html.escape(t)} ({c})" for t, (c, _) in cover.items())
        rows += f"<tr><td>{html.escape(s['name'])}</td><td>{tops}</td></tr>"
    return '<table class="ejp-t"><tbody><tr><th>Section</th><th>Syllabus topics covered (questions)</th></tr>' + rows + "</tbody></table>"


def quiz_html(title, label, sections, minutes, pos, neg, nxt, url):
    import base64
    b64 = lambda t: base64.b64encode(t.encode("utf-8")).decode()
    data = {"id": slugify(title), "title": title, "exam": label, "duration": minutes, "marking": {"correct": pos, "wrong": neg},
            "sections": [{"name": n, "questions": q} for n, q in sections if q], "next": nxt, "url": url}
    return (f"<style>{CSS_MIN}</style>" + '<div id="ejq"></div>' + "<script>!function(){function d(b){return decodeURIComponent(escape(atob(b)))}"
            f'window.__EJQ=JSON.parse(d("{b64(json.dumps(data, ensure_ascii=False))}"));new Function(d("{b64(JS)}"))()' + "}()</script>")


HOWTO = ("<h2>📝 How to attempt</h2><ol><li>Tap <strong>Start Test</strong> — the timer starts.</li><li>Pick an option; mark <strong>Review</strong> to come back.</li>"
         "<li>Submit to see score, accuracy, section-wise analysis and the solution of every question. Retake any time — 100% free, no login.</li></ol>")


def footer_links(nxt):
    more = "".join(f'<li><a href="{x["u"]}">{html.escape(x["t"])}</a></li>' for x in nxt)
    return (f"<h2>🎯 More Free Mock Tests</h2><ul>{more}</ul>" if more else "") + \
        f'<p>👉 All tests: <a href="{SITE}/free-mock-test/"><strong>Free Mock Test Series 2026</strong></a> · Follow <a href="https://www.instagram.com/employmentjunction.in/" target="_blank" rel="noopener"><strong>@employmentjunction.in</strong></a> for daily practice.</p>'


# ---------------- catalog ----------------
FAMILY_ART = [  # (regex on exam name, character, theme, hub group)
    (r"police|constable|lrd|cpo|gd", "police", "green", "Police & Defence"), (r"rrb|railway|ntpc|alp|group d", "railway", "sky", "Railway"),
    (r"ibps|sbi|bank", "bank", "sky", "Banking"), (r"ctet|tet|teacher", "teacher", "violet", "Teaching"), (r"upsc|psc|cse", "office", "violet", "UPSC & State PSC"),
    (r"ssc", "office", "gold", "SSC"), (r"gsssb|gpssb|talati|gujarat", "office", "green", "Gujarat Exams")]


def art(name):
    for rx, ch, th, grp in FAMILY_ART:
        if re.search(rx, name, re.I):
            return ch, th, grp
    return "student_result", "gold", "Other Exams"


def catalog():
    items = []
    bps = json.load(open(os.path.join(DATA, "blueprints.json")))
    if "full" in ONLY:
        for key, bp in bps.items():
            if key.startswith("_") or "generic" in key:
                continue
            drawer = Drawer(key)
            for k in range(1, SETS + 1):
                drawer.new_test()
                built = [fill_section(s, drawer, key, k) for s in bp["sections"]]
                n = sum(len(q) for q, _ in built)
                total = sum(s["questions"] for s in bp["sections"])
                if n < 0.6 * total:
                    print("skip (too few questions)", key, k, n, "/", total); continue
                mins = bp.get("duration_min") or round(total * .8)
                mins = mins if n >= .9 * total else max(10, round(mins * n / total))
                pos, neg = bp.get("marks_per_q") or 1, bp.get("negative") or 0
                if not isinstance(pos, (int, float)):
                    pos = 1
                ch, th, grp = art(bp["exam"])
                items.append({"kind": "full", "group": grp, "exam_key": key, "set": k, "slug": f"{key}-mock-test-{k}",
                              "title": f"{bp['exam']} Mock Test {k} – Full Length, Syllabus-wise", "label": bp["exam"], "char": ch, "theme": th,
                              "sections": [(s["name"], q) for s, (q, _) in zip(bp["sections"], built)], "minutes": mins, "pos": pos, "neg": neg,
                              "extra": (f"<h2>📋 {html.escape(bp['exam'])} – Exam Pattern</h2>" + pattern_table(bp, built) +
                                        f"<p>Marking: +{pos} per correct answer" + (f", −{neg} per wrong answer" if neg else ", no negative marking") +
                                        f"; time: {bp.get('duration_min')} minutes (official). Pattern from the official scheme" +
                                        (f" (<a href=\"{html.escape(bp['source'])}\" target=\"_blank\" rel=\"noopener nofollow\">source</a>)" if bp.get("source") else "") + ".</p>"
                                        f"<h2>📚 Syllabus Coverage of this Mock</h2>" + coverage_table(bp, built) +
                                        "<p>Topic weightage follows the official syllabus and the topic mix of recent official papers.</p>")})
    if "pyq" in ONLY:
        for p in PYQ:
            secs = {}
            for q in p["questions"]:
                secs.setdefault(q.get("section") or "General", []).append(shuffle(dict(q, src=None), random.Random(0)) if False else
                                                                            {k: q[k] for k in ("q", "o", "a", "e")})
            ch, th, grp = art(p["exam"])
            n = len(p["questions"])
            items.append({"kind": "pyq", "group": grp, "slug": f"{slugify(p['file'])}-previous-year-paper", "label": p["exam"], "char": ch, "theme": th,
                          "title": f"{p['exam']} {p.get('paper', '')} {p['year']} – Previous Year Paper Mock Test (Official Answer Key)".replace("  ", " "),
                          "sections": list(secs.items()), "minutes": p.get("duration_min") or round(n * .9), "pos": p.get("marks_per_q") or 1,
                          "neg": p.get("negative") or 0,
                          "extra": (f"<h2>📄 About this paper</h2><p>Real questions of <strong>{html.escape(p['exam'])} {p['year']}</strong> ({n} questions), answers as per the "
                                    f"<strong>official answer key</strong> released by {html.escape(p.get('board', 'the board'))}. Explanations are written by Employment Junction. "
                                    + (f'Official <a href="{html.escape(p["source_paper"])}" target="_blank" rel="noopener nofollow">question paper</a>' if p.get("source_paper") else "")
                                    + (f' · <a href="{html.escape(p["source_key"])}" target="_blank" rel="noopener nofollow">answer key</a>' if p.get("source_key") else "") + ".</p>")})
    if "topic" in ONLY:
        for t, qs in sorted(POOL.items()):
            if len(qs) < 20 or t in LEGACY.values() or t.endswith(" GK") and t != "Static GK":
                continue
            d = Drawer("topic-" + t)
            sel = d.take([t], min(30, len(qs)), random.Random(seed_of(t)))
            items.append({"kind": "topic", "group": "Topic-wise", "slug": f"{slugify(t)}-mock-test", "label": f"{t} – all govt exams", "char": "student_result",
                          "theme": "gold", "title": f"{t} Mock Test – Topic-wise Practice", "sections": [(t, sel)], "minutes": max(10, round(len(sel) * .7)),
                          "pos": 1, "neg": 0.25, "extra": ""})
        for t in sorted(gen2.TOPIC_GENS):
            if t in ("Series", "Direction Sense", "Odd One Out", "Ages", "HCF & LCM", "Pipes & Cisterns", "Calendar & Clock", "Alphanumeric Series", "Discount",
                     "Problems on Age", "Ranking"):
                continue  # aliases
            qs = gen2.gen_topic(t, seed_of("topic", t), 20)
            if len(qs) < 10:
                continue
            maths = any(f in MATHS for f in gen2.TOPIC_GENS[t]) or t in ("Trigonometry", "Height & Distance", "Probability", "Statistics", "Data Interpretation",
                                                                          "Approximation", "Quadratic Equations", "Pipes & Cistern", "LCM & HCF")
            sec = "Quantitative Aptitude" if maths else "Reasoning"
            items.append({"kind": "topic", "group": "Topic-wise", "slug": f"{slugify(t)}-questions-mock-test", "label": f"{sec}: {t}",
                          "char": "admit_card" if maths else "answer_key", "theme": "sky" if maths else "violet",
                          "title": f"{t} Questions – {sec} Mock Test (SSC, Railway, Bank)", "sections": [(t, qs)], "minutes": 20, "pos": 1, "neg": 0.25, "extra": ""})
    if "state" in ONLY:
        for t, qs in sorted(POOL.items()):
            if not (t.endswith(" GK") and t not in ("Static GK", "General Knowledge")) or len(qs) < 15:
                continue
            state = t[:-3]
            sel = Drawer("state-" + t).take([t] + (GUJ if state == "Gujarat" else []), min(30, len(qs)), random.Random(seed_of(t)))
            items.append({"kind": "state", "group": "State GK", "slug": f"{slugify(state)}-gk-mock-test", "label": f"{state} state exams (Police, PSC, SSB)",
                          "char": "police", "theme": "green", "title": f"{state} GK Mock Test – State Exams Practice", "sections": [(f"{state} GK", sel)],
                          "minutes": max(10, round(len(sel) * .7)), "pos": 1, "neg": 0.25, "extra": ""})
    return items


def publish(items):
    import wp
    existing = {}
    for pg in range(1, 6):
        d = json.loads(curl(f"{SITE}/wp-json/wp/v2/ej_test?per_page=100&page={pg}&status=publish&_fields=id,slug,link,featured_media") or "[]")
        if not isinstance(d, list) or not d:
            break
        existing.update({p["slug"]: p for p in d})
    links = {it["slug"]: existing.get(it["slug"], {}).get("link", f"{SITE}/mock-test/{it['slug']}/") for it in items}
    by_group = {}
    for it in items:
        by_group.setdefault((it["kind"], it.get("exam_key") or it["group"]), []).append(it)
    for it in items:
        n = sum(len(q) for _, q in it["sections"])
        sibl = [x for x in by_group[(it["kind"], it.get("exam_key") or it["group"])] if x is not it][:4]
        nxt = [{"t": x["title"], "u": links[x["slug"]]} for x in sibl]
        title = f"{it['title']} ({n} Questions)"
        intro = (f"<p>Attempt this <strong>free online {html.escape(it['title'])}</strong> — {n} questions, {it['minutes']} minutes, instant score, section-wise "
                 f"analysis and full solutions. Best practice for <strong>{html.escape(it['label'])}</strong>.</p>")
        content = intro + quiz_html(it["title"], it["label"], it["sections"], it["minutes"], it["pos"], it["neg"], nxt, links[it["slug"]]) + it["extra"] + HOWTO + footer_links(nxt)
        body = {"title": title, "slug": it["slug"], "status": "publish", "content": content,
                "excerpt": f"Free online {it['title']}: {n} questions with timer, score and solutions."}
        ex = existing.get(it["slug"], {})
        if "--no-images" not in ARGS and not ex.get("featured_media"):
            head = it["title"].split(" – ")
            spec = {"slug": it["slug"], "type": "ej_test", "title": it["title"], "image": {
                "tag": {"full": "FULL MOCK TEST", "pyq": "PREVIOUS YEAR PAPER", "topic": "TOPIC-WISE TEST", "state": "STATE GK TEST"}[it["kind"]],
                "org": it["label"][:60], "character": it["char"], "theme": it["theme"],
                "headline": html.escape(head[0]) + (f"<br><em>{html.escape(head[1])}</em>" if len(head) > 1 else ""),
                "chips": [["Questions", str(n)], ["Time", f"{it['minutes']} min"], ["Price", "FREE", True]]}}
            img = f"/tmp/_mock_{it['slug']}.jpg"
            wp.featured_image(spec, img)
            body["featured_media"] = wp.upload(img, it["title"], it["title"])
        pid = ex.get("id")
        r = json.loads(curl("-X", "POST", f"{SITE}/wp-json/wp/v2/ej_test/{pid}" if pid else f"{SITE}/wp-json/wp/v2/ej_test", body=body) or "{}")
        if "id" not in r:
            print("FAIL", it["slug"], str(r)[:200], flush=True); continue
        links[it["slug"]] = r["link"]
        curl("-X", "POST", f"{SITE}/wp-json/rankmath/v1/updateMeta", body={"objectType": "post", "objectID": r["id"], "meta": {
            "rank_math_title": f"{it['title']} – Free Online Test | Employment Junction"[:70],
            "rank_math_description": f"Free {it['title']}: {n} questions, timer, instant score and detailed solutions. Practice for {it['label']}."[:160],
            "rank_math_focus_keyword": it["title"].split(" – ")[0]}})
        print("ok", it["kind"], r["link"], n, flush=True)
    idx = {"items": [{"slug": it["slug"], "kind": it["kind"], "group": it["group"], "exam_key": it.get("exam_key"), "title": it["title"],
                      "n": sum(len(q) for _, q in it["sections"]), "link": links[it["slug"]]} for it in items]}
    json.dump(idx, open(os.path.join(HERE, "MOCK_INDEX_V2.json"), "w"), indent=1, ensure_ascii=False)


if __name__ == "__main__":
    its = catalog()
    if PLAN:
        from collections import Counter
        print(Counter(i["kind"] for i in its))
        for i in its:
            print(i["kind"], i["slug"], sum(len(q) for _, q in i["sections"]), i["minutes"], "min")
    else:
        publish(its)
