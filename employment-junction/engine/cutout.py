"""Cut a brand-cast character out of its Canva export (free, local rembg) -> engine/assets/characters/cast_<name>.webp
Usage: python3 engine/cutout.py <export.png> <name>
"""
import os
import sys

import numpy as np
from PIL import Image
from rembg import new_session, remove
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
src, name = sys.argv[1], sys.argv[2]
im = Image.open(src).convert("RGB")
out = remove(im, session=new_session("isnet-general-use"))
a = np.array(out.split()[-1])
rgb = np.array(im).astype(int)
mx, mn = rgb.max(2), rgb.min(2)
neutral_light = (mx - mn < 18) & (mn > 185)          # Canva's baked white/grey checkerboard
coloured = ~neutral_light
coloured = ndimage.binary_opening(coloured, iterations=2)   # drop checker edge noise
mask = (a > 24) | coloured
mask = ndimage.binary_closing(mask, iterations=4)
mask = ndimage.binary_fill_holes(mask)                       # phone screens, glasses etc. stay opaque
lab, n = ndimage.label(mask)
if n > 1:                                                     # keep the character, drop stray specks
    sizes = ndimage.sum(mask, lab, range(1, n + 1))
    mask = lab == (1 + int(np.argmax(sizes)))
a = np.where(mask, np.where(ndimage.binary_erosion(mask, iterations=2), 255, np.maximum(a, 160)), 0).astype("uint8")
out = im.copy()  # original colours (rembg blacks out pixels it removed)
out.putalpha(Image.fromarray(a))
out = out.crop(out.getbbox())
out.thumbnail((1100, 1600))
dst = os.path.join(HERE, "assets", "characters", f"cast_{name}.webp")
out.save(dst, quality=90)
print(dst, out.size, os.path.getsize(dst) // 1024, "KB")
