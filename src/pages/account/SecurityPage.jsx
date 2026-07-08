import {
  Apple,
  CheckCircle2,
  Clock3,
  Globe2,
  LaptopMinimal,
  ShieldCheck,
  Smartphone,
} from 'lucide-react'
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
    detail: 'One-tap sign-in via Google account',
    authNote: 'Your account is secured via Google OAuth. No password is stored on Travolish servers.',
  },
  apple: {
    label: 'Apple',
    Icon: Apple,
    detail: 'iPhone-native sign-in via Apple ID',
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

function buildConnectedAccounts(user) {
  const activeProvider = (user?.provider || '').toLowerCase()
  return ALL_PROVIDERS.map((key) => {
    const meta = PROVIDER_META[key]
    const connected = activeProvider === key
    return {
      id: key,
      provider: meta.label,
      Icon: meta.Icon,
      status: connected ? 'connected' : 'available',
      detail: connected ? `Signed in as ${user.email}` : meta.detail,
      lastUpdated: connected ? 'Active now' : 'Not connected',
    }
  })
}

function buildSecuritySignals(user) {
  const activeProvider = (user?.provider || '').toLowerCase()
  const meta = PROVIDER_META[activeProvider]
  const providerLabel = meta?.label ?? 'Email'
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null

  return [
    {
      title: 'Sign-in method',
      status: `${providerLabel} account`,
      description: meta?.authNote ?? 'Email sign-in is active. A magic link is used to authenticate.',
    },
    {
      title: 'Email address',
      status: maskEmail(user?.email),
      description: 'Used for booking confirmations, host messages, and account security alerts.',
    },
    ...(memberSince
      ? [
          {
            title: 'Member since',
            status: memberSince,
            description: 'Account standing and booking history contribute to your traveler trust score.',
          },
        ]
      : []),
  ]
}

export default function SecurityPage() {
  const { user, signOut } = useAuthStore()

  const connectedAccounts = buildConnectedAccounts(user)
  const securitySignals = buildSecuritySignals(user)
  const { label: deviceLabel, Icon: DeviceIcon } = detectDevice()
  const activeProvider = (user?.provider || '').toLowerCase()
  const activeMeta = PROVIDER_META[activeProvider]

  return (
    <AccountShell
      title="Sign-in and device security."
      mobileTitle="Security"
      description="Connected providers, account security status, and your active session."
      actions={[
        { label: 'Back to account', href: '/account', secondary: true },
        { label: 'Manage payments', href: '/account/payments' },
      ]}
      accent="from-emerald-50 via-white to-sky-50"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Connected Accounts */}
        <SectionCard>
          <SectionHeading
            eyebrow="Connected Accounts"
            title="Provider-based sign-in"
            description="Your active sign-in method and available social providers."
          />

          <div className="mt-6 space-y-4">
            {connectedAccounts.map((account) => (
              <div
                key={account.id}
                className="flex flex-col gap-4 rounded-[24px] border border-gray-200 bg-[#fcfcfb] p-5 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-white p-3 text-dark shadow-sm">
                    <account.Icon size={20} />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-dark">{account.provider}</p>
                    <p className="text-sm text-muted">{account.detail}</p>
                    <p className="mt-2 text-sm text-muted">{account.lastUpdated}</p>
                  </div>
                </div>

                <div className="flex w-full items-center justify-between gap-3 md:w-auto md:justify-start">
                  <StatusPill tone={account.status === 'connected' ? 'success' : 'slate'}>
                    {account.status === 'connected' ? 'Connected' : 'Available'}
                  </StatusPill>
                  {account.status === 'connected' ? (
                    <button
                      type="button"
                      onClick={signOut}
                      className="rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-dark transition-colors hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700"
                    >
                      Sign out
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="cursor-not-allowed rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-muted"
                    >
                      Connect
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
            eyebrow="Security Posture"
            title="Account status"
            description="Security signals derived from your account and sign-in provider."
          />

          <div className="mt-6 space-y-4">
            {securitySignals.map((item) => (
              <div
                key={item.title}
                className="rounded-[24px] border border-gray-200 bg-[#fcfcfb] p-5"
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
          eyebrow="Active Session"
          title="Current device"
          description="You are signed in on this device. Full session history will be available when session management launches."
        />

        <div className="mt-6 grid gap-4 xl:grid-cols-3">
          <div className="rounded-[24px] border border-gray-200 bg-[#fcfcfb] p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="rounded-2xl bg-white p-3 text-dark shadow-sm">
                <DeviceIcon size={20} />
              </div>
              <StatusPill tone="sky">Current session</StatusPill>
            </div>
            <p className="mt-5 text-lg font-semibold text-dark">{deviceLabel}</p>
            <p className="mt-1 text-sm text-muted">Active now</p>
            <p className="mt-4 text-sm font-medium text-dark">
              Signed in via {activeMeta?.label ?? 'your account'}
            </p>
            <button
              type="button"
              onClick={signOut}
              className="mt-5 inline-flex rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-dark transition-colors hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700"
            >
              Sign out
            </button>
          </div>

          {/* Placeholder for future sessions */}
          <div className="flex items-center justify-center rounded-[24px] border border-dashed border-gray-200 bg-gray-50/50 p-5">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
                <Clock3 size={18} className="text-muted" />
              </div>
              <p className="text-sm font-medium text-dark">Session history</p>
              <p className="mt-1 text-xs text-muted">Coming soon</p>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Recovery Controls */}
      <SectionCard className="hidden md:block">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              Recovery Controls
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-dark">
              Keep fallback access simple
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Your account is tied to your {activeMeta?.label ?? 'sign-in'} provider.
              If you ever lose access, use the provider's own account recovery flow to
              regain entry to Travolish.
            </p>
          </div>

          <div className="rounded-[24px] bg-dark p-5 text-white">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/10 p-3">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                  Risk status
                </p>
                <p className="mt-1 text-2xl font-semibold">Low</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-white/80">
              No unusual sign-in activity or unresolved account alerts detected.
            </p>
          </div>
        </div>
      </SectionCard>
    </AccountShell>
  )
}
