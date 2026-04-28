import {
  HostShell,
  SectionCard,
  SectionHeading,
  StatusPill,
} from '../../components/host/HostPortalUI'
import {
  findHostListing,
  hostAvailabilityDays,
  hostAvailabilityRows,
} from '../../data/mockHostPortalData'

const statusStyles = {
  open: 'bg-white text-dark border-gray-200',
  occupied: 'bg-dark text-white border-dark',
  premium: 'bg-amber-50 text-amber-700 border-amber-200',
  blocked: 'bg-rose-50 text-rose-700 border-rose-200',
  turn: 'bg-sky-50 text-sky-700 border-sky-200',
  arrival: 'bg-emerald-50 text-emerald-700 border-emerald-200',
}

export default function HostAvailabilityPage() {
  return (
    <HostShell
      eyebrow="Availability"
      title="Availability"
      mobileTitle="Calendar"
      description="Simple 14-day calendar view."
      actions={[
        { label: 'Inventory', href: '/host/inventory', secondary: true },
        { label: 'Pricing rules', href: '/host/pricing' },
      ]}
      stats={[
        { label: 'Open nights', value: '34', note: 'Next 14 days' },
        { label: 'Blocked', value: '4', note: 'Owner or maintenance hold' },
        { label: 'Premium', value: '8', note: 'High-demand dates' },
        { label: 'Turns', value: '5', note: 'Expected room turns' },
      ]}
    >
      <SectionCard>
        <SectionHeading eyebrow="Calendar" title="14-day view" />

        <div className="mt-6 overflow-x-auto">
          <div className="min-w-[880px]">
            <div className="grid grid-cols-[220px_repeat(14,minmax(0,1fr))] gap-2">
              <div />
              {hostAvailabilityDays.map((day) => (
                <div key={day} className="text-center text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                  {day}
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-3">
              {hostAvailabilityRows.map((row) => {
                const listing = findHostListing(row.listingId)

                return (
                  <div key={row.listingId} className="grid grid-cols-[220px_repeat(14,minmax(0,1fr))] gap-2">
                    <div className="border-r border-gray-200 pr-4">
                      <p className="text-sm font-semibold text-dark">{listing?.property.title}</p>
                      <p className="mt-1 text-xs text-muted">{listing?.market}</p>
                    </div>
                    {row.pattern.map((status, index) => (
                      <div
                        key={`${row.listingId}-${hostAvailabilityDays[index]}`}
                        className={`flex min-h-[54px] items-center justify-center rounded-2xl border text-[11px] font-semibold uppercase tracking-[0.08em] ${statusStyles[status]}`}
                      >
                        {status}
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <StatusPill tone="success">arrival</StatusPill>
          <StatusPill tone="sky">turn</StatusPill>
          <StatusPill tone="warning">premium</StatusPill>
          <StatusPill tone="danger">blocked</StatusPill>
        </div>
      </SectionCard>
    </HostShell>
  )
}
