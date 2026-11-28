"""Short-version voiceover for the 2D scene videos (01-03 style).

Usage: python3 engine/voice2d.py <short_dir>
<short_dir>/short.json:
{
  "design": [4.5, 4.5, 13, 6, 4.5, 3.5],   # design length of each scene in scene.html
  "skip":   [1.2, 0, 0.3, 0, 0, 0],        # seconds of each scene's intro to skip (hook-first)
  "min":    [0, 0, 0, 0, 0, 2.5],          # minimum scene length
  "lines":  ["...", "", ...],              # Devanagari/Hinglish TTS per scene; "" = drop scene
  "speed": 1.15, "lead": 0.12, "tail": 0.25
}
Writes vo/scene_<i>.mp3 (cached by text), timeline.json {scenes, skips, total}, voice.wav.
"""
import json
import os
import subprocess
import sys

d = os.path.abspath(sys.argv[1])
S = json.load(open(os.path.join(d, "short.json")))
VOICE = S.get("voice", "cgSgspJ2msm6clMCkdW9")
SPEED, LEAD, TAIL = S.get("speed", 1.15), S.get("lead", 0.12), S.get("tail", 0.25)
os.makedirs(os.path.join(d, "vo"), exist_ok=True)


def tts(text, out):
    body = json.dumps({"text": text, "model_id": "eleven_multilingual_v2",
                       "voice_settings": {"stability": 0.45, "similarity_boost": 0.8, "style": 0.35,
                                          "use_speaker_boost": True}})
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE}?output_format=mp3_44100_128"
    code = subprocess.run(["curl", "-s", "-o", out, "-w", "%{http_code}", url, "-H", "xi-api-key: proxy-injected",
                           "-H", "Content-Type: application/json", "--data-binary", body],
                          capture_output=True, text=True, check=True).stdout
    if code != "200":
        raise SystemExit(f"ElevenLabs error {code}: {open(out, errors='ignore').read()[:300]}")


def dur(p):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p],
                                capture_output=True, text=True, check=True).stdout)


scenes, clips, t = [], [], 0.0
for i, line in enumerate(S["lines"]):
    if not line.strip():
        scenes.append(0.0)
        continue
    mp3, txt = os.path.join(d, "vo", f"scene_{i}.mp3"), os.path.join(d, "vo", f"scene_{i}.txt")
    if not (os.path.exists(mp3) and os.path.exists(txt) and open(txt).read() == line):
        print("generating scene", i)
        tts(line, mp3)
        open(txt, "w").write(line)
    fast = os.path.join(d, "vo", f"scene_{i}_fast.wav")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", mp3, "-af", f"atempo={SPEED}", fast], check=True)
    length = max(S.get("min", [0] * 6)[i], LEAD + dur(fast) + TAIL)
    clips.append((fast, t + LEAD))
    scenes.append(round(length, 3))
    t += length

json.dump({"scenes": scenes, "skips": S["skip"], "total": round(t, 3)}, open(os.path.join(d, "timeline.json"), "w"))
print("scenes:", scenes, "total", round(t, 2))
inputs, filters = [], []
for i, (c, s) in enumerate(clips):
    inputs += ["-i", c]
    ms = int(s * 1000)
    filters.append(f"[{i}]aresample=44100,adelay={ms}|{ms}[a{i}]")
mix = "".join(f"[a{i}]" for i in range(len(clips)))
filters.append(f"{mix}amix=inputs={len(clips)}:normalize=0,apad,atrim=0:{t:.3f}[out]")
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *inputs, "-filter_complex", ";".join(filters),
                "-map", "[out]", "-ac", "2", os.path.join(d, "voice.wav")], check=True)
