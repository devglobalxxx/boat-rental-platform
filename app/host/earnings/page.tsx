import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils/pricing'
import { TrendingUp, DollarSign, Calendar, Ship } from 'lucide-react'

const gold = '#c9a84e'
const card = '#0c1828'
const border = 'rgba(201,168,78,0.15)'
const text = '#f4f4f2'
const muted = 'rgba(244,244,242,0.55)'
const dim = 'rgba(244,244,242,0.35)'

export default async function HostEarningsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/host/earnings')

  const { data: boats } = await supabase.from('boats').select('id').eq('host_id', user.id)
  const boatIds = (boats ?? []).map((b) => b.id)

  const { data: bookings } = boatIds.length
    ? await supabase
        .from('bookings')
        .select('id, status, total, subtotal, service_fee, currency, start_datetime, created_at, boats(name)')
        .in('boat_id', boatIds)
        .in('status', ['confirmed', 'completed'])
        .order('start_datetime', { ascending: false })
    : { data: [] }

  const allBookings = bookings ?? []
  const now = new Date()

  const thisMonth = allBookings.filter((b) => {
    const d = new Date(b.start_datetime)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const lastMonth = allBookings.filter((b) => {
    const d = new Date(b.start_datetime)
    const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear()
  })

  const PLATFORM_FEE = 0.15
  const hostShare = (amount: number) => amount * (1 - PLATFORM_FEE)

  const totalGross = allBookings.reduce((s, b) => s + (b.total ?? 0), 0)
  const thisMonthGross = thisMonth.reduce((s, b) => s + (b.total ?? 0), 0)
  const lastMonthGross = lastMonth.reduce((s, b) => s + (b.total ?? 0), 0)

  const monthlyData = Object.entries(
    allBookings.reduce<Record<string, number>>((acc, b) => {
      const key = new Date(b.start_datetime).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
      acc[key] = (acc[key] ?? 0) + (b.total ?? 0)
      return acc
    }, {})
  ).slice(-6).reverse()

  const stats = [
    { label: 'Total earnings',  value: formatPrice(hostShare(totalGross)),    sub: `${allBookings.length} bookings`, Icon: DollarSign, color: '#22c55e' },
    { label: 'This month',      value: formatPrice(hostShare(thisMonthGross)), sub: `${thisMonth.length} bookings`,   Icon: Calendar,   color: gold },
    { label: 'Last month',      value: formatPrice(hostShare(lastMonthGross)), sub: `${lastMonth.length} bookings`,   Icon: TrendingUp, color: muted },
    { label: 'Gross revenue',   value: formatPrice(totalGross),               sub: 'before platform fee',            Icon: Ship,       color: muted },
  ]

  return (
    <div style={{ background: '#07101e', minHeight: '100vh', color: text }}>
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 20px 80px' }}>

        <h1 style={{ fontSize: '26px', fontWeight: 800, color: text, marginBottom: '32px' }}>Earnings</h1>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '32px' }}>
          {stats.map((stat) => (
            <div key={stat.label} style={{ background: card, borderRadius: '16px', border, padding: '20px' }}>
              <stat.Icon style={{ width: 20, height: 20, color: stat.color, marginBottom: '12px' }} />
              <div style={{ fontSize: '24px', fontWeight: 800, color: text, marginBottom: '4px' }}>{stat.value}</div>
              <div style={{ fontSize: '13px', color: muted }}>{stat.label}</div>
              <div style={{ fontSize: '12px', color: dim, marginTop: '2px' }}>{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* Monthly breakdown */}
        {monthlyData.length > 0 && (
          <div style={{ background: card, borderRadius: '16px', border, padding: '24px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: text, marginBottom: '20px' }}>Monthly breakdown</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {monthlyData.map(([month, gross]) => {
                const pct = totalGross > 0 ? (gross / totalGross) * 100 : 0
                return (
                  <div key={month} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '80px', fontSize: '13px', color: muted, flexShrink: 0 }}>{month}</div>
                    <div style={{ flex: 1, background: 'rgba(255,255,255,0.08)', borderRadius: '99px', height: '6px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: gold, borderRadius: '99px', width: `${pct}%`, transition: 'width 0.5s' }} />
                    </div>
                    <div style={{ width: '80px', fontSize: '13px', fontWeight: 700, color: text, textAlign: 'right' }}>
                      {formatPrice(hostShare(gross))}
                    </div>
                  </div>
                )
              })}
            </div>
            <p style={{ fontSize: '12px', color: dim, marginTop: '16px' }}>Amounts shown after 15% platform fee. Payouts processed via Stripe.</p>
          </div>
        )}

        {/* Transaction history */}
        {allBookings.length > 0 ? (
          <div style={{ background: card, borderRadius: '16px', border, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: text }}>Transaction history</h2>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  {['Boat', 'Date', 'Gross', 'Your earnings'].map((h, i) => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: i >= 2 ? 'right' : 'left', fontWeight: 600, color: muted, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allBookings.map((booking, i, arr) => {
                  const boat = booking.boats as any
                  return (
                    <tr key={booking.id} style={{ borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                      <td style={{ padding: '14px 16px', color: text, fontWeight: 500 }}>{boat?.name}</td>
                      <td style={{ padding: '14px 16px', color: muted }}>
                        {new Date(booking.start_datetime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', color: muted }}>
                        {formatPrice(booking.total, booking.currency)}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 700, color: gold }}>
                        {formatPrice(hostShare(booking.total ?? 0), booking.currency)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '64px 24px', color: muted, fontSize: '15px' }}>
            No earnings yet. Your confirmed bookings will appear here.
          </div>
        )}
      </div>
    </div>
  )
}
