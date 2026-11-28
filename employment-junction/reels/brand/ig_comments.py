"""Auto-reply to Instagram comments – Employment Junction.

For every reel posted in the last 7 days (POSTED.json, else the account's recent reels):
  * each new comment (not yet answered by us) gets a PRIVATE REPLY (DM) with the job-post link,
  * plus a short public reply ("Link DM kar diya ✅") so others see it and we never answer twice.
If Meta refuses the DM (permission not approved yet), only the public reply goes out, pointing to the link in bio/website.
Stateless: "already answered" = our account has replied under that comment.

Usage: python3 brand/ig_comments.py [--dry]
"""
import json
import os
import re
import subprocess
import sys
import time

IG = "17841404202078715"  # employmentjunction.in
ME = "employmentjunction.in"
API = "https://graph-video.facebook.com/v21.0"
HERE = os.path.dirname(os.path.abspath(__file__))
DRY = "--dry" in sys.argv


def call(method, path, data=None, js=None):
    cmd = ["curl", "-s", "-X", method, f"{API}/{path}", "-H", "Authorization: Bearer proxy-injected"]
    for k, v in (data or {}).items():
        cmd += ["--data-urlencode", f"{k}={v}"]
    if js is not None:
        cmd += ["-H", "Content-Type: application/json", "--data-binary", json.dumps(js)]
    return json.loads(subprocess.run(cmd, capture_output=True, text=True).stdout or "{}")


def reels():
    """media_id -> link for reels from the last 7 days."""
    out = {}
    posted = os.path.join(HERE, "..", "POSTED.json")
    known = {p["media_id"]: p for p in json.load(open(posted))} if os.path.exists(posted) else {}
    media = call("GET", f"{IG}/media?fields=id,caption,timestamp,media_product_type&limit=25").get("data", [])
    now = time.time()
    for m in media:
        ts = time.mktime(time.strptime(m["timestamp"][:19], "%Y-%m-%dT%H:%M:%S"))
        if now - ts > 7 * 86400:
            continue
        link = (known.get(m["id"]) or {}).get("link")
        if not link:  # fall back: first employmentjunction.in link in the caption, else the website
            mm = re.search(r"https?://employmentjunction\.in/\S+", m.get("caption") or "")
            link = mm.group(0) if mm else "https://employmentjunction.in/"
        out[m["id"]] = link
    return out


def main():
    done = 0
    for mid, link in reels().items():
        for c in call("GET", f"{mid}/comments?fields=id,text,username,timestamp,replies{{username}}&limit=50").get("data", []):
            if c.get("username") == ME:
                continue
            if any(r.get("username") == ME for r in (c.get("replies") or {}).get("data", [])):
                continue  # already answered
            name = c.get("username", "")
            msg = (f"Namaste {name}! 🙏 Ye rahi poori details aur apply link 👉 {link}\n"
                   f"Roz ki Sarkari Naukri updates ke liye Employment Junction follow karein. All the best! 🎯")
            print("comment", c["id"], name, repr((c.get("text") or "")[:60]))
            if DRY:
                continue
            dm = call("POST", f"{IG}/messages", js={"recipient": {"comment_id": c["id"]}, "message": {"text": msg}})
            ok = "error" not in dm
            public = "Link aapke DM mein bhej diya hai ✅" if ok else f"Poori details aur link: employmentjunction.in (bio mein link) ✅"
            rp = call("POST", f"{c['id']}/replies", {"message": public})
            print("  DM", "sent" if ok else f"failed: {dm.get('error', {}).get('message', '')[:120]}", "| public reply", "ok" if "id" in rp else rp)
            done += 1
    print("answered", done)


if __name__ == "__main__":
    main()
