'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, Calendar, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SearchBarProps {
  defaultLocation?: string
  defaultDate?: string
  defaultGuests?: number
  compact?: boolean
}

export default function SearchBar({ defaultLocation = '', defaultDate = '', defaultGuests = 2, compact = false }: SearchBarProps) {
  const [location, setLocation] = useState(defaultLocation)
  const [date, setDate] = useState(defaultDate)
  const [guests, setGuests] = useState(defaultGuests)
  const router = useRouter()

  function handleSearch() {
    const params = new URLSearchParams()
    if (location) params.set('location', location)
    if (date) params.set('date', date)
    if (guests > 1) params.set('guests', String(guests))
    router.push(`/search?${params.toString()}`)
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2 bg-white rounded-full border border-slate-200 shadow-sm px-4 py-2">
        <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Where to?"
          className="flex-1 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none min-w-0"
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button onClick={handleSearch} className="w-8 h-8 bg-[#06b6d4] rounded-full flex items-center justify-center hover:bg-[#0891b2] transition-colors">
          <Search className="w-3.5 h-3.5 text-white" />
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-2 flex flex-col sm:flex-row gap-2">
      {/* Location */}
      <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 cursor-text transition-colors">
        <MapPin className="w-5 h-5 text-[#06b6d4] shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Where</div>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Destination, marina..."
            className="w-full text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
      </div>

      <div className="hidden sm:block w-px bg-slate-200 self-stretch my-2" />

      {/* Date */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 cursor-text transition-colors">
        <Calendar className="w-5 h-5 text-[#06b6d4] shrink-0" />
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">When</div>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="text-sm text-slate-900 focus:outline-none bg-transparent cursor-pointer"
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>

      <div className="hidden sm:block w-px bg-slate-200 self-stretch my-2" />

      {/* Guests */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors">
        <Users className="w-5 h-5 text-[#06b6d4] shrink-0" />
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Guests</div>
          <div className="flex items-center gap-2 mt-0.5">
            <button
              onClick={() => setGuests(Math.max(1, guests - 1))}
              className="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center text-sm hover:border-slate-400 transition-colors"
            >
              −
            </button>
            <span className="text-sm font-medium text-slate-900 w-4 text-center">{guests}</span>
            <button
              onClick={() => setGuests(guests + 1)}
              className="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center text-sm hover:border-slate-400 transition-colors"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Search button */}
      <Button onClick={handleSearch} variant="sea" size="lg" className="sm:self-center shrink-0">
        <Search className="w-4 h-4" />
        Search
      </Button>
    </div>
  )
}
