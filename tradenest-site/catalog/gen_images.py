"""Generate branded Hindi product images (5 AI scenes) for one product spec JSON.

Usage: python3 gen_images.py spec.json outdir
"""
import base64, json, os, subprocess, sys, concurrent.futures as cf

HERE = os.path.dirname(os.path.abspath(__file__))
BRAND = os.path.join(HERE, "brand")
spec = json.load(open(sys.argv[1]))
out = sys.argv[2]
os.makedirs(out, exist_ok=True)

BRAND_RULES = (
    "BRAND: Use the exact 'Tradenest Naturals' logo from the reference image (green two-leaf icon above the word "
    "'Tradenest' in dark green and 'Naturals' in lighter green) with the small tagline 'GOODNESS FROM NATURE' under it. "
    "Keep the logo and tagline in English exactly as in the reference, spelled correctly. "
    "ALL other visible text must be in English, spelled exactly as written in quotes below, crisp and legible, "
    "no extra words, no gibberish, no other languages. "
    "STYLE: premium Indian FMCG advertising photography like the reference: warm golden natural light, rustic wooden table, "
    "brass/wooden bowls, real ingredient props, shallow depth of field, rich but natural colours, elegant serif headline, "
    "a handwritten-script English accent line, round outline icon badges. Square 1:1 composition, everything inside the frame. "
    "Do not show any certification logos, 'organic', '100%', health or medical claims, prices or weights other than those given."
)

def edit(name, prompt):
    path = os.path.join(out, name)
    if os.path.exists(path):
        return path
    cmd = ["curl", "-s", "https://api.openai.com/v1/images/edits", "-H", "Authorization: Bearer dummy",
           "-F", "model=gpt-image-2", "-F", "size=1024x1024", "-F", "quality=high",
           "-F", f"image[]=@{BRAND}/sample3.jpg", "-F", f"image[]=@{BRAND}/logo_from_pouch.png",
           "--form-string", f"prompt={BRAND_RULES}\n\nSCENE: {prompt}"]
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=600)
    d = json.loads(r.stdout)
    if "data" not in d:
        raise RuntimeError(f"{name}: {r.stdout[:300]}")
    raw = base64.b64decode(d["data"][0]["b64_json"])
    tmp = path + ".png"
    open(tmp, "wb").write(raw)
    from PIL import Image
    Image.open(tmp).convert("RGB").save(path, quality=90, optimize=True)
    os.remove(tmp)
    return path

s = spec
pouch = (f"a matte cream stand-up pouch with a {s['accent']} vertical accent band on the right, the Tradenest Naturals logo at the top, "
         f"headline \"{s['name']}\" in large elegant serif, sub-line \"{s['sub']}\", and a round badge \"{s['badge']}\"")
jar = f"a clear PET jar with a {s['accent']} cap and a cream label showing the Tradenest Naturals logo and \"{s['name']}\""

scenes = {
    "01-hero-pouch.jpg": (f"Hero product shot. Centre: {pouch}. Beside it {jar}. In front a brass bowl heaped with {s['powder_look']}. "
                          f"Props: {s['raw_props']}. Top-left handwritten-script accent line \"{s['tagline']}\"."),
    "02-banner.jpg": (f"Lifestyle advertising banner. Top-left the Tradenest Naturals logo. Left: large headline \"{s['name']}\". "
                      f"Centre-right: {pouch}, with a wooden bowl of {s['powder_look']} and {s['raw_props']}. "
                      f"Right column: 4 round outline icons with short labels: \"{s['points'][0]}\", \"{s['points'][1]}\", "
                      f"\"{s['points'][2]}\", \"{s['points'][3]}\". Bottom row of 3 round badges: \"Natural Ingredients\", "
                      f"\"Export Quality\", \"Premium Quality\"."),
    "03-closeup.jpg": (f"Macro close-up of a hand-carved wooden bowl filled with {s['powder_look']}, a wooden scoop with powder, "
                       f"{s['raw_props']} around it. Small Tradenest Naturals logo badge in the top-left corner. Bottom-left elegant label "
                       f"\"{s['name']}\" and under it \"{s['texture']}\"."),
    "04-bulk.jpg": (f"Premium B2B bulk supply scene in a clean warehouse-style setting with warm light: a large 25 kg cream woven bulk bag "
                    f"printed with the Tradenest Naturals logo and \"{s['name']}\", next to two branded pouches ({pouch}) and two jars ({jar}), "
                    f"a scoop of {s['powder_look']} in front. Headline at top: \"Bulk & Private Label Supply\". Three round icon badges: "
                    f"\"MOQ Just 5 Kg\", \"Export Packing\", \"Documentation Support\"."),
    "05-uses.jpg": (f"Infographic-style advertisement on a warm cream textured background. Top-left Tradenest Naturals logo, headline "
                    f"\"Applications of {s['name']}\". Centre: {pouch}. Around it 6 rounded photo tiles each with a short caption: "
                    + ", ".join(f"\"{u}\"" for u in s['uses']) + ". Elegant, uncluttered, premium."),
}

with cf.ThreadPoolExecutor(5) as ex:
    futs = {ex.submit(edit, n, p): n for n, p in scenes.items()}
    for f in cf.as_completed(futs):
        try:
            print("ok", f.result(), flush=True)
        except Exception as e:
            print("FAIL", futs[f], e, flush=True)
