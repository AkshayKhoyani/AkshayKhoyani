"""ElevenLabs voiceover with word timings for the 3D engine.

Usage: python3 engine/voice.py <video_dir>

<video_dir>/script.json:
{
  "voice": "cgSgspJ2msm6clMCkdW9",   # Jessica
  "speed": 1.12, "lead": 0.25, "gap": 0.35, "tail": 2.5,
  "lines": [ {"text": "आप|Aap चाय|chai UPI ...", "min": 4.0}, ... ]
}
Tokens: "tts|caption"; a token without "|" is used for both. "_" inside a token = space.

Writes <video_dir>/vo/line_<i>.mp3 (+ .json alignment, cached), timeline.json, voice.wav.
The API key is injected by the session's network proxy (header xi-api-key).
"""
import base64
import json
import os
import subprocess
import sys

d = os.path.abspath(sys.argv[1])
S = json.load(open(os.path.join(d, "script.json")))
VOICE = S.get("voice", "cgSgspJ2msm6clMCkdW9")
SPEED = S.get("speed", 1.12)
MODEL = S.get("model", "eleven_multilingual_v2")
VSET = S.get("voice_settings", {"stability": 0.45, "similarity_boost": 0.8, "style": 0.3, "use_speaker_boost": True})
LEAD, GAP, TAIL = S.get("lead", 0.25), S.get("gap", 0.35), S.get("tail", 2.5)
os.makedirs(os.path.join(d, "vo"), exist_ok=True)


def tokens(text):
    out = []
    for tok in text.split():
        tts, cap = tok.split("|", 1) if "|" in tok else (tok, tok)
        out.append((tts.replace("_", " "), cap.replace("_", " ")))
    return out


def tts(text, mp3, align):
    body = json.dumps({"text": text, "model_id": MODEL, "voice_settings": VSET})
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE}/with-timestamps?output_format=mp3_44100_128"
    r = subprocess.run(["curl", "-s", "-w", "\n%{http_code}", url, "-H", "xi-api-key: proxy-injected",
                        "-H", "Content-Type: application/json", "--data-binary", body],
                       capture_output=True, text=True, check=True).stdout
    payload, code = r.rsplit("\n", 1)
    if code != "200":
        raise SystemExit(f"ElevenLabs error {code}: {payload[:300]}")
    j = json.loads(payload)
    open(mp3, "wb").write(base64.b64decode(j["audio_base64"]))
    json.dump(j["alignment"], open(align, "w"))


def duration(p):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                                 "-of", "csv=p=0", p], capture_output=True, text=True, check=True).stdout)


SILENT = "--silent" in sys.argv or S.get("silent", False)  # no-voice fallback (quota khatam): text + music only


def silent_line(toks, start):
    """Word timings at a comfortable reading pace (no audio)."""
    words, t = [], 0.0
    for _, cap in toks:
        for part in cap.split(" "):
            if not part:
                continue
            d = 0.22 + 0.045 * len(part)
            words.append({"w": part, "s": round(start + t, 3), "e": round(start + t + d, 3)})
            t += d + 0.06
    return words, t + 0.5


lines, clips, cursor = [], [], 0.0
for i, L in enumerate(S["lines"]):
    if SILENT:
        start = cursor + LEAD
        words, dur = silent_line(tokens(L["text"]), start)
        length = max(dur, L.get("min", 0))
        lines.append({"start": round(start, 3), "end": round(start + length, 3), "audio": 0, "words": words})
        cursor = start + length + GAP
        continue
    toks = tokens(L["text"])
    text = " ".join(t for t, _ in toks)
    mp3, al = os.path.join(d, "vo", f"line_{i}.mp3"), os.path.join(d, "vo", f"line_{i}.json")
    cached = os.path.join(d, "vo", f"line_{i}.txt")
    if not (os.path.exists(mp3) and os.path.exists(al) and os.path.exists(cached) and open(cached).read() == MODEL + VOICE + text):
        print("generating line", i)
        tts(text, mp3, al)
        open(cached, "w").write(MODEL + VOICE + text)
    fast = os.path.join(d, "vo", f"line_{i}_fast.wav")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", mp3, "-af", f"atempo={SPEED}", fast], check=True)
    dur = duration(fast)
    A = json.load(open(al))
    chars, cs, ce = A["characters"], A["character_start_times_seconds"], A["character_end_times_seconds"]
    start = cursor + LEAD
    words, pos = [], 0
    for t_tts, t_cap in toks:
        a, b = pos, pos + len(t_tts)
        idx = [k for k in range(a, min(b, len(chars))) if not chars[k].isspace()]
        s = cs[idx[0]] / SPEED if idx else 0
        e = ce[idx[-1]] / SPEED if idx else s
        parts = t_cap.split(" ")
        tot = sum(len(x) for x in parts) or 1
        acc = 0
        for part in parts:
            if not part:
                continue
            ps = s + (e - s) * acc / tot
            acc += len(part)
            words.append({"w": part, "s": round(start + ps, 3), "e": round(start + s + (e - s) * acc / tot, 3)})
        pos = b + 1
    length = max(dur, L.get("min", 0))
    lines.append({"start": round(start, 3), "end": round(start + length, 3), "audio": round(dur, 3), "words": words})
    clips.append((fast, start))
    cursor = start + length + GAP

total = round(cursor - GAP + TAIL, 3)
json.dump({"lines": lines, "total": total}, open(os.path.join(d, "timeline.json"), "w"), ensure_ascii=False, indent=1)
print("lines:", [round(l["end"] - l["start"], 2) for l in lines], "total", total)

if SILENT:
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo", "-t", str(total),
                    os.path.join(d, "voice.wav")], check=True)
    print("wrote silent voice.wav (no-voice mode)")
    sys.exit(0)

inputs, filters = [], []
for i, (c, s) in enumerate(clips):
    inputs += ["-i", c]
    ms = int(s * 1000)
    filters.append(f"[{i}]aresample=44100,adelay={ms}|{ms}[a{i}]")
mix = "".join(f"[a{i}]" for i in range(len(clips)))
filters.append(f"{mix}amix=inputs={len(clips)}:normalize=0,apad,atrim=0:{total}[out]")
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *inputs, "-filter_complex", ";".join(filters),
                "-map", "[out]", "-ac", "2", os.path.join(d, "voice.wav")], check=True)
print("wrote voice.wav")
