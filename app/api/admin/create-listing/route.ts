import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: me } = await supabaseAdmin
    .from('profiles').select('is_admin').eq('id', user.id).single()
  if (!me?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { hostId, ...boatFields } = body
  if (!hostId) return NextResponse.json({ error: 'Missing hostId' }, { status: 400 })

  // Make sure host exists
  const { data: { user: target } } = await supabaseAdmin.auth.admin.getUserById(hostId)
  if (!target) return NextResponse.json({ error: 'Target user not found' }, { status: 404 })

  // Admin-listed boats always start as drafts — host must review & activate.
  const { data: boat, error } = await supabaseAdmin
    .from('boats')
    .insert({ host_id: hostId, ...boatFields, status: 'draft' })
    .select('id')
    .single()

  if (error || !boat) {
    return NextResponse.json({ error: error?.message ?? 'Insert failed' }, { status: 500 })
  }

  return NextResponse.json({ id: boat.id, ok: true })
}
