#!/usr/bin/env python3
"""Crosspost BoatHire24 blog articles to Blogger (account: info@boathire24.com).

Reads the generated posts in lib/blog/auto-posts.json and publishes any that
haven't been crossposted yet to the BoatHire24 Blogger blog, each with a
canonical backlink to the live article on boathire24.com/blog/<slug>.

Setup (one-time):
  1. In Google Cloud, create an OAuth *Desktop* client; download client_secrets.json.
  2. Put its path in env BOATHIRE24_GOOGLE_CREDENTIALS (or ~/.boathire24-google.json).
  3. Run:  python3 scripts/post_blogger.py --login        # opens browser, log in as info@boathire24.com
           python3 scripts/post_blogger.py --list-blogs   # find the blog id
  4. Put the id in env BOATHIRE24_BLOGGER_ID.

Fails gracefully (logs + exit 0) if creds/blog id are missing.

Usage:
  python3 scripts/post_blogger.py --limit 40
  python3 scripts/post_blogger.py --list-blogs
  python3 scripts/post_blogger.py --login
"""
from __future__ import annotations
import argparse, datetime, json, os, pathlib, sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
BLOG_STORE = ROOT / "lib" / "blog" / "auto-posts.json"
POSTED_PATH = ROOT / "config" / "blogger_posted.json"
TOKEN_PATH = pathlib.Path.home() / ".boathire24-blogger-token.json"
LOG_DIR = ROOT / "logs"; LOG_DIR.mkdir(exist_ok=True)
LOG_PATH = LOG_DIR / "post_blogger.log"

BASE_URL = "https://boathire24.com"
GOOGLE_SCOPES = ["https://www.googleapis.com/auth/blogger"]


def log(msg: str):
    ts = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{ts}] {msg}"
    print(line, flush=True)
    with LOG_PATH.open("a") as f:
        f.write(line + "\n")


def load_env():
    for p in [ROOT / ".env.local", ROOT / ".env"]:
        if not p.exists():
            continue
        for line in p.read_text().splitlines():
            for k in ("BOATHIRE24_BLOGGER_ID", "BOATHIRE24_GOOGLE_CREDENTIALS"):
                if line.startswith(k + "=") and not os.environ.get(k):
                    os.environ[k] = line.split("=", 1)[1].strip().strip('"').strip("'")


def creds_path() -> pathlib.Path:
    return pathlib.Path(os.environ.get(
        "BOATHIRE24_GOOGLE_CREDENTIALS",
        str(pathlib.Path.home() / ".boathire24-google.json"),
    ))


def get_credentials(interactive: bool):
    from google.oauth2.credentials import Credentials
    from google.auth.transport.requests import Request
    cp = creds_path()
    creds = None
    if TOKEN_PATH.exists():
        creds = Credentials.from_authorized_user_file(str(TOKEN_PATH), GOOGLE_SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        elif interactive:
            from google_auth_oauthlib.flow import InstalledAppFlow
            if not cp.exists():
                sys.exit(f"ERROR: client secrets not found at {cp}")
            flow = InstalledAppFlow.from_client_secrets_file(str(cp), GOOGLE_SCOPES)
            creds = flow.run_local_server(port=0)
        else:
            return None
        TOKEN_PATH.write_text(creds.to_json())
    return creds


def blogger_service(creds):
    from googleapiclient.discovery import build
    return build("blogger", "v3", credentials=creds, cache_discovery=False)


def render_html(post: dict) -> str:
    url = f"{BASE_URL}/blog/{post['slug']}"
    parts = [post.get("content", "")]
    faqs = post.get("faqs") or []
    if faqs:
        parts.append("<h2>Common questions</h2>")
        for f in faqs:
            parts.append(f"<h3>{f.get('q','')}</h3><p>{f.get('a','')}</p>")
    parts.append(
        f'<p><em>Originally published on '
        f'<a href="{url}" rel="canonical">BoatHire24</a>. '
        f'Browse boats and book at <a href="{BASE_URL}/search">boathire24.com</a>.</em></p>'
    )
    return "\n".join(parts)


def load_posted() -> set:
    try:
        return set(json.loads(POSTED_PATH.read_text()))
    except Exception:
        return set()


def save_posted(s: set):
    POSTED_PATH.write_text(json.dumps(sorted(s), indent=2) + "\n")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--login", action="store_true", help="run interactive OAuth login")
    ap.add_argument("--list-blogs", action="store_true")
    ap.add_argument("--limit", type=int, default=40)
    args = ap.parse_args()
    load_env()

    if args.login:
        get_credentials(interactive=True)
        log("login OK — token saved")
        return 0

    creds = get_credentials(interactive=False)
    if not creds:
        log(f"Blogger: no credentials (run --login). Skipped.")
        return 0
    svc = blogger_service(creds)

    if args.list_blogs:
        blogs = svc.blogs().listByUser(userId="self").execute().get("items", [])
        for b in blogs:
            log(f"  {b['id']}  {b.get('name')}  {b.get('url')}")
        return 0

    blog_id = os.environ.get("BOATHIRE24_BLOGGER_ID", "").strip()
    if not blog_id:
        log("Blogger: BOATHIRE24_BLOGGER_ID not set (run --list-blogs). Skipped.")
        return 0

    posts = json.loads(BLOG_STORE.read_text()) if BLOG_STORE.exists() else []
    posted = load_posted()
    todo = [p for p in posts if p.get("slug") and p["slug"] not in posted][-args.limit:]
    if not todo:
        log("Blogger: nothing new to crosspost.")
        return 0

    log(f"Blogger: crossposting {len(todo)} article(s) to blog {blog_id}")
    ok = 0
    for p in todo:
        try:
            body = {"kind": "blogger#post", "title": p["title"], "content": render_html(p)}
            res = svc.posts().insert(blogId=blog_id, body=body, isDraft=False).execute()
            posted.add(p["slug"])
            ok += 1
            log(f"  ✓ {res.get('url')}")
        except Exception as e:
            log(f"  ✗ {p['slug']}: {type(e).__name__}: {str(e)[:160]}")
    save_posted(posted)
    log(f"Blogger: {ok}/{len(todo)} posted")
    return 0


if __name__ == "__main__":
    sys.exit(main())
