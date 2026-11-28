"""Compose 1080x1920 Instagram reels from generated assets."""
import json, os, subprocess, sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.dirname(os.path.abspath(__file__))
W = os.path.join(ROOT, "work")
OUT = os.path.join(ROOT, "output")
os.makedirs(OUT, exist_ok=True)
cfg = json.load(open(os.path.join(ROOT, "reels.json")))
FPS, VW, VH = 30, 1080, 1920
F_XB = "/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf"
F_B = "/usr/share/fonts/opentype/inter/Inter-Bold.otf"
F_SB = "/usr/share/fonts/opentype/inter/Inter-SemiBold.otf"
YELLOW = (255, 214, 74)
CREAM = (255, 248, 235)


def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode:
        print(" ".join(cmd)); print(r.stderr[-2000:]); sys.exit(1)
    return r.stdout


def dur(path):
    return float(run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                      "-of", "csv=p=0", path]))


def font(path, size):
    return ImageFont.truetype(path, size)


def fit(draw, text, path, size, maxw):
    while size > 30:
        f = font(path, size)
        if draw.textlength(text, font=f) <= maxw:
            return f
        size -= 2
    return font(path, size)


def brand_tag(d, accent):
    f = font(F_B, 34)
    t = "TradeNest Naturals"
    tw = d.textlength(t, font=f)
    x, y = (VW - tw) / 2, 200
    d.rounded_rectangle([x - 34, y - 16, x + tw + 34, y + 56], 40, fill=(20, 20, 20, 150))
    d.ellipse([x - 20, y + 14, x - 8, y + 26], fill=accent + (255,))
    d.text((x + 4, y), t, font=f, fill=CREAM + (255,))


