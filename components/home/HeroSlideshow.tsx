'use client'

import { useEffect, useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1528154291023-a6525fabe5b4?w=1920&q=80',
    caption: 'Marbella, Spain',
  },
  {
    image: 'https://images.unsplash.com/photo-1589642073293-d0d511afb66e?w=1920&q=80',
    caption: 'Puerto Banús marina',
  },
  {
    image: 'https://images.unsplash.com/photo-1507609613174-49e7b9ab7b09?w=1920&q=80',
    caption: 'Costa del Sol fleet',
  },
  {
    image: 'https://images.unsplash.com/photo-1535024966840-e7424dc2635b?w=1920&q=80',
    caption: 'Mediterranean charter',
  },
]

export default function HeroSlideshow() {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  const next = useCallback(() => setCurrent((c) => (c + 1) % SLIDES.length), [])
  const prev = useCallback(() => setCurrent((c) => (c - 1 + SLIDES.length) % SLIDES.length), [])

  useEffect(() => {
    if (paused) return
    const t = setInterval(next, 5000)
    return () => clearInterval(t)
  }, [paused, next])

  return (
    <div
      className="absolute inset-0"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides */}
      {SLIDES.map((slide, i) => (
        <div
          key={slide.image}
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
          style={{
            backgroundImage: `url(${slide.image})`,
            opacity: i === current ? 1 : 0,
          }}
        />
      ))}

      {/* Overlays */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to right, rgba(7,16,30,0.72) 0%, rgba(7,16,30,0.28) 60%, rgba(7,16,30,0.10) 100%)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to top, rgba(7,16,30,0.85) 0%, rgba(7,16,30,0.10) 50%, rgba(7,16,30,0.0) 100%)',
        }}
      />

      {/* Arrows */}
      <button
        onClick={prev}
        className="absolute left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all"
        style={{ background: 'rgba(7,16,30,0.55)', border: '1px solid rgba(201,168,78,0.25)', color: '#f4f4f2' }}
        aria-label="Previous"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all"
        style={{ background: 'rgba(7,16,30,0.55)', border: '1px solid rgba(201,168,78,0.25)', color: '#f4f4f2' }}
        aria-label="Next"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className="transition-all rounded-full"
            style={{
              width: i === current ? '24px' : '6px',
              height: '6px',
              background: i === current ? '#c9a84e' : 'rgba(244,244,242,0.35)',
            }}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Caption */}
      <div className="absolute bottom-10 right-6 text-xs font-medium tracking-widest uppercase" style={{ color: 'rgba(244,244,242,0.40)' }}>
        {SLIDES[current].caption}
      </div>
    </div>
  )
}
