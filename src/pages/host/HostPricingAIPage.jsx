import { Link } from 'react-router-dom'
import {
  HostShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/host/HostPortalUI'
import { findHostListing, findHostRoom, hostPricingSuggestions } from '../../data/mockHostPortalData'

export default function HostPricingAIPage() {
  return (
    <HostShell
      eyebrow="Pricing AI"
      title="Pricing suggestions"
      mobileTitle="Pricing AI"
      description="Review suggested rate changes."
      actions={[
        { label: 'Pricing rules', href: '/host/pricing', secondary: true },
        { label: 'Availability', href: '/host/availability' },
      ]}
    >
      <SectionCard>
        <SectionHeading eyebrow="Suggestions" title="Recommended rate changes" />

        <div className="mt-6 divide-y divide-gray-200 border-y border-gray-200">
          {hostPricingSuggestions.map((suggestion) => {
            const listing = findHostListing(suggestion.listingId)
            const room = findHostRoom(suggestion.roomId)

            return (
              <div key={suggestion.id} className="py-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-semibold text-dark">
                        {listing?.property.title}
                      </p>
                      <StatusPill tone={suggestion.confidence === 'High' ? 'success' : 'sky'}>
                        {suggestion.confidence}
                      </StatusPill>
                    </div>
                    <p className="mt-2 text-sm text-muted">
                      {room?.name} · {suggestion.dateWindow}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {suggestion.rationale.map((item) => (
                        <StatusPill key={item} tone="sky">
                          {item}
                        </StatusPill>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                      Current to suggested
                    </p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight text-dark">
                      {suggestion.currentRate} → {suggestion.suggestedRate}
                    </p>
                    <div className="mt-5 grid gap-2 sm:flex sm:flex-wrap">
                      <Link
                        to="/host/pricing"
                        className="inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-dark transition-colors hover:bg-gray-50"
                      >
                        Reject
                      </Link>
                      <Link
                        to="/host/pricing"
                        className="inline-flex items-center justify-center rounded-2xl bg-dark px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
                      >
                        Accept
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </SectionCard>
    </HostShell>
  )
}
