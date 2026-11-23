"""TradeNest Naturals B2B reels: generate assets and render EN + HI versions.

Usage: python3 b2b.py            (all reels)
       python3 b2b.py intro      (one reel)
"""
import base64, json, os, subprocess, sys, concurrent.futures as cf, urllib.request
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.dirname(os.path.abspath(__file__))
W, WEB, OUT = (os.path.join(ROOT, d) for d in ("work", "web", "output"))
for d in (W, OUT):
    os.makedirs(d, exist_ok=True)
cfg = json.load(open(os.path.join(ROOT, "reels_b2b.json")))
LANGS = ("en", "hi")
FPS, VW, VH = 30, 1080, 1920
TEMPO = 1.08  # slight voiceover speed-up
F_XB = "/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf"
F_B = "/usr/share/fonts/opentype/inter/Inter-Bold.otf"
F_SB = "/usr/share/fonts/opentype/inter/Inter-SemiBold.otf"
GREEN, DGREEN, GOLD = (34, 102, 62), (18, 48, 30), (222, 178, 74)
CREAM, WHITE = (248, 243, 233), (255, 255, 255)
TTS_STYLE = {
    "en": "Speak in clear, confident, warm professional English, like a premium corporate brand film "
          "voiceover for international B2B buyers. Brisk, energetic social-media-ad pace, no long pauses.",
    "hi": "Speak in natural Indian Hindi (English business terms pronounced naturally), confident, warm "
          "and professional, like a premium Indian brand voiceover. Brisk, energetic social-media-ad pace, no long pauses.",
}


# ---------------------------------------------------------------- assets
def post(url, body, headers=None):
    req = urllib.request.Request(url, data=json.dumps(body).encode(), headers={
        "Content-Type": "application/json", "Authorization": "Bearer dummy", **(headers or {})})
    with urllib.request.urlopen(req, timeout=300) as r:
        return r.read()


def gen_image(path, prompt):
    if not os.path.exists(path):
        prompt += ". Absolutely no text, letters, logos or brand names anywhere in the image."
        d = json.loads(post("https://api.openai.com/v1/images/generations", {
            "model": "gpt-image-2", "prompt": prompt, "size": "1024x1536", "quality": "high"}))
        open(path, "wb").write(base64.b64decode(d["data"][0]["b64_json"]))
    return path


def gen_tts(path, text, lang):
    if not os.path.exists(path):
        open(path, "wb").write(post("https://api.openai.com/v1/audio/speech", {
            "model": "gpt-4o-mini-tts", "voice": "ash", "input": text, "response_format": "mp3",
            "instructions": TTS_STYLE[lang] + " Brand name: TradeNest Naturals."}))
    return path


def gen_music(path, prompt):
    if not os.path.exists(path):
        open(path, "wb").write(post("https://api.elevenlabs.io/v1/sound-generation", {
            "text": prompt, "duration_seconds": 22, "prompt_influence": 0.5}, {"xi-api-key": "dummy"}))
    return path


def make_assets(reels):
    jobs = []
    with cf.ThreadPoolExecutor(8) as ex:
        for r in reels:
            jobs.append(ex.submit(gen_music, f"{W}/{r['id']}_music.mp3", r["music"]))
            for i, s in enumerate(r["scenes"]):
                if s["type"] == "ai":
                    jobs.append(ex.submit(gen_image, f"{W}/{r['id']}_s{i}.png", s["img"]))
                for L in LANGS:
                    jobs.append(ex.submit(gen_tts, f"{W}/{r['id']}_s{i}_{L}.mp3", s[L]["vo"], L))
        for L in LANGS:
            jobs.append(ex.submit(gen_tts, f"{W}/outro_{L}.mp3", cfg["outro"][L]["vo"], L))
        bad = 0
        for j in cf.as_completed(jobs):
            try:
                j.result()
            except Exception as e:
                bad += 1
                print("FAIL", e, getattr(e, "read", lambda: b"")()[:300])
    if bad:
        sys.exit(1)


