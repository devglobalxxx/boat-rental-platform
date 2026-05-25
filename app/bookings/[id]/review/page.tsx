'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'

export default function ReviewPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = createClient()

  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [body, setBody] = useState('')
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('bookings')
      .select('id, boat_id, boats(name, boat_images(storage_url, is_hero), profiles(id))')
      .eq('id', id)
      .single()
      .then(({ data }) => setBooking(data))
  }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!rating) return
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const boat = booking?.boats as any
    const { error: err } = await supabase.from('reviews').insert({
      booking_id: id,
      reviewer_id: user.id,
      reviewee_id: boat?.profiles?.id ?? '',
      boat_id: booking?.boat_id,
      rating,
      body: body.trim() || null,
      type: 'renter_review',
    })

    if (err) { setError(err.message); setLoading(false); return }

    // Mark booking completed
    await supabase.from('bookings').update({ status: 'completed' }).eq('id', id)

    router.push(`/bookings/${id}`)
  }

  const boat = booking?.boats as any
  const hero = boat?.boat_images?.find((i: any) => i.is_hero) ?? boat?.boat_images?.[0]

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">How was your trip?</h1>
      <p className="text-slate-500 mb-6">Your honest review helps other guests and rewards great hosts.</p>

      {boat && (
        <div className="flex gap-3 p-4 bg-slate-50 rounded-2xl mb-6">
          {hero && <img src={hero.storage_url} alt={boat.name} className="w-14 h-14 rounded-xl object-cover shrink-0" />}
          <div className="font-semibold text-slate-900 self-center">{boat.name}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Star rating */}
        <div>
          <label className="text-sm font-semibold text-slate-700 block mb-2">Overall rating *</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setRating(star)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-9 h-9 transition-colors ${
                    star <= (hovered || rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-200'
                  }`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <div className="text-sm text-slate-500 mt-1">
              {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][rating]}
            </div>
          )}
        </div>

        {/* Written review */}
        <div>
          <label className="text-sm font-semibold text-slate-700 block mb-2">Tell others about your experience</label>
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="What did you love? Was the boat as described? Would you recommend this host?"
            rows={5}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" variant="sea" size="lg" className="w-full" disabled={loading || !rating}>
          {loading ? 'Submitting…' : 'Submit review'}
        </Button>
      </form>
    </div>
  )
}
