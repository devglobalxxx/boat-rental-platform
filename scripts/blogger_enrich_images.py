#!/usr/bin/env python3
"""Make Blogger posts/pages visually rich: distribute several relevant boat
images through the body (not just one hero), via Blogger API UPDATE (works even
though inserts are 403-blocked).

For each live post/page it rebuilds the body to: hero image, then the article
with an image inserted every ~2 H2 sections, then related links + FAQ + canonical.
Images come from a large curated high-quality boat/yacht/sea pool (reliable),
varied per-slug so articles don't all look identical.
"""
import importlib.util, json, pathlib, re, sys, time, warnings
warnings.filterwarnings("ignore")

ROOT = pathlib.Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("pb", ROOT / "scripts" / "post_blogger.py")
pb = importlib.util.module_from_spec(spec); spec.loader.exec_module(pb)
pb.load_env()
BID = "4858233363667605156"

# Topic-relevant, verified-loadable boat images come from Openverse (relevance
# filtered to real vessels). Proven-boat Unsplash photos as a backstop.
_si = importlib.util.spec_from_file_location("si", ROOT / "scripts" / "stock_images.py")
si = importlib.util.module_from_spec(_si); _si.loader.exec_module(si)

BACKUP = [  # proven boat/sea Unsplash IDs (HTTP 200, correct subject)
    "1528154291023-a6525fabe5b4", "1567899378494-47b22a2ae96a",
    "1605281317010-fe5ffe798166", "1473116763249-2faaef81ccda",
    "1540946485063-a40da27545f8", "1559599238-308793637427",
]
def _unsplash(pid, w=1200):
    return f"https://images.unsplash.com/photo-{pid}?w={w}&q=80&auto=format&fit=crop"

def img_tag(url, alt):
    return (f'<div style="margin:24px 0"><img src="{url}" alt="{alt}" '
            f'loading="lazy" style="width:100%;height:auto;border-radius:8px" /></div>')


def boat_images(item, n):
    kw = item.get("keyword") or item.get("primary_keyword") or item.get("title") or "yacht charter"
    urls = list(si.open_library_images(kw, n=n + 2))            # topic-relevant boats
    h = sum(ord(c) for c in item["slug"])
    urls += [_unsplash(BACKUP[(h + i) % len(BACKUP)]) for i in range(len(BACKUP))]  # backstop
    out, seen = [], set()
    for u in urls:
        if u not in seen:
            seen.add(u); out.append(u)
        if len(out) >= n:
            break
    return out


def enrich(item, base_html, alt):
    # strip any existing <img>/<div>-wrapped images and the old hero <p><img>
    body = re.sub(r'<p>\s*<img[^>]*>\s*</p>', "", base_html)
    body = re.sub(r'<div[^>]*>\s*<img[^>]*>\s*</div>', "", body)
    urls = boat_images(item, 5)
    hero = img_tag(urls[0], alt)
    inline = [img_tag(u, alt) for u in urls[1:]]
    # insert inline images after evenly-spaced </h2> closes (skip first section)
    marks = [m.end() for m in re.finditer(r"</h2>", body)]
    if len(marks) >= 2:
        usable = marks[1:]
        k = len(inline)
        chosen = sorted({usable[round((j + 1) * len(usable) / (k + 1)) - 1] for j in range(k)}, reverse=True)
        for pos, snip in zip(chosen, inline):
            body = body[:pos] + snip + body[pos:]
    else:
        body += "".join(inline)
    return hero + "\n" + body


def main():
    svc = pb.blogger_service(pb.get_credentials(interactive=False))
    posts_store = json.loads((ROOT / "lib/blog/auto-posts.json").read_text())
    pages_store = json.loads((ROOT / "lib/landing/auto-landing.json").read_text())

    n = 0
    for it in svc.posts().list(blogId=BID, maxResults=100).execute().get("items", []):
        m = [p for p in posts_store if p["title"].strip() == it["title"].strip()]
        if not m:
            continue
        base = pb.render_post_html(m[0], [])
        html = enrich(m[0], base, m[0]["title"])
        try:
            svc.posts().update(blogId=BID, postId=it["id"], body={"title": it["title"], "content": html}).execute()
            n += 1; print("  post:", it["title"][:45]); time.sleep(1)
        except Exception as e:
            print("  x post", it["title"][:25], str(e)[:50])

    for it in svc.pages().list(blogId=BID).execute().get("items", []):
        m = [p for p in pages_store if p["title"].strip() == it["title"].strip()]
        if not m:
            continue
        base = pb.render_page_html(m[0], [])
        html = enrich(m[0], base, m[0]["title"])
        try:
            svc.pages().update(blogId=BID, pageId=it["id"], body={"title": it["title"], "content": html}).execute()
            n += 1; print("  page:", it["title"][:45]); time.sleep(1)
        except Exception as e:
            print("  x page", it["title"][:25], str(e)[:50])
    print(f"enriched {n} item(s) with distributed images")


if __name__ == "__main__":
    main()
