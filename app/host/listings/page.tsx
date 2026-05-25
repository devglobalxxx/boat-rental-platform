import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Settings, Eye, Calendar, ToggleLeft, ToggleRight } from 'lucide-react'

export default async function HostListingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/host/listings')

  const { data: boats } = await supabase
    .from('boats')
    .select('id, name, slug, status, capacity_pax, type, length_m, boat_images(storage_url, is_hero)')
    .eq('host_id', user.id)
    .order('created_at', { ascending: false })

  const STATUS_COLORS: Record<string, 'success' | 'warning' | 'outline'> = {
    active: 'success',
    paused: 'warning',
    draft: 'outline',
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My listings</h1>
          <p className="text-slate-500 mt-1">{boats?.length ?? 0} boat{boats?.length !== 1 ? 's' : ''} listed</p>
        </div>
        <Button asChild variant="sea">
          <Link href="/host/listings/new"><Plus className="w-4 h-4" /> Add listing</Link>
        </Button>
      </div>

      {!boats?.length ? (
        <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
          <p className="text-slate-500 mb-4">No listings yet. Create your first to start earning.</p>
          <Button asChild variant="sea">
            <Link href="/host/listings/new"><Plus className="w-4 h-4" /> Create a listing</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {boats.map((boat) => {
            const hero = (boat.boat_images as any[])?.find((i: any) => i.is_hero) ?? (boat.boat_images as any[])?.[0]
            return (
              <div key={boat.id} className="flex items-center gap-4 bg-white rounded-2xl border border-slate-200 p-4 hover:border-slate-300 transition-colors">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                  {hero && (
                    <img src={hero.storage_url} alt={boat.name} className="w-full h-full object-cover" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap">
                    <span className="font-semibold text-slate-900">{boat.name}</span>
                    <Badge variant={STATUS_COLORS[boat.status] ?? 'outline'}>{boat.status}</Badge>
                  </div>
                  <div className="text-sm text-slate-500 mt-0.5">
                    {boat.type.replace('_', ' ')} · {boat.capacity_pax} guests
                    {boat.length_m ? ` · ${boat.length_m}m` : ''}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button asChild variant="ghost" size="sm" title="View listing">
                    <Link href={`/boats/${boat.slug}`}><Eye className="w-4 h-4" /></Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm" title="Manage calendar">
                    <Link href={`/host/calendar?boat=${boat.id}`}><Calendar className="w-4 h-4" /></Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/host/listings/${boat.id}`}><Settings className="w-3.5 h-3.5" /> Edit</Link>
                  </Button>
                  <form action={`/api/host/listings/${boat.id}/toggle`} method="POST">
                    <button
                      type="submit"
                      className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                      title={boat.status === 'active' ? 'Pause listing' : 'Activate listing'}
                    >
                      {boat.status === 'active'
                        ? <ToggleRight className="w-5 h-5 text-[#06b6d4]" />
                        : <ToggleLeft className="w-5 h-5" />
                      }
                    </button>
                  </form>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
