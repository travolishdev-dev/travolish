import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BellRing, CheckCheck, Clock3, Filter, Trash2 } from 'lucide-react'
import { formatDistanceToNow, isThisWeek, isToday, parseISO } from 'date-fns'
import {
  PortalShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../components/portal/PortalUI'
import { listNotifications, markNotificationRead } from '../services/notificationsApi'

const TYPE_TONE = {
  BOOKING_CONFIRMATION: 'success',
  BOOKING_REMINDER: 'brand',
  BOOKING_CANCELLATION: 'warning',
  BOOKING_MODIFIED: 'sky',
  CHECK_IN_REMINDER: 'brand',
  CHECK_OUT_REMINDER: 'brand',
  PAYMENT_RECEIVED: 'success',
  PAYMENT_FAILED: 'warning',
  REVIEW_REQUEST: 'sky',
  PROMOTIONAL_OFFER: 'violet',
  ACCOUNT_ALERT: 'warning',
}

const TYPE_ACTION = {
  BOOKING_CONFIRMATION: (n) => ({ label: 'View booking', href: n.bookingId ? `/trips/${n.bookingId}` : '/trips' }),
  BOOKING_REMINDER:    (n) => ({ label: 'View booking', href: n.bookingId ? `/trips/${n.bookingId}` : '/trips' }),
  BOOKING_CANCELLATION:() => ({ label: 'Browse stays', href: '/search' }),
  CHECK_IN_REMINDER:   (n) => ({ label: 'View booking', href: n.bookingId ? `/trips/${n.bookingId}` : '/trips' }),
  CHECK_OUT_REMINDER:  (n) => ({ label: 'View booking', href: n.bookingId ? `/trips/${n.bookingId}` : '/trips' }),
  PAYMENT_RECEIVED:    () => ({ label: 'View trips',   href: '/trips' }),
  PAYMENT_FAILED:      () => ({ label: 'View trips',   href: '/trips' }),
  REVIEW_REQUEST:      (n) => ({ label: 'Leave review', href: n.hotelId ? `/reviews/new?hotelId=${n.hotelId}` : '/trips' }),
  PROMOTIONAL_OFFER:   () => ({ label: 'Browse stays', href: '/search' }),
}

const SECTION_ORDER = ['Today', 'This week', 'Earlier']

function getSection(createdAt) {
  try {
    const d = parseISO(createdAt)
    if (isToday(d)) return 'Today'
    if (isThisWeek(d)) return 'This week'
    return 'Earlier'
  } catch {
    return 'Earlier'
  }
}

function adaptNotification(n) {
  const actionFn = TYPE_ACTION[n.type] || (() => ({ label: 'View', href: '/notifications' }))
  const { label, href } = actionFn(n)
  return {
    id: n.id,
    type: n.type || 'GENERAL',
    section: n.createdAt ? getSection(n.createdAt) : 'Earlier',
    title: n.subject || n.type || 'Notification',
    body: n.message || '',
    tone: TYPE_TONE[n.type] || 'slate',
    time: n.createdAt ? formatDistanceToNow(parseISO(n.createdAt), { addSuffix: true }) : '',
    isRead: !!n.isRead,
    actionLabel: label,
    actionHref: href,
  }
}

export default function NotificationsPage() {
  const [raw, setRaw] = useState([])
  const [loading, setLoading] = useState(true)
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)
  const [activeType, setActiveType] = useState('ALL')
  const [dismissedIds, setDismissedIds] = useState([])

  useEffect(() => {
    listNotifications(1, { size: 50 })
      .then((data) => setRaw(data.content ?? data))
      .catch((error) => { void error })
      .finally(() => setLoading(false))
  }, [])

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id)
      setRaw((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
    } catch (error) {
      void error
    }
  }

  const adapted = useMemo(() => raw.map(adaptNotification), [raw])
  const unreadCount = adapted.filter((n) => !n.isRead).length
  const typeOptions = useMemo(
    () => ['ALL', ...new Set(adapted.map((notification) => notification.type))],
    [adapted],
  )
  const visible = adapted.filter((notification) => {
    if (dismissedIds.includes(notification.id)) return false
    if (showUnreadOnly && notification.isRead) return false
    if (activeType !== 'ALL' && notification.type !== activeType) return false
    return true
  })

  const handleMarkAllRead = async () => {
    const unreadIds = adapted.filter((notification) => !notification.isRead).map((notification) => notification.id)
    if (!unreadIds.length) return

    setRaw((prev) => prev.map((notification) => ({ ...notification, isRead: true })))
    await Promise.allSettled(unreadIds.map((id) => markNotificationRead(id)))
  }

  const handleDismiss = (id) => {
    setDismissedIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
  }

  const grouped = useMemo(() => {
    const acc = {}
    visible.forEach((n) => {
      if (!acc[n.section]) acc[n.section] = []
      acc[n.section].push(n)
    })
    return acc
  }, [visible])

  const orderedSections = SECTION_ORDER.filter((s) => grouped[s])

  return (
    <PortalShell
      eyebrow="Notifications"
      title="Recent updates."
      mobileTitle="Notifications"
      description="Booking milestones, reminders, and account alerts all in one place."
      actions={[
        { label: 'Notification settings', href: '/account/notification-settings', secondary: true },
      ]}
      stats={[
        { label: 'Unread updates', value: String(unreadCount), note: 'Across trips and messages' },
        { label: 'Total', value: String(adapted.length), note: 'All notifications' },
        { label: 'Delivery mode', value: 'Smart', note: 'Push + email mix' },
      ]}
      accent="from-violet-50 via-white to-rose-50"
    >
      <SectionCard>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <SectionHeading
            eyebrow="Inbox"
            title="Latest updates"
            description="Grouped by recency so the page stays easy to scan on mobile."
          />

          <div className="grid gap-2 sm:flex sm:flex-wrap sm:gap-3">
            <label className="inline-flex w-full items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-dark sm:w-auto">
              <Filter size={15} />
              <select
                value={activeType}
                onChange={(event) => setActiveType(event.target.value)}
                className="bg-transparent text-sm font-semibold outline-none"
                aria-label="Filter notifications by type"
              >
                {typeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type === 'ALL' ? 'All types' : type.replace(/_/g, ' ').toLowerCase()}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={() => setShowUnreadOnly(false)}
              className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors sm:w-auto ${
                !showUnreadOnly ? 'bg-dark text-white' : 'border border-gray-200 bg-white text-dark hover:bg-gray-50'
              }`}
            >
              <BellRing size={15} />
              All notifications
            </button>
            <button
              type="button"
              onClick={() => setShowUnreadOnly(true)}
              className={`rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
                showUnreadOnly ? 'bg-dark text-white' : 'border border-gray-200 bg-white text-dark hover:bg-gray-50'
              }`}
            >
              Only unread
            </button>
            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-dark transition-colors hover:bg-gray-50 disabled:opacity-45"
            >
              <CheckCheck size={15} />
              Mark all read
            </button>
          </div>
        </div>

        {loading && (
          <div className="py-16 text-center text-sm text-muted">Loading notifications…</div>
        )}

        {!loading && visible.length === 0 && (
          <div className="py-16 text-center text-sm text-muted">
            {showUnreadOnly ? 'No unread notifications.' : 'No notifications yet.'}
          </div>
        )}

        {!loading && visible.length > 0 && (
          <div className="mt-6 space-y-8">
            {orderedSections.map((section) => (
              <div key={section}>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  {section}
                </p>
                <div className="mt-4 divide-y divide-gray-200 border-y border-gray-200">
                  {grouped[section].map((notification) => (
                    <div
                      key={notification.id}
                      className={`py-5 transition-opacity ${notification.isRead ? 'opacity-50' : ''}`}
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="max-w-3xl">
                          <div className="flex flex-wrap items-center gap-2">
                            <StatusPill tone={notification.tone}>
                              {notification.isRead ? 'Read' : 'New'}
                            </StatusPill>
                            <StatusPill tone="slate">
                              {notification.type.replace(/_/g, ' ').toLowerCase()}
                            </StatusPill>
                            {notification.time && (
                              <span className="inline-flex items-center gap-1 text-sm text-muted">
                                <Clock3 size={14} />
                                {notification.time}
                              </span>
                            )}
                          </div>
                          <h2 className="mt-3 text-xl font-semibold tracking-tight text-dark">
                            {notification.title}
                          </h2>
                          <p className="mt-2 text-sm leading-7 text-muted">{notification.body}</p>
                        </div>

                        <div className="grid w-full gap-2 sm:flex sm:w-auto sm:flex-wrap sm:gap-3">
                          <Link
                            to={notification.actionHref}
                            className="inline-flex w-full items-center justify-center rounded-full bg-dark px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 sm:w-auto"
                          >
                            {notification.actionLabel}
                          </Link>
                          {!notification.isRead && (
                            <button
                              type="button"
                              onClick={() => handleMarkRead(notification.id)}
                              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-dark transition-colors hover:bg-gray-50 sm:w-auto"
                            >
                              <CheckCheck size={14} />
                              Mark read
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDismiss(notification.id)}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-dark transition-colors hover:bg-gray-50 sm:w-auto"
                          >
                            <Trash2 size={14} />
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </PortalShell>
  )
}
