import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Loader2, MessageCircle, Send, Sparkles, X } from 'lucide-react'
import TravolishWordmark from '../common/TravolishWordmark'
import { getOrCreateConversation, getMessages, sendMessage } from '../../services/chatApi'
import useAuthStore from '../../stores/useAuthStore'

const SUPPORT_USER_ID = 4

// Merge incoming DB messages into local state without losing optimistic messages.
// Union by id; sort by createdAt (messages without a timestamp sort first so
// the static welcome message stays at the top).
function mergeMessages(prev, incoming) {
  const knownIds = new Set(prev.map((m) => m.id))
  const fresh = incoming.filter((m) => !knownIds.has(m.id))
  if (!fresh.length) return prev
  return [...prev, ...fresh].sort((a, b) => {
    if (!a.createdAt && !b.createdAt) return 0
    if (!a.createdAt) return -1
    if (!b.createdAt) return 1
    return new Date(a.createdAt) - new Date(b.createdAt)
  })
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
  const { t } = useTranslation('messages')
  const userId = useAuthStore((s) => s.backendUserId)
  const authLoading = useAuthStore((s) => s.loading ?? s.isLoading ?? false)

  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Hello! I'm Travolish AI, your friendly travel assistant. How can I help you with your travel plans or a current booking today? 😊",
    },
  ])
  const [conversationId, setConversationId] = useState(null)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [initError, setInitError] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState(null)
  const [isTyping, setIsTyping] = useState(false)
  const [isBubbleVisible, setIsBubbleVisible] = useState(false)
  const bottomRef = useRef(null)

  const quickPrompts = useMemo(() => [
    t('assistant.quickPrompt1'),
    t('assistant.quickPrompt2'),
    t('assistant.quickPrompt3'),
  ], [t])

  useEffect(() => {
    if (!isOpen || !userId) return
    let cancelled = false

    async function initConversation() {
      setLoadingHistory(true)
      setInitError(false)
      try {
        const conv = await getOrCreateConversation(userId, SUPPORT_USER_ID)
        if (cancelled || !conv?.id) return
        setConversationId(conv.id)

        const history = await getMessages(conv.id, { pageSize: 50 })
        if (cancelled) return

        const items = (history?.content ?? (Array.isArray(history) ? history : []))
          .filter((m) => !m.isDeleted)
          .reverse()

        if (items.length > 0) {
          setMessages(mapBackendMessages(items, userId))
        }
      } catch {
        if (!cancelled) setInitError(true)
      } finally {
        if (!cancelled) setLoadingHistory(false)
      }
    }

    initConversation()
    return () => { cancelled = true }
  }, [isOpen, userId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendPrompt = async (prompt) => {
    const trimmed = prompt.trim()
    if (!trimmed || sending || isTyping) return

    setSendError(null)
    const optimisticId = `guest-${Date.now()}`
    setMessages((prev) => [...prev, { id: optimisticId, sender: 'guest', text: trimmed }])
    setInput('')

    // Auth store still resolving — stay silent; don't show a false "sign in" prompt
    if (authLoading) return

    if (!userId || !conversationId) {
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          sender: 'assistant',
          text: 'Sign in to chat with our AI travel assistant and save your conversation history.',
        },
      ])
      return
    }

    setSending(true)
    let sent = false
    try {
      await sendMessage({ conversationId, receiverId: SUPPORT_USER_ID, messageText: trimmed })
      sent = true
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId))
      setSendError('Message not sent — please try again.')
    } finally {
      setSending(false)
    }

    if (!sent) return

    // Capture the last known AI message ID before polling so we can detect
    // when a new reply arrives rather than relying on a fixed timeout.
    const lastAiId = messages.filter((m) => m.sender === 'assistant').slice(-1)[0]?.id ?? null

    setIsTyping(true)
    try {
      let gotReply = false
      for (let attempt = 0; attempt < 5 && !gotReply; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 1500))
        const history = await getMessages(conversationId, { pageSize: 50 }).catch(() => null)
        if (!history) continue
        const items = (history?.content ?? (Array.isArray(history) ? history : []))
          .filter((m) => !m.isDeleted)
          .reverse()
        const mapped = mapBackendMessages(items, userId)
        const latestAiId = mapped.filter((m) => m.sender === 'assistant').slice(-1)[0]?.id ?? null
        if (latestAiId !== null && latestAiId !== lastAiId) {
          setMessages((prev) => mergeMessages(prev, mapped))
          gotReply = true
        }
      }
      // Final sync after max attempts — ensures we show whatever arrived
      if (!gotReply) {
        const history = await getMessages(conversationId, { pageSize: 50 }).catch(() => null)
        if (history) {
          const items = (history?.content ?? (Array.isArray(history) ? history : []))
            .filter((m) => !m.isDeleted)
            .reverse()
          setMessages((prev) => mergeMessages(prev, mapBackendMessages(items, userId)))
        }
      }
    } catch {
      // Polling failed — message is saved; reply will appear on next open
    } finally {
      setIsTyping(false)
    }
  }

  /* ── FAB (closed state) ─────────────────────────────────── */
  if (!isOpen) {
    const bubbleText = userId
      ? 'Ask me about stays, deals, trips, or safety.'
      : 'Sign in to chat with Travolish AI.'

    return (
      <>
        {isBubbleVisible && (
          <div className="traveller-assistant-cloud fixed bottom-[calc(9.4rem+env(safe-area-inset-bottom))] end-3 z-40 max-w-[224px] animate-in fade-in duration-150 md:bottom-[5.9rem] md:end-5">
            <p className="relative z-10 px-1 text-center text-xs font-semibold leading-5 text-dark">
              {bubbleText}
            </p>
          </div>
        )}
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          onMouseEnter={() => setIsBubbleVisible(true)}
          onMouseLeave={() => setIsBubbleVisible(false)}
          className="fixed bottom-[calc(6rem+env(safe-area-inset-bottom))] end-4 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-[0_18px_45px_rgba(255,56,92,0.32)] transition-colors hover:bg-brand-dark md:bottom-6 md:end-6"
          aria-label="Open travel assistant"
        >
          <MessageCircle size={24} />
        </button>
      </>
    )
  }

  /* ── Chat panel (open state) ────────────────────────────── */
  return (
    <div className="fixed bottom-[calc(6rem+env(safe-area-inset-bottom))] end-4 z-50 flex w-[calc(100vw-2rem)] max-w-[360px] flex-col overflow-hidden rounded-[24px] bg-white shadow-[0_32px_80px_rgba(15,23,42,0.22),0_0_0_1px_rgba(15,23,42,0.06)] animate-in slide-in-from-bottom-4 fade-in duration-300 md:bottom-6 md:end-6">

      {/* ── Header ── */}
      <div
        className="relative overflow-hidden px-5 py-4 flex-shrink-0"
        style={{ background: 'linear-gradient(135deg, #FF385C 0%, #E8175D 55%, #C2185B 100%)' }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '18px 18px',
          }}
        />
        <div className="relative flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/20 ring-2 ring-white/30 backdrop-blur-sm">
              <TravolishWordmark className="h-5" style={{ filter: 'brightness(0) invert(1)' }} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[15px] font-semibold leading-none text-white">Travolish AI</span>
                <Sparkles size={12} className="flex-shrink-0 text-yellow-300" />
              </div>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="h-2 w-2 flex-shrink-0 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]" />
                <span className="truncate text-[11px] leading-none text-white/75">
                  Powered by Gemini
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-shrink-0 items-center gap-1.5">
            {conversationId && (
              <Link
                to={`/messages/${conversationId}`}
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/35"
                aria-label="Open full conversation"
              >
                <ArrowUpRight size={14} />
              </Link>
            )}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/35"
              aria-label="Close travel assistant"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Init error banner ── */}
      {initError && (
        <div className="flex-shrink-0 border-b border-amber-100 bg-amber-50 px-4 py-2.5 text-xs font-medium text-amber-800">
          Could not connect to chat. Messages won&apos;t be saved this session.
        </div>
      )}

      {/* ── Message list ── */}
      <div
        className="flex max-h-[420px] flex-1 flex-col gap-3 overflow-y-auto px-4 py-4 md:max-h-[480px]"
        style={{
          background: 'linear-gradient(180deg, #f8f9fb 0%, #f4f5f8 100%)',
          scrollbarWidth: 'thin',
          scrollbarColor: '#e2e8f0 transparent',
        }}
      >
        {loadingHistory ? (
          <div className="flex items-center justify-center gap-2 py-10 text-xs text-slate-400">
            <Loader2 size={14} className="animate-spin" />
            Loading conversation…
          </div>
        ) : (
          <>
            {messages.map((message) =>
              message.sender === 'assistant' ? (
                <div key={message.id} className="flex items-end gap-2 pr-10">
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-pink-600 shadow-sm shadow-rose-200">
                    <Sparkles size={11} className="text-white" />
                  </div>
                  <div className="rounded-2xl rounded-bl-md bg-white px-4 py-3 text-sm leading-relaxed text-slate-700 shadow-sm ring-1 ring-slate-100/80">
                    {message.text}
                  </div>
                </div>
              ) : (
                <div key={message.id} className="flex items-end justify-end pl-10">
                  <div className="rounded-2xl rounded-br-md bg-gradient-to-br from-rose-500 to-rose-600 px-4 py-3 text-sm leading-relaxed text-white shadow-sm shadow-rose-200">
                    {message.text}
                  </div>
                </div>
              )
            )}

            {isTyping && (
              <div className="flex items-end gap-2 pr-10">
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-pink-600 shadow-sm shadow-rose-200">
                  <Sparkles size={11} className="text-white" />
                </div>
                <div className="rounded-2xl rounded-bl-md bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100/80">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-300 [animation-delay:0ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-300 [animation-delay:150ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-300 [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Footer ── */}
      <div className="flex-shrink-0 border-t border-slate-100 bg-white px-4 pb-4 pt-3">

        {/* Quick prompts */}
        <div className="-mx-1 mb-3 flex gap-2 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => sendPrompt(prompt)}
              disabled={sending || isTyping}
              className="flex-shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-medium text-slate-600 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Send error */}
        {sendError && (
          <p className="mb-2 rounded-xl bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
            {sendError}
          </p>
        )}

        {/* Input row */}
        <form
          onSubmit={(e) => { e.preventDefault(); sendPrompt(input) }}
          className="flex items-center gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={userId ? 'Ask a travel question (saved)' : 'Ask a travel question…'}
            enterKeyHint="send"
            className="min-w-0 flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 transition-all focus:border-rose-300 focus:bg-white focus:ring-2 focus:ring-rose-100/70"
          />
          <button
            type="submit"
            disabled={sending || isTyping || !input.trim()}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-md shadow-rose-200 transition-all hover:shadow-rose-300 disabled:opacity-40 disabled:shadow-none"
            aria-label="Send assistant message"
          >
            {(sending || isTyping) ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </form>

        <p className="mt-2.5 text-center text-[10px] text-slate-400">
          {userId ? 'Signed in · messages saved to your account' : 'Sign in to save your conversation history'}
        </p>
      </div>
    </div>
  )
}
