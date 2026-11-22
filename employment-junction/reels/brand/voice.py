"""ElevenLabs Hinglish voiceover for a reel, one clip per scene.

Reads <reel>/script.json: {"voice_id", "speed", "design": [sec per scene], "lines": [text per scene]}
Writes <reel>/vo/scene_<i>.mp3 (cached), <reel>/timeline.json, <reel>/voice.wav
The API key is injected by the session's network proxy.
Usage: python3 brand/voice.py <reel-dir>
"""
import json
import os
import subprocess
import sys

DIR = os.path.abspath(sys.argv[1])
S = json.load(open(os.path.join(DIR, "script.json")))
VOICE_ID = S.get("voice_id", "cgSgspJ2msm6clMCkdW9")
SPEED = S.get("speed", 1.1)
LEAD, TAIL = 0.3, 0.4


def tts(text, out):
    body = json.dumps({"text": text, "model_id": "eleven_multilingual_v2",
                       "voice_settings": {"stability": 0.45, "similarity_boost": 0.8, "style": 0.3, "use_speaker_boost": True}})
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}?output_format=mp3_44100_128"
    code = subprocess.run(["curl", "-s", "-o", out, "-w", "%{http_code}", url, "-H", "xi-api-key: proxy-injected",
                           "-H", "Content-Type: application/json", "--data-binary", body],
                          capture_output=True, text=True, check=True).stdout
    if code != "200":
        os.remove(out)
        raise SystemExit(f"ElevenLabs error {code}")


def duration(p):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p],
                                capture_output=True, text=True, check=True).stdout)


os.makedirs(os.path.join(DIR, "vo"), exist_ok=True)
clips, durs, starts, t = [], [], [], 0.0
for i, line in enumerate(S["lines"]):
    mp3 = os.path.join(DIR, "vo", f"scene_{i}.mp3")
    txtf = os.path.join(DIR, "vo", f"scene_{i}.txt")
    if not os.path.exists(mp3) or not os.path.exists(txtf) or open(txtf).read() != line:
        print("generating scene", i)
        tts(line, mp3)
        open(txtf, "w").write(line)
    fast = os.path.join(DIR, "vo", f"scene_{i}_fast.wav")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", mp3, "-af", f"atempo={SPEED}", fast], check=True)
    d = duration(fast)
    lead = 0.15 if i == 0 else LEAD
    scene_len = max(S["design"][i], lead + d + TAIL)
    clips.append(fast); starts.append(round(t + lead, 3)); durs.append(round(scene_len, 3)); t += scene_len

json.dump({"scenes": durs, "voice_starts": starts, "total": round(t, 3)}, open(os.path.join(DIR, "timeline.json"), "w"), indent=2)
print("timeline:", durs, "total", round(t, 2))
inputs, filt = [], []
for i, (c, s) in enumerate(zip(clips, starts)):
    inputs += ["-i", c]; ms = int(s * 1000)
    filt.append(f"[{i}]aresample=44100,adelay={ms}|{ms}[a{i}]")
filt.append("".join(f"[a{i}]" for i in range(len(clips))) + f"amix=inputs={len(clips)}:normalize=0,apad,atrim=0:{t:.3f}[out]")
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *inputs, "-filter_complex", ";".join(filt), "-map", "[out]", "-ac", "2",
                os.path.join(DIR, "voice.wav")], check=True)
print("wrote voice.wav")
