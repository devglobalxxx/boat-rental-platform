'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { ChevronRight, ChevronLeft, Check } from 'lucide-react'
import type { Location } from '@/types/database'

interface WizardProps {
  locations: Pick<Location, 'id' | 'name' | 'city' | 'country'>[]
  initialData?: any
  boatId?: string
  /**
   * If set, this listing is created on behalf of the given user (admin concierge mode).
   * The boat's host_id will be this ID, not the current authenticated user's ID.
   * Server-side checks in the page already validate the caller is an admin.
   */
  targetHostId?: string
}

const STEPS = ['Basics', 'Specs & features', 'Pricing', 'Photos', 'Review & publish']

// Custom refund policy is stored as a namespaced boat_features row so it needs
// no DB migration. Anything after this prefix is the host's free-text policy.
export const REFUND_MARKER = '__REFUND_POLICY__::'

const BOAT_TYPES = [
  'motor_yacht', 'catamaran', 'sailing', 'speedboat', 'fishing', 'rib', 'luxury', 'jet_ski',
]

const COMMON_FEATURES = [
  'WiFi', 'Air conditioning', 'Paddleboard', 'Snorkel gear', 'Bluetooth speaker',
  'BBQ grill', 'Fishing gear', 'Inflatable toys', 'Waterski', 'Wakeboard',
  'Sun canopy', 'Fresh water shower', 'Tender/dinghy', 'Jet ski',
]

/* ── tokens ── */
const card    = '#0c1828'
const border  = 'rgba(201,168,78,0.18)'
const gold    = '#c9a84e'
const goldFaint = 'rgba(201,168,78,0.10)'
const goldBorder = 'rgba(201,168,78,0.28)'
const text    = '#f4f4f2'
const muted   = 'rgba(244,244,242,0.55)'
const dim     = 'rgba(244,244,242,0.35)'
const inputBg = 'rgba(255,255,255,0.05)'
const inputBorder = 'rgba(255,255,255,0.14)'

interface FormData {
  name: string; tagline: string; description: string; type: string; locationId: string
  departurePort: string; capacityPax: number; lengthM: string; cabins: number
  builder: string; modelYear: string; includesSkipper: boolean; includesFuel: boolean
  includesDrinks: boolean; instantBook: boolean; cancellationPolicy: string; cancellationCustom: string; minHours: number
  pricingType: string; selectedFeatures: string[]; pricing: { durationHours: number; price: string }[]
  images: File[]
}

const INITIAL: FormData = {
  name: '', tagline: '', description: '', type: 'motor_yacht', locationId: '', departurePort: '',
  capacityPax: 8, lengthM: '', cabins: 0, builder: '', modelYear: '', includesSkipper: true,
  includesFuel: true, includesDrinks: false, instantBook: false, cancellationPolicy: 'moderate', cancellationCustom: '',
  minHours: 2, pricingType: 'hourly', selectedFeatures: [],
  pricing: [{ durationHours: 2, price: '' }, { durationHours: 4, price: '' }, { durationHours: 8, price: '' }],
  images: [],
}

function formFromInitial(d?: any): FormData {
  if (!d) return INITIAL
  const allFeatures: string[] = (d.boat_features ?? []).map((f: any) => f.feature)
  // Pull the custom refund policy out of the features list (it's stored there to avoid a migration)
  const refundRow = allFeatures.find((f) => f.startsWith(REFUND_MARKER))
  const customRefund = refundRow ? refundRow.slice(REFUND_MARKER.length) : ''
  const visibleFeatures = allFeatures.filter((f) => !f.startsWith(REFUND_MARKER))
  return {
    name: d.name ?? '', tagline: d.tagline ?? '', description: d.description ?? '',
    type: d.type ?? 'motor_yacht', locationId: d.location_id ?? '',
    departurePort: d.departure_port ?? '', capacityPax: d.capacity_pax ?? 8,
    lengthM: d.length_m ? String(d.length_m) : '', cabins: d.cabins ?? 0,
    builder: d.builder ?? '', modelYear: d.model_year ? String(d.model_year) : '',
    includesSkipper: d.includes_skipper ?? true, includesFuel: d.includes_fuel ?? true,
    includesDrinks: d.includes_drinks ?? false, instantBook: d.instant_book ?? false,
    cancellationPolicy: customRefund ? 'custom' : (d.cancellation_policy ?? 'moderate'),
    cancellationCustom: customRefund,
    minHours: d.min_hours ?? 2,
    pricingType: d.pricing_type ?? 'hourly',
    selectedFeatures: visibleFeatures,
    pricing: (d.boat_pricing ?? []).length > 0
      ? (d.boat_pricing ?? []).map((p: any) => ({ durationHours: p.duration_hours, price: String(p.price) }))
      : INITIAL.pricing,
    images: [],
  }
}

