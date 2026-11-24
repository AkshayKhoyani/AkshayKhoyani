import base64, json, os, sys, urllib.request, concurrent.futures as cf
d = os.path.dirname(os.path.abspath(__file__)); P = json.load(open(os.path.join(d, "prompts.json")))
def gen(k, model="gpt-image-2"):
    out = os.path.join(d, "img", k + ".png")
    if os.path.exists(out): return k, "cached"
    body = json.dumps({"model": model, "prompt": P[k], "size": "1024x1536", "quality": "high", "n": 1}).encode()
    req = urllib.request.Request("https://api.openai.com/v1/images/generations", body, {"Content-Type": "application/json", "Authorization": "Bearer proxy-injected"})
    try:
        r = json.load(urllib.request.urlopen(req, timeout=300))
    except urllib.error.HTTPError as e:
        msg = e.read().decode()[:300]
        if model == "gpt-image-2" and ("model" in msg.lower()): return gen(k, "gpt-image-1")
        return k, f"ERR {e.code} {msg}"
    open(out, "wb").write(base64.b64decode(r["data"][0]["b64_json"])); return k, model
keys = sys.argv[1:] or list(P)
with cf.ThreadPoolExecutor(6) as ex:
    for k, s in ex.map(gen, keys): print(k, s, flush=True)
