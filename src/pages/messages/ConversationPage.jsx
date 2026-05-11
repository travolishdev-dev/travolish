import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, SendHorizonal } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import {
  PortalShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/portal/PortalUI'
import { getConversation, getMessages, sendMessage } from '../../services/chatApi'

const MY_USER_ID = 1

const quickReplies = [
  'Looks great, thank you.',
  'Can you confirm the arrival timing?',
  'Please share the check-in notes again.',
]

function formatTime(dt) {
  if (!dt) return ''
  try { return format(parseISO(dt), 'h:mm a · MMM d') } catch { return '' }
}

export default function ConversationPage() {
  const { id } = useParams()
  const [conversation, setConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    async function load() {
      try {
        const [conv, msgs] = await Promise.all([
          getConversation(id),
          getMessages(id),
        ])
        setConversation(conv)
        setMessages((msgs.content ?? msgs).filter((m) => !m.isDeleted))
      } catch {
        // leave null — handled below
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const receiverId = conversation
    ? conversation.userId1 === MY_USER_ID
      ? conversation.userId2
      : conversation.userId1
    : null

  const handleSend = async (msgText) => {
    const trimmed = (msgText ?? text).trim()
    if (!trimmed || !receiverId) return
    setText('')
    const optimistic = {
      id: `tmp-${Date.now()}`,
      senderId: MY_USER_ID,
      messageText: trimmed,
      createdAt: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, optimistic])
    setSending(true)
    try {
      const saved = await sendMessage({
        conversationId: Number(id),
        receiverId,
        messageText: trimmed,
      })
      setMessages((prev) => prev.map((m) => (m.id === optimistic.id ? saved : m)))
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id))
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <PortalShell eyebrow="Conversation" title="Loading…" actions={[{ label: 'Back to inbox', href: '/messages', secondary: true }]}>
        <SectionCard>
          <div className="py-16 text-center text-sm text-muted">Fetching messages…</div>
        </SectionCard>
      </PortalShell>
    )
  }

  if (!conversation) {
    return (
      <PortalShell eyebrow="Conversation" title="Not found." actions={[{ label: 'Back to inbox', href: '/messages' }]}>
        <SectionCard>
          <p className="text-sm text-muted">This conversation does not exist.</p>
        </SectionCard>
      </PortalShell>
    )
  }

  const otherUserId = conversation.userId1 === MY_USER_ID ? conversation.userId2 : conversation.userId1
  const unread = conversation.userId1 === MY_USER_ID ? conversation.user1UnreadCount : conversation.user2UnreadCount

  return (
    <PortalShell
      eyebrow="Conversation"
      title={`Chat with User #${otherUserId}`}
      mobileTitle="Chat"
      description="Send and receive messages in real time."
      actions={[
        { label: 'Back to inbox', href: '/messages', secondary: true },
      ]}
      stats={[
        { label: 'Thread', value: `#${conversation.id}`, note: conversation.isActive ? 'Active' : 'Inactive' },
        { label: 'Participant', value: `User #${otherUserId}`, note: 'Other user' },
        { label: 'Unread', value: String(unread ?? 0), note: 'In this thread' },
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

      <SectionCard>
        <SectionHeading
          eyebrow="Thread"
          title={`Conversation #${conversation.id}`}
          description="Messages are sent and stored in real time."
        />

        {/* Message list */}
        <div className="mt-6 space-y-4 max-h-[480px] overflow-y-auto pr-1">
          {messages.length === 0 && (
            <p className="py-10 text-center text-sm text-muted">No messages yet. Say hello!</p>
          )}
          {messages.map((message) => {
            const isMe = message.senderId === MY_USER_ID
            return (
              <div key={message.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[86%] rounded-[24px] px-4 py-3 text-sm leading-7 md:max-w-[72%] ${
                    isMe ? 'bg-dark text-white' : 'border border-gray-200 bg-[#fcfcfb] text-dark'
                  }`}
                >
                  <p>{message.messageText}</p>
                  <p className={`mt-2 text-xs ${isMe ? 'text-white/65' : 'text-muted'}`}>
                    {formatTime(message.createdAt)}
                  </p>
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        {/* Quick replies */}
        <div className="mt-6 grid gap-2 sm:flex sm:flex-wrap sm:gap-3">
          {quickReplies.map((reply) => (
            <button
              key={reply}
              type="button"
              onClick={() => handleSend(reply)}
              className="rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-dark transition-colors hover:bg-gray-50"
            >
              {reply}
            </button>
          ))}
        </div>

        {/* Compose */}
        <div className="mt-4 flex flex-col gap-3 rounded-[26px] border border-gray-200 bg-[#fcfcfb] p-4 sm:flex-row sm:items-end">
          <textarea
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSend()
            }}
            placeholder="Write a message… (⌘↵ to send)"
            className="min-h-[108px] flex-1 resize-none bg-transparent text-base leading-7 text-dark outline-none placeholder:text-gray-400 md:text-sm"
          />
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!text.trim() || sending}
            className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-dark text-white transition-colors hover:bg-gray-800 disabled:opacity-40 sm:w-12"
          >
            <SendHorizonal size={16} />
          </button>
        </div>
      </SectionCard>
    </PortalShell>
  )
}
