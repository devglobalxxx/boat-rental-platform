'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { COUNTRIES } from '@/lib/listing-options'

// Derive ISO-3166 alpha-2 from a flag emoji (two regional-indicator letters).
function iso2FromFlag(flag: string): string {
  const cps = [...flag].map((c) => c.codePointAt(0) ?? 0)
  if (cps.length === 2 && cps[0] >= 0x1f1e6 && cps[0] <= 0x1f1ff) {
    return String.fromCharCode(cps[0] - 0x1f1e6 + 65) + String.fromCharCode(cps[1] - 0x1f1e6 + 65)
  }
  return 'XX'
}
import { Globe, Sparkles, Check, ArrowLeft, Ship, ImageIcon, Loader2, Link2, FileText, Package, UploadCloud } from 'lucide-react'

/* ── tokens (match the rest of /host) ── */
const card = '#0c1828'
const border = 'rgba(116,207,232,0.18)'
const gold = '#74cfe8'
const goldFaint = 'rgba(116,207,232,0.10)'
const goldBorder = 'rgba(116,207,232,0.28)'
const text = '#f4f4f2'
const muted = 'rgba(244,244,242,0.55)'
const inputBg = 'rgba(255,255,255,0.05)'
const inputBorder = 'rgba(255,255,255,0.14)'

interface LocationOpt { id: string; name: string; city: string; country: string }
interface FoundPage { url: string; title: string; selected: boolean }
interface ExtractedBoat {
  name: string; tagline: string; description: string; type: string
  length_m: number | null; capacity_pax: number; cabins: number | null
  builder: string | null; model_year: number | null; departure_port: string | null
  currency: string; pricing: { duration_hours: number; price: number }[]
  features: string[]; images: string[]; sourceUrl: string
  selected: boolean
}
interface ImportResult { name: string; ok: boolean; id?: string; slug?: string; images?: number; error?: string; updated?: boolean }

const inputStyle: React.CSSProperties = {
  background: inputBg, border: `1px solid ${inputBorder}`, borderRadius: '10px',
  color: text, fontSize: '14px', padding: '11px 14px', outline: 'none', width: '100%',
}
const goldBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '99px',
  background: 'linear-gradient(135deg,#8fdcf0,#74cfe8,#4fb8d6)', color: '#07101e',
  fontSize: '14px', fontWeight: 700, border: 'none', cursor: 'pointer',
}
const ghostBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '10px 18px', borderRadius: '99px',
  background: goldFaint, border: `1px solid ${goldBorder}`, color: gold, fontSize: '13px', fontWeight: 600, cursor: 'pointer',
}

