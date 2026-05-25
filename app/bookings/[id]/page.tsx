import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils/pricing'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, Clock, XCircle, Calendar, Users, MessageSquare, Star } from 'lucide-react'

const STATUS_CONFIG = {
  pending: { label: 'Pending payment', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  confirmed: { label: 'Confirmed', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  cancelled: { label: 'Cancelled', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
  completed: { label: 'Completed', icon: CheckCircle, color: 'text-slate-600', bg: 'bg-slate-50' },
}

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ confirmed?: string }>
}

export default async function BookingDetailPage({ params, searchParams }: Props) {
  const { id } = await params
  const sp = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/bookings/${id}`)

  const { data: booking } = await supabase
    .from('bookings')
    .select(`
      *,
      boats(name, slug, includes_skipper, includes_fuel, boat_images(storage_url, is_hero), locations(city, country), profiles(full_name))
    `)
    .eq('id', id)
    .single()

  if (!booking) notFound()

  // Ensure user is renter or host of the boat
  const boat = booking.boats as any
  if (booking.renter_id !== user.id) redirect('/dashboard')

  const cfg = STATUS_CONFIG[booking.status as keyof typeof STATUS_CONFIG]

  // Check if review already written
  const { data: existingReview } = await supabase
    .from('reviews')
    .select('id')
    .eq('booking_id', id)
    .eq('reviewer_id', user.id)
    .maybeSingle()

  const hero = boat?.boat_images?.find((i: any) => i.is_hero) ?? boat?.boat_images?.[0]
  const canReview = booking.status === 'completed' && !existingReview

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {sp.confirmed && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <div className="font-semibold text-emerald-900">Booking confirmed!</div>
            <div className="text-sm text-emerald-700 mt-0.5">You&apos;ll receive a confirmation email shortly.</div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Booking details</h1>
        <Link href="/dashboard" className="text-sm text-[#06b6d4] hover:text-[#0891b2] font-medium">← My trips</Link>
      </div>

      {/* Status */}
      <div className={`flex items-center gap-3 p-4 rounded-2xl mb-6 ${cfg.bg}`}>
        <cfg.icon className={`w-5 h-5 ${cfg.color} shrink-0`} />
        <div>
          <div className={`font-semibold ${cfg.color}`}>{cfg.label}</div>
          <div className="text-sm text-slate-500 mt-0.5">
            Booking ref: <code className="font-mono text-xs">{booking.id.slice(0, 8).toUpperCase()}</code>
          </div>
        </div>
      </div>

      {/* Boat summary */}
      <div className="flex gap-4 p-4 bg-slate-50 rounded-2xl mb-6">
        {hero && (
          <img src={hero.storage_url} alt={boat?.name} className="w-20 h-20 rounded-xl object-cover shrink-0" />
        )}
        <div>
          <div className="font-bold text-slate-900">{boat?.name}</div>
          <div className="text-sm text-slate-500 mt-1">{boat?.locations?.city}, {boat?.locations?.country}</div>
          <Link href={`/boats/${boat?.slug}`} className="text-xs text-[#06b6d4] hover:text-[#0891b2] mt-1 inline-block">View listing →</Link>
        </div>
      </div>

      {/* Trip details */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 space-y-4">
        <h2 className="font-bold text-slate-900">Trip details</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-slate-500 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Date</div>
            <div className="font-medium text-slate-900 mt-1">
              {new Date(booking.start_datetime).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
          <div>
            <div className="text-slate-500 flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Guests</div>
            <div className="font-medium text-slate-900 mt-1">{booking.guests_count}</div>
          </div>
          {booking.duration_hours && (
            <div>
              <div className="text-slate-500">Duration</div>
              <div className="font-medium text-slate-900 mt-1">{booking.duration_hours} hours</div>
            </div>
          )}
        </div>

        <Separator />

        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-slate-700">
            <span>Charter fee</span>
            <span>{formatPrice(booking.subtotal, booking.currency)}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Service fee</span>
            <span>{formatPrice(booking.service_fee, booking.currency)}</span>
          </div>
          <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-100">
            <span>Total paid</span>
            <span>{formatPrice(booking.total, booking.currency)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        {canReview && (
          <Button asChild variant="sea">
            <Link href={`/bookings/${id}/review`}>
              <Star className="w-4 h-4" /> Leave a review
            </Link>
          </Button>
        )}
        <Button asChild variant="outline">
          <Link href="/dashboard/messages">
            <MessageSquare className="w-4 h-4" /> Message host
          </Link>
        </Button>
        {booking.status === 'pending' && (
          <Button asChild variant="sea">
            <Link href={`/boats/${boat?.slug}/book`}>Complete payment</Link>
          </Button>
        )}
      </div>
    </div>
  )
}
