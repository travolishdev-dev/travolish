import { Link } from 'react-router-dom'
import { MessageCircleMore, Search, Sparkles } from 'lucide-react'
import {
  PortalShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/portal/PortalUI'
import { conversations } from '../../data/mockPortalData'

export default function MessagesPage() {
  return (
    <PortalShell
      eyebrow="Messages"
      title="Stay messages, host by host."
      mobileTitle="Messages"
      description="This messages surface is shaped for host conversations, stay context, and unread states. It is mock-first now but directly compatible with later conversation and message APIs."
      actions={[
        { label: 'Trips', href: '/trips', secondary: true },
        { label: 'Open latest thread', href: `/messages/${conversations[0].id}` },
      ]}
      stats={[
        { label: 'Open threads', value: String(conversations.length), note: 'Host and concierge updates' },
        { label: 'Unread', value: '3', note: 'Across two conversations' },
        { label: 'Response style', value: 'Fast', note: 'Usually within 30 min' },
      ]}
      accent="from-sky-50 via-white to-violet-50"
    >
      <SectionCard>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="Inbox"
            title="Recent conversations"
            description="Each thread stays connected to the stay it belongs to, which keeps the experience grounded and easier to scan."
          />

          <label className="relative w-full md:min-w-[300px] md:w-auto">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="text"
              placeholder="Search host, property, or booking"
              className="w-full rounded-full border border-gray-200 bg-[#fcfcfb] py-3 pl-11 pr-4 text-base text-dark outline-none transition-colors focus:border-dark md:text-sm"
            />
          </label>
        </div>

        <div className="mt-6 divide-y divide-gray-200 border-y border-gray-200">
          {conversations.map((conversation) => (
            <Link
              key={conversation.id}
              to={`/messages/${conversation.id}`}
              className="group block py-4 transition-colors hover:bg-white/40 md:py-5"
            >
              <div className="grid grid-cols-[74px_minmax(0,1fr)] gap-3 md:grid-cols-[88px_minmax(0,1fr)] md:gap-4 lg:grid-cols-[96px_minmax(0,1fr)_220px] lg:items-center">
                <img
                  src={conversation.property.image}
                  alt={conversation.property.title}
                  className="h-20 w-full rounded-[20px] object-cover md:h-24 md:rounded-[22px]"
                />

                <div className="min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base font-semibold text-dark md:text-lg">
                          {conversation.participant}
                        </p>
                        <StatusPill
                          tone={conversation.unreadCount > 0 ? 'brand' : 'slate'}
                        >
                          {conversation.unreadCount > 0
                            ? `${conversation.unreadCount} unread`
                            : 'Up to date'}
                        </StatusPill>
                      </div>
                      <p className="mt-1 text-xs text-muted md:text-sm">
                        {conversation.title}
                      </p>
                    </div>
                    <p className="shrink-0 text-[11px] font-semibold text-muted md:hidden">
                      {conversation.updatedAt}
                    </p>
                  </div>

                  <p className="mt-2 text-sm leading-5 text-dark md:mt-3 md:leading-6">
                    {conversation.lastMessage}
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-3 md:mt-3">
                    <p className="min-w-0 text-xs text-muted md:text-sm">
                      {conversation.property.title} · {conversation.bookingId}
                    </p>
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-1.5 text-[11px] font-semibold text-sky-700 lg:hidden">
                      <MessageCircleMore size={12} />
                      Open
                    </div>
                  </div>
                </div>

                <div className="hidden border-l border-gray-200 pl-5 lg:block">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                    Updated
                  </p>
                  <p className="mt-2 text-xl font-semibold tracking-tight text-dark">
                    {conversation.updatedAt}
                  </p>
                  <p className="mt-2 text-sm text-muted">{conversation.role}</p>

                  <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-700">
                    <MessageCircleMore size={14} />
                    Open thread
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </SectionCard>

      <SectionCard className="hidden md:block">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-rose-50 p-3 text-brand">
            <Sparkles size={18} />
          </div>
          <p className="text-sm leading-6 text-muted">
            This design language can later extend to host auto-replies, concierge
            notes, and message status indicators without changing the guest inbox
            layout.
          </p>
        </div>
      </SectionCard>
    </PortalShell>
  )
}
