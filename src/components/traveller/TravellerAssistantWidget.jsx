import { useEffect, useRef, useState } from 'react'
import { Loader2, Send, Sparkles, X } from 'lucide-react'
import TravolishWordmark from '../common/TravolishWordmark'
import { getOrCreateConversation, getMessages, sendMessage } from '../../services/chatApi'
import useAuthStore from '../../stores/useAuthStore'

const SUPPORT_USER_ID = 4

const QUICK_PROMPTS = [
  'Find stays with free cancellation',
  'What should I check before booking?',
  'Help me compare two properties',
]

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
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Hello! I'm Travolish AI, your friendly travel assistant. How can I help you with your travel plans or a current booking today? 😊",
    },
  ])
  const [conversationId, setConversationId] = useState(null)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [sending, setSending] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [isBubbleVisible, setIsBubbleVisible] = useState(false)
  const bottomRef = useRef(null)

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
          .reverse()

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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendPrompt = async (prompt) => {
    const trimmed = prompt.trim()
    if (!trimmed || sending || isTyping) return

    setMessages((prev) => [...prev, { id: `guest-${Date.now()}`, sender: 'guest', text: trimmed }])
    setInput('')

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
      // Message failed to persist
    } finally {
      setSending(false)
    }

    if (!sent) return

    setIsTyping(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 2500))
      const history = await getMessages(conversationId, { pageSize: 50 })
      const items = (history?.content ?? (Array.isArray(history) ? history : []))
        .filter((m) => !m.isDeleted)
        .reverse()
      if (items.length > 0) setMessages(mapBackendMessages(items, userId))
    } catch {
      // Polling failed
    } finally {
      setIsTyping(false)
    }
  }

  /* ── FAB (closed state) ─────────────────────────────────── */
  if (!isOpen) {
    return (
      <>
        {isBubbleVisible && (
          <div className="traveller-assistant-cloud fixed bottom-[calc(9.4rem+env(safe-area-inset-bottom))] end-3 z-40 max-w-[224px] animate-in fade-in duration-150 md:bottom-[5.9rem] md:end-5">
            <p className="relative z-10 px-1 text-center text-xs font-semibold leading-5 text-dark">
              Ask me about stays, deals, trips, or safety.
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
          <TravolishWordmark className="h-6" style={{ filter: 'brightness(0) invert(1)' }} />
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
        {/* subtle dot grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '18px 18px',
          }}
        />
        <div className="relative flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* avatar */}
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
                  {userId ? 'Live · Powered by Gemini' : 'Online · Ready to help'}
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/35"
            aria-label="Close travel assistant"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* ── Message list ── */}
      <div
        className="flex max-h-[320px] flex-1 flex-col gap-3 overflow-y-auto px-4 py-4"
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
                /* Assistant bubble */
                <div key={message.id} className="flex items-end gap-2 pr-10">
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-pink-600 shadow-sm shadow-rose-200">
                    <Sparkles size={11} className="text-white" />
                  </div>
                  <div className="rounded-2xl rounded-bl-md bg-white px-4 py-3 text-sm leading-relaxed text-slate-700 shadow-sm ring-1 ring-slate-100/80">
                    {message.text}
                  </div>
                </div>
              ) : (
                /* Guest bubble */
                <div key={message.id} className="flex items-end justify-end pl-10">
                  <div className="rounded-2xl rounded-br-md bg-gradient-to-br from-rose-500 to-rose-600 px-4 py-3 text-sm leading-relaxed text-white shadow-sm shadow-rose-200">
                    {message.text}
                  </div>
                </div>
              )
            )}

            {/* Typing indicator */}
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

        {/* Quick prompts — horizontal scroll row */}
        <div className="-mx-1 mb-3 flex gap-2 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {QUICK_PROMPTS.map((prompt) => (
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

        {/* Footer note */}
        <p className="mt-2.5 text-center text-[10px] text-slate-400">
          {userId ? 'Signed in · messages saved to your account' : 'Sign in to save your conversation history'}
        </p>
      </div>
    </div>
  )
}
