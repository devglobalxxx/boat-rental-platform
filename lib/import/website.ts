// Website listing importer: crawl a yacht-company website, find the boat pages,
// and extract structured listings (specs, prices, photos) with DeepSeek.
// Used by /api/host/import-website/* — server-side only.
import { aiJson } from '@/lib/ai/deepseek'

const UA = 'Mozilla/5.0 (compatible; BoatHire24Importer/1.0; +https://boathire24.com)'

// Hosts paste arbitrary URLs — never let the importer reach internal services.
export function assertPublicUrl(raw: string): URL {
  let u: URL
  try {
    u = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`)
  } catch {
    throw new Error('Enter a valid website address')
  }
  if (!/^https?:$/.test(u.protocol)) throw new Error('URL must start with http(s)')
  if (u.port && u.port !== '80' && u.port !== '443') throw new Error('That URL is not allowed')
  const h = u.hostname.toLowerCase()
  const privateIp = /^\d+\.\d+\.\d+\.\d+$/.test(h) && (
    h.startsWith('127.') || h.startsWith('10.') || h.startsWith('192.168.') ||
    h.startsWith('169.254.') || h.startsWith('0.') || /^172\.(1[6-9]|2\d|3[01])\./.test(h)
  )
  if (h === 'localhost' || privateIp || h.endsWith('.local') || h.endsWith('.internal') || !h.includes('.')) {
    throw new Error('That URL is not allowed')
  }
  return u
}

export async function fetchHtml(url: string, timeoutMs = 15000): Promise<string> {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'text/html,application/xhtml+xml,*/*' },
    redirect: 'follow',
    signal: AbortSignal.timeout(timeoutMs),
  })
  if (!res.ok) throw new Error(`The page returned HTTP ${res.status}`)
  const ct = res.headers.get('content-type') ?? ''
  if (ct && !/html|xml|text/.test(ct)) throw new Error('That URL is not a web page')
  return (await res.text()).slice(0, 1_500_000)
}

const decodeEntities = (s: string) =>
  s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&apos;/g, "'")
   .replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
   .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))

export function htmlToText(html: string, cap = 12000): string {
  return decodeEntities(
    html
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<(script|style|noscript|svg|iframe|head)[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<\/(p|div|li|tr|h[1-6]|section|article)>/gi, '\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
  )
    .replace(/[ \t]+/g, ' ')
    .replace(/\n[ \t]*/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, cap)
}

const SKIP_EXT = /\.(jpe?g|png|webp|gif|svg|pdf|zip|docx?|xlsx?|mp4|mov|avif|ico|css|js)(\?|$)/i

export function extractLinks(html: string, baseUrl: string): { url: string; text: string }[] {
  const base = new URL(baseUrl)
  const out = new Map<string, string>()
  const re = /<a\b[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(html)) && out.size < 400) {
    const href = m[1].trim()
    if (/^(mailto:|tel:|javascript:|whatsapp:|sms:)/i.test(href)) continue
    let abs: URL
    try { abs = new URL(href, base) } catch { continue }
    // Same site only (treat www. and bare domain as the same site).
    const same = abs.hostname.replace(/^www\./, '') === base.hostname.replace(/^www\./, '')
    if (!same || SKIP_EXT.test(abs.pathname)) continue
    abs.hash = ''
    const key = abs.toString()
    const text = decodeEntities(m[2].replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim().slice(0, 80)
    if (!out.has(key) || (text && !out.get(key))) out.set(key, text)
  }
  return [...out.entries()].map(([url, text]) => ({ url, text }))
}

const BOAT_HINT = /fleet|boat|yacht|charter|catamaran|sail|gulet|rib\b|jet|vessel|rental|rent\b|barco|barca|bateau|velero|flotta|flota|vloot|alquiler|noleggio|locazione|nuestra|nos-bateaux/i
const CATALOG_HINT = /\/(fleet|boats|yachts|our-fleet|our-boats|charters?|flota|flotta|barcos|bateaux|vloot|rentals?|listings?)\/?$/i

// Crawl the site (home + sitemap + obvious catalog pages, 1 level deep) and
// return candidate boat-page links for the LLM to classify.
export async function discoverCandidates(siteUrl: string): Promise<{ url: string; text: string }[]> {
  const start = assertPublicUrl(siteUrl)
  const seen = new Map<string, string>()
  const add = (l: { url: string; text: string }) => {
    if (!seen.has(l.url) || (l.text && !seen.get(l.url))) seen.set(l.url, l.text)
  }

  const startHtml = await fetchHtml(start.toString())
  const startLinks = extractLinks(startHtml, start.toString())
  startLinks.forEach(add)

  // sitemap.xml often lists every boat page directly.
  try {
    const xml = await fetchHtml(new URL('/sitemap.xml', start).toString(), 10000)
    const locs = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((x) => x[1]).slice(0, 300)
    for (const u of locs) {
      try {
        const abs = new URL(u)
        if (abs.hostname.replace(/^www\./, '') === start.hostname.replace(/^www\./, '') && !SKIP_EXT.test(abs.pathname)) {
          add({ url: abs.toString(), text: '' })
        }
      } catch { /* skip bad sitemap entries */ }
    }
  } catch { /* no sitemap — fine */ }

  // Follow up to 5 catalog-looking pages one level deep (fleet/boats/charter indexes).
  const catalogs = [...seen.keys()]
    .filter((u) => CATALOG_HINT.test(new URL(u).pathname) || /fleet|flota|flotta|vloot|our.boats/i.test(seen.get(u) ?? ''))
    .slice(0, 5)
  for (const c of catalogs) {
    try {
      const html = await fetchHtml(c, 10000)
      extractLinks(html, c).forEach(add)
    } catch { /* unreachable catalog page — skip */ }
  }

  const startKey = start.toString().replace(/\/$/, '')
  return [...seen.entries()]
    .map(([url, text]) => ({ url, text }))
    .filter((l) => l.url.replace(/\/$/, '') !== startKey)
    .filter((l) => BOAT_HINT.test(l.url) || BOAT_HINT.test(l.text))
    .slice(0, 80)
}

// LLM pass: which of the candidate links are INDIVIDUAL boat detail pages?
export async function classifyBoatPages(siteUrl: string, candidates: { url: string; text: string }[]): Promise<string[]> {
  if (candidates.length === 0) return []
  try {
    const out = await aiJson<{ boat_pages?: string[] }>(
      `You are looking at links found on a boat/yacht charter company website (${siteUrl}).
Pick the URLs that are INDIVIDUAL boat or yacht detail pages (one specific vessel each) — the pages
a customer would open to see one boat's photos, specs and price.
EXCLUDE: home, contact, about, blog/news, destination guides, booking/checkout, terms, generic
category or fleet-overview pages, and anything that is clearly not one specific vessel.
Return JSON: {"boat_pages": [url, ...]} using the exact URLs given, max 30.`,
      candidates.map((c) => `${c.url}${c.text ? ` — "${c.text}"` : ''}`).join('\n'),
      { maxTokens: 2000 }
    )
    const allowed = new Set(candidates.map((c) => c.url))
    const picked = (out.boat_pages ?? []).filter((u) => allowed.has(u))
    if (picked.length > 0) return picked.slice(0, 30)
  } catch { /* fall through to heuristic */ }
  // Heuristic fallback: deepest boat-hinting paths first.
  return candidates
    .filter((c) => BOAT_HINT.test(c.url))
    .sort((a, b) => b.url.split('/').length - a.url.split('/').length)
    .slice(0, 20)
    .map((c) => c.url)
}

const IMG_JUNK = /logo|icon|favicon|sprite|placeholder|avatar|flag|payment|badge|whatsapp|tripadvisor|instagram|facebook|loading|spinner|arrow|btn|button|banner-?ad/i

export function extractImages(html: string, baseUrl: string): string[] {
  const base = new URL(baseUrl)
  const found: string[] = []
  const push = (raw: string | undefined) => {
    if (!raw) return
    let abs: URL
    try { abs = new URL(decodeEntities(raw.trim()), base) } catch { return }
    if (!/^https?:$/.test(abs.protocol)) return
    const s = abs.toString()
    if (!/\.(jpe?g|png|webp)(\?|$)/i.test(abs.pathname) && !/\/(image|img|photo|media|upload)s?\//i.test(abs.pathname)) return
    if (IMG_JUNK.test(s)) return
    if (!found.includes(s)) found.push(s)
  }

  // og:image first — it is almost always the hero shot.
  for (const m of html.matchAll(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/gi)) push(m[1])
  for (const m of html.matchAll(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/gi)) push(m[1])

  for (const tagMatch of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = tagMatch[0]
    const attr = (name: string) => tag.match(new RegExp(`${name}=["']([^"']+)["']`, 'i'))?.[1]
    // Skip obviously tiny images (icons, separators).
    const w = Number(attr('width')), h = Number(attr('height'))
    if ((w && w < 300) || (h && h < 200)) continue
    const srcset = attr('srcset') ?? attr('data-srcset')
    if (srcset) {
      // Take the largest srcset entry.
      const parts = srcset.split(',').map((p) => p.trim().split(/\s+/))
      const biggest = parts.sort((a, b) => (parseInt(b[1] ?? '0') || 0) - (parseInt(a[1] ?? '0') || 0))[0]
      push(biggest?.[0])
    }
    push(attr('data-src') ?? attr('data-lazy-src') ?? attr('data-original') ?? attr('src'))
    if (found.length >= 16) break
  }
  return found.slice(0, 16)
}

// ── LLM extraction of one page into platform-shaped boats ──────────────────

export interface ExtractedBoat {
  name: string
  tagline: string
  description: string
  type: string
  length_m: number | null
  capacity_pax: number
  cabins: number | null
  builder: string | null
  model_year: number | null
  departure_port: string | null
  currency: string
  pricing: { duration_hours: number; price: number }[]
  features: string[]
  images: string[]
  sourceUrl: string
}

const BOAT_TYPES = ['motor_yacht', 'catamaran', 'sailing', 'speedboat', 'fishing', 'rib', 'luxury', 'jet_ski', 'jet_car', 'gulet']
export function mapBoatType(raw: unknown): string {
  const t = String(raw ?? '').toLowerCase().replace(/[\s-]+/g, '_')
  if (BOAT_TYPES.includes(t)) return t
  if (/(motor|fly|power).*yacht|^yacht$|motorboat|cruiser/.test(t)) return 'motor_yacht'
  if (/catamaran/.test(t)) return 'catamaran'
  if (/sail|velero/.test(t)) return 'sailing'
  if (/speed|sport|bowrider|day_?boat/.test(t)) return 'speedboat'
  if (/fish/.test(t)) return 'fishing'
  if (/rib|inflatable|zodiac/.test(t)) return 'rib'
  if (/luxury|super_?yacht|mega/.test(t)) return 'luxury'
  if (/jet_?ski|wave/.test(t)) return 'jet_ski'
  if (/gulet/.test(t)) return 'gulet'
  return 'motor_yacht'
}

const EXTRACT_SYSTEM = `You extract boat/yacht charter listings from the text of a web page.
Return JSON: {"boats":[{"name":string,"type":string,"length_m":number|null,"capacity_pax":number,
"cabins":number|null,"builder":string|null,"model_year":number|null,"departure_port":string|null,
"currency":string,"prices":[{"duration_hours":number,"price":number}],"features":[string],
"tagline":string,"description":string}]}

Rules:
- Only vessels actually offered for charter/rental ON THIS PAGE. Ignore "similar boats" teasers,
  destination text and company history. If the page is not about a rentable boat, return {"boats":[]}.
- Usually a detail page describes exactly ONE boat. Never return more than 3.
- type: one of motor_yacht, catamaran, sailing, speedboat, fishing, rib, luxury, jet_ski, gulet.
- length_m in metres (convert feet: ft × 0.3048, one decimal).
- capacity_pax: max guests as a number (default 8 if truly absent).
- prices: convert what the page states. Per-hour price → {"duration_hours":1,"price":hourly}.
  Half day → duration_hours 4. Full day / per day → duration_hours 8 for day charters of
  motorboats, 24 only if it is explicitly a multi-day/overnight rate. Per week → duration_hours 168.
  Numbers only, no thousands separators. If no price is shown, return an empty array.
- currency: 3-letter code (EUR if symbol € or unclear in Europe).
- features: up to 15 short amenity names exactly as the page implies (e.g. "Bluetooth sound system").
- tagline: one line, max 90 chars, no exclamation marks.
- description: 100-200 words in warm, conversational British English, second person, ONLY facts
  from the page, no em-dashes, no exclamation marks, no invented details.`

export async function extractBoatsFromPage(url: string, html: string): Promise<ExtractedBoat[]> {
  const text = htmlToText(html)
  if (text.length < 200) return []
  const images = extractImages(html, url)
  const out = await aiJson<{ boats?: any[] }>(EXTRACT_SYSTEM, `URL: ${url}\n\nPAGE TEXT:\n${text}`, { maxTokens: 2800 })
  const boats = Array.isArray(out.boats) ? out.boats.slice(0, 3) : []

  return boats
    .map((b): ExtractedBoat | null => {
      const name = String(b?.name ?? '').trim().slice(0, 120)
      if (!name) return null
      const num = (v: unknown) => { const n = Number(v); return Number.isFinite(n) && n > 0 ? n : null }
      let pricing = (Array.isArray(b.prices) ? b.prices : [])
        .map((p: any) => ({ duration_hours: Math.round(num(p?.duration_hours) ?? 0), price: Math.round(num(p?.price) ?? 0) }))
        .filter((p: any) => p.duration_hours >= 1 && p.duration_hours <= 720 && p.price > 0 && p.price < 1_000_000)
      // A bare hourly rate becomes the standard 2/4/8h tiers.
      const hourly = pricing.find((p: { duration_hours: number }) => p.duration_hours === 1)
      if (hourly) {
        pricing = [
          ...[2, 4, 8].map((h) => ({ duration_hours: h, price: hourly.price * h })),
          ...pricing.filter((p: { duration_hours: number }) => p.duration_hours > 8),
        ]
      }
      const seen = new Set<number>()
      pricing = pricing.filter((p: { duration_hours: number }) => !seen.has(p.duration_hours) && seen.add(p.duration_hours))

      return {
        name,
        tagline: String(b?.tagline ?? '').trim().slice(0, 200),
        description: String(b?.description ?? '').trim().slice(0, 5000),
        type: mapBoatType(b?.type),
        length_m: num(b?.length_m),
        capacity_pax: Math.min(200, Math.max(1, Math.round(num(b?.capacity_pax) ?? 8))),
        cabins: num(b?.cabins) ? Math.round(num(b?.cabins)!) : null,
        builder: String(b?.builder ?? '').trim().slice(0, 80) || null,
        model_year: (() => { const y = Math.round(num(b?.model_year) ?? 0); return y >= 1950 && y <= 2030 ? y : null })(),
        departure_port: String(b?.departure_port ?? '').trim().slice(0, 120) || null,
        currency: /^[A-Z]{3}$/.test(String(b?.currency ?? '').toUpperCase()) ? String(b.currency).toUpperCase() : 'EUR',
        pricing: pricing.slice(0, 6),
        features: (Array.isArray(b?.features) ? b.features : []).map((f: any) => String(f).trim().slice(0, 60)).filter(Boolean).slice(0, 15),
        images,
        sourceUrl: url,
      }
    })
    .filter((b): b is ExtractedBoat => b !== null)
}

export function slugify(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60)
}
