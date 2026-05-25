'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { SlidersHorizontal, Zap } from 'lucide-react'

const BOAT_TYPES = [
  { value: 'all', label: 'All types' },
  { value: 'motor_yacht', label: 'Motor yacht' },
  { value: 'catamaran', label: 'Catamaran' },
  { value: 'sailing', label: 'Sailing boat' },
  { value: 'speedboat', label: 'Speedboat' },
  { value: 'fishing', label: 'Fishing boat' },
  { value: 'rib', label: 'RIB' },
  { value: 'luxury', label: 'Luxury yacht' },
]

const CAPACITIES = [
  { value: 'any', label: 'Any size' },
  { value: '1', label: '1–4 guests' },
  { value: '5', label: '5–8 guests' },
  { value: '9', label: '9–12 guests' },
  { value: '13', label: '13+ guests' },
]

const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Top rated' },
]

export default function Filters() {
  const router = useRouter()
  const params = useSearchParams()

  function updateParam(key: string, value: string) {
    const p = new URLSearchParams(params.toString())
    if (value === 'all' || value === 'any' || value === 'recommended') {
      p.delete(key)
    } else {
      p.set(key, value)
    }
    router.push(`/search?${p.toString()}`)
  }

  const instantOnly = params.get('instant') === '1'

  return (
    <div className="flex flex-wrap items-center gap-3">
      <SlidersHorizontal className="w-4 h-4 text-slate-500" />

      <Select
        value={params.get('type') ?? 'all'}
        onValueChange={(v) => updateParam('type', v)}
      >
        <SelectTrigger className="w-[160px] h-9 text-sm">
          <SelectValue placeholder="Boat type" />
        </SelectTrigger>
        <SelectContent>
          {BOAT_TYPES.map((t) => (
            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={params.get('capacity') ?? 'any'}
        onValueChange={(v) => updateParam('capacity', v)}
      >
        <SelectTrigger className="w-[140px] h-9 text-sm">
          <SelectValue placeholder="Guests" />
        </SelectTrigger>
        <SelectContent>
          {CAPACITIES.map((c) => (
            <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={params.get('sort') ?? 'recommended'}
        onValueChange={(v) => updateParam('sort', v)}
      >
        <SelectTrigger className="w-[180px] h-9 text-sm">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((s) => (
            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant={instantOnly ? 'sea' : 'outline'}
        size="sm"
        onClick={() => {
          const p = new URLSearchParams(params.toString())
          if (instantOnly) p.delete('instant')
          else p.set('instant', '1')
          router.push(`/search?${p.toString()}`)
        }}
      >
        <Zap className="w-3.5 h-3.5" />
        Instant book
      </Button>
    </div>
  )
}
