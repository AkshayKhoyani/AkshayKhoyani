"""Build the spec-card image (06) and premium Hindi PDF brochure for one product.

Usage: python3 build_docs.py specs/<slug>.json out/<slug>
"""
import base64, html, json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
spec = json.load(open(sys.argv[1]))
content = json.load(open(sys.argv[1].replace(".json", ".content.json")))
out = os.path.abspath(sys.argv[2])
E = html.escape

def data_uri(path, mime="image/jpeg"):
    return f"data:{mime};base64," + base64.b64encode(open(path, "rb").read()).decode()

LOGO = data_uri(os.path.join(HERE, "brand", "logo.png"), "image/png")
IMG = {k: data_uri(os.path.join(out, f)) for k, f in
       {"hero": "01-hero-pouch.jpg", "banner": "02-banner.jpg", "close": "03-closeup.jpg",
        "bulk": "04-bulk.jpg", "uses": "05-uses.jpg"}.items()}

FONTS = ('<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&'
         'family=Playfair+Display:wght@600;700;800&family=Great+Vibes&display=swap" rel="stylesheet">')
BASE_CSS = """
:root{--g:#0F382C;--g2:#1B5E3B;--gold:#C8963E;--cream:#FBF6EC;--cream2:#F3EAD8;--ink:#2B2B26}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Poppins',sans-serif;color:var(--ink);background:var(--cream)}
.serif{font-family:'Playfair Display',serif}
.hand{font-family:'Great Vibes',cursive;font-size:1.25em;color:var(--g2)}
.chip{display:inline-block;border:1.5px solid var(--g2);color:var(--g);border-radius:999px;padding:3px 12px;font-weight:600;font-size:13px;margin:3px 4px 3px 0;background:#fff8}
.rule{height:2px;background:linear-gradient(90deg,transparent,var(--gold),transparent);margin:10px 0}
"""
contact_line = "WhatsApp: +91 92651 28276 &nbsp;•&nbsp; export@tradenestnaturals.com &nbsp;•&nbsp; tradenestnaturals.com"
spec_rows = "".join(f"<tr><td>{E(k)}</td><td>{E(v)}</td></tr>" for k, v in spec["specs"].items())

# ---------------------------------------------------------------- spec card (1080x1080)
card = f"""<!doctype html><html><head><meta charset="utf-8">{FONTS}<style>{BASE_CSS}
body{{width:1080px;height:1080px;overflow:hidden;background:radial-gradient(circle at 80% 10%,#fff 0,var(--cream) 45%,var(--cream2) 100%)}}
.wrap{{position:absolute;inset:0;padding:48px 56px}}
.top{{display:flex;justify-content:space-between;align-items:flex-start}}
.top img{{height:150px}}
.badge{{background:var(--g);color:#fff;border-radius:18px;padding:14px 22px;text-align:center;font-weight:700;font-size:22px;line-height:1.25}}
.badge small{{display:block;font-weight:500;font-size:16px;color:#cfe8d8}}
h1{{font-size:58px;color:var(--g);line-height:1.05;margin-top:2px}}
.sub{{font-size:30px;margin-top:2px}}
table{{width:100%;border-collapse:separate;border-spacing:0;margin-top:26px;font-size:23px;background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 6px 24px #0f382c1a}}
td{{padding:11px 22px;border-bottom:1px solid #eadfca}}
td:first-child{{color:#6b5d45;width:46%;font-weight:600}} td:last-child{{color:var(--g);font-weight:800}}
tr:nth-child(odd) td{{background:#fffaf0}}
.strip{{display:flex;gap:14px;margin-top:22px}}
.pill{{flex:1;text-align:center;border:2px solid var(--g2);border-radius:999px;padding:10px 6px;font-weight:700;font-size:22px;color:var(--g);background:#fff}}
.foot{{position:absolute;left:0;right:0;bottom:0;background:var(--g);color:#fff;font-size:21px;text-align:center;padding:16px}}
.thumb{{position:absolute;right:60px;top:170px;width:170px;height:170px;border-radius:50%;object-fit:cover;border:6px solid #fff;box-shadow:0 8px 24px #0003}}
</style></head><body><div class="wrap">
<div class="top"><img src="{LOGO}"><div class="badge">FSSAI Licensed<small>IEC Registered Exporter</small></div></div>
<div class="hand" style="font-size:34px;margin-top:8px">Technical Specifications</div>
<h1 class="serif">{E(spec['name'])}</h1><div class="sub">{E(spec['sub'])}</div>
<img class="thumb" src="{IMG['close']}">
<table>{spec_rows}</table>
<div class="strip"><div class="pill">MOQ Just 5 Kg</div><div class="pill">Private Label</div><div class="pill">Samples Available</div></div>
</div><div class="foot">{contact_line}</div></body></html>"""

