"""Publish a reel to Instagram (Finance Junction) via the Graph API.

Usage: python3 engine/ig_post.py <repo-relative mp4 path> <caption.txt> [--publish]
Without --publish it only uploads and checks the container (nothing goes live).\n--publish also posts the same video as a Story (skip with --no-story).
The video must be committed and pushed (and under 20 MB): Instagram fetches it via jsDelivr from GitHub.
The token is injected by the network proxy for graph.facebook.com (never stored here).
"""
import json, os, subprocess, sys, time, urllib.parse

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
# jsDelivr CDN (pinned to the pushed commit): GitHub raw started failing for Meta's fetcher (error 2207076)
sha = subprocess.run(["git", "rev-parse", "HEAD"], capture_output=True, text=True, check=True).stdout.strip()
rel = os.path.relpath(os.path.abspath(mp4), subprocess.run(["git", "rev-parse", "--show-toplevel"], capture_output=True, text=True, check=True).stdout.strip())
url = f"https://cdn.jsdelivr.net/gh/AkshayKhoyani/AkshayKhoyani@{sha}/" + urllib.parse.quote(rel)
print("video url", url)
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
    if "--no-story" not in sys.argv:  # user: har reel story par bhi
        try:
            sid = call("POST", f"{IG}/media", {"media_type": "STORIES", "video_url": url})["id"]
            for _ in range(60):
                st = call("GET", f"{sid}?fields=status_code")
                if st["status_code"] in ("FINISHED", "ERROR", "EXPIRED"):
                    break
                time.sleep(6)
            if st["status_code"] == "FINISHED":
                print("STORY published", call("POST", f"{IG}/media_publish", {"creation_id": sid})["id"])
            else:
                print("STORY failed:", st)
        except SystemExit as e:
            print("STORY failed:", e)
else:
    print("Ready but NOT published (add --publish after user OK).")
