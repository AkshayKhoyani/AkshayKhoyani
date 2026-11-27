"""Build the full IndiaMART kit (6 images + PDF) for every product spec, one folder per product.

Usage: python3 run_all.py [slug ...]
"""
import glob, json, os, subprocess, sys, concurrent.futures as cf

HERE = os.path.dirname(os.path.abspath(__file__))
os.chdir(HERE)
sys.path.insert(0, HERE)
from qa_images import check  # noqa: E402

LOG = os.path.join(HERE, "out", "_run_log.jsonl")
os.makedirs(os.path.join(HERE, "out"), exist_ok=True)

def sh(*a):
    r = subprocess.run(list(a), capture_output=True, text=True, timeout=1800)
    if r.returncode:
        raise RuntimeError(f"{a[1]} failed: {r.stdout[-300:]} {r.stderr[-300:]}")
    return r.stdout

def build(spec_path):
    spec = json.load(open(spec_path))
    slug = spec["slug"]
    out = os.path.join(HERE, "out", slug)
    pdf = os.path.join(out, f"TradeNest_{slug}.pdf")
    if os.path.exists(pdf) and os.path.exists(os.path.join(out, "06-spec-card.jpg")):
        return {"slug": slug, "status": "skip"}
    if not os.path.exists(spec_path.replace(".json", ".content.json")):
        sh("python3", "gen_content.py", spec_path)
    report = {}
    for attempt in range(3):
        sh("python3", "gen_images.py", spec_path, out)
        bad = []
        for f in sorted(glob.glob(os.path.join(out, "0[1-5]-*.jpg"))):
            name = os.path.basename(f)
            if report.get(name, {}).get("ok"):
                continue
            try:
                res = check(spec, f)
            except Exception as e:  # QA outage should not block the run
                res = {"ok": True, "issues": f"qa-error: {e}"}
            report[name] = res
            if not res["ok"]:
                bad.append(f)
        if not bad:
            break
        if attempt < 2:
            for f in bad:
                os.remove(f)
    sh("python3", "build_docs.py", spec_path, out)
    for f in glob.glob(os.path.join(out, "_*")):
        os.remove(f)
    failed = {k: v["issues"] for k, v in report.items() if not v["ok"]}
    res = {"slug": slug, "status": "done", "qa_failed": failed}
    with open(LOG, "a") as fh:
        fh.write(json.dumps(res) + "\n")
    return res

if __name__ == "__main__":
    specs = sorted(p for p in glob.glob(os.path.join(HERE, "specs", "*.json")) if not p.endswith(".content.json"))
    if sys.argv[1:]:
        specs = [p for p in specs if os.path.basename(p)[:-5] in sys.argv[1:]]
    print("products:", len(specs), flush=True)
    with cf.ThreadPoolExecutor(3) as ex:
        futs = {ex.submit(build, p): p for p in specs}
        for i, f in enumerate(cf.as_completed(futs), 1):
            try:
                print(i, json.dumps(f.result()), flush=True)
            except Exception as e:
                print(i, "FAIL", os.path.basename(futs[f]), str(e)[:300], flush=True)
