"""Vision QA: check each generated image's visible text. Returns list of failing filenames.

Usage: python3 qa_images.py specs/<slug>.json out/<slug>
"""
import base64, json, os, subprocess, sys

def check(spec, path):
    b64 = base64.b64encode(open(path, "rb").read()).decode()
    allowed = [spec["name"], spec["sub"], spec["badge"], spec["tagline"], spec["texture"], *spec["points"], *spec["uses"],
               "Natural Ingredients", "Export Quality", "Premium Quality", "Bulk & Private Label Supply", "MOQ Just 5 Kg",
               "Export Packing", "Documentation Support", f"Applications of {spec['name']}"]
    q = ("Read all visible text in this product advertisement for the brand 'Tradenest Naturals' (tagline 'GOODNESS FROM NATURE'). "
         f"Expected product name: '{spec['name']}'. Approved text lines (any subset may appear, small wording variations are fine): {allowed}. "
         "List in `problems` ONLY real violations of these rules (otherwise return an empty list): (1) 'Tradenest' / 'Naturals' / the product name is misspelled or garbled; "
         "(2) some text is gibberish or malformed letters; (3) the image shows any of these words: organic, certified, ISO, HACCP, '100%', "
         "'no preservatives', or a health/medical benefit claim (immunity, digestion, energy, detox, healing, cure). "
         "Extra slogans, approved lines and FSSAI Licensed are NOT problems. Each problem must quote the exact offending text.")
    schema = {"type": "object", "additionalProperties": False, "required": ["visible_text", "problems"],
              "properties": {"visible_text": {"type": "string"}, "problems": {"type": "array", "items": {"type": "string"}}}}
    body = {"model": "gpt-5.4-mini", "messages": [{"role": "user", "content": [
        {"type": "text", "text": q}, {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64}"}}]}],
        "response_format": {"type": "json_schema", "json_schema": {"name": "qa", "strict": True, "schema": schema}}}
    r = subprocess.run(["curl", "-s", "https://api.openai.com/v1/chat/completions", "-H", "Authorization: Bearer dummy",
                        "-H", "Content-Type: application/json", "-d", "@-"], input=json.dumps(body), capture_output=True, text=True)
    d = json.loads(json.loads(r.stdout)["choices"][0]["message"]["content"])
    return {"ok": not d["problems"], "issues": "; ".join(d["problems"])}

if __name__ == "__main__":
    spec = json.load(open(sys.argv[1]))
    for f in sorted(os.listdir(sys.argv[2])):
        if f[:2] in ("01", "02", "03", "04", "05") and f.endswith(".jpg"):
            print(f, check(spec, os.path.join(sys.argv[2], f)))
