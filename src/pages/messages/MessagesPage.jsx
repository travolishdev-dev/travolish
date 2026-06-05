import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircleMore, Search } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import {
  PortalShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/portal/PortalUI'
import { listConversations } from '../../services/chatApi'
import useAuthStore from '../../stores/useAuthStore'

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&auto=format&fit=crop',
]

function placeholderImage(id) {
  return PLACEHOLDER_IMAGES[(Number(id) || 0) % PLACEHOLDER_IMAGES.length]
}

function formatTime(dt) {
  if (!dt) return ''
  try { return format(parseISO(dt), 'MMM d') } catch { return '' }
}

function adaptConversation(c, userId) {
  const isUser1 = c.userId1 === userId
  const otherId = isUser1 ? c.userId2 : c.userId1
  const unread = isUser1 ? (c.user1UnreadCount ?? 0) : (c.user2UnreadCount ?? 0)
  return {
    id: String(c.id),
    participant: `User #${otherId}`,
    otherId,
    title: `Thread #${c.id}`,
    unreadCount: unread,
    updatedAt: formatTime(c.lastMessageTime ?? c.updatedAt),
    image: placeholderImage(c.id),
    isActive: c.isActive,
  }
}

export default function MessagesPage() {
  const userId = useAuthStore((s) => s.backendUserId)
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (!userId) { setLoading(false); return }
    listConversations(userId)
      .then((data) => setConversations((data ?? []).map((c) => adaptConversation(c, userId))))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [userId])

  const visible = useMemo(() => {
    if (!query.trim()) return conversations
    const q = query.toLowerCase()
    return conversations.filter((c) => c.participant.toLowerCase().includes(q) || c.title.toLowerCase().includes(q))
  }, [conversations, query])

  const totalUnread = conversations.reduce((s, c) => s + c.unreadCount, 0)

  return (
    <PortalShell
      eyebrow="Messages"
      title="Stay messages, host by host."
      mobileTitle="Messages"
      description="Your conversations — tap any thread to read and reply."
      actions={[
        { label: 'Trips', href: '/trips', secondary: true },
        ...(visible[0] ? [{ label: 'Open latest thread', href: `/messages/${visible[0].id}` }] : []),
      ]}
      stats={[
        { label: 'Open threads', value: String(conversations.length), note: 'Active conversations' },
        { label: 'Unread', value: String(totalUnread), note: 'Across all threads' },
        { label: 'Response style', value: 'Fast', note: 'Usually within 30 min' },
      ]}
      accent="from-sky-50 via-white to-violet-50"
    >
      <SectionCard>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="Inbox"
            title="Recent conversations"
            description="Each thread stays connected to the stay it belongs to."
          />
          <label className="relative w-full md:min-w-[300px] md:w-auto">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search conversations"
              className="w-full rounded-full border border-gray-200 bg-[#fcfcfb] py-3 pl-11 pr-4 text-base text-dark outline-none transition-colors focus:border-dark md:text-sm"
            />
          </label>
        </div>

        {loading && (
          <div className="py-16 text-center text-sm text-muted">Loading conversations…</div>
        )}

        {!loading && visible.length === 0 && (
          <div className="py-16 text-center text-sm text-muted">
            {query ? 'No conversations match your search.' : 'No conversations yet.'}
          </div>
        )}

        {!loading && visible.length > 0 && (
          <div className="mt-6 divide-y divide-gray-200 border-y border-gray-200">
            {visible.map((conversation) => (
              <Link
                key={conversation.id}
                to={`/messages/${conversation.id}`}
                className="group block py-4 transition-colors hover:bg-white/40 md:py-5"
              >
                <div className="grid grid-cols-[74px_minmax(0,1fr)] gap-3 md:grid-cols-[88px_minmax(0,1fr)] md:gap-4 lg:grid-cols-[96px_minmax(0,1fr)_220px] lg:items-center">
                  <img
                    src={conversation.image}
                    alt={conversation.title}
                    className="h-20 w-full rounded-[20px] object-cover md:h-24 md:rounded-[22px]"
                  />

                  <div className="min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-base font-semibold text-dark md:text-lg">
                            {conversation.participant}
                          </p>
                          <StatusPill tone={conversation.unreadCount > 0 ? 'brand' : 'slate'}>
                            {conversation.unreadCount > 0 ? `${conversation.unreadCount} unread` : 'Up to date'}
                          </StatusPill>
                        </div>
                        <p className="mt-1 text-xs text-muted md:text-sm">{conversation.title}</p>
                      </div>
                      <p className="shrink-0 text-[11px] font-semibold text-muted md:hidden">
                        {conversation.updatedAt}
                      </p>
                    </div>
                    <p className="mt-2 text-sm leading-5 text-dark md:mt-3 md:leading-6">
                      {conversation.isActive ? 'Active thread' : 'Inactive thread'}
                    </p>
                  </div>

                  <div className="hidden border-l border-gray-200 pl-5 lg:block">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Updated</p>
                    <p className="mt-2 text-xl font-semibold tracking-tight text-dark">{conversation.updatedAt || '—'}</p>
                    <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-700">
                      <MessageCircleMore size={14} />
                      Open thread
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </SectionCard>
    </PortalShell>
  )
}
