"""Free (no AI API) branded images for missing slots, built from existing product photos.

Usage: python3 free_cards.py specs/<slug>.json out/<slug> [base_photo]
Creates any of 01..05 that are missing, using photos already in the folder (01/03) or base_photo.
"""
import base64, json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
spec = json.load(open(sys.argv[1]))
out = os.path.abspath(sys.argv[2])
base = os.path.abspath(sys.argv[3]) if len(sys.argv) > 3 else None
os.makedirs(out, exist_ok=True)

def uri(p, mime=None):
    mime = mime or ("image/png" if p.endswith(".png") else "image/jpeg")
    return f"data:{mime};base64," + base64.b64encode(open(p, "rb").read()).decode()

def pick(*names):
    for n in names:
        p = os.path.join(out, n)
        if os.path.exists(p):
            return p
    return base

LOGO = uri(os.path.join(HERE, "brand", "logo.png"))
P_MAIN = base or pick("01-hero-pouch.jpg", "02-banner.jpg", "03-closeup.jpg")
P_CLOSE = pick("03-closeup.jpg", "01-hero-pouch.jpg")
P_BASE = base or P_CLOSE
E = lambda s: (s or "").replace("&", "&amp;").replace("<", "&lt;")

ICON = {
 "leaf": '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
 "bag": '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
 "box": '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
 "doc": '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="m9 15 2 2 4-4"/>',
 "globe": '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
 "check": '<path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/>',
 "star": '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
 "bowl": '<path d="M2 12h20"/><path d="M20 12a8 8 0 0 1-16 0"/><path d="M12 4v4"/><path d="M8 5l1 3"/><path d="M16 5l-1 3"/>',
}
def ic(name, size=46, color="#1B5E3B"):
    return (f'<svg width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="{color}" stroke-width="1.8" '
            f'stroke-linecap="round" stroke-linejoin="round">{ICON[name]}</svg>')

HEAD = ('<!doctype html><html><head><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&'
        'family=Playfair+Display:wght@600;700;800&family=Great+Vibes&display=swap" rel="stylesheet"><style>'
        ':root{--g:#0F382C;--g2:#1B5E3B;--gold:#C8963E;--cream:#FBF6EC}*{box-sizing:border-box;margin:0;padding:0}'
        'body{width:1080px;height:1080px;overflow:hidden;font-family:Poppins,sans-serif;color:#2b2b26;'
        'background:radial-gradient(circle at 75% 15%,#fff 0,var(--cream) 50%,#F1E6D0 100%);position:relative}'
        '.serif{font-family:"Playfair Display",serif}.hand{font-family:"Great Vibes",cursive;color:var(--g2)}'
        '.logo{height:150px}.pill{display:flex;align-items:center;gap:14px;background:#fff;border:2px solid #dcd0b6;border-radius:999px;'
        'padding:10px 22px 10px 12px;font-weight:600;font-size:22px;color:var(--g)}'
        '.round{width:150px;height:150px;border-radius:50%;border:2.5px solid var(--g2);background:#fffaf0;display:flex;flex-direction:column;'
        'align-items:center;justify-content:center;text-align:center;font-weight:700;font-size:19px;color:var(--g);line-height:1.2;gap:6px}'
        '.photo{border-radius:28px;object-fit:cover;box-shadow:0 14px 40px #0f382c40;border:6px solid #fff}'
        '.foot{position:absolute;left:0;right:0;bottom:0;background:var(--g);color:#fff;text-align:center;font-size:21px;padding:15px}'
        '</style></head><body>')
FOOT = '<div class="foot">WhatsApp: +91 92651 28276 &nbsp;•&nbsp; export@tradenestnaturals.com &nbsp;•&nbsp; tradenestnaturals.com</div></body></html>'
s = spec

