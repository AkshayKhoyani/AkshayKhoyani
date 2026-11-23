"""Builds specs for admit card / result / answer key pages (same renderer as jobs)."""
import json, sys
TYPES = {"admit": ("ej_admit_card", "ADMIT CARD", "Download Admit Card"), "result": ("ej_result", "RESULT", "Check Result"),
         "answer": ("ej_answer_key", "ANSWER KEY", "Download Answer Key"), "syllabus": ("ej_syllabus", "SYLLABUS", "Download Syllabus")}

def build(u):
    ptype, tag, action = TYPES[u["kind"]]
    s = {"type": ptype, "slug": u["slug"], "title": u["title"], "short": u["short"],
         "seo": {"title": u["seo_title"] + " | Employment Junction", "description": u["desc"], "keyword": u["keyword"]},
         "image": {"tag": tag, "org": u["org"], "headline": u["headline"], "chips": u["chips"]},
         "summary": [["Update Date", u["update_date"]], ["Organization", u["org_full"]], ["Exam / Recruitment", u["exam"]], ["Status", u["status"]]],
         "intro": u["intro"], "table": u["table"], "sections": [], "links": u["links"], "faq": u["faq"], "final": u["final"],
         "schema_description": u["desc"]}
    if u.get("dates"):
        s["sections"].append({"h": "Important Dates", "th": ["Event", "Date"], "table": u["dates"]})
    s["sections"] += u.get("extra", [])
    s["sections"].append({"h": f"How to {action}", "ol": u["steps"]})
    if u.get("details"):
        s["sections"].append({"h": "Details Mentioned on " + ("Admit Card" if u["kind"] == "admit" else "the Document"), "ul": u["details"]})
    return s

if __name__ == "__main__":
    for f in sys.argv[1:]:
        u = json.load(open(f))
        out = f.replace(".in.json", ".json")
        json.dump(build(u), open(out, "w"), indent=2, ensure_ascii=False)
        print(out)
