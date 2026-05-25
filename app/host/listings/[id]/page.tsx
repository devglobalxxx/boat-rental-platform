import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import ListingWizard from '@/components/host/ListingWizard'

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
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link href="/host/listings"><ArrowLeft className="w-4 h-4" /></Link>
        </Button>
        <h1 className="text-2xl font-bold text-slate-900">Edit listing</h1>
      </div>
      <ListingWizard locations={locations ?? []} initialData={boat as any} />
    </div>
  )
}