# ---------------------------------------------------------------- brochure (A4)
li = lambda items: "".join(f"<li>{E(i)}</li>" for i in items)
steps = ["Raw Material Sourcing", "Cleaning & Sorting", "Controlled Drying", "Grinding & Sieving", "Quality Inspection", "Packing & Dispatch"]
faqs = "".join(f"<div class='faq'><b>Q. {E(f['q'])}</b><p>{E(f['a'])}</p></div>" for f in content["faqs"])
pdf_html = f"""<!doctype html><html><head><meta charset="utf-8">{FONTS}<style>{BASE_CSS}
@page{{size:A4;margin:0}}
.page{{width:210mm;height:297mm;position:relative;overflow:hidden;page-break-after:always;background:var(--cream)}}
.pad{{padding:14mm 15mm}}
.hdr{{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid var(--gold);padding-bottom:4mm;margin-bottom:6mm}}
.hdr img{{height:20mm}} .hdr span{{font-weight:700;color:var(--g);font-size:13px;letter-spacing:.5px}}
h2{{font-family:'Playfair Display',serif;color:var(--g);font-size:25px;margin:2mm 0 3mm}}
p{{font-size:13.5px;line-height:1.6;margin-bottom:2.5mm}}
.ft{{position:absolute;bottom:0;left:0;right:0;background:var(--g);color:#e9f3ec;font-size:11.5px;text-align:center;padding:3.2mm}}
.cover-img{{width:150mm;height:150mm;object-fit:contain;display:block;margin:12mm auto 0;border-radius:6mm;box-shadow:0 3mm 10mm #0f382c26}}
.cover-band{{display:none}}
.cover-body{{padding:5mm 15mm 0;text-align:center}}
.cover-body img{{height:20mm}}
.cover-body h1{{font-family:'Playfair Display',serif;color:var(--g);font-size:46px;line-height:1.1;margin-top:2mm}}
.grid2{{display:grid;grid-template-columns:1fr 1fr;gap:7mm;align-items:start}}
.card{{background:#fff;border-radius:5mm;padding:5mm 6mm;box-shadow:0 2mm 6mm #0f382c14}}
ul{{padding-left:5mm}} li{{font-size:13.5px;line-height:1.6}}
li::marker{{color:var(--gold)}}
table.spec{{width:100%;border-collapse:collapse;font-size:13.5px;background:#fff;border-radius:4mm;overflow:hidden}}
table.spec td{{padding:2mm 4mm;border-bottom:1px solid #eee2cc}} table.spec td:first-child{{color:#6b5d45;font-weight:600;width:48%}}
table.spec td:last-child{{color:var(--g);font-weight:700}}
.ph{{width:100%;aspect-ratio:1/1;height:auto !important;border-radius:5mm;display:block;object-fit:contain;box-shadow:0 2mm 6mm #0f382c1f}}
.steps{{display:grid;grid-template-columns:repeat(6,1fr);gap:2.5mm}}
.step{{background:#fff;border-radius:4mm;padding:3mm;text-align:center;border-top:3px solid var(--gold)}}
.step b{{display:block;font-size:18px;color:var(--gold)}} .step span{{font-weight:700;color:var(--g);font-size:12px;line-height:1.3;display:block}}
.faq{{margin-bottom:3mm}} .faq b{{color:var(--g);font-size:14px}} .faq p{{font-size:13.5px;margin:0.5mm 0 0}}
.cta{{background:var(--g);color:#fff;border-radius:5mm;padding:6mm;text-align:center}}
.cta h3{{font-family:'Playfair Display',serif;font-size:24px;margin-bottom:2mm}}
.cta div{{font-size:15px;line-height:1.8}}
.trust{{display:flex;gap:3mm;justify-content:center;margin:4mm 0}}
.trust div{{border:1.5px solid var(--g2);border-radius:999px;padding:1.5mm 5mm;font-weight:700;color:var(--g);font-size:13px;background:#fff}}
</style></head><body>

<div class="page">
 <img class="cover-img" src="{IMG['hero']}"><div class="cover-band"></div>
 <div class="cover-body">
  <img src="{LOGO}">
  <div class="hand" style="font-size:22px;margin-top:1mm">{E(content['tagline'])}</div>
  <h1>{E(spec['name'])}</h1>
  <div style="font-size:17px;margin:1mm 0 3mm">{E(spec['sub'])} &nbsp;|&nbsp; Product Brochure</div>
  {''.join(f'<span class="chip">{E(h)}</span>' for h in content['highlights'][:4])}
 </div>
 <div class="ft">FSSAI Licensed Manufacturer &nbsp;•&nbsp; IEC Registered Exporter &nbsp;•&nbsp; {contact_line}</div>
</div>

<div class="page"><div class="pad">
 <div class="hdr"><img src="{LOGO}"><span>PRODUCT OVERVIEW</span></div>
 <h2>About {E(spec['name'])}</h2>
 {''.join(f'<p>{E(x)}</p>' for x in content['overview'])}
 <div class="grid2" style="margin-top:4mm;grid-template-columns:62mm 1fr">
  <div><img class="ph" style="height:64mm" src="{IMG['close']}"></div>
  <div class="card"><h2 style="font-size:20px;margin-top:0">Key Highlights</h2><ul>{li(content['highlights'])}</ul></div>
 </div>
 <h2 style="margin-top:6mm">Technical Specifications</h2>
 <table class="spec">{spec_rows}</table>
</div><div class="ft">{contact_line}</div></div>

<div class="page"><div class="pad">
 <div class="hdr"><img src="{LOGO}"><span>APPLICATIONS &amp; PACKAGING</span></div>
 <div class="grid2" style="grid-template-columns:1fr 72mm">
  <div class="card"><h2 style="font-size:20px;margin-top:0">Key Applications</h2><ul>{li(content['applications'])}</ul></div>
  <div><img class="ph" style="height:70mm" src="{IMG['uses']}"></div>
 </div>
 <div class="grid2" style="margin-top:6mm;grid-template-columns:72mm 1fr">
  <div><img class="ph" style="height:70mm" src="{IMG['bulk']}"></div>
  <div>
   <div class="card"><h2 style="font-size:20px;margin-top:0">Industries We Serve</h2><ul>{li(content['industries'])}</ul></div>
   <div class="card" style="margin-top:4mm"><h2 style="font-size:20px;margin-top:0">Packaging Options</h2><ul>{li(content['packaging'])}</ul></div>
  </div>
 </div>
 <h2 style="margin-top:6mm">Our 6-Step Process</h2>
 <div class="steps">{''.join(f'<div class="step"><b>0{i+1}</b><span>{s}</span></div>' for i, s in enumerate(steps))}</div>
</div><div class="ft">{contact_line}</div></div>

<div class="page"><div class="pad">
 <div class="hdr"><img src="{LOGO}"><span>FAQ &amp; CONTACT</span></div>
 <h2>Frequently Asked Questions</h2>
 {faqs}
 <div class="trust"><div>FSSAI Licensed</div><div>IEC Registered</div><div>MOQ 5 Kg</div><div>OEM / Private Label</div></div>
 <div class="cta">
  <div class="hand" style="color:#F4D9A0;font-size:20px">Let's grow together</div>
  <h3>Request a Bulk Quote &amp; Samples</h3>
  <div>WhatsApp / Call: <b>+91 92651 28276</b><br>Email: <b>export@tradenestnaturals.com</b><br>Website: <b>tradenestnaturals.com</b></div>
 </div>
</div><div class="ft">© TradeNest Naturals — Goodness from Nature</div></div>
</body></html>"""

