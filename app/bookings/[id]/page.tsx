import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils/pricing'
import { CheckCircle, Clock, XCircle, Calendar, Users, MessageSquare, Star } from 'lucide-react'

const gold = '#c9a84e'
const card = '#0c1828'
const border = 'rgba(201,168,78,0.15)'
const text = '#f4f4f2'
const muted = 'rgba(244,244,242,0.55)'
const dim = 'rgba(244,244,242,0.35)'

const STATUS_CONFIG = {
  pending:   { label: 'Awaiting host approval', Icon: Clock, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  bd: 'rgba(245,158,11,0.30)' },
  confirmed: { label: 'Confirmed',       Icon: CheckCircle,  color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   bd: 'rgba(34,197,94,0.30)' },
  cancelled: { label: 'Cancelled',       Icon: XCircle,      color: '#f87171', bg: 'rgba(248,113,113,0.10)', bd: 'rgba(248,113,113,0.28)' },
  completed: { label: 'Completed',       Icon: CheckCircle,  color: gold,      bg: 'rgba(201,168,78,0.10)',  bd: 'rgba(201,168,78,0.28)' },
}

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ confirmed?: string; requested?: string; paid?: string }>
}

export default async function BookingDetailPage({ params, searchParams }: Props) {
  const { id } = await params
  const sp = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/bookings/${id}`)

  const { data: booking } = await supabase
    .from('bookings')
    .select(`*, boats(name, slug, includes_skipper, includes_fuel, boat_images(storage_url, is_hero), locations(city, country), profiles(full_name))`)
    .eq('id', id)
    .single()

  if (!booking) notFound()

  const boat = booking.boats as any
  if (booking.renter_id !== user.id) redirect('/dashboard')

  const cfg = STATUS_CONFIG[booking.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending
  const { Icon } = cfg

  const { data: existingReview } = await supabase
    .from('reviews')
    .select('id')
    .eq('booking_id', id)
    .eq('reviewer_id', user.id)
    .maybeSingle()

  const hero = boat?.boat_images?.find((i: any) => i.is_hero) ?? boat?.boat_images?.[0]
  const canReview = booking.status === 'completed' && !existingReview

  return (
    <div style={{ background: '#07101e', minHeight: '100vh', color: text }}>
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '40px 20px 80px' }}>

        {sp.confirmed && (
          <div style={{ marginBottom: '24px', padding: '16px', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.30)', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CheckCircle style={{ width: 20, height: 20, color: '#22c55e', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, color: '#22c55e' }}>Booking confirmed!</div>
              <div style={{ fontSize: '13px', color: muted, marginTop: '2px' }}>You&apos;ll receive a confirmation email shortly.</div>
            </div>
          </div>
        )}

        {sp.requested && (
          <div style={{ marginBottom: '24px', padding: '16px', background: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.30)', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Clock style={{ width: 20, height: 20, color: '#f59e0b', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, color: '#f59e0b' }}>Request submitted!</div>
              <div style={{ fontSize: '13px', color: muted, marginTop: '2px' }}>The host has 24h to accept. Your card is <strong style={{ color: text }}>held, not charged</strong> — you&apos;re only charged once they confirm, and the hold is released automatically if they decline.</div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', gap: '12px', flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: text }}>Booking details</h1>
          <Link href="/dashboard" style={{ fontSize: '13px', color: gold, fontWeight: 600, textDecoration: 'none' }}>← My trips</Link>
        </div>

        {/* Status banner */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderRadius: '16px', marginBottom: '24px', background: cfg.bg, border: `1px solid ${cfg.bd}` }}>
          <Icon style={{ width: 20, height: 20, color: cfg.color, flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 700, color: cfg.color }}>{cfg.label}</div>
            <div style={{ fontSize: '13px', color: dim, marginTop: '2px' }}>
              Booking ref: <code style={{ fontFamily: 'monospace', fontSize: '12px' }}>{booking.id.slice(0, 8).toUpperCase()}</code>
            </div>
          </div>
        </div>

        {/* Boat summary */}
        <div style={{ display: 'flex', gap: '16px', padding: '16px', background: card, border: `1px solid ${border}`, borderRadius: '16px', marginBottom: '24px' }}>
          {hero && (
            <img src={hero.storage_url} alt={boat?.name} style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover', flexShrink: 0 }} />
          )}
          <div>
            <div style={{ fontWeight: 700, color: text, fontSize: '15px' }}>{boat?.name}</div>
            <div style={{ fontSize: '13px', color: muted, marginTop: '4px' }}>{boat?.locations?.city}, {boat?.locations?.country}</div>
            <Link href={`/boats/${boat?.slug}`} style={{ fontSize: '12px', color: gold, textDecoration: 'none', display: 'inline-block', marginTop: '4px' }}>View listing →</Link>
          </div>
        </div>

        {/* Trip details */}
        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
          <h2 style={{ fontWeight: 700, color: text, fontSize: '16px', marginBottom: '16px' }}>Trip details</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', fontSize: '14px', marginBottom: '20px' }}>
            <div>
              <div style={{ color: muted, display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar style={{ width: 13, height: 13 }} /> Date</div>
              <div style={{ fontWeight: 600, color: text, marginTop: '6px' }}>
                {new Date(booking.start_datetime).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
            <div>
              <div style={{ color: muted, display: 'flex', alignItems: 'center', gap: '4px' }}><Users style={{ width: 13, height: 13 }} /> Guests</div>
              <div style={{ fontWeight: 600, color: text, marginTop: '6px' }}>{booking.guests_count}</div>
            </div>
            {booking.duration_hours && (
              <div>
                <div style={{ color: muted }}>Duration</div>
                <div style={{ fontWeight: 600, color: text, marginTop: '6px' }}>{booking.duration_hours} hours</div>
              </div>
            )}
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '15px', fontWeight: 800, color: gold }}>
              <span>{(booking as { special_requests?: string | null }).special_requests?.startsWith('Price on request') ? 'Price' : 'Total'}</span>
              <span style={{ fontSize: '20px' }}>{(booking as { special_requests?: string | null }).special_requests?.startsWith('Price on request') ? 'On request' : formatPrice(booking.total, booking.currency)}</span>
            </div>
            <p style={{ fontSize: '12px', color: dim, margin: '4px 0 0' }}>{(booking as { special_requests?: string | null }).special_requests?.startsWith('Price on request') ? 'The owner will reply with a quote.' : 'All-inclusive · no extra fees'}</p>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {canReview && (
            <Link href={`/bookings/${id}/review`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '13px 24px', borderRadius: '99px', background: 'linear-gradient(135deg, #d4b05e 0%, #c9a84e 60%, #b8942e 100%)', color: '#07101e', fontSize: '14px', fontWeight: 700, textDecoration: 'none' }}>
              <Star style={{ width: 16, height: 16 }} /> Leave a review
            </Link>
          )}
          <Link href="/dashboard/messages" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '13px 24px', borderRadius: '99px', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: muted, fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
            <MessageSquare style={{ width: 16, height: 16 }} /> Message host
          </Link>
          {booking.status === 'pending' && !sp.paid && (
            (booking as { stripe_payment_intent_id?: string | null }).stripe_payment_intent_id?.startsWith('cs_') ? (
              <a href={`/api/bookings/${id}/pay`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px 24px', borderRadius: '99px', background: 'linear-gradient(135deg, #d4b05e 0%, #c9a84e 60%, #b8942e 100%)', color: '#07101e', fontSize: '15px', fontWeight: 700, textDecoration: 'none' }}>
                {(booking as { special_requests?: string | null }).special_requests?.startsWith('Offer sent') ? '💬 The owner sent an offer —' : '✅ Owner accepted —'} Pay {formatPrice(booking.total, booking.currency)} to confirm
              </a>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '13px 24px', borderRadius: '99px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.22)', color: '#f59e0b', fontSize: '13px', fontWeight: 600 }}>
                <Clock style={{ width: 15, height: 15 }} /> Waiting for the host to accept — we&apos;ll email you the moment they do
              </div>
            )
          )}
          {booking.status === 'pending' && (
            <form action={`/api/bookings/${id}/cancel`} method="POST">
              <button type="submit" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '13px 24px', borderRadius: '99px', background: 'transparent', border: '1px solid rgba(248,113,113,0.30)', color: 'rgba(248,113,113,0.9)', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                <XCircle style={{ width: 16, height: 16 }} /> Cancel request
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
