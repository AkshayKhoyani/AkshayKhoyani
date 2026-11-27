"""Apply official-notification links to published posts from research results.

Input: JSON list(s) of {id, t, pdf_url, local_file, page_url} (see notif.py).
For each post: mirror the PDF into our media library, point every notification mention/link at the official PDF
(or at the mirror when the official PDF has no usable link), add the Quick Summary buttons, set ej_notification_url.
Usage: python3 engine/notif_apply.py res0.json res1.json ... [--dry]
"""
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import notif  # noqa: E402
import wp  # noqa: E402

DRY = "--dry" in sys.argv
REST = {"posts": "posts"}


def main():
    rows = []
    for f in [a for a in sys.argv[1:] if not a.startswith("--")]:
        rows += json.load(open(f))
    done = 0
    for r in rows:
        t = r["t"]
        p = wp.req("GET", f"/wp/v2/{t}/{r['id']}?context=edit&_fields=id,slug,content,meta")
        c = p["content"]["raw"]
        mirror = ""
        src = r.get("local_file") if r.get("local_file") and os.path.exists(r["local_file"]) else r.get("pdf_url")
        if src and not DRY:
            mirror = notif.mirror_pdf(src, p["slug"])
        url = r.get("pdf_url") or mirror or r.get("page_url") or ""
        if not url:
            # nothing better known: keep the post's own official link (board site) for the plain-text mentions
            m = re.search(r'<a class="ejp-btn nt" href="([^"]+)"', c) or re.search(r'href="(https?://(?!employmentjunction|www\.instagram|wa\.me|t\.me|api\.whatsapp|www\.facebook|twitter|[^"]*sarkari|[^"]*freejobalert|[^"]*testbook|[^"]*adda247|[^"]*jagranjosh)[^"]+)"', c)
            url = m.group(1) if m else ""
        new = notif.link_notifications(c, url, mirror)
        upd = {}
        if new != c:
            upd["content"] = new
        if t == "ej_job" and url and (p.get("meta") or {}).get("ej_notification_url") != url:
            upd["meta"] = {"ej_notification_url": url}
        print(t, r["id"], "pdf" if r.get("pdf_url") else "page" if r.get("page_url") else "-", "mirror" if mirror else "", "changed" if upd else "same", flush=True)
        if upd and not DRY:
            wp.req("POST", f"/wp/v2/{t}/{r['id']}", upd)
            done += 1
    print("updated", done)


if __name__ == "__main__":
    main()
