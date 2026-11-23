"""Mix simple synthesized SFX (whoosh, thud, pop) into an existing music.wav.

Usage: python3 engine/sfx.py <music.wav> <events.json>
events.json: [{"t": 1.2, "type": "whoosh"|"thud"|"pop"|"riser"}, ...]
"""
import json
import sys
import wave

import numpy as np

path, ev_path = sys.argv[1], sys.argv[2]
with wave.open(path) as w:
    sr, ch, n = w.getframerate(), w.getnchannels(), w.getnframes()
    data = np.frombuffer(w.readframes(n), dtype=np.int16).reshape(-1, ch).astype(np.float32) / 32767
rng = np.random.default_rng(3)


def whoosh(d=0.45):
    t = np.arange(int(sr * d)) / sr
    noise = rng.standard_normal(len(t))
    k = int(sr * 0.002)
    noise = np.convolve(noise, np.ones(k) / k, mode="same")
    env = np.sin(np.pi * t / d) ** 2
    return 0.5 * noise * env


def thud(d=0.6):
    t = np.arange(int(sr * d)) / sr
    f = 45 + 120 * np.exp(-t * 25)
    return 0.9 * np.sin(2 * np.pi * np.cumsum(f) / sr) * np.exp(-t * 7)


def pop(d=0.18):
    t = np.arange(int(sr * d)) / sr
    f = 900 - 500 * t / d
    return 0.35 * np.sin(2 * np.pi * np.cumsum(f) / sr) * np.exp(-t * 25)


def riser(d=0.9):
    t = np.arange(int(sr * d)) / sr
    f = 200 + 900 * (t / d) ** 2
    return 0.18 * np.sin(2 * np.pi * np.cumsum(f) / sr) * (t / d)


FX = {"whoosh": whoosh, "thud": thud, "pop": pop, "riser": riser}
for e in json.load(open(ev_path)):
    s = FX[e["type"]]()
    i = int(e["t"] * sr)
    if i >= len(data):
        continue
    j = min(len(data), i + len(s))
    for c in range(ch):
        data[i:j, c] += s[: j - i] * e.get("gain", 1.0)
data = data / max(1.0, np.max(np.abs(data)) / 0.95)
with wave.open(path, "wb") as w:
    w.setnchannels(ch); w.setsampwidth(2); w.setframerate(sr)
    w.writeframes((data * 32767).astype(np.int16).tobytes())
print("sfx mixed:", path)
