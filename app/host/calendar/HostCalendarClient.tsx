'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/style.css'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { ChevronDown, Lock, Unlock, Loader2 } from 'lucide-react'

interface Boat { id: string; name: string; slug: string }
interface AvailabilityRow { date: string; status: string }
interface BookingRow { start: string; end: string; status: string }

export default function HostCalendarClient({
  boats,
  selectedBoat,
  availability,
  bookings,
}: {
  boats: Boat[]
  selectedBoat: Boat | null
  availability: AvailabilityRow[]
  bookings: BookingRow[]
}) {
  const router = useRouter()
  const [selected, setSelected] = useState<Date[]>([])
  const [isPending, startTransition] = useTransition()
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const blockedDates = availability
    .filter((a) => a.status === 'blocked')
    .map((a) => new Date(a.date))

  const bookedDates: Date[] = []
  for (const b of bookings) {
    const start = new Date(b.start)
    const end = new Date(b.end)
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      bookedDates.push(new Date(d))
    }
  }

  function switchBoat(boatId: string) {
    startTransition(() => {
      router.push(`/host/calendar?boat=${boatId}`)
    })
  }

  async function blockDates() {
    if (!selectedBoat || selected.length === 0) return
    setSaving(true)
    setMessage(null)
    const supabase = createClient()
    const rows = selected.map((d) => ({
      boat_id: selectedBoat.id,
      date: d.toISOString().slice(0, 10),
      status: 'blocked' as const,
    }))
    const { error } = await supabase.from('availability').upsert(rows, { onConflict: 'boat_id,date' })
    setSaving(false)
    if (error) {
      setMessage('Failed to block dates. Please try again.')
    } else {
      setMessage(`Blocked ${selected.length} date${selected.length > 1 ? 's' : ''}.`)
      setSelected([])
      router.refresh()
    }
  }

  async function unblockDates() {
    if (!selectedBoat || selected.length === 0) return
    setSaving(true)
    setMessage(null)
    const supabase = createClient()
    const dateStrings = selected.map((d) => d.toISOString().slice(0, 10))
    const { error } = await supabase
      .from('availability')
      .delete()
      .eq('boat_id', selectedBoat.id)
      .in('date', dateStrings)
      .eq('status', 'blocked')
    setSaving(false)
    if (error) {
      setMessage('Failed to unblock dates. Please try again.')
    } else {
      setMessage(`Unblocked ${selected.length} date${selected.length > 1 ? 's' : ''}.`)
      setSelected([])
      router.refresh()
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Calendar</h1>
          <p className="text-slate-500 mt-1">Block or unblock dates for your listings</p>
        </div>
      </div>

      {/* Boat selector */}
      {boats.length > 1 && (
        <div className="mb-6">
          <div className="relative inline-block">
            <select
              value={selectedBoat?.id ?? ''}
              onChange={(e) => switchBoat(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#06b6d4] cursor-pointer"
            >
              {boats.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      )}

      {!selectedBoat ? (
        <div className="text-center py-16 text-slate-500">
          You need to create a listing first to manage its calendar.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-4">
            <DayPicker
              mode="multiple"
              selected={selected}
              onSelect={(dates) => setSelected(dates ?? [])}
              disabled={[
                { before: new Date() },
                ...bookedDates,
              ]}
              modifiers={{
                blocked: blockedDates,
                booked: bookedDates,
              }}
              modifiersClassNames={{
                blocked: 'rdp-day-blocked',
                booked: 'rdp-day-booked',
              }}
              numberOfMonths={2}
            />

            <style>{`
              .rdp-day-blocked button { background: #fef3c7; color: #92400e; border-radius: 50%; }
              .rdp-day-booked button { background: #fee2e2; color: #991b1b; border-radius: 50%; pointer-events: none; }
            `}</style>

            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-500 border-t border-slate-100 pt-3">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#06b6d4]" />
                Selected
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-amber-100 border border-amber-200" />
                Blocked
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-100 border border-red-200" />
                Booked
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-slate-200" />
                Available
              </div>
            </div>
          </div>

          {/* Actions panel */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-900 mb-1">Selected dates</h3>
              <p className="text-sm text-slate-500 mb-4">
                {selected.length === 0
                  ? 'Click dates on the calendar to select them'
                  : `${selected.length} date${selected.length > 1 ? 's' : ''} selected`}
              </p>

              {selected.length > 0 && (
                <div className="mb-4 max-h-40 overflow-y-auto space-y-1">
                  {selected
                    .sort((a, b) => a.getTime() - b.getTime())
                    .map((d) => (
                      <div key={d.toISOString()} className="text-sm text-slate-600">
                        {d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </div>
                    ))}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Button
                  onClick={blockDates}
                  disabled={selected.length === 0 || saving}
                  variant="default"
                  className="w-full"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  Block dates
                </Button>
                <Button
                  onClick={unblockDates}
                  disabled={selected.length === 0 || saving}
                  variant="outline"
                  className="w-full"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Unlock className="w-4 h-4" />}
                  Unblock dates
                </Button>
              </div>

              {message && (
                <p className="mt-3 text-sm text-[#06b6d4] font-medium">{message}</p>
              )}
            </div>

            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 text-sm text-slate-600">
              <p className="font-medium text-slate-700 mb-1">Tips</p>
              <ul className="space-y-1 text-xs leading-relaxed">
                <li>• Select multiple dates then block or unblock them at once.</li>
                <li>• Red dates are booked — you cannot change those.</li>
                <li>• Yellow dates are blocked by you.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
