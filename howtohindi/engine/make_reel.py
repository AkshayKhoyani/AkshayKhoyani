"""One command: spec.json -> voiceover (+captions timing) -> music -> MP4 -> sanity checks.

Usage: python3 engine/make_reel.py <reel_dir> [--preview t1,t2,...] [--force-openai]

<reel_dir>/spec.json:
{
  "slug": "rule-of-72",
  "sources": "…",                       # shown on the CTA scene
  "scenes": [ {"type": "hook", "voice": "tts|cap …", ...}, ... ]   # see engine/REELKIT.md
}
Voice: ElevenLabs (Jessica, word timestamps) while the monthly quota lasts,
otherwise OpenAI TTS (voice "nova") automatically. Keys are injected by the network proxy.
"""
import base64
import json
import os
import subprocess
import sys

ENGINE = os.path.dirname(os.path.abspath(__file__))
d = os.path.abspath(sys.argv[1])
args = sys.argv[2:]
spec = json.load(open(os.path.join(d, "spec.json")))
VOICE_EL = spec.get("voice", "cgSgspJ2msm6clMCkdW9")
OPENAI_VOICE = spec.get("openai_voice", "nova")
EL_SPEED, OA_SPEED = 1.12, 1.06
os.makedirs(os.path.join(d, "vo"), exist_ok=True)
MIN = {"cta": 2.6, "hook": 0, "phone": 3.5, "compare": 3.5, "chart": 4.0, "quiz": 6.5, "engage": 6.0, "metro": 5.0, "gauge": 4.6}


def sh(*cmd, **kw):
    return subprocess.run(list(cmd), capture_output=True, text=True, check=True, **kw).stdout


def tokens(text):
    out = []
    for tok in text.split():
        tts, cap = tok.split("|", 1) if "|" in tok else (tok, tok)
        out.append((tts.replace("_", " "), cap.replace("_", " ")))
    return out


def el_remaining():
    try:
        j = json.loads(sh("curl", "-s", "https://api.elevenlabs.io/v1/user/subscription", "-H", "xi-api-key: proxy-injected"))
        return j["character_limit"] - j["character_count"]
    except Exception:
        return 0


def el_tts(text, mp3, al):
    body = json.dumps({"text": text, "model_id": "eleven_multilingual_v2",
                       "voice_settings": {"stability": 0.45, "similarity_boost": 0.8, "style": 0.35, "use_speaker_boost": True}})
    r = sh("curl", "-s", "-w", "\n%{http_code}",
           f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_EL}/with-timestamps?output_format=mp3_44100_128",
           "-H", "xi-api-key: proxy-injected", "-H", "Content-Type: application/json", "--data-binary", body)
    payload, code = r.rsplit("\n", 1)
    if code != "200":
        return False
    j = json.loads(payload)
    open(mp3, "wb").write(base64.b64decode(j["audio_base64"]))
    json.dump(j["alignment"], open(al, "w"))
    return True


def oa_tts(text, mp3):
    body = json.dumps({"model": "gpt-4o-mini-tts", "voice": OPENAI_VOICE, "input": text, "response_format": "mp3",
                       "instructions": "Young Indian woman, documentary explainer narrator, natural Hinglish with Indian accent. "
                                       "Energetic, friendly, clear, medium-fast pace, like a top Instagram reel."})
    code = sh("curl", "-s", "-o", mp3, "-w", "%{http_code}", "https://api.openai.com/v1/audio/speech",
              "-H", "Authorization: Bearer proxy-injected", "-H", "Content-Type: application/json", "--data-binary", body)
    if code != "200":
        raise SystemExit(f"OpenAI TTS error {code}: {open(mp3, errors='ignore').read()[:300]}")