open(os.path.join(out, "_card.html"), "w").write(card)
open(os.path.join(out, "_brochure.html"), "w").write(pdf_html)
js = f"""
const {{ chromium }} = require('playwright');
(async () => {{
  const b = await chromium.launch();
  const p = await b.newPage({{viewport:{{width:1080,height:1080}}}});
  await p.goto('file://{out}/_card.html',{{waitUntil:'networkidle'}}); await p.evaluate(()=>document.fonts.ready);
  await p.screenshot({{path:'{out}/06-spec-card.png'}});
  const q = await b.newPage();
  await q.goto('file://{out}/_brochure.html',{{waitUntil:'networkidle'}}); await q.evaluate(()=>document.fonts.ready);
  await q.pdf({{path:'{out}/TradeNest_{spec['slug']}.pdf',format:'A4',printBackground:true}});
  await b.close();
}})();"""
open(os.path.join(out, "_render.js"), "w").write(js)
subprocess.run(["node", os.path.join(out, "_render.js")], check=True)
from PIL import Image
Image.open(os.path.join(out, "06-spec-card.png")).convert("RGB").resize((1024, 1024)).save(os.path.join(out, "06-spec-card.jpg"), quality=92)
os.remove(os.path.join(out, "06-spec-card.png"))
print("done", out)