# ---------------------------------------------------------------- drawing
def font(p, s):
    return ImageFont.truetype(p, s)


def fit(d, text, p, size, maxw):
    while size > 28 and d.textlength(text, font=font(p, size)) > maxw:
        size -= 2
    return font(p, size)


def ctext(d, y, t, f, fill, spacing=0):
    if spacing:
        w = sum(d.textlength(c, font=f) for c in t) + spacing * (len(t) - 1)
        x = (VW - w) / 2
        for c in t:
            d.text((x, y), c, font=f, fill=fill)
            x += d.textlength(c, font=f) + spacing
    else:
        d.text(((VW - d.textlength(t, font=f)) / 2, y), t, font=f, fill=fill)


def brand_tag(d, light):
    f = font(F_B, 30)
    t = "TRADENEST NATURALS"
    tw = sum(d.textlength(c, font=f) for c in t) + 4 * (len(t) - 1)
    x0, x1 = (VW - tw) / 2 - 40, (VW + tw) / 2 + 40
    d.rounded_rectangle([x0, 186, x1, 252], 33,
                        fill=(GREEN + (235,)) if light else (10, 24, 14, 160))
    ctext(d, 202, t, f, WHITE, spacing=4)


def overlay_ai(path, caption):
    img = Image.new("RGBA", (VW, VH), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    brand_tag(d, False)
    lines = caption.split("\n")
    fonts = [fit(d, l, F_XB, 68, 920) for l in lines]
    lh = [f.getbbox("Ag")[3] + 22 for f in fonts]
    total, top = sum(lh), 1300 - sum(lh) / 2
    bw = max(d.textlength(l, font=f) for l, f in zip(lines, fonts)) + 100
    box = [(VW - bw) / 2, top - 44, (VW + bw) / 2, top + total + 30]
    sh = Image.new("RGBA", (VW, VH), (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle(box, 34, fill=(0, 0, 0, 130))
    img = Image.alpha_composite(sh.filter(ImageFilter.GaussianBlur(18)), img)
    d = ImageDraw.Draw(img)
    d.rounded_rectangle(box, 34, fill=DGREEN + (200,))
    d.rounded_rectangle([(VW - 110) / 2, box[1], (VW + 110) / 2, box[1] + 8], 4, fill=GOLD + (255,))
    y = top
    for i, (l, f, h) in enumerate(zip(lines, fonts, lh)):
        ctext(d, y, l, f, (GOLD if i == len(lines) - 1 and len(lines) > 1 else WHITE) + (255,))
        y += h
    img.save(path)


def card_base(path, src):
    bg = Image.new("RGB", (VW, VH), CREAM)
    glow = Image.new("RGBA", (VW, VH), (0, 0, 0, 0))
    ImageDraw.Draw(glow).ellipse([-200, 300, VW + 200, 1500], fill=(205, 225, 200, 150))
    bg = Image.alpha_composite(bg.convert("RGBA"), glow.filter(ImageFilter.GaussianBlur(160)))
    ph = Image.open(f"{WEB}/{src}.png").convert("RGB")
    w = 960
    h = int(ph.height * w / ph.width)
    ph = ph.resize((w, h), Image.LANCZOS)
    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, w, h], 40, fill=255)
    x, y = (VW - w) // 2, 560
    sh = Image.new("RGBA", (VW, VH), (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle([x + 10, y + 24, x + w + 10, y + h + 34], 40, fill=(40, 60, 40, 90))
    bg = Image.alpha_composite(bg, sh.filter(ImageFilter.GaussianBlur(26)))
    bg.paste(ph, (x, y), mask)
    bg.convert("RGB").save(path)
    return y + h


def overlay_card(path, s, caption, photo_bottom):
    img = Image.new("RGBA", (VW, VH), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    brand_tag(d, True)
    if caption:
        f = fit(d, caption, F_XB, 54, 900)
        tw = d.textlength(caption, font=f)
        d.rounded_rectangle([(VW - tw) / 2 - 40, 400, (VW + tw) / 2 + 40, 490], 45, fill=GOLD + (255,))
        ctext(d, 418, caption, f, DGREEN + (255,))
    # MOQ badge on photo corner
    fb = font(F_B, 30)
    d.rounded_rectangle([VW - 60 - 210, 590, VW - 80, 650], 30, fill=GREEN + (240,))
    d.text((VW - 270 + (190 - d.textlength("MOQ 5 Kg", font=fb)) / 2, 602), "MOQ 5 Kg", font=fb, fill=WHITE + (255,))
    y = photo_bottom + 70
    ctext(d, y, s["name"], fit(d, s["name"], F_XB, 84, 960), DGREEN + (255,))
    d.rectangle([VW / 2 - 70, y + 120, VW / 2 + 70, y + 125], fill=GOLD + (255,))
    ft = font(F_SB, 38)
    pills = s["tags"]
    widths = [d.textlength(t, font=ft) + 64 for t in pills]
    x = (VW - (sum(widths) + 24 * (len(pills) - 1))) / 2
    for t, pw in zip(pills, widths):
        d.rounded_rectangle([x, y + 160, x + pw, y + 236], 38, outline=GREEN + (255,), width=3,
                            fill=WHITE + (200,))
        d.text((x + 32, y + 177), t, font=ft, fill=GREEN + (255,))
        x += pw + 24
    img.save(path)


def outro_card(path, L):
    o = cfg["outro"][L]
    img = Image.new("RGBA", (VW, VH), CREAM + (255,))
    glow = Image.new("RGBA", (VW, VH), (0, 0, 0, 0))
    ImageDraw.Draw(glow).ellipse([-300, 200, VW + 300, 1300], fill=(200, 225, 200, 170))
    img = Image.alpha_composite(img, glow.filter(ImageFilter.GaussianBlur(170)))
    d = ImageDraw.Draw(img)
    cx = VW / 2
    # leaf emblem
    d.ellipse([cx - 62, 360, cx + 62, 484], fill=GREEN + (255,))
    d.chord([cx - 34, 386, cx + 34, 458], 210, 30, fill=GOLD + (255,))
    d.line([cx - 22, 448, cx + 20, 400], fill=GREEN + (255,), width=5)
    ctext(d, 530, "TRADENEST", font(F_XB, 118), DGREEN + (255,))
    ctext(d, 670, "NATURALS", font(F_B, 50), GOLD + (255,), spacing=22)
    ctext(d, 760, o["tag"], font(F_SB, 40), GREEN + (255,))
    d.rectangle([cx - 150, 830, cx + 150, 834], fill=GOLD + (255,))
    line = "Dehydrated  •  Spray Dried  •  Herbal Extracts"
    ctext(d, 870, line, fit(d, line, F_SB, 40, 960), DGREEN + (255,))
    ctext(d, 925, "OEM & Private Label  •  Export Ready", font(F_SB, 40), DGREEN + (255,))
    f = fit(d, o["cta"], F_XB, 54, 800)
    tw = d.textlength(o["cta"], font=f)
    d.rounded_rectangle([cx - tw / 2 - 64, 1060, cx + tw / 2 + 64, 1170], 55, fill=GREEN + (255,))
    ctext(d, 1082, o["cta"], f, WHITE + (255,))
    ctext(d, 1240, "WhatsApp  " + cfg["whatsapp"], font(F_B, 50), DGREEN + (255,))
    ctext(d, 1320, cfg["website"], font(F_B, 50), GREEN + (255,))
    ctext(d, 1400, cfg["email"], font(F_SB, 38), (70, 90, 75, 255))
    img.convert("RGB").save(path)


# ---------------------------------------------------------------- video
def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode:
        print(" ".join(cmd)[:500]); print(r.stderr[-2000:]); sys.exit(1)
    return r.stdout


def dur(p):
    return float(run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p]))


def scene(out, img, overlay, audio, d, mode):
    n = int(round(d * FPS))
    z = {"in": f"1+0.12*on/{n}", "out": f"1.12-0.12*on/{n}", "still": f"1+0.05*on/{n}"}[mode]
    pre = "scale=2160:3840" if mode == "still" else "scale=2560:3840,crop=2160:3840"
    vf = (f"[0:v]{pre},zoompan=z='{z}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={n}"
          f":s={VW}x{VH}:fps={FPS},format=yuv420p,fade=in:st=0:d=0.2[bg]")
    inp = ["-loop", "1", "-framerate", str(FPS), "-i", img]
    if overlay:
        inp += ["-loop", "1", "-framerate", str(FPS), "-i", overlay]
        vf += (";[1:v]format=rgba,fade=in:st=0.15:d=0.3:alpha=1[ov];"
               "[bg][ov]overlay=0:0:format=auto,format=yuv420p[v]")
        ai = 2
    else:
        vf += ";[bg]null[v]"
        ai = 1
    inp += ["-i", audio]
    af = f"[{ai}:a]atempo={TEMPO},adelay=120|120,apad,atrim=0:{d:.3f},aformat=sample_rates=44100:channel_layouts=stereo[a]"
    run(["ffmpeg", "-y", *inp, "-filter_complex", vf + ";" + af, "-map", "[v]", "-map", "[a]",
         "-t", f"{d:.3f}", "-r", str(FPS), "-c:v", "libx264", "-preset", "medium", "-crf", "18",
         "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", out])


def render(r, L):
    rid, parts = r["id"], []
    for i, s in enumerate(r["scenes"]):
        vo = f"{W}/{rid}_s{i}_{L}.mp3"
        d = dur(vo) / TEMPO + 0.35
        ov = f"{W}/{rid}_s{i}_{L}_ov.png"
        part = f"{W}/{rid}_{L}_p{i}.mp4"
        if s["type"] == "web":
            base = f"{W}/{rid}_s{i}_card.png"
            bottom = card_base(base, s["src"])
            overlay_card(ov, s, s[L]["cap"], bottom)
            scene(part, base, ov, vo, d, "still")
        else:
            overlay_ai(ov, s[L]["cap"])
            scene(part, f"{W}/{rid}_s{i}.png", ov, vo, d, "in" if i % 2 == 0 else "out")
        parts.append(part)
    card = f"{W}/outro_{L}.png"
    outro_card(card, L)
    part = f"{W}/{rid}_{L}_outro.mp4"
    scene(part, card, None, f"{W}/outro_{L}.mp3", dur(f"{W}/outro_{L}.mp3") / TEMPO + 1.4, "still")
    parts.append(part)
    lst = f"{W}/{rid}_{L}.txt"
    open(lst, "w").write("".join(f"file '{p}'\n" for p in parts))
    joined = f"{W}/{rid}_{L}_joined.mp4"
    run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", joined])
    T = dur(joined)
    af = (f"[1:a]aloop=loop=-1:size=2e9,atrim=0:{T:.3f},volume=0.18,afade=t=in:d=0.5,"
          f"afade=t=out:st={T - 1.8:.3f}:d=1.8[m];[0:a]volume=1.3[v];"
          f"[v][m]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11,"
          f"aresample=44100[a]")
    final = f"{OUT}/tradenest_{rid}_{L}.mp4"
    run(["ffmpeg", "-y", "-i", joined, "-i", f"{W}/{rid}_music.mp3", "-filter_complex", af,
         "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
         "-movflags", "+faststart", final])
    print(f"{final}  {T:.1f}s", flush=True)


if __name__ == "__main__":
    only = sys.argv[1:]
    reels = [r for r in cfg["reels"] if not only or r["id"] in only]
    make_assets(reels)
    with cf.ThreadPoolExecutor(3) as ex:
        list(ex.map(lambda a: render(*a), [(r, L) for r in reels for L in LANGS]))
