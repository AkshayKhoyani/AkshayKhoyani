"""Generate per-scene Hinglish voiceover with ElevenLabs and build the timeline.

Writes:
  vo/scene_<i>.mp3   one clip per scene (cached; delete to regenerate)
  timeline.json      actual scene durations + voice start offsets
  voice.wav          all clips placed on the timeline

The API key is injected by the session's network proxy (header xi-api-key).
Usage: python3 voiceover.py
"""
import json
import os
import subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
VOICE_ID = "cgSgspJ2msm6clMCkdW9"  # Jessica
MODEL = "eleven_multilingual_v2"

# Design durations of each scene in scene.html (seconds)
DESIGN = [4.5, 4.5, 13.0, 6.0, 4.5, 3.5]
LEAD = [0.15, 0.3, 0.3, 0.3, 0.3, 0.3]   # silence before the line starts
TAIL = 0.45                                # breathing room after the line

LINES = [
    "सिर्फ़ पाँच हज़ार रुपये हर महीने... बीस साल में कितने बनेंगे?",
    "मान लो SIP में बारह परसेंट का सालाना return मिलता है, और समय है बीस साल।",
    "अब देखो magic! शुरू के सालों में पैसा धीरे-धीरे बढ़ता है... "
    "लेकिन फिर compounding अपना कमाल दिखाती है, और graph सीधा ऊपर भागता है!",
    "आपने लगाए सिर्फ़ बारह लाख रुपये, और आपको मिले लगभग पचास लाख! "
    "यानी अड़तीस लाख का profit, सिर्फ़ compounding से!",
    "और असली जादू ये है... पहले दस साल में बने करीब बारह लाख, "
    "पर अगले दस साल में अड़तीस लाख! इसलिए जितना जल्दी शुरू करो, उतना अच्छा।",
    "ऐसी और money tips के लिए, Finance Junction को follow करो!",
]


def tts(text, out):
    body = json.dumps({
        "text": text,
        "model_id": MODEL,
        "voice_settings": {"stability": 0.45, "similarity_boost": 0.8,
                           "style": 0.3, "use_speaker_boost": True},
    })
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}?output_format=mp3_44100_128"
    code = subprocess.run(
        ["curl", "-s", "-o", out, "-w", "%{http_code}", url,
         "-H", "xi-api-key: proxy-injected", "-H", "Content-Type: application/json",
         "--data-binary", body],
        capture_output=True, text=True, check=True).stdout
    if code != "200":
        raise SystemExit(f"ElevenLabs error {code}: {open(out, errors='ignore').read()[:300]}")


def duration(path):
    return float(subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
        capture_output=True, text=True, check=True).stdout)


os.makedirs(os.path.join(HERE, "vo"), exist_ok=True)
clips, durs, starts, t = [], [], [], 0.0
for i, line in enumerate(LINES):
    path = os.path.join(HERE, "vo", f"scene_{i}.mp3")
    if not os.path.exists(path):
        print("generating", path)
        tts(line, path)
    d = duration(path)
    scene_len = max(DESIGN[i], LEAD[i] + d + TAIL)
    clips.append(path)
    starts.append(round(t + LEAD[i], 3))
    durs.append(round(scene_len, 3))
    t += scene_len

json.dump({"scenes": durs, "voice_starts": starts, "total": round(t, 3)},
          open(os.path.join(HERE, "timeline.json"), "w"), indent=2)
print("timeline:", durs, "total", round(t, 2))

# Place clips on one track
inputs, filters = [], []
for i, (c, s) in enumerate(zip(clips, starts)):
    inputs += ["-i", c]
    ms = int(s * 1000)
    filters.append(f"[{i}]aresample=44100,adelay={ms}|{ms}[a{i}]")
mix = "".join(f"[a{i}]" for i in range(len(clips)))
filters.append(f"{mix}amix=inputs={len(clips)}:normalize=0,apad,atrim=0:{t:.3f}[out]")
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *inputs, "-filter_complex", ";".join(filters),
                "-map", "[out]", "-ac", "2", os.path.join(HERE, "voice.wav")], check=True)
print("wrote voice.wav")
