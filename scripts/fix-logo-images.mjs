#!/usr/bin/env node
// Remove the PRIMABOATS ship's-wheel LOGO (md5 803626b4…) from every boat that
// has it as a photo, then promote the next real photo to hero so the listing
// card shows a real boat image. DRY-RUN by default; pass --apply to execute.
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
const env = Object.fromEntries(readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
  .split('\n').filter((l) => l.includes('=')).map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] }))
const SB = env.NEXT_PUBLIC_SUPABASE_URL, KEY = env.SUPABASE_SERVICE_ROLE_KEY
const H = { apikey: KEY, Authorization: `Bearer ${KEY}` }
const HJSON = { ...H, 'Content-Type': 'application/json' }
const UA = 'Mozilla/5.0'
const LOGO = '803626b4636662ed438586e7ee749e40'          // PRIMABOATS ship's-wheel logo
const HEADSHOT = '5600a5014b1c0328eddd60e8d0dbb25d'      // "Simone" contact-person selfie
const JUNK = new Set([LOGO, HEADSHOT])
const APPLY = process.argv.includes('--apply')
const BUCKET_PREFIX = '/storage/v1/object/public/boat-images/'

async function md5(url) {
  try {
    const r = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(15000) })
    if (!r.ok) return null
    return createHash('md5').update(Buffer.from(await r.arrayBuffer())).digest('hex')
  } catch { return null }
}

const boats = await (await fetch(`${SB}/rest/v1/boats?status=eq.active&select=id,name,slug&order=name&limit=2000`, { headers: H })).json()
console.log(APPLY ? '*** APPLY MODE ***\n' : '*** DRY RUN (no changes) — pass --apply to execute ***\n')

let fixed = 0
for (const b of boats) {
  const imgs = await (await fetch(`${SB}/rest/v1/boat_images?boat_id=eq.${b.id}&select=id,storage_url,sort_order,is_hero&order=sort_order`, { headers: H })).json()
  const withHash = []
  for (const im of imgs) withHash.push({ ...im, hash: await md5(im.storage_url) })
  const logos = withHash.filter((im) => JUNK.has(im.hash))
  if (!logos.length) continue
  const remaining = withHash.filter((im) => im.hash && !JUNK.has(im.hash)) // real images left
  if (!remaining.length) { console.log(`SKIP ${b.name} — would leave 0 images`); continue }

  const newHero = remaining.slice().sort((a, c) => (a.sort_order ?? 0) - (c.sort_order ?? 0))[0]
  console.log(`${b.name.padEnd(30)} del ${logos.length} logo → hero=${newHero.storage_url.split('/').pop()} (${remaining.length} real remain)`)

  if (APPLY) {
    for (const lg of logos) {
      // delete DB row
      const d = await fetch(`${SB}/rest/v1/boat_images?id=eq.${lg.id}`, { method: 'DELETE', headers: H })
      if (!d.ok) { console.log(`   ! row delete failed ${d.status}`); continue }
      // delete storage object
      const path = lg.storage_url.split(BUCKET_PREFIX)[1]
      if (path) {
        const s = await fetch(`${SB}/storage/v1/object/boat-images/${path}`, { method: 'DELETE', headers: H })
        if (!s.ok && s.status !== 404) console.log(`   ! storage delete ${s.status} ${path}`)
      }
    }
    // clear hero on all, set hero on the new one
    await fetch(`${SB}/rest/v1/boat_images?boat_id=eq.${b.id}`, { method: 'PATCH', headers: HJSON, body: JSON.stringify({ is_hero: false }) })
    const p = await fetch(`${SB}/rest/v1/boat_images?id=eq.${newHero.id}`, { method: 'PATCH', headers: HJSON, body: JSON.stringify({ is_hero: true }) })
    if (!p.ok) console.log(`   ! hero set failed ${p.status}`)
  }
  fixed++
}
console.log(`\n${APPLY ? 'Fixed' : 'Would fix'}: ${fixed} boats`)