def duration(p):
    return float(sh("ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p))


force_oa = "--force-openai" in args
total_chars = sum(len(" ".join(t for t, _ in tokens(s["voice"]))) for s in spec["scenes"])
remaining = 0 if force_oa else el_remaining()
use_el = remaining > total_chars + 150
print(f"voice: {'ElevenLabs' if use_el else 'OpenAI'} (EL remaining {remaining}, need {total_chars})")

scenes, clips, cursor = [], [], 0.0
for i, s in enumerate(spec["scenes"]):
    toks = tokens(s["voice"])
    text = " ".join(t for t, _ in toks)
    eng = "el" if use_el else "oa"
    mp3, al, key = (os.path.join(d, "vo", f"s{i}.{x}") for x in ("mp3", "json", "txt"))
    keytxt = eng + ":" + text
    if not (os.path.exists(mp3) and os.path.exists(key) and open(key).read() == keytxt):
        print("tts scene", i, eng)
        if eng == "el" and not el_tts(text, mp3, al):
            print("  ElevenLabs failed, falling back to OpenAI"); eng = "oa"; keytxt = "oa:" + text
        if eng == "oa":
            oa_tts(text, mp3)
            if os.path.exists(al): os.remove(al)
        open(key, "w").write(keytxt)
    eng = open(key).read().split(":", 1)[0]
    speed = EL_SPEED if eng == "el" else OA_SPEED
    fast = os.path.join(d, "vo", f"s{i}_fast.wav")
    sh("ffmpeg", "-y", "-loglevel", "error", "-i", mp3, "-af", f"atempo={speed}", fast)
    dur = duration(fast)
    lead = 0.05 if i == 0 else 0.15
    start = cursor + lead
    words = []
    if eng == "el" and os.path.exists(al):
        A = json.load(open(al)); ch, cs, ce = A["characters"], A["character_start_times_seconds"], A["character_end_times_seconds"]
        pos = 0
        for tt, cap in toks:
            idx = [k for k in range(pos, min(pos + len(tt), len(ch))) if not ch[k].isspace()]
            a = cs[idx[0]] / speed if idx else 0; b = ce[idx[-1]] / speed if idx else a
            parts = cap.split(" "); tot = sum(len(p) for p in parts) or 1; acc = 0
            for p in parts:
                ps = a + (b - a) * acc / tot; acc += len(p)
                words.append({"w": p, "s": round(start + ps, 3), "e": round(start + a + (b - a) * acc / tot, 3)})
            pos += len(tt) + 1
    else:  # proportional timing
        caps = [p for _, c in toks for p in c.split(" ")]
        tot = sum(len(p) + 1 for p in caps) or 1; acc = 0; span = max(dur - 0.25, 0.5)
        for p in caps:
            ps = 0.1 + span * acc / tot; acc += len(p) + 1
            words.append({"w": p, "s": round(start + ps, 3), "e": round(start + 0.1 + span * acc / tot, 3)})
    end = max(start + dur + 0.25 + s.get("pad", 0), cursor + s.get("min", MIN.get(s["type"], 0)))
    scenes.append({"start": round(cursor, 3), "end": round(end, 3), "words": words, "voice": eng})
    clips.append((fast, start))
    cursor = end

total = round(cursor, 3)
json.dump({"scenes": scenes, "total": total}, open(os.path.join(d, "timeline.json"), "w"), ensure_ascii=False)
print("scenes:", [round(s["end"] - s["start"], 2) for s in scenes], "total", total)

inputs, filters = [], []
for i, (c, st) in enumerate(clips):
    inputs += ["-i", c]; ms = int(st * 1000)
    filters.append(f"[{i}]aresample=44100,adelay={ms}|{ms}[a{i}]")
filters.append("".join(f"[a{i}]" for i in range(len(clips))) + f"amix=inputs={len(clips)}:normalize=0,apad,atrim=0:{total}[out]")
sh("ffmpeg", "-y", "-loglevel", "error", *inputs, "-filter_complex", ";".join(filters), "-map", "[out]", "-ac", "2", os.path.join(d, "voice.wav"))
sh("python3", os.path.join(ENGINE, "music.py"), os.path.join(d, "music.wav"), str(total))
idx = os.path.join(d, "index.html")
if not os.path.exists(idx):
    open(idx, "w").write('<!doctype html><html><head><meta charset="utf-8"><title>reel</title>'
                         '<style>html,body{margin:0;background:#000}canvas{display:block}</style></head>'
                         f'<body><script type="module" src="/engine/{"mixkit" if spec.get("kit") == "mix" else "reelkit"}.js"></script></body></html>')

render = ["node", os.path.join(ENGINE, "render3d.js"), d]
if "--preview" in args:
    print(sh(*render, "--preview", args[args.index("--preview") + 1], env={**os.environ, "PREVIEW_DIR": d}))
    sys.exit(0)
out = os.path.join(d, spec.get("slug", os.path.basename(d)) + ".mp4")
subprocess.run(render + ["--out", out], check=True, stdout=subprocess.DEVNULL)
# sanity: duration + no flat (blank) frames
dd = duration(out)
flat = []
for k in range(int(dd)):
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-ss", str(k), "-i", out, "-frames:v", "1", "-vf", "scale=36:64",
                          "-f", "rawvideo", "-pix_fmt", "gray", "-"], capture_output=True).stdout
    if raw:
        m = sum(raw) / len(raw); sd = (sum((x - m) ** 2 for x in raw) / len(raw)) ** 0.5
        if sd < 8: flat.append(k)
print(json.dumps({"out": out, "duration": round(dd, 2), "voice": scenes[0]["voice"], "flat_frames_at": flat}))
