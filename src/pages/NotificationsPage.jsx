import { Link } from 'react-router-dom'
import { BellRing, CheckCheck, Clock3 } from 'lucide-react'
import {
  PortalShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../components/portal/PortalUI'
import { notifications } from '../data/mockPortalData'

const groupedNotifications = notifications.reduce((groups, notification) => {
  if (!groups[notification.section]) {
    groups[notification.section] = []
  }

  groups[notification.section].push(notification)
  return groups
}, {})

export default function NotificationsPage() {
  return (
    <PortalShell
      eyebrow="Notifications"
      title="Recent updates."
      mobileTitle="Notifications"
      description="The notification center is designed as a high-signal inbox for booking milestones, host messages, and account alerts. It will later connect cleanly to user notification APIs."
      actions={[
        {
          label: 'Notification settings',
          href: '/account/notification-settings',
          secondary: true,
        },
        { label: 'Mark all as read', href: '/notifications' },
      ]}
      stats={[
        { label: 'Unread updates', value: '5', note: 'Across trips and messages' },
        { label: 'High priority', value: '2', note: 'Requires attention today' },
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
            <button
              type="button"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-dark px-4 py-2.5 text-sm font-semibold text-white sm:w-auto"
            >
              <BellRing size={15} />
              All notifications
            </button>
            <button
              type="button"
              className="rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-dark transition-colors hover:bg-gray-50"
            >
              Only unread
            </button>
          </div>
        </div>

        <div className="mt-6 space-y-8">
          {Object.entries(groupedNotifications).map(([section, items]) => (
            <div key={section}>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                {section}
              </p>
              <div className="mt-4 divide-y divide-gray-200 border-y border-gray-200">
                {items.map((notification) => (
                  <div key={notification.id} className="py-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="max-w-3xl">
                        <div className="flex flex-wrap items-center gap-2">
                          <StatusPill tone={notification.tone}>New</StatusPill>
                          <span className="inline-flex items-center gap-1 text-sm text-muted">
                            <Clock3 size={14} />
                            {notification.time}
                          </span>
                        </div>

                        <h2 className="mt-3 text-xl font-semibold tracking-tight text-dark">
                          {notification.title}
                        </h2>
                        <p className="mt-2 text-sm leading-7 text-muted">
                          {notification.body}
                        </p>
                      </div>

                      <div className="grid w-full gap-2 sm:flex sm:w-auto sm:flex-wrap sm:gap-3">
                        <Link
                          to={notification.actionHref}
                          className="inline-flex w-full items-center justify-center rounded-full bg-dark px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 sm:w-auto"
                        >
                          {notification.actionLabel}
                        </Link>
                        <button
                          type="button"
                          className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-dark transition-colors hover:bg-gray-50 sm:w-auto"
                        >
                          <CheckCheck size={14} />
                          Mark read
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </PortalShell>
  )
}
