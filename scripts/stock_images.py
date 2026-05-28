#!/usr/bin/env python3
"""Open-license stock images via the Openverse API (Creative-Commons aggregator,
no API key needed). Used to give Blogger posts/pages varied, relevant, commercially
usable imagery and to blend with the Google Drive media pool.

Returns Openverse CDN thumbnail URLs (reliably hotlinkable on a public blog).
Results are cached per query in config/stock_cache.json.
"""
from __future__ import annotations
import json, pathlib, urllib.parse, urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
CACHE_PATH = ROOT / "config" / "stock_cache.json"

# Fallback pool if the API is unreachable (curated boat/yacht Unsplash images).
FALLBACK = [
    "https://images.unsplash.com/photo-1528154291023-a6525fabe5b4?w=1400&q=80",
    "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1400&q=80",
    "https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=1400&q=80",
    "https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=1400&q=80",
    "https://images.unsplash.com/photo-1559599238-308793637427?w=1400&q=80",
    "https://images.unsplash.com/photo-1505570554449-25c7d4e0b8e6?w=1400&q=80",
    "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=1400&q=80",
]


def _load() -> dict:
    try:
        return json.loads(CACHE_PATH.read_text())
    except Exception:
        return {}


def _save(d: dict):
    try:
        CACHE_PATH.write_text(json.dumps(d, ensure_ascii=False, indent=2))
    except Exception:
        pass


# Only keep open-library images whose title/tags actually relate to boating —
# Openverse "boat" queries otherwise return graffiti, gym photos, etc.
RELEVANT = {
    "boat", "boats", "yacht", "yachts", "sail", "sailing", "sailboat", "catamaran",
    "marina", "harbour", "harbor", "port", "sea", "ocean", "coast", "coastal",
    "beach", "water", "ship", "vessel", "cruise", "nautical", "marine", "dock",
    "speedboat", "motorboat", "dinghy", "regatta", "anchor", "deck", "bay",
}


def _is_relevant(item: dict) -> bool:
    text = (item.get("title") or "").lower()
    tags = " ".join(t.get("name", "") for t in (item.get("tags") or [])).lower()
    blob = f"{text} {tags}"
    return any(w in blob for w in RELEVANT)


def _fetch(query: str, n: int) -> list[str]:
    params = urllib.parse.urlencode({
        "q": query,
        "license_type": "commercial",
        "page_size": 20,          # over-fetch, then keep only relevant
        "mature": "false",
    })
    req = urllib.request.Request(
        f"https://api.openverse.org/v1/images/?{params}",
        headers={"User-Agent": "boathire24-content-bot"},
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            data = json.loads(r.read())
    except Exception:
        return []
    urls = []
    for it in data.get("results", []):
        if not _is_relevant(it):
            continue
        u = it.get("thumbnail") or it.get("url")
        if u:
            urls.append(u)
    return urls[:n]


def open_library_images(query: str, n: int = 6) -> list[str]:
    """Up to n commercially-usable image URLs for the query (cached). Tries the
    full keyword, then progressively broader queries so narrow phrases still match."""
    key = (query or "").lower().strip() or "yacht charter marbella"
    cache = _load()
    if key in cache and cache[key]:
        return cache[key][:n]
    words = key.split()
    candidates = [key]
    if len(words) > 2:
        candidates.append(" ".join(words[:2]))   # e.g. "yacht charter"
    candidates += ["yacht boat marbella", "yacht boat sea", "boat"]
    urls: list[str] = []
    for q in candidates:
        urls = _fetch(q, n)
        if urls:
            break
    if not urls:
        return FALLBACK[:n]
    cache[key] = urls
    _save(cache)
    return urls[:n]
