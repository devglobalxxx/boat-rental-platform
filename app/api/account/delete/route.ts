import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function DELETE() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Clean up related data first
  const { data: boats } = await supabaseAdmin
    .from('boats')
    .select('id')
    .eq('host_id', user.id)

  for (const boat of boats ?? []) {
    await supabaseAdmin.from('boat_images').delete().eq('boat_id', boat.id)
    await supabaseAdmin.from('boat_features').delete().eq('boat_id', boat.id)
    await supabaseAdmin.from('boat_pricing').delete().eq('boat_id', boat.id)
    await supabaseAdmin.from('availability').delete().eq('boat_id', boat.id)
    await supabaseAdmin.from('wishlists').delete().eq('boat_id', boat.id)
  }
  await supabaseAdmin.from('boats').delete().eq('host_id', user.id)
  await supabaseAdmin.from('wishlists').delete().eq('user_id', user.id)
  await supabaseAdmin.from('verification_documents').delete().eq('user_id', user.id)
  await supabaseAdmin.from('profiles').delete().eq('id', user.id)

  // Delete auth user last
  const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
