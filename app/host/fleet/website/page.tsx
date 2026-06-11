import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import WebsiteImportClient from './WebsiteImportClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Import from your website' }

export default async function WebsiteImportPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/host/fleet/website')

  const { data: locations } = await supabase
    .from('locations')
    .select('id, name, city, country')
    .order('name')

  return <WebsiteImportClient locations={locations ?? []} />
}
