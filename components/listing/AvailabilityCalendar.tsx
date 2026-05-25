'use client'

import { DayPicker } from 'react-day-picker'
import 'react-day-picker/style.css'

interface AvailabilityCalendarProps {
  bookedDates?: string[]
  blockedDates?: string[]
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  mode?: 'view' | 'select'
}

export default function AvailabilityCalendar({
  bookedDates = [],
  blockedDates = [],
  selected,
  onSelect,
  mode = 'select',
}: AvailabilityCalendarProps) {
  const disabled = [
    ...bookedDates.map((d) => new Date(d)),
    ...blockedDates.map((d) => new Date(d)),
    { before: new Date() },
  ]

  const pickerProps =
    mode === 'select'
      ? { mode: 'single' as const, selected, onSelect, disabled }
      : { disabled }

  return (
    <div className="rounded-xl border border-slate-200 p-4 bg-white">
      <DayPicker
        {...(pickerProps as any)}
        numberOfMonths={2}
      />
      <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#06b6d4]" />
          Selected
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-slate-200" />
          Unavailable
        </div>
      </div>
    </div>
  )
}
