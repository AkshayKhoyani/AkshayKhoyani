"""Mock-test highlight blocks for job / admit card / syllabus pages, and the /free-mock-test/ hub page."""
import html
import json
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
IDX = json.load(open(os.path.join(HERE, "MOCK_INDEX.json")))
LINKS, TITLES, EXAMS = IDX["links"], IDX["titles"], IDX["exams"]
HUB = "https://employmentjunction.in/free-mock-test/"

RULES = [
    ("gujarat-police", r"gujarat.*(police|lrd|lokrakshak|constable)|(gprb|lrd|lokrakshak)"),
    ("police", r"police|constable|\bsi\b|sub inspector|fireman|forest guard|jail|warder|\b(capf|bsf|crpf|cisf|itbp|ssb)\b|home guard|platoon"),
    ("railway", r"\brrb\b|\brrc\b|railway|ntpc|group d|loco|station master|konkan"),
    ("bank", r"\bbank\b|\bsbi\b|ibps|\brbi\b|nabard|exim|sidbi|\bpo\b|clerk.*bank|banking"),
    ("teaching", r"teacher|\btet\b|\bdsc\b|tgt|pgt|prt|lecturer|professor|faculty|kvs|nvs|aedo|education"),
    ("psc", r"psc\b|\bpcs\b|\bcse\b|\baso\b|group.?2|\bras\b|\bkas\b|civil service"),
    ("ssc", r"\bssc\b|dsssb|\bmts\b|chsl|cgl|stenographer|clerk|assistant|group c|multi.?tasking"),
    ("engineering", r"engineer|\bje\b|\bae\b|\baee\b|technical|trainee|\bpsu\b|bhel|ntpc|nhpc|\bnlc\b|iocl|cpcl|\bdvc\b|grse|cspdcl|wbsetcl|diploma"),
]
LABEL = {"gujarat-police": "Gujarat Police LRD", "police": "Police Constable & SI", "railway": "Railway (RRB/RRC)", "bank": "Bank Clerk / PO",
         "teaching": "Teaching / TET", "psc": "UPSC / State PSC", "engineering": "Engineering & PSU", "ssc": "SSC / DSSSB / Group C"}

CSS = (".ejm{contain:inline-size;max-width:100%;min-width:0;position:relative;margin:22px 0;border-radius:22px;padding:3px;background:linear-gradient(110deg,#ffb703,#ff4d6d,#7c3aed,#22c55e,#ffb703);background-size:300% 300%;animation:ejmg 6s ease infinite;box-shadow:0 12px 34px rgba(124,58,237,.25)}"
       "@keyframes ejmg{0%{background-position:0 50%}50%{background-position:100% 50%}100%{background-position:0 50%}}"
       ".ejm-in{position:relative;overflow:hidden;border-radius:19px;background:linear-gradient(150deg,#0b2a66,#071a3d);color:#fff;padding:20px 20px 18px}"
       ".ejm-in:after{content:'';position:absolute;top:0;left:-60%;width:40%;height:100%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.18),transparent);animation:ejms 3.2s infinite}"
       "@keyframes ejms{0%{left:-60%}60%,100%{left:130%}}"
       ".ejm-tag{display:inline-block;background:#ff4d6d;color:#fff;font-weight:900;font-size:12px;letter-spacing:1px;padding:5px 12px;border-radius:999px;animation:ejmp 1.4s infinite}"
       "@keyframes ejmp{0%,100%{box-shadow:0 0 0 0 rgba(255,77,109,.7)}50%{box-shadow:0 0 0 9px rgba(255,77,109,0)}}"
       ".ejm h3{overflow-wrap:anywhere;color:#fff!important;margin:10px 0 4px!important;font-size:22px;line-height:1.3}.ejm h3 b{color:#ffd166}"
       ".ejm p{color:#cbd5e1;margin:0 0 14px!important;font-size:15px}"
       ".ejm-go{display:inline-flex;align-items:center;gap:8px;background:linear-gradient(90deg,#ffb703,#ff9933);color:#071a3d!important;font-weight:900;font-size:17px;padding:13px 22px;border-radius:14px;text-decoration:none!important;box-shadow:0 8px 20px rgba(255,153,51,.4);animation:ejmb 2s infinite}"
       "@keyframes ejmb{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}"
       ".ejm-chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}.ejm-chips a{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.25);color:#fff!important;border-radius:999px;padding:7px 13px;font-size:13px;font-weight:700;text-decoration:none!important}"
       ".ejm-chips a:hover{background:#ffb703;color:#071a3d!important}"
       ".ejm-meta{display:flex;flex-wrap:wrap;gap:14px;margin:0 0 14px;font-size:13px;color:#9fb3d1}.ejm-meta span:before{content:'✔ ';color:#4ade80}"
       ".ejm-fab{position:fixed;right:14px;bottom:18px;z-index:9999;display:flex;align-items:center;gap:8px;background:linear-gradient(90deg,#ff4d6d,#7c3aed);color:#fff!important;font-weight:900;font-size:15px;padding:12px 18px;border-radius:999px;text-decoration:none!important;box-shadow:0 10px 30px rgba(124,58,237,.5);animation:ejmp2 1.8s infinite}"
       "@keyframes ejmp2{0%,100%{box-shadow:0 0 0 0 rgba(255,77,109,.6),0 10px 30px rgba(124,58,237,.5)}50%{box-shadow:0 0 0 12px rgba(255,77,109,0),0 10px 30px rgba(124,58,237,.5)}}"
       ".ejm-fab i{font-style:normal;background:#ffd166;color:#071a3d;border-radius:999px;padding:2px 8px;font-size:11px}")


