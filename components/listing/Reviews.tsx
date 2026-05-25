import { Star } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { Review, Profile } from '@/types/database'

interface ReviewWithReviewer extends Review {
  profiles: Pick<Profile, 'full_name' | 'avatar_url'>
}

interface ReviewsProps {
  reviews: ReviewWithReviewer[]
  avgRating: number
}

function RatingStars({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${size === 'lg' ? 'w-5 h-5' : 'w-3.5 h-3.5'} ${
            i <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
          }`}
        />
      ))}
    </div>
  )
}

export default function Reviews({ reviews, avgRating }: ReviewsProps) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <Star className="w-8 h-8 mx-auto mb-2 text-slate-300" />
        <p>No reviews yet — be the first to book!</p>
      </div>
    )
  }

  return (
    <div>
      {/* Summary */}
      <div className="flex items-center gap-4 mb-6 p-4 bg-slate-50 rounded-xl">
        <div className="text-center">
          <div className="text-4xl font-bold text-slate-900">{avgRating.toFixed(1)}</div>
          <RatingStars rating={Math.round(avgRating)} size="lg" />
          <div className="text-xs text-slate-500 mt-1">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</div>
        </div>
        <div className="flex-1 space-y-1.5">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = reviews.filter((r) => r.rating === star).length
            const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0
            return (
              <div key={star} className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 w-3">{star}</span>
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-slate-400 w-3">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Individual reviews */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reviews.map((review) => (
          <div key={review.id} className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#06b6d4] flex items-center justify-center text-white text-sm font-bold shrink-0">
                {review.profiles.full_name?.[0]?.toUpperCase() ?? 'G'}
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  {review.profiles.full_name ?? 'Guest'}
                </div>
                <div className="text-xs text-slate-500">
                  {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                </div>
              </div>
              <div className="ml-auto">
                <RatingStars rating={review.rating} />
              </div>
            </div>
            {review.body && (
              <p className="text-sm text-slate-600 leading-relaxed">{review.body}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
