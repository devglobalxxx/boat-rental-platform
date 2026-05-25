'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { ChevronRight, ChevronLeft, Check } from 'lucide-react'
import type { Location } from '@/types/database'

interface WizardProps {
  locations: Pick<Location, 'id' | 'name' | 'city' | 'country'>[]
  initialData?: any
  boatId?: string
}

const STEPS = ['Basics', 'Specs & features', 'Pricing', 'Photos', 'Review & publish']

const BOAT_TYPES = [
  'motor_yacht', 'catamaran', 'sailing', 'speedboat', 'fishing', 'rib', 'luxury',
]

const COMMON_FEATURES = [
  'WiFi', 'Air conditioning', 'Paddleboard', 'Snorkel gear', 'Bluetooth speaker',
  'BBQ grill', 'Fishing gear', 'Inflatable toys', 'Waterski', 'Wakeboard',
  'Sun canopy', 'Fresh water shower', 'Tender/dinghy', 'Jet ski',
]

interface FormData {
  name: string
  tagline: string
  description: string
  type: string
  locationId: string
  departurePort: string
  capacityPax: number
  lengthM: string
  cabins: number
  builder: string
  modelYear: string
  includesSkipper: boolean
  includesFuel: boolean
  includesDrinks: boolean
  instantBook: boolean
  cancellationPolicy: string
  minHours: number
  pricingType: string
  selectedFeatures: string[]
  pricing: { durationHours: number; price: string }[]
  images: File[]
}

const INITIAL: FormData = {
  name: '',
  tagline: '',
  description: '',
  type: 'motor_yacht',
  locationId: '',
  departurePort: '',
  capacityPax: 8,
  lengthM: '',
  cabins: 0,
  builder: '',
  modelYear: '',
  includesSkipper: true,
  includesFuel: true,
  includesDrinks: false,
  instantBook: false,
  cancellationPolicy: 'moderate',
  minHours: 2,
  pricingType: 'hourly',
  selectedFeatures: [],
  pricing: [
    { durationHours: 2, price: '' },
    { durationHours: 4, price: '' },
    { durationHours: 8, price: '' },
  ],
  images: [],
}

function formFromInitial(d?: any): FormData {
  if (!d) return INITIAL
  return {
    name: d.name ?? '',
    tagline: d.tagline ?? '',
    description: d.description ?? '',
    type: d.type ?? 'motor_yacht',
    locationId: d.location_id ?? '',
    departurePort: d.departure_port ?? '',
    capacityPax: d.capacity_pax ?? 8,
    lengthM: d.length_m ? String(d.length_m) : '',
    cabins: d.cabins ?? 0,
    builder: d.builder ?? '',
    modelYear: d.model_year ? String(d.model_year) : '',
    includesSkipper: d.includes_skipper ?? true,
    includesFuel: d.includes_fuel ?? true,
    includesDrinks: d.includes_drinks ?? false,
    instantBook: d.instant_book ?? false,
    cancellationPolicy: d.cancellation_policy ?? 'moderate',
    minHours: d.min_hours ?? 2,
    pricingType: d.pricing_type ?? 'hourly',
    selectedFeatures: (d.boat_features ?? []).map((f: any) => f.feature),
    pricing: (d.boat_pricing ?? []).length > 0
      ? (d.boat_pricing ?? []).map((p: any) => ({ durationHours: p.duration_hours, price: String(p.price) }))
      : INITIAL.pricing,
    images: [],
  }
}

