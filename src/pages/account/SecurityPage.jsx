import {
  Apple,
  CheckCircle2,
  Facebook,
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
import {
  connectedAccounts,
  securitySignals,
  trustedDevices,
} from '../../data/mockPortalData'

const providerIcons = {
  Apple,
  Facebook,
  Google: Globe2,
}

const deviceIcons = {
  'iPhone 15 Pro': Smartphone,
  'iPad Mini': Smartphone,
  'MacBook Air': LaptopMinimal,
}

export default function SecurityPage() {
  return (
    <AccountShell
      title="Sign-in and device security."
      mobileTitle="Security"
      description="This security screen is mapped to the auth and revoke concepts in the backend sheet, but remains mock-only for now. The UI is already structured around providers, trusted devices, and account status."
      actions={[
        { label: 'Back to account', href: '/account', secondary: true },
        { label: 'Manage payments', href: '/account/payments' },
      ]}
      accent="from-emerald-50 via-white to-sky-50"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard>
          <SectionHeading
            eyebrow="Connected Accounts"
            title="Provider-based sign-in"
            description="Apple, Facebook, and Google can all fit here later as real provider states."
          />

          <div className="mt-6 space-y-4">
            {connectedAccounts.map((account) => {
              const Icon = providerIcons[account.provider] || Globe2

              return (
                <div
                  key={account.id}
                  className="flex flex-col gap-4 rounded-[24px] border border-gray-200 bg-[#fcfcfb] p-5 md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex items-start gap-4">
                    <div className="rounded-2xl bg-white p-3 text-dark shadow-sm">
                      <Icon size={20} />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-dark">
                        {account.provider}
                      </p>
                      <p className="text-sm text-muted">{account.detail}</p>
                      <p className="mt-2 text-sm text-muted">
                        {account.lastUpdated}
                      </p>
                    </div>
                  </div>

                  <div className="flex w-full items-center justify-between gap-3 md:w-auto md:justify-start">
                    <StatusPill
                      tone={account.status === 'connected' ? 'success' : 'slate'}
                    >
                      {account.status === 'connected' ? 'Connected' : 'Available'}
                    </StatusPill>
                    <button
                      type="button"
                      className="rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-dark transition-colors hover:bg-gray-50"
                    >
                      {account.status === 'connected' ? 'Revoke' : 'Connect'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </SectionCard>

        <SectionCard>
          <SectionHeading
            eyebrow="Security Posture"
            title="Status that should always feel calm"
            description="Short, readable summaries make this page useful on mobile without turning it into an ops console."
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
                    <p className="mt-1 text-sm font-medium text-dark">
                      {item.status}
                    </p>
                  </div>
                  <div className="rounded-full bg-emerald-50 p-2 text-emerald-700">
                    <CheckCircle2 size={16} />
                  </div>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard>
        <SectionHeading
          eyebrow="Trusted Devices"
          title="Recent sessions"
          description="A future auth backend can simply swap in the real session list here."
        />

        <div className="mt-6 grid gap-4 xl:grid-cols-3">
          {trustedDevices.map((device) => {
            const Icon = deviceIcons[device.name] || LaptopMinimal

            return (
              <div
                key={device.id}
                className="rounded-[24px] border border-gray-200 bg-[#fcfcfb] p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="rounded-2xl bg-white p-3 text-dark shadow-sm">
                    <Icon size={20} />
                  </div>
                  <StatusPill tone="sky">{device.badge}</StatusPill>
                </div>
                <p className="mt-5 text-lg font-semibold text-dark">{device.name}</p>
                <p className="mt-1 text-sm text-muted">{device.location}</p>
                <p className="mt-4 text-sm font-medium text-dark">
                  {device.activity}
                </p>
                <button
                  type="button"
                  className="mt-5 inline-flex rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-dark transition-colors hover:bg-gray-50"
                >
                  Review device
                </button>
              </div>
            )
          })}
        </div>
      </SectionCard>

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
              Email sign-in, provider connections, and account verification can all
              be managed from this one screen without cluttering the rest of the
              account experience.
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
              No suspicious sign-ins, recent payment risk, or unresolved access
              alerts.
            </p>
          </div>
        </div>
      </SectionCard>
    </AccountShell>
  )
}
