import { useEffect, useState } from 'react'
import { Bell, CheckCheck, Loader2, Mail, MessageSquareText, Smartphone } from 'lucide-react'
import {
  AccountShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/portal/PortalUI'
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from '../../services/notificationsApi'

const DEFAULT_PREFS = {
  emailEnabled: true,
  smsEnabled: false,
  inAppEnabled: true,
  bookingConfirmation: true,
  bookingReminder: true,
  checkInReminder: true,
  checkOutReminder: true,
  paymentNotifications: true,
  promotionalOffers: false,
  loyaltyUpdates: false,
  reviewRequests: true,
  accountAlerts: true,
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
}

const TYPE_ROWS = [
  { key: 'bookingConfirmation', label: 'Booking confirmations', description: 'When a booking is confirmed or modified.' },
  { key: 'bookingReminder',     label: 'Booking reminders',     description: 'Reminders before upcoming check-ins.' },
  { key: 'checkInReminder',     label: 'Check-in reminders',    description: 'Day-of check-in instructions and tips.' },
  { key: 'checkOutReminder',    label: 'Check-out reminders',   description: 'Reminders before your check-out time.' },
  { key: 'paymentNotifications',label: 'Payment updates',       description: 'Receipts, refunds, and payment failures.' },
  { key: 'reviewRequests',      label: 'Review requests',       description: 'Prompts to review a completed stay.' },
  { key: 'promotionalOffers',   label: 'Promotional offers',    description: 'Special deals and limited-time discounts.' },
  { key: 'loyaltyUpdates',      label: 'Loyalty updates',       description: 'Points earned and reward milestones.' },
  { key: 'accountAlerts',       label: 'Account alerts',        description: 'Security and account activity updates.' },
]

const CHANNEL_ROWS = [
  { key: 'emailEnabled',  label: 'Email',    icon: Mail },
  { key: 'smsEnabled',    label: 'SMS',      icon: Smartphone },
  { key: 'inAppEnabled',  label: 'In-app',   icon: Bell },
]

export default function NotificationSettingsPage() {
  const [prefs, setPrefs] = useState(DEFAULT_PREFS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState(null)

  useEffect(() => {
    getNotificationPreferences(1)
      .then((data) => setPrefs({ ...DEFAULT_PREFS, ...data }))
      .catch(() => {/* keep defaults */})
      .finally(() => setLoading(false))
  }, [])

  const toggle = (key) => {
    setSaved(false)
    setPrefs((p) => ({ ...p, [key]: !p[key] }))
  }

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    setSaveError(null)
    try {
      await updateNotificationPreferences(1, prefs)
      setSaved(true)
    } catch {
      setSaveError('Could not save preferences. Your account may need to receive its first notification before settings can be persisted.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AccountShell
      title="Choose how updates reach you."
      mobileTitle="Alerts"
      description="Control which notifications you receive and how they're delivered."
      mobileAction={{ label: 'Save', onClick: handleSave }}
      mobileBottomAction={{ label: 'Save preferences', onClick: handleSave }}
      actions={[
        { label: 'Open notification center', href: '/notifications', secondary: true },
        { label: 'Save preferences', href: '/account/notification-settings' },
      ]}
      accent="from-violet-50 via-white to-sky-50"
    >
      {loading ? (
        <SectionCard>
          <div className="py-16 text-center text-sm text-muted">Loading preferences…</div>
        </SectionCard>
      ) : (
        <>
          {/* Notification types */}
          <SectionCard>
            <SectionHeading
              eyebrow="Notification Types"
              title="What you want to hear about"
              description="Toggle each category on or off. Channel settings below control how they're delivered."
            />

            <div className="mt-6 divide-y divide-gray-200 border-y border-gray-200">
              {TYPE_ROWS.map(({ key, label, description }) => (
                <div key={key} className="flex items-center justify-between gap-4 py-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base font-semibold text-dark">{label}</p>
                      <StatusPill tone={prefs[key] ? 'success' : 'slate'}>
                        {prefs[key] ? 'On' : 'Off'}
                      </StatusPill>
                    </div>
                    <p className="mt-1 text-sm text-muted">{description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggle(key)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                      prefs[key] ? 'bg-dark' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                        prefs[key] ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </SectionCard>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Delivery channels */}
            <SectionCard>
              <SectionHeading
                eyebrow="Delivery Channels"
                title="How alerts reach you"
                description="Applies globally across all enabled notification types."
              />

              <div className="mt-6 grid gap-3">
                {CHANNEL_ROWS.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggle(key)}
                    className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3.5 text-sm font-semibold transition-colors ${
                      prefs[key]
                        ? 'border-dark bg-dark text-white'
                        : 'border-gray-200 bg-white text-dark hover:bg-gray-50'
                    }`}
                  >
                    <span className="inline-flex items-center gap-2">
                      <Icon size={15} />
                      {label}
                    </span>
                    <span className={`h-2.5 w-2.5 rounded-full ${prefs[key] ? 'bg-emerald-300' : 'bg-gray-300'}`} />
                  </button>
                ))}
              </div>
            </SectionCard>

            {/* Quiet hours */}
            <SectionCard>
              <SectionHeading
                eyebrow="Quiet Hours"
                title="Silence notifications at night"
                description="No alerts will be sent during this window."
              />

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-dark">Enable quiet hours</p>
                  <button
                    type="button"
                    onClick={() => toggle('quietHoursEnabled')}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                      prefs.quietHoursEnabled ? 'bg-dark' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
                        prefs.quietHoursEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className={`grid gap-4 md:grid-cols-2 transition-opacity ${prefs.quietHoursEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                  {[
                    { field: 'quietHoursStart', label: 'Start time' },
                    { field: 'quietHoursEnd',   label: 'End time' },
                  ].map(({ field, label }) => (
                    <label key={field} className="block">
                      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                        {label}
                      </span>
                      <input
                        type="time"
                        value={prefs[field] || ''}
                        onChange={(e) => { setSaved(false); setPrefs((p) => ({ ...p, [field]: e.target.value })) }}
                        className="w-full rounded-2xl border border-gray-200 bg-[#fcfcfb] px-4 py-3 text-base text-dark outline-none transition-colors focus:border-dark md:text-sm"
                      />
                    </label>
                  ))}
                </div>

                <div className="flex items-start gap-3 rounded-[24px] border border-dashed border-gray-200 bg-white p-4">
                  <div className="rounded-2xl bg-violet-50 p-3 text-violet-700">
                    <MessageSquareText size={18} />
                  </div>
                  <p className="text-sm leading-6 text-muted">
                    Urgent alerts like account security notices are always delivered regardless of quiet hours.
                  </p>
                </div>
              </div>
            </SectionCard>
          </div>

          {/* Save bar */}
          <div className="flex items-center justify-between gap-4 rounded-[24px] border border-gray-200 bg-[#fcfcfb] px-5 py-4">
            {saved ? (
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600">
                <CheckCheck size={15} /> Preferences saved
              </p>
            ) : saveError ? (
              <p className="text-sm text-red-600">{saveError}</p>
            ) : (
              <p className="text-sm text-muted">Changes are not saved until you click below.</p>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-dark px-6 py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-40 transition-all"
            >
              {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : 'Save preferences'}
            </button>
          </div>
        </>
      )}
    </AccountShell>
  )
}
