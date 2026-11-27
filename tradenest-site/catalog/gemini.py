"""Minimal Gemini (native API) helpers. Auth (x-goog-api-key) is injected by the network proxy."""
import base64, json, subprocess, time

BASE = "https://generativelanguage.googleapis.com/v1beta/models"
TEXT_MODEL = "gemini-3.8-flash"
IMAGE_MODEL = "gemini-3.1-flash-image"

def _post(model, body, timeout=600):
    last = ""
    for attempt in range(4):
        r = subprocess.run(["curl", "-s", f"{BASE}/{model}:generateContent", "-H", "Content-Type: application/json", "-d", "@-"],
                           input=json.dumps(body), capture_output=True, text=True, timeout=timeout)
        last = r.stdout
        try:
            d = json.loads(last)
        except Exception:
            d = {"error": {"message": last[:200], "code": 0}}
        if "error" not in d:
            return d
        if d["error"].get("code") in (429, 500, 503, 0):
            time.sleep(15 * (attempt + 1))
            continue
        break
    raise RuntimeError(f"gemini {model}: {last[:300]}")

def _strip(schema):
    """Gemini responseSchema does not accept additionalProperties/strict keys."""
    if isinstance(schema, dict):
        return {k: _strip(v) for k, v in schema.items() if k not in ("additionalProperties",)}
    if isinstance(schema, list):
        return [_strip(x) for x in schema]
    return schema

def json_call(system, user, schema, images=()):
    parts = [{"text": user}] + [{"inline_data": {"mime_type": m, "data": base64.b64encode(open(p, "rb").read()).decode()}} for p, m in images]
    body = {"systemInstruction": {"parts": [{"text": system}]} if system else None,
            "contents": [{"parts": parts}],
            "generationConfig": {"responseMimeType": "application/json", "responseSchema": _strip(schema)}}
    if not system:
        body.pop("systemInstruction")
    d = _post(TEXT_MODEL, body)
    text = "".join(p.get("text", "") for p in d["candidates"][0]["content"]["parts"] if not p.get("thought"))
    return json.loads(text)

def image(prompt, refs, out_jpg):
    parts = [{"text": prompt}] + [{"inline_data": {"mime_type": m, "data": base64.b64encode(open(p, "rb").read()).decode()}} for p, m in refs]
    body = {"contents": [{"parts": parts}],
            "generationConfig": {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": "1:1"}}}
    d = _post(IMAGE_MODEL, body)
    for p in d["candidates"][0]["content"]["parts"]:
        inl = p.get("inlineData") or p.get("inline_data")
        if inl:
            raw = base64.b64decode(inl["data"])
            tmp = out_jpg + ".tmp"
            open(tmp, "wb").write(raw)
            from PIL import Image
            Image.open(tmp).convert("RGB").resize((1024, 1024)).save(out_jpg, quality=90, optimize=True)
            import os
            os.remove(tmp)
            return out_jpg
    raise RuntimeError("gemini returned no image")
