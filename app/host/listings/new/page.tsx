import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ListingWizard from '@/components/host/ListingWizard'

export default async function NewListingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/host/listings/new')

  const { data: locations } = await supabase.from('locations').select('id, name, city, country').order('name')

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Create a listing</h1>
      <ListingWizard locations={locations ?? []} />
    </div>
  )
}
