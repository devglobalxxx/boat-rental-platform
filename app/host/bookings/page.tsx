import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils/pricing'
import { Clock, CheckCircle, XCircle, Calendar, Users } from 'lucide-react'

const STATUS_CONFIG = {
  pending: { label: 'Pending', variant: 'warning' as const, icon: Clock },
  confirmed: { label: 'Confirmed', variant: 'success' as const, icon: CheckCircle },
  cancelled: { label: 'Cancelled', variant: 'destructive' as const, icon: XCircle },
  completed: { label: 'Completed', variant: 'outline' as const, icon: CheckCircle },
}

export default async function HostBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status: filterStatus } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/host/bookings')

  const { data: boats } = await supabase
    .from('boats')
    .select('id')
    .eq('host_id', user.id)

  const boatIds = (boats ?? []).map((b) => b.id)

  let query = supabase
    .from('bookings')
    .select(`
      id, status, start_datetime, end_datetime, duration_hours, guests_count,
      subtotal, service_fee, total, currency, special_requests, created_at,
      boats(name, slug),
      profiles!renter_id(full_name, avatar_url)
    `)
    .in('boat_id', boatIds.length ? boatIds : ['none'])
    .order('created_at', { ascending: false })

  if (filterStatus) {
    query = query.eq('status', filterStatus)
  }

  const { data: bookings } = await query.limit(50)

  const tabs = [
    { label: 'All', href: '/host/bookings' },
    { label: 'Pending', href: '/host/bookings?status=pending' },
    { label: 'Confirmed', href: '/host/bookings?status=confirmed' },
    { label: 'Completed', href: '/host/bookings?status=completed' },
    { label: 'Cancelled', href: '/host/bookings?status=cancelled' },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Bookings</h1>

      {/* Status filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const active = tab.href === `/host/bookings${filterStatus ? `?status=${filterStatus}` : ''}`
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                active
                  ? 'bg-[#0f2547] text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>

      {!bookings?.length ? (
        <div className="text-center py-16 text-slate-500">
          No bookings found.
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => {
            const boat = booking.boats as any
            const renter = (booking as any).profiles
            const cfg = STATUS_CONFIG[booking.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending
            return (
              <div key={booking.id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-slate-300 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <Link
                          href={`/boats/${boat?.slug}`}
                          className="font-semibold text-slate-900 hover:text-[#06b6d4] transition-colors"
                        >
                          {boat?.name}
                        </Link>
                        <div className="text-sm text-slate-500 mt-0.5">
                          Renter: {renter?.full_name ?? 'Guest'}
                        </div>
                      </div>
                      <Badge variant={cfg.variant}>{cfg.label}</Badge>
                    </div>

                    <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {new Date(booking.start_datetime).toLocaleDateString('en-GB', {
                          weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
                        })}
                        {' · '}{booking.duration_hours}h
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-slate-400" />
                        {booking.guests_count} guests
                      </span>
                    </div>

                    {booking.special_requests && (
                      <p className="mt-2 text-sm text-slate-500 italic">"{booking.special_requests}"</p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-bold text-slate-900 text-lg">
                      {formatPrice(booking.total, booking.currency)}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Booked {new Date(booking.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </div>
                    {booking.status === 'pending' && (
                      <div className="flex gap-2 mt-3 justify-end">
                        <form action={`/api/host/bookings/${booking.id}/confirm`} method="POST">
                          <Button type="submit" size="sm" variant="sea">Accept</Button>
                        </form>
                        <form action={`/api/host/bookings/${booking.id}/decline`} method="POST">
                          <Button type="submit" size="sm" variant="outline">Decline</Button>
                        </form>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