def hero():
    return HEAD + f'''<img src="{uri(P_BASE)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
<div style="position:absolute;inset:0;background:linear-gradient(180deg,#0000 35%,#0f382ccc 100%)"></div>
<div style="position:absolute;left:40px;top:36px;background:#fbf6ecee;border-radius:24px;padding:16px 22px"><img class="logo" style="height:130px" src="{LOGO}"></div>
<div class="hand" style="position:absolute;right:50px;top:60px;font-size:64px;color:#fff;text-shadow:0 2px 12px #0009">{E(s["tagline"])}</div>
<div style="position:absolute;left:50px;right:50px;bottom:60px;color:#fff">
 <div class="serif" style="font-size:92px;font-weight:800;line-height:1">{E(s["name"])}</div>
 <div style="font-size:32px;margin-top:10px;opacity:.95">{E(s["sub"])}</div>
 <div style="display:inline-block;margin-top:22px;background:var(--gold);color:#fff;font-weight:700;font-size:24px;border-radius:999px;padding:10px 26px">{E(s["badge"])}</div>
</div></body></html>'''

def banner():
    pts = "".join(f'<div class="pill">{ic(n,34)}<span>{E(p)}</span></div>' for n, p in zip(["leaf", "star", "check", "doc"], s["points"]))
    rnd = 'style="width:128px;height:128px;font-size:17px"'
    return HEAD + f'''<div style="position:absolute;left:56px;top:44px;width:470px">
 <img class="logo" src="{LOGO}">
 <div class="serif" style="font-size:74px;font-weight:800;color:var(--g);line-height:1.02;margin-top:20px">{E(s["name"])}</div>
 <div style="font-size:25px;margin-top:10px">{E(s["sub"])}</div>
 <div class="hand" style="font-size:46px;margin-top:10px;white-space:nowrap">{E(s["tagline"])}</div>
 <div style="display:flex;flex-direction:column;gap:14px;margin-top:22px">{pts}</div>
</div>
<img class="photo" src="{uri(P_MAIN)}" style="position:absolute;right:48px;top:56px;width:470px;height:560px">
<div style="position:absolute;right:48px;top:650px;width:470px;display:flex;justify-content:space-between">
 <div class="round" {rnd}>{ic("leaf",34)}Natural<br>Ingredients</div><div class="round" {rnd}>{ic("globe",34)}Export<br>Quality</div><div class="round" {rnd}>{ic("star",34)}Premium<br>Quality</div>
</div>''' + FOOT

def closeup():
    return HEAD + f'''<div style="position:absolute;inset:0;background:url({uri(P_BASE)}) center/165% no-repeat"></div>
<div style="position:absolute;left:36px;top:36px;background:#fbf6ecf0;border-radius:24px;padding:14px 20px"><img style="height:120px" src="{LOGO}"></div>
<div style="position:absolute;left:40px;bottom:50px;background:#fbf6ecf2;border:3px solid var(--gold);border-radius:26px;padding:26px 40px;box-shadow:0 10px 30px #0005">
 <div class="serif" style="font-size:70px;font-weight:800;color:var(--g);line-height:1">{E(s["name"])}</div>
 <div style="height:2px;background:var(--gold);margin:14px 0"></div>
 <div style="font-size:28px;color:#4a4030">{E(s["texture"])}</div>
</div></body></html>'''

def bulk():
    return HEAD + f'''<div style="position:absolute;left:0;right:0;top:44px;text-align:center">
 <img style="height:120px" src="{LOGO}">
 <div class="serif" style="font-size:66px;font-weight:800;color:var(--g);margin-top:8px">Bulk &amp; Private Label Supply</div>
 <div style="font-size:28px;margin-top:4px">{E(s["name"])} &nbsp;•&nbsp; Made in India</div>
</div>
<img class="photo" src="{uri(P_MAIN)}" style="position:absolute;left:60px;top:330px;width:460px;height:420px">
<img class="photo" src="{uri(P_CLOSE)}" style="position:absolute;right:60px;top:330px;width:460px;height:420px">
<div style="position:absolute;left:0;right:0;bottom:92px;display:flex;justify-content:center;gap:30px">
 <div class="round">{ic("bag",40)}MOQ<br>Just 5 Kg</div><div class="round">{ic("box",40)}Export<br>Packing</div>
 <div class="round">{ic("doc",40)}Documentation<br>Support</div><div class="round">{ic("check",40)}Private<br>Label</div>
</div>''' + FOOT

