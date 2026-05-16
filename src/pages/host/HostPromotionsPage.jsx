import { useEffect, useState } from 'react'
import {
  HostShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/host/HostPortalUI'
import { hostPromotions } from '../../data/mockHostPortalData'
import { getHotelBoosts } from '../../services/boostApi'

const HOTEL_ID = 1

function adaptBoost(b) {
  const status =
    b.status === 'ACTIVE' ? 'Running'
    : b.status === 'SCHEDULED' || b.status === 'PENDING' ? 'Scheduled'
    : 'Paused'

  const parts = [b.boostTier, b.boostType].filter(Boolean)
  const title = parts.length > 0 ? parts.join(' ') : 'Listing boost'

  const spend = b.cost != null ? `$${Number(b.cost).toFixed(0)}` : '—'

  const result =
    b.bookingGain != null && b.bookingGain > 0
      ? `+${b.bookingGain} bookings`
      : b.impressionGain != null && b.impressionGain > 0
        ? `+${b.impressionGain} impressions`
        : b.clickGain != null && b.clickGain > 0
          ? `+${b.clickGain} clicks`
          : '—'

  const note = [
    b.durationDays != null ? `${b.durationDays}d boost` : null,
    b.visibilityMultiplier != null ? `${b.visibilityMultiplier}× visibility` : null,
  ].filter(Boolean).join(' · ') || b.boostType

  return { id: b.id, title, status, spend, result, note }
}

export default function HostPromotionsPage() {
  const [promotions, setPromotions] = useState(hostPromotions)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getHotelBoosts(HOTEL_ID)
      .then((items) => {
        if (items.length > 0) setPromotions(items.map(adaptBoost))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <HostShell
      eyebrow="Promotions"
      title="Promotions"
      mobileTitle="Promotions"
      description="Listing boosts and scheduled campaigns."
      actions={[
        { label: 'Pricing rules', href: '/host/pricing', secondary: true },
        { label: 'Pricing AI', href: '/host/pricing-ai' },
      ]}
      stats={[
        { label: 'Boosts', value: String(promotions.length), note: 'Total campaigns' },
        { label: 'Running', value: String(promotions.filter(p => p.status === 'Running').length), note: 'Currently live' },
      ]}
    >
      <SectionCard>
        <SectionHeading eyebrow="Campaigns" title="Promotion roster" />

        {loading && (
          <div className="py-16 text-center text-sm text-muted">Loading promotions…</div>
        )}

        {!loading && (
          <div className="mt-6 divide-y divide-gray-200 border-y border-gray-200">
            {promotions.map((promotion) => (
              <div key={promotion.id} className="py-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-semibold text-dark">{promotion.title}</p>
                      <StatusPill
                        tone={
                          promotion.status === 'Running'
                            ? 'success'
                            : promotion.status === 'Scheduled'
                              ? 'sky'
                              : 'warning'
                        }
                      >
                        {promotion.status}
                      </StatusPill>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-dark">{promotion.note}</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                        Spend
                      </p>
                      <p className="mt-1 text-lg font-semibold text-dark">{promotion.spend}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                        Result
                      </p>
                      <p className="mt-1 text-lg font-semibold text-dark">{promotion.result}</p>
                    </div>
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
