#!/usr/bin/env node
// Backfill pretty slugs for every existing boat and record each old slug in
// boat_slug_redirects so already-shared/indexed URLs 301 forward forever.
//
//   node scripts/backfill-slugs.mjs           # dry run — prints the mapping
//   node scripts/backfill-slugs.mjs --apply   # writes redirects + new slugs
//
// Reads SUPABASE creds from .env.local.
import { readFileSync } from 'node:fs'

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split('\n').filter((l) => l.includes('=')).map((l) => {
      const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
    }),
)
const URL_ = env.NEXT_PUBLIC_SUPABASE_URL
const KEY = env.SUPABASE_SERVICE_ROLE_KEY
const APPLY = process.argv.includes('--apply')
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }

function slugify(s) {
  return (s || '').toLowerCase().normalize('NFKD')
    .replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}
function buildBoatSlug({ city, builder, name }) {
  const seen = new Set(); const parts = []
  for (const raw of [city, builder, name]) {
    if (!raw) continue
    const words = slugify(raw).split('-').filter((w) => w && !seen.has(w))
    if (!words.length) continue
    words.forEach((w) => seen.add(w)); parts.push(words.join('-'))
  }
  let slug = parts.join('-')
  if (slug.length > 60) slug = slug.slice(0, 60).replace(/-[^-]*$/, '')
  return slug || 'boat'
}

const boats = await (await fetch(
  `${URL_}/rest/v1/boats?select=id,name,builder,slug,created_at,locations(city)&order=created_at.asc`,
  { headers: H },
)).json()

const used = new Set()
const changes = []
for (const b of boats) {
  const base = buildBoatSlug({ city: b.locations?.city, builder: b.builder, name: b.name })
  let slug = base; let n = 1
  while (used.has(slug)) { n += 1; slug = `${base}-${n}` }
  used.add(slug)
  if (slug !== b.slug) changes.push({ id: b.id, old: b.slug, new: slug })
}

console.log(`${boats.length} boats · ${changes.length} slugs will change\n`)
for (const c of changes.slice(0, 200)) console.log(`  ${c.old}\n    → ${c.new}`)

if (!APPLY) { console.log('\nDry run. Re-run with --apply to write.'); process.exit(0) }

let redir = 0, upd = 0
for (const c of changes) {
  // Record the redirect first (idempotent upsert), then flip the slug.
  const r1 = await fetch(`${URL_}/rest/v1/boat_slug_redirects?on_conflict=old_slug`, {
    method: 'POST', headers: { ...H, Prefer: 'resolution=merge-duplicates' },
    body: JSON.stringify({ old_slug: c.old, boat_id: c.id }),
  })
  if (r1.ok) redir++; else console.error('redirect fail', c.old, await r1.text())
  const r2 = await fetch(`${URL_}/rest/v1/boats?id=eq.${c.id}`, {
    method: 'PATCH', headers: { ...H, Prefer: 'return=minimal' },
    body: JSON.stringify({ slug: c.new }),
  })
  if (r2.ok) upd++; else console.error('slug update fail', c.id, await r2.text())
}
console.log(`\nApplied: ${upd} slugs updated, ${redir} redirects recorded.`)
