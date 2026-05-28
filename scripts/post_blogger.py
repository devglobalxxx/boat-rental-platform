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
import argparse, datetime, hashlib, json, os, pathlib, sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
BLOG_STORE = ROOT / "lib" / "blog" / "auto-posts.json"
LANDING_STORE = ROOT / "lib" / "landing" / "auto-landing.json"
POSTED_PATH = ROOT / "config" / "blogger_posted.json"
TOKEN_PATH = pathlib.Path.home() / ".boathire24-blogger-token.json"
LOG_DIR = ROOT / "logs"; LOG_DIR.mkdir(exist_ok=True)
LOG_PATH = LOG_DIR / "post_blogger.log"

BASE_URL = "https://boathire24.com"
GOOGLE_SCOPES = [
    "https://www.googleapis.com/auth/blogger",
    "https://www.googleapis.com/auth/drive.readonly",
]


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
            for k in ("BOATHIRE24_BLOGGER_ID", "BOATHIRE24_GOOGLE_CREDENTIALS", "BOATHIRE24_DRIVE_FOLDER_ID"):
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


def drive_service(creds):
    from googleapiclient.discovery import build
    return build("drive", "v3", credentials=creds, cache_discovery=False)


def list_drive_media(drive, folder_id: str) -> list:
    """All image/video files in the shared media-pool folder. Files must be shared
    'anyone with the link' so they render on the public blog."""
    files, page = [], None
    q = (f"'{folder_id}' in parents and trashed=false and "
         f"(mimeType contains 'image/' or mimeType contains 'video/')")
    while True:
        resp = drive.files().list(
            q=q, fields="nextPageToken, files(id,name,mimeType)",
            pageSize=200, pageToken=page,
            includeItemsFromAllDrives=True, supportsAllDrives=True,
        ).execute()
        files.extend(resp.get("files", []))
        page = resp.get("nextPageToken")
        if not page:
            break
    return files


def media_for(slug: str, media: list, n_images: int = 3) -> tuple[str, str]:
    """Deterministic per-slug selection: returns (hero_html, inline_html)."""
    if not media:
        return "", ""
    imgs = [m for m in media if m["mimeType"].startswith("image/")]
    vids = [m for m in media if m["mimeType"].startswith("video/")]
    h = int(hashlib.md5(slug.encode()).hexdigest(), 16)
    hero, inline = "", ""
    if imgs:
        sel = [imgs[(h + i) % len(imgs)] for i in range(min(n_images, len(imgs)))]
        hero = (f'<p><img src="https://lh3.googleusercontent.com/d/{sel[0]["id"]}=w1200" '
                f'alt="{slug}" style="max-width:100%;height:auto" /></p>')
        for m in sel[1:]:
            inline += (f'<p><img src="https://lh3.googleusercontent.com/d/{m["id"]}=w1000" '
                       f'alt="{slug}" style="max-width:100%;height:auto" /></p>')
    if vids:
        v = vids[h % len(vids)]
        inline += (f'<p><iframe src="https://drive.google.com/file/d/{v["id"]}/preview" '
                   f'width="640" height="360" allow="autoplay" style="max-width:100%"></iframe></p>')
    return hero, inline


def fallback_hero(item: dict) -> str:
    """Use the page's own heroImage (set by the generator) when no Drive media exists."""
    url = item.get("heroImage")
    if not url:
        return ""
    return (f'<p><img src="{url}" alt="{item.get("title", item.get("slug", ""))}" '
            f'style="max-width:100%;height:auto" /></p>')


def render_post_html(post: dict, media: list) -> str:
    hero, inline = media_for(post["slug"], media)
    if not hero:
        hero = fallback_hero(post)
    return _render(post.get("content", ""), post.get("faqs"),
                   f"{BASE_URL}/blog/{post['slug']}", hero, inline)


def render_page_html(page: dict, media: list) -> str:
    body = (page.get("intro", "") or "") + "\n" + (page.get("bodyHtml", "") or "")
    hero, inline = media_for(page["slug"], media)
    if not hero:
        hero = fallback_hero(page)
    return _render(body, page.get("faqs"), f"{BASE_URL}/{page['slug']}", hero, inline)


