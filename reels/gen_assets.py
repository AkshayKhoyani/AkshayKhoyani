"""Generate images (OpenAI), voiceovers + music (ElevenLabs) for each reel."""
import base64, json, os, sys, concurrent.futures as cf
import urllib.request

ROOT = os.path.dirname(os.path.abspath(__file__))
W = os.path.join(ROOT, "work")
os.makedirs(W, exist_ok=True)
cfg = json.load(open(os.path.join(ROOT, "reels.json")))


def post(url, body, headers=None, timeout=300):
    req = urllib.request.Request(url, data=json.dumps(body).encode(),
                                 headers={"Content-Type": "application/json",
                                          "Authorization": "Bearer dummy",
                                          **(headers or {})})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


def image(path, prompt):
    if os.path.exists(path):
        return path
    prompt += ". Absolutely no text, letters, logos or brand names anywhere in the image."
    data = json.loads(post("https://api.openai.com/v1/images/generations",
                           {"model": "gpt-image-2", "prompt": prompt,
                            "size": "1024x1536", "quality": "high", "n": 1}))
    open(path, "wb").write(base64.b64decode(data["data"][0]["b64_json"]))
    return path


def tts(path, text, prev=None):
    if os.path.exists(path):
        return path
    audio = post("https://api.openai.com/v1/audio/speech",
                 {"model": "gpt-4o-mini-tts", "voice": "ash", "input": text,
                  "response_format": "mp3",
                  "instructions": "Speak in natural Indian Hindi with an energetic, warm, "
                                  "friendly tone like an Indian TV food advertisement voiceover. "
                                  "Native Hindi pronunciation. Brand name is TradeNest Naturals."})
    open(path, "wb").write(audio)
    return path


def music(path, prompt):
    if os.path.exists(path):
        return path
    audio = post("https://api.elevenlabs.io/v1/sound-generation",
                 {"text": prompt, "duration_seconds": 22, "prompt_influence": 0.5},
                 {"xi-api-key": "dummy"})
    open(path, "wb").write(audio)
    return path


jobs = []
with cf.ThreadPoolExecutor(8) as ex:
    for r in cfg["reels"]:
        for i, s in enumerate(r["scenes"]):
            jobs.append(ex.submit(image, f"{W}/{r['id']}_s{i}.png", s["img"]))
            prev = r["scenes"][i - 1]["vo"] if i else None
            jobs.append(ex.submit(tts, f"{W}/{r['id']}_s{i}.mp3", s["vo"], prev))
        jobs.append(ex.submit(music, f"{W}/{r['id']}_music.mp3", r["music"]))
    jobs.append(ex.submit(tts, f"{W}/outro.mp3", cfg["outro_vo"]))
    failed = 0
    for j in cf.as_completed(jobs):
        try:
            print("ok", j.result(), flush=True)
        except Exception as e:
            failed += 1
            body = getattr(e, "read", lambda: b"")()
            print("FAIL", e, body[:300], flush=True)
sys.exit(1 if failed else 0)