/* ── shared field wrapper ── */
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <label style={{ fontSize: '13px', fontWeight: 600, color: text, letterSpacing: '0.01em' }}>
        {label}{required && <span style={{ color: gold, marginLeft: '3px' }}>*</span>}
      </label>
      {children}
    </div>
  )
}

/* ── dark-styled input override wrapper ── */
const inputStyle: React.CSSProperties = {
  background: inputBg,
  border: `1px solid ${inputBorder}`,
  borderRadius: '10px',
  color: text,
  fontSize: '14px',
  padding: '11px 14px',
  outline: 'none',
  width: '100%',
  transition: 'border-color 0.15s',
}

function DarkInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        ...inputStyle,
        ...props.style,
      }}
      onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = goldBorder }}
      onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = inputBorder }}
    />
  )
}

function DarkTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      style={{
        ...inputStyle,
        resize: 'vertical',
        minHeight: '120px',
        fontFamily: 'inherit',
        lineHeight: 1.6,
      }}
      onFocus={(e) => { e.target.style.borderColor = goldBorder }}
      onBlur={(e) => { e.target.style.borderColor = inputBorder }}
    />
  )
}

function DarkSelect({ value, onChange, children }: { value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        ...inputStyle,
        appearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(244,244,242,0.5)' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 14px center',
        paddingRight: '36px',
        cursor: 'pointer',
      }}
      onFocus={(e) => { e.target.style.borderColor = goldBorder }}
      onBlur={(e) => { e.target.style.borderColor = inputBorder }}
    >
      {children}
    </select>
  )
}

