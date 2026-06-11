import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { aiAvailable } from '@/lib/ai/deepseek'
import { assertPublicUrl, discoverCandidates, classifyBoatPages } from '@/lib/import/website'

export const runtime = 'nodejs'
export const maxDuration = 60

// Step 1 of the website importer: crawl the company site and return the pages
// that look like individual boat listings. The client then calls /extract per page.
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!aiAvailable()) return NextResponse.json({ error: 'AI import is not configured on this server' }, { status: 503 })

  const body = await req.json().catch(() => ({}))
  let site: URL
  try {
    site = assertPublicUrl(String(body?.url ?? ''))
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 })
  }

  try {
    const candidates = await discoverCandidates(site.toString())
    const pages = await classifyBoatPages(site.toString(), candidates)
    return NextResponse.json({
      ok: true,
      siteHost: site.hostname.replace(/^www\./, ''),
      pages: pages.map((url) => ({ url, title: candidates.find((c) => c.url === url)?.text || decodeURI(new URL(url).pathname) })),
    })
  } catch (e) {
    console.error('import-website scan error:', e)
    return NextResponse.json({ error: `Could not scan ${site.hostname}: ${(e as Error).message}` }, { status: 400 })
  }
}
