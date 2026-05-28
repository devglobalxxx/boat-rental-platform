import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft } from 'lucide-react'
import ListingWizard from '@/components/host/ListingWizard'

const text = '#f4f4f2'
const muted = 'rgba(244,244,242,0.55)'

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/host/listings/${id}`)

  const { data: boat } = await supabase
    .from('boats')
    .select(`
      id, name, slug, tagline, description, type, length_m, capacity_pax, cabins, bathrooms,
      builder, model_year, departure_port, marina_lat, marina_lng,
      includes_skipper, includes_fuel, includes_drinks,
      min_hours, pricing_type, instant_book, cancellation_policy, status, location_id,
      boat_pricing(id, duration_hours, price, currency, season),
      boat_features(id, feature),
      boat_images(id, storage_url, alt, sort_order, is_hero)
    `)
    .eq('id', id)
    .eq('host_id', user.id)
    .single()

  if (!boat) notFound()

  const { data: locations } = await supabase
    .from('locations')
    .select('id, name, city, country')
    .order('name')

  return (
    <div style={{ background: '#07101e', minHeight: '100vh', color: text }}>
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 20px 80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
          <Link href="/host/listings" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)', color: muted, textDecoration: 'none', flexShrink: 0 }}>
            <ArrowLeft style={{ width: 16, height: 16 }} />
          </Link>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: text }}>Edit listing</h1>
        </div>
        <ListingWizard locations={locations ?? []} initialData={boat as any} />
      </div>
    </div>
  )
}
