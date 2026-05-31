#!/usr/bin/env python3
"""One-off maintenance:
  1) Quarantine thin landing pages (<MIN_WORDS) out of the live store.
  2) Rebuild internal linking across ALL kept blogs + landings so every quality
     landing page (incl. new ones) is woven into the hub-and-spoke "Related guides"
     cluster, and every page has exactly one homepage link.

Writes:
  lib/landing/auto-landing.json        (kept, relinked)
  lib/landing/quarantine-landing.json  (removed thin pages, recoverable)
  lib/blog/auto-posts.json             (relinked)
"""
from __future__ import annotations
import json, pathlib, re, importlib.util

ROOT = pathlib.Path(__file__).resolve().parents[1]
BLOG = ROOT / "lib" / "blog" / "auto-posts.json"
LAND = ROOT / "lib" / "landing" / "auto-landing.json"
QUAR = ROOT / "lib" / "landing" / "quarantine-landing.json"
MIN_WORDS = 2000

TAG = re.compile(r"<[^>]+>")
def wc(h: str) -> int:
    return len(TAG.sub(" ", h or "").split())

# reuse the generator's relink logic
spec = importlib.util.spec_from_file_location("gc", ROOT / "scripts" / "generate_content.py")
gc = importlib.util.module_from_spec(spec); spec.loader.exec_module(gc)

# Strip a previously-appended "Related guides" block so we can re-add a fresh one.
REL = re.compile(r"\n?<h2>Related guides</h2>\s*<ul>.*?</ul>", re.S)
def strip_related(html: str) -> str:
    return REL.sub("", html or "").rstrip()


def main():
    blogs = json.loads(BLOG.read_text())
    lands = json.loads(LAND.read_text())

    # 1) Quarantine thin landings
    keep, quarantine = [], []
    for p in lands:
        body = (p.get("intro", "") or "") + (p.get("bodyHtml", "") or "")
        (keep if wc(body) >= MIN_WORDS else quarantine).append(p)
    LAND.write_text(json.dumps(keep, ensure_ascii=False, indent=2) + "\n")
    existing_q = json.loads(QUAR.read_text()) if QUAR.exists() else []
    QUAR.write_text(json.dumps(existing_q + quarantine, ensure_ascii=False, indent=2) + "\n")
    print(f"quarantined {len(quarantine)} thin landings; kept {len(keep)}")

    # 2) Rebuild internal links with EVEN DISTRIBUTION so every page receives
    #    inbound links (no orphans). Build one global pool of all pages, then for
    #    page i pick a rotating window of N_REL siblings -> spreads inbound equity.
    N_REL = 5
    pool = ([{"href": f"/blog/{p['slug']}/", "anchor": p["title"]} for p in blogs] +
            [{"href": f"/{p['slug']}/", "anchor": p.get("h1") or p["title"]} for p in keep])
    M = len(pool)

    def related_block(idx: int, self_href: str) -> str:
        picks, k = [], 1
        while len(picks) < N_REL and k <= M:
            cand = pool[(idx * N_REL + k) % M]
            if cand["href"] != self_href and cand not in picks:
                picks.append(cand)
            k += 1
        items = "".join(f'<li><a href="{x["href"]}">{x["anchor"]}</a></li>' for x in picks)
        return f'\n<h2>Related guides</h2>\n<ul>{items}</ul>'

    def ensure_home(html: str) -> str:
        if 'href="/"' in html:
            return html
        if re.search(r"(?<!>)BoatHire24(?!<)", html):
            return re.sub(r"(?<!>)BoatHire24(?!<)", '<a href="/">BoatHire24</a>', html, count=1)
        return '<p>Browse the full fleet at <a href="/">BoatHire24</a>.</p>\n' + html

    for i, p in enumerate(blogs):
        c = ensure_home(strip_related(p["content"]))
        p["content"] = c + related_block(i, f"/blog/{p['slug']}/")
    BLOG.write_text(json.dumps(blogs, ensure_ascii=False, indent=2) + "\n")

    for i, p in enumerate(keep):
        b = ensure_home(strip_related(p.get("bodyHtml", "")))
        p["bodyHtml"] = b + related_block(len(blogs) + i, f"/{p['slug']}/")
    LAND.write_text(json.dumps(keep, ensure_ascii=False, indent=2) + "\n")

    # report
    def homecov(items, body):
        return sum(1 for p in items if 'href="/"' in body(p))
    print(f"relinked: blogs={len(blogs)} (homepage {homecov(blogs, lambda p:p['content'])}/{len(blogs)}), "
          f"landings={len(keep)} (homepage {homecov(keep, lambda p:p['bodyHtml'])}/{len(keep)})")


if __name__ == "__main__":
    main()
