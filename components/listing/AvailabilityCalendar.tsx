'use client'

import { DayPicker } from 'react-day-picker'

interface AvailabilityCalendarProps {
  bookedDates?: string[]
  blockedDates?: string[]
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  mode?: 'view' | 'select'
}

const gold = '#c9a84e'
const goldFaint = 'rgba(201,168,78,0.12)'
const goldBorder = 'rgba(201,168,78,0.30)'
const text = '#f4f4f2'
const muted = 'rgba(244,244,242,0.55)'
const card = '#0c1828'

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
    <div style={{ background: card, border: `1px solid ${goldBorder}`, borderRadius: '16px', padding: '20px' }}>
      <style dangerouslySetInnerHTML={{ __html: `
.rdp-root { color: ${text}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
.rdp-months { display: flex; gap: 48px; flex-wrap: wrap; justify-content: center; }
.rdp-month { margin: 0; min-width: 300px; }
.rdp-month_caption { display: flex; align-items: center; justify-content: center; padding: 4px 0 24px; font-size: 17px; font-weight: 800; color: ${text}; letter-spacing: -0.02em; position: relative; }
.rdp-nav { display: flex; gap: 8px; position: absolute; right: 0; top: -2px; }
.rdp-button_previous, .rdp-button_next { width: 36px; height: 36px; border-radius: 50%; background: ${goldFaint}; border: 1px solid ${goldBorder}; color: ${gold}; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
.rdp-button_previous:hover, .rdp-button_next:hover { background: ${gold}; color: #07101e; transform: scale(1.05); }
.rdp-button_previous svg, .rdp-button_next svg { width: 16px; height: 16px; fill: currentColor; }
.rdp-weekdays { display: grid; grid-template-columns: repeat(7, 1fr); margin-bottom: 8px; }
.rdp-weekday { font-size: 11px; font-weight: 800; color: ${gold}; text-transform: uppercase; letter-spacing: 0.10em; padding: 10px 0 14px; text-align: center; opacity: 0.85; }
.rdp-week { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; margin-bottom: 6px; }
.rdp-day { padding: 0; text-align: center; min-height: 46px; }
.rdp-day_button { width: 100%; height: 46px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.04); border-radius: 10px; color: ${text}; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.15s; letter-spacing: -0.01em; padding: 0; font-family: inherit; }
.rdp-day_button:hover:not([disabled]) { background: ${goldFaint}; border-color: ${goldBorder}; color: ${gold}; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(201,168,78,0.18); }
.rdp-today .rdp-day_button { color: ${gold}; font-weight: 800; border-color: ${goldBorder}; background: ${goldFaint}; position: relative; }
.rdp-today .rdp-day_button::after { content: ''; position: absolute; bottom: 4px; left: 50%; transform: translateX(-50%); width: 4px; height: 4px; border-radius: 50%; background: ${gold}; }
.rdp-selected .rdp-day_button, .rdp-day_button[aria-selected="true"] { background: linear-gradient(135deg, #d4b05e 0%, #c9a84e 60%, #b8942e 100%) !important; color: #07101e !important; font-weight: 800 !important; border-color: ${gold} !important; box-shadow: 0 6px 18px rgba(201,168,78,0.45); transform: translateY(-1px); }
.rdp-selected .rdp-day_button::after { display: none !important; }
.rdp-disabled .rdp-day_button, .rdp-day_button[disabled] { color: rgba(244,244,242,0.20) !important; text-decoration: line-through; cursor: not-allowed !important; background: rgba(244,244,242,0.02) !important; border-color: transparent !important; }
.rdp-disabled .rdp-day_button:hover, .rdp-day_button[disabled]:hover { transform: none !important; box-shadow: none !important; }
.rdp-outside { visibility: hidden; }
.rdp-chevron { display: inline-block; }
@media (max-width: 480px) {
  .rdp-months { gap: 28px; }
  .rdp-month { min-width: 0; width: 100%; }
  .rdp-day { min-height: 40px; }
  .rdp-day_button { height: 40px; font-size: 14px; }
  .rdp-weekday { font-size: 10px; padding: 8px 0 10px; }
  .rdp-month_caption { font-size: 15px; }
}
` }} />

      <DayPicker
        {...(pickerProps as any)}
        numberOfMonths={2}
        showOutsideDays={false}
      />

      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '18px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: muted }}>
          <div style={{ width: 14, height: 14, borderRadius: '4px', background: 'linear-gradient(135deg, #d4b05e 0%, #c9a84e 60%, #b8942e 100%)', boxShadow: '0 2px 6px rgba(201,168,78,0.30)' }} />
          <span style={{ color: text, fontWeight: 600 }}>Selected</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: muted }}>
          <div style={{ width: 14, height: 14, borderRadius: '4px', border: `1px solid ${goldBorder}`, background: 'transparent' }} />
          <span>Available</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: muted }}>
          <div style={{ width: 14, height: 14, borderRadius: '4px', background: 'rgba(244,244,242,0.06)', position: 'relative' }}>
            <div style={{ position: 'absolute', inset: '50%', height: '1px', background: 'rgba(244,244,242,0.30)', transform: 'translateY(-50%)' }} />
          </div>
          <span>Unavailable</span>
        </div>
      </div>
    </div>
  )
}
