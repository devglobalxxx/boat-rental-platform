import { NextRequest, NextResponse } from 'next/server'

const KEY = 'CF4FA3F0F1CEAC43E77E46C1D522ABCF'
const HOST = 'boathire24.com'

const ALL_URLS = [
  // ── Core pages ──
  `https://${HOST}/`,
  `https://${HOST}/about`,
  `https://${HOST}/blog`,
  `https://${HOST}/become-a-host`,
  `https://${HOST}/how-it-works`,
  `https://${HOST}/search`,
  `https://${HOST}/privacy`,
  `https://${HOST}/terms`,
  // ── Location pages ──
  `https://${HOST}/marbella`,
  // ── Blog: guides ──
  `https://${HOST}/blog/ultimate-guide-renting-yacht-marbella`,
  `https://${HOST}/blog/catamaran-vs-motor-yacht`,
  `https://${HOST}/blog/best-anchorages-costa-del-sol`,
  `https://${HOST}/blog/perfect-boat-day-packing-list`,
  // ── Blog: boat reviews ──
  `https://${HOST}/blog/charter-astondoa-40-marbella`,
  `https://${HOST}/blog/charter-azimut-39-marbella`,
  `https://${HOST}/blog/mangusta-80-superyacht-charter-marbella`,
  `https://${HOST}/blog/azimut-58-flybridge-charter-marbella`,
  `https://${HOST}/blog/bandido-fishing-charter-marbella`,
  `https://${HOST}/blog/canados-86-superyacht-charter-marbella`,
  `https://${HOST}/blog/dubhe-licence-free-boat-marbella`,
  `https://${HOST}/blog/fairline-targa-charter-marbella`,
  `https://${HOST}/blog/ferretti-94-luxury-charter-marbella`,
  `https://${HOST}/blog/k80-yacht-charter-marbella`,
  `https://${HOST}/blog/lagoon-380-catamaran-charter-marbella`,
  `https://${HOST}/blog/mangusta-80-grey-charter-marbella`,
  `https://${HOST}/blog/mangusta-80-white-charter-marbella`,
  `https://${HOST}/blog/mariah-sx21-bowrider-marbella`,
  `https://${HOST}/blog/pershing-46-sport-yacht-marbella`,
  `https://${HOST}/blog/red-tide-fishing-charter-marbella`,
  `https://${HOST}/blog/speedboat-charter-marbella`,
]

export async function GET(req: NextRequest) {
  // Verify Vercel cron secret (Vercel sends Authorization: Bearer <CRON_SECRET>)
  const secret = process.env.CRON_SECRET
  if (secret) {
    const auth = req.headers.get('authorization')
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: HOST,
        key: KEY,
        keyLocation: `https://${HOST}/${KEY}.txt`,
        urlList: ALL_URLS,
      }),
    })

    return NextResponse.json({
      ok: res.ok,
      indexnow_status: res.status,
      urls_submitted: ALL_URLS.length,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
