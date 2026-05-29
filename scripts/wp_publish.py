#!/usr/bin/env python3
"""Publish BoatHire24 content to a WordPress site via the REST API.

Blog articles  -> WordPress posts  (/wp-json/wp/v2/posts)
Landing pages  -> WordPress pages  (/wp-json/wp/v2/pages)

WordPress has no per-day write block like Blogger, so this can absorb the full
40 + 40/day. Reuses the same HTML rendering (hero + inline images, internal
links absolutized to boathire24.com) as the Blogger publisher.

Setup (one-time), in .env.local:
  WP_URL=https://your-wordpress-site.com         # self-hosted WP (REST enabled)
  WP_USER=your_wp_username
  WP_APP_PASSWORD=xxxx xxxx xxxx xxxx xxxx xxxx   # Users -> Profile -> Application Passwords

Usage:
  python3 scripts/wp_publish.py --limit 40
  python3 scripts/wp_publish.py --check        # verify connection only
"""
from __future__ import annotations
import argparse, base64, datetime, importlib.util, json, os, pathlib, sys, time, urllib.request, urllib.error

ROOT = pathlib.Path(__file__).resolve().parents[1]
BLOG_STORE = ROOT / "lib" / "blog" / "auto-posts.json"
LANDING_STORE = ROOT / "lib" / "landing" / "auto-landing.json"
POSTED_PATH = ROOT / "config" / "wp_posted.json"
LOG_DIR = ROOT / "logs"; LOG_DIR.mkdir(exist_ok=True)
LOG_PATH = LOG_DIR / "wp_publish.log"

# Reuse the Blogger publisher's renderers (images + internal-link absolutization).
_spec = importlib.util.spec_from_file_location("pb", ROOT / "scripts" / "post_blogger.py")
pb = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(pb)


def log(msg: str):
    ts = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{ts}] {msg}"
    print(line, flush=True)
    with LOG_PATH.open("a") as f:
        f.write(line + "\n")


def load_env():
    for p in (ROOT / ".env.local", ROOT / ".env"):
        if not p.exists():
            continue
        for line in p.read_text().splitlines():
            for k in ("WP_URL", "WP_USER", "WP_APP_PASSWORD"):
                if line.startswith(k + "=") and not os.environ.get(k):
                    os.environ[k] = line.split("=", 1)[1].strip().strip('"').strip("'")


def auth_header() -> str:
    user = os.environ.get("WP_USER", "")
    pw = os.environ.get("WP_APP_PASSWORD", "").replace(" ", "")
    token = base64.b64encode(f"{user}:{pw}".encode()).decode()
    return f"Basic {token}"


def wp_post(endpoint: str, payload: dict) -> tuple[int, dict]:
    base = os.environ["WP_URL"].rstrip("/")
    req = urllib.request.Request(
        f"{base}/wp-json/wp/v2/{endpoint}",
        data=json.dumps(payload).encode(),
        headers={"Authorization": auth_header(), "Content-Type": "application/json",
                 "User-Agent": "boathire24-bot"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return r.status, json.loads(r.read())
    except urllib.error.HTTPError as e:
        return e.code, {"error": e.read().decode(errors="replace")[:200]}


def load_posted() -> set:
    try:
        return set(json.loads(POSTED_PATH.read_text()))
    except Exception:
        return set()


def save_posted(s: set):
    POSTED_PATH.write_text(json.dumps(sorted(s), indent=2) + "\n")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=40)
    ap.add_argument("--check", action="store_true", help="verify connection only")
    args = ap.parse_args()
    load_env()

    if not os.environ.get("WP_URL") or not os.environ.get("WP_USER") or not os.environ.get("WP_APP_PASSWORD"):
        log("WP: WP_URL / WP_USER / WP_APP_PASSWORD not set in .env.local — skipped.")
        return 0

    if args.check:
        base = os.environ["WP_URL"].rstrip("/")
        req = urllib.request.Request(f"{base}/wp-json/wp/v2/posts?per_page=1",
                                     headers={"Authorization": auth_header()})
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                log(f"WP: connection OK ({r.status}) to {base}")
        except Exception as e:
            log(f"WP: connection FAILED: {str(e)[:160]}")
        return 0

    posts = json.loads(BLOG_STORE.read_text()) if BLOG_STORE.exists() else []
    pages = json.loads(LANDING_STORE.read_text()) if LANDING_STORE.exists() else []
    posted = load_posted()

    def pending(items, prefix):
        return [it for it in items if it.get("slug") and f"{prefix}:{it['slug']}" not in posted][:args.limit]

    todo_posts = pending(posts, "post")
    todo_pages = pending(pages, "page")
    if not todo_posts and not todo_pages:
        log("WP: nothing new to publish.")
        return 0

    log(f"WP: publishing {len(todo_posts)} post(s) + {len(todo_pages)} page(s) to {os.environ['WP_URL']}")
    ok = 0
    for p in todo_posts:
        payload = {"title": p["title"], "content": pb.render_post_html(p, []),
                   "status": "publish", "slug": p["slug"],
                   "excerpt": p.get("metaDescription") or p.get("excerpt", "")}
        code, res = wp_post("posts", payload)
        if 200 <= code < 300:
            posted.add(f"post:{p['slug']}"); save_posted(posted); ok += 1
            log(f"  ✓ post {res.get('link')}")
        else:
            log(f"  ✗ post {p['slug']}: {code} {res.get('error','')[:120]}")
        time.sleep(1)
    for p in todo_pages:
        payload = {"title": p["title"], "content": pb.render_page_html(p, []),
                   "status": "publish", "slug": p["slug"],
                   "excerpt": p.get("metaDescription", "")}
        code, res = wp_post("pages", payload)
        if 200 <= code < 300:
            posted.add(f"page:{p['slug']}"); save_posted(posted); ok += 1
            log(f"  ✓ page {res.get('link')}")
        else:
            log(f"  ✗ page {p['slug']}: {code} {res.get('error','')[:120]}")
        time.sleep(1)
    save_posted(posted)
    log(f"WP: {ok}/{len(todo_posts) + len(todo_pages)} published")
    return 0


if __name__ == "__main__":
    sys.exit(main())
