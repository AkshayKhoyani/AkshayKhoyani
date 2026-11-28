"""/free-mock-test/ hub (page 2394) from MOCK_INDEX_V2.json + the older tests in MOCK_INDEX.json. Usage: python3 engine/mock/hub_v2.py"""
import html
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HERE))
import wp  # noqa: E402

V2 = json.load(open(os.path.join(HERE, "MOCK_INDEX_V2.json")))["items"]
OLD = json.load(open(os.path.join(HERE, "MOCK_INDEX.json")))
CSS = (".ejhub{font-family:Inter,system-ui,sans-serif;contain:inline-size}.ejhub *{box-sizing:border-box}"
       ".ejhub-top{border-radius:22px;padding:24px;color:#fff;background:linear-gradient(120deg,#ef233c,#7c3aed,#2563eb,#ef233c);background-size:300% 300%;animation:ejhg 10s ease infinite}"
       "@keyframes ejhg{0%,100%{background-position:0 50%}50%{background-position:100% 50%}}.ejhub-top h2{color:#fff!important;margin:6px 0!important;font-size:26px;background:none!important;border:0!important;padding:0!important}"
       ".ejhub-top p{margin:0;color:#f3e8ff}.ejhub-st{display:flex;flex-wrap:wrap;gap:10px;margin-top:14px}.ejhub-st div{background:rgba(255,255,255,.15);border-radius:12px;padding:8px 14px}.ejhub-st b{display:block;font-size:22px;color:#ffd60a}"
       ".ejhub-tabs>input{position:absolute;opacity:0}.ejhub-tl{display:flex;gap:8px;overflow-x:auto;margin:20px 0 12px;scrollbar-width:none}.ejhub-tl label{flex:0 0 auto;cursor:pointer;border:1px solid #dbe2ee;border-radius:999px;padding:9px 16px;font-weight:800;background:#fff;color:#0f172a}"
       ".ejhub-p{display:none}.ejhub h3{margin:18px 0 8px!important;color:#0b2a66!important;font-size:19px}"
       ".ejhub-g{display:grid;gap:10px;grid-template-columns:repeat(auto-fill,minmax(250px,1fr))}.ejhub-g a{display:block;background:#fff;border:1px solid #e6ebf4;border-left:5px solid var(--c,#2563eb);border-radius:14px;padding:12px 14px;color:#0f172a!important;text-decoration:none!important;font-weight:800;font-size:14.5px;line-height:1.35;box-shadow:0 4px 12px rgba(15,23,42,.05);transition:transform .2s}"
       ".ejhub-g a:hover{transform:translateY(-3px)}.ejhub-g a small{display:block;color:#64748b;font-weight:600;margin-top:4px}")
TABS = [("full", "🏆 Exam-wise Full Mocks", "#2563eb"), ("pyq", "📄 Previous Year Papers", "#dc2626"), ("topic", "📚 Topic-wise", "#16a34a"),
        ("state", "🗺️ State GK", "#ea580c"), ("old", "⚡ Quick Tests", "#7c3aed")]


def card(t, u, sub, c):
    return f'<a href="{u}" style="--c:{c}">{html.escape(t)}<small>{html.escape(sub)}</small></a>'


def main():
    parts, css_on = [], ""
    for i, (kind, label, c) in enumerate(TABS, 1):
        css_on += f"#ejhb{i}:checked~.ejhub-tl label[for=ejhb{i}]{{background:{c};color:#fff;border-color:{c}}}#ejhb{i}:checked~.ejhub-p{i}{{display:block}}"
        if kind == "old":
            body = '<div class="ejhub-g">' + "".join(card(OLD["titles"][s], u, "Sectional / quick test", c) for s, u in OLD["links"].items()) + "</div>"
        else:
            items = [x for x in V2 if x["kind"] == kind]
            groups = {}
            for x in items:
                groups.setdefault(x["group"], []).append(x)
            body = "".join(f"<h3>{html.escape(g)}</h3><div class=\"ejhub-g\">" + "".join(card(x["title"], x["link"], f"{x['n']} questions · Free", c) for x in xs) + "</div>"
                           for g, xs in groups.items()) or "<p>Coming soon.</p>"
        parts.append(f'<div class="ejhub-p ejhub-p{i}">{body}</div>')
    radios = "".join(f'<input type="radio" name="ejhb" id="ejhb{i}"{" checked" if i == 1 else ""}>' for i in range(1, len(TABS) + 1))
    tl = '<div class="ejhub-tl">' + "".join(f'<label for="ejhb{i}">{l}</label>' for i, (_, l, _) in enumerate(TABS, 1)) + "</div>"
    nq = sum(x["n"] for x in V2)
    top = (f'<div class="ejhub-top"><span style="background:#ffd60a;color:#000;font-weight:900;font-size:12px;padding:5px 12px;border-radius:999px">🎯 100% FREE · NO LOGIN</span>'
           f"<h2>Free Mock Test Series 2026 – Syllabus-wise, Exam-wise</h2><p>Official exam pattern, syllabus-wise topic weightage, previous year papers with official answer keys, "
           f"timer, instant score and full solutions.</p><div class=\"ejhub-st\"><div><b>{len(V2) + len(OLD['links'])}</b>Tests</div><div><b>{nq:,}+</b>Questions</div>"
           f"<div><b>{len({x.get('exam_key') for x in V2 if x.get('exam_key')})}</b>Exams</div></div></div>")
    content = (f"<style>{CSS}{css_on}</style><div class=\"ejhub\">{top}<div class=\"ejhub-tabs\">{radios}{tl}{''.join(parts)}</div></div>"
               "<h2>Why these mock tests?</h2><ul><li>Every full mock follows the <strong>official exam pattern</strong> (sections, questions, time, negative marking).</li>"
               "<li>Questions are spread by the <strong>syllabus weightage</strong> of each topic.</li><li><strong>Previous year papers</strong> use the official answer key.</li>"
               "<li>Maths &amp; reasoning answers are computed, so they are always correct; every question has a solution.</li></ul>"
               '<p>New tests are added every day. Follow <a href="https://www.instagram.com/employmentjunction.in/" target="_blank" rel="noopener"><strong>@employmentjunction.in</strong></a>.</p>')
    content = content.replace("\n", "")
    r = wp.req("POST", "/wp/v2/pages/2394", {"content": content, "title": "Free Mock Test Series 2026 – Online Test for All Govt Exams"})
    print("hub", r.get("link"))


if __name__ == "__main__":
    main()