def _render(body: str, faqs, canonical: str, hero: str = "", inline: str = "") -> str:
    # Insert inline media after the first </h2> section break; fall back to appending.
    if inline and "</h2>" in body:
        i = body.index("</h2>") + len("</h2>")
        body = body[:i] + inline + body[i:]
    elif inline:
        body = body + inline
    parts = [hero, body] if hero else [body]
    for f in (faqs or []):
        if parts[-1] != "<h2>Common questions</h2>":
            parts.append("<h2>Common questions</h2>")
        parts.append(f"<h3>{f.get('q','')}</h3><p>{f.get('a','')}</p>")
    parts.append(
        f'<p><em>Originally published on '
        f'<a href="{canonical}" rel="canonical">BoatHire24</a>. '
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
    ap.add_argument("--list-folders", action="store_true", help="list Drive folders to find the media pool")
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

    if args.list_folders:
        drive = drive_service(creds)
        resp = drive.files().list(
            q="mimeType='application/vnd.google-apps.folder' and trashed=false",
            fields="files(id,name)", pageSize=200,
            includeItemsFromAllDrives=True, supportsAllDrives=True,
        ).execute()
        for f in resp.get("files", []):
            log(f"  {f['id']}  {f['name']}")
        return 0

    blog_id = os.environ.get("BOATHIRE24_BLOGGER_ID", "").strip()
    if not blog_id:
        log("Blogger: BOATHIRE24_BLOGGER_ID not set (run --list-blogs). Skipped.")
        return 0

    # ── Drive media pool (optional) ──
    media = []
    folder_id = os.environ.get("BOATHIRE24_DRIVE_FOLDER_ID", "").strip()
    if folder_id:
        try:
            media = list_drive_media(drive_service(creds), folder_id)
            log(f"Drive: {len(media)} media file(s) in pool {folder_id}")
        except Exception as e:
            log(f"Drive: media listing failed ({type(e).__name__}: {str(e)[:120]}). Posting without media.")

    posts = json.loads(BLOG_STORE.read_text()) if BLOG_STORE.exists() else []
    pages = json.loads(LANDING_STORE.read_text()) if LANDING_STORE.exists() else []
    posted = load_posted()

    def pending(items, prefix):
        return [it for it in items if it.get("slug") and f"{prefix}:{it['slug']}" not in posted][-args.limit:]

    todo_posts = pending(posts, "post")
    todo_pages = pending(pages, "page")
    if not todo_posts and not todo_pages:
        log("Blogger: nothing new to publish.")
        return 0

    log(f"Blogger: publishing {len(todo_posts)} post(s) + {len(todo_pages)} page(s) to blog {blog_id}")
    ok = 0
    # ── Blogger posts (from blog articles) ──
    for p in todo_posts:
        try:
            body = {"kind": "blogger#post", "title": p["title"], "content": render_post_html(p, media)}
            res = svc.posts().insert(blogId=blog_id, body=body, isDraft=False).execute()
            posted.add(f"post:{p['slug']}")
            ok += 1
            log(f"  ✓ post {res.get('url')}")
        except Exception as e:
            log(f"  ✗ post {p['slug']}: {type(e).__name__}: {str(e)[:160]}")
    # ── Blogger pages (from keyword landing pages) ──
    for p in todo_pages:
        try:
            body = {"kind": "blogger#page", "title": p["title"], "content": render_page_html(p, media)}
            res = svc.pages().insert(blogId=blog_id, body=body, isDraft=False).execute()
            posted.add(f"page:{p['slug']}")
            ok += 1
            log(f"  ✓ page {res.get('url')}")
        except Exception as e:
            log(f"  ✗ page {p['slug']}: {type(e).__name__}: {str(e)[:160]}")
    save_posted(posted)
    log(f"Blogger: {ok}/{len(todo_posts) + len(todo_pages)} published")
    return 0


if __name__ == "__main__":
    sys.exit(main())
