import {
  HostShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/host/HostPortalUI'
import { hostPromotions } from '../../data/mockHostPortalData'

export default function HostPromotionsPage() {
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
    >
      <SectionCard>
        <SectionHeading eyebrow="Campaigns" title="Promotion roster" />

        <div className="mt-6 divide-y divide-gray-200 border-y border-gray-200">
          {hostPromotions.map((promotion) => (
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
      </SectionCard>
    </HostShell>
  )
}
