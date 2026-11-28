"""Official-notification linking for every post.

Rule (from the owner): wherever a post says "official notification" (or notice / advertisement), it must link to the
official notification itself — the PDF, not just the board's homepage. If the official PDF is found, link it directly and
keep a mirror copy in our WordPress media library (official sites often move or block files); if there is no direct link,
the mirror is the link.

    mirror_pdf(url_or_file, name)            -> our media URL for the PDF (uploads once; reuses an existing copy)
    link_notifications(html, url, mirror="") -> html with every notification mention/link pointing at `url`
"""
import json
import os
import re
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import wp  # noqa: E402

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"
PHRASE = re.compile(r"\b(official\s+notification(?:\s+pdf)?|detailed\s+notification|notification\s+pdf|official\s+notice|official\s+advertisement)\b", re.I)
LINKTXT = re.compile(r"notification|notice|advt|advertisement|\bpdf\b", re.I)


def download(url, dest):
    subprocess.run(["curl", "-sL", "--max-time", "120", "-A", UA, "-o", dest, url], check=False)
    ok = os.path.exists(dest) and open(dest, "rb").read(5) == b"%PDF-"
    if not ok and os.path.exists(dest):
        os.remove(dest)
    return ok


def mirror_pdf(src, name):
    """Upload a PDF (local path or URL) to WP media as <name>.pdf; returns its public URL."""
    name = re.sub(r"[^a-z0-9-]+", "-", name.lower()).strip("-")[:80] + "-official-notification.pdf"
    found = wp.req("GET", "/wp/v2/media?search=" + name[:-4] + "&mime_type=application/pdf&_fields=id,source_url")
    if isinstance(found, list) and found:
        return found[0]["source_url"]
    path = src
    if src.startswith("http"):
        path = "/tmp/_ej_" + name
        if not download(src, path):
            return ""
    if open(path, "rb").read(5) != b"%PDF-" or os.path.getsize(path) > 25 * 1024 * 1024:
        return ""
    m = wp.req("POST", "/wp/v2/media", raw=open(path, "rb").read(),
               headers={"Content-Type": "application/pdf", "Content-Disposition": f'attachment; filename="{name}"'})
    return m.get("source_url", "")


def _split_anchors(html):
    """Yield (is_protected, chunk): anchors, tags, style/script blocks are protected; text between them is not."""
    pos = 0
    for m in re.finditer(r"<a\b[^>]*>.*?</a>|<(style|script)\b.*?</\1>|<h[1-4]\b[^>]*>.*?</h[1-4]>|<[^>]+>", html, re.S | re.I):
        if m.start() > pos:
            yield False, html[pos:m.start()]
        yield True, m.group(0)
        pos = m.end()
    if pos < len(html):
        yield False, html[pos:]


def link_notifications(html, url, mirror=""):
    if not url:
        return html
    a_attr = f'href="{url}" target="_blank" rel="noopener nofollow"'

    # 1) existing links whose text says notification/notice/advt -> point to the official notification
    def fix_a(m):
        tag, inner = m.group(1), m.group(2)
        text = re.sub(r"<[^>]+>", "", inner)
        if not LINKTXT.search(text) or "employmentjunction.in/wp-content" in tag:
            return m.group(0)
        tag = re.sub(r'href="[^"]*"', f'href="{url}"', tag)
        return tag + inner + "</a>"
    html = re.sub(r"(<a\b[^>]*>)(.*?)</a>", fix_a, html, flags=re.S)

    # 2) table rows like <td>Official Notification ...</td><td><a ...>Click Here</a></td> -> the row's link too
    def fix_row(m):
        row = m.group(0)
        first = re.search(r"<td[^>]*>(.*?)</td>", row, re.S)
        if first and LINKTXT.search(re.sub(r"<[^>]+>", "", first.group(1))) and not re.search(r"apply|website|login", first.group(1), re.I):
            row = re.sub(r'(<a\b[^>]*?)href="[^"]*"', rf'\1href="{url}"', row)
        return row
    html = re.sub(r"<tr>.*?</tr>", fix_row, html, flags=re.S)

    # 3) plain-text mentions -> wrap in a link
    out = []
    for prot, chunk in _split_anchors(html):
        out.append(chunk if prot else PHRASE.sub(lambda m: f"<a {a_attr}>{m.group(0)}</a>", chunk))
    html = "".join(out)

    # 4) Quick Summary button (+ mirror button)
    btn = f'<a class="ejp-btn nt" {a_attr}>📄 Official Notification</a>'
    mbtn = f'<a class="ejp-btn ow" href="{mirror}" target="_blank" rel="noopener">📥 Notification PDF Download</a>' if mirror and mirror != url else ""
    if 'class="ejp-sum"' in html:
        if 'ejp-btn nt' in html.split('class="ejp-sum"', 1)[1].split("</div></div></div>", 1)[0]:
            html = re.sub(r'(<div class="ejp-sum">.*?)<a class="ejp-btn nt"[^>]*>[^<]*</a>', lambda m: m.group(1) + btn, html, count=1, flags=re.S)
        else:
            head, rest = html.split('class="ejp-sum"', 1)
            box, tail = rest.split("</div></div></div>", 1)
            box = box.replace('<a class="ejp-btn wa"', btn + '<a class="ejp-btn wa"', 1) if '<a class="ejp-btn wa"' in box else box.replace("</div>", "</div>", 1) + btn
            html = head + 'class="ejp-sum"' + box + "</div></div></div>" + tail
        if mbtn and "📥 Notification PDF Download" not in html:
            html = html.replace(btn, btn + mbtn, 1)
    return html


if __name__ == "__main__":
    print(link_notifications('<div class="ejp-sum"><div><div class="ejp-bt"><a class="ejp-btn ap" href="x">Apply</a></div></div></div>'
                             '<p>Read the official notification carefully.</p><table><tr><td>Official Notification</td><td><a href="https://b.gov.in">Click Here</a></td></tr></table>',
                             "https://b.gov.in/n.pdf", "https://employmentjunction.in/wp-content/uploads/n.pdf"))
