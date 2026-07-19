import {
  Apple,
  CheckCircle2,
  Clock3,
  Globe2,
  LaptopMinimal,
  ShieldCheck,
  Smartphone,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  AccountShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/portal/PortalUI'
import useAuthStore from '../../stores/useAuthStore'

const PROVIDER_META = {
  google: {
    label: 'Google',
    Icon: Globe2,
    authNote: 'Your account is secured via Google OAuth. No password is stored on Travolish servers.',
  },
  apple: {
    label: 'Apple',
    Icon: Apple,
    authNote: 'Your account is secured via Apple Sign-In. Your email may be relayed by Apple.',
  },
}

const ALL_PROVIDERS = ['google', 'apple']

function maskEmail(email) {
  if (!email) return '—'
  const [local, domain] = email.split('@')
  if (!domain) return email
  const visible = local.length > 3 ? local.slice(0, 3) : local.slice(0, 1)
  return `${visible}…@${domain}`
}

function detectDevice() {
  const ua = typeof navigator !== 'undefined' ? (navigator.userAgent || '') : ''
  if (/iPhone/.test(ua)) return { label: 'iPhone', Icon: Smartphone }
  if (/iPad/.test(ua)) return { label: 'iPad', Icon: Smartphone }
  if (/Android/.test(ua)) return { label: 'Android device', Icon: Smartphone }
  if (/Mac OS X/.test(ua) && !/Mobile/.test(ua)) return { label: 'Mac', Icon: LaptopMinimal }
  if (/Windows/.test(ua)) return { label: 'Windows PC', Icon: LaptopMinimal }
  if (/Linux/.test(ua)) return { label: 'Linux device', Icon: LaptopMinimal }
  return { label: 'Browser', Icon: LaptopMinimal }
}

function buildConnectedAccounts(user, t) {
  const activeProvider = (user?.provider || '').toLowerCase()
  return ALL_PROVIDERS.map((key) => {
    const meta = PROVIDER_META[key]
    const connected = activeProvider === key
    return {
      id: key,
      provider: meta.label,
      Icon: meta.Icon,
      status: connected ? 'connected' : 'available',
      detail: connected
        ? t('account:security.providerSignedIn', { email: user.email })
        : null,
      lastUpdated: connected
        ? t('account:security.activeNow')
        : t('account:security.notConnected'),
    }
  })
}

function buildSecuritySignals(user, t) {
  const activeProvider = (user?.provider || '').toLowerCase()
  const meta = PROVIDER_META[activeProvider]
  const providerLabel = meta?.label ?? 'Email'
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    : null

  return [
    {
      title: t('account:security.signInMethodLabel'),
      status: t('account:security.signInMethodValue', { provider: providerLabel }),
      description: meta?.authNote ?? 'Email sign-in is active. A magic link is used to authenticate.',
    },
    {
      title: t('account:security.emailAddressLabel'),
      status: maskEmail(user?.email),
      description: t('account:security.emailAddressDesc'),
    },
    ...(memberSince
      ? [
          {
            title: t('account:security.memberSinceLabel'),
            status: memberSince,
            description: t('account:security.memberSinceDesc'),
          },
        ]
      : []),
  ]
}

export default function SecurityPage() {
  const { t } = useTranslation('account')
  const { user, signOut } = useAuthStore()

  const connectedAccounts = buildConnectedAccounts(user, t)
  const securitySignals = buildSecuritySignals(user, t)
  const { label: deviceLabel, Icon: DeviceIcon } = detectDevice()
  const activeProvider = (user?.provider || '').toLowerCase()
  const activeMeta = PROVIDER_META[activeProvider]

  return (
    <AccountShell
      title={t('account:security.title')}
      mobileTitle={t('account:security.mobileTitle')}
      description={t('account:security.desc')}
      actions={[
        { label: t('account:security.backToAccount'), href: '/account', secondary: true },
        { label: t('account:security.managePayments'), href: '/account/payments' },
      ]}
      accent="from-emerald-50 via-white to-sky-50"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Connected Accounts */}
        <SectionCard>
          <SectionHeading
            eyebrow={t('account:security.connectedEyebrow')}
            title={t('account:security.connectedTitle')}
            description={t('account:security.connectedDesc')}
          />

          <div className="mt-6 space-y-4">
            {connectedAccounts.map((account) => (
              <div
                key={account.id}
                className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-[#fcfcfb] p-5 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex min-w-0 items-start gap-4">
                  <div className={`flex-shrink-0 rounded-2xl p-3 ${
                    account.id === 'google' && account.status === 'connected' ? 'bg-[#f0f5ff] text-[#4285f4]' :
                    account.id === 'apple' && account.status === 'connected' ? 'bg-gray-900 text-white' :
                    'bg-gray-50 text-gray-400 shadow-sm'
                  }`}>
                    <account.Icon size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg font-semibold text-dark">{account.provider}</p>
                    {account.detail && (
                      <p className="break-all text-sm text-muted">{account.detail}</p>
                    )}
                    <p className={`text-sm text-muted ${account.detail ? 'mt-2' : ''}`}>{account.lastUpdated}</p>
                  </div>
                </div>

                <div className="flex w-full items-center justify-between gap-3 md:w-auto md:justify-start">
                  <StatusPill tone={account.status === 'connected' ? 'success' : 'slate'}>
                    {account.status === 'connected'
                      ? t('account:security.connected')
                      : t('account:security.available')}
                  </StatusPill>
                  {account.status === 'connected' ? (
                    <button
                      type="button"
                      onClick={signOut}
                      className="rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-dark transition-colors hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700"
                    >
                      {t('account:security.signOut')}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="cursor-not-allowed rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-muted"
                    >
                      {t('account:security.connect')}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Security Posture */}
        <SectionCard>
          <SectionHeading
            eyebrow={t('account:security.postureEyebrow')}
            title={t('account:security.postureTitle')}
            description={t('account:security.postureDesc')}
            action={<StatusPill tone="success">{securitySignals.length}/{securitySignals.length} verified</StatusPill>}
          />

          <div className="mt-6 space-y-4">
            {securitySignals.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-gray-200 bg-[#fcfcfb] p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-dark">{item.title}</p>
                    <p className="mt-1 text-sm font-medium text-dark">{item.status}</p>
                  </div>
                  <div className="rounded-full bg-emerald-50 p-2 text-emerald-700">
                    <CheckCircle2 size={16} />
                  </div>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted">{item.description}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Current Session */}
      <SectionCard>
        <SectionHeading
          eyebrow={t('account:security.sessionEyebrow')}
          title={t('account:security.sessionTitle')}
          description={t('account:security.sessionDesc')}
        />

        <div className="mt-6 grid gap-4 xl:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-[#fcfcfb] p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="rounded-2xl bg-white p-3 text-dark shadow-sm">
                <DeviceIcon size={20} />
              </div>
              <StatusPill tone="sky">{t('account:security.currentSession')}</StatusPill>
            </div>
            <p className="mt-5 text-lg font-semibold text-dark">{deviceLabel}</p>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              {t('account:security.activeNow')}
            </p>
            <p className="mt-4 text-sm font-medium text-dark">
              {t('account:security.signedInVia', { provider: activeMeta?.label ?? 'your account' })}
            </p>
          </div>

          {/* Placeholder for future sessions */}
          <div className="flex items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-5">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-50">
                <Clock3 size={18} className="text-muted" />
              </div>
              <p className="text-sm font-medium text-dark">{t('account:security.sessionHistory')}</p>
              <p className="mt-1 text-xs text-muted">{t('account:security.comingSoon')}</p>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Recovery Controls */}
      <SectionCard className="hidden md:block">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              {t('account:security.recoveryEyebrow')}
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-dark">
              {t('account:security.recoveryTitle')}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              {t('account:security.recoveryDesc', { provider: activeMeta?.label ?? 'sign-in' })}
            </p>
          </div>

          <div className="rounded-2xl bg-dark p-5 text-white">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/10 p-3">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                  {t('account:security.riskStatusLabel')}
                </p>
                <p className="mt-1 text-2xl font-semibold">{t('account:security.riskLow')}</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-white/80">
              {t('account:security.riskNote')}
            </p>
          </div>
        </div>
      </SectionCard>
    </AccountShell>
  )
}
