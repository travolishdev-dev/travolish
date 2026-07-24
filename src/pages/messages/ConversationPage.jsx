import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCheck, ImagePlus, SendHorizonal } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import {
  PortalShell,
  SectionCard,
  SectionHeading,
} from '../../components/portal/PortalUI'
import { getConversation, getMessages, sendMessage } from '../../services/chatApi'
import { getUser } from '../../services/usersApi'
import useAuthStore from '../../stores/useAuthStore'

function formatTime(dt) {
  if (!dt) return ''
  try { return format(parseISO(dt), 'h:mm a · MMM d') } catch { return '' }
}

function formatFileSize(size) {
  if (!size) return ''
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

export default function ConversationPage() {
  const { t } = useTranslation('messages')
  const userId = useAuthStore((s) => s.backendUserId)
  const { id } = useParams()
  const [conversation, setConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [otherUserName, setOtherUserName] = useState(null)
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
        const otherId = conv.userId1 === userId ? conv.userId2 : conv.userId1
        if (otherId) {
          getUser(otherId).then((u) => {
            const name = [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email || null
            if (name) setOtherUserName(name)
          }).catch(() => {})
        }
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

  const quickReplies = useMemo(() => [
    t('quickReply.looksGreat'),
    t('quickReply.confirmArrival'),
    t('quickReply.checkInNotes'),
  ], [t])

  const receiverId = conversation
    ? conversation.userId1 === userId
      ? conversation.userId2
      : conversation.userId1
    : null

  const handleSend = async (msgText) => {
    const trimmed = (msgText ?? text).trim()
    if (!trimmed || !receiverId) return
    setText('')
    const optimistic = {
      id: `tmp-${Date.now()}`,
      senderId: userId,
      messageText: trimmed,
      createdAt: new Date().toISOString(),
      attachments: [],
      deliveryStatus: 'sending',
    }
    setMessages((prev) => [...prev, optimistic])
    setSending(true)
    try {
      const saved = await sendMessage({
        conversationId: Number(id),
        receiverId,
        messageText: trimmed,
      })
      setMessages((prev) =>
        prev.map((m) =>
          m.id === optimistic.id
            ? { ...saved, attachments: [], deliveryStatus: 'delivered' }
            : m,
        ),
      )
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id))
    } finally {
      setSending(false)
    }
  }

  function getReceiptLabel(message) {
    if (message.deliveryStatus === 'sending' || String(message.id).startsWith('tmp-')) return t('conv.receiptSending')
    if (message.readAt || message.isRead || message.readByReceiver) return t('conv.receiptRead')
    return t('conv.receiptDelivered')
  }

  if (loading) {
    return (
      <PortalShell eyebrow={t('conv.eyebrow')} title={t('conv.loadingTitle')} actions={[{ label: t('conv.backToInbox'), href: '/messages', secondary: true }]}>
        <SectionCard>
          <div className="py-16 text-center text-sm text-muted">{t('conv.fetchingMessages')}</div>
        </SectionCard>
      </PortalShell>
    )
  }

  if (!conversation) {
    return (
      <PortalShell eyebrow={t('conv.eyebrow')} title={t('conv.notFound')} actions={[{ label: t('conv.backToInbox'), href: '/messages' }]}>
        <SectionCard>
          <p className="text-sm text-muted">{t('conv.notFoundDesc')}</p>
        </SectionCard>
      </PortalShell>
    )
  }

  const otherUserId = conversation.userId1 === userId ? conversation.userId2 : conversation.userId1
  const unread = conversation.userId1 === userId ? conversation.user1UnreadCount : conversation.user2UnreadCount
  const displayName = otherUserName ?? `User #${otherUserId}`

  return (
    <PortalShell
      eyebrow={t('conv.eyebrow')}
      title={displayName}
      mobileTitle={t('conv.mobileTitle')}
      description={t('conv.desc')}
      actions={[
        { label: t('conv.backToInbox'), href: '/messages', secondary: true },
      ]}
      stats={[
        { label: t('conv.statThread'), value: `#${conversation.id}`, note: conversation.isActive ? t('conv.statActive') : t('conv.statInactive') },
        { label: t('conv.statParticipant'), value: displayName, note: t('conv.statOtherUser') },
        { label: t('conv.statUnread'), value: String(unread ?? 0), note: t('conv.statInThread') },
      ]}
      accent="from-sky-50 via-white to-emerald-50"
    >
      <Link
        to="/messages"
        className="inline-flex items-center gap-2 self-start text-sm font-semibold text-dark transition-colors hover:text-muted"
      >
        <ArrowLeft size={16} />
        {t('conv.backToInbox')}
      </Link>

      <SectionCard>
        <SectionHeading
          eyebrow={t('conv.sectionEyebrow')}
          title={t('conv.sectionTitlePattern', { id: conversation.id })}
          description={t('conv.sectionDesc')}
        />

        {/* Message list */}
        <div className="mt-6 space-y-4 max-h-[480px] overflow-y-auto pr-1">
          {messages.length === 0 && (
            <p className="py-10 text-center text-sm text-muted">{t('conv.noMessages')}</p>
          )}
          {messages.map((message) => {
            const isMe = message.senderId === userId
            const messageAttachments = Array.isArray(message.attachments) ? message.attachments : []
            return (
              <div key={message.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[86%] rounded-[24px] px-4 py-3 text-sm leading-7 md:max-w-[72%] ${
                    isMe ? 'bg-dark text-white' : 'border border-gray-200 bg-[#fcfcfb] text-dark'
                  }`}
                >
                  <p>{message.messageText}</p>
                  {messageAttachments.length > 0 && (
                    <div className="mt-3 grid gap-2">
                      {messageAttachments.map((file) => (
                        <div
                          key={file.id}
                          className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-xs ${
                            isMe ? 'bg-white/10 text-white' : 'bg-white text-dark'
                          }`}
                        >
                          <ImagePlus size={14} />
                          <span className="min-w-0 flex-1 truncate">{file.name}</span>
                          {file.size ? <span className={isMe ? 'text-white/60' : 'text-muted'}>{formatFileSize(file.size)}</span> : null}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className={`mt-2 flex flex-wrap items-center gap-2 text-xs ${isMe ? 'text-white/65' : 'text-muted'}`}>
                    <span>{formatTime(message.createdAt)}</span>
                    {isMe ? (
                      <span className="inline-flex items-center gap-1">
                        <CheckCheck size={13} />
                        {getReceiptLabel(message)}
                      </span>
                    ) : null}
                  </div>
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
        <div className="mt-4 rounded-[26px] border border-gray-200 bg-[#fcfcfb] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <textarea
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSend()
              }}
              placeholder={t('conv.composePlaceholder')}
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
        </div>
      </SectionCard>
    </PortalShell>
  )
}
