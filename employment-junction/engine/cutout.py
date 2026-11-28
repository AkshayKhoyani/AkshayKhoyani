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
_SESSION = None


def cut_full(src, name=""):
    """Transparent cut-out on the full export canvas (not cropped)."""
    global _SESSION
    _SESSION = _SESSION or new_session("isnet-general-use")
    im = Image.open(src).convert("RGB")
    out = remove(im, session=_SESSION)
    a = np.array(out.split()[-1])
    rgb = np.array(im).astype(int)
    mx, mn = rgb.max(2), rgb.min(2)
    neutral_light = (mx - mn < 18) & (mn > 185)          # Canva's baked white/grey checkerboard
    coloured = ~neutral_light
    coloured = ndimage.binary_opening(coloured, iterations=2)   # drop checker edge noise
    mask = (a > 24) | coloured
    mask = ndimage.binary_closing(mask, iterations=4)
    # fill enclosed holes only when they are part of the character (phone screen, glasses);
    # gaps between arm and body show the background (white/grey checker) -> keep them transparent
    filled = ndimage.binary_fill_holes(mask)
    holes, nh = ndimage.label(filled & ~mask)
    if nh:
        lum = rgb.mean(2)
        white, grey = neutral_light & (lum >= 251), neutral_light & (lum >= 235) & (lum < 251)
        wf = ndimage.mean(white, holes, range(1, nh + 1))
        gf = ndimage.mean(grey, holes, range(1, nh + 1))
        for i, (w_, g_) in enumerate(zip(wf, gf), 1):
            # Canva's baked checkerboard = white AND light-grey squares; anything else (phone screen…) belongs to the character
            if not (w_ > 0.15 and g_ > 0.15):
                mask |= holes == i
    # flat pure-white patches inside the outline = background seen through a gap (e.g. inside a saluting arm)
    lum2 = rgb.mean(2)
    flat = neutral_light & (lum2 >= 250)
    fl, nf = ndimage.label(flat)
    WHITE_OUTFIT = {"station_master", "nurse_didi", "bank_babu", "result_chacha"}  # white clothes: don't punch flat-white patches
    if nf and name not in WHITE_OUTFIT:
        areas = ndimage.sum(flat, fl, range(1, nf + 1))
        means = ndimage.mean(lum2, fl, range(1, nf + 1))
        for i, (ar, mu) in enumerate(zip(areas, means), 1):
            if ar > 600 and mu >= 253.5:
                mask &= ~ndimage.binary_dilation(fl == i, iterations=2)
    mask &= ~(neutral_light & ~ndimage.binary_erosion(mask, iterations=6) & (a < 128))  # trim checker fringe at edges
    lab, n = ndimage.label(mask)
    if n > 1:                                                     # keep the character, drop stray specks
        sizes = ndimage.sum(mask, lab, range(1, n + 1))
        mask = lab == (1 + int(np.argmax(sizes)))
    a = np.where(mask, np.where(ndimage.binary_erosion(mask, iterations=2), 255, np.maximum(a, 160)), 0).astype("uint8")
    out = im.copy()  # original colours (rembg blacks out pixels it removed)
    out.putalpha(Image.fromarray(a))
    return out


if __name__ == "__main__":
    src, name = sys.argv[1], sys.argv[2]
    out = cut_full(src, name)
    out = out.crop(out.getbbox())
    out.thumbnail((1100, 1600))
    dst = os.path.join(HERE, "assets", "characters", f"cast_{name}.webp")
    out.save(dst, quality=90)
    print(dst, out.size, os.path.getsize(dst) // 1024, "KB")
