import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils/pricing'
import { Plus, Settings, Calendar, BarChart3, Ship, Clock, CheckCircle } from 'lucide-react'

export default async function HostDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/host')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, stripe_account_id')
    .eq('id', user.id)
    .single()

  // Get host's boats
  const { data: boats } = await supabase
    .from('boats')
    .select('id, name, slug, status, capacity_pax, type, boat_images(storage_url, is_hero)')
    .eq('host_id', user.id)
    .order('created_at', { ascending: false })

  // Get recent bookings for host's boats
  const boatIds = (boats ?? []).map((b) => b.id)
  const { data: bookings } = boatIds.length > 0
    ? await supabase
        .from('bookings')
        .select('id, status, start_datetime, guests_count, total, currency, boats(name, slug)')
        .in('boat_id', boatIds)
        .order('created_at', { ascending: false })
        .limit(10)
    : { data: [] }

  const totalRevenue = (bookings ?? [])
    .filter((b) => b.status === 'confirmed' || b.status === 'completed')
    .reduce((sum, b) => sum + (b.total ?? 0), 0)

  const pendingBookings = (bookings ?? []).filter((b) => b.status === 'pending').length

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Host Dashboard</h1>
          <p className="text-slate-500 mt-1">Manage your fleet and bookings</p>
        </div>
        <Button asChild variant="sea">
          <Link href="/host/listings/new"><Plus className="w-4 h-4" /> Add listing</Link>
        </Button>
      </div>

      {/* Stripe Connect alert */}
      {!profile?.stripe_account_id && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-4">
          <div>
            <div className="font-semibold text-amber-900">Set up payouts</div>
            <div className="text-sm text-amber-700 mt-0.5">Connect your bank account via Stripe to receive booking payments.</div>
          </div>
          <Button asChild variant="default" size="sm">
            <Link href="/host/onboarding">Set up now</Link>
          </Button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total listings', value: boats?.length ?? 0, icon: Ship },
          { label: 'Active listings', value: (boats ?? []).filter((b) => b.status === 'active').length, icon: CheckCircle },
          { label: 'Pending bookings', value: pendingBookings, icon: Clock },
          { label: 'Total revenue', value: formatPrice(totalRevenue), icon: BarChart3 },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-slate-200 p-5">
            <stat.icon className="w-5 h-5 text-[#06b6d4] mb-2" />
            <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
            <div className="text-sm text-slate-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Listings */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Your listings</h2>
          <Link href="/host/listings" className="text-sm text-[#06b6d4] hover:text-[#0891b2] font-medium">View all</Link>
        </div>

        {!boats?.length ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <Ship className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 mb-4">No listings yet</p>
            <Button asChild variant="sea">
              <Link href="/host/listings/new"><Plus className="w-4 h-4" /> Create your first listing</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {boats.slice(0, 6).map((boat) => {
              const hero = (boat.boat_images as any[])?.find((i: any) => i.is_hero) ?? (boat.boat_images as any[])?.[0]
              return (
                <div key={boat.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="relative aspect-video bg-slate-100">
                    {hero && <img src={hero.storage_url} alt={boat.name} className="w-full h-full object-cover" />}
                    <div className="absolute top-2 right-2">
                      <Badge variant={boat.status === 'active' ? 'success' : boat.status === 'paused' ? 'warning' : 'outline'}>
                        {boat.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="font-semibold text-slate-900 truncate">{boat.name}</div>
                    <div className="text-xs text-slate-500 mt-1">{boat.capacity_pax} guests · {boat.type.replace('_', ' ')}</div>
                    <div className="flex gap-2 mt-3">
                      <Button asChild variant="outline" size="sm" className="flex-1">
                        <Link href={`/host/listings/${boat.id}`}><Settings className="w-3.5 h-3.5" /> Edit</Link>
                      </Button>
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/host/calendar?boat=${boat.id}`}><Calendar className="w-3.5 h-3.5" /></Link>
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Recent bookings */}
      {(bookings ?? []).length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Recent bookings</h2>
            <Link href="/host/bookings" className="text-sm text-[#06b6d4] hover:text-[#0891b2] font-medium">View all</Link>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left p-3 font-semibold text-slate-700">Boat</th>
                  <th className="text-left p-3 font-semibold text-slate-700">Date</th>
                  <th className="text-left p-3 font-semibold text-slate-700">Guests</th>
                  <th className="text-left p-3 font-semibold text-slate-700">Status</th>
                  <th className="text-right p-3 font-semibold text-slate-700">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(bookings ?? []).slice(0, 8).map((booking) => {
                  const boat = booking.boats as any
                  const cfg = { pending: 'warning', confirmed: 'success', cancelled: 'destructive', completed: 'outline' }
                  return (
                    <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 text-slate-700">{boat?.name}</td>
                      <td className="p-3 text-slate-500">
                        {new Date(booking.start_datetime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </td>
                      <td className="p-3 text-slate-500">{booking.guests_count}</td>
                      <td className="p-3">
                        <Badge variant={cfg[booking.status as keyof typeof cfg] as any}>{booking.status}</Badge>
                      </td>
                      <td className="p-3 text-right font-semibold text-slate-900">
                        {formatPrice(booking.total, booking.currency)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
