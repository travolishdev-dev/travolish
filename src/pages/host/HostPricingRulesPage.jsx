import {
  HostShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/host/HostPortalUI'
import { HostPillButton } from '../../components/host/HostFormFields'
import { hostPricingRules } from '../../data/mockHostPortalData'

export default function HostPricingRulesPage() {
  return (
    <HostShell
      eyebrow="Pricing"
      title="Pricing rules"
      mobileTitle="Pricing"
      description="Simple rule list before API wiring."
      actions={[
        { label: 'Pricing AI', href: '/host/pricing-ai', secondary: true },
        { label: 'Promotions', href: '/host/promotions' },
      ]}
      mobileAction={{ label: 'New rule', href: '/host/pricing' }}
    >
      <SectionCard>
        <SectionHeading eyebrow="Rules" title="Active pricing logic" />

        <div className="mt-5 flex flex-wrap gap-3">
          <HostPillButton active>Weekend premium</HostPillButton>
          <HostPillButton>Last-minute fill</HostPillButton>
          <HostPillButton>Long-stay discount</HostPillButton>
        </div>

        <div className="mt-6 divide-y divide-gray-200 border-y border-gray-200">
          {hostPricingRules.map((rule) => (
            <div key={rule.id} className="py-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-lg font-semibold text-dark">{rule.title}</p>
                    <StatusPill tone={rule.status === 'Active' ? 'success' : 'warning'}>
                      {rule.status}
                    </StatusPill>
                  </div>
                  <p className="mt-2 text-sm text-muted">{rule.scope}</p>
                  <p className="mt-3 text-sm leading-6 text-dark">{rule.note}</p>
                </div>
                <div className="border-t border-gray-200 pt-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                    Effect
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-dark">
                    {rule.change}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </HostShell>
  )
}
