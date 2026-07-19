import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Bell, CalendarCheck, CheckCheck, CreditCard, Gift, Loader2, LogIn, LogOut, Mail, MessageSquareText, Moon, Shield, Smartphone, Star, Tag } from 'lucide-react'
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
import usePortalViewer from '../../hooks/usePortalViewer'
import { findUserByEmail, createUser } from '../../services/usersApi'

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

const TYPE_ICONS = {
  bookingConfirmation:  { Icon: CalendarCheck, bg: 'bg-emerald-50 text-emerald-700' },
  bookingReminder:      { Icon: Bell,          bg: 'bg-sky-50 text-sky-700' },
  checkInReminder:      { Icon: LogIn,         bg: 'bg-violet-50 text-violet-700' },
  checkOutReminder:     { Icon: LogOut,        bg: 'bg-amber-50 text-amber-700' },
  paymentNotifications: { Icon: CreditCard,    bg: 'bg-rose-50 text-brand' },
  reviewRequests:       { Icon: Star,          bg: 'bg-amber-50 text-amber-600' },
  promotionalOffers:    { Icon: Tag,           bg: 'bg-slate-100 text-slate-600' },
  loyaltyUpdates:       { Icon: Gift,          bg: 'bg-emerald-50 text-emerald-700' },
  accountAlerts:        { Icon: Shield,        bg: 'bg-red-50 text-red-600' },
}