export default function WebsiteImportClient({ locations, targetHostId, targetLabel, initialUrl, submissionId }: { locations: LocationOpt[]; targetHostId?: string; targetLabel?: string; initialUrl?: string; submissionId?: string }) {
  const [url, setUrl] = useState(initialUrl ?? '')
  const autoRan = useRef(false)
  // Where to import from: scan a site, paste boat-page links, upload a PDF, or a Dropbox link.
  const [mode, setMode] = useState<'website' | 'links' | 'pdf' | 'dropbox'>('website')
  const [linksText, setLinksText] = useState('')
  const [dropboxUrl, setDropboxUrl] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const backHref = targetHostId ? '/admin/boathire24' : '/host/fleet'
  const [phase, setPhase] = useState<'idle' | 'scanning' | 'pages' | 'extracting' | 'review' | 'importing' | 'done'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [pages, setPages] = useState<FoundPage[]>([])
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [boats, setBoats] = useState<ExtractedBoat[]>([])
  const [country, setCountry] = useState('Spain')
  const [city, setCity] = useState('')
  const [priceOnRequest, setPriceOnRequest] = useState(false)
  const [publishStatus, setPublishStatus] = useState<'draft' | 'active'>('draft')
  const [results, setResults] = useState<ImportResult[]>([])

  async function scan() {
    setError(null)
    setPhase('scanning')
    try {
      const res = await fetch('/api/host/import-website/scan', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Scan failed')
      if (!json.pages?.length) throw new Error('No boat pages found on that site. Check the URL, or use Bulk Import (CSV) instead.')
      setPages(json.pages.map((p: { url: string; title: string }) => ({ ...p, selected: true })))
      setPhase('pages')
    } catch (e) {
      setError((e as Error).message)
      setPhase('idle')
    }
  }

  // Concierge: when opened with a lead's website (?url=), auto-start the scan.
  useEffect(() => {
    if (initialUrl && initialUrl.trim() && !autoRan.current) {
      autoRan.current = true
      scan()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function extract() {
    setError(null)
    const picked = pages.filter((p) => p.selected)
    setProgress({ done: 0, total: picked.length })
    setPhase('extracting')
    const found: ExtractedBoat[] = []
    for (let i = 0; i < picked.length; i++) {
      try {
        const res = await fetch('/api/host/import-website/extract', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: picked[i].url }),
        })
        const json = await res.json()
        for (const b of json.boats ?? []) {
          // The same boat sometimes appears on two pages — keep the first.
          if (!found.some((x) => x.name.toLowerCase() === String(b.name).toLowerCase())) {
            found.push({ ...b, selected: true })
          }
        }
      } catch { /* one bad page shouldn't kill the run */ }
      setProgress({ done: i + 1, total: picked.length })
      setBoats([...found])
    }
    if (found.length === 0) {
      setError('Could not extract any boats from the selected pages.')
      setPhase('pages')
      return
    }
    setPhase('review')
  }

  // Paste boat-page links → treat them as the "found pages" list, then extract.
  function useLinks() {
    setError(null)
    const urls = Array.from(new Set(
      linksText.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean)
        .map((s) => (/^https?:\/\//i.test(s) ? s : `https://${s}`))
        .filter((s) => { try { new URL(s); return true } catch { return false } })
    ))
    if (urls.length === 0) { setError('Paste at least one boat-page link (one per line).'); return }
    setPages(urls.map((u) => ({ url: u, title: decodeURIComponent(new URL(u).pathname.split('/').filter(Boolean).pop() || u) })).map((p) => ({ ...p, selected: true })))
    setPhase('pages')
  }

  // Upload a fleet PDF → server extracts text + boats → straight to review.
  async function uploadPdf(file: File) {
    setError(null)
    if (!/\.pdf$/i.test(file.name) && !file.type.includes('pdf')) { setError('Please choose a PDF file.'); return }
    setProgress({ done: 0, total: 1 })
    setPhase('extracting')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/host/import-doc', { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Could not read the PDF')
      const found: ExtractedBoat[] = (json.boats ?? []).map((b: ExtractedBoat) => ({ ...b, selected: true }))
      if (found.length === 0) { setError(json.error || 'No boats found in that PDF.'); setPhase('idle'); return }
      setBoats(found)
      setPhase('review')
    } catch (e) {
      setError((e as Error).message)
      setPhase('idle')
    }
  }

  // Paste a Dropbox share link → server downloads + extracts → review.
  async function importDropbox() {
    setError(null)
    if (!dropboxUrl.trim()) { setError('Paste a Dropbox share link.'); return }
    setProgress({ done: 0, total: 1 })
    setPhase('extracting')
    try {
      const res = await fetch('/api/host/import-dropbox', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: dropboxUrl.trim() }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Could not read the Dropbox link')
      const found: ExtractedBoat[] = (json.boats ?? []).map((b: ExtractedBoat) => ({ ...b, selected: true }))
      if (found.length === 0) { setError(json.error || 'No boats found at that Dropbox link.'); setPhase('idle'); return }
      setBoats(found)
      setPhase('review')
    } catch (e) {
      setError((e as Error).message)
      setPhase('idle')
    }
  }

  async function runImport() {
    if (!city.trim()) { setError('Pick the country and write the city for these boats first.'); return }
    setError(null)
    const countryCode = iso2FromFlag(COUNTRIES.find((c) => c[1] === country)?.[0] ?? '')
    const picked = boats.filter((b) => b.selected)
    setProgress({ done: 0, total: picked.length })
    setResults([])
    setPhase('importing')
    const out: ImportResult[] = []
    for (let i = 0; i < picked.length; i++) {
      try {
        const res = await fetch('/api/host/import-website/import', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ boat: picked[i], country, city: city.trim(), countryCode, priceOnRequest, status: publishStatus, targetHostId, submissionId }),
        })
        const json = await res.json()
        out.push(res.ok
          ? { name: picked[i].name, ok: true, id: json.boatId, slug: json.slug, images: json.images, updated: json.updated }
          : { name: picked[i].name, ok: false, error: json.error || 'Import failed' })
      } catch (e) {
        out.push({ name: picked[i].name, ok: false, error: (e as Error).message })
      }
      setProgress({ done: i + 1, total: picked.length })
      setResults([...out])
    }
    setPhase('done')
  }

  const priceLine = (b: ExtractedBoat) => {
    if (!b.pricing.length) return 'No price found — set it before publishing'
    return b.pricing.map((p) => `${p.duration_hours}h · ${p.price} ${b.currency}`).join('  ·  ')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#07101e', padding: '40px 20px' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>
        <Link href={backHref} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: muted, fontSize: '13px', textDecoration: 'none', marginBottom: '24px' }}>
          <ArrowLeft style={{ width: 14, height: 14 }} /> {targetHostId ? 'BoatHire24 managed' : 'Fleet Manager'}
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '10px' }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: goldFaint, border: `1px solid ${goldBorder}` }}>
            <Globe style={{ width: 22, height: 22, color: gold }} />
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: text, margin: 0 }}>Import from your website</h1>
        </div>

        {targetLabel && (
          <div style={{ background: 'rgba(116,207,232,0.10)', border: `1px solid ${goldBorder}`, borderRadius: 12, padding: '12px 16px', margin: '0 0 18px', color: text, fontSize: 13 }}>
            🛥 <strong>Managed import</strong> — these boats will be created under the <strong style={{ color: gold }}>{targetLabel}</strong> account as drafts. Review photos and details, then activate each one manually.
          </div>
        )}
        <p style={{ color: muted, fontSize: '14px', lineHeight: 1.65, margin: '0 0 28px' }}>
          Paste your company website and we read your boat pages automatically — names, specs, prices,
          descriptions and photos — and turn them into BoatHire24 listings. You review everything before it goes live.
        </p>

        {/* ── Step 1: choose a source ── */}
        <div style={{ background: card, borderRadius: 16, border: `1px solid ${border}`, padding: 24, marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: gold, marginBottom: 12 }}>STEP 1 — Where are the boats?</div>

          {/* Source tabs */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
            {([
              { key: 'website', label: 'Scan website', Icon: Globe },
              { key: 'links', label: 'Paste links', Icon: Link2 },
              { key: 'pdf', label: 'Upload PDF', Icon: FileText },
              { key: 'dropbox', label: 'Dropbox link', Icon: Package },
            ] as const).map((t) => {
              const active = mode === t.key
              return (
                <button
                  key={t.key}
                  onClick={() => { setMode(t.key); setError(null) }}
                  disabled={phase === 'scanning' || phase === 'extracting'}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 99,
                    fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    background: active ? goldFaint : 'transparent', color: active ? gold : muted,
                    border: `1px solid ${active ? goldBorder : inputBorder}`,
                  }}
                >
                  <t.Icon style={{ width: 14, height: 14 }} /> {t.label}
                </button>
              )
            })}
          </div>

          {/* Website scan */}
          {mode === 'website' && (
            <>
              <div style={{ display: 'flex', gap: 10 }}>
                <input
                  style={inputStyle}
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="e.g. www.your-charter-company.com"
                  onKeyDown={(e) => { if (e.key === 'Enter' && url.trim() && phase !== 'scanning') scan() }}
                />
                <button style={{ ...goldBtn, opacity: phase === 'scanning' || !url.trim() ? 0.6 : 1, whiteSpace: 'nowrap' }} disabled={phase === 'scanning' || !url.trim()} onClick={scan}>
                  {phase === 'scanning' ? <Loader2 style={{ width: 15, height: 15, animation: 'spin 1s linear infinite' }} /> : <Sparkles style={{ width: 15, height: 15 }} />}
                  {phase === 'scanning' ? 'Scanning…' : 'Scan website'}
                </button>
              </div>
              {phase === 'scanning' && <div style={{ color: muted, fontSize: 13, marginTop: 12 }}>Reading the site and looking for boat pages — this takes up to a minute.</div>}
            </>
          )}

          {/* Paste links */}
          {mode === 'links' && (
            <>
              <p style={{ color: muted, fontSize: 13, margin: '0 0 10px', lineHeight: 1.5 }}>Paste the exact boat-page links, one per line. We read each page and pull in its boat.</p>
              <textarea
                style={{ ...inputStyle, minHeight: 110, fontFamily: 'inherit', resize: 'vertical' }}
                value={linksText}
                onChange={(e) => setLinksText(e.target.value)}
                placeholder={'https://example.com/boats/sunseeker-50\nhttps://example.com/boats/axopar-28\nhttps://example.com/boats/lagoon-42'}
              />
              <button style={{ ...goldBtn, marginTop: 12, opacity: !linksText.trim() ? 0.6 : 1 }} disabled={!linksText.trim() || phase === 'extracting'} onClick={useLinks}>
                <Ship style={{ width: 15, height: 15 }} /> Use these links
              </button>
            </>
          )}

          {/* Upload PDF */}
          {mode === 'pdf' && (
            <>
              <input ref={fileRef} type="file" accept="application/pdf,.pdf" style={{ display: 'none' }}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadPdf(f); e.target.value = '' }} />
              <div
                onClick={() => phase !== 'extracting' && fileRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) uploadPdf(f) }}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '34px 20px', borderRadius: 12, cursor: phase === 'extracting' ? 'wait' : 'pointer',
                  border: `2px dashed ${dragOver ? gold : inputBorder}`, background: dragOver ? goldFaint : 'transparent', textAlign: 'center',
                }}
              >
                {phase === 'extracting'
                  ? <Loader2 style={{ width: 26, height: 26, color: gold, animation: 'spin 1s linear infinite' }} />
                  : <UploadCloud style={{ width: 26, height: 26, color: gold }} />}
                <div style={{ color: text, fontSize: 14, fontWeight: 600 }}>{phase === 'extracting' ? 'Reading the PDF…' : 'Drop a PDF here, or click to choose'}</div>
                <div style={{ color: muted, fontSize: 12 }}>Fleet lists, brochures or price sheets. Text-based PDFs (not scans). Max 25 MB.</div>
              </div>
            </>
          )}

          {/* Dropbox link */}
          {mode === 'dropbox' && (
            <>
              <p style={{ color: muted, fontSize: 13, margin: '0 0 10px', lineHeight: 1.5 }}>Paste a Dropbox share link to a fleet PDF or document. We download it and read the boats.</p>
              <div style={{ display: 'flex', gap: 10 }}>
                <input
                  style={inputStyle}
                  value={dropboxUrl}
                  onChange={(e) => setDropboxUrl(e.target.value)}
                  placeholder="https://www.dropbox.com/s/…/fleet.pdf?dl=0"
                  onKeyDown={(e) => { if (e.key === 'Enter' && dropboxUrl.trim() && phase !== 'extracting') importDropbox() }}
                />
                <button style={{ ...goldBtn, opacity: !dropboxUrl.trim() || phase === 'extracting' ? 0.6 : 1, whiteSpace: 'nowrap' }} disabled={!dropboxUrl.trim() || phase === 'extracting'} onClick={importDropbox}>
                  {phase === 'extracting' ? <Loader2 style={{ width: 15, height: 15, animation: 'spin 1s linear infinite' }} /> : <Sparkles style={{ width: 15, height: 15 }} />}
                  {phase === 'extracting' ? 'Reading…' : 'Read Dropbox'}
                </button>
              </div>
            </>
          )}
        </div>

        {/* ── Step 2: pages found (website scan / pasted links only) ── */}
        {(phase === 'pages' || phase === 'extracting') && pages.length > 0 && (
          <div style={{ background: card, borderRadius: 16, border: `1px solid ${border}`, padding: 24, marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: gold, marginBottom: 10 }}>
              STEP 2 — {pages.length} boat page{pages.length === 1 ? '' : 's'} found
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 320, overflowY: 'auto', marginBottom: 16 }}>
              {pages.map((p, i) => (
                <label key={p.url} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, background: p.selected ? goldFaint : 'transparent', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={p.selected}
                    disabled={phase === 'extracting'}
                    onChange={() => setPages((ps) => ps.map((x, j) => (j === i ? { ...x, selected: !x.selected } : x)))}
                  />
                  <span style={{ color: text, fontSize: 13, fontWeight: 600 }}>{p.title || 'Boat page'}</span>
                  <span style={{ color: muted, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.url}</span>
                </label>
              ))}
            </div>
            <button
              style={{ ...goldBtn, opacity: phase === 'extracting' || !pages.some((p) => p.selected) ? 0.6 : 1 }}
              disabled={phase === 'extracting' || !pages.some((p) => p.selected)}
              onClick={extract}
            >
              {phase === 'extracting'
                ? <><Loader2 style={{ width: 15, height: 15, animation: 'spin 1s linear infinite' }} /> Reading boats… {progress.done}/{progress.total}</>
                : <><Ship style={{ width: 15, height: 15 }} /> Extract {pages.filter((p) => p.selected).length} page{pages.filter((p) => p.selected).length === 1 ? '' : 's'}</>}
            </button>
            {phase === 'extracting' && boats.length > 0 && (
              <span style={{ marginLeft: 14, color: muted, fontSize: 13 }}>{boats.length} boat{boats.length === 1 ? '' : 's'} extracted so far</span>
            )}
          </div>
        )}

        {/* ── Step 3: review + import ── */}
        {(phase === 'review' || phase === 'importing' || phase === 'done') && (
          <div style={{ background: card, borderRadius: 16, border: `1px solid ${border}`, padding: 24, marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: gold, marginBottom: 14 }}>
              STEP 3 — Review {boats.length} boat{boats.length === 1 ? '' : 's'}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              {boats.map((b, i) => (
                <div key={`${b.name}-${i}`} style={{ display: 'flex', gap: 14, padding: 14, borderRadius: 12, border: `1px solid ${b.selected ? goldBorder : inputBorder}`, background: b.selected ? goldFaint : 'transparent' }}>
                  {b.images[0]
                    ? <img src={b.images[0]} alt={b.name} style={{ width: 110, height: 78, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
                    : <div style={{ width: 110, height: 78, borderRadius: 8, background: inputBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><ImageIcon style={{ width: 20, height: 20, color: muted }} /></div>}
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <input
                        type="checkbox"
                        checked={b.selected}
                        disabled={phase !== 'review'}
                        onChange={() => setBoats((bs) => bs.map((x, j) => (j === i ? { ...x, selected: !x.selected } : x)))}
                      />
                      <span style={{ color: text, fontWeight: 700, fontSize: 15 }}>{b.name}</span>
                      <span style={{ color: muted, fontSize: 12 }}>
                        {b.type.replace('_', ' ')}{b.length_m ? ` · ${b.length_m} m` : ''} · up to {b.capacity_pax} guests · {b.images.length} photo{b.images.length === 1 ? '' : 's'}
                      </span>
                    </div>
                    <div style={{ color: gold, fontSize: 12.5, fontWeight: 600, margin: '6px 0' }}>{priceLine(b)}</div>
                    <div style={{ color: muted, fontSize: 12.5, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {b.description || b.tagline || 'No description extracted.'}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {phase === 'review' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                  <select style={{ ...inputStyle, width: 'auto', minWidth: 180, cursor: 'pointer' }} value={country} onChange={(e) => setCountry(e.target.value)}>
                    {COUNTRIES.map(([flag, name]) => <option key={name} value={name}>{name} {flag}</option>)}
                  </select>
                  <input style={{ ...inputStyle, width: 'auto', minWidth: 200 }} value={city} onChange={(e) => setCity(e.target.value)} placeholder="City / marina — required" />
                  <select style={{ ...inputStyle, width: 'auto', cursor: 'pointer' }} value={publishStatus} onChange={(e) => setPublishStatus(e.target.value as 'draft' | 'active')}>
                    <option value="draft">Import as drafts (review first)</option>
                    <option value="active">Publish immediately</option>
                  </select>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13, color: text, cursor: 'pointer' }}>
                  <input type="checkbox" checked={priceOnRequest} onChange={(e) => setPriceOnRequest(e.target.checked)} style={{ width: 17, height: 17, accentColor: gold, cursor: 'pointer' }} />
                  Price on request — no prices on this site (applies to all {boats.filter((b) => b.selected).length} imported boats)
                </label>
                <button style={{ ...goldBtn, alignSelf: 'flex-start', opacity: boats.some((b) => b.selected) ? 1 : 0.6 }} disabled={!boats.some((b) => b.selected)} onClick={runImport}>
                  <Check style={{ width: 15, height: 15 }} /> Import {boats.filter((b) => b.selected).length} boat{boats.filter((b) => b.selected).length === 1 ? '' : 's'}
                </button>
              </div>
            )}

            {phase === 'importing' && (
              <div style={{ color: text, fontSize: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                <Loader2 style={{ width: 16, height: 16, color: gold, animation: 'spin 1s linear infinite' }} />
                Importing boats and copying photos… {progress.done}/{progress.total}
              </div>
            )}

            {(phase === 'importing' || phase === 'done') && results.length > 0 && (
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {phase === 'done' && <div style={{ fontSize: 12, fontWeight: 700, color: muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Imported — click to review</div>}
                {results.map((r) => (
                  r.ok && r.id ? (
                    <Link key={r.name} href={`/host/listings/${r.id}`} style={{ fontSize: 13, color: '#22c55e', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      ✓ {r.name} {r.updated ? 'updated' : 'imported'} ({r.images ?? 0} photos) <span style={{ color: gold }}>— review →</span>
                    </Link>
                  ) : (
                    <div key={r.name} style={{ fontSize: 13, color: r.ok ? '#22c55e' : '#ef4444' }}>
                      {r.ok
                        ? <>✓ {r.name} {r.updated ? 'updated' : 'imported'} ({r.images ?? 0} photos)</>
                        : <>✕ {r.name}: {r.error}</>}
                    </div>
                  )
                ))}
              </div>
            )}

            {phase === 'done' && (
              <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
                <Link href={targetHostId ? '/admin/boathire24' : '/host/listings'} style={{ ...goldBtn, textDecoration: 'none' }}>{targetHostId ? 'Back to BoatHire24 managed' : 'All my listings'}</Link>
                <button style={ghostBtn} onClick={() => { setPhase('idle'); setPages([]); setBoats([]); setResults([]); setUrl('') }}>
                  Import another website
                </button>
              </div>
            )}
          </div>
        )}

        {error && (
          <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.35)', color: '#fca5a5', fontSize: 13.5, marginBottom: 20 }}>
            {error}
          </div>
        )}

        <p style={{ color: muted, fontSize: 12.5, lineHeight: 1.6 }}>
          Photos are copied to BoatHire24 so your listings keep working even if your site changes.
          Only import boats and photos you own the rights to. Prefer a spreadsheet?{' '}
          <Link href="/host/fleet/import" style={{ color: gold }}>Use Bulk Import (CSV)</Link>.
        </p>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
