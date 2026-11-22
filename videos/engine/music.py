"""Generate a soft, royalty-free background track (pads + arpeggio + bass).

Usage: python3 music.py out.wav [duration_seconds]
"""
import sys
import wave

import numpy as np

SR = 44100
out = sys.argv[1] if len(sys.argv) > 1 else "music.wav"
DUR = float(sys.argv[2]) if len(sys.argv) > 2 else 36.0
N = int(SR * DUR)
t = np.arange(N) / SR


def hz(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


# Am - F - C - G, 4 seconds each (BPM 120 -> 2 bars of 4/4 per chord)
CHORDS = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]
CHORD_LEN = 4.0
BEAT = 0.5

mix = np.zeros(N)

# Pads with crossfading envelopes
for i in range(int(np.ceil(DUR / CHORD_LEN)) + 1):
    start = i * CHORD_LEN
    chord = CHORDS[i % len(CHORDS)]
    s0 = int(max(0, start - 0.3) * SR)
    s1 = min(N, int((start + CHORD_LEN + 0.5) * SR))
    if s0 >= N:
        break
    seg = t[s0:s1] - start
    env = np.clip((seg + 0.3) / 0.8, 0, 1) * np.clip((CHORD_LEN + 0.5 - seg) / 0.8, 0, 1)
    for n in chord + [chord[0] + 12]:
        f = hz(n)
        tone = np.sin(2 * np.pi * f * t[s0:s1]) + 0.25 * np.sin(2 * np.pi * 2 * f * t[s0:s1] + 0.3)
        tone *= 1 + 0.08 * np.sin(2 * np.pi * 0.25 * t[s0:s1])
        mix[s0:s1] += 0.05 * env * tone

# Plucky arpeggio (eighth notes)
pattern = [0, 1, 2, 3, 2, 1, 0, 2]
step = BEAT / 2
for k in range(int(DUR / step)):
    st = k * step
    chord = CHORDS[int(st // CHORD_LEN) % len(CHORDS)]
    notes = chord + [chord[0] + 12]
    n = notes[pattern[k % len(pattern)]] + 12
    s0 = int(st * SR)
    s1 = min(N, s0 + int(0.6 * SR))
    seg = t[s0:s1] - st
    f = hz(n)
    env = np.exp(-seg * 7) * np.clip(seg / 0.005, 0, 1)
    tone = np.sin(2 * np.pi * f * seg) + 0.3 * np.sin(2 * np.pi * 2 * f * seg)
    mix[s0:s1] += 0.045 * env * tone

# Soft bass + light kick on each beat
for k in range(int(DUR / BEAT)):
    st = k * BEAT
    chord = CHORDS[int(st // CHORD_LEN) % len(CHORDS)]
    s0 = int(st * SR)
    s1 = min(N, s0 + int(0.45 * SR))
    seg = t[s0:s1] - st
    f = hz(chord[0] - 12)
    mix[s0:s1] += 0.12 * np.exp(-seg * 4) * np.sin(2 * np.pi * f * seg)
    kick_f = 50 + 90 * np.exp(-seg * 30)
    mix[s0:s1] += 0.10 * np.exp(-seg * 12) * np.sin(2 * np.pi * np.cumsum(kick_f) / SR)

# Simple low-pass smoothing, fades, normalize
kernel = np.ones(6) / 6
mix = np.convolve(mix, kernel, mode="same")
fade_in = np.clip(t / 0.8, 0, 1)
fade_out = np.clip((DUR - t) / 2.5, 0, 1)
mix *= fade_in * fade_out
mix = mix / np.max(np.abs(mix)) * 0.6

stereo = np.stack([mix, np.roll(mix, int(0.012 * SR))], axis=1)
pcm = (stereo * 32767).astype(np.int16)
with wave.open(out, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print("wrote", out)
