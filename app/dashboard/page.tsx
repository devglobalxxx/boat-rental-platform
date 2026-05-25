import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils/pricing'
import { Calendar, Clock, CheckCircle, XCircle, Ship, MessageSquare } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const STATUS_CONFIG = {
  pending: { label: 'Pending', variant: 'warning' as const, icon: Clock },
  confirmed: { label: 'Confirmed', variant: 'success' as const, icon: CheckCircle },
  cancelled: { label: 'Cancelled', variant: 'destructive' as const, icon: XCircle },
  completed: { label: 'Completed', variant: 'outline' as const, icon: CheckCircle },
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/dashboard')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      id, status, start_datetime, end_datetime, guests_count, total, currency,
      boats(name, slug, boat_images(storage_url, is_hero), locations(city, country))
    `)
    .eq('renter_id', user.id)
    .order('start_datetime', { ascending: false })
    .limit(10)

  const upcoming = (bookings ?? []).filter((b) => new Date(b.start_datetime) >= new Date() && b.status !== 'cancelled')
  const past = (bookings ?? []).filter((b) => new Date(b.start_datetime) < new Date() || b.status === 'completed')

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}!
          </h1>
          <p className="text-slate-500 mt-1">Manage your trips and messages</p>
        </div>
        <Button asChild variant="sea">
          <Link href="/search">Find a boat</Link>
        </Button>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { href: '/dashboard', label: 'Trips', icon: Ship, count: bookings?.length },
          { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare, count: 0 },
          { href: '/host', label: 'Host dashboard', icon: Calendar, count: null },
          { href: '/become-a-host', label: 'List a boat', icon: Ship, count: null },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-slate-200 hover:border-[#06b6d4] hover:shadow-sm transition-all text-center"
          >
            <item.icon className="w-6 h-6 text-[#06b6d4]" />
            <span className="text-sm font-medium text-slate-700">{item.label}</span>
            {item.count !== null && item.count !== undefined && (
              <span className="text-xs text-slate-500">{item.count}</span>
            )}
          </Link>
        ))}
      </div>

      {/* Upcoming trips */}
      {upcoming.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Upcoming trips</h2>
          <div className="space-y-3">
            {upcoming.map((booking) => {
              const boat = booking.boats as any
              const hero = boat?.boat_images?.find((i: any) => i.is_hero) ?? boat?.boat_images?.[0]
              const cfg = STATUS_CONFIG[booking.status as keyof typeof STATUS_CONFIG]
              return (
                <Link
                  key={booking.id}
                  href={`/bookings/${booking.id}`}
                  className="flex gap-4 p-4 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all"
                >
                  {hero && (
                    <img src={hero.storage_url} alt={boat?.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-semibold text-slate-900 truncate">{boat?.name}</div>
                      <Badge variant={cfg.variant}>{cfg.label}</Badge>
                    </div>
                    <div className="text-sm text-slate-500 mt-1">
                      {new Date(booking.start_datetime).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long' })}
                      {' · '}{booking.guests_count} guests
                      {' · '}{boat?.locations?.city}
                    </div>
                    <div className="text-sm font-semibold text-slate-900 mt-1">
                      {formatPrice(booking.total, booking.currency)}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Past trips */}
      {past.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4">Past trips</h2>
          <div className="space-y-3">
            {past.map((booking) => {
              const boat = booking.boats as any
              const hero = boat?.boat_images?.find((i: any) => i.is_hero) ?? boat?.boat_images?.[0]
              const cfg = STATUS_CONFIG[booking.status as keyof typeof STATUS_CONFIG]
              return (
                <Link
                  key={booking.id}
                  href={`/bookings/${booking.id}`}
                  className="flex gap-4 p-4 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition-all opacity-75 hover:opacity-100"
                >
                  {hero && (
                    <img src={hero.storage_url} alt={boat?.name} className="w-16 h-16 rounded-xl object-cover shrink-0 grayscale" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-semibold text-slate-900 truncate">{boat?.name}</div>
                      <Badge variant={cfg.variant}>{cfg.label}</Badge>
                    </div>
                    <div className="text-sm text-slate-500 mt-1">
                      {new Date(booking.start_datetime).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {!bookings?.length && (
        <div className="text-center py-16">
          <Ship className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-slate-900 mb-2">No trips yet</h2>
          <p className="text-slate-500 mb-6">Find the perfect boat for your next adventure.</p>
          <Button asChild variant="sea">
            <Link href="/search">Explore boats</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
