import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ListingWizard from '@/components/host/ListingWizard'

export default async function NewListingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/host/listings/new')

  const { data: locations } = await supabase.from('locations').select('id, name, city, country').order('name')

  return (
    <div style={{ background: '#07101e', minHeight: '100vh', padding: '40px 20px 80px' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#f4f4f2', marginBottom: '28px' }}>
          Create a listing
        </h1>
        <ListingWizard locations={locations ?? []} />
      </div>
    </div>
  )
}
