"""Animation frames for the brand cast (reels): mouth frames for lip-sync and hand poses.

Input  : engine/assets/cast_src/<name>__<frame>.png   (Canva exports, same pose as the base character)
Output : engine/assets/characters/anim/<name>__<frame>.webp  (transparent, same canvas as the base cut-out)

Mouth frames (m0 = closed, m2 = wide open) are aligned to the base cut-out and only the FACE area that changed is
pasted onto the base, so the body never jitters while the character talks. Pose frames (wave, point, …) are full
cut-outs scaled to the base height and bottom-centre aligned, so swapping poses doesn't make the character jump.
Usage: python3 engine/frames.py [name ...]
"""
import glob
import os
import subprocess
import sys

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "assets", "cast_src")
CH = os.path.join(HERE, "assets", "characters")
OUT = os.path.join(CH, "anim")
os.makedirs(OUT, exist_ok=True)


sys.path.insert(0, HERE)
from cutout import cut_full  # noqa: E402


def best_shift(a, b, r=12):
    """Small translation (dx, dy) that best aligns b onto a inside the face box (brute force on a downscale)."""
    A, B = np.asarray(a.convert("L"), float), np.asarray(b.convert("L"), float)
    best, arg = 1e18, (0, 0)
    for dy in range(-r, r + 1, 2):
        for dx in range(-r, r + 1, 2):
            d = np.abs(A[r:-r, r:-r] - np.roll(np.roll(B, dy, 0), dx, 1)[r:-r, r:-r]).mean()
            if d < best:
                best, arg = d, (dx, dy)
    return arg


FACE = {"junction_bot": 0.48}
FACE_X = {"result_chacha": (0.30, 0.78)}  # left/right limits of the face (Chacha raises a newspaper next to his head)  # share of the character's height that holds the face (bot: screen sits lower)


def mouth_frame(base, var, name):
    """Paste only the changed face region of `var` onto `base` (both on the same aligned canvas)."""
    var = align(base, var, 0.0, 0.45)
    bb = base.getbbox()
    top, bottom = bb[1], bb[1] + int((bb[3] - bb[1]) * FACE.get(name, 0.30))
    dx, dy = best_shift(base.crop((bb[0], top, bb[2], bottom)), var.crop((bb[0], top, bb[2], bottom)))
    var = Image.fromarray(np.roll(np.roll(np.asarray(var), dy, 0), dx, 1))
    A = np.asarray(base.convert("RGB"), float); B = np.asarray(var.convert("RGB"), float)
    diff = np.abs(A - B).mean(2)
    fx0, fx1 = FACE_X.get(name, (0.0, 1.0))
    xa, xb = bb[0] + int((bb[2] - bb[0]) * fx0), bb[0] + int((bb[2] - bb[0]) * fx1)
    m = np.zeros(diff.shape, bool); m[top:bottom, xa:xb] = diff[top:bottom, xa:xb] > 28
    m = ndimage.binary_opening(m, iterations=2)
    lab, n = ndimage.label(m)
    if n:
        sizes = ndimage.sum(m, lab, range(1, n + 1))
        m = lab == (1 + int(np.argmax(sizes)))            # the mouth = biggest changed blob in the face
    m = ndimage.binary_dilation(ndimage.binary_fill_holes(m), iterations=10)
    # tone-match: shift the variant's colours so the skin around the mouth matches the base (no visible patch)
    ring = ndimage.binary_dilation(m, iterations=26) & ~ndimage.binary_dilation(m, iterations=8) & (np.asarray(base.split()[-1]) > 200)
    if ring.sum() > 50:
        shift = (A[ring] - B[ring]).mean(0)
        Bc = np.clip(B + shift, 0, 255).astype("uint8")
        var = Image.fromarray(np.dstack([Bc, np.asarray(var.split()[-1])]))
    soft = Image.fromarray((m * 255).astype("uint8")).filter(ImageFilter.GaussianBlur(10))
    out = base.copy()
    patch = var.copy(); patch.putalpha(Image.fromarray(np.minimum(np.asarray(soft), np.asarray(base.split()[-1]))))  # inside the base outline; var colours are kept even where its cut-out punched a hole
    out.alpha_composite(patch)
    return out


def align(base, var, y0f=0.0, y1f=1.0):
    """Scale + shift `var` so the region [y0f, y1f] of the character matches `base` (searched at 1/4 size)."""
    f = 4
    bs = base.reduce(f); A = np.asarray(bs, float); A = np.concatenate([A[..., :3].mean(2, keepdims=True), A[..., 3:]], 2) / 255
    H, W = A.shape[:2]; y0, y1 = int(H * y0f), int(H * y1f)
    vs = var.reduce(f)
    best, arg = 1e18, (1.0, 0, 0)
    for sc in np.arange(0.86, 1.141, 0.02):
        v = vs.resize((round(vs.width * sc), round(vs.height * sc)), Image.BILINEAR)
        cv = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        ox, oy = (W - v.width) // 2, H - v.height          # anchor: bottom-centre
        cv.paste(v, (ox, oy), v)
        B = np.asarray(cv, float); B = np.concatenate([B[..., :3].mean(2, keepdims=True), B[..., 3:]], 2) / 255
        for dy in range(-20, 21, 2):
            Bs = np.roll(B, dy, 0)
            for dx in range(-24, 25, 2):
                d = np.abs(A[y0:y1] - np.roll(Bs, dx, 1)[y0:y1]).sum()
                if d < best:
                    best, arg = d, (sc, ox + dx, oy + dy)
    sc, ox, oy = arg
    # refine at full size around the best guess
    v = var.resize((round(var.width * sc), round(var.height * sc)), Image.LANCZOS)
    out = Image.new("RGBA", base.size, (0, 0, 0, 0)); out.paste(v, (ox * f, oy * f), v)
    return out


def align_legs(base, pose):
    return align(base, pose, 0.55, 0.98)


def run(name):
    """All frames share one canvas: the union box of every frame on the (identically framed) Canva exports."""
    # base = <name>__base.png when present (same render as the variants), else the website cut-out source
    srcs = {"base": os.path.join(SRC, f"{name}.png")}
    for f in sorted(glob.glob(os.path.join(SRC, f"{name}__*.png"))):
        srcs[os.path.basename(f)[len(name) + 2:-4]] = f
    full = {k: cut_full(v, name) for k, v in srcs.items()}
    boxes = [im.getbbox() for im in full.values()]
    box = (min(b[0] for b in boxes), min(b[1] for b in boxes), max(b[2] for b in boxes), max(b[3] for b in boxes))
    scale = min(1600 / (box[3] - box[1]), 1200 / (box[2] - box[0]))
    size = (round((box[2] - box[0]) * scale), round((box[3] - box[1]) * scale))
    frames = {k: im.crop(box).resize(size, Image.LANCZOS) for k, im in full.items()}
    for k, im in frames.items():
        if not k.startswith("m") and k != "base":
            im = align_legs(frames["base"], im)
        img = mouth_frame(frames["base"], im, name) if k.startswith("m") else im
        img.save(os.path.join(OUT, f"{name}__{k}.webp"), quality=90)
        print(name, k, img.size, flush=True)


if __name__ == "__main__":
    for n in sys.argv[1:] or ["naukri_bhaiya", "exam_didi", "result_chacha", "junction_bot"]:
        run(n)
