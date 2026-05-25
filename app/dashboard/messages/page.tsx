import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ChatThread from '@/components/messaging/ChatThread'
import { MessageSquare } from 'lucide-react'

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ conversation?: string }>
}) {
  const { conversation: conversationId } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/dashboard/messages')

  // Fetch all conversations for this user
  const { data: conversations } = await supabase
    .from('conversations')
    .select(`
      id, created_at,
      boats(name, slug, boat_images(storage_url, is_hero))
    `)
    .contains('participant_ids', [user.id])
    .order('created_at', { ascending: false })

  // For each conversation, get the latest message
  const convIds = (conversations ?? []).map((c) => c.id)
  const { data: latestMessages } = convIds.length
    ? await supabase
        .from('messages')
        .select('id, conversation_id, sender_id, body, created_at, read_at')
        .in('conversation_id', convIds)
        .order('created_at', { ascending: false })
    : { data: [] }

  type LatestMsg = { id: any; conversation_id: any; sender_id: any; body: any; created_at: any; read_at: any }
  const latestByConv: Record<string, LatestMsg> = {}
  for (const msg of latestMessages ?? []) {
    if (!latestByConv[msg.conversation_id]) {
      latestByConv[msg.conversation_id] = msg
    }
  }

  const activeConv = conversationId
    ? (conversations ?? []).find((c) => c.id === conversationId)
    : (conversations ?? [])[0]

  // Load messages for active conversation
  const { data: messages } = activeConv
    ? await supabase
        .from('messages')
        .select('id, sender_id, body, created_at, read_at')
        .eq('conversation_id', activeConv.id)
        .order('created_at', { ascending: true })
        .limit(100)
    : { data: [] }

  // Identify the other participant in the active conversation
  const { data: activeConvFull } = activeConv
    ? await supabase
        .from('conversations')
        .select('participant_ids')
        .eq('id', activeConv.id)
        .single()
    : { data: null }

  const otherUserId = (activeConvFull?.participant_ids as string[] | null)?.find((id) => id !== user.id)
  const { data: otherProfile } = otherUserId
    ? await supabase.from('profiles').select('full_name').eq('id', otherUserId).single()
    : { data: null }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Messages</h1>

      {!(conversations ?? []).length ? (
        <div className="text-center py-20">
          <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-slate-900 mb-2">No messages yet</h2>
          <p className="text-slate-500">Contact a host from any boat listing to start a conversation.</p>
        </div>
      ) : (
        <div className="flex gap-0 bg-white rounded-2xl border border-slate-200 overflow-hidden" style={{ height: '600px' }}>
          {/* Conversation list */}
          <div className="w-72 border-r border-slate-200 overflow-y-auto shrink-0">
            {(conversations ?? []).map((conv) => {
              const boat = conv.boats as any
              const hero = boat?.boat_images?.find((i: any) => i.is_hero) ?? boat?.boat_images?.[0]
              const latest = latestByConv[conv.id]
              const isActive = conv.id === (activeConv?.id ?? '')
              const hasUnread = latest && !latest.read_at && latest.sender_id !== user.id
              return (
                <Link
                  key={conv.id}
                  href={`/dashboard/messages?conversation=${conv.id}`}
                  className={`flex items-start gap-3 p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                    isActive ? 'bg-slate-50 border-l-2 border-l-[#06b6d4]' : ''
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                    {hero && <img src={hero.storage_url} alt={boat?.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className={`text-sm truncate ${hasUnread ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'}`}>
                        {boat?.name ?? 'Conversation'}
                      </span>
                      {hasUnread && <span className="w-2 h-2 rounded-full bg-[#06b6d4] shrink-0" />}
                    </div>
                    {latest && (
                      <p className="text-xs text-slate-500 truncate mt-0.5">{latest.body}</p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>

          {/* Chat panel */}
          <div className="flex-1 min-w-0">
            {activeConv ? (
              <ChatThread
                conversationId={activeConv.id}
                currentUserId={user.id}
                initialMessages={(messages ?? []).map((m) => ({
                  id: m.id,
                  sender_id: m.sender_id,
                  body: m.body,
                  created_at: m.created_at,
                  read_at: m.read_at,
                }))}
                otherPartyName={(otherProfile as any)?.full_name ?? 'Boat owner'}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">
                Select a conversation
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