export default function NotificationSettingsPage() {
  const { t } = useTranslation('notifications')
  const { viewer } = usePortalViewer()
  const [backendUserId, setBackendUserId] = useState(null)
  const [prefs, setPrefs] = useState(DEFAULT_PREFS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState(null)

  useEffect(() => {
    const email = viewer.email
    if (!email) {
      setLoading(false)
      return
    }

    const nameParts = (viewer.fullName ?? '').trim().split(' ')
    findUserByEmail(email)
      .catch(async (err) => {
        if (!err.message?.includes('404')) throw err
        return createUser({ firstName: nameParts[0] ?? '', lastName: nameParts.slice(1).join(' '), email })
      })
      .then((user) => {
        setBackendUserId(user.id)
        return getNotificationPreferences(user.id)
      })
      .then((data) => setPrefs({ ...DEFAULT_PREFS, ...data }))
      .catch(() => {/* keep defaults on any error */})
      .finally(() => setLoading(false))
  }, [viewer.email])

  const TYPE_ROWS = useMemo(() => [
    { key: 'bookingConfirmation',  label: t('notifications:types.bookingConfirmation'),  description: t('notifications:types.bookingConfirmationDesc') },
    { key: 'bookingReminder',      label: t('notifications:types.bookingReminder'),      description: t('notifications:types.bookingReminderDesc') },
    { key: 'checkInReminder',      label: t('notifications:types.checkInReminder'),      description: t('notifications:types.checkInReminderDesc') },
    { key: 'checkOutReminder',     label: t('notifications:types.checkOutReminder'),     description: t('notifications:types.checkOutReminderDesc') },
    { key: 'paymentNotifications', label: t('notifications:types.paymentNotifications'), description: t('notifications:types.paymentNotificationsDesc') },
    { key: 'reviewRequests',       label: t('notifications:types.reviewRequests'),       description: t('notifications:types.reviewRequestsDesc') },
    { key: 'promotionalOffers',    label: t('notifications:types.promotionalOffers'),    description: t('notifications:types.promotionalOffersDesc') },
    { key: 'loyaltyUpdates',       label: t('notifications:types.loyaltyUpdates'),       description: t('notifications:types.loyaltyUpdatesDesc') },
    { key: 'accountAlerts',        label: t('notifications:types.accountAlerts'),        description: t('notifications:types.accountAlertsDesc') },
  ], [t])

  const CHANNEL_ROWS = useMemo(() => [
    { key: 'emailEnabled', label: t('notifications:channels.email'), icon: Mail,       desc: 'Inbox updates' },
    { key: 'smsEnabled',   label: t('notifications:channels.sms'),   icon: Smartphone, desc: 'Text messages' },
    { key: 'inAppEnabled', label: t('notifications:channels.inApp'), icon: Bell,       desc: 'In-app alerts' },
  ], [t])

  const toggle = (key) => {
    setSaved(false)
    setPrefs((p) => ({ ...p, [key]: !p[key] }))
  }

  const handleSave = async () => {
    if (!backendUserId) {
      setSaveError(t('notifications:settingsAuthError'))
      return
    }
    setSaving(true)
    setSaved(false)
    setSaveError(null)
    try {
      await updateNotificationPreferences(backendUserId, prefs)
      setSaved(true)
    } catch {
      setSaveError(t('notifications:settingsSaveError'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <AccountShell
      title={t('notifications:settingsTitle')}
      mobileTitle={t('notifications:settingsMobileTitle')}
      description={t('notifications:settingsDesc')}
      mobileAction={{ label: t('notifications:settingsSaveMobile'), onClick: handleSave }}
      mobileBottomAction={{ label: t('notifications:settingsSaveBtn'), onClick: handleSave }}
      actions={[
        { label: t('notifications:settingsOpenCenter'), href: '/notifications', secondary: true },
        { label: t('notifications:settingsSaveBtn'), onClick: handleSave },
      ]}
      accent="from-violet-50 via-white to-sky-50"
    >
      {loading ? (
        <SectionCard>
          <div className="py-16 text-center text-sm text-muted">{t('notifications:settingsLoading')}</div>
        </SectionCard>
      ) : (
        <>
          {/* Notification types */}
          <SectionCard>
            <SectionHeading
              eyebrow={t('notifications:typesEyebrow')}
              title={t('notifications:typesTitle')}
              description={t('notifications:typesDesc')}
            />

            <div className="mt-6 divide-y divide-gray-200 border-y border-gray-200">
              {TYPE_ROWS.map(({ key, label, description }) => {
                const meta = TYPE_ICONS[key]
                return (
                  <div key={key} className="flex items-center justify-between gap-4 py-4">
                    <div className="flex items-start gap-3 min-w-0">
                      {meta && (
                        <div className={`flex-shrink-0 rounded-xl p-2 ${meta.bg}`}>
                          <meta.Icon size={15} />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-base font-semibold text-dark">{label}</p>
                          <StatusPill tone={prefs[key] ? 'success' : 'slate'}>
                            {prefs[key] ? t('notifications:on') : t('notifications:off')}
                          </StatusPill>
                        </div>
                        <p className="mt-1 text-sm text-muted">{description}</p>
                      </div>
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
                )
              })}
            </div>
          </SectionCard>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Delivery channels */}
            <SectionCard>
              <SectionHeading
                eyebrow={t('notifications:channelsEyebrow')}
                title={t('notifications:channelsTitle')}
                description={t('notifications:channelsDesc')}
              />

              <div className="mt-6 grid gap-3">
                {CHANNEL_ROWS.map(({ key, label, icon: Icon, desc }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggle(key)}
                    className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-4 text-sm font-semibold transition-colors ${
                      prefs[key]
                        ? 'border-dark bg-dark text-white'
                        : 'border-gray-200 bg-[#fcfcfb] text-dark hover:bg-gray-50'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className={`rounded-xl p-2 ${prefs[key] ? 'bg-white/10' : 'bg-gray-100'}`}>
                        <Icon size={14} />
                      </span>
                      <span className="flex flex-col items-start gap-0.5">
                        <span>{label}</span>
                        <span className={`text-xs font-normal ${prefs[key] ? 'text-white/60' : 'text-muted'}`}>{desc}</span>
                      </span>
                    </span>
                    <span className={`h-2.5 w-2.5 rounded-full ${prefs[key] ? 'bg-emerald-300' : 'bg-gray-300'}`} />
                  </button>
                ))}
              </div>
            </SectionCard>

            {/* Quiet hours */}
            <SectionCard>
              <SectionHeading
                eyebrow={t('notifications:quietEyebrow')}
                title={t('notifications:quietTitle')}
                description={t('notifications:quietDesc')}
              />

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="flex items-center gap-2 text-sm font-semibold text-dark">
                    <Moon size={14} className="text-violet-500" />
                    {t('notifications:quietEnable')}
                  </p>
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
                    { field: 'quietHoursStart', label: t('notifications:quietStart') },
                    { field: 'quietHoursEnd',   label: t('notifications:quietEnd') },
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
                    {t('notifications:quietNote')}
                  </p>
                </div>
              </div>
            </SectionCard>
          </div>

          {/* Save bar */}
          <div className="flex items-center justify-between gap-4 rounded-[24px] border border-gray-200 bg-[#fcfcfb] px-5 py-4">
            {saved ? (
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600">
                <CheckCheck size={15} /> {t('notifications:settingsSaved')}
              </p>
            ) : saveError ? (
              <p className="text-sm text-red-600">{saveError}</p>
            ) : (
              <p className="text-sm text-muted">{t('notifications:settingsUnsaved')}</p>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-dark px-6 py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-40 transition-all"
            >
              {saving ? <><Loader2 size={14} className="animate-spin" /> {t('notifications:settingsSaving')}</> : t('notifications:settingsSaveBtn')}
            </button>
          </div>
        </>
      )}
    </AccountShell>
  )
}