def uses():
    tiles = "".join(f'<div style="background:#fff;border:2px solid #e3d6b9;border-radius:22px;padding:20px 14px;text-align:center;display:flex;'
                    f'flex-direction:column;align-items:center;gap:10px;box-shadow:0 6px 18px #0f382c14">{ic(n,50)}'
                    f'<div style="font-weight:700;font-size:24px;color:var(--g)">{E(u)}</div></div>'
                    for n, u in zip(["bowl", "leaf", "star", "box", "check", "globe"], s["uses"]))
    return HEAD + f'''<div style="position:absolute;left:56px;top:44px"><img style="height:130px" src="{LOGO}"></div>
<div style="position:absolute;right:56px;top:60px;text-align:right">
 <div style="font-size:28px;color:#6b5d45;font-weight:600">Applications of</div>
 <div class="serif" style="font-size:72px;font-weight:800;color:var(--g);line-height:1">{E(s["name"])}</div>
</div>
<img class="photo" src="{uri(P_MAIN)}" style="position:absolute;left:340px;top:250px;width:400px;height:400px;border-radius:50%">
<div style="position:absolute;left:56px;right:56px;top:250px;display:grid;grid-template-columns:250px 1fr 250px;gap:0">
 <div style="display:flex;flex-direction:column;gap:22px">{tiles.split("</div></div>")[0]}</div></div>
</div>'''

def uses_grid():
    tiles = [f'<div style="background:#fff;border:2px solid #e3d6b9;border-radius:22px;padding:18px 10px;text-align:center;display:flex;'
             f'flex-direction:column;align-items:center;gap:8px;box-shadow:0 6px 18px #0f382c14;width:250px">{ic(n,46)}'
             f'<div style="font-weight:700;font-size:23px;color:var(--g)">{E(u)}</div></div>'
             for n, u in zip(["bowl", "leaf", "star", "box", "check", "globe"], s["uses"])]
    left, right = "".join(tiles[:3]), "".join(tiles[3:6])
    return HEAD + f'''<div style="position:absolute;left:56px;top:40px"><img style="height:125px" src="{LOGO}"></div>
<div style="position:absolute;right:56px;top:52px;text-align:right">
 <div style="font-size:28px;color:#6b5d45;font-weight:600">Applications of</div>
 <div class="serif" style="font-size:70px;font-weight:800;color:var(--g);line-height:1">{E(s["name"])}</div>
</div>
<div style="position:absolute;left:56px;top:250px;display:flex;flex-direction:column;gap:26px">{left}</div>
<div style="position:absolute;right:56px;top:250px;display:flex;flex-direction:column;gap:26px">{right}</div>
<img class="photo" src="{uri(P_MAIN)}" style="position:absolute;left:345px;top:300px;width:390px;height:390px;border-radius:50%">
<div class="hand" style="position:absolute;left:0;right:0;top:720px;text-align:center;font-size:52px">{E(s["tagline"])}</div>''' + FOOT

JOBS = {"01-hero-pouch.jpg": hero, "02-banner.jpg": banner, "03-closeup.jpg": closeup, "04-bulk.jpg": bulk, "05-uses.jpg": uses_grid}
made = []
for name, fn in JOBS.items():
    path = os.path.join(out, name)
    if os.path.exists(path):
        continue
    if P_MAIN is None:
        raise SystemExit("no source photo available")
    html_path = os.path.join(out, f"_free_{name}.html")
    open(html_path, "w").write(fn())
    made.append((html_path, path))

if made:
    js = "const { chromium } = require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1080}});"
    for h, pth in made:
        js += f"await p.goto('file://{h}',{{waitUntil:'networkidle'}});await p.evaluate(()=>document.fonts.ready);await p.screenshot({{path:'{pth}.png'}});"
    js += "await b.close();})();"
    jsp = os.path.join(out, "_free_render.js")
    open(jsp, "w").write(js)
    subprocess.run(["node", jsp], check=True)
    from PIL import Image
    for h, pth in made:
        Image.open(pth + ".png").convert("RGB").resize((1024, 1024)).save(pth, quality=92)
        os.remove(pth + ".png"); os.remove(h)
    os.remove(jsp)
print("made:", [os.path.basename(p) for _, p in made])
