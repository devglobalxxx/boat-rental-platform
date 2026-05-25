'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, Grid } from 'lucide-react'
import type { Database } from '@/types/database'

type BoatImage = Database['public']['Tables']['boat_images']['Row']

interface GalleryProps {
  images: BoatImage[]
  boatName: string
}

export default function Gallery({ images, boatName }: GalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const hero = images.find((i) => i.is_hero) ?? images[0]
  const rest = images.filter((i) => i.id !== hero?.id).slice(0, 4)

  if (!hero) return null

  return (
    <>
      {/* Grid */}
      <div className="grid grid-cols-4 grid-rows-2 gap-2 rounded-2xl overflow-hidden h-[420px]">
        {/* Hero — takes left half */}
        <button
          className="col-span-2 row-span-2 relative group overflow-hidden"
          onClick={() => setLightboxIndex(0)}
        >
          <Image
            src={hero.storage_url}
            alt={hero.alt ?? boatName}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            priority
            sizes="50vw"
          />
        </button>

        {/* Right grid — up to 4 thumbnails */}
        {rest.map((img, idx) => (
          <button
            key={img.id}
            className="relative group overflow-hidden"
            onClick={() => setLightboxIndex(idx + 1)}
          >
            <Image
              src={img.storage_url}
              alt={img.alt ?? `${boatName} photo ${idx + 2}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="25vw"
            />
            {/* Show all button on last thumbnail */}
            {idx === 3 && images.length > 5 && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-1.5 text-white text-sm font-semibold">
                <Grid className="w-4 h-4" />
                +{images.length - 5} more
              </div>
            )}
          </button>
        ))}

        {/* Show-all trigger if < 4 thumbnails */}
        {rest.length === 0 && images.length > 1 && (
          <button
            className="col-span-2 row-span-2 relative group overflow-hidden"
            onClick={() => setLightboxIndex(1)}
          >
            <Image src={images[1].storage_url} alt={images[1].alt ?? boatName} fill className="object-cover" sizes="50vw" />
          </button>
        )}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={() => setLightboxIndex(null)}>
          <button className="absolute top-4 right-4 text-white hover:text-slate-300 transition-colors z-10" onClick={() => setLightboxIndex(null)}>
            <X className="w-8 h-8" />
          </button>
          <button
            className="absolute left-4 text-white hover:text-slate-300 transition-colors z-10 p-2"
            onClick={(e) => { e.stopPropagation(); setLightboxIndex(Math.max(0, lightboxIndex - 1)) }}
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button
            className="absolute right-4 text-white hover:text-slate-300 transition-colors z-10 p-2"
            onClick={(e) => { e.stopPropagation(); setLightboxIndex(Math.min(images.length - 1, lightboxIndex + 1)) }}
          >
            <ChevronRight className="w-8 h-8" />
          </button>
          <div className="relative w-full max-w-5xl max-h-[85vh] mx-8" onClick={(e) => e.stopPropagation()}>
            <Image
              src={images[lightboxIndex].storage_url}
              alt={images[lightboxIndex].alt ?? boatName}
              width={1200}
              height={800}
              className="object-contain w-full h-full max-h-[85vh] rounded-xl"
            />
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
            {lightboxIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  )
}