def exam_for(text):
    t = " " + text.lower() + " "
    for key, rx in RULES:
        if re.search(rx, t):
            return key
    return "ssc"


def block(text, compact=False):
    key = exam_for(text)
    full, secs = EXAMS[key]
    chips = "".join(f'<a href="{LINKS[s]}">{html.escape(TITLES[s].replace(" Mock Test", ""))}</a>' for s in secs)
    head = f"<style>{CSS}</style>" if not compact else ""
    if compact:
        return (f'<div class="ejm"><div class="ejm-in"><span class="ejm-tag">FREE</span>'
                f'<h3>Ready for the exam? Take the <b>{LABEL[key]} Mock Test</b></h3>'
                f'<a class="ejm-go" href="{LINKS[full]}">🎯 Start Free Mock Test →</a>'
                f'<div class="ejm-chips">{chips}<a href="{HUB}">All Mock Tests</a></div></div></div>')
    return (head + f'<div class="ejm"><div class="ejm-in"><span class="ejm-tag">🔥 FREE MOCK TEST AVAILABLE</span>'
            f'<h3>Practise for this exam: <b>{html.escape(TITLES[full].split(" – ")[0])}</b></h3>'
            f'<div class="ejm-meta"><span>Real exam pattern</span><span>Timer</span><span>Instant score</span><span>Full solutions</span></div>'
            f'<a class="ejm-go" href="{LINKS[full]}">🎯 Attempt Free Mock Test →</a>'
            f'<div class="ejm-chips">{chips}<a href="{HUB}">+ All Mock Tests</a></div></div></div>'
            f'<a class="ejm-fab" href="{LINKS[full]}">🎯 Mock Test <i>FREE</i></a>')


def hub_html():
    cards = []
    groups = [("Exam-wise Full Mock Tests", [EXAMS[k][0] for k in EXAMS]),
              ("Subject-wise Mock Tests", [s for s in LINKS if s not in {v[0] for v in EXAMS.values()}])]
    css = (".ejh-grid{contain:inline-size;max-width:100%;display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px;margin:16px 0 30px}"
           ".ejh-card{display:block;border-radius:18px;padding:18px;background:linear-gradient(150deg,#0b2a66,#071a3d);color:#fff!important;text-decoration:none!important;box-shadow:0 10px 26px rgba(7,26,61,.2);transition:transform .2s;position:relative;overflow:hidden}"
           ".ejh-card:hover{transform:translateY(-4px)}.ejh-card b{display:block;font-size:17px;line-height:1.35;margin:8px 0 10px;color:#fff}"
           ".ejh-card small{color:#9fb3d1}.ejh-card span.t{background:#ffb703;color:#071a3d;font-weight:900;font-size:11px;padding:3px 9px;border-radius:999px}"
           ".ejh-card em{display:inline-block;margin-top:10px;font-style:normal;font-weight:900;color:#ffd166}")
    out = [f"<style>{css}</style>",
           "<p><strong>Free online mock tests</strong> for government job exams – Police, Gujarat LRD, SSC/DSSSB, Railway, Bank, Teaching, PSU and UPSC/State PSC. "
           "Every test has a real-exam style timer, negative marking, instant score, section-wise analysis and the solution of every question. No login, 100% free.</p>"]
    for gname, slugs in groups:
        out.append(f"<h2>{gname}</h2><div class=\"ejh-grid\">")
        for s in slugs:
            t = TITLES[s]
            tag = "FULL TEST" if gname.startswith("Exam") else "SUBJECT TEST"
            out.append(f'<a class="ejh-card" href="{LINKS[s]}"><span class="t">{tag}</span><b>{html.escape(t)}</b><small>Timer · Score · Solutions</small><br><em>Start Free →</em></a>')
        out.append("</div>")
    out.append("<h2>Why practise mock tests?</h2><ul><li>Get used to the real exam pattern and time pressure.</li><li>Find your weak sections from the analysis.</li>"
               "<li>Learn from detailed solutions and improve your score every attempt.</li></ul>"
               "<p>New tests are added regularly. Share this page with friends preparing for sarkari exams! Follow "
               "<strong><a href=\"https://www.instagram.com/employmentjunction.in/\" target=\"_blank\" rel=\"noopener\">@employmentjunction.in</a></strong>.</p>")
    return "\n".join(out)
