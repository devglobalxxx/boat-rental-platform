import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import HostCalendarClient from './HostCalendarClient'

export default async function HostCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ boat?: string }>
}) {
  const { boat: boatId } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/host/calendar')

  const { data: boats } = await supabase
    .from('boats')
    .select('id, name, slug')
    .eq('host_id', user.id)
    .order('name')

  const selectedBoat = boats?.find((b) => b.id === boatId) ?? boats?.[0] ?? null

  const { data: availability } = selectedBoat
    ? await supabase
        .from('availability')
        .select('date, status')
        .eq('boat_id', selectedBoat.id)
        .gte('date', new Date().toISOString().slice(0, 10))
        .order('date')
    : { data: [] }

  const { data: bookings } = selectedBoat
    ? await supabase
        .from('bookings')
        .select('start_datetime, end_datetime, status')
        .eq('boat_id', selectedBoat.id)
        .in('status', ['confirmed', 'pending'])
        .gte('start_datetime', new Date().toISOString())
    : { data: [] }

  return (
    <HostCalendarClient
      boats={boats ?? []}
      selectedBoat={selectedBoat}
      availability={(availability ?? []).map((a) => ({ date: a.date, status: a.status }))}
      bookings={(bookings ?? []).map((b) => ({
        start: b.start_datetime,
        end: b.end_datetime,
        status: b.status,
      }))}
    />
  )
}
