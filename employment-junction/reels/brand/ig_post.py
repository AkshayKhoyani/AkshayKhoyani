"""Publish a reel to Instagram – Employment Junction (separate from Finance Junction).

Usage: python3 brand/ig_post.py <reel mp4> <caption.txt> [--publish]
Without --publish it only uploads and checks the container (nothing goes live).

Accounts are kept apart on purpose:
  Finance Junction   -> token on graph.facebook.com        (its own scripts, untouched)
  Employment Junction-> token on graph-video.facebook.com  (this script; same Graph API, separate credential)
The token is injected by the network proxy (never stored in the repo).
The mp4 must be committed and pushed (and < 20 MB): Instagram fetches it from jsDelivr (pinned to the commit).
"""
import json
import os
import subprocess
import sys
import time
import urllib.parse

IG = "17841404202078715"  # employmentjunction.in
API = "https://graph-video.facebook.com/v21.0"


def call(method, path, data=None):
    cmd = ["curl", "-s", "-X", method, f"{API}/{path}", "-H", "Authorization: Bearer proxy-injected"]
    for k, v in (data or {}).items():
        cmd += ["--data-urlencode", f"{k}={v}"]
    out = json.loads(subprocess.run(cmd, capture_output=True, text=True, check=True).stdout)
    if "error" in out:
        raise SystemExit(f"Graph API error: {out['error']}")
    return out


def main():
    mp4, cap_file = sys.argv[1], sys.argv[2]
    if os.path.getsize(mp4) > 20 * 1024 * 1024:
        raise SystemExit("mp4 is over 20 MB")
    top = subprocess.run(["git", "rev-parse", "--show-toplevel"], capture_output=True, text=True, check=True).stdout.strip()
    sha = subprocess.run(["git", "rev-parse", "HEAD"], capture_output=True, text=True, check=True).stdout.strip()
    rel = os.path.relpath(os.path.abspath(mp4), top)
    url = f"https://cdn.jsdelivr.net/gh/AkshayKhoyani/AkshayKhoyani@{sha}/" + urllib.parse.quote(rel)
    print("video url", url)
    cid = call("POST", f"{IG}/media", {"media_type": "REELS", "video_url": url,
                                        "caption": open(cap_file).read().strip(), "share_to_feed": "true"})["id"]
    print("container", cid)
    st = {}
    for _ in range(60):
        st = call("GET", f"{cid}?fields=status_code,status")
        print(st.get("status_code"))
        if st.get("status_code") in ("FINISHED", "ERROR", "EXPIRED"):
            break
        time.sleep(10)
    if st.get("status_code") != "FINISHED":
        raise SystemExit(f"Upload failed: {st}")
    if "--publish" in sys.argv:
        mid = call("POST", f"{IG}/media_publish", {"creation_id": cid})["id"]
        link = call("GET", f"{mid}?fields=permalink").get("permalink")
        print("PUBLISHED media", mid, link)
        log = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "POSTED.json")
        data = json.load(open(log)) if os.path.exists(log) else []
        meta = {}
        sj = os.path.join(os.path.dirname(os.path.abspath(mp4)), "script.json")
        if os.path.exists(sj):
            s = json.load(open(sj)); meta = {"keyword": s.get("keyword"), "link": s.get("link")}
        data.append({"media_id": mid, "permalink": link, "reel": rel, "posted_at": time.strftime("%Y-%m-%dT%H:%M:%S%z"), **meta})
        json.dump(data, open(log, "w"), indent=1, ensure_ascii=False)
    else:
        print("Ready but NOT published (add --publish).")


if __name__ == "__main__":
    main()
