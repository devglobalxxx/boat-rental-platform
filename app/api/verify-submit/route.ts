import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const ownerType = formData.get('owner_type') as string // 'individual' | 'company'

  const DOC_FIELDS = ['passport', 'company_registration', 'boat_registration', 'marina_contract', 'boat_insurance']
  const uploadedDocs: { type: string; name: string; path: string; signedUrl: string }[] = []
  const errors: string[] = []

  // Upload each document to private bucket
  for (const docType of DOC_FIELDS) {
    const file = formData.get(docType) as File | null
    if (!file || file.size === 0) continue

    const ext = (file.name.split('.').pop() ?? 'pdf').toLowerCase()
    const path = `${user.id}/${docType}-${Date.now()}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const { data, error } = await supabaseAdmin.storage
      .from('verification-docs')
      .upload(path, buffer, { contentType: file.type, upsert: true })

    if (error) {
      errors.push(`Failed to upload ${docType}: ${error.message}`)
      continue
    }

    // Get a signed URL valid for 7 days (for the email to admin)
    const { data: signed } = await supabaseAdmin.storage
      .from('verification-docs')
      .createSignedUrl(data.path, 60 * 60 * 24 * 7)

    uploadedDocs.push({ type: docType, name: file.name, path: data.path, signedUrl: signed?.signedUrl ?? data.path })
  }

  if (uploadedDocs.length === 0) {
    return NextResponse.json({ error: 'Please upload at least one document.' }, { status: 400 })
  }

  // Save document records to DB so admin can view them later
  await supabaseAdmin.from('verification_documents').insert(
    uploadedDocs.map((doc) => ({
      user_id: user.id,
      doc_type: doc.type,
      file_name: doc.name,
      storage_path: doc.path,
    }))
  )

  // Get user profile
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const displayName = profile?.full_name ?? user.email ?? user.id

  // Update profile verification_status to pending
  await supabaseAdmin
    .from('profiles')
    .update({ verification_status: 'pending' })
    .eq('id', user.id)

  // Send email to admin
  const docLines = uploadedDocs
    .map((d) => `<li><strong>${d.type.replace(/_/g, ' ')}</strong>: <a href="${d.signedUrl}">${d.name}</a></li>`)
    .join('\n')

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: 'info@boathire24.com',
    subject: `[Verification] ${displayName} submitted documents`,
    html: `
      <h2>New host verification submission</h2>
      <p><strong>User:</strong> ${displayName} (${user.email})</p>
      <p><strong>User ID:</strong> ${user.id}</p>
      <p><strong>Owner type:</strong> ${ownerType}</p>
      <p><strong>Documents submitted:</strong></p>
      <ul>${docLines}</ul>
      <p>
        <a href="https://boathire24.com/admin" style="background:#c9a84e;color:#07101e;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:700;">
          Open Admin Panel →
        </a>
      </p>
      <p style="color:#888;font-size:12px;">Links expire in 7 days.</p>
    `,
  })

  return NextResponse.json({ ok: true, docs: uploadedDocs.length })
}