export default function ListingWizard({ locations, initialData, boatId }: WizardProps) {
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
      const ext = file.name.split('.').pop()
      const path = `boats/${boatId}/${Date.now()}.${ext}`
      const { data, error } = await supabase.storage.from('boat-images').upload(path, file)
      if (!error && data) {
        const { data: urlData } = supabase.storage.from('boat-images').getPublicUrl(data.path)
        urls.push(urlData.publicUrl)
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
        location_id: form.locationId,
        name: form.name,
        tagline: form.tagline || null,
        description: form.description || null,
        type: form.type as any,
        length_m: form.lengthM ? Number(form.lengthM) : null,
        capacity_pax: form.capacityPax,
        cabins: form.cabins || null,
        builder: form.builder || null,
        model_year: form.modelYear ? Number(form.modelYear) : null,
        departure_port: form.departurePort || null,
        includes_skipper: form.includesSkipper,
        includes_fuel: form.includesFuel,
        includes_drinks: form.includesDrinks,
        min_hours: form.minHours,
        pricing_type: form.pricingType as any,
        instant_book: form.instantBook,
        cancellation_policy: form.cancellationPolicy as any,
      }

      let targetBoatId: string

      if (boatId) {
        // Edit mode — update existing boat
        const { error: updateErr } = await supabase
          .from('boats')
          .update(boatFields)
          .eq('id', boatId)
        if (updateErr) throw new Error(updateErr.message)
        targetBoatId = boatId

        // Replace pricing (delete old, insert new)
        await supabase.from('boat_pricing').delete().eq('boat_id', boatId)
      } else {
        // Create mode — insert new boat
        const slug = form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now()
        const { data: boat, error: boatErr } = await supabase
          .from('boats')
          .insert({ host_id: user.id, slug, status: 'draft', ...boatFields })
          .select('id')
          .single()
        if (boatErr || !boat) throw new Error(boatErr?.message ?? 'Failed to create listing')
        targetBoatId = boat.id
      }

      // Insert pricing
      const pricingRecords = form.pricing
        .filter((p) => p.price && Number(p.price) > 0)
        .map((p) => ({
          boat_id: targetBoatId,
          duration_hours: p.durationHours,
          price: Number(p.price),
          currency: 'EUR',
          season: 'all' as const,
        }))

      if (pricingRecords.length > 0) {
        await supabase.from('boat_pricing').insert(pricingRecords)
      }

      // Update features (replace in edit mode)
      if (boatId) {
        await supabase.from('boat_features').delete().eq('boat_id', boatId)
      }
      if (form.selectedFeatures.length > 0) {
        await supabase.from('boat_features').insert(
          form.selectedFeatures.map((f) => ({ boat_id: targetBoatId, feature: f }))
        )
      }

      // Upload new images (in edit mode, append to existing)
      if (form.images.length > 0) {
        const urls = await uploadImages(targetBoatId)
        const existingCount = initialData?.boat_images?.length ?? 0
        await supabase.from('boat_images').insert(
          urls.map((url, i) => ({
            boat_id: targetBoatId,
            storage_url: url,
            alt: `${form.name} photo ${existingCount + i + 1}`,
            sort_order: existingCount + i,
            is_hero: existingCount === 0 && i === 0,
          }))
        )
      }

      // Activate if we have pricing
      if (pricingRecords.length > 0) {
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
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 shrink-0">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              i < step ? 'bg-emerald-500 text-white' : i === step ? 'bg-[#06b6d4] text-white' : 'bg-slate-200 text-slate-500'
            }`}>
              {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
            </div>
            <span className={`text-sm ${i === step ? 'font-semibold text-slate-900' : 'text-slate-400'}`}>{s}</span>
            {i < STEPS.length - 1 && <ChevronRight className="w-4 h-4 text-slate-300" />}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 space-y-5">
        {step === 0 && (
          <>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Tell guests about your boat</h2>
            <div className="space-y-1.5">
              <Label>Listing name *</Label>
              <Input value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="e.g. Azimut 40 – Sun Seeker" />
            </div>
            <div className="space-y-1.5">
              <Label>Tagline</Label>
              <Input value={form.tagline} onChange={(e) => update('tagline', e.target.value)} placeholder="Short catchy description (optional)" />
            </div>
            <div className="space-y-1.5">
              <Label>Full description</Label>
              <Textarea value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Describe the boat, the experience, what to expect…" rows={5} />
            </div>
            <div className="space-y-1.5">
              <Label>Boat type *</Label>
              <Select value={form.type} onValueChange={(v) => update('type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {BOAT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t.replace('_', ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Location *</Label>
              <Select value={form.locationId} onValueChange={(v) => update('locationId', v)}>
                <SelectTrigger><SelectValue placeholder="Select a city" /></SelectTrigger>
                <SelectContent>
                  {locations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>{loc.city}, {loc.country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Departure port / marina</Label>
              <Input value={form.departurePort} onChange={(e) => update('departurePort', e.target.value)} placeholder="e.g. Puerto Banús, Marbella" />
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Boat specifications</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Max guests *</Label>
                <Input type="number" value={form.capacityPax} onChange={(e) => update('capacityPax', Number(e.target.value))} min={1} max={100} />
              </div>
              <div className="space-y-1.5">
                <Label>Length (m)</Label>
                <Input type="number" value={form.lengthM} onChange={(e) => update('lengthM', e.target.value)} step={0.1} min={1} placeholder="12.5" />
              </div>
              <div className="space-y-1.5">
                <Label>Cabins</Label>
                <Input type="number" value={form.cabins} onChange={(e) => update('cabins', Number(e.target.value))} min={0} />
              </div>
              <div className="space-y-1.5">
                <Label>Builder / brand</Label>
                <Input value={form.builder} onChange={(e) => update('builder', e.target.value)} placeholder="Azimut, Sunseeker…" />
              </div>
              <div className="space-y-1.5">
                <Label>Model year</Label>
                <Input type="number" value={form.modelYear} onChange={(e) => update('modelYear', e.target.value)} min={1970} max={2030} placeholder="2019" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>What&apos;s included?</Label>
              {[
                { key: 'includesSkipper', label: 'Licensed skipper' },
                { key: 'includesFuel', label: 'Fuel' },
                { key: 'includesDrinks', label: 'Drinks & snacks' },
                { key: 'instantBook', label: 'Instant book (guests book without approval)' },
              ].map((opt) => (
                <label key={opt.key} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form[opt.key as keyof FormData] as boolean}
                    onChange={(e) => update(opt.key as keyof FormData, e.target.checked)}
                    className="w-4 h-4 rounded accent-[#06b6d4]"
                  />
                  <span className="text-sm text-slate-700">{opt.label}</span>
                </label>
              ))}
            </div>

            <div className="space-y-2">
              <Label>Amenities</Label>
              <div className="flex flex-wrap gap-2">
                {COMMON_FEATURES.map((feat) => (
                  <button
                    key={feat}
                    type="button"
                    onClick={() => toggleFeature(feat)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                      form.selectedFeatures.includes(feat)
                        ? 'bg-[#06b6d4]/10 border-[#06b6d4] text-[#0891b2]'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {feat}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Set your prices</h2>
            <div className="space-y-1.5 mb-4">
              <Label>Cancellation policy</Label>
              <Select value={form.cancellationPolicy} onValueChange={(v) => update('cancellationPolicy', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="flexible">Flexible — full refund up to 24h before</SelectItem>
                  <SelectItem value="moderate">Moderate — full refund up to 5 days before</SelectItem>
                  <SelectItem value="strict">Strict — 50% refund up to 14 days before</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label>Pricing tiers (EUR)</Label>
              {form.pricing.map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-sm text-slate-500 w-16 shrink-0">{p.durationHours}h</span>
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">€</span>
                    <Input
                      type="number"
                      value={p.price}
                      onChange={(e) => {
                        const updated = [...form.pricing]
                        updated[i] = { ...updated[i], price: e.target.value }
                        update('pricing', updated)
                      }}
                      placeholder="0"
                      className="pl-7"
                      min={0}
                    />
                  </div>
                </div>
              ))}
              <p className="text-xs text-slate-400">A 15% service fee is added to these prices at checkout.</p>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Add photos</h2>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => update('images', Array.from(e.target.files ?? []))}
                className="hidden"
                id="photo-upload"
              />
              <label htmlFor="photo-upload" className="cursor-pointer">
                <div className="text-3xl mb-2">📸</div>
                <div className="font-semibold text-slate-700 mb-1">Upload photos</div>
                <div className="text-sm text-slate-400">JPG, PNG or WebP — up to 10 photos</div>
              </label>
            </div>
            {form.images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                {form.images.map((f, i) => (
                  <div key={i} className="aspect-video rounded-lg overflow-hidden bg-slate-100 relative">
                    <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
                    {i === 0 && (
                      <span className="absolute bottom-1 left-1 text-xs bg-black/60 text-white px-1.5 rounded">Hero</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {step === 4 && (
          <>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Review & publish</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Name</span>
                <span className="font-medium text-slate-900">{form.name || '—'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Type</span>
                <span className="font-medium text-slate-900">{form.type.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Capacity</span>
                <span className="font-medium text-slate-900">{form.capacityPax} guests</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Pricing slots</span>
                <span className="font-medium text-slate-900">
                  {form.pricing.filter((p) => p.price && Number(p.price) > 0).length} set
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Photos</span>
                <span className="font-medium text-slate-900">{form.images.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Instant book</span>
                <span className="font-medium text-slate-900">{form.instantBook ? 'Yes' : 'No'}</span>
              </div>
            </div>
            {error && <p className="text-sm text-red-600 mt-4">{error}</p>}
          </>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between gap-3">
        {step > 0 ? (
          <Button variant="outline" onClick={() => setStep(step - 1)}>
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>
        ) : <div />}
        {step < STEPS.length - 1 ? (
          <Button
            variant="sea"
            onClick={() => setStep(step + 1)}
            disabled={step === 0 && (!form.name || !form.locationId)}
          >
            Continue <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button variant="sea" onClick={handlePublish} disabled={loading}>
            {loading ? (boatId ? 'Saving…' : 'Publishing…') : (boatId ? 'Save changes' : 'Publish listing')}
          </Button>
        )}
      </div>
    </div>
  )
}
