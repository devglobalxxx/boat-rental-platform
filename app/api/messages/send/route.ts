import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { sendNewMessageAlert } from '@/lib/email/bookings'

const admin = createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// Chat send goes through here (instead of a raw client insert) so we can email + WhatsApp the
// other participant on every message — "if the client answers, it comes there". Realtime still
// delivers the message to both open threads (the INSERT replicates regardless of who wrote it).
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { conversationId, body } = await req.json().catch(() => ({}))
  const text = String(body || '').trim()
  if (!conversationId || !text) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const { data: conv } = await admin.from('conversations').select('participant_ids, boat_id').eq('id', conversationId).single()
  if (!conv) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const parts = (conv as { participant_ids: string[] | null }).participant_ids || []
  if (!parts.includes(user.id)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { error } = await admin.from('messages').insert({
    conversation_id: conversationId,
    sender_id: user.id,
    body: text.slice(0, 2000),
  })
  if (error) return NextResponse.json({ error: 'Could not send' }, { status: 500 })

  const otherId = parts.find((id) => id !== user.id)
  const boatId = (conv as { boat_id: string | null }).boat_id
  if (otherId) sendNewMessageAlert(conversationId, user.id, otherId, text, boatId).catch(() => {})

  return NextResponse.json({ ok: true })
}
