import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import AdminVerifyButton from './AdminVerifyButton'
import AdminDocsButton from './AdminDocsButton'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin Panel' }

const supabaseAdmin = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const gold = '#c9a84e'
const goldFaint = 'rgba(201,168,78,0.10)'
const goldBorder = 'rgba(201,168,78,0.22)'
const card = '#0c1828'
const border = 'rgba(201,168,78,0.15)'
const text = '#f4f4f2'
const muted = 'rgba(244,244,242,0.55)'

const STATUS_STYLE: Record<string, { color: string; bg: string; bd: string; label: string }> = {
  unverified: { color: muted,      bg: 'rgba(255,255,255,0.05)', bd: 'rgba(255,255,255,0.12)', label: 'Unverified' },
  pending:    { color: '#f59e0b',  bg: 'rgba(245,158,11,0.10)',  bd: 'rgba(245,158,11,0.28)',  label: 'Pending review' },
  verified:   { color: '#22c55e',  bg: 'rgba(34,197,94,0.10)',   bd: 'rgba(34,197,94,0.28)',   label: 'Verified ✓' },
  rejected:   { color: '#f87171',  bg: 'rgba(248,113,113,0.10)', bd: 'rgba(248,113,113,0.28)', label: 'Rejected' },
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/admin')

  // Check admin status
  const { data: me } = await supabaseAdmin
    .from('profiles')
    .select('is_admin, full_name')
    .eq('id', user.id)
    .single()

  if (!me?.is_admin) {
    return (
      <div style={{ background: '#07101e', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: text }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</p>
          <p style={{ fontWeight: 700, fontSize: '18px', color: text, marginBottom: '8px' }}>Access denied</p>
          <p style={{ fontSize: '14px', color: muted }}>This page is for BoatHire24 admins only.</p>
        </div>
      </div>
    )
  }

  const params = await searchParams
  const filter = params.filter ?? 'all'

  // Fetch all profiles with boat counts
  const { data: profiles } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, verification_status, is_admin, host_since, verification_notes, verified_at')
    .order('host_since', { ascending: false })

  // Fetch all auth users for emails
  const { data: { users: authUsers } } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })
  const emailMap = Object.fromEntries(authUsers.map((u) => [u.id, { email: u.email, created_at: u.created_at }]))

  // Fetch boat counts per host
  const { data: boatCounts } = await supabaseAdmin
    .from('boats')
    .select('host_id')
  const boatMap: Record<string, number> = {}
  for (const b of boatCounts ?? []) {
    boatMap[b.host_id] = (boatMap[b.host_id] ?? 0) + 1
  }

  // Fetch doc counts per user
  const { data: docCounts } = await supabaseAdmin
    .from('verification_documents')
    .select('user_id')
  const docMap: Record<string, number> = {}
  for (const d of docCounts ?? []) {
    docMap[d.user_id] = (docMap[d.user_id] ?? 0) + 1
  }

  const all = (profiles ?? []).map((p) => ({
    ...p,
    email: emailMap[p.id]?.email ?? '',
    joined: emailMap[p.id]?.created_at ?? '',
    boats: boatMap[p.id] ?? 0,
    docs: docMap[p.id] ?? 0,
  }))

  const filtered = filter === 'all' ? all : all.filter((p) => p.verification_status === filter)

  const counts = {
    all: all.length,
    pending: all.filter((p) => p.verification_status === 'pending').length,
    verified: all.filter((p) => p.verification_status === 'verified').length,
    unverified: all.filter((p) => p.verification_status === 'unverified').length,
    rejected: all.filter((p) => p.verification_status === 'rejected').length,
  }

  return (
    <div style={{ background: '#07101e', minHeight: '100vh', color: text }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: '36px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', padding: '5px 14px', borderRadius: '99px', background: goldFaint, color: gold, border: `1px solid ${goldBorder}`, marginBottom: '16px' }}>
            🔒 Admin Panel
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: text, marginBottom: '6px' }}>User Management</h1>
          <p style={{ fontSize: '14px', color: muted }}>Review and verify host accounts. Only verified hosts' listings appear on the platform.</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '28px' }}>
          {[
            { label: 'Total users',  value: counts.all,        color: gold },
            { label: 'Pending',      value: counts.pending,    color: '#f59e0b' },
            { label: 'Verified',     value: counts.verified,   color: '#22c55e' },
            { label: 'Unverified',   value: counts.unverified, color: muted },
          ].map((s) => (
            <div key={s.label} style={{ background: card, borderRadius: '14px', border: `1px solid ${border}`, padding: '18px' }}>
              <div style={{ fontSize: '24px', fontWeight: 800, color: s.color, marginBottom: '4px' }}>{s.value}</div>
              <div style={{ fontSize: '12px', color: muted }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {[
            { key: 'all',        label: `All (${counts.all})` },
            { key: 'pending',    label: `Pending (${counts.pending})` },
            { key: 'verified',   label: `Verified (${counts.verified})` },
            { key: 'unverified', label: `Unverified (${counts.unverified})` },
            { key: 'rejected',   label: `Rejected (${counts.rejected})` },
          ].map((tab) => (
            <a
              key={tab.key}
              href={`/admin?filter=${tab.key}`}
              style={{ padding: '7px 16px', borderRadius: '99px', fontSize: '12px', fontWeight: 600, textDecoration: 'none', background: filter === tab.key ? goldFaint : 'transparent', color: filter === tab.key ? gold : muted, border: `1px solid ${filter === tab.key ? goldBorder : 'rgba(255,255,255,0.10)'}` }}
            >
              {tab.label}
            </a>
          ))}
        </div>

        {/* Users table */}
        <div style={{ background: card, borderRadius: '16px', border: `1px solid ${border}`, overflow: 'hidden' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: muted, fontSize: '14px' }}>No users in this filter.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '700px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    {['User', 'Email', 'Joined', 'Boats', 'Documents', 'Status', 'Actions'].map((h, i) => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: i === 6 ? 'right' : 'left', fontWeight: 600, color: muted, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u, i) => {
                    const s = STATUS_STYLE[u.verification_status] ?? STATUS_STYLE.unverified
                    return (
                      <tr key={u.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: 600, color: text }}>{u.full_name || '—'}</div>
                          {u.is_admin && <span style={{ fontSize: '10px', color: gold, fontWeight: 700 }}>ADMIN</span>}
                        </td>
                        <td style={{ padding: '14px 16px', color: muted }}>{u.email}</td>
                        <td style={{ padding: '14px 16px', color: muted, whiteSpace: 'nowrap' }}>
                          {u.joined ? new Date(u.joined).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }) : '—'}
                        </td>
                        <td style={{ padding: '14px 16px', color: muted, textAlign: 'center' }}>{u.boats || '—'}</td>
                        <td style={{ padding: '14px 16px', position: 'relative' }}>
                          <AdminDocsButton userId={u.id} docCount={u.docs} />
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '99px', background: s.bg, color: s.color, border: `1px solid ${s.bd}`, whiteSpace: 'nowrap' }}>
                            {s.label}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <AdminVerifyButton
                            userId={u.id}
                            currentStatus={u.verification_status}
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
