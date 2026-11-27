"""Voice loudness per frame for mascot lip-sync.

Usage: python3 engine/amp.py <video_dir>   (reads voice.wav, writes amp.json)
"""
import json
import os
import sys
import wave

import numpy as np

d = sys.argv[1]
FPS = 30
with wave.open(os.path.join(d, "voice.wav")) as w:
    sr, ch = w.getframerate(), w.getnchannels()
    x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).reshape(-1, ch).mean(axis=1) / 32767
hop = sr // FPS
n = len(x) // hop
rms = np.array([np.sqrt(np.mean(x[i * hop:(i + 1) * hop] ** 2)) for i in range(n)])
ref = np.percentile(rms[rms > 0.005], 90) if np.any(rms > 0.005) else 1
a = np.clip(rms / ref, 0, 1)
a = np.where(a < 0.12, 0, a)
sm = np.convolve(a, [0.25, 0.5, 0.25], mode="same")
json.dump({"fps": FPS, "amp": [round(float(v), 2) for v in sm]}, open(os.path.join(d, "amp.json"), "w"))
print("amp frames:", n)
