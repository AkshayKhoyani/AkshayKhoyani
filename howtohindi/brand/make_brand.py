"""Build reel brand assets from the official HowToHindi logo (logo-original.png).
Usage: python3 make_brand.py <brand_dir>
  logo-dark.png : circular logo (transparent corners) for the end card
  mark-dark.png : play + bulb icon for the top-left watermark
"""
import sys
from PIL import Image, ImageDraw
d = sys.argv[1] if len(sys.argv) > 1 else '.'
im = Image.open(f'{d}/logo-original.png').convert('RGBA')
W, H = im.size
m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).ellipse([8, 14, W - 8, H - 14], fill=255)
c = im.copy(); c.putalpha(m); c.resize((600, 600), Image.LANCZOS).save(f'{d}/logo-dark.png')
s = W / 1254
icon = im.crop(tuple(int(v * s) for v in (330, 130, 975, 740))); px = icon.load(); iw, ih = icon.size
for y in range(ih):
    for x in range(iw):
        r, g, b, a = px[x, y]; l = max(r, g, b)
        if x > iw - 90 * s and y < 140 * s: l = 0   # drop the outer ring fragment
        px[x, y] = (r, g, b, 0 if l < 70 else (255 if l > 130 else int((l - 70) * 255 / 60)))
icon = icon.crop(icon.getbbox()); icon.thumbnail((256, 256), Image.LANCZOS); icon.save(f'{d}/mark-dark.png')