export default function ListingWizard({ locations, initialData, boatId, targetHostId }: WizardProps) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormData>(() => formFromInitial(initialData))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  function update(key: keyof FormData, value: any) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function toggleFeature(feat: string) {
    setForm((f) => ({
      ...f,
      selectedFeatures: f.selectedFeatures.includes(feat)
        ? f.selectedFeatures.filter((x) => x !== feat)
        : [...f.selectedFeatures, feat],
    }))
  }

  async function uploadImages(boatId: string): Promise<string[]> {
    const urls: string[] = []
    for (const file of form.images) {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('boatId', boatId)
      try {
        const res = await fetch('/api/upload-image', { method: 'POST', body: fd })
        const json = await res.json()
        if (json.url) urls.push(json.url)
      } catch {
        // skip failed upload, continue with others
      }
    }
    return urls
  }

  async function handlePublish() {
    setLoading(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const boatFields = {
        location_id: form.locationId, name: form.name, tagline: form.tagline || null,
        description: form.description || null, type: form.type as any,
        length_m: form.lengthM ? Number(form.lengthM) : null, capacity_pax: form.capacityPax,
        cabins: form.cabins || null, builder: form.builder || null,
        model_year: form.modelYear ? Number(form.modelYear) : null,
        departure_port: form.departurePort || null, includes_skipper: form.includesSkipper,
        includes_fuel: form.includesFuel, includes_drinks: form.includesDrinks,
        min_hours: form.minHours, pricing_type: form.pricingType as any,
        instant_book: form.instantBook,
        // 'custom' isn't a DB enum value — store 'strict' as the safe base; the real
        // custom terms live in a boat_features marker row (see below).
        cancellation_policy: (form.cancellationPolicy === 'custom' ? 'strict' : form.cancellationPolicy) as any,
      }

      let targetBoatId: string

      if (boatId) {
        const { error: updateErr } = await supabase.from('boats').update(boatFields).eq('id', boatId)
        if (updateErr) throw new Error(updateErr.message)
        targetBoatId = boatId
        await supabase.from('boat_pricing').delete().eq('boat_id', boatId)
      } else {
        const slug = form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now()
        // For admin concierge mode, route through API so server-side service role can set arbitrary host_id
        if (targetHostId) {
          const res = await fetch('/api/admin/create-listing', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ hostId: targetHostId, slug, status: 'draft', ...boatFields }),
          })
          const json = await res.json()
          if (!res.ok || !json.id) throw new Error(json.error ?? 'Failed to create listing')
          targetBoatId = json.id
        } else {
          const { data: boat, error: boatErr } = await supabase
            .from('boats').insert({ host_id: user.id, slug, status: 'draft', ...boatFields })
            .select('id').single()
          if (boatErr || !boat) throw new Error(boatErr?.message ?? 'Failed to create listing')
          targetBoatId = boat.id
        }
      }

      const pricingRecords = form.pricing
        .filter((p) => p.price && Number(p.price) > 0)
        .map((p) => ({ boat_id: targetBoatId, duration_hours: p.durationHours, price: Number(p.price), currency: 'EUR', season: 'all' as const }))
      if (pricingRecords.length > 0) await supabase.from('boat_pricing').insert(pricingRecords)

      if (boatId) await supabase.from('boat_features').delete().eq('boat_id', boatId)
      const featureRows = form.selectedFeatures.map((f) => ({ boat_id: targetBoatId, feature: f }))
      // Persist a custom refund policy as a namespaced feature row (no migration needed)
      if (form.cancellationPolicy === 'custom' && form.cancellationCustom.trim()) {
        featureRows.push({ boat_id: targetBoatId, feature: REFUND_MARKER + form.cancellationCustom.trim() })
      }
      if (featureRows.length > 0) {
        await supabase.from('boat_features').insert(featureRows)
      }

      if (form.images.length > 0) {
        const urls = await uploadImages(targetBoatId)
        const existingCount = initialData?.boat_images?.length ?? 0
        await supabase.from('boat_images').insert(
          urls.map((url, i) => ({ boat_id: targetBoatId, storage_url: url, alt: `${form.name} photo ${existingCount + i + 1}`, sort_order: existingCount + i, is_hero: existingCount === 0 && i === 0 }))
        )
      }

      // Auto-activate only when the actual host is publishing.
      // Admin concierge listings stay as drafts so the host can review & activate themselves.
      if (pricingRecords.length > 0 && !targetHostId) {
        await supabase.from('boats').update({ status: 'active' }).eq('id', targetBoatId)
      }
      router.push('/host')
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div>
      {/* ── Step indicator ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px', overflowX: 'auto', paddingBottom: '4px' }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: 700, transition: 'all 0.2s',
              background: i < step ? '#22c55e' : i === step ? gold : 'rgba(255,255,255,0.10)',
              color: i < step || i === step ? '#07101e' : muted,
              border: i === step ? `2px solid ${gold}` : '2px solid transparent',
            }}>
              {i < step ? <Check style={{ width: 14, height: 14 }} /> : i + 1}
            </div>
            <span style={{ fontSize: '13px', fontWeight: i === step ? 700 : 400, color: i === step ? text : muted }}>
              {s}
            </span>
            {i < STEPS.length - 1 && (
              <ChevronRight style={{ width: 16, height: 16, color: dim, flexShrink: 0 }} />
            )}
          </div>
        ))}
      </div>

      {/* ── Step content ── */}
      <div style={{ background: card, borderRadius: '16px', border: `1px solid ${border}`, padding: '28px 24px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* ── Step 0: Basics ── */}
        {step === 0 && (
          <>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: text, marginBottom: '4px' }}>Tell guests about your boat</h2>
            <Field label="Listing name" required>
              <DarkInput value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="e.g. Azimut 40 – Sun Seeker" />
            </Field>
            <Field label="Tagline">
              <DarkInput value={form.tagline} onChange={(e) => update('tagline', e.target.value)} placeholder="Short catchy description (optional)" />
            </Field>
            <Field label="Full description">
              <DarkTextarea value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Describe the boat, the experience, what to expect…" rows={5} />
            </Field>
            <Field label="Boat type" required>
              <DarkSelect value={form.type} onChange={(v) => update('type', v)}>
                {BOAT_TYPES.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
              </DarkSelect>
            </Field>
            <Field label="Location" required>
              <DarkSelect value={form.locationId} onChange={(v) => update('locationId', v)}>
                <option value="">Select a city</option>
                {locations.map((loc) => <option key={loc.id} value={loc.id}>{loc.city}, {loc.country}</option>)}
              </DarkSelect>
            </Field>
            <Field label="Departure port / marina">
              <DarkInput value={form.departurePort} onChange={(e) => update('departurePort', e.target.value)} placeholder="e.g. Puerto Banús, Marbella" />
            </Field>
          </>
        )}

        {/* ── Step 1: Specs & features ── */}
        {step === 1 && (
          <>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: text, marginBottom: '4px' }}>Boat specifications</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Field label="Max guests" required>
                <DarkInput type="number" value={form.capacityPax} onChange={(e) => update('capacityPax', Number(e.target.value))} min={1} max={100} />
              </Field>
              <Field label="Length (m)">
                <DarkInput type="number" value={form.lengthM} onChange={(e) => update('lengthM', e.target.value)} step={0.1} min={1} placeholder="12.5" />
              </Field>
              <Field label="Cabins">
                <DarkInput type="number" value={form.cabins} onChange={(e) => update('cabins', Number(e.target.value))} min={0} />
              </Field>
              <Field label="Builder / brand">
                <DarkInput value={form.builder} onChange={(e) => update('builder', e.target.value)} placeholder="Azimut, Sunseeker…" />
              </Field>
              <Field label="Model year">
                <DarkInput type="number" value={form.modelYear} onChange={(e) => update('modelYear', e.target.value)} min={1970} max={2030} placeholder="2019" />
              </Field>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: text }}>What&apos;s included?</label>
              {[
                { key: 'includesSkipper', label: 'Licensed skipper' },
                { key: 'includesFuel', label: 'Fuel' },
                { key: 'includesDrinks', label: 'Drinks & snacks' },
                { key: 'instantBook', label: 'Instant book (guests book without approval)' },
              ].map((opt) => (
                <label key={opt.key} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <div
                    style={{
                      width: '20px', height: '20px', borderRadius: '6px', flexShrink: 0,
                      border: `2px solid ${form[opt.key as keyof FormData] ? gold : inputBorder}`,
                      background: form[opt.key as keyof FormData] ? goldFaint : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}
                    onClick={() => update(opt.key as keyof FormData, !form[opt.key as keyof FormData])}
                  >
                    {form[opt.key as keyof FormData] && <Check style={{ width: 12, height: 12, color: gold }} />}
                  </div>
                  <span style={{ fontSize: '14px', color: text }}>{opt.label}</span>
                </label>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: text }}>Amenities</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {COMMON_FEATURES.map((feat) => {
                  const active = form.selectedFeatures.includes(feat)
                  return (
                    <button
                      key={feat}
                      type="button"
                      onClick={() => toggleFeature(feat)}
                      style={{
                        padding: '7px 14px', borderRadius: '99px', fontSize: '13px', cursor: 'pointer',
                        transition: 'all 0.15s', fontWeight: active ? 600 : 400,
                        background: active ? goldFaint : 'transparent',
                        border: `1px solid ${active ? gold : inputBorder}`,
                        color: active ? gold : muted,
                      }}
                    >
                      {feat}
                    </button>
                  )
                })}
              </div>
            </div>
          </>
        )}

        {/* ── Step 2: Pricing ── */}
        {step === 2 && (
          <>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: text, marginBottom: '4px' }}>Set your prices</h2>

            {/* ── Cancellation / refund policy ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: text }}>
                Cancellation &amp; refund policy
              </label>
              <p style={{ fontSize: '12px', color: dim, margin: '-4px 0 4px' }}>Choose a standard policy or set your own custom refund terms.</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
                {[
                  { v: 'flexible', label: 'Flexible',  desc: 'Full refund up to 24h before departure.' },
                  { v: 'moderate', label: 'Moderate',  desc: 'Full refund up to 5 days before.' },
                  { v: 'strict',   label: 'Strict',    desc: '50% refund up to 14 days before.' },
                  { v: 'custom',   label: '✍️ Custom', desc: 'Define your own refund terms.' },
                ].map((opt) => {
                  const active = form.cancellationPolicy === opt.v
                  return (
                    <button
                      key={opt.v}
                      type="button"
                      onClick={() => update('cancellationPolicy', opt.v)}
                      style={{
                        textAlign: 'left', padding: '14px 14px', borderRadius: '12px', cursor: 'pointer',
                        background: active ? goldFaint : 'transparent',
                        border: `1.5px solid ${active ? gold : inputBorder}`,
                        transition: 'all 0.15s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: active ? gold : text }}>{opt.label}</span>
                        <span style={{ width: '16px', height: '16px', borderRadius: '50%', border: `2px solid ${active ? gold : inputBorder}`, background: active ? gold : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {active && <Check style={{ width: 10, height: 10, color: '#07101e' }} />}
                        </span>
                      </div>
                      <p style={{ fontSize: '12px', color: muted, lineHeight: 1.5, margin: 0 }}>{opt.desc}</p>
                    </button>
                  )
                })}
              </div>

              {/* Custom builder */}
              {form.cancellationPolicy === 'custom' && (
                <div style={{ marginTop: '6px', padding: '16px', borderRadius: '12px', background: goldFaint, border: `1px solid ${goldBorder}` }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: gold, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                    Your custom refund policy
                  </label>
                  <DarkTextarea
                    value={form.cancellationCustom}
                    onChange={(e) => update('cancellationCustom', e.target.value)}
                    rows={5}
                    placeholder={'Example:\n• 100% refund if cancelled 30+ days before\n• 50% refund if cancelled 7–29 days before\n• No refund within 7 days of departure\n• Weather cancellations: full refund or free reschedule'}
                    style={{ minHeight: '120px' }}
                  />
                  <p style={{ fontSize: '11px', color: dim, marginTop: '8px', marginBottom: 0 }}>
                    Guests will see these exact terms before booking. Be clear about refund percentages, time windows, and weather/no-show rules.
                  </p>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: text }}>Pricing tiers (EUR)</label>
              {form.pricing.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '13px', color: muted, width: '32px', flexShrink: 0 }}>{p.durationHours}h</span>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: muted, fontSize: '14px', pointerEvents: 'none' }}>€</span>
                    <DarkInput
                      type="number"
                      value={p.price}
                      onChange={(e) => {
                        const updated = [...form.pricing]
                        updated[i] = { ...updated[i], price: e.target.value }
                        update('pricing', updated)
                      }}
                      placeholder="0"
                      min={0}
                      style={{ paddingLeft: '32px' }}
                    />
                  </div>
                </div>
              ))}
              <p style={{ fontSize: '12px', color: dim }}>The price guests pay is exactly what you enter above — all-inclusive. BoatHire24 takes a 15% platform commission from this price, so you receive 85% as your payout.</p>
            </div>
          </>
        )}

        {/* ── Step 3: Photos ── */}
        {step === 3 && (
          <>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: text, marginBottom: '4px' }}>Photos</h2>

            {/* Existing photos (edit mode) */}
            {(initialData?.boat_images ?? []).length > 0 && (
              <div>
                <p style={{ fontSize: '13px', fontWeight: 600, color: muted, marginBottom: '10px' }}>
                  Current photos ({(initialData.boat_images as any[]).length}) — uploading new ones adds to these
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
                  {(initialData.boat_images as any[])
                    .slice()
                    .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
                    .map((img: any, i: number) => (
                      <div key={img.id ?? i} style={{ aspectRatio: '16/9', borderRadius: '10px', overflow: 'hidden', background: 'rgba(255,255,255,0.06)', position: 'relative' }}>
                        <img
                          src={img.storage_url}
                          alt={img.alt ?? ''}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        {(img.is_hero || i === 0) && (
                          <span style={{ position: 'absolute', bottom: '6px', left: '6px', fontSize: '10px', background: 'rgba(201,168,78,0.85)', color: '#07101e', fontWeight: 700, padding: '2px 7px', borderRadius: '99px' }}>
                            Hero
                          </span>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Upload new photos */}
            <div style={{ border: `2px dashed ${inputBorder}`, borderRadius: '14px', padding: '40px 24px', textAlign: 'center' }}>
              <input type="file" accept="image/*" multiple onChange={(e) => update('images', Array.from(e.target.files ?? []))} style={{ display: 'none' }} id="photo-upload" />
              <label htmlFor="photo-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{ fontSize: '36px' }}>📸</div>
                <div style={{ fontWeight: 600, color: text, fontSize: '15px' }}>
                  {(initialData?.boat_images ?? []).length > 0 ? 'Add more photos' : 'Upload photos'}
                </div>
                <div style={{ fontSize: '13px', color: muted }}>JPG, PNG or WebP · up to 10 photos</div>
              </label>
            </div>

            {/* New photo previews */}
            {form.images.length > 0 && (
              <div>
                <p style={{ fontSize: '13px', fontWeight: 600, color: muted, marginBottom: '8px' }}>New photos to upload ({form.images.length})</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {form.images.map((f, i) => (
                    <div key={i} style={{ aspectRatio: '16/9', borderRadius: '10px', overflow: 'hidden', background: 'rgba(255,255,255,0.06)', position: 'relative' }}>
                      <img src={URL.createObjectURL(f)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      {i === 0 && (initialData?.boat_images ?? []).length === 0 && (
                        <span style={{ position: 'absolute', bottom: '6px', left: '6px', fontSize: '10px', background: 'rgba(201,168,78,0.85)', color: '#07101e', fontWeight: 700, padding: '2px 7px', borderRadius: '99px' }}>
                          Hero
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── Step 4: Review & publish ── */}
        {step === 4 && (
          <>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: text, marginBottom: '4px' }}>Review & publish</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {[
                { label: 'Name', value: form.name || '—' },
                { label: 'Type', value: form.type.replace('_', ' ') },
                { label: 'Capacity', value: `${form.capacityPax} guests` },
                { label: 'Pricing slots', value: `${form.pricing.filter((p) => p.price && Number(p.price) > 0).length} set` },
                { label: 'Photos', value: `${(initialData?.boat_images?.length ?? 0) + form.images.length} total` },
                { label: 'Instant book', value: form.instantBook ? 'Yes' : 'No' },
              ].map((row, i, arr) => (
                <div key={row.label} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '14px 0', fontSize: '14px',
                  borderBottom: i < arr.length - 1 ? `1px solid rgba(255,255,255,0.07)` : 'none',
                }}>
                  <span style={{ color: muted }}>{row.label}</span>
                  <span style={{ fontWeight: 600, color: text }}>{row.value}</span>
                </div>
              ))}
            </div>
            {error && (
              <p style={{ fontSize: '13px', color: '#f87171', background: 'rgba(248,113,113,0.10)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: '10px', padding: '12px 16px' }}>
                {error}
              </p>
            )}
          </>
        )}
      </div>

      {/* ── Navigation buttons ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
        {step > 0 ? (
          <button
            onClick={() => setStep(step - 1)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '12px 22px', borderRadius: '99px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', background: 'transparent', border: `1px solid ${inputBorder}`, color: text }}
          >
            <ChevronLeft style={{ width: 16, height: 16 }} /> Back
          </button>
        ) : <div />}
        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={step === 0 && (!form.name || !form.locationId)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '12px 28px', borderRadius: '99px',
              fontSize: '14px', fontWeight: 700, cursor: step === 0 && (!form.name || !form.locationId) ? 'not-allowed' : 'pointer',
              background: 'linear-gradient(135deg, #d4b05e 0%, #c9a84e 60%, #b8942e 100%)',
              color: '#07101e', opacity: step === 0 && (!form.name || !form.locationId) ? 0.45 : 1,
              border: 'none', boxShadow: '0 4px 18px rgba(201,168,78,0.25)',
            }}
          >
            Continue <ChevronRight style={{ width: 16, height: 16 }} />
          </button>
        ) : (
          <button
            onClick={handlePublish}
            disabled={loading}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '12px 28px', borderRadius: '99px',
              fontSize: '14px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              background: 'linear-gradient(135deg, #d4b05e 0%, #c9a84e 60%, #b8942e 100%)',
              color: '#07101e', opacity: loading ? 0.6 : 1, border: 'none',
              boxShadow: '0 4px 18px rgba(201,168,78,0.25)',
            }}
          >
            {loading ? (boatId ? 'Saving…' : 'Publishing…') : (boatId ? 'Save changes' : 'Publish listing')}
          </button>
        )}
      </div>
    </div>
  )
}
