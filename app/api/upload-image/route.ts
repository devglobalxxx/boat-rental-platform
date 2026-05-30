import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  // Verify the caller is authenticated
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const boatId = formData.get('boatId') as string | null

  if (!file || !boatId) {
    return NextResponse.json({ error: 'Missing file or boatId' }, { status: 400 })
  }

  // Verify the boat belongs to this user
  const { data: boat } = await supabaseAdmin
    .from('boats')
    .select('id')
    .eq('id', boatId)
    .eq('host_id', user.id)
    .single()

  if (!boat) return NextResponse.json({ error: 'Boat not found or not yours' }, { status: 403 })

  const ext = (file.name.split('.').pop() ?? 'jpg').toLowerCase()
  const path = `boats/${boatId}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`

  const buffer = Buffer.from(await file.arrayBuffer())

  const { data, error } = await supabaseAdmin.storage
    .from('boat-images')
    .upload(path, buffer, {
      contentType: file.type || 'image/jpeg',
      upsert: false,
    })

  if (error) {
    console.error('Storage upload error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { data: urlData } = supabaseAdmin.storage.from('boat-images').getPublicUrl(data.path)

  return NextResponse.json({ url: urlData.publicUrl })
}
