import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCheck, ImagePlus, Paperclip, SendHorizonal, X } from 'lucide-react'
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

function formatFileSize(size) {
  if (!size) return ''
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

export default function ConversationPage() {
  const { id } = useParams()
  const [conversation, setConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [attachments, setAttachments] = useState([])
  const [attachmentNotice, setAttachmentNotice] = useState(null)
  const [typingPulse, setTypingPulse] = useState(false)
  const bottomRef = useRef(null)
  const fileInputRef = useRef(null)

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

  useEffect(() => {
    if (!conversation?.id) return undefined

    const start = window.setTimeout(() => setTypingPulse(true), 1200)
    const stop = window.setTimeout(() => setTypingPulse(false), 3800)
    const interval = window.setInterval(() => {
      setTypingPulse(true)
      window.setTimeout(() => setTypingPulse(false), 2600)
    }, 12000)

    return () => {
      window.clearTimeout(start)
      window.clearTimeout(stop)
      window.clearInterval(interval)
    }
  }, [conversation?.id])

  const receiverId = conversation
    ? conversation.userId1 === MY_USER_ID
      ? conversation.userId2
      : conversation.userId1
    : null

  const handleSend = async (msgText) => {
    const trimmed = (msgText ?? text).trim()
    const attachedFiles = msgText ? [] : attachments
    if ((!trimmed && attachedFiles.length === 0) || !receiverId) return
    setText('')
    setAttachments([])
    setAttachmentNotice(null)
    const optimistic = {
      id: `tmp-${Date.now()}`,
      senderId: MY_USER_ID,
      messageText: trimmed || `${attachedFiles.length} attachment${attachedFiles.length === 1 ? '' : 's'}`,
      createdAt: new Date().toISOString(),
      attachments: attachedFiles,
      deliveryStatus: 'sending',
    }
    setMessages((prev) => [...prev, optimistic])
    setSending(true)
    try {
      const saved = await sendMessage({
        conversationId: Number(id),
        receiverId,
        messageText: trimmed || optimistic.messageText,
      })
      setMessages((prev) =>
        prev.map((m) =>
          m.id === optimistic.id
            ? { ...saved, attachments: attachedFiles, deliveryStatus: 'delivered' }
            : m,
        ),
      )
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id))
    } finally {
      setSending(false)
    }
  }

  function handleAttachFiles(event) {
    const selected = Array.from(event.target.files ?? []).map((file) => ({
      id: `${file.name}-${file.lastModified}`,
      name: file.name,
      size: file.size,
      type: file.type,
    }))
    if (!selected.length) return

    setAttachments((prev) => [...prev, ...selected].slice(0, 5))
    setAttachmentNotice(`${selected.length} file${selected.length === 1 ? '' : 's'} ready to send.`)
    event.target.value = ''
  }

  function removeAttachment(fileId) {
    setAttachments((prev) => prev.filter((file) => file.id !== fileId))
  }

  function getReceiptLabel(message) {
    if (message.deliveryStatus === 'sending' || String(message.id).startsWith('tmp-')) return 'Sending'
    if (message.readAt || message.isRead || message.readByReceiver) return 'Read'
    return 'Delivered'
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
          {typingPulse && (
            <div className="flex justify-start">
              <div className="inline-flex items-center gap-2 rounded-[22px] border border-gray-200 bg-[#fcfcfb] px-4 py-3 text-sm text-muted">
                <span>User #{otherUserId} is typing</span>
                <span className="flex gap-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:120ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:240ms]" />
                </span>
              </div>
            </div>
          )}
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
          {attachmentNotice ? (
            <p className="mb-3 rounded-2xl bg-rose-50 px-3 py-2 text-xs font-semibold text-brand">
              {attachmentNotice}
            </p>
          ) : null}
          {attachments.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {attachments.map((file) => (
                <span
                  key={file.id}
                  className="inline-flex max-w-full items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-dark"
                >
                  <Paperclip size={13} />
                  <span className="max-w-[180px] truncate">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(file.id)}
                    className="inline-flex h-5 w-5 items-center justify-center rounded-full text-muted hover:bg-gray-100 hover:text-dark"
                    aria-label={`Remove ${file.name}`}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
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
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleAttachFiles}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex h-12 w-full items-center justify-center rounded-2xl border border-gray-200 bg-white text-dark transition-colors hover:bg-gray-50 sm:w-12"
            aria-label="Attach files"
          >
            <Paperclip size={16} />
          </button>
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={(!text.trim() && attachments.length === 0) || sending}
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
