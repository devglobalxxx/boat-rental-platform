import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils/pricing'
import { TrendingUp, DollarSign, Calendar, Ship } from 'lucide-react'

export default async function HostEarningsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/host/earnings')

  const { data: boats } = await supabase
    .from('boats')
    .select('id')
    .eq('host_id', user.id)

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
  )
    .slice(-6)
    .reverse()

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Earnings</h1>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: 'Total earnings',
            value: formatPrice(hostShare(totalGross)),
            sub: `${allBookings.length} bookings`,
            icon: DollarSign,
            color: 'text-emerald-500',
          },
          {
            label: 'This month',
            value: formatPrice(hostShare(thisMonthGross)),
            sub: `${thisMonth.length} bookings`,
            icon: Calendar,
            color: 'text-[#06b6d4]',
          },
          {
            label: 'Last month',
            value: formatPrice(hostShare(lastMonthGross)),
            sub: `${lastMonth.length} bookings`,
            icon: TrendingUp,
            color: 'text-slate-400',
          },
          {
            label: 'Gross revenue',
            value: formatPrice(totalGross),
            sub: 'before platform fee',
            icon: Ship,
            color: 'text-slate-400',
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-slate-200 p-5">
            <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
            <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
            <div className="text-sm text-slate-500 leading-snug">{stat.label}</div>
            <div className="text-xs text-slate-400 mt-0.5">{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Monthly breakdown */}
      {monthlyData.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Monthly breakdown</h2>
          <div className="space-y-3">
            {monthlyData.map(([month, gross]) => {
              const pct = totalGross > 0 ? (gross / totalGross) * 100 : 0
              return (
                <div key={month} className="flex items-center gap-4">
                  <div className="w-24 text-sm text-slate-500 shrink-0">{month}</div>
                  <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-[#06b6d4] rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="w-24 text-sm font-semibold text-slate-900 text-right">
                    {formatPrice(hostShare(gross))}
                  </div>
                </div>
              )
            })}
          </div>
          <p className="text-xs text-slate-400 mt-4">Amounts shown after 15% platform fee. Payouts processed via Stripe.</p>
        </div>
      )}

      {/* Transaction history */}
      {allBookings.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">Transaction history</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left p-3 font-semibold text-slate-600">Boat</th>
                <th className="text-left p-3 font-semibold text-slate-600">Date</th>
                <th className="text-right p-3 font-semibold text-slate-600">Gross</th>
                <th className="text-right p-3 font-semibold text-slate-600">Your earnings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {allBookings.map((booking) => {
                const boat = booking.boats as any
                return (
                  <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 text-slate-700">{boat?.name}</td>
                    <td className="p-3 text-slate-500">
                      {new Date(booking.start_datetime).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </td>
                    <td className="p-3 text-right text-slate-500">
                      {formatPrice(booking.total, booking.currency)}
                    </td>
                    <td className="p-3 text-right font-semibold text-slate-900">
                      {formatPrice(hostShare(booking.total ?? 0), booking.currency)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-16 text-slate-500">
          No earnings yet. Your confirmed bookings will appear here.
        </div>
      )}
    </div>
  )
}
