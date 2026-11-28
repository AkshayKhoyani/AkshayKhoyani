"""ElevenLabs Hinglish voiceover for a reel, one clip per scene.

Reads <reel>/script.json: {"voice_id", "speed", "design": [sec per scene], "lines": [text per scene],
  optional per scene: "speakers": ["naukri_bhaiya", "exam_didi", ...]} -> each character speaks in its own voice (CAST_VOICES).
Skit format (recommended): "model": "eleven_v4" + emotion tags inside lines, e.g. "[shocked] क्या?! ..." / "[laughs]" / "[whispers]".
  With an older model the [tags] are stripped so they are never read aloud.
Writes <reel>/vo/scene_<i>.mp3 (cached), <reel>/timeline.json, <reel>/voice.wav
The API key is injected by the session's network proxy.
Usage: python3 brand/voice.py <reel-dir>
"""
import json
import os
import re
import subprocess
import sys

DIR = os.path.abspath(sys.argv[1])
S = json.load(open(os.path.join(DIR, "script.json")))
VOICE_ID = S.get("voice_id", "cgSgspJ2msm6clMCkdW9")
SPEED = S.get("speed", 1.1)
LEAD, TAIL = S.get("lead", 0.12), S.get("tail", 0.18)   # tight turns between speakers = no dead air
MODEL = S.get("model", "eleven_multilingual_v2")
TAGS_OK = MODEL.startswith(("eleven_v3", "eleven_v4"))


# one voice per character (ElevenLabs). fx: post-processing that gives the character its colour.
CAST_VOICES = {
    "naukri_bhaiya": {"id": "0EEL8EaMIofhe5vDHp11", "fx": None},            # Alok - young male, conversational Hinglish
    "exam_didi": {"id": "UH2Uz5xXGm6QUNMd75r4", "fx": None},                # Sneha - female, Hindi
    "result_chacha": {"id": "Ngq4F8VGOOQ3s3Cqw3o4", "fx": "old"},           # Arpit - deep; pitched down + slower = elderly
    "junction_bot": {"id": "3AMU7jXQuQa3oRvRqUmb", "fx": "robot"},          # Viraj + robotic vocoder (retired)
    "anchor_rohan": {"id": "3AMU7jXQuQa3oRvRqUmb", "fx": None},             # Viraj - young male, crisp news anchor
    "mummy_ji": {"id": "YvwUqS6WZWUWfPi8ccH7", "fx": None},                 # Reva - mature female, warm
    "daroga_ji": {"id": "Ngq4F8VGOOQ3s3Cqw3o4", "fx": None},                # Arpit - deep, authoritative
    "fauji_bhai": {"id": "vIdhHAZdn1bGjKe1dFw8", "fx": None},               # Rudra - intense
    "bank_babu": {"id": "0EEL8EaMIofhe5vDHp11", "fx": None},
    "engineer_bhai": {"id": "7b9mYhmnp0y2qSH1FnBL", "fx": None},            # Bunty - upbeat
    "nurse_didi": {"id": "UH2Uz5xXGm6QUNMd75r4", "fx": None},
    "station_master": {"id": "Ngq4F8VGOOQ3s3Cqw3o4", "fx": None},
    "teacher_sir": {"id": "Ngq4F8VGOOQ3s3Cqw3o4", "fx": None},
    "clerk_babu": {"id": "0EEL8EaMIofhe5vDHp11", "fx": None},
    "forest_guard": {"id": "vIdhHAZdn1bGjKe1dFw8", "fx": None},
    "postman": {"id": "Ngq4F8VGOOQ3s3Cqw3o4", "fx": None},
    "patwari": {"id": "Ngq4F8VGOOQ3s3Cqw3o4", "fx": None},
    "anganwadi_didi": {"id": "YvwUqS6WZWUWfPi8ccH7", "fx": None},
    "fireman": {"id": "vIdhHAZdn1bGjKe1dFw8", "fx": None},
    "pilot": {"id": "3AMU7jXQuQa3oRvRqUmb", "fx": None},
    "judge": {"id": "Ngq4F8VGOOQ3s3Cqw3o4", "fx": None},
    "doctor": {"id": "3AMU7jXQuQa3oRvRqUmb", "fx": None},
    "scientist": {"id": "UH2Uz5xXGm6QUNMd75r4", "fx": None},
    "lady_constable": {"id": "UH2Uz5xXGm6QUNMd75r4", "fx": None},
    "bank_madam": {"id": "YvwUqS6WZWUWfPi8ccH7", "fx": None},
    "student": {"id": "7b9mYhmnp0y2qSH1FnBL", "fx": None},
    "tt_babu": {"id": "Ngq4F8VGOOQ3s3Cqw3o4", "fx": None},
    "navy_sailor": {"id": "vIdhHAZdn1bGjKe1dFw8", "fx": None},
    "airforce": {"id": "3AMU7jXQuQa3oRvRqUmb", "fx": None},
    "computer_operator": {"id": "7b9mYhmnp0y2qSH1FnBL", "fx": None},
    "driver": {"id": "Ngq4F8VGOOQ3s3Cqw3o4", "fx": None},
    "sarkari_officer": {"id": "YvwUqS6WZWUWfPi8ccH7", "fx": None},
}
FX = {
    "old": "asetrate=44100*0.92,aresample=44100,atempo=1.0",
    "robot": "afftfilt=real='hypot(re,im)*sin(0)':imag='hypot(re,im)*cos(0)':win_size=512:overlap=0.75,"
             "aecho=0.8:0.7:12:0.25,highpass=f=180,volume=1.4",
}


def tts(text, out, voice_id=None):
    if not TAGS_OK:
        text = re.sub(r"\[[a-z ]+\]\s*", "", text)
    vs = S.get("voice_settings") or ({"stability": 0.5, "similarity_boost": 0.8} if TAGS_OK else
                                     {"stability": 0.45, "similarity_boost": 0.8, "style": 0.3, "use_speaker_boost": True})
    body = json.dumps({"text": text, "model_id": MODEL, "voice_settings": vs})
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id or VOICE_ID}?output_format=mp3_44100_128"
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
    who = (S.get("speakers") or [None] * len(S["lines"]))[i]
    cv = CAST_VOICES.get(who, {"id": None, "fx": None})
    key = f"{MODEL}|{cv['id']}|{line}"
    if not os.path.exists(mp3) or not os.path.exists(txtf) or open(txtf).read() != key:
        print("generating scene", i, who or "default")
        tts(line, mp3, cv["id"])
        open(txtf, "w").write(key)
    fast = os.path.join(DIR, "vo", f"scene_{i}_fast.wav")
    af = f"atempo={SPEED}" + ("," + FX[cv["fx"]] if cv["fx"] else "")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", mp3, "-af", af, fast], check=True)
    d = duration(fast)
    lead = 0.05 if i == 0 else LEAD
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
