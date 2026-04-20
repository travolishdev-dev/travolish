import { Bell, Mail, MessageSquareText, Smartphone } from 'lucide-react'
import {
  AccountShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/portal/PortalUI'
import { notificationPreferences } from '../../data/mockPortalData'

export default function NotificationSettingsPage() {
  return (
    <AccountShell
      title="Choose how updates reach you."
      mobileTitle="Alerts"
      description="This settings page is built to map cleanly to notification preference APIs later, but the UI is already complete and responsive."
      mobileAction={{ label: 'Save', href: '/account/notification-settings' }}
      mobileBottomAction={{
        label: 'Save preferences',
        href: '/account/notification-settings',
      }}
      actions={[
        { label: 'Open notification center', href: '/notifications', secondary: true },
        { label: 'Save preferences', href: '/account/notification-settings' },
      ]}
      accent="from-violet-50 via-white to-sky-50"
    >
      <SectionCard>
        <SectionHeading
          eyebrow="Delivery Rules"
          title="Preference matrix"
          description="Rows represent the type of update. Columns represent the delivery channel. This layout remains readable on mobile by stacking the controls into individual cards."
        />

        <div className="mt-6 divide-y divide-gray-200 border-y border-gray-200">
          {notificationPreferences.map((preference) => (
            <div key={preference.id} className="py-5">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div className="max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-lg font-semibold text-dark">
                      {preference.label}
                    </p>
                    <StatusPill
                      tone={
                        preference.email || preference.push || preference.sms
                          ? 'success'
                          : 'slate'
                      }
                    >
                      {preference.email || preference.push || preference.sms
                        ? 'Enabled'
                        : 'Off'}
                    </StatusPill>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {preference.description}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    {
                      label: 'Email',
                      icon: Mail,
                      enabled: preference.email,
                    },
                    {
                      label: 'Push',
                      icon: Bell,
                      enabled: preference.push,
                    },
                    {
                      label: 'SMS',
                      icon: Smartphone,
                      enabled: preference.sms,
                    },
                  ].map((channel) => {
                    const Icon = channel.icon

                    return (
                      <button
                        key={channel.label}
                        type="button"
                        className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors ${
                          channel.enabled
                            ? 'border-dark bg-dark text-white'
                            : 'border-gray-200 bg-white text-dark hover:bg-gray-50'
                        }`}
                      >
                        <span className="inline-flex items-center gap-2">
                          <Icon size={15} />
                          {channel.label}
                        </span>
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${
                            channel.enabled ? 'bg-emerald-300' : 'bg-gray-300'
                          }`}
                        />
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard>
          <SectionHeading
            eyebrow="Quiet Hours"
            title="Respect time zones and urgency"
            description="A later API integration can save these values directly without changing the visual system."
          />

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {['Start time', 'End time', 'Time zone', 'Fallback channel'].map(
              (field) => (
                <label key={field} className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                    {field}
                  </span>
                  <input
                    type="text"
                    placeholder={`Set ${field.toLowerCase()}`}
                    className="w-full rounded-2xl border border-gray-200 bg-[#fcfcfb] px-4 py-3 text-base text-dark outline-none transition-colors focus:border-dark md:text-sm"
                  />
                </label>
              ),
            )}
          </div>
        </SectionCard>

        <SectionCard className="hidden md:block">
          <SectionHeading
            eyebrow="Messaging Style"
            title="How alerts should feel"
            description="Small preference chips give the page a more premium character than a plain settings grid."
          />

          <div className="mt-6 flex flex-wrap gap-3">
            {[
              'Important only',
              'All booking milestones',
              'Host messages instantly',
              'Weekly digest',
              'Promo offers monthly',
            ].map((chip, index) => (
              <button
                key={chip}
                type="button"
                className={`rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
                  index < 2
                    ? 'bg-dark text-white'
                    : 'border border-gray-200 bg-white text-dark hover:bg-gray-50'
                }`}
              >
                {chip}
              </button>
            ))}
          </div>

          <div className="mt-5 border-t border-dashed border-gray-200 pt-5">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-violet-50 p-3 text-violet-700">
                <MessageSquareText size={18} />
              </div>
              <p className="text-sm leading-6 text-muted">
                Notification templates and scheduling controls can later share the same
                component language across guest and admin surfaces.
              </p>
            </div>
          </div>
        </SectionCard>
      </div>
    </AccountShell>
  )
}
