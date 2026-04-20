import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarRange, MapPin, SendHorizonal } from 'lucide-react'
import {
  PortalShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/portal/PortalUI'
import {
  conversationMessages,
  findConversation,
} from '../../data/mockPortalData'

const quickReplies = [
  'Looks great, thank you.',
  'Can you confirm the arrival timing?',
  'Please share the check-in notes again.',
]

export default function ConversationPage() {
  const { id } = useParams()
  const conversation = findConversation(id)
  const messages = conversationMessages[id] || []

  if (!conversation) {
    return (
      <PortalShell
        eyebrow="Conversation"
        title="Conversation not found."
        description="Use one of the mock conversation ids from the messages page to preview the thread view."
        actions={[{ label: 'Back to inbox', href: '/messages' }]}
      >
        <SectionCard>
          <p className="text-sm text-muted">
            The conversation UI is ready, but the requested thread is not part of the
            current mock data set.
          </p>
        </SectionCard>
      </PortalShell>
    )
  }

  return (
    <PortalShell
      eyebrow="Conversation"
      title={`Chat with ${conversation.participant}`}
      mobileTitle="Chat"
      description="The thread view keeps the stay context visible at all times, so guests never feel like they are messaging in a disconnected support tool."
      actions={[
        { label: 'Back to inbox', href: '/messages', secondary: true },
        { label: 'Open booking', href: `/trips/${conversation.bookingId}` },
      ]}
      stats={[
        {
          label: 'Property',
          value: conversation.property.location,
          note: conversation.property.country,
        },
        { label: 'Booking id', value: conversation.bookingId, note: 'Linked stay' },
        {
          label: 'Thread status',
          value: conversation.unreadCount > 0 ? 'Unread' : 'Current',
          note: conversation.updatedAt,
        },
      ]}
      accent="from-sky-50 via-white to-emerald-50"
    >
      <Link
        to="/messages"
        className="inline-flex items-center gap-2 self-start text-sm font-semibold text-dark transition-colors hover:text-muted"
      >
        <ArrowLeft size={16} />
        Back to inbox
      </Link>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <SectionCard>
          <SectionHeading
            eyebrow="Thread"
            title={conversation.title}
            description="Message bubbles stay spacious and legible on mobile while still feeling premium on desktop."
          />

          <div className="mt-4 rounded-[22px] border border-gray-200 bg-[#fcfcfb] p-3 xl:hidden">
            <p className="text-sm font-semibold text-dark">
              {conversation.property.title}
            </p>
            <p className="mt-1 text-sm text-muted">
              {conversation.property.location}, {conversation.property.country}
            </p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
              Linked booking {conversation.bookingId}
            </p>
          </div>

          <div className="mt-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === 'guest' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[86%] rounded-[24px] px-4 py-3 text-sm leading-7 md:max-w-[72%] ${
                    message.sender === 'guest'
                      ? 'bg-dark text-white'
                      : 'border border-gray-200 bg-[#fcfcfb] text-dark'
                  }`}
                >
                  <p>{message.text}</p>
                  <p
                    className={`mt-2 text-xs ${
                      message.sender === 'guest'
                        ? 'text-white/65'
                        : 'text-muted'
                    }`}
                  >
                    {message.time}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-2 sm:flex sm:flex-wrap sm:gap-3">
            {quickReplies.map((reply) => (
              <button
                key={reply}
                type="button"
                className="rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-dark transition-colors hover:bg-gray-50"
              >
                {reply}
              </button>
            ))}
          </div>

          <div className="mt-4 flex flex-col gap-3 rounded-[26px] border border-gray-200 bg-[#fcfcfb] p-4 sm:flex-row sm:items-end">
            <textarea
              rows={3}
              placeholder="Write a message to the host..."
              className="min-h-[108px] flex-1 resize-none bg-transparent text-base leading-7 text-dark outline-none placeholder:text-gray-400 md:text-sm"
            />
            <button
              type="button"
              className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-dark text-white transition-colors hover:bg-gray-800 sm:w-12"
            >
              <SendHorizonal size={16} />
            </button>
          </div>
        </SectionCard>

        <div className="hidden space-y-6 xl:block">
          <SectionCard>
            <img
              src={conversation.property.image}
              alt={conversation.property.title}
              className="aspect-[4/3] w-full rounded-[24px] object-cover"
            />

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <StatusPill tone="brand">Active stay thread</StatusPill>
              <StatusPill tone="success">{conversation.role}</StatusPill>
            </div>

            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-dark">
              {conversation.property.title}
            </h2>

            <div className="mt-4 space-y-3 text-sm text-muted">
              <p className="inline-flex items-center gap-2">
                <MapPin size={15} />
                {conversation.property.location}, {conversation.property.country}
              </p>
              <p className="inline-flex items-center gap-2">
                <CalendarRange size={15} />
                Linked booking {conversation.bookingId}
              </p>
            </div>

            <Link
              to={`/trips/${conversation.bookingId}`}
              className="mt-5 inline-flex w-full items-center justify-center rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-dark transition-colors hover:bg-gray-50 sm:w-auto"
            >
              View booking detail
            </Link>
          </SectionCard>
        </div>
      </div>
    </PortalShell>
  )
}