def caption_overlay(path, caption, accent):
    img = Image.new("RGBA", (VW, VH), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    brand_tag(d, accent)
    lines = caption.split("\n")
    fonts = [fit(d, l, F_XB, 70, 920) for l in lines]
    lh = [f.getbbox("Ag")[3] + 22 for f in fonts]
    total = sum(lh)
    top = 1260 - total / 2
    boxw = max(d.textlength(l, font=f) for l, f in zip(lines, fonts)) + 90
    # soft shadow + box
    shadow = Image.new("RGBA", (VW, VH), (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle(
        [(VW - boxw) / 2, top - 40, (VW + boxw) / 2, top + total + 30], 36, fill=(0, 0, 0, 120))
    img = Image.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(18)), img)
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([(VW - boxw) / 2, top - 40, (VW + boxw) / 2, top + total + 30],
                        36, fill=(18, 14, 10, 185))
    d.rounded_rectangle([(VW - 120) / 2, top - 40, (VW + 120) / 2, top - 32], 4,
                        fill=accent + (255,))
    y = top
    for i, (l, f, h) in enumerate(zip(lines, fonts, lh)):
        col = YELLOW if i == len(lines) - 1 and len(lines) > 1 else (255, 255, 255)
        tw = d.textlength(l, font=f)
        d.text(((VW - tw) / 2, y), l, font=f, fill=col + (255,))
        y += h
    img.save(path)


def outro_card(path, bg_img, accent):
    bg = Image.open(bg_img).convert("RGB")
    bg = bg.resize((1280, 1920)).crop((100, 0, 1180, 1920)).filter(ImageFilter.GaussianBlur(22))
    dark = Image.new("RGB", bg.size, (12, 10, 6))
    img = Image.blend(bg, dark, 0.62).convert("RGBA")
    d = ImageDraw.Draw(img)
    cx = VW / 2

    def ctext(y, t, f, fill, spacing=0):
        if spacing:
            w = sum(d.textlength(c, font=f) for c in t) + spacing * (len(t) - 1)
            x = cx - w / 2
            for c in t:
                d.text((x, y), c, font=f, fill=fill)
                x += d.textlength(c, font=f) + spacing
        else:
            d.text((cx - d.textlength(t, font=f) / 2, y), t, font=f, fill=fill)

    # leaf emblem
    d.ellipse([cx - 70, 470, cx + 70, 610], outline=accent + (255,), width=6)
    d.pieslice([cx - 40, 500, cx + 40, 580], 200, 340, fill=YELLOW + (255,))
    ctext(660, "TradeNest", font(F_XB, 130), CREAM)
    ctext(810, "NATURALS", font(F_B, 52), YELLOW, spacing=22)
    d.rectangle([cx - 160, 905, cx + 160, 909], fill=accent + (255,))
    ctext(950, "Premix  •  Masale  •  Dehydrated Powders", fit(d, "Premix  •  Masale  •  Dehydrated Powders", F_SB, 44, 960), CREAM)
    # button
    f = font(F_XB, 58)
    t = "ORDER NOW"
    tw = d.textlength(t, font=f)
    d.rounded_rectangle([cx - tw / 2 - 60, 1110, cx + tw / 2 + 60, 1220], 55, fill=accent + (255,))
    ctext(1128, t, f, (255, 255, 255))
    ctext(1270, cfg["website"], font(F_B, 56), (255, 255, 255))
    ctext(1360, "Follow for more recipes & offers", font(F_SB, 36), (220, 210, 190))
    img.convert("RGB").save(path)


def scene_video(out, img, overlay, audio, d, idx, still=False):
    frames = int(round(d * FPS))
    if still:
        zexpr = f"1+0.06*on/{frames}"
    elif idx % 2 == 0:
        zexpr = f"1+0.13*on/{frames}"
    else:
        zexpr = f"1.13-0.13*on/{frames}"
    if still:
        pre = "scale=2160:3840"
    else:
        pre = "scale=2560:3840,crop=2160:3840"
    vf = (f"[0:v]{pre},zoompan=z='{zexpr}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'"
          f":d={frames}:s={VW}x{VH}:fps={FPS},format=yuv420p,"
          f"fade=in:st=0:d=0.25[bg]")
    inputs = ["-loop", "1", "-framerate", str(FPS), "-i", img]
    if overlay:
        inputs += ["-loop", "1", "-framerate", str(FPS), "-i", overlay]
        vf += (f";[1:v]format=rgba,fade=in:st=0.2:d=0.35:alpha=1[ov];"
               f"[bg][ov]overlay=0:0:format=auto,format=yuv420p[v]")
        ai = 2
    else:
        vf += ";[bg]null[v]"
        ai = 1
    inputs += ["-i", audio]
    af = f"[{ai}:a]adelay=150|150,apad,atrim=0:{d:.3f},aformat=sample_rates=44100:channel_layouts=stereo[a]"
    run(["ffmpeg", "-y", *inputs, "-filter_complex", vf + ";" + af,
         "-map", "[v]", "-map", "[a]", "-t", f"{d:.3f}", "-r", str(FPS),
         "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p",
         "-c:a", "aac", "-b:a", "192k", out])


for reel in cfg["reels"]:
    rid, accent = reel["id"], tuple(reel["accent"])
    parts = []
    for i, s in enumerate(reel["scenes"]):
        ov = f"{W}/{rid}_s{i}_ov.png"
        caption_overlay(ov, s["caption"], accent)
        vo = f"{W}/{rid}_s{i}.mp3"
        d = dur(vo) + 0.45
        part = f"{W}/{rid}_part{i}.mp4"
        scene_video(part, f"{W}/{rid}_s{i}.png", ov, vo, d, i)
        parts.append(part)
    card = f"{W}/{rid}_outro.png"
    outro_card(card, f"{W}/{rid}_s2.png", accent)
    part = f"{W}/{rid}_part_outro.mp4"
    scene_video(part, card, None, f"{W}/outro.mp3", dur(f"{W}/outro.mp3") + 1.2, 0, still=True)
    parts.append(part)

    lst = f"{W}/{rid}_list.txt"
    open(lst, "w").write("".join(f"file '{p}'\n" for p in parts))
    joined = f"{W}/{rid}_joined.mp4"
    run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", joined])
    total = dur(joined)
    final = f"{OUT}/{rid}.mp4"
    af = (f"[1:a]aloop=loop=-1:size=2e9,atrim=0:{total:.3f},volume=0.16,"
          f"afade=t=in:d=0.5,afade=t=out:st={total - 1.8:.3f}:d=1.8[m];"
          f"[0:a]volume=1.35[v];[v][m]amix=inputs=2:duration=first:normalize=0,"
          f"alimiter=limit=0.95[a]")
    run(["ffmpeg", "-y", "-i", joined, "-i", f"{W}/{rid}_music.mp3", "-filter_complex", af,
         "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
         "-movflags", "+faststart", final])
    print(f"{final}  {total:.1f}s", flush=True)
