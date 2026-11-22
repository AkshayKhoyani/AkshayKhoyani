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
SPEED = 1.12  # speed-up applied to each clip (atempo)

# Design durations of each scene in scene.html (seconds)
DESIGN = [6.0, 8.0, 8.0, 10.0, 8.0, 4.0]
LEAD = [0.15, 0.3, 0.3, 0.3, 0.3, 0.3]   # silence before the line starts
TAIL = 0.45                                # breathing room after the line

LINES = [
    "दस में से लगभग नौ young traders, F&O में पैसा हार रहे हैं! ये मैं नहीं, SEBI की study कह रही है।",
    "ClearTax की report के मुताबिक, पच्चीस साल से कम उम्र के सैंतीस परसेंट investors, "
    "जिन्होंने capital gain या loss दिखाया, वो loss में थे। साठ साल से ऊपर वालों में ये सिर्फ़ इक्कीस परसेंट है।",
    "FY छब्बीस में individual traders ने F&O में कुल इक्यानवे हज़ार करोड़ रुपये से ज़्यादा गँवाए। "
    "और हर दस traders में से चार से ज़्यादा, तीस साल से कम उम्र के हैं।",
    "ऐसा क्यों? पहला, options trading... कुल नुकसान का बानवे परसेंट यहीं से आया। "
    "दूसरा, बार-बार trading, जिसमें brokerage और charges चुपचाप पैसा खा जाते हैं। "
    "और तीसरा, social media के quick money वाले tips।",
    "तो क्या करें? पहले सीखो, फिर कमाओ। Long term wealth के लिए SIP और index funds। "
    "और trading में सिर्फ़ उतना पैसा लगाओ, जितना खोने के लिए तैयार हो।",
    "ये video अपने उस दोस्त को भेजो, जो रोज़ trading करता है! और follow करो।",
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
    if SPEED != 1.0:
        fast = os.path.join(HERE, "vo", f"scene_{i}_fast.wav")
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", path,
                        "-af", f"atempo={SPEED}", fast], check=True)
        path = fast
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
