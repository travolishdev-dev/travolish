import { useEffect, useState } from 'react'
import {
  HostShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/host/HostPortalUI'
import { HostPillButton } from '../../components/host/HostFormFields'
import { hostPricingRules } from '../../data/mockHostPortalData'
import { getPricingRulesForHotel } from '../../services/pricingApi'

const HOTEL_ID = 1

function adaptRule(r) {
  let change = '—'
  if (r.pricingType === 'PERCENTAGE' && r.multiplier != null) {
    const pct = Math.round((r.multiplier - 1) * 100)
    change = pct >= 0 ? `+${pct}%` : `${pct}%`
  } else if (r.pricingType === 'DISCOUNT' && r.fixedDiscount != null) {
    change = `-$${r.fixedDiscount}`
  } else if (r.pricingType === 'FLAT' && r.basePrice != null) {
    change = `$${r.basePrice}`
  } else if (r.adjustedPrice != null && r.basePrice != null && r.basePrice !== 0) {
    const pct = Math.round(((r.adjustedPrice - r.basePrice) / r.basePrice) * 100)
    change = pct >= 0 ? `+${pct}%` : `${pct}%`
  }

  const scope = r.season
    ?? (r.startDate && r.endDate ? `${r.startDate} → ${r.endDate}` : null)
    ?? r.ruleType
    ?? '—'

  return {
    id: r.id,
    title: r.description ?? r.ruleType ?? 'Pricing rule',
    status: r.isActive !== false ? 'Active' : 'Inactive',
    scope,
    change,
    note: r.ruleType ?? '',
  }
}

export default function HostPricingRulesPage() {
  const [rules, setRules] = useState(hostPricingRules)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPricingRulesForHotel(HOTEL_ID)
      .then((data) => {
        const items = Array.isArray(data) ? data : (data?.content ?? [])
        if (items.length > 0) setRules(items.map(adaptRule))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const activeTypes = [...new Set(rules.filter(r => r.status === 'Active').map(r => r.note).filter(Boolean))]

  return (
    <HostShell
      eyebrow="Pricing"
      title="Pricing rules"
      mobileTitle="Pricing"
      description="Seasonal and dynamic pricing rules for your listings."
      actions={[
        { label: 'Pricing AI', href: '/host/pricing-ai', secondary: true },
        { label: 'Promotions', href: '/host/promotions' },
      ]}
      mobileAction={{ label: 'New rule', href: '/host/pricing' }}
      stats={[
        { label: 'Rules', value: String(rules.length), note: 'Total configured' },
        { label: 'Active', value: String(rules.filter(r => r.status === 'Active').length), note: 'Currently applied' },
      ]}
    >
      <SectionCard>
        <SectionHeading eyebrow="Rules" title="Active pricing logic" />

        {activeTypes.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-3">
            {activeTypes.map((t) => (
              <HostPillButton key={t} active>{t.replace(/_/g, ' ').toLowerCase()}</HostPillButton>
            ))}
          </div>
        )}

        {loading && (
          <div className="py-16 text-center text-sm text-muted">Loading rules…</div>
        )}

        {!loading && (
          <div className="mt-6 divide-y divide-gray-200 border-y border-gray-200">
            {rules.map((rule) => (
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
                    {rule.note && (
                      <p className="mt-3 text-sm leading-6 text-dark">{rule.note}</p>
                    )}
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
        )}
      </SectionCard>
    </HostShell>
  )
}
