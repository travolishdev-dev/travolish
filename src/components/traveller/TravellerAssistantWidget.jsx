import { useEffect, useRef, useState } from 'react'
import { Loader2, MessageCircle, Send, X } from 'lucide-react'
import TravolishWordmark from '../common/TravolishWordmark'
import { getOrCreateConversation, getMessages, sendMessage } from '../../services/chatApi'
import useAuthStore from '../../stores/useAuthStore'

// Designated Travolish support user — messages from this user show as assistant bubbles
const SUPPORT_USER_ID = 4

const QUICK_PROMPTS = [
  'Find stays with free cancellation',
  'What should I check before booking?',
  'Help me compare two properties',
]

function buildReply(prompt) {
  const text = prompt.toLowerCase()
  if (text.includes('free cancellation')) {
    return 'Use the Search filters panel and turn on Free cancellation. You can combine it with instant booking, amenities, and sort by price or rating.'
  }
  if (text.includes('compare')) {
    return 'Compare the property type, cancellation policy, host response time, nearby attractions, and the price preview before entering checkout.'
  }
  if (text.includes('booking')) {
    return 'Before booking, check the house rules, cancellation policy, total price preview, guest count, and whether the stay is instant book or request to book.'
  }
  return 'I can help with search filters, booking details, policies, offers, emergency contacts, and trip planning. Your message has been sent to our support team.'
}

function mapBackendMessages(messages, userId) {
  return messages.map((m) => ({
    id: String(m.id),
    sender: m.senderId === userId ? 'guest' : 'assistant',
    text: m.messageText,
    createdAt: m.createdAt,
  }))
}

export default function TravellerAssistantWidget() {
  const userId = useAuthStore((s) => s.backendUserId)

  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    { id: 'welcome', sender: 'assistant', text: 'Ask about stays, policies, offers, or upcoming trips.' },
  ])
  const [conversationId, setConversationId] = useState(null)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  // Load conversation history when authenticated user opens the widget
  useEffect(() => {
    if (!isOpen || !userId) return
    let cancelled = false

    async function initConversation() {
      setLoadingHistory(true)
      try {
        const conv = await getOrCreateConversation(userId, SUPPORT_USER_ID)
        if (cancelled || !conv?.id) return
        setConversationId(conv.id)

        const history = await getMessages(conv.id, { pageSize: 50 })
        if (cancelled) return

        const items = (history?.content ?? (Array.isArray(history) ? history : []))
          .filter((m) => !m.isDeleted)
          .reverse() // API returns newest first

        if (items.length > 0) {
          setMessages(mapBackendMessages(items, userId))
        }
      } catch {
        // Network error — stay in local-only mode
      } finally {
        if (!cancelled) setLoadingHistory(false)
      }
    }

    initConversation()
    return () => { cancelled = true }
  }, [isOpen, userId])

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendPrompt = async (prompt) => {
    const trimmed = prompt.trim()
    if (!trimmed || sending) return

    // Add user message optimistically
    const userMsg = { id: `guest-${Date.now()}`, sender: 'guest', text: trimmed }
    setMessages((prev) => [...prev, userMsg])
    setInput('')

    if (userId && conversationId) {
      // Authenticated path — persist to backend
      setSending(true)
      try {
        await sendMessage({ conversationId, receiverId: SUPPORT_USER_ID, messageText: trimmed })
      } catch {
        // Message failed to save — still show local reply below
      } finally {
        setSending(false)
      }
    }

    // Always show an immediate assistant reply for instant UX feedback
    setMessages((prev) => [
      ...prev,
      { id: `assistant-${Date.now()}`, sender: 'assistant', text: buildReply(trimmed) },
    ])
  }

  if (!isOpen) {
    return (
      <>
        <div className="traveller-assistant-cloud fixed bottom-[9.4rem] right-3 z-40 max-w-[224px] md:bottom-[5.9rem] md:right-5">
          <p className="relative z-10 px-1 text-center text-xs font-semibold leading-5 text-dark">
            Ask me about stays, deals, trips, or safety.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-4 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-[0_18px_45px_rgba(255,56,92,0.32)] transition-colors hover:bg-brand-dark md:bottom-6 md:right-6"
          aria-label="Open travel assistant"
        >
          <span className="travolish-wordmark text-[38px] leading-none text-white" aria-hidden="true">
            <span className="travolish-wordmark-letter">t</span>
          </span>
        </button>
      </>
    )
  }

  return (
    <div
      className="fixed bottom-24 right-4 z-50 w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-[28px] border border-rose-100 bg-white shadow-[0_26px_80px_rgba(15,23,42,0.22)] md:bottom-6 md:right-6"
      style={{
        backgroundImage:
          'linear-gradient(135deg, rgba(255,255,255,0.98), rgba(255,244,247,0.96) 48%, rgba(255,255,255,0.98)), linear-gradient(rgba(255,56,92,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,56,92,0.08) 1px, transparent 1px)',
        backgroundSize: '100% 100%, 22px 22px, 22px 22px',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-rose-100/80 bg-white/45 px-5 py-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <TravolishWordmark className="text-[38px] leading-none text-brand" />
          {userId && (
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
              Live
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-dark"
          aria-label="Close travel assistant"
        >
          <X size={16} />
        </button>
      </div>

      {/* Message list */}
      <div className="max-h-72 space-y-3 overflow-y-auto px-5 py-4">
        {loadingHistory ? (
          <div className="flex items-center gap-2 text-xs text-muted">
            <Loader2 size={12} className="animate-spin" />
            Loading conversation…
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
                message.sender === 'guest'
                  ? 'ml-8 bg-dark text-white'
                  : 'mr-8 border border-rose-100 bg-white/78 text-dark shadow-sm backdrop-blur-sm'
              }`}
            >
              {message.text}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Footer */}
      <div className="border-t border-rose-100/80 bg-white/50 px-5 py-4 backdrop-blur-sm">
        <div className="mb-3 flex flex-wrap gap-2">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => sendPrompt(prompt)}
              disabled={sending}
              className="rounded-full border border-gray-200 bg-[#fcfbf8] px-3 py-1.5 text-xs font-semibold text-dark disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            sendPrompt(input)
          }}
          className="flex items-center gap-2"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-50 text-muted">
            <MessageCircle size={16} />
          </span>
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={userId ? 'Ask a travel question (saved)' : 'Ask a travel question'}
            className="min-w-0 flex-1 rounded-2xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-dark"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-dark text-white disabled:opacity-50"
            aria-label="Send assistant message"
          >
            {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={15} />}
          </button>
        </form>
        {userId && (
          <p className="mt-2 text-center text-[10px] text-muted">
            Signed in · messages saved to your account
          </p>
        )}
      </div>
    </div>
  )
}
