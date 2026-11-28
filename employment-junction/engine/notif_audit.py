import json,re,sys,html
sys.path.insert(0,'.')
from upgrade import fetch
TYPES=["ej_job","ej_admit_card","ej_result","ej_answer_key","ej_syllabus","ej_schedule","posts"]
out=[]
for t in TYPES:
    for p in fetch(t):
        c=p["content"]["raw"]; m=p.get("meta") or {}
        # mentions of notification not inside an anchor
        plain=re.sub(r"<a\b[^>]*>.*?</a>","",c,flags=re.S)
        n=len(re.findall(r"official\s+notification|notification\s+pdf|detailed\s+notification|short\s+notice|official\s+notice",plain,re.I))
        links=re.findall(r'<a\b[^>]*href="([^"]+)"[^>]*>(.*?)</a>',c,re.S)
        nl=[h for h,txt in links if re.search(r"notification|notice|advt|advertisement|pdf",re.sub("<[^>]+>","",txt),re.I) or h.lower().endswith(".pdf")]
        out.append(dict(t=t,id=p["id"],slug=p["slug"],date=p["date"][:10],unlinked=n,meta=m.get("ej_notification_url",""),nlinks=nl[:3]))
json.dump(out,open("/tmp/claude-0/-home-user-AkshayKhoyani/86c6539b-be5f-5a9a-a5f4-6bbc2850eae1/scratchpad/notif.json","w"),indent=1)
print(len(out),"posts; with unlinked mentions:",sum(1 for o in out if o["unlinked"]),"; no notif url at all:",sum(1 for o in out if not o["meta"] and not o["nlinks"]))
for o in out:
    if not o["meta"] and not o["nlinks"]: print(o["t"],o["id"],o["slug"],o["date"])
