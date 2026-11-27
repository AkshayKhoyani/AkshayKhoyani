"""Publish a reel to Instagram (Finance Junction) via the Graph API.

Usage: python3 engine/ig_post.py <repo-relative mp4 path> <caption.txt> [--publish]
Without --publish it only uploads and checks the container (nothing goes live).
The video must be committed and pushed: Instagram fetches it from GitHub raw.
The token is injected by the network proxy for graph.facebook.com (never stored here).
"""
import json, subprocess, sys, time, urllib.parse

IG = "17841415627923533"  # financejunction.in
BRANCH = "claude/finance-videos-pz24zv"
API = "https://graph.facebook.com/v21.0"


def call(method, path, data=None):
    cmd = ["curl", "-s", "-X", method, f"{API}/{path}", "-H", "Authorization: Bearer proxy-injected"]
    for k, v in (data or {}).items():
        cmd += ["--data-urlencode", f"{k}={v}"]
    out = json.loads(subprocess.run(cmd, capture_output=True, text=True, check=True).stdout)
    if "error" in out:
        raise SystemExit(f"Graph API error: {out['error']}")
    return out


mp4, cap_file = sys.argv[1], sys.argv[2]
url = f"https://raw.githubusercontent.com/AkshayKhoyani/AkshayKhoyani/{BRANCH}/" + urllib.parse.quote(mp4)
cid = call("POST", f"{IG}/media", {"media_type": "REELS", "video_url": url,
                                     "caption": open(cap_file).read().strip(), "share_to_feed": "true"})["id"]
print("container", cid)
for _ in range(60):
    st = call("GET", f"{cid}?fields=status_code,status")
    print(st["status_code"])
    if st["status_code"] in ("FINISHED", "ERROR", "EXPIRED"):
        break
    time.sleep(10)
if st["status_code"] != "FINISHED":
    raise SystemExit(f"Upload failed: {st}")
if "--publish" in sys.argv:
    mid = call("POST", f"{IG}/media_publish", {"creation_id": cid})["id"]
    print("PUBLISHED media", mid, call("GET", f"{mid}?fields=permalink").get("permalink"))
else:
    print("Ready but NOT published (add --publish after user OK).")
